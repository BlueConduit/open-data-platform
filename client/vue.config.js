const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
});

// Make CodeBuild env vars available to the Vue client.
process.env.VUE_APP_CODEBUILD_SOURCE_REPO_URL = process.env.CODEBUILD_SOURCE_REPO_URL;
