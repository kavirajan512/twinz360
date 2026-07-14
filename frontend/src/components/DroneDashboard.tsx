"use client";
import React, { useState, useEffect } from "react";
import { Navigation, Compass, Battery, Radio, MapPin, Video, Zap, AlertTriangle, Play, Pause, RotateCcw, Camera, TrendingUp } from "lucide-react";

const DRONES = [
  { id: "ALPHA-1", name: "Alpha-1 (DJI Matrice 300 RTK)", type: "Survey", status: "active", battery: 78, altitude: 45, speed: 8.2, signal: 98, lat: 12.9716, lng: 77.5946, mission: "Roof Inspection Pass #3", fuel: null, payload: "LiDAR + RGB", flightTime: "00:34:12" },
  { id: "BETA-2", name: "Beta-2 (Skydio X2)", type: "Security", status: "charging", battery: 100, altitude: 0, speed: 0, signal: 0, lat: 12.9710, lng: 77.5940, mission: "Standby – Charging Pad 2", fuel: null, payload: "Thermal + RGB", flightTime: "00:00:00" },
  { id: "GAMMA-3", name: "Gamma-3 (Autel EVO II)", type: "Mapping", status: "active", battery: 45, altitude: 80, speed: 12.4, signal: 87, lat: 12.9720, lng: 77.5950, mission: "Photogrammetry Survey – Zone C", fuel: null, payload: "120MP Camera", flightTime: "01:12:05" },
  { id: "DELTA-4", name: "Delta-4 (Spot Robot Dog)", type: "Ground", status: "patrolling", battery: 62, altitude: 0, speed: 1.8, signal: 95, lat: 12.9718, lng: 77.5943, mission: "Level 2 Interior Patrol", fuel: null, payload: "SLAM + Thermal", flightTime: "00:48:30" },
];

const MISSIONS = [
  { id: 1, name: "Daily Roof Inspection", drone: "ALPHA-1", status: "in-progress", completion: 60, type: "Inspection" },
  { id: 2, name: "Site Photogrammetry", drone: "GAMMA-3", status: "in-progress", completion: 35, type: "Mapping" },
  { id: 3, name: "Perimeter Security Patrol", drone: "BETA-2", status: "queued", completion: 0, type: "Security" },
  { id: 4, name: "Volume Calculation – Material Yard", drone: "ALPHA-1", status: "queued", completion: 0, type: "Volumetric" },
];

const FOOTAGE = [
  { cam: "ALPHA-1 Live", img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80", label: "Roof – Top View" },
  { cam: "GAMMA-3 Live", img: "https://images.unsplash.com/photo-1504307651254-35680f356f12?w=600&q=80", label: "Zone C – Photogrammetry" },
];

export default function DroneDashboard() {
  const [selected, setSelected] = useState(DRONES[0]);
  const [drones, setDrones] = useState(DRONES);
  const [activeTab, setActiveTab] = useState<"fleet" | "missions" | "feeds">("fleet");

  useEffect(() => {
    const iv = setInterval(() => {
      setDrones(prev => prev.map(d => ({
        ...d,
        battery: d.status === "charging" ? Math.min(100, d.battery + 0.5) : d.status === "active" || d.status === "patrolling" ? Math.max(5, d.battery - 0.1) : d.battery,
        speed: d.status === "active" ? parseFloat(Math.max(0, d.speed + (Math.random() - 0.5) * 1.2).toFixed(1)) : d.speed,
        altitude: d.status === "active" ? parseFloat(Math.max(10, Math.min(150, d.altitude + (Math.random() - 0.5) * 2)).toFixed(0)) : d.altitude,
      })));
    }, 1500);
    return () => clearInterval(iv);
  }, []);

  const selectedLive = drones.find(d => d.id === selected.id) || selected;
  const statusColor = (s: string) => ({ active: "#4ade80", patrolling: "#06b6d4", charging: "#eab308", standby: "#888", error: "#ef4444" }[s] || "#888");
  const batteryColor = (b: number) => b > 60 ? "#4ade80" : b > 30 ? "#eab308" : "#ef4444";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", height: "100%" }}>
      {/* KPIs */}
      <div style={{ display: "flex", gap: "1rem" }}>
        {[
          { label: "Total Drones", value: drones.length, color: "#06b6d4" },
          { label: "Active Missions", value: drones.filter(d => d.status === "active" || d.status === "patrolling").length, color: "#4ade80" },
          { label: "Charging", value: drones.filter(d => d.status === "charging").length, color: "#eab308" },
          { label: "Area Covered", value: "2.4 km²", color: "#8b5cf6" },
          { label: "Images Captured", value: "4,128", color: "#06b6d4" },
        ].map((kpi, i) => (
          <div key={i} className="glass-panel" style={{ flex: 1, padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[["fleet", "Fleet Status"], ["missions", "Mission Queue"], ["feeds", "Live Drone Feeds"]].map(([v, l]) => (
          <button key={v} onClick={() => setActiveTab(v as any)} style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", fontSize: "0.85rem", background: activeTab === v ? "#06b6d4" : "rgba(255,255,255,0.05)", color: activeTab === v ? "#000" : "var(--text-secondary)", border: "none", cursor: "pointer", fontWeight: 600 }}>{l}</button>
        ))}
      </div>

      {activeTab === "fleet" && (
        <div style={{ display: "flex", gap: "1.5rem", flex: 1, minHeight: 0 }}>
          {/* List */}
          <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "0.5rem", overflowY: "auto", flexShrink: 0 }}>
            {drones.map(drone => (
              <div key={drone.id} onClick={() => setSelected(drone)} className="glass-panel" style={{ padding: "1rem", cursor: "pointer", background: selected.id === drone.id ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.02)", border: `1px solid ${selected.id === drone.id ? "var(--cyan)" : "rgba(255,255,255,0.07)"}`, transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{drone.id}</div>
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor(drone.status), boxShadow: `0 0 6px ${statusColor(drone.status)}` }}></div>
                    <span style={{ fontSize: "0.7rem", color: statusColor(drone.status), textTransform: "uppercase", fontWeight: 600 }}>{drone.status}</span>
                  </div>
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{drone.mission}</div>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.78rem" }}>
                  <span style={{ color: batteryColor(drones.find(d => d.id === drone.id)?.battery || drone.battery) }}>🔋 {(drones.find(d => d.id === drone.id)?.battery || drone.battery).toFixed(0)}%</span>
                  <span style={{ color: "var(--text-secondary)" }}>📡 {drone.signal}%</span>
                  <span style={{ color: "var(--text-secondary)" }}>⏱ {drone.flightTime}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="glass-panel" style={{ padding: "1.5rem", borderColor: statusColor(selectedLive.status) }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <div>
                  <h2 style={{ margin: 0 }}>{selectedLive.name}</h2>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{selectedLive.mission}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>Payload: {selectedLive.payload}</div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button style={{ padding: "0.5rem 1rem", background: "rgba(74,222,128,0.2)", border: "1px solid #4ade8040", borderRadius: "8px", color: "#4ade80", cursor: "pointer", fontSize: "0.85rem" }}>▶ Launch</button>
                  <button style={{ padding: "0.5rem 1rem", background: "rgba(239,68,68,0.2)", border: "1px solid #ef444440", borderRadius: "8px", color: "#ef4444", cursor: "pointer", fontSize: "0.85rem" }}>⏹ RTH</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                {[
                  { label: "Battery", value: `${selectedLive.battery.toFixed(0)}%`, icon: Battery, warn: selectedLive.battery < 30 },
                  { label: "Altitude", value: `${selectedLive.altitude} m`, icon: TrendingUp, warn: selectedLive.altitude > 120 },
                  { label: "Speed", value: `${selectedLive.speed} m/s`, icon: Zap, warn: false },
                  { label: "Signal", value: `${selectedLive.signal}%`, icon: Radio, warn: selectedLive.signal < 60 },
                ].map((m, i) => (
                  <div key={i} style={{ background: m.warn ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${m.warn ? "#ef444430" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", padding: "1rem", textAlign: "center" }}>
                    <m.icon size={18} style={{ color: m.warn ? "#ef4444" : "var(--text-secondary)", margin: "0 auto 0.5rem" }} />
                    <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>{m.value}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar / map */}
            <div className="glass-panel" style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 10, fontSize: "0.85rem", color: "var(--cyan)", fontWeight: 600 }}>Live Radar & GPS Track</div>
              <svg width="100%" height="100%" viewBox="0 0 600 300" style={{ display: "block" }}>
                <rect width="600" height="300" fill="#09090b" />
                {[60, 120, 180].map(r => <circle key={r} cx="300" cy="150" r={r} fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="1" />)}
                <line x1="300" y1="0" x2="300" y2="300" stroke="rgba(6,182,212,0.1)" strokeWidth="1" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(6,182,212,0.1)" strokeWidth="1" />
                {/* Drone positions */}
                <circle cx="300" cy="120" r="10" fill="rgba(74,222,128,0.3)" stroke="#4ade80" strokeWidth="2" />
                <text x="300" y="125" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="bold">A1</text>
                <circle cx="380" cy="180" r="10" fill="rgba(6,182,212,0.3)" stroke="#06b6d4" strokeWidth="2" />
                <text x="380" y="185" textAnchor="middle" fill="#06b6d4" fontSize="8" fontWeight="bold">G3</text>
                <circle cx="240" cy="200" r="10" fill="rgba(234,179,8,0.3)" stroke="#eab308" strokeWidth="2" />
                <text x="240" y="205" textAnchor="middle" fill="#eab308" fontSize="8" fontWeight="bold">D4</text>
                {/* Trail */}
                <polyline points="280,140 290,130 300,120" fill="none" stroke="rgba(74,222,128,0.4)" strokeWidth="1.5" strokeDasharray="3 2" />
              </svg>
              <div style={{ position: "absolute", bottom: "1rem", right: "1rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>Update: 2s interval • MQTT-GPS</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "missions" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
          {MISSIONS.map(m => (
            <div key={m.id} className="glass-panel" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.2rem 0" }}>{m.name}</h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Drone: {m.drone} &nbsp;|&nbsp; Type: {m.type}</div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {m.status === "in-progress" ? (
                    <button style={{ padding: "0.4rem 0.9rem", background: "rgba(239,68,68,0.2)", border: "1px solid #ef444440", borderRadius: "8px", color: "#ef4444", cursor: "pointer", fontSize: "0.8rem" }}>Abort</button>
                  ) : (
                    <button style={{ padding: "0.4rem 0.9rem", background: "rgba(74,222,128,0.2)", border: "1px solid #4ade8040", borderRadius: "8px", color: "#4ade80", cursor: "pointer", fontSize: "0.8rem" }}>Deploy</button>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${m.completion}%`, height: "100%", background: m.status === "in-progress" ? "#06b6d4" : "#888", borderRadius: "4px", transition: "width 1s" }}></div>
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, minWidth: "40px" }}>{m.completion}%</span>
                <span style={{ fontSize: "0.8rem", color: m.status === "in-progress" ? "#4ade80" : "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>{m.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "feeds" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", flex: 1 }}>
          {FOOTAGE.map((f, i) => (
            <div key={i} className="glass-panel" style={{ overflow: "hidden", position: "relative" }}>
              <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{f.cam}</span>
                <span style={{ fontSize: "0.75rem", color: "#4ade80" }}>● LIVE</span>
              </div>
              <div style={{ position: "relative", height: "300px", overflow: "hidden" }}>
                <img src={f.img} alt={f.label} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(0,0,0,0.7)", padding: "4px 10px", borderRadius: "4px", fontSize: "0.7rem", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.3)" }}>
                  <span style={{ marginRight: "6px" }}>📡</span> {f.label}
                </div>
                {/* Bounding box */}
                <div style={{ position: "absolute", top: "30%", left: "25%", width: "120px", height: "80px", border: "2px solid #4ade80", animation: "float0 5s infinite alternate ease-in-out" }}>
                  <div style={{ position: "absolute", top: "-16px", left: 0, fontSize: "0.6rem", background: "#4ade80", color: "#000", padding: "1px 4px", fontWeight: 700 }}>Structure 94%</div>
                </div>
                <div style={{ position: "absolute", bottom: "8px", right: "8px", background: "rgba(0,0,0,0.7)", padding: "3px 8px", borderRadius: "4px", fontSize: "0.65rem", color: "var(--text-muted)" }}>
                  AI Tracking • YOLOv11
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
