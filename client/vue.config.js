const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
});

// Make build env vars available to the Vue client.
process.env.VUE_APP_BUILD_TIMESTAMP = new Date().toISOString();
process.env.VUE_APP_CODEBUILD_SOURCE_REPO_URL = process.env.CODEBUILD_SOURCE_REPO_URL;
