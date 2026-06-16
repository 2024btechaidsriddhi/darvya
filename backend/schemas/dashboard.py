from typing import List, Dict, Any
from pydantic import BaseModel

class DashboardMetrics(BaseModel):
    total_accounts: int
    suspicious_accounts: int
    high_risk_accounts: int
    critical_accounts: int
    average_risk_score: float
    fraud_detection_rate: float
    fraud_prevented_amount: int
    risk_distribution: List[Dict[str, Any]]
    fraud_trend: List[Dict[str, Any]]
    alert_severity: List[Dict[str, Any]]
    top_risk_accounts: List[Dict[str, Any]]
