import { create } from "zustand";
import { SearchParams } from "@/src/types";

interface SearchStore {
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;
  resetSearchParams: () => void;
}

const defaultSearchParams: SearchParams = {
  from: "",
  fromEntity: "",
  to: "",
  toEntity: "",
  departure: "",
  adults: 1,
  children: 0,
  infants: 0,
  cabinClass: "economy",
  tripType: "round_trip",
};

export const useSearchStore = create<SearchStore>((set) => ({
  searchParams: defaultSearchParams,
  setSearchParams: (params) =>
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
    })),
  resetSearchParams: () => set({ searchParams: defaultSearchParams }),
}));
