/**
 * Text to use on the scorecard summary page.
 */
export class ScorecardMessages {
  static ADDITIONAL_STEPS_HEADER = 'Protect your home';
  static ADDITIONAL_STEPS_SUBHEADER =
    'Worried about your lead risk status? One of the best ways to remedy your ' +
    'water supply is to order a filter.';
  static AREA_DEPRIVATION_INDEX = 'Area Deprivation';
  static AREA_DEPRIVATION_INDEX_EXPLAINED =
    'The ADI is based on 17 variables that describe socioeconomic disadvantage ' +
    'based on income, education, household characteristics, and housing created ' +
    'by the Health Resources and Services Administration (HRSA).';
  static AVERAGE_INCOME = 'Income level';
  static CONTACT_YOUR_CITY_HEADER = 'Contact your city';
  static CONTACT_YOUR_CITY_SUBHEADER =
    'Get more information or remediate any lead issues is to contact your city.';
  static COPIED_TO_CLIPBOARD = 'Copied!';
  static COPY_TO_CLIPBOARD = 'Copy link to share';
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
  static HOME_AGE = 'Age of Your Home';
  static HOME_AGE_EXPLAINED =
    'Older homes are more likely to be connected to lead water pipes than newer ' +
    'homes. We use the average home age in your zip code to help determine your status. ';
  static INCOME_LEVEL = 'Average income level';
  static INCOME_LEVEL_EXPLAINED =
    'Income levels are also a determining factor that ' +
    'could indicate the possibility of lead in a neighborhood or zip code.\n \n' +
    'This information was taken from U.S. Census data and is measured by zip code ' +
    'and not this specific address.';
  static LEAD_LIKELIHOOD_EXPLAINED =
    'Based on age of homes, historical service line data, and information ' +
    'collected from your utility and other sources';
  static LEARN_MORE = 'Learn more';
  static LOWER_INCOME = 'Lower income';
  static LSLR_HEADER = 'Lead Service Line Replacement Pilot';
  static LSLR_SUBHEADER =
    'Learn more about lead service replacements happening in your area ' +
    'and your eligibility status.';
  static RESEARCH_WATER_FILTERS = 'Research water filters';
  static SCORECARD_SUMMARY_PANEL_SUBHEADER =
    'In addition to information from your water system, your score is also based on ' +
    'these statistics for your zip code:';
  static SHARE_LEAD_OUT = 'Share your lead score';
  static SHARE_LEAD_OUT_SUBHEADER =
    'Share LeadOut to help your friends and family ' +
    'know their risk status and what actions they can take.';
  static SOMEWHAT_DISADVANTAGED = 'Somewhat disadvantaged';
  static SOMEWHAT_LIKELY = 'somewhat likely';
  static TAKE_ACTION_HEADER = "Here's what you can do today";
  static WANT_TO_KNOW_MORE = 'Want to know more?';
  static WATER_SYSTEM_DESCRIPTION =
    'This is the water system which owns the service lines that provide water to this area.';

  static SCORECARD_SUMMARY_PANEL_HEADER = (zipCode: string | null) =>
    zipCode != null ? `Understanding your score for ${zipCode}` : 'Understanding your score';

  static PREDICTION_EXPLANATION = (prediction: string) =>
    `While it’s impossible to be certain without digging into the ground, your location is 
    ${prediction} to be affected`;

  static PREDICTION_DESCRIPTION = (leadLikelihood: string | null, area: string) =>
    leadLikelihood == null
      ? 'There isn’t sufficient data available about this zip code to confidently give a status.'
      : `Homes in this ${area} have a ${leadLikelihood.toLowerCase()} of lead service lines. 
      Individual homes may or may not have lead pipes present.`;
}
