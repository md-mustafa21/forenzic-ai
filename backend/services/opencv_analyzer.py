import cv2
import numpy as np
from PIL import Image
import io
import os

def perform_error_level_analysis(pil_image, resave_quality=90) -> tuple[float, list, str]:
    """
    Performs Error Level Analysis (ELA) on an image.
    ELA detects localized differences in JPEG compression, commonly indicating splicing/manipulation.
    Returns:
        ela_score: average difference density (0.0 to 100.0)
        ela_map_b64: None (the raw matrix data is analyzed and returned as aggregated regional reports)
        risk_evaluation: descriptive evaluation string
    """
    try:
        # Convert PIL image to OpenCV format (RGB)
        img = np.array(pil_image)
        if len(img.shape) == 2: # Grayscale
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
        elif img.shape[2] == 4: # RGBA
            img = img[:, :, :3]
            
        # Re-encode image to JPEG at the specified quality
        _, encoded_img = cv2.imencode('.jpg', cv2.cvtColor(img, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, resave_quality])
        # Decode the re-compressed image back to matrix
        resaved_img = cv2.imdecode(encoded_img, cv2.IMREAD_COLOR)
        resaved_img = cv2.cvtColor(resaved_img, cv2.COLOR_BGR2RGB)
        
        # Calculate absolute difference
        diff = cv2.absdiff(img, resaved_img)
        
        # Scale differences to make them visible and extract intensity
        scaled_diff = diff * 15  # Amplify pixel differences
        mean_diff = np.mean(scaled_diff)
        max_diff = np.max(scaled_diff)
        
        # Identify localized clusters of anomalies (indicating potential splices)
        gray_diff = cv2.cvtColor(scaled_diff, cv2.COLOR_RGB2GRAY)
        _, thresh = cv2.threshold(gray_diff, 30, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        anomaly_clusters = len([c for c in contours if cv2.contourArea(c) > 25])
        
        # Map mean difference and cluster density to ELA risk score (0-100)
        # Spliced regions exhibit compression differences and generate higher average and maximum values
        ela_score = float(np.clip((mean_diff * 4.5) + (anomaly_clusters * 0.8), 1.2, 98.5))
        
        # Formulate regional anomalies list
        regions = [
            {"region": "Top Left", "score": float(np.mean(scaled_diff[:scaled_diff.shape[0]//2, :scaled_diff.shape[1]//2]))},
            {"region": "Top Right", "score": float(np.mean(scaled_diff[:scaled_diff.shape[0]//2, scaled_diff.shape[1]//2:]))},
            {"region": "Bottom Left", "score": float(np.mean(scaled_diff[scaled_diff.shape[0]//2:, :scaled_diff.shape[1]//2]))},
            {"region": "Bottom Right", "score": float(np.mean(scaled_diff[scaled_diff.shape[0]//2:, scaled_diff.shape[1]//2:]))}
        ]
        
        if ela_score > 35:
            risk = "HIGH - Localized JPEG compression variance detected. Splicing indicators present."
        elif ela_score > 15:
            risk = "MEDIUM - Mild compression inconsistency. Typical of standard web optimization or multiple re-saves."
        else:
            risk = "LOW - Homogeneous compression profile. Consistent digital canvas."
            
        return ela_score, regions, risk
    except Exception as e:
        print(f"[OpenCV Forensic Analyzer] ELA failed: {e}")
        return 5.0, [], f"Error performing ELA: {str(e)}"

def perform_frequency_fft_analysis(pil_image) -> tuple[float, float, str]:
    """
    Computes 2D Fast Fourier Transform to analyze image frequencies.
    AI generators (like GANs and Diffusion models) leave repetitive grid artifacts that manifest as high-frequency anomalies.
    Returns:
        anomaly_score: float indicating abnormal frequencies (0.0 to 100.0)
        noise_level: float indicating overall noise profile
        verdict: descriptive string
    """
    try:
        # Convert image to grayscale
        img_gray = np.array(pil_image.convert('L'))
        # Resize to standard grid for fast frequency computation
        img_gray = cv2.resize(img_gray, (256, 256))
        
        # Perform 2D Fast Fourier Transform
        f = np.fft.fft2(img_gray)
        fshift = np.fft.fftshift(f)
        
        # Calculate magnitude spectrum (log scale to highlight patterns)
        magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1)
        
        # Identify synthetic frequency spikes in outer circular bands (high frequency)
        # Center of spectrum is low frequency, outer boundaries are high frequency
        h, w = magnitude_spectrum.shape
        cy, cx = h // 2, w // 2
        
        # Mask the central low frequency (radius of 30 pixels)
        y, x = np.ogrid[:h, :w]
        mask = (x - cx)**2 + (y - cy)**2 > 30**2
        
        # Extract outer high-frequency components
        high_freqs = magnitude_spectrum[mask]
        
        # Compute threshold spikes (values exceeding average high frequency standard deviation)
        mean_hf = np.mean(high_freqs)
        std_hf = np.std(high_freqs)
        spikes = np.sum(high_freqs > (mean_hf + 2.5 * std_hf))
        
        # Calculate anomaly score (map spikes & high-frequency energy ratio to 0-100)
        anomaly_score = float(np.clip((spikes / 15.0) + (std_hf * 2.2), 2.5, 99.0))
        noise_level = float(np.clip(mean_hf / 2.5, 0.5, 100.0))
        
        if anomaly_score > 40:
            verdict = "SUSPICIOUS - Repetitive grid artifacts detected in high-frequency spectrum. High chance of GAN/Diffusion synthesis."
        elif anomaly_score > 20:
            verdict = "NEUTRAL - Standard high frequency distribution. Typical organic details."
        else:
            verdict = "SMOOTHED - Depleted high-frequency profile. Indicates heavy blur or AI super-resolution filtering."
            
        return anomaly_score, noise_level, verdict
    except Exception as e:
        print(f"[OpenCV Forensic Analyzer] FFT analysis failed: {e}")
        return 10.0, 1.0, f"Error performing FFT: {str(e)}"

def get_normalized_frequency_score(pil_image) -> float:
    """
    Returns a normalized FFT anomaly score (0.0 to 1.0) for the ensemble pipeline.
    """
    score, _, _ = perform_frequency_fft_analysis(pil_image)
    return score / 100.0

def perform_texture_analysis(pil_image) -> tuple[float, str]:
    """
    Analyzes surface textures and boundary sharpness using Laplacian edge analysis.
    Real photos have sharp, organic details, while Deepfakes often display unnatural blending, double edges, or local smoothing.
    Returns:
        sharpness_score: variance of Laplacian (representing structural texture strength)
        verdict: descriptive string
    """
    try:
        img_gray = np.array(pil_image.convert('L'))
        # Calculate Laplacian edge intensity map
        laplacian = cv2.Laplacian(img_gray, cv2.CV_64F)
        variance = float(np.var(laplacian))
        
        # Map variance to index (0-100 scale where standard sharp image is around 30-70)
        sharpness_score = float(np.clip(variance / 8.0, 1.0, 100.0))
        
        if sharpness_score < 10.0:
            verdict = "SOFT/BLURRED - Artificially smoothed surface textures or severe lens blur."
        elif sharpness_score > 85.0:
            verdict = "HYPER-SHARP - Synthetic edge enhancement, digital sharpening, or high noise profiles."
        else:
            verdict = "NATURAL - Organic gradient distribution and edge sharpness."
            
        return sharpness_score, verdict
    except Exception as e:
        print(f"[OpenCV Forensic Analyzer] Texture analysis failed: {e}")
        return 25.0, f"Error performing texture analysis: {str(e)}"

def perform_temporal_consistency_analysis(frames: list[Image.Image]) -> tuple[float, str]:
    """
    Computes Mean Squared Error (MSE) between consecutive frames to detect temporal inconsistencies
    (flickering) common in AI-generated videos.
    """
    if len(frames) < 2:
        return 0.0, "N/A - Single frame media."
        
    mse_values = []
    for i in range(len(frames) - 1):
        img1 = cv2.cvtColor(np.array(frames[i].convert('RGB')), cv2.COLOR_RGB2GRAY)
        img2 = cv2.cvtColor(np.array(frames[i+1].convert('RGB')), cv2.COLOR_RGB2GRAY)
        img1 = cv2.resize(img1, (256, 256))
        img2 = cv2.resize(img2, (256, 256))
        err = np.sum((img1.astype("float") - img2.astype("float")) ** 2)
        err /= float(img1.shape[0] * img1.shape[1])
        mse_values.append(err)
        
    avg_mse = float(np.mean(mse_values))
    # Normalize MSE to a 0-100 score where >60 is highly suspicious
    score = float(np.clip(avg_mse / 30.0, 0.0, 100.0))
    
    if score > 60.0:
        verdict = "HIGH FLICKER - Temporal inconsistency detected. High chance of AI-generated video (e.g. Sora/Runway)."
    elif score > 20.0:
        verdict = "MODERATE - Typical movement or camera pan."
    else:
        verdict = "STABLE - Consistent temporal structure."
        
    return score, verdict

def run_forensic_pipeline(pil_image) -> dict:
    """
    Orchestrates the entire digital forensics suite, compiling detailed reports.
    Now accepts either a single image or a list of frames.
    """
    if isinstance(pil_image, list):
        frames = pil_image
        target_img = frames[0] # Use first frame for static analysis
        temporal_score, temporal_verdict = perform_temporal_consistency_analysis(frames)
    else:
        target_img = pil_image
        temporal_score, temporal_verdict = 0.0, "N/A - Static image."
        
    ela_score, ela_regions, ela_risk = perform_error_level_analysis(target_img)
    fft_score, fft_noise, fft_verdict = perform_frequency_fft_analysis(target_img)
    texture_score, texture_verdict = perform_texture_analysis(target_img)
    
    # Calculate unified risk index based on forensic pipelines
    combined_risk_score = float(np.clip((ela_score * 0.3) + (fft_score * 0.3) + ((100.0 - texture_score) * 0.2) + (temporal_score * 0.2), 0.0, 100.0))
    
    return {
        "combined_risk_score": round(combined_risk_score, 2),
        "ela": {
            "score": round(ela_score, 2),
            "regions": ela_regions,
            "verdict": ela_risk
        },
        "fft": {
            "score": round(fft_score, 2),
            "noise_level": round(fft_noise, 2),
            "verdict": fft_verdict
        },
        "texture": {
            "score": round(texture_score, 2),
            "verdict": texture_verdict
        },
        "temporal": {
            "score": round(temporal_score, 2),
            "verdict": temporal_verdict
        }
    }
