import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch } from '@/model/store';
import { Status } from '@/model/states/status_state';
import { MapDataState } from '@/model/states/map_data_state';
import { MapData, ZoomLevel } from '@/model/states/model/map_data';
import { DataLayer, MapLayer } from '@/model/data_layer';
import { leadServiceLinesByWaterSystemLayer } from '@/data_layer_configs/lead_service_lines_by_water_systems_config';
import { leadAndCopperViolationsByCountyDataLayer } from '@/data_layer_configs/lead_and_copper_violations_by_water_system_config';
import { populationDataByCensusBlockLayer } from '@/data_layer_configs/population_by_census_block_config';
import { leadServiceLinesByParcelLayer } from '@/data_layer_configs/lead_service_lines_by_parcel_config';

export const ALL_DATA_LAYERS = new Map<MapLayer, DataLayer>([
  [MapLayer.LeadServiceLineByWaterSystem, leadServiceLinesByWaterSystemLayer],
  [MapLayer.LeadAndCopperRuleViolationsByWaterSystem, leadAndCopperViolationsByCountyDataLayer],
  [MapLayer.PopulationByCensusBlock, populationDataByCensusBlockLayer],
  [MapLayer.LeadServiceLineByParcel, leadServiceLinesByParcelLayer],
]);

const initialState: MapDataState = { mapData: { dataLayers: Array.from(ALL_DATA_LAYERS.keys()) } };

// Automatically generates action creators and action types that correspond
// to the reducers and state. See: https://redux-toolkit.js.org/api/createslice
const mapSlice = createSlice({
  name: 'mapSlice',
  initialState,
  reducers: {
    setMapDataSuccess: (state: MapDataState, action: PayloadAction<MapData>) => {
      console.log(`Successfully updated map : ${JSON.stringify(state)} ${JSON.stringify(action)}`);

      return {
        ...state,
        mapData: { ...state.mapData, ...action.payload },
        status: { status: Status.success },
      };
    },
    setMapDataError: (state: MapDataState, action: PayloadAction<any>) => {
      console.log(`Error updating map : ${JSON.stringify(state)} ${JSON.stringify(action)}`);
      state.status = {
        status: Status.error,
        message: action.payload.error,
      };
    },
    mapDataCleared: () => {
      return {
        data: {},
        status: { status: Status.success },
      };
    },
  },
});

/**
 * Change the map's data layer.
 */
export const setCurrentDataLayer = (layerId: string) => {
  return async (dispatch: AppDispatch) => {
    if (layerId == null) {
      dispatch(setMapDataError({ error: 'Invalid map state' }));
    } else {
      dispatch(setMapDataSuccess({ currentDataLayerId: layerId as MapLayer }));
    }
  };
};

/**
 * Change the zoom level.
 */
export const setZoom = (zoom: number) => {
  return async (dispatch: AppDispatch) => {
    if (zoom == null) {
      dispatch(setMapDataError({ error: 'Invalid zoom' }));
    } else {
      dispatch(setMapDataSuccess({ zoom: zoom }));
    }
  };
};

export const setZoomLevel = (level: ZoomLevel) => {
  return async (dispatch: AppDispatch) => {
    dispatch(
      setMapDataSuccess({
        zoomLevel: level,
      }),
    );
  };
};

/**
 * Clears MapDataState.
 */
export const clearMapData = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(mapDataCleared());
  };
};

// See more about reducers:
// https://redux-toolkit.js.org/api/createslice#reducers
export const { mapDataCleared, setMapDataSuccess, setMapDataError } = mapSlice.actions;
export default mapSlice.reducer;
