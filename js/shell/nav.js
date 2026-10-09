// Navigation du portail — la barre latérale et la nav de l'en-tête de
// l'archive V4 (index.html), entrée pour entrée, dans le même ordre.
//
// Une seule liste pour les deux. `need` est la permission requise : un rôle
// qui ne l'a pas ne voit pas l'entrée. `sub` liste les sous-entrées,
// affichées en retrait sous leur section (`.navsub` de l'archive).
//
// L'entrée « Intervention — Bientôt » de l'archive est volontairement
// absente. Les Actualités n'ont pas d'entrée : l'archive n'en a pas, elles
// s'ouvrent depuis l'accueil et l'Administration.

import { href } from '../routes.js';
import * as auth from '../core/auth.js';

export const NAV = [
  { id: 'accueil', label: 'Accueil', short: 'ACCUEIL', icon: '⌂', route: 'accueil' },
  { id: 'concours', label: 'Concours d’intégration BAC', short: 'CONCOURS BAC', icon: '▣', route: 'concours' },
  {
    id: 'formations',
    label: 'Formations BAC',
    short: 'FORMATIONS',
    icon: '▤',
    route: 'formations',
    sub: [
      { id: 'negociation', label: 'Négociation BAC', route: 'formation-negociation' },
      { id: 'formation-cdg', label: 'Commandement', route: 'formation-chef-groupe' },
      { id: 'radio', label: 'Radio BAC', route: 'formation-radio' },
      { id: 'antiterrorisme', label: 'Antiterrorisme', route: 'formation-antiterrorisme' }
    ]
  },
  { id: 'examens', label: 'Examens', short: 'EXAMENS', icon: '☑', route: 'examen-chef-groupe' },
  { id: 'historique', label: 'Historique', short: 'HISTORIQUE', icon: '◴', route: 'historique' },
  { id: 'administration', label: 'Administration', icon: '♟', route: 'administration', need: 'accounts' },
  { id: 'utilisateurs', label: 'Gestion des utilisateurs', icon: '♙', route: 'utilisateurs', need: 'accounts' },
  { id: 'parametres', label: 'Paramètres du site', icon: '⚙', route: 'parametres' }
];

/** Les entrées reprises par la nav horizontale de l'en-tête. */
export const HEADER_NAV = ['accueil', 'concours', 'formations', 'examens', 'historique'];

export function visibleNav() {
  return NAV.filter(item => !item.need || auth.can(item.need));
}

/** Une entrée est allumée si elle est active, ou si l'une de ses sous-entrées l'est. */
export function isActive(item, active) {
  return item.id === active || (item.sub || []).some(child => child.id === active);
}

export function itemHref(item) {
  return item.route ? href(item.route) : '#';
}
