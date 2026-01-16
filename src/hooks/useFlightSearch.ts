import { useCallback, useRef } from "react";
import { useSearchStore } from "@/src/store/searchStore";
import { useFlightStore } from "@/src/store/flightStore";
import { useAirportStore } from "@/src/store/airportStore";
import { flightAPI } from "@/src/lib/api";
import { formatDate } from "@/src/lib/utils";

export function useFlightSearch() {
  const searchParams = useSearchStore((state) => state.searchParams);
  const setFlights = useFlightStore((state) => state.setFlights);
  const setLoading = useFlightStore((state) => state.setLoading);
  const setError = useFlightStore((state) => state.setError);
  const isSearching = useRef(false);

  const search = useCallback(
    async (params = searchParams) => {
      // Validate required fields
      if (!params.from || !params.to || !params.departure) {
        setError("Please fill in all required fields");
        return;
      }

      if (isSearching.current) return;
      isSearching.current = true;

      try {
        setLoading(true);
        setError(null);

        const flightData = await flightAPI.searchFlights({
          originSkyId: params.from,
          destinationSkyId: params.to,
          originEntityId: params.fromEntity,
          destinationEntityId: params.toEntity,
          date: formatDate(new Date(params.departure)),
          returnDate:
            params.return && params.tripType === "round_trip"
              ? formatDate(new Date(params.return))
              : undefined,
          adults: params.adults,
          children: params.children,
          infants: params.infants,
          cabinClass: params.cabinClass,
          sortBy: "best",
          limit: 30,
          currency: "USD",
        });

        setFlights(flightData.itineraries || [], flightData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to search flights";
        setError(errorMessage);
        console.error("Search error:", err);
      } finally {
        setLoading(false);
        isSearching.current = false;
      }
    },
    [searchParams, setFlights, setLoading, setError]
  );

  return { search, searchParams };
}

export function useAirportSearch() {
  const setFromAirports = useAirportStore((state) => state.setFromAirports);
  const setToAirports = useAirportStore((state) => state.setToAirports);
  const setLoading = useAirportStore((state) => state.setLoading);
  const setError = useAirportStore((state) => state.setError);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchAirports = useCallback(
    (query: string, type: "from" | "to") => {
      if (!query || query.length < 2) {
        if (type === "from") {
          setFromAirports([]);
        } else {
          setToAirports([]);
        }
        return;
      }

      // Debounce the API call
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      setLoading(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const airports = await flightAPI.searchAirports(query);
          if (type === "from") {
            setFromAirports(airports);
          } else {
            setToAirports(airports);
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to search airports";
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      }, 500);
    },
    [setFromAirports, setToAirports, setLoading, setError]
  );

  return { searchAirports };
}
