import { StackContext } from "sst/constructs";
import * as route53 from "aws-cdk-lib/aws-route53"
import * as iam from "aws-cdk-lib/aws-iam"
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager"

export function Dns({ stack }: StackContext) {

  const baseSubdomain = 'leadout'
  const parentDomain = 'blueconduit.com'

  const domain = () => {
    let subdomain = `${process.env.USER ?? 'default'}.${baseSubdomain}-sandbox`;
    if (stack.stage === 'prod') subdomain = baseSubdomain;
    else if (stack.stage === 'staging') subdomain = `${baseSubdomain}-stg`;

    return `${subdomain}.${parentDomain}`;
  }

  const hostedZone = new route53.PublicHostedZone(stack, 'subdomain', {
    zoneName: domain(),
  });

  const delegationRole = iam.Role.fromRoleArn(stack, 'delegation-role',
    stack.formatArn({
      region: '', // IAM is global in each partition
      service: 'iam',
      account: '162116537239',
      resource: 'role',
      resourceName: 'ZoneDelegationRole',
    }),
  );

  new route53.CrossAccountZoneDelegationRecord(stack, 'delegation-record', {
    delegatedZone: hostedZone,
    parentHostedZoneName: parentDomain,
    delegationRole,
  });

  const cloudfrontCertificate = new certificatemanager.DnsValidatedCertificate(stack, 'cert', {
    domainName: `${hostedZone.zoneName}`,
    hostedZone: hostedZone,
    region: 'us-east-1',
  });

  stack.addOutputs({
    Domain: domain()
  })

  return {
    hostedZone,
    cloudfrontCertificate
  }
}
