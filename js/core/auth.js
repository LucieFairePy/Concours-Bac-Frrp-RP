import { isConfigured } from '../config.js';
import * as gh from './github-api.js';
import * as store from './store.js';
import { openPayload, normalizeCode, KDF } from './crypto.js';

const TAB_KEY = 'bac_tab_session';
const PAT_PATTERN = /^(github_pat_|ghp_|gho_|ghu_|ghs_)/;

let session = null;
let roster = null;

export function current() {
  return session;
}

export function canWrite() {
  return Boolean(session && session.canWrite);
}

export function canManage() {
  return Boolean(session && session.manage);
}

export function looksLikePat(code) {
  return PAT_PATTERN.test(String(code || '').trim());
}

export async function loadRoster(force) {
  if (roster && !force) return roster;
  const file = await store.loadAccess();
  roster = file || { version: 1, kdf: KDF, entries: [] };
  return roster;
}

export function rosterEntries() {
  return roster ? roster.entries : [];
}

function readTabSession() {
  try {
    const raw = sessionStorage.getItem(TAB_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function writeTabSession(value) {
  try {
    if (value) sessionStorage.setItem(TAB_KEY, JSON.stringify(value));
    else sessionStorage.removeItem(TAB_KEY);
  } catch (error) {
    return;
  }
}

function matchUser(users, login) {
  const needle = String(login).toLowerCase();
  return users.find(user => String(user.login || '').toLowerCase() === needle) || null;
}

export async function signInLocal(displayName) {
  session = {
    login: 'local',
    name: displayName || 'Examinateur local',
    grade: '',
    role: 'examinateur',
    manage: true,
    canWrite: true,
    offline: true
  };
  return session;
}

export async function signInWithCode(entryId, code, keepForTab) {
  const file = await loadRoster();
  const entry = file.entries.find(item => item.id === entryId);

  if (!entry) throw new Error('Examinateur inconnu. Recharge la page.');
  if (!normalizeCode(code)) throw new Error('Entre ton code.');

  const payload = await openPayload(entry, code, file.kdf || KDF);
  if (!payload || !payload.token) throw new Error('Code incorrect.');

  gh.setToken(payload.token);

  session = {
    login: entry.id,
    name: payload.name || entry.label,
    grade: payload.grade || '',
    role: payload.role || 'examinateur',
    manage: payload.manage === true,
    canWrite: true,
    offline: false
  };

  writeTabSession(keepForTab ? { entryId, code: normalizeCode(code) } : null);
  return session;
}

export async function signInWithPat(code, keepForTab) {
  gh.setToken(code);

  let account;
  try {
    account = await gh.viewer();
  } catch (error) {
    gh.setToken(null);
    if (error.status === 401) throw new Error('Jeton refusé par GitHub.');
    throw error;
  }

  if (!account || !account.login) {
    gh.setToken(null);
    throw new Error('Jeton invalide : compte GitHub illisible.');
  }

  const users = await store.loadUsers();
  const profile = matchUser(users, account.login);

  if (users.length && !profile) {
    gh.setToken(null);
    throw new Error(`Le compte ${account.login} n'est pas déclaré dans data/users.json.`);
  }

  session = {
    login: account.login,
    name: (profile && profile.name) || account.name || account.login,
    grade: (profile && profile.grade) || '',
    role: (profile && profile.role) || 'examinateur',
    manage: true,
    canWrite: true,
    offline: false
  };

  writeTabSession(keepForTab ? { pat: code } : null);
  return session;
}

export async function signIn(entryId, code, keepForTab) {
  if (!isConfigured()) return signInLocal('Examinateur local');
  if (looksLikePat(code)) return signInWithPat(String(code).trim(), keepForTab);
  return signInWithCode(entryId, code, keepForTab);
}

export async function restore() {
  const saved = readTabSession();
  if (!saved) return null;

  try {
    if (saved.pat) return await signInWithPat(saved.pat, true);
    if (saved.entryId) return await signInWithCode(saved.entryId, saved.code, true);
  } catch (error) {
    writeTabSession(null);
    return null;
  }

  return null;
}

export function signOut() {
  gh.setToken(null);
  writeTabSession(null);
  session = null;
}

export function describeOperator() {
  if (!session) return 'inconnu';
  return `${session.grade} ${session.name}`.trim() || session.login;
}
