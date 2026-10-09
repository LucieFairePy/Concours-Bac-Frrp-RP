// Générateur combinatoire de l'examen Chef de Groupe — §9.
//
// Objectif du cahier des charges : au moins 20 000 variantes exploitables,
// construites par combinaison plutôt que listées. Le compte est calculé par
// countVariants() à partir des fragments réellement présents, et affiché
// tel quel dans le site : si quelqu'un retire des fragments, le chiffre
// baisse. Personne n'annonce 20 000 sans les avoir.
//
// Deux exigences du §9 sont tenues ici :
//   — l'équilibre : les dix questions de connaissances sont tirées dans
//     dix thèmes différents, jamais toutes dans le même ;
//   — le gel : une fois la session créée, le tirage est figé. Le tirage
//     dépend d'une graine conservée dans le dossier, donc il est
//     reproductible et vérifiable après coup.

import {
  THEMES,
  THEME_LABEL,
  CADRES,
  TOURNURES,
  CONNAISSANCES,
  COMMANDEMENT,
  SIT_THEMES,
  SIT_CONTEXTES,
  SIT_EFFECTIFS,
  SIT_INFOS,
  SIT_PRIORITES,
  SIT_CONTRAINTES,
  SIT_EVOLUTIONS,
  SIT_IMPREVUS,
  SIT_INJECTIONS,
  SIT_FORMULATIONS,
  QUESTIONS_SITUATION_1,
  QUESTIONS_SITUATION_2
} from './cdg-bank.js';

// ───────────────────────────── Tirage reproductible ─────────────────────

/** Graine lisible, conservée dans le dossier. */
export function newSeed() {
  const random = Math.floor(Math.random() * 0xffffffff);
  return `${Date.now().toString(36)}-${random.toString(36)}`.toUpperCase();
}

function hash(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 : court, suffisant, et surtout déterministe. */
function rng(seed) {
  let state = hash(String(seed));
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(next, list) {
  return list[Math.floor(next() * list.length) % list.length];
}

function shuffled(next, list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ───────────────────────────── Comptage honnête ─────────────────────────

/**
 * Nombre de variantes réellement produites par les fragments présents.
 * Le détail est renvoyé pour pouvoir être affiché : un total sans son
 * calcul n'est qu'une affirmation.
 */
export function countVariants() {
  const connaissances = CONNAISSANCES.length * CADRES.length * TOURNURES.length;
  const commandement = COMMANDEMENT.length * CADRES.length * TOURNURES.length;

  const situation = SIT_THEMES.length
    * SIT_CONTEXTES.length
    * SIT_EFFECTIFS.length
    * SIT_INFOS.length
    * SIT_PRIORITES.length
    * SIT_CONTRAINTES.length
    * SIT_FORMULATIONS.length;

  // Chaque situation reçoit en plus une évolution à injecter.
  const situation1 = situation * SIT_INJECTIONS.length;
  const situation2 = situation * SIT_EVOLUTIONS.length * SIT_IMPREVUS.length
    * SIT_INJECTIONS.length;

  return {
    connaissances,
    commandement,
    situation1,
    situation2,
    total: connaissances + commandement + situation1 + situation2,
    detail: {
      'énoncés de connaissances': CONNAISSANCES.length,
      'énoncés de commandement': COMMANDEMENT.length,
      cadres: CADRES.length,
      tournures: TOURNURES.length,
      thèmes: SIT_THEMES.length,
      contextes: SIT_CONTEXTES.length,
      effectifs: SIT_EFFECTIFS.length,
      'informations disponibles': SIT_INFOS.length,
      priorités: SIT_PRIORITES.length,
      contraintes: SIT_CONTRAINTES.length,
      évolutions: SIT_EVOLUTIONS.length,
      imprévus: SIT_IMPREVUS.length,
      'évolutions à injecter': SIT_INJECTIONS.length,
      formulations: SIT_FORMULATIONS.length
    }
  };
}

// ───────────────────────────── Questions courtes ────────────────────────

function phrase(next, base) {
  const cadre = pick(next, CADRES);
  const tournure = pick(next, TOURNURES);
  return tournure({ cadre, q: base.q });
}

/**
 * Dix questions de connaissances, une par thème : c'est le contrôle
 * d'équilibre demandé par le §9. S'il existait moins de thèmes que de
 * questions demandées, on repasserait sur les thèmes déjà servis plutôt que
 * de renvoyer une liste trop courte.
 */
export function drawConnaissances(seed, count = 10) {
  const next = rng(`${seed}-connaissances`);
  const themes = shuffled(next, THEMES);
  const out = [];

  for (let i = 0; i < count; i += 1) {
    const theme = themes[i % themes.length];
    const pool = CONNAISSANCES.filter(item => item.theme === theme
      && !out.some(done => done.base === item.q));
    const source = pool.length
      ? pick(next, pool)
      : pick(next, CONNAISSANCES.filter(item => item.theme === theme));

    out.push({
      id: `co${i + 1}`,
      kind: 'connaissances',
      theme,
      themeLabel: THEME_LABEL[theme],
      base: source.q,
      q: phrase(next, source),
      attendu: source.attendu,
      max: 20
    });
  }

  return out;
}

export function drawCommandement(seed, count = 5) {
  const next = rng(`${seed}-commandement`);
  const pool = shuffled(next, COMMANDEMENT).slice(0, count);

  return pool.map((source, index) => ({
    id: `cm${index + 1}`,
    kind: 'commandement',
    theme: 'commandement',
    themeLabel: 'Commandement / leadership',
    base: source.q,
    q: phrase(next, source),
    attendu: source.attendu,
    max: 40
  }));
}

// ───────────────────────────── Mises en situation ───────────────────────

function statement1(parts) {
  return `${parts.formulation}Tu disposes de ${parts.effectif.label}. `
    + `Un appel signale que ${parts.theme.amorce} ${parts.contexte}. `
    + `Pour l’instant, ${parts.info}. `
    + `Ce qui te paraît devoir passer en premier, c’est ${parts.priorite}. `
    + `Contrainte du moment : ${parts.contrainte}. `
    + 'Tu organises ta vacation et tu rends compte.';
}

function statement2(parts) {
  return `Quelques minutes plus tard, la situation bouge : ${parts.evolution}. `
    + `Et par-dessus, ${parts.imprevu}. `
    + 'Ton dispositif est celui que tu viens de mettre en place. '
    + 'Tu réévalues, tu réorganises, et tu rends compte.';
}

/**
 * Une évolution à injecter par situation, deux différentes. Le flux de
 * tirage est séparé de celui des situations : ajouter cette dimension n'a
 * pas changé les énoncés qu'une graine produisait déjà.
 */
export function drawInjections(seed, count = 2) {
  const next = rng(`${seed}-injections`);
  return shuffled(next, SIT_INJECTIONS).slice(0, count);
}

export function drawSituations(seed) {
  const next = rng(`${seed}-situations`);

  const parts = {
    formulation: pick(next, SIT_FORMULATIONS),
    theme: pick(next, SIT_THEMES),
    contexte: pick(next, SIT_CONTEXTES),
    effectif: pick(next, SIT_EFFECTIFS),
    info: pick(next, SIT_INFOS),
    priorite: pick(next, SIT_PRIORITES),
    contrainte: pick(next, SIT_CONTRAINTES),
    evolution: pick(next, SIT_EVOLUTIONS),
    imprevu: pick(next, SIT_IMPREVUS)
  };
  const injections = drawInjections(seed);

  return [
    {
      id: 'sit1',
      kind: 'situation1',
      title: `Mise en situation n°1 — ${parts.theme.label} : organisation`,
      statement: statement1(parts),
      injection: injections[0],
      parts: {
        theme: parts.theme.id,
        contexte: parts.contexte,
        effectif: parts.effectif.n,
        info: parts.info,
        priorite: parts.priorite,
        contrainte: parts.contrainte
      },
      questions: QUESTIONS_SITUATION_1.map(question => ({ ...question }))
    },
    {
      id: 'sit2',
      kind: 'situation2',
      title: `Mise en situation n°2 — ${parts.theme.label} : évolution et adaptation`,
      statement: statement2(parts),
      injection: injections[1],
      parts: {
        evolution: parts.evolution,
        imprevu: parts.imprevu
      },
      questions: QUESTIONS_SITUATION_2.map(question => ({ ...question }))
    }
  ];
}

/**
 * Tirage complet d'une session. Le résultat est écrit dans le dossier :
 * c'est lui qui est figé, pas seulement la graine.
 */
export function drawExam(seed = newSeed()) {
  const situations = drawSituations(seed);

  return {
    seed,
    drawnAt: new Date().toISOString(),
    connaissances: drawConnaissances(seed),
    commandement: drawCommandement(seed),
    situations
  };
}

/**
 * Sections du §8. Le total doit valoir exactement 1000, et le test
 * t-cdg.mjs le vérifie à partir des questions réellement tirées : si
 * quelqu'un ajoute une question sans ajuster le barème, le test tombe.
 *
 * Une question marquée `section: 'radio'` est posée dans une mise en
 * situation mais comptée dans la section radio.
 */
export const SECTIONS = [
  { id: 'connaissances', label: 'Connaissances essentielles', max: 200 },
  { id: 'commandement', label: 'Commandement / leadership', max: 200 },
  { id: 'situation1', label: 'Mise en situation n°1 — organisation', max: 250 },
  { id: 'situation2', label: 'Mise en situation n°2 — adaptation', max: 250 },
  { id: 'radio', label: 'Radio & compte rendu', max: 100 }
];

export const TOTAL_MAX = SECTIONS.reduce((sum, section) => sum + section.max, 0);
