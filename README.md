# Agri AI – Web-based Agri AI Prototype

A complete **Agri AI** prototype for a hackathon demo: role-based experience (Farmer / Seller / Buyer), crop prediction, fertilizer recommendations, plant disease detection from images, cultivation guidance, buyer–seller matching, surveys, delivery tracking, voice control, and multi-language support.

## Tech Stack

- **Frontend:** HTML, Tailwind CSS (CDN), vanilla JavaScript  
- **Backend:** Python 3, Flask  
- **Run:** Locally in VS Code or any terminal

## Quick Start (Local)

### Option A: One-click run (Windows)

1. Double-click **`install_deps.bat`** once to create the venv and install all packages.
2. Double-click **`run.bat`** to start the app (it will install deps if missing, then run).

Open **http://127.0.0.1:5000** in your browser.

### Option B: Manual steps (Windows)

```powershell
cd IdealHackathon
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

### Option C: Use venv Python directly (avoids "No module named flask")

If `pip install -r requirements.txt` fails or Flask is not found:

```powershell
cd IdealHackathon
venv\Scripts\python.exe -m pip install Flask Werkzeug Pillow numpy requests
venv\Scripts\python.exe app.py
```

### VS Code

1. **Select the venv interpreter:** Press `Ctrl+Shift+P` → "Python: Select Interpreter" → choose `.\venv\Scripts\python.exe`.
2. Then in terminal: `pip install -r requirements.txt` and `python app.py` will use the venv.

## Features

### Role selection
- On open, user chooses **Farmer**, **Seller**, or **Buyer**.
- Dashboard and features change according to the selected role.

### Farmer
- **Crop prediction:** Soil color, previous crop, season, water availability → recommended crops.
- **Fertilizer recommendation:** By crop and optional disease.
- **Disease detection:** Upload plant/leaf image → analysis and remedy (demo uses image-based heuristic; replace with your ML model).
- **Cultivation guide:** Step-by-step procedure for any crop.
- **Complete procedure planning:** Full growing procedure + **Read aloud** (voice) for each step.
- **Survey:** Submit feedback to improve AI recommendations.

### Seller
- **Profile & crop quantity:** Name, location (lat/lon), list of crops with quantity, unit price, quality score.
- **Buyer interest & notifications:** Popup and list of buyer interest; refresh to load.

### Buyer
- **Buyer–seller matching:** Crop wanted, max budget, your location → matches by distance, quality, budget.
- **Delivery tracking:** Enter tracking ID (e.g. **DEMO001**) to see status and stages.

### Voice control (all roles)
- **Voice** button toggles listening.
- Commands: “crop”, “fertilizer”, “guide”, “procedure”, “read aloud”, “language”, “back”.

### Multi-language (i18n)
- **Language** dropdown: English, हिंदी, தமிழ், తెలుగు, বাংলা.
- UI labels and flow use the selected language where translations exist.

### Sample images
- Crop prediction, fertilizers, diseases, cultivation, and delivery sections show relevant sample images (via API) for better clarity.

## Project structure

```
IdealHackathon/
├── app.py                 # Flask app & API routes
├── requirements.txt
├── README.md
├── backend/
│   ├── config.py
│   ├── crop_predictor.py   # Rule-based crop recommendation
│   ├── fertilizer_recommender.py
│   ├── disease_predictor.py # Image-based demo (swap for real model)
│   ├── matching.py        # Buyer–seller matching
│   ├── cultivation_guide.py
│   └── i18n.py            # Translations
├── templates/
│   └── index.html         # Single-page UI
└── static/
    ├── js/
    │   └── app.js         # Frontend logic, API, voice, i18n
    └── uploads/           # Temporary image uploads (disease)
```

## Demo tips

1. **Crop prediction:** Choose soil, season, water; click “Predict Best Crop”.
2. **Disease:** Upload any plant/leaf image; “Analyze” returns a demo result (replace backend with your CNN for real inference).
3. **Matching:** As **Seller**, add profile with crops (name, qty, price, quality). As **Buyer**, enter crop, budget, lat/lon, then “Find matches”.
4. **Delivery:** Use tracking ID **DEMO001** to see sample status.
5. **Voice:** Click **Voice**, allow mic; say “crop” or “read aloud” etc.
6. **Language:** Change language from dropdown; labels update.

## Replacing disease detection with a real model

Edit `backend/disease_predictor.py`: keep the same function signature `predict_disease_from_image(image_path)` and replace the internal logic with loading your pretrained model (e.g. Keras/TensorFlow) and returning `{ "prediction", "label", "confidence", "remedy", "all_predictions" }`.

## Troubleshooting

| Error | Fix |
|-------|-----|
| `ModuleNotFoundError: No module named 'flask'` | Install deps into the **same** Python that runs the app. Run: `venv\Scripts\python.exe -m pip install Flask Werkzeug Pillow numpy requests` then `venv\Scripts\python.exe app.py`. Or use **install_deps.bat** then **run.bat**. |
| `Failed to run python -m pip install -r requirements.txt` | In VS Code, select interpreter `.\venv\Scripts\python.exe` (Ctrl+Shift+P → "Python: Select Interpreter"). Open a **new** terminal and run: `.\venv\Scripts\python.exe -m pip install Flask Werkzeug Pillow numpy requests`. |
| venv shows only `pip` in `pip list` | Dependencies didn’t install. From project folder run: `venv\Scripts\python.exe -m pip install Flask Werkzeug Pillow numpy requests` (allow network). |

## License

For hackathon / demo use.
