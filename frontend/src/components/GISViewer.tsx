"use client";

import React, { useState } from 'react';
// @ts-ignore
import Map, { NavigationControl, ScaleControl, FullscreenControl, Marker } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Navigation2, Layers } from 'lucide-react';

export default function GISViewer() {
  const [viewState, setViewState] = useState({
    longitude: 77.5946,
    latitude: 12.9716, // Default: Bangalore
    zoom: 15,
    pitch: 45,
    bearing: 0
  });

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
      <div className="absolute top-4 left-4 z-10 bg-gray-900/90 backdrop-blur-sm p-4 rounded-xl border border-gray-700 shadow-xl w-72">
        <h3 className="text-white font-bold flex items-center gap-2 mb-2"><MapPin size={18} className="text-blue-400" /> GIS Map Context</h3>
        <p className="text-gray-400 text-xs mb-4">View the proposed construction site on the global map with surrounding context.</p>
        
        <div className="flex gap-2 text-xs">
          <button className="flex-1 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold transition-colors">Street View</button>
          <button className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">Satellite</button>
        </div>
      </div>

      <Map
        {...viewState}
        onMove={(evt: any) => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        mapLib={maplibregl}
        style={{ width: '100%', height: '100%' }}
      >
        <FullscreenControl position="top-right" />
        <NavigationControl position="top-right" showCompass showZoom />
        <ScaleControl />

        {/* 3D Marker for Construction Site */}
        <Marker longitude={77.5946} latitude={12.9716} anchor="bottom">
          <div className="relative flex flex-col items-center">
            <div className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap mb-1 border border-emerald-400">
              Proposed Site
            </div>
            <MapPin size={32} color="#10b981" fill="#064e3b" />
          </div>
        </Marker>
      </Map>
    </div>
  );
}
