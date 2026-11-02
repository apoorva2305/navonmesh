from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def home():
    return {
        "message": "Welcome to AI Women Safety Backend",
        "status": "Backend is Running Successfully"
    }

@router.get("/health")
def health():
    return {
        "status": "Healthy",
        "server": "Running"
    }