"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Video, Maximize2, Minimize2, AlertTriangle, ShieldCheck, 
  Play, Pause, Activity, Radio, Target, ToggleLeft, ToggleRight,
  Sliders, Compass, Eye, ShieldAlert, Cpu, CheckCircle2, ChevronRight,
  ArrowRight, RefreshCw, ZoomIn, EyeOff, Navigation
} from "lucide-react";

// Video feed urls from Pexels (highly optimized, fast loading loop videos of construction environments)
const CAMERAS_DATA = [
  {
    id: "CAM-01",
    name: "Main Entry & Logistics Gate",
    status: "LIVE",
    videoUrl: "https://videos.pexels.com/video-files/3252077/3252077-hd_1920_1080_24fps.mp4",
    type: "Fixed CCTV",
    location: "Sector A - West Gate",
    detections: [
      { id: "d1", type: "Vehicle", label: "Truck - Auth ID #884", color: "#06b6d4", x: 15, y: 35, w: 32, h: 45 },
      { id: "d2", type: "Person", label: "Worker (PPE OK)", color: "#10b981", x: 68, y: 55, w: 12, h: 30 }
    ]
  },
  {
    id: "CAM-02",
    name: "Tower Crane POV Main",
    status: "LIVE",
    videoUrl: "https://videos.pexels.com/video-files/2824647/2824647-uhd_2560_1440_24fps.mp4",
    type: "PTZ Dome",
    location: "Sector B - Tower Crane A",
    detections: [
      { id: "d3", type: "Material", label: "Steel Rebar Bundle", color: "#a855f7", x: 38, y: 45, w: 22, h: 22 }
    ]
  },
  {
    id: "CAM-03",
    name: "Excavation & Foundations",
    status: "LIVE",
    videoUrl: "https://videos.pexels.com/video-files/4214959/4214959-uhd_2560_1440_30fps.mp4",
    type: "Fixed CCTV",
    location: "Sector C - South Pit",
    detections: [
      { id: "d4", type: "Equipment", label: "Excavator EX-02", color: "#f59e0b", x: 48, y: 38, w: 38, h: 42 },
      { id: "d5", type: "Hazard", label: "NO HARDHAT DETECTED", color: "#ef4444", x: 22, y: 68, w: 10, h: 20 }
    ]
  },
  {
    id: "DRONE-01",
    name: "Autonomous Aerial Patrol",
    status: "PATROLLING",
    videoUrl: "https://videos.pexels.com/video-files/4379960/4379960-hd_1920_1080_25fps.mp4",
    type: "DJI Matrice FPV Feed",
    location: "Sector D & E - High Altitude Patrol",
    isDrone: true,
    detections: [
      { id: "d6", type: "Zone", label: "Perimeter Sector Scan", color: "#10b981", x: 10, y: 15, w: 75, h: 70 }
    ]
  }
];

export default function CCTVDashboard() {
  const [cameras, setCameras] = useState(CAMERAS_DATA);
  const [selectedCamId, setSelectedCamId] = useState<string | null>(null);
  
  // Custom interactive modes
  const [showAiOverlay, setShowAiOverlay] = useState(true);
  const [thermalMode, setThermalMode] = useState(false);
  const [showHudGrid, setShowHudGrid] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([
    { id: 1, cam: "CAM-03", msg: "Safety Violation: Hardhat missing - Sector C", severity: "high", time: "10:48 AM", resolved: false },
    { id: 2, cam: "CAM-01", msg: "Unidentified Delivery Vehicle at Gate", severity: "medium", time: "10:30 AM", resolved: true }
  ]);
  
  // Time state
  const [timeStr, setTimeStr] = useState("");
  
  // Drone Telemetry variables
  const [droneAlt, setDroneAlt] = useState(45.5);
  const [droneSpd, setDroneSpd] = useState(14.8);
  const [dronePitch, setDronePitch] = useState(-45);
  const [droneBattery, setDroneBattery] = useState(82);
  const [droneGPS, setDroneGPS] = useState({ lat: 13.08272, lon: 80.27071 });
  const [isPatrolling, setIsPatrolling] = useState(true);
  
  // CCTV camera parameters (PTZ simulation)
  const [cctvZoom, setCctvZoom] = useState<Record<string, number>>({
    "CAM-01": 1.0,
    "CAM-02": 1.0,
    "CAM-03": 1.0,
  });
  const [cctvPan, setCctvPan] = useState<Record<string, { x: number; y: number }>>({
    "CAM-01": { x: 0, y: 0 },
    "CAM-02": { x: 0, y: 0 },
    "CAM-03": { x: 0, y: 0 },
  });

  // Keep digital twin timestamp ticking
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString() + " | " + now.toLocaleDateString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate drone patrolling coordinates
  useEffect(() => {
    if (!isPatrolling) return;
    const interval = setInterval(() => {
      setDroneGPS(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.0001,
        lon: prev.lon + (Math.random() - 0.5) * 0.0001
      }));
      setDroneBattery(prev => Math.max(1, prev - (Math.random() > 0.8 ? 1 : 0)));
      // Randomly change speed slightly
      setDroneSpd(prev => {
        const next = prev + (Math.random() - 0.5) * 1.2;
        return Math.max(5, Math.min(next, 35));
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [isPatrolling]);

  const togglePatrol = () => {
    setIsPatrolling(!isPatrolling);
    if (!isPatrolling) {
      setDroneSpd(15.2);
    } else {
      setDroneSpd(0);
    }
  };

  const handleCameraPan = (camId: string, direction: "up" | "down" | "left" | "right") => {
    setCctvPan(prev => {
      const current = prev[camId] || { x: 0, y: 0 };
      let { x, y } = current;
      if (direction === "up") y = Math.max(-20, y - 5);
      if (direction === "down") y = Math.min(20, y + 5);
      if (direction === "left") x = Math.max(-20, x - 5);
      if (direction === "right") x = Math.min(20, x + 5);
      return { ...prev, [camId]: { x, y } };
    });
  };

  const resetCamera = (camId: string) => {
    setCctvPan(prev => ({ ...prev, [camId]: { x: 0, y: 0 } }));
    setCctvZoom(prev => ({ ...prev, [camId]: 1.0 }));
  };

  const triggerAlertSimulation = () => {
    const alertId = Date.now();
    const newAlert = {
      id: alertId,
      cam: "CAM-03",
      msg: `AI Detection Alert: PPE Violation in Sector C (${new Date().toLocaleTimeString()})`,
      severity: "high",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      resolved: false
    };
    setSystemAlerts(prev => [newAlert, ...prev]);
  };

  const resolveAlert = (id: number) => {
    setSystemAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  const activeCam = cameras.find(c => c.id === selectedCamId);
  const activeCamId = activeCam?.id || "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", height: "100%" }}>
      
      {/* HUD Header Toolbar */}
      <div style={{
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "1rem", 
        background: "rgba(18, 18, 20, 0.8)", 
        border: "1px solid var(--border-color)", 
        borderRadius: "var(--border-radius)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ 
            padding: "0.5rem", 
            background: "rgba(239, 68, 68, 0.15)", 
            borderRadius: "8px", 
            border: "1px solid rgba(239, 68, 68, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Radio className="text-red animate-pulse" size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "1px", color: "#fff" }}>AI SURVEILLANCE COCKPIT</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>Multi-feed computer vision intelligence & flight control</p>
          </div>
        </div>

        {/* Global Controls Overlay */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          
          <button 
            onClick={() => setShowAiOverlay(!showAiOverlay)} 
            className="btn" 
            style={{ 
              padding: "0.4rem 0.8rem", 
              fontSize: "0.75rem",
              background: showAiOverlay ? "rgba(6, 182, 212, 0.15)" : "transparent",
              borderColor: showAiOverlay ? "var(--accent-cyan)" : "var(--border-color)",
              color: showAiOverlay ? "var(--accent-cyan)" : "var(--text-secondary)"
            }}
          >
            <Cpu size={14} />
            <span>AI Bounding Boxes: {showAiOverlay ? "ON" : "OFF"}</span>
          </button>

          <button 
            onClick={() => setThermalMode(!thermalMode)} 
            className="btn" 
            style={{ 
              padding: "0.4rem 0.8rem", 
              fontSize: "0.75rem",
              background: thermalMode ? "rgba(168, 85, 247, 0.15)" : "transparent",
              borderColor: thermalMode ? "var(--accent-purple)" : "var(--border-color)",
              color: thermalMode ? "var(--accent-purple)" : "var(--text-secondary)"
            }}
          >
            <Eye size={14} />
            <span>Night Thermal: {thermalMode ? "ACTIVE" : "OFF"}</span>
          </button>

          <button 
            onClick={() => setShowHudGrid(!showHudGrid)} 
            className="btn" 
            style={{ 
              padding: "0.4rem 0.8rem", 
              fontSize: "0.75rem",
              background: showHudGrid ? "rgba(245, 158, 11, 0.15)" : "transparent",
              borderColor: showHudGrid ? "var(--accent-amber)" : "var(--border-color)",
              color: showHudGrid ? "var(--accent-amber)" : "var(--text-secondary)"
            }}
          >
            <Target size={14} />
            <span>HUD Crosshairs: {showHudGrid ? "ON" : "OFF"}</span>
          </button>

          <button 
            onClick={triggerAlertSimulation} 
            className="btn btn-danger animate-[pulse_2s_infinite]" 
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
          >
            <ShieldAlert size={14} />
            <span>Simulate Incident</span>
          </button>

          <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-muted)", paddingLeft: "1rem", borderLeft: "1px solid var(--border-color)" }}>
            {timeStr}
          </div>
        </div>
      </div>

      {/* Main Layout Area */}
      <div style={{ display: "grid", gridTemplateColumns: selectedCamId ? "1fr 340px" : "1fr", gap: "1.5rem", flex: 1, minHeight: 0 }}>
        
        {/* Left Side: Camera Grid / Focus Cam */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", height: "100%" }}>
          {selectedCamId ? (
            /* MAXIMIZED FOCUS CAMERA */
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <button 
                    onClick={() => setSelectedCamId(null)} 
                    className="btn btn-secondary" 
                    style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                  >
                    ← Back to Grid
                  </button>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fff" }}>
                    {activeCam?.id} — {activeCam?.name}
                  </span>
                  <span className="badge badge-cyan" style={{ fontSize: "9px" }}>{activeCam?.type}</span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                  LOC: {activeCam?.location}
                </span>
              </div>

              {/* Active Focused Video View */}
              <div style={{ 
                position: "relative", 
                flex: 1, 
                background: "#000", 
                borderRadius: "12px", 
                overflow: "hidden", 
                border: "2px solid var(--accent-cyan)",
                boxShadow: "0 0 25px rgba(6, 182, 212, 0.2)",
                aspectRatio: "16/9"
              }}>
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "all 0.3s ease-out",
                    filter: thermalMode 
                      ? "hue-rotate(110deg) saturate(1.8) contrast(1.5) brightness(1.2)"
                      : "none",
                    transform: activeCam && !activeCam.isDrone 
                      ? `scale(${cctvZoom[activeCam.id] || 1}) translate(${cctvPan[activeCam.id]?.x || 0}px, ${cctvPan[activeCam.id]?.y || 0}px)`
                      : "none"
                  }}
                >
                  <source src={activeCam?.videoUrl} type="video/mp4" />
                </video>

                {/* CRT Scanline Overlay */}
                {showHudGrid && (
                  <>
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      backgroundImage: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.04))",
                      backgroundSize: "100% 4px, 3px 100%",
                      opacity: 0.35
                    }} />
                    {/* Compass Overlay / Target HUD */}
                    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                      <Target size={150} style={{ color: activeCam?.isDrone ? "var(--accent-emerald)" : "var(--accent-cyan)", opacity: 0.25 }} strokeWidth={1} />
                      <div style={{ position: "absolute", width: "100%", height: "1px", background: "rgba(255,255,255,0.05)" }}></div>
                      <div style={{ position: "absolute", height: "100%", width: "1px", background: "rgba(255,255,255,0.05)" }}></div>
                    </div>
                  </>
                )}

                {/* Simulated AI Bounding Boxes */}
                {showAiOverlay && activeCam?.detections.map((det) => (
                  <div 
                    key={det.id} 
                    style={{ 
                      position: "absolute",
                      border: "2px solid",
                      borderColor: det.color,
                      background: "rgba(0,0,0,0.15)",
                      pointerEvents: "none",
                      left: `${det.x}%`,
                      top: `${det.y}%`,
                      width: `${det.w}%`,
                      height: `${det.h}%`,
                      boxShadow: `0 0 10px ${det.color}33`,
                      transition: "all 0.1s linear"
                    }}
                  >
                    <div style={{
                      position: "absolute",
                      top: "-22px",
                      left: "-2px",
                      background: det.color,
                      color: "#000",
                      fontSize: "9px",
                      fontWeight: "bold",
                      padding: "2px 6px",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.5)"
                    }}>
                      {det.label} ({Math.floor(Math.random() * 5 + 93)}%)
                    </div>
                  </div>
                ))}

                {/* HUD Overlay Stats inside Feed */}
                <div style={{ position: "absolute", top: "15px", left: "15px", fontFamily: "monospace", fontSize: "10px", color: "#10b981", background: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "4px" }}>
                  RESOL: {activeCam?.isDrone ? "3840x2160 [4K]" : "1920x1080 [FHD]"} • FPS: {activeCam?.isDrone ? 30 : 24}
                </div>

                <div style={{ position: "absolute", bottom: "15px", right: "15px", fontFamily: "monospace", fontSize: "10px", color: "var(--accent-cyan)", background: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "4px" }}>
                  LATENCY: {Math.floor(Math.random() * 12 + 15)}ms • PACKET_LOSS: 0.00%
                </div>
              </div>
            </div>
          ) : (
            /* CAMERA GRID FEEDS (4 Cameras) */
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr", 
              gap: "1.25rem", 
              flex: 1 
            }}>
              {cameras.map((cam) => (
                <div 
                  key={cam.id} 
                  style={{
                    position: "relative",
                    background: "#050507",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    aspectRatio: "16/9",
                    cursor: "pointer",
                    transition: "var(--transition-smooth)"
                  }}
                  onClick={() => setSelectedCamId(cam.id)}
                  className="glass-panel-hover"
                >
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: 0.75,
                      filter: thermalMode 
                        ? "hue-rotate(110deg) saturate(1.8) contrast(1.5) brightness(1.2)"
                        : "none"
                    }}
                  >
                    <source src={cam.videoUrl} type="video/mp4" />
                  </video>

                  {/* HUD Overlay Scanlines */}
                  {showHudGrid && (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      backgroundImage: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%)",
                      backgroundSize: "100% 4px",
                      opacity: 0.25
                    }} />
                  )}

                  {/* Live AI Overlay in Grid */}
                  {showAiOverlay && cam.detections.map((det) => (
                    <div 
                      key={det.id} 
                      style={{ 
                        position: "absolute",
                        border: "1.5px solid",
                        borderColor: det.color,
                        pointerEvents: "none",
                        left: `${det.x}%`,
                        top: `${det.y}%`,
                        width: `${det.w}%`,
                        height: `${det.h}%`
                      }}
                    >
                      <div style={{
                        position: "absolute",
                        top: "-15px",
                        left: "-1.5px",
                        background: det.color,
                        color: "#000",
                        fontSize: "7px",
                        fontWeight: "bold",
                        padding: "1px 4px",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap"
                      }}>
                        {det.label.split(" (")[0]}
                      </div>
                    </div>
                  ))}

                  {/* Header metadata */}
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: "8px 12px",
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ 
                        width: "6px", 
                        height: "6px", 
                        background: cam.status === "LIVE" ? "#ef4444" : "#10b981", 
                        borderRadius: "50%", 
                        animation: "pulse 1.5s infinite" 
                      }}></span>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: "11px", fontFamily: "monospace", letterSpacing: "1px" }}>{cam.id}</span>
                    </div>
                    <span style={{ color: "var(--text-secondary)", fontSize: "9px" }}>{cam.name}</span>
                  </div>

                  {/* Footer metadata */}
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "8px 12px",
                    background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "9px",
                    fontFamily: "monospace"
                  }}>
                    <span style={{ color: "#10b981" }}>ONLINE</span>
                    <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "2px" }}>
                      <Maximize2 size={10} /> Click to expand
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side Control Bar (Only appears if a camera is selected) */}
        {selectedCamId && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", height: "100%" }}>
            
            {/* Camera Metrics / Info Panel */}
            <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-cyan)", letterSpacing: "0.5px" }}>CAMERA METRICS</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Type</span>
                  <span style={{ fontWeight: 600 }}>{activeCam?.type}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Zone</span>
                  <span style={{ fontWeight: 600 }}>{activeCam?.location.split(" - ")[0]}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Hardware Status</span>
                  <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                    ● 100% HEALTHY
                  </span>
                </div>
                {activeCam?.isDrone && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Signal (RSSI)</span>
                      <span style={{ color: "#10b981", fontWeight: "bold" }}>-42 dBm [EXCELLENT]</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Controller Mode</span>
                      <span style={{ color: "var(--accent-purple)", fontWeight: "bold" }}>AUTOPILOT NAV</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* CONTROLLERS - Conditional based on if it's Drone or CCTV */}
            {activeCam?.isDrone ? (
              /* DRONE FLIGHT CONTROL PANEL */
              <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flex: 1 }}>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-emerald)", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Navigation size={14} /> FLIGHT NAVIGATION HUD
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Patrol Status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem", background: "rgba(0,0,0,0.3)", borderRadius: "8px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Wandering Patrol Mode</span>
                    <button 
                      onClick={togglePatrol} 
                      className="btn" 
                      style={{ 
                        padding: "0.3rem 0.6rem", 
                        fontSize: "0.7rem",
                        background: isPatrolling ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                        borderColor: isPatrolling ? "var(--accent-emerald)" : "var(--accent-red)",
                        color: isPatrolling ? "var(--accent-emerald)" : "var(--accent-red)"
                      }}
                    >
                      {isPatrolling ? "ACTIVE" : "STANDBY"}
                    </button>
                  </div>

                  {/* Sliders for Drone Variables */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Patrol Altitude</span>
                        <span style={{ color: "#fff", fontWeight: "bold" }}>{droneAlt.toFixed(1)} m</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="120" 
                        step="0.5"
                        value={droneAlt} 
                        onChange={(e) => setDroneAlt(parseFloat(e.target.value))}
                        style={{ width: "100%", accentColor: "var(--accent-emerald)" }}
                      />
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Cruising Speed</span>
                        <span style={{ color: "#fff", fontWeight: "bold" }}>{droneSpd.toFixed(1)} km/h</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="60" 
                        step="0.2"
                        value={droneSpd} 
                        onChange={(e) => {
                          setDroneSpd(parseFloat(e.target.value));
                          if (parseFloat(e.target.value) === 0) setIsPatrolling(false);
                          else setIsPatrolling(true);
                        }}
                        style={{ width: "100%", accentColor: "var(--accent-emerald)" }}
                      />
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Gimbal Pitch</span>
                        <span style={{ color: "#fff", fontWeight: "bold" }}>{dronePitch}°</span>
                      </div>
                      <input 
                        type="range" 
                        min="-90" 
                        max="0" 
                        step="1"
                        value={dronePitch} 
                        onChange={(e) => setDronePitch(parseInt(e.target.value))}
                        style={{ width: "100%", accentColor: "var(--accent-emerald)" }}
                      />
                    </div>
                  </div>

                  {/* Flight Status Metrics */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.75rem", fontFamily: "monospace" }}>
                    <div style={{ background: "rgba(0,0,0,0.4)", padding: "0.5rem", borderRadius: "6px" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "9px" }}>BATTERY STATUS</div>
                      <div style={{ color: droneBattery < 20 ? "var(--accent-red)" : "#10b981", fontWeight: "bold", fontSize: "1.1rem" }}>
                        {droneBattery}%
                      </div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.4)", padding: "0.5rem", borderRadius: "6px" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "9px" }}>HEADING</div>
                      <div style={{ color: "var(--accent-cyan)", fontWeight: "bold", fontSize: "1.1rem" }}>
                        NNE 24.8°
                      </div>
                    </div>
                  </div>

                  {/* Live Coordinates HUD */}
                  <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid var(--border-color)", padding: "0.6rem", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.75rem" }}>
                    <div style={{ color: "var(--accent-emerald)", fontWeight: "bold", marginBottom: "0.25rem" }}>GPS TELEMETRY FEED</div>
                    <div style={{ color: "#fff" }}>LAT: {droneGPS.lat.toFixed(6)}</div>
                    <div style={{ color: "#fff" }}>LON: {droneGPS.lon.toFixed(6)}</div>
                  </div>

                  {/* Flight Command Buttons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <button 
                      onClick={() => {
                        setDroneAlt(85);
                        setDroneSpd(32);
                        setDronePitch(-90);
                      }} 
                      className="btn btn-secondary" 
                      style={{ padding: "0.4rem 0.5rem", fontSize: "0.7rem", width: "100%" }}
                    >
                      Scan Perimeter
                    </button>
                    <button 
                      onClick={() => {
                        setIsPatrolling(false);
                        setDroneSpd(0);
                        setDroneAlt(12);
                        setDroneGPS({ lat: 13.08272, lon: 80.27071 });
                      }} 
                      className="btn btn-secondary" 
                      style={{ padding: "0.4rem 0.5rem", fontSize: "0.7rem", width: "100%" }}
                    >
                      Return to Home
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* FIXED CCTV CONTROLLER PANEL */
              <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flex: 1 }}>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-cyan)", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sliders size={14} /> CAMERA PTZ CONTROLS
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Digital Zoom */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Digital Zoom</span>
                      <span style={{ color: "#fff", fontWeight: "bold" }}>{(cctvZoom[activeCamId] || 1.0).toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="1.0" 
                      max="4.0" 
                      step="0.1"
                      value={cctvZoom[activeCamId] || 1.0} 
                      onChange={(e) => {
                        const zoomVal = parseFloat(e.target.value);
                        setCctvZoom(prev => ({ ...prev, [activeCamId]: zoomVal }));
                      }}
                      style={{ width: "100%", accentColor: "var(--accent-cyan)" }}
                    />
                  </div>

                  {/* D-Pad Simulation */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", margin: "0.5rem 0" }}>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>PAN / TILT (PTZ)</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 40px)", gridTemplateRows: "repeat(3, 40px)", gap: "4px" }}>
                      <div></div>
                      <button 
                        onClick={() => handleCameraPan(activeCamId, "up")} 
                        className="btn btn-secondary" 
                        style={{ padding: 0, borderRadius: "6px", width: "40px", height: "40px" }}
                      >
                        ▲
                      </button>
                      <div></div>
                      <button 
                        onClick={() => handleCameraPan(activeCamId, "left")} 
                        className="btn btn-secondary" 
                        style={{ padding: 0, borderRadius: "6px", width: "40px", height: "40px" }}
                      >
                        ◀
                      </button>
                      <button 
                        onClick={() => resetCamera(activeCamId)} 
                        className="btn btn-secondary" 
                        style={{ padding: 0, borderRadius: "6px", width: "40px", height: "40px", fontSize: "9px" }}
                      >
                        RST
                      </button>
                      <button 
                        onClick={() => handleCameraPan(activeCamId, "right")} 
                        className="btn btn-secondary" 
                        style={{ padding: 0, borderRadius: "6px", width: "40px", height: "40px" }}
                      >
                        ▶
                      </button>
                      <div></div>
                      <button 
                        onClick={() => handleCameraPan(activeCamId, "down")} 
                        className="btn btn-secondary" 
                        style={{ padding: 0, borderRadius: "6px", width: "40px", height: "40px" }}
                      >
                        ▼
                      </button>
                      <div></div>
                    </div>
                  </div>

                  {/* Offset values */}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                    <span>PAN: {(cctvPan[activeCamId]?.x || 0)}px</span>
                    <span>TILT: {(cctvPan[activeCamId]?.y || 0)}px</span>
                  </div>

                  {/* Preset Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Angle Presets</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                      <button 
                        onClick={() => setCctvPan(prev => ({ ...prev, [activeCamId]: { x: -15, y: 10 } }))} 
                        className="btn btn-secondary" 
                        style={{ padding: "0.3rem", fontSize: "0.7rem" }}
                      >
                        Angle Gate
                      </button>
                      <button 
                        onClick={() => setCctvPan(prev => ({ ...prev, [activeCamId]: { x: 15, y: -5 } }))} 
                        className="btn btn-secondary" 
                        style={{ padding: "0.3rem", fontSize: "0.7rem" }}
                      >
                        Angle Crane Base
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Bottom Row: Alerts ticker list & Quick Telemetry Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.5rem" }}>
        
        {/* Incident Alerts Box */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertTriangle className="text-red" size={16} />
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>AI INCIDENT DETECTS LOG</h3>
            </div>
            <span className="badge badge-red" style={{ fontSize: "9px" }}>
              {systemAlerts.filter(a => !a.resolved).length} ACTIVE INCIDENTS
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: "120px", overflowY: "auto", fontSize: "0.75rem" }}>
            {systemAlerts.map(alert => (
              <div 
                key={alert.id}
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  background: "rgba(24, 24, 27, 0.4)", 
                  padding: "0.5rem 0.75rem", 
                  borderRadius: "6px",
                  borderLeft: `3px solid ${alert.resolved ? "var(--accent-emerald)" : "var(--accent-red)"}`
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span className={alert.resolved ? "text-emerald" : "text-red"} style={{ fontWeight: "bold" }}>
                      {alert.cam}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: "9px" }}>{alert.time}</span>
                  </div>
                  <div style={{ color: "#fff" }}>{alert.msg}</div>
                </div>

                {!alert.resolved ? (
                  <button 
                    onClick={() => resolveAlert(alert.id)}
                    className="btn" 
                    style={{ 
                      padding: "0.25rem 0.5rem", 
                      fontSize: "0.7rem", 
                      background: "rgba(16, 185, 129, 0.1)", 
                      borderColor: "rgba(16, 185, 129, 0.4)",
                      color: "var(--accent-emerald)"
                    }}
                  >
                    Mark Resolved
                  </button>
                ) : (
                  <span style={{ color: "var(--accent-emerald)", display: "flex", alignItems: "center", gap: "3px", fontSize: "0.7rem", fontWeight: "bold" }}>
                    <CheckCircle2 size={12} /> Resolved
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Global Drone Fleet Summary Widget */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1.25rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>DRONE FLEET SUMMARY</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem", background: "rgba(0,0,0,0.25)", borderRadius: "6px" }}>
              <span style={{ fontWeight: "bold", color: "var(--accent-emerald)" }}>DRONE-01 (Active)</span>
              <span style={{ color: "var(--text-secondary)" }}>Patrol Sector D • Bat: {droneBattery}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem", background: "rgba(0,0,0,0.15)", borderRadius: "6px", opacity: 0.6 }}>
              <span style={{ fontWeight: "bold", color: "var(--text-muted)" }}>DRONE-02 (Charging)</span>
              <span>Pad 2 • Charge: 98%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem", background: "rgba(0,0,0,0.15)", borderRadius: "6px", opacity: 0.6 }}>
              <span style={{ fontWeight: "bold", color: "var(--text-muted)" }}>DRONE-03 (Offline)</span>
              <span>Maintenance - Cycle B</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
