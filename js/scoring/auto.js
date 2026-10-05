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

export function physicalAuto(dossier) {
  const { run, push, abs, plank, pursuit, cog } = dossier.phys;
  const r = Number(run);
  const pu = Number(push);
  const ab = Number(abs);
  const pl = Number(plank);
  let points = 0;

  if (r) points += r <= 300 ? 50 : r <= 330 ? 45 : r <= 390 ? 38 : 28;
  if (pu) points += pu >= 45 ? 35 : pu >= 38 ? 32 : pu >= 30 ? 27 : Math.min(25, pu * 0.8);
  if (ab) points += ab >= 70 ? 35 : ab >= 60 ? 32 : ab >= 50 ? 27 : Math.min(25, ab * 0.5);
  if (pl) points += pl >= 180 ? 30 : pl >= 150 ? 27 : pl >= 110 ? 23 : Math.min(20, pl / 6);

  points += autoText(pursuit, 30) + autoText(cog, 20);
  return Math.min(200, Math.round(points));
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
