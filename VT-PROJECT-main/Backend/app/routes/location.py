from datetime import datetime
from math import radians, sin, cos, sqrt, atan2

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.ai.weather import get_live_weather
from app.ai.safety_score import calculate_safety_score
from app.ai.route_prediction import predict_route_safety
from app.database.database import get_db
from app.models.location_model import LocationHistory
from app.schemas.route import SafeRouteResponse
from app.service.graphhopper_service import get_alternative_routes
from app.service.nearby_service import get_nearby_places


router = APIRouter()


def _haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371000
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return radius * c


def _fallback_routes(request: "RouteRequest"):
    distance_meters = _haversine_distance_m(
        request.start_lat,
        request.start_lon,
        request.end_lat,
        request.end_lon,
    )

    # Assume ~35 km/h urban speed for fallback ETA.
    duration_seconds = (distance_meters / 1000) / 35 * 3600

    return [
        {
            "route_id": 1,
            "distance_meters": distance_meters,
            "duration_seconds": duration_seconds,
            "geometry": "",
            "route_points": [
                [request.start_lat, request.start_lon],
                [request.end_lat, request.end_lon],
            ],
            "steps": [],
        }
    ]


def _model_score(label: str, confidence: float | None) -> int:
    base_scores = {
        "safe": 90,
        "moderate": 65,
        "unsafe": 35,
    }

    normalized = label.strip().lower() if label else "moderate"
    baseline = base_scores.get(normalized, 65)

    if confidence is None:
        return baseline

    blended = round((baseline * 0.75) + (confidence * 0.25))
    return max(0, min(blended, 100))


# -----------------------------
# Request Models
# -----------------------------

class LocationUpdate(BaseModel):
    user_id: int
    latitude: float
    longitude: float


class RouteRequest(BaseModel):

    start_lat: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Starting latitude"
    )

    start_lon: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Starting longitude"
    )

    end_lat: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Ending latitude"
    )

    end_lon: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Ending longitude"
    )


class RouteSafetyPredictionRequest(BaseModel):
    police_count: int = Field(..., ge=0)
    hospital_count: int = Field(..., ge=0)
    night_light: float = Field(..., ge=0, le=100)
    crime_count: int = Field(..., ge=0)


# -----------------------------
# Update Location
# -----------------------------

@router.post("/update")
async def update_location(
    location: LocationUpdate,
    db: Session = Depends(get_db)
):

    new_location = LocationHistory(
        user_id=location.user_id,
        latitude=location.latitude,
        longitude=location.longitude
    )

    db.add(new_location)
    db.commit()
    db.refresh(new_location)

    return {
        "success": True,
        "message": "Location saved successfully.",
        "location": {
            "id": new_location.id,
            "user_id": new_location.user_id,
            "latitude": new_location.latitude,
            "longitude": new_location.longitude,
            "created_at": new_location.created_at
        }
    }


# -----------------------------
# Get Current Location
# -----------------------------

@router.get("/current/{user_id}")
async def current_location(user_id: int):

    return {
        "success": True,
        "user_id": user_id,
        "latitude": 0.0,
        "longitude": 0.0
    }


# -----------------------------
# Location History
# -----------------------------

@router.get("/history/{user_id}")
async def location_history(
    user_id: int,
    db: Session = Depends(get_db)
):

    locations = (
        db.query(LocationHistory)
        .filter(LocationHistory.user_id == user_id)
        .all()
    )

    return {
        "success": True,
        "user_id": user_id,
        "history": locations
    }


# -----------------------------
# Safe Route
# -----------------------------

@router.post(
    "/safe-route",
    response_model=SafeRouteResponse
)
async def safe_route(route: RouteRequest):

    # -------------------------
    # Get Alternative Routes
    # -------------------------

    try:
        routes = get_alternative_routes(
            start_lon=route.start_lon,
            start_lat=route.start_lat,
            end_lon=route.end_lon,
            end_lat=route.end_lat
        )
    except Exception:
        routes = _fallback_routes(route)

    # -------------------------
    # Current Time
    # -------------------------

    current_time = datetime.now().strftime("%I:%M %p")

    # -------------------------
    # Weather Information
    # -------------------------

    weather = get_live_weather(
        route.start_lat,
        route.start_lon
    )

    # -------------------------
    # Nearby Emergency Places
    # -------------------------

    try:
        nearby_police = get_nearby_places(
            lat=route.start_lat,
            lon=route.start_lon,
            place_type="police"
        )
    except Exception:
        nearby_police = []

    try:
        nearby_hospitals = get_nearby_places(
            lat=route.start_lat,
            lon=route.start_lon,
            place_type="hospital"
        )
    except Exception:
        nearby_hospitals = []

    # -------------------------
    # Calculate Safety Score
    # -------------------------

    route_options = []

    for route_result in routes:

        safety_result = calculate_safety_score(
            route_result,
            route.start_lat,
            route.start_lon
        )

        model_features = safety_result.get("model_features", {})
        model_prediction = predict_route_safety(
            police_count=int(model_features.get("police_station_count", 0)),
            hospital_count=int(model_features.get("hospital_count", 0)),
            night_light=float(safety_result.get("factors", {}).get("lighting_score", 0)),
            crime_count=int(model_features.get("nearby_crime_cases", 0)),
        )

        prediction_label = model_prediction.get("label", "Moderate")
        prediction_confidence = model_prediction.get("confidence")
        factor_based_score = int(safety_result.get("safety_score", 65))
        model_only_score = _model_score(
            prediction_label,
            prediction_confidence,
        )

        safety_result["safety_score"] = round(
            (model_only_score * 0.70)
            +
            (factor_based_score * 0.30)
        )

        normalized_label = str(prediction_label).strip().lower()
        if normalized_label == "safe":
            safety_result["risk_level"] = "Low"
            safety_result["recommendation"] = "Safe Route"
        elif normalized_label == "unsafe":
            safety_result["risk_level"] = "High"
            safety_result["recommendation"] = "Avoid This Route"
        else:
            safety_result["risk_level"] = "Medium"
            safety_result["recommendation"] = "Moderate Risk Route"

        safety_result["model_features"] = {
            **model_features,
            "predicted_safety_label": prediction_label,
            "prediction_confidence": prediction_confidence,
            "factor_based_score": factor_based_score,
            "model_only_score": model_only_score,
        }

        route_options.append({
            **route_result,
            **safety_result
        })

    route_options.sort(
        key=lambda option: option.get("safety_score", 0),
        reverse=True,
    )

    # -------------------------
    # Final Response
    # -------------------------

    return {
        "weather": weather,
        "current_time": current_time,
        "nearby_police_stations": nearby_police,
        "nearby_hospitals": nearby_hospitals,
        "routes": route_options
    }


@router.post("/predict-safety")
async def predict_safety(payload: RouteSafetyPredictionRequest):
    prediction = predict_route_safety(
        police_count=payload.police_count,
        hospital_count=payload.hospital_count,
        night_light=payload.night_light,
        crime_count=payload.crime_count,
    )

    return {
        "success": True,
        "prediction": prediction,
    }
    