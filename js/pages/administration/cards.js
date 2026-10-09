// Cartes de la page Administration : modules et stockage, journal des
// actions sensibles, banque d'images, actualités. Rendu seul : les données
// sont lues par la page (index.js) et passées en paramètre.

import { esc } from '../../core/dom.js';
import { CONFIG, isConfigured } from '../../config.js';
import * as auth from '../../core/auth.js';
import * as store from '../../core/store.js';
import * as records from '../../core/records.js';
import * as journal from '../../core/journal.js';
import { href } from '../../routes.js';
import { slots, IMAGE_SLOTS } from '../../data/images.js';
import { NEWS_VISIBILITY } from '../../data/news.js';

/**
 * Les quatre tuiles de la maquette V4. `figures` vaut null pendant la
 * lecture : les tuiles affichent alors un tiret, jamais un nombre inventé.
 */
export function metricsCard(figures) {
  const value = key => (figures ? esc(Array.isArray(figures[key]) ? figures[key].length : figures[key]) : '—');
  const alerts = figures ? figures.alerts : [];

  const tile = (key, label, hint, extra = '') => `
    <div class="pmetric ${extra}" title="${esc(hint)}">
      <b>${value(key)}</b>
      <small>${label}</small>
    </div>`;

  return `
    <div class="pmetrics">
      ${tile('open', 'Dossiers en cours', 'Brouillons ouverts, tous modules et tous examinateurs')}
      ${tile('correcting', 'Correction attendue', 'Brouillons dont la correction a commencé, pas encore clôturés')}
      ${tile('closed', 'Dossiers clôturés', 'Dossiers clôturés dans l’historique, tous modules')}
      ${tile('alerts', 'Alertes', alerts.length ? alerts.join(' • ') : 'Historiques et brouillons lisibles', alerts.length ? 'alert' : '')}
    </div>
    ${alerts.length ? `<p class="phint">Alertes : ${esc(alerts.join(' • '))}</p>` : ''}`;
}

/** Journal récent : les dernières lignes, au format court de la maquette. */
export function recentCard(lines) {
  const body = !lines
    ? '<p class="pempty">Lecture du journal…</p>'
    : lines.length
      ? lines.map(line => `
          <p>
            ${esc(new Date(line.at).toLocaleDateString('fr-FR'))}
            · ${line.target ? `${esc(line.target)} — ` : ''}${esc(journal.actionLabel(line.action))}
            · ${esc(line.who)}
          </p>`).join('')
      : '<p class="pempty">Aucune action enregistrée pour le moment.</p>';

  return `
    <div class="pcontent pjournal">
      <h3>Journal récent</h3>
      ${body}
    </div>`;
}

export function storageCard(counts) {
  const rows = records.MODULE_ORDER.map(id => {
    const mod = records.MODULES[id];
    const count = counts[id];
    return `<tr>
      <td><b>${esc(mod.label)}</b></td>
      <td><code>${esc(CONFIG.dataDir)}/${esc(mod.dir)}/</code></td>
      <td><code>${esc(mod.prefix)}-AAAA-NNN</code></td>
      <td>/${esc(mod.max)}</td>
      <td>${count === null ? '<span class="mut">illisible</span>' : esc(count)}</td>
      <td><a href="${href(mod.route)}">ouvrir</a></td>
    </tr>`;
  }).join('');

  return `
    <div class="card">
      <h2>Modules et stockage</h2>
      <p class="mut">
        Un module = une entrée dans <code>js/core/records.js</code>. L’historique
        central, la numérotation, les brouillons et la lecture seule suivent sans
        qu’il faille les reconstruire.
      </p>
      <div class="htable-wrap">
        <table class="htable">
          <tr><th>Module</th><th>Dossiers</th><th>Numérotation</th><th>Barème</th><th>Clôturés</th><th></th></tr>
          ${rows}
        </table>
      </div>
      <table>
        <tr><th>Dépôt</th><td>${isConfigured() ? `<code>${esc(CONFIG.owner)}/${esc(CONFIG.repo)}</code>` : 'non configuré — mode local'}</td></tr>
        <tr><th>Branche de données</th><td><code>${esc(CONFIG.dataBranch)}</code></td></tr>
        <tr><th>Pilote de stockage</th><td><code>${esc(store.driverName())}</code></td></tr>
        <tr><th>Écriture possible</th><td>${store.writable() ? 'oui' : 'non — lecture seule'}</td></tr>
        <tr><th>Autosauvegarde</th><td>toutes les ${esc(Math.round(CONFIG.autosaveDelay / 1000))} s</td></tr>
        <tr><th>Durée de session</th><td>${esc(CONFIG.sessionHours)} h glissantes</td></tr>
      </table>
      <div class="warn">
        <b>Ce que ce socle ne protège pas.</b> Le site est statique : le jeton
        d’écriture est le même pour tous les codes. Un rôle limite l’interface,
        pas l’API. Ce qui rend une dégradation réversible, ce sont la protection
        des branches (<code>node tools/guard.mjs apply</code>) et la restauration
        (<code>node tools/restore.mjs rollback</code>), pas cette page.
      </div>
    </div>`;
}

export function journalCard(lines, pending, { months, selected }) {
  const tabs = months.length
    ? months.map(month => `
        <button class="${month === selected ? 'primary' : ''}"
                onclick="app.month('${esc(month)}')">${esc(month)}</button>`).join('')
    : '';

  const rows = lines.length
    ? lines.map(line => `
        <tr>
          <td class="hid">${esc(new Date(line.at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }))}</td>
          <td>${esc(line.who)}<br><span class="mut">${esc(line.role)}</span></td>
          <td><b>${esc(journal.actionLabel(line.action))}</b></td>
          <td>${esc(line.target || '—')}</td>
          <td>${esc(line.detail || '—')}</td>
        </tr>`).join('')
    : `<tr><td colspan="5" class="pempty">${pending
        ? 'Lecture du journal…'
        : 'Aucune action enregistrée sur cette période.'}</td></tr>`;

  return `
    <div class="card">
      <h2>Journal des actions sensibles</h2>
      <p class="mut">
        Clôtures, versions rectificatives, créations et retraits d’accès,
        changements de rôle, modifications de la direction. Un fichier par mois
        dans <code>${esc(CONFIG.dataDir)}/journal/</code>.
      </p>
      <div class="tabs">${tabs}</div>
      <div class="htable-wrap">
        <table class="htable">
          <tr><th>Quand</th><th>Qui</th><th>Action</th><th>Cible</th><th>Détail</th></tr>
          ${rows}
        </table>
      </div>
      <p class="mut">
        Écrire au journal ne conditionne jamais l’action : un dossier clôturé reste
        clôturé même si le journal n’a pas pu être écrit, et la page qui a agi le
        signale alors à l’écran.
      </p>
    </div>`;
}

export function imagesCard() {
  const rows = slots().map(slot => `
    <tr>
      <td><code>${esc(slot.id)}</code></td>
      <td><code>${esc(slot.file)}</code></td>
      <td>${esc(slot.attendu)}</td>
      <td><code>${esc(slot.repli)}</code></td>
    </tr>`).join('');

  return `
    <div class="card">
      <h2>Banque d’images — places à livrer</h2>
      <p class="mut">
        Le cahier des charges interdit de remplacer la banque d’images BAC par des
        visuels génériques. Ces places attendent donc les photos du commanditaire :
        déposer le fichier au nom indiqué suffit, il prend la place du repli au
        chargement suivant, sans toucher au code.
      </p>
      <div class="htable-wrap">
        <table class="htable">
          <tr><th>Place</th><th>Fichier attendu</th><th>Sujet</th><th>Repli actuel</th></tr>
          ${rows}
        </table>
      </div>
    </div>`;
}

/** §18.1 — le panneau Actualités de l'accueil lit ce que cette carte écrit. */
export function newsCard(newsState) {
  const allowed = auth.can('settings');

  const rows = newsState.items.length
    ? newsState.items.map(item => `
        <tr>
          <td class="hid">${esc(String(item.publishedAt).slice(0, 10))}</td>
          <td>
            <b>${esc(item.title)}</b><br>
            <span class="mut">${esc(item.sector || '—')} • ${esc(item.author || '—')}</span>
          </td>
          <td>${esc(NEWS_VISIBILITY[item.visibility].label)}</td>
          <td class="row-actions">
            <a class="pnav-item" href="${href('actualites', { actu: item.id })}">Lire</a>
            ${allowed ? `<button class="danger" onclick="app.removeNews('${esc(item.id)}')">Retirer</button>` : ''}
          </td>
        </tr>`).join('')
    : '<tr><td colspan="4" class="pempty">Aucune actualité publiée.</td></tr>';

  const assets = Object.keys(IMAGE_SLOTS)
    .map(id => `<option value="${esc(id)}" ${id === 'actualite-nuit' ? 'selected' : ''}>${esc(id)}</option>`)
    .join('');

  const visibilities = Object.values(NEWS_VISIBILITY)
    .map(item => `<option value="${esc(item.id)}">${esc(item.label)}</option>`)
    .join('');

  const form = allowed
    ? `
      <h3>Publier une actualité</h3>
      <div class="row">
        <div class="c6">
          <label for="naTitle">Titre</label>
          <input id="naTitle" placeholder="Dispositif de contrôle renforcé">
        </div>
        <div class="c3">
          <label for="naSector">Secteur</label>
          <input id="naSector" placeholder="Secteur Nord — nuit">
        </div>
        <div class="c3">
          <label for="naImage">Image</label>
          <select id="naImage">${assets}</select>
        </div>
        <div class="c12">
          <label for="naExcerpt">Résumé affiché sur l’accueil</label>
          <input id="naExcerpt" placeholder="Une phrase, pas plus.">
        </div>
        <div class="c12">
          <label for="naBody">Contenu</label>
          <textarea id="naBody" placeholder="Le texte complet de l’actualité."></textarea>
        </div>
        <div class="c6">
          <label for="naAuthor">Signée par</label>
          <input id="naAuthor" value="Direction BAC 75 N">
        </div>
        <div class="c6">
          <label for="naVisibility">Visibilité</label>
          <select id="naVisibility">${visibilities}</select>
        </div>
      </div>
      <button class="primary" onclick="app.publishNews()">Publier</button>`
    : '<p class="mut">Publier une actualité demande le droit « paramètres ».</p>';

  return `
    <div class="card">
      <h2>Actualités BAC 75 N</h2>
      <p class="mut">
        Les trois plus récentes alimentent le panneau Actualités de l’accueil.
        Une actualité « direction » n’est visible que des rôles portant le droit
        « paramètres ».
        ${newsState.seeded ? 'Pour l’instant, ce sont les actualités de départ du kit.' : ''}
      </p>
      <div class="htable-wrap">
        <table class="htable">
          <tr><th>Date</th><th>Titre</th><th>Visibilité</th><th></th></tr>
          ${rows}
        </table>
      </div>
      ${form}
      <div id="newsStatus"></div>
    </div>`;
}
