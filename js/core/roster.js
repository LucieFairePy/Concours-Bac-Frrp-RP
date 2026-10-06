import * as gh from './github-api.js';
import * as store from './store.js';
import { sealPayload, generateCode, KDF } from './crypto.js';

let cache = null;

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueId(base, taken) {
  const root = base || 'examinateur';
  if (!taken.has(root)) return root;
  for (let n = 2; n < 100; n += 1) {
    const candidate = `${root}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  throw new Error('Impossible de générer un identifiant libre.');
}

export function identity(entry) {
  if (entry.grade !== undefined || entry.name !== undefined) {
    return { grade: entry.grade || '', name: entry.name || '' };
  }
  const parts = String(entry.label || '').trim().split(' ');
  return { grade: parts[0] || '', name: parts.slice(1).join(' ') };
}

function blank() {
  return { version: 1, kdf: KDF, entries: [] };
}

export async function load(force) {
  if (cache && !force) return cache;
  const file = await store.loadAccess();
  cache = file && Array.isArray(file.entries) ? file : blank();
  return cache;
}

export function cached() {
  return cache;
}

export function forget() {
  cache = null;
}

async function commit(file, label) {
  await store.saveAccess(file);
  cache = file;
  return label;
}

function describe(entry) {
  return {
    id: entry.id,
    label: entry.label,
    role: entry.role || 'examinateur',
    manage: entry.manage === true
  };
}

export async function list() {
  const file = await load();
  return file.entries.map(describe);
}

export async function find(id) {
  const file = await load();
  const entry = file.entries.find(item => item.id === id);
  return entry || null;
}

export async function createEntry({ grade, name, manage }) {
  const token = gh.getToken();
  if (!token) throw new Error('Session sans jeton : reconnecte-toi.');

  const cleanGrade = String(grade || '').trim();
  const cleanName = String(name || '').trim();

  if (!cleanGrade) throw new Error('Renseigne le grade.');
  if (!cleanName) throw new Error('Renseigne le nom.');

  const file = await load(true);
  const taken = new Set(file.entries.map(entry => entry.id));
  const id = uniqueId(slugify(cleanName), taken);

  const label = `${cleanGrade} ${cleanName}`;
  const allowed = manage === true;
  const role = allowed ? 'directeur' : 'examinateur';
  const code = generateCode();

  const sealed = await sealPayload(
    { token, name: cleanName, grade: cleanGrade, role, manage: allowed },
    code,
    file.kdf || KDF
  );

  file.entries.push({ id, label, grade: cleanGrade, name: cleanName, role, manage: allowed, ...sealed });
  await commit(file, label);

  return { id, label, role, manage: allowed, code };
}

export async function setManage(id, allowed) {
  const token = gh.getToken();
  if (!token) throw new Error('Session sans jeton : reconnecte-toi.');

  const file = await load(true);
  const entry = file.entries.find(item => item.id === id);
  if (!entry) throw new Error('Accès introuvable.');

  const { grade, name } = identity(entry);
  const role = allowed ? 'directeur' : 'examinateur';
  const code = generateCode();

  const sealed = await sealPayload(
    { token, name, grade, role, manage: allowed },
    code,
    file.kdf || KDF
  );

  Object.assign(entry, { grade, name, role, manage: allowed, ...sealed });
  await commit(file, entry.label);

  return { id, label: entry.label, role, manage: allowed, code };
}

export async function removeEntry(id) {
  const file = await load(true);
  const entry = file.entries.find(item => item.id === id);
  if (!entry) throw new Error('Accès introuvable.');

  file.entries = file.entries.filter(item => item.id !== id);
  return commit(file, entry.label);
}
