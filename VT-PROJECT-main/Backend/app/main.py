from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Config
from app.config import settings
from app.config.settings import DATABASE_URL


# Database
from app.database.database import Base, engine


# Import Models (register tables)
from app.models.user_model import User
from app.models.contact_model import Contact
from app.models.location_model import LocationHistory
from app.models.sos_model import SOS
from app.models.community_model import CommunityReport


# Import Routers
from app.routes.home import router as home_router
from app.routes.user import router as user_router
from app.routes.sos import router as sos_router
from app.routes.location import router as location_router
from app.routes.contact import router as contact_router
from app.routes.community import router as community_router
from app.routes.crime import router as crime_router

# Exception Handler
from app.utils.exceptions import global_exception_handler



print("ORS API Key:", settings.ORS_API_KEY)

print("Home Router :", home_router)
print("User Router :", user_router)
print("SOS Router :", sos_router)
print("Location Router :", location_router)
print("Contact Router :", contact_router)
print("Community Router :", community_router)



app = FastAPI(
    title="AI Women Safety Backend",
    description="Backend for AI Women Safety Application",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Create Database Tables
Base.metadata.create_all(bind=engine)



# Global Exception Handler
app.add_exception_handler(
    Exception,
    global_exception_handler
)



# -----------------------------
# Register Routers
# -----------------------------

app.include_router(
    home_router
)


app.include_router(
    user_router,
    prefix="/user",
    tags=["User"]
)


app.include_router(
    sos_router,
    prefix="/sos",
    tags=["SOS"]
)


app.include_router(
    location_router,
    prefix="/location",
    tags=["Location"]
)


app.include_router(
    contact_router,
    prefix="/contact",
    tags=["Contact"]
)


app.include_router(
    community_router,
    prefix="/community",
    tags=["Community"]
)

app.include_router(
    crime_router,
    prefix="/crime",
    tags=["AI Crime Intelligence"]
)

print(
    "Weather API Loaded:",
    settings.WEATHER_API_KEY is not None
)


print(
    "Database URL:",
    DATABASE_URL
)


print("All Routers Registered")