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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8002))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
