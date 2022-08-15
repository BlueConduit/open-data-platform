import prefixes from '../../cdk/src/open-data-platform/frontend/url-prefixes';

// TODO: Consider locking this down or outright elinimating it, since the lambdas are not directly
// publically accessible.
export const CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,GET',
};

export const trimPath = (path: string): string[] => path.replace(prefixes.api, '').split('/');
