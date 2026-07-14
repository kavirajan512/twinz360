"use client";
import React, { useState, useCallback } from "react";
import { Search, Upload, FileText, CheckCircle2, AlertTriangle, RefreshCw, FileSearch, Clipboard, Eye } from "lucide-react";

const API_BASE = "http://127.0.0.1:3001";

interface ExtractedField {
  field: string;
  value: string;
  confidence: "high" | "medium" | "low";
}

interface DocumentResult {
  raw_text: string;
  document_type: string;
  extracted_fields: ExtractedField[];
  summary: string;
  legal_flags: string[];
  recommendations: string[];
}

const DOCUMENT_TYPES = [
  { value: "sale_deed", label: "Sale Deed" },
  { value: "patta", label: "Patta (Land Record)" },
  { value: "ec", label: "Encumbrance Certificate (EC)" },
  { value: "building_plan", label: "Building Plan Approval" },
  { value: "survey", label: "Survey Settlement" },
  { value: "khata", label: "Khata Certificate" },
  { value: "rera", label: "RERA Registration" },
];

export default function OCRDocumentReader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("sale_deed");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DocumentResult | null>(null);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState<"extracted" | "raw">("extracted");
  const [manualText, setManualText] = useState("");
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");

  const processDocument = async () => {
    if (inputMode === "upload" && !selectedFile) return;
    if (inputMode === "paste" && !manualText.trim()) return;

    setIsProcessing(true);
    setError("");
    setResult(null);

    try {
      let rawText = manualText;
      
      if (inputMode === "upload" && selectedFile) {
        // Send to OCR endpoint
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("doc_type", docType);
        
        const ocrRes = await fetch(`${API_BASE}/api/ocr/extract`, {
          method: "POST",
          body: formData,
        });

        if (!ocrRes.ok) {
          const err = await ocrRes.json();
          throw new Error(err.detail || "OCR processing failed");
        }
        const ocrData = await ocrRes.json();
        rawText = ocrData.text;
      }

      // Analyze with Groq AI
      const analysisRes = await fetch(`${API_BASE}/api/ocr/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText, doc_type: docType }),
      });

      if (!analysisRes.ok) {
        throw new Error("AI analysis failed");
      }

      const analysis = await analysisRes.json();
      setResult({ ...analysis, raw_text: rawText });
    } catch (e: any) {
      setError(e.message || "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setInputMode("upload");
    }
  }, []);

  const confidenceColor = (confidence: string) => {
    if (confidence === "high") return "#10b981";
    if (confidence === "medium") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{ display: "flex", gap: "1.5rem" }}>
      {/* Left: Upload Panel */}
      <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        <div className="glass-panel">
          <h3 style={{ fontWeight: 600, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileSearch size={18} color="#06b6d4" />
            Document Intelligence
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Upload legal documents (Sale Deed, Patta, EC) or paste text for AI-powered extraction using OCR + Groq LLM.
          </p>
        </div>

        {/* Document Type */}
        <div className="glass-panel">
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>Document Type</label>
          <select
            value={docType}
            onChange={e => setDocType(e.target.value)}
            className="form-input"
            style={{ width: "100%" }}
          >
            {DOCUMENT_TYPES.map(dt => (
              <option key={dt.value} value={dt.value}>{dt.label}</option>
            ))}
          </select>
        </div>

        {/* Input Mode Toggle */}
        <div className="glass-panel">
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <button onClick={() => setInputMode("upload")}
              className={`btn ${inputMode === "upload" ? "btn-primary" : "btn-secondary"}`}
              style={{ flex: 1, padding: "0.4rem", fontSize: "0.75rem" }}>
              <Upload size={13} /> Upload File
            </button>
            <button onClick={() => setInputMode("paste")}
              className={`btn ${inputMode === "paste" ? "btn-primary" : "btn-secondary"}`}
              style={{ flex: 1, padding: "0.4rem", fontSize: "0.75rem" }}>
              <Clipboard size={13} /> Paste Text
            </button>
          </div>

          {inputMode === "upload" ? (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              style={{
                border: "2px dashed rgba(6,182,212,0.4)", borderRadius: "8px",
                padding: "1.5rem", textAlign: "center", cursor: "pointer",
                background: selectedFile ? "rgba(6,182,212,0.05)" : "transparent",
                transition: "all 0.2s"
              }}
              onClick={() => document.getElementById("ocr-file-input")?.click()}
            >
              <input
                id="ocr-file-input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp"
                style={{ display: "none" }}
                onChange={e => e.target.files && setSelectedFile(e.target.files[0])}
              />
              {selectedFile ? (
                <>
                  <CheckCircle2 size={24} color="#10b981" style={{ margin: "0 auto 0.5rem" }} />
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#10b981" }}>{selectedFile.name}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <Upload size={24} color="#06b6d4" style={{ margin: "0 auto 0.5rem" }} />
                  <p style={{ fontSize: "0.8rem", fontWeight: 600 }}>Drop file here or click to browse</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>PDF, JPG, PNG, TIFF supported</p>
                </>
              )}
            </div>
          ) : (
            <textarea
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              placeholder="Paste document text here for AI analysis..."
              className="form-input"
              style={{ width: "100%", minHeight: "160px", resize: "vertical", fontSize: "0.8rem" }}
            />
          )}
        </div>

        <button
          onClick={processDocument}
          disabled={isProcessing || (inputMode === "upload" ? !selectedFile : !manualText.trim())}
          className="btn btn-primary"
          style={{ width: "100%", padding: "0.75rem", fontSize: "0.85rem" }}
        >
          {isProcessing ? (
            <><RefreshCw size={15} className="animate-spin" /> Processing with AI...</>
          ) : (
            <><FileSearch size={15} /> Extract & Analyze</>
          )}
        </button>

        {error && (
          <div style={{ padding: "0.75rem", borderRadius: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: "0.8rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Supported Documents */}
        <div className="glass-panel" style={{ fontSize: "0.75rem" }}>
          <div style={{ color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600 }}>Supported Documents</div>
          {DOCUMENT_TYPES.map(dt => (
            <div key={dt.value} style={{ padding: "0.2rem 0", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <FileText size={11} color="#06b6d4" /> {dt.label}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Results Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
        {!result && !isProcessing && (
          <div className="glass-panel" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", minHeight: "400px" }}>
            <FileSearch size={48} color="#3b82f6" style={{ opacity: 0.5 }} />
            <h3 style={{ fontWeight: 600 }}>Document Intelligence Ready</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center", maxWidth: "400px" }}>
              Upload a scanned legal document or paste text. Our AI will extract land details, owner info, survey numbers, encumbrances, and flag legal risks automatically.
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
              {["OCR Extraction", "Groq LLM Analysis", "Legal Flag Detection", "Field Verification"].map(tag => (
                <span key={tag} style={{ padding: "0.25rem 0.75rem", borderRadius: "20px", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", fontSize: "0.75rem", color: "#06b6d4" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="glass-panel" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", minHeight: "400px" }}>
            <RefreshCw size={48} color="#3b82f6" className="animate-spin" />
            <h3>Analyzing Document...</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "280px" }}>
              {["Running OCR extraction...", "Parsing document structure...", "Calling Groq LLM...", "Extracting legal fields...", "Detecting risk flags..."].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#06b6d4", animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite` }} />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <>
            {/* Result Header */}
            <div className="glass-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span style={{ fontWeight: 600 }}>{result.document_type || DOCUMENT_TYPES.find(d => d.value === docType)?.label}</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{result.summary}</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => setActiveView("extracted")} className={`btn ${activeView === "extracted" ? "btn-primary" : "btn-secondary"}`} style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}>
                  <CheckCircle2 size={12} /> Extracted
                </button>
                <button onClick={() => setActiveView("raw")} className={`btn ${activeView === "raw" ? "btn-primary" : "btn-secondary"}`} style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}>
                  <Eye size={12} /> Raw Text
                </button>
              </div>
            </div>

            {activeView === "extracted" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* Extracted Fields */}
                <div className="glass-panel">
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.75rem" }}>
                    Extracted Fields
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {result.extracted_fields?.map((field, i) => (
                      <div key={i} style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.15rem" }}>{field.field}</div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{field.value}</div>
                        <div style={{ fontSize: "0.65rem", color: confidenceColor(field.confidence), marginTop: "0.1rem" }}>
                          ● {field.confidence} confidence
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legal Flags & Recommendations */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {result.legal_flags?.length > 0 && (
                    <div className="glass-panel" style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
                      <div style={{ fontSize: "0.75rem", color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <AlertTriangle size={13} /> Legal Flags
                      </div>
                      {result.legal_flags.map((flag, i) => (
                        <div key={i} style={{ padding: "0.4rem 0", borderBottom: i < result.legal_flags.length - 1 ? "1px solid rgba(239,68,68,0.1)" : "none", fontSize: "0.8rem", color: "#fca5a5" }}>
                          ⚠️ {flag}
                        </div>
                      ))}
                    </div>
                  )}

                  {result.recommendations?.length > 0 && (
                    <div className="glass-panel">
                      <div style={{ fontSize: "0.75rem", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <CheckCircle2 size={13} /> Recommendations
                      </div>
                      {result.recommendations.map((rec, i) => (
                        <div key={i} style={{ padding: "0.4rem 0", borderBottom: i < result.recommendations.length - 1 ? "1px solid rgba(16,185,129,0.1)" : "none", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          → {rec}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === "raw" && (
              <div className="glass-panel" style={{ flex: 1 }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.75rem" }}>Raw OCR Output</div>
                <pre style={{ fontSize: "0.75rem", color: "var(--text-secondary)", whiteSpace: "pre-wrap", lineHeight: 1.6, maxHeight: "400px", overflowY: "auto" }}>
                  {result.raw_text}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
