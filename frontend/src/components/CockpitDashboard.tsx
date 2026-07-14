"use client";
import React, { useState, useEffect } from "react";
import { 
  CheckCircle, ShieldAlert, Clock, Layers, Filter, Eye, Camera, AlertTriangle, 
  Settings, Play, Map, BarChart2, Zap, CloudLightning, Activity, Focus, Pause,
  Navigation, Maximize2, PlayCircle
} from "lucide-react";
import DigitalTwinViewer from "./DigitalTwinViewer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function CockpitDashboard({ flightCoords = [], onRequestViewAll }: { flightCoords?: any[], onRequestViewAll?: () => void }) {
  const [sliderProgress, setSliderProgress] = useState(56);
  const [activeLayers, setActiveLayers] = useState({
    foundation: true, columns: true, beams: true, slabs: true,
    mep: false, equipment: true, workers: true, cameras: true
  });
  
  // UI Toggle States
  const [showLayersPanel, setShowLayersPanel] = useState(true);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [resetCameraTrigger, setResetCameraTrigger] = useState(0);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [isDroneModalOpen, setIsDroneModalOpen] = useState(false);
  
  const chartData = [
    { day: "Mon", planned: 10, actual: 12 },
    { day: "Tue", planned: 25, actual: 23 },
    { day: "Wed", planned: 40, actual: 38 },
    { day: "Thu", planned: 55, actual: 56 },
    { day: "Fri", planned: 60, actual: 50 },
    { day: "Sat", planned: 70, actual: 65 },
    { day: "Sun", planned: 80, actual: 75 }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", height: "calc(100vh - 120px)", overflow: "hidden" }}>
      
      {/* Global Top KPIs */}
      <div style={{ display: "flex", gap: "1rem" }}>
         <div className="panel" style={{ flex: 1, padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid var(--green)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
               <CheckCircle className="text-green" size={24} />
               <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Project Health</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--green)" }}>92%</div>
               </div>
            </div>
         </div>
         <div className="panel" style={{ flex: 1, padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid var(--primary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
               <ShieldAlert className="text-primary" size={24} />
               <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Safety Score</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>95<span style={{ fontSize:"1rem", color:"var(--text-muted)"}}>/100</span></div>
               </div>
            </div>
         </div>
         <div className="panel" style={{ flex: 1, padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid var(--orange)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
               <Clock className="text-orange" size={24} />
               <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Progress</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--orange)" }}>{sliderProgress}%</div>
               </div>
            </div>
         </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: "1.5rem", flex: 1, minHeight: 0 }}>
        
        {/* CENTER PANE: 3D Twin & Overlays */}
        <div className="panel" style={{ position: "relative", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          
          {/* Top Controls inside 3D View */}
          <div style={{ position: "absolute", top: "1rem", left: "1rem", right: "1rem", zIndex: 10, display: "flex", justifyContent: "space-between", pointerEvents: "none" }}>
             <div style={{ display: "flex", gap: "0.5rem", pointerEvents: "auto" }}>
                <select className="form-input" style={{ padding: "0.5rem", fontSize: "0.85rem", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
                  <option>Default View</option>
                  <option>Top Down</option>
                  <option>Wireframe</option>
                </select>
                <button onClick={() => setResetCameraTrigger(t => t + 1)} className="btn btn-secondary" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} title="Reset Camera"><Focus size={16}/></button>
             </div>
             
             <div style={{ display: "flex", gap: "0.5rem", pointerEvents: "auto" }}>
               <button 
                 onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                 className={`btn ${showFiltersPanel ? "btn-primary" : "btn-secondary"}`} 
                 style={{ background: showFiltersPanel ? "var(--primary)" : "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                 <Filter size={14}/> Filters
               </button>
               <button 
                 onClick={() => setShowLayersPanel(!showLayersPanel)}
                 className={`btn ${showLayersPanel ? "btn-primary" : "btn-secondary"}`} 
                 style={{ background: showLayersPanel ? "var(--primary)" : "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                 <Layers size={14}/> Layers
               </button>
               <button 
                 onClick={() => setIsLiveMode(!isLiveMode)}
                 className={`btn ${isLiveMode ? "btn-primary" : "btn-secondary"}`} 
                 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                 <Activity size={14}/> {isLiveMode ? "Live" : "Paused"}
               </button>
             </div>
          </div>

          {/* Left Layers Panel Overlay */}
          {showLayersPanel && (
            <div style={{ position: "absolute", top: "4rem", left: "1rem", width: "220px", background: "rgba(9, 9, 11, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", zIndex: 10, padding: "1rem", pointerEvents: "auto" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h4 style={{ margin: 0, fontSize: "0.9rem" }}>Layers</h4>
                  <button onClick={() => setShowLayersPanel(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>✕</button>
               </div>
               <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: activeLayers.foundation ? "#fff" : "var(--text-muted)" }}>
                     <input type="checkbox" checked={activeLayers.foundation} onChange={(e) => setActiveLayers(s => ({...s, foundation: e.target.checked}))} style={{ accentColor: "var(--cyan)" }} /> Foundation
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: activeLayers.columns ? "#fff" : "var(--text-muted)" }}>
                     <input type="checkbox" checked={activeLayers.columns} onChange={(e) => setActiveLayers(s => ({...s, columns: e.target.checked}))} style={{ accentColor: "var(--cyan)" }} /> Columns
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: activeLayers.beams ? "#fff" : "var(--text-muted)" }}>
                     <input type="checkbox" checked={activeLayers.beams} onChange={(e) => setActiveLayers(s => ({...s, beams: e.target.checked}))} style={{ accentColor: "var(--cyan)" }} /> Beams & Slabs
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: activeLayers.mep ? "#fff" : "var(--text-muted)" }}>
                     <input type="checkbox" checked={activeLayers.mep} onChange={(e) => setActiveLayers(s => ({...s, mep: e.target.checked}))} style={{ accentColor: "var(--cyan)" }} /> MEP (Pipes/HVAC)
                  </label>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", margin: "0.5rem 0" }}></div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: activeLayers.workers ? "#fff" : "var(--text-muted)" }}>
                     <input type="checkbox" checked={activeLayers.workers} onChange={(e) => setActiveLayers(s => ({...s, workers: e.target.checked}))} style={{ accentColor: "var(--primary)" }} /> Workers (Live)
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: activeLayers.cameras ? "#fff" : "var(--text-muted)" }}>
                     <input type="checkbox" checked={activeLayers.cameras} onChange={(e) => setActiveLayers(s => ({...s, cameras: e.target.checked}))} style={{ accentColor: "var(--primary)" }} /> Cameras (CCTV)
                  </label>
               </div>
               <button className="btn btn-secondary" style={{ width: "100%", marginTop: "1rem", fontSize: "0.8rem", padding: "0.4rem" }}>+ Add Layer</button>
            </div>
          )}

          {/* Left Filters Panel Overlay */}
          {showFiltersPanel && (
            <div style={{ position: "absolute", top: "4rem", left: showLayersPanel ? "16rem" : "1rem", width: "240px", background: "rgba(9, 9, 11, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", zIndex: 10, padding: "1rem", pointerEvents: "auto", transition: "left 0.3s" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h4 style={{ margin: 0, fontSize: "0.9rem" }}>Active Filters</h4>
                  <button onClick={() => setShowFiltersPanel(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>✕</button>
               </div>
               
               <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem" }}>
                  <div>
                    <label style={{ display: "block", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Sub-Contractor</label>
                    <select className="form-input" style={{ width: "100%", padding: "0.4rem" }}>
                       <option>All Contractors</option>
                       <option>Apex Steel Works</option>
                       <option>Volt Electrical</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Status</label>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                       <span className="badge badge-success" style={{ cursor: "pointer" }}>Active</span>
                       <span className="badge badge-warning" style={{ cursor: "pointer", opacity: 0.5 }}>Idle</span>
                       <span className="badge badge-error" style={{ cursor: "pointer", opacity: 0.5 }}>Maintenance</span>
                    </div>
                  </div>
               </div>
               <button className="btn btn-secondary" style={{ width: "100%", marginTop: "1rem", fontSize: "0.8rem", padding: "0.4rem" }}>Reset Filters</button>
            </div>
          )}

          {/* Right Telemetry Overlay */}
          {isLiveMode && (
          <div style={{ position: "absolute", top: "12rem", right: "4rem", width: "200px", background: "rgba(9, 9, 11, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", zIndex: 10, padding: "1rem", pointerEvents: "auto" }}>
             <h4 style={{ margin: "0 0 1rem 0", fontSize: "0.9rem" }}>Live Telemetry</h4>
             <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
               {[
                 { label: "Workers", val: 124, color: "var(--cyan)" },
                 { label: "Cranes", val: 2, color: "var(--primary)" },
                 { label: "Drones", val: 3, color: "var(--orange)" },
                 { label: "Trucks", val: 7, color: "var(--green)" },
                 { label: "Equipment", val: 11, color: "var(--text-muted)" },
                 { label: "Sensors", val: 58, color: "var(--green)" },
               ].map((item, i) => (
                 <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                       <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: item.color }} />
                       {item.label}
                    </div>
                    <span style={{ fontWeight: 600 }}>{item.val}</span>
                 </div>
               ))}
             </div>
             <a href="#" style={{ display: "block", color: "var(--cyan)", fontSize: "0.8rem", marginTop: "1rem", textDecoration: "none" }}>View All →</a>
          </div>
          )}

          {/* 3D Canvas */}
          <div style={{ flex: 1, width: "100%", position: "relative" }}>
             <DigitalTwinViewer progress={sliderProgress} flightPathPoints={flightCoords} activeLayers={activeLayers} isLiveMode={isLiveMode} resetCameraTrigger={resetCameraTrigger} onSelectCamera={(id) => setSelectedCamera(id)} />
          </div>

          {/* Bottom Timeline Scrubber */}
          <div style={{ position: "absolute", bottom: "1rem", left: "1rem", right: "24rem", background: "rgba(9, 9, 11, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", zIndex: 10, padding: "0.5rem 1rem", pointerEvents: "auto", display: "flex", alignItems: "center", gap: "1rem" }}>
             <button className="btn btn-secondary" style={{ padding: "0.5rem", borderRadius: "50%" }}>
                {isLiveMode ? <Pause size={16} /> : <Play size={16} />}
             </button>
             <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                   <span>May 24</span><span>May 25</span><span>May 26</span><span>May 27</span><span>May 28</span><span>May 29</span><span>May 30</span><span>May 31</span>
                </div>
                <input type="range" min="0" max="100" value={sliderProgress} onChange={(e) => setSliderProgress(parseInt(e.target.value))} style={{ accentColor: "var(--primary)" }} />
             </div>
             <select className="form-input" style={{ width: "auto", padding: "0.25rem", fontSize: "0.75rem" }}>
                <option>1x</option><option>2x</option><option>4x</option>
             </select>
          </div>
          
          {/* DRONE CONTROL MODAL */}
          {isDroneModalOpen && (
             <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="glass-panel" style={{ width: "90%", maxWidth: "900px", height: "80vh", display: "flex", flexDirection: "column", border: "1px solid var(--cyan)", boxShadow: "0 0 40px rgba(6, 182, 212, 0.2)" }}>
                   <div style={{ padding: "1rem", borderBottom: "1px solid rgba(6, 182, 212, 0.3)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(6, 182, 212, 0.1)" }}>
                      <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--cyan)" }}><Navigation size={20} /> Drone Control Station (DJI Matrice 300 RTK)</h3>
                      <button onClick={() => setIsDroneModalOpen(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
                   </div>
                   
                   <div style={{ flex: 1, display: "flex", background: "#000", position: "relative", overflow: "hidden" }}>
                      {/* Simulated Video Feed */}
                      <img src="https://images.unsplash.com/photo-1541888087515-09f029019688?w=1200&q=80" alt="Drone Live" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                      
                      {/* Telemetry HUD Overlay */}
                      <div style={{ position: "absolute", top: "1rem", left: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                         <div style={{ background: "rgba(0,0,0,0.5)", padding: "0.5rem", border: "1px solid #4ade80", color: "#4ade80", fontFamily: "monospace", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><div className="animate-ping h-2 w-2 rounded-full bg-green-500"></div> LIVE FEED</div>
                         <div style={{ background: "rgba(0,0,0,0.5)", padding: "0.5rem", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontFamily: "monospace", fontSize: "0.85rem" }}>ALT: 142.5m</div>
                         <div style={{ background: "rgba(0,0,0,0.5)", padding: "0.5rem", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontFamily: "monospace", fontSize: "0.85rem" }}>SPD: 4.2 m/s</div>
                      </div>
                      
                      <div style={{ position: "absolute", top: "1rem", right: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                         <div style={{ background: "rgba(0,0,0,0.5)", padding: "0.5rem", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontFamily: "monospace", fontSize: "0.85rem", display: "flex", gap: "0.5rem" }}>BATTERY: <span style={{ color: "#4ade80" }}>78%</span></div>
                         <div style={{ background: "rgba(0,0,0,0.5)", padding: "0.5rem", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontFamily: "monospace", fontSize: "0.85rem" }}>GPS: 12 SATS</div>
                      </div>

                      {/* Crosshair */}
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                         <div style={{ width: "40px", height: "40px", border: "2px solid rgba(255,255,255,0.5)", borderRadius: "50%", position: "relative" }}>
                            <div style={{ position: "absolute", top: "50%", left: "-10px", right: "-10px", height: "1px", background: "rgba(255,255,255,0.5)" }}></div>
                            <div style={{ position: "absolute", left: "50%", top: "-10px", bottom: "-10px", width: "1px", background: "rgba(255,255,255,0.5)" }}></div>
                         </div>
                      </div>
                   </div>
                   
                   {/* Bottom Controls */}
                   <div style={{ padding: "1rem", background: "rgba(9, 9, 11, 0.9)", display: "flex", gap: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                      <button className="btn btn-primary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}><Map size={16}/> Start Orthomosaic Scan</button>
                      <button className="btn btn-secondary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}><Camera size={16}/> Capture Thermal Image</button>
                      <button className="btn btn-secondary" style={{ flex: 1, background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", color: "#ef4444" }}>Return to Base (RTH)</button>
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* RIGHT PANE: AI & Analytics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", paddingRight: "0.5rem" }}>
           
           {/* AI Vision & Detection Grid */}
           <div className="panel" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                 <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}><Camera size={16} className="text-primary"/> AI Vision & Detection</h4>
                 <button onClick={(e) => { e.preventDefault(); onRequestViewAll?.(); }} style={{ color: "var(--text-muted)", fontSize: "0.75rem", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0 }}>View All &gt;</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                 <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>PPE Compliance</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>98%</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--green)" }}>↑ Compliant</div>
                 </div>
                 <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Safety Zone</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--red)" }}>1</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--red)" }}>↓ Violation</div>
                 </div>
                 <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Fall Detection</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--green)" }}>0</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--green)" }}>No Alerts</div>
                 </div>
                 <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Equipment Detect</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>11</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--green)" }}>Active</div>
                 </div>
              </div>
           </div>

           {/* Drone Feed Mini Player (Hijackable by CCTV) */}
           <div className="panel" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                 <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
                    <Map size={16} className="text-cyan"/> 
                    {selectedCamera ? `${selectedCamera} Feed` : "Drone Feed"}
                 </h4>
                 <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--green)" }}>
                    <div className="animate-ping h-2 w-2 rounded-full bg-green-500"></div> Live
                 </div>
              </div>
              <div 
                style={{ height: "120px", background: "#000", borderRadius: "8px", overflow: "hidden", position: "relative", cursor: "pointer", border: "1px solid transparent", transition: "border 0.2s" }}
                onClick={() => !selectedCamera && setIsDroneModalOpen(true)}
                onMouseOver={(e) => e.currentTarget.style.border = "1px solid var(--cyan)"}
                onMouseOut={(e) => e.currentTarget.style.border = "1px solid transparent"}
              >
                 {selectedCamera ? (
                    <img src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=500&q=80" alt="CCTV Feed" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                 ) : (
                    <img src="https://images.unsplash.com/photo-1541888087515-09f029019688?w=500&q=80" alt="Drone feed" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
                 )}
                 <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)" }}>
                   {selectedCamera ? <PlayCircle size={32} style={{ opacity: 0.8 }} /> : <Maximize2 size={32} style={{ opacity: 0.8, color: "var(--cyan)" }} />}
                 </div>
                 {selectedCamera && (
                    <button onClick={(e) => { e.stopPropagation(); setSelectedCamera(null); }} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.7)", border: "none", color: "white", padding: "2px 6px", fontSize: "10px", borderRadius: "4px", cursor: "pointer" }}>✕</button>
                 )}
                 {!selectedCamera && (
                    <div style={{ position: "absolute", bottom: "4px", left: "4px", fontSize: "0.6rem", background: "rgba(0,0,0,0.6)", padding: "2px 4px", borderRadius: "2px" }}>Click to open control station</div>
                 )}
              </div>
           </div>

           {/* Recent Alerts */}
           <div className="panel" style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                 <h4 style={{ margin: 0 }}>Recent Alerts</h4>
                 <a href="#" style={{ fontSize: "0.8rem", color: "var(--cyan)" }}>View All</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto" }}>
                 {[
                   { msg: "Safety Zone Violation", desc: "Tower Crane 1 - Zone A", time: "2 min ago", type: "error" },
                   { msg: "PPE Non-Compliance", desc: "Worker ID: WKL-1245", time: "5 min ago", type: "warning" },
                   { msg: "Equipment Maintenance", desc: "Excavator EX-204 Due", time: "1 hour ago", type: "info" }
                 ].map((a, i) => (
                   <div key={i} style={{ display: "flex", gap: "0.75rem", paddingBottom: "0.75rem", borderBottom: i !== 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      <AlertTriangle size={16} color={a.type === "error" ? "var(--red)" : a.type === "warning" ? "var(--orange)" : "var(--cyan)"} style={{ marginTop: "2px" }} />
                      <div>
                         <div style={{ fontSize: "0.85rem", fontWeight: 600, color: a.type === "error" ? "var(--red)" : a.type === "warning" ? "var(--orange)" : "var(--cyan)" }}>{a.msg}</div>
                         <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{a.desc}</div>
                         <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "2px" }}>{a.time}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Progress Analytics Chart */}
           <div className="panel" style={{ padding: "1rem", height: "200px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                 <h4 style={{ margin: 0 }}>Progress Analytics</h4>
                 <select className="form-input" style={{ padding: "0.1rem", fontSize: "0.7rem" }}>
                   <option>This Week</option>
                 </select>
              </div>
              <div style={{ width: "100%", height: "130px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                    <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="planned" stroke="rgba(6,182,212,0.5)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>

        </div>
      </div>

      {/* Bottom Statistics Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "1rem", background: "rgba(24, 24, 27, 0.8)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "1rem" }}>
         <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Total Workers</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>124 <span style={{ fontSize:"0.75rem", color:"var(--green)", fontWeight:"normal"}}>+12 today</span></div>
         </div>
         <div style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "1rem" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Equipment Active</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>11 <span style={{ fontSize:"0.75rem", color:"var(--cyan)", fontWeight:"normal"}}>87% util</span></div>
         </div>
         <div style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "1rem" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Safety Incidents</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>0 <span style={{ fontSize:"0.75rem", color:"var(--orange)", fontWeight:"normal"}}>Last 24h</span></div>
         </div>
         <div style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "1rem" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Materials On-Site</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>86% <span style={{ fontSize:"0.75rem", color:"var(--green)", fontWeight:"normal"}}>On schedule</span></div>
         </div>
         <div style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "1rem" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Work Progress</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>56% <span style={{ fontSize:"0.75rem", color:"var(--cyan)", fontWeight:"normal"}}>+5% this week</span></div>
         </div>
         <div style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <CloudLightning className="text-cyan" size={24} />
            <div>
               <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Weather</div>
               <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>28°C</div>
            </div>
         </div>
      </div>
    </div>
  );
}
