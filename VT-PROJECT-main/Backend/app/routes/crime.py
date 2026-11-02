from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.ai.crime_intelligence import analyze_area
from app.schemas.crime import CrimeRequest, CrimeResponse


router = APIRouter()


@router.post(
    "/intelligence",
    response_model=CrimeResponse
)
async def crime_intelligence(
    request: CrimeRequest,
    db: Session = Depends(get_db)
):

    result = analyze_area(
        latitude=request.latitude,
        longitude=request.longitude,
        db=db
    )

    return result