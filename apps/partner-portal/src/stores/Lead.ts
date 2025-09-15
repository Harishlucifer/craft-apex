import { create } from 'zustand';
import { LeadsApiResponse } from '../api/LeadAPI';

// Define the lead state interface
export interface Lead {
  application_id?: string;
  [key: string]: any; // Allow for flexible lead properties
}

export interface LeadState {
  // State
  leads: Lead[];
  leadataV1: Lead | null;
  leadataV2: Lead | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  size: number;
  
  // Actions
  setLeadData: (leadData: Lead, version: string) => void;
  setLeadListData: (response: LeadsApiResponse) => void;
  setError: (error: string) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  updateLeadInList: (updatedLead: Lead) => void;
}

// Create the Lead store
export const useLeadStore = create<LeadState>((set, get) => ({
  // Initial state
  leads: [],
  leadataV1: null,
  leadataV2: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  size: 10,

  // Actions
  setLeadData: (leadData: Lead, version: string) => {
    if (version === 'V1') {
      set({ leadataV1: leadData });
    } else if (version === 'V2') {
      set({ leadataV2: leadData });
    }
    
    // Also update in leads list if it exists
    get().updateLeadInList(leadData);
  },

  setLeadListData: (response: LeadsApiResponse) => {
    set({
      leads: response.data,
      total: response.total,
      page: response.page,
      size: response.size
    });
  },

  setError: (error: string) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  updateLeadInList: (updatedLead: Lead) => {
    set((state) => ({
      leads: state.leads.map(lead => 
        lead.application_id === updatedLead.application_id ? updatedLead : lead
      )
    }));
  }
}));

// Export the store for easy access
export default useLeadStore;