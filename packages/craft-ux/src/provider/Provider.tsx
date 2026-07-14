import React, { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store as defaultStore } from '../redux/store';  // Import your store configuration
import { EnhancedStore } from '@reduxjs/toolkit';

// Define the props for the Provider component
interface ProviderProps {
  children: ReactNode;  // Correctly type children
  store?: EnhancedStore;  // Use the correct type for the Redux store
}

// Explicitly type the Provider component
export const Provider = ({ children, store = defaultStore }: ProviderProps) => {
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
};
