import { StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { ITopic } from 'aws-cdk-lib/aws-sns';

// Constants. Define anything that's referenced in multiple places here.
// Use string enums for easy debugging, since these map to human-readable strings.
export enum StackId {
  Monitoring = 'Monitoring',
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
  Deployments = 'Deployments', // Title-case string matches the existing deployments tag.
}
export const defaultEnv = EnvType.Sandbox;
export const projectName = 'OpenDataPlatform';
export const baseSubdomain = 'leadout'; // Winner of team vote.
export const parentDomain = 'blueconduit.com';

// Leaving this here to add stuff like environmental variables, similar to
// https://github.com/BlueConduit/tributary/blob/main/cdk/lib/types.ts
export interface CommonProps extends StackProps {
  envType: EnvType;
  ticketSNSTopicArn?: string;
}

export const stackName = (id: StackId, e: EnvType): string => {
  const base = `${projectName}${StackId[id]}`;
  if (e == EnvType.Sandbox && process.env.USER) return `${process.env.USER}-${base}`;
  return base;
};

export const domain = (envType: EnvType) => {
  let subdomain = `${process.env.USER ?? 'default'}.${baseSubdomain}-sandbox`; // Used by UNITTEST too.
  if (envType === EnvType.Production) subdomain = baseSubdomain;
  else if (envType === EnvType.Development) subdomain = `${baseSubdomain}-dev`;

  return `${subdomain}.${parentDomain}`;
};

export const lambdaErrorAlarm = (scope: Construct, lambda: NodejsFunction, lambdaName: string) =>
  new cloudwatch.MathExpression({
    expression: 'errors / invocations',
    label: 'Error Fraction',
    usingMetrics: {
      errors: lambda.metricErrors(),
      invocations: lambda.metricInvocations(),
    },
  }).createAlarm(scope, 'ErrorAlarm', {
    alarmDescription: `The ${lambdaName} lambda has failed. Check the logs for details: ${lambda.logGroup.logGroupName}`,
    evaluationPeriods: 1,
    threshold: 1,
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
  });
