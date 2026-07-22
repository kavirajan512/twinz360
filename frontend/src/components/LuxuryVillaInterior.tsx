import React from 'react';
import * as THREE from 'three';
import { PBRMaterials as M } from './PBRMaterials';

type Vec3 = [number, number, number];

interface RoomLayout {
  position: Vec3;
  size: Vec3;
  wallColor?: number;
  floorMat?: 'marble' | 'wood' | 'ceramic' | 'dark_wood';
  label: string;
}

// ============== WALLS, FLOORS, CEILINGS ==============
function Room({ pos, size, wallColor = 0xf5f0eb, floorMat = 'marble', children }: { pos: Vec3; size: Vec3; wallColor?: number; floorMat?: string; children?: React.ReactNode }) {
  const [x, y, z] = pos;
  const [w, h, d] = size;
  const floorM = floorMat === 'wood' ? M.getWoodFloor() : floorMat === 'dark_wood' ? M.getWoodDark() : floorMat === 'ceramic' ? M.getCeramic() : M.getMarbleFloor();
  
  return (
    <group position={pos}>
      {/* Floor */}
      <mesh position={[0, -h / 2, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <primitive object={floorM} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, h / 2, 0]} receiveShadow>
        <boxGeometry args={[w, 0.05, d]} />
        <primitive object={M.getCeiling()} />
      </mesh>
      {/* Walls */}
      <mesh position={[0, 0, -d / 2]} receiveShadow><boxGeometry args={[w, h, 0.1]} /><primitive object={M.getPaint(wallColor)} /></mesh>
      <mesh position={[0, 0, d / 2]} receiveShadow><boxGeometry args={[w, h, 0.1]} /><primitive object={M.getPaint(wallColor)} /></mesh>
      <mesh position={[-w / 2, 0, 0]} receiveShadow><boxGeometry args={[0.1, h, d]} /><primitive object={M.getPaint(wallColor)} /></mesh>
      <mesh position={[w / 2, 0, 0]} receiveShadow><boxGeometry args={[0.1, h, d]} /><primitive object={M.getPaint(wallColor)} /></mesh>
      
      {children}
    </group>
  );
}

function Mesh({ pos, args, mat, cast = true, receive = true }: { pos: Vec3; args: Vec3 | [number, number, number, number]; mat: THREE.Material; cast?: boolean; receive?: boolean }) {
  if (args.length === 4) {
    const [r, rt, h, seg] = args as [number, number, number, number];
    return <mesh position={pos} castShadow={cast} receiveShadow={receive}><cylinderGeometry args={[r, rt, h, seg]} /><primitive object={mat} /></mesh>;
  }
  return <mesh position={pos} castShadow={cast} receiveShadow={receive}><boxGeometry args={args} /><primitive object={mat} /></mesh>;
}

function SphereMesh({ pos, r, mat }: { pos: Vec3; r: number; mat: THREE.Material }) {
  return <mesh position={pos} castShadow><sphereGeometry args={[r, 12, 12]} /><primitive object={mat} /></mesh>;
}

function CylMesh({ pos, rt, rb, h, mat }: { pos: Vec3; rt: number; rb: number; h: number; mat: THREE.Material }) {
  return <mesh position={pos} castShadow><cylinderGeometry args={[rt, rb, h, 10]} /><primitive object={mat} /></mesh>;
}

function Light({ pos, color = 0xffffff, intensity = 0.5, distance = 8 }: { pos: Vec3; color?: number; intensity?: number; distance?: number }) {
  return <pointLight position={pos} intensity={intensity} distance={distance} color={color} />;
}

// ============== FURNITURE BLUEPRINTS ==============
// Each function returns JSX that can be placed at a given position

function Sofa({ pos, rot = 0 }: { pos: Vec3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Mesh pos={[0, 0.25, 0]} args={[2.2, 0.5, 0.85]} mat={M.getFabric(0x94a3b8)} />
      <Mesh pos={[0, 0.65, -0.35]} args={[2.2, 0.55, 0.18]} mat={M.getFabric(0x94a3b8)} />
      <Mesh pos={[0.75, 0.25, 0.6]} args={[0.8, 0.5, 1.2]} mat={M.getFabric(0x94a3b8)} />
      <Mesh pos={[-0.5, 0.55, 0.15]} args={[0.5, 0.12, 0.45]} mat={M.getFabric(0xd1d5db)} />
      <Mesh pos={[0.4, 0.55, 0.15]} args={[0.5, 0.12, 0.45]} mat={M.getFabric(0xd1d5db)} />
      {/* Cushion pillows */}
      <Mesh pos={[-0.6, 0.7, 0.25]} args={[0.4, 0.08, 0.4]} mat={M.getFabric(0xf3f4f6)} />
      <Mesh pos={[0.5, 0.7, 0.25]} args={[0.4, 0.08, 0.4]} mat={M.getFabric(0xf3f4f6)} />
      {[[-0.95, -0.25, -0.35], [0.95, -0.25, -0.35], [-0.95, -0.25, 0.35], [0.95, -0.25, 0.35], [0.75, -0.25, 1.0], [0.75, -0.25, 0.2]].map((p, i) => (
        <CylMesh key={`sl-${i}`} pos={p as Vec3} rt={0.025} rb={0.025} h={0.2} mat={M.getChrome()} />
      ))}
    </group>
  );
}

function CoffeeTable({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <Mesh pos={[0, 0.2, 0]} args={[1.1, 0.05, 0.65]} mat={M.getMarbleFloor()} />
      <Mesh pos={[0, 0.35, 0]} args={[1.05, 0.03, 0.6]} mat={M.getWoodDark()} />
      {[[-0.45, -0.15, -0.23], [0.45, -0.15, -0.23], [-0.45, -0.15, 0.23], [0.45, -0.15, 0.23]].map((p, i) => (
        <CylMesh key={`ctl-${i}`} pos={p as Vec3} rt={0.02} rb={0.03} h={0.3} mat={M.getBrass()} />
      ))}
      {/* Decorative items */}
      <Mesh pos={[0.3, 0.45, 0.15]} args={[0.06, 0.15, 0.06]} mat={M.getGlass()} />
      <SphereMesh pos={[-0.25, 0.45, -0.1]} r={0.04} mat={M.getGold()} />
    </group>
  );
}

function TVStand({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <Mesh pos={[0, 0.25, 0]} args={[1.8, 0.5, 0.35]} mat={M.getWoodDark()} />
      <Mesh pos={[0, 0.55, 0.03]} args={[1.6, 0.02, 0.3]} mat={M.getWhiteMarble()} />
      <Mesh pos={[0, 0.95, 0.01]} args={[1.5, 0.8, 0.03]} mat={new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.1 })} />
      <mesh position={[0, 0.95, 0.05]}><planeGeometry args={[1.4, 0.75]} /><meshBasicMaterial color={0x38bdf8} /></mesh>
      <Mesh pos={[0, 0.45, 0.1]} args={[0.9, 0.05, 0.06]} mat={M.getSteel()} />
      {[[-0.45, 0.25, 0.19], [0.45, 0.25, 0.19]].map((p, i) => (
        <Mesh key={`tvd-${i}`} pos={p as Vec3} args={[0.4, 0.45, 0.02]} mat={M.getWoodLight()} />
      ))}
    </group>
  );
}

function DiningSet({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <Mesh pos={[0, 0.75, 0]} args={[1.8, 0.05, 1.1]} mat={M.getWhiteMarble()} />
      <Mesh pos={[0, 0.35, 0]} args={[1.6, 0.6, 0.9]} mat={M.getWoodDark()} />
      {[[-1.2, 0.45, -0.7], [1.2, 0.45, -0.7], [-1.2, 0.45, 0.7], [1.2, 0.45, 0.7], [-0.6, 0.45, -0.9], [0.6, 0.45, -0.9], [-0.6, 0.45, 0.9], [0.6, 0.45, 0.9]].map((cp, i) => (
        <group key={`ch-${i}`} position={cp as Vec3}>
          <Mesh pos={[0, 0.22, 0]} args={[0.38, 0.04, 0.38]} mat={M.getWoodDark()} />
          <Mesh pos={[0, 0.4, 0]} args={[0.36, 0.32, 0.36]} mat={M.getLeather(0x1f2937)} />
          <Mesh pos={[0, 0.55, -0.18]} args={[0.36, 0.25, 0.04]} mat={M.getLeather(0x1f2937)} />
          {[[-0.16, -0.05, -0.16], [0.16, -0.05, -0.16], [-0.16, -0.05, 0.16], [0.16, -0.05, 0.16]].map((lp, j) => (
            <CylMesh key={`cl-${i}-${j}`} pos={lp as Vec3} rt={0.018} rb={0.022} h={0.35} mat={M.getBrass()} />
          ))}
        </group>
      ))}
      <Mesh pos={[0, 0.8, 0]} args={[0.03, 0.12, 0.03]} mat={M.getGlass()} />
      <SphereMesh pos={[0, 0.9, 0]} r={0.05} mat={M.getPaint(0x22c55e)} />
    </group>
  );
}

function KitchenBlock({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <Mesh pos={[0, 0.4, 0]} args={[2.4, 0.8, 0.6]} mat={M.getPaint(0xf3f4f6)} />
      <Mesh pos={[0, 0.8, 0]} args={[2.45, 0.04, 0.65]} mat={M.getGranite()} />
      {/* Sink */}
      <Mesh pos={[-0.6, 0.78, 0]} args={[0.3, 0.04, 0.35]} mat={M.getSteel()} />
      {/* Stove */}
      <Mesh pos={[0.6, 0.78, 0]} args={[0.3, 0.04, 0.35]} mat={M.getSteel()} />
      {[[0.45, 0.82, -0.08], [0.75, 0.82, -0.08], [0.45, 0.82, 0.08], [0.75, 0.82, 0.08]].map((bp, i) => (
        <CylMesh key={`brn-${i}`} pos={bp as Vec3} rt={0.06} rb={0.08} h={0.015} mat={M.getPaint(0x111827)} />
      ))}
      {/* Faucet */}
      <CylMesh pos={[-0.6, 0.85, 0.22]} rt={0.015} rb={0.02} h={0.06} mat={M.getChrome()} />
      {/* Cabinets above */}
      <Mesh pos={[0, 1.3, 0]} args={[2.3, 0.6, 0.35]} mat={M.getPaint(0xffffff)} />
      {[[-0.5, 1.3, 0.18], [0.5, 1.3, 0.18]].map((cp, i) => (
        <Mesh key={`cb-${i}`} pos={cp as Vec3} args={[0.4, 0.5, 0.02]} mat={M.getPaint(0xd1d5db)} />
      ))}
      {/* Chimney */}
      <Mesh pos={[0.6, 1.5, 0]} args={[0.6, 0.5, 0.35]} mat={M.getChrome()} />
    </group>
  );
}

function Fridge({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <Mesh pos={[0, 0.85, 0]} args={[0.65, 1.7, 0.65]} mat={M.getSteel()} />
      <Mesh pos={[0, 0.85, 0.34]} args={[0.6, 1.65, 0.02]} mat={M.getSteel()} />
      <Mesh pos={[0, 1.65, 0.34]} args={[0.6, 0.3, 0.02]} mat={M.getSteel()} />
      <CylMesh pos={[0.2, 0.85, 0.35]} rt={0.015} rb={0.015} h={0.02} mat={M.getChrome()} />
    </group>
  );
}

function KingBed({ pos, rot = 0 }: { pos: Vec3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Mesh pos={[0, 0.12, 0]} args={[1.7, 0.25, 1.9]} mat={M.getFabric(0xf3f4f6)} />
      <Mesh pos={[0, 0.04, 0]} args={[1.72, 0.08, 1.92]} mat={M.getWoodDark()} />
      <Mesh pos={[0, 0.65, -0.98]} args={[1.75, 1.1, 0.08]} mat={M.getLeather(0x4a3728)} />
      <Mesh pos={[-0.45, 0.3, -0.55]} args={[0.55, 0.12, 0.45]} mat={M.getFabric(0xffffff)} />
      <Mesh pos={[0.45, 0.3, -0.55]} args={[0.55, 0.12, 0.45]} mat={M.getFabric(0xffffff)} />
      <Mesh pos={[0, 0.28, 0.25]} args={[1.5, 0.06, 1.1]} mat={M.getFabric(0x475569)} />
      {[[-0.82, -0.08, -0.85], [0.82, -0.08, -0.85], [-0.82, -0.08, 0.85], [0.82, -0.08, 0.85]].map((p, i) => (
        <CylMesh key={`bl-${i}`} pos={p as Vec3} rt={0.025} rb={0.035} h={0.16} mat={M.getChrome()} />
      ))}
    </group>
  );
}

function BedsideTable({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <Mesh pos={[0, 0.25, 0]} args={[0.4, 0.5, 0.4]} mat={M.getWoodDark()} />
      <Mesh pos={[0, 0.55, 0]} args={[0.43, 0.03, 0.43]} mat={M.getWhiteMarble()} />
      <Mesh pos={[0, 0.22, 0.22]} args={[0.35, 0.1, 0.02]} mat={M.getWoodLight()} />
      {/* Lamp */}
      <CylMesh pos={[-0.1, 0.62, -0.08]} rt={0.025} rb={0.035} h={0.12} mat={M.getBrass()} />
      <SphereMesh pos={[-0.1, 0.76, -0.08]} r={0.06} mat={new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffe4b5, emissiveIntensity: 0.4 })} />
      <Light pos={[-0.1, 0.82, -0.08]} color={0xffe4b5} intensity={0.15} distance={3} />
    </group>
  );
}

function Wardrobe({ pos, rot = 0 }: { pos: Vec3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Mesh pos={[0, 0.85, 0]} args={[1.8, 1.7, 0.55]} mat={M.getWoodDark()} />
      {[[-0.45, 0.85, 0.29], [0.45, 0.85, 0.29]].map((p, i) => (
        <Mesh key={`wd-${i}`} pos={p as Vec3} args={[0.42, 1.6, 0.02]} mat={M.getWoodLight()} />
      ))}
      {/* Mirror */}
      <mesh position={[-0.45, 0.9, 0.305]}><planeGeometry args={[0.28, 1.1]} /><primitive object={M.getGlass()} /></mesh>
      {[[-0.45, 0.85, 0.31], [0.45, 0.85, 0.31]].map((p, i) => (
        <CylMesh key={`wh-${i}`} pos={p as Vec3} rt={0.012} rb={0.012} h={0.04} mat={M.getBrass()} />
      ))}
    </group>
  );
}

function Desk({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <Mesh pos={[0, 0.35, 0]} args={[1.0, 0.04, 0.5]} mat={M.getWoodLight()} />
      {[[-0.45, 0.17, -0.2], [0.45, 0.17, -0.2], [-0.45, 0.17, 0.2], [0.45, 0.17, 0.2]].map((p, i) => (
        <CylMesh key={`dl-${i}`} pos={p as Vec3} rt={0.02} rb={0.025} h={0.32} mat={M.getSteel()} />
      ))}
      <Mesh pos={[-0.52, 0.2, 0]} args={[0.3, 0.38, 0.48]} mat={M.getWoodDark()} />
    </group>
  );
}

function Chair({ pos, rot = 0 }: { pos: Vec3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <CylMesh pos={[0, 0.02, 0]} rt={0.22} rb={0.26} h={0.04} mat={M.getSteel()} />
      {[[-0.16, -0.02, -0.16], [0.16, -0.02, -0.16], [-0.16, -0.02, 0.16], [0.16, -0.02, 0.16]].map((p, i) => (
        <SphereMesh key={`cw-${i}`} pos={p as Vec3} r={0.018} mat={M.getSteel()} />
      ))}
      <Mesh pos={[0, 0.22, 0]} args={[0.4, 0.05, 0.4]} mat={M.getFabric(0x1e293b)} />
      <Mesh pos={[0, 0.28, 0]} args={[0.38, 0.3, 0.38]} mat={M.getFabric(0x1e293b)} />
      <Mesh pos={[0, 0.5, -0.18]} args={[0.36, 0.28, 0.03]} mat={M.getFabric(0x1e293b)} />
      <Mesh pos={[0.24, 0.32, 0]} args={[0.03, 0.2, 0.22]} mat={M.getSteel()} />
      <Mesh pos={[-0.24, 0.32, 0]} args={[0.03, 0.2, 0.22]} mat={M.getSteel()} />
    </group>
  );
}

function Monitor({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <Mesh pos={[0, 0.2, 0]} args={[0.18, 0.35, 0.06]} mat={M.getSteel()} />
      <Mesh pos={[0, 0.5, 0]} args={[0.45, 0.3, 0.03]} mat={M.getPaint(0x111827)} />
      <mesh position={[0, 0.5, 0.015]}><planeGeometry args={[0.38, 0.24]} /><meshBasicMaterial color={0x38bdf8} /></mesh>
      <Mesh pos={[0, 0.04, 0]} args={[0.22, 0.02, 0.18]} mat={M.getSteel()} />
    </group>
  );
}

function Toilet({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <Mesh pos={[0, 0.18, 0]} args={[0.32, 0.36, 0.38]} mat={M.getCeramic()} />
      <Mesh pos={[0, 0.45, -0.22]} args={[0.32, 0.35, 0.12]} mat={M.getCeramic()} />
      <CylMesh pos={[0, 0.38, 0.05]} rt={0.12} rb={0.12} h={0.02} mat={M.getPaint(0xe2e8f0)} />
    </group>
  );
}

function WashBasin({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <Mesh pos={[0, 0.3, 0]} args={[0.55, 0.6, 0.4]} mat={M.getWoodDark()} />
      <Mesh pos={[0, 0.58, 0]} args={[0.5, 0.05, 0.38]} mat={M.getCeramic()} />
      <CylMesh pos={[0, 0.65, 0.1]} rt={0.012} rb={0.018} h={0.05} mat={M.getChrome()} />
      {/* Mirror */}
      <mesh position={[0, 0.85, -0.05]}><planeGeometry args={[0.45, 0.45]} /><primitive object={M.getGlass()} /></mesh>
      <Mesh pos={[0, 0.85, -0.03]} args={[0.47, 0.47, 0.015]} mat={M.getBrass()} />
    </group>
  );
}

function Shower({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <Mesh pos={[0, 0.02, 0]} args={[0.85, 0.03, 0.85]} mat={M.getCeramic()} />
      <mesh position={[0.42, 0.55, 0]}><boxGeometry args={[0.015, 1.1, 0.85]} /><primitive object={new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, roughness: 0.02, metalness: 0.9 })} /></mesh>
      <mesh position={[0, 0.55, -0.42]}><boxGeometry args={[0.85, 1.1, 0.015]} /><primitive object={new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, roughness: 0.02, metalness: 0.9 })} /></mesh>
      <CylMesh pos={[0, 1.15, 0]} rt={0.015} rb={0.015} h={0.06} mat={M.getChrome()} />
      <CylMesh pos={[0, 1.05, 0]} rt={0.07} rb={0.09} h={0.015} mat={M.getChrome()} />
    </group>
  );
}

function Bathtub({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <Mesh pos={[0, 0.22, 0]} args={[1.3, 0.45, 0.65]} mat={M.getCeramic()} />
      <Mesh pos={[0, 0.38, 0]} args={[1.1, 0.15, 0.45]} mat={M.getCeramic()} />
      <CylMesh pos={[0.5, 0.47, 0]} rt={0.012} rb={0.018} h={0.06} mat={M.getChrome()} />
      {[[-0.55, -0.08, -0.25], [0.55, -0.08, -0.25], [-0.55, -0.08, 0.25], [0.55, -0.08, 0.25]].map((p, i) => (
        <SphereMesh key={`tf-${i}`} pos={p as Vec3} r={0.025} mat={M.getGold()} />
      ))}
    </group>
  );
}

function PoojaMandir({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <Mesh pos={[0, 0.12, 0]} args={[0.55, 0.25, 0.35]} mat={M.getWoodDark()} />
      <Mesh pos={[0, 0.45, 0]} args={[0.45, 0.4, 0.3]} mat={M.getWoodDark()} />
      <mesh position={[0, 0.7, 0]}><coneGeometry args={[0.22, 0.12, 8]} /><primitive object={M.getGold()} /></mesh>
      <CylMesh pos={[-0.1, 0.42, 0.1]} rt={0.018} rb={0.025} h={0.03} mat={M.getBrass()} />
      <SphereMesh pos={[-0.1, 0.45, 0.02]} r={0.015} mat={new THREE.MeshBasicMaterial({ color: 0xff8c00 })} />
      {/* Idols */}
      {[[-0.08, 0.45, 0.08], [0, 0.45, 0.1], [0.08, 0.45, 0.08]].map((p, i) => (
        <CylMesh key={`idl-${i}`} pos={p as Vec3} rt={0.015} rb={0.015} h={0.1} mat={M.getGold()} />
      ))}
      <Light pos={[0, 0.48, 0.02]} color={0xffa500} intensity={0.3} distance={3} />
    </group>
  );
}

function Plant({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <CylMesh pos={[0, 0.1, 0]} rt={0.08} rb={0.1} h={0.2} mat={M.getCeramic()} />
      <SphereMesh pos={[0, 0.45, 0]} r={0.25} mat={M.getPaint(0x22c55e)} />
      <SphereMesh pos={[0.1, 0.55, 0.08]} r={0.15} mat={M.getPaint(0x16a34a)} />
    </group>
  );
}

function Painting({ pos, rot = 0 }: { pos: Vec3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Mesh pos={[0, 0, 0]} args={[0.55, 0.4, 0.025]} mat={M.getWoodDark()} />
      <mesh position={[0, 0, 0.015]}><planeGeometry args={[0.45, 0.3]} color={0x7c3aed} /></mesh>
      <SphereMesh pos={[0.1, 0.1, 0.015]} r={0.015} mat={M.getGold()} />
      <SphereMesh pos={[-0.12, -0.08, 0.015]} r={0.015} mat={M.getGold()} />
    </group>
  );
}

function Staircase({ pos }: { pos: Vec3 }) {
  const steps: React.ReactNode[] = [];
  for (let i = 0; i < 10; i++) {
    steps.push(
      <Mesh key={`st-${i}`} pos={[0.13 * i, 0.13 * i + 0.065, 0] as Vec3} args={[0.85, 0.13, 0.28] as Vec3} mat={M.getWoodDark()} />
    );
  }
  return <group position={pos}>{steps}</group>;
}

function Car({ pos, rot = 0 }: { pos: Vec3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Mesh pos={[0, 0.25, 0]} args={[1.6, 0.5, 3.8]} mat={M.getPaint(0x1e293b)} />
      <mesh position={[0, 0.55, -0.25]}><boxGeometry args={[1.2, 0.28, 1.8]} /><primitive object={new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, metalness: 0.9, roughness: 0.02 })} /></mesh>
      {[[-0.65, 0.06, -1.1], [0.65, 0.06, -1.1], [-0.65, 0.06, 1.1], [0.65, 0.06, 1.1]].map((wp, i) => (
        <mesh key={`wheel-${i}`} position={wp as Vec3} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.16, 0.16, 0.1, 12]} /><primitive object={M.getPaint(0x111827)} /></mesh>
      ))}
      <mesh position={[-0.45, 0.25, 1.92]}><planeGeometry args={[0.06, 0.04]} color={0xffffff} /></mesh>
      <mesh position={[0.45, 0.25, 1.92]}><planeGeometry args={[0.06, 0.04]} color={0xffffff} /></mesh>
      <mesh position={[-0.45, 0.25, -1.92]}><planeGeometry args={[0.06, 0.04]} color={0xef4444} /></mesh>
      <mesh position={[0.45, 0.25, -1.92]}><planeGeometry args={[0.06, 0.04]} color={0xef4444} /></mesh>
    </group>
  );
}

function Window({ pos, rot = 0 }: { pos: Vec3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Mesh pos={[0, 0.8, 0]} args={[1.1, 1.5, 0.05]} mat={M.getPaint(0x1e293b)} />
      <mesh position={[0, 0.8, 0]}><planeGeometry args={[1.0, 1.4]} /><primitive object={new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.15, roughness: 0.02, metalness: 0.95 })} /></mesh>
    </group>
  );
}

function Door({ pos, rot = 0 }: { pos: Vec3; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <Mesh pos={[0, 1.0, 0]} args={[0.05, 2.0, 0.8]} mat={M.getWoodDark()} />
      <Mesh pos={[0, 1.0, 0.04]} args={[0.03, 1.8, 0.75]} mat={M.getWoodLight()} />
      <CylMesh pos={[0.02, 1.0, 0.09]} rt={0.012} rb={0.012} h={0.04} mat={M.getBrass()} />
    </group>
  );
}

function Chandelier({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <CylMesh pos={[0, -0.25, 0]} rt={0.015} rb={0.015} h={0.5} mat={M.getBrass()} />
      <CylMesh pos={[0, -0.5, 0]} rt={0.12} rb={0.2} h={0.04} mat={M.getBrass()} />
      {[[-0.15, -0.55, 0], [0.15, -0.55, 0], [0, -0.55, 0.15], [0, -0.55, -0.15]].map((lp, i) => (
        <SphereMesh key={`cl-${i}`} pos={lp as Vec3} r={0.05} mat={new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffe4b5, emissiveIntensity: 0.7 })} />
      ))}
      <Light pos={[0, -0.6, 0]} color={0xffe4b5} intensity={0.5} distance={8} />
    </group>
  );
}

function CeilingFan({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <CylMesh pos={[0, -0.05, 0]} rt={0.025} rb={0.04} h={0.1} mat={M.getSteel()} />
      <CylMesh pos={[0, -0.12, 0]} rt={0.05} rb={0.035} h={0.1} mat={M.getSteel()} />
      {[0, 72, 144, 216, 288].map((a, i) => (
        <mesh key={`fb-${i}`} position={[0, -0.15, 0]} rotation={[0, (a * Math.PI) / 180, 0]}>
          <mesh position={[0.65, 0, 0]}><boxGeometry args={[0.55, 0.015, 0.12]} /><primitive object={M.getWoodLight()} /></mesh>
        </mesh>
      ))}
      <SphereMesh pos={[0, -0.18, 0]} r={0.04} mat={new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff3e0, emissiveIntensity: 0.2 })} />
    </group>
  );
}

// ============== LUXURY VILLA ASSEMBLY ==============
// This creates a 2-story luxury villa with all rooms furnished

export function LuxuryVillaInterior({ numFloors = 2 }: { numFloors?: number }) {
  const fh = 3.2; // floor height
  
  return (
    <group>
      {/* ======== GROUND FLOOR ======== */}
      
      {/* Living Room */}
      <Room pos={[-4, 0, -4]} size={[8, fh, 7]} wallColor={0xf5f0eb} floorMat="marble" label="Living Room">
        <Sofa pos={[-1.5, 1.6, -2.5]} rot={Math.PI} />
        <CoffeeTable pos={[-1.5, 1.6, -1.0]} />
        <TVStand pos={[2.5, 1.6, 0]} />
        <Plant pos={[2.5, 1.6, -2.8]} />
        <Painting pos={[-3.5, 1.8, 1.5]} rot={Math.PI / 2} />
        <Chandelier pos={[-1.5, fh, -1.5]} />
        {/* Curtains */}
        <Mesh pos={[3.5, 1.6, -1.5]} args={[0.03, 2.8, 2.5]} mat={M.getFabric(0xf3f4f6)} />
      </Room>
      
      {/* Dining Room */}
      <Room pos={[4, 0, -4]} size={[7, fh, 7]} wallColor={0xf0ece3} floorMat="marble" label="Dining">
        <DiningSet pos={[0, 1.6, 0]} />
        <Chandelier pos={[0, fh, 0]} />
        <Painting pos={[-3.2, 1.8, 1.5]} rot={Math.PI / 2} />
        <Window pos={[0, 1.6, 3.2]} />
      </Room>
      
      {/* Kitchen */}
      <Room pos={[-4, 0, 4]} size={[8, fh, 5]} wallColor={0xf8f9fa} floorMat="ceramic" label="Kitchen">
        <KitchenBlock pos={[0, 1.6, 0.8]} />
        <Fridge pos={[-2.5, 1.6, 0.8]} />
        <Chandelier pos={[1.5, fh, -1.0]} />
        <Window pos={[3.5, 1.6, 0]} />
      </Room>
      
      {/* Prayer Room */}
      <Room pos={[4, 0, 4]} size={[3, fh, 3]} wallColor={0xfef3c7} floorMat="marble" label="Pooja">
        <PoojaMandir pos={[0, 1.6, 0.5]} />
      </Room>

      {/* Entrance Hall */}
      <Room pos={[0, 0, 0]} size={[4, fh, 4]} wallColor={0xf5f0eb} floorMat="marble" label="Entrance">
        <Plant pos={[1.2, 1.6, -1.2]} />
        <Painting pos={[0, 1.8, -1.8]} />
        <Chandelier pos={[0, fh, 0]} />
      </Room>

      {/* Guest Bathroom */}
      <Room pos={[6.5, 0, 4]} size={[2, fh, 2.5]} wallColor={0xe8f4f8} floorMat="ceramic" label="Guest Bath">
        <WashBasin pos={[0, 1.6, -0.5]} />
        <Toilet pos={[0, 1.6, 0.6]} />
      </Room>

      {/* Staircase Hall */}
      <Room pos={[-6, 0, 4]} size={[2, fh, 3]} wallColor={0xf0ece3} floorMat="wood" label="Stairs">
        <Staircase pos={[0, 1.6, 0.5]} />
        <Painting pos={[0, 1.8, -1.2]} />
      </Room>

      {/* Garage */}
      <Room pos={[0, 0, 6.5]} size={[6, fh, 4]} wallColor={0xd1d5db} floorMat="concrete" label="Garage">
        <Car pos={[0, 1.6, 0]} />
      </Room>

      {/* ======== FIRST FLOOR ======== */}
      
      {/* Master Bedroom */}
      <Room pos={[-4, fh, -4]} size={[8, fh, 6]} wallColor={0xf0ece3} floorMat="wood" label="Master Bedroom">
        <KingBed pos={[-1.5, 1.6, 0]} rot={0} />
        <BedsideTable pos={[-2.5, 1.6, 0.5]} />
        <BedsideTable pos={[-0.5, 1.6, 0.5]} />
        <Wardrobe pos={[2.5, 1.6, 1.5]} rot={Math.PI} />
        <CeilingFan pos={[-1.5, fh, 0]} />
        <Plant pos={[2.5, 1.6, -2.0]} />
        <Painting pos={[3.5, 2.0, 0]} />
        {/* AC */}
        <Mesh pos={[-2.5, 2.0, -2.8]} args={[0.7, 0.25, 0.18]} mat={M.getPaint(0xf3f4f6)} />
      </Room>

      {/* Bedroom 2 */}
      <Room pos={[4, fh, -4]} size={[5, fh, 5]} wallColor={0xfef3c7} floorMat="wood" label="Bedroom 2">
        <KingBed pos={[0, 1.6, 0.5]} rot={0} />
        <BedsideTable pos={[-0.9, 1.6, 1.2]} />
        <BedsideTable pos={[0.9, 1.6, 1.2]} />
        <Desk pos={[-1.5, 1.6, -1.5]} />
        <Chair pos={[-1.5, 1.6, -0.8]} rot={Math.PI} />
        <Monitor pos={[-1.5, 1.6, -1.5]} />
        <Wardrobe pos={[1.8, 1.6, 1.8]} rot={Math.PI} />
        <CeilingFan pos={[0, fh, 0]} />
      </Room>

      {/* Bedroom 3 */}
      <Room pos={[-4, fh, 3]} size={[5, fh, 5]} wallColor={0xf0fdf4} floorMat="wood" label="Bedroom 3">
        <KingBed pos={[0, 1.6, 0.5]} rot={0} />
        <BedsideTable pos={[-0.9, 1.6, 1.2]} />
        <BedsideTable pos={[0.9, 1.6, 1.2]} />
        <Wardrobe pos={[1.8, 1.6, 1.8]} rot={Math.PI} />
        <Window pos={[2.2, 1.6, 0]} />
        <CeilingFan pos={[0, fh, 0]} />
      </Room>

      {/* Children's Room */}
      <Room pos={[4, fh, 3]} size={[5, fh, 5]} wallColor={0xdbeafe} floorMat="wood" label="Children">
        <Mesh pos={[0, fh - 0.1, 0]} args={[0.8, 0.04, 0.8]} mat={M.getPaint(0x60a5fa)} />
        <Mesh pos={[0, 1.6, 0.5]} args={[0.85, 0.22, 1.8]} mat={M.getFabric(0xe2e8f0)} />
        <Desk pos={[-1.5, 1.6, -1.5]} />
        <Chair pos={[-1.5, 1.6, -0.8]} rot={Math.PI} />
        <Mesh pos={[1.5, 1.6, -1.2]} args={[0.45, 0.35, 0.35]} mat={M.getPaint(0x60a5fa)} />
        <CeilingFan pos={[0, fh, 0]} />
        {/* Toys */}
        <SphereMesh pos={[1.55, 1.9, -1.2]} r={0.04} mat={M.getPaint(0xef4444)} />
        <Mesh pos={[1.4, 1.9, -1.15]} args={[0.03, 0.06, 0.03]} mat={M.getPaint(0xf59e0b)} />
      </Room>

      {/* Home Office */}
      <Room pos={[-6, fh, 0]} size={[3, fh, 4]} wallColor={0xf0ece3} floorMat="wood" label="Office">
        <Desk pos={[0, 1.6, -0.5]} />
        <Chair pos={[0, 1.6, 0.5]} rot={0} />
        <Monitor pos={[0, 1.6, -0.5]} />
        <Mesh pos={[0.8, 1.6, 1.2]} args={[0.35, 0.18, 0.3]} mat={M.getPaint(0x1e293b)} />
        <Mesh pos={[0.8, 1.6, 0.8]} args={[0.2, 0.015, 0.25]} mat={M.getPaint(0xffffff)} />
        {/* Whiteboard */}
        <Mesh pos={[0, 2.0, 1.8]} args={[1.0, 0.55, 0.025]} mat={M.getPaint(0xffffff)} />
      </Room>

      {/* Bathroom */}
      <Room pos={[6, fh, 0]} size={[3, fh, 3.5]} wallColor={0xe8f4f8} floorMat="ceramic" label="Bathroom">
        <WashBasin pos={[-0.5, 1.6, -0.8]} />
        <Toilet pos={[0.5, 1.6, -0.8]} />
        <Shower pos={[0, 1.6, 0.8]} />
      </Room>

      {/* Guest Bath */}
      <Room pos={[6, fh, 3.5]} size={[2.5, fh, 2.5]} wallColor={0xe8f4f8} floorMat="ceramic" label="Guest Bath">
        <WashBasin pos={[0, 1.6, -0.3]} />
        <Toilet pos={[0, 1.6, 0.6]} />
      </Room>

      {/* Laundry */}
      <Room pos={[-4, fh, 6]} size={[3, fh, 2.5]} wallColor={0xf0ece3} floorMat="ceramic" label="Laundry">
        <Mesh pos={[0, 1.6, 0]} args={[0.55, 0.8, 0.55]} mat={M.getSteel()} />
        <CylMesh pos={[0, 1.6, 0.3]} rt={0.18} rb={0.18} h={0.015} mat={M.getGlass()} />
      </Room>

      {/* Balcony */}
      <Room pos={[0, fh, 6]} size={[6, fh, 2.5]} wallColor={0x94a3b8} floorMat="ceramic" label="Balcony">
        <Mesh pos={[-1.5, 1.6, -0.5]} args={[0.4, 0.04, 0.4]} mat={M.getWoodDark()} />
        <Mesh pos={[-1.5, 1.4, -0.5]} args={[0.38, 0.4, 0.38]} mat={M.getWoodDark()} />
        <Plant pos={[1.5, 1.6, -0.5]} />
        <Plant pos={[-2.0, 1.6, 0.5]} />
        {/* Glass railing */}
        <mesh position={[0, 1.1, 1.1]}><boxGeometry args={[5.8, 1.0, 0.02]} /><primitive object={new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.15, roughness: 0.02, metalness: 0.9 })} /></mesh>
      </Room>

      {/* Terrace Rooftop */}
      <Room pos={[0, fh * 1.5, 0]} size={[8, fh / 2, 6]} wallColor={0x94a3b8} floorMat="ceramic" label="Terrace">
        {/* Solar panels */}
        {[[-2, -1], [2, -1], [-2, 1], [2, 1]].map((p, i) => (
          <mesh key={`sol-${i}`} position={[p[0], 0.3, p[1]]} rotation={[-0.15, 0, 0]}>
            <boxGeometry args={[1.8, 0.03, 2.8]} /><primitive object={new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 })} />
          </mesh>
        ))}
        {/* Water tank */}
        <CylMesh pos={[2.5, 1.0, 1.5]} rt={0.8} rb={0.8} h={2.0} mat={M.getPaint(0x94a3b8)} />
        {/* AC outdoor units */}
        <Mesh pos={[-2.5, 0.5, -1.5]} args={[0.8, 0.6, 0.35]} mat={M.getSteel()} />
        <Mesh pos={[-2.5, 1.0, -1.5]} args={[0.8, 0.6, 0.35]} mat={M.getSteel()} />
      </Room>
    </group>
  );
}
