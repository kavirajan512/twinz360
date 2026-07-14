"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Box, Cylinder } from "@react-three/drei";
import * as THREE from "three";
import { Building2, Home, Blocks, Briefcase, Layers, Eye, EyeOff, Search } from "lucide-react";

// --- Interfaces for our JSON schema ---
interface RoomConfig {
  key: string;
  type: string;
  label: string;
  grid: [number, number, number, number]; // x1, x2, z1, z2
  finishes: { floor: string; wallPaint: string; accentWall: string };
  furniture: string[];
}

interface FloorConfig {
  level: number;
  rooms: RoomConfig[];
  parking?: { slots: number; surface: string };
}

interface StructureConfig {
  foundation: string;
  frame: string;
  wallHeight: number;
  roof: string;
}

interface BuildingConfig {
  type: string;
  name: string;
  description: string;
  structure: StructureConfig;
  floors: FloorConfig[];
}

// --- Procedural Geometry Components ---

function StandInFurniture({ type, position }: { type: string; position: [number, number, number] }) {
  // Return different primitives based on furniture type
  const isBed = type.includes("bed");
  const isSofa = type.includes("sofa");
  const isTable = type.includes("table") || type.includes("desk");
  const isWC = type.includes("wc");
  
  const color = isBed ? "#6366f1" : isSofa ? "#ec4899" : isTable ? "#f59e0b" : isWC ? "#e2e8f0" : "#94a3b8";
  
  if (isTable) {
    return <Box args={[1.5, 0.8, 1]} position={position}><meshStandardMaterial color={color} /></Box>;
  }
  if (isSofa) {
    return <Box args={[2, 0.6, 1]} position={position}><meshStandardMaterial color={color} /></Box>;
  }
  if (isBed) {
    return <Box args={[1.8, 0.5, 2.2]} position={position}><meshStandardMaterial color={color} /></Box>;
  }
  if (isWC) {
    return <Cylinder args={[0.3, 0.3, 0.5, 16]} position={position}><meshStandardMaterial color={color} /></Cylinder>;
  }
  
  return <Box args={[0.8, 1, 0.8]} position={position}><meshStandardMaterial color={color} /></Box>;
}

function FloorPlanRenderer({ 
  config, 
  viewMode, 
  activeFloor,
  inspectStructural,
  onRoomClick 
}: { 
  config: BuildingConfig; 
  viewMode: "exterior" | "interior"; 
  activeFloor: number;
  inspectStructural: boolean;
  onRoomClick: (room: RoomConfig, floorLevel: number) => void;
}) {
  const GRID_SIZE = 2; // meters per grid unit

  return (
    <group position={[0, 0, 0]}>
      {/* BASE / FOUNDATION */}
      {inspectStructural && (
        <Html position={[0, -1, 4]} center>
          <div className="bg-slate-900/90 text-cyan-400 border border-cyan-500/50 p-2 rounded text-xs whitespace-nowrap backdrop-blur">
            <strong>Foundation:</strong> {config.structure.foundation}
          </div>
        </Html>
      )}

      {config.floors.map((floor) => {
        // Only render active floor if in interior mode (unless we want to stack them, but typically interior slices to one floor)
        if (viewMode === "interior" && floor.level !== activeFloor) return null;
        
        const floorY = floor.level * config.structure.wallHeight;
        
        return (
          <group key={floor.level} position={[0, floorY, 0]}>
            
            {/* EXTERIOR SHELL MODE */}
            {viewMode === "exterior" && (
              <>
                <Box args={[10, config.structure.wallHeight, 10]} position={[0, config.structure.wallHeight/2, 0]}>
                  <meshStandardMaterial color="#cbd5e1" opacity={0.9} transparent />
                </Box>
                {inspectStructural && floor.level === 0 && (
                  <Html position={[6, config.structure.wallHeight/2, 0]} center>
                    <div className="bg-slate-900/90 text-emerald-400 border border-emerald-500/50 p-2 rounded text-xs whitespace-nowrap backdrop-blur">
                      <strong>Frame:</strong> {config.structure.frame}
                    </div>
                  </Html>
                )}
              </>
            )}

            {/* INTERIOR MODE - Room by Room */}
            {viewMode === "interior" && floor.rooms.map((room) => {
              // Calculate real coordinates from grid coordinates
              const [x1, x2, z1, z2] = room.grid;
              const width = (x2 - x1) * GRID_SIZE;
              const depth = (z2 - z1) * GRID_SIZE;
              const cx = ((x1 + x2) / 2) * GRID_SIZE - (5 * GRID_SIZE / 2); // offset to center around 0
              const cz = ((z1 + z2) / 2) * GRID_SIZE - (5 * GRID_SIZE / 2);

              // Finish colors based on JSON mapping
              const floorColor = room.finishes.floor.includes("wood") ? "#8B5A2B" : room.finishes.floor.includes("tile") ? "#e2e8f0" : "#94a3b8";
              
              return (
                <group key={room.key} position={[cx, 0, cz]}>
                  {/* Floor tile */}
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} onClick={(e) => { e.stopPropagation(); onRoomClick(room, floor.level); }}>
                    <planeGeometry args={[width - 0.2, depth - 0.2]} />
                    <meshStandardMaterial color={floorColor} />
                  </mesh>

                  {/* Room Label */}
                  <Html position={[0, 0.2, 0]} center zIndexRange={[100, 0]}>
                    <div className="text-[10px] font-bold text-white/70 bg-black/50 px-1 rounded pointer-events-none">{room.label}</div>
                  </Html>

                  {/* Interior Walls (simplified bounding box) */}
                  <Box args={[width - 0.1, 1, depth - 0.1]} position={[0, 0.5, 0]}>
                    <meshStandardMaterial color="#f8fafc" opacity={0.1} transparent wireframe />
                  </Box>

                  {/* Place furniture (dummy scatter) */}
                  {room.furniture.map((furn, idx) => {
                    const offsetX = (Math.random() - 0.5) * (width - 1);
                    const offsetZ = (Math.random() - 0.5) * (depth - 1);
                    return (
                      <StandInFurniture 
                        key={idx} 
                        type={furn} 
                        position={[offsetX, 0.4, offsetZ]} 
                      />
                    );
                  })}
                </group>
              );
            })}
          </group>
        );
      })}

      {/* ROOF */}
      {viewMode === "exterior" && (
        <group position={[0, config.floors.length * config.structure.wallHeight, 0]}>
          {config.structure.roof.includes("pitched") ? (
            <Cylinder args={[0, 7.5, 3, 4]} rotation={[0, Math.PI/4, 0]} position={[0, 1.5, 0]}>
              <meshStandardMaterial color="#475569" />
            </Cylinder>
          ) : (
            <Box args={[10.5, 0.5, 10.5]} position={[0, 0.25, 0]}>
              <meshStandardMaterial color="#334155" />
            </Box>
          )}
          
          {inspectStructural && (
            <Html position={[0, 4, 0]} center>
              <div className="bg-slate-900/90 text-violet-400 border border-violet-500/50 p-2 rounded text-xs whitespace-nowrap backdrop-blur">
                <strong>Roof:</strong> {config.structure.roof}
              </div>
            </Html>
          )}
        </group>
      )}
    </group>
  );
}


export default function MultiTypologyViewer() {
  const [configs, setConfigs] = useState<BuildingConfig[]>([]);
  const [activeTypeIndex, setActiveTypeIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"exterior" | "interior">("exterior");
  const [activeFloor, setActiveFloor] = useState(0);
  const [inspectStructural, setInspectStructural] = useState(false);
  const [inspectedRoom, setInspectedRoom] = useState<{room: RoomConfig, floorLevel: number} | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:3001/api/building-typologies")
      .then(r => r.json())
      .then(data => setConfigs(data))
      .catch(e => console.error("Failed to load configs", e));
  }, []);

  const activeConfig = configs[activeTypeIndex];

  // Auto-reset floor selector if switching buildings
  useEffect(() => {
    setActiveFloor(0);
    setInspectedRoom(null);
  }, [activeTypeIndex, viewMode]);

  if (!activeConfig) return <div className="p-8 text-center text-cyan-400">Loading building data via FastAPI...</div>;

  const TypeIcons = [Home, Building2, Blocks, Briefcase]; // Maps roughly to the 4 typologies

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 rounded-xl overflow-hidden border border-slate-800">
      
      {/* TOP CONTROLS */}
      <div className="flex justify-between items-center p-3 border-b border-slate-800 bg-slate-900/50">
        
        {/* Building Switcher Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          {configs.map((cfg, idx) => {
            const Icon = TypeIcons[idx % TypeIcons.length];
            return (
              <button
                key={cfg.type}
                onClick={() => setActiveTypeIndex(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTypeIndex === idx 
                    ? "bg-cyan-900/40 text-cyan-400 border border-cyan-800/50" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <Icon size={14} />
                {cfg.name}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 mr-4">
            <button
              onClick={() => { setViewMode("exterior"); setInspectStructural(false); }}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === "exterior" ? "bg-slate-800 text-white" : "text-slate-500"
              }`}
            >
              <Eye size={14} /> Full Structure
            </button>
            <button
              onClick={() => setViewMode("interior")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === "interior" ? "bg-slate-800 text-white" : "text-slate-500"
              }`}
            >
              <Layers size={14} /> Floor Interiors
            </button>
          </div>

          {viewMode === "exterior" && (
            <button
              onClick={() => setInspectStructural(!inspectStructural)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                inspectStructural 
                  ? "bg-emerald-900/30 text-emerald-400 border-emerald-500/50" 
                  : "bg-slate-900 text-slate-400 border-slate-700"
              }`}
            >
              <Search size={14} /> Inspect Structure
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 relative flex">
        
        {/* 3D CANVAS */}
        <div className="flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950">
          <Canvas camera={{ position: [12, 10, 12], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
            <pointLight position={[-10, 5, -10]} intensity={0.3} color="#0ea5e9" />
            
            <FloorPlanRenderer 
              config={activeConfig} 
              viewMode={viewMode}
              activeFloor={activeFloor}
              inspectStructural={inspectStructural}
              onRoomClick={(r, lvl) => setInspectedRoom({room: r, floorLevel: lvl})}
            />

            <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.1} />
            <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} position={[0, -0.01, 0]} />
          </Canvas>
        </div>

        {/* RIGHT HUD OVERLAYS */}
        <div className="absolute top-4 right-4 flex flex-col gap-4 pointer-events-none w-64">
          
          {/* Floor Selector (only show if interior mode and multiple floors exist) */}
          {viewMode === "interior" && activeConfig.floors.length > 1 && (
            <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg pointer-events-auto">
              <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Select Floor</h3>
              <div className="flex flex-col gap-1">
                {activeConfig.floors.slice().reverse().map((f) => (
                  <button
                    key={f.level}
                    onClick={() => { setActiveFloor(f.level); setInspectedRoom(null); }}
                    className={`text-left px-3 py-1.5 text-xs rounded transition-colors ${
                      activeFloor === f.level 
                        ? "bg-cyan-900/50 text-cyan-300 border border-cyan-700/50" 
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    Floor {f.level} {f.level === 0 ? "(Ground)" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Building Stats Card */}
          <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-white mb-1">{activeConfig.name}</h3>
            <p className="text-xs text-slate-400 mb-4">{activeConfig.description}</p>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <div className="text-slate-500">Floors</div>
                <div className="font-bold text-slate-200">{activeConfig.floors.length}</div>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <div className="text-slate-500">Total Rooms</div>
                <div className="font-bold text-slate-200">
                  {activeConfig.floors.reduce((acc, f) => acc + f.rooms.length, 0)}
                </div>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 col-span-2">
                <div className="text-slate-500">Wall Height (per floor)</div>
                <div className="font-bold text-slate-200">{activeConfig.structure.wallHeight}m</div>
              </div>
            </div>
          </div>

          {/* Room Inspector Card */}
          {inspectedRoom && viewMode === "interior" && (
            <div className="bg-slate-900/90 backdrop-blur border border-cyan-800/50 p-4 rounded-lg pointer-events-auto animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold text-cyan-400">{inspectedRoom.room.label}</h3>
                <button onClick={() => setInspectedRoom(null)} className="text-slate-500 hover:text-white"><EyeOff size={14}/></button>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-3">Floor {inspectedRoom.floorLevel} • {inspectedRoom.room.type.replace('_',' ')}</p>
              
              <div className="space-y-3 text-xs">
                <div>
                  <strong className="text-slate-300">Finishes:</strong>
                  <ul className="text-slate-400 mt-1 space-y-1">
                    <li>• Floor: <span className="text-slate-300">{inspectedRoom.room.finishes.floor}</span></li>
                    <li>• Wall: <span className="text-slate-300">{inspectedRoom.room.finishes.wallPaint}</span></li>
                    {inspectedRoom.room.finishes.accentWall !== 'none' && (
                      <li>• Accent: <span className="text-slate-300">{inspectedRoom.room.finishes.accentWall}</span></li>
                    )}
                  </ul>
                </div>
                <div>
                  <strong className="text-slate-300">Furniture Setup:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {inspectedRoom.room.furniture.length === 0 && <span className="text-slate-500 italic">Unfurnished</span>}
                    {inspectedRoom.room.furniture.map((f, i) => (
                      <span key={i} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] border border-slate-700">
                        {f.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
