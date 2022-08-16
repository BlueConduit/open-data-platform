// Strings for the landing page.

/**
 * Strings related to the scorecard-related part of the landing page.
 */
export class ScorecardSearch {
  static HEADER = 'How Safe is My Water?';
  static BODY = `Enter your info to find out the likelihood you have lead in your water supply - and what to do about it.`;
  static CTA_PLACEHOLDER = 'Enter your address or zip code';
  static CTA_BUTTON = 'Check lead status';
}

/**
 * Strings related to the map-related part of the landing page.
 */
export class MapInfo {
  static HEADER = 'Is my community at risk for lead poisoning?';
  static BODY = 'Lead water pipes can pose a serious health risk, particularly for children. We use ' +
    'machine learning to identify at-risk areas. See how your neighborhood compares.';
  static CTA_BUTTON = 'Explore Nationwide Map';
}

/**
 * Strings related to the filter-related part of the landing page.
 */
export class FilterInfo {
  static SUPER_HEADER = 'Tips';
  static HEADER = 'Choosing a water filter';
  static BODY =
    'There are several types of water filters. Choosing the right one depends on your budget and lifestyle.';
  static CTA_BUTTON = 'Learn more';
}

/**
 * Strings related to the filter-related part of the landing page.
 */
export class ResourcesInfo {
  static SUPER_HEADER = 'Resources';
  static HEADER = 'What to do if you have lead pipes';
  static CTA_BUTTON = 'View more in resources';
}

// TODO: modify these to use interface / be a list for dynamic rendering.
interface ResourceMessage {
  header: string,
  body: string,
}

export const RESOURCE_MESSAGES: ResourceMessage[] = [
  {
    header: 'Call water provider',
    body: 'Your water system may be responsible for finding and replacing lead pipes in their ' +
      'system. Enter your address above and we’ll help connect you to your local system to find ' +
      'out your options.',
  },
  {
    header: 'Order filter',
    body: 'Make your tap water safer by ordering a water filter. Some cities have programs for ' +
      'free or discounted filters. Enter your address above and we’ll help identify options.',
  },
  {
    header: 'Amplify your voice',
    body: 'If you and your neighbors are at risk, alerting local community groups and speaking ' +
      'with your representatives are ways to make your concerns heard.',
  },
];