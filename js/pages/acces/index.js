// Page d'accès examinateur — avant toute session, rien d'autre du portail
// n'est peint. Liste des accès, code personnel, ou mode local quand aucun
// dépôt n'est configuré.

import { isConfigured } from '../../config.js';
import * as auth from '../../core/auth.js';
import {
  showLoading,
  showLocal,
  showBootstrap,
  showForm,
  notice,
  readForm,
  readName,
  setBusy
} from './view.js';

export const REASONS = {
  expired: 'Session expirée. Entre ton code pour continuer.',
  invalid: 'Session fermée : ton accès a été modifié ou retiré. Entre ton code.',
  required: 'Connecte-toi pour accéder au portail BAC 75 N.',
  signedout: 'Session fermée.'
};

async function render(message) {
  if (!isConfigured()) {
    showLocal(notice(message));
    return;
  }

  showLoading('Chargement de la liste des examinateurs…');

  let entries = [];
  try {
    entries = (await auth.loadRoster(true)).entries;
  } catch (error) {
    showBootstrap(notice(`Liste des accès illisible : ${error.message}`));
    return;
  }

  if (!entries.length) {
    showBootstrap(notice(message));
    return;
  }

  showForm(entries, notice(message));
}

/**
 * Affiche le formulaire d'accès. `onEnter` est appelé une fois la session
 * ouverte : c'est lui qui peint le portail.
 */
export function showGate(reason, onEnter) {
  const gate = {
    async submit() {
      const { entryId, code } = readForm();
      if (!code) {
        await render('Entre ton code personnel.');
        return;
      }

      setBusy(true, 'Vérification…');
      try {
        await auth.signIn(entryId, code);
        await onEnter();
      } catch (error) {
        setBusy(false);
        await render(error.message);
      }
    },

    async submitLocal() {
      setBusy(true, 'Ouverture…');
      await auth.signInLocal(readName());
      await onEnter();
    }
  };

  window.gate = gate;
  return render(REASONS[reason] || '');
}
