export type GameScreen =
  | 'START'
  | 'INSTRUCTIONS'
  | 'LEVEL_1'
  | 'LEVEL_2'
  | 'LEVEL_3'
  | 'LEVEL_4'
  | 'BOSS_FINAL'
  | 'GAME_OVER';

export type OptionLetter = 'A' | 'B' | 'C' | 'D';

export type StrategyId =
  | 'Organización del tiempo'
  | 'Respiración consciente'
  | 'Mindfulness o atención plena'
  | 'Movimiento corporal y baile';

export interface LevelOption {
  letter: OptionLetter;
  text: string;
}

export interface LevelAccentTheme {
  primaryHex: string;
  badgeText: string;
  borderClass: string;
  glowClass: string;
  buttonBgClass: string;
  highlightTextClass: string;
  meterLabel: string;
}

export interface LevelDefinition {
  id: 1 | 2 | 3 | 4;
  code: string;
  title: string;
  mission: string;
  skillUnlocked: string;
  skillImageUrl: string;
  characterName: string;
  imageUrl: string;
  imageAlt: string;
  scenario: string;
  question: string;
  options: LevelOption[];
  correctOption: OptionLetter;
  feedbackCorrect: string;
  feedbackWrong: string;
  nextButtonLabel: string;
  theme: LevelAccentTheme;
}

export interface LevelAnswerRecord {
  levelId: 1 | 2 | 3 | 4;
  levelTitle: string;
  selectedOption: OptionLetter;
  selectedText: string;
  isCorrect: boolean;
  skillName: string;
}

export interface BossPlanData {
  powerUp1: StrategyId | '';
  powerUp2: StrategyId | '';
  powerUp3Plan: string;
  bonusRoundReflection: string;
}

export interface PlayerSessionRecord {
  id: string;
  playerId: string;
  playerName?: string;
  startedAt: string;
  finishedAt: string;
  xp: number;
  maxXp: number;
  percentage: number;
  answers: Record<number, LevelAnswerRecord>;
  bossPlan: {
    powerUp1: string;
    powerUp2: string;
    powerUp3Plan: string;
    bonusRoundReflection: string;
  };
  unlockedSkills: string[];
}

export interface ActiveGameState {
  runId: string;
  screen: GameScreen;
  playerId: string;
  playerName: string;
  startedAt: string;
  finishedAt: string | null;
  xp: number;
  answers: Record<number, LevelAnswerRecord>;
  unlockedSkills: string[];
  bossPlan: BossPlanData;
}
