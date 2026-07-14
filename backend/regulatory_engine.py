import json
from typing import List, Dict, Any
from database import RegulatoryProject, ComplianceRule

def evaluate_rules(project: RegulatoryProject, rules: List[ComplianceRule]) -> Dict[str, Any]:
    """
    Evaluates project parameters against the configured rules for its Authority.
    """
    results = []
    passed = 0
    failed = 0
    recommendations = []
    
    # Pre-calculate derived values
    calc_fsi = 0
    # For now, let's assume built up area isn't provided directly, we'll estimate or just validate provided FSI if exists.
    # We'll use rule evaluation against project properties directly if they match names, 
    # or use specific logic for FSI and setbacks.
    
    for rule in rules:
        key = rule.rule_key
        target = rule.rule_value
        rule_type = rule.rule_type
        
        actual_val = None
        status = "Passed"
        reason = ""
        
        # Map specific keys to project attributes
        if key == "min_road_width":
            actual_val = project.road_width
        elif key == "min_plot_area":
            actual_val = project.plot_area
        # More complex ones like FSI might need user's proposed built up area, 
        # which isn't in Land Info step. But let's assume we validate general plot rules first.
        elif key == "min_front_setback":
            actual_val = 3.0 # Mock value for analysis since we don't capture building design in step 1
        
        if actual_val is not None:
            if rule_type == "min" and actual_val < target:
                status = "Failed"
                reason = f"Actual ({actual_val}) is less than minimum required ({target})"
            elif rule_type == "max" and actual_val > target:
                status = "Failed"
                reason = f"Actual ({actual_val}) is greater than maximum allowed ({target})"
            elif rule_type == "exact" and actual_val != target:
                status = "Failed"
                reason = f"Actual ({actual_val}) does not match required ({target})"
        else:
            status = "Pending"
            reason = f"Data not available for {key}"
            
        if status == "Passed":
            passed += 1
        elif status == "Failed":
            failed += 1
            recommendations.append(f"Ensure {key} complies with {rule_type} value of {target}.")
            
        results.append({
            "rule_key": key,
            "required_value": target,
            "rule_type": rule_type,
            "actual_value": actual_val,
            "status": status,
            "reason": reason,
            "description": rule.description
        })
        
    total = len(rules)
    compliance_score = int((passed / total) * 100) if total > 0 else 100
    risk_score = int((failed / total) * 100) if total > 0 else 0
    feasibility_score = max(0, 100 - risk_score)
    
    cost_impact = "Low"
    if risk_score > 50:
        cost_impact = "High"
    elif risk_score > 20:
        cost_impact = "Medium"
        
    if not recommendations and compliance_score == 100:
        recommendations.append("All rules passed successfully.")
        
    return {
        "overall_compliance_score": compliance_score,
        "land_suitability_score": compliance_score,
        "construction_feasibility_score": feasibility_score,
        "risk_score": risk_score,
        "environmental_score": 85, # Mock
        "cost_impact": cost_impact,
        "timeline_impact": "Standard" if risk_score < 30 else "Delayed due to compliance issues",
        "results": results,
        "recommendations": recommendations,
        "missing_documents": ["Environmental Clearance", "Fire NOC"] if risk_score > 40 else []
    }
