// src/components/index.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { AxiosInstance } from 'axios';

// Create a context to hold the axios instance
type AxiosContextType = AxiosInstance | null;
const AxiosContext = createContext<AxiosContextType>(null);

// Global provider for axios instance
type AxiosProviderProps = {
    axiosInstance: AxiosInstance;
    children: ReactNode;
};

export const AxiosProvider: React.FC<AxiosProviderProps> = ({ axiosInstance, children }) => {
    return (
        <AxiosContext.Provider value={axiosInstance}>
            {children}
        </AxiosContext.Provider>
    );
};

// Custom hook to use axios instance
export const useAxios = (): AxiosInstance | null => {
    return useContext(AxiosContext);
};

export type { AxiosProviderProps };  // Export the type to help TypeScript consumers
