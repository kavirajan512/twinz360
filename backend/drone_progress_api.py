"""
AeroTwin Drone & Progress Intelligence API — Phase 4
Photogrammetry, progress comparison, timelapse
"""
import random
import datetime
from fastapi import APIRouter, Depends, HTTPException, Form
from sqlmodel import Session, select
from typing import Optional, List
from database import get_session, ProgressSnapshot, DroneFlight

router = APIRouter(prefix="/drone", tags=["Drone Progress Intelligence"])

@router.post("/upload")
def upload_drone_data(
    project_id: int = Form(...),
    flight_name: str = Form(...),
    session: Session = Depends(get_session)
):
    # Simulate saving drone data
    flight = DroneFlight(
        project_id=project_id,
        flight_name=flight_name,
        flight_path_json="[]",
        timeline_events_json="[]"
    )
    session.add(flight)
    session.commit()
    session.refresh(flight)
    return {"message": "Drone data uploaded successfully", "flight_id": flight.id}

@router.post("/analyze")
def analyze_progress(
    project_id: int = Form(...),
    flight_id: Optional[int] = Form(None),
    session: Session = Depends(get_session)
):
    # Simulate photogrammetry and progress AI
    planned_pct = random.randint(40, 90)
    delay = random.randint(-5, 15)  # negative means ahead of schedule
    actual_pct = max(0, planned_pct - delay)
    
    stages = ["Site Clearing", "Excavation", "Foundation", "Columns", "Beams", "Brick Walls", "Roofing"]
    stage_idx = min(int((actual_pct / 100.0) * len(stages)), len(stages) - 1)
    
    snapshot = ProgressSnapshot(
        project_id=project_id,
        date=datetime.date.today().isoformat(),
        planned_pct=float(planned_pct),
        actual_pct=float(actual_pct),
        delay_pct=float(max(0, delay)),
        stage=stages[stage_idx],
        drone_flight_id=flight_id
    )
    
    session.add(snapshot)
    session.commit()
    session.refresh(snapshot)
    
    return {"message": "Analysis complete", "snapshot": snapshot}

@router.get("/progress/{project_id}")
def get_progress(project_id: int, session: Session = Depends(get_session)):
    query = select(ProgressSnapshot).where(ProgressSnapshot.project_id == project_id).order_by(ProgressSnapshot.date.desc())
    latest = session.exec(query).first()
    if not latest:
        # Return a dummy if none exists for UI
        return {
            "planned_pct": 65.0,
            "actual_pct": 58.0,
            "delay_pct": 7.0,
            "stage": "Foundation",
            "date": datetime.date.today().isoformat()
        }
    return latest

@router.get("/timelapse/{project_id}")
def get_timelapse(project_id: int, session: Session = Depends(get_session)):
    query = select(ProgressSnapshot).where(ProgressSnapshot.project_id == project_id).order_by(ProgressSnapshot.date.asc())
    snapshots = session.exec(query).all()
    return snapshots
