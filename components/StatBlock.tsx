
import React from 'react';
import { motion } from 'framer-motion';
import { UserStats } from '../types';
import { RANKS, XP_PER_RANK, getRankData } from '../constants';
import { ShieldAlert, TrendingUp, Zap } from 'lucide-react';

interface StatBlockProps {
  stats: UserStats;
  activeColor: string;
  isGlitching?: boolean;
}

const StatBlock: React.FC<StatBlockProps> = ({ stats, activeColor, isGlitching }) => {
  const currentRankName = RANKS[stats.rankIndex];
  const nextRankName = RANKS[Math.min(stats.rankIndex + 1, RANKS.length - 1)];
  const { color: rankColor, Icon: RankIcon } = getRankData(currentRankName);
  
  const xpInCurrentRank = stats.totalXP % XP_PER_RANK;
  const progressPercent = (xpInCurrentRank / XP_PER_RANK) * 100;

  const glowOpacity = Math.min(0.05 + (stats.rankIndex * 0.02), 0.4);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
      <motion.div 
        animate={isGlitching ? { x: [-5, 5, -5, 0], scale: [1, 1.02, 0.98, 1] } : {}}
        className="col-span-1 md:col-span-2 border border-[#1A1A1A] rounded-[30px] p-10 bg-[#000000] relative overflow-hidden transition-all duration-700"
      >
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-1000"
          style={{ background: `radial-gradient(circle at 0% 0%, ${rankColor}${Math.floor(glowOpacity * 255).toString(16).padStart(2, '0')} 0%, transparent 60%)` }}
        />

        <div className="absolute top-0 right-0 p-8 opacity-5">
          <TrendingUp size={120} />
        </div>
        
        <div className="flex items-center gap-6 mb-8 relative z-10">
          <div className="p-4 border border-[#1A1A1A] rounded-2xl bg-white/[0.02] transition-colors" style={{ borderColor: isGlitching ? '#ff0000' : `${rankColor}33` }}>
            {isGlitching ? (
              <ShieldAlert size={28} className="text-red-600 animate-pulse" />
            ) : (
              <RankIcon size={28} style={{ color: rankColor }} />
            )}
          </div>
          <div>
            <h3 className="text-gray-600 uppercase tracking-[0.3em] text-[9px] mb-1">Neural Designation</h3>
            <p className={`text-3xl font-black uppercase tracking-tight transition-colors ${isGlitching ? 'text-red-500' : 'text-white'}`} style={{ color: isGlitching ? undefined : rankColor }}>
              {isGlitching ? "PROTOCOL DECAY" : currentRankName}
            </p>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-mono text-gray-500">
            <span className="flex items-center gap-2"><Zap size={10} style={{ color: rankColor }} /> {stats.totalXP} UNITS XP</span>
            <span>TARGET: {nextRankName}</span>
          </div>
          <div className="h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden border border-[#1A1A1A]">
            <motion.div 
              className="h-full rounded-full"
              style={{ backgroundColor: isGlitching ? '#ff0000' : rankColor, boxShadow: `0 0 15px ${rankColor}88` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
            />
          </div>
        </div>
      </motion.div>

      <div className="border border-[#1A1A1A] rounded-[30px] p-10 bg-[#000000] flex flex-col justify-center transition-all duration-700">
        <h3 className="text-gray-600 uppercase tracking-[0.3em] text-[9px] mb-2 flex items-center gap-2">
          <Zap size={10} style={{ color: activeColor }} />
          Operational Credits
        </h3>
        <p className="text-5xl font-mono font-bold tracking-tighter" style={{ color: isGlitching ? '#ff0000' : activeColor }}>
          {stats.points.toLocaleString()}
        </p>
        <div className="h-px w-12 bg-[#1A1A1A] my-6" />
        <p className="text-[10px] text-gray-700 uppercase tracking-widest font-mono">
          MESH SYSTEM SYNCED
        </p>
      </div>
    </div>
  );
};

export default StatBlock;
