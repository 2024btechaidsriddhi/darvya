import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  CheckCircle, 
  XOctagon, 
  ArrowUpRight, 
  ArrowDownRight, 
  HelpCircle,
  TrendingDown,
  Percent,
  Search
} from 'lucide-react';
import { Account, AccountPrediction, ExplainabilityFactor } from '../types';
import { apiService } from '../services/api';
import GlassCard from './GlassCard';

export default function AIExplainability() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAcc, setSelectedAcc] = useState<Account | null>(null);
  const [explainabilityData, setExplainabilityData] = useState<AccountPrediction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load accounts initially
    apiService.getAccounts().then((res) => {
      setAccounts(res);
      if (res.length > 0) {
        setSelectedAcc(res[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedAcc) {
      setIsLoading(true);
      apiService.getAccountExplainability(selectedAcc.id).then((res) => {
        setExplainabilityData(res);
        setIsLoading(false);
      });
    }
  }, [selectedAcc]);

  const handleSearch = (val: string) => {
    setSearchQuery(val);
  };

  const filteredAccounts = accounts.filter(a => 
    a.holderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* Search Sidebar Column */}
      <div className="lg:col-span-1 space-y-4">
        <GlassCard glowColor="slate" className="h-full flex flex-col justify-start">
          <div>
            <h3 className="font-sans font-bold text-sm tracking-tight text-slate-100 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-sky-400" />
              Explainability Index
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select verified customer profiles to inspect SHAP feature metrics.
            </p>
          </div>

          {/* Account search */}
          <div className="relative mt-3 mb-4">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Filter names or accounts..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-sans text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition"
              id="explain-search"
            />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
            {filteredAccounts.map((acc) => {
              const isSelected = selectedAcc?.id === acc.id;
              return (
                <button
                  key={acc.id}
                  id={`explain-select-${acc.id}`}
                  onClick={() => setSelectedAcc(acc)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer
                    ${isSelected 
                      ? 'bg-slate-900/80 border-sky-500/50' 
                      : 'bg-slate-950/40 border-slate-900/80 hover:border-slate-850'
                    }`}
                >
                  <div className="min-w-0">
                    <span className="font-mono text-[9px] text-slate-500 block">{acc.id}</span>
                    <span className="text-xs font-bold text-slate-200 block truncate mt-0.5">{acc.holderName}</span>
                  </div>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold shrink-0 ml-2
                    ${acc.riskScore >= 65 
                      ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' 
                      : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                    }`}
                  >
                    score: {acc.riskScore}
                  </span>
                </button>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* SHAP explanation & visualizations Center */}
      <div className="lg:col-span-2 space-y-6">
        {selectedAcc && explainabilityData ? (
          <>
            {/* Top overview header */}
            <GlassCard glowColor={explainabilityData.status === 'Suspicious' ? 'rose' : 'emerald'} id="explain-header">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                    AI Decision Log
                  </span>
                  <h4 className="font-sans font-bold text-base text-slate-100 mt-0.5">
                    Model Prediction: {explainabilityData.status}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Risk assessment score evaluated at <span className="font-mono text-sky-400">{selectedAcc.riskScore}/100</span> confidence quotient.
                  </p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-900 rounded-lg font-mono text-xs">
                  {explainabilityData.status === 'Suspicious' ? (
                    <>
                      <XOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
                      <span className="text-rose-400 font-bold">POSSIBLE MULE SEED ({explainabilityData.modelConfidence}%)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-400 font-bold">LEGITIMATE USER ({explainabilityData.modelConfidence}%)</span>
                    </>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Split layout: SHAP-style importance factor bars vs Model explanation narrative */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* SHAP-style Importance horizontal chart (spans 2 columns) */}
              <GlassCard glowColor="slate" className="md:col-span-2" id="shap-chart-card">
                <h4 className="font-sans font-bold text-xs text-slate-100 tracking-tight flex items-center justify-between mb-1">
                  <span>SHAP-value Feature Contributions</span>
                  <Percent className="w-3.5 h-3.5 text-sky-400" />
                </h4>
                <p className="text-[10px] text-slate-500 mb-4">
                  Visual weight analysis of individual attributes accelerating or reducing the global prediction target.
                </p>

                {/* Draw HTML bar charts */}
                <div className="space-y-3">
                  {explainabilityData.topFactors.map((factor, index) => {
                    const isIncrease = factor.impactDirection === 'Increase';
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-300 font-bold block truncate max-w-[190px]">
                            {factor.featureName}
                          </span>
                          <span className={`flex items-center font-bold ${isIncrease ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {isIncrease ? '+' : '-'}{factor.contribution}% 
                            {isIncrease ? <ArrowUpRight className="w-3 h-3 ml-0.5" /> : <ArrowDownRight className="w-3 h-3 ml-0.5" />}
                          </span>
                        </div>
                        {/* Custom visual progress bar */}
                        <div className="w-full bg-slate-900 h-2 rounded overflow-hidden flex">
                          <div 
                            style={{ width: `${factor.contribution}%` }} 
                            className={`h-full rounded-sm ${isIncrease ? 'bg-rose-500/80 shadow-inner' : 'bg-emerald-500/80'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Narratives Card descriptor (spans 1 column) */}
              <GlassCard glowColor="cyan" className="md:col-span-1 flex flex-col justify-between h-full" id="narratives-card">
                <div>
                  <h4 className="font-sans font-bold text-xs text-slate-100 tracking-tight flex items-center gap-1 mb-1">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    Model Verdict
                  </h4>
                  <p className="text-[10px] text-slate-500 mb-3">
                    Synthesized linguistic reasoning.
                  </p>

                  <p className="text-[11px] font-mono leading-relaxed text-slate-300 bg-slate-900/40 p-3 border border-slate-900/60 rounded overflow-y-auto max-h-[140px]">
                    {explainabilityData.riskExplanation}
                  </p>
                </div>

                <div className="text-[9px] font-mono text-slate-500 leading-tight mt-4 border-t border-slate-900 pt-2.5">
                  🛡️ Explainability complies with SEC guidelines and EU AI risk management standards.
                </div>
              </GlassCard>
            </div>

            {/* In-depth Breakdown table of all factors */}
            <GlassCard glowColor="slate">
              <h4 className="font-sans font-bold text-xs text-slate-100 tracking-tight mb-3">
                Telemetry Attribute Audit Logs
              </h4>

              <div className="space-y-2 font-mono">
                {explainabilityData.topFactors.map((factor, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/20 border border-slate-900/60 rounded-lg flex items-start gap-3">
                    <div className={`p-1.5 rounded shrink-0 border mt-0.5
                      ${factor.impactDirection === 'Increase' 
                        ? 'bg-rose-950/10 border-rose-500/25 text-rose-400' 
                        : 'bg-emerald-950/10 border-emerald-500/25 text-emerald-400'
                      }`}
                    >
                      {factor.impactDirection === 'Increase' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">{factor.featureName}</span>
                      <p className="text-[11px] text-slate-400 leading-normal mt-0.5">{factor.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </>
        ) : (
          <div className="h-96 flex items-center justify-center border border-slate-900 bg-slate-950/40 rounded-xl">
            <span className="text-xs font-mono text-slate-600">Please select a validated account profile to process feature explainability.</span>
          </div>
        )}
      </div>
    </div>
  );
}
