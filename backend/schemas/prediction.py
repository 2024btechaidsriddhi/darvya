from pydantic import BaseModel, Field
from typing import Dict, Any, List

class PredictionRequest(BaseModel):
    features: Dict[str, float] = Field(..., description="Dictionary of feature names and their values")

class PredictionResponse(BaseModel):
    prediction: int
    probability: float
    risk_score: int
    risk_level: str

class BatchPredictionResponse(BaseModel):
    processed_records: int
    suspicious_accounts: int
    results: List[Dict[str, Any]]
