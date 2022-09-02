import { Construct } from 'constructs';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Duration } from 'aws-cdk-lib';
import { ITopic } from 'aws-cdk-lib/aws-sns';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';

interface ApiMonitoringProps {
  gateway: RestApi;
  ticketSNSTopic?: ITopic;
}

export class ApiMonitoring extends Construct {
  constructor(scope: Construct, id: string, props: ApiMonitoringProps) {
    super(scope, id);

    const { gateway, ticketSNSTopic } = props;

    // Client errors are likely caused by problems in our client code since the API is not public,
    // so they should be considered like an internal error.
    // TODO: Split this into client and server errors once the API is pubished.
    // TODO: Track the error budget, rather than looking at the error rate at any given time.

    const availabilitySlo = 0.95;
    const latencyMsSlo = 2000; // Milliseconds
    const period = Duration.minutes(15);
    // Alarms will fire if they are above the threshold for the number of periods below.
    const fastBurnEvalPeriods = 4; // 60 minutes
    const slowBurnEvalPeriods = 4 * 24; // 24 hours

    const alarms = [
      new cloudwatch.MathExpression({
        expression: '(clientError + serverError) / count',
        label: 'Error Fraction',
        period,
        usingMetrics: {
          clientError: gateway.metricClientError(),
          serverError: gateway.metricServerError(),
          count: gateway.metricCount(),
        },
      }).createAlarm(scope, 'AvailabilitySLOSlowBurn', {
        alarmDescription: `The API has been running below its ${
          availabilitySlo * 100
        }% SLO for ${slowBurnEvalPeriods} x ${period.toString()}.`,
        evaluationPeriods: slowBurnEvalPeriods,
        threshold: 1 - availabilitySlo,
        // When there is no data, do not alert. Otherwise, one outlier can trigger the alert.
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }),

      new cloudwatch.MathExpression({
        expression: '(clientError + serverError) / count',
        label: 'Error Fraction',
        period,
        usingMetrics: {
          clientError: gateway.metricClientError(),
          serverError: gateway.metricServerError(),
          count: gateway.metricCount(),
        },
      }).createAlarm(scope, 'AvailabilitySLOFastBurn', {
        alarmDescription: `The API has been running significantly below its ${
          availabilitySlo * 100
        }% SLO for ${fastBurnEvalPeriods} x ${period.toString()}.`,
        evaluationPeriods: fastBurnEvalPeriods,
        threshold: (1 - availabilitySlo) * 10, // 10x error rate than SLO allows.
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }),

      // TODO: This uses average latency. Additionally alert on 95%ile latency over a longer period.
      gateway.metricLatency({ period }).createAlarm(scope, 'LatencySLOFastBurn', {
        alarmDescription: `The API has a higher latency than its ${latencyMsSlo} ms SLO for ${fastBurnEvalPeriods} x ${period.toString()}.`,
        evaluationPeriods: fastBurnEvalPeriods,
        threshold: latencyMsSlo,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }),
    ];

    if (ticketSNSTopic)
      alarms.forEach((alarm) => alarm.addAlarmAction(new SnsAction(ticketSNSTopic)));
  }
}
