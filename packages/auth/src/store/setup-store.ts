import { create } from "zustand";
import type {
  SetupData,
  SetupSystem,
  SetupTenant,
  SetupUser,
} from "../types/setup";

/* ------------------------------------------------------------------ */
/*  Zustand store for the /alpha/v1/setup response                    */
/* ------------------------------------------------------------------ */

interface SetupStoreState {
  /** Whether the setup call has completed at least once */
  isInitialised: boolean;
  /** Whether the setup call is currently in-flight */
  isLoading: boolean;
  /** Raw setup data returned from the API */
  data: SetupData | null;

  /* ---- convenience accessors ---- */
  system: SetupSystem | null;
  tenant: SetupTenant | null;
  user: SetupUser | null;
  module: unknown | null;
  privilege: unknown | null;

  /* ---- actions ---- */
  setSetupData: (data: SetupData) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  isInitialised: false,
  isLoading: false,
  data: null,
  system: null,
  tenant: null,
  user: null,
  module: null,
  privilege: null,
};

export const useSetupStore = create<SetupStoreState>((set) => ({
  ...initialState,

  setSetupData: (data: SetupData) =>
    set({
      isInitialised: true,
      isLoading: false,
      data,
      system: data.system,
      tenant: data.tenant,
      user: data.user,
      module: data.module,
      privilege: data.privilege,
    }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  reset: () => set(initialState),
}));
