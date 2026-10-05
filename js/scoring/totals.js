import { RADIO_EXERCISE } from '../data/radio.js';
import { SCENARIOS } from '../data/scenarios.js';
import { theoryAuto, radioAuto, scenarioAuto, physicalAuto, shootingAuto } from './auto.js';

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

export function totals(dossier) {
  const th = dossier.qs.reduce((sum, question) => sum + theoryMark(dossier, question), 0);
  const ra = RADIO_EXERCISE.questions.reduce((sum, _, index) => sum + radioMark(dossier, index), 0);
  const sc = SCENARIOS.reduce(
    (sum, scenario, scenarioIndex) =>
      sum +
      scenario.questions.reduce(
        (inner, _, questionIndex) => inner + scenarioMark(dossier, scenarioIndex, questionIndex),
        0
      ),
    0
  );
  const ph = finalMark(dossier.marks.phys, physicalAuto(dossier), 200);
  const sh = finalMark(dossier.marks.shoot, shootingAuto(dossier), 300);

  return { th, ra, sc, ph, sh, total: th + ra + sc + ph + sh };
}

export function suggestedDecision(dossier) {
  const { total } = totals(dossier);
  const hostage = Number(dossier.shoot.hostage);
  const el = dossier.el;

  if (el.cheat || el.refusal || el.abandon || hostage >= 2) return 'RECALE';
  if (hostage === 1) return 'RESERVE';
  if (total >= 800) return 'RETENU';
  if (total >= 650) return 'RESERVE';
  return 'RECALE';
}

export function markClass(value, max) {
  const ratio = Number(value) / (Number(max) || 1);
  if (ratio >= 0.8) return 'note-verte';
  if (ratio >= 0.65) return 'note-orange';
  return 'note-rouge';
}

export function decisionClass(decision) {
  if (decision === 'RECALE') return 'appreciation-recale';
  if (decision === 'AJOURNE') return 'appreciation-ajourne';
  if (decision === 'RESERVE') return 'appreciation-reserve';
  return 'appreciation-retenu';
}
