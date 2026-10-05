const KEY = 'bac_session';

let memory = null;

function pick(name) {
  try {
    const backend = window[name];
    const probe = '__bac_probe__';
    backend.setItem(probe, '1');
    backend.removeItem(probe);
    return backend;
  } catch (error) {
    return null;
  }
}

function backends() {
  return [pick('localStorage'), pick('sessionStorage')].filter(Boolean);
}

export function persistent() {
  return pick('localStorage') !== null;
}

export function read() {
  for (const backend of backends()) {
    try {
      const raw = backend.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (error) {
      return memory;
    }
  }
  return memory;
}

export function write(value) {
  memory = value;

  for (const backend of backends()) {
    try {
      if (value) backend.setItem(KEY, JSON.stringify(value));
      else backend.removeItem(KEY);
    } catch (error) {
      return;
    }
  }
}

export function clear() {
  write(null);
}
