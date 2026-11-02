from dotenv import load_dotenv
from pathlib import Path
import os

# Load .env from the project root (BACKEND/.env)
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(env_path)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
DATABASE_URL = os.getenv("DATABASE_URL")
ORS_API_KEY = os.getenv("ORS_API_KEY")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
GRAPHHOPPER_API_KEY = os.getenv("GRAPHHOPPER_API_KEY")