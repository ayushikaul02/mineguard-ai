import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Camera,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Inspection, Mine, ChecklistItem } from '../types';
import { getInspectionsApi, submitInspectionApi, getMinesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 1, item: 'Atmospheric Gas Detection & Ventilation Airflow (CMR 2017 Reg 153)', compliant: true, remarks: 'CH4 measured < 0.5%, air velocity 2.2 m/s.', severity: 'Critical' },
  { id: 2, item: 'Hydraulic Prop Setting Pressure & Roof Support Density', compliant: true, remarks: 'Setting pressure verified at 155 bar.', severity: 'Critical' },
  { id: 3, item: 'Mandatory PPE (Cap-lamps, steel-toe boots, anti-static overalls)', compliant: true, remarks: 'All personnel properly equipped.', severity: 'High' },
  { id: 4, item: 'Emergency SCSR Oxygen Rescuers & Refuge Station Stock', compliant: true, remarks: '100% capacity ready in chamber.', severity: 'High' },
  { id: 5, item: 'Flameproof Electrical Junction Boxes & Anti-Static Conveyor Belts', compliant: true, remarks: 'Double glands torqued; thermal scan normal.', severity: 'Medium' }
];

export const InspectionsPage: React.FC = () => {
  const { user } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);

  // Wizard Modal
  const [showWizard, setShowWizard] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

  // Form State
  const [formMineId, setFormMineId] = useState<number>(1);
  const [formDomain, setFormDomain] = useState<string>('Safety');
  const [formLocation, setFormLocation] = useState('Underground Shaft #3, Level 4 (Seam-V)');
  const [formInspector, setFormInspector] = useState(user?.full_name || 'Rajesh Sharma');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [formComments, setFormComments] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fetchInspections = async () => {
    try {
      const data = await getInspectionsApi();
      setInspections(data);
    } catch (err) {
      console.error('Failed to load inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
    getMinesApi().then(setMines).catch(console.error);
  }, []);

  const toggleChecklist = (id: number, compliant: boolean) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id
          ? {
              ...item,
              compliant,
              remarks: compliant
                ? 'Standard compliance verified.'
                : 'Defect identified: requires immediate statutory rectification.'
            }
          : item
      )
    );
  };

  const updateRemarks = (id: number, remarks: string) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, remarks } : item))
    );
  };

  const updateSeverity = (id: number, severity: 'Low' | 'Medium' | 'High' | 'Critical') => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, severity } : item))
    );
  };

  // Real-time preview calculation
  const totalItems = checklist.length;
  const compliantCount = checklist.filter((i) => i.compliant).length;
  const calculatedScore = Math.round((compliantCount / totalItems) * 100);
  const hasFailures = compliantCount < totalItems;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        mine_id: formMineId,
        domain: formDomain,
        location: formLocation,
        inspector_name: formInspector,
        inspection_date: formDate,
        checklist_data: checklist,
        comments: formComments,
        photos: ['/uploads/sample_inspection_img.jpg']
      };

      const result = await submitInspectionApi(payload);
      setShowWizard(false);
      setSuccessNotice(
        `Inspection ${result.inspection_id} submitted! Score: ${result.overall_score}%. ${
          result.status === 'Violations Found'
            ? 'Automatic Violation & Corrective Action (CAPA) cases generated and chained in audit ledger!'
            : 'All items compliant.'
        }`
      );
      fetchInspections();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit inspection');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <h3 className="text-base font-bold text-slate-900">Field Inspection Protocol</h3>
          <p className="text-xs text-slate-500">
            Digital statutory mine inspections with automated AI risk evaluation and auto-CAPA triggers.
          </p>
        </div>

        {user?.role !== 'auditor' && (
          <button
            onClick={() => {
              setChecklist(DEFAULT_CHECKLIST);
              setShowWizard(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Perform Field Inspection
          </button>
        )}
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-950 cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Inspections Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">Inspection ID</th>
                <th className="py-2.5 px-3 font-semibold">Mine & Domain</th>
                <th className="py-2.5 px-3 font-semibold">Location</th>
                <th className="py-2.5 px-3 font-semibold">Inspector</th>
                <th className="py-2.5 px-3 font-semibold text-center">Checklist Score</th>
                <th className="py-2.5 px-3 font-semibold text-center">Risk Score</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inspections.map((ins) => (
                <tr key={ins.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{ins.inspection_id}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{ins.mine_name || `Mine #${ins.mine_id}`}</div>
                    <span className="text-[10px] text-slate-500 font-medium">{ins.domain}</span>
                  </td>
                  <td className="py-2.5 px-3 max-w-xs truncate font-medium text-slate-700">{ins.location}</td>
                  <td className="py-2.5 px-3 text-slate-600">{ins.inspector_name}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`font-black text-xs px-2 py-0.5 rounded ${
                        ins.overall_score >= 85
                          ? 'bg-emerald-50 text-emerald-700'
                          : ins.overall_score >= 70
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {ins.overall_score}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        ins.risk_category === 'CRITICAL'
                          ? 'bg-red-600 text-white'
                          : ins.risk_category === 'HIGH'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {ins.risk_score?.toFixed(0)} ({ins.risk_category})
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        ins.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {ins.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedInspection(ins)}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Field Inspection Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">New Statutory Field Inspection</h3>
                <p className="text-xs text-slate-500">Live evaluation of safety, environment & operational compliance</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium block">Preview Score</span>
                <span
                  className={`text-lg font-black ${
                    calculatedScore >= 80 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {calculatedScore}%
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mine Leasehold</label>
                  <select
                    value={formMineId}
                    onChange={(e) => setFormMineId(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
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
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  >
                    <option value="Safety">Safety</option>
                    <option value="Environment">Environment</option>
                    <option value="Production">Production</option>
                    <option value="Labour">Labour</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Specific Location</label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Inspector</label>
                  <input
                    type="text"
                    required
                    value={formInspector}
                    onChange={(e) => setFormInspector(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Statutory Checklist Items (CMR 2017)
                </h4>
                <div className="space-y-3">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border text-xs transition-colors ${
                        item.compliant ? 'bg-white border-slate-200' : 'bg-red-50/50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="font-semibold text-slate-800 leading-snug">
                          {item.id}. {item.item}
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleChecklist(item.id, true)}
                            className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                              item.compliant
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <CheckCircle className="w-3 h-3" />
                            Pass
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleChecklist(item.id, false)}
                            className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                              !item.compliant
                                ? 'bg-red-600 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <XCircle className="w-3 h-3" />
                            Fail
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Inspector observation remarks..."
                            value={item.remarks}
                            onChange={(e) => updateRemarks(item.id, e.target.value)}
                            className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded bg-white text-slate-700"
                          />
                        </div>
                        <div>
                          <select
                            value={item.severity}
                            onChange={(e) => updateSeverity(item.id, e.target.value as any)}
                            className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded bg-white text-slate-700"
                          >
                            <option value="Low">Low Severity</option>
                            <option value="Medium">Medium Severity</option>
                            <option value="High">High Severity</option>
                            <option value="Critical">Critical Severity</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments & Summary */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Inspector Overall Comments & Directives
                </label>
                <textarea
                  rows={2}
                  placeholder="Record summary observations, immediate stop-work warnings, or statutory notes..."
                  value={formComments}
                  onChange={(e) => setFormComments(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              {hasFailures && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-md text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Automated Governance Trigger:</span>
                    <p className="mt-0.5 text-[11px]">
                      Submitting with non-compliant items will automatically generate Violation records,
                      compute patent risk scores, create Corrective Action (CAPA) cases, and append to the SHA-256 ledger.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWizard(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded-md shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  Submit Inspection & Trigger Workflow
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-amber-600">
                  {selectedInspection.inspection_id}
                </span>
                <h3 className="text-base font-bold text-slate-900">{selectedInspection.location}</h3>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  selectedInspection.overall_score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                Score: {selectedInspection.overall_score}%
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Mine:</span>
                  <span className="font-bold text-slate-800">{selectedInspection.mine_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Domain:</span>
                  <span className="font-bold text-slate-800">{selectedInspection.domain}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Inspector:</span>
                  <span className="font-semibold text-slate-800">{selectedInspection.inspector_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Date:</span>
                  <span className="font-semibold text-slate-800">{selectedInspection.inspection_date}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Checklist Audit Results:</span>
                <div className="space-y-1.5">
                  {(selectedInspection.checklist_data || []).map((c: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-2 rounded border flex items-start justify-between gap-2 ${
                        c.compliant ? 'bg-emerald-50/40 border-emerald-200' : 'bg-red-50/50 border-red-200'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-slate-800">{c.item}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{c.remarks}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          c.compliant ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                        }`}
                      >
                        {c.compliant ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedInspection.comments && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Inspector Comments:</span>
                  <p className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700">
                    {selectedInspection.comments}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setSelectedInspection(null)}
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
