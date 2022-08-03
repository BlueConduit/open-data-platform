import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiClient } from '@/api/api_client';
import { AppDispatch } from '@/model/store';
import { LeadData } from '@/model/lead_data';
import { LeadDataState } from '@/model/states/lead_data_state';

const initialState: LeadDataState = {};
const client = new ApiClient();

// Automatically generates action creators and action types that correspond
// to the reducers and state. See: https://redux-toolkit.js.org/api/createslice
// TODO(breuch): Consider showing user message on error.
const leadDataSlice = createSlice({
  name: 'leadDataSlice',
  initialState,
  reducers: {
    waterSystemQueried(state: LeadDataState, action: PayloadAction<LeadData>) {
      console.log(`User queried water system: ${state} ${action}`);
    },
    getWaterSystemSuccess(state: LeadDataState, action: PayloadAction<LeadData>) {
      console.log(`User queried water system: ${JSON.stringify(state)} ${JSON.stringify(action)}`);
      state.data = { ...state.data, ...action.payload };
    },
    getWaterSystemError(state: LeadDataState, action) {
      console.log(`Error fetching water system: ${state} ${action}`);
    },
  },
});

/**
 * Calls API to fetch water system info based on pws id. Emits actions to
 * update state when results are returned.
 * @param pwsId
 */
export const getWaterSystem = (pwsId: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(waterSystemQueried({ geoId: pwsId }));

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
export const { waterSystemQueried, getWaterSystemSuccess, getWaterSystemError } =
  leadDataSlice.actions;
export default leadDataSlice.reducer;
