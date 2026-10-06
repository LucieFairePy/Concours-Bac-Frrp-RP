// Rôles et permissions du portail BAC 75 N.
//
// Ce que cette couche fait : elle décide ce que l'interface propose.
// Ce qu'elle ne fait pas : contenir quelqu'un de malveillant. Sur un
// hébergement statique, toute personne détenant un code valide détient le
// même jeton d'écriture. La vraie barrière est la protection de branche
// (tools/guard.mjs) et le journal (js/core/journal.js), qui rendent toute
// dégradation visible et réversible. Voir README, section « Rôles ».

export const ROLES = {
  admin: {
    id: 'admin',
    label: 'Administrateur / créateur',
    can: ['read', 'write', 'close', 'train', 'settings', 'journal', 'accounts']
  },
  directeur: {
    id: 'directeur',
    label: 'Directeur BAC',
    can: ['read', 'write', 'close', 'train', 'settings', 'journal', 'accounts']
  },
  adjoint: {
    id: 'adjoint',
    label: 'Directeur adjoint BAC',
    can: ['read', 'write', 'close', 'train', 'settings', 'journal', 'accounts']
  },
  formateur: {
    id: 'formateur',
    label: 'Formateur / examinateur',
    can: ['read', 'write', 'close', 'train']
  },
  lecture: {
    id: 'lecture',
    label: 'Utilisateur / consultation',
    can: ['read']
  }
};

// Les premières versions du portail ne connaissaient que « directeur » et
// « examinateur ». Les accès déjà scellés portent ces valeurs : on les
// traduit sans jamais rouvrir la charge chiffrée.
const ALIASES = {
  examinateur: 'formateur',
  'directeur-adjoint': 'adjoint',
  adjointe: 'adjoint',
  createur: 'admin',
  consultation: 'lecture'
};

export const ROLE_ORDER = ['admin', 'directeur', 'adjoint', 'formateur', 'lecture'];

export function normalizeRole(value) {
  const key = String(value || '').trim().toLowerCase();
  if (ROLES[key]) return key;
  if (ALIASES[key]) return ALIASES[key];
  return 'formateur';
}

export function roleLabel(value) {
  return ROLES[normalizeRole(value)].label;
}

export function roleCan(value, permission) {
  return ROLES[normalizeRole(value)].can.includes(permission);
}

// Un rôle qui porte « settings » implique le droit historique `manage`.
export function roleGrantsManage(value) {
  return roleCan(value, 'settings');
}

// Et réciproquement : un ancien accès n'ayant que `manage: true` vaut au
// moins « directeur adjoint », faute de mieux.
export function roleFromLegacy(role, manage) {
  const named = normalizeRole(role);
  if (manage === true && !roleGrantsManage(named)) return 'adjoint';
  return named;
}
