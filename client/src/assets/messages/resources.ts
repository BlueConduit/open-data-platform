// Strings for the resources page.

interface Message {
  header: string;
  subHeader?: string;
  body?: string;
  image?: string;
}

interface Recommendation {
  header: string;
  linkText: string;
  url: string;
}

/**
 * Strings related to the resources page.
 */
class ResourcesPageMessages {

  // Messages for the water filter information section.
  static WATER_FILTER_INFO_SECTION: Message = {
    header: 'Choosing the right water filter',
    subHeader: 'Here are a few things to consider before buying a water filter along with a few questions you may have.',
    body: `You can get filters that cover an entire home or for a single person on the go. There are many options that can fit your budget or needs.`,
    image: 'resource-image-1.png',
  };

  // Messages for the filter types section.
  static FILTER_TYPES_SECTION: Message = {
    header: 'Filters to fit your needs and budget.',
    subHeader: 'Explore different types of water filters.',
  };

  static FILTER_TYPES: Message[] = [
    {
      header: 'Renter or on a budget? pick a pitcher.',
      subHeader: 'Hold for styling!',
      image: 'pitcher-filter.png',
    },
    {
      header: 'Under Sink Filters are a great choice for homeowners',
      subHeader: 'Hold for styling!',
      image: 'under-sink-filter.png',
    },
    {
      header: 'Household Filtration Systems are a best in Class solution',
      subHeader: 'Hold for styling!',
      image: 'house-filter.png',
    },
    {
      header: 'Shower filters have many benefits',
      subHeader: 'Hold for styling!',
      image: 'shower-filter.png',
    },
  ];

  // Messages for the filter recommendations section.
  static RECOMMENDATIONS_SECTION: Message = {
    header: 'Recommendations',
    subHeader: 'Here are a few sites that have  detailed recommendations before you purchase.',
  };

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

export {
  Message,
  Recommendation,
  ResourcesPageMessages,
};