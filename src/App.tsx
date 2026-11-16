import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LEVELS } from './data/gameContent';
import {
  ActiveGameState,
  BossPlanData,
  GameScreen,
  OptionLetter,
  PlayerSessionRecord,
} from './types/game';
import { arcadeSound } from './utils/sound';
import { ArcadeBackground } from './components/ArcadeBackground';
import { TopHud } from './components/TopHud';
import { StartScreen } from './components/StartScreen';
import { InstructionsScreen } from './components/InstructionsScreen';
import { LevelScreen } from './components/LevelScreen';
import { BossScreen } from './components/BossScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { RecordsModal } from './components/RecordsModal';
import { ConfirmResetModal } from './components/ConfirmResetModal';

const ACTIVE_SESSION_KEY = 'stress_off_active_session_v1';
const SAVED_RECORDS_KEY = 'stress_off_saved_records_v1';

function createInitialGameState(): ActiveGameState {
  return {
    runId: `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    screen: 'START',
    playerId: '',
    playerName: '',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    xp: 0,
    answers: {},
    unlockedSkills: [],
    bossPlan: {
      powerUp1: '',
      powerUp2: '',
      powerUp3Plan: '',
      bonusRoundReflection: '',
    },
  };
}

function loadLocalRecords(): PlayerSessionRecord[] {
  try {
    const raw = localStorage.getItem(SAVED_RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalRecords(records: PlayerSessionRecord[]) {
  try {
    localStorage.setItem(SAVED_RECORDS_KEY, JSON.stringify(records));
  } catch {
    // Ignore quota errors cleanly
  }
}

export default function App() {
  const [gameState, setGameState] = useState<ActiveGameState>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ActiveGameState;
        if (parsed && parsed.screen) {
          return {
            ...createInitialGameState(),
            ...parsed,
            playerName: parsed.playerName || '',
          };
        }
      }
    } catch {
      // Fallback to fresh session
    }
    return createInitialGameState();
  });

  const [records, setRecords] = useState<PlayerSessionRecord[]>(() => loadLocalRecords());
  const [storageMode, setStorageMode] = useState<'server' | 'local'>('local');
  const [isMuted, setIsMuted] = useState(false);
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);
  const [isRefreshingRecords, setIsRefreshingRecords] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Sync active in-progress session to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(gameState));
    } catch {
      // Ignore storage error
    }
  }, [gameState]);

  // Reusable function to sync all records from the server database and merge unsynced local items
  const syncRecordsFromServer = useCallback(async () => {
    setIsRefreshingRecords(true);
    try {
      const res = await fetch('/api/records');
      if (!res.ok) throw new Error('Server unavailable');
      const data = (await res.json()) as { records?: PlayerSessionRecord[] };
      setStorageMode('server');

      if (Array.isArray(data.records)) {
        const serverMap = new Map<string, PlayerSessionRecord>();
        data.records.forEach((r) => serverMap.set(r.id, r));

        // Upload any local-only records that haven't reached the server yet
        const localUnsynced = loadLocalRecords().filter((r) => !serverMap.has(r.id));
        for (const localRec of localUnsynced) {
          serverMap.set(localRec.id, localRec);
          try {
            await fetch('/api/records', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(localRec),
            });
          } catch {
            // Will retry on next sync
          }
        }

        const merged = Array.from(serverMap.values()).sort(
          (a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime()
        );
        setRecords(merged);
        saveLocalRecords(merged);
      }
    } catch {
      setStorageMode('local');
    } finally {
      setIsRefreshingRecords(false);
    }
  }, []);

  // Fetch on initial mount
  useEffect(() => {
    syncRecordsFromServer();
  }, [syncRecordsFromServer]);

  const handleOpenRecords = useCallback(() => {
    arcadeSound.playClick();
    setIsRecordsOpen(true);
    syncRecordsFromServer();
  }, [syncRecordsFromServer]);

  const progressPercent = useMemo(() => {
    if (gameState.screen === 'GAME_OVER') return 100;
    const answeredCount = Object.keys(gameState.answers).length;
    return Math.min(80, answeredCount * 20);
  }, [gameState.screen, gameState.answers]);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    arcadeSound.setMuted(next);
    if (!next) arcadeSound.playClick();
  };

  const handleStartGame = (playerId: string, playerName: string) => {
    arcadeSound.playTransition();
    setGameState({
      ...createInitialGameState(),
      playerId,
      playerName,
      startedAt: new Date().toISOString(),
      screen: 'INSTRUCTIONS',
    });
  };

  const handleBeginAdventure = () => {
    arcadeSound.playTransition();
    setGameState((prev) => ({
      ...prev,
      screen: 'LEVEL_1',
    }));
  };

  const handleSelectAnswer = useCallback((levelId: 1 | 2 | 3 | 4, letter: OptionLetter) => {
    setGameState((prev) => {
      if (prev.answers[levelId]) return prev;

      const levelDef = LEVELS.find((l) => l.id === levelId);
      if (!levelDef) return prev;

      const chosen = levelDef.options.find((o) => o.letter === letter);
      if (!chosen) return prev;

      const isCorrect = letter === levelDef.correctOption;
      if (isCorrect) {
        arcadeSound.playCorrect();
      } else {
        arcadeSound.playWrong();
      }

      const nextSkills = prev.unlockedSkills.includes(levelDef.skillUnlocked)
        ? prev.unlockedSkills
        : [...prev.unlockedSkills, levelDef.skillUnlocked];

      return {
        ...prev,
        xp: isCorrect ? prev.xp + 1 : prev.xp,
        unlockedSkills: nextSkills,
        answers: {
          ...prev.answers,
          [levelId]: {
            levelId,
            levelTitle: levelDef.title,
            selectedOption: letter,
            selectedText: chosen.text,
            isCorrect,
            skillName: levelDef.skillUnlocked,
          },
        },
      };
    });
  }, []);

  const handleNextFromLevel = (currentLevelId: 1 | 2 | 3 | 4) => {
    const nextMap: Record<number, GameScreen> = {
      1: 'LEVEL_2',
      2: 'LEVEL_3',
      3: 'LEVEL_4',
      4: 'BOSS_FINAL',
    };
    const target = nextMap[currentLevelId];
    if (target === 'BOSS_FINAL') {
      arcadeSound.playBossEnter();
    } else {
      arcadeSound.playTransition();
    }
    setGameState((prev) => ({ ...prev, screen: target }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteBoss = async (bossPlan: BossPlanData) => {
    arcadeSound.playVictory();
    const finishedAt = new Date().toISOString();
    const percentage = Math.round((gameState.xp / 4) * 100);

    const completedRecord: PlayerSessionRecord = {
      id: gameState.runId,
      playerId: gameState.playerId,
      playerName: gameState.playerName || gameState.playerId,
      startedAt: gameState.startedAt,
      finishedAt,
      xp: gameState.xp,
      maxXp: 4,
      percentage,
      answers: gameState.answers,
      bossPlan: {
        powerUp1: bossPlan.powerUp1,
        powerUp2: bossPlan.powerUp2,
        powerUp3Plan: bossPlan.powerUp3Plan,
        bonusRoundReflection: bossPlan.bonusRoundReflection,
      },
      unlockedSkills: gameState.unlockedSkills,
    };

    // Save locally immediately so zero data is ever lost
    setRecords((prev) => {
      const exists = prev.some((r) => r.id === completedRecord.id);
      const updated = exists
        ? prev.map((r) => (r.id === completedRecord.id ? completedRecord : r))
        : [completedRecord, ...prev];
      saveLocalRecords(updated);
      return updated;
    });

    // Save to Express server DB (with 1 automatic retry) and then sync full list
    let savedToServer = false;
    for (let attempt = 0; attempt < 2 && !savedToServer; attempt++) {
      try {
        const res = await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(completedRecord),
        });
        if (res.ok) {
          savedToServer = true;
          setStorageMode('server');
        }
      } catch {
        // Retry once
      }
    }

    if (savedToServer) {
      await syncRecordsFromServer();
    } else {
      setStorageMode('local');
    }

    setGameState((prev) => ({
      ...prev,
      finishedAt,
      bossPlan,
      screen: 'GAME_OVER',
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToHome = () => {
    arcadeSound.playClick();
    setGameState(createInitialGameState());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmReset = () => {
    arcadeSound.playClick();
    setIsResetModalOpen(false);
    setGameState(createInitialGameState());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRecord = async (id: string) => {
    setRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveLocalRecords(updated);
      return updated;
    });
    try {
      await fetch(`/api/records/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch {
      // Handled locally
    }
  };

  const activeLevelDef = useMemo(() => {
    if (gameState.screen === 'LEVEL_1') return LEVELS[0];
    if (gameState.screen === 'LEVEL_2') return LEVELS[1];
    if (gameState.screen === 'LEVEL_3') return LEVELS[2];
    if (gameState.screen === 'LEVEL_4') return LEVELS[3];
    return null;
  }, [gameState.screen]);

  const completedSessionRecord: PlayerSessionRecord = useMemo(
    () => ({
      id: gameState.runId,
      playerId: gameState.playerId,
      playerName: gameState.playerName || gameState.playerId,
      startedAt: gameState.startedAt,
      finishedAt: gameState.finishedAt || new Date().toISOString(),
      xp: gameState.xp,
      maxXp: 4,
      percentage: Math.round((gameState.xp / 4) * 100),
      answers: gameState.answers,
      bossPlan: {
        powerUp1: gameState.bossPlan.powerUp1,
        powerUp2: gameState.bossPlan.powerUp2,
        powerUp3Plan: gameState.bossPlan.powerUp3Plan,
        bonusRoundReflection: gameState.bossPlan.bonusRoundReflection,
      },
      unlockedSkills: gameState.unlockedSkills,
    }),
    [gameState]
  );

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col">
      <ArcadeBackground screen={gameState.screen} />

      <TopHud
        screen={gameState.screen}
        playerId={gameState.playerName || gameState.playerId}
        xp={gameState.xp}
        unlockedSkills={gameState.unlockedSkills}
        progressPercent={progressPercent}
        isMuted={isMuted}
        savedCount={records.length}
        onToggleMute={handleToggleMute}
        onOpenRecords={handleOpenRecords}
        onRequestReset={() => {
          arcadeSound.playClick();
          setIsResetModalOpen(true);
        }}
      />

      <main className="relative z-10 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={gameState.screen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {gameState.screen === 'START' && (
              <StartScreen
                initialPlayerId={gameState.playerId}
                initialPlayerName={gameState.playerName}
                startDateIso={gameState.startedAt}
                savedCount={records.length}
                onStartGame={handleStartGame}
                onOpenRecords={handleOpenRecords}
              />
            )}

            {gameState.screen === 'INSTRUCTIONS' && (
              <InstructionsScreen
                playerId={`${gameState.playerName} (${gameState.playerId})`}
                onBeginAdventure={handleBeginAdventure}
              />
            )}

            {activeLevelDef && (
              <LevelScreen
                level={activeLevelDef}
                existingAnswer={gameState.answers[activeLevelDef.id]}
                onSelectAnswer={(letter) => handleSelectAnswer(activeLevelDef.id, letter)}
                onNextLevel={() => handleNextFromLevel(activeLevelDef.id)}
              />
            )}

            {gameState.screen === 'BOSS_FINAL' && (
              <BossScreen
                initialPlan={gameState.bossPlan}
                onCompleteBoss={handleCompleteBoss}
              />
            )}

            {gameState.screen === 'GAME_OVER' && (
              <GameOverScreen
                record={completedSessionRecord}
                allRecords={records}
                storageMode={storageMode}
                onBackToHome={handleReturnToHome}
                onOpenRecords={handleOpenRecords}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <RecordsModal
        isOpen={isRecordsOpen}
        records={records}
        storageMode={storageMode}
        isRefreshing={isRefreshingRecords}
        onRefresh={syncRecordsFromServer}
        onClose={() => setIsRecordsOpen(false)}
        onDeleteRecord={handleDeleteRecord}
      />

      <ConfirmResetModal
        isOpen={isResetModalOpen}
        onCancel={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}
