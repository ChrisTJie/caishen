import React, { useEffect, useState, useRef, useMemo } from 'react';
import { version } from './package.json';
import { LOTTERY_GAMES } from './constants';
import { GameCard } from './components/GameCard';
import { HistoryPanel } from './components/HistoryPanel';
import { CustomLottery } from './components/CustomLottery';
import { FortuneRitual } from './components/FortuneRitual';
import { GeneratedNumbers, HistoryItem, FortunePoem } from './types';
import { audioService } from './AudioService';
import { motion, AnimatePresence } from 'framer-motion';

// --- Visual Components ---

// 1. Lantern Component
const Lanterns = React.memo(() => (
  <>
    {/* Left Lantern */}
    <div className="fixed top-0 left-4 md:left-12 z-0 animate-swing origin-top will-change-transform" style={{ animationDelay: '0s' }}>
      <div className="w-1 h-16 md:h-24 bg-yellow-600 mx-auto"></div>
      <div className="relative w-24 h-20 md:w-32 md:h-28 bg-red-700 rounded-xl shadow-[0_10px_30px_rgba(255,0,0,0.4)] border-y-4 border-yellow-600 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.2),_transparent)]"></div>
        <span className="text-yellow-400 font-serif font-bold text-4xl md:text-5xl drop-shadow-md text-stroke-sm">春</span>
      </div>
      <div className="flex justify-center -mt-1 gap-1">
        <div className="w-1 h-8 md:h-12 bg-yellow-600"></div>
        <div className="w-1 h-8 md:h-12 bg-yellow-600"></div>
        <div className="w-1 h-8 md:h-12 bg-yellow-600"></div>
      </div>
    </div>

    {/* Right Lantern */}
    <div className="fixed top-0 right-4 md:right-12 z-0 animate-swing origin-top will-change-transform" style={{ animationDelay: '-3s' }}>
      <div className="w-1 h-10 md:h-16 bg-yellow-600 mx-auto"></div>
      <div className="relative w-24 h-20 md:w-32 md:h-28 bg-red-700 rounded-xl shadow-[0_10px_30px_rgba(255,0,0,0.4)] border-y-4 border-yellow-600 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.2),_transparent)]"></div>
        <span className="text-yellow-400 font-serif font-bold text-4xl md:text-5xl drop-shadow-md text-stroke-sm">福</span>
      </div>
      <div className="flex justify-center -mt-1 gap-1">
        <div className="w-1 h-8 md:h-12 bg-yellow-600"></div>
        <div className="w-1 h-8 md:h-12 bg-yellow-600"></div>
        <div className="w-1 h-8 md:h-12 bg-yellow-600"></div>
      </div>
    </div>
  </>
));

// 2. Wealth Waves Component (Replaces Auspicious Clouds)
// Represents "Rolling Wealth" (財源滾滾)
const WealthWaves = React.memo(() => (
  <div className="fixed bottom-0 left-0 right-0 h-32 md:h-48 z-0 pointer-events-none overflow-hidden">
    {/* Layer 1: Back Wave (Slower, Darker Gold) */}
    <div className="absolute bottom-0 left-0 w-[200%] h-full opacity-30 text-yellow-700 animate-wave will-change-transform" style={{ animationDuration: '30s' }}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-current">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.3C989.49,25,1113-14.29,1200,52.47V0Z" transform="scale(1, -1) translate(0, -120)" />
      </svg>
    </div>

    {/* Layer 2: Middle Wave (Medium Speed, Bright Gold) */}
    <div className="absolute bottom-0 left-0 w-[200%] h-full opacity-40 text-yellow-500 animate-wave will-change-transform" style={{ animationDuration: '20s', animationDelay: '-5s' }}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-current">
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" transform="scale(1, -1) translate(0, -120)" />
      </svg>
    </div>

    {/* Layer 3: Front Wave (Fastest, Lightest Gold/Orange) */}
    <div className="absolute bottom-0 left-0 w-[200%] h-full opacity-30 text-yellow-300 animate-wave will-change-transform" style={{ animationDuration: '15s', animationDelay: '-2s' }}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-current">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" transform="scale(1, -1) translate(0, -120)" />
      </svg>
    </div>
  </div>
));

// 3. Gold Dust Cursor Hook & Component
const GoldDustCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{ x: number, y: number, size: number, speedX: number, speedY: number, life: number }>>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      // Add particles on move
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 3 + 1,
          speedX: Math.random() * 2 - 1,
          speedY: Math.random() * 2 - 1,
          life: 1
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      // Fixed: Iterate backwards when splicing or use filter
      const currentParticles = particlesRef.current;
      for (let i = currentParticles.length - 1; i >= 0; i--) {
        const p = currentParticles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 0.02;
        p.size *= 0.95;

        if (p.life <= 0) {
          currentParticles.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 215, 0, ${p.life})`;
          ctx.fill();
        }
      }

      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
};

// Particle component for background
const Particles = React.memo(() => {
  const [particles, setParticles] = useState<Array<{ id: number, left: number, delay: number, size: number }>>([]);

  useEffect(() => {
    const p = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      size: Math.random() * 6 + 2
    }));
    setParticles(p);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle absolute bg-yellow-400/30 blur-[1px] will-change-transform"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            bottom: '-20px'
          }}
        />
      ))}
    </div>
  );
});

// 4. Warning Footer Component (Option C)
const WarningFooter = React.memo(() => (
  <div className="fixed bottom-0 left-0 right-0 z-[60] py-2 px-4 bg-red-900/90 backdrop-blur-md border-t border-yellow-500/30 text-center">
    <p className="text-yellow-200 text-xs md:text-sm font-medium tracking-wide">
      ⚠️ 「本程式僅供娛樂參考，不涉及金錢賭博。中獎機率全憑運氣，請理性對待，量力而為。」
    </p>
  </div>
));

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'custom'>('home');
  const [isBGMOn, setIsBGMOn] = useState(false);
  const [isRitualOpen, setIsRitualOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('lottery_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('lottery_history', JSON.stringify(history));
  }, [history]);

  const toggleBGM = () => {
    if (isBGMOn) {
      audioService.stopBGM();
      audioService.setSFXMuted(true);
    } else {
      audioService.setSFXMuted(false);
      audioService.startBGM();
    }
    setIsBGMOn(!isBGMOn);
  };

  const addToHistory = (gameName: string, zoneA: number[], zoneB?: number[]) => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      gameName,
      zoneA,
      zoneB,
      timestamp: Date.now(),
    };
    setHistory(prev => [newItem, ...prev].slice(0, 10)); // Keep last 10
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen text-white bg-red-800 selection:bg-yellow-400 selection:text-red-900 overflow-hidden relative">
      <GoldDustCursor />
      <WarningFooter />

      <AnimatePresence>
        {isHistoryOpen && (
          <HistoryPanel
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            history={history}
            onClear={clearHistory}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRitualOpen && (
          <FortuneRitual
            onComplete={(poem) => {
              setIsRitualOpen(false);
              // Optionally play a sound or show a mini toast
            }}
            onClose={() => setIsRitualOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Navigation / Header Action */}
      <nav className="fixed top-6 right-6 z-[100] flex gap-2 md:gap-4 flex-wrap justify-end">
        <button
          onClick={toggleBGM}
          className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all shadow-lg ${isBGMOn ? 'bg-yellow-500/40 border-yellow-400 text-yellow-200' : 'bg-red-950/40 border-yellow-500/30 text-yellow-500/50'}`}
          title={isBGMOn ? '關閉所有音效' : '開啟所有音效'}
        >
          {isBGMOn ? '🔊' : '🔇'}
        </button>
        <button
          onClick={() => setIsRitualOpen(true)}
          className="px-4 py-2 rounded-full bg-red-600/30 backdrop-blur-md border border-red-500/50 text-red-100 text-sm font-bold hover:bg-red-600/50 transition-all shadow-lg"
        >
          🧧 求籤
        </button>
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="px-4 py-2 rounded-full bg-yellow-500/10 backdrop-blur-md border border-yellow-500/30 text-yellow-100 text-sm font-bold hover:bg-yellow-500/20 transition-all shadow-lg"
        >
          📜 紀錄
        </button>
        <button
          onClick={() => setCurrentPage(currentPage === 'home' ? 'custom' : 'home')}
          className="px-4 py-2 rounded-full bg-yellow-500/20 backdrop-blur-md border border-yellow-500/50 text-yellow-200 text-sm font-bold hover:bg-yellow-500/40 transition-all shadow-lg"
        >
          {currentPage === 'home' ? '🛠 自定義' : '🏠 首頁'}
        </button>
      </nav>

      {/* Dynamic Background layers */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-600 via-red-800 to-[#3f0000] -z-30"></div>
      <div className="fixed inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/oriental-tiles.png')] -z-20 mix-blend-overlay"></div>

      {/* Visual Decorations */}
      <Lanterns />
      <WealthWaves />

      {/* Horse Year Watermark - Huge Calligraphy Character */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-20 pointer-events-none select-none flex flex-col items-center justify-center opacity-10 mix-blend-multiply">
        <span className="font-serif font-black text-[40vh] md:text-[60vh] text-[#2a0505] rotate-12 blur-[2px] leading-none">
          馬
        </span>
      </div>

      <Particles />

      {/* Global Header */}
      <header className="pt-32 md:pt-24 pb-12 text-center px-4 relative">
        <div className="relative z-10">
          <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#fff7cc] via-[#ffe564] to-[#c5a000] drop-shadow-[0_4px_8px_rgba(160,20,20,0.9)] mb-2 tracking-wide filter">
            發財靈籤
          </h1>
          <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 text-yellow-200 font-bold tracking-[0.2em] uppercase mt-4 drop-shadow-sm">
            <div className="flex items-center gap-3">
              <span className="w-8 h-[2px] bg-yellow-400 shadow-[0_0_5px_yellow]"></span>
              <span className="text-lg md:text-xl font-serif text-yellow-100 drop-shadow-lg">金馬奔騰</span>
              <span className="w-8 h-[2px] bg-yellow-400 shadow-[0_0_5px_yellow]"></span>
            </div>
            <span className="hidden md:block text-yellow-500/50">•</span>
            <span className="text-sm md:text-base opacity-90 drop-shadow">馬到成功 • 財源廣進</span>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {currentPage === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <main className="container mx-auto px-4 pb-48 md:pb-56 max-w-6xl relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {Object.values(LOTTERY_GAMES).map((game) => (
                  <GameCard
                    key={game.id}
                    config={game}
                    onSave={(numbers) => addToHistory(game.name, numbers.zoneA, numbers.zoneB)}
                  />
                ))}
              </div>
            </main>
          </motion.div>
        ) : (
          <motion.div
            key="custom"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <main className="container mx-auto px-4 pb-48 md:pb-56 max-w-6xl relative z-10">
              <CustomLottery onSave={(name, a, b) => addToHistory(name, a, b)} />
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="absolute bottom-16 left-0 right-0 text-center text-yellow-100/40 text-xs font-mono z-20">
        <div className="mb-2">
          <span className="inline-block border border-yellow-200/20 rounded px-2 py-1 transform rotate-0 hover:rotate-6 transition-transform cursor-default bg-red-900/30 backdrop-blur-sm shadow-sm">
            甲午年特別版 v{version}
          </span>
        </div>
        LUCKY LAB © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;