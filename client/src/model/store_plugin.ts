import { App, inject, reactive } from 'vue';
import { EnhancedStore } from '@reduxjs/toolkit';
import { RootState } from '@/model/store';

const storeKey = Symbol('store');

// Plugin to mount store's state to app.
const createRedux = (store: EnhancedStore) => {
  const rootStore = reactive<{ state: RootState }>({
    state: store.getState(),
  });
  return {
    install: (app: App) => {
      app.provide<{ state: RootState }>(storeKey, rootStore);

      store.subscribe(() => {
        rootStore.state = store.getState();
      });
    },
  };
};

export { storeKey, createRedux };
