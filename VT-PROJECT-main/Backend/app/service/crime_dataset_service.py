import os
import pandas as pd
from math import radians, sin, cos, sqrt, atan2
from pathlib import Path

# Load the crime records from the unified Raipur master dataset.
BASE_DIR = Path(__file__).resolve().parent.parent
MASTER_DATA_FILE = BASE_DIR / "datasets" / "SheRoute_Raipur_Master_Dataset.csv"
LEGACY_DATA_FILE = BASE_DIR / "datasets" / "raipur_crime_dataset_250.csv"

if MASTER_DATA_FILE.exists():
    all_records = pd.read_csv(MASTER_DATA_FILE)
    crime_df = all_records.loc[all_records["row_type"].eq("crime")].copy()
    # Synthetic test rows are excluded from live risk calculations by default.
    # Enable only for a clearly labelled demo: SHEROUTE_INCLUDE_SYNTHETIC_CRIME=true
    include_synthetic = os.getenv("SHEROUTE_INCLUDE_SYNTHETIC_CRIME", "false").lower() in {"1", "true", "yes"}
    if not include_synthetic and "synthetic_record" in crime_df.columns:
        crime_df = crime_df.loc[~crime_df["synthetic_record"].astype(str).str.lower().isin({"true", "1", "yes"})].copy()
elif LEGACY_DATA_FILE.exists():
    crime_df = pd.read_csv(LEGACY_DATA_FILE)
else:
    crime_df = pd.DataFrame(columns=[
        "crime_id", "crime_name", "crime_type", "severity",
        "crime_count", "latitude", "longitude", "locality",
    ])

for column in ["latitude", "longitude", "crime_count"]:
    if column in crime_df.columns:
        crime_df[column] = pd.to_numeric(crime_df[column], errors="coerce")
crime_df = crime_df.dropna(subset=["latitude", "longitude"])
crime_df["crime_count"] = crime_df["crime_count"].fillna(0)


def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371000
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    )
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


def get_nearby_crimes(latitude: float, longitude: float, radius: int = 2000):
    nearby = []
    if crime_df.empty:
        return nearby

    for _, crime in crime_df.iterrows():
        distance = calculate_distance(
            latitude, longitude, float(crime["latitude"]), float(crime["longitude"])
        )
        if distance <= radius:
            nearby.append({
                "crime_id": crime.get("crime_id"),
                "crime_name": crime.get("crime_name"),
                "crime_type": crime.get("crime_type"),
                "severity": crime.get("severity"),
                "crime_count": int(crime.get("crime_count", 0)),
                "distance": round(distance, 2),
                "locality": crime.get("locality"),
            })
    return nearby


def calculate_crime_score(nearby_crimes):
    score = 100
    crime_types = set()
    high_severity = 0

    for crime in nearby_crimes:
        crime_types.add(crime.get("crime_type"))
        severity = str(crime.get("severity", "")).strip().lower()
        count = int(crime.get("crime_count") or 0)

        if severity == "high":
            score -= 10
            high_severity += 1
        elif severity in {"medium", "moderate"}:
            score -= 6
        else:
            score -= 3
        score -= min(count, 5)

    return {
        "crime_score": max(score, 0),
        "nearby_cases": len(nearby_crimes),
        "high_severity_cases": high_severity,
        "common_crimes": sorted(x for x in crime_types if x),
    }
