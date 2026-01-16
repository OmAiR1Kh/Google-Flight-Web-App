"use client";

import React, { useRef, useEffect, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

interface CabinClassDropdownProps {
  value: string;
  onChange: (
    value: "economy" | "premium_economy" | "business" | "first"
  ) => void;
}

const CABIN_CLASSES = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
];

export function CabinClassDropdown({
  value,
  onChange,
}: CabinClassDropdownProps) {
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
    CABIN_CLASSES.find((c) => c.value === value)?.label || "Economy";

  return (
    <div ref={dropdownRef} className="relative w-full md:w-auto">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full md:w-auto px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Select cabin class"
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 md:right-0 mt-2 w-full md:w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
          {CABIN_CLASSES.map((cabinClass) => (
            <button
              type="button"
              key={cabinClass.value}
              onClick={() => {
                onChange(cabinClass.value as any);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                value === cabinClass.value
                  ? "bg-blue-50 dark:bg-blue-900/30"
                  : ""
              }`}
            >
              <span
                className={
                  value === cabinClass.value
                    ? "font-semibold text-blue-600 dark:text-blue-400"
                    : "text-gray-900 dark:text-white"
                }
              >
                {cabinClass.label}
              </span>
              {value === cabinClass.value && (
                <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
