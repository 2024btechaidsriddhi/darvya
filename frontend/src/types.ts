export type RiskCategory = 'Low' | 'Medium' | 'High' | 'Critical';

export type AlertStatus = 'New' | 'Investigating' | 'Escalated' | 'Closed' | 'Frozen';

export type AlertType = 'Mule Pattern' | 'Structuring' | 'Rapid Velocity' | 'IP Anomaly' | 'Device Overlay' | 'High-Risk Transfer';

export interface Account {
  id: string;
  customerId: string;
  holderName: string;
  phoneNumber: string;
  email: string;
  balance: number;
  currency: string;
  riskScore: number;
  riskCategory: RiskCategory;
  createdAt: string;
  connectionsCount: number;
  notes: string[];
}

export interface Transaction {
  id: string;
  accountId: string;
  timestamp: string;
  amount: number;
  description: string;
  type: 'ACH' | 'WIRE' | 'P2P' | 'ATM' | 'INTERNAL';
  riskScore: number;
  riskCategory: RiskCategory;
  beneficiaryAccount: string;
  beneficiaryName: string;
  deviceRisk: 'Low' | 'Medium' | 'High';
  ipAddress: string;
  location: string;
}

export interface Alert {
  id: string;
  accountId: string;
  accountName: string;
  riskScore: number;
  alertType: AlertType;
  timestamp: string;
  status: AlertStatus;
  assignee: string | null;
  description: string;
}

export interface DashboardStats {
  totalAccountsAnalyzed: number;
  suspiciousAccounts: number;
  highRiskAccounts: number;
  criticalAlertsCount: number;
  fraudPreventedAmount: number;
  detectionAccuracy: number;
  averageRiskScore: number;
  weeklyAlertsCount: { date: string; volume: number; processed: number }[];
  riskDistribution: { range: string; count: number }[];
  fraudTypeDistribution: { name: string; value: number }[];
  trendTimeline: { date: string; fraudValue: number; preventedValue: number }[];
}

export interface ExplainabilityFactor {
  featureName: string;
  contribution: number; // 0 to 100
  impactDirection: 'Increase' | 'Decrease';
  description: string;
}

export interface AccountPrediction {
  accountId: string;
  status: 'Suspicious' | 'Legitimate';
  modelConfidence: number;
  topFactors: ExplainabilityFactor[];
  riskExplanation: string;
}

export interface ModelMetricsSnapshot {
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  historicalMetrics: { date: string; accuracy: number; precision: number; F1: number }[];
  predictionVolume: { date: string; predictions: number; anomalies: number }[];
  confusionMatrix: {
    trueNegative: number;  // Legitimate classified as Legitimate
    falsePositive: number; // Legitimate classified as Suspicious
    falseNegative: number; // Suspicious classified as Legitimate
    truePositive: number;  // Suspicious classified as Suspicious
  };
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'Account' | 'Merchant' | 'IP_Cluster' | 'Proxy_Wallet';
  riskCategory: RiskCategory;
  riskScore: number;
  isMuleRing?: boolean;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  amount: number;
  transactionCount: number;
  isSuspicious: boolean;
}
