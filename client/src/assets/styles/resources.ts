interface Style {
  backgroundColor: string;
  headerTextColor: string;
  subHeaderTextColor: string;
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

export {
  Style,
  ResourcesPageStyles,
};