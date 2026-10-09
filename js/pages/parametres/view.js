// Page Paramètres — affichage. La carte de l'archive V4 (app.js,
// `settings()`) : Directeur BAC et son grade, Directeur adjoint et son
// grade, ENREGISTRER, et la mention de réserve.
//
// Le portail garde trois réglages que l'archive n'avait pas — seuils de
// suggestion, barème physique, et la session de l'examinateur. Ils
// s'ouvrent dans la fenêtre modale depuis la rangée de boutons sous la
// carte, pour que la page garde la forme de l'archive.
//
// Seuls les rôles qui portent le droit « paramètres » peuvent modifier :
// pour les autres, les champs sont grisés et les boutons absents.

import { byId, setHTML, esc } from '../../core/dom.js';
import { state } from '../../core/state.js';
import * as auth from '../../core/auth.js';
import * as thresholds from '../../core/thresholds.js';
import { ROLES } from '../../core/roles.js';

// Dans l'ordre de l'archive : le nom, puis le grade, sur une ligne.
const FIELDS = [
  ['dn', 'DIRECTEUR BAC'],
  ['dg', 'GRADE'],
  ['an', 'DIRECTEUR ADJOINT BAC'],
  ['ag', 'GRADE']
];

const THRESHOLD_FIELDS = [
  ['bacRetenu', 'CONCOURS — RETENU À PARTIR DE', 'bac', 'retenu'],
  ['bacReserve', 'CONCOURS — RÉSERVE À PARTIR DE', 'bac', 'reserve'],
  ['cdgQualifie', 'CHEF DE GROUPE — QUALIFIÉ À PARTIR DE', 'cdg', 'qualifie'],
  ['cdgReserve', 'CHEF DE GROUPE — RÉSERVE À PARTIR DE', 'cdg', 'reserve'],
  ['cdgAjourne', 'CHEF DE GROUPE — AJOURNÉ À PARTIR DE', 'cdg', 'ajourne']
];

function commandCard() {
  const allowed = auth.can('settings');
  const dis = allowed ? '' : ' disabled';

  const inputs = FIELDS.map(([key, label]) => `<div class="field"><label for="set-${key}">${label}</label><input id="set-${key}"${dis} value="${esc(state.settings[key] || '')}"></div>`).join('');

  return `<div class="contentCard"><div class="formgrid">${inputs}</div><div class="actions">${allowed ? '<button class="btn" onclick="app.saveSettings()">ENREGISTRER</button>' : ''}<button class="btn dark" onclick="app.openThresholds()">SEUILS DE SUGGESTION</button><button class="btn dark" onclick="app.openPhysical()">BARÈME PHYSIQUE</button><button class="btn dark" onclick="app.openSession()">MA SESSION</button></div><div id="settingsStatus"></div><p class="hint">Version finale : modification réservée au Directeur BAC, Directeur adjoint et créateur/administrateur du site.</p></div>`;
}

/** Seuils de suggestion (fenêtre modale). */
export function thresholdView() {
  const allowed = auth.can('settings');
  const dis = allowed ? '' : ' disabled';
  const current = thresholds.current();

  const inputs = THRESHOLD_FIELDS.map(([key, label, module, field]) => `<div class="field"><label for="thr-${key}">${label}</label><input id="thr-${key}" type="number" min="0" max="1000" step="10"${dis} value="${esc(current[module][field])}"></div>`).join('');

  return `<h2>SEUILS DE SUGGESTION</h2><p class="hint">Exprimés sur 1000. Ils ne décident rien : ils règlent la suggestion affichée à l’examinateur, qui reste libre de s’en écarter.</p><div class="formgrid">${inputs}</div>${allowed ? '<div class="actions"><button class="btn" onclick="app.saveThresholds()">ENREGISTRER LES SEUILS</button><button class="btn dark" onclick="app.resetThresholds()">REVENIR AUX VALEURS DU KIT</button></div>' : ''}<div id="thresholdStatus"></div>`;
}

/** Barème physique (fenêtre modale). */
export function physicalView() {
  const allowed = auth.can('settings');
  const dis = allowed ? '' : ' disabled';
  const bareme = thresholds.physical();

  const rows = thresholds.PHYSICAL_MEASURES.map(measure => {
    const fields = thresholds.PHYSICAL_STEPS.map(step => {
      const key = thresholds.physicalKey(measure.id, step);
      return `<td class="field"><label class="sr-only" for="phy-${key}">${esc(measure.label)} — palier ${step}</label><input id="phy-${key}" type="number" min="0"${dis} value="${esc(bareme[measure.id][step])}"></td>`;
    }).join('');
    return `<tr><td><b>${esc(measure.label)}</b> <span class="hint">(${esc(measure.unit)})</span></td>${fields}<td>${bareme[measure.id].points.join(' / ')} pts</td></tr>`;
  }).join('');

  return `<h2>BARÈME PHYSIQUE ET COGNITIF</h2><p class="hint">Les trois paliers de chaque mesure, sur les 200 points de l’épreuve. Pour un temps, « fort » est le temps le plus court.</p><div class="table"><table><thead><tr><th>MESURE</th><th>FORT</th><th>BON</th><th>BASE</th><th>POINTS</th></tr></thead><tbody class="static">${rows}</tbody></table></div>${allowed ? '<div class="actions"><button class="btn" onclick="app.savePhysical()">ENREGISTRER LE BARÈME</button><button class="btn dark" onclick="app.resetPhysical()">REVENIR AUX VALEURS DU KIT</button></div>' : ''}<div id="physicalStatus"></div>`;
}

function expiryLabel() {
  const at = auth.expiry();
  if (!at) return 'session non mémorisée';

  const when = new Date(at);
  const left = Math.max(0, Math.round((at - Date.now()) / 60000));
  const hours = Math.floor(left / 60);
  const minutes = left % 60;
  const remaining = hours ? `${hours} h ${String(minutes).padStart(2, '0')}` : `${minutes} min`;

  return `${when.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })} (dans ${remaining})`;
}

/** La session de l'examinateur (fenêtre modale). */
export function sessionView() {
  const session = auth.current();
  const mine = ROLES[auth.role()] || ROLES.lecture;

  const facts = [
    ['NOM', session ? session.name : '—'],
    ['GRADE', session && session.grade ? session.grade : '—'],
    ['RÔLE SITE', auth.describeRole()],
    ['IDENTIFIANT', session ? session.login : '—'],
    ['PERMISSIONS', mine.can.join(' · ')],
    ['SESSION VALABLE JUSQU’À', expiryLabel()],
    ['MÉMORISÉE SUR CET APPAREIL', auth.persistent() ? 'oui' : 'non — onglet seulement']
  ].map(([label, value]) => `<tr><th>${label}</th><td>${esc(value)}</td></tr>`).join('');

  return `<h2>MA SESSION</h2><div class="table"><table><tbody class="static">${facts}</tbody></table></div><div class="actions"><button class="btn red" onclick="portal.signOut()">SE DÉCONNECTER</button></div>`;
}

export function renderSettings() {
  setHTML('settingsBox', commandCard());
}

export function readSettingsForm() {
  const next = {};
  for (const [key] of FIELDS) {
    next[key] = byId(`set-${key}`)?.value.trim() || '';
  }
  return next;
}

export function readThresholdForm() {
  const next = {};
  for (const [key] of THRESHOLD_FIELDS) {
    next[key] = Number(byId(`thr-${key}`)?.value);
  }
  return next;
}

export function setSettingsStatus(html) {
  setHTML('settingsStatus', html);
}

export function setThresholdStatus(html) {
  setHTML('thresholdStatus', html);
}

export function readPhysicalForm() {
  const next = {};
  for (const measure of thresholds.PHYSICAL_MEASURES) {
    for (const step of thresholds.PHYSICAL_STEPS) {
      const key = thresholds.physicalKey(measure.id, step);
      next[key] = Number(byId(`phy-${key}`)?.value);
    }
  }
  return next;
}

export function setPhysicalStatus(html) {
  setHTML('physicalStatus', html);
}
