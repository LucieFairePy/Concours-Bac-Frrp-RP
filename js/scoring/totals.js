import { radioOf } from '../data/radio.js';
import { SCENARIOS, scenariosOf } from '../data/scenarios.js';
import { theoryAuto, radioAuto, scenarioAuto, physicalAuto, shootingAuto } from './auto.js';
import * as thresholds from '../core/thresholds.js';

export const DECISIONS = ['RETENU', 'RESERVE', 'AJOURNE', 'RECALE'];

export const DECISION_LABEL = {
  RETENU: 'RETENU',
  RESERVE: 'RETENU SOUS RÉSERVE',
  AJOURNE: 'AJOURNÉ',
  RECALE: 'RECALÉ'
};

export function finalMark(value, auto, max) {
  const parsed = parseFloat(value);
  if (Number.isNaN(parsed)) return auto;
  return Math.max(0, Math.min(max, parsed));
}

export function theoryMark(dossier, question) {
  return finalMark(dossier.marks.theory[question.id], theoryAuto(dossier, question), 10);
}

export function radioMark(dossier, index) {
  return finalMark(dossier.marks.radio[index], radioAuto(dossier, index), 25);
}

export function scenarioMark(dossier, scenarioIndex, questionIndex) {
  const key = `${scenarioIndex}_${questionIndex}`;
  return finalMark(dossier.marks.sc[key], scenarioAuto(dossier, scenarioIndex, questionIndex), 15);
}

export const SCENARIO_SECTION_MAX = 300;

export const SCENARIO_QUESTION_MAX = 15;

function rawMaxOf(scenarios) {
  return scenarios.reduce(
    (sum, scenario) => sum + scenario.questions.length * SCENARIO_QUESTION_MAX,
    0
  );
}

/** Maximum brut du jeu en vigueur. */
export const SCENARIO_RAW_MAX = rawMaxOf(SCENARIOS);

/** Maximum brut du jeu sous lequel ce dossier a été passé. */
export function scenarioRawMax(dossier) {
  return rawMaxOf(scenariosOf(dossier));
}

export function scenarioRawTotal(dossier) {
  return scenariosOf(dossier).reduce(
    (sum, scenario, scenarioIndex) =>
      sum +
      scenario.questions.reduce(
        (inner, _, questionIndex) => inner + scenarioMark(dossier, scenarioIndex, questionIndex),
        0
      ),
    0
  );
}

export function scaleScenarios(raw, max = SCENARIO_RAW_MAX) {
  if (!max) return 0;
  return Math.round((raw * SCENARIO_SECTION_MAX) / max);
}

export function totals(dossier) {
  const th = dossier.qs.reduce((sum, question) => sum + theoryMark(dossier, question), 0);
  const ra = radioOf(dossier).questions.reduce((sum, _, index) => sum + radioMark(dossier, index), 0);
  const scRaw = scenarioRawTotal(dossier);
  const sc = scaleScenarios(scRaw, scenarioRawMax(dossier));
  const ph = finalMark(dossier.marks.phys, physicalAuto(dossier), 200);
  const sh = finalMark(dossier.marks.shoot, shootingAuto(dossier), 300);

  return { th, ra, sc, scRaw, ph, sh, total: th + ra + sc + ph + sh };
}

/**
 * §8.5 et §8.6 — suggestion, jamais décision. Les règles bloquantes
 * passent avant le total ; les seuils viennent de la configuration
 * centrale, pas d'une constante recopiée ici.
 */
export function suggestedDecision(dossier, bands = thresholds.bac()) {
  const { total } = totals(dossier);
  const hostage = Number(dossier.shoot.hostage);
  const el = dossier.el;

  if (el.cheat || el.refusal || el.abandon || hostage >= 2) return 'RECALE';
  // Une cible otage touchée interdit le RETENU simple : la réserve est le
  // meilleur résultat possible, quel que soit le total.
  if (hostage === 1) return 'RESERVE';
  if (total >= bands.retenu) return 'RETENU';
  if (total >= bands.reserve) return 'RESERVE';
  return 'RECALE';
}

/**
 * §12 et §14 — instantané de ce que le système a proposé, pris au moment
 * de la clôture et écrit dans le dossier à côté des notes retenues.
 *
 * Deux raisons de l'archiver plutôt que de le recalculer : le §12 exige
 * que la note suggérée, sa justification et le résultat suggéré soient
 * conservés ; et le §16 interdit qu'un dossier clôturé se relise avec un
 * algorithme qui aurait changé depuis.
 */
export function suggestionSnapshot(dossier, bands = thresholds.bac()) {
  const theory = {};
  for (const question of dossier.qs) {
    theory[question.id] = theoryAuto(dossier, question);
  }

  const radio = radioOf(dossier).questions.map((_, index) => radioAuto(dossier, index));

  const sc = {};
  scenariosOf(dossier).forEach((scenario, scenarioIndex) => {
    scenario.questions.forEach((_, questionIndex) => {
      sc[`${scenarioIndex}_${questionIndex}`] = scenarioAuto(dossier, scenarioIndex, questionIndex);
    });
  });

  const scRaw = Object.values(sc).reduce((sum, value) => sum + value, 0);

  const sections = {
    th: Object.values(theory).reduce((sum, value) => sum + value, 0),
    ra: radio.reduce((sum, value) => sum + value, 0),
    sc: scaleScenarios(scRaw, scenarioRawMax(dossier)),
    ph: physicalAuto(dossier),
    sh: shootingAuto(dossier)
  };

  const total = sections.th + sections.ra + sections.sc + sections.ph + sections.sh;
  const hostage = Number(dossier.shoot.hostage);
  const el = dossier.el || {};

  const blocking = [];
  if (el.cheat) blocking.push('triche constatée');
  if (el.refusal) blocking.push('refus injustifié');
  if (el.abandon) blocking.push('abandon injustifié');
  if (hostage >= 2) blocking.push(`${hostage} cibles otage touchées`);
  else if (hostage === 1) blocking.push('une cible otage touchée — RETENU simple interdit');

  const decision = suggestedDecision(dossier, bands);

  const reason = [
    `${total}/1000`,
    `seuils ${bands.retenu} / ${bands.reserve}`,
    ...blocking
  ].join(' • ');

  return {
    at: new Date().toISOString(),
    theory,
    radio,
    sc,
    sections,
    total,
    decision,
    reason,
    thresholds: { ...bands }
  };
}

export function markClass(value, max) {
  const ratio = Number(value) / (Number(max) || 1);
  if (ratio >= 0.8) return 'note-verte';
  if (ratio >= 0.65) return 'note-orange';
  return 'note-rouge';
}

/**
 * Couleur du résultat final : un RECALÉ s'affiche en rouge quel que soit
 * le total — un éliminatoire avec un total élevé ne doit pas paraître vert.
 */
export function finalScoreClass(total, decision) {
  if (decision === 'RECALE') return 'note-rouge';
  return markClass(total, 1000);
}

export function decisionClass(decision) {
  if (decision === 'RECALE') return 'appreciation-recale';
  if (decision === 'AJOURNE') return 'appreciation-ajourne';
  if (decision === 'RESERVE') return 'appreciation-reserve';
  return 'appreciation-retenu';
}
