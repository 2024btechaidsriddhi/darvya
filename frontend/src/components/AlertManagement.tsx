import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  UserMinus, 
  UserCheck, 
  UserPlus, 
  Flame, 
  Snowflake, 
  CheckCircle,
  Clock, 
  ChevronRight,
  Filter,
  Eye
} from 'lucide-react';
import { Alert, AlertStatus, AlertType } from '../types';
import { apiService } from '../services/api';
import GlassCard from './GlassCard';

interface AlertManagementProps {
  onAlertChange: () => void;
}

export default function AlertManagement({ onAlertChange }: AlertManagementProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'Investigating' | 'Escalated' | 'Closed' | 'Frozen'>('All');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getAlerts();
      setAlerts(res);
      if (res.length > 0 && !selectedAlert) {
        setSelectedAlert(res[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (alertId: string, status: AlertStatus, assignee: string | null) => {
    try {
      const updated = await apiService.updateAlertStatus(alertId, status, assignee);
      // Update local state
      setAlerts(prev => prev.map(a => a.id === alertId ? updated : a));
      setSelectedAlert(updated);
      onAlertChange(); // Sync global count
    } catch (e) {
      console.error(e);
    }
  };

  // Filter helper
  const filteredAlerts = alerts.filter(a => statusFilter === 'All' || a.status === statusFilter);

  // Styling helpers
  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'New': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'Investigating': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Escalated': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Frozen': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700/50';
    }
  };

  const getRiskScoreClass = (score: number) => {
    if (score >= 85) return 'text-rose-500 font-bold';
    if (score >= 65) return 'text-orange-500 font-bold';
    if (score >= 35) return 'text-amber-500 font-semibold';
    return 'text-emerald-500';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List section */}
      <GlassCard glowColor="rose" className="lg:col-span-2 flex flex-col justify-between" id="alert-list-card">
        <div>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
            <div>
              <h3 className="font-sans font-bold text-sm tracking-tight text-slate-100 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                Triggered Threat Index
              </h3>
              <p className="text-[11px] text-slate-500">
                Incoming machine learning alerts flagged by active compliance policy rules.
              </p>
            </div>

            {/* Selector filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3 h-3 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-[11px] font-mono rounded px-2.5 py-1 text-slate-400 focus:outline-none focus:border-sky-500 transition cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Investigating">Investigating</option>
                <option value="Escalated">Escalated</option>
                <option value="Frozen">Frozen</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans text-slate-300">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Alert Details</th>
                  <th className="py-2.5 px-3">Account</th>
                  <th className="py-2.5 px-3 text-center">Score</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-mono text-[11px]">
                      Loading telemetry queue...
                    </td>
                  </tr>
                ) : filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-mono text-[11px]">
                      No flagged threats match your filter selection.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map(alert => {
                    const isSelected = selectedAlert?.id === alert.id;
                    return (
                      <tr 
                        key={alert.id}
                        id={`alert-row-${alert.id}`}
                        onClick={() => setSelectedAlert(alert)}
                        className={`hover:bg-slate-900/40 transition cursor-pointer group
                          ${isSelected ? 'bg-slate-900/60 font-semibold' : ''}`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-mono text-[10px] text-sky-400 font-bold group-hover:text-sky-300">
                            {alert.id}
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 block">
                            {alert.timestamp.slice(11, 16)} • {alert.timestamp.slice(0, 10)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div>{alert.accountName}</div>
                          <span className="text-[10px] font-mono text-slate-500">{alert.accountId}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`${getRiskScoreClass(alert.riskScore)} font-mono`}>
                            {alert.riskScore}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px]">
                          {alert.alertType}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded border text-[9px] font-mono leading-none ${getStatusBadge(alert.status)}`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedAlert(alert); }}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-1 rounded hover:text-sky-400 transition"
                            title="Review Telemetry"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </GlassCard>

      {/* Detail Operations Sidebar column */}
      <div className="lg:col-span-1">
        {selectedAlert ? (
          <GlassCard glowColor={selectedAlert.riskScore >= 85 ? 'rose' : 'orange'} className="h-full flex flex-col justify-between" id="alert-detail-sidebar">
            <div className="space-y-4">
              {/* Header block with alert details */}
              <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                <div>
                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block font-bold">
                    Incident Dispatcher
                  </span>
                  <h4 className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                    {selectedAlert.id}
                  </h4>
                </div>
                <span className={`px-2 py-1 text-[9px] rounded border font-mono font-bold uppercase ${getStatusBadge(selectedAlert.status)}`}>
                  {selectedAlert.status}
                </span>
              </div>

              {/* Account profile link */}
              <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-lg space-y-1 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] font-mono uppercase block">Target Account</span>
                  <span className="font-bold text-slate-200 block">{selectedAlert.accountName}</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
                  <span>ID: {selectedAlert.accountId}</span>
                  <span className={getRiskScoreClass(selectedAlert.riskScore)}>ML Risk: {selectedAlert.riskScore}</span>
                </div>
              </div>

              {/* Alert Classification Details */}
              <div>
                <span className="text-slate-500 text-[10px] font-mono uppercase block">Trigger Category</span>
                <span className="font-bold text-xs text-sky-400 font-mono mt-1 block">
                  {selectedAlert.alertType}
                </span>
              </div>

              {/* Full Description text */}
              <div>
                <span className="text-slate-500 text-[10px] font-mono uppercase block">Automated ML Summary</span>
                <p className="text-[11px] font-mono text-slate-300 bg-slate-900/60 p-3 border border-slate-900/80 rounded h-[110px] overflow-y-auto leading-relaxed mt-1">
                  {selectedAlert.description}
                </p>
              </div>

              {/* Investigator Designation */}
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 bg-slate-900/30 px-3 py-1.5 border border-slate-900 rounded-lg">
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Assignee: {selectedAlert.assignee || "UNASSIGNED"}</span>
              </div>
            </div>

            {/* Quick response buttons area */}
            <div className="border-t border-slate-900 pt-4 mt-6">
              <span className="text-slate-500 text-[10px] font-mono uppercase block mb-2.5">Incident Action Panel</span>
              
              <div className="space-y-2">
                {/* Status Trigger: Assign Investigator */}
                {!selectedAlert.assignee && selectedAlert.status !== 'Closed' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'Investigating', 'Investigator Agent #423')}
                    className="w-full py-2 bg-sky-950/20 hover:bg-sky-950/30 border border-sky-500/20 hover:border-sky-500/40 text-sky-400 text-[11px] font-mono font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Self-Assign Investigation
                  </button>
                )}

                {/* Operations triggers row */}
                {selectedAlert.status !== 'Closed' && (
                  <div className="grid grid-cols-2 gap-2">
                    {/* Escalate block */}
                    {selectedAlert.status !== 'Escalated' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedAlert.id, 'Escalated', 'Lead Compliance Officer')}
                        className="py-2 bg-orange-950/10 hover:bg-orange-950/20 border border-orange-500/10 hover:border-orange-500/30 text-orange-400 text-[11px] font-mono font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Flame className="w-3.5 h-3.5" /> Escalate Alert
                      </button>
                    )}

                    {/* Freeze Account trigger (Severe mitigation) */}
                    {selectedAlert.status !== 'Frozen' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedAlert.id, 'Frozen', null)}
                        className="py-2 bg-rose-950/10 hover:bg-rose-950/20 border border-rose-500/15 hover:border-rose-500/35 text-rose-400 text-[11px] font-mono font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Snowflake className="w-3.5 h-3.5" /> Freeze Account
                      </button>
                    )}
                  </div>
                )}

                {/* Complete closure trigger */}
                {selectedAlert.status !== 'Closed' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'Closed', null)}
                    className="w-full py-2 bg-emerald-950/10 hover:bg-emerald-950/20 border border-emerald-500/15 hover:border-emerald-500/35 text-emerald-400 text-[11px] font-mono font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Close Incident (Resolve)
                  </button>
                )}
                
                {selectedAlert.status === 'Closed' && (
                  <div className="text-center py-2 bg-slate-950 border border-slate-900 rounded-lg text-xs font-mono text-emerald-500 flex items-center justify-center gap-1.5 leading-none">
                    <ShieldCheck className="w-4 h-4" /> THREAT DEEMED RESOLVED
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        ) : (
          <div className="h-full flex items-center justify-center border border-slate-900 bg-slate-950/30 rounded-xl py-24 px-4 text-center">
            <span className="text-xs font-mono text-slate-600">Please select an individual alert row to inspect logs and perform action triggers.</span>
          </div>
        )}
      </div>
    </div>
  );
}
