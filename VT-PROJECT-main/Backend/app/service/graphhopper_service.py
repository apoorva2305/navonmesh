import requests
import urllib3
import polyline
urllib3.disable_warnings(
    urllib3.exceptions.InsecureRequestWarning
)
from app.config import settings


BASE_URL = "https://graphhopper.com/api/1/route"


def get_alternative_routes(
    start_lon: float,
    start_lat: float,
    end_lon: float,
    end_lat: float
):

    params = {
        "key": settings.GRAPHHOPPER_API_KEY,
        "profile": "car",

        # Return encoded polyline
        "points_encoded": True,

        # Return turn-by-turn instructions
        "instructions": True,

        # Request alternative routes
        "algorithm": "alternative_route",
        "alternative_route.max_paths": 3,
        "alternative_route.max_weight_factor": 1.4,
        "alternative_route.max_share_factor": 0.6
    }

    # Two points (start & end)
    params["point"] = [
        f"{start_lat},{start_lon}",
        f"{end_lat},{end_lon}"
    ]

    try:
        print("GRAPH HOPPER REQUEST STARTED")
        response = requests.get(
            BASE_URL,
            params=params,
            timeout=15,
            verify=False
)

        
        print("GRAPH HOPPER STATUS:", response.status_code)
        print("GRAPH HOPPER RESPONSE:", response.text[:500])

        response.raise_for_status()

        data = response.json()

        routes = []

        for index, path in enumerate(data["paths"], start=1):

            steps = []

            if "instructions" in path:
                for step in path["instructions"]:

                    steps.append({
                        "distance": step.get("distance", 0),
                        "duration": step.get("time", 0) / 1000,
                        "type": step.get("sign", 0),
                        "instruction": step.get("text", ""),
                        "name": step.get("street_name", ""),
                        "way_points": step.get("interval", [])
                    })

            decoded_points = polyline.decode(path["points"])


            routes.append({

               "route_id": index,

                "distance_meters": path["distance"],

                "duration_seconds": path["time"] / 1000,

                "geometry": path["points"],

                "route_points": decoded_points,

                 "steps": steps

})

        return routes

    except requests.exceptions.RequestException as e:

        raise Exception(
            f"GraphHopper service unavailable: {str(e)}"
        )

    except (KeyError, IndexError) as e:

        raise Exception(
            f"Invalid GraphHopper response: {str(e)}"
        )