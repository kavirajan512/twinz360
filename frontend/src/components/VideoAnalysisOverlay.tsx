"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, AlertTriangle, Eye, ShieldAlert, Cpu } from "lucide-react";

interface TelemetryFrame {
  id?: number;
  video_id: number;
  timestamp: number;
  worker_count: number;
  ppe_compliant_count: number;
  ppe_non_compliant_count: number;
  machinery_json: string; // e.g. '{"excavator": 1}'
  materials_json: string; // e.g. '{"bricks": 20}'
  construction_stage: string;
}

interface VideoAnalysisOverlayProps {
  videoUrl: string | null;
  videoStatus: string;
  progress: number;
  telemetry: TelemetryFrame[];
  onPlayAlert?: (alert: { type: string; desc: string }) => void;
}

interface BBox {
  label: string;
  color: string;
  top: string;
  left: string;
  width: string;
  height: string;
}

export default function VideoAnalysisOverlay({
  videoUrl,
  videoStatus,
  progress,
  telemetry,
  onPlayAlert
}: VideoAnalysisOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeBoxes, setActiveBoxes] = useState<BBox[]>([]);
  const [currentStage, setCurrentStage] = useState<string>("Detecting...");
  const [machineryCounts, setMachineryCounts] = useState<Record<string, number>>({});
  
  // Ref for tracking simulation interval if no real video is playing
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle play/pause
  const handlePlayToggle = () => {
    if (videoUrl && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(e => console.log("Video play failed:", e));
      }
      setIsPlaying(!isPlaying);
    } else {
      // Mock playback toggle for simulation feed
      setIsPlaying(!isPlaying);
    }
  };

  // Synchronize bounding boxes based on video currentTime
  useEffect(() => {
    if (telemetry.length === 0) return;

    // Find the telemetry frame closest to the current video time
    const closestFrame = telemetry.reduce((prev, curr) => {
      return Math.abs(curr.timestamp - currentTime) < Math.abs(prev.timestamp - currentTime) ? curr : prev;
    });

    if (!closestFrame) return;

    setCurrentStage(closestFrame.construction_stage);

    let parsedMachinery: Record<string, number> = {};
    try {
      parsedMachinery = JSON.parse(closestFrame.machinery_json || "{}");
      setMachineryCounts(parsedMachinery);
    } catch (e) {
      console.error("Error parsing machinery JSON", e);
    }

    // Generate bounding boxes for this frame
    const boxes: BBox[] = [];
    
    // Add workers
    const totalWorkers = closestFrame.worker_count;
    const nonCompliant = closestFrame.ppe_non_compliant_count;
    const compliant = closestFrame.ppe_compliant_count;

    // Compliant workers (Green boxes)
    for (let i = 0; i < compliant; i++) {
      boxes.push({
        label: `Worker - PPE OK`,
        color: "var(--accent-emerald)",
        left: `${20 + (i * 7) % 60}%`,
        top: `${30 + (i * 9) % 45}%`,
        width: "60px",
        height: "120px"
      });
    }

    // Non-compliant workers (Red boxes)
    for (let i = 0; i < nonCompliant; i++) {
      boxes.push({
        label: `Worker - NO PPE`,
        color: "var(--accent-red)",
        left: `${15 + (i * 18) % 70}%`,
        top: `${40 + (i * 12) % 35}%`,
        width: "65px",
        height: "130px"
      });
    }

    // Machinery boxes (Cyan boxes)
    let mIdx = 0;
    Object.entries(parsedMachinery).forEach(([macName, count]) => {
      if (count > 0) {
        boxes.push({
          label: `${macName.toUpperCase()} 96%`,
          color: "var(--accent-cyan)",
          left: `${50 + (mIdx * 15)}%`,
          top: "15%",
          width: "120px",
          height: "90px"
        });
        mIdx++;
      }
    });

    setActiveBoxes(boxes);
  }, [currentTime, telemetry]);

  // Simulated timer for mockup feed if no real video is uploaded
  useEffect(() => {
    if (isPlaying && !videoUrl) {
      simIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          return next > 60 ? 0 : next;
        });
      }, 1000);
    } else {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    }
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [isPlaying, videoUrl]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="video-container">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={`http://127.0.0.1:3001/${videoUrl}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          />
        ) : (
          /* Mock Visual Scan Simulation */
          <div style={{ width: "100%", height: "100%", position: "relative", background: "#060608", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.1, background: "radial-gradient(circle, var(--accent-cyan) 1px, transparent 1px) 0 0/16px 16px" }} />
            
            {/* HUD Scanning Grid Overlay */}
            <div style={{ position: "absolute", inset: "2rem", border: "1px dashed rgba(6, 182, 212, 0.2)", borderRadius: "8px", pointerEvents: "none" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "12px", height: "12px", borderTop: "2px solid var(--accent-cyan)", borderLeft: "2px solid var(--accent-cyan)" }} />
              <div style={{ position: "absolute", top: 0, right: 0, width: "12px", height: "12px", borderTop: "2px solid var(--accent-cyan)", borderRight: "2px solid var(--accent-cyan)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, width: "12px", height: "12px", borderBottom: "2px solid var(--accent-cyan)", borderLeft: "2px solid var(--accent-cyan)" }} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: "12px", height: "12px", borderBottom: "2px solid var(--accent-cyan)", borderRight: "2px solid var(--accent-cyan)" }} />
              
              {/* Laser line moving across screen */}
              {isPlaying && (
                <div 
                  style={{ 
                    position: "absolute", 
                    left: 0, 
                    right: 0, 
                    height: "2px", 
                    background: "rgba(6, 182, 212, 0.5)", 
                    boxShadow: "0 0 10px var(--accent-cyan)",
                    animation: "scanLine 3s infinite linear"
                  }} 
                />
              )}
            </div>

            {/* Video Analysis Status Panel */}
            <div style={{ textAlign: "center", zIndex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {videoStatus === "processing" ? (
                <>
                  <Cpu style={{ margin: "0 auto", animation: "spin 2s linear infinite", color: "var(--accent-cyan)" }} size={40} />
                  <div style={{ fontWeight: 600 }}>AI ANALYZING VIDEO...</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>YOLOv11 Processing: {progress}%</div>
                  <div style={{ width: "200px", height: "4px", background: "#27272a", borderRadius: "2px", overflow: "hidden", margin: "0 auto" }}>
                    <div style={{ height: "100%", background: "var(--accent-cyan)", width: `${progress}%`, transition: "width 0.2s" }} />
                  </div>
                </>
              ) : videoStatus === "queued" ? (
                <>
                  <Cpu style={{ margin: "0 auto", color: "var(--text-muted)" }} size={40} />
                  <div style={{ fontWeight: 600 }}>VIDEO IN QUEUE</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Click "Analyze Video Feed" to trigger AI pipeline</div>
                </>
              ) : (
                <>
                  <Eye style={{ margin: "0 auto", color: isPlaying ? "var(--accent-emerald)" : "var(--text-muted)" }} size={48} />
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, letterSpacing: "1px" }}>
                    {isPlaying ? "LIVE CV TELEMETRY ON" : "CAMERA IDLE - CLICK PLAY"}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                    Using YOLOv11 + Segment Anything (SAM)
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Bounding Boxes */}
        {isPlaying && activeBoxes.map((box, idx) => (
          <div
            key={idx}
            className="bounding-box"
            style={{
              borderColor: box.color,
              top: box.top,
              left: box.left,
              width: box.width,
              height: box.height,
              backgroundColor: `${box.color}15`,
            }}
          >
            <div className="bounding-box-label" style={{ backgroundColor: box.color }}>
              {box.label}
            </div>
          </div>
        ))}
      </div>

      {/* Control bar */}
      <div 
        className="glass-panel" 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "0.75rem 1rem",
          background: "rgba(18, 18, 20, 0.4)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: "0.5rem 1rem", fontSize: "0.75rem", display: "flex", gap: "0.4rem", alignItems: "center" }}
            onClick={handlePlayToggle}
            disabled={videoStatus === "processing"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? "Pause Feed" : "Start Feed"}
          </button>
          
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Frame Offset: <strong style={{ color: "#fff" }}>{currentTime.toFixed(1)}s</strong> / 60.0s
          </div>
        </div>

        {/* CV Metrics HUD */}
        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.75rem" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ color: "var(--text-secondary)" }}>Current Stage</span>
            <strong style={{ color: "var(--accent-cyan)", textTransform: "uppercase" }}>{currentStage}</strong>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ color: "var(--text-secondary)" }}>Detected Workers</span>
            <strong>{activeBoxes.filter(b => b.label.includes("Worker")).length} Active</strong>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ color: "var(--text-secondary)" }}>Active Machinery</span>
            <strong>
              {Object.entries(machineryCounts).filter(([_, val]) => val > 0).map(([k, _]) => k.toUpperCase()).join(", ") || "None"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
