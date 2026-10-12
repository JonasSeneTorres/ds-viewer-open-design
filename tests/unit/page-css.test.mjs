import "./setup.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { allCssUrls, cssFor } from "../../assets/js/page-css.js";

test("cssFor: início e rotas conhecidas", () => {
  assert.deepEqual(cssFor(""), ["ds"]);
  assert.deepEqual(cssFor("/"), ["ds"]);
  assert.deepEqual(cssFor("/design-system/padrao"), ["ds"]);
  assert.deepEqual(cssFor("/blog"), ["blog"]);
  assert.deepEqual(cssFor("/artigo/lorem-ipsum-dolor"), ["blog"]);
  assert.deepEqual(cssFor("/entrar/esqueci"), ["auth"]);
  assert.deepEqual(cssFor("/loja/ipsum"), ["shop"]);
  assert.deepEqual(cssFor("/privacidade"), ["legal"]);
});

test("cssFor: rota inexistente só usa o núcleo", () => {
  assert.deepEqual(cssFor("/nao-existe"), []);
});

test("allCssUrls lista todos os arquivos de assets/css, com core primeiro e late por último", () => {
  const urls = allCssUrls();
  assert.equal(urls[0], "assets/css/core.css");
  assert.equal(urls[urls.length - 1], "assets/css/late.css");
  const onDisk = readdirSync("assets/css").filter((f) => f.endsWith(".css")).map((f) => "assets/css/" + f).sort();
  assert.deepEqual([...urls].sort(), onDisk);
});

test("index.html liga core, ds e late, nessa ordem, e mais nenhum arquivo de página", () => {
  const html = readFileSync("index.html", "utf8");
  const links = [...html.matchAll(/<link rel="stylesheet" href="(assets\/css\/[a-z]+\.css)"/g)].map((m) => m[1]);
  assert.deepEqual(links, ["assets/css/core.css", "assets/css/ds.css", "assets/css/late.css"]);
});
