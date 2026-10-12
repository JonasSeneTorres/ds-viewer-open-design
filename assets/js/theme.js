// Tema: aplicar, trocar, URL, claro/escuro e avisos de fontes e contraste.

import { themePicker } from "./combobox.js";
import { THEME_KEY } from "./content.js";
import { DEFAULT_THEME, THEMES } from "./data.js";
import { L, T, lang } from "./i18n.js";
import { esc } from "./util.js";


// Cada tema é um CSS próprio (data/themes/<id>.css: variáveis + @import das fontes),
// carregado sob demanda. O padrão já vem linkado no index.html.
function themeLink(id) {
  var link = document.querySelector('link[data-theme-css="' + id + '"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "data/themes/" + encodeURIComponent(id) + ".css";
    link.setAttribute("data-theme-css", id);
    link.addEventListener("load", function () { link.setAttribute("data-loaded", ""); });
    document.head.appendChild(link);
  }
  return link;
}


function getStoredTheme() {
  try {
    var t = localStorage.getItem(THEME_KEY);
    if (t && THEMES.some(function (x) { return x.id === t; })) return t;
  } catch (e) {}
  return DEFAULT_THEME;
}


var currentTheme = DEFAULT_THEME;


// Aplica o tema só ao documento (prévia); setTheme também guarda a escolha e atualiza o combobox.
// Também deixa a classe "theme-<id>" no body, para ajustes de um tema só com seletor composto
// (ex.: body.theme-airbnb .site-header { ... }) sem vazar para os outros.
// O tema só é trocado quando o CSS dele termina de carregar, para não piscar o visual-base.
var wantedTheme = "";

// Aviso no topo para temas cujo guia usa fontes proprietárias: o site usa as fontes de reserva.
var FONT_NOTICE_KEY = "odv-font-notice-closed";


var CONTRAST_NOTICE_KEY = "odv-contrast-notice-closed";


function closedNotices(key) {
  try { return JSON.parse(sessionStorage.getItem(key || FONT_NOTICE_KEY) || "[]"); } catch (e) { return []; }
}


// Aviso de contraste: tokens do DS abaixo de 4,5:1 (WCAG 2.2 AA) que o build trocou.
// Os dados vêm de data/themes/<id>.contrast.json, gerado por scripts/build_ds_details.py.
var CONTRAST_DATA = {};


// Claro/escuro: a escolha (odv-scheme) vale para qualquer tema que tenha a variante.
var SCHEME_KEY = "odv-scheme";


function storedScheme() {
  try { return localStorage.getItem(SCHEME_KEY); } catch (e) { return null; }
}


function themeById(id) {
  return THEMES.filter(function (t) { return t.id === id; })[0] || null;
}


// true quando o tema tem variante e a escolha do visitante é justamente o modo alternativo
function altApplied(id) {
  var t = themeById(id);
  return !!(t && t.schemes && storedScheme() === t.schemes.alt);
}


function updateSchemeButton(id) {
  var btn = document.getElementById("schemeBtn");
  var t = themeById(id);
  if (!btn) return;
  var has = !!(t && t.schemes);
  var now = has ? (altApplied(id) ? t.schemes.alt : t.schemes.base) : "light";
  var target = now === "light" ? "dark" : "light";
  var label = has ? T(target === "dark" ? "scheme.toDark" : "scheme.toLight") : T("scheme.none");
  btn.setAttribute("data-target", has ? target : "dark");
  btn.setAttribute("aria-disabled", String(!has));
  btn.setAttribute("aria-label", label);
  btn.setAttribute("title", label);
}


var schemeBtn = document.getElementById("schemeBtn");

if (schemeBtn) {
  schemeBtn.addEventListener("click", function () {
    var t = themeById(wantedTheme);
    if (!t || !t.schemes) return;
    var now = altApplied(t.id) ? t.schemes.alt : t.schemes.base;
    try { localStorage.setItem(SCHEME_KEY, now === "light" ? "dark" : "light"); } catch (e) {}
    applyTheme(t.id);
  });
}


function loadContrast(id) {
  if (CONTRAST_DATA[id]) return Promise.resolve(CONTRAST_DATA[id]);
  return fetch("data/themes/" + encodeURIComponent(id) + ".contrast.json", { credentials: "same-origin" })
    .then(function (r) { return r.ok ? r.json() : []; })
    .catch(function () { return []; })
    .then(function (list) { return (CONTRAST_DATA[id] = Array.isArray(list) ? list : []); });
}


function ratioText(n) { return String(n).replace(".", lang === "pt-BR" ? "," : ".") + ":1"; }


function updateContrastNotice(id) {
  var box = document.getElementById("contrastNotice");
  if (!box) return;
  box.hidden = true;
  box.innerHTML = "";
  if (closedNotices(CONTRAST_NOTICE_KEY).indexOf(id) !== -1) return;
  var alt = altApplied(id);
  loadContrast(id).then(function (all) {
    var list = all.filter(function (a) { return (a.mode === "alt") === alt; });
    if (wantedTheme !== id || !list.length) return;
    var HEX = /^#[0-9a-f]{6}$/;
    function chip(hex) { return '<span class="cn-chip" style="background:' + esc(hex) + '"></span><code>' + esc(hex) + "</code>"; }
    var rows = list.filter(function (a) { return HEX.test(a.from) && HEX.test(a.to); }).map(function (a) {
      var hasOn = a.onFrom && HEX.test(a.onFrom) && HEX.test(a.onTo);
      var same = a.from === a.to; // só o texto do botão mudou: mostra a troca do texto sobre a cor do tema
      var on = hasOn ? ' <span class="cn-on">(' + esc(T(same ? "contrastnote.word" : "contrastnote.on")) + ": " +
        chip(a.onFrom) + " → " + chip(a.onTo) + ")</span>" : "";
      var limit = a.ratioTo < 4.5 ? ' <em>(' + esc(T("contrastnote.limit")) + ")</em>" : "";
      return "<li><strong>" + esc(T("ctok." + a.token)) + "</strong>: " + (same && hasOn ? chip(a.from) : chip(a.from) + " → " + chip(a.to)) + on +
        ' <span class="cn-ratio">' + esc(ratioText(a.ratioFrom)) + " → " + esc(ratioText(a.ratioTo)) + limit + "</span></li>";
    });
    if (!rows.length) return;
    box.innerHTML =
      '<div class="wrap font-notice-inner"><details><summary>' + esc(T("contrastnote.text").replace("{n}", String(rows.length))) +
      '</summary><ul class="cn-list">' + rows.join("") + "</ul></details>" +
      '<button type="button" class="font-notice-close" data-close-notice="' + esc(id) + '" data-notice-key="' + CONTRAST_NOTICE_KEY +
      '" data-notice-box="contrastNotice" aria-label="' + esc(T("close")) + '">&times;</button></div>';
    box.hidden = false;
  });
}


function updateFontNotice(id) {
  var box = document.getElementById("fontNotice");
  if (!box) return;
  var theme = THEMES.filter(function (t) { return t.id === id; })[0];
  var fonts = theme ? theme.proprietary : [];
  if (!fonts.length || closedNotices().indexOf(id) !== -1) {
    box.hidden = true;
    box.innerHTML = "";
    return;
  }
  var shown = fonts.slice(0, 3).join(", ") + (fonts.length > 3 ? "…" : "");
  box.innerHTML =
    '<div class="wrap font-notice-inner"><p>' + esc(T("fontnote.text").replace("{fonts}", shown)) + "</p>" +
    '<button type="button" class="font-notice-close" data-close-notice="' + esc(id) + '" aria-label="' + esc(T("close")) + '">&times;</button></div>';
  box.hidden = false;
}


document.addEventListener("click", function (e) {
  var btn = e.target.closest && e.target.closest("[data-close-notice]");
  if (!btn) return;
  var key = btn.getAttribute("data-notice-key") || FONT_NOTICE_KEY;
  var list = closedNotices(key);
  list.push(btn.getAttribute("data-close-notice"));
  try { sessionStorage.setItem(key, JSON.stringify(list)); } catch (err) {}
  var box = document.getElementById(btn.getAttribute("data-notice-box") || "fontNotice");
  box.hidden = true;
  box.innerHTML = "";
});


function applyTheme(id) {
  wantedTheme = id;
  var link = themeLink(id);
  function swap() {
    if (wantedTheme !== id) return;
    document.documentElement.setAttribute("data-theme", id);
    var body = document.body;
    body.className.split(/\s+/).forEach(function (c) {
      if (c.indexOf("theme-") === 0) body.classList.remove(c);
    });
    body.classList.add("theme-" + id);
    var th = themeById(id);
    if (altApplied(id)) document.documentElement.setAttribute("data-scheme", th.schemes.alt);
    else document.documentElement.removeAttribute("data-scheme");
    // direção do texto do tema (Urdu: da direita para a esquerda); o CSS usa propriedades lógicas
    document.documentElement.setAttribute("dir", (th && th.dir) || "ltr");
    updateSchemeButton(id);
    updateFontNotice(id);
    updateContrastNotice(id);
  }
  if (link.hasAttribute("data-loaded") || link.sheet) swap();
  else {
    link.addEventListener("load", swap);
    link.addEventListener("error", swap);
  }
}


// O seletor mostra sempre o tema que está na tela (inclusive a prévia de uma página de DS).
function syncPicker(id) {
  var theme = themeById(id);
  if (!theme) return;
  var label = themePicker.querySelector(".combobox-label");
  if (label) label.textContent = L(theme.label);
  themePicker.querySelectorAll(".combobox-option").forEach(function (opt) {
    opt.setAttribute("aria-selected", String(opt.dataset.themeId === id));
  });
}


// Tema na URL (?tema=<id>): a escolha é compartilhável e cada troca vira uma entrada do histórico,
// então o botão voltar desfaz a troca. A URL manda; sem ela vale o tema guardado no navegador.
function themeFromURL() {
  try {
    var t = new URLSearchParams(location.search).get("tema");
    return t && themeById(t) ? t : null;
  } catch (e) { return null; }
}


function writeThemeURL(id, push) {
  try {
    var url = new URL(location.href);
    url.searchParams.set("tema", id);
    history[push ? "pushState" : "replaceState"](null, "", url.pathname + url.search + url.hash);
  } catch (e) {}
}


// opts.history: "none" ao reagir ao voltar/avançar (a URL já está certa).
function setTheme(id, opts) {
  var theme = themeById(id) || themeById(DEFAULT_THEME) || THEMES[0];
  currentTheme = theme.id;
  updateThemeLink();
  applyTheme(theme.id);
  try {
    localStorage.setItem(THEME_KEY, theme.id);
  } catch (e) {}
  if (!(opts && opts.history === "none")) {
    var inUrl = themeFromURL();
    if (inUrl !== theme.id) writeThemeURL(theme.id, !!inUrl); // sem ?tema na URL (1ª carga): só completa
  }
  syncPicker(theme.id);
  // Destaca o card do tema ativo na página de Design System (se estiver aberta).
  document.querySelectorAll(".ds-card-cat").forEach(function (card) {
    card.classList.toggle("is-current", card.dataset.id === theme.id);
  });
}


// "Informações do tema" leva à página do tema escolhido.
function updateThemeLink() {
  var link = document.getElementById("navTheme");
  if (link) link.setAttribute("href", "#/design-system/" + encodeURIComponent(currentTheme));
}

export { applyTheme, currentTheme, getStoredTheme, setTheme, syncPicker, themeFromURL };
