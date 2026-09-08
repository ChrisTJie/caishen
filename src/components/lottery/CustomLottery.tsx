import { useEffect, useRef, useState } from 'react';
import { Ball } from './Ball';
import { GameRules } from './GameRules';
import { generateDraw, validateCustomRange, writeNumberSet } from '../../lib/lottery';
import { formatShareText } from '../../lib/share';
import { createPreset, loadPresets, savePresets } from '../../lib/presets';
import { PRESET_LIMIT } from '../../constants';
import { useFortune } from '../../context/FortuneContext';
import { useRollingDraw } from '../../hooks/useRollingDraw';
import { ShareButton } from '../ui/ShareButton';
import type { CustomPreset } from '../../types';

interface CustomLotteryProps {
  onSave: (name: string, sets: { zoneA: number[]; zoneB?: number[] }[]) => void;
}

export function CustomLottery({ onSave }: CustomLotteryProps) {
  const { poem } = useFortune();
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(49);
  const [count, setCount] = useState(6);
  const [presetName, setPresetName] = useState('');
  const [presets, setPresets] = useState<CustomPreset[]>(() => loadPresets());
  const { loading, result, display, start } = useRollingDraw();
  const digitRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const error = validateCustomRange(min, max, count);

  useEffect(() => {
    savePresets(presets);
  }, [presets]);

  const handleGenerate = async () => {
    if (error || loading) return;
    const preview = () => generateDraw({ min, max, count });
    const final = preview();
    await start(preview, final, {
      onFrame: (next) => writeNumberSet(next, digitRefs.current),
    });
    onSave('自定義選號', [final]);
  };

  const handleSavePreset = () => {
    if (error) return;
    const next = createPreset(presetName, min, max, count);
    setPresets((prev) => [next, ...prev].slice(0, PRESET_LIMIT));
    setPresetName('');
  };

  const shareText = result
    ? formatShareText({
        gameName: '自定義選號',
        sets: [result],
        fortune: poem ? { title: poem.title, level: poem.level } : null,
      })
    : '';

  return (
    <div className="animate-fade-in mx-auto max-w-4xl">
      <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-b from-[#5c0b0b] to-[#2a0505] p-5 shadow-2xl sm:rounded-3xl sm:p-8 md:p-12">
        <header className="relative mb-8 text-center md:mb-12">
          <h2 className="mb-3 bg-gradient-to-b from-yellow-200 to-yellow-600 bg-clip-text text-3xl font-black text-transparent sm:text-4xl md:text-6xl">
            自定義選號
          </h2>
          <p className="text-sm tracking-wide text-yellow-200/80 md:tracking-widest">打造專屬您的發財靈感</p>
        </header>

        <div className="mb-8">
          <GameRules>自由設定最小值、最大值與選號個數，使用不放回抽樣。僅供娛樂，不會提高中獎機率。</GameRules>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-3">
          <label className="space-y-2">
            <span className="ml-1 block text-sm font-bold text-yellow-500/80">最小值</span>
            <input
              type="number"
              value={min}
              onChange={(event) => setMin(Number(event.target.value))}
              className="w-full rounded-xl border border-yellow-500/20 bg-red-950/50 px-4 py-3 font-mono text-base text-yellow-100 transition-all focus:border-yellow-500/50 focus:outline-none"
            />
          </label>
          <label className="space-y-2">
            <span className="ml-1 block text-sm font-bold text-yellow-500/80">最大值</span>
            <input
              type="number"
              value={max}
              onChange={(event) => setMax(Number(event.target.value))}
              className="w-full rounded-xl border border-yellow-500/20 bg-red-950/50 px-4 py-3 font-mono text-base text-yellow-100 transition-all focus:border-yellow-500/50 focus:outline-none"
            />
          </label>
          <label className="space-y-2">
            <span className="ml-1 block text-sm font-bold text-yellow-500/80">選號個數</span>
            <input
              type="number"
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              className="w-full rounded-xl border border-yellow-500/20 bg-red-950/50 px-4 py-3 font-mono text-base text-yellow-100 transition-all focus:border-yellow-500/50 focus:outline-none"
            />
          </label>
        </div>

        {error ? (
          <p className="mb-6 text-center text-sm font-bold text-yellow-200" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mb-10 rounded-2xl border border-yellow-500/15 bg-red-950/30 p-4">
          <p className="mb-3 text-sm font-bold tracking-wide text-yellow-200/80">規則預設</p>
          <div className="mb-4 flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
              placeholder="例如：大樂透"
              className="min-h-11 flex-1 rounded-xl border border-yellow-500/20 bg-red-950/50 px-4 py-2 text-base text-yellow-100 focus:border-yellow-500/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSavePreset}
              disabled={Boolean(error)}
              className="min-h-11 rounded-xl border border-yellow-500/40 px-4 py-2 text-sm font-bold text-yellow-50 hover:bg-yellow-500/10 disabled:opacity-40"
            >
              儲存目前規則
            </button>
          </div>
          {presets.length === 0 ? (
            <p className="text-xs text-yellow-100/50">尚無預設，儲存後可一鍵套用。</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <li key={preset.id} className="flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMin(preset.min);
                      setMax(preset.max);
                      setCount(preset.count);
                    }}
                    className="px-2 text-sm text-yellow-100"
                  >
                    {preset.name}（{preset.count} 碼 {preset.min}-{preset.max}）
                  </button>
                  <button
                    type="button"
                    aria-label={`刪除預設 ${preset.name}`}
                    onClick={() => setPresets((prev) => prev.filter((item) => item.id !== preset.id))}
                    className="flex h-11 w-11 items-center justify-center text-lg text-yellow-500/70 hover:text-yellow-200"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-8 flex justify-center md:mb-12">
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={loading || Boolean(error)}
            className="group relative w-full max-w-md rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-4 text-lg font-black text-black shadow-lg transition-all hover:-translate-y-1 hover:shadow-yellow-500/20 active:scale-95 disabled:opacity-30 disabled:grayscale sm:w-auto sm:px-12 sm:text-xl"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {loading ? '🔮 感應中...' : '🎲 立即生成'}
            </span>
            {loading ? <div className="absolute inset-0 animate-pulse rounded-2xl bg-white/20"></div> : null}
          </button>
        </div>

        {display ? (
          <div className="animate-stamp flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-1 rounded-3xl border border-yellow-500/10 bg-yellow-500/5 p-3 shadow-inner sm:gap-4 sm:p-8">
              {display.zoneA.map((n, i) => (
                <Ball
                  key={`custom-${i}`}
                  number={n}
                  isRolling={loading}
                  delay={i * 100}
                  digitRef={
                    loading
                      ? (node) => {
                          digitRefs.current[i] = node;
                        }
                      : undefined
                  }
                />
              ))}
            </div>
            <div className="mt-6 text-center font-serif text-xl font-black tracking-wide text-yellow-300 sm:mt-8 sm:text-2xl sm:tracking-widest">
              {poem ? `${poem.level} • ${poem.title}` : '大吉 • 利見大人'}
            </div>
            {result && !loading && shareText ? (
              <div className="mt-8 flex justify-center">
                <ShareButton text={shareText} label="分享今日好運" />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
