"use client";

import React, { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Environment, RoundedBox, MeshReflectorMaterial, SpotLight, PerformanceMonitor, BakeShadows } from "@react-three/drei";
import { EffectComposer, DepthOfField, Bloom, Vignette, N8AO } from "@react-three/postprocessing";
import * as THREE from "three";
import { Moon, Sun, Eye, EyeOff, RotateCcw, Layers, Building2, Camera } from "lucide-react";

// ──────────────────────────────────
// PBR MATERIAL HELPERS
// ──────────────────────────────────
const MATERIALS = {
  concrete:   { color: "#7a8794", roughness: 0.95, metalness: 0.05 },
  darkSteel:  { color: "#1e293b", roughness: 0.2,  metalness: 0.9 },
  wood:       { color: "#5c3a21", roughness: 0.85, metalness: 0.0 },
  greenGrass: { color: "#15803d", roughness: 0.95, metalness: 0.0 },
  water:      { color: "#38bdf8", roughness: 0.0,  metalness: 1.0, transparent: true, opacity: 0.8 },
  plinth:     { color: "#1e293b", roughness: 0.45, metalness: 0.25 },
  panel:      { color: "#0f172a", roughness: 0.15, metalness: 0.85 },
  white:      { color: "#f1f5f9", roughness: 0.8,  metalness: 0.0 },
  solar:      { color: "#0f172a", roughness: 0.1,  metalness: 0.95 },
  marble:     { color: "#e2e8f0", roughness: 0.1,  metalness: 0.1 },
};

// Rounded box for exterior edge highlights (Expensive)
function B({ p, s, mat = "concrete", op, em, ei = 0, rot, radius = 0.02 }: any) {
  const m = MATERIALS[mat as keyof typeof MATERIALS] || MATERIALS.concrete;
  return (
    <RoundedBox position={p} rotation={rot ?? [0, 0, 0]} args={s} radius={radius} smoothness={2} castShadow receiveShadow>
      <meshStandardMaterial {...m} transparent={(m as any).transparent || (op !== undefined && op < 1)} opacity={op ?? (m as any).opacity ?? 1} emissive={em ?? "#000"} emissiveIntensity={ei} />
    </RoundedBox>
  );
}

// Standard box for interior details (Fast)
function FastB({ p, s, mat = "concrete", op, em, ei = 0, rot }: any) {
  const m = MATERIALS[mat as keyof typeof MATERIALS] || MATERIALS.concrete;
  return (
    <mesh position={p} rotation={rot ?? [0, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial {...m} transparent={(m as any).transparent || (op !== undefined && op < 1)} opacity={op ?? (m as any).opacity ?? 1} emissive={em ?? "#000"} emissiveIntensity={ei} />
    </mesh>
  );
}

function Cyl({ p, args, mat = "concrete", rot }: any) {
  const m = MATERIALS[mat as keyof typeof MATERIALS] || MATERIALS.concrete;
  return (
    <mesh position={p} rotation={rot ?? [0, 0, 0]} castShadow receiveShadow>
      <cylinderGeometry args={args} />
      <meshStandardMaterial {...m} />
    </mesh>
  );
}

function Sph({ p, r, mat = "greenGrass" }: any) {
  const m = MATERIALS[mat as keyof typeof MATERIALS] || MATERIALS.concrete;
  return (
    <mesh position={p} castShadow receiveShadow>
      <sphereGeometry args={[r, 24, 24]} />
      <meshStandardMaterial {...m} />
    </mesh>
  );
}

function Plane({ p, s, mat = "marble", rot, op }: any) {
  const m = MATERIALS[mat as keyof typeof MATERIALS] || MATERIALS.marble;
  return (
    <mesh position={p} rotation={rot ?? [-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={s} />
      <meshStandardMaterial {...m} transparent={(m as any).transparent || (op !== undefined && op < 1)} opacity={op ?? (m as any).opacity ?? 1} />
    </mesh>
  );
}

// ──────────────────────────────────
// GLASS WALL – Highly reflective physical glass
// ──────────────────────────────────
function GlassWall({ p, s, rot, night }: any) {
  return (
    <mesh position={p} rotation={rot ?? [0, 0, 0]} castShadow>
      <boxGeometry args={s} />
      <meshPhysicalMaterial
        color="#bfdbfe"
        transparent opacity={0.15}
        roughness={0.05} metalness={0.2}
        transmission={0.9} ior={1.5} reflectivity={1.0}
        thickness={0.05}
        emissive={night ? "#fef3c7" : "#ffffff"}
        emissiveIntensity={night ? 0.2 : 0.02}
      />
    </mesh>
  );
}

// ──────────────────────────────────
// OFFICE FLOOR INTERIOR
// ──────────────────────────────────
function OfficeFloor({ y, bW, bL, night }: any) {
  const desks = useMemo(() => {
    const out: { x: number; z: number }[] = [];
    for (let c = 0; c < 4; c++) for (let r = 0; r < 3; r++)
      out.push({ x: -bW * 0.34 + c * bW * 0.23, z: -bL * 0.26 + r * bL * 0.27 });
    return out;
  }, [bW, bL]);

  return (
    <group position={[0, y, 0]}>
      {/* Floor & ceiling */}
      <B p={[0, 0.09, 0]} s={[bW - 0.6, 0.18, bL - 0.6]} mat="white" radius={0.01} />
      <B p={[0, 3.05, 0]} s={[bW - 0.6, 0.08, bL - 0.6]} mat="white" radius={0.01} />
      {/* LED ceiling strip */}
      <B p={[0, 3.02, 0]} s={[bW * 0.5, 0.03, 0.3]} mat="white" em="#fef9c3" ei={night ? 4 : 0.8} />
      {night && <pointLight position={[0, 2.7, 0]} color="#fef9c3" intensity={2} distance={10} />}

      {/* Desks */}
      {desks.map((d, i) => (
        <group key={i} position={[d.x, 0, d.z]}>
          <FastB p={[0, 0.78, 0]} s={[1.25, 0.05, 0.65]} mat="white" />
          <FastB p={[-0.56, 0.39, 0]} s={[0.04, 0.76, 0.62]} mat="panel" />
          <FastB p={[ 0.56, 0.39, 0]} s={[0.04, 0.76, 0.62]} mat="panel" />
          {/* Monitor */}
          <FastB p={[0, 1.18, -0.2]} s={[0.5, 0.34, 0.04]} mat="panel" em="#0ea5e9" ei={night ? 2.5 : 0.8} />
          <FastB p={[0, 0.92, -0.18]} s={[0.04, 0.26, 0.04]} mat="darkSteel" />
          {/* Chair */}
          <Cyl p={[0, 0.44, 0.5]} args={[0.23, 0.23, 0.07, 16]} mat="panel" />
          <FastB p={[0, 0.78, 0.62]} s={[0.36, 0.44, 0.07]} mat="panel" />
          {/* Human */}
          <Cyl p={[0, 0.5, 0.5]} args={[0.09, 0.09, 0.55, 8]} mat="panel" />
          <Sph p={[0, 0.92, 0.5]} r={0.11} mat="concrete" />
        </group>
      ))}

      {/* Conference table */}
      <FastB p={[0, 0.7, 0]} s={[2.6, 0.07, 1.1]} mat="wood" />
      {[-0.85, 0, 0.85].map((x, i) => <Cyl key={i} p={[x, 0.35, 0]} args={[0.05, 0.05, 0.7, 8]} mat="darkSteel" />)}
    </group>
  );
}

// ──────────────────────────────────
// ROOFTOP GARDEN
// ──────────────────────────────────
function Rooftop({ y, bW, bL }: any) {
  return (
    <group position={[0, y, 0]}>
      <B p={[0, 0.14, 0]} s={[bW, 0.28, bL]} mat="concrete" radius={0.05} />
      {/* Green beds */}
      {[[-bW*0.28,-bL*0.22],[bW*0.22,bL*0.18],[-bW*0.08,bL*0.3]].map(([x,z],i)=>(
        <B key={i} p={[x,0.34,z]} s={[bW*0.2,0.2,bL*0.2]} mat="greenGrass" radius={0.05} />
      ))}
      {/* Shrubs on roof */}
      {[[-bW*0.15,0.5,-bL*0.35],[bW*0.3,0.5,bL*0.3],[-bW*0.3,0.5,bL*0.22]].map(([x,y2,z],i)=>(
        <Sph key={i} p={[x,y2,z]} r={0.38} mat="greenGrass" />
      ))}
      {/* Solar panels */}
      {[0,1,2,3,4,5].map(i=>(
        <B key={i} p={[-bW*0.3+i*(bW*0.12),0.52,bL*0.28]} s={[bW*0.1,0.05,bL*0.1]} mat="solar" rot={[-0.28,0,0]} radius={0.01} em="#0ea5e9" ei={0.8} />
      ))}
      {/* Roof pool */}
      <B p={[bW*0.28,0.25,-bL*0.3]} s={[bW*0.22,0.15,bL*0.16]} mat="panel" radius={0.02} />
      <Plane p={[bW*0.28,0.34,-bL*0.3]} s={[bW*0.21,bL*0.15]} mat="water" />
      {/* Parapet */}
      {[[0,bL/2+0.15],[0,-bL/2-0.15]].map(([x,z],i)=><B key={i} p={[x,0.72,z]} s={[bW+0.4,1.05,0.22]} mat="white" radius={0.03} />)}
      {[[-bW/2-0.15,0],[bW/2+0.15,0]].map(([x,z],i)=><B key={i} p={[x,0.72,z]} s={[0.22,1.05,bL+0.4]} mat="white" radius={0.03} />)}
    </group>
  );
}

// ──────────────────────────────────
// ANIMATED FOUNTAIN
// ──────────────────────────────────
function Fountain({ x, z }: any) {
  const jetRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (jetRef.current) jetRef.current.scale.y = 1 + 0.2 * Math.sin(clock.elapsedTime * 4);
  });
  return (
    <group position={[x, 0, z]}>
      <Cyl p={[0, 0.12, 0]} args={[1.5, 1.7, 0.24, 32]} mat="concrete" />
      <Plane p={[0, 0.25, 0]} s={[2.8, 2.8]} mat="water" />
      <mesh ref={jetRef} position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.08, 0.85, 12]} />
        <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.65} roughness={0.0} transmission={0.9} ior={1.33} />
      </mesh>
      <Sph p={[0, 1.05, 0]} r={0.09} mat="water" />
    </group>
  );
}

// ──────────────────────────────────
// TREE
// ──────────────────────────────────
function Tree({ x, z, h = 5, r = 1.9, c = "#15803d" }: any) {
  return (
    <group position={[x, 0, z]}>
      <Cyl p={[0, h/2, 0]} args={[0.15, 0.22, h, 8]} mat="wood" />
      <mesh position={[0, h + r*0.55, 0]} castShadow receiveShadow>
        <sphereGeometry args={[r, 24, 24]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────
// FULL BUILDING SCENE
// ──────────────────────────────────
function Scene({ cfg, night, xray, interiors }: any) {
  const { bW, bL, nF, fH } = cfg;
  const totalH = nF * fH;

  return (
    <group>
      {/* ── MUSEUM GALLERY FLOOR (Highly Reflective) ── */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[bW+60, bL+60]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={256} // Reduced from 1024 for massive speedup
          mixBlur={1}
          mixStrength={80}
          roughness={0.15}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#334155"
          metalness={0.5}
          mirror={1}
        />
      </mesh>
      
      {/* Gallery back wall (bokeh effect base) */}
      <B p={[0, totalH * 0.6, -(bL/2 + 25)]} s={[bW+60, totalH+10, 0.5]} mat="concrete" op={0.2} />

      {/* ── CONCRETE DISPLAY PLINTH ── */}
      <B p={[0, -0.22, 0]}  s={[bW+3.5, 0.3, bL+3.5]}  mat="plinth" radius={0.05} />
      <B p={[0, -0.38, 0]}  s={[bW+5.5, 0.18, bL+5.5]} mat="plinth" radius={0.05} />
      <B p={[0, -0.50, 0]}  s={[bW+7, 0.12, bL+7]}     mat="plinth" radius={0.05} />

      {/* ── GROUND LANDSCAPE AROUND BUILDING ── */}
      <B p={[0, 0.01, 0]} s={[bW+1, 0.05, bL+1]} mat="marble" radius={0.01} />
      <B p={[0, 0.02, bL/2+6]} s={[bW+12, 0.05, 10]} mat="marble" radius={0.01} op={0.9} />

      {/* ── COLUMNS & STRUCTURAL CORE ── */}
      <B p={[0, totalH/2, 0]} s={[bW*0.16, totalH+0.1, bL*0.16]} mat="concrete" radius={0.08} />
      {[
        [-bW/2+0.2, bL/2-0.2],[bW/2-0.2, bL/2-0.2],
        [-bW/2+0.2,-bL/2+0.2],[bW/2-0.2,-bL/2+0.2],
        [0, bL/2-0.2],[0,-bL/2+0.2],
        [-bW/2+0.2, 0],[bW/2-0.2, 0],
      ].map(([cx,cz],i)=>(
        <B key={i} p={[cx,totalH/2,cz]} s={[0.4,totalH+0.2,0.4]} mat="concrete" radius={0.05} />
      ))}

      {/* ── FLOOR SLABS ── */}
      {Array.from({length:nF+1}).map((_,i)=>(
        <B key={i} p={[0,i*fH+0.08,0]} s={[bW+0.28,0.16,bL+0.28]} mat="concrete" radius={0.04} />
      ))}

      {/* ── GLASS CURTAIN WALLS ── */}
      {Array.from({length:nF}).map((_,fl)=>{
        const y=fl*fH+fH/2;
        return (
          <group key={fl}>
            <GlassWall p={[0,y,bL/2+0.01]}  s={[bW,fH-0.18,0.07]} night={night} />
            <GlassWall p={[0,y,-bL/2-0.01]} s={[bW,fH-0.18,0.07]} night={night} />
            <GlassWall p={[bW/2+0.01,y,0]}  s={[0.07,fH-0.18,bL]} night={night} rot={[0,Math.PI/2,0]} />
            <GlassWall p={[-bW/2-0.01,y,0]} s={[0.07,fH-0.18,bL]} night={night} rot={[0,Math.PI/2,0]} />
          </group>
        );
      })}

      {/* Spandrel bands */}
      {Array.from({length:nF}).map((_,fl)=>(
        <B key={fl} p={[0,fl*fH-0.07,0]} s={[bW+0.12,0.32,bL+0.12]} mat="concrete" radius={0.03} op={xray?0.18:1} />
      ))}

      {/* ── INTERIOR FLOORS ── */}
      {interiors && Array.from({length:nF}).map((_,fl)=>(
        <OfficeFloor key={fl} y={fl*fH+0.18} bW={bW} bL={bL} night={night} />
      ))}

      {/* ── FACADE VERTICAL FINS ── */}
      {[-bW*0.32,-bW*0.1,bW*0.1,bW*0.32].map((x,i)=>(
        <B key={i} p={[x,totalH/2,bL/2+0.22]} s={[0.14,totalH*0.88,0.52]} mat="darkSteel" radius={0.02} />
      ))}

      {/* ── ENTRY CANOPY ── */}
      <B p={[0,3.8,bL/2+2.8]} s={[bW*0.46,0.14,5.2]} mat="darkSteel" radius={0.03} />
      {[-bW*0.2,bW*0.2].map((x,i)=>(
        <Cyl key={i} p={[x,1.9,bL/2+5.1]} args={[0.08,0.08,3.8,16]} mat="darkSteel" />
      ))}

      {/* ── ROOFTOP ── */}
      <Rooftop y={totalH+0.28} bW={bW} bL={bL} />

      {/* ── REFLECTING POOL (side) ── */}
      <B p={[-(bW/2+5),0.0,0]} s={[5.2,0.28,bL+5]} mat="panel" radius={0.05} />
      <Plane p={[-(bW/2+5),0.15,0]} s={[5.0,bL+4.8]} mat="water" />
      {night && <pointLight position={[-(bW/2+5),0.1,0]} color="#0ea5e9" intensity={3} distance={12} />}

      {/* ── FOUNTAINS ── */}
      <Fountain x={bW/2+5} z={bL*0.28} />
      <Fountain x={bW/2+5} z={-bL*0.28} />

      {/* ── LANDSCAPING ── */}
      <Tree x={-bW/2-4}  z={-bL/2-3}  h={6.5} r={2.3} c="#166534" />
      <Tree x={-bW/2-3}  z={ bL/2+6}  h={7}   r={2.6} c="#14532d" />
      <Tree x={ bW/2+9}  z={-bL/2-4}  h={8}   r={2.8} c="#15803d" />
      <Tree x={ bW/2+9}  z={ bL/2+5}  h={6}   r={2.1} c="#166534" />
      <Tree x={ 0}       z={-(bL/2+7)}h={5.5} r={2.0} c="#16a34a" />
      <Tree x={-bW/2-5}  z={ bL*0.15} h={7}   r={2.4} c="#15803d" />
      <Tree x={-bW/2-5}  z={-bL*0.15} h={6.5} r={2.2} c="#166534" />
      {[[-2.5,bL/2+2],[3,bL/2+1.8],[bW/2+2,bL/2+2],[bW/2+2,-bL/2-2],[-bW/2-2,bL*0.2],[-bW/2-2,-bL*0.2]].map(([x,z],i)=>(
        <Sph key={i} p={[x,0.48,z]} r={0.48} />
      ))}

      {/* ── NIGHT UPLIGHTS ── */}
      {night && (
        <>
          {[-bW/2,0,bW/2].map((x,i)=>(
            <pointLight key={i} position={[x,0.4,bL/2+0.5]} color="#fef3c7" intensity={5} distance={totalH+8} castShadow />
          ))}
          <pointLight position={[0,fH*0.5,0]} color="#fef9c3" intensity={3} distance={bW*2.5} />
        </>
      )}
    </group>
  );
}

// ──────────────────────────────────
// LABELS
// ──────────────────────────────────
function Labels({ cfg }: any) {
  const { bW, bL, fH, nF } = cfg;
  const items = [
    ...[...Array(nF)].map((_,i)=>({ label: `Floor ${i+1} — Office`, p: [bW/2+0.5, i*fH+fH*0.5, 0] as [number,number,number] })),
    { label: "Rooftop Garden + Solar", p: [0, nF*fH+2, 0] as [number,number,number] },
    { label: "Reflecting Pool",        p: [-(bW/2+5), 1.2, 0] as [number,number,number] },
    { label: "Lobby Entrance",         p: [0, 0.9, bL/2+3] as [number,number,number] },
  ];
  return (
    <>
      {items.map((item, i) => (
        <Html key={i} position={item.p} center zIndexRange={[10, 0]}>
          <div style={{ background: "rgba(2,6,23,0.9)", color: "#38bdf8", padding: "3px 9px", borderRadius: "5px", fontSize: "9.5px", fontWeight: "bold", whiteSpace: "nowrap", border: "1px solid rgba(56,189,248,0.5)", boxShadow: "0 0 10px rgba(56,189,248,0.5)", pointerEvents: "none" }}>
            {item.label}
          </div>
        </Html>
      ))}
    </>
  );
}

// ──────────────────────────────────
// POST PROCESSING CONTROLLER
// ──────────────────────────────────
function CinematicEffects({ night, cinematic }: { night: boolean, cinematic: boolean }) {
  if (!cinematic) {
    return (
      <EffectComposer multisampling={4}>
        <N8AO distanceFalloff={1.0} aoRadius={2.0} intensity={1.5} color="#000000" />
        <Bloom luminanceThreshold={night ? 0.2 : 0.8} luminanceSmoothing={0.9} intensity={night ? 1.5 : 0.5} mipmapBlur />
        <Vignette eskil={false} offset={0.1} darkness={night ? 0.7 : 0.4} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={4}>
      <N8AO distanceFalloff={1.0} aoRadius={2.0} intensity={1.5} color="#000000" />
      <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={5.0} height={480} />
      <Bloom luminanceThreshold={night ? 0.2 : 0.8} luminanceSmoothing={0.9} intensity={night ? 1.5 : 0.5} mipmapBlur />
      <Vignette eskil={false} offset={0.1} darkness={night ? 0.7 : 0.4} />
    </EffectComposer>
  );
}

// ──────────────────────────────────
// MAIN
// ──────────────────────────────────
interface Props { formData?: any; analysisResult?: any; }

export default function ConstructionTimelapse({ formData, analysisResult }: Props) {
  const [night,     setNight]     = useState(false);
  const [xray,      setXray]      = useState(false);
  const [labels,    setLabels]    = useState(true);
  const [spin,      setSpin]      = useState(false);
  const [interiors, setInteriors] = useState(true);
  const [cinematic, setCinematic] = useState(false);
  const [dpr, setDpr] = useState(1.5);

  const parseNum = (val: any, fallback: number) => {
    const n = Number(val);
    return isNaN(n) || n <= 0 ? fallback : n;
  };

  const bW = Math.max(10, parseNum(formData?.land_width, 30) * 0.72);
  const bL = Math.max(12, parseNum(formData?.land_length, 35) * 0.72);
  const nF = Math.max(1, Math.min(20, parseNum(formData?.num_floors, 4)));
  const fH = 3.4;
  const cfg = { bW, bL, nF, fH };
  const camD = Math.max(bW, bL) * 1.85;

  const btnStyle = (on: boolean, accent = "#0369a1"): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 5,
    padding: "6px 13px", fontSize: 11, fontWeight: 700,
    borderRadius: 8, cursor: "pointer",
    border: `1px solid ${on ? accent : "rgba(255,255,255,0.1)"}`,
    background: on ? `${accent}40` : "rgba(2,6,23,0.65)",
    color: on ? "#f1f5f9" : "#475569",
    backdropFilter: "blur(12px)",
    transition: "all 0.2s",
  });

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 620, background: night ? "#020617" : "#e0f2fe", borderRadius: 12, overflow: "hidden" }}>

      {/* ── 3D CANVAS ── */}
      <Canvas
        shadows="soft"
        dpr={dpr}
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [camD*0.75, camD*0.65, camD*0.75], fov: 37, near: 0.1, far: 1000 }}
        gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: night ? 0.7 : 1.15 }}
      >
        <PerformanceMonitor onIncline={() => setDpr(1.5)} onDecline={() => setDpr(1)} />
        <Suspense fallback={null}>
          {/* Environment + Lighting */}
          {!night ? (
            <>
              <color attach="background" args={["#bfdbfe"]} />
              <ambientLight intensity={1.5} />
              <directionalLight
                position={[40, 60, 35]} intensity={3.5} castShadow
                shadow-mapSize={[4096, 4096]}
                shadow-camera-left={-65} shadow-camera-right={65}
                shadow-camera-top={65} shadow-camera-bottom={-65}
                shadow-bias={-0.0005}
              />
              {/* Museum-style key spot */}
              <SpotLight position={[0, nF*fH+15, bL/2+15]} color="#fff5e0" intensity={4} distance={60} angle={0.8} penumbra={1} castShadow />
              <pointLight position={[bW/2+8, nF*fH*0.7, bL*0.5]} color="#e0f2fe" intensity={1.5} distance={45} />
            </>
          ) : (
            <>
              <color attach="background" args={["#020617"]} />
              <ambientLight color="#1e3a5f" intensity={0.6} />
              <directionalLight position={[20, 30, 15]} intensity={0.5} color="#c7d2fe" />
              <Environment preset="night" />
            </>
          )}

          {/* Scene */}
          <Scene cfg={cfg} night={night} xray={xray} interiors={interiors} />
          {labels && <Labels cfg={cfg} />}
          <BakeShadows />

          {/* Post Processing */}
          <CinematicEffects night={night} cinematic={cinematic} />

          {/* Controls */}
          <OrbitControls
            enableZoom enablePan enableRotate
            target={[0, nF * fH * 0.45, 0]}
            maxPolarAngle={Math.PI * 0.48}
            minDistance={14} maxDistance={200}
            autoRotate={spin} autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>

      {/* ── TOOLBAR ── */}
      <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 30, display: "flex", gap: 6, padding: "8px 14px", background: "rgba(2,6,23,0.9)", borderRadius: 50, backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", alignItems: "center" }}>
        <button style={btnStyle(night, "#1d4ed8")} onClick={() => setNight(n => !n)}>
          {night ? <Sun size={12} /> : <Moon size={12} />} {night ? "Day" : "Night"}
        </button>
        <button style={btnStyle(xray, "#7c3aed")} onClick={() => setXray(x => !x)}>
          <Layers size={12} /> X-Ray
        </button>
        <button style={btnStyle(interiors, "#0891b2")} onClick={() => setInteriors(v => !v)}>
          <Building2 size={12} /> Interiors
        </button>
        <button style={btnStyle(labels, "#0d9488")} onClick={() => setLabels(l => !l)}>
          {labels ? <Eye size={12} /> : <EyeOff size={12} />} Labels
        </button>
        <button style={btnStyle(cinematic, "#d946ef")} onClick={() => setCinematic(c => !c)}>
          <Camera size={12} /> Cinematic
        </button>
        <button style={btnStyle(spin, "#dc2626")} onClick={() => setSpin(a => !a)}>
          <RotateCcw size={12} /> {spin ? "Stop" : "Auto Spin"}
        </button>
      </div>

      {/* ── BADGE ── */}
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 30, background: "rgba(2,6,23,0.9)", padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(56,189,248,0.35)", color: "#38bdf8", fontSize: 10, fontWeight: 800, letterSpacing: "0.07em", backdropFilter: "blur(14px)" }}>
        ⚡ MACRO DIORAMA PBR
      </div>

      {/* ── SPECS CARD ── */}
      <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 30, background: "rgba(2,6,23,0.92)", padding: "12px 16px", borderRadius: 10, backdropFilter: "blur(16px)", border: "1px solid rgba(56,189,248,0.2)", minWidth: 175 }}>
        <div style={{ color: "#38bdf8", fontSize: 10, fontWeight: 800, letterSpacing: "0.07em", marginBottom: 8 }}>🏗️ BUILDING SPECS</div>
        {[["Type", formData?.building_type||"Commercial"],["Plot",`${formData?.land_length||35}×${formData?.land_width||30}m`],["Floors",nF],["Height",`${(nF*fH).toFixed(1)}m`],["Style",formData?.style_selection||"Modern"],["Material",formData?.material_preference||"Glass/Concrete"]].map(([k,v])=>(
          <div key={String(k)} style={{ fontSize: 9.5, color: "#94a3b8", lineHeight: 1.8 }}>{k}: <strong style={{ color: "#f1f5f9" }}>{v}</strong></div>
        ))}
      </div>

      {/* ── CONTROLS HINT ── */}
      <div style={{ position: "absolute", bottom: 12, right: 12, zIndex: 30, background: "rgba(2,6,23,0.85)", padding: "8px 12px", borderRadius: 8, backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, color: "#475569", lineHeight: 2 }}>
          <div>🖱️ <span style={{ color: "#64748b" }}>Drag</span> → Rotate</div>
          <div>🔍 <span style={{ color: "#64748b" }}>Scroll</span> → Zoom</div>
          <div>✋ <span style={{ color: "#64748b" }}>Right</span> → Pan</div>
        </div>
      </div>
    </div>
  );
}
