import AOIMapView from "@/views/surveyor/AOIMapView";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "AOIs Map | Surveyor Dashboard",
    description: "View all Areas of Interest on a map",
};

export default function AOIMapPage() {
    return <AOIMapView />;
}
