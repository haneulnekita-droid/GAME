import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Flame, Shield, ShieldCheck, Sparkles, Swords } from 'lucide-react';
import { BOSS_CONTENT, GAME_BRAND, STRATEGIES } from '../data/gameContent';
import { BossPlanData, StrategyId } from '../types/game';

interface BossScreenProps {
  initialPlan: BossPlanData;
  onCompleteBoss: (plan: BossPlanData) => void;
}

export function BossScreen({ initialPlan, onCompleteBoss }: BossScreenProps) {
  const [powerUp1, setPowerUp1] = useState<StrategyId | ''>(initialPlan.powerUp1);
  const [powerUp2, setPowerUp2] = useState<StrategyId | ''>(initialPlan.powerUp2);
  const [powerUp3Plan, setPowerUp3Plan] = useState(initialPlan.powerUp3Plan);
  const [bonusRoundReflection, setBonusRoundReflection] = useState(
    initialPlan.bonusRoundReflection
  );
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  const completedCount =
    (powerUp1 ? 1 : 0) +
    (powerUp2 ? 1 : 0) +
    (powerUp3Plan.trim().length >= 5 ? 1 : 0) +
    (bonusRoundReflection.trim().length >= 5 ? 1 : 0);

  const controlPercent = Math.round((completedCount / 4) * 100);
  const bossHpPercent = Math.max(0, 100 - controlPercent);

  const handleSelectPowerUp1 = (strategy: StrategyId) => {
    setPowerUp1(strategy);
    if (powerUp2 === strategy) {
      setPowerUp2('');
    }
    if (error) setError('');
  };

  const handleSelectPowerUp2 = (strategy: StrategyId) => {
    if (strategy === powerUp1) return;
    setPowerUp2(strategy);
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!powerUp1) {
      setError('Selecciona tu primera herramienta en el Power Up 01.');
      return;
    }
    if (!powerUp2 || powerUp2 === powerUp1) {
      setError('Selecciona una segunda herramienta diferente en el Power Up 02.');
      return;
    }
    if (powerUp3Plan.trim().length < 5) {
      setError('Completa tu plan de aplicación en el Power Up 03.');
      return;
    }
    if (bonusRoundReflection.trim().length < 5) {
      setError('Completa tu reflexión en el Bonus Round.');
      return;
    }

    setError('');
    onCompleteBoss({
      powerUp1,
      powerUp2,
      powerUp3Plan: powerUp3Plan.trim(),
      bonusRoundReflection: bonusRoundReflection.trim(),
    });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-9">
      <div className="overflow-hidden rounded-2xl border border-fuchsia-500/45 bg-[#0b0e23]/95 shadow-[0_0_50px_rgba(217,70,239,0.2)] backdrop-blur-md">
        {/* Epic Boss Hero Banner */}
        <div className="relative min-h-[240px] w-full overflow-hidden border-b border-fuchsia-500/35 bg-slate-950 sm:min-h-[290px]">
          {!imgError ? (
            <img
              src={GAME_BRAND.bossImage}
              alt="Jefe final representando la acumulación de evaluaciones, relojes y responsabilidades universitarias"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-64 w-full object-cover object-center sm:h-80"
            />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 p-6 text-center sm:h-80">
              <Swords className="h-14 w-14 text-fuchsia-400" aria-hidden="true" />
              <p className="mt-3 font-display text-2xl font-extrabold text-white">
                TITÁN DE RESPONSABILIDADES
              </p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e23] via-[#0b0e23]/55 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold tracking-wider">
              <span className="font-mono-tabular text-fuchsia-300">
                NIVEL DE DIFICULTAD: {BOSS_CONTENT.difficulty}
              </span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-cyan-300">REFLEXIÓN PERSONAL (SIN EVALUACIÓN CORRECTA/INCORRECTA)</span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-extrabold text-white text-balance sm:text-4xl">
              {BOSS_CONTENT.title}
            </h1>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          {/* Boss Battle Dual HUD: Boss HP vs Player Control Energy */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="rounded-xl border border-slate-800 bg-[#111533] p-5 lg:col-span-6">
              <p className="text-xs font-bold tracking-wider text-fuchsia-300">
                ESCENARIO DEL JEFE FINAL
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-100 sm:text-base">
                {BOSS_CONTENT.scenario}
              </p>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-xl border border-cyan-500/35 bg-[#101736] p-5 lg:col-span-6">
              {/* Boss HP */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="inline-flex items-center gap-2 text-rose-300">
                    <Swords className="h-4 w-4" aria-hidden="true" />
                    VIDA DEL JEFE (TENSIÓN ACADÉMICA)
                  </span>
                  <span className="font-mono-tabular text-rose-200">{bossHpPercent}% HP</span>
                </div>
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-900">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 transition-all duration-300"
                    style={{ width: `${bossHpPercent}%` }}
                  />
                </div>
              </div>

              {/* Player Control Energy */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="inline-flex items-center gap-2 text-cyan-300">
                    <Shield className="h-4 w-4 text-yellow-300" aria-hidden="true" />
                    TU ENERGÍA DE CONTROL
                  </span>
                  <span className="font-mono-tabular text-cyan-200">{controlPercent}%</span>
                </div>
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-900">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-yellow-400 transition-all duration-300"
                    style={{ width: `${Math.max(8, controlPercent)}%` }}
                  />
                </div>
              </div>

              <p className="inline-flex items-center gap-2 font-display text-sm font-extrabold tracking-wide text-yellow-300 sm:text-base">
                <Flame className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{BOSS_CONTENT.controlMessage}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* POWER UP 01 */}
            <div className="space-y-3">
              <div>
                <h2 className="font-display text-lg font-bold text-cyan-300">
                  {BOSS_CONTENT.powerUp1Title}
                </h2>
                <p className="mt-1 text-sm text-slate-200 sm:text-base">
                  {BOSS_CONTENT.powerUp1Question}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {STRATEGIES.map((st) => {
                  const selected = powerUp1 === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleSelectPowerUp1(st.id)}
                      className={`flex items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                        selected
                          ? 'border-cyan-400 bg-cyan-950/45 text-white shadow-[0_0_22px_rgba(34,211,238,0.22)]'
                          : 'border-slate-800 bg-[#111530] text-slate-200 hover:border-cyan-400/50'
                      }`}
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-cyan-400/30 bg-slate-950">
                        <img
                          src={st.badgeImage}
                          alt={st.shortTitle}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm font-bold">{st.shortTitle}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{st.description}</p>
                      </div>
                      {selected && (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-400" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* POWER UP 02 */}
            <div className="space-y-3">
              <div>
                <h2 className="font-display text-lg font-bold text-violet-300">
                  {BOSS_CONTENT.powerUp2Title}
                </h2>
                <p className="mt-1 text-sm text-slate-200 sm:text-base">
                  {BOSS_CONTENT.powerUp2Question}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {STRATEGIES.map((st) => {
                  const isSameAsFirst = powerUp1 === st.id;
                  const selected = powerUp2 === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      disabled={isSameAsFirst}
                      onClick={() => handleSelectPowerUp2(st.id)}
                      className={`flex items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all ${
                        isSameAsFirst
                          ? 'border-slate-800/60 bg-[#0b0e20] text-slate-500 opacity-45 cursor-not-allowed'
                          : selected
                          ? 'border-violet-400 bg-violet-950/50 text-white shadow-[0_0_22px_rgba(167,139,250,0.22)] cursor-pointer'
                          : 'border-slate-800 bg-[#111530] text-slate-200 hover:border-violet-400/50 cursor-pointer'
                      }`}
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-violet-400/30 bg-slate-950">
                        <img
                          src={st.badgeImage}
                          alt={st.shortTitle}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm font-bold">
                          {st.shortTitle}
                          {isSameAsFirst && ' (Equipada en Power Up 01)'}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">{st.description}</p>
                      </div>
                      {selected && (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-violet-300" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* POWER UP 03 */}
            <div className="space-y-2.5">
              <label htmlFor="power-up-3" className="block">
                <span className="font-display text-lg font-bold text-fuchsia-300">
                  {BOSS_CONTENT.powerUp3Title}
                </span>
                <span className="mt-1 block text-sm text-slate-200 sm:text-base">
                  {BOSS_CONTENT.powerUp3Question}
                </span>
              </label>
              <textarea
                id="power-up-3"
                rows={4}
                value={powerUp3Plan}
                onChange={(e) => {
                  setPowerUp3Plan(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Describe paso a paso cómo combinarías tus dos estrategias durante esta semana exigente y qué beneficios esperas lograr..."
                className="w-full rounded-xl border border-slate-700 bg-[#070a17] p-4 text-sm leading-relaxed text-white placeholder:text-slate-500 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30"
              />
            </div>

            {/* BONUS ROUND */}
            <div className="space-y-2.5">
              <label htmlFor="bonus-round" className="block">
                <span className="font-display text-lg font-bold text-yellow-300">
                  {BOSS_CONTENT.bonusTitle}
                </span>
                <span className="mt-1 block text-sm text-slate-200 sm:text-base">
                  {BOSS_CONTENT.bonusQuestion}
                </span>
              </label>
              <textarea
                id="bonus-round"
                rows={4}
                value={bonusRoundReflection}
                onChange={(e) => {
                  setBonusRoundReflection(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Escribe qué herramienta incorporarías de forma permanente en tu rutina universitaria y por qué es valiosa para tu bienestar..."
                className="w-full rounded-xl border border-slate-700 bg-[#070a17] p-4 text-sm leading-relaxed text-white placeholder:text-slate-500 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3.5 text-sm font-medium text-rose-200"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 sm:flex-row">
              <p className="inline-flex items-center gap-2 text-xs text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                Al completar, tu partida y plan personal se guardan para exportar en Excel y PDF.
              </p>

              <button
                type="submit"
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-8 font-display text-base font-extrabold tracking-wide text-white shadow-[0_0_32px_rgba(217,70,239,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_42px_rgba(217,70,239,0.6)] sm:w-auto whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                <span>{BOSS_CONTENT.submitLabel}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
