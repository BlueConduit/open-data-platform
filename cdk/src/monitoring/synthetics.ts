import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as synthetics from '@aws-cdk/aws-synthetics-alpha';
import { join } from 'path';
import * as fs from 'fs';

export class SyntheticsStack extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const canary = new synthetics.Canary(this, 'MyCanary', {
      // schedule: synthetics.Schedule.rate(Duration.minutes(5)),
      schedule: synthetics.Schedule.once(),

      test: synthetics.Test.custom({
        code: synthetics.Code.fromInline(
          fs.readFileSync(join(__dirname, 'synthetics.handler.ts'), 'utf8'),
        ),
        handler: 'index.handler',
      }),
      runtime: synthetics.Runtime.SYNTHETICS_NODEJS_PUPPETEER_3_5,
      artifactsBucketLocation:
      // environmentVariables: {
      //   stage: 'prod',
      // },
    });
  }
}
