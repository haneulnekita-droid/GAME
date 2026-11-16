import { useEffect, useRef } from 'react';
import { GAME_BRAND } from '../data/gameContent';
import { GameScreen } from '../types/game';

interface ArcadeBackgroundProps {
  screen: GameScreen;
}

const SCREEN_PARTICLE_COLORS: Record<GameScreen, string[]> = {
  START: ['#22D3EE', '#A855F7', '#EC4899'],
  INSTRUCTIONS: ['#22D3EE', '#38BDF8', '#A855F7'],
  LEVEL_1: ['#22D3EE', '#FACC15', '#38BDF8'],
  LEVEL_2: ['#38BDF8', '#2DD4BF', '#A5F3FC'],
  LEVEL_3: ['#C084FC', '#F472B6', '#22D3EE'],
  LEVEL_4: ['#FACC15', '#22D3EE', '#FB923C'],
  BOSS_FINAL: ['#EC4899', '#A855F7', '#22D3EE'],
  GAME_OVER: ['#FACC15', '#22D3EE', '#34D399'],
};

export function ArcadeBackground({ screen }: ArcadeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const palette = SCREEN_PARTICLE_COLORS[screen];
    const particleCount = prefersReduced ? 18 : 42;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.25 - Math.random() * 0.45,
      r: 1.2 + Math.random() * 2.4,
      color: palette[Math.floor(Math.random() * palette.length)],
      alpha: 0.25 + Math.random() * 0.5,
    }));

    const renderFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        if (!prefersReduced) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -10) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < -10) p.x = canvas.width + 10;
          if (p.x > canvas.width + 10) p.x = -10;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!prefersReduced) {
        animId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      window.removeEventListener('resize', resize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [screen]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {/* Subtle Cosmic Arcade Arena Image Layer */}
      <img
        src={GAME_BRAND.arenaBackdrop}
        alt=""
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover opacity-20"
      />
      {/* Deep dark scrim to preserve high text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070913]/85 via-[#070913]/75 to-[#070913]/95" />

      {/* Animated Arcade Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
