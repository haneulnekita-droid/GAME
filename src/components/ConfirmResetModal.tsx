import { AlertTriangle, RotateCcw, X } from 'lucide-react';

interface ConfirmResetModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmResetModal({
  isOpen,
  onCancel,
  onConfirm,
}: ConfirmResetModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-reset-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0d1124] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-950/40 text-amber-300">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 id="confirm-reset-title" className="font-display text-lg font-bold text-white">
              ¿Reiniciar partida actual?
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar confirmación"
            className="rounded-lg p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Si reinicias ahora, volverás a la pantalla de inicio para comenzar una nueva partida. Los registros de partidas ya completadas se conservarán en la base de datos Excel.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-slate-200 hover:border-slate-500 whitespace-nowrap cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 text-sm font-bold text-white hover:bg-rose-400 whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Sí, reiniciar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
