# Release Process

## Environments

There are three sets of LeadOut environments:

1. **Sandbox** - Each developer has their own sandbox environment, which they have full ownership
   over and [can update at will](./getting-started.md#installation).
1. **Dev** - There is one development environment, whose purpose is for the LeadOut team and tests
   to see live code changes. This environment is updated in the releae pipeline, below.
1. **Prod** - There is one Production environment, whose purpose is for users to use the product.
   This environment is updated in the releae pipeline, below.

Additionally, there is an auxiliary environment, which doesn't run the LeadOut application:

1. **Deployment** - This environment runs the release pipeline.

## Pipeline

The pipeline is
[triggered](https://github.com/BlueConduit/open-data-platform/blob/62279ea24e34e260222dcb7a965283832aae6b28/cdk/src/pipeline/pipeline-stack.ts#L24-L26)
whenever code changes in the source repository, defined via a
[CodeStar Connection](https://github.com/BlueConduit/open-data-platform/blob/62279ea24e34e260222dcb7a965283832aae6b28/cdk/src/pipeline/pipeline-stack.ts#L12-L13).
Once triggered:

1. Codebuild
   [builds](https://github.com/BlueConduit/open-data-platform/blob/62279ea24e34e260222dcb7a965283832aae6b28/cdk/src/pipeline/pipeline-stack.ts#L28-L39)
   the client and CDK code.
1. The deployments env updates itself.
1. The dev environment updates.
1. The pipeline waits 1 hour. During this time, devs can stop the pipeline if they see any problems
   in dev.
1. The prod environment updates.

## Next Steps / TODOs

These are a few things not-yet-implemented, largely from the
[prod design doc](https://docs.google.com/document/d/1zZxCoXx5JzLXTOGVdvC4s8H-r82DFjfmNU-dmFPAQVI/preview).

### Stop the prod release on alarm

If any dev alarms are firing, that is a signal there is a problem with the dev release and it should
not reach prod. Currently, devs have to manually stop the release to prevent it from updating prod.

This may be done by adding a CodeBuild step to the pipeline between dev and prod, which executes a
command that looks for any alarms in dev.
[We tried this](https://github.com/BlueConduit/open-data-platform/pull/195) but ran into
(not-insurmountable) timeout and permissions issues.

### Automatically roll back on failed release

When a release fails, it may leave the application in a partially-updated state. If the pipeline
fails for any reason, it should re-deploy to the last-known-good state.

This may be done by splitting the (frequently-changing) application deployment out from the
(relatively-static) infrastructure deployment:

1. Infrastructure, such as CloudFront, is deployed via the pipeline, as-is. CodePipeline does not
   natively support (automated) rollbacks, so rollbacks would have to be
   [done manually](./operational-playbook.md#rolling-back-a-code-change). Since this changes
   infrequently, this is acceptable.
1. Application code, such as the API, is deployed via CodeDeploy with a
   [canary step](https://www.youtube.com/watch?v=DUIdbs_8AZA). CodeDeploy supports automated
   rollbacks, but can only deploy to lambdas, ECS, or EC2.

### Restart the tile server on release

The tile server does not automatically pick up schema changes and requires a human to restart the
jobs. The release pipeline should restart the tile server jobs so that it can use schema changes on
startup.

This may be done by adding a
[CodeDeploy step](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_codedeploy.EcsApplication.html)
that updates the tile server in ECS.
