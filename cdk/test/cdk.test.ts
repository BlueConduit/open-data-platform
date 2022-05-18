import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DataPlaneStack } from '../src/open-data-platform/data-plane/data-plane-stack';
import { NetworkStack } from '../src/open-data-platform/network/network-stack';
import * as util from '../src/util';

// This only checks that resources exist, not that they have any particular properties or behavior.
test('Stack Presence', () => {
  const app = new cdk.App();

  // Set up stacks in dependency order. This has to be done before any `Template.fronStack` calls,
  // due to https://github.com/aws/aws-cdk/issues/18847#issuecomment-1121980507
  const networkStack = new NetworkStack(app, util.stackName(util.StackId.Network), {});
  const dataPlaneStack = new DataPlaneStack(app, util.stackName(util.StackId.DataPlane), {
    vpc: networkStack.vpc,
  });

  // Assert for presence. See this list of resource types to find the strings to use here:
  // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html
  const networkTemplate = Template.fromStack(networkStack);
  networkTemplate.hasResourceProperties('AWS::EC2::VPC', {});
  const dataPlaneTemplate = Template.fromStack(dataPlaneStack);
  dataPlaneTemplate.hasResourceProperties('AWS::RDS::DBCluster', {}); // Aurora cluster.
  dataPlaneTemplate.hasResourceProperties('AWS::Lambda::Function', {}); // Schema lambda.
});
