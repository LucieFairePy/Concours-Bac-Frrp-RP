// Navigation du portail — documentation technique V4 §6.1 et §6.2.
//
// Une seule liste pour la barre latérale et la nav de l'en-tête. `need`
// est la permission requise : un rôle qui ne l'a pas ne voit pas l'entrée.
// `sub` liste les sous-entrées, affichées sous leur section.

import { href } from '../routes.js';
import * as auth from '../core/auth.js';

export const NAV = [
  { id: 'accueil', label: 'Accueil', short: 'Accueil', icon: '⌂', route: 'accueil' },
  { id: 'concours', label: 'Concours d’intégration BAC', short: 'Concours BAC', icon: '▣', route: 'concours' },
  {
    id: 'formations',
    label: 'Formations BAC',
    short: 'Formations',
    icon: '▤',
    route: 'formations',
    sub: [
      { id: 'negociation', label: 'Négociation BAC', route: 'formation-negociation' },
      { id: 'formation-cdg', label: 'Commandement', route: 'formation-chef-groupe' },
      { id: 'radio', label: 'Radio BAC', route: 'formation-radio' },
      { id: 'antiterrorisme', label: 'Antiterrorisme', route: 'formation-antiterrorisme' }
    ]
  },
  {
    id: 'examens',
    label: 'Examens',
    short: 'Examens',
    icon: '☑',
    route: 'examen-chef-groupe',
    sub: [{ id: 'cdg', label: 'Chef de Groupe', route: 'examen-chef-groupe' }]
  },
  { id: 'historique', label: 'Historique', short: 'Historique', icon: '◷', route: 'historique' },
  { id: 'actualites', label: 'Actualités', short: 'Actualités', icon: '◈', route: 'actualites' },
  { id: 'administration', label: 'Administration', icon: '⚐', route: 'administration', need: 'accounts' },
  { id: 'utilisateurs', label: 'Gestion des utilisateurs', icon: '⚇', route: 'utilisateurs', need: 'accounts' },
  { id: 'parametres', label: 'Paramètres du site', icon: '⚙', route: 'parametres' }
];

/** Les entrées reprises par la nav horizontale de l'en-tête (§6.2). */
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
