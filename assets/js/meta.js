// Metatags por página: descrição, Open Graph e Twitter acompanham a rota.
// Rastreadores que não executam JavaScript (a maioria dos de rede social) só leem as tags estáticas do
// index.html, porque as rotas são por hash; quem executa (buscadores) recebe as da página aberta.

import { THEMES } from "./data.js";
import { L, T } from "./i18n.js";

const BASE = "https://jonassenetorres.github.io/ds-viewer-open-design/";

// rota (início do hash) -> chave do texto "meta.<chave>" em i18n.js
const ROUTE_KEYS = [
  ["/artigo/", "article"], ["/blog", "blog"], ["/design-system/", "ds"], ["/tabela", "table"],
  ["/formulario", "form"], ["/componentes", "components"], ["/dashboard", "dashboard"], ["/loja", "shop"], ["/institucional", "institutional"],
  ["/entrar", "auth"], ["/licencas", "licenses"], ["/privacidade", "privacy"]
];

function setContent(selector, value) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute("content", value);
}

function describe(hash) {
  let key = "home";
  for (let i = 0; i < ROUTE_KEYS.length; i++) {
    if (hash.indexOf(ROUTE_KEYS[i][0]) === 0) { key = ROUTE_KEYS[i][1]; break; }
  }
  if (key === "ds") {
    const id = hash.replace("/design-system/", "");
    const t = THEMES.filter(function (x) { return x.id === id; })[0];
    if (t && L(t.hint)) return L(t.hint);
  }
  return T("meta." + key);
}

// Chamada a cada troca de rota (setTitle em layout.js): usa o título já definido da aba.
function updateMeta() {
  const hash = location.hash.replace(/^#/, "") || "/";
  const title = document.title;
  const desc = describe(hash);
  const url = BASE + (hash === "/" ? "" : "#" + hash);
  setContent('meta[name="description"]', desc);
  setContent('meta[property="og:title"]', title);
  setContent('meta[property="og:description"]', desc);
  setContent('meta[property="og:url"]', url);
  setContent('meta[property="og:locale"]', T("meta.locale"));
  setContent('meta[name="twitter:title"]', title);
  setContent('meta[name="twitter:description"]', desc);
}

export { updateMeta };
