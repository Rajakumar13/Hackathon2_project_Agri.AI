"""
Fertilizer recommendations by crop and optional disease.
"""

CROP_FERTILIZERS = {
    "rice": ["Urea", "DAP", "MOP", "Zinc Sulphate", "Farmyard Manure"],
    "wheat": ["Urea", "DAP", "MOP", "Gypsum", "Compost"],
    "maize": ["Urea", "DAP", "MOP", "Zinc", "Vermicompost"],
    "cotton": ["Urea", "DAP", "MOP", "Sulphur", "Boron"],
    "sugarcane": ["Urea", "SSP", "MOP", "Gypsum", "Press Mud"],
    "chickpea": ["Rhizobium", "DAP", "MOP", "Gypsum", "Compost"],
    "mustard": ["Urea", "DAP", "MOP", "Boron", "Sulphur"],
    "potato": ["Urea", "DAP", "MOP", "Magnesium", "Compost"],
    "tomato": ["Urea", "DAP", "MOP", "Calcium Nitrate", "Vermicompost"],
    "onion": ["Urea", "DAP", "MOP", "Sulphur", "Compost"],
    "groundnut": ["Rhizobium", "Gypsum", "DAP", "Boron", "Compost"],
    "soybean": ["Rhizobium", "DAP", "MOP", "Zinc", "Compost"],
    "millet": ["Urea", "DAP", "MOP", "Compost"],
    "sorghum": ["Urea", "DAP", "MOP", "Zinc", "Compost"],
    "barley": ["Urea", "DAP", "MOP", "Compost"],
    "lentil": ["Rhizobium", "DAP", "MOP", "Gypsum", "Compost"],
    "pea": ["Rhizobium", "DAP", "MOP", "Compost"],
    "pigeon_pea": ["Rhizobium", "DAP", "MOP", "Gypsum", "Compost"],
    "mung_bean": ["Rhizobium", "DAP", "MOP", "Compost"],
    "black_gram": ["Rhizobium", "DAP", "MOP", "Compost"],
    "cowpea": ["Rhizobium", "DAP", "MOP", "Compost"],
    "cucumber": ["Urea", "DAP", "MOP", "Vermicompost"],
    "watermelon": ["Urea", "DAP", "MOP", "Compost"],
    "pumpkin": ["Urea", "DAP", "MOP", "Compost"],
    "banana": ["Urea", "MOP", "Compost", "Magnesium"],
    "coconut": ["Urea", "MOP", "Boron", "Compost"],
    "jute": ["Urea", "DAP", "MOP", "Compost"],
    "finger_millet": ["Urea", "DAP", "MOP", "Compost"],
    "pearl_millet": ["Urea", "DAP", "MOP", "Compost"],
    "bitter_gourd": ["Urea", "DAP", "MOP", "Vermicompost"],
    "muskmelon": ["Urea", "DAP", "MOP", "Compost"],
}

# Disease -> extra / corrective fertilizers
DISEASE_FERTILIZERS = {
    "leaf_spot": ["Potassium", "Neem-based foliar", "Compost tea"],
    "blight": ["Phosphorus", "Copper-based fungicide", "Compost"],
    "rust": ["Sulphur", "Potassium", "Compost"],
    "powdery_mildew": ["Sulphur", "Potassium", "Neem oil"],
    "root_rot": ["Trichoderma", "Compost", "Reduce nitrogen"],
    "deficiency": ["NPK balance", "Micronutrients", "Compost"],
    "healthy": [],
}

def normalize_crop(s):
    return (s or "").strip().lower().replace(" ", "_")

def recommend_fertilizers(crop: str, disease_detected: str = None) -> dict:
    crop_key = normalize_crop(crop)
    base = None
    for k, v in CROP_FERTILIZERS.items():
        if k in crop_key or crop_key in k:
            base = v
            break
    if not base:
        base = ["Urea", "DAP", "MOP", "Compost"]

    extra = []
    if disease_detected:
        d = (disease_detected or "").strip().lower().replace(" ", "_")
        for k, v in DISEASE_FERTILIZERS.items():
            if k in d or d in k:
                extra = v
                break

    return {
        "crop": crop,
        "base_fertilizers": base,
        "corrective_fertilizers": extra,
        "disease_considered": disease_detected or "None",
    }
