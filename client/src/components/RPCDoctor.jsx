import React, { useState, useEffect, useRef } from 'react';
import { Activity, Server, StopCircle, PlayCircle, Download, Shield, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STYLE = {
  wrapper: "w-full bg-white/60 dark:bg-white/[0.02] backdrop-blur-3xl border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-8 md:p-12 shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-in fade-in duration-700 transition-colors",
  header: "flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6",
  iconBox: "p-3 bg-cyan-100 dark:bg-cyan-500/10 rounded-2xl border border-cyan-200 dark:border-cyan-500/20 shadow-sm dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
  title: "text-2xl font-extralight tracking-wide text-slate-900 dark:text-white",
  subtitle: "text-slate-500 dark:text-white/30 text-[11px] uppercase tracking-widest mt-1",
  btnExport: "flex items-center gap-2 bg-slate-100 dark:bg-white/[0.02] hover:bg-slate-200 dark:hover:bg-white/[0.05] text-slate-600 dark:text-white/50 px-5 py-2.5 rounded-full text-[9px] uppercase tracking-[0.2em] border border-slate-300 dark:border-white/10 transition-all",
  inputBox: "w-full pl-14 pr-6 py-4 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white/90 font-light tracking-wide outline-none focus:border-cyan-500/50 focus:bg-slate-50 dark:focus:bg-black/60 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] dark:focus:shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all duration-300 backdrop-blur-md",
  btnBase: "px-10 py-4 rounded-2xl font-light uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all duration-500 border",
  btnActive: "bg-violet-100 text-violet-700 border-violet-300 shadow-sm dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30 dark:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
  btnIdle: "bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border-cyan-300 hover:shadow-md dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30 dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]",
  error: "bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400/80 font-light tracking-wide p-5 rounded-2xl mb-8 text-sm",
  metricGrid: "grid grid-cols-2 md:grid-cols-4 gap-4",
  metricCard: "p-6 bg-white/40 dark:bg-white/[0.01] rounded-2xl border border-slate-200 dark:border-white/[0.05] backdrop-blur-md",
  metricLabel: "text-[9px] text-slate-500 dark:text-white/30 uppercase tracking-[0.3em] mb-2",
  chartBox: "w-full min-w-0 bg-white/40 dark:bg-white/[0.01] p-8 rounded-[2rem] border border-slate-200 dark:border-white/[0.05] h-80 relative overflow-hidden mt-8",
  auditBox: "bg-white/40 dark:bg-white/[0.01] p-8 rounded-[2rem] border border-slate-200 dark:border-white/[0.05] mt-8",
  auditBtnReady: "bg-violet-100 hover:bg-violet-200 text-violet-700 border-violet-300 shadow-sm dark:bg-violet-500/10 dark:hover:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30 dark:hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]",
  auditBtnWait: "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-white/5 dark:text-white/30 dark:border-white/5",
  warmingBanner: "flex items-center gap-3 bg-cyan-50 border border-cyan-200 text-cyan-800 dark:bg-cyan-500/5 dark:border-cyan-500/20 dark:text-cyan-300/80 font-light tracking-wide p-4 rounded-2xl mb-8 text-xs",
  scoreBox: "flex justify-between items-center p-6 bg-slate-100 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5 mb-6",
  portCard: "bg-white/60 dark:bg-white/[0.02] p-5 rounded-2xl border border-slate-200 dark:border-white/[0.05]",
  portOpen: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
  portClosed: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20"
};

const TelemetryMetric = ({ label, value, colorClass }) => (
  <div className={STYLE.metricCard}>
    <p className={STYLE.metricLabel}>{label}</p>
    <p className={`text-2xl font-extralight tracking-wide ${colorClass}`}>{value}</p>
  </div>
);

const PortCard = ({ port }) => (
  <div className={STYLE.portCard}>
    <div className="flex justify-between items-center mb-2">
      <h4 className="font-light tracking-widest text-slate-800 dark:text-white/80 text-sm">
        Port {port.port}
      </h4>
      <span className={`px-3 py-1 text-[8px] uppercase tracking-[0.2em] rounded-full border ${port.status === 'OPEN' ? STYLE.portOpen : STYLE.portClosed}`}>
        {port.status}
      </span>
    </div>
    <p className="text-[10px] text-slate-500 dark:text-white/30 tracking-widest uppercase font-light">
      {port.name}
    </p>
  </div>
);

const RPCDoctor = () => {
  const [rpcUrl, setRpcUrl] = useState('https://api.testnet.solana.com');
  const [currentResult, setCurrentResult] = useState(null);
  const [mainnetResult, setMainnetResult] = useState(null);
  const [latencyHistory, setLatencyHistory] = useState([]);
  const [error, setError] = useState(null);
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isInitialising, setIsInitialising] = useState(false);
  
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditData, setAuditData] = useState(null);
  const [auditError, setAuditError] = useState(null);
  const [auditCooldown, setAuditCooldown] = useState(0);

  const [apiReady, setApiReady] = useState(false);

  const rpcUrlRef = useRef(rpcUrl);
  const intervalRef = useRef(null);
  
  useEffect(() => { 
    rpcUrlRef.current = rpcUrl; 
  }, [rpcUrl]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retryId;

    const ping = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/health`);
        if (cancelled) return;
        if (res.ok) {
          setApiReady(true);
        } else {
          retryId = setTimeout(ping, 3000);
        }
      } catch {
        if (!cancelled) retryId = setTimeout(ping, 3000);
      }
    };

    ping();
    return () => {
      cancelled = true;
      if (retryId) clearTimeout(retryId);
    };
  }, []);

  useEffect(() => { 
    setLatencyHistory([]); 
    setCurrentResult(null); 
    setMainnetResult(null); 
    setError(null); 
    setAuditData(null); 
    setAuditError(null); 
    setIsMonitoring(false);
    setIsInitialising(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [rpcUrl]);

  const runDiagnostics = async () => {
    setError(null);
    try {
      const [customRes, mainnetRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/rpc-doctor`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ rpcUrl: rpcUrlRef.current }) 
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/rpc-doctor`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ rpcUrl: 'https://api.mainnet-beta.solana.com' }) 
        })
      ]);

      const customData = await customRes.json(); 
      const mainnetData = await mainnetRes.json();

      if (customRes.status === 429) throw new Error('Rate limit exceeded. Wait 60s.');
      if (!customRes.ok) throw new Error(customData.error || 'Failed to fetch custom node data');
      if (!mainnetRes.ok) throw new Error(mainnetData.error || 'Failed to fetch mainnet control data');

      setCurrentResult(customData); 
      setMainnetResult(mainnetData);
      setIsInitialising(false);

      setLatencyHistory((prev) => {
        const newEntry = { 
          time: customData.timestamp, 
          customPing: customData.latency, 
          mainnetPing: mainnetData.latency 
        };
        return [...prev, newEntry].slice(-15);
      });

    } catch (err) { 
      setError(err.message); 
      setIsMonitoring(false); 
      setIsInitialising(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };


  const toggleMonitoring = () => {
    if (isMonitoring) {
      setIsMonitoring(false);
      setIsInitialising(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      setIsMonitoring(true);
      setIsInitialising(true);
      runDiagnostics(); 
      intervalRef.current = setInterval(runDiagnostics, 3000);
    }
  };

  const runSecurityAudit = async () => {
    if (auditCooldown > 0) return;
    
    setIsAuditing(true); 
    setAuditError(null);

    try {
      const host = new URL(rpcUrlRef.current).hostname;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/audit`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ targetIp: host }) 
      });
      
      const data = await res.json();
      
      if (res.status === 429) throw new Error(data.error);
      if (!res.ok) throw new Error(data.error);
      
      setAuditData(data); 
      setAuditCooldown(20);
      
      const timer = setInterval(() => { 
        setAuditCooldown((prev) => { 
          if (prev <= 1) { 
            clearInterval(timer); 
            return 0; 
          } 
          return prev - 1; 
        }); 
      }, 1000);

    } catch (err) { 
      setAuditError(err.message || 'Audit failed. Check network connection.'); 
    } finally { 
      setIsAuditing(false); 
    }
  };

  const exportCSV = () => {
    if (!latencyHistory.length) return;

    const headers = 'Time,Custom_ms,Mainnet_ms\n';
    const rows = latencyHistory.map(r => `${r.time},${r.customPing},${r.mainnetPing}`).join('\n');
    const csvContent = headers + rows;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `telemetry_${Date.now()}.csv`; 
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={STYLE.wrapper}>
      <div className={STYLE.header}>
        <div className="flex gap-4 items-center">
          <div className={STYLE.iconBox}>
            <Activity className="text-cyan-600 dark:text-cyan-400" size={24} strokeWidth={1} />
          </div>
          <div>
            <h2 className={STYLE.title}>Network Telemetry</h2>
            <p className={STYLE.subtitle}>Real time latency & vector auditing</p>
          </div>
        </div>
        {latencyHistory.length > 0 && (
          <button onClick={exportCSV} className={STYLE.btnExport}>
            <Download size={12}/> Export
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="flex-1 relative group">
          <Server 
            className="absolute left-5 top-4 text-slate-400 dark:text-white/20 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400 transition-colors" 
            size={18} 
            strokeWidth={1.5} 
          />
          <input 
            type="url" 
            value={rpcUrl} 
            onChange={(e) => setRpcUrl(e.target.value)} 
            disabled={isMonitoring} 
            className={STYLE.inputBox} 
          />
        </div>
        <button 
          onClick={toggleMonitoring} 
          className={`${STYLE.btnBase} ${isMonitoring ? STYLE.btnActive : STYLE.btnIdle}`}
        >
          {isMonitoring ? (
            <><StopCircle size={14}/> Halting</>
          ) : (
            <><PlayCircle size={14}/> Initialise</>
          )}
        </button>
      </div>

      {!apiReady && (
        <div className={STYLE.warmingBanner}>
          <Loader2 className="animate-spin" size={14} strokeWidth={1.5} />
          <span>Connecting to diagnostic server. First request may take up to 50 seconds while the host wakes from idle.</span>
        </div>
      )}

      {error && <div className={STYLE.error}>{error}</div>}

      {isInitialising && !currentResult && (
        <div className="flex flex-col items-center justify-center p-16 animate-in fade-in duration-500">
          <Loader2 className="animate-spin mb-6 text-cyan-600 dark:text-cyan-400" size={36} strokeWidth={1.5} />
          <p className="text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-[0.3em] font-light">
            Establishing secure connection...
          </p>
        </div>
      )}

      {currentResult && !isInitialising && (
        <div className="animate-in fade-in duration-1000 slide-in-from-bottom-4">
          
          <div className={STYLE.metricGrid}>
            <TelemetryMetric 
              label="Status" 
              value={currentResult.status} 
              colorClass={currentResult.status === 'Healthy' ? 'text-cyan-700 dark:text-cyan-400' : 'text-violet-700 dark:text-violet-400'} 
            />
            <TelemetryMetric 
              label="Epoch" 
              value={currentResult.epoch} 
              colorClass="text-slate-900 dark:text-white" 
            />
            <TelemetryMetric 
              label="Version" 
              value={currentResult.version} 
              colorClass="text-slate-600 dark:text-white/60 text-lg" 
            />
            <TelemetryMetric 
              label="Slot" 
              value={currentResult.slot} 
              colorClass="text-slate-900 dark:text-white" 
            />
          </div>

          <div className={STYLE.chartBox}>
            <ResponsiveContainer width="99%" height="100%">
              <LineChart data={latencyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="currentColor" 
                  className="opacity-10 dark:opacity-5" 
                  vertical={false} 
                />
                <XAxis 
                  dataKey="time" 
                  stroke="currentColor" 
                  className="opacity-40 dark:opacity-20 text-slate-700 dark:text-white" 
                  fontSize={10} 
                  tickMargin={10} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="currentColor" 
                  className="opacity-40 dark:opacity-20 text-slate-700 dark:text-white" 
                  fontSize={10} 
                  unit="ms" 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(5,5,5,0.9)', 
                    backdropFilter: 'blur(12px)', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: '12px' 
                  }} 
                  itemStyle={{ color: '#fff', fontWeight: 300, fontSize: '12px' }} 
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: '10px', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.2em' }} 
                  className="text-slate-500 dark:text-white/40"
                />
                <Line 
                  name="Custom Node" 
                  type="monotone" 
                  dataKey="customPing" 
                  stroke="#0891b2" 
                  strokeWidth={1.5} 
                  dot={{ fill: '#0891b2', r: 2 }} 
                  activeDot={{ r: 5, fill: '#fff', strokeWidth: 1.5 }} 
                />
                <Line 
                  name="Mainnet Base" 
                  type="monotone" 
                  dataKey="mainnetPing" 
                  stroke="#7c3aed" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4" 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={STYLE.auditBox}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h3 className="text-lg font-extralight tracking-wide text-slate-900 dark:text-white flex items-center gap-3">
                  <Shield size={18} className="text-violet-600 dark:text-violet-400" strokeWidth={1.5}/> 
                  Port Vulnerability Audit
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-white/30 tracking-[0.2em] uppercase mt-2">
                  DDoS Vector Penetration Test
                </p>
              </div>
              <button 
                onClick={runSecurityAudit} 
                disabled={isAuditing || auditCooldown > 0} 
                className={`px-8 py-3 rounded-full text-[9px] uppercase tracking-[0.2em] font-light transition-all border ${auditCooldown > 0 ? STYLE.auditBtnWait : STYLE.auditBtnReady}`}
              >
                {isAuditing ? 'Scanning...' : auditCooldown > 0 ? `Cooldown ${auditCooldown}s` : 'Execute Scan'}
              </button>
            </div>

            {auditError && <div className={STYLE.error}>{auditError}</div>}

            {auditData && (
              <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
                <div className={STYLE.scoreBox}>
                  <div className="flex items-center gap-4">
                    {auditData.score === 100 ? (
                      <ShieldCheck size={28} className="text-cyan-600 dark:text-cyan-400" strokeWidth={1.5}/>
                    ) : (
                      <ShieldAlert size={28} className="text-violet-600 dark:text-violet-400" strokeWidth={1.5}/>
                    )}
                    <span className="font-light tracking-[0.2em] uppercase text-[10px] text-slate-600 dark:text-white/50">
                      Security Rating
                    </span>
                  </div>
                  <span className={`text-4xl font-extralight ${auditData.score === 100 ? 'text-cyan-600 dark:text-cyan-400' : 'text-violet-600 dark:text-violet-400'}`}>
                    {auditData.score}
                    <span className="text-xl text-slate-400 dark:text-white/20">/100</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {auditData.ports.map((portData) => (
                    <PortCard key={portData.port} port={portData} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RPCDoctor;