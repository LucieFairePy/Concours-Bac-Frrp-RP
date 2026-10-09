// Page Gestion des utilisateurs — affichage, au gabarit de l'archive V4
// (app.js, `users()`) : le tableau UTILISATEUR / GRADE / FONCTION / RÔLE
// SITE / STATUT. Pour les rôles qui portent le droit « paramètres », le
// rôle se change dans le tableau, un accès se retire, et un panneau permet
// d'en créer un. Les actions elles-mêmes vivent dans index.js et passent
// toutes par le journal.

import { byId, setHTML, esc } from '../../core/dom.js';
import * as auth from '../../core/auth.js';
import { ROLE_ORDER, ROLES, roleLabel } from '../../core/roles.js';
import { identity } from '../../core/roster.js';

/** La fonction affichée pour chaque rôle, au vocabulaire de l'archive. */
const FONCTION = {
  admin: 'Administrateur du site',
  directeur: 'Directeur BAC',
  adjoint: 'Directeur adjoint BAC',
  formateur: 'Formateur',
  lecture: 'Agent'
};

function roleSelect(entry) {
  const options = ROLE_ORDER
    .map(id => `<option value="${id}" ${entry.role === id ? 'selected' : ''}>${esc(ROLES[id].label)}</option>`)
    .join('');

  return `<select aria-label="Rôle site" onchange="app.setAccessRole('${esc(entry.id)}',this.value)">${options}</select>`;
}

/** Une ligne au gabarit de l'archive : utilisateur, grade, fonction, rôle, statut. */
function rosterRow(entry, selfId, manage) {
  const who = identity(entry);
  const self = entry.id === selfId;

  const role = manage && !self ? roleSelect(entry) : esc(roleLabel(entry.role));
  const state = self ? '<span class="status info">SESSION EN COURS</span>' : '<span class="status">ACTIF</span>';
  const remove = manage
    ? `<td>${self ? '' : `<button class="link" onclick="app.removeAccess('${esc(entry.id)}')">RETIRER</button>`}</td>`
    : '';

  return `<tr><td>${esc(who.name || entry.label)}</td><td>${esc(who.grade || '—')}</td><td>${esc(FONCTION[entry.role] || '—')}</td><td>${role}</td><td>${state}</td>${remove}</tr>`;
}

function addCard() {
  const newRoles = ROLE_ORDER
    .map(id => `<option value="${id}" ${id === 'formateur' ? 'selected' : ''}>${esc(ROLES[id].label)}</option>`)
    .join('');

  return `<div class="contentCard" style="margin-top:10px"><h3>AJOUTER UNE PERSONNE</h3><div class="formgrid three"><div class="field"><label for="newGrade">GRADE</label><input id="newGrade" placeholder="Brigadier"></div><div class="field"><label for="newName">NOM ET PRÉNOM</label><input id="newName" placeholder="LAURENT Cyril"></div><div class="field"><label for="newRole">RÔLE SITE</label><select id="newRole">${newRoles}</select></div></div><div class="actions"><button class="btn" onclick="app.createAccess()">GÉNÉRER L’ACCÈS</button></div><div id="accessStatus"></div><p class="hint">Changer le rôle d’une personne régénère son code : l’ancien cesse de fonctionner et le nouveau s’affiche une seule fois. Le code n’est stocké nulle part en clair.</p></div>`;
}

export function renderUsers(entries) {
  const manage = auth.can('settings');
  const selfId = auth.current() ? auth.current().login : '';
  const list = entries || [];

  const rows = list.length
    ? list.map(entry => rosterRow(entry, selfId, manage)).join('')
    : `<tr><td colspan="${manage ? 6 : 5}" class="emptyhist">Aucun accès enregistré.</td></tr>`;

  setHTML('usersBox', `<div class="table"><table><thead><tr><th>UTILISATEUR</th><th>GRADE</th><th>FONCTION</th><th>RÔLE SITE</th><th>STATUT</th>${manage ? '<th></th>' : ''}</tr></thead><tbody class="static">${rows}</tbody></table></div>${manage ? addCard() : ''}`);
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
  setAccessStatus(`<div class="banner ok"><b>${esc(titre || `Accès créé pour ${created.label}`)}</b> — rôle ${esc(roleLabel(created.role))}<label class="sr-only" for="newCode">Code d’accès généré</label><input id="newCode" readonly value="${esc(created.code)}"><button class="btn" onclick="app.copyCode()">COPIER</button><p class="hint">Transmets ce code par un canal privé. Il n’est stocké nulle part en clair et ne pourra pas être réaffiché. L’ancien code de cette personne, s’il existait, ne fonctionne plus.</p></div>`);

  const field = byId('newCode');
  if (field) {
    field.focus();
    field.select();
  }
}
