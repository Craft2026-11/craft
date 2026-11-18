**[🌐 Visit the CRAFT project website →](https://craft2026-11.github.io/craft/)**

<p align="center"><a href="https://craft2026-11.github.io/craft/"><img src="assets/craft-icon.svg" width="84" height="84" alt="CRAFT project website"></a></p>

# CRAFT research website

The manuscript-based research showcase for CRAFT: cross-stage evidence, engineering actions and verified feedback in agentic EDA.

- **Website:** https://craft2026-11.github.io/craft/
- **Selected source code:** [craft-project](https://github.com/Craft2026-11/craft-project)

This repository contains the static website only. It presents the supplied manuscript’s figures, protocol and reported tables, with interactive result comparisons and figure inspection. Layout images are static manuscript figures; the decision example is not a multi-iteration replay.

`craft-project` contains a separately maintained portable Python core, tests and an explicitly synthetic offline demonstration. It is a partial source release, not a complete reproduction package.

## Preview

Run `python3 -m http.server 8000 --bind 127.0.0.1` in this directory and open `http://127.0.0.1:8000`.

## Hosting

Serve the repository root with GitHub Pages (main branch, root folder). No build step, external fonts, analytics, API keys or model service are required.

The public export contains no account database or login server. The independent local access-controlled preview is maintained outside this repository.

## Evidence and scope

`data/paper-results.json` transcribes the manuscript’s settings and results. Missing source units are explicitly identified. Raw experiment workspaces, commercial design databases, PDKs, the manuscript source archive and complete tool integrations are not distributed here.

The four layout panels embedded in the manuscript PDF are approximately 300 × 300 pixels. The homepage uses the native 305 × 299 CRAFT CPU Tile panel without enlarging it beyond its pixel dimensions; the full Figure 6 remains available. Higher-resolution physical detail requires original EDA exports.

## Conceptual flow animation

[Watch the flow](https://craft2026-11.github.io/craft/#pipeline): a 15-step explanation of synthesis, floorplanning, placement, CTS and routing under cross-stage agent control. The example shows reports returning to the agent, bounded placement/CTS revisions, compatible checkpoint reuse, downstream re-execution and independent evaluation.

Play, pause, step, seek, change speed or inspect an individual stage. Playback suspends offscreen; reduced-motion preferences disable autoplay and moving effects. All circuit graphics and the intervention sequence are illustrative, not experimental measurements or a claim of successful optimization. The animation runs entirely in the browser and needs no EDA installation, LLM service or API token.


The flow now includes a stage-level **decision trace**: evidence to inspect, working diagnosis, candidate action, checkpoint boundary, and prediction / verification. It follows playback; selecting a trace stage pauses playback for inspection. An adjacent engineer illustration frames the evidence review perspective, without adding a human approval step to the evaluated method. Parameter names and ranges match manuscript examples; diagnoses and the animation remain illustrative. The manuscript's actual decision case is linked separately.

The five-stage diagram and an initial trace remain visible without JavaScript. Motion preferences are respected, older media-query listeners have a fallback, and changed assets carry versioned URLs to reduce stale cache mixing.
