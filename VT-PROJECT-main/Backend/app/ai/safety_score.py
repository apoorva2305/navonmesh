from app.ai.crime import get_crime_score
from app.ai.streetlight import get_route_streetlight_score
from app.ai.advice import generate_advice
from app.utils.route_sampler import sample_route_points
from app.ai.service_features import (
    get_police_features,
    get_hospital_features
)


def _anchor_points(route_points, fallback_lat, fallback_lon):
    """
    Return sparse anchor points along the route for non-lighting features.
    This keeps requests fast while still capturing route variation.
    """

    if not route_points:
        return [(fallback_lat, fallback_lon)]

    step = max(1, len(route_points) // 10)
    anchors = route_points[::step]

    if anchors[-1] != route_points[-1]:
        anchors.append(route_points[-1])

    return anchors


def calculate_safety_score(route_data, lat, lon):

    # -------------------------
    # Decode Route
    # -------------------------

    route_points = sample_route_points(
        route_data["geometry"]
    )

    anchors = _anchor_points(
        route_points,
        lat,
        lon
    )


    # -------------------------
    # Crime
    # -------------------------

    crime_results = [
        get_crime_score(point_lat, point_lon)
        for point_lat, point_lon in anchors
    ]

    crime_score = round(
        sum(result["crime_score"] for result in crime_results) / len(crime_results),
        2
    )

    nearby_crime_cases = round(
        sum(result.get("nearby_crime_cases", 0) for result in crime_results) / len(crime_results)
    )

    high_severity_cases = round(
        sum(result.get("high_severity_cases", 0) for result in crime_results) / len(crime_results)
    )


    # -------------------------
    # Street Lights
    # -------------------------

    street_light_score = get_route_streetlight_score(
        route_points
    )


    # -------------------------
    # Police Features
    # -------------------------

    police_results = [
        get_police_features(point_lat, point_lon)
        for point_lat, point_lon in anchors
    ]

    police_score = round(
        sum(result["police_score"] for result in police_results) / len(police_results)
    )

    police_station_count = round(
        sum(result["police_station_count"] for result in police_results) / len(police_results)
    )

    police_distances = [
        result["nearest_police_distance"]
        for result in police_results
        if result["nearest_police_distance"] is not None
    ]

    nearest_police_distance = (
        min(police_distances)
        if police_distances
        else None
    )


    # -------------------------
    # Hospital Features
    # -------------------------

    hospital_results = [
        get_hospital_features(point_lat, point_lon)
        for point_lat, point_lon in anchors
    ]

    hospital_score = round(
        sum(result["hospital_score"] for result in hospital_results) / len(hospital_results)
    )

    hospital_count = round(
        sum(result["hospital_count"] for result in hospital_results) / len(hospital_results)
    )

    hospital_distances = [
        result["nearest_hospital_distance"]
        for result in hospital_results
        if result["nearest_hospital_distance"] is not None
    ]

    nearest_hospital_distance = (
        min(hospital_distances)
        if hospital_distances
        else None
    )



    # -------------------------
    # Final Score
    # -------------------------

    final_score = round(
        (crime_score * 0.40)
        +
        (street_light_score * 0.25)
        +
        (police_score * 0.20)
        +
        (hospital_score * 0.15)
    )


    if final_score >= 80:

        risk_level = "Low"
        recommendation = "Safe Route"

    elif final_score >= 50:

        risk_level = "Medium"
        recommendation = "Moderate Risk Route"

    else:

        risk_level = "High"
        recommendation = "Avoid This Route"



    advice = generate_advice(
        final_score,
        street_light_score
    )


    return {

        "safety_score": final_score,

        "risk_level": risk_level,

        "recommendation": recommendation,


        "factors": {

            "crime_score": round(crime_score,2),

            "lighting_score": round(
                street_light_score,
                2
            ),

            "police_score": police_score,

            "hospital_score": hospital_score

        },


        "model_features": {

            "nearby_crime_cases":
                nearby_crime_cases,

            "high_severity_cases":
                high_severity_cases,

            "police_station_count":
                police_station_count,

            "nearest_police_distance":
                nearest_police_distance,

            "hospital_count":
                hospital_count,

            "nearest_hospital_distance":
                nearest_hospital_distance

        },


        "advice": advice

    }