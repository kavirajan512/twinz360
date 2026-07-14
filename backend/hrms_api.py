"""
AeroTwin HRMS & GPS Attendance API — Phase 2
Employee management, GPS attendance, shift management, payroll
"""
import math
import datetime
import random
from fastapi import APIRouter, Depends, HTTPException, Form, Query
from sqlmodel import Session, select
from typing import Optional, List
from database import (
    get_session, Employee, AttendanceLog, Shift, PayrollRecord, Geofence
)

router = APIRouter(prefix="/hrms", tags=["HRMS & Attendance"])

# ── Helpers ───────────────────────────────────────────────────────────────────

def haversine_distance(lat1, lng1, lat2, lng2):
    """Calculate distance in meters between two GPS coordinates."""
    R = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

# ── Employee CRUD ─────────────────────────────────────────────────────────────

@router.get("/employees")
def list_employees(project_id: Optional[int] = None, status: str = "active", session: Session = Depends(get_session)):
    query = select(Employee)
    if project_id:
        query = query.where(Employee.project_id == project_id)
    if status != "all":
        query = query.where(Employee.status == status)
    return session.exec(query).all()

@router.get("/employees/{emp_id}")
def get_employee(emp_id: int, session: Session = Depends(get_session)):
    emp = session.get(Employee, emp_id)
    if not emp:
        raise HTTPException(404, "Employee not found")
    return emp

@router.post("/employees")
def create_employee(
    name: str = Form(...),
    role: str = Form("Worker"),
    department: str = Form("General"),
    phone: str = Form(None),
    aadhaar_number: str = Form(None),
    emergency_contact: str = Form(None),
    project_id: int = Form(None),
    shift_id: int = Form(None),
    base_salary: float = Form(15000.0),
    session: Session = Depends(get_session)
):
    emp = Employee(
        name=name, role=role, department=department, phone=phone,
        aadhaar_number=aadhaar_number, emergency_contact=emergency_contact,
        project_id=project_id, shift_id=shift_id, base_salary=base_salary
    )
    session.add(emp)
    session.commit()
    session.refresh(emp)
    return emp

@router.put("/employees/{emp_id}")
def update_employee(
    emp_id: int,
    name: str = Form(None),
    role: str = Form(None),
    department: str = Form(None),
    phone: str = Form(None),
    status: str = Form(None),
    base_salary: float = Form(None),
    session: Session = Depends(get_session)
):
    emp = session.get(Employee, emp_id)
    if not emp:
        raise HTTPException(404, "Employee not found")
    if name: emp.name = name
    if role: emp.role = role
    if department: emp.department = department
    if phone: emp.phone = phone
    if status: emp.status = status
    if base_salary is not None: emp.base_salary = base_salary
    session.add(emp)
    session.commit()
    session.refresh(emp)
    return emp

# ── GPS Attendance ────────────────────────────────────────────────────────────

@router.post("/attendance/check-in")
def check_in(
    employee_id: int = Form(...),
    lat: float = Form(...),
    lng: float = Form(...),
    selfie_url: str = Form(None),
    session: Session = Depends(get_session)
):
    emp = session.get(Employee, employee_id)
    if not emp:
        raise HTTPException(404, "Employee not found")
    
    # Geofence validation
    geofence_valid = False
    if emp.project_id:
        fences = session.exec(select(Geofence).where(Geofence.project_id == emp.project_id)).all()
        for fence in fences:
            dist = haversine_distance(lat, lng, fence.center_lat, fence.center_lng)
            if dist <= fence.radius_meters:
                geofence_valid = True
                break
    
    # Simulate face recognition score
    face_match_score = round(random.uniform(88.0, 99.5), 1)
    
    today = datetime.date.today().isoformat()
    
    # Check if already checked in today
    existing = session.exec(
        select(AttendanceLog).where(
            AttendanceLog.employee_id == employee_id,
            AttendanceLog.date == today
        )
    ).first()
    if existing and existing.check_in_time:
        raise HTTPException(400, "Already checked in today")
    
    log = AttendanceLog(
        employee_id=employee_id,
        check_in_time=datetime.datetime.utcnow(),
        check_in_lat=lat, check_in_lng=lng,
        selfie_url=selfie_url,
        geofence_valid=geofence_valid,
        face_match_score=face_match_score,
        shift_id=emp.shift_id,
        status="present",
        date=today
    )
    session.add(log)
    session.commit()
    session.refresh(log)
    return {
        "message": "Check-in successful",
        "log": log,
        "geofence_valid": geofence_valid,
        "face_match_score": face_match_score
    }

@router.post("/attendance/check-out")
def check_out(
    employee_id: int = Form(...),
    lat: float = Form(None),
    lng: float = Form(None),
    session: Session = Depends(get_session)
):
    today = datetime.date.today().isoformat()
    log = session.exec(
        select(AttendanceLog).where(
            AttendanceLog.employee_id == employee_id,
            AttendanceLog.date == today
        )
    ).first()
    if not log:
        raise HTTPException(400, "No check-in found for today")
    if log.check_out_time:
        raise HTTPException(400, "Already checked out today")
    
    log.check_out_time = datetime.datetime.utcnow()
    log.check_out_lat = lat
    log.check_out_lng = lng
    session.add(log)
    session.commit()
    session.refresh(log)
    return {"message": "Check-out successful", "log": log}

@router.get("/attendance/today")
def today_attendance(project_id: Optional[int] = None, session: Session = Depends(get_session)):
    today = datetime.date.today().isoformat()
    query = select(AttendanceLog).where(AttendanceLog.date == today)
    logs = session.exec(query).all()
    
    employees = session.exec(select(Employee).where(Employee.status == "active")).all()
    if project_id:
        employees = [e for e in employees if e.project_id == project_id]
    
    checked_in_ids = {l.employee_id for l in logs}
    present = len([l for l in logs if l.status == "present"])
    absent = len(employees) - len(checked_in_ids)
    late = len([l for l in logs if l.status == "late"])
    
    return {
        "date": today,
        "total_employees": len(employees),
        "present": present,
        "absent": absent,
        "late": late,
        "on_leave": len([l for l in logs if l.status == "leave"]),
        "logs": logs
    }

@router.get("/attendance/employee/{emp_id}")
def employee_attendance(emp_id: int, month: str = None, session: Session = Depends(get_session)):
    query = select(AttendanceLog).where(AttendanceLog.employee_id == emp_id)
    if month:
        query = query.where(AttendanceLog.date.startswith(month))
    logs = session.exec(query).all()
    return logs

# ── Shifts ────────────────────────────────────────────────────────────────────

@router.get("/shifts")
def list_shifts(session: Session = Depends(get_session)):
    return session.exec(select(Shift)).all()

@router.post("/shifts")
def create_shift(
    name: str = Form(...),
    start_time: str = Form("08:00"),
    end_time: str = Form("18:00"),
    break_minutes: int = Form(60),
    overtime_rate: float = Form(1.5),
    session: Session = Depends(get_session)
):
    shift = Shift(name=name, start_time=start_time, end_time=end_time,
                  break_minutes=break_minutes, overtime_rate=overtime_rate)
    session.add(shift)
    session.commit()
    session.refresh(shift)
    return shift

# ── Payroll ───────────────────────────────────────────────────────────────────

@router.get("/payroll/{month}")
def get_payroll(month: str, session: Session = Depends(get_session)):
    records = session.exec(select(PayrollRecord).where(PayrollRecord.month == month)).all()
    return records

@router.post("/payroll/generate")
def generate_payroll(month: str = Form(...), session: Session = Depends(get_session)):
    employees = session.exec(select(Employee).where(Employee.status == "active")).all()
    results = []
    
    for emp in employees:
        # Count attendance days for the month
        logs = session.exec(
            select(AttendanceLog).where(
                AttendanceLog.employee_id == emp.id,
                AttendanceLog.date.startswith(month)
            )
        ).all()
        
        days_worked = len([l for l in logs if l.status in ("present", "late")])
        
        # Calculate overtime (hours beyond 8 per day)
        overtime_hours = 0.0
        for log in logs:
            if log.check_in_time and log.check_out_time:
                hours = (log.check_out_time - log.check_in_time).total_seconds() / 3600
                if hours > 8:
                    overtime_hours += hours - 8
        
        per_day = emp.base_salary / 26  # 26 working days
        base_pay = per_day * days_worked
        
        shift = session.get(Shift, emp.shift_id) if emp.shift_id else None
        ot_rate = shift.overtime_rate if shift else 1.5
        ot_pay = overtime_hours * (per_day / 8) * ot_rate
        
        deductions = emp.base_salary * 0.12  # 12% PF
        net = base_pay + ot_pay - deductions
        
        # Check existing record
        existing = session.exec(
            select(PayrollRecord).where(
                PayrollRecord.employee_id == emp.id,
                PayrollRecord.month == month
            )
        ).first()
        
        if existing:
            existing.days_worked = days_worked
            existing.overtime_hours = round(overtime_hours, 1)
            existing.base_salary = round(base_pay, 2)
            existing.overtime_pay = round(ot_pay, 2)
            existing.deductions = round(deductions, 2)
            existing.net_salary = round(net, 2)
            session.add(existing)
            results.append(existing)
        else:
            record = PayrollRecord(
                employee_id=emp.id, month=month, days_worked=days_worked,
                overtime_hours=round(overtime_hours, 1),
                base_salary=round(base_pay, 2), overtime_pay=round(ot_pay, 2),
                deductions=round(deductions, 2), net_salary=round(net, 2)
            )
            session.add(record)
            results.append(record)
    
    session.commit()
    return {"message": f"Payroll generated for {len(results)} employees", "records": results}

# ── Geofences ─────────────────────────────────────────────────────────────────

@router.get("/geofences")
def list_geofences(project_id: Optional[int] = None, session: Session = Depends(get_session)):
    query = select(Geofence)
    if project_id:
        query = query.where(Geofence.project_id == project_id)
    return session.exec(query).all()

@router.post("/geofences")
def create_geofence(
    project_id: int = Form(...),
    name: str = Form("Site Boundary"),
    center_lat: float = Form(...),
    center_lng: float = Form(...),
    radius_meters: float = Form(200.0),
    session: Session = Depends(get_session)
):
    fence = Geofence(project_id=project_id, name=name,
                     center_lat=center_lat, center_lng=center_lng,
                     radius_meters=radius_meters)
    session.add(fence)
    session.commit()
    session.refresh(fence)
    return fence
