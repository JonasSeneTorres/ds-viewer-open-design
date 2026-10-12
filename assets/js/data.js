// Dados dos design systems (índice, detalhes e catálogo).

import { T, enKey, lang } from "./i18n.js";
import { page } from "./layout.js";
import { app, esc } from "./util.js";


// ------------------------------------------------------------------
// Dados de design systems: data/ds/index.json (lista na ordem do combobox:
// padrão primeiro, depois as categorias) e data/ds/<id>.<lang>.json (detalhes,
// carregados só quando a página do DS é aberta) e data/themes/<id>.css (tema). Gerados por
// scripts/build_ds_details.py a partir do open-design.ai.
// ------------------------------------------------------------------

var THEMES = [];              // todos os design systems aplicáveis, na ordem do combobox

var DS_DATA = {};             // detalhes já carregados, por id e idioma (data/ds/<id>.<lang>.json)

var CATALOG = [];             // THEMES sem o padrão: {id,name,category,tagline,swatches}

var CATALOG_CATEGORIES = [];


function registerDs(d) {
  THEMES.push({
    id: d.id,
    label: d.name,
    hint: d.tagline,
    category: d.category,
    swatches: d.swatches,
    proprietary: d.proprietaryFonts || [],
    dir: d.dir || "ltr",         // "rtl" nos temas de escrita da direita para a esquerda (Urdu)
    schemes: d.schemes || null   // {base, alt}: o botão sol/lua só funciona nos temas com variante (data/modes.json)
  });
  if (d.id !== DEFAULT_THEME) {
    CATALOG.push({ id: d.id, name: d.name, category: d.category, tagline: d.tagline, swatches: d.swatches });
    if (!CATALOG_CATEGORIES.some(function (c) { return enKey(c) === enKey(d.category); })) CATALOG_CATEGORIES.push(d.category);
  }
}


function loadData() {
  return fetch("data/ds/index.json", { credentials: "same-origin" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (list) { list.forEach(registerDs); })
    .catch(function (err) {
      console.error("Falha ao carregar data/ds/index.json:", err);
      var main = document.getElementById("app");
      if (main) {
        main.innerHTML =
          '<div class="wrap page"><div class="empty"><strong>' + esc(T("load.title")) + "</strong>" +
          "<p>" + T("load.text") + "</p></div></div>";
      }
    });
}


// Detalhes de um DS no idioma atual (data/ds/<id>.<lang>.json), com cache por idioma.
function loadDsDetail(id) {
  var key = id + "|" + lang;
  if (DS_DATA[key]) return Promise.resolve(DS_DATA[key]);
  return fetch("data/ds/" + encodeURIComponent(id) + "." + lang + ".json", { credentials: "same-origin" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (d) { DS_DATA[key] = d; return d; });
}


var DEFAULT_THEME = "padrao";

export { CATALOG, CATALOG_CATEGORIES, DEFAULT_THEME, DS_DATA, THEMES, loadData, loadDsDetail };
