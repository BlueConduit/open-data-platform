/**
 * Information about lead at geo-granularity.
 */
import { City } from '@/model/states/model/geo_data';

export interface LeadData {
  address?: string;
  city?: City;
  pwsId?: string;
  leadServiceLines?: number;
  serviceLines?: number;
  publicLeadLowPrediction?: number;
  publicLeadHighPrediction?: number;
  privateLeadLowPrediction?: number;
  privateLeadHighPrediction?: number;
}
