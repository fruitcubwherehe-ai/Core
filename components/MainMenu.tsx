
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppScreen } from '../types';
import { Play, Settings, X, Volume2, VolumeX, Radio } from 'lucide-react';

interface MainMenuProps {
  onNavigate: (screen: AppScreen) => void;
  activeColor: string;
  volume: number;
}

const MainMenu: React.FC<MainMenuProps> = ({ onNavigate, activeColor, volume }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    // Background music initialization
    const audio = new Audio('menu_music.mp4');
    audio.loop = true;
    audio.volume = volume * 0.4;
    audioRef.current = audio;

    const attemptPlay = () => {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          setAudioError(false);
        })
        .catch((err) => {
          console.log("Autoplay blocked. Awaiting user interaction.");
          setIsPlaying(false);
        });
    };

    attemptPlay();

    // Global listener to catch first interaction to unlock audio
    const unlockAudio = () => {
      if (audioRef.current && !isPlaying) {
        attemptPlay();
      }
    };
    window.addEventListener('click', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Sync volume updates from settings
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume * 0.4;
    }
  }, [volume]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, filter: 'blur(10px)' },
    visible: { y: 0, opacity: 1, filter: 'blur(0px)' }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-black">
      {/* Dynamic Background Atmosphere */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 transition-all duration-1000" 
        style={{ 
          background: `radial-gradient(circle at 50% 50%, ${activeColor}22 0%, transparent 70%), linear-gradient(45deg, ${activeColor}05 0%, transparent 100%)` 
        }} 
      />

      {/* Neural Link Status (Audio Indicator) */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-4 group">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-full backdrop-blur-md">
           <motion.div 
             animate={isPlaying ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : {}}
             transition={{ duration: 2, repeat: Infinity }}
             className="w-1.5 h-1.5 rounded-full" 
             style={{ backgroundColor: isPlaying ? activeColor : '#333' }} 
           />
           <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-gray-500">
             {isPlaying ? 'Neural Link Established' : 'Neural Link Idle'}
           </span>
           {isPlaying ? <Radio size={10} className="text-gray-600" /> : <VolumeX size={10} className="text-gray-800" />}
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm flex flex-col gap-6 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }} 
            transition={{ duration: 4, repeat: Infinity }}
            className="text-[10px] text-gray-600 uppercase tracking-[0.6em] mb-4 font-mono"
          >
            Awaiting Command
          </motion.div>
          <motion.h1 
            className="text-7xl font-black tracking-tighter mb-2 italic"
            style={{ color: activeColor, textShadow: `0 0 40px ${activeColor}44` }}
          >
            CORE
          </motion.h1>
          <div className="h-px w-12 bg-white/10 mx-auto mb-4" />
          <p className="text-gray-700 uppercase tracking-[0.4em] text-[9px] font-bold">
            Redchain Discipline Mesh
          </p>
        </motion.div>

        <motion.button
          variants={itemVariants}
          onClick={() => onNavigate(AppScreen.DASHBOARD)}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="group relative h-20 w-full border border-white/10 rounded-[28px] bg-white/[0.03] backdrop-blur-2xl overflow-hidden flex items-center justify-center transition-all hover:border-white/20 hover:bg-white/[0.05]"
        >
          <div className="flex items-center gap-5 text-white uppercase tracking-[0.5em] font-black text-sm">
            <Play size={18} fill={activeColor} className="text-transparent transition-all group-hover:scale-125" />
            <span>Engage</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </motion.button>

        <div className="grid grid-cols-2 gap-4">
          <motion.button
            variants={itemVariants}
            onClick={() => onNavigate(AppScreen.SETTINGS)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group relative h-16 border border-white/5 rounded-[24px] bg-white/[0.02] backdrop-blur-xl overflow-hidden flex items-center justify-center transition-all hover:border-white/10"
          >
            <div className="flex items-center gap-3 text-gray-400 group-hover:text-white uppercase tracking-[0.3em] font-bold text-[10px]">
              <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" />
              <span>Vault</span>
            </div>
          </motion.button>

          <motion.button
            variants={itemVariants}
            onClick={() => onNavigate(AppScreen.EXIT)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group relative h-16 border border-white/5 rounded-[24px] bg-white/[0.02] backdrop-blur-xl overflow-hidden flex items-center justify-center transition-all hover:border-red-500/20"
          >
            <div className="flex items-center gap-3 text-gray-500 group-hover:text-red-500 uppercase tracking-[0.3em] font-bold text-[10px]">
              <X size={14} />
              <span>Detach</span>
            </div>
          </motion.button>
        </div>

        <motion.div 
          variants={itemVariants}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/5 bg-black/40">
            <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_5px_green]" />
            <p className="text-[7px] text-gray-600 uppercase tracking-widest font-mono">
              Identity Verified: System Secure
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MainMenu;
