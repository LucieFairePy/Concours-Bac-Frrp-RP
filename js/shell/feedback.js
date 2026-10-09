// Retours visibles par l'examinateur : état d'enregistrement dans
// l'en-tête, bandeaux d'information, barre du module, refus d'accès.

import { byId, esc, setHTML } from '../core/dom.js';
import { href } from '../routes.js';
import * as auth from '../core/auth.js';

export function setSync(text, tone) {
  const node = byId('sync');
  if (!node) return;
  node.textContent = text || '';
  node.style.color = tone === 'error' ? 'var(--red)' : tone === 'ok' ? '#55e8a0' : 'var(--mut)';
}

export function setBanner(html, hostId = 'banner') {
  setHTML(hostId, html || '');
}

export function errorBanner(message) {
  return `<div class="banner error">${esc(message)}</div>`;
}

export function okBanner(message) {
  return `<div class="banner ok">${esc(message)}</div>`;
}

/**
 * Actions de la page. Un module plein écran les reçoit dans sa propre
 * barre (#pageActions) ; une page du portail, dans la barre sous l'en-tête.
 */
export function setModuleBar(html) {
  if (byId('pageActions')) {
    setHTML('pageActions', html || '');
    return;
  }
  setHTML('moduleBar', html ? `<div class="pmodulebar no-print">${html}</div>` : '');
}

export function deniedCard(permission) {
  return `
    <div class="page">
      <div class="contentCard" style="margin-top:12px">
        <h3>ACCÈS NON AUTORISÉ</h3>
        <p>
          Ton rôle (<b>${esc(auth.describeRole())}</b>) ne donne pas accès à cette page.
          Demande au Directeur BAC ou à son adjoint de faire évoluer ton accès
          depuis la page Gestion des utilisateurs.
        </p>
        <p class="hint">Permission requise : ${esc(permission)}.</p>
        <div class="actions"><a class="btn dark" href="${href('accueil')}">RETOUR À L’ACCUEIL</a></div>
      </div>
    </div>`;
}
