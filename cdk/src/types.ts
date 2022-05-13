import { StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface CommonProps extends StackProps {
  vpc: ec2.Vpc;
}
