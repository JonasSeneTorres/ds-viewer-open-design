// CSS por página. O núcleo (core.css e late.css) e o catálogo (ds.css, a página inicial) vêm no index.html; os
// demais arquivos de assets/css/ são buscados na primeira visita à rota e inseridos antes de late.css, que
// precisa ficar por último (cabeçalho responsivo, RTL e componentes compartilhados sobrescrevem as páginas).

const BASE = "assets/css/";

// início do hash (sem "#") -> arquivos de assets/css/ (sem ".css"). A primeira entrada que casar vale.
const ROUTE_CSS = [
  ["/design-system", ["ds"]],
  ["/artigo/", ["blog"]],
  ["/blog", ["blog"]],
  ["/entrar", ["auth"]],
  ["/licencas", ["legal"]],
  ["/privacidade", ["legal"]],
  ["/institucional", ["institutional"]],
  ["/componentes", ["components"]],
  ["/dashboard", ["dashboard"]],
  ["/loja", ["shop"]],
  ["/tabela", ["table"]],
  ["/formulario", ["form"]]
];

// Todos os arquivos de página, na ordem em que aparecem no CSS original (a visão de código lê todos).
const PAGE_FILES = ["ds", "blog", "dashboard", "shop", "institutional", "auth", "legal", "components", "table", "form"];

function cssFor(hash) {
  if (!hash || hash === "/") return ["ds"];
  for (let i = 0; i < ROUTE_CSS.length; i++) {
    if (hash.indexOf(ROUTE_CSS[i][0]) === 0) return ROUTE_CSS[i][1];
  }
  return [];
}

function linkOf(name) {
  return document.querySelector('link[data-page-css="' + name + '"]');
}

// pronta = folha aplicada, ou o arquivo falhou (a página aparece sem o estilo dela em vez de travar)
function isReady(link) {
  return !!link && (!!link.sheet || link.getAttribute("data-failed") === "1");
}

function cssReady(names) {
  return names.every(function (name) { return isReady(linkOf(name)); });
}

function whenReady(link) {
  return new Promise(function (resolve) {
    if (isReady(link)) { resolve(); return; }
    link.addEventListener("load", function () { resolve(); }, { once: true });
    link.addEventListener("error", function () { link.setAttribute("data-failed", "1"); resolve(); }, { once: true });
  });
}

function ensurePageCss(names) {
  const late = document.getElementById("cssLate");
  return Promise.all(names.map(function (name) {
    let link = linkOf(name);
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = BASE + name + ".css";
      link.setAttribute("data-page-css", name);
      if (late) document.head.insertBefore(link, late); else document.head.appendChild(link);
    }
    return whenReady(link);
  }));
}

// Caminhos de todo o CSS do site, na ordem de cascata (para a visão de código, que lê os arquivos publicados).
function allCssUrls() {
  return [BASE + "core.css"].concat(PAGE_FILES.map(function (n) { return BASE + n + ".css"; }), [BASE + "late.css"]);
}

export { allCssUrls, cssFor, cssReady, ensurePageCss };
