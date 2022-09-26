import { Construct } from 'constructs';
import * as synthetics from '@aws-cdk/aws-synthetics-alpha';
import { join } from 'path';
import * as fs from 'fs';
import * as ts from 'typescript';
import { CommonProps, domain, EnvType } from '../util';
import { ITopic } from 'aws-cdk-lib/aws-sns';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';

interface SyntheticsProps extends CommonProps {
  ticketSNSTopic?: ITopic;
}

/**
 * Transpiles a set of files into a single JS string.
 * @param dependencyPaths A set of paths relative to this file.
 * @returns A string of JS.
 */
const compileHandlerString = (dependencyPaths: string[]): string => {
  // Combine all dependencies into one string of Typescript.
  const rawTs = dependencyPaths.reduce(
    (acc: string, cur: string) => acc + fs.readFileSync(join(__dirname, cur), 'utf8'),
    '',
  );
  // Canaries must use Javascript and fromInline does not accept typescript. So transpile TS
  // to JS inline. This allows the handler to import other TS files from
  return ts.transpileModule(rawTs, {}).outputText;
};

export class SyntheticsStack extends Construct {
  constructor(scope: Construct, id: string, props: SyntheticsProps) {
    super(scope, id);

    const { envType, ticketSNSTopic } = props;

    // By default, run every 15 minutes, every hour, Monday through Friday.
    // The original cron string: '0/15 * ? * MON-FRI'
    let schedule = synthetics.Schedule.cron({
      minute: '0/15',
      weekDay: 'MON-FRI',
    });
    // But run it on demand in sandbox environments.
    if (envType == EnvType.Sandbox) schedule = synthetics.Schedule.once();

    // Define the handler code as a string.

    const canary = new synthetics.Canary(this, id, {
      schedule,
      test: synthetics.Test.custom({
        code: synthetics.Code.fromInline(
          compileHandlerString([
            '../../../client/src/assets/messages/scorecard_messages.ts',
            'synthetics.handler.ts',
          ]),
        ),
        handler: 'index.handler',
      }),
      runtime: synthetics.Runtime.SYNTHETICS_NODEJS_PUPPETEER_3_5,
      environmentVariables: {
        // Since there is only one monitoring stack for all sandbox envs, this will probe the
        // sandbox env of whoever ran `npm run monitoring-deploy` most recently.
        DOMAIN: domain(envType),
      },
    });

    // Add a basic alarm that fires when any canary fails.
    const singleAlarm = canary.metricFailed().createAlarm(scope, 'SingleCanaryFailure', {
      alarmDescription: `Canary execution failed: https://us-east-2.console.aws.amazon.com/cloudwatch/home?region=us-east-2#synthetics:canary/detail/${canary.canaryName}`,
      evaluationPeriods: 1,
      threshold: 1,
    });

    if (ticketSNSTopic) singleAlarm.addAlarmAction(new SnsAction(ticketSNSTopic));
  }
}
