import { memo } from 'react';

export const WarningFooter = memo(function WarningFooter() {
  return (
    <div className="fixed right-0 bottom-0 left-0 z-[60] border-t border-yellow-500/30 bg-red-900/95 px-3 py-2 text-center backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <p className="text-[11px] leading-relaxed font-medium text-yellow-100 md:text-sm md:tracking-wide">
        「本程式僅供娛樂參考，不涉及金錢賭博。中獎機率全憑運氣，請理性對待，量力而為。」
      </p>
    </div>
  );
});
