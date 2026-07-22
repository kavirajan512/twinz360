import React from 'react';

type Vec3 = [number, number, number];

interface LayerProps {
  visible: boolean;
  color?: number;
}

function Cyl({ pos, r, h, color, segments = 8 }: { pos: Vec3; r: number; h: number; color: number; segments?: number }) {
  return <mesh position={pos}><cylinderGeometry args={[r, r, h, segments]} /><meshStandardMaterial color={color} roughness={0.4} metalness={0.0} /></mesh>;
}

function Box({ pos, s, color }: { pos: Vec3; s: Vec3; color: number }) {
  return <mesh position={pos}><boxGeometry args={s} /><meshStandardMaterial color={color} roughness={0.4} metalness={0.0} /></mesh>;
}

// ============== PLUMBING LAYER ==============
export function PlumbingLayer({ visible }: LayerProps) {
  if (!visible) return null;
  const items: React.ReactNode[] = [];
  
  // Main water supply pipe (vertical riser)
  for (let f = 0; f < 2; f++) {
    const y = f * 3.2 + 0.5;
    // Cold water pipe (blue)
    items.push(<Cyl key={`cw-${f}`} pos={[-2.5, y, 2.5]} r={0.04} h={3.2} color={0x0ea5e9} />);
    // Hot water pipe (red)
    items.push(<Cyl key={`hw-${f}`} pos={[-2.3, y, 2.5]} r={0.03} h={3.2} color={0xef4444} />);
    // Horizontal branches to kitchen
    items.push(<Cyl key={`hk-cw-${f}`} pos={[-1.5, y + 1.0, 4.0]} r={0.03} h={2.0} color={0x0ea5e9} />);
    items.push(<Cyl key={`hk-hw-${f}`} pos={[-1.5, y + 1.2, 4.0]} r={0.025} h={2.0} color={0xef4444} />);
    // Branch to bathroom
    items.push(<Cyl key={`hb-${f}`} pos={[5.0, y + 0.5, 0.5]} r={0.03} h={2.5} color={0x0ea5e9} />);
    // Branch to laundry
    items.push(<Cyl key={`hl-${f}`} pos={[-4.0, y + 0.3, 5.5]} r={0.025} h={1.8} color={0x0ea5e9} />);
    // Drain pipe (gray, larger)
    items.push(<Cyl key={`dr-${f}`} pos={[-2.7, y, 2.5]} r={0.06} h={3.2} color={0x6b7280} />);
  }
  
  // Water tank connection (rooftop)
  items.push(<Cyl key={`wt-cw`} pos={[2.5, 6.0, 1.5]} r={0.04} h={1.5} color={0x0ea5e9} />);
  items.push(<Cyl key={`wt-dr`} pos={[2.5, 6.0, 2.0]} r={0.06} h={1.5} color={0x6b7280} />);
  
  // Gas pipe (yellow)
  for (let f = 0; f < 2; f++) {
    items.push(<Cyl key={`gp-${f}`} pos={[2.0, f * 3.2 + 0.5, 3.5]} r={0.025} h={3.2} color={0xeab308} />);
  }

  return <group>{items}</group>;
}

// ============== ELECTRICAL LAYER ==============
export function ElectricalLayer({ visible }: LayerProps) {
  if (!visible) return null;
  const items: React.ReactNode[] = [];
  
  for (let f = 0; f < 2; f++) {
    const y = f * 3.2;
    // Main conduit (yellow)
    items.push(<Cyl key={`mc-${f}`} pos={[0, y + 0.2, 0]} r={0.04} h={3.2} color={0xfacc15} />);
    // Branch conduits
    items.push(<Cyl key={`br-lr-${f}`} pos={[-3.5, y + 0.3, -3.0]} r={0.025} h={3.0} color={0xfacc15} />);
    items.push(<Cyl key={`br-kit-${f}`} pos={[-3.5, y + 0.3, 3.0]} r={0.025} h={3.0} color={0xfacc15} />);
    items.push(<Cyl key={`br-br-${f}`} pos={[4.0, y + 0.3, 1.5]} r={0.025} h={3.0} color={0xfacc15} />);
    items.push(<Cyl key={`br-of-${f}`} pos={[-5.5, y + 0.3, 0]} r={0.025} h={3.0} color={0xfacc15} />);
    // Switch boards (white boxes on walls)
    items.push(<Box key={`sw-lr-${f}`} pos={[-3.5, y + 1.2, -0.5]} s={[0.08, 0.12, 0.02]} color={0xf3f4f6} />);
    items.push(<Box key={`sw-kit-${f}`} pos={[-3.5, y + 1.2, 3.0]} s={[0.08, 0.12, 0.02]} color={0xf3f4f6} />);
    items.push(<Box key={`sw-mb-${f}`} pos={[-3.5, y + 1.2, -5.0]} s={[0.08, 0.12, 0.02]} color={0xf3f4f6} />);
  }

  return <group>{items}</group>;
}

// ============== HVAC LAYER ==============
export function HVACLayer({ visible }: LayerProps) {
  if (!visible) return null;
  const items: React.ReactNode[] = [];
  
  for (let f = 0; f < 2; f++) {
    const y = f * 3.2;
    // Main air duct (silver, rectangular)
    items.push(<Box key={`duct-m-${f}`} pos={[0, y + 3.0, 0]} s={[0.5, 0.3, 8]} color={0x9ca3af} />);
    // Branch ducts
    items.push(<Box key={`duct-lr-${f}`} pos={[-3.5, y + 3.0, -2.0]} s={[3.0, 0.2, 0.4]} color={0x9ca3af} />);
    items.push(<Box key={`duct-kit-${f}`} pos={[-3.5, y + 3.0, 3.0]} s={[3.0, 0.2, 0.4]} color={0x9ca3af} />);
    items.push(<Box key={`duct-br-${f}`} pos={[4.0, y + 3.0, -1.0]} s={[2.0, 0.2, 0.4]} color={0x9ca3af} />);
    // Vents (grilles on ceiling)
    items.push(<Box key={`vent-lr-${f}`} pos={[-3.5, y + 3.1, -2.0]} s={[0.5, 0.02, 0.15]} color={0x4b5563} />);
    items.push(<Box key={`vent-kit-${f}`} pos={[-3.5, y + 3.1, 3.0]} s={[0.5, 0.02, 0.15]} color={0x4b5563} />);
    items.push(<Box key={`vent-mb-${f}`} pos={[-3.5, y + 3.1, -5.0]} s={[0.5, 0.02, 0.15]} color={0x4b5563} />);
  }
  
  // AC outdoor units (rooftop)
  items.push(<Box key={`ac-1`} pos={[-3.0, 6.5, -2.0]} s={[0.8, 0.6, 0.3]} color={0xd1d5db} />);
  items.push(<Box key={`ac-2`} pos={[-3.0, 6.5, 2.0]} s={[0.8, 0.6, 0.3]} color={0xd1d5db} />);

  return <group>{items}</group>;
}

// ============== STRUCTURAL LAYER ==============
export function StructuralLayer({ visible }: LayerProps) {
  if (!visible) return null;
  const items: React.ReactNode[] = [];
  const fh = 3.2;
  
  // Foundation
  items.push(<Box key={`found`} pos={[0, -0.2, 0]} s={[16, 0.4, 14]} color={0x64748b} />);
  
  // Columns grid
  const cols = [-5, 0, 5];
  const rows = [-4, 0, 4];
  for (let f = 0; f < 3; f++) {
    for (const cx of cols) {
      for (const cz of rows) {
        items.push(<Box key={`col-${f}-${cx}-${cz}`} pos={[cx, f * fh + fh / 2, cz]} s={[0.3, fh, 0.3]} color={0x94a3b8} />);
      }
    }
  }
  
  // Beams
  for (let f = 0; f < 3; f++) {
    for (const cx of cols) {
      items.push(<Box key={`beamx-${f}-${cx}`} pos={[cx, f * fh + fh - 0.1, 0]} s={[0.3, 0.3, 8]} color={0x94a3b8} />);
    }
    for (const cz of rows) {
      items.push(<Box key={`beamz-${f}-${cz}`} pos={[0, f * fh + fh - 0.1, cz]} s={[10, 0.3, 0.3]} color={0x94a3b8} />);
    }
  }
  
  // Slabs with rebar pattern
  for (let f = 0; f < 3; f++) {
    items.push(<Box key={`slab-${f}`} pos={[0, f * fh + fh, 0]} s={[10, 0.15, 8]} color={0x94a3b8} />);
    // Rebar grid (thin bars)
    for (let x = -4.5; x <= 4.5; x += 0.5) {
      items.push(<Cyl key={`rebx-${f}-${x}`} pos={[x, f * fh + fh + 0.08, 0]} r={0.008} h={8} color={0xdc2626} />);
    }
    for (let z = -3.5; z <= 3.5; z += 0.5) {
      items.push(<Cyl key={`rebz-${f}-${z}`} pos={[0, f * fh + fh + 0.08, z]} r={0.008} h={10} color={0xdc2626} />);
    }
  }

  return <group>{items}</group>;
}

// ============== FIRE SAFETY LAYER ==============
export function FireSafetyLayer({ visible }: LayerProps) {
  if (!visible) return null;
  const items: React.ReactNode[] = [];
  
  for (let f = 0; f < 2; f++) {
    const y = f * 3.2;
    // Sprinkler pipes (red)
    items.push(<Cyl key={`sp-${f}`} pos={[0, y + 2.8, 0]} r={0.03} h={6} color={0xdc2626} />);
    // Sprinkler heads
    const sprinklers = [[-3, -2], [-3, 2], [3, -2], [3, 2], [0, 0]];
    for (const [sx, sz] of sprinklers) {
      items.push(<Box key={`sph-${f}-${sx}-${sz}`} pos={[sx, y + 3.1, sz]} s={[0.04, 0.02, 0.04]} color={0xffffff} />);
    }
    // Smoke detectors
    items.push(<Cyl key={`smk-${f}`} pos={[0, y + 3.1, -3]} r={0.03} h={0.02} color={0xf3f4f6} />);
    items.push(<Cyl key={`smk2-${f}`} pos={[0, y + 3.1, 3]} r={0.03} h={0.02} color={0xf3f4f6} />);
    // Fire extinguisher
    items.push(<Cyl key={`ext-${f}`} pos={[-4.5, y + 0.5, -3.5]} r={0.05} h={0.25} color={0xef4444} />);
  }

  return <group>{items}</group>;
}

// ============== SWIMMING POOL ==============
export function SwimmingPool({ visible }: LayerProps) {
  if (!visible) return null;
  return (
    <group position={[0, -0.1, 6.5]}>
      {/* Pool base */}
      <mesh position={[0, -0.02, 0]} receiveShadow><boxGeometry args={[6, 0.1, 3.5]} /><meshStandardMaterial color={0x1e293b} roughness={0.4} /></mesh>
      {/* Water surface */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.8, 3.3]} />
        <meshPhysicalMaterial color={0x0ea5e9} transparent opacity={0.7} roughness={0.05} metalness={0.9} ior={1.33} />
      </mesh>
      {/* Pool border */}
      <mesh position={[0, 0.04, -1.75]} castShadow><boxGeometry args={[6.2, 0.08, 0.15]} /><meshStandardMaterial color={0xf0f0f0} roughness={0.15} metalness={0.1} /></mesh>
      <mesh position={[0, 0.04, 1.75]} castShadow><boxGeometry args={[6.2, 0.08, 0.15]} /><meshStandardMaterial color={0xf0f0f0} roughness={0.15} metalness={0.1} /></mesh>
      <mesh position={[-3.1, 0.04, 0]} castShadow><boxGeometry args={[0.15, 0.08, 3.8]} /><meshStandardMaterial color={0xf0f0f0} roughness={0.15} metalness={0.1} /></mesh>
      <mesh position={[3.1, 0.04, 0]} castShadow><boxGeometry args={[0.15, 0.08, 3.8]} /><meshStandardMaterial color={0xf0f0f0} roughness={0.15} metalness={0.1} /></mesh>
      {/* Pool ladder */}
      <mesh position={[2.5, 0.3, 0]}><boxGeometry args={[0.02, 0.6, 0.4]} /><meshStandardMaterial color={0xcccccc} roughness={0.05} metalness={1.0} /></mesh>
      <mesh position={[2.55, 0.1, 0.15]}><boxGeometry args={[0.02, 0.02, 0.1]} /><meshStandardMaterial color={0xcccccc} roughness={0.05} metalness={1.0} /></mesh>
      <mesh position={[2.55, 0.3, 0.15]}><boxGeometry args={[0.02, 0.02, 0.1]} /><meshStandardMaterial color={0xcccccc} roughness={0.05} metalness={1.0} /></mesh>
      <mesh position={[2.55, 0.5, 0.15]}><boxGeometry args={[0.02, 0.02, 0.1]} /><meshStandardMaterial color={0xcccccc} roughness={0.05} metalness={1.0} /></mesh>
      {/* Pool light */}
      <mesh position={[-2.5, 0.05, 0]}><boxGeometry args={[0.08, 0.02, 0.08]} /><meshStandardMaterial color={0x38bdf8} emissive={0x38bdf8} emissiveIntensity={0.5} /></mesh>
      <pointLight position={[-2.5, 0.1, 0]} intensity={0.3} distance={5} color={0x38bdf8} />
    </group>
  );
}

// ============== EXTERIOR LANDSCAPE ==============
export function LandscapeLayer({ visible }: LayerProps) {
  if (!visible) return null;
  const items: React.ReactNode[] = [];
  
  // Trees
  const treePositions: Vec3[] = [[-7, 0, -5], [7, 0, -5], [-7, 0, 5], [7, 0, 5], [-6, 0, -6], [6, 0, 6], [-8, 0, 0], [8, 0, 0]];
  for (let i = 0; i < treePositions.length; i++) {
    const [tx, ty, tz] = treePositions[i];
    items.push(
      <group key={`tree-${i}`} position={[tx, ty, tz]}>
        <Cyl pos={[0, 0.5, 0]} r={0.08} h={1.0} color={0x5c3a21} />
        <mesh position={[0, 1.8, 0]} castShadow><sphereGeometry args={[0.8, 8, 8]} /><meshStandardMaterial color={0x22c55e} roughness={0.4} /></mesh>
        <mesh position={[0.3, 2.2, 0.3]} castShadow><sphereGeometry args={[0.5, 8, 8]} /><meshStandardMaterial color={0x16a34a} roughness={0.4} /></mesh>
      </group>
    );
  }
  
  // Street lights
  items.push(
    <group key="streetlight-1" position={[-7, 0, -3]}>
      <Cyl pos={[0, 1.5, 0]} r={0.03} h={3.0} color={0x4b5563} />
      <mesh position={[0, 3.2, 0]}><boxGeometry args={[0.15, 0.05, 0.3]} /><meshStandardMaterial color={0x4b5563} roughness={0.4} /></mesh>
      <mesh position={[0, 3.15, -0.15]}><boxGeometry args={[0.1, 0.02, 0.02]} /><meshStandardMaterial color={0xffffff} emissive={0xffffff} emissiveIntensity={0.3} /></mesh>
    </group>
  );
  items.push(
    <group key="streetlight-2" position={[7, 0, 3]}>
      <Cyl pos={[0, 1.5, 0]} r={0.03} h={3.0} color={0x4b5563} />
      <mesh position={[0, 3.2, 0]}><boxGeometry args={[0.15, 0.05, 0.3]} /><meshStandardMaterial color={0x4b5563} roughness={0.4} /></mesh>
      <mesh position={[0, 3.15, -0.15]}><boxGeometry args={[0.1, 0.02, 0.02]} /><meshStandardMaterial color={0xffffff} emissive={0xffffff} emissiveIntensity={0.3} /></mesh>
    </group>
  );

  // Grass patches
  for (let i = 0; i < 12; i++) {
    const gx = (Math.random() - 0.5) * 18;
    const gz = (Math.random() - 0.5) * 16;
    items.push(<mesh key={`grass-${i}`} position={[gx, -0.1, gz]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.3 + Math.random() * 0.5, 0.3 + Math.random() * 0.5]} /><meshBasicMaterial color={0x22c55e} /></mesh>);
  }
  
  // Plants (small bushes)
  for (let i = 0; i < 8; i++) {
    const px = (Math.random() - 0.5) * 14;
    const pz = (Math.random() - 0.5) * 12;
    items.push(<mesh key={`bush-${i}`} position={[px, 0, pz]} castShadow><sphereGeometry args={[0.15 + Math.random() * 0.1, 6, 6]} /><meshBasicMaterial color={0x15803d} /></mesh>);
  }

  return <group>{items}</group>;
}

// ============== ROAD LAYER ==============
export function RoadLayer({ visible }: LayerProps) {
  if (!visible) return null;
  return (
    <group>
      {/* Main road */}
      <mesh position={[0, -0.12, 10]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 4]} /><meshStandardMaterial color={0x1e293b} roughness={0.85} /></mesh>
      <mesh position={[0, -0.11, 10]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[20, 0.15]} /><meshStandardMaterial color={0xfacc15} roughness={0.4} /></mesh>
      {/* Sidewalk */}
      <mesh position={[0, -0.1, 12.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 1]} /><meshStandardMaterial color={0x9ca3af} roughness={0.8} /></mesh>
      <mesh position={[0, -0.1, 7.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 1]} /><meshStandardMaterial color={0x9ca3af} roughness={0.8} /></mesh>
      {/* Parking spots */}
      <mesh position={[-3, -0.1, 9]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.5, 0.02]} /><meshStandardMaterial color={0xffffff} roughness={0.6} /></mesh>
      <mesh position={[3, -0.1, 9]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.5, 0.02]} /><meshStandardMaterial color={0xffffff} roughness={0.6} /></mesh>
    </group>
  );
}

// ============== WALL PAINTINGS / DECORATIONS ==============
export function WallDecorations({ visible }: LayerProps) {
  if (!visible) return null;
  const items: React.ReactNode[] = [];
  
  const paintings = [
    { pos: [-3.5, 1.8, -3.5] as Vec3, rot: 0, art: 0x7c3aed },
    { pos: [3.5, 1.8, -3.5] as Vec3, rot: Math.PI, art: 0x059669 },
    { pos: [-3.5, 1.8, 3.5] as Vec3, rot: 0, art: 0xdc2626 },
    { pos: [-5.5, 1.8, 0] as Vec3, rot: Math.PI / 2, art: 0x2563eb },
    { pos: [5.5, 1.8, 0] as Vec3, rot: Math.PI / 2, art: 0xd97706 },
  ];

  for (let i = 0; i < paintings.length; i++) {
    const p = paintings[i];
    items.push(
      <group key={`paint-${i}`} position={p.pos} rotation={[0, p.rot, 0]}>
        <mesh position={[0, 0, 0]}><boxGeometry args={[0.5, 0.35, 0.025]} /><meshStandardMaterial color={0x4a3728} roughness={0.6} /></mesh>
        <mesh position={[0, 0, 0.015]}><planeGeometry args={[0.42, 0.27]} /><meshBasicMaterial color={p.art} /></mesh>
        <mesh position={[0.12, 0.1, 0.015]}><sphereGeometry args={[0.015, 6, 6]} /><meshBasicMaterial color={0xfbbf24} /></mesh>
        <mesh position={[-0.12, -0.08, 0.015]}><sphereGeometry args={[0.015, 6, 6]} /><meshBasicMaterial color={0xfbbf24} /></mesh>
      </group>
    );
  }

  return <group>{items}</group>;
}
