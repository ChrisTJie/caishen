import { memo } from 'react';

export const Lanterns = memo(function Lanterns() {
  return (
    <div className="pointer-events-none hidden lg:block" aria-hidden="true">
      <div
        className="animate-swing fixed top-0 left-4 z-0 origin-top will-change-transform md:left-12"
        style={{ animationDelay: '0s' }}
      >
        <div className="mx-auto h-16 w-1 bg-yellow-600 md:h-24"></div>
        <div className="relative flex h-20 w-24 items-center justify-center overflow-hidden rounded-xl border-y-4 border-yellow-600 bg-red-700 shadow-[0_10px_30px_rgba(255,0,0,0.4)] md:h-28 md:w-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.2),_transparent)]"></div>
          <span className="text-stroke-sm font-serif text-4xl font-bold text-yellow-400 drop-shadow-md md:text-5xl">
            春
          </span>
        </div>
        <div className="-mt-1 flex justify-center gap-1">
          <div className="h-8 w-1 bg-yellow-600 md:h-12"></div>
          <div className="h-8 w-1 bg-yellow-600 md:h-12"></div>
          <div className="h-8 w-1 bg-yellow-600 md:h-12"></div>
        </div>
      </div>

      <div
        className="animate-swing fixed top-0 right-4 z-0 origin-top will-change-transform md:right-12"
        style={{ animationDelay: '-3s' }}
      >
        <div className="mx-auto h-10 w-1 bg-yellow-600 md:h-16"></div>
        <div className="relative flex h-20 w-24 items-center justify-center overflow-hidden rounded-xl border-y-4 border-yellow-600 bg-red-700 shadow-[0_10px_30px_rgba(255,0,0,0.4)] md:h-28 md:w-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.2),_transparent)]"></div>
          <span className="text-stroke-sm font-serif text-4xl font-bold text-yellow-400 drop-shadow-md md:text-5xl">
            福
          </span>
        </div>
        <div className="-mt-1 flex justify-center gap-1">
          <div className="h-8 w-1 bg-yellow-600 md:h-12"></div>
          <div className="h-8 w-1 bg-yellow-600 md:h-12"></div>
          <div className="h-8 w-1 bg-yellow-600 md:h-12"></div>
        </div>
      </div>
    </div>
  );
});
