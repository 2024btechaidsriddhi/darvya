import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Pause, 
  Play, 
  ShieldAlert, 
  Globe, 
  Clock, 
  Sparkles,
  DollarSign,
  AlertTriangle,
  Zap,
  Power,
  RotateCcw
} from 'lucide-react';
import { Transaction, Alert } from '../types';
import { apiService } from '../services/api';
import GlassCard from './GlassCard';

export default function RealTimeMonitoring() {
  const [stream, setStream] = useState<Transaction[]>([]);
  const [recentAlert, setRecentAlert] = useState<Alert | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [totalProcessedSinceOpen, setTotalProcessedSinceOpen] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    // Subscribe to simulated WS socket events in API
    const unsubscribe = apiService.subscribeTransactions((newTxn, newAlert) => {
      setStream(prev => [newTxn, ...prev].slice(0, 15));
      setTotalProcessedSinceOpen(c => c + 1);

      if (newAlert) {
        setRecentAlert(newAlert);
        // Clear alert banner after 5s
        setTimeout(() => {
          setRecentAlert(null);
        }, 5000);
      }
    });

    return () => unsubscribe();
  }, [isPlaying]);

  // Color mappings
  const getRiskColor = (score: number) => {
    if (score >= 85) return {
      text: 'text-rose-500', 
      border: 'border-rose-500/20 bg-rose-500/10',
      badge: 'bg-rose-500 text-slate-950 font-bold',
      line: 'border-l-4 border-l-rose-500'
    };
    if (score >= 65) return {
      text: 'text-orange-500', 
      border: 'border-orange-500/20 bg-orange-500/10',
      badge: 'bg-orange-500 text-slate-950 font-bold',
      line: 'border-l-4 border-l-orange-500'
    };
    if (score >= 35) return {
      text: 'text-amber-400', 
      border: 'border-amber-400/20 bg-amber-400/5',
      badge: 'bg-amber-400 text-slate-950',
      line: 'border-l-4 border-l-amber-400'
    };
    return {
      text: 'text-emerald-400', 
      border: 'border-emerald-500/10 bg-emerald-500/5',
      badge: 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/30',
      line: 'border-l-2 border-l-slate-800'
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-sans font-bold text-2xl text-slate-100 tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-slate-400" />
            Live Transaction Stream
          </h2>
          <p className="text-sm text-slate-400">
            Real-time monitoring of transactions and automated risk flagging.
          </p>
        </div>

        {/* Live Controller switch controls */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-stream-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-sans text-[11px] font-semibold tracking-wider flex items-center gap-2 border transition cursor-pointer
              ${isPlaying 
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750' 
                : 'bg-emerald-950/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/25'
              }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Stream
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Resume Stream
              </>
            )}
          </button>
          <button 
            onClick={() => setStream([])}
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Clear Feed History"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Flashing critical threat alerts HUD */}
      <AnimatePresence>
        {recentAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            id="realtime-threat-hud"
            className="p-4 bg-rose-950/35 border border-rose-500/40 rounded-xl relative overflow-hidden backdrop-blur"
          >
            {/* Ambient hazard grid backing */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-rose-500/20 rounded-lg border border-rose-400/30 text-rose-400 mt-1 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-rose-500 text-slate-950 px-1.5 py-0.5 rounded font-sans font-semibold uppercase">
                      Risk Alert
                    </span>
                    <span className="font-sans text-xs text-rose-400 font-semibold">{recentAlert.id}</span>
                  </div>
                  <h4 className="font-sans font-bold text-sm text-slate-100 mt-1.5">
                    Account: {recentAlert.accountName} ({recentAlert.accountId})
                  </h4>
                  <p className="text-[11px] text-slate-300 font-sans mt-1 leading-relaxed">
                    Details: {recentAlert.description}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 self-center sm:self-auto">
                <span className="text-[10px] font-sans text-slate-500 block uppercase">Risk score</span>
                <span className="text-3xl font-black font-sans text-rose-500">{recentAlert.riskScore}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stream metadata and stats left column */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard glowColor="slate" className="h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-sans font-bold text-sm tracking-tight text-slate-100 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-slate-400" />
                  Stream Metrics
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Current performance and connection details.
                </p>
              </div>

              <div className="space-y-3.5 border-t border-slate-900 pt-4 font-sans text-xs">
                {/* 1. API state */}
                <div className="p-3 bg-slate-900/60 border border-slate-900 rounded-lg flex justify-between items-center">
                  <span className="text-slate-500 uppercase text-[9px] font-bold">Connection Status</span>
                  <span className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    CONNECTED (WS)
                  </span>
                </div>

                {/* 2. Received volume */}
                <div className="p-3 bg-slate-900/60 border border-slate-900 rounded-lg flex justify-between items-center">
                  <span className="text-slate-500 uppercase text-[9px] font-bold">Processed Events</span>
                  <span className="text-slate-200 font-bold text-sm">{totalProcessedSinceOpen} events</span>
                </div>

                {/* 3. Stream speed telemetry */}
                <div className="p-3 bg-slate-900/60 border border-slate-900 rounded-lg flex justify-between items-center">
                  <span className="text-slate-500 uppercase text-[9px] font-bold">Transfer Rate</span>
                  <span className="text-slate-300 font-bold">1 txn / 3.5 sec</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 leading-normal font-sans mt-4 pt-3 border-t border-slate-900">
              Transaction analysis is processed securely on the server.
            </div>
          </GlassCard>
        </div>

        {/* Live Ledger scrolling list (Right Column spans 3) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between px-3 font-sans text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <span>Transactions</span>
            <span>Risk Evaluation</span>
          </div>

          <div className="space-y-2 h-[410px] overflow-y-auto pr-1" id="scrolling-ledger-container">
            <AnimatePresence initial={false}>
              {stream.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-800 bg-slate-950/20 rounded-xl py-24 text-center">
                  <Radio className="w-8 h-8 text-slate-650 mb-3" />
                  <span className="text-xs font-sans text-slate-500 block">Waiting for transaction stream...</span>
                  <p className="text-[10px] text-slate-600 mt-1 font-sans">Ensure stream controller is active.</p>
                </div>
              ) : (
                stream.map((txn) => {
                  const colors = getRiskColor(txn.riskScore);
                  return (
                    <motion.div
                      key={txn.id}
                      initial={{ opacity: 0, x: -15, scale: 0.96 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 15, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`p-3.5 bg-slate-950/75 border border-slate-900/80 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative overflow-hidden transition hover:border-slate-800/80 ${colors.line}`}
                    >
                      {/* Left: Basic profile with timestamp info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-[10px] text-slate-500 block">
                            ID: {txn.id} • {txn.timestamp.slice(11, 19)}
                          </span>
                          <span className="text-slate-700 font-sans text-[9.5px] font-semibold">•</span>
                          <span className="text-[10px] font-sans text-slate-400 font-semibold uppercase">
                            Account ID: {txn.accountId}
                          </span>
                        </div>
                        <h5 className="font-sans font-bold text-slate-100 text-xs mt-1">
                          {txn.description}
                        </h5>
                        <p className="text-[10.5px] text-slate-400 font-sans mt-0.5 truncate flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-600 shrink-0" /> Location: {txn.location} ({txn.ipAddress})
                        </p>
                      </div>

                      {/* Right: Cash values and Risk level indicators */}
                      <div className="flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-3 w-full sm:w-auto shrink-0 self-stretch sm:self-auto border-t sm:border-t-0 border-slate-900 pt-2 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span className="text-slate-500 font-sans text-[9px] uppercase tracking-wider block font-medium">Amount</span>
                          <span className="font-semibold font-sans text-sm text-slate-100 mt-0.5 block flex items-center gap-0.5 justify-end">
                            <DollarSign className="w-3.5 h-3.5 text-slate-500" />{txn.amount.toLocaleString()}
                          </span>
                        </div>

                        {/* Custom Risk level tag */}
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-sans font-semibold leading-none tracking-wide uppercase ${colors.badge}`}>
                          Risk Score: {txn.riskScore}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
