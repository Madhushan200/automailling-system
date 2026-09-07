import { RoutePlan, RouteWaypoint, RouteSegment } from "./types";

// Official Sri Lanka verified inter-city road distance matrix (KM & driving minutes)
export const SRI_LANKA_DISTANCE_MATRIX: Record<string, Record<string, { km: number; mins: number }>> = {
  "Colombo / Airport": {
    "Negombo": { km: 15, mins: 25 },
    "Kandy": { km: 115, mins: 190 },
    "Sigiriya": { km: 165, mins: 230 },
    "Habarana": { km: 170, mins: 240 },
    "Dambulla": { km: 155, mins: 215 },
    "Nuwara Eliya": { km: 160, mins: 290 },
    "Ella": { km: 210, mins: 330 },
    "Yala / Tissamaharama": { km: 260, mins: 270 },
    "Mirissa / Weligama": { km: 150, mins: 130 },
    "Galle": { km: 125, mins: 110 },
    "Bentota": { km: 85, mins: 80 },
  },
  "Negombo": {
    "Colombo / Airport": { km: 15, mins: 25 },
    "Kandy": { km: 110, mins: 180 },
    "Sigiriya": { km: 155, mins: 210 },
    "Dambulla": { km: 145, mins: 195 },
    "Nuwara Eliya": { km: 165, mins: 280 },
    "Galle": { km: 140, mins: 130 },
  },
  "Kandy": {
    "Colombo / Airport": { km: 115, mins: 190 },
    "Negombo": { km: 110, mins: 180 },
    "Sigiriya": { km: 90, mins: 150 },
    "Dambulla": { km: 75, mins: 120 },
    "Nuwara Eliya": { km: 80, mins: 160 },
    "Ella": { km: 140, mins: 240 },
    "Yala / Tissamaharama": { km: 220, mins: 310 },
    "Galle": { km: 220, mins: 260 },
  },
  "Sigiriya": {
    "Colombo / Airport": { km: 165, mins: 230 },
    "Kandy": { km: 90, mins: 150 },
    "Dambulla": { km: 25, mins: 35 },
    "Polonnaruwa": { km: 60, mins: 75 },
    "Trincomalee": { km: 100, mins: 120 },
    "Nuwara Eliya": { km: 160, mins: 270 },
    "Ella": { km: 210, mins: 320 },
  },
  "Nuwara Eliya": {
    "Colombo / Airport": { km: 160, mins: 290 },
    "Kandy": { km: 80, mins: 160 },
    "Ella": { km: 65, mins: 120 },
    "Yala / Tissamaharama": { km: 150, mins: 210 },
    "Mirissa / Weligama": { km: 200, mins: 280 },
    "Galle": { km: 225, mins: 300 },
  },
  "Ella": {
    "Colombo / Airport": { km: 210, mins: 330 },
    "Nuwara Eliya": { km: 65, mins: 120 },
    "Yala / Tissamaharama": { km: 95, mins: 135 },
    "Mirissa / Weligama": { km: 150, mins: 190 },
    "Galle": { km: 175, mins: 210 },
    "Arugam Bay": { km: 135, mins: 180 },
  },
  "Yala / Tissamaharama": {
    "Colombo / Airport": { km: 260, mins: 270 },
    "Ella": { km: 95, mins: 135 },
    "Mirissa / Weligama": { km: 110, mins: 120 },
    "Galle": { km: 135, mins: 140 },
    "Bentota": { km: 190, mins: 190 },
  },
  "Mirissa / Weligama": {
    "Colombo / Airport": { km: 150, mins: 130 },
    "Yala / Tissamaharama": { km: 110, mins: 120 },
    "Galle": { km: 35, mins: 40 },
    "Bentota": { km: 85, mins: 80 },
    "Ella": { km: 150, mins: 190 },
  },
  "Galle": {
    "Colombo / Airport": { km: 125, mins: 110 },
    "Mirissa / Weligama": { km: 35, mins: 40 },
    "Bentota": { km: 55, mins: 50 },
    "Yala / Tissamaharama": { km: 135, mins: 140 },
    "Kandy": { km: 220, mins: 260 },
  },
  "Bentota": {
    "Colombo / Airport": { km: 85, mins: 80 },
    "Galle": { km: 55, mins: 50 },
    "Mirissa / Weligama": { km: 85, mins: 80 },
    "Kandy": { km: 180, mins: 230 },
  },
};

export const SRI_LANKA_DESTINATION_COORDINATES: Record<string, { lat: number; lng: number; highlights: string[]; hotels: string[] }> = {
  "Colombo / Airport": {
    lat: 7.1808,
    lng: 79.8841,
    highlights: ["Bandaranaike International Airport", "Negombo Lagoon", "Dutch Fort"],
    hotels: ["The Kingsbury Colombo", "Cinnamon Grand", "Jetwing Beach Negombo"],
  },
  "Negombo": {
    lat: 7.2008,
    lng: 79.8737,
    highlights: ["Negombo Lagoon & Fish Market", "St. Mary's Church", "Sunset Beach Walk"],
    hotels: ["Jetwing Beach", "Heritance Negombo", "Amagi Aria"],
  },
  "Kandy": {
    lat: 7.2906,
    lng: 80.6337,
    highlights: ["Temple of the Sacred Tooth Relic", "Royal Botanical Gardens Peradeniya", "Kandy Lake Walk", "Cultural Dance Show"],
    hotels: ["The Golden Crown Hotel", "Earl's Regency", "Mahaweli Reach Hotel"],
  },
  "Sigiriya": {
    lat: 7.957,
    lng: 80.7603,
    highlights: ["Sigiriya Lion Rock Fortress (UNESCO)", "Pidurangala Sunrise Rock", "Minneriya Wild Elephant Safari"],
    hotels: ["Heritance Kandalama", "Aliya Resort & Spa", "Water Garden Sigiriya"],
  },
  "Dambulla": {
    lat: 7.8731,
    lng: 80.6517,
    highlights: ["Dambulla Royal Cave Temple", "Golden Buddha Statue"],
    hotels: ["Amaya Lake Dambulla", "Jetwing Vil Uyana"],
  },
  "Nuwara Eliya": {
    lat: 6.9497,
    lng: 80.7891,
    highlights: ["Pedro Tea Factory & Plantation Tour", "Gregory Lake Boat Ride", "Horton Plains & World's End", "Queen's Cottage"],
    hotels: ["Grand Hotel Nuwara Eliya", "Heritance Tea Factory", "Araliya Green Hills"],
  },
  "Ella": {
    lat: 6.8667,
    lng: 81.0466,
    highlights: ["Nine Arch Bridge", "Little Adam's Peak Hike", "Ravana Waterfalls", "Scenic Highland Train Ride"],
    hotels: ["98 Acres Resort & Spa", "EKHO Ella", "Ella Flower Garden Resort"],
  },
  "Yala / Tissamaharama": {
    lat: 6.2731,
    lng: 81.2858,
    highlights: ["Yala National Park Leopard Safari", "Tissa Wewa Lake Sunset", "Kataragama Sacred Shrine"],
    hotels: ["Cinnamon Wild Yala", "Jetwing Yala", "Wild Coast Tented Lodge"],
  },
  "Mirissa / Weligama": {
    lat: 5.9483,
    lng: 80.4578,
    highlights: ["Whale & Dolphin Watching Cruise", "Coconut Tree Hill", "Secret Beach Sunset", "Surf Lessons at Weligama"],
    hotels: ["Cape Weligama", "Mandara Resort Mirissa", "W15 Weligama"],
  },
  "Galle": {
    lat: 6.0535,
    lng: 80.221,
    highlights: ["Galle Dutch Fort (UNESCO)", "Lighthouse & Ramparts Walk", "Boutique Artisan Shops", "Maritime Museum"],
    hotels: ["Amangalla Galle", "The Fortress Resort & Spa", "Jetwing Lighthouse"],
  },
  "Bentota": {
    lat: 6.4215,
    lng: 79.9984,
    highlights: ["Madu River Mangrove Boat Safari", "Kosgoda Sea Turtle Hatchery", "Water Sports & Jet Ski"],
    hotels: ["Taj Bentota Resort & Spa", "Heritance Ahungalla", "Cinnamon Bentota Beach"],
  },
};

/**
 * Route Provider Interface allowing future switching between:
 * - Built-in Sri Lanka Matrix
 * - OpenRouteService (ORS)
 * - Mapbox Directions API
 * - Google Maps Directions API
 * - Manual Driver Matrix Override
 */
export interface IRouteProvider {
  name: string;
  calculateDistance(fromCity: string, toCity: string): Promise<{ distanceKm: number; durationMins: number }>;
}

export class MatrixRouteProvider implements IRouteProvider {
  name = "Sri Lanka Road Distance Matrix";

  async calculateDistance(fromCity: string, toCity: string): Promise<{ distanceKm: number; durationMins: number }> {
    const cleanFrom = Object.keys(SRI_LANKA_DISTANCE_MATRIX).find(
      (c) => c.toLowerCase() === fromCity.toLowerCase() || fromCity.toLowerCase().includes(c.toLowerCase())
    );
    const cleanTo = Object.keys(SRI_LANKA_DISTANCE_MATRIX).find(
      (c) => c.toLowerCase() === toCity.toLowerCase() || toCity.toLowerCase().includes(c.toLowerCase())
    );

    if (cleanFrom && cleanTo && SRI_LANKA_DISTANCE_MATRIX[cleanFrom]?.[cleanTo]) {
      const res = SRI_LANKA_DISTANCE_MATRIX[cleanFrom][cleanTo];
      return { distanceKm: res.km, durationMins: res.mins };
    }

    if (cleanTo && cleanFrom && SRI_LANKA_DISTANCE_MATRIX[cleanTo]?.[cleanFrom]) {
      const res = SRI_LANKA_DISTANCE_MATRIX[cleanTo][cleanFrom];
      return { distanceKm: res.km, durationMins: res.mins };
    }

    // Default estimate if not directly in matrix
    return { distanceKm: 85, durationMins: 120 };
  }
}

/**
 * Calculates complete multi-segment Route Plan from a list of city waypoints
 */
export async function calculateRoutePlan(
  cities: string[],
  dayCount: number = cities.length,
  provider: IRouteProvider = new MatrixRouteProvider()
): Promise<RoutePlan> {
  const waypoints: RouteWaypoint[] = [];
  const segments: RouteSegment[] = [];

  let totalKm = 0;
  let totalDrivingMins = 0;

  for (let i = 0; i < cities.length; i++) {
    const cityName = cities[i];
    const geo = SRI_LANKA_DESTINATION_COORDINATES[cityName] || {
      lat: 7.8731,
      lng: 80.7718,
      highlights: [`Explore ${cityName}`],
      hotels: [`Luxury Resorts in ${cityName}`],
    };

    let kmFromPrev = 0;
    let minsFromPrev = 0;

    if (i > 0) {
      const prevCity = cities[i - 1];
      const dist = await provider.calculateDistance(prevCity, cityName);
      kmFromPrev = dist.distanceKm;
      minsFromPrev = dist.durationMins;

      totalKm += kmFromPrev;
      totalDrivingMins += minsFromPrev;

      segments.push({
        id: `seg-${i}`,
        segment_number: i,
        from_city: prevCity,
        to_city: cityName,
        distance_km: kmFromPrev,
        driving_duration_mins: minsFromPrev,
        manual_override: false,
      });
    }

    waypoints.push({
      id: `wp-${i + 1}`,
      city: cityName,
      lat: geo.lat,
      lng: geo.lng,
      km_from_prev: kmFromPrev,
      driving_mins_from_prev: minsFromPrev,
      highlights: geo.highlights,
      recommended_hotels: geo.hotels,
    });
  }

  return {
    id: `route-${Date.now()}`,
    title: `${cities[0]} → ${cities.slice(1, -1).join(" → ")} → ${cities[cities.length - 1]}`,
    day_count: dayCount,
    total_km: totalKm,
    total_driving_duration_mins: totalDrivingMins,
    min_daily_km: 100,
    driver_daily_allowance: 20,
    waypoints,
    segments,
    provider: "matrix",
    calculated_at: new Date().toISOString(),
  };
}

/**
 * Calculates transport vehicle costing from route KM, daily minimums, and driver night bata
 */
export function calculateTransportCost(
  routeKm: number,
  days: number,
  perKmRate: number = 0.85,
  dailyMinKm: number = 100,
  driverDailyBata: number = 20,
  extraKmRate: number = 0.5,
  parkingTolls: number = 40
) {
  const baseKmAllowance = days * dailyMinKm;
  const billableKm = Math.max(routeKm, baseKmAllowance);
  const extraKm = Math.max(0, routeKm - baseKmAllowance);
  const baseVehicleCost = baseKmAllowance * perKmRate;
  const extraKmCost = extraKm * extraKmRate;
  const totalDriverBata = days * driverDailyBata;
  const totalTransportCost = baseVehicleCost + extraKmCost + totalDriverBata + parkingTolls;

  return {
    baseKmAllowance,
    billableKm,
    extraKm,
    baseVehicleCost,
    extraKmCost,
    totalDriverBata,
    parkingTolls,
    totalTransportCost,
  };
}
