import axios, { AxiosInstance } from "axios";
import { Airport, FlightData, Itinerary, Leg, Carrier } from "@/src/types";

class FlightAPI {
  private api: AxiosInstance;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string = "";
  private tokenExpiry: number = 0;
  private baseURL: string;

  constructor() {
    // Use server-only env vars for credentials (do NOT expose to client)
    this.clientId = process.env.NEXT_PUBLIC_AMADEUS_API_KEY || "";
    this.clientSecret = process.env.NEXT_PUBLIC_AMADEUS_API_SECRET || "";

    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        "Amadeus credentials not configured. Please set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in server environment variables"
      );
    }

    // Allow base URL override (no version suffix) so we can call /v1 and /v2 paths explicitly
    this.baseURL =
      process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
    });
  }

  /**
   * Get OAuth2 access token from Amadeus
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 60-second buffer)
    if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
      console.log("✓ Using cached OAuth2 token");
      return this.accessToken;
    }

    try {
      console.log("🔐 Requesting new OAuth2 token...");
      const response = await this.api.post(
        "/v1/security/oauth2/token",
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 10000,
        }
      );

      // Extract token and expiry from response
      this.accessToken = response.data.access_token;
      // Use the expires_in value from response (in seconds), convert to milliseconds
      const expiresIn = response.data.expires_in || 1799; // Default to ~30 min if not provided
      this.tokenExpiry = Date.now() + expiresIn * 1000;

      console.log(
        `✓ OAuth2 Token obtained. Expires in ${expiresIn}s (${Math.round(
          expiresIn / 60
        )} minutes)`
      );
      console.log(`Token: ${this.accessToken.substring(0, 10)}...`);

      return this.accessToken;
    } catch (error) {
      console.error("Error getting Amadeus access token:", error);
      if (axios.isAxiosError(error)) {
        console.error("Token endpoint response:", error.response?.data);

        // Check if credentials are invalid for production
        if (
          error.response?.status === 401 &&
          error.response?.data?.error === "invalid_client"
        ) {
          throw new Error(
            `Your Amadeus API key is not valid for production. This often means:\n
            1. Your account hasn't been activated yet - check your Amadeus email\n
            2. You need to enable production access in your dashboard\n
            3. For testing, use the test.api.amadeus.com endpoint (requires test credentials)\n
            
            Visit: https://developers.amadeus.com/my-apps to manage your API keys.`
          );
        }

        throw new Error(
          `Authentication failed: ${
            error.response?.data?.error_description ||
            error.response?.data?.error ||
            error.message
          }`
        );
      }
      throw error;
    }
  }

  /**
   * Search for airports by query string (city/airport name)
   */
  async searchAirports(query: string): Promise<Airport[]> {
    try {
      const token = await this.getAccessToken();

      console.log(`🔍 Searching airports for: "${query}"`);
      const response = await this.api.get("/v1/reference-data/locations", {
        params: {
          keyword: query,
          subType: "AIRPORT,CITY",
        },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.amadeus+json",
        },
        timeout: 10000,
      });

      console.log(`✓ Found ${(response.data.data || []).length} airports`);

      return (response.data.data || []).map((location: any) => ({
        skyId: location.iataCode || location.id,
        entityId: location.id,
        presentation: {
          title: location.name,
          suggestionTitle: `${location.name} (${location.iataCode || ""})`,
          subtitle: location.address?.countryName || "",
        },
        navigation: {
          entityId: location.id,
          entityType: "AIRPORT",
          localizedName: location.name,
          relevantFlightParams: {
            skyId: location.iataCode || location.id,
            entityId: location.id,
            flightPlaceType: "AIRPORT",
            localizedName: location.name,
          },
        },
      }));
    } catch (error) {
      console.error("Error searching airports:", error);
      if (axios.isAxiosError(error)) {
        console.error("Airport search response:", error.response?.data);
        if (error.response?.status === 401) {
          throw new Error(
            "Authentication failed. Please verify your Amadeus credentials in .env are valid for production API access."
          );
        }
        throw new Error(
          `Failed to search airports: ${
            error.response?.data?.errors?.[0]?.title || error.message
          }`
        );
      }
      throw new Error(
        `Failed to search airports: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Search for flights with given parameters
   */
  async searchFlights(params: {
    originSkyId: string;
    destinationSkyId: string;
    originEntityId?: string;
    destinationEntityId?: string;
    date: string;
    returnDate?: string;
    adults: number;
    children: number;
    infants: number;
    cabinClass: string;
    sortBy?: string;
    limit?: number;
    currency?: string;
  }): Promise<FlightData> {
    try {
      const token = await this.getAccessToken();

      const searchParams: any = {
        originLocationCode: params.originSkyId,
        destinationLocationCode: params.destinationSkyId,
        departureDate: params.date,
        adults: params.adults,
        children: params.children,
        infants: params.infants,
        travelClass: this.mapCabinClass(params.cabinClass),
        max: params.limit || 30,
        currencyCode: params.currency || "USD",
      };

      if (params.returnDate && params.returnDate !== params.date) {
        searchParams.returnDate = params.returnDate;
      }

      const response = await this.api.get("/v2/shopping/flight-offers", {
        params: searchParams,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.amadeus+json",
        },
        timeout: 15000,
      });

      // Transform Amadeus response to match our types
      const flightOffers = response.data.data || [];

      const itineraries: Itinerary[] = flightOffers.map(
        (offer: any, index: number) => {
          const legs: Leg[] = (offer.itineraries || []).map(
            (itinerary: any, itinIndex: number) => {
              const segments = itinerary.segments || [];
              const firstSeg = segments[0] || {};
              const lastSeg = segments[segments.length - 1] || {};

              return {
                id: `leg-${index}-${itinIndex}`,
                origin: firstSeg.departure?.iataCode || "",
                destination: lastSeg.arrival?.iataCode || "",
                departure: firstSeg.departure?.at || "",
                arrival: lastSeg.arrival?.at || "",
                durationInMinutes: this.parseDuration(itinerary.duration),
                stops: Math.max(0, segments.length - 1),
                carriers: {
                  marketing: segments.map((segment: any) => ({
                    name: this.getAirlineName(
                      segment.operating?.carrierCode || segment.carrierCode
                    ),
                    iata: segment.operating?.carrierCode || segment.carrierCode,
                    logoUrl: "",
                  })),
                },
              } as Leg;
            }
          );

          return {
            id: String(index),
            price: {
              raw: parseFloat(offer.price?.total || "0"),
              formatted: `${params.currency || "USD"} ${offer.price?.total}`,
            },
            legs,
            isMobile: false,
          };
        }
      );

      // Extract unique carriers
      const carriers: Carrier[] = [];
      const carrierCodes = new Set<string>();

      flightOffers.forEach((offer: any) => {
        (offer.itineraries || []).forEach((itinerary: any) => {
          (itinerary.segments || []).forEach((segment: any) => {
            const code = segment.operating?.carrierCode || segment.carrierCode;
            if (code && !carrierCodes.has(code)) {
              carrierCodes.add(code);
              carriers.push({
                code,
                name: this.getAirlineName(code),
                logo: "",
              });
            }
          });
        });
      });

      return {
        itineraries,
        legs: [],
        carriers,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401) {
          throw new Error(
            "Amadeus authentication failed. Please verify your API credentials."
          );
        }
        if (status === 400) {
          throw new Error(
            "Invalid flight search parameters. Please check your search criteria."
          );
        }
        throw new Error(
          `Flight search failed: ${
            error.response?.data?.detail || error.message
          }`
        );
      }
      throw new Error(
        `Flight search failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Map cabin class names from Sky-Scrapper format to Amadeus format
   */
  private mapCabinClass(
    cabinClass: string
  ): "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST" {
    const mapping: Record<
      string,
      "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST"
    > = {
      economy: "ECONOMY",
      premium_economy: "PREMIUM_ECONOMY",
      premium: "PREMIUM_ECONOMY",
      business: "BUSINESS",
      first: "FIRST",
    };
    return mapping[cabinClass.toLowerCase()] || "ECONOMY";
  }

  /**
   * Parse ISO 8601 duration to minutes
   * Example: PT14H30M -> 870 minutes
   */
  private parseDuration(duration: string): number {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
    const matches = duration.match(regex);

    if (!matches) return 0;

    const hours = matches[1] ? parseInt(matches[1], 10) : 0;
    const minutes = matches[2] ? parseInt(matches[2], 10) : 0;

    return hours * 60 + minutes;
  }

  /**
   * Get airline name from IATA code (basic mapping)
   */
  private getAirlineName(code: string): string {
    const airlines: Record<string, string> = {
      AA: "American Airlines",
      BA: "British Airways",
      DL: "Delta Air Lines",
      UA: "United Airlines",
      LH: "Lufthansa",
      AF: "Air France",
      KL: "KLM",
      QF: "Qantas",
      SQ: "Singapore Airlines",
      EK: "Emirates",
      TK: "Turkish Airlines",
      FX: "FedEx",
      AC: "Air Canada",
      CA: "Air China",
      KE: "Korean Air",
      AZ: "Alitalia",
      IB: "Iberia",
      OS: "Austrian Airlines",
      LX: "SWISS",
      EY: "Etihad Airways",
      QR: "Qatar Airways",
      PK: "Pakistan International",
      ME: "Middle East Airlines",
      MS: "EgyptAir",
      // Add more as needed
    };
    return airlines[code] || code;
  }

  /**
   * Get flight details by ID (Amadeus doesn't have a direct flight details endpoint,
   * but we can use flight offers search with ID filtering)
   */
  async getFlightDetails(flightId: string): Promise<any> {
    try {
      console.log("Flight details not directly available via Amadeus API");
      return null;
    } catch (error) {
      console.error("Error getting flight details:", error);
      throw error;
    }
  }
}

export const flightAPI = new FlightAPI();
