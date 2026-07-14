"use client";

import React, { useState } from "react";
import { Building2, Layers, Map, Drone, Box, Bell, Compass, Layout } from "lucide-react";
import Feasibility3DViewer from "../../components/Feasibility3DViewer";
import Link from "next/link";

export default function ClientPortal() {
  const [activeTab, setActiveTab] = useState("3d-model");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090b", color: "#f8fafc", display: "flex", flexDirection: "column", fontFamily: "var(--font-geist-sans)" }}>
      
      {/* Topbar */}
      <header style={{ 
        height: "70px", borderBottom: "1px solid rgba(255,255,255,0.1)", 
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2rem",
        background: "rgba(9,9,11,0.8)", backdropFilter: "blur(10px)", zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Building2 className="text-cyan" size={24} />
          <span style={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "1px" }}>AERO-TWIN <span style={{ fontWeight: 400, color: "#94a3b8" }}>| Client Portal</span></span>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
              <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Center Plaza Extension (Live)</span>
           </div>
           
           <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
             <button style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}><Bell size={20} /></button>
             <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingLeft: "1rem", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
               <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent-purple)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                 JD
               </div>
               <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>John Doe (Investor)</span>
             </div>
           </div>
        </div>
      </header>

      {/* Main Layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* Sidebar */}
        <aside style={{ width: "250px", borderRight: "1px solid rgba(255,255,255,0.1)", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", padding: "0.5rem", marginBottom: "0.5rem", letterSpacing: "1px" }}>
            Project Views
          </div>
          
          <button onClick={() => setActiveTab("3d-model")} style={{ 
            display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", 
            background: activeTab === "3d-model" ? "rgba(6,182,212,0.1)" : "transparent",
            color: activeTab === "3d-model" ? "var(--cyan)" : "#cbd5e1",
            fontWeight: activeTab === "3d-model" ? 600 : 500,
            transition: "all 0.2s", textAlign: "left"
          }}>
            <Box size={18} /> 3D Digital Twin
          </button>
          
          <button onClick={() => setActiveTab("progress")} style={{ 
            display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", 
            background: activeTab === "progress" ? "rgba(6,182,212,0.1)" : "transparent",
            color: activeTab === "progress" ? "var(--cyan)" : "#cbd5e1",
            fontWeight: activeTab === "progress" ? 600 : 500,
            transition: "all 0.2s", textAlign: "left"
          }}>
            <Layout size={18} /> Timeline & Progress
          </button>

          <button onClick={() => setActiveTab("feasibility")} style={{ 
            display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", 
            background: activeTab === "feasibility" ? "rgba(6,182,212,0.1)" : "transparent",
            color: activeTab === "feasibility" ? "var(--cyan)" : "#cbd5e1",
            fontWeight: activeTab === "feasibility" ? 600 : 500,
            transition: "all 0.2s", textAlign: "left"
          }}>
            <Map size={18} /> Feasibility Report
          </button>
          
          <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
             <Link href="/landing" style={{ textDecoration: "none" }}>
                <button style={{ 
                  display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", 
                  background: "transparent", color: "#64748b", fontWeight: 500, width: "100%", textAlign: "left"
                }}>
                  ← Back to Home
                </button>
             </Link>
          </div>
        </aside>

        {/* Content Area */}
        <main style={{ flex: 1, padding: "2rem", overflowY: "auto", position: "relative" }}>
          
          {activeTab === "3d-model" && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>Interactive 3D Digital Twin</h1>
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Explore the real-time architectural model of your property.</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                   <button className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Compass size={16}/> Reset Camera</button>
                </div>
              </div>
              
              <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", overflow: "hidden", background: "#18181b", position: "relative" }}>
                 <Feasibility3DViewer formData={{
                    land_length: 40, land_width: 30, num_floors: 3, building_type: "Commercial",
                    road_width: 15, style_selection: "Modern", material_preference: "Glass", soil_type: "flat"
                 }} viewMode="architectural" />
              </div>
            </div>
          )}
          
          {activeTab === "progress" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>Project Progress</h1>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Executive summary of schedule and cost.</p>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                 <div className="panel" style={{ padding: "1.5rem" }}>
                    <h3 style={{ marginBottom: "1rem", color: "var(--cyan)" }}>Schedule</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                       <span>Overall Completion</span>
                       <span style={{ fontWeight: "bold" }}>56%</span>
                    </div>
                    <div style={{ height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                       <div style={{ height: "100%", width: "56%", background: "var(--cyan)" }}></div>
                    </div>
                    <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#94a3b8" }}>
                       Estimated Completion: Oct 2026
                    </div>
                 </div>
                 
                 <div className="panel" style={{ padding: "1.5rem" }}>
                    <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Budget</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                       <span>Capital Deployed</span>
                       <span style={{ fontWeight: "bold" }}>$1.2M / $2.5M</span>
                    </div>
                    <div style={{ height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                       <div style={{ height: "100%", width: "48%", background: "var(--primary)" }}></div>
                    </div>
                    <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#94a3b8" }}>
                       On Track - No budget overruns detected.
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === "feasibility" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>Feasibility Report</h1>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Initial AI-generated planning estimates.</p>
              </div>
              <div className="panel" style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", background: "rgba(0,0,0,0.2)" }}>
                 <Map size={48} style={{ opacity: 0.2, margin: "0 auto 1rem" }} />
                 <h3>Report generated successfully</h3>
                 <p>Your feasibility report is ready for download.</p>
                 <button className="btn btn-primary" style={{ marginTop: "1rem" }}>Download PDF</button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
