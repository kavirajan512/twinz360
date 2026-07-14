"""
AeroTwin AI Cost & Schedule Intelligence API — Phase 11
Cost forecasting, Gantt chart generation, cash flow projections
"""
import random
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional, List
from database import get_session, CostForecast, GanttTask, CashFlowEntry

router = APIRouter(prefix="/finance", tags=["AI Cost & Schedule Intelligence"])

@router.get("/forecast/{project_id}")
def get_cost_forecast(project_id: int, session: Session = Depends(get_session)):
    forecast = session.exec(select(CostForecast).where(CostForecast.project_id == project_id).order_by(CostForecast.generated_at.desc())).first()
    
    if not forecast:
        # Generate dummy forecast if none exists
        budget = 50000000.0  # 5 Cr
        spent = budget * 0.45
        overrun = budget * random.uniform(0.02, 0.08)
        
        forecast = CostForecast(
            project_id=project_id,
            original_budget=budget,
            spent_to_date=spent,
            forecasted_final_cost=budget + overrun,
            expected_overrun=overrun,
            completion_risk_pct=round(random.uniform(10.0, 25.0), 1),
            predicted_delay_days=random.randint(5, 20),
            confidence=round(random.uniform(85.0, 95.0), 1)
        )
        session.add(forecast)
        session.commit()
        session.refresh(forecast)
        
    return forecast

@router.get("/schedule/{project_id}")
def get_gantt_schedule(project_id: int, session: Session = Depends(get_session)):
    tasks = session.exec(select(GanttTask).where(GanttTask.project_id == project_id)).all()
    
    if not tasks:
        # Seed dummy schedule
        base_date = datetime.date.today() - datetime.timedelta(days=30)
        
        dummy_tasks = [
            {"name": "Site Clearing", "phase": "Phase 1", "days": 10, "prog": 100},
            {"name": "Excavation", "phase": "Phase 1", "days": 15, "prog": 100},
            {"name": "Foundation", "phase": "Phase 2", "days": 25, "prog": 60},
            {"name": "Column Erection", "phase": "Phase 2", "days": 20, "prog": 10},
            {"name": "Beam & Slab", "phase": "Phase 3", "days": 30, "prog": 0},
            {"name": "Brickwork", "phase": "Phase 3", "days": 40, "prog": 0},
            {"name": "Roofing", "phase": "Phase 4", "days": 20, "prog": 0},
            {"name": "MEP Finishes", "phase": "Phase 4", "days": 35, "prog": 0}
        ]
        
        current_start = base_date
        
        for t in dummy_tasks:
            end_date = current_start + datetime.timedelta(days=t["days"])
            
            task = GanttTask(
                project_id=project_id,
                task_name=t["name"],
                phase=t["phase"],
                start_date=current_start.isoformat(),
                end_date=end_date.isoformat(),
                progress=t["prog"],
                status="completed" if t["prog"] == 100 else ("in_progress" if t["prog"] > 0 else "pending"),
                cost_allocated=t["days"] * 50000.0
            )
            session.add(task)
            current_start = end_date
            
        session.commit()
        tasks = session.exec(select(GanttTask).where(GanttTask.project_id == project_id)).all()
        
    return tasks

@router.get("/cashflow/{project_id}")
def get_cash_flow(project_id: int, session: Session = Depends(get_session)):
    entries = session.exec(select(CashFlowEntry).where(CashFlowEntry.project_id == project_id)).all()
    
    if not entries:
        # Generate dummy 6-month cashflow
        base_date = datetime.date.today() - datetime.timedelta(days=90)
        
        balance = 0
        for i in range(6):
            month_str = (base_date + datetime.timedelta(days=30*i)).strftime("%Y-%m")
            inflow = random.uniform(1000000, 3000000)
            outflow = random.uniform(800000, 2500000)
            balance += (inflow - outflow)
            
            entry = CashFlowEntry(
                project_id=project_id,
                month=month_str,
                inflow=round(inflow, 2),
                outflow=round(outflow, 2),
                balance=round(balance, 2)
            )
            session.add(entry)
            
        session.commit()
        entries = session.exec(select(CashFlowEntry).where(CashFlowEntry.project_id == project_id)).all()
        
    return entries
