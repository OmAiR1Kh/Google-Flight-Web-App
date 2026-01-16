import { create } from "zustand";
import { Airport } from "@/src/types";

interface AirportStore {
  fromAirports: Airport[];
  toAirports: Airport[];
  isLoading: boolean;
  error: string | null;
  setFromAirports: (airports: Airport[]) => void;
  setToAirports: (airports: Airport[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAirportStore = create<AirportStore>((set) => ({
  fromAirports: [],
  toAirports: [],
  isLoading: false,
  error: null,
  setFromAirports: (airports) => set({ fromAirports: airports }),
  setToAirports: (airports) => set({ toAirports: airports }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      fromAirports: [],
      toAirports: [],
      error: null,
      isLoading: false,
    }),
}));
