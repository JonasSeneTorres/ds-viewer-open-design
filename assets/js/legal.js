// Licenças e privacidade.

import { T } from "./i18n.js";
import { page } from "./layout.js";
import { accordionHTML } from "./ui.js";
import { esc } from "./util.js";


// ------------------------------------------------------------------
// Páginas do rodapé: licenças e privacidade. Usam o mesmo contêiner das outras telas,
// então o tema selecionado vale para elas também.
// ------------------------------------------------------------------

var MIT_TEXT = [
  "MIT License",
  "",
  "Copyright (c) 2026 Jonas Sene Torres",
  "",
  "Permission is hereby granted, free of charge, to any person obtaining a copy",
  'of this software and associated documentation files (the "Software"), to deal',
  "in the Software without restriction, including without limitation the rights",
  "to use, copy, modify, merge, publish, distribute, sublicense, and/or sell",
  "copies of the Software, and to permit persons to whom the Software is",
  "furnished to do so, subject to the following conditions:",
  "",
  "The above copyright notice and this permission notice shall be included in all",
  "copies or substantial portions of the Software.",
  "",
  'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR',
  "IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,",
  "FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE",
  "AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER",
  "LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,",
  "OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE",
  "SOFTWARE."
].join("\n");


function extLink(href, text) {
  return '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(text) +
    '<svg class="ext-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>' +
    '<span class="sr-only"> ' + esc(T("home.newWindow")) + "</span></a>";
}


function legalHead(kicker, title, lede) {
  return (
    '<div class="page-head">' +
    '<span class="kicker">' + esc(kicker) + "</span>" +
    "<h1>" + esc(title) + "</h1>" +
    '<p class="lede">' + esc(lede) + "</p>" +
    "</div>"
  );
}


function licensesHTML() {
  return (
    legalHead(T("footer.lic"), T("lic.title"), T("lic.lede")) +
    '<div class="legal">' +
    "<section><h2>" + esc(T("lic.codeTitle")) + "</h2><p>" + esc(T("lic.codeText")) + "</p>" +
    accordionHTML([{ id: "mitAcc", title: T("lic.mitText"), body: "<pre>" + esc(MIT_TEXT) + "</pre>" }]) + "</section>" +
    "<section><h2>" + esc(T("lic.catTitle")) + "</h2><p>" + esc(T("lic.catText")) + "</p><p>" + esc(T("lic.catChanges")) + "</p>" +
    '<ul class="legal-links">' +
    "<li>" + extLink("https://open-design.ai/plugins/systems/", T("lic.linkDocs")) + "</li>" +
    "<li>" + extLink("https://github.com/nexu-io/open-design", T("lic.linkRepo")) + "</li>" +
    "<li>" + extLink("https://www.apache.org/licenses/LICENSE-2.0", T("lic.linkApache")) + "</li></ul></section>" +
    "<section><h2>" + esc(T("lic.fontsTitle")) + "</h2><p>" + esc(T("lic.fontsText")) + "</p><p>" + esc(T("lic.fontsProp")) + "</p>" +
    '<ul class="legal-links"><li>' + extLink("https://fonts.google.com/attribution", T("lic.fontsLink")) + "</li></ul></section>" +
    "<section><h2>" + esc(T("lic.brandsTitle")) + "</h2><p>" + esc(T("lic.brandsText")) + "</p></section>" +
    "<section><h2>" + esc(T("lic.uiTitle")) + "</h2><p>" + esc(T("lic.uiText")) + "</p><p>" + esc(T("lic.sample")) + "</p></section>" +
    "</div>"
  );
}


function privacyHTML() {
  return (
    legalHead(T("footer.priv"), T("pri.title"), T("pri.lede")) +
    '<div class="legal">' +
    "<section><h2>" + esc(T("pri.s1Title")) + "</h2><p>" + esc(T("pri.s1Text")) + "</p></section>" +
    "<section><h2>" + esc(T("pri.s2Title")) + "</h2><p>" + esc(T("pri.s2Text")) + "</p>" +
    "<ul><li>" + esc(T("pri.li1")) + "</li><li>" + esc(T("pri.li2")) + "</li><li>" + esc(T("pri.li3")) + "</li><li>" + esc(T("pri.li4")) + "</li></ul>" +
    "<p>" + esc(T("pri.s2Note")) + "</p>" +
    "<p>" + esc(T("pri.s2Session")) + "</p>" +
    "<p>" + esc(T("pri.s2Url")) + "</p></section>" +
    "<section><h2>" + esc(T("pri.s3Title")) + "</h2><p>" + esc(T("pri.s3Text")) + "</p></section>" +
    "<section><h2>" + esc(T("pri.s4Title")) + "</h2><p>" + esc(T("pri.s4Text")) + "</p></section>" +
    "<section><h2>" + esc(T("pri.s5Title")) + "</h2><p>" + esc(T("pri.s5Text")) + '</p><p class="muted">' + esc(T("pri.s5Note")) + "</p></section>" +
    "</div>"
  );
}

export { licensesHTML, privacyHTML };
