"use client";
import React, { useState, useEffect, useRef } from "react";
import { HardHat, HeartPulse, Thermometer, Wind, AlertCircle, MapPin, Wifi, Battery, Activity, User, Shield, Phone, Clock, TrendingUp, BellRing } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const workers = [
  { id: 42, name: "Suresh Kumar", role: "Mason", zone: "Tower A – L4", helmet: "H-042", img: "SK", hr: 84, temp: 36.8, gas: 2.1, status: "safe", battery: 87, gps: "Zone A4", fall: false },
  { id: 15, name: "Amit Sharma", role: "Electrician", zone: "Basement B2", helmet: "H-015", img: "AS", hr: 92, temp: 37.1, gas: 0.5, status: "safe", battery: 62, gps: "Zone B2", fall: false },
  { id: 28, name: "Rajesh Patel", role: "Steelfixer", zone: "Roof Slab", helmet: "H-028", img: "RP", hr: 145, temp: 38.6, gas: 4.0, status: "danger", battery: 34, gps: "Zone R1", fall: true },
  { id: 7, name: "Priya Menon", role: "Supervisor", zone: "Level 2", helmet: "H-007", img: "PM", hr: 75, temp: 36.5, gas: 1.2, status: "safe", battery: 91, gps: "Zone L2", fall: false },
  { id: 33, name: "Kiran Das", role: "Carpenter", zone: "Level 3", helmet: "H-033", img: "KD", hr: 102, temp: 37.8, gas: 2.8, status: "warning", battery: 55, gps: "Zone L3", fall: false },
  { id: 19, name: "Vijay Nair", role: "Plumber", zone: "Store Area", helmet: "H-019", img: "VN", hr: 68, temp: 36.2, gas: 0.3, status: "safe", battery: 78, gps: "Zone S1", fall: false },
];

const generateVitalHistory = () => Array.from({ length: 12 }, (_, i) => ({
  t: `${10 + i}:${String(i * 5).padStart(2, "0")}`,
  hr: 70 + Math.floor(Math.random() * 60),
  temp: parseFloat((36 + Math.random() * 2).toFixed(1)),
}));

export default function SmartHelmetDashboard({ projectId }: { projectId?: number }) {
  const [selected, setSelected] = useState(workers[0]);
  const [liveData, setLiveData] = useState(workers);
  const [vitalHistory, setVitalHistory] = useState(generateVitalHistory());
  const [filter, setFilter] = useState("All");
  const [sosActive, setSosActive] = useState(false);
  const tick = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      tick.current++;
      setLiveData(prev => prev.map(w => ({
        ...w,
        hr: Math.max(55, Math.min(180, w.hr + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5))),
        temp: parseFloat(Math.max(35.5, Math.min(40, w.temp + (Math.random() > 0.5 ? 0.1 : -0.1))).toFixed(1)),
        gas: parseFloat(Math.max(0, Math.min(10, w.gas + (Math.random() > 0.5 ? 0.2 : -0.1))).toFixed(1)),
        battery: Math.max(5, w.battery - (tick.current % 15 === 0 ? 1 : 0)),
      })));
      setVitalHistory(prev => {
        const now = new Date();
        const newPoint = {
          t: `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`,
          hr: Math.max(55, Math.min(180, selected.hr + (Math.random() > 0.5 ? 3 : -3))),
          temp: parseFloat(Math.max(35.5, Math.min(40, selected.temp + (Math.random() > 0.5 ? 0.1 : -0.1))).toFixed(1)),
        };
        return [...prev.slice(-11), newPoint];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [selected]);

  const filteredWorkers = filter === "All" ? liveData : liveData.filter(w => w.status === filter.toLowerCase());
  const selectedLive = liveData.find(w => w.id === selected.id) || liveData[0];

  const statusColor = (s: string) => s === "danger" ? "#ef4444" : s === "warning" ? "#f97316" : "#4ade80";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", height: "100%" }}>
      {/* Header KPIs */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {[
          { label: "Total Helmets Online", value: liveData.length, icon: HardHat, color: "#06b6d4" },
          { label: "Danger Alerts", value: liveData.filter(w => w.status === "danger").length, icon: AlertCircle, color: "#ef4444" },
          { label: "Warnings", value: liveData.filter(w => w.status === "warning").length, icon: BellRing, color: "#f97316" },
          { label: "Fall Detected", value: liveData.filter(w => w.fall).length, icon: Shield, color: "#8b5cf6" },
          { label: "Battery Critical (<40%)", value: liveData.filter(w => w.battery < 40).length, icon: Battery, color: "#eab308" },
        ].map((kpi, i) => (
          <div key={i} className="glass-panel" style={{ flex: 1, minWidth: "140px", padding: "1rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <div style={{ background: `${kpi.color}20`, padding: "0.6rem", borderRadius: "8px" }}><kpi.icon size={20} style={{ color: kpi.color }} /></div>
            <div><div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{kpi.value}</div><div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{kpi.label}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flex: 1, minHeight: 0 }}>
        {/* Left: Worker list */}
        <div className="glass-panel" style={{ width: "280px", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <h3 style={{ margin: "0 0 0.75rem 0" }}>Active Workers</h3>
            <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
              {["All", "Safe", "Warning", "Danger"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: "2px 10px", borderRadius: "12px", fontSize: "0.75rem", border: "1px solid rgba(255,255,255,0.1)", background: filter === f ? "#06b6d4" : "transparent", color: filter === f ? "#000" : "var(--text-secondary)", cursor: "pointer" }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
            {filteredWorkers.map(w => {
              const live = liveData.find(l => l.id === w.id) || w;
              return (
                <div key={w.id} onClick={() => setSelected(workers.find(wr => wr.id === w.id) || workers[0])} style={{ display: "flex", gap: "0.75rem", alignItems: "center", padding: "0.75rem", borderRadius: "8px", cursor: "pointer", background: selected.id === w.id ? "rgba(6, 182, 212, 0.15)" : "transparent", border: selected.id === w.id ? "1px solid var(--cyan)" : "1px solid transparent", marginBottom: "0.25rem", transition: "all 0.2s" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${statusColor(live.status)}30`, border: `2px solid ${statusColor(live.status)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>{w.img}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{w.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{w.role} • {w.zone}</div>
                  </div>
                  <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                    <span style={{ fontSize: "0.65rem", background: `${statusColor(live.status)}20`, color: statusColor(live.status), padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>{live.status.toUpperCase()}</span>
                    {live.fall && <span style={{ fontSize: "0.6rem", color: "#8b5cf6" }}>FALL!</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Live vital details */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="glass-panel" style={{ padding: "1.5rem", borderColor: statusColor(selectedLive.status) }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${statusColor(selectedLive.status)}30`, border: `3px solid ${statusColor(selectedLive.status)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 700 }}>{selected.img}</div>
                <div>
                  <h2 style={{ margin: 0 }}>{selected.name}</h2>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{selected.role} — {selected.zone}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>Helmet: {selected.helmet} &nbsp;|&nbsp; GPS: {selected.gps}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => setSosActive(!sosActive)} style={{ padding: "0.5rem 1rem", background: sosActive ? "#ef4444" : "rgba(239,68,68,0.2)", border: "1px solid #ef4444", borderRadius: "8px", color: "#ef4444", cursor: "pointer", fontWeight: 700, animation: sosActive ? "pulse 1s infinite" : "none" }}>
                  {sosActive ? "SOS ACTIVE" : "Trigger SOS"}
                </button>
                <button style={{ padding: "0.5rem 1rem", background: "rgba(6,182,212,0.1)", border: "1px solid var(--cyan)", borderRadius: "8px", color: "var(--cyan)", cursor: "pointer" }}>📞 Contact</button>
              </div>
            </div>

            {/* Vitals grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
              {[
                { icon: HeartPulse, label: "Heart Rate", value: `${selectedLive.hr} bpm`, warn: selectedLive.hr > 120, color: "#ef4444" },
                { icon: Thermometer, label: "Body Temp", value: `${selectedLive.temp}°C`, warn: selectedLive.temp > 38, color: "#f97316" },
                { icon: Wind, label: "Gas Level", value: `${selectedLive.gas} ppm`, warn: selectedLive.gas > 3, color: "#eab308" },
                { icon: Battery, label: "Battery", value: `${selectedLive.battery}%`, warn: selectedLive.battery < 40, color: "#8b5cf6" },
              ].map((vital, i) => (
                <div key={i} style={{ background: vital.warn ? `${vital.color}15` : "rgba(255,255,255,0.03)", border: `1px solid ${vital.warn ? vital.color : "rgba(255,255,255,0.1)"}`, borderRadius: "10px", padding: "1rem", textAlign: "center" }}>
                  <vital.icon size={22} style={{ color: vital.warn ? vital.color : "var(--text-secondary)", margin: "0 auto 0.5rem" }} />
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: vital.warn ? vital.color : "white" }}>{vital.value}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{vital.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live HR chart */}
          <div className="glass-panel" style={{ flex: 1, padding: "1.5rem" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Live Vital Trend (Last 12 Readings)</h4>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={vitalHistory}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="t" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                <YAxis domain={[50, 200]} tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(9,9,11,0.9)", border: "1px solid #ef4444", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="hr" stroke="#ef4444" fill="url(#hrGrad)" strokeWidth={2} dot={false} name="Heart Rate (bpm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Site map + alerts */}
        <div style={{ width: "280px", display: "flex", flexDirection: "column", gap: "1rem", flexShrink: 0 }}>
          <div className="glass-panel" style={{ padding: "1rem", flex: 1 }}>
            <h4 style={{ margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}><MapPin size={15} style={{ color: "var(--cyan)" }} /> Live Worker GPS Map</h4>
            <div style={{ position: "relative", height: "220px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", overflow: "hidden" }}>
              {/* Simple site grid representation */}
              <svg width="100%" height="100%" viewBox="0 0 260 220">
                <rect x="10" y="10" width="240" height="200" rx="4" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <rect x="20" y="20" width="100" height="80" rx="2" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.3)" strokeWidth="1" />
                <text x="70" y="65" textAnchor="middle" fill="rgba(6,182,212,0.7)" fontSize="9">Tower A</text>
                <rect x="140" y="20" width="100" height="80" rx="2" fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
                <text x="190" y="65" textAnchor="middle" fill="rgba(139,92,246,0.7)" fontSize="9">Tower B</text>
                <rect x="20" y="120" width="220" height="90" rx="2" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x="130" y="170" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">Basement</text>
                {/* Workers as dots */}
                {[{ x: 70, y: 55, s: "danger", n: "RP" }, { x: 50, y: 40, s: "safe", n: "SK" }, { x: 155, y: 150, s: "safe", n: "AS" }, { x: 170, y: 60, s: "safe", n: "PM" }, { x: 190, y: 45, s: "warning", n: "KD" }, { x: 230, y: 155, s: "safe", n: "VN" }].map((w, i) => (
                  <g key={i}>
                    <circle cx={w.x} cy={w.y} r="10" fill={`${statusColor(w.s)}30`} stroke={statusColor(w.s)} strokeWidth="1.5" />
                    <text x={w.x} y={w.y + 4} textAnchor="middle" fill={statusColor(w.s)} fontSize="7" fontWeight="bold">{w.n}</text>
                  </g>
                ))}
              </svg>
              <div style={{ position: "absolute", bottom: "4px", right: "4px", fontSize: "0.6rem", color: "var(--text-muted)" }}>Live GPS • MQTT</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "1rem" }}>
            <h4 style={{ margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}><AlertCircle size={15} style={{ color: "#ef4444" }} /> Active Alerts</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {liveData.filter(w => w.status !== "safe" || w.fall).map((w, i) => (
                <div key={i} style={{ padding: "0.6rem 0.8rem", background: w.status === "danger" ? "rgba(239,68,68,0.1)" : "rgba(249,115,22,0.1)", border: `1px solid ${statusColor(w.status)}40`, borderRadius: "6px", fontSize: "0.8rem" }}>
                  <div style={{ fontWeight: 600, color: statusColor(w.status) }}>{w.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                    {w.fall ? "⚠ FALL DETECTED" : w.hr > 120 ? `HR: ${w.hr} bpm (HIGH)` : `Temp: ${w.temp}°C`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
