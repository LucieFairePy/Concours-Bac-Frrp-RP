// Correction assistée — cahier des charges §10.
//
// RÈGLE ABSOLUE, tenue par tout ce fichier : le site aide à noter, il ne
// note pas à la place de l'examinateur. Rien ici ne produit une décision.
// Chaque fonction renvoie une suggestion accompagnée de ce qui la motive —
// éléments retrouvés, éléments manquants — pour que l'examinateur puisse la
// contredire en connaissance de cause.
//
// La suggestion repose sur deux choses mesurables : la présence des
// éléments attendus dans la réponse, et sa consistance. Elle ne comprend
// pas le sens d'une phrase, et c'est précisément pourquoi elle reste une
// suggestion.

const STOP = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'que', 'qui',
  'quoi', 'dans', 'pour', 'par', 'sur', 'avec', 'sans', 'ce', 'cet', 'cette',
  'ses', 'son', 'sa', 'est', 'sont', 'il', 'elle', 'on', 'au', 'aux', 'en',
  'ne', 'pas', 'plus', 'tout', 'tous', 'toute', 'toutes', 'faire', 'fait',
  'avoir', 'etre', 'etc', 'donc', 'mais', 'leur', 'lui', 'nous', 'vous', 'pres'
]);

export function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(value) {
  return normalizeText(value)
    .split(' ')
    .filter(word => word.length > 3 && !STOP.has(word));
}

export function wordCount(value) {
  const text = String(value || '').trim();
  return text ? text.split(/\s+/).length : 0;
}

// « reformule » et « reformuler » sont le même mot pour un correcteur
// humain. On compare donc sur le radical : les trois dernières lettres
// d'un mot sont le plus souvent sa terminaison.
function stem(word) {
  return word.slice(0, Math.max(4, word.length - 3));
}

function sameWord(a, b) {
  return a === b || a.startsWith(stem(b)) || b.startsWith(stem(a));
}

/**
 * Un élément attendu est considéré retrouvé quand la moitié au moins de ses
 * mots porteurs apparaissent dans la réponse. Un élément d'un seul mot
 * porteur demande ce mot.
 */
export function hits(answer, expected) {
  const found = tokens(answer);
  const need = tokens(expected);
  if (!need.length || !found.length) return false;
  const matched = need.filter(word => found.some(candidate => sameWord(candidate, word))).length;
  return matched / need.length >= 0.5;
}

/**
 * Suggestion pour une réponse ouverte adossée à des éléments attendus.
 * Renvoie la note suggérée, les éléments retrouvés et ceux qui manquent —
 * c'est cet ensemble que la page de correction affiche.
 */
/** §11.2 — les deux poids de la suggestion, et rien d'autre. */
export const WEIGHTS = { completeness: 0.35, criteria: 0.65 };

/**
 * Longueur à partir de laquelle une réponse est tenue pour complète :
 * une demi-douzaine de mots par élément attendu — de quoi formuler
 * chacun d'eux en une proposition. Bornée pour qu'une question à un seul
 * attendu ne se contente pas de trois mots, et qu'une question à dix
 * attendus ne réclame pas une dissertation.
 */
export function completeAt(count) {
  if (!count) return 45;
  return Math.max(15, Math.min(50, count * 6));
}

/**
 * Complétude d'une réponse — la part « a-t-on répondu, et jusqu'où ».
 * Au-delà de la cible, écrire plus ne rapporte plus rien.
 */
export function completeness(answer, count) {
  return Math.min(1, wordCount(answer) / completeAt(count));
}

/**
 * Suggestion pour une réponse ouverte adossée à des éléments attendus.
 *
 * §11.2 — la formule est volontairement simple et explicable :
 *
 *     note = max × (0,35 × complétude + 0,65 × critères retrouvés)
 *
 * Elle renvoie aussi les éléments retrouvés et ceux qui manquent : c'est
 * ce que la page de correction affiche, pour que l'examinateur comprenne
 * d'où vient la note avant de la contredire.
 */
export function suggest(answer, expected, max) {
  const list = Array.isArray(expected) ? expected : [];
  const words = wordCount(answer);

  if (!words) {
    return {
      note: 0,
      max,
      found: [],
      missing: list,
      words,
      completeness: 0,
      criteriaRatio: 0,
      reason: 'aucune réponse'
    };
  }

  const full = completeness(answer, list.length);

  if (!list.length) {
    // Pas d'éléments attendus déclarés : la part « critères » n'a rien à
    // mesurer. On ne juge alors que la consistance, et on le dit, pour que
    // l'examinateur ne s'y fie pas.
    const note = Math.min(max, Math.round(max * Math.min(1, 0.35 + words / 70)));
    return {
      note,
      max,
      found: [],
      missing: [],
      words,
      completeness: full,
      criteriaRatio: null,
      reason: 'aucun élément attendu déclaré — suggestion fondée sur la seule consistance'
    };
  }

  const found = list.filter(item => hits(answer, item));
  const missing = list.filter(item => !found.includes(item));
  const ratio = found.length / list.length;

  const note = Math.round(max * Math.min(
    1,
    WEIGHTS.completeness * full + WEIGHTS.criteria * ratio
  ));

  return {
    note,
    max,
    found,
    missing,
    words,
    completeness: full,
    criteriaRatio: ratio,
    reason: `${found.length} élément(s) attendu(s) sur ${list.length} retrouvé(s)`
      + ` • complétude ${Math.round(full * 100)} %`
  };
}

/** Note retenue : celle de l'examinateur, sinon la suggestion. */
export function retained(mark, suggestion, max) {
  const parsed = parseFloat(mark);
  if (Number.isNaN(parsed)) return suggestion;
  return Math.max(0, Math.min(max, parsed));
}

/** L'examinateur a-t-il saisi une note, ou laisse-t-il la suggestion ? */
export function isOverridden(mark) {
  return !Number.isNaN(parseFloat(mark));
}

/**
 * Total d'un ensemble de questions notées.
 * `marks` est le registre des notes retenues par l'examinateur.
 */
export function totalOf(questions, answers, marks) {
  let total = 0;
  let max = 0;
  let suggestedTotal = 0;

  for (const question of questions) {
    const suggestion = suggest(answers[question.id], question.attendu, question.max);
    total += retained(marks[question.id], suggestion.note, question.max);
    suggestedTotal += suggestion.note;
    max += question.max;
  }

  return { total: Math.round(total), suggestedTotal: Math.round(suggestedTotal), max };
}

/**
 * Seuils communs aux formations et à la qualification, exprimés en
 * pourcentage pour rester valables sur /100 comme sur /1000.
 * Le vocabulaire de décision est propre à chaque module.
 */
export function thresholdLevel(total, max) {
  const ratio = (Number(total) || 0) / (Number(max) || 1);
  if (ratio >= 0.8) return 'haut';
  if (ratio >= 0.65) return 'moyen';
  return 'bas';
}
