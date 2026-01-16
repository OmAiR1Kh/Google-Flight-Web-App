"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useFlightStore } from "@/src/store/flightStore";
import { useFilterStore } from "@/src/store/filterStore";

interface PriceDataPoint {
  date: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  count: number;
}

export function PriceGraph() {
  const flights = useFlightStore((state) => state.flights);

  // Use separate selectors to prevent object recreation
  const priceRange = useFilterStore((state) => state.priceRange);
  const stops = useFilterStore((state) => state.stops);
  const airlines = useFilterStore((state) => state.airlines);

  const filters = useMemo(
    () => ({ priceRange, stops, airlines }),
    [priceRange, stops, airlines]
  );

  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
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
  }, [flights, filters]);

  const priceData = useMemo(() => {
    const dataMap = new Map<string, PriceDataPoint>();

    filteredFlights.forEach((flight) => {
      const departureDate = new Date(flight.legs[0].departure);
      const dateKey = departureDate.toISOString().split("T")[0];

      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, {
          date: dateKey,
          avgPrice: 0,
          minPrice: flight.price.raw,
          maxPrice: flight.price.raw,
          count: 0,
        });
      }

      const data = dataMap.get(dateKey)!;
      data.minPrice = Math.min(data.minPrice, flight.price.raw);
      data.maxPrice = Math.max(data.maxPrice, flight.price.raw);
      data.count += 1;
      data.avgPrice =
        (data.avgPrice * (data.count - 1) + flight.price.raw) / data.count;
    });

    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredFlights]);

  if (filteredFlights.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          No flights match your filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  if (priceData.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Loading price trends...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Average Price Trend */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Price Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={priceData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            barGap={0}
            barCategoryGap="60%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              domain={[0, "dataMax + 50"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number | undefined) => {
                if (typeof value === "number") return [`$${value.toFixed(2)}`];
                return [value];
              }}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString();
              }}
            />
            <Bar
              dataKey="minPrice"
              fill="#10b981"
              name="Minimum Price"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="avgPrice"
              fill="#3b82f6"
              name="Average Price"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="maxPrice"
              fill="#ef4444"
              name="Maximum Price"
              radius={[8, 8, 0, 0]}
            />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Price Distribution */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Flight Count by Date
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={priceData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number | undefined) => [
                (value || 0).toFixed(0),
                "Flights",
              ]}
            />
            <Bar
              dataKey="count"
              fill="#8b5cf6"
              name="Number of Flights"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Results
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {filteredFlights.length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Average Price
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            $
            {(
              filteredFlights.reduce((sum, f) => sum + f.price.raw, 0) /
              filteredFlights.length
            ).toFixed(0)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Lowest Price
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${Math.min(...filteredFlights.map((f) => f.price.raw)).toFixed(0)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Highest Price
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ${Math.max(...filteredFlights.map((f) => f.price.raw)).toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  );
}
