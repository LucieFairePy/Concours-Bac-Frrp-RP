import { byId, esc } from '../core/dom.js';
import { CONFIG, isConfigured } from '../config.js';

const HOST = 'login';

function tokenHelpUrl() {
  return `https://github.com/settings/personal-access-tokens/new`;
}

export function showLogin(message) {
  const host = byId(HOST);
  if (!host) return;

  const notice = message ? `<div class="banner error">${esc(message)}</div>` : '';

  if (!isConfigured()) {
    host.innerHTML = `
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
    byId('loginName')?.focus();
    return;
  }

  host.innerHTML = `
    <div class="modal">
      <div class="modal-box">
        <h2>Accès examinateur</h2>
        ${notice}
        <p class="mut">
          Entre ton code personnel pour écrire dans le dépôt
          <b>${esc(CONFIG.owner)}/${esc(CONFIG.repo)}</b>.
          Chaque examinateur possède son propre code
          (<a href="${tokenHelpUrl()}" target="_blank" rel="noopener">jeton GitHub à portée restreinte</a>,
          droit <i>Contents: read and write</i> sur ce dépôt uniquement).
        </p>
        <label>Code personnel</label>
        <input id="loginCode" type="password" autocomplete="off" placeholder="github_pat_...">
        <label>
          <input class="inline-check" type="checkbox" id="loginKeep">
          Garder le code jusqu’à la fermeture de cet onglet
        </label>
        <div class="modal-actions">
          <button class="primary" onclick="app.submitLogin()">Se connecter</button>
          <button onclick="app.submitReadOnly()">Consulter sans code</button>
        </div>
      </div>
    </div>`;

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

export function readCode() {
  return {
    code: byId('loginCode')?.value.trim() || '',
    keep: Boolean(byId('loginKeep')?.checked)
  };
}

export function readLocalName() {
  return byId('loginName')?.value.trim() || '';
}

export function setLoginBusy(busy) {
  const box = byId(HOST)?.querySelector('.modal-box');
  if (!box) return;
  box.querySelectorAll('button, input').forEach(node => { node.disabled = busy });
}
