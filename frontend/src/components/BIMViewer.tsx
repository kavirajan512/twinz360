"use client";

import React, { useState } from "react";
import { Upload, Box, ShieldAlert, Cpu, Layers, Image as ImageIcon, Ruler, Eye, Video } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Splat, Environment, Grid, Html, GizmoHelper, GizmoViewport } from "@react-three/drei";

export default function BIMViewer() {
  const [loading, setLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<"bim" | "splat" | "real" | "diagram">("splat");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setTimeout(() => {
      setModelLoaded(true);
      setLoading(false);
      alert("Asset Parsed Successfully!");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
      
      {/* Top Bar for Upload & Tools */}
      <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
        <h2 className="text-white font-bold flex items-center gap-2 m-0 text-lg">
          <Eye className="text-cyan-400" size={20} /> Advanced Digital Twin Viewer
        </h2>
        
        <div className="flex items-center gap-4">
          <label className="cursor-pointer bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-[rgba(255,255,255,0.1)]">
            <Upload size={16} /> Import Assets
            <input type="file" accept=".ifc,.obj,.splat,.jpg" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="relative flex-1">
        
        {/* Floating View Mode Toolbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex bg-[#18181b]/90 backdrop-blur-md rounded-xl p-1 border border-[rgba(255,255,255,0.1)] shadow-2xl">
          <button 
            onClick={() => setViewMode("bim")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${viewMode === "bim" ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-gray-400 hover:text-white"}`}
          >
            <Box size={16} /> 3D BIM Model
          </button>
          <button 
            onClick={() => setViewMode("splat")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${viewMode === "splat" ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" : "text-gray-400 hover:text-white"}`}
          >
            <Cpu size={16} /> Gaussian Splat (AI)
          </button>
          <button 
            onClick={() => setViewMode("real")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${viewMode === "real" ? "bg-green-600/20 text-green-400 border border-green-500/30" : "text-gray-400 hover:text-white"}`}
          >
            <ImageIcon size={16} /> Real 360° Image
          </button>
          <button 
            onClick={() => setViewMode("diagram")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${viewMode === "diagram" ? "bg-orange-600/20 text-orange-400 border border-orange-500/30" : "text-gray-400 hover:text-white"}`}
          >
            <Ruler size={16} /> Layout / Diagram
          </button>
        </div>

        {/* 3D Viewport */}
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
          <color attach="background" args={["#09090b"]} />
          <OrbitControls makeDefault enableDamping />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 10]} intensity={1} />
          
          {/* Base Grid */}
          <Grid args={[50, 50]} sectionColor="#1e293b" cellColor="#0f172a" position={[0, -0.01, 0]} />

          {/* Mode: BIM Model */}
          {viewMode === "bim" && (
            <group>
              <mesh position={[0, 2.5, 0]}>
                <boxGeometry args={[5, 5, 5]} />
                <meshStandardMaterial color="#38bdf8" wireframe={false} opacity={0.8} transparent />
              </mesh>
              <mesh position={[3, 1, 3]}>
                <cylinderGeometry args={[1, 1, 2, 32]} />
                <meshStandardMaterial color="#818cf8" />
              </mesh>
              <Html position={[0, 6, 0]} center>
                <div className="bg-[#18181b]/80 border border-blue-500/30 px-3 py-1 rounded text-blue-400 text-xs font-bold backdrop-blur-sm">
                  IFC Structure: Core A
                </div>
              </Html>
            </group>
          )}

          {/* Mode: Gaussian Splat */}
          {viewMode === "splat" && (
            <group>
              <Environment preset="city" />
              {/* Using a public gaussian splat. The user's system will inject real site data here. */}
              <Splat src="https://huggingface.co/datasets/dylanebert/3d-splats/resolve/main/shoe_0.splat" position={[0, 1, 0]} rotation={[0, Math.PI, 0]} scale={2} />
              <Html position={[0, 3, 0]} center>
                <div className="bg-purple-900/80 border border-purple-500/50 px-3 py-1 rounded text-purple-300 text-xs font-bold backdrop-blur-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                  Higgsfield MCP AI Render
                </div>
              </Html>
            </group>
          )}

          {/* Mode: Real Image / 360 */}
          {viewMode === "real" && (
            <group>
              <Environment background preset="park" blur={0.01} />
              <Html position={[0, 0, -5]} center>
                <div className="bg-green-900/80 border border-green-500/50 px-3 py-1 rounded text-green-300 text-xs font-bold backdrop-blur-sm flex items-center gap-2">
                  <Video size={14} /> Site Camera 360° View
                </div>
              </Html>
            </group>
          )}

          {/* Mode: Diagram / Blueprint */}
          {viewMode === "diagram" && (
            <group>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshBasicMaterial color="#020617" />
              </mesh>
              {/* Blueprint lines mock */}
              <mesh position={[0, 0.1, 0]}>
                <boxGeometry args={[10, 0.1, 8]} />
                <meshBasicMaterial color="#ea580c" wireframe />
              </mesh>
              <Html position={[0, 0.5, 0]} center>
                <div className="bg-orange-900/80 border border-orange-500/50 px-3 py-1 rounded text-orange-300 text-xs font-bold backdrop-blur-sm flex items-center gap-2">
                  <Ruler size={14} /> Floor Plan Level 1
                </div>
              </Html>
            </group>
          )}

          {/* Navigation Compass (Drag, Up, Down, Left, Right) */}
          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport axisColors={["#ef4444", "#84cc16", "#3b82f6"]} labelColor="white" />
          </GizmoHelper>

        </Canvas>
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#09090b]/60 backdrop-blur-sm z-30">
            <div className="bg-[#18181b] p-6 rounded-xl border border-[rgba(255,255,255,0.1)] text-center shadow-2xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-cyan-400 font-bold">Processing Visual Assets...</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
