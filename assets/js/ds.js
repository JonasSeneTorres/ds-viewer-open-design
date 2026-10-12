// Catálogo de design systems e página de detalhes de cada um.

import { CATALOG, CATALOG_CATEGORIES, DS_DATA, THEMES } from "./data.js";
import { L, T, enKey, lang } from "./i18n.js";
import { dsName, notFoundHTML } from "./layout.js";
import { currentTheme, setTheme } from "./theme.js";
import { app, chipsHTML, esc, inkFor, isColorValue } from "./util.js";


function dsIndex(id) {
  for (let i = 0; i < THEMES.length; i++) {
    if (THEMES[i].id === id) return i;
  }
  return -1;
}


// compact: sem kicker e título próprios (a home já tem o h1 do hero).
function renderDSList(compact) {
  // O padrão entra como primeira categoria, igual às do catálogo.
  const def = THEMES.filter(function (t) { return t.id === "padrao"; })[0];
  let entries = CATALOG;
  let cats = CATALOG_CATEGORIES;
  if (def) {
    entries = [{ id: def.id, name: def.label, category: def.category, tagline: def.hint, swatches: def.swatches }].concat(CATALOG);
    if (!cats.some(function (c) { return enKey(c) === enKey(def.category); })) cats = [def.category].concat(cats);
  }

  const chips =
    '<button type="button" class="ds-filter is-active" data-cat="">' + esc(T("list.all")) + "</button>" +
    cats.map(function (c) {
      return '<button type="button" class="ds-filter" data-cat="' + esc(enKey(c)) + '">' + esc(L(c)) + "</button>";
    }).join("");

  function cardHTML(c) {
    const strip = chipsHTML(c.swatches);
    return (
      '<a class="ds-card ds-card-cat' + (c.id === currentTheme ? " is-current" : "") + '" href="#/design-system/' + c.id + '" data-id="' + c.id + '" data-cat="' + esc(enKey(c.category)) + '" data-search="' + esc((L(c.name) + " " + L(c.tagline) + " " + L(c.category)).toLowerCase()) + '">' +
      '<div class="ds-card-head">' +
      '<span class="ds-index">' + esc(L(c.category)) + "</span>" +
      '<span class="ds-strip" aria-hidden="true">' + strip + "</span>" +
      "</div>" +
      "<h4>" + esc(L(c.name)) + ' <span class="ds-current-badge">' + esc(T("ds.current")) + "</span></h4>" +
      (L(c.tagline) ? "<p>" + esc(L(c.tagline)) + "</p>" : "") +
      '<span class="ds-card-link">' + esc(T("card.details")) + " &rarr;</span>" +
      "</a>"
    );
  }

  const groups = cats.map(function (cat) {
    const items = entries.filter(function (c) { return enKey(c.category) === enKey(cat); });
    if (!items.length) return "";
    return (
      '<section class="ds-group" data-cat="' + esc(enKey(cat)) + '">' +
      '<h3 class="ds-group-title">' + esc(L(cat)) + ' <span class="ds-group-count muted"></span></h3>' +
      '<div class="ds-grid">' + items.map(cardHTML).join("") + "</div>" +
      "</section>"
    );
  }).join("");

  return (
    '<div class="ds-page">' +
    (compact ? "" : '<span class="kicker">' + esc(T("list.kicker")) + "</span>" + "<h1>" + esc(T("list.h1")) + "</h1>") +
    '<p class="lede">' + esc(T("list.lede")) + ' <a href="https://open-design.ai/plugins/systems/" target="_blank" rel="noopener">open-design.ai</a>.</p>' +
    '<section class="ds-section">' +
    '<div class="ds-catalog-head">' +
    "<h2>" + esc(T("list.catalog")) + "</h2>" +
    '<label class="ds-search"><span class="sr-only">' + esc(T("list.searchLabel")) + '</span><input type="search" id="dsSearch" placeholder="' + esc(T("list.searchPh")) + '"></label>' +
    "</div>" +
    '<div class="ds-filters" id="dsFilters">' + chips + "</div>" +
    '<p class="muted" id="dsCount"></p>' +
    '<div id="dsCatalogGrid">' + groups + "</div>" +
    "</section>" +
    "</div>"
  );
}


function initDSList() {
  const search = document.getElementById("dsSearch");
  const filters = document.getElementById("dsFilters");
  const grid = document.getElementById("dsCatalogGrid");
  const count = document.getElementById("dsCount");
  if (!grid) return;
  let activeCat = "";

  function apply() {
    const q = (search && search.value || "").trim().toLowerCase();
    let n = 0;
    grid.querySelectorAll(".ds-group").forEach(function (group) {
      let shown = 0;
      group.querySelectorAll(".ds-card-cat").forEach(function (card) {
        const ok = (!activeCat || card.dataset.cat === activeCat) &&
                 (!q || card.dataset.search.indexOf(q) !== -1);
        card.hidden = !ok;
        if (ok) shown++;
      });
      group.hidden = shown === 0;
      group.querySelector(".ds-group-count").textContent = "(" + shown + ")";
      n += shown;
    });
    if (count) count.textContent = n + " " + (n === 1 ? T("list.one") : T("list.many"));
  }

  if (search) search.addEventListener("input", apply);
  if (filters) {
    filters.addEventListener("click", function (e) {
      const btn = e.target.closest(".ds-filter");
      if (!btn) return;
      activeCat = btn.dataset.cat;
      filters.querySelectorAll(".ds-filter").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      apply();
    });
  }
  apply();
}


// Sequência única (a mesma do combobox): padrão primeiro e depois as categorias do catálogo.
function dsSequence() {
  return THEMES.map(function (t) { return t.id; });
}


function dsPager(id) {
  const seq = dsSequence();
  const i = seq.indexOf(id);
  const prev = i > 0 ? seq[i - 1] : null;
  const next = i !== -1 && i < seq.length - 1 ? seq[i + 1] : null;
  return (
    '<nav class="ds-pager" aria-label="' + esc(T("pager.label")) + '">' +
    (prev
      ? '<a class="btn btn-ghost" rel="prev" href="#/design-system/' + prev + '"><span aria-hidden="true">&larr;</span> ' + esc(dsName(prev)) + "</a>"
      : "<span></span>") +
    (next
      ? '<a class="btn btn-ghost" rel="next" href="#/design-system/' + next + '">' + esc(dsName(next)) + ' <span aria-hidden="true">&rarr;</span></a>'
      : "<span></span>") +
    "</nav>"
  );
}


function dsPaletteHTML(d) {
  const roleOf = {};
  roleOf[d.roles.primary] = T("pal.primary");
  roleOf[d.roles.secondary] = T("pal.secondary");
  roleOf[d.roles.neutral] = T("pal.neutral");
  const byName = {};
  d.palettes.forEach(function (p) { byName[p.name] = p; });
  const roleCards = ["primary", "secondary", "neutral"].map(function (r) {
    const p = byName[d.roles[r]];
    if (!p) return "";
    return (
      '<div class="role-card">' +
      '<span class="role-chip" style="background:' + esc(p.base) + ";color:" + inkFor(p.base) + '">' + esc(p.base) + "</span>" +
      '<span class="role-label">' + roleOf[p.name] + "</span>" +
      "<strong>" + esc(p.name) + "</strong>" +
      "</div>"
    );
  }).join("");

  const scales = d.palettes.map(function (p) {
    return (
      '<div class="palette">' +
      '<div class="palette-head"><h3>' + esc(p.name) + "</h3>" +
      (roleOf[p.name] ? '<span class="palette-role">' + roleOf[p.name] + "</span>" : "") +
      "</div>" +
      '<div class="palette-scale">' +
      p.scale.map(function (c) {
        return (
          '<div class="palette-step' + (c.exact ? " is-exact" : "") + '" style="background:' + esc(c.hex) + ";color:" + inkFor(c.hex) + '">' +
          '<span class="palette-num">' + c.step + "</span>" +
          '<code class="palette-hex">' + esc(c.hex) + "</code>" +
          "</div>"
        );
      }).join("") +
      "</div>" +
      "</div>"
    );
  }).join("");

  return (
    '<section class="ds-section" id="palette">' +
    "<h2>" + esc(T("pal.title")) + "</h2>" +
    '<p class="muted">' + T("pal.intro") + "</p>" +
    '<div class="role-cards">' + roleCards + "</div>" +
    scales +
    "</section>"
  );
}


function dsFontsHTML(d) {
  const fonts = d.fonts.map(function (f) {
    const fallbackStack = f.fallbacks.length
      ? f.fallbacks.map(function (x) { return /\s/.test(x) ? '"' + x + '"' : x; }).join(", ")
      : "";
    const generic = f.kind === "mono" ? "monospace" : "sans-serif";
    const sample = function (family, label) {
      const txt = "Quick brown fox jumps over the lazy dog 0123456789";
      return (
        '<div class="font-sample">' +
        '<span class="font-sample-label">' + label + "</span>" +
        '<p style="font-family:' + esc(family) + ';font-weight:400">' + esc(T("font.regular")) + " — " + txt + "</p>" +
        '<p style="font-family:' + esc(family) + ';font-style:italic;font-weight:400">' + esc(T("font.italic")) + " — " + txt + "</p>" +
        '<p style="font-family:' + esc(family) + ';font-weight:700">' + esc(T("font.bold")) + " — " + txt + "</p>" +
        "</div>"
      );
    };
    const how = f.source
      ? "<h4>" + esc(T("font.how")) + "</h4>" +
        '<p class="muted">' + T("font.head") + "</p><pre><code>" + esc(f.source.link) + "</code></pre>" +
        '<p class="muted">' + esc(T("font.css")) + "</p><pre><code>" + esc(f.source.import) + "</code></pre>" +
        '<p class="muted">' + esc(T("font.npm")) + "</p><pre><code>" + esc(f.source.npm) + "</code></pre>" +
        '<p class="muted">' + esc(T("font.then")) + " <code>font-family: " + esc(f.stack) + ";</code>. " + esc(T("font.ref")) + " " +
        '<a href="' + esc(f.source.page) + '" target="_blank" rel="noopener">' + esc(f.source.page) + "</a></p>"
      : '<p class="muted">' + esc(T("font.none")) + "</p>";
    return (
      '<div class="font-card">' +
      '<div class="font-card-head"><h3>' + esc(f.family) + '</h3><span class="palette-role">' + esc(L(f.role)) + "</span></div>" +
      '<p class="muted">' + esc(T("font.stack")) + " <code>" + esc(f.stack) + "</code></p>" +
      (f.italic ? "" : '<p class="muted">' + esc(T("font.noItalic")) + "</p>") +
      '<div class="font-samples">' +
      sample(f.stack, esc(f.family)) +
      (fallbackStack ? sample(fallbackStack + ", " + generic, esc(T("font.fallback")) + " · " + esc(f.fallbacks.slice(0, 2).join(", "))) : "") +
      "</div>" +
      how +
      "</div>"
    );
  }).join("");
  return '<section class="ds-section" id="fonts"><h2>' + esc(T("font.title")) + '</h2>' + fonts + "</section>";
}


function dsTokensHTML(d) {
  const groups = d.tokens.map(function (g) {
    if (!g.items.length) return "";
    return (
      '<div class="token-group"><h3>' + esc(L(g.group)) + "</h3>" +
      '<table class="token-table"><tbody>' +
      g.items.map(function (t) {
        return (
          "<tr>" +
          "<td>" + (isColorValue(t.value) ? '<span class="token-chip" style="background:' + esc(t.value) + '"></span>' : "") + "</td>" +
          "<td><code>" + esc(t.name) + "</code></td>" +
          "<td><code>" + esc(t.value) + "</code></td>" +
          "</tr>"
        );
      }).join("") +
      "</tbody></table></div>"
    );
  }).join("");
  return '<section class="ds-section" id="tokens"><h2>' + esc(T("tok.title")) + '</h2><div class="token-groups">' + groups + "</div></section>";
}


function renderDsFull(id) {
  const d = DS_DATA[id + "|" + lang];
  const atmos = d.sections[0];
  const rest = d.sections.slice(1);
  return (
    '<div class="ds-page ds-full">' +
    '<span class="kicker">' + esc(T("ds.kicker")) + " &middot; " + esc(L(d.category)) + "</span>" +
    "<h1>" + esc(L(d.name)) + "</h1>" +
    (L(d.intro) ? '<p class="lede">' + esc(L(d.intro)) + "</p>" : "") +
    '<div class="ds-actions">' +
    '<button type="button" class="btn btn-primary" data-apply="' + esc(id) + '">' + esc(T("ds.apply")) + "</button>" +
    (d.source.url ? '<a class="btn btn-ghost" href="' + esc(d.source.url) + '" target="_blank" rel="noopener">' + esc(T("ds.open")) + ' <svg class="ext-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg><span class="sr-only">' + esc(T("ds.newTab")) + '</span></a>' : "") +
    "</div>" +
    dsPager(id) +
    '<section class="ds-section" id="' + atmos.id + '">' +
    "<h2>" + esc(L(atmos.title)) + "</h2>" +
    '<div class="guide-body">' + L(atmos.html) + "</div>" +
    "</section>" +
    dsPaletteHTML(d) +
    dsFontsHTML(d) +
    dsTokensHTML(d) +
    rest.map(function (sec) {
      return (
        '<section class="ds-section" id="' + sec.id + '">' +
        "<h2>" + esc(L(sec.title)) + "</h2>" +
        '<div class="guide-body">' + L(sec.html) + "</div>" +
        "</section>"
      );
    }).join("") +
    dsPager(id) +
    "</div>"
  );
}


function renderDSDetail(id) {
  return DS_DATA[id + "|" + lang] ? renderDsFull(id) : notFoundHTML();
}


function initDSDetail() {
  app.querySelectorAll("[data-apply]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = btn.getAttribute("data-apply");
      setTheme(id);
      btn.textContent = T("ds.applied");
    });
  });
}

export { dsIndex, initDSDetail, initDSList, renderDSDetail, renderDSList };
