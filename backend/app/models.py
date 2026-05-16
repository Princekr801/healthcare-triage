from typing import Literal

from pydantic import BaseModel, Field


class TriageRequest(BaseModel):
    user_input: str = Field(..., min_length=3, max_length=4000)
    patient_id: str | None = None
    risk_factors: list[str] = Field(default_factory=list)


class SymptomEntity(BaseModel):
    id: str
    name: str
    confidence: float


class TriageResultPayload(BaseModel):
    urgency_level: Literal[
        "Level 1 (Emergency)",
        "Level 2 (Urgent)",
        "Level 3 (Self-Care)",
    ]
    primary_assessment: str
    action_taken: str


class ClinicalData(BaseModel):
    symptoms: list[SymptomEntity]
    risk_factors: list[str]


class TriageResponse(BaseModel):
    session_id: str
    urgency_level: str
    primary_assessment: str
    action: str
    action_taken: str
    map_required: bool
    matches: list[dict] = Field(default_factory=list)
    clinical_data: ClinicalData
    handoff_id: str | None = None
    llm_summary: str | None = None
