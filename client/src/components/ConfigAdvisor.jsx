import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Cpu, HardDrive, MemoryStick, Cloud, Server, Download } from 'lucide-react';

const STYLE = {
  panel: "w-full bg-white/60 dark:bg-white/[0.02] backdrop-blur-3xl border border-slate-200 dark:border-white/[0.05] rounded-[2rem] p-8 md:p-12 shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-in fade-in duration-700 transition-colors",
  headerBadge: "p-3 bg-violet-100 dark:bg-violet-500/10 rounded-2xl border border-violet-200 dark:border-violet-500/20 shadow-sm dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
  inputPanel: "col-span-1 lg:col-span-4 bg-white/40 dark:bg-white/[0.01] p-8 rounded-[2rem] border border-slate-200 dark:border-white/[0.05] shadow-sm dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]",
  inputField: "w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-800 dark:text-white/90 font-light tracking-wide outline-none focus:border-violet-500/50 dark:focus:border-violet-500/50 focus:bg-slate-50 dark:focus:bg-black/60 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all backdrop-blur-md appearance-none",
  inputLabel: "block text-[9px] text-slate-500 dark:text-white/40 uppercase tracking-[0.3em] mb-2 pl-1",
  submitBtn: "w-full mt-4 bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.06] text-slate-800 dark:text-white font-light tracking-[0.2em] uppercase text-[10px] py-5 rounded-xl border border-slate-300 dark:border-white/10 transition-all duration-300 relative overflow-hidden group",
  submitBtnGlow: "absolute inset-0 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 dark:from-violet-600/20 dark:to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
  emptyState: "h-full flex flex-col items-center justify-center text-slate-400 dark:text-white/20 border border-slate-200 dark:border-white/[0.02] rounded-[2rem] p-8 bg-white/30 dark:bg-white/[0.01] min-h-[500px]",
  scorePanel: "flex justify-between items-center bg-white/40 dark:bg-white/[0.02] p-8 rounded-[2rem] border border-slate-200 dark:border-white/[0.05]",
  metricCard: "bg-white/40 dark:bg-white/[0.01] p-6 rounded-2xl border border-slate-200 dark:border-white/[0.05]",
  metricBadgeBase: "p-2 rounded-lg border",
  scriptPanel: "bg-slate-50 dark:bg-[#050505]/80 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-white/[0.05] overflow-hidden mt-8 shadow-inner dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
  scriptHeader: "bg-white/80 dark:bg-white/[0.02] px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-white/[0.05]",
  copyBtn: "text-[9px] uppercase tracking-[0.2em] text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white px-4 py-2 border border-slate-300 dark:border-white/10 rounded-full hover:bg-slate-200 dark:hover:bg-white/[0.05] transition-all",
  exportBtn: "flex items-center gap-3 bg-slate-100 dark:bg-white/[0.02] hover:bg-slate-200 dark:hover:bg-white/[0.05] text-slate-700 dark:text-white/50 dark:hover:text-white px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] border border-slate-300 dark:border-white/10 transition-all"
};

// Abstracted sub component for cleaner JSX layout
const MetricCard = ({ icon: Icon, layer, res }) => {
  const isOptimal = res.status === 'Optimal';
  const badgeStyles = isOptimal
    ? 'bg-cyan-100 border-cyan-200 text-cyan-700 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400'
    : 'bg-violet-100 border-violet-200 text-violet-700 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-400';

  return (
    <div className={STYLE.metricCard}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`${STYLE.metricBadgeBase} ${badgeStyles}`}>
          <Icon size={16} strokeWidth={1.5} />
        </div>
        <h4 className="font-light tracking-widest uppercase text-[10px] text-slate-700 dark:text-white/70">
          {layer}
        </h4>
      </div>
      <p className="text-xs text-slate-600 dark:text-white/40 font-light leading-relaxed">
        {res.message}
      </p>
    </div>
  );
};

MetricCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  layer: PropTypes.string.isRequired,
  res: PropTypes.shape({
    status: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired
  }).isRequired
};

const ConfigAdvisor = () => {
  const [formData, setFormData] = useState({ 
    environment: 'bare-metal', 
    cpuCores: 16, 
    clockSpeed: 3.0, 
    ram: 512, 
    storageType: 'nvme', 
    storageSize: 2 
  });
  const [report, setReport] = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateReport = () => {
    setIsAnalysing(true);

    setTimeout(() => {
      const results = { score: 0, components: {} };

      // CPU Logic
      if (formData.cpuCores >= 16 && formData.clockSpeed >= 2.8) { 
        results.components.cpu = { status: 'Optimal', message: 'Sufficient for 400ms block production.' }; 
        results.score += 35; 
      } else { 
        results.components.cpu = { status: 'Critical', message: 'Insufficient compute parameters.' }; 
      }
      
      // RAM Logic
      if (formData.ram >= 512) { 
        results.components.ram = { status: 'Optimal', message: 'Accounts DB fits in memory.' }; 
        results.score += 35; 
      } else if (formData.ram >= 256) { 
        results.components.ram = { status: 'Warning', message: 'OOM crash risk as voting validator.' }; 
        results.score += 15; 
      } else { 
        results.components.ram = { status: 'Critical', message: 'Below absolute minimum.' }; 
      }
      
      // Storage Logic
      if (formData.storageType === 'nvme' && formData.storageSize >= 2) {
        if (formData.environment === 'cloud') { 
          results.components.storage = { status: 'Warning', message: 'Cloud NVMe selected. Beware IOPS throttling.' }; 
          results.score += 20; 
        } else { 
          results.components.storage = { status: 'Optimal', message: 'Local NVMe provides required IOPS.' }; 
          results.score += 30; 
        }
      } else { 
        results.components.storage = { status: 'Critical', message: 'Insufficient storage type/size.' }; 
      }
      
      setReport(results); 
      setIsAnalysing(false);
    }, 1200); 
  };

  const generateCliScript = () => {
    const lines = [
      '#!/bin/bash',
      '# Agave Validator Startup Script',
      '',
      'exec agave-validator \\',
      '  --identity ~/validator-keypair.json \\',
      '  --known-validator 7Np41oeYqPefeNQEHSv1yXCrK... \\',
      '  --only-known-rpc \\',
      '  --rpc-port 8899 \\',
      '  --dynamic-port-range 8000-8020 \\'
    ];

    if (formData.ram < 512) {
      lines.push('  --limit-ledger-size 50000000 \\ # Crucial for < 512GB RAM');
    }

    if (formData.storageType !== 'nvme') {
      lines.push('  --accounts /mnt/ramdisk \\');
    } else {
      lines.push('  --accounts /mnt/solana-accounts \\');
    }

    lines.push('  --log ~/solana-validator.log');

    return lines.join('\n');
  };

  const exportJSON = () => {
    if (!report) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      target: "Mainnet-Beta",
      requested_specs: formData,
      report: report
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a'); 
    link.href = url; 
    link.download = `procurement_${Date.now()}.json`; 
    
    // Safely append, click, and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getScoreColorClass = (score) => {
    if (score >= 90) return 'text-cyan-600 dark:text-cyan-400 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]';
    if (score >= 60) return 'text-violet-600 dark:text-violet-400';
    return 'text-red-500 dark:text-red-400';
  };

  return (
    <div className={STYLE.panel}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div className="flex gap-4 items-center">
          <div className={STYLE.headerBadge}>
            <Server className="text-violet-600 dark:text-violet-400" size={24} strokeWidth={1} />
          </div>
          <div>
            <h2 className="text-2xl font-extralight tracking-wide text-slate-900 dark:text-white">Hardware Procurement</h2>
            <p className="text-slate-500 dark:text-white/30 text-[11px] uppercase tracking-widest mt-1">Architecture validation & compilation</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className={STYLE.inputPanel}>
          <div className="space-y-6">
            <div>
              <label className={STYLE.inputLabel}>Environment</label>
              <select 
                className={STYLE.inputField} 
                value={formData.environment} 
                onChange={(e) => handleInputChange('environment', e.target.value)}
              >
                <option value="bare-metal">Bare Metal</option>
                <option value="cloud">Cloud VPS</option>
              </select>
            </div>
            <div>
              <label className={STYLE.inputLabel}>CPU Cores</label>
              <input 
                type="number" 
                className={STYLE.inputField} 
                value={formData.cpuCores} 
                onChange={(e) => handleInputChange('cpuCores', parseInt(e.target.value, 10))} 
              />
            </div>
            <div>
              <label className={STYLE.inputLabel}>Clock Speed (GHz)</label>
              <input 
                type="number" 
                step="0.1" 
                className={STYLE.inputField} 
                value={formData.clockSpeed} 
                onChange={(e) => handleInputChange('clockSpeed', parseFloat(e.target.value))} 
              />
            </div>
            <div>
              <label className={STYLE.inputLabel}>Memory</label>
              <select 
                className={STYLE.inputField} 
                value={formData.ram} 
                onChange={(e) => handleInputChange('ram', parseInt(e.target.value, 10))}
              >
                <option value="128">128 GB</option>
                <option value="256">256 GB</option>
                <option value="512">512 GB</option>
                <option value="1024">1 TB</option>
              </select>
            </div>
            <div>
              <label className={STYLE.inputLabel}>Storage</label>
              <select 
                className={STYLE.inputField} 
                value={formData.storageType} 
                onChange={(e) => handleInputChange('storageType', e.target.value)}
              >
                <option value="nvme">NVMe PCIe Gen4</option>
                <option value="ssd">SATA SSD</option>
                <option value="hdd">HDD</option>
              </select>
            </div>
            <button 
              onClick={generateReport} 
              disabled={isAnalysing} 
              className={STYLE.submitBtn}
            >
              <span className="relative z-10">
                {isAnalysing ? 'Compiling Profile...' : 'Analyse Architecture'}
              </span>
              <div className={STYLE.submitBtnGlow}></div>
            </button>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-8">
          {!report ? (
            <div className={STYLE.emptyState}>
              <Cpu size={48} strokeWidth={0.5} className="mb-6 opacity-50 dark:opacity-30" />
              <p className="text-center font-extralight tracking-widest uppercase text-[10px]">Awaiting system parameters</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-1000 slide-in-from-right-8">
              <div className={STYLE.scorePanel}>
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-light text-slate-500 dark:text-white/50">
                  Suitability Index
                </h3>
                <div className={`text-6xl font-extralight ${getScoreColorClass(report.score)}`}>
                  {report.score}
                  <span className="text-2xl text-slate-400 dark:text-white/20">/100</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard 
                  icon={Cpu} 
                  layer="Compute" 
                  res={report.components.cpu} 
                />
                <MetricCard 
                  icon={MemoryStick} 
                  layer="Memory" 
                  res={report.components.ram} 
                />
                <MetricCard 
                  icon={formData.environment === 'cloud' ? Cloud : HardDrive} 
                  layer="Storage" 
                  res={report.components.storage} 
                />
              </div>

              <div className={STYLE.scriptPanel}>
                <div className={STYLE.scriptHeader}>
                  <span className="text-[9px] uppercase tracking-[0.3em] font-light text-slate-500 dark:text-white/40">
                    start-validator.sh
                  </span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(generateCliScript())} 
                    className={STYLE.copyBtn}
                  >
                    Copy
                  </button>
                </div>
                <div className="p-6 overflow-x-auto">
                  <pre className="text-xs font-light tracking-wide text-cyan-800 dark:text-cyan-300/60 leading-loose">
                    {generateCliScript()}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={exportJSON} className={STYLE.exportBtn}>
                  <Download size={12} /> Export JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigAdvisor;