import { Stack } from 'aws-cdk-lib';
import * as chatbot from 'aws-cdk-lib/aws-chatbot';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { CommonProps } from '../../util';

interface MonitoringProps extends CommonProps {}

export class MonitoringStack extends Stack {
  /**
   * An SNS topic for alarms that represent something going wrong, but doesn't require immediate
   * attention yet.
   */
  readonly ticketTopic: sns.Topic;
  /**
   * An SNS topic for alarms that represent something on fire, such as a significant number of users
   * cannot perform a CUJ.
   */
  readonly pageTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: MonitoringProps) {
    super(scope, id, props);

    // The chatbot must be manually connected to Slack per AWS account. This can't be done in CDK.
    const slackbot = new chatbot.SlackChannelConfiguration(this, 'SlackChannel', {
      ...props.slackConfig,
      loggingLevel: chatbot.LoggingLevel.INFO,
    });

    // Subscribe to each topic from the other stacks.
    // TODO: handle these differently, such as by tagging users or using a different channel.
    this.ticketTopic = new sns.Topic(this, 'ticketSNSTopic', {
      displayName: 'Ticket-level alarms',
    });
    slackbot.addNotificationTopic(this.ticketTopic);
    this.pageTopic = new sns.Topic(this, 'pageSNSTopic', {
      displayName: 'Page-level alarms',
    });
    slackbot.addNotificationTopic(this.pageTopic);
  }
}
