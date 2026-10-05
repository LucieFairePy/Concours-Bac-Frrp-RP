import * as gh from './github-api.js';
import * as store from './store.js';
import { sealPayload, generateCode, KDF } from './crypto.js';

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

async function readFile() {
  const file = await store.loadAccess();
  if (file && Array.isArray(file.entries)) return file;
  return { version: 1, kdf: KDF, entries: [] };
}

export async function list() {
  const file = await readFile();
  return file.entries.map(entry => ({
    id: entry.id,
    label: entry.label,
    role: entry.role || 'examinateur',
    manage: entry.manage === true
  }));
}

export async function createEntry({ grade, name, manage }) {
  const token = gh.getToken();
  if (!token) throw new Error('Session sans jeton : reconnecte-toi.');

  const cleanGrade = String(grade || '').trim();
  const cleanName = String(name || '').trim();

  if (!cleanGrade) throw new Error('Renseigne le grade.');
  if (!cleanName) throw new Error('Renseigne le nom.');

  const file = await readFile();
  const taken = new Set(file.entries.map(entry => entry.id));
  const id = uniqueId(slugify(cleanName), taken);

  const label = `${cleanGrade} ${cleanName}`;
  const role = manage ? 'directeur' : 'examinateur';
  const code = generateCode();

  const sealed = await sealPayload(
    { token, name: cleanName, grade: cleanGrade, role, manage: manage === true },
    code,
    file.kdf || KDF
  );

  file.entries.push({ id, label, role, manage: manage === true, ...sealed });
  await store.saveAccess(file);

  return { id, label, role, manage: manage === true, code };
}

export async function removeEntry(id) {
  const file = await readFile();
  const entry = file.entries.find(item => item.id === id);
  if (!entry) throw new Error('Accès introuvable.');

  file.entries = file.entries.filter(item => item.id !== id);
  await store.saveAccess(file);

  return entry.label;
}
