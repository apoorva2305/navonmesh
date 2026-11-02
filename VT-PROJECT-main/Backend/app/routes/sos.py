from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.sos_model import SOS

router = APIRouter()


# -----------------------------
# Request Model
# -----------------------------

class SOSRequest(BaseModel):
    user_id: int
    latitude: float
    longitude: float
    emergency_type: str
    message: Optional[str] = None


# -----------------------------
# Trigger SOS
# -----------------------------

@router.post("/trigger")
async def trigger_sos(
    data: SOSRequest,
    db: Session = Depends(get_db)
):

    new_sos = SOS(
        user_id=data.user_id,
        latitude=data.latitude,
        longitude=data.longitude,
        emergency_type=data.emergency_type,
        message=data.message
    )

    db.add(new_sos)
    db.commit()
    db.refresh(new_sos)

    return {
        "success": True,
        "message": "SOS triggered successfully.",
        "sos_id": new_sos.id,
        "status": new_sos.status
    }


# -----------------------------
# Cancel SOS
# -----------------------------

@router.post("/cancel")
async def cancel_sos(
    user_id: int,
    db: Session = Depends(get_db)
):

    sos = (
        db.query(SOS)
        .filter(
            SOS.user_id == user_id,
            SOS.status == "Active"
        )
        .first()
    )

    if not sos:
        raise HTTPException(
            status_code=404,
            detail="No active SOS found."
        )

    sos.status = "Cancelled"

    db.commit()

    return {
        "success": True,
        "message": "SOS cancelled successfully."
    }


# -----------------------------
# SOS Status
# -----------------------------

@router.get("/status/{user_id}")
async def sos_status(
    user_id: int,
    db: Session = Depends(get_db)
):

    sos = (
        db.query(SOS)
        .filter(SOS.user_id == user_id)
        .order_by(SOS.created_at.desc())
        .first()
    )

    if not sos:
        return {
            "success": True,
            "status": "No active SOS"
        }

    return {
        "success": True,
        "status": sos.status,
        "emergency_type": sos.emergency_type,
        "created_at": sos.created_at
    }


# -----------------------------
# SOS History
# -----------------------------

@router.get("/history/{user_id}")
async def sos_history(
    user_id: int,
    db: Session = Depends(get_db)
):

    history = (
        db.query(SOS)
        .filter(SOS.user_id == user_id)
        .order_by(SOS.created_at.desc())
        .all()
    )

    return {
        "success": True,
        "user_id": user_id,
        "history": history
    }