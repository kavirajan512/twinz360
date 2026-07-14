"use client";

import React, { useRef, useMemo, useState, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF, Html, PerformanceMonitor, BakeShadows, Text, Splat, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing';
import * as THREE from "three";
import { Layers, Video, Play, Maximize, ShieldAlert, DollarSign, Clock, Minimize, Mic, MicOff } from "lucide-react";
import EquipmentTwin3D from "./EquipmentTwin3D";
import { useAeroTwinStore } from "../store/useAeroTwinStore";

interface Feasibility3DViewerProps {
  formData: {
    land_length: number;
    land_width: number;
    num_floors: number;
    building_type: string;
    road_width: number;
    style_selection?: string;
    material_preference?: string;
    soil_type?: string;
    terrace?: number;
  };
  analysisResult?: any;
  viewMode: "architectural" | "structural" | "furnished";
  focusedRoom?: string; // Jump to specific rooms from parent dashboard
  onViewModeChange?: (mode: "architectural" | "structural" | "furnished") => void; // Sync fullscreen views
}

interface PromptParams {
  force_flat_roof?: boolean;
  has_solar?: boolean;
  swimming_pool?: boolean;
  material_override?: string;
  style?: string;
  glb_url?: string;
  activeLayers?: Record<string, boolean>;
  sunHour?: number;
  isCinematic?: boolean;
}

// Cinematic Assembly Animation Wrapper
function AnimatedAssembly({ isCinematic, delay = 0, children }: { isCinematic: boolean, delay?: number, children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const [startTime, setStartTime] = useState(() => Date.now());

  // Reset animation when cinematic mode triggers
  useEffect(() => {
    if (isCinematic) {
      setStartTime(Date.now());
    }
  }, [isCinematic]);

  useFrame(() => {
    if (isCinematic && groupRef.current) {
      const elapsed = (Date.now() - startTime) / 1000 - delay;
      if (elapsed > 0) {
        const progress = Math.min(1.0, elapsed / 2.0); // 2 second animation duration per piece
        const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        groupRef.current.scale.setScalar(ease);
        groupRef.current.position.y = (1 - ease) * 15; // slide down from 15 units high
      } else {
        groupRef.current.scale.setScalar(0);
        groupRef.current.position.y = 15;
      }
    } else if (groupRef.current) {
      groupRef.current.scale.setScalar(1);
      groupRef.current.position.y = 0;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

// GLB Model Loader Component (renders layers and isolates floor-by-floor view)
function GLBModel({ url, activeLayers, viewMode, dollhouseMode, sunHour, activeFloor, numFloors }: { 
  url: string, 
  activeLayers: Record<string, boolean>, 
  viewMode: string,
  dollhouseMode: boolean,
  sunHour: number,
  activeFloor: string,
  numFloors: number
}) {
  const { scene } = useGLTF(`http://127.0.0.1:3001/${url}`);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const floorHeight = 3.0;

  clonedScene.traverse((child: any) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material) {
        child.material = child.material.clone();
        
        // --- REAL PBR MATERIAL PARAMETER BINDINGS ---
        const matName = child.material.name.toLowerCase();
        
        if (matName.includes("marble")) {
          child.material.roughness = 0.06;
          child.material.metalness = 0.1;
          child.material.color = new THREE.Color("#f1f5f9");
        } else if (matName.includes("glass")) {
          child.material.transparent = true;
          child.material.opacity = 0.35;
          child.material.roughness = 0.02;
          child.material.metalness = 0.95;
          child.material.color = new THREE.Color("#e0f2fe");
        } else if (matName.includes("wood")) {
          child.material.roughness = 0.65;
          child.material.metalness = 0.0;
          child.material.color = new THREE.Color("#854d0e");
        } else if (matName.includes("steel")) {
          child.material.roughness = 0.18;
          child.material.metalness = 0.9;
          child.material.color = new THREE.Color("#4b5563");
        } else if (matName.includes("water")) {
          child.material.transparent = true;
          child.material.opacity = 0.8;
          child.material.roughness = 0.08;
          child.material.metalness = 0.95;
          child.material.color = new THREE.Color("#0ea5e9");
        } else if (matName.includes("grass")) {
          child.material.roughness = 0.95;
          child.material.metalness = 0.0;
          child.material.color = new THREE.Color("#16a34a");
        } else if (matName.includes("concrete") || matName.includes("driveway")) {
          child.material.roughness = 0.85;
          child.material.metalness = 0.0;
          child.material.color = new THREE.Color("#64748b");
        }
      }
    }

    const checkGroup = (name: string) => {
      let curr = child;
      while (curr) {
        if (curr.name && curr.name.toLowerCase().includes(name)) return true;
        curr = curr.parent;
      }
      return false;
    };

    const isStructural = checkGroup("structural");
    const isArchitectural = checkGroup("architectural");
    const isWindows = checkGroup("windows");
    const isDoors = checkGroup("doors");
    const isElectrical = checkGroup("electrical");
    const isPlumbing = checkGroup("plumbing");
    const isHVAC = checkGroup("hvac");
    const isLighting = checkGroup("lighting");
    const isInterior = checkGroup("interior");
    const isLandscape = checkGroup("landscape");

    const isRoof = child.name.toLowerCase().includes("roof") || child.name.toLowerCase().includes("pyramid");

    let visible = true;

    // Map 12 Live Layers switches
    if (isStructural && !activeLayers.structural) visible = false;
    if (isArchitectural && !activeLayers.architectural) visible = false;
    if (isWindows && !activeLayers.architectural) visible = false;
    if (isDoors && !activeLayers.architectural) visible = false;
    if (isElectrical && !activeLayers.electrical) visible = false;
    if (isPlumbing && !activeLayers.plumbing) visible = false;
    if (isHVAC && !activeLayers.hvac) visible = false;
    if (isLighting && !activeLayers.lighting) visible = false;
    if (isInterior && !activeLayers.furniture) visible = false;
    if (isLandscape && !activeLayers.landscaping) visible = false;

    if (dollhouseMode && isRoof) {
      visible = false;
    }

    // Activate indoor glowing lights at night
    if (isLighting && child.isMesh && child.material) {
      if (sunHour >= 18) {
        child.material.color = new THREE.Color("#fef08a");
        child.material.emissive = new THREE.Color("#facc15");
        child.material.emissiveIntensity = 1.5;
        visible = activeLayers.lighting;
      } else {
        child.material.emissive = new THREE.Color("#000000");
        child.material.emissiveIntensity = 0.0;
      }
    }

    // --- FLOOR BY FLOOR ISOLATION FILTER ---
    if (activeFloor !== "all" && child.isMesh && child.geometry) {
      if (!child.geometry.boundingBox) {
        child.geometry.computeBoundingBox();
      }
      const center = new THREE.Vector3();
      child.geometry.boundingBox.getCenter(center);
      const meshHeight = center.y;
      
      const targetFloor = parseInt(activeFloor);
      const minH = targetFloor * floorHeight;
      const maxH = (targetFloor + 1) * floorHeight;

      // Exclude ground/landscape elements from disappearing when looking at upper floors
      if (!isLandscape) {
        if (meshHeight > maxH + 0.1) {
          visible = false;
        }
        if (meshHeight < minH - 0.1) {
          visible = false;
        }
      }
    }

    child.visible = visible;

    // Opacity overrides
    if (viewMode === "furnished" && isArchitectural && child.isMesh && child.material) {
      child.material.transparent = true;
      child.material.opacity = 0.25;
    }

    // Material Cost Heatmap simulation overlay
    if (activeLayers.cost && child.isMesh && child.material) {
      child.material.color = new THREE.Color(isInterior ? "#ef4444" : "#10b981");
    }

    // Safety zone wireframe lines simulation overlay
    if (activeLayers.safety && isStructural && child.isMesh && child.material) {
      child.material.wireframe = true;
      child.material.color = new THREE.Color("#e11d48");
    }
  });

  return <primitive object={clonedScene} />;
}

// --- PROCEDURAL ENGINEERING SKELETON ---
function ProceduralSkeleton({ bWidth, bLength, numFloors, activeLayers, viewMode }: { bWidth: number, bLength: number, numFloors: number, activeLayers: any, viewMode: string }) {
  if (!activeLayers.structural && viewMode !== "structural") return null;

  const floorHeight = 3;
  const colSpacing = 4.0;
  const cols = Math.floor(bWidth / colSpacing);
  const rows = Math.floor(bLength / colSpacing);
  
  const startX = -(cols * colSpacing) / 2;
  const startZ = -(rows * colSpacing) / 2;

  const columns = [];
  const beams = [];
  const slabs = [];
  const plumbing = [];
  const electrical = [];
  const hvac = [];
  const safety = [];
  const costProgress = [];

  for (let f = 0; f < numFloors; f++) {
    const y = f * floorHeight;
    
    // Safety Netting (perimeter)
    if (activeLayers.safety) {
      safety.push(
        <mesh key={`safety-${f}`} position={[0, y + floorHeight/2, 0]} castShadow>
          <boxGeometry args={[bWidth + 0.2, floorHeight, bLength + 0.2]} />
          <meshStandardMaterial color="#f97316" transparent opacity={0.3} wireframe />
        </mesh>
      );
      // Safety Cones on ground
      if (f === 0) {
        [[-bWidth/2-1, -bLength/2], [bWidth/2+1, -bLength/2]].forEach((pos, idx) => {
          safety.push(
            <mesh key={`cone-${idx}`} position={[pos[0], 0.2, pos[1]]} castShadow>
              <coneGeometry args={[0.2, 0.4, 8]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
          );
        });
      }
    }

    // Floor Slabs
    slabs.push(
      <mesh key={`slab-${f}`} position={[0, y + floorHeight, 0]} castShadow receiveShadow>
        <boxGeometry args={[bWidth - 0.2, 0.2, bLength - 0.2]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.8} />
      </mesh>
    );

    // Cost & Progress Labels (Floating above floor)
    if (activeLayers.cost || activeLayers.progress) {
      const isComplete = (f / numFloors) < 0.6; // Mock progress logic
      const costAmount = Math.floor(Math.random() * 50 + 10);
      
      costProgress.push(
        <group key={`label-${f}`} position={[0, y + floorHeight + 1.5, bLength/2 + 0.5]}>
          {activeLayers.progress && (
            <Text position={[-2, 0, 0]} fontSize={0.6} color={isComplete ? "#22c55e" : "#eab308"} anchorX="center" anchorY="middle">
              {isComplete ? "COMPLETED" : "IN PROGRESS"}
            </Text>
          )}
          {activeLayers.cost && (
            <Text position={[2, 0, 0]} fontSize={0.6} color="#38bdf8" anchorX="center" anchorY="middle">
              ₹{costAmount}L Est.
            </Text>
          )}
        </group>
      );
    }

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const cx = startX + i * colSpacing;
        const cz = startZ + j * colSpacing;
        
        // Vertical Columns
        const isProgressActive = activeLayers.progress;
        const colColor = isProgressActive ? (f < numFloors / 2 ? "#22c55e" : "#eab308") : "#64748b";
        
        columns.push(
          <mesh key={`col-${f}-${i}-${j}`} position={[cx, y + floorHeight / 2, cz]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.2, floorHeight, 8]} />
            <meshStandardMaterial color={colColor} roughness={0.7} metalness={0.2} />
          </mesh>
        );

        // MEP Layer Generation (running alongside columns/beams)
        
        // Plumbing (PVC Pipes - vertical)
        if (activeLayers.plumbing && i > 0 && i < cols && j > 0 && j < rows && i % 2 === 0 && j % 2 === 0) {
          plumbing.push(
            <mesh key={`plumb-vert-${f}-${i}-${j}`} position={[cx + 0.3, y + floorHeight / 2, cz + 0.3]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, floorHeight, 8]} />
              <meshStandardMaterial color="#0ea5e9" roughness={0.3} />
            </mesh>
          );
        }

        // Horizontal Beams X
        if (i < cols) {
          beams.push(
            <mesh key={`beamx-${f}-${i}-${j}`} position={[cx + colSpacing / 2, y + floorHeight - 0.1, cz]} castShadow receiveShadow>
              <boxGeometry args={[colSpacing, 0.3, 0.3]} />
              <meshStandardMaterial color={colColor} roughness={0.5} metalness={0.6} />
            </mesh>
          );
          
          // Electrical (Conduits along beams)
          if (activeLayers.electrical) {
            electrical.push(
              <mesh key={`elecx-${f}-${i}-${j}`} position={[cx + colSpacing / 2, y + floorHeight - 0.3, cz + 0.2]} castShadow rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.04, 0.04, colSpacing, 8]} />
                <meshStandardMaterial color="#facc15" roughness={0.5} />
              </mesh>
            );
          }
          
          // HVAC (Ducts along ceiling)
          if (activeLayers.hvac && j > 0 && j < rows && i % 2 === 0) {
             hvac.push(
              <mesh key={`hvacx-${f}-${i}-${j}`} position={[cx + colSpacing / 2, y + floorHeight - 0.5, cz]} castShadow>
                <boxGeometry args={[colSpacing, 0.4, 0.6]} />
                <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
              </mesh>
            );
          }
        }

        // Horizontal Beams Z
        if (j < rows) {
          beams.push(
            <mesh key={`beamz-${f}-${i}-${j}`} position={[cx, y + floorHeight - 0.1, cz + colSpacing / 2]} castShadow receiveShadow>
              <boxGeometry args={[0.3, 0.3, colSpacing]} />
              <meshStandardMaterial color={colColor} roughness={0.5} metalness={0.6} />
            </mesh>
          );
          
          // Plumbing (Horizontal pipes)
          if (activeLayers.plumbing && i > 0 && i < cols && j % 2 === 0) {
             plumbing.push(
              <mesh key={`plumb-horiz-${f}-${i}-${j}`} position={[cx + 0.3, y + floorHeight - 0.4, cz + colSpacing / 2]} castShadow rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.06, 0.06, colSpacing, 8]} />
                <meshStandardMaterial color="#0ea5e9" roughness={0.3} />
              </mesh>
            );
          }
        }
      }
    }
  }

  // Rooftop Water Tank (Plumbing)
  if (activeLayers.plumbing) {
    plumbing.push(
      <mesh key="water-tank" position={[0, numFloors * floorHeight + 1.5, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 2.5, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
    );
  }
  
  // Rooftop AC Chiller (HVAC)
  if (activeLayers.hvac) {
    hvac.push(
      <mesh key="chiller" position={[bWidth/4, numFloors * floorHeight + 1, bLength/4]} castShadow>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.7} />
      </mesh>
    );
  }

  return (
    <group>
      {/* Foundation Base */}
      <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[bWidth + 1, 0.4, bLength + 1]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      {columns}
      {beams}
      {slabs}
      {safety}
      {plumbing}
      {electrical}
      {hvac}
      {costProgress}
    </group>
  );
}

// --- ADVANCED HUMAN THINK DESIGN MODE: PROCEDURAL EXTERIOR ---
function ProceduralExterior({ bWidth, bLength, numFloors, activeLayers }: { bWidth: number, bLength: number, numFloors: number, activeLayers: any }) {
  const roofY = numFloors * 3.0 + 0.2; // Assuming floorHeight is 3.0
  
  return (
    <group>
      {/* Landscaping Layer: Gardens & Trees */}
      {activeLayers.landscaping && (
        <group>
          {/* Garden Grass */}
          <mesh position={[0, -0.14, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[bWidth + 8, bLength + 8]} />
            <meshStandardMaterial color="#16a34a" roughness={1} metalness={0} />
          </mesh>
          
          {/* Procedural Roads surrounding the plot */}
          <mesh position={[0, -0.13, (bLength / 2) + 7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
             <planeGeometry args={[bWidth + 24, 6]} />
             <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.12, (bLength / 2) + 7]} rotation={[-Math.PI / 2, 0, 0]}>
             <planeGeometry args={[bWidth + 24, 0.2]} />
             <meshStandardMaterial color="#eab308" />
          </mesh>
          
          <mesh position={[(bWidth / 2) + 7, -0.13, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} receiveShadow>
             <planeGeometry args={[bLength + 24, 6]} />
             <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>

          {/* Procedural Trees */}
          {[[-bWidth/2 - 2, -bLength/2 - 2], [bWidth/2 + 2, bLength/2 + 2], [-bWidth/2 - 2, bLength/2 + 2], [bWidth/2 + 2, -bLength/2 - 2], [bWidth/2 + 4, -bLength/2 - 4], [-bWidth/2 - 4, bLength/2 + 4]].map((pos, i) => (
            <group key={i} position={[pos[0], 0, pos[1]]}>
              <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.2, 0.3, 2]} />
                <meshStandardMaterial color="#5c3a21" roughness={0.9} />
              </mesh>
              <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                <sphereGeometry args={[1.5, 16, 16]} />
                <meshStandardMaterial color="#22c55e" roughness={0.8} />
              </mesh>
            </group>
          ))}

          {/* Swimming Pool (Universally requested) */}
          <group position={[0, -0.13, bLength/2 + 3]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[5, 3]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.8} transparent opacity={0.8} />
            </mesh>
            <mesh position={[0, 0.05, -1.6]} castShadow receiveShadow>
              <boxGeometry args={[5.2, 0.3, 0.2]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[0, 0.05, 1.6]} castShadow receiveShadow>
              <boxGeometry args={[5.2, 0.3, 0.2]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[-2.6, 0.05, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.2, 0.3, 3.4]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[2.6, 0.05, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.2, 0.3, 3.4]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          </group>

          {/* Parking & EV Charging Station */}
          <group position={[-bWidth/2 - 3, -0.13, -bLength/2]}>
            {/* Parking Concrete */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[4, 6]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.9} />
            </mesh>
            {/* Abstract Car */}
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.8, 0.6, 4]} />
              <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.4, 0.5, 2]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* EV Charger */}
            <mesh position={[-1.8, 0.5, -2]} castShadow receiveShadow>
              <boxGeometry args={[0.4, 1.0, 0.3]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[-1.8, 0.8, -1.8]} castShadow receiveShadow>
              <boxGeometry args={[0.2, 0.2, 0.1]} />
              <meshStandardMaterial color="#22c55e" emissive="#4ade80" emissiveIntensity={0.5} />
            </mesh>
          </group>
        </group>
      )}

      {/* Roof Elements: Solar Panels & Water Tank */}
      <group position={[0, roofY, 0]}>
        {/* Solar Panels Array */}
        {[[-2, -2], [2, -2], [-2, 2], [2, 2]].map((pos, i) => (
          <mesh key={`solar-${i}`} position={[pos[0], 0.3, pos[1]]} rotation={[-0.2, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.05, 2.5]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        {/* Support structures for solar */}
        {[[-2, -2], [2, -2], [-2, 2], [2, 2]].map((pos, i) => (
          <mesh key={`solar-base-${i}`} position={[pos[0], 0.15, pos[1]]} castShadow receiveShadow>
            <boxGeometry args={[1.0, 0.3, 2.0]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        ))}

        {/* Water Tank */}
        <mesh position={[bWidth/3, 1.0, bLength/3]} castShadow receiveShadow>
          <cylinderGeometry args={[1.0, 1.0, 2.0, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <mesh position={[bWidth/3, 2.1, bLength/3]} castShadow receiveShadow>
          <sphereGeometry args={[1.0, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
      </group>

    </group>
  );
}


// Fallback Live Preview mesh generator
function ProceduralBuilding({ formData, isPossible, viewMode, promptParams, activeFloor }: { 
  formData: Feasibility3DViewerProps["formData"], 
  isPossible: boolean, 
  viewMode: string,
  promptParams?: PromptParams,
  activeFloor?: string
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  const style = promptParams?.style || formData.style_selection || "Modern";
  const forceFlatRoof = promptParams?.force_flat_roof || false;
  const materialPref = promptParams?.material_override || formData.material_preference || "Concrete";

  const frontSetback = formData.road_width >= 10 ? 3.0 : 2.0;
  const parseNum = (val: any, fallback: number) => {
    const n = Number(val);
    return isNaN(n) || n <= 0 ? fallback : n;
  };

  const safeNumFloors = parseNum(formData.num_floors, 4);
  const safeLandWidth = parseNum(formData.land_width, 30);
  const safeLandLength = parseNum(formData.land_length, 35);

  const sideSetback = 1.5 + (0.5 * safeNumFloors);
  const backSetback = 2.0;
  
  const bLength = Math.max(2.0, safeLandLength - (frontSetback + backSetback));
  const bWidth = Math.max(2.0, safeLandWidth - (2 * sideSetback));
  
  const floorHeight = 3;
  const totalHeight = safeNumFloors * floorHeight;
  
  const isCinematic = promptParams?.isCinematic || false;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  if (!isPossible) {
    return (
      <group ref={groupRef}>
        <mesh position={[0, -0.05, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[safeLandWidth, safeLandLength]} />
          <meshStandardMaterial color="#27272a" />
        </mesh>
        <mesh position={[0, totalHeight / 2, 0]}>
          <boxGeometry args={[bWidth, totalHeight, bLength]} />
          <meshStandardMaterial color="#ef4444" wireframe />
        </mesh>
      </group>
    );
  }

  let wallColor = "#fafafa";
  let wallOpacity = 1.0;
  let wallTransparent = false;
  let wallMetalness = 0.0;
  let wallRoughness = 0.9;
  let wallWireframe = false;

  if (materialPref === "Wood") {
    wallColor = "#854d0e";
  } else if (materialPref === "Steel") {
    wallColor = "#4b5563";
    wallMetalness = 0.8;
    wallRoughness = 0.3;
  } else if (materialPref === "Glass") {
    wallColor = "#e0f2fe";
    wallOpacity = 0.4;
    wallTransparent = true;
    wallRoughness = 0.1;
    wallMetalness = 0.9;
  }

  if (viewMode === "furnished") {
    wallTransparent = true;
    wallOpacity = 0.25;
  } else if (viewMode === "structural") {
    wallTransparent = true;
    wallOpacity = 0.15;
    wallWireframe = true;
    wallColor = "#818cf8"; // Give wireframe an indigo tint
  }

  return (
    <group>
      {/* Base Grid Plane (Blueprint Look) */}
      <AnimatedAssembly isCinematic={isCinematic} delay={0.0}>
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[safeLandWidth + 30, safeLandLength + 30]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        <gridHelper args={[Math.max(safeLandWidth, safeLandLength) + 30, Math.max(safeLandWidth, safeLandLength) + 30, 0x38bdf8, 0x1e293b]} position={[0, -0.09, 0]} />
      </AnimatedAssembly>

      {/* Procedural Engineering Skeleton (Beams, Columns, Foundations) */}
      <AnimatedAssembly isCinematic={isCinematic} delay={0.5}>
        <ProceduralSkeleton 
          bWidth={bWidth} 
          bLength={bLength} 
          numFloors={safeNumFloors} 
          activeLayers={promptParams?.activeLayers || { structural: true }}
          viewMode={viewMode}
        />
      </AnimatedAssembly>

      {/* Main Architectural Shell (Walls/Glass) */}
      {(!promptParams?.activeLayers || promptParams.activeLayers.architectural) && viewMode !== "structural" && (
        <AnimatedAssembly isCinematic={isCinematic} delay={1.0}>
          <mesh position={[0, totalHeight / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[bWidth, totalHeight, bLength]} />
            <meshStandardMaterial 
              color={wallColor} 
              transparent={wallTransparent}
              opacity={wallOpacity}
              roughness={wallRoughness} 
              metalness={wallMetalness}
              wireframe={wallWireframe}
            />
          </mesh>
        </AnimatedAssembly>
      )}
      
      {/* Human Think Design Mode - Advanced Procedural Exterior */}
      <AnimatedAssembly isCinematic={isCinematic} delay={2.0}>
        <ProceduralExterior 
          bWidth={bWidth} 
          bLength={bLength} 
          numFloors={safeNumFloors}
          activeLayers={promptParams?.activeLayers || { landscaping: true, plumbing: true, structural: true }} 
        />
      </AnimatedAssembly>
    </group>
  );
}

// Camera Director Component to handle Orbit vs Walkthrough tours and Jumps
function CameraDirector({ cameraMode, focusedRoom, numFloors, bWidth, bLength, camDist }: {
  cameraMode: string;
  focusedRoom?: string;
  numFloors: number;
  bWidth: number;
  bLength: number;
  camDist: number;
}) {
  const { camera } = useThree();
  const floorHeight = 3;
  const totalHeight = numFloors * floorHeight;

  useFrame(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      if (cameraMode === "floorplan") {
        camera.fov = 40;
        camera.updateProjectionMatrix();
        camera.position.set(0, camDist * 1.2, 0);
        camera.lookAt(0, 0, 0);
      } 
      else if (cameraMode === "dollhouse") {
        camera.fov = 40;
        camera.updateProjectionMatrix();
        camera.position.set(bWidth * 1.3, totalHeight * 1.5, bLength * 1.3);
        camera.lookAt(0, totalHeight / 2, 0);
      }
      else if (cameraMode === "drone") {
        camera.fov = 40;
        camera.updateProjectionMatrix();
        const t = Date.now() * 0.0003;
        camera.position.set(Math.sin(t) * (camDist * 0.9), totalHeight + 10, Math.cos(t) * (camDist * 0.9));
        camera.lookAt(0, totalHeight / 2, 0);
      }
      else if (cameraMode === "walkthrough") {
        const t = (Date.now() * 0.0005) % (Math.PI * 2);
        const walkX = Math.sin(t) * (bWidth / 2.5);
        const walkY = 1.7 + (t > Math.PI ? floorHeight : 0); // Lock to 1.7m (human height)
        const walkZ = Math.cos(t) * (bLength / 2.5);
        
        camera.fov = 65; // Human Eye FOV
        camera.updateProjectionMatrix();
        
        camera.position.set(walkX, walkY, walkZ);
        camera.lookAt(Math.sin(t + 0.15) * (bWidth / 2.5), walkY, Math.cos(t + 0.15) * (bLength / 2.5));
      }
      else if (cameraMode === "room" && focusedRoom) {
        camera.fov = 65;
        camera.updateProjectionMatrix();
        
        if (focusedRoom === "kitchen") {
          camera.position.set(-bWidth/3, 1.7, bLength/3 + 3.0);
          camera.lookAt(-bWidth/3, 1.7, bLength/3);
        } else if (focusedRoom === "living") {
          camera.position.set(0, 1.7, 3.5);
          camera.lookAt(0, 1.7, 0);
        } else if (focusedRoom === "bedroom") {
          camera.position.set(bWidth/4, floorHeight + 1.7, bLength/4 + 3.0);
          camera.lookAt(bWidth/4, floorHeight + 1.7, bLength/4);
        } else if (focusedRoom === "terrace") {
          camera.position.set(0, totalHeight + 1.7, 7.0);
          camera.lookAt(0, totalHeight + 1.7, 0);
        }
      }
    }
  });

  return null;
}

export default function Feasibility3DViewer({ formData, analysisResult, viewMode, focusedRoom, onViewModeChange }: Feasibility3DViewerProps) {
  const parseNum = (val: any, fallback: number) => {
    const n = Number(val);
    return isNaN(n) || n <= 0 ? fallback : n;
  };
  const safeNumFloors = parseNum(formData?.num_floors, 4);
  const safeLandWidth = parseNum(formData?.land_width, 30);
  const safeLandLength = parseNum(formData?.land_length, 35);

  const isPossible = analysisResult ? analysisResult.is_possible : true;
  const maxDim = Math.max(safeLandWidth, safeLandLength);
  const camDist = Math.max(25, maxDim * 1.4);

  // Time of Day Slider State
  const { sunHour, setSunHour, activeFloor, setActiveFloor, cameraMode, setCameraMode, activeLayers, toggleLayer, setLayers } = useAeroTwinStore();
  const [dpr, setDpr] = useState(1.5);

  // Fullscreen Mode State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Advanced Visual Mode State (BIM, Splat, Real 360, Diagram)
  const [localVisualMode, setLocalVisualMode] = useState<"bim" | "splat" | "real" | "diagram">("bim");

  // Cinematic State
  const [isCinematic, setIsCinematic] = useState(false);

  // Voice Speech Command states
  const [isListening, setIsListening] = useState(false);
  const [voiceNotification, setVoiceNotification] = useState("");

  const [localFocusedRoom, setLocalFocusedRoom] = useState<string | undefined>(focusedRoom);

  // Listen to parent focused room clicks
  useEffect(() => {
    if (focusedRoom) {
      setLocalFocusedRoom(focusedRoom);
      setCameraMode("room");
    }
  }, [focusedRoom]);

  // 12 Live Layers Toggle Controls state (now from store)

  const promptParams = useMemo<PromptParams | undefined>(() => {
    if (!analysisResult?.three_d_params) return undefined;
    return analysisResult.three_d_params;
  }, [analysisResult]);

  // Compute dynamic sunlight angle, intensity, and color based on sunHour
  const sunLight = useMemo(() => {
    const angle = ((sunHour - 6) / 12) * Math.PI;
    const x = Math.cos(angle) * 35;
    const y = Math.sin(angle) * 35;
    const z = 15;
    
    let color = "#ffffff";
    let intensity = 1.5;
    let ambient = 0.65;
    
    if (sunHour < 10) {
      color = "#fdbb2d"; // Sunrise golden light
      intensity = 0.95;
      ambient = 0.5;
    } else if (sunHour > 16 && sunHour < 19) {
      color = "#f97316"; // Sunset deep orange
      intensity = 0.8;
      ambient = 0.4;
    } else if (sunHour >= 19) {
      color = "#38bdf8"; // Night moonlight
      intensity = 0.15;
      ambient = 0.1;
    }
    
    return { pos: [x, y, z] as [number, number, number], color, intensity, ambient };
  }, [sunHour]);

  const frontSetback = formData.road_width >= 10 ? 3.0 : 2.0;


  const sideSetback = 1.5 + (0.5 * safeNumFloors);
  const bWidth = Math.max(2.0, safeLandWidth - (2 * sideSetback));
  const bLength = Math.max(2.0, safeLandLength - (frontSetback + 2.0));

  // Speech Recognition hook trigger
  const startVoiceCommand = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      setVoiceNotification("🎙️ Listening for layout command...");
    };
    
    recognition.onerror = () => {
      setIsListening(false);
      setVoiceNotification("⚠️ Voice unrecognized. Try again.");
      setTimeout(() => setVoiceNotification(""), 3000);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setVoiceNotification(`🗣️ Matched: "${transcript}"`);
      setTimeout(() => setVoiceNotification(""), 4000);
      
      // 1. Daylight control voice bindings
      if (transcript.includes("morning") || transcript.includes("day time")) {
        setSunHour(10);
      } else if (transcript.includes("noon")) {
        setSunHour(12);
      } else if (transcript.includes("sunset") || transcript.includes("evening")) {
        setSunHour(18);
      } else if (transcript.includes("night") || transcript.includes("dark")) {
        setSunHour(21);
      }
      
      // 2. Camera views voice bindings
      if (transcript.includes("orbit")) {
        setCameraMode("orbit");
      } else if (transcript.includes("dollhouse")) {
        setCameraMode("dollhouse");
      } else if (transcript.includes("floor plan") || transcript.includes("plan view") || transcript.includes("2d")) {
        setCameraMode("floorplan");
      } else if (transcript.includes("drone")) {
        setCameraMode("drone");
      } else if (transcript.includes("walkthrough") || transcript.includes("first person") || transcript.includes("walk")) {
        setCameraMode("walkthrough");
      }
      
      // 3. Floor isolation bindings
      if (transcript.includes("ground floor") || transcript.includes("floor 0")) {
        setActiveFloor("0");
      } else if (transcript.includes("first floor") || transcript.includes("floor 1")) {
        setActiveFloor("1");
      } else if (transcript.includes("second floor") || transcript.includes("floor 2")) {
        setActiveFloor("2");
      } else if (transcript.includes("all floors") || transcript.includes("entire building")) {
        setActiveFloor("all");
      }
      
      // 4. Mode view overrides
      if (transcript.includes("architectural") || transcript.includes("architecture")) {
        if (onViewModeChange) onViewModeChange("architectural");
      } else if (transcript.includes("structural") || transcript.includes("structure")) {
        if (onViewModeChange) onViewModeChange("structural");
      } else if (transcript.includes("furnished") || transcript.includes("furniture") || transcript.includes("interior")) {
        if (onViewModeChange) onViewModeChange("furnished");
      }

      // 5. Live Layers voice mappings
      const toggleMatch = (name: string, keyword: string) => {
        if (transcript.includes(`show ${keyword}`) || transcript.includes(`enable ${keyword}`)) {
          setLayers({ ...activeLayers, [name]: true });
        } else if (transcript.includes(`hide ${keyword}`) || transcript.includes(`disable ${keyword}`)) {
          setLayers({ ...activeLayers, [name]: false });
        } else if (transcript.includes(`toggle ${keyword}`)) {
          toggleLayer(name);
        }
      };
      
      toggleMatch("structural", "structural");
      toggleMatch("structural", "structure");
      toggleMatch("architectural", "architectural");
      toggleMatch("architectural", "architecture");
      toggleMatch("electrical", "electrical");
      toggleMatch("electrical", "power");
      toggleMatch("plumbing", "plumbing");
      toggleMatch("hvac", "hvac");
      toggleMatch("hvac", "ventilation");
      toggleMatch("lighting", "lighting");
      toggleMatch("lighting", "lights");
      toggleMatch("furniture", "furniture");
      toggleMatch("furniture", "interior");
      toggleMatch("landscaping", "landscaping");
      toggleMatch("landscaping", "landscape");
      toggleMatch("safety", "safety");
      toggleMatch("cost", "cost");
      toggleMatch("cost", "heatmap");
      toggleMatch("materials", "materials");
      toggleMatch("progress", "progress");
      
      // 6. Screen bounds
      if (transcript.includes("fullscreen") || transcript.includes("full screen")) {
        setIsFullscreen(true);
      } else if (transcript.includes("exit") || transcript.includes("close fullscreen")) {
        setIsFullscreen(false);
      }
    };
    
    recognition.start();
  };

  // Style helper for fullscreen wrapper
  const containerStyle: React.CSSProperties = isFullscreen ? {
    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
    zIndex: 9999, background: "var(--bg-base)", transition: "all 0.3s ease"
  } : {
    width: "100%", height: "580px", borderRadius: "12px", overflow: "hidden",
    background: "var(--bg-surface)",
    position: "relative", border: "1px solid var(--border)", transition: "all 0.3s ease",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
  };

  return (
    <div style={containerStyle}>
      
      {/* UNIFIED TOP BAR: HUD + View Options + Controls */}
      <div className="glass-panel" style={{ position: "absolute", top: 12, left: 12, right: 12, zIndex: 10, padding: "0.5rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "16px" }}>
        
        {/* Left: HUD + Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 6, height: 16, borderRadius: "4px", background: "var(--accent-cyan)" }} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 700 }}>AeroTwin</span>
              <span style={{ fontSize: "0.95rem", fontWeight: 700 }}>HUD</span>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "6px", marginLeft: "12px" }}>
            {[
              { id: "bim", label: "3D BIM Model" },
              { id: "splat", label: "Gaussian Splat (AI)" },
              { id: "real", label: "Real 360°" },
              { id: "diagram", label: "Diagram/Layout" }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setLocalVisualMode(mode.id as any)}
                className={`tab-pill ${localVisualMode === mode.id ? "active" : ""}`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Floor:</span>
            <select 
              value={activeFloor} 
              onChange={(e) => setActiveFloor(e.target.value)}
              className="sidebar-btn" style={{ padding: "0 0.5rem", fontSize: "0.85rem", color: "var(--text-primary)" }}
            >
              <option value="all">All Floors</option>
              {Array.from({ length: formData.num_floors }).map((_, idx) => (
                <option key={idx} value={idx}>{idx === 0 ? "Ground Floor" : `Floor G+${idx}`}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Voice Status Alert Notification Banner */}
      {voiceNotification && (
        <div style={{
          position: "absolute", bottom: 85, right: 15, zIndex: 11,
          background: "var(--bg-glass)", border: "1px solid var(--border-focus)",
          borderRadius: "8px", padding: "0.6rem 1rem", display: "flex", flexDirection: "column", gap: "6px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)", animation: "pulse 2s infinite"
        }}>
          {voiceNotification}
        </div>
      )}

      {/* Floating Mic Button */}
      <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 12 }}>
        <button onClick={startVoiceCommand} className={`btn ${isListening ? "animate-pulse" : ""}`} style={{
          width: 56, height: 56, borderRadius: 28, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", 
          display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
          border: "2px solid rgba(255,255,255,0.2)",
          boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)", cursor: "pointer", color: "white"
        }} title="Voice Control">
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
      </div>

      {/* Bottom Overlay: 12 Layers switches */}
      <div className="glass-panel" style={{ position: "absolute", bottom: 12, left: 12, right: 90, zIndex: 10, padding: "1rem", display: "flex", flexDirection: "column", gap: "12px", borderRadius: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: "600" }}>
          <Layers size={18} className="text-cyan" /> 12 Live Layer Switches:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
          {Object.entries(activeLayers).map(([layer, active]) => (
            <button
              key={layer}
              onClick={() => toggleLayer(layer)}
              className={`filter-chip ${active ? "active-" + layer.toLowerCase() : ""}`}
            >
              {layer.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Camera Mode controls */}
      <div className="glass-panel" style={{ position: "absolute", top: 85, left: 12, zIndex: 10, padding: "1rem", display: "flex", flexDirection: "column", gap: "12px", width: "210px", borderRadius: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600", marginBottom: "4px" }}>
          <Video size={16} className="text-cyan" /> Camera Mode
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { id: "orbit", label: "Orbit View" },
            { id: "dollhouse", label: "Dollhouse" },
            { id: "floorplan", label: "2D Plan" },
            { id: "drone", label: "Drone View" },
            { id: "walkthrough", label: "FPV Walkthrough" }
          ].map(cam => (
            <button
              key={cam.id}
              onClick={() => setCameraMode(cam.id as any)}
              className={`sidebar-btn ${cameraMode === cam.id ? "active" : ""}`}
              style={{ padding: "0.6rem 1rem", fontSize: "0.85rem", borderRadius: "8px" }}
            >
              {cam.label}
            </button>
          ))}
        </div>

        {/* Room Jump dropdown */}
        {cameraMode === "room" && (
          <select 
            value={localFocusedRoom} 
            onChange={(e) => setLocalFocusedRoom(e.target.value)}
            className="form-input" 
            style={{ fontSize: "0.75rem", padding: "0.4rem", marginTop: "8px" }}
          >
            <option value="living">Living Room</option>
            <option value="kitchen">Kitchen</option>
            <option value="bedroom">Master Bed</option>
            <option value="terrace">Rooftop</option>
          </select>
        )}

        <button 
          onClick={() => {
            setIsCinematic(false);
            setSunHour(8); // Start morning
            setTimeout(() => { setIsCinematic(true); setCameraMode("orbit"); }, 100);
          }} 
          className="btn btn-primary" 
          style={{ marginTop: "8px", padding: "0.5rem", fontSize: "0.8rem", borderRadius: "8px", width: "100%", justifyContent: "center" }}
        >
          <Play size={14} /> Play Cinematic Build
        </button>

        {/* Time of Day / Sunlight Slider */}
        <div style={{ marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <span>Time of Day</span>
            <span>{sunHour}:00</span>
          </div>
          <input 
            type="range" 
            min="6" max="22" 
            value={sunHour} 
            onChange={(e) => setSunHour(parseInt(e.target.value))} 
            style={{ width: "100%", accentColor: "var(--accent-cyan)" }}
          />
        </div>
      </div>

      <Canvas camera={{ position: [camDist, formData.num_floors * 4 + 10, camDist], fov: 40 }} shadows dpr={dpr}>
        <PerformanceMonitor onIncline={() => setDpr(1.5)} onDecline={() => setDpr(1)} />
        
        {/* Dynamic Sunlight based on Time of Day */}
        <ambientLight intensity={sunLight.ambient} color={sunHour >= 19 ? "#020617" : "#ffffff"} />
        <directionalLight 
          position={sunLight.pos} 
          intensity={sunLight.intensity} 
          color={sunLight.color} 
          castShadow 
          shadow-bias={-0.0005}
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048} 
        />

        <CameraDirector 
          cameraMode={cameraMode} 
          focusedRoom={localFocusedRoom} 
          numFloors={formData.num_floors} 
          bWidth={bWidth} 
          bLength={bLength} 
          camDist={camDist} 
        />

        <Suspense fallback={
          <ProceduralBuilding formData={formData} isPossible={isPossible} viewMode={viewMode} promptParams={{ ...promptParams, isCinematic } as any} activeFloor={activeFloor} />
        }>
          {localVisualMode === "bim" && (
            promptParams?.glb_url ? (
              <AnimatedAssembly isCinematic={isCinematic} delay={1.0}>
                <GLBModel 
                  url={promptParams.glb_url} 
                  activeLayers={activeLayers} 
                  viewMode={viewMode} 
                  dollhouseMode={cameraMode === "dollhouse"} 
                  sunHour={sunHour}
                  activeFloor={activeFloor}
                  numFloors={formData.num_floors}
                />
              </AnimatedAssembly>
            ) : (
              <ProceduralBuilding formData={formData} isPossible={isPossible} viewMode={viewMode} promptParams={{ ...promptParams, sunHour, activeLayers, isCinematic } as any} activeFloor={activeFloor} />
            )
          )}

          {localVisualMode === "splat" && (
             <group>
               <Splat src="https://huggingface.co/datasets/dylanebert/3d-splats/resolve/main/shoe_0.splat" position={[0, 1, 0]} rotation={[0, Math.PI, 0]} scale={2} />
               <Html position={[0, 3, 0]} center>
                 <div className="bg-purple-900/80 border border-purple-500/50 px-3 py-1 rounded text-purple-300 text-xs font-bold backdrop-blur-sm flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                   Higgsfield MCP AI Render
                 </div>
               </Html>
             </group>
          )}

          {localVisualMode === "real" && (
             <group>
               <Environment background preset="park" blur={0.01} />
               <Html position={[0, 0, -5]} center>
                 <div className="bg-green-900/80 border border-green-500/50 px-3 py-1 rounded text-green-300 text-xs font-bold backdrop-blur-sm flex items-center gap-2">
                   <Video size={14} /> Site Camera 360° View
                 </div>
               </Html>
             </group>
          )}

          {localVisualMode === "diagram" && (
             <group>
                <ProceduralBuilding formData={formData} isPossible={isPossible} viewMode="structural" promptParams={{ ...promptParams, sunHour, activeLayers, isCinematic } as any} activeFloor={activeFloor} />
             </group>
          )}
        </Suspense>
        
        {/* Real-time Equipment Twin */}
        <EquipmentTwin3D isCinematic={isCinematic} activeLayers={activeLayers} />
        
        <BakeShadows />

        {cameraMode === "orbit" && (
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} maxPolarAngle={Math.PI / 2 - 0.05} />
        )}
        
        <Environment preset={sunHour >= 19 ? "night" : "city"} />
        <ContactShadows position={[0, -0.05, 0]} opacity={0.65} scale={85} blur={2.2} far={15} />

        {/* Cinematic Post-Processing Pipeline */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={1.5} />
          <SSAO samples={21} radius={10} intensity={20} luminanceInfluence={0.6} />
        </EffectComposer>

        {/* Navigation Compass (Drag, Up, Down, Left, Right) */}
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport axisColors={["#ef4444", "#84cc16", "#3b82f6"]} labelColor="white" />
        </GizmoHelper>
      </Canvas>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}} />
    </div>
  );
}
