// Catálogo de loja de exemplo.

import { T, lang } from "./i18n.js";
import { showToast, tipWrap } from "./ui.js";
import { esc } from "./util.js";


// ------------------------------------------------------------------
// Catálogo de loja de exemplo: navegação por categoria, ordenação e "adicionar ao carrinho".
// Sem fotos: degradê com as cores do tema e o ícone de imagem não encontrada em SVG.
// ------------------------------------------------------------------

const SHOP_CATS = [
  { id: "lorem", name: "Lorem" }, { id: "ipsum", name: "Ipsum" }, { id: "dolor", name: "Dolor" },
  { id: "sit-amet", name: "Sit amet" }, { id: "consectetur", name: "Consectetur" }
];


const SHOP_PRODUCTS = [
  { id: 1, name: "Lorem ipsum dolor", cat: "lorem", price: 129.9, old: 159.9, rating: 5, badge: "sale" },
  { id: 2, name: "Sit amet consectetur", cat: "ipsum", price: 89.5, old: null, rating: 4, badge: null },
  { id: 3, name: "Adipiscing elit sed", cat: "dolor", price: 249, old: null, rating: 4, badge: "new" },
  { id: 4, name: "Eiusmod tempor", cat: "sit-amet", price: 59.9, old: null, rating: 3, badge: null },
  { id: 5, name: "Incididunt ut labore", cat: "consectetur", price: 319, old: 399, rating: 5, badge: "sale" },
  { id: 6, name: "Et dolore magna", cat: "lorem", price: 74.9, old: null, rating: 4, badge: null },
  { id: 7, name: "Aliqua ut enim", cat: "ipsum", price: 199, old: null, rating: 5, badge: "new" },
  { id: 8, name: "Minim veniam quis", cat: "dolor", price: 39.9, old: null, rating: 3, badge: null },
  { id: 9, name: "Nostrud exercitation", cat: "sit-amet", price: 149.9, old: 179.9, rating: 4, badge: "sale" },
  { id: 10, name: "Ullamco laboris", cat: "consectetur", price: 99, old: null, rating: 4, badge: null },
  { id: 11, name: "Nisi ut aliquip", cat: "lorem", price: 279.9, old: null, rating: 5, badge: null },
  { id: 12, name: "Commodo consequat", cat: "ipsum", price: 54.9, old: null, rating: 2, badge: null }
];


let shopSort = "relevance";

let shopCart = 0;


// Ícone de imagem não encontrada: moldura, montanhas, sol e um traço cortando.
function noImageSVG() {
  return (
    '<svg class="no-image" viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<rect x="8" y="12" width="48" height="40" rx="5"/>' +
    '<circle cx="22" cy="26" r="4"/>' +
    '<path d="M8 44l14-12 10 9 8-6 16 12"/>' +
    '<path d="M12 56L52 8"/>' +
    "</svg>"
  );
}


function cartIconSVG() {
  return (
    '<svg class="cart-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path d="M3 4h2.5l2.2 10.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.76L20 8H6.2"/>' +
    '<circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>' +
    "</svg>"
  );
}


function starsSVG(rating) {
  let out = "";
  for (let k = 1; k <= 5; k++) {
    out += '<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true" class="' + (k <= rating ? "star is-on" : "star") + '"><path d="M10 1.8l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 8.1l6-.8z"/></svg>';
  }
  return '<span class="stars" role="img" aria-label="' + rating + '/5">' + out + "</span>";
}


function money(v) {
  try {
    return new Intl.NumberFormat(lang, { style: "currency", currency: lang === "pt-BR" ? "BRL" : "USD" }).format(v);
  } catch (e) {
    return String(v);
  }
}


function productCardHTML(p, i) {
  const angle = 110 + (i * 37) % 80;
  const a = 20 + (i * 13) % 28;
  const b = 8 + (i * 7) % 18;
  const grad = "linear-gradient(" + angle + "deg, color-mix(in oklab, var(--grad-1, var(--accent)) " + a + "%, var(--surface)), color-mix(in oklab, var(--grad-2, var(--accent-strong)) " + b + "%, var(--surface-2)))";
  return (
    '<article class="product">' +
    '<div class="thumb" style="background:' + grad + '">' + noImageSVG() +
    (p.badge ? '<span class="badge badge-' + p.badge + '">' + esc(T("shop." + p.badge)) + "</span>" : "") +
    "</div>" +
    '<div class="product-body">' +
    '<span class="product-cat">' + esc(shopCatName(p.cat)) + "</span>" +
    tipWrap('<h3 class="product-name">' + esc(p.name) + "</h3>", "pname" + p.id, p.name, { label: true, below: true, block: true }) +
    starsSVG(p.rating) +
    '<p class="price">' + (p.old ? '<s class="price-old">' + money(p.old) + "</s> " : "") + "<strong>" + money(p.price) + "</strong></p>" +
    '<button type="button" class="btn btn-ghost btn-small" data-add="' + p.id + '">' + cartIconSVG() + '<span class="btn-label">' + esc(T("shop.add")) + "</span></button>" +
    "</div></article>"
  );
}


function shopCatName(id) {
  for (let i = 0; i < SHOP_CATS.length; i++) if (SHOP_CATS[i].id === id) return SHOP_CATS[i].name;
  return "";
}


function shopList(catId) {
  let list = SHOP_PRODUCTS.filter(function (p) { return !catId || p.cat === catId; });
  if (shopSort === "price-asc") list = list.slice().sort(function (a, b) { return a.price - b.price; });
  else if (shopSort === "price-desc") list = list.slice().sort(function (a, b) { return b.price - a.price; });
  else if (shopSort === "name") list = list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
  return list;
}


function shopGridHTML(catId) {
  const list = shopList(catId);
  if (!list.length) {
    return '<div class="empty"><strong>' + esc(T("shop.empty")) + "</strong></div>";
  }
  return '<div class="product-grid">' + list.map(productCardHTML).join("") + "</div>";
}


function shopHTML(catId) {
  const current = catId || "";
  const nav =
    '<nav class="shop-nav" aria-label="' + esc(T("shop.cats")) + '"><h2 class="aside-title">' + esc(T("shop.cats")) + "</h2><ul>" +
    '<li><a href="#/loja"' + (!current ? ' aria-current="page"' : "") + ">" + esc(T("shop.all")) + '<span class="aside-count">' + SHOP_PRODUCTS.length + "</span></a></li>" +
    SHOP_CATS.map(function (c) {
      const n = SHOP_PRODUCTS.filter(function (p) { return p.cat === c.id; }).length;
      return '<li><a href="#/loja/' + c.id + '"' + (current === c.id ? ' aria-current="page"' : "") + ">" + esc(c.name) + '<span class="aside-count">' + n + "</span></a></li>";
    }).join("") +
    "</ul></nav>";
  const sorts = [["relevance", "shop.sRel"], ["price-asc", "shop.sAsc"], ["price-desc", "shop.sDesc"], ["name", "shop.sName"]];
  return (
    '<div class="page-head">' +
    '<span class="kicker">' + esc(T("shop.kicker")) + "</span>" +
    "<h1>" + esc(current ? shopCatName(current) : T("shop.h1")) + "</h1>" +
    '<p class="lede">' + esc(T("shop.lede")) + "</p>" +
    "</div>" +
    '<div class="shop-layout">' + nav +
    '<div class="shop-main">' +
    '<div class="toolbar">' +
    '<span class="count" id="shopCount">' + shopList(current).length + " " + esc(T("shop.items")) + "</span>" +
    '<span class="shop-tools"><span class="cart" aria-live="polite">' + esc(T("shop.cart")) + ': <strong id="cartCount">' + shopCart + "</strong></span>" +
    '<label class="shop-sort"><span class="sr-only">' + esc(T("shop.sort")) + '</span><select id="shopSort">' +
    sorts.map(function (s) { return '<option value="' + s[0] + '"' + (shopSort === s[0] ? " selected" : "") + ">" + esc(T(s[1])) + "</option>"; }).join("") +
    "</select></label></span></div>" +
    '<div id="shopGrid" data-cat="' + esc(current) + '">' + shopGridHTML(current) + "</div>" +
    "</div></div>"
  );
}


function shopMount() {
  const grid = document.getElementById("shopGrid");
  const sel = document.getElementById("shopSort");
  if (sel) {
    sel.addEventListener("change", function () {
      shopSort = sel.value;
      grid.innerHTML = shopGridHTML(grid.getAttribute("data-cat"));
    });
  }
  if (grid) {
    grid.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-add]");
      if (!btn) return;
      shopCart += 1;
      document.getElementById("cartCount").textContent = shopCart;
      showToast("ok", T("shop.toastAdded"));
    });
  }
}

export { SHOP_CATS, noImageSVG, shopCatName, shopHTML, shopMount };
