// ==UserScript==
// @name         ladesk.md
// @namespace    http://tampermonkey.net/
// @version      2026.11.23.1
// @homepageURL  https://github.com/nicolindenlaufmaratron/ladesk_tampermonkey
// @updateURL    https://raw.githubusercontent.com/nicolindenlaufmaratron/ladesk_tampermonkey/main/ladesk.md.user.js
// @downloadURL  https://raw.githubusercontent.com/nicolindenlaufmaratron/ladesk_tampermonkey/main/ladesk.md.user.js
// @description  Markdown rendering for LiveAgent notes
// @author       nicolindenlaufmaratron
// @match        https://akkuzentrum.ladesk.com/agent/index.php*
// @require      https://cdn.jsdelivr.net/npm/markdown-it@14/dist/markdown-it.min.js
// @require      https://cdn.jsdelivr.net/npm/markdown-it-task-lists@2/dist/markdown-it-task-lists.min.js
// @require      https://cdn.jsdelivr.net/npm/markdown-it-footnote@4/dist/markdown-it-footnote.min.js
// @require      https://cdn.jsdelivr.net/npm/markdown-it-deflist@3/dist/markdown-it-deflist.min.js
// @require      https://cdn.jsdelivr.net/npm/markdown-it-abbr@2/dist/markdown-it-abbr.min.js
// @require      https://cdn.jsdelivr.net/npm/markdown-it-mark@4/dist/markdown-it-mark.min.js
// @require      https://cdn.jsdelivr.net/npm/markdown-it-ins@4/dist/markdown-it-ins.min.js
// @require      https://cdn.jsdelivr.net/npm/markdown-it-sub@2/dist/markdown-it-sub.min.js
// @require      https://cdn.jsdelivr.net/npm/markdown-it-sup@2/dist/markdown-it-sup.min.js
// @require      https://cdn.jsdelivr.net/npm/markdown-it-emoji@3/dist/markdown-it-emoji.min.js
// @require      https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11/highlight.min.js
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const MARKDOWN_IT_URL =
        "https://cdn.jsdelivr.net/npm/markdown-it@14/dist/markdown-it.min.js";
    const TASK_LISTS_URL =
        "https://cdn.jsdelivr.net/npm/markdown-it-task-lists@2/dist/markdown-it-task-lists.min.js";
    const PLUGIN_SCRIPTS = [
        ["https://cdn.jsdelivr.net/npm/markdown-it-footnote@4/dist/markdown-it-footnote.min.js", "markdownitFootnote"],
        ["https://cdn.jsdelivr.net/npm/markdown-it-deflist@3/dist/markdown-it-deflist.min.js", "markdownitDeflist"],
        ["https://cdn.jsdelivr.net/npm/markdown-it-abbr@2/dist/markdown-it-abbr.min.js", "markdownitAbbr"],
        ["https://cdn.jsdelivr.net/npm/markdown-it-mark@4/dist/markdown-it-mark.min.js", "markdownitMark"],
        ["https://cdn.jsdelivr.net/npm/markdown-it-ins@4/dist/markdown-it-ins.min.js", "markdownitIns"],
        ["https://cdn.jsdelivr.net/npm/markdown-it-sub@2/dist/markdown-it-sub.min.js", "markdownitSub"],
        ["https://cdn.jsdelivr.net/npm/markdown-it-sup@2/dist/markdown-it-sup.min.js", "markdownitSup"],
        ["https://cdn.jsdelivr.net/npm/markdown-it-emoji@3/dist/markdown-it-emoji.min.js", "markdownitEmoji"],
        ["https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11/highlight.min.js", "hljs"],
    ];
    const RENDER_VERSION = "2026-11-23-copy-source";

    function loadScript(src, globalName) {
        if (globalName && window[globalName]) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Could not load ${src}`));
            document.head.appendChild(script);
        });
    }

    function installStyles() {
        if (document.getElementById("la-md-styles")) {
            return;
        }

        const style = document.createElement("style");
        style.id = "la-md-styles";
        style.textContent = `
            .la-md-note {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif !important;
                font-size: 14px !important;
                line-height: 1.55 !important;
                overflow-wrap: anywhere;
            }

            .la-md-note > :first-child { margin-top: 0 !important; }
            .la-md-note > :last-child { margin-bottom: 0 !important; }

            .la-md-note.la-md-has-copy {
                position: relative;
                padding-top: 34px !important;
            }

            .la-md-note > .la-md-copy-source {
                position: absolute;
                top: 0;
                right: 0;
                padding: 3px 8px;
                border: 1px solid currentColor;
                border-radius: 4px;
                background: transparent;
                color: inherit;
                font: 12px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                cursor: pointer;
            }

            .la-md-copy-source:focus-visible {
                outline: 2px solid #2563eb;
                outline-offset: 2px;
            }

            .la-md-note h1,
            .la-md-note h2,
            .la-md-note h3,
            .la-md-note h4,
            .la-md-note h5,
            .la-md-note h6 {
                margin: 1.1em 0 0.55em !important;
                font-weight: 600 !important;
                line-height: 1.25 !important;
            }

            .la-md-note h1,
            .la-md-note h2 {
                padding-bottom: 0.3em !important;
                border-bottom: 1px solid currentColor !important;
            }

            .la-md-note h1 { font-size: 1.6em !important; }
            .la-md-note h2 { font-size: 1.4em !important; }
            .la-md-note h3 { font-size: 1.2em !important; }

            .la-md-note p,
            .la-md-note blockquote,
            .la-md-note ul,
            .la-md-note ol,
            .la-md-note dl,
            .la-md-note table,
            .la-md-note pre {
                margin-top: 0 !important;
                margin-bottom: 0.9em !important;
            }

            .la-md-note ul,
            .la-md-note ol {
                padding-left: 1.8em !important;
            }

            .la-md-note li + li {
                margin-top: 0.25em !important;
            }

            .la-md-note a {
                text-decoration: underline;
            }

            .la-md-note code {
                border-radius: 4px !important;
                padding: 0.2em 0.4em !important;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace !important;
                font-size: 85% !important;
            }

            .la-md-note pre {
                background: #f6f8fa !important;
                border: 1px solid #d0d7de !important;
                border-radius: 6px !important;
                padding: 12px !important;
                overflow-x: auto !important;
            }

            .la-md-note pre code {
                color: #24292f !important;
                padding: 0 !important;
                border-radius: 0 !important;
                font-size: 13px !important;
                white-space: pre !important;
            }

            .la-md-note pre code.hljs {
                background: transparent !important;
            }

            .la-md-note .la-md-code-lang {
                display: block;
                margin: -12px -12px 10px !important;
                padding: 5px 10px !important;
                border-bottom: 1px solid #d0d7de !important;
                font: 600 11px/1.4 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace !important;
                text-transform: uppercase;
                color: #57606a !important;
                background: #f1f4f8 !important;
            }

            .la-md-note .hljs-comment,
            .la-md-note .hljs-quote {
                color: #6e7781 !important;
            }

            .la-md-note .hljs-keyword,
            .la-md-note .hljs-selector-tag,
            .la-md-note .hljs-subst {
                color: #cf222e !important;
            }

            .la-md-note .hljs-number,
            .la-md-note .hljs-literal,
            .la-md-note .hljs-variable,
            .la-md-note .hljs-template-variable,
            .la-md-note .hljs-tag .hljs-attr {
                color: #953800 !important;
            }

            .la-md-note .hljs-string,
            .la-md-note .hljs-doctag {
                color: #0a3069 !important;
            }

            .la-md-note .hljs-title,
            .la-md-note .hljs-section,
            .la-md-note .hljs-selector-id {
                color: #8250df !important;
            }

            .la-md-note .hljs-type,
            .la-md-note .hljs-class .hljs-title {
                color: #953800 !important;
            }

            .la-md-note .hljs-tag,
            .la-md-note .hljs-name,
            .la-md-note .hljs-attribute {
                color: #116329 !important;
            }

            .la-md-note .hljs-regexp,
            .la-md-note .hljs-link {
                color: #0a3069 !important;
            }

            .la-md-note .hljs-symbol,
            .la-md-note .hljs-bullet {
                color: #3b2300 !important;
            }

            .la-md-note .hljs-built_in,
            .la-md-note .hljs-builtin-name {
                color: #0550ae !important;
            }

            .la-md-note .hljs-meta {
                color: #57606a !important;
            }

            .la-md-note .hljs-deletion {
                color: #82071e !important;
                background: #ffebe9 !important;
            }

            .la-md-note .hljs-addition {
                color: #116329 !important;
                background: #dafbe1 !important;
            }

            .la-md-note blockquote {
                border-left: 4px solid currentColor !important;
                padding: 0 1em !important;
                opacity: 0.8;
            }

            .la-md-note blockquote.la-md-alert {
                opacity: 1;
                border-left-width: 0 !important;
                border-radius: 6px !important;
                padding: 10px 12px !important;
                background: rgba(88, 166, 255, 0.12) !important;
                box-shadow: inset 3px 0 0 currentColor !important;
            }

            .la-md-note blockquote.la-md-alert::before {
                content: attr(data-alert);
                display: block;
                margin-bottom: 0.4em;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.02em;
            }

            .la-md-note blockquote.la-md-alert-note { color: #2563eb !important; }
            .la-md-note blockquote.la-md-alert-tip { color: #16a34a !important; }
            .la-md-note blockquote.la-md-alert-important { color: #7c3aed !important; }
            .la-md-note blockquote.la-md-alert-warning { color: #d97706 !important; }
            .la-md-note blockquote.la-md-alert-caution { color: #dc2626 !important; }

            .la-md-note dl {
                display: grid !important;
                grid-template-columns: max-content minmax(0, 1fr);
                gap: 0.3em 0.8em;
            }

            .la-md-note dt {
                font-weight: 600 !important;
            }

            .la-md-note dd {
                margin: 0 !important;
            }

            .la-md-note mark {
                border-radius: 3px !important;
                padding: 0.05em 0.25em !important;
                background: #fff3a3 !important;
                color: inherit !important;
            }

            .la-md-note ins {
                text-decoration-thickness: 0.08em !important;
                text-underline-offset: 0.15em !important;
            }

            .la-md-note kbd {
                border: 1px solid currentColor !important;
                border-radius: 4px !important;
                padding: 0.1em 0.35em !important;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace !important;
                font-size: 85% !important;
                box-shadow: inset 0 -1px 0 currentColor !important;
            }

            .la-md-note table {
                border-collapse: collapse !important;
                display: block !important;
                max-width: 100% !important;
                overflow-x: auto !important;
            }

            .la-md-note th,
            .la-md-note td {
                border: 1px solid currentColor !important;
                padding: 6px 13px !important;
            }

            .la-md-note th {
                font-weight: 600 !important;
            }

            .la-md-note input[type="checkbox"] {
                margin: 0 0.35em 0.15em -1.4em !important;
                vertical-align: middle !important;
            }

            .la-md-note .contains-task-list {
                list-style: none !important;
            }

            .la-md-note hr {
                height: 0.25em !important;
                padding: 0 !important;
                margin: 1.5em 0 !important;
                border: 0 !important;
                border-top: 1px solid currentColor !important;
            }

            .la-md-note img {
                max-width: 100% !important;
                border-radius: 6px !important;
            }

            .la-md-note .footnotes {
                margin-top: 1.4em !important;
                padding-top: 0.8em !important;
                border-top: 1px solid currentColor !important;
                font-size: 0.9em !important;
                opacity: 0.86;
            }

            .la-md-note .footnotes-list {
                padding-left: 1.4em !important;
            }

            .la-md-note .footnote-backref {
                text-decoration: none !important;
            }

            .la-md-note-message,
            .la-md-ticket-note-message,
            .la-md-note-editor,
            .la-md-note-editor textarea {
                background: #eef4ff !important;
                border-color: #c9d8ef !important;
            }

            .la-md-note-message .messageBody {
                background: transparent !important;
            }

            .la-md-note-editor.la-md-editor-split {
                display: grid !important;
                grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
                grid-template-rows: minmax(0, 1fr) auto;
                align-items: stretch !important;
                min-height: 0 !important;
                max-height: min(34vh, 240px) !important;
                overflow: hidden !important;
            }

            .la-md-note-editor.la-md-editor-split .NoteTextarea {
                grid-column: 1;
                grid-row: 1;
                display: flex !important;
                min-width: 0 !important;
                min-height: 0 !important;
                height: auto !important;
                overflow: hidden !important;
            }

            .la-md-note-editor.la-md-editor-split textarea.gwt-TextArea {
                width: 100% !important;
                height: 100% !important;
                min-height: 0 !important;
                box-sizing: border-box !important;
                overflow: auto !important;
                resize: none !important;
            }

            .la-md-note-preview {
                grid-column: 2;
                grid-row: 1;
                min-width: 0 !important;
                min-height: 0 !important;
                padding: 10px 12px !important;
                border-left: 1px solid #c9d8ef !important;
                box-sizing: border-box !important;
                overflow: auto !important;
            }

            .la-md-note-editor.la-md-editor-split .InputFilesWrapper {
                grid-column: 1 / -1;
                grid-row: 2;
            }

            @media (prefers-color-scheme: dark) {
                .la-md-note-message,
                .la-md-ticket-note-message,
                .la-md-note-editor,
                .la-md-note-editor textarea {
                    background: #292c34 !important;
                    border-color: #3d4658 !important;
                }

                .la-md-note-message,
                .la-md-note-message .NoteText,
                .la-md-ticket-note-message,
                .la-md-ticket-note-message .la-md-note,
                .la-md-note-editor textarea {
                    color: #c9d1d9 !important;
                }

                .la-md-note-preview {
                    border-left-color: #3d4658 !important;
                }

                .la-md-note mark {
                    background: #665c23 !important;
                    color: #fff8c5 !important;
                }

                .la-md-note pre {
                    background: #0d1117 !important;
                    border-color: #30363d !important;
                }

                .la-md-note pre code {
                    color: #e6edf3 !important;
                }

                .la-md-note .la-md-code-lang {
                    color: #8b949e !important;
                    background: #161b22 !important;
                    border-bottom-color: #30363d !important;
                }

                .la-md-note .hljs-comment,
                .la-md-note .hljs-quote {
                    color: #8b949e !important;
                }

                .la-md-note .hljs-keyword,
                .la-md-note .hljs-selector-tag,
                .la-md-note .hljs-subst {
                    color: #ff7b72 !important;
                }

                .la-md-note .hljs-number,
                .la-md-note .hljs-literal,
                .la-md-note .hljs-variable,
                .la-md-note .hljs-template-variable,
                .la-md-note .hljs-tag .hljs-attr {
                    color: #79c0ff !important;
                }

                .la-md-note .hljs-string,
                .la-md-note .hljs-doctag {
                    color: #a5d6ff !important;
                }

                .la-md-note .hljs-title,
                .la-md-note .hljs-section,
                .la-md-note .hljs-selector-id {
                    color: #d2a8ff !important;
                }

                .la-md-note .hljs-type,
                .la-md-note .hljs-class .hljs-title {
                    color: #ffa657 !important;
                }

                .la-md-note .hljs-tag,
                .la-md-note .hljs-name,
                .la-md-note .hljs-attribute {
                    color: #7ee787 !important;
                }

                .la-md-note .hljs-regexp,
                .la-md-note .hljs-link {
                    color: #a5d6ff !important;
                }

                .la-md-note .hljs-symbol,
                .la-md-note .hljs-bullet {
                    color: #f2cc60 !important;
                }

                .la-md-note .hljs-built_in,
                .la-md-note .hljs-builtin-name {
                    color: #ffa657 !important;
                }

                .la-md-note .hljs-meta {
                    color: #8b949e !important;
                }

                .la-md-note .hljs-deletion {
                    color: #ffdcd7 !important;
                    background: #67060c !important;
                }

                .la-md-note .hljs-addition {
                    color: #aff5b4 !important;
                    background: #033a16 !important;
                }
            }

            .la-md-hidden-before-cutoff {
                display: none !important;
            }

            .la-md-note-cutoff {
                min-height: 1px !important;
            }

            .la-md-note-cutoff::before {
                content: "";
                display: block;
                border-top: 1px solid currentColor;
                opacity: 0.45;
            }

            .la-md-note-cutoff > * {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    function getMarkdownTargets(root = document) {
        return root.querySelectorAll(
            [
                ".TicketItemInternal .PlainTextWidget",
                ".InternalMessageGroup .PlainTextWidget",
                ".InternalOfflineMessageGroup .PlainTextWidget",
                ".MessageNotification.Notes .NoteText",
                ".MessageGroupWithNote .NoteText",
                ".InternalMessageGroup .NoteText",
            ].join(",")
        );
    }

    function readPlainText(element) {
        if (element.dataset.laMdRaw) {
            return element.dataset.laMdRaw;
        }

        const title = element.getAttribute("title");
        const text = (title || htmlToPlainText(element) || "")
            .replace(/\u00a0/g, " ")
            .replace(/\r\n?/g, "\n")
            .trim();

        element.dataset.laMdRaw = text;
        return text;
    }

    function htmlToPlainText(element) {
        const clone = element.cloneNode(true);
        clone.querySelectorAll("br").forEach((br) => {
            br.replaceWith("\n");
        });

        clone.querySelectorAll("p, div, li, tr, blockquote").forEach((node) => {
            if (node.lastChild && node.lastChild.nodeType === Node.TEXT_NODE) {
                node.lastChild.textContent += "\n";
                return;
            }

            node.appendChild(document.createTextNode("\n"));
        });

        return clone.textContent || "";
    }

    function renderMarkdownNotes(md, root = document) {
        getMarkdownTargets(root).forEach((element) => {
            const raw = readPlainText(element);
            if (
                !raw ||
                (
                    element.dataset.laMdRendered === raw &&
                    element.dataset.laMdRenderVersion === RENDER_VERSION
                )
            ) {
                return;
            }

            if (isCutoffNote(raw)) {
                element.innerHTML = "";
            } else {
                element.innerHTML = renderMarkdown(md, raw);
                installCopySourceButton(element, raw);
            }

            element.classList.add("la-md-note");
            element.classList.toggle("la-md-has-copy", !isCutoffNote(raw));
            element.classList.toggle("la-md-note-cutoff", isCutoffNote(raw));
            element.closest(".MessageGroupContent")?.classList.add("la-md-note-message");
            element.closest(".TicketItemInternal")?.classList.add("la-md-ticket-note-message");
            element.dataset.laMdRendered = raw;
            element.dataset.laMdRenderVersion = RENDER_VERSION;
        });
    }

    async function copySource(raw) {
        try {
            await navigator.clipboard.writeText(raw);
            return;
        } catch {
            // Fall back when the browser blocks the asynchronous clipboard API.
        }

        const activeElement = document.activeElement;
        const selection = window.getSelection();
        const ranges = selection
            ? Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange())
            : [];
        const textarea = document.createElement("textarea");
        textarea.value = raw;
        textarea.setAttribute("readonly", "");
        textarea.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
        document.body.appendChild(textarea);
        try {
            textarea.select();
            if (!document.execCommand("copy")) {
                throw new Error("Clipboard access denied");
            }
        } finally {
            textarea.remove();
            activeElement?.focus({ preventScroll: true });
            if (selection) {
                selection.removeAllRanges();
                ranges.forEach((range) => selection.addRange(range));
            }
        }
    }

    function installCopySourceButton(element, raw) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "la-md-copy-source";
        button.textContent = "Copy source";
        button.title = "Copy original Markdown source";
        button.setAttribute("aria-live", "polite");
        button.addEventListener("click", async (event) => {
            event.preventDefault();
            event.stopPropagation();
            button.disabled = true;
            try {
                await copySource(raw);
                button.textContent = "Copied!";
            } catch {
                button.textContent = "Copy failed";
            } finally {
                window.setTimeout(() => {
                    button.textContent = "Copy source";
                    button.disabled = false;
                }, 2000);
            }
        });
        element.appendChild(button);
    }

    function renderMarkdown(md, raw) {
        return md.render(raw)
            .replace(/(<blockquote class="la-md-alert[^"]*" data-alert="[^"]+">\s*<p>)<br>\s*/g, "$1");
    }

    function isCutoffNote(raw) {
        return raw.trim() === "---";
    }

    function useIfAvailable(md, globalName, options) {
        const plugin = window[globalName];
        if (typeof plugin === "function") {
            md.use(plugin, options);
        }
    }

    function githubAlertsPlugin(md) {
        const labels = new Map([
            ["NOTE", "Note"],
            ["TIP", "Tip"],
            ["IMPORTANT", "Important"],
            ["WARNING", "Warning"],
            ["CAUTION", "Caution"],
        ]);

        md.core.ruler.after("inline", "la_github_alerts", (state) => {
            const tokens = state.tokens;
            for (let index = 0; index < tokens.length - 2; index += 1) {
                const open = tokens[index];
                const paragraph = tokens[index + 1];
                const inline = tokens[index + 2];

                if (
                    open.type !== "blockquote_open" ||
                    paragraph.type !== "paragraph_open" ||
                    inline.type !== "inline"
                ) {
                    continue;
                }

                const match = inline.content.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\n)?/i);
                if (!match) {
                    continue;
                }

                const key = match[1].toUpperCase();
                const label = labels.get(key);
                open.attrJoin("class", `la-md-alert la-md-alert-${key.toLowerCase()}`);
                open.attrSet("data-alert", label);
                inline.content = inline.content.slice(match[0].length).replace(/^\n/, "");

                if (!inline.children?.length) {
                    continue;
                }

                const first = inline.children[0];
                if (first.type === "text") {
                    first.content = first.content.slice(match[0].length).replace(/^\n/, "");
                }

                while (
                    (inline.children[0]?.type === "text" && inline.children[0].content === "") ||
                    inline.children[0]?.type === "softbreak" ||
                    inline.children[0]?.type === "hardbreak"
                ) {
                    inline.children.shift();
                }
            }
        });
    }

    function createMarkdownRenderer() {
        const md = window
            .markdownit({
                html: false,
                linkify: true,
                typographer: true,
                breaks: true,
                highlight: highlightCode,
            })
            .use(window.markdownitTaskLists, {
                enabled: true,
                label: true,
                labelAfter: true,
            });

        useIfAvailable(md, "markdownitFootnote");
        useIfAvailable(md, "markdownitDeflist");
        useIfAvailable(md, "markdownitAbbr");
        useIfAvailable(md, "markdownitMark");
        useIfAvailable(md, "markdownitIns");
        useIfAvailable(md, "markdownitSub");
        useIfAvailable(md, "markdownitSup");
        useIfAvailable(md, "markdownitEmoji");
        md.use(githubAlertsPlugin);

        return md;
    }

    function highlightCode(code, language) {
        const hljs = window.hljs;
        const lang = (language || "").trim().split(/\s+/)[0];
        const escapedLang = window.markdownit().utils.escapeHtml(lang);

        if (!hljs) {
            return `<pre><code>${window.markdownit().utils.escapeHtml(code)}</code></pre>`;
        }

        let highlighted;
        if (lang && hljs.getLanguage(lang)) {
            highlighted = hljs.highlight(code, {
                language: lang,
                ignoreIllegals: true,
            }).value;
        } else {
            highlighted = hljs.highlightAuto(code).value;
        }

        const label = lang
            ? `<span class="la-md-code-lang">${escapedLang}</span>`
            : "";

        return `<pre><code class="hljs language-${escapedLang}">${label}${highlighted}</code></pre>`;
    }

    function applyNoteCutoffs(root = document) {
        const containers = new Set(
            [...root.querySelectorAll(".MessageListContent")]
                .concat(root.matches?.(".MessageListContent") ? [root] : [])
        );

        if (!containers.size) {
            containers.add(document);
        }

        containers.forEach((container) => {
            const notes = [
                ...container.querySelectorAll(".la-md-note, .NoteText, .PlainTextWidget"),
            ].filter((note) =>
                note.matches(".la-md-note") ||
                note.closest(".MessageNotification.Notes") ||
                note.closest(".MessageGroupWithNote") ||
                note.closest(".TicketItemInternal")
            );
            const cutoffIndex = notes.findLastIndex((note) =>
                isCutoffNote(note.dataset.laMdRaw || readPlainText(note))
            );

            notes.forEach((note, index) => {
                const noteRow = note.closest(".MessageGroup") ||
                    note.closest(".TicketItemInternal") ||
                    note.closest(".MessageNotification.Notes");

                noteRow?.classList.toggle(
                    "la-md-hidden-before-cutoff",
                    cutoffIndex !== -1 && index < cutoffIndex
                );
            });
        });
    }

    function runMarkdownEnhancements(md) {
        renderMarkdownNotes(md);
        enhanceTextareas(md);
        applyNoteCutoffs();
    }

    function enhanceTextareas(md, root = document) {
        root.querySelectorAll("textarea.gwt-TextArea").forEach((textarea) => {
            if (textarea.dataset.laMdEnhanced) {
                updateTextareaPreview(md, textarea);
                return;
            }

            textarea.dataset.laMdEnhanced = "1";
            textarea.placeholder = textarea.placeholder || "Markdown supported";
            textarea.setAttribute("spellcheck", "true");
            textarea.closest(".NoteTextareaPanel")?.classList.add("la-md-note-editor");
            installTextareaPreview(md, textarea);
        });
    }

    function installTextareaPreview(md, textarea) {
        const panel = textarea.closest(".NoteTextareaPanel");
        const source = textarea.closest(".NoteTextarea");
        if (!panel || !source) {
            return;
        }

        panel.classList.add("la-md-editor-split");

        let preview = panel.querySelector(".la-md-note-preview");
        if (!preview) {
            preview = document.createElement("div");
            preview.className = "la-md-note la-md-note-preview";
            preview.setAttribute("aria-hidden", "true");
            source.insertAdjacentElement("afterend", preview);
        }

        if (!textarea.dataset.laMdPreviewBound) {
            textarea.dataset.laMdPreviewBound = "1";
            textarea.addEventListener("input", () => updateTextareaPreview(md, textarea));
            textarea.addEventListener("change", () => updateTextareaPreview(md, textarea));
        }

        updateTextareaPreview(md, textarea);
    }

    function updateTextareaPreview(md, textarea) {
        const preview = textarea
            .closest(".NoteTextareaPanel")
            ?.querySelector(".la-md-note-preview");
        if (!preview) {
            return;
        }

        const raw = textarea.value.trim();
        if (!raw) {
            preview.innerHTML = "";
            preview.classList.remove("la-md-note-cutoff");
            return;
        }

        if (isCutoffNote(raw)) {
            preview.innerHTML = "";
            preview.classList.add("la-md-note-cutoff");
            return;
        }

        preview.classList.remove("la-md-note-cutoff");
        preview.innerHTML = renderMarkdown(md, raw);
        preview.querySelectorAll("input, button, select, textarea").forEach((control) => {
            control.disabled = true;
            control.tabIndex = -1;
        });
    }

    function observeDom(md) {
        let queued = false;
        const run = () => {
            queued = false;
            runMarkdownEnhancements(md);
        };

        const observer = new MutationObserver(() => {
            if (queued) {
                return;
            }
            queued = true;
            window.requestAnimationFrame(run);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    async function main() {
        installStyles();

        await loadScript(MARKDOWN_IT_URL, "markdownit");
        await loadScript(TASK_LISTS_URL, "markdownitTaskLists");
        await Promise.all(
            PLUGIN_SCRIPTS.map(([src, globalName]) => loadScript(src, globalName))
        );

        const md = createMarkdownRenderer();

        runMarkdownEnhancements(md);
        observeDom(md);

        window.setTimeout(() => runMarkdownEnhancements(md), 500);
        window.setTimeout(() => runMarkdownEnhancements(md), 1500);
    }

    main().catch((error) => {
        console.error("[ladesk.md]", error);
    });
})();
