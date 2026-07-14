"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, ShieldAlert, Activity, CheckCircle, Video } from "lucide-react";

export default function AISafetyDashboard({ projectId }: { projectId?: number }) {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Simulating fetching AI safety alerts
    setAlerts([
      { id: 1, type: "helmet_missing", zone: "Sector A", severity: "warning", worker: "Worker #12", time: "10:42 AM", confidence: 94.7 },
      { id: 2, type: "unauthorized", zone: "Sector C", severity: "critical", worker: "Unknown", time: "11:05 AM", confidence: 88.2 },
      { id: 3, type: "vest_missing", zone: "Sector B", severity: "warning", worker: "Worker #45", time: "11:30 AM", confidence: 91.5 },
      { id: 4, type: "fall", zone: "Tower Crane Base", severity: "emergency", worker: "Worker #22", time: "11:45 AM", confidence: 98.9 },
    ]);
  }, [projectId]);

  return (
    <div className="module-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
        <div>
          <h2><ShieldAlert className="inline-icon text-red" size={24} /> AI Safety Monitoring</h2>
          <p className="text-muted">Real-time YOLOv11 detection pipeline and alerts</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Live Feed Placeholder */}
        <div className="panel" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3><Video size={16} className="inline-icon" /> Live Detection Feed (CAM-01)</h3>
          <div style={{ background: "#000", height: "300px", borderRadius: "8px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "var(--text-muted)" }}>RTSP Stream / YOLOv11 Inference Overlay</span>
            {/* Mock Bounding Box */}
            <div style={{ position: "absolute", top: "40%", left: "30%", width: "50px", height: "100px", border: "2px solid red", borderRadius: "4px" }}>
              <span style={{ background: "red", color: "white", fontSize: "10px", padding: "2px", position: "absolute", top: "-16px", left: "-2px" }}>No Helmet 94%</span>
            </div>
          </div>
        </div>

        {/* Alert List */}
        <div className="panel" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3><AlertTriangle size={16} className="inline-icon" /> Active Escalations</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", overflowY: "auto", maxHeight: "300px" }}>
            {alerts.map(alert => (
              <div key={alert.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "rgba(255,255,255,0.05)", borderRadius: "8px", borderLeft: `4px solid ${alert.severity === 'emergency' ? 'red' : alert.severity === 'critical' ? 'orange' : 'var(--primary)'}` }}>
                <div>
                  <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {alert.type.replace("_", " ").toUpperCase()}
                    <span className="badge badge-warning" style={{ fontSize: "0.6rem" }}>{alert.confidence}%</span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{alert.zone} • {alert.worker}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{alert.time}</span>
                  <button className="btn btn-secondary" style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem" }}><CheckCircle size={12}/> Resolve</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
