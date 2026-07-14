import json
import random
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select
from pydantic import BaseModel

from database import get_session, Equipment, RentalBooking

router = APIRouter(prefix="/rental", tags=["Equipment Rental"])

# Pydantic models for request bodies
class EquipmentCreate(BaseModel):
    name: str
    category: str
    hourly_rate: float
    daily_rate: float
    owner_name: str
    specs_json: str = "{}"

class BookingCreate(BaseModel):
    user_id: int
    equipment_id: int
    project_id: int
    start_date: str
    end_date: str
    total_cost: float
    notes: Optional[str] = None

class PaymentPayload(BaseModel):
    booking_id: int
    card_number: str
    expiry: str
    cvv: str

# --- Equipment Management ---

@router.get("/equipment", response_model=List[Equipment])
def list_equipment(session: Session = Depends(get_session)):
    return session.exec(select(Equipment)).all()

@router.post("/equipment", response_model=Equipment)
def add_equipment(eq: EquipmentCreate, session: Session = Depends(get_session)):
    new_eq = Equipment(
        name=eq.name,
        category=eq.category,
        hourly_rate=eq.hourly_rate,
        daily_rate=eq.daily_rate,
        owner_name=eq.owner_name,
        specs_json=eq.specs_json
    )
    session.add(new_eq)
    session.commit()
    session.refresh(new_eq)
    return new_eq

# --- Booking & Payment ---

@router.post("/book")
def create_booking(booking: BookingCreate, session: Session = Depends(get_session)):
    eq = session.get(Equipment, booking.equipment_id)
    if not eq or eq.status != "available":
        raise HTTPException(status_code=400, detail="Equipment not available")

    # Change equipment status
    eq.status = "rented"
    session.add(eq)
    
    new_booking = RentalBooking(
        user_id=booking.user_id,
        equipment_id=booking.equipment_id,
        project_id=booking.project_id,
        start_date=booking.start_date,
        end_date=booking.end_date,
        total_cost=booking.total_cost,
        notes=booking.notes
    )
    session.add(new_booking)
    session.commit()
    session.refresh(new_booking)
    
    return {"message": "Booking created. Awaiting payment.", "booking_id": new_booking.id}

@router.post("/pay")
def process_payment(payment: PaymentPayload, session: Session = Depends(get_session)):
    booking = session.get(RentalBooking, payment.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Mock payment processing logic
    if payment.card_number == "0000000000000000":
        # Simulate payment failure
        booking.payment_status = "failed"
        session.add(booking)
        session.commit()
        raise HTTPException(status_code=400, detail="Payment declined")
        
    booking.payment_status = "paid"
    booking.status = "active"
    session.add(booking)
    session.commit()
    
    return {"message": "Payment successful", "booking_id": booking.id}

# --- Live Tracking ---

@router.get("/tracking/{booking_id}")
def get_live_tracking(booking_id: int, session: Session = Depends(get_session)):
    booking = session.get(RentalBooking, booking_id)
    if not booking or booking.status != "active":
        raise HTTPException(status_code=404, detail="Active booking not found")
        
    # Generate mock GPS coordinates that "move" based on current time
    # This creates a circular/wandering pattern around a base point for demo purposes
    t = datetime.datetime.utcnow().timestamp()
    base_lat = 28.6139  # New Delhi
    base_lng = 77.2090
    
    import math
    current_lat = base_lat + (math.sin(t / 10.0) * 0.005)
    current_lng = base_lng + (math.cos(t / 10.0) * 0.005)
    
    # Calculate a mock speed
    speed = 20.0 + (math.sin(t) * 5)
    
    return {
        "booking_id": booking.id,
        "equipment_id": booking.equipment_id,
        "lat": current_lat,
        "lng": current_lng,
        "speed": speed,
        "status": "en_route"
    }

# --- Invoice ---

@router.get("/invoice/{booking_id}")
def get_invoice(booking_id: int, session: Session = Depends(get_session)):
    booking = session.get(RentalBooking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    eq = session.get(Equipment, booking.equipment_id)
    
    return {
        "invoice_number": f"INV-{booking.id:06d}",
        "date": datetime.datetime.utcnow().strftime("%Y-%m-%d"),
        "customer_id": booking.user_id,
        "project_id": booking.project_id,
        "equipment": {
            "name": eq.name,
            "category": eq.category,
            "daily_rate": eq.daily_rate
        },
        "rental_period": {
            "start": booking.start_date,
            "end": booking.end_date
        },
        "subtotal": booking.total_cost,
        "tax": booking.total_cost * 0.18,
        "total": booking.total_cost * 1.18,
        "payment_status": booking.payment_status
    }

@router.post("/complete/{booking_id}")
def complete_booking(booking_id: int, session: Session = Depends(get_session)):
    booking = session.get(RentalBooking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking.status = "completed"
    
    eq = session.get(Equipment, booking.equipment_id)
    if eq:
        eq.status = "available"
        session.add(eq)
        
    session.add(booking)
    session.commit()
    return {"message": "Rental completed successfully"}
