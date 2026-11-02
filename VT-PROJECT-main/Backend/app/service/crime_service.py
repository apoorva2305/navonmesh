from sqlalchemy.orm import Session

from app.models.community_model import CommunityReport


def get_all_reports(
    db: Session
):

    return (
        db.query(CommunityReport)
        .all()
    )