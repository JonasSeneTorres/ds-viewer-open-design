import { storage } from "./setup.mjs";
import test from "node:test";
import assert from "node:assert/strict";

const content = await import("../../assets/js/content.js");

test("sem nada salvo, a tabela começa com os 10 registros de exemplo, ids únicos", () => {
  assert.equal(content.records.length, 10);
  const ids = content.records.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("saveRecords grava no localStorage e setRecords troca a lista", () => {
  content.setRecords([{ id: 99, name: "X", category: "Ação", status: "beta", complexity: 1, updated: "2026-01-01" }]);
  content.saveRecords();
  const saved = JSON.parse(storage.get("odv-records"));
  assert.equal(saved.length, 1);
  assert.equal(saved[0].id, 99);
});

test("os artigos têm id único", () => {
  const ids = content.ARTICLES.map((a) => a.id);
  assert.ok(ids.length > 0);
  assert.equal(new Set(ids).size, ids.length);
});
