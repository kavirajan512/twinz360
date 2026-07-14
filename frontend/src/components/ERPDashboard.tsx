"use client";
import React, { useState } from "react";
import { Package, TrendingUp, DollarSign, Archive, FileText, Truck, Users, Factory, ChevronRight, AlertTriangle, CheckCircle2, Clock, ShoppingCart, BarChart3, Zap, HardHat, Plus, ClipboardList } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

const VENDORS = [
  { name: "JK Steel Ltd", category: "Steel", rating: 4.8, orders: 12, onTime: 98, amount: "$180K" },
  { name: "UltraTech Cement", category: "Cement", rating: 4.6, orders: 34, onTime: 95, amount: "$62K" },
  { name: "Asian Paints", category: "Finishing", rating: 4.7, orders: 5, onTime: 100, amount: "$8K" },
  { name: "SandMart", category: "Aggregate", rating: 4.2, orders: 8, onTime: 87, amount: "$21K" },
  { name: "EcoConcrete Corp", category: "Concrete", rating: 4.9, orders: 18, onTime: 97, amount: "$110K" }
];

const cashflowData = [
  { month: "Mar", inflow: 450000, outflow: 320000 },
  { month: "Apr", inflow: 520000, outflow: 410000 },
  { month: "May", inflow: 380000, outflow: 490000 },
  { month: "Jun", inflow: 610000, outflow: 380000 },
  { month: "Jul", inflow: 480000, outflow: 350000 },
];

const costMix = [
  { name: "Material", value: 3401000, color: "#06b6d4" },
  { name: "Labour", value: 1200000, color: "#8b5cf6" },
  { name: "Equipment", value: 450000, color: "#f97316" },
  { name: "Overheads", value: 300000, color: "#ef4444" },
];

const initialPOS = [
  { id: "PO-2841", vendor: "JK Steel Ltd", item: "TMT Rebar 12mm", qty: "45 Tons", amount: 35100, status: "Approved", delivery: "Jul 16", payment: "Net-30" },
  { id: "PO-2840", vendor: "UltraTech Cement", item: "OPC 53 Grade Cement", qty: "500 Bags", amount: 3000, status: "In Transit", delivery: "Jul 14", payment: "Advance" },
  { id: "PO-2839", vendor: "SandMart Supplies", item: "River Sand M-Grade", qty: "200 Cubic Ft", amount: 7000, status: "Delivered", delivery: "Jul 12", payment: "Net-15" },
  { id: "PO-2838", vendor: "SafeBuild Corp", item: "Scaffolding Pipes (48mm)", qty: "120 Pcs", amount: 4800, status: "Pending Approval", delivery: "Jul 18", payment: "Net-30" },
];

const initialInventory = [
  { name: "TMT Steel Rebar", category: "Structural", qty: "12.4 Tons", status: "Optimal", level: 85, color: "#06b6d4" },
  { name: "OPC 53 Cement", category: "Cement", qty: "45 Bags", status: "Critical Alert", level: 12, color: "#ef4444" },
  { name: "River Sand", category: "Aggregate", qty: "150 Cubic Ft", status: "Reorder Warn", level: 38, color: "#f97316" },
  { name: "ReadyMix Concrete", category: "Structural", qty: "80 Cu.m", status: "Optimal", level: 90, color: "#4ade80" },
  { name: "Glass Facade Panels", category: "Finishing", qty: "22 Pcs", status: "Reorder Warn", level: 42, color: "#8b5cf6" },
];

const dailyLaborLogs = [
  { role: "Masons", count: 18, rate: 85, compliance: 100, supervisor: "Ramesh Kumar" },
  { role: "Carpenters", count: 8, rate: 90, compliance: 98, supervisor: "Anil Sharma" },
  { role: "Electricians", count: 5, rate: 92, compliance: 100, supervisor: "Vikram Singh" },
  { role: "General Helpers", count: 24, rate: 76, compliance: 95, supervisor: "Sanjay Dutta" }
];

const equipmentFleet = [
  { name: "Tower Crane TC-40", type: "Heavy Lifting", health: "Optimal", runtime: "450 Hrs", lease: "$4,500/Mo" },
  { name: "Caterpillar Excavator 320", type: "Earth Moving", health: "Maintenance Required", runtime: "1,200 Hrs", lease: "$3,800/Mo" },
  { name: "Concrete Pump P-180", type: "Concreting", health: "Optimal", runtime: "180 Hrs", lease: "$2,200/Mo" }
];

const statusStyle = (s: string) => ({
  "Approved": { bg: "rgba(74,222,128,0.15)", color: "#4ade80" },
  "In Transit": { bg: "rgba(6,182,212,0.15)", color: "#06b6d4" },
  "Delivered": { bg: "rgba(139,92,246,0.15)", color: "#8b5cf6" },
  "Pending Approval": { bg: "rgba(234,179,8,0.15)", color: "#eab308" },
}[s] || { bg: "transparent", color: "gray" });

export default function ERPDashboard() {
  const [activeSection, setActiveSection] = useState<"overview" | "po" | "inventory" | "workforce" | "equipment" | "vendors">("overview");
  const [purchaseOrders, setPurchaseOrders] = useState(initialPOS);
  const [inventoryList, setInventoryList] = useState(initialInventory);
  
  // Interactive PO creation Modal state
  const [showPOModal, setShowPOModal] = useState(false);
  const [newPO, setNewPO] = useState({ vendor: "", item: "", qty: "", amount: "", payment: "Net-30" });

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPO.vendor || !newPO.item) return;

    const added = {
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      vendor: newPO.vendor,
      item: newPO.item,
      qty: newPO.qty || "1 Unit",
      amount: Number(newPO.amount) || 1200,
      status: "Pending Approval",
      delivery: "Jul 22",
      payment: newPO.payment
    };

    setPurchaseOrders([added, ...purchaseOrders]);
    setShowPOModal(false);
    setNewPO({ vendor: "", item: "", qty: "", amount: "", payment: "Net-30" });
  };

  const handleApprovePO = (id: string) => {
    setPurchaseOrders(purchaseOrders.map(po => po.id === id ? { ...po, status: "Approved" } : po));
  };

  const handleReorderItem = (name: string) => {
    setInventoryList(inventoryList.map(item => item.name === name ? { ...item, status: "Optimal", level: 100 } : item));
    alert(`Reorder purchase request initiated for ${name}!`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", height: "100%", color: "var(--text-primary)" }}>
      
      {/* Dynamic Enterprise KPIs */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {[
          { label: "Capital Deployed", value: `$${(purchaseOrders.reduce((acc, curr) => acc + curr.amount, 2100000) / 1000).toFixed(0)}K`, color: "#06b6d4", icon: DollarSign },
          { label: "Pending POs", value: purchaseOrders.filter(po => po.status === "Pending Approval").length, color: "#eab308", icon: ShoppingCart },
          { label: "Active Vendors", value: VENDORS.length + 12, color: "#8b5cf6", icon: Factory },
          { label: "Material Shortages", value: inventoryList.filter(i => i.status.includes("Critical") || i.status.includes("Warn")).length, color: "#ef4444", icon: AlertTriangle },
          { label: "Attendance Compliance", value: "97.5%", color: "#4ade80", icon: HardHat },
          { label: "Equipment Status", value: "Optimal (88%)", color: "#06b6d4", icon: Zap },
        ].map((kpi, i) => (
          <div key={i} className="glass-panel" style={{ flex: 1, minWidth: "160px", padding: "1rem", display: "flex", gap: "0.6rem", alignItems: "center", borderRadius: "10px" }}>
            <div style={{ background: `${kpi.color}20`, padding: "0.6rem", borderRadius: "8px" }}><kpi.icon size={16} style={{ color: kpi.color }} /></div>
            <div>
              <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>{kpi.value}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Navigation Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px", overflowX: "auto" }}>
        {[
          ["overview", "Overview & Cashflow"],
          ["po", "Purchase Orders (POs)"],
          ["inventory", "Inventory & Materials"],
          ["workforce", "HRMS & Attendance"],
          ["equipment", "Equipment Telemetry"],
          ["vendors", "Vendor Relations"]
        ].map(([v, l]) => (
          <button 
            key={v} 
            onClick={() => setActiveSection(v as any)} 
            style={{ 
              padding: "0.5rem 1.25rem", borderRadius: "8px", fontSize: "0.82rem", 
              background: activeSection === v ? "#06b6d4" : "rgba(255,255,255,0.03)", 
              color: activeSection === v ? "#000" : "var(--text-secondary)", 
              border: "none", cursor: "pointer", fontWeight: 600, transition: "all 0.2s" 
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* SECTION: OVERVIEW */}
      {activeSection === "overview" && (
        <div style={{ display: "flex", gap: "1.5rem", flex: 1, minHeight: 0 }}>
          <div className="glass-panel" style={{ flex: 1.5, padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem" }}>Capital Cash Flow Analysis</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={cashflowData}>
                <defs>
                  <linearGradient id="inflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} /><stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(9,9,11,0.9)", border: "1px solid var(--border-color)", borderRadius: "8px" }} formatter={(v: any) => [`$${v.toLocaleString()}`]} />
                <Area type="monotone" dataKey="inflow" stroke="#4ade80" fill="url(#inflow)" strokeWidth={2} name="Inflow" />
                <Area type="monotone" dataKey="outflow" stroke="#ef4444" fill="url(#outflow)" strokeWidth={2} name="Outflow" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-panel" style={{ flex: 1, padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem" }}>Cost Segment Breakdown</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={costMix} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                  {costMix.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`]} contentStyle={{ backgroundColor: "rgba(9,9,11,0.9)", border: "1px solid var(--border-color)", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "10px" }}>
              {costMix.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "2px", background: item.color }}></div>
                    {item.name}
                  </span>
                  <span style={{ color: item.color, fontWeight: 600 }}>${(item.value / 1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: PURCHASE ORDERS */}
      {activeSection === "po" && (
        <div className="glass-panel" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "0.95rem" }}>Interactive Procurement Logs</h3>
            <button 
              onClick={() => setShowPOModal(true)} 
              className="btn btn-primary" 
              style={{ padding: "0.4rem 1rem", fontSize: "0.78rem", display: "flex", gap: "4px", alignItems: "center" }}
            >
              <Plus size={14} /> Create Purchase Order
            </button>
          </div>
          
          <div style={{ flex: 1, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead style={{ background: "rgba(255,255,255,0.02)", position: "sticky", top: 0 }}>
                <tr>
                  {["PO No.", "Vendor", "Material / Item", "Qty", "Amount", "Status", "Delivery", "Actions"].map(h => (
                    <th key={h} style={{ padding: "0.85rem 1rem", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po, i) => {
                  const ss = statusStyle(po.status);
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "0.85rem 1rem", fontFamily: "monospace", color: "var(--accent-cyan)", fontWeight: "bold" }}>{po.id}</td>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>{po.vendor}</td>
                      <td style={{ padding: "0.85rem 1rem", color: "var(--text-secondary)" }}>{po.item}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>{po.qty}</td>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>${po.amount.toLocaleString()}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "0.68rem", fontWeight: 700, background: ss.bg, color: ss.color }}>
                          {po.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.85rem 1rem", color: "var(--text-secondary)" }}>{po.delivery}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        {po.status === "Pending Approval" ? (
                          <button 
                            onClick={() => handleApprovePO(po.id)} 
                            style={{ background: "#4ade80", border: "none", color: "#000", padding: "2px 8px", borderRadius: "3px", fontWeight: "bold", fontSize: "0.7rem", cursor: "pointer" }}
                          >
                            Approve
                          </button>
                        ) : (
                          <span style={{ color: "var(--text-secondary)", fontSize: "0.7rem" }}>Verified</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: REALTIME INVENTORY */}
      {activeSection === "inventory" && (
        <div className="glass-panel" style={{ flex: 1, padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.2rem 0", fontSize: "1.0rem" }}>5D Construction Material Inventory</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {inventoryList.map((item, i) => {
              const isAlert = item.status.includes("Critical");
              const isWarn = item.status.includes("Warn");
              const badgeColor = isAlert ? "rgba(239, 68, 68, 0.15)" : isWarn ? "rgba(249, 115, 22, 0.15)" : "rgba(74, 222, 128, 0.15)";
              const textColor = isAlert ? "#ef4444" : isWarn ? "#f97316" : "#4ade80";

              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 2fr 1fr 1fr", alignItems: "center", gap: "1rem", padding: "0.6rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "#fff" }}>{item.name}</strong>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Category: {item.category}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>{item.qty}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem" }}>
                      <span>Stock Capacity</span>
                      <span>{item.level}%</span>
                    </div>
                    <div style={{ width: "100%", height: 5, background: "#333", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${item.level}%`, height: "100%", background: item.color }} />
                    </div>
                  </div>
                  <div>
                    <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "bold", backgroundColor: badgeColor, color: textColor }}>
                      {item.status}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {(isAlert || isWarn) ? (
                      <button 
                        onClick={() => handleReorderItem(item.name)} 
                        style={{ padding: "4px 8px", background: "var(--accent-cyan)", border: "none", color: "#000", fontSize: "0.72rem", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        Auto-Reorder
                      </button>
                    ) : (
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>Sufficient</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION: WORKFORCE ATTENDANCE */}
      {activeSection === "workforce" && (
        <div className="glass-panel" style={{ flex: 1, padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.2rem 0", fontSize: "1.0rem" }}>Workforce Management & Attendance HRMS</h3>
          
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1, minWidth: "150px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem", textAlign: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Total Active Headcount</span>
              <h4 style={{ margin: "0.2rem 0 0 0", color: "var(--accent-cyan)", fontSize: "1.4rem" }}>55 Personnel</h4>
            </div>
            <div style={{ flex: 1, minWidth: "150px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem", textAlign: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Avg Daily Payroll</span>
              <h4 style={{ margin: "0.2rem 0 0 0", color: "#4ade80", fontSize: "1.4rem" }}>$4,820 / Day</h4>
            </div>
            <div style={{ flex: 1, minWidth: "150px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem", textAlign: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Safety Helmet Ratios</span>
              <h4 style={{ margin: "0.2rem 0 0 0", color: "var(--accent-cyan)", fontSize: "1.4rem" }}>100% Compliant</h4>
            </div>
          </div>

          <table className="spec-table">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                <th style={{ padding: "0.6rem", textAlign: "left" }}>Workforce Trade</th>
                <th style={{ padding: "0.6rem", textAlign: "left" }}>Present Count</th>
                <th style={{ padding: "0.6rem", textAlign: "left" }}>Compliance Ratio</th>
                <th style={{ padding: "0.6rem", textAlign: "left" }}>Assigned Supervisor</th>
              </tr>
            </thead>
            <tbody>
              {dailyLaborLogs.map((log, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "0.6rem", fontWeight: "bold" }}>{log.role}</td>
                  <td style={{ padding: "0.6rem" }}>{log.count} Workers</td>
                  <td style={{ padding: "0.6rem", color: log.compliance >= 98 ? "#4ade80" : "#f97316" }}>{log.compliance}%</td>
                  <td style={{ padding: "0.6rem", color: "var(--text-secondary)" }}>{log.supervisor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION: EQUIPMENT TELEMETRY */}
      {activeSection === "equipment" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", flex: 1 }}>
          {equipmentFleet.map((eq, i) => {
            const isAlert = eq.health.includes("Required");
            
            return (
              <div key={i} className="glass-panel" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div>
                    <h4 style={{ margin: 0, color: "#fff", fontSize: "0.92rem" }}>{eq.name}</h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Type: {eq.type}</span>
                  </div>
                  <span style={{
                    padding: "2px 8px", borderRadius: "4px", fontSize: "0.68rem", fontWeight: "bold",
                    backgroundColor: isAlert ? "rgba(239, 68, 68, 0.15)" : "rgba(74, 222, 128, 0.15)",
                    color: isAlert ? "#ef4444" : "#4ade80"
                  }}>
                    {eq.health}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.8rem", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.7rem" }}>Total Runtime Logs</div>
                    <strong style={{ color: "#fff" }}>{eq.runtime}</strong>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.7rem" }}>Monthly Lease Rate</div>
                    <strong style={{ color: "#fff" }}>{eq.lease}</strong>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => alert("Requesting Telemetry Calibration Logs...")} style={{ flex: 1, padding: "5px", border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)", color: "var(--text-primary)", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }}>Telemetry Logs</button>
                  <button onClick={() => alert("Maintenance work-order generated in ERP system.")} style={{ flex: 1, padding: "5px", border: "none", background: "var(--accent-cyan)", color: "#000", fontWeight: "bold", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }}>Request Service</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION: VENDORS */}
      {activeSection === "vendors" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", flex: 1 }}>
          {VENDORS.map((v, i) => (
            <div key={i} className="glass-panel" style={{ padding: "1.2rem", borderRadius: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "0.92rem" }}>{v.name}</h3>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{v.category}</div>
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#eab308" }}>{"★".repeat(Math.floor(v.rating))}<span style={{ fontSize: "0.8rem" }}> {v.rating}</span></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", fontSize: "0.8rem", textAlign: "center" }}>
                <div><div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#06b6d4" }}>{v.orders}</div><div style={{ color: "var(--text-secondary)", fontSize: "0.68rem" }}>Orders</div></div>
                <div><div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#4ade80" }}>{v.onTime}%</div><div style={{ color: "var(--text-secondary)", fontSize: "0.68rem" }}>On-Time</div></div>
                <div><div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#8b5cf6" }}>{v.amount}</div><div style={{ color: "var(--text-secondary)", fontSize: "0.68rem" }}>Spend</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: CREATE PURCHASE ORDER */}
      {showPOModal && (
        <div 
          onClick={() => setShowPOModal(false)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(2, 2, 5, 0.8)", zIndex: 1000, display: "flex",
            justifyContent: "center", alignItems: "center", backdropFilter: "blur(5px)"
          }}
        >
          <form 
            onSubmit={handleCreatePO}
            onClick={(e) => e.stopPropagation()}
            style={{ width: "90%", maxWidth: "420px", background: "#0c0c14", border: "1px solid var(--border-focus)", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "1.5rem", gap: "1rem" }}
          >
            <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1rem" }}>Create New Purchase Order</h3>
              <button type="button" onClick={() => setShowPOModal(false)} style={{ background: "none", border: "none", color: "#888", fontSize: "1.1rem", cursor: "pointer" }}>×</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div>
                <label className="form-label" style={{ fontSize: "0.75rem" }}>Select Vendor</label>
                <select 
                  value={newPO.vendor} 
                  onChange={(e) => setNewPO({ ...newPO, vendor: e.target.value })} 
                  className="form-input" required
                >
                  <option value="">-- Choose Vendor --</option>
                  {VENDORS.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "0.75rem" }}>Material Item / Description</label>
                <input 
                  type="text" placeholder="e.g. OPC 53 cement bags" 
                  value={newPO.item} 
                  onChange={(e) => setNewPO({ ...newPO, item: e.target.value })}
                  className="form-input" required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Quantity</label>
                  <input 
                    type="text" placeholder="e.g. 500 Bags" 
                    value={newPO.qty} 
                    onChange={(e) => setNewPO({ ...newPO, qty: e.target.value })}
                    className="form-input" 
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Est. Amount ($)</label>
                  <input 
                    type="number" placeholder="3000" 
                    value={newPO.amount} 
                    onChange={(e) => setNewPO({ ...newPO, amount: e.target.value })}
                    className="form-input" required
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "0.75rem" }}>Payment Terms</label>
                <select 
                  value={newPO.payment} 
                  onChange={(e) => setNewPO({ ...newPO, payment: e.target.value })} 
                  className="form-input"
                >
                  <option>Net-30</option>
                  <option>Advance</option>
                  <option>Net-15</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ background: "linear-gradient(45deg, #0ea5e9, #3b82f6)", width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
            >
              Submit PO for Approval
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
