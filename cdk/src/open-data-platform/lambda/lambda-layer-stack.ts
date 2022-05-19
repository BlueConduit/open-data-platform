import { Construct } from "constructs";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Duration } from "aws-cdk-lib";

interface SchemaProps {
  cluster: rds.ServerlessCluster,
  vpc: ec2.IVpc,
  db: string,
  credentialsSecret: secretsmanager.ISecret,
}

export class LambdaLayerStack extends Construct {

  constructor(scope: Construct, id: string, props: SchemaProps) {
    super(scope, id)

    const { cluster, vpc, db, credentialsSecret } = props

    const writeDemographicDataFunction = new lambda.NodejsFunction(this, 'write-demographic-data-handler', {
      entry: `${path.resolve(__dirname)}/write-demographic-data-handler.ts`,
      handler: 'handler',
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT
      },
      environment: {
        CREDENTIALS_SECRET: credentialsSecret.secretArn,
        DATABASE_NAME: db
      },
      timeout: Duration.minutes(5),
      bundling: {
        externalModules: ['aws-sdk'],
        nodeModules: ['csv-parser', 'fs'],
      },
    });

    credentialsSecret.grantRead(writeDemographicDataFunction)

    cluster.connections.allowFrom(
        writeDemographicDataFunction,
        ec2.Port.tcp(cluster.clusterEndpoint.port)
    )

    const s3GetObjectPolicy = new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: ['arn:aws:s3:::*'],
    });

    writeDemographicDataFunction.role?.attachInlinePolicy(
        new iam.Policy(this, 'get-buckets-policy', {
          statements: [s3GetObjectPolicy],
        }),
    );

    if (writeDemographicDataFunction.role?.roleArn != undefined) {
      let role = iam.Role.fromRoleArn(scope, id + '-role', writeDemographicDataFunction.role.roleArn);
      cluster.grantDataApiAccess(role);

      let bucket = s3.Bucket.fromBucketArn(scope, id + '-bucket', 'arn:aws:s3:::opendataplatformapistaticdata');
      bucket.addToResourcePolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:GetObject'],
        resources: [bucket.bucketArn],
        principals: [role]
      }));
    }
  }
}