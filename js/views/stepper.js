// Parcours en étapes, générique — cahier des charges §16.
//
// Le concours a son propre navigateur d'étapes (js/views/navigation.js),
// écrit avant le portail et laissé intact pour ne rien casser. Les modules
// ajoutés ensuite partagent celui-ci : mêmes onglets, même barre de
// progression, mêmes boutons « étape précédente / suivante ».
//
// createStepper() ne connaît ni les formations ni les examens : on lui
// donne la liste des étapes et ce qu'il faut faire quand l'une s'ouvre.

import { byId, qsa, esc } from '../core/dom.js';

export function createStepper({ steps, onOpen, validate, nextLabel }) {
  function indexOf(id) {
    return steps.findIndex(step => step.id === id);
  }

  function current() {
    const found = steps.findIndex(step => byId(`s-${step.id}`)?.classList.contains('active'));
    return Math.max(0, found);
  }

  function renderProgress() {
    const index = current();
    const bar = byId('prog');
    const text = byId('stepText');
    if (bar) bar.style.width = `${((index + 1) / steps.length) * 100}%`;
    if (text) text.textContent = `Étape ${index + 1} sur ${steps.length} — ${steps[index].label}`;
  }

  function renderTabs() {
    const host = byId('tabs');
    if (!host) return;
    host.innerHTML = steps.map((step, index) =>
      `<button class="tab ${index ? '' : 'active'}" data-t="${esc(step.id)}"
               onclick="app.openStep('${esc(step.id)}')">${esc(step.label)}</button>`
    ).join('');
  }

  function openStep(id) {
    qsa('.section').forEach(node => node.classList.remove('active'));
    qsa('.tab').forEach(node => node.classList.remove('active'));
    byId(`s-${id}`)?.classList.add('active');
    document.querySelector(`[data-t="${id}"]`)?.classList.add('active');

    renderProgress();
    if (onOpen) onOpen(id);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function move(delta) {
    const index = current();
    if (delta > 0 && validate && !validate(steps[index].id)) return;
    const target = Math.max(0, Math.min(steps.length - 1, index + delta));
    openStep(steps[target].id);
  }

  function stepNav(index) {
    const previous = index
      ? '<button onclick="app.step(-1)">← Étape précédente</button>'
      : '';
    const label = (nextLabel && nextLabel[index]) || 'Valider et passer à l’étape suivante →';
    const next = index < steps.length - 1
      ? `<button class="primary right" onclick="app.step(1)">${label}</button>`
      : '';
    return `<div class="stepnav no-print">${previous}${next}</div>`;
  }

  return { steps, indexOf, current, openStep, move, stepNav, renderProgress, renderTabs };
}
