// Page Administration — cahier des charges §14 (journalisation) et §15
// (état des données, architecture modulaire).
//
// Trois choses à y voir et rien d'inventé :
//   1. le journal des actions sensibles, mois par mois ;
//   2. l'état réel du stockage : où vont les dossiers, qui peut écrire ;
//   3. l'inventaire des modules et des places d'images encore à livrer.

import { esc, setHTML } from './core/dom.js';
import { CONFIG, isConfigured } from './config.js';
import * as portal from './core/portal.js';
import * as auth from './core/auth.js';
import * as store from './core/store.js';
import * as records from './core/records.js';
import * as journal from './core/journal.js';
import { slots } from './data/images.js';

let selectedMonth = '';
let availableMonths = [];

function storageCard(counts) {
  const rows = records.MODULE_ORDER.map(id => {
    const mod = records.MODULES[id];
    const count = counts[id];
    return `<tr>
      <td><b>${esc(mod.label)}</b></td>
      <td><code>${esc(CONFIG.dataDir)}/${esc(mod.dir)}/</code></td>
      <td><code>${esc(mod.prefix)}-AAAA-NNN</code></td>
      <td>/${esc(mod.max)}</td>
      <td>${count === null ? '<span class="mut">illisible</span>' : esc(count)}</td>
      <td><a href="${mod.page}">ouvrir</a></td>
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

function journalCard(lines, pending) {
  const tabs = availableMonths.length
    ? availableMonths.map(month => `
        <button class="${month === selectedMonth ? 'primary' : ''}"
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

function imagesCard() {
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

async function counts() {
  const out = {};
  await Promise.all(records.MODULE_ORDER.map(async id => {
    try {
      out[id] = (await records.listModule(id)).length;
    } catch (error) {
      out[id] = null;
    }
  }));
  return out;
}

async function paintJournal(pending) {
  let lines = [];
  if (!pending && selectedMonth) {
    try {
      lines = await journal.read(selectedMonth);
    } catch (error) {
      setHTML('journalBox', portal.errorBanner(`Journal illisible : ${error.message}`));
      return;
    }
  }
  setHTML('journalBox', journalCard(lines, pending));
}

const app = {
  async month(value) {
    selectedMonth = value;
    await paintJournal(false);
  }
};

window.app = app;

async function boot() {
  const { session, allowed } = await portal.boot({ active: 'administration', requires: 'accounts' });
  if (!session) return;

  if (!allowed) {
    setHTML('content', portal.deniedCard('accounts'));
    return;
  }

  setHTML('who', esc(auth.describeOperator()));
  portal.setModuleBar(`
    <b>Administration</b>
    <span class="mut">${esc(auth.describeRole())}</span>
    <span class="spacer"></span>
    <a class="pnav-item" href="parametres.html">Paramètres →</a>`);

  setHTML('content', `
    <div id="storageBox"></div>
    <div id="journalBox"></div>
    <div id="imagesBox"></div>`);

  setHTML('imagesBox', imagesCard());
  await paintJournal(true);
  setHTML('storageBox', storageCard(
    Object.fromEntries(records.MODULE_ORDER.map(id => [id, null]))));

  setHTML('storageBox', storageCard(await counts()));

  availableMonths = await journal.months();
  selectedMonth = availableMonths[0] || new Date().toISOString().slice(0, 7);
  await paintJournal(false);
}

boot();
