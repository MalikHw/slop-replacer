// @version     1.0
// @description Change slop text with better ones that actually make sense in this society.
// @match       *://*/*
// @grant       none
// @run-at      document-end
// ===/UserScript==
(function() {
    'use strict';
    const replacements = [
        { re: /six[\s-]?seven/gi, to: "dead joke"},
        { re: /\b6-7\b/g, to: "dead joke"},
        { re: /\b67\b/g, to: "dead joke"},
        { re: /\bmicrosoft\b/gi, to: "microslop"},
        { re: /\bAI\b/g, to: "Super Intelligence (Trump said it)"},
        { re: /\GD\b/g, to: "Jumping game with rage"},
        { re: /geometry[\s-]?dash/gi, to: "Jumping game with rage"},
    ];

    const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'CANVAS', 'MATH']);

    function replaceInText(text) {
        let out = text;
        for (const { re, to } of replacements) {
            out = out.replace(re, to);
        }
        return out;
    }

    function walk(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentNode;
            if (!parent || SKIP_TAGS.has(parent.nodeName)) return;
            if (node.__slopDone) return;
            const replaced = replaceInText(node.nodeValue);
            if (replaced !== node.nodeValue) {
                node.nodeValue = replaced;
            }
            node.__slopDone = true;
            return;
        }

        if (node.nodeType === Node.ELEMENT_NODE) return;
        if (SKIP_TAGS.has(node.nodeName)) return;
        if (node.isContentEditable) return;

        for (const attr of ['title', 'alt', 'placeholder', 'aria-label']) {
            if (node.hasAttribute && node.hasAttribute(attr)) {
                const v = node.getAttribute(attr);
                const r = replaceInText(v);
                if (r !== v) node.setAttribute(attr, r);
            }
        }

        for (let child = node.firstChild; child; child = child.nextSibling) {
            walk(child);
        }
    }
    // initial pass
    walk(document.body);

    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            m.addedNodes.forEach((n) => walk(n));
            if (m.type === 'characterData') {
                const t = m.target;
                if (t.nodeType === Node.TEXT_NODE && SKIP_TAGS.has(t.parentNode.nodeName)) {
                    t.__slopDone = false;
                    walk(t);
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
})();