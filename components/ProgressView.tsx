
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '../types';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, Target, X } from 'lucide-react';

interface ProgressViewProps {
  gameState: GameState;
  onBack: () => void;
}

const ProgressView: React.FC<ProgressViewProps> = ({ gameState, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const activeColor = gameState.themes.find(t => t.id === gameState.activeThemeId)?.hex || '#FF0000';

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

  const getDayDetails = (day: number) => {
    const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const completedHabits = gameState.habits.filter(h => h.completedDays.includes(dateStr));
    return {
      dateStr,
      completedHabits,
      efficiency: gameState.habits.length > 0 ? completedHabits.length / gameState.habits.length : 0
    };
  };

  const selectedDayData = useMemo(() => {
    if (selectedDay === null) return null;
    return getDayDetails(selectedDay);
  }, [selectedDay, currentDate, gameState.habits]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-6 max-w-4xl mx-auto flex flex-col pb-24">
      <header className="flex items-center justify-between mb-12">
        <button onClick={onBack} className="p-3 border border-[#1A1A1A] rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-black uppercase tracking-widest">{monthName} {year}</h1>
          <p className="text-[9px] text-gray-500 uppercase tracking-[0.4em]">Temporal Mastery Tracker</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 border border-[#1A1A1A] rounded-lg hover:bg-white/5"><ChevronLeft size={16} /></button>
          <button onClick={nextMonth} className="p-2 border border-[#1A1A1A] rounded-lg hover:bg-white/5"><ChevronRight size={16} /></button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-3 mb-12">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[9px] uppercase font-bold text-gray-700 tracking-widest mb-4">{d}</div>
        ))}
        {blanks.map(b => <div key={`b-${b}`} />)}
        {days.map(d => {
          const { efficiency } = getDayDetails(d);
          const isSelected = selectedDay === d;
          return (
            <motion.button 
              key={d} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDay(d)}
              className={`aspect-square border rounded-xl flex items-center justify-center relative group transition-all duration-300 ${
                isSelected ? 'border-white/40 ring-1 ring-white/20' : 'border-[#1A1A1A]'
              }`}
            >
              <span className={`text-[10px] relative z-10 transition-colors ${efficiency > 0 ? 'text-white font-bold' : 'text-gray-700'}`}>{d}</span>
              {efficiency > 0 && (
                <div 
                  className="absolute inset-1 rounded-lg pointer-events-none transition-all duration-500" 
                  style={{ backgroundColor: activeColor, opacity: 0.1 + (efficiency * 0.7), filter: `blur(${efficiency > 0.5 ? 8 : 4}px)` }} 
                />
              )}
              {isSelected && (
                <motion.div layoutId="day-outline" className="absolute -inset-1 border border-white/20 rounded-xl pointer-events-none" />
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {selectedDayData ? (
          <motion.div 
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-8 border border-[#1A1A1A] rounded-[30px] bg-white/[0.02] relative"
          >
            <button 
              onClick={() => setSelectedDay(null)}
              className="absolute top-6 right-6 p-2 text-gray-600 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Calendar size={20} style={{ color: activeColor }} />
              </div>
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em]">Log Entry for</p>
                <h3 className="text-lg font-black uppercase tracking-tight">{selectedDay} {monthName} {year}</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                 <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Protocols Completed: {selectedDayData.completedHabits.length} / {gameState.habits.length}</p>
                 <div className="flex gap-1">
                   {[1,2,3,4,5].map(i => (
                     <div key={i} className="w-4 h-1 rounded-full" style={{ backgroundColor: selectedDayData.efficiency >= (i*0.2) ? activeColor : '#111' }} />
                   ))}
                 </div>
              </div>

              {selectedDayData.completedHabits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedDayData.completedHabits.map(h => (
                    <div key={h.id} className="flex items-center gap-3 p-4 border border-white/5 bg-white/[0.02] rounded-2xl">
                      <CheckCircle2 size={14} className="text-green-500" />
                      <span className="text-[11px] uppercase tracking-wider font-bold text-gray-300">{h.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 border border-dashed border-[#1A1A1A] rounded-2xl text-center">
                  <p className="text-[10px] font-mono text-gray-700 uppercase tracking-widest">No Node Completions Recorded</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-auto p-12 border border-[#1A1A1A] border-dashed rounded-[30px] bg-white/[0.01] flex flex-col items-center justify-center text-center gap-4"
          >
            <Target size={24} className="text-gray-800" />
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-[0.4em]">Historical Log Terminal</p>
              <p className="text-[10px] text-gray-700 uppercase tracking-widest font-mono italic mt-1">Select a temporal point to review discipline accuracy</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProgressView;
