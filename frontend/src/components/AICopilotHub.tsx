"use client";

import React, { useState, useEffect } from "react";
import { BrainCircuit, Calendar, DollarSign, FileText, Users, ShoppingCart, Loader2 } from "lucide-react";

interface AICopilotHubProps {
  projectId: number;
}

export default function AICopilotHub({ projectId }: AICopilotHubProps) {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const API_BASE = "http://127.0.0.1:3001";
      try {
        const [docs, meetings, cost, schedule, resource, procurement] = await Promise.all([
          fetch(`${API_BASE}/ai/documents/${projectId}`).then(r => r.json()),
          fetch(`${API_BASE}/ai/meetings/${projectId}`).then(r => r.json()),
          fetch(`${API_BASE}/ai/cost/${projectId}`).then(r => r.json()),
          fetch(`${API_BASE}/ai/schedule/${projectId}`).then(r => r.json()),
          fetch(`${API_BASE}/ai/resource-planner/${projectId}`).then(r => r.json()),
          fetch(`${API_BASE}/ai/procurement/${projectId}`).then(r => r.json())
        ]);

        setData({ docs, meetings, cost, schedule, resource, procurement });
      } catch (e) {
        console.error("Failed to load AI data", e);
      }
      setLoading(false);
    };

    fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px", color: "var(--accent-cyan)" }}>
        <Loader2 className="animate-spin" size={32} />
        <span style={{ marginLeft: "1rem" }}>AI Copilot analyzing project data...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <BrainCircuit className="text-cyan" size={28} />
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>AI Copilot Hub</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Schedule & Progress */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "var(--accent-cyan)" }}>
            <Calendar size={20} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>AI Construction Scheduler</h3>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <span className="badge badge-emerald">Status: {data.schedule?.status}</span>
            <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>Predicted Completion: <strong>{data.schedule?.predicted_completion}</strong></div>
          </div>
          <div style={{ padding: "0.8rem", background: "rgba(6, 182, 212, 0.1)", borderLeft: "3px solid var(--accent-cyan)", fontSize: "0.85rem" }}>
            <strong>AI Recommendation:</strong> {data.schedule?.recommendations[0]}
          </div>
        </div>

        {/* Cost Estimator */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "var(--accent-cyan)" }}>
            <DollarSign size={20} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>AI Cost Estimator</h3>
          </div>
          {data.cost?.map((c: any, i: number) => (
            <div key={i} style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: i === 0 ? "1px solid var(--border-color)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <strong>{c.category}</strong>
                <span style={{ color: c.variance > 0 ? "var(--accent-red)" : "var(--accent-emerald)" }}>{c.variance}% Variance</span>
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Est: ${c.estimated_cost.toLocaleString()} | Act: ${c.actual_cost.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>🤖 {c.recommendation}</div>
            </div>
          ))}
        </div>

        {/* Document Analyzer */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "var(--accent-cyan)" }}>
            <FileText size={20} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>AI Document Analyzer</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {data.docs?.map((d: any, i: number) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", padding: "0.8rem", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <strong style={{ fontSize: "0.9rem" }}>{d.filename}</strong>
                  <span className={d.risk_score > 30 ? "badge badge-amber" : "badge badge-emerald"}>Risk: {d.risk_score}</span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{d.summary}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource & Procurement */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "var(--accent-cyan)" }}>
              <Users size={20} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>AI Resource Planner</h3>
            </div>
            <div style={{ fontSize: "0.85rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <strong style={{ color: "var(--accent-amber)" }}>Predicted Shortages:</strong>
                <ul style={{ paddingLeft: "1.2rem", marginTop: "0.3rem" }}>
                  {data.resource?.shortages_predicted.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <strong style={{ color: "var(--accent-emerald)" }}>Surplus:</strong>
                <ul style={{ paddingLeft: "1.2rem", marginTop: "0.3rem" }}>
                  {data.resource?.surplus.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "var(--accent-cyan)" }}>
              <ShoppingCart size={20} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>AI Procurement Assistant</h3>
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--accent-red)" }}>Alert:</strong> {data.procurement?.reorder_alerts[0]}
              <br/><br/>
              <strong>Best Prices:</strong>
              <ul style={{ paddingLeft: "1.2rem", marginTop: "0.3rem", marginBottom: "0.5rem" }}>
                {data.procurement?.best_prices.map((p: string, i: number) => <li key={i}>{p}</li>)}
              </ul>
              <div style={{ padding: "0.5rem", background: "rgba(6, 182, 212, 0.1)", borderRadius: "4px" }}>
                🤖 {data.procurement?.recommendation}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
