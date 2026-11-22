import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Error inesperado en la aplicación.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#070913] p-6 text-slate-100">
          <div className="max-w-md rounded-2xl border border-rose-500/40 bg-[#0d1124] p-6 text-center shadow-2xl">
            <AlertTriangle className="mx-auto h-10 w-10 text-rose-400" aria-hidden="true" />
            <h1 className="mt-3 font-display text-xl font-bold text-white">
              Ocurrió un problema técnico
            </h1>
            <p className="mt-2 text-xs text-slate-300 break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 text-sm font-bold text-slate-950 hover:bg-cyan-300 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Recargar juego</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
