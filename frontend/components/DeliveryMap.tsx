'use client';

import { useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * SCULPT'AURA — delivery coordinate capture (Leaflet.js, open-source maps).
 *
 * The customer clicks the map to drop a pin; the lat/lng are lifted to the
 * checkout form and later stored on the order (orders.delivery_lat/lng). We use
 * a CSS `divIcon` for the marker — a small black pin — so the map stays on the
 * monochrome charter and avoids Leaflet's default (colourful, often broken under
 * bundlers) marker images entirely.
 *
 * This component is client-only; the checkout imports it via next/dynamic with
 * `ssr: false` because Leaflet touches `window` at module load.
 */

export type LatLng = { lat: number; lng: number };

// Douala, Cameroon — the national market's economic capital.
const DEFAULT_CENTER: LatLng = { lat: 4.0511, lng: 9.7679 };

/** A minimal black pin drawn purely with CSS, kept on-charter. */
const pinIcon = L.divIcon({
  className: 'sculptaura-pin',
  html: `<span style="
    display:block;width:16px;height:16px;border-radius:50% 50% 50% 0;
    background:#171717;transform:rotate(-45deg);
    box-shadow:0 2px 6px rgba(0,0,0,0.35);
    border:2px solid #ffffff;"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 16],
});

/** Internal helper: registers the click handler to move the pin. */
function ClickCapture({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function DeliveryMap({
  value,
  onChange,
}: {
  value: LatLng | null;
  onChange: (p: LatLng) => void;
}) {
  const center = useMemo<LatLng>(() => value ?? DEFAULT_CENTER, [value]);

  return (
    <div className="h-80 w-full overflow-hidden border border-neutral-200 grayscale">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Open-source tiles (CARTO light — reads well under the grayscale filter). */}
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ClickCapture onPick={onChange} />
        {value && <Marker position={[value.lat, value.lng]} icon={pinIcon} />}
      </MapContainer>
    </div>
  );
}
