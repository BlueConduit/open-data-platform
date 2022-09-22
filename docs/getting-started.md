# Getting Started

<!-- TODO: add a link to other guides on how to set up the release pipeline, once written -->

This is a guide for how to run an instance of LeadOut in AWS.

## Project structure

This project is set up as a monorepo that contains everything required to run its full stack.

- `api` - Defines the data-serving layer of the application. It runs in AWS, so can be started via
  the `cdk` below.
- `cdk`- Defines the CDK deployment configurations.
- `client` - Defines the Vue front-end server.
- `docs` - Contains any other technical documentation See the [index](../README.md) to browse the
  docs.

Instructions on how to run that [here](cdk/README.md). Instructions on how to run that
[here](client/README.md).

## Prerequisites

This guide assumes you have done the following:

- Install Node 16.
- Have an AWS account and specified your AWS credentials on your workstation
  ([general guide](https://docs.aws.amazon.com/cdk/v2/guide/cli.html),
  [BlueConduit guide](https://github.com/BlueConduit/meta/blob/main/guides/aws-access.md)).
- Own a domain managed by AWS Route53.
- Have a Mapbox account with API access token.

## Installation

First, build the client:

1. From the root of the repository, change to the `client` directory.

   ```sh
   cd client
   ```

1. Install dependencies.

   ```sh
   npm install
   ```

1. Set `VUE_APP_MAP_BOX_API_TOKEN` in [`.env.production`](../client/.env.production) to your your
   MapBox API token.

1. Build the static files.

   ```sh
   npm run build
   ```

You should now have `index.html` and other static files in `client/dist`. If you aren't deploying
this through BlueConduit's infrastructure, you'll need to edit some configs:

1. Replace the AWS account ID with your own in [`cdk.ts`](../cdk/src/cdk.ts) and
   [`dns.ts`](../cdk/src/open-data-platform/network/dns.ts).
1. Replace the domain name with your own in [`util.ts`](../cdk/src/util.ts).

Next, deploy the infrastructure using the CDK:

1. From the root of the repository, change to the `cdk` directory.

   ```sh
   cd cdk # or `cd ../cdk` if you were already in `client`
   ```

1. Install dependencies.

   ```sh
   npm install
   ```

1. Deploy the application. Review and approve each of the prompted permissions questions.

   ```sh
   cdk deploy --all
   ```

You can review that this has been successful by going to your AWS console and viewing the
CloudFormation console. It should show a successful deployment of several `OpenDataPlatform` stacks.
Then, open the CloudFront console and find the full domain name of your LeadOut instance. Open that
in a browser. It should display the application.

<!-- TODO: add a guide on how to import data. -->

## Local Development

You can use the above guide and `cdk deploy --all` to deploy local changes. However, each deployment
may take a few minutes. A faster development cycle is to locally serve a live version of the client,
which points to the deployed backend.

First, create a file for your local environment variables:

1. Create a local [`.env`](https://cli.vuejs.org/guide/mode-and-env.html#environment-variables)
   file.

   ```sh
   cd client
   touch .env
   ```

1. Add the following [`.env`].

   ```sh
   VUE_APP_MAP_BOX_API_TOKEN = # Your Mapbox token
   VUE_APP_API_ENDPOINT = # The root endpoint for your deployed LeadOut instance, including `https://`
   VUE_APP_DEFAULT_TILESERVER_HOST = # The domain for your deployed LeadOut instance, without `https://`
   ```

1. Build the client and run a local development server.

   ```sh
   npm run serve
   ```

LeadOut should now be available at the returned `localhost` URL. You can verify the env vars are
correctly configured by viewing the browser dev console, which should print
`Using API: ${your LeadOut instance}/api`.
