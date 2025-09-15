import { create } from 'zustand';
import { PartnersApiResponse } from '../api/PartnerAPI';

// Define the partner state interface
export interface Partner {
  application_id?: string;
  [key: string]: any; // Allow for flexible partner properties
}

export interface PartnerState {
  // State
  partners: Partner[];
  partnerdataV1: Partner | null;
  partnerdataV2: Partner | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  size: number;
  
  // Actions
  setPartnerData: (partnerData: Partner, version: string) => void;
  setPartnerListData: (response: PartnersApiResponse) => void;
  setError: (error: string) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  updatePartnerInList: (updatedPartner: Partner) => void;
}

// Create the Partner store
export const usePartnerStore = create<PartnerState>((set, get) => ({
  // Initial state
  partners: [],
  partnerdataV1: null,
  partnerdataV2: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  size: 10,

  // Actions
  setPartnerData: (partnerData: Partner, version: string) => {
    if (version === 'V1') {
      set({ partnerdataV1: partnerData });
    } else if (version === 'V2') {
      set({ partnerdataV2: partnerData });
    }
    
    // Also update in partners list if it exists
    get().updatePartnerInList(partnerData);
  },

  setPartnerListData: (response: PartnersApiResponse) => {
    set({
      partners: response.data,
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

  updatePartnerInList: (updatedPartner: Partner) => {
    set((state) => ({
      partners: state.partners.map(partner => 
        partner.application_id === updatedPartner.application_id ? updatedPartner : partner
      )
    }));
  }
}));

// Export the store for easy access
export default usePartnerStore;