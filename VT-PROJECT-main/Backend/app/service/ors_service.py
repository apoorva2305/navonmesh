import requests
from app.config import settings


BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-car"


def get_route(start_lon, start_lat, end_lon, end_lat):

    headers = {
        "Authorization": settings.ORS_API_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "coordinates": [
            [start_lon, start_lat],
            [end_lon, end_lat]
        ]
    }

    try:

        response = requests.post(
            BASE_URL,
            json=body,
            headers=headers,
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        route = data["routes"][0]

        return {
            "distance_meters": route["summary"]["distance"],
            "duration_seconds": route["summary"]["duration"],
            "geometry": route["geometry"],
            "steps": route["segments"][0]["steps"]
        }

    except requests.exceptions.RequestException as e:

        raise Exception(
            f"Route service unavailable: {str(e)}"
        )

    except (KeyError, IndexError):

        raise Exception(
            "Invalid route response received from OpenRouteService"
        )