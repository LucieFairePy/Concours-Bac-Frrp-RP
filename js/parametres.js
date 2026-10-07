// Page Paramètres — documentation technique V4 §13 (direction), §8.6 et
// §11.3 (seuils de suggestion), §17.1 (journal).
//
// Deux réglages partagés, et rien d'autre : la direction BAC et les seuils.
// Les accès et les rôles vivent maintenant sur utilisateurs.html. Chaque
// enregistrement passe au journal : qui, quand, quoi.

import { esc, setHTML } from './core/dom.js';
import { CONFIG } from './config.js';
import { state } from './core/state.js';
import * as store from './core/store.js';
import * as auth from './core/auth.js';
import * as portal from './core/portal.js';
import * as journal from './core/journal.js';
import * as thresholds from './core/thresholds.js';
import {
  renderSettings,
  readSettingsForm,
  readThresholdForm,
  readPhysicalForm,
  setSettingsStatus,
  setThresholdStatus,
  setPhysicalStatus
} from './views/settings.js';

/** Les paramètres partagés, direction et seuils mêlés dans un seul fichier. */
function storedSettings() {
  return { ...CONFIG.defaultCommand, ...thresholds.toSettings(), ...state.settings };
}

const app = {
  async saveSettings() {
    if (!auth.can('settings')) return;

    const next = { ...storedSettings(), ...readSettingsForm() };
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

  async saveThresholds() {
    if (!auth.can('settings')) return;

    const asked = readThresholdForm();
    // apply() remet les valeurs dans l'ordre (une réserve ne peut pas
    // dépasser la réussite) : on enregistre ce qui sera réellement appliqué.
    const applied = thresholds.apply(asked);
    const next = { ...storedSettings(), ...thresholds.toSettings(applied) };

    setThresholdStatus('<div class="banner">Enregistrement…</div>');
    try {
      await store.saveSettings(next);
      state.settings = next;
      renderSettings();
      setThresholdStatus(portal.okBanner(
        `Seuils enregistrés — concours ${applied.bac.retenu}/${applied.bac.reserve}, `
        + `Chef de Groupe ${applied.cdg.qualifie}/${applied.cdg.reserve}/${applied.cdg.ajourne}.`));
      await journal.record({
        who: auth.describeOperator(),
        role: auth.role(),
        action: 'direction.seuils',
        target: 'seuils de suggestion',
        detail: `concours ${applied.bac.retenu}/${applied.bac.reserve} • `
          + `CDG ${applied.cdg.qualifie}/${applied.cdg.reserve}/${applied.cdg.ajourne}`
      });
    } catch (error) {
      setThresholdStatus(portal.errorBanner(`Échec : ${error.message}`));
    }
  },

  async savePhysical() {
    if (!auth.can('settings')) return;

    const applied = thresholds.apply({ ...thresholds.toSettings(), ...readPhysicalForm() });
    const next = { ...storedSettings(), ...thresholds.toSettings(applied) };

    setPhysicalStatus('<div class="banner">Enregistrement…</div>');
    try {
      await store.saveSettings(next);
      state.settings = next;
      renderSettings();
      setPhysicalStatus(portal.okBanner('Barème physique enregistré pour les prochaines corrections.'));
      await journal.record({
        who: auth.describeOperator(),
        role: auth.role(),
        action: 'direction.bareme',
        target: 'barème physique',
        detail: thresholds.PHYSICAL_MEASURES
          .map(measure => `${measure.id} ${applied.physical[measure.id].fort}/`
            + `${applied.physical[measure.id].bon}/${applied.physical[measure.id].base}`)
          .join(' • ')
      });
    } catch (error) {
      setPhysicalStatus(portal.errorBanner(`Échec : ${error.message}`));
    }
  },

  resetPhysical() {
    const base = thresholds.defaults();
    thresholds.apply(thresholds.toSettings(base));
    renderSettings();
    setPhysicalStatus('<div class="banner">Barème du kit rétabli — pense à enregistrer.</div>');
  },

  resetThresholds() {
    thresholds.apply(thresholds.toSettings(thresholds.defaults()));
    renderSettings();
    setThresholdStatus('<div class="banner">Valeurs du kit rétablies — pense à enregistrer.</div>');
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
    ${auth.can('accounts') ? '<a class="pnav-item" href="utilisateurs.html">Gestion utilisateurs →</a>' : ''}
    ${auth.can('accounts') ? '<a class="pnav-item" href="administration.html">Administration →</a>' : ''}`);

  renderSettings();
}

boot();
