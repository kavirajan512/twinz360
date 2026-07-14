"use client";

import React, { useState, useEffect } from "react";
import { Plane, TrendingUp, Clock, FileVideo } from "lucide-react";

export default function DroneProgressDashboard({ projectId }: { projectId?: number }) {
  const [snapshot, setSnapshot] = useState<any>(null);

  useEffect(() => {
    // Simulate fetching drone progress
    setSnapshot({
      date: new Date().toISOString().split("T")[0],
      planned_pct: 65.0,
      actual_pct: 58.0,
      delay_pct: 7.0,
      stage: "Foundation",
      predicted_completion: "2027-02-15"
    });
  }, [projectId]);

  return (
    <div className="module-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
        <div>
          <h2><Plane className="inline-icon text-cyan" size={24} /> Drone & Progress Intelligence</h2>
          <p className="text-muted">Automated progress tracking via photogrammetry</p>
        </div>
        <button className="btn btn-primary"><FileVideo size={16} /> Upload Flight Data</button>
      </div>

      {snapshot && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            <div className="stat-card">
              <div className="stat-value">{snapshot.planned_pct}%</div>
              <div className="stat-label">Planned Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-cyan">{snapshot.actual_pct}%</div>
              <div className="stat-label">Actual Progress (AI)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-orange">{snapshot.delay_pct}%</div>
              <div className="stat-label">Delay</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{snapshot.stage}</div>
              <div className="stat-label">Detected Stage</div>
            </div>
          </div>

          <div className="panel" style={{ padding: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem" }}><TrendingUp size={16} className="inline-icon"/> Progress vs Plan</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.85rem" }}>
                  <span>Planned</span>
                  <span>{snapshot.planned_pct}%</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px" }}>
                  <div style={{ width: `${snapshot.planned_pct}%`, height: "100%", background: "var(--text-muted)", borderRadius: "4px" }}></div>
                </div>
              </div>
              
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.85rem", color: "var(--primary)" }}>
                  <span>Actual (From Drone Scan)</span>
                  <span>{snapshot.actual_pct}%</span>
                </div>
                <div style={{ width: "100%", height: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "6px" }}>
                  <div style={{ width: `${snapshot.actual_pct}%`, height: "100%", background: "var(--primary)", borderRadius: "6px", boxShadow: "0 0 10px var(--primary)" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
