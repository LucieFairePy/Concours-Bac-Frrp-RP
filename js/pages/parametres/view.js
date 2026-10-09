// Page Paramètres — documentation technique V4 §4.1, §13 et §17.
//
// Deux réglages partagés par tout le portail : la direction BAC, reprise
// dans les signatures des fiches finales, et les seuils de suggestion
// (§8.6 et §11.3), qui doivent vivre dans une configuration et non en dur
// dans les modules de notation.
//
// Les accès et les rôles ont leur propre page (Gestion des utilisateurs) ; ils ne
// sont plus mêlés aux réglages de direction.

import { byId, setHTML, esc } from '../../core/dom.js';
import { state } from '../../core/state.js';
import * as auth from '../../core/auth.js';
import * as thresholds from '../../core/thresholds.js';
import { ROLES } from '../../core/roles.js';
import { href } from '../../routes.js';

const FIELDS = [
  ['dg', 'Grade directeur'],
  ['dn', 'Directeur'],
  ['ag', 'Grade directeur adjoint'],
  ['an', 'Directeur adjoint']
];

const THRESHOLD_FIELDS = [
  ['bacRetenu', 'Concours — RETENU à partir de', 'bac', 'retenu'],
  ['bacReserve', 'Concours — réserve à partir de', 'bac', 'reserve'],
  ['cdgQualifie', 'Chef de Groupe — QUALIFIÉ à partir de', 'cdg', 'qualifie'],
  ['cdgReserve', 'Chef de Groupe — réserve à partir de', 'cdg', 'reserve'],
  ['cdgAjourne', 'Chef de Groupe — AJOURNÉ à partir de', 'cdg', 'ajourne']
];

function commandCard() {
  const allowed = auth.can('settings');
  const dis = allowed ? '' : 'disabled';

  const inputs = FIELDS.map(([key, label]) => `
    <div class="c6">
      <label for="set-${key}">${label}</label>
      <input id="set-${key}" ${dis} value="${esc(state.settings[key] || '')}">
    </div>`).join('');

  return `
    <div class="card">
      <h2>Direction BAC</h2>
      <p class="mut">
        Ces valeurs sont partagées par tous les examinateurs. Elles pré-remplissent
        les nouveaux dossiers et apparaissent dans les signatures des fiches finales
        de tous les modules. Un dossier déjà clôturé garde la direction qui a signé
        au moment de sa clôture (§13).
      </p>
      <div class="row">${inputs}</div>
      ${allowed
        ? '<button class="primary" onclick="app.saveSettings()">Enregistrer</button>'
        : `<p class="mut">Modification réservée à l’administrateur, au Directeur BAC et à son adjoint.
             Ton rôle : <b>${esc(auth.describeRole())}</b>.</p>`}
      <div id="settingsStatus"></div>
    </div>`;
}

function thresholdCard() {
  const allowed = auth.can('settings');
  const dis = allowed ? '' : 'disabled';
  const current = thresholds.current();

  const inputs = THRESHOLD_FIELDS.map(([key, label, module, field]) => `
    <div class="c4">
      <label for="thr-${key}">${label}</label>
      <input id="thr-${key}" type="number" min="0" max="1000" step="10" ${dis}
             value="${esc(current[module][field])}">
    </div>`).join('');

  return `
    <div class="card">
      <h2>Seuils de suggestion</h2>
      <p class="mut">
        Exprimés sur 1000. Ils ne décident rien : ils règlent la <b>suggestion</b>
        affichée à l’examinateur, qui reste libre de s’en écarter (§12). Les règles
        bloquantes du concours — cible otage touchée, triche, abandon injustifié —
        passent avant ces seuils et ne se règlent pas ici.
      </p>
      <div class="row">${inputs}</div>
      ${allowed
        ? `<button class="primary" onclick="app.saveThresholds()">Enregistrer les seuils</button>
           <button onclick="app.resetThresholds()">Revenir aux valeurs du kit</button>`
        : '<p class="mut">Modification réservée aux rôles portant le droit « paramètres ».</p>'}
      <div id="thresholdStatus"></div>
    </div>`;
}

/** §8.4 — le barème physique se règle ici, pas dans le code. */
function physicalCard() {
  const allowed = auth.can('settings');
  const dis = allowed ? '' : 'disabled';
  const bareme = thresholds.physical();

  const rows = thresholds.PHYSICAL_MEASURES.map(measure => {
    const fields = thresholds.PHYSICAL_STEPS.map(step => {
      const key = thresholds.physicalKey(measure.id, step);
      return `<td>
        <label class="sr-only" for="phy-${key}">${esc(measure.label)} — palier ${step}</label>
        <input id="phy-${key}" type="number" min="0" ${dis}
               value="${esc(bareme[measure.id][step])}">
      </td>`;
    }).join('');

    const points = bareme[measure.id].points;

    return `<tr>
      <th>${esc(measure.label)} <span class="mut">(${esc(measure.unit)})</span></th>
      ${fields}
      <td class="mut">${points.join(' / ')} pts</td>
    </tr>`;
  }).join('');

  return `
    <div class="card">
      <h2>Barème physique et cognitif</h2>
      <p class="mut">
        Les trois paliers de chaque mesure, sur les 200 points de l’épreuve.
        Référence du kit : 1200 m (trois tours de 400 m) après un tour
        d’échauffement, 30 pompes, 50 abdos, 20 jumping jacks. Un temps se lit
        à l’envers d’un nombre de répétitions : pour le 1200 m, « fort » est le
        temps le plus court.
      </p>
      <div class="htable-wrap">
        <table class="htable">
          <tr><th>Mesure</th><th>Fort</th><th>Bon</th><th>Base</th><th>Points</th></tr>
          ${rows}
        </table>
      </div>
      ${allowed
        ? `<button class="primary" onclick="app.savePhysical()">Enregistrer le barème</button>
           <button onclick="app.resetPhysical()">Revenir aux valeurs du kit</button>`
        : '<p class="mut">Modification réservée aux rôles portant le droit « paramètres ».</p>'}
      <div id="physicalStatus"></div>
    </div>`;
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

function permissionList() {
  const mine = ROLES[auth.role()] || ROLES.lecture;
  return mine.can.map(item => `<code>${esc(item)}</code>`).join(' ');
}

function sessionCard() {
  const session = auth.current();

  return `
    <div class="card">
      <h2>Mon profil</h2>
      <table>
        <tr><th>Nom</th><td>${esc(session ? session.name : '—')}</td></tr>
        <tr><th>Grade</th><td>${esc(session && session.grade ? session.grade : '—')}</td></tr>
        <tr><th>Fonction BAC</th><td>${esc(auth.describeRole())}</td></tr>
        <tr><th>Identifiant</th><td>${esc(session ? session.login : '—')}</td></tr>
        <tr><th>Permissions</th><td>${permissionList()}</td></tr>
        <tr><th>Session valable jusqu’à</th><td>${esc(expiryLabel())}</td></tr>
        <tr><th>Mémorisée sur cet appareil</th><td>${auth.persistent() ? 'oui' : 'non — onglet seulement'}</td></tr>
      </table>
      ${auth.can('accounts')
        ? `<a class="pnav-item" href="${href('utilisateurs')}">Gérer les utilisateurs →</a>`
        : ''}
      <button class="danger" onclick="portal.signOut()">Se déconnecter</button>
    </div>`;
}

export function renderSettings() {
  setHTML('settingsBox', [
    commandCard(),
    thresholdCard(),
    physicalCard(),
    sessionCard()
  ].join(''));
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
