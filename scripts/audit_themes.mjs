// Auditoria visual de todos os temas: abre as telas principais com cada tema e mede o que dá para medir.
//
//   npm run audit:themes                       (usa o Chromium do Playwright)
//   PW_CHANNEL=msedge npm run audit:themes     (usa o Edge instalado, sem baixar navegador)
//   npm run audit:themes -- --only bugatti,airbnb --out saida.json
//
// Por tema e por tela (início, página do DS, tabela, formulário), em desktop (1280) e celular (390):
//   - rolagem horizontal, erros de JS e respostas com erro;
//   - contraste (WCAG) de texto normal, títulos, links, kicker, texto secundário, botões, cabeçalho e rodapé;
//   - fonte do título e do corpo realmente carregadas;
// Grava um JSON e imprime um resumo. Sai com código 1 se houver achados "graves".
import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
const only = opt("only") ? opt("only").split(",") : null;
const outFile = opt("out") || "audit-themes.json";
const MIN = 4.5;

// servidor estático mínimo (sem depender de porta fixa)
const ROOT = process.cwd();
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^([/\\])+/, "");
  const file = join(ROOT, path === "" ? "index.html" : path);
  if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
  res.end(await readFile(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const index = JSON.parse(await readFile("data/ds/index.json", "utf8"));
const ids = index.map((d) => d.id).filter((id) => !only || only.includes(id));

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });

// roda dentro da página: mede contraste e fontes
const MEASURE = () => {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  const rgba = (c) => {
    cx.clearRect(0, 0, 1, 1);
    cx.fillStyle = "#000"; // reseta antes de aplicar (cor inválida mantém a anterior)
    cx.fillStyle = c;
    cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const lum = ([r, g, b]) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => { const [h, l] = [lum(a), lum(b)].sort((x, y) => y - x); return (h + 0.05) / (l + 0.05); };
  const over = (top, under) => {
    const a = top[3];
    return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a)).concat(1);
  };
  const bgOf = (el) => {
    const stack = [];
    for (let e = el; e; e = e.parentElement) {
      const c = rgba(getComputedStyle(e).backgroundColor);
      if (c[3] > 0) stack.push(c);
      if (c[3] >= 0.99) break;
    }
    let acc = [255, 255, 255, 1];
    for (let i = stack.length - 1; i >= 0; i--) acc = over(stack[i], acc);
    return acc;
  };
  const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
  const out = {};
  const probe = (name, sel, root = document) => {
    const el = [...root.querySelectorAll(sel)].find(visible);
    if (!el) return;
    const s = getComputedStyle(el);
    const fg = over(rgba(s.color), bgOf(el));
    out[name] = { ratio: +ratio(fg, bgOf(el)).toFixed(2), size: parseFloat(s.fontSize), family: s.fontFamily.split(",")[0].replace(/["']/g, "").trim() };
  };
  probe("corpo", "main p");
  probe("h1", "main h1");
  probe("h2", "main h2");
  probe("link", "main a:not(.btn):not(.ds-card):not(.featured):not(.article-card)");
  probe("kicker", ".kicker");
  probe("muted", ".muted, .count, .article-meta");
  probe("botao-primario", ".btn-primary");
  probe("botao-ghost", ".btn-ghost");
  probe("cabecalho", ".main-nav a");
  probe("rodape", ".site-footer span");
  probe("campo", ".field input, .toolbar, #dsSearch");
  probe("pilula", ".pill");
  probe("th", "th");
  probe("faixa-solida", ".band-solid p");
  probe("botao-invertido", ".btn-invert");
  probe("estatistica", ".stats-row dd");
  probe("opiniao-autor", ".quote .muted");
  probe("icone", ".icon-bubble");
  out.overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  out.fonteH1 = out.h1 ? out.h1.family : null;
  out.carregadas = [...new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/["']/g, "")))];
  return out;
};

const ROUTES = (id) => [
  ["inicio", "/#/"],
  ["ds", `/#/design-system/${id}`],
  ["tabela", "/#/tabela"],
  ["formulario", "/#/formulario"],
  ["institucional", "/#/institucional"],
  ["dashboard", "/#/dashboard"],
  ["loja", "/#/loja"],
];
const VIEWPORTS = [["desktop", { width: 1280, height: 900 }], ["celular", { width: 390, height: 800 }]];

const report = [];
for (const id of ids) {
  const theme = { id, achados: [], telas: {} };
  for (const [vname, viewport] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport, locale: "pt-BR" });
    await ctx.addInitScript((t) => { try { localStorage.setItem("odv-theme", t); } catch (e) {} }, id);
    const page = await ctx.newPage();
    const problems = [];
    page.on("pageerror", (e) => problems.push(`erro de JS: ${e.message}`));
    page.on("response", (r) => { if (r.status() >= 400) problems.push(`HTTP ${r.status()} ${r.url().replace(base, "")}`); });
    for (const [name, route] of ROUTES(id)) {
      await page.goto(base + "/");
      await page.evaluate((h) => { location.hash = h.replace("/#", "#"); }, route);
      await page.waitForTimeout(450);
      await page.evaluate(() => document.fonts.ready);
      const m = await page.evaluate(MEASURE);
      theme.telas[`${vname}/${name}`] = m;
      if (m.overflowX) theme.achados.push(`${vname}/${name}: rolagem horizontal`);
      for (const [k, v] of Object.entries(m)) {
        if (v && typeof v === "object" && "ratio" in v) {
          const limit = v.size >= 24 || (v.size >= 18.66 && k === "h1") ? 3 : MIN; // texto grande: 3:1
          if (v.ratio < limit) theme.achados.push(`${vname}/${name}: contraste ${k} ${v.ratio}:1 (mín. ${limit}:1)`);
        }
      }
    }
    for (const p of [...new Set(problems)]) theme.achados.push(`${vname}: ${p}`);
    await ctx.close();
  }
  theme.achados = [...new Set(theme.achados)];
  report.push(theme);
  process.stdout.write(theme.achados.length ? `x ${id} (${theme.achados.length})\n` : `. ${id}\n`);
}

await writeFile(outFile, JSON.stringify(report, null, 1));
await browser.close();
server.close();

const com = report.filter((t) => t.achados.length);
console.log(`\n${report.length} temas auditados, ${com.length} com achados. Detalhes em ${outFile}`);
const kinds = {};
for (const t of com) for (const a of t.achados) { const k = a.replace(/^[^:]+: /, "").replace(/\d+(\.\d+)?:1/g, "N:1").replace(/\(mín\. [\d.]+:1\)/, ""); kinds[k] = (kinds[k] || 0) + 1; }
for (const [k, n] of Object.entries(kinds).sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(String(n).padStart(5), k);
process.exit(com.length ? 1 : 0);
