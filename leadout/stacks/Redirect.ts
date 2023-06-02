import { StackContext, use } from "sst/constructs";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront"
import * as origins from "aws-cdk-lib/aws-cloudfront-origins"
import * as s3 from "aws-cdk-lib/aws-s3"
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment"
import * as route53 from "aws-cdk-lib/aws-route53"
import * as route53targets from "aws-cdk-lib/aws-route53-targets"
import { Dns } from "./Dns";

export function Redirect({ stack }: StackContext) {

  const {
    hostedZone,
    cloudfrontCertificate
  } = use(Dns)

  const redirectToBlueConduitWebsite = new cloudfront.Function(stack, 'redirect-to-blueconduit', {
    code: cloudfront.FunctionCode.fromInline(`
      function handler(event) {
        return {
          statusCode: 302,
          statusDescription: 'Found',
          headers: { location: { value: 'https://blueconduit.com/lsl-solutions/nationwide-map/' } }
        }
      }
    `),
  });

  const assetsBucket = new s3.Bucket(stack, 'assets-bucket');

  const dist = new cloudfront.Distribution(stack, 'distribution', {
    domainNames: [hostedZone.zoneName],
    certificate: cloudfrontCertificate,
    defaultBehavior: {
      origin: new origins.S3Origin(assetsBucket),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
      functionAssociations: [
        // Temporarily redirect leadout.blueconduit.com to blueconduit.com/lsl-solutions/nationwide-map/
        // TODO: would need to replace with redirect4xxFunction before launching LeadOut
        {
          function: redirectToBlueConduitWebsite,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
    },
    defaultRootObject: 'index.html',
    priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Only deploy to NA and EU access points
  });

  new s3deploy.BucketDeployment(stack, 'assets-deployment', {
    sources: [s3deploy.Source.asset('./public')],
    destinationBucket: assetsBucket,
    distribution: dist,
    distributionPaths: ['/*'],
  })

  new route53.ARecord(stack, 'dns-record', {
    zone: hostedZone,
    target: route53.RecordTarget.fromAlias(
      new route53targets.CloudFrontTarget(dist),
    ),
  });

  stack.addOutputs({
    CDN: dist.domainName,
  });
}
