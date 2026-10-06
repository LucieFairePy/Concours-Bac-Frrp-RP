// Journal des actions sensibles — cahier des charges §14 et §15.
//
// Un fichier par mois, pour que le journal reste lisible et que deux
// écritures simultanées se disputent rarement le même fichier. Le verrou
// optimiste par `sha` de updateJson fait le reste.
//
// Règle tenue partout : écrire au journal ne doit jamais faire échouer
// l'action elle-même. Un dossier clôturé reste clôturé même si le journal
// n'a pas pu être écrit — l'appelant reçoit `false` et l'affiche.

import * as store from './store.js';

export const ACTIONS = {
  'dossier.cloture': 'Clôture de dossier',
  'dossier.rectificatif': 'Version rectificative',
  'dossier.decision': 'Décision retenue',
  'formation.validee': 'Formation validée',
  'acces.creation': 'Création d’un accès',
  'acces.role': 'Changement de rôle',
  'acces.retrait': 'Retrait d’un accès',
  'direction.maj': 'Modification de la direction BAC',
  'parametres.maj': 'Modification des paramètres'
};

function monthFile(date) {
  return `journal/${date.toISOString().slice(0, 7)}.json`;
}

export function actionLabel(action) {
  return ACTIONS[action] || action;
}

/**
 * Ajoute une ligne au journal du mois courant.
 * Renvoie true si la ligne est écrite, false si l'écriture a échoué.
 */
export async function record(entry) {
  const now = new Date();
  const line = {
    at: now.toISOString(),
    who: entry.who || '—',
    role: entry.role || '—',
    action: entry.action,
    target: entry.target || '',
    detail: entry.detail || ''
  };

  try {
    await store.updateData(
      monthFile(now),
      current => {
        const list = Array.isArray(current) ? current : [];
        list.push(line);
        return list;
      },
      `chore(journal): ${line.action} ${line.target}`.trim()
    );
    return true;
  } catch (error) {
    // Pas de `throw` : le journal est une trace, pas une condition.
    console.warn('journal indisponible', error);
    return false;
  }
}

export async function months() {
  let files;
  try {
    files = await store.listData('journal');
  } catch (error) {
    return [];
  }
  return files
    .map(file => file.name)
    .filter(name => /^\d{4}-\d{2}\.json$/.test(name))
    .map(name => name.replace(/\.json$/, ''))
    .sort()
    .reverse();
}

export async function read(month) {
  const lines = await store.readData(`journal/${month}.json`);
  return Array.isArray(lines) ? [...lines].reverse() : [];
}
