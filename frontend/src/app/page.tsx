"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, Camera, ShieldAlert, BarChart3, AlertTriangle, 
  MapPin, CheckCircle, Video, Search, ChevronRight, Settings, 
  LogOut, Construction, FileText, UserCircle, Tractor, Users, Plane, HardHat, Package, TrendingUp, Layers, Calendar
} from "lucide-react";
import DigitalTwinViewer from "../components/DigitalTwinViewer";
import CockpitDashboard from "../components/CockpitDashboard";
import VideoAnalysisOverlay from "../components/VideoAnalysisOverlay";
import CCTVDashboard from "../components/CCTVDashboard";
import FeasibilityDashboard from "../components/FeasibilityDashboard";
import AIVisionDashboard from "../components/AIVisionDashboard";
import FeasibilityPlanner from "../components/FeasibilityPlanner";
import ReportsDashboard from "../components/ReportsDashboard";
import BIM4DDashboard from "../components/BIM4DDashboard";
import BIM5DDashboard from "../components/BIM5DDashboard";
import EquipmentRental from "../components/EquipmentRental";
import EquipmentDashboard from "../components/EquipmentDashboard";
import HRMSDashboard from "../components/HRMSDashboard";
import AISafetyDashboard from "../components/AISafetyDashboard";
import DroneProgressDashboard from "../components/DroneProgressDashboard";
import SmartHelmetDashboard from "../components/SmartHelmetDashboard";
import InventoryDashboard from "../components/InventoryDashboard";
import FinanceDashboard from "../components/FinanceDashboard";
import BIMFacilityDashboard from "../components/BIMFacilityDashboard";
import DroneDashboard from "../components/DroneDashboard";
import ERPDashboard from "../components/ERPDashboard";
import AIAgentsDashboard from "../components/AIAgentsDashboard";
import IoTDashboard from "../components/IoTDashboard";
import { Brain, Wifi, Package as PackageIcon, Navigation } from "lucide-react";

interface Project {
  id: number;
  name: string;
  description: string;
}

interface VideoData {
  id: number;
  filename: string;
  file_path: string;
  status: string;
  progress: number;
}

interface DroneFlight {
  id: number;
  flight_name: string;
  flight_path_json: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("admin_user");
  const [password, setPassword] = useState("password");
  const [authError, setAuthError] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [videos, setVideos] = useState<VideoData[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [flights, setFlights] = useState<DroneFlight[]>([]);
  
  const [sliderProgress, setSliderProgress] = useState(56);
  const [flightCoords, setFlightCoords] = useState<[number, number, number][]>([
    [-20, 15, -20], [-20, 18, 20], [20, 15, 20], [20, 18, -20]
  ]);

  const API_BASE = "http://127.0.0.1:8000";

  // Check login session on load
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
    } else {
      // Auto-login for demo purposes
      setUser({ username: "admin_user", role: "admin", id: 1 });
      localStorage.setItem("user", JSON.stringify({ username: "admin_user", role: "admin", id: 1 }));
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setProjects([
      { id: 1, name: "Center Plaza Mall Extension", description: "Visual and analytical monitoring workspace." }
    ]);
    setSelectedProject({ id: 1, name: "Center Plaza Mall Extension", description: "Visual and analytical monitoring workspace." });
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // CockpitView has been moved to components/CockpitDashboard.tsx

  const SettingsView = () => (
    <div className="glass-panel" style={{ padding: "2rem" }}>
      <h2>Project Configuration</h2>
      <p>Manage project settings, API keys, and integrations here.</p>
    </div>
  );

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)", padding: "1.5rem" }}>
         Loading auth...
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "1rem" }}>
          <Construction className="text-cyan" size={24} />
          <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>AERO-TWIN</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", padding: "0.5rem" }}>
          <button className={`btn ${activeTab === "dashboard" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("dashboard")}>
            <Construction size={16} /> 3D Digital Twin
          </button>
          <button className={`btn ${activeTab === "videos" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("videos")}>
            <Video size={16} /> CCTV & Drone Feeds
          </button>
          <button className={`btn ${activeTab === "feasibility" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("feasibility")}>
            <FileText size={16} /> AI Feasibility Planner
          </button>
          <button className={`btn ${activeTab === "hrms" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("hrms")}>
            <Users size={16} /> HRMS & Attendance
          </button>
          <button className={`btn ${activeTab === "safety_ai" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("safety_ai")}>
            <ShieldAlert size={16} /> AI Safety Monitoring
          </button>
          <button className={`btn ${activeTab === "drone_progress" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("drone_progress")}>
            <Plane size={16} /> Drone Intelligence
          </button>
          <button className={`btn ${activeTab === "bim_4d" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("bim_4d")}>
            <Calendar size={16} /> BIM 4D Tracking
          </button>
          <button className={`btn ${activeTab === "bim_5d" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("bim_5d")}>
            <BarChart3 size={16} /> 5D BIM & Cost
          </button>
          <button className={`btn ${activeTab === "helmets" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("helmets")}>
            <HardHat size={16} /> Smart Helmets
          </button>
          <button className={`btn ${activeTab === "inventory" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("inventory")}>
            <Package size={16} /> Inventory & Theft
          </button>
          <button className={`btn ${activeTab === "finance" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("finance")}>
            <TrendingUp size={16} /> AI Finance
          </button>
          <button className={`btn ${activeTab === "erp" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("erp")}>
            <PackageIcon size={16} /> ERP & Operations
          </button>
          <button className={`btn ${activeTab === "ai_agents" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("ai_agents")}>
            <Brain size={16} /> AI Agents Command
          </button>
          <button className={`btn ${activeTab === "iot" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("iot")}>
            <Wifi size={16} /> IoT & Sensors
          </button>
          <button className={`btn ${activeTab === "drone_fleet" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("drone_fleet")}>
            <Navigation size={16} /> Drone Fleet Mgmt
          </button>
          <button className={`btn ${activeTab === "bim_facility" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("bim_facility")}>
            <Layers size={16} /> BIM & Facility
          </button>
          <div style={{ margin: "0.5rem 0", height: "1px", background: "var(--border)" }}></div>
          <button className={`btn ${activeTab === "settings" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("settings")}>
            <Settings size={16} /> Project Config
          </button>
        </nav>

        <div style={{ padding: "1rem", marginTop: "auto" }}>
          <button className="btn btn-danger" style={{ width: "100%" }} onClick={handleLogout}>
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </div>

      <main className="main-content">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--foreground)" }}>
              {activeTab === "dashboard" && "3D Digital Twin Cockpit"}
              {activeTab === "videos" && "CCTV & Drone Feeds"}
              {activeTab === "reports" && "Report Center"}
              {activeTab === "settings" && "Workspace Settings"}
              {activeTab === "feasibility" && "Feasibility & AI Planning"}
              {activeTab === "equipment" && "Equipment & Fleet Management"}
              {activeTab === "hrms" && "HRMS & Workforce"}
              {activeTab === "safety_ai" && "AI Safety Monitoring"}
              {activeTab === "drone_progress" && "Drone & Progress Intelligence"}
              {activeTab === "helmets" && "Smart Helmets & Worker Tracking"}
              {activeTab === "inventory" && "Inventory & Theft Prevention"}
              {activeTab === "finance" && "AI Cost & Schedule Intelligence"}
              {activeTab === "bim_facility" && "4D/5D BIM & Facility Management"}
              {activeTab === "erp" && "ERP & Operations"}
              {activeTab === "ai_agents" && "AI Agents Command Center"}
              {activeTab === "iot" && "IoT & Sensor Twins"}
              {activeTab === "drone_fleet" && "AI Drone & Robotics Fleet"}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.2rem" }}>
              {selectedProject?.name || "No project selected"}
            </p>
          </div>
        </header>

        <div style={{ flex: 1, minHeight: 0 }}>
          {activeTab === "dashboard" && <CockpitDashboard flightCoords={flightCoords} onRequestViewAll={() => setActiveTab("ai-vision")} />}
          {activeTab === "videos" && <CCTVDashboard />}
          {activeTab === "reports" && <ReportsDashboard />}
          {activeTab === "settings" && <SettingsView />}
          {activeTab === "feasibility" && <FeasibilityDashboard userId={user?.id || 1} />}
          {activeTab === "ai-vision" && <AIVisionDashboard onBack={() => setActiveTab("dashboard")} />}
          {activeTab === "equipment" && <EquipmentDashboard />}
          {activeTab === "hrms" && <HRMSDashboard projectId={selectedProject?.id} />}
          {activeTab === "safety_ai" && <AISafetyDashboard projectId={selectedProject?.id} />}
          {activeTab === "drone_progress" && <DroneProgressDashboard projectId={selectedProject?.id} />}
          {activeTab === "bim_4d" && <BIM4DDashboard />}
          {activeTab === "bim_5d" && <BIM5DDashboard />}
          {activeTab === "helmets" && <SmartHelmetDashboard projectId={selectedProject?.id} />}
          {activeTab === "inventory" && <InventoryDashboard projectId={selectedProject?.id} />}
          {activeTab === "finance" && <FinanceDashboard projectId={selectedProject?.id} />}
          {activeTab === "bim_facility" && <BIMFacilityDashboard projectId={selectedProject?.id} />}
          {activeTab === "erp" && <ERPDashboard />}
          {activeTab === "ai_agents" && <AIAgentsDashboard />}
          {activeTab === "iot" && <IoTDashboard />}
          {activeTab === "drone_fleet" && <DroneDashboard />}
        </div>
      </main>
    </div>
  );
}
