import React, { useState, useEffect } from 'react';
import { 
  Map, MapPin, Compass, Sun, Mic, Maximize, 
  Box, Layout, ArrowRight, Bot, Info, 
  Video, Activity
} from 'lucide-react';
import Feasibility3DViewer from './Feasibility3DViewer';

export default function FeasibilityPlanner() {
  const [length, setLength] = useState<number>(30);
  const [width, setWidth] = useState<number>(25);
  const [area, setArea] = useState<number>(750);
  const [roadWidth, setRoadWidth] = useState<number>(12);
  const [soilType, setSoilType] = useState('medium_clay');
  const [terrainType, setTerrainType] = useState('flat');
  const [facing, setFacing] = useState('East');
  const [gps, setGps] = useState('40.7128, -74.0060');
  const [coohomUrl, setCoohomUrl] = useState('');

  useEffect(() => {
    setArea(length * width);
  }, [length, width]);

  const [floor, setFloor] = useState('All Floors');
  const [time, setTime] = useState(12);
  const [cameraMode, setCameraMode] = useState('Orbit View');
  
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set([
    'ARCHITECTURAL', 'STRUCTURAL', 'ELECTRICAL', 'PLUMBING', 'HVAC', 
    'FURNITURE', 'LIGHTING', 'LANDSCAPING', 'SAFETY', 'COST', 
    'MATERIALS', 'PROGRESS'
  ]));

  const toggleLayer = (layer: string) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  const handleNext = () => {
    alert("Moving to Step 2: Design Requirements...");
  };

  const formatTime = (hour: number) => {
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour > 12) return `${hour - 12}:00 PM`;
    return `${hour}:00 AM`;
  };

  const cameraModes = [
    { label: 'Orbit View', icon: Compass },
    { label: 'Dollhouse', icon: Box },
    { label: '2D Plan', icon: Layout },
    { label: 'Drone View', icon: Activity },
    { label: 'FPV Walkthrough', icon: Map }
  ];

  const LAYERS = [
    { label: "ARCHITECTURAL", color: "#0ea5e9" },
    { label: "STRUCTURAL", color: "#6366f1" },
    { label: "ELECTRICAL", color: "#a855f7" },
    { label: "PLUMBING", color: "#06b6d4" },
    { label: "HVAC", color: "#ec4899" },
    { label: "FURNITURE", color: "#f43f5e" },
    { label: "LIGHTING", color: "#f59e0b" },
    { label: "LANDSCAPING", color: "#84cc16" },
    { label: "SAFETY", color: "#eab308" },
    { label: "COST", color: "#14b8a6" },
    { label: "MATERIALS", color: "#8b5cf6" },
    { label: "PROGRESS", color: "#d946ef" }
  ];

  const formDataObj = {
    land_length: length,
    land_width: width,
    num_floors: 2,
    building_type: "House",
    road_width: roadWidth,
    style_selection: "Modern",
    material_preference: "Concrete",
    soil_type: soilType,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {/* HEADER */}
      <div>
        <h1 className="title-gradient-purple" style={{ fontSize: '2rem' }}>Feasibility Planner</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          AI-powered 3D building design, BOQ generation, and cost estimation
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem', flex: 1 }}>
        
        {/* LEFT PANEL - Form */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              <Map className="text-cyan" size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>Step 1: Land & Site Details</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Row 1 */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Length (meters)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  className="form-input" 
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                />
                <Map style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Width (meters)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  className="form-input" 
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                />
                <Box style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-purple)' }} size={16} />
              </div>
            </div>

            {/* Row 2 */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Calculated Area (sq m)</label>
              <input type="text" className="form-input" value={area} readOnly style={{ background: 'rgba(24, 24, 27, 0.5)', color: 'var(--accent-cyan)', fontWeight: 'bold' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Road Width (meters)</label>
              <input 
                type="number" 
                className="form-input" 
                value={roadWidth}
                onChange={(e) => setRoadWidth(Number(e.target.value))}
              />
            </div>

            {/* Row 3 */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Soil Type</label>
              <select className="form-input" value={soilType} onChange={(e) => setSoilType(e.target.value)} style={{ appearance: 'none' }}>
                <option value="medium_clay">Medium Clay</option>
                <option value="sandy">Sandy</option>
                <option value="rock">Rock</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Terrain Type</label>
              <select className="form-input" value={terrainType} onChange={(e) => setTerrainType(e.target.value)} style={{ appearance: 'none' }}>
                <option value="flat">Flat</option>
                <option value="sloped">Sloped</option>
                <option value="hilly">Hilly</option>
              </select>
            </div>

            {/* Row 4 */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Facing Direction</label>
              <div style={{ position: 'relative' }}>
                <input type="text" className="form-input" value={facing} onChange={(e) => setFacing(e.target.value)} />
                <Sun style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-amber)' }} size={16} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>GPS Coordinates</label>
              <div style={{ position: 'relative' }}>
                <input type="text" className="form-input" value={gps} onChange={(e) => setGps(e.target.value)} />
                <MapPin style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-purple)' }} size={16} />
              </div>
            </div>

            {/* Row 5 */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Coohom / Planner 5D Project URL</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="https://www.coohom.com/..."
                  value={coohomUrl} 
                  onChange={(e) => setCoohomUrl(e.target.value)} 
                />
                <Box style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-purple)' }} size={16} />
              </div>
            </div>
          </div>

          <div style={{ 
            marginTop: '1rem',
            background: 'linear-gradient(90deg, rgba(6,182,212,0.1) 0%, rgba(59,130,246,0.1) 100%)', 
            border: '1px solid rgba(6,182,212,0.3)', 
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            gap: '1rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', bottom: -20, right: -20, opacity: 0.2, 
              width: '150px', height: '100px',
              background: 'radial-gradient(circle, var(--accent-cyan) 0%, transparent 70%)',
              filter: 'blur(20px)'
            }} />
            <Info className="text-cyan" size={24} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, zIndex: 1 }}>
              Tip: Accurate land and site details help our AI generate precise design recommendations and cost estimates.
            </p>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-gradient" onClick={handleNext} style={{ padding: '0.75rem 2rem', fontSize: '1rem', borderRadius: '8px' }}>
              Next: Design Requirements <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* RIGHT PANEL - Digital Twin View */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', padding: 0 }}>
          <Feasibility3DViewer 
            formData={formDataObj} 
            viewMode="architectural" 
          />
        </div>

      </div>
    </div>
  );
}

// Helpers

function LayersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan">
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 12 12 17 22 12"></polyline>
      <polyline points="2 17 12 22 22 17"></polyline>
    </svg>
  );
}

function LayerSwitch({ label, color, active = false, onClick }: { label: string, color: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        padding: '0.25rem 0.75rem',
        fontSize: '0.7rem',
        fontWeight: 600,
        borderRadius: '4px',
        background: active ? `linear-gradient(90deg, ${color}cc 0%, ${color} 100%)` : '#27272a',
        color: active ? '#fff' : 'var(--text-secondary)',
        border: `1px solid ${active ? color : 'transparent'}`,
        cursor: 'pointer',
        boxShadow: active ? `0 2px 8px ${color}66` : 'none',
        letterSpacing: '0.5px',
        userSelect: 'none',
        transition: 'all 0.2s'
      }}>
      {label}
    </div>
  );
}
