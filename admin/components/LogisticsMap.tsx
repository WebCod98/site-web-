'use client';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatXAF, type AdminOrder } from '@/lib/data';

/**
 * SCULPT'AURA Admin — logistics tracking map (Leaflet.js).
 *
 * Plots each pending order at its captured delivery coordinate so the fulfilment
 * team can see the geographic spread of what needs shipping. Markers use a black
 * CSS pin (no default Leaflet icon assets) to stay on the monochrome charter;
 * each pin carries a popup with the order reference, customer and total.
 *
 * Client-only (Leaflet touches `window`); the page imports it via next/dynamic
 * with `ssr: false`.
 */

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

export default function LogisticsMap({ orders }: { orders: AdminOrder[] }) {
  // Centre on Cameroon (national market) by default.
  const center: [number, number] = [4.6, 11.5];

  return (
    <div className="h-[26rem] w-full overflow-hidden border border-neutral-200 grayscale">
      <MapContainer
        center={center}
        zoom={4}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {orders.map((order) =>
          order.deliveryLat !== null && order.deliveryLng !== null ? (
            <Marker
              key={order.id}
              position={[order.deliveryLat, order.deliveryLng]}
              icon={pinIcon}
            >
              <Popup>
                <span className="font-sans text-xs uppercase tracking-editorial">
                  {order.reference}
                </span>
                <br />
                {order.customer}
                <br />
                {order.city} — {formatXAF(order.totalXAF)}
              </Popup>
            </Marker>
          ) : null,
        )}
      </MapContainer>
    </div>
  );
}
