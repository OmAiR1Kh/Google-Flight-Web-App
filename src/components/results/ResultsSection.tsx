"use client";

import React, { useMemo, useState } from "react";
import { useFlightStore } from "@/src/store/flightStore";
import { useFilterStore } from "@/src/store/filterStore";
import { FlightCard } from "./FlightCard";
import { useRouter } from "next/navigation";
import { Filters } from "./Filters";
import { PriceGraph } from "./PriceGraph";
import { AlertCircle, ArrowDown } from "lucide-react";

export function ResultsSection() {
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const flights = useFlightStore((state) => state.flights);
  const isLoading = useFlightStore((state) => state.isLoading);
  const error = useFlightStore((state) => state.error);
  const rawFlightData = useFlightStore((state) => state.rawFlightData);

  // Use separate selectors to prevent filter object recreation
  const priceRange = useFilterStore((state) => state.priceRange);
  const stops = useFilterStore((state) => state.stops);
  const airlines = useFilterStore((state) => state.airlines);
  const sortBy = useFilterStore((state) => state.sortBy);

  const filters = useMemo(
    () => ({ priceRange, stops, airlines, sortBy }),
    [priceRange, stops, airlines, sortBy]
  );

  const filteredAndSortedFlights = useMemo(() => {
    let filtered = flights.filter((flight) => {
      const price = flight.price.raw;
      const stops = flight.legs[0]?.stops || 0;
      const airline = flight.legs[0]?.carriers?.marketing?.[0]?.iata;

      // Apply price filter
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false;
      }

      // Apply stops filter
      if (filters.stops !== null && stops > filters.stops) {
        return false;
      }

      // Apply airline filter
      if (
        filters.airlines.length > 0 &&
        airline &&
        !filters.airlines.includes(airline)
      ) {
        return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      if (filters.sortBy === "price") {
        return a.price.raw - b.price.raw;
      } else if (filters.sortBy === "duration") {
        return (
          (a.legs[0]?.durationInMinutes || 0) -
          (b.legs[0]?.durationInMinutes || 0)
        );
      } else {
        // best - keep original order or use a scoring system
        return 0;
      }
    });

    return filtered;
  }, [flights, filters]);

  const router = useRouter();

  // Pagination
  const totalResults =
    (rawFlightData as any)?.meta?.count || filteredAndSortedFlights.length;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedFlights.length / pageSize)
  );
  const paginatedFlights = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSortedFlights.slice(start, start + pageSize);
  }, [filteredAndSortedFlights, page, pageSize]);

  // Reset page when filters or pageSize change
  React.useEffect(() => setPage(1), [filters, pageSize]);

  if (!flights || flights.length === 0) {
    return (
      <div className="w-full py-12 text-center">
        <div className="max-w-md mx-auto">
          <ArrowDown className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No flights searched yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Use the search form above to find flights that match your criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400" />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        {flights.length > 0 && (
          <div className="w-full md:w-80 shrink-0 ">
            {/* Mobile Filter Toggle */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            {showFilters && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 sticky top-4">
                <Filters />
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Price Graph */}
          {flights.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Price Trends
              </h2>
              <PriceGraph />
            </div>
          )}

          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Flight Results
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {paginatedFlights.length} of{" "}
                {filteredAndSortedFlights.length} results ({totalResults} total)
              </p>
            </div>

            {filteredAndSortedFlights.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No flights match your filter criteria
                </p>
                <button
                  onClick={() => {
                    useFilterStore.getState().reset();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedFlights.map((flight) => (
                    <FlightCard
                      key={flight.id}
                      flight={flight}
                      onSelect={(f) => {
                        router.push(`/flight/${f.id}`);
                      }}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 rounded border bg-white dark:bg-gray-800 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          className={`px-3 py-1 rounded ${
                            page === i + 1
                              ? "bg-blue-600 text-white"
                              : "bg-white dark:bg-gray-800"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-3 py-1 rounded border bg-white dark:bg-gray-800 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Per page
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="border rounded px-2 py-1 bg-white dark:bg-gray-800"
                    >
                      {[10, 20, 30].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
