"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Home, Building, Hotel, Briefcase, ShoppingBag, Sun, Zap, Droplets,
  Trees, CarFront, ArrowUpDown, Waves, Flame, Wind, BedDouble, Bath,
  UtensilsCrossed, Sofa, Coffee, X, Settings2, Sparkles, RefreshCw
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
export interface BuildingConfig {
  buildingType: string;
  bhk: string;
  floors: number;
  rooms: {
    bedrooms: number;
    bathrooms: number;
    kitchen: number;
    livingRoom: number;
    diningRoom: number;
    parking: number;
    studyRoom: number;
    servantRoom: number;
  };
  features: {
    lift: boolean;
    solar: boolean;
    pool: boolean;
    garden: boolean;
    rooftopGarden: boolean;
    hvac: boolean;
    waterHarvesting: boolean;
    evCharging: boolean;
  };
  material: string;
  style: string;
  landWidth: number;
  landLength: number;
}

// ─── Building Types ─────────────────────────────────────────────────────────
const BUILDING_TYPES = [
  { id: "house",      label: "House",       icon: Home,        color: "#06b6d4" },
  { id: "villa",      label: "Villa",       icon: Hotel,       color: "#10b981" },
  { id: "apartment",  label: "Apartment",   icon: Building,    color: "#a855f7" },
  { id: "office",     label: "Office",      icon: Briefcase,   color: "#f59e0b" },
  { id: "commercial", label: "Commercial",  icon: ShoppingBag, color: "#ef4444" },
  { id: "resort",     label: "Resort",      icon: Waves,       color: "#38bdf8" },
];

// ─── BHK Options ────────────────────────────────────────────────────────────
const BHK_OPTIONS = ["Studio", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK+"];

// ─── BHK Auto-room mapping ───────────────────────────────────────────────────
const BHK_DEFAULTS: Record<string, Partial<BuildingConfig["rooms"]>> = {
  Studio:   { bedrooms: 0, bathrooms: 1, kitchen: 1, livingRoom: 1, diningRoom: 0 },
  "1BHK":   { bedrooms: 1, bathrooms: 1, kitchen: 1, livingRoom: 1, diningRoom: 1 },
  "2BHK":   { bedrooms: 2, bathrooms: 2, kitchen: 1, livingRoom: 1, diningRoom: 1 },
  "3BHK":   { bedrooms: 3, bathrooms: 3, kitchen: 1, livingRoom: 1, diningRoom: 1 },
  "4BHK":   { bedrooms: 4, bathrooms: 4, kitchen: 1, livingRoom: 2, diningRoom: 1 },
  "5BHK+":  { bedrooms: 5, bathrooms: 5, kitchen: 2, livingRoom: 2, diningRoom: 1 },
};

// ─── Materials ───────────────────────────────────────────────────────────────
const MATERIALS = [
  { id: "concrete", label: "Concrete", color: "#94a3b8", gradient: "linear-gradient(135deg, #94a3b8, #64748b)" },
  { id: "glass",    label: "Glass",    color: "#bae6fd", gradient: "linear-gradient(135deg, #e0f2fe, #38bdf8)" },
  { id: "steel",    label: "Steel",    color: "#6b7280", gradient: "linear-gradient(135deg, #9ca3af, #374151)" },
  { id: "wood",     label: "Wood",     color: "#92400e", gradient: "linear-gradient(135deg, #ca8a04, #78350f)" },
  { id: "brick",    label: "Brick",    color: "#b45309", gradient: "linear-gradient(135deg, #d97706, #92400e)" },
  { id: "marble",   label: "Marble",   color: "#e2e8f0", gradient: "linear-gradient(135deg, #f8fafc, #cbd5e1)" },
];

// ─── Styles ──────────────────────────────────────────────────────────────────
const ARCH_STYLES = [
  "Modern", "Contemporary", "Brutalist", "Art Deco", "Mediterranean",
  "Industrial", "Minimal", "Tropical", "Futuristic"
];

// ─── AI Description Generator ────────────────────────────────────────────────
function generateAIDescription(config: BuildingConfig): string {
  const roomList: string[] = [];
  if (config.rooms.bedrooms > 0) roomList.push(`${config.rooms.bedrooms} Bedroom${config.rooms.bedrooms > 1 ? "s" : ""}`);
  if (config.rooms.bathrooms > 0) roomList.push(`${config.rooms.bathrooms} Bathroom${config.rooms.bathrooms > 1 ? "s" : ""}`);
  if (config.rooms.kitchen > 0) roomList.push(`${config.rooms.kitchen} Kitchen${config.rooms.kitchen > 1 ? "s" : ""}`);
  if (config.rooms.livingRoom > 0) roomList.push(`${config.rooms.livingRoom} Living Room${config.rooms.livingRoom > 1 ? "s" : ""}`);
  if (config.rooms.diningRoom > 0) roomList.push("Dining Room");
  if (config.rooms.studyRoom > 0) roomList.push(`${config.rooms.studyRoom} Study Room${config.rooms.studyRoom > 1 ? "s" : ""}`);
  if (config.rooms.servantRoom > 0) roomList.push("Servant Quarter");
  if (config.rooms.parking > 0) roomList.push(`${config.rooms.parking}-Car Parking`);

  const featureList: string[] = [];
  if (config.features.lift) featureList.push("Glass Elevator");
  if (config.features.solar) featureList.push("Rooftop Solar Array");
  if (config.features.pool) featureList.push("Swimming Pool");
  if (config.features.garden) featureList.push("Landscaped Garden");
  if (config.features.rooftopGarden) featureList.push("Rooftop Garden");
  if (config.features.hvac) featureList.push("Central HVAC System");
  if (config.features.waterHarvesting) featureList.push("Rainwater Harvesting");
  if (config.features.evCharging) featureList.push("EV Charging Station");

  const selectedMat = MATERIALS.find(m => m.id === config.material);
  const matLabel = selectedMat?.label || "Concrete";

  return `A ${config.floors}-floor ${config.style} ${config.bhk} ${config.buildingType} built with premium ${matLabel} and structural steel. The ${config.landWidth}m × ${config.landLength}m plot houses ${roomList.join(", ")}. ${featureList.length > 0 ? `Premium amenities include ${featureList.join(", ")}.` : ""} Designed for maximum natural light, cross-ventilation, and energy efficiency aligned with modern green building standards.`;
}

// ─── RoomCounterRow ──────────────────────────────────────────────────────────
function RoomCounterRow({ icon: Icon, label, color, value, min = 0, max = 10, onChange }: {
  icon: any; label: string; color: string;
  value: number; min?: number; max?: number; onChange: (val: number) => void;
}) {
  return (
    <div className="room-row">
      <div className="room-row-label">
        <Icon size={15} style={{ color }} />
        <span>{label}</span>
      </div>
      <div className="room-counter">
        <button onClick={() => onChange(Math.max(min, value - 1))}>−</button>
        <span style={{ color: value > 0 ? color : "var(--text-muted)" }}>{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))}>+</button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
interface BuildingConfiguratorProps {
  onConfigChange: (config: BuildingConfig) => void;
  onClose: () => void;
}

export default function BuildingConfigurator({ onConfigChange, onClose }: BuildingConfiguratorProps) {
  const [config, setConfig] = useState<BuildingConfig>({
    buildingType: "house",
    bhk: "3BHK",
    floors: 2,
    rooms: { bedrooms: 3, bathrooms: 3, kitchen: 1, livingRoom: 1, diningRoom: 1, parking: 1, studyRoom: 0, servantRoom: 0 },
    features: { lift: false, solar: true, pool: false, garden: true, rooftopGarden: false, hvac: true, waterHarvesting: false, evCharging: false },
    material: "concrete",
    style: "Modern",
    landWidth: 30,
    landLength: 35,
  });

  const [aiDesc, setAiDesc] = useState(() => generateAIDescription({
    buildingType: "house", bhk: "3BHK", floors: 2,
    rooms: { bedrooms: 3, bathrooms: 3, kitchen: 1, livingRoom: 1, diningRoom: 1, parking: 1, studyRoom: 0, servantRoom: 0 },
    features: { lift: false, solar: true, pool: false, garden: true, rooftopGarden: false, hvac: true, waterHarvesting: false, evCharging: false },
    material: "concrete", style: "Modern", landWidth: 30, landLength: 35,
  }));

  const updateConfig = useCallback((updates: Partial<BuildingConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates };
      setAiDesc(generateAIDescription(next));
      onConfigChange(next);
      return next;
    });
  }, [onConfigChange]);

  const updateRooms = useCallback((roomUpdates: Partial<BuildingConfig["rooms"]>) => {
    setConfig(prev => {
      const next = { ...prev, rooms: { ...prev.rooms, ...roomUpdates } };
      setAiDesc(generateAIDescription(next));
      onConfigChange(next);
      return next;
    });
  }, [onConfigChange]);

  const updateFeatures = useCallback((featureUpdates: Partial<BuildingConfig["features"]>) => {
    setConfig(prev => {
      const next = { ...prev, features: { ...prev.features, ...featureUpdates } };
      setAiDesc(generateAIDescription(next));
      onConfigChange(next);
      return next;
    });
  }, [onConfigChange]);

  const applyBHK = useCallback((bhk: string) => {
    const defaults = BHK_DEFAULTS[bhk] || {};
    const roomUpdates = { ...defaults };
    setConfig(prev => {
      const next = { ...prev, bhk, rooms: { ...prev.rooms, ...roomUpdates } };
      setAiDesc(generateAIDescription(next));
      onConfigChange(next);
      return next;
    });
  }, [onConfigChange]);

  // Sync on first mount
  useEffect(() => { onConfigChange(config); }, []); // eslint-disable-line

  return (
    <div className="configurator-drawer">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Settings2 size={18} color="var(--accent-cyan)" />
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>3D Building Builder</span>
        </div>
        <button onClick={onClose} className="btn btn-sm btn-secondary" style={{ padding: "0.3rem 0.5rem" }}>
          <X size={14} />
        </button>
      </div>

      {/* Building Type */}
      <div>
        <div className="section-heading">Building Type</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {BUILDING_TYPES.map(bt => {
            const Icon = bt.icon;
            return (
              <button key={bt.id} className={`btype-card ${config.buildingType === bt.id ? "active" : ""}`}
                onClick={() => updateConfig({ buildingType: bt.id })}>
                <Icon size={22} style={{ color: config.buildingType === bt.id ? bt.color : "var(--text-secondary)" }} />
                {bt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* BHK */}
      <div>
        <div className="section-heading">BHK Configuration</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {BHK_OPTIONS.map(bhk => (
            <button key={bhk} className={`bhk-pill ${config.bhk === bhk ? "active" : ""}`}
              onClick={() => applyBHK(bhk)}>
              {bhk}
            </button>
          ))}
        </div>
      </div>

      {/* Floors */}
      <div>
        <div className="section-heading">Floors & Plot Size</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="room-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <span className="room-row-label">
              <Building size={15} style={{ color: "#94a3b8" }} /> Floors
            </span>
            <div className="room-counter">
              <button onClick={() => updateConfig({ floors: Math.max(1, config.floors - 1) })}>−</button>
              <span style={{ color: "#06b6d4" }}>{config.floors}</span>
              <button onClick={() => updateConfig({ floors: Math.min(30, config.floors + 1) })}>+</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 4 }}>Width (m)</div>
              <input type="number" min={5} max={100} value={config.landWidth}
                onChange={e => updateConfig({ landWidth: Number(e.target.value) })}
                className="form-input" style={{ padding: "0.4rem 0.6rem", fontSize: "0.8rem" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 4 }}>Length (m)</div>
              <input type="number" min={5} max={100} value={config.landLength}
                onChange={e => updateConfig({ landLength: Number(e.target.value) })}
                className="form-input" style={{ padding: "0.4rem 0.6rem", fontSize: "0.8rem" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Rooms */}
      <div>
        <div className="section-heading">Room Configuration</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <RoomCounterRow icon={BedDouble}       label="Bedrooms"     color="#818cf8" value={config.rooms.bedrooms}    onChange={v => updateRooms({ bedrooms: v })} />
          <RoomCounterRow icon={Bath}             label="Bathrooms"    color="#38bdf8" value={config.rooms.bathrooms}   onChange={v => updateRooms({ bathrooms: v })} />
          <RoomCounterRow icon={UtensilsCrossed}  label="Kitchens"     color="#fbbf24" value={config.rooms.kitchen}     onChange={v => updateRooms({ kitchen: v })} />
          <RoomCounterRow icon={Sofa}             label="Living Rooms" color="#f472b6" value={config.rooms.livingRoom}  onChange={v => updateRooms({ livingRoom: v })} />
          <RoomCounterRow icon={Coffee}           label="Dining Rooms" color="#fb923c" value={config.rooms.diningRoom}  onChange={v => updateRooms({ diningRoom: v })} />
          <RoomCounterRow icon={Briefcase}        label="Study Rooms"  color="#a78bfa" value={config.rooms.studyRoom}   onChange={v => updateRooms({ studyRoom: v })} />
          <RoomCounterRow icon={Home}             label="Servant Qtrs" color="#94a3b8" value={config.rooms.servantRoom} onChange={v => updateRooms({ servantRoom: v })} />
          <RoomCounterRow icon={CarFront}         label="Parking Bays" color="#64748b" value={config.rooms.parking}     onChange={v => updateRooms({ parking: v })} max={6} />
        </div>
      </div>

      {/* Features */}
      <div>
        <div className="section-heading">Premium Features</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { key: "lift",             label: "Lift",            icon: ArrowUpDown },
            { key: "solar",            label: "Solar",           icon: Sun },
            { key: "pool",             label: "Pool",            icon: Waves },
            { key: "garden",           label: "Garden",          icon: Trees },
            { key: "rooftopGarden",    label: "Roof Garden",     icon: Trees },
            { key: "hvac",             label: "HVAC",            icon: Wind },
            { key: "waterHarvesting",  label: "Rainwater",       icon: Droplets },
            { key: "evCharging",       label: "EV Charging",     icon: Zap },
          ].map(f => {
            const Icon = f.icon;
            const isOn = config.features[f.key as keyof typeof config.features];
            return (
              <button key={f.key}
                className={`room-toggle ${isOn ? "active" : ""}`}
                onClick={() => updateFeatures({ [f.key]: !isOn } as Partial<BuildingConfig["features"]>)}>
                <Icon size={13} />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Material */}
      <div>
        <div className="section-heading">Primary Material</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {MATERIALS.map(mat => (
            <div key={mat.id} className={`mat-swatch ${config.material === mat.id ? "active" : ""}`}
              onClick={() => updateConfig({ material: mat.id })}>
              <div className="mat-swatch-dot" style={{ background: mat.gradient }} />
              <span>{mat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <div className="section-heading">Architectural Style</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ARCH_STYLES.map(s => (
            <button key={s} className={`style-card ${config.style === s ? "active" : ""}`}
              onClick={() => updateConfig({ style: s })}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* AI Description */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div className="section-heading" style={{ margin: 0 }}>
            <Sparkles size={12} style={{ display: "inline", marginRight: 4, color: "#a855f7" }} />
            AI Building Description
          </div>
          <button onClick={() => setAiDesc(generateAIDescription(config))} className="btn btn-sm btn-secondary" style={{ padding: "0.25rem 0.5rem" }}>
            <RefreshCw size={11} />
          </button>
        </div>
        <div className="ai-desc-box">{aiDesc}</div>
      </div>

      {/* Spacer */}
      <div style={{ height: 12 }} />
    </div>
  );
}
