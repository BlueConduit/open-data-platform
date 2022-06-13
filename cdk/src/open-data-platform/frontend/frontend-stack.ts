// Defines the s3 Bucket to host static assets, the distribution which
// points to that bucket, and deploys frontend assets to the bucket.
//
// Based on https://github.com/BlueConduit/patina/blob/main/cdk/lib/patina-stack.ts,
// which gets bucket and distribution references from
// https://github.com/BlueConduit/tributary/blob/7a275259c484dd637467c841a62997cb6370c9f4/cdk/lib/frontend/frontend-stack.ts.

import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { CommonProps } from '../../util';
import { AppPlaneStack } from '../app-plane/app-plane-stack';
import prefixes, { handler } from './url-prefixes';

interface FrontendProps extends CommonProps {
  appPlaneStack: AppPlaneStack;
}

export class FrontendStack extends Stack {
  readonly distribution: cloudfront.Distribution;
  readonly frontendAssetsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: FrontendProps) {
    super(scope, id, props);

    const { appPlaneStack } = props;

    // Create s3 bucket to host static assets.
    this.frontendAssetsBucket = new s3.Bucket(this, 'FrontendAssets');

    // Create CloudFront Distribution that points to frontendAssetsBucket.
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      domainNames: undefined, // TODO: Add alternate domain name.
      defaultBehavior: {
        origin: new origins.S3Origin(this.frontendAssetsBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.ALLOW_ALL,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
      },
      defaultRootObject: 'index.html',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Only deploy to NA and EU access points
      enableLogging: true,
    });

    // Deploy frontend assets at client/dist to frontendAssetsBucket.
    new s3deploy.BucketDeployment(this, 'StaticAssetsDeployment', {
      sources: [s3deploy.Source.asset('../client/dist')],
      destinationBucket: this.frontendAssetsBucket,
      distribution: this.distribution,
      distributionPaths: ['/*'],
    });

    // Add the tileserver to the Cloudfront distribution to make it publicly available.
    // TODO: consider splitting this out into another file for organization.
    const tileServerOrigin = new origins.HttpOrigin(
      // The URL for the load balancer in front of the tile server cluster.
      appPlaneStack.tileServer.ecsService.loadBalancer.loadBalancerDnsName,
      {
        // TODO: set up HTTPS. Until then, this is HTTP only.
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
      },
    );

    const prefixTrimFunction = new cloudfront.Function(this, 'ViewerResponseFunction', {
      functionName: `${id}-tileServerPrefixTrim`,
      code: cloudfront.FunctionCode.fromInline(handler.toString()),
      comment: `Trim "${prefixes.tileServer}" prefix from URL`,
    });
    this.distribution.node.addDependency(prefixTrimFunction);

    this.distribution.addBehavior(`${prefixes.tileServer}/*`, tileServerOrigin, {
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
      functionAssociations: [
        // This function removes a URL prefix that CloudFront expects, but the tile server doesn't.
        // Since CloudFront is instantiated in us-east-1, so must this function:
        // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/monitoring-functions.htmltions/tileServerPrefixTrim?tab=test
        {
          function: prefixTrimFunction,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
    });
  }
}
