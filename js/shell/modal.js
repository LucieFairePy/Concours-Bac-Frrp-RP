// Fenêtre modale du portail — la `#modal` de l'archive V4 : voile noir,
// boîte de 860 px liserée, croix en haut à droite. Une seule pour tout le
// portail, posée dans #portalModal (index.html) ; elle se ferme à la croix,
// d'un clic sur le voile, à Échap ou en changeant de page.

import { setHTML } from '../core/dom.js';

let onKey = null;

export function openModal(html) {
  setHTML('portalModal', `
    <div class="page pmback" onclick="if(event.target===this)portal.closeModal()">
      <div class="modalbox" role="dialog" aria-modal="true">
        <button class="x" type="button" aria-label="Fermer" onclick="portal.closeModal()">×</button>
        <div id="modalcontent">${html}</div>
      </div>
    </div>`);

  if (!onKey && typeof document !== 'undefined' && document.addEventListener) {
    onKey = event => { if (event.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
  }
}

export function closeModal() {
  setHTML('portalModal', '');
  if (onKey && typeof document !== 'undefined' && document.removeEventListener) {
    document.removeEventListener('keydown', onKey);
  }
  onKey = null;
}
