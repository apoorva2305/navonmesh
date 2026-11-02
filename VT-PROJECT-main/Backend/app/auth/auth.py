from sqlalchemy.orm import Session

from app.models.user_model import User
from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_access_token


def register_user(db: Session, full_name: str, email: str, password: str):
    """
    Register a new user in PostgreSQL.
    """

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        return None

    # Hash password
    hashed_password = hash_password(password)

    # Create user
    new_user = User(
        full_name=full_name,
        email=email,
        password=hashed_password
    )

    # Save to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def login_user(db: Session, email: str, password: str):

    user = db.query(User).filter(User.email == email).first()

    if user is None:
        return None

    if not verify_password(password, user.password):
        return None

    token = create_access_token(
        {"email": user.email}
    )

    return token
