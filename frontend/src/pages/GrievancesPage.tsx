import React, { useState, useEffect } from 'react';
import {
  MessageSquareWarning,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  Edit2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Grievance, Mine } from '../types';
import { getGrievancesApi, submitGrievanceApi, updateGrievanceApi, getMinesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const GrievancesPage: React.FC = () => {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedMine, setSelectedMine] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resolveModalGrievance, setResolveModalGrievance] = useState<Grievance | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [targetStatus, setTargetStatus] = useState<'Resolved' | 'Rejected' | 'In Progress'>('Resolved');

  // Form State
  const [formCategory, setFormCategory] = useState('Worker safety');
  const [formMineId, setFormMineId] = useState(1);
  const [formDescription, setFormDescription] = useState('');
  const [formSubmittedBy, setFormSubmittedBy] = useState(user?.full_name || '');
  const [formPriority, setFormPriority] = useState('High');

  const fetchGrievances = async () => {
    try {
      const params: any = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedMine) params.mine_id = Number(selectedMine);

      const data = await getGrievancesApi(params);
      setGrievances(data);
    } catch (err) {
      console.error('Failed to load grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
    getMinesApi().then(setMines).catch(console.error);
  }, [selectedCategory, selectedStatus, selectedMine]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitGrievanceApi({
        category: formCategory,
        mine_id: Number(formMineId),
        description: formDescription,
        submitted_by: formSubmittedBy,
        submission_date: new Date().toISOString().split('T')[0],
        priority: formPriority
      });
      setShowCreateModal(false);
      setFormDescription('');
      fetchGrievances();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit grievance');
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalGrievance) return;
    try {
      await updateGrievanceApi(resolveModalGrievance.id, {
        status: targetStatus,
        resolution: resolutionText
      });
      setResolveModalGrievance(null);
      setResolutionText('');
      fetchGrievances();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update grievance');
    }
  };

  const categories = [
    'Worker safety',
    'Labour welfare',
    'Environmental issues',
    'Equipment',
    'Facilities',
    'Other issues'
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-300 font-bold';
      case 'Under Review':
        return 'bg-blue-50 text-blue-700 border-blue-300 font-bold';
      case 'Rejected':
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

  const filtered = grievances.filter(
    (g) =>
      g.description.toLowerCase().includes(search.toLowerCase()) ||
      g.grievance_id.toLowerCase().includes(search.toLowerCase()) ||
      g.submitted_by.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-amber-500" />
            Worker & Community Grievance Redressal
          </h3>
          <p className="text-xs text-slate-500">
            DGMS compliant bipartite grievance logging, investigation, and formal resolution tracking.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Register Grievance
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search grievance ID, text, or submitter..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
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

      {/* Grievances Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">Grievance ID</th>
                <th className="py-2.5 px-3 font-semibold">Mine & Category</th>
                <th className="py-2.5 px-3 font-semibold max-w-sm">Description & Resolution</th>
                <th className="py-2.5 px-3 font-semibold">Submitted By</th>
                <th className="py-2.5 px-3 font-semibold">Priority</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{g.grievance_id}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{g.mine_name || `Mine #${g.mine_id}`}</div>
                    <span className="text-[10px] text-slate-500 font-medium">{g.category}</span>
                  </td>
                  <td className="py-2.5 px-3 max-w-sm">
                    <p className="font-medium text-slate-800 line-clamp-2">{g.description}</p>
                    {g.resolution && (
                      <p className="text-[11px] text-emerald-800 bg-emerald-50/60 p-1 rounded mt-1 border border-emerald-200">
                        <b>Resolution:</b> {g.resolution}
                      </p>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <div className="font-semibold">{g.submitted_by}</div>
                    <div className="text-[10px] text-slate-400">{g.submission_date}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${getPriorityBadge(g.priority)}`}>
                      {g.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadge(g.status)}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {user?.role !== 'auditor' && (
                      <button
                        onClick={() => {
                          setResolveModalGrievance(g);
                          setResolutionText(g.resolution || '');
                          setTargetStatus(g.status === 'Resolved' ? 'Resolved' : 'In Progress');
                        }}
                        className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        Update / Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Grievance Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Register Mine Grievance</h3>
            <p className="text-xs text-slate-500 mb-4">
              Formal worker safety or welfare issue logged for bipartite committee resolution.
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Submitted By</label>
                <input
                  type="text"
                  required
                  placeholder="Worker Name / Union Designation"
                  value={formSubmittedBy}
                  onChange={(e) => setFormSubmittedBy(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Grievance Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the hazard, facility deficiency, or labour concern..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
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
                  Submit Grievance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Grievance Modal */}
      {resolveModalGrievance && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Update Grievance: {resolveModalGrievance.grievance_id}
            </h3>
            <p className="text-xs text-slate-500 mb-3">{resolveModalGrievance.description}</p>

            <form onSubmit={handleResolve} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Resolution / Investigation Findings
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail remediation steps taken, vendor action, or committee decision..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolveModalGrievance(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-md shadow-xs cursor-pointer"
                >
                  Save Resolution Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
