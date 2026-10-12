// Componentes de interface de exemplo: abas, accordion, toast, tooltip e paginação.
// Tudo com teclado e leitor de tela (padrões WAI-ARIA); as cores vêm das variáveis do tema.

import { T } from "./i18n.js";
import { esc } from "./util.js";

var TAB_KEYS = ["comp.tab1", "comp.tab2", "comp.tab3"];
var ACC_KEYS = ["comp.acc1", "comp.acc2", "comp.acc3"];
var LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
var PAGES = 12;

function block(title, body, cls) {
  return (
    '<section class="widget' + (cls ? " " + cls : "") + '"><h2 class="widget-title">' + esc(title) + "</h2>" +
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

function accordionHTML() {
  return (
    '<div class="accordion">' +
    ACC_KEYS.map(function (k, i) {
      return (
        '<div class="acc-item"><h3 class="acc-head"><button type="button" class="acc-btn" id="acc' + i + '" aria-expanded="' + (i === 0) + '"' +
        ' aria-controls="accpanel' + i + '"><span>' + esc(T(k)) + '</span><span class="acc-icon" aria-hidden="true"></span></button></h3>' +
        '<div class="acc-panel" id="accpanel' + i + '" role="region" aria-labelledby="acc' + i + '"' + (i === 0 ? "" : " hidden") + ">" +
        "<p>" + esc(LOREM) + "</p></div></div>"
      );
    }).join("") +
    "</div>"
  );
}

function toastHTML() {
  return (
    '<div class="btn-row">' +
    [["ok", "comp.toastOk", "btn-success"], ["warn", "comp.toastWarn", "btn-ghost"], ["danger", "comp.toastErr", "btn-danger"]].map(function (t) {
      return '<button type="button" class="btn ' + t[2] + '" data-toast="' + t[0] + '">' + esc(T(t[1])) + "</button>";
    }).join("") +
    "</div>"
  );
}

function tooltipHTML() {
  return (
    '<div class="tip-row">' +
    '<span class="tip-wrap"><button type="button" class="btn btn-ghost" aria-describedby="tip1">' + esc(T("comp.tipBtn")) + "</button>" +
    '<span role="tooltip" class="tip" id="tip1">' + esc(T("comp.tipText")) + "</span></span>" +
    '<span class="tip-wrap"><a href="#/componentes" aria-describedby="tip2">' + esc(T("comp.tipLink")) + "</a>" +
    '<span role="tooltip" class="tip" id="tip2">' + esc(T("comp.tipText2")) + "</span></span>" +
    "</div>"
  );
}

// Janela de páginas com reticências: 1 … 4 5 [6] 7 8 … 12
function pageItems(cur) {
  var set = {};
  [1, 2, cur - 1, cur, cur + 1, PAGES - 1, PAGES].forEach(function (n) { if (n >= 1 && n <= PAGES) set[n] = true; });
  var nums = Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
  var out = [];
  nums.forEach(function (n, i) {
    if (i && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

function paginationHTML(cur) {
  var items = pageItems(cur);
  return (
    '<nav class="pagination" aria-label="' + esc(T("comp.pagLabel")) + '"><ul>' +
    '<li><button type="button" class="page-link" data-page="' + (cur - 1) + '"' + (cur === 1 ? " disabled" : "") + ">" + esc(T("comp.prev")) + "</button></li>" +
    items.map(function (n) {
      if (n === "…") return '<li><span class="page-gap" aria-hidden="true">…</span></li>';
      return (
        '<li><button type="button" class="page-link' + (n === cur ? " is-current" : "") + '" data-page="' + n + '"' +
        (n === cur ? ' aria-current="page"' : "") + ' aria-label="' + esc(T("comp.pageN")).replace("{n}", n) + '">' + n + "</button></li>"
      );
    }).join("") +
    '<li><button type="button" class="page-link" data-page="' + (cur + 1) + '"' + (cur === PAGES ? " disabled" : "") + ">" + esc(T("comp.next")) + "</button></li>" +
    "</ul></nav>" +
    '<p class="muted pag-status" role="status">' + esc(T("comp.pagStatus")).replace("{n}", cur).replace("{total}", PAGES) + "</p>"
  );
}

function componentsHTML() {
  return (
    '<div class="page-head">' +
    '<span class="kicker">' + esc(T("comp.kicker")) + "</span>" +
    "<h1>" + esc(T("comp.h1")) + "</h1>" +
    '<p class="lede">' + esc(T("comp.lede")) + "</p>" +
    "</div>" +
    '<div class="dash-grid">' +
    block(T("comp.tabs"), tabsHTML()) +
    block(T("comp.accordion"), accordionHTML()) +
    block(T("comp.toast"), toastHTML()) +
    block(T("comp.tooltip"), tooltipHTML()) +
    block(T("comp.pagination"), '<div id="demoPagination">' + paginationHTML(1) + "</div>", "span-2") +
    "</div>" +
    '<div class="toast-region" id="toastRegion" role="status" aria-live="polite" aria-atomic="false"></div>'
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

function mountAccordion() {
  document.querySelectorAll(".acc-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (panel) panel.hidden = open;
    });
  });
}

function mountToasts() {
  var region = document.getElementById("toastRegion");
  if (!region) return;
  var LABEL = { ok: "comp.toastOkMsg", warn: "comp.toastWarnMsg", danger: "comp.toastErrMsg" };
  document.querySelectorAll("[data-toast]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var kind = btn.getAttribute("data-toast");
      var el = document.createElement("div");
      el.className = "toast toast-" + kind;
      el.innerHTML = "<span>" + esc(T(LABEL[kind])) + '</span><button type="button" class="toast-close" aria-label="' + esc(T("close")) + '">&times;</button>';
      var timer = setTimeout(remove, 5000);
      function remove() { clearTimeout(timer); if (el.parentNode) el.parentNode.removeChild(el); }
      el.querySelector(".toast-close").addEventListener("click", remove);
      region.appendChild(el);
      while (region.children.length > 3) region.removeChild(region.firstChild);
    });
  });
}

function mountTooltips() {
  // Esc dispensa o tooltip aberto sem tirar o foco (WCAG 1.4.13)
  document.addEventListener("keydown", function onKey(e) {
    if (!document.querySelector(".tip-row")) { document.removeEventListener("keydown", onKey); return; }
    if (e.key !== "Escape") return;
    document.querySelectorAll(".tip-wrap").forEach(function (w) { w.classList.add("is-dismissed"); });
  });
  document.querySelectorAll(".tip-wrap").forEach(function (w) {
    function reset() { w.classList.remove("is-dismissed"); }
    w.addEventListener("mouseleave", reset);
    w.addEventListener("focusout", reset);
  });
}

function mountPagination() {
  var box = document.getElementById("demoPagination");
  if (!box) return;
  var cur = 1;
  box.addEventListener("click", function (e) {
    var b = e.target.closest("[data-page]");
    if (!b || b.disabled) return;
    var n = Number(b.getAttribute("data-page"));
    if (n < 1 || n > PAGES) return;
    var hadFocus = b.hasAttribute("aria-current") ? null : b.getAttribute("data-page");
    cur = n;
    box.innerHTML = paginationHTML(cur);
    // devolve o foco ao botão que o visitante usou (a lista foi redesenhada)
    var again = box.querySelector('[data-page="' + hadFocus + '"]:not([disabled])') || box.querySelector(".is-current");
    if (again) again.focus();
  });
}

function componentsMount() {
  mountTabs();
  mountAccordion();
  mountToasts();
  mountTooltips();
  mountPagination();
}

export { componentsHTML, componentsMount };
