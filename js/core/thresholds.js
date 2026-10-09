// Seuils de suggestion — documentation technique V4 §8.6 et §11.3.
//
// « Ces seuils doivent être centralisés dans une configuration » : les
// voici, à un seul endroit, au lieu d'être dispersés en dur dans les
// modules de notation. Les valeurs de départ sont celles du prototype ;
// la direction peut les ajuster depuis la page Paramètres, et le portail
// les relit au démarrage de chaque page.
//
// Ces seuils n'arbitrent rien : ils ne servent qu'à proposer. La décision
// finale reste celle de l'examinateur (§12).

import { CONFIG } from '../config.js';

function clampScale(value, fallback, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(max, Math.round(parsed)));
}

/** Les quatre mesures chronométrées ou comptées de l'épreuve physique. */
export const PHYSICAL_MEASURES = [
  { id: 'run', label: '1200 m chronométré', unit: 's', lower: true },
  { id: 'push', label: 'Pompes', unit: 'rép.', lower: false },
  { id: 'abs', label: 'Abdos', unit: 'rép.', lower: false },
  { id: 'jumping', label: 'Jumping jacks', unit: 'rép.', lower: false }
];

export const PHYSICAL_STEPS = ['fort', 'bon', 'base'];

function clonePhysical(source) {
  const out = {
    pursuit: source.pursuit,
    cog: source.cog,
    max: source.max,
    // Barème figé des anciens dossiers notés sur le gainage.
    plank: { ...CONFIG.defaultPhysical.plank, points: [...CONFIG.defaultPhysical.plank.points] }
  };
  for (const measure of PHYSICAL_MEASURES) {
    out[measure.id] = { ...source[measure.id], points: [...source[measure.id].points] };
  }
  return out;
}

let active = {
  bac: { ...CONFIG.defaultThresholds.bac },
  cdg: { ...CONFIG.defaultThresholds.cdg },
  physical: clonePhysical(CONFIG.defaultPhysical)
};

export function defaults() {
  return {
    bac: { ...CONFIG.defaultThresholds.bac },
    cdg: { ...CONFIG.defaultThresholds.cdg },
    physical: clonePhysical(CONFIG.defaultPhysical)
  };
}

export function bac() {
  return { ...active.bac };
}

export function cdg() {
  return { ...active.cdg };
}

export function physical() {
  return clonePhysical(active.physical);
}

export function current() {
  return { bac: bac(), cdg: cdg(), physical: physical() };
}

/** Clé de réglage d'un palier : `physRunFort`, `physJumpingBase`… */
export function physicalKey(measureId, step) {
  return `phys${measureId[0].toUpperCase()}${measureId.slice(1)}${step[0].toUpperCase()}${step.slice(1)}`;
}

/**
 * §8.4 — les paliers d'une mesure restent ordonnés : « fort » est toujours
 * plus exigeant que « bon », lui-même plus exigeant que « base ». Un temps
 * se lit à l'envers d'un nombre de répétitions, d'où `lower`.
 */
function applyPhysical(source, base) {
  const next = clonePhysical(base);

  for (const measure of PHYSICAL_MEASURES) {
    const read = step => clampScale(
      source[physicalKey(measure.id, step)],
      base[measure.id][step],
      measure.unit === 's' ? 3600 : 999
    );

    const values = PHYSICAL_STEPS.map(read);
    const ordered = measure.lower
      ? [...values].sort((a, b) => a - b)
      : [...values].sort((a, b) => b - a);

    PHYSICAL_STEPS.forEach((step, index) => {
      next[measure.id][step] = ordered[index];
    });
  }

  return next;
}

/**
 * Relit les seuils depuis les paramètres partagés. Une valeur absente ou
 * illisible retombe sur celle du prototype, et l'ordre est forcé : un
 * seuil de réserve ne peut pas dépasser le seuil de réussite.
 */
export function apply(settings) {
  const source = settings || {};
  const base = defaults();

  const retenu = clampScale(source.bacRetenu, base.bac.retenu, 1000);
  const reserve = Math.min(retenu, clampScale(source.bacReserve, base.bac.reserve, 1000));

  const qualifie = clampScale(source.cdgQualifie, base.cdg.qualifie, 1000);
  const cdgReserve = Math.min(qualifie, clampScale(source.cdgReserve, base.cdg.reserve, 1000));
  const ajourne = Math.min(cdgReserve, clampScale(source.cdgAjourne, base.cdg.ajourne, 1000));

  active = {
    bac: { retenu, reserve },
    cdg: { qualifie, reserve: cdgReserve, ajourne },
    physical: applyPhysical(source, base.physical)
  };

  return current();
}

/** Les champs tels qu'ils sont enregistrés dans les paramètres partagés. */
export function toSettings(values) {
  const source = values || current();

  const out = {
    bacRetenu: source.bac.retenu,
    bacReserve: source.bac.reserve,
    cdgQualifie: source.cdg.qualifie,
    cdgReserve: source.cdg.reserve,
    cdgAjourne: source.cdg.ajourne
  };

  const phys = source.physical || defaults().physical;
  for (const measure of PHYSICAL_MEASURES) {
    for (const step of PHYSICAL_STEPS) {
      out[physicalKey(measure.id, step)] = phys[measure.id][step];
    }
  }

  return out;
}
