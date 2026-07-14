import os
import shutil
import hashlib
import json
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select

from database import (
    create_db_and_tables,
    get_session,
    User,
    Project,
    Video,
    DetectionFrame,
    SafetyAlert,
    DroneFlight,
    Authority,
    ComplianceRule,
    RegulatoryProject,
    LegalDocument
)
from ai_processor import simulate_video_analysis
from reports import generate_project_report
from regulatory_api import router as regulatory_router
from rental_api import router as rental_router
from equipment_api import router as equipment_router
from boq_engine import router as boq_router
from feasibility_api import router as feasibility_router
from gis_api import router as gis_router
from ocr_api import router as ocr_router
import hrms_api
import safety_ai_api
import drone_progress_api
import smart_helmet_api
import inventory_api
import finance_ai_api
import bim_api

app = FastAPI(title="AeroTwin Enterprise Platform API — AI Construction OS")

# Include routers
app.include_router(regulatory_router)
app.include_router(rental_router)
app.include_router(equipment_router)
app.include_router(boq_router)
app.include_router(feasibility_router)
app.include_router(gis_router)
app.include_router(ocr_router)
app.include_router(hrms_api.router)
app.include_router(safety_ai_api.router)
app.include_router(drone_progress_api.router)
app.include_router(smart_helmet_api.router)
app.include_router(inventory_api.router)
app.include_router(finance_ai_api.router)
app.include_router(bim_api.router)
# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MEDIA_DIR = "media"
os.makedirs(MEDIA_DIR, exist_ok=True)
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

# Database startup and seeding
@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    seed_database()

def seed_database():
    session = next(get_session())
    
    from database import Equipment
    existing_eq = session.exec(select(Equipment)).first()
    if not existing_eq:
        import json
        eq1 = Equipment(name="Caterpillar 320 Excavator", category="Heavy Machinery", hourly_rate=2500, daily_rate=18000, owner_name="L&T Construction Equipments", specs_json=json.dumps({"Weight": "20 Tons", "Bucket": "1.2 m3"}))
        eq2 = Equipment(name="Tower Crane 10t", category="Lifting", hourly_rate=5000, daily_rate=35000, owner_name="BuildLift Co", specs_json=json.dumps({"Max Load": "10 Tons", "Height": "50m"}))
        session.add(eq1)
        session.add(eq2)
        session.commit()
        
    # Check if we already have users or projects
    existing_users = session.exec(select(User)).first()
    if existing_users:
        return
        
    # 1. Seed Users
    roles = ["admin", "manager", "engineer", "viewer"]
    for role in roles:
        user = User(
            username=f"{role}_user",
            password_hash=hash_password("password"),
            email=f"{role}@digitaltwin.com",
            role=role
        )
        session.add(user)
        
    # 2. Seed Projects
    project1 = Project(
        name="Metro Tower Phase 2",
        description="Commercial skyscraper construction monitoring: 40 Floors structure, concrete foundation, cladding.",
        status="active"
    )
    project2 = Project(
        name="Riverside Bridge Expansion",
        description="Infrastructure project spanning the East River. Stage: Pile foundations & support piers.",
        status="active"
    )
    session.add(project1)
    session.add(project2)
    session.commit()
    
    # 3. Seed Drone Flights
    # Generate flight path in a 3D loop
    coords = []
    for t in range(0, 360, 10):
        import math
        x = 50 * math.cos(math.radians(t))
        z = 50 * math.sin(math.radians(t))
        y = 15 + 5 * math.sin(math.radians(t * 3))
        coords.append([x, y, z])
        
    flight = DroneFlight(
        project_id=project1.id,
        flight_name="Daily Site Scan - July 07",
        flight_path_json=json.dumps(coords),
        timeline_events_json=json.dumps([
            {"time": "0s", "event": "Takeoff - Home Point"},
            {"time": "12s", "event": "Section A Scanning"},
            {"time": "25s", "event": "Tower Crane Alignment Scan"},
            {"time": "40s", "event": "West Scaffold Check"},
            {"time": "55s", "event": "Return to Launch"}
        ])
    )
    session.add(flight)
    session.commit()
    
    # 4. Seed completed video & telemetry logs
    video = Video(
        project_id=project1.id,
        filename="drone_scan_0707.mp4",
        file_path="media/drone_scan_0707.mp4",
        status="completed",
        progress=100,
        duration=60.0
    )
    session.add(video)
    session.commit()
    
    # Touch empty file so the path exists (mock file for frontend reference)
    with open(video.file_path, "w") as f:
        f.write("")
        
    # Seed analysis frames
    stages = ["Site Clearing", "Excavation", "Foundation", "Columns", "Beams", "Brick Walls", "Roofing"]
    for i in range(1, 11):
        timestamp = i * 6.0
        worker_count = random_worker_count = int(8 + (i % 3) * 2 + (i % 2) * 1)
        ppe_non_compliant = 1 if i in [3, 7] else 0
        ppe_compliant = worker_count - ppe_non_compliant
        
        machinery = {"crane": 1}
        if i < 4:
            machinery["excavator"] = 1
        if 3 <= i <= 7:
            machinery["concrete_mixer"] = 1
            machinery["cement_truck"] = 1
            
        materials = {"steel_bars": 12 - i}
        if i >= 5:
            materials["bricks"] = i * 15
            
        frame = DetectionFrame(
            video_id=video.id,
            timestamp=timestamp,
            worker_count=worker_count,
            ppe_compliant_count=ppe_compliant,
            ppe_non_compliant_count=ppe_non_compliant,
            machinery_json=json.dumps(machinery),
            materials_json=json.dumps(materials),
            construction_stage=stages[min(i // 2, len(stages)-1)]
        )
        session.add(frame)
        
        if ppe_non_compliant > 0:
            alert_type = "no_helmet" if i == 3 else "no_vest"
            alert = SafetyAlert(
                video_id=video.id,
                timestamp=timestamp,
                alert_type=alert_type,
                description=f"Worker detected without {'helmet' if alert_type == 'no_helmet' else 'vest'} near Scaffolding Zone {i}.",
                status="open"
            )
            session.add(alert)
            
    session.commit()

# --- ROUTES ---

@app.post("/auth/register")
def register(username: str = Form(...), password: str = Form(...), email: str = Form(...), role: str = Form(...), session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.username == username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    if role not in ["admin", "manager", "engineer", "viewer"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")
        
    user = User(
        username=username,
        password_hash=hash_password(password),
        email=email,
        role=role
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"id": user.id, "username": user.username, "email": user.email, "role": user.role}

@app.post("/auth/login")
def login(username: str = Form(...), password: str = Form(...), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == username)).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    return {"id": user.id, "username": user.username, "role": user.role, "email": user.email}

@app.get("/projects", response_model=List[Project])
def get_projects(session: Session = Depends(get_session)):
    return session.exec(select(Project)).all()

@app.post("/projects", response_model=Project)
def create_project(name: str = Form(...), description: Optional[str] = Form(None), session: Session = Depends(get_session)):
    project = Project(name=name, description=description)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

@app.get("/projects/{project_id}", response_model=Project)
def get_project(project_id: int, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    session.delete(project)
    session.commit()
    return {"message": "Project deleted successfully"}

# Videos management
@app.post("/projects/{project_id}/videos")
async def upload_video(project_id: int, file: UploadFile = File(...), session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    safe_filename = f"{int(datetime.datetime.utcnow().timestamp())}_{file.filename}"
    file_path = os.path.join(MEDIA_DIR, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    video = Video(
        project_id=project_id,
        filename=file.filename,
        file_path=file_path,
        status="queued",
        progress=0
    )
    session.add(video)
    session.commit()
    session.refresh(video)
    return video

@app.get("/projects/{project_id}/videos", response_model=List[Video])
def get_project_videos(project_id: int, session: Session = Depends(get_session)):
    return session.exec(select(Video).where(Video.project_id == project_id)).all()

@app.post("/videos/{video_id}/analyze")
def analyze_video(video_id: int, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    video = session.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if video.status == "processing":
        return {"message": "Analysis already in progress", "status": "processing"}
        
    video.status = "processing"
    video.progress = 0
    session.add(video)
    session.commit()
    
    background_tasks.add_task(simulate_video_analysis, video_id)
    return {"message": "Analysis started in background", "status": "processing"}

@app.get("/videos/{video_id}")
def get_video_status(video_id: int, session: Session = Depends(get_session)):
    video = session.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video

@app.get("/videos/{video_id}/telemetry", response_model=List[DetectionFrame])
def get_video_telemetry(video_id: int, session: Session = Depends(get_session)):
    return session.exec(select(DetectionFrame).where(DetectionFrame.video_id == video_id)).all()

@app.get("/videos/{video_id}/alerts", response_model=List[SafetyAlert])
def get_video_alerts(video_id: int, session: Session = Depends(get_session)):
    return session.exec(select(SafetyAlert).where(SafetyAlert.video_id == video_id)).all()

# Global project alerts feed
@app.get("/projects/{project_id}/alerts", response_model=List[SafetyAlert])
def get_project_alerts(project_id: int, session: Session = Depends(get_session)):
    videos = session.exec(select(Video).where(Video.project_id == project_id)).all()
    video_ids = [v.id for v in videos]
    if not video_ids:
        return []
    return session.exec(select(SafetyAlert).where(SafetyAlert.video_id.in_(video_ids))).all()

@app.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: int, session: Session = Depends(get_session)):
    alert = session.get(SafetyAlert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "resolved"
    session.add(alert)
    session.commit()
    session.refresh(alert)
    return alert

# Drone flights
@app.get("/projects/{project_id}/flights", response_model=List[DroneFlight])
def get_project_flights(project_id: int, session: Session = Depends(get_session)):
    return session.exec(select(DroneFlight).where(DroneFlight.project_id == project_id)).all()

@app.post("/projects/{project_id}/flights", response_model=DroneFlight)
def create_flight(project_id: int, flight_name: str = Form(...), flight_path_json: str = Form(...), timeline_events_json: str = Form("[]"), session: Session = Depends(get_session)):
    flight = DroneFlight(
        project_id=project_id,
        flight_name=flight_name,
        flight_path_json=flight_path_json,
        timeline_events_json=timeline_events_json
    )
    session.add(flight)
    session.commit()
    session.refresh(flight)
    return flight

# Report Generation
@app.get("/projects/{project_id}/reports/{report_type}")
def get_project_report_api(project_id: int, report_type: str, session: Session = Depends(get_session)):
    if report_type not in ["daily", "weekly", "monthly"]:
        raise HTTPException(status_code=400, detail="Invalid report type")
    report = generate_project_report(project_id, report_type, session)
    if "error" in report:
        raise HTTPException(status_code=404, detail=report["error"])
    return report
