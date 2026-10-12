// Ponto de entrada: menu, roteador, idioma e inicialização.

import { authFromSlug, authHTML, authMount, authState, authTitle, setAuthState } from "./js/auth.js";
import { articleHTML, articleTitle, blogHTML } from "./js/blog.js";
import { buildCombobox, comboBtn, comboList, fillComboList } from "./js/combobox.js";
import { componentsHTML, componentsMount } from "./js/components.js";
import { dashboardHTML } from "./js/dashboard.js";
import { THEMES, loadData, loadDsDetail } from "./js/data.js";
import { initDSDetail, initDSList, renderDSDetail } from "./js/ds.js";
import { formPageHTML, initDemoForm } from "./js/form.js";
import { homeHTML } from "./js/home.js";
import { LANG_KEY, T, lang, setLang } from "./js/i18n.js";
import { institutionalHTML } from "./js/institutional.js";
import { dsName, notFoundHTML, page, setTitle } from "./js/layout.js";
import { licensesHTML, privacyHTML } from "./js/legal.js";
import { SHOP_CATS, shopCatName, shopHTML, shopMount } from "./js/shop.js";
import { loadTimer, resetTableState, tableMount, tablePageHTML } from "./js/table.js";
import { applyTheme, currentTheme, getStoredTheme, setTheme, syncPicker, themeFromURL } from "./js/theme.js";
import { setTipText } from "./js/ui.js";
import { app, esc } from "./js/util.js";
import "./js/behaviors.js"; // só efeitos: cliques e Enter dos formulários de exemplo


// ---- menu do cabeçalho em telas de tablet em pé ou menores: o hambúrguer abre o painel com a navegação,
// o seletor de temas e o idioma; a marca e o botão claro/escuro ficam sempre visíveis
var navToggle = document.getElementById("navToggle");
var siteMenu = document.getElementById("siteMenu");
var NAV_BREAKPOINT = window.matchMedia ? window.matchMedia("(min-width: 769px)") : null;

function navIsOpen() {
  return !!siteMenu && siteMenu.getAttribute("data-open") === "true";
}

function updateNavLabel() {
  if (!navToggle) return;
  var label = T(navIsOpen() ? "nav.menuClose" : "nav.menuOpen");
  navToggle.setAttribute("aria-label", label);
  setTipText("navToggleTip", label);
}

function setNav(open, restoreFocus) {
  if (!siteMenu || !navToggle) return;
  siteMenu.setAttribute("data-open", String(open));
  navToggle.setAttribute("aria-expanded", String(open));
  updateNavLabel();
  if (!open && restoreFocus) navToggle.focus();
}

if (navToggle && siteMenu) {
  navToggle.addEventListener("click", function () { setNav(!navIsOpen(), false); });
  // Esc fecha o painel; se o submenu Exemplos estiver aberto, o Esc é dele (fase de captura: roda antes)
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || !navIsOpen()) return;
    var ex = document.getElementById("examplesMenu");
    if (ex && !ex.hidden) return;
    setNav(false, true);
  }, true);
  document.addEventListener("click", function (e) {
    if (navIsOpen() && !e.target.closest(".site-header")) setNav(false, false);
  });
  // ao escolher uma página, o painel fecha
  siteMenu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setNav(false, false);
  });
  if (NAV_BREAKPOINT) {
    var onWide = function (e) { if (e.matches) setNav(false, false); };
    if (NAV_BREAKPOINT.addEventListener) NAV_BREAKPOINT.addEventListener("change", onWide);
  }
  updateNavLabel();
}

// ---- menu "Exemplos" do cabeçalho
var examplesBtn = document.getElementById("examplesBtn");

var examplesMenu = document.getElementById("examplesMenu");

var EXAMPLE_ROUTES = ["/entrar", "/institucional", "/blog", "/tabela", "/formulario", "/componentes", "/dashboard", "/loja"];


function openExamples() {
  examplesMenu.hidden = false;
  examplesBtn.setAttribute("aria-expanded", "true");
}


function closeExamples(restoreFocus) {
  if (!examplesMenu || examplesMenu.hidden) return;
  examplesMenu.hidden = true;
  examplesBtn.setAttribute("aria-expanded", "false");
  if (restoreFocus) examplesBtn.focus();
}


if (examplesBtn && examplesMenu) {
  // Esc fecha o menu de qualquer lugar: no Safari clicar num botão não o foca, e o teclado ficaria no <body>.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !examplesMenu.hidden) closeExamples(true);
  });
  examplesBtn.addEventListener("click", function () {
    if (examplesMenu.hidden) openExamples(); else closeExamples(false);
  });
  examplesBtn.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      openExamples();
      var first = examplesMenu.querySelector("a");
      if (first) first.focus();
    } else if (e.key === "Escape") {
      closeExamples(false);
    }
  });
  examplesMenu.addEventListener("keydown", function (e) {
    var links = Array.prototype.slice.call(examplesMenu.querySelectorAll("a"));
    var i = links.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); links[(i + 1) % links.length].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
    else if (e.key === "Escape") { e.preventDefault(); closeExamples(true); }
    else if (e.key === "Tab") { closeExamples(false); }
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-menu")) closeExamples(false);
  });
}


function setActiveNav(route) {
  function mark(link, on) {
    if (on) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  document.querySelectorAll(".main-nav > a").forEach(function (link) {
    var href = link.getAttribute("href").replace("#", "");
    mark(link, link.id === "navTheme" ? route.indexOf("/design-system") === 0 : href === route);
  });
  var inExamples = false;
  document.querySelectorAll("#examplesMenu a").forEach(function (link) {
    var href = link.getAttribute("href").replace("#", "");
    var on = route === href || route.indexOf(href + "/") === 0;
    if (on) inExamples = true;
    mark(link, on);
  });
  if (examplesBtn) mark(examplesBtn, inExamples);
}



function focusContent() {
  app.focus({ preventScroll: true });
}


function router(moveFocus) {
  var hash = location.hash.replace(/^#/, "");
  closeExamples(false);
  // Cada página de DS é exibida com o próprio tema (prévia); as demais voltam ao tema escolhido.
  var previewId = hash.indexOf("/design-system/") === 0 ? hash.replace("/design-system/", "") : "";
  var previewable = THEMES.some(function (t) { return t.id === previewId; });
  applyTheme(previewable ? previewId : currentTheme);
  syncPicker(previewable ? previewId : currentTheme);
  if (!hash || hash === "/") {
    app.innerHTML = homeHTML();
    setTitle("");
    initDSList();
    setActiveNav("/");
  } else if (hash.indexOf("/artigo/") === 0) {
    app.innerHTML = page(articleHTML(hash.replace("/artigo/", "")), [[T("nav.blog"), "#/blog"], [articleTitle(hash.replace("/artigo/", ""))]]);
    setTitle(articleTitle(hash.replace("/artigo/", "")));
    setActiveNav("/blog");
  } else if (hash === "/blog") {
    app.innerHTML = page(blogHTML(), [[T("nav.blog")]]);
    setTitle(T("nav.blog"));
    setActiveNav("/blog");
  } else if (hash === "/design-system" || hash === "/design-systems") {
    // O catálogo agora fica na própria home.
    location.replace("#/");
    return;
  } else if (hash.indexOf("/design-system/") === 0) {
    var dsId = hash.replace("/design-system/", "");
    var crumbs = [[dsName(dsId)]];
    app.innerHTML = page('<div class="empty"><strong>' + esc(T("ds.loading")) + "</strong></div>", crumbs);
    setTitle(dsName(dsId));
    loadDsDetail(dsId)
      .then(function (d) {
        if (location.hash.replace(/^#/, "") !== hash) return;
        app.innerHTML = page(renderDSDetail(d.id), crumbs);
        initDSDetail();
        window.scrollTo({ top: 0, behavior: "auto" });
        if (moveFocus) focusContent();
      })
      .catch(function () {
        if (location.hash.replace(/^#/, "") !== hash) return;
        app.innerHTML = page(notFoundHTML(), [[T("nf.title")]]);
      });
    setActiveNav("/design-system");
  } else if (hash === "/entrar" || hash.indexOf("/entrar/") === 0) {
    var wanted = authFromSlug(hash.replace(/^\/entrar\/?/, ""));
    if (hash !== "/entrar" && hash !== "/entrar/" && !wanted) {
      app.innerHTML = page(notFoundHTML(), [[T("nav.signin"), "#/entrar"], [T("nf.title")]]);
      setTitle(T("nf.title"));
    } else {
      setAuthState(wanted || "login");
      app.innerHTML = authHTML(authState);
      setTitle(authTitle(authState));
      authMount();
    }
    setActiveNav("/entrar");
  } else if (hash === "/licencas") {
    app.innerHTML = page(licensesHTML(), [[T("footer.lic")]]);
    setTitle(T("lic.title"));
    setActiveNav("");
  } else if (hash === "/privacidade") {
    app.innerHTML = page(privacyHTML(), [[T("footer.priv")]]);
    setTitle(T("pri.title"));
    setActiveNav("");
  } else if (hash === "/institucional") {
    app.innerHTML = institutionalHTML();
    setTitle(T("nav.institutional"));
    setActiveNav("/institucional");
  } else if (hash === "/componentes") {
    app.innerHTML = page(componentsHTML(), [[T("nav.components")]]);
    setTitle(T("nav.components"));
    componentsMount();
    setActiveNav("/componentes");
  } else if (hash === "/dashboard") {
    app.innerHTML = page(dashboardHTML(), [[T("nav.dashboard")]]);
    setTitle(T("nav.dashboard"));
    setActiveNav("/dashboard");
  } else if (hash === "/loja" || hash.indexOf("/loja/") === 0) {
    var catId = hash.indexOf("/loja/") === 0 ? hash.replace("/loja/", "") : "";
    var known = SHOP_CATS.some(function (c) { return c.id === catId; });
    if (catId && !known) {
      app.innerHTML = page(notFoundHTML(), [[T("nav.shop"), "#/loja"], [T("nf.title")]]);
      setTitle(T("nf.title"));
    } else {
      app.innerHTML = page(shopHTML(catId), catId ? [[T("nav.shop"), "#/loja"], [shopCatName(catId)]] : [[T("nav.shop")]]);
      setTitle(catId ? shopCatName(catId) + " · " + T("nav.shop") : T("nav.shop"));
      shopMount();
    }
    setActiveNav("/loja");
  } else if (hash === "/tabela") {
    clearTimeout(loadTimer);
    resetTableState();
    app.innerHTML = page(tablePageHTML(), [[T("nav.table")]]);
    setTitle(T("nav.table"));
    tableMount();
    setActiveNav("/tabela");
  } else if (hash === "/formulario") {
    app.innerHTML = page(formPageHTML(), [[T("nav.form")]]);
    setTitle(T("nav.form"));
    initDemoForm();
    setActiveNav("/formulario");
  } else {
    app.innerHTML = page(notFoundHTML(), [[T("nf.title")]]);
    setTitle(T("nf.title"));
    setActiveNav("");
  }
  window.scrollTo({ top: 0, behavior: "auto" });
  if (moveFocus && hash.indexOf("/design-system/") !== 0) focusContent();
}


// ---- idioma: botão no cabeçalho (alterna pt-BR <-> en-US) ----
var langBtn = document.getElementById("langBtn");


function applyStaticI18n() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    el.textContent = T(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
    el.setAttribute("aria-label", T(el.getAttribute("data-i18n-aria")));
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
    el.setAttribute("placeholder", T(el.getAttribute("data-i18n-ph")));
  });
  if (langBtn) {
    langBtn.setAttribute("aria-label", T("lang.label"));
    setTipText("langTip", T("lang.label"));
    updateNavLabel();
    document.getElementById("langCode").textContent = T("lang.code");
  }
  if (comboBtn) comboBtn.setAttribute("aria-label", T("combo.label"));
}


function setLanguage(next) {
  setLang(next);
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {}
  applyStaticI18n();
  if (comboList) fillComboList();
  setTheme(currentTheme);
  router();
}


if (langBtn) {
  langBtn.addEventListener("click", function () {
    setLanguage(lang === "pt-BR" ? "en-US" : "pt-BR");
  });
}


// ---- altura do cabeçalho em --header-h (usada pelo painel fixo das telas de login) ----
function updateHeaderHeight() {
  var header = document.querySelector(".site-header");
  if (header) document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
}

updateHeaderHeight();

window.addEventListener("resize", updateHeaderHeight);

if (window.ResizeObserver && document.querySelector(".site-header")) {
  // no próximo quadro: gravar --header-h dentro do callback muda o layout e faz o WebKit avisar
  // "ResizeObserver loop completed with undelivered notifications"
  new ResizeObserver(function () { requestAnimationFrame(updateHeaderHeight); }).observe(document.querySelector(".site-header"));
}


// ---- botão "voltar ao topo": aparece depois de rolar a página ----
var toTop = document.getElementById("toTop");

if (toTop) {
  var topTicking = false;
  function updateToTop() {
    topTicking = false;
    toTop.hidden = window.scrollY < 400;
  }
  window.addEventListener("scroll", function () {
    if (!topTicking) { topTicking = true; window.requestAnimationFrame(updateToTop); }
  }, { passive: true });
  toTop.addEventListener("click", function () {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    var brand = document.querySelector(".brand");
    if (brand) brand.focus({ preventScroll: true });
  });
  updateToTop();
}


loadData().then(function () {
  buildCombobox();
  applyStaticI18n();
  setTheme(themeFromURL() || getStoredTheme());
  window.addEventListener("hashchange", function () { router(true); });
  // Voltar/avançar entre trocas de tema (a entrada só difere no ?tema=): reaplica o da URL.
  window.addEventListener("popstate", function () {
    var t = themeFromURL();
    if (t && t !== currentTheme) {
      setTheme(t, { history: "none" });
      router();
    }
  });
  router();
});
