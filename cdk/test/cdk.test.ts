import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DataPlaneStack } from '../src/open-data-platform/data-plane/data-plane-stack';
import { NetworkStack } from '../src/open-data-platform/network/network-stack';
import { EnvType, stackName, StackId } from '../src/util';
import { FrontendStack } from '../src/open-data-platform/frontend/frontend-stack';
import { AppPlaneStack } from '../src/open-data-platform/app-plane/app-plane-stack';

// Inspired by https://github.com/aws/aws-cdk/blob/master/packages/%40aws-cdk/aws-iam/test/policy.test.ts
describe('Full stack', () => {
  const envType = EnvType.UnitTest;
  let app: App;
  let networkStack: NetworkStack;
  let dataPlaneStack: DataPlaneStack;
  let frontendStack: FrontendStack;
  let appPlaneStack: AppPlaneStack;

  beforeEach(() => {
    app = new App();
    // Set up stacks in dependency order. This has to be done before any `Template.fronStack` calls,
    // due to https://github.com/aws/aws-cdk/issues/18847#issuecomment-1121980507
    networkStack = new NetworkStack(app, stackName(StackId.Network, envType), { envType });
    dataPlaneStack = new DataPlaneStack(app, stackName(StackId.DataPlane, envType), {
      envType,
      vpc: networkStack.vpc,
    });
    appPlaneStack = new AppPlaneStack(app, stackName(StackId.AppPlane, envType), {
      envType,
      networkStack,
      dataPlaneStack,
    });
    frontendStack = new FrontendStack(app, stackName(StackId.Frontend, envType), {
      envType,
      appPlaneStack,
      networkStack,
    });
  });

  // This only checks that resources exist, not that they have any particular properties or behavior.
  test('Presence', () => {
    // Assert for presence. See this list of resource types to find the strings to use here:
    // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html
    const networkTemplate = Template.fromStack(networkStack);
    networkTemplate.hasResourceProperties('AWS::EC2::VPC', {});
    networkTemplate.hasResourceProperties('AWS::Route53::HostedZone', {});
    const dataPlaneTemplate = Template.fromStack(dataPlaneStack);
    dataPlaneTemplate.hasResourceProperties('AWS::RDS::DBCluster', {}); // Aurora cluster.
    dataPlaneTemplate.hasResourceProperties('AWS::Lambda::Function', {}); // Schema lambda.
    const appPlaneTemplate = Template.fromStack(appPlaneStack);
    appPlaneTemplate.hasResourceProperties('AWS::ECS::Service', {}); // Tile server.
    const frontendTemplate = Template.fromStack(frontendStack);
    frontendTemplate.hasResourceProperties('AWS::S3::Bucket', {}); // s3 bucket.
    frontendTemplate.hasResourceProperties('AWS::CloudFront::Distribution', {
      // CloudFront Distribution.
      DistributionConfig: {
        Aliases: [networkStack.dns.hostedZone.zoneName], // DNS
      },
    });
    frontendTemplate.hasResourceProperties('AWS::CloudFront::Function', {}); // URL prefix trimmer.
  });

  // TODO: Check that the lambda has write access to the DB.
  test('Permissions', () => {});
});
