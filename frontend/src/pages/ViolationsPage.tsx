import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  ShieldAlert,
  Flame,
  ArrowUpRight,
  Eye,
  CheckCircle2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Violation, Mine } from '../types';
import {
  getViolationsApi,
  createViolationApi,
  updateViolationApi,
  getMinesApi
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ViolationsPage: React.FC = () => {
  const { user } = useAuth();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedMine, setSelectedMine] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);

  // Form State
  const [formMineId, setFormMineId] = useState<number>(1);
  const [formDomain, setFormDomain] = useState('Safety');
  const [formLocation, setFormLocation] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSeverity, setFormSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [formLikelihood, setFormLikelihood] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [formRecurrence, setFormRecurrence] = useState(1);

  const fetchViolations = async () => {
    try {
      const params: any = {};
      if (selectedDomain) params.domain = selectedDomain;
      if (selectedMine) params.mine_id = Number(selectedMine);
      if (selectedSeverity) params.severity = selectedSeverity;
      if (selectedStatus) params.status = selectedStatus;

      const data = await getViolationsApi(params);
      setViolations(data);
    } catch (err) {
      console.error('Failed to load violations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
    getMinesApi().then(setMines).catch(console.error);
  }, [selectedDomain, selectedMine, selectedSeverity, selectedStatus]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createViolationApi({
        mine_id: formMineId,
        domain: formDomain,
        location: formLocation,
        title: formTitle,
        description: formDescription,
        severity: formSeverity,
        likelihood: formLikelihood,
        recurrence_count: Number(formRecurrence),
        reported_by: user?.full_name || user?.username || 'Field Inspector'
      });
      setShowCreateModal(false);
      // Reset
      setFormTitle('');
      setFormLocation('');
      setFormDescription('');
      fetchViolations();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create violation');
    }
  };

  const handleStatusChange = async (violationId: number, newStatus: string, newEscalation?: string) => {
    try {
      const payload: any = { status: newStatus };
      if (newEscalation) payload.escalation_level = newEscalation;
      await updateViolationApi(violationId, payload);
      fetchViolations();
      if (selectedViolation && selectedViolation.id === violationId) {
        setSelectedViolation({
          ...selectedViolation,
          status: newStatus as any,
          escalation_level: newEscalation || selectedViolation.escalation_level
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update violation status');
    }
  };

  const filteredViolations = violations.filter(
    (v) =>
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.violation_id.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase())
  );

  const getRiskBadge = (category: string) => {
    switch (category) {
      case 'CRITICAL':
        return 'bg-red-600 text-white font-black';
      case 'HIGH':
        return 'bg-amber-500 text-white font-bold';
      case 'MEDIUM':
        return 'bg-yellow-500 text-slate-950 font-bold';
      default:
        return 'bg-emerald-600 text-white font-medium';
    }
  };

  const getEscalationBadge = (level: string) => {
    if (level.includes('Level 3')) {
      return 'bg-red-100 text-red-800 border-red-300 font-bold';
    }
    if (level.includes('Level 2')) {
      return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <h3 className="text-base font-bold text-slate-900">Statutory Violation Management</h3>
          <p className="text-xs text-slate-500">
            Multi-domain hazard tracking with AI-calculated risk weights and statutory escalation pathways.
          </p>
        </div>

        {user?.role !== 'auditor' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Report Statutory Breach
          </button>
        )}
      </div>

      {/* Filter Strip */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, ID, or location..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700"
        >
          <option value="">All Domains</option>
          <option value="Safety">Safety</option>
          <option value="Environment">Environment</option>
          <option value="Production">Production</option>
          <option value="Labour">Labour</option>
        </select>

        <select
          value={selectedMine}
          onChange={(e) => setSelectedMine(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700"
        >
          <option value="">All Mines</option>
          {mines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700"
        >
          <option value="">All Severities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Action Assigned">Action Assigned</option>
          <option value="Escalated">Escalated</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Violations Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">Violation ID</th>
                <th className="py-2.5 px-3 font-semibold">Mine & Domain</th>
                <th className="py-2.5 px-3 font-semibold max-w-xs">Hazard Title & Location</th>
                <th className="py-2.5 px-3 font-semibold text-center">Recurrence</th>
                <th className="py-2.5 px-3 font-semibold text-center">AI Risk Score</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Escalation Pathway</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredViolations.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{v.violation_id}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{v.mine_name || `Mine #${v.mine_id}`}</div>
                    <span className="text-[10px] text-slate-500 font-medium">{v.domain}</span>
                  </td>
                  <td className="py-2.5 px-3 max-w-xs">
                    <p className="font-semibold text-slate-900 line-clamp-1">{v.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{v.location}</p>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {v.recurrence_count}x
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${getRiskBadge(v.risk_category)}`}>
                        {v.risk_category}
                      </span>
                      <span className="font-mono font-bold text-slate-800">{v.risk_score?.toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        v.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : v.status === 'Escalated'
                          ? 'bg-red-50 text-red-700 border-red-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${getEscalationBadge(v.escalation_level)}`}>
                      {v.escalation_level}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedViolation(v)}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      Risk Analysis
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Analysis Detail Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-amber-600">{selectedViolation.violation_id}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedViolation.title}</h3>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded font-black ${getRiskBadge(selectedViolation.risk_category)}`}>
                Score: {selectedViolation.risk_score?.toFixed(1)}/100
              </span>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">Hazard Description:</span>
                <p className="bg-slate-50 p-2.5 rounded-md border border-slate-200 leading-relaxed">
                  {selectedViolation.description}
                </p>
              </div>

              {/* Patent Risk Formula Breakdown */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-600" />
                    AI Risk Engine Factor Contributions
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">Weight: 100% Normalized</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600">Severity Factor ({selectedViolation.severity}):</span>
                    <span className="font-mono font-bold text-slate-800">30% Max Weight</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600">Likelihood Factor ({selectedViolation.likelihood}):</span>
                    <span className="font-mono font-bold text-slate-800">25% Max Weight</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600">Recurrence Frequency ({selectedViolation.recurrence_count}x repeat):</span>
                    <span className="font-mono font-bold text-slate-800">15% Max Weight</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600">Timeline Overdue Factor:</span>
                    <span className="font-mono font-bold text-slate-800">15% Max Weight</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600">Location Risk History / Hotspot:</span>
                    <span className="font-mono font-bold text-slate-800">15% Max Weight</span>
                  </div>
                </div>
              </div>

              {/* Escalation Control Buttons */}
              {user?.role !== 'auditor' && (
                <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200">
                  <span className="font-bold text-amber-900 block mb-2">Statutory Status Transitions:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedViolation.status !== 'Resolved' && (
                      <button
                        onClick={() => handleStatusChange(selectedViolation.id, 'Resolved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Violation Resolved
                      </button>
                    )}

                    {selectedViolation.status !== 'Escalated' && (
                      <button
                        onClick={() =>
                          handleStatusChange(
                            selectedViolation.id,
                            'Escalated',
                            'Level 3 - Regulatory Authority'
                          )
                        }
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Escalate to DGMS Level 3
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setSelectedViolation(null)}
                className="px-4 py-1.5 text-xs bg-slate-900 text-white font-bold rounded-md cursor-pointer hover:bg-slate-800"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Report Violation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Log Statutory Mine Violation</h3>
            <p className="text-xs text-slate-500 mb-4">
              Triggers the AI risk scoring engine, generates automated CAPA, and appends to hash chain.
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mine</label>
                  <select
                    value={formMineId}
                    onChange={(e) => setFormMineId(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  >
                    {mines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Domain</label>
                  <select
                    value={formDomain}
                    onChange={(e) => setFormDomain(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  >
                    <option value="Safety">Safety</option>
                    <option value="Environment">Environment</option>
                    <option value="Production">Production</option>
                    <option value="Labour">Labour</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Hazard Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inadequate Hydraulic Setting Pressure on Longwall Face"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Specific Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seam 4 Gallery B-East"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Description & Evidence</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe non-compliance, statutory rule breach, and immediate hazards..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Likelihood</label>
                  <select
                    value={formLikelihood}
                    onChange={(e) => setFormLikelihood(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Recurrence Count</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formRecurrence}
                    onChange={(e) => setFormRecurrence(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded-md shadow-xs cursor-pointer"
                >
                  Calculate Risk & Log Violation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
