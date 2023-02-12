import { StackContext, StaticSite } from "sst/constructs";
import * as s3 from "aws-cdk-lib/aws-s3";

export function Web({ stack }: StackContext) {

  const site = new StaticSite(stack, "site", {
    path: "../client-new",
    buildCommand: "npm run build",
    buildOutput: "dist",
    cdk: {
      bucket: {
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
      }
    }
  });

  stack.addOutputs({
    SiteUrl: site.url || site.cdk.distribution.domainName,
  });
}
