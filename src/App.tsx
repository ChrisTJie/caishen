import { useCallback, useEffect, useState } from 'react';
import { version } from '../package.json';
import { LOTTERY_GAMES } from './constants';
import { GameCard } from './components/lottery/GameCard';
import { HistoryPanel } from './components/lottery/HistoryPanel';
import { CustomLottery } from './components/lottery/CustomLottery';
import { ShichenPage } from './components/shichen/ShichenPage';
import { FortuneRitual } from './components/ritual/FortuneRitual';
import { GoldDustCursor } from './components/layout/GoldDustCursor';
import { Lanterns } from './components/layout/Lanterns';
import { Particles } from './components/layout/Particles';
import { WarningFooter } from './components/layout/WarningFooter';
import { WealthWaves } from './components/layout/WealthWaves';
import { FortuneProvider, useFortune } from './context/FortuneContext';
import { useHistory } from './hooks/useHistory';
import { audioService } from './lib/audio';
import { motion, AnimatePresence } from 'framer-motion';

function AppShell() {
  const [currentPage, setCurrentPage] = useState<'home' | 'custom' | 'shichen'>('home');
  const [isBGMOn, setIsBGMOn] = useState(false);
  const [isRitualOpen, setIsRitualOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { history, addToHistory, clearHistory } = useHistory();
  const { poem, setPoem } = useFortune();

  const toggleBGM = async () => {
    if (isBGMOn) {
      audioService.setMuted(true);
      setIsBGMOn(false);
      return;
    }
    audioService.setMuted(false);
    await audioService.startBGM();
    setIsBGMOn(true);
  };

  const closeHistory = useCallback(() => setIsHistoryOpen(false), []);
  const closeRitual = useCallback(() => setIsRitualOpen(false), []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentPage]);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-red-800 text-white selection:bg-yellow-400 selection:text-red-900">
      <GoldDustCursor />
      <WarningFooter />

      <AnimatePresence>
        {isHistoryOpen ? (
          <HistoryPanel history={history} onClear={clearHistory} onClose={closeHistory} />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isRitualOpen ? (
          <FortuneRitual
            onComplete={(nextPoem) => {
              setPoem(nextPoem);
              setIsRitualOpen(false);
            }}
            onClose={closeRitual}
          />
        ) : null}
      </AnimatePresence>

      <nav className="fixed top-0 right-0 left-0 z-[100] flex flex-nowrap items-center justify-end gap-1.5 overflow-x-auto bg-gradient-to-b from-red-950/80 to-transparent px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-md md:top-6 md:right-6 md:left-auto md:w-auto md:overflow-visible md:bg-none md:p-0 md:pt-0 md:backdrop-blur-none md:gap-4">
        <button
          type="button"
          onClick={() => void toggleBGM()}
          aria-label={isBGMOn ? '關閉所有音效' : '開啟所有音效'}
          aria-pressed={isBGMOn}
          title={isBGMOn ? '關閉所有音效' : '開啟所有音效'}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all ${
            isBGMOn
              ? 'border-yellow-400 bg-yellow-500/40 text-yellow-100'
              : 'border-yellow-500/40 bg-red-950/50 text-yellow-100/80'
          }`}
        >
          <span aria-hidden="true">{isBGMOn ? '🔊' : '🔇'}</span>
        </button>
        {currentPage !== 'home' ? (
          <button
            type="button"
            onClick={() => setCurrentPage('home')}
            className="min-h-11 rounded-full border border-yellow-500/50 bg-yellow-500/25 px-3 py-2 text-xs font-bold text-yellow-50 shadow-lg backdrop-blur-md transition-all hover:bg-yellow-500/40 md:px-4 md:text-sm md:text-yellow-200"
          >
            首頁
          </button>
        ) : null}
        {currentPage !== 'custom' ? (
          <button
            type="button"
            onClick={() => setCurrentPage('custom')}
            className="min-h-11 rounded-full border border-yellow-500/50 bg-yellow-500/25 px-3 py-2 text-xs font-bold text-yellow-50 shadow-lg backdrop-blur-md transition-all hover:bg-yellow-500/40 md:px-4 md:text-sm md:text-yellow-200"
          >
            自定義
          </button>
        ) : null}
        {currentPage !== 'shichen' ? (
          <button
            type="button"
            onClick={() => setCurrentPage('shichen')}
            className="min-h-11 rounded-full border border-yellow-500/50 bg-yellow-500/25 px-3 py-2 text-xs font-bold text-yellow-50 shadow-lg backdrop-blur-md transition-all hover:bg-yellow-500/40 md:px-4 md:text-sm md:text-yellow-200"
          >
            時辰
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setIsRitualOpen(true)}
          className="min-h-11 rounded-full border border-red-500/50 bg-red-600/40 px-3 py-2 text-xs font-bold text-red-50 shadow-lg backdrop-blur-md transition-all hover:bg-red-600/50 md:px-4 md:text-sm md:text-red-100"
        >
          求籤
        </button>
        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="min-h-11 rounded-full border border-yellow-500/30 bg-yellow-500/15 px-3 py-2 text-xs font-bold text-yellow-50 shadow-lg backdrop-blur-md transition-all hover:bg-yellow-500/20 md:px-4 md:text-sm md:text-yellow-100"
        >
          紀錄
        </button>
      </nav>

      <div className="fixed inset-0 -z-30 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-600 via-red-800 to-[#3f0000]"></div>
      <div
        className="fixed inset-0 -z-20 bg-repeat opacity-20 mix-blend-overlay"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}oriental-tiles.svg)` }}
      ></div>

      <Lanterns />
      <WealthWaves />

      <div className="pointer-events-none fixed top-1/2 left-1/2 z-[-20] flex -translate-x-1/2 -translate-y-1/2 select-none flex-col items-center justify-center opacity-10 mix-blend-multiply">
        <span className="rotate-12 font-serif text-[40vh] leading-none font-black text-[#2a0505] blur-[2px] md:text-[60vh]">
          馬
        </span>
      </div>

      <Particles />

      <header className="relative z-10 px-4 pt-[5.75rem] pb-8 text-center md:pt-24 md:pb-12">
        <div className="relative z-10">
          <h1 className="mb-2 bg-gradient-to-b from-[#fff7cc] via-[#ffe564] to-[#c5a000] bg-clip-text text-[2.5rem] leading-tight font-black tracking-wide text-transparent filter drop-shadow-[0_4px_8px_rgba(160,20,20,0.9)] sm:text-5xl md:text-6xl lg:text-8xl">
            發財靈籤
          </h1>
          <div className="mt-4 flex flex-col items-center justify-center gap-2 font-bold tracking-wide text-yellow-200 md:flex-row md:gap-4 md:tracking-[0.2em] md:uppercase">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-yellow-400 shadow-[0_0_5px_yellow]"></span>
              <span className="font-serif text-lg text-yellow-100 drop-shadow-lg md:text-xl">金馬奔騰</span>
              <span className="h-[2px] w-8 bg-yellow-400 shadow-[0_0_5px_yellow]"></span>
            </div>
            <span className="hidden text-yellow-500/50 md:block">•</span>
            <span className="text-sm text-yellow-100 drop-shadow md:text-base md:opacity-90">馬到成功 • 財源廣進</span>
          </div>
          {poem ? (
            <p
              className="mx-auto mt-5 max-w-xl break-words px-1 text-sm leading-relaxed tracking-normal text-yellow-50 md:tracking-widest"
              role="status"
            >
              今日靈籤：{poem.title} · {poem.level} — {poem.blessing}
            </p>
          ) : null}
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
            <main className="relative z-10 container mx-auto max-w-6xl px-4 pb-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10 lg:grid-cols-3">
                {Object.values(LOTTERY_GAMES).map((game) => (
                  <GameCard
                    key={game.id}
                    config={game}
                    onSave={(sets) => addToHistory(game.name, sets, poem)}
                  />
                ))}
              </div>
            </main>
          </motion.div>
        ) : currentPage === 'custom' ? (
          <motion.div
            key="custom"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <main className="relative z-10 container mx-auto max-w-6xl px-4 pb-8">
              <CustomLottery onSave={(name, sets) => addToHistory(name, sets, poem)} />
            </main>
          </motion.div>
        ) : (
          <motion.div
            key="shichen"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <main className="relative z-10 container mx-auto max-w-6xl px-4 pb-8">
              <ShichenPage />
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="relative z-20 mb-[calc(5.75rem+env(safe-area-inset-bottom))] px-4 pb-6 text-center font-mono text-xs text-yellow-100/70">
        <div className="mb-2">
          <span className="inline-block cursor-default rounded border border-yellow-200/20 bg-red-900/40 px-2 py-1 shadow-sm backdrop-blur-sm">
            丙午年特別版 v{version}
          </span>
        </div>
        LUCKY LAB © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <FortuneProvider>
      <AppShell />
    </FortuneProvider>
  );
}
