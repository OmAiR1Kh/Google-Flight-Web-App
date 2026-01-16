declare module "amadeus" {
  export default class Amadeus {
    constructor(options: { clientId: string; clientSecret: string });

    referenceData: {
      locations: {
        get(params: {
          keyword: string;
          subType: string;
        }): Promise<{ data: any[] }>;
      };
    };

    shopping: {
      flightOffersSearch: {
        get(params: any): Promise<{ data: any[] }>;
      };
    };
  }
}
