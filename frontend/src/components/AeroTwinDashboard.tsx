"use client";

import React, { useState } from "react";
import { 
  Building, MapPin, Clock, Activity, Search, Bell, Maximize,
  Monitor, LayoutDashboard, Calendar, IndianRupee, Box, HardHat,
  ShieldAlert, Radio, FileText, Settings, Play, Pause, FastForward,
  Rewind, Video, BrainCircuit, LayoutTemplate, Truck, Smartphone, Calculator
} from "lucide-react";
import DigitalTwinViewer from "./DigitalTwinViewer";
import FeasibilityDashboard from "./FeasibilityDashboard";
import ReportsDashboard from "./ReportsDashboard";
import RegulatoryEngineWizard from "./RegulatoryEngineWizard";
import RuleEngineAdmin from "./RuleEngineAdmin";
import EquipmentRental from "./EquipmentRental";
import EquipmentAdmin from "./EquipmentAdmin";
import RentalMobileApp from "./RentalMobileApp";
import EquipmentDashboard from "./EquipmentDashboard";
import BOQDashboard from "./BOQDashboard";
import GISViewer from "./GISViewer";
import BIMViewer from "./BIMViewer";
import CCTVDashboard from "./CCTVDashboard";
import { useAeroTwinStore } from "../store/useAeroTwinStore";

export default function AeroTwinDashboard() {
  const { activeTab, setActiveTab } = useAeroTwinStore();

  return (
    <div className="aero-dashboard-container">
      {/* ── TOP HEADER ── */}
      <header className="aero-header">
        <div className="aero-logo">
          <div className="logo-icon">▲</div>
          <div>
            <h1>AERO-TWIN</h1>
            <p>DIGITAL TWIN PLATFORM</p>
          </div>
        </div>
        
        <div className="aero-header-stats">
          <div className="header-stat-box">
            <Building size={16} className="text-cyan" />
            <div>
              <p className="label">PROJECT</p>
              <p className="value">Metro Tower Phase 2</p>
            </div>
          </div>
          <div className="header-stat-box">
            <MapPin size={16} className="text-violet" />
            <div>
              <p className="label">LOCATION</p>
              <p className="value">New Delhi, India</p>
            </div>
          </div>
          <div className="header-stat-box">
            <Clock size={16} className="text-amber" />
            <div>
              <p className="label">TIME</p>
              <p className="value">12:45 PM<br/><span>20 May 2024</span></p>
            </div>
          </div>
          <div className="header-stat-box status-green">
            <Activity size={16} />
            <div>
              <p className="label">STATUS</p>
              <p className="value">On Schedule</p>
            </div>
          </div>
        </div>

        <div className="aero-header-actions">
          <button className="icon-btn"><Search size={18}/></button>
          <button className="icon-btn" style={{ position: "relative" }}>
            <Bell size={18}/>
            <span className="badge-dot">3</span>
          </button>
          <button className="icon-btn"><Radio size={18}/></button>
          <button className="icon-btn"><Maximize size={18}/></button>
        </div>
      </header>

      {/* ── MAIN LAYOUT GRID ── */}
      <div className="aero-layout">
        
        {/* LEFT SIDEBAR */}
        <aside className="aero-sidebar">
          <div className="sidebar-group">
            <h3>COMMAND CENTER</h3>
            <button className={`sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><Monitor size={16}/> LIVE OVERVIEW</button>
            <button className={`sidebar-btn ${activeTab === 'cctv' ? 'active' : ''}`} onClick={() => setActiveTab('cctv')}><Video size={16}/> CCTV & DRONE FEEDS</button>
            <button className={`sidebar-btn ${activeTab === 'feasibility' ? 'active' : ''}`} onClick={() => setActiveTab('feasibility')}><LayoutTemplate size={16}/> FEASIBILITY</button>
            <button className={`sidebar-btn ${activeTab === 'bim' ? 'active' : ''}`} onClick={() => setActiveTab('bim')}><Box size={16}/> TRUE BIM UPLOAD (.IFC)</button>
            <button className="sidebar-btn"><Building size={16}/> 3D TWIN</button>
            <button className={`sidebar-btn ${activeTab === 'gis' ? 'active' : ''}`} onClick={() => setActiveTab('gis')}><MapPin size={16}/> SITE MAP</button>
            <button className="sidebar-btn"><FileText size={16}/> REPORTS</button>
            <button className={`sidebar-btn ${activeTab === 'boq' ? 'active' : ''}`} onClick={() => setActiveTab('boq')}><Calculator size={16}/> BOQ & COST ESTIMATE</button>
            <button className="sidebar-btn"><Calendar size={16}/> SCHEDULE</button>
            <button className="sidebar-btn"><IndianRupee size={16}/> COST ANALYTICS</button>
            <button className="sidebar-btn"><Box size={16}/> MATERIALS</button>
            <button className={`sidebar-btn ${activeTab === 'equipment' ? 'active' : ''}`} onClick={() => setActiveTab('equipment')}><HardHat size={16}/> RENTAL MARKETPLACE</button>
            <button className={`sidebar-btn ${activeTab === 'equipment_twin' ? 'active' : ''}`} onClick={() => setActiveTab('equipment_twin')}><Truck size={16}/> EQUIPMENT TWIN</button>
            <button className={`sidebar-btn ${activeTab === 'mobile_app' ? 'active' : ''}`} onClick={() => setActiveTab('mobile_app')}><Smartphone size={16}/> MOBILE APP</button>
            <button className={`sidebar-btn ${activeTab === 'equipment_admin' ? 'active' : ''}`} onClick={() => setActiveTab('equipment_admin')}><Truck size={16}/> EQUIPMENT ADMIN</button>
            <button className="sidebar-btn"><Activity size={16}/> WORKFORCE</button>
            <button className="sidebar-btn"><ShieldAlert size={16}/> SAFETY</button>
            <button className="sidebar-btn"><Radio size={16}/> SENSORS</button>
            <button className={`sidebar-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}><FileText size={16}/> REPORTS</button>
            <button className="sidebar-btn"><BrainCircuit size={16}/> AI ASSISTANT</button>
            <button className={`sidebar-btn ${activeTab === 'regulatory_wizard' ? 'active' : ''}`} onClick={() => setActiveTab('regulatory_wizard')}><ShieldAlert size={16}/> REGULATORY ENGINE</button>
            <button className={`sidebar-btn ${activeTab === 'rule_admin' ? 'active' : ''}`} onClick={() => setActiveTab('rule_admin')}><Settings size={16}/> RULE ADMIN</button>
            <button className="sidebar-btn"><Settings size={16}/> SETTINGS</button>
          </div>

          <div className="sidebar-user">
            <img src="https://i.pravatar.cc/100?img=11" alt="User" />
            <div>
              <p className="name">John Doe</p>
              <p className="role">Project Admin</p>
              <p className="status"><span className="dot"></span> Online</p>
            </div>
          </div>
        </aside>

        {/* CENTER CONTENT */}
        <main className="aero-main" style={(activeTab === 'feasibility' || activeTab === 'cctv' || activeTab === 'reports' || activeTab === 'regulatory_wizard' || activeTab === 'rule_admin' || activeTab === 'equipment' || activeTab === 'equipment_admin' || activeTab === 'mobile_app') ? { gridColumn: "span 2", maxWidth: "none" } : undefined}>
          
          {activeTab === 'overview' ? (
            <>
          {/* DIGITAL TWIN 3D VIEW */}
          <div className="aero-twin-view">
            <div className="twin-badge">LIVE DIGITAL TWIN</div>
            
            {/* The 3D Component */}
            <div className="twin-canvas-container">
               <DigitalTwinViewer progress={62} flightPathPoints={[]} />
            </div>

            {/* Circular HUD Overlays */}
            <div className="hud-dial progress-dial">
              <svg><circle cx="35" cy="35" r="30"></circle><circle cx="35" cy="35" r="30" className="fill-cyan" strokeDasharray="188" strokeDashoffset="71"></circle></svg>
              <div className="dial-content">
                <h2>62%</h2>
                <p>Complete</p>
              </div>
              <span className="dial-label">PROGRESS</span>
            </div>

            <div className="hud-dial cost-dial">
              <div className="dial-content">
                <IndianRupee size={16}/>
                <h2>3.75 <span>Cr</span></h2>
                <p>Spent</p>
              </div>
              <span className="dial-label">COST</span>
            </div>

            <div className="hud-dial materials-dial">
              <svg><circle cx="35" cy="35" r="30"></circle><circle cx="35" cy="35" r="30" className="fill-yellow" strokeDasharray="188" strokeDashoffset="41"></circle></svg>
              <div className="dial-content">
                <h2>78%</h2>
                <p>On Track</p>
              </div>
              <span className="dial-label">MATERIALS</span>
            </div>

            <div className="hud-dial workers-dial">
              <div className="dial-content">
                <HardHat size={20}/>
                <h2>128</h2>
                <p>On Site</p>
              </div>
              <span className="dial-label">WORKERS</span>
            </div>

            <div className="hud-dial equipment-dial">
              <div className="dial-content">
                <Box size={20}/>
                <h2>24</h2>
                <p>Active</p>
              </div>
              <span className="dial-label">EQUIPMENT</span>
            </div>

            <div className="hud-dial safety-dial">
              <div className="dial-content">
                <ShieldAlert size={20} className="text-emerald"/>
                <h2>98%</h2>
                <p>Compliance</p>
              </div>
              <span className="dial-label">SAFETY</span>
            </div>

          </div>

          {/* TIMELINE */}
          <div className="aero-timeline">
            <h3>CONSTRUCTION TIMELINE</h3>
            <div className="timeline-nodes">
              {['Foundation', 'Columns', 'Slab', 'Walls', 'Roof', 'Interior', 'Finishing'].map((step, i) => (
                <div key={step} className={`timeline-node ${i < 2 ? 'completed' : i === 2 ? 'active' : ''}`}>
                  <div className="node-icon"><Building size={14}/></div>
                  <p className="node-name">{step}</p>
                  <p className="node-pct">{i < 2 ? '100%' : i === 2 ? '100%' : i === 3 ? '60%' : i === 4 ? '30%' : '0%'}</p>
                  <p className="node-date">10 {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Aug'][i]} '24</p>
                </div>
              ))}
              <div className="timeline-line"></div>
            </div>
            <div className="timeline-controls">
              <button><Rewind size={14}/></button>
              <button><Play size={14}/></button>
              <button><FastForward size={14}/></button>
              <select><option>Speed 1x</option></select>
            </div>
          </div>

          {/* SENSORS */}
          <div className="aero-sensors">
            <div className="sensor-badge">LIVE SENSOR FEED</div>
            <div className="sensor-grid">
              {/* Fake charts for sensors */}
              <div className="sensor-card">
                <p><span className="text-amber">🌡️</span> Temperature</p>
                <h2>32°C</h2>
                <svg className="sparkline"><path d="M0 20 Q 10 10, 20 15 T 40 5 T 60 10 T 80 0" stroke="var(--amber)" fill="none"/></svg>
              </div>
              <div className="sensor-card">
                <p><span className="text-violet">💧</span> Humidity</p>
                <h2>45%</h2>
                <svg className="sparkline"><path d="M0 10 Q 10 20, 20 15 T 40 5 T 60 25 T 80 10" stroke="var(--violet)" fill="none"/></svg>
              </div>
              <div className="sensor-card">
                <p><span className="text-cyan">🔊</span> Noise Level</p>
                <h2>68 dB</h2>
                <svg className="sparkline"><path d="M0 5 Q 10 0, 20 15 T 40 25 T 60 10 T 80 20" stroke="var(--cyan)" fill="none"/></svg>
              </div>
              <div className="sensor-card">
                <p><span className="text-yellow">⚠️</span> Vibration</p>
                <h2>0.8 mm/s</h2>
                <svg className="sparkline"><path d="M0 20 Q 10 15, 20 25 T 40 10 T 60 5 T 80 15" stroke="var(--yellow)" fill="none"/></svg>
              </div>
              <div className="sensor-card">
                <p><span className="text-emerald">🍃</span> Air Quality</p>
                <h2>32 AQI</h2>
                <svg className="sparkline"><path d="M0 15 Q 10 10, 20 5 T 40 15 T 60 20 T 80 10" stroke="var(--emerald)" fill="none"/></svg>
              </div>
              <div className="sensor-card">
                <p><span className="text-red">⚡</span> Power Usage</p>
                <h2>140 kW</h2>
                <svg className="sparkline"><path d="M0 10 Q 10 25, 20 15 T 40 5 T 60 10 T 80 5" stroke="var(--red)" fill="none"/></svg>
              </div>
              <div className="sensor-card">
                <p><span className="text-blue">🌊</span> Water Usage</p>
                <h2>18 kL</h2>
                <svg className="sparkline"><path d="M0 5 Q 10 10, 20 20 T 40 15 T 60 5 T 80 15" stroke="var(--blue)" fill="none"/></svg>
              </div>
            </div>
            
            <div className="ai-assistant-btn">
              <div className="robot-icon">🤖</div>
              <p>AI ASSISTANT</p>
            </div>
          </div>

            </>
          ) : activeTab === 'cctv' ? (
            <div style={{ height: "100%", padding: 0 }}>
              <CCTVDashboard />
            </div>
          ) : activeTab === 'feasibility' ? (
            <div style={{ height: "100%", overflowY: "auto", padding: "1rem" }}>
              <FeasibilityDashboard userId={1} />
            </div>
          ) : activeTab === 'regulatory_wizard' ? (
            <div style={{ height: "100%", overflowY: "auto", padding: "1rem" }}>
              <RegulatoryEngineWizard />
            </div>
          ) : activeTab === 'rule_admin' ? (
            <div style={{ height: "100%", overflowY: "auto", padding: "1rem" }}>
              <RuleEngineAdmin />
            </div>
          ) : activeTab === 'gis' ? (
            <div style={{ height: "100%", padding: "1rem" }}>
              <GISViewer />
            </div>
          ) : activeTab === 'bim' ? (
            <div style={{ height: "100%", padding: "1rem" }}>
              <BIMViewer url="" />
            </div>
          ) : activeTab === 'reports' ? (
            <div style={{ height: "100%", overflowY: "auto", padding: "1rem" }}>
              <ReportsDashboard />
            </div>
          ) : activeTab === 'boq' ? (
            <div style={{ height: "100%", overflowY: "auto", padding: 0 }}>
              <BOQDashboard />
            </div>
          ) : activeTab === 'equipment' ? (
            <div style={{ height: "100%", overflowY: "auto", padding: "1rem" }}>
              <EquipmentRental />
            </div>
          ) : activeTab === 'equipment_twin' ? (
            <div style={{ height: "100%", overflowY: "auto", padding: 0 }}>
              <EquipmentDashboard />
            </div>
          ) : activeTab === 'mobile_app' ? (
            <div style={{ height: "100%", overflowY: "auto", padding: 0 }}>
              <RentalMobileApp />
            </div>
          ) : activeTab === 'equipment_admin' ? (
            <div style={{ height: "100%", overflowY: "auto", padding: "1rem" }}>
              <EquipmentAdmin />
            </div>
          ) : null}
        </main>

        {/* RIGHT SIDEBAR */}
        {activeTab === 'overview' && (
        <aside className="aero-right-sidebar">
          
          <div className="right-panel">
            <h3>SITE OVERVIEW</h3>
            <div className="map-view">
               <img src="https://images.unsplash.com/photo-1541888086925-920a0b8196f3?auto=format&fit=crop&q=80&w=600" alt="Site Map" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--border)'}} />
            </div>
            <div className="map-legend">
              <span><span className="dot bg-blue"></span> Building</span>
              <span><span className="dot bg-amber"></span> Crane</span>
              <span><span className="dot bg-violet"></span> Material Yard</span>
              <span><span className="dot bg-emerald"></span> Office</span>
              <span><span className="dot bg-yellow"></span> Parking</span>
              <span><span className="dot bg-red"></span> Equipment</span>
            </div>
          </div>

          <div className="right-panel">
            <h3 className="ai-glow">🤖 AI INSIGHTS</h3>
            
            <div className="insight-card border-amber">
              <div className="insight-icon bg-amber">📉</div>
              <div>
                <h4>Delay Prediction</h4>
                <p>Concrete delivery may be delayed by 2 days due to heavy rainfall.</p>
              </div>
            </div>

            <div className="insight-card border-emerald">
              <div className="insight-icon bg-emerald">💰</div>
              <div>
                <h4>Cost Optimization</h4>
                <p>Switching to Supplier B for steel can save ₹ 4.6 Lakhs.</p>
              </div>
            </div>

            <div className="insight-card border-red">
              <div className="insight-icon bg-red">⚠️</div>
              <div>
                <h4>Safety Alert</h4>
                <p>High risk of fall detected on Floor 6. Take immediate action.</p>
              </div>
            </div>

            <button className="ask-ai-btn">Ask AI Assistant →</button>
          </div>

          <div className="right-panel">
            <div className="feed-header">
              <h3>LIVE CAMERA FEED</h3>
              <a href="#">See All</a>
            </div>
            <div className="camera-feed">
               <img src="https://images.unsplash.com/photo-1541888086925-920a0b8196f3?auto=format&fit=crop&q=80&w=600" alt="Live Feed" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--border)'}} />
               <div className="play-overlay"><Play size={24}/></div>
            </div>
            <div className="feed-dots"><span></span><span className="active"></span><span></span></div>
          </div>

        </aside>
        )}

      </div>
    </div>
  );
}
