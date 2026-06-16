from fastapi import HTTPException

def get_shap_explanation(model):
    # Rule 8: Feature importance must come directly from: model.feature_importances_
    if not hasattr(model, "feature_importances_"):
        raise HTTPException(status_code=500, detail="Model does not support feature importances")
        
    try:
        importances = model.feature_importances_
        
        # Get feature names if available, else index them
        if hasattr(model, "feature_names_in_"):
            feature_names = model.feature_names_in_
        else:
            feature_names = [f"Feature_{i}" for i in range(len(importances))]
            
        impacts = []
        for i, name in enumerate(feature_names):
            impacts.append({
                "feature": str(name),
                "impact": float(importances[i])
            })
            
        # Sort by absolute impact
        impacts.sort(key=lambda x: abs(x["impact"]), reverse=True)
        
        return {
            "top_features": impacts[:5] # Return top 5 most important features
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate SHAP explanation: {str(e)}")
