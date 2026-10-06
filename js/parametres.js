// Page Paramètres — cahier des charges §13 et §14.
//
// Direction BAC, accès et rôles, profil. Chaque action sensible passe au
// journal : qui, quand, sur qui.

import { byId, esc, setHTML } from './core/dom.js';
import { CONFIG } from './config.js';
import { state } from './core/state.js';
import * as store from './core/store.js';
import * as auth from './core/auth.js';
import * as roster from './core/roster.js';
import * as portal from './core/portal.js';
import * as journal from './core/journal.js';
import { roleLabel } from './core/roles.js';
import {
  renderSettings,
  readSettingsForm,
  setSettingsStatus,
  readNewAccessForm,
  clearNewAccessForm,
  setAccessStatus,
  showGeneratedCode
} from './views/settings.js';

async function paintRoster() {
  // Première passe avec le cache, pour que la page ne reste pas vide
  // pendant la lecture du dépôt.
  const known = roster.cached();
  renderSettings(known ? known.entries.map(entry => ({
    id: entry.id,
    label: entry.label,
    role: entry.role || 'formateur'
  })) : []);

  if (!auth.can('settings')) return;

  try {
    renderSettings(await roster.list());
  } catch (error) {
    setAccessStatus(portal.errorBanner(`Liste des accès illisible : ${error.message}`));
  }
}

const app = {
  async saveSettings() {
    if (!auth.can('settings')) return;

    const next = readSettingsForm();
    setSettingsStatus('<div class="banner">Enregistrement…</div>');
    try {
      await store.saveSettings(next);
      state.settings = next;
      setSettingsStatus(portal.okBanner('Paramètres enregistrés pour les prochains dossiers.'));
      await journal.record({
        who: auth.describeOperator(),
        role: auth.role(),
        action: 'direction.maj',
        target: 'direction BAC',
        detail: `${next.dg} ${next.dn} — adjoint ${next.ag} ${next.an}`
      });
    } catch (error) {
      setSettingsStatus(portal.errorBanner(`Échec : ${error.message}`));
    }
  },

  async createAccess() {
    if (!auth.can('settings')) return;

    const form = readNewAccessForm();
    setAccessStatus('<div class="banner">Création de l’accès…</div>');

    try {
      const created = await roster.createEntry(form);
      await auth.loadRoster(true);
      clearNewAccessForm();
      renderSettings(await roster.list());
      showGeneratedCode(created);
      await journal.record({
        who: auth.describeOperator(),
        role: auth.role(),
        action: 'acces.creation',
        target: created.label,
        detail: `rôle ${roleLabel(created.role)}`
      });
    } catch (error) {
      setAccessStatus(portal.errorBanner(error.message));
    }
  },

  async setAccessRole(id, role) {
    if (!auth.can('settings')) return;

    const entries = await roster.list();
    const entry = entries.find(item => item.id === id);
    if (!entry) return;
    if (entry.role === role) return;

    const confirmed = window.confirm(
      `Donner à ${entry.label} le rôle « ${roleLabel(role)} » ?\n\n`
      + 'Un nouveau code sera généré et l’ancien cessera de fonctionner.'
    );

    if (!confirmed) {
      renderSettings(entries);
      return;
    }

    setAccessStatus('<div class="banner">Mise à jour de l’accès…</div>');
    try {
      const updated = await roster.setRole(id, role);
      renderSettings(await roster.list());
      showGeneratedCode(updated, `Nouveau code pour ${updated.label}`);
      await journal.record({
        who: auth.describeOperator(),
        role: auth.role(),
        action: 'acces.role',
        target: updated.label,
        detail: `${roleLabel(entry.role)} → ${roleLabel(updated.role)}`
      });
    } catch (error) {
      setAccessStatus(portal.errorBanner(error.message));
    }
  },

  async removeAccess(id) {
    if (!auth.can('settings')) return;

    const entries = await roster.list();
    const entry = entries.find(item => item.id === id);
    if (!entry) return;

    if (!window.confirm(`Retirer l’accès de ${entry.label} ? Son code cessera de fonctionner.`)) return;

    setAccessStatus('<div class="banner">Retrait en cours…</div>');
    try {
      const label = await roster.removeEntry(id);
      await auth.loadRoster(true);
      renderSettings(await roster.list());
      setAccessStatus(portal.okBanner(`Accès retiré : ${label}`));
      await journal.record({
        who: auth.describeOperator(),
        role: auth.role(),
        action: 'acces.retrait',
        target: label,
        detail: `rôle retiré : ${roleLabel(entry.role)}`
      });
    } catch (error) {
      setAccessStatus(portal.errorBanner(error.message));
    }
  },

  async copyCode() {
    const field = byId('newCode');
    if (!field) return;

    field.focus();
    field.select();

    try {
      await navigator.clipboard.writeText(field.value);
      portal.setSync('code copié', 'ok');
    } catch (error) {
      portal.setSync('copie refusée — le code est sélectionné, fais Ctrl+C', 'error');
    }
  }
};

window.app = app;

async function boot() {
  const { session } = await portal.boot({ active: 'parametres' });
  if (!session) return;

  setHTML('who', esc(auth.describeOperator()));
  portal.setModuleBar(`
    <b>Paramètres</b>
    <span class="mut">${esc(auth.describeRole())}</span>
    <span class="spacer"></span>
    ${auth.can('accounts') ? '<a class="pnav-item" href="administration.html">Administration →</a>' : ''}`);

  try {
    const stored = await store.loadSettings();
    if (stored) state.settings = { ...CONFIG.defaultCommand, ...stored };
  } catch (error) {
    portal.setBanner(portal.errorBanner(`Paramètres illisibles : ${error.message}`));
  }

  await paintRoster();
}

boot();
