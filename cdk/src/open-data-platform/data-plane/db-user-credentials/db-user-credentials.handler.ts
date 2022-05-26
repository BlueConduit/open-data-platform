import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const SOURCE_SECRET_ARN = process.env.SOURCE_SECRET_ARN ?? '';
const DESTINATION_SECRET_ARN = process.env.DESTINATION_SECRET_ARN ?? '';
const DATABASE_NAME = process.env.DATABASE_NAME;

const secretsmanager = new SecretsManager({});

export async function handler(event: any) {
  console.log(`Trigger Event: ${JSON.stringify(event, null, 2)}`);

  try {
    console.log('Fetching db credentials...');
    const source = await secretsmanager.getSecretValue({ SecretId: SOURCE_SECRET_ARN });
    const { host, port, username, password } = JSON.parse(source.SecretString!);

    const connectionString = `postgresql://${username}:${password}@${host}:${port}/${DATABASE_NAME}?sslmode=disable`;

    console.log('Updating secret...');
    const result = await secretsmanager.putSecretValue({
      SecretId: DESTINATION_SECRET_ARN,
      SecretString: connectionString,
    });
    console.log(`Update response: ${JSON.stringify(result, null, 2)}`);

    return {
      status: 'OK',
      results: result,
    };
  } catch (error: any) {
    return {
      status: 'ERROR',
      error,
      message: error.message,
    };
  }
}
