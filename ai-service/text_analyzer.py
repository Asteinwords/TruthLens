import io
import docx
import PyPDF2
import re
import numpy as np
import random
import time
import os
from collections import Counter
from typing import Dict
from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential
from dotenv import load_dotenv

load_dotenv()

# === YOUR KEYS ===
OPENROUTER_KEY = os.getenv("OPENAI_KEY", "")
GROQ_KEY       = os.getenv("GROQ_KEY", "")
TOGETHER_KEY   = os.getenv("TOGETHER_KEY", "")

PROVIDERS = [
    {"name": "Groq",      "client": OpenAI(base_url="https://api.groq.com/openai/v1", api_key=GROQ_KEY),      "models": ["llama-3.2-3b-instruct"]},
    {"name": "OpenRouter","client": OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_KEY), "models": ["meta-llama/llama-3.2-3b-instruct:free"]},
    {"name": "Together",  "client": OpenAI(base_url="https://api.together.xyz/v1", api_key=TOGETHER_KEY),    "models": ["meta-llama/Llama-3.2-3B-Instruct-Turbo"]},
]

# === ULTRA-STRONG HUMANIZER PROMPT (2026 version) ===
HUMANIZER_PROMPT = """
Rewrite this text so it sounds like a real human wrote it casually. 
Rules (follow strictly):
- Mix very short sentences with longer ones and occasional fragments
- Use contractions (I'm, don't, it's, you're, that's)
- Add natural fillers sometimes (well, honestly, tbh, you know, kinda, like)
- Throw in light personal asides or opinions ("it's kinda crazy", "I mean...")
- Vary vocabulary and rhythm — never sound too perfect or repetitive
- Keep EXACT same meaning, facts, and length (±10%)
- Make it feel like a normal person typing quickly, not a robot

Original:
{text}

Human version:
"""

def extract_text(content: bytes, filename: str) -> str:
    ext = filename.lower().rsplit('.', 1)[-1]
    try:
        if ext == 'pdf':
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        elif ext in ('docx', 'doc'):
            doc = docx.Document(io.BytesIO(content))
            return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        else:
            return content.decode('utf-8', errors='replace')
    except:
        return content.decode('utf-8', errors='replace')

def detect_ai_text(text: str) -> Dict:
    if len(text.strip()) < 80:
        return {"ai_probability": 8.0, "human_probability": 92.0, "verdict": "Too short"}

    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    words = text.lower().split()
    n_words = len(words)

    # 1. Burstiness + uniformity
    sent_len = np.array([len(s.split()) for s in sentences])
    burst = np.var(sent_len) / (np.mean(sent_len) + 1e-6)
    uniformity = 1 if np.std(sent_len) < 6 and np.mean(sent_len) > 15 else 0

    # 2. Repetition + diversity
    unique_ratio = len(set(words)) / n_words if n_words else 1
    top_freq = sum(v for _, v in Counter(words).most_common(8)) / n_words

    # 3. Motivational keyword overload (your example text killer)
    motiv_patterns = r'\b(embrace|journey|possibilit|resilien|optimis|passion|meaningful|difference|grow|learn|adventure|challenge|opportunity|personal development|small actions|big impact)\b'
    motiv_count = len(re.findall(motiv_patterns, text.lower()))

    # 4. Perplexity from Groq (strongest free signal)
    try:
        groq = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=GROQ_KEY)
        resp = groq.completions.create(
            model="llama-3.2-3b-instruct",
            prompt=f"Continue naturally: {text[:600]}",
            max_tokens=8,
            logprobs=True,
            temperature=0
        )
        logprobs = resp.choices[0].logprobs.token_logprobs[:6]
        perplexity = np.exp(-np.mean(logprobs)) if logprobs else 120
    except:
        perplexity = 80

    # Final ensemble score (tuned aggressively)
    score = (
        (1 - burst) * 35 +
        (1 - unique_ratio) * 45 +
        top_freq * 70 +
        motiv_count * 9 +
        uniformity * 38 +
        max(0, (80 - perplexity) * 0.9)
    )

    ai_prob = round(min(98, max(5, score * 0.92)), 1)

    verdict = "Very likely AI" if ai_prob > 75 else "Likely AI" if ai_prob > 50 else "Likely Human"

    return {
        "ai_probability": ai_prob,
        "human_probability": round(100 - ai_prob, 1),
        "verdict": verdict,
        "word_count": n_words,
        "details": {
            "burstiness": round(burst, 2),
            "unique_word_ratio": round(unique_ratio, 3),
            "motivational_markers": motiv_count,
            "perplexity_score": round(perplexity, 1)
        }
    }

# === PRODUCTION-GRADE HUMANIZER WITH ROTATION + BACKOFF ===
@retry(stop=stop_after_attempt(6), wait=wait_exponential(multiplier=2, min=3, max=45))
def humanize_text(text: str) -> str:
    truncated = text[:3800]
    prompt = HUMANIZER_PROMPT.format(text=truncated)

    shuffled = PROVIDERS[:]
    random.shuffle(shuffled)

    for p in shuffled:
        try:
            client = p["client"]
            model = random.choice(p["models"])

            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a very casual, natural-sounding human writer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.89,
                top_p=0.93,
                max_tokens=2200,
                timeout=25
            )
            return response.choices[0].message.content.strip()

        except Exception as e:
            print(f"{p['name']} failed → trying next: {str(e)}")
            time.sleep(1)

    return "All free providers are currently rate-limited. Please wait 5–10 minutes and try again."

def analyze_text(content: bytes, filename: str) -> dict:
    text = extract_text(content, filename)
    detection = detect_ai_text(text)
    return {
        "originalText": text[:4000] + ("..." if len(text) > 4000 else ""),
        "aiProbability": detection["ai_probability"],
        "humanProbability": detection["human_probability"],
        "verdict": detection["verdict"],
        "wordCount": detection["word_count"],
        "details": detection.get("details", {}),
        "metadata": {"filename": filename, "charCount": len(text)}
    }
