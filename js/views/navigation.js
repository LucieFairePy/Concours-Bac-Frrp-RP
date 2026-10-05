import { STEPS, NEXT_LABEL } from '../data/steps.js';
import { byId, qsa } from '../core/dom.js';
import { state } from '../core/state.js';
import { renderCorrection } from './correction.js';
import { renderResults } from './results.js';
import { renderDossier } from './dossier.js';

export function stepNav(index) {
  const previous = index
    ? '<button onclick="app.step(-1)">← Étape précédente</button>'
    : '';
  const label = NEXT_LABEL[index] || 'Valider et passer à l’étape suivante →';
  const next = index < STEPS.length - 1
    ? `<button class="primary right" onclick="app.step(1)">${label}</button>`
    : '';
  return `<div class="stepnav no-print">${previous}${next}</div>`;
}

export function currentStep() {
  const index = STEPS.findIndex(step => byId(`s-${step[0]}`)?.classList.contains('active'));
  return Math.max(0, index);
}

export function renderProgress() {
  const index = currentStep();
  const bar = byId('prog');
  const text = byId('stepText');
  if (bar) bar.style.width = `${((index + 1) / STEPS.length) * 100}%`;
  if (text) text.textContent = `Étape ${index + 1} sur ${STEPS.length} — ${STEPS[index][1]}`;
}

export function validateStep(index) {
  if (index !== 0) return true;
  const { last, first, grade } = state.dossier.c;
  if (!last.trim() || !first.trim() || !grade.trim()) {
    window.alert('Renseigne le nom, le prénom et le grade.');
    return false;
  }
  return true;
}

export function openStep(id) {
  qsa('.section').forEach(node => node.classList.remove('active'));
  qsa('.tab').forEach(node => node.classList.remove('active'));
  byId(`s-${id}`)?.classList.add('active');
  document.querySelector(`[data-t="${id}"]`)?.classList.add('active');

  renderProgress();
  if (id === 'correct') renderCorrection();
  if (id === 'results') renderResults();
  if (id === 'final') renderDossier();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function step(delta) {
  const index = currentStep();
  if (delta > 0 && !validateStep(index)) return;
  const target = Math.max(0, Math.min(STEPS.length - 1, index + delta));
  openStep(STEPS[target][0]);
}

export function openView(name) {
  qsa('.view').forEach(node => { node.style.display = 'none' });
  const view = byId(name);
  if (view) view.style.display = 'block';
}
