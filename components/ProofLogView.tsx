
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GameState, Proof } from '../types';
import { ChevronLeft, Camera, ShieldCheck } from 'lucide-react';
import { getProofImage } from '../storage';

interface ProofLogViewProps {
  gameState: GameState;
  onBack: () => void;
}

const ProofCard: React.FC<{ proof: Proof; habitTitle?: string; accentColor: string; idx: number }> = ({ proof, habitTitle, accentColor, idx }) => {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    getProofImage(proof.id).then(setImage);
  }, [proof.id]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="group relative aspect-square bg-[#050505] border border-[#1A1A1A] rounded-[20px] overflow-hidden"
    >
      {image ? (
        <img 
          src={image} 
          alt="Proof" 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black/50">
           <Camera size={20} className="text-gray-800 animate-pulse" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-[9px] font-bold text-white uppercase tracking-wider truncate mb-1">
          {habitTitle || 'Unknown Task'}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-[8px] font-mono text-gray-500 uppercase">
            {new Date(proof.date).toLocaleDateString()}
          </p>
          <ShieldCheck size={10} style={{ color: accentColor }} />
        </div>
      </div>
    </motion.div>
  );
};

const ProofLogView: React.FC<ProofLogViewProps> = ({ gameState, onBack }) => {
  const accentColor = gameState.themes.find(t => t.id === gameState.activeThemeId)?.hex || '#FF0000';

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="min-h-screen p-6 max-w-4xl mx-auto flex flex-col">
      <header className="flex items-center gap-6 mb-12">
        <button onClick={onBack} className="p-3 border border-[#1A1A1A] rounded-xl hover:bg-white/5 transition-colors"><ChevronLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Proof Vault</h1>
          <p className="text-[10px] text-gray-500 tracking-[0.2em] uppercase">Visual Record of Persistence</p>
        </div>
      </header>

      {gameState.proofLog.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#1A1A1A] rounded-[30px] p-20 text-center">
          <Camera size={48} className="text-gray-800 mb-4" />
          <p className="font-mono text-xs text-gray-600 uppercase tracking-widest">No visual records found in core memory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {gameState.proofLog.map((proof, idx) => (
            <ProofCard 
              key={proof.id} 
              proof={proof} 
              habitTitle={gameState.habits.find(h => h.id === proof.habitId)?.title} 
              accentColor={accentColor} 
              idx={idx} 
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ProofLogView;
