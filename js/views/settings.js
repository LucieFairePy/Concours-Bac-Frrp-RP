import { byId, setHTML, esc } from '../core/dom.js';
import { state } from '../core/state.js';
import * as auth from '../core/auth.js';

const FIELDS = [
  ['dg', 'Grade directeur'],
  ['dn', 'Directeur'],
  ['ag', 'Grade directeur adjoint'],
  ['an', 'Directeur adjoint']
];

export function renderSettings() {
  const session = auth.current();
  const dis = auth.canWrite() ? '' : 'disabled';

  const inputs = FIELDS.map(([key, label]) => `
    <div class="c6">
      <label>${label}</label>
      <input id="set-${key}" ${dis} value="${esc(state.settings[key] || '')}">
    </div>`).join('');

  setHTML('settingsBox', `
    <div class="card">
      <h2>Paramètres BAC</h2>
      <p class="mut">
        Ces valeurs sont partagées par tous les examinateurs et pré-remplissent les nouveaux dossiers.
      </p>
      <div class="row">${inputs}</div>
      <button class="primary" ${dis} onclick="app.saveSettings()">Enregistrer</button>
      <div id="settingsStatus"></div>
    </div>
    <div class="card">
      <h2>Session</h2>
      <table>
        <tr><th>Compte</th><td>${esc(session ? session.login : '—')}</td></tr>
        <tr><th>Examinateur</th><td>${esc(session ? `${session.grade} ${session.name}`.trim() : '—')}</td></tr>
        <tr><th>Rôle</th><td>${esc(session ? session.role : '—')}</td></tr>
        <tr><th>Écriture</th><td>${auth.canWrite() ? 'autorisée' : 'lecture seule'}</td></tr>
      </table>
      <button class="danger" onclick="app.signOut()">Se déconnecter</button>
    </div>`);
}

export function readSettingsForm() {
  const next = {};
  for (const [key] of FIELDS) {
    next[key] = byId(`set-${key}`)?.value.trim() || '';
  }
  return next;
}

export function setSettingsStatus(html) {
  setHTML('settingsStatus', html);
}
