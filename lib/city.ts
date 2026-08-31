import cityJson from "@/lib/city.json";

export const CITY = cityJson;

export function isInCity(lat: number, lng: number): boolean {
  const { south, west, north, east } = CITY.bbox;
  return lat >= south && lat <= north && lng >= west && lng <= east;
}
