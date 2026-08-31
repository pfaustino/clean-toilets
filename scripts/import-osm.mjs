import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import CITY from "../lib/city.json" with { type: "json" };

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

function mapFee(tags) {
  const fee = (tags.fee || "").toLowerCase();
  if (fee === "no" || fee === "free") return "free";
  if (fee === "yes" || fee === "customers") return "paid";
  return "unknown";
}

function mapName(tags) {
  return (
    tags.name ||
    tags["toilets:name"] ||
    tags.operator ||
    "Public toilet"
  );
}

function mapAddress(tags) {
  const number = tags["addr:housenumber"];
  const street = tags["addr:street"];
  const city = tags["addr:city"];
  const parts = [];
  if (number && street) parts.push(`${number} ${street}`);
  else if (street) parts.push(street);
  if (city) parts.push(city);
  if (parts.length) return parts.join(", ");
  if (tags.description) return String(tags.description).slice(0, 200);
  return null;
}

function elementLatLng(el) {
  if (typeof el.lat === "number" && typeof el.lon === "number") {
    return { lat: el.lat, lng: el.lon };
  }
  if (el.center && typeof el.center.lat === "number") {
    return { lat: el.center.lat, lng: el.center.lon };
  }
  return null;
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const { south, west, north, east } = CITY.bbox;
const overpassQuery = `[out:json][timeout:90];
(
  node["amenity"="toilets"](${south},${west},${north},${east});
  way["amenity"="toilets"](${south},${west},${north},${east});
);
out center tags;`;

const overpassUrls = process.env.OVERPASS_URL
  ? [process.env.OVERPASS_URL]
  : [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
    ];

console.log(`Fetching OSM toilets for ${CITY.name}…`);

const overpassHeaders = {
  "Content-Type": "application/x-www-form-urlencoded",
  Accept: "application/json",
  "User-Agent":
    "LurkersCleanToilets/0.1 (https://github.com/pfaustino/clean-toilets)",
};
const overpassBody = new URLSearchParams({ data: overpassQuery });

let payload = null;
for (const overpassUrl of overpassUrls) {
  const overpassRes = await fetch(overpassUrl, {
    method: "POST",
    headers: overpassHeaders,
    body: overpassBody,
  });
  if (!overpassRes.ok) {
    const errText = await overpassRes.text();
    console.warn(`Overpass ${overpassRes.status} from ${overpassUrl}`);
    console.warn(errText.slice(0, 200));
    continue;
  }
  payload = await overpassRes.json();
  break;
}

if (!payload) {
  console.error("All Overpass endpoints failed.");
  process.exit(1);
}
const elements = Array.isArray(payload.elements) ? payload.elements : [];

const rows = [];
const seen = new Set();

for (const el of elements) {
  const pos = elementLatLng(el);
  if (!pos) continue;
  const osmId = `${el.type}/${el.id}`;
  if (seen.has(osmId)) continue;
  seen.add(osmId);
  const tags = el.tags || {};
  rows.push({
    osm_id: osmId,
    source: "osm",
    name: mapName(tags),
    lat: pos.lat,
    lng: pos.lng,
    address: mapAddress(tags),
    fee: mapFee(tags),
  });
}

console.log(`Mapped ${rows.length} toilets. Upserting into Supabase…`);

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const chunkSize = 200;
let upserted = 0;

for (let i = 0; i < rows.length; i += chunkSize) {
  const chunk = rows.slice(i, i + chunkSize);
  const { error } = await supabase.from("toilets").upsert(chunk, {
    onConflict: "osm_id",
    ignoreDuplicates: false,
  });
  if (error) {
    console.error("Upsert failed:", error.message);
    process.exit(1);
  }
  upserted += chunk.length;
  console.log(`  ${upserted}/${rows.length}`);
}

console.log(`Done. Imported ${rows.length} OSM toilets for ${CITY.name}.`);
