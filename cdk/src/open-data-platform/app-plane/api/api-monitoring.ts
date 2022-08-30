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
    const latencyMsSlo = 2000; // Miliseconds
    const slowBurnPeriod = Duration.days(1);
    const fastBurnPeriod = Duration.hours(1);

    const alarms = [
      new cloudwatch.MathExpression({
        expression: '(clientError + serverError) / count',
        label: 'Error Fraction',
        period: slowBurnPeriod,
        usingMetrics: {
          clientError: gateway.metricClientError(),
          serverError: gateway.metricServerError(),
          count: gateway.metricCount(),
        },
      }).createAlarm(scope, 'AvailabilitySLOSlowBurn', {
        alarmDescription: `The API has been running below its ${
          availabilitySlo * 100
        }% SLO for ${slowBurnPeriod.toString()}.`,
        evaluationPeriods: 1,
        threshold: 1 - availabilitySlo,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }),

      new cloudwatch.MathExpression({
        expression: '(clientError + serverError) / count',
        label: 'Error Fraction',
        period: fastBurnPeriod,
        usingMetrics: {
          clientError: gateway.metricClientError(),
          serverError: gateway.metricServerError(),
          count: gateway.metricCount(),
        },
      }).createAlarm(scope, 'AvailabilitySLOFastBurn', {
        alarmDescription: `The API has been running significantly below its ${
          availabilitySlo * 100
        }% SLO for ${fastBurnPeriod.toString()}.`,
        evaluationPeriods: 1,
        threshold: (1 - availabilitySlo) * 10, // 10x error rate than SLO allows.
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }),

      // TODO: This uses average latency. Additionally alert on 95%ile latency over a longer period.
      gateway.metricLatency({ period: fastBurnPeriod }).createAlarm(scope, 'LatencySLOFastBurn', {
        alarmDescription: `The API has a higher latency than its ${latencyMsSlo} ms SLO for ${fastBurnPeriod.toString()}.`,
        evaluationPeriods: 1,
        threshold: latencyMsSlo,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }),
    ];

    if (ticketSNSTopic)
      alarms.forEach((alarm) => alarm.addAlarmAction(new SnsAction(ticketSNSTopic)));
  }
}
