// This creates credentials for users to connect to Postgres DB.
//
// The credentials rotate automatically, which triggers a lambda that updates the DB URL string with
// which users connect to the DB.

import { Construct } from 'constructs';
import { SecretValue } from 'aws-cdk-lib';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Duration } from 'aws-cdk-lib';
import { ResourceInitializer } from '../../../resource-initializer';

interface DatabaseUserCredentialsProps {
  cluster: rds.ServerlessCluster;
  username: string;
  databaseName: string;
}

export class DatabaseUserCredentials extends Construct {
  // The auto-rotated postgres credentials for the user.
  readonly credentialsSecret: secretsmanager.ISecret;
  // The Postgres connection string with encoded credentials.
  readonly databaseUrlSecret: secretsmanager.ISecret;

  constructor(scope: Construct, id: string, props: DatabaseUserCredentialsProps) {
    super(scope, id);

    const { cluster, username, databaseName } = props;

    // Create the credentials.
    this.credentialsSecret = new rds.DatabaseSecret(this, 'Credentials', {
      username: username,
      masterSecret: cluster.secret,
    }).attach(cluster);

    cluster.addRotationMultiUser(`${id}Rotation`, {
      secret: this.credentialsSecret,
      automaticallyAfter: Duration.days(30),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
      },
    });

    // Create the connection string secret.
    this.databaseUrlSecret = new secretsmanager.Secret(this, 'databaseUrl', {
      description: `DB connection URL string, created from ${this.credentialsSecret.secretArn}`,
      // Initialize with a temporary string.
      secretStringValue: new SecretValue('replace-with-connection-string'),
    });

    // Set up the lambda that generates the connection string using the credentials.
    const updateSecretFunction = new lambda.NodejsFunction(this, 'handler', {
      description: `Updates the connection URL string for "${username}" @ "${databaseName}" in the "${id}" secret.`,
      environment: {
        SOURCE_SECRET_ARN: this.credentialsSecret.secretArn,
        DESTINATION_SECRET_ARN: this.databaseUrlSecret.secretArn,
        DATABASE_NAME: databaseName,
      },
    });
    this.credentialsSecret.grantRead(updateSecretFunction);
    this.databaseUrlSecret.grantWrite(updateSecretFunction);

    // Run the lambda now.
    const init = new ResourceInitializer(this, 'InitSecret', {
      initFunction: updateSecretFunction,
    });
    init.node.addDependency(this.credentialsSecret);

    // Run the lambda whenever the secret changes.
    cloudtrail.Trail.onEvent(this, 'UpdateSecretEvent', {
      target: new targets.LambdaFunction(updateSecretFunction),
      eventPattern: {
        source: ['aws.secretsmanager'],
        detailType: ['AWS API Call via CloudTrail'],
        detail: {
          eventSource: ['secretsmanager.amazonaws.com'],
          eventName: ['UpdateSecretVersionStage'],
          requestParameters: {
            secretId: [this.credentialsSecret.secretArn],
          },
        },
      },
    });
  }
}
