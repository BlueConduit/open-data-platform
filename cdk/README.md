# CDK deployment configurations for the Open Data Platform

The `cdk.json` stores all info on how to execute the app.

## Useful commands

- `npm run test` perform the jest unit tests. Append `-- --silent=false` to show logged lines.
- `cdk deploy --all` deploy this stack to your default AWS account/region.
- `cdk diff` compare deployed stack with current state.
- `cdk destroy` tear down the existing stack.

## CDK Structure

The rough structure of the project is:

```text
./src
├── cdk.ts -- main CDK start point.
├── util.ts -- common types, constants, functions.
└── open-data-platform
    ├── root-stack.ts -- Stack definition for the root of the app. This refers to the below stacks.
    ├── data-plane
    │   ├──data-plane-stack.ts -- Stack definition for the data plane.
    │   └── ...
    └── ...
```

## User Guide

How to interact with each component.

### Data Plane

The data plane uses Aurora Serverless.

#### Query the DB

To run queries on a deployed DB:

1. Open
   [Secrets Manager](https://us-east-2.console.aws.amazon.com/secretsmanager/home?region=us-east-2#!/listSecrets/)
   in the AWS Management Console.
1. Search and open your secret, which will have your name and `Cluster` in it. Copy `Secret ARN`.
1. Open the
   [RDS Query Editor](https://us-east-2.console.aws.amazon.com/rds/home?region=us-east-2#query-editor:)
   .
1. Select your DB cluster. It is probably prefixed with your name.
1. Select `Connect with a Secrets Manager ARN` for the `Database username` and paste the previously
   copied value.
1. Enter the datbase you'd like to open. By default, it has a `postgres` DB.

#### Update the DB Schema

The DB schema is also updated via the CDK so that all environments use the same schema. To make
changes to this, edit the `schema.sql` file in the data-plane directory.

WARNING: Removing columns or changing data types may cause loss of data during deployment.

### Application Frontend

The frontend-stack consists of an s3 bucket which hosts the minified client app files and a
CloudFront Distribution which makes that app available at a URL. For now this URL will be generated
by AWS and can be found in the AWS CloudFront console
[here](https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=us-east-2#/distributions)
.

In the future we will configure the distribution to have alternate URLs using the CloudFront
Distribution domainNames param [here](src/open-data-platform/frontend/frontend-stack.ts#L30).

#### Routing to Application Backends

The CloudFront distribution handles routing to backends (e.g. the tile server hosted in ECS) based
on a URL prefix (e.g. `/tiles/v1`). A
[CloudFront Function](https://github.com/aws-samples/amazon-cloudfront-functions) rewrites the
request URL to remove the prefix before sending the request to the backend.

#### Client

To deploy the client, run `npm run build` in the client directory to compile the app to the
client/dist folder. Then, deploy the CDK to push these new files to the s3 bucket.

You can view the bucket in the AWS Console (Amazon S3 > Buckets). The bucket name will contain your
ID and the `vueassets` string, e.g.:

`kailajeter-opendataplatformfron-vueassetsa9cc1b8b-d6l9oiru7y2z`

Find the domain at which your bucket is available in the AWS Console in CloudFront > Distributions
by finding the domain which has your bucket as origin domain.
