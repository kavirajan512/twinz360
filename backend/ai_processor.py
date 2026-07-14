import os
import time
import random
import json
from sqlmodel import Session
from database import engine, Video, DetectionFrame, SafetyAlert

try:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except Exception:
    client = None

def simulate_video_analysis(video_id: int):
    api_key = os.getenv("OPENAI_API_KEY")
    use_real_ai = api_key and api_key != "your_openai_api_key_here" and client is not None

    with Session(engine) as session:
        video = session.get(Video, video_id)
        if not video:
            return
        
        video.status = "processing"
        video.progress = 0
        session.add(video)
        session.commit()
        
        duration = 60.0
        video.duration = duration
        session.add(video)
        session.commit()
        
        stages = [
            ("Site Clearing", 0, 15),
            ("Excavation", 16, 35),
            ("Foundation", 36, 55),
            ("Columns", 56, 70),
            ("Beams", 71, 80),
            ("Brick Walls", 81, 90),
            ("Roofing", 91, 100)
        ]
        
        steps = 10
        for i in range(1, steps + 1):
            time.sleep(1.5 if not use_real_ai else 3.0) 
            progress_pct = int((i / steps) * 100)
            
            video = session.get(Video, video_id)
            if not video:
                break
            video.progress = progress_pct
            session.add(video)
            
            current_stage = "Site Clearing"
            for stage_name, start, end in stages:
                if start <= progress_pct <= end:
                    current_stage = stage_name
                    break
            
            timestamp = (i / steps) * duration
            
            if use_real_ai:
                # Real AI Integration Placeholder
                # In production, extract frame via cv2/ffmpeg and pass base64 image to OpenAI GPT-4o
                try:
                    response = client.chat.completions.create(
                        model="gpt-4o",
                        messages=[
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": "Analyze this construction site frame. Return JSON with keys: worker_count, ppe_compliant, ppe_non_compliant, machinery (dict), materials (dict)."},
                                    # {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_frame}"}}
                                ],
                            }
                        ],
                        response_format={ "type": "json_object" }
                    )
                    # For now, simulate the JSON return since we don't have real frames
                    ai_data = {"worker_count": random.randint(6,15), "ppe_non_compliant": random.randint(0,2)}
                    worker_count = ai_data["worker_count"]
                    ppe_non_compliant = ai_data["ppe_non_compliant"]
                    ppe_compliant = worker_count - ppe_non_compliant
                    machinery = {"crane": 1} if progress_pct >= 50 else {}
                    materials = {"bricks": 100} if progress_pct >= 50 else {}
                except Exception as e:
                    print(f"OpenAI API Error: {e}")
                    worker_count, ppe_non_compliant, ppe_compliant, machinery, materials = 10, 0, 10, {}, {}
            else:
                worker_count = random.randint(6, 15)
                ppe_non_compliant = random.randint(1, 2) if random.random() < 0.30 else 0
                ppe_compliant = max(0, worker_count - ppe_non_compliant)
                
                machinery = {}
                if progress_pct <= 40: machinery["excavator"] = random.randint(1, 2)
                if 30 <= progress_pct <= 80:
                    machinery["concrete_mixer"] = random.randint(1, 2)
                    machinery["cement_truck"] = random.randint(0, 1)
                if progress_pct >= 50: machinery["crane"] = 1
                    
                materials = {}
                if progress_pct <= 50: materials["steel_bars"] = random.randint(5, 15)
                else:
                    materials["bricks"] = random.randint(20, 100)
                    materials["steel_bars"] = random.randint(2, 6)
                
            frame = DetectionFrame(
                video_id=video_id,
                timestamp=timestamp,
                worker_count=worker_count,
                ppe_compliant_count=ppe_compliant,
                ppe_non_compliant_count=ppe_non_compliant,
                machinery_json=json.dumps(machinery),
                materials_json=json.dumps(materials),
                construction_stage=current_stage
            )
            session.add(frame)
            
            if ppe_non_compliant > 0:
                alert_type = random.choice(["no_helmet", "no_vest"])
                desc = f"Detected {ppe_non_compliant} worker(s) without safety {'helmet' if alert_type == 'no_helmet' else 'vest'} near Section {random.choice(['A', 'B', 'C'])}."
                alert = SafetyAlert(
                    video_id=video_id,
                    timestamp=timestamp,
                    alert_type=alert_type,
                    description=desc,
                    status="open"
                )
                session.add(alert)
                
            session.commit()
            
        video = session.get(Video, video_id)
        if video:
            video.status = "completed"
            video.progress = 100
            session.add(video)
            session.commit()
