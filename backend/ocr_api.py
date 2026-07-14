"""
AeroTwin OCR + Document Intelligence API
Integrates: Tesseract OCR (local) + Groq LLM for legal document parsing
"""
import io
import os
import base64
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from groq import Groq

router = APIRouter(prefix="/api/ocr", tags=["OCR & Document Intelligence"])

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))


class AnalyzeRequest(BaseModel):
    text: str
    doc_type: str = "sale_deed"


DOC_TYPE_PROMPTS = {
    "sale_deed": """You are a legal document AI specializing in Indian Sale Deed analysis.
Extract these fields: Seller Name, Buyer Name, Land Area (in sq ft and acres), Survey Number, 
Village/Taluk/District, Registration Date, Sale Price, Stamp Duty, Document Number.
Flag any encumbrances, disputes, or legal restrictions mentioned.""",

    "patta": """You are a land records AI specializing in Indian Patta documents.
Extract these fields: Patta Number, Owner Name, Land Area (in hectares/acres), Survey Number,
Village, Taluk, District, Land Classification (Wetland/Dryland/Garden), Assessment.
Flag any mutations, disputes, or unauthorized constructions mentioned.""",

    "ec": """You are a legal AI specializing in Indian Encumbrance Certificates.
Extract: Survey Number, Property Description, Registration Period Covered,
Any Mortgages/Loans Against Property, Any Legal Disputes, Property Owner Names,
Nature of Transactions (sale/mortgage/gift/partition).
Flag if any ENCUMBRANCES are found that could block construction.""",

    "building_plan": """You are a construction AI specializing in Building Plan Approvals.
Extract: Approval Number, Date of Approval, Plot Number, Total Built-up Area,
Number of Floors Approved, FSI Used, Setbacks (Front/Rear/Side),
Authority Name, Validity Period.
Flag any deviations from approved plan or expired permissions.""",

    "survey": """You are a land survey AI specializing in Indian Survey Settlement documents.
Extract: Survey Number, Re-survey Number, Sub-division Number, Area,
Land Type, Owner Name, Boundary Details (North/South/East/West sides).
Flag any boundary disputes or overlapping claims.""",

    "khata": """You are a municipal records AI specializing in Khata Certificates.
Extract: Khata Number, Owner Name, Property Address, Assessed Value,
Property Tax Account Number, Municipal Ward, Total Area.
Flag any unpaid taxes or pending assessments.""",

    "rera": """You are a real estate AI specializing in RERA documents.
Extract: RERA Registration Number, Project Name, Promoter Name, Promoter Address,
Project Type (Residential/Commercial), Total Units, Completion Date, 
Carpet Area Range, Amenities Listed.
Flag any project delays, complaints, or compliance issues.""",
}


@router.post("/extract", summary="Extract text from uploaded document using OCR")
async def extract_text(
    file: UploadFile = File(...),
    doc_type: str = Form("sale_deed")
):
    """
    Extract text from uploaded document using Tesseract OCR (with pytesseract).
    Falls back to text extraction for native PDFs.
    """
    contents = await file.read()
    filename = file.filename or "document"
    extracted_text = ""

    # Try PDF text extraction first (no OCR needed for digital PDFs)
    if filename.lower().endswith(".pdf"):
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(contents)) as pdf:
                for page in pdf.pages:
                    extracted_text += (page.extract_text() or "") + "\n"
        except ImportError:
            pass
        except Exception:
            pass

    # Try image OCR if no text extracted
    if not extracted_text.strip():
        try:
            import pytesseract
            from PIL import Image
            
            if filename.lower().endswith(".pdf"):
                # Convert PDF to images
                try:
                    import fitz  # PyMuPDF
                    doc = fitz.open(stream=contents, filetype="pdf")
                    for page in doc:
                        pix = page.get_pixmap(dpi=300)
                        img_data = pix.tobytes("png")
                        img = Image.open(io.BytesIO(img_data))
                        extracted_text += pytesseract.image_to_string(img, lang="eng+hin") + "\n"
                except ImportError:
                    pass
            else:
                img = Image.open(io.BytesIO(contents))
                extracted_text = pytesseract.image_to_string(img, lang="eng+hin")
        except ImportError:
            # Tesseract not installed — use demo text
            extracted_text = f"""[Demo Mode - Tesseract OCR not installed]
This is a sample {doc_type.replace('_', ' ').title()} document analysis.

SALE DEED
Document Number: DOC-2024-001234
Registration Date: 15th March 2024
Registration District: Chennai

VENDOR (SELLER):
Name: M/s. Raghavendra Properties Ltd.
Address: 42, Anna Salai, Chennai - 600002

VENDEE (BUYER):
Name: Mr. Arjun Kumar S/o Late Mr. Suresh Kumar
Address: 12, Nehru Street, Coimbatore - 641001

SCHEDULE OF PROPERTY:
All that piece and parcel of Land situated at:
Survey No: 234/2B, Perungudi Village
Sholinganallur Taluk, Kanchipuram District
Total Extent: 2400 Sq.Ft. (approximately 0.056 Acres)
Boundaries:
  North: 30 feet wide road
  South: Property of Mr. Krishnamurthy
  East: Survey No. 234/3 belonging to Municipality
  West: Survey No. 234/2A

CONSIDERATION:
Sale Consideration: Rs. 45,00,000/- (Rupees Forty Five Lakhs Only)
Stamp Duty Paid: Rs. 3,15,000/-
Registration Fee: Rs. 45,000/-
"""

    if not extracted_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from document. Please ensure the file is a readable PDF or clear image.")

    return {"text": extracted_text, "doc_type": doc_type, "filename": filename}


@router.post("/analyze", summary="AI analysis of extracted document text using Groq LLM")
async def analyze_document(req: AnalyzeRequest):
    """
    Use Groq LLM (llama3-70b-8192) to intelligently extract structured fields
    from the OCR text, detect legal risks and provide recommendations.
    """
    if not req.text.strip():
        raise HTTPException(status_code=422, detail="No text provided for analysis")

    prompt_context = DOC_TYPE_PROMPTS.get(req.doc_type, DOC_TYPE_PROMPTS["sale_deed"])

    system_prompt = f"""{prompt_context}

Return a JSON object with EXACTLY this structure:
{{
  "document_type": "<human readable type>",
  "summary": "<one sentence summary of the document>",
  "extracted_fields": [
    {{"field": "<field name>", "value": "<extracted value or 'Not found'>", "confidence": "high|medium|low"}}
  ],
  "legal_flags": ["<any legal risk or concern>"],
  "recommendations": ["<actionable recommendation>"]
}}

Rules:
- Extract as many fields as possible from the text
- Mark confidence as "high" if field is clearly stated, "medium" if inferred, "low" if uncertain
- Legal flags should highlight encumbrances, disputes, expired dates, missing info
- Keep all values concise
- Return ONLY the JSON object, no markdown or explanation"""

    try:
        response = groq_client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this document:\n\n{req.text[:4000]}"}
            ],
            max_tokens=2000,
            temperature=0.1
        )

        import json
        raw = response.choices[0].message.content.strip()
        
        # Extract JSON from response
        if "```json" in raw:
            raw = raw.split("```json")[1].split("```")[0].strip()
        elif "```" in raw:
            raw = raw.split("```")[1].split("```")[0].strip()
        
        result = json.loads(raw)
        return result

    except Exception as e:
        # Return structured fallback if LLM fails
        return {
            "document_type": req.doc_type.replace("_", " ").title(),
            "summary": f"Document analysis completed for {req.doc_type.replace('_', ' ')}",
            "extracted_fields": [
                {"field": "Raw Text Length", "value": f"{len(req.text)} characters", "confidence": "high"},
                {"field": "Document Type", "value": req.doc_type.replace("_", " ").title(), "confidence": "high"},
            ],
            "legal_flags": [],
            "recommendations": ["Review document manually for accuracy", "Consult a legal expert for interpretation"],
            "error": str(e)
        }
