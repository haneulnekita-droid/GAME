import { LevelDefinition, StrategyId } from '../types/game';

export const GAME_BRAND = {
  logo: 'STRESS OFF',
  title: '¡DESBLOQUEA TU BIENESTAR!',
  subtitle: 'Tu aventura universitaria comienza aquí.',
  startQuote:
    '«Las responsabilidades son parte del camino, pero aprender a gestionar el estrés es tu verdadero superpoder».',
  gameOverTitle: '¡GAME OVER! ¡MISIÓN COMPLETADA!',
  gameOverQuote:
    '«No todo se puede controlar, pero sí podemos aprender a afrontar lo que nos sucede».',
  gameOverFooter: 'STRESS OFF · TU BIENESTAR ES TU MAYOR PODER.',
  heroImage: '/src/assets/images/hero_gamer_student_1794843587426.jpg',
  bossImage: '/src/assets/images/boss_academic_titan_1794843588993.jpg',
  victoryImage: '/src/assets/images/victory_celebration_gamer_1794843590041.jpg',
  arenaBackdrop: '/src/assets/images/arcade_arena_bg_1794843921142.jpg',
};

export const SKILL_BADGES = {
  time: '/src/assets/images/skill_badge_time_1794843919016.jpg',
  breath: '/src/assets/images/skill_badge_breath_1794843919254.jpg',
  mind: '/src/assets/images/skill_badge_mind_1794843920405.jpg',
  dance: '/src/assets/images/skill_badge_dance_1794843920855.jpg',
};

export const STRATEGIES: {
  id: StrategyId;
  shortTitle: string;
  description: string;
  badgeImage: string;
}[] = [
  {
    id: 'Organización del tiempo',
    shortTitle: 'Organización del tiempo',
    description: 'Priorizar entregas, armar horarios realistas y programar pausas.',
    badgeImage: SKILL_BADGES.time,
  },
  {
    id: 'Respiración consciente',
    shortTitle: 'Respiración consciente',
    description: 'Regular la activación física y reconocer emociones sin juzgar.',
    badgeImage: SKILL_BADGES.breath,
  },
  {
    id: 'Mindfulness o atención plena',
    shortTitle: 'Mindfulness o atención plena',
    description: 'Observar distracciones y regresar con amabilidad al momento presente.',
    badgeImage: SKILL_BADGES.mind,
  },
  {
    id: 'Movimiento corporal y baile',
    shortTitle: 'Movimiento corporal y baile',
    description: 'Liberar tensiones con pausas activas, baile o actividad física.',
    badgeImage: SKILL_BADGES.dance,
  },
];

export const MAP_NODES = [
  {
    id: 1,
    code: 'LEVEL 01',
    title: 'CONTROL DEL CAOS',
    skill: 'Organización del tiempo',
    badgeImage: SKILL_BADGES.time,
    reward: '+1 XP',
  },
  {
    id: 2,
    code: 'LEVEL 02',
    title: 'MODO RESPIRA',
    skill: 'Respiración consciente',
    badgeImage: SKILL_BADGES.breath,
    reward: '+1 XP',
  },
  {
    id: 3,
    code: 'LEVEL 03',
    title: 'MENTE PRESENTE',
    skill: 'Mindfulness',
    badgeImage: SKILL_BADGES.mind,
    reward: '+1 XP',
  },
  {
    id: 4,
    code: 'LEVEL 04',
    title: 'LIBERA TU ENERGÍA',
    skill: 'Movimiento corporal y baile',
    badgeImage: SKILL_BADGES.dance,
    reward: '+1 XP',
  },
  {
    id: 5,
    code: 'FINAL BOSS',
    title: 'CREA TU PROPIO PLAN ANTIESTRÉS',
    skill: 'Plan Personal Antiestrés',
    badgeImage: '/src/assets/images/boss_academic_titan_1794843588993.jpg',
    reward: 'TROFEO FINAL',
  },
];

export const LEVELS: LevelDefinition[] = [
  {
    id: 1,
    code: 'LEVEL 01',
    title: 'CONTROL DEL CAOS',
    mission: 'EL TIEMPO ESTÁ EN TU CONTRA.',
    skillUnlocked: 'ORGANIZACIÓN DEL TIEMPO',
    skillImageUrl: SKILL_BADGES.time,
    characterName: 'María',
    imageUrl: '/src/assets/images/level1_chaos_maria_1794843586743.jpg',
    imageAlt: 'María rodeada de libros, calendarios, tareas y relojes en su escritorio universitario',
    scenario:
      'María tiene tres trabajos universitarios, una exposición y una evaluación durante la misma semana. Ha comenzado varias actividades al mismo tiempo, pero no logra avanzar con ninguna. Se siente abrumada y piensa que no tendrá tiempo suficiente para cumplir con todo.',
    question:
      'Si fueras el personaje principal de esta historia, ¿qué estrategia le recomendarías para recuperar el control de su semana?',
    options: [
      {
        letter: 'A',
        text: 'Comenzar por la actividad que le resulte más sencilla, sin importar su fecha de entrega, y dejar las demás para después.',
      },
      {
        letter: 'B',
        text: 'Identificar las fechas de entrega, establecer prioridades y distribuir sus actividades en un horario realista, incluyendo pausas.',
      },
      {
        letter: 'C',
        text: 'Dedicar todo su tiempo a estudiar y trabajar sin realizar descansos, para terminar la mayor cantidad de actividades posible.',
      },
      {
        letter: 'D',
        text: 'Intentar realizar varias tareas simultáneamente para aprovechar cada minuto disponible.',
      },
    ],
    correctOption: 'B',
    feedbackCorrect:
      '¡EXCELENTE, PLAYER! Has desbloqueado el poder de organizar tu tiempo. Priorizar las responsabilidades y establecer horarios realistas permite reducir la sensación de descontrol.',
    feedbackWrong:
      '¡UPS! Has perdido una oportunidad de optimizar tu tiempo. Recuerda que organizar las actividades, establecer prioridades y programar descansos ayuda a afrontar mejor las responsabilidades.',
    nextButtonLabel: 'SIGUIENTE NIVEL',
    theme: {
      primaryHex: '#22D3EE',
      badgeText: 'Cronómetro y Prioridades',
      borderClass: 'border-cyan-400/35',
      glowClass: 'shadow-[0_0_35px_rgba(34,211,238,0.18)]',
      buttonBgClass: 'bg-cyan-400 hover:bg-cyan-300 text-slate-950',
      highlightTextClass: 'text-cyan-300',
      meterLabel: 'Control de Agenda',
    },
  },
  {
    id: 2,
    code: 'LEVEL 02',
    title: 'MODO RESPIRA',
    mission: 'CUANDO EL CUERPO ACTIVA LA ALARMA.',
    skillUnlocked: 'RESPIRACIÓN CONSCIENTE',
    skillImageUrl: SKILL_BADGES.breath,
    characterName: 'Pedro',
    imageUrl: '/src/assets/images/level2_breath_pedro_1794843587496.jpg',
    imageAlt: 'Pedro antes de una exposición practicando respiración consciente frente al podio',
    scenario:
      'Pedro debe realizar una exposición frente a sus compañeros. Aunque ha estudiado y preparado su presentación, minutos antes de comenzar siente tensión muscular, respiración acelerada y preocupación por equivocarse. Reconoce que su cuerpo está reaccionando ante una situación estresante.',
    question:
      '¿Qué estrategia podría ayudarlo a regular su activación física y emocional antes de comenzar su exposición?',
    options: [
      {
        letter: 'A',
        text: 'Concentrarse únicamente en memorizar toda su exposición para evitar pensar en lo que siente.',
      },
      {
        letter: 'B',
        text: 'Realizar una pausa, practicar respiración consciente y reconocer sus emociones sin juzgarse.',
      },
      {
        letter: 'C',
        text: 'Repetirse constantemente que no debe sentir nervios, porque mostrar inseguridad podría perjudicarlo.',
      },
      {
        letter: 'D',
        text: 'Evitar mirar a sus compañeros y apresurarse para terminar la exposición lo antes posible.',
      },
    ],
    correctOption: 'B',
    feedbackCorrect:
      '¡GENIAL! Has activado el modo respiración. La respiración consciente y el reconocimiento emocional pueden ayudar a regular la activación física y recuperar la calma.',
    feedbackWrong:
      '¡CUIDADO! No necesitas luchar contra tus emociones. Reconocer lo que sientes y realizar una pausa consciente puede ayudarte a afrontar mejor la situación.',
    nextButtonLabel: 'SIGUIENTE NIVEL',
    theme: {
      primaryHex: '#38BDF8',
      badgeText: 'Pulso y Calma Corporal',
      borderClass: 'border-sky-400/35',
      glowClass: 'shadow-[0_0_35px_rgba(56,189,248,0.18)]',
      buttonBgClass: 'bg-sky-400 hover:bg-sky-300 text-slate-950',
      highlightTextClass: 'text-sky-300',
      meterLabel: 'Regulación Física',
    },
  },
  {
    id: 3,
    code: 'LEVEL 03',
    title: 'MENTE PRESENTE',
    mission: 'ESCAPA DEL RUIDO MENTAL.',
    skillUnlocked: 'MINDFULNESS',
    skillImageUrl: SKILL_BADGES.mind,
    characterName: 'Ana',
    imageUrl: '/src/assets/images/level3_mindfulness_ana_1794843587876.jpg',
    imageAlt: 'Ana practicando mindfulness mientras las notificaciones y preocupaciones flotan lejos',
    scenario:
      'Ana está estudiando para una evaluación importante, pero constantemente piensa en los trabajos que todavía tiene pendientes, las actividades del día siguiente y la posibilidad de obtener una mala calificación. Aunque permanece varias horas frente a sus apuntes, le cuesta concentrarse en lo que está haciendo.',
    question:
      '¿Cómo podría Ana recuperar su atención y evitar que las preocupaciones sobre el futuro interfieran con su actividad presente?',
    options: [
      {
        letter: 'A',
        text: 'Continuar estudiando durante más horas, aunque su atención esté dispersa, para compensar el tiempo perdido.',
      },
      {
        letter: 'B',
        text: 'Revisar constantemente sus pendientes mientras estudia para asegurarse de no olvidar ninguna responsabilidad.',
      },
      {
        letter: 'C',
        text: 'Practicar mindfulness, dirigir conscientemente su atención hacia la respiración y los sentidos, y regresar al estudio cuando aparezcan distracciones.',
      },
      {
        letter: 'D',
        text: 'Intentar eliminar todos sus pensamientos sobre las responsabilidades futuras antes de continuar estudiando.',
      },
    ],
    correctOption: 'C',
    feedbackCorrect:
      '¡INCREÍBLE! Has desbloqueado el poder de la atención plena. No necesitas eliminar tus pensamientos; puedes aprender a observarlos y regresar tu atención al momento presente.',
    feedbackWrong:
      '¡NO TE RINDAS! La atención plena no consiste en dejar la mente en blanco. Consiste en reconocer las distracciones y regresar conscientemente al presente.',
    nextButtonLabel: 'SIGUIENTE NIVEL',
    theme: {
      primaryHex: '#C084FC',
      badgeText: 'Enfoque y Atención Plena',
      borderClass: 'border-fuchsia-400/35',
      glowClass: 'shadow-[0_0_35px_rgba(232,121,249,0.18)]',
      buttonBgClass: 'bg-fuchsia-400 hover:bg-fuchsia-300 text-slate-950',
      highlightTextClass: 'text-fuchsia-300',
      meterLabel: 'Claridad Mental',
    },
  },
  {
    id: 4,
    code: 'LEVEL 04',
    title: 'LIBERA TU ENERGÍA',
    mission: 'ROMPE LA BARRA DE TENSIÓN.',
    skillUnlocked: 'MOVIMIENTO CORPORAL Y BAILE',
    skillImageUrl: SKILL_BADGES.dance,
    characterName: 'Carlos',
    imageUrl: '/src/assets/images/level4_energy_carlos_1794843588653.jpg',
    imageAlt: 'Carlos realizando una pausa activa con baile y movimiento junto a su escritorio',
    scenario:
      'Carlos ha pasado gran parte del día realizando trabajos universitarios y asistiendo a clases. Al finalizar la jornada siente cansancio, tensión corporal e irritabilidad. Aunque tiene ganas de despejarse, considera que descansar o realizar alguna actividad recreativa es una pérdida de tiempo porque todavía tiene responsabilidades pendientes.',
    question:
      '¿Qué decisión le permitiría incorporar el movimiento corporal como una estrategia saludable para afrontar el estrés?',
    options: [
      {
        letter: 'A',
        text: 'Realizar una pausa activa, bailar, caminar o practicar alguna actividad física que disfrute, de acuerdo con sus posibilidades.',
      },
      {
        letter: 'B',
        text: 'Continuar trabajando hasta terminar todas sus responsabilidades, dejando la actividad física para cuando tenga tiempo libre.',
      },
      {
        letter: 'C',
        text: 'Mantenerse sentado y distraerse con las redes sociales para olvidarse momentáneamente de sus preocupaciones.',
      },
      {
        letter: 'D',
        text: 'Evitar cualquier actividad física porque considera que el movimiento puede aumentar su cansancio.',
      },
    ],
    correctOption: 'A',
    feedbackCorrect:
      '¡LO LOGRASTE! El movimiento corporal puede ayudar a liberar tensiones, mejorar el estado de ánimo y favorecer el bienestar.',
    feedbackWrong:
      '¡ENERGÍA BAJA! Recuerda que realizar pausas activas y actividades físicas agradables puede formar parte de una rutina saludable.',
    nextButtonLabel: 'ENFRENTAR BOSS FINAL',
    theme: {
      primaryHex: '#FACC15',
      badgeText: 'Pausa Activa y Vitalidad',
      borderClass: 'border-yellow-400/35',
      glowClass: 'shadow-[0_0_35px_rgba(250,204,21,0.18)]',
      buttonBgClass: 'bg-yellow-400 hover:bg-yellow-300 text-slate-950',
      highlightTextClass: 'text-yellow-300',
      meterLabel: 'Energía Vital',
    },
  },
];

export const BOSS_CONTENT = {
  title: 'FINAL BOSS · EL DESAFÍO DE TU VIDA UNIVERSITARIA',
  difficulty: 'EXPERTO',
  controlMessage: '¡AHORA TÚ TIENES EL CONTROL DEL JUEGO!',
  scenario:
    'Imagina que mañana tienes una evaluación importante, debes entregar dos trabajos universitarios y preparar una exposición grupal. Has tenido una semana bastante exigente, sientes cansancio, preocupación y dificultad para concentrarte. Las responsabilidades no van a desaparecer, pero tienes herramientas para afrontarlas.',
  powerUp1Title: 'POWER UP 01 · SELECCIONA TU PRIMERA HERRAMIENTA',
  powerUp1Question: '¿Qué estrategia de la capacitación elegirías para afrontar esta situación?',
  powerUp2Title: 'POWER UP 02 · DESBLOQUEA TU SEGUNDA HERRAMIENTA',
  powerUp2Question: '¿Qué otra estrategia complementarías con la anterior?',
  powerUp3Title: 'POWER UP 03 · ACTIVA TU PLAN',
  powerUp3Question:
    '¿Cómo aplicarías las dos estrategias seleccionadas en tu vida universitaria y qué beneficios esperarías obtener?',
  bonusTitle: 'BONUS ROUND · TU MAYOR PODER',
  bonusQuestion:
    'Si pudieras incorporar permanentemente una de las herramientas aprendidas durante la capacitación a tu rutina universitaria, ¿cuál elegirías y por qué consideras que sería importante para tu bienestar?',
  submitLabel: 'COMPLETAR MISIÓN FINAL',
};
