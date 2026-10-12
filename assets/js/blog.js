// Blog e artigos de exemplo.

import { ARTICLES } from "./content.js";
import { T } from "./i18n.js";
import { notFoundHTML, page } from "./layout.js";
import { esc, formatDate } from "./util.js";


// Blog: o destaque e a grade de artigos.
function blogHTML() {
  var featured = ARTICLES[0];
  var rest = ARTICLES.slice(1);
  return (
    '<div class="page-head">' +
    '<span class="kicker">' + esc(T("blog.kicker")) + "</span>" +
    "<h1>" + esc(T("blog.h1")) + "</h1>" +
    "</div>" +
    '<div class="blog-layout"><div class="blog-main">' +
    '<a class="featured" href="#/artigo/' + featured.id + '">' +
    '<div class="featured-visual" aria-hidden="true"><span>' + esc(featured.id.split("-")[0].charAt(0).toUpperCase()) + "</span></div>" +
    '<div class="featured-body">' +
    '<span class="kicker">' + esc(T("home.featured")) + " · " + esc(featured.tag) + "</span>" +
    "<h2>" + esc(featured.title) + "</h2>" +
    "<p>" + esc(featured.excerpt) + "</p>" +
    '<span class="article-meta"><span>' + esc(featured.author) + "</span><span>" + formatDate(featured.date) + "</span><span>" + esc(featured.read) + " " + esc(T("art.read")) + "</span></span>" +
    "</div>" +
    "</a>" +
    '<div class="section-head"><h2>' + esc(T("home.articles")) + '</h2><span class="muted">' + ARTICLES.length + " " + esc(T("home.count")) + "</span></div>" +
    '<div class="article-grid">' +
    rest.map(function (a) {
      return (
        '<a class="article-card" href="#/artigo/' + a.id + '">' +
        '<span class="kicker">' + esc(a.tag) + "</span>" +
        "<h3>" + esc(a.title) + "</h3>" +
        "<p>" + esc(a.excerpt) + "</p>" +
        '<span class="article-meta"><span>' + esc(a.author) + "</span><span>" + esc(a.read) + "</span></span>" +
        "</a>"
      );
    }).join("") +
    "</div>" +
    "</div>" +
    blogAsideHTML() +
    "</div>"
  );
}


// Barra lateral de blog genérico: busca, tópicos, últimos artigos, redes sociais, newsletter e nuvem de tags.
// É só ilustrativa: a busca e o envio não fazem nada e os links não têm destino.
function socialIconSVG(kind) {
  var paths = {
    rss: '<circle cx="6" cy="18" r="2"/><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/>',
    video: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>',
    photo: '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.5"/><circle cx="17" cy="7" r="0.6"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    people: '<circle cx="9" cy="9" r="3"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 6a3 3 0 0 1 0 6"/><path d="M18 14c2 .6 3 2.2 3 5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'
  };
  return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + paths[kind] + "</svg>";
}


function blogAsideHTML() {
  var topics = ["Lorem", "Ipsum", "Dolor", "Sit amet", "Consectetur", "Adipiscing"];
  var tags = [
    ["lorem", 5], ["ipsum", 3], ["dolor", 4], ["amet", 1], ["elit", 2], ["tempor", 1], ["magna", 3], ["aliqua", 2],
    ["veniam", 1], ["nostrud", 4], ["laboris", 2], ["aute", 1], ["irure", 3], ["cupidatat", 1], ["deserunt", 2], ["mollit", 1]
  ];
  var social = [["people", "Facebook"], ["video", "YouTube"], ["photo", "Instagram"], ["chat", "X"], ["people", "LinkedIn"], ["rss", "RSS"]];
  function block(title, body, cls) {
    return '<section class="aside-block' + (cls ? " " + cls : "") + '"><h2 class="aside-title">' + esc(title) + "</h2>" + body + "</section>";
  }
  return (
    '<aside class="blog-aside" aria-label="' + esc(T("aside.label")) + '">' +
    '<form class="aside-search" role="search">' +
    '<label class="sr-only" for="asideSearch">' + esc(T("aside.search")) + "</label>" +
    '<input type="search" id="asideSearch" placeholder="' + esc(T("aside.searchPh")) + '">' +
    '<button type="button" data-submit class="btn btn-primary btn-small">' + esc(T("aside.search")) + "</button>" +
    "</form>" +
    block(T("aside.topics"), "<ul>" + topics.map(function (c, i) {
      return '<li><a class="dead-link">' + esc(c) + '</a><span class="aside-count">' + (14 - i * 2) + "</span></li>";
    }).join("") + "</ul>") +
    block(T("aside.latest"), '<ul class="aside-latest">' + ARTICLES.slice(0, 4).map(function (a) {
      return '<li><a class="dead-link">' + esc(a.title) + '</a><span class="aside-date">' + formatDate(a.date) + "</span></li>";
    }).join("") + "</ul>") +
    block(T("aside.follow"), '<div class="social-grid">' + social.map(function (s) {
      return '<a class="social-btn">' + socialIconSVG(s[0]) + "<span>" + esc(s[1]) + "</span></a>";
    }).join("") + "</div>") +
    block(T("aside.newsletter"),
      "<p>" + esc(T("aside.nlText")) + "</p>" +
      '<form class="newsletter-form">' +
      '<label class="sr-only" for="asideEmail">' + esc(T("aside.nlPh")) + "</label>" +
      '<input type="email" id="asideEmail" placeholder="' + esc(T("aside.nlPh")) + '">' +
      '<button type="button" data-submit class="btn btn-primary btn-small">' + esc(T("aside.nlBtn")) + "</button>" +
      "</form>", "aside-newsletter") +
    block(T("aside.tags"), '<p class="tag-cloud">' + tags.map(function (t) {
      return '<a class="dead-link tag tag-' + t[1] + '">' + esc(t[0]) + "</a>";
    }).join(" ") + "</p>") +
    "</aside>"
  );
}


function articleTitle(id) {
  for (var i = 0; i < ARTICLES.length; i++) if (ARTICLES[i].id === id) return ARTICLES[i].title;
  return T("art.article");
}


function articleHTML(id) {
  var i = ARTICLES.map(function (a) { return a.id; }).indexOf(id);
  if (i === -1) return notFoundHTML();
  var a = ARTICLES[i];
  var prev = ARTICLES[i - 1];
  var next = ARTICLES[i + 1];
  var aside = blogAsideHTML();
  return (
    '<div class="article-layout">' +
    '<div class="article-body">' +
    '<span class="kicker">' + esc(a.tag) + "</span>" +
    "<h1>" + esc(a.title) + "</h1>" +
    '<span class="article-meta"><span>' + esc(a.author) + "</span><span>" + formatDate(a.date) + "</span><span>" + esc(a.read) + " " + esc(T("art.read")) + "</span></span>" +
    '<div style="margin-top:28px">' + a.body + "</div>" +
    '<div class="article-foot">' +
    (prev ? '<a class="btn btn-ghost" href="#/artigo/' + prev.id + '">&larr; ' + esc(prev.title) + "</a>" : "<span></span>") +
    (next ? '<a class="btn btn-ghost" href="#/artigo/' + next.id + '">' + esc(next.title) + " &rarr;</a>" : "<span></span>") +
    "</div>" +
    "</div>" +
    aside +
    "</div>"
  );
}

export { articleHTML, articleTitle, blogHTML };
