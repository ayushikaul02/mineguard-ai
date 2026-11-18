import React, { useState, useEffect } from 'react';
import {
  Mountain,
  ClipboardCheck,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Flame,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from 'recharts';
import { StatCard } from '../components/StatCard';
import {
  getDashboardKpis,
  getDashboardCharts,
  getRecentActivity,
  getDashboardAlerts
} from '../services/api';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiRes, chartRes, actRes, altRes] = await Promise.all([
          getDashboardKpis(),
          getDashboardCharts(),
          getRecentActivity(),
          getDashboardAlerts()
        ]);
        setKpis(kpiRes);
        setCharts(chartRes);
        setActivity(actRes);
        setAlerts(altRes);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-500 text-sm">
        <Activity className="w-5 h-5 animate-spin mr-2 text-amber-500" />
        Loading real-time coal mine governance telemetry...
      </div>
    );
  }

  const PIE_COLORS = ['#16A34A', '#F59E0B', '#DC2626', '#64748B'];

  return (
    <div className="space-y-6">
      {/* Critical Alert Notice if critical or overdue cases exist */}
      {alerts && alerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg shadow-2xs flex items-start justify-between">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider">
                Immediate Statutory Attention Required &bull; {alerts.length} Escalated Issues
              </h4>
              <p className="text-xs text-red-700 mt-0.5">
                {alerts[0].title}: {alerts[0].message}
              </p>
            </div>
          </div>
          <Link
            to="/violations"
            className="text-xs font-bold text-red-800 hover:text-red-950 flex items-center gap-1 shrink-0 bg-red-100 px-3 py-1.5 rounded-md border border-red-200 transition-colors"
          >
            Review Violations
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 8 Dynamic KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Coal Mines"
          value={kpis?.total_mines || 0}
          subtitle="4 Active Leaseholds (DGMS Monitored)"
          icon={Mountain}
          variant="slate"
        />
        <StatCard
          title="Total Inspections"
          value={kpis?.total_inspections || 0}
          subtitle="Statutory Audits Logged"
          icon={ClipboardCheck}
          variant="blue"
        />
        <StatCard
          title="Compliant Records"
          value={kpis?.compliant_records || 0}
          subtitle={`${kpis?.partially_compliant_records || 0} Partially Compliant`}
          icon={ShieldCheck}
          variant="green"
        />
        <StatCard
          title="Non-Compliant Records"
          value={kpis?.non_compliant_records || 0}
          subtitle="Breach of CMR 2017 Guidelines"
          icon={AlertTriangle}
          variant="amber"
        />
        <StatCard
          title="Open Violations"
          value={kpis?.open_violations || 0}
          subtitle="Active Hazard Observations"
          icon={Flame}
          variant="red"
        />
        <StatCard
          title="Overdue CAPA Cases"
          value={kpis?.overdue_corrective_actions || 0}
          subtitle="Past DGMS Mitigation Deadline"
          icon={Clock}
          variant="red"
        />
        <StatCard
          title="Critical Risk Cases"
          value={kpis?.critical_risk_cases || 0}
          subtitle="Risk Score >= 75 (Immediate Action)"
          icon={ShieldAlert}
          variant="purple"
        />
        <StatCard
          title="Overall Compliance"
          value={`${kpis?.overall_compliance_percentage || 0}%`}
          subtitle="Calculated Multi-Domain Metric"
          icon={TrendingUp}
          variant={
            (kpis?.overall_compliance_percentage || 0) >= 80
              ? 'green'
              : (kpis?.overall_compliance_percentage || 0) >= 65
              ? 'amber'
              : 'red'
          }
        />
      </div>

      {/* Primary Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Compliance Status Distribution */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Compliance Status Distribution
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              Live Database
            </span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.compliance_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts?.compliance_distribution || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Violations by Domain */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Violations by Governance Domain
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              4 Statutory Domains
            </span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.violations_by_domain || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="domain" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="violations" fill="#EA580C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Risk Distribution */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Risk Severity Profile
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              Patent AI Formula
            </span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.risk_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(charts?.risk_distribution || []).map((entry: any, index: number) => (
                    <Cell key={`risk-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4. Monthly Inspection & Compliance Trends */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Monthly Inspection & Compliance Rate Trends
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              6-Month Governance Window
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.monthly_trends || []}>
                <defs>
                  <linearGradient id="colorCmp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[60, 100]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="compliance_rate"
                  name="Compliance Rate %"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCmp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Mine-Wise Compliance Comparison */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Mine-Wise Compliance Comparison
            </h4>
            <Link to="/mines" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium">
              View All Mines <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={charts?.mine_comparison || []}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="code" type="category" tick={{ fontSize: 11 }} width={70} />
                <Tooltip />
                <Bar dataKey="compliance_rate" name="Compliance %" fill="#0D9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recurring Trends & Recent SHA-256 Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recurring Trends Table */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Recurring Violation Clusters (ML Pattern Recognition)
            </h4>
            <Link to="/ai-insights" className="text-xs text-amber-600 font-semibold hover:underline">
              AI Insights &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="py-2 px-3 font-semibold">Violation Category</th>
                  <th className="py-2 px-3 font-semibold text-center">Frequency</th>
                  <th className="py-2 px-3 font-semibold text-right">Risk Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(charts?.recurring_trends || []).map((t: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-medium text-slate-800">{t.category}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                        {t.occurrences}x
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          t.risk_impact === 'Critical'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : t.risk_impact === 'High'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}
                      >
                        {t.risk_impact}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity (Tamper-Evident Ledger) */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Recent Governance Ledger Events
            </h4>
            <Link to="/audit" className="text-xs text-blue-600 font-semibold hover:underline">
              Full Audit Trail &rarr;
            </Link>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {activity.slice(0, 7).map((act: any) => (
              <div key={act.id} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-md text-xs">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-800">{act.action}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{act.timestamp}</span>
                </div>
                <p className="text-slate-600 line-clamp-1">{act.description}</p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Logged by: <b className="text-slate-700">{act.user}</b></span>
                  <span className="font-mono bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-500">
                    Hash: {act.hash}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
