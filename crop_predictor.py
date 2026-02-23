"""
Rule-based crop recommendation based on soil, previous crop, season, water.
Suitable for hackathon demo; can be replaced with ML model later.
"""

# Soil color -> general type
SOIL_TYPES = {
    "black": "black_cotton",
    "red": "red_loam",
    "brown": "alluvial",
    "yellow": "laterite",
    "grey": "saline",
}

# Season -> suitable crops (simplified)
SEASON_CROPS = {
    "kharif": ["rice", "maize", "cotton", "sugarcane", "groundnut", "soybean", "pigeon_pea"],
    "rabi": ["wheat", "barley", "mustard", "chickpea", "lentil", "potato", "onion"],
    "zaid": ["cucumber", "watermelon", "muskmelon", "bitter_gourd", "pumpkin"],
    "monsoon": ["rice", "maize", "sorghum", "pearl_millet", "finger_millet"],
    "summer": ["rice", "maize", "mung_bean", "black_gram", "cowpea"],
    "winter": ["wheat", "mustard", "barley", "pea", "lentil"],
}

# Water availability -> crop suitability
WATER_CROPS = {
    "high": ["rice", "sugarcane", "banana", "coconut", "jute"],
    "medium": ["wheat", "maize", "cotton", "soybean", "groundnut", "chickpea"],
    "low": ["millet", "sorghum", "barley", "lentil", "chickpea", "mustard"],
}

# Crop rotation: avoid same family
CROP_FAMILIES = {
    "rice": "poaceae", "wheat": "poaceae", "maize": "poaceae", "sorghum": "poaceae",
    "chickpea": "fabaceae", "lentil": "fabaceae", "soybean": "fabaceae", "groundnut": "fabaceae",
    "cotton": "malvaceae", "mustard": "brassicaceae", "potato": "solanaceae", "onion": "alliaceae",
}

def get_family(crop_key):
    for k, v in CROP_FAMILIES.items():
        if k in crop_key or crop_key in k:
            return v
    return None

def recommend_crops(soil_color: str, previous_crop: str, season: str, water_availability: str) -> dict:
    soil_color = (soil_color or "").strip().lower()
    previous_crop = (previous_crop or "").strip().lower().replace(" ", "_")
    season = (season or "").strip().lower()
    water_availability = (water_availability or "medium").strip().lower()

    avoid_family = get_family(previous_crop)
    season_list = SEASON_CROPS.get(season, list(SEASON_CROPS.get("kharif", [])) + list(SEASON_CROPS.get("rabi", [])))
    water_list = WATER_CROPS.get(water_availability, WATER_CROPS["medium"])

    # Intersection and scoring
    candidates = {}
    for c in set(season_list + water_list):
        c_lower = c.lower().replace(" ", "_")
        score = 0
        if c_lower in season_list:
            score += 2
        if c_lower in water_list:
            score += 2
        if avoid_family and get_family(c_lower) == avoid_family:
            score -= 2  # rotation
        if score > 0:
            candidates[c_lower] = score

    recommended = sorted(candidates.keys(), key=lambda x: -candidates[x])[:5]
    if not recommended:
        recommended = ["wheat", "chickpea", "mustard", "lentil", "barley"]

    return {
        "recommended_crops": [{"name": c.replace("_", " ").title(), "key": c} for c in recommended],
        "soil_type": SOIL_TYPES.get(soil_color, "general"),
        "message": f"Based on {soil_color or 'your'} soil, previous crop ({previous_crop or 'none'}), {season} season, and {water_availability} water availability."
    }
