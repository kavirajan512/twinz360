from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select
from typing import List, Dict, Any
import asyncio
import json
import random
from database import get_session, Equipment, EquipmentTwinStatus, EquipmentLocation, EquipmentSensorData

router = APIRouter(prefix="/equipment_twin", tags=["equipment_twin"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

# Simulate and Broadcast Telemetry
async def telemetry_simulator():
    """Background task to simulate live telemetry and pathfinding for equipment."""
    while True:
        try:
            # We don't query DB every second to save load, we just broadcast dynamic dummy data 
            # based on a predefined set of active machines. 
            # In a real app, we'd query the DB and update positions.
            
            # Let's broadcast simulated telemetry for a few standard machines
            machines = [
                {"id": 1, "type": "Excavator", "task": "Foundation Digging", "phase": "Phase 1"},
                {"id": 2, "type": "Bulldozer", "task": "Site Grading", "phase": "Phase 1"},
                {"id": 3, "type": "Mobile Crane", "task": "Steel Erection", "phase": "Phase 2"},
                {"id": 4, "type": "Tower Crane", "task": "Material Lifting", "phase": "Phase 2"},
            ]
            
            payload = []
            for m in machines:
                # Randomize small movements
                payload.append({
                    "id": m["id"],
                    "type": m["type"],
                    "task": m["task"],
                    "phase": m["phase"],
                    "telemetry": {
                        "fuel": round(random.uniform(40, 95), 1),
                        "rpm": random.randint(1200, 2200),
                        "temp": round(random.uniform(85, 105), 1),
                        "health": round(random.uniform(80, 100), 1),
                        "utilization": round(random.uniform(50, 90), 1),
                    },
                    "location": {
                        # Add a small random jitter to simulate movement
                        "x": random.uniform(-10, 10),
                        "z": random.uniform(-10, 10),
                        "rotation": random.uniform(0, 3.14)
                    }
                })
                
            await manager.broadcast(json.dumps({"type": "telemetry_update", "data": payload}))
        except Exception as e:
            print("Telemetry simulation error:", e)
        
        await asyncio.sleep(2)  # Update every 2 seconds

# A global variable to store the background task
background_task = None

@router.on_event("startup")
async def startup_event():
    global background_task
    background_task = asyncio.create_task(telemetry_simulator())

@router.on_event("shutdown")
async def shutdown_event():
    if background_task:
        background_task.cancel()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle client messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.get("/list")
def list_equipment(session: Session = Depends(get_session)):
    equip = session.exec(select(Equipment)).all()
    # If empty, generate some seeds
    if not equip:
        seeds = [
            Equipment(name="CAT 320", category="Excavator", hourly_rate=150, daily_rate=1200, owner_name="BuildTech Rentals"),
            Equipment(name="Deere 850L", category="Bulldozer", hourly_rate=180, daily_rate=1400, owner_name="BuildTech Rentals"),
            Equipment(name="Liebherr LTM", category="Mobile Crane", hourly_rate=300, daily_rate=2400, owner_name="HeavyLifts Inc"),
        ]
        for s in seeds:
            session.add(s)
        session.commit()
        equip = session.exec(select(Equipment)).all()
        
        # Add twin status for seeds
        for e in equip:
            session.add(EquipmentTwinStatus(equipment_id=e.id, fuel_level=85.0, health_score=98.0, maintenance_status="Healthy"))
            session.add(EquipmentLocation(equipment_id=e.id, x=random.uniform(-5, 5), z=random.uniform(-5, 5)))
        session.commit()
    
    return equip

@router.get("/{equipment_id}/status")
def get_equipment_status(equipment_id: int, session: Session = Depends(get_session)):
    status = session.exec(select(EquipmentTwinStatus).where(EquipmentTwinStatus.equipment_id == equipment_id)).first()
    loc = session.exec(select(EquipmentLocation).where(EquipmentLocation.equipment_id == equipment_id)).first()
    return {"status": status, "location": loc}

@router.post("/{equipment_id}/maintenance")
def schedule_maintenance(equipment_id: int, session: Session = Depends(get_session)):
    status = session.exec(select(EquipmentTwinStatus).where(EquipmentTwinStatus.equipment_id == equipment_id)).first()
    if status:
        status.maintenance_status = "Scheduled"
        session.add(status)
        session.commit()
        return {"success": True, "message": "Maintenance scheduled successfully"}
    return {"success": False, "message": "Equipment not found"}
