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
  if (process.env.VUE_APP_CODEBUILD_SOURCE_REPO_URL)
    console.log(
      'Client built by CodeBuild from git commit:',
      process.env.VUE_APP_CODEBUILD_SOURCE_REPO_URL,
    );
  // Or manually construct the URL if not present.
  else if (process.env.VUE_APP_CODEBUILD_RESOLVED_SOURCE_VERSION)
    console.log(
      'Client built by CodeBuild from git commit:',
      `https://github.com/BlueConduit/open-data-platform/commit/${process.env.VUE_APP_CODEBUILD_RESOLVED_SOURCE_VERSION}`,
    );
};
