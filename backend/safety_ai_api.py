"""
AeroTwin Safety AI API — Phase 3
YOLOv11 integration, safety alerts, rules
"""
import random
import datetime
from fastapi import APIRouter, Depends, HTTPException, Form
from sqlmodel import Session, select
from typing import Optional, List
from database import get_session, SafetyDetection, SafetyRule

router = APIRouter(prefix="/safety", tags=["AI Safety Monitoring"])

@router.post("/detect")
def detect_safety_issues(
    project_id: int = Form(...),
    camera_id: str = Form("CAM-01"),
    zone: str = Form("Sector A"),
    session: Session = Depends(get_session)
):
    # In a real scenario, this endpoint would receive a frame and run YOLOv11 inference.
    # For now, we simulate the detection based on Phase 3 requirements.
    
    detection_types = ["helmet_missing", "vest_missing", "fall", "unauthorized", "fire"]
    detected_type = random.choice(detection_types)
    confidence = round(random.uniform(0.7, 0.99), 2)
    
    severity = "warning"
    if detected_type in ["fall", "fire"]:
        severity = "emergency"
    elif detected_type == "unauthorized":
        severity = "critical"
        
    detection = SafetyDetection(
        project_id=project_id,
        detection_type=detected_type,
        confidence=confidence,
        camera_id=camera_id,
        zone=zone,
        worker_id=f"Worker #{random.randint(1, 100)}" if detected_type not in ["fire", "unauthorized"] else None,
        severity=severity,
        bounding_box_json='{"x": 100, "y": 150, "w": 50, "h": 120}'
    )
    
    session.add(detection)
    session.commit()
    session.refresh(detection)
    
    return {"message": "Detection processed", "detection": detection}

@router.get("/alerts/live")
def get_live_alerts(project_id: Optional[int] = None, session: Session = Depends(get_session)):
    query = select(SafetyDetection).where(SafetyDetection.resolved == False)
    if project_id:
        query = query.where(SafetyDetection.project_id == project_id)
    query = query.order_by(SafetyDetection.detected_at.desc())
    return session.exec(query).all()

@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: int, session: Session = Depends(get_session)):
    alert = session.get(SafetyDetection, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    alert.resolved = True
    session.add(alert)
    session.commit()
    return {"message": "Alert resolved"}

@router.get("/stats")
def get_safety_stats(project_id: Optional[int] = None, session: Session = Depends(get_session)):
    query = select(SafetyDetection)
    if project_id:
        query = query.where(SafetyDetection.project_id == project_id)
    detections = session.exec(query).all()
    
    stats = {
        "total_alerts": len(detections),
        "unresolved": len([d for d in detections if not d.resolved]),
        "by_type": {}
    }
    
    for d in detections:
        stats["by_type"][d.detection_type] = stats["by_type"].get(d.detection_type, 0) + 1
        
    return stats

@router.post("/rules")
def create_safety_rule(
    rule_name: str = Form(...),
    detection_type: str = Form(...),
    zone: str = Form("All"),
    severity: str = Form("warning"),
    session: Session = Depends(get_session)
):
    rule = SafetyRule(
        rule_name=rule_name,
        detection_type=detection_type,
        zone=zone,
        severity=severity
    )
    session.add(rule)
    session.commit()
    session.refresh(rule)
    return rule

@router.get("/rules")
def list_safety_rules(session: Session = Depends(get_session)):
    return session.exec(select(SafetyRule)).all()
