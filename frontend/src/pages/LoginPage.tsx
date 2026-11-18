import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, User as UserIcon, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('Network Error') || !err.response) {
        setError('Server is waking up (Render free tier cold start) or network connection interrupted. Please wait 30 seconds and retry.');
      } else {
        setError(err.response?.data?.detail || 'Invalid username or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (role: 'inspector' | 'manager' | 'admin' | 'auditor') => {
    setError('');
    setLoading(true);
    try {
      await quickLogin(role);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('Network Error') || !err.response) {
        setError('Server is waking up (Render free tier cold start) or network connection interrupted. Please wait 30 seconds and retry.');
      } else {
        setError(err.response?.data?.detail || `Failed to login as ${role}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 select-none relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 z-10">
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto mb-3 shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">MineGuard AI</h1>
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mt-0.5">
            Intelligent Mine Governance & Multi-Domain Compliance System
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Academic Patent Implementation Prototype &bull; DGMS Protocol
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 rounded-md text-red-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g. inspector, manager)"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In with Secure Credentials'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* One-Click Demo Role Accounts */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Demo Role Logins
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuick('inspector')}
              className="p-2.5 rounded-md bg-slate-950 border border-amber-500/30 hover:border-amber-500 text-left hover:bg-amber-500/10 transition-colors cursor-pointer group"
            >
              <div className="font-bold text-amber-400 group-hover:text-amber-300">Mine Inspector</div>
              <div className="text-[10px] text-slate-500">inspector / inspector123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuick('manager')}
              className="p-2.5 rounded-md bg-slate-950 border border-blue-500/30 hover:border-blue-500 text-left hover:bg-blue-500/10 transition-colors cursor-pointer group"
            >
              <div className="font-bold text-blue-400 group-hover:text-blue-300">Mine Manager</div>
              <div className="text-[10px] text-slate-500">manager / manager123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuick('admin')}
              className="p-2.5 rounded-md bg-slate-950 border border-purple-500/30 hover:border-purple-500 text-left hover:bg-purple-500/10 transition-colors cursor-pointer group"
            >
              <div className="font-bold text-purple-400 group-hover:text-purple-300">Corporate Admin</div>
              <div className="text-[10px] text-slate-500">admin / admin123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuick('auditor')}
              className="p-2.5 rounded-md bg-slate-950 border border-emerald-500/30 hover:border-emerald-500 text-left hover:bg-emerald-500/10 transition-colors cursor-pointer group"
            >
              <div className="font-bold text-emerald-400 group-hover:text-emerald-300">Statutory Auditor</div>
              <div className="text-[10px] text-slate-500">auditor / auditor123</div>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-5 text-center">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Protected by SHA-256 Tamper-Evident Governance Ledger
          </p>
        </div>
      </div>
    </div>
  );
};
