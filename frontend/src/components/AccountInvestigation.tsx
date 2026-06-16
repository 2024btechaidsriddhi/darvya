import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  Phone, 
  FileText, 
  DollarSign, 
  Clock, 
  ShieldAlert, 
  Send, 
  MapPin, 
  Laptop, 
  Activity,
  ArrowRight,
  UserCheck,
  RotateCcw
} from 'lucide-react';
import { Account, Transaction } from '../types';
import { apiService } from '../services/api';
import GlassCard from './GlassCard';

export default function AccountInvestigation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'holder' | 'id' | 'phone'>('all');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load initial accounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Update transaction history when selected account shifts
  useEffect(() => {
    if (selectedAccount) {
      apiService.getTransactionsByAccount(selectedAccount.id).then(setTransactions);
    }
  }, [selectedAccount]);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getAccounts();
      setAccounts(res);
      // Select first account by default
      if (res.length > 0 && !selectedAccount) {
        setSelectedAccount(res[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      const allAccs = await apiService.getAccounts();
      setAccounts(allAccs);
      return;
    }

    setIsLoading(true);
    try {
      const filtered = await apiService.searchAccounts(val);
      setAccounts(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !newNote.trim()) return;

    try {
      const updated = await apiService.addAccountNote(selectedAccount.id, newNote);
      setSelectedAccount(updated);
      // Update in primary accounts list
      setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
      setNewNote('');
    } catch (e) {
      console.error(e);
    }
  };

  // Status colors helper
  const getRiskColor = (cat: string) => {
    switch (cat) {
      case 'Critical': return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
      case 'High': return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
      case 'Medium': return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
      default: return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left pane: Accounts search and selection list */}
      <div className="lg:col-span-1 space-y-4">
        <GlassCard glowColor="slate" className="h-full flex flex-col justify-start">
          <h3 className="font-sans font-bold text-sm tracking-tight text-slate-100 flex items-center justify-between">
            🔍 Account Explorer
            <button 
              onClick={() => { setSearchQuery(''); fetchAccounts(); }} 
              className="text-xs font-mono text-slate-500 hover:text-sky-400 transition"
              title="Reset List"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Lookup ledger directories by customer metadata profiles.
          </p>

          {/* Search Bar Input */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search ACC-XXXX, names, contact numbers..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-sans text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition"
                id="search-input"
              />
            </div>

            {/* Quick Filter buttons */}
            <div className="flex gap-1 flex-wrap">
              <button 
                onClick={() => handleSearch('ACC')}
                className="px-2 py-1 bg-slate-900/60 hover:bg-slate-900 border border-slate-900 text-[10px] font-mono rounded text-slate-400 hover:text-sky-400"
              >
                # Accounts
              </button>
              <button 
                onClick={() => handleSearch('Suspicious')}
                className="px-2 py-1 bg-amber-950/10 hover:bg-amber-950/20 border border-amber-950/30 text-[10px] font-mono rounded text-amber-500"
              >
                🚨 Suspicious
              </button>
              <button 
                onClick={() => handleSearch('Critical')}
                className="px-2 py-1 bg-rose-950/10 hover:bg-rose-950/20 border border-rose-950/30 text-[10px] font-mono rounded text-rose-400"
              >
                ⚠️ Critical risk
              </button>
            </div>
          </div>

          {/* Accounts list container */}
          <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1">
            {isLoading ? (
              <div className="py-8 text-center text-xs font-mono text-slate-600">
                <span className="inline-block animate-spin mr-2">⏳</span> querying database index...
              </div>
            ) : accounts.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-slate-600">
                No matching accounts in ML registries.
              </div>
            ) : (
              accounts.map((acc) => {
                const isSelected = selectedAccount?.id === acc.id;
                return (
                  <button
                    key={acc.id}
                    id={`acc-select-${acc.id}`}
                    onClick={() => setSelectedAccount(acc)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer
                      ${isSelected 
                        ? 'bg-slate-900/80 border-sky-500/50 shadow-md shadow-sky-500/5' 
                        : 'bg-slate-950/60 border-slate-900/80 hover:border-slate-800'
                      }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-sky-400">
                          {acc.id}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 truncate">
                          {acc.createdAt}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-200 truncate mt-1">
                        {acc.holderName}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        Bal: ${acc.balance.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right flex flex-col items-end shrink-0 ml-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-mono font-bold ${getRiskColor(acc.riskCategory)}`}>
                        Score: {acc.riskScore}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 mt-1">
                        {acc.connectionsCount} nodes
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </GlassCard>
      </div>

      {/* Right pane / Detailed View: 2 columns */}
      <div className="lg:col-span-2 space-y-6">
        {selectedAccount ? (
          <>
            {/* Account Profile Details Header */}
            <GlassCard glowColor={selectedAccount.riskCategory === 'Critical' ? 'rose' : selectedAccount.riskCategory === 'High' ? 'orange' : 'slate'} id="account-detail-header">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-base text-slate-100 leading-snug">
                      {selectedAccount.holderName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[11px] font-mono text-slate-500">Account ID: {selectedAccount.id}</span>
                      <span className="text-slate-700 font-mono text-[11px]">•</span>
                      <span className="text-[11px] font-mono text-slate-500">Cust ID: {selectedAccount.customerId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="p-3 bg-slate-900/60 border border-slate-900 rounded-lg text-right">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Risk Score</span>
                    <span className={`text-sm font-bold font-sans ${selectedAccount.riskCategory === 'Critical' ? 'text-rose-500' : 'text-orange-500'}`}>
                      {selectedAccount.riskScore}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/60 border border-slate-900 rounded-lg text-right">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Category</span>
                    <span className={`text-sm font-bold font-sans uppercase ${getRiskColor(selectedAccount.riskCategory).split(' ')[0]}`}>
                      {selectedAccount.riskCategory}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid with contacts info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-900 mt-5 pt-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] font-mono uppercase">Primary Contact</span>
                  <div className="flex items-center gap-1.5 text-slate-200 mt-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedAccount.phoneNumber}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-mono uppercase">Email Address</span>
                  <div className="flex items-center gap-1.5 text-slate-200 mt-1 truncate">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{selectedAccount.email}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-mono uppercase">Total Balance</span>
                  <div className="flex items-center gap-1 mt-1 text-emerald-400 font-bold">
                    <DollarSign className="w-4 h-4" />
                    <span>{selectedAccount.balance.toLocaleString()} {selectedAccount.currency}</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Split layout: Transactions list vs Notebook logs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left detail column: Transactions logs */}
              <GlassCard glowColor="slate" className="md:h-[380px] flex flex-col justify-between">
                <div className="flex-1 overflow-hidden flex flex-col">
                  <h4 className="font-sans font-bold text-xs text-slate-100 tracking-tight flex items-center gap-1.5 mb-1 bg-slate-950/10">
                    <Activity className="w-4 h-4 text-sky-400" />
                    Transaction Logs ({transactions.length})
                  </h4>
                  <p className="text-[10px] text-slate-500 mb-3">
                    Recent inward and outward cash sweeps.
                  </p>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {transactions.length === 0 ? (
                      <div className="py-20 text-center text-xs font-mono text-slate-600">
                        No transactions registered for this account.
                      </div>
                    ) : (
                      transactions.map((txn) => {
                        const isRed = txn.riskScore >= 70;
                        return (
                          <div 
                            key={txn.id} 
                            className="bg-slate-900/40 border border-slate-900/60 p-2.5 rounded-lg flex justify-between items-center"
                          >
                            <div className="min-w-0">
                              <p className="font-mono text-[9px] text-slate-500">{txn.id} • {txn.timestamp.slice(11, 16)}</p>
                              <p className="text-xs font-semibold text-slate-200 truncate mt-0.5">{txn.description}</p>
                              <span className="text-[9px] font-mono text-slate-500 block">IP: {txn.location}</span>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <p className="text-xs font-bold text-slate-100 font-mono">${txn.amount.toLocaleString()}</p>
                              <span className={`text-[8px] font-mono px-1 rounded-sm border uppercase
                                ${isRed ? 'border-rose-500/20 text-rose-400 bg-rose-500/5' : 'border-emerald-500/10 text-emerald-400 bg-emerald-500/5'}`}>
                                Risk: {txn.riskScore}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </GlassCard>

              {/* Right detail column: Notebook logs */}
              <GlassCard glowColor="slate" className="md:h-[380px] flex flex-col justify-between" id="investigator-notes-card">
                <div className="flex-1 overflow-hidden flex flex-col">
                  <h4 className="font-sans font-bold text-xs text-slate-100 tracking-tight flex items-center gap-1.5 mb-1">
                    <UserCheck className="w-4 h-4 text-sky-400" />
                    Investigation Logs
                  </h4>
                  <p className="text-[10px] text-slate-500 mb-3">
                    Submit compliance notes, evidence attachments, and audit summaries.
                  </p>

                  {/* Text-input box with submission capability */}
                  <form onSubmit={handleAddNote} className="mb-3">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Type investigator memo log here..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-3 pr-10 py-2 text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition"
                      />
                      <button 
                        type="submit" 
                        className="absolute right-1.5 top-1.5 text-sky-500 hover:text-sky-400 transition cursor-pointer p-1 rounded hover:bg-slate-800"
                        title="Add Note"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>

                  {/* Notebook feed list */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-[11px] font-mono text-slate-300">
                    {selectedAccount.notes.map((note, index) => {
                      const splitted = note.split(']');
                      const hasDate = splitted.length > 1;
                      const datePart = hasDate ? splitted[0] + ']' : '';
                      const contentPart = hasDate ? splitted.slice(1).join(']') : note;
                      
                      return (
                        <div key={index} className="p-2.5 bg-slate-900/60 border border-slate-900 rounded-lg leading-relaxed">
                          {datePart && (
                            <span className="text-sky-500/80 mr-1.5 font-bold block mb-0.5 text-[9px] uppercase">
                              {datePart}
                            </span>
                          )}
                          <p className="text-slate-300">{contentPart.trim()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Simulated Network Cluster display inside details */}
            <GlassCard glowColor="indigo">
              <h4 className="font-sans font-bold text-xs text-slate-100 tracking-tight flex items-center justify-between mb-1">
                <span>Account Network Connection Topology</span>
                <span className="text-[10px] font-mono text-indigo-400">ACTIVE DETECTIONS</span>
              </h4>
              <p className="text-[10px] text-slate-500 mb-4">
                Estimated entity connections linked by shared transaction device signatures, location, or direct cash sweeps.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-lg flex items-center gap-3">
                  <div className="bg-rose-500/10 p-2 rounded border border-rose-500/20 text-rose-400 shrink-0">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Host Signatures</span>
                    <span className="text-xs font-bold text-slate-300">3 Flagged Emulators</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-lg flex items-center gap-3">
                  <div className="bg-sky-500/10 p-2 rounded border border-sky-500/20 text-sky-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Ip Coordinates</span>
                    <span className="text-xs font-bold text-slate-300">Moscow, Lagos, Kiev</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-lg flex items-center gap-3">
                  <div className="bg-amber-500/10 p-2 rounded border border-amber-500/20 text-amber-400 shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Connected Entities</span>
                    <span className="text-xs font-bold text-slate-300">{selectedAccount.connectionsCount} Linked Accounts</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </>
        ) : (
          <div className="h-96 flex items-center justify-center border border-slate-900 bg-slate-950/40 rounded-xl">
            <span className="text-xs font-mono text-slate-600">Please select an account from the index to begin deep audit.</span>
          </div>
        )}
      </div>
    </div>
  );
}
