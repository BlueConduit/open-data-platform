/**
 * Information about demographics at geo-granularity.
 */
export interface DemographicData {
  // Census geographic identifier. Could be a zip code, county, or state.
  geoId?: string;
  averageHomeAge?: number;
  averageSocialVulnerabilityIndex?: number;
  averageIncome?: number;
}
