import React, { useState } from 'react';
import { 
  Gauge, 
  Play, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  XOctagon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sliders, 
  Settings,
  DollarSign
} from 'lucide-react';
import { apiService } from '../services/api';
import { RiskCategory, ExplainabilityFactor } from '../types';
import GlassCard from './GlassCard';

export default function RiskSimulator() {
  // Inputs state
  const [transactionAmount, setTransactionAmount] = useState<number>(15000);
  const [transactionCount, setTransactionCount] = useState<number>(5);
  const [velocity, setVelocity] = useState<number>(8);
  const [beneficiaryCount, setBeneficiaryCount] = useState<number>(3);
  const [deviceRisk, setDeviceRisk] = useState<'Low' | 'Medium' | 'High'>('Medium');

  // Outputs state
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [riskCategory, setRiskCategory] = useState<RiskCategory | null>(null);
  const [recommendedAction, setRecommendedAction] = useState<'Allow' | 'Monitor' | 'Review' | 'Block' | null>(null);
  const [factors, setFactors] = useState<ExplainabilityFactor[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);

    // Simulate small processing delays for realistic feeling
    setTimeout(async () => {
      try {
        const res = await apiService.simulateRiskPrediction({
          transactionAmount,
          transactionCount,
          velocity,
          beneficiaryCount,
          deviceRisk
        });
        setRiskScore(res.riskScore);
        setRiskCategory(res.riskCategory);
        setRecommendedAction(res.recommendedAction);
        setFactors(res.factors);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSimulating(false);
      }
    }, 700);
  };

  // Helper styling
  const getActionBadge = (action: 'Allow' | 'Monitor' | 'Review' | 'Block') => {
    switch (action) {
      case 'Block': return {
        text: 'BLOCK TRANSACTION', 
        style: 'bg-rose-500 text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs leading-none uppercase border border-rose-600',
        icon: <XOctagon className="w-4 h-4" />
      };
      case 'Review': return {
        text: 'REQUIRE HUMAN REVIEW', 
        style: 'bg-orange-500 text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs leading-none uppercase border border-orange-600',
        icon: <AlertTriangle className="w-4 h-4" />
      };
      case 'Monitor': return {
        text: 'MONITOR BALANCE DEVIATIONS', 
        style: 'bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs leading-none uppercase',
        icon: <HelpCircle className="w-4 h-4" />
      };
      default: return {
        text: 'ALLOW ACCESS', 
        style: 'bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs leading-none uppercase',
        icon: <CheckCircle className="w-4 h-4" />
      };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left Columns layout: Input forms (spans 2) */}
      <div className="lg:col-span-2">
        <GlassCard glowColor="slate" className="h-full" id="simulator-inputs-card">
          <form onSubmit={handleSimulate} className="space-y-4">
            <div>
              <h3 className="font-sans font-bold text-sm tracking-tight text-slate-100 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-sky-400" />
                DarvyaScore Simulator
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Calibrate telemetry values to test neural risk prediction pathways.
              </p>
            </div>

            {/* Inputs body */}
            <div className="space-y-3.5 border-t border-slate-900 pt-4 font-mono text-[11px] text-slate-400">
              
              {/* 1. Transaction Amount Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>TRANSFER AMOUNT ($)</span>
                  <span className="text-sky-400">${transactionAmount.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="250000" 
                  step="250"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(+e.target.value)}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-900 rounded"
                  id="input-amount"
                />
              </div>

              {/* 2. Operations Velocity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>DAILY VELOCITY COUNT</span>
                  <span className="text-sky-400">{velocity} transfers / hr</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={velocity}
                  onChange={(e) => setVelocity(+e.target.value)}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-900 rounded"
                  id="input-velocity"
                />
              </div>

              {/* 3. Beneficiary count */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>UNIQUE BENEFICIARIES</span>
                  <span className="text-sky-400">{beneficiaryCount} accounts</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={beneficiaryCount}
                  onChange={(e) => setBeneficiaryCount(+e.target.value)}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-900 rounded"
                  id="input-beneficiary"
                />
              </div>

              {/* 4. Device risk Selector Buttons */}
              <div className="space-y-1">
                <span className="block font-bold">DEVICE RISK RATING</span>
                <div className="grid grid-cols-3 gap-2 mt-1 font-bold">
                  {['Low', 'Medium', 'High'].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setDeviceRisk(rating as any)}
                      className={`py-1.5 border text-[10px] font-mono rounded cursor-pointer transition
                        ${deviceRisk === rating 
                          ? rating === 'High' 
                            ? 'bg-rose-950/20 border-rose-500/55 text-rose-400' 
                            : 'bg-sky-950/20 border-sky-500/55 text-sky-400'
                          : 'bg-slate-950/60 border-slate-900/60 text-slate-500 hover:border-slate-800'
                        }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Run Button */}
            <button
              type="submit"
              disabled={isSimulating}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition text-xs font-mono tracking-wider rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-4"
              id="run-simulation-btn"
            >
              {isSimulating ? (
                <>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-slate-950 animate-ping mr-1" />
                  PROCESSING THROUGH ML GRAPH...
                </>
              ) : (
                <>
                  <Play className="w-4.5 h-4.5 fill-slate-950" /> RUN ML RISK ASSESSMENT
                </>
              )}
            </button>
          </form>
        </GlassCard>
      </div>

      {/* Right Column Layout: Output analysis and gauges (spans 3) */}
      <div className="lg:col-span-3 space-y-6">
        {riskScore !== null && riskCategory !== null && recommendedAction !== null ? (
          <>
            {/* Visual Gauge of predicted scoring */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Risk category indicator card */}
              <GlassCard glowColor={riskScore >= 85 ? 'rose' : riskScore >= 65 ? 'orange' : 'slate'} id="predicted-score-card">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                      Automated ML Prediction
                    </span>
                    <h4 className="font-sans font-bold text-sm text-slate-100 tracking-tight mt-0.5">
                      Evaluated Risk Category: {riskCategory}
                    </h4>

                    {/* Score display */}
                    <div className="flex items-baseline gap-1.5 mt-4">
                      <span className={`text-4xl font-black font-sans tracking-tight
                        ${riskScore >= 85 ? 'text-rose-500' : riskScore >= 65 ? 'text-orange-500' : 'text-emerald-400'}`}>
                        {riskScore}
                      </span>
                      <span className="text-slate-500 font-mono text-xs">/ 100 risk score</span>
                    </div>
                  </div>

                  {/* recommended action button badge */}
                  <div className="mt-6 border-t border-slate-900 pt-4 flex flex-col items-start">
                    <span className="text-slate-500 font-mono text-[9px] uppercase tracking-widest block mb-2">Recommended Action Gate</span>
                    <div className="flex items-center gap-2">
                      {getActionBadge(recommendedAction).icon}
                      <span className={getActionBadge(recommendedAction).style}>
                        {getActionBadge(recommendedAction).text}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Technical model outputs and SHAP breakdown lists */}
              <GlassCard glowColor="slate" id="explain-simulated-factors">
                <h4 className="font-sans font-bold text-xs text-slate-100 tracking-tight flex items-center justify-between mb-1">
                  <span>Attribute Breakdown (SHAP-simulated)</span>
                  <Gauge className="w-3.5 h-3.5 text-sky-400" />
                </h4>
                <p className="text-[10px] text-slate-500 mb-4">
                  Visual weight index of custom calibrated inputs.
                </p>

                <div className="space-y-2 font-mono text-[10px]">
                  {factors.map((factor, idx) => {
                    const isIncrease = factor.impactDirection === 'Increase';
                    return (
                      <div key={idx} className="flex justify-between items-center p-2 bg-slate-900/60 border border-slate-900 rounded">
                        <span className="text-slate-300 truncate max-w-[170px]">{factor.featureName}</span>
                        <span className={`flex items-center font-bold font-mono ${isIncrease ? 'text-rose-400 animate-pulse' : 'text-emerald-300'}`}>
                          {isIncrease ? '+' : '-'}{factor.contribution}%
                          {isIncrease ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>

            {/* Simulated verification disclaimer logs */}
            <GlassCard glowColor="slate">
              <h4 className="font-sans font-bold text-xs text-slate-100 mb-1">
                Regulatory Decision Explanation Memo
              </h4>
              <p className="text-[11px] font-mono leading-relaxed text-slate-300">
                Evaluation results are governed by decision tree threshold trees. Simulated output models are configured using actual historical weights mapped against the <span className="text-sky-400">v3.4.11-PROD</span> production release parameters.
              </p>
            </GlassCard>
          </>
        ) : (
          <div className="h-full flex flex-col justify-center items-center border border-dashed border-slate-800 bg-slate-950/20 rounded-xl py-24 text-center">
            <Settings className="w-8 h-8 text-slate-600 mb-3 animate-spin duration-3000" />
            <span className="text-xs font-mono text-slate-500">ML Scoring Pipeline ready for execution.</span>
            <p className="text-[10px] text-slate-600 mt-1 font-mono">Calibrate values in the sidebar panel and click prompt to generate prediction.</p>
          </div>
        )}
      </div>
    </div>
  );
}
