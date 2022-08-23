import { GeoData } from '@/model/states/model/geo_data';
import { StatusState } from '@/model/states/status_state';

/**
 * State of geo selection.
 */
export interface GeoDataState {
  geoids?: GeoData;
  status?: StatusState;
}
