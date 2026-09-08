import { memo } from 'react';

export const WealthWaves = memo(function WealthWaves() {
  return (
    <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-0 h-24 overflow-hidden md:h-48">
      <div
        className="animate-wave absolute bottom-0 left-0 h-full w-[200%] text-yellow-700 opacity-30 will-change-transform"
        style={{ animationDuration: '30s' }}
      >
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-full fill-current">
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.3C989.49,25,1113-14.29,1200,52.47V0Z"
            transform="scale(1, -1) translate(0, -120)"
          />
        </svg>
      </div>
      <div
        className="animate-wave absolute bottom-0 left-0 h-full w-[200%] text-yellow-500 opacity-40 will-change-transform"
        style={{ animationDuration: '20s', animationDelay: '-5s' }}
      >
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-full fill-current">
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            transform="scale(1, -1) translate(0, -120)"
          />
        </svg>
      </div>
      <div
        className="animate-wave absolute bottom-0 left-0 h-full w-[200%] text-yellow-300 opacity-30 will-change-transform"
        style={{ animationDuration: '15s', animationDelay: '-2s' }}
      >
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-full fill-current">
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            transform="scale(1, -1) translate(0, -120)"
          />
        </svg>
      </div>
    </div>
  );
});
