from fastapi import APIRouter, Request, HTTPException
from typing import List, Dict, Any

router = APIRouter()

@router.get("/alerts")
async def get_alerts(req: Request) -> Any:
    dataset = req.app.state.dataset
    if dataset is None or dataset.empty:
        raise HTTPException(status_code=503, detail="Dataset not loaded or empty")
        
    required_cols = ["alert_id", "account_id", "risk_score", "status", "timestamp"]
    for col in required_cols:
        if col not in dataset.columns:
            raise HTTPException(status_code=500, detail=f"Required column '{col}' is missing from dataset")
            
    # Alerts are generated from actual predictions: prediction == 1 (risk_score >= 50)
    alerts_df = dataset[dataset['prediction'] == 1]
    
    results = []
    for _, row in alerts_df.iterrows():
        results.append({
            "alert_id": str(row["alert_id"]),
            "account_id": str(row["account_id"]),
            "risk_score": int(row["risk_score"]),
            "status": str(row["status"]),
            "timestamp": str(row["timestamp"])
        })
        
    return results[::-1]
