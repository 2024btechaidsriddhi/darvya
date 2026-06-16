import React from 'react';
import { 
  Users, 
  UserMinus, 
  ShieldAlert, 
  DollarSign, 
  Activity, 
  Percent, 
  ArrowUpRight, 
  TrendingUp, 
  Lock 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DashboardStats } from '../types';
import GlassCard from './GlassCard';

interface ExecutiveDashboardProps {
  stats: DashboardStats;
}

const PIE_COLORS = ['#64748b', '#475569', '#3b82f6', '#1e3a8a', '#1e293b'];

export default function ExecutiveDashboard({ stats }: ExecutiveDashboardProps) {
  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-sans font-bold text-2xl text-slate-100 tracking-tight flex items-center gap-2">
            Compliance & Fraud Analytics
            <span className="text-xs font-sans font-semibold tracking-wider text-emerald-500 border border-emerald-500/20 bg-emerald-950/20 px-2 py-0.5 rounded">
              Active
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time compliance verification, predictive model auditing, and money mule detection metrics.
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg font-sans text-xs text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          System Status: Online
        </div>
      </div>

      {/* Top KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <GlassCard>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-sans font-semibold text-slate-500 uppercase tracking-wider block">
                Total Analyzed
              </span>
              <p className="text-xl font-bold font-sans text-slate-100 mt-1">
                {stats.totalAccountsAnalyzed.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-900 p-1.5 rounded-md border border-slate-800">
              <Users className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2.5">
            <span className="text-[10px] font-sans text-emerald-500 font-bold flex items-center">
              +1.2% <TrendingUp className="w-2.5 h-2.5 inline-block ml-0.5" />
            </span>
            <span className="text-[9px] font-sans text-slate-500">vs last hour</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-sans font-semibold text-slate-500 uppercase tracking-wider block">
                Suspicious Detected
              </span>
              <p className="text-xl font-bold font-sans text-slate-100 mt-1">
                {stats.suspiciousAccounts.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-900 p-1.5 rounded-md border border-slate-800">
              <UserMinus className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2.5">
            <span className="text-[10px] font-sans text-slate-400 font-semibold">Anomalies</span>
            <span className="text-[9px] font-sans text-slate-500">flagged for review</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-sans font-semibold text-slate-500 uppercase tracking-wider block">
                High Risk Cases
              </span>
              <p className="text-xl font-bold font-sans text-slate-100 mt-1">
                {stats.highRiskAccounts.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-900 p-1.5 rounded-md border border-slate-800">
              <Activity className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2.5">
            <span className="text-slate-400 font-semibold font-sans text-[10px]">Pending</span>
            <span className="text-[9px] font-sans text-slate-500">verification</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-sans font-semibold text-slate-500 uppercase tracking-wider block">
                Open Alerts
              </span>
              <p className="text-xl font-bold font-sans text-slate-100 mt-1">
                {stats.criticalAlertsCount.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-900 p-1.5 rounded-md border border-slate-800">
              <ShieldAlert className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2.5">
            <span className="text-[10px] font-sans text-rose-500 font-bold">Unresolved</span>
            <span className="text-[9px] font-sans text-slate-500">critical triggers</span>
          </div>
        </GlassCard>

        <GlassCard className="col-span-1 lg:col-span-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-sans font-semibold text-slate-500 uppercase tracking-wider block">
                Amount Prevented
              </span>
              <p className="text-xl font-bold font-sans text-slate-100 mt-1">
                {formatUSD(stats.fraudPreventedAmount)}
              </p>
            </div>
            <div className="bg-slate-900 p-1.5 rounded-md border border-slate-800">
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="text-[10px] font-sans text-emerald-500 font-bold flex items-center">
              +14% <ArrowUpRight className="w-2.5 h-2.5" />
            </span>
            <span className="text-[9px] font-sans text-slate-500">mitigated assets this period</span>
          </div>
        </GlassCard>
      </div>

      {/* Main Row / Timeline Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-3" id="timeline-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-sans font-bold text-sm tracking-tight text-slate-100">
                Fraud Mitigation Timeline
              </h3>
              <p className="text-[11px] text-slate-500">
                Prevented transaction values vs realized compliance losses.
              </p>
            </div>
            <div className="flex gap-4 font-sans text-[10px] font-bold">
              <span className="text-slate-400">PREVENTED VALUE</span>
              <span className="text-slate-500">REALIZED LOSSES</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trendTimeline} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="preventedValGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#475569" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#475569" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="lossesValGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e293b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={9} />
                <YAxis stroke="#475569" fontSize={9} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} 
                  labelClassName="font-sans text-[10px] text-slate-400 font-bold"
                  itemStyle={{ fontSize: '11px', color: '#cbd5e1' }}
                  formatter={(value: number) => [formatUSD(value), '']}
                />
                <Area type="monotone" dataKey="preventedValue" stroke="#64748b" strokeWidth={2} fillOpacity={1} fill="url(#preventedValGradient)" />
                <Area type="monotone" dataKey="fraudValue" stroke="#334155" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#lossesValGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard id="distribution-chart">
          <h3 className="font-sans font-bold text-sm tracking-tight text-slate-100 mb-1">
            Risk Score Distribution
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Frequency mapping of accounts categorized by risk percentiles.
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.riskDistribution} margin={{ left: -30, right: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="range" stroke="#475569" fontSize={9} />
                <YAxis stroke="#475569" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px' }}
                  itemStyle={{ fontSize: '10px', color: '#cbd5e1' }}
                />
                <Bar dataKey="count" fill="#475569">
                  {stats.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === stats.riskDistribution.length - 1 ? '#3b82f6' : '#475569'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard id="volumes-line-chart">
          <h3 className="font-sans font-bold text-sm tracking-tight text-slate-100 mb-1">
            Daily Alert Volume
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Total daily generated alerts vs successfully audited compliance cases.
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.weeklyAlertsCount} margin={{ left: -25, right: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={9} />
                <YAxis stroke="#475569" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px' }}
                  itemStyle={{ fontSize: '10px', color: '#cbd5e1' }}
                />
                <Line type="monotone" dataKey="volume" stroke="#64748b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="processed" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard id="type-chart">
          <h3 className="font-sans font-bold text-sm tracking-tight text-slate-100 mb-1">
            Fraud Type Distribution
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Proportional split of system flagged severity categories.
          </p>
          <div className="h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.fraudTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.fraudTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px' }}
                  itemStyle={{ fontSize: '10px', color: '#cbd5e1' }}
                  formatter={(v) => [`${v}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center gap-1 px-1">
              {stats.fraudTypeDistribution.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5 text-[9px] font-sans text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="truncate max-w-[80px]">{item.name}</span>
                  <span className="text-slate-500 ml-auto">({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
