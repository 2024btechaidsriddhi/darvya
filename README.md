# Dravya AI - Mule Account Detection System

Dravya is a production-ready, AI-powered platform for real-time detection and analysis of Mule Accounts. It features a strict zero-mock-data policy, operating entirely on a localized dataset and machine learning model predictions.

## Architecture

- **Frontend**: React (Vite), TypeScript, TailwindCSS
- **Backend**: FastAPI, Python 3.9+, Scikit-Learn, Pandas

## Prerequisites

- Node.js (for frontend)
- Python 3.9+ (for backend)

## Setup & Execution

### 1. Backend API

The backend serves predictions and telemetry strictly from your provided `DataSet.csv`. 

1. Ensure your model `mule_detection_model.pkl` is located in `backend/model/`.
2. Ensure your dataset `DataSet.csv` is located in `backend/data/`. **The backend will crash if this file is missing.**
3. Navigate to the backend directory:
   ```bash
   cd backend
   ```
4. Create and activate a virtual environment, then install requirements:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
5. Start the backend:
   ```bash
   uvicorn app:app --reload --port 8000
   ```

### 2. Frontend UI

The frontend provides real-time monitoring, alerts management, and risk explanation visualizations.

1. In a new terminal, navigate to the frontend directory (if separated) or root:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the provided `localhost` link in your browser (typically `http://localhost:3000`).

## Key Features

- **Strict Data Integrity**: All metrics, network links, and alerts are derived strictly from your CSV. 
- **Model Explainability**: Live integration with model `feature_importances_` and `predict_proba`.
- **Live Transactions**: Connects securely via Websockets to receive newly predicted transactions.
