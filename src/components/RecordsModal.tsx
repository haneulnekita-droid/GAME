import React, { useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Cloud,
  Database,
  FileDown,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { ADMIN_EMAIL } from '../firebase';
import { PlayerSessionRecord } from '../types/game';
import {
  exportRecordsToCSV,
  exportRecordsToExcel,
  exportRecordToPDF,
  formatReadableDate,
} from '../utils/exportUtils';

interface RecordsModalProps {
  isOpen: boolean;
  records: PlayerSessionRecord[];
  authUser: User | null;
  isAdmin: boolean;
  isRefreshing: boolean;
  onSignInGoogle: () => void;
  onRefresh: () => void;
  onClose: () => void;
  onDeleteRecord: (id: string) => void;
}

export function RecordsModal({
  isOpen,
  records,
  authUser,
  isAdmin,
  isRefreshing,
  onSignInGoogle,
  onRefresh,
  onClose,
  onDeleteRecord,
}: RecordsModalProps) {
  const [search, setSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const uniqueDays = useMemo(() => {
    const days = new Set<string>();
    records.forEach((r) => {
      const day = r.gameDate || (r.startedAt ? r.startedAt.slice(0, 10) : '');
      if (day) days.add(day);
    });
    return Array.from(days).sort((a, b) => b.localeCompare(a));
  }, [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      const day = r.gameDate || (r.startedAt ? r.startedAt.slice(0, 10) : '');
      if (selectedDay !== 'ALL' && day !== selectedDay) return false;
      if (!q) return true;
      return (
        r.playerId.toLowerCase().includes(q) ||
        (r.playerName || '').toLowerCase().includes(q) ||
        (r.playerEmail || '').toLowerCase().includes(q)
      );
    });
  }, [records, search, selectedDay]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="records-modal-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#0d1124] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-violet-400" aria-hidden="true" />
            <div>
              <h2 id="records-modal-title" className="font-display text-lg font-bold text-white">
                Base de Datos Permanente ({records.length}) · Excel y Respuestas
              </h2>
              <p className="text-xs text-slate-400">
                {authUser
                  ? isAdmin
                    ? `Administrador (${authUser.email}): viendo todas las respuestas enviadas desde cualquier dispositivo y fecha.`
                    : `Conectado (${authUser.email}): solo el correo administrador (${ADMIN_EMAIL}) puede consultar las respuestas de todos los dispositivos.`
                  : 'Viendo el historial guardado en este dispositivo. Las respuestas nuevas también se envían automáticamente a la nube.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar registros"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 transition-colors hover:border-slate-500 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Admin Cloud Access Banner when not signed in as Admin */}
        {!isAdmin && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/30 bg-cyan-950/30 px-6 py-3 text-xs text-cyan-100">
            <span className="inline-flex items-center gap-2">
              <Cloud className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
              <span>
                <strong>Acceso Docente ({ADMIN_EMAIL}):</strong> inicia sesión con Google para ver y descargar en un solo Excel (.xlsx) las respuestas de todos los jugadores y dispositivos.
              </span>
            </span>
            <button
              type="button"
              onClick={onSignInGoogle}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-cyan-400 px-3 text-xs font-bold text-slate-950 hover:bg-cyan-300 cursor-pointer"
            >
              <Cloud className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{authUser ? 'Cambiar a Cuenta Docente' : 'Acceso Docente (Google)'}</span>
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-800 bg-[#10152c] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[210px] max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, ID o correo..."
                className="h-10 w-full rounded-lg border border-slate-700 bg-[#080b18] pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="relative flex items-center">
              <Calendar
                className="pointer-events-none absolute left-3 h-4 w-4 text-violet-300"
                aria-hidden="true"
              />
              <select
                aria-label="Filtrar por día de partida"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="h-10 rounded-lg border border-slate-700 bg-[#080b18] pl-9 pr-4 text-xs font-semibold text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="ALL">Todos los días ({records.length})</option>
                {uniqueDays.map((day) => (
                  <option key={day} value={day}>
                    Día: {day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3.5 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400/60 hover:text-white disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`}
                aria-hidden="true"
              />
              <span>Sincronizar</span>
            </button>

            <button
              type="button"
              disabled={filtered.length === 0}
              onClick={() => exportRecordsToExcel(filtered)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-500 px-4 text-xs font-bold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
              <span>Descargar Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              disabled={filtered.length === 0}
              onClick={() => exportRecordsToCSV(filtered)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-4 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-900/50 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              <span>Descargar CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-[#0a0d1d] py-14 text-center">
              <FileSpreadsheet className="h-10 w-10 text-slate-500" aria-hidden="true" />
              <p className="mt-3 font-display text-base font-bold text-slate-200">
                {records.length === 0
                  ? 'Aún no hay partidas completadas guardadas'
                  : 'No hay resultados para ese filtro'}
              </p>
              <p className="mt-1 max-w-md text-xs text-slate-400">
                Cada partida completada guarda el día exacto, dispositivo, nombre, puntaje XP, respuestas de los 4 niveles y las reflexiones escritas del Boss Final.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-slate-800 bg-[#121731] text-xs font-semibold text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Día</th>
                    <th className="px-4 py-3">Participante</th>
                    <th className="px-4 py-3">ID del Player</th>
                    <th className="px-4 py-3">Dispositivo</th>
                    <th className="px-4 py-3">Puntaje</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-[#0b0f22]">
                  {filtered.map((rec) => {
                    const isExpanded = expandedId === rec.id;
                    const dayStr =
                      rec.gameDate || (rec.startedAt ? rec.startedAt.slice(0, 10) : '—');
                    return (
                      <React.Fragment key={rec.id}>
                        <tr className="hover:bg-[#111630]">
                          <td className="px-4 py-3 font-mono-tabular text-xs text-slate-300 whitespace-nowrap">
                            {dayStr}
                          </td>
                          <td className="px-4 py-3 font-semibold text-white">
                            <div>{rec.playerName || rec.playerId}</div>
                            {rec.playerEmail && (
                              <div className="text-[11px] font-normal text-slate-400">
                                {rec.playerEmail}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono-tabular font-bold text-cyan-300">
                            {rec.playerId}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-300">
                            {rec.deviceInfo || 'Web'}
                          </td>
                          <td className="px-4 py-3 font-mono-tabular font-bold text-yellow-300 whitespace-nowrap">
                            {rec.xp} / {rec.maxXp} XP ({rec.percentage}%)
                          </td>
                          <td className="px-4 py-3 text-xs whitespace-nowrap">
                            {rec.syncedToCloud ? (
                              <span className="font-semibold text-emerald-300">Nube ✓</span>
                            ) : (
                              <span className="font-semibold text-amber-300">Local</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                                className="inline-flex h-8 items-center gap-1 rounded-md border border-violet-500/40 bg-violet-950/40 px-2.5 text-xs font-semibold text-violet-200 hover:bg-violet-900/60 whitespace-nowrap cursor-pointer"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span>Ocultar</span>
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span>Respuestas</span>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => exportRecordToPDF(rec)}
                                title="Descargar PDF individual"
                                className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2.5 text-xs font-medium text-slate-200 hover:border-cyan-400 hover:text-white cursor-pointer"
                              >
                                <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>PDF</span>
                              </button>
                              {(isAdmin || !rec.syncedToCloud) && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteRecord(rec.id)}
                                  aria-label={`Eliminar registro de ${rec.playerName || rec.playerId}`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-500/30 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-[#0e132b]">
                            <td colSpan={7} className="p-5">
                              <div className="mb-3 flex flex-wrap gap-4 text-xs text-slate-400">
                                <span>Inicio: {formatReadableDate(rec.startedAt)}</span>
                                <span>·</span>
                                <span>Fin: {formatReadableDate(rec.finishedAt)}</span>
                                <span>·</span>
                                <span>
                                  Estrategias: {rec.bossPlan.powerUp1} + {rec.bossPlan.powerUp2}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div className="space-y-2 rounded-xl border border-slate-800 bg-[#090d1e] p-4">
                                  <p className="text-xs font-bold tracking-wider text-cyan-300">
                                    RESPUESTAS NIVELES 1 AL 4
                                  </p>
                                  {[1, 2, 3, 4].map((lvl) => {
                                    const ans = rec.answers[lvl];
                                    if (!ans) return null;
                                    return (
                                      <div key={lvl} className="text-xs text-slate-300">
                                        <span className="font-bold text-white">
                                          N{ans.levelId} ({ans.selectedOption} ·{' '}
                                          {ans.isCorrect ? '+1 XP' : '0 XP'}):
                                        </span>{' '}
                                        {ans.selectedText}
                                      </div>
                                    );
                                  })}
                                </div>

                                <div className="space-y-2.5 rounded-xl border border-fuchsia-500/30 bg-[#12102b] p-4">
                                  <p className="text-xs font-bold tracking-wider text-fuchsia-300">
                                    RESPUESTAS ESCRITAS DEL FINAL BOSS
                                  </p>
                                  <div className="text-xs text-slate-200">
                                    <span className="font-bold text-cyan-300">
                                      Power Up 03 (Cómo aplicaría las estrategias):
                                    </span>
                                    <p className="mt-1 leading-relaxed text-slate-100 whitespace-pre-wrap">
                                      {rec.bossPlan.powerUp3Plan || '—'}
                                    </p>
                                  </div>
                                  <div className="border-t border-slate-800 pt-2 text-xs text-slate-200">
                                    <span className="font-bold text-yellow-300">
                                      Bonus Round (Herramienta permanente y razón):
                                    </span>
                                    <p className="mt-1 leading-relaxed text-slate-100 whitespace-pre-wrap">
                                      {rec.bossPlan.bonusRoundReflection || '—'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
