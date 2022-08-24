const commitUrl = 'https://github.com/BlueConduit/open-data-platform/commit';

/**
 * Logs information about how this client code was built.
 */
export const logBuildInfo = () => {
  // Log build timestamp.
  console.log('Client built at:', document.documentElement.dataset.buildTimestampUtc);
  // Log build commit ID.
  // Other variables can be found at: https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-env-vars.html
  console.log(process.env);
  if (process.env.CODEBUILD_RESOLVED_SOURCE_VERSION)
    console.log(
      `Client built by CodeBuild from Git commit: ${commitUrl}/${process.env.CODEBUILD_RESOLVED_SOURCE_VERSION}`,
    );
};
