# CDK deployment configurations for the Open Data Platform

The `cdk.json` stores all info on how to execute the app.

## Useful commands

* `npm run test`     perform the jest unit tests
* `cdk deploy --all` deploy this stack to your default AWS account/region
* `cdk diff`         compare deployed stack with current state
* `cdk destroy`      tear down the existing stack

## CDK Structure

The rough structure of the project is:

```text
./src
├── cdk.ts -- main CDK start point.
├── util.ts -- common types, constants, functions.
└── open-data-platform
    ├── root-stack.ts -- Stack definition for the root of the app. This refers to the below stacks.
    ├── data-plane-stack.ts -- Stack definition for the data plane.
    └── ...
```
