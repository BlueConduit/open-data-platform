// Strings for the landing page.

interface ResourceMessage {
  header: string;
  body: string;
}

export class LandingPageMessages {
  static SEARCH_SECTION_HEADER = 'Find My Water Status';
  static SEARCH_SECTION_SUBHEADER =
    'If the water pipes connected to your home contain lead, you may be at risk for lead-based ' +
    'health concerns. Enter your location info to understand the risk level for lead water pipes ' +
    'in your home or community – and what to do about it.';
  static GEOLOCATE_PLACEHOLDER_TEXT = 'Enter your address or zip code*';
  static CHECK_LEAD_STATUS_BUTTON_TEXT = 'Check Risk Status';
  static SEARCH_SECTION_FOOTER =
    '*We are still working to gather detailed data for all areas in ' +
    'the US. We do not have address or zip code level data everywhere yet, but we’ll give you the ' +
    'most detailed information possible based on what you provide.';
  static EXPLORE_MAP_SECTION_HEADER = 'Is my community at risk for lead poisoning?';
  static EXPLORE_MAP_SECTION_SUBHEADER =
    'Lead water pipes can pose a serious health risk, particularly for children. ' +
    'We use machine learning to identify at-risk areas. See how your neighborhood compares.';
  static EXPLORE_MAP_BUTTON_TEXT = 'Explore Nationwide Map';
  static CHOOSING_FILTER_SECTION_SUPER_HEADER = 'Tips';
  static CHOOSING_FILTER_SECTION_HEADER = 'Choosing a Water Filter';
  static CHOOSING_FILTER_SECTION_SUBHEADER =
    'There are several types of water filters. Choosing the right one depends on ' +
    'your budget and lifestyle.';
  static LEARN_MORE_BUTTON_TEXT = 'Learn More';
  static RESOURCES_SECTION_SUPER_HEADER = 'Resources';
  static RESOURCES_SECTION_HEADER = 'What To Do If You Have Lead Pipes';
  static VIEW_MORE_RESOURCES_BUTTON_TEXT = 'View More in Resources';

  static RESOURCE_MESSAGES: ResourceMessage[] = [
    {
      header: 'Call water provider',
      body:
        'Your water system may be responsible for finding and replacing lead pipes in their ' +
        'system. Enter your address above and we’ll help connect you to your local system to find ' +
        'out your options.',
    },
    {
      header: 'Order filter',
      body:
        'Make your tap water safer by ordering a water filter. Some cities have programs for ' +
        'free or discounted filters. Enter your address above and we’ll help identify options.',
    },
    {
      header: 'Amplify your voice',
      body:
        'If you and your neighbors are at risk, alerting local community groups and speaking ' +
        'with your representatives are ways to make your concerns heard.',
    },
  ];
}
