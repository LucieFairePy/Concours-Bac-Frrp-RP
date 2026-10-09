import { QUESTION_BANK } from '../data/questions.js';
import { radioOf } from '../data/radio.js';
import { scenariosOf } from '../data/scenarios.js';
import { CONTENT_SET } from '../data/content-set.js';
import { RECORD_VERSION } from './lifecycle.js';
import { CONFIG } from '../config.js';

export const state = {
  dossier: null,
  settings: { ...CONFIG.defaultCommand },
  readOnly: false
};

export function pickQuestions(count = 10) {
  return [...QUESTION_BANK].sort(() => Math.random() - 0.5).slice(0, count);
}

export function blankDossier(id, settings) {
  const today = new Date().toISOString().slice(0, 10);
  // Jeu radio / situations sous lequel le dossier est passé : ses réponses
  // y sont rangées par index (voir data/content-set.js).
  const content = { contentSet: CONTENT_SET };
  return {
    id,
    // §14 : version du modèle de dossier, et piste d'audit portée par le
    // dossier lui-même — le journal central (§17.1) reste la trace de
    // service, celle-ci voyage avec la pièce.
    version: RECORD_VERSION,
    contentSet: CONTENT_SET,
    status: 'draft',
    locked: false,
    created: new Date().toISOString(),
    auditTrail: [],
    c: { last: '', first: '', grade: '', mat: '', date: today, start: '' },
    ex: [{ grade: settings.ag || '', name: settings.an || '' }],
    qs: pickQuestions(),
    ans: {},
    radioAns: radioOf(content).questions.map(() => ''),
    scAns: scenariosOf(content).map(scenario => scenario.questions.map(() => '')),
    phys: { run: '', push: '', abs: '', jumping: '', pursuit: '', cog: '', obs: '' },
    shoot: {
      safety: '',
      handling: '',
      precision: '',
      reaction: '',
      memory: '',
      memoryAsked: '',
      memoryGood: '',
      memoryErrors: '',
      discern: '',
      discernAsked: '',
      discernErrors: '',
      analysis: '',
      hostage: 0,
      obs: ''
    },
    marks: { theory: {}, radio: {}, sc: {}, phys: '', shoot: '' },
    strength: '',
    improve: '',
    general: '',
    decision: '',
    reason: '',
    retakes: [],
    retakeDate: '',
    el: { cheat: false, refusal: false, abandon: false, danger: false },
    cmd: { ...settings },
    total: null,
    closedAt: null,
    closedBy: null
  };
}

function fit(stored, length) {
  const source = Array.isArray(stored) ? stored : [];
  return Array.from({ length }, (_, index) => source[index] ?? '');
}

export function migrate(dossier) {
  const base = blankDossier(dossier.id, dossier.cmd || state.settings);
  // Un dossier sans estampille a été passé sous l'ancien jeu : il ne doit
  // pas hériter de celle du dossier vierge, sinon ses réponses se
  // retrouveraient sous des questions qu'il n'a jamais vues.
  const content = { contentSet: dossier.contentSet };
  const radio = radioOf(content);
  const scenarios = scenariosOf(content);
  const examiners = Array.isArray(dossier.ex) && dossier.ex.length ? dossier.ex : base.ex;

  return {
    ...base,
    ...dossier,
    c: { ...base.c, ...dossier.c },
    ex: examiners,
    qs: Array.isArray(dossier.qs) && dossier.qs.length ? dossier.qs : base.qs,
    ans: dossier.ans || {},
    contentSet: content.contentSet,
    radioAns: fit(dossier.radioAns, radio.questions.length),
    scAns: scenarios.map((scenario, index) =>
      fit(Array.isArray(dossier.scAns) ? dossier.scAns[index] : [], scenario.questions.length)
    ),
    phys: { ...base.phys, ...dossier.phys },
    shoot: { ...base.shoot, ...dossier.shoot },
    marks: { ...base.marks, ...dossier.marks },
    el: { ...base.el, ...dossier.el },
    cmd: { ...base.cmd, ...dossier.cmd },
    retakes: Array.isArray(dossier.retakes) ? dossier.retakes : []
  };
}

export function isEditable() {
  return Boolean(state.dossier) && !state.dossier.locked && !state.readOnly;
}

export function setPath(path, value) {
  if (!isEditable()) return false;
  const keys = path.split('.');
  let node = state.dossier;
  for (let i = 0; i < keys.length - 1; i += 1) {
    if (node[keys[i]] === undefined || node[keys[i]] === null) node[keys[i]] = {};
    node = node[keys[i]];
  }
  node[keys[keys.length - 1]] = value;
  return true;
}
