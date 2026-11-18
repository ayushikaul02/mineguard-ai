import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Upload,
  CheckCircle,
  RotateCcw,
  Eye,
  FileCheck,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { CorrectiveAction, Mine } from '../types';
import {
  getCorrectiveActionsApi,
  transitionCorrectiveActionApi,
  getMinesApi
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CorrectiveActionsPage: React.FC = () => {
  const { user } = useAuth();
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedMine, setSelectedMine] = useState('');

  // Modals
  const [evidenceModalAction, setEvidenceModalAction] = useState<CorrectiveAction | null>(null);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  const [verifyModalAction, setVerifyModalAction] = useState<CorrectiveAction | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isRejectReopen, setIsRejectReopen] = useState(false);

  const [viewAction, setViewAction] = useState<CorrectiveAction | null>(null);

  const fetchActions = async () => {
    try {
      const params: any = {};
      if (selectedStatus) params.status = selectedStatus;
      if (selectedPriority) params.priority = selectedPriority;
      if (selectedMine) params.mine_id = Number(selectedMine);

      const data = await getCorrectiveActionsApi(params);
      setActions(data);
    } catch (err) {
      console.error('Failed to load CAPA cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
    getMinesApi().then(setMines).catch(console.error);
  }, [selectedStatus, selectedPriority, selectedMine]);

  const handleTransition = async (actionId: number, targetStatus: string, payload: any = {}) => {
    try {
      await transitionCorrectiveActionApi(actionId, {
        status: targetStatus,
        ...payload
      });
      fetchActions();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update action');
    }
  };

  const submitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceModalAction) return;
    await handleTransition(evidenceModalAction.id, 'Awaiting Verification', {
      completion_evidence: evidenceNotes,
      evidence_url: evidenceUrl || '/uploads/sample_rectification_cert.pdf'
    });
    setEvidenceModalAction(null);
    setEvidenceNotes('');
    setEvidenceUrl('');
  };

  const submitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyModalAction) return;
    const targetStatus = isRejectReopen ? 'Reopened' : 'Closed';
    await handleTransition(verifyModalAction.id, targetStatus, {
      verification_notes: verificationNotes,
      verified_by: user?.full_name || user?.username
    });
    setVerifyModalAction(null);
    setVerificationNotes('');
    setIsRejectReopen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
      case 'Awaiting Verification':
        return 'bg-blue-50 text-blue-700 border-blue-300 font-bold';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-300 font-bold';
      case 'Reopened':
        return 'bg-red-50 text-red-700 border-red-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-600 text-white font-black';
      case 'High':
        return 'bg-amber-500 text-white font-bold';
      case 'Medium':
        return 'bg-yellow-500 text-slate-950 font-bold';
      default:
        return 'bg-slate-200 text-slate-700 font-medium';
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Progress Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-lg border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Corrective Action Lifecycle (CAPA Protocol)
          </h3>
          <span className="text-[11px] text-amber-400 font-mono">DGMS CMR 2017 Closed-Loop System</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Step 1</span>
            <span className="font-bold text-slate-200">Violation Detected</span>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Step 2</span>
            <span className="font-bold text-slate-200">AI Risk Assessment</span>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Step 3</span>
            <span className="font-bold text-slate-200">Assigned to Officer</span>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Step 4</span>
            <span className="font-bold text-slate-200">Action & Evidence</span>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Step 5</span>
            <span className="font-bold text-slate-200">Manager Verification</span>
          </div>
          <div className="p-2 rounded bg-amber-500/20 border border-amber-500/40">
            <span className="text-[10px] text-amber-400 uppercase font-semibold block">Step 6</span>
            <span className="font-bold text-amber-300">Closed / Ledger Hash</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Awaiting Verification">Awaiting Verification</option>
          <option value="Closed">Closed</option>
          <option value="Reopened">Reopened</option>
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700"
        >
          <option value="">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
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
      </div>

      {/* CAPA Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">Case ID</th>
                <th className="py-2.5 px-3 font-semibold">Mine & Location</th>
                <th className="py-2.5 px-3 font-semibold max-w-xs">Mitigation Mandate</th>
                <th className="py-2.5 px-3 font-semibold">Priority</th>
                <th className="py-2.5 px-3 font-semibold">Assigned In-Charge</th>
                <th className="py-2.5 px-3 font-semibold">Due Timeline</th>
                <th className="py-2.5 px-3 font-semibold">Lifecycle Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Workflow Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {actions.map((ca) => (
                <tr
                  key={ca.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    ca.is_overdue ? 'bg-red-50/30' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{ca.case_id}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{ca.mine_name || `Mine #${ca.mine_id}`}</div>
                    <span className="text-[11px] text-slate-500 font-medium">{ca.location}</span>
                  </td>
                  <td className="py-2.5 px-3 max-w-xs font-medium text-slate-800 line-clamp-2">
                    {ca.description}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${getPriorityBadge(ca.priority)}`}>
                      {ca.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">{ca.assigned_person}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1 font-mono text-slate-800 font-semibold">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {ca.due_date}
                    </div>
                    {ca.is_overdue && (
                      <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5 mt-0.5 animate-pulse">
                        <Clock className="w-2.5 h-2.5" /> OVERDUE
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadge(ca.status)}`}>
                      {ca.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Workflow State Buttons */}
                      {ca.status === 'Assigned' && user?.role !== 'auditor' && (
                        <button
                          onClick={() => handleTransition(ca.id, 'In Progress')}
                          className="px-2.5 py-1 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          Start Action
                        </button>
                      )}

                      {ca.status === 'In Progress' && user?.role !== 'auditor' && (
                        <button
                          onClick={() => {
                            setEvidenceModalAction(ca);
                            setEvidenceNotes(ca.completion_evidence || '');
                          }}
                          className="px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Upload className="w-3 h-3" />
                          Submit Evidence
                        </button>
                      )}

                      {ca.status === 'Awaiting Verification' && (user?.role === 'manager' || user?.role === 'admin') && (
                        <button
                          onClick={() => {
                            setVerifyModalAction(ca);
                            setVerificationNotes('');
                            setIsRejectReopen(false);
                          }}
                          className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <FileCheck className="w-3 h-3" />
                          Verify & Close
                        </button>
                      )}

                      {ca.status === 'Closed' && (
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Closed
                        </span>
                      )}

                      <button
                        onClick={() => setViewAction(ca)}
                        className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer"
                        title="View Full Case"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Evidence Modal */}
      {evidenceModalAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Submit Remediation Evidence: {evidenceModalAction.case_id}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{evidenceModalAction.description}</p>

            <form onSubmit={submitEvidence} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Actions Taken & Engineering Verification
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail work performed, equipment replaced, pressure tests completed..."
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Evidence Document / Photo URL
                </label>
                <input
                  type="text"
                  placeholder="/uploads/repair_log_cert.pdf"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEvidenceModalAction(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-md shadow-xs cursor-pointer"
                >
                  Submit for Manager Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify & Close Modal */}
      {verifyModalAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Manager Verification: {verifyModalAction.case_id}
            </h3>
            <p className="text-xs text-slate-500 mb-3">{verifyModalAction.description}</p>

            {verifyModalAction.completion_evidence && (
              <div className="bg-blue-50/60 p-2.5 rounded border border-blue-200 text-xs mb-3">
                <span className="font-bold text-blue-900 block mb-0.5">Submitted Evidence:</span>
                <p className="text-blue-800">{verifyModalAction.completion_evidence}</p>
              </div>
            )}

            <form onSubmit={submitVerification} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Verification Audit Notes
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Record verification checklist, physical check details, or reason for reopening..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rejectCheck"
                  checked={isRejectReopen}
                  onChange={(e) => setIsRejectReopen(e.target.checked)}
                  className="rounded text-red-600 cursor-pointer"
                />
                <label htmlFor="rejectCheck" className="text-xs font-semibold text-red-700 cursor-pointer">
                  Remediation inadequate &bull; Reopen Case
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVerifyModalAction(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 text-xs font-bold rounded-md shadow-xs cursor-pointer text-white ${
                    isRejectReopen ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isRejectReopen ? 'Reopen CAPA Case' : 'Approve & Close Case (Append to Ledger)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-amber-600">{viewAction.case_id}</span>
                <h3 className="text-base font-bold text-slate-900">{viewAction.location}</h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadge(viewAction.status)}`}>
                {viewAction.status}
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">Mandate:</span>
                <p className="bg-slate-50 p-2.5 rounded-md border border-slate-200">{viewAction.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Assigned Officer:</span>
                  <span className="font-bold text-slate-800">{viewAction.assigned_person}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Priority:</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${getPriorityBadge(viewAction.priority)}`}>
                    {viewAction.priority}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Created:</span>
                  <span className="font-semibold text-slate-800">{viewAction.created_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Due Date:</span>
                  <span className="font-semibold text-slate-800">{viewAction.due_date}</span>
                </div>
              </div>

              {viewAction.completion_evidence && (
                <div>
                  <span className="font-semibold text-slate-500 block mb-0.5">Remediation Evidence:</span>
                  <p className="bg-blue-50/60 p-2.5 rounded border border-blue-200 text-blue-900">
                    {viewAction.completion_evidence}
                  </p>
                </div>
              )}

              {viewAction.verification_notes && (
                <div>
                  <span className="font-semibold text-slate-500 block mb-0.5">Manager Verification Notes:</span>
                  <p className="bg-emerald-50/60 p-2.5 rounded border border-emerald-200 text-emerald-900">
                    {viewAction.verification_notes} (Verified by: <b>{viewAction.verified_by || 'Manager'}</b>)
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setViewAction(null)}
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
