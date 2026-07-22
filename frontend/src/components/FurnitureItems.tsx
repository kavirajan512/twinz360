import React from 'react';
import * as THREE from 'three';
import { PBRMaterials as M } from './PBRMaterials';

// ============== UTILITY HELPERS ==============
const deg = (d: number) => (d * Math.PI) / 180;

interface Pos { position?: [number, number, number]; rotation?: [number, number, number]; }
const g = (children: React.ReactNode, pos?: Pos) => <group position={pos?.position || [0, 0, 0]} rotation={pos?.rotation ? pos.rotation.map(deg) as [number, number, number] : [0, 0, 0]}>{children}</group>;

// ============== LIVING ROOM FURNITURE ==============
export const LSofa = (p: Pos) => g(<>
  {/* Main seat */}
  <mesh position={[0, 0.25, 0]} castShadow receiveShadow><boxGeometry args={[2.4, 0.5, 0.9]} /><primitive object={M.getFabric(0x94a3b8)} /></mesh>
  {/* Backrest */}
  <mesh position={[0, 0.65, -0.35]} castShadow><boxGeometry args={[2.4, 0.6, 0.2]} /><primitive object={M.getFabric(0x94a3b8)} /></mesh>
  {/* L-extension */}
  <mesh position={[0.8, 0.25, 0.7]} castShadow receiveShadow><boxGeometry args={[0.9, 0.5, 1.4]} /><primitive object={M.getFabric(0x94a3b8)} /></mesh>
  {/* Cushions */}
  <mesh position={[-0.6, 0.6, 0.2]} castShadow><boxGeometry args={[0.6, 0.15, 0.5]} /><primitive object={M.getFabric(0xd1d5db)} /></mesh>
  <mesh position={[0.4, 0.6, 0.2]} castShadow><boxGeometry args={[0.6, 0.15, 0.5]} /><primitive object={M.getFabric(0xd1d5db)} /></mesh>
  {/* Legs */}
  {[[-1.0, -0.25, -0.35], [1.0, -0.25, -0.35], [-1.0, -0.25, 0.35], [1.0, -0.25, 0.35], [0.8, -0.25, 1.2], [0.8, -0.25, 0.2]].map((pos, i) => (
    <mesh key={`leg-${i}`} position={pos} castShadow><cylinderGeometry args={[0.03, 0.03, 0.25, 6]} /><primitive object={M.getChrome()} /></mesh>
  ))}
</>, p);

export const CenterTable = (p: Pos) => g(<>
  <mesh position={[0, 0.2, 0]} castShadow receiveShadow><boxGeometry args={[1.2, 0.06, 0.7]} /><primitive object={M.getMarbleFloor()} /></mesh>
  <mesh position={[0, 0.35, 0]} castShadow><boxGeometry args={[1.15, 0.03, 0.65]} /><primitive object={M.getWoodDark()} /></mesh>
  {[[-0.5, -0.15, -0.25], [0.5, -0.15, -0.25], [-0.5, -0.15, 0.25], [0.5, -0.15, 0.25]].map((pos, i) => (
    <mesh key={`cl-${i}`} position={pos} castShadow><cylinderGeometry args={[0.025, 0.035, 0.35, 6]} /><primitive object={M.getBrass()} /></mesh>
  ))}
  {/* Decor */}
  <mesh position={[0.3, 0.45, 0.2]} castShadow><boxGeometry args={[0.08, 0.15, 0.08]} /><primitive object={M.getGlass()} /></mesh>
  <mesh position={[-0.25, 0.45, -0.15]} castShadow><cylinderGeometry args={[0.04, 0.06, 0.12, 8]} /><primitive object={M.getBrass()} /></mesh>
</>, p);

export const TVUnit = (p: Pos) => g(<>
  {/* Cabinet */}
  <mesh position={[0, 0.3, 0]} castShadow receiveShadow><boxGeometry args={[2.0, 0.6, 0.4]} /><primitive object={M.getWoodDark()} /></mesh>
  <mesh position={[0, 0.62, 0.05]} castShadow><boxGeometry args={[1.8, 0.02, 0.35]} /><primitive object={M.getWhiteMarble()} /></mesh>
  {/* TV Screen */}
  <mesh position={[0, 1.1, 0.02]} castShadow><boxGeometry args={[1.6, 0.9, 0.04]} /><primitive object={new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.1 })} /></mesh>
  <mesh position={[0, 1.1, 0.06]}><planeGeometry args={[1.5, 0.85]} /><primitive object={new THREE.MeshBasicMaterial({ color: 0x38bdf8 })} /></mesh>
  {/* Soundbar */}
  <mesh position={[0, 0.5, 0.12]} castShadow><boxGeometry args={[1.0, 0.06, 0.08]} /><primitive object={M.getSteel()} /></mesh>
  {/* Cabinet doors */}
  <mesh position={[-0.5, 0.3, 0.22]}><boxGeometry args={[0.45, 0.5, 0.02]} /><primitive object={M.getWoodLight()} /></mesh>
  <mesh position={[0.5, 0.3, 0.22]}><boxGeometry args={[0.45, 0.5, 0.02]} /><primitive object={M.getWoodLight()} /></mesh>
  {/* Handles */}
  <mesh position={[-0.5, 0.3, 0.24]}><boxGeometry args={[0.02, 0.06, 0.02]} /><primitive object={M.getBrass()} /></mesh>
  <mesh position={[0.5, 0.3, 0.24]}><boxGeometry args={[0.02, 0.06, 0.02]} /><primitive object={M.getBrass()} /></mesh>
</>, p);

export const Bookshelf = (p: Pos) => g(<>
  <mesh position={[0, 0.8, 0]} castShadow receiveShadow><boxGeometry args={[1.2, 1.6, 0.3]} /><primitive object={M.getWoodDark()} /></mesh>
  {/* Shelves */}
  {[0.2, 0.6, 1.0, 1.4].map((y, i) => (
    <mesh key={`shelf-${i}`} position={[0, y, 0.12]} castShadow><boxGeometry args={[1.15, 0.03, 0.25]} /><primitive object={M.getWoodLight()} /></mesh>
  ))}
  {/* Books */}
  {Array.from({ length: 20 }).map((_, i) => (
    <mesh key={`book-${i}`} position={[-0.45 + (i % 5) * 0.22, 0.4 + Math.floor(i / 5) * 0.4, 0.05]} castShadow>
      <boxGeometry args={[0.06, 0.25 + Math.random() * 0.15, 0.18]} />
      <primitive object={M.getPaint([0x8b5cf6, 0xef4444, 0x10b981, 0xf59e0b, 0x3b82f6][i % 5])} />
    </mesh>
  ))}
  {/* Decor items */}
  <mesh position={[0.4, 0.4, 0.05]} castShadow><cylinderGeometry args={[0.05, 0.07, 0.2, 8]} /><primitive object={M.getBrass()} /></mesh>
</>, p);

export const IndoorPlant = (p: Pos) => g(<>
  <mesh position={[0, 0.15, 0]} castShadow><cylinderGeometry args={[0.1, 0.12, 0.3, 8]} /><primitive object={M.getPaint(0x8b4513)} /></mesh>
  <mesh position={[0, 0.6, 0]} castShadow><sphereGeometry args={[0.3, 8, 8]} /><primitive object={M.getPaint(0x22c55e)} /></mesh>
  <mesh position={[0.15, 0.75, 0.1]} castShadow><sphereGeometry args={[0.2, 8, 8]} /><primitive object={M.getPaint(0x16a34a)} /></mesh>
  <mesh position={[-0.12, 0.7, -0.08]} castShadow><sphereGeometry args={[0.18, 8, 8]} /><primitive object={M.getPaint(0x15803d)} /></mesh>
</>, p);

export const Carpet = (p: Pos) => g(<>
  <mesh position={[0, 0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.0, 1.5]} /><primitive object={M.getFabric(0x6b7280)} /></mesh>
  <mesh position={[0, 0.015, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.6, 1.1]} /><primitive object={M.getFabric(0x9ca3af)} /></mesh>
</>, p);

export const Curtains = (p: Pos) => g(<>
  <mesh position={[-0.9, 1.5, 0]}><boxGeometry args={[0.04, 3.0, 2.8]} /><primitive object={M.getFabric(0xf3f4f6)} /></mesh>
  <mesh position={[0.9, 1.5, 0]}><boxGeometry args={[0.04, 3.0, 2.8]} /><primitive object={M.getFabric(0xf3f4f6)} /></mesh>
  {/* Curtain rod */}
  <mesh position={[0, 2.8, 0]} castShadow><cylinderGeometry args={[0.025, 0.025, 2.0, 8]} rotation={[0, 0, Math.PI / 2]} /><primitive object={M.getBrass()} /></mesh>
  {[-0.9, 0.9].map((x, i) => (
    <mesh key={`rod-end-${i}`} position={[x, 2.8, 0]}><sphereGeometry args={[0.04, 8, 8]} /><primitive object={M.getChrome()} /></mesh>
  ))}
</>, p);

export const Chandelier = (p: Pos) => g(<>
  <mesh position={[0, -0.3, 0]}><cylinderGeometry args={[0.02, 0.02, 0.6, 6]} /><primitive object={M.getBrass()} /></mesh>
  <mesh position={[0, -0.6, 0]}><cylinderGeometry args={[0.15, 0.25, 0.05, 12]} /><primitive object={M.getBrass()} /></mesh>
  {/* Lights */}
  {[[-0.2, -0.65, 0], [0.2, -0.65, 0], [0, -0.65, 0.2], [0, -0.65, -0.2]].map((pos, i) => (
    <mesh key={`clight-${i}`} position={pos}><sphereGeometry args={[0.06, 8, 8]} /><primitive object={new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffe4b5, emissiveIntensity: 0.5 })} /></mesh>
  ))}
  <pointLight position={[0, -0.7, 0]} intensity={0.4} distance={6} color={0xffe4b5} />
</>, p);

// ============== KITCHEN ==============
export const KitchenIsland = (p: Pos) => g(<>
  <mesh position={[0, 0.45, 0]} castShadow receiveShadow><boxGeometry args={[1.8, 0.9, 0.8]} /><primitive object={M.getPaint(0xf3f4f6)} /></mesh>
  {/* Marble top */}
  <mesh position={[0, 0.9, 0]} castShadow><boxGeometry args={[1.85, 0.04, 0.85]} /><primitive object={M.getWhiteMarble()} /></mesh>
  {/* Drawers */}
  <mesh position={[-0.4, 0.35, 0.42]}>
    <boxGeometry args={[0.35, 0.4, 0.02]} /><primitive object={M.getPaint(0xd1d5db)} /></mesh>
  <mesh position={[0.4, 0.35, 0.42]}>
    <boxGeometry args={[0.35, 0.4, 0.02]} /><primitive object={M.getPaint(0xd1d5db)} /></mesh>
  {[-0.4, 0.4].map((x, i) => (
    <mesh key={`kh-${i}`} position={[x, 0.45, 0.44]}><boxGeometry args={[0.03, 0.03, 0.02]} /><primitive object={M.getBrass()} /></mesh>
  ))}
</>, p);

export const Fridge = (p: Pos) => g(<>
  <mesh position={[0, 0.9, 0]} castShadow receiveShadow><boxGeometry args={[0.7, 1.8, 0.7]} /><primitive object={M.getSteel()} /></mesh>
  {/* Door */}
  <mesh position={[0, 0.9, 0.37]}><boxGeometry args={[0.65, 1.75, 0.02]} /><primitive object={M.getSteel()} /></mesh>
  <mesh position={[0.25, 0.9, 0.38]}><cylinderGeometry args={[0.02, 0.02, 0.02, 8]} /><primitive object={M.getChrome()} /></mesh>
  {/* Freezer door */}
  <mesh position={[0, 1.7, 0.37]}><boxGeometry args={[0.65, 0.35, 0.02]} /><primitive object={M.getSteel()} /></mesh>
</>, p);

export const Stove = (p: Pos) => g(<>
  <mesh position={[0, 0.4, 0]} castShadow receiveShadow><boxGeometry args={[0.7, 0.8, 0.6]} /><primitive object={M.getSteel()} /></mesh>
  {/* Burners */}
  {[[-0.2, 0.82, -0.15], [0.2, 0.82, -0.15], [-0.2, 0.82, 0.15], [0.2, 0.82, 0.15]].map((pos, i) => (
    <mesh key={`burner-${i}`} position={pos}><cylinderGeometry args={[0.07, 0.09, 0.02, 12]} /><primitive object={M.getPaint(0x1f2937)} /></mesh>
  ))}
  {/* Knobs */}
  {[-0.25, -0.08, 0.08, 0.25].map((x, i) => (
    <mesh key={`knob-${i}`} position={[x, 0.45, 0.32]}><cylinderGeometry args={[0.03, 0.03, 0.04, 8]} /><primitive object={M.getBrass()} /></mesh>
  ))}
</>, p);

export const Chimney = (p: Pos) => g(<>
  <mesh position={[0, 0.3, 0]} castShadow><boxGeometry args={[0.6, 0.15, 0.5]} /><primitive object={M.getSteel()} /></mesh>
  <mesh position={[0, 0.75, 0]}><boxGeometry args={[0.5, 1.2, 0.4]} /><primitive object={M.getChrome()} /></mesh>
  <mesh position={[0, 1.35, 0]}><cylinderGeometry args={[0.12, 0.15, 0.3, 8]} /><primitive object={M.getSteel()} /></mesh>
</>, p);

export const KitchenSink = (p: Pos) => g(<>
  <mesh position={[0, 0.45, 0]} castShadow receiveShadow><boxGeometry args={[0.8, 0.9, 0.6]} /><primitive object={M.getPaint(0xf3f4f6)} /></mesh>
  <mesh position={[0, 0.9, 0]} castShadow><boxGeometry args={[0.85, 0.04, 0.65]} /><primitive object={M.getGranite()} /></mesh>
  {/* Sink basin */}
  <mesh position={[0.15, 0.88, 0]}><boxGeometry args={[0.25, 0.04, 0.4]} /><primitive object={M.getSteel()} /></mesh>
  <mesh position={[-0.15, 0.88, 0]}><boxGeometry args={[0.25, 0.04, 0.4]} /><primitive object={M.getSteel()} /></mesh>
  {/* Faucet */}
  <mesh position={[0, 0.95, 0.25]}><cylinderGeometry args={[0.02, 0.03, 0.08, 8]} /><primitive object={M.getChrome()} /></mesh>
  <mesh position={[0, 1.0, 0.15]}><cylinderGeometry args={[0.015, 0.015, 0.15, 6]} rotation={[0.3, 0, 0]} /><primitive object={M.getChrome()} /></mesh>
</>, p);

export const Microwave = (p: Pos) => g(<>
  <mesh position={[0, 0.15, 0]} castShadow><boxGeometry args={[0.5, 0.3, 0.35]} /><primitive object={M.getSteel()} /></mesh>
  {/* Glass door */}
  <mesh position={[0, 0.15, 0.18]}><planeGeometry args={[0.35, 0.2]} /><primitive object={M.getGlass()} /></mesh>
  {/* Display */}
  <mesh position={[0.15, 0.25, 0.18]}><planeGeometry args={[0.08, 0.04]} /><primitive object={new THREE.MeshBasicMaterial({ color: 0x38bdf8 })} /></mesh>
  {/* Buttons */}
  {[-0.15, -0.08, 0.08, 0.15].map((x, i) => (
    <mesh key={`mwbtn-${i}`} position={[x, 0.08, 0.18]}><planeGeometry args={[0.03, 0.03]} /><primitive object={new THREE.MeshBasicMaterial({ color: 0x9ca3af })} /></mesh>
  ))}
</>, p);

export const Oven = (p: Pos) => g(<>
  <mesh position={[0, 0.25, 0]} castShadow><boxGeometry args={[0.55, 0.5, 0.5]} /><primitive object={M.getSteel()} /></mesh>
  <mesh position={[0, 0.25, 0.26]}><boxGeometry args={[0.4, 0.35, 0.02]} /><primitive object={M.getGlass()} /></mesh>
  <mesh position={[0.2, 0.25, 0.26]}><cylinderGeometry args={[0.015, 0.015, 0.02, 6]} /><primitive object={M.getChrome()} /></mesh>
</>, p);

export const DiningTable = (p: Pos) => g(<>
  {/* Tabletop */}
  <mesh position={[0, 0.75, 0]} castShadow receiveShadow><boxGeometry args={[2.0, 0.05, 1.2]} /><primitive object={M.getWhiteMarble()} /></mesh>
  {/* Base */}
  <mesh position={[0, 0.35, 0]} castShadow><boxGeometry args={[1.8, 0.6, 1.0]} /><primitive object={M.getWoodDark()} /></mesh>
  {/* Chairs */}
  {[[-1.3, 0, -0.8], [1.3, 0, -0.8], [-1.3, 0, 0.8], [1.3, 0, 0.8], [-0.7, 0, -1.0], [0.7, 0, -1.0], [-0.7, 0, 1.0], [0.7, 0, 1.0]].map((pos, i) => (
    <group key={`chair-${i}`} position={[pos[0], 0, pos[2]]}>
      <mesh position={[0, 0.25, 0]} castShadow><boxGeometry args={[0.4, 0.05, 0.4]} /><primitive object={M.getWoodDark()} /></mesh>
      <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[0.38, 0.35, 0.38]} /><primitive object={M.getLeather(0x1f2937)} /></mesh>
      <mesh position={[0, 0.62, -0.2]}><boxGeometry args={[0.38, 0.3, 0.04]} /><primitive object={M.getLeather(0x1f2937)} /></mesh>
      {[[-0.17, 0.12, -0.17], [0.17, 0.12, -0.17], [-0.17, 0.12, 0.17], [0.17, 0.12, 0.17]].map((lp, j) => (
        <mesh key={`cl-${i}-${j}`} position={[lp[0], -0.15, lp[2]]}><cylinderGeometry args={[0.02, 0.025, 0.4, 6]} /><primitive object={M.getBrass()} /></mesh>
      ))}
    </group>
  ))}
  {/* Center decor */}
  <mesh position={[0, 0.85, 0]}><cylinderGeometry args={[0.04, 0.06, 0.15, 8]} /><primitive object={M.getGlass()} /></mesh>
  <mesh position={[0, 0.95, 0]}><sphereGeometry args={[0.06, 8, 8]} /><primitive object={M.getPaint(0x22c55e)} /></mesh>
</>, p);

// ============== BEDROOM FURNITURE ==============
export const KingBed = (p: Pos) => g(<>
  {/* Mattress */}
  <mesh position={[0, 0.15, 0]} castShadow receiveShadow><boxGeometry args={[1.8, 0.3, 2.0]} /><primitive object={M.getFabric(0xf3f4f6)} /></mesh>
  {/* Base */}
  <mesh position={[0, 0.05, 0]} castShadow><boxGeometry args={[1.82, 0.1, 2.02]} /><primitive object={M.getWoodDark()} /></mesh>
  {/* Headboard */}
  <mesh position={[0, 0.7, -1.05]} castShadow><boxGeometry args={[1.85, 1.2, 0.1]} /><primitive object={M.getLeather(0x4a3728)} /></mesh>
  {/* Pillows */}
  <mesh position={[-0.5, 0.4, -0.6]} castShadow><boxGeometry args={[0.6, 0.15, 0.5]} /><primitive object={M.getFabric(0xffffff)} /></mesh>
  <mesh position={[0.5, 0.4, -0.6]} castShadow><boxGeometry args={[0.6, 0.15, 0.5]} /><primitive object={M.getFabric(0xffffff)} /></mesh>
  {/* Blanket */}
  <mesh position={[0, 0.35, 0.3]} castShadow><boxGeometry args={[1.6, 0.08, 1.2]} /><primitive object={M.getFabric(0x475569)} /></mesh>
  {/* Bed legs */}
  {[[-0.85, -0.1, -0.9], [0.85, -0.1, -0.9], [-0.85, -0.1, 0.9], [0.85, -0.1, 0.9]].map((pos, i) => (
    <mesh key={`bl-${i}`} position={pos} castShadow><cylinderGeometry args={[0.03, 0.04, 0.2, 6]} /><primitive object={M.getChrome()} /></mesh>
  ))}
</>, p);

export const BedsideTable = (p: Pos) => g(<>
  <mesh position={[0, 0.3, 0]} castShadow receiveShadow><boxGeometry args={[0.45, 0.6, 0.45]} /><primitive object={M.getWoodDark()} /></mesh>
  <mesh position={[0, 0.62, 0]} castShadow><boxGeometry args={[0.48, 0.04, 0.48]} /><primitive object={M.getWhiteMarble()} /></mesh>
  {/* Drawer */}
  <mesh position={[0, 0.25, 0.24]}><boxGeometry args={[0.38, 0.12, 0.02]} /><primitive object={M.getWoodLight()} /></mesh>
  <mesh position={[0.15, 0.25, 0.25]}><cylinderGeometry args={[0.01, 0.01, 0.02, 6]} /><primitive object={M.getBrass()} /></mesh>
  {/* Lamp */}
  <mesh position={[-0.12, 0.7, -0.1]}><cylinderGeometry args={[0.03, 0.04, 0.15, 8]} /><primitive object={M.getBrass()} /></mesh>
  <mesh position={[-0.12, 0.85, -0.1]}><sphereGeometry args={[0.08, 8, 8]} /><primitive object={new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffe4b5, emissiveIntensity: 0.3 })} /></mesh>
  <pointLight position={[-0.12, 0.9, -0.1]} intensity={0.2} distance={3} color={0xffe4b5} />
</>, p);

export const Wardrobe = (p: Pos) => g(<>
  <mesh position={[0, 0.9, 0]} castShadow receiveShadow><boxGeometry args={[2.0, 1.8, 0.6]} /><primitive object={M.getWoodDark()} /></mesh>
  {/* Doors */}
  <mesh position={[-0.5, 0.9, 0.32]}><boxGeometry args={[0.45, 1.7, 0.02]} /><primitive object={M.getWoodLight()} /></mesh>
  <mesh position={[0.5, 0.9, 0.32]}><boxGeometry args={[0.45, 1.7, 0.02]} /><primitive object={M.getWoodLight()} /></mesh>
  {/* Mirror on left door */}
  <mesh position={[-0.5, 0.9, 0.34]}><planeGeometry args={[0.3, 1.2]} /><primitive object={M.getGlass()} /></mesh>
  {/* Handles */}
  <mesh position={[-0.5, 0.9, 0.34]}><cylinderGeometry args={[0.015, 0.015, 0.04, 6]} rotation={[0, 1.57, 0]} /><primitive object={M.getBrass()} /></mesh>
  <mesh position={[0.5, 0.9, 0.34]}><cylinderGeometry args={[0.015, 0.015, 0.04, 6]} rotation={[0, 1.57, 0]} /><primitive object={M.getBrass()} /></mesh>
</>, p);

export const DressingTable = (p: Pos) => g(<>
  {/* Table */}
  <mesh position={[0, 0.4, 0]} castShadow receiveShadow><boxGeometry args={[0.8, 0.8, 0.45]} /><primitive object={M.getPaint(0xf3f4f6)} /></mesh>
  <mesh position={[0, 0.82, 0]} castShadow><boxGeometry args={[0.85, 0.04, 0.5]} /><primitive object={M.getWhiteMarble()} /></mesh>
  {/* Mirror */}
  <mesh position={[0, 1.2, -0.12]}><boxGeometry args={[0.7, 0.7, 0.03]} /><primitive object={M.getGlass()} /></mesh>
  <mesh position={[0, 1.2, -0.1]}><boxGeometry args={[0.72, 0.72, 0.02]} /><primitive object={M.getBrass()} /></mesh>
  {/* Stool */}
  <mesh position={[0, 0.2, 0.3]} castShadow><boxGeometry args={[0.35, 0.04, 0.25]} /><primitive object={M.getFabric(0x9ca3af)} /></mesh>
  <mesh position={[0, 0.1, 0.3]} castShadow><boxGeometry args={[0.35, 0.16, 0.25]} /><primitive object={M.getWoodDark()} /></mesh>
</>, p);

export const CeilingFan = (p: Pos) => g(<>
  {/* Mount */}
  <mesh position={[0, -0.05, 0]}><cylinderGeometry args={[0.03, 0.05, 0.1, 8]} /><primitive object={M.getSteel()} /></mesh>
  {/* Body */}
  <mesh position={[0, -0.15, 0]}><cylinderGeometry args={[0.06, 0.04, 0.12, 8]} /><primitive object={M.getSteel()} /></mesh>
  {/* Blades */}
  {[0, 72, 144, 216, 288].map((angle, i) => (
    <mesh key={`blade-${i}`} position={[0, -0.18, 0]} rotation={[0, (angle * Math.PI) / 180, 0]} castShadow>
      <mesh position={[0.7, 0, 0]}><boxGeometry args={[0.6, 0.02, 0.15]} /><primitive object={M.getWoodLight()} /></mesh>
    </mesh>
  ))}
  {/* Light */}
  <mesh key="fan-light" position={[0, -0.22, 0]}><sphereGeometry args={[0.05, 8, 8]} /><primitive object={new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff3e0, emissiveIntensity: 0.2 })} /></mesh>
</>, p);

export const AC = (p: Pos) => g(<>
  {/* Indoor unit */}
  <mesh position={[0, 0.3, 0]} castShadow><boxGeometry args={[0.8, 0.3, 0.2]} /><primitive object={M.getPaint(0xf3f4f6)} /></mesh>
  {/* Vents */}
  <mesh position={[0, 0.28, 0.12]}><boxGeometry args={[0.7, 0.04, 0.02]} /><primitive object={M.getSteel()} /></mesh>
  {/* Display */}
  <mesh position={[0.3, 0.32, 0.12]}><planeGeometry args={[0.06, 0.03]} /><primitive object={new THREE.MeshBasicMaterial({ color: 0x38bdf8 })} /></mesh>
  {/* Outdoor unit */}
  <mesh position={[0, 0.15, -0.5]} castShadow><boxGeometry args={[0.7, 0.5, 0.3]} /><primitive object={M.getSteel()} /></mesh>
</>, p);

// ============== CHILDREN'S ROOM ==============
export const SingleBed = (p: Pos) => g(<>
  <mesh position={[0, 0.12, 0]} castShadow receiveShadow><boxGeometry args={[0.9, 0.24, 1.9]} /><primitive object={M.getFabric(0xe2e8f0)} /></mesh>
  <mesh position={[0, 0.04, 0]} castShadow><boxGeometry args={[0.92, 0.08, 1.92]} /><primitive object={M.getWoodLight()} /></mesh>
  <mesh position={[0, 0.45, -0.95]} castShadow><boxGeometry args={[0.7, 0.6, 0.08]} /><primitive object={M.getPaint(0x60a5fa)} /></mesh>
  <mesh position={[-0.3, 0.3, -0.6]} castShadow><boxGeometry args={[0.35, 0.12, 0.4]} /><primitive object={M.getFabric(0xffffff)} /></mesh>
  {[[-0.42, -0.08, -0.9], [0.42, -0.08, -0.9], [-0.42, -0.08, 0.9], [0.42, -0.08, 0.9]].map((pos, i) => (
    <mesh key={`sl-${i}`} position={pos} castShadow><cylinderGeometry args={[0.025, 0.03, 0.16, 6]} /><primitive object={M.getChrome()} /></mesh>
  ))}
</>, p);

export const StudyDesk = (p: Pos) => g(<>
  <mesh position={[0, 0.35, 0]} castShadow receiveShadow><boxGeometry args={[0.8, 0.04, 0.5]} /><primitive object={M.getWoodLight()} /></mesh>
  {/* Legs */}
  {[[-0.35, 0.17, -0.2], [0.35, 0.17, -0.2], [-0.35, 0.17, 0.2], [0.35, 0.17, 0.2]].map((pos, i) => (
    <mesh key={`dl-${i}`} position={pos} castShadow><boxGeometry args={[0.03, 0.35, 0.03]} /><primitive object={M.getSteel()} /></mesh>
  ))}
  {/* Drawer */}
  <mesh position={[0, 0.18, -0.27]}><boxGeometry args={[0.7, 0.12, 0.02]} /><primitive object={M.getWoodLight()} /></mesh>
  {/* Chair */}
  <mesh position={[0, -0.35, 0.3]}>
    <mesh position={[0, 0.2, 0]} castShadow><boxGeometry args={[0.3, 0.04, 0.3]} /><primitive object={M.getWoodDark()} /></mesh>
    <mesh position={[0, 0.35, 0]} castShadow><boxGeometry args={[0.28, 0.25, 0.28]} /><primitive object={M.getFabric(0x3b82f6)} /></mesh>
    <mesh position={[0, 0.5, -0.15]}><boxGeometry args={[0.28, 0.2, 0.04]} /><primitive object={M.getFabric(0x3b82f6)} /></mesh>
  </mesh>
</>, p);

export const ToyBox = (p: Pos) => g(<>
  <mesh position={[0, 0.2, 0]} castShadow receiveShadow><boxGeometry args={[0.5, 0.4, 0.4]} /><primitive object={M.getPaint(0x60a5fa)} /></mesh>
  <mesh position={[0, 0.42, 0]}><boxGeometry args={[0.52, 0.04, 0.42]} /><primitive object={M.getPaint(0x93c5fd)} /></mesh>
  {/* Toys peeking out */}
  <mesh position={[-0.1, 0.5, -0.1]}><sphereGeometry args={[0.05, 6, 6]} color={0xef4444} /></mesh>
  <mesh position={[0.12, 0.52, 0.08]}><boxGeometry args={[0.04, 0.08, 0.04]} color={0xf59e0b} /></mesh>
</>, p);

// ============== BATHROOM FIXTURES ==============
export const Toilet = (p: Pos) => g(<>
  {/* Base */}
  <mesh position={[0, 0.2, 0]} castShadow><boxGeometry args={[0.35, 0.4, 0.4]} /><primitive object={M.getCeramic()} /></mesh>
  {/* Tank */}
  <mesh position={[0, 0.5, -0.25]} castShadow><boxGeometry args={[0.35, 0.4, 0.15]} /><primitive object={M.getCeramic()} /></mesh>
  {/* Seat */}
  <mesh position={[0, 0.42, 0.05]}><cylinderGeometry args={[0.13, 0.13, 0.02, 16]} /><primitive object={M.getPaint(0xe2e8f0)} /></mesh>
</>, p);

export const WashBasin = (p: Pos) => g(<>
  {/* Cabinet */}
  <mesh position={[0, 0.3, 0]} castShadow><boxGeometry args={[0.6, 0.6, 0.45]} /><primitive object={M.getWoodDark()} /></mesh>
  {/* Basin */}
  <mesh position={[0, 0.62, 0]} castShadow><boxGeometry args={[0.55, 0.06, 0.4]} /><primitive object={M.getCeramic()} /></mesh>
  <mesh position={[0, 0.62, 0]}><boxGeometry args={[0.3, 0.04, 0.25]} /><primitive object={M.getCeramic()} /></mesh>
  {/* Faucet */}
  <mesh position={[0, 0.7, 0.15]}><cylinderGeometry args={[0.015, 0.02, 0.06, 8]} /><primitive object={M.getChrome()} /></mesh>
  <mesh position={[0.08, 0.72, 0.1]}><cylinderGeometry args={[0.01, 0.01, 0.1, 6]} rotation={[0, 0, 0.5]} /><primitive object={M.getChrome()} /></mesh>
  {/* Mirror */}
  <mesh position={[0, 0.9, -0.05]}><planeGeometry args={[0.5, 0.5]} /><primitive object={M.getGlass()} /></mesh>
  <mesh position={[0, 0.9, -0.03]}><boxGeometry args={[0.52, 0.52, 0.02]} /><primitive object={M.getBrass()} /></mesh>
</>, p);

export const Shower = (p: Pos) => g(<>
  {/* Base tray */}
  <mesh position={[0, 0.02, 0]} receiveShadow><boxGeometry args={[0.9, 0.04, 0.9]} /><primitive object={M.getCeramic()} /></mesh>
  {/* Glass walls */}
  <mesh position={[0.45, 0.6, 0]}><boxGeometry args={[0.02, 1.2, 0.9]} /><primitive object={new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.15, roughness: 0.02, metalness: 0.9 })} /></mesh>
  <mesh position={[0, 0.6, -0.45]}><boxGeometry args={[0.9, 1.2, 0.02]} /><primitive object={new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.15, roughness: 0.02, metalness: 0.9 })} /></mesh>
  {/* Shower head */}
  <mesh position={[0, 1.25, 0]}><cylinderGeometry args={[0.02, 0.02, 0.08, 6]} /><primitive object={M.getChrome()} /></mesh>
  <mesh position={[0, 1.15, 0]}><cylinderGeometry args={[0.08, 0.1, 0.02, 12]} /><primitive object={M.getChrome()} /></mesh>
</>, p);

export const Bathtub = (p: Pos) => g(<>
  {/* Tub body */}
  <mesh position={[0, 0.25, 0]} castShadow receiveShadow><boxGeometry args={[1.4, 0.5, 0.7]} /><primitive object={M.getCeramic()} /></mesh>
  {/* Interior */}
  <mesh position={[0, 0.4, 0]}><boxGeometry args={[1.2, 0.2, 0.5]} /><primitive object={M.getCeramic()} /></mesh>
  {/* Faucet */}
  <mesh position={[0.55, 0.52, 0]}><cylinderGeometry args={[0.015, 0.02, 0.08, 8]} /><primitive object={M.getChrome()} /></mesh>
  {/* Feet */}
  {[[-0.6, -0.1, -0.3], [0.6, -0.1, -0.3], [-0.6, -0.1, 0.3], [0.6, -0.1, 0.3]].map((pos, i) => (
    <mesh key={`tf-${i}`} position={pos} castShadow><sphereGeometry args={[0.03, 6, 6]} /><primitive object={M.getGold()} /></mesh>
  ))}
</>, p);

export const TowelRack = (p: Pos) => g(<>
  <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.01, 0.01, 0.5, 6]} rotation={[0, 0, Math.PI / 2]} /><primitive object={M.getChrome()} /></mesh>
  {/* Towel */}
  <mesh position={[0.15, -0.1, 0]}><boxGeometry args={[0.01, 0.4, 0.25]} /><primitive object={M.getFabric(0xe2e8f0)} /></mesh>
  {[-0.02, 0.02].map((x, i) => (
    <mesh key={`trh-${i}`} position={[x, -0.02, 0]}><cylinderGeometry args={[0.015, 0.015, 0.02, 6]} /><primitive object={M.getChrome()} /></mesh>
  ))}
</>, p);

// ============== POOJA ROOM ==============
export const PoojaMandir = (p: Pos) => g(<>
  {/* Base */}
  <mesh position={[0, 0.15, 0]} castShadow receiveShadow><boxGeometry args={[0.6, 0.3, 0.4]} /><primitive object={M.getWoodDark()} /></mesh>
  {/* Arch */}
  <mesh position={[0, 0.55, 0]} castShadow><boxGeometry args={[0.5, 0.5, 0.35]} /><primitive object={M.getWoodDark()} /></mesh>
  {/* Top dome */}
  <mesh position={[0, 0.85, 0]} castShadow><coneGeometry args={[0.25, 0.15, 8]} /><primitive object={M.getGold()} /></mesh>
  {/* Idols */}
  <mesh position={[-0.12, 0.5, 0.1]}><boxGeometry args={[0.04, 0.12, 0.04]} /><primitive object={M.getGold()} /></mesh>
  <mesh position={[0, 0.5, 0.12]}><boxGeometry args={[0.04, 0.15, 0.04]} /><primitive object={M.getGold()} /></mesh>
  <mesh position={[0.12, 0.5, 0.1]}><boxGeometry args={[0.04, 0.12, 0.04]} /><primitive object={M.getGold()} /></mesh>
  {/* Diya (lamp) */}
  <mesh position={[0, 0.3, 0.15]}><cylinderGeometry args={[0.03, 0.05, 0.03, 8]} /><primitive object={M.getBrass()} /></mesh>
  <mesh position={[0, 0.33, 0.02]}><meshStandardMaterial color={0xffa500} emissive={0xffa500} emissiveIntensity={0.3} /><sphereGeometry args={[0.02, 6, 6]} /></mesh>
  {/* Bell */}
  <mesh position={[-0.2, 0.6, 0]}>
    <mesh position={[0, -0.04, 0]}><sphereGeometry args={[0.025, 8, 8]} /><primitive object={M.getBrass()} /></mesh>
    <mesh position={[0, 0.04, 0]}><cylinderGeometry args={[0.005, 0.005, 0.06, 6]} /><primitive object={M.getBrass()} /></mesh>
  </mesh>
</>, p);

// ============== BALCONY ==============
export const OutdoorChair = (p: Pos) => g(<>
  <mesh position={[0, 0.2, 0]} castShadow receiveShadow><boxGeometry args={[0.45, 0.04, 0.45]} /><primitive object={M.getWoodDark()} /></mesh>
  <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[0.4, 0.45, 0.4]} /><primitive object={M.getWoodDark()} /></mesh>
  <mesh position={[0, 0.65, -0.2]}><boxGeometry args={[0.4, 0.3, 0.04]} /><primitive object={M.getWoodDark()} /></mesh>
  {[[-0.18, 0.1, -0.18], [0.18, 0.1, -0.18], [-0.18, 0.1, 0.18], [0.18, 0.1, 0.18]].map((pos, i) => (
    <mesh key={`ocl-${i}`} position={[pos[0], -0.1, pos[2]]}><cylinderGeometry args={[0.02, 0.025, 0.4, 6]} /><primitive object={M.getSteel()} /></mesh>
  ))}
</>, p);

export const FlowerPot = (p: Pos) => g(<>
  <mesh position={[0, 0.1, 0]} castShadow><cylinderGeometry args={[0.06, 0.08, 0.2, 8]} /><primitive object={M.getCeramic()} /></mesh>
  <mesh position={[0, 0.35, 0]} castShadow><sphereGeometry args={[0.1, 8, 8]} /><primitive object={M.getPaint(0x22c55e)} /></mesh>
  <mesh position={[0.05, 0.4, 0.05]} castShadow><sphereGeometry args={[0.06, 6, 6]} /><primitive object={M.getPaint(0xef4444)} /></mesh>
</>, p);

// ============== DOORS & WINDOWS ==============
export const Door = (p: Pos) => g(<>
  {/* Door frame */}
  <mesh position={[0, 1.0, 0]}><boxGeometry args={[0.05, 2.0, 0.9]} /><primitive object={M.getWoodDark()} /></mesh>
  {/* Door panel */}
  <mesh position={[0, 1.0, 0.05]}><boxGeometry args={[0.03, 1.85, 0.8]} /><primitive object={M.getWoodLight()} /></mesh>
  {/* Handle */}
  <mesh position={[0, 1.0, 0.1]}><boxGeometry args={[0.02, 0.04, 0.04]} /><primitive object={M.getBrass()} /></mesh>
  {/* Door frame trim */}
  <mesh position={[0, 1.0, -0.03]}><boxGeometry args={[0.1, 2.1, 0.96]} /><primitive object={M.getPaint(0xe2e8f0)} /></mesh>
</>, p);

export const Window = (p: Pos) => g(<>
  {/* Frame */}
  <mesh position={[0, 0.8, 0]}><boxGeometry args={[1.2, 1.6, 0.06]} /><primitive object={M.getPaint(0x1e293b)} /></mesh>
  {/* Glass */}
  <mesh position={[0, 0.8, 0]}><planeGeometry args={[1.1, 1.5]} /><primitive object={new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, roughness: 0.02, metalness: 0.95 })} /></mesh>
  {/* Dividers */}
  <mesh position={[0, 1.2, 0]}><boxGeometry args={[1.1, 0.02, 0.02]} /><primitive object={M.getPaint(0x1e293b)} /></mesh>
  <mesh position={[0, 0.4, 0]}><boxGeometry args={[1.1, 0.02, 0.02]} /><primitive object={M.getPaint(0x1e293b)} /></mesh>
  <mesh position={[-0.3, 0.8, 0]}><boxGeometry args={[0.02, 1.5, 0.02]} /><primitive object={M.getPaint(0x1e293b)} /></mesh>
  <mesh position={[0.3, 0.8, 0]}><boxGeometry args={[0.02, 1.5, 0.02]} /><primitive object={M.getPaint(0x1e293b)} /></mesh>
</>, p);

// ============== WALL DECORATIONS ==============
export const WallPainting = (p: Pos) => g(<>
  <mesh position={[0, 0, 0]}><boxGeometry args={[0.6, 0.45, 0.03]} /><primitive object={M.getWoodDark()} /></mesh>
  <mesh position={[0, 0, 0.015]}><planeGeometry args={[0.5, 0.35]} color={0x7c3aed} /></mesh>
  <mesh position={[0.15, 0.15, 0.015]}><sphereGeometry args={[0.02, 6, 6]} color={0xf59e0b} /></mesh>
  <mesh position={[-0.15, -0.1, 0.015]}><sphereGeometry args={[0.02, 6, 6]} color={0x3b82f6} /></mesh>
</>, p);

// ============== LAUNDRY ==============
export const WashingMachine = (p: Pos) => g(<>
  <mesh position={[0, 0.4, 0]} castShadow><boxGeometry args={[0.6, 0.85, 0.6]} /><primitive object={M.getSteel()} /></mesh>
  {/* Door */}
  <mesh position={[0, 0.4, 0.32]}><cylinderGeometry args={[0.2, 0.2, 0.02, 16]} /><primitive object={M.getGlass()} /></mesh>
  {/* Controls */}
  <mesh position={[0, 0.78, 0.32]}><planeGeometry args={[0.25, 0.08]} color={0x1e293b} /></mesh>
  <mesh position={[0.1, 0.78, 0.34]}><cylinderGeometry args={[0.015, 0.015, 0.02, 8]} /><primitive object={M.getChrome()} /></mesh>
</>, p);

// ============== OFFICE FURNITURE ==============
export const OfficeDesk = (p: Pos) => g(<>
  <mesh position={[0, 0.35, 0]} castShadow receiveShadow><boxGeometry args={[1.2, 0.04, 0.6]} /><primitive object={M.getWoodDark()} /></mesh>
  {[[-0.55, 0.17, -0.25], [0.55, 0.17, -0.25], [-0.55, 0.17, 0.25], [0.55, 0.17, 0.25]].map((pos, i) => (
    <mesh key={`odl-${i}`} position={pos} castShadow><cylinderGeometry args={[0.025, 0.03, 0.35, 6]} /><primitive object={M.getSteel()} /></mesh>
  ))}
  {/* Drawer unit */}
  <mesh position={[-0.6, 0.2, 0]}><boxGeometry args={[0.35, 0.4, 0.55]} /><primitive object={M.getWoodDark()} /></mesh>
</>, p);

export const OfficeChair = (p: Pos) => g(<>
  {/* Base */}
  <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.25, 0.3, 0.04, 12]} /><primitive object={M.getSteel()} /></mesh>
  {/* Wheels */}
  {[[-0.2, -0.02, -0.2], [0.2, -0.02, -0.2], [-0.2, -0.02, 0.2], [0.2, -0.02, 0.2], [0, -0.02, -0.28], [0, -0.02, 0.28]].map((pos, i) => (
    <mesh key={`wc-${i}`} position={pos}><sphereGeometry args={[0.02, 6, 6]} /><primitive object={M.getSteel()} /></mesh>
  ))}
  {/* Seat */}
  <mesh position={[0, 0.25, 0]} castShadow><boxGeometry args={[0.45, 0.06, 0.45]} /><primitive object={M.getFabric(0x1e293b)} /></mesh>
  <mesh position={[0, 0.28, 0]} castShadow><boxGeometry args={[0.43, 0.35, 0.43]} /><primitive object={M.getFabric(0x1e293b)} /></mesh>
  {/* Back */}
  <mesh position={[0, 0.6, -0.2]}><boxGeometry args={[0.4, 0.35, 0.04]} /><primitive object={M.getFabric(0x1e293b)} /></mesh>
  {/* Armrests */}
  <mesh position={[0.28, 0.35, 0]}><boxGeometry args={[0.03, 0.25, 0.25]} /><primitive object={M.getSteel()} /></mesh>
  <mesh position={[-0.28, 0.35, 0]}><boxGeometry args={[0.03, 0.25, 0.25]} /><primitive object={M.getSteel()} /></mesh>
</>, p);

export const ComputerMonitor = (p: Pos) => g(<>
  {/* Stand */}
  <mesh position={[0, 0.2, 0]}><boxGeometry args={[0.2, 0.4, 0.08]} /><primitive object={M.getSteel()} /></mesh>
  {/* Screen */}
  <mesh position={[0, 0.55, 0]} castShadow><boxGeometry args={[0.5, 0.35, 0.03]} /><primitive object={M.getPaint(0x111827)} /></mesh>
  <mesh position={[0, 0.55, 0.015]}><planeGeometry args={[0.42, 0.28]} color={0x38bdf8} /></mesh>
  {/* Base */}
  <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.25, 0.02, 0.2]} /><primitive object={M.getSteel()} /></mesh>
</>, p);

export const Printer = (p: Pos) => g(<>
  <mesh position={[0, 0.1, 0]} castShadow><boxGeometry args={[0.4, 0.2, 0.35]} /><primitive object={M.getPaint(0x1e293b)} /></mesh>
  {/* Paper tray */}
  <mesh position={[0, 0.22, 0]}><boxGeometry args={[0.38, 0.04, 0.3]} /><primitive object={M.getPaint(0x374151)} /></mesh>
  {/* Paper */}
  <mesh position={[0, 0.24, 0.1]}><boxGeometry args={[0.25, 0.02, 0.3]} /><primitive object={M.getPaint(0xffffff)} /></mesh>
</>, p);

export const Whiteboard = (p: Pos) => g(<>
  <mesh position={[0, 0.3, 0]}><boxGeometry args={[1.2, 0.6, 0.03]} /><primitive object={M.getPaint(0xffffff)} /></mesh>
  {/* Frame */}
  <mesh position={[-0.61, 0.3, 0]}><boxGeometry args={[0.02, 0.62, 0.04]} /><primitive object={M.getSteel()} /></mesh>
  <mesh position={[0.61, 0.3, 0]}><boxGeometry args={[0.02, 0.62, 0.04]} /><primitive object={M.getSteel()} /></mesh>
  <mesh position={[0, 0.61, 0]}><boxGeometry args={[1.22, 0.02, 0.04]} /><primitive object={M.getSteel()} /></mesh>
  <mesh position={[0, -0.01, 0]}><boxGeometry args={[1.22, 0.02, 0.04]} /><primitive object={M.getSteel()} /></mesh>
</>, p);

// ============== SWITCHBOARD ==============
export const SwitchBoard = (p: Pos) => g(<>
  <mesh position={[0, 0, 0]}><boxGeometry args={[0.08, 0.12, 0.01]} /><primitive object={M.getPaint(0xf3f4f6)} /></mesh>
  {[[-0.02, 0.025, 0.005], [0.02, 0.025, 0.005], [-0.02, -0.025, 0.005], [0.02, -0.025, 0.005]].map((pos, i) => (
    <mesh key={`sw-${i}`} position={pos}><planeGeometry args={[0.015, 0.025]} /><primitive object={new THREE.MeshBasicMaterial({ color: 0xffffff })} /></mesh>
  ))}
</>, p);

// ============== STAIRCASE ==============
export const Staircase = (p: Pos) => g(<>
  {Array.from({ length: 10 }).map((_, i) => (
    <mesh key={`step-${i}`} position={[0.15 * i, 0.15 * i + 0.075, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.9, 0.15, 0.3]} /><primitive object={M.getWoodDark()} />
    </mesh>
  ))}
  {/* Railing */}
  {Array.from({ length: 11 }).map((_, i) => (
    <mesh key={`rail-${i}`} position={[-0.45, 0.15 * i + 0.3, 0]}><cylinderGeometry args={[0.01, 0.01, 0.3, 6]} /><primitive object={M.getSteel()} /></mesh>
  ))}
  <mesh position={[-0.45, 0.15 * 10 + 0.35, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.01, 0.01, 1.5, 6]} /><primitive object={M.getSteel()} /></mesh>
</>, p);

// ============== GARAGE ==============
export const Car = (p: Pos) => g(<>
  {/* Body */}
  <mesh position={[0, 0.3, 0]} castShadow receiveShadow><boxGeometry args={[1.8, 0.6, 4.0]} /><primitive object={M.getPaint(0x1e293b)} /></mesh>
  {/* Cabin */}
  <mesh position={[0, 0.65, -0.3]} castShadow><boxGeometry args={[1.4, 0.35, 2.0]} /><primitive object={M.getGlass()} /></mesh>
  {/* Wheels */}
  {[[-0.75, 0.08, -1.2], [0.75, 0.08, -1.2], [-0.75, 0.08, 1.2], [0.75, 0.08, 1.2]].map((pos, i) => (
    <mesh key={`wheel-${i}`} position={pos} castShadow>
      <cylinderGeometry args={[0.18, 0.18, 0.12, 12]} rotation={[0, 0, Math.PI / 2]} /><primitive object={M.getPaint(0x111827)} />
    </mesh>
  ))}
  {/* Headlights */}
  <mesh position={[-0.5, 0.3, 2.02]}><planeGeometry args={[0.08, 0.06]} color={0xffffff} /></mesh>
  <mesh position={[0.5, 0.3, 2.02]}><planeGeometry args={[0.08, 0.06]} color={0xffffff} /></mesh>
  {/* Taillights */}
  <mesh position={[-0.5, 0.3, -2.02]}><planeGeometry args={[0.08, 0.06]} color={0xef4444} /></mesh>
  <mesh position={[0.5, 0.3, -2.02]}><planeGeometry args={[0.08, 0.06]} color={0xef4444} /></mesh>
</>, p);
