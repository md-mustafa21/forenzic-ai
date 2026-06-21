import os
import logging
from pathlib import Path
from typing import Tuple
import numpy as np
from tensorflow.keras.models import load_model

logger = logging.getLogger("forenzic_ai.model_loader")

_MODEL_PATH = Path(__file__).parent / "deepfake_detector.h5"
_MODEL = None

def init_model() -> bool:
    """Load the TensorFlow MobileNetV2 model (H5) once at startup."""
    global _MODEL
    if _MODEL is not None:
        logger.info("[TF Loader] Model already loaded – skipping.")
        return True
    try:
        logger.info(f"[TF Loader] Loading TensorFlow model from {_MODEL_PATH} …")
        _MODEL = load_model(_MODEL_PATH)
        logger.info("[TF Loader] Model loaded successfully.")
        return True
    except Exception as exc:
        logger.error(f"[TF Loader] Failed to load TensorFlow model: {exc}")
        return False

def _preprocess(pil_img):
    img = pil_img.resize((224, 224)).convert("RGB")
    arr = np.array(img) / 255.0
    return np.expand_dims(arr, axis=0)

def predict_image(pil_img) -> Tuple[str, float]:
    """Run inference on a Pillow image.
    Returns (prediction, confidence) where prediction is "FAKE" or "REAL".
    """
    if _MODEL is None:
        raise RuntimeError("TensorFlow model not initialised – call init_model() first.")
    arr = _preprocess(pil_img)
    probs = _MODEL.predict(arr)[0]
    
    # Binary classification output from sigmoid activation
    # Assuming class 0 is 'fake' and class 1 is 'real' (alphabetical order)
    prob_real = float(probs[0])
    if prob_real >= 0.5:
        pred = "REAL"
        confidence = prob_real
    else:
        pred = "FAKE"
        confidence = 1.0 - prob_real
        
    return pred, confidence
