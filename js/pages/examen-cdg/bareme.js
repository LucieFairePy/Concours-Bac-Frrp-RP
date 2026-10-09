// Barème de l'examen Chef de Groupe — calcul de l'archive V4.
//
// Connaissances /200 (10 × 20), commandement /200 (5 × 40), situation 1
// /250, situation 2 /250, radio et compte rendu /100 : total /1000.
// Chaque note suggérée vient des mots-clés retrouvés dans la réponse et de
// sa longueur ; une note saisie par l'examinateur remplace la suggestion.

import * as thresholds from '../../core/thresholds.js';
import { LEAD_QUESTIONS, SITUATION_KEYS, RADIO_KEYS } from '../../data/cdg-examen.js';

/** Mots-clés retrouvés, manquants, et note suggérée sur `max`. */
export function analyze(answer, keys, max) {
  const text = String(answer || '').toLowerCase();
  const hit = keys.filter(key => text.includes(key.toLowerCase()));
  const completeness = Math.min(1, text.trim().length / 180);
  const ratio = keys.length ? hit.length / keys.length : 0;
  const score = Math.round(max * (0.35 * completeness + 0.65 * ratio));
  return { score, hit, miss: keys.filter(key => !hit.includes(key)) };
}

/** Note retenue : celle de l'examinateur, sinon la suggestion, bornée. */
export function mark(value, suggested, max) {
  const n = value === '' || value === undefined || value === null ? suggested : +value;
  return Math.max(0, Math.min(max, Number.isNaN(n) ? 0 : n));
}

export const suggestS1 = R => analyze(R.s[0].ans, SITUATION_KEYS[0], 250);
export const suggestS2 = R => analyze(R.s[1].ans, SITUATION_KEYS[1], 250);
export const suggestRadio = R => analyze(R.s.map(x => x.ans).join(' '), RADIO_KEYS, 100);

export function totals(R) {
  const q = R.qs.reduce((sum, x, i) => sum + mark(R.marks.q[i], analyze(R.ans[i], x.keys, 20).score, 20), 0);
  const l = LEAD_QUESTIONS.reduce((sum, x, i) => sum + mark(R.marks.lead[i], analyze(R.lead[i], x[1], 40).score, 40), 0);
  const s1 = mark(R.marks.s1, suggestS1(R).score, 250);
  const s2 = mark(R.marks.s2, suggestS2(R).score, 250);
  const ra = mark(R.marks.radio, suggestRadio(R).score, 100);
  return { q, l, s1, s2, ra, total: q + l + s1 + s2 + ra };
}

/** Suggestion du système — seuils réglables dans Paramètres (800/650/500). */
export function suggestion(R, bands = thresholds.cdg()) {
  const t = totals(R).total;
  return t >= bands.qualifie ? 'QUALIFIE'
    : t >= bands.reserve ? 'QUALIFIE_RESERVE'
      : t >= bands.ajourne ? 'AJOURNE'
        : 'REFUSE';
}
