from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime

from app.database.database import Base


class SOS(Base):

    __tablename__ = "sos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    latitude = Column(
        Float,
        nullable=False
    )

    longitude = Column(
        Float,
        nullable=False
    )

    emergency_type = Column(
        String,
        nullable=False
    )

    message = Column(
        String,
        nullable=True
    )

    status = Column(
        String,
        default="Active"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )