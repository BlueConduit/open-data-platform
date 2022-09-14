import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiClient } from '@/api/api_client';
import { AppDispatch } from '@/model/store';
import { LeadData } from '@/model/states/model/lead_data';
import { LeadDataState } from '@/model/states/lead_data_state';
import { Status } from '@/model/states/status_state';

const initialState: LeadDataState = {};
const client = new ApiClient();

// Automatically generates action creators and action types that correspond
// to the reducers and state. See: https://redux-toolkit.js.org/api/createslice
const leadDataSlice = createSlice({
  name: 'leadDataSlice',
  initialState,
  reducers: {
    parcelQueried(state: LeadDataState, action: PayloadAction<LeadData>) {
      return {
        ...state,
        data: { ...state.data, ...action.payload },
        parcelStatus: { status: Status.pending },
      };
    },
    getParcelSuccess(state: LeadDataState, action: PayloadAction<LeadData>) {
      return {
        ...state,
        data: { ...state.data, ...action.payload },
        parcelStatus: { status: Status.success },
      };
    },
    getParcelError: (state: LeadDataState, action) => {
      console.log(
        `Error fetching lead data for parcel: ${JSON.stringify(state)} ${JSON.stringify(action)}`,
      );
      return {
        parcelStatus: {
          status: Status.error,
          message: action.payload.error,
          code: action.payload.status,
        },
      };
    },
    getWaterSystemSuccess(state: LeadDataState, action: PayloadAction<LeadData>) {
      return {
        ...state,
        data: { ...state.data, ...action.payload },
        waterSystemStatus: { status: Status.success },
      };
    },
    getWaterSystemError: (state: LeadDataState, action) => {
      console.log(
        `Error fetching lead data for water system: ${JSON.stringify(state)} ${JSON.stringify(
          action,
        )}`,
      );
      return {
        waterSystemStatus: {
          status: Status.error,
          message: action.payload.error,
          code: action.payload.status,
        },
      };
    },
    waterSystemQueried(state: LeadDataState, action: PayloadAction<LeadData>) {
      return {
        ...state,
        data: { ...state.data, ...action.payload },
        waterSystemStatus: { status: Status.pending },
      };
    },
    leadDataCleared(_: LeadDataState, __: PayloadAction<LeadData>) {
      return {
        data: {},
        parcelStatus: { status: Status.success },
        waterSystemStatus: { status: Status.success },
      };
    },
  },
});

/**
 * Calls API to fetch parcel info based on lat,long intersection. Emits actions
 * to update state when results are returned.
 * @param lat
 * @param long
 */
export const getParcel = (lat: string, long: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(parcelQueried({ lat: lat, long: long }));

    const apiResponse = await client.getParcel(lat, long);
    if (apiResponse.data != null) {
      dispatch(getParcelSuccess(apiResponse.data));
    } else {
      dispatch(getParcelError(apiResponse.error));
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
    dispatch(waterSystemQueried({ pwsId: pwsId }));

    const apiResponse = await client.getWaterSystem(pwsId);
    if (apiResponse.data != null) {
      dispatch(getWaterSystemSuccess(apiResponse.data));
    } else {
      dispatch(getWaterSystemError(apiResponse.error));
    }
  };
};

/**
 * Clears LeadDataState.
 */
export const clearLeadData = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(leadDataCleared({}));
  };
};

// See more about reducers:
// https://redux-toolkit.js.org/api/createslice#reducers
export const {
  getParcelSuccess,
  getParcelError,
  waterSystemQueried,
  getWaterSystemSuccess,
  getWaterSystemError,
  leadDataCleared,
  parcelQueried,
} = leadDataSlice.actions;
export default leadDataSlice.reducer;
