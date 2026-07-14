"use client";

import React, { useState } from "react";
import { Layers, HelpCircle, Film, Play, Pause, Settings, RefreshCw, Box, Eye, Circle, Sliders, Palette, Layout, Key } from "lucide-react";
import Feasibility3DViewer from "./Feasibility3DViewer";

interface Blender3DViewerProps {
  formData: any;
  analysisResult: any;
  viewMode: any;
  focusedRoom: any;
  onViewModeChange: any;
}

export default function Blender3DViewer({ formData, analysisResult, viewMode, focusedRoom, onViewModeChange }: Blender3DViewerProps) {
  const [engine, setEngine] = useState<"eevee" | "cycles">("eevee");
  const [selectedMesh, setSelectedMesh] = useState<string>("Building Shell");
  const [meshColor, setMeshColor] = useState<string>("#38bdf8");
  const [roughness, setRoughness] = useState<number>(0.5);
  const [metalness, setMetalness] = useState<number>(0.1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentFrame, setCurrentFrame] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"properties" | "materials" | "render">("materials");

  const sceneObjects = [
    { id: "building", name: "Building Shell", type: "Mesh", visible: true },
    { id: "roof_elements", name: "Solar & Water Tanks", type: "Mesh Group", visible: true },
    { id: "exterior", name: "Landscaping & Pool", type: "Mesh Group", visible: true },
    { id: "light", name: "Sun Light", type: "Light", visible: true },
    { id: "camera", name: "Orbit Camera", type: "Camera", visible: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "580px", background: "#1e1e1e", border: "1px solid #2d2d2d", borderRadius: "12px", overflow: "hidden", color: "#e0e0e0", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* Blender Top Info Bar */}
      <div style={{ background: "#282828", borderBottom: "1px solid #1a1a1a", padding: "0.3rem 0.8rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <span style={{ fontWeight: "bold", color: "#f57c00", display: "flex", alignItems: "center", gap: "4px" }}>
            <Box size={14} /> Blender Web 3D Workspace
          </span>
          <span style={{ color: "#888" }}>File</span>
          <span style={{ color: "#888" }}>Edit</span>
          <span style={{ color: "#888" }}>Render</span>
          <span style={{ color: "#888" }}>Window</span>
          <span style={{ color: "#888" }}>Help</span>
        </div>
        
        {/* Render Engine Toggles */}
        <div style={{ display: "flex", background: "#181818", borderRadius: "4px", padding: "2px", border: "1px solid #333" }}>
          <button 
            onClick={() => setEngine("eevee")}
            style={{
              padding: "2px 8px", background: engine === "eevee" ? "#4a4a4a" : "none",
              border: "none", color: engine === "eevee" ? "#fff" : "#888", borderRadius: "3px", fontSize: "0.7rem", cursor: "pointer"
            }}
          >
            Eevee (Realtime)
          </button>
          <button 
            onClick={() => setEngine("cycles")}
            style={{
              padding: "2px 8px", background: engine === "cycles" ? "#4a4a4a" : "none",
              border: "none", color: engine === "cycles" ? "#fff" : "#888", borderRadius: "3px", fontSize: "0.7rem", cursor: "pointer"
            }}
          >
            Cycles (Raytraced)
          </button>
        </div>
      </div>

      {/* Main Blender Workspace Layout (Middle Columns) */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 240px", overflow: "hidden" }}>
        
        {/* Left: Viewport (Runs our Canvas viewer) */}
        <div style={{ position: "relative", background: "#1a1a1a" }}>
          <Feasibility3DViewer 
            formData={{
              ...formData,
              material_preference: selectedMesh === "Building Shell" 
                ? (meshColor === "#854d0e" ? "Wood" : meshColor === "#4b5563" ? "Steel" : "Concrete") 
                : formData.material_preference
            }}
            analysisResult={analysisResult}
            viewMode={viewMode}
            focusedRoom={focusedRoom}
            onViewModeChange={onViewModeChange}
          />
          
          {/* Editor Tool Shelf (Left Overlay overlay) */}
          <div style={{ position: "absolute", top: 110, left: 12, background: "rgba(30,30,30,0.85)", border: "1px solid #3c3c3c", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "6px", padding: "4px", zIndex: 10 }}>
            {[
              { label: "Select", icon: <Layout size={14} /> },
              { label: "Cursor", icon: <Circle size={14} /> },
              { label: "Translate", icon: <Sliders size={14} /> },
              { label: "Materials", icon: <Palette size={14} /> },
              { label: "Keyframes", icon: <Key size={14} /> }
            ].map(tool => (
              <button 
                key={tool.label} 
                title={tool.label}
                style={{ width: 28, height: 28, background: "none", border: "none", color: "#ccc", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", cursor: "pointer" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#4a4a4a"}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              >
                {tool.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Right Blender Workspace Sidebar (Outliner & Properties) */}
        <div style={{ background: "#2e2e2e", borderLeft: "1px solid #1a1a1a", display: "flex", flexDirection: "column", fontSize: "0.78rem" }}>
          
          {/* Outliner Scene Tree */}
          <div style={{ flex: 1.2, borderBottom: "1px solid #1a1a1a", display: "flex", flexDirection: "column" }}>
            <div style={{ background: "#282828", padding: "0.4rem 0.8rem", fontWeight: "bold", borderBottom: "1px solid #202020", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Scene Collection</span>
              <Layers size={12} style={{ color: "#aaa" }} />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
              {sceneObjects.map(obj => (
                <div 
                  key={obj.id} 
                  onClick={() => setSelectedMesh(obj.name)}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", borderRadius: "4px",
                    background: selectedMesh === obj.name ? "#4a4a4a" : "none", cursor: "pointer", marginBottom: "2px"
                  }}
                >
                  <span style={{ color: selectedMesh === obj.name ? "#fff" : "#bbb", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Box size={10} style={{ color: "#f57c00" }} /> {obj.name}
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Eye size={12} style={{ color: "#888", cursor: "pointer" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Properties Editor Tabs */}
          <div style={{ flex: 2, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", background: "#282828", borderBottom: "1px solid #202020" }}>
              {[
                { id: "materials", label: "Material" },
                { id: "properties", label: "Object" },
                { id: "render", label: "Render" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    flex: 1, padding: "0.4rem", background: activeTab === tab.id ? "#2e2e2e" : "none",
                    border: "none", borderBottom: activeTab === tab.id ? "2px solid #f57c00" : "none",
                    color: activeTab === tab.id ? "#fff" : "#888", fontSize: "0.72rem", cursor: "pointer"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "0.8rem", display: "flex", flexDirection: "column", gap: "10px" }}>
              
              {activeTab === "materials" && (
                <>
                  <div>
                    <label style={{ display: "block", color: "#aaa", marginBottom: "4px", fontSize: "0.7rem" }}>Active Mesh Selection</label>
                    <input type="text" value={selectedMesh} readOnly style={{ width: "100%", background: "#1a1a1a", border: "1px solid #444", padding: "4px 8px", borderRadius: "4px", color: "#fff", fontSize: "0.75rem" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#aaa", marginBottom: "4px", fontSize: "0.7rem" }}>Base Material Color</label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input 
                        type="color" 
                        value={meshColor} 
                        onChange={(e) => setMeshColor(e.target.value)} 
                        style={{ width: "32px", height: "24px", padding: 0, border: "none", borderRadius: "3px", cursor: "pointer" }}
                      />
                      <input 
                        type="text" 
                        value={meshColor} 
                        onChange={(e) => setMeshColor(e.target.value)}
                        style={{ flex: 1, background: "#1a1a1a", border: "1px solid #444", padding: "2px 6px", borderRadius: "4px", color: "#fff", fontSize: "0.7rem" }} 
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: "0.7rem", marginBottom: "2px" }}>
                      <span>Roughness</span>
                      <span>{roughness}</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.05" 
                      value={roughness} 
                      onChange={(e) => setRoughness(parseFloat(e.target.value))} 
                      style={{ width: "100%", accentColor: "#f57c00" }} 
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: "0.7rem", marginBottom: "2px" }}>
                      <span>Metallic</span>
                      <span>{metalness}</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.05" 
                      value={metalness} 
                      onChange={(e) => setMetalness(parseFloat(e.target.value))} 
                      style={{ width: "100%", accentColor: "#f57c00" }} 
                    />
                  </div>
                </>
              )}

              {activeTab === "properties" && (
                <div style={{ color: "#aaa", fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div><strong>Dimensions:</strong></div>
                  <div>Length: {formData.land_length}m</div>
                  <div>Width: {formData.land_width}m</div>
                  <div>Floors: {formData.num_floors}</div>
                  <div style={{ marginTop: "10px" }}><strong>Transform Matrix:</strong></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                    <div style={{ background: "#1a1a1a", padding: "2px 4px", borderRadius: "3px", textAlign: "center" }}>X: 0.00</div>
                    <div style={{ background: "#1a1a1a", padding: "2px 4px", borderRadius: "3px", textAlign: "center" }}>Y: 0.00</div>
                    <div style={{ background: "#1a1a1a", padding: "2px 4px", borderRadius: "3px", textAlign: "center" }}>Z: 0.00</div>
                  </div>
                </div>
              )}

              {activeTab === "render" && (
                <div style={{ color: "#aaa", fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div><strong>Denoising Engine:</strong> Intel Open Image</div>
                  <div><strong>Viewport Samples:</strong> 32 / 1024</div>
                  <div><strong>Render Samples:</strong> 128 / 4096</div>
                  <div><strong>Light Paths:</strong> Diffuse (4), Glossy (4), Transmission (12)</div>
                  <button 
                    onClick={() => alert("Simulating Cycles photorealistic render path pipeline...")} 
                    style={{ background: "#f57c00", border: "none", color: "#fff", padding: "6px 12px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}
                  >
                    <RefreshCw size={12} /> Render Image (F12)
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Blender Keyframe Animation Timeline Panel (Bottom overlay) */}
      <div style={{ background: "#282828", borderTop: "1px solid #1a1a1a", padding: "0.4rem 0.8rem", display: "flex", alignItems: "center", gap: "15px", fontSize: "0.75rem" }}>
        
        {/* Playback Controls */}
        <div style={{ display: "flex", gap: "4px" }}>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ background: "#3e3e3e", border: "none", color: "#fff", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>
        </div>

        {/* Timeline Frame Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "#aaa" }}>Frame:</span>
          <input 
            type="number" value={currentFrame} 
            onChange={(e) => setCurrentFrame(parseInt(e.target.value))} 
            style={{ width: "45px", background: "#1a1a1a", border: "1px solid #444", color: "#fff", padding: "2px 4px", borderRadius: "3px", fontSize: "0.7rem", textAlign: "center" }} 
          />
        </div>

        {/* Keyframe Track slider */}
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <input 
            type="range" min="1" max="250" 
            value={currentFrame} 
            onChange={(e) => setCurrentFrame(parseInt(e.target.value))} 
            style={{ width: "100%", accentColor: "#f57c00" }} 
          />
        </div>
      </div>

    </div>
  );
}
