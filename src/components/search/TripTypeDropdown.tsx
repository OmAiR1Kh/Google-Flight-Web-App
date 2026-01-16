"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  ChevronDown,
  Check,
  ArrowRight,
  ArrowLeftRight,
  ArrowUp,
} from "lucide-react";

interface TripTypeDropdownProps {
  value: "one_way" | "round_trip" | "multi_city";
  onChange: (value: "one_way" | "round_trip" | "multi_city") => void;
}

const TRIP_TYPES = [
  { value: "one_way" as const, label: "One way", icon: ArrowRight },
  { value: "round_trip" as const, label: "Round trip", icon: ArrowLeftRight },
  { value: "multi_city" as const, label: "Multi-city", icon: ArrowUp },
];

export function TripTypeDropdown({ value, onChange }: TripTypeDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel =
    TRIP_TYPES.find((t) => t.value === value)?.label || "Round trip";
  const SelectedIcon = TRIP_TYPES.find((t) => t.value === value)?.icon;

  return (
    <div ref={dropdownRef} className="relative w-full md:w-auto">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full md:w-auto px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Select trip type"
      >
        {SelectedIcon && <SelectedIcon className="w-5 h-5" />}
        <span className="hidden md:inline">{selectedLabel}</span>
        <span className="md:hidden text-sm">{selectedLabel.split(" ")[0]}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 md:right-0 mt-2 w-full md:w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
          {TRIP_TYPES.map((tripType) => {
            const IconComponent = tripType.icon;
            return (
              <button
                type="button"
                key={tripType.value}
                onClick={() => {
                  onChange(tripType.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                  value === tripType.value
                    ? "bg-blue-50 dark:bg-blue-900/30"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span
                    className={
                      value === tripType.value
                        ? "font-semibold text-blue-600 dark:text-blue-400"
                        : "text-gray-900 dark:text-white"
                    }
                  >
                    {tripType.label}
                  </span>
                </div>
                {value === tripType.value && (
                  <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
