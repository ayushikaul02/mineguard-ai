import React, { useState, useEffect } from 'react';
import { Bell, Globe, LogOut, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getDashboardAlerts } from '../services/api';

export const Navbar: React.FC<{ pageTitle?: string }> = ({ pageTitle }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getDashboardAlerts();
        setAlerts(data || []);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // 30 sec poll
    return () => clearInterval(interval);
  }, []);

  const criticalCount = alerts.filter(a => a.level === 'CRITICAL').length;
  const overdueCount = alerts.filter(a => a.type === 'OVERDUE_CAPA').length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Page Title & Breadcrumb */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
          {pageTitle || t('nav.dashboard')}
        </h2>
        <p className="text-xs text-slate-500">
          Statutory Coal Mine Governance Platform &bull; CMR 2017 & DGMS Protocol
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer transition-colors shadow-2xs"
          title="Toggle Language (English / Hindi)"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>{language === 'en' ? 'English (EN)' : 'हिंदी (HI)'}</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsMenu(!showAlertsMenu)}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-600 relative cursor-pointer transition-colors"
            title="Statutory Alerts & Critical Notices"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Alerts Dropdown Modal */}
          {showAlertsMenu && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span className="font-semibold text-xs text-slate-800">Statutory Compliance Alerts</span>
                </div>
                <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                  {criticalCount} Critical &bull; {overdueCount} Overdue
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {alerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                    No active critical violations or overdue corrective actions.
                  </div>
                ) : (
                  alerts.map((alt) => (
                    <div
                      key={alt.id}
                      className={`p-3 text-xs hover:bg-slate-50 transition-colors ${
                        alt.level === 'CRITICAL' ? 'bg-red-50/50' : 'bg-amber-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-semibold ${
                            alt.level === 'CRITICAL' ? 'text-red-700' : 'text-amber-800'
                          }`}
                        >
                          {alt.title}
                        </span>
                        <span className="text-[10px] text-slate-600 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {alt.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-2 leading-relaxed">{alt.message}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px]">
                        <span className="text-slate-600 font-medium">Escalation: {alt.escalation_level}</span>
                        <span className="font-mono bg-white px-1.5 py-0.5 border border-slate-200 rounded text-slate-600 font-semibold">
                          {alt.entity_id}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-3 py-2 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  onClick={() => setShowAlertsMenu(false)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Close Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800">{user?.full_name}</div>
            <div className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">
              {user?.role} &bull; {user?.username}
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600 cursor-pointer transition-colors"
            title={t('common.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
