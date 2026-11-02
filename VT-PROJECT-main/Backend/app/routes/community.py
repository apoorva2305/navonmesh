from math import radians, sin, cos, sqrt, atan2

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.community_model import CommunityReport
from app.schemas.community import CommunityReportCreate


router = APIRouter()


# ---------------------------------------
# Distance Calculator (Haversine Formula)
# ---------------------------------------

def calculate_distance(lat1, lon1, lat2, lon2):

    R = 6371000  # Earth radius in meters

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c


# ---------------------------------------
# Create Community Report
# ---------------------------------------

@router.post("/report")
async def create_report(
    report: CommunityReportCreate,
    db: Session = Depends(get_db)
):

    new_report = CommunityReport(
        **report.dict()
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return {
        "success": True,
        "message": "Community report submitted",
        "report": new_report
    }


# ---------------------------------------
# Get All Reports
# ---------------------------------------

@router.get("/reports")
async def get_reports(
    db: Session = Depends(get_db)
):

    reports = (
        db.query(CommunityReport)
        .all()
    )

    return {
        "success": True,
        "reports": reports
    }


# ---------------------------------------
# Get Nearby Reports
# ---------------------------------------

@router.get("/nearby")
async def get_nearby_reports(
    lat: float,
    lon: float,
    radius: float = 2000,
    db: Session = Depends(get_db)
):

    reports = db.query(CommunityReport).all()

    nearby_reports = []

    for report in reports:

        distance = calculate_distance(
            lat,
            lon,
            report.latitude,
            report.longitude
        )

        if distance <= radius:

            nearby_reports.append({

                "id": report.id,

                "title": report.title,

                "description": report.description,

                "category": report.category,

                "risk_level": report.risk_level,

                "verified_count": report.verified_count,

                "distance": round(distance),

                "latitude": report.latitude,

                "longitude": report.longitude,

                "created_at": report.created_at
            })

    nearby_reports.sort(key=lambda x: x["distance"])

    return {
        "success": True,
        "count": len(nearby_reports),
        "reports": nearby_reports
    }


# ---------------------------------------
# Verify Community Report
# ---------------------------------------

@router.post("/verify/{report_id}")
async def verify_report(
    report_id: int,
    db: Session = Depends(get_db)
):

    report = (
        db.query(CommunityReport)
        .filter(CommunityReport.id == report_id)
        .first()
    )

    if report is None:

        return {
            "success": False,
            "message": "Report not found"
        }

    report.verified_count += 1

    db.commit()
    db.refresh(report)

    return {
        "success": True,
        "message": "Report verified successfully",
        "verified_count": report.verified_count
    }