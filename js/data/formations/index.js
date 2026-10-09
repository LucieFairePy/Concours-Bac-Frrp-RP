// Les formations du portail, dans l'ordre de la maquette V4.
//
// Ajouter une formation = écrire son contenu dans ce dossier, la déclarer
// ici, lui donner une route (js/routes.js) et un module de dossier
// (js/core/records.js). Le moteur de formation et la page de catalogue
// suivent sans être retouchés.

import { NEGOCIATION } from './negociation.js';
import { CHEF_DE_GROUPE } from './chef-de-groupe.js';
import { RADIO } from './radio.js';
import { ANTITERRORISME } from './antiterrorisme.js';

export { NEGOCIATION, CHEF_DE_GROUPE, RADIO, ANTITERRORISME };

/**
 * `route` : l'identifiant de la page du cours dans js/routes.js.
 * `kicker` : la ligne au-dessus du titre de la bannière, reprise de la
 * maquette V4.
 */
export const COURSES = [
  { course: NEGOCIATION, route: 'formation-negociation', kicker: 'Communication · Gestion de crise · Solutions' },
  { course: CHEF_DE_GROUPE, route: 'formation-chef-groupe', kicker: 'Commander · Organiser · Coordonner' },
  { course: RADIO, route: 'formation-radio', kicker: 'Écouter · Identifier · Transmettre · Coordonner' },
  { course: ANTITERRORISME, route: 'formation-antiterrorisme', kicker: 'Primo-intervenir · Protéger · Transmettre · Coordonner' }
];

export function courseByRoute(route) {
  const found = COURSES.find(entry => entry.route === route);
  if (!found) throw new Error(`Formation inconnue : ${route}`);
  return found;
}
