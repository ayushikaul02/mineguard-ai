import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Mountain, ShieldAlert, CheckCircle2, AlertTriangle, Eye, Layers } from 'lucide-react';
import { Mine } from '../types';
import { getMinesApi, getHotspotsApi } from '../services/api';

// Create custom glowing DivIcons based on risk level
const createCustomMarker = (riskLevel: string = 'LOW', compliance: number = 85) => {
  const color =
    riskLevel === 'CRITICAL'
      ? '#DC2626'
      : riskLevel === 'HIGH'
      ? '#EA580C'
      : riskLevel === 'MEDIUM'
      ? '#D97706'
      : '#16A34A';

  const html = `
    <div style="
      position: relative;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: ${color};
        opacity: 0.25;
        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: relative;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: ${color};
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: 900;
        font-family: monospace;
      ">
        ${compliance.toFixed(0)}%
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-mine-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

export const GISMapPage: React.FC = () => {
  const [mines, setMines] = useState<Mine[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMine, setSelectedMine] = useState<Mine | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [minesData, hotspotsData] = await Promise.all([
          getMinesApi(),
          getHotspotsApi()
        ]);
        setMines(minesData);
        setHotspots(hotspotsData);
        if (minesData.length > 0) {
          setSelectedMine(minesData[0]);
        }
      } catch (err) {
        console.error('Failed to load GIS data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Center coordinate around Central India coal belts
  const defaultCenter: [number, number] = [23.5, 84.5];

  return (
    <div className="space-y-4">
      {/* Disclaimer and Legend */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            GIS Coal Mine Location & Hotspot Monitoring
          </h3>
          <p className="text-xs text-slate-500">
            Simulated demonstration coordinates for eastern coal basin leaseholds (Jharia, Korba, Raniganj, Singrauli).
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-2xs" />
            <span className="text-slate-700">Low Risk (&gt;80% Compliant)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-2xs" />
            <span className="text-slate-700">High Risk (Escalated Action)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 border border-white shadow-2xs" />
            <span className="text-slate-700">Critical Hotspot (DGMS Alert)</span>
          </div>
        </div>
      </div>

      {/* Main Map + Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Container (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden h-[540px] relative">
          <MapContainer
            center={defaultCenter}
            zoom={6}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Mine Markers */}
            {mines.map((m) => (
              <Marker
                key={m.id}
                position={[m.latitude, m.longitude]}
                icon={createCustomMarker(m.risk_level, m.compliance_score || 85)}
                eventHandlers={{
                  click: () => setSelectedMine(m)
                }}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <span className="font-mono text-[10px] font-bold text-amber-600">{m.code}</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{m.name}</h4>
                    <p className="text-slate-500 text-[11px] mb-2">{m.location}, {m.state}</p>

                    <div className="space-y-1 border-t border-slate-100 pt-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Compliance Rate:</span>
                        <b className="text-emerald-700">{m.compliance_score}%</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Open Violations:</span>
                        <b className="text-red-600">{m.open_violations}</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mine Type:</span>
                        <b>{m.mine_type}</b>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Hotspot Circles */}
            {hotspots.map((hs, idx) => (
              <Circle
                key={idx}
                center={[hs.latitude, hs.longitude]}
                radius={25000} // 25km radius representation
                pathOptions={{
                  color: hs.severity === 'CRITICAL' ? '#DC2626' : '#EA580C',
                  fillColor: hs.severity === 'CRITICAL' ? '#DC2626' : '#EA580C',
                  fillOpacity: 0.15,
                  weight: 1.5,
                  dashArray: '4, 4'
                }}
              />
            ))}
          </MapContainer>
        </div>

        {/* Selected Mine Detailed Sidebar (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 shadow-2xs p-5 flex flex-col justify-between h-[540px] overflow-y-auto">
          {selectedMine ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {selectedMine.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                      selectedMine.risk_level === 'CRITICAL'
                        ? 'bg-red-50 text-red-700 border-red-300'
                        : selectedMine.risk_level === 'HIGH'
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    }`}
                  >
                    {selectedMine.risk_level || 'LOW'} Risk
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{selectedMine.name}</h3>
                <p className="text-xs text-slate-500">{selectedMine.location}, {selectedMine.state}</p>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">Compliance</span>
                  <span className="text-xl font-black text-emerald-700">{selectedMine.compliance_score}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">Open Violations</span>
                  <span className="text-xl font-black text-red-600">{selectedMine.open_violations}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Operation Mode:</span>
                  <span className="font-semibold">{selectedMine.mine_type}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">General Manager:</span>
                  <span className="font-semibold">{selectedMine.manager_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Active Workforce:</span>
                  <span className="font-semibold">{selectedMine.total_workforce} personnel</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Daily Capacity:</span>
                  <span className="font-semibold">{selectedMine.daily_production_capacity} Tonnes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coordinates:</span>
                  <span className="font-mono text-[11px] font-semibold text-slate-600">
                    {selectedMine.latitude.toFixed(4)}° N, {selectedMine.longitude.toFixed(4)}° E
                  </span>
                </div>
              </div>

              {/* Hotspot Alert */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
                <span className="font-bold block mb-1 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  GIS Hotspot Telemetry:
                </span>
                <p className="text-[11px] leading-relaxed">
                  25km geospatial buffer actively scanned for high-density recurrence and methane air quality anomalies.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              Select a mine marker on the map to inspect live leasehold parameters.
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-mono">
              Leaflet &bull; OpenStreetMap Data &bull; DGMS GeoJSON Buffer
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
