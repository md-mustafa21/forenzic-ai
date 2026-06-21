import cv2
import numpy as np
from PIL import Image

# Load the Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def detect_facial_anomalies(pil_image: Image.Image) -> float:
    """
    Detects faces and computes a facial anomaly score.
    Uses bilateral symmetry analysis as a proxy for structural anomalies
    (AI often generates asymmetric features like mismatched eyes or earrings).
    Returns a normalized anomaly score (0.0 to 1.0).
    """
    try:
        img_arr = np.array(pil_image.convert('RGB'))
        gray = cv2.cvtColor(img_arr, cv2.COLOR_RGB2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        if len(faces) == 0:
            return 0.0  # No face detected
            
        anomaly_scores = []
        for (x, y, w, h) in faces:
            # Extract face Region of Interest (ROI)
            face_roi = gray[y:y+h, x:x+w]
            
            # Ensure even width for splitting
            if face_roi.shape[1] % 2 != 0:
                face_roi = face_roi[:, :-1]
                
            half_width = face_roi.shape[1] // 2
            left_half = face_roi[:, :half_width]
            right_half = face_roi[:, half_width:]
            
            # Flip the right half horizontally
            right_half_flipped = cv2.flip(right_half, 1)
            
            # Calculate MSE between left and flipped right half
            err = np.sum((left_half.astype("float") - right_half_flipped.astype("float")) ** 2)
            err /= float(left_half.shape[0] * left_half.shape[1])
            
            # Normalize MSE to an anomaly score (0-1 range). 
            # Normal face asymmetry typically yields MSE ~ 200-500.
            # Very high MSE indicates structural anomaly.
            score = float(np.clip((err - 100) / 1500.0, 0.0, 1.0))
            anomaly_scores.append(score)
            
        return float(np.mean(anomaly_scores))
    except Exception as e:
        print(f"[Facial Analyzer] Error: {e}")
        return 0.0
