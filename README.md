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
