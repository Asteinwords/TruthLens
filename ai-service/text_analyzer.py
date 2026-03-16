import io
import re
import random
import time
import json
import os
from collections import Counter
from functools import lru_cache
from typing import Dict
from tenacity import retry, stop_after_attempt, wait_exponential
from dotenv import load_dotenv

load_dotenv()

# --- Lazy Dependency Loaders ---
@lru_cache(None)
def get_torch():
    import torch
    return torch

@lru_cache(None)
def get_numpy():
    import numpy as np
    return np

@lru_cache(None)
def get_transformers():
    from transformers import AutoTokenizer, AutoModelForSequenceClassification, GPT2LMHeadModel, GPT2Tokenizer
    return AutoTokenizer, AutoModelForSequenceClassification, GPT2LMHeadModel, GPT2Tokenizer

@lru_cache(None)
def get_nltk():
    import nltk
    return nltk

@lru_cache(None)
def get_pypdf2():
    import PyPDF2
    return PyPDF2

@lru_cache(None)
def get_docx():
    import docx
    return docx

# === YOUR KEYS (Loading from .env to avoid Git Secret Scanning) ===
OPENROUTER_KEY = os.getenv("OPENROUTER_KEY", "")
OPENAI_KEY     = os.getenv("OPENAI_KEY", "")
GROQ_KEY       = os.getenv("GROQ_KEY", "")
TOGETHER_KEY   = os.getenv("TOGETHER_KEY", "")

PROVIDERS = [
    {"name": "Groq",      "client": OpenAI(base_url="https://api.groq.com/openai/v1", api_key=GROQ_KEY),      "models": ["llama-3.2-3b-instruct"]},
    {"name": "OpenRouter","client": OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_KEY), "models": ["meta-llama/llama-3.2-3b-instruct:free"]},
    {"name": "Together",  "client": OpenAI(base_url="https://api.together.xyz/v1", api_key=TOGETHER_KEY),    "models": ["meta-llama/Llama-3.2-3B-Instruct-Turbo"]},
]

# === INSANELY STRONG 3-PASS HUMANIZER PROMPT ===
def get_humanizer_prompt(stage: int):
    return """
Rewrite this text so it sounds naturally written by a human.

Requirements:
- Preserve the original tone and meaning
- Avoid perfect academic structure
- Vary sentence lengths significantly
- Use natural rhythm and phrasing
- Avoid predictable AI transitions
- Some sentences can be shorter
- Avoid overly polished wording

Human writing traits:
- slight structural variation
- occasional uneven sentence flow
- natural phrasing rather than perfect grammar symmetry

Text:
{text}

Rewrite:
"""

def extract_text(content: bytes, filename: str) -> str:
    ext = filename.lower().rsplit('.', 1)[-1]
    try:
        if ext == 'pdf':
            PyPDF2 = get_pypdf2()
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        elif ext in ('docx', 'doc'):
            docx = get_docx()
            doc = docx.Document(io.BytesIO(content))
            return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        else:
            return content.decode('utf-8', errors='replace')
    except:
        return content.decode('utf-8', errors='replace')

import math

# === NLTK Assets (Lazy downloaded on first use) ===
@lru_cache(None)
def download_nltk_assets():
    nltk = get_nltk()
    try:
        print("Checking NLTK assets...")
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        try:
            nltk.data.find('tokenizers/punkt_tab')
        except LookupError:
            nltk.download('punkt_tab')
        return True
    except Exception as e:
        print(f"NLTK Download Failed: {e}")
        return False

# === MODELS (Cached global loaders) ===
@lru_cache(None)
def get_transformer_model():
    AutoTokenizer, AutoModelForSequenceClassification, _, _ = get_transformers()
    print("Loading DeBERTa-v3-large...")
    model_name = "microsoft/deberta-v3-large"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)
    model.eval()
    return tokenizer, model

@lru_cache(None)
def get_perplexity_model():
    from transformers import GPT2LMHeadModel, GPT2Tokenizer
    print("Loading GPT-2 for Perplexity...")
    tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    model = GPT2LMHeadModel.from_pretrained("gpt2")
    model.eval()
    return tokenizer, model

def normalize_perplexity(ppl):
    if ppl < 30: return 95
    elif ppl < 45: return 80
    elif ppl < 60: return 60
    elif ppl < 80: return 40
    elif ppl < 120: return 20
    else: return 10

def normalize_entropy(ent):
    if ent < 4: return 90
    elif ent < 5: return 70
    elif ent < 6: return 50
    elif ent < 7: return 30
    else: return 10

def chunk_text(text, size=200):
    words = text.split()
    for i in range(0, len(words), size):
        yield " ".join(words[i:i+size])

# === LAYER 1: Transformer Classification ===
def transformer_score(text):
    torch = get_torch()
    try:
        tokenizer, model = get_transformer_model()
        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)
        return float(probs[0][1].item() * 100)
    except Exception as e:
        print(f"Transformer Error: {e}")
        return 50.0

# === LAYER 2: Perplexity Analysis ===
def perplexity_score(text):
    torch = get_torch()
    try:
        tokenizer, model = get_perplexity_model()
        encodings = tokenizer(text, return_tensors="pt")
        max_length = model.config.n_positions
        stride = 512
        nlls = []
        
        for i in range(0, encodings.input_ids.size(1), stride):
            begin_loc = max(i + stride - max_length, 0)
            end_loc = min(i + stride, encodings.input_ids.size(1))
            trg_len = end_loc - i
            
            input_ids = encodings.input_ids[:, begin_loc:end_loc]
            target_ids = input_ids.clone()
            target_ids[:, :-trg_len] = -100
            
            with torch.no_grad():
                outputs = model(input_ids, labels=target_ids)
            nlls.append(outputs.loss * trg_len)
            
        ppl = torch.exp(torch.stack(nlls).sum() / end_loc)
        return float(ppl.item())
    except Exception as e:
        print(f"Perplexity Error: {e}")
        return 80.0

# === LAYER 3: Burstiness Detection ===
def burstiness_score(text):
    np = get_numpy()
    nltk = get_nltk()
    try:
        download_nltk_assets()
        sentences = nltk.sent_tokenize(text)
        if len(sentences) <= 1: return 0.0
        lengths = [len(s.split()) for s in sentences]
        return float(np.var(lengths))
    except:
        return 0.0

# === LAYER 4: Stylometric Analysis ===
def stylometric_features(text):
    words = text.split()
    if not words: return {"vocab_richness": 0, "punctuation_ratio": 0, "avg_sentence_length": 0}
    unique_words = len(set(words))
    vocab_richness = unique_words / len(words)
    punctuation = len(re.findall(r'[.,!?;:]', text))
    punctuation_ratio = punctuation / len(words)
    avg_sentence_length = len(words) / max(1, text.count("."))
    return {
        "vocab_richness": vocab_richness,
        "punctuation_ratio": punctuation_ratio,
        "avg_sentence_length": avg_sentence_length
    }

# === LAYER 5: Repetition Detection ===
def repetition_score(text):
    words = text.lower().split()
    if len(words) < 2: return 1.0
    bigrams = list(zip(words, words[1:]))
    freq = Counter(bigrams)
    if not freq: return 1.0
    most_common = freq.most_common(1)[0][1]
    return float(most_common)

# === LAYER 6: Entropy Score ===
def entropy_score(text):
    import math
    words = text.split()
    if not words: return 0.0
    freq = Counter(words)
    probs = [f / len(words) for f in freq.values()]
    entropy = -sum(p * math.log2(p) for p in probs)
    return float(entropy)

def detect_ai_text(text: str) -> Dict:
    raw_text = text.strip()
    words = raw_text.split()
    if len(words) < 200:
        return {"error": "Minimum 200 words required for forensic analysis", "word_count": len(words)}
    if len(words) > 500:
        return {"error": "Maximum 500 words allowed for optimal performance", "word_count": len(words)}

    # Collective chunking for Transformer (to handle long text)
    chunks = list(chunk_text(raw_text))
    t_scores = [transformer_score(c) for c in chunks]
    t_score = np.mean(t_scores)

    # Collect layer scores
    ppl = perplexity_score(raw_text)
    burst = burstiness_score(raw_text)
    rep = repetition_score(raw_text)
    ent = entropy_score(raw_text)
    stylo = stylometric_features(raw_text)

    # Normalization & Ensemble (Smoothed scaling)
    ppl_norm = normalize_perplexity(ppl)
    burst_norm = min(100, burst * 3)
    rep_norm = min(100, rep * 4)
    ent_norm = normalize_entropy(ent)

    np = get_numpy()
    final_score = (
        0.30 * t_score +
        0.30 * ppl_norm +
        0.20 * burst_norm +
        0.12 * ent_norm +
        0.08 * rep_norm
    )
    
    ai_prob = round(min(99, max(1, final_score)), 2)
    human_prob = round(100 - ai_prob, 2)
    
    if ai_prob > 75: verdict = "Very likely AI Generated"
    elif ai_prob > 50: verdict = "Likely AI Generated"
    elif ai_prob > 30: verdict = "Uncertain"
    else: verdict = "Likely Human Written"

    return {
        "ai_probability": ai_prob,
        "human_probability": human_prob,
        "verdict": verdict,
        "word_count": len(raw_text.split()),
        "transformerScore": round(float(t_score), 2),
        "perplexity": round(ppl, 2),
        "burstiness": round(burst, 2),
        "entropy": round(ent, 2),
        "details": {
            **stylo,
            "repetition_score": rep,
            "entropy": round(ent, 2)
        }
    }

def statistical_humanizer(text):
    try:
        nltk = get_nltk()
        download_nltk_assets()
        sentences = nltk.sent_tokenize(text)
        new_sentences = []
        for s in sentences:
            words = s.split()
            # randomly shorten sentences
            if len(words) > 12 and random.random() < 0.35:
                cut = random.randint(8, len(words))
                s = " ".join(words[:cut])
            # occasionally split sentence
            if len(words) > 18 and random.random() < 0.3:
                split = random.randint(7, len(words)-5)
                s = " ".join(words[:split]) + ". " + " ".join(words[split:])
            # slight word shuffle
            if len(words) > 8 and random.random() < 0.2:
                i = random.randint(0, len(words)-2)
                words[i], words[i+1] = words[i+1], words[i]
                s = " ".join(words)
            new_sentences.append(s)
        return " ".join(new_sentences)
    except:
        return text

@retry(stop=stop_after_attempt(6), wait=wait_exponential(multiplier=2, min=4, max=60))
def humanize_text(text: str) -> str:
    if len(text) < 50:
        return text

    current = text[:3900]

    # Triple pass for maximum undetectability
    for stage in range(1, 4):
        prompt = get_humanizer_prompt(stage).format(text=current)

        shuffled_providers = PROVIDERS[:]
        random.shuffle(shuffled_providers)

        success = False
        for p in shuffled_providers:
            try:
                client = p["client"]
                model = random.choice(p["models"])

                response = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=1.1,
                    top_p=0.92,
                    max_tokens=2600,
                    timeout=60
                )
                current = response.choices[0].message.content.strip()
                success = True
                break

            except Exception as e:
                print(f"Stage {stage} - {p['name']} failed: {str(e)}")
                time.sleep(2)

        if not success:
            # Rule-based fallback (always works)
            current = add_human_noise(current)

    current = statistical_humanizer(current)
    return current

def add_human_noise(text: str) -> str:
    """Zero-API fallback — injects real human imperfections"""
    lines = text.split('\n')
    result = []
    fillers = ["tbh", "like", "honestly", "you know", "I mean", "kinda", "yaar", "bro", "idk"]
    
    for line in lines:
        if random.random() < 0.35:
            filler = random.choice(fillers)
            line = filler + ", " + line
        if random.random() < 0.2:
            words = line.split()
            if len(words) > 3:
                idx = random.randint(0, len(words)-2)
                words.insert(idx+1, words[idx])  # repeat word
                line = ' '.join(words)
        result.append(line)
    
    return '\n'.join(result)

def analyze_text(content: bytes, filename: str) -> dict:
    text = extract_text(content, filename)
    detection = detect_ai_text(text)
    return {
        "originalText": text[:4000] + ("..." if len(text) > 4000 else ""),
        "aiProbability": detection["ai_probability"],
        "humanProbability": detection.get("human_probability", 100 - detection["ai_probability"]),
        "verdict": detection["verdict"],
        "wordCount": detection["word_count"],
        "details": detection.get("details", {}),
        "metadata": {"filename": filename, "charCount": len(text)}
    }
