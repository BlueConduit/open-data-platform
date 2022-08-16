import { Duration } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as notification from 'aws-cdk-lib/aws-s3-notifications';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';
import { dataImportLambdaFactory } from './utils/lambda-function-factory';
import { SchemaProps } from '../schema/schema-props';

/**
 * Files for data import functions.
 */
enum DataImportLambda {
  counties = 'write-county-data',
  countyDemographics = 'write-aggregate-county-demographic-data',
  demographics = 'write-demographic-data',
  parcels = 'write-parcels-data',
  states = 'write-state-data',
  stateDemographics = 'write-aggregate-state-demographic-data',
  waterSystems = 'write-water-systems-data',
  violations = 'write-violations-data',
  zipCodeDemographics = 'write-aggregate-zip-demographic-data',
  zipCodes = 'write-zipcode-data',
}

const fileNameToLambdaFunction = new Map<string, string>([
  // TODO: Update to use prefix demographics/
  [DataImportLambda.demographics, 'block_acs_data_0.geojson'],
  [DataImportLambda.waterSystems, 'pwsid_lead_connections_even_smaller.geojson'],
  [DataImportLambda.violations, 'violations_by_water_system.geojson'],
  // TODO: Update to use prefix parcels/
  [DataImportLambda.parcels, 'toledo_parcel_preds.geojson'],
  [DataImportLambda.counties, 'cb_2021_us_county_500k.geojson'],
  [DataImportLambda.zipCodes, 'cb_2020_us_zcta520_500k.geojson'],
  [DataImportLambda.states, 'cb_2021_us_state_500k.geojson'],
  [DataImportLambda.zipCodeDemographics, 'zipcode_demographics.geojson'],
  [DataImportLambda.countyDemographics, 'county_demographics.geojson'],
  [DataImportLambda.stateDemographics, 'state_demographics.geojson'],
]);

export class DataImportStack extends Construct {
  constructor(scope: Construct, id: string, props: SchemaProps) {
    super(scope, id);

    const { cluster, vpc, db, credentialsSecret } = props;

    const writeViolationsDataFunction = new lambda.NodejsFunction(
      this,
      DataImportLambda.violations,
      {
        entry: `${path.resolve(__dirname)}/write-violations-data.handler.ts`,
        handler: 'handler',
        vpc: vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_NAT },
        environment: {
          CREDENTIALS_SECRET: credentialsSecret.secretArn,
          DATABASE_NAME: db,
        },
        memorySize: 512,
        timeout: Duration.minutes(15),
        bundling: {
          externalModules: ['aws-sdk'],
          nodeModules: ['stream-json', 'stream-chain', 'pg', 'pg-format', 'moment'],
        },
      },
    );

    const s3BucketWithDataFiles = new s3.Bucket(this, 'open_data_platform_static_files');

    // Allow reads to all S3 buckets in account.
    const s3GetObjectPolicy = new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: ['arn:aws:s3:::*'],
    });

    const getS3BucketsPolicy = new iam.Policy(this, 'get-buckets-policy', {
      statements: [s3GetObjectPolicy],
    });

    const lambdaFunctions: lambda.NodejsFunction[] = [
      dataImportLambdaFactory(this, props, DataImportLambda.demographics),
      dataImportLambdaFactory(this, props, DataImportLambda.waterSystems),
      writeViolationsDataFunction,
      dataImportLambdaFactory(this, props, DataImportLambda.parcels),
      dataImportLambdaFactory(this, props, DataImportLambda.counties),
      dataImportLambdaFactory(this, props, DataImportLambda.zipCodes),
      dataImportLambdaFactory(this, props, DataImportLambda.states),
      dataImportLambdaFactory(this, props, DataImportLambda.zipCodeDemographics),
      dataImportLambdaFactory(this, props, DataImportLambda.countyDemographics),
      dataImportLambdaFactory(this, props, DataImportLambda.stateDemographics),
    ];

    for (let f of lambdaFunctions) {
      credentialsSecret.grantRead(f);
      cluster.connections.allowFrom(f, ec2.Port.tcp(cluster.clusterEndpoint.port));

      f.role?.attachInlinePolicy(getS3BucketsPolicy);

      if (f.role?.roleArn != undefined) {
        let role = iam.Role.fromRoleArn(scope, id + '-' + f, f.role.roleArn);
        cluster.grantDataApiAccess(role);
      }

      // Trigger all the data import lambdas when files change.
      const destination = new notification.LambdaDestination(f);
      const idWithoutHandler = f.node.id.replace('-handler', '').trim();
      const prefix = fileNameToLambdaFunction.get(idWithoutHandler);
      s3BucketWithDataFiles.addEventNotification(s3.EventType.OBJECT_CREATED, destination, {
        prefix: prefix,
      });
    }
  }
}
