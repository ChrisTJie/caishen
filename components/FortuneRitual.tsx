import React, { useState, useEffect, useRef } from 'react';
import { FortunePoem } from '../types';
import { POEMS } from '../constants';
import { audioService } from '../AudioService';

interface FortuneRitualProps {
    onComplete: (poem: FortunePoem) => void;
    onClose: () => void;
}

export const FortuneRitual: React.FC<FortuneRitualProps> = ({ onComplete, onClose }) => {
    const [isShaking, setIsShaking] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showPoem, setShowPoem] = useState<FortunePoem | null>(null);
    const timerRef = useRef<number | null>(null);

    // Simulate long press
    const handleStart = () => {
        setIsShaking(true);
        setProgress(0);
        timerRef.current = window.setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    handleFinish();
                    return 100;
                }
                return prev + 2;
            });
        }, 40);
    };

    const handleEnd = () => {
        setIsShaking(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (progress < 100) {
            setProgress(0);
        }
    };

    const handleFinish = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const randomPoem = POEMS[Math.floor(Math.random() * POEMS.length)];
        setShowPoem(randomPoem);
        audioService.playWin(); // Play sound here (when poem appears)
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-lg p-8 text-center text-yellow-100">
                {!showPoem ? (
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-black mb-8 tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600">
                            感應意念 • 祈求靈籤
                        </h2>

                        {/* Shaking Bamboo Tube Illustration */}
                        <div
                            className={`relative mb-12 transition-transform duration-75 ${isShaking ? 'animate-shake' : ''}`}
                            onMouseDown={handleStart}
                            onMouseUp={handleEnd}
                            onTouchStart={handleStart}
                            onTouchEnd={handleEnd}
                        >
                            <div className="w-32 h-48 bg-gradient-to-b from-yellow-800 to-yellow-950 rounded-b-3xl border-x-4 border-t-8 border-yellow-600 shadow-2xl flex flex-col items-center pt-8">
                                <div className="w-4 h-32 bg-yellow-500/30 rounded-full mb-1"></div>
                                <div className="w-4 h-32 bg-yellow-500/40 rounded-full -mt-24"></div>
                                <div className="w-4 h-32 bg-yellow-500/20 rounded-full -mt-24"></div>
                            </div>
                            <div className="mt-4 text-sm font-bold opacity-60 animate-pulse">
                                {isShaking ? '感應中...' : '長按籤筒開始'}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-64 h-2 bg-red-900/50 rounded-full overflow-hidden border border-yellow-500/20">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-200 transition-all duration-100"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>

                        <button
                            onClick={onClose}
                            className="mt-12 text-yellow-500/50 hover:text-yellow-400 transition-colors text-sm"
                        >
                            暫不求籤，直接退出
                        </button>
                    </div>
                ) : (
                    <div className="animate-stamp">
                        <div className="border-4 border-yellow-500/50 rounded-3xl p-8 bg-red-950/40 backdrop-blur-md shadow-[0_0_50px_rgba(255,215,0,0.2)]">
                            <span className="text-red-500 font-serif font-black text-6xl mb-6 block">
                                {showPoem.level}
                            </span>
                            <h3 className="text-2xl font-bold text-yellow-200 mb-6 border-y border-yellow-500/20 py-2">
                                {showPoem.title}
                            </h3>
                            <div className="space-y-2 mb-8 font-serif text-xl tracking-widest text-yellow-100">
                                {showPoem.poem.map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                            <p className="text-yellow-500 font-bold mb-8">
                                {showPoem.blessing}
                            </p>
                            <button
                                onClick={() => {
                                    onComplete(showPoem);
                                }}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black shadow-lg hover:shadow-yellow-500/20"
                            >
                                領取籤詩並回頁面
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
