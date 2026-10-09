// Gabarits des huit onglets de l'examen Chef de Groupe — textes et
// structure de modules/examen-chef-groupe.html (archive V4), mot pour mot.
//
// Rendu seul : l'état et les actions vivent dans index.js. `v.d` vaut
// 'disabled' quand le dossier est en lecture seule ; `v.can*` disent ce
// que le rôle de l'examinateur permet sur la fiche finale.

import { esc } from '../../core/dom.js';
import { STEPS, LEAD_QUESTIONS, DECISIONS } from '../../data/cdg-examen.js';
import { analyze, totals, suggestion, suggestS1, suggestS2, suggestRadio } from './bareme.js';
import { examinerOf } from './dossier.js';

// Paraphe de la fiche de l'archive : « BOUSSERE Kevin » → KB.
const paraphe = name => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return parts.length > 1 ? (parts[parts.length - 1][0] + parts[0][0]).toUpperCase() : (parts[0] || '').slice(0, 2).toUpperCase();
};
const label = code => (DECISIONS.find(([value]) => value === code) || [code, code])[1];
const next = (step, text) => `<button class="mx-btn" onclick="app.openStep('${step}')">${text} →</button>`;

export function stepsBar(cur) {
  return STEPS.map(([id, text]) =>
    `<button class="${cur === id ? 'on' : ''}" onclick="app.openStep('${id}')">${text}</button>`).join('');
}

function identite(R, v) {
  const fields = [['last', 'Nom'], ['first', 'Prénom'], ['grade', 'Grade'], ['mat', 'Matricule'], ['date', 'Date'], ['heure', 'Heure']]
    .map(([key, text]) => `<div class="mx-field"><label>${text}</label><input ${v.d} value="${esc(R.c[key])}" oninput="app.setC('${key}',this.value)"></div>`)
    .join('');
  return `<div class="mx-card"><h2>Identité — ${esc(R.id)}</h2><div class="mx-grid2">${fields}</div>`
    + `<div class="mx-field"><label>Examinateur</label><input ${v.d} value="${esc(examinerOf(R))}" oninput="app.setExaminer(this.value)"></div>`
    + `${next('q', 'Commencer')}</div>`;
}

function questions(R, v) {
  const list = R.qs.map((x, i) =>
    `<div class="mx-q"><span class="mx-tag">QUESTION ${i + 1}</span><h3>${esc(x.q)}</h3>`
    + `<textarea ${v.d} oninput="app.setAns(${i},this.value)">${esc(R.ans[i])}</textarea></div>`).join('');
  return `<div class="mx-card"><h2>Connaissances essentielles — /200</h2><p>10 questions générées et figées pour ce candidat.</p>${list}${next('lead', 'Commandement')}</div>`;
}

function commandement(R, v) {
  const list = LEAD_QUESTIONS.map((x, i) =>
    `<div class="mx-q"><h3>${i + 1}. ${esc(x[0])}</h3>`
    + `<textarea ${v.d} oninput="app.setLead(${i},this.value)">${esc(R.lead[i])}</textarea></div>`).join('');
  return `<div class="mx-card"><h2>Commandement / leadership — /200</h2>${list}${next('s1', 'Situation 1')}</div>`;
}

function situation(R, i, v) {
  const s = R.s[i];
  return `<div class="mx-card"><span class="mx-tag">Mise en situation ${i + 1}</span><h2>${esc(s.txt)}</h2>`
    + `<div class="mx-rp"><b>ÉVOLUTION À INJECTER</b><br>${esc(s.evol)}</div>`
    + `<div class="mx-field"><label>Réponse / décisions du candidat</label><textarea ${v.d} oninput="app.setSit(${i},this.value)">${esc(s.ans)}</textarea></div>`
    + `${i === 0 ? next('s2', 'Situation 2') : next('corr', 'Correction')}</div>`;
}

const scoreInput = (v, value, suggested, max, call, min = '') =>
  `<input type="number" ${min}max="${max}" ${v.d} value="${esc(value)}" placeholder="${suggested}" oninput="${call}">`;

function correction(R, v) {
  const qs = R.qs.map((x, i) => {
    const a = analyze(R.ans[i], x.keys, 20);
    return `<div class="mx-q"><h3>${i + 1}. ${esc(x.q)}</h3><p>${esc(R.ans[i]) || '—'}</p>`
      + `<div class="mx-suggest"><b>Suggestion : ${a.score}/20</b><br>Repéré : ${esc(a.hit.join(', ')) || '—'}<br>À vérifier / manquant : ${esc(a.miss.join(', ')) || '—'}</div>`
      + `<div class="mx-scoreline"><span>L’examinateur peut conserver ou modifier.</span>${scoreInput(v, R.marks.q[i], a.score, 20, `app.setMark('q',${i},this.value)`, 'min="0" ')}</div></div>`;
  }).join('');

  const lead = LEAD_QUESTIONS.map((x, i) => {
    const a = analyze(R.lead[i], x[1], 40);
    return `<div class="mx-q"><h3>Leadership ${i + 1}</h3><p>${esc(R.lead[i]) || '—'}</p>`
      + `<div class="mx-suggest">Suggestion : <b>${a.score}/40</b></div>`
      + `<div class="mx-scoreline"><span>Note retenue</span>${scoreInput(v, R.marks.lead[i], a.score, 40, `app.setMark('lead',${i},this.value)`)}</div></div>`;
  }).join('');

  const a1 = suggestS1(R);
  const a2 = suggestS2(R);
  return `<div class="mx-card"><h2>Correction assistée</h2>`
    + `<div class="mx-warn"><b>Règle :</b> les suggestions sont une aide. La note retenue appartient à l’examinateur.</div>`
    + `<h2>Questions /200</h2>${qs}<h2>Commandement /200</h2>${lead}`
    + `<div class="mx-q"><h3>Situation 1 /250</h3><div class="mx-suggest">Suggestion : <b>${a1.score}/250</b></div>${scoreInput(v, R.marks.s1, a1.score, 250, "app.setMark('s1',null,this.value)")}</div>`
    + `<div class="mx-q"><h3>Situation 2 /250</h3><div class="mx-suggest">Suggestion : <b>${a2.score}/250</b></div>${scoreInput(v, R.marks.s2, a2.score, 250, "app.setMark('s2',null,this.value)")}</div>`
    + `<div class="mx-q"><h3>Radio &amp; compte rendu /100</h3><div class="mx-suggest">Suggestion calculée à partir des deux situations.</div>${scoreInput(v, R.marks.radio, suggestRadio(R).score, 100, "app.setMark('radio',null,this.value)")}</div>`
    + `${next('res', 'Résultats')}</div>`;
}

function resultat(R, v) {
  const t = totals(R);
  const options = DECISIONS.map(([code, text]) =>
    `<option value="${code}" ${R.decision === code ? 'selected' : ''}>${text}</option>`).join('');
  return `<div class="mx-card"><h2>Résultats</h2><table><tr><th>Épreuve</th><th>Note</th></tr>`
    + `<tr><td>Connaissances</td><td>${t.q}/200</td></tr><tr><td>Commandement</td><td>${t.l}/200</td></tr>`
    + `<tr><td>Situation 1</td><td>${t.s1}/250</td></tr><tr><td>Situation 2</td><td>${t.s2}/250</td></tr>`
    + `<tr><td>Radio / compte rendu</td><td>${t.ra}/100</td></tr></table>`
    + `<p class="mx-result">${t.total}/1000</p><div class="mx-suggest">Suggestion du système : <b>${label(suggestion(R))}</b></div>`
    + `<div class="mx-field"><label>Décision finale de l’examinateur</label><select ${v.d} onchange="app.setDecision(this.value)"><option></option>${options}</select></div>`
    + `<div class="mx-field"><label>Motif / observations</label><textarea ${v.d} oninput="app.setReason(this.value)">${esc(R.reason)}</textarea></div>`
    + `${next('final', 'Fiche finale')}</div>`;
}

function fiche(R, v) {
  const t = totals(R);
  const cmd = R.cmd || {};
  const director = `${cmd.dg || ''} ${cmd.dn || ''}`.trim();
  const deputy = `${cmd.ag || ''} ${cmd.an || ''}`.trim();
  const locked = R.locked ? `<p class="mx-locked noPrint">Dossier clôturé — lecture seule.</p>` : '';
  const actions = [
    '<button class="mx-btn" onclick="app.print()">Imprimer / PDF</button>',
    v.canClose ? `<button class="mx-btn red" onclick="app.close()">CLÔTURER DÉFINITIVEMENT</button>` : '',
    v.canNew ? '<button class="mx-btn" onclick="app.newExam()">Nouvel examen</button>' : '',
    v.canRectify ? '<button class="mx-btn ghost" onclick="app.rectify()">Créer une version rectificative</button>' : ''
  ].join('');

  return `<div class="mx-card mx-fiche"><h2>FICHE FINALE — ${esc(R.id)}</h2>`
    + `<p><b>${esc(R.c.last)} ${esc(R.c.first)}</b> · ${esc(R.c.grade)} · ${esc(R.c.mat)}</p>`
    + `<p>Date : ${esc(R.c.date)} ${esc(R.c.heure)} · Examinateur : ${esc(examinerOf(R))}</p>`
    + `<table><tr><th>Catégorie</th><th>Résultat</th></tr>`
    + `<tr><td>Connaissances</td><td>${t.q}/200</td></tr><tr><td>Commandement</td><td>${t.l}/200</td></tr>`
    + `<tr><td>Mise en situation 1</td><td>${t.s1}/250</td></tr><tr><td>Mise en situation 2</td><td>${t.s2}/250</td></tr>`
    + `<tr><td>Radio / compte rendu</td><td>${t.ra}/100</td></tr></table>`
    + `<p class="mx-result">${t.total}/1000</p>`
    + `<p>Suggestion système : <b>${label(R.locked && R.suggestedDecision ? R.suggestedDecision : suggestion(R))}</b></p>`
    + `<p>Décision humaine : <b>${R.decision ? label(R.decision) : 'NON RENSEIGNÉE'}</b></p>`
    + `<p>${esc(R.reason)}</p>`
    + `<div class="mx-signature"><div class="mx-sig"><b>Candidat</b><span>Signature</span></div><div class="mx-sig"><b>Examinateur</b><span>Signature</span></div>`
    + `<div class="mx-sig"><b>Directeur BAC</b><small>${esc(director)}</small><span>${esc(paraphe(cmd.dn))}</span></div>`
    + `<div class="mx-sig"><b>Directeur adjoint</b><small>${esc(deputy)}</small><span>${esc(paraphe(cmd.an))}</span></div></div>`
    + `${locked}<div class="mx-row noPrint" style="margin-top:14px">${actions}</div></div>`;
}

/** Contenu de l'onglet `cur`, dans sa section `#s-<onglet>`. */
export function stepView(cur, R, v) {
  const body = cur === 'id' ? identite(R, v)
    : cur === 'q' ? questions(R, v)
      : cur === 'lead' ? commandement(R, v)
        : cur === 's1' ? situation(R, 0, v)
          : cur === 's2' ? situation(R, 1, v)
            : cur === 'corr' ? correction(R, v)
              : cur === 'res' ? resultat(R, v)
                : fiche(R, v);
  return `<section id="s-${cur}" class="mx-step${cur === 'final' ? ' mx-print' : ''}">${body}</section>`;
}
