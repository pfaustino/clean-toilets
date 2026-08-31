"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Link from "next/link";
import { CITY } from "@/lib/city";
import { feeLabel, formatAvg, pinColor } from "@/lib/display";
import type { Toilet } from "@/lib/types";

type Props = {
  toilets: Toilet[];
};

function makeIcon(color: string) {
  return L.divIcon({
    className: "toilet-pin",
    html: `<span class="toilet-pin-dot" style="background:${color}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -10],
  });
}

export default function ToiletMap({ toilets }: Props) {
  return (
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
      {toilets.map((toilet) => (
        <Marker
          key={toilet.id}
          position={[toilet.lat, toilet.lng]}
          icon={makeIcon(pinColor(toilet.cleanliness_avg))}
        >
          <Popup>
            <div className="min-w-[140px]">
              <Link
                href={`/toilets/${toilet.id}`}
                className="font-medium text-teal-800 underline"
              >
                {toilet.name}
              </Link>
              <p className="mt-1 text-xs">
                {feeLabel(toilet.fee)} · {formatAvg(toilet.cleanliness_avg)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
