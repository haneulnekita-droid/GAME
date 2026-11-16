import { Database, Gamepad2, RotateCcw, Star, Volume2, VolumeX } from 'lucide-react';
import { LEVELS } from '../data/gameContent';
import { GameScreen } from '../types/game';

interface TopHudProps {
  screen: GameScreen;
  playerId: string;
  xp: number;
  unlockedSkills: string[];
  progressPercent: number;
  isMuted: boolean;
  savedCount: number;
  onToggleMute: () => void;
  onOpenRecords: () => void;
  onRequestReset: () => void;
}

export function TopHud({
  screen,
  playerId,
  xp,
  unlockedSkills,
  progressPercent,
  isMuted,
  savedCount,
  onToggleMute,
  onOpenRecords,
  onRequestReset,
}: TopHudProps) {
  const isPlaying = screen !== 'START';

  return (
    <header className="no-print sticky top-0 z-40 border-b border-cyan-500/20 bg-[#070913]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Gamepad2 className="h-6 w-6 text-cyan-400" aria-hidden="true" />
          <span className="font-display text-lg font-extrabold tracking-tight text-white sm:text-xl whitespace-nowrap">
            STRESS <span className="text-cyan-400">OFF</span>
          </span>
        </div>

        {/* Zone 2: Arcade Player HUD (when playing) */}
        {isPlaying ? (
          <div className="hidden md:flex flex-1 max-w-2xl items-center gap-5">
            {/* Progress & XP Crystal Meter */}
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono-tabular font-bold text-cyan-300 truncate max-w-[160px]">
                    {playerId || 'PLAYER 01'}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  {/* 4 XP Star Slots */}
                  <div className="flex items-center gap-1" aria-label={`Puntaje ${xp} de 4 XP`}>
                    {[1, 2, 3, 4].map((slot) => {
                      const filled = slot <= xp;
                      return (
                        <Star
                          key={slot}
                          className={`h-3.5 w-3.5 transition-all duration-200 ${
                            filled
                              ? 'fill-yellow-400 text-yellow-300 drop-shadow-[0_0_6px_rgba(250,204,21,0.75)]'
                              : 'text-slate-600'
                          }`}
                          aria-hidden="true"
                        />
                      );
                    })}
                    <span className="ml-1 font-mono-tabular font-bold text-yellow-300">
                      {xp}/4 XP
                    </span>
                  </div>
                </div>
                <span className="font-mono-tabular text-slate-300">
                  {progressPercent}%
                </span>
              </div>

              <div
                className="h-2 w-full overflow-hidden rounded-full bg-slate-800/90 p-0.5 border border-slate-700/60"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progreso de la aventura"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-yellow-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Live Skill Crest Inventory */}
            <div
              className="hidden lg:flex items-center gap-1.5 border-l border-slate-800 pl-4"
              aria-label="Inventario de habilidades desbloqueadas"
            >
              {LEVELS.map((lvl) => {
                const isEarned = unlockedSkills.includes(lvl.skillUnlocked);
                return (
                  <div
                    key={lvl.id}
                    title={
                      isEarned
                        ? `Desbloqueada: ${lvl.skillUnlocked}`
                        : `Bloqueada: ${lvl.skillUnlocked}`
                    }
                    className={`relative h-8 w-8 overflow-hidden rounded-lg border transition-all ${
                      isEarned
                        ? 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                        : 'border-slate-700/80 opacity-35 grayscale'
                    }`}
                  >
                    <img
                      src={lvl.skillImageUrl}
                      alt={lvl.skillUnlocked}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-300">
            <span className="whitespace-nowrap">Aventura Interactiva de Bienestar</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="whitespace-nowrap text-cyan-300">4 Niveles + Jefe Final</span>
          </div>
        )}

        {/* Zone 3: Functional Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Activar sonidos del juego' : 'Silenciar sonidos del juego'}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-slate-400" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4 text-cyan-400" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{isMuted ? 'Silencio' : 'Audio'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenRecords}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-violet-500/40 bg-violet-950/50 px-3.5 text-xs font-semibold text-violet-200 transition-colors hover:border-violet-400 hover:bg-violet-900/60 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Database className="h-4 w-4 text-violet-300" aria-hidden="true" />
            <span>Registros Excel ({savedCount})</span>
          </button>

          {isPlaying && (
            <button
              type="button"
              onClick={onRequestReset}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 text-xs font-semibold text-rose-200 transition-colors hover:border-rose-400 hover:bg-rose-900/50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Reiniciar</span>
            </button>
          )}
        </div>
      </div>

      {/* Compact mobile HUD */}
      {isPlaying && (
        <div className="border-t border-slate-800/70 px-4 py-2 md:hidden">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-mono-tabular font-semibold text-cyan-300 truncate max-w-[140px]">
              {playerId}
            </span>
            <span className="font-mono-tabular font-semibold text-yellow-300">
              {xp}/4 XP · {progressPercent}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-yellow-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
