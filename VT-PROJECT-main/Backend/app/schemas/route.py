from pydantic import BaseModel
from typing import List


# --------------------------------
# Route Step
# --------------------------------

class RouteStep(BaseModel):
    distance: float
    duration: float
    type: int
    instruction: str
    name: str
    way_points: List[int]


# --------------------------------
# Safety Factors
# --------------------------------

class SafetyFactors(BaseModel):

    crime_score: float

    lighting_score: float

    police_score: float

    hospital_score: float

class ModelFeatures(BaseModel):

    nearby_crime_cases: int = 0
    high_severity_cases: int = 0

    police_station_count: int
    nearest_police_distance: float | None = None

    hospital_count: int
    nearest_hospital_distance: float | None = None

    predicted_safety_label: str | None = None
    prediction_confidence: float | None = None
    factor_based_score: int | None = None
    model_only_score: int | None = None

# --------------------------------
# Nearby Place
# --------------------------------

class NearbyPlace(BaseModel):
    name: str
    distance: float | None = None
    latitude: float | None = None
    longitude: float | None = None


# --------------------------------
# One Route Option
# --------------------------------

class RouteOption(BaseModel):

    route_id: int

    distance_meters: float
    duration_seconds: float

    geometry: str
    route_points: List[List[float]]

    steps: List[RouteStep]

    safety_score: int
    risk_level: str
    recommendation: str

    factors: SafetyFactors

    model_features: ModelFeatures

    advice: List[str]


# --------------------------------
# Final API Response
# --------------------------------

class SafeRouteResponse(BaseModel):

    weather: str
    current_time: str

    nearby_police_stations: List[NearbyPlace]
    nearby_hospitals: List[NearbyPlace]

    routes: List[RouteOption]