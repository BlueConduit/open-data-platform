// Strings for the resources page.

interface Recommendation {
  header: string;
  linkText: string;
  url: string;
}

interface FilterType {
  header: string,
  image: string,
}

/**
 * Strings related to the resources page.
 */
export class ResourcesPageMessages {
  static WATER_FILTER_INFO_SECTION_HEADER = 'Choosing the right water filter';
  static WATER_FILTER_INFO_SECTION_SUBHEADER = 'Here are a few things to consider before buying a water ' +
    'filter along with a few questions you may have.';
  static WATER_FILTER_DESCRIPTION = 'You can get filters that cover an entire home or for a ' +
    'single person on the go. There are many options that can fit your budget or needs.';
  static FILTER_TYPES_SECTION_HEADER = 'Filters to fit your needs and budget.';
  static FILTER_TYPES_SECTION_SUBHEADER = 'Explore different types of water filters.';
  static RECOMMENDATIONS_SECTION_HEADER = 'Recommendations';
  static RECOMMENDATIONS_SECTION_SUBHEADER = 'Here are a few sites that have  detailed ' +
    'recommendations before you purchase.';

  static FILTER_TYPES: FilterType[] = [
    {
      header: 'Renter or on a budget? pick a pitcher.',
      image: 'pitcher-filter.png',
    },
    {
      header: 'Under Sink Filters are a great choice for homeowners',
      image: 'under-sink-filter.png',
    },
    {
      header: 'Household Filtration Systems are a best in Class solution',
      image: 'house-filter.png',
    },
    {
      header: 'Shower filters have many benefits',
      image: 'shower-filter.png',
    },
  ];

  static RECOMMENDATIONS: Recommendation[] = [
    {
      header: 'BOS (Best Osmosis Systems)',
      linkText: 'The Best Water Filter for Lead Removal',
      url: 'https://www.best-osmosis-systems.com/water-filters-for-lead-removal/',
    },
    {
      header: 'WaterFilterGuru.com',
      linkText: 'Best Water Filter for Lead Removal of 2022',
      url: 'https://waterfilterguru.com/best-water-filter-for-lead/',
    },
  ];
}
