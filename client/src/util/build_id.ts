/**
 * Logs information about how this client code was built.
 */
export const logBuildInfo = () => {
  // TODO: Record the VUE_APP_BUILD_TIMESTAMP when the client is compiled, if that's even possible.
  if (process.env.NODE_ENV == 'development')
    console.log('This is a dev server, so the build timestamp is when `npm run serve` starts.');

  // Log build timestamp.
  if (process.env.VUE_APP_BUILD_TIMESTAMP) {
    let buildTimestamp = process.env.VUE_APP_BUILD_TIMESTAMP;
    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
    if (timeZone) buildTimestamp = new Date(buildTimestamp).toLocaleString('en-us', { timeZone });
    console.log('Client built at:', buildTimestamp);
  }

  // Log build commit ID.
  // Other variables can be found at: https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-env-vars.html
  if (process.env.VUE_APP_CODEBUILD_SOURCE_REPO_URL)
    console.log(
      'Client built by CodeBuild from git commit:',
      process.env.VUE_APP_CODEBUILD_SOURCE_REPO_URL,
    );
};
