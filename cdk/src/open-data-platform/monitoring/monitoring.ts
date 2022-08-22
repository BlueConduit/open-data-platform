import { Stack } from 'aws-cdk-lib';
import * as chatbot from 'aws-cdk-lib/aws-chatbot';
import { INotificationRuleTarget } from 'aws-cdk-lib/aws-codestarnotifications';
import { Construct } from 'constructs';
import { CommonProps } from '../../util';

export class MonitoringStack extends Stack {
  // This interface can be used by other stacks to send notifications.
  readonly chatbot: INotificationRuleTarget;

  constructor(scope: Construct, id: string, props: CommonProps) {
    super(scope, id, props);

    // The chatbot must be manually connected to Slack per AWS account. This can't be done in CDK.
    this.chatbot = new chatbot.SlackChannelConfiguration(this, 'SlackChannel', {
      ...props.slackConfig,
      loggingLevel: chatbot.LoggingLevel.INFO,
    });
  }
}
