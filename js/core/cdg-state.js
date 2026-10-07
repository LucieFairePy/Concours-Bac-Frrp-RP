// État d'un dossier d'examen Chef de Groupe — §8 et §11.
//
// Le tirage est stocké dans le dossier, pas seulement sa graine : une fois
// la session créée, les questions et les situations du candidat sont figées
// et le resteront même si la banque de fragments évolue ensuite. La graine
// est conservée à côté pour que le tirage soit vérifiable après coup.

import { RECORD_VERSION } from './lifecycle.js';
import { CONFIG } from '../config.js';
import { drawExam } from '../data/cdg-generator.js';

export function blankExam(id, settings) {
  const today = new Date().toISOString().slice(0, 10);
  const command = settings || CONFIG.defaultCommand;

  return {
    id,
    module: 'cdg',
    version: RECORD_VERSION,
    status: 'draft',
    locked: false,
    created: new Date().toISOString(),
    auditTrail: [],
    c: { last: '', first: '', grade: '', mat: '', date: today, start: '', end: '' },
    ex: [{ grade: command.ag || '', name: command.an || '' }],
    draw: drawExam(),
    ans: {},
    marks: {},
    strength: '',
    improve: '',
    general: '',
    decision: '',
    reason: '',
    total: null,
    suggestedTotal: null,
    suggestedDecision: '',
    suggestedReason: '',
    cmd: { ...command },
    closedAt: null,
    closedBy: null
  };
}

export function migrateExam(record, settings) {
  const base = blankExam(record.id, record.cmd || settings);

  return {
    ...base,
    ...record,
    c: { ...base.c, ...record.c },
    ex: Array.isArray(record.ex) && record.ex.length ? record.ex : base.ex,
    // Un dossier sans tirage ne peut pas être reconstitué à l'identique :
    // on en refait un plutôt que de planter, et la date de tirage le dira.
    draw: record.draw && Array.isArray(record.draw.connaissances) ? record.draw : base.draw,
    ans: record.ans || {},
    marks: record.marks || {},
    cmd: { ...base.cmd, ...record.cmd }
  };
}

export function isEditableExam(record, readOnly) {
  return Boolean(record) && !record.locked && !readOnly;
}

/** Durée écoulée entre l'heure de début et l'heure de fin saisies (§8). */
export function duration(record) {
  const { start, end, date } = record.c;
  if (!start) return null;

  const day = date || new Date().toISOString().slice(0, 10);
  const from = new Date(`${day}T${start}`);
  const to = end ? new Date(`${day}T${end}`) : new Date();
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;

  const minutes = Math.round((to.getTime() - from.getTime()) / 60000);
  if (minutes < 0) return null;

  return {
    minutes,
    label: minutes >= 60 ? `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}` : `${minutes} min`,
    running: !end,
    // §8 : format compact voulu, environ 45 minutes, une heure au maximum.
    overrun: minutes > 60
  };
}
