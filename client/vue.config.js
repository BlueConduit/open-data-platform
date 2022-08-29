const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
});

// Make build env vars available to the Vue client.
// Other variables can be found at: https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-env-vars.html
process.env.VUE_APP_BUILD_TIMESTAMP = new Date().toISOString();
if (process.env.CODEBUILD_SOURCE_REPO_URL)
  process.env.VUE_APP_CODEBUILD_SOURCE_REPO_URL = process.env.CODEBUILD_SOURCE_REPO_URL;
if (process.env.CODEBUILD_RESOLVED_SOURCE_VERSION)
  process.env.VUE_APP_CODEBUILD_RESOLVED_SOURCE_VERSION =
    process.env.CODEBUILD_RESOLVED_SOURCE_VERSION;
