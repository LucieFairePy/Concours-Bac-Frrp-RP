import { CONFIG, isConfigured } from '../config.js';
import * as gh from './github-api.js';
import * as store from './store.js';
import * as roster from './roster.js';
import * as vault from './session-store.js';
import { openPayload, normalizeCode, KDF } from './crypto.js';

const PAT_PATTERN = /^(github_pat_|ghp_|gho_|ghu_|ghs_)/;

let session = null;
let expiresAt = 0;

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

export function loadRoster(force) {
  return roster.load(force);
}

export function rosterEntries() {
  const file = roster.cached();
  return file ? file.entries : [];
}

function ttl() {
  const hours = Number(CONFIG.sessionHours);
  return (Number.isFinite(hours) && hours > 0 ? hours : 12) * 3600 * 1000;
}

function remember(credentials) {
  if (!credentials) {
    vault.clear();
    expiresAt = 0;
    return;
  }

  expiresAt = Date.now() + ttl();
  vault.write({ ...credentials, expiresAt });
}

export function expiry() {
  return expiresAt;
}

export function persistent() {
  return vault.persistent();
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

export async function signInWithCode(entryId, code) {
  let file = await roster.load();
  let entry = file.entries.find(item => item.id === entryId);

  if (!entry) {
    file = await roster.load(true);
    entry = file.entries.find(item => item.id === entryId);
  }

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

  remember({ entryId, code: normalizeCode(code) });
  return session;
}

export async function signInWithPat(code) {
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

  remember({ pat: code });
  return session;
}

export async function signIn(entryId, code) {
  if (!isConfigured()) return signInLocal('Examinateur local');
  if (looksLikePat(code)) return signInWithPat(String(code).trim());
  return signInWithCode(entryId, code);
}

export async function restore() {
  const saved = vault.read();
  if (!saved) return { status: 'none' };

  if (!saved.expiresAt || Date.now() >= saved.expiresAt) {
    remember(null);
    return { status: 'expired' };
  }

  try {
    if (saved.pat) return { status: 'ok', session: await signInWithPat(saved.pat) };
    if (saved.entryId) return { status: 'ok', session: await signInWithCode(saved.entryId, saved.code) };
  } catch (error) {
    remember(null);
    return { status: 'invalid', reason: 'ton accès a été modifié ou retiré' };
  }

  remember(null);
  return { status: 'none' };
}

export function signOut() {
  gh.setToken(null);
  remember(null);
  session = null;
  roster.forget();
}

export function describeOperator() {
  if (!session) return 'inconnu';
  return `${session.grade} ${session.name}`.trim() || session.login;
}
