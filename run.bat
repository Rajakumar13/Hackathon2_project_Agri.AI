@echo off
cd /d "%~dp0"
if not exist "venv\Scripts\python.exe" (
    echo Creating virtual environment...
    python -m venv venv
)
echo Installing dependencies...
venv\Scripts\python.exe -m pip install --upgrade pip -q
venv\Scripts\python.exe -m pip install Flask Werkzeug Pillow numpy requests -q
echo Starting Agri AI...
venv\Scripts\python.exe app.py
