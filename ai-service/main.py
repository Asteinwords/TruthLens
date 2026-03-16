import os
import uvicorn
# Analysis imports moved inside endpoints for Ultra-Fast Boot
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TruthLens AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    lite_mode = os.getenv("LITE_MODE") == "true"
    return {
        "status": "ok", 
        "service": "TruthLens AI Analysis Service",
        "lite_mode": lite_mode,
        "note": "Running in high-performance mode" if not lite_mode else "Running in Lite Mode (Free Tier optimized)"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    from analyzer import analyze_media
    content = await file.read()
    result = analyze_media(content, file.filename, file.content_type)
    return result

@app.post("/text/analyze")
async def analyze_text_endpoint(file: UploadFile = File(None), text: str = Form(None)):
    from text_analyzer import analyze_text
    if file:
        content = await file.read()
        filename = file.filename
    elif text:
        content = text.encode()
        filename = "pasted_text.txt"
    else:
        return {"error": "No text or file provided"}

    result = analyze_text(content, filename)
    return result

@app.post("/text/humanize")
async def humanize_endpoint(text: str = Form(...)):
    from text_analyzer import humanize_text
    humanized = humanize_text(text)
    return {"humanizedText": humanized}

def warm_models():
    """Background thread to pre-load models for snappy first-request response."""
    import time
    from analyzer import get_ateeqq_model
    from text_analyzer import get_transformer_model
    
    print("🚀 Starting staggered model warming (Safe-Boot Mode)...")
    time.sleep(8) # Wait for Render to definitely see the port as open
    
    try: 
        print("Warming Layer 1: Ateeqq Neural (Image)...")
        get_ateeqq_model()
        print("✅ Layer 1 Ready.")
        time.sleep(5) 
    except Exception as e: 
        print(f"⚠️ Layer 1 Warming Failed: {e}")
    
    try: 
        print("Warming Layer 2: DeBERTa Neural (Text)...")
        get_transformer_model()
        print("✅ Layer 2 Ready.")
        time.sleep(5)
    except Exception as e: 
        print(f"⚠️ Layer 2 Warming Failed: {e}")

    print("✅ Staggered warming sequence complete. Server is active.")

if __name__ == "__main__":
    import threading
    # Start warming in background so port binds INSTANTLY
    threading.Thread(target=warm_models, daemon=True).start()
    
    port = int(os.environ.get("PORT", 8002))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
