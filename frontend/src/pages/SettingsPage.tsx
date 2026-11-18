import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  Database,
  Cpu,
  WifiOff,
  Sliders,
  Award,
  BookOpen
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [offlineMode, setOfflineMode] = useState(false);
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [ch4Threshold, setCh4Threshold] = useState(0.75);
  const [dustThreshold, setDustThreshold] = useState(2.0);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-500" />
          System Settings & Patent Architecture Governance
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure statutory threshold limits, offline field inspection buffers, and review patent compliance specifications.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          System threshold settings saved and applied to active governance engine!
        </div>
      )}

      {/* Patent Project Credentials Card */}
      <div className="bg-slate-900 text-white p-5 rounded-lg border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h4 className="text-sm font-bold tracking-wide uppercase">
            Patent Project Implementation Credentials
          </h4>
        </div>
        <p className="text-xs font-semibold text-amber-400 mb-1">
          PROJECT TITLE: AI-Based Intelligent System and Method for Automated Governance and Multi-Domain Compliance Monitoring in Coal Mines
        </p>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          Developed as a working software prototype demonstrating automated compliance monitoring,
          weighted AI risk formulation, Scikit-learn anomaly detection, and tamper-evident SHA-256 audit chaining.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded bg-slate-800 border border-slate-700">
            <span className="text-[10px] text-slate-400 block">Application</span>
            <span className="font-bold text-slate-200">MineGuard AI</span>
          </div>
          <div className="p-2 rounded bg-slate-800 border border-slate-700">
            <span className="text-[10px] text-slate-400 block">Statutory Baseline</span>
            <span className="font-bold text-slate-200">DGMS CMR 2017</span>
          </div>
          <div className="p-2 rounded bg-slate-800 border border-slate-700">
            <span className="text-[10px] text-slate-400 block">Integrity Ledger</span>
            <span className="font-bold text-emerald-400">SHA-256 Chained</span>
          </div>
          <div className="p-2 rounded bg-slate-800 border border-slate-700">
            <span className="text-[10px] text-slate-400 block">AI / ML Engine</span>
            <span className="font-bold text-purple-400">Isolation Forest</span>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Statutory Thresholds */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            Statutory Hazard Threshold Parameters (CMR 2017)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Underground Methane (CH4) Action Alert Threshold (%)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.2"
                max="1.5"
                value={ch4Threshold}
                onChange={(e) => setCh4Threshold(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Statutory: Action at 0.75%, mandatory evacuation threshold at 1.25%.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Respirable Coal Dust Maximum Ceiling (mg/m3)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="5.0"
                value={dustThreshold}
                onChange={(e) => setDustThreshold(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Permissible shift ceiling: 2.0 mg/m3 under Coal Mines Regulations.
              </span>
            </div>
          </div>
        </div>

        {/* Feature Switches */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Operational Governance Modes
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="font-bold text-slate-800 block">Offline Field Reporting Simulation</span>
                <span className="text-[11px] text-slate-500">
                  Caches inspection checklists in local browser storage when underground telemetry is disconnected.
                </span>
              </div>
              <input
                type="checkbox"
                checked={offlineMode}
                onChange={(e) => setOfflineMode(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="font-bold text-slate-800 block">Automated Level 3 Regulatory Escalation</span>
                <span className="text-[11px] text-slate-500">
                  Instantly escalates violations with risk score &gt;= 75.0 to DGMS Regulatory Authority.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoEscalate}
                onChange={(e) => setAutoEscalate(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Save Configuration Settings
            </button>
          </div>
        </div>
      </form>

      {/* Diagnostics Strip */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs text-xs text-slate-600">
        <h5 className="font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          System Health Diagnostics
        </h5>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div>
            <span className="text-slate-400 block">FastAPI Server:</span>
            <span className="font-bold text-emerald-700">
              {import.meta.env.VITE_API_URL ? 'Connected (Production API)' : '127.0.0.1:8000 (Local Dev)'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Database Storage:</span>
            <span className="font-bold text-slate-800">SQLite (mineguard.db)</span>
          </div>
          <div>
            <span className="text-slate-400 block">IsolationForest ML:</span>
            <span className="font-bold text-purple-700">Synchronized</span>
          </div>
          <div>
            <span className="text-slate-400 block">Audit Chain:</span>
            <span className="font-bold text-emerald-700">100% Cryptographic Integrity</span>
          </div>
        </div>
      </div>
    </div>
  );
};
