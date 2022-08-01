import { configureStore } from '@reduxjs/toolkit';
import geosReducer from '@/model/geo_slice';

const store = configureStore({ reducer: { geosReducer } });
// Emits events for reducers.
export const dispatch = store.dispatch;

// Infer the `RootState` and `AppDispatch` types from the store itself
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export { store, RootState, AppDispatch };
