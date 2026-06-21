"""
Forenzic AI – Prediction Service
=================================
Core backend orchestrator:
  1. Decodes raw bytes to PIL Image.
  2. Invokes the Hugging Face Vision Transformer pipeline.
  3. Runs classical OpenCV digital forensic algorithms (FFT, ELA, Laplacian).
  4. Synthesises signals into a final unified result.
  5. Saves scan data alongside a base64 preview inside SQLite history logs.

The external API response shape is unchanged so the frontend needs no modification.
Note: classification labels are "AI_GENERATED" and "REAL" (matching HF output).
      Internally we also keep "FAKE" as an alias so legacy DB rows still render.
"""

import time
import io
import base64
import logging
from PIL import Image

from backend.services.huggingface_detector import predict_image
from backend.services.opencv_analyzer import run_forensic_pipeline
from backend.services.database import add_scan_record
from backend.services.video_processor import extract_frames

logger = logging.getLogger("forenzic_ai.prediction_service")


def generate_base64_thumbnail(pil_image, max_size=(100, 100)) -> str:
    """
    Generates a tiny base64-encoded JPEG thumbnail for the dashboard history view.
    """
    try:
        thumb = pil_image.copy()
        thumb.thumbnail(max_size)
        buffered = io.BytesIO()
        thumb.save(buffered, format="JPEG", quality=50)
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{img_str}"
    except Exception as exc:
        logger.warning(f"[Prediction Service] Thumbnail generation failed: {exc}")
        return ""


def process_and_analyze_image(image_bytes: bytes, filename: str) -> dict:
    """
    Full analysis pipeline for one uploaded image or video.
    """
    t_start = time.time()

    is_video = filename.lower().endswith(('.mp4', '.mov', '.gif', '.webm'))

    # ── 1. Decode image or extract frames ─────────────────────────────────────
    try:
        if is_video:
            frames = extract_frames(image_bytes, num_frames=5)
            pil_image = frames[0]
        else:
            pil_image = Image.open(io.BytesIO(image_bytes))
            pil_image.verify()                 # Raises on corrupt files
            pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            frames = [pil_image]
    except Exception as exc:
        raise ValueError(f"Invalid or corrupted media file: {exc}")

    # ── 2. Thumbnail ─────────────────────────────────────────────────────────
    thumbnail_b64 = generate_base64_thumbnail(pil_image)

    # ── 3. Stage 1: Fast Screening & Modular Init ─────────────────────────
    from backend.services.huggingface_detector import HuggingFaceViTDetector
    from backend.services.preprocessing import canonical_preprocess
    from backend.services.opencv_analyzer import get_normalized_frequency_score
    from backend.services.facial_analyzer import detect_facial_anomalies

    hf_detector = HuggingFaceViTDetector()
    
    # ── Canonical Preprocessing & Single Inference ────────────────────────
    if is_video:
        processed_image = canonical_preprocess(frames[0])
    else:
        processed_image = canonical_preprocess(pil_image)

    # Single deterministic CNN run
    cnn_result = hf_detector.predict(processed_image)
    is_fake = cnn_result["prediction"] in ("AI_GENERATED", "FAKE")
    ensemble_cnn_score = cnn_result["confidence"] if is_fake else (1.0 - cnn_result["confidence"])

    hf_metadata = {
        "engine": cnn_result.get("engine", "Hugging Face"),
        "latency": cnn_result.get("inference_latency", 0.0)
    }
    
    # Aggressively clear memory for large tensors/images
    del processed_image

    # ── 4. Stage 2: Ensemble Verification ─────────────────────────────────
    
    # Run FFT and Face Anomaly on base image
    ensemble_fft_score = get_normalized_frequency_score(pil_image)
    ensemble_face_score = detect_facial_anomalies(pil_image)

    # Weighted calculation
    # deepfake_model_weight = 0.4, frequency_analysis_weight = 0.3, facial_anomaly_weight = 0.3
    final_composite_score = (ensemble_cnn_score * 0.4) + (ensemble_fft_score * 0.3) + (ensemble_face_score * 0.3)

    # ── 5. Stage 3: Adaptive Calibration ─────────────────────────────────
    DEFAULT_THRESHOLD = 0.7
    LOWER_THRESHOLD = 0.3
    
    if final_composite_score >= DEFAULT_THRESHOLD:
        final_class = "FAKE"
    elif final_composite_score <= LOWER_THRESHOLD:
        final_class = "REAL"
    else:
        final_class = "UNCERTAIN"
        
    final_confidence = final_composite_score
    
    # ── Legacy Forensics (Backward Compatibility) ─────────────────────────
    cv_reports = run_forensic_pipeline(frames if is_video else pil_image)
    
    processing_time = round(time.time() - t_start, 3)

    # ── Risk Level ────────────────────────────────────────────────────────────
    risk_level = "LOW"
    if final_class == "FAKE":
        if final_confidence > 0.80:
            risk_level = "CRITICAL"
        else:
            risk_level = "HIGH"
    elif final_class == "UNCERTAIN":
        risk_level = "MEDIUM"

    # ── Package analysis details ──────────────────────────────────────────────
    analysis_details = {
        "model_engine": hf_metadata,
        "forensics": cv_reports
    }

    # ── 6. Persist to SQLite ──────────────────────────────────────────────────
    scan_id = add_scan_record(
        filename=filename,
        classification=final_class,
        confidence=final_confidence,
        risk_score=round(final_composite_score * 100.0, 1),
        processing_time=processing_time,
        details=analysis_details,
        thumbnail_base64=thumbnail_b64
    )

    # ── 7. Explainability & Return payload ───────────────────────────────────
    return {
        "id": scan_id,
        "filename": filename,
        "classification": final_class,
        "confidence": round(final_confidence, 4),
        "risk_level": risk_level,
        "processing_time": processing_time,
        "forensic_risk_score": round(final_composite_score * 100.0, 1),
        "details": analysis_details,
        "scores": {
            "cnn_score": round(ensemble_cnn_score, 4),
            "frequency_score": round(ensemble_fft_score, 4),
            "face_anomaly_score": round(ensemble_face_score, 4)
        }
    }
