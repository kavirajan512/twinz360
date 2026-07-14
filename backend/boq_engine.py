from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import get_session, BOQEstimate
from pydantic import BaseModel

router = APIRouter(prefix="/boq", tags=["boq"])

class BOQRequest(BaseModel):
    project_id: int
    building_type: str
    width: float
    length: float
    num_floors: int

@router.post("/generate")
def generate_boq(request: BOQRequest, session: Session = Depends(get_session)):
    total_area_sqft = request.width * request.length * request.num_floors * 10.764 # converting m2 to sqft roughly
    
    # Very basic estimation math based on industry thumb rules
    concrete_cu_m = total_area_sqft * 0.038
    steel_kg = total_area_sqft * 4.0
    bricks_units = int(total_area_sqft * 8)
    cement_bags = int(total_area_sqft * 0.4)
    sand_cu_m = total_area_sqft * 0.05
    
    # Rates
    rate_concrete = 4000 # per cu m
    rate_steel = 65 # per kg
    rate_brick = 8 # per unit
    rate_cement = 350 # per bag
    rate_sand = 1500 # per cu m
    
    total_material_cost = (
        (concrete_cu_m * rate_concrete) +
        (steel_kg * rate_steel) +
        (bricks_units * rate_brick) +
        (cement_bags * rate_cement) +
        (sand_cu_m * rate_sand)
    )
    
    total_labor_cost = total_area_sqft * 300 # flat rate per sqft
    total_equipment_cost = total_area_sqft * 50
    
    grand_total = total_material_cost + total_labor_cost + total_equipment_cost
    
    estimate = BOQEstimate(
        project_id=request.project_id,
        building_type=request.building_type,
        total_area_sqft=total_area_sqft,
        num_floors=request.num_floors,
        concrete_cu_m=concrete_cu_m,
        steel_kg=steel_kg,
        bricks_units=bricks_units,
        cement_bags=cement_bags,
        sand_cu_m=sand_cu_m,
        total_material_cost=total_material_cost,
        total_labor_cost=total_labor_cost,
        total_equipment_cost=total_equipment_cost,
        grand_total=grand_total
    )
    
    session.add(estimate)
    session.commit()
    session.refresh(estimate)
    return estimate

@router.get("/project/{project_id}")
def get_boq(project_id: int, session: Session = Depends(get_session)):
    estimates = session.exec(select(BOQEstimate).where(BOQEstimate.project_id == project_id)).all()
    return estimates
