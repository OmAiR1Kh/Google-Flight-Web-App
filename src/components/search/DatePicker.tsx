"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface DatePickerProps {
  departureDate: Date | null;
  returnDate: Date | null;
  onDepartureDateChange: (date: Date) => void;
  onReturnDateChange?: (date: Date) => void;
  tripType: "one_way" | "round_trip" | "multi_city";
  minDate?: Date;
}

export function DatePicker({
  departureDate,
  returnDate,
  onDepartureDateChange,
  onReturnDateChange,
  tripType,
  minDate = new Date(),
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(minDate);
  const [currentMonthReturn, setCurrentMonthReturn] = useState<Date>(minDate);
  const [showReturnCalendar, setShowReturnCalendar] = useState(false);

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = (forReturn = false) => {
    if (forReturn) {
      setCurrentMonthReturn(
        new Date(
          currentMonthReturn.getFullYear(),
          currentMonthReturn.getMonth() - 1
        )
      );
    } else {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
      );
    }
  };

  const handleNextMonth = (forReturn = false) => {
    if (forReturn) {
      setCurrentMonthReturn(
        new Date(
          currentMonthReturn.getFullYear(),
          currentMonthReturn.getMonth() + 1
        )
      );
    } else {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
      );
    }
  };

  const handleDepartureDateClick = (day: number) => {
    const selected = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onDepartureDateChange(selected);
    if (tripType === "round_trip") {
      setShowReturnCalendar(true);
      // set return calendar to month of departure (or next month)
      setCurrentMonthReturn(
        new Date(selected.getFullYear(), selected.getMonth())
      );
    }
  };

  const handleReturnDateClick = (day: number) => {
    if (!onReturnDateChange || !departureDate) return;
    const selected = new Date(
      currentMonthReturn.getFullYear(),
      currentMonthReturn.getMonth(),
      day
    );
    if (selected >= new Date(departureDate)) {
      onReturnDateChange(selected);
      setShowReturnCalendar(false);
    }
  };

  const renderCalendar = (forReturn = false) => {
    const month = forReturn ? currentMonthReturn : currentMonth;
    const days = [];
    const totalDays = daysInMonth(month);
    const firstDay = firstDayOfMonth(month);

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${forReturn}-${i}`} className="p-2 h-10" />);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      let isDisabled = date < minDate;
      if (forReturn && departureDate) {
        isDisabled = isDisabled || date < new Date(departureDate);
      }

      const isSelected =
        (departureDate &&
          date.toDateString() === departureDate.toDateString()) ||
        (returnDate && date.toDateString() === returnDate.toDateString());

      const isInRange =
        departureDate &&
        returnDate &&
        new Date(date) > new Date(departureDate) &&
        new Date(date) < new Date(returnDate);

      days.push(
        <button
          type="button"
          key={`${forReturn}-${day}`}
          onClick={() =>
            !isDisabled &&
            (forReturn
              ? handleReturnDateClick(day)
              : handleDepartureDateClick(day))
          }
          disabled={isDisabled}
          className={`p-2 h-10 text-sm rounded transition-colors ${
            isDisabled
              ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
              : isSelected
              ? "bg-blue-500 text-white font-semibold"
              : isInRange
              ? "bg-blue-100 dark:bg-blue-900"
              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Departure Date */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Departure Date
          </h3>

          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => handlePrevMonth(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <h4 className="font-semibold text-gray-900 dark:text-white">
              {currentMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h4>

            <button
              type="button"
              onClick={() => handleNextMonth(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-2 h-10 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>

          {departureDate && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected:{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {departureDate.toLocaleDateString()}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Return Date (if round trip) */}
        {tripType === "round_trip" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Return Date
            </h3>

            {!departureDate ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Select departure date first
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => handlePrevMonth(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>

                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {currentMonthReturn.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h4>

                  <button
                    type="button"
                    onClick={() => handleNextMonth(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="p-2 h-10 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400"
                      >
                        {day}
                      </div>
                    )
                  )}
                  {renderCalendar(true)}
                </div>

                {returnDate && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Selected:{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {returnDate.toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
