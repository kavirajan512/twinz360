"use client";
import React, { useState } from "react";
import { DollarSign, PieChart, TrendingDown, Layers, Box, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function BIM5DDashboard() {
  const [selectedLayer, setSelectedLayer] = useState<string>("All");

  const qtoData = [
    { id: 1, material: "Concrete (M30)", category: "Structure", qty: "12,500", unit: "Cubic Meter", rate: "$120", cost: "$1,500,000", status: "Procured" },
    { id: 2, material: "Rebar Steel (TMT)", category: "Structure", qty: "850", unit: "Tons", rate: "$800", cost: "$680,000", status: "Partial" },
    { id: 3, material: "AAC Blocks", category: "Architecture", qty: "150,000", unit: "Pieces", rate: "$1.50", cost: "$225,000", status: "Pending" },
    { id: 4, material: "Portland Cement", category: "Structure", qty: "45,000", unit: "Bags", rate: "$6", cost: "$270,000", status: "Procured" },
    { id: 5, material: "River Sand", category: "Structure", qty: "8,000", unit: "Cubic Meter", rate: "$35", cost: "$280,000", status: "Procured" },
    { id: 6, material: "Aggregate 20mm", category: "Structure", qty: "10,000", unit: "Cubic Meter", rate: "$25", cost: "$250,000", status: "Pending" },
    { id: 7, material: "Emulsion Paint", category: "Finishing", qty: "12,000", unit: "Liters", rate: "$8", cost: "$96,000", status: "Pending" },
    { id: 8, material: "Vitrified Tiles", category: "Finishing", qty: "25,000", unit: "Sq. Ft", rate: "$4", cost: "$100,000", status: "Pending" },
  ];

  const costBreakdown = [
    { name: "Material", value: 3401000, color: "#06b6d4" },
    { name: "Labour", value: 1200000, color: "#8b5cf6" },
    { name: "Equipment", value: 450000, color: "#f97316" },
    { name: "Overheads", value: 300000, color: "#ef4444" },
  ];

  const MetricCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
    <div className="glass-panel" style={{ padding: "1.5rem", flex: 1, display: "flex", gap: "1rem", alignItems: "center" }}>
      <div className={`p-3 rounded-xl bg-opacity-20 ${colorClass.replace("text-", "bg-")}`}>
        <Icon className={colorClass} size={28} />
      </div>
      <div>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>{title}</p>
        <h2 style={{ margin: "0.25rem 0", fontSize: "1.8rem", fontWeight: 700 }}>{value}</h2>
        <p style={{ margin: 0, fontSize: "0.75rem", color: colorClass === "text-red-500" ? "var(--red)" : "var(--text-secondary)" }}>{subtext}</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "1.5rem" }}>
      {/* Header & KPIs */}
      <div>
        <h1 style={{ margin: "0 0 1rem 0", fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
          5D BIM & AI Cost Engine
        </h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <MetricCard title="Total Budget" value="$6,500,000" subtext="Approved Baseline" icon={DollarSign} colorClass="text-cyan" />
          <MetricCard title="Estimated Cost" value="$5,351,000" subtext="Current 5D Takeoff" icon={PieChart} colorClass="text-purple-500" />
          <MetricCard title="Actual Spent" value="$2,100,000" subtext="Invoiced to Date" icon={TrendingDown} colorClass="text-orange-500" />
          <MetricCard title="Remaining Budget" value="$1,149,000" subtext="Positive Cash Flow" icon={CheckCircle} colorClass="text-green-500" />
        </div>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flex: 1, minHeight: 0 }}>
        
        {/* Left: Auto Quantity Takeoff Table */}
        <div className="glass-panel" style={{ flex: 2, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><Layers size={18} className="text-cyan" /> Automatic Quantity Takeoff (QTO)</h3>
            <select 
              className="form-input" 
              style={{ width: "auto", padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
            >
              <option value="All">All Layers</option>
              <option value="Structure">Structure</option>
              <option value="Architecture">Architecture</option>
              <option value="Finishing">Finishing</option>
            </select>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead style={{ background: "rgba(255,255,255,0.02)", position: "sticky", top: 0 }}>
                <tr>
                  <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-muted)", fontWeight: 600 }}>Material</th>
                  <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-muted)", fontWeight: 600 }}>Layer</th>
                  <th style={{ padding: "1rem", textAlign: "right", color: "var(--text-muted)", fontWeight: 600 }}>Quantity</th>
                  <th style={{ padding: "1rem", textAlign: "right", color: "var(--text-muted)", fontWeight: 600 }}>Rate</th>
                  <th style={{ padding: "1rem", textAlign: "right", color: "var(--text-muted)", fontWeight: 600 }}>Total Cost</th>
                  <th style={{ padding: "1rem", textAlign: "center", color: "var(--text-muted)", fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {qtoData.filter(d => selectedLayer === "All" || d.category === selectedLayer).map((row, i) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                    <td style={{ padding: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>{row.material}</td>
                    <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{row.category}</td>
                    <td style={{ padding: "1rem", textAlign: "right", color: "var(--cyan)", fontFamily: "monospace" }}>{row.qty} <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{row.unit}</span></td>
                    <td style={{ padding: "1rem", textAlign: "right", color: "var(--text-secondary)", fontFamily: "monospace" }}>{row.rate}</td>
                    <td style={{ padding: "1rem", textAlign: "right", fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>{row.cost}</td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                       <span style={{ 
                         padding: "2px 8px", 
                         borderRadius: "12px", 
                         fontSize: "0.7rem", 
                         background: row.status === "Procured" ? "rgba(74, 222, 128, 0.2)" : row.status === "Partial" ? "rgba(234, 179, 8, 0.2)" : "rgba(239, 68, 68, 0.2)",
                         color: row.status === "Procured" ? "#4ade80" : row.status === "Partial" ? "#eab308" : "#ef4444"
                       }}>
                         {row.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Cost Breakdown & Charts */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
           <div className="glass-panel" style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column" }}>
              <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><Box size={16} className="text-purple-500" /> Live Cost Breakdown</h3>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 10 }} tickFormatter={(val) => `$${val/1000}k`} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} width={80} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "rgba(9, 9, 11, 0.9)", border: "1px solid var(--border-color)", borderRadius: "8px" }}
                      formatter={(value: any) => [`$${value.toLocaleString()}`, "Cost"]}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
           
           <div className="glass-panel" style={{ padding: "1.5rem", background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%)", border: "1px solid var(--cyan)" }}>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--cyan)", fontSize: "0.9rem" }}>AI Procurement Insights</h4>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                 <li><strong>Steel Stock Low:</strong> Expected to run out in 4 days. <span style={{ color: "var(--cyan)", textDecoration: "underline", cursor: "pointer" }}>Auto-order TMT 500</span></li>
                 <li><strong>Cement Optimized:</strong> Bulk order discount available if ordered before Friday.</li>
                 <li><strong>Price Alert:</strong> Aggregate 20mm cost increased by 4% in local market.</li>
              </ul>
           </div>
        </div>

      </div>
    </div>
  );
}
