"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Cloud, Wind, Droplets, Thermometer, Eye, Sun, CloudRain,
  CloudSnow, Zap, AlertTriangle, RefreshCw, CheckCircle2
} from "lucide-react";

const API_BASE = "http://127.0.0.1:3001";

// Weather code to icon + description mapping
const weatherIcon = (code: number) => {
  if (code === 0 || code === 1) return <Sun size={18} color="#f59e0b" />;
  if (code <= 3) return <Cloud size={18} color="#94a3b8" />;
  if (code <= 55) return <Droplets size={18} color="#60a5fa" />;
  if (code <= 67) return <CloudRain size={18} color="#3b82f6" />;
  if (code <= 77) return <CloudSnow size={18} color="#e2e8f0" />;
  if (code <= 82) return <CloudRain size={18} color="#818cf8" />;
  return <Zap size={18} color="#f59e0b" />;
};

const windDirectionLabel = (deg: number) => {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
};

const riskStyle = (risk: string) => {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    CRITICAL: { bg: "rgba(239,68,68,0.15)", text: "#ef4444", border: "#ef4444" },
    HIGH:     { bg: "rgba(239,68,68,0.1)",  text: "#f97316", border: "#f97316" },
    MEDIUM:   { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "#f59e0b" },
    LOW:      { bg: "rgba(16,185,129,0.1)", text: "#10b981", border: "#10b981" },
    SAFE:     { bg: "rgba(6,182,212,0.1)",  text: "#06b6d4", border: "#06b6d4" },
  };
  return map[risk] || map["SAFE"];
};

interface WeatherWidgetProps {
  lat: number;
  lon: number;
  compact?: boolean;
}

export default function WeatherWidget({ lat, lon, compact = false }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState(0);
  const intervalRef = useRef<any>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/gis/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error("Failed to fetch weather");
      setWeather(await res.json());
    } catch (e: any) {
      setError(e.message || "Weather unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Refresh every 10 minutes
    intervalRef.current = setInterval(fetchWeather, 600000);
    return () => clearInterval(intervalRef.current);
  }, [lat, lon]);

  if (compact && weather) {
    const rs = riskStyle(weather.construction_risk);
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: "0.75rem",
        padding: "0.6rem 1rem", borderRadius: "8px",
        background: rs.bg, border: `1px solid ${rs.border}30`
      }}>
        {weatherIcon(weather.weather_code)}
        <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{weather.temperature}°C</span>
        <span style={{ fontSize: "0.75rem", color: rs.text, fontWeight: 600 }}>
          {weather.construction_risk}
        </span>
        <Wind size={13} color="#06b6d4" />
        <span style={{ fontSize: "0.75rem" }}>{weather.wind_speed}km/h</span>
      </div>
    );
  }

  if (loading) return (
    <div className="glass-panel" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", minHeight: "200px" }}>
      <RefreshCw size={18} className="animate-spin" color="#06b6d4" />
      <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Fetching live weather...</span>
    </div>
  );

  if (error) return (
    <div className="glass-panel" style={{ textAlign: "center", padding: "1.5rem", color: "#ef4444" }}>
      <AlertTriangle size={24} style={{ margin: "0 auto 0.5rem" }} />
      <p style={{ fontSize: "0.8rem" }}>{error}</p>
      <button onClick={fetchWeather} className="btn btn-secondary" style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
        Retry
      </button>
    </div>
  );

  if (!weather) return null;

  const rs = riskStyle(weather.construction_risk);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      
      {/* Current Conditions Hero */}
      <div className="glass-panel" style={{ background: `linear-gradient(135deg, ${rs.bg}, transparent)`, border: `1px solid ${rs.border}30` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              {weatherIcon(weather.weather_code)}
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{weather.weather_desc}</span>
            </div>
            <div style={{ fontSize: "3rem", fontWeight: "bold", lineHeight: 1 }}>{weather.temperature}°C</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
              Humidity: {weather.humidity}% · Visibility: {(weather.visibility / 1000).toFixed(1)} km
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <button onClick={fetchWeather} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.25rem" }}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Wind */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem" }}>
            <Wind size={14} color="#06b6d4" />
            <span>{weather.wind_speed} km/h {windDirectionLabel(weather.wind_direction)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem" }}>
            <Droplets size={14} color="#3b82f6" />
            <span>{weather.precipitation} mm rain</span>
          </div>
        </div>
      </div>

      {/* Construction Risk Alert */}
      <div style={{
        padding: "0.75rem 1rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.75rem",
        background: rs.bg, border: `1px solid ${rs.border}40`
      }}>
        {weather.construction_risk === "SAFE" ? (
          <CheckCircle2 size={20} color={rs.text} />
        ) : (
          <AlertTriangle size={20} color={rs.text} />
        )}
        <div>
          <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: rs.text }}>
            Construction Risk: {weather.construction_risk}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            {weather.risk_reason}
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="glass-panel">
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.75rem" }}>
          7-Day Construction Forecast
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
          {weather.forecast_7days?.slice(0, 7).map((day: any, i: number) => {
            const dayRisk = day.max_wind > 50 || day.precipitation > 20 ? "HIGH" : day.precipitation > 5 ? "MEDIUM" : "SAFE";
            const dr = riskStyle(dayRisk);
            const dateObj = new Date(day.date);
            const dayName = i === 0 ? "Today" : dateObj.toLocaleDateString("en", { weekday: "short" });
            return (
              <button key={i} onClick={() => setActiveDay(i)}
                style={{
                  padding: "0.5rem 0.25rem", borderRadius: "8px", textAlign: "center",
                  background: activeDay === i ? dr.bg : "rgba(255,255,255,0.03)",
                  border: `1px solid ${activeDay === i ? dr.border : "rgba(255,255,255,0.05)"}`,
                  cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem"
                }}>
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{dayName}</span>
                {weatherIcon(day.weather_code)}
                <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>{day.max_temp}°</span>
                <span style={{ fontSize: "0.6rem", color: "#3b82f6" }}>{day.precipitation}mm</span>
              </button>
            );
          })}
        </div>

        {/* Selected day details */}
        {weather.forecast_7days?.[activeDay] && (
          <div style={{ marginTop: "0.75rem", padding: "0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.03)", fontSize: "0.8rem" }}>
            <div style={{ fontWeight: 600, marginBottom: "0.3rem" }}>
              {activeDay === 0 ? "Today" : new Date(weather.forecast_7days[activeDay].date).toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
            </div>
            <div style={{ display: "flex", gap: "1rem", color: "var(--text-secondary)", flexWrap: "wrap" }}>
              <span>🌡️ {weather.forecast_7days[activeDay].min_temp}–{weather.forecast_7days[activeDay].max_temp}°C</span>
              <span>💧 {weather.forecast_7days[activeDay].precipitation}mm</span>
              <span>💨 {weather.forecast_7days[activeDay].max_wind}km/h max</span>
            </div>
          </div>
        )}
      </div>

      {/* Construction Activity Guide */}
      <div className="glass-panel">
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.75rem" }}>
          Activity Recommendations
        </div>
        {[
          { activity: "Concrete Pouring", ok: weather.temperature > 10 && weather.temperature < 35 && weather.precipitation < 2 },
          { activity: "Crane Operations", ok: weather.wind_speed < 40 && weather.weather_code < 61 },
          { activity: "Scaffolding Work", ok: weather.wind_speed < 50 && weather.weather_code < 80 },
          { activity: "Excavation", ok: weather.precipitation < 10 && weather.weather_code < 65 },
          { activity: "Electrical Work", ok: weather.weather_code < 45 },
          { activity: "Painting & Coating", ok: weather.temperature > 15 && weather.humidity < 80 && weather.precipitation < 0.5 },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem 0", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <span style={{ fontSize: "0.8rem" }}>{item.activity}</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: item.ok ? "#10b981" : "#ef4444", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              {item.ok ? <><CheckCircle2 size={12} /> Safe</> : <><AlertTriangle size={12} /> Avoid</>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
