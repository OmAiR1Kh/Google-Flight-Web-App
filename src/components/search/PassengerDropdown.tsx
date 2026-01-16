"use client";

import React, { useRef, useEffect, useState } from "react";
import { Users, ChevronDown, Plus, Minus } from "lucide-react";

interface PassengerDropdownProps {
  adults: number;
  children: number;
  infants: number;
  onChange: (adults: number, children: number, infants: number) => void;
}

export function PassengerDropdown({
  adults,
  children,
  infants,
  onChange,
}: PassengerDropdownProps) {
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

  const handleIncrement = (type: "adults" | "children" | "infants") => {
    if (type === "adults") {
      onChange(Math.min(adults + 1, 9), children, infants);
    } else if (type === "children") {
      onChange(adults, Math.min(children + 1, 8), infants);
    } else {
      onChange(adults, children, Math.min(infants + 1, 6));
    }
  };

  const handleDecrement = (type: "adults" | "children" | "infants") => {
    if (type === "adults") {
      onChange(Math.max(adults - 1, 1), children, infants);
    } else if (type === "children") {
      onChange(adults, Math.max(children - 1, 0), infants);
    } else {
      onChange(adults, children, Math.max(infants - 1, 0));
    }
  };

  const total = adults + children + infants;

  return (
    <div ref={dropdownRef} className="relative w-full md:w-auto">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full md:w-auto px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Select passengers"
      >
        <Users className="w-5 h-5" />
        <span className="hidden md:inline">{total} Passenger</span>
        <span className="md:hidden text-sm">{total}P</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 p-4">
          <div className="space-y-4">
            {/* Adults */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Adults
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  12+ years
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDecrement("adults")}
                  disabled={adults <= 1}
                  className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                  {adults}
                </span>
                <button
                  type="button"
                  onClick={() => handleIncrement("adults")}
                  disabled={adults >= 9}
                  className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Children
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  2-11 years
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDecrement("children")}
                  disabled={children <= 0}
                  className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                  {children}
                </span>
                <button
                  type="button"
                  onClick={() => handleIncrement("children")}
                  disabled={children >= 8}
                  className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Infants */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Infants
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Under 2
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDecrement("infants")}
                  disabled={infants <= 0}
                  className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                  {infants}
                </span>
                <button
                  type="button"
                  onClick={() => handleIncrement("infants")}
                  disabled={infants >= 6}
                  className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
