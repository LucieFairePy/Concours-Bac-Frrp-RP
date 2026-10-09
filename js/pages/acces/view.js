import { byId, esc } from '../../core/dom.js';
import { CONFIG } from '../../config.js';

const HOST = 'gate';

export function showLoading(message) {
  const host = byId(HOST);
  if (host) host.innerHTML = `<p class="mut gate-loading">${esc(message)}</p>`;
}

export function showLocal(notice) {
  const host = byId(HOST);
  if (!host) return;

  host.innerHTML = `
    ${notice}
    <p class="mut">
      Aucun dépôt GitHub n’est renseigné dans <code>js/config.js</code>.
      Le site fonctionne, mais les dossiers ne sont stockés que dans cet onglet
      et disparaissent à la fermeture.
    </p>
    <label for="gateName">Nom de l’examinateur</label>
    <input id="gateName" placeholder="Brigadier LAURENT Cyril">
    <button class="primary gate-submit" onclick="gate.submitLocal()">Continuer en local</button>`;

  byId('gateName')?.focus();
}

export function showBootstrap(notice) {
  const host = byId(HOST);
  if (!host) return;

  host.innerHTML = `
    ${notice}
    <h3>Aucun accès déclaré</h3>
    <p class="mut">
      Le fichier <code>data/access.json</code> est vide ou absent sur la branche
      <code>${esc(CONFIG.dataBranch)}</code>. Crée un premier accès avec
      <code>node tools/access.mjs add</code>, ou connecte-toi avec un jeton GitHub
      à portée restreinte.
    </p>
    <label for="gateCode">Jeton GitHub</label>
    <input id="gateCode" type="password" autocomplete="off" placeholder="github_pat_...">
    <button class="primary gate-submit" onclick="gate.submit()">Se connecter</button>`;

  bindEnter();
}

export function showForm(entries, notice) {
  const host = byId(HOST);
  if (!host) return;

  const options = entries
    .map(entry => `<option value="${esc(entry.id)}">${esc(entry.label)}</option>`)
    .join('');

  host.innerHTML = `
    ${notice}
    <label for="gateWho">Examinateur</label>
    <select id="gateWho">${options}</select>

    <label for="gateCode">Code personnel</label>
    <input id="gateCode" type="password" autocomplete="off" placeholder="BAC-XXXX-XXXX-XXXX">

    <button class="primary gate-submit" onclick="gate.submit()">Se connecter</button>

    <p class="mut gate-note">
      La session reste ouverte ${esc(CONFIG.sessionHours)} h sur cet appareil, puis le
      code est redemandé. Ton code est personnel : il ne figure nulle part en clair.
      En cas de perte, demande au directeur BAC d’en générer un nouveau.
    </p>`;

  byId('gateCode')?.focus();
  bindEnter();
}

function bindEnter() {
  const field = byId('gateCode');
  field?.addEventListener('keydown', event => {
    if (event.key === 'Enter') window.gate.submit();
  });
}

export function notice(message, tone = 'error') {
  return message ? `<div class="banner ${tone}">${esc(message)}</div>` : '';
}

export function readForm() {
  return {
    entryId: byId('gateWho')?.value || '',
    code: byId('gateCode')?.value.trim() || ''
  };
}

export function readName() {
  return byId('gateName')?.value.trim() || '';
}

export function setBusy(busy, label) {
  const host = byId(HOST);
  if (!host) return;

  host.querySelectorAll('button, input, select').forEach(node => { node.disabled = busy; });

  const submit = host.querySelector('.gate-submit');
  if (submit && label) submit.textContent = label;
}
