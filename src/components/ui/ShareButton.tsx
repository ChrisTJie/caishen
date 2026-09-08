import { useShareFeedback } from '../../hooks/useShareFeedback';
import { Toast } from './Toast';

interface ShareButtonProps {
  text: string;
  label?: string;
}

export function ShareButton({ text, label = '分享好運' }: ShareButtonProps) {
  const { message, share } = useShareFeedback();

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => void share(text)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-200/80 transition-all hover:bg-yellow-500/20"
      >
        <span aria-hidden="true">📤</span> {label}
      </button>
      {message ? <Toast message={message} /> : null}
    </div>
  );
}
