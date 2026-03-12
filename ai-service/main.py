from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from analyzer import analyze_media

app = FastAPI(title="TruthLens AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "service": "TruthLens AI Analysis Service"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    content = await file.read()
    result = analyze_media(content, file.filename, file.content_type)
    return result
