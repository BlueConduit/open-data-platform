/**
 * Information about lead at geo-granularity.
 */
export interface LeadData {
  geoId?: string;
  leadServiceLines?: number;
  serviceLines?: number;
  publicLeadLowPrediction?: number;
  publicLeadHighPrediction?: number;
  privateLeadLowPrediction?: number;
  privateLeadHighPrediction?: number;
}
