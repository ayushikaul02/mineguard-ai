import React, { useState, useEffect } from 'react';
import { HardHat, Plus, Search, ShieldCheck, AlertTriangle, Phone, Mail, Users } from 'lucide-react';
import { Contractor, Mine } from '../types';
import { getContractorsApi, createContractorApi, getMinesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ContractorsPage: React.FC = () => {
  const { user } = useAuth();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [mineId, setMineId] = useState(1);
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [workerCount, setWorkerCount] = useState(150);
  const [activeContracts, setActiveContracts] = useState('');

  const fetchContractors = async () => {
    try {
      const data = await getContractorsApi();
      setContractors(data);
    } catch (err) {
      console.error('Failed to load contractors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
    getMinesApi().then(setMines).catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContractorApi({
        name,
        mine_id: Number(mineId),
        contact_person: contactPerson,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        worker_count: Number(workerCount),
        active_contracts: activeContracts,
        compliance_score: 95.0,
        safety_violations: 0,
        pending_actions: 0,
        status: 'Compliant'
      });
      setShowModal(false);
      setName('');
      setContactPerson('');
      setContactPhone('');
      setContactEmail('');
      setActiveContracts('');
      fetchContractors();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to register contractor');
    }
  };

  const filtered = contractors.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contractor_id.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_person.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HardHat className="w-5 h-5 text-amber-500" />
            Contractor Governance & Statutory Compliance
          </h3>
          <p className="text-xs text-slate-500">
            Monitor contractor safety records, vocational training compliance, and worker welfare.
          </p>
        </div>

        {user?.role !== 'auditor' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register Contractor
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contractor name, ID, or officer..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Contractors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {c.contractor_id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    c.status === 'Probation'
                      ? 'bg-red-50 text-red-700 border-red-300'
                      : c.status === 'Active'
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1">{c.name}</h3>
              <p className="text-xs text-slate-500 mb-3">
                Assigned: <b>{c.mine_name || `Mine #${c.mine_id}`}</b>
              </p>

              {/* Performance Strip */}
              <div className="grid grid-cols-3 gap-2 py-2 bg-slate-50 rounded border border-slate-200 text-center mb-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Compliance</span>
                  <span
                    className={`text-xs font-black ${
                      c.compliance_score >= 90 ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {c.compliance_score}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Workers</span>
                  <span className="text-xs font-black text-slate-800">{c.worker_count}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Violations</span>
                  <span className="text-xs font-black text-red-600">{c.safety_violations}</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 mb-3">
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {c.contact_person}
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {c.contact_phone}
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {c.contact_email}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 block">Active Contract Scope:</span>
              <p className="line-clamp-2 mt-0.5">{c.active_contracts}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Register Contractor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Register Mining Contractor</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enrolls contractor organization under DGMS Contract Labour Regulation Act.
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Mining Infrastructure Pvt Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mine</label>
                  <select
                    value={mineId}
                    onChange={(e) => setMineId(Number(e.target.value))}
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Worker Count</label>
                  <input
                    type="number"
                    min={1}
                    value={workerCount}
                    onChange={(e) => setWorkerCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Contact Officer</label>
                  <input
                    type="text"
                    required
                    placeholder="Sunil Tiwari"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98310 11223"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="ops@contractor.in"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Active Contract Scope</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Underground Gallery Tunneling & Hydraulic Chock Support..."
                  value={activeContracts}
                  onChange={(e) => setActiveContracts(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded-md shadow-xs cursor-pointer"
                >
                  Register Contractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
