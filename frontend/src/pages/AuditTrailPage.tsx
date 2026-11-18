import React, { useState, useEffect } from 'react';
import {
  Link2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  RefreshCw,
  Hash,
  Clock,
  User as UserIcon,
  Layers,
  Lock
} from 'lucide-react';
import { AuditLog, AuditIntegrity } from '../types';
import { getAuditLogsApi, verifyAuditChainApi } from '../services/api';

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [integrity, setIntegrity] = useState<AuditIntegrity | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      const data = await getAuditLogsApi();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const result = await verifyAuditChainApi();
      setIntegrity(result);
    } catch (err) {
      console.error('Integrity check failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    handleVerify(); // Run initial integrity verification on mount
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.event_id.toLowerCase().includes(search.toLowerCase()) ||
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_id.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 rounded-lg border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold tracking-wide">
                Tamper-Evident SHA-256 Audit Trail (Simulated Hash Chain)
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Every regulatory state transition, inspection submission, and CAPA closure is cryptographically
              chained to the previous block hash: <code>Hash = SHA256(PrevHash + Timestamp + User + Action + Payload)</code>.
            </p>
          </div>

          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <ShieldCheck className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
            {verifying ? 'Scanning Hash Chain...' : 'Verify Ledger Integrity'}
          </button>
        </div>
      </div>

      {/* Cryptographic Integrity Verification Banner */}
      {integrity && (
        <div
          className={`p-4 rounded-lg border shadow-2xs flex items-start justify-between gap-4 ${
            integrity.is_valid
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-start gap-3">
            {integrity.is_valid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">
                {integrity.is_valid ? '100% Cryptographic Ledger Integrity Intact' : 'Ledger Tamper Detected!'}
              </h4>
              <p className="text-xs mt-0.5">{integrity.message}</p>
              <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] font-mono">
                <span>Verified Blocks: <b>{integrity.verified_events} / {integrity.total_events}</b></span>
                <span className="truncate max-w-md">
                  Latest Block Hash: <code className="bg-white/80 px-1 py-0.2 rounded border border-emerald-200">{integrity.last_block_hash}</code>
                </span>
              </div>
            </div>
          </div>
          <span className="text-[10px] bg-white px-2 py-1 rounded border border-emerald-300 font-bold uppercase shrink-0">
            SHA-256 Validated
          </span>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Event ID, User, Action, or Record ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">Event ID & Time</th>
                <th className="py-2.5 px-3 font-semibold">Operator</th>
                <th className="py-2.5 px-3 font-semibold">Action</th>
                <th className="py-2.5 px-3 font-semibold">Entity Ref</th>
                <th className="py-2.5 px-3 font-semibold max-w-sm">Event Description</th>
                <th className="py-2.5 px-3 font-semibold font-mono text-[11px]">Prev Block Hash</th>
                <th className="py-2.5 px-3 font-semibold font-mono text-[11px] text-right">Block Hash (SHA-256)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-slate-800 block">{l.event_id}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(l.timestamp).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-slate-400" />
                      {l.user}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-mono font-bold text-slate-900">{l.entity_id}</div>
                    <span className="text-[10px] text-slate-400">{l.entity_type}</span>
                  </td>
                  <td className="py-2.5 px-3 max-w-sm text-slate-700">
                    <p className="line-clamp-2 leading-relaxed">{l.description}</p>
                    {l.new_value && l.new_value !== 'VERIFIED' && (
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block truncate">
                        Delta: {l.new_value}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                    <span title={l.prev_hash}>{l.prev_hash.slice(0, 10)}...</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-700 text-right">
                    <span
                      title={l.hash}
                      className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-bold"
                    >
                      {l.hash.slice(0, 12)}...
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
