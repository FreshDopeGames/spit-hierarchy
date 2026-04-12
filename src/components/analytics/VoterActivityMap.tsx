import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import * as topojson from "topojson-client";
import { ActivityLocation } from "@/hooks/useVoterActivityMap";

interface VoterActivityMapProps {
  locations: ActivityLocation[];
}

const WORLD_TOPO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const VoterActivityMap = ({ locations }: VoterActivityMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [worldData, setWorldData] = useState<any>(null);

  // Fetch world topojson once
  useEffect(() => {
    fetch(WORLD_TOPO_URL)
      .then((r) => r.json())
      .then(setWorldData)
      .catch(console.error);
  }, []);

  const withCoords = locations.filter((l) => l.coordinates);

  useEffect(() => {
    if (!worldData || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 450;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    svg.selectAll("*").remove();

    // Background
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");

    const projection = geoNaturalEarth1()
      .scale(width / 5.5)
      .translate([width / 2, height / 2]);

    const path = geoPath().projection(projection);

    // Draw land
    const countries = topojson.feature(
      worldData,
      worldData.objects.countries
    ) as any;

    svg
      .append("g")
      .selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("d", path as any)
      .attr("fill", "#1a1a2e")
      .attr("stroke", "#2a2a3e")
      .attr("stroke-width", 0.5);

    // Draw borders
    const borders = topojson.mesh(
      worldData,
      worldData.objects.countries,
      (a: any, b: any) => a !== b
    );

    svg
      .append("path")
      .datum(borders)
      .attr("d", path as any)
      .attr("fill", "none")
      .attr("stroke", "#2a2a3e")
      .attr("stroke-width", 0.5);

    if (withCoords.length === 0) return;

    const maxCount = Math.max(...withCoords.map((l) => l.count));

    const getRadius = (count: number) => {
      const min = 6;
      const max = 24;
      if (maxCount <= 1) return max;
      return min + (count / maxCount) * (max - min);
    };

    const getColor = (index: number, total: number) => {
      if (index === 0) return "#FFD700";
      if (index === 1) return "#FFA500";
      if (index === 2) return "#FF6B35";
      const ratio = index / Math.max(total - 1, 1);
      if (ratio < 0.5) return "#CD7F32";
      return "#8B4513";
    };

    // Tooltip
    const tooltip = d3
      .select(container)
      .selectAll(".d3-tooltip")
      .data([null])
      .join("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "rgba(0,0,0,0.85)")
      .style("color", "#FFD700")
      .style("padding", "6px 10px")
      .style("border-radius", "6px")
      .style("font-size", "13px")
      .style("border", "1px solid #FFD70044")
      .style("opacity", 0)
      .style("z-index", 10);

    // Circles
    const g = svg.append("g");

    g.selectAll("circle")
      .data(withCoords)
      .enter()
      .append("circle")
      .attr("cx", (d) => {
        const coords = projection([d.coordinates!.lng, d.coordinates!.lat]);
        return coords ? coords[0] : 0;
      })
      .attr("cy", (d) => {
        const coords = projection([d.coordinates!.lng, d.coordinates!.lat]);
        return coords ? coords[1] : 0;
      })
      .attr("r", (d) => getRadius(d.count))
      .attr("fill", (_, i) => getColor(i, withCoords.length))
      .attr("fill-opacity", 0.55)
      .attr("stroke", "#FFD700")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.8)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill-opacity", 0.85).attr("stroke-width", 3);
        tooltip
          .html(
            `<strong>${d.label}</strong><br/>${d.count} ${d.count === 1 ? "user" : "users"}`
          )
          .style("opacity", 1);
      })
      .on("mousemove", function (event) {
        const rect = container.getBoundingClientRect();
        tooltip
          .style("left", event.clientX - rect.left + 12 + "px")
          .style("top", event.clientY - rect.top - 28 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill-opacity", 0.55).attr("stroke-width", 2);
        tooltip.style("opacity", 0);
      });
  }, [worldData, withCoords]);

  // Resize handler
  useEffect(() => {
    if (!worldData || !svgRef.current || !containerRef.current) return;

    const observer = new ResizeObserver(() => {
      // Re-trigger render by forcing a state update
      setWorldData({ ...worldData });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [worldData]);

  if (withCoords.length === 0 && !worldData) {
    return (
      <div className="w-full h-[450px] rounded-lg bg-rap-smoke/5 flex items-center justify-center">
        <p className="text-rap-smoke/60 font-kaushan">
          No geographic data yet — activity will appear as users visit
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[450px] rounded-lg overflow-hidden border-2 border-rap-gold/20 relative"
    >
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default VoterActivityMap;
