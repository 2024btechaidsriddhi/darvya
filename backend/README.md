# Dravya AI - Backend

This is the production-ready FastAPI backend for the Dravya AI Mule Account Detection System.

## Features

- **Zero Mock Data**: Strictly configured to crash on missing data or models. Operates entirely from `DataSet.csv`.
- **Predict API**: AI-driven mule detection from features.
- **Explainability**: Model feature importance mapping for account risk scores.
- **Websockets**: Broadcasts live predictions as they happen natively.
- **Dashboard & Alerts**: Endpoints strictly querying the dataset.

## Tech Stack

- Python 3.9+
- FastAPI
- Uvicorn
- Scikit-Learn
- Pandas
- Joblib

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

Ensure `data/DataSet.csv` and `model/mule_detection_model.pkl` are present. 
Use uvicorn to start the server:

```bash
uvicorn app:app --reload --port 8000
```

The API docs will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).
