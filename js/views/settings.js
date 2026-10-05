import { byId, setHTML, esc } from '../core/dom.js';
import { state } from '../core/state.js';
import * as auth from '../core/auth.js';

const FIELDS = [
  ['dg', 'Grade directeur'],
  ['dn', 'Directeur'],
  ['ag', 'Grade directeur adjoint'],
  ['an', 'Directeur adjoint']
];

function commandCard() {
  const dis = auth.canWrite() ? '' : 'disabled';

  const inputs = FIELDS.map(([key, label]) => `
    <div class="c6">
      <label>${label}</label>
      <input id="set-${key}" ${dis} value="${esc(state.settings[key] || '')}">
    </div>`).join('');

  return `
    <div class="card">
      <h2>Direction BAC</h2>
      <p class="mut">
        Ces valeurs sont partagées par tous les examinateurs et pré-remplissent les nouveaux dossiers.
      </p>
      <div class="row">${inputs}</div>
      <button class="primary" ${dis} onclick="app.saveSettings()">Enregistrer</button>
      <div id="settingsStatus"></div>
    </div>`;
}

function sessionCard() {
  const session = auth.current();

  return `
    <div class="card">
      <h2>Session</h2>
      <table>
        <tr><th>Examinateur</th><td>${esc(session ? `${session.grade} ${session.name}`.trim() : '—')}</td></tr>
        <tr><th>Identifiant</th><td>${esc(session ? session.login : '—')}</td></tr>
        <tr><th>Rôle</th><td>${esc(session ? session.role : '—')}</td></tr>
        <tr><th>Accès aux paramètres</th><td>${auth.canManage() ? 'oui' : 'non'}</td></tr>
      </table>
      <button class="danger" onclick="app.signOut()">Se déconnecter</button>
    </div>`;
}

function rosterRow(entry, selfId) {
  const isSelf = entry.id === selfId;
  const action = isSelf
    ? '<span class="mut">session en cours</span>'
    : `<button class="danger" onclick="app.removeAccess('${esc(entry.id)}')">Retirer</button>`;

  return `<tr>
    <td>${esc(entry.label)}</td>
    <td>${entry.manage ? '<b>oui</b>' : 'non'}</td>
    <td>${action}</td>
  </tr>`;
}

function accessCard(entries) {
  const selfId = auth.current() ? auth.current().login : '';

  const rows = entries.length
    ? entries.map(entry => rosterRow(entry, selfId)).join('')
    : '<tr><td colspan="3" class="mut">Aucun accès enregistré.</td></tr>';

  return `
    <div class="card">
      <h2>Accès des examinateurs</h2>
      <table>
        <tr><th>Examinateur</th><th>Accès aux paramètres</th><th></th></tr>
        ${rows}
      </table>

      <h3>Ajouter une personne</h3>
      <div class="row">
        <div class="c4">
          <label>Grade</label>
          <input id="newGrade" placeholder="Brigadier">
        </div>
        <div class="c8">
          <label>Nom et prénom</label>
          <input id="newName" placeholder="LAURENT Cyril">
        </div>
      </div>
      <label>
        <input class="inline-check" type="checkbox" id="newManage">
        Autoriser l’accès à cette page Paramètres (gestion des accès et de la direction)
      </label>
      <button class="primary" onclick="app.createAccess()">Générer l’accès</button>
      <div id="accessStatus"></div>
    </div>`;
}

export function renderSettings(entries) {
  const cards = [commandCard()];
  if (auth.canManage()) cards.push(accessCard(entries || []));
  cards.push(sessionCard());
  setHTML('settingsBox', cards.join(''));
}

export function readSettingsForm() {
  const next = {};
  for (const [key] of FIELDS) {
    next[key] = byId(`set-${key}`)?.value.trim() || '';
  }
  return next;
}

export function readNewAccessForm() {
  return {
    grade: byId('newGrade')?.value.trim() || '',
    name: byId('newName')?.value.trim() || '',
    manage: Boolean(byId('newManage')?.checked)
  };
}

export function clearNewAccessForm() {
  const grade = byId('newGrade');
  const name = byId('newName');
  const manage = byId('newManage');
  if (grade) grade.value = '';
  if (name) name.value = '';
  if (manage) manage.checked = false;
}

export function setSettingsStatus(html) {
  setHTML('settingsStatus', html);
}

export function setAccessStatus(html) {
  setHTML('accessStatus', html);
}

export function showGeneratedCode(created) {
  setAccessStatus(`
    <div class="banner ok">
      <b>Accès créé pour ${esc(created.label)}</b>
      ${created.manage ? ' — avec accès aux paramètres' : ''}
      <div class="code-row">
        <input id="newCode" class="code-field" readonly value="${esc(created.code)}">
        <button class="primary" onclick="app.copyCode()">Copier</button>
      </div>
      <p class="mut">
        Transmets ce code par un canal privé. Il n’est stocké nulle part en clair
        et ne pourra pas être réaffiché. En cas de perte, retire l’accès et recrée-le.
      </p>
    </div>`);

  const field = byId('newCode');
  if (field) {
    field.focus();
    field.select();
  }
}
