import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiClient } from '@/api/api_client';
import { GeoData, GeoType } from '@/model/states/model/geo_data';
import { AppDispatch } from '@/model/store';
import { GeoDataState } from '@/model/states/geo_data_state';
import { Status } from '@/model/states/status_state';

const initialState: GeoDataState = {};
const client = new ApiClient();

// Automatically generates action creators and action types that correspond
// to the reducers and state. See: https://redux-toolkit.js.org/api/createslice
const geoSlice = createSlice({
  name: 'geoSlice',
  initialState,
  reducers: {
    getGeoIdsSuccess(state: GeoDataState, action: PayloadAction<GeoData>) {
      return {
        ...state,
        geoids: { ...state.geoids, ...action.payload },
        status: { status: Status.success },
      };
    },
    getGeoIdsError: (state: GeoDataState, action) => {
      console.log(`Error fetching geos: ${JSON.stringify(state)} ${JSON.stringify(action)}`);
      return {
        status: {
          status: Status.error,
          message: action.payload.error,
          code: action.payload.status,
        },
      };
    },
    geoIdsQueried: (state: GeoDataState, action: PayloadAction<GeoData>) => {
      return {
        ...state,
        geoids: { ...state.geoids, ...action.payload },
        status: { status: Status.pending },
      };
    },
    geoIdsCleared(state: GeoDataState, _: PayloadAction<GeoData>) {
      return {
        geoids: {},
        status: { status: Status.success },
      };
    },
  },
});

/**
 * Calls API to fetch geo ids based on a lat,long. Emits actions to update state
 * when results are returned.
 * @param lat: The latitude that must intersect with the geos returned
 * @param long: The longitude that must intersect with the geos returned
 * @param geoType: Granularity of the query
 */
export const queryLatLong = (lat: string, long: string, geoType: GeoType) => {
  return async (dispatch: AppDispatch) => {
    dispatch(geoIdsCleared({}));
    dispatch(geoIdsQueried({ lat: lat, long: long, geoType: geoType }));
    const apiResponse = await client.getGeoIds(lat, long);
    if (apiResponse.data != null) {
      dispatch(getGeoIdsSuccess(apiResponse.data));
    } else {
      dispatch(getGeoIdsError(apiResponse.error ?? { error: 'Unknown error' }));
    }
  };
};

/**
 * Clears GeoDataState.
 */
export const clearGeoIds = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(geoIdsCleared({}));
  };
};

// See more about reducers:
// https://redux-toolkit.js.org/api/createslice#reducers
export const { geoIdsQueried, getGeoIdsSuccess, getGeoIdsError, geoIdsCleared } = geoSlice.actions;
export default geoSlice.reducer;
