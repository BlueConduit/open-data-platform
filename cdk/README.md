# CDK deployment configurations for the Open Data Platform

The `cdk.json` stores all info on how to execute the app.

## Useful commands

* `npm run test`     perform the jest unit tests
* `cdk deploy --all` deploy this stack to your default AWS account/region
* `cdk diff`         compare deployed stack with current state
* `cdk destroy`      tear down the existing stack

## CDK Structure

The rough structure of the project is:

```text
./src
├── cdk.ts -- main CDK start point.
├── util.ts -- common types, constants, functions.
└── open-data-platform
    ├── root-stack.ts -- Stack definition for the root of the app. This refers to the below stacks.
    ├── data-plane-stack.ts -- Stack definition for the data plane.
    └── ...
```

## User Guide

How to interact with each component.

### Data Plane

The data plane uses Aurora Serverless.

### Query the DB

To run queries on a deployed DB:

1. Open [Secrets Manager](https://us-east-2.console.aws.amazon.com/secretsmanager/home?region=us-east-2#!/listSecrets/) in the AWS Management Console.
1. Search and open your secret, which will have your name and `Cluster` in it. Copy `Secret ARN`.
1. Open the [RDS Query Editor](https://us-east-2.console.aws.amazon.com/rds/home?region=us-east-2#query-editor:).
1. Select your DB cluster. It is probably prefixed with your name.
1. Select `Connect with a Secrets Manager ARN` for the `Databse username` and paste the previously copied value.
1. Enter the datbase you'd like to open. By default, it has a `postgres` DB.
