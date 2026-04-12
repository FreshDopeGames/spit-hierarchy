import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ActivityLocation } from "@/hooks/useVoterActivityMap";

interface VoterActivityMapProps {
  locations: ActivityLocation[];
}

const VoterActivityMap = ({ locations }: VoterActivityMapProps) => {
  const withCoords = locations.filter((l) => l.coordinates);

  if (withCoords.length === 0) {
    return (
      <div className="w-full h-[450px] rounded-lg bg-rap-smoke/5 flex items-center justify-center">
        <p className="text-rap-smoke/60 font-kaushan">
          No geographic data yet — activity will appear as users visit
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...withCoords.map((l) => l.count));

  const getRadius = (count: number) => {
    const min = 8;
    const max = 28;
    if (maxCount <= 1) return max;
    return min + ((count / maxCount) * (max - min));
  };

  const getColor = (index: number, total: number) => {
    if (index === 0) return "#FFD700";
    if (index === 1) return "#FFA500";
    if (index === 2) return "#FF6B35";
    const ratio = index / Math.max(total - 1, 1);
    if (ratio < 0.5) return "#CD7F32";
    return "#8B4513";
  };

  return (
    <div className="w-full h-[450px] rounded-lg overflow-hidden border-2 border-rap-gold/20">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%", background: "#0a0a0a" }}
        scrollWheelZoom={true}
        className="z-0"
        minZoom={2}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {withCoords.map((loc, index) => (
          <CircleMarker
            key={loc.label}
            center={[loc.coordinates!.lat, loc.coordinates!.lng]}
            radius={getRadius(loc.count)}
            pathOptions={{
              fillColor: getColor(index, withCoords.length),
              color: "#FFD700",
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.55,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <div className="text-center">
                <div className="font-mogra text-sm">{loc.label}</div>
                <div className="font-kaushan text-xs">
                  {loc.count} {loc.count === 1 ? "user" : "users"}
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default VoterActivityMap;
