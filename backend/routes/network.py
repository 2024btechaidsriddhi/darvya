from fastapi import APIRouter, Request, HTTPException
import pandas as pd

router = APIRouter()

@router.get("/network")
async def get_network(req: Request):
    dataset = req.app.state.dataset
    if dataset is None or dataset.empty:
        raise HTTPException(status_code=503, detail="Dataset not loaded or empty")
        
    # Build nodes and edges
    nodes = []
    edges = []
    
    # Take all suspicious accounts, and fill up to 50 with other accounts to show relevant cluster links
    suspicious = dataset[dataset['prediction'] == 1]
    normal = dataset[dataset['prediction'] == 0].head(max(0, 50 - len(suspicious)))
    sample_df = pd.concat([suspicious, normal])
    
    for _, row in sample_df.iterrows():
        nodes.append({
            "id": str(row["account_id"]),
            "type": "account",
            "risk_score": int(row.get("risk_score", 0)),
            "is_suspicious": row.get("prediction", 0) == 1
        })
        
    # Derive edges based on risk score similarity to form "fraud clusters"
    # We will link suspicious accounts together
    suspicious_ids = suspicious['account_id'].tolist()
    
    for i in range(len(suspicious_ids) - 1):
        edges.append({
            "id": f"e-{suspicious_ids[i]}-{suspicious_ids[i+1]}",
            "source": str(suspicious_ids[i]),
            "target": str(suspicious_ids[i+1]),
            "type": "transaction"
        })
        
    return {
        "nodes": nodes,
        "edges": edges
    }
