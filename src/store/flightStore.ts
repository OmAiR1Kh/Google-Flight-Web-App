import { create } from "zustand";
import { Itinerary, FlightData } from "@/src/types";

interface FlightStore {
  flights: Itinerary[];
  rawFlightData: FlightData | null;
  isLoading: boolean;
  error: string | null;
  setFlights: (flights: Itinerary[], rawData: FlightData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useFlightStore = create<FlightStore>((set) => ({
  flights: [],
  rawFlightData: null,
  isLoading: false,
  error: null,
  setFlights: (flights, rawData) =>
    set({ flights, rawFlightData: rawData, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      flights: [],
      rawFlightData: null,
      error: null,
      isLoading: false,
    }),
}));
