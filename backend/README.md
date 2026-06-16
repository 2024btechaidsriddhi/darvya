# Mule Account Detection System - Backend

This is the production-ready FastAPI backend for the AI-powered Mule Account Detection System.

## Features

- **Predict & Batch Predict**: AI-driven mule detection from features or CSV uploads.
- **Explainability**: SHAP value generation for account risk scores.
- **Websockets**: Simulated live transactions.
- **Dashboard & Alerts**: Endpoints to drive the frontend visualizations.

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

Use uvicorn to start the server:

```bash
uvicorn app:app --reload
```

The API docs will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).
