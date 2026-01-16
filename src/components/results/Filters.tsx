"use client";

import React, { useMemo } from "react";
import { Filter, X } from "lucide-react";
import { useFilterStore } from "@/src/store/filterStore";
import { useFlightStore } from "@/src/store/flightStore";
import {
  getUniqueAirlines,
  calculateMinPrice,
  calculateMaxPrice,
} from "@/src/lib/utils";

interface FiltersProps {
  onFiltersApplied?: () => void;
}

export function Filters({ onFiltersApplied }: FiltersProps) {
  const flights = useFlightStore((state) => state.flights);

  // Use separate selectors to prevent object recreation
  const priceRange = useFilterStore((state) => state.priceRange);
  const stops = useFilterStore((state) => state.stops);
  const filterAirlines = useFilterStore((state) => state.airlines);
  const sortBy = useFilterStore((state) => state.sortBy);

  const filters = useMemo(
    () => ({ priceRange, stops, airlines: filterAirlines, sortBy }),
    [priceRange, stops, filterAirlines, sortBy]
  );

  const setFilters = useFilterStore((state) => state.setFilters);
  const addAirline = useFilterStore((state) => state.addAirline);
  const removeAirline = useFilterStore((state) => state.removeAirline);
  const setPriceRange = useFilterStore((state) => state.setPriceRange);
  const reset = useFilterStore((state) => state.reset);

  const minPrice = useMemo(() => calculateMinPrice(flights), [flights]);
  const maxPrice = useMemo(() => calculateMaxPrice(flights), [flights]);
  const airlines = useMemo(() => getUniqueAirlines(flights), [flights]);

  const handleAirlineToggle = (airlineId: string) => {
    if (filters.airlines.includes(airlineId)) {
      removeAirline(airlineId);
    } else {
      addAirline(airlineId);
    }
  };

  const handleStopsChange = (stops: number | null) => {
    setFilters({ stops: filters.stops === stops ? null : stops });
  };

  // Local price inputs to avoid accidental large jumps while dragging
  const [localMin, setLocalMin] = React.useState<number>(priceRange.min);
  const [localMax, setLocalMax] = React.useState<number>(priceRange.max);

  React.useEffect(() => {
    setLocalMin(priceRange.min);
    setLocalMax(priceRange.max);
  }, [priceRange.min, priceRange.max]);

  const applyLocalPrice = () => {
    const min = Math.max(minPrice, Math.min(localMin, localMax));
    const max = Math.min(maxPrice, Math.max(localMax, localMin));
    setPriceRange(min, max);
    onFiltersApplied?.();
  };

  const handleSortChange = (sortBy: "best" | "price" | "duration") => {
    setFilters({ sortBy });
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Reset
        </button>
      </div>

      {/* Sort Options */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
          Sort by
        </h4>
        <div className="space-y-2">
          {["best", "price", "duration"].map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <input
                type="radio"
                name="sort"
                value={option}
                checked={filters.sortBy === option}
                onChange={() => handleSortChange(option as any)}
                className="w-4 h-4 rounded"
              />
              <span className="capitalize text-gray-900 dark:text-white">
                {option === "best"
                  ? "Best"
                  : option === "price"
                  ? "Lowest Price"
                  : "Shortest Duration"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      {maxPrice > 0 && (
        <div className="space-y-3 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
            Price Range
          </h4>

          {/* Mobile: slider controls (two range inputs) */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
              <span>Min: {localMin}</span>
              <span>Max: {localMax}</span>
            </div>

            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={localMin}
              onChange={(e) => setLocalMin(Number(e.target.value))}
              className="w-full"
            />

            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={localMax}
              onChange={(e) => setLocalMax(Number(e.target.value))}
              className="w-full"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setLocalMin(minPrice);
                  setLocalMax(maxPrice);
                  setPriceRange(minPrice, maxPrice);
                }}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm"
              >
                Reset
              </button>
              <button
                onClick={applyLocalPrice}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm ml-auto"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Desktop: numeric inputs (unchanged) */}
          <div className="hidden md:block space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={localMin}
                onChange={(e) => setLocalMin(Number(e.target.value))}
                className="w-1/2 px-2 py-1 border rounded bg-white dark:bg-gray-800"
                min={minPrice}
                max={maxPrice}
              />
              <input
                type="number"
                value={localMax}
                onChange={(e) => setLocalMax(Number(e.target.value))}
                className="w-1/2 px-2 py-1 border rounded bg-white dark:bg-gray-800"
                min={minPrice}
                max={maxPrice}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setLocalMin(minPrice);
                  setLocalMax(maxPrice);
                  setPriceRange(minPrice, maxPrice);
                }}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm"
              >
                Reset
              </button>
              <button
                onClick={applyLocalPrice}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm ml-auto"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stops */}
      <div className="space-y-3 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
          Stops
        </h4>
        <div className="space-y-2">
          {[
            { value: null, label: "Any" },
            { value: 0, label: "Nonstop" },
            { value: 1, label: "Up to 1 stop" },
            { value: 2, label: "Up to 2 stops" },
          ].map((option) => (
            <label
              key={String(option.value)}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded transition-colors ${
                filters.stops === option.value
                  ? "bg-blue-50 dark:bg-blue-900/30"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <input
                type="radio"
                name="stops"
                checked={filters.stops === option.value}
                onChange={() => handleStopsChange(option.value)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-gray-900 dark:text-white">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Airlines */}
      {airlines.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              Airlines
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  airlines.slice(0, 10).forEach((a) => addAirline(a.id))
                }
                className="text-xs text-blue-600 dark:text-blue-400"
              >
                Select All
              </button>
              <button
                onClick={() =>
                  airlines.slice(0, 10).forEach((a) => removeAirline(a.id))
                }
                className="text-xs text-gray-600 dark:text-gray-400"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {airlines.slice(0, 50).map((airline) => (
              <label
                key={airline.id}
                className={`flex items-center gap-3 cursor-pointer p-2 rounded transition-colors ${
                  filters.airlines.includes(airline.id)
                    ? "bg-blue-50 dark:bg-blue-900/30"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={filters.airlines.includes(airline.id)}
                  onChange={() => handleAirlineToggle(airline.id)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="flex-1 text-gray-900 dark:text-white">
                  {airline.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {airline.count}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
