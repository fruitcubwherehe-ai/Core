
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HARD_HITTING_QUOTES } from '../constants';
import { Quote } from 'lucide-react';

const QuoteTerminal: React.FC<{ activeColor: string }> = ({ activeColor }) => {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * HARD_HITTING_QUOTES.length));

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % HARD_HITTING_QUOTES.length);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="my-8 border border-[#1A1A1A] rounded-[24px] bg-[#020202] p-8 relative overflow-hidden flex flex-col items-center text-center">
      <div className="absolute top-0 left-0 p-4 opacity-5 pointer-events-none">
        <Quote size={40} style={{ color: activeColor }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm font-mono tracking-tight text-gray-400 italic max-w-2xl leading-relaxed"
        >
          "{HARD_HITTING_QUOTES[index]}"
        </motion.p>
      </AnimatePresence>
      <div className="mt-4 flex gap-1">
        <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: activeColor }} />
        <div className="w-1 h-1 rounded-full opacity-30" style={{ backgroundColor: activeColor }} />
        <div className="w-1 h-1 rounded-full opacity-10" style={{ backgroundColor: activeColor }} />
      </div>
    </div>
  );
};

export default QuoteTerminal;
