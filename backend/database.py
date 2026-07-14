import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, create_engine, Session

sqlite_file_name = "digital_twin.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password_hash: str
    email: str
    role: str  # "admin", "manager", "engineer", "viewer"
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    status: str = "active"  # "active", "completed"
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class Video(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int
    filename: str
    file_path: str
    status: str = "queued"  # "queued", "processing", "completed", "failed"
    progress: int = 0
    duration: float = 0.0
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class DetectionFrame(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    video_id: int
    timestamp: float  # seconds from start of video
    worker_count: int = 0
    ppe_compliant_count: int = 0
    ppe_non_compliant_count: int = 0
    machinery_json: str = "{}"  # e.g. {"crane": 1, "excavator": 1}
    materials_json: str = "{}"  # e.g. {"bricks": 10, "steel_bars": 5}
    construction_stage: str = "Site Clearing"

class SafetyAlert(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    video_id: int
    timestamp: float
    alert_type: str  # "no_helmet", "no_vest", "restricted_area", "unsafe_worker"
    description: str
    status: str = "open"  # "open", "resolved"
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class DroneFlight(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int
    flight_name: str
    flight_date: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    flight_path_json: str  # JSON list of [x, y, z] coordinates
    timeline_events_json: str  # JSON list of details along path

class Authority(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    region: str
    description: Optional[str] = None
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class ComplianceRule(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    authority_id: int = Field(index=True)
    rule_key: str  # e.g., "max_fsi", "min_front_setback", "max_height"
    rule_value: float
    rule_type: str  # e.g., "max", "min", "exact", "boolean"
    description: Optional[str] = None

class RegulatoryProject(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_name: str
    customer_name: str
    owner_name: str
    survey_number: str
    plot_number: str
    patta_number: Optional[str] = None
    gps_coordinates: str
    village: str
    taluk: str
    district: str
    state: str
    country: str
    pin_code: str
    land_length: float
    land_width: float
    plot_area: float
    road_width: float
    corner_plot: bool = False
    facing_direction: str
    terrain_type: str
    soil_type: str
    existing_building: bool = False
    utilities: str  # JSON list
    authority_id: Optional[int] = None
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class LegalDocument(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    regulatory_project_id: int
    document_type: str  # "Sale Deed", "Patta", etc.
    file_path: str
    extracted_text: Optional[str] = None
    extracted_data_json: Optional[str] = None  # JSON of extracted owner name, survey number, etc.
    mismatches_json: Optional[str] = None
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class Equipment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    category: str
    hourly_rate: float
    daily_rate: float
    owner_name: str
    status: str = "available"  # "available", "rented", "maintenance"
    specs_json: str = "{}"
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class RentalBooking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    equipment_id: int
    project_id: int
    start_date: str
    end_date: str
    total_cost: float
    status: str = "pending"  # "pending", "active", "completed", "cancelled"
    payment_status: str = "unpaid"  # "unpaid", "paid", "failed"
    notes: Optional[str] = None
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class EquipmentLocation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    equipment_id: int
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0
    rotation_y: float = 0.0
    current_zone: str = "Parking"
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class EquipmentTwinStatus(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    equipment_id: int
    fuel_level: float = 100.0
    engine_hours: float = 0.0
    health_score: float = 100.0
    utilization_pct: float = 0.0
    maintenance_status: str = "Healthy"  # Healthy, Warning, Maintenance Due, Critical
    last_service_date: str = "2026-01-01"
    next_service_date: str = "2026-12-01"
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class EquipmentTask(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    equipment_id: int
    task_name: str
    phase: str
    status: str = "pending" # pending, in_progress, completed
    assigned_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class EquipmentSensorData(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    equipment_id: int
    rpm: float
    engine_temp: float
    battery_voltage: float
    oil_pressure: float
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class BOQEstimate(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int
    building_type: str
    total_area_sqft: float
    num_floors: int
    concrete_cu_m: float
    steel_kg: float
    bricks_units: int
    cement_bags: int
    sand_cu_m: float
    total_material_cost: float
    total_labor_cost: float
    total_equipment_cost: float
    grand_total: float
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 2 — HRMS & GPS Attendance
# ═══════════════════════════════════════════════════════════════════════════════

class Employee(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    role: str = "Worker"  # Worker, Mason, Electrician, Plumber, Supervisor, Engineer
    department: str = "General"
    photo_url: Optional[str] = None
    phone: Optional[str] = None
    aadhaar_number: Optional[str] = None
    emergency_contact: Optional[str] = None
    project_id: Optional[int] = None
    shift_id: Optional[int] = None
    base_salary: float = 15000.0
    status: str = "active"  # active, inactive, terminated
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class AttendanceLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(index=True)
    check_in_time: Optional[datetime.datetime] = None
    check_out_time: Optional[datetime.datetime] = None
    check_in_lat: Optional[float] = None
    check_in_lng: Optional[float] = None
    check_out_lat: Optional[float] = None
    check_out_lng: Optional[float] = None
    selfie_url: Optional[str] = None
    geofence_valid: bool = False
    face_match_score: float = 0.0
    shift_id: Optional[int] = None
    status: str = "present"  # present, absent, half_day, leave, late
    date: str = ""  # "2026-07-11"

class Shift(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str  # "Day Shift", "Night Shift"
    start_time: str  # "08:00"
    end_time: str  # "18:00"
    break_minutes: int = 60
    overtime_rate: float = 1.5

class PayrollRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(index=True)
    month: str  # "2026-07"
    days_worked: int = 0
    overtime_hours: float = 0.0
    base_salary: float = 0.0
    overtime_pay: float = 0.0
    deductions: float = 0.0
    net_salary: float = 0.0
    payment_status: str = "pending"  # pending, paid, hold

class Geofence(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    name: str = "Site Boundary"
    center_lat: float = 13.0827
    center_lng: float = 80.2707
    radius_meters: float = 200.0

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 3 — AI Safety Monitoring
# ═══════════════════════════════════════════════════════════════════════════════

class SafetyDetection(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    detection_type: str  # helmet_missing, vest_missing, fall, fire, smoke, unauthorized
    confidence: float = 0.0
    camera_id: str = "CAM-01"
    zone: str = "Sector A"
    worker_id: Optional[str] = None
    bounding_box_json: str = "{}"
    severity: str = "warning"  # info, warning, critical, emergency
    resolved: bool = False
    image_url: Optional[str] = None
    detected_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class SafetyRule(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_name: str  # "Helmet Required in Zone A"
    detection_type: str  # helmet_missing, vest_missing, etc.
    zone: str = "All"
    severity: str = "warning"
    auto_escalate: bool = True
    escalation_minutes: int = 15
    active: bool = True

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 4 — Drone & Progress Intelligence
# ═══════════════════════════════════════════════════════════════════════════════

class ProgressSnapshot(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    date: str  # "2026-07-11"
    planned_pct: float = 0.0
    actual_pct: float = 0.0
    delay_pct: float = 0.0
    stage: str = "Foundation"
    drone_flight_id: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 9 — Smart Helmet & Worker Tracking
# ═══════════════════════════════════════════════════════════════════════════════

class HelmetSensor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(index=True)
    heart_rate: float = 72.0
    body_temp: float = 36.6
    gas_level_ppm: float = 5.0
    gas_type: str = "Normal"  # Normal, CO, H2S, CH4
    fall_detected: bool = False
    sos_active: bool = False
    zone: str = "Ground Floor"
    battery_pct: float = 100.0
    lat: Optional[float] = None
    lng: Optional[float] = None
    status: str = "safe"  # safe, warning, danger, sos
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 10 — Inventory & Theft Prevention
# ═══════════════════════════════════════════════════════════════════════════════

class InventoryItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    name: str
    category: str = "Materials"  # Materials, Tools, Consumables, Safety Gear
    quantity: float = 0.0
    unit: str = "kg"  # kg, units, bags, cu_m, pieces
    min_threshold: float = 10.0
    warehouse: str = "Main Store"
    rfid_tag: Optional[str] = None
    qr_code: Optional[str] = None
    unit_cost: float = 0.0
    status: str = "in_stock"  # in_stock, low_stock, out_of_stock
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class InventoryTransaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    item_id: int = Field(index=True)
    transaction_type: str  # entry, exit, adjustment, return
    quantity: float = 0.0
    scanned_by: Optional[str] = None
    scan_method: str = "manual"  # manual, rfid, qr
    notes: Optional[str] = None
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class TheftAlert(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    item_id: int = Field(index=True)
    probability: float = 0.0
    missing_qty: float = 0.0
    expected_qty: float = 0.0
    actual_qty: float = 0.0
    location: str = "Warehouse A"
    anomaly_type: str = "quantity_mismatch"  # quantity_mismatch, after_hours, gate_bypass
    resolved: bool = False
    detected_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 11 — AI Cost & Schedule Intelligence
# ═══════════════════════════════════════════════════════════════════════════════

class CostForecast(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    original_budget: float = 0.0
    spent_to_date: float = 0.0
    forecasted_final_cost: float = 0.0
    expected_overrun: float = 0.0
    completion_risk_pct: float = 0.0
    predicted_delay_days: int = 0
    confidence: float = 0.0
    generated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class GanttTask(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    task_name: str
    phase: str = "Phase 1"
    start_date: str = ""  # "2026-07-01"
    end_date: str = ""  # "2026-08-15"
    progress: float = 0.0
    dependencies_json: str = "[]"  # JSON array of task IDs
    assigned_to: Optional[str] = None
    status: str = "pending"  # pending, in_progress, completed, delayed
    cost_allocated: float = 0.0

class CashFlowEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    month: str  # "2026-07"
    inflow: float = 0.0
    outflow: float = 0.0
    balance: float = 0.0
    category: str = "operations"  # operations, materials, labor, equipment, overhead

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 12 — 4D/5D BIM & Facility Management
# ═══════════════════════════════════════════════════════════════════════════════

class BIMModel(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    name: str = "Main Building"
    file_path: Optional[str] = None
    file_type: str = "glb"  # glb, ifc, fbx
    layer_config_json: str = '{"structural":true,"architectural":true,"mep":true,"furniture":true}'
    version: int = 1
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

class FacilitySystem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    system_type: str  # HVAC, Fire_Alarm, Energy, Access_Control, Elevator
    name: str = ""
    status: str = "operational"  # operational, warning, fault, offline
    zone: str = "Building A"
    readings_json: str = "{}"  # Dynamic sensor readings
    last_maintenance: Optional[str] = None
    next_maintenance: Optional[str] = None
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
