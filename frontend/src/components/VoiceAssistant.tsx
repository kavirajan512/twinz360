"use client";

import React, { useState } from "react";
import { Mic, X, MessageSquare, Loader2 } from "lucide-react";

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setQuery("");
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("query", userMsg);
      
      const res = await fetch("http://127.0.0.1:3001/ai/voice", {
        method: "POST",
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", text: "Connection error to AI Copilot." }]);
    }
    setIsProcessing(false);
  };

  return (
    <div style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 1000 }}>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="btn-primary animate-float"
          style={{
            width: "60px", height: "60px", borderRadius: "30px",
            padding: 0,
            display: "flex", justifyContent: "center", alignItems: "center",
            boxShadow: "0 10px 25px rgba(20, 184, 166, 0.35), var(--shadow-glow-cyan)"
          }}
        >
          <Mic size={28} />
        </button>
      )}

      {isOpen && (
        <div className="glass-panel" style={{ width: "320px", height: "450px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>
          <div style={{ background: "rgba(6, 182, 212, 0.1)", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Mic className="text-cyan animate-pulse" size={18} />
              <strong style={{ fontSize: "0.9rem" }}>AI Field Assistant</strong>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {messages.length === 0 && (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", marginTop: "2rem" }}>
                Hold the mic or type to ask me about schedules, costs, or equipment.
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} style={{ 
                alignSelf: m.role === "user" ? "flex-end" : "flex-start", 
                background: m.role === "user" ? "var(--accent-cyan)" : "rgba(255,255,255,0.05)",
                color: m.role === "user" ? "#000" : "#fff",
                padding: "0.6rem 0.8rem", borderRadius: "8px", maxWidth: "85%", fontSize: "0.85rem",
                border: m.role !== "user" ? "1px solid var(--border-color)" : "none"
              }}>
                {m.text}
              </div>
            ))}
            
            {isProcessing && (
              <div style={{ alignSelf: "flex-start", padding: "0.6rem 0.8rem", color: "var(--accent-cyan)" }}>
                <Loader2 className="animate-spin" size={18} />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "0.8rem", borderTop: "1px solid var(--border-color)", display: "flex", gap: "0.5rem" }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ask AI..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ flex: 1, padding: "0.5rem", fontSize: "0.85rem" }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: "0.5rem", borderRadius: "8px" }} disabled={isProcessing}>
              <MessageSquare size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
