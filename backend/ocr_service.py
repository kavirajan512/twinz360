import json
import random
from typing import Dict, Any

def simulate_document_ocr(document_type: str, file_path: str, user_inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulates OCR extraction from uploaded legal documents.
    Returns the extracted text, parsed data, and a list of mismatches against the user's input.
    """
    # Mock extracted data slightly varying from user input to simulate real-world OCR/doc issues randomly
    
    extracted_data = {
        "owner_name": user_inputs.get("owner_name", "UNKNOWN"),
        "survey_number": user_inputs.get("survey_number", "UNKNOWN"),
        "plot_area": user_inputs.get("plot_area", 0.0),
        "village": user_inputs.get("village", "UNKNOWN")
    }

    mismatches = []
    
    # Introduce a mock mismatch 20% of the time for demo purposes
    if random.random() < 0.2:
        extracted_data["owner_name"] = str(extracted_data["owner_name"]) + " (Spelling Error)"
        mismatches.append({
            "field": "owner_name",
            "user_input": user_inputs.get("owner_name"),
            "extracted": extracted_data["owner_name"],
            "severity": "high"
        })
        
    if random.random() < 0.2:
        try:
            extracted_data["plot_area"] = float(extracted_data["plot_area"]) * 0.95
        except (ValueError, TypeError):
            pass
        mismatches.append({
            "field": "plot_area",
            "user_input": user_inputs.get("plot_area"),
            "extracted": extracted_data["plot_area"],
            "severity": "medium"
        })

    mock_text = f"--- {document_type.upper()} ---\n"
    for k, v in extracted_data.items():
        mock_text += f"{k.upper()}: {v}\n"
    mock_text += "\nTHIS IS A SIMULATED OCR EXTRACTION RESULT.\n"

    return {
        "extracted_text": mock_text,
        "extracted_data": extracted_data,
        "mismatches": mismatches
    }
