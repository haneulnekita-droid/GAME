import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { PlayerSessionRecord } from '../types/game';

export function formatReadableDate(isoString: string): string {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function resolveDay(rec: PlayerSessionRecord): string {
  if (rec.gameDate) return rec.gameDate;
  if (rec.startedAt) return rec.startedAt.slice(0, 10);
  return '—';
}

function buildSpreadsheetRows(records: PlayerSessionRecord[]) {
  return records.map((rec, idx) => {
    const l1 = rec.answers[1];
    const l2 = rec.answers[2];
    const l3 = rec.answers[3];
    const l4 = rec.answers[4];

    return {
      'N°': idx + 1,
      'Día de la Partida': resolveDay(rec),
      'ID del Player': rec.playerId,
      'Nombre del Participante': rec.playerName || rec.playerId,
      'Cuenta Google': rec.playerEmail || '—',
      'Dispositivo': rec.deviceInfo || 'Web',
      'Fecha y Hora Inicio': formatReadableDate(rec.startedAt),
      'Fecha y Hora Finalización': formatReadableDate(rec.finishedAt),
      'Puntaje XP (sobre 4)': rec.xp,
      'Porcentaje de Aciertos (%)': `${rec.percentage}%`,
      'Nivel 1 - Letra': l1 ? l1.selectedOption : '—',
      'Nivel 1 - Control del Caos (Respuesta)': l1 ? l1.selectedText : 'Sin respuesta',
      'Nivel 1 - Resultado': l1 ? (l1.isCorrect ? 'Correcta (+1 XP)' : 'Incorrecta (0 XP)') : '—',
      'Nivel 2 - Letra': l2 ? l2.selectedOption : '—',
      'Nivel 2 - Modo Respira (Respuesta)': l2 ? l2.selectedText : 'Sin respuesta',
      'Nivel 2 - Resultado': l2 ? (l2.isCorrect ? 'Correcta (+1 XP)' : 'Incorrecta (0 XP)') : '—',
      'Nivel 3 - Letra': l3 ? l3.selectedOption : '—',
      'Nivel 3 - Mente Presente (Respuesta)': l3 ? l3.selectedText : 'Sin respuesta',
      'Nivel 3 - Resultado': l3 ? (l3.isCorrect ? 'Correcta (+1 XP)' : 'Incorrecta (0 XP)') : '—',
      'Nivel 4 - Letra': l4 ? l4.selectedOption : '—',
      'Nivel 4 - Libera tu Energía (Respuesta)': l4 ? l4.selectedText : 'Sin respuesta',
      'Nivel 4 - Resultado': l4 ? (l4.isCorrect ? 'Correcta (+1 XP)' : 'Incorrecta (0 XP)') : '—',
      'Final Boss - Power Up 01 (Estrategia 1)': rec.bossPlan.powerUp1 || '—',
      'Final Boss - Power Up 02 (Estrategia 2)': rec.bossPlan.powerUp2 || '—',
      'Final Boss - Power Up 03 (Plan Escrito)': rec.bossPlan.powerUp3Plan || '—',
      'Final Boss - Bonus Round (Reflexión Escrita)': rec.bossPlan.bonusRoundReflection || '—',
      'Habilidades Desbloqueadas': rec.unlockedSkills.join(', '),
    };
  });
}

function buildBossReflectionsRows(records: PlayerSessionRecord[]) {
  return records.map((rec, idx) => ({
    'N°': idx + 1,
    'Día de la Partida': resolveDay(rec),
    'ID del Player': rec.playerId,
    'Nombre del Participante': rec.playerName || rec.playerId,
    'Dispositivo': rec.deviceInfo || 'Web',
    'Puntaje XP': `${rec.xp} / ${rec.maxXp}`,
    'Power Up 01 (Estrategia 1)': rec.bossPlan.powerUp1 || '—',
    'Power Up 02 (Estrategia 2)': rec.bossPlan.powerUp2 || '—',
    'Power Up 03 (Respuesta Escrita: Plan de Aplicación)': rec.bossPlan.powerUp3Plan || '—',
    'Bonus Round (Respuesta Escrita: Herramienta Permanente y Razón)':
      rec.bossPlan.bonusRoundReflection || '—',
    'Fecha y Hora Finalización': formatReadableDate(rec.finishedAt),
  }));
}

export function exportRecordsToExcel(records: PlayerSessionRecord[], filename?: string) {
  if (records.length === 0) return;

  const summaryRows = buildSpreadsheetRows(records);
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 18 },
    { wch: 26 },
    { wch: 26 },
    { wch: 14 },
    { wch: 22 },
    { wch: 22 },
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

  const bossRows = buildBossReflectionsRows(records);
  const wsBoss = XLSX.utils.json_to_sheet(bossRows);
  wsBoss['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 18 },
    { wch: 26 },
    { wch: 14 },
    { wch: 14 },
    { wch: 28 },
    { wch: 28 },
    { wch: 58 },
    { wch: 58 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Resumen Jugadores');
  XLSX.utils.book_append_sheet(workbook, wsBoss, 'Respuestas Final Boss');

  const safeName =
    filename ||
    `STRESS_OFF_Registros_${new Date().toISOString().slice(0, 10)}.xlsx`;

  XLSX.writeFile(workbook, safeName);
}

export function exportRecordsToCSV(records: PlayerSessionRecord[], filename?: string) {
  if (records.length === 0) return;
  const rows = buildSpreadsheetRows(records);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download =
    filename ||
    `STRESS_OFF_Registros_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportRecordToPDF(record: PlayerSessionRecord) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 16) {
      doc.addPage();
      y = 18;
    }
  };

  doc.setFillColor(15, 18, 37);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(34, 211, 238);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('STRESS OFF: ¡DESBLOQUEA TU BIENESTAR!', margin, 14);

  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Reporte Oficial de Misión Completada y Plan Personal Antiestrés', margin, 22);
  doc.text(
    `Participante: ${record.playerName || record.playerId}  |  ID: ${record.playerId}  |  Día: ${resolveDay(record)}`,
    margin,
    30
  );

  y = 48;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(
    `Puntaje Total: ${record.xp} / ${record.maxXp} XP (${record.percentage}% de aciertos)`,
    margin + 4,
    y + 8
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Fecha de Inicio: ${formatReadableDate(record.startedAt)}`, margin + 4, y + 15);
  doc.text(`Fecha de Finalización: ${formatReadableDate(record.finishedAt)}`, margin + 4, y + 21);

  y += 36;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Habilidades Desbloqueadas', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  record.unlockedSkills.forEach((skill) => {
    doc.text(`• ${skill}`, margin + 3, y);
    y += 5.5;
  });

  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Resumen de Desafíos (Niveles 1 al 4)', margin, y);
  y += 7;

  [1, 2, 3, 4].forEach((lvl) => {
    const ans = record.answers[lvl];
    if (!ans) return;
    ensureSpace(22);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    const statusLabel = ans.isCorrect ? 'ACIERTO (+1 XP)' : 'NO SUMÓ XP';
    doc.text(`Nivel 0${ans.levelId}: ${ans.levelTitle} — [${statusLabel}]`, margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const wrapped = doc.splitTextToSize(
      `Respuesta elegida (${ans.selectedOption}): ${ans.selectedText}`,
      contentWidth - 4
    );
    doc.text(wrapped, margin + 3, y);
    y += wrapped.length * 4.6 + 4;
  });

  ensureSpace(45);
  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Final Boss: Plan Personal Antiestrés', margin, y);
  y += 7;

  const bossItems = [
    { label: 'Power Up 01 (Primera Herramienta):', value: record.bossPlan.powerUp1 },
    { label: 'Power Up 02 (Segunda Herramienta):', value: record.bossPlan.powerUp2 },
    { label: 'Power Up 03 (Plan de Aplicación):', value: record.bossPlan.powerUp3Plan },
    {
      label: 'Bonus Round (Herramienta Permanente y Razón):',
      value: record.bossPlan.bonusRoundReflection,
    },
  ];

  bossItems.forEach((item) => {
    ensureSpace(22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(item.label, margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(item.value || '—', contentWidth - 4);
    doc.text(lines, margin + 3, y);
    y += lines.length * 4.6 + 4;
  });

  ensureSpace(16);
  y += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    '«No todo se puede controlar, pero sí podemos aprender a afrontar lo que nos sucede».',
    margin,
    y
  );

  const safePlayer = (record.playerName || record.playerId).replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`STRESS_OFF_Reporte_${safePlayer}.pdf`);
}
