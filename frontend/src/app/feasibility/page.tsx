import React from "react";
import FeasibilityDashboard from "../../components/FeasibilityDashboard";

export default function FeasibilityPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <header style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", backgroundColor: "var(--background-secondary)" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Feasibility Analysis Module</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Dedicated standalone feasibility analysis view.</p>
      </header>
      <main style={{ padding: "1.5rem" }}>
        <FeasibilityDashboard userId={1} />
      </main>
    </div>
  );
}
