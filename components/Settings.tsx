
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { GameState, ColorTheme } from '../types';
import { ChevronLeft, Lock, Check, Trash2, ShieldAlert, X, Zap, Volume2, Activity, Disc, Download, UploadCloud, Loader2 } from 'lucide-react';
import { RESET_STRING, getRankData, RANKS } from '../constants';
import { getAllProofs, clearAndRestoreProofs } from '../storage';

interface SettingsProps {
  gameState: GameState;
  onBack: () => void;
  onUnlock: (id: string) => void;
  onSelect: (id: string) => void;
  onReset: () => void;
  onVolumeChange: (val: number) => void;
  onImport?: (newState: GameState) => void;
}

const Settings: React.FC<SettingsProps> = ({ gameState, onBack, onUnlock, onSelect, onReset, onVolumeChange, onImport }) => {
  const activeColor = gameState.themes.find(t => t.id === gameState.activeThemeId)?.hex || '#FF0000';
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  const currentRankName = RANKS[gameState.stats.rankIndex];
  const { color: rankColor, Icon: RankIcon } = getRankData(currentRankName);

  const iconVariants: Variants = {
    initial: (custom: any) => ({
      filter: custom?.isSelected ? 'grayscale(0%) brightness(100%)' : 'grayscale(100%) brightness(40%)',
      scale: 1,
      boxShadow: custom?.isSelected ? `0 0 20px ${activeColor}44` : '0 0 0px transparent',
    }),
    hover: (custom: any) => ({
      filter: 'grayscale(0%) brightness(120%)',
      scale: 1.2,
      boxShadow: `0 0 30px ${custom?.hex}88`,
      transition: { 
        type: 'spring' as const, 
        stiffness: 300, 
        damping: 15 
      }
    })
  };

  const volumeSegments = Array.from({ length: 24 }, (_, i) => i);
  const currentStep = Math.round(gameState.volume * 23);

  const handleExport = async () => {
    setIsSyncing(true);
    try {
      const proofs = await getAllProofs();
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        gameState,
        proofs
      };
      
      const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `redchain_core_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Backup protocol failed. Vault access restricted.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmImport = window.confirm("SECURITY OVERRIDE: Importing this file will PERMANENTLY overwrite all current neural history and visual logs. Proceed?");
    if (!confirmImport) return;

    setIsSyncing(true);
    const reader = new FileReader();
    
    reader.onerror = () => {
      alert("Failed to read backup file.");
      setIsSyncing(false);
    };

    reader.onload = async (event) => {
      try {
        const rawContent = event.target?.result as string;
        const data = JSON.parse(rawContent);

        if (!data.gameState || !data.proofs) {
          throw new Error("Invalid system backup signature.");
        }

        // 1. Clear and Restore Proofs (IDB)
        await clearAndRestoreProofs(data.proofs);
        
        // 2. Restore State (App State)
        if (onImport) {
          onImport(data.gameState);
        } else {
          // Robust fallback
          localStorage.setItem('REDCHAIN_HABIT_CORE_STATE_V4', JSON.stringify(data.gameState));
          window.location.reload();
        }
        
        // Final verification happens via App.tsx state update
      } catch (err) {
        console.error("System Synchronization Error:", err);
        alert("Import sequence failed. Data corrupted or incompatible version.");
      } finally {
        setIsSyncing(false);
        if (importFileRef.current) importFileRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="min-h-screen p-6 max-w-2xl mx-auto flex flex-col pb-32"
    >
      <header className="flex items-center gap-6 mb-12">
        <button 
          onClick={onBack}
          className="p-3 border border-[#1A1A1A] rounded-xl hover:bg-white/5 transition-colors group"
        >
          <ChevronLeft size={20} className="text-gray-500 group-hover:text-white transition-colors" />
        </button>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">System Vault</h1>
          <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase">Advanced Optimization Terminal</p>
        </div>
      </header>

      {/* Sync Controls */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button 
          onClick={handleExport}
          disabled={isSyncing}
          className="flex items-center justify-center gap-3 p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all group disabled:opacity-50 disabled:cursor-wait"
        >
          {isSyncing ? <Loader2 size={18} className="animate-spin text-white" /> : <Download size={18} className="text-gray-500 group-hover:text-white transition-colors" />}
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white">Export</p>
            <p className="text-[8px] text-gray-600 uppercase">Core Backup</p>
          </div>
        </button>
        <button 
          onClick={() => importFileRef.current?.click()}
          disabled={isSyncing}
          className="flex items-center justify-center gap-3 p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all group disabled:opacity-50 disabled:cursor-wait"
        >
          {isSyncing ? <Loader2 size={18} className="animate-spin text-white" /> : <UploadCloud size={18} className="text-gray-500 group-hover:text-white transition-colors" />}
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white">Import</p>
            <p className="text-[8px] text-gray-600 uppercase">Sync Vault</p>
          </div>
          <input type="file" ref={importFileRef} onChange={handleImport} accept=".json" className="hidden" />
        </button>
      </div>

      {/* Unique Neural Amplitude Terminal */}
      <div className="bg-black border border-[#1A1A1A] rounded-[40px] p-10 mb-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <Activity size={18} style={{ color: activeColor }} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-bold">Neural Resonance</h2>
              <p className="text-[8px] text-gray-700 uppercase tracking-widest mt-0.5">Frequency Amplitude Control</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-mono font-black text-white">{Math.round(gameState.volume * 100)}</span>
            <span className="text-[10px] text-gray-600 font-mono ml-1">dB</span>
          </div>
        </div>
        
        <div className="flex gap-1.5 h-20 items-center justify-between bg-black/40 p-4 rounded-3xl border border-white/5">
          {volumeSegments.map((segment) => {
            const isActive = segment <= currentStep;
            return (
              <motion.button
                key={segment}
                onClick={() => onVolumeChange(segment / 23)}
                className={`flex-1 rounded-full transition-all duration-500 ${
                  isActive ? 'opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'opacity-10 bg-gray-800'
                }`}
                style={{ 
                  backgroundColor: isActive ? activeColor : undefined,
                  height: `${20 + (Math.sin(segment * 0.3) * 30 + 50)}%`,
                  boxShadow: isActive ? `0 0 20px ${activeColor}44` : 'none'
                }}
                whileHover={{ scaleY: 1.2, opacity: 0.8 }}
                whileTap={{ scale: 0.9 }}
              />
            );
          })}
        </div>

        <div className="mt-8 flex justify-between items-center px-2">
           <div className="flex items-center gap-2">
             <Disc size={12} className="text-gray-800" />
             <span className="text-[7px] font-mono text-gray-700 uppercase tracking-widest">Atmosphere Sync: {gameState.volume > 0 ? 'ON' : 'OFF'}</span>
           </div>
           <div className="flex gap-1">
             <div className="w-1 h-1 rounded-full bg-gray-900" />
             <div className="w-1 h-1 rounded-full bg-gray-900" />
             <div className="w-1 h-1 rounded-full bg-gray-900" />
           </div>
        </div>
      </div>

      <div className="bg-[#050505] border border-[#1A1A1A] rounded-[24px] p-8 mb-8 flex flex-col md:flex-row gap-6 justify-between items-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-10" style={{ backgroundColor: activeColor }} />
        
        <div className="relative z-10 w-full md:w-auto">
          <div className="flex items-center gap-3 mb-1">
            <p className="text-[9px] text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
              <Zap size={10} style={{ color: activeColor }} />
              Mesh Credits
            </p>
          </div>
          <p className="text-3xl font-mono font-bold" style={{ color: activeColor }}>
            {gameState.stats.points.toLocaleString()}
          </p>
        </div>

        <div className="hidden md:block h-10 w-px bg-[#1A1A1A]" />
        
        <div className="text-right relative z-10 w-full md:w-auto">
          <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1 flex items-center justify-end gap-1.5">
            Active Rank
            <RankIcon size={10} style={{ color: rankColor }} />
          </p>
          <p className="text-xl font-bold uppercase tracking-tight" style={{ color: rankColor }}>
            {currentRankName.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-12">
        <h2 className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mb-3 ml-2">Progressive Skins</h2>
        {gameState.themes.map((theme) => {
          const isSelected = gameState.activeThemeId === theme.id;
          const canAfford = gameState.stats.points >= theme.cost;
          
          return (
            <motion.button
              key={theme.id}
              disabled={!theme.unlocked && !canAfford}
              onClick={() => theme.unlocked ? onSelect(theme.id) : onUnlock(theme.id)}
              initial="initial"
              whileHover="hover"
              custom={{ isSelected, hex: theme.hex }}
              className={`relative flex items-center justify-between p-6 border rounded-[22px] transition-all group overflow-hidden ${
                isSelected 
                  ? 'bg-white/5 border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]' 
                  : 'bg-black border-[#1A1A1A] hover:border-white/10 hover:bg-white/[0.01]'
              } ${!theme.unlocked && !canAfford ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
            >
              <motion.div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                style={{ background: `radial-gradient(circle at 20px 50%, ${theme.hex}, transparent 70%)` }}
              />

              <div className="flex items-center gap-5 relative z-10">
                <div className="relative">
                  <motion.div 
                    variants={iconVariants}
                    className="w-12 h-12 rounded-2xl relative overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: theme.hex }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-50" />
                    {!theme.unlocked && (
                      <Lock size={16} className="text-black/40 relative z-10" />
                    )}
                  </motion.div>
                  
                  {!theme.unlocked && canAfford && (
                    <motion.div 
                      className="absolute -inset-1 border border-white/10 rounded-2xl"
                      animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>

                <div className="text-left">
                  <h3 className="font-bold uppercase tracking-[0.15em] text-sm group-hover:text-white transition-colors">{theme.name}</h3>
                  <p className="text-[9px] text-gray-500 uppercase font-mono mt-1 group-hover:text-gray-400 transition-colors">
                    {theme.unlocked ? 'Registry Unlocked' : `Requirement: ${theme.cost.toLocaleString()} CR`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                {!theme.unlocked ? (
                  <div className="flex items-center gap-3">
                    {canAfford ? (
                      <motion.span 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[9px] text-green-500 font-bold uppercase tracking-widest border border-green-500/30 px-3 py-1.5 rounded-xl bg-green-500/5 backdrop-blur-sm"
                      >
                        Acquire
                      </motion.span>
                    ) : (
                      <Lock size={14} className="text-gray-700" />
                    )}
                  </div>
                ) : isSelected ? (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-1.5 bg-white/10 rounded-full border border-white/10"
                  >
                    <Check size={14} style={{ color: activeColor }} />
                  </motion.div>
                ) : (
                  <span className="text-[9px] text-gray-800 uppercase tracking-widest group-hover:text-gray-400 transition-colors font-bold">Deploy</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-auto pt-8 border-t border-[#1A1A1A]">
        <button 
          onClick={() => setShowResetModal(true)}
          className="w-full py-5 border border-red-950/30 rounded-[20px] bg-red-950/5 text-red-600/60 uppercase tracking-[0.5em] font-bold text-[10px] hover:bg-red-600/10 hover:text-red-500 transition-all flex items-center justify-center gap-3 active:scale-98"
        >
          <Trash2 size={14} />
          Wipe Neural History
        </button>
      </div>

      <AnimatePresence>
        {showResetModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-[#050505] border border-red-900/30 rounded-[40px] p-10 flex flex-col items-center text-center shadow-[0_0_100px_rgba(255,0,0,0.1)]"
            >
              <div className="w-20 h-20 bg-red-600/10 border border-red-600/20 rounded-full flex items-center justify-center mb-8">
                <ShieldAlert size={40} className="text-red-600" />
              </div>
              
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Security Override</h2>
              <p className="text-xs text-red-500 uppercase tracking-widest font-mono mb-8 opacity-60">Permanent Data Erase Requested</p>
              
              <div className="bg-black/50 border border-[#1A1A1A] p-6 rounded-2xl mb-8 w-full text-left">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Verification Challenge:</p>
                <p className="font-mono text-[11px] text-gray-400 select-none bg-white/[0.02] p-4 rounded-xl border border-white/5 mb-6 italic">
                  "{RESET_STRING}"
                </p>
                
                <input 
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="Type verification string..."
                  className="w-full bg-black border border-[#1A1A1A] rounded-xl px-5 py-4 focus:outline-none focus:border-red-600/50 transition-all font-mono text-xs placeholder:text-gray-800"
                />
              </div>

              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => { setShowResetModal(false); setResetConfirmText(''); }}
                  className="flex-1 py-4 border border-[#1A1A1A] rounded-2xl text-gray-500 uppercase tracking-widest font-bold text-[10px] hover:bg-white/5 transition-all"
                >
                  Abort
                </button>
                <button 
                  disabled={resetConfirmText !== RESET_STRING}
                  onClick={() => {
                    onReset();
                    setShowResetModal(false);
                    setResetConfirmText('');
                  }}
                  className={`flex-1 py-4 rounded-2xl uppercase tracking-[0.2em] font-black text-[10px] transition-all ${
                    resetConfirmText === RESET_STRING 
                      ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(255,0,0,0.3)] hover:scale-105 active:scale-95' 
                      : 'bg-[#111] text-gray-800 cursor-not-allowed'
                  }`}
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSyncing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 border-2 border-white/5 border-t-white rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Activity size={24} style={{ color: activeColor }} className="animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-white uppercase tracking-[0.5em] font-mono mb-2">Synchronizing Neural Vault</p>
              <p className="text-[8px] text-gray-500 uppercase tracking-widest">Awaiting System Acknowledgment...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Settings;
