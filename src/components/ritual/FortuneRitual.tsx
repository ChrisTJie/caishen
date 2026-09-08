import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { isRitualComplete, tickRitualProgress } from '../../lib/ritual';
import { POEMS } from '../../constants';
import { audioService } from '../../lib/audio';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import type { FortunePoem } from '../../types';
import { motion } from 'framer-motion';

interface FortuneRitualProps {
  onComplete: (poem: FortunePoem) => void;
  onClose: () => void;
}

export function FortuneRitual({ onComplete, onClose }: FortuneRitualProps) {
  const [isShaking, setIsShaking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPoem, setShowPoem] = useState<FortunePoem | null>(null);
  const timerRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const finishedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useLockBodyScroll(true);
  useFocusTrap(true, containerRef, onClose);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearTimer();
    setIsShaking(false);
    const randomPoem = POEMS[Math.floor(Math.random() * POEMS.length)];
    setShowPoem(randomPoem);
    void audioService.playWin();
  }, [clearTimer]);

  const handleStart = useCallback(() => {
    if (finishedRef.current || showPoem) return;
    setIsShaking(true);
    progressRef.current = 0;
    setProgress(0);
    clearTimer();
    timerRef.current = window.setInterval(() => {
      progressRef.current = tickRitualProgress(progressRef.current);
      setProgress(progressRef.current);
      if (isRitualComplete(progressRef.current)) {
        handleFinish();
      }
    }, reducedMotion ? 12 : 40);
  }, [clearTimer, handleFinish, reducedMotion, showPoem]);

  const handleEnd = useCallback(() => {
    setIsShaking(false);
    clearTimer();
    if (!isRitualComplete(progressRef.current)) {
      progressRef.current = 0;
      setProgress(0);
    }
  }, [clearTimer]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleStart();
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleEnd();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end justify-center overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur-md sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ritual-title"
    >
      <motion.div
        ref={containerRef}
        tabIndex={-1}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative my-auto w-full max-w-lg py-4 text-center text-yellow-100 outline-none sm:p-8"
      >
        {!showPoem ? (
          <div className="flex flex-col items-center">
            <h2
              id="ritual-title"
              className="mb-6 bg-gradient-to-b from-yellow-200 to-yellow-600 bg-clip-text text-2xl font-black tracking-wide text-transparent sm:mb-8 sm:text-3xl sm:tracking-widest"
            >
              感應意念 • 祈求靈籤
            </h2>

            <div
              role="button"
              tabIndex={0}
              aria-label="按住籤筒求籤"
              className={`relative mb-12 touch-none transition-transform duration-75 ${
                isShaking ? 'animate-shake' : ''
              }`}
              onMouseDown={handleStart}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={(event) => {
                event.preventDefault();
                handleStart();
              }}
              onTouchEnd={handleEnd}
              onKeyDown={onKeyDown}
              onKeyUp={onKeyUp}
            >
              <div className="flex h-48 w-32 flex-col items-center rounded-b-3xl border-x-4 border-t-8 border-yellow-600 bg-gradient-to-b from-yellow-800 to-yellow-950 pt-8 shadow-2xl">
                <div className="mb-1 h-32 w-4 rounded-full bg-yellow-500/30"></div>
                <div className="-mt-24 h-32 w-4 rounded-full bg-yellow-500/40"></div>
                <div className="-mt-24 h-32 w-4 rounded-full bg-yellow-500/20"></div>
              </div>
              <div className="mt-4 animate-pulse px-2 text-sm leading-relaxed font-bold text-yellow-100/80">
                {isShaking ? '感應中...' : '長按籤筒開始'}
              </div>
            </div>

            <div
              className="h-2 w-full max-w-64 overflow-hidden rounded-full border border-yellow-500/20 bg-red-900/50"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-label="求籤進度"
            >
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-200 transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-8 min-h-11 text-sm text-yellow-200/80 transition-colors hover:text-yellow-400 sm:mt-12"
            >
              暫不求籤，直接退出
            </button>
          </div>
        ) : (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="animate-stamp">
            <div className="max-h-[min(40rem,calc(100dvh-3rem))] overflow-y-auto rounded-3xl border-4 border-yellow-500/50 bg-red-950/80 p-5 shadow-[0_0_50px_rgba(255,215,0,0.2)] backdrop-blur-md sm:p-8">
              <span className="mb-4 block font-serif text-5xl font-black text-red-400 sm:mb-6 sm:text-6xl">{showPoem.level}</span>
              <h3 className="mb-4 border-y border-yellow-500/20 py-2 text-xl font-bold text-yellow-200 sm:mb-6 sm:text-2xl">
                {showPoem.title}
              </h3>
              <div className="mb-6 space-y-2 font-serif text-lg leading-relaxed tracking-wide text-yellow-50 sm:mb-8 sm:text-xl sm:tracking-widest">
                {showPoem.poem.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <p className="mb-8 text-sm leading-relaxed font-bold text-yellow-500 sm:text-base">{showPoem.blessing}</p>
              <button
                type="button"
                onClick={() => onComplete(showPoem)}
                className="min-h-11 w-full rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 py-4 font-black text-black shadow-lg hover:shadow-yellow-500/20"
              >
                領取籤詩並回頁面
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
