from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.auth.oauth2 import get_current_user

from app.models.user_model import User
from app.models.contact_model import Contact

from app.schemas.contact_schema import ContactCreate

router = APIRouter()


@router.post("/add")
async def add_contact(
    contact: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_contact = Contact(
        full_name=contact.full_name,
        phone_number=contact.phone_number,
        relationship_name=contact.relationship_name,
        user_id=current_user.id
    )

    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)

    return {
        "success": True,
        "message": "Emergency contact added successfully.",
        "contact": {
            "id": new_contact.id,
            "full_name": new_contact.full_name,
            "phone_number": new_contact.phone_number,
            "relationship_name": new_contact.relationship_name
        }
    }