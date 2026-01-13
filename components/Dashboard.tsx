
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, AppScreen } from '../types';
import StatBlock from './StatBlock';
import HabitCard from './HabitCard';
import QuoteTerminal from './QuoteTerminal';
import { ChevronLeft, Plus, LayoutGrid, CalendarDays, Image as ImageIcon, TrendingUp } from 'lucide-react';

interface DashboardProps {
  gameState: GameState;
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
  onToggleHabit: (id: string) => void;
  onAddHabit: (title: string) => void;
  onDeleteHabit: (id: string) => void;
  onGlitch: () => void;
  onShowWeekly: () => void;
  onShowProofLog: () => void;
  isGlitching?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  gameState, 
  onBack, 
  onNavigate,
  onToggleHabit, 
  onAddHabit,
  onDeleteHabit,
  onShowWeekly,
  onShowProofLog,
  isGlitching
}) => {
  const [newHabitName, setNewHabitName] = useState('');
  const activeColor = useMemo(() => 
    gameState.themes.find(t => t.id === gameState.activeThemeId)?.hex || '#FF0000',
    [gameState]
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      onAddHabit(newHabitName.trim());
      setNewHabitName('');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen p-6 max-w-5xl mx-auto flex flex-col pb-32 relative">
      <div className="fixed inset-0 pointer-events-none opacity-40 transition-all duration-1000" style={{ background: `radial-gradient(circle at 50% -10%, ${activeColor}11 0%, transparent 60%), linear-gradient(to bottom, transparent 80%, ${activeColor}08 100%)` }} />

      <header className="flex items-center justify-between mb-12 relative z-10">
        <button onClick={onBack} className="p-3 border border-[#1A1A1A] rounded-2xl hover:bg-white/5 transition-all active:scale-95 group"><ChevronLeft size={20} className="text-gray-500 group-hover:text-white" /></button>
        <div className="flex gap-4">
          <button onClick={() => onNavigate(AppScreen.PROGRESS)} className="px-5 py-2.5 border border-[#1A1A1A] rounded-2xl bg-black/40 backdrop-blur-md hover:bg-white/5 transition-all flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-white"><TrendingUp size={14} />See Progress</button>
          <button onClick={onShowProofLog} className="px-5 py-2.5 border border-[#1A1A1A] rounded-2xl bg-black/40 backdrop-blur-md hover:bg-white/5 transition-all flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-white"><ImageIcon size={14} />Proof Log</button>
        </div>
      </header>

      <StatBlock stats={gameState.stats} activeColor={activeColor} isGlitching={isGlitching} />

      {/* Quote System: Positioned specifically between Stats and Nodes */}
      <QuoteTerminal activeColor={activeColor} />

      <div className="flex items-center justify-between mt-8 mb-8 relative z-10">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 text-gray-600"><LayoutGrid size={14} />Operational Nodes</h2>
        <button onClick={onShowWeekly} className="text-[10px] uppercase tracking-[0.25em] text-gray-600 hover:text-white flex items-center gap-2 border border-[#1A1A1A] px-5 py-2.5 rounded-2xl transition-all hover:bg-white/5 backdrop-blur-sm"><CalendarDays size={14} />Briefing</button>
      </div>

      <form onSubmit={handleAdd} className="mb-12 flex gap-4 relative z-10">
        <input type="text" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} placeholder="Enter new discipline protocol..." className="flex-1 bg-black/40 backdrop-blur-xl border border-[#1A1A1A] rounded-[24px] px-8 py-5 focus:outline-none focus:border-white/10 transition-all font-mono placeholder:text-gray-800 text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" />
        <button type="submit" className="px-8 rounded-[24px] text-black font-black uppercase transition-all hover:scale-[1.03] active:scale-95 shadow-2xl flex items-center justify-center" style={{ backgroundColor: activeColor, boxShadow: `0 10px 40px ${activeColor}22` }}><Plus size={26} /></button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <AnimatePresence mode="popLayout">
          {gameState.habits.map((habit) => <HabitCard key={habit.id} habit={habit} activeColor={activeColor} onToggle={() => onToggleHabit(habit.id)} onDelete={() => onDeleteHabit(habit.id)} />)}
        </AnimatePresence>
        {gameState.habits.length === 0 && <div className="col-span-full border border-dashed border-[#1A1A1A] rounded-[40px] p-24 text-center flex flex-col items-center justify-center gap-6 opacity-30"><div className="w-16 h-16 border border-[#1A1A1A] rounded-full flex items-center justify-center bg-white/[0.01]"><Plus size={24} className="text-gray-700" /></div><p className="font-mono uppercase text-[10px] tracking-[0.3em] leading-relaxed text-gray-500">System Idle. Awaiting Discipline Input.<br/>Discipline is the bridge to mastery.</p></div>}
      </div>
    </motion.div>
  );
};

export default Dashboard;
