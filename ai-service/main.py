from analyzer import analyze_media
from text_analyzer import analyze_text, humanize_text
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
    return {"status": "ok", "service": "TruthLens AI Analysis Service"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    content = await file.read()
    result = analyze_media(content, file.filename, file.content_type)
    return result

@app.post("/text/analyze")
async def analyze_text_endpoint(file: UploadFile = File(None), text: str = Form(None)):
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
    humanized = humanize_text(text)
    return {"humanizedText": humanized}
