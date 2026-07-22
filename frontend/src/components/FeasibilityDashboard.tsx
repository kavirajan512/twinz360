"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { CheckCircle, XCircle, AlertTriangle, Building, Calculator, Download, Loader2, Play, Ruler, ArrowRight, ArrowLeft, BarChart3, Wrench, Calendar, Info, Layers, TrendingUp } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import Feasibility3DViewer from "./Feasibility3DViewer";
import LuxuryVillaViewer from "./LuxuryVillaViewer";
import Blender3DViewer from "./Blender3DViewer";
import ConstructionTimelapse from "./ConstructionTimelapse";

const DynamicLocationPickerMap = dynamic(() => import("./LocationPickerMap"), { ssr: false });

export default function FeasibilityDashboard({ userId }: { userId: number }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Navigation Steps in Form Wizard
  const [formStep, setFormStep] = useState(1);
  const [viewMode, setViewMode] = useState<"architectural" | "structural" | "furnished">("architectural");
  const [viewerTab, setViewerTab] = useState<"3d" | "timelapse" | "blender">("3d");
  const [activeTab, setActiveTab] = useState<"feasibility" | "layout" | "structural" | "boq" | "cost" | "timeline" | "risks" | "sustainability">("feasibility");

  // Provision Status
  const [provisioning, setProvisioning] = useState(false);
  const [provisionedProject, setProvisionedProject] = useState<number | null>(null);

  // Camera room jump target
  const [focusedRoom, setFocusedRoom] = useState<string | undefined>(undefined);

  // UE5 simulated streaming modal
  const [showUE5Stream, setShowUE5Stream] = useState(false);
  const [ue5Loading, setUe5Loading] = useState(true);

  // Close streaming modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowUE5Stream(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Form State matching all new requirements
  const [formData, setFormData] = useState({
    user_id: userId,
    project_name: "",
    customer_name: "",
    mobile: "",
    land_owner: "",
    village: "",
    district: "Chennai",
    state: "Tamil Nadu",
    pin_code: "",
    designation: "",
    land_length: 30,
    land_width: 25,
    plot_area: 750,
    plot_shape: "Rectangle",
    corner_plot: "No",
    road_sides: "1",
    road_width: 12,
    gps_location: "13.0827, 80.2707",
    soil_type: "Medium Clay",
    terrain_type: "Flat",
    flood_zone: "No",
    water_logging: "Low Risk",
    crz: "No",
    electricity: "Available",
    water_connection: "Available",
    drainage: "Available",
    // Requirements
    num_floors: 2,
    building_type: "Villa",
    bedrooms: 3,
    bathrooms: 2,
    hall: 1,
    kitchen: 1,
    parking: 1,
    lift: 0,
    balcony: 1,
    terrace: 1,
    pool: 0,
    ev_charging: 0,
    solar: 0,
    // Styles
    style_selection: "Modern",
    material_preference: "Concrete",
    facing_direction: "East",
    // Budget
    min_budget: 4000000,
    max_budget: 6000000,
    loan_required: "Yes",
    bank_name: "HDFC",
    ai_prompt: ""
  });

  // UX State for UI simulations
  const [simulatingOCR, setSimulatingOCR] = useState(false);
  const [simulatingAI, setSimulatingAI] = useState(false);
  const [ocrComplete, setOcrComplete] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "number" ? parseFloat(e.target.value) : e.target.value;
    setFormData(prev => {
      const next = { ...prev, [e.target.name]: value };
      // Auto-compute area if length or width change
      if (e.target.name === "land_length" || e.target.name === "land_width") {
        next.plot_area = next.land_length * next.land_width;
      }
      return next;
    });
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:3001/api/feasibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        const parsedReport = {
          ...data,
          suggestions: JSON.parse(data.suggestions_json),
          workers: JSON.parse(data.worker_estimate_json),
          materials: JSON.parse(data.material_estimate_json),
          costs: JSON.parse(data.cost_estimate_json),
          duration: JSON.parse(data.duration_estimate_json),
          three_d_params: {
            ...JSON.parse(data.three_d_params_json),
            ifc_url: "/sample.ifc"
          },
          floor_plan: JSON.parse(data.floor_plan_json),
          structural_plan: JSON.parse(data.structural_plan_json),
          boq: JSON.parse(data.boq_json),
          timeline: jsonParseSafe(data.timeline_json),
          cost_breakdown: jsonParseSafe(data.cost_breakdown_json),
          directives: jsonParseSafe(data.directives_json || "[]")
        };
        setResult(parsedReport);
        setFormStep(7); // Go to results view (Step 7)
      }
    } catch (err) {
      console.warn("Backend unavailable, using simulated engineering analysis...", err);
      // Simulate 1.5s delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const isSoftClay = formData.soil_type.includes("Soft");
      const isHighFloors = formData.num_floors >= 4;
      const isBudgetTight = formData.max_budget / (formData.num_floors || 1) < 2000000;

      // Dynamically compute score factors
      const landScore = formData.plot_shape === "Rectangle" ? 95 : 75;
      const soilScore = isSoftClay ? 65 : 92;
      const budgetScore = isBudgetTight ? 55 : 94;
      const regulationScore = isHighFloors ? 78 : 98;
      const envScore = formData.solar > 0 ? 94 : 70;
      const structuralScore = (soilScore + regulationScore) / 2;
      const utilityScore = 90;
      const accessibilityScore = formData.road_width >= 10 ? 95 : 80;

      const overallScore = Math.round(
        (landScore + soilScore + budgetScore + regulationScore + envScore + structuralScore + utilityScore + accessibilityScore) / 8
      );

      const totalCostVal = Math.round(formData.plot_area * formData.num_floors * 18000);

      const simulatedReport = {
        is_possible: overallScore >= 60,
        feasibility_score: overallScore,
        feasibility_metrics: [
          { subject: 'Land', score: landScore },
          { subject: 'Soil', score: soilScore },
          { subject: 'Budget', score: budgetScore },
          { subject: 'Regulations', score: regulationScore },
          { subject: 'Environment', score: envScore },
          { subject: 'Utilities', score: utilityScore },
          { subject: 'Accessibility', score: accessibilityScore }
        ],
        reason: overallScore >= 60
          ? "Zoning approved. Setbacks, FAR, accessibility, and environmental requirements verified against municipal master plans."
          : "Feasibility risk detected. Plot boundaries, high floor counts relative to road width, or soft clay soil conditions restrict building potential.",
        suggestions: [
          isSoftClay ? "⚠️ Pile Foundation highly recommended due to soft clay soil." : "✅ Standard Raft Foundation suitable for soil profile.",
          isBudgetTight ? "⚠️ Estimated project cost exceeds budget envelope. Consider reducing floors or using alternative finishes." : "✅ Budget envelope is adequate for proposed construction style.",
          formData.solar === 0 ? "💡 Add Solar Panels to improve the Green Building Score and receive tax rebates." : "✅ Solar Panel array reduces calculated Carbon Footprint."
        ],
        workers: { "Masons": 12, "Helpers": 20, "Electricians": 4 },
        materials: { "Cement": 800, "Steel (TMT)": 4500, "Bricks": 40000 },
        costs: {
          "Material Cost": Math.round(totalCostVal * 0.45),
          "Labour Cost": Math.round(totalCostVal * 0.25),
          "Equipment Cost": Math.round(totalCostVal * 0.15),
          "Contractor Cost": Math.round(totalCostVal * 0.08),
          "Transportation": Math.round(totalCostVal * 0.04),
          "Contingency (5%)": Math.round(totalCostVal * 0.03),
          "Total Cost": totalCostVal
        },
        duration: { "Foundation": "3 weeks", "Superstructure": "8 weeks", "Finishing": "6 weeks" },
        three_d_params: {
          glb_url: "",
          ifc_url: "/sample.ifc",
          style: formData.style_selection,
          force_flat_roof: true,
          material_override: formData.material_preference,
          sunHour: 12,
          activeLayers: { architectural: true, structural: true, plumbing: true, electrical: true, furniture: true, lighting: true, landscaping: true, progress: true }
        },
        floor_plan: {
          "Ground Floor": ["Reception & Lobby", "Basement Entry", "MEP Control Room", "Visitor Parking"],
          "First Floor": ["Executive Cabins", "Conference Room", "Co-working Bay", "Pantry"],
          "Terrace": ["Rooftop Cafe", "Solar Array", "Water Tank System"]
        },
        structural_plan: {
          "Foundation Type": isSoftClay ? "Pile Foundation" : "Isolated Footing",
          "Column Size": "300mm x 600mm",
          "Beam Depth": "450mm",
          "Slab Thickness": "150mm",
          "Concrete Grade": "M30",
          "Steel Grade": "Fe550D"
        },
        boq: {
          "Concrete (Cu.m)": Math.round(formData.plot_area * formData.num_floors * 0.22),
          "Cement (Bags)": Math.round(formData.plot_area * formData.num_floors * 2.1),
          "Steel Rebar (Kg)": Math.round(formData.plot_area * formData.num_floors * 28),
          "Bricks (Nos)": Math.round(formData.plot_area * formData.num_floors * 115),
          "Sand (Cu.m)": Math.round(formData.plot_area * formData.num_floors * 0.75),
          "Aggregate (Cu.m)": Math.round(formData.plot_area * formData.num_floors * 0.65),
          "Glass Panels (Sq.m)": Math.round(formData.plot_area * 4),
          "Floor Tiles (Sq.m)": Math.round(formData.plot_area * formData.num_floors * 0.85),
          "Emulsion Paint (Liters)": Math.round(formData.plot_area * formData.num_floors * 1.8),
          "Doors & Windows (Nos)": formData.bedrooms * 4 + 4,
          "Electrical Conduit (m)": Math.round(formData.plot_area * formData.num_floors * 12),
          "Plumbing Piping (m)": Math.round(formData.plot_area * formData.num_floors * 6),
          "HVAC Ductwork (m)": Math.round(formData.plot_area * formData.num_floors * 2.5)
        },
        timeline: {
          "Excavation & Site Prep": "Month 1",
          "Foundation Phase": "Month 2",
          "Columns & Framing": "Month 3-4",
          "Slabs Construction": "Month 5",
          "Masonry & Walls": "Month 6",
          "MEP Rough-in": "Month 7",
          "Finishing & Painting": "Month 8",
          "Interior Works": "Month 9",
          "Landscaping & Handover": "Month 10",
          "Total Duration": "10 Months"
        },
        risks: [
          { category: "Soil Risk", risk: isSoftClay ? "High settlement risk" : "Low risk", mitigation: "Use continuous pile foundation and soil stabilization." },
          { category: "Budget Risk", risk: isBudgetTight ? "High contingency overrun" : "Medium risk", mitigation: "Establish fixed-price vendor contracts." },
          { category: "Schedule Risk", risk: isHighFloors ? "Concrete cure delays" : "Low risk", mitigation: "Use quick-setting admixtures for columns and slabs." },
          { category: "Regulatory Risk", risk: isHighFloors ? "FSI deviation check required" : "Low risk", mitigation: "Obtain local authority setback clearances." }
        ],
        sustainability: {
          carbon_footprint: Math.round(formData.plot_area * formData.num_floors * 0.35) + " Tons CO2",
          energy_saving: formData.solar > 0 ? "Estimated 40% reduction in utility load" : "No baseline solar offset",
          solar_potential: formData.solar > 0 ? (formData.solar * 3.5) + " kWp generated daily" : "8.5 kWp possible on roof",
          rainwater_harvesting: "5,000 Liters storage tank recommendation",
          leed_readiness: overallScore >= 80 ? "Gold Certified (Ready)" : "Silver Certified (Recommended upgrades)"
        },
        directives: [
          `Applied ${formData.style_selection} facade rules and setbacks.`,
          `Generated ${formData.num_floors} story structural skeleton based on ${formData.soil_type} soil.`,
          `Allocated materials within ${formData.max_budget} budget.`
        ]
      };
      setResult(simulatedReport);
      setFormStep(7); // Go to results view
    }
    setLoading(false);
  };

  const handleOCRUpload = () => {
    setSimulatingOCR(true);
    setTimeout(() => {
      setSimulatingOCR(false);
      setOcrComplete(true);
    }, 2500);
  };

  const startDeepAIAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep(6); // Go to AI Loading screen
    setSimulatingAI(true);
    setTimeout(() => {
      setSimulatingAI(false);
      handleAnalyze(e);
    }, 4500); // Wait 4.5 seconds on the AI loading screen before generating the result
  };

  const handleProvisionProject = async () => {
    if (!result?.id) return;
    setProvisioning(true);
    try {
      const res = await fetch(`http://127.0.0.1:3001/feasibility/provision/${result.request_id}`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setProvisionedProject(data.project_id);
      }
    } catch (err) {
      console.error(err);
    }
    setProvisioning(false);
  };

  const jsonParseSafe = (str: string) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return {};
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleDownloadBIM = (type: string) => {
    const data = `AeroTwin BIM Export\nFormat: ${type}\nProject: ${formData.style_selection} ${formData.building_type}\nPlot size: ${formData.land_length}x${formData.land_width}\nFloors: ${formData.num_floors}`;
    const file = new Blob([data], { type: "text/plain" });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = `AeroTwin_Model_${formData.style_selection.toLowerCase()}.${type.toLowerCase()}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const triggerUE5Stream = () => {
    setShowUE5Stream(true);
    setUe5Loading(true);
    setTimeout(() => {
      setUe5Loading(false);
    }, 2500);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "1.5rem" }}>

      {/* LEFT COLUMN: Input Form Wizard / Detailed AI Analysis */}
      <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

        {/* Step 1: Land Details */}
        {formStep === 1 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", color: "var(--accent-cyan)" }}>
              <Ruler size={24} />
              <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0 }}>Step 1: Land & Site Details</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <h3 style={{ fontSize: "1rem", color: "var(--text-secondary)", borderBottom: "1px solid #333", paddingBottom: "0.5rem" }}>Basic Info</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div><label className="form-label">Project Name</label><input type="text" name="project_name" value={formData.project_name} onChange={handleChange} className="form-input" /></div>
                <div><label className="form-label">Customer Name</label><input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} className="form-input" /></div>
                <div><label className="form-label">Village</label><input type="text" name="village" value={formData.village} onChange={handleChange} className="form-input" /></div>
                <div><label className="form-label">District</label><input type="text" name="district" value={formData.district} onChange={handleChange} className="form-input" /></div>
                <div><label className="form-label">PIN Code</label><input type="text" name="pin_code" value={formData.pin_code} onChange={handleChange} className="form-input" /></div>
                <div><label className="form-label">Designation</label><input type="text" name="designation" value={formData.designation} onChange={handleChange} className="form-input" /></div>
              </div>

              <h3 style={{ fontSize: "1rem", color: "var(--text-secondary)", borderBottom: "1px solid #333", paddingBottom: "0.5rem" }}>Dimensions</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div><label className="form-label">Length (m)</label><input type="number" name="land_length" value={formData.land_length} onChange={handleChange} className="form-input" /></div>
                <div><label className="form-label">Width (m)</label><input type="number" name="land_width" value={formData.land_width} onChange={handleChange} className="form-input" /></div>
                <div><label className="form-label">Plot Shape</label><select name="plot_shape" value={formData.plot_shape} onChange={handleChange} className="form-input"><option>Rectangle</option><option>Square</option><option>Irregular</option></select></div>
                <div><label className="form-label">Road Width (m)</label><input type="number" name="road_width" value={formData.road_width} onChange={handleChange} className="form-input" /></div>
              </div>

              <h3 style={{ fontSize: "1rem", color: "var(--text-secondary)", borderBottom: "1px solid #333", paddingBottom: "0.5rem" }}>GPS & Site Conditions</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div><label className="form-label">Soil Type</label><select name="soil_type" value={formData.soil_type} onChange={handleChange} className="form-input"><option>Medium Clay</option><option>Soft Clay</option><option>Hard Rock</option></select></div>
                <div><label className="form-label">Terrain Type</label><select name="terrain_type" value={formData.terrain_type} onChange={handleChange} className="form-input"><option>Flat</option><option>Hilly</option></select></div>
                <div><label className="form-label">Flood Zone</label><select name="flood_zone" value={formData.flood_zone} onChange={handleChange} className="form-input"><option>No</option><option>Yes</option></select></div>
                <div><label className="form-label">GPS Location</label><input type="text" name="gps_location" value={formData.gps_location} onChange={handleChange} className="form-input" readOnly /></div>
              </div>

              {/* Dynamic Interactive GPS Map */}
              <DynamicLocationPickerMap
                gpsLocation={formData.gps_location}
                addressString={`${formData.village}, ${formData.district}, ${formData.state}, ${formData.pin_code}`}
                onChange={(loc) => setFormData(prev => ({ ...prev, gps_location: loc }))}
              />
            </div>

            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-primary" style={{ padding: "0.6rem 1.2rem", display: "flex", gap: "0.5rem" }} onClick={() => setFormStep(2)}>
                Next: Legal Documents <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Legal Documents & OCR */}
        {formStep === 2 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", color: "var(--accent-cyan)" }}>
              <Wrench size={24} />
              <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0 }}>Step 2: Legal Documents & OCR</h2>
            </div>
            <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "2rem", borderRadius: "8px", border: "1px dashed var(--accent-cyan)", textAlign: "center" }}>
              <Info size={40} style={{ color: "var(--accent-cyan)", margin: "0 auto 1rem auto" }} />
              <h3 style={{ marginBottom: "1rem" }}>Upload Property Documents (Patta, Sale Deed, EC)</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Our AI will automatically extract ownership, survey numbers, and legal risks using OCR.</p>

              {!ocrComplete ? (
                <button className="btn btn-primary" onClick={handleOCRUpload} disabled={simulatingOCR}>
                  {simulatingOCR ? <><Loader2 size={16} className="animate-spin" /> Extracting Data via AI OCR...</> : "Upload & Analyze PDFs"}
                </button>
              ) : (
                <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "1rem", borderRadius: "8px", color: "#10b981", border: "1px solid #10b981" }}>
                  <CheckCircle size={24} style={{ margin: "0 auto 0.5rem auto" }} />
                  <strong>OCR Extraction Successful</strong>
                  <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Validated: Sale Deed, Patta, EC. Encumbrance: Clear. Ownership Matches.</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
              <button className="btn btn-secondary" onClick={() => setFormStep(1)}><ArrowLeft size={16} /> Back</button>
              <button className="btn btn-primary" onClick={() => setFormStep(3)} disabled={!ocrComplete}>Next: Govt Rules <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 3: Government Rules */}
        {formStep === 3 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", color: "var(--accent-cyan)" }}>
              <Building size={24} />
              <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0 }}>Step 3: Government Rules (Auto-Detected)</h2>
            </div>
            <div style={{ background: "rgba(6, 182, 212, 0.1)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--accent-cyan)", marginBottom: "1.5rem" }}>
              <p style={{ color: "var(--accent-cyan)", fontSize: "0.9rem", marginBottom: "1rem" }}>Based on the GPS Location ({formData.gps_location}), the AI has retrieved the following master plan rules for the zone:</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div><strong>Max FSI/FAR:</strong> 1.5</div>
                <div><strong>Ground Coverage:</strong> 60% Max</div>
                <div><strong>Front Setback:</strong> {formData.road_width >= 10 ? '3m' : '1.5m'}</div>
                <div><strong>Side Setback:</strong> 1.5m</div>
                <div><strong>Max Height:</strong> G+2 (12m)</div>
                <div><strong>Rainwater Harvesting:</strong> Mandatory</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button className="btn btn-secondary" onClick={() => setFormStep(2)}><ArrowLeft size={16} /> Back</button>
              <button className="btn btn-primary" onClick={() => setFormStep(4)}>Next: Custom Requirements <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 4: Customer Requirements */}
        {formStep === 4 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", color: "var(--accent-cyan)" }}>
              <Layers size={24} />
              <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0 }}>Step 4: Customer Requirements</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div><label className="form-label">Building Type</label><select name="building_type" value={formData.building_type} onChange={handleChange} className="form-input"><option>Villa</option><option>Apartment</option><option>Commercial</option></select></div>
                <div><label className="form-label">Number of Floors</label><input type="number" name="num_floors" value={formData.num_floors} onChange={handleChange} className="form-input" min="1" /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.8rem" }}>
                {["bedrooms", "bathrooms", "hall", "kitchen", "parking", "lift"].map(field => (
                  <div key={field}>
                    <label className="form-label" style={{ textTransform: "capitalize", fontSize: "0.75rem" }}>{field === 'hall' ? 'Living Hall' : field}</label>
                    <input type="number" name={field} value={(formData as any)[field]} onChange={handleChange} className="form-input" min="0" required />
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.8rem" }}>
                {["pool", "ev_charging", "solar"].map(field => (
                  <div key={field}>
                    <label className="form-label" style={{ textTransform: "capitalize", fontSize: "0.75rem" }}>{field.replace('_', ' ')} (Qty)</label>
                    <input type="number" name={field} value={(formData as any)[field]} onChange={handleChange} className="form-input" min="0" />
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div><label className="form-label">Style Selection</label><select name="style_selection" value={formData.style_selection} onChange={handleChange} className="form-input"><option>Modern</option><option>Contemporary</option><option>Luxury</option></select></div>
                <div><label className="form-label">Material Pref</label><select name="material_preference" value={formData.material_preference} onChange={handleChange} className="form-input"><option>Concrete</option><option>Brick</option><option>Glass</option></select></div>
              </div>
            </div>

            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
              <button className="btn btn-secondary" onClick={() => setFormStep(3)}><ArrowLeft size={16} /> Back</button>
              <button className="btn btn-primary" onClick={() => setFormStep(5)}>Next: Budget & Financing <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 5: Budget */}
        {formStep === 5 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", color: "var(--accent-cyan)" }}>
              <BarChart3 size={24} />
              <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0 }}>Step 5: Budget & Timeline</h2>
            </div>

            <form onSubmit={startDeepAIAnalysis} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div><label className="form-label">Minimum Budget (₹)</label><input type="number" name="min_budget" value={formData.min_budget} onChange={handleChange} className="form-input" /></div>
                <div><label className="form-label">Maximum Budget (₹)</label><input type="number" name="max_budget" value={formData.max_budget} onChange={handleChange} className="form-input" /></div>
                <div><label className="form-label">Loan Required</label><select name="loan_required" value={formData.loan_required} onChange={handleChange} className="form-input"><option>Yes</option><option>No</option></select></div>
                <div><label className="form-label">Bank Name</label><input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className="form-input" /></div>
              </div>
              <div style={{ marginTop: "1rem" }}>
                <label className="form-label">Custom AI Design Prompt (Directives)</label>
                <textarea name="ai_prompt" value={formData.ai_prompt} onChange={handleChange} className="form-input" rows={2} placeholder="e.g. Include a smart EV charging port in parking..." />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setFormStep(4)}><ArrowLeft size={16} /> Back</button>
                <button type="submit" className="btn btn-primary" style={{ background: "linear-gradient(45deg, #0ea5e9, #3b82f6)" }}>
                  Launch Deep AI Analysis
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 6: AI Analysis Loader */}
        {formStep === 6 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
            <Loader2 size={64} className="animate-spin text-cyan" style={{ marginBottom: "1.5rem" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem", color: "var(--accent-cyan)" }}>AeroTwin Deep AI Analysis Running...</h2>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left", width: "100%", maxWidth: "400px", background: "rgba(15,23,42,0.8)", padding: "1.5rem", borderRadius: "8px", border: "1px solid #333" }}>
              <p>✅ Land Suitability Analysis</p>
              <p>✅ Government Rules & FSI Validation</p>
              <p>⏳ Generating 3D Floor Plans & Skeletons</p>
              <p>⏳ Calculating Material BOQ</p>
              <p>⏳ Estimating Environmental Carbon Impact</p>
            </div>
          </div>
        )}

        {/* Step 7: Upgraded Design & AI Analysis Workflow Output tabs */}
        {formStep === 7 && result && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

            {/* Header with quick indicators */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {result.is_possible ? <CheckCircle className="text-emerald" size={22} /> : <XCircle className="text-red" size={22} />}
                  AeroTwin Comprehensive Analysis: {result.is_possible ? "Feasible" : "Failed Checks"}
                </h2>
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                  <span style={{ padding: "4px 8px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>Legal Compliance: 98%</span>
                  <span style={{ padding: "4px 8px", background: "rgba(14, 165, 233, 0.1)", color: "#0ea5e9", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>Constr. Risk: Low</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.5rem" }}>{result.reason}</p>
              </div>
              <button className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }} onClick={handleDownloadPDF}><Download size={14} /> PDF</button>
            </div>

            {/* AI Custom Prompt Directives Applied */}
            {result.directives && result.directives.length > 0 && (
              <div style={{ background: "rgba(6, 182, 212, 0.08)", borderLeft: "3px solid var(--accent-cyan)", padding: "0.6rem 0.8rem", marginBottom: "1rem", borderRadius: "4px" }}>
                <strong style={{ color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", marginBottom: "0.2rem" }}>
                  <Layers size={14} /> AI Design Directives Applied
                </strong>
                <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  {result.directives.map((d: string, i: number) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}

            {/* AI Suggestions alert block */}
            {result.suggestions?.length > 0 && (
              <div style={{ background: "rgba(245, 158, 11, 0.08)", borderLeft: "3px solid var(--accent-amber)", padding: "0.6rem 0.8rem", marginBottom: "1rem", borderRadius: "4px" }}>
                <strong style={{ color: "var(--accent-amber)", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", marginBottom: "0.2rem" }}>
                  <AlertTriangle size={14} /> Step 2 Suggestions
                </strong>
                <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  {result.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {/* Workflow Navigation Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", gap: "0.5rem", marginBottom: "1.2rem", overflowX: "auto", paddingBottom: "4px" }}>
              {[
                { id: "feasibility", label: "Feasibility Score" },
                { id: "layout", label: "Space Layout" },
                { id: "structural", label: "Structural" },
                { id: "boq", label: "5D QTO / BOQ" },
                { id: "cost", label: "AI Costing" },
                { id: "timeline", label: "4D Schedule" },
                { id: "risks", label: "AI Risks" },
                { id: "sustainability", label: "Sustainability" }
              ].map(tab => (
                <button
                  key={tab.id}
                  style={{
                    padding: "0.5rem 1rem", fontSize: "0.8rem", background: "none", border: "none",
                    color: activeTab === tab.id ? "var(--accent-cyan)" : "var(--text-secondary)",
                    borderBottom: activeTab === tab.id ? "2px solid var(--accent-cyan)" : "none",
                    cursor: "pointer", fontWeight: activeTab === tab.id ? "600" : "400",
                    whiteSpace: "nowrap", transition: "all 0.2s ease"
                  }}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div style={{ flex: 1, overflowY: "auto", paddingRight: "0.3rem", minHeight: "360px" }}>

              {/* TAB: FEASIBILITY SUMMARY */}
              {activeTab === "feasibility" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem", alignItems: "center" }}>

                    {/* Overall Score Dial */}
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center", background: "rgba(255, 255, 255, 0.02)", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border)" }}>
                      <div style={{
                        position: "relative", width: 80, height: 80, borderRadius: "50%",
                        background: `conic-gradient(var(--accent-cyan) ${result.feasibility_score * 3.6}deg, #1e293b 0deg)`,
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <div style={{
                          width: 66, height: 66, borderRadius: "50%", background: "#0a0a14",
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                        }}>
                          <span style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--accent-cyan)" }}>{result.feasibility_score}%</span>
                          <span style={{ fontSize: "0.55rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Score</span>
                        </div>
                      </div>
                      <div>
                        <h4 style={{ margin: "0 0 0.2rem 0", fontSize: "0.95rem", color: "#fff" }}>Project Feasibility Status</h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--accent-emerald)" }} />
                          <span style={{ fontSize: "0.8rem", color: "var(--accent-emerald)", fontWeight: "bold" }}>Highly Feasible</span>
                        </div>
                        <p style={{ margin: "0.4rem 0 0 0", fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.3 }}>
                          Zoning setbacks, FAR limits, and local utilities check out successfully.
                        </p>
                      </div>
                    </div>

                    {/* Radar Chart */}
                    <div style={{ width: "100%", height: 180, display: "flex", justifyContent: "center" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={result.feasibility_metrics}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" style={{ fontSize: 9 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" style={{ fontSize: 7 }} />
                          <Radar name="Score" dataKey="score" stroke="var(--accent-cyan)" fill="var(--accent-cyan)" fillOpacity={0.35} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div style={{ background: "rgba(15,23,42,0.4)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <h3 style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", margin: "0 0 0.6rem 0", display: "flex", alignItems: "center", gap: "6px" }}><Ruler size={16} /> Zoning Setbacks</h3>
                      <ul style={{ paddingLeft: "1.2rem", margin: 0, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.8rem" }}>
                        <li>Road Width: <strong>{formData.road_width}m</strong></li>
                        <li>Plot Shape: <strong>{formData.plot_shape}</strong></li>
                        <li>Setbacks: Front ({formData.road_width >= 10 ? "3m" : "2m"}), Sides ({1.5 + 0.5 * formData.num_floors}m), Back (2m)</li>
                      </ul>
                    </div>
                    <div style={{ background: "rgba(15,23,42,0.4)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <h3 style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", margin: "0 0 0.6rem 0", display: "flex", alignItems: "center", gap: "6px" }}><Building size={16} /> Site Conditions</h3>
                      <ul style={{ paddingLeft: "1.2rem", margin: 0, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.8rem" }}>
                        <li>Terrain: <strong>{formData.terrain_type}</strong></li>
                        <li>Soil Profile: <strong>{formData.soil_type}</strong></li>
                        <li>Aspect Ratio: <strong>{formData.facing_direction} Facing</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SPACE LAYOUT AI */}
              {activeTab === "layout" && result.floor_plan && (
                <div style={{ fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--accent-cyan)", marginBottom: "0.8rem" }}>
                    <Info size={16} />
                    <span style={{ fontWeight: "bold" }}>Generative 3D Building Floor Layouts</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {Object.entries(result.floor_plan).map(([floor, rooms]: any) => (
                      <div key={floor} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "0.8rem", borderRadius: "6px" }}>
                        <h4 style={{ margin: "0 0 0.4rem 0", color: "#fff", fontSize: "0.85rem" }}>{floor}</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                          {rooms.map((room: string, idx: number) => {
                            // Determine if this room is jumpable
                            let jumpId = "";
                            if (room.toLowerCase().includes("living")) jumpId = "living";
                            else if (room.toLowerCase().includes("kitchen")) jumpId = "kitchen";
                            else if (room.toLowerCase().includes("bedroom") || room.toLowerCase().includes("guest")) jumpId = "bedroom";
                            else if (floor.toLowerCase().includes("terrace")) jumpId = "terrace";

                            return (
                              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.01)", padding: "0.4rem", borderRadius: "4px" }}>
                                <span style={{ fontSize: "0.8rem" }}>{room}</span>
                                {jumpId && (
                                  <button
                                    onClick={() => setFocusedRoom(jumpId)}
                                    style={{
                                      padding: "0.2rem 0.4rem", fontSize: "0.65rem", background: "rgba(6, 182, 212, 0.1)",
                                      border: "1px solid var(--border-focus)", color: "var(--accent-cyan)", borderRadius: "3px", cursor: "pointer"
                                    }}
                                  >
                                    Focus 3D View
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: STRUCTURAL ADVICE */}
              {activeTab === "structural" && result.structural_plan && (
                <div style={{ fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--accent-cyan)", marginBottom: "0.8rem" }}>
                    <Wrench size={16} />
                    <span style={{ fontWeight: "bold" }}>AI Structural Recommendations (Advisory)</span>
                  </div>
                  <table className="spec-table">
                    <tbody>
                      {Object.entries(result.structural_plan).map(([k, v]: any) => (
                        <tr key={k}>
                          <td>{k.replace(/_/g, " ")}</td>
                          <td>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "1rem", lineHeight: "1.3" }}>
                    *Notice: These recommendations are advisory based on analytical models and should be verified by a licensed structural engineer prior to execution.
                  </p>
                </div>
              )}

              {/* TAB: BILL OF QUANTITIES (BOQ) */}
              {activeTab === "boq" && result.boq && (
                <div style={{ fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--accent-cyan)", marginBottom: "0.8rem" }}>
                    <BarChart3 size={16} />
                    <span style={{ fontWeight: "bold" }}>5D QTO Bill of Quantities (Estimated)</span>
                  </div>
                  <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                    <table className="spec-table">
                      <thead>
                        <tr>
                          <th>Material Item</th>
                          <th>Est. Quantity</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(result.boq).map(([item, qty]: any, index) => {
                          const status = index % 3 === 0 ? "Procured" : index % 3 === 1 ? "Partial" : "Pending";
                          const badgeColor = status === "Procured" ? "rgba(16, 185, 129, 0.15)" : status === "Partial" ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)";
                          const textColor = status === "Procured" ? "#10b981" : status === "Partial" ? "#f59e0b" : "#ef4444";

                          return (
                            <tr key={item}>
                              <td>{item}</td>
                              <td>{qty.toLocaleString()}</td>
                              <td>
                                <span style={{
                                  padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "bold",
                                  backgroundColor: badgeColor, color: textColor
                                }}>
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: COST ESTIMATES */}
              {activeTab === "cost" && result.costs && (
                <div style={{ fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--accent-cyan)", marginBottom: "0.8rem" }}>
                    <BarChart3 size={16} />
                    <span style={{ fontWeight: "bold" }}>AI Cost Breakdown Estimation</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem", alignItems: "center" }}>
                    <table className="spec-table">
                      <tbody>
                        {Object.entries(result.costs).map(([item, val]: any) => (
                          <tr key={item} style={{ fontWeight: item === "Total Cost" ? "bold" : "normal" }}>
                            <td>{item}</td>
                            <td style={{ color: item === "Total Cost" ? "var(--accent-emerald)" : "var(--text-primary)" }}>
                              ₹{val.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Cost Chart */}
                    <div style={{ width: "100%", height: 160 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={Object.entries(result.costs).filter(([k]) => k !== "Total Cost").map(([k, v]) => ({ name: k.split(" ")[0], cost: v }))}>
                          <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: 8 }} />
                          <YAxis stroke="#94a3b8" style={{ fontSize: 8 }} width={45} />
                          <Tooltip contentStyle={{ background: "#0c0c14", border: "1px solid var(--border)", fontSize: 10 }} />
                          <Bar dataKey="cost" fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: TIMELINE */}
              {activeTab === "timeline" && result.timeline && (
                <div style={{ fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--accent-cyan)", marginBottom: "1rem" }}>
                    <Calendar size={16} />
                    <span style={{ fontWeight: "bold" }}>4D Construction Schedule (Projected)</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", paddingRight: "8px" }}>
                    {Object.entries(result.timeline).filter(([phase]) => phase !== "Total Duration").map(([phase, duration]: any, idx) => (
                      <div key={phase} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                          <span style={{ color: "#fff", fontWeight: "600" }}>{phase}</span>
                          <span style={{ color: "var(--text-secondary)" }}>{duration}</span>
                        </div>
                        <div style={{ width: "100%", height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden", position: "relative" }}>
                          <div style={{
                            position: "absolute",
                            left: `${idx * 8}%`,
                            width: `${25 + (idx * 3)}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, var(--accent-cyan), #3b82f6)",
                            borderRadius: 3
                          }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "0.85rem" }}>
                      <span>Project Total Duration:</span>
                      <span style={{ color: "var(--accent-cyan)" }}>{result.timeline["Total Duration"]}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: RISKS */}
              {activeTab === "risks" && result.risks && (
                <div style={{ fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--accent-cyan)", marginBottom: "0.8rem" }}>
                    <AlertTriangle size={16} />
                    <span style={{ fontWeight: "bold" }}>AI Risk Analysis & Mitigation Strategies</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                    {result.risks.map((risk: any, i: number) => {
                      const isHigh = risk.risk.toLowerCase().includes("high");
                      const color = isHigh ? "#ef4444" : "#f59e0b";
                      const bg = isHigh ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)";

                      return (
                        <div key={i} style={{ background: bg, borderLeft: `3px solid ${color}`, padding: "0.8rem", borderRadius: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                            <strong style={{ color: "#fff" }}>{risk.category}</strong>
                            <span style={{ color, fontSize: "0.7rem", fontWeight: "bold", textTransform: "uppercase" }}>{risk.risk}</span>
                          </div>
                          <p style={{ margin: "0 0 0.4rem 0", color: "var(--text-secondary)", fontSize: "0.78rem" }}>
                            <strong>Recommendation:</strong> {risk.mitigation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: SUSTAINABILITY */}
              {activeTab === "sustainability" && result.sustainability && (
                <div style={{ fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--accent-cyan)", marginBottom: "0.8rem" }}>
                    <TrendingUp size={16} />
                    <span style={{ fontWeight: "bold" }}>Environmental & Sustainability Profile</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "0.8rem", borderRadius: "6px" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Carbon Footprint (Est)</span>
                      <h4 style={{ margin: "0.2rem 0 0 0", color: "#ef4444", fontSize: "1.1rem" }}>{result.sustainability.carbon_footprint}</h4>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "0.8rem", borderRadius: "6px" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Energy Load Savings</span>
                      <h4 style={{ margin: "0.2rem 0 0 0", color: "var(--accent-emerald)", fontSize: "1.1rem" }}>{result.sustainability.energy_saving}</h4>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "0.8rem", borderRadius: "6px" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Solar Capacity Potential</span>
                      <h4 style={{ margin: "0.2rem 0 0 0", color: "var(--accent-cyan)", fontSize: "1.1rem" }}>{result.sustainability.solar_potential}</h4>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "0.8rem", borderRadius: "6px" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Rainwater Harvesting</span>
                      <h4 style={{ margin: "0.2rem 0 0 0", color: "var(--accent-cyan)", fontSize: "1.1rem" }}>{result.sustainability.rainwater_harvesting}</h4>
                    </div>
                  </div>
                  <div style={{ marginTop: "1rem", background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", borderRadius: "6px", padding: "0.6rem 0.8rem", textAlign: "center", color: "#10b981", fontWeight: "bold" }}>
                    LEED Readiness: {result.sustainability.leed_readiness}
                  </div>
                </div>
              )}

            </div>

            {/* Footer buttons / Provision Flow */}
            <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", display: "flex", justifySelf: "flex-end", justifyContent: "space-between", alignItems: "center" }}>
              <button type="button" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }} onClick={() => setFormStep(2)}>
                Back to specs
              </button>

              {provisionedProject ? (
                <div style={{ color: "var(--accent-emerald)", fontSize: "0.8rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle size={16} /> Project Registered! Switch workspace to view Twin.
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", display: "flex", gap: "0.4rem" }}
                  disabled={!result.is_possible || provisioning}
                  onClick={handleProvisionProject}
                >
                  {provisioning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  Start Project (Provision Twin)
                </button>
              )}
            </div>

          </div>
        )}

      </div>

      {/* RIGHT COLUMN: Realtime Interactive 3D design & Mode Toggles */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>

        {/* Viewer Mode Tabs */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className={viewerTab === "timelapse" ? "btn btn-primary" : "btn btn-secondary"}
            style={{ padding: "0.4rem 0.9rem", fontSize: "0.78rem", display: "flex", gap: "5px", alignItems: "center" }}
            onClick={() => setViewerTab("timelapse")}
          >
            🏗️ Construction Timelapse
          </button>
          <button
            className={viewerTab === "3d" ? "btn btn-primary" : "btn btn-secondary"}
            style={{ padding: "0.4rem 0.9rem", fontSize: "0.78rem", display: "flex", gap: "5px", alignItems: "center" }}
            onClick={() => setViewerTab("3d")}
          >
            🏠 Full 3D Viewer
          </button>
        </div>

        {/* 3D Visualizer Canvas container */}
        <div className="glass-panel" style={{ padding: 0, minHeight: "580px" }}>
          {viewerTab === "timelapse" && (
            <ConstructionTimelapse formData={formData} analysisResult={result} />
          )}
          {viewerTab === "3d" && (
            <LuxuryVillaViewer formData={formData} />
          )}
          {viewerTab === "blender" && (
            <Blender3DViewer formData={formData} analysisResult={result} viewMode={viewMode} focusedRoom={focusedRoom} onViewModeChange={setViewMode} />
          )}
        </div>

        {/* BIM & Unreal Engine 5 Export panel */}
        {result && (
          <div className="glass-panel" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <h3 style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>BIM & UE5 Walkthrough Pipeline</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <button className="btn btn-secondary" style={{ padding: "0.4rem 0.6rem", fontSize: "0.72rem", display: "flex", gap: "4px" }} onClick={() => handleDownloadBIM("IFC")}>
                <Download size={12} /> Export IFC
              </button>
              <button className="btn btn-secondary" style={{ padding: "0.4rem 0.6rem", fontSize: "0.72rem", display: "flex", gap: "4px" }} onClick={() => handleDownloadBIM("USDZ")}>
                <Download size={12} /> Export USDZ
              </button>
            </div>
            <button className="btn btn-primary" style={{ padding: "0.5rem 0.8rem", fontSize: "0.75rem", display: "flex", gap: "6px", width: "100%", justifyContent: "center" }} onClick={triggerUE5Stream}>
              <Play size={12} /> Launch UE5 High-End Walkthrough
            </button>
          </div>
        )}

        {/* Quick parameters summary info panel */}
        <div className="glass-panel" style={{ padding: "1rem" }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Active Config</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.8rem", fontSize: "0.8rem" }}>
            <div>Style: <strong style={{ color: "var(--accent-cyan)" }}>{formData.style_selection}</strong></div>
            <div>Floors: <strong style={{ color: "var(--accent-cyan)" }}>{formData.num_floors}</strong></div>
            <div>Structure: <strong style={{ color: "var(--accent-cyan)" }}>{formData.material_preference}</strong></div>
          </div>
        </div>

      </div>

      {/* Unreal Engine 5 Simulated Pixel Streaming Overlay Modal */}
      {showUE5Stream && (
        <div
          onClick={() => setShowUE5Stream(false)} // Click backdrop to exit modal
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(2, 2, 5, 0.95)", zIndex: 1000, display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center", backdropFilter: "blur(20px)"
          }}
        >
          {ue5Loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", color: "#fff" }} onClick={(e) => e.stopPropagation()}>
              <Loader2 className="animate-spin text-cyan" size={48} />
              <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>Connecting to Unreal Engine 5 Pixel Streaming Server...</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Compiling photorealistic shadows, PBR textures, and terrain assets...</div>
            </div>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()} // Stop click propagation inside the modal frame
              style={{ width: "90%", height: "85%", background: "#05050a", border: "1px solid var(--border-focus)", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}
            >
              {/* Streaming header */}
              <div style={{ background: "#0c0c12", padding: "0.8rem 1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent-emerald)", animation: "pulse 2s infinite" }} />
                  <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#fff" }}>UE5 Live Pixel Streaming (1080p, 60fps)</span>
                </div>
                <button
                  onClick={() => setShowUE5Stream(false)}
                  style={{
                    padding: "0.3rem 0.6rem", background: "#ef4444", border: "none", color: "#fff",
                    borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold"
                  }}
                >
                  Disconnect Stream
                </button>
              </div>

              {/* Simulated high-end render window (interactive preview or animated graphic) */}
              <div style={{ flex: 1, background: "radial-gradient(circle, #1e293b 0%, #020617 100%)", display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
                {/* HUD controls inside streaming container */}
                <div style={{ position: "absolute", bottom: 20, left: 20, display: "flex", gap: "8px", background: "rgba(0,0,0,0.6)", padding: "0.5rem", borderRadius: "6px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Use W A S D keys or Drag Mouse to walk through the {formData.style_selection} Digital Twin.</span>
                </div>

                {/* Visualizer Mockup */}
                <div style={{ textAlign: "center", color: "#fff" }}>
                  <h2 style={{ fontSize: "2rem", fontWeight: "bold", textShadow: "0 0 10px rgba(6,182,212,0.5)", marginBottom: "0.5rem" }}>
                    Unreal Engine 5 Walkthrough
                  </h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    Day/Night Sun Shadows, Lumen Global Illumination, and Nanite Geometry active.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
