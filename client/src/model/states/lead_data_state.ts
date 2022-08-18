import { LeadData } from '@/model/states/model/lead_data';
import { StatusState } from '@/model/states/status_state';

/**
 * State of lead data.
 */
export interface LeadDataState {
  data?: LeadData;
  status?: StatusState;
}
