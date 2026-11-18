import React, { useState, useEffect } from 'react';
import { Mountain, Plus, MapPin, Users, Gauge, ShieldAlert, CheckCircle2, Search } from 'lucide-react';
import { Mine } from '../types';
import { getMinesApi, createMineApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const MinesPage: React.FC = () => {
  const { user } = useAuth();
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('Jharkhand');
  const [latitude, setLatitude] = useState(23.75);
  const [longitude, setLongitude] = useState(86.42);
  const [mineType, setMineType] = useState('Underground');
  const [managerName, setManagerName] = useState('');
  const [workforce, setWorkforce] = useState(1200);
  const [capacity, setCapacity] = useState(5000.0);

  const fetchMines = async () => {
    try {
      const data = await getMinesApi();
      setMines(data);
    } catch (err) {
      console.error('Failed to fetch mines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMines();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMineApi({
        code,
        name,
        location,
        state,
        latitude: Number(latitude),
        longitude: Number(longitude),
        mine_type: mineType,
        manager_name: managerName,
        total_workforce: Number(workforce),
        daily_production_capacity: Number(capacity),
        status: 'Active'
      });
      setShowModal(false);
      // Reset
      setCode('');
      setName('');
      setLocation('');
      setManagerName('');
      fetchMines();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to register mine');
    }
  };

  const filteredMines = mines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mine name, code, or coalfield location..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register Mine Leasehold
          </button>
        )}
      </div>

      {/* Mines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMines.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden"
          >
            {/* Top Bar */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                  {m.code}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{m.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {m.location}, {m.state}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                    m.risk_level === 'CRITICAL'
                      ? 'bg-red-50 text-red-700 border-red-300'
                      : m.risk_level === 'HIGH'
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  }`}
                >
                  {m.risk_level || 'LOW'} RISK
                </span>
                <p className="text-[11px] text-slate-400 mt-1">{m.mine_type} Mine</p>
              </div>
            </div>

            {/* Metrics Strip */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 bg-slate-50/50 rounded-md my-3 text-center">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Compliance Rate</p>
                <p
                  className={`text-sm font-black ${
                    (m.compliance_score || 0) >= 80 ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {m.compliance_score || 0}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Open Violations</p>
                <p className="text-sm font-black text-red-600">{m.open_violations || 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Workforce</p>
                <p className="text-sm font-black text-slate-800">{m.total_workforce} crew</p>
              </div>
            </div>

            {/* Manager and Operations Detail */}
            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Mine Manager:</span>
                <span className="font-semibold text-slate-800">{m.manager_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Daily Production Capacity:</span>
                <span className="font-semibold text-slate-800">{m.daily_production_capacity} Tonnes/Day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">GIS Coordinates:</span>
                <span className="font-mono text-slate-500 text-[11px]">
                  {m.latitude.toFixed(4)}° N, {m.longitude.toFixed(4)}° E
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                DGMS Active Approval
              </span>
              <Link
                to="/gis-map"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                View on GIS Map &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Register Mine Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Register Coal Mine Leasehold</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter statutory mine identity and parameters approved under CMR 2017.
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mine Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SCM-05"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mine Type</label>
                  <select
                    value={mineType}
                    onChange={(e) => setMineType(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  >
                    <option value="Underground">Underground</option>
                    <option value="Opencast">Opencast</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Southern Singareni Colliery"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Godavari Basin"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Manager Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Colliery Manager"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Workforce</label>
                  <input
                    type="number"
                    value={workforce}
                    onChange={(e) => setWorkforce(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Capacity (T/D)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
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
                  Register Mine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
