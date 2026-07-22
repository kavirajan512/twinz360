"use client";

import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing';
import { LuxuryVillaInterior } from "./LuxuryVillaInterior";
import {
  PlumbingLayer,
  ElectricalLayer,
  HVACLayer,
  StructuralLayer,
  FireSafetyLayer,
  SwimmingPool,
  LandscapeLayer,
  RoadLayer,
  WallDecorations
} from "./ConstructionLayerSystem";

interface ViewerProps {
  formData: {
    land_length: number;
    land_width: number;
    num_floors: number;
    style_selection?: string;
    material_preference?: string;
  };
}

type LayerKey = 'structure' | 'plumbing' | 'electrical' | 'hvac' | 'fire' | 'pool' | 'landscape' | 'road' | 'decor' | 'furniture';

export default function LuxuryVillaViewer({ formData }: ViewerProps) {
  const maxDim = Math.max(formData.land_length || 30, formData.land_width || 25);
  const camDist = Math.max(25, maxDim * 1.2);
  const [showLights, setShowLights] = useState(true);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    structure: false,
    plumbing: false,
    electrical: false,
    hvac: false,
    fire: false,
    pool: true,
    landscape: true,
    road: true,
    decor: true,
    furniture: true,
  });

  const toggleLayer = (key: LayerKey) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  const layerDefs: { key: LayerKey; label: string; color: string }[] = [
    { key: 'structure', label: 'Structure', color: '#94a3b8' },
    { key: 'plumbing', label: 'Plumbing', color: '#0ea5e9' },
    { key: 'electrical', label: 'Electrical', color: '#facc15' },
    { key: 'hvac', label: 'HVAC', color: '#9ca3af' },
    { key: 'fire', label: 'Fire Safety', color: '#ef4444' },
    { key: 'pool', label: 'Pool', color: '#38bdf8' },
    { key: 'landscape', label: 'Landscape', color: '#22c55e' },
    { key: 'road', label: 'Road', color: '#1e293b' },
    { key: 'decor', label: 'Decor', color: '#a78bfa' },
    { key: 'furniture', label: 'Furniture', color: '#f59e0b' },
  ];

  return (
    <div style={{ width: "100%", height: "580px", borderRadius: "12px", overflow: "hidden", position: "relative", background: "#000" }}>
      
      {/* Top controls bar */}
      <div style={{ position: "absolute", top: 8, left: 8, right: 8, zIndex: 10, display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {layerDefs.map(l => (
            <button
              key={l.key}
              onClick={() => toggleLayer(l.key)}
              style={{
                padding: "3px 8px", fontSize: "0.65rem", borderRadius: "4px", border: "1px solid",
                background: layers[l.key] ? `${l.color}22` : "transparent",
                borderColor: layers[l.key] ? l.color : "#555",
                color: layers[l.key] ? "#fff" : "#999",
                cursor: "pointer", fontWeight: layers[l.key] ? "600" : "400",
                transition: "all 0.15s"
              }}
            >
              {layers[l.key] ? "✓ " : ""}{l.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowLights(!showLights)} style={{ padding: "3px 10px", fontSize: "0.65rem", borderRadius: "4px", border: "1px solid #555", background: showLights ? "#3b82f622" : "transparent", color: showLights ? "#fff" : "#999", cursor: "pointer" }}>
          {showLights ? "☀️ Lights On" : "🌙 Lights Off"}
        </button>
      </div>

      <Canvas camera={{ position: [camDist, formData.num_floors * 4 + 8, camDist], fov: 45 }} shadows gl={{ antialias: true }}>
        
        {/* HDRI Environment */}
        <Environment preset="city" background={false} blur={0.5} />
        
        {/* Lighting System */}
        <ambientLight intensity={showLights ? 0.6 : 0.15} color={0xffffff} />
        <directionalLight position={[20, 25, 10]} intensity={1.2} color={0xfff4e0} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <directionalLight position={[-15, 10, -10]} intensity={0.3} color={0x88bbff} />
        <pointLight position={[0, 8, 0]} intensity={showLights ? 0.5 : 0.1} color={0xffe4b5} distance={30} />
        
        {/* LAYERS */}
        <StructuralLayer visible={layers.structure} />
        <PlumbingLayer visible={layers.plumbing} />
        <ElectricalLayer visible={layers.electrical} />
        <HVACLayer visible={layers.hvac} />
        <FireSafetyLayer visible={layers.fire} />
        
        {/* Villa interior (furniture, rooms, walls) */}
        {layers.furniture && <LuxuryVillaInterior numFloors={formData.num_floors || 2} />}
        
        {/* Exterior layers */}
        <SwimmingPool visible={layers.pool} />
        <LandscapeLayer visible={layers.landscape} />
        <RoadLayer visible={layers.road} />
        <WallDecorations visible={layers.decor} />
        
        {/* Ground plane */}
        <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color={0x1a1a1a} roughness={0.9} />
        </mesh>

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} maxPolarAngle={Math.PI / 2 - 0.05} minDistance={5} maxDistance={50} />
        <ContactShadows position={[0, -0.1, 0]} opacity={0.5} scale={50} blur={2} far={10} />
        
        {/* Post-processing */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} height={300} intensity={1.2} />
          <SSAO samples={16} radius={8} intensity={15} luminanceInfluence={0.4} />
        </EffectComposer>

        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport axisColors={["#ef4444", "#84cc16", "#3b82f6"]} labelColor="white" />
        </GizmoHelper>
      </Canvas>
    </div>
  );
}
