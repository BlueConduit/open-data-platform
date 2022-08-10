import { Construct } from 'constructs';
import { AppPlaneStackProps } from '../app-plane-stack';
import { apiLambda, apiLambdaFactory } from './lambda-function-factory';

export class ApiStack extends Construct {
  readonly apiLambdas: apiLambda[];

  constructor(scope: Construct, id: string, props: AppPlaneStackProps) {
    super(scope, id);

    const { dataPlaneStack, networkStack } = props;

    const apiLambdaProps = {
      cluster: dataPlaneStack.cluster,
      vpc: networkStack.vpc,
      db: dataPlaneStack.databaseName,
      credentialsSecret: dataPlaneStack.cluster.secret!,
      role: dataPlaneStack.apiLambdaRole,
    };

    this.apiLambdas = [
      apiLambdaFactory(this, apiLambdaProps, 'geolocate'),
      apiLambdaFactory(this, apiLambdaProps, 'parcel'),
      apiLambdaFactory(this, apiLambdaProps, 'watersystem'),
      apiLambdaFactory(this, apiLambdaProps, 'zipcode/scorecard'),
    ];
  }
}
