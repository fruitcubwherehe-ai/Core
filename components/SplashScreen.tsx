
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative">
        {/* Core Geometry */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-48 h-48 border border-red-600/30 rounded-[30%] absolute -inset-0 flex items-center justify-center"
        />
        
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-48 h-48 border-2 border-red-600/60 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,0,0,0.2)]"
        >
          <div className="w-12 h-12 bg-red-600 rounded-sm rotate-45 shadow-[0_0_30px_rgba(255,0,0,0.8)]" />
        </motion.div>
      </div>

      <motion.div 
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-[0.4em] uppercase font-mono">
          REDCHAIN
        </h1>
        <p className="text-gray-500 text-xs mt-2 tracking-widest uppercase">
          Habit-Core Protocol V1.0
        </p>
      </motion.div>

      {/* Loading Progress Bar */}
      <div className="absolute bottom-20 w-64 h-[1px] bg-gray-900 overflow-hidden">
        <motion.div 
          className="h-full bg-red-600"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
};

export default SplashScreen;
