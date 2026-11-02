from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.orm import Session

from app.auth.auth import (
     register_user as auth_register_user,
     login_user as auth_login_user,
)
from app.auth.oauth2 import get_current_user
from app.database.database import get_db
from app.models.user_model import User
from app.schemas.user_schema import UserRegister

router = APIRouter()

# -----------------------------------
# Temporary User Storage
# (Will be replaced by PostgreSQL)
# -----------------------------------



@router.post("/register")
async def register_user(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    new_user = auth_register_user(
        db=db,
        full_name=user.full_name,
        email=user.email,
        password=user.password
    )

    if new_user is None:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    return {
        "success": True,
        "message": "User registered successfully.",
        "user": {
            "id": new_user.id,
            "full_name": new_user.full_name,
            "email": new_user.email
        }
    }


@router.post("/login")
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    token = auth_login_user(
        db=db,
        email=form_data.username,
        password=form_data.password
    )

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

# -----------------------------
# Get Profile
# -----------------------------



@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user)
):

    return {
        "success": True,
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email
        }
    }

# -----------------------------
# Update Profile
# -----------------------------

@router.put("/profile/{user_id}")
async def update_profile(user_id: int):

    return {
        "success": True,
        "message": "Profile updated.",
        "user_id": user_id
    }


# -----------------------------
# Delete User
# -----------------------------

@router.delete("/{user_id}")
async def delete_user(user_id: int):

    return {
        "success": True,
        "message": "User deleted.",
        "user_id": user_id
    }