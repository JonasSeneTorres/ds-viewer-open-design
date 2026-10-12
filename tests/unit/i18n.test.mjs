import "./setup.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { L, T, UI, enKey, lang } from "../../assets/js/i18n.js";

test("o idioma vem do localStorage", () => {
  assert.equal(lang, "pt-BR");
});

test("L aceita string, lista {lang,message} e cai para en-US", () => {
  assert.equal(L(null), "");
  assert.equal(L("oi"), "oi");
  assert.equal(L([{ lang: "en-US", message: "hi" }, { lang: "pt-BR", message: "oi" }]), "oi");
  assert.equal(L([{ lang: "en-US", message: "hi" }]), "hi");
  assert.equal(L([{ lang: "fr-FR", message: "salut" }]), "salut"); // sem en-US: o primeiro
  assert.equal(L([]), "");
});

test("enKey é estável e independe do idioma", () => {
  assert.equal(enKey("x"), "x");
  assert.equal(enKey([{ lang: "pt-BR", message: "Ação" }, { lang: "en-US", message: "Action" }]), "Action");
  assert.equal(enKey([]), "");
});

test("T devolve a chave quando o texto não existe", () => {
  assert.equal(T("nao.existe.mesmo"), "nao.existe.mesmo");
  assert.equal(T("nav.home"), "Início");
});

test("todo texto da interface existe em en-US e pt-BR, sem vazio", () => {
  const faltando = [];
  for (const [key, v] of Object.entries(UI)) {
    for (const l of ["en-US", "pt-BR"]) {
      if (typeof v[l] !== "string" || !v[l].trim()) faltando.push(`${key} (${l})`);
    }
  }
  assert.deepEqual(faltando, []);
});

test("textos com {n} ou {total} têm os mesmos marcadores nos dois idiomas", () => {
  const diff = [];
  const marks = (s) => (String(s).match(/\{[a-z]+\}/gi) || []).sort().join(",");
  for (const [key, v] of Object.entries(UI)) {
    if (marks(v["en-US"]) !== marks(v["pt-BR"])) diff.push(key);
  }
  assert.deepEqual(diff, []);
});
