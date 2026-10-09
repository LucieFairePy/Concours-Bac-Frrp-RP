// État d'un dossier de formation — cahier des charges §6, §7 et §12.
//
// Une formation produit un dossier au même format que les autres modules :
// identité, examinateur, contenu travaillé, réponses, notes suggérées,
// notes retenues, décision humaine, signatures, clôture définitive. C'est
// ce qui lui permet d'entrer dans l'historique central sans traitement
// particulier.

import { RECORD_VERSION } from './lifecycle.js';
import { CONFIG } from '../config.js';
import { suggest, retained, totalOf, thresholdLevel } from '../scoring/assist.js';

export const DECISIONS = ['ACQUIS', 'ACQUIS_RESERVE', 'A_REVOIR'];

export function blankFormation(id, course, settings) {
  const today = new Date().toISOString().slice(0, 10);
  const command = settings || CONFIG.defaultCommand;

  const record = {
    id,
    course: course.module,
    version: RECORD_VERSION,
    status: 'draft',
    locked: false,
    created: new Date().toISOString(),
    auditTrail: [],
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

  // Tampon du questionnaire servi à ce dossier. Seules les formations dont
  // l'évaluation porte une version en écrivent un : les dossiers des autres
  // formations restent identiques à ce qu'ils étaient.
  const version = course.evaluation && course.evaluation.version;
  if (version) record.evalVersion = version;
  return record;
}

export function migrateFormation(record, course, settings) {
  const base = blankFormation(record.id, course, record.cmd || settings);
  const migrated = {
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
  // Un dossier antérieur au tampon garde son questionnaire d'origine : on ne
  // lui prête pas celui du jour, sinon ses réponses deviendraient orphelines.
  if (record.evalVersion === undefined) delete migrated.evalVersion;
  return migrated;
}

/**
 * Questionnaire d'évaluation d'un dossier. Réponses et notes sont rangées
 * par identifiant de question : un dossier se relit toujours avec le
 * questionnaire sur lequel il a été passé.
 *
 *   - formation sans évaluation versionnée : course.evaluation, comme avant ;
 *   - dossier tamponné à la version courante : course.evaluation ;
 *   - dossier sans tampon : course.evaluationLegacy (ancien questionnaire).
 */
export function evaluationOf(record, course) {
  const current = course.evaluation;
  if (!current.version || !course.evaluationLegacy) return current;
  if (!record || record.evalVersion === current.version) return current;
  return course.evaluationLegacy;
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
  return totalOf(evaluationOf(record, course).questions, record.ans, record.marks);
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
  const unanswered = evaluationOf(record, course).questions
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
