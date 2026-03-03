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

const RedIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface AOIMapProps {
    center: [number, number];
    geojson?: any;
    aoiName?: string;
    photos?: any[];
}

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

export default function AOIMap({ center, geojson, aoiName, photos = [] }: AOIMapProps) {
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

                {photos.filter(p => p.latitude && p.longitude).map((photo) => (
                    <Marker
                        key={photo.id}
                        position={[Number(photo.latitude), Number(photo.longitude)]}
                        icon={RedIcon}
                    >
                        <Popup>
                            <div className="p-1 space-y-2 min-w-[150px]">
                                <div className="font-bold text-red-600 uppercase text-[10px] tracking-wider">
                                    {photo.photo_type.replace("_", " ")}
                                </div>
                                {photo.photo_url && (
                                    <div className="w-full aspect-video rounded overflow-hidden bg-gray-100">
                                        <img
                                            src={photo.photo_url}
                                            alt={photo.photo_type}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="text-[10px] text-gray-500 italic">
                                    Captured: {new Date(photo.created_at).toLocaleString()}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
