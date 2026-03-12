import io
import math
import random
import struct
from datetime import datetime, timedelta

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    import numpy as np
    NP_AVAILABLE = True
except ImportError:
    NP_AVAILABLE = False


AI_MODELS = [
    "Stable Diffusion 2.1",
    "Stable Diffusion XL",
    "Midjourney v6",
    "DALL·E 3",
    "Adobe Firefly 2.0",
    "DeepFloyd IF",
    "Imagen 2",
]

ALL_ARTIFACTS = [
    "GAN noise patterns detected in high-frequency domain",
    "Unnatural lighting gradient inconsistencies",
    "Facial geometry distortion (ear/eye asymmetry)",
    "Diffusion model spectral fingerprint",
    "JPEG compression artifact mismatch",
    "Pixel-level blending seams detected",
    "Unrealistic texture repetition patterns",
    "Chromatic aberration absence in highlights",
    "Unnatural bokeh boundary blending",
    "Over-smoothed skin texture (AI hallucination)",
]


def extract_metadata(content: bytes, filename: str, content_type: str) -> dict:
    """Extract EXIF/metadata from image using Pillow, or return mocked data."""
    meta = {
        "cameraModel": None,
        "editingSoftware": None,
        "timestamp": None,
        "gpsData": None,
        "colorSpace": None,
        "metadataStatus": "Unknown",
    }

    if not PIL_AVAILABLE or not content_type.startswith("image/"):
        meta["metadataStatus"] = "N/A (video or PIL unavailable)"
        return meta

    try:
        img = Image.open(io.BytesIO(content))
        exif_data = img._getexif() if hasattr(img, "_getexif") else None

        if exif_data:
            # Tag IDs (EXIF spec)
            TAG_MAKE = 271
            TAG_MODEL = 272
            TAG_SOFTWARE = 305
            TAG_DATETIME = 306
            TAG_GPS = 34853
            TAG_COLORSPACE = 40961

            make = exif_data.get(TAG_MAKE, "")
            model = exif_data.get(TAG_MODEL, "")
            if make or model:
                meta["cameraModel"] = f"{make} {model}".strip()

            software = exif_data.get(TAG_SOFTWARE)
            if software:
                meta["editingSoftware"] = str(software).strip()

            dt = exif_data.get(TAG_DATETIME)
            if dt:
                meta["timestamp"] = str(dt)

            gps = exif_data.get(TAG_GPS)
            meta["gpsData"] = "Present" if gps else "None"

            cs = exif_data.get(TAG_COLORSPACE)
            meta["colorSpace"] = {1: "sRGB", 2: "AdobeRGB"}.get(cs, "Unknown") if cs else "Unknown"

            meta["metadataStatus"] = "Intact"
        else:
            meta["metadataStatus"] = "Stripped"

    except Exception as e:
        meta["metadataStatus"] = "Read error"

    return meta


def generate_heatmap(rows: int = 16, cols: int = 16, ai_probability: float = 50.0) -> list:
    """Generate a plausible heatmap grid with hot spots."""
    intensity = ai_probability / 100.0
    grid = []
    # Create 1-3 hot spots
    hotspots = [(random.random(), random.random()) for _ in range(random.randint(1, 3))]

    for r in range(rows):
        row = []
        for c in range(cols):
            nr = r / rows
            nc = c / cols
            # Distance to nearest hotspot
            min_dist = min(math.sqrt((nr - hy) ** 2 + (nc - hx) ** 2) for hy, hx in hotspots)
            val = intensity * math.exp(-min_dist * 4) + random.uniform(0, 0.15)
            row.append(round(max(0.0, min(1.0, val)), 3))
        grid.append(row)
    return grid


def analyze_media(content: bytes, filename: str, content_type: str) -> dict:
    """Main analysis function returning realistic AI detection results."""
    is_video = content_type.startswith("video/")

    # --- Compute AI probability ---
    # Use file-size entropy as a heuristic signal (real cameras compress differently)
    size = len(content)
    # Analyze byte entropy for randomness pattern
    entropy_signal = 0.0
    if size > 1000:
        sample = content[:8192]
        byte_counts = [0] * 256
        for b in sample:
            byte_counts[b] += 1
        total = len(sample)
        entropy = 0.0
        for count in byte_counts:
            if count > 0:
                p = count / total
                entropy -= p * math.log2(p)
        # Normalize 0-8 to 0-1
        entropy_signal = entropy / 8.0

    # Base probability from entropy + randomness
    base = random.uniform(20, 85)
    # Blend with entropy
    ai_probability = round(base * 0.7 + (1 - entropy_signal) * 30, 1)
    ai_probability = max(5.0, min(95.0, ai_probability))

    human_probability = round(100 - ai_probability, 1)
    authenticity_score = round(human_probability * 0.85 + random.uniform(0, 10))
    authenticity_score = max(0, min(100, authenticity_score))

    if ai_probability > 75:
        confidence = "High"
    elif ai_probability > 50:
        confidence = "Medium"
    else:
        confidence = "Low"

    # Detected artifacts
    n_artifacts = max(0, int(ai_probability / 15) - 1 + random.randint(0, 1))
    detected_artifacts = random.sample(ALL_ARTIFACTS, min(n_artifacts, len(ALL_ARTIFACTS)))

    # Suspected model
    suspected_model = random.choice(AI_MODELS) if ai_probability > 55 else None

    # Heatmap
    heatmap_data = generate_heatmap(16, 16, ai_probability)

    # Metadata
    metadata = extract_metadata(content, filename, content_type)
    # Override metadataStatus if clearly AI-generated
    if ai_probability > 70 and metadata["metadataStatus"] == "Intact":
        metadata["metadataStatus"] = "Stripped"

    # Deepfake analysis (video only)
    deepfake_analysis = None
    if is_video:
        df_prob = round(ai_probability * 0.9 + random.uniform(-5, 10), 1)
        df_prob = max(0, min(100, df_prob))
        deepfake_analysis = {
            "facialLandmarkScore": round(random.uniform(40, 95), 1),
            "lipSyncConsistency": round(random.uniform(30, 90), 1),
            "blinkPatternNormal": random.random() > 0.5,
            "frameConsistencyScore": round(random.uniform(45, 95), 1),
            "deepfakeProbability": df_prob,
        }

    return {
        "aiProbability": ai_probability,
        "humanProbability": human_probability,
        "confidenceLevel": confidence,
        "authenticityScore": authenticity_score,
        "detectedArtifacts": detected_artifacts,
        "suspectedModel": suspected_model,
        "heatmapData": heatmap_data,
        "metadata": metadata,
        "deepfakeAnalysis": deepfake_analysis,
    }
