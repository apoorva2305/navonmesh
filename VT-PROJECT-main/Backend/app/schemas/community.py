from pydantic import BaseModel


class CommunityReportCreate(BaseModel):

    user_id: int | None = None

    title: str

    description: str | None = None

    category: str

    latitude: float

    longitude: float

    risk_level: str = "Medium"



class CommunityReportResponse(BaseModel):

    id: int

    title: str

    description: str

    category: str

    latitude: float

    longitude: float

    risk_level: str

    verified_count: int


    class Config:
        from_attributes = True