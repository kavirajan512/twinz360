"use client";
import React, { useState, useEffect, useRef } from "react";
import { Brain, Cpu, MessageSquare, Zap, Bot, CheckCircle2, AlertTriangle, Clock, TrendingUp, RefreshCw, ChevronRight, Activity } from "lucide-react";

const AGENTS = [
  { id: "structural", name: "AI Structural Engineer", icon: Cpu, color: "#8b5cf6", status: "active", task: "Auditing BIM models for Eurocode compliance", lastAction: "Flagged column C4 for rebar review", actions: 148, successRate: 99.2 },
  { id: "scheduler", name: "AI Project Scheduler", icon: Zap, color: "#06b6d4", status: "simulating", task: "Running Monte Carlo critical path simulation", lastAction: "Predicted 3-day delay in Level 4 concrete pour", actions: 312, successRate: 97.8 },
  { id: "surveyor", name: "AI Quantity Surveyor", icon: TrendingUp, color: "#4ade80", status: "active", task: "Reconciling BOQ vs actual consumption", lastAction: "Raised RFI for 15% cement usage discrepancy", actions: 89, successRate: 98.5 },
  { id: "safety", name: "AI Safety Inspector", icon: AlertTriangle, color: "#ef4444", status: "alert", task: "Monitoring live CCTV & IoT feeds for hazards", lastAction: "Issued PPE violation alert on CAM-03 at 14:22", actions: 521, successRate: 95.1 },
  { id: "procurement", name: "AI Procurement Agent", icon: RefreshCw, color: "#f97316", status: "active", task: "Managing vendor comparison & purchase orders", lastAction: "Auto-generated PO for TMT Steel (45 Tons)", actions: 67, successRate: 99.7 },
];

const initMessages = [
  { from: "system", text: "AI Command Center initialized. 5 agents active.", time: "09:00 AM" },
  { from: "agent", agent: "AI Structural Engineer", text: "I noticed column C4 on Level 3 has a rebar spacing of 180mm vs the design spec of 150mm. I have flagged this for immediate review and assigned an RFI to the site supervisor.", time: "09:14 AM" },
  { from: "agent", agent: "AI Quantity Surveyor", text: "Cement consumption is 15% above the BOQ estimate for the foundation pour. This may indicate wastage or inaccurate measurements. I've drafted a variance report.", time: "10:02 AM" },
  { from: "agent", agent: "AI Project Scheduler", text: "Monte Carlo simulation complete: 72% probability of 3-day delay on Level 4 slab pour due to low rebar stock. Recommend placing emergency order immediately.", time: "11:30 AM" },
];

export default function AIAgentsDashboard() {
  const [messages, setMessages] = useState(initMessages);
  const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState(AGENTS);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAgentStatuses(prev => prev.map(a => ({
        ...a,
        actions: a.actions + Math.floor(Math.random() * 2),
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const autoReplies: Record<string, string> = {
    structural: "I have completed a full structural audit of the current BIM model. Column grid C4 shows rebar spacing of 180mm vs spec 150mm. Recommend immediate field verification. All other load-bearing elements are within tolerance.",
    scheduler: "Based on current inventory and labor attendance data, I am projecting a 72% probability of a 3-day delay on the Level 4 slab pour. The critical path runs through concrete supply. Recommend placing emergency order today.",
    surveyor: "Reconciling BOQ vs actuals: Cement is 15% over plan (likely wastage), Steel is within 2% tolerance, Sand is 8% under plan which is acceptable. I have generated a full variance report for your review.",
    safety: "Monitoring 4 CCTV feeds and 6 IoT sensor nodes. In the last hour: 3 PPE violations detected (CAM-01, CAM-03), 1 crane load warning (88% capacity), and 1 unauthorized zone entry near materials storage.",
    procurement: "Analyzing vendor database: For TMT Steel (45T), VendorX offers ₹78,000/T (delivery: 3 days) vs VendorY at ₹76,500/T (delivery: 5 days). Recommend VendorX given project timeline urgency. Shall I generate the PO?",
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { from: "user" as const, text: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, userMsg as any]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const reply = { from: "agent", agent: selectedAgent.name, text: autoReplies[selectedAgent.id] || "Processing your request... I will have an answer shortly.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      setMessages(prev => [...prev, reply as any]);
      setIsTyping(false);
    }, 1800);
  };

  const statusColor = (s: string) => ({ active: "#4ade80", simulating: "#06b6d4", alert: "#ef4444" }[s] || "#888");

  return (
    <div style={{ display: "flex", gap: "1.5rem", height: "100%" }}>
      {/* Left: Agent panel */}
      <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "1rem", flexShrink: 0 }}>
        <div className="glass-panel" style={{ padding: "1rem" }}>
          <h3 style={{ margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}><Brain size={18} style={{ color: "#8b5cf6" }} /> Active AI Agents</h3>
          {agentStatuses.map(agent => (
            <div key={agent.id} onClick={() => setSelectedAgent(agent)} style={{ padding: "0.85rem", borderRadius: "8px", cursor: "pointer", background: selectedAgent.id === agent.id ? `${agent.color}15` : "rgba(255,255,255,0.02)", border: `1px solid ${selectedAgent.id === agent.id ? agent.color : "rgba(255,255,255,0.06)"}`, marginBottom: "0.5rem", transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <agent.icon size={16} style={{ color: agent.color }} />
                  <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{agent.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor(agent.status), boxShadow: `0 0 6px ${statusColor(agent.status)}` }}></div>
                  <span style={{ fontSize: "0.7rem", color: statusColor(agent.status), textTransform: "uppercase", fontWeight: 600 }}>{agent.status}</span>
                </div>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem", lineHeight: 1.4 }}>{agent.task}</div>
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                <span>{agent.actions} actions</span>
                <span style={{ color: "#4ade80" }}>{agent.successRate}% success</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected agent detail */}
        <div className="glass-panel" style={{ padding: "1rem", borderColor: selectedAgent.color, flex: 1 }}>
          <h4 style={{ margin: "0 0 0.75rem 0", color: selectedAgent.color, fontSize: "0.9rem" }}>Last Action Log</h4>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", background: "rgba(0,0,0,0.3)", padding: "0.75rem", borderRadius: "6px", lineHeight: 1.6 }}>
            {selectedAgent.lastAction}
          </div>
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
            <button style={{ flex: 1, padding: "0.5rem", background: `${selectedAgent.color}20`, border: `1px solid ${selectedAgent.color}40`, borderRadius: "6px", color: selectedAgent.color, cursor: "pointer", fontSize: "0.8rem" }}>View Report</button>
            <button style={{ flex: 1, padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem" }}>Pause Agent</button>
          </div>
        </div>
      </div>

      {/* Right: Chat Interface */}
      <div className="glass-panel" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0 }}>AI Command Interface</h3>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Talking to: <span style={{ color: selectedAgent.color }}>{selectedAgent.name}</span></div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {AGENTS.map(a => (
              <button key={a.id} onClick={() => setSelectedAgent(a)} style={{ width: 32, height: 32, borderRadius: "50%", background: selectedAgent.id === a.id ? `${a.color}30` : "rgba(255,255,255,0.05)", border: `1px solid ${selectedAgent.id === a.id ? a.color : "rgba(255,255,255,0.1)"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <a.icon size={14} style={{ color: a.color }} />
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {messages.map((msg: any, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "75%", background: msg.from === "user" ? "rgba(6,182,212,0.2)" : msg.from === "system" ? "rgba(255,255,255,0.05)" : "rgba(139,92,246,0.15)", border: `1px solid ${msg.from === "user" ? "rgba(6,182,212,0.4)" : msg.from === "system" ? "rgba(255,255,255,0.1)" : "rgba(139,92,246,0.3)"}`, borderRadius: msg.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "0.85rem 1rem" }}>
                {msg.from === "agent" && <div style={{ fontSize: "0.7rem", color: "#8b5cf6", fontWeight: 700, marginBottom: "0.35rem" }}>{msg.agent}</div>}
                {msg.from === "system" && <div style={{ fontSize: "0.7rem", color: "#4ade80", fontWeight: 700, marginBottom: "0.35rem" }}>SYSTEM</div>}
                <div style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>{msg.text}</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.35rem", textAlign: "right" }}>{msg.time}</div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: "flex" }}>
              <div style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "16px 16px 16px 4px", padding: "0.75rem 1rem" }}>
                <div style={{ fontSize: "0.7rem", color: "#8b5cf6", marginBottom: "0.3rem" }}>{selectedAgent.name}</div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[0, 1, 2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6", animation: `bounce 1s ${d * 0.15}s infinite` }}></div>)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder={`Ask ${selectedAgent.name} anything about the project...`} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "0.75rem 1rem", color: "white", outline: "none", fontSize: "0.9rem" }} />
            <button onClick={sendMessage} style={{ padding: "0.75rem 1.5rem", background: selectedAgent.color, border: "none", borderRadius: "10px", color: "#000", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem" }}>Send</button>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
            {["Generate delay report", "Check safety violations", "Predict material needs", "Optimize schedule"].map(q => (
              <button key={q} onClick={() => setInput(q)} style={{ padding: "4px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem" }}>{q}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
