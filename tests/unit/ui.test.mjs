import "./setup.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { pageItems, paginationHTML, tip, tipWrap } from "../../assets/js/ui.js";

test("pageItems: poucas páginas, sem reticências", () => {
  assert.deepEqual(pageItems(1, 1), [1]);
  assert.deepEqual(pageItems(2, 5), [1, 2, 3, 4, 5]);
});

test("pageItems: reticências dos dois lados", () => {
  assert.deepEqual(pageItems(6, 12), [1, 2, "…", 5, 6, 7, "…", 11, 12]);
});

test("pageItems: nas pontas", () => {
  assert.deepEqual(pageItems(1, 12), [1, 2, "…", 11, 12]);
  assert.deepEqual(pageItems(12, 12), [1, 2, "…", 11, 12]);
});

test("pageItems: nunca repete nem sai de 1..total", () => {
  for (let total = 1; total <= 15; total++) {
    for (let cur = 1; cur <= total; cur++) {
      const nums = pageItems(cur, total).filter((x) => x !== "…");
      assert.deepEqual(nums, [...new Set(nums)].sort((a, b) => a - b), `${cur}/${total}`);
      assert.ok(nums.every((n) => n >= 1 && n <= total), `${cur}/${total}`);
      assert.ok(nums.includes(cur) && nums.includes(1) && nums.includes(total), `${cur}/${total}`);
    }
  }
});

test("paginationHTML desabilita anterior na 1ª e próxima na última, e marca a atual", () => {
  const first = paginationHTML(1, 3);
  assert.match(first, /data-page="0" disabled/);
  assert.match(first, /aria-current="page"/);
  assert.doesNotMatch(first, /data-page="4" disabled/);
  assert.match(paginationHTML(3, 3), /data-page="4" disabled/);
});

test("tip escapa id e texto", () => {
  const html = tip('a"b', "<i>x</i>");
  assert.match(html, /id="a&quot;b"/);
  assert.match(html, />&lt;i&gt;x&lt;\/i&gt;</);
});

test("tipWrap aplica as classes de posição", () => {
  assert.match(tipWrap("<b></b>", "t", "x", { below: true, end: true }), /class="tip-wrap tip-below tip-end"/);
});
