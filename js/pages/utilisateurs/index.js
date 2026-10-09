// Page Gestion utilisateurs — documentation technique V4 §4.1, §17 et
// §17.1 (journal des actions sensibles).
//
// Créer un accès, changer un rôle, retirer un accès : trois actions
// sensibles, trois lignes de journal. Chacune demande confirmation avant
// d'agir, parce qu'aucune n'est réversible sans régénérer un code.
//
// La page a le gabarit de l'archive V4 (bannière, tableau des comptes) ;
// les effectifs comptés sur ces accès s'affichent sur l'accueil.

import { byId } from '../../core/dom.js';
import * as portal from '../../shell/index.js';
import * as auth from '../../core/auth.js';
import * as roster from '../../core/roster.js';
import * as journal from '../../core/journal.js';
import { roleLabel } from '../../core/roles.js';
import {
  renderUsers,
  readNewAccessForm,
  clearNewAccessForm,
  setAccessStatus,
  showGeneratedCode
} from './view.js';

async function paint(entries) {
  renderUsers(entries);
}

async function reload() {
  const entries = await roster.list();
  await paint(entries);
  return entries;
}

const handlers = {
  async createAccess() {
    if (!auth.can('settings')) return;

    const form = readNewAccessForm();
    setAccessStatus('<div class="banner">Création de l’accès…</div>');

    try {
      const created = await roster.createEntry(form);
      await auth.loadRoster(true);
      clearNewAccessForm();
      await reload();
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
      await paint(entries);
      return;
    }

    setAccessStatus('<div class="banner">Mise à jour de l’accès…</div>');
    try {
      const updated = await roster.setRole(id, role);
      await reload();
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
      await reload();
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

export default {
  handlers,

  template() {
    return `<div class="page"><div class="sectionHero" style="--bg:none"><div><small>COMPTES &amp; PERMISSIONS</small><h1>GESTION DES UTILISATEURS</h1><p>Exemple des niveaux d’accès prévus pour la version serveur.</p></div></div><div id="usersBox"></div></div>`;
  },

  async mount() {
    // Première passe avec ce qui est déjà en cache, pour que la page ne
    // reste pas vide pendant la lecture du dépôt.
    const known = roster.cached();
    await paint(known ? known.entries.map(entry => ({
      id: entry.id,
      label: entry.label,
      grade: entry.grade || '',
      role: entry.role || 'formateur'
    })) : []);

    try {
      await reload();
    } catch (error) {
      setAccessStatus(portal.errorBanner(`Liste des accès illisible : ${error.message}`));
    }
  }
};
