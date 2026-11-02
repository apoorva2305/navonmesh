import requests

API_KEY = "cfb5cac65be62d29673931df27b6621a"


def get_live_weather(lat: float, lon: float) -> str:
    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    )

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data = response.json()

        return data["weather"][0]["main"]

    except Exception:
        return "Unavailable"