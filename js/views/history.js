import { esc, setHTML } from '../core/dom.js';
import { DECISION_LABEL } from '../scoring/totals.js';
import * as store from '../core/store.js';

function row(entry) {
  const name = `${String(entry.last || '').toUpperCase()} ${entry.first || ''}`.trim();
  const decision = entry.decision ? DECISION_LABEL[entry.decision] || entry.decision : '—';
  const total = entry.total === null || entry.total === undefined ? '—' : `${entry.total}/1000`;
  return `<tr>
    <td>${esc(entry.id)}</td>
    <td>${esc(name || '—')}</td>
    <td>${esc(entry.date || '—')}</td>
    <td>${esc(total)}</td>
    <td>${esc(decision)}</td>
    <td><button onclick="app.openClosed('${esc(entry.id)}')">Ouvrir</button></td>
  </tr>`;
}

export async function renderHistory() {
  setHTML('histList', '<p class="mut">Chargement des dossiers clôturés…</p>');

  let entries;
  try {
    entries = await store.listClosed();
  } catch (error) {
    setHTML('histList', `<div class="banner error">Lecture impossible : ${esc(error.message)}</div>`);
    return;
  }

  if (!entries.length) {
    setHTML('histList', '<p class="mut">Aucun dossier clôturé.</p>');
    return;
  }

  setHTML('histList', `
    <table>
      <tr><th>N°</th><th>Candidat</th><th>Date</th><th>Total</th><th>Décision</th><th></th></tr>
      ${entries.map(row).join('')}
    </table>`);
}
