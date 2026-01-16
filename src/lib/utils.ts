/**
 * Utility functions for the flight search engine
 */

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function getStopsLabel(stops: number): string {
  if (stops === 0) return "Nonstop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}

export function calculateMinPrice(itineraries: any[]): number {
  if (!itineraries || itineraries.length === 0) return 0;
  return Math.min(...itineraries.map((it) => it.price?.raw || 0));
}

export function calculateMaxPrice(itineraries: any[]): number {
  if (!itineraries || itineraries.length === 0) return 0;
  return Math.max(...itineraries.map((it) => it.price?.raw || 0));
}

export function getUniqueAirlines(itineraries: any[]): any[] {
  const airlinesMap = new Map();

  itineraries.forEach((itinerary) => {
    itinerary.legs?.forEach((leg: any) => {
      leg.carriers?.marketing?.forEach((airline: any) => {
        if (!airlinesMap.has(airline.iata)) {
          airlinesMap.set(airline.iata, {
            id: airline.iata,
            name: airline.name,
            iata: airline.iata,
            logoUrl: airline.logoUrl,
            count: 0,
          });
        }
        airlinesMap.get(airline.iata).count += 1;
      });
    });
  });

  return Array.from(airlinesMap.values()).sort((a, b) => b.count - a.count);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Generate a stable id for an itinerary based on its JSON content
export function generateFlightId(itinerary: any): string {
  const str = JSON.stringify(itinerary);
  // cyrb53 hash
  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const n = (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
  return n;
}

export async function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // fallback
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

export function buildFlightLink(id: string) {
  if (typeof window === "undefined") return `/flight/${id}`;
  return `${window.location.origin}/flight/${id}`;
}

export function parseISODuration(duration: string): number {
  // e.g. PT12H40M or PT2H
  const m = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return 0;
  const hours = parseInt(m[1] || "0", 10);
  const mins = parseInt(m[2] || "0", 10);
  return hours * 60 + mins;
}

export function mapOfferToItinerary(offer: any, dictionaries?: any) {
  const itineraries = offer.itineraries || [];
  const legs = itineraries.map((it: any, idx: number) => {
    const segments = (it.segments || []).map((s: any) => ({
      id: s.id || `${offer.id}-${idx}`,
      operatingCarrier: {
        name:
          dictionaries?.carriers?.[s.carrierCode] ||
          s.operating?.carrierName ||
          s.carrierCode,
        iata: s.carrierCode,
      },
      departure: s.departure?.at,
      arrival: s.arrival?.at,
      duration: parseISODuration(s.duration || it.duration || "PT0H0M"),
    }));

    const first = it.segments[0];
    const last = it.segments[it.segments.length - 1];
    const durationMinutes = parseISODuration(it.duration || "PT0H0M");

    const carriersCode =
      first?.carrierCode ||
      (offer.validatingAirlineCodes && offer.validatingAirlineCodes[0]);

    return {
      id: `${offer.id}-${idx}`,
      origin: {
        id: first?.departure?.iataCode || "",
        name: first?.departure?.iataCode || "",
      },
      destination: {
        id: last?.arrival?.iataCode || "",
        name: last?.arrival?.iataCode || "",
      },
      departure: first?.departure?.at,
      arrival: last?.arrival?.at,
      duration: it.duration,
      durationInMinutes: durationMinutes,
      stops: Math.max(0, (it.segments || []).length - 1),
      carriers: {
        marketing: [
          {
            name: dictionaries?.carriers?.[carriersCode] || carriersCode || "",
            iata: carriersCode || "",
            logoUrl: "",
          },
        ],
      },
      segments,
    };
  });

  const priceRaw = parseFloat(
    offer.price?.total || offer.price?.grandTotal || 0
  );
  const formatted = offer.price?.currency
    ? `${offer.price.currency} ${offer.price.total}`
    : String(priceRaw);

  return {
    id: offer.id,
    legs,
    price: { raw: priceRaw, formatted },
  };
}
