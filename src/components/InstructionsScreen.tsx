import { ArrowRight, CheckCircle2, Lock, Unlock, Swords, Trophy, Zap } from 'lucide-react';
import { MAP_NODES } from '../data/gameContent';

interface InstructionsScreenProps {
  playerId: string;
  onBeginAdventure: () => void;
}

export function InstructionsScreen({ playerId, onBeginAdventure }: InstructionsScreenProps) {
  const rules = [
    'Superarás cuatro niveles con situaciones reales de la vida universitaria.',
    'En cada nivel deberás seleccionar una única respuesta antes de avanzar.',
    'Cada respuesta correcta otorga +1 XP y desbloquea un emblema de habilidad.',
    'Una vez respondido un nivel, tu elección queda bloqueada para proteger tu puntaje.',
    'Al terminar los 4 niveles enfrentarás al BOSS FINAL para crear tu plan antiestrés.',
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <div className="rounded-2xl border border-cyan-500/30 bg-[#0b0f24]/95 p-6 shadow-[0_0_45px_rgba(34,211,238,0.12)] backdrop-blur-md sm:p-8">
        <div className="flex flex-col gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono-tabular text-xs font-bold tracking-wider text-cyan-400">
              PLAYER 01 · NUEVA PARTIDA · ID: {playerId}
            </p>
            <h1 className="mt-1.5 font-display text-3xl font-extrabold text-white sm:text-4xl">
              ¡BIENVENIDO/A AL JUEGO!
            </h1>
          </div>
          <p className="text-sm font-medium text-violet-200">
            Ruta de Misión: 4 Niveles + Jefe Final
          </p>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Rules */}
          <div className="lg:col-span-5 space-y-3.5">
            <h2 className="font-display text-lg font-bold text-cyan-300">
              Reglas de la Partida
            </h2>
            <ul className="space-y-3">
              {rules.map((rule, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 rounded-xl border border-slate-800 bg-[#111632]/90 p-3.5 text-sm leading-relaxed text-slate-200"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Arcade Quest Path Map */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-yellow-300">
                Mapa Visual de Desafíos
              </h2>
              <span className="text-xs text-slate-400">Desbloqueo progresivo</span>
            </div>

            <div className="relative mt-4 space-y-3.5">
              {MAP_NODES.map((node, index) => {
                const isUnlocked = index === 0;
                const isBoss = node.id === 5;

                return (
                  <div
                    key={node.id}
                    className={`relative flex items-center justify-between gap-4 rounded-xl border p-3.5 transition-all ${
                      isUnlocked
                        ? 'border-cyan-400/70 bg-gradient-to-r from-cyan-950/45 to-[#12183a] shadow-[0_0_24px_rgba(34,211,238,0.16)]'
                        : isBoss
                        ? 'border-fuchsia-500/35 bg-[#151132]/85 opacity-85'
                        : 'border-slate-800 bg-[#0f142b]/80 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Custom Emblem Thumbnail */}
                      <div
                        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border ${
                          isUnlocked
                            ? 'border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.35)]'
                            : 'border-slate-700 grayscale'
                        }`}
                      >
                        <img
                          src={node.badgeImage}
                          alt={node.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                        {!isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/65">
                            {isBoss ? (
                              <Swords className="h-5 w-5 text-fuchsia-300" aria-hidden="true" />
                            ) : (
                              <Lock className="h-5 w-5 text-slate-300" aria-hidden="true" />
                            )}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={`font-mono-tabular font-bold ${
                              isUnlocked
                                ? 'text-cyan-300'
                                : isBoss
                                ? 'text-fuchsia-300'
                                : 'text-slate-400'
                            }`}
                          >
                            {node.code}
                          </span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="inline-flex items-center gap-1 font-mono-tabular text-yellow-300">
                            <Zap className="h-3 w-3" aria-hidden="true" />
                            {node.reward}
                          </span>
                        </div>
                        <h3 className="truncate font-display text-base font-bold text-white">
                          {node.title}
                        </h3>
                        <p className="truncate text-xs text-slate-400">
                          Habilidad: {node.skill}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-cyan-300">
                          <Unlock className="h-4 w-4" aria-hidden="true" />
                          ACTIVO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                          BLOQUEADO
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end border-t border-slate-800 pt-6">
          <button
            type="button"
            onClick={onBeginAdventure}
            className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 px-8 font-display text-base font-extrabold tracking-wide text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] sm:w-auto whitespace-nowrap cursor-pointer"
          >
            <Trophy className="h-5 w-5" aria-hidden="true" />
            <span>¡COMENZAR AVENTURA!</span>
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
