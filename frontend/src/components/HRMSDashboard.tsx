"use client";

import React, { useState, useEffect } from "react";
import { Users, Clock, MapPin, Calendar, AlertTriangle, ShieldCheck, Plus, Play, Navigation } from "lucide-react";

export default function HRMSDashboard({ projectId }: { projectId?: number }) {
  const [activeTab, setActiveTab] = useState("attendance"); // attendance, employees, payroll, geofences
  const [employees, setEmployees] = useState<any[]>([]);
  const [todayLogs, setTodayLogs] = useState<any>({ logs: [] });
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);
  const [geofences, setGeofences] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: "", role: "Worker", department: "General", base_salary: 15000 });
  const [generatingPayroll, setGeneratingPayroll] = useState(false);

  const currentMonth = new Date().toISOString().substring(0, 7); // e.g., "2026-07"

  useEffect(() => {
    fetchInitialData();
    // Real-time mode: Poll attendance every 5 seconds
    const interval = setInterval(() => {
      fetchAttendance();
    }, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([
      fetchEmployees(),
      fetchAttendance(),
      fetchPayroll(),
      fetchGeofences()
    ]);
    setLoading(false);
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/hrms/employees${projectId ? `?project_id=${projectId}` : ''}`);
      if (res.ok) {
        setEmployees(await res.json());
      }
    } catch (e) { console.error("Error fetching employees", e); }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/hrms/attendance/today${projectId ? `?project_id=${projectId}` : ''}`);
      if (res.ok) {
        setTodayLogs(await res.json());
      }
    } catch (e) { console.error("Error fetching attendance", e); }
  };

  const fetchPayroll = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/hrms/payroll/${currentMonth}`);
      if (res.ok) {
        setPayrollRecords(await res.json());
      }
    } catch (e) { console.error("Error fetching payroll", e); }
  };

  const fetchGeofences = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/hrms/geofences${projectId ? `?project_id=${projectId}` : ''}`);
      if (res.ok) {
        setGeofences(await res.json());
      }
    } catch (e) { console.error("Error fetching geofences", e); }
  };

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", newWorker.name);
      formData.append("role", newWorker.role);
      formData.append("department", newWorker.department);
      formData.append("base_salary", newWorker.base_salary.toString());
      if (projectId) formData.append("project_id", projectId.toString());

      const res = await fetch("http://127.0.0.1:8000/hrms/employees", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        setShowAddWorker(false);
        setNewWorker({ name: "", role: "Worker", department: "General", base_salary: 15000 });
        fetchEmployees();
      }
    } catch (error) {
      console.error("Error adding worker", error);
    }
  };

  const handleGeneratePayroll = async () => {
    setGeneratingPayroll(true);
    try {
      const formData = new FormData();
      formData.append("month", currentMonth);
      const res = await fetch("http://127.0.0.1:8000/hrms/payroll/generate", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        fetchPayroll();
      }
    } catch (error) {
      console.error("Error generating payroll", error);
    }
    setGeneratingPayroll(false);
  };

  return (
    <div className="module-panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Users className="text-cyan" size={24} /> HRMS & Workforce</h2>
          <p className="text-muted">Real-time Employee Management, GPS Attendance, and Payroll</p>
        </div>
        
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className={`btn ${activeTab === "attendance" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("attendance")}>Live Attendance</button>
          <button className={`btn ${activeTab === "employees" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("employees")}>Employees</button>
          <button className={`btn ${activeTab === "payroll" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("payroll")}>Payroll</button>
          <button className={`btn ${activeTab === "geofences" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("geofences")}>Geofences</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "4rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
           <div>Syncing real-time HRMS Data...</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Live Attendance Tab */}
          {activeTab === "attendance" && (
            <>
              {/* KPI Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                <div className="stat-card">
                  <div className="stat-value">{todayLogs.present || 0}</div>
                  <div className="stat-label">Present Today</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value text-red">{todayLogs.absent || 0}</div>
                  <div className="stat-label">Absent</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value text-orange">{todayLogs.late || 0}</div>
                  <div className="stat-label">Late Arrivals</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value text-cyan">{todayLogs.total_employees || 0}</div>
                  <div className="stat-label">Total Workforce</div>
                </div>
              </div>

              {/* Attendance Log Table */}
              <div className="panel" style={{ padding: "1rem", overflowX: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Clock size={18} className="text-cyan" /> Live Check-in Feed
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--primary)" }}>
                     <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                     </span>
                     Real-time sync active
                  </div>
                </div>
                
                {todayLogs.logs && todayLogs.logs.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "0.5rem" }}>Worker</th>
                        <th style={{ padding: "0.5rem" }}>Check-in Time</th>
                        <th style={{ padding: "0.5rem" }}>Status</th>
                        <th style={{ padding: "0.5rem" }}>GPS Location</th>
                        <th style={{ padding: "0.5rem" }}>Face Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayLogs.logs.map((log: any, idx: number) => {
                        const emp = employees.find(e => e.id === log.employee_id);
                        return (
                          <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "0.75rem 0.5rem", fontWeight: 500 }}>{emp?.name || `Worker #${log.employee_id}`}</td>
                            <td style={{ padding: "0.75rem 0.5rem" }}>{new Date(log.check_in_time).toLocaleTimeString()}</td>
                            <td style={{ padding: "0.75rem 0.5rem" }}>
                              <span className={`badge ${log.status === "present" ? "badge-success" : "badge-warning"}`}>
                                {log.status.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: "0.75rem 0.5rem" }}>
                              {log.geofence_valid ? (
                                <span style={{ color: "var(--primary)", display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={14}/> Valid Geofence</span>
                              ) : (
                                <span style={{ color: "var(--red)", display: "flex", alignItems: "center", gap: "4px" }}><AlertTriangle size={14}/> Outside Zone</span>
                              )}
                            </td>
                            <td style={{ padding: "0.75rem 0.5rem", display: "flex", alignItems: "center", gap: "6px" }}>
                              <ShieldCheck size={14} color="var(--primary)" /> {log.face_match_score}% Match
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                    No check-ins recorded for today yet.
                  </div>
                )}
              </div>
            </>
          )}

          {/* Employees Tab */}
          {activeTab === "employees" && (
            <div className="panel" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3>Employee Directory</h3>
                <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} onClick={() => setShowAddWorker(!showAddWorker)}>
                  <Plus size={16} /> Add Worker
                </button>
              </div>

              {showAddWorker && (
                <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <h4 style={{ marginBottom: "1rem" }}>New Worker Profile</h4>
                  <form onSubmit={handleAddWorker} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>Full Name</label>
                      <input type="text" className="form-input" required value={newWorker.name} onChange={(e) => setNewWorker({...newWorker, name: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>Role</label>
                      <select className="form-input" value={newWorker.role} onChange={(e) => setNewWorker({...newWorker, role: e.target.value})}>
                        <option value="Worker">Worker</option>
                        <option value="Mason">Mason</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Plumber">Plumber</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Engineer">Engineer</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>Base Salary (₹)</label>
                      <input type="number" className="form-input" value={newWorker.base_salary} onChange={(e) => setNewWorker({...newWorker, base_salary: Number(e.target.value)})} />
                    </div>
                    <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowAddWorker(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Save Employee</button>
                    </div>
                  </form>
                </div>
              )}

              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                    <th style={{ padding: "0.5rem" }}>ID</th>
                    <th style={{ padding: "0.5rem" }}>Name</th>
                    <th style={{ padding: "0.5rem" }}>Role</th>
                    <th style={{ padding: "0.5rem" }}>Department</th>
                    <th style={{ padding: "0.5rem" }}>Base Salary</th>
                    <th style={{ padding: "0.5rem" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)" }}>#{emp.id}</td>
                      <td style={{ padding: "0.75rem 0.5rem", fontWeight: 500 }}>{emp.name}</td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>{emp.role}</td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>{emp.department}</td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>₹{emp.base_salary}</td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>
                        <span className={`badge ${emp.status === "active" ? "badge-success" : "badge-warning"}`}>{emp.status.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Payroll Tab */}
          {activeTab === "payroll" && (
            <div className="panel" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3>Monthly Payroll - {currentMonth}</h3>
                <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} onClick={handleGeneratePayroll} disabled={generatingPayroll}>
                  <Calendar size={16}/> {generatingPayroll ? "Generating..." : "Generate Payroll"}
                </button>
              </div>

              {payrollRecords.length > 0 ? (
                 <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                 <thead>
                   <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                     <th style={{ padding: "0.5rem" }}>Worker Name</th>
                     <th style={{ padding: "0.5rem" }}>Days Worked</th>
                     <th style={{ padding: "0.5rem" }}>OT Hours</th>
                     <th style={{ padding: "0.5rem" }}>Base Pay</th>
                     <th style={{ padding: "0.5rem" }}>OT Pay</th>
                     <th style={{ padding: "0.5rem" }}>Deductions</th>
                     <th style={{ padding: "0.5rem" }}>Net Salary</th>
                   </tr>
                 </thead>
                 <tbody>
                   {payrollRecords.map(record => {
                     const emp = employees.find(e => e.id === record.employee_id);
                     return (
                       <tr key={record.id} style={{ borderBottom: "1px solid var(--border)" }}>
                         <td style={{ padding: "0.75rem 0.5rem", fontWeight: 500 }}>{emp?.name || `Worker #${record.employee_id}`}</td>
                         <td style={{ padding: "0.75rem 0.5rem" }}>{record.days_worked} Days</td>
                         <td style={{ padding: "0.75rem 0.5rem" }}>{record.overtime_hours} Hrs</td>
                         <td style={{ padding: "0.75rem 0.5rem" }}>₹{record.base_salary}</td>
                         <td style={{ padding: "0.75rem 0.5rem", color: "var(--primary)" }}>+₹{record.overtime_pay}</td>
                         <td style={{ padding: "0.75rem 0.5rem", color: "var(--red)" }}>-₹{record.deductions}</td>
                         <td style={{ padding: "0.75rem 0.5rem", fontWeight: "bold", color: "var(--cyan)" }}>₹{record.net_salary}</td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
              ) : (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                  No payroll records found for {currentMonth}. Click 'Generate Payroll' to calculate salary based on GPS attendance logs.
                </div>
              )}
            </div>
          )}

          {/* Geofences Tab */}
          {activeTab === "geofences" && (
            <div className="panel" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3>Active Geofences</h3>
              </div>
              
              {geofences.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  {geofences.map(fence => (
                    <div key={fence.id} style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem", background: "rgba(0,0,0,0.2)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Navigation size={16} className="text-cyan" /> {fence.name}</h4>
                        <span className="badge badge-success">Active</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                         <div>Center: {fence.center_lat.toFixed(4)}, {fence.center_lng.toFixed(4)}</div>
                         <div>Radius: {fence.radius_meters} meters</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                  No geofences established for this project.
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
