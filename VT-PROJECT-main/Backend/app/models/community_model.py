from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from app.database.database import Base


class CommunityReport(Base):

    __tablename__ = "community_reports"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    user_id = Column(
        Integer,
        nullable=True
    )


    title = Column(
        String,
        nullable=False
    )


    description = Column(
        String,
        nullable=True
    )


    category = Column(
        String,
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


    risk_level = Column(
        String,
        default="Medium"
    )


    verified_count = Column(
        Integer,
        default=0
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )