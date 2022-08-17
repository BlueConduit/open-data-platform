// Styles for resources page.

interface Style {
  backgroundColor?: string;
  headerTextColor?: string;
  subHeaderTextColor?: string;
  bodyTextColor?: string;
  headerTextSize?: string;
  subheaderTextSize?: string;
  height?: string;
}

class LandingPageStyles {
  static DEFAULT_STYLE: Style = {
    backgroundColor: '#FFFFFF',
    headerTextColor: '#464646',
    subHeaderTextColor: '#464646',
    headerTextSize: '40px',
    subheaderTextSize: '20px',
    height: '960px',
  };

  static SEARCH_SECTION_STYLE: Style = {
    backgroundColor: '#1e2329',
    headerTextColor: '#FFFFFF',
    subHeaderTextColor: '#FFFFFF',
    headerTextSize: '54px',
    subheaderTextSize: '20px',
    height: '803px',
  };

  static FILTER_SECTION_STYLE: Style = {
    backgroundColor: '#05A8F4',
    headerTextColor: '#FFFFFF',
    subHeaderTextColor: '#FFFFFF',
    headerTextSize: '40px',
    subheaderTextSize: '20px',
    height: '457px',
  };

  static RESOURCES_SECTION_STYLE: Style = {
    backgroundColor: '#E1F5FE',
    headerTextColor: '#212121',
    subHeaderTextColor: '#757575',
    headerTextSize: '40px',
    subheaderTextSize: '24px',
    height: '547px',
  };
}

class ResourcesPageStyles {
  static DEFAULT_STYLE: Style = {
    backgroundColor: '#FFFFFF', // White.
    headerTextColor: '#464646', // Dark grey.
    subHeaderTextColor: '#252525', // Darker grey.
  };

  static RECOMMENDATIONS_STYLE: Style = {
    backgroundColor: '#05A8F4', // Light blue.
    headerTextColor: '#FFFFFF', // White.
    subHeaderTextColor: '#FFFFFF', // White.
  };
}

export { LandingPageStyles, ResourcesPageStyles, Style };
