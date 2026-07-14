"""
AeroTwin Smart Helmet & Worker Tracking API — Phase 9
IoT sensor telemetry, vitals, SOS, worker tracking
"""
import random
import datetime
from fastapi import APIRouter, Depends, HTTPException, Form
from sqlmodel import Session, select
from typing import Optional, List
from database import get_session, HelmetSensor, Employee

router = APIRouter(prefix="/helmets", tags=["Smart Helmet"])

@router.get("/workers")
def list_workers_helmets(project_id: Optional[int] = None, session: Session = Depends(get_session)):
    query = select(Employee).where(Employee.status == "active")
    if project_id:
        query = query.where(Employee.project_id == project_id)
    employees = session.exec(query).all()
    
    results = []
    for emp in employees:
        sensor = session.exec(select(HelmetSensor).where(HelmetSensor.employee_id == emp.id)).first()
        if not sensor:
            # Seed a dummy sensor for this employee if none exists
            sensor = HelmetSensor(
                employee_id=emp.id,
                heart_rate=random.randint(70, 90),
                body_temp=round(random.uniform(36.5, 37.2), 1),
                gas_level_ppm=round(random.uniform(0.0, 5.0), 1),
                battery_pct=random.randint(60, 100),
                zone=f"Zone {random.choice(['A', 'B', 'C'])}",
                status="safe"
            )
            session.add(sensor)
            session.commit()
            session.refresh(sensor)
            
        results.append({
            "employee_id": emp.id,
            "name": emp.name,
            "role": emp.role,
            "sensor": sensor
        })
        
    return results

@router.get("/worker/{emp_id}/vitals")
def get_worker_vitals(emp_id: int, session: Session = Depends(get_session)):
    sensor = session.exec(select(HelmetSensor).where(HelmetSensor.employee_id == emp_id)).first()
    if not sensor:
        raise HTTPException(404, "Helmet sensor not found for worker")
    
    # Simulate live updates
    sensor.heart_rate += random.randint(-5, 5)
    sensor.heart_rate = max(60, min(160, sensor.heart_rate))
    
    sensor.body_temp += random.uniform(-0.2, 0.2)
    sensor.body_temp = max(36.0, min(39.5, sensor.body_temp))
    
    sensor.updated_at = datetime.datetime.utcnow()
    
    # Update status based on thresholds
    if sensor.sos_active:
        sensor.status = "sos"
    elif sensor.heart_rate > 140 or sensor.body_temp > 38.5 or sensor.gas_level_ppm > 50:
        sensor.status = "danger"
    elif sensor.heart_rate > 120 or sensor.body_temp > 37.8 or sensor.gas_level_ppm > 20:
        sensor.status = "warning"
    else:
        sensor.status = "safe"
        
    session.add(sensor)
    session.commit()
    session.refresh(sensor)
    
    return sensor

@router.post("/sos")
def trigger_sos(employee_id: int = Form(...), session: Session = Depends(get_session)):
    sensor = session.exec(select(HelmetSensor).where(HelmetSensor.employee_id == employee_id)).first()
    if not sensor:
        raise HTTPException(404, "Helmet sensor not found")
        
    sensor.sos_active = True
    sensor.status = "sos"
    sensor.updated_at = datetime.datetime.utcnow()
    session.add(sensor)
    session.commit()
    
    return {"message": "SOS alert triggered", "sensor": sensor}

@router.post("/sos/resolve")
def resolve_sos(employee_id: int = Form(...), session: Session = Depends(get_session)):
    sensor = session.exec(select(HelmetSensor).where(HelmetSensor.employee_id == employee_id)).first()
    if not sensor:
        raise HTTPException(404, "Helmet sensor not found")
        
    sensor.sos_active = False
    sensor.status = "safe"
    sensor.updated_at = datetime.datetime.utcnow()
    session.add(sensor)
    session.commit()
    
    return {"message": "SOS alert resolved", "sensor": sensor}
