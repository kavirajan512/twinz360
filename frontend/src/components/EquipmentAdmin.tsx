"use client";
import React, { useState, useEffect } from 'react';
import { Truck, Plus, Save, Loader2, IndianRupee } from 'lucide-react';

interface Equipment {
  id: number;
  name: string;
  category: string;
  hourly_rate: number;
  daily_rate: number;
  owner_name: string;
  status: string;
}

export default function EquipmentAdmin() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newEq, setNewEq] = useState({
    name: '',
    category: 'Heavy Machinery',
    hourly_rate: 0,
    daily_rate: 0,
    owner_name: '',
    specs_json: '{}'
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:3001/rental/equipment");
      if (res.ok) {
        const data = await res.json();
        setEquipment(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("http://127.0.0.1:3001/rental/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEq)
      });
      if (res.ok) {
        const added = await res.json();
        setEquipment([...equipment, added]);
        setNewEq({ name: '', category: 'Heavy Machinery', hourly_rate: 0, daily_rate: 0, owner_name: '', specs_json: '{}' });
      } else {
        alert("Failed to add equipment.");
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-800">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-cyan-400">
        <Truck /> Equipment Fleet Admin
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ADD EQUIPMENT FORM */}
        <div className="md:col-span-1 bg-gray-800 p-5 rounded-lg border border-gray-700 h-fit">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Add New Equipment</h3>
          
          <form onSubmit={handleAddEquipment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Equipment Name</label>
              <input required type="text" className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm" 
                value={newEq.name} onChange={e => setNewEq({...newEq, name: e.target.value})} placeholder="e.g. Cat 320 Excavator" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Category</label>
              <select className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm"
                value={newEq.category} onChange={e => setNewEq({...newEq, category: e.target.value})}>
                <option value="Heavy Machinery">Heavy Machinery</option>
                <option value="Lifting">Lifting</option>
                <option value="Earthmoving">Earthmoving</option>
                <option value="Power">Power Generation</option>
                <option value="Tools">Tools</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-400 mb-1">Hourly Rate (₹)</label>
                <input required type="number" className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm" 
                  value={newEq.hourly_rate || ''} onChange={e => setNewEq({...newEq, hourly_rate: parseFloat(e.target.value)})} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-400 mb-1">Daily Rate (₹)</label>
                <input required type="number" className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm" 
                  value={newEq.daily_rate || ''} onChange={e => setNewEq({...newEq, daily_rate: parseFloat(e.target.value)})} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Owner / Vendor Name</label>
              <input required type="text" className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm" 
                value={newEq.owner_name} onChange={e => setNewEq({...newEq, owner_name: e.target.value})} placeholder="e.g. ABC Rentals" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Specs (JSON)</label>
              <textarea className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm font-mono" rows={3}
                value={newEq.specs_json} onChange={e => setNewEq({...newEq, specs_json: e.target.value})} />
            </div>

            <button type="submit" disabled={saving} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded text-sm font-bold transition-colors flex items-center justify-center gap-2 mt-4">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Add to Fleet
            </button>
          </form>
        </div>

        {/* EQUIPMENT LIST */}
        <div className="md:col-span-2 bg-gray-800 p-5 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Current Fleet</h3>
          
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-cyan-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-900 text-gray-400">
                  <tr>
                    <th className="p-3 rounded-tl">ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Vendor</th>
                    <th className="p-3">Rates</th>
                    <th className="p-3 rounded-tr">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {equipment.map(eq => (
                    <tr key={eq.id} className="hover:bg-gray-750 transition-colors">
                      <td className="p-3 font-mono text-xs text-gray-400">#{eq.id}</td>
                      <td className="p-3 font-semibold">{eq.name}</td>
                      <td className="p-3"><span className="bg-gray-700 px-2 py-1 rounded text-xs">{eq.category}</span></td>
                      <td className="p-3">{eq.owner_name}</td>
                      <td className="p-3">
                        <div className="flex flex-col text-xs">
                          <span>₹{eq.hourly_rate}/hr</span>
                          <span className="text-gray-400">₹{eq.daily_rate}/day</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          eq.status === 'available' ? 'bg-emerald-900/30 text-emerald-400' :
                          eq.status === 'rented' ? 'bg-amber-900/30 text-amber-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {eq.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {equipment.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">No equipment found. Add some from the panel.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
