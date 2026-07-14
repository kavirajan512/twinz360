"use client";
import React, { useState, useEffect } from "react";
import { Layers, ThermometerSun, Zap, Bell, Settings, Wind, Droplets, Battery, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import BIMViewer from "./BIMViewer";

const SYSTEMS = [
  { id: "HVAC-1", type: "HVAC", name: "Central AHU – Tower A", zone: "Roof Slab", status: "operational", temp: 22.4, setpoint: 22.5, humidity: 45, filter: "Good", fanSpeed: 85, power: 12.4 },
  { id: "HVAC-2", type: "HVAC", name: "Chiller Unit – Basement", zone: "Basement B2", status: "warning", temp: 18.2, setpoint: 18.0, humidity: 62, filter: "Replace", fanSpeed: 100, power: 45.2 },
  { id: "ELEC-1", type: "Energy", name: "Main Switchboard A", zone: "Ground Floor", status: "operational", load: 342, voltage: 415, pf: 0.96, dailyKwh: 1245 },
  { id: "ELEC-2", type: "Energy", name: "Solar Inverter Array", zone: "Roof Slab", status: "operational", load: -85, voltage: 400, pf: 1.0, dailyKwh: 450 },
  { id: "FIRE-1", type: "Fire", name: "Main Fire Panel", zone: "Lobby", status: "operational", smoke: "Clear", pressure: 120, battery: "100%", lastTest: "2 days ago" },
  { id: "LIFT-A", type: "Elevator", name: "Passenger Lift 1", zone: "Core A", status: "operational", floor: 12, trips: 452, nextService: "15 days", door: "Closed" },
  { id: "LIFT-B", type: "Elevator", name: "Service Lift", zone: "Core B", status: "warning", floor: 2, trips: 1850, nextService: "Overdue", door: "Open" },
];

export default function BIMFacilityDashboard({ projectId }: { projectId?: number }) {
  const [systems, setSystems] = useState<any[]>(SYSTEMS);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSys, setSelectedSys] = useState<any>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      setSystems(prev => prev.map(s => ({
        ...s,
        temp: s.temp !== undefined ? parseFloat((s.temp + (Math.random() - 0.5) * 0.4).toFixed(1)) : undefined,
        load: s.load !== undefined ? Math.round(s.load + (Math.random() - 0.5) * 5) : undefined,
        floor: s.type === "Elevator" && Math.random() > 0.7 ? Math.max(0, Math.min(20, (s.floor || 0) + (Math.random() > 0.5 ? 1 : -1))) : s.floor,
      })));
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const filtered = activeTab === "all" ? systems : systems.filter(s => s.type.toLowerCase() === activeTab);
  const statusColor = (s: string) => ({ operational: "#4ade80", warning: "#f97316", critical: "#ef4444" }[s] || "#888");

  return (
    <div style={{ display: "flex", gap: "1.5rem", height: "100%" }}>
      {/* Left: System List */}
      <div className="glass-panel" style={{ width: "340px", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h2 style={{ margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}><Layers size={20} className="text-cyan" /> Facility Operations</h2>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {[["all", "All"], ["hvac", "HVAC"], ["energy", "Power"], ["fire", "Fire Safety"], ["elevator", "Elevators"]].map(([v, l]) => (
              <button key={v} onClick={() => setActiveTab(v)} style={{ padding: "0.4rem 0.8rem", borderRadius: "12px", fontSize: "0.75rem", background: activeTab === v ? "#06b6d4" : "rgba(255,255,255,0.05)", color: activeTab === v ? "#000" : "var(--text-secondary)", border: "none", cursor: "pointer", fontWeight: 600 }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
          {filtered.map(sys => (
            <div key={sys.id} onClick={() => setSelectedSys(sys)} style={{ padding: "1rem", borderRadius: "8px", cursor: "pointer", background: selectedSys?.id === sys.id ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.02)", border: `1px solid ${selectedSys?.id === sys.id ? "var(--cyan)" : "rgba(255,255,255,0.06)"}`, marginBottom: "0.5rem", transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {sys.type === "HVAC" && <ThermometerSun size={14} className="text-cyan" />}
                    {sys.type === "Energy" && <Zap size={14} className="text-orange" />}
                    {sys.type === "Fire" && <Bell size={14} className="text-red" />}
                    {sys.type === "Elevator" && <Settings size={14} className="text-purple-400" />}
                    <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{sys.name}</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{sys.zone}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor(sys.status), boxShadow: `0 0 6px ${statusColor(sys.status)}` }}></div>
                </div>
              </div>

              {/* Mini telemetry */}
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.8rem", padding: "0.5rem", background: "rgba(0,0,0,0.2)", borderRadius: "6px" }}>
                {sys.type === "HVAC" && <><span style={{ color: "white", fontWeight: 600 }}>{(sys as any).temp}°C</span> <span>Setpoint: {(sys as any).setpoint}°C</span></>}
                {sys.type === "Energy" && <><span style={{ color: "white", fontWeight: 600 }}>{(sys as any).load} kW</span> <span>PF: {(sys as any).pf}</span></>}
                {sys.type === "Fire" && <><span style={{ color: "white", fontWeight: 600 }}>{(sys as any).smoke}</span> <span>Pressure: {(sys as any).pressure} PSI</span></>}
                {sys.type === "Elevator" && <><span style={{ color: "white", fontWeight: 600 }}>Floor {(sys as any).floor}</span> <span>{(sys as any).door}</span></>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Digital Twin Viewer & Controls */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Selected System Controls */}
        {selectedSys ? (
          <div className="glass-panel" style={{ padding: "1.5rem", borderColor: statusColor(selectedSys.status), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: "0 0 0.4rem 0" }}>{selectedSys.name}</h2>
              <div style={{ display: "flex", gap: "1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                <span>ID: {selectedSys.id}</span>
                <span>Zone: {selectedSys.zone}</span>
                <span style={{ color: statusColor(selectedSys.status), textTransform: "uppercase", fontWeight: 700 }}>{selectedSys.status}</span>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "2rem" }}>
              {selectedSys.type === "HVAC" && (
                <>
                  <div style={{ textAlign: "center" }}><div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{selectedSys.temp}°C</div><div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Current Temp</div></div>
                  <div style={{ textAlign: "center" }}><div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{selectedSys.fanSpeed}%</div><div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Fan Speed</div></div>
                  <div style={{ textAlign: "center" }}><div style={{ fontSize: "1.5rem", fontWeight: 700, color: selectedSys.filter === "Replace" ? "#f97316" : "#4ade80" }}>{selectedSys.filter}</div><div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Filter Status</div></div>
                </>
              )}
              {selectedSys.type === "Elevator" && (
                <>
                  <div style={{ textAlign: "center" }}><div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{selectedSys.floor}</div><div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Current Floor</div></div>
                  <div style={{ textAlign: "center" }}><div style={{ fontSize: "1.5rem", fontWeight: 700, color: selectedSys.nextService === "Overdue" ? "#ef4444" : "white" }}>{selectedSys.nextService}</div><div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Next Service</div></div>
                </>
              )}
              <div style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "2rem", display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "center" }}>
                {selectedSys.type === "HVAC" && <button className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "0.4rem 1rem" }}>Adjust Setpoint</button>}
                <button className="btn btn-primary" style={{ fontSize: "0.8rem", padding: "0.4rem 1rem" }}>Create Work Order</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Select a system from the list to view live telemetry and controls.
          </div>
        )}

        {/* BIM Viewer */}
        <div className="glass-panel" style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", zIndex: 10 }}>
            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}><Layers size={18} className="text-purple-400" /> 6D Digital Twin (Facility & Asset Model)</h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-secondary" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}>X-Ray Mode</button>
              <button className="btn btn-secondary" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}>Highlight MEP</button>
            </div>
          </div>
          
          <div style={{ flex: 1, borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
            <BIMViewer />
          </div>
        </div>
      </div>
    </div>
  );
}
