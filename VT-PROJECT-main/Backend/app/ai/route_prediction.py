from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd
import numpy as np

MODEL_FILE = "route_safety_model.joblib"
LABEL_ENCODER_FILE = "label_encoder.joblib"


@lru_cache(maxsize=1)
def _load_assets():
    repo_root = Path(__file__).resolve().parents[3]
    model_path = repo_root / MODEL_FILE
    label_encoder_path = repo_root / LABEL_ENCODER_FILE

    model = joblib.load(model_path)
    label_encoder = joblib.load(label_encoder_path)

    return model, label_encoder


def predict_route_safety(
    police_count: int,
    hospital_count: int,
    night_light: float,
    crime_count: int,
):
    """Predict route safety class using the trained RandomForest model."""
    try:
        model, label_encoder = _load_assets()
    except Exception:
        return {
            "label": "Moderate",
            "confidence": None,
        }

    features = np.array(
        [[police_count, hospital_count, night_light, crime_count]],
        dtype=float,
    )
    feature_frame = pd.DataFrame(
        features,
        columns=["police_count", "hospital_count", "night_light", "crime_count"],
    )

    encoded_prediction = int(model.predict(feature_frame)[0])
    safety_label = str(label_encoder.inverse_transform([encoded_prediction])[0])

    confidence = None
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(feature_frame)[0]
        confidence = round(float(np.max(probabilities)) * 100, 2)

    return {
        "label": safety_label,
        "confidence": confidence,
    }
