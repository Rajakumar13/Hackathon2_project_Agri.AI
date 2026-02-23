"""
Step-by-step crop production guidance. Returns procedures for any crop.
"""

def get_cultivation_steps(crop_key: str) -> list:
    crop = (crop_key or "").strip().lower().replace(" ", "_")
    # Generic steps; can be overridden per crop
    generic = [
        {"step": 1, "title": "Land Preparation", "description": "Plough the field 2-3 times, level the land, and add well-decomposed FYM or compost. Ensure proper drainage.", "duration": "1-2 weeks", "image_hint": "land_preparation"},
        {"step": 2, "title": "Seed Selection & Treatment", "description": "Choose certified seeds. Treat seeds with recommended fungicide/insecticide if needed. Soak if required for the crop.", "duration": "1-2 days", "image_hint": "seeds"},
        {"step": 3, "title": "Sowing", "description": "Sow at recommended spacing and depth. Follow row spacing and plant population for the variety.", "duration": "1-3 days", "image_hint": "sowing"},
        {"step": 4, "title": "Irrigation", "description": "Provide first irrigation at right time. Follow critical irrigation stages for the crop.", "duration": "Throughout", "image_hint": "irrigation"},
        {"step": 5, "title": "Weed & Nutrient Management", "description": "Apply recommended herbicides or manual weeding. Apply fertilizers in splits as per schedule.", "duration": "As per schedule", "image_hint": "fertilizer"},
        {"step": 6, "title": "Pest & Disease Control", "description": "Monitor for pests and diseases. Use IPM and recommended pesticides only when needed.", "duration": "As needed", "image_hint": "pest_control"},
        {"step": 7, "title": "Harvesting", "description": "Harvest at correct maturity. Use proper methods to avoid damage and post-harvest losses.", "duration": "1-2 weeks", "image_hint": "harvest"},
        {"step": 8, "title": "Post-Harvest & Storage", "description": "Dry, clean, and store in moisture-proof conditions. Follow safe storage practices.", "duration": "Ongoing", "image_hint": "storage"},
    ]
    # Crop-specific overrides (short descriptions)
    overrides = {
        "rice": [{"step": 1, "title": "Puddling", "description": "Puddle the field and maintain standing water. Level for uniform water depth."}],
        "wheat": [{"step": 1, "title": "Seed Bed", "description": "Prepare fine tilth. Ensure moisture at sowing."}],
        "potato": [{"step": 2, "title": "Seed Tuber", "description": "Use disease-free cut tubers; treat with fungicide."}],
    }
    steps = list(generic)
    for ov in overrides.get(crop, []):
        s = ov.get("step")
        if 1 <= s <= len(steps):
            steps[s - 1] = {**steps[s - 1], **ov}
    return steps
