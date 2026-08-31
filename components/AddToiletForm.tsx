"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { useRouter } from "next/navigation";
import { CITY, isInCity } from "@/lib/city";
import { createClient } from "@/lib/supabase/client";
import type { Fee } from "@/lib/types";

const pickIcon = L.divIcon({
  className: "toilet-pin",
  html: `<span class="toilet-pin-dot" style="background:#0f766e"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function ClickPicker({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

type Props = {
  userId: string;
};

export default function AddToiletForm({ userId }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [fee, setFee] = useState<Fee>("free");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (lat == null || lng == null) {
      setStatus("error");
      setError("Click the map to set the location.");
      return;
    }
    if (!isInCity(lat, lng)) {
      setStatus("error");
      setError(`Location must be inside ${CITY.name}.`);
      return;
    }
    setStatus("saving");
    setError("");
    try {
      const supabase = createClient();
      const { data, error: saveError } = await supabase
        .from("toilets")
        .insert({
          source: "user",
          name: name.trim(),
          address: address.trim() || null,
          fee,
          lat,
          lng,
          created_by: userId,
        })
        .select("id")
        .single();
      if (saveError || !data) {
        setStatus("error");
        setError(saveError?.message ?? "Could not add toilet");
        return;
      }
      router.push(`/toilets/${data.id}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not add toilet");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="text-sm font-medium text-teal-950">
        Name
        <input
          required
          minLength={2}
          maxLength={80}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-lg border border-teal-800/20 px-3 py-2 outline-none ring-teal-700 focus:ring-2"
        />
      </label>
      <label className="text-sm font-medium text-teal-950">
        Address (optional)
        <input
          maxLength={160}
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          className="mt-1 w-full rounded-lg border border-teal-800/20 px-3 py-2 outline-none ring-teal-700 focus:ring-2"
        />
      </label>
      <fieldset className="text-sm font-medium text-teal-950">
        <legend className="mb-1">Paid or free</legend>
        <div className="flex gap-2">
          {(
            [
              ["free", "Free"],
              ["paid", "Paid"],
              ["unknown", "Unknown"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-full px-3 py-1 ${
                fee === value
                  ? "bg-teal-700 text-white"
                  : "bg-teal-50 text-teal-900"
              }`}
            >
              <input
                type="radio"
                name="fee"
                value={value}
                checked={fee === value}
                onChange={() => setFee(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <p className="mb-1 text-sm font-medium text-teal-950">
          Location — click the map
        </p>
        <div className="h-72 overflow-hidden rounded-lg border border-teal-800/20">
          <MapContainer
            center={[CITY.center.lat, CITY.center.lng]}
            zoom={CITY.defaultZoom}
            className="h-full w-full"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickPicker
              onPick={(nextLat, nextLng) => {
                setLat(nextLat);
                setLng(nextLng);
              }}
            />
            {lat != null && lng != null ? (
              <Marker position={[lat, lng]} icon={pickIcon} />
            ) : null}
          </MapContainer>
        </div>
        <p className="mt-1 text-xs text-teal-800/70">
          {lat != null && lng != null
            ? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
            : "No point selected yet"}
        </p>
      </div>
      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-lg bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Add toilet"}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
