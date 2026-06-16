from fastapi import APIRouter, UploadFile, File, Request, HTTPException
import pandas as pd
from io import StringIO
from schemas.prediction import PredictionRequest, PredictionResponse, BatchPredictionResponse
from services.predictor import predict_single, predict_batch

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
async def predict_endpoint(request: PredictionRequest, req: Request):
    app_state = req.app.state
    if not hasattr(app_state, "model") or app_state.model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded")
    
    try:
        result = await predict_single(app_state, request.features)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/predict-batch", response_model=BatchPredictionResponse)
async def predict_batch_endpoint(req: Request, file: UploadFile = File(...)):
    app_state = req.app.state
    if not hasattr(app_state, "model") or app_state.model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded")
        
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
    try:
        contents = await file.read()
        df = pd.read_csv(StringIO(contents.decode('utf-8')))
        result = await predict_batch(app_state, df)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
