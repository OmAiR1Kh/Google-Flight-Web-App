import { create } from "zustand";
import { Filters } from "@/src/types";

interface FilterStore extends Filters {
  setFilters: (filters: Partial<Filters>) => void;
  reset: () => void;
  addAirline: (airline: string) => void;
  removeAirline: (airline: string) => void;
  setPriceRange: (min: number, max: number) => void;
}

const defaultFilters: Filters = {
  priceRange: { min: 0, max: 10000 },
  stops: null,
  airlines: [],
  sortBy: "best",
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...defaultFilters,
  setFilters: (filters) =>
    set((state) => ({
      ...state,
      ...filters,
    })),
  reset: () => set(defaultFilters),
  addAirline: (airline) =>
    set((state) => ({
      airlines: [...state.airlines, airline],
    })),
  removeAirline: (airline) =>
    set((state) => ({
      airlines: state.airlines.filter((a) => a !== airline),
    })),
  setPriceRange: (min, max) =>
    set({
      priceRange: { min, max },
    }),
}));
