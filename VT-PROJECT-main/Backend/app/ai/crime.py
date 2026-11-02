from app.service.crime_dataset_service import (
    calculate_crime_score,
    get_nearby_crimes,
)



def get_crime_score(
    lat: float,
    lon: float,
    radius_km: float = 2
):
    """
    Calculates crime safety score.

    Higher score = safer area.

    Later:
    - Load Chhattisgarh crime dataset
    - Find crimes near route coordinates
    - Calculate severity
    """

    radius_m = int(radius_km * 1000)

    nearby_crimes = get_nearby_crimes(
        latitude=lat,
        longitude=lon,
        radius=radius_m,
    )

    score_data = calculate_crime_score(nearby_crimes)

    return {
        "crime_score": score_data.get("crime_score", 0),
        "nearby_crime_cases": score_data.get("nearby_cases", 0),
        "high_severity_cases": score_data.get("high_severity_cases", 0),
    }