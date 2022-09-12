/**
 * Information about lead at geo-granularity.
 */
import { City } from '@/model/states/model/geo_data';

export interface LeadData {
  lat?: string,
  long?: string,
  address?: string;
  city?: City;
  pwsId?: string;
  pwsName?: string;
  leadServiceLines?: number;
  serviceLines?: number;
  publicLeadLowPrediction?: number;
  publicLeadHighPrediction?: number;
  privateLeadLowPrediction?: number;
  privateLeadHighPrediction?: number;
}
