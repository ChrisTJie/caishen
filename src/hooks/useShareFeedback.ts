import { useCallback, useEffect, useRef, useState } from 'react';
import { shareLotteryResult, type ShareOutcome } from '../lib/share';

const MESSAGES: Record<ShareOutcome, string | null> = {
  shared: '已分享好運！',
  copied: '已複製分享內容',
  cancelled: null,
  failed: '分享失敗，請再試一次',
};

export function useShareFeedback() {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const share = useCallback(async (text: string) => {
    const outcome = await shareLotteryResult(text);
    const next = MESSAGES[outcome];
    if (!next) return;
    setMessage(next);
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setMessage(null), 2500);
  }, []);

  return { message, share };
}
