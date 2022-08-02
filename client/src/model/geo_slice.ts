import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiClient } from '@/api/api_client';
import { GeoIdentifiers } from '@/model/geo_identifiers';
import { AppDispatch } from '@/model/store';

/**
 * State of geo selection.
 */
interface GeoState {
  geoids?: GeoIdentifiers;
}

const initialState: GeoState = {};
const client = new ApiClient();

// Automatically generates action creators and action types that correspond
// to the reducers and state. See: https://redux-toolkit.js.org/api/createslice
const geoSlice = createSlice({
  name: 'geoSlice',
  initialState,
  reducers: {
    geoIdsFetchedSuccess(state: GeoState, action: PayloadAction<GeoIdentifiers>) {
      state.geoids = { ...state.geoids, ...action.payload };
    },
    geoIdsFetchedError(state: GeoState, action) {
      // TODO(breuch): Consider showing user message.
      console.log(`Error fetching geos: ${state} ${action}`);
    },
    userQueriedGeo(state: GeoState, action: PayloadAction<GeoIdentifiers>) {
      const { lat, long } = action.payload;
      state.geoids = { ...state.geoids, lat: lat, long: long };
    },
  },
});

/**
 * Calls API to fetch geo ids based on a lat,long. Emits actions to update state
 * when results are returned.
 * @param lat
 * @param long
 */
export const getGeoIdsFromLatLong = (lat: string, long: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(userQueriedGeo({ lat: lat, long: long }));

    const apiResponse = await client.getGeoIdsFromLatLong(lat, long);
    if (apiResponse.data != null) {
      dispatch(geoIdsFetchedSuccess(apiResponse.data));
    } else {
      dispatch(geoIdsFetchedError(apiResponse.error));
    }
  };
};

// See more about reducers:
// https://redux-toolkit.js.org/api/createslice#reducers
export const { userQueriedGeo, geoIdsFetchedSuccess, geoIdsFetchedError } = geoSlice.actions;
export default geoSlice.reducer;
