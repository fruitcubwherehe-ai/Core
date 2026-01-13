
import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '../types';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Trophy, Target, Award, ShieldCheck, Zap, Bot, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface WeeklyReviewProps {
  gameState: GameState;
  onClose: () => void;
}

const WeeklyReview: React.FC<WeeklyReviewProps> = ({ gameState, onClose }) => {
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const activeColor = gameState.themes.find(t => t.id === gameState.activeThemeId)?.hex || '#FF0000';

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const completions = gameState.habits.filter(h => h.completedDays.includes(iso)).length;
      days.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        value: completions,
        fullDate: iso
      });
    }
    return days;
  }, [gameState]);

  const totalCompletions = chartData.reduce((acc, curr) => acc + curr.value, 0);
  const possibleCompletions = gameState.habits.length * 7;
  const completionRate = possibleCompletions > 0 ? (totalCompletions / possibleCompletions) * 100 : 0;

  useEffect(() => {
    async function getAIFeedback() {
      if (process.env.API_KEY) {
        setIsAiLoading(true);
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Act as a high-performance elite coach. 
            User completion data for the last 7 days: ${JSON.stringify(chartData)}. 
            Completion rate: ${Math.round(completionRate)}%. 
            Habits tracked: ${gameState.habits.map(h => h.title).join(', ')}.
            Give a hard-hitting, short mission debrief (max 60 words). 
            Focus on where they fell short and give one tactical advice to improve consistency. 
            Keep the tone dark, elite, and ultra-disciplined.`,
          });
          setAiFeedback(response.text || 'Protocol error. Analysis failed.');
        } catch (e) {
          setAiFeedback("System error: Neural link unstable. Discipline alone must guide you.");
        } finally {
          setIsAiLoading(false);
        }
      }
    }
    getAIFeedback();
  }, [chartData, completionRate, gameState.habits]);

  const medal = useMemo(() => {
    if (completionRate >= 90) return { name: 'GOLD', color: '#FFD700', icon: Trophy };
    if (completionRate >= 70) return { name: 'SILVER', color: '#E2E2E2', icon: Award };
    if (completionRate >= 40) return { name: 'BRONZE', color: '#CD7F32', icon: Award };
    return { name: 'CORE', color: '#333333', icon: Zap };
  }, [completionRate]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[300] flex items-center justify-center p-4 md:p-12 overflow-y-auto">
      <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-4xl bg-[#000000] border border-[#1A1A1A] rounded-[50px] p-8 md:p-16 relative overflow-hidden shadow-2xl my-8">
        <header className="mb-12 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center"><Target className="text-white" size={20} /></div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">After-Action Report</h2>
              <p className="text-[9px] text-gray-600 uppercase tracking-[0.4em] mt-1">Neuro-Chain Efficiency Analysis</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 relative z-10">
          <div className="space-y-8">
            <div className="flex items-end gap-4">
              <div className="text-7xl font-black tracking-tighter leading-none" style={{ color: activeColor }}>{Math.round(completionRate)}<span className="text-xl text-gray-800 ml-1">%</span></div>
              <div className="pb-2">
                <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Efficiency Rating</p>
                <div className="flex gap-1">
                   {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-1 rounded-full" style={{ backgroundColor: completionRate >= (i*20) ? activeColor : '#111' }} />)}
                </div>
              </div>
            </div>

            <div className="p-8 border border-[#1A1A1A] rounded-[30px] bg-white/[0.01] flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-500 tracking-widest"><Bot size={14} style={{ color: activeColor }} /> Mission Debrief (AI Analysis)</div>
              {isAiLoading ? (
                <div className="flex items-center gap-3 py-4"><Loader2 className="animate-spin text-gray-700" size={16} /><p className="text-[11px] font-mono text-gray-600 italic">Processing neural history...</p></div>
              ) : (
                <p className="text-sm font-mono text-gray-400 leading-relaxed italic">"{aiFeedback}"</p>
              )}
            </div>
          </div>

          <div className="h-64 border border-[#1A1A1A] rounded-[30px] p-6 bg-[#030303] flex flex-col">
             <p className="text-[10px] text-gray-700 uppercase tracking-widest mb-6 font-mono">Discipline Continuity Chart</p>
             <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#222" fontSize={8} tickLine={false} axisLine={false} dy={5} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={activeColor} fillOpacity={0.2 + (index * 0.12)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
             </div>
          </div>
        </div>

        <button onClick={onClose} className="w-full py-6 border border-white/5 rounded-[24px] bg-white text-black uppercase tracking-[0.5em] font-black text-[10px] hover:scale-[1.01] active:scale-95 transition-all shadow-xl">Acknowledge & Sync</button>
      </motion.div>
    </motion.div>
  );
};

export default WeeklyReview;
