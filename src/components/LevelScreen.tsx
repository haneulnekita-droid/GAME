import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  Award,
  Brain,
  CheckCircle2,
  Clock,
  Lock,
  Music,
  Sparkles,
  Wind,
  XCircle,
  Zap,
} from 'lucide-react';
import { LevelAnswerRecord, LevelDefinition, OptionLetter } from '../types/game';
import { arcadeSound } from '../utils/sound';

interface LevelScreenProps {
  level: LevelDefinition;
  existingAnswer?: LevelAnswerRecord;
  onSelectAnswer: (letter: OptionLetter) => void;
  onNextLevel: () => void;
}

const DISTRACTION_BUBBLES = [
  { id: 'd1', label: '¿Y si repruebo?' },
  { id: 'd2', label: '12 notificaciones' },
  { id: 'd3', label: 'Mil pendientes' },
  { id: 'd4', label: 'Miedo al fallo' },
];

const PRIORITY_TASKS = [
  { id: 't1', label: '1. Exposición (Entrega Hoy)' },
  { id: 't2', label: '2. Evaluación (Miércoles)' },
  { id: 't3', label: '3. Pausa de 10 min' },
];

export function LevelScreen({
  level,
  existingAnswer,
  onSelectAnswer,
  onNextLevel,
}: LevelScreenProps) {
  const [imgError, setImgError] = useState(false);

  // Level 1 mini-game: sorting priorities
  const [sortedTasks, setSortedTasks] = useState<string[]>([]);

  // Level 2 mini-game: breathing guide
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhala profundo' | 'Sostén calma' | 'Exhala tensión'>('Inhala profundo');

  // Level 3 mini-game: popping distraction bubbles
  const [clearedBubbles, setClearedBubbles] = useState<string[]>([]);

  // Level 4 mini-game: rhythm energy boost
  const [energyBoostCount, setEnergyBoostCount] = useState(0);

  // Reset mini-widgets cleanly when switching levels
  useEffect(() => {
    setImgError(false);
    setSortedTasks([]);
    setBreathActive(false);
    setClearedBubbles([]);
    setEnergyBoostCount(0);
  }, [level.id]);

  const isAnswered = Boolean(existingAnswer);
  const isCorrect = existingAnswer?.isCorrect ?? false;

  const handleToggleTask = (taskId: string) => {
    arcadeSound.playClick();
    setSortedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleStartBreathingPractice = () => {
    if (breathActive) return;
    arcadeSound.playClick();
    setBreathActive(true);
    setBreathPhase('Inhala profundo');
    setTimeout(() => setBreathPhase('Sostén calma'), 2000);
    setTimeout(() => setBreathPhase('Exhala tensión'), 4000);
    setTimeout(() => setBreathActive(false), 6500);
  };

  const handlePopBubble = (id: string) => {
    arcadeSound.playClick();
    setClearedBubbles((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleDancePulse = () => {
    arcadeSound.playClick();
    setEnergyBoostCount((c) => Math.min(4, c + 1));
  };

  const renderLevelIcon = () => {
    switch (level.id) {
      case 1:
        return <Clock className="h-5 w-5 text-cyan-300" aria-hidden="true" />;
      case 2:
        return <Wind className="h-5 w-5 text-sky-300" aria-hidden="true" />;
      case 3:
        return <Brain className="h-5 w-5 text-fuchsia-300" aria-hidden="true" />;
      case 4:
        return <Activity className="h-5 w-5 text-yellow-300" aria-hidden="true" />;
    }
  };

  // Compute interactive gauge percentage
  let miniBonus = 0;
  if (level.id === 1) miniBonus = sortedTasks.length * 15;
  if (level.id === 2) miniBonus = breathActive ? 45 : 0;
  if (level.id === 3) miniBonus = clearedBubbles.length * 12;
  if (level.id === 4) miniBonus = energyBoostCount * 15;

  const meterPercent = isAnswered ? 100 : Math.min(85, 25 + miniBonus);
  const stressPercent = isAnswered ? 15 : Math.max(25, 85 - miniBonus);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-9">
      <div
        className={`grid grid-cols-1 items-stretch gap-6 rounded-2xl border bg-[#0b0f24]/95 p-5 backdrop-blur-md sm:p-7 lg:grid-cols-12 ${level.theme.borderClass} ${level.theme.glowClass}`}
      >
        {/* Left Interactive Game Stage */}
        <div className="flex flex-col justify-between gap-4 lg:col-span-5">
          <div>
            {/* Stage Banner with Skill Crest Thumbnail */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#111632] p-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-cyan-400/40 bg-slate-950">
                  <img
                    src={level.skillImageUrl}
                    alt={level.skillUnlocked}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className={`font-mono-tabular text-xs font-bold ${level.theme.highlightTextClass}`}>
                    {level.code} · {level.title}
                  </p>
                  <p className="truncate text-xs text-slate-300">{level.theme.badgeText}</p>
                </div>
              </div>
              <span className="font-mono-tabular text-xs font-bold text-yellow-300 shrink-0">
                +1 XP
              </span>
            </div>

            {/* Scene Artwork */}
            <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950 shadow-lg">
              {!imgError ? (
                <img
                  key={level.imageUrl}
                  src={level.imageUrl}
                  alt={level.imageAlt}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 p-6 text-center">
                  {renderLevelIcon()}
                  <p className="mt-3 font-display text-lg font-bold text-white">
                    Escena: {level.characterName}
                  </p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0f24] via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                <span className="font-display font-bold text-white">
                  Protagonista: {level.characterName}
                </span>
                <span className="font-mono-tabular text-cyan-200">
                  {level.skillUnlocked}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Dual Game Meter + Level Mini-Game */}
          <div className="rounded-xl border border-slate-800 bg-[#111632]/95 p-4 space-y-3.5">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-300">
                  <span>{level.theme.meterLabel}</span>
                  <span className="font-mono-tabular font-bold text-cyan-300">{meterPercent}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${meterPercent}%`, backgroundColor: level.theme.primaryHex }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300">
                  <span>Nivel de Estrés</span>
                  <span className="font-mono-tabular font-bold text-rose-300">{stressPercent}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500"
                    style={{ width: `${stressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Level-Specific Playable Mini-Widgets */}
            {level.id === 1 && (
              <div className="border-t border-slate-800 pt-3">
                <p className="mb-2 text-xs font-semibold text-cyan-300">
                  Mini-Reto: Ayuda a María a marcar sus prioridades ({sortedTasks.length}/3)
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRIORITY_TASKS.map((t) => {
                    const done = sortedTasks.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleToggleTask(t.id)}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                          done
                            ? 'border-cyan-400 bg-cyan-950/60 text-cyan-100'
                            : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-400/50'
                        }`}
                      >
                        {done ? '✓ ' : ''}
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {level.id === 2 && (
              <div className="border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={handleStartBreathingPractice}
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-sky-400/45 bg-sky-950/50 px-3 py-2.5 text-xs font-bold text-sky-100 transition-colors hover:bg-sky-900/60 cursor-pointer"
                >
                  <Wind
                    className={`h-4 w-4 ${breathActive ? 'animate-breathe-ring text-cyan-300' : ''}`}
                    aria-hidden="true"
                  />
                  <span>
                    {breathActive
                      ? `Guía activa: ${breathPhase}...`
                      : 'Mini-Reto: Practicar respiración guiada con Pedro'}
                  </span>
                </button>
              </div>
            )}

            {level.id === 3 && (
              <div className="border-t border-slate-800 pt-3">
                <p className="mb-2 text-xs font-semibold text-fuchsia-300">
                  Mini-Reto: Toca las distracciones para disipar el ruido mental ({clearedBubbles.length}/4)
                </p>
                <div className="flex flex-wrap gap-2">
                  {DISTRACTION_BUBBLES.map((b) => {
                    const popped = clearedBubbles.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        disabled={popped}
                        onClick={() => handlePopBubble(b.id)}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                          popped
                            ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300 line-through opacity-60 cursor-default'
                            : 'border-fuchsia-400/40 bg-fuchsia-950/35 text-fuchsia-100 hover:bg-fuchsia-900/50 cursor-pointer'
                        }`}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {level.id === 4 && (
              <div className="border-t border-slate-800 pt-3 space-y-2.5">
                <div className="flex items-end justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleDancePulse}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-yellow-400/45 bg-yellow-950/40 px-3 py-2 text-xs font-bold text-yellow-200 transition-colors hover:bg-yellow-900/50 cursor-pointer"
                  >
                    <Music className="h-4 w-4" aria-hidden="true" />
                    <span>Mini-Reto: Activar pulso de baile (+Energía)</span>
                  </button>
                  {/* Animated Equalizer Bars */}
                  <div className="flex h-8 items-end gap-1 px-1" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((bar) => (
                      <span
                        key={bar}
                        className="w-1.5 rounded-t bg-yellow-400 transition-all duration-200"
                        style={{
                          height: `${Math.min(100, 22 + ((energyBoostCount * 19 + bar * 17) % 75))}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Decision & Question Deck */}
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            <p className="font-mono-tabular text-xs font-bold tracking-wider text-slate-400">
              MISIÓN: <span className={level.theme.highlightTextClass}>{level.mission}</span>
            </p>

            <h1 className="mt-1.5 font-display text-2xl font-extrabold text-white sm:text-3xl">
              {level.title}
            </h1>

            <div className="mt-4 rounded-xl border border-slate-800 bg-[#121734]/90 p-4 sm:p-5">
              <p className="text-xs font-bold tracking-wider text-cyan-300">ESCENARIO</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-100 sm:text-base">
                {level.scenario}
              </p>
            </div>

            <h2 className="mt-5 font-display text-lg font-bold leading-snug text-white sm:text-xl">
              {level.question}
            </h2>

            <div className="mt-4 space-y-2.5">
              {level.options.map((opt) => {
                const isSelected = existingAnswer?.selectedOption === opt.letter;
                const isRightOption = opt.letter === level.correctOption;

                let cardStyle =
                  'border-slate-700/80 bg-[#111632] text-slate-100 hover:border-cyan-400/70 hover:bg-[#171f45]';
                if (isAnswered) {
                  if (isSelected && isCorrect) {
                    cardStyle =
                      'border-emerald-400 bg-emerald-950/50 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]';
                  } else if (isSelected && !isCorrect) {
                    cardStyle =
                      'border-rose-400 bg-rose-950/50 text-white shadow-[0_0_20px_rgba(244,63,94,0.2)]';
                  } else if (isRightOption) {
                    cardStyle = 'border-emerald-500/50 bg-emerald-950/20 text-emerald-100';
                  } else {
                    cardStyle = 'border-slate-800 bg-[#0b0f22] text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={opt.letter}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => onSelectAnswer(opt.letter)}
                    className={`flex w-full items-start gap-3.5 rounded-xl border p-3.5 text-left transition-all duration-150 sm:p-4 ${cardStyle} ${
                      isAnswered ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono-tabular text-sm font-bold ${
                        isSelected && isCorrect
                          ? 'border-emerald-400 bg-emerald-400 text-slate-950'
                          : isSelected && !isCorrect
                          ? 'border-rose-400 bg-rose-400 text-slate-950'
                          : 'border-slate-600 bg-slate-800 text-slate-100'
                      }`}
                    >
                      {opt.letter}
                    </span>
                    <span className="flex-1 text-sm leading-relaxed sm:text-[15px]">
                      {opt.text}
                    </span>
                    {isAnswered && isSelected && (
                      <span className="shrink-0 pt-0.5">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-label="Correcta" />
                        ) : (
                          <XCircle className="h-5 w-5 text-rose-400" aria-label="Incorrecta" />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback + Animated Skill Emblem Unlock Card */}
          <div className="mt-6">
            {isAnswered ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div
                  role="status"
                  className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center ${
                    isCorrect
                      ? 'border-emerald-400/60 bg-emerald-950/35 text-emerald-100'
                      : 'border-amber-400/50 bg-amber-950/30 text-amber-100'
                  }`}
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-cyan-400/70 bg-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.35)]">
                    <img
                      src={level.skillImageUrl}
                      alt={level.skillUnlocked}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 font-display text-sm font-extrabold">
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                            <span>¡ACIERTO! +1 XP</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-amber-400" aria-hidden="true" />
                            <span>RESPUESTA REGISTRADA · 0 XP</span>
                          </>
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono-tabular text-xs text-slate-300">
                        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                        Bloqueado
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm leading-relaxed">
                      {isCorrect ? level.feedbackCorrect : level.feedbackWrong}
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs font-bold">
                      <span className="inline-flex items-center gap-1 text-yellow-300">
                        <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                        {isCorrect ? '+1 XP GANADO' : '0 XP'}
                      </span>
                      <span aria-hidden="true" className="text-slate-500">·</span>
                      <span className="inline-flex items-center gap-1 text-cyan-300">
                        <Award className="h-3.5 w-3.5" aria-hidden="true" />
                        EMBLEMA DESBLOQUEADO: {level.skillUnlocked}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onNextLevel}
                    className={`inline-flex h-13 w-full items-center justify-center gap-2.5 rounded-xl px-7 font-display text-sm font-extrabold tracking-wide shadow-lg transition-all hover:scale-[1.02] sm:w-auto whitespace-nowrap cursor-pointer ${level.theme.buttonBgClass}`}
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    <span>{level.nextButtonLabel}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#090d1e] px-4 py-3 text-xs text-slate-300">
                <span>Elige una respuesta (A, B, C o D) para desbloquear el emblema de este nivel.</span>
                <span className="hidden sm:inline font-mono-tabular text-cyan-300">
                  Obligatorio
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
