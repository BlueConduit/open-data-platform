// Strings for the landing page.

import { Titles } from '@/assets/messages/common';

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
  static HEADER = 'Get up to date information about lead service lines';
  static BODY =
    'Stay informed by using the LeadOut Nationwide Map by exploring this ever-growing data set of lead piplines, DEP violations, demographics, and more.';
  static CTA_BUTTON = Titles.EXPLORE_NATION_WIDE_MAP;
}

/**
 * Strings related to the filter-related part of the landing page.
 */
export class FilterInfo {
  static SUPER_HEADER = 'Take Action';
  static HEADER = 'Chosing a water filter';
  static BODY =
    'There are several types of water filters. Choosing the right one depends on your budget and lifestyle.';
  static CTA_BUTTON = 'Learn more about water filters';
}
