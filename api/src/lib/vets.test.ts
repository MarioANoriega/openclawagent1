import { describe, expect, it } from "vitest";
import { buildOverpassQuery, formatAddress, haversineKm, normalizeVet } from "./vets";
import { extractVetReferral, VET_REFERRAL_MARKER } from "./anthropic";

describe("haversineKm", () => {
  it("returns 0 for identical points", () => {
    expect(haversineKm(40.75, -73.99, 40.75, -73.99)).toBe(0);
  });

  it("computes a known distance (NYC to Philadelphia ~130km)", () => {
    const km = haversineKm(40.7128, -74.006, 39.9526, -75.1652);
    expect(km).toBeGreaterThan(120);
    expect(km).toBeLessThan(140);
  });
});

describe("formatAddress", () => {
  it("joins housenumber, street, city, and postcode", () => {
    expect(
      formatAddress({
        "addr:housenumber": "410",
        "addr:street": "W 55th St",
        "addr:city": "New York",
        "addr:postcode": "10019",
      }),
    ).toBe("410 W 55th St, New York, 10019");
  });

  it("returns null when no address tags exist", () => {
    expect(formatAddress({ name: "Some Clinic" })).toBeNull();
  });

  it("handles partial addresses", () => {
    expect(formatAddress({ "addr:city": "Brooklyn" })).toBe("Brooklyn");
  });
});

describe("normalizeVet", () => {
  const origin = { lat: 40.75, lon: -73.99 };

  it("normalizes a node with contact tags", () => {
    const vet = normalizeVet(
      {
        type: "node",
        id: 123,
        lat: 40.76,
        lon: -73.98,
        tags: {
          name: "Midtown Animal Hospital",
          phone: "+1 212 555 0100",
          email: "hello@midtownvet.example",
          website: "https://midtownvet.example",
        },
      },
      origin.lat,
      origin.lon,
    );

    expect(vet).toMatchObject({
      id: "node/123",
      name: "Midtown Animal Hospital",
      phone: "+1 212 555 0100",
      email: "hello@midtownvet.example",
      website: "https://midtownvet.example",
    });
    expect(vet?.distanceKm).toBeGreaterThan(0);
    expect(vet?.distanceKm).toBeLessThan(3);
  });

  it("uses way center coordinates and contact:* fallbacks", () => {
    const vet = normalizeVet(
      {
        type: "way",
        id: 456,
        center: { lat: 40.74, lon: -74.0 },
        tags: { "contact:phone": "+1 212 555 0199", "contact:website": "https://w.example" },
      },
      origin.lat,
      origin.lon,
    );

    expect(vet?.id).toBe("way/456");
    expect(vet?.name).toBe("Veterinary clinic");
    expect(vet?.phone).toBe("+1 212 555 0199");
    expect(vet?.website).toBe("https://w.example");
  });

  it("returns null when coordinates are missing", () => {
    expect(normalizeVet({ type: "way", id: 789, tags: { name: "X" } }, 40, -73)).toBeNull();
  });
});

describe("buildOverpassQuery", () => {
  it("includes amenity filter, radius, and coordinates", () => {
    const q = buildOverpassQuery(40.75, -73.99, 20000);
    expect(q).toContain('"amenity"="veterinary"');
    expect(q).toContain("around:20000,40.75,-73.99");
    expect(q).toContain("out center tags");
  });
});

describe("extractVetReferral", () => {
  it("strips the marker and sets the flag", () => {
    const { text, vetReferral } = extractVetReferral(
      `Take Milo to a vet today.\n${VET_REFERRAL_MARKER}`,
    );
    expect(vetReferral).toBe(true);
    expect(text).toBe("Take Milo to a vet today.");
  });

  it("leaves normal replies untouched", () => {
    const { text, vetReferral } = extractVetReferral("Blueberries are fine as treats.");
    expect(vetReferral).toBe(false);
    expect(text).toBe("Blueberries are fine as treats.");
  });
});
