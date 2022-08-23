/**
 * Text to use on the scorecard summary page.
 */
export class ScorecardMessages {
  static ADDITIONAL_STEPS_HEADER = 'Additional steps you can take';
  static ADDITIONAL_STEPS_SUBHEADER =
    'The fastest way to protect your home ' +
    'is to use a water filter. If you don’t already own one, learn more about ' +
    'things to consider when choosing a filter that fits your needs.';
  static COPY_TO_CLIPBOARD = 'Copy scorecard to clipboard';
  static EXPLORE_MAP_PAGE_EXPLAINER =
    'You can learn more about what’s happening in your community, state, ' +
    'or the United States by exploring the Nationwide Map. ';
  static GET_WATER_SCORE =
    'Search your address to get the likelihood of lead ' + 'in your neighborhood';
  static HIGH_LIKELIHOOD = 'High likelihood';
  static HIGHLY_LIKELY = 'highly likely';
  static MEDIUM_LIKELIHOOD = 'Medium likelihood';
  static NOT_ENOUGH_DATA_AVAILABLE = 'Not enough data available';
  static NOT_ENOUGH_DATA_EXPLAINED =
    'There isn’t sufficient data available about your area to confidently give a status.';
  static LOW_LIKELIHOOD = 'Low likelihood';
  static NOT_LIKELY = 'not likely';
  static HOME_AGE = 'Home age';
  static HOME_AGE_EXPLAINED =
    'The year your home was built influences the likelihood it was ' +
    'constructed with lead pipes';
  static INCOME_LEVEL = 'Income level';
  static INCOME_LEVEL_EXPLAINED =
    'Income levels correlate to the likelihood ' + 'of lead. Learn more.';
  static LEAD_LIKELIHOOD_EXPLAINED =
    'Based on age of homes, historical service line data, and information ' +
    'collected from your utility and other sources';
  static RESEARCH_WATER_FILTERS = 'Research water filters';
  static SCORECARD_SUMMARY_PANEL_HEADER = 'Understanding your score';
  static SCORECARD_SUMMARY_PANEL_SUBHEADER =
    'In addition to information from your water system, your score is also based on:';
  static SHARE_LEAD_OUT = 'Share LeadOut and help others know their status';
  static SOCIAL_VULNERABILITY_INDEX = 'Social Vulnerability Index';
  static SOCIAL_VULNERABILITY_INDEX_EXPLAINED =
    'Social vulnerability refers to the potential negative effects on ' +
    'communities caused by external stresses on human health';
  static SOMEWHAT_LIKELY = 'somewhat likely';
  static TAKE_ACTION_HEADER = 'Take action';
  static WANT_TO_KNOW_MORE = 'Want to know more?';

  static PREDICTION_EXPLANATION = (prediction: string) =>
    `While it’s impossible to be certain without digging into the ground, your location is 
    ${prediction} to be affected`;
}
