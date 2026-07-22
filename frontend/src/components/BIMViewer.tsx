"use client";

import React, { useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { IFCLoader } from "web-ifc-three";
import { Html } from "@react-three/drei";
import { Loader2 } from "lucide-react";

interface BIMViewerProps {
  url?: string;
}

export default function BIMViewer({ url = "/sample.ifc" }: BIMViewerProps) {
  const { scene } = useThree();
  const ifcModels = useRef<THREE.Object3D[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loader = new IFCLoader();

    async function loadIFC() {
      try {
        setLoading(true);
        // Setup WASM path (must match where the wasm files are served)
        loader.ifcManager.setWasmPath("/");

        const model = (await loader.loadAsync(url)) as any;
        if (!active) return;

        // Apply a basic material if necessary or rely on IFC colors
        model.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Apply premium BIM material overlay (x-ray / blueprint aesthetic)
            const material = new THREE.MeshStandardMaterial({
              color: child.material?.color || new THREE.Color("#e2e8f0"),
              roughness: 0.3,
              metalness: 0.1,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.95,
              polygonOffset: true,
              polygonOffsetFactor: 1,
              polygonOffsetUnits: 1
            });
            child.material = material;

            // Add Edge Outlines for CAD look
            const edges = new THREE.EdgesGeometry(child.geometry);
            const line = new THREE.LineSegments(
              edges, 
              new THREE.LineBasicMaterial({ color: "#0ea5e9", linewidth: 1, transparent: true, opacity: 0.5 })
            );
            child.add(line);
          }
        });

        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center); // Center it around origin
        // Put the bottom at y=0
        const bottomY = box.min.y - center.y;
        model.position.y -= bottomY; 

        scene.add(model);
        ifcModels.current.push(model);
        setLoading(false);
      } catch (err: any) {
        if (!active) return;
        console.error("Error loading IFC file:", err);
        setError(err.message || "Failed to load BIM model");
        setLoading(false);
      }
    }

    loadIFC();

    return () => {
      active = false;
      // Cleanup models from scene
      ifcModels.current.forEach((model) => {
        scene.remove(model);
        // Clean up geometries and materials
        model.traverse((child: any) => {
          if (child.isMesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m: any) => m.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      });
      ifcModels.current = [];
    };
  }, [url, scene]);

  if (loading) {
    return (
      <Html center>
        <div className="flex flex-col items-center gap-2 bg-slate-900/80 p-4 rounded-lg border border-slate-700 backdrop-blur-sm text-white">
          <Loader2 className="animate-spin text-cyan-400" size={32} />
          <span className="text-sm font-semibold">Parsing IFC BIM Data...</span>
        </div>
      </Html>
    );
  }

  if (error) {
    return (
      <Html center>
        <div className="flex flex-col items-center gap-2 bg-red-900/80 p-4 rounded-lg border border-red-700 backdrop-blur-sm text-white max-w-[300px] text-center">
          <span className="text-sm font-semibold text-red-200">Error Loading BIM Model</span>
          <span className="text-xs">{error}</span>
        </div>
      </Html>
    );
  }

  return null;
}
