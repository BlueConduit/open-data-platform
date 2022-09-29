# Writing Tests

## Client

Client tests are written in [Vitest](https://vitest.dev/guide/) and are defined within the directory
of the code they test ([example](../client/src/api/__tests__)).

To add a test:

1. Create a `__tests__/${filename}.test.ts` file in the directory of the code under test.
1. Write [`test`](https://vitest.dev/api/#test) cases within that file.
1. [Execute](./operational-playbook.md#testing-a-code-change) the test to ensure it passes.

## CDK

CDK tests are written in [Jest](https://jestjs.io/docs/getting-started) and are defined centrally in
a [`cdk.test.ts`](../cdk/test/cdk.test.ts) file.

To add a test:

1. Write a [`test`](https://jestjs.io/docs/api#testname-fn-timeout) for the code under test.
1. [Execute](./operational-playbook.md#testing-a-code-change) the test to ensure it passes.

When adding a new CloudFormation resource (which most things in the CDK are), add a presence check
to the test suite:

1. If there is a new stack, instantiate it in the `beforeEach` prep step.
1. Identify the AWS resource type.
   1. You can view a list of resources types in the [`cdk.out/`](../cdk/cdk.out/) dir.
   1. You can also reference a
      [list of resource types here](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html).
1. Add an assertion for presence of the resource:

   ```typescript
   ${Stack Name}Template.hasResourceProperties(
     ${Resource Type},
     ${Any properties you want to assert}
   )
   ```

## Canaries

Canaries are integration tests that run in AWS. They are written with [Puppeteer](https://pptr.dev/)
and are defined centrally in [`synthetics.handler.ts`](../cdk/src/monitoring/synthetics.handler.ts).
These tests cover full user journeys and simulate a user interacting with the web interface.

### Writing a new test

In contrast to the other test types above, there isn't an explicit definition of individual `test`s
in the canary code. Instead, all tests should run in the same handler instance. To add a new test:

1. Create a new `synthetics.executeStep` that uses
   [`page.goto`](https://pptr.dev/api/puppeteer.page.goto) to open the initial page for the test.
1. Use the Puppeteer API to add interactions to the page.
1. (Optionally) Add [`page.screenshot`](https://pptr.dev/api/puppeteer.page.screenshot) calls to
   visually log the page state at various points in the test.
1. [Execute](./operational-playbook.md#testing-a-code-change) the test to ensure it passes.

### Referencing external code

Canaries can only execute code that is contained within the handler file. Since we would like to
reference other files, we use [`compileHandlerString`](..cdk/src/monitoring/synthetics.ts) to
transpile them into a single file. To add more files to the handler:

1. Add the path to the `compileHandlerString` call in the `canary` definition.
1. Add a `ts-ignore` to the variable you would like to reference. For example:

   ```typescript
   // @ts-ignore
   const scorecardMessages = ScorecardMessages; // From scorecard_messages.ts
   ```

1. Use the newly-defined variable in the handler.
