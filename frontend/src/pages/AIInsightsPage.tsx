import React, { useState, useEffect } from 'react';
import {
  Cpu,
  BrainCircuit,
  Sliders,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingUp,
  MapPin,
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { calculateRiskApi, getAiInsightsApi } from '../services/api';
import { RiskCalculationResult } from '../types';

export const AIInsightsPage: React.FC = () => {
  // Simulator State
  const [severity, setSeverity] = useState('Critical');
  const [likelihood, setLikelihood] = useState('High');
  const [recurrenceCount, setRecurrenceCount] = useState(3);
  const [daysOverdue, setDaysOverdue] = useState(5);
  const [locationHistoryViolations, setLocationHistoryViolations] = useState(4);
  const [contractorViolations, setContractorViolations] = useState(2);
  const [deadlineProximity, setDeadlineProximity] = useState(2);

  const [simResult, setSimResult] = useState<RiskCalculationResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Live ML Insights State
  const [mlData, setMlData] = useState<any>(null);
  const [mlLoading, setMlLoading] = useState(true);

  // Trigger real backend risk calculation
  const runRiskCalculation = async () => {
    setSimLoading(true);
    try {
      const res = await calculateRiskApi({
        severity,
        likelihood,
        recurrence_count: Number(recurrenceCount),
        days_overdue: Number(daysOverdue),
        location_history_violations: Number(locationHistoryViolations),
        contractor_violations: Number(contractorViolations),
        deadline_proximity_days: Number(deadlineProximity)
      });
      setSimResult(res);
    } catch (err) {
      console.error('Risk calculation failed:', err);
    } finally {
      setSimLoading(false);
    }
  };

  const fetchMlInsights = async () => {
    setMlLoading(true);
    try {
      const data = await getAiInsightsApi();
      setMlData(data);
    } catch (err) {
      console.error('Failed to load ML insights:', err);
    } finally {
      setMlLoading(false);
    }
  };

  useEffect(() => {
    runRiskCalculation();
    fetchMlInsights();
  }, []);

  return (
    <div className="space-y-6">
      {/* Patent Architecture Header */}
      <div className="bg-slate-900 text-white p-5 rounded-lg border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold tracking-wide">
              AI Risk Scoring Engine & Scikit-Learn Anomaly Detection
            </h3>
          </div>
          <span className="text-[11px] bg-amber-500/20 text-amber-300 font-mono px-2.5 py-1 rounded border border-amber-500/30">
            Patent Specification Formula &bull; CMR 2017 Protocol
          </span>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Combines multivariate linear weighted risk formulation with unsupervised Isolation Forest clustering
          on coal mining telemetry (methane PPM, coal dust mg/m3, airspeed, and historical compliance violations).
        </p>
      </div>

      {/* Section 1: Interactive Patent Risk Scoring Engine Simulator */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Interactive Patent Risk Score Calculator
            </h4>
          </div>
          <button
            onClick={runRiskCalculation}
            disabled={simLoading}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${simLoading ? 'animate-spin' : ''}`} />
            Recalculate
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Severity Factor (30% Weight)
                </label>
                <select
                  value={severity}
                  onChange={(e) => {
                    setSeverity(e.target.value);
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                >
                  <option value="Low">Low (Minor Non-Critical)</option>
                  <option value="Medium">Medium (Operational Disruption)</option>
                  <option value="High">High (Serious DGMS Hazard)</option>
                  <option value="Critical">Critical (Life Threat / Explosive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Likelihood Factor (25% Weight)
                </label>
                <select
                  value={likelihood}
                  onChange={(e) => {
                    setLikelihood(e.target.value);
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                >
                  <option value="Low">Low Likelihood</option>
                  <option value="Medium">Medium Likelihood</option>
                  <option value="High">High Likelihood</option>
                  <option value="Critical">Critical (Imminent)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Recurrence (15%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={recurrenceCount}
                  onChange={(e) => setRecurrenceCount(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
                <span className="text-[10px] text-slate-400">Previous episodes</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Days Overdue (15%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={daysOverdue}
                  onChange={(e) => setDaysOverdue(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
                <span className="text-[10px] text-slate-400">Statutory delay</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Location History (15%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={locationHistoryViolations}
                  onChange={(e) => setLocationHistoryViolations(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
                <span className="text-[10px] text-slate-400">Zone prior breaches</span>
              </div>
            </div>

            <button
              onClick={runRiskCalculation}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Simulate Risk & Breakdown
            </button>
          </div>

          {/* Result Card Column (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Evaluated Risk Score
                </span>
                <span
                  className="text-xs font-black px-2.5 py-0.5 rounded text-white shadow-2xs"
                  style={{ backgroundColor: simResult?.color || '#DC2626' }}
                >
                  {simResult?.risk_category || 'CRITICAL'}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span
                  className="text-4xl font-black tracking-tight"
                  style={{ color: simResult?.color || '#DC2626' }}
                >
                  {simResult?.risk_score?.toFixed(1) || '0.0'}
                </span>
                <span className="text-xs text-slate-500 font-bold">/ 100 Maximum Risk</span>
              </div>

              {/* Contributing Breakdown Bars */}
              <div className="space-y-2 mb-4">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Normalized Factor Contributions:
                </p>
                {simResult?.contributing_factors.map((f, i) => (
                  <div key={i} className="text-[11px]">
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span className="truncate pr-2">{f.name}</span>
                      <span className="font-mono font-bold text-slate-900 shrink-0">
                        +{f.contribution} pts
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(f.contribution * 3.3, 100)}%`,
                          backgroundColor: simResult.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block mb-0.5">Automated Escalation Rule:</span>
              <p className="text-[11px] text-slate-600 font-medium">{simResult?.escalation_rule}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Machine Learning Anomaly & Recurrence Detection Panel */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-600" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Scikit-Learn IsolationForest Anomaly & Hotspot Detector
              </h4>
              <p className="text-[11px] text-slate-500">
                Trained on synthetic demonstration data &bull; Active synchronization with live SQLite database
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded font-bold">
              {mlData?.total_anomalies_flagged || 0} Anomalies Detected
            </span>
            <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded font-bold">
              {mlData?.high_risk_hotspots_count || 0} High-Risk Hotspots
            </span>
          </div>
        </div>

        {/* Hotspots & Recurrence Clusters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recurrence Patterns */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              Recurrent Violation Clusters (Repeat Trends)
            </h5>
            <div className="space-y-2.5">
              {(mlData?.recurrence_patterns || []).map((rec: any, idx: number) => (
                <div key={idx} className="bg-white p-3 rounded-md border border-slate-200 text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-900">{rec.summary}</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded">
                      {rec.violation_count} Records
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-1">
                    Mine: <b>{rec.mine_name}</b> &bull; Zone: {rec.location}
                  </p>
                  <p className="text-[11px] text-amber-800 bg-amber-50/60 p-1.5 rounded border border-amber-200">
                    <b>Mandated Action:</b> {rec.recommended_action}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* High Risk Hotspots */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-600" />
              Geographic Risk Hotspots (Violation Density)
            </h5>
            <div className="space-y-2.5">
              {(mlData?.hotspots || []).map((hs: any, idx: number) => (
                <div key={idx} className="bg-white p-3 rounded-md border border-slate-200 text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-600" />
                      {hs.location}
                    </span>
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                      Risk: {hs.average_risk}/100
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-1">
                    {hs.mine_name} &bull; Domain: {hs.domain}
                  </p>
                  <p className="text-[11px] text-slate-600">{hs.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Isolation Forest Anomaly Records */}
        <div>
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Isolation Forest Statistical Anomaly Feed
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-2 px-3 font-semibold">Anomaly ID</th>
                  <th className="py-2 px-3 font-semibold">Mine & Location</th>
                  <th className="py-2 px-3 font-semibold">Anomaly Classification</th>
                  <th className="py-2 px-3 font-semibold text-center">Confidence</th>
                  <th className="py-2 px-3 font-semibold">Contributing Reasons</th>
                  <th className="py-2 px-3 font-semibold">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(mlData?.anomalies || []).map((anom: any) => (
                  <tr key={anom.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{anom.id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{anom.mine_name}</div>
                      <span className="text-[11px] text-slate-500">{anom.location}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        {anom.anomaly_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-mono font-bold text-slate-800">{anom.anomaly_confidence}%</span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      <ul className="list-disc pl-3 space-y-0.5">
                        {anom.contributing_reasons.map((r: string, ri: number) => (
                          <li key={ri}>{r}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] font-medium text-slate-700 max-w-xs">
                      {anom.recommended_action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
