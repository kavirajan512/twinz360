"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, AlertTriangle, CalendarDays, DollarSign } from "lucide-react";

export default function FinanceDashboard({ projectId }: { projectId?: number }) {
  const [forecast, setForecast] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    // Simulate fetching finance and schedule data
    setForecast({
      original_budget: 50000000,
      spent_to_date: 22500000,
      forecasted_final_cost: 52600000,
      expected_overrun: 2600000,
      completion_risk_pct: 18,
      predicted_delay_days: 11
    });

    setTasks([
      { id: 1, name: "Foundation", phase: "Phase 2", start: "2026-06-15", end: "2026-07-10", progress: 100, status: "completed" },
      { id: 2, name: "Column Erection", phase: "Phase 2", start: "2026-07-11", end: "2026-07-30", progress: 15, status: "in_progress" },
      { id: 3, name: "Beam & Slab", phase: "Phase 3", start: "2026-08-01", end: "2026-08-30", progress: 0, status: "pending" },
    ]);
  }, [projectId]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="module-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
        <div>
          <h2><TrendingUp className="inline-icon text-cyan" size={24} /> AI Cost & Schedule Intelligence</h2>
          <p className="text-muted">Predictive financial forecasting and auto-Gantt generation</p>
        </div>
      </div>

      {forecast && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          <div className="stat-card">
            <div className="stat-value">{formatCurrency(forecast.forecasted_final_cost)}</div>
            <div className="stat-label">Forecasted Final Cost</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-red">+{formatCurrency(forecast.expected_overrun)}</div>
            <div className="stat-label">Expected Overrun</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-orange">{forecast.completion_risk_pct}%</div>
            <div className="stat-label">Completion Risk</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-orange">{forecast.predicted_delay_days} days</div>
            <div className="stat-label">Predicted Delay</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="panel" style={{ padding: "1rem" }}>
          <h3 style={{ marginBottom: "1rem" }}><CalendarDays size={16} className="inline-icon"/> AI Schedule / Gantt</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {tasks.map(task => (
              <div key={task.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{task.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{task.start} to {task.end}</div>
                </div>
                <div style={{ width: "100px", background: "rgba(255,255,255,0.1)", height: "8px", borderRadius: "4px", margin: "0 1rem" }}>
                  <div style={{ width: `${task.progress}%`, height: "100%", background: task.status === 'completed' ? 'var(--primary)' : 'var(--cyan)', borderRadius: "4px" }}></div>
                </div>
                <div style={{ fontSize: "0.8rem", width: "40px", textAlign: "right" }}>{task.progress}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ padding: "1rem" }}>
           <h3 style={{ marginBottom: "1rem" }}><DollarSign size={16} className="inline-icon"/> Budget Utilization</h3>
           {forecast && (
             <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
               <div>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.85rem" }}>
                   <span>Original Budget</span>
                   <span>{formatCurrency(forecast.original_budget)}</span>
                 </div>
                 <div style={{ width: "100%", height: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "6px" }}>
                   <div style={{ width: "100%", height: "100%", background: "var(--text-muted)", borderRadius: "6px" }}></div>
                 </div>
               </div>
               <div>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.85rem" }}>
                   <span>Spent to Date</span>
                   <span>{formatCurrency(forecast.spent_to_date)}</span>
                 </div>
                 <div style={{ width: "100%", height: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "6px" }}>
                   <div style={{ width: `${(forecast.spent_to_date / forecast.original_budget) * 100}%`, height: "100%", background: "var(--primary)", borderRadius: "6px" }}></div>
                 </div>
               </div>
               <div>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.85rem", color: "var(--red)" }}>
                   <span>Forecasted Final Cost (with Overrun)</span>
                   <span>{formatCurrency(forecast.forecasted_final_cost)}</span>
                 </div>
                 <div style={{ width: "100%", height: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "6px" }}>
                   <div style={{ width: `${Math.min(100, (forecast.forecasted_final_cost / forecast.original_budget) * 100)}%`, height: "100%", background: "var(--red)", borderRadius: "6px" }}></div>
                 </div>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
