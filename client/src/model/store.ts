import { inject, computed } from 'vue';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import demographicDataReducer from '@/model/slices/demographic_data_slice';
import geosReducer from '@/model/slices/geo_data_slice';
import leadDataReducer from '@/model/slices/lead_data_slice';
import mapDataReducer from '@/model/slices/map_data_slice';
import { storeKey } from '@/model/store_plugin';

// Combines all reducers to single one.
const rootReducer = combineReducers({
  geos: geosReducer,
  leadData: leadDataReducer,
  demographicData: demographicDataReducer,
  mapData: mapDataReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

// Emits events for reducers.
export const dispatch = store.dispatch;

// Same as https://react-redux.js.org/api/hooks#useselector
// Allows you to extract data from the Redux store state.
export const useSelector = <State extends RootState = RootState>(
  fn: (state: State) => State[keyof State],
) => {
  const rootStore = inject(storeKey) as { state: RootState };
  return computed(() => fn(rootStore.state as State));
};

// Infer the `RootState` and `AppDispatch` types from the store itself
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export { store, RootState, AppDispatch };
