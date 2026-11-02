import pandas as pd
from pathlib import Path
from math import radians, sin, cos, sqrt, atan2

# -----------------------------
# Load Dataset Once
# -----------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
MASTER_DATA_FILE = BASE_DIR / "datasets" / "SheRoute_Raipur_Master_Dataset.csv"
LEGACY_DATA_FILE = BASE_DIR / "datasets" / "Raipur_Hospitals.csv"

if MASTER_DATA_FILE.exists():
    all_records = pd.read_csv(MASTER_DATA_FILE)
    hospital_df = all_records.loc[all_records["row_type"].eq("hospital")].copy()
elif LEGACY_DATA_FILE.exists():
    hospital_df = pd.read_csv(LEGACY_DATA_FILE)
else:
    hospital_df = pd.DataFrame(columns=["hospital_name", "latitude", "longitude"])

for column in ["latitude", "longitude"]:
    if column in hospital_df.columns:
        hospital_df[column] = pd.to_numeric(hospital_df[column], errors="coerce")
hospital_df = hospital_df.dropna(subset=["latitude", "longitude"])


# -----------------------------
# Calculate Distance
# -----------------------------

def calculate_distance(
    lat1,
    lon1,
    lat2,
    lon2
):

    R = 6371000

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        +
        cos(radians(lat1))
        *
        cos(radians(lat2))
        *
        sin(dlon / 2) ** 2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )

    return R * c




# -----------------------------
# Get Nearby Hospitals
# -----------------------------

def get_nearby_hospitals(
    latitude: float,
    longitude: float,
    radius: int = 2000
):

    nearby = []

    if hospital_df.empty:
        return nearby

    for _, hospital in hospital_df.iterrows():

        distance = calculate_distance(

            latitude,
            longitude,

            hospital["latitude"],
            hospital["longitude"]

        )

        if distance <= radius:

            nearby.append(

                {

                    "name": hospital["hospital_name"],

                    "distance": round(distance, 2),

                    "latitude": hospital["latitude"],

                    "longitude": hospital["longitude"]

                }

            )

    return nearby




# -----------------------------
# Count Nearby Hospitals
# -----------------------------

def count_nearby_hospitals(
    latitude: float,
    longitude: float,
    radius: int = 2000
):

    nearby = get_nearby_hospitals(
        latitude,
        longitude,
        radius
    )

    return len(nearby)


# -----------------------------
# Get Nearest Hospital
# -----------------------------

def get_nearest_hospital(
    latitude: float,
    longitude: float,
    radius: int = 2000
):

    nearby = get_nearby_hospitals(
        latitude,
        longitude,
        radius
    )

    if not nearby:
        return None

    return min(
        nearby,
        key=lambda hospital: hospital["distance"]
    )

