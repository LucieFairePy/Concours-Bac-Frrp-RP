import { CONFIG } from '../config.js';

const API = 'https://api.github.com';
const RAW = 'https://raw.githubusercontent.com';
const MAX_RETRY = 5;

let token = null;

export class GitHubError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
  }
}

export function setToken(value) {
  token = value || null;
}

export function hasToken() {
  return Boolean(token);
}

export function getToken() {
  return token;
}

function headers() {
  const out = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if (token) out.Authorization = `Bearer ${token}`;
  return out;
}

function contentsUrl(path) {
  return `${API}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`;
}

function fresh(url) {
  return `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
}

export function encodeContent(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function decodeContent(base64) {
  const binary = atob(String(base64).replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    method: options.method || 'GET',
    cache: 'no-store',
    headers: headers(),
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const payload = await response.json();
      detail = payload.message || detail;
    } catch (error) {
      detail = response.statusText;
    }
    throw new GitHubError(response.status, detail);
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function viewer() {
  return request(`${API}/user`);
}

async function readRaw(path) {
  const url = `${RAW}/${CONFIG.owner}/${CONFIG.repo}/${CONFIG.dataBranch}/${path}`;
  const response = await fetch(url, { cache: 'no-store' });

  if (response.status === 404) return null;
  if (!response.ok) throw new GitHubError(response.status, response.statusText);

  const text = await response.text();
  try {
    return { value: JSON.parse(text), sha: null };
  } catch (error) {
    throw new GitHubError(422, `JSON invalide dans ${path}`);
  }
}

export async function readJson(path) {
  let payload;
  try {
    payload = await request(fresh(`${contentsUrl(path)}?ref=${CONFIG.dataBranch}`));
  } catch (error) {
    const throttled = error instanceof GitHubError && (error.status === 403 || error.status === 429);
    if (token || !throttled) throw error;
    return readRaw(path);
  }

  if (!payload || !payload.content) return null;
  try {
    return { value: JSON.parse(decodeContent(payload.content)), sha: payload.sha };
  } catch (error) {
    throw new GitHubError(422, `JSON invalide dans ${path}`);
  }
}

export async function listDir(path) {
  const payload = await request(fresh(`${contentsUrl(path)}?ref=${CONFIG.dataBranch}`));
  if (!Array.isArray(payload)) return [];
  return payload.filter(entry => entry.type === 'file');
}

export async function writeJson(path, value, message, sha) {
  if (!token) throw new GitHubError(401, 'Code personnel requis pour enregistrer.');

  const body = {
    message,
    branch: CONFIG.dataBranch,
    content: encodeContent(`${JSON.stringify(value, null, 2)}\n`)
  };
  if (sha) body.sha = sha;
  return request(contentsUrl(path), { method: 'PUT', body });
}

export async function deleteFile(path, message, sha) {
  if (!token) throw new GitHubError(401, 'Code personnel requis pour supprimer.');

  return request(contentsUrl(path), {
    method: 'DELETE',
    body: { message, branch: CONFIG.dataBranch, sha }
  });
}

export async function createJson(path, value, message) {
  return writeJson(path, value, message);
}

export async function updateJson(path, mutate, message) {
  for (let attempt = 0; attempt < MAX_RETRY; attempt += 1) {
    const current = await readJson(path);
    const next = mutate(current ? current.value : null);
    try {
      await writeJson(path, next, message, current ? current.sha : undefined);
      return next;
    } catch (error) {
      const conflict = error instanceof GitHubError && (error.status === 409 || error.status === 422);
      if (!conflict || attempt === MAX_RETRY - 1) throw error;
    }
  }
  throw new GitHubError(409, `Conflit d'écriture persistant sur ${path}`);
}
