export function byId(id) {
  return document.getElementById(id);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

const ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
};

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ENTITIES[ch]);
}

export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/);
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0] || '').slice(0, 2).toUpperCase();
}

export function setHTML(id, html) {
  const node = byId(id);
  if (node) node.innerHTML = html;
}

export function setText(id, text) {
  const node = byId(id);
  if (node) node.textContent = text;
}
