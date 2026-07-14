"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Layers, Satellite, Navigation, Search, Wind, Droplets, Thermometer, AlertTriangle, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";

const API_BASE = "http://127.0.0.1:3001";

interface SiteMarker {
  id: string;
  lat: number;
  lon: number;
  label: string;
  type: "site" | "equipment" | "camera" | "drone";
  color: string;
}

interface GISMapViewerProps {
  initialLat?: number;
  initialLon?: number;
  markers?: SiteMarker[];
  onLocationSelect?: (lat: number, lon: number, address: string) => void;
}

export default function GISMapViewer({
  initialLat = 13.0827,
  initialLon = 80.2707,
  markers = [],
  onLocationSelect,
}: GISMapViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLon, setCurrentLon] = useState(initialLon);
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite" | "terrain">("streets");
  const [siteAnalysis, setSiteAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [zoom, setZoom] = useState(14);

  const MAP_STYLES = {
    streets: "https://demotiles.maplibre.org/style.json",
    satellite: "https://demotiles.maplibre.org/style.json",
    terrain: "https://demotiles.maplibre.org/style.json",
  };

  // OpenStreetMap tile style (completely free)
  const OSM_STYLE = {
    version: 8 as const,
    sources: {
      osm: {
        type: "raster" as const,
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
        maxzoom: 19,
      },
    },
    layers: [
      {
        id: "osm-tiles",
        type: "raster" as const,
        source: "osm",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let map: any = null;
    
    // Dynamically import maplibre-gl to avoid SSR issues
    import("maplibre-gl").then(({ default: maplibregl }) => {
      // Import CSS dynamically
      if (typeof window !== "undefined") {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/maplibre-gl/dist/maplibre-gl.css";
        document.head.appendChild(link);
      }

      map = new maplibregl.Map({
        container: mapContainerRef.current!,
        style: OSM_STYLE,
        center: [currentLon, currentLat],
        zoom: zoom,
      });

      mapRef.current = map;

      map.on("load", () => {
        setMapLoaded(true);

        // Add navigation controls
        map.addControl(new maplibregl.NavigationControl(), "top-right");
        map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

        // Add site marker
        const siteEl = document.createElement("div");
        siteEl.style.cssText = `
          width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
          background: #06b6d4; border: 3px solid white;
          transform: rotate(-45deg); cursor: pointer;
          box-shadow: 0 2px 8px rgba(6, 182, 212, 0.6);
        `;

        new maplibregl.Marker({ element: siteEl, anchor: "bottom" })
          .setLngLat([currentLon, currentLat])
          .setPopup(new maplibregl.Popup({ offset: 25 })
            .setHTML(`<div style="color:#000;font-weight:bold;">📍 Construction Site</div>`))
          .addTo(map);

        // Click to select location
        map.on("click", async (e: any) => {
          const { lat, lng } = e.lngLat;
          setCurrentLat(lat);
          setCurrentLon(lng);
          if (onLocationSelect) {
            try {
              const res = await fetch(`${API_BASE}/gis/reverse-geocode?lat=${lat}&lon=${lng}`);
              if (res.ok) {
                const data = await res.json();
                onLocationSelect(lat, lng, data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
              }
            } catch { onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`); }
          }
        });
      });

      map.on("zoom", () => {
        setZoom(Math.round(map.getZoom()));
      });
    });

    return () => {
      if (map) map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(`${API_BASE}/gis/geocode?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.slice(0, 5));
      }
    } catch (e) { console.error("Search error", e); }
    finally { setIsSearching(false); }
  };

  const flyToLocation = useCallback((lat: number, lon: number) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center: [lon, lat], zoom: 16, speed: 1.5, curve: 1.5 });
    setCurrentLat(lat);
    setCurrentLon(lon);
    setSearchResults([]);
  }, []);

  const runSiteAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(`${API_BASE}/gis/site-analysis?lat=${currentLat}&lon=${currentLon}`);
      if (res.ok) {
        const data = await res.json();
        setSiteAnalysis(data);
      }
    } catch (e) { console.error("Site analysis error", e); }
    finally { setIsAnalyzing(false); }
  };

  const riskColor = (risk: string) => {
    if (risk === "CRITICAL" || risk === "POOR" || risk === "HIGH") return "#ef4444";
    if (risk === "MEDIUM" || risk === "MODERATE") return "#f59e0b";
    if (risk === "LOW" || risk === "GOOD") return "#10b981";
    return "#06b6d4";
  };

  return (
    <div style={{ display: "flex", gap: "1rem", height: "100%" }}>
      {/* Map Container */}
      <div style={{ flex: 1, position: "relative", borderRadius: "12px", overflow: "hidden", minHeight: "500px" }}>
        
        {/* Search Bar Overlay */}
        <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 10, width: "320px" }}>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search location, address..."
              style={{
                flex: 1, padding: "0.6rem 1rem", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(9,9,11,0.9)", color: "#fff",
                fontSize: "0.85rem", backdropFilter: "blur(8px)"
              }}
            />
            <button type="submit" disabled={isSearching} style={{
              padding: "0.6rem 0.8rem", borderRadius: "8px",
              background: "#06b6d4", border: "none", cursor: "pointer", color: "#000"
            }}>
              {isSearching ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
          </form>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div style={{
              background: "rgba(9,9,11,0.95)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px", marginTop: "0.25rem", overflow: "hidden", backdropFilter: "blur(8px)"
            }}>
              {searchResults.map((r, i) => (
                <button key={i} onClick={() => flyToLocation(r.lat, r.lon)}
                  style={{
                    width: "100%", padding: "0.6rem 1rem", textAlign: "left",
                    background: "transparent", border: "none", color: "#fff",
                    cursor: "pointer", fontSize: "0.8rem",
                    borderBottom: i < searchResults.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"
                  }}>
                  <MapPin size={12} style={{ marginRight: "0.4rem", color: "#06b6d4" }} />
                  {r.display_name.substring(0, 60)}...
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Style Switcher */}
        <div style={{ position: "absolute", top: "1rem", right: "3.5rem", zIndex: 10, display: "flex", gap: "0.4rem" }}>
          {(["streets", "satellite", "terrain"] as const).map(style => (
            <button key={style} onClick={() => setMapStyle(style)}
              style={{
                padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.7rem",
                background: mapStyle === style ? "#06b6d4" : "rgba(9,9,11,0.9)",
                color: mapStyle === style ? "#000" : "#fff",
                border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer",
                backdropFilter: "blur(8px)", textTransform: "capitalize"
              }}>
              {style === "satellite" ? <><Satellite size={11} /> Satellite</> : style === "terrain" ? <><Layers size={11} /> Terrain</> : <><Navigation size={11} /> Streets</>}
            </button>
          ))}
        </div>

        {/* Coordinates Bar */}
        <div style={{
          position: "absolute", bottom: "3rem", left: "50%", transform: "translateX(-50%)",
          zIndex: 10, background: "rgba(9,9,11,0.9)", padding: "0.4rem 1rem",
          borderRadius: "20px", fontSize: "0.75rem", color: "#06b6d4",
          border: "1px solid rgba(6,182,212,0.3)", backdropFilter: "blur(8px)"
        }}>
          <MapPin size={11} style={{ marginRight: "0.3rem" }} />
          {currentLat.toFixed(6)}°N, {currentLon.toFixed(6)}°E  |  Zoom: {zoom}
        </div>

        {/* Analyze Site Button */}
        <button onClick={runSiteAnalysis} disabled={isAnalyzing}
          style={{
            position: "absolute", bottom: "1rem", right: "1rem", zIndex: 10,
            padding: "0.6rem 1rem", borderRadius: "8px", fontSize: "0.8rem",
            background: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
            color: "#fff", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "0.4rem"
          }}>
          {isAnalyzing ? <RefreshCw size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
          {isAnalyzing ? "Analyzing..." : "Analyze This Site"}
        </button>

        {/* MapLibre container */}
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%", minHeight: "500px" }} />
        
        {!mapLoaded && (
          <div style={{
            position: "absolute", inset: 0, background: "#0a0a0f",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem"
          }}>
            <div style={{ width: "48px", height: "48px", border: "3px solid #06b6d4", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <p style={{ color: "#06b6d4", fontSize: "0.9rem" }}>Loading AeroTwin GIS Engine...</p>
            <p style={{ color: "#555", fontSize: "0.75rem" }}>Powered by MapLibre GL + OpenStreetMap</p>
          </div>
        )}
      </div>

      {/* Side Panel: Site Analysis */}
      <div style={{ width: "280px", display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto" }}>
        
        {/* GPS Coordinates */}
        <div className="glass-panel">
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>
            📍 Site Location
          </div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{currentLat.toFixed(6)}°N</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{currentLon.toFixed(6)}°E</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
            Click map to update location
          </div>
        </div>

        {/* Site Analysis Results */}
        {siteAnalysis && (
          <>
            {/* Overall Score */}
            <div className="glass-panel" style={{ background: `linear-gradient(135deg, ${riskColor(siteAnalysis.overall_rating)}20, transparent)`, borderColor: riskColor(siteAnalysis.overall_rating) + "40" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Site Score</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: riskColor(siteAnalysis.overall_rating) }}>{siteAnalysis.site_score}</div>
              <div style={{ fontSize: "0.75rem", color: riskColor(siteAnalysis.overall_rating), fontWeight: 600 }}>{siteAnalysis.overall_rating}</div>
              {siteAnalysis.risk_factors?.map((r: string, i: number) => (
                <div key={i} style={{ fontSize: "0.7rem", color: "#f59e0b", marginTop: "0.3rem" }}>{r}</div>
              ))}
            </div>

            {/* Weather */}
            {siteAnalysis.weather && !siteAnalysis.weather.error && (
              <div className="glass-panel">
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>☁️ Weather</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><Thermometer size={12} color="#f59e0b" /> Temp</span>
                    <strong>{siteAnalysis.weather.temperature}°C</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><Wind size={12} color="#06b6d4" /> Wind</span>
                    <strong>{siteAnalysis.weather.wind_speed} km/h</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><Droplets size={12} color="#3b82f6" /> Rain</span>
                    <strong>{siteAnalysis.weather.precipitation} mm</strong>
                  </div>
                  <div style={{ marginTop: "0.3rem", padding: "0.4rem", borderRadius: "6px", background: riskColor(siteAnalysis.weather.construction_risk) + "20", fontSize: "0.7rem", color: riskColor(siteAnalysis.weather.construction_risk), fontWeight: 600 }}>
                    {siteAnalysis.weather.construction_risk}: {siteAnalysis.weather.weather_desc}
                  </div>
                </div>
              </div>
            )}

            {/* Elevation */}
            {siteAnalysis.elevation && !siteAnalysis.elevation.error && (
              <div className="glass-panel">
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>🏔️ Elevation</div>
                <div style={{ fontSize: "1.3rem", fontWeight: "bold" }}>{siteAnalysis.elevation.elevation_m}m</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>{siteAnalysis.elevation.slope_category}</div>
                <div style={{ fontSize: "0.7rem", color: riskColor(siteAnalysis.elevation.flood_risk), marginTop: "0.3rem", fontWeight: 600 }}>
                  Flood Risk: {siteAnalysis.elevation.flood_risk}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>{siteAnalysis.elevation.foundation_recommendation}</div>
              </div>
            )}

            {/* Soil */}
            {siteAnalysis.soil && !siteAnalysis.soil.error && (
              <div className="glass-panel">
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>🏗️ Soil Analysis</div>
                <div style={{ fontSize: "0.9rem", fontWeight: "bold", marginBottom: "0.4rem" }}>{siteAnalysis.soil.soil_type}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  {[
                    { label: "Sand", val: siteAnalysis.soil.sand_percent, color: "#f59e0b" },
                    { label: "Clay", val: siteAnalysis.soil.clay_percent, color: "#ef4444" },
                    { label: "Silt", val: siteAnalysis.soil.silt_percent, color: "#10b981" },
                  ].map(item => (
                    <div key={item.label} style={{ fontSize: "0.75rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.15rem" }}>
                        <span>{item.label}</span>
                        <span style={{ color: item.color }}>{item.val}%</span>
                      </div>
                      <div style={{ width: "100%", height: "3px", background: "#1f1f23", borderRadius: "2px" }}>
                        <div style={{ height: "100%", background: item.color, width: `${item.val}%`, borderRadius: "2px" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", fontWeight: "bold", color: "#06b6d4" }}>
                  Bearing: {siteAnalysis.soil.bearing_capacity_kPa} kPa
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{siteAnalysis.soil.foundation_type}</div>
              </div>
            )}
          </>
        )}

        {!siteAnalysis && (
          <div className="glass-panel" style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)" }}>
            <AlertTriangle size={28} style={{ margin: "0 auto 0.5rem", color: "#3b82f6" }} />
            <p style={{ fontSize: "0.8rem" }}>Click "Analyze This Site" to get weather, elevation & soil analysis for this GPS location</p>
          </div>
        )}
      </div>
    </div>
  );
}
