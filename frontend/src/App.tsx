import React, { useState, useEffect } from 'react';
import { apiService } from './services/api';
import { DashboardStats } from './types';
import Sidebar from './components/Sidebar';
import { ShieldCheck, User } from 'lucide-react';

// Import our modular panel nodes
import ExecutiveDashboard from './components/ExecutiveDashboard';
import AccountInvestigation from './components/AccountInvestigation';
import AlertManagement from './components/AlertManagement';
import NetworkAnalysis from './components/NetworkAnalysis';
import AIExplainability from './components/AIExplainability';
import ModelMonitoring from './components/ModelMonitoring';
import RealTimeMonitoring from './components/RealTimeMonitoring';
import RiskSimulator from './components/RiskSimulator';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [liveAlertCount, setLiveAlertCount] = useState<number>(0);

  // Load telemetry stats
  useEffect(() => {
    fetchStats();
    
    // Subscribe to simulated WS socket in API to sync alerts badge in real-time
    const unsubscribe = apiService.subscribeTransactions((newTxn, newAlert) => {
      if (newAlert) {
        setLiveAlertCount(prev => prev + 1);
        fetchStats(); // update timeline weights
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchStats = async () => {
    try {
      const liveStats = await apiService.getDashboardStats();
      const alerts = await apiService.getAlerts();
      setStats(liveStats);
      // count active/unresolved alerts
      setLiveAlertCount(alerts.filter(a => a.status !== 'Closed').length);
    } catch (e) {
      console.error(e);
    }
  };

  const renderActivePage = () => {
    if (!stats) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-80px)] text-sm font-sans text-slate-500">
          Loading system metrics...
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <ExecutiveDashboard stats={stats} />;
      case 'investigation':
        return <AccountInvestigation />;
      case 'alerts':
        return <AlertManagement onAlertChange={fetchStats} />;
      case 'network':
        return <NetworkAnalysis />;
      case 'explainability':
        return <AIExplainability />;
      case 'model':
        return <ModelMonitoring />;
      case 'realtime':
        return <RealTimeMonitoring />;
      case 'simulator':
        return <RiskSimulator />;
      default:
        return <ExecutiveDashboard stats={stats} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-300 overflow-hidden" id="app-root">
      {/* Sidebar Command Centre Navigation */}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        liveAlertCount={liveAlertCount} 
      />

      {/* Main Panel Frame section */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Universal Headings Margins bar */}
        <header className="h-20 border-b border-slate-800 bg-slate-950 px-8 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-slate-400" />
            <div className="hidden sm:block">
              <span className="text-[10px] font-sans tracking-wider text-slate-500 uppercase font-bold block">
                Access Status:
              </span>
              <span className="text-xs font-sans text-emerald-500 font-bold block">
                AUTHORIZED AUDITOR SESSION
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick alert bar indicator */}
            {liveAlertCount > 0 && (
              <div className="bg-rose-950/40 border border-rose-800 text-rose-400 px-3 py-1 rounded text-[11px] font-sans font-bold">
                 {liveAlertCount} PENDING ALERTS
              </div>
            )}

            {/* Profile pill */}
            <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800 px-3 py-1.5 rounded-lg select-none">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-xs font-sans font-semibold text-slate-300">Auditor#0819</span>
            </div>
          </div>
        </header>

        {/* Dynamic page mount viewport */}
        <main className="flex-1 overflow-y-auto px-8 py-6 bg-slate-950">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
