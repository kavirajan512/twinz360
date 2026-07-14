from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from feasibility_engine import analyze_feasibility

router = APIRouter(prefix="/api/feasibility", tags=["Feasibility"])

class FeasibilityRequest(BaseModel):
    land_length: float
    land_width: float
    road_width: float
    num_floors: int
    style_selection: Optional[str] = None
    material_preference: Optional[str] = None
    soil_type: Optional[str] = None
    budget_limit: Optional[str] = None
    ai_prompt: Optional[str] = None
    terrace: Optional[int] = 0
    bedrooms: Optional[int] = 0
    bathrooms: Optional[int] = 0
    hall: Optional[int] = 0
    kitchen: Optional[int] = 0
    lift: Optional[int] = 0
    parking: Optional[int] = 0
    balcony: Optional[int] = 0

@router.post("")
def analyze(req: FeasibilityRequest):
    return analyze_feasibility(req)
