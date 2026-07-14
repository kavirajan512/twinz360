"use client";

import React, { useState, useEffect } from 'react';
import { Truck, Activity, Droplet, Clock, Settings, Search, BrainCircuit, Bell, Calendar, MapPin, IndianRupee } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function EquipmentDashboard() {
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [liveData, setLiveData] = useState<any[]>([]);
  const [selectedEquip, setSelectedEquip] = useState<any | null>(null);
  
  // AI Chat State
  const [chat, setChat] = useState<{role: string, text: string}[]>([
    { role: 'ai', text: 'I am your Equipment Operations AI. Ask me about active machinery, fuel consumption, or maintenance schedules.' }
  ]);
  const [prompt, setPrompt] = useState('');

  // Fetch initial list
  useEffect(() => {
    fetch('http://127.0.0.1:3001/equipment_twin/list')
      .then(res => res.json())
      .then(data => setEquipmentList(data))
      .catch(err => console.error("Error fetching equipment:", err));
  }, []);

  // WebSocket for telemetry
  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:3001/equipment_twin/ws');
    
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'telemetry_update') {
          setLiveData(msg.data);
          // If there is a selected equipment, update its live stats
          setSelectedEquip((prev: any) => {
            if (prev) {
              const updated = msg.data.find((m: any) => m.id === prev.id);
              if (updated) return { ...prev, ...updated };
            }
            return prev;
          });
        }
      } catch(e) {}
    };

    return () => ws.close();
  }, []);

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setChat([...chat, { role: 'user', text: prompt }]);
    const currentPrompt = prompt;
    setPrompt('');
    
    setTimeout(() => {
      let response = "I'm monitoring the equipment. Currently, all systems are optimal.";
      const lower = currentPrompt.toLowerCase();
      if (lower.includes("idle")) response = "The Tower Crane is currently idle waiting for materials.";
      if (lower.includes("cost") || lower.includes("incurred")) response = "Total equipment rental cost incurred this week is ₹84,000.";
      if (lower.includes("maintenance")) response = "The Bulldozer is due for hydraulic fluid maintenance on Phase 1 completion.";
      if (lower.includes("foundation")) response = "The CAT 320 Excavator and Deere 850L Bulldozer are assigned to Foundation Digging.";
      
      setChat(prev => [...prev, { role: 'ai', text: response }]);
    }, 1000);
  };

  // KPI Calculations
  const activeCount = liveData.length;
  const avgHealth = liveData.length > 0 ? (liveData.reduce((acc, curr) => acc + curr.telemetry.health, 0) / liveData.length).toFixed(1) : "100";
  
  // Dummy chart data
  const utilData = liveData.map(l => ({ name: l.type, utilization: l.telemetry.utilization }));

  return (
    <div className="p-6 h-full flex flex-col space-y-6" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", overflowY: 'auto' }}>
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Truck className="text-cyan-400" /> Equipment & Vehicle Digital Twin
          </h1>
          <p className="text-gray-400 text-sm">Real-time IoT telemetry, BIM timeline tracking, and predictive maintenance</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2 transition-colors">
            <Settings size={16} /> Config
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3 text-cyan-400 mb-2">
            <Activity size={20} /> <span className="font-semibold text-sm">Active Machinery</span>
          </div>
          <div className="text-3xl font-bold">{activeCount} / {equipmentList.length || 4}</div>
          <div className="text-xs text-gray-400 mt-1">Currently operating on site</div>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3 text-green-400 mb-2">
            <Settings size={20} /> <span className="font-semibold text-sm">Avg Fleet Health</span>
          </div>
          <div className="text-3xl font-bold">{avgHealth}%</div>
          <div className="text-xs text-gray-400 mt-1">Based on live sensor diagnostics</div>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3 text-orange-400 mb-2">
            <Bell size={20} /> <span className="font-semibold text-sm">Maintenance Alerts</span>
          </div>
          <div className="text-3xl font-bold">1</div>
          <div className="text-xs text-gray-400 mt-1">Bulldozer - Check Hydraulics</div>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3 text-indigo-400 mb-2">
            <IndianRupee size={20} /> <span className="font-semibold text-sm">Daily Rental Burn</span>
          </div>
          <div className="text-3xl font-bold">₹ 14,200</div>
          <div className="text-xs text-gray-400 mt-1">Active billing period</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* Left Col: Live Equipment Feed */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 font-bold flex items-center justify-between">
            <span>Live IoT Feed</span>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {liveData.length === 0 && <div className="text-gray-500 text-center py-8">Awaiting Telemetry...</div>}
            {liveData.map(eq => (
              <div 
                key={eq.id} 
                onClick={() => setSelectedEquip(eq)}
                className={`p-4 rounded-lg cursor-pointer border transition-all ${selectedEquip?.id === eq.id ? 'border-cyan-500 bg-gray-700' : 'border-gray-700 bg-gray-900 hover:border-gray-500'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold">{eq.type}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin size={12}/> {eq.task} ({eq.phase})
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${eq.telemetry.health < 85 ? 'bg-orange-900 text-orange-400' : 'bg-green-900 text-green-400'}`}>
                    {eq.telemetry.health < 85 ? 'Warning' : 'Optimal'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-800 p-2 rounded flex justify-between items-center">
                    <span className="text-gray-400 text-xs">RPM</span>
                    <span className="font-mono">{eq.telemetry.rpm}</span>
                  </div>
                  <div className="bg-gray-800 p-2 rounded flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Fuel</span>
                    <span className="font-mono">{eq.telemetry.fuel}%</span>
                  </div>
                  <div className="bg-gray-800 p-2 rounded flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Temp</span>
                    <span className="font-mono text-orange-400">{eq.telemetry.temp}°C</span>
                  </div>
                  <div className="bg-gray-800 p-2 rounded flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Util</span>
                    <span className="font-mono text-cyan-400">{eq.telemetry.utilization}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Col: Charts & Detailed Analytics */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 flex flex-col space-y-6">
          <div>
            <h3 className="font-bold mb-4 flex items-center gap-2"><Activity size={18} className="text-indigo-400"/> Live Utilization (%)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="utilization" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
             <h3 className="font-bold mb-4 flex items-center gap-2"><Droplet size={18} className="text-blue-400"/> Historical Fuel Consumption</h3>
             <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  {time: '08:00', fuel: 95}, {time: '10:00', fuel: 82},
                  {time: '12:00', fuel: 70}, {time: '14:00', fuel: 55},
                  {time: '16:00', fuel: 41}
                ]}>
                  <defs>
                    <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="fuel" stroke="#3b82f6" fillOpacity={1} fill="url(#colorFuel)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: AI Operations Assistant */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 font-bold flex items-center gap-2 bg-gradient-to-r from-gray-800 to-indigo-900 rounded-t-xl">
            <BrainCircuit size={20} className="text-cyan-400" /> AI Fleet Commander
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-xl max-w-[85%] text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-gray-700 text-gray-200 rounded-bl-none border border-gray-600'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAiSubmit} className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-xl flex gap-2">
            <input 
              type="text" 
              placeholder="Ask about machinery..." 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
            />
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg transition-colors">
              <Search size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
