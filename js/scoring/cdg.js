// Notation de l'examen Chef de Groupe — cahier des charges §8 et §10.
//
// Le barème est reconstruit à partir du tirage, section par section, puis
// comparé au barème attendu. Si les deux divergent, la page de correction
// l'affiche au lieu de le taire : un total qui ne tombe pas juste est un
// défaut visible, pas une approximation silencieuse.
//
// Et la règle du §10 vaut ici aussi : le moteur suggère, l'examinateur
// retient. Rien dans ce fichier ne décide.

import { suggest, retained } from './assist.js';
import { SECTIONS } from '../data/cdg-generator.js';
import * as thresholds from '../core/thresholds.js';

export const DECISIONS = ['QUALIFIE', 'QUALIFIE_RESERVE', 'AJOURNE', 'REFUSE'];

/** Toutes les questions du tirage, avec la section où chacune compte. */
export function allQuestions(draw) {
  const out = [];

  for (const question of draw.connaissances) {
    out.push({ ...question, section: 'connaissances' });
  }
  for (const question of draw.commandement) {
    out.push({ ...question, section: 'commandement' });
  }
  for (const situation of draw.situations) {
    for (const question of situation.questions) {
      out.push({
        ...question,
        // Une question radio reste posée dans sa situation mais compte
        // dans la section radio.
        section: question.section || situation.kind,
        situation: situation.id,
        situationTitle: situation.title
      });
    }
  }

  return out;
}

export function questionSuggestion(record, question) {
  return suggest(record.ans[question.id], question.attendu, question.max);
}

export function questionMark(record, question) {
  return retained(record.marks[question.id], questionSuggestion(record, question).note, question.max);
}

/** Total par section, plus le total général et les écarts de barème. */
export function totals(record, draw) {
  const questions = allQuestions(draw);

  const bySection = {};
  for (const section of SECTIONS) {
    bySection[section.id] = { ...section, total: 0, suggested: 0, raw: 0, count: 0 };
  }

  for (const question of questions) {
    const slot = bySection[question.section];
    if (!slot) continue;
    const suggestion = questionSuggestion(record, question);
    slot.total += questionMark(record, question);
    slot.suggested += suggestion.note;
    slot.raw += question.max;
    slot.count += 1;
  }

  const sections = SECTIONS.map(section => {
    const slot = bySection[section.id];
    return {
      ...slot,
      total: Math.round(slot.total),
      suggested: Math.round(slot.suggested),
      // Si le brut d'une section ne correspond pas à son poids au barème,
      // on le signale : c'est un défaut de banque, pas un détail.
      mismatch: slot.raw !== section.max
    };
  });

  const total = sections.reduce((sum, section) => sum + section.total, 0);
  const suggestedTotal = sections.reduce((sum, section) => sum + section.suggested, 0);
  const max = sections.reduce((sum, section) => sum + section.max, 0);
  const raw = sections.reduce((sum, section) => sum + section.raw, 0);

  return {
    sections,
    total: Math.round(total),
    suggestedTotal: Math.round(suggestedTotal),
    max,
    raw,
    mismatch: raw !== max,
    questions
  };
}

/**
 * §10 : recommandation motivée, jamais une décision. L'examinateur peut
 * qualifier malgré un avis négatif et refuser malgré un avis positif.
 */
export function recommendation(record, draw, bands = thresholds.cdg()) {
  const t = totals(record, draw);

  // §11.3 — quatre paliers, rapportés au barème réel du tirage pour que
  // les seuils gardent leur sens même si une section manque.
  const scaled = t.max ? (t.total * 1000) / t.max : 0;
  const level = scaled >= bands.qualifie ? 'haut'
    : scaled >= bands.reserve ? 'moyen'
      : scaled >= bands.ajourne ? 'bas' : 'insuffisant';

  const unanswered = t.questions
    .filter(question => !String(record.ans[question.id] || '').trim()).length;

  // Une épreuve largement non répondue ne peut pas valoir une
  // qualification franche, quel que soit le total.
  const decision = unanswered > t.questions.length / 3
    ? (level === 'haut' || level === 'moyen' ? 'AJOURNE' : 'REFUSE')
    : level === 'haut' ? 'QUALIFIE'
      : level === 'moyen' ? 'QUALIFIE_RESERVE'
        : level === 'bas' ? 'AJOURNE'
          : 'REFUSE';

  const weakest = [...t.sections]
    .filter(section => section.max)
    .sort((a, b) => (a.total / a.max) - (b.total / b.max))[0];

  const reasons = [`${t.total}/${t.max}`];
  if (weakest) {
    reasons.push(`section la plus faible : ${weakest.label} (${weakest.total}/${weakest.max})`);
  }
  if (unanswered) reasons.push(`${unanswered} question(s) sans réponse`);

  return {
    decision,
    recommended: decision === 'QUALIFIE' || decision === 'QUALIFIE_RESERVE',
    reason: reasons.join(' • '),
    total: t.total,
    max: t.max
  };
}

export function markTone(value, max) {
  const ratio = Number(value) / (Number(max) || 1);
  if (ratio >= 0.8) return 'note-verte';
  if (ratio >= 0.65) return 'note-orange';
  return 'note-rouge';
}

export function decisionTone(decision) {
  if (decision === 'QUALIFIE') return 'appreciation-retenu';
  if (decision === 'QUALIFIE_RESERVE') return 'appreciation-reserve';
  if (decision === 'AJOURNE') return 'appreciation-ajourne';
  return 'appreciation-recale';
}
