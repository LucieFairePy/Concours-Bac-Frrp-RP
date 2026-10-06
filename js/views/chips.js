// Pastilles de décision, communes à tous les modules.
//
// Deux vocabulaires cohabitent, et le cahier des charges les distingue :
//   §5  concours  — RETENU / RETENU SOUS RÉSERVE / AJOURNÉ / RECALÉ
//   §10 chef de groupe — QUALIFIÉ / QUALIFIÉ SOUS RÉSERVE / AJOURNÉ / REFUSÉ
//
// L'historique central affiche les deux : il lui faut donc une seule
// fonction qui sait traduire n'importe quel code.

import { esc } from '../core/dom.js';

export const DECISION_TEXT = {
  RETENU: 'RETENU',
  RESERVE: 'RETENU SOUS RÉSERVE',
  AJOURNE: 'AJOURNÉ',
  RECALE: 'RECALÉ',
  QUALIFIE: 'QUALIFIÉ',
  QUALIFIE_RESERVE: 'QUALIFIÉ SOUS RÉSERVE',
  REFUSE: 'REFUSÉ',
  ACQUIS: 'ACQUIS',
  ACQUIS_RESERVE: 'ACQUIS SOUS RÉSERVE',
  A_REVOIR: 'À REVOIR'
};

const TONE = {
  RETENU: 'pchip-ok',
  QUALIFIE: 'pchip-ok',
  RESERVE: 'pchip-warn',
  QUALIFIE_RESERVE: 'pchip-warn',
  AJOURNE: 'pchip-wait',
  RECALE: 'pchip-no',
  REFUSE: 'pchip-no',
  ACQUIS: 'pchip-ok',
  ACQUIS_RESERVE: 'pchip-warn',
  A_REVOIR: 'pchip-no'
};

export function decisionText(code) {
  return DECISION_TEXT[code] || code || '—';
}

export function decisionChip(code) {
  if (!code) return '<span class="pchip pchip-mut">EN COURS</span>';
  return `<span class="pchip ${TONE[code] || 'pchip-mut'}">${esc(decisionText(code))}</span>`;
}

export function scoreChip(total, max) {
  if (total === null || total === undefined) return '<span class="pchip pchip-mut">—</span>';
  const ratio = Number(total) / (Number(max) || 1);
  const tone = ratio >= 0.8 ? 'pchip-ok' : ratio >= 0.65 ? 'pchip-warn' : 'pchip-no';
  return `<span class="pchip ${tone}">${esc(total)}/${esc(max)}</span>`;
}
