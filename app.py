"""
Agri AI - Flask backend. Run: python app.py
"""
import os
import json
import uuid
from flask import Flask, request, jsonify, send_from_directory, render_template
from werkzeug.utils import secure_filename

# Add project root to path
import sys
sys_path = os.path.dirname(os.path.abspath(__file__))
if sys_path not in sys.path:
    sys.path.insert(0, sys_path)

from backend.config import ensure_upload_dir, UPLOAD_FOLDER, ALLOWED_EXTENSIONS, MAX_CONTENT_LENGTH
from backend.crop_predictor import recommend_crops
from backend.fertilizer_recommender import recommend_fertilizers
from backend.disease_predictor import predict_disease_from_image
from backend.matching import match_buyers_to_sellers
from backend.cultivation_guide import get_cultivation_steps
from backend.i18n import get_text, get_all_for_lang

app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH
ensure_upload_dir()

# In-memory stores for demo (use DB in production)
surveys_store = []
delivery_status_store = {
    "DEMO001": {
        "tracking_id": "DEMO001",
        "status": "in_transit",
        "stages": [
            {"name": "Order confirmed", "done": True},
            {"name": "Dispatched", "done": True},
            {"name": "In transit", "done": True},
            {"name": "Delivered", "done": False},
        ],
        "origin": "Farm A, Punjab",
        "destination": "Market, Delhi",
    }
}
seller_profiles = []
buyer_requests = []
notifications = []


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ---------- Pages ----------
@app.route("/")
def index():
    return render_template("index.html")


# ---------- API: Role & i18n ----------
@app.route("/api/i18n/<lang>", methods=["GET"])
def api_i18n(lang):
    return jsonify(get_all_for_lang(lang))


# ---------- API: Crop prediction ----------
@app.route("/api/predict-crop", methods=["POST"])
def api_predict_crop():
    data = request.get_json() or {}
    result = recommend_crops(
        soil_color=data.get("soil_color"),
        previous_crop=data.get("previous_crop"),
        season=data.get("season"),
        water_availability=data.get("water_availability"),
    )
    return jsonify(result)


# ---------- API: Fertilizer ----------
@app.route("/api/fertilizer", methods=["POST"])
def api_fertilizer():
    data = request.get_json() or {}
    result = recommend_fertilizers(
        crop=data.get("crop"),
        disease_detected=data.get("disease_detected"),
    )
    return jsonify(result)


# ---------- API: Disease from image ----------
@app.route("/api/disease-predict", methods=["POST"])
def api_disease_predict():
    if "image" not in request.files:
        return jsonify({"error": "No image file"}), 400
    f = request.files["image"]
    if not f.filename or not allowed_file(f.filename):
        return jsonify({"error": "Invalid image type"}), 400
    filename = secure_filename(f"{uuid.uuid4().hex}_{f.filename}")
    path = os.path.join(UPLOAD_FOLDER, filename)
    f.save(path)
    try:
        result = predict_disease_from_image(path)
        result["uploaded_url"] = f"/static/uploads/{filename}"
        return jsonify(result)
    finally:
        if os.path.isfile(path):
            try:
                os.remove(path)
            except Exception:
                pass


# ---------- API: Cultivation steps ----------
@app.route("/api/cultivation/<crop_key>", methods=["GET"])
def api_cultivation(crop_key):
    steps = get_cultivation_steps(crop_key)
    return jsonify({"crop": crop_key, "steps": steps})


# ---------- API: Buyer-Seller matching ----------
@app.route("/api/match", methods=["POST"])
def api_match():
    data = request.get_json() or {}
    buyers = data.get("buyers", [])
    sellers = data.get("sellers", [])
    max_dist = float(data.get("max_distance_km", 200))
    from backend.matching import match_buyers_to_sellers
    matches = match_buyers_to_sellers(buyers, sellers, max_dist)
    return jsonify({"matches": matches})


# ---------- API: Seller profiles & crop quantity ----------
@app.route("/api/sellers", methods=["GET", "POST"])
def api_sellers():
    global seller_profiles
    if request.method == "POST":
        body = request.get_json() or {}
        seller_profiles.append({
            "id": str(uuid.uuid4()),
            "name": body.get("name", "Seller"),
            "location": body.get("location", {"lat": 0, "lon": 0}),
            "crops": body.get("crops", []),
        })
        return jsonify(seller_profiles[-1])
    return jsonify(seller_profiles)


# ---------- API: Buyer interest (notifications) ----------
@app.route("/api/buyer-interest", methods=["POST"])
def api_buyer_interest():
    body = request.get_json() or {}
    n = {
        "id": str(uuid.uuid4()),
        "seller_id": body.get("seller_id"),
        "buyer_id": body.get("buyer_id"),
        "buyer_name": body.get("buyer_name", "Buyer"),
        "crop": body.get("crop"),
        "quantity": body.get("quantity"),
        "message": body.get("message", ""),
        "read": False,
    }
    notifications.append(n)
    return jsonify(n)


@app.route("/api/notifications", methods=["GET"])
def api_notifications():
    seller_id = request.args.get("seller_id")
    items = [n for n in notifications if n.get("seller_id") == seller_id] if seller_id else notifications
    return jsonify(items)


# ---------- API: Survey ----------
@app.route("/api/survey", methods=["POST"])
def api_survey():
    body = request.get_json() or {}
    surveys_store.append({
        "id": str(uuid.uuid4()),
        "role": body.get("role"),
        "responses": body.get("responses", {}),
        "timestamp": body.get("timestamp"),
    })
    return jsonify({"ok": True, "id": surveys_store[-1]["id"]})


# ---------- API: Delivery tracking ----------
@app.route("/api/delivery", methods=["GET", "POST"])
def api_delivery():
    global delivery_status_store
    if request.method == "POST":
        body = request.get_json() or {}
        tid = body.get("tracking_id") or str(uuid.uuid4())
        delivery_status_store[tid] = {
            "tracking_id": tid,
            "status": body.get("status", "created"),
            "stages": body.get("stages", [
                {"name": "Order confirmed", "done": True},
                {"name": "Dispatched", "done": False},
                {"name": "In transit", "done": False},
                {"name": "Delivered", "done": False},
            ]),
            "origin": body.get("origin", ""),
            "destination": body.get("destination", ""),
        }
        return jsonify(delivery_status_store[tid])
    tid = request.args.get("tracking_id")
    if tid and tid in delivery_status_store:
        return jsonify(delivery_status_store[tid])
    return jsonify(list(delivery_status_store.values()))


# ---------- Static uploads ----------
@app.route("/static/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# ---------- Sample images (placeholder URLs - replace with real paths) ----------
@app.route("/api/sample-images", methods=["GET"])
def api_sample_images():
    feature = request.args.get("feature", "crops")
    # Return placeholder image URLs; frontend can use unsplash or local assets
    base = "https://images.unsplash.com"
    images = {
        "crops": [f"{base}/photo-1574943320219-553eb213f72d?w=400", f"{base}/photo-1500382017468-9049fed747ef?w=400"],
        "diseases": [f"{base}/photo-1597848212624-a19eb35e2651?w=400", f"{base}/photo-1416879595882-3373a0480b5b?w=400"],
        "fertilizers": [f"{base}/photo-1416879595882-3373a0480b5b?w=400"],
        "soil": [f"{base}/photo-1416879595882-3373a0480b5b?w=400"],
        "cultivation": [f"{base}/photo-1500382017468-9049fed747ef?w=400", f"{base}/photo-1574943320219-553eb213f72d?w=400"],
        "delivery": [f"{base}/photo-1566576912321-d58ddd7a5938?w=400"],
    }
    return jsonify(images.get(feature, images["crops"]))


if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0")
