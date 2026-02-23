@echo off
cd /d "%~dp0"
if not exist "venv\Scripts\python.exe" (
    echo Creating virtual environment...
    python -m venv venv
)
echo Upgrading pip...
venv\Scripts\python.exe -m pip install --upgrade pip
echo Installing Flask, Werkzeug, Pillow, numpy, requests...
venv\Scripts\python.exe -m pip install Flask Werkzeug Pillow numpy requests
echo Done. Run: venv\Scripts\python.exe app.py   or double-click run.bat
pause
