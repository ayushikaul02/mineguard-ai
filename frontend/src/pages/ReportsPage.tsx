import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowDownToLine,
  Eye
} from 'lucide-react';
import { Mine } from '../types';
import { getMinesApi, getReportExportUrl } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [mines, setMines] = useState<Mine[]>([]);
  const [reportType, setReportType] = useState('compliance');
  const [selectedMine, setSelectedMine] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    getMinesApi().then(setMines).catch(console.error);
  }, []);

  const reportTypes = [
    { id: 'compliance', name: 'Mine Multi-Domain Compliance Report', desc: 'Statutory compliance registers across Safety, Environment, Production & Labour.' },
    { id: 'violations', name: 'Safety & Environmental Violation Dossier', desc: 'Active and resolved violations with AI risk weights, recurrence counts & escalation.' },
    { id: 'corrective_actions', name: 'Corrective Actions (CAPA) Status Report', desc: 'Closed-loop mitigation cases, due date tracking, overdue alerts & verification logs.' },
    { id: 'contractors', name: 'Contractor Statutory Performance Report', desc: 'Worker roll counts, safety records, and vocational training compliance audits.' },
    { id: 'mines', name: 'Executive Monthly Governance Report', desc: 'Enterprise overview of all 4 leaseholds, production ceilings, and compliance metrics.' }
  ];

  const handleDownload = (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    const url = getReportExportUrl(
      format,
      reportType,
      selectedMine ? Number(selectedMine) : undefined,
      selectedDomain || undefined
    );
    window.open(url, '_blank');
    setTimeout(() => setIsExporting(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-amber-500" />
          Statutory Reporting & Governance Exports
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate audit-ready CSV datasets and ReportLab formatted statutory PDF dossiers for DGMS & EPA submissions.
        </p>
      </div>

      {/* Configuration & Filter Panel */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          1. Select Statutory Report Type
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportTypes.map((r) => (
            <div
              key={r.id}
              onClick={() => setReportType(r.id)}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                reportType === r.id
                  ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">{r.name}</span>
                {reportType === r.id && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>

        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pt-2">
          2. Apply Scope & Leasehold Filters
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mine Filter</label>
            <select
              value={selectedMine}
              onChange={(e) => setSelectedMine(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
            >
              <option value="">All Mines (Enterprise Consolidated)</option>
              {mines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Domain Scope</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
            >
              <option value="">All Domains</option>
              <option value="Safety">Safety Domain</option>
              <option value="Environment">Environment Domain</option>
              <option value="Production">Production Domain</option>
              <option value="Labour">Labour Domain</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Audit Protocol</label>
            <div className="px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-slate-100 text-slate-600 font-mono">
              CMR 2017 &bull; SHA-256 Validated
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={() => handleDownload('csv')}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Download Spreadsheet (CSV)
          </button>

          <button
            onClick={() => handleDownload('pdf')}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-white" />
            Download Statutory PDF Dossier
          </button>
        </div>
      </div>

      {/* Preview Info Box */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600">
        <h5 className="font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Statutory Export Certification
        </h5>
        <p className="text-[11px] leading-relaxed">
          All generated dossiers are compiled dynamically from active SQLite records and include cryptographic
          SHA-256 hash chaining timestamps for regulatory validation during statutory inspection by DGMS and state pollution boards.
        </p>
      </div>
    </div>
  );
};
