/**
 * State of demographic data.
 */
import { DemographicData } from '@/model/states/model/demographic_data';
import { StatusState } from '@/model/states/status_state';

export interface DemographicDataState {
  data?: DemographicData;
  status?: StatusState;
}
