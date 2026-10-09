// Page de la formation : le moteur commun (engine.js) servi avec ce contenu.

import { courseByRoute } from '../../data/formations/index.js';
import { formationPage } from './engine.js';

const { course, kicker } = courseByRoute('formation-radio');

export default formationPage(course, kicker);
