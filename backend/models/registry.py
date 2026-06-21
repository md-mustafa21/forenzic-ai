from abc import ABC, abstractmethod
from PIL import Image

class BaseDetector(ABC):
    """
    Modular interface for Deepfake Detection models.
    Allows hot-swapping future models (e.g., specific Midjourney/DALL-E detectors).
    """
    
    @abstractmethod
    def predict(self, image: Image.Image) -> dict:
        """
        Must return a dictionary with at least:
        - 'prediction': str ("REAL" or "AI_GENERATED")
        - 'confidence': float (0.0 to 1.0)
        - 'engine': str (Name of the model used)
        """
        pass
