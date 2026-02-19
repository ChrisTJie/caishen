import React from 'react';

interface BallProps {
  number: number;
  isSpecial?: boolean;
  delay?: number;
  isRolling?: boolean;
}

export const Ball: React.FC<BallProps> = ({ number, isSpecial = false, delay = 0, isRolling = false }) => {
  return (
    <div 
      className={`
        relative flex items-center justify-center 
        w-14 h-14 md:w-20 md:h-20 rounded-full 
        text-2xl md:text-3xl font-black shadow-[0_10px_20px_rgba(0,0,0,0.5)] 
        transform transition-all duration-300 ease-out
        ${isSpecial 
          ? 'bg-gradient-to-b from-red-500 via-red-600 to-red-900 text-white border-red-400' 
          : 'bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-700 text-yellow-950 border-yellow-200'}
        border-2
        ${!isRolling ? 'animate-[bounce_0.6s_cubic-bezier(0.34,1.56,0.64,1)_1]' : 'scale-95 opacity-90'}
      `}
      style={{ animationDelay: isRolling ? '0ms' : `${delay}ms` }}
    >
      {/* 3D Shine / Reflection */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-gradient-to-b from-white/60 to-transparent rounded-full pointer-events-none blur-[1px]"></div>
      <div className="absolute bottom-2 right-3 w-2 h-2 bg-white/40 rounded-full blur-[2px]"></div>

      {/* Number */}
      <span className={`z-10 drop-shadow-md ${isRolling ? 'blur-[1px]' : ''}`}>
        {String(number).padStart(2, '0')}
      </span>
      
      {/* Inner shadow for depth */}
      <div className="absolute inset-0 rounded-full shadow-[inset_0_-4px_6px_rgba(0,0,0,0.3)] pointer-events-none"></div>
    </div>
  );
};