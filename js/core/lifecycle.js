// Cycle de vie d'un dossier — documentation technique V4 §15 et annexe B.
//
//   CRÉÉ → EN COURS → CORRECTION → DÉCISION → CLÔTURÉ (lecture seule)
//
// Le statut n'est pas un champ qu'il faudrait penser à écrire à chaque
// étape : il se déduit du contenu réel du dossier. Un dossier écrit par
// une version antérieure du portail, qui ne connaissait que `locked`,
// reçoit donc le bon statut sans migration. `stamp()` l'écrit quand même
// dans le dossier au moment d'enregistrer, pour que le fichier publié
// porte la valeur que l'annexe B attend.
//
// L'avancement sert au panneau « Dossiers en cours » de l'accueil (§18.2),
// qui ne doit afficher aucun pourcentage codé en dur.

/**
 * §14 — version du modèle de dossier. Un dossier écrit par une version
 * antérieure n'en porte pas : il vaut alors 1, et les migrations des
 * modules le complètent.
 */
export const RECORD_VERSION = 2;

export const STATUS = {
  draft: { id: 'draft', label: 'Créé' },
  in_progress: { id: 'in_progress', label: 'En cours' },
  correction: { id: 'correction', label: 'Correction' },
  decision: { id: 'decision', label: 'Décision' },
  closed: { id: 'closed', label: 'Clôturé' },
  rectified: { id: 'rectified', label: 'Rectificatif' }
};

export const STATUS_ORDER = ['draft', 'in_progress', 'correction', 'decision', 'closed', 'rectified'];

function filled(value) {
  return String(value ?? '').trim() !== '';
}

function countFilled(values) {
  return values.filter(filled).length;
}

/** Étapes du concours — §8, neuf étapes jusqu'à la fiche finale. */
function concoursSteps(record) {
  const answers = record.ans || {};
  const questions = Array.isArray(record.qs) ? record.qs : [];
  const radio = Array.isArray(record.radioAns) ? record.radioAns : [];
  const scenarios = Array.isArray(record.scAns) ? record.scAns.flat() : [];
  const phys = record.phys || {};
  const shoot = record.shoot || {};
  const marks = record.marks || {};

  const theoryDone = questions.length
    ? questions.filter(question => filled(answers[question.id])).length / questions.length
    : 0;

  const marked = countFilled(Object.values(marks.theory || {}))
    + countFilled(Object.values(marks.radio || {}))
    + countFilled(Object.values(marks.sc || {}))
    + countFilled([marks.phys, marks.shoot]);

  return [
    { id: 'id', label: 'Identité', done: filled(record.c && record.c.last) && filled(record.c && record.c.first) },
    { id: 'theory', label: 'Théorie', done: theoryDone >= 1 },
    { id: 'radio', label: 'Radio', done: radio.length > 0 && countFilled(radio) === radio.length },
    { id: 'sc', label: 'Situations', done: scenarios.length > 0 && countFilled(scenarios) === scenarios.length },
    { id: 'phys', label: 'Physique / cognitif', done: countFilled([phys.run, phys.push, phys.abs, phys.plank]) >= 4 },
    { id: 'shoot', label: 'Tir RP', done: countFilled([shoot.safety, shoot.handling, shoot.precision, shoot.reaction]) >= 4 },
    { id: 'correct', label: 'Correction', done: marked > 0 },
    { id: 'results', label: 'Résultats', done: filled(record.decision) },
    { id: 'final', label: 'Fiche finale', done: Boolean(record.locked) }
  ];
}

/** Étapes de l'examen Chef de Groupe — §11, huit étapes. */
function cdgSteps(record) {
  const draw = record.draw || {};
  const answers = record.ans || {};
  const marks = record.marks || {};

  const answered = list => {
    const questions = Array.isArray(list) ? list : [];
    if (!questions.length) return false;
    return questions.every(question => filled(answers[question.id]));
  };

  const situations = Array.isArray(draw.situations) ? draw.situations : [];
  const situation = index => (situations[index] ? situations[index].questions : []);

  return [
    { id: 'id', label: 'Identité', done: filled(record.c && record.c.last) && filled(record.c && record.c.first) },
    { id: 'connaissances', label: 'Connaissances', done: answered(draw.connaissances) },
    { id: 'commandement', label: 'Commandement', done: answered(draw.commandement) },
    { id: 'situation1', label: 'Mise en situation 1', done: answered(situation(0)) },
    { id: 'situation2', label: 'Mise en situation 2', done: answered(situation(1)) },
    { id: 'correct', label: 'Correction', done: countFilled(Object.values(marks)) > 0 },
    { id: 'results', label: 'Décision', done: filled(record.decision) },
    { id: 'final', label: 'Fiche finale', done: Boolean(record.locked) }
  ];
}

/** Étapes d'une formation — lecture des chapitres puis évaluation. */
function formationSteps(record) {
  const read = record.read || {};
  const answers = record.ans || {};

  return [
    { id: 'id', label: 'Identité', done: filled(record.c && record.c.last) && filled(record.c && record.c.first) },
    { id: 'cours', label: 'Cours', done: Object.values(read).filter(Boolean).length > 0 },
    { id: 'eval', label: 'Évaluation', done: countFilled(Object.values(answers)) > 0 },
    { id: 'results', label: 'Décision', done: filled(record.decision) },
    { id: 'final', label: 'Fiche finale', done: Boolean(record.locked) }
  ];
}

export function steps(moduleId, record) {
  if (!record) return [];
  if (moduleId === 'concours') return concoursSteps(record);
  if (moduleId === 'cdg') return cdgSteps(record);
  return formationSteps(record);
}

/**
 * Avancement réel : dernière étape franchie, étape en cours, et ratio
 * calculé à partir du nombre d'étapes du module — jamais une constante.
 */
export function progress(moduleId, record) {
  const list = steps(moduleId, record);
  if (!list.length) return { done: 0, count: 0, ratio: 0, step: null, label: '—' };

  // Un dossier clôturé est terminé, quelles que soient les étapes que
  // l'examinateur a choisi de laisser vides : la clôture fait foi.
  if (record.locked) {
    const last = list[list.length - 1];
    return {
      done: list.length,
      count: list.length,
      ratio: 1,
      step: last,
      label: last.label,
      steps: list.map(step => ({ ...step, done: true }))
    };
  }

  const done = list.filter(step => step.done).length;
  const current = list.find(step => !step.done) || list[list.length - 1];

  return {
    done,
    count: list.length,
    ratio: done / list.length,
    step: current,
    label: current.label,
    steps: list
  };
}

/** Statut annexe B, déduit du contenu du dossier. */
export function status(moduleId, record) {
  if (!record) return 'draft';
  if (record.rectifies) return 'rectified';
  if (record.locked) return 'closed';

  const list = steps(moduleId, record);
  const byId = Object.fromEntries(list.map(step => [step.id, step.done]));

  if (byId.results) return 'decision';
  if (byId.correct) return 'correction';
  if (byId.id) return 'in_progress';
  return 'draft';
}

export function statusLabel(value) {
  return (STATUS[value] || STATUS.draft).label;
}

/**
 * Écrit le statut dans le dossier au moment d'enregistrer. Le dossier
 * garde ainsi, dans son fichier, la valeur attendue par l'annexe B, sans
 * que le statut puisse diverger du contenu : il est recalculé à chaque
 * écriture.
 */
export function stamp(moduleId, record) {
  if (!record) return record;
  if (!record.version) record.version = RECORD_VERSION;
  record.status = status(moduleId, record);
  return record;
}

/**
 * §14 — ajoute une ligne à la piste d'audit portée par le dossier :
 * quand, qui, quoi. Elle double le journal central (§17.1) sans le
 * remplacer : le journal dit ce qui s'est passé dans le service, la piste
 * dit ce qui est arrivé à cette pièce-là, et elle suit le fichier partout
 * où il est lu.
 */
export function trace(record, action, who, detail) {
  if (!record) return record;
  if (!Array.isArray(record.auditTrail)) record.auditTrail = [];

  record.auditTrail.push({
    at: new Date().toISOString(),
    action,
    who: who || '',
    detail: detail || ''
  });

  // Une pièce ne porte pas son histoire complète indéfiniment : les
  // cinquante dernières lignes suffisent, le journal central garde le
  // reste.
  if (record.auditTrail.length > 50) {
    record.auditTrail = record.auditTrail.slice(-50);
  }

  return record;
}
