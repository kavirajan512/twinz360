"use client";
import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Box, Cylinder, Sphere } from "@react-three/drei";
import * as THREE from "three";

interface LayerState {
  foundation: boolean;
  columns: boolean;
  beams: boolean;
  slabs: boolean;
  mep: boolean;
  equipment: boolean;
  workers: boolean;
  cameras: boolean;
}

interface ViewerProps {
  progress?: number;
  flightPathPoints?: [number, number, number][];
  activeLayers?: LayerState;
  isLiveMode?: boolean;
  resetCameraTrigger?: number;
  onSelectCamera?: (cameraId: string) => void;
}

// ---------------------------------------------
// 1. DYNAMIC BIM MODEL (4D TIMELINE AWARE)
// ---------------------------------------------
const BIMModel = ({ layers, progress }: { layers: LayerState, progress: number }) => {
  // Map progress (0-100) to stages
  // 0-30: Foundation
  // 30-60: Foundation + Columns
  // 60-100: Foundation + Columns + Beams/Slabs
  
  return (
    <group position={[0, -2, 0]}>
      {/* Foundation Layer */}
      {layers.foundation && progress >= 0 && (
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[40, 1, 30]} />
          <meshStandardMaterial color="#3f3f46" metalness={0.2} roughness={0.8} />
        </mesh>
      )}

      {/* Columns Layer */}
      {layers.columns && progress > 30 && (
        <group>
          {[-15, -5, 5, 15].map((x) =>
            [-10, 0, 10].map((z) => (
              <mesh key={`col-${x}-${z}`} position={[x, 3, z]} castShadow receiveShadow>
                <boxGeometry args={[1, 5, 1]} />
                <meshStandardMaterial color="#71717a" metalness={0.4} roughness={0.6} />
              </mesh>
            ))
          )}
        </group>
      )}

      {/* Beams & Slabs Layer */}
      {(layers.beams || layers.slabs) && progress > 60 && (
        <group>
          {/* Level 1 Slab */}
          <mesh position={[0, 6, 0]} castShadow receiveShadow>
            <boxGeometry args={[42, 0.5, 32]} />
            <meshStandardMaterial color="#52525b" metalness={0.3} roughness={0.7} />
          </mesh>
          {/* Level 2 Columns */}
          {progress > 80 && [-15, -5, 5, 15].map((x) =>
            [-10, 0, 10].map((z) => (
               <mesh key={`col2-${x}-${z}`} position={[x, 9, z]} castShadow receiveShadow>
                 <boxGeometry args={[0.8, 5, 0.8]} />
                 <meshStandardMaterial color="#a1a1aa" metalness={0.5} roughness={0.5} />
               </mesh>
            ))
          )}
           {/* Level 2 Slab Outline (Wireframe) */}
           <mesh position={[0, 12, 0]}>
            <boxGeometry args={[42, 0.5, 32]} />
            <meshStandardMaterial color="#06b6d4" wireframe={true} transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* MEP Pipes Layer */}
      {layers.mep && progress > 50 && (
        <group>
           <mesh position={[0, 5.5, -5]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.3, 0.3, 40, 16]} />
              <meshStandardMaterial color="#ef4444" metalness={0.8} roughness={0.2} />
           </mesh>
           <mesh position={[0, 5.5, -3]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.4, 0.4, 40, 16]} />
              <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.2} />
           </mesh>
        </group>
      )}
    </group>
  );
};

// ---------------------------------------------
// 2. REAL-TIME WORKER TRACKING
// ---------------------------------------------
const WorkerFleet = ({ isLiveMode }: { isLiveMode: boolean }) => {
  const workers = useMemo(() => [
    { id: "W-104", initialPos: new THREE.Vector3(-10, 0, 5), speed: 0.02 },
    { id: "W-105", initialPos: new THREE.Vector3(5, 0, -8), speed: 0.015 },
    { id: "W-201", initialPos: new THREE.Vector3(12, 6, 2), speed: 0.025 },
  ], []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !isLiveMode) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const w = workers[i];
      // Simple wandering animation
      child.position.x = w.initialPos.x + Math.sin(t * w.speed * 10) * 3;
      child.position.z = w.initialPos.z + Math.cos(t * w.speed * 10) * 3;
    });
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {workers.map((w, i) => (
        <group key={i} position={w.initialPos}>
           {/* Worker Model Proxy */}
           <mesh position={[0, 0.5, 0]} castShadow>
             <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
             <meshStandardMaterial color="#eab308" /> {/* Yellow vest */}
           </mesh>
           {/* Helmet */}
           <mesh position={[0, 1.2, 0]} castShadow>
             <sphereGeometry args={[0.3, 16, 16]} />
             <meshStandardMaterial color="#ffffff" />
           </mesh>
           {/* Floating Label */}
           <Html position={[0, 2, 0]} center style={{ pointerEvents: "none" }}>
             <div style={{ background: "rgba(0,0,0,0.7)", color: "var(--cyan)", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", border: "1px solid var(--cyan)", whiteSpace: "nowrap" }}>
               {w.id} (Active)
             </div>
           </Html>
        </group>
      ))}
    </group>
  );
};

// ---------------------------------------------
// 3. LIVE CCTV CAMERA MONITORING
// ---------------------------------------------
const CCTVCameras = ({ onSelectCamera }: { onSelectCamera?: (id: string) => void }) => {
  const [hoveredCam, setHoveredCam] = useState<string | null>(null);
  
  const cameras = [
    { id: "CAM-01", label: "CAM-01 (Site Entry)", pos: [-22, 5, 18], rot: [0, -Math.PI/4, 0] },
    { id: "CAM-02", label: "CAM-02 (Crane Base)", pos: [10, 8, -18], rot: [-0.2, Math.PI, 0] },
  ];

  return (
    <group>
      {cameras.map((cam, i) => {
        const isHovered = hoveredCam === cam.id;
        return (
          <group 
            key={i} 
            position={cam.pos as [number, number, number]} 
            rotation={cam.rot as [number, number, number]}
            onClick={(e) => { e.stopPropagation(); onSelectCamera?.(cam.id); }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredCam(cam.id); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHoveredCam(null); document.body.style.cursor = 'auto'; }}
          >
             {/* Camera Body */}
             <mesh position={[0, 0, 0]}>
               <boxGeometry args={[0.5, 0.5, 1]} />
               <meshStandardMaterial color={isHovered ? "#ef4444" : "#18181b"} />
             </mesh>
             {/* View Frustum Cone */}
             <mesh position={[0, 0, 3]} rotation={[-Math.PI/2, 0, 0]}>
               <cylinderGeometry args={[2, 0, 6, 16]} />
               <meshBasicMaterial color="#ef4444" transparent opacity={isHovered ? 0.3 : 0.15} side={THREE.DoubleSide} depthWrite={false} />
             </mesh>
             <Html position={[0, 1, 0]} center style={{ pointerEvents: "none" }}>
               <div style={{ background: isHovered ? "rgba(239, 68, 68, 0.8)" : "rgba(239, 68, 68, 0.2)", color: isHovered ? "#fff" : "#ef4444", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", border: "1px solid #ef4444", whiteSpace: "nowrap", transition: "all 0.2s" }}>
                 {cam.label}
                 {isHovered && <div style={{ fontSize: "9px", marginTop: "2px", fontWeight: "normal" }}>Click to View Feed</div>}
               </div>
             </Html>
          </group>
        );
      })}
    </group>
  );
};

// ---------------------------------------------
// 3.5 INTERACTIVE IOT SENSORS
// ---------------------------------------------
const IoTSensors = () => {
  const [hoveredSensor, setHoveredSensor] = useState<string | null>(null);

  const sensors = [
    { id: "S-1", pos: [0, -1, 5], temp: "32°C", hr: "84 BPM", worker: "Group A Hub" },
    { id: "S-2", pos: [12, -1, -5], temp: "28°C", hr: "72 BPM", worker: "Group B Hub" },
  ];

  return (
    <group>
      {sensors.map((s, i) => {
        const isHovered = hoveredSensor === s.id;
        return (
          <group 
            key={i} 
            position={s.pos as [number, number, number]}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredSensor(s.id); }}
            onPointerOut={() => { setHoveredSensor(null); }}
          >
            <mesh>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshBasicMaterial color="#10b981" wireframe={isHovered} />
            </mesh>
            {isHovered && (
              <Html position={[0, 1.5, 0]} center style={{ pointerEvents: "none", zIndex: 100 }}>
                <div style={{ background: "rgba(9, 9, 11, 0.9)", border: "1px solid #10b981", borderRadius: "8px", padding: "8px", color: "white", fontSize: "11px", width: "120px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                  <div style={{ color: "#10b981", fontWeight: "bold", marginBottom: "4px", borderBottom: "1px solid rgba(16,185,129,0.3)", paddingBottom: "2px" }}>{s.worker}</div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Temp:</span> <span>{s.temp}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Heart Rate:</span> <span>{s.hr}</span></div>
                  <div style={{ color: "#34d399", fontSize: "9px", marginTop: "4px", textAlign: "center" }}>Biometrics Healthy</div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

// ---------------------------------------------
// 4. CAMERA CONTROLLER
// ---------------------------------------------
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

const CameraController = ({ resetTrigger }: { resetTrigger: number }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (resetTrigger > 0 && controlsRef.current) {
      camera.position.set(25, 20, 30);
      controlsRef.current.target.set(0, 5, 0);
      controlsRef.current.update();
    }
  }, [resetTrigger, camera]);

  return (
    <OrbitControls 
      ref={controlsRef}
      makeDefault 
      target={[0, 5, 0]} 
      minPolarAngle={0} 
      maxPolarAngle={Math.PI / 2 - 0.05} 
      maxDistance={80}
    />
  );
};

// ---------------------------------------------
// MAIN VIEWER COMPONENT
// ---------------------------------------------
export default function DigitalTwinViewer({ 
  progress = 100,
  activeLayers = {
    foundation: true, columns: true, beams: true, slabs: true,
    mep: false, equipment: true, workers: true, cameras: true
  },
  isLiveMode = true,
  resetCameraTrigger = 0,
  onSelectCamera
}: ViewerProps) {
  
  return (
    <div style={{ width: "100%", height: "100%", background: "radial-gradient(circle at center, #18181b 0%, #09090b 100%)", borderRadius: "12px", overflow: "hidden" }}>
      <Canvas shadows camera={{ position: [25, 20, 30], fov: 45 }}>
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[20, 30, 10]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]} 
          shadow-camera-left={-30} 
          shadow-camera-right={30} 
          shadow-camera-top={30} 
          shadow-camera-bottom={-30} 
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#06b6d4" />
        
        {/* Environment */}
        <Environment preset="city" />
        
        {/* Scene Contents */}
        <group>
          {/* Base Grid Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#09090b" roughness={1} />
          </mesh>
          <gridHelper args={[100, 50, "#3f3f46", "#18181b"]} position={[0, -2.09, 0]} />

          {/* Core BIM Model */}
          <BIMModel layers={activeLayers} progress={progress} />
          
          {/* Workers */}
          {activeLayers.workers && <WorkerFleet isLiveMode={isLiveMode} />}
          
          {/* CCTV Cameras */}
          {activeLayers.cameras && <CCTVCameras onSelectCamera={onSelectCamera} />}
          
          {/* IoT Sensors */}
          {activeLayers.equipment && <IoTSensors />}

        </group>
        
        {/* Controls */}
        <CameraController resetTrigger={resetCameraTrigger} />
      </Canvas>
    </div>
  );
}
