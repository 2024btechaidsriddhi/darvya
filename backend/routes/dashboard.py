from fastapi import APIRouter, Request, HTTPException
import pandas as pd
import numpy as np
from schemas.dashboard import DashboardMetrics

router = APIRouter()

@router.get("/dashboard", response_model=DashboardMetrics)
async def get_dashboard(req: Request):
    dataset = req.app.state.dataset
    
    if dataset is None or dataset.empty:
        raise HTTPException(status_code=503, detail="Dataset not loaded or empty")
        
    total_accounts = len(dataset)
    suspicious_accounts = int((dataset['prediction'] == 1).sum())
    high_risk_accounts = int(((dataset['risk_score'] >= 30) & (dataset['risk_score'] < 50)).sum())
    critical_accounts = int((dataset['risk_score'] >= 50).sum())
    average_risk_score = float(dataset['risk_score'].mean()) if total_accounts > 0 else 0.0
    
    # Calculate recall/detection rate using F3924 actual class
    fraud_detection_rate = 0.0
    if 'F3924' in dataset.columns:
        from sklearn.metrics import recall_score
        try:
            fraud_detection_rate = float(recall_score(dataset['F3924'], dataset['prediction'], zero_division=0))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Recall calculation failed: {str(e)}")
            
    # Calculate dynamic prevented amount
    # prevented amount is the sum of transaction value for predicted positive accounts
    fraud_prevented_amount = int(dataset[dataset['prediction'] == 1]['tx_amount'].sum())
            
    # 1. Risk Distribution
    risk_bins = [0, 20, 40, 60, 80, 100]
    risk_labels = ['0-20', '21-40', '41-60', '61-80', '81-100']
    risk_counts = pd.cut(dataset['risk_score'], bins=risk_bins, labels=risk_labels, right=True, include_lowest=True).value_counts().to_dict()
    risk_distribution = [{"range": k, "count": int(v)} for k, v in risk_counts.items()]
    
    # 2. Fraud Trend / Daily Alert Volume
    # Group by date derived from sequential timestamps
    if 'timestamp' in dataset.columns:
        dataset['date_str'] = dataset['timestamp'].apply(lambda x: x[:10])
        # Group
        daily_groups = dataset.groupby('date_str')
        trend_timeline = []
        for date, group in daily_groups:
            # prevented value: sum of tx_amount for prediction == 1
            prevented_val = int(group[group['prediction'] == 1]['tx_amount'].sum())
            # fraud value: realized fraud (F3924 == 1 and prediction == 0)
            fraud_val = int(group[(group['F3924'] == 1) & (group['prediction'] == 0)]['tx_amount'].sum())
            # volume of alerts: count of prediction == 1
            vol = int((group['prediction'] == 1).sum())
            # processed alerts: 95% of volume
            proc = int(vol * 0.95)
            
            trend_timeline.append({
                "date": date,
                "preventedValue": prevented_val,
                "fraudValue": fraud_val,
                "volume": vol,
                "processed": proc
            })
        # Sort by date
        trend_timeline.sort(key=lambda x: x['date'])
    else:
        trend_timeline = []
        
    # 3. Alert Severity (Percentages)
    critical_cnt = int((dataset['risk_score'] >= 80).sum())
    high_cnt = int(((dataset['risk_score'] >= 50) & (dataset['risk_score'] < 80)).sum())
    medium_cnt = int(((dataset['risk_score'] >= 30) & (dataset['risk_score'] < 50)).sum())
    low_cnt = total_accounts - (critical_cnt + high_cnt + medium_cnt)
    
    alert_severity = [
        {"name": "CRITICAL", "value": round((critical_cnt / total_accounts) * 100, 1) if total_accounts > 0 else 0.0},
        {"name": "HIGH", "value": round((high_cnt / total_accounts) * 100, 1) if total_accounts > 0 else 0.0},
        {"name": "MEDIUM", "value": round((medium_cnt / total_accounts) * 100, 1) if total_accounts > 0 else 0.0},
        {"name": "LOW", "value": round((low_cnt / total_accounts) * 100, 1) if total_accounts > 0 else 0.0}
    ]
    
    # 4. Top Risk Accounts
    top_accounts = dataset.sort_values(by="risk_score", ascending=False).head(5)
    top_risk_accounts = [{"id": str(r["account_id"]), "score": int(r["risk_score"])} for _, r in top_accounts.iterrows()]
            
    return {
        "total_accounts": total_accounts,
        "suspicious_accounts": suspicious_accounts,
        "high_risk_accounts": high_risk_accounts,
        "critical_accounts": critical_accounts,
        "average_risk_score": average_risk_score,
        "fraud_detection_rate": fraud_detection_rate,
        "fraud_prevented_amount": fraud_prevented_amount,
        "risk_distribution": risk_distribution,
        "fraud_trend": trend_timeline,
        "alert_severity": alert_severity,
        "top_risk_accounts": top_risk_accounts
    }
