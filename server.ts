import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');

interface StoredAnswer {
  levelId: number;
  levelTitle: string;
  selectedOption: 'A' | 'B' | 'C' | 'D';
  selectedText: string;
  isCorrect: boolean;
  skillName: string;
}

interface StoredRecord {
  id: string;
  playerId: string;
  playerName?: string;
  startedAt: string;
  finishedAt: string;
  xp: number;
  maxXp: number;
  percentage: number;
  answers: Record<string, StoredAnswer>;
  bossPlan: {
    powerUp1: string;
    powerUp2: string;
    powerUp3Plan: string;
    bonusRoundReflection: string;
  };
  unlockedSkills: string[];
}

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(RECORDS_FILE)) {
    fs.writeFileSync(RECORDS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readRecords(): StoredRecord[] {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(RECORDS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecordsAtomic(records: StoredRecord[]) {
  ensureDataFile();
  const tmpFile = `${RECORDS_FILE}.tmp.${process.pid}.${Date.now()}`;
  fs.writeFileSync(tmpFile, JSON.stringify(records, null, 2), 'utf-8');
  fs.renameSync(tmpFile, RECORDS_FILE);
}

// Serialized promise queue to guarantee safe concurrent writes across many players
let writeChain: Promise<void> = Promise.resolve();
function enqueueMutation<T>(fn: () => T): Promise<T> {
  const result = writeChain.then(() => fn());
  writeChain = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

function formatServerDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildServerWorkbook(records: StoredRecord[]) {
  const summaryRows = records.map((rec, idx) => {
    const l1 = rec.answers?.['1'];
    const l2 = rec.answers?.['2'];
    const l3 = rec.answers?.['3'];
    const l4 = rec.answers?.['4'];

    return {
      'N°': idx + 1,
      'ID del Player': rec.playerId,
      'Nombre del Participante': rec.playerName || rec.playerId,
      'Fecha de Inicio': formatServerDate(rec.startedAt),
      'Fecha de Finalización': formatServerDate(rec.finishedAt),
      'Puntaje XP (sobre 4)': rec.xp,
      'Porcentaje de Aciertos (%)': `${rec.percentage}%`,
      'Nivel 1 - Letra': l1 ? l1.selectedOption : '—',
      'Nivel 1 - Respuesta': l1 ? l1.selectedText : 'Sin respuesta',
      'Nivel 1 - Acierto': l1 ? (l1.isCorrect ? 'Correcta (+1 XP)' : 'Incorrecta (0 XP)') : '—',
      'Nivel 2 - Letra': l2 ? l2.selectedOption : '—',
      'Nivel 2 - Respuesta': l2 ? l2.selectedText : 'Sin respuesta',
      'Nivel 2 - Acierto': l2 ? (l2.isCorrect ? 'Correcta (+1 XP)' : 'Incorrecta (0 XP)') : '—',
      'Nivel 3 - Letra': l3 ? l3.selectedOption : '—',
      'Nivel 3 - Respuesta': l3 ? l3.selectedText : 'Sin respuesta',
      'Nivel 3 - Acierto': l3 ? (l3.isCorrect ? 'Correcta (+1 XP)' : 'Incorrecta (0 XP)') : '—',
      'Nivel 4 - Letra': l4 ? l4.selectedOption : '—',
      'Nivel 4 - Respuesta': l4 ? l4.selectedText : 'Sin respuesta',
      'Nivel 4 - Acierto': l4 ? (l4.isCorrect ? 'Correcta (+1 XP)' : 'Incorrecta (0 XP)') : '—',
      'Final Boss - Power Up 01 (Estrategia 1)': rec.bossPlan?.powerUp1 || '—',
      'Final Boss - Power Up 02 (Estrategia 2)': rec.bossPlan?.powerUp2 || '—',
      'Final Boss - Power Up 03 (Plan Escrito)': rec.bossPlan?.powerUp3Plan || '—',
      'Final Boss - Bonus Round (Reflexión Escrita)': rec.bossPlan?.bonusRoundReflection || '—',
      'Habilidades Desbloqueadas': (rec.unlockedSkills || []).join(', '),
    };
  });

  const bossRows = records.map((rec, idx) => ({
    'N°': idx + 1,
    'ID del Player': rec.playerId,
    'Nombre del Participante': rec.playerName || rec.playerId,
    'Puntaje XP': `${rec.xp} / ${rec.maxXp}`,
    'Power Up 01 (Herramienta 1)': rec.bossPlan?.powerUp1 || '—',
    'Power Up 02 (Herramienta 2)': rec.bossPlan?.powerUp2 || '—',
    'Power Up 03 (Respuesta Escrita: Plan de Aplicación)': rec.bossPlan?.powerUp3Plan || '—',
    'Bonus Round (Respuesta Escrita: Herramienta Permanente y Razón)':
      rec.bossPlan?.bonusRoundReflection || '—',
    'Fecha de Finalización': formatServerDate(rec.finishedAt),
  }));

  const wb = XLSX.utils.book_new();
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 26 },
    { wch: 20 },
    { wch: 20 },
    { wch: 18 },
    { wch: 22 },
    { wch: 12 },
    { wch: 38 },
    { wch: 18 },
    { wch: 12 },
    { wch: 38 },
    { wch: 18 },
    { wch: 12 },
    { wch: 38 },
    { wch: 18 },
    { wch: 12 },
    { wch: 38 },
    { wch: 18 },
    { wch: 28 },
    { wch: 28 },
    { wch: 52 },
    { wch: 52 },
    { wch: 44 },
  ];

  const wsBoss = XLSX.utils.json_to_sheet(bossRows);
  wsBoss['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 26 },
    { wch: 14 },
    { wch: 28 },
    { wch: 28 },
    { wch: 58 },
    { wch: 58 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Jugadores');
  XLSX.utils.book_append_sheet(wb, wsBoss, 'Respuestas Final Boss');
  return wb;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, storage: 'server-json', count: readRecords().length });
  });

  app.get('/api/records', (_req, res) => {
    const records = readRecords().sort(
      (a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime()
    );
    res.json({ records });
  });

  app.post('/api/records', async (req, res) => {
    const record = req.body as StoredRecord;
    if (!record || !record.id || !record.playerId) {
      res.status(400).json({ error: 'Datos del jugador incompletos.' });
      return;
    }

    const savedRecord = await enqueueMutation(() => {
      const records = readRecords();
      const existingIndex = records.findIndex((r) => r.id === record.id);
      if (existingIndex >= 0) {
        records[existingIndex] = record;
      } else {
        records.unshift(record);
      }
      writeRecordsAtomic(records);
      return record;
    });

    res.status(201).json({ saved: true, record: savedRecord });
  });

  app.delete('/api/records/:id', async (req, res) => {
    const { id } = req.params;
    const remaining = await enqueueMutation(() => {
      const records = readRecords();
      const filtered = records.filter((r) => r.id !== id);
      writeRecordsAtomic(filtered);
      return filtered.length;
    });
    res.json({ deleted: true, remaining });
  });

  app.get('/api/records/export/xlsx', (_req, res) => {
    const records = readRecords().sort(
      (a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime()
    );
    const wb = buildServerWorkbook(records);
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    const filename = `STRESS_OFF_Registros_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buf);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`STRESS OFF server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
