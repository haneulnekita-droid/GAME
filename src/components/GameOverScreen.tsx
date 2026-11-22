import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Cloud,
  Database,
  FileDown,
  FileSpreadsheet,
  Home,
  Printer,
  RefreshCw,
  Star,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import { GAME_BRAND, LEVELS } from '../data/gameContent';
import { PlayerSessionRecord } from '../types/game';
import {
  exportRecordsToExcel,
  exportRecordToPDF,
  formatReadableDate,
} from '../utils/exportUtils';

interface GameOverScreenProps {
  record: PlayerSessionRecord;
  allRecords: PlayerSessionRecord[];
  onSyncRetry: () => void;
  onBackToHome: () => void;
  onOpenRecords: () => void;
}

function getArcadeRank(xp: number): { rank: string; label: string } {
  if (xp === 4) return { rank: 'RANGO S', label: 'Maestro/a del Bienestar' };
  if (xp === 3) return { rank: 'RANGO A', label: 'Estratega Resiliente' };
  if (xp === 2) return { rank: 'RANGO B', label: 'Aprendiz en Equilibrio' };
  return { rank: 'RANGO C', label: 'Explorador/a Inicial' };
}

export function GameOverScreen({
  record,
  allRecords,
  onSyncRetry,
  onBackToHome,
  onOpenRecords,
}: GameOverScreenProps) {
  const [imgError, setImgError] = useState(false);
  const rankInfo = getArcadeRank(record.xp);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const timer = setTimeout(() => {
      confetti({
        particleCount: 95,
        spread: 80,
        origin: { y: 0.58 },
        colors: ['#22D3EE', '#A855F7', '#EC4899', '#FACC15'],
      });
    }, 180);

    return () => clearTimeout(timer);
  }, []);

  const handleDownloadIndividualExcel = () => {
    const safePlayer = (record.playerName || record.playerId).replace(/[^a-zA-Z0-9_-]/g, '_');
    exportRecordsToExcel([record], `STRESS_OFF_${safePlayer}.xlsx`);
  };

  const handleDownloadAllExcel = () => {
    exportRecordsToExcel(allRecords.length > 0 ? allRecords : [record]);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-9">
      <div className="overflow-hidden rounded-2xl border border-cyan-400/45 bg-[#0b0f24]/95 shadow-[0_0_50px_rgba(34,211,238,0.18)] backdrop-blur-md">
        {/* Victory Hero Header */}
        <div className="grid grid-cols-1 items-stretch border-b border-slate-800 lg:grid-cols-12">
          <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold tracking-wider">
                <span className="inline-flex items-center gap-1.5 text-yellow-300">
                  <Trophy className="h-4 w-4" aria-hidden="true" />
                  {rankInfo.rank} · {rankInfo.label}
                </span>
              </div>

              <h1 className="mt-3 font-display text-3xl font-extrabold text-white text-balance sm:text-5xl">
                {GAME_BRAND.gameOverTitle}
              </h1>

              <div className="mt-4 flex items-center gap-2" aria-label={`Calificación ${record.xp} de 4 estrellas`}>
                {[1, 2, 3, 4].map((starIdx) => (
                  <Star
                    key={starIdx}
                    className={`h-7 w-7 ${
                      starIdx <= record.xp
                        ? 'fill-yellow-400 text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]'
                        : 'text-slate-700'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <p className="mt-4 rounded-xl border border-cyan-400/30 bg-cyan-950/30 p-4 text-sm leading-relaxed text-cyan-100 sm:text-base">
                {GAME_BRAND.gameOverQuote}
              </p>
              <p className="mt-3 font-display text-sm font-bold tracking-wide text-violet-300">
                {GAME_BRAND.gameOverFooter}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-[#121734] p-4">
                <p className="text-xs text-slate-400">Puntaje Total</p>
                <p className="mt-1 inline-flex items-center gap-1.5 font-mono-tabular text-2xl font-extrabold text-yellow-300">
                  <Zap className="h-5 w-5" aria-hidden="true" />
                  {record.xp} / {record.maxXp} XP
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#121734] p-4">
                <p className="text-xs text-slate-400">Porcentaje</p>
                <p className="mt-1 font-mono-tabular text-2xl font-extrabold text-cyan-300">
                  {record.percentage}%
                </p>
              </div>
              <div className="col-span-2 rounded-xl border border-slate-800 bg-[#121734] p-4 sm:col-span-1">
                <p className="text-xs text-slate-400">Emblemas</p>
                <p className="mt-1 font-mono-tabular text-2xl font-extrabold text-emerald-300">
                  {record.unlockedSkills.length} / 4
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[280px] bg-slate-950 lg:col-span-5">
            {!imgError ? (
              <img
                src={GAME_BRAND.victoryImage}
                alt="Personaje gamer universitario celebrando con trofeo estrella y confeti"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover lg:absolute lg:inset-0"
              />
            ) : (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center bg-gradient-to-br from-indigo-950 to-purple-950 p-6 text-center">
                <Trophy className="h-16 w-16 text-yellow-300" aria-hidden="true" />
                <p className="mt-3 font-display text-xl font-bold text-white">
                  ¡VICTORIA UNIVERSITARIA!
                </p>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0f24] via-transparent to-transparent lg:bg-gradient-to-r" />
          </div>
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          {/* Cloud Persistence Banner */}
          {record.syncedToCloud ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 text-xs sm:text-sm text-emerald-100">
              <span className="inline-flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                ¡Respuestas enviadas a la base de datos central! Tu puntaje ({record.xp}/{record.maxXp} XP), fecha ({record.gameDate || formatReadableDate(record.finishedAt)}) y respuestas del Final Boss quedaron guardadas para el reporte Excel general.
              </span>
              <span className="font-mono-tabular text-emerald-300">
                Dispositivo: {record.deviceInfo || 'Web'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-xl border border-amber-400/45 bg-amber-950/30 px-4 py-3.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm text-amber-100">
              <span className="inline-flex items-center gap-2 font-medium">
                <Cloud className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                Partida guardada en este dispositivo. Pulsa reintentar si deseas enviarla ahora a la base de datos central.
              </span>
              <button
                type="button"
                onClick={onSyncRetry}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 text-xs font-bold text-slate-950 hover:bg-amber-300 whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reintentar Envío</span>
              </button>
            </div>
          )}

          {/* 4 Unlocked Illustrated Skill Crests */}
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Emblemas de Habilidad Desbloqueados
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {LEVELS.map((lvl) => (
                <div
                  key={lvl.id}
                  className="flex items-center gap-3.5 rounded-xl border border-cyan-400/35 bg-[#121734] p-3.5 shadow-[0_0_16px_rgba(34,211,238,0.1)]"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-cyan-400/50 bg-slate-950">
                    <img
                      src={lvl.skillImageUrl}
                      alt={lvl.skillUnlocked}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono-tabular text-[11px] font-bold text-cyan-300">
                      {lvl.code}
                    </p>
                    <p className="text-xs font-bold leading-snug text-white">
                      {lvl.skillUnlocked}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Summary */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <h2 className="font-display text-lg font-bold text-white">
                Resumen de Partida y Respuestas
              </h2>

              <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-800 bg-[#111530] p-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <span className="text-slate-400">Participante</span>
                  <p className="mt-0.5 text-sm font-bold text-white">
                    {record.playerName || record.playerId}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">ID del Player</span>
                  <p className="mt-0.5 font-mono-tabular text-sm font-bold text-cyan-300">
                    {record.playerId}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Fecha de Inicio</span>
                  <p className="mt-0.5 font-mono-tabular text-sm text-slate-200">
                    {formatReadableDate(record.startedAt)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Fecha de Finalización</span>
                  <p className="mt-0.5 font-mono-tabular text-sm text-slate-200">
                    {formatReadableDate(record.finishedAt)}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[1, 2, 3, 4].map((lvl) => {
                  const ans = record.answers[lvl];
                  if (!ans) return null;
                  return (
                    <div
                      key={lvl}
                      className="rounded-xl border border-slate-800 bg-[#111530] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-display text-sm font-bold text-white">
                          Nivel 0{ans.levelId}: {ans.levelTitle}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                            ans.isCorrect ? 'text-emerald-300' : 'text-amber-300'
                          }`}
                        >
                          {ans.isCorrect ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                              Acierto (+1 XP)
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                              Sin XP (0 XP)
                            </>
                          )}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
                        <strong className="text-slate-100">Alternativa {ans.selectedOption}:</strong>{' '}
                        {ans.selectedText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 lg:col-span-5">
              <h2 className="font-display text-lg font-bold text-white">
                Tu Plan Antiestrés (Boss Final)
              </h2>

              <div className="space-y-3 rounded-xl border border-fuchsia-500/35 bg-[#131333] p-5">
                <div>
                  <p className="text-xs font-semibold text-cyan-300">Power Up 01 · Herramienta 1</p>
                  <p className="mt-0.5 text-sm font-bold text-white">
                    {record.bossPlan.powerUp1}
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <p className="text-xs font-semibold text-violet-300">Power Up 02 · Herramienta 2</p>
                  <p className="mt-0.5 text-sm font-bold text-white">
                    {record.bossPlan.powerUp2}
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <p className="text-xs font-semibold text-fuchsia-300">
                    Power Up 03 · Cómo aplicar el plan
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                    {record.bossPlan.powerUp3Plan}
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <p className="text-xs font-semibold text-yellow-300">
                    Bonus Round · Herramienta permanente y razón
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                    {record.bossPlan.bonusRoundReflection}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadAllExcel}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-bold text-slate-950 shadow-lg transition-colors hover:bg-emerald-400 whitespace-nowrap cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                <span>Guardar en Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadIndividualExcel}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-900/50 whitespace-nowrap cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                <span>Excel Individual</span>
              </button>

              <button
                type="button"
                onClick={() => exportRecordToPDF(record)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 text-sm font-bold text-slate-950 shadow-lg transition-colors hover:bg-cyan-300 whitespace-nowrap cursor-pointer"
              >
                <FileDown className="h-4 w-4" aria-hidden="true" />
                <span>Descargar PDF</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white whitespace-nowrap cursor-pointer"
              >
                <Printer className="h-4 w-4" aria-hidden="true" />
                <span>Imprimir</span>
              </button>

              <button
                type="button"
                onClick={onOpenRecords}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-violet-950/40 px-4 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-900/50 whitespace-nowrap cursor-pointer"
              >
                <Database className="h-4 w-4" aria-hidden="true" />
                <span>Ver Todos ({allRecords.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-cyan-400/50 bg-cyan-950/40 px-6 text-sm font-bold text-cyan-200 transition-colors hover:bg-cyan-900/50 whitespace-nowrap cursor-pointer"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span>Volver al Inicio</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
