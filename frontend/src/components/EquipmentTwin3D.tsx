"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF, RoundedBox, Sphere } from "@react-three/drei";
import * as THREE from "three";

// Simulated Procedural Excavator
function ProceduralExcavator({ color = "#eab308" }) {
  return (
    <group position={[0, 0.5, 0]}>
      {/* Tracks */}
      <RoundedBox args={[1.2, 0.4, 3]} position={[-0.9, 0, 0]} radius={0.1} smoothness={4} castShadow>
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[1.2, 0.4, 3]} position={[0.9, 0, 0]} radius={0.1} smoothness={4} castShadow>
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </RoundedBox>
      
      {/* Base Cabin */}
      <RoundedBox args={[2, 1.2, 2]} position={[0, 0.8, 0]} radius={0.05} castShadow>
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </RoundedBox>
      
      {/* Cockpit Window */}
      <RoundedBox args={[0.8, 1, 1]} position={[-0.5, 1.5, 0.5]} radius={0.05}>
        <meshPhysicalMaterial color="#3b82f6" transmission={0.9} opacity={1} transparent roughness={0.1} />
      </RoundedBox>
      
      {/* Hydraulic Arm (Simplified) */}
      <group position={[0.5, 1.2, 1]}>
        <mesh position={[0, 1, 1]} rotation={[-Math.PI / 4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 3, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 1.5, 2.5]} rotation={[Math.PI / 4, 0, 0]} castShadow>
           <cylinderGeometry args={[0.12, 0.12, 2, 16]} />
           <meshStandardMaterial color={color} />
        </mesh>
        {/* Bucket */}
        <mesh position={[0, 0.5, 3.5]} castShadow>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#4b5563" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// Simulated Procedural Crane
function ProceduralCrane({ color = "#ef4444" }) {
  return (
    <group position={[0, 0.5, 0]}>
      {/* Base */}
      <RoundedBox args={[2.5, 0.8, 4]} position={[0, 0, 0]} radius={0.1} castShadow>
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </RoundedBox>
      
      {/* Wheels */}
      {[[-1.2, -0.2, 1.5], [1.2, -0.2, 1.5], [-1.2, -0.2, -1.5], [1.2, -0.2, -1.5]].map((pos, i) => (
        <mesh key={i} position={pos as [number,number,number]} rotation={[0, 0, Math.PI/2]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.4, 24]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
      ))}

      {/* Cabin */}
      <RoundedBox args={[1.5, 1.2, 1.5]} position={[0, 1, 1]} radius={0.05} castShadow>
        <meshStandardMaterial color="#374151" />
      </RoundedBox>
      
      {/* Boom Base */}
      <mesh position={[0, 1.5, -1]} castShadow>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Boom Arm */}
      <mesh position={[0, 3.5, 1]} rotation={[Math.PI / 6, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 6, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function EquipmentUnit({ data, isCinematic }: { data: any, isCinematic: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Interpolation states for smooth pathfinding
  const targetPos = useRef(new THREE.Vector3(data.location.x, 0, data.location.z));
  const targetRot = useRef(data.location.rotation);

  useEffect(() => {
    targetPos.current.set(data.location.x, 0, data.location.z);
    targetRot.current = data.location.rotation;
  }, [data.location]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth movement towards target
      groupRef.current.position.lerp(targetPos.current, delta * 2);
      // Smooth rotation
      const currentRot = groupRef.current.rotation.y;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRot, targetRot.current, delta * 2);
    }
  });

  const isWarning = data.telemetry.health < 85;

  return (
    <group ref={groupRef}>
      {/* Dynamic Aura for maintenance */}
      {isWarning && (
        <pointLight position={[0, 2, 0]} color="#fb923c" intensity={2} distance={5} />
      )}
      
      {/* Procedural Models */}
      {data.type === "Excavator" && <ProceduralExcavator />}
      {data.type === "Bulldozer" && <ProceduralExcavator color="#f97316" />}
      {data.type.includes("Crane") && <ProceduralCrane />}
      
      {/* Floating IoT HUD */}
      {!isCinematic && (
        <Html position={[0, 4.5, 0]} center distanceFactor={15}>
          <div style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: `1px solid ${isWarning ? '#fb923c' : '#3b82f6'}`,
            padding: "8px 12px",
            borderRadius: "8px",
            backdropFilter: "blur(4px)",
            color: "white",
            fontSize: "12px",
            minWidth: "120px",
            pointerEvents: "none"
          }}>
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{data.type}</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af" }}>Fuel:</span>
              <span style={{ color: "#fff" }}>{data.telemetry.fuel}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af" }}>RPM:</span>
              <span style={{ color: "#fff" }}>{data.telemetry.rpm}</span>
            </div>
            {isWarning && (
              <div style={{ color: "#fb923c", fontWeight: "bold", marginTop: "4px", fontSize: "10px" }}>
                MAINTENANCE REQUIRED
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function EquipmentTwin3D({ isCinematic = false, activeLayers = {} }: { isCinematic?: boolean, activeLayers?: Record<string, boolean> }) {
  const [equipmentLive, setEquipmentLive] = useState<any[]>([]);

  useEffect(() => {
    // We only connect the socket if the equipment layer is active
    // If not passed, default to true
    if (activeLayers.equipment === false) return;

    const ws = new WebSocket('ws://127.0.0.1:3001/equipment_twin/ws');
    
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'telemetry_update') {
          setEquipmentLive(msg.data);
        }
      } catch(e) {}
    };

    return () => ws.close();
  }, [activeLayers.equipment]);

  if (activeLayers.equipment === false) return null;

  return (
    <group>
      {equipmentLive.map((eq) => (
        <EquipmentUnit key={eq.id} data={eq} isCinematic={isCinematic} />
      ))}
    </group>
  );
}
