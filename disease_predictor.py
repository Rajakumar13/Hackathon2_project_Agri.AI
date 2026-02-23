"""
Lightweight disease prediction from image.
For hackathon: uses image stats + placeholder labels; replace with real model (e.g. ResNet) for production.
"""
import os
from PIL import Image
import numpy as np

# Demo labels for different "signatures" (by dominant color / simple stats)
DISEASE_LABELS = [
    {"id": "healthy", "name": "Healthy", "confidence": 0.85, "remedy": "No action needed. Maintain current practices."},
    {"id": "leaf_spot", "name": "Leaf Spot", "confidence": 0.78, "remedy": "Remove affected leaves; apply copper-based fungicide; avoid overhead irrigation."},
    {"id": "blight", "name": "Early/Late Blight", "confidence": 0.72, "remedy": "Apply fungicide; improve air circulation; rotate crops."},
    {"id": "powdery_mildew", "name": "Powdery Mildew", "confidence": 0.75, "remedy": "Sulphur spray or neem oil; reduce humidity."},
    {"id": "rust", "name": "Rust", "confidence": 0.70, "remedy": "Remove infected parts; apply sulphur or recommended fungicide."},
    {"id": "yellowing", "name": "Nutrient Deficiency / Yellowing", "confidence": 0.68, "remedy": "Soil test; apply balanced NPK and micronutrients."},
]

def predict_disease_from_image(image_path: str) -> dict:
    """Analyze image and return a demo disease prediction. Replace with real CNN inference."""
    if not image_path or not os.path.isfile(image_path):
        return {
            "prediction": "unknown",
            "label": "No image",
            "confidence": 0,
            "remedy": "Please upload a clear leaf/plant image.",
            "all_predictions": []
        }
    try:
        img = Image.open(image_path).convert("RGB")
        arr = np.array(img)
        # Simple heuristic: mean and std to pick a demo label
        r, g, b = arr[:,:,0].mean(), arr[:,:,1].mean(), arr[:,:,2].mean()
        idx = int((r + g + b) / 3) % len(DISEASE_LABELS)
        pred = DISEASE_LABELS[idx].copy()
        pred["all_predictions"] = [
            {"name": d["name"], "confidence": max(0.1, pred["confidence"] - 0.1 * (i + 1))}
            for i, d in enumerate(DISEASE_LABELS[:4])
        ]
        return {
            "prediction": pred["id"],
            "label": pred["name"],
            "confidence": round(pred["confidence"], 2),
            "remedy": pred["remedy"],
            "all_predictions": pred["all_predictions"],
        }
    except Exception as e:
        return {
            "prediction": "error",
            "label": "Analysis failed",
            "confidence": 0,
            "remedy": str(e),
            "all_predictions": []
        }
