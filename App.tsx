
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppScreen, GameState, Habit, Proof } from './types';
import { INITIAL_THEMES, RANKS, XP_PER_RANK, POINTS_PER_COMPLETION, MISS_PENALTY } from './constants';
import MainMenu from './components/MainMenu';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import SplashScreen from './components/SplashScreen';
import WeeklyReview from './components/WeeklyReview';
import VerificationModal from './components/VerificationModal';
import ProofLogView from './components/ProofLogView';
import ProgressView from './components/ProgressView';
import { saveProofImage, deleteProofImage } from './storage';

const STORAGE_KEY = 'REDCHAIN_HABIT_CORE_STATE_V4';

const getLocalDateString = (date: Date = new Date()) => {
  const pad = (num: number) => (num < 10 ? '0' : '') + num;
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.SPLASH);
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      habits: [],
      stats: { points: 0, totalXP: 0, rankIndex: 0 },
      themes: INITIAL_THEMES,
      activeThemeId: 'red',
      proofLog: [],
      volume: 0.5
    };
  });
  
  const [isGlitching, setIsGlitching] = useState(false);
  const [showWeeklyBriefing, setShowWeeklyBriefing] = useState(false);
  const [verificationTargetId, setVerificationTargetId] = useState<string | null>(null);
  const [levelUpRank, setLevelUpRank] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const checkDateAndReset = useCallback(() => {
    const todayStr = getLocalDateString();
    
    setGameState(prev => {
      if (prev.lastCheckDate && prev.lastCheckDate !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterday);
        
        let missedCount = 0;
        prev.habits.forEach(h => {
          if (!h.completedDays.includes(yesterdayStr)) missedCount++;
        });

        if (missedCount > 0) {
          setIsGlitching(true);
          const audio = new Audio('https://www.soundjay.com/communication/static-noise-01.mp3');
          audio.volume = 0.2 * prev.volume;
          audio.play().catch(() => {});
          setTimeout(() => setIsGlitching(false), 800);

          const penalty = missedCount * MISS_PENALTY;
          const newTotalXP = Math.max(0, prev.stats.totalXP - penalty);
          const newRankIndex = Math.floor(newTotalXP / XP_PER_RANK);
          const newPoints = Math.max(0, prev.stats.points - penalty);
          
          return {
            ...prev,
            stats: {
              ...prev.stats,
              points: newPoints,
              totalXP: newTotalXP,
              rankIndex: Math.min(newRankIndex, RANKS.length - 1)
            },
            lastCheckDate: todayStr
          };
        } else {
          return { ...prev, lastCheckDate: todayStr };
        }
      } else if (!prev.lastCheckDate) {
        return { ...prev, lastCheckDate: todayStr };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    checkDateAndReset();
    const timer = setInterval(checkDateAndReset, 10000); 
    return () => clearInterval(timer);
  }, [checkDateAndReset]);

  const activeTheme = useMemo(() => 
    gameState.themes.find(t => t.id === gameState.activeThemeId) || INITIAL_THEMES[0],
    [gameState.activeThemeId, gameState.themes]
  );

  const playClick = () => {
    const audio = new Audio('https://www.soundjay.com/buttons/button-20.mp3');
    audio.volume = 0.1 * gameState.volume;
    audio.play().catch(() => {});
  };

  const playLevelUp = useCallback(() => {
    const audio = new Audio('levelup.wav');
    audio.volume = gameState.volume;
    audio.play().catch(() => {
      console.warn("levelup.wav not found. Using system fallback.");
      const fallback = new Audio('https://www.soundjay.com/misc/sounds/bell-ring-01.mp3');
      fallback.volume = 0.3 * gameState.volume;
      fallback.play().catch(() => {});
    });
  }, [gameState.volume]);

  const handleVerification = async (imageData: string) => {
    if (!verificationTargetId) return;
    
    const todayStr = getLocalDateString();
    const habitId = verificationTargetId;
    const proofId = `proof_${Date.now()}`;

    await saveProofImage(proofId, imageData);

    setGameState(prev => {
      const habit = prev.habits.find(h => h.id === habitId);
      if (!habit || habit.completedDays.includes(todayStr)) return prev;

      const newProof: Proof = { id: proofId, habitId, date: new Date().toISOString() };
      const newHabits = prev.habits.map(h => h.id === habitId ? { ...h, completedDays: [...h.completedDays, todayStr] } : h);
      const newTotalXP = prev.stats.totalXP + 100;
      const newRankIndex = Math.min(Math.floor(newTotalXP / XP_PER_RANK), RANKS.length - 1);

      if (newRankIndex > prev.stats.rankIndex) {
        setTimeout(() => {
          setLevelUpRank(RANKS[newRankIndex]);
          playLevelUp();
          setIsGlitching(true);
          setTimeout(() => setIsGlitching(false), 1500);
          setTimeout(() => setLevelUpRank(null), 4000);
        }, 300);
      }

      return {
        ...prev,
        habits: newHabits,
        proofLog: [newProof, ...prev.proofLog],
        stats: {
          ...prev.stats,
          points: prev.stats.points + POINTS_PER_COMPLETION,
          totalXP: newTotalXP,
          rankIndex: newRankIndex
        }
      };
    });

    setVerificationTargetId(null);
    playClick();
  };

  const handleReset = () => {
    setGameState({
      habits: [],
      stats: { points: 0, totalXP: 0, rankIndex: 0 },
      themes: INITIAL_THEMES,
      activeThemeId: 'red',
      proofLog: [],
      lastCheckDate: getLocalDateString(),
      volume: gameState.volume
    });
    setScreen(AppScreen.MENU);
    playClick();
  };

  const setGlobalVolume = (val: number) => {
    setGameState(prev => ({ ...prev, volume: val }));
  };

  return (
    <div className={`min-h-screen bg-black text-white relative transition-all duration-500 overflow-x-hidden ${isGlitching ? 'animate-glitch' : ''}`} style={{ '--accent': activeTheme.hex } as any}>
      <AnimatePresence mode="wait">
        {screen === AppScreen.SPLASH && <SplashScreen key="splash" onComplete={() => setScreen(AppScreen.MENU)} />}
        {screen === AppScreen.MENU && <MainMenu key="menu" activeColor={activeTheme.hex} volume={gameState.volume} onNavigate={(s) => { playClick(); setScreen(s); }} />}
        {screen === AppScreen.DASHBOARD && (
          <Dashboard 
            key="dashboard"
            gameState={gameState}
            onBack={() => setScreen(AppScreen.MENU)}
            onNavigate={setScreen}
            onToggleHabit={(id) => setVerificationTargetId(id)}
            onAddHabit={(title) => {
              const newHabit: Habit = { id: Math.random().toString(36).substr(2, 9), title, completedDays: [], createdAt: new Date().toISOString() };
              setGameState(prev => ({ ...prev, habits: [newHabit, ...prev.habits] }));
              playClick();
            }}
            onDeleteHabit={(id) => {
              setGameState(prev => ({ 
                ...prev, 
                habits: prev.habits.filter(h => h.id !== id),
                proofLog: prev.proofLog.filter(p => p.habitId !== id)
              }));
              playClick();
            }}
            onGlitch={() => {}}
            onShowWeekly={() => setShowWeeklyBriefing(true)}
            onShowProofLog={() => setScreen(AppScreen.PROOFLOG)}
            isGlitching={isGlitching}
          />
        )}
        {screen === AppScreen.SETTINGS && (
          <Settings 
            key="settings"
            gameState={gameState}
            onBack={() => setScreen(AppScreen.MENU)}
            onUnlock={(themeId) => {
              setGameState(prev => {
                const theme = prev.themes.find(t => t.id === themeId);
                if (!theme || theme.unlocked || prev.stats.points < theme.cost) return prev;
                return {
                  ...prev,
                  stats: { ...prev.stats, points: prev.stats.points - theme.cost },
                  themes: prev.themes.map(t => t.id === themeId ? { ...t, unlocked: true } : t)
                };
              });
              playClick();
            }}
            onSelect={(themeId) => {
              setGameState(prev => ({ ...prev, activeThemeId: themeId }));
              playClick();
            }}
            onVolumeChange={setGlobalVolume}
            onReset={handleReset}
            onImport={(newState) => {
              // Ensure we merge to avoid breaking compatibility
              setGameState({ ...newState });
              setScreen(AppScreen.MENU);
              // Force local storage save to be safe
              localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
            }}
          />
        )}
        {screen === AppScreen.PROOFLOG && <ProofLogView key="prooflog" gameState={gameState} onBack={() => setScreen(AppScreen.DASHBOARD)} />}
        {screen === AppScreen.PROGRESS && <ProgressView key="progress" gameState={gameState} onBack={() => setScreen(AppScreen.DASHBOARD)} />}
        {screen === AppScreen.EXIT && (
          <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center gap-4" onAnimationComplete={() => setTimeout(() => window.location.reload(), 1000)}>
            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }} className="w-16 h-1 bg-white/20" />
            <span className="text-xl font-mono tracking-[0.5em] uppercase text-gray-500">System Shutdown</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {verificationTargetId && <VerificationModal onClose={() => setVerificationTargetId(null)} onCapture={handleVerification} accentColor={activeTheme.hex} />}
      </AnimatePresence>
      
      <AnimatePresence>
        {showWeeklyBriefing && <WeeklyReview gameState={gameState} onClose={() => setShowWeeklyBriefing(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {levelUpRank && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.3, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 2, rotate: 10, opacity: 0 }}
              className="text-center relative p-12"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.2, repeat: Infinity }}
                className="absolute inset-0 border-[2px] border-white/10 rounded-[40px] pointer-events-none"
              />
              
              <div className="space-y-2 mb-10">
                <p className="text-[10px] uppercase tracking-[1.2em] text-white/40 font-mono">Core Protocol Expansion</p>
                <motion.h1 
                  animate={{ x: [-2, 2, -2], filter: ["hue-rotate(0deg)", "hue-rotate(90deg)", "hue-rotate(0deg)"] }}
                  className="text-7xl md:text-9xl font-black italic tracking-tighter" 
                  style={{ color: activeTheme.hex, textShadow: `0 0 80px ${activeTheme.hex}` }}
                >
                  ASCENSION
                </motion.h1>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="h-px w-48 bg-white/20" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-[0.5em] text-gray-500 mb-2">NEURAL STATUS UPDATED TO</span>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl font-mono uppercase tracking-[0.4em] font-black text-white"
                  >
                    {levelUpRank}
                  </motion.p>
                </div>
                <div className="h-px w-48 bg-white/20" />
              </div>

              <motion.div 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.1, repeat: Infinity }}
                className="mt-16 text-[9px] uppercase tracking-[0.8em] text-white/30 font-bold"
              >
                Syncing New Capabilities...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
