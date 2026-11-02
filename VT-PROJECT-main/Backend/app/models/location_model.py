from sqlalchemy import Column, Integer, Float, DateTime
from datetime import datetime

from app.database.database import Base


class LocationHistory(Base):

    __tablename__ = "location_history"

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

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )