/**
 * Text to use on the scorecard summary page.
 */
export class ScorecardMessages {
  static ADDITIONAL_STEPS_HEADER = 'Additional steps you can take';
  static ADDITIONAL_STEPS_SUBHEADER =
    'The fastest way to protect your home ' +
    'is to use a water filter. If you don’t already own one, learn more about ' +
    'things to consider when choosing a filter that fits your needs.';
  static AREA_DEPRIVATION_INDEX = 'Area Deprivation Index';
  static AREA_DEPRIVATION_INDEX_EXPLAINED =
    'The Area Deprivation Index (ADI) is based on a measure created by the Health Resources & ' +
    'Services Administration. It includes factors like income, education, employment, and housing quality.';
  static AVERAGE_INCOME = 'Average income';
  static COPY_TO_CLIPBOARD = 'Copy scorecard to clipboard';
  static EXPLORE_MAP_PAGE_EXPLAINER =
    'You can learn more about what’s happening in your community, state, ' +
    'or the United States by exploring the Nationwide Map. ';
  static GET_WATER_SCORE = 'Search your address to get the likelihood of lead in your neighborhood';
  static HIGH_LIKELIHOOD = 'High likelihood';
  static HIGHLY_LIKELY = 'highly likely';
  static MEDIUM_LIKELIHOOD = 'Medium likelihood';
  static NOT_ENOUGH_DATA_AVAILABLE = 'Not enough data available';
  static NOT_ENOUGH_DATA_EXPLAINED =
    'There isn’t sufficient data available about your area to confidently give a status.';
  static LESS_DISADVANTAGED = 'Less disadvantaged';
  static LOW_LIKELIHOOD = 'Low likelihood';
  static HIGHLY_DISADVANTAGED = 'Highly disadvantaged';
  static NOT_LIKELY = 'not likely';
  static HIGHER_INCOME = 'Higher income';
  static HOME_AGE = 'Average home age';
  static HOME_AGE_EXPLAINED =
    'The year homes were built influences the likelihood they are constructed with lead pipes';
  static INCOME_LEVEL = 'Average income level';
  static INCOME_LEVEL_EXPLAINED = 'Income levels correlate to the likelihood of lead.';
  static LEAD_LIKELIHOOD_EXPLAINED =
    'Based on age of homes, historical service line data, and information ' +
    'collected from your utility and other sources';
  static LEARN_MORE = 'Learn more';
  static LOWER_INCOME = 'Lower income';
  static LSLR_HEADER = 'Lead Service Line Replacement Pilot';
  static LSLR_SUBHEADER = 'Learn more about lead service replacements happening in your area ' +
    'and your eligibility status.';
  static RESEARCH_WATER_FILTERS = 'Research water filters';
  static SCORECARD_SUMMARY_PANEL_SUBHEADER =
    'In addition to information from your water system, your score is also based on ' +
    'these statistics for your zip code:';
  static SHARE_LEAD_OUT = 'Share LeadOut and help others know their status';
  static SOMEWHAT_DISADVANTAGED = 'Somewhat disadvantaged';
  static SOMEWHAT_LIKELY = 'somewhat likely';
  static TAKE_ACTION_HEADER = 'Take action';
  static WANT_TO_KNOW_MORE = 'Want to know more?';
  static WATER_SYSTEM_DESCRIPTION = 'This is the water system which owns the service lines that ' +
    'provide water to this area.';

  static SCORECARD_SUMMARY_PANEL_HEADER = (zipCode?: string) =>
    zipCode != null ? `Understanding your score for ${zipCode}` : 'Understanding your score';

  static PREDICTION_EXPLANATION = (prediction: string) =>
    `While it’s impossible to be certain without digging into the ground, your location is 
    ${prediction} to be affected`;

  static PREDICTION_DESCRIPTION = (leadLikelihood: string | null, area: string) =>
    leadLikelihood == null ?
      'There isn’t sufficient data available about this zip code to confidently give a status.' :
      `Homes in this ${area} have a ${leadLikelihood.toLowerCase()} of lead service lines. 
      Individual homes may or may not have lead pipes present.`;
}
