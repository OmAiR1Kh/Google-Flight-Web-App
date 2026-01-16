"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useFlightStore } from "@/src/store/flightStore";
import { useWishlistStore } from "@/src/store/wishlistStore";
import {
  buildFlightLink,
  copyToClipboard,
  mapOfferToItinerary,
} from "@/src/lib/utils";
import { Heart, Share2 } from "lucide-react";

interface Props {
  id: string;
}

export default function SingleFlightPageClient({ id }: Props) {
  const flights = useFlightStore((s) => s.flights);
  const raw = useFlightStore((s) => s.rawFlightData);
  const wishlist = useWishlistStore();

  let flight =
    flights.find((f) => f.id === id) ||
    Object.values(wishlist.items).find((f) => f.id === id);

  // If flight not in store, try to map from raw API response
  if (!flight && raw && (raw as any).data) {
    const offer = (raw as any).data.find(
      (o: any) => String(o.id) === String(id)
    );
    if (offer) {
      flight = mapOfferToItinerary(offer, (raw as any).dictionaries);
    }
  }

  if (!flight) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Flight not found</h2>
        <p className="text-sm text-gray-600">
          This flight may have expired from search results. Check your wishlist
          or run a new search.
        </p>
      </div>
    );
  }

  const handleToggleWishlist = () => wishlist.toggle(flight);

  const handleShare = async () => {
    const url = buildFlightLink(flight.id);
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: "Flight", url });
        return;
      } catch (e) {
        // fallback
      }
    }
    await copyToClipboard(url);
    alert("Link copied to clipboard");
  };

  const getLocLabel = (l: any) => {
    if (!l) return "";
    return typeof l === "string" ? l : l.id || l.name || "";
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Flight details</h1>
          <p className="text-sm text-gray-600">
            Price: {flight.price.formatted}
          </p>
          {(raw as any)?.meta && (
            <p className="text-xs text-gray-500">
              Search results: {(raw as any).meta.count} offers
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleWishlist}
            className={`p-2 rounded ${
              wishlist.isSaved(flight.id)
                ? "bg-red-50 text-red-600"
                : "bg-gray-100"
            }`}
          >
            <Heart className="w-5 h-5" />
          </button>
          <button onClick={handleShare} className="p-2 rounded bg-gray-100">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {flight.legs.map((leg) => (
          <div key={leg.id} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {getLocLabel((leg as any).origin)} →{" "}
                  {getLocLabel((leg as any).destination)}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(leg.departure).toLocaleString()} —{" "}
                  {new Date(leg.arrival).toLocaleString()}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                Duration: {leg.durationInMinutes}m • {leg.stops} stops
              </div>
            </div>

            <div className="mt-3">
              <h4 className="font-medium">Segments</h4>
              <ul className="mt-2 space-y-2">
                {leg.segments?.map((seg) => (
                  <li key={seg.id} className="text-sm text-gray-700">
                    {seg.operatingCarrier?.name || seg.operatingCarrier?.iata} —{" "}
                    {new Date(seg.departure).toLocaleString()} →{" "}
                    {new Date(seg.arrival).toLocaleString()} ({seg.duration}m)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
