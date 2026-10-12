// Peças de página compartilhadas: migalhas, moldura e 404.

import { THEMES } from "./data.js";
import { dsIndex } from "./ds.js";
import { L, T } from "./i18n.js";
import { esc } from "./util.js";


// Título da aba por rota (o nome do site vem depois) e foco no conteúdo ao navegar,
// para leitores de tela e teclado perceberem a troca de página.
function setTitle(part) {
  var site = T("brand");
  document.title = part ? part + " · " + site : site;
}

// crumbs: [[label, href], ...] — o último item é a página atual (sem link).
function breadcrumbs(crumbs) {
  var items = [[T("nav.home"), "#/"]].concat(crumbs);
  return (
    '<nav class="breadcrumbs" aria-label="' + esc(T("crumbs.label")) + '">' +
    "<ol>" +
    items.map(function (c, i) {
      var last = i === items.length - 1;
      return last
        ? '<li aria-current="page">' + esc(c[0]) + "</li>"
        : '<li><a href="' + c[1] + '">' + esc(c[0]) + "</a></li>";
    }).join("") +
    "</ol>" +
    "</nav>"
  );
}


function page(html, crumbs) {
  return '<div class="wrap page">' + breadcrumbs(crumbs) + html + "</div>";
}


function dsName(id) {
  var i = dsIndex(id);
  return i !== -1 ? L(THEMES[i].label) : T("nf.title");
}


function notFoundHTML() {
  return (
    '<div class="empty">' +
    "<strong>" + esc(T("nf.title")) + "</strong>" +
    "<p>" + esc(T("nf.text")) + "</p>" +
    '<p><a class="btn btn-primary" href="#/">' + esc(T("nf.back")) + "</a></p>" +
    "</div>"
  );
}

export { dsName, notFoundHTML, page, setTitle };
