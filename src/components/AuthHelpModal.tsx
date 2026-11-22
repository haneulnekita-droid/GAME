import { AlertTriangle, ExternalLink, RefreshCw, ShieldAlert, X } from 'lucide-react';
import { ADMIN_EMAIL } from '../firebase';

export interface AuthErrorDetails {
  code: string;
  title: string;
  description: string;
  isInIframe: boolean;
  currentUrl: string;
  hostname: string;
}

interface AuthHelpModalProps {
  error: AuthErrorDetails | null;
  isSigningIn: boolean;
  onRetry: () => void;
  onClose: () => void;
}

export function AuthHelpModal({
  error,
  isSigningIn,
  onRetry,
  onClose,
}: AuthHelpModalProps) {
  if (!error) return null;

  const isUnauthorizedDomain = error.code === 'auth/unauthorized-domain';
  const isOperationNotAllowed = error.code === 'auth/operation-not-allowed';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-help-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-amber-400/45 bg-[#0d1124] shadow-[0_0_45px_rgba(251,191,36,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-950/50">
              {isUnauthorizedDomain || isOperationNotAllowed ? (
                <ShieldAlert className="h-5 w-5 text-amber-300" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-300" aria-hidden="true" />
              )}
            </div>
            <div>
              <h2 id="auth-help-title" className="font-display text-base font-bold text-white">
                {error.title}
              </h2>
              <p className="text-xs text-slate-400">
                Acceso Docente ({ADMIN_EMAIL})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar aviso de acceso"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 p-6 text-sm text-slate-200">
          <p className="leading-relaxed">{error.description}</p>

          {error.isInIframe && !isUnauthorizedDomain && !isOperationNotAllowed && (
            <div className="rounded-xl border border-cyan-500/35 bg-cyan-950/30 p-4 text-xs leading-relaxed text-cyan-100">
              <p className="font-bold text-cyan-300">
                Solución recomendada (Vista previa integrada):
              </p>
              <p className="mt-1">
                Muchos navegadores cierran automáticamente la ventana emergente de Google cuando la app está abierta dentro de una vista previa embebida. Ábrela en una pestaña independiente del navegador para iniciar sesión sin bloqueos.
              </p>
            </div>
          )}

          {isUnauthorizedDomain && (
            <div className="rounded-xl border border-rose-500/35 bg-rose-950/25 p-4 text-xs leading-relaxed text-rose-100">
              <p className="font-bold text-rose-300">Dominio pendiente de autorizar en Firebase:</p>
              <p className="mt-1">
                En Firebase Console → <strong>Authentication</strong> → <strong>Settings</strong> → <strong>Authorized domains</strong>, agrega este dominio exacto:
              </p>
              <code className="mt-2 block break-all rounded-lg border border-rose-400/30 bg-black/50 px-3 py-2 font-mono text-xs text-yellow-300">
                {error.hostname}
              </code>
            </div>
          )}

          {isOperationNotAllowed && (
            <div className="rounded-xl border border-rose-500/35 bg-rose-950/25 p-4 text-xs leading-relaxed text-rose-100">
              <p className="font-bold text-rose-300">Proveedor de Google deshabilitado:</p>
              <p className="mt-1">
                En Firebase Console → <strong>Authentication</strong> → <strong>Sign-in method</strong>, habilita el proveedor <strong>Google</strong>.
              </p>
            </div>
          )}

          <div className="rounded-lg border border-slate-800 bg-[#080b18] px-3 py-2 font-mono text-[11px] text-slate-400">
            Código: <span className="text-slate-200">{error.code || 'desconocido'}</span> · Dominio:{' '}
            <span className="text-slate-200">{error.hostname}</span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            {error.isInIframe && (
              <a
                href={error.currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 text-xs font-bold text-slate-950 transition-colors hover:bg-cyan-300 whitespace-nowrap"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span>Abrir en Pestaña Nueva</span>
              </a>
            )}

            <button
              type="button"
              onClick={onRetry}
              disabled={isSigningIn}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-400/50 bg-emerald-950/50 px-4 text-xs font-bold text-emerald-200 transition-colors hover:bg-emerald-900/60 disabled:opacity-60 whitespace-nowrap cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isSigningIn ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{isSigningIn ? 'Abriendo Google...' : 'Reintentar Ventana Google'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 text-xs font-semibold text-slate-200 hover:border-slate-500 hover:text-white cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
