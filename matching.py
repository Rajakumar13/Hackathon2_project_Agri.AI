"""
Buyer-Seller matching by crop availability, location distance, quality score, budget.
"""

def haversine_km(lat1, lon1, lat2, lon2):
    """Approximate distance in km."""
    import math
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlam/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def match_buyers_to_sellers(buyers: list, sellers: list, max_distance_km: float = 200) -> list:
    """
    buyers: list of {id, crop_wanted, location: {lat, lon}, max_budget, min_quality}
    sellers: list of {id, crops: [{name, quantity, unit_price, quality_score}], location: {lat, lon}}
    """
    matches = []
    for b in buyers:
        b_lat = b.get("location", {}).get("lat", 0)
        b_lon = b.get("location", {}).get("lon", 0)
        crop_wanted = (b.get("crop_wanted") or "").strip().lower()
        max_budget = float(b.get("max_budget") or 1e9)
        min_quality = float(b.get("min_quality") or 0)

        for s in sellers:
            s_lat = s.get("location", {}).get("lat", 0)
            s_lon = s.get("location", {}).get("lon", 0)
            dist = haversine_km(b_lat, b_lon, s_lat, s_lon)
            if dist > max_distance_km:
                continue
            for offer in s.get("crops", []):
                cname = (offer.get("name") or "").strip().lower()
                if crop_wanted not in cname and cname not in crop_wanted:
                    continue
                qty = float(offer.get("quantity") or 0)
                unit_price = float(offer.get("unit_price") or 0)
                quality = float(offer.get("quality_score") or 0)
                if quality < min_quality:
                    continue
                total = qty * unit_price
                if total > max_budget:
                    continue
                score = (10 - min(dist / 20, 10)) * 0.3 + (quality / 10) * 0.4 + (1 - min(total / max_budget, 1)) * 0.3
                matches.append({
                    "buyer_id": b.get("id"),
                    "seller_id": s.get("id"),
                    "seller_name": s.get("name", "Seller"),
                    "crop": offer.get("name"),
                    "quantity": qty,
                    "unit_price": unit_price,
                    "total_price": round(total, 2),
                    "quality_score": quality,
                    "distance_km": round(dist, 2),
                    "match_score": round(score, 2),
                })
    return sorted(matches, key=lambda x: -x["match_score"])
