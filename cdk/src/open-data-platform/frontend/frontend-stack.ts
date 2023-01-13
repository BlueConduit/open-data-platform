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
import { CommonProps, EnvType } from '../../util';
import { AppPlaneStack } from '../app-plane/app-plane-stack';
import redirect4xx from './redirect-4xx';
import prefixes, { handler } from './url-prefixes';
import { NetworkStack } from '../network/network-stack';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import * as cdk from 'aws-cdk-lib';

interface FrontendProps extends CommonProps {
  appPlaneStack: AppPlaneStack;
  networkStack: NetworkStack;
}

export class FrontendStack extends Stack {
  readonly distribution: cloudfront.Distribution;
  readonly frontendAssetsBucket: s3.Bucket;
  readonly newClientAssetsBucket: s3.Bucket;
  readonly newClientDistribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: FrontendProps) {
    super(scope, id, props);

    const { envType, appPlaneStack, networkStack } = props;
    const { hostedZone, tempInternalHostedZone } = networkStack.dns;

    // Create s3 bucket to host static assets.
    this.frontendAssetsBucket = new s3.Bucket(this, 'FrontendAssets');

    // Create s3 bucket to host new client static assets.
    this.newClientAssetsBucket = new s3.Bucket(this, 'NewClientAssets');

    const redirect4xxFunction = new cloudfront.Function(this, 'Redirect4xxFunction', {
      functionName: `${id}-redirect4xx`,
      code: cloudfront.FunctionCode.fromInline(redirect4xx.toString()),
      comment: `Repalces URL to point to the home route.`,
    });

    const redirectToBlueConduitWebsite = new cloudfront.Function(this, 'RedirectToBlueConduit', {
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

    // Create CloudFront Distribution that points to frontendAssetsBucket.
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      domainNames: hostedZone ? [hostedZone.zoneName] : undefined,
      certificate: networkStack.dns.cloudfrontCertificate,
      defaultBehavior: {
        origin: new origins.S3Origin(this.frontendAssetsBucket),
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
      enableLogging: true,
    });

    // Create CloudFront Distribution that points to newClientAssetsBucket
    this.newClientDistribution = new cloudfront.Distribution(this, 'NewClientDistribution', {
      domainNames: hostedZone ? [hostedZone.zoneName] : undefined,
      certificate: networkStack.dns.newClientCert, // TODO does this need to be different?
      defaultBehavior: {
        origin: new origins.S3Origin(this.newClientAssetsBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
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

    // Deploy new client assets at client-new/dist to newClientAssetsBucket
    new s3deploy.BucketDeployment(this, 'NewClientAssetsDeployment', {
      sources: [s3deploy.Source.asset('../client-new/dist')],
      destinationBucket: this.newClientAssetsBucket,
      distribution: this.newClientDistribution,
      distributionPaths: ['/*'],
    });

    const prefixTrimFunction = new cloudfront.Function(this, 'ViewerResponseFunction', {
      functionName: `${id}-tileServerPrefixTrim`,
      code: cloudfront.FunctionCode.fromInline(handler.toString()),
      comment: `Trim "${prefixes.tileServer}" prefix from URL`,
    });
    this.distribution.node.addDependency(prefixTrimFunction);

    // Add app plane to distribution.
    // TODO: consider splitting behaviors and/or origins out into another file for organization.

    const policy = {
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      responseHeadersPolicy:
        // Allow all origins in Sandbox to support local dev.
        props.envType == EnvType.Sandbox
          ? cloudfront.ResponseHeadersPolicy
              .CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS
          : cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
      // TODO: Cache based on query strings if/when we use them.
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      // CF must not forward the "host" header, because that messes up the API Gateway.
      // https://old.reddit.com/r/aws/comments/fyfwt7/cloudfront_api_gateway_error_403_bad_request/hv4l17k/
      originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_CUSTOM_ORIGIN,
    };

    // Tile server.
    const tileServerOrigin = new origins.HttpOrigin(
      // The URL for the load balancer in front of the tile server cluster.
      appPlaneStack.tileServer.ecsService.loadBalancer.loadBalancerDnsName,
      {
        // TODO: set up HTTPS. Until then, this is HTTP only.
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
      },
    );
    this.distribution.addBehavior(`${prefixes.tileServer}/*`, tileServerOrigin, {
      ...policy,
      functionAssociations: [
        // This function removes a URL prefix that CloudFront expects, but the tile server doesn't.
        {
          function: prefixTrimFunction,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
    });

    // API.
    // CloudFront origin can't have the http(s) prefix. We can't use standard JS string
    // manipulation here because the 'url' is actually a token that represents the URL, not the
    // URL itself.
    const apiHostname = cdk.Fn.select(2, cdk.Fn.split('/', appPlaneStack.api.gateway.url));
    const apiPath = cdk.Fn.select(3, cdk.Fn.split('/', appPlaneStack.api.gateway.url));
    this.distribution.addBehavior(`${apiPath}/*`, new origins.HttpOrigin(apiHostname), policy);

    // DNS.
    if (hostedZone) {
      new route53.ARecord(this, 'DnsRecord', {
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(
          new route53targets.CloudFrontTarget(this.distribution),
        ),
      });
    }

    // Temporarily duplicate CF distro for internal endpoint
    if (envType === EnvType.Production) {

      const tempInternalAssetsBucket = new s3.Bucket(this, 'TempInternalAssets');

      const tempInternalDist = new cloudfront.Distribution(this, 'TempInternalDist', {
        domainNames: tempInternalHostedZone ? [tempInternalHostedZone.zoneName] : undefined,
        certificate: networkStack.dns.tempInternalCert,
        defaultBehavior: {
          origin: new origins.S3Origin(tempInternalAssetsBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
          functionAssociations: [{
            function: redirect4xxFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          }],
        },
        defaultRootObject: 'index.html',
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100
      })

      new s3deploy.BucketDeployment(this, 'TempInternalAssetsDeployment', {
        sources: [s3deploy.Source.asset('../client/dist')],
        destinationBucket: tempInternalAssetsBucket,
        distribution: tempInternalDist,
        distributionPaths: ['/*'],
      })

      tempInternalDist.addBehavior(`${prefixes.tileServer}/*`, tileServerOrigin, {
        ...policy,
        functionAssociations: [{
          function: prefixTrimFunction,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        }]
      })

      tempInternalDist.addBehavior(`${apiPath}/*`, new origins.HttpOrigin(apiHostname), policy)

      if (tempInternalHostedZone) {
        new route53.ARecord(this, 'TempInternalDnsRecord', {
          zone: tempInternalHostedZone,
          target: route53.RecordTarget.fromAlias(
            new route53targets.CloudFrontTarget(tempInternalDist)
          )
        })
      }
    }
  }
}
