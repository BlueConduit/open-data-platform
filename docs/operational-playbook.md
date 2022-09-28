# Operational Playbook

## Common Tasks

### Testing a code change

There are several test suites that run before a change is deployed to production. During
development, run these tests periodically to make sure the change does not break anything:

1. Run the local client test suite:

   ```sh
   # In the client directory.
   npm run test
   ```

1. Run the local cdk test suite:

   ```sh
   # In the CDK directory.
   npm run test
   ```

1. Run the canary test suite in AWS against your sandbox environment:

   1. Deploy your changes by following the [Installation guide](../getting-started.md).
   1. Update and start a canary instance:

      ```sh
      # In the CDK directory.
      npm run monitoring-deploy
      ```

   1. Open the
      [canary dashboard](https://us-east-2.console.aws.amazon.com/cloudwatch/home?region=us-east-2#synthetics:canary/list).
      Yours will have a name like `monitoringsynth` and will take a a minute to execute.

(It may also a good idea to follow
[test-driven development](https://en.wikipedia.org/wiki/Test-driven_development#Test-driven_development_cycle)
and add a test for your change before implementing it)

### Deploying a code change

<!-- TODO: Add a link to a doc describing the release process once written. -->

Code changes are deployed to the dev and prod environments automatically after a PR is merged into
the GitHub repository. No further manual action is required and the deployment process can be
followed on
the[pipeline dashboard](https://us-east-2.console.aws.amazon.com/codesuite/codepipeline/pipelines/OpenDataPlatform/view?region=us-east-2).

### Rolling back a code change

The best response to a problem in dev/prod is usually to roll back. If you know which PR caused the
problem, revert the PR in the GitHub interface, getting approvals as necessary. The rollback will
deploy automatically as any other change.

If you don't know which PR caused the problem, try the following:

1. Checkout a known-good past commit. You may need to use `git log` to find this.
1. Create a new commit to "undo" the problematic change using `git revert`.
1. Create and merge a PR. If this does not fix the problem, you may need to revert to an older
   commit.

### Querying the DB

The easiest way to run queries in a deployed DB is via the query editor:

1. Log into the AWS account for the environment.
1. Open
   [the secret](https://us-east-2.console.aws.amazon.com/secretsmanager/listsecrets?region=us-east-2&search=all%3DMainCluster%26all%3DOpenDataPlatform)
   for the environment's DB cluster and copy its ARN.
1. Open the
   [RDS Query Editor](https://us-east-2.console.aws.amazon.com/rds/home?region=us-east-2#query-editor:)
   and fill out the connection form:
   1. **Database instance or cluster** - The environment's cluster name.
   1. **Database username** - Pick `Connect with a Secrets Manager ARN`.
   1. **Secrets manager ARN** - Paste the ARN from above.
   1. **Enter the name of the database** - Enter `postgres`.

## Common Issues

Many issues will alert via the `#leadout-${ENV}-notifications` Slack channels, defined in the
[pipeline](../cdk/src/pipeline/pipeline-stack.ts) stage for each env.

### Dev / Prod hasn't updated after merging a PR

Dev should update within ~30 minutes of merging a PR and Prod should update within a few days. You
can quickly see when an environment is updated by:

1. Open LeadOut in a browser and view the dev console. It should show `Client built from...` and a
   link to a git commit.

If this is more recent than your PR, then the code is live.

Else, one of these environments hasn't updated as expected. Try the following:

1. Log into the AWS account for the environment (`Deployments` for BC).
1. Open the
   [pipeline dashboard](https://us-east-2.console.aws.amazon.com/codesuite/codepipeline/pipelines/OpenDataPlatform/view?region=us-east-2).

1. Find the stage that has failed.

   1. If no stage has failed, look in the `History` tab to find the execution related to your PR.
   1. If it's in progress, then you may need to wait longer.

1. View the logs for the failed stage.
   1. If `Build` failed, you can view these in CodeBuild. a. If
   1. `Deploy` stage/step failed, then you'll have to log into the relevant account and open the
      [CloudFormation console](https://us-east-2.console.aws.amazon.com/cloudformation/home?region=us-east-2#/stacks?filteringStatus=active&filteringText=opendataplatform&viewNested=true&hideStacks=false&stackId=).
      The `Events` tab will have details.

The most likely solution is to rollback the PR associated with this pipeline execution.

### `RootSchemaErrorAlarm`

The [lambda](../cdk/src/open-data-platform/data-plane/schema/schema.ts) that updates the DB schema
has failed. To see what went wrong:

1. Log into the AWS account for the environment.
1. Open the
   [`RootSchemahandler`](https://us-east-2.console.aws.amazon.com/cloudwatch/home?region=us-east-2#logsV2:log-groups$3FlogGroupNameFilter$3Drootschemahandler)
   log group for the environment.
1. Open the most recent log stream and search for `ERROR`.

This will show which query failed during the execution of
[`schema.sql`](../cdk/src/open-data-platform/data-plane/schema/schema.sql). The most likely solution
is to roll back a recent PR that touched this file.

### `SingleCanaryFailure`

The [canary](..cdk/src/monitoring/synthetics.ts) that runs periodically failed during one of its
executions. To see what went wrong:

1. Log into the AWS account for the environment.
1. Open the
   [dashboard](https://us-east-2.console.aws.amazon.com/cloudwatch/home?region=us-east-2#synthetics:canary/list)
   for the canary.
1. Identify which test failed in the most recent failed execution from its logs and screenshots.

The most likely solution is to roll back a recent PR that affected the part of the UI that failed
the test.
