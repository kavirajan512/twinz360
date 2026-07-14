"use client";

import React, { useState } from 'react';
import { 
  FileText, Download, Share2, Printer, CheckCircle, 
  Search, BrainCircuit, Activity, Settings, Filter,
  PieChart, BarChart3, TrendingUp, Layers, PenTool, Calendar
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Pie, Cell
} from 'recharts';

const categories = [
  "1. Customer & Project Reports",
  "2. Land & Legal Reports",
  "3. AI Feasibility Reports",
  "4. Design & BIM Reports",
  "5. Cost & BOQ Reports",
  "6. Construction Progress",
  "7. Worker & Safety Reports",
  "8. Equipment Reports",
  "9. Material Reports",
  "10. AI Analytics Reports",
  "11. IoT & Environment",
  "12. Facility Management",
  "13. Financial Reports",
  "14. Executive Reports"
];

const mockData = [
  { name: 'Jan', budget: 4000, actual: 2400 },
  { name: 'Feb', budget: 3000, actual: 1398 },
  { name: 'Mar', budget: 2000, actual: 9800 },
  { name: 'Apr', budget: 2780, actual: 3908 },
  { name: 'May', budget: 1890, actual: 4800 },
  { name: 'Jun', budget: 2390, actual: 3800 },
];

const pieData = [
  { name: 'Materials', value: 400 },
  { name: 'Labor', value: 300 },
  { name: 'Equipment', value: 300 },
  { name: 'Overhead', value: 200 },
];

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function ReportsDashboard() {
  const [activeCategory, setActiveCategory] = useState(categories[13]); // Default to Executive Reports
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatedReport, setGeneratedReport] = useState("");

  const handleGenerateAI = () => {
    if (!aiPrompt) return;
    setGenerating(true);
    setTimeout(() => {
      setGeneratedReport(`AI Executive Summary:
Based on the analysis of "${aiPrompt}", the project is currently 12% ahead of schedule with a slight cost overrun of 2.4% in the materials sector (specifically steel rebar). 

Risk Assessment: Low.
Delay Analysis: No significant delays expected in the next 30 days.
Recommendations: Pre-order batch 4 concrete to lock in current market rates before expected Q3 inflation.`);
      setGenerating(false);
    }, 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', color: 'var(--text-primary)' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText className="text-cyan" /> 
            Reports & Document Management
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Enterprise reporting for the entire building lifecycle
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary"><Filter size={16} /> Filters</button>
          <button className="btn btn-primary" style={{ background: '#2563eb' }}><Share2 size={16} /> Share Dashboard</button>
          <button className="btn btn-primary"><Download size={16} /> Export All (PDF)</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: 0 }}>
        
        {/* Left Sidebar - Categories */}
        <div style={{ width: '280px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search reports..." 
                className="form-input"
                style={{ paddingLeft: '2rem', width: '100%', fontSize: '0.85rem' }}
              />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  width: '100%', textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.85rem',
                  background: activeCategory === cat ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                  color: activeCategory === cat ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  borderLeft: activeCategory === cat ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                  fontWeight: activeCategory === cat ? 600 : 400,
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          
          {/* Active Category Header */}
          <div style={{ background: 'var(--bg-surface)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{activeCategory}</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="sidebar-btn"><Printer size={16} /> Print</button>
                <button className="sidebar-btn"><Download size={16} /> Excel</button>
                <button className="sidebar-btn" style={{ border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)' }}>
                  <PenTool size={16} /> Digital Sign
                </button>
              </div>
            </div>
          </div>

          {/* AI Report Generator Panel */}
          <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#c4b5fd' }}>
              <BrainCircuit size={20} />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>AeroTwin AI Report Generator</h4>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Generate a risk assessment for the foundations delay..."
                className="form-input"
                style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(139, 92, 246, 0.4)' }}
              />
              <button 
                onClick={handleGenerateAI}
                disabled={generating || !aiPrompt}
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
              >
                {generating ? "Analyzing Data..." : "Generate AI Narrative"}
              </button>
            </div>
            
            {generatedReport && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: '4px solid #8b5cf6', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {generatedReport}
              </div>
            )}
          </div>

          {/* Dynamic Dashboard Metrics / Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            {/* Chart 1 */}
            <div style={{ background: 'var(--bg-surface)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Budget vs Actual Performance</h4>
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                    <Legend />
                    <Line type="monotone" dataKey="budget" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2 */}
            <div style={{ background: 'var(--bg-surface)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Cost Distribution (Category: {activeCategory.split('.')[0]})</h4>
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
          </div>

          {/* Detailed Data Table */}
          <div style={{ background: 'var(--bg-surface)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Available Reports Archive</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Report Name</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Generated By</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Executive Dashboard Report_Q2', author: 'AI Copilot', date: '2024-05-18', status: 'Approved' },
                    { name: 'Cost Variance Analysis_May', author: 'John Doe', date: '2024-05-15', status: 'Pending Review' },
                    { name: 'Project Timeline Report', author: 'System', date: '2024-05-10', status: 'Approved' },
                    { name: 'Risk Assessment Summary', author: 'AI Copilot', date: '2024-05-01', status: 'Archived' },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{row.name}</td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{row.author}</td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{row.date}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem',
                          background: row.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 
                                      row.status === 'Pending Review' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(100, 116, 139, 0.2)',
                          color: row.status === 'Approved' ? '#10b981' : 
                                 row.status === 'Pending Review' ? '#f59e0b' : '#94a3b8'
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <button className="sidebar-btn" style={{ padding: '0.3rem 0.6rem', display: 'inline-flex', fontSize: '0.75rem' }}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
