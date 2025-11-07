import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CityStats } from "@/hooks/useTopCitiesStats";

interface CityMapProps {
  cities: CityStats[];
}

const CityMap = ({ cities }: CityMapProps) => {
  // Filter cities that have coordinates
  const citiesWithCoords = cities.filter(city => city.coordinates);

  if (citiesWithCoords.length === 0) {
    return (
      <div className="w-full h-[300px] rounded-lg bg-rap-smoke/5 flex items-center justify-center">
        <p className="text-rap-smoke/60 font-kaushan">Map data unavailable</p>
      </div>
    );
  }

  // Calculate colors based on ranking
  const getMarkerColor = (index: number) => {
    if (index === 0) return "#FFD700"; // Gold for #1
    if (index === 1) return "#FFA500"; // Orange for #2
    if (index === 2) return "#FF6B35"; // Red-orange for #3
    if (index === 3) return "#8B0000"; // Dark red for #4
    return "#4A0404"; // Burgundy for #5
  };

  // Calculate marker size based on ranking
  const getMarkerRadius = (index: number) => {
    return 20 - (index * 3); // #1: 20px, #2: 17px, etc.
  };

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border-2 border-rap-gold/20">
      <MapContainer
        center={[40, -95]}
        zoom={4}
        style={{ height: "100%", width: "100%", background: "#1a1a1a" }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        {citiesWithCoords.map((city, index) => (
          <CircleMarker
            key={city.location}
            center={[city.coordinates!.lat, city.coordinates!.lng]}
            radius={getMarkerRadius(index)}
            pathOptions={{
              fillColor: getMarkerColor(index),
              color: "#FFD700",
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.6,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <div className="text-center">
                <div className="font-mogra text-sm">#{index + 1} {city.location}</div>
                <div className="font-kaushan text-xs">{city.count} rappers</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CityMap;
