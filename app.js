'use strict';

const steps = [
  ['CROSS-STAGE EVIDENCE', 'A metric tells you what changed. Reports help explain where to look.', 'Correlate timing paths, interconnect delay, congestion, and violations across implementation stages. Keep supporting evidence, contradictions, and uncertainty attached to each hypothesis.'],
  ['COMMIT BEFORE EXECUTION', 'Make the action—and its expected effect—explicit.', 'Construct a constrained engineering action with an objective, supporting evidence, protection bounds, and estimated cost. Commit beneficial, neutral, or harmful predictions before execution; abstain when the evidence is insufficient.'],
  ['REAL EDA FEEDBACK', 'Execute the intervention. Check the observed response.', 'The harness checks compatibility and reuses eligible stage checkpoints. An evaluator independent of the LLM assesses the primary outcome and the predicted physical response separately.'],
  ['BOUNDED SKILL ADAPTATION', 'Keep useful experience. Validate revisions before promotion.', 'Collect, reflect, revise, and validate. Compare incumbent and revised policies on subsequent paired shadow cases, then promote, reject, or defer. Shadow validation checks decisions; separate executed comparisons are needed to establish PPA benefit.']
];
document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-step]').forEach(item => {
    const active = item === button;
    item.classList.toggle('selected', active);
    item.setAttribute('aria-pressed', String(active));
  });
  const [kicker, title, description] = steps[Number(button.dataset.step)];
  document.getElementById('step-kicker').textContent = kicker;
  document.getElementById('step-title').textContent = title;
  document.getElementById('step-description').textContent = description;
}));

const traces = [
  {title: 'A hold violation, with incomplete causal evidence.', copy: 'The reports show a net-dominated path, a hold violation, and global overflow. The diagnosis remains uncertain exploration rather than a confirmed physical cause.', facts: [['Net delay / path delay', '2.364 / 3.345 ns'], ['Hold WNS', '−0.372 ns'], ['Placement evidence', 'Global overflow observed']], status: 'PHYSICAL CAUSALITY NOT ESTABLISHED'},
  {title: 'Test the hold-margin / implementation-cost trade-off.', copy: 'Increase the hold target slack from 2% to 2.5%. Buffer-specific cost evidence is unavailable, and the pre-execution prediction abstains.', facts: [['Selected action', 'hold_target_slack: 2% → 2.5%'], ['Beneficial / Neutral / Harmful', '0.387 / 0.387 / 0.226'], ['Prediction classification', 'Abstain']], status: 'PREDICTION RECORDED BEFORE EXECUTION'},
  {title: 'The primary benefit is not confirmed.', copy: 'The measured hold WNS and DRC count remain unchanged. The evaluator distinguishes the neutral primary response from an inconclusive physical mechanism.', facts: [['Hold WNS · before → after', '−0.372 → −0.372 ns'], ['DRC · before → after', '51 → 51'], ['Response / mechanism', 'Neutral / Inconclusive']], status: 'NO CONFIRMED IMPROVEMENT'},
  {title: 'Retain the observation without promoting a new skill.', copy: 'The trace preserves evidence, hypothesis, prediction, action, and outcome. Reflection proposes requiring delay decomposition, but no update is promoted in this example.', facts: [['Reflection', 'Primary benefit unconfirmed'], ['Candidate revision', 'Require delay decomposition'], ['Experience scope', 'Compatible design context only']], status: 'NO PROMOTED UPDATE'}
];
let traceIndex = 0;
function renderTrace(index) {
  traceIndex = index;
  const trace = traces[index];
  document.getElementById('trace-title').textContent = trace.title;
  document.getElementById('trace-copy').textContent = trace.copy;
  document.getElementById('trace-status').textContent = trace.status;
  document.getElementById('trace-counter').textContent = `0${index + 1} / 04`;
  document.getElementById('trace-next').textContent = index === 3 ? 'Back to evidence ↺' : 'Next step →';
  const facts = document.getElementById('trace-facts');
  facts.replaceChildren();
  trace.facts.forEach(([label, value]) => {
    const row = document.createElement('div'); row.className = 'trace-fact';
    const key = document.createElement('span'); key.textContent = label;
    const result = document.createElement('strong'); result.textContent = value;
    row.append(key, result); facts.append(row);
  });
  document.querySelectorAll('[data-trace]').forEach(button => {
    const active = Number(button.dataset.trace) === index;
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
}
document.querySelectorAll('[data-trace]').forEach(button => button.addEventListener('click', () => renderTrace(Number(button.dataset.trace))));
document.getElementById('trace-next').addEventListener('click', () => renderTrace((traceIndex + 1) % traces.length));
renderTrace(0);

const dialog = document.getElementById('figure-dialog');
document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
  const img = document.getElementById('dialog-img');
  img.src = button.dataset.image;
  img.alt = button.dataset.caption;
  document.getElementById('dialog-caption').textContent = button.dataset.caption;
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}));
document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

const metrics = {
  ecp: {title: 'Effective clock period', direction: 'Lower is better · ns', digits: 3},
  power: {title: 'Power', direction: 'Lower is better · manuscript units unspecified', digits: 3},
  area: {title: 'Cell area', direction: 'Lower is better · µm²', digits: 1},
  drc: {title: 'Design-rule violations', direction: 'Lower is better · count', digits: 0},
  accuracy: {title: 'Prediction accuracy', direction: 'Higher is better · %', digits: 2}
};
const insights = {
  ecp: 'Full has the lowest ECP in both manuscript ablation groups. ECP = target clock period − worst setup slack; it is not a verified maximum operating frequency.',
  power: 'Inspect power independently of timing: Full does not have the lowest reported CPU Tile power. The NoCRouter values include a tie at the manuscript’s displayed precision.',
  area: 'Area exposes another trade-off: w/o Diagnosis has the smallest reported CPU Tile cell area, while Full has the smallest NoCRouter cell area.',
  drc: 'All six selected ablation points report zero DRC. This alone does not establish that all timing and signoff requirements are satisfied.',
  accuracy: 'These are the prediction accuracies reported in the manuscript. Accuracy measures prediction agreement, not how often an action improves PPA.'
};
function appendRow(body, values) {
  const row = document.createElement('tr');
  values.forEach((value, index) => {
    const cell = document.createElement(index === 0 ? 'th' : 'td');
    if (index === 0) cell.scope = 'row';
    cell.textContent = value; row.append(cell);
  });
  body.append(row);
}
function renderResults(data) {
  const design = document.getElementById('design-select').value;
  const metric = document.getElementById('metric-select').value;
  const config = metrics[metric];
  const rows = data.ablation[design];
  document.getElementById('chart-title').textContent = `${design} · ${config.title}`;
  document.getElementById('chart-direction').textContent = config.direction;
  document.getElementById('chart-insight').textContent = insights[metric];
  const chart = document.getElementById('ablation-chart'); chart.replaceChildren();
  const maximum = metric === 'accuracy' ? 100 : Math.max(...rows.map(row => row[metric])) * 1.08 || 1;
  rows.forEach(row => {
    const element = document.createElement('div'); element.className = 'bar-row';
    const label = document.createElement('span'); label.textContent = row.method;
    const track = document.createElement('div'); track.className = 'bar-track'; track.setAttribute('aria-hidden', 'true');
    const bar = document.createElement('div'); bar.className = row.method === 'Full' ? 'bar full' : 'bar';
    bar.style.width = `${row[metric] / maximum * 100}%`; track.append(bar);
    const value = document.createElement('strong'); value.textContent = row[metric].toFixed(config.digits);
    element.append(label, track, value); chart.append(element);
  });
  const table = document.getElementById('ablation-table'); table.replaceChildren();
  rows.forEach(row => appendRow(table, [row.method, row.ecp.toFixed(3), row.power.toFixed(3), row.area.toFixed(1), row.drc, row.accuracy.toFixed(2)]));
}
async function loadData() {
  try {
    const response = await fetch('data/paper-results.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    renderResults(data);
    ['design-select', 'metric-select'].forEach(id => document.getElementById(id).addEventListener('change', () => renderResults(data)));
    const table = document.getElementById('stability-table');
    data.stability.forEach(row => appendRow(table, [row.node, row.design, row.default.toFixed(3), ...row.runs.map(value => value.toFixed(3)), `${row.mean.toFixed(3)} ± ${row.std.toFixed(3)}`]));
    document.getElementById('data-status').textContent = data.status;
  } catch (error) {
    document.getElementById('data-status').textContent = 'The interactive data could not be loaded. Serve this folder over HTTP and reload, or download the JSON to inspect the values.';
    document.getElementById('design-select').disabled = true;
    document.getElementById('metric-select').disabled = true;
  }
}
loadData();
