import prefixes from '../../cdk/src/open-data-platform/frontend/url-prefixes';

export const CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,GET',
};

export const trimPath = (path: string): string[] => path.replace(prefixes.api, '').split('/');
