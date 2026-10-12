// Seletor de temas (combobox com busca).

import { CATALOG_CATEGORIES, THEMES } from "./data.js";
import { L, T, enKey } from "./i18n.js";
import { setTheme } from "./theme.js";
import { chipsHTML, esc, fold } from "./util.js";


var themePicker = document.getElementById("themePicker");

var comboBtn;

var comboPop;

var comboSearch;

var comboList;

var comboStatus;

var comboIndex = -1;


// Botão que abre um popup com campo de busca (role=combobox) e a lista de temas (role=listbox).
function buildCombobox() {
  themePicker.innerHTML =
    '<div class="combobox">' +
    '<button type="button" class="combobox-btn" aria-expanded="false" aria-haspopup="dialog" aria-controls="themePop" aria-label="' + esc(T("combo.label")) + '">' +
    '<span class="combobox-swatch" aria-hidden="true"></span>' +
    '<span class="combobox-label">' + esc(T("combo.theme")) + '</span>' +
    '<svg class="combobox-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
    "</button>" +
    '<div class="combobox-pop" id="themePop" role="dialog" hidden>' +
    '<input type="search" class="combobox-search" role="combobox" aria-expanded="true" aria-controls="themeListbox" aria-autocomplete="list" autocomplete="off" spellcheck="false">' +
    '<p class="sr-only" role="status" aria-live="polite" id="themeStatus"></p>' +
    '<ul class="combobox-list" id="themeListbox" role="listbox"></ul>' +
    "</div>" +
    "</div>";

  comboBtn = themePicker.querySelector(".combobox-btn");
  comboPop = themePicker.querySelector(".combobox-pop");
  comboSearch = themePicker.querySelector(".combobox-search");
  comboList = themePicker.querySelector(".combobox-list");
  comboStatus = themePicker.querySelector("#themeStatus");

  fillComboList();

  comboBtn.addEventListener("click", function () {
    if (comboPop.hidden) openCombo(); else closeCombo(true);
  });
  bindComboEvents();
}


function fillComboList() {
  var html = "";
  var grp = 0;
  function optionHTML(t) {
    var label = L(t.label);
    return (
      '<li class="combobox-option" role="option" id="theme-opt-' + t.id + '" data-kind="theme" data-theme-id="' + t.id + '" data-search="' + esc(fold(label + " " + L(t.category))) + '" aria-selected="false">' +
      '<span class="opt-label">' + esc(label) + "</span>" +
      '<span class="ds-strip opt-strip" aria-hidden="true">' + chipsHTML(t.swatches) + "</span>" +
      "</li>"
    );
  }
  var def = THEMES.filter(function (t) { return t.id === "padrao"; })[0];
  var groups = (def ? [[def.category, [def]]] : []).concat(
    CATALOG_CATEGORIES.map(function (cat) {
      return [cat, THEMES.filter(function (t) { return t.id !== "padrao" && enKey(t.category) === enKey(cat); })];
    })
  );
  groups.forEach(function (g) {
    if (!g[1].length) return;
    var gid = "theme-grp-" + (grp++);
    html += '<li class="combobox-section" role="presentation"><span class="combobox-group" id="' + gid + '">' + esc(L(g[0])) + "</span>" +
      '<ul role="group" aria-labelledby="' + gid + '">' + g[1].map(optionHTML).join("") + "</ul></li>";
  });
  html += '<li class="combobox-empty" role="presentation" hidden>' + esc(T("combo.empty")) + "</li>";
  comboList.innerHTML = html;
  comboSearch.setAttribute("placeholder", T("combo.search"));
  comboSearch.setAttribute("aria-label", T("combo.search"));
  comboPop.setAttribute("aria-label", T("combo.label"));
  comboIndex = -1;
  filterCombo();
}


// Mostra só as opções que casam com a busca; esconde grupos vazios e avisa o total.
function filterCombo() {
  var q = fold(comboSearch.value.trim());
  var total = 0;
  comboList.querySelectorAll(".combobox-section").forEach(function (sec) {
    var shown = 0;
    sec.querySelectorAll(".combobox-option").forEach(function (opt) {
      var ok = !q || opt.dataset.search.indexOf(q) !== -1;
      opt.hidden = !ok;
      if (ok) shown++;
    });
    sec.hidden = shown === 0;
    total += shown;
  });
  comboList.querySelector(".combobox-empty").hidden = total !== 0;
  comboStatus.textContent = total + " " + (total === 1 ? T("list.one") : T("list.many"));
  setActive(q && total ? 0 : -1);
}


function visibleOptions() {
  return Array.prototype.slice.call(comboList.querySelectorAll(".combobox-option:not([hidden])"));
}


function bindComboEvents() {
  comboBtn.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (comboPop.hidden) openCombo();
    }
  });

  comboSearch.addEventListener("input", filterCombo);

  comboPop.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); moveActive(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); }
    else if (e.key === "Home" && comboIndex >= 0) { e.preventDefault(); setActive(0); }
    else if (e.key === "End" && comboIndex >= 0) { e.preventDefault(); setActive(visibleOptions().length - 1); }
    else if (e.key === "Enter") {
      var active = visibleOptions()[comboIndex];
      if (active) { e.preventDefault(); chooseOption(active); }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeCombo(true);
    } else if (e.key === "Tab") {
      closeCombo(false);
    }
  });

  comboList.addEventListener("click", function (e) {
    var opt = e.target.closest(".combobox-option");
    if (opt) chooseOption(opt);
  });

  document.addEventListener("click", function (e) {
    if (!themePicker.contains(e.target)) closeCombo(false);
  });
}


function openCombo() {
  comboPop.hidden = false;
  comboBtn.setAttribute("aria-expanded", "true");
  comboSearch.value = "";
  filterCombo();
  var selected = comboList.querySelector('[aria-selected="true"]');
  setActive(selected ? visibleOptions().indexOf(selected) : 0);
  comboSearch.focus();
}


function closeCombo(restoreFocus) {
  if (comboPop.hidden) return;
  comboPop.hidden = true;
  comboBtn.setAttribute("aria-expanded", "false");
  setActive(-1);
  if (restoreFocus) comboBtn.focus();
}


function setActive(index) {
  comboIndex = index;
  comboList.querySelectorAll(".combobox-option[data-active]").forEach(function (opt) {
    opt.removeAttribute("data-active");
  });
  var opt = index >= 0 ? visibleOptions()[index] : null;
  if (opt) {
    opt.setAttribute("data-active", "true");
    opt.scrollIntoView({ block: "nearest" });
    comboSearch.setAttribute("aria-activedescendant", opt.id);
  } else {
    comboIndex = -1;
    comboSearch.removeAttribute("aria-activedescendant");
  }
}


function chooseOption(opt) {
  selectTheme(opt.dataset.themeId);
}


function moveActive(delta) {
  var total = visibleOptions().length;
  if (!total) return;
  var next = comboIndex + delta;
  if (next < 0) next = total - 1;
  if (next >= total) next = 0;
  setActive(next);
}


function selectTheme(id) {
  setTheme(id);
  closeCombo(true);
}

export { buildCombobox, comboBtn, comboList, fillComboList, themePicker };
