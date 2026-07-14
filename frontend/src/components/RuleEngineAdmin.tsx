// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

export default function RuleEngineAdmin() {
  const [authorities, setAuthorities] = useState([]);
  const [selectedAuth, setSelectedAuth] = useState(null);
  const [rules, setRules] = useState([]);

  const [newAuth, setNewAuth] = useState({ name: '', region: '', description: '' });
  const [newRule, setNewRule] = useState({ rule_key: '', rule_value: '', rule_type: 'max', description: '' });

  useEffect(() => {
    fetch('http://127.0.0.1:3001/regulatory/authorities')
      .then(res => res.json())
      .then(data => setAuthorities(data))
      .catch(err => console.error("Error fetching authorities:", err));
  }, []);

  useEffect(() => {
    if (selectedAuth) {
      fetch(`http://127.0.0.1:3001/regulatory/authorities/${selectedAuth.id}/rules`)
        .then(res => res.json())
        .then(data => setRules(data))
        .catch(err => console.error("Error fetching rules:", err));
    } else {
      setRules([]);
    }
  }, [selectedAuth]);

  const handleCreateAuth = async () => {
    const res = await fetch('http://127.0.0.1:3001/regulatory/authorities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAuth)
    });
    if (res.ok) {
      const auth = await res.json();
      setAuthorities([...authorities, auth]);
      setNewAuth({ name: '', region: '', description: '' });
    }
  };

  const handleCreateRule = async () => {
    if (!selectedAuth) return;
    const res = await fetch(`http://127.0.0.1:3001/regulatory/authorities/${selectedAuth.id}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newRule,
        rule_value: parseFloat(newRule.rule_value)
      })
    });
    if (res.ok) {
      const rule = await res.json();
      setRules([...rules, rule]);
      setNewRule({ rule_key: '', rule_value: '', rule_type: 'max', description: '' });
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-blue-400">Rule Engine Admin Portal</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Authorities */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Governing Authorities</h3>
          <ul className="space-y-2 mb-6">
            {authorities.map(auth => (
              <li 
                key={auth.id} 
                onClick={() => setSelectedAuth(auth)}
                className={`p-3 rounded cursor-pointer transition-colors ${selectedAuth?.id === auth.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                <div className="font-semibold">{auth.name}</div>
                <div className="text-xs text-gray-300">{auth.region}</div>
              </li>
            ))}
            {authorities.length === 0 && <li className="text-gray-400">No authorities configured.</li>}
          </ul>
          
          <div className="space-y-3 bg-gray-900 p-3 rounded">
            <h4 className="text-sm font-semibold text-gray-400 uppercase">Add New Authority</h4>
            <input 
              type="text" placeholder="Name (e.g., CMDA)" className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm"
              value={newAuth.name} onChange={e => setNewAuth({...newAuth, name: e.target.value})}
            />
            <input 
              type="text" placeholder="Region (e.g., Chennai)" className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm"
              value={newAuth.region} onChange={e => setNewAuth({...newAuth, region: e.target.value})}
            />
            <button 
              onClick={handleCreateAuth}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded text-sm transition-colors"
            >
              Add Authority
            </button>
          </div>
        </div>

        {/* Right Column: Rules */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
            Rules {selectedAuth ? `for ${selectedAuth.name}` : '(Select an Authority)'}
          </h3>
          
          {selectedAuth && (
            <>
              <ul className="space-y-2 mb-6">
                {rules.map(rule => (
                  <li key={rule.id} className="p-3 bg-gray-700 rounded flex justify-between items-center">
                    <div>
                      <div className="font-mono text-sm text-yellow-400">{rule.rule_key}</div>
                      <div className="text-xs text-gray-300">{rule.description}</div>
                    </div>
                    <div className="bg-gray-900 px-3 py-1 rounded text-sm font-semibold">
                      {rule.rule_type} : {rule.rule_value}
                    </div>
                  </li>
                ))}
                {rules.length === 0 && <li className="text-gray-400">No rules configured.</li>}
              </ul>

              <div className="space-y-3 bg-gray-900 p-3 rounded">
                <h4 className="text-sm font-semibold text-gray-400 uppercase">Add New Rule</h4>
                <input 
                  type="text" placeholder="Rule Key (e.g., min_road_width)" className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm"
                  value={newRule.rule_key} onChange={e => setNewRule({...newRule, rule_key: e.target.value})}
                />
                <div className="flex gap-2">
                  <select 
                    className="w-1/3 p-2 bg-gray-800 border border-gray-700 rounded text-sm"
                    value={newRule.rule_type} onChange={e => setNewRule({...newRule, rule_type: e.target.value})}
                  >
                    <option value="max">Max</option>
                    <option value="min">Min</option>
                    <option value="exact">Exact</option>
                  </select>
                  <input 
                    type="number" placeholder="Value" className="w-2/3 p-2 bg-gray-800 border border-gray-700 rounded text-sm"
                    value={newRule.rule_value} onChange={e => setNewRule({...newRule, rule_value: e.target.value})}
                  />
                </div>
                <input 
                  type="text" placeholder="Description" className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm"
                  value={newRule.description} onChange={e => setNewRule({...newRule, description: e.target.value})}
                />
                <button 
                  onClick={handleCreateRule}
                  className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded text-sm transition-colors"
                >
                  Add Rule
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
