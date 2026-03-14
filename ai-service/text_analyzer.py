import io
import docx
import PyPDF2
import re
import numpy as np
from typing import Dict, Optional
from openai import OpenAI
import random
import os
from collections import Counter
import math

# --- API Keys (Cloud Redundancy) ---
OPENAI_KEY = os.getenv("OPENAI_KEY", "")
GROQ_KEY = os.getenv("GROQ_KEY", "")
TOGETHER_KEY = os.getenv("TOGETHER_KEY", "")

# --- Cloud Humanization Ensemble ---
PROVIDERS = [
    {
        "name": "OpenRouter",
        "client": OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENAI_KEY),
        "models": ["meta-llama/llama-3.2-3b-instruct:free", "meta-llama/llama-3.2-1b-instruct:free"]
    },
    {
        "name": "Groq",
        "client": OpenAI(base_url="https://api.groq.com/openai/v1", api_key=GROQ_KEY),
        "models": ["llama-3.2-3b-instruct", "llama-3.2-1b-instruct"]
    },
    {
        "name": "Together",
        "client": OpenAI(base_url="https://api.together.xyz/v1", api_key=TOGETHER_KEY),
        "models": ["meta-llama/Llama-3.2-3B-Instruct-Turbo", "meta-llama/Llama-3.2-1B-Instruct"]
    }
]

HUMANIZER_PROMPT = """
Rewrite the following text to sound 100% like natural, casual human writing — as if a real person in their 20s–30s wrote it quickly for a blog, Reddit, or WhatsApp group.
Rules you MUST follow:
- Mix very short sentences, medium ones, and a few longer rambling ones (High Burstiness).
- Use contractions everywhere (I'm, don't, it's, you're).
- Add tiny human imperfections: fillers (like, well, honestly, you know, kinda), slight transitions if it fits.
- Throw in casual transitions or asides (I mean..., right?, tbh, anyway...).
- Vary vocabulary — don't repeat the same fancy academic words.
- Add light emotion or opinion where natural ("it's kinda wild", "super annoying tbh").
- Keep EXACT same facts, meaning, length (±15%), and structure — do NOT add/remove info.
- Make it feel personal and imperfect, never too polished or robotic.

Original text:
{text}

Your humanized version:
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

def entropy(text: str) -> float:
    """Shannon entropy — AI text often has lower entropy (more predictable)"""
    if not text:
        return 0.0
    counter = Counter(text.lower())
    total = len(text)
    return -sum((count / total) * math.log2(count / total) for count in counter.values() if count > 0)

def detect_ai_text(text: str) -> Dict:
    """2026-strengthened statistical + rule-based detector"""
    text = text.strip()
    if len(text) < 80:
        return {"ai_probability": 5.0, "human_probability": 95.0, "verdict": "Too short for forensic confidence", "details": {}}

    # -- Pre-processing --
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    words_all = [w for s in sentences for w in s.split() if w.strip()]
    n_sentences = len(sentences)
    n_words = len(words_all)

    if n_sentences < 3 or n_words < 50:
        return {"ai_probability": 10.0, "human_probability": 90.0, "verdict": "Likely Human (Insufficient length for AI analysis)"}

    # -- Core metrics --

    # 1. Sentence length variance (burstiness) – humans vary more
    sent_lengths = np.array([len(s.split()) for s in sentences])
    mean_len = np.mean(sent_lengths)
    burstiness = np.var(sent_lengths) / (mean_len + 1e-6) if mean_len > 0 else 0

    # 2. Word diversity
    unique_ratio = len(set(words_all)) / n_words if n_words else 1.0
    top_10_freq = sum(v for _, v in Counter(words_all).most_common(10)) / n_words if n_words else 0

    # 3. Entropy (character level) – AI often too uniform
    char_entropy = entropy(text)

    # 4. Motivational / generic phrase penalty
    motivational_markers = [
        r'\b(embrace|journey|possibilit|resilien|optimis|passion|meaningful|difference|grow|learn|adventure|challenge|optimistic|resilient)\b',
        r'\b(every moment|small actions|big impact|stay true|continuous story|let your|guide you|personal development)\b',
        r'\b(incredible|transform|endless|step outside|comfort zone|face challenges|create a meaningful)\b'
    ]
    motiv_count = sum(len(re.findall(pat, text.lower())) for pat in motivational_markers)

    # 5. Sentence uniformity penalty
    len_std = np.std(sent_lengths)
    uniformity_penalty = 0
    if len_std < 5 and mean_len > 12 and n_sentences > 6:
        uniformity_penalty = 35   # suspiciously consistent sentences

    # Combined score (tuned on 2025–2026 LLM outputs)
    score_components = {
        "low_burstiness": max(0, 40 - burstiness * 25),
        "low_diversity": max(0, (1 - unique_ratio) * 80),
        "high_top_words": top_10_freq * 100,
        "low_entropy": max(0, (4.2 - char_entropy) * 25),
        "motivational_overload": min(40, motiv_count * 8),
        "uniform_sentences": uniformity_penalty,
    }

    raw_score = sum(score_components.values())
    ai_prob = min(98.0, max(3.0, raw_score * 0.85))

    if ai_prob > 75:
        verdict = "Very High Confidence: AI Generated"
    elif ai_prob > 55:
        verdict = "Likely: AI Generated"
    elif ai_prob < 30:
        verdict = "High Confidence: Organic Human"
    else:
        verdict = "Uncertain: Mixed patterns detected"

    return {
        "ai_probability": round(ai_prob, 1),
        "human_probability": round(100 - ai_prob, 1),
        "verdict": verdict,
        "details": {
            "burstiness": round(burstiness, 2),
            "unique_word_ratio": round(unique_ratio, 3),
            "char_entropy": round(char_entropy, 2),
            "motivational_markers": motiv_count,
            "uniformity_penalty": uniformity_penalty,
        },
        "word_count": n_words,
        "sentence_count": n_sentences
    }

def get_random_provider():
    provider = random.choice(PROVIDERS)
    model = random.choice(provider["models"])
    return provider["client"], model, provider["name"]

def humanize_text(text: str) -> str:
    """Try cloud providers in random order until success"""
    truncated = text[:3800]
    prompt_text = HUMANIZER_PROMPT.format(text=truncated)
    for _ in range(3):
        try:
            client, model, provider_name = get_random_provider()
            print(f"Using {provider_name} for humanization...")
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a very casual, natural-sounding human writer."},
                    {"role": "user", "content": prompt_text}
                ],
                temperature=0.88,
                top_p=0.94,
                max_tokens=2200,
                timeout=45
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"{provider_name} failed: {str(e)} — trying next...")
    return "Humanization failed — all free cloud providers are rate-limited. Try again in a few minutes."

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
