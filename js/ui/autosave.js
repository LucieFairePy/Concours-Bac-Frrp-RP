// Enregistrement automatique d'un brouillon — commun au concours, aux
// formations et à l'examen Chef de Groupe.
//
// Une saisie marque le dossier « modifié » ; le brouillon part au dépôt
// après CONFIG.autosaveDelay sans nouvelle frappe, ou tout de suite quand
// la page le demande (changement d'étape, onglet masqué, page quittée).
// L'état d'enregistrement s'affiche dans l'en-tête.

import { CONFIG } from '../config.js';
import * as auth from '../core/auth.js';
import * as records from '../core/records.js';
import { setSync } from '../shell/feedback.js';

/**
 * `module` : identifiant du module dans js/core/records.js.
 * `current()` : le dossier à enregistrer, ou null s'il n'y en a pas (ou
 * qu'il est en lecture seule).
 */
export function createAutosave({ module, current }) {
  let dirty = false;
  let saving = false;
  let timer = null;

  function cancel() {
    if (timer) window.clearTimeout(timer);
    timer = null;
  }

  async function flush() {
    const record = current();
    if (!dirty || saving || !record) return;
    if (!auth.canWrite()) {
      setSync('lecture seule — rien n’est enregistré', 'error');
      return;
    }

    saving = true;
    setSync('enregistrement…');
    try {
      await records.saveDraft(module, auth.current().login, record);
      dirty = false;
      const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      setSync(`enregistré à ${time}`, 'ok');
    } catch (error) {
      setSync(`échec : ${error.message}`, 'error');
    } finally {
      saving = false;
    }
  }

  /** Une saisie vient de modifier le dossier. */
  function mark() {
    dirty = true;
    setSync('modifications non enregistrées');
    cancel();
    timer = window.setTimeout(() => { flush() }, CONFIG.autosaveDelay);
  }

  return {
    mark,
    flush,
    cancel,

    /** Enregistrer maintenant, même sans saisie récente. */
    async now() {
      dirty = true;
      await flush();
    },

    /** Le dossier vient d'être créé ou repris : il reste à l'enregistrer, ou non. */
    reset(pending = false) {
      cancel();
      dirty = pending;
    },

    get dirty() {
      return dirty;
    }
  };
}
