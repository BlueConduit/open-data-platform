// Defines the stack for all services that users will directly interact with.

import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CommonProps } from '../../util';
import { DataPlaneStack } from '../data-plane/data-plane-stack';
import { NetworkStack } from '../network/network-stack';
import { TileServer } from './tileserver/tileserver';

interface AppPlaneStackProps extends CommonProps {
  networkStack: NetworkStack;
  dataPlaneStack: DataPlaneStack;
}

export class AppPlaneStack extends Stack {
  readonly tileServer: TileServer;

  constructor(scope: Construct, id: string, props: AppPlaneStackProps) {
    super(scope, id, props);

    const { networkStack, dataPlaneStack } = props;

    this.tileServer = new TileServer(this, 'TileServer', {
      ecsCluster: networkStack.cluster,
      postgisTileDatabase: dataPlaneStack.cluster,
      databaseUrlSecret: dataPlaneStack.tileserverCredentials.databaseUrlSecret,
    });
  }
}
