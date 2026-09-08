import { memo, type Ref } from 'react';

interface BallProps {
  number: number;
  isSpecial?: boolean;
  delay?: number;
  isRolling?: boolean;
  matched?: boolean;
  digitRef?: Ref<HTMLSpanElement>;
}

export const Ball = memo(function Ball({
  number,
  isSpecial = false,
  delay = 0,
  isRolling = false,
  matched = false,
  digitRef,
}: BallProps) {
  return (
    <div
      className={`relative flex h-9 w-9 shrink-0 transform items-center justify-center rounded-full border-2 text-base font-black tabular-nums shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out sm:h-14 sm:w-14 sm:text-2xl md:h-20 md:w-20 md:text-3xl ${
        isSpecial
          ? 'border-red-400 bg-gradient-to-b from-red-500 via-red-600 to-red-900 text-white'
          : 'border-yellow-200 bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-700 text-yellow-950'
      } ${!isRolling ? 'animate-[bounce_0.6s_cubic-bezier(0.34,1.56,0.64,1)_1]' : 'scale-95 opacity-90'} ${
        matched ? 'ring-2 ring-emerald-300 ring-offset-2 ring-offset-red-950' : ''
      }`}
      style={{ animationDelay: isRolling ? '0ms' : `${delay}ms` }}
    >
      <div className="pointer-events-none absolute top-1 left-1/2 h-[40%] w-[80%] -translate-x-1/2 rounded-full bg-gradient-to-b from-white/60 to-transparent blur-[1px]"></div>
      <div className="absolute right-1.5 bottom-1 h-1.5 w-1.5 rounded-full bg-white/40 blur-[2px] sm:right-3 sm:bottom-2 sm:h-2 sm:w-2"></div>
      <span ref={digitRef} className={`z-10 drop-shadow-md ${isRolling ? 'blur-[1px]' : ''}`}>
        {String(number).padStart(2, '0')}
      </span>
      <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_-4px_6px_rgba(0,0,0,0.3)]"></div>
    </div>
  );
});
