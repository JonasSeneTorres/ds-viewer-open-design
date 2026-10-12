// Utilitários: escape de HTML, datas, cores e o elemento raiz.

import { lang } from "./i18n.js";


// Quadradinhos de cor: só cores únicas (o índice repete tons quando o DS tem poucas cores).
function chipsHTML(colors) {
  var seen = {};
  return colors.filter(function (c) {
    var k = String(c).trim().toLowerCase();
    if (!k || seen[k]) return false;
    seen[k] = true;
    return true;
  }).map(function (c) {
    return '<i class="ds-chip" style="background:' + esc(c) + '"></i>';
  }).join("");
}


function esc(value) {
  return String(value).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}


function formatDate(iso) {
  if (!iso) return "—";
  var parts = iso.split("-");
  if (parts.length !== 3) return esc(iso);
  return lang === "en-US"
    ? parts[1] + "/" + parts[2] + "/" + parts[0]
    : parts[2] + "/" + parts[1] + "/" + parts[0];
}


var app = document.getElementById("app");


// Minúsculas e sem acento, para a busca do seletor.
function fold(s) {
  return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}


// Tinta (#111 ou branco) com maior contraste WCAG sobre `hex` (mesma regra do ink_for do build).
function inkFor(hex) {
  function lum(x) {
    var h = x.replace("#", "");
    if (h.length === 3) h = h.replace(/(.)/g, "$1$1");
    var c = [0, 2, 4].map(function (k) {
      var v = parseInt(h.substr(k, 2), 16) / 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  var bg = lum(hex);
  return (bg + 0.05) / (lum("#111111") + 0.05) >= 1.05 / (bg + 0.05) ? "#111111" : "#ffffff";
}


function isColorValue(v) {
  return /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\(|oklch\()/i.test(v);
}

export { app, chipsHTML, esc, fold, formatDate, inkFor, isColorValue };
