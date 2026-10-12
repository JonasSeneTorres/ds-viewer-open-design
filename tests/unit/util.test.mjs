import "./setup.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { chipsHTML, esc, fold, formatDate, inkFor, isColorValue } from "../../assets/js/util.js";

test("esc escapa os cinco caracteres de HTML", () => {
  assert.equal(esc(`<a href="x" onclick='y'>&</a>`), "&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
});

test("esc aceita números, null e undefined sem estourar", () => {
  assert.equal(esc(42), "42");
  assert.equal(esc(null), "null");
  assert.equal(esc(undefined), "undefined");
});

test("esc não é idempotente: quem chama não deve aplicá-lo duas vezes", () => {
  assert.equal(esc("Tom & Jerry"), "Tom &amp; Jerry");
  assert.equal(esc(esc("&")), "&amp;amp;");
});

test("fold tira acento e caixa", () => {
  assert.equal(fold("Ação Ítalo ÜBER"), "acao italo uber");
});

test("formatDate em pt-BR", () => {
  assert.equal(formatDate("2026-03-12"), "12/03/2026");
  assert.equal(formatDate(""), "—");
  assert.equal(formatDate("lixo"), "lixo");
  assert.equal(formatDate("<b>"), "&lt;b&gt;"); // datas inválidas voltam escapadas
});

test("isColorValue", () => {
  for (const ok of ["#fff", "#4630EB", "#4630ebcc", "rgb(0,0,0)", "rgba(0,0,0,.5)", "hsl(0 0% 0%)", "oklch(0.5 0.1 200)"]) {
    assert.ok(isColorValue(ok), ok);
  }
  for (const bad of ["red", "var(--x)", "url(x)", "", "10px"]) {
    assert.ok(!isColorValue(bad), bad);
  }
});

test("chipsHTML ignora repetidos e vazios, e escapa o valor", () => {
  const html = chipsHTML(["#FFF", "#fff", "", "  ", '"><script>']);
  assert.equal((html.match(/<i /g) || []).length, 2);
  assert.ok(!html.includes("<script>"));
});

// Mesma regra do ink_for de scripts/build_ds_details.py (os valores abaixo vêm de lá).
test("inkFor tem a mesma resposta do build em Python", () => {
  const esperado = {
    "#ffffff": "#111111", "#000000": "#ffffff", "#4630eb": "#ffffff", "#f59e0b": "#111111",
    "#6666ff": "#111111", "#ff385c": "#111111", "#00a36c": "#111111", "#808080": "#111111",
    "#767676": "#ffffff", "#777777": "#ffffff", "#e5484d": "#111111", "#0b0d12": "#ffffff",
    "#f6f7f9": "#111111", "#8f85ff": "#111111", "#fa0": "#111111", "#1db954": "#111111",
  };
  for (const [cor, tinta] of Object.entries(esperado)) assert.equal(inkFor(cor), tinta, cor);
});
