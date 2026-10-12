// Início: hero e catálogo.

import { renderDSList } from "./ds.js";
import { T } from "./i18n.js";
import { esc } from "./util.js";


// Link externo: abre em outra janela e avisa isso a leitores de tela.
function extLinkHTML(href, text) {
  return (
    '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(text) +
    '<svg class="ext-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>' +
    '<span class="sr-only"> ' + esc(T("home.newWindow")) + "</span></a>"
  );
}

// Início: o hero (a proposta do projeto em quatro parágrafos curtos) e, logo abaixo, o catálogo de design systems.
function homeHTML() {
  const openDesign = extLinkHTML("https://open-design.ai/plugins/systems/", T("home.noteLink"));
  const zen = extLinkHTML("https://csszengarden.com/", T("home.zenLink"));
  const maujor = extLinkHTML("https://maujor.com/", T("home.maujorLink"));
  return (
    '<section class="hero"><div class="wrap hero-inner">' +
    '<span class="kicker">' + esc(T("home.kicker")) + "</span>" +
    "<h1>" + esc(T("home.h1")) + "</h1>" +
    '<p class="lede">' + esc(T("home.lede")).replace("{link}", openDesign) + "</p>" +
    '<p class="lede">' + esc(T("home.note")).replace("{maujor}", maujor).replace("{zen}", zen) + "</p>" +
    '<p class="lede">' + esc(T("home.how")) + "</p>" +
    '<p class="lede">' + esc(T("home.more")) + "</p>" +
    "</div></section>" +
    '<div class="wrap page">' + renderDSList(true) + "</div>"
  );
}

export { homeHTML };
