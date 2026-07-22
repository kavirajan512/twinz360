import React, { useState } from 'react';
import { 
  Database, Brain, Cpu, HardDrive, Download, Play, Save, CheckCircle2,
  Box, Building, Home, Layout, Images, Monitor, Settings, Search, Trees, Hexagon, Truck, UserCircle2, Wrench
} from 'lucide-react';

export default function FeasibilityPlanner() {
  const [activeTab, setActiveTab] = useState<'datasets' | 'sources' | 'materials' | 'ai_models' | 'storage'>('datasets');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // Auto-Build State
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [buildProgress, setBuildProgress] = useState(0);

  const toggleSelection = (item: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const DATASET_TYPES = [
    { name: "Interior Houses", purpose: "Room generation", ai: true, viewer: true, icon: Home },
    { name: "Exterior Buildings", purpose: "Building generation", ai: true, viewer: true, icon: Building },
    { name: "BIM Models", purpose: "Construction workflows", ai: true, viewer: true, icon: Box },
    { name: "CAD Models", purpose: "Engineering operations", ai: true, viewer: true, icon: Hexagon },
    { name: "Furniture", purpose: "Interior design", ai: true, viewer: true, icon: Layout },
    { name: "Materials (PBR)", purpose: "Realistic rendering", ai: true, viewer: true, icon: Images },
    { name: "Trees & Plants", purpose: "Landscaping", ai: false, viewer: true, icon: Trees },
    { name: "Vehicles & Equipment", purpose: "Construction site", ai: true, viewer: true, icon: Truck },
    { name: "Human Characters", purpose: "Workers", ai: true, viewer: true, icon: UserCircle2 },
    { name: "MEP Models", purpose: "HVAC, Plumbing", ai: true, viewer: true, icon: Wrench },
  ];

  const AI_MODELS = [
    "Text → Floor Plan", "Floor Plan → 3D Model", "Image → 3D Model", 
    "Sketch → 3D Model", "Drone Images → Gaussian Splatting", "BIM → Interactive Viewer",
    "Interior AI Designer", "Exterior AI Designer", "Material Recommendation",
    "Construction Progress Prediction", "Cost Estimation", "Safety Monitoring"
  ];

  const SOURCES = [
    { name: "Objaverse", desc: "800K+ 3D objects", license: "Free (Check Individual)" },
    { name: "ShapeNet", desc: "50K+ categorized models", license: "Research Use" },
    { name: "Google Scanned Objects", desc: "Real scanned assets", license: "Free" },
    { name: "Poly Haven", desc: "HDRIs, textures, models", license: "CC0" },
    { name: "Matterport3D", desc: "Indoor scans", license: "Research Use" },
    { name: "ScanNet", desc: "Indoor scenes", license: "Research Use" },
    { name: "Tanks and Temples", desc: "Photogrammetry", license: "Research Use" },
    { name: "COCO Dataset", desc: "Workers, vehicles detection", license: "Free" }
  ];

  const MATERIALS = ["Concrete", "Brick", "Marble", "Granite", "Wood", "Steel", "Glass", "Ceramic", "Asphalt", "Grass", "Water"];
  
  const PROGRESS_STAGES = [
    "Empty Land", "Survey", "Excavation", "Foundation", "Footings", "Columns", 
    "Beams", "Slabs", "Walls", "Roofing", "Windows", "Doors", 
    "MEP Installation", "Interior/Exterior Finishing", "Landscaping", "Completed"
  ];

  const handleStartBuild = () => {
    if (selectedItems.size === 0) {
      alert("Please select at least one Dataset Type to begin the training pipeline.");
      return;
    }
    
    setIsBuilding(true);
    setBuildLogs(["[SYSTEM] Initializing AeroTwin Automated Build Engine..."]);
    setBuildProgress(0);

    const steps = [
      "[INFO] Authenticating with Enterprise Data Lake...",
      `[INFO] Scaffolding storage directories: storage/glb, storage/ifc, ai/yolo, ai/gsplat...`,
      `[INFO] Target Datasets Selected: ${Array.from(selectedItems).join(", ")}`,
      "[SYNC] Connecting to Objaverse and ShapeNet API endpoints...",
      "[DOWNLOAD] Fetching initial 3D object batch (5,000 items)...",
      "[AI_TRAINING] Compiling Coohom-style Auto-Interior generator weights...",
      "[AI_TRAINING] Fine-tuning YOLOv11 on Construction PPE Dataset...",
      "[GIS] Integrating CesiumJS spatial map constraints...",
      "[SUCCESS] Pipeline stabilized. Background processing active.",
      "[COMPLETED] Build engine successfully initialized. Datasets are now syncing."
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setBuildLogs(prev => [...prev, steps[stepIndex]]);
        setBuildProgress(Math.floor(((stepIndex + 1) / steps.length) * 100));
        stepIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1200);
  };

  if (isBuilding) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', padding: '2rem' }}>
        <h1 className="title-gradient-purple" style={{ fontSize: '2rem' }}>Automated Build Engine Pipeline</h1>
        
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem', background: '#09090b', border: '1px solid #27272a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={16} className="text-cyan animate-pulse" /> Processing AI Datasets...
            </span>
            <span>{buildProgress}% Complete</span>
          </div>

          <div style={{ width: '100%', height: '6px', background: '#27272a', borderRadius: '4px', overflow: 'hidden', marginBottom: '2rem' }}>
            <div style={{ width: `${buildProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))', transition: 'width 1s ease' }} />
          </div>

          <div style={{ flex: 1, fontFamily: 'monospace', color: 'var(--accent-green)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
            {buildLogs.map((log, i) => (
              <div key={i} style={{ opacity: 0, animation: 'fadeIn 0.3s forwards' }}>
                <span style={{ color: 'var(--text-muted)' }}>{new Date().toLocaleTimeString()}</span> - {log}
              </div>
            ))}
            {buildProgress < 100 && (
              <div className="animate-pulse" style={{ color: 'var(--accent-cyan)' }}>_</div>
            )}
          </div>
          
          {buildProgress === 100 && (
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-gradient" onClick={() => setIsBuilding(false)}>
                Return to Architect Planner
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', overflow: 'hidden' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title-gradient-purple" style={{ fontSize: '2rem' }}>AI Dataset Architect & Feasibility Planner</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Configure and synchronize massive 3D datasets to train AeroTwin's specialized AI models.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary">
            <HardDrive size={16} /> Storage: 1.2 TB Used
          </button>
          <button className="btn btn-gradient" onClick={handleStartBuild}>
            <Play size={16} /> Start AI Training Pipeline
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'datasets', label: 'Dataset Types', icon: Database },
          { id: 'sources', label: 'Data Sources', icon: Download },
          { id: 'materials', label: 'PBR & Progress', icon: Images },
          { id: 'ai_models', label: 'AI Training Models', icon: Brain },
          { id: 'storage', label: 'Storage Architecture', icon: Server }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id as any)}
            style={{
              padding: '0.5rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === t.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: activeTab === t.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: activeTab === t.id ? 600 : 400
            }}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="glass-panel" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        
        {activeTab === 'datasets' && (
          <div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Required 3D Datasets</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {DATASET_TYPES.map(ds => (
                <div 
                  key={ds.name}
                  onClick={() => toggleSelection(ds.name)}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '8px',
                    border: `1px solid ${selectedItems.has(ds.name) ? 'var(--accent-cyan)' : 'var(--border)'}`,
                    background: selectedItems.has(ds.name) ? 'rgba(6,182,212,0.1)' : 'rgba(24, 24, 27, 0.4)',
                    cursor: 'pointer',
                    display: 'flex', gap: '1rem', alignItems: 'flex-start'
                  }}
                >
                  <div style={{ padding: '0.5rem', background: '#27272a', borderRadius: '8px' }}>
                    <ds.icon size={20} className="text-cyan" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>{ds.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ds.purpose}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {ds.ai && <span className="tab-pill active" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>AI Training</span>}
                      {ds.viewer && <span className="tab-pill" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>3D Viewer</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Best Free 3D Dataset Sources</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem' }}>Source</th>
                  <th style={{ padding: '1rem' }}>Contains</th>
                  <th style={{ padding: '1rem' }}>License</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {SOURCES.map((src, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--accent-purple)' }}>{src.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{src.desc}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{src.license}</td>
                    <td style={{ padding: '1rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Sync API</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'ai_models' && (
          <div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Specialized AI Models to Train</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {AI_MODELS.map(model => (
                <div 
                  key={model}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    background: 'rgba(139, 92, 246, 0.05)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <span style={{ fontWeight: 500, color: '#fff' }}>{model}</span>
                  <Cpu size={16} className="text-purple" />
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '12px' }}>
              <h3 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>Platform Target (Sketchfab + Coohom + Autodesk)</h3>
              <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9rem', listStyle: 'none', padding: 0 }}>
                <li>✅ 500,000–1,000,000+ 3D objects (furniture, equipment)</li>
                <li>✅ 50,000+ building models</li>
                <li>✅ 100,000+ PBR materials and textures</li>
                <li>✅ 10,000+ interior scene templates</li>
                <li>✅ 5,000+ BIM/IFC models</li>
                <li>✅ 10,000+ scanned environments (Photogrammetry/Gaussian Splatting)</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>PBR Material Dataset</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {MATERIALS.map(m => (
                  <span key={m} className="tab-pill" style={{ background: '#27272a', border: '1px solid var(--border)' }}>{m}</span>
                ))}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                *Each material includes: Albedo, Normal, Roughness, Metallic, Ambient Occlusion, Height/Displacement
              </p>
            </div>
            
            <div>
              <h2 style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Construction Progress Stages</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {PROGRESS_STAGES.map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="tab-pill active" style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--accent-cyan)' }}>
                      {i + 1}. {s}
                    </span>
                    {i < PROGRESS_STAGES.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>3D Assets Storage Architecture</h2>
            <div style={{ 
              background: '#09090b', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              fontFamily: 'monospace',
              color: 'var(--accent-green)',
              border: '1px solid #1f2937'
            }}>
<pre style={{ margin: 0 }}>
3D Assets
│
├── Buildings/
├── Interiors/
├── Furniture/
├── Materials/
├── BIM/
├── PointCloud/
├── GaussianSplats/
├── Animations/
├── Vehicles/
├── Equipment/
├── Workers/
└── HDRI/
</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Missing icon fallback
const Server = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
    <line x1="6" y1="6" x2="6.01" y2="6"></line>
    <line x1="6" y1="18" x2="6.01" y2="18"></line>
  </svg>
);
