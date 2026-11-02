import requests
from math import radians, sin, cos, sqrt, atan2

from app.config.settings import GEOAPIFY_API_KEY


def calculate_distance(lat1, lon1, lat2, lon2):

    R = 6371000  # Earth radius in meters

    lat1 = radians(lat1)
    lat2 = radians(lat2)

    delta_lat = radians(lat2 - lat1)
    delta_lon = radians(lon2 - lon1)

    a = (
        sin(delta_lat / 2) ** 2
        +
        cos(lat1)
        * cos(lat2)
        * sin(delta_lon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return round(R * c, 2)



def get_nearby_places(
    lat: float,
    lon: float,
    place_type: str,
    radius: int = 2000
):

    if place_type == "police":
        categories = "service.police"

    elif place_type == "hospital":
        categories = "healthcare.hospital"

    else:
        return []


    url = (
        "https://api.geoapify.com/v2/places"
        f"?categories={categories}"
        f"&filter=circle:{lon},{lat},{radius}"
        "&limit=5"
        f"&apiKey={GEOAPIFY_API_KEY}"
    )


    response = requests.get(url, timeout=10)

    response.raise_for_status()

    data = response.json()


    places = []


    for feature in data.get("features", []):

        properties = feature.get("properties", {})

        place_lat = properties.get("lat")
        place_lon = properties.get("lon")


        places.append({

            "name": properties.get(
                "name",
                "Unknown"
            ),

            "address": properties.get(
                "formatted",
                ""
            ),

            "distance": calculate_distance(
                lat,
                lon,
                place_lat,
                place_lon
            ),

            "latitude": place_lat,

            "longitude": place_lon
        })


    return places