// Strings for the resources page.

/**
 * Strings related to the water filter information part of the resources page.
 */
class WaterFilterInfo {
  static HEADER = 'Choosing the right water filter';
  static SUB_HEADER = 'Here are a few things to consider before buying a water filter along with a few questions you may have.';
  static BODY = `You can get filters that cover an entire home or for a single person on the go. There are many options that can fit your budget or needs.`;
}

class FilterTypeInfo {
  static HEADER = 'Filters to fit your needs and budget.';
  static SUB_HEADER = 'Explore different types of water filters.';
  static BODY = '';
}

class PitcherFilterInfo {
  static HEADER = 'Renter or on a budget? pick a pitcher.';
  // TODO: remove this.
  static SUB_HEADER = 'Hold for styling!';
}

class SinkFilterInfo {
  static HEADER = 'Under Sink Filters are a great choice for homeowners';
  // TODO: remove this.
  static SUB_HEADER = 'Hold for styling!';
}

class HouseholdFilterInfo {
  static HEADER = 'Household Filtration Systems are a best in Class solution';
  // TODO: remove this.
  static SUB_HEADER = 'Hold for styling!';
}

class ShowerFilterInfo {
  static HEADER = 'Shower filters have many benefits';
  // TODO: remove this.
  static SUB_HEADER = 'Hold for styling!';
}

class RecommendationsMessages {
  static HEADER = 'Recommendations';
  static SUB_HEADER = 'Here are a few sites that have  detailed recommendations before you purchase.';
}

interface Recommendation {
  title: string;
  linkText: string;
  url: string;
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    title: 'BOS (Best Osmosis Systems)',
    linkText: 'The Best Water Filter for Lead Removal',
    url: 'https://www.best-osmosis-systems.com/water-filters-for-lead-removal/',
  },
  {
    title: 'WaterFilterGuru.com',
    linkText: 'Best Water Filter for Lead Removal of 2022',
    url: 'https://waterfilterguru.com/best-water-filter-for-lead/',
  },
];

export {
  WaterFilterInfo,
  FilterTypeInfo,
  PitcherFilterInfo,
  SinkFilterInfo,
  HouseholdFilterInfo,
  ShowerFilterInfo,
  RecommendationsMessages,
  RECOMMENDATIONS,
};