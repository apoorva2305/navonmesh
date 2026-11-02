from pydantic import BaseModel
from typing import List


class CrimeRequest(BaseModel):

    latitude: float
    longitude: float


class CommunitySummary(BaseModel):

    total_reports: int
    verified_reports: int
    


class CrimeResponse(BaseModel):

    women_safety_index: int

    community_risk: str

    recommendation: str

    community: CommunitySummary

    safe_time: str

    unsafe_time: str

    common_crimes: List[str]