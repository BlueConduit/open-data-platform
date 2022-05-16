import { StackProps } from 'aws-cdk-lib';

// Constants. Define anything that's referenced in multiple places here.
export enum StackId {
  Root,
  Network,
  DataPlane,
}
export const projectName = 'OpenDataPlatform';

// Leaving this here to add stuff like environmental variables, similar to
// https://github.com/BlueConduit/tributary/blob/main/cdk/lib/types.ts
export interface CommonProps extends StackProps {}

// Each construct in AWS is prefixed with its stack's name. This function creates a useful name
// for identification of the construct.
// TODO: drop developer user name from the stack for non-dev environments.
export const stackName = (id: StackId): string => {
  const base = `${projectName}${StackId[id]}`;
  // Share a common Network name across multiple developers, so don't include the user name.
  if (id === StackId.Network) return base;
  return `${process.env.USER}-${base}`;
};
