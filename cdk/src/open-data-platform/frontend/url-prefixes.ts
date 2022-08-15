// Set of URL prefixes used by Cloudfront to determine where to route requests.
// This is a property of the Frontend, since only the frontend cares about it.

const prefixes = {
  tileServer: '/tiles/v1',
  // No "v1" because this should match the API Gateway stage name, which can't have slashes.
  api: '/api',
};

export default prefixes;

/**
 * Trims the prefix out of the URL.
 * Note: if the prefix exists anywhere in the URL, it will be removed. That's almost certainly not a
 * problem, but something to be aware of (and something to account for in the future)
 * Only present in us-east-1, so see logs there.
 * @param event
 * @returns
 */
export function handler(event: { request: { uri: string } }) {
  // CloudFront Functions doesn't support const: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-features.html
  var request = event.request;
  var beforeUrl = request.uri;
  // This can't reference a variable outside of the handler, since CloudFront only sees the handler.
  // Maybe we could wrap this in a closure or something to address this.
  // TODO: put this in a loop or something cleaner.
  var afterUrl = beforeUrl.replace('/tiles/v1', '');
  console.log(`Removing prefixes from URL. Before: ${beforeUrl}; After: ${afterUrl}`);
  request.uri = afterUrl;
  return request;
}
