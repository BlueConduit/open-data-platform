import { inject, computed } from 'vue';
import { configureStore } from '@reduxjs/toolkit';
import geosReducer from '@/model/geo_slice';
import { storeKey } from '@/model/store_plugin';

const store = configureStore({ reducer: { geosReducer } });
// Emits events for reducers.
export const dispatch = store.dispatch;

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
