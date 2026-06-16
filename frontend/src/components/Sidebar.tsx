import React from 'react';
import { 
  LayoutDashboard, 
  UserSearch, 
  ShieldAlert, 
  Network, 
  BrainCircuit, 
  LineChart, 
  Radio, 
  Gauge, 
  ShieldCheck 
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  liveAlertCount: number;
}

export default function Sidebar({ currentPage, setCurrentPage, liveAlertCount }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, badge: 0 },
    { id: 'investigation', label: 'Investigation Center', icon: UserSearch, badge: 0 },
    { id: 'alerts', label: 'Alert Management', icon: ShieldAlert, badge: liveAlertCount },
    { id: 'network', label: 'Network Analysis', icon: Network, badge: 0, tag: 'PRO' },
    { id: 'explainability', label: 'AI Explainability', icon: BrainCircuit, badge: 0 },
    { id: 'model', label: 'Model Monitoring', icon: LineChart, badge: 0 },
    { id: 'realtime', label: 'Real-Time Stream', icon: Radio, badge: 1, isLive: true },
    { id: 'simulator', label: 'Risk Simulator', icon: Gauge, badge: 0 },
  ];

  return (
    <aside 
      id="sidebar-container" 
      className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen overflow-y-auto shrink-0 select-none"
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800">
        <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-slate-200" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-lg text-slate-100 tracking-tight">
            Darvya
          </h1>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
            Compliance Engine
          </span>
        </div>
      </div>

      {/* System Status Badge */}
      <div className="mx-4 my-4 p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-sans font-bold text-emerald-500 tracking-wide">
              SYSTEM ONLINE
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans mt-0.5">
            US-EAST-01 • Active
          </p>
        </div>
      </div>

      {/* Navigation Options */}
      <nav className="flex-1 px-3 space-y-1 py-2">
        <span className="px-4 py-1 text-[10px] font-sans font-semibold tracking-wider text-slate-500 uppercase block">
          Operations Command
        </span>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer text-left group
                ${isActive 
                  ? 'bg-slate-800 border-l-2 border-slate-400 text-slate-100 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors duration-150
                  ${isActive ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-200'}`} 
                />
                <span className="font-sans">{item.label}</span>
              </div>

              {/* Status Tags / Badges */}
              {item.isLive && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                </span>
              )}
              {item.badge > 0 && !item.isLive && (
                <span className={`px-1.5 py-0.5 text-[9px] font-sans leading-none rounded-sm font-semibold
                  ${item.id === 'alerts' 
                    ? 'bg-rose-950 text-rose-400 border border-rose-800' 
                    : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {item.tag && (
                <span className="px-1 py-0.2 text-[8px] font-sans bg-slate-800 text-slate-500 border border-slate-700 rounded-sm font-semibold">
                  {item.tag}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-sans text-slate-500 tracking-wider font-bold">
            SYSTEM STATUS
          </span>
        </div>
        <div className="text-[9px] font-sans text-slate-600">
          Engine Version: 1.0.0
        </div>
      </div>
    </aside>
  );
}
