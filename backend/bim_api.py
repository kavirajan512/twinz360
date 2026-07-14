"""
AeroTwin 4D/5D BIM & Facility Management API — Phase 12
BIM model management, facility systems telemetry
"""
import random
import datetime
import json
from fastapi import APIRouter, Depends, HTTPException, Form
from sqlmodel import Session, select
from typing import Optional, List
from database import get_session, BIMModel, FacilitySystem

router = APIRouter(prefix="/bim", tags=["4D/5D BIM & Facility"])

@router.get("/models/{project_id}")
def get_bim_model(project_id: int, session: Session = Depends(get_session)):
    model = session.exec(select(BIMModel).where(BIMModel.project_id == project_id)).first()
    
    if not model:
        model = BIMModel(
            project_id=project_id,
            file_path="assets/models/default_building.glb"
        )
        session.add(model)
        session.commit()
        session.refresh(model)
        
    return model

@router.get("/facility/systems/{project_id}")
def get_facility_systems(project_id: int, session: Session = Depends(get_session)):
    systems = session.exec(select(FacilitySystem).where(FacilitySystem.project_id == project_id)).all()
    
    if not systems:
        # Seed dummy systems
        sys_types = [
            {"type": "HVAC", "name": "Central AC Unit 1", "zone": "Roof"},
            {"type": "Fire_Alarm", "name": "Main Panel", "zone": "Ground Floor"},
            {"type": "Energy", "name": "Smart Meter 1", "zone": "Basement"},
            {"type": "Elevator", "name": "Lift A", "zone": "Core"}
        ]
        
        for s in sys_types:
            readings = {}
            if s["type"] == "HVAC":
                readings = {"temp_c": 22.5, "humidity": 45, "filter_status": "Clean"}
            elif s["type"] == "Fire_Alarm":
                readings = {"smoke_detected": False, "battery": "OK"}
            elif s["type"] == "Energy":
                readings = {"current_kw": 145.2, "daily_kwh": 3450}
            elif s["type"] == "Elevator":
                readings = {"current_floor": 4, "door_status": "Closed"}
                
            sys = FacilitySystem(
                project_id=project_id,
                system_type=s["type"],
                name=s["name"],
                zone=s["zone"],
                readings_json=json.dumps(readings)
            )
            session.add(sys)
            
        session.commit()
        systems = session.exec(select(FacilitySystem).where(FacilitySystem.project_id == project_id)).all()
        
    # Simulate dynamic readings
    for sys in systems:
        readings = json.loads(sys.readings_json)
        if sys.system_type == "HVAC":
            readings["temp_c"] = round(random.uniform(21.0, 24.0), 1)
        elif sys.system_type == "Energy":
            readings["current_kw"] = round(random.uniform(120.0, 180.0), 1)
        sys.readings_json = json.dumps(readings)
        sys.updated_at = datetime.datetime.utcnow()
        session.add(sys)
        
    session.commit()
    
    return systems
