// Barre latérale — celle de l'archive V4 : écusson, identité, devise,
// navigation et cartouche citation, avec le même balisage (.identity,
// nav, .navsub, .quote) pour que css/shell.css la peigne à l'identique.

import { byId, esc } from '../core/dom.js';
import { LOGO } from '../data/images.js';
import { kitVar } from './asset.js';
import { visibleNav, isActive, itemHref } from './nav.js';

function navEntry(item, active) {
  const head = `<a class="${isActive(item, active) ? 'active' : ''}" href="${itemHref(item)}">${esc(item.icon)} <span>${esc(item.label)}</span></a>`;
  if (!item.sub) return head;

  const children = item.sub
    .map(child => `<a href="${itemHref(child)}">● ${esc(child.label)}</a>`)
    .join('');

  return `${head}<div class="navsub">${children}</div>`;
}

export function renderSidebar(active) {
  const aside = byId('portalSidebar');
  if (!aside) return;

  aside.innerHTML = `
    <div class="identity">
      <img src="${LOGO.file}" width="130" height="130" alt="Écusson BAC 75 N"
           onerror="this.onerror=null;this.src='${LOGO.fallback}'">
      <small>BRIGADE ANTI-CRIMINALITÉ</small><b>BAC 75 N</b><em>— PRO PATRIA VIGILANT —</em>
    </div>
    <nav>${visibleNav().map(item => navEntry(item, active)).join('')}</nav>
    <div class="quote" style="${kitVar('bg', '12_SIDEBAR_CITATION_BAC75N_NUIT.jpg')}">« PARLER<br>POUR SAUVER<br>DES VIES »<div></div></div>`;
}

/** Conservé pour les gabarits qui l'appellent : la barre de l'archive ne se replie pas. */
export function toggleNav(open) {
  byId('portalSidebar')?.classList.toggle('open', Boolean(open));
}
