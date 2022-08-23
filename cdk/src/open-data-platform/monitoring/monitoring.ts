import { Stack } from 'aws-cdk-lib';
import * as chatbot from 'aws-cdk-lib/aws-chatbot';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { CommonProps } from '../../util';

interface MonitoringProps extends CommonProps {
  notificationTopics: sns.ITopic[];
}

export class MonitoringStack extends Stack {
  // This interface can be used by other stacks to send notifications.
  readonly chatbot: chatbot.SlackChannelConfiguration;

  constructor(scope: Construct, id: string, props: MonitoringProps) {
    super(scope, id, props);

    // The chatbot must be manually connected to Slack per AWS account. This can't be done in CDK.
    this.chatbot = new chatbot.SlackChannelConfiguration(this, 'SlackChannel', {
      ...props.slackConfig,
      loggingLevel: chatbot.LoggingLevel.INFO,
    });

    // Subscribe to each topic from the other stacks.
    // TODO: make this more independent of other stacks. Right now, updating other stacks sometimes
    // will fail because this stack depends on the SNS topic resource consumed here.
    props.notificationTopics.forEach((topic) => this.chatbot.addNotificationTopic(topic));
  }
}
