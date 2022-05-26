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

export class FrontendStack extends Stack {

  readonly distribution: cloudfront.Distribution;
  readonly frontendAssetsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: CommonProps) {
    super(scope, id, props);

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
  }
}