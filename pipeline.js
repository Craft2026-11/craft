'use strict';

// A deterministic explanation of the control loop, never an experiment replay.
(() => {
  const root = document.getElementById('pipeline');
  if (!root) return;
  const frames = [
    {phase:'EXECUTE', stage:0, title:'A design enters logic synthesis.', description:'RTL and timing constraints are mapped into a gate-level netlist. The agent monitors the artifacts and reports produced by the flow.', label:'INPUT → ARTIFACT', value:'RTL → mapped netlist', note:'The circuit drawings are schematic, not a benchmark design.'},
    {phase:'EXECUTE', stage:1, title:'Give the circuit a physical boundary.', description:'Floorplanning establishes the die, macro locations and available placement space. A compatible checkpoint can later become a restart point.', label:'ARTIFACT', value:'Die boundary + macro plan', note:'Checkpoint reuse depends on design, constraints and tool compatibility.'},
    {phase:'EXECUTE', stage:2, title:'Turn the netlist into placed cells.', description:'Placement assigns cells to physical locations. Timing and congestion evidence will help explain the downstream implementation behavior.', label:'EVIDENCE', value:'Cell locations · timing · congestion', note:'An intermediate metric is evidence, not proof of a physical cause.'},
    {phase:'EXECUTE', stage:3, title:'Build the clock distribution network.', description:'Clock-tree synthesis adds the clock network. Clock and data-path evidence must be interpreted together.', label:'ARTIFACT', value:'Clock network + timing reports', note:'CTS is a distinct stage whose changes can affect later routing.'},
    {phase:'EXECUTE', stage:4, title:'Route the candidate and collect reports.', description:'Routing realizes interconnect. Timing, congestion and design-rule reports return evidence about the candidate implementation.', label:'TOOL FEEDBACK', value:'Timing · power · area · DRC', note:'No numerical result is synthesized or claimed by this animation.'},
    {phase:'OBSERVE', agent:'observe', stage:4, sources:[4], title:'The flow sends evidence back to the agent.', description:'In this illustrative scenario, routing reports motivate a closer look at congestion and timing. The agent inspects supporting reports before choosing an intervention.', label:'READ REPORTS', value:'Implementation evidence → agent', note:'A poor result alone does not identify which upstream stage caused it.'},
    {phase:'DIAGNOSE', agent:'diagnose', sources:[2,3,4], targets:[2,3], title:'Look upstream, across stage boundaries.', description:'The agent considers placement and clock-network evidence alongside the routing result. The highlighted stages are candidate intervention points, not confirmed causes.', label:'CROSS-STAGE HYPOTHESIS', value:'Placement ↔ CTS ↔ Routing', note:'Supporting evidence, uncertainty and competing explanations remain in the record.'},
    {phase:'PREDICT', agent:'revise', targets:[2,3], title:'Commit the candidate before execution.', description:'The illustrative candidate revisits placement padding and useful-skew policy at CTS. Expected physical response, QoR and constraint risk are recorded before running it.', label:'ILLUSTRATIVE ACTION SCOPE', value:'Placement: cell_padding · CTS: useful_skew', note:'Parameter names follow the manuscript; no unreported numerical settings are implied.'},
    {phase:'RESTORE', agent:'revise', stage:1, targets:[2,3], restore:true, title:'Restart before the earliest changed stage.', description:'If compatible, restore the floorplan checkpoint. Synthesis and floorplan can be reused; placement, CTS and routing must be re-executed for this candidate.', label:'CHECKPOINT BOUNDARY', value:'Reuse through Floorplan → re-run Placement onward', note:'If checkpoint compatibility fails, execution must restart earlier.'},
    {phase:'RE-RUN', stage:2, revision:true, targets:[2], title:'Apply the placement revision.', description:'The candidate placement policy changes how cells are arranged. The drawing illustrates a different arrangement; it does not show a measured improvement.', label:'CANDIDATE / PLACEMENT', value:'Re-execute with bounded cell-padding policy', note:'Later-stage results are stale until their tools have run again.'},
    {phase:'RE-RUN', stage:3, revision:true, targets:[3], title:'Rebuild the clock network under the candidate policy.', description:'CTS is run again on the revised placement. The changed clock network carries the candidate forward into routing.', label:'CANDIDATE / CTS', value:'Re-execute with useful-skew policy', note:'A visual change does not establish timing closure or lower power.'},
    {phase:'RE-RUN', stage:4, revision:true, title:'Route again. Produce fresh evidence.', description:'Routing is re-executed after the upstream changes. Reports from this execution are tied to the candidate, rather than reused from the previous implementation.', label:'FRESH TOOL OUTPUT', value:'Candidate layout + implementation reports', note:'The schematic routing geometry is illustrative, not an EDA-generated result.'},
    {phase:'VERIFY', agent:'verify', stage:4, sources:[4], revision:true, title:'Separate what changed from whether it helped.', description:'Compare the executed physical response with the committed prediction. Evaluate QoR and constraint risk separately, preserving missing evidence and adverse outcomes.', label:'INDEPENDENT EVALUATION', value:'Physical response · QoR · constraint risk', note:'Supported / refuted / non-evaluable outcomes depend on real measurements.'},
    {phase:'RECORD', agent:'verify', revision:true, title:'Keep the outcome accountable.', description:'Retain the action, evidence and evaluation. A candidate may be accepted, rejected or deferred; this explanation does not assert a successful optimization.', label:'POSSIBLE DECISIONS', value:'Accept · reject · defer', note:'Skill changes require separate validation before promotion.'},
    {phase:'NEXT ITERATION', agent:'observe', revision:true, title:'The next decision starts with better evidence.', description:'The record informs the next bounded intervention within the execution budget. Replay the flow or inspect any stage to explore the control loop.', label:'FEEDBACK LOOP', value:'Observe → diagnose → revise → verify', note:'Conceptual animation complete. No EDA tool or model API was called.'}
  ];
  const stages = [...root.querySelectorAll('[data-pipeline-stage]')];
  const play = document.getElementById('pipeline-play');
  const back = document.getElementById('pipeline-back');
  const next = document.getElementById('pipeline-next');
  const seek = document.getElementById('pipeline-seek');
  const speed = document.getElementById('pipeline-speed');
  const board = document.getElementById('pipeline-board');
  const agent = document.getElementById('pipeline-agent');
  const wires = document.getElementById('pipeline-wires');
  const svg = document.getElementById('pipeline-links');
  const narrative = document.getElementById('pipeline-narrative');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const ns = 'http://www.w3.org/2000/svg';
  let index = 0;
  let playing = false;
  let timer = null;
  let visible = false;
  let userControlled = false;
  let autoStarted = false;

  function drawConnections() {
    const frame = frames[index];
    root.style.setProperty('--pipeline-toolbar-offset', `${document.querySelector('.header').getBoundingClientRect().height}px`);
    const bounds = board.getBoundingClientRect();
    if (!bounds.width) return;
    const agentBounds = agent.getBoundingClientRect();
    const ax = agentBounds.left + agentBounds.width / 2 - bounds.left;
    const ay = agentBounds.bottom - bounds.top;
    const mobile = matchMedia('(max-width: 650px)').matches;
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    wires.replaceChildren();
    stages.forEach((stage, i) => {
      const rect = stage.getBoundingClientRect();
      const x = mobile ? rect.left - bounds.left : rect.left + rect.width / 2 - bounds.left;
      const y = mobile ? rect.top + rect.height / 2 - bounds.top : rect.top - bounds.top;
      const path = document.createElementNS(ns, 'path');
      const d = mobile ? `M ${ax} ${ay} V ${ay + 14} H 10 V ${y} H ${x}` : `M ${ax} ${ay} V ${ay + 38} H ${x} V ${y}`;
      path.setAttribute('d', d);
      const source = (frame.sources || []).includes(i);
      const target = (frame.targets || []).includes(i);
      path.setAttribute('class', 'pipeline-wire' + (source ? ' evidence-wire' : target ? ' revision-wire' : ''));
      if (target && !source) path.setAttribute('marker-end', 'url(#pipeline-gold-tip)');
      wires.append(path);
    });
  }

  function cancelTimer() { clearTimeout(timer); timer = null; }
  function schedule() {
    cancelTimer();
    if (!playing || !visible || document.hidden) return;
    timer = setTimeout(() => {
      if (index < frames.length - 1) index++;
      if (index === frames.length - 1) playing = false;
      render();
    }, (index >= 5 ? 3600 : 2300) / Number(speed.value));
  }

  function render() {
    const f = frames[index];
    root.dataset.frame = String(index);
    root.dataset.phase = f.phase;
    root.style.setProperty('--stage-progress', String((f.stage ?? 4) / 4));
    root.classList.toggle('is-playing', playing && visible && !document.hidden);
    root.classList.toggle('reduced-motion', motion.matches);
    play.textContent = playing ? 'Pause' : index === frames.length - 1 ? 'Replay' : 'Play';
    play.setAttribute('aria-label', playing ? 'Pause flow animation' : index === frames.length - 1 ? 'Replay flow animation' : 'Play flow animation');
    back.disabled = index === 0;
    next.disabled = index === frames.length - 1;
    seek.value = String(index);
    seek.setAttribute('aria-valuetext', `${index + 1} of ${frames.length}: ${f.title}`);
    document.getElementById('pipeline-counter').textContent = `${String(index + 1).padStart(2,'0')} / ${frames.length}`;
    narrative.setAttribute('aria-live', playing ? 'off' : 'polite');
    document.getElementById('pipeline-phase').textContent = `${String(index + 1).padStart(2,'0')} / ${f.phase}`;
    document.getElementById('pipeline-title').textContent = f.title;
    document.getElementById('pipeline-description').textContent = f.description;
    document.getElementById('pipeline-record-label').textContent = f.label;
    document.getElementById('pipeline-record-value').textContent = f.value;
    document.getElementById('pipeline-record-note').textContent = f.note;
    document.getElementById('pipeline-agent-state').textContent = f.agent ? ({observe:'Reading evidence',diagnose:'Tracing upstream causes',revise:'Candidate recorded',verify:'Evaluating the outcome'}[f.agent]) : f.revision ? 'Monitoring candidate execution' : 'Monitoring the flow';
    root.querySelectorAll('[data-agent-phase]').forEach(el => el.classList.toggle('active', el.dataset.agentPhase === f.agent));
    stages.forEach((stage, i) => {
      const active = f.stage === i;
      const revised = Boolean(f.revision && i >= 2 && (f.stage === undefined || i <= f.stage));
      const completed = f.restore ? i < 2 : f.revision ? i < (f.stage ?? 5) : i < (f.stage ?? 5);
      stage.classList.toggle('stage-active', active);
      stage.classList.toggle('stage-complete', completed);
      stage.classList.toggle('stage-target', (f.targets || []).includes(i));
      stage.classList.toggle('stage-evidence', (f.sources || []).includes(i));
      stage.classList.toggle('stage-revised', revised);
      stage.setAttribute('aria-pressed', String(active));
      let state = completed ? 'Available' : 'Awaiting';
      if (index >= 5 && index <= 7) state = 'Evidence';
      if (f.restore) state = i <= 1 ? 'Reuse' : 'Needs re-run';
      if (f.revision) state = i < 2 ? 'Reused' : completed ? 'Re-executed' : 'Needs re-run';
      if (active) state = f.restore ? 'Checkpoint' : index >= 12 ? 'Review' : index >= 5 && index <= 7 ? 'Reports' : f.revision ? 'Re-running' : 'Executing';
      if (index >= 13 && i >= 2) state = 'Recorded';
      stage.querySelector('.stage-state').textContent = state;
    });
    drawConnections();
    schedule();
  }

  function selectStep(step) {
    userControlled = true;
    playing = false;
    index = Math.max(0, Math.min(frames.length - 1, step));
    render();
  }
  play.addEventListener('click', () => {
    userControlled = true;
    if (index === frames.length - 1) index = 0;
    playing = !playing;
    render();
  });
  back.addEventListener('click', () => selectStep(index - 1));
  next.addEventListener('click', () => selectStep(index + 1));
  document.getElementById('pipeline-reset').addEventListener('click', () => selectStep(0));
  seek.addEventListener('input', () => selectStep(Number(seek.value)));
  speed.addEventListener('change', schedule);
  stages.forEach((stage, i) => stage.addEventListener('click', () => selectStep(i)));
  document.addEventListener('visibilitychange', render);
  motion.addEventListener('change', () => { if (motion.matches) playing = false; render(); });
  if ('ResizeObserver' in window) new ResizeObserver(drawConnections).observe(board);
  window.addEventListener('resize', drawConnections);
  if ('IntersectionObserver' in window) {
    // Start when the diagram enters the reading viewport; suspend offscreen.
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible && !autoStarted && !userControlled && !motion.matches) {
        autoStarted = true;
        playing = true;
      }
      render();
    }, {rootMargin:'150px 0px',threshold:0}).observe(board);
  } else visible = true;
  render();
})();
