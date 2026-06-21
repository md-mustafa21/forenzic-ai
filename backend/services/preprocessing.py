from PIL import Image, ImageOps

def canonical_preprocess(pil_image: Image.Image) -> Image.Image:
    """
    Applies a deterministic, canonical preprocessing pipeline to a PIL Image.
    - Applies EXIF transposition to fix orientation.
    - Converts to RGB.
    - Resizes to a maximum dimension of 512px using LANCZOS.
    This guarantees the same raw input array yields exactly the same preprocessed output,
    eliminating random/redundant passes.
    """
    # 1. EXIF correction (orientation)
    img = ImageOps.exif_transpose(pil_image)
    
    # 2. Convert to RGB
    img = img.convert("RGB")
    
    # 3. Resizing Normalization (max 512px)
    max_dim = 512
    if max(img.size) > max_dim:
        img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        
    return img

