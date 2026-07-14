"use client";
import React, { useState, useEffect } from "react";
import { AlertTriangle, UserCheck, UserX, CloudRain, Clock, ShieldAlert, Truck, ArrowLeft, Maximize, PlayCircle } from "lucide-react";

export default function AIVisionDashboard({ onBack }: { onBack: () => void }) {
  const [events, setEvents] = useState([
    { id: 1, time: "10:14 AM", type: "DANGER", msg: "Unauthorized access in Crane Zone A", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
    { id: 2, time: "10:12 AM", type: "WORKING", msg: "Team B active on Level 4 pouring", icon: UserCheck, color: "text-green-500", bg: "bg-green-500/10" },
    { id: 3, time: "10:05 AM", type: "WEATHER", msg: "Rain detected. Slippery conditions.", icon: CloudRain, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: 4, time: "09:45 AM", type: "CRANE", msg: "Crane 2 approaching 90% load capacity", icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { id: 5, time: "09:30 AM", type: "NOT WORKING", msg: "Idling detected at East Gate for 15m", icon: UserX, color: "text-gray-400", bg: "bg-gray-400/10" },
    { id: 6, time: "08:00 AM", type: "SHIFT ALARM", msg: "Morning shift commenced. 142 logged in.", icon: Clock, color: "text-cyan", bg: "bg-cyan/10" },
  ]);

  // Simulate incoming events
  useEffect(() => {
    const interval = setInterval(() => {
      const types = [
        { type: "RISK", msg: "PPE Violation: No helmet detected", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10" },
        { type: "THEFT", msg: "Suspicious movement near tool shed", icon: ShieldAlert, color: "text-red-600", bg: "bg-red-600/10" },
        { type: "WORKING", msg: "Welding operation started in Zone C", icon: UserCheck, color: "text-green-500", bg: "bg-green-500/10" },
      ];
      const randomEvent = types[Math.floor(Math.random() * types.length)];
      
      const newEvent = {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...randomEvent
      };
      
      setEvents(prev => [newEvent, ...prev].slice(0, 50));
    }, 15000); // New event every 15s

    return () => clearInterval(interval);
  }, []);

  const BoundingBox = ({ id, label, color, initialX, initialY }: { id: number, label: string, color: string, initialX: string, initialY: string }) => {
    // Add a simple float animation class
    return (
      <div 
        style={{ 
          position: "absolute", 
          top: initialY, 
          left: initialX, 
          width: "120px", 
          height: "180px", 
          border: `2px solid ${color}`, 
          backgroundColor: `${color}1A`,
          pointerEvents: "none",
          transition: "all 2s ease-in-out",
          animation: `float${id % 3} 4s infinite alternate ease-in-out`,
          zIndex: 5
        }}
      >
        <div style={{ position: "absolute", top: "-18px", left: "-2px", background: color, color: "#fff", fontSize: "0.6rem", padding: "2px 4px", fontWeight: "bold" }}>
          {label}
        </div>
      </div>
    );
  };

  const CameraFeed = ({ title, imgUrl, aiStatus, type }: { title: string, imgUrl: string, aiStatus: string, type: "entry" | "crane" | "slab" | "storage" }) => (
    <div className="glass-panel" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "0.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
         <h3 style={{ fontSize: "0.9rem", margin: 0, fontWeight: 600 }}>{title}</h3>
         <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.7rem", color: aiStatus.includes("Active") || aiStatus.includes("Clear") ? "var(--green)" : "var(--red)" }}>
              {aiStatus}
            </span>
            <Maximize size={14} className="text-muted cursor-pointer" />
         </div>
      </div>
      <div style={{ flex: 1, position: "relative", background: "#000", overflow: "hidden" }}>
         <img src={imgUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
         
         {/* Live AI Tracking Boxes */}
         {type === "entry" && (
            <>
              <BoundingBox id={1} label="Person 98%" color="#4ade80" initialX="20%" initialY="30%" />
              <BoundingBox id={2} label="Hardhat 95%" color="#4ade80" initialX="60%" initialY="40%" />
              <BoundingBox id={3} label="No PPE!" color="#ef4444" initialX="80%" initialY="20%" />
            </>
         )}
         {type === "crane" && (
            <>
              <BoundingBox id={4} label="Crane Hook 92%" color="#eab308" initialX="40%" initialY="10%" />
              <BoundingBox id={5} label="Load Limit: 90%" color="#ef4444" initialX="45%" initialY="40%" />
            </>
         )}
         {type === "slab" && (
            <>
              <BoundingBox id={6} label="Worker Active" color="#4ade80" initialX="30%" initialY="50%" />
              <BoundingBox id={7} label="Worker Idle 12m" color="#f97316" initialX="70%" initialY="60%" />
            </>
         )}
         {type === "storage" && (
            <>
              <BoundingBox id={8} label="Material Pallet" color="#06b6d4" initialX="20%" initialY="70%" />
              <BoundingBox id={9} label="Intruder 99%" color="#ef4444" initialX="50%" initialY="30%" />
            </>
         )}

         {/* Global HUD Overlay */}
         <div style={{ position: "absolute", top: "10px", left: "10px", border: "1px solid var(--cyan)", background: "rgba(6, 182, 212, 0.2)", padding: "2px 6px", fontSize: "0.6rem", color: "#fff", zIndex: 10 }}>
           <div className="animate-ping h-1.5 w-1.5 rounded-full bg-cyan-400 inline-block mr-1"></div>
           YOLOv11 Tracking Active
         </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={onBack} className="btn btn-secondary" style={{ padding: "0.5rem" }}><ArrowLeft size={16} /></button>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, background: "linear-gradient(90deg, #fff, var(--cyan))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              AI Vision Command Center
            </h1>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem" }}>Live CCTV Feeds & Real-Time Object Detection</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
           <div className="glass-panel" style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShieldAlert className="text-red-500" size={16} />
              <span style={{ fontSize: "0.85rem" }}>2 Critical Alerts</span>
           </div>
           <div className="glass-panel" style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <UserCheck className="text-green-500" size={16} />
              <span style={{ fontSize: "0.85rem" }}>142 Workers Tracked</span>
           </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "1.5rem", flex: 1, minHeight: 0 }}>
        
        {/* Left: 2x2 Camera Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "1rem" }}>
           <CameraFeed title="CAM-01: Site Entry" type="entry" imgUrl="https://images.unsplash.com/photo-1541888087515-09f029019688?w=800&q=80" aiStatus="Tracking: Active" />
           <CameraFeed title="CAM-02: Crane Zone" type="crane" imgUrl="https://images.unsplash.com/photo-1504307651254-35680f356f12?w=800&q=80" aiStatus="Warning: Load Capacity" />
           <CameraFeed title="CAM-03: Level 4 Slab" type="slab" imgUrl="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80" aiStatus="Tracking: Active" />
           <CameraFeed title="CAM-04: Material Storage" type="storage" imgUrl="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80" aiStatus="Alert: Unauthorized Access" />
        </div>

        {/* Right: AI Event Log */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
           <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Real-Time AI Log</h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>Auto-detecting anomalies & productivity</p>
           </div>
           
           <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {events.map((ev) => (
                 <div key={ev.id} style={{ display: "flex", gap: "0.75rem", padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${ev.bg}`}>
                       <ev.icon size={14} className={ev.color} />
                    </div>
                    <div>
                       <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.5px" }} className={ev.color}>{ev.type}</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{ev.time}</span>
                       </div>
                       <p style={{ margin: 0, fontSize: "0.85rem", color: "#e4e4e7" }}>{ev.msg}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
