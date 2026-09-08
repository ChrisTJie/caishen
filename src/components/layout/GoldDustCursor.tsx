import { useEffect, useRef } from 'react';
import { useCoarsePointer, usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface DustParticle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
}

function GoldDustCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: DustParticle[] = [];
    let rafId = 0;
    let running = true;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (event: MouseEvent) => {
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: event.clientX,
          y: event.clientY,
          size: Math.random() * 3 + 1,
          speedX: Math.random() * 2 - 1,
          speedY: Math.random() * 2 - 1,
          life: 1,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life -= 0.02;
        particle.size *= 0.95;
        if (particle.life <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 215, 0, ${particle.life})`;
          ctx.fill();
        }
      }
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-50" aria-hidden="true" />;
}

export function GoldDustCursor() {
  const reducedMotion = usePrefersReducedMotion();
  const coarsePointer = useCoarsePointer();
  if (reducedMotion || coarsePointer) return null;
  return <GoldDustCanvas />;
}
