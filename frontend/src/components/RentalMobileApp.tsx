"use client";

import React, { useState, useEffect } from "react";
import { 
  Home, Search, MapPin, Map, Navigation, 
  Loader2, BellRing, ChevronLeft, CreditCard, 
  Truck, IndianRupee, Clock, Smartphone
} from "lucide-react";

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

export default function RentalMobileApp({ userId = 1, projectId = 1 }: { userId?: number, projectId?: number }) {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("home"); // home, map, profile
  
  // Modals & Sheets
  const [bookingSheet, setBookingSheet] = useState<Equipment | null>(null);
  const [paymentSheet, setPaymentSheet] = useState<{ booking_id: number, amount: number } | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  
  const [trackingData, setTrackingData] = useState<{lat: number, lng: number, speed: number, status: string, booking_id: number, equipment_id: number} | null>(null);
  const [notifications, setNotifications] = useState<{id: number, title: string, msg: string}[]>([]);
  
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

  const addNotification = (title: string, msg: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, msg }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const handleBook = async (equipmentId: number) => {
    if (!bookingSheet) return;
    try {
      const amount = bookingSheet.daily_rate * 2;
      const payload = {
        user_id: userId,
        equipment_id: equipmentId,
        project_id: projectId,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000 * 2).toISOString(),
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
        setBookingSheet(null);
        setPaymentSheet({ booking_id: data.booking_id, amount });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePayment = async () => {
    if (!paymentSheet) return;
    setPaymentLoading(true);
    try {
      const payload = {
        booking_id: paymentSheet.booking_id,
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
        addNotification("Order Confirmed", `Payment of ₹${paymentSheet.amount} successful.`);
        setTimeout(() => {
          addNotification("Equipment Dispatched", `Your equipment is en route.`);
        }, 2000);

        setPaymentSheet(null);
        setActiveBookingId(data.booking_id);
        setActiveTab("map"); // auto switch to map view
        fetchEquipment();
      }
    } catch (e) {
      console.error(e);
    }
    setPaymentLoading(false);
  };

  const handleComplete = async (bookingId: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:3001/rental/complete/${bookingId}`, { method: "POST" });
      if (res.ok) {
        setActiveBookingId(null);
        setTrackingData(null);
        setActiveTab("home");
        fetchEquipment();
        
        addNotification("Rental Completed", `Equipment returned successfully.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", padding: "2rem", background: "#0a0a0c" }}>
      
      {/* PHONE MOCKUP FRAME */}
      <div style={{
        width: "375px", height: "812px", background: "#ffffff", borderRadius: "40px", 
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 10px #1f2937",
        position: "relative", overflow: "hidden", display: "flex", flexDirection: "column"
      }}>
        
        {/* NOTCH / STATUS BAR */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40px", zIndex: 50, display: "flex", justifyContent: "center" }}>
          <div style={{ width: "150px", height: "25px", background: "#1f2937", borderBottomLeftRadius: "15px", borderBottomRightRadius: "15px" }} />
          {/* Status bar icons mock */}
          <div style={{ position: "absolute", right: 20, top: 12, display: "flex", gap: "5px", color: activeTab === 'map' ? '#fff' : '#000' }}>
            <div style={{ width: 16, height: 10, background: "currentColor", borderRadius: 2 }} />
          </div>
          <div style={{ position: "absolute", left: 25, top: 12, fontSize: "12px", fontWeight: "bold", color: activeTab === 'map' ? '#fff' : '#000' }}>9:41</div>
        </div>

        {/* IN-APP NOTIFICATIONS (iOS Style) */}
        <div style={{ position: "absolute", top: 50, left: 10, right: 10, zIndex: 100, display: "flex", flexDirection: "column", gap: "10px" }}>
          {notifications.map(n => (
            <div key={n.id} style={{ 
              background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", padding: "1rem", borderRadius: "16px", 
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "12px",
              animation: "slideDown 0.3s ease-out forwards"
            }}>
              <BellRing size={20} color="#6366f1" />
              <div>
                <div style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#111" }}>{n.title}</div>
                <div style={{ fontSize: "0.75rem", color: "#666" }}>{n.msg}</div>
              </div>
            </div>
          ))}
        </div>

        {/* --- APP CONTENT AREA --- */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingTop: "50px", paddingBottom: "80px", background: "#f9fafb" }}>
          
          {/* TAB: HOME / FLEET */}
          {activeTab === "home" && (
            <div style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111", margin: 0 }}>Discover</h1>
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: 0 }}>Rent equipment instantly</p>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Search size={20} color="#4b5563" />
                </div>
              </div>

              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><Loader2 className="animate-spin text-indigo-500" /></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {equipmentList.map(eq => (
                    <div key={eq.id} style={{ 
                      background: "#fff", borderRadius: "16px", padding: "1rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                      display: "flex", gap: "1rem", alignItems: "center"
                    }} onClick={() => eq.status === "available" && setBookingSheet(eq)}>
                      <div style={{ width: 80, height: 80, borderRadius: "12px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Truck size={40} color={eq.status === "available" ? "#6366f1" : "#9ca3af"} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "bold", color: "#111" }}>{eq.name}</h3>
                        </div>
                        <p style={{ margin: "2px 0 8px 0", fontSize: "0.75rem", color: "#6b7280" }}>{eq.category}</p>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#111" }}>₹{eq.hourly_rate}/hr</div>
                          {eq.status === "available" ? (
                            <span style={{ fontSize: "0.7rem", padding: "2px 8px", background: "#d1fae5", color: "#065f46", borderRadius: "12px", fontWeight: "bold" }}>AVAILABLE</span>
                          ) : (
                            <span style={{ fontSize: "0.7rem", padding: "2px 8px", background: "#fee2e2", color: "#991b1b", borderRadius: "12px", fontWeight: "bold" }}>RENTED</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: MAP TRACKING */}
          {activeTab === "map" && (
            <div style={{ width: "100%", height: "100%", position: "relative", background: "#111" }}>
              {activeBookingId && trackingData ? (
                <>
                  {/* Map Grid Background */}
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                  
                  {/* Radar Sweep Effect */}
                  <div style={{ 
                    position: "absolute", top: "50%", left: "50%", width: "200%", height: "200%", marginLeft: "-100%", marginTop: "-100%",
                    background: "conic-gradient(from 0deg, transparent 70%, rgba(99, 102, 241, 0.3) 100%)",
                    transformOrigin: "50% 50%", animation: "spin 4s infinite linear"
                  }} />

                  {/* Vehicle Blip */}
                  <div style={{ 
                    position: "absolute", 
                    top: `calc(50% + ${trackingData.lat * 5000 % 150}px)`, 
                    left: `calc(50% + ${trackingData.lng * 5000 % 150}px)`, 
                    transition: "all 1s linear" 
                  }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 15px #6366f1", zIndex: 2 }} />
                      <div style={{ position: "absolute", top: -5, left: -5, width: 24, height: 24, borderRadius: "50%", border: "2px solid #6366f1", animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }} />
                      
                      <div style={{ position: "absolute", top: -35, left: -40, background: "rgba(255,255,255,0.9)", padding: "4px 8px", borderRadius: "8px", fontSize: "0.7rem", fontWeight: "bold", color: "#111", whiteSpace: "nowrap", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                        {trackingData.speed.toFixed(0)} km/h
                      </div>
                    </div>
                  </div>

                  {/* Destination */}
                  <div style={{ position: "absolute", top: "30%", left: "60%" }}>
                    <MapPin size={28} color="#ef4444" fill="#fee2e2" />
                  </div>

                  {/* Floating Action Sheet */}
                  <div style={{ position: "absolute", bottom: "1rem", left: "1rem", right: "1rem", background: "#fff", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <div>
                        <div style={{ fontSize: "1rem", fontWeight: "bold", color: "#111" }}>En Route to Site</div>
                        <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>ETA: 14 mins</div>
                      </div>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Navigation size={20} color="#4f46e5" />
                      </div>
                    </div>
                    
                    <button 
                      style={{ width: "100%", padding: "1rem", borderRadius: "12px", background: "#111", color: "#fff", fontWeight: "bold", border: "none" }}
                      onClick={() => handleComplete(activeBookingId)}
                    >
                      End Rental
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#fff", background: "#111" }}>
                  <Map size={48} opacity={0.5} style={{ marginBottom: "1rem" }} />
                  <p style={{ color: "#9ca3af" }}>No active rentals to track</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* BOTTOM NAVIGATION BAR */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-around", alignItems: "center", paddingBottom: "15px", zIndex: 50 }}>
          <button onClick={() => setActiveTab('home')} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", background: "none", border: "none", color: activeTab === 'home' ? '#4f46e5' : '#9ca3af' }}>
            <Home size={24} />
            <span style={{ fontSize: "0.65rem", fontWeight: "bold" }}>Store</span>
          </button>
          <button onClick={() => setActiveTab('map')} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", background: "none", border: "none", color: activeTab === 'map' ? '#4f46e5' : '#9ca3af' }}>
            <Map size={24} />
            <span style={{ fontSize: "0.65rem", fontWeight: "bold" }}>Track</span>
          </button>
        </div>

        {/* BOOKING BOTTOM SHEET */}
        {bookingSheet && !paymentSheet && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ background: "#fff", borderTopLeftRadius: "24px", borderTopRightRadius: "24px", padding: "1.5rem", paddingBottom: "3rem", animation: "slideUp 0.3s ease-out" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "bold", color: "#111" }}>Confirm Details</h3>
                <button style={{ background: "#f3f4f6", border: "none", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setBookingSheet(null)}>
                  <ChevronLeft size={16} />
                </button>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", background: "#f9fafb", padding: "1rem", borderRadius: "16px" }}>
                <div style={{ width: 60, height: 60, borderRadius: "12px", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Truck size={30} color="#4b5563" />
                </div>
                <div>
                  <div style={{ fontWeight: "bold", color: "#111" }}>{bookingSheet.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{bookingSheet.owner_name}</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", color: "#4b5563", fontSize: "0.9rem" }}>
                <span>Rental Duration</span>
                <span style={{ fontWeight: "bold", color: "#111" }}>2 Days</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", color: "#4b5563", fontSize: "0.9rem" }}>
                <span>Total Amount</span>
                <span style={{ fontWeight: "bold", color: "#111", fontSize: "1.25rem" }}>₹{bookingSheet.daily_rate * 2}</span>
              </div>

              <button 
                style={{ width: "100%", padding: "1rem", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "16px", fontWeight: "bold", fontSize: "1rem" }}
                onClick={() => handleBook(bookingSheet.id)}
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* PAYMENT BOTTOM SHEET */}
        {paymentSheet && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ background: "#fff", borderTopLeftRadius: "24px", borderTopRightRadius: "24px", padding: "1.5rem", paddingBottom: "3rem", animation: "slideUp 0.3s ease-out" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "bold", color: "#111" }}>Payment</h3>
                <button style={{ background: "#f3f4f6", border: "none", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setPaymentSheet(null)}>
                  <ChevronLeft size={16} />
                </button>
              </div>

              <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#111" }}>₹{paymentSheet.amount}</div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Total payable amount</div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "bold", color: "#4b5563", marginBottom: "0.5rem" }}>Card Number</label>
                <input 
                  type="text" placeholder="4111 2222 3333 4444" 
                  style={{ width: "100%", padding: "1rem", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "1rem" }}
                  value={cardDetails.number} onChange={e => setCardDetails({...cardDetails, number: e.target.value})}
                />
              </div>

              <button 
                style={{ width: "100%", padding: "1rem", background: "#111", color: "#fff", border: "none", borderRadius: "16px", fontWeight: "bold", fontSize: "1rem", display: "flex", justifyContent: "center", alignItems: "center" }}
                onClick={handlePayment} disabled={paymentLoading}
              >
                {paymentLoading ? <Loader2 size={24} className="animate-spin" /> : `Pay ₹${paymentSheet.amount}`}
              </button>
            </div>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
