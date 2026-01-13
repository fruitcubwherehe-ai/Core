
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Habit } from '../types';
import { Camera, Trash2, CheckCircle2, Flame } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  activeColor: string;
  onToggle: () => void;
  onDelete: () => void;
}

// Consistent local YYYY-MM-DD helper
const getLocalDateString = (date: Date = new Date()) => {
  const pad = (num: number) => (num < 10 ? '0' : '') + num;
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
};

const HabitCard: React.FC<HabitCardProps> = ({ habit, activeColor, onToggle, onDelete }) => {
  const todayStr = getLocalDateString();
  const isCompletedToday = habit.completedDays.includes(todayStr);

  const createdDate = new Date(habit.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const completionRate = Math.min(100, (habit.completedDays.length / diffDays) * 100);

  const streakData = useMemo(() => {
    let count = 0;
    let checkDate = new Date();
    
    // If not completed today, we look starting from yesterday to see the currently active streak
    if (!isCompletedToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Iterate backwards to count consecutive completion days
    for (let i = 0; i < 3650; i++) {
      const checkStr = getLocalDateString(checkDate);
      if (habit.completedDays.includes(checkStr)) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // If they haven't completed today, the count we show in gray is count + 1 (the upcoming goal)
    // If they have completed today, it's the current streak count.
    return { 
      count: isCompletedToday ? count : count + 1, 
      isActive: isCompletedToday 
    };
  }, [habit.completedDays, todayStr, isCompletedToday]);

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completionRate / 100) * circumference;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`group relative p-8 border rounded-[30px] transition-all duration-500 overflow-hidden ${
        isCompletedToday ? 'bg-white/[0.03] border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.02)]' : 'bg-[#000000] border-[#1A1A1A]'
      }`}
    >
      <div 
        className="absolute -right-10 -top-10 w-32 h-32 blur-[80px] pointer-events-none transition-opacity duration-1000 opacity-0 group-hover:opacity-30"
        style={{ backgroundColor: activeColor }}
      />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-[#0a0a0a] fill-none"
                strokeWidth="3.5"
              />
              <motion.circle
                cx="32"
                cy="32"
                r={radius}
                className="fill-none"
                stroke={activeColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: "circOut" }}
                style={{ filter: `drop-shadow(0 0 6px ${activeColor}66)` }}
              />
            </svg>
            <div className="relative z-10 text-[9px] font-mono font-black tracking-tighter text-gray-400">
              {Math.round(completionRate)}%
            </div>
          </div>
          
          <div className="flex flex-col">
            <h3 className={`font-bold uppercase tracking-[0.2em] text-sm transition-all duration-300 ${
              isCompletedToday ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
            }`}>
              {habit.title}
            </h3>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: isCompletedToday ? activeColor : '#333', boxShadow: isCompletedToday ? `0 0 5px ${activeColor}` : 'none' }} />
                <p className="text-[9px] text-gray-700 uppercase font-mono tracking-widest">
                  TOTAL: {habit.completedDays.length}
                </p>
              </div>
              
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all duration-500 border ${
                streakData.isActive 
                  ? 'bg-orange-500/10 border-orange-500/30' 
                  : 'bg-white/5 border-white/5 opacity-40 grayscale'
              }`}>
                <Flame size={10} className={streakData.isActive ? 'text-orange-500' : 'text-gray-500'} />
                <p className={`text-[9px] font-bold font-mono tracking-tighter uppercase ${
                  streakData.isActive ? 'text-orange-400' : 'text-gray-500'
                }`}>
                  {streakData.count} STREAK
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isCompletedToday ? (
            <motion.div 
              key="completed"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-12 h-12 flex items-center justify-center text-green-500 bg-green-500/5 rounded-full border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]"
            >
               <CheckCircle2 size={24} />
            </motion.div>
          ) : (
            <button 
              key="not-completed"
              onClick={onToggle}
              title="Verification Required"
              className="w-12 h-12 rounded-full flex items-center justify-center border border-[#1A1A1A] text-gray-600 hover:border-white/30 hover:text-white transition-all hover:bg-white/5 active:scale-90 group/btn"
            >
              <Camera size={20} className="group-hover/btn:scale-110 transition-transform" />
            </button>
          )}
          
          <button 
            onClick={onDelete}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-900 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 hover:bg-red-500/10"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default HabitCard;
