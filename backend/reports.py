from sqlmodel import Session, select
from database import Project, Video, DetectionFrame, SafetyAlert, DroneFlight
import json
import datetime

def generate_project_report(project_id: int, report_type: str, session: Session) -> dict:
    # 1. Fetch project details
    project = session.get(Project, project_id)
    if not project:
        return {"error": "Project not found"}
    
    # 2. Fetch videos
    videos = session.exec(select(Video).where(Video.project_id == project_id)).all()
    video_ids = [v.id for v in videos]
    
    # 3. Fetch detections and alerts
    frames = []
    alerts = []
    if video_ids:
        frames = session.exec(select(DetectionFrame).where(DetectionFrame.video_id.in_(video_ids))).all()
        alerts = session.exec(select(SafetyAlert).where(SafetyAlert.video_id.in_(video_ids))).all()
        
    # 4. Fetch flights
    flights = session.exec(select(DroneFlight).where(DroneFlight.project_id == project_id)).all()
    
    # Calculate statistics
    total_videos = len(videos)
    total_alerts = len(alerts)
    open_alerts = sum(1 for a in alerts if a.status == "open")
    resolved_alerts = total_alerts - open_alerts
    
    # Average worker count
    avg_workers = 0
    if frames:
        avg_workers = sum(f.worker_count for f in frames) / len(frames)
        
    # Alert breakdown
    alert_breakdown = {"no_helmet": 0, "no_vest": 0, "restricted_area": 0, "unsafe_worker": 0}
    for a in alerts:
        if a.alert_type in alert_breakdown:
            alert_breakdown[a.alert_type] += 1
            
    # Construction stages present
    stages_detected = list(set(f.construction_stage for f in frames))
    
    # Report periods
    today = datetime.date.today().strftime("%B %d, %Y")
    
    # Create HTML Report Template
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{project.name} - {report_type.capitalize()} Report</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #333;
                line-height: 1.6;
                padding: 40px;
                background: #fdfdfd;
            }}
            .header {{
                border-bottom: 2px solid #22c55e;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }}
            .header h1 {{
                margin: 0;
                color: #1e293b;
                font-size: 28px;
            }}
            .meta-info {{
                display: flex;
                justify-content: space-between;
                color: #64748b;
                font-size: 14px;
                margin-top: 10px;
            }}
            .grid {{
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-bottom: 30px;
            }}
            .card {{
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
            }}
            .card h3 {{
                margin: 0 0 10px 0;
                color: #64748b;
                font-size: 14px;
                text-transform: uppercase;
            }}
            .card .value {{
                font-size: 32px;
                font-weight: bold;
                color: #0f172a;
            }}
            .section {{
                margin-bottom: 40px;
            }}
            .section h2 {{
                color: #1e293b;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 8px;
                margin-bottom: 20px;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }}
            th, td {{
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #e2e8f0;
            }}
            th {{
                background-color: #f1f5f9;
                color: #475569;
                font-weight: 600;
            }}
            .badge {{
                display: inline-block;
                padding: 4px 8px;
                border-radius: 9999px;
                font-size: 12px;
                font-weight: 500;
            }}
            .badge-danger {{
                background: #fee2e2;
                color: #991b1b;
            }}
            .badge-success {{
                background: #dcfce7;
                color: #166534;
            }}
            .footer {{
                text-align: center;
                margin-top: 60px;
                color: #94a3b8;
                font-size: 12px;
                border-top: 1px solid #e2e8f0;
                padding-top: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{project.name}</h1>
            <div class="meta-info">
                <span>Report Type: <strong>{report_type.upper()} REPORT</strong></span>
                <span>Generated On: <strong>{today}</strong></span>
                <span>Project Status: <strong>{project.status.upper()}</strong></span>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>Drone Flights Logged</h3>
                <div class="value">{len(flights)}</div>
            </div>
            <div class="card">
                <h3>AI Analysis Sessions</h3>
                <div class="value">{total_videos}</div>
            </div>
            <div class="card">
                <h3>Total Safety Violations</h3>
                <div class="value" style="color: {'#ef4444' if total_alerts > 0 else '#1e293b'}">{total_alerts}</div>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>Open Safety Alerts</h3>
                <div class="value" style="color: #ef4444">{open_alerts}</div>
            </div>
            <div class="card">
                <h3>Resolved Safety Alerts</h3>
                <div class="value" style="color: #22c55e">{resolved_alerts}</div>
            </div>
            <div class="card">
                <h3>Avg Workers On-Site</h3>
                <div class="value">{avg_workers:.1f}</div>
            </div>
        </div>

        <div class="section">
            <h2>Safety Incidents & Violations</h2>
            {f"<p>No safety incidents recorded during this reporting cycle.</p>" if not alerts else """
            <table>
                <thead>
                    <tr>
                        <th>Timestamp (Offset)</th>
                        <th>Alert Type</th>
                        <th>Description</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
            """ + "".join([f"""
                    <tr>
                        <td>{a.timestamp:.1f}s</td>
                        <td><span class="badge badge-danger">{a.alert_type.replace('_', ' ').upper()}</span></td>
                        <td>{a.description}</td>
                        <td>{a.status.upper()}</td>
                    </tr>
            """ for a in alerts]) + """
                </tbody>
            </table>
            """}
        </div>

        <div class="section">
            <h2>Construction Stages Identified</h2>
            <ul>
                {"".join([f"<li>{stage}</li>" for stage in (stages_detected if stages_detected else ["None Detected"])])}
            </ul>
        </div>

        <div class="section">
            <h2>Drone Log & Flight Paths</h2>
            {f"<p>No flights recorded.</p>" if not flights else """
            <table>
                <thead>
                    <tr>
                        <th>Flight Name</th>
                        <th>Flight Date</th>
                        <th>Log Summary</th>
                    </tr>
                </thead>
                <tbody>
            """ + "".join([f"""
                    <tr>
                        <td>{f.flight_name}</td>
                        <td>{f.flight_date.strftime('%Y-%m-%d %H:%M:%S')}</td>
                        <td>Flight path coordinates logged ({len(json.loads(f.flight_path_json))} points)</td>
                    </tr>
            """ for f in flights]) + """
                </tbody>
            </table>
            """}
        </div>

        <div class="footer">
            <p>AI-Powered Digital Twin Construction Monitoring Platform &bull; Automated Report</p>
        </div>
    </body>
    </html>
    """

    return {
        "project_id": project_id,
        "report_type": report_type,
        "date_generated": today,
        "statistics": {
            "total_videos": total_videos,
            "total_alerts": total_alerts,
            "open_alerts": open_alerts,
            "resolved_alerts": resolved_alerts,
            "avg_workers": avg_workers,
            "alert_breakdown": alert_breakdown,
            "stages_detected": stages_detected,
            "total_flights": len(flights)
        },
        "html": html_content
    }
