import { memo, useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export const Particles = memo(function Particles() {
  const reducedMotion = usePrefersReducedMotion();
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; size: number }>>(
    [],
  );

  useEffect(() => {
    if (reducedMotion) {
      setParticles([]);
      return;
    }
    const count = window.innerWidth < 768 ? 8 : 12;
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        size: Math.random() * 6 + 2,
      })),
    );
  }, [reducedMotion]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle absolute bg-yellow-400/30 blur-[1px] will-change-transform"
          style={{
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            bottom: '-20px',
          }}
        />
      ))}
    </div>
  );
});
