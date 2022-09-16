import { Construct } from 'constructs';
import * as synthetics from '@aws-cdk/aws-synthetics-alpha';
import { join } from 'path';
import * as fs from 'fs';
import { CommonProps, domain, EnvType } from '../util';

export class SyntheticsStack extends Construct {
  constructor(scope: Construct, id: string, props: CommonProps) {
    super(scope, id);

    const { envType } = props;

    // By default, run every 15 minutes, every hour, Monday through Friday.
    // The original cron string: '0/15 * ? * MON-FRI'
    let schedule = synthetics.Schedule.cron({
      minute: '0/15',
      weekDay: 'MON-FRI',
    });
    // But run it on demand in sandbox environments.
    if (envType == EnvType.Sandbox) schedule = synthetics.Schedule.once();

    const canary = new synthetics.Canary(this, id, {
      schedule,
      test: synthetics.Test.custom({
        code: synthetics.Code.fromInline(
          fs.readFileSync(join(__dirname, 'synthetics.handler.ts'), 'utf8'),
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
  }
}
