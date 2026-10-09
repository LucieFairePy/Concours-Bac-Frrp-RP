// Page Gestion utilisateurs — documentation technique V4 §4.1, §17 et
// §17.1 (journal des actions sensibles).
//
// Créer un accès, changer un rôle, retirer un accès : trois actions
// sensibles, trois lignes de journal. Chacune demande confirmation avant
// d'agir, parce qu'aucune n'est réversible sans régénérer un code.
//
// Le comptage des effectifs vit sur la même page : il est calculé sur les
// accès affichés juste au-dessus, et pas sur une liste écrite à la main.

import { byId, esc, setHTML } from '../../core/dom.js';
import * as portal from '../../shell/index.js';
import { href } from '../../routes.js';
import * as auth from '../../core/auth.js';
import * as roster from '../../core/roster.js';
import * as journal from '../../core/journal.js';
import * as effectifs from '../../core/effectifs.js';
import { roleLabel } from '../../core/roles.js';
import {
  renderUsers,
  readNewAccessForm,
  clearNewAccessForm,
  setAccessStatus,
  showGeneratedCode
} from './view.js';

let counted = null;

async function paint(entries) {
  renderUsers(entries, counted);
}

/** Recompte les effectifs puis repeint, sans bloquer l'affichage des accès. */
async function refresh(entries) {
  await paint(entries);
  try {
    counted = await effectifs.counts();
  } catch (error) {
    counted = { readable: false, error: error.message, lines: [], total: 0 };
  }
  await paint(entries);
}

async function reload() {
  const entries = await roster.list();
  await refresh(entries);
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
    return `
      <div class="hero" data-img="unite">
        <div class="flag"></div>
        <small class="hero-kicker no-print">Gestion du portail</small>
        <h1>Gestion des utilisateurs</h1>
        <div class="mut">Accès et rôles • effectifs BAC 75 N • ce que chaque rôle permet</div>
      </div>
      <div id="usersBox"></div>`;
  },

  async mount() {
    counted = null;
    portal.setModuleBar(`
      <b>Gestion utilisateurs</b>
      <span class="mut">${esc(auth.describeRole())}</span>
      <span class="spacer"></span>
      <a class="pnav-item" href="${href('parametres')}">Paramètres →</a>
      <a class="pnav-item" href="${href('administration')}">Administration →</a>`);

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
