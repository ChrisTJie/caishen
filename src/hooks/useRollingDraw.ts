import { useCallback, useEffect, useRef, useState } from 'react';
import { audioService } from '../lib/audio';
import type { NumberSet } from '../types';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const FRAME_MS = 80;
const SFX_MS = 160;
const DEFAULT_DURATION = 1200;

export function useRollingDraw() {
  const reducedMotion = usePrefersReducedMotion();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NumberSet | null>(null);
  const [display, setDisplay] = useState<NumberSet | null>(null);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  const cancel = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => cancel, [cancel]);

  const start = useCallback(
    (
      preview: () => NumberSet,
      final: NumberSet,
      options?: { durationMs?: number; onFrame?: (next: NumberSet) => void },
    ) => {
      cancel();
      setResult(null);
      const durationMs = options?.durationMs ?? DEFAULT_DURATION;
      const onFrame = options?.onFrame;

      if (reducedMotion) {
        setDisplay(final);
        setResult(final);
        setLoading(false);
        onFrame?.(final);
        void audioService.playWin();
        return Promise.resolve(final);
      }

      const first = preview();
      setLoading(true);
      setDisplay(first);
      onFrame?.(first);
      runningRef.current = true;

      let lastFrame = 0;
      let lastSfx = 0;
      const tick = (time: number) => {
        if (!runningRef.current) return;
        if (time - lastFrame >= FRAME_MS) {
          lastFrame = time;
          onFrame?.(preview());
          if (time - lastSfx >= SFX_MS) {
            lastSfx = time;
            void audioService.playClick();
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      return new Promise<NumberSet>((resolve) => {
        timeoutRef.current = window.setTimeout(() => {
          runningRef.current = false;
          if (rafRef.current != null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          setDisplay(final);
          setResult(final);
          setLoading(false);
          onFrame?.(final);
          void audioService.playWin();
          resolve(final);
        }, durationMs);
      });
    },
    [cancel, reducedMotion],
  );

  return { loading, result, display, start, setDisplay };
}
