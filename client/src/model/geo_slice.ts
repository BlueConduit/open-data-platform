import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiClient } from '@/api/api_client';
import { GeoIdentifiers } from '@/model/geo_identifiers';
import { AppDispatch } from '@/model/store';
import { GeoState } from '@/model/geo_state';
import { ScorecardData } from '@/model/scorecard';

const initialState: GeoState = {};
const client = new ApiClient();

// Automatically generates action creators and action types that correspond
// to the reducers and state. See: https://redux-toolkit.js.org/api/createslice
// TODO(breuch): Consider showing user message on error.
const geoSlice = createSlice({
  name: 'geoSlice',
  initialState,
  reducers: {
    getGeoIdsSuccess(state: GeoState, action: PayloadAction<GeoIdentifiers>) {
      state.geoids = { ...state.geoids, ...action.payload };
    },
    getGeoIdsError(state: GeoState, action) {
      console.log(`Error fetching geos: ${state} ${action}`);
    },
    userQueriedGeo(state: GeoState, action: PayloadAction<GeoIdentifiers>) {
      const { lat, long } = action.payload;
      state.geoids = { ...state.geoids, lat: lat, long: long };
    },
    userQueriedWaterSystem(state: GeoState, action: PayloadAction<GeoIdentifiers>) {
      console.log(`User queried water system: ${JSON.stringify(state)} ${JSON.stringify(action)}`);
    },
    getWaterSystemSuccess(state: GeoState, action: PayloadAction<ScorecardData>) {
      console.log(
        `User queried water system successfully: ${JSON.stringify(state)} ${JSON.stringify(
          action,
        )}`,
      );
      state.scorecard = { ...state.scorecard, ...action.payload };
    },
    getWaterSystemError(state: GeoState, action) {
      console.log(`Error fetching water system: ${state} ${action}`);
    },
  },
});

/**
 * Calls API to fetch geo ids based on a lat,long. Emits actions to update state
 * when results are returned.
 * @param lat
 * @param long
 */
export const queryLatLong = (lat: string, long: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(userQueriedGeo({ lat: lat, long: long }));

    const apiResponse = await client.getGeoIdsFromLatLong(lat, long);
    if (apiResponse.data != null) {
      dispatch(getGeoIdsSuccess(apiResponse.data));
    } else {
      dispatch(getGeoIdsError(apiResponse.error));
    }
  };
};

/**
 * Calls API to fetch water system info based on pws id. Emits actions to
 * update state when results are returned.
 * @param pwsId
 */
export const getWaterSystem = (pwsId: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(userQueriedWaterSystem({ pwsId: pwsId }));

    const apiResponse = await client.getWaterSystem(pwsId);
    if (apiResponse.data != null) {
      dispatch(getWaterSystemSuccess(apiResponse.data));
    } else {
      dispatch(getWaterSystemError(apiResponse.error));
    }
  };
};

// See more about reducers:
// https://redux-toolkit.js.org/api/createslice#reducers
export const {
  userQueriedGeo,
  getGeoIdsSuccess,
  getGeoIdsError,
  userQueriedWaterSystem,
  getWaterSystemSuccess,
  getWaterSystemError,
} = geoSlice.actions;
export default geoSlice.reducer;
