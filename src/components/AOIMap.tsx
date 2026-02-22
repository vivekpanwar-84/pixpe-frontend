"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface AOIMapProps {
    center: [number, number];
    geojson?: any;
    aoiName?: string;
}

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

export default function AOIMap({ center, geojson, aoiName }: AOIMapProps) {
    return (
        <div className="h-full w-full">
            <MapContainer
                center={center}
                zoom={15}
                scrollWheelZoom={false}
                className="h-full w-full rounded-lg z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView center={center} />
                {geojson && (
                    <GeoJSON
                        data={geojson}
                        style={{
                            color: "#3b82f6", // blue-500
                            weight: 3,
                            opacity: 0.8,
                            fillColor: "#3b82f6",
                            fillOpacity: 0.2,
                        }}
                    />
                )}
                <Marker position={center}>
                    <Popup>
                        <div className="font-semibold text-blue-600">{aoiName || "AOI Center"}</div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
