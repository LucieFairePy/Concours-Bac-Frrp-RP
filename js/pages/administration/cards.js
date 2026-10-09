// Blocs de la page Administration, au balisage de l'archive V4 : tuiles
// chiffrées (`.grid4` / `.metric`), journal récent (`.contentCard`), et les
// deux vues ouvertes dans la fenêtre modale — journal complet des actions
// sensibles, modules et stockage. Rendu seul : les données sont lues par la
// page (index.js) et passées en paramètre.

import { esc } from '../../core/dom.js';
import { CONFIG, isConfigured } from '../../config.js';
import * as store from '../../core/store.js';
import * as records from '../../core/records.js';
import * as journal from '../../core/journal.js';

/**
 * Les quatre tuiles de l'archive. `figures` vaut null pendant la lecture :
 * les tuiles affichent un tiret, jamais un nombre inventé.
 */
export function metricsCard(figures) {
  const value = key => (figures ? esc(Array.isArray(figures[key]) ? figures[key].length : figures[key]) : '—');
  const alerts = figures ? figures.alerts : [];

  return `<div class="grid4"><div class="metric"><b>${value('open')}</b><small>Dossiers en cours</small></div><div class="metric"><b>${value('correcting')}</b><small>Correction attendue</small></div><div class="metric"><b>${value('closed')}</b><small>Dossiers clôturés</small></div><div class="metric" title="${esc(alerts.join(' • '))}"><b>${value('alerts')}</b><small>Alertes</small></div></div>${alerts.length ? `<p class="hint">Alertes : ${esc(alerts.join(' • '))}</p>` : ''}`;
}

/** Ce que dit une ligne de journal, au format court de l'archive (« BAC-2026-018 clôturé »). */
const VERB = {
  'dossier.cloture': 'clôturé',
  'dossier.rectificatif': 'rectifié',
  'dossier.decision': 'décision retenue',
  'formation.validee': 'validé',
  'acces.creation': 'accès créé',
  'acces.role': 'rôle modifié',
  'acces.retrait': 'accès retiré',
  'direction.maj': 'modifiée',
  'direction.seuils': 'modifiés',
  'direction.bareme': 'modifié',
  'actualite.publication': 'publiée',
  'actualite.retrait': 'retirée',
  'parametres.maj': 'modifiés'
};

function shortLine(line) {
  const date = new Date(line.at).toLocaleDateString('fr-FR');
  const what = line.target
    ? `${line.target} ${VERB[line.action] || journal.actionLabel(line.action).toLowerCase()}`
    : journal.actionLabel(line.action);
  return `<p>${esc(date)} · ${esc(what)} · ${esc(line.who)}</p>`;
}

/** Journal récent : les dernières lignes, comme le bloc de l'archive. */
export function recentCard(lines) {
  const body = !lines
    ? '<p class="hint">Lecture du journal…</p>'
    : lines.length
      ? lines.map(shortLine).join('')
      : '<p>Aucune action enregistrée pour le moment.</p>';

  return `<div class="contentCard" style="margin-top:10px"><h3>JOURNAL RÉCENT</h3>${body}</div>`;
}

/** Journal complet des actions sensibles, mois par mois (fenêtre modale). */
export function journalView(lines, pending, { months, selected }) {
  const tabs = months.map(month => `<button class="btn ${month === selected ? '' : 'dark'}" onclick="app.month('${esc(month)}')">${esc(month)}</button>`).join('');

  const rows = lines.length
    ? lines.map(line => `<tr><td><b>${esc(new Date(line.at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }))}</b></td><td>${esc(line.who)}<br><span class="hint">${esc(line.role)}</span></td><td>${esc(journal.actionLabel(line.action))}</td><td>${esc(line.target || '—')}</td><td>${esc(line.detail || '—')}</td></tr>`).join('')
    : `<tr><td colspan="5" class="emptyhist">${pending ? 'Lecture du journal…' : 'Aucune action enregistrée sur cette période.'}</td></tr>`;

  return `<h2>JOURNAL DES ACTIONS SENSIBLES</h2><p class="hint">Clôtures, versions rectificatives, créations et retraits d’accès, changements de rôle, modifications de la direction. Un fichier par mois dans ${esc(CONFIG.dataDir)}/journal/.</p>${tabs ? `<div class="actions">${tabs}</div>` : ''}<div class="table"><table><thead><tr><th>QUAND</th><th>QUI</th><th>ACTION</th><th>CIBLE</th><th>DÉTAIL</th></tr></thead><tbody class="static">${rows}</tbody></table></div><p class="hint">Écrire au journal ne conditionne jamais l’action : un dossier clôturé reste clôturé même si le journal n’a pas pu être écrit.</p>`;
}

/** Modules et stockage : où vont les dossiers, qui peut écrire (fenêtre modale). */
export function storageView(counts) {
  const rows = records.MODULE_ORDER.map(id => {
    const mod = records.MODULES[id];
    const count = counts[id];
    return `<tr><td><b>${esc(mod.label)}</b></td><td>${esc(CONFIG.dataDir)}/${esc(mod.dir)}/</td><td>${esc(mod.prefix)}-AAAA-NNN</td><td>/${esc(mod.max)}</td><td>${count === null || count === undefined ? '—' : esc(count)}</td></tr>`;
  }).join('');

  const facts = [
    ['DÉPÔT', isConfigured() ? `${CONFIG.owner}/${CONFIG.repo}` : 'non configuré — mode local'],
    ['BRANCHE DE DONNÉES', CONFIG.dataBranch],
    ['PILOTE DE STOCKAGE', store.driverName()],
    ['ÉCRITURE POSSIBLE', store.writable() ? 'oui' : 'non — lecture seule'],
    ['AUTOSAUVEGARDE', `toutes les ${Math.round(CONFIG.autosaveDelay / 1000)} s`],
    ['DURÉE DE SESSION', `${CONFIG.sessionHours} h glissantes`]
  ].map(([label, value]) => `<tr><th>${label}</th><td>${esc(value)}</td></tr>`).join('');

  return `<h2>MODULES ET STOCKAGE</h2><div class="table"><table><thead><tr><th>MODULE</th><th>DOSSIERS</th><th>NUMÉROTATION</th><th>BARÈME</th><th>CLÔTURÉS</th></tr></thead><tbody class="static">${rows}</tbody></table></div><br><div class="table"><table><tbody class="static">${facts}</tbody></table></div><p class="hint">Le site est statique : un rôle limite l’interface, pas l’API. Ce qui rend une dégradation réversible, ce sont la protection des branches (node tools/guard.mjs apply) et la restauration (node tools/restore.mjs rollback).</p>`;
}
