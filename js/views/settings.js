// Page Paramètres — cahier des charges §13 (direction BAC) et §14 (rôles).
//
// La direction renseignée ici est reprise automatiquement dans les fiches
// finales et les signatures de tous les modules. Seuls les rôles portant la
// permission « settings » (administrateur, Directeur BAC, Directeur adjoint)
// voient les cartes de modification ; les autres voient les valeurs en
// lecture.

import { byId, setHTML, esc } from '../core/dom.js';
import { state } from '../core/state.js';
import * as auth from '../core/auth.js';
import { ROLE_ORDER, ROLES, roleLabel } from '../core/roles.js';

const FIELDS = [
  ['dg', 'Grade directeur'],
  ['dn', 'Directeur'],
  ['ag', 'Grade directeur adjoint'],
  ['an', 'Directeur adjoint']
];

function commandCard() {
  const allowed = auth.can('settings');
  const dis = allowed ? '' : 'disabled';

  const inputs = FIELDS.map(([key, label]) => `
    <div class="c6">
      <label>${label}</label>
      <input id="set-${key}" ${dis} value="${esc(state.settings[key] || '')}">
    </div>`).join('');

  return `
    <div class="card">
      <h2>Direction BAC</h2>
      <p class="mut">
        Ces valeurs sont partagées par tous les examinateurs. Elles pré-remplissent
        les nouveaux dossiers et apparaissent dans les signatures des fiches finales
        de tous les modules.
      </p>
      <div class="row">${inputs}</div>
      ${allowed
        ? '<button class="primary" onclick="app.saveSettings()">Enregistrer</button>'
        : `<p class="mut">Modification réservée à l’administrateur, au Directeur BAC et à son adjoint.
             Ton rôle : <b>${esc(auth.describeRole())}</b>.</p>`}
      <div id="settingsStatus"></div>
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
      <button class="danger" onclick="portal.signOut()">Se déconnecter</button>
    </div>`;
}

function roleSelect(entry) {
  const options = ROLE_ORDER
    .map(id => `<option value="${id}" ${entry.role === id ? 'selected' : ''}>${esc(ROLES[id].label)}</option>`)
    .join('');

  return `<select onchange="app.setAccessRole('${esc(entry.id)}',this.value)">${options}</select>`;
}

function rosterRow(entry, selfId) {
  if (entry.id === selfId) {
    return `<tr>
      <td>${esc(entry.label)}</td>
      <td>${esc(roleLabel(entry.role))}</td>
      <td class="row-actions"><span class="mut">session en cours</span></td>
    </tr>`;
  }

  return `<tr>
    <td>${esc(entry.label)}</td>
    <td>${roleSelect(entry)}</td>
    <td class="row-actions">
      <button class="danger" onclick="app.removeAccess('${esc(entry.id)}')">Retirer</button>
    </td>
  </tr>`;
}

function accessCard(entries) {
  const selfId = auth.current() ? auth.current().login : '';

  const rows = entries.length
    ? entries.map(entry => rosterRow(entry, selfId)).join('')
    : '<tr><td colspan="3" class="mut">Aucun accès enregistré.</td></tr>';

  const newRoles = ROLE_ORDER
    .map(id => `<option value="${id}" ${id === 'formateur' ? 'selected' : ''}>${esc(ROLES[id].label)}</option>`)
    .join('');

  return `
    <div class="card">
      <h2>Accès et rôles</h2>
      <p class="mut">
        Changer le rôle d’une personne <b>régénère son code</b> : l’ancien cesse de
        fonctionner et le nouveau s’affiche une seule fois. C’est inévitable, le rôle
        est scellé avec le code.
      </p>
      <table>
        <tr><th>Personne</th><th>Rôle</th><th></th></tr>
        ${rows}
      </table>

      <h3>Ajouter une personne</h3>
      <div class="row">
        <div class="c3">
          <label>Grade</label>
          <input id="newGrade" placeholder="Brigadier">
        </div>
        <div class="c6">
          <label>Nom et prénom</label>
          <input id="newName" placeholder="LAURENT Cyril">
        </div>
        <div class="c3">
          <label>Rôle</label>
          <select id="newRole">${newRoles}</select>
        </div>
      </div>
      <button class="primary" onclick="app.createAccess()">Générer l’accès</button>
      <div id="accessStatus"></div>
    </div>`;
}

function roleTableCard() {
  const rows = ROLE_ORDER.map(id => `
    <tr>
      <td><b>${esc(ROLES[id].label)}</b></td>
      <td>${ROLES[id].can.map(item => `<code>${esc(item)}</code>`).join(' ')}</td>
    </tr>`).join('');

  return `
    <div class="card">
      <h2>Ce que chaque rôle permet</h2>
      <table>
        <tr><th>Rôle</th><th>Permissions</th></tr>
        ${rows}
      </table>
      <table>
        <tr><th><code>read</code></th><td>consulter les dossiers clôturés et l’historique</td></tr>
        <tr><th><code>write</code></th><td>créer et corriger un dossier, enregistrer un brouillon</td></tr>
        <tr><th><code>close</code></th><td>clôturer définitivement un dossier</td></tr>
        <tr><th><code>train</code></th><td>valider une formation suivie par un agent</td></tr>
        <tr><th><code>settings</code></th><td>modifier la direction BAC et les accès</td></tr>
        <tr><th><code>journal</code></th><td>lire le journal des actions sensibles</td></tr>
        <tr><th><code>accounts</code></th><td>ouvrir la page Administration</td></tr>
      </table>
      <div class="warn">
        <b>À savoir.</b> Ces rôles décident ce que l’interface propose. Sur un
        hébergement statique, toute personne détenant un code valide détient le
        même jeton d’écriture du dépôt : un rôle n’est pas une frontière
        infranchissable. Ce qui contient réellement, ce sont la protection des
        branches et le journal, qui rendent toute dégradation visible et
        réversible.
      </div>
    </div>`;
}

export function renderSettings(entries) {
  const cards = [commandCard()];
  if (auth.can('settings')) cards.push(accessCard(entries || []));
  cards.push(sessionCard(), roleTableCard());
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
    role: byId('newRole')?.value || 'formateur'
  };
}

export function clearNewAccessForm() {
  const grade = byId('newGrade');
  const name = byId('newName');
  if (grade) grade.value = '';
  if (name) name.value = '';
}

export function setSettingsStatus(html) {
  setHTML('settingsStatus', html);
}

export function setAccessStatus(html) {
  setHTML('accessStatus', html);
}

export function showGeneratedCode(created, titre) {
  setAccessStatus(`
    <div class="banner ok">
      <b>${esc(titre || `Accès créé pour ${created.label}`)}</b>
      — rôle ${esc(roleLabel(created.role))}
      <div class="code-row">
        <input id="newCode" class="code-field" readonly value="${esc(created.code)}">
        <button class="primary" onclick="app.copyCode()">Copier</button>
      </div>
      <p class="mut">
        Transmets ce code par un canal privé. Il n’est stocké nulle part en clair
        et ne pourra pas être réaffiché. L’ancien code de cette personne, s’il
        existait, ne fonctionne plus.
      </p>
    </div>`);

  const field = byId('newCode');
  if (field) {
    field.focus();
    field.select();
  }
}
