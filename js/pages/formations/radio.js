// Page de la formation : le moteur commun (engine.js) servi avec ce contenu
// et la mise en page de son module dans la maquette V4 (layouts/radio.js).

import { courseByRoute } from '../../data/formations/index.js';
import { formationPage } from './engine.js';
import * as layout from './layouts/radio.js';

const { course, kicker } = courseByRoute('formation-radio');

export default formationPage(course, kicker, layout);
