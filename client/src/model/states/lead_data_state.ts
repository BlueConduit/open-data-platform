import { LeadData } from '@/model/states/model/lead_data';
import { StatusState } from '@/model/states/status_state';

/**
 * State of lead data.
 */
export interface LeadDataState {
  data?: LeadData;
  // TODO: move to single status when we have API error to signal no rows returned.
  waterSystemStatus?: StatusState;
  parcelStatus?: StatusState;
}
