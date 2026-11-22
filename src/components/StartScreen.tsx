import React, { useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Calendar,
  CheckCircle2,
  Cloud,
  FileSpreadsheet,
  Gamepad2,
  Play,
  Shield,
  Sparkles,
  Swords,
  User,
  UserCheck,
} from 'lucide-react';
import { GAME_BRAND, STRATEGIES } from '../data/gameContent';
import { formatReadableDate } from '../utils/exportUtils';

interface StartScreenProps {
  initialPlayerId: string;
  initialPlayerName: string;
  startDateIso: string;
  savedCount: number;
  authUser: FirebaseUser | null;
  isAdmin: boolean;
  onSignInGoogle: () => void;
  onStartGame: (playerId: string, playerName: string) => void;
  onOpenRecords: () => void;
}

export function StartScreen({
  initialPlayerId,
  initialPlayerName,
  startDateIso,
  savedCount,
  authUser,
  isAdmin,
  onSignInGoogle,
  onStartGame,
  onOpenRecords,
}: StartScreenProps) {
  const [playerId, setPlayerId] = useState(initialPlayerId);
  const [playerName, setPlayerName] = useState(initialPlayerName);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  // Auto-fill participant name from Google account when signed in and field is empty
  useEffect(() => {
    if (authUser?.displayName && !playerName.trim()) {
      setPlayerName(authUser.displayName);
    }
  }, [authUser, playerName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedName = playerName.trim();
    const cleanedId = playerId.trim();
    if (!cleanedName) {
      setError('Ingresa tu nombre completo para registrar tus resultados.');
      return;
    }
    if (!cleanedId) {
      setError('Ingresa tu ID del Player (código o matrícula del participante).');
      return;
    }
    setError('');
    onStartGame(cleanedId, cleanedName);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Left Column: Arcade Title Console & Player Login */}
        <div className="flex flex-col justify-between rounded-2xl border border-cyan-500/30 bg-[#0b0f24]/90 p-6 shadow-[0_0_50px_rgba(34,211,238,0.12)] backdrop-blur-md sm:p-8 lg:col-span-7">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-bold tracking-wider text-cyan-400">
              <Gamepad2 className="h-4 w-4" aria-hidden="true" />
              <span>{GAME_BRAND.logo} · VIDEOJUEGO EDUCATIVO</span>
            </div>

            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-white text-balance sm:text-5xl">
              {GAME_BRAND.title}
            </h1>

            <p className="mt-2 text-lg font-semibold text-violet-200 sm:text-xl">
              {GAME_BRAND.subtitle}
            </p>

            <p className="mt-4 rounded-xl border border-violet-500/30 bg-violet-950/35 p-4 text-sm leading-relaxed text-slate-100 sm:text-base">
              {GAME_BRAND.startQuote}
            </p>

            {/* 4 Illustrated Unlockable Power Crests */}
            <div className="mt-6">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-yellow-300">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                4 PODERES DESBLOQUEABLES + JEFE FINAL
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {STRATEGIES.map((st) => (
                  <div
                    key={st.id}
                    className="group flex flex-col items-center rounded-xl border border-slate-800 bg-[#111734]/90 p-3 text-center transition-all hover:border-cyan-400/50 hover:-translate-y-0.5"
                  >
                    <div className="h-14 w-14 overflow-hidden rounded-xl border border-cyan-400/30 bg-slate-950 shadow-md">
                      <img
                        src={st.badgeImage}
                        alt={st.shortTitle}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <p className="mt-2 text-xs font-bold leading-tight text-slate-100">
                      {st.shortTitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Central Multi-Device Database Banner */}
            {authUser && isAdmin ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-2.5 text-xs text-emerald-100">
                <span className="inline-flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  <span>
                    Modo Docente Activo ({authUser.email}) · Acceso total al historial y Excel consolidado de todos los dispositivos.
                  </span>
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 rounded-xl border border-emerald-500/35 bg-emerald-950/20 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2.5 text-xs text-emerald-100">
                  <Cloud className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                  <span>
                    <strong>Registro Automático en Línea:</strong> no necesitas cuenta Google para jugar. Al finalizar, tu nombre, puntaje, día y plan del Final Boss se envían directo a la base de datos central.
                  </span>
                </div>
                {!authUser && (
                  <button
                    type="button"
                    onClick={onSignInGoogle}
                    title="Solo para docente/administrador que descarga el Excel general"
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-cyan-400/50 bg-cyan-950/50 px-3 text-xs font-semibold text-cyan-200 transition-colors hover:border-cyan-300 hover:bg-cyan-900/60 whitespace-nowrap cursor-pointer"
                  >
                    <Shield className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                    <span>Acceso Docente</span>
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="player-name-input"
                  className="mb-1.5 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-200"
                >
                  <User className="h-4 w-4 text-fuchsia-400" aria-hidden="true" />
                  NOMBRE DEL PARTICIPANTE
                </label>
                <input
                  id="player-name-input"
                  type="text"
                  value={playerName}
                  onChange={(e) => {
                    setPlayerName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Ej. Ana Sofía Pérez"
                  maxLength={96}
                  className="h-12 w-full rounded-xl border border-slate-700 bg-[#070a17] px-4 text-sm font-medium text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>

              <div>
                <label
                  htmlFor="player-id-input"
                  className="mb-1.5 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-200"
                >
                  <UserCheck className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                  ID DEL PLAYER (Código)
                </label>
                <input
                  id="player-id-input"
                  type="text"
                  value={playerId}
                  onChange={(e) => {
                    setPlayerId(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Ej. EST-2026-01"
                  maxLength={64}
                  className="h-12 w-full rounded-xl border border-slate-700 bg-[#070a17] px-4 text-sm font-medium text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>

              <div>
                <label
                  htmlFor="start-date-display"
                  className="mb-1.5 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-200"
                >
                  <Calendar className="h-4 w-4 text-violet-400" aria-hidden="true" />
                  FECHA DE INICIO (Automática)
                </label>
                <input
                  id="start-date-display"
                  type="text"
                  readOnly
                  value={formatReadableDate(startDateIso)}
                  className="font-mono-tabular h-12 w-full rounded-xl border border-slate-800 bg-[#0a0e20] px-4 text-sm text-slate-300 focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-rose-400">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <button
                type="submit"
                className="group inline-flex h-14 flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-500 px-6 font-display text-base font-extrabold tracking-wide text-slate-950 shadow-[0_0_32px_rgba(34,211,238,0.4)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_44px_rgba(34,211,238,0.65)] active:scale-[0.98] whitespace-nowrap cursor-pointer"
              >
                <Play className="h-5 w-5 fill-slate-950 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                <span>INICIAR NUEVA PARTIDA</span>
              </button>

              <button
                type="button"
                onClick={onOpenRecords}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-emerald-500/45 bg-emerald-950/40 px-5 text-sm font-semibold text-emerald-200 transition-colors hover:border-emerald-400 hover:bg-emerald-900/50 whitespace-nowrap cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                <span>Registros Excel ({savedCount})</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Arcade Hero Character Frame */}
        <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-fuchsia-500/35 bg-[#0b0f24]/95 shadow-[0_0_45px_rgba(168,85,247,0.18)] lg:col-span-5">
          <div className="relative flex-1 min-h-[380px] w-full overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950">
            {!imgError ? (
              <img
                src={GAME_BRAND.heroImage}
                alt="Estudiante universitario gamer con mochila, audífonos iluminados y orbe de bienestar"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover object-center lg:absolute lg:inset-0"
              />
            ) : (
              <div className="flex h-full min-h-[380px] flex-col items-center justify-center p-8 text-center">
                <Shield className="h-16 w-16 text-cyan-400 animate-float-slow" aria-hidden="true" />
                <p className="mt-4 font-display text-xl font-bold text-white">
                  PLAYER UNIVERSITARIO
                </p>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0f24] via-transparent to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-cyan-400/30 bg-[#090d1f]/85 p-3.5 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Swords className="h-5 w-5 text-yellow-300 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-display text-sm font-bold text-white">
                      Misión: Vencer al Estrés Académico
                    </p>
                    <p className="text-xs text-slate-300">
                      4 Escenarios · 4 Emblemas · 1 Plan Final
                    </p>
                  </div>
                </div>
                <span className="font-mono-tabular text-xs font-bold text-cyan-300 shrink-0">
                  MAX 4 XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
