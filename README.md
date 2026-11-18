**[🌐 Visit the CRAFT project website →](https://craft2026-11.github.io/craft/)**

<p align="center"><a href="https://craft2026-11.github.io/craft/"><img src="assets/craft-icon.svg" width="84" height="84" alt="CRAFT project website"></a></p>

# CRAFT research website

The manuscript-based research showcase for CRAFT: cross-stage evidence, engineering actions and verified feedback in agentic EDA.

- **Website:** https://craft2026-11.github.io/craft/
- **Selected source code:** [craft-project](https://github.com/Craft2026-11/craft-project)

This repository contains the static website only. It presents the supplied manuscript’s figures, protocol and reported tables, with interactive result comparisons and figure inspection. The layout gallery includes direct Innovus exports from selected CRAFT experiments alongside the original manuscript comparison; the decision example is not a multi-iteration replay.

`craft-project` contains a separately maintained portable Python core, tests and an explicitly synthetic offline demonstration. It is a partial source release, not a complete reproduction package.

## Preview

Run `python3 -m http.server 8000 --bind 127.0.0.1` in this directory and open `http://127.0.0.1:8000`.

## Hosting

Serve the repository root with GitHub Pages (main branch, root folder). No build step, external fonts, analytics, API keys or model service are required.

The public export contains no account database or login server. The independent local access-controlled preview is maintained outside this repository.

## Evidence and scope

`data/paper-results.json` transcribes the manuscript’s settings and results. Missing source units are explicitly identified. Raw experiment workspaces, commercial design databases, PDKs, the manuscript source archive and complete tool integrations are not distributed here.

The four layout panels embedded in the manuscript PDF are approximately 300 × 300 pixels. The full Figure 6 remains available as the manuscript reference. The homepage now uses a newly exported Innovus CPU Tile preview; it is presented as an experimental snapshot rather than a replacement for a manuscript result.

## Conceptual flow animation

[Watch the flow](https://craft2026-11.github.io/craft/#pipeline): a 15-step explanation of synthesis, floorplanning, placement, CTS and routing under cross-stage agent control. The example shows reports returning to the agent, bounded placement/CTS revisions, compatible checkpoint reuse, downstream re-execution and independent evaluation.

Play, pause, step, seek, change speed or inspect an individual stage. Playback suspends offscreen; reduced-motion preferences disable autoplay and moving effects. All circuit graphics and the intervention sequence are illustrative, not experimental measurements or a claim of successful optimization. The animation runs entirely in the browser and needs no EDA installation, LLM service or API token.


The flow now includes a stage-level **decision trace**: evidence to inspect, working diagnosis, candidate action, checkpoint boundary, and prediction / verification. It follows playback; selecting a trace stage pauses playback for inspection. An adjacent engineer illustration frames the evidence review perspective, without adding a human approval step to the evaluated method. Parameter names and ranges match manuscript examples; diagnoses and the animation remain illustrative. The manuscript's actual decision case is linked separately.

The five-stage diagram and an initial trace remain visible without JavaScript. Motion preferences are respected, older media-query listeners have a fallback, and changed assets carry versioned URLs to reduce stale cache mixing.


## Innovus layout gallery

Three selected post-route layouts—CPU Tile, NoCRouter and RISC-V CPU—are exported directly from existing CRAFT experiment checkpoints in Innovus. Each has a 960 × 960 preview and a 3000 × 3000 PNG for inspection and download. The image viewer supports fit-to-view and native resolution, loading full images only when opened.

The gallery shows design names and images without timing or QoR numbers. It is separate from the manuscript’s Figure 6 and does not assert a row-by-row correspondence with its tables or a signoff result. Selection records and checkpoint provenance remain local; no design database, tool log, library or PDK is included in this website.
