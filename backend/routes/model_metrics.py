from fastapi import APIRouter, Request, HTTPException
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

router = APIRouter()

@router.get("/model-metrics")
async def get_model_metrics(req: Request):
    dataset = req.app.state.dataset
    if dataset is None or dataset.empty:
        raise HTTPException(status_code=503, detail="Dataset not loaded or empty")
        
    # Rule 9: Model metrics must be computed from: F3924 target column
    if 'F3924' not in dataset.columns:
        raise HTTPException(status_code=400, detail="Target column 'F3924' is missing from dataset")
        
    y_true = dataset['F3924']
    y_pred = dataset['prediction']
    y_prob = dataset.get('probability')
    
    try:
        accuracy = accuracy_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred, zero_division=0)
        recall = recall_score(y_true, y_pred, zero_division=0)
        f1 = f1_score(y_true, y_pred, zero_division=0)
        
        roc_auc = 0.0
        if y_prob is not None:
            # We can calculate ROC-AUC if probabilities exist
            roc_auc = roc_auc_score(y_true, y_prob)
            
        from sklearn.metrics import confusion_matrix
        cm = confusion_matrix(y_true, y_pred)
        tn, fp, fn, tp = int(cm[0][0]), int(cm[0][1]), int(cm[1][0]), int(cm[1][1]) if cm.size == 4 else (0,0,0,0)
        
        # Format metrics sequentially over dates
        historical_metrics = [{
            "date": "Today",
            "accuracy": float(accuracy),
            "precision": float(precision),
            "F1": float(f1)
        }]
        
        prediction_volume = [{
            "date": "Today",
            "predictions": int(len(dataset)),
            "anomalies": int((dataset['prediction'] == 1).sum())
        }]
        
        return {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "roc_auc": float(roc_auc),
            "confusionMatrix": {
                "trueNegative": tn,
                "falsePositive": fp,
                "falseNegative": fn,
                "truePositive": tp
            },
            "historicalMetrics": historical_metrics,
            "predictionVolume": prediction_volume
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate model metrics: {str(e)}")

@router.get("/feature-importance")
async def get_feature_importance(req: Request):
    model = req.app.state.model
    if not hasattr(model, "feature_importances_"):
        raise HTTPException(status_code=500, detail="Model does not support feature importances")
        
    importances = model.feature_importances_
    features = req.app.state.feature_columns if hasattr(req.app.state, "feature_columns") else [f"Feature {i}" for i in range(len(importances))]
    
    # Pair and sort
    paired = sorted(zip(features, importances), key=lambda x: x[1], reverse=True)
    
    return [
        {"feature": name, "importance": float(imp)} for name, imp in paired[:20]
    ]
