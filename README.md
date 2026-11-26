# ladesk.md

Markdown rendering and live editor previews for LiveAgent internal notes on `akkuzentrum.ladesk.com`.

## Install

Install Tampermonkey, then open **[Install ladesk.md](https://raw.githubusercontent.com/MaratronGmbH/ladesk_tampermonkey/main/ladesk.md.user.js)** and confirm the installation. If you already installed the script manually, install this version once to add its update URLs. The name and namespace are unchanged so Tampermonkey can recognize the existing script.

Tampermonkey can check this repository for updates using the script's `@updateURL` and `@downloadURL`. Keep script update checks enabled in Tampermonkey.

## Features

- Markdown notes with tables, task lists, footnotes, GitHub-style alerts, and highlighted code.
- Live Markdown preview beside the note editor.
- **Copy source** at the top right of rendered notes copies the Markdown text used for rendering, rather than rendered HTML. A failed clipboard operation displays **Copy failed**.
- A note containing only `---` acts as a cutoff, hiding older notes. Cutoff markers have no copy button.

## Publish an update

Edit `ladesk.md.user.js`, increase `@version` (for example, `2026.11.23.2`), and push to `main`. When rendering behavior changes, also update `RENDER_VERSION`.

Run `node --check ladesk.md.user.js` before publishing. This repository uses the `.user.js` filename so Tampermonkey recognizes the install link.

Dependencies are loaded from jsDelivr. Markdown HTML is disabled. Clipboard access uses the browser clipboard API with a legacy copy fallback; no additional Tampermonkey grants are requested.
