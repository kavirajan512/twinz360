"use client";
import React, { useState, useEffect, useRef } from "react";
import { Wifi, Activity, Thermometer, Wind, Droplets, Zap, AlertTriangle, MapPin, RefreshCw, ToggleRight, Database, Radio } from "lucide-react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SENSORS = [
  { id: "ENV-01", name: "Environmental – Gate A", type: "env", zone: "Entry Zone", status: "online", temp: 34.2, humidity: 62, aqi: 48, wind: 14, co2: 412 },
  { id: "ENV-02", name: "Environmental – Roof", type: "env", zone: "Roof Slab", status: "online", temp: 41.8, humidity: 38, aqi: 35, wind: 22, co2: 398 },
  { id: "CRAN-01", name: "Crane Load Cell #1", type: "crane", zone: "Tower A", status: "warning", load: 4.2, maxLoad: 5.0, angle: 78, vibration: 0.8 },
  { id: "CRAN-02", name: "Crane Load Cell #2", type: "crane", zone: "Tower B", status: "online", load: 2.1, maxLoad: 5.0, angle: 45, vibration: 0.2 },
  { id: "SOIL-01", name: "Soil Pressure Sensor", type: "soil", zone: "Foundation", status: "online", pressure: 142, settlement: 0.3, moisture: 28 },
  { id: "CON-01", name: "Concrete Curing Sensor", type: "concrete", zone: "Level 3 Slab", status: "online", strength: 68, temp: 29.4, age: 7 },
  { id: "FIRE-01", name: "Fire & Smoke Detector", type: "fire", zone: "Basement B2", status: "online", smoke: 2.1, co: 0.8, flame: false },
  { id: "WATER-01", name: "Water Level Sensor", type: "water", zone: "Sump Pit", status: "online", level: 42, flow: 3.2, leak: false },
];

const generateTimeSeries = (base: number, variance: number = 5, count: number = 20) =>
  Array.from({ length: count }, (_, i) => ({
    t: `${9 + Math.floor(i / 4)}:${String((i % 4) * 15).padStart(2, "0")}`,
    v: parseFloat((base + (Math.random() - 0.5) * variance).toFixed(1)),
  }));

export default function IoTDashboard() {
  const [sensors, setSensors] = useState<any[]>(SENSORS);
  const [selected, setSelected] = useState(SENSORS[0]);
  const [chartData, setChartData] = useState(generateTimeSeries(34, 8));
  const [livePoint, setLivePoint] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [mqttStatus, setMqttStatus] = useState<"connected" | "reconnecting">("connected");

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => prev.map(s => ({
        ...s,
        temp: s.temp !== undefined ? parseFloat((s.temp + (Math.random() - 0.5) * 0.5).toFixed(1)) : undefined,
        humidity: s.humidity !== undefined ? Math.max(10, Math.min(99, s.humidity + Math.round((Math.random() - 0.5) * 2))) : undefined,
        load: s.load !== undefined ? parseFloat(Math.max(0.1, Math.min(s.maxLoad || 5, s.load + (Math.random() - 0.5) * 0.3)).toFixed(2)) : undefined,
        aqi: s.aqi !== undefined ? Math.max(1, s.aqi + Math.round((Math.random() - 0.5) * 3)) : undefined,
        wind: s.wind !== undefined ? parseFloat(Math.max(0, s.wind + (Math.random() - 0.5) * 2).toFixed(1)) : undefined,
        status: (s as any).load > (s as any).maxLoad * 0.85 ? "warning" : s.status === "warning" && Math.random() > 0.8 ? "online" : s.status,
      })));

      const now = new Date();
      const newVal = parseFloat(((selected as any).temp || (selected as any).load || 34 + (Math.random() - 0.5) * 8).toFixed(1));
      setChartData(prev => [...prev.slice(-19), { t: `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`, v: newVal }]);
    }, 2500);
    return () => clearInterval(interval);
  }, [selected]);

  const selectedLive = sensors.find(s => s.id === selected.id) || selected;
  const filtered = filter === "all" ? sensors : sensors.filter(s => s.type === filter);
  const onlineCount = sensors.filter(s => s.status === "online").length;
  const warningCount = sensors.filter(s => s.status === "warning").length;

  const sensorIcon = (type: string) => ({ env: Thermometer, crane: Database, soil: Radio, concrete: Zap, fire: AlertTriangle, water: Droplets }[type] || Wifi);
  const sensorColor = (status: string) => status === "warning" ? "#f97316" : status === "offline" ? "#ef4444" : "#4ade80";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", height: "100%" }}>
      {/* Header KPIs */}
      <div style={{ display: "flex", gap: "1rem" }}>
        {[
          { label: "Total Nodes", value: sensors.length, color: "#06b6d4" },
          { label: "Online", value: onlineCount, color: "#4ade80" },
          { label: "Warnings", value: warningCount, color: "#f97316" },
          { label: "Offline", value: sensors.filter(s => s.status === "offline").length, color: "#ef4444" },
          { label: "MQTT Broker", value: mqttStatus === "connected" ? "LIVE" : "RETRY", color: mqttStatus === "connected" ? "#4ade80" : "#ef4444" },
        ].map((kpi, i) => (
          <div key={i} className="glass-panel" style={{ flex: 1, padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{kpi.label}</div>
          </div>
        ))}
        <div className="glass-panel" style={{ padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }}></div>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>MQTT Broker</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>mqtt://site.local:1883</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flex: 1, minHeight: 0 }}>
        {/* Left: Sensor list */}
        <div className="glass-panel" style={{ width: "300px", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <h3 style={{ margin: "0 0 0.75rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}><Wifi size={16} style={{ color: "var(--cyan)" }} /> Sensor Nodes</h3>
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "white", padding: "0.4rem 0.6rem", fontSize: "0.8rem" }}>
              {[["all", "All Types"], ["env", "Environmental"], ["crane", "Crane Load"], ["soil", "Soil"], ["concrete", "Concrete"], ["fire", "Fire/Smoke"], ["water", "Water"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
            {filtered.map(s => {
              const live = sensors.find(x => x.id === s.id) || s;
              const SIcon = sensorIcon(s.type);
              return (
                <div key={s.id} onClick={() => setSelected(s)} style={{ padding: "0.85rem", borderRadius: "8px", cursor: "pointer", background: selected.id === s.id ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.02)", border: `1px solid ${selected.id === s.id ? "var(--cyan)" : "rgba(255,255,255,0.06)"}`, marginBottom: "0.4rem", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                      <SIcon size={14} style={{ color: sensorColor(live.status) }} />
                      <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{s.name}</span>
                    </div>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: sensorColor(live.status), flexShrink: 0, boxShadow: `0 0 6px ${sensorColor(live.status)}` }}></div>
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>{s.zone} • {s.id}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                    {s.type === "env" ? `${(live as any).temp}°C | AQI: ${(live as any).aqi}` : s.type === "crane" ? `Load: ${(live as any).load}T / ${(live as any).maxLoad}T` : s.type === "concrete" ? `Strength: ${(live as any).strength}%` : s.type === "fire" ? `Smoke: ${(live as any).smoke} ppm` : `Level: ${(live as any).level}%`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Live telemetry */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Selected sensor details */}
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <h2 style={{ margin: "0 0 0.25rem 0" }}>{selectedLive.name}</h2>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Zone: {selectedLive.zone} &nbsp;|&nbsp; Node ID: {selectedLive.id}</div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: sensorColor(selectedLive.status), boxShadow: `0 0 8px ${sensorColor(selectedLive.status)}` }}></div>
                <span style={{ color: sensorColor(selectedLive.status), fontWeight: 600, textTransform: "uppercase", fontSize: "0.8rem" }}>{selectedLive.status}</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
              {(selectedLive.type === "env" ? [
                { label: "Temperature", value: `${(selectedLive as any).temp}°C`, warn: (selectedLive as any).temp > 40, icon: Thermometer },
                { label: "Humidity", value: `${(selectedLive as any).humidity}%`, warn: (selectedLive as any).humidity > 80, icon: Droplets },
                { label: "AQI Index", value: `${(selectedLive as any).aqi}`, warn: (selectedLive as any).aqi > 100, icon: Wind },
                { label: "Wind Speed", value: `${(selectedLive as any).wind} km/h`, warn: (selectedLive as any).wind > 30, icon: Wind },
              ] : selectedLive.type === "crane" ? [
                { label: "Current Load", value: `${(selectedLive as any).load} T`, warn: (selectedLive as any).load > (selectedLive as any).maxLoad * 0.85, icon: Database },
                { label: "Max Capacity", value: `${(selectedLive as any).maxLoad} T`, warn: false, icon: Database },
                { label: "Boom Angle", value: `${(selectedLive as any).angle}°`, warn: false, icon: Activity },
                { label: "Vibration", value: `${(selectedLive as any).vibration} g`, warn: (selectedLive as any).vibration > 0.7, icon: Activity },
              ] : selectedLive.type === "fire" ? [
                { label: "Smoke Density", value: `${(selectedLive as any).smoke} ppm`, warn: (selectedLive as any).smoke > 10, icon: Wind },
                { label: "CO Level", value: `${(selectedLive as any).co} ppm`, warn: (selectedLive as any).co > 35, icon: Wind },
                { label: "Flame Detected", value: (selectedLive as any).flame ? "YES" : "NO", warn: (selectedLive as any).flame, icon: AlertTriangle },
                { label: "Status", value: "Clear", warn: false, icon: Zap },
              ] : [
                { label: "Level", value: `${(selectedLive as any).level || "-"}%`, warn: ((selectedLive as any).level || 0) > 80, icon: Droplets },
                { label: "Strength", value: `${(selectedLive as any).strength || "-"}%`, warn: false, icon: Zap },
                { label: "Curing Age", value: `${(selectedLive as any).age || "-"} days`, warn: false, icon: Activity },
                { label: "Pressure", value: `${(selectedLive as any).pressure || "-"} kN/m²`, warn: false, icon: Database },
              ]).map((m: any, i) => (
                <div key={i} style={{ background: m.warn ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${m.warn ? "#ef444440" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", padding: "1rem", textAlign: "center" }}>
                  <m.icon size={18} style={{ color: m.warn ? "#ef4444" : "var(--text-secondary)", margin: "0 auto 0.5rem" }} />
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, color: m.warn ? "#ef4444" : "white" }}>{m.value}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="glass-panel" style={{ flex: 1, padding: "1.5rem" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Live Telemetry Stream (MQTT)</h4>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="iotGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="t" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(9,9,11,0.9)", border: "1px solid var(--cyan)", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="v" stroke="#06b6d4" fill="url(#iotGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Site map */}
        <div className="glass-panel" style={{ width: "260px", padding: "1rem", flexShrink: 0 }}>
          <h4 style={{ margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}><MapPin size={15} style={{ color: "var(--cyan)" }} /> Sensor Site Map</h4>
          <div style={{ position: "relative", height: "300px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", overflow: "hidden" }}>
            <svg width="100%" height="100%" viewBox="0 0 220 300">
              <rect x="10" y="10" width="200" height="280" rx="4" fill="none" stroke="rgba(255,255,255,0.07)" />
              <rect x="20" y="20" width="80" height="100" rx="2" fill="rgba(6,182,212,0.05)" stroke="rgba(6,182,212,0.2)" />
              <text x="60" y="75" textAnchor="middle" fill="rgba(6,182,212,0.6)" fontSize="9">Tower A</text>
              <rect x="120" y="20" width="80" height="100" rx="2" fill="rgba(139,92,246,0.05)" stroke="rgba(139,92,246,0.2)" />
              <text x="160" y="75" textAnchor="middle" fill="rgba(139,92,246,0.6)" fontSize="9">Tower B</text>
              <rect x="20" y="140" width="180" height="80" rx="2" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" />
              <text x="110" y="185" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">Basement</text>
              <rect x="20" y="240" width="180" height="40" rx="2" fill="rgba(74,222,128,0.03)" stroke="rgba(74,222,128,0.15)" />
              <text x="110" y="265" textAnchor="middle" fill="rgba(74,222,128,0.5)" fontSize="9">Foundation</text>
              {/* Sensor dots */}
              {[
                { x: 35, y: 30, c: "#4ade80", l: "ENV-01" },
                { x: 195, y: 30, c: "#4ade80", l: "ENV-02" },
                { x: 60, y: 60, c: "#f97316", l: "CRAN-01" },
                { x: 160, y: 60, c: "#4ade80", l: "CRAN-02" },
                { x: 110, y: 260, c: "#4ade80", l: "SOIL-01" },
                { x: 60, y: 155, c: "#4ade80", l: "FIRE-01" },
                { x: 160, y: 155, c: "#4ade80", l: "WATER-01" },
              ].map((dot, i) => (
                <g key={i}>
                  <circle cx={dot.x} cy={dot.y} r="7" fill={`${dot.c}25`} stroke={dot.c} strokeWidth="1.5" />
                  <circle cx={dot.x} cy={dot.y} r="3" fill={dot.c} />
                  <text x={dot.x} y={dot.y + 18} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="6">{dot.l}</text>
                </g>
              ))}
            </svg>
          </div>
          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[{ c: "#4ade80", l: "Online" }, { c: "#f97316", l: "Warning" }, { c: "#ef4444", l: "Offline" }].map((leg, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: leg.c }}></div> {leg.l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
