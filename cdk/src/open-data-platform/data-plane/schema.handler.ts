// Defines the handler that is executed for the schema lambda.

import createConnectionPool, { ConnectionPool, ConnectionPoolConfig, sql } from '@databases/pg';
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const CREDENTIALS_SECRET = process.env.CREDENTIALS_SECRET ?? '';
const DATABASE_NAME = process.env.DATABASE_NAME ?? '';
const secretsmanager = new SecretsManager({});

// Main handler for the lambda.

export async function handler(event: { userCredentials?: string[] }) {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const credentialSecrets = event.userCredentials ?? [];

  console.log('Fetching db credentials...');
  const { host, port, username, password } = await getCredentials(CREDENTIALS_SECRET);

  const config: ConnectionPoolConfig = {
    host: host,
    port: port,
    user: username,
    password: password,
  };

  console.log('Connecting to default database...');
  const defaultDb = database(config);

  try {
    await createDatabaseIfNotExists(DATABASE_NAME, defaultDb);
    await Promise.all(
      credentialSecrets.map(async (arn) => await createUserIfNotExists(arn, defaultDb)),
    );
  } finally {
    await defaultDb.dispose();
    console.log('Disconnected from default database');
  }

  console.log(`Connecting to ${DATABASE_NAME}...`);
  const db = database({
    ...config,
    database: DATABASE_NAME,
  });

  try {
    await revokeDefaultPublicPermissions(DATABASE_NAME, db);
    await runSchemaFile('schema.sql', db);
  } finally {
    await db.dispose();
    console.log(`Disconnected from ${DATABASE_NAME}`);
  }
}

// Helper functions.

async function getCredentials(secretArn: string) {
  const data = await secretsmanager.getSecretValue({ SecretId: secretArn });
  return JSON.parse(data.SecretString!);
}

async function createDatabaseIfNotExists(dbName: string, db: ConnectionPool) {
  console.log(`Creating ${dbName} if it doesn't exist...`);
  const exists = await dbExists(dbName, db);
  if (!exists) {
    await db.query(sql`CREATE DATABASE ${sql.__dangerous__rawValue(dbName)};`);
  }
}

async function dbExists(dbName: string, db: ConnectionPool) {
  const result = await db.query(sql`
    SELECT count(*) FROM pg_database WHERE datname='${sql.__dangerous__rawValue(dbName)}';
  `);
  return result[0].count == 1;
}

async function revokeDefaultPublicPermissions(dbName: string, db: ConnectionPool) {
  await db.query(sql`REVOKE ALL ON DATABASE ${sql.__dangerous__rawValue(dbName)} FROM PUBLIC`);
  await db.query(sql`REVOKE ALL ON SCHEMA public FROM PUBLIC`);
}

async function createUserIfNotExists(secretArn: string, db: ConnectionPool) {
  const { username, password } = await getCredentials(secretArn);

  console.log(`Creating user "${username}" if it doesn't exist...`);
  const exists = await userExists(username, db);
  if (!exists) {
    await db.query(
      sql`CREATE USER ${sql.__dangerous__rawValue(
        username,
      )} WITH PASSWORD '${sql.__dangerous__rawValue(password)}'`,
    );
  }
}

async function userExists(username: string, db: ConnectionPool) {
  const result = await db.query(sql`
    SELECT count(*) FROM pg_user WHERE usename='${sql.__dangerous__rawValue(username)}';
  `);
  return result[0].count == 1;
}

async function runSchemaFile(file: string, db: ConnectionPool) {
  console.log(`Running ${file}...`);
  return await db.query(sql.file(file));
}

function database(config: ConnectionPoolConfig): ConnectionPool {
  let connectionsCount = 0;
  return createConnectionPool({
    ...config,
    // Log actions and results.
    onError: (err: Error) => {
      console.log(`${new Date().toISOString()} ERROR - ${err.message}`);
    },
    onConnectionOpened: () => {
      console.log(`Opened connection. Active connections = ${++connectionsCount}`);
    },
    onConnectionClosed: () => {
      console.log(`Closed connection. Active connections = ${--connectionsCount}`);
    },
    onQueryStart: (_query: any, { text, values }) => {
      console.log(`${new Date().toISOString()} START QUERY ${text} - ${JSON.stringify(values)}`);
    },
    onQueryResults: (_query: any, { text }, results) => {
      console.log(`${new Date().toISOString()} END QUERY   ${text} - ${results.length} results`);
    },
    onQueryError: (_query: any, { text }, err) => {
      console.log(`${new Date().toISOString()} ERROR QUERY ${text} - ${err.message}`);
    },
  });
}
