from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import joblib
import logging
import os
import pandas as pd
from routes import predict, dashboard, alerts, accounts, websockets, model_metrics, network

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list = []

    async def connect(self, websocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

import asyncio

async def stream_live_transactions(app: FastAPI):
    # This background task will loop through the dataset sequentially
    # and push records via the websocket to simulate live streaming.
    if app.state.dataset is None or app.state.dataset.empty:
        return
        
    dataset = app.state.dataset
    total_records = len(dataset)
    current_idx = 0
    
    while True:
        try:
            if current_idx >= total_records:
                current_idx = 0 # Loop back to beginning as per plan assumption
                
            row = dataset.iloc[current_idx].to_dict()
            
            # Send via websocket manager
            if hasattr(app.state, "ws_manager") and app.state.ws_manager:
                import json
                await app.state.ws_manager.broadcast(json.dumps(row))
                
            current_idx += 1
            await asyncio.sleep(2) # Stream 1 record every 2 seconds
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            await asyncio.sleep(5)

@asynccontextmanager
async def lifespan(app: FastAPI):
    model_path = "../dravya_model.pkl" 
    dataset_path = "data/DataSet.csv"
    features_path = "model/feature_columns.pkl"
    
    # Initialize empty state
    app.state.model = None
    app.state.feature_columns = []
    app.state.dataset = pd.DataFrame()
    app.state.ws_manager = manager
    
    try:
        if os.path.exists(model_path):
            logger.info("Loading model...")
            app.state.model = joblib.load(model_path)
        else:
            logger.warning(f"Model file missing at {model_path}")
            
        if os.path.exists(features_path):
            logger.info("Loading feature columns...")
            app.state.feature_columns = joblib.load(features_path)
        else:
            logger.warning(f"Feature columns file missing at {features_path}")
            
        if os.path.exists(dataset_path):
            logger.info("Loading dataset...")
            app.state.dataset = pd.read_csv(dataset_path)
            
            # Validate schema compatibility
            if app.state.feature_columns:
                logger.info("Validating schema compatibility...")
                dataset_columns = set(app.state.dataset.columns)
                expected_features = set(app.state.feature_columns)
                missing_features = expected_features - dataset_columns
                if missing_features:
                    logger.warning(f"Schema validation warning. Dataset missing required features: {missing_features}")
            
            # Pre-compute predictions for the dataset to establish real baseline metrics
            if app.state.model and app.state.feature_columns:
                logger.info("Pre-computing baseline predictions on dataset...")
                from services.predictor import preprocess_features
                X_pred = preprocess_features(app.state.dataset, app.state.feature_columns)
                
                if hasattr(app.state.model, "predict_proba"):
                    probas = app.state.model.predict_proba(X_pred)
                    app.state.dataset['probability'] = probas[:, 1] if probas.shape[1] > 1 else probas[:, 0]
                else:
                    predictions = app.state.model.predict(X_pred)
                    app.state.dataset['probability'] = [0.9 if p == 1 else 0.1 for p in predictions]

                app.state.dataset['risk_score'] = (app.state.dataset['probability'] * 100).astype(int)
                app.state.dataset['prediction'] = app.state.dataset['risk_score'].apply(
                    lambda x: 1 if x >= 50 else 0
                )
                
                # Determine alert thresholds and statuses dynamically
                import datetime
                # Distribute timestamps sequentially over the last 7 days
                base_time = datetime.datetime.now() - datetime.timedelta(days=7)
                num_records = len(app.state.dataset)
                timestamps = [
                    (base_time + datetime.timedelta(seconds=i * (7 * 24 * 3600 / num_records))).isoformat()
                    for i in range(num_records)
                ]
                app.state.dataset['timestamp'] = timestamps
                app.state.dataset['status'] = app.state.dataset['prediction'].apply(
                    lambda p: 'Investigating' if p == 1 else 'Active'
                )
                
                # Add tx_amount deterministically
                app.state.dataset['tx_amount'] = app.state.dataset['risk_score'].apply(
                    lambda x: int((x * 73 + 1245) % 10000)
                )
                
                # We must ensure 'account_id' and 'alert_id' exist for the frontend to work
                if 'account_id' not in app.state.dataset.columns:
                    app.state.dataset['account_id'] = [f'ACC-{i:05d}' for i in range(len(app.state.dataset))]
                    
                if 'alert_id' not in app.state.dataset.columns:
                    app.state.dataset['alert_id'] = [f'ALT-{i:05d}' if r >= 50 else None for i, r in enumerate(app.state.dataset['risk_score'])]
        else:
            logger.warning(f"Dataset file missing at {dataset_path}")
            
    except Exception as e:
        logger.error(f"Error during startup data initialization: {e}")
    
    app.state.ws_manager = manager
    
    # Start live streaming task
    streaming_task = asyncio.create_task(stream_live_transactions(app))
    
    logger.info("Application startup complete. Dravya AI is ready.")
    
    yield
    
    # Shutdown
    streaming_task.cancel()
    logger.info("Shutting down application...")

app = FastAPI(
    title="Mule Account Detection API",
    description="Backend for AI-powered Mule Account Detection System",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, tags=["Prediction"])
app.include_router(dashboard.router, tags=["Dashboard"])
app.include_router(alerts.router, tags=["Alerts"])
app.include_router(accounts.router, tags=["Accounts"])
app.include_router(websockets.router, tags=["Websockets"])
app.include_router(model_metrics.router, tags=["Model Metrics"])
app.include_router(network.router, tags=["Network Analysis"])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Mule Account Detection API is running"}

@app.get("/debug/dashboard")
def debug_dashboard(request: Request):
    dataset = request.app.state.dataset
    model = request.app.state.model
    
    dataset_rows = 0
    dataset_columns = 0
    prediction_count = 0
    positive_predictions = 0
    alerts_generated = 0
    risk_distribution_size = 0
    chart_data_sizes = {
        "risk_distribution": 0,
        "fraud_trend": 0,
        "alert_severity": 0
    }
    
    if dataset is not None and not dataset.empty:
        dataset_rows = len(dataset)
        dataset_columns = len(dataset.columns)
        if 'prediction' in dataset.columns:
            prediction_count = int(dataset['prediction'].count())
            positive_predictions = int((dataset['prediction'] == 1).sum())
        if 'alert_id' in dataset.columns:
            alerts_generated = int(dataset['alert_id'].notnull().sum())
        if 'risk_score' in dataset.columns:
            risk_distribution_size = int(len(dataset['risk_score'].unique()))
            chart_data_sizes["risk_distribution"] = risk_distribution_size
            chart_data_sizes["alert_severity"] = 4
            
    return {
        "dataset_rows": dataset_rows,
        "dataset_columns": dataset_columns,
        "model_loaded": model is not None,
        "prediction_count": prediction_count,
        "positive_predictions": positive_predictions,
        "alerts_generated": alerts_generated,
        "risk_distribution": risk_distribution_size,
        "chart_data_sizes": chart_data_sizes
    }
