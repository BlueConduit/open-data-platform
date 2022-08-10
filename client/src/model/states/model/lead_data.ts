/**
 * Information about lead at geo-granularity.
 */
export interface LeadData {
  address?: string;
  pwsId?: string;
  leadServiceLines?: number;
  serviceLines?: number;
  publicLeadLowPrediction?: number;
  publicLeadHighPrediction?: number;
  privateLeadLowPrediction?: number;
  privateLeadHighPrediction?: number;
}
