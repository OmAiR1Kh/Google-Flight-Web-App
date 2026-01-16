"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin, X } from "lucide-react";
import { useAirportSearch } from "@/src/hooks/useFlightSearch";
import { Airport } from "@/src/types";

interface AirportInputProps {
  value: string;
  selectedAirport: Airport | null;
  onSelect: (airport: Airport) => void;
  placeholder: string;
  type: "from" | "to";
  airports: Airport[];
  isLoading: boolean;
  error?: string;
}

export function AirportInput({
  value,
  selectedAirport,
  onSelect,
  placeholder,
  type,
  airports,
  isLoading,
  error,
}: AirportInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { searchAirports } = useAirportSearch();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setOpen(true);
    searchAirports(val, type);
  };

  const handleSelect = (airport: Airport) => {
    onSelect(airport);
    setInputValue("");
    setOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    onSelect(null as any);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue || selectedAirport?.presentation?.title || ""}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          aria-label={placeholder}
        />
        {selectedAirport && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {open && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {isLoading && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Searching airports...
            </div>
          )}

          {!isLoading && airports.length === 0 && inputValue && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No airports found
            </div>
          )}

          {!isLoading &&
            airports.length > 0 &&
            airports.map((airport) => (
              <button
                key={airport.skyId}
                onClick={() => handleSelect(airport)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors"
              >
                <div className="font-semibold text-gray-900 dark:text-white">
                  {airport.presentation.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {airport.presentation.subtitle}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
