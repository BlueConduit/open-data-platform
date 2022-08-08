import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiClient } from '@/api/api_client';
import { GeoData } from '@/model/states/model/geo_data';
import { AppDispatch } from '@/model/store';
import { GeoDataState } from '@/model/states/geo_data_state';

const initialState: GeoDataState = {};
const client = new ApiClient();

// Automatically generates action creators and action types that correspond
// to the reducers and state. See: https://redux-toolkit.js.org/api/createslice
const geoSlice = createSlice({
  name: 'geoSlice',
  initialState,
  reducers: {
    getGeoIdsSuccess(state: GeoDataState, action: PayloadAction<GeoData>) {
      state.geoids = { ...state.geoids, ...action.payload };
    },
    getGeoIdsError(state: GeoDataState, action) {
      console.log(`Error fetching geos: ${JSON.stringify(state)} ${JSON.stringify(action)}`);
    },
    geoIdsQueried(state: GeoDataState, action: PayloadAction<GeoData>) {
      const { lat, long } = action.payload;
      state.geoids = { ...state.geoids, lat: lat, long: long };
    },
  },
});

/**
 * Calls API to fetch geo ids based on a lat,long. Emits actions to update state
 * when results are returned.
 * @param lat: The latitude that must intersect with the geos returned
 * @param long: The longitude that must intersect with the geos returned
 */
export const queryLatLong = (lat: string, long: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(geoIdsQueried({ lat: lat, long: long }));

    const apiResponse = await client.getGeoIds(lat, long);
    if (apiResponse.data != null) {
      dispatch(getGeoIdsSuccess(apiResponse.data));
    } else {
      dispatch(getGeoIdsError(apiResponse.error));
    }
  };
};

// See more about reducers:
// https://redux-toolkit.js.org/api/createslice#reducers
export const { geoIdsQueried, getGeoIdsSuccess, getGeoIdsError } = geoSlice.actions;
export default geoSlice.reducer;