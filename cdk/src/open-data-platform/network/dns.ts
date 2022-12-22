// Sets up DNS for the application.
// Based on https://github.com/BlueConduit/tributary/blob/main/cdk/lib/network/dns.ts

import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';
import { CommonProps, domain, EnvType, parentDomain } from '../../util';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as iam from 'aws-cdk-lib/aws-iam';

export class Dns extends Construct {
  readonly hostedZone: route53.PublicHostedZone;
  readonly cloudfrontCertificate: certificatemanager.Certificate;

  // Temp internal subdomain dns inf
  readonly tempInternalHostedZone: route53.PublicHostedZone;
  readonly tempInternalCert: certificatemanager.Certificate;

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

    // Temporarily do everything again for the leadout-internal.blueconduit.com domain
    if (envType === EnvType.Production) {
      this.tempInternalHostedZone = new route53.PublicHostedZone(this, 'TempInternalSubdomain', {
        zoneName: 'leadout-internal.blueconduit.com'
      })

      new route53.CrossAccountZoneDelegationRecord(this, 'TempInternalDelegationRecord', {
        delegatedZone: this.tempInternalHostedZone,
        parentHostedZoneName: parentDomain,
        delegationRole
      })

      this.tempInternalCert = new certificatemanager.DnsValidatedCertificate(
        this,
        'TempInternalCloudFrontCert',
        {
          domainName: this.tempInternalHostedZone.zoneName,
          hostedZone: this.tempInternalHostedZone,
          region: 'us-east-1',
        }
      )
    }
  }
}
