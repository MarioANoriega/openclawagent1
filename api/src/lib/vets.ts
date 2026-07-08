export interface VetResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distanceKm: number;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
}

export interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
// Nominatim's usage policy requires an identifying User-Agent.
const USER_AGENT = "PetPlus/1.0 (pet-plus-api; vet finder)";

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatAddress(tags: Record<string, string>): string | null {
  const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
  const parts = [street, tags["addr:city"], tags["addr:postcode"]].filter(
    (part) => part && part.length > 0,
  );
  return parts.length > 0 ? parts.join(", ") : null;
}

export function normalizeVet(
  element: OverpassElement,
  originLat: number,
  originLon: number,
): VetResult | null {
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  if (lat == null || lon == null) return null;

  const tags = element.tags ?? {};
  return {
    id: `${element.type}/${element.id}`,
    name: tags.name ?? tags.operator ?? "Veterinary clinic",
    lat,
    lon,
    distanceKm: Math.round(haversineKm(originLat, originLon, lat, lon) * 10) / 10,
    address: formatAddress(tags),
    phone: tags.phone ?? tags["contact:phone"] ?? null,
    email: tags.email ?? tags["contact:email"] ?? null,
    website: tags.website ?? tags["contact:website"] ?? null,
  };
}

export function buildOverpassQuery(lat: number, lon: number, radiusM: number): string {
  const around = `(around:${radiusM},${lat},${lon})`;
  return `[out:json][timeout:20];(node["amenity"="veterinary"]${around};way["amenity"="veterinary"]${around};);out center tags 60;`;
}

export async function geocodePostalCode(
  postalCode: string,
  country: string,
): Promise<{ lat: number; lon: number; label: string } | null> {
  const params = new URLSearchParams({
    format: "jsonv2",
    postalcode: postalCode,
    country,
    limit: "1",
  });
  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { "user-agent": USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`Geocoding failed (${response.status})`);
  }
  const results = (await response.json()) as { lat: string; lon: string; display_name: string }[];
  const first = results[0];
  if (!first) return null;
  return { lat: Number(first.lat), lon: Number(first.lon), label: first.display_name };
}

export async function searchNearbyVets(
  lat: number,
  lon: number,
  radiusM: number,
  limit: number,
): Promise<VetResult[]> {
  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": USER_AGENT },
    body: `data=${encodeURIComponent(buildOverpassQuery(lat, lon, radiusM))}`,
  });
  if (!response.ok) {
    throw new Error(`Vet search failed (${response.status})`);
  }
  const data = (await response.json()) as { elements?: OverpassElement[] };

  return (data.elements ?? [])
    .map((element) => normalizeVet(element, lat, lon))
    .filter((vet): vet is VetResult => vet !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
