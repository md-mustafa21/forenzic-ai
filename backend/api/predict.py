from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.services.prediction_service import process_and_analyze_image
import os

router = APIRouter(tags=["AI Deepfake Detection Engine"])

# Configuration limits
ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.bmp', '.mp4', '.mov', '.gif', '.webm'}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 Megabytes limit

@router.post("/predict")
async def detect_deepfake(file: UploadFile = File(...)):
    """
    Accepts an uploaded image and performs composite CNN + Computer Vision analysis.
    Validates file size (limit 10MB) and formats before running predictions.
    """
    # 1. Validate File Metadata
    filename = file.filename
    _, ext = os.path.splitext(filename.lower())
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Supported: {', '.join(ALLOWED_EXTENSIONS)}"
        )
        
    # 2. Read file bytes and validate size
    try:
        file_bytes = await file.read()
        file_size = len(file_bytes)
        
        if file_size > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"File exceeds maximum size of 10MB (Received: {round(file_size / (1024*1024), 2)}MB)"
            )
            
        if file_size == 0:
            raise HTTPException(
                status_code=400,
                detail="Empty file uploaded. Please upload a valid image asset."
            )
            
        # Reset file cursor for safety
        file.file.seek(0)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading upload buffer: {str(e)}")
        
    # 3. Process image through dual deep learning + digital forensics pipeline
    try:
        analysis_result = process_and_analyze_image(file_bytes, filename)
        return analysis_result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Critical failure in AI/Forensic processing pipelines: {str(e)}"
        )
