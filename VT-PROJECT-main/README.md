# SheRoute Full-Stack Setup Guide

This repository contains:
- Backend: FastAPI API with route safety logic and ML prediction
- Frontend: React + Vite app

## Project Structure
- Backend: [Backend](Backend)
- Frontend: [frontend](frontend)
- Trained model files (root): [route_safety_model.joblib](route_safety_model.joblib), [label_encoder.joblib](label_encoder.joblib)

## Prerequisites
- Python 3.10+ (tested with Python 3.14)
- Node.js 18+
- npm

## 1) Backend Setup and Run

Open terminal in project root, then run:

cd Backend
C:/Python314/python.exe -m pip install -r requirements.txt

Create a Backend/.env file with at least:

SECRET_KEY=dev-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./sheroute.db
ORS_API_KEY=
WEATHER_API_KEY=
GEOAPIFY_API_KEY=
NEWS_API_KEY=
GRAPHHOPPER_API_KEY=

Run API server:

C:/Python314/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

Health check URL:
- http://127.0.0.1:8000/health

Notes:
- If map/dataset files are not present, backend now falls back safely for startup.
- Full safe-route quality depends on external API keys and datasets.

## 2) Frontend Setup and Run

Open another terminal in project root, then run:

cd frontend
npm install

Create frontend/.env.local with:

VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_API_BASE_URL=http://127.0.0.1:8000

Start frontend dev server:

npm run dev

Build frontend:

npm run build

## 3) Tested Commands (Smoke)

Backend health and home endpoint check:

C:/Python314/python.exe -c "from app.main import app; from fastapi.testclient import TestClient; c=TestClient(app); print(c.get('/health').status_code, c.get('/health').json()); print(c.get('/').status_code, c.get('/').json())"

Model prediction endpoint check:

C:/Python314/python.exe -c "from app.main import app; from fastapi.testclient import TestClient; c=TestClient(app); r=c.post('/location/predict-safety', json={'police_count':2,'hospital_count':1,'night_light':62,'crime_count':3}); print(r.status_code, r.json())"

## 4) API Endpoints Used by Frontend
- POST /location/safe-route
- POST /location/predict-safety
- GET /community/nearby
- POST /community/report
- POST /community/verify/{report_id}

## 5) Troubleshooting
- Vite config site.json path:
  Uses ./.figma/make/site.json and falls back to ./make/site.json.
- If backend fails on missing env values, verify Backend/.env exists and ACCESS_TOKEN_EXPIRE_MINUTES is numeric.
- If prediction warns about sklearn version mismatch, retraining model with current sklearn version is recommended.

## 6) Updated Raipur master dataset and model

The backend now reads `Backend/app/datasets/SheRoute_Raipur_Master_Dataset.csv` for its local crime, police-station, and hospital records. The dataset is split by `row_type` so that each service only reads its relevant records. Synthetic crime test rows are excluded from live crime-risk calculations by default; only enable them for a clearly labelled demo by setting `SHEROUTE_INCLUDE_SYNTHETIC_CRIME=true` in the backend environment. The 250 non-synthetic crime rows are still source-supplied and have not been independently verified.

The Random Forest training script reads only rows where `row_type == "route_safety_record"` and uses `police_count`, `hospital_count`, `night_light`, and `crime_count` to predict `target`. It deliberately does not train on crime/hospital/police location rows.

To retrain after replacing the master CSV, run this command from the repository root:

```bash
python ranadomforest_modeltraining_py.py
```

This updates `route_safety_model.joblib` and `label_encoder.joblib`, which the FastAPI prediction module loads. Restart the backend after replacing the model files.

**Data-quality note:** The route target labels and source locations have not been independently verified against official incident/ground-truth records. The holdout score measures agreement with the supplied labels only; it must not be described as verified real-world safety accuracy. Some locality and midpoint coordinates are estimates as marked in the CSV.
