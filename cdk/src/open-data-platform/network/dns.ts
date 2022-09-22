// Sets up DNS for the application.
// Based on https://github.com/BlueConduit/tributary/blob/main/cdk/lib/network/dns.ts

import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';
import { CommonProps, domain, parentDomain } from '../../util';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as iam from 'aws-cdk-lib/aws-iam';

export class Dns extends Construct {
  readonly hostedZone: route53.PublicHostedZone;
  readonly cloudfrontCertificate: certificatemanager.Certificate;

  constructor(scope: Construct, id: string, props: CommonProps) {
    super(scope, id);

    const { envType } = props;

    this.hostedZone = new route53.PublicHostedZone(this, 'Subdomain', {
      zoneName: domain(envType),
    });

    const delegationRole = iam.Role.fromRoleArn(
      this,
      'DelegationRole',
      Stack.of(this).formatArn({
        region: '', // IAM is global in each partition
        service: 'iam',
        account: '162116537239',
        resource: 'role',
        resourceName: 'ZoneDelegationRole',
      }),
    );

    new route53.CrossAccountZoneDelegationRecord(this, 'DelegationRecord', {
      delegatedZone: this.hostedZone,
      parentHostedZoneName: parentDomain,
      delegationRole,
    });

    this.cloudfrontCertificate = new certificatemanager.DnsValidatedCertificate(
      this,
      'CloudFrontCertificate',
      {
        domainName: `${this.hostedZone.zoneName}`,
        hostedZone: this.hostedZone,
        region: 'us-east-1',
      },
    );
  }
}
