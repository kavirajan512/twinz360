import os
import uuid
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from PIL import Image
import io
import trimesh
# import rembg
# from tsr.system import TSR # TripoSR system (mocked for this implementation)

app = FastAPI(title="AeroTwin AI: Image-to-3D Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# STORAGE_DIR should ideally mount to the frontend's public/storage/glb folder for instant access
STORAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/public/storage/glb"))
os.makedirs(STORAGE_DIR, exist_ok=True)

# ---------------------------------------------------------
# MOCK MODEL INITIALIZATION (Replace with actual TripoSR)
# ---------------------------------------------------------
# print("Loading TripoSR Model into VRAM...")
# model = TSR.from_pretrained("stabilityai/TripoSR", config_name="config.yaml", weight_name="model.ckpt")
# model.cuda()
# print("Model Loaded!")

@app.post("/api/v1/generate-3d")
async def generate_3d_model(file: UploadFile = None):
    """
    Accepts an image file (e.g., floor plan, sketch) and processes it
    through the Image-to-3D Feed-Forward Network to return a GLB mesh.
    """
    try:
        # 1. Read Image
        if file:
            try:
                image_bytes = await file.read()
                image = Image.open(io.BytesIO(image_bytes))
                print(f"Received Image: {image.size}")
            except Exception:
                print("Warning: Could not read image, proceeding with dummy generation.")
        
        # 2. Pre-process Image (Remove Background using rembg)
        # processed_image = rembg.remove(image)
        # processed_image = processed_image.resize((512, 512)) # TripoSR standard
        print(f"Received Image: {image.size}")
        
        # 3. AI Inference (Generate 3D Triplane and Mesh)
        # with torch.no_grad():
        #     scene_codes = model(processed_image.unsqueeze(0).cuda())
        #     meshes = model.extract_mesh(scene_codes)
        #     out_mesh = meshes[0]
        print("Running AI Inference... (Simulated < 1s generation)")
        
        # 4. Post-processing & Export (Save as .glb)
        # For this setup, we just create a dummy trimesh box and export it as GLB
        # In production, `out_mesh` is passed to trimesh
        scene = trimesh.Scene()
        mesh = trimesh.creation.box(extents=(2, 0.2, 2))
        mesh.visual.vertex_colors = [200, 200, 200, 255]
        scene.add_geometry(mesh)
        
        file_id = str(uuid.uuid4())
        filename = f"generated_model_{file_id}.glb"
        filepath = os.path.join(STORAGE_DIR, filename)
        
        # Export GLB
        scene.export(filepath, file_type='glb')
        
        # 5. Return frontend-accessible URL
        url = f"/storage/glb/{filename}"
        
        return JSONResponse(status_code=200, content={
            "status": "success",
            "message": "3D Model generated successfully.",
            "glb_url": url,
            "inference_time_ms": 842 # Example real-time stat
        })

    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
