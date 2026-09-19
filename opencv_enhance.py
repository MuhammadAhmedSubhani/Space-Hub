import cv2
import numpy as np
import base64

def enhance_image(image_bytes):
    """
    Scientific-grade stabilized enhancement pipeline for astronomical imagery.
    Order of operations: Grayscale -> Denoise -> Normalize -> CLAHE -> Gamma -> Unsharp -> Smoothing.
    """
    # 0. Decode image safely
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return None

    # Step 1: Grayscale Conversion
    # Handles both monochrome and colored input effectively
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img

    # Step 2: Strong but edge-preserving Denoising
    # parameters: h=10, templateWindowSize=7, searchWindowSize=21
    denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)

    # Step 3: Gentle Background Estimation and Blending (Artifact Removal)
    # Estimate the low-frequency background using a large Gaussian blur (51x51)
    background = cv2.GaussianBlur(denoised, (51, 51), 0)
    
    # Very gentle weighted subtraction (alpha = 0.4)
    # This reduces gradients without 'carving out' the galaxy signal
    alpha = 0.4
    flattened = cv2.addWeighted(denoised, 1.0, background, -alpha, 0)
    flattened = np.clip(flattened, 0, 255).astype(np.uint8)

    # Blend the flattened image back with the denoised image (60/40 blend)
    # This restores the galaxy body and halo visibility while keeping the background flat
    blended = cv2.addWeighted(denoised, 0.6, flattened, 0.4, 0)

    # Step 4: Intensity Normalization
    # Applied to the blended image to stretch the natural-looking signal
    normalized = cv2.normalize(blended, None, 0, 255, cv2.NORM_MINMAX)

    # Step 5: Mild Contrast Enhancement
    # clipLimit is low (1.2) to prevent noise amplification
    clahe = cv2.createCLAHE(clipLimit=1.2, tileGridSize=(8, 8))
    contrast_img = clahe.apply(normalized)

    # Step 6: Gamma Correction (Brightness control)
    # gamma=1.15 used to gently balance core brightness
    gamma = 1.15
    invGamma = 1.0 / gamma
    table = np.array([((i / 255.0) ** invGamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
    gamma_corrected = cv2.LUT(contrast_img, table)

    # Step 7: Very Subtle Sharpening (Unsharp Masking) - REFINED
    # Blending original with a blurred version to lift edges without grittiness
    blur_for_unsharp = cv2.GaussianBlur(gamma_corrected, (0, 0), 2.0)
    # Balanced formulation: result = 1.15 * original - 0.15 * blurred
    # Reduced from 1.25 to keep the galaxy core and dust lanes softer/natural
    unsharp = cv2.addWeighted(gamma_corrected, 1.15, blur_for_unsharp, -0.15, 0)

    # Step 8: Final Polish (Light Bilateral Smoothing)
    # Bilateral filter specifically targets high-frequency grain in darker regions 
    # while preserving the structural integrity of stellar objects.
    final = cv2.bilateralFilter(unsharp, 5, 15, 15)

    # Encode to binary png and then base64 for web transit
    _, buffer = cv2.imencode('.png', final)
    return base64.b64encode(buffer).decode('utf-8')

# Example usage for backend integration:
# if __name__ == "__main__":
#     import sys
#     input_data = sys.stdin.buffer.read()
#     output = enhance_image(input_data)
#     if output:
#         print(output)
