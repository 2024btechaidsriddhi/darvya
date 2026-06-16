from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Any, List
from services.explainer import get_shap_explanation

router = APIRouter()

@router.get("/accounts")
async def get_accounts(req: Request) -> Any:
    dataset = req.app.state.dataset
    if dataset is None or dataset.empty:
        raise HTTPException(status_code=503, detail="Dataset not loaded or empty")
        
    required_cols = ["account_id", "status"]
    for col in required_cols:
        if col not in dataset.columns:
            raise HTTPException(status_code=500, detail=f"Required column '{col}' is missing from dataset")
            
    results = []
    for _, row in dataset.iterrows():
        results.append({
            "account_id": str(row["account_id"]),
            "risk_score": int(row.get('risk_score', 0)),
            "status": str(row["status"]),
            "prediction": "Suspicious" if row.get('prediction') == 1 else "Normal"
        })
        
    return results[::-1]

@router.get("/top-risk-accounts")
async def get_top_risk_accounts(req: Request) -> Any:
    dataset = req.app.state.dataset
    if dataset is None or dataset.empty:
        raise HTTPException(status_code=503, detail="Dataset not loaded or empty")
        
    top_accounts = dataset.sort_values(by="risk_score", ascending=False).head(10)
    
    results = []
    for _, row in top_accounts.iterrows():
        results.append({
            "account_id": str(row["account_id"]),
            "risk_score": int(row.get('risk_score', 0)),
            "status": str(row.get("status", "Active")),
            "prediction": "Suspicious" if row.get('prediction') == 1 else "Normal"
        })
    return results

@router.get("/account/{account_id}")
async def get_account(account_id: str, req: Request) -> Any:
    dataset = req.app.state.dataset
    if dataset is None or dataset.empty:
        raise HTTPException(status_code=503, detail="Dataset not loaded or empty")
        
    account_row = dataset[dataset['account_id'] == account_id]
    if account_row.empty:
        raise HTTPException(status_code=404, detail=f"Account '{account_id}' not found")
        
    row = account_row.iloc[0]
    return {
        "account_id": str(row["account_id"]),
        "risk_score": int(row.get('risk_score', 0)),
        "status": str(row.get("status", "Active")),
        "prediction": "Suspicious" if row.get('prediction') == 1 else "Normal",
        "timestamp": str(row.get("timestamp", ""))
    }

@router.get("/explain/{account_id}")
async def explain_account(account_id: str, req: Request):
    model = req.app.state.model
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded")
        
    explanation = get_shap_explanation(model)
    
    # Get the prediction for this account
    dataset = req.app.state.dataset
    prediction = "Normal"
    probability = 0.0
    if dataset is not None and not dataset.empty:
        account_row = dataset[dataset['account_id'] == account_id]
        if not account_row.empty:
            prediction = "Suspicious" if account_row.iloc[0].get('prediction') == 1 else "Normal"
            probability = float(account_row.iloc[0].get('probability', 0.0))
            
    explanation["prediction"] = prediction
    explanation["probability"] = probability
    return explanation
