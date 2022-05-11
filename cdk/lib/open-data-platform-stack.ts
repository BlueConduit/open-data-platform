import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

const appName = 'OpenDataPlatform'
const stackName = (id: string) => {
  return `${process.env.USER}${appName}${id}`
}

export class OpenDataPlatformStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);


    // TODO(fellows): break the stack into separate files, similar to https://github.com/BlueConduit/tributary/tree/main/cdk.
    // This is all one file right now while we get the project initialized.

    // Set up networking.
    const vpc = new ec2.Vpc(this, stackName('VPC'), {
      cidr: "10.0.0.0/16",
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }
      ],
    })

  }
}
