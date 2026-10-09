// Dossier d'examen Chef de Groupe — forme de l'archive V4, rangée pour
// js/core/records.js (identité dans `c.last/first/grade/mat/date`,
// examinateur dans `ex[0]`, comme les autres modules).
//
// Les questions et les situations sont tirées à la création puis figées
// dans le dossier. Les dossiers d'avant la V4 (tirage `draw`, sans `qs`)
// restent lisibles : ils s'ouvrent sur leur ancienne fiche finale.

import { RECORD_VERSION } from '../../core/lifecycle.js';
import { CONFIG } from '../../config.js';
import { generateQuestions, generateSituations, LEAD_QUESTIONS } from '../../data/cdg-examen.js';

export const FORMAT = 'v4';

export function blankDossier(id, examiner, settings) {
  return {
    id,
    module: 'cdg',
    format: FORMAT,
    version: RECORD_VERSION,
    status: 'draft',
    locked: false,
    created: new Date().toISOString(),
    auditTrail: [],
    c: { last: '', first: '', grade: '', mat: '', date: new Date().toISOString().slice(0, 10), heure: '' },
    ex: [{ grade: '', name: examiner || '' }],
    qs: generateQuestions(),
    ans: Array(10).fill(''),
    lead: LEAD_QUESTIONS.map(() => ''),
    s: generateSituations(),
    marks: { q: Array(10).fill(''), lead: Array(5).fill(''), s1: '', s2: '', radio: '' },
    decision: '',
    reason: '',
    obs: '',
    total: null,
    suggestedDecision: '',
    suggestedReason: '',
    cmd: { ...CONFIG.defaultCommand, ...settings },
    closedAt: null,
    closedBy: null
  };
}

/** Vrai pour un dossier au format de l'archive V4. */
export function isV4(record) {
  return Boolean(record) && Array.isArray(record.qs) && Array.isArray(record.s);
}

/** Complète un dossier V4 relu (brouillon ou clôturé) sans rien perdre. */
export function migrateDossier(record, settings) {
  const base = blankDossier(record.id, '', settings);
  return {
    ...base,
    ...record,
    c: { ...base.c, ...record.c },
    ex: Array.isArray(record.ex) && record.ex.length ? record.ex : base.ex,
    marks: { ...base.marks, ...record.marks },
    cmd: { ...base.cmd, ...record.cmd }
  };
}

/** Nom de l'examinateur tel que l'archive l'affiche. */
export const examinerOf = R => (R.ex && R.ex[0] ? `${R.ex[0].grade || ''} ${R.ex[0].name || ''}`.trim() : '');
