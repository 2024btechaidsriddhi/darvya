import React, { useState, useEffect } from 'react';
import { 
  LineChart as ReChartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Cell
} from 'recharts';
import { 
  Activity, 
  HelpCircle, 
  Database, 
  Lock, 
  Percent, 
  Compass, 
  RefreshCw,
  Server
} from 'lucide-react';
import { ModelMetricsSnapshot } from '../types';
import { apiService } from '../services/api';
import GlassCard from './GlassCard';

export default function ModelMonitoring() {
  const [metrics, setMetrics] = useState<ModelMetricsSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    apiService.getModelMetrics().then((res) => {
      setMetrics(res);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="py-24 text-center text-xs font-mono text-slate-500">
        Loading ML pipeline stats...
      </div>
    );
  }

  // Helper formatting accuracy percentages
  const formatPercent = (val: number) => `${(val * 100).toFixed(2)}%`;

  return (
    <div className="space-y-6">
      {/* Overview Headings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-sans font-bold text-2xl text-slate-100 tracking-tight flex items-center gap-2">
            Model Validation & Auditing Engine
            <span className="text-xs font-mono font-normal tracking-widest text-indigo-400 border border-indigo-400/20 bg-indigo-950/40 px-2.5 py-0.5 rounded uppercase">
              PROD ENGINE v3.4.11
            </span>
          </h2>
          <p className="text-sm text-slate-400">
            Audit standard F1 metrics, predictions drift telemetry, and verified precision bounds.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/60 border border-slate-900 rounded-lg text-xs font-mono text-slate-400">
          <Database className="w-4 h-4 text-indigo-400" />
          SCHEMA TARGETS: AML_COMPLIANT
        </div>
      </div>

      {/* Model Stats top row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="stats-monitoring-row">
        <GlassCard glowColor="cyan" className="p-4">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Accuracy Rate</span>
          <p className="text-xl font-bold font-sans text-sky-400 mt-1">{formatPercent(metrics.accuracy)}</p>
          <div className="text-[9.5px] font-mono text-emerald-400 mt-2 font-semibold">
            +0.04% vs yesterday
          </div>
        </GlassCard>

        <GlassCard glowColor="indigo" className="p-4">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Precision Weight</span>
          <p className="text-xl font-bold font-sans text-indigo-400 mt-1">{formatPercent(metrics.precision)}</p>
          <span className="text-[9.5px] font-mono text-slate-500 mt-2 block">Trigger margin limit</span>
        </GlassCard>

        <GlassCard glowColor="emerald" className="p-4">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Sensitivity (Recall)</span>
          <p className="text-xl font-bold font-sans text-emerald-400 mt-1">{formatPercent(metrics.recall)}</p>
          <span className="text-[9.5px] font-mono text-emerald-400 mt-2 block">Optimized boundary logs</span>
        </GlassCard>

        <GlassCard glowColor="amber" className="p-4">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">F1-Score Metrics</span>
          <p className="text-xl font-bold font-sans text-amber-400 mt-1">{formatPercent(metrics.f1Score)}</p>
          <span className="text-[9.5px] font-mono text-slate-500 mt-2 block">Harmonic mean score</span>
        </GlassCard>

        <GlassCard glowColor="orange" className="p-4">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">ROC-AUC Closeness</span>
          <p className="text-xl font-bold font-sans text-orange-400 mt-1">{metrics.rocAuc}</p>
          <span className="text-[9.5px] font-mono text-emerald-400 mt-2 block font-semibold">Peak performance</span>
        </GlassCard>
      </div>

      {/* Main Row / Performance charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Accuracy Over Time Shift chart */}
        <GlassCard glowColor="cyan" className="lg:col-span-2" id="model-performance-trend">
          <h3 className="font-sans font-bold text-sm tracking-tight text-slate-100 mb-1">
            Historical Performance Stability
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            A continuous tracking registry detailing Precision and F1 values over multi-day iterations.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ReChartsLineChart data={metrics.historicalMetrics} margin={{ left: -25, right: 10 }}>
                <XAxis dataKey="date" stroke="#475569" fontSize={9} fontStyle="italic" />
                <YAxis stroke="#475569" fontSize={9} domain={[0.95, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '6px' }}
                  itemStyle={{ fontSize: '10px', color: '#cbd5e1' }}
                  formatter={(v: number) => [ `${(v*100).toFixed(3)}%`, '']}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#38bdf8" strokeWidth={1.5} dot={{ r: 3 }} name="Accuracy" />
                <Line type="monotone" dataKey="precision" stroke="#6366f1" strokeWidth={1.5} dot={{ r: 2 }} name="Precision" />
                <Line type="monotone" dataKey="F1" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 1 }} name="F1 Score" />
              </ReChartsLineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Binary Confusion Matrix Layout representation (Highly visual!) */}
        <GlassCard glowColor="indigo" id="confusion-matrix-box">
          <div className="flex flex-col h-full justify-between">
            <div>
              <h3 className="font-sans font-bold text-sm tracking-tight text-slate-100 flex items-center justify-between">
                <span>Confusion Matrix Output</span>
                <Compass className="w-4 h-4 text-indigo-400" strokeWidth={2} />
              </h3>
              <p className="text-[11px] text-slate-500 mb-3">
                Current split of predicted classes against actual ground-truths.
              </p>

              {/* Matrix Layout design with Custom Cells list */}
              <div className="grid grid-cols-2 gap-2 font-mono text-[10px] my-2">
                {/* 1. True Negative */}
                <div className="bg-slate-900/60 border border-slate-900 p-2.5 rounded text-center">
                  <span className="text-slate-500 block text-[8.5px] uppercase">True Neg (Safe)</span>
                  <p className="text-xs font-bold text-slate-100 mt-1">
                    {metrics.confusionMatrix.trueNegative.toLocaleString()}
                  </p>
                  <span className="text-[7.5px] text-emerald-400 tracking-wider font-bold block mt-0.5">LEGIT CORRECT</span>
                </div>

                {/* 2. False Positive (False Alarm count) */}
                <div className="bg-slate-900/60 border border-rose-950/20 p-2.5 rounded text-center">
                  <span className="text-slate-500 block text-[8.5px] uppercase">False Pos (Alarm)</span>
                  <p className="text-xs font-bold text-rose-400 mt-1">
                    {metrics.confusionMatrix.falsePositive.toLocaleString()}
                  </p>
                  <span className="text-[7.5px] text-slate-500 tracking-wider block mt-0.5">GOOD FLAGGED</span>
                </div>

                {/* 3. False Negative (Critical Misses) */}
                <div className="bg-rose-950/10 border border-rose-900/40 p-2.5 rounded text-center">
                  <span className="text-slate-500 block text-[8.5px] uppercase flex items-center justify-center gap-1">
                     False Neg (Miss) ⚠️
                  </span>
                  <p className="text-xs font-black text-rose-500 mt-1">
                    {metrics.confusionMatrix.falseNegative.toLocaleString()}
                  </p>
                  <span className="text-[7.5px] text-rose-400 tracking-wider font-black block mt-0.5">MULES MISSED</span>
                </div>

                {/* 4. True Positive (Blocks) */}
                <div className="bg-slate-900/60 border border-slate-900 p-2.5 rounded text-center">
                  <span className="text-slate-500 block text-[8.5px] uppercase">True Pos (Blocks)</span>
                  <p className="text-xs font-bold text-slate-100 mt-1">
                    {metrics.confusionMatrix.truePositive.toLocaleString()}
                  </p>
                  <span className="text-[7.5px] text-emerald-400 tracking-wider font-bold block mt-0.5">MULE CORRECT</span>
                </div>
              </div>
            </div>

            <span className="text-[9px] font-mono text-slate-500 leading-normal border-t border-slate-900 pt-2.5 text-center flex items-center justify-center gap-1.5 mt-4">
              <Lock className="w-3.5 h-3.5 text-emerald-500" /> Audit trail verified via SOC-2 compliance parameters.
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Prediction Volume & Anomalies bar rows */}
      <GlassCard glowColor="slate" id="prediction-drift-volumes">
        <h3 className="font-sans font-bold text-sm tracking-tight text-slate-100 mb-1">
          Daily Ledger Load volume
        </h3>
        <p className="text-[11px] text-slate-500 mb-4">
          Visual load analysis logging millions of analyzed credit records against verified threat blocks.
        </p>

        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.predictionVolume} margin={{ left: -25, right: 10 }}>
              <XAxis dataKey="date" stroke="#475569" fontSize={9} />
              <YAxis stroke="#475569" fontSize={9} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '6px' }}
                itemStyle={{ fontSize: '10px', color: '#cbd5e1' }}
              />
              {/* Stacked structure */}
              <Bar dataKey="predictions" fill="#334155" name="Legitimate Transactions" />
              <Bar dataKey="anomalies" fill="#f43f5e" name="AML Alerts Flagged" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
