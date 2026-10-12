// Dashboard de exemplo em SVG.

import { L, T, lang } from "./i18n.js";
import { page } from "./layout.js";
import { esc } from "./util.js";


// ------------------------------------------------------------------
// Dashboard de exemplo, no estilo do painel do WordPress: widgets com gráficos em SVG.
// As cores vêm das variáveis do tema; os números são fictícios.
// ------------------------------------------------------------------

function chartSVG(w, h, label, inner) {
  return '<svg class="chart" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + esc(label) + '">' + inner + "</svg>";
}


function monthNames(n) {
  var out = [];
  for (var m = 0; m < n; m++) out.push(new Date(2026, m, 1).toLocaleDateString(lang, { month: "short" }));
  return out;
}


// Área com linha: visitas por dia.
function areaChartSVG(values, label) {
  var W = 560, H = 220, L = 40, R = 12, Tp = 12, B = 28;
  var max = Math.ceil(Math.max.apply(null, values) / 100) * 100;
  var n = values.length;
  function x(i) { return L + i * (W - L - R) / (n - 1); }
  function y(v) { return Tp + (H - Tp - B) * (1 - v / max); }
  var grid = "";
  for (var t = 0; t <= 4; t++) {
    var v = max * t / 4;
    grid += '<line class="ch-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '"/>' +
      '<text class="ch-axis" x="' + (L - 8) + '" y="' + (y(v) + 4).toFixed(1) + '" text-anchor="end">' + v + "</text>";
  }
  var pts = values.map(function (val, i) { return x(i).toFixed(1) + "," + y(val).toFixed(1); });
  var line = "M" + pts.join(" L");
  var area = line + " L" + x(n - 1).toFixed(1) + "," + y(0).toFixed(1) + " L" + x(0).toFixed(1) + "," + y(0).toFixed(1) + " Z";
  var labels = "", dots = "";
  values.forEach(function (val, i) {
    if (i % 2 === 0) labels += '<text class="ch-axis" x="' + x(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + (i + 1) + "</text>";
    dots += '<circle class="ch-dot ch-s1" cx="' + x(i).toFixed(1) + '" cy="' + y(val).toFixed(1) + '" r="3"/>';
  });
  return chartSVG(W, H, label, grid + '<path class="ch-area ch-s1" d="' + area + '"/><path class="ch-line ch-s1" d="' + line + '"/>' + dots + labels);
}


// Barras: posts por mês.
function barChartSVG(values, names, label) {
  var W = 360, H = 200, L = 28, R = 8, Tp = 12, B = 26;
  var max = Math.ceil(Math.max.apply(null, values) / 5) * 5;
  var n = values.length;
  var slot = (W - L - R) / n, bw = slot * 0.56;
  function y(v) { return Tp + (H - Tp - B) * (1 - v / max); }
  var out = "";
  for (var t = 0; t <= 3; t++) {
    var v = max * t / 3;
    out += '<line class="ch-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '"/>' +
      '<text class="ch-axis" x="' + (L - 6) + '" y="' + (y(v) + 4).toFixed(1) + '" text-anchor="end">' + Math.round(v) + "</text>";
  }
  values.forEach(function (val, i) {
    var bx = L + i * slot + (slot - bw) / 2;
    out += '<rect class="ch-bar ch-s2" x="' + bx.toFixed(1) + '" y="' + y(val).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (y(0) - y(val)).toFixed(1) + '" rx="3"/>' +
      '<text class="ch-axis" x="' + (bx + bw / 2).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(names[i]) + "</text>";
  });
  return chartSVG(W, H, label, out);
}


// Rosca: origem do tráfego (círculo de circunferência 100, para usar as partes como porcentagem).
function donutSVG(parts, label) {
  var acc = 0, out = '<circle class="ch-ring-bg" cx="21" cy="21" r="15.9155" fill="none"/>';
  parts.forEach(function (p, i) {
    out += '<circle class="ch-seg ch-s' + (i + 1) + '" cx="21" cy="21" r="15.9155" fill="none" stroke-dasharray="' + p.v + " " + (100 - p.v) +
      '" stroke-dashoffset="' + (25 - acc) + '"/>';
    acc += p.v;
  });
  return chartSVG(42, 42, label, out);
}


// Anel de progresso: saúde do site.
function gaugeSVG(pct, label) {
  return chartSVG(42, 42, label,
    '<circle class="ch-ring-bg" cx="21" cy="21" r="15.9155" fill="none"/>' +
    '<circle class="ch-seg ch-s3" cx="21" cy="21" r="15.9155" fill="none" stroke-dasharray="' + pct + " " + (100 - pct) + '" stroke-dashoffset="25"/>' +
    '<text class="ch-center" x="21" y="23.5" text-anchor="middle">' + pct + "%</text>");
}


function sparkSVG(values) {
  var W = 96, H = 32, max = Math.max.apply(null, values), min = Math.min.apply(null, values);
  var pts = values.map(function (v, i) {
    return (i * W / (values.length - 1)).toFixed(1) + "," + (H - 3 - (H - 6) * (v - min) / (max - min || 1)).toFixed(1);
  });
  return '<svg class="spark" viewBox="0 0 ' + W + " " + H + '" aria-hidden="true"><polyline class="ch-line ch-s1" points="' + pts.join(" ") + '"/></svg>';
}


function widget(title, body, cls) {
  return '<section class="widget' + (cls ? " " + cls : "") + '"><h2 class="widget-title">' + esc(title) + '</h2><div class="widget-body">' + body + "</div></section>";
}


function dashboardHTML() {
  var visits = [120, 180, 150, 220, 260, 240, 310, 280, 350, 330, 400, 380, 450, 430];
  var posts = [8, 12, 9, 15, 11, 18];
  var sources = [
    { key: "dash.direct", v: 38 }, { key: "dash.search", v: 31 }, { key: "dash.social", v: 19 }, { key: "dash.referral", v: 12 }
  ];
  var stats = [
    { key: "dash.visitors", value: "12.480", delta: "+12%", up: true, spark: [4, 6, 5, 8, 7, 10, 12] },
    { key: "dash.posts", value: "86", delta: "+4%", up: true, spark: [3, 3, 4, 4, 5, 5, 6] },
    { key: "dash.comments", value: "342", delta: "-3%", up: false, spark: [9, 8, 9, 7, 8, 6, 6] },
    { key: "dash.users", value: "1.205", delta: "+9%", up: true, spark: [2, 3, 3, 5, 6, 6, 8] }
  ];
  var activity = [
    ["Lorem ipsum dolor sit amet", "Jonas Torres", "2h"],
    ["Consectetur adipiscing elit", "Maria Lorem", "5h"],
    ["Sed do eiusmod tempor", "Ipsum Dolor", "1d"],
    ["Ut enim ad minim veniam", "Jonas Torres", "2d"],
    ["Duis aute irure dolor", "Sit Amet", "3d"]
  ];
  return (
    '<div class="page-head">' +
    '<span class="kicker">' + esc(T("dash.kicker")) + "</span>" +
    "<h1>" + esc(T("dash.h1")) + "</h1>" +
    '<p class="lede">' + esc(T("dash.lede")) + "</p>" +
    "</div>" +
    '<div class="dash-stats">' +
    stats.map(function (s) {
      return (
        '<div class="stat"><span class="stat-label">' + esc(T(s.key)) + "</span>" +
        '<span class="stat-value">' + s.value + "</span>" +
        '<span class="stat-delta ' + (s.up ? "is-up" : "is-down") + '">' + s.delta + "</span>" +
        sparkSVG(s.spark) + "</div>"
      );
    }).join("") +
    "</div>" +
    '<div class="dash-grid">' +
    widget(T("dash.visits"), areaChartSVG(visits, T("dash.visits")), "span-2") +
    widget(T("dash.sources"),
      '<div class="donut-wrap">' + donutSVG(sources.map(function (s) { return { v: s.v }; }), T("dash.sources")) +
      '<ul class="legend">' + sources.map(function (s, i) {
        return '<li><span class="swatch ch-sw' + (i + 1) + '" aria-hidden="true"></span>' + esc(T(s.key)) + "<strong>" + s.v + "%</strong></li>";
      }).join("") + "</ul></div>") +
    widget(T("dash.monthly"), barChartSVG(posts, monthNames(6), T("dash.monthly"))) +
    widget(T("dash.health"),
      '<div class="gauge-wrap">' + gaugeSVG(82, T("dash.health")) +
      '<p class="muted">' + esc(T("dash.healthText")) + "</p></div>") +
    widget(T("dash.activity"),
      '<ul class="activity">' + activity.map(function (a) {
        return "<li><span>" + esc(a[0]) + '</span><span class="muted">' + esc(a[1]) + " · " + esc(a[2]) + "</span></li>";
      }).join("") + "</ul>", "span-2") +
    widget(T("dash.draft"),
      '<form class="draft-form">' +
      '<label class="field"><span class="sr-only">' + esc(T("dash.draftTitle")) + '</span><input type="text" placeholder="' + esc(T("dash.draftTitle")) + '"></label>' +
      '<label class="field"><span class="sr-only">' + esc(T("dash.draftBody")) + '</span><textarea rows="3" placeholder="' + esc(T("dash.draftBody")) + '"></textarea></label>' +
      '<button type="button" data-submit class="btn btn-primary btn-small">' + esc(T("dash.draftSave")) + "</button></form>") +
    "</div>"
  );
}

export { dashboardHTML };
