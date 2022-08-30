// Defines the stack for all services that users will directly interact with.

import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CommonProps } from '../../util';
import { DataPlaneStack } from '../data-plane/data-plane-stack';
import { NetworkStack } from '../network/network-stack';
import { TileServer } from './tileserver/tileserver';
import { ApiStack } from './api/api-stack';
import { ITopic } from 'aws-cdk-lib/aws-sns';

// TODO: consider narrowing the props down to the specific things that the App Plane needs.
// E.g. just the cluster object itself, rather than the entire network stack.
export interface AppPlaneStackProps extends CommonProps {
  networkStack: NetworkStack;
  dataPlaneStack: DataPlaneStack;
  ticketSNSTopic?: ITopic;
}

export class AppPlaneStack extends Stack {
  readonly tileServer: TileServer;
  readonly api: ApiStack;

  constructor(scope: Construct, id: string, props: AppPlaneStackProps) {
    super(scope, id, props);

    const { networkStack, dataPlaneStack } = props;

    this.tileServer = new TileServer(this, 'TileServer', {
      ecsCluster: networkStack.cluster,
      postgisTileDatabase: dataPlaneStack.cluster,
      databaseUrlSecret: dataPlaneStack.tileserverCredentials.databaseUrlSecret,
    });

    this.api = new ApiStack(this, 'ApiStack', props);
  }
}
