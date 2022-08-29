import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiClient } from '@/api/api_client';
import { AppDispatch } from '@/model/store';
import { DemographicDataState } from '@/model/states/demographic_data_state';
import { DemographicData } from '@/model/states/model/demographic_data';
import { GeographicLevel } from '@/model/data_layer';
import { Status } from '@/model/states/status_state';

const initialState: DemographicDataState = {};
const client = new ApiClient();

// Automatically generates action creators and action types that correspond
// to the reducers and state. See: https://redux-toolkit.js.org/api/createslice
const demographicDataSlice = createSlice({
  name: 'demographicDataSlice',
  initialState,
  reducers: {
    demographicsQueried(state: DemographicDataState, action: PayloadAction<DemographicData>) {
      return {
        ...state,
        data: { ...action.payload },
        status: { status: Status.pending },
      };
    },
    getDemographicsSuccess(state: DemographicDataState, action: PayloadAction<DemographicData>) {
      return {
        ...state,
        data: { ...action.payload },
        status: { status: Status.success },
      };
    },
    getDemographicsError(state: DemographicDataState, action) {
      console.log(
        `Error fetching demographics: ${JSON.stringify(state)} ${JSON.stringify(action)}`,
      );
      return {
        status: {
          status: Status.error,
          message: action.payload.error,
          code: action.payload.status,
        },
      };
    },
    demographicDataCleared(state: DemographicDataState, action) {
      return {
        data: {},
      };
    },
  },
});

/**
 * Calls API to fetch demographic data based on geo id. Emits actions to
 * update state when results are returned.
 * @param geographicLevel
 * @param geoId:
 */
export const getDemographicData = (geographicLevel: GeographicLevel, geoId: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(demographicsQueried({ geoId: geoId }));

    const apiResponse = await client.getDemographicData(geographicLevel, geoId);
    if (apiResponse.data != null) {
      dispatch(getDemographicsSuccess(apiResponse.data));
    } else {
      dispatch(getDemographicsError(apiResponse.error));
    }
  };
};

/**
 * Clears DemographicDataState.
 */
export const clearDemographicData = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(demographicDataCleared({}));
  };
};

// See more about reducers:
// https://redux-toolkit.js.org/api/createslice#reducers
export const {
  demographicsQueried,
  getDemographicsSuccess,
  getDemographicsError,
  demographicDataCleared,
} = demographicDataSlice.actions;
export default demographicDataSlice.reducer;
