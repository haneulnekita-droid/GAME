import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { AnimatePresence, motion } from 'motion/react';
import { auth, googleProvider } from './firebase';
import { LEVELS } from './data/gameContent';
import {
  ActiveGameState,
  BossPlanData,
  GameScreen,
  OptionLetter,
  PlayerSessionRecord,
} from './types/game';
import { arcadeSound } from './utils/sound';
import {
  deleteGameSessionFromFirestore,
  detectDeviceType,
  getLocalDayString,
  isUserAdmin,
  saveGameSessionToFirestore,
  subscribeGameSessions,
} from './utils/firestoreRecords';
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
    // Ignore storage quota errors
  }
}

function mergeRecordLists(
  cloudRecords: PlayerSessionRecord[],
  localRecords: PlayerSessionRecord[]
): PlayerSessionRecord[] {
  const map = new Map<string, PlayerSessionRecord>();
  localRecords.forEach((r) => map.set(r.id, r));
  cloudRecords.forEach((r) => map.set(r.id, { ...r, syncedToCloud: true }));
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime()
  );
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

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBannerError, setAuthBannerError] = useState('');

  const [cloudRecords, setCloudRecords] = useState<PlayerSessionRecord[]>([]);
  const [localRecords, setLocalRecords] = useState<PlayerSessionRecord[]>(() =>
    loadLocalRecords()
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);
  const [isRefreshingRecords, setIsRefreshingRecords] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const isAdmin = useMemo(() => isUserAdmin(authUser), [authUser]);

  // Combine cloud records with any unsynced local records
  const records = useMemo(
    () => mergeRecordLists(cloudRecords, localRecords),
    [cloudRecords, localRecords]
  );

  // Sync active in-progress session to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(gameState));
    } catch {
      // Ignore storage error
    }
  }, [gameState]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Upload any unsynced local records once the user signs in with a verified Google account
  const flushLocalUnsyncedToCloud = useCallback(async (user: User) => {
    if (!user.emailVerified) return;
    const pending = loadLocalRecords().filter((r) => !r.syncedToCloud);
    if (pending.length === 0) return;

    const updatedLocal = [...loadLocalRecords()];
    for (const item of pending) {
      try {
        const saved = await saveGameSessionToFirestore(item, user);
        const idx = updatedLocal.findIndex((r) => r.id === item.id);
        if (idx >= 0) {
          updatedLocal[idx] = saved;
        }
      } catch {
        // Keep unsynced for retry
      }
    }
    saveLocalRecords(updatedLocal);
    setLocalRecords(updatedLocal);
  }, []);

  // Attach Firestore real-time subscription ONLY when auth is ready and user is authenticated
  useEffect(() => {
    if (!authReady || !authUser || !authUser.emailVerified) {
      setCloudRecords([]);
      return;
    }

    flushLocalUnsyncedToCloud(authUser);

    const unsub = subscribeGameSessions(
      authUser,
      (items) => {
        setCloudRecords(items);
        setIsRefreshingRecords(false);
      },
      (err) => {
        setIsRefreshingRecords(false);
        setAuthBannerError(err.message);
      }
    );

    return () => unsub();
  }, [authReady, authUser, flushLocalUnsyncedToCloud]);

  // Also load/merge from Express fallback if local records exist
  useEffect(() => {
    fetch('/api/records')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { records?: PlayerSessionRecord[] } | null) => {
        if (data && Array.isArray(data.records) && data.records.length > 0) {
          setLocalRecords((prev) => {
            const merged = mergeRecordLists(prev, data.records || []);
            saveLocalRecords(merged);
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSignInGoogle = useCallback(async () => {
    arcadeSound.playClick();
    setAuthBannerError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await flushLocalUnsyncedToCloud(result.user);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo iniciar sesión con Google.';
      if (!message.includes('popup-closed-by-user')) {
        setAuthBannerError('No se pudo conectar con Google. Revisa si el navegador bloqueó la ventana emergente.');
      }
    }
  }, [flushLocalUnsyncedToCloud]);

  const handleSignOut = useCallback(async () => {
    arcadeSound.playClick();
    await signOut(auth);
  }, []);

  const handleRefreshRecords = useCallback(async () => {
    setIsRefreshingRecords(true);
    if (authUser) {
      await flushLocalUnsyncedToCloud(authUser);
    }
    setTimeout(() => setIsRefreshingRecords(false), 350);
  }, [authUser, flushLocalUnsyncedToCloud]);

  const handleOpenRecords = useCallback(() => {
    arcadeSound.playClick();
    setIsRecordsOpen(true);
    handleRefreshRecords();
  }, [handleRefreshRecords]);

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
    const gameDate = getLocalDayString(gameState.startedAt);
    const deviceInfo = detectDeviceType();

    let completedRecord: PlayerSessionRecord = {
      id: gameState.runId,
      playerId: gameState.playerId,
      playerName: gameState.playerName || gameState.playerId,
      gameDate,
      deviceInfo,
      syncedToCloud: false,
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

    // Persist to Firestore permanently if signed in with verified Google account
    if (authUser && authUser.emailVerified) {
      try {
        completedRecord = await saveGameSessionToFirestore(completedRecord, authUser);
      } catch (err) {
        setAuthBannerError(
          err instanceof Error ? err.message : 'Error al guardar en la nube.'
        );
      }
    }

    // Save local backup immediately
    setLocalRecords((prev) => {
      const updated = [completedRecord, ...prev.filter((r) => r.id !== completedRecord.id)];
      saveLocalRecords(updated);
      return updated;
    });

    // Also save to Express JSON endpoint as secondary backup
    fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completedRecord),
    }).catch(() => {});

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
    if (authUser && isAdmin) {
      try {
        await deleteGameSessionFromFirestore(id);
      } catch {
        // Handled below
      }
    }
    setCloudRecords((prev) => prev.filter((r) => r.id !== id));
    setLocalRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveLocalRecords(updated);
      return updated;
    });
    fetch(`/api/records/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  };

  const activeLevelDef = useMemo(() => {
    if (gameState.screen === 'LEVEL_1') return LEVELS[0];
    if (gameState.screen === 'LEVEL_2') return LEVELS[1];
    if (gameState.screen === 'LEVEL_3') return LEVELS[2];
    if (gameState.screen === 'LEVEL_4') return LEVELS[3];
    return null;
  }, [gameState.screen]);

  const completedSessionRecord: PlayerSessionRecord = useMemo(() => {
    const existing = records.find((r) => r.id === gameState.runId);
    if (existing) return existing;
    return {
      id: gameState.runId,
      playerId: gameState.playerId,
      playerName: gameState.playerName || gameState.playerId,
      gameDate: getLocalDayString(gameState.startedAt),
      deviceInfo: detectDeviceType(),
      syncedToCloud: false,
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
    };
  }, [gameState, records]);

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
        authUser={authUser}
        isAdmin={isAdmin}
        onSignInGoogle={handleSignInGoogle}
        onSignOut={handleSignOut}
        onToggleMute={handleToggleMute}
        onOpenRecords={handleOpenRecords}
        onRequestReset={() => {
          arcadeSound.playClick();
          setIsResetModalOpen(true);
        }}
      />

      {authBannerError && (
        <div className="relative z-20 mx-auto mt-3 max-w-4xl px-4">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-950/50 px-4 py-2.5 text-xs text-amber-100">
            <span>{authBannerError}</span>
            <button
              type="button"
              onClick={() => setAuthBannerError('')}
              className="font-bold text-amber-300 hover:text-white cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

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
                authUser={authUser}
                isAdmin={isAdmin}
                onSignInGoogle={handleSignInGoogle}
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
                authUser={authUser}
                onSyncNowWithGoogle={handleSignInGoogle}
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
        authUser={authUser}
        isAdmin={isAdmin}
        isRefreshing={isRefreshingRecords}
        onSignInGoogle={handleSignInGoogle}
        onRefresh={handleRefreshRecords}
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
