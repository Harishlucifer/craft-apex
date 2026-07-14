import { configureStore } from '@reduxjs/toolkit';
import formReducer from './formSlice';  // Adjust the path if necessary

// Configure the store
export const store = configureStore({
  reducer: {
    form: formReducer,
  },
});

// Define the `RootState` type based on the store's reducers
export type RootState = ReturnType<typeof store.getState>;

// Define the `AppDispatch` type, for when you need to dispatch actions with type safety
export type AppDispatch = typeof store.dispatch;
