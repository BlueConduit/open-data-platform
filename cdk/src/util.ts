import { StackProps } from 'aws-cdk-lib';

// Constants. Define anything that's referenced in multiple places here.
// Use string enums for easy debugging, since these map to human-readable strings.
export enum StackId {
  Network = 'Network',
  DataPlane = 'DataPlane',
  Frontend = 'Frontend',
  AppPlane = 'AppPlane',
}
export enum EnvType {
  UnitTest = 'UNITTEST', // Non-deployed environment for testing.
  Sandbox = 'SANDBOX', // Developers' individual environments.
  Development = 'DEV', // Single shared dev environment.
  Production = 'PROD', // Not yet implemented.
}
export const defaultEnv = EnvType.Sandbox;
export const projectName = 'OpenDataPlatform';

// Leaving this here to add stuff like environmental variables, similar to
// https://github.com/BlueConduit/tributary/blob/main/cdk/lib/types.ts
export interface CommonProps extends StackProps {
  envType: EnvType;
}

export const stackName = (id: StackId, e: EnvType): string => {
  const base = `${projectName}${StackId[id]}`;
  if (e == EnvType.Sandbox && process.env.USER) return `${process.env.USER}-${base}`;
  return base;
};
