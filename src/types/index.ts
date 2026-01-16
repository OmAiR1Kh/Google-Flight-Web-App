/**
 * Core type definitions for the flight search engine
 */

export interface Airport {
  skyId: string;
  entityId: string;
  presentation: {
    title: string;
    subtitle: string;
  };
  iata?: string;
}

export interface Segment {
  id: string;
  operatingCarrier: {
    name: string;
    iata: string;
  };
  departure: string;
  arrival: string;
  duration: number;
}

export interface Leg {
  id: string;
  origin: string | { iata?: string; name?: string; cityCode?: string };
  destination: string | { iata?: string; name?: string; cityCode?: string };
  departure: string;
  arrival: string;
  duration: number;
  durationInMinutes: number;
  stops: number;
  carriers: {
    marketing: Array<{
      name: string;
      iata: string;
      logoUrl: string;
    }>;
  };
  segments: Segment[];
}

export interface Itinerary {
  id: string;
  legs: Leg[];
  price: {
    raw: number;
    formatted: string;
  };
  score?: number;
  isMobile?: boolean;
}

export interface FlightData {
  itineraries: Itinerary[];
  legs: Leg[];
  carriers: Carrier[];
  // Amadeus provider metadata (optional)
  meta?: {
    count?: number;
    links?: Record<string, string>;
  };
}

export interface Carrier {
  code: string;
  name: string;
  logo: string;
}

export interface SearchParams {
  from: string;
  fromEntity: string;
  to: string;
  toEntity: string;
  departure: string;
  return?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: "economy" | "premium_economy" | "business" | "first";
  tripType: "round_trip" | "one_way" | "multi_city";
}

export interface Filters {
  priceRange: {
    min: number;
    max: number;
  };
  stops: number | null;
  airlines: string[];
  sortBy: "best" | "price" | "duration";
}

export interface AirlineFilter {
  id: string;
  name: string;
  count: number;
  selected: boolean;
}

export interface PriceDataPoint {
  date: string;
  price: number;
  count: number;
}
