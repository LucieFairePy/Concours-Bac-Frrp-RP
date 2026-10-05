import { CONFIG, isConfigured } from '../config.js';
import * as gh from './github-api.js';

const SETTINGS_PATH = () => `${CONFIG.dataDir}/settings.json`;
const USERS_PATH = () => `${CONFIG.dataDir}/users.json`;
const ACCESS_PATH = () => `${CONFIG.dataDir}/${CONFIG.accessFile}`;
const INDEX_PATH = () => `${CONFIG.dataDir}/dossiers/index.json`;
const DOSSIERS_DIR = () => `${CONFIG.dataDir}/dossiers`;
const DOSSIER_PATH = id => `${CONFIG.dataDir}/dossiers/${id}.json`;
const DRAFT_PATH = login => `${CONFIG.dataDir}/drafts/${login}.json`;

let operator = '';

export function setOperator(name) {
  operator = name || '';
}

function by() {
  return operator ? ` — par ${operator}` : '';
}

function summarize(dossier) {
  return {
    id: dossier.id,
    last: dossier.c.last,
    first: dossier.c.first,
    grade: dossier.c.grade,
    date: dossier.c.date,
    decision: dossier.decision,
    total: dossier.total ?? null,
    closedAt: dossier.closedAt,
    closedBy: dossier.closedBy || null
  };
}

function nextNumber(ids, year) {
  const prefix = `BAC-${year}-`;
  const used = ids
    .filter(id => id.startsWith(prefix))
    .map(id => parseInt(id.slice(prefix.length), 10))
    .filter(Number.isFinite);
  const next = used.length ? Math.max(...used) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

const memory = {
  settings: null,
  users: [],
  access: null,
  drafts: new Map(),
  dossiers: new Map()
};

const memoryDriver = {
  name: 'memory',
  writable: true,

  async loadUsers() {
    return memory.users;
  },

  async loadAccess() {
    return memory.access;
  },

  async saveAccess(value) {
    memory.access = value;
    return value;
  },

  async loadSettings() {
    return memory.settings;
  },

  async saveSettings(settings) {
    memory.settings = settings;
    return settings;
  },

  async nextDossierId(year) {
    return nextNumber([...memory.dossiers.keys()], year);
  },

  async loadDraft(login) {
    return memory.drafts.get(login) || null;
  },

  async saveDraft(login, dossier) {
    memory.drafts.set(login, dossier);
  },

  async deleteDraft(login) {
    memory.drafts.delete(login);
  },

  async listClosed() {
    return [...memory.dossiers.values()].map(summarize).reverse();
  },

  async getClosed(id) {
    return memory.dossiers.get(id) || null;
  },

  async publishClosed(dossier) {
    memory.dossiers.set(dossier.id, dossier);
    return dossier;
  }
};

const githubDriver = {
  name: 'github',

  get writable() {
    return gh.hasToken();
  },

  async loadUsers() {
    const file = await gh.readJson(USERS_PATH());
    const value = file ? file.value : null;
    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.users)) return value.users;
    return [];
  },

  async loadAccess() {
    const file = await gh.readJson(ACCESS_PATH());
    return file ? file.value : null;
  },

  async saveAccess(value) {
    return gh.updateJson(ACCESS_PATH(), () => value, `chore(access): mise à jour des accès${by()}`);
  },

  async loadSettings() {
    const file = await gh.readJson(SETTINGS_PATH());
    return file ? file.value : null;
  },

  async saveSettings(settings) {
    return gh.updateJson(SETTINGS_PATH(), () => settings, `chore(data): maj paramètres BAC${by()}`);
  },

  async nextDossierId(year) {
    const index = await gh.readJson(INDEX_PATH());
    if (index && Array.isArray(index.value)) {
      return nextNumber(index.value.map(entry => entry.id), year);
    }
    const files = await gh.listDir(DOSSIERS_DIR());
    const ids = files
      .map(file => file.name)
      .filter(name => name.endsWith('.json') && name !== 'index.json')
      .map(name => name.replace(/\.json$/, ''));
    return nextNumber(ids, year);
  },

  async loadDraft(login) {
    const file = await gh.readJson(DRAFT_PATH(login));
    return file ? file.value : null;
  },

  async saveDraft(login, dossier) {
    await gh.updateJson(DRAFT_PATH(login), () => dossier, `chore(data): brouillon ${dossier.id}${by()}`);
  },

  async deleteDraft(login) {
    const file = await gh.readJson(DRAFT_PATH(login));
    if (!file) return;
    await gh.deleteFile(DRAFT_PATH(login), `chore(data): brouillon ${login} archivé${by()}`, file.sha);
  },

  async listClosed() {
    const index = await gh.readJson(INDEX_PATH());
    if (index && Array.isArray(index.value)) {
      return [...index.value].reverse();
    }
    const files = await gh.listDir(DOSSIERS_DIR());
    const names = files
      .map(file => file.name)
      .filter(name => name.endsWith('.json') && name !== 'index.json');
    const loaded = await Promise.all(names.map(name => gh.readJson(`${DOSSIERS_DIR()}/${name}`)));
    return loaded
      .filter(Boolean)
      .map(file => summarize(file.value))
      .reverse();
  },

  async getClosed(id) {
    const file = await gh.readJson(DOSSIER_PATH(id));
    return file ? file.value : null;
  },

  async publishClosed(dossier) {
    let candidate = dossier;
    const year = new Date().getFullYear();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        await gh.createJson(
          DOSSIER_PATH(candidate.id),
          candidate,
          `feat(data): clôture ${candidate.id} — ${candidate.c.last} ${candidate.c.first}${by()}`
        );
        break;
      } catch (error) {
        const taken = error instanceof gh.GitHubError && (error.status === 422 || error.status === 409);
        if (!taken || attempt === 4) throw error;
        candidate = { ...candidate, id: await this.nextDossierId(year) };
      }
    }

    await gh.updateJson(
      INDEX_PATH(),
      current => {
        const list = Array.isArray(current) ? current.filter(entry => entry.id !== candidate.id) : [];
        list.push(summarize(candidate));
        return list;
      },
      `chore(data): index ${candidate.id}${by()}`
    );

    return candidate;
  }
};

let driver = memoryDriver;

export async function detectDriver() {
  driver = isConfigured() ? githubDriver : memoryDriver;
  return driver.name;
}

export function loadUsers() {
  return driver.loadUsers();
}

export function loadAccess() {
  return driver.loadAccess();
}

export function saveAccess(value) {
  return driver.saveAccess(value);
}

export function loadSettings() {
  return driver.loadSettings();
}

export function saveSettings(settings) {
  return driver.saveSettings(settings);
}

export function nextDossierId(year) {
  return driver.nextDossierId(year);
}

export function loadDraft(login) {
  return driver.loadDraft(login);
}

export function saveDraft(login, dossier) {
  return driver.saveDraft(login, dossier);
}

export function deleteDraft(login) {
  return driver.deleteDraft(login);
}

export function listClosed() {
  return driver.listClosed();
}

export function getClosed(id) {
  return driver.getClosed(id);
}

export function publishClosed(dossier) {
  return driver.publishClosed(dossier);
}
