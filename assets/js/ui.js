// Componentes de interface compartilhados: tooltip, toast, accordion e paginação.
// A página de componentes mostra estes mesmos; as demais páginas os usam no lugar de soluções avulsas
// (title nativo, <details>, mensagens soltas), para o site inteiro ter o mesmo visual e o mesmo teclado.

import { T } from "./i18n.js";
import { esc } from "./util.js";

// ---------------------------------------------------------------- tooltip
// Abre com o mouse ou com o foco do teclado; Esc dispensa sem tirar o foco (WCAG 1.4.13).
// opts.label: o botão já tem aria-label com o mesmo texto (ícone sozinho), então a dica é só visual.
// opts.below / opts.end: posição (abaixo do gatilho; alinhada ao fim, para itens na borda da tela).
function tip(id, text, opts) {
  opts = opts || {};
  return '<span role="tooltip" class="tip" id="' + esc(id) + '"' + (opts.label ? ' aria-hidden="true"' : "") + ">" + esc(text) + "</span>";
}

function tipWrap(inner, id, text, opts) {
  opts = opts || {};
  var cls = "tip-wrap" + (opts.below ? " tip-below" : "") + (opts.end ? " tip-end" : "") + (opts.block ? " tip-block" : "");
  return '<span class="' + cls + '">' + inner + tip(id, text, opts) + "</span>";
}

function setTipText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Esc dispensa todos os tooltips abertos; sair do gatilho (mouse ou foco) rearma o tooltip.
function mountTooltips() {
  function reset(e) {
    var w = e.target.closest && e.target.closest(".tip-wrap");
    if (w) w.classList.remove("is-dismissed");
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".tip-wrap").forEach(function (w) { w.classList.add("is-dismissed"); });
  });
  document.addEventListener("mouseout", reset);
  document.addEventListener("focusout", reset);
}
mountTooltips();

// ---------------------------------------------------------------- toast
// Região viva global (#toastRegion, em index.html): fica de pé ao trocar de página. Até 3 ao mesmo tempo.
function showToast(kind, message) {
  var region = document.getElementById("toastRegion");
  if (!region) return;
  var el = document.createElement("div");
  el.className = "toast toast-" + kind;
  el.innerHTML = toastMarkup(message);
  var timer = setTimeout(remove, 5000);
  function remove() {
    clearTimeout(timer);
    if (el.parentNode) el.parentNode.removeChild(el);
  }
  el.querySelector(".toast-close").addEventListener("click", remove);
  region.appendChild(el);
  while (region.children.length > 3) region.removeChild(region.firstChild);
}

// Conteúdo de um toast: o texto e o botão de fechar
function toastMarkup(message) {
  return "<span>" + esc(message) + '</span><button type="button" class="toast-close" aria-label="' + esc(T("close")) + '">&times;</button>';
}

// ---------------------------------------------------------------- accordion
// items: [{ id, title, body (HTML), open }]. O clique é tratado pelo documento, então vale para o que for
// inserido depois (como o aviso de contraste).
function accordionHTML(items) {
  return (
    '<div class="accordion">' +
    items.map(function (it) {
      return (
        '<div class="acc-item"><h3 class="acc-head"><button type="button" class="acc-btn" id="' + esc(it.id) + '" aria-expanded="' + !!it.open + '"' +
        ' aria-controls="' + esc(it.id) + 'Panel"><span>' + esc(it.title) + '</span><span class="acc-icon" aria-hidden="true"></span></button></h3>' +
        '<div class="acc-panel" id="' + esc(it.id) + 'Panel" role="region" aria-labelledby="' + esc(it.id) + '"' + (it.open ? "" : " hidden") + ">" +
        it.body + "</div></div>"
      );
    }).join("") +
    "</div>"
  );
}

function mountAccordions() {
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".acc-btn");
    if (!btn) return;
    var open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (panel) panel.hidden = open;
  });
}
mountAccordions();

// ---------------------------------------------------------------- paginação
// Janela de páginas com reticências: 1 2 … 5 [6] 7 … 11 12
function pageItems(cur, total) {
  var set = {};
  [1, 2, cur - 1, cur, cur + 1, total - 1, total].forEach(function (n) { if (n >= 1 && n <= total) set[n] = true; });
  var nums = Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
  var out = [];
  nums.forEach(function (n, i) {
    if (i && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

function paginationHTML(cur, total) {
  var items = pageItems(cur, total);
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
    '<li><button type="button" class="page-link" data-page="' + (cur + 1) + '"' + (cur === total ? " disabled" : "") + ">" + esc(T("comp.next")) + "</button></li>" +
    "</ul></nav>" +
    '<p class="muted pag-status" role="status">' + esc(T("comp.pagStatus")).replace("{n}", cur).replace("{total}", total) + "</p>"
  );
}

// Liga os cliques de `box` à troca de página. get() devolve { cur, total }; change(n) aplica a nova página.
function mountPagination(box, get, change) {
  box.addEventListener("click", function (e) {
    var b = e.target.closest("[data-page]");
    if (!b || b.disabled) return;
    var n = Number(b.getAttribute("data-page"));
    var s = get();
    if (n < 1 || n > s.total || n === s.cur) return;
    change(n);
    // o HTML foi redesenhado: devolve o foco ao botão que o visitante usou
    var again = box.querySelector('[data-page="' + n + '"]:not([disabled])') || box.querySelector(".is-current");
    if (again) again.focus();
  });
}

export { accordionHTML, mountPagination, pageItems, paginationHTML, setTipText, showToast, tip, tipWrap, toastMarkup };
