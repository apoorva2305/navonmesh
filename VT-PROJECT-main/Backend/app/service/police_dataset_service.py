import pandas as pd
from pathlib import Path
from math import radians, sin, cos, sqrt, atan2
# -----------------------------
# Load Dataset Once
# -----------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
MASTER_DATA_FILE = BASE_DIR / "datasets" / "SheRoute_Raipur_Master_Dataset.csv"
LEGACY_DATA_FILE = BASE_DIR / "datasets" / "police_stations.csv"

if MASTER_DATA_FILE.exists():
    all_records = pd.read_csv(MASTER_DATA_FILE)
    police_df = all_records.loc[all_records["row_type"].eq("police_station")].copy()
elif LEGACY_DATA_FILE.exists():
    police_df = pd.read_csv(LEGACY_DATA_FILE)
else:
    police_df = pd.DataFrame(columns=["police_station_name", "latitude", "longitude"])

for column in ["latitude", "longitude"]:
    if column in police_df.columns:
        police_df[column] = pd.to_numeric(police_df[column], errors="coerce")
police_df = police_df.dropna(subset=["latitude", "longitude"])
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
# Get Nearby Police Stations
# -----------------------------

def get_nearby_police(
    latitude: float,
    longitude: float,
    radius: int = 2000
):

    nearby = []

    if police_df.empty:
        return nearby

    for _, police in police_df.iterrows():

        distance = calculate_distance(

            latitude,
            longitude,

            police["latitude"],
            police["longitude"]

        )

        if distance <= radius:

            nearby.append(

                {

                    "name": police["police_station_name"],

                    "distance": round(distance, 2),

                    "latitude": police["latitude"],

                    "longitude": police["longitude"]

                }

            )

    return nearby




# -----------------------------
# Count Nearby Police Stations
# -----------------------------

def count_nearby_police(
    latitude: float,
    longitude: float,
    radius: int = 2000
):

    nearby = get_nearby_police(
        latitude,
        longitude,
        radius
    )

    return len(nearby)



# -----------------------------
# Get Nearest Police Station
# -----------------------------

def get_nearest_police(
    latitude: float,
    longitude: float,
    radius: int = 2000
):

    nearby = get_nearby_police(
        latitude,
        longitude,
        radius
    )

    if not nearby:
        return None

    return min(
        nearby,
        key=lambda station: station["distance"]
    )
