import { StatusState } from '@/model/states/status_state';
import { MapData } from '@/model/states/model/map_data';

/**
 * State of the map.
 */
export interface MapDataState {
  mapData?: MapData;
  status?: StatusState;
}
