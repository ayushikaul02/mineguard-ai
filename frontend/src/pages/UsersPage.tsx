import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldCheck, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react';
import { User, Mine } from '../types';
import { getUsersApi, createUserApi, getMinesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'inspector' | 'manager' | 'admin' | 'auditor'>('inspector');
  const [mineId, setMineId] = useState<number | undefined>(1);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const fetchUsers = async () => {
    try {
      const data = await getUsersApi();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    getMinesApi().then(setMines).catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserApi({
        username,
        password,
        full_name: fullName,
        role,
        mine_id: role === 'admin' || role === 'auditor' ? undefined : mineId,
        email,
        phone
      });
      setShowModal(false);
      setUsername('');
      setPassword('');
      setFullName('');
      setEmail('');
      setPhone('');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create user');
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'inspector':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      case 'auditor':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Role-Based Access Control (RBAC) & Users
          </h3>
          <p className="text-xs text-slate-500">
            Enforces multi-tier governance permissions across Mine Inspectors, Managers, Corporate Admins, and Auditors.
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Provision User Account
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">User Identity</th>
                <th className="py-2.5 px-3 font-semibold">Governance Role</th>
                <th className="py-2.5 px-3 font-semibold">Mine Affiliation</th>
                <th className="py-2.5 px-3 font-semibold">Contact Email & Phone</th>
                <th className="py-2.5 px-3 font-semibold text-center">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900 block">{u.full_name}</span>
                    <span className="font-mono text-[11px] text-slate-400">@{u.username}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRoleBadge(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">
                    {u.mine_id ? `Assigned: Mine #${u.mine_id}` : 'Corporate Enterprise Wide'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {u.email || 'N/A'}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {u.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          DGMS Role Permissions Matrix
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
            <span className="font-bold text-amber-900 block mb-1">Mine Inspector</span>
            <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-0.5">
              <li>Submit field checklist audits</li>
              <li>Upload statutory evidence</li>
              <li>Report safety hazards & breaches</li>
            </ul>
          </div>
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
            <span className="font-bold text-blue-900 block mb-1">Mine Manager</span>
            <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-0.5">
              <li>Assign corrective actions (CAPA)</li>
              <li>Approve & close remediation cases</li>
              <li>Resolve worker grievances</li>
            </ul>
          </div>
          <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200">
            <span className="font-bold text-purple-900 block mb-1">Corporate Admin</span>
            <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-0.5">
              <li>Enterprise multi-mine overview</li>
              <li>User provisioning & RBAC</li>
              <li>Manage compliance rules</li>
            </ul>
          </div>
          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
            <span className="font-bold text-emerald-900 block mb-1">Statutory Auditor</span>
            <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-0.5">
              <li>Read-only statutory access</li>
              <li>Cryptographic hash verification</li>
              <li>Download governance PDF reports</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Provision User Account</h3>
            <p className="text-xs text-slate-500 mb-4">
              Configures credentials and role-based permissions in the system.
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name & Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. Sen (Safety Officer)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="ssen"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  >
                    <option value="inspector">Mine Inspector</option>
                    <option value="manager">Mine Manager</option>
                    <option value="admin">Corporate Admin</option>
                    <option value="auditor">Statutory Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assigned Mine</label>
                  <select
                    disabled={role === 'admin' || role === 'auditor'}
                    value={mineId || ''}
                    onChange={(e) => setMineId(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white disabled:bg-slate-100"
                  >
                    {mines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="officer@mine.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
