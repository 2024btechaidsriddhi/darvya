from pydantic import BaseModel

class AlertResponse(BaseModel):
    alert_id: str
    account_id: str
    risk_score: int
    status: str
    timestamp: str
