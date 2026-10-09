// Suggestions automatiques du concours — §8.4 et §12.
//
// Aucun seuil n'est écrit ici : le barème physique vient de la
// configuration centrale (js/core/thresholds.js), réglable par la
// direction. Ce fichier ne fait qu'appliquer ce barème.

import * as thresholds from '../core/thresholds.js';

export function autoText(answer, max) {
  const text = String(answer || '').trim();
  if (!text) return 0;
  const words = text.split(/\s+/).length;
  return Math.min(max, Math.round(max * Math.min(1, 0.35 + words / 70)));
}

export function theoryAuto(dossier, question) {
  return autoText(dossier.ans[question.id], 10);
}

export function radioAuto(dossier, index) {
  return autoText(dossier.radioAns[index], 25);
}

export function scenarioAuto(dossier, scenarioIndex, questionIndex) {
  return autoText(dossier.scAns[scenarioIndex][questionIndex], 15);
}

/** Un temps : sous le palier, on prend ses points ; sinon le plancher. */
function timeBand(value, band) {
  if (value <= band.fort) return band.points[0];
  if (value <= band.bon) return band.points[1];
  if (value <= band.base) return band.points[2];
  return band.points[3];
}

/** Un comptage : au-dessus du palier, ses points ; sinon au prorata. */
function countBand(value, band) {
  if (value >= band.fort) return band.points[0];
  if (value >= band.bon) return band.points[1];
  if (value >= band.base) return band.points[2];
  return Math.min(band.cap, value * band.ratio);
}

/**
 * Un dossier saisi avant la V4 porte un gainage et pas de jumping jacks :
 * il reste noté sur le gainage, pour que sa note ne change pas en le
 * rouvrant.
 */
export function usesPlank(phys) {
  const jumping = String((phys && phys.jumping) || '').trim();
  const plank = String((phys && phys.plank) || '').trim();
  return !jumping && Boolean(plank);
}

export function physicalAuto(dossier, bareme = thresholds.physical()) {
  const { run, push, abs, jumping, plank, pursuit, cog } = dossier.phys;
  const r = Number(run);
  const pu = Number(push);
  const ab = Number(abs);
  let points = 0;

  if (r) points += timeBand(r, bareme.run);
  if (pu) points += countBand(pu, bareme.push);
  if (ab) points += countBand(ab, bareme.abs);
  if (usesPlank(dossier.phys)) points += countBand(Number(plank), bareme.plank);
  else if (Number(jumping)) points += countBand(Number(jumping), bareme.jumping);

  points += autoText(pursuit, bareme.pursuit) + autoText(cog, bareme.cog);
  return Math.min(bareme.max, Math.round(points));
}

export function shootingAuto(dossier) {
  const shoot = dossier.shoot;
  let score = autoText(shoot.obs, 170) + autoText(shoot.analysis, 70);
  const memoryErrors = Number(shoot.memoryErrors) || 0;
  const discernErrors = Number(shoot.discernErrors) || 0;

  if (shoot.memoryAsked) score += Math.max(0, 35 - memoryErrors * 10);
  if (shoot.discernAsked) score += Math.max(0, 25 - discernErrors * 12);

  score = Math.min(300, score);
  const hostage = Number(shoot.hostage);
  if (hostage === 1) score = Math.min(score, 210);
  if (hostage >= 2) score = 0;

  return Math.round(score);
}
