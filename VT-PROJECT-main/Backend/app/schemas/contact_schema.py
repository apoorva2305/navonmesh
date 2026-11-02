from pydantic import BaseModel


class ContactCreate(BaseModel):
    full_name: str
    phone_number: str
    relationship_name: str


class ContactUpdate(BaseModel):
    full_name: str
    phone_number: str
    relationship_name: str


class ContactResponse(BaseModel):
    id: int
    full_name: str
    phone_number: str
    relationship_name: str

    class Config:
        from_attributes = True