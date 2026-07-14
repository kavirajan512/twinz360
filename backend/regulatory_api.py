import os
import shutil
import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select
from pydantic import BaseModel

from database import get_session, Authority, ComplianceRule, RegulatoryProject, LegalDocument
from ocr_service import simulate_document_ocr
from regulatory_engine import evaluate_rules

router = APIRouter(prefix="/regulatory", tags=["Regulatory Compliance"])
MEDIA_DIR = "media"

# Pydantic schemas for request bodies where Form is not used
class RuleCreate(BaseModel):
    rule_key: str
    rule_value: float
    rule_type: str
    description: Optional[str] = None

class AuthorityCreate(BaseModel):
    name: str
    region: str
    description: Optional[str] = None

# --- Authorities & Rules (Admin) ---

@router.get("/authorities", response_model=List[Authority])
def get_authorities(session: Session = Depends(get_session)):
    return session.exec(select(Authority)).all()

@router.post("/authorities", response_model=Authority)
def create_authority(auth: AuthorityCreate, session: Session = Depends(get_session)):
    authority = Authority(name=auth.name, region=auth.region, description=auth.description)
    session.add(authority)
    session.commit()
    session.refresh(authority)
    return authority

@router.get("/authorities/{authority_id}/rules", response_model=List[ComplianceRule])
def get_rules(authority_id: int, session: Session = Depends(get_session)):
    return session.exec(select(ComplianceRule).where(ComplianceRule.authority_id == authority_id)).all()

@router.post("/authorities/{authority_id}/rules", response_model=ComplianceRule)
def create_rule(authority_id: int, rule: RuleCreate, session: Session = Depends(get_session)):
    new_rule = ComplianceRule(
        authority_id=authority_id,
        rule_key=rule.rule_key,
        rule_value=rule.rule_value,
        rule_type=rule.rule_type,
        description=rule.description
    )
    session.add(new_rule)
    session.commit()
    session.refresh(new_rule)
    return new_rule

# --- Projects (End User) ---

@router.post("/projects", response_model=RegulatoryProject)
def create_regulatory_project(
    project_name: str = Form(...),
    customer_name: str = Form(...),
    owner_name: str = Form(...),
    survey_number: str = Form(...),
    plot_number: str = Form(...),
    gps_coordinates: str = Form(...),
    village: str = Form(...),
    taluk: str = Form(...),
    district: str = Form(...),
    state: str = Form(...),
    country: str = Form(...),
    pin_code: str = Form(...),
    land_length: float = Form(...),
    land_width: float = Form(...),
    plot_area: float = Form(...),
    road_width: float = Form(...),
    facing_direction: str = Form(...),
    terrain_type: str = Form(...),
    soil_type: str = Form(...),
    utilities: str = Form(...),
    corner_plot: bool = Form(False),
    existing_building: bool = Form(False),
    authority_id: Optional[int] = Form(None),
    session: Session = Depends(get_session)
):
    project = RegulatoryProject(
        project_name=project_name, customer_name=customer_name, owner_name=owner_name,
        survey_number=survey_number, plot_number=plot_number, gps_coordinates=gps_coordinates,
        village=village, taluk=taluk, district=district, state=state, country=country, pin_code=pin_code,
        land_length=land_length, land_width=land_width, plot_area=plot_area, road_width=road_width,
        facing_direction=facing_direction, terrain_type=terrain_type, soil_type=soil_type,
        utilities=utilities, corner_plot=corner_plot, existing_building=existing_building,
        authority_id=authority_id
    )
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

@router.get("/projects/{project_id}", response_model=RegulatoryProject)
def get_regulatory_project(project_id: int, session: Session = Depends(get_session)):
    project = session.get(RegulatoryProject, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/projects/{project_id}/documents")
async def upload_document(
    project_id: int, 
    document_type: str = Form(...),
    file: UploadFile = File(...), 
    session: Session = Depends(get_session)
):
    project = session.get(RegulatoryProject, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    safe_filename = f"reg_{project_id}_{int(datetime.datetime.utcnow().timestamp())}_{file.filename}"
    file_path = os.path.join(MEDIA_DIR, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Simulate OCR Extraction
    user_inputs = {
        "owner_name": project.owner_name,
        "survey_number": project.survey_number,
        "plot_area": project.plot_area,
        "village": project.village
    }
    
    ocr_result = simulate_document_ocr(document_type, file_path, user_inputs)
    
    doc = LegalDocument(
        regulatory_project_id=project_id,
        document_type=document_type,
        file_path=file_path,
        extracted_text=ocr_result["extracted_text"],
        extracted_data_json=json.dumps(ocr_result["extracted_data"]),
        mismatches_json=json.dumps(ocr_result["mismatches"])
    )
    session.add(doc)
    session.commit()
    session.refresh(doc)
    return doc

@router.get("/projects/{project_id}/documents")
def get_documents(project_id: int, session: Session = Depends(get_session)):
    return session.exec(select(LegalDocument).where(LegalDocument.regulatory_project_id == project_id)).all()

@router.post("/projects/{project_id}/analyze")
def analyze_project(project_id: int, session: Session = Depends(get_session)):
    project = session.get(RegulatoryProject, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if not project.authority_id:
        # Step 3: Detect Governing Authority (mock logic based on GPS or defaults to first authority)
        auth = session.exec(select(Authority)).first()
        if auth:
            project.authority_id = auth.id
            session.add(project)
            session.commit()
            session.refresh(project)
        else:
            raise HTTPException(status_code=400, detail="No governing authority configured in system.")
            
    rules = session.exec(select(ComplianceRule).where(ComplianceRule.authority_id == project.authority_id)).all()
    
    # Step 5 & 6: AI Validation & Results
    results = evaluate_rules(project, rules)
    
    # Check documents
    docs = session.exec(select(LegalDocument).where(LegalDocument.regulatory_project_id == project_id)).all()
    has_mismatches = any(doc.mismatches_json and json.loads(doc.mismatches_json) for doc in docs)
    if has_mismatches:
        results["risk_score"] += 15
        results["construction_feasibility_score"] -= 15
        results["recommendations"].append("Legal Document mismatches found. Please verify ownership and plot boundaries.")
        
    return results
