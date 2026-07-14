"use client";

import React, { useState, useEffect } from "react";
import { Truck, CheckCircle, Map, Navigation, Loader2, BellRing, Mail, ChevronRight, Activity, Calendar, IndianRupee, CreditCard, Receipt } from "lucide-react";

interface Equipment {
  id: number;
  name: string;
  category: string;
  hourly_rate: number;
  daily_rate: number;
  owner_name: string;
  status: string;
  specs_json: string;
}

export default function EquipmentRental({ userId = 1, projectId = 1 }: { userId?: number, projectId?: number }) {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & Views
  const [bookingModal, setBookingModal] = useState<Equipment | null>(null);
  const [paymentModal, setPaymentModal] = useState<{ booking_id: number, amount: number } | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  const [invoice, setInvoice] = useState<any | null>(null);
  
  // Tracking
  const [trackingData, setTrackingData] = useState<{lat: number, lng: number, speed: number, status: string, booking_id: number, equipment_id: number} | null>(null);
  
  // Notifications
  const [notifications, setNotifications] = useState<{id: number, type: "push" | "email", title: string, msg: string}[]>([]);

  // Payment Form
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" });
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:3001/rental/equipment");
      if (res.ok) {
        const data = await res.json();
        setEquipmentList(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Real-time tracking loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeBookingId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://127.0.0.1:3001/rental/tracking/${activeBookingId}`);
          if (res.ok) {
            const data = await res.json();
            setTrackingData(data);
          }
        } catch (e) {
          console.error(e);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeBookingId]);

  const addNotification = (type: "push" | "email", title: string, msg: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, title, msg }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleBook = async (equipmentId: number) => {
    if (!bookingModal) return;
    try {
      const amount = bookingModal.daily_rate * 2;
      const payload = {
        user_id: userId,
        equipment_id: equipmentId,
        project_id: projectId,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days later
        total_cost: amount,
        notes: "Urgent deployment"
      };

      const res = await fetch("http://127.0.0.1:3001/rental/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        addNotification("email", "SMTP: Booking Initiated", `Your booking is initiated. Awaiting payment.`);
        setBookingModal(null);
        // Show Payment Modal
        setPaymentModal({ booking_id: data.booking_id, amount });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = async (bookingId: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:3001/rental/complete/${bookingId}`, { method: "POST" });
      if (res.ok) {
        setActiveBookingId(null);
        setTrackingData(null);
        setInvoice(null);
        fetchEquipment();
        
        addNotification("push", "Push Notification", `Equipment has been returned successfully.`);
        setTimeout(() => {
          addNotification("email", "SMTP: Rental Completed", `Your rental period has ended. Thank you!`);
        }, 1000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePayment = async () => {
    if (!paymentModal) return;
    setPaymentLoading(true);
    try {
      const payload = {
        booking_id: paymentModal.booking_id,
        card_number: cardDetails.number || "1111222233334444",
        expiry: cardDetails.expiry || "12/25",
        cvv: cardDetails.cvv || "123"
      };
      
      const res = await fetch("http://127.0.0.1:3001/rental/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        addNotification("email", "SMTP: Order Placed", `Your equipment order is placed successfully.`);
        setTimeout(() => {
          addNotification("email", "SMTP: Invoice Generated", `Invoice for ₹${paymentModal.amount} generated.`);
        }, 1500);
        setTimeout(() => {
          addNotification("push", "Push Notification", `Equipment is en route to site.`);
        }, 3000);

        setPaymentModal(null);
        setActiveBookingId(data.booking_id);
        fetchEquipment();
        fetchInvoice(data.booking_id);
      } else {
        alert("Payment failed");
      }
    } catch (e) {
      console.error(e);
    }
    setPaymentLoading(false);
  };

  const fetchInvoice = async (bookingId: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:3001/rental/invoice/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setInvoice(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      
      {/* Toast Notifications */}
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: "10px" }}>
        {notifications.map(n => (
          <div key={n.id} style={{ 
            background: n.type === "email" ? "rgba(16, 185, 129, 0.9)" : "rgba(59, 130, 246, 0.9)", 
            color: "white", padding: "1rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)", animation: "slideIn 0.3s ease-out forwards", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)"
          }}>
            {n.type === "email" ? <Mail size={24} /> : <BellRing size={24} />}
            <div>
              <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{n.title}</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>{n.msg}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: activeBookingId ? "1fr 1fr" : "1fr", gap: "1.5rem" }}>
        
        {/* EQUIPMENT CATALOG */}
        <div className="glass-panel" style={{ padding: "1.5rem", maxHeight: "85vh", overflowY: "auto" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem", margin: "0 0 1.5rem 0", color: "var(--accent-cyan)" }}>
            <Truck size={24} /> Equipment Fleet
          </h2>
          
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><Loader2 size={32} className="animate-spin text-cyan" /></div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: activeBookingId ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {equipmentList.map(eq => {
                let specs = {};
                try {
                  specs = JSON.parse(eq.specs_json || '{}');
                } catch(e) {}
                
                return (
                  <div key={eq.id} style={{ 
                    background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", 
                    borderRadius: "8px", overflow: "hidden", transition: "transform 0.2s"
                  }}>
                    <div style={{ background: "rgba(0,0,0,0.4)", padding: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", borderBottom: "1px solid var(--border-color)" }}>
                      <Truck size={48} color={eq.status === "available" ? "var(--accent-cyan)" : "var(--text-muted)"} />
                    </div>
                    <div style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{eq.name}</h3>
                        <span style={{ 
                          fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: "12px", 
                          background: eq.status === "available" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                          color: eq.status === "available" ? "var(--accent-emerald)" : "var(--accent-red)"
                        }}>
                          {eq.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>Vendor: {eq.owner_name}</div>
                      
                      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem" }}><IndianRupee size={14} className="text-cyan" /> {eq.hourly_rate}/hr</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem" }}><Calendar size={14} className="text-emerald" /> {eq.daily_rate}/day</div>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.5rem" }}>
                        {Object.entries(specs).map(([k, v]) => (
                          <span key={k} style={{ fontSize: "0.7rem", background: "rgba(255,255,255,0.05)", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>
                            {k}: {v as string}
                          </span>
                        ))}
                      </div>

                      <button 
                        className="btn btn-primary" 
                        style={{ width: "100%", justifyContent: "center", padding: "0.8rem", background: eq.status === "available" ? "var(--accent-cyan)" : "var(--bg-secondary)", color: eq.status === "available" ? "#000" : "var(--text-muted)" }}
                        disabled={eq.status !== "available"}
                        onClick={() => setBookingModal(eq)}
                      >
                        {eq.status === "available" ? "Book Equipment" : "Currently Unavailable"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* LIVE TRACKING MAP & INVOICE VIEW */}
        {activeBookingId && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {trackingData && (
              <div className="glass-panel" style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}>
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem", margin: 0, color: "var(--accent-emerald)" }}>
                    <Map size={24} /> Live GPS Tracking
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--accent-emerald)" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-emerald)", animation: "pulse 2s infinite" }} />
                      EN ROUTE
                    </div>
                    <button className="btn btn-secondary" style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }} onClick={() => handleComplete(activeBookingId)}>
                      Complete Rental
                    </button>
                  </div>
                </div>
                
                {/* Mock Map UI */}
                <div style={{ flex: 1, position: "relative", background: "#0a0a0c", overflow: "hidden", minHeight: "350px" }}>
                  
                  {/* Map Grid Background */}
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                  
                  {/* Radar Sweep Effect */}
                  <div style={{ 
                    position: "absolute", top: "50%", left: "50%", width: "200%", height: "200%", marginLeft: "-100%", marginTop: "-100%",
                    background: "conic-gradient(from 0deg, transparent 70%, rgba(16, 185, 129, 0.2) 100%)",
                    transformOrigin: "50% 50%", animation: "spin 4s infinite linear"
                  }} />

                  {/* Dynamic Vehicle Blip */}
                  <div style={{ 
                    position: "absolute", 
                    top: `calc(50% + ${trackingData.lat * 5000 % 100}px)`, 
                    left: `calc(50% + ${trackingData.lng * 5000 % 100}px)`, 
                    transition: "all 1s linear" 
                  }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--accent-emerald)", boxShadow: "0 0 15px var(--accent-emerald)", zIndex: 2 }} />
                      <div style={{ position: "absolute", top: -4, left: -4, width: 24, height: 24, borderRadius: "50%", border: "2px solid var(--accent-emerald)", animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }} />
                      
                      {/* Tooltip */}
                      <div style={{ position: "absolute", top: -40, left: -60, background: "rgba(0,0,0,0.8)", border: "1px solid var(--accent-emerald)", padding: "0.4rem 0.8rem", borderRadius: "4px", fontSize: "0.75rem", whiteSpace: "nowrap", display: "flex", flexDirection: "column" }}>
                        <strong style={{ color: "var(--accent-emerald)" }}>ID: #{trackingData.equipment_id}</strong>
                        <span>Speed: {trackingData.speed.toFixed(1)} km/h</span>
                      </div>
                    </div>
                  </div>

                  {/* Site Destination Pin */}
                  <div style={{ position: "absolute", top: "45%", left: "55%" }}>
                    <Navigation size={24} color="var(--accent-cyan)" style={{ transform: "rotate(180deg)" }} />
                    <div style={{ position: "absolute", top: 25, left: -30, fontSize: "0.7rem", color: "var(--accent-cyan)", fontWeight: "bold" }}>SITE DEST</div>
                  </div>
                </div>

                <div style={{ padding: "1.5rem", background: "rgba(16, 185, 129, 0.05)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Current Coordinates</div>
                      <div style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>{trackingData.lat.toFixed(6)}, {trackingData.lng.toFixed(6)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ETA</div>
                      <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>14 Mins</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {invoice && (
              <div className="glass-panel" style={{ padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Receipt size={20} /> Booking Invoice
                </h3>
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "8px", fontFamily: "monospace" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
                    <div>
                      <strong style={{ color: "var(--accent-cyan)" }}>AEROTWIN EQUIPMENTS</strong>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Invoice #: {invoice.invoice_number}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Date: {invoice.date}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong style={{ color: "var(--accent-emerald)" }}>PAID</strong>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                    <strong>{invoice.equipment.name}</strong> ({invoice.equipment.category})
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                    <span>Rate: ₹{invoice.equipment.daily_rate}/day x 2 days</span>
                    <span>₹{invoice.subtotal}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem", borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
                    <span>GST (18%)</span>
                    <span>₹{invoice.tax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: "bold" }}>
                    <span>TOTAL</span>
                    <span>₹{invoice.total.toFixed(2)}</span>
                  </div>
                </div>
                <button className="btn btn-secondary" style={{ width: "100%", marginTop: "1rem", display: "flex", justifyContent: "center" }} onClick={() => window.print()}>
                  Print Invoice
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOOKING CONFIRMATION MODAL */}
      {bookingModal && !paymentModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div className="glass-panel" style={{ width: "400px", padding: "2rem" }}>
            <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.25rem", color: "var(--text-primary)" }}>Confirm Rental</h3>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--accent-cyan)" }}>{bookingModal.name}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>Total Estimated Cost (2 Days):</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.2rem" }}><IndianRupee size={20} />{bookingModal.daily_rate * 2}</div>
            </div>
            
            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setBookingModal(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", background: "var(--accent-cyan)", color: "#000" }} onClick={() => handleBook(bookingModal.id)}>Proceed to Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT GATEWAY MODAL */}
      {paymentModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(5px)" }}>
          <div style={{ background: "#ffffff", borderRadius: "12px", width: "400px", padding: "2rem", color: "#111" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "bold" }}>Secure Payment</h3>
              <CreditCard size={24} color="#6366f1" />
            </div>
            
            <div style={{ background: "#f3f4f6", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Amount to Pay</div>
              <div style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#111827" }}>₹ {paymentModal.amount.toFixed(2)}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "0.3rem" }}>Card Number</label>
                <input 
                  type="text" placeholder="4111 2222 3333 4444" 
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                  value={cardDetails.number} onChange={e => setCardDetails({...cardDetails, number: e.target.value})}
                />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "0.3rem" }}>Expiry Date</label>
                  <input 
                    type="text" placeholder="MM/YY" 
                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                    value={cardDetails.expiry} onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "0.3rem" }}>CVV</label>
                  <input 
                    type="password" placeholder="***" 
                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                    value={cardDetails.cvv} onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button 
                style={{ flex: 1, padding: "0.75rem", borderRadius: "6px", background: "#f3f4f6", color: "#4b5563", fontWeight: "bold", border: "none", cursor: "pointer" }}
                onClick={() => setPaymentModal(null)}
              >
                Cancel
              </button>
              <button 
                style={{ flex: 2, padding: "0.75rem", borderRadius: "6px", background: "#6366f1", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}
                onClick={handlePayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? <Loader2 size={20} className="animate-spin" /> : `Pay ₹${paymentModal.amount}`}
              </button>
            </div>
            
            <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.7rem", color: "#9ca3af" }}>
              🔒 Secured by AeroTwin Payments
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}} />
    </div>
  );
}
