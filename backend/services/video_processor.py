import cv2
import tempfile
import os
from PIL import Image
import numpy as np

def extract_frames(video_bytes: bytes, num_frames: int = 5) -> list[Image.Image]:
    """
    Saves video bytes to a temporary file, extracts `num_frames` evenly spaced frames,
    and returns them as PIL Image objects.
    """
    frames = []
    
    # Write to a temporary file
    temp_video = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
    try:
        temp_video.write(video_bytes)
        temp_video.flush()
        temp_video.close()
        
        cap = cv2.VideoCapture(temp_video.name)
        if not cap.isOpened():
            raise ValueError("Unable to open video file for frame extraction.")
            
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames == 0:
            raise ValueError("Video file has 0 frames.")
            
        # Calculate frame indices to extract
        step = max(1, total_frames // num_frames)
        frame_indices = [i * step for i in range(num_frames) if i * step < total_frames]
        
        for idx in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if ret:
                # Convert BGR to RGB
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_img = Image.fromarray(frame_rgb)
                frames.append(pil_img)
                
        cap.release()
    finally:
        # Cleanup temporary file
        if os.path.exists(temp_video.name):
            try:
                os.remove(temp_video.name)
            except OSError:
                pass
            
    if not frames:
        raise ValueError("Could not extract any valid frames from the media.")
        
    return frames
