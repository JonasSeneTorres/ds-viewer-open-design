// Página de componentes: abas, accordion, toast, tooltip e paginação.
// Tooltip, toast, accordion e paginação vêm de ui.js, os mesmos usados no resto do site;
// as abas são específicas desta página. Tudo com teclado e leitor de tela (padrões WAI-ARIA).

import { openCodeView } from "./code-view.js";
import { T } from "./i18n.js";
import { accordionHTML, mountPagination, paginationHTML, showToast, tipWrap, toastMarkup } from "./ui.js";
import { esc } from "./util.js";

var TAB_KEYS = ["comp.tab1", "comp.tab2", "comp.tab3"];
var ACC_KEYS = ["comp.acc1", "comp.acc2", "comp.acc3"];
var LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
var PAGES = 12;

function block(title, body, cls, codeKey) {
  return (
    '<section class="widget' + (cls ? " " + cls : "") + '"><div class="widget-head"><h2 class="widget-title">' + esc(title) + "</h2>" +
    '<button type="button" class="btn btn-ghost btn-small code-btn" data-code="' + codeKey + '" aria-label="' +
    esc(T("comp.code")) + ": " + esc(title) + '">' + esc(T("comp.code")) + "</button></div>" +
    '<div class="widget-body">' + body + "</div></section>"
  );
}

function tabsHTML() {
  return (
    '<div class="tabs" id="demoTabs">' +
    '<div class="tablist" role="tablist" aria-label="' + esc(T("comp.tabs")) + '">' +
    TAB_KEYS.map(function (k, i) {
      return (
        '<button type="button" role="tab" class="tab" id="tab' + i + '" aria-controls="tabpanel' + i + '"' +
        ' aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + esc(T(k)) + "</button>"
      );
    }).join("") +
    "</div>" +
    TAB_KEYS.map(function (k, i) {
      return (
        '<div role="tabpanel" class="tabpanel" id="tabpanel' + i + '" aria-labelledby="tab' + i + '"' + (i === 0 ? "" : " hidden") + ">" +
        "<p>" + esc(T(k)) + ": " + esc(LOREM) + "</p></div>"
      );
    }).join("") +
    "</div>"
  );
}

function demoAccordionHTML() {
  return accordionHTML(ACC_KEYS.map(function (k, i) {
    return { id: "acc" + i, title: T(k), body: "<p>" + esc(LOREM) + "</p>", open: i === 0 };
  }));
}

function toastHTML() {
  return (
    '<div class="btn-row">' +
    [["ok", "comp.toastOk", "comp.toastOkMsg", "btn-success"], ["warn", "comp.toastWarn", "comp.toastWarnMsg", "btn-ghost"],
      ["danger", "comp.toastErr", "comp.toastErrMsg", "btn-danger"]].map(function (t) {
      return '<button type="button" class="btn ' + t[3] + '" data-toast="' + t[0] + '" data-msg="' + t[2] + '">' + esc(T(t[1])) + "</button>";
    }).join("") +
    "</div>"
  );
}

function tooltipHTML() {
  return (
    '<div class="tip-row">' +
    tipWrap('<button type="button" class="btn btn-ghost" aria-describedby="tip1">' + esc(T("comp.tipBtn")) + "</button>", "tip1", T("comp.tipText")) +
    tipWrap('<a href="#/componentes" aria-describedby="tip2">' + esc(T("comp.tipLink")) + "</a>", "tip2", T("comp.tipText2")) +
    "</div>"
  );
}

function componentsHTML() {
  return (
    '<div class="page-head">' +
    '<span class="kicker">' + esc(T("comp.kicker")) + "</span>" +
    "<h1>" + esc(T("comp.h1")) + "</h1>" +
    '<p class="lede">' + esc(T("comp.lede")) + "</p>" +
    '<p class="comp-note">' + esc(T("comp.note")) + "</p>" +
    "</div>" +
    '<div class="dash-grid">' +
    block(T("comp.tabs"), tabsHTML(), "", "tabs") +
    block(T("comp.accordion"), demoAccordionHTML(), "", "accordion") +
    block(T("comp.toast"), toastHTML(), "", "toast") +
    block(T("comp.tooltip"), tooltipHTML(), "", "tooltip") +
    block(T("comp.pagination"), '<div id="demoPagination">' + paginationHTML(1, PAGES) + "</div>", "span-2", "pagination") +
    "</div>"
  );
}

// ---- interação
function mountTabs() {
  var root = document.getElementById("demoTabs");
  if (!root) return;
  var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
  function select(i, focus) {
    tabs.forEach(function (t, j) {
      var on = i === j;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(i, false); });
    t.addEventListener("keydown", function (e) {
      var n = tabs.length, to = null;
      if (e.key === "ArrowRight") to = (i + 1) % n;
      else if (e.key === "ArrowLeft") to = (i - 1 + n) % n;
      else if (e.key === "Home") to = 0;
      else if (e.key === "End") to = n - 1;
      if (to === null) return;
      e.preventDefault();
      select(to, true);
    });
  });
}

function mountToastButtons() {
  document.querySelectorAll("[data-toast]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showToast(btn.getAttribute("data-toast"), T(btn.getAttribute("data-msg")));
    });
  });
}

function mountDemoPagination() {
  var box = document.getElementById("demoPagination");
  if (!box) return;
  var cur = 1;
  mountPagination(box, function () { return { cur: cur, total: PAGES }; }, function (n) {
    cur = n;
    box.innerHTML = paginationHTML(cur, PAGES);
  });
}

// Visão de código: o HTML vem do elemento na página; o CSS e o JavaScript, dos arquivos publicados.
var UI_JS = "assets/js/ui.js";
var CODE_VIEWS = {
  tabs: { nameKey: "comp.tabs", html: function () { return document.getElementById("demoTabs").outerHTML; },
          cssPattern: /\.tab(s|list|panel)?\b/, fns: ["mountTabs"], jsUrl: "assets/js/components.js" },
  accordion: { nameKey: "comp.accordion", html: function () { return document.querySelector(".accordion").outerHTML; },
               cssPattern: /\.acc(ordion|-)/, fns: ["accordionHTML", "mountAccordions"], jsUrl: UI_JS },
  toast: { nameKey: "comp.toast",
           html: function () {
             return toastHTML() + '<div class="toast-region" role="status" aria-live="polite"></div>' +
               '<div class="toast toast-ok">' + toastMarkup(T("comp.toastOkMsg")) + "</div>";
           },
           cssPattern: /\.toast/, fns: ["showToast", "toastMarkup"], jsUrl: UI_JS },
  tooltip: { nameKey: "comp.tooltip", html: function () { return document.querySelector(".tip-row").outerHTML.replace(/ is-dismissed/g, ""); },
             cssPattern: /\.tip\b|\.tip-/, fns: ["tip", "tipWrap", "mountTooltips"], jsUrl: UI_JS },
  pagination: { nameKey: "comp.pagination", html: function () { return document.getElementById("demoPagination").innerHTML; },
                cssPattern: /\.pagination|\.page-|\.pag-status/, fns: ["pageItems", "paginationHTML", "mountPagination"], jsUrl: UI_JS }
};

function mountCodeButtons() {
  document.querySelectorAll("[data-code]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var v = CODE_VIEWS[btn.getAttribute("data-code")];
      openCodeView({
        nameKey: v.nameKey, html: v.html(), cssPattern: v.cssPattern, fns: v.fns,
        cssUrl: "assets/styles.css", jsUrl: v.jsUrl, opener: btn
      });
    });
  });
}

function componentsMount() {
  mountCodeButtons();
  mountTabs();
  mountToastButtons();
  mountDemoPagination();
}

export { componentsHTML, componentsMount };
