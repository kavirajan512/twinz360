"use client";
import React, { useState } from "react";
import { Clock, TrendingDown, TrendingUp, Calendar, AlertOctagon, CheckCircle2 } from "lucide-react";
import DigitalTwinViewer from "./DigitalTwinViewer";

export default function BIM4DDashboard() {
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [sliderProgress, setSliderProgress] = useState(56); // Matches default timeline

  const scheduleTasks = [
    { id: 1, name: "Foundation Pour", status: "completed", start: "May 24", end: "May 25", progress: 10, delay: 0 },
    { id: 2, name: "Steel Columns Erection", status: "completed", start: "May 26", end: "May 27", progress: 40, delay: 0 },
    { id: 3, name: "Level 1 Slab", status: "in-progress", start: "May 28", end: "May 29", progress: 60, delay: 2 },
    { id: 4, name: "MEP Rough-in L1", status: "delayed", start: "May 29", end: "May 30", progress: 80, delay: -3 },
    { id: 5, name: "Level 2 Columns", status: "pending", start: "May 31", end: "Jun 02", progress: 100, delay: 0 },
  ];

  const MetricCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
    <div className="glass-panel" style={{ padding: "1.5rem", flex: 1, display: "flex", gap: "1rem", alignItems: "center" }}>
      <div className={`p-3 rounded-xl bg-opacity-20 ${colorClass.replace("text-", "bg-")}`}>
        <Icon className={colorClass} size={28} />
      </div>
      <div>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>{title}</p>
        <h2 style={{ margin: "0.25rem 0", fontSize: "1.8rem", fontWeight: 700 }}>{value}</h2>
        <p style={{ margin: 0, fontSize: "0.75rem", color: colorClass === "text-red-500" ? "var(--red)" : "var(--text-secondary)" }}>{subtext}</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "1.5rem" }}>
      {/* Header & KPIs */}
      <div>
        <h1 style={{ margin: "0 0 1rem 0", fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
          BIM 4D Schedule Variance
        </h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <MetricCard title="Schedule Variance (SV)" value="-3 Days" subtext="Critical Path Delayed" icon={AlertOctagon} colorClass="text-red-500" />
          <MetricCard title="Schedule Performance (SPI)" value="0.92" subtext="Target: 1.0" icon={TrendingDown} colorClass="text-orange-500" />
          <MetricCard title="Cost Performance (CPI)" value="1.05" subtext="Under Budget" icon={TrendingUp} colorClass="text-green-500" />
          <MetricCard title="Milestone Completion" value="45%" subtext="Phase 1 Structure" icon={CheckCircle2} colorClass="text-cyan" />
        </div>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flex: 1, minHeight: 0 }}>
        {/* Left: Gantt Chart / Task List */}
        <div className="glass-panel" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Interactive Schedule</h3>
            <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><div className="w-2 h-2 rounded-full bg-green-500"></div> On Time</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><div className="w-2 h-2 rounded-full bg-red-500"></div> Delayed</span>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {scheduleTasks.map((task) => (
              <div 
                key={task.id} 
                onClick={() => { setSelectedTask(task.id); setSliderProgress(task.progress); }}
                style={{ 
                  padding: "1rem", 
                  background: selectedTask === task.id ? "rgba(6, 182, 212, 0.15)" : "rgba(255,255,255,0.02)", 
                  border: `1px solid ${selectedTask === task.id ? "var(--cyan)" : "rgba(255,255,255,0.05)"}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <strong style={{ color: task.status === "delayed" ? "var(--red)" : "white" }}>{task.name}</strong>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Calendar size={12}/> {task.start} - {task.end}
                  </span>
                </div>
                {/* Gantt Bar Visualization */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                     <div style={{ width: `${task.progress}%`, height: "100%", background: task.status === "delayed" ? "var(--red)" : "var(--cyan)" }}></div>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: task.status === "delayed" ? "var(--red)" : "var(--text-muted)", minWidth: "40px", textAlign: "right" }}>
                    {task.delay < 0 ? `${task.delay}d` : task.status === "completed" ? "Done" : `${task.progress}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 4D Model Viewer */}
        <div className="glass-panel" style={{ flex: 1, position: "relative", overflow: "hidden", border: "1px solid rgba(6, 182, 212, 0.3)" }}>
          <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 10, background: "rgba(0,0,0,0.7)", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
             <h4 style={{ margin: 0, fontSize: "0.9rem", color: "var(--cyan)" }}>Physical As-Built Sync</h4>
             <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>Select a task to jump timeline</p>
          </div>
          {/* Reuse the DigitalTwinViewer but pass down the simulated progress */}
          <div style={{ width: "100%", height: "100%" }}>
            <DigitalTwinViewer 
              progress={sliderProgress} 
              activeLayers={{ foundation: true, columns: true, beams: true, slabs: true, mep: true, equipment: false, workers: false, cameras: false }} 
              isLiveMode={false} 
              resetCameraTrigger={0} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
