"""
Forenzic AI – Hugging Face Vision Transformer Detection Service
================================================================
Loads the dima806/ai_vs_human_generated_image_detection ViT model ONCE at startup
and caches it globally for CPU-compatible, low-latency inference.

Model output labels:
    "human"        → maps to REAL
    "AI-generated" → maps to AI_GENERATED (FAKE)
"""

import io
import time
import logging
from typing import Optional

from PIL import Image

logger = logging.getLogger("forenzic_ai.huggingface_detector")

# ---------------------------------------------------------------------------
# Global model state – loaded once at module import / explicit init_model()
# ---------------------------------------------------------------------------
_model = None
_processor = None
_model_load_error: Optional[str] = None
_HF_MODEL_ID = "dima806/ai_vs_human_generated_image_detection"


def init_model() -> bool:
    """
    Load the Hugging Face image-classification model once.
    Call this during FastAPI startup to avoid cold-start latency on first request.

    Returns True on success, False on failure.
    """
    global _model, _processor, _model_load_error

    if _model is not None and _processor is not None:
        logger.info("[HF Detector] Model already loaded – skipping re-init.")
        return True

    try:
        logger.info(f"[HF Detector] Loading model '{_HF_MODEL_ID}' …")
        import torch
        from transformers import AutoImageProcessor, AutoModelForImageClassification

        _processor = AutoImageProcessor.from_pretrained(_HF_MODEL_ID)
        _model = AutoModelForImageClassification.from_pretrained(_HF_MODEL_ID)
        _model.eval()  # Set model to evaluation mode for deterministic dropout/batchnorm
        _model.to("cpu")

        logger.info("[HF Detector] ✅  Model loaded successfully.")
        _model_load_error = None
        return True

    except Exception as exc:
        _model_load_error = str(exc)
        logger.error(f"[HF Detector] ❌  Model load failed: {exc}")
        return False


def _label_to_prediction(label: str) -> str:
    """
    Map HuggingFace model output label to Forenzic AI internal classification string.

    Label mapping:
        "human"        → "REAL"
        "AI-generated" → "AI_GENERATED"
    """
    label_lower = label.strip().lower()
    if "human" in label_lower:
        return "REAL"
    return "AI_GENERATED"


def predict_image(pil_image_or_path) -> dict:
    """
    Run the Hugging Face ViT model on a PIL Image or image file path.
    """
    global _model, _processor, _model_load_error

    if _model is None or _processor is None:
        success = init_model()
        if not success:
            raise RuntimeError(f"Hugging Face model could not be loaded: {_model_load_error}")

    import torch

    # Validate/convert input
    if isinstance(pil_image_or_path, str):
        try:
            image = Image.open(pil_image_or_path).convert("RGB")
        except Exception as exc:
            raise ValueError(f"Cannot open image file '{pil_image_or_path}': {exc}")
    elif isinstance(pil_image_or_path, Image.Image):
        image = pil_image_or_path.convert("RGB")
    else:
        raise TypeError(f"Expected PIL.Image or file path string, got {type(pil_image_or_path).__name__}")

    width, height = image.size
    if width == 0 or height == 0:
        raise ValueError("Image has zero dimensions – file may be corrupted.")

    t_start = time.time()

    try:
        with torch.inference_mode():
            inputs = _processor(images=image, return_tensors="pt").to("cpu")
            outputs = _model(**inputs)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=-1)
            
            top_prob, top_idx = torch.max(probs, dim=-1)
            confidence = top_prob.item()
            label_id = top_idx.item()
            label = _model.config.id2label[label_id]
            
            # Map raw labels/probs to raw_results format for legacy compatibility
            raw_results = [{"label": _model.config.id2label[i], "score": p.item()} for i, p in enumerate(probs[0])]
    except Exception as exc:
        raise RuntimeError(f"HuggingFace inference failed: {exc}")
    finally:
        # Free memory aggressively
        if 'inputs' in locals():
            del inputs
        if 'outputs' in locals():
            del outputs
        if 'logits' in locals():
            del logits
        if 'probs' in locals():
            del probs

    inference_latency = round(time.time() - t_start, 4)
    prediction = _label_to_prediction(label)

    return {
        "prediction": prediction,
        "confidence": confidence,
        "raw_results": raw_results,
        "engine": "Hugging Face Vision Transformer (dima806/ai_vs_human_generated_image_detection)",
        "device": "CPU",
        "inference_latency": inference_latency,
    }


from backend.models.registry import BaseDetector

class HuggingFaceViTDetector(BaseDetector):
    """
    Modular implementation of the Hugging Face ViT model.
    """
    def __init__(self):
        init_model()
        
    def predict(self, image: Image.Image) -> dict:
        return predict_image(image)

