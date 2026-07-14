"use client";
import React, { useState, useEffect } from "react";
import { Package, Search, AlertCircle, ScanLine, Plus, TrendingDown, Truck, BarChart3, RefreshCw, Filter, QrCode } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const initialItems = [
  { id: 1, code: "STL-001", name: "TMT Steel Bars (12mm)", category: "Structure", qty: 2450, unit: "kg", reorder: 1000, warehouse: "Store A", status: "in_stock", supplier: "JK Steel", lastMovement: "2 hrs ago", rfid: "RF-A0042" },
  { id: 2, code: "CEM-001", name: "Portland Cement (50kg)", category: "Structure", qty: 45, unit: "bags", reorder: 100, warehouse: "Store B", status: "low_stock", supplier: "UltraTech", lastMovement: "5 hrs ago", rfid: "RF-B0011" },
  { id: 3, code: "SCP-001", name: "Scaffolding Pipes", category: "Equipment", qty: 0, unit: "pcs", reorder: 50, warehouse: "Store A", status: "out_of_stock", supplier: "SafeBuild", lastMovement: "1 day ago", rfid: "RF-A0075" },
  { id: 4, code: "SND-001", name: "River Sand", category: "Structure", qty: 320, unit: "cubic ft", reorder: 100, warehouse: "Open Yard", status: "in_stock", supplier: "SandMart", lastMovement: "3 hrs ago", rfid: "RF-Y0003" },
  { id: 5, code: "BRK-001", name: "Red Clay Bricks", category: "Architecture", qty: 12000, unit: "pcs", reorder: 5000, warehouse: "Store C", status: "in_stock", supplier: "BrickCo", lastMovement: "1 hr ago", rfid: "RF-C0021" },
  { id: 6, code: "PLY-001", name: "BWR Plywood (18mm)", category: "Finishing", qty: 80, unit: "sheets", reorder: 30, warehouse: "Store B", status: "in_stock", supplier: "GreenPly", lastMovement: "6 hrs ago", rfid: "RF-B0034" },
  { id: 7, code: "PNT-001", name: "Emulsion Paint (White)", category: "Finishing", qty: 28, unit: "liters", reorder: 50, warehouse: "Store B", status: "low_stock", supplier: "Asian Paints", lastMovement: "8 hrs ago", rfid: "RF-B0088" },
];

const theftAlerts = [
  { id: 1, item: "TMT Steel Bars (12mm)", anomaly: "After Hours Movement", probability: 93, missing: "120 kg", location: "Store A Gate", time: "11:42 PM", cam: "CAM-04" },
  { id: 2, item: "Copper Wiring (2.5mm)", anomaly: "Repeated Small Withdrawals", probability: 78, missing: "85 m", location: "Electrical Store", time: "03:15 AM", cam: "CAM-02" },
];

export default function InventoryDashboard({ projectId }: { projectId?: number }) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"list" | "alerts" | "analytics">("list");

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => prev.map(item => ({
        ...item,
        qty: Math.max(0, item.qty + (Math.random() > 0.8 ? (Math.random() > 0.5 ? -Math.floor(Math.random() * 5) : Math.floor(Math.random() * 3)) : 0)),
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || i.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const stockData = items.map(i => ({ name: i.code, qty: i.qty, reorder: i.reorder }));
  const statusBadge = (s: string) => ({ in_stock: { bg: "rgba(74,222,128,0.15)", color: "#4ade80", label: "In Stock" }, low_stock: { bg: "rgba(234,179,8,0.15)", color: "#eab308", label: "Low Stock" }, out_of_stock: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "Out of Stock" } }[s] || { bg: "transparent", color: "gray", label: s });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", height: "100%" }}>
      {/* Header KPIs */}
      <div style={{ display: "flex", gap: "1rem" }}>
        {[
          { label: "Total SKUs", value: items.length, color: "#06b6d4", icon: Package },
          { label: "Low Stock", value: items.filter(i => i.status === "low_stock").length, color: "#eab308", icon: TrendingDown },
          { label: "Out of Stock", value: items.filter(i => i.status === "out_of_stock").length, color: "#ef4444", icon: AlertCircle },
          { label: "Theft Alerts", value: theftAlerts.length, color: "#8b5cf6", icon: ScanLine },
          { label: "Deliveries Today", value: 3, color: "#4ade80", icon: Truck },
        ].map((kpi, i) => (
          <div key={i} className="glass-panel" style={{ flex: 1, padding: "1rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <div style={{ background: `${kpi.color}20`, padding: "0.6rem", borderRadius: "8px" }}><kpi.icon size={18} style={{ color: kpi.color }} /></div>
            <div><div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{kpi.value}</div><div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{kpi.label}</div></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[["list", "Stock Ledger"], ["alerts", "Theft Alerts"], ["analytics", "Stock Analytics"]].map(([v, label]) => (
          <button key={v} onClick={() => setViewMode(v as any)} style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", fontSize: "0.85rem", background: viewMode === v ? "#06b6d4" : "rgba(255,255,255,0.05)", color: viewMode === v ? "#000" : "var(--text-secondary)", border: "none", cursor: "pointer", fontWeight: 600 }}>{label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowAddModal(true)} style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", fontSize: "0.85rem", background: "rgba(74,222,128,0.2)", color: "#4ade80", border: "1px solid #4ade8040", cursor: "pointer", display: "flex", gap: "0.4rem", alignItems: "center" }}><Plus size={14} /> Add Item</button>
      </div>

      {viewMode === "list" && (
        <div className="glass-panel" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "1rem", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.05)", padding: "0.4rem 0.8rem", borderRadius: "8px", flex: 1 }}>
              <Search size={14} style={{ color: "var(--text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or code..." style={{ background: "transparent", border: "none", outline: "none", color: "white", fontSize: "0.85rem", flex: 1 }} />
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", padding: "0.4rem 0.8rem", fontSize: "0.85rem", cursor: "pointer" }}>
              {["All", "Structure", "Architecture", "Finishing", "Equipment"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button style={{ padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem" }}><RefreshCw size={13} /></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead style={{ background: "rgba(255,255,255,0.02)", position: "sticky", top: 0 }}>
                <tr>
                  {["Code", "Material", "Category", "Quantity", "Warehouse", "Supplier", "Status", "RFID", "Last Movement"].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const badge = statusBadge(item.status);
                  return (
                    <tr key={item.id} onClick={() => setSelectedItem(item)} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", background: selectedItem?.id === item.id ? "rgba(6,182,212,0.08)" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                      <td style={{ padding: "0.85rem 1rem", fontFamily: "monospace", color: "var(--cyan)", fontSize: "0.8rem" }}>{item.code}</td>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: "0.85rem 1rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>{item.category}</td>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: item.qty === 0 ? "#ef4444" : item.qty < item.reorder ? "#eab308" : "white" }}>{item.qty.toLocaleString()} <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: "0.75rem" }}>{item.unit}</span></td>
                      <td style={{ padding: "0.85rem 1rem", color: "var(--text-secondary)" }}>{item.warehouse}</td>
                      <td style={{ padding: "0.85rem 1rem", color: "var(--text-secondary)" }}>{item.supplier}</td>
                      <td style={{ padding: "0.85rem 1rem" }}><span style={{ padding: "3px 10px", borderRadius: "10px", fontSize: "0.7rem", fontWeight: 700, background: badge.bg, color: badge.color }}>{badge.label}</span></td>
                      <td style={{ padding: "0.85rem 1rem", fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.rfid}</td>
                      <td style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>{item.lastMovement}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === "alerts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
          {theftAlerts.map(a => (
            <div key={a.id} className="glass-panel" style={{ padding: "1.5rem", borderLeft: "4px solid #ef4444" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.25rem 0", color: "#ef4444" }}>⚠ {a.anomaly}</h3>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{a.item} • Detected: {a.time}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: "#ef4444" }}>{a.probability}%</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>AI Confidence</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "2rem", fontSize: "0.85rem" }}>
                <div><span style={{ color: "var(--text-muted)" }}>Missing Qty: </span><span style={{ color: "#ef4444", fontWeight: 700 }}>{a.missing}</span></div>
                <div><span style={{ color: "var(--text-muted)" }}>Location: </span><span>{a.location}</span></div>
                <div><span style={{ color: "var(--text-muted)" }}>Camera: </span><span style={{ color: "var(--cyan)" }}>{a.cam}</span></div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button style={{ padding: "0.5rem 1rem", background: "rgba(239,68,68,0.2)", border: "1px solid #ef4444", borderRadius: "8px", color: "#ef4444", cursor: "pointer", fontSize: "0.85rem" }}>Escalate to Security</button>
                <button style={{ padding: "0.5rem 1rem", background: "rgba(6,182,212,0.2)", border: "1px solid var(--cyan)", borderRadius: "8px", color: "var(--cyan)", cursor: "pointer", fontSize: "0.85rem" }}>View CCTV Footage</button>
                <button style={{ padding: "0.5rem 1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.85rem" }}>Mark as False Alarm</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === "analytics" && (
        <div className="glass-panel" style={{ flex: 1, padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.5rem 0" }}>Stock Level vs Reorder Point</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: "rgba(9,9,11,0.9)", border: "1px solid var(--border-color)", borderRadius: "8px" }} />
              <Bar dataKey="qty" name="Current Stock" radius={[4, 4, 0, 0]}>
                {stockData.map((d, i) => <Cell key={i} fill={d.qty === 0 ? "#ef4444" : d.qty < d.reorder ? "#eab308" : "#06b6d4"} />)}
              </Bar>
              <Bar dataKey="reorder" name="Reorder Level" fill="rgba(239,68,68,0.3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
