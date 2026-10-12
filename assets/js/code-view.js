// Visão de código de um componente: modal com três abas (HTML, CSS e JavaScript).
// O código mostrado é o que o site realmente usa: o HTML vem do próprio elemento na página, e o CSS e o
// JavaScript são lidos dos arquivos publicados (assets/css/*.css e o módulo do componente).

import { T } from "./i18n.js";
import { showToast } from "./ui.js";

const cache = {};

function fetchText(url) {
  if (!cache[url]) {
    cache[url] = fetch(url, { credentials: "same-origin" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    });
  }
  return cache[url];
}

// ---- HTML: reindenta o markup do elemento (2 espaços), sem depender de bibliotecas
const VOID = { area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1, link: 1, meta: 1, source: 1, track: 1, wbr: 1 };

function formatHTML(html) {
  const doc = new DOMParser().parseFromString("<body>" + html + "</body>", "text/html");
  const lines = [];
  function esc(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function attrs(el) {
    return Array.prototype.map.call(el.attributes, function (a) {
      return " " + a.name + (a.value === "" ? "" : '="' + a.value.replace(/"/g, "&quot;") + '"');
    }).join("");
  }
  function walk(node, depth) {
    const pad = new Array(depth + 1).join("  ");
    if (node.nodeType === 3) {
      const t = node.textContent.replace(/\s+/g, " ").trim();
      if (t) lines.push(pad + esc(t));
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    const kids = Array.prototype.filter.call(node.childNodes, function (c) {
      return c.nodeType === 1 || (c.nodeType === 3 && c.textContent.trim());
    });
    if (VOID[tag]) { lines.push(pad + "<" + tag + attrs(node) + ">"); return; }
    if (!kids.length) { lines.push(pad + "<" + tag + attrs(node) + "></" + tag + ">"); return; }
    if (kids.length === 1 && kids[0].nodeType === 3) {
      lines.push(pad + "<" + tag + attrs(node) + ">" + esc(kids[0].textContent.replace(/\s+/g, " ").trim()) + "</" + tag + ">");
      return;
    }
    lines.push(pad + "<" + tag + attrs(node) + ">");
    kids.forEach(function (c) { walk(c, depth + 1); });
    lines.push(pad + "</" + tag + ">");
  }
  Array.prototype.forEach.call(doc.body.childNodes, function (n) { walk(n, 0); });
  return lines.join("\n");
}

// ---- CSS: as regras de nível superior cujo seletor casa com o padrão do componente
function extractCss(css, pattern) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [];
  let depth = 0, start = 0;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const rule = css.slice(start, i + 1).trim();
        start = i + 1;
        if (rule[0] === "@") continue;
        const brace = rule.indexOf("{");
        // regra compartilhada ("a, b { ... }"): fica só com os seletores deste componente
        const mine = rule.slice(0, brace).split(",").map(function (s) { return s.trim(); })
          .filter(function (s) { return pattern.test(s); });
        if (mine.length) rules.push(mine.join(",\n") + " " + rule.slice(brace));
      }
    }
  }
  return rules.join("\n\n");
}

// ---- JavaScript: o corpo das funções pedidas, lidas do módulo publicado
function extractFunctions(src, names) {
  const out = [];
  names.forEach(function (name) {
    const m = new RegExp("(^|\\n)(function " + name + "\\s*\\()").exec(src);
    if (!m) return;
    const i = m.index + m[1].length;
    const open = src.indexOf("{", src.indexOf(")", i));
    let depth = 0, quote = null;
    for (let j = open; j < src.length; j++) {
      const c = src[j];
      if (quote) {
        if (c === "\\") j++;
        else if (c === quote) quote = null;
      } else if (c === '"' || c === "'" || c === "`") quote = c;
      else if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) { out.push(src.slice(i, j + 1)); break; }
      }
    }
  });
  return out.join("\n\n");
}

// ---- modal
let dialog = null;
const TABS = [["html", "comp.codeHtml"], ["css", "comp.codeCss"], ["js", "comp.codeJs"]];

function build() {
  dialog = document.createElement("dialog");
  dialog.className = "dialog-code";
  dialog.setAttribute("aria-labelledby", "codeTitle");
  dialog.innerHTML =
    '<div class="dialog-head"><h2 id="codeTitle"></h2>' +
    '<button type="button" class="icon-btn" data-close>&times;</button></div>' +
    '<div class="code-tabs"><div class="tablist" role="tablist" id="codeTablist">' +
    TABS.map(function (t, i) {
      return '<button type="button" role="tab" class="tab" id="codeTab-' + t[0] + '" aria-controls="codePanel-' + t[0] +
        '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '"></button>';
    }).join("") + "</div></div>" +
    '<div class="dialog-body code-body">' +
    TABS.map(function (t, i) {
      return '<div role="tabpanel" class="code-panel" id="codePanel-' + t[0] + '" aria-labelledby="codeTab-' + t[0] + '"' + (i === 0 ? "" : " hidden") + ">" +
        '<div class="code-bar"><span class="code-note"></span><button type="button" class="btn btn-ghost btn-small" data-copy="' + t[0] + '"></button></div>' +
        '<pre tabindex="0"><code id="codeText-' + t[0] + '"></code></pre></div>';
    }).join("") +
    '<p class="sr-only" role="status" aria-live="polite" id="codeStatus"></p></div>';
  document.body.appendChild(dialog);

  const tabs = Array.prototype.slice.call(dialog.querySelectorAll('[role="tab"]'));
  function select(i, focus) {
    tabs.forEach(function (t, j) {
      const on = i === j;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(i, false); });
    t.addEventListener("keydown", function (e) {
      const n = tabs.length;
      let to = null;
      if (e.key === "ArrowRight") to = (i + 1) % n;
      else if (e.key === "ArrowLeft") to = (i - 1 + n) % n;
      else if (e.key === "Home") to = 0;
      else if (e.key === "End") to = n - 1;
      if (to === null) return;
      e.preventDefault();
      select(to, true);
    });
  });
  dialog.select = select;
  dialog.addEventListener("close", function () {
    if (dialog.opener && dialog.opener.focus) dialog.opener.focus();
  });

  dialog.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]") || e.target === dialog) { dialog.close(); return; }
    const copy = e.target.closest("[data-copy]");
    if (!copy) return;
    const text = document.getElementById("codeText-" + copy.getAttribute("data-copy")).textContent;
    const done = function () { showToast("ok", T("comp.copied")); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
    else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (err) {}
      document.body.removeChild(ta);
    }
  });
}

function labels(spec) {
  dialog.querySelector("#codeTitle").textContent = T("comp.codeTitle").replace("{name}", T(spec.nameKey));
  dialog.querySelector(".icon-btn").setAttribute("aria-label", T("close"));
  TABS.forEach(function (t) {
    dialog.querySelector("#codeTab-" + t[0]).textContent = T(t[1]);
    dialog.querySelector('[data-copy="' + t[0] + '"]').textContent = T("comp.copy");
  });
  dialog.querySelector('#codePanel-html .code-note').textContent = T("comp.noteHtml");
  dialog.querySelector('#codePanel-css .code-note').textContent = T("comp.noteCss");
  dialog.querySelector('#codePanel-js .code-note').textContent = T("comp.noteJs");
  document.getElementById("codeStatus").textContent = "";
}

// spec: { nameKey, html: string, cssPattern: RegExp, fns: [nomes], jsUrl, cssUrls: [arquivos CSS], opener }
// opener: o botão que abriu o modal; ao fechar, o foco volta para ele (no Safari o clique não foca o botão,
// então o navegador não sabe para onde devolver).
function openCodeView(spec) {
  if (!dialog) build();
  dialog.opener = spec.opener || null;
  labels(spec);
  const set = function (key, text) { document.getElementById("codeText-" + key).textContent = text; };
  set("html", formatHTML(spec.html));
  set("css", T("comp.loading"));
  set("js", T("comp.loading"));
  dialog.select(0, false);
  if (!dialog.open) dialog.showModal();

  Promise.all(spec.cssUrls.map(fetchText)).then(function (parts) {
    set("css", extractCss(parts.join("\n"), spec.cssPattern) || T("comp.codeError"));
  }).catch(function () { set("css", T("comp.codeError")); });

  fetchText(spec.jsUrl).then(function (src) {
    let code = extractFunctions(src, spec.fns);
    if (/\bT\(|\besc\(/.test(code)) code = "// T(chave) traduz o texto e esc() escapa HTML: utilitários do site.\n\n" + code;
    set("js", code || T("comp.codeError"));
  }).catch(function () { set("js", T("comp.codeError")); });
}

export { openCodeView };
