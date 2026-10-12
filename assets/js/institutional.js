// Página institucional de exemplo.

import { T } from "./i18n.js";
import { noImageSVG } from "./shop.js";
import { esc } from "./util.js";


// ------------------------------------------------------------------
// Página institucional de exemplo: hero, sobre, valores, serviços, opiniões, chamada e contato.
// O conteúdo é fictício; quem dá o estilo é o design system. As faixas alternam o fundo do tema
// (--surface-2, --bg, --accent-weak e --solid) e as imagens usam o degradê com o ícone de imagem não encontrada.
// ------------------------------------------------------------------

function iconSVG(name) {
  var paths = {
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.600-7 10-7 10z"/>',
    shield: '<path d="M12 3l7 3v5c0 4.500-3 8-7 10-4-2-7-5.500-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    bulb: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.500 10.900c.6.500 1 1.200 1 2.100h5c0-.9.400-1.600 1-2.100A6 6 0 0 0 12 3z"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.300 2.700-5.500 6-5.500s6 2.200 6 5.500"/><path d="M16 5.500a3 3 0 0 1 0 5"/><path d="M18 14.600c1.800.7 3 2.400 3 5.400"/>',
    chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-5"/><path d="M13 16V8"/><path d="M18 16v-8"/>',
    code: '<path d="M8 7l-5 5 5 5"/><path d="M16 7l5 5-5 5"/><path d="M14 4l-4 16"/>',
    pen: '<path d="M4 20l1-4L16.500 4.500a2.100 2.100 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/>',
    phone: '<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    pin: '<path d="M12 21s-7-6.200-7-11a7 7 0 0 1 14 0c0 4.800-7 11-7 11z"/><circle cx="12" cy="10" r="2.500"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
    quote: '<path d="M7 17c-2 0-3-1.500-3-3.500C4 10 6 7.500 9 7v2c-1.500.4-2 1.500-2 2.500H9V17H7z"/><path d="M16 17c-2 0-3-1.500-3-3.500 0-3.500 2-6 5-6.500v2c-1.500.4-2 1.500-2 2.500H18V17h-2z"/>'
  };
  return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (paths[name] || "") + "</svg>";
}


// Imagem de exemplo: o mesmo degradê com o ícone de imagem não encontrada da loja.
function placeholderHTML(i, cls) {
  var angle = 110 + (i * 37) % 80;
  var a = 20 + (i * 13) % 28;
  var b = 8 + (i * 7) % 18;
  var grad = "linear-gradient(" + angle + "deg, color-mix(in oklab, var(--grad-1, var(--accent)) " + a + "%, var(--surface)), color-mix(in oklab, var(--grad-2, var(--accent-strong)) " + b + "%, var(--surface-2)))";
  return '<div class="ph ' + (cls || "") + '" style="background:' + grad + '" role="img" aria-label="' + esc(T("inst.imageAlt")) + '">' + noImageSVG() + "</div>";
}


function bandHead(kicker, title, text) {
  return (
    '<div class="band-head">' +
    '<span class="kicker">' + esc(kicker) + "</span>" +
    "<h2>" + esc(title) + "</h2>" +
    (text ? '<p class="lede">' + esc(text) + "</p>" : "") +
    "</div>"
  );
}


function institutionalHTML() {
  var lorem = T("inst.lorem");
  var values = [["heart", "inst.v1"], ["shield", "inst.v2"], ["bulb", "inst.v3"], ["users", "inst.v4"]];
  var services = [["chart", "inst.s1"], ["code", "inst.s2"], ["pen", "inst.s3"], ["users", "inst.s4"], ["shield", "inst.s5"], ["bulb", "inst.s6"]];
  var people = [
    ["Maria Lorem", "Diretora · Empresa Ipsum", "ML"],
    ["João Dolor", "Fundador · Studio Amet", "JD"],
    ["Ana Consectetur", "Gerente · Grupo Elit", "AC"]
  ];
  var stats = [["15+", "inst.st1"], ["240", "inst.st2"], ["98%", "inst.st3"]];
  return (
    // hero
    '<section class="band band-b band-hero"><div class="wrap split">' +
    '<div class="split-text">' +
    '<span class="kicker">' + esc(T("inst.kicker")) + "</span>" +
    "<h1>" + esc(T("inst.h1")) + "</h1>" +
    '<p class="lede">' + esc(lorem) + "</p>" +
    '<div class="hero-actions"><a class="btn btn-primary" href="#/institucional">' + esc(T("inst.cta1")) + '</a><a class="btn btn-ghost" href="#/institucional">' + esc(T("inst.cta2")) + "</a></div>" +
    "</div>" + placeholderHTML(1, "ph-wide") + "</div></section>" +
    // sobre
    '<section class="band band-a" id="sobre"><div class="wrap split split-rev">' +
    placeholderHTML(4, "ph-wide") +
    '<div class="split-text">' + bandHead(T("inst.about"), T("inst.aboutTitle"), "") +
    "<p>" + esc(lorem) + "</p>" +
    '<ul class="checks">' + ["inst.c1", "inst.c2", "inst.c3"].map(function (k) {
      return '<li><span class="check-icon">' + iconSVG("check") + "</span>" + esc(T(k)) + "</li>";
    }).join("") + "</ul>" +
    '<dl class="stats-row">' + stats.map(function (s) {
      return "<div><dt>" + s[0] + "</dt><dd>" + esc(T(s[1])) + "</dd></div>";
    }).join("") + "</dl>" +
    "</div></div></section>" +
    // valores
    '<section class="band band-b" id="valores"><div class="wrap">' +
    bandHead(T("inst.valuesKicker"), T("inst.valuesTitle"), lorem) +
    '<div class="card-grid">' + values.map(function (v) {
      return '<article class="info-card"><span class="icon-bubble">' + iconSVG(v[0]) + "</span><h3>" + esc(T(v[1])) + "</h3><p>" + esc(lorem) + "</p></article>";
    }).join("") + "</div></div></section>" +
    // serviços
    '<section class="band band-a" id="servicos"><div class="wrap">' +
    bandHead(T("inst.servicesKicker"), T("inst.servicesTitle"), lorem) +
    '<div class="card-grid card-grid-3">' + services.map(function (v, i) {
      return '<article class="info-card service">' + placeholderHTML(i + 7, "ph-card") +
        '<span class="icon-bubble">' + iconSVG(v[0]) + "</span><h3>" + esc(T(v[1])) + "</h3><p>" + esc(lorem) + '</p><a class="dead-link more">' + esc(T("inst.more")) + " &rarr;</a></article>";
    }).join("") + "</div></div></section>" +
    // opiniões
    '<section class="band band-c" id="opinioes"><div class="wrap">' +
    bandHead(T("inst.testimonialsKicker"), T("inst.testimonialsTitle"), "") +
    '<div class="card-grid card-grid-3">' + people.map(function (p, i) {
      return '<figure class="info-card quote"><span class="quote-mark">' + iconSVG("quote") + "</span>" +
        "<blockquote>" + esc(lorem) + "</blockquote>" +
        '<figcaption><span class="avatar" style="' + "background:linear-gradient(135deg, color-mix(in oklab, var(--grad-1, var(--accent)) " + (30 + i * 12) + "%, var(--surface)), color-mix(in oklab, var(--grad-2, var(--accent-strong)) 18%, var(--surface-2)))" + '" aria-hidden="true">' + p[2] + "</span>" +
        "<span><strong>" + esc(p[0]) + "</strong><br><span class=\"muted\">" + esc(p[1]) + "</span></span></figcaption></figure>";
    }).join("") + "</div></div></section>" +
    // chamada
    '<section class="band band-solid" id="chamada"><div class="wrap cta">' +
    "<div><h2>" + esc(T("inst.ctaTitle")) + "</h2><p>" + esc(lorem) + "</p></div>" +
    '<a class="btn btn-invert" href="#/institucional">' + esc(T("inst.cta1")) + "</a>" +
    "</div></section>" +
    // contato
    '<section class="band band-b" id="contato"><div class="wrap contact-grid">' +
    '<div>' + bandHead(T("inst.contactKicker"), T("inst.contactTitle"), lorem) +
    '<ul class="contact-list">' +
    '<li>' + iconSVG("pin") + "<span>" + esc(T("inst.address")) + "</span></li>" +
    '<li>' + iconSVG("phone") + "<span>+55 (11) 0000-0000</span></li>" +
    '<li>' + iconSVG("mail") + "<span>contato@exemplo.com</span></li>" +
    '<li>' + iconSVG("clock") + "<span>" + esc(T("inst.hours")) + "</span></li>" +
    "</ul>" + placeholderHTML(11, "ph-map") + "</div>" +
    '<form class="info-card contact-form" novalidate>' +
    '<div class="form-alert success" role="status">' + esc(T("inst.sent")) + "</div>" +
    '<label class="field"><span>' + esc(T("inst.fName")) + '</span><input type="text" name="nome" autocomplete="off"></label>' +
    '<label class="field"><span>' + esc(T("inst.fEmail")) + '</span><input type="email" name="email" autocomplete="off"></label>' +
    '<label class="field"><span>' + esc(T("inst.fSubject")) + '</span><select name="assunto"><option>' + esc(T("inst.o1")) + "</option><option>" + esc(T("inst.o2")) + "</option><option>" + esc(T("inst.o3")) + "</option></select></label>" +
    '<label class="field"><span>' + esc(T("inst.fMessage")) + '</span><textarea name="mensagem" rows="4"></textarea></label>' +
    '<button type="button" data-submit class="btn btn-primary">' + esc(T("inst.send")) + "</button>" +
    "</form></div></section>"
  );
}

export { iconSVG, institutionalHTML };
