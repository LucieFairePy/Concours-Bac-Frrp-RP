import { CONFIG } from '../config.js';

const API = 'https://api.github.com';
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

export async function readJson(path) {
  const payload = await request(`${contentsUrl(path)}?ref=${CONFIG.dataBranch}`);
  if (!payload || !payload.content) return null;
  try {
    return { value: JSON.parse(decodeContent(payload.content)), sha: payload.sha };
  } catch (error) {
    throw new GitHubError(422, `JSON invalide dans ${path}`);
  }
}

export async function listDir(path) {
  const payload = await request(`${contentsUrl(path)}?ref=${CONFIG.dataBranch}`);
  if (!Array.isArray(payload)) return [];
  return payload.filter(entry => entry.type === 'file');
}

export async function writeJson(path, value, message, sha) {
  const body = {
    message,
    branch: CONFIG.dataBranch,
    content: encodeContent(`${JSON.stringify(value, null, 2)}\n`)
  };
  if (sha) body.sha = sha;
  return request(contentsUrl(path), { method: 'PUT', body });
}

export async function deleteFile(path, message, sha) {
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
