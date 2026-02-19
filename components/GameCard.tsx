import React, { useState, useEffect, useRef } from 'react';
import { LotteryConfig, GeneratedNumbers } from '../types';
import { Ball } from './Ball';

interface GameCardProps {
  config: LotteryConfig;
}

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  type: 'coin' | 'confetti';
  color?: string; // For confetti
}

export const GameCard: React.FC<GameCardProps> = ({ config }) => {
  const [result, setResult] = useState<GeneratedNumbers | null>(null);
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // State for the "rolling" visual effect
  const [displayNumbers, setDisplayNumbers] = useState<{ zoneA: number[], zoneB?: number[] } | null>(null);
  const rollingIntervalRef = useRef<number | null>(null);

  // 3D Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle Mouse Move for 3D Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation (max 10 degrees)
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    
    setTilt({ x: rotateY, y: rotateX });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Helper to generate random set for visual effect
  const getRandomSet = () => {
    const a = Array.from({ length: config.zoneA.count }, () => 
      Math.floor(Math.random() * (config.zoneA.max - config.zoneA.min + 1)) + config.zoneA.min
    ).sort((x, y) => x - y);

    let b: number[] | undefined;
    if (config.zoneB) {
      b = Array.from({ length: config.zoneB.count }, () => 
        Math.floor(Math.random() * (config.zoneB.max - config.zoneB.min + 1)) + config.zoneB.min
      );
    }
    return { zoneA: a, zoneB: b };
  };

  // Start the rolling animation
  const startRolling = () => {
    setLoading(true);
    setResult(null);
    setFlash(false);
    setShowStamp(false);
    setParticles([]);
    
    // Immediate update
    setDisplayNumbers(getRandomSet());
    
    // Rapid updates
    if (rollingIntervalRef.current) clearInterval(rollingIntervalRef.current);
    rollingIntervalRef.current = window.setInterval(() => {
      setDisplayNumbers(getRandomSet());
    }, 80); // Update every 80ms
  };

  const stopRolling = (finalNumbers: GeneratedNumbers) => {
    if (rollingIntervalRef.current) {
      clearInterval(rollingIntervalRef.current);
      rollingIntervalRef.current = null;
    }
    setDisplayNumbers({
        zoneA: finalNumbers.zoneA,
        zoneB: finalNumbers.zoneB
    });
    setResult(finalNumbers);
    setLoading(false);
    
    // Trigger effects
    setFlash(true);
    setTimeout(() => {
        setFlash(false);
        setShowStamp(true);
        triggerCelebration();
    }, 100);
  };

  const triggerCelebration = () => {
      const particleCount = 40;
      const newParticles: Particle[] = [];
      const colors = ['#FFD700', '#FF0000', '#C0C0C0', '#FFA500']; // Gold, Red, Silver, Orange

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 0.8 + Math.random() * 1.2,
          type: Math.random() > 0.6 ? 'coin' : 'confetti',
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }

      setParticles(newParticles);
      // Clean up after animation
      setTimeout(() => setParticles([]), 3000);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (rollingIntervalRef.current) clearInterval(rollingIntervalRef.current);
    };
  }, []);

  // Pure random logic
  const generateRandom = () => {
    startRolling();
    
    // Simulate "rolling" time for excitement
    setTimeout(() => {
      const zoneA = new Set<number>();
      while (zoneA.size < config.zoneA.count) {
        zoneA.add(Math.floor(Math.random() * (config.zoneA.max - config.zoneA.min + 1)) + config.zoneA.min);
      }
      
      let zoneB: number[] | undefined = undefined;
      if (config.zoneB) {
        zoneB = [];
        const tempSet = new Set<number>();
        while (tempSet.size < config.zoneB.count) {
          tempSet.add(Math.floor(Math.random() * (config.zoneB.max - config.zoneB.min + 1)) + config.zoneB.min);
        }
        zoneB = Array.from(tempSet).sort((a, b) => a - b);
      }

      const finalRes: GeneratedNumbers = {
        zoneA: Array.from(zoneA).sort((a, b) => a - b),
        zoneB,
        source: 'random',
        timestamp: Date.now(),
      };
      
      stopRolling(finalRes);
    }, 1200); // 1.2s rolling time
  };

  return (
    <div 
        className="perspective-container h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
    >
       <div 
        ref={cardRef}
        className="relative preserve-3d transition-transform duration-100 ease-linear h-full"
        style={{
            transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`
        }}
       >
            {/* Card Glow Effect (Backing) */}
            <div 
                className={`absolute -inset-1 bg-gradient-to-br ${config.color} rounded-2xl opacity-40 blur-md transition duration-500`}
                style={{ transform: 'translateZ(-20px)' }}
            ></div>
            
            {/* Main Card Content */}
            <div className="relative bg-gradient-to-b from-[#5c0b0b] to-[#2a0505] border border-yellow-500/30 rounded-2xl p-6 flex flex-col items-center overflow-hidden h-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                
                {/* Dynamic Glare Effect based on tilt */}
                <div 
                    className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-30 bg-gradient-to-tr from-transparent via-white to-transparent"
                    style={{
                        transform: `translate(${tilt.x * 2}%, ${tilt.y * 2}%) scale(1.5)`,
                        background: `radial-gradient(circle at ${50 - tilt.x * 5}% ${50 - tilt.y * 5}%, rgba(255,255,255,0.4), transparent 50%)`
                    }}
                ></div>

                {/* Flash Effect Overlay */}
                {flash && <div className="absolute inset-0 bg-yellow-100 mix-blend-overlay pointer-events-none animate-flash z-30"></div>}

                {/* Celebration Particles (Coins & Confetti) */}
                {particles.map((p) => (
                    p.type === 'coin' ? (
                        <div 
                            key={p.id}
                            className="coin-particle"
                            style={{
                                left: `${p.left}%`,
                                animationDuration: `${p.duration}s`,
                                animationDelay: `${p.delay}s`,
                            }}
                        ></div>
                    ) : (
                        <div
                            key={p.id}
                            className="confetti"
                            style={{
                                left: `${p.left}%`,
                                animationDuration: `${p.duration}s`,
                                animationDelay: `${p.delay}s`,
                                backgroundColor: p.color
                            }}
                        ></div>
                    )
                ))}

                {/* Header */}
                <div className="flex items-center gap-3 mb-6 z-10" style={{ transform: 'translateZ(20px)' }}>
                    <h2 className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br ${config.color} drop-shadow-sm tracking-wider`}>
                    {config.name}
                    </h2>
                </div>

                {/* Result Area */}
                <div className="w-full flex-grow flex flex-col items-center justify-center min-h-[160px] py-4 relative" style={{ transform: 'translateZ(30px)' }}>
                    {/* Background Decoration for Numbers */}
                    {displayNumbers && !loading && (
                        <div className="absolute inset-0 bg-radial-gradient from-yellow-900/20 to-transparent animate-pulse -z-0 pointer-events-none"></div>
                    )}

                    {/* God Ray - Rotating Light Effect behind numbers */}
                    {showStamp && !loading && <div className="god-ray"></div>}

                    {/* The Stamp (Background Layer - z-index 0) */}
                    {/* Centering Fix: Use absolute centering on the container, animate inner div */}
                    {displayNumbers && showStamp && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none">
                            <div className="animate-stamp">
                                <div className="border-4 border-red-500/30 rounded-xl p-3 bg-red-500/5 backdrop-blur-[0px]">
                                    <div className="border-2 border-red-500/30 px-6 py-3">
                                        <span className="text-red-500/30 font-serif font-black text-6xl md:text-8xl tracking-[0.2em] whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                                            大吉
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {displayNumbers ? (
                        <div className="flex flex-col items-center z-10 relative">
                            <div className="flex flex-wrap gap-3 justify-center mb-2">
                                {displayNumbers.zoneA.map((num, idx) => (
                                    <Ball key={`a-${idx}`} number={num} isRolling={loading} delay={idx * 60} />
                                ))}
                                {displayNumbers.zoneB && displayNumbers.zoneB.map((num, idx) => (
                                    <Ball key={`b-${idx}`} number={num} isSpecial isRolling={loading} delay={(displayNumbers.zoneA.length * 60) + (idx * 60)} />
                                ))}
                            </div>
                            
                            {!loading && result && (
                                <div className="mt-6 px-6 py-1 rounded-full text-xs font-bold tracking-[0.3em] uppercase border text-yellow-300 border-yellow-500/50 bg-gradient-to-r from-yellow-900/40 via-yellow-800/40 to-yellow-900/40 animate-fade-in-up shadow-[0_0_15px_rgba(255,215,0,0.2)] backdrop-blur-sm">
                                    💰 財星高照 💰
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-40 space-y-2 text-yellow-100">
                            <span className="text-5xl filter drop-shadow-md animate-bounce" style={{ animationDuration: '3s' }}>🎰</span>
                            <span className="text-sm font-medium tracking-widest text-yellow-200/60">準備開獎</span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex w-full mt-6 z-10 px-4" style={{ transform: 'translateZ(40px)' }}>
                    <button
                    onClick={generateRandom}
                    disabled={loading}
                    className={`
                        w-full relative overflow-hidden bg-gradient-to-r ${config.color} text-black font-extrabold 
                        py-4 px-4 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.3)] 
                        hover:shadow-[0_0_25px_rgba(255,215,0,0.6)] hover:-translate-y-1 active:scale-[0.98] 
                        transition-all disabled:opacity-50 group-btn text-lg border-2 border-yellow-300/50
                        ${loading ? 'cursor-not-allowed grayscale-[0.3]' : ''}
                    `}
                    >
                        {loading && (
                            <span className="absolute inset-0 flex items-center justify-center">
                                <span className="w-full h-full animate-ping bg-yellow-200 opacity-20 rounded-xl"></span>
                            </span>
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-md">
                            <span>{loading ? '🔮' : '🎲'}</span> {loading ? '感應財氣中...' : '立即選號'}
                        </span>
                        <div className="absolute inset-0 shimmer opacity-50"></div>
                    </button>
                </div>
            </div>
       </div>
    </div>
  );
};