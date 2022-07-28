import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export interface SchemaProps {
  cluster: rds.ServerlessCluster;
  vpc: ec2.IVpc;
  db: string;
  credentialsSecret: secretsmanager.ISecret;
}
