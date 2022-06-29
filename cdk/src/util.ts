import { StackProps } from 'aws-cdk-lib';

// Constants. Define anything that's referenced in multiple places here.
// Use string enums for easy debugging, since these map to human-readable strings.
export enum StackId {
  Root = 'Root',
  Network = 'Network',
  DataPlane = 'DataPlane',
  Frontend = 'Frontend',
  AppPlane = 'AppPlane',
}
export enum EnvType {
  Sandbox = 'Sandbox', // Developers' individual environments.
  Development = 'Development', // Single shared dev environment.
  Production = 'Production', // Not yet implemented.
}
export const projectName = 'OpenDataPlatform';

// Leaving this here to add stuff like environmental variables, similar to
// https://github.com/BlueConduit/tributary/blob/main/cdk/lib/types.ts
export interface CommonProps extends StackProps {}

export const getEnv = (): EnvType => {
  const envType = (process.env.ENV_TYPE ?? '') as EnvType;
  if (!envType) {
    console.log('No ENV_TYPE provided -- defaulting to Sandbox');
    return EnvType.Sandbox;
  }
  return envType;
};

// Each construct in AWS is prefixed with its stack's name. This function creates a useful name
// for identification of the construct.
// TODO: drop developer user name from the stack for non-dev environments.
export const stackName = (id: StackId): string => {
  const base = `${projectName}${StackId[id]}`;
  // Network stuff should be shared across environments within a given AWS account, so use a
  // common name for the network stack.
  if (id === StackId.Network) return base;
  if (getEnv() == EnvType.Sandbox) return `${process.env.USER}-${base}`;
  return `${getEnv()}-${base}`;
};
