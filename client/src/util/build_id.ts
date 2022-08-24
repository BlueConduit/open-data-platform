/**
 * Logs information about how this client code was built.
 */
export const logBuildInfo = () => {
  // Log build timestamp.
  console.log('Client built at:', document.documentElement.dataset.buildTimestampUtc);
  // Log build commit ID.
  // Other variables can be found at: https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-env-vars.html
  if (process.env.VUE_APP_CODEBUILD_SOURCE_REPO_URL)
    console.log(
      'Client built by CodeBuild from git commit:',
      process.env.VUE_APP_CODEBUILD_SOURCE_REPO_URL,
    );
};
