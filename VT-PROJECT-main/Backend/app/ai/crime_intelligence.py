from app.service.crime_dataset_service import (
    get_nearby_crimes,
    calculate_crime_score
)

from app.service.police_dataset_service import (
    count_nearby_police,
    get_nearest_police
)

from app.service.hospital_dataset_service import (
    count_nearby_hospitals,
    get_nearest_hospital
)

from math import radians, sin, cos, sqrt, atan2

from sqlalchemy.orm import Session

from app.service.crime_service import get_all_reports


# ---------------------------------------
# Calculate Distance (Haversine)
# ---------------------------------------

def calculate_distance(
    lat1,
    lon1,
    lat2,
    lon2
):

    R = 6371000  # meters

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


# ---------------------------------------
# Recommendation Generator
# ---------------------------------------

def generate_recommendation(common_crimes):

    if not common_crimes:
        return (
            "No recent community incidents reported nearby. "
            "Continue following general safety precautions."
        )

    if "Harassment" in common_crimes:
        return (
            "Stay in well-populated areas and keep "
            "trusted contacts informed."
        )

    if "Assault" in common_crimes:
        return (
            "Avoid travelling alone and prefer "
            "safer, busier routes."
        )

    if "Theft" in common_crimes:
        return (
            "Keep valuables secure and remain "
            "alert in crowded areas."
        )

    if "Suspicious Activity" in common_crimes:
        return (
            "Remain alert and avoid isolated "
            "or poorly lit locations."
        )

    return (
        "Exercise caution while travelling "
        "in this area."
    )


# ---------------------------------------
# AI Crime Intelligence
# ---------------------------------------

def analyze_area(
    latitude: float,
    longitude: float,
    db: Session
):

    reports = get_all_reports(db)

    # -----------------------------
    # Crime Dataset
    # -----------------------------

    nearby_crimes = get_nearby_crimes(
        latitude,
        longitude
    )

    crime_data = calculate_crime_score(
        nearby_crimes
    )

    # -----------------------------
    # Police Dataset
    # -----------------------------

    police_count = count_nearby_police(
        latitude,
        longitude
    )

    nearest_police = get_nearest_police(
        latitude,
        longitude
    )

    # -----------------------------
    # Hospital Dataset
    # -----------------------------

    hospital_count = count_nearby_hospitals(
        latitude,
        longitude
    )

    nearest_hospital = get_nearest_hospital(
        latitude,
        longitude
    )

    nearby_reports = []

    for report in reports:

        distance = calculate_distance(
            latitude,
            longitude,
            report.latitude,
            report.longitude
        )

        if distance <= 2000:

            nearby_reports.append(
                {
                    "report": report,
                    "distance": distance
                }
            )

    total_reports = len(
        nearby_reports
    )

    verified_reports = 0

    crime_categories = set()

    highest_risk = "Low"

    # Start with Crime Dataset Score

    safety_score = crime_data["crime_score"]

    for item in nearby_reports:

        report = item["report"]

        distance = item["distance"]

        crime_categories.add(
            report.category
        )

        verified_reports += (
            report.verified_count
        )

        # Risk impact

        if report.risk_level == "High":

            safety_score -= 10
            highest_risk = "High"

        elif report.risk_level == "Medium":

            safety_score -= 6

            if highest_risk != "High":
                highest_risk = "Medium"

        else:

            safety_score -= 3

        # Distance impact

        if distance < 500:
            safety_score -= 5

        elif distance < 1000:
            safety_score -= 3

        else:
            safety_score -= 1

        # Verification impact

        safety_score -= min(
            report.verified_count,
            5
        )

    safety_score = max(
        0,
        safety_score
    )

    # -----------------------------
    # Merge Community + Dataset Crimes
    # -----------------------------

    common_crimes = list(
        crime_categories.union(
            set(
                crime_data["common_crimes"]
            )
        )
    )

    # -----------------------------
    # Emergency Service Bonus
    # -----------------------------

    if police_count >= 3:
        safety_score += 3

    elif police_count >= 1:
        safety_score += 1

    if hospital_count >= 3:
        safety_score += 2

    elif hospital_count >= 1:
        safety_score += 1

    safety_score = min(
        safety_score,
        100
    )

    # -----------------------------
    # Risk Classification
    # -----------------------------

    if highest_risk == "High":

        community_risk = (
            "High"
            if safety_score < 70
            else "Medium"
        )

    elif safety_score >= 80:

        community_risk = "Low"

    elif safety_score >= 60:

        community_risk = "Medium"

    else:

        community_risk = "High"

    recommendation = generate_recommendation(
        common_crimes
    )

    return {

        "women_safety_index": safety_score,

        "community_risk": community_risk,

        "recommendation": recommendation,

        "community": {

            "total_reports": total_reports,

            "verified_reports": verified_reports

        },

        "crime": {

            "nearby_cases": crime_data["nearby_cases"],

            "high_severity_cases": crime_data["high_severity_cases"]

        },

        "police": {

            "count": police_count,

            "nearest": (
                nearest_police["name"]
                if nearest_police
                else None
            )

        },

        "hospital": {

            "count": hospital_count,

            "nearest": (
                nearest_hospital["name"]
                if nearest_hospital
                else None
            )

        },

        "safe_time": "06:00 AM - 06:00 PM",

        "unsafe_time": "09:00 PM - 05:00 AM",

        "common_crimes": common_crimes

    }