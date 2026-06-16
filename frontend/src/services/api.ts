import { 
  Account, 
  Alert, 
  Transaction, 
  DashboardStats, 
  ModelMetricsSnapshot, 
  NetworkNode, 
  NetworkEdge, 
  AccountPrediction,
  RiskCategory,
  AlertStatus,
  AlertType,
  ExplainabilityFactor
} from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

type TransactionSubscriber = (txn: Transaction, alert: Alert | null) => void;
let transactionSubscribers: TransactionSubscriber[] = [];
let ws: WebSocket | null = null;

const connectWebSocket = () => {
  if (ws) return;
  ws = new WebSocket('ws://127.0.0.1:8000/ws/live-transactions');
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // Construct an alert or transaction based on live push from backend
      if (data.status === 'HIGH_RISK') {
        const newAlert: Alert = {
          id: `ALT-${Date.now()}`,
          accountId: data.account_id,
          accountName: data.account_id,
          riskScore: data.risk_score,
          alertType: 'Mule Pattern',
          timestamp: new Date().toISOString(),
          status: 'New',
          assignee: null,
          description: `Live risk score triggered at ${data.risk_score}`
        };
        transactionSubscribers.forEach(sub => sub({} as any, newAlert));
      }
    } catch (e) {
      console.error("WS parse error", e);
    }
  };

  ws.onclose = () => {
    ws = null;
    setTimeout(connectWebSocket, 5000);
  };
};

// Initialize WebSocket
connectWebSocket();

export const apiService = {
  subscribeTransactions: (callback: TransactionSubscriber) => {
    transactionSubscribers.push(callback);
    return () => {
      transactionSubscribers = transactionSubscribers.filter(cb => cb !== callback);
    };
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await fetch(`${API_BASE_URL}/dashboard`);
    if (!res.ok) throw new Error("Data not available");
    const data = await res.json();
    return {
      totalAccountsAnalyzed: data.total_accounts || 0,
      suspiciousAccounts: data.suspicious_accounts || 0,
      highRiskAccounts: data.high_risk_accounts || 0,
      criticalAlertsCount: data.critical_accounts || 0,
      fraudPreventedAmount: data.fraud_prevented_amount || 0,
      detectionAccuracy: data.fraud_detection_rate * 100 || 0,
      averageRiskScore: data.average_risk_score || 0,
      weeklyAlertsCount: data.fraud_trend || [],
      riskDistribution: data.risk_distribution || [],
      fraudTypeDistribution: data.alert_severity || [],
      trendTimeline: data.fraud_trend || []
    };
  },

  getAlerts: async (): Promise<Alert[]> => {
    const res = await fetch(`${API_BASE_URL}/alerts`);
    if (!res.ok) throw new Error("Data not available");
    const data = await res.json();
    if (data.error) return [];
    return data.map((d: any) => ({
      id: d.alert_id,
      accountId: d.account_id,
      accountName: d.account_id,
      riskScore: d.risk_score,
      alertType: 'High-Risk Transfer',
      timestamp: d.timestamp,
      status: d.status,
      assignee: null,
      description: 'Alert generated from prediction'
    }));
  },

  updateAlertStatus: async (alertId: string, status: AlertStatus, assignee: string | null): Promise<Alert> => {
    // Currently no backend for this, return error
    throw new Error("Data not available");
  },

  getAccounts: async (): Promise<Account[]> => {
    const res = await fetch(`${API_BASE_URL}/accounts`);
    if (!res.ok) throw new Error("Data not available");
    const data = await res.json();
    if (data.error) return [];
    return data.map((d: any) => ({
      id: d.account_id,
      customerId: d.account_id,
      holderName: d.account_id,
      phoneNumber: '',
      email: '',
      balance: 0,
      currency: 'USD',
      riskScore: d.risk_score,
      riskCategory: ['Frozen', 'FROZEN'].includes(d.status) ? 'Critical' : (d.status === 'Investigating' ? 'High' : (d.risk_score > 10000 ? 'Medium' : 'Low')),
      createdAt: '',
      connectionsCount: 0,
      notes: []
    }));
  },

  getAccountById: async (id: string): Promise<Account | null> => {
    const accounts = await apiService.getAccounts();
    return accounts.find(a => a.id === id) || null;
  },

  searchAccounts: async (query: string): Promise<Account[]> => {
    const accounts = await apiService.getAccounts();
    const q = query.toLowerCase();
    return accounts.filter(a => 
      a.id.toLowerCase().includes(q) || 
      a.holderName.toLowerCase().includes(q) ||
      a.riskCategory.toLowerCase().includes(q) ||
      (q === 'suspicious' && ['Critical', 'High'].includes(a.riskCategory))
    );
  },

  addAccountNote: async (accountId: string, note: string): Promise<Account> => {
    throw new Error("Data not available");
  },

  getTransactions: async (): Promise<Transaction[]> => {
    throw new Error("Data not available");
  },

  getTransactionsByAccount: async (accountId: string): Promise<Transaction[]> => {
    throw new Error("Data not available");
  },

  simulateRiskPrediction: async (inputs: any): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: inputs })
    });
    if (!res.ok) throw new Error("Data not available");
    const data = await res.json();
    return {
      riskScore: data.risk_score,
      riskCategory: data.risk_level === 'CRITICAL' ? 'Critical' : (data.risk_level === 'HIGH' ? 'High' : (data.risk_level === 'MEDIUM' ? 'Medium' : 'Low')),
      recommendedAction: data.risk_level === 'CRITICAL' ? 'Freeze Account' : (data.risk_level === 'HIGH' ? 'Review' : (data.risk_level === 'MEDIUM' ? 'Monitor' : 'Allow')),
      factors: []
    };
  },

  getNetworkData: async (): Promise<{ nodes: NetworkNode[]; edges: NetworkEdge[] }> => {
    const res = await fetch(`${API_BASE_URL}/network`);
    if (!res.ok) throw new Error("Data not available");
    const data = await res.json();
    if (data.error) return { nodes: [], edges: [] };
    return data;
  },

  getModelMetrics: async (): Promise<ModelMetricsSnapshot> => {
    const res = await fetch(`${API_BASE_URL}/model-metrics`);
    if (!res.ok) throw new Error("Data not available");
    const data = await res.json();
    if (data.error) {
      return {
        version: "Production", accuracy: 0, precision: 0, recall: 0, f1Score: 0, rocAuc: 0,
        historicalMetrics: [], predictionVolume: [], confusionMatrix: {trueNegative: 0, falsePositive: 0, falseNegative: 0, truePositive: 0}
      };
    }
    return {
      version: "Production",
      accuracy: data.accuracy || 0,
      precision: data.precision || 0,
      recall: data.recall || 0,
      f1Score: data.f1_score || 0,
      rocAuc: data.roc_auc || 0,
      historicalMetrics: data.historicalMetrics || [],
      predictionVolume: data.predictionVolume || [],
      confusionMatrix: data.confusionMatrix || {
        trueNegative: 0,
        falsePositive: 0,
        falseNegative: 0,
        truePositive: 0
      }
    };
  },

  getAccountExplainability: async (accountId: string): Promise<AccountPrediction> => {
    const res = await fetch(`${API_BASE_URL}/explain/${accountId}`);
    if (!res.ok) throw new Error("Data not available");
    const data = await res.json();
    if (data.error) throw new Error("Data not available");
    
    return {
      accountId,
      status: data.prediction === 'Suspicious' ? 'Suspicious' : 'Legitimate',
      modelConfidence: data.probability ? Math.round(data.probability * 100) : 100,
      topFactors: data.top_features.map((f: any) => ({
        featureName: f.feature,
        contribution: Math.abs(f.impact * 100),
        impactDirection: f.impact > 0 ? "Increase" : "Decrease",
        description: "Computed from model feature importance"
      })),
      riskExplanation: "Real explainability derived from model importances"
    };
  }
};
