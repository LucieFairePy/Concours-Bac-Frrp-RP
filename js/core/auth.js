import { isConfigured } from '../config.js';
import * as gh from './github-api.js';
import * as store from './store.js';

const TAB_KEY = 'bac_tab_code';

let session = null;

export function current() {
  return session;
}

export function canWrite() {
  return Boolean(session && session.canWrite);
}

function matchUser(users, login) {
  const needle = String(login).toLowerCase();
  return users.find(user => String(user.login || '').toLowerCase() === needle) || null;
}

function readTabCode() {
  try {
    return sessionStorage.getItem(TAB_KEY) || '';
  } catch (error) {
    return '';
  }
}

function writeTabCode(code) {
  try {
    if (code) sessionStorage.setItem(TAB_KEY, code);
    else sessionStorage.removeItem(TAB_KEY);
  } catch (error) {
    return;
  }
}

export async function signInLocal(displayName) {
  session = {
    login: 'local',
    name: displayName || 'Examinateur local',
    grade: '',
    role: 'examinateur',
    canWrite: true,
    offline: true
  };
  return session;
}

export async function signIn(code, keepForTab) {
  if (!isConfigured()) {
    return signInLocal('Examinateur local');
  }

  gh.setToken(code);

  let account;
  try {
    account = await gh.viewer();
  } catch (error) {
    gh.setToken(null);
    if (error.status === 401) throw new Error('Code refusé par GitHub. Vérifie le code personnel.');
    throw error;
  }

  if (!account || !account.login) {
    gh.setToken(null);
    throw new Error('Code invalide : impossible de lire le compte GitHub associé.');
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
    canWrite: true,
    offline: false
  };

  writeTabCode(keepForTab ? code : '');
  return session;
}

export async function signInReadOnly() {
  gh.setToken(null);
  session = {
    login: 'lecture',
    name: 'Consultation',
    grade: '',
    role: 'lecture',
    canWrite: false,
    offline: false
  };
  return session;
}

export async function restore() {
  const code = readTabCode();
  if (!code) return null;
  try {
    return await signIn(code, true);
  } catch (error) {
    writeTabCode('');
    return null;
  }
}

export function signOut() {
  gh.setToken(null);
  writeTabCode('');
  session = null;
}
