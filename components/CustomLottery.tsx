import React, { useState } from 'react';
import { Ball } from './Ball';
import { audioService } from '../AudioService';

interface CustomLotteryProps {
    onSave: (name: string, zoneA: number[], zoneB?: number[]) => void;
}

export const CustomLottery: React.FC<CustomLotteryProps> = ({ onSave }) => {
    const [min, setMin] = useState(1);
    const [max, setMax] = useState(49);
    const [count, setCount] = useState(6);
    const [result, setResult] = useState<{ zoneA: number[] } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = () => {
        setLoading(true);
        setResult(null);

        setTimeout(() => {
            const numbers = new Set<number>();
            const rangeSize = max - min + 1;
            const actualCount = Math.min(count, rangeSize);

            while (numbers.size < actualCount) {
                numbers.add(Math.floor(Math.random() * rangeSize) + min);
            }

            const sorted = Array.from(numbers).sort((a, b) => a - b);
            setResult({ zoneA: sorted });
            setLoading(false);
            audioService.playWin();
            onSave('自定義選號', sorted);
        }, 1000);
    };

    const handleShare = async () => {
        if (!result) return;
        const shareText = `【發財靈籤】我的自定義發財號碼：\n` +
            `${result.zoneA.join(', ')}` +
            `\n祝大家財源廣進！💰✨`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: '發財靈籤',
                    text: shareText,
                    url: window.location.href,
                });
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            navigator.clipboard.writeText(shareText);
            alert('已複製分享內容到剪貼簿！');
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 pt-20 md:pt-12 max-w-4xl animate-fade-in">
            <div className="bg-gradient-to-b from-[#5c0b0b] to-[#2a0505] border border-yellow-500/30 rounded-3xl p-8 md:p-12 shadow-2xl">
                <header className="relative text-center mb-12">
                    <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 mb-4">
                        🛠 自定義選號
                    </h2>
                    <p className="text-yellow-200/60 tracking-widest uppercase text-sm">打造專屬您的發財靈感</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="space-y-2">
                        <label className="block text-yellow-500/80 text-sm font-bold ml-1">最小值</label>
                        <input
                            type="number"
                            value={min}
                            onChange={(e) => setMin(Number(e.target.value))}
                            className="w-full bg-red-950/50 border border-yellow-500/20 rounded-xl px-4 py-3 text-yellow-100 focus:outline-none focus:border-yellow-500/50 transition-all font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-yellow-500/80 text-sm font-bold ml-1">最大值</label>
                        <input
                            type="number"
                            value={max}
                            onChange={(e) => setMax(Number(e.target.value))}
                            className="w-full bg-red-950/50 border border-yellow-500/20 rounded-xl px-4 py-3 text-yellow-100 focus:outline-none focus:border-yellow-500/50 transition-all font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-yellow-500/80 text-sm font-bold ml-1">選號個數</label>
                        <input
                            type="number"
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            className="w-full bg-red-950/50 border border-yellow-500/20 rounded-xl px-4 py-3 text-yellow-100 focus:outline-none focus:border-yellow-500/50 transition-all font-mono"
                        />
                    </div>
                </div>

                <div className="flex justify-center mb-12">
                    <button
                        onClick={handleGenerate}
                        disabled={loading || max <= min || count <= 0}
                        className="group relative px-12 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black text-xl shadow-lg hover:shadow-yellow-500/20 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            {loading ? '🔮 感應中...' : '🎲 立即生成'}
                        </span>
                        {loading && <div className="absolute inset-0 bg-white/20 animate-pulse rounded-2xl"></div>}
                    </button>
                </div>

                {result && (
                    <div className="flex flex-col items-center animate-stamp">
                        <div className="flex flex-wrap gap-4 justify-center p-8 bg-yellow-500/5 rounded-3xl border border-yellow-500/10 shadow-inner">
                            {result.zoneA.map((n, i) => (
                                <Ball key={i} number={n} isRolling={loading} delay={i * 100} />
                            ))}
                        </div>
                        <div className="mt-8 text-yellow-400 font-serif font-black text-2xl tracking-[0.5em] opacity-80">
                            大吉 • 利見大人
                        </div>
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-3 px-6 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-lg hover:bg-yellow-500/20 transition-all shadow-lg"
                            >
                                <span>📤</span> 分享今日好運
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
