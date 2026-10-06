// État d'un dossier de formation — cahier des charges §6, §7 et §12.
//
// Une formation produit un dossier au même format que les autres modules :
// identité, examinateur, contenu travaillé, réponses, notes suggérées,
// notes retenues, décision humaine, signatures, clôture définitive. C'est
// ce qui lui permet d'entrer dans l'historique central sans traitement
// particulier.

import { CONFIG } from '../config.js';
import { suggest, retained, totalOf, thresholdLevel } from '../scoring/assist.js';

export const DECISIONS = ['ACQUIS', 'ACQUIS_RESERVE', 'A_REVOIR'];

export function blankFormation(id, course, settings) {
  const today = new Date().toISOString().slice(0, 10);
  const command = settings || CONFIG.defaultCommand;

  return {
    id,
    course: course.module,
    locked: false,
    created: new Date().toISOString(),
    c: { last: '', first: '', grade: '', mat: '', date: today, start: '' },
    ex: [{ grade: command.ag || '', name: command.an || '' }],
    read: {},
    work: {},
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
    cmd: { ...command },
    closedAt: null,
    closedBy: null
  };
}

export function migrateFormation(record, course, settings) {
  const base = blankFormation(record.id, course, record.cmd || settings);
  return {
    ...base,
    ...record,
    c: { ...base.c, ...record.c },
    ex: Array.isArray(record.ex) && record.ex.length ? record.ex : base.ex,
    read: record.read || {},
    work: record.work || {},
    ans: record.ans || {},
    marks: record.marks || {},
    cmd: { ...base.cmd, ...record.cmd }
  };
}

export function readCount(record, course) {
  return course.chapters.filter(chapter => record.read[chapter.id]).length;
}

export function readRatio(record, course) {
  if (!course.chapters.length) return 0;
  return readCount(record, course) / course.chapters.length;
}

export function questionSuggestion(record, question) {
  return suggest(record.ans[question.id], question.attendu, question.max);
}

export function questionMark(record, question) {
  return retained(record.marks[question.id], questionSuggestion(record, question).note, question.max);
}

export function formationTotals(record, course) {
  return totalOf(course.evaluation.questions, record.ans, record.marks);
}

/**
 * §10 : le moteur propose, l'examinateur décide. Cette fonction ne renvoie
 * jamais la décision du dossier, seulement une recommandation motivée.
 */
export function suggestedDecision(record, course) {
  const { total, max } = formationTotals(record, course);
  const level = thresholdLevel(total, max);
  const ratio = readRatio(record, course);

  // Un cours non parcouru ne peut pas déboucher sur un « acquis » franc :
  // la formation n'a pas été suivie.
  if (ratio < 0.8 && level === 'haut') return 'ACQUIS_RESERVE';
  if (level === 'haut') return 'ACQUIS';
  if (level === 'moyen') return 'ACQUIS_RESERVE';
  return 'A_REVOIR';
}

export function decisionReason(record, course) {
  const { total, max } = formationTotals(record, course);
  const read = readCount(record, course);
  const chapters = course.chapters.length;
  const unanswered = course.evaluation.questions
    .filter(question => !String(record.ans[question.id] || '').trim()).length;

  const parts = [
    `${total}/${max} à l’évaluation`,
    `${read}/${chapters} chapitre(s) parcouru(s)`
  ];
  if (unanswered) parts.push(`${unanswered} question(s) sans réponse`);
  return parts.join(' • ');
}

export function isEditableFormation(record, readOnly) {
  return Boolean(record) && !record.locked && !readOnly;
}
