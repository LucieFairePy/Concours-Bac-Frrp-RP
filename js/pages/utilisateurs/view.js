// Page Gestion utilisateurs — documentation technique V4 §4.1 et §17.
//
// Les accès et les rôles ont leur page à eux : /administration/utilisateurs
// dans la nomenclature du kit, `#/administration/utilisateurs` dans le portail.
// Ce fichier ne contient que l'affichage ; les actions sensibles — créer,
// changer de rôle, retirer — vivent dans js/utilisateurs.js et passent
// toutes par le journal.

import { byId, setHTML, esc } from '../../core/dom.js';
import * as auth from '../../core/auth.js';
import { ROLE_ORDER, ROLES, roleLabel } from '../../core/roles.js';
import { identity } from '../../core/roster.js';

function roleSelect(entry) {
  const options = ROLE_ORDER
    .map(id => `<option value="${id}" ${entry.role === id ? 'selected' : ''}>${esc(ROLES[id].label)}</option>`)
    .join('');

  return `<select onchange="app.setAccessRole('${esc(entry.id)}',this.value)">${options}</select>`;
}

/** Une ligne au gabarit de la maquette : utilisateur, grade, rôle, statut. */
function rosterRow(entry, selfId) {
  const who = identity(entry);
  const name = who.name || entry.label;
  const self = entry.id === selfId;

  return `<tr>
    <td>${esc(name)}</td>
    <td>${esc(who.grade || '—')}</td>
    <td>${self ? esc(roleLabel(entry.role)) : roleSelect(entry)}</td>
    <td>${self
      ? '<span class="pstatus self">SESSION EN COURS</span>'
      : '<span class="pstatus">ACTIF</span>'}</td>
    <td class="row-actions">${self
      ? ''
      : `<button class="danger" onclick="app.removeAccess('${esc(entry.id)}')">Retirer</button>`}</td>
  </tr>`;
}

function accessCard(entries) {
  const selfId = auth.current() ? auth.current().login : '';

  const rows = entries.length
    ? entries.map(entry => rosterRow(entry, selfId)).join('')
    : '<tr><td colspan="5" class="mut">Aucun accès enregistré.</td></tr>';

  const newRoles = ROLE_ORDER
    .map(id => `<option value="${id}" ${id === 'formateur' ? 'selected' : ''}>${esc(ROLES[id].label)}</option>`)
    .join('');

  return `
    <div class="ptable">
      <table>
        <tr><th>Utilisateur</th><th>Grade</th><th>Rôle site</th><th>Statut</th><th></th></tr>
        ${rows}
      </table>
    </div>
    <p class="phint">
      Changer le rôle d’une personne <b>régénère son code</b> : l’ancien cesse de
      fonctionner et le nouveau s’affiche une seule fois. C’est inévitable, le rôle
      est scellé avec le code.
    </p>

    <div class="pcontent">
      <h3>Ajouter une personne</h3>
      <div class="pform three">
        <div>
          <label for="newGrade">Grade</label>
          <input id="newGrade" placeholder="Brigadier">
        </div>
        <div>
          <label for="newName">Nom et prénom</label>
          <input id="newName" placeholder="LAURENT Cyril">
        </div>
        <div>
          <label for="newRole">Rôle site</label>
          <select id="newRole">${newRoles}</select>
        </div>
      </div>
      <div class="pactions">
        <button class="primary" onclick="app.createAccess()">Générer l’accès</button>
      </div>
      <div id="accessStatus"></div>
    </div>`;
}

/** §18.4 — les effectifs comptés sur les accès réellement ouverts. */
function staffCard(counted) {
  if (!counted) {
    return `
      <div class="card">
        <h2>Effectifs BAC 75 N</h2>
        <p class="pempty">Comptage en cours…</p>
      </div>`;
  }

  if (!counted.readable) {
    return `
      <div class="card">
        <h2>Effectifs BAC 75 N</h2>
        <p class="pempty">Effectifs illisibles : ${esc(counted.error)}</p>
      </div>`;
  }

  const rows = counted.lines
    .map(line => `<tr><td>${esc(line.label)}</td><td><b>${line.count}</b></td></tr>`)
    .join('');

  return `
    <div class="card">
      <h2>Effectifs BAC 75 N</h2>
      <p class="mut">
        Comptés sur les accès ouverts, par le grade de chacun. Aucun nombre
        n’est écrit en dur dans la page.
      </p>
      <div class="ptable">
        <table>
          <tr><th>Corps</th><th>Effectif</th></tr>
          ${rows}
          <tr><td><b>Total</b></td><td><b>${counted.total}</b></td></tr>
        </table>
      </div>
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
      <div class="ptable">
        <table>
          <tr><th>Rôle</th><th>Permissions</th></tr>
          ${rows}
        </table>
      </div>
      <div class="ptable" style="margin-top:10px"><table>
        <tr><th><code>read</code></th><td>consulter les dossiers clôturés et l’historique</td></tr>
        <tr><th><code>write</code></th><td>créer et corriger un dossier, enregistrer un brouillon</td></tr>
        <tr><th><code>close</code></th><td>clôturer définitivement un dossier</td></tr>
        <tr><th><code>train</code></th><td>valider une formation suivie par un agent</td></tr>
        <tr><th><code>settings</code></th><td>modifier la direction BAC, les seuils et les accès</td></tr>
        <tr><th><code>journal</code></th><td>lire le journal des actions sensibles</td></tr>
        <tr><th><code>accounts</code></th><td>ouvrir l’Administration et la gestion des utilisateurs</td></tr>
      </table></div>
      <div class="warn">
        <b>À savoir — §17.</b> Ces rôles décident ce que l’interface propose. Sur un
        hébergement statique, toute personne détenant un code valide détient le
        même jeton d’écriture du dépôt : un rôle n’est pas une frontière
        infranchissable. Ce qui contient réellement, ce sont la protection des
        branches et le journal, qui rendent toute dégradation visible et
        réversible.
      </div>
    </div>`;
}

export function renderUsers(entries, counted) {
  const cards = [];
  if (auth.can('settings')) cards.push(accessCard(entries || []));
  cards.push(staffCard(counted), roleTableCard());
  setHTML('usersBox', cards.join(''));
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

export function setAccessStatus(html) {
  setHTML('accessStatus', html);
}

export function showGeneratedCode(created, titre) {
  setAccessStatus(`
    <div class="banner ok">
      <b>${esc(titre || `Accès créé pour ${created.label}`)}</b>
      — rôle ${esc(roleLabel(created.role))}
      <div class="code-row">
        <label class="sr-only" for="newCode">Code d’accès généré</label>
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
