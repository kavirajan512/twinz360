import json
import math
import os
from groq import Groq

# Initialize Groq client
# We will use the fast llama3-70b-8192 model for town planning logic
client = Groq(api_key=os.environ.get("GROQ_API_KEY", ""))

def call_groq_planner(req, actual_footprint, max_floors_allowed):
    """Uses Groq LLM to evaluate feasibility and parse architectural directives from natural language."""
    if not client.api_key:
        return None
        
    prompt_text = (req.ai_prompt or "").strip()
    
    sys_prompt = f"""You are an expert Town Planner and Chief Architect.
Evaluate the feasibility of a building project and parse architectural directives.
The user wants to build a {req.building_type} on a land of {req.land_length}x{req.land_width}m with a road width of {req.road_width}m.
They want {req.num_floors} floors.
The maximum allowed floors for this road width is {max_floors_allowed}.
The buildable footprint after setbacks is {actual_footprint} sq m.
User's natural language request: "{prompt_text if prompt_text else 'Standard design.'}"

Respond ONLY in valid JSON format with the following keys:
- is_possible (boolean)
- reason (string: explain zoning or capacity issues if impossible, else say feasible)
- suggestions (list of strings: architectural advice)
- style (string: e.g. Modern, Traditional, Luxury, Industrial, based on user prompt)
- material_pref (string: e.g. Concrete, Wood, Steel, Glass, based on user prompt)
- force_flat_roof (boolean: true if prompt mentions flat roof)
- has_solar (boolean: true if prompt mentions solar)
- has_pool (boolean: true if prompt mentions pool)
- directives_applied (list of strings: specific architectural choices you made based on the prompt)
"""
    try:
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "system", "content": sys_prompt}],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        print("Groq API Error:", e)
        return None

def analyze_feasibility(req):
    """
    Analyzes the feasibility of a building project based on requested parameters,
    and returns a structured planning and design assessment containing:
    1. Setbacks & FAR Feasibility Check
    2. Dynamic Space Planning (Floor Layout Optimizer)
    3. Structural Recommendations (Grids, Foundations)
    4. Granular Bill of Quantities (BOQ)
    5. Cost Breakdown
    6. Construction Schedule Timeline
    """
    # Inputs
    L = req.land_length
    W = req.land_width
    road_w = req.road_width
    floors = req.num_floors
    style = req.style_selection or "Modern"
    material_pref = req.material_preference or "Concrete"
    soil = req.soil_type or "Medium Clay"
    budget_limit = req.budget_limit or "Custom"

    # Natural Language Prompt Interpreting Engine (Now powered by Groq LLM)
    directives_applied = []
    
    # 1. Feasibility Logic (Setbacks & Built-up Area)
    # Setback Calculations
    front_setback = 3.0 if road_w >= 10 else 2.0
    side_setback = 1.5 + (0.5 * floors)
    back_setback = 2.0
    
    buildable_L = max(1.0, L - (front_setback + back_setback))
    buildable_W = max(1.0, W - (2 * side_setback))
    actual_footprint = buildable_L * buildable_W
    
    # Calculate required floor area based on rooms
    req_area_per_floor = (req.bedrooms * 15) + (req.bathrooms * 6) + (req.hall * 22) + (req.kitchen * 12) + (req.lift * 4) + 15
    if req.parking > 0:
        req_area_per_floor += (req.parking * 12) / max(1, floors)

    # Floor limit by road width
    max_floors_allowed = max(2, int(road_w / 3) + 1)
    
    # CALL GROQ FOR TOWN PLANNING LOGIC
    llm_plan = call_groq_planner(req, actual_footprint, max_floors_allowed)
    
    if llm_plan:
        is_possible = llm_plan.get("is_possible", True)
        reason = llm_plan.get("reason", "Feasible under zoning rules.")
        suggestions = llm_plan.get("suggestions", [])
        style = llm_plan.get("style", style)
        material_pref = llm_plan.get("material_pref", material_pref)
        force_flat_roof = llm_plan.get("force_flat_roof", False)
        has_solar = llm_plan.get("has_solar", req.terrace > 0)
        has_pool = llm_plan.get("has_pool", False)
        directives_applied = llm_plan.get("directives_applied", [])
    else:
        # Fallback if API key missing or error
        is_possible = True
        reason = "Feasible under standard zoning rules."
        suggestions = []
        force_flat_roof = False
        has_solar = req.terrace > 0
        has_pool = False
        
        if buildable_L < 5.0 or buildable_W < 5.0:
            is_possible = False
            reason = "Zoning Violation: Insufficient setback area."
        if req_area_per_floor > actual_footprint:
            is_possible = False
            reason = "Capacity Error: Required floor layout area exceeds buildable footprint."
        if floors > max_floors_allowed:
            is_possible = False
            reason = f"Height Restriction: Requested {floors} floors exceeds maximum limit of {max_floors_allowed} floors."

    # 2. Dynamic Space Planning (Floor Layout Optimizer)
    floor_layouts = {}
    remaining_bedrooms = req.bedrooms
    remaining_bathrooms = req.bathrooms
    remaining_balconies = req.balcony
    
    for f in range(1, floors + 1):
        floor_key = "Ground Floor" if f == 1 else f"Floor {f}"
        rooms = []
        if f == 1:
            rooms.append("Living Room")
            rooms.append("Kitchen")
            rooms.append("Dining Room")
            if req.parking > 0:
                rooms.append(f"Parking Garage ({req.parking} bays)")
            if remaining_bedrooms > 0:
                rooms.append("Guest Bedroom")
                remaining_bedrooms -= 1
            if remaining_bathrooms > 0:
                rooms.append("Common Bathroom")
                remaining_bathrooms -= 1
        else:
            # Allocate bedrooms & bathrooms to upper floors
            beds_on_this_floor = min(2, remaining_bedrooms)
            if beds_on_this_floor > 0:
                rooms.append(f"{beds_on_this_floor} x Bedrooms")
                remaining_bedrooms -= beds_on_this_floor
            
            baths_on_this_floor = min(2, remaining_bathrooms)
            if baths_on_this_floor > 0:
                rooms.append(f"{baths_on_this_floor} x Bathrooms")
                remaining_bathrooms -= baths_on_this_floor
                
            if remaining_balconies > 0:
                rooms.append("Private Balcony")
                remaining_balconies -= 1
                
        if f == floors:
            rooms.append("Terrace / Rooftop Lounge")
            if req.terrace > 0:
                rooms.append("Solar Panel Assembly")
                
        floor_layouts[floor_key] = rooms

    # 3. Structural Planner (Advisory)
    # Foundation selection based on soil
    foundation_map = {
        "Soft Clay": "Raft/Mat Foundation (advisable for low bearing capacity)",
        "Medium Clay": "Isolated/Strap Footings (standard layout)",
        "Loose Sand": "Pile Foundation (required to reach stable load strata)",
        "Hard Rock": "Direct Pad Footings (excellent bearing capacity)"
    }
    foundation = foundation_map.get(soil, "Isolated Pad Footings")
    
    # Column grid recommendations
    col_spacing = 4.5  # meters spacing average
    cols_length = max(2, int(buildable_L / col_spacing) + 1)
    cols_width = max(2, int(buildable_W / col_spacing) + 1)
    total_columns = cols_length * cols_width
    
    column_size = "300mm x 300mm" if floors <= 2 else "450mm x 450mm"
    slab_thickness = "125mm" if floors <= 2 else "150mm"
    
    structural_plan = {
        "foundation_type": foundation,
        "recommended_column_grid": f"{cols_width} x {cols_length} Grid ({total_columns} Columns)",
        "column_dimensions": column_size,
        "slab_thickness": slab_thickness,
        "beam_dimensions": "300mm x 450mm (Primary Beams)",
        "steel_reinforcement_estimate": f"{(buildable_L * buildable_W * floors * 4.5 * 0.08):.1f} Metric Tons (Fe500)"
    }

    # 4. Granular Bill of Quantities (BOQ) & Estimations
    total_area = actual_footprint * floors if is_possible else req_area_per_floor * floors
    
    # Quantities scale based on material choice and floors
    cement_mult = 0.45 if material_pref == "Concrete" else 0.38
    steel_mult = 4.8 if material_pref == "Steel" else 4.2
    
    boq = {
        "Cement (bags)": int(total_area * cement_mult),
        "Sand (cft)": int(total_area * 1.8),
        "Bricks (pcs)": int(total_area * 42) if material_pref != "Prefabricated Panels" else int(total_area * 5),
        "Steel (kg)": int(total_area * steel_mult),
        "Concrete (m3)": int(total_area * 0.16),
        "Paint (liters)": int(total_area * 0.12),
        "Tiles (sqm)": int(total_area * 0.85),
        "Electrical Wiring (meters)": int(total_area * 3.5),
        "Plumbing Conduits (meters)": int(total_area * 2.2),
        "Doors": req.bedrooms + req.bathrooms + 3,
        "Windows": req.bedrooms * 2 + req.hall * 2 + req.kitchen * 1
    }

    # 5. Cost Breakdown
    # Custom multipliers based on Style & Material selection
    style_multipliers = {
        "Modern": 1.1,
        "Contemporary": 1.15,
        "Traditional": 1.0,
        "Luxury": 1.5,
        "Industrial": 1.25,
        "Minimalist": 1.05
    }
    style_mult = style_multipliers.get(style, 1.0)
    
    material_multipliers = {
        "Concrete": 1.0,
        "Brick": 0.95,
        "Steel": 1.3,
        "Glass": 1.4,
        "Wood": 1.2,
        "AAC Blocks": 0.9,
        "Prefabricated Panels": 1.15
    }
    mat_mult = material_multipliers.get(material_pref, 1.0)
    
    base_sqm_cost = 18000  # Base cost per square meter
    calculated_sqm_cost = base_sqm_cost * style_mult * mat_mult
    
    raw_material_cost = total_area * calculated_sqm_cost * 0.55
    labour_cost = total_area * calculated_sqm_cost * 0.28
    equipment_cost = total_area * calculated_sqm_cost * 0.08
    transportation_cost = total_area * calculated_sqm_cost * 0.04
    
    subtotal = raw_material_cost + labour_cost + equipment_cost + transportation_cost
    taxes = subtotal * 0.18  # 18% GST/Taxes
    contingency = subtotal * 0.05  # 5% Contingency
    total_project_cost = subtotal + taxes + contingency
    
    costs = {
        "Material Cost": round(raw_material_cost, 2),
        "Labour Cost": round(labour_cost, 2),
        "Equipment Cost": round(equipment_cost, 2),
        "Transportation Cost": round(transportation_cost, 2),
        "Taxes & GST (18%)": round(taxes, 2),
        "Contingency Pool (5%)": round(contingency, 2),
        "Total Cost": round(total_project_cost, 2)
    }

    # 6. Construction Timeline / Schedule
    foundation_days = max(10, int(actual_footprint / 15))
    struct_days = max(15, floors * 12)
    brick_days = max(12, floors * 8)
    utility_days = max(14, floors * 6)  # Plumbing & Electrical
    finishing_days = max(20, floors * 10)
    
    timeline = {
        "Excavation & Site Prep": f"{max(5, int(actual_footprint / 40))} Days",
        "Foundation Laying": f"{foundation_days} Days",
        "Columns, Beams & Slabs": f"{struct_days} Days",
        "Brickwork & Masonry": f"{brick_days} Days",
        "Utility Conduit Routing": f"{utility_days} Days",
        "Plastering & Priming": f"{max(10, floors * 5)} Days",
        "Painting & Interior Finish": f"{finishing_days} Days",
        "Handover & Inspection": "5 Days",
        "Total Duration": f"{max(45, foundation_days + struct_days + brick_days + utility_days + finishing_days + 10)} Days"
    }

    # Manpower Estimations
    workers = {
        "Mason": max(2, int(total_area / 45)),
        "Carpenter": max(1, int(total_area / 90)),
        "Electrician": max(1, int(total_area / 120)),
        "Plumber": max(1, int(total_area / 120)),
        "Painter": max(2, int(total_area / 75)),
        "Steel Fixer": max(2, int(total_area / 50)),
        "Supervisor": 1 + (floors // 3),
        "Total Workers Required": 0
    }
    workers["Total Workers Required"] = sum(workers.values()) - workers["Total Workers Required"]

    three_d_params = {
        "width": buildable_W,
        "length": buildable_L,
        "floors": floors,
        "is_possible": is_possible,
        "style": style,
        "swimming_pool": has_pool,
        "has_solar": has_solar,
        "force_flat_roof": force_flat_roof,
        "material_override": material_pref
    }

    return {
        "is_possible": is_possible,
        "reason": reason,
        "suggestions_json": json.dumps(suggestions),
        "worker_estimate_json": json.dumps(workers),
        "material_estimate_json": json.dumps(boq),
        "cost_estimate_json": json.dumps(costs),
        "duration_estimate_json": json.dumps(timeline),
        "three_d_params_json": json.dumps(three_d_params),
        # Advanced JSON variables
        "floor_plan_json": json.dumps(floor_layouts),
        "structural_plan_json": json.dumps(structural_plan),
        "boq_json": json.dumps(boq),
        "timeline_json": json.dumps(timeline),
        "cost_breakdown_json": json.dumps(costs),
        "directives_json": json.dumps(directives_applied)
    }
