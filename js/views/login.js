import { byId, esc } from '../core/dom.js';
import { isConfigured } from '../config.js';

const HOST = 'login';

function localBox(notice) {
  return `
    <div class="modal">
      <div class="modal-box">
        <h2>Mode local</h2>
        ${notice}
        <p class="mut">
          Aucun dépôt GitHub n’est renseigné dans <code>js/config.js</code>.
          Le site fonctionne, mais les dossiers ne sont stockés que dans cet onglet
          et disparaissent à la fermeture.
        </p>
        <label>Nom de l’examinateur</label>
        <input id="loginName" placeholder="Brigadier LAURENT Cyril">
        <div class="modal-actions">
          <button class="primary" onclick="app.submitLocalLogin()">Continuer en local</button>
        </div>
      </div>
    </div>`;
}

function emptyRosterBox(notice) {
  return `
    <div class="modal">
      <div class="modal-box">
        <h2>Aucun accès déclaré</h2>
        ${notice}
        <p class="mut">
          Le fichier <code>data/access.json</code> est vide ou absent sur la branche
          <code>data</code>. Crée un premier accès avec
          <code>node tools/access.mjs add</code>, ou connecte-toi avec un jeton GitHub
          à portée restreinte.
        </p>
        <label>Jeton GitHub</label>
        <input id="loginCode" type="password" autocomplete="off" placeholder="github_pat_...">
        <div class="modal-actions">
          <button class="primary" onclick="app.submitLogin()">Se connecter</button>
          <button onclick="app.submitReadOnly()">Consulter sans code</button>
        </div>
      </div>
    </div>`;
}

function rosterBox(entries, notice) {
  const options = entries
    .map(entry => `<option value="${esc(entry.id)}">${esc(entry.label)}</option>`)
    .join('');

  return `
    <div class="modal">
      <div class="modal-box">
        <h2>Accès examinateur</h2>
        ${notice}
        <label>Examinateur</label>
        <select id="loginWho">${options}</select>
        <label>Code personnel</label>
        <input id="loginCode" type="password" autocomplete="off" placeholder="BAC-XXXX-XXXX-XXXX">
        <label>
          <input class="inline-check" type="checkbox" id="loginKeep">
          Garder la session jusqu’à la fermeture de cet onglet
        </label>
        <div class="modal-actions">
          <button class="primary" onclick="app.submitLogin()">Se connecter</button>
          <button onclick="app.submitReadOnly()">Consulter sans code</button>
        </div>
        <p class="mut">
          Ton code est personnel. Il ne figure nulle part en clair et ne donne accès
          qu’à ce dépôt. En cas de perte, demande au directeur BAC d’en générer un nouveau.
        </p>
      </div>
    </div>`;
}

export function showLogin(message, entries) {
  const host = byId(HOST);
  if (!host) return;

  const notice = message ? `<div class="banner error">${esc(message)}</div>` : '';

  if (!isConfigured()) {
    host.innerHTML = localBox(notice);
    byId('loginName')?.focus();
    return;
  }

  const list = Array.isArray(entries) ? entries : [];
  host.innerHTML = list.length ? rosterBox(list, notice) : emptyRosterBox(notice);

  const field = byId('loginCode');
  field?.focus();
  field?.addEventListener('keydown', event => {
    if (event.key === 'Enter') window.app.submitLogin();
  });
}

export function hideLogin() {
  const host = byId(HOST);
  if (host) host.innerHTML = '';
}

export function readCredentials() {
  return {
    entryId: byId('loginWho')?.value || '',
    code: byId('loginCode')?.value.trim() || '',
    keep: Boolean(byId('loginKeep')?.checked)
  };
}

export function readLocalName() {
  return byId('loginName')?.value.trim() || '';
}

export function setLoginBusy(busy, label) {
  const box = byId(HOST)?.querySelector('.modal-box');
  if (!box) return;
  box.querySelectorAll('button, input, select').forEach(node => { node.disabled = busy });

  const primary = box.querySelector('button.primary');
  if (primary && label) primary.textContent = label;
}
