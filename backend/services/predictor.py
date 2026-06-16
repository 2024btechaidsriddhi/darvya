import pandas as pd
import numpy as np
import json
from fastapi import HTTPException

def get_risk_score(probability: float) -> int:
    return int(probability * 100)

def preprocess_features(df: pd.DataFrame, expected_features: list) -> pd.DataFrame:
    # 1. List categorical columns to one-hot encode
    cat_cols = ['F2230', 'F3886', 'F3888', 'F3889', 'F3890', 'F3891', 'F3892', 'F3893']
    
    # 2. Get columns that exist in the dataframe
    existing_cat_cols = [c for c in cat_cols if c in df.columns]
    
    # 3. get_dummies
    if existing_cat_cols:
        df_encoded = pd.get_dummies(df, columns=existing_cat_cols, dummy_na=True, dtype=int)
    else:
        df_encoded = df.copy()
        
    # 4. Align with expected features (filling missing with 0)
    X_pred = df_encoded[[c for c in expected_features if c in df_encoded.columns]].copy()
    for col in expected_features:
        if col not in X_pred.columns:
            X_pred[col] = 0
            
    # Reorder
    X_pred = X_pred[expected_features]
    return X_pred

async def _append_and_broadcast(app_state, features: dict, prob: float):
    # Ensure account_id exists
    if "account_id" not in features:
        # Generate dynamic account id if missing
        import random
        features["account_id"] = f"ACC-{random.randint(10000, 99999)}"
        
    features["probability"] = prob
    features["risk_score"] = get_risk_score(prob)
    features["prediction"] = 1 if features["risk_score"] >= 50 else 0
    
    import datetime
    if "timestamp" not in features:
        features["timestamp"] = datetime.datetime.now().isoformat()
        
    if "status" not in features:
        features["status"] = "Active" if features["prediction"] == 0 else "Investigating"
        
    if "alert_id" not in features:
        if features["prediction"] == 1:
            features["alert_id"] = f"ALT-{features['account_id'][-5:]}"
        else:
            features["alert_id"] = None
    
    # Append to global dataset
    new_row = pd.DataFrame([features])
    app_state.dataset = pd.concat([app_state.dataset, new_row], ignore_index=True)

    manager = getattr(app_state, "ws_manager", None)
    if manager:
        payload = features.copy()
        await manager.broadcast(json.dumps(payload))

async def predict_single(app_state, features: dict):
    model = app_state.model
    expected_features = app_state.feature_columns if hasattr(app_state, "feature_columns") and app_state.feature_columns else list(model.feature_names_in_)
        
    df = pd.DataFrame([features])
    X_pred = preprocess_features(df, expected_features)
    
    if hasattr(model, "predict_proba"):
        probas = model.predict_proba(X_pred)[0]
        prob = float(probas[1]) if len(probas) > 1 else float(probas[0])
    else:
        prediction = model.predict(X_pred)[0]
        prob = 0.9 if prediction == 1 else 0.1
    
    await _append_and_broadcast(app_state, features, prob)
    
    risk_score = get_risk_score(prob)
    if risk_score <= 30:
        risk_level = "LOW"
    elif risk_score <= 60:
        risk_level = "MEDIUM"
    elif risk_score <= 80:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"
        
    return {
        "prediction": 1 if risk_score >= 50 else 0,
        "probability": prob,
        "risk_score": risk_score,
        "risk_level": risk_level
    }

async def predict_batch(app_state, df: pd.DataFrame):
    model = app_state.model
    expected_features = app_state.feature_columns if hasattr(app_state, "feature_columns") and app_state.feature_columns else list(model.feature_names_in_)
    
    X_pred = preprocess_features(df, expected_features)

    if hasattr(model, "predict_proba"):
        probas = model.predict_proba(X_pred)
        probs = probas[:, 1] if probas.shape[1] > 1 else probas[:, 0]
    else:
        predictions = model.predict(X_pred)
        probs = np.where(predictions == 1, 0.9, 0.1)

    results = []
    suspicious_count = 0
    
    for i, prob in enumerate(probs):
        risk_score = get_risk_score(float(prob))
        if risk_score <= 30:
            risk_level = "LOW"
        elif risk_score <= 60:
            risk_level = "MEDIUM"
        elif risk_score <= 80:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"
            
        prediction_label = 1 if risk_score >= 50 else 0
            
        if prediction_label == 1:
            suspicious_count += 1
            
        row_dict = df.iloc[i].to_dict()
        await _append_and_broadcast(app_state, row_dict, float(prob))
        
        row_dict.update({
            "prediction": prediction_label,
            "probability": float(prob),
            "risk_score": risk_score,
            "risk_level": risk_level
        })
        results.append(row_dict)
        
    return {
        "processed_records": len(df),
        "suspicious_accounts": suspicious_count,
        "results": results
    }
