"use client";

import React from "react";
import { AlertCircle, Heart, Share2 } from "lucide-react";
import { Itinerary } from "@/src/types";
import {
  formatTime,
  formatDuration,
  getStopsLabel,
  generateFlightId,
  buildFlightLink,
  copyToClipboard,
} from "@/src/lib/utils";
import { useWishlistStore } from "@/src/store/wishlistStore";
import { useRouter } from "next/navigation";

interface FlightCardProps {
  flight: Itinerary;
  onSelect?: (flight: Itinerary) => void;
}

export function FlightCard({ flight, onSelect }: FlightCardProps) {
  const leg = flight.legs[0];
  const price = flight.price.raw;
  const formattedPrice = flight.price.formatted;
  const router = useRouter();
  const wishlist = useWishlistStore();

  // ensure flight has stable id
  if (!flight.id) {
    // mutate locally - caller should normally provide id, but ensure for navigation
    // eslint-disable-next-line no-param-reassign
    flight.id = generateFlightId(flight as any);
  }

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    wishlist.toggle(flight);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = buildFlightLink(flight.id);
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        (navigator as any).share({ title: "Flight", url });
        return;
      } catch (err) {
        // fallback to clipboard
      }
    }
    copyToClipboard(url);
  };

  return (
    <button
      onClick={() => {
        if (onSelect) return onSelect(flight);
        router.push(`/flight/${flight.id}`);
      }}
      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-left"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Airline and Flight Info */}
        <div className="flex items-center gap-4 flex-1">
          {/* {leg.carriers?.marketing?.[0] && ( 
            // <img
            //   src={leg.carriers.marketing[0].logoUrl}
            //   alt={leg.carriers.marketing[0].name}
            //   className="w-12 h-12 rounded-full object-contain"
            //   onError={(e) => {
            //     (e.target as HTMLImageElement).style.display = "none";
            //   }}
            // />
           )} */}
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {leg.carriers?.marketing?.[0]?.name || "Airline"}
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {leg.origin} → {leg.destination as any}
            </p>
          </div>
        </div>

        {/* Departure and Arrival Times */}
        <div className="flex items-center gap-6 flex-1">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatTime(leg.departure)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {leg.origin as any}
            </p>
          </div>

          {/* Duration and Stops */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {formatDuration(leg.durationInMinutes)}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {getStopsLabel(leg.stops)}
              </p>
              <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
            </div>
          </div>

          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatTime(leg.arrival)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {leg.destination as any}
            </p>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between md:flex-col gap-4 md:gap-2 md:text-right">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">From</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formattedPrice}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddToWishlist}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                wishlist.isSaved(flight.id)
                  ? "text-red-500"
                  : "text-gray-600 dark:text-gray-400"
              }`}
              aria-label="Add to wishlist"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-500"
              aria-label="Share flight"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      {flight.legs.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Multi-leg itinerary: {flight.legs.length} flights
          </p>
        </div>
      )}
    </button>
  );
}
