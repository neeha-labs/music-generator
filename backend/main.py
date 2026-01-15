import os
import time
import uuid
from typing import Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import replicate
from dotenv import load_dotenv

# 1. Load Environment Variables (Local development support)
load_dotenv()

# 2. Secure Configuration
# In production, these are set in the Render Dashboard.
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
if not REPLICATE_API_TOKEN:
    print("WARNING: REPLICATE_API_TOKEN is not set. Music generation will fail.")

# Ensure Replicate library finds the token
os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN or ""

app = FastAPI(title="SonicForge AI Backend")

# 3. Production CORS
# Allow requests from your Vercel frontend and Localhost
origins = [
    "http://localhost:3000",
    "http://localhost:5173", # Common Vite port
    "*", # For development/demo. In strict production, replace '*' with your Vercel URL (e.g., https://sonicforge.vercel.app)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models ---

class MusicRequest(BaseModel):
    lyrics: str
    genre: str
    duration: int = 30

class MusicResponse(BaseModel):
    id: str
    url: str
    status: str
    error: Optional[str] = None

# --- Routes ---

@app.get("/")
def health_check():
    return {"status": "active", "service": "SonicForge Backend"}

@app.post("/generate-music", response_model=MusicResponse)
def generate_music(request: MusicRequest):
    """
    Orchestrates the music generation process.
    Connects to Meta's MusicGen model via Replicate.
    """
    try:
        if not REPLICATE_API_TOKEN:
             raise HTTPException(status_code=500, detail="Server Error: API Token missing in backend configuration.")

        print(f"Starting music generation for genre: {request.genre}")
        
        # Enhanced Prompt Engineering
        style_context = ""
        if "kid" in request.genre.lower() or "nursery" in request.genre.lower():
            style_context = "simple, catchy, joyful, playful, children's music, xylophone, bright melody"
        elif "jazz" in request.genre.lower():
            style_context = "smooth jazz, saxophone, double bass, swing rhythm"
        else:
            style_context = "high quality, clear audio"

        prompt = f"A {request.genre} song. {style_context}. Vibe: {request.lyrics[:200]}"
        print(f"Using prompt: {prompt}")

        # Call MusicGen via Replicate
        output = replicate.run(
            "meta/musicgen:671ac645ce5e552cc63a54a2bb959550fea9bd976194843d75cd2d12337499d7",
            input={
                "prompt": prompt,
                "duration": request.duration,
                "model_version": "stereo-large",
                "output_format": "mp3",
                "normalization_strategy": "peak"
            }
        )
        
        music_url = str(output)
        print(f"Generation successful: {music_url}")
        
        return MusicResponse(
            id=str(uuid.uuid4()),
            url=music_url,
            status="completed"
        )

    except replicate.exceptions.ReplicateError as re:
        print(f"Replicate API Error: {re}")
        raise HTTPException(status_code=401, detail=f"AI Provider Error: {str(re)}")
        
    except Exception as e:
        print(f"General Error during music generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/convert-vocals")
async def convert_vocals(
    file: UploadFile = File(...),
    target_voice: str = Form(...)
):
    """
    Handles RVC (Retrieval-based Voice Conversion).
    """
    file_location = ""
    try:
        file_id = str(uuid.uuid4())
        file_location = f"/tmp/{file_id}_{file.filename}"
        os.makedirs("/tmp", exist_ok=True)
        
        with open(file_location, "wb+") as file_object:
            file_object.write(file.file.read())
            
        print(f"Processing vocal conversion for {file.filename}")
        
        # Mocking RVC response for demo as it requires S3 upload setup
        time.sleep(2)
        
        return {
            "id": file_id,
            "original_name": file.filename,
            "converted_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            "status": "completed"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if file_location and os.path.exists(file_location):
            os.remove(file_location)

if __name__ == "__main__":
    import uvicorn
    # 4. Dynamic Port Configuration for Render
    # Render assigns a PORT env var. If not found, default to 8000 (local).
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
