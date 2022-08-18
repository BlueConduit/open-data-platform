// Styles for resources page.

// TODO: Remove this file and switch to string map if needed.
interface Style {
  backgroundColor?: string;
  headerTextColor?: string;
  subHeaderTextColor?: string;
  bodyTextColor?: string;
  headerTextSize?: string;
  subheaderTextSize?: string;
  height?: string;
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

export { ResourcesPageStyles, Style };
