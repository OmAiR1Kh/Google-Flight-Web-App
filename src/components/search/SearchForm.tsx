"use client";

import React, { useState } from "react";
import { Search, ArrowRightLeft, AlertCircle } from "lucide-react";
import { useSearchStore } from "@/src/store/searchStore";
import { useFlightStore } from "@/src/store/flightStore";
import { useAirportStore } from "@/src/store/airportStore";
import { useFlightSearch, useAirportSearch } from "@/src/hooks/useFlightSearch";
import { AirportInput } from "./AirportInput";
import { DatePicker } from "./DatePicker";
import { PassengerDropdown } from "./PassengerDropdown";
import { CabinClassDropdown } from "./CabinClassDropdown";
import { TripTypeDropdown } from "./TripTypeDropdown";
import { Airport } from "@/src/types";

export function SearchForm() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);

  const searchParams = useSearchStore((state) => state.searchParams);
  const setSearchParams = useSearchStore((state) => state.setSearchParams);
  const isLoading = useFlightStore((state) => state.isLoading);
  const error = useFlightStore((state) => state.error);
  const { search } = useFlightSearch();
  const { searchAirports } = useAirportSearch();

  const fromAirports = useAirportStore((state) => state.fromAirports);
  const toAirports = useAirportStore((state) => state.toAirports);
  const airportLoading = useAirportStore((state) => state.isLoading);
  const setFromAirports = useAirportStore((state) => state.setFromAirports);
  const setToAirports = useAirportStore((state) => state.setToAirports);

  const handleSwapLocations = () => {
    // Swap the search params
    setSearchParams({
      from: searchParams.to,
      fromEntity: searchParams.toEntity,
      to: searchParams.from,
      toEntity: searchParams.fromEntity,
    });

    // Also swap the airport suggestion lists so selectedAirport stays consistent
    try {
      setFromAirports(toAirports);
      setToAirports(fromAirports);
    } catch (e) {
      // silent fallback; swapping params is the primary behavior
      console.warn("Failed to swap airport suggestion lists:", e);
    }
  };

  const handleFromAirportSelect = (airport: Airport) => {
    setSearchParams({
      from: airport.skyId,
      fromEntity: airport.entityId,
    });
  };

  const handleToAirportSelect = (airport: Airport) => {
    setSearchParams({
      to: airport.skyId,
      toEntity: airport.entityId,
    });
  };

  const handleDepartureDateChange = (date: Date) => {
    setDepartureDate(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setSearchParams({
      departure: `${year}-${month}-${day}`,
    });
  };

  const handleReturnDateChange = (date: Date) => {
    setReturnDate(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setSearchParams({
      return: `${year}-${month}-${day}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchParams.from || !searchParams.to || !searchParams.departure) {
      alert("Please fill in all required fields");
      return;
    }

    await search(searchParams);
  };

  const selectedFromAirport = searchParams.from
    ? fromAirports.find((a) => a.skyId === searchParams.from)
    : null;

  const selectedToAirport = searchParams.to
    ? toAirports.find((a) => a.skyId === searchParams.to)
    : null;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trip Type and Passenger/Cabin Class Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <TripTypeDropdown
            value={searchParams.tripType}
            onChange={(value) => setSearchParams({ tripType: value })}
          />
          <PassengerDropdown
            adults={searchParams.adults}
            children={searchParams.children}
            infants={searchParams.infants}
            onChange={(adults, children, infants) =>
              setSearchParams({ adults, children, infants })
            }
          />
          <CabinClassDropdown
            value={searchParams.cabinClass}
            onChange={(value) => setSearchParams({ cabinClass: value })}
          />
        </div>

        {/* Location and Date Inputs */}
        <div className="space-y-4">
          {/* From and To Airports */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
            <AirportInput
              type="from"
              value={searchParams.from}
              selectedAirport={selectedFromAirport || null}
              onSelect={handleFromAirportSelect}
              placeholder="From which airport?"
              airports={fromAirports}
              isLoading={airportLoading}
              error={error || undefined}
            />

            <button
              type="button"
              onClick={handleSwapLocations}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:top-1/3 md:translate-y-0 p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-lg z-10 hidden md:flex items-center justify-center"
              aria-label="Swap locations"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>

            <AirportInput
              type="to"
              value={searchParams.to}
              selectedAirport={selectedToAirport || null}
              onSelect={handleToAirportSelect}
              placeholder="To which airport?"
              airports={toAirports}
              isLoading={airportLoading}
            />

            <button
              type="button"
              onClick={handleSwapLocations}
              className="md:hidden col-span-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Swap
            </button>
          </div>

          {/* Date Picker */}
          {showDatePicker ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Hide Dates
              </button>
              <DatePicker
                departureDate={departureDate}
                returnDate={returnDate}
                onDepartureDateChange={handleDepartureDateChange}
                onReturnDateChange={handleReturnDateChange}
                tripType={searchParams.tripType}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setShowDatePicker(true)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Departure
                </p>
                <p className="font-semibold">
                  {departureDate
                    ? departureDate.toLocaleDateString()
                    : "Select date"}
                </p>
              </button>

              {searchParams.tripType === "round_trip" && (
                <button
                  type="button"
                  onClick={() => setShowDatePicker(true)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Return
                  </p>
                  <p className="font-semibold">
                    {returnDate
                      ? returnDate.toLocaleDateString()
                      : "Select date"}
                  </p>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Search Button */}
        <button
          type="submit"
          disabled={
            isLoading ||
            !searchParams.from ||
            !searchParams.to ||
            !searchParams.departure
          }
          className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Search className="w-5 h-5" />
          {isLoading ? "Searching flights..." : "Search Flights"}
        </button>
      </form>
    </div>
  );
}
