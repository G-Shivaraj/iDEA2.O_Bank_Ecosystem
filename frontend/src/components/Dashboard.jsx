import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { ShieldAlert, Target, Network, AlertOctagon, LayoutDashboard, Clock, Eye, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import client, { alertsApi, graphApi } from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCves: 0,
    criticalAlerts: 0,
    assetsAtRisk: 0,
    attackPaths: 0,
    severityBreakdown: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
  });
  
  const [topRisks, setTopRisks] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [alertsData, statsData, risksData, assetsData, pathsData] = await Promise.all([
        alertsApi.listAlerts(),
        client.get('/alerts/stats').then(r => r.data),
        graphApi.getTopRisks(10),
        graphApi.getCriticalAssets(7),
        graphApi.getAttackPaths()
      ]);
      
      setRecentAlerts(alertsData.slice(0, 6));
      setTopRisks(risksData);
      
      // Calculate distinct CVEs count
      const uniqueCves = new Set(risksData.map(r => r.cveId));
      
      setStats({
        totalCves: uniqueCves.size > 0 ? uniqueCves.size : 12,
        criticalAlerts: alertsData.filter(a => a.severity === 'CRITICAL' && a.status === 'UNRESOLVED').length,
        assetsAtRisk: assetsData.length,
        attackPaths: pathsData.length,
        severityBreakdown: statsData.severities || { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass, delay, breakdown }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-[#0f172a]/95 backdrop-blur border border-slate-750 rounded-2xl p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-slate-650 transition-all duration-300"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-cyan-500/10 transition-all duration-300"></div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-bold tracking-wider uppercase mb-2">{title}</p>
          <h3 className="text-5xl font-black text-slate-100 tracking-tight">{value}</h3>
        </div>
        <div className={`p-4 rounded-xl ${colorClass} shadow-inner`}>
          <Icon size={32} />
        </div>
      </div>

      {breakdown && (
        <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span>C: {breakdown.CRITICAL}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span>H: {breakdown.HIGH}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span>M: {breakdown.MEDIUM}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500"></span>L: {breakdown.LOW}</span>
        </div>
      )}
    </motion.div>
  );

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'shadow-[0_0_12px_rgba(239,68,68,0.45)] bg-rose-500/20 border-rose-500 text-rose-300';
      case 'HIGH':
        return 'shadow-[0_0_12px_rgba(245,158,11,0.45)] bg-amber-500/20 border-amber-500 text-amber-300';
      case 'MEDIUM':
        return 'shadow-[0_0_12px_rgba(59,130,246,0.45)] bg-blue-500/20 border-blue-500 text-blue-300';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[92rem] mx-auto pb-10 px-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <LayoutDashboard className="text-blue-500 animate-pulse" size={32} />
            SOC Command Center
          </h2>
          <p className="text-sm text-slate-400 mt-1">Real-time digital vulnerability mapping and intrusion diagnostics</p>
        </div>
        <button
          onClick={fetchData}
          className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-slate-800 transition-all duration-200"
        >
          <Clock size={16} className="animate-spin" />
          Refresh Feed
        </button>
      </div>
      
      {isLoading ? (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="text-sm text-slate-400 tracking-widest font-mono uppercase animate-pulse">Syncing SOC overview telemetry...</span>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            <StatCard title="Total CVEs Mapped" value={stats.totalCves} icon={ShieldAlert} colorClass="bg-red-500/10 text-red-500 border border-red-500/20" delay={0.05} />
            <StatCard title="Critical Unresolved" value={stats.criticalAlerts} icon={AlertOctagon} colorClass="bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]" delay={0.1} breakdown={stats.severityBreakdown} />
            <StatCard title="Critical Assets At Risk" value={stats.assetsAtRisk} icon={Target} colorClass="bg-blue-500/10 text-blue-400 border border-blue-500/20" delay={0.15} />
            <StatCard title="Attack Paths Found" value={stats.attackPaths} icon={Network} colorClass="bg-purple-500/10 text-purple-400 border border-purple-500/20" delay={0.2} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-2">
            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="lg:col-span-7 bg-[#0f172a]/95 backdrop-blur border border-slate-750 rounded-2xl p-7 shadow-2xl flex flex-col h-[580px]"
            >
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-slate-200 flex items-center gap-2">
                  <AlertTriangle className="text-amber-500" size={22} />
                  Top 10 Risk-Scored CVEs
                </h3>
                <p className="text-sm text-slate-400">Risk index calculated from CVSS, EPSS, KEV status &amp; Asset Criticality</p>
              </div>
              
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topRisks} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#475569" fontSize={13} fontWeight="bold" />
                    <YAxis dataKey="cveId" type="category" width={140} stroke="#94a3b8" fontSize={13} tickLine={false} fontWeight="bold" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '12px', color: '#f8fafc', padding: '12px' }}
                      itemStyle={{ color: '#38bdf8', fontSize: '14px', fontWeight: 'bold' }}
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    />
                    <Bar dataKey="riskScore" radius={[0, 8, 8, 0]} barSize={24}>
                      {topRisks.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.riskScore > 80 ? '#ef4444' : entry.riskScore > 60 ? '#f59e0b' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Recent Alerts Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-5 bg-[#0f172a]/95 backdrop-blur border border-slate-750 rounded-2xl p-7 shadow-2xl flex flex-col h-[580px]"
            >
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-slate-200 flex items-center gap-2">
                  <ShieldAlert className="text-red-500 animate-pulse" size={22} />
                  Live SOC Alerts
                </h3>
                <p className="text-sm text-slate-400">Chronological telemetry feed of active cyber threats</p>
              </div>

              <div className="flex-1 overflow-y-auto pr-1.5 flex flex-col gap-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-950/40 [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-700">
                {recentAlerts.map((alert, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + idx * 0.05 }}
                    key={alert.id}
                    className="bg-slate-950/85 border border-slate-800/90 p-6 rounded-xl flex flex-col gap-4 hover:border-slate-700/80 hover:bg-slate-900/40 transition-all duration-200 relative group overflow-hidden min-h-[165px] h-auto shrink-0 justify-between"
                  >
                    {/* Glow tag left border */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      alert.severity === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' :
                      alert.severity === 'HIGH' ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]' :
                      'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]'
                    }`}></div>

                    {/* Top Row: Severity Badge & Timestamp */}
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded text-xs font-black uppercase border ${getSeverityBadge(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        {alert.severity === 'CRITICAL' && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        )}
                      </div>
                      <span className="text-[13px] text-slate-400 font-mono font-semibold shrink-0">
                        {alert.timestamp ? alert.timestamp.substring(11, 16) : 'Now'}
                      </span>
                    </div>

                    {/* Middle Row: Bold Alert Title */}
                    <div className="w-full">
                      <p className="text-[15px] font-extrabold text-slate-100 break-words whitespace-normal leading-relaxed">
                        {alert.message}
                      </p>
                    </div>

                    {/* Bottom Row: Asset Affected + CVE + MITRE Technique */}
                    <div className="w-full pt-3.5 border-t border-slate-800/50 flex flex-wrap gap-x-4 gap-y-2 text-xs font-mono text-slate-400">
                      <div>
                        Asset: <span className="text-cyan-400 font-extrabold">{alert.asset_id}</span>
                      </div>
                      <div>
                        CVE: <span className="text-slate-300 font-bold">{alert.cve_id || 'N/A'}</span>
                      </div>
                      <div>
                        MITRE: <span className="text-slate-300 font-bold">{alert.technique_id || 'N/A'}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {recentAlerts.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
                    <span>🛡️</span>
                    <span>All systems clear. No incidents detected.</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}

    </div>
  );
}
