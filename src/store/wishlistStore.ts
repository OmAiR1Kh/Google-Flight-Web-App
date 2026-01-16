import { create } from "zustand";
import { Itinerary } from "@/src/types";

interface WishlistStore {
  items: Record<string, Itinerary>;
  add: (it: Itinerary) => void;
  remove: (id: string) => void;
  toggle: (it: Itinerary) => void;
  isSaved: (id: string) => boolean;
  clear: () => void;
}

const STORAGE_KEY = "spotter_wishlist";

function loadFromStorage(): Record<string, Itinerary> {
  try {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function saveToStorage(items: Record<string, Itinerary>) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    // noop
  }
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: loadFromStorage(),
  add: (it) => {
    const items = { ...get().items, [it.id]: it };
    saveToStorage(items);
    set({ items });
  },
  remove: (id) => {
    const items = { ...get().items };
    delete items[id];
    saveToStorage(items);
    set({ items });
  },
  toggle: (it) => {
    const id = it.id;
    if (get().items[id]) get().remove(id);
    else get().add(it);
  },
  isSaved: (id) => !!get().items[id],
  clear: () => {
    saveToStorage({});
    set({ items: {} });
  },
}));
