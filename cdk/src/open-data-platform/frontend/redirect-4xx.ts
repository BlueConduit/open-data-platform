/**
 * Repalces the request URL to point to the home route if it should not go to the tileserver or API.
 * @param event
 */
export default function handler(event: { request: { uri: string } }) {
  // This is a manually maintained list of URL prefixes that shouldn't be redirected.
  if (
    // Tile server.
    event.request.uri.startsWith('/tiles') ||
    // API.
    event.request.uri.startsWith('/api') ||
    event.request.uri.startsWith('/prod') ||
    // Static files.
    event.request.uri.startsWith('/js') ||
    event.request.uri.startsWith('/css') ||
    event.request.uri.startsWith('/img') ||
    event.request.uri.startsWith('/favicon')
  )
    return event.request;
  var beforeUrl = event.request.uri;
  var afterUrl = '/';
  console.log(`Redirecting the request. Before: ${beforeUrl}; After: ${afterUrl}`);
  event.request.uri = afterUrl;
  return event.request;
}
