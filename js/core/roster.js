import * as gh from './github-api.js';
import * as store from './store.js';
import { sealPayload, generateCode, KDF } from './crypto.js';
import { normalizeRole, roleGrantsManage, roleFromLegacy } from './roles.js';

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
    grade: entry.grade || identity(entry).grade,
    name: entry.name || identity(entry).name,
    role: roleFromLegacy(entry.role, entry.manage === true),
    manage: entry.manage === true
  };
}

// Une seule fonction scelle : création, changement de rôle et bascule
// `manage` passent toutes par ici, pour qu'il n'existe qu'un seul endroit
// où un rôle est écrit dans la charge chiffrée.
async function seal(file, entry, role) {
  const token = gh.getToken();
  if (!token) throw new Error('Session sans jeton : reconnecte-toi.');

  const wanted = normalizeRole(role);
  const manage = roleGrantsManage(wanted);
  const { grade, name } = identity(entry);
  const code = generateCode();

  const sealed = await sealPayload(
    { token, name, grade, role: wanted, manage },
    code,
    file.kdf || KDF
  );

  Object.assign(entry, { grade, name, role: wanted, manage, ...sealed });
  return { code, role: wanted, manage };
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

export async function createEntry({ grade, name, role, manage }) {
  const cleanGrade = String(grade || '').trim();
  const cleanName = String(name || '').trim();

  if (!cleanGrade) throw new Error('Renseigne le grade.');
  if (!cleanName) throw new Error('Renseigne le nom.');

  const file = await load(true);
  const taken = new Set(file.entries.map(entry => entry.id));
  const id = uniqueId(slugify(cleanName), taken);

  // `manage` reste accepté pour les appels anciens : une case cochée vaut
  // « directeur adjoint », une case décochée vaut « formateur ».
  const wanted = role || (manage === true ? 'adjoint' : 'formateur');

  const entry = { id, label: `${cleanGrade} ${cleanName}`, grade: cleanGrade, name: cleanName };
  const out = await seal(file, entry, wanted);

  file.entries.push(entry);
  await commit(file, entry.label);

  return { id, label: entry.label, role: out.role, manage: out.manage, code: out.code };
}

export async function setRole(id, role) {
  const file = await load(true);
  const entry = file.entries.find(item => item.id === id);
  if (!entry) throw new Error('Accès introuvable.');

  const out = await seal(file, entry, role);
  await commit(file, entry.label);

  return { id, label: entry.label, role: out.role, manage: out.manage, code: out.code };
}

export async function removeEntry(id) {
  const file = await load(true);
  const entry = file.entries.find(item => item.id === id);
  if (!entry) throw new Error('Accès introuvable.');

  file.entries = file.entries.filter(item => item.id !== id);
  return commit(file, entry.label);
}
