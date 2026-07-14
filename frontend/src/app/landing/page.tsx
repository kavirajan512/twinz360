"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Box, Building2, ChevronRight, Activity, ShieldCheck, PlayCircle, Map } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090b", color: "#f8fafc", fontFamily: "var(--font-geist-sans)" }}>
      {/* Navigation */}
      <nav style={{
        position: "fixed", top: 0, width: "100%", zIndex: 50, transition: "all 0.3s",
        backgroundColor: scrolled ? "rgba(9, 9, 11, 0.8)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid transparent"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Building2 className="text-cyan" size={28} />
            <span style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "1px" }}>AERO-TWIN</span>
          </div>
          <div style={{ display: "flex", gap: "2rem", alignItems: "center", fontSize: "0.9rem", fontWeight: 500 }}>
            <a href="#features" style={{ color: "#cbd5e1", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#cbd5e1"}>Features</a>
            <a href="#solutions" style={{ color: "#cbd5e1", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#cbd5e1"}>Solutions</a>
            <a href="#pricing" style={{ color: "#cbd5e1", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#cbd5e1"}>Pricing</a>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link href="/portal" style={{ textDecoration: "none" }}>
              <button style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "white", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}>
                Client Login
              </button>
            </Link>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button className="btn-gradient" style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, color: "white" }}>
                Admin Console
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        paddingTop: "8rem", paddingBottom: "5rem", 
        background: "radial-gradient(circle at 50% -20%, rgba(6, 182, 212, 0.15) 0%, transparent 70%)",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "10%", left: "10%", width: "300px", height: "300px", background: "var(--accent-cyan)", filter: "blur(120px)", opacity: 0.1, borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "400px", height: "400px", background: "var(--accent-purple)", filter: "blur(150px)", opacity: 0.1, borderRadius: "50%" }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem", textAlign: "center", position: "relative", zIndex: 10 }}>
          <div style={{ display: "inline-block", padding: "0.25rem 1rem", background: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.2)", borderRadius: "99px", color: "var(--cyan)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.5rem" }}>
            🚀 Introducing AeroTwin Pro: Real-Time BIM & Feasibility AI
          </div>
          <h1 style={{ fontSize: "4.5rem", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.5rem", letterSpacing: "-1px" }}>
            The Future of <br/>
            <span className="title-gradient-cyan">Construction Monitoring.</span>
          </h1>
          <p style={{ fontSize: "1.2rem", color: "#94a3b8", maxWidth: "600px", margin: "0 auto 2.5rem", lineHeight: 1.6 }}>
            AeroTwin leverages AI drone analytics, IoT sensors, and 4D BIM Digital Twins to give you god-mode visibility over your construction sites.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
               <button className="btn-gradient" style={{ padding: "1rem 2rem", borderRadius: "12px", border: "none", fontSize: "1rem", fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                 Start Free Trial <ArrowRight size={18} />
               </button>
            </Link>
            <button style={{ padding: "1rem 2rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", fontSize: "1rem", fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
              <PlayCircle size={18} /> Watch Demo
            </button>
          </div>

          {/* Abstract Dashboard Preview */}
          <div style={{ marginTop: "4rem", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #09090b 10%, transparent)", zIndex: 1 }} />
            <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", background: "#18181b", padding: "0.5rem" }}>
               <div style={{ width: "100%", height: "400px", background: "url('data:image/svg+xml;utf8,<svg width=\"100%\" height=\"100%\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"100%\" height=\"100%\" fill=\"%2318181b\"/><path d=\"M0,200 L200,300 L400,200 L200,100 Z\" fill=\"%230891b2\" opacity=\"0.2\" stroke=\"%2306b6d4\" stroke-width=\"2\"/></svg>') center/cover", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ background: "rgba(0,0,0,0.5)", padding: "1rem 2rem", borderRadius: "8px", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: "1rem" }}>
                     <Box className="text-cyan animate-pulse" size={32} />
                     <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 600 }}>Live BIM Model Active</div>
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Center Plaza Extension • Syncing...</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: "5rem 0", background: "#09090b" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem" }}>End-to-End Construction OS</h2>
            <p style={{ color: "#94a3b8", maxWidth: "600px", margin: "0 auto" }}>Everything you need to plan, build, and manage your property lifecycle in one unified platform.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            
            {[
              { icon: Map, title: "AI Feasibility Planner", desc: "Generate procedural 3D models and instant BOQ estimates from just a plot size." },
              { icon: Box, title: "4D BIM & Digital Twin", desc: "Upload .ifc files for real-time WebGL rendering and timeline visualization." },
              { icon: ShieldCheck, title: "AI Safety Vision", desc: "Connect CCTV feeds for YOLOv11 powered automated PPE compliance tracking." },
              { icon: Activity, title: "Real-Time HRMS", desc: "Track worker attendance using geofenced check-ins and auto-generate payroll." }
            ].map((f, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "2rem", transition: "transform 0.2s, background 0.2s", cursor: "pointer" }} onMouseOver={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)" }} onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}>
                <div style={{ background: "rgba(6, 182, 212, 0.1)", width: "50px", height: "50px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
                  <f.icon className="text-cyan" size={24} />
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>{f.title}</h3>
                <p style={{ color: "#94a3b8", lineHeight: 1.5, fontSize: "0.95rem" }}>{f.desc}</p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "4rem 0 2rem", background: "#09090b" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Building2 className="text-cyan" size={24} />
              <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>AERO-TWIN</span>
            </div>
            <p style={{ color: "#64748b", fontSize: "0.9rem", maxWidth: "250px" }}>The operating system for modern construction sites.</p>
          </div>
          
          <div style={{ display: "flex", gap: "4rem" }}>
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: "1rem" }}>Platform</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", color: "#94a3b8", fontSize: "0.9rem" }}>
                <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Admin Dashboard</Link>
                <Link href="/portal" style={{ color: "inherit", textDecoration: "none" }}>Client Portal</Link>
                <Link href="/feasibility" style={{ color: "inherit", textDecoration: "none" }}>Feasibility Engine</Link>
              </div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: "1200px", margin: "3rem auto 0", padding: "0 2rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "2rem", color: "#64748b", fontSize: "0.85rem", textAlign: "center" }}>
          © 2026 AeroTwin Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
