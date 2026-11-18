import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Mountain,
  ShieldCheck,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  MapPin,
  FileText,
  HardHat,
  MessageSquareWarning,
  BarChart3,
  Link2,
  Users,
  Settings,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/mines', label: t('nav.mines'), icon: Mountain },
    { to: '/compliance', label: t('nav.compliance'), icon: ShieldCheck },
    { to: '/inspections', label: t('nav.inspections'), icon: ClipboardCheck },
    { to: '/violations', label: t('nav.violations'), icon: AlertTriangle },
    { to: '/corrective-actions', label: t('nav.capa'), icon: CheckCircle2 },
    { to: '/ai-insights', label: t('nav.ai_insights'), icon: Cpu },
    { to: '/gis-map', label: t('nav.gis_map'), icon: MapPin },
    { to: '/documents', label: t('nav.documents'), icon: FileText },
    { to: '/contractors', label: t('nav.contractors'), icon: HardHat },
    { to: '/grievances', label: t('nav.grievances'), icon: MessageSquareWarning },
    { to: '/reports', label: t('nav.reports'), icon: BarChart3 },
    { to: '/audit', label: t('nav.audit'), icon: Link2 },
    { to: '/users', label: t('nav.users'), icon: Users },
    { to: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'inspector':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'manager':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'admin':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'auditor':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <aside className="w-64 bg-slate-950 text-slate-200 border-r border-slate-800 flex flex-col h-screen fixed top-0 left-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-wide text-white leading-tight">MineGuard AI</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Patent Gov & Compliance</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">
          Governance Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border-l-3 border-amber-500 font-semibold pl-2.5'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Bottom User Status Card */}
      {user && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
              {user.full_name.split(' ')[0]} {user.full_name.split(' ')[1] || ''}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${getRoleBadgeColor(
                user.role
              )}`}
            >
              {user.role}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {user.mine_id ? `Assigned: Mine #${user.mine_id}` : 'Corporate Enterprise Wide'}
          </p>
        </div>
      )}
    </aside>
  );
};
