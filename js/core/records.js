// Modèle de dossier commun et registre des modules — cahier des charges
// §12 (un seul historique) et §15 (architecture modulaire).
//
// Ajouter une formation ou un examen au portail = ajouter une entrée dans
// MODULES. L'historique, les numéros de dossier, les brouillons et la
// lecture seule suivent sans être retouchés.
//
// Le module « concours » garde exactement les chemins d'origine
// (data/dossiers/, data/drafts/<login>.json) et continue de passer par
// store.publishClosed : les dossiers déjà clôturés et les brouillons en
// cours restent lisibles tels quels.

import * as store from './store.js';
import * as lifecycle from './lifecycle.js';

/**
 * Les trois familles de l'historique, comme dans la maquette V4 :
 * formations, concours, examens. Chaque module appartient à une famille.
 */
export const CATEGORIES = {
  formations: {
    id: 'formations',
    label: 'Formations',
    blurb: 'Négociation · Chef de Groupe · Radio · Antiterrorisme',
    image: 'formation-cdg'
  },
  concours: {
    id: 'concours',
    label: 'Concours',
    blurb: 'Concours d’intégration BAC',
    image: 'concours'
  },
  examens: {
    id: 'examens',
    label: 'Examens',
    blurb: 'Examen de qualification Chef de Groupe',
    image: 'cdg'
  }
};

/** Anciennes catégories (liens `?categorie=` d'avant la V4) → module. */
export const LEGACY_CATEGORIES = { negociation: 'negociation', cdg: 'cdg' };

export const MODULES = {
  concours: {
    id: 'concours',
    category: 'concours',
    label: 'Concours d’intégration BAC',
    short: 'Concours',
    prefix: 'BAC',
    dir: 'dossiers',
    index: 'dossiers/index.json',
    draft: login => `drafts/${login}.json`,
    max: 1000,
    route: 'concours',
    legacy: true
  },
  negociation: {
    id: 'negociation',
    category: 'formations',
    label: 'Formation Négociation BAC',
    short: 'Négociation',
    prefix: 'NEG',
    dir: 'negociation',
    index: 'negociation/index.json',
    draft: login => `drafts/negociation-${login}.json`,
    max: 100,
    route: 'formation-negociation'
  },
  'formation-cdg': {
    id: 'formation-cdg',
    category: 'formations',
    label: 'Formation Chef de Groupe BAC',
    short: 'Formation CDG',
    prefix: 'FCG',
    dir: 'formation-cdg',
    index: 'formation-cdg/index.json',
    draft: login => `drafts/formation-cdg-${login}.json`,
    max: 100,
    route: 'formation-chef-groupe'
  },
  radio: {
    id: 'radio',
    category: 'formations',
    label: 'Formation Radio BAC',
    short: 'Radio',
    prefix: 'RAD',
    dir: 'radio',
    index: 'radio/index.json',
    draft: login => `drafts/radio-${login}.json`,
    max: 100,
    route: 'formation-radio'
  },
  antiterrorisme: {
    id: 'antiterrorisme',
    category: 'formations',
    label: 'Formation Antiterrorisme BAC',
    short: 'Antiterrorisme',
    prefix: 'ANT',
    dir: 'antiterrorisme',
    index: 'antiterrorisme/index.json',
    draft: login => `drafts/antiterrorisme-${login}.json`,
    max: 100,
    route: 'formation-antiterrorisme'
  },
  cdg: {
    id: 'cdg',
    category: 'examens',
    label: 'Examen de qualification Chef de Groupe BAC',
    short: 'Examen CDG',
    prefix: 'CDG',
    dir: 'cdg',
    index: 'cdg/index.json',
    draft: login => `drafts/cdg-${login}.json`,
    max: 1000,
    route: 'examen-chef-groupe'
  }
};

export const MODULE_ORDER = ['concours', 'negociation', 'formation-cdg', 'radio', 'antiterrorisme', 'cdg'];

export function module(id) {
  const found = MODULES[id];
  if (!found) throw new Error(`Module inconnu : ${id}`);
  return found;
}

/** Forme commune d'une ligne d'historique, quelle que soit l'origine. */
export function normalize(entry, moduleId) {
  const mod = MODULES[moduleId] || MODULES.concours;
  return {
    id: entry.id,
    module: moduleId,
    category: mod.category,
    typeLabel: mod.label,
    last: entry.last || '',
    first: entry.first || '',
    grade: entry.grade || '',
    mat: entry.mat || '',
    date: entry.date || '',
    total: entry.total === undefined ? null : entry.total,
    max: entry.max || mod.max,
    decision: entry.decision || '',
    examiner: entry.examiner || entry.closedBy || '',
    status: entry.status || (entry.closedAt ? 'closed' : 'in_progress'),
    closedAt: entry.closedAt || null,
    closedBy: entry.closedBy || null,
    rectifies: entry.rectifies || null,
    rectifiedBy: entry.rectifiedBy || null
  };
}

export function fullName(entry) {
  return `${String(entry.last || '').toUpperCase()} ${entry.first || ''}`.trim();
}

/** Résumé écrit dans l'index au moment de la clôture. */
export function summarize(record, moduleId) {
  const mod = module(moduleId);
  const examiner = Array.isArray(record.ex) && record.ex[0]
    ? `${record.ex[0].grade || ''} ${record.ex[0].name || ''}`.trim()
    : '';

  return {
    id: record.id,
    last: record.c.last,
    first: record.c.first,
    grade: record.c.grade,
    mat: record.c.mat || '',
    date: record.c.date,
    total: record.total ?? null,
    max: mod.max,
    decision: record.decision || '',
    examiner,
    status: lifecycle.status(moduleId, record),
    closedAt: record.closedAt || null,
    closedBy: record.closedBy || null,
    rectifies: record.rectifies || null
  };
}

function nextNumber(ids, prefix, year) {
  const head = `${prefix}-${year}-`;
  const used = ids
    .filter(id => id.startsWith(head))
    .map(id => parseInt(id.slice(head.length), 10))
    .filter(Number.isFinite);
  const next = used.length ? Math.max(...used) + 1 : 1;
  return `${head}${String(next).padStart(3, '0')}`;
}

export async function nextId(moduleId, year = new Date().getFullYear()) {
  const mod = module(moduleId);
  if (mod.legacy) return store.nextDossierId(year);

  const index = await store.readData(mod.index);
  if (Array.isArray(index)) return nextNumber(index.map(entry => entry.id), mod.prefix, year);

  let files = [];
  try {
    files = await store.listData(mod.dir);
  } catch (error) {
    files = [];
  }
  const ids = files
    .map(file => file.name)
    .filter(name => name.endsWith('.json') && name !== 'index.json')
    .map(name => name.replace(/\.json$/, ''));
  return nextNumber(ids, mod.prefix, year);
}

export async function listModule(moduleId) {
  const mod = module(moduleId);

  if (mod.legacy) {
    const entries = await store.listClosed();
    return entries.map(entry => normalize(entry, moduleId));
  }

  const index = await store.readData(mod.index);
  if (!Array.isArray(index)) return [];
  return [...index].reverse().map(entry => normalize(entry, moduleId));
}

/**
 * L'historique central. Un module illisible ne fait pas tomber les autres :
 * son erreur est renvoyée à côté des lignes lues, et la page l'affiche.
 */
export async function listAll(moduleIds = MODULE_ORDER) {
  const results = await Promise.all(moduleIds.map(async id => {
    try {
      return { id, entries: await listModule(id), error: null };
    } catch (error) {
      return { id, entries: [], error: error.message };
    }
  }));

  const entries = results.flatMap(result => result.entries);
  entries.sort((a, b) =>
    String(b.closedAt || b.date || '').localeCompare(String(a.closedAt || a.date || '')));

  return {
    entries,
    errors: results.filter(result => result.error).map(result => ({ id: result.id, error: result.error }))
  };
}

export async function get(moduleId, id) {
  const mod = module(moduleId);
  if (mod.legacy) return store.getClosed(id);
  return store.readData(`${mod.dir}/${id}.json`);
}

export async function publish(moduleId, record) {
  const mod = module(moduleId);
  lifecycle.trace(
    record,
    record.rectifies ? 'dossier.rectificatif' : 'dossier.cloture',
    store.operatorName(),
    record.decision || ''
  );
  lifecycle.stamp(moduleId, record);
  if (mod.legacy) return store.publishClosed(record);

  await store.writeData(
    `${mod.dir}/${record.id}.json`,
    record,
    `feat(data): clôture ${record.id} — ${record.c.last} ${record.c.first}`
  );

  await store.updateData(
    mod.index,
    current => {
      const list = Array.isArray(current) ? current.filter(entry => entry.id !== record.id) : [];
      list.push(summarize(record, moduleId));
      return list;
    },
    `chore(data): index ${record.id}`
  );

  return record;
}

/**
 * Version rectificative — §5 et §15 : jamais de modification silencieuse.
 * Le dossier d'origine n'est pas réécrit ; une nouvelle pièce le cite, et
 * l'index note sur la ligne d'origine quelle version la corrige.
 */
export async function publishRectified(moduleId, original, corrected) {
  const mod = module(moduleId);
  const base = String(original.id).replace(/-R\d+$/, '');

  let version = 1;
  while (await get(moduleId, `${base}-R${String(version).padStart(2, '0')}`)) version += 1;

  const record = {
    ...corrected,
    id: `${base}-R${String(version).padStart(2, '0')}`,
    rectifies: original.id,
    locked: true,
    closedAt: new Date().toISOString()
  };

  await publish(moduleId, record);

  // L'index note sur la ligne d'origine quelle version la corrige — y
  // compris pour le module historique, dont l'index vit au même endroit.
  await store.updateData(
    mod.index,
    current => {
      const list = Array.isArray(current) ? current : [];
      const line = list.find(entry => entry.id === original.id);
      if (line) line.rectifiedBy = record.id;
      return list;
    },
    `chore(data): ${original.id} rectifié par ${record.id}`
  );

  return record;
}

export function loadDraft(moduleId, login) {
  const mod = module(moduleId);
  if (mod.legacy) return store.loadDraft(login);
  return store.readData(mod.draft(login));
}

export function saveDraft(moduleId, login, record) {
  const mod = module(moduleId);
  // Une sauvegarde de brouillon n'entre dans la piste qu'à la première,
  // sinon l'autosauvegarde la remplirait toutes les trente secondes.
  if (!Array.isArray(record.auditTrail) || !record.auditTrail.length) {
    lifecycle.trace(record, 'dossier.creation', store.operatorName(), record.id);
  }
  lifecycle.stamp(moduleId, record);
  if (mod.legacy) return store.saveDraft(login, record);
  return store.writeData(mod.draft(login), record, `chore(data): brouillon ${record.id}`);
}

export function deleteDraft(moduleId, login) {
  const mod = module(moduleId);
  if (mod.legacy) return store.deleteDraft(login);
  return store.deleteData(mod.draft(login), `chore(data): brouillon ${moduleId} ${login} archivé`);
}
