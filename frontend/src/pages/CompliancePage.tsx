import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Edit2,
  FileSpreadsheet
} from 'lucide-react';
import { ComplianceRecord, Mine } from '../types';
import {
  getComplianceRecordsApi,
  createComplianceRecordApi,
  updateComplianceRecordApi,
  getMinesApi
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CompliancePage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeDomain, setActiveDomain] = useState<string>('All');
  const [selectedMine, setSelectedMine] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<ComplianceRecord | null>(null);
  const [editRecord, setEditRecord] = useState<ComplianceRecord | null>(null);

  // Form State
  const [formMineId, setFormMineId] = useState<number>(1);
  const [formDomain, setFormDomain] = useState<'Safety' | 'Environment' | 'Production' | 'Labour'>('Safety');
  const [formRequirement, setFormRequirement] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formInspectionDate, setFormInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [formResponsible, setFormResponsible] = useState('');
  const [formStatus, setFormStatus] = useState<'Compliant' | 'Partially Compliant' | 'Non-Compliant' | 'Pending Verification'>('Pending Verification');
  const [formSeverity, setFormSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [formEvidence, setFormEvidence] = useState('');

  const fetchRecords = async () => {
    try {
      const params: any = {};
      if (activeDomain !== 'All') params.domain = activeDomain;
      if (selectedMine) params.mine_id = Number(selectedMine);
      if (selectedStatus) params.status = selectedStatus;
      if (selectedSeverity) params.severity = selectedSeverity;
      if (search) params.search = search;

      const data = await getComplianceRecordsApi(params);
      setRecords(data);
    } catch (err) {
      console.error('Failed to load compliance records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [activeDomain, selectedMine, selectedStatus, selectedSeverity, search]);

  useEffect(() => {
    getMinesApi().then(setMines).catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createComplianceRecordApi({
        mine_id: formMineId,
        domain: formDomain,
        requirement: formRequirement,
        description: formDescription,
        inspection_date: formInspectionDate,
        due_date: formDueDate,
        responsible_person: formResponsible,
        status: formStatus,
        severity: formSeverity,
        evidence: formEvidence
      });
      setShowCreateModal(false);
      // Reset
      setFormRequirement('');
      setFormDescription('');
      setFormResponsible('');
      setFormEvidence('');
      fetchRecords();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create record');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;
    try {
      await updateComplianceRecordApi(editRecord.id, {
        status: editRecord.status,
        severity: editRecord.severity,
        evidence: editRecord.evidence,
        corrective_action: editRecord.corrective_action
      });
      setEditRecord(null);
      fetchRecords();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update record');
    }
  };

  const domains = ['All', 'Safety', 'Environment', 'Production', 'Labour'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Compliant':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'Partially Compliant':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'Non-Compliant':
        return 'bg-red-50 text-red-700 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

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

  return (
    <div className="space-y-6">
      {/* 4 Domain Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 bg-white px-4 pt-2 rounded-t-lg shadow-2xs">
        {domains.map((dom) => (
          <button
            key={dom}
            onClick={() => setActiveDomain(dom)}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeDomain === dom
                ? 'border-amber-500 text-slate-900 bg-amber-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {dom === 'All' ? 'All Governance Domains' : `${dom} Compliance`}
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requirement, ID, or person..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Mine Filter */}
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

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="Compliant">Compliant</option>
            <option value="Partially Compliant">Partially Compliant</option>
            <option value="Non-Compliant">Non-Compliant</option>
            <option value="Pending Verification">Pending Verification</option>
          </select>

          {/* Severity Filter */}
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
        </div>

        {user?.role !== 'auditor' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Statutory Record
          </button>
        )}
      </div>

      {/* Compliance Records Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">Record ID</th>
                <th className="py-2.5 px-3 font-semibold">Mine & Domain</th>
                <th className="py-2.5 px-3 font-semibold max-w-xs">Statutory Requirement</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Severity</th>
                <th className="py-2.5 px-3 font-semibold">Risk Engine Score</th>
                <th className="py-2.5 px-3 font-semibold">Timeline</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No compliance records found matching current query.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{r.record_id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{r.mine_name || `Mine #${r.mine_id}`}</div>
                      <span className="text-[10px] text-slate-500 font-medium">{r.domain}</span>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs">
                      <p className="font-medium text-slate-800 line-clamp-1">{r.requirement}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{r.description}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getStatusBadge(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-700">{r.severity}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${getRiskBadge(r.risk_category)}`}>
                          {r.risk_category}
                        </span>
                        <span className="font-mono font-bold text-slate-800">{r.risk_score?.toFixed(0)}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[11px]">
                      <div>Due: <span className="font-semibold text-slate-700">{r.due_date}</span></div>
                      <div className="text-slate-400">Insp: {r.inspection_date}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setShowViewModal(r)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {user?.role !== 'auditor' && (
                          <button
                            onClick={() => setEditRecord(r)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer"
                            title="Edit Status / Severity"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Statutory Compliance Requirement</h3>
            <p className="text-xs text-slate-500 mb-4">
              Defines a statutory checkpoint under CMR 2017 & DGMS monitoring.
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
                    onChange={(e) => setFormDomain(e.target.value as any)}
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
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Statutory Requirement</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Methane Gas Probing & Telemetry Calibration"
                  value={formRequirement}
                  onChange={(e) => setFormRequirement(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Specify statutory procedure, frequencies, and standards..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Inspection Date</label>
                  <input
                    type="date"
                    required
                    value={formInspectionDate}
                    onChange={(e) => setFormInspectionDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Responsible Officer</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. R. Sharma"
                    value={formResponsible}
                    onChange={(e) => setFormResponsible(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  >
                    <option value="Compliant">Compliant</option>
                    <option value="Partially Compliant">Partially Compliant</option>
                    <option value="Non-Compliant">Non-Compliant</option>
                    <option value="Pending Verification">Pending Verification</option>
                  </select>
                </div>
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
                  Submit & Calculate AI Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Update Compliance: {editRecord.record_id}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{editRecord.requirement}</p>

            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Compliance Status</label>
                <select
                  value={editRecord.status}
                  onChange={(e) => setEditRecord({ ...editRecord, status: e.target.value as any })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                >
                  <option value="Compliant">Compliant</option>
                  <option value="Partially Compliant">Partially Compliant</option>
                  <option value="Non-Compliant">Non-Compliant</option>
                  <option value="Pending Verification">Pending Verification</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Severity Tier</label>
                <select
                  value={editRecord.severity}
                  onChange={(e) => setEditRecord({ ...editRecord, severity: e.target.value as any })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Corrective Action Note</label>
                <textarea
                  rows={2}
                  value={editRecord.corrective_action || ''}
                  onChange={(e) => setEditRecord({ ...editRecord, corrective_action: e.target.value })}
                  placeholder="Statutory corrective measures deployed..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditRecord(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded-md shadow-xs cursor-pointer"
                >
                  Save & Append to Hash Chain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-amber-600">{showViewModal.record_id}</span>
                <h3 className="text-base font-bold text-slate-900">{showViewModal.requirement}</h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getStatusBadge(showViewModal.status)}`}>
                {showViewModal.status}
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">Description:</span>
                <p className="bg-slate-50 p-2.5 rounded-md border border-slate-200 leading-relaxed">
                  {showViewModal.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-400 font-medium block">Mine:</span>
                  <span className="font-bold text-slate-800">{showViewModal.mine_name || `Mine #${showViewModal.mine_id}`}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-400 font-medium block">Domain:</span>
                  <span className="font-bold text-slate-800">{showViewModal.domain}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-400 font-medium block">Responsible:</span>
                  <span className="font-semibold text-slate-800">{showViewModal.responsible_person}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-400 font-medium block">Due Date:</span>
                  <span className="font-semibold text-slate-800">{showViewModal.due_date}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-400 font-medium block">Risk Score:</span>
                  <span className="font-black text-red-600">{showViewModal.risk_score?.toFixed(0)} ({showViewModal.risk_category})</span>
                </div>
              </div>

              {showViewModal.corrective_action && (
                <div>
                  <span className="font-semibold text-slate-500 block mb-0.5">Corrective Action:</span>
                  <p className="bg-amber-50/60 p-2.5 rounded-md border border-amber-200 text-amber-900">
                    {showViewModal.corrective_action}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setShowViewModal(null)}
                className="px-4 py-1.5 text-xs bg-slate-900 text-white font-bold rounded-md cursor-pointer hover:bg-slate-800"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
