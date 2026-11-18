'use strict';

// Avoid requiring Element.replaceChildren for report rendering.
function clearElement(element) {
  while (element.firstChild) element.removeChild(element.firstChild);
}

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
  clearElement(facts);
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
  const layout = button.dataset.layout === 'true';
  dialog.classList.toggle('layout-dialog', layout);
  img.classList.remove('native-resolution');
  const scale = document.getElementById('dialog-scale');
  scale.hidden = !layout;
  scale.textContent = 'Actual size';
  scale.setAttribute('aria-pressed', 'false');
  const download = document.getElementById('dialog-download');
  download.hidden = !layout;
  if (layout) download.href = button.dataset.image;
  else download.removeAttribute('href');
  document.getElementById('dialog-help').textContent = layout ? 'Innovus export · Actual size for detail · Scroll to pan · Escape to close' : 'Original manuscript figure · Scroll for detail · Escape to close.';
  const viewport = dialog.querySelector('.dialog-image');
  viewport.scrollTop = 0;
  viewport.scrollLeft = 0;
  img.src = button.dataset.image;
  img.alt = button.dataset.caption;
  document.getElementById('dialog-caption').textContent = button.dataset.caption;
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}));
document.getElementById('dialog-scale').addEventListener('click', () => {
  const native = document.getElementById('dialog-img').classList.toggle('native-resolution');
  const button = document.getElementById('dialog-scale');
  button.textContent = native ? 'Fit to view' : 'Actual size';
  button.setAttribute('aria-pressed', String(native));
});
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
  const chart = document.getElementById('ablation-chart'); clearElement(chart);
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
  const table = document.getElementById('ablation-table'); clearElement(table);
  rows.forEach(row => appendRow(table, [row.method, row.ecp.toFixed(3), row.power.toFixed(3), row.area.toFixed(1), row.drc, row.accuracy.toFixed(2)]));
}
async function loadData() {
  try {
    const response = await fetch('data/paper-results.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    renderResults(data);
    renderPaper(data);
    ['design-select', 'metric-select'].forEach(id => document.getElementById(id).addEventListener('change', () => renderResults(data)));
    const table = document.getElementById('stability-table');
    data.stability.forEach(row => appendRow(table, [row.node, row.design, row.default.toFixed(3), ...row.runs.map(value => value.toFixed(3)), `${row.mean.toFixed(3)} ± ${row.std.toFixed(3)}`]));
    document.getElementById('data-status').textContent = data.status;
  } catch (error) {
    document.getElementById('data-status').textContent = 'The manuscript tables could not be loaded. Reload the page or sign in again; the original figures remain available.';
    document.getElementById('design-select').disabled = true;
    document.getElementById('metric-select').disabled = true;
  }
}
loadData();

let comparisonFamily = 'agents';
function renderComparison(data) {
  const design = document.getElementById('comparison-design').value;
  const node = document.getElementById('comparison-node').value;
  const model = document.getElementById('comparison-model').value;
  const metric = document.getElementById('comparison-metric').value;
  const agents = comparisonFamily === 'agents';
  document.getElementById('node-control').hidden = !agents;
  document.getElementById('model-control').hidden = !agents;
  const rows = (agents ? data.agent_comparison : data.tuner_comparison).filter(row => row.design === design && (!agents || (row.node === node && row.model === model)));
  const areaUnit = agents ? rows[0].area_unit : 'as reported';
  const units = { ecp: 'ns', area: areaUnit, power: 'manuscript units unspecified', drc: 'count' };
  const labels = { ecp: 'Effective clock period', area: 'Area', power: 'Power', drc: 'DRC count' };
  document.getElementById('comparison-title').textContent = design + ' · ' + labels[metric];
  document.getElementById('comparison-direction').textContent = 'Lower is better · ' + units[metric];
  const chart = document.getElementById('comparison-chart');
  clearElement(chart);
  const maximum = Math.max(...rows.map(row => row[metric])) * 1.08 || 1;
  rows.forEach(row => {
    const element = document.createElement('div'); element.className = 'bar-row' + (row.method === 'CRAFT' ? ' craft' : '');
    const label = document.createElement('span'); label.textContent = row.method;
    const track = document.createElement('div'); track.className = 'bar-track'; track.setAttribute('aria-hidden', 'true');
    const bar = document.createElement('div'); bar.className = 'bar'; bar.style.width = `${row[metric] / maximum * 100}%`;
    track.append(bar);
    const value = document.createElement('strong'); value.textContent = row.display[metric];
    element.append(label, track, value); chart.append(element);
  });
  const craft = rows.find(row => row.method === 'CRAFT');
  const bestBaseline = Math.min(...rows.filter(row => row.method !== 'CRAFT').map(row => row.ecp));
  const reduction = (bestBaseline - craft.ecp) / bestBaseline * 100;
  document.getElementById('comparison-finding').textContent = `${reduction.toFixed(1)}% lower ECP`;
  const scope = agents ? `${node} · ${model}` : '28 nm · post-route tuner comparison';
  document.getElementById('comparison-insight').textContent = `Compared with the lowest-ECP baseline in this setting (${bestBaseline.toFixed(3)} → ${craft.ecp.toFixed(3)} ns). ${scope}. CRAFT reports ${craft.drc} DRC violations; consult the other metrics for trade-offs.`;
  const tbody = document.getElementById('comparison-table'); clearElement(tbody);
  const fields = ['ecp', 'tns', 'area', 'power', 'drc'];
  rows.forEach(row => {
    appendRow(tbody, [row.method, ...fields.map(key => row.display[key])]);
    const tr = tbody.lastElementChild;
    if (row.method === 'CRAFT') tr.classList.add('craft-row');
    fields.forEach((key, index) => {
      const best = key === 'tns' ? Math.max(...rows.map(r => r[key])) : Math.min(...rows.map(r => r[key]));
      if (row[key] === best) tr.children[index + 1].classList.add('best-cell');
    });
  });
  document.getElementById('comparison-area-head').textContent = `Area ↓ (${areaUnit})`;
  document.getElementById('comparison-caption').textContent = `${design} · ${scope} · exact manuscript values`;
  document.getElementById('comparison-note').textContent = agents
    ? `Area follows the source table: µm² for CPU Tile and NoCRouter, mm² for RISC-V CPU. Shading is computed from numeric values within this selection. ECP reduction = (best baseline − CRAFT) / best baseline.`
    : 'The tuner table does not separately state its area units; its area values are retained as printed. No LLM backbone is assigned to this comparison. Shading is computed within the selected design. ECP reduction = (best baseline − CRAFT) / best baseline.';
}

function renderPaper(data) {
  const settings = new Map();
  data.agent_comparison.forEach(row => {
    const key = [row.node, row.design, row.model].join('|');
    if (!settings.has(key)) settings.set(key, []);
    settings.get(key).push(row);
  });
  const wins = [...settings.values()].filter(rows => rows.find(row => row.method === 'CRAFT').ecp === Math.min(...rows.map(row => row.ecp))).length;
  document.getElementById('headline-agent').textContent = `${wins}/${settings.size}`;
  const designs = [...new Set(data.tuner_comparison.map(row => row.design))];
  const tunerWins = designs.filter(design => {
    const rows = data.tuner_comparison.filter(row => row.design === design);
    return rows.find(row => row.method === 'CRAFT').ecp === Math.min(...rows.map(row => row.ecp));
  }).length;
  document.getElementById('headline-tuner').textContent = `${tunerWins}/${designs.length}`;
  const repeatWins = data.stability.filter(row => row.runs.every(run => run < row.default)).length;
  document.getElementById('headline-repeat').textContent = `${repeatWins}/${data.stability.length}`;
  const benchmarks = document.getElementById('benchmark-table');
  data.setup.benchmarks.forEach(row => appendRow(benchmarks, [row.design, row.sky130_clock_ns.toFixed(1), row.sky130_cells.toLocaleString('en-US'), row.nm28_clock_ns.toFixed(1), row.nm28_cells.toLocaleString('en-US'), row.budget_hours + ' h']));
  const groups = document.getElementById('parameter-groups');
  data.setup.action_groups.forEach(group => {
    const section = document.createElement('div'); section.className = 'parameter-group';
    const title = document.createElement('h3'); title.textContent = group.stage;
    const count = document.createElement('span'); count.textContent = `${group.total} in full action space`; title.append(count);
    const table = document.createElement('table'); table.setAttribute('aria-label', group.stage + ' representative candidates');
    const body = document.createElement('tbody');
    group.examples.forEach(row => appendRow(body, [row.parameter, row.candidates.join(', ')]));
    table.append(body); section.append(title, table); groups.append(section);
  });
  const repeats = document.getElementById('repeat-grid');
  const scaleMax = Math.ceil(Math.max(...data.stability.map(row => Math.max(row.default, ...row.runs))) / 10) * 10;
  data.stability.forEach(row => {
    const card = document.createElement('article'); card.className = 'repeat-card';
    const node = document.createElement('p'); node.className = 'repeat-node'; node.textContent = row.node;
    const title = document.createElement('h3'); title.textContent = row.design;
    const value = document.createElement('p'); value.className = 'repeat-number'; value.textContent = `${row.mean.toFixed(3)} ± ${row.std.toFixed(3)} `;
    const unit = document.createElement('small'); unit.textContent = 'ns'; value.append(unit);
    const baseline = document.createElement('p'); baseline.className = 'repeat-default'; baseline.textContent = `Mean ± std · default ${row.default.toFixed(3)} ns`;
    const plot = document.createElement('div'); plot.className = 'repeat-plot'; plot.setAttribute('role', 'img'); plot.setAttribute('aria-label', `ECP runs: ${row.runs.join(', ')} ns. Default: ${row.default} ns.`);
    const tick = document.createElement('span'); tick.className = 'default-tick'; tick.style.left = `${row.default / scaleMax * 100}%`; plot.append(tick);
    row.runs.forEach((run, index) => { const dot = document.createElement('span'); dot.className = 'run-dot'; dot.style.left = `${run / scaleMax * 100}%`; dot.style.bottom = `${5 + index * 9}px`; dot.title = `Run ${index + 1}: ${run.toFixed(3)} ns`; plot.append(dot); });
    const legend = document.createElement('div'); legend.className = 'repeat-legend';
    const zero = document.createElement('span'); zero.textContent = '0'; const end = document.createElement('span'); end.textContent = `${scaleMax} ns · lower is better`; legend.append(zero, end);
    card.append(node, title, value, baseline, plot, legend); repeats.append(card);
  });
  document.querySelectorAll('[data-comparison]').forEach(button => button.addEventListener('click', () => {
    comparisonFamily = button.dataset.comparison;
    document.querySelectorAll('[data-comparison]').forEach(item => { const selected = item === button; item.classList.toggle('selected', selected); item.setAttribute('aria-pressed', String(selected)); });
    renderComparison(data);
  }));
  ['comparison-design', 'comparison-node', 'comparison-model', 'comparison-metric'].forEach(id => document.getElementById(id).addEventListener('change', () => renderComparison(data)));
  renderComparison(data);
}

// Mark the current reading section without changing browser history.
if ('IntersectionObserver' in window) {
  const nav = [...document.querySelectorAll('.header nav a')];
  const observer = new IntersectionObserver(entries => {
    const active = entries.find(entry => entry.isIntersecting);
    if (!active) return;
    nav.forEach(link => {
      if (link.hash === '#' + active.target.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-100px 0px -65% 0px' });
  nav.forEach(link => { const section = document.querySelector(link.hash); if (section) observer.observe(section); });
}
