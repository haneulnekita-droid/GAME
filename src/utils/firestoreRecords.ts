import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { ADMIN_EMAIL, db, handleFirestoreError, OperationType } from '../firebase';
import { LEVELS } from '../data/gameContent';
import { OptionLetter, PlayerSessionRecord } from '../types/game';

const COLLECTION_NAME = 'game_sessions';

function clampText(val: string | undefined, maxLen: number, fallback = '—'): string {
  const cleaned = (val || '').trim();
  if (!cleaned) return fallback;
  return cleaned.slice(0, maxLen);
}

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return cleaned || `run_${Date.now()}`;
}

export function detectDeviceType(): string {
  if (typeof window === 'undefined') return 'Web';
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua) || (window.innerWidth >= 768 && window.innerWidth <= 1024 && 'ontouchstart' in window)) {
    return 'Tablet';
  }
  if (/mobile|iphone|ipod|android/.test(ua) || window.innerWidth < 768) {
    return 'Móvil';
  }
  return 'Computadora';
}

export function getLocalDayString(isoString?: string): string {
  const date = isoString ? new Date(isoString) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isUserAdmin(user: User | null): boolean {
  if (!user || !user.emailVerified) return false;
  return user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

interface FirestoreGameSessionDoc {
  id: string;
  ownerUid: string;
  playerEmail: string;
  playerId: string;
  playerName: string;
  gameDate: string;
  startedAt: string;
  finishedAt: string;
  createdAt?: Timestamp;
  xp: number;
  maxXp: number;
  percentage: number;
  deviceInfo: string;
  level1Option: OptionLetter;
  level1Text: string;
  level1Correct: boolean;
  level2Option: OptionLetter;
  level2Text: string;
  level2Correct: boolean;
  level3Option: OptionLetter;
  level3Text: string;
  level3Correct: boolean;
  level4Option: OptionLetter;
  level4Text: string;
  level4Correct: boolean;
  bossPowerUp1: string;
  bossPowerUp2: string;
  bossPowerUp3Plan: string;
  bossBonusReflection: string;
  unlockedSkills: string[];
}

function mapDocToRecord(data: FirestoreGameSessionDoc): PlayerSessionRecord {
  return {
    id: data.id,
    playerId: data.playerId,
    playerName: data.playerName,
    ownerUid: data.ownerUid,
    playerEmail: data.playerEmail,
    gameDate: data.gameDate,
    deviceInfo: data.deviceInfo,
    syncedToCloud: true,
    startedAt: data.startedAt,
    finishedAt: data.finishedAt,
    xp: data.xp,
    maxXp: data.maxXp,
    percentage: data.percentage,
    answers: {
      1: {
        levelId: 1,
        levelTitle: LEVELS[0].title,
        selectedOption: data.level1Option,
        selectedText: data.level1Text,
        isCorrect: data.level1Correct,
        skillName: LEVELS[0].skillUnlocked,
      },
      2: {
        levelId: 2,
        levelTitle: LEVELS[1].title,
        selectedOption: data.level2Option,
        selectedText: data.level2Text,
        isCorrect: data.level2Correct,
        skillName: LEVELS[1].skillUnlocked,
      },
      3: {
        levelId: 3,
        levelTitle: LEVELS[2].title,
        selectedOption: data.level3Option,
        selectedText: data.level3Text,
        isCorrect: data.level3Correct,
        skillName: LEVELS[2].skillUnlocked,
      },
      4: {
        levelId: 4,
        levelTitle: LEVELS[3].title,
        selectedOption: data.level4Option,
        selectedText: data.level4Text,
        isCorrect: data.level4Correct,
        skillName: LEVELS[3].skillUnlocked,
      },
    },
    bossPlan: {
      powerUp1: data.bossPowerUp1,
      powerUp2: data.bossPowerUp2,
      powerUp3Plan: data.bossPowerUp3Plan,
      bonusRoundReflection: data.bossBonusReflection,
    },
    unlockedSkills: Array.isArray(data.unlockedSkills) ? data.unlockedSkills : [],
  };
}

export async function saveGameSessionToFirestore(
  record: PlayerSessionRecord,
  user: User
): Promise<PlayerSessionRecord> {
  if (!user || !user.emailVerified) {
    throw new Error('Se requiere una cuenta Google verificada para guardar en la nube.');
  }

  const sessionId = sanitizeId(record.id);
  const docPath = `${COLLECTION_NAME}/${sessionId}`;

  const a1 = record.answers[1];
  const a2 = record.answers[2];
  const a3 = record.answers[3];
  const a4 = record.answers[4];

  const gameDate = clampText(record.gameDate || getLocalDayString(record.startedAt), 32);
  const deviceInfo = clampText(record.deviceInfo || detectDeviceType(), 120);

  const payload = {
    id: sessionId,
    ownerUid: sanitizeId(user.uid),
    playerEmail: clampText(user.email || 'verificado', 160),
    playerId: clampText(record.playerId, 64),
    playerName: clampText(record.playerName || record.playerId, 96),
    gameDate,
    startedAt: clampText(record.startedAt, 64),
    finishedAt: clampText(record.finishedAt, 64),
    createdAt: serverTimestamp(),
    xp: Math.max(0, Math.min(4, Math.round(record.xp))),
    maxXp: 4,
    percentage: Math.max(0, Math.min(100, Math.round(record.percentage))),
    deviceInfo,
    level1Option: (a1?.selectedOption || 'A') as OptionLetter,
    level1Text: clampText(a1?.selectedText, 400),
    level1Correct: Boolean(a1?.isCorrect),
    level2Option: (a2?.selectedOption || 'A') as OptionLetter,
    level2Text: clampText(a2?.selectedText, 400),
    level2Correct: Boolean(a2?.isCorrect),
    level3Option: (a3?.selectedOption || 'A') as OptionLetter,
    level3Text: clampText(a3?.selectedText, 400),
    level3Correct: Boolean(a3?.isCorrect),
    level4Option: (a4?.selectedOption || 'A') as OptionLetter,
    level4Text: clampText(a4?.selectedText, 400),
    level4Correct: Boolean(a4?.isCorrect),
    bossPowerUp1: clampText(record.bossPlan.powerUp1, 120),
    bossPowerUp2: clampText(record.bossPlan.powerUp2, 120),
    bossPowerUp3Plan: clampText(record.bossPlan.powerUp3Plan, 4000),
    bossBonusReflection: clampText(record.bossPlan.bonusRoundReflection, 4000),
    unlockedSkills: (record.unlockedSkills || [])
      .slice(0, 4)
      .map((s) => clampText(s, 64)),
  };

  try {
    await setDoc(doc(db, COLLECTION_NAME, sessionId), payload);
    return {
      ...record,
      id: sessionId,
      ownerUid: payload.ownerUid,
      playerEmail: payload.playerEmail,
      gameDate: payload.gameDate,
      deviceInfo: payload.deviceInfo,
      syncedToCloud: true,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export function subscribeGameSessions(
  user: User,
  onRecords: (records: PlayerSessionRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  const admin = isUserAdmin(user);
  const colRef = collection(db, COLLECTION_NAME);

  // Admin queries all players across all devices & days; non-admin queries strictly own documents
  const q = admin
    ? query(colRef, orderBy('createdAt', 'desc'))
    : query(colRef, where('ownerUid', '==', user.uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) =>
        mapDocToRecord(d.data() as FirestoreGameSessionDoc)
      );
      list.sort(
        (a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime()
      );
      onRecords(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export async function deleteGameSessionFromFirestore(sessionId: string): Promise<void> {
  const safeId = sanitizeId(sessionId);
  const docPath = `${COLLECTION_NAME}/${safeId}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
