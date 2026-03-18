"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Leaflet + Next.js
const createIcon = (color: string) => L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const blueIcon = createIcon('blue');
const greenIcon = createIcon('green');
const greyIcon = createIcon('grey');
const yellowIcon = createIcon('yellow');

const getStatusIcon = (status: string, isAssigned: boolean, isMine: boolean) => {
    if (!isAssigned) return yellowIcon;
    if (isMine) return greenIcon;
    switch (status) {
        case 'COMPLETED':
        case 'CLOSED':
            return greenIcon;
        case 'DRAFT':
            return greyIcon;
        default:
            return blueIcon;
    }
};

interface AOI {
    id: string;
    aoi_name: string;
    aoi_code: string;
    boundary_geojson: any;
    center_latitude: number;
    center_longitude: number;
    status: string;
    assigned_to_surveyor_id?: string;
}

interface AOIMultiMapProps {
    aois: AOI[];
    onSelectAoi?: (aoi: AOI) => void;
    focusedAoiId?: string | null;
    currentUserId?: string;
}

function MapController({ aois, focusedAoiId }: { aois: AOI[], focusedAoiId?: string | null }) {
    const map = useMap();

    useEffect(() => {
        if (focusedAoiId) {
            const focusedAoi = aois.find(a => a.id === focusedAoiId);
            if (focusedAoi) {
                map.setView(
                    [Number(focusedAoi.center_latitude), Number(focusedAoi.center_longitude)],
                    15, // Zoom level for focus
                    { animate: true }
                );
            }
        } else if (aois.length > 0) {
            const bounds = L.latLngBounds(aois.map(aoi => [Number(aoi.center_latitude), Number(aoi.center_longitude)]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [aois, focusedAoiId, map]);

    return null;
}

export default function AOIMultiMap({ aois, onSelectAoi, focusedAoiId, currentUserId }: AOIMultiMapProps) {
    const defaultCenter: [number, number] = aois.length > 0
        ? [Number(aois[0].center_latitude), Number(aois[0].center_longitude)]
        : [20.5937, 78.9629]; // Default center of India

    const getAoiColor = (aoi: AOI) => {
        if (!aoi.assigned_to_surveyor_id) return "#eab308"; // yellow-500
        const isMine = aoi.assigned_to_surveyor_id === currentUserId;
        if (isMine) return "#10b981"; // emerald-500/green
        return aoi.status === 'COMPLETED' ? "#10b981" : "#3b82f6"; // or blue-500
    };

    return (
        <div className="h-full w-full">
            <MapContainer
                center={defaultCenter}
                zoom={5}
                scrollWheelZoom={true}
                className="h-full w-full rounded-lg z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController aois={aois} focusedAoiId={focusedAoiId} />
                {aois.map((aoi) => (
                    <div key={aoi.id}>
                        {aoi.boundary_geojson && (
                            <GeoJSON
                                data={aoi.boundary_geojson}
                                style={{
                                    color: getAoiColor(aoi),
                                    weight: 3,
                                    opacity: 0.8,
                                    fillColor: getAoiColor(aoi),
                                    fillOpacity: 0.2,
                                }}
                            />
                        )}
                        <Marker
                            position={[Number(aoi.center_latitude), Number(aoi.center_longitude)]}
                            icon={getStatusIcon(aoi.status, !!aoi.assigned_to_surveyor_id, aoi.assigned_to_surveyor_id === currentUserId)}
                            eventHandlers={{
                                click: () => onSelectAoi?.(aoi)
                            }}
                        >
                            <Popup>
                                <div className="p-1 min-w-[150px]">
                                    <h3 className="font-bold text-blue-600 mb-1">{aoi.aoi_name}</h3>
                                    <p className="text-xs text-gray-500 mb-1">Code: {aoi.aoi_code}</p>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${!aoi.assigned_to_surveyor_id ? "bg-yellow-100 text-yellow-700" :
                                                aoi.status === 'COMPLETED' ? "bg-green-100 text-green-700" :
                                                    aoi.status === 'IN_PROGRESS' ? "bg-blue-100 text-blue-700" :
                                                        "bg-gray-100 text-gray-700"
                                                }`}>
                                                {!aoi.assigned_to_surveyor_id ? "Available" : aoi.assigned_to_surveyor_id === currentUserId ? "Assigned (You)" : "Assigned"}
                                            </span>
                                        </div>
                                        {aoi.assigned_to_surveyor_id ? (
                                            aoi.assigned_to_surveyor_id === currentUserId ? (
                                                <a
                                                    href={`/surveyor/aoi/${aoi.id}`}
                                                    className="text-[10px] text-blue-600 hover:underline font-semibold"
                                                >
                                                    View Details
                                                </a>
                                            ) : (
                                                <span className="text-[10px] text-gray-400 italic">Already Assigned</span>
                                            )
                                        ) : (
                                            <button
                                                onClick={() => onSelectAoi?.(aoi)}
                                                className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 font-semibold"
                                            >
                                                Request Assignment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    </div>
                ))}
            </MapContainer>
        </div>
    );
}
