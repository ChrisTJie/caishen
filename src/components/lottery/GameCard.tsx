import { useRef, useState, type MouseEvent } from 'react';
import type { LotteryConfig, NumberSet } from '../../types';
import { Ball } from './Ball';
import { GameRules } from './GameRules';
import { generateDraw, generateDrawSets, writeNumberSet } from '../../lib/lottery';
import { formatShareText } from '../../lib/share';
import { DEFAULT_SET_COUNTS, setCategoryLabel } from '../../constants';
import { useFortune } from '../../context/FortuneContext';
import { useCoarsePointer, usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useRollingDraw } from '../../hooks/useRollingDraw';
import { ShareButton } from '../ui/ShareButton';
import { SetSwitcher } from './SetSwitcher';

interface GameCardProps {
  config: LotteryConfig;
  onSave?: (sets: NumberSet[]) => void;
}

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  type: 'coin' | 'confetti';
  color?: string;
}

export function GameCard({ config, onSave }: GameCardProps) {
  const { poem } = useFortune();
  const reducedMotion = usePrefersReducedMotion();
  const coarsePointer = useCoarsePointer();
  const enableTilt = !reducedMotion && !coarsePointer;
  const { loading, result, display, start } = useRollingDraw();
  const [setCount, setSetCount] = useState(1);
  const [allSets, setAllSets] = useState<NumberSet[] | null>(null);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [flash, setFlash] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const digitRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !glareRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -5;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 5;
    cardRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    glareRef.current.style.transform = `translate(${rotateY * 2}%, ${rotateX * 2}%) scale(1.5)`;
    glareRef.current.style.background = `radial-gradient(circle at ${50 - rotateY * 5}% ${50 - rotateX * 5}%, rgba(255,255,255,0.4), transparent 50%)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
    if (glareRef.current) {
      glareRef.current.style.transform = 'translate(0%, 0%) scale(1.5)';
      glareRef.current.style.background =
        'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4), transparent 50%)';
    }
  };

  const triggerCelebration = () => {
    if (reducedMotion) return;
    const particleCount = window.innerWidth < 768 ? 20 : 40;
    const colors = ['#FFD700', '#FF0000', '#C0C0C0', '#FFA500'];
    setParticles(
      Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 0.8 + Math.random() * 1.2,
        type: Math.random() > 0.6 ? 'coin' : 'confetti',
        color: colors[Math.floor(Math.random() * colors.length)],
      })),
    );
    window.setTimeout(() => setParticles([]), 3000);
  };

  const generateRandom = async () => {
    if (loading) return;
    setFlash(false);
    setShowStamp(false);
    setParticles([]);
    setAllSets(null);
    setActiveSetIndex(0);
    const preview = () => generateDraw(config.zoneA, config.zoneB);
    const sets = generateDrawSets(config.zoneA, config.zoneB, setCount);
    await start(preview, sets[0], {
      onFrame: (next) => writeNumberSet(next, digitRefs.current),
    });
    setAllSets(sets);
    setFlash(true);
    window.setTimeout(() => {
      setFlash(false);
      setShowStamp(true);
      triggerCelebration();
    }, 100);
    onSave?.(sets);
  };

  const visibleSets = allSets ?? (display ? [display] : []);
  const showSetSwitcher = !loading && visibleSets.length > 1;
  const safeSetIndex = Math.min(activeSetIndex, Math.max(0, visibleSets.length - 1));
  const activeSet = visibleSets[safeSetIndex] ?? display;
  const shareText =
    allSets && result
      ? formatShareText({
          gameName: config.name,
          sets: allSets,
          fortune: poem ? { title: poem.title, level: poem.level } : null,
        })
      : '';

  return (
    <div
      className="perspective-container h-full"
      onMouseMove={enableTilt ? handleMouseMove : undefined}
      onMouseLeave={enableTilt ? handleMouseLeave : undefined}
    >
      <div
        ref={cardRef}
        className="preserve-3d relative h-full will-change-transform transition-transform duration-100 ease-linear"
      >
        <div
          className={`absolute -inset-1 bg-gradient-to-br ${config.color} rounded-2xl opacity-40 blur-md transition duration-500`}
          style={{ transform: 'translateZ(-20px)' }}
        ></div>

        <div className="relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-b from-[#5c0b0b] to-[#2a0505] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:p-6">
          <div
            ref={glareRef}
            className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-transparent via-white to-transparent opacity-30 mix-blend-overlay will-change-transform"
            style={{
              transform: 'scale(1.5)',
              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4), transparent 50%)',
            }}
          ></div>

          {flash ? (
            <div className="animate-flash pointer-events-none absolute inset-0 z-30 bg-yellow-100 mix-blend-overlay"></div>
          ) : null}

          {particles.map((particle) =>
            particle.type === 'coin' ? (
              <div
                key={particle.id}
                className="coin-particle"
                style={{
                  left: `${particle.left}%`,
                  animationDuration: `${particle.duration}s`,
                  animationDelay: `${particle.delay}s`,
                }}
              ></div>
            ) : (
              <div
                key={particle.id}
                className="confetti"
                style={{
                  left: `${particle.left}%`,
                  animationDuration: `${particle.duration}s`,
                  animationDelay: `${particle.delay}s`,
                  backgroundColor: particle.color,
                }}
              ></div>
            ),
          )}

          <div className="relative z-10 mb-4 flex w-full items-center justify-center" style={{ transform: 'translateZ(20px)' }}>
            <h2
              className={`bg-gradient-to-br text-center text-3xl font-black tracking-wide text-transparent sm:text-4xl ${config.color} bg-clip-text drop-shadow-sm`}
            >
              {config.name}
            </h2>
          </div>

          <div className="z-10 mb-4 flex w-full flex-col gap-3" style={{ transform: 'translateZ(20px)' }}>
            <div className="flex flex-col items-center gap-2" role="group" aria-label="每次選號組數">
              <p className="text-xs font-bold tracking-wide text-yellow-200/80">每次選號</p>
              <div className="flex items-center justify-center gap-2">
                {DEFAULT_SET_COUNTS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSetCount(count)}
                    className={`min-h-11 min-w-14 rounded-full border px-3 py-2 text-xs font-bold ${
                      setCount === count
                        ? 'border-yellow-400 bg-yellow-500/30 text-yellow-100'
                        : 'border-yellow-500/20 bg-red-950/40 text-yellow-200/70'
                    }`}
                  >
                    {count} 組
                  </button>
                ))}
              </div>
            </div>
            <GameRules>{config.description}</GameRules>
          </div>

          <div
            className="relative flex min-h-[160px] w-full flex-grow flex-col items-center justify-center py-4"
            style={{ transform: 'translateZ(30px)' }}
          >
            {display && !loading ? <div className="bg-radial-gold pointer-events-none absolute inset-0 -z-0 animate-pulse"></div> : null}
            {display && showStamp ? <div className="god-ray"></div> : null}

            {display && showStamp ? (
              <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none">
                <div className="animate-stamp">
                  <div className="rounded-xl border-4 border-red-500/30 bg-red-500/5 p-3">
                    <div className="border-2 border-red-500/30 px-6 py-3">
                      <span className="font-serif text-4xl font-black tracking-wider text-red-500/25 sm:text-6xl md:text-8xl md:tracking-[0.2em]">
                        {poem?.level ?? '大吉'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {activeSet ? (
              <div className="relative z-10 flex w-full flex-col items-center">
                {showSetSwitcher ? (
                  <div className="mb-4 w-full">
                    <SetSwitcher
                      count={visibleSets.length}
                      activeIndex={safeSetIndex}
                      onChange={setActiveSetIndex}
                      tabIdPrefix={`${config.id}-set-tab`}
                      panelId={`${config.id}-set-panel`}
                    />
                  </div>
                ) : null}

                <div
                  id={`${config.id}-set-panel`}
                  role={showSetSwitcher ? 'tabpanel' : undefined}
                  aria-labelledby={showSetSwitcher ? `${config.id}-set-tab-${safeSetIndex}` : undefined}
                  className="flex max-w-full flex-wrap justify-center gap-1 sm:gap-3"
                >
                  {activeSet.zoneA.map((num, idx) => (
                    <Ball
                      key={`a-${safeSetIndex}-${idx}`}
                      number={num}
                      isRolling={loading}
                      delay={idx * 60}
                      digitRef={
                        loading
                          ? (node) => {
                              digitRefs.current[idx] = node;
                            }
                          : undefined
                      }
                    />
                  ))}
                  {activeSet.zoneB?.map((num, idx) => (
                    <Ball
                      key={`b-${safeSetIndex}-${idx}`}
                      number={num}
                      isSpecial
                      isRolling={loading}
                      delay={activeSet.zoneA.length * 60 + idx * 60}
                      digitRef={
                        loading
                          ? (node) => {
                              digitRefs.current[activeSet.zoneA.length + idx] = node;
                            }
                          : undefined
                      }
                    />
                  ))}
                </div>

                {!loading && result ? (
                  <div className="animate-fade-in-up mt-3 max-w-full rounded-full border border-yellow-500/50 bg-gradient-to-r from-yellow-900/40 via-yellow-800/40 to-yellow-900/40 px-3 py-1 text-center text-xs font-bold tracking-wide text-yellow-200 sm:px-6 sm:tracking-widest">
                    {showSetSwitcher ? `${setCategoryLabel(safeSetIndex)} · ` : ''}
                    {poem ? `靈籤：${poem.title} · ${poem.level}` : '財星高照'}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-2 text-yellow-100 opacity-40">
                <span className="animate-bounce text-5xl drop-shadow-md filter" style={{ animationDuration: '3s' }}>
                  🎰
                </span>
                <span className="text-sm font-medium tracking-wide text-yellow-200/60">準備開獎</span>
              </div>
            )}
          </div>

          <div className="z-10 mt-4 flex w-full sm:mt-6 sm:px-4" style={{ transform: 'translateZ(40px)' }}>
            <button
              type="button"
              onClick={() => void generateRandom()}
              disabled={loading}
              className={`relative w-full overflow-hidden rounded-xl border-2 border-yellow-300/50 bg-gradient-to-r ${config.color} py-3 px-4 text-base font-extrabold text-black shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(255,215,0,0.6)] active:scale-[0.98] disabled:opacity-50 sm:py-4 sm:text-lg ${
                loading ? 'cursor-not-allowed grayscale-[0.3]' : ''
              }`}
            >
              {loading ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="h-full w-full animate-ping rounded-xl bg-yellow-200 opacity-20"></span>
                </span>
              ) : null}
              <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-md">
                <span>{loading ? '🔮' : '🎲'}</span> {loading ? '感應財氣中...' : '立即選號'}
              </span>
              <div className="shimmer absolute inset-0 opacity-50"></div>
            </button>
          </div>

          {result && !loading && shareText ? (
            <div className="animate-fade-in z-10 mt-4 flex w-full justify-center" style={{ transform: 'translateZ(20px)' }}>
              <ShareButton text={shareText} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
