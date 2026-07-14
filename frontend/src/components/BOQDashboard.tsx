"use client";

import React, { useState, useEffect } from 'react';
import { Calculator, FileText, Download, Building, DollarSign, Activity, HardHat, Settings, Database } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function BOQDashboard({ projectContext = { id: 1, type: 'Commercial', w: 100, l: 80, floors: 5 }}) {
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateBOQ();
  }, []);

  const generateBOQ = () => {
    setLoading(true);
    fetch('http://127.0.0.1:3001/boq/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectContext.id,
        building_type: projectContext.type,
        width: projectContext.w,
        length: projectContext.l,
        num_floors: projectContext.floors
      })
    })
    .then(r => r.json())
    .then(data => {
      setEstimate(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  if (!estimate) return <div className="p-10 text-white text-center">Initializing BOQ Engine...</div>;

  const costData = [
    { name: 'Materials', value: estimate.total_material_cost, color: '#3b82f6' },
    { name: 'Labor', value: estimate.total_labor_cost, color: '#f59e0b' },
    { name: 'Equipment', value: estimate.total_equipment_cost, color: '#8b5cf6' }
  ];

  const materialData = [
    { name: 'Concrete', cost: estimate.concrete_cu_m * 4000 },
    { name: 'Steel', cost: estimate.steel_kg * 65 },
    { name: 'Bricks', cost: estimate.bricks_units * 8 },
    { name: 'Cement', cost: estimate.cement_bags * 350 },
    { name: 'Sand', cost: estimate.sand_cu_m * 1500 }
  ];

  const formatRupee = (val: number) => `₹ ${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="p-6 h-full flex flex-col space-y-6 text-white" style={{ background: "var(--bg-primary)", overflowY: 'auto' }}>
      
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="text-emerald-400" /> Auto-Generated Bill of Quantities (BOQ)
          </h1>
          <p className="text-gray-400 text-sm mt-1">AI-calculated material and labor estimates based on the 3D Digital Twin Volume</p>
        </div>
        <div className="flex gap-4">
          <button onClick={generateBOQ} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-bold">
            <Activity size={16} /> Recalculate
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg border border-gray-600 flex items-center gap-2 transition-colors">
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* KPI Totals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg">
          <div className="text-gray-400 text-sm mb-1 flex items-center gap-2"><DollarSign size={16}/> Total Project Cost</div>
          <div className="text-3xl font-bold text-emerald-400">{formatRupee(estimate.grand_total)}</div>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg">
          <div className="text-gray-400 text-sm mb-1 flex items-center gap-2"><Database size={16}/> Material Cost</div>
          <div className="text-2xl font-bold text-blue-400">{formatRupee(estimate.total_material_cost)}</div>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg">
          <div className="text-gray-400 text-sm mb-1 flex items-center gap-2"><HardHat size={16}/> Labor Cost</div>
          <div className="text-2xl font-bold text-amber-400">{formatRupee(estimate.total_labor_cost)}</div>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg">
          <div className="text-gray-400 text-sm mb-1 flex items-center gap-2"><Building size={16}/> Total Area</div>
          <div className="text-2xl font-bold text-gray-200">{Math.round(estimate.total_area_sqft).toLocaleString()} sq.ft</div>
        </div>
      </div>

      {/* Detailed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Materials Table */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg flex flex-col">
          <div className="p-4 border-b border-gray-700 bg-gray-850 font-bold flex items-center gap-2">
            <FileText size={18} className="text-cyan-400" /> Material Quantities
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-900">
                <tr>
                  <th className="px-6 py-3">Item Description</th>
                  <th className="px-6 py-3 text-right">Quantity</th>
                  <th className="px-6 py-3 text-right">Unit</th>
                  <th className="px-6 py-3 text-right">Rate</th>
                  <th className="px-6 py-3 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-white">Ready-Mix Concrete</td>
                  <td className="px-6 py-4 text-right">{Math.round(estimate.concrete_cu_m).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-500">cu.m</td>
                  <td className="px-6 py-4 text-right">₹ 4,000</td>
                  <td className="px-6 py-4 text-right font-bold">{formatRupee(estimate.concrete_cu_m * 4000)}</td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-white">TMT Steel (Rebar)</td>
                  <td className="px-6 py-4 text-right">{Math.round(estimate.steel_kg).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-500">kg</td>
                  <td className="px-6 py-4 text-right">₹ 65</td>
                  <td className="px-6 py-4 text-right font-bold">{formatRupee(estimate.steel_kg * 65)}</td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-white">Red Bricks</td>
                  <td className="px-6 py-4 text-right">{Math.round(estimate.bricks_units).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-500">units</td>
                  <td className="px-6 py-4 text-right">₹ 8</td>
                  <td className="px-6 py-4 text-right font-bold">{formatRupee(estimate.bricks_units * 8)}</td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-white">Portland Cement</td>
                  <td className="px-6 py-4 text-right">{Math.round(estimate.cement_bags).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-500">bags</td>
                  <td className="px-6 py-4 text-right">₹ 350</td>
                  <td className="px-6 py-4 text-right font-bold">{formatRupee(estimate.cement_bags * 350)}</td>
                </tr>
                <tr className="hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-white">River Sand</td>
                  <td className="px-6 py-4 text-right">{Math.round(estimate.sand_cu_m).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-500">cu.m</td>
                  <td className="px-6 py-4 text-right">₹ 1,500</td>
                  <td className="px-6 py-4 text-right font-bold">{formatRupee(estimate.sand_cu_m * 1500)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Charts */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 shadow-lg flex flex-col space-y-6">
          <div className="h-64">
            <h3 className="font-bold text-gray-300 text-center mb-2">Cost Breakdown</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {costData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatRupee(value as number)} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="h-64 mt-4">
            <h3 className="font-bold text-gray-300 text-center mb-2">Material Cost Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={materialData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#374151'}} formatter={(value: any) => formatRupee(value as number)} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="cost" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
