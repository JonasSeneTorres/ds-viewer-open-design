// E2E básico: garante que o site abre, navega, troca de tema e que as telas principais respondem.
import { test, expect } from "@playwright/test";

const TOTAL = 143; // design systems no catálogo (data/ds/index.json)

// Falha o teste se a página gerar erro de JS, resposta 4xx/5xx ou pedir algo ao Google.
function watch(page) {
  const problems = [];
  page.on("pageerror", (e) => problems.push(`erro de JS: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 400) problems.push(`HTTP ${r.status()} ${r.url()}`);
  });
  page.on("request", (r) => {
    if (/googleapis|gstatic/.test(r.url())) problems.push(`pedido externo: ${r.url()}`);
  });
  return problems;
}

test("início mostra o hero e o catálogo completo", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/#/");
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator(".ds-card-cat")).toHaveCount(TOTAL);
  await expect(page.locator(".main-nav > a")).toHaveText(["Início", "Informações do tema"]);
  await expect(page.locator("#examplesBtn")).toContainText("Exemplos");
  expect(problems).toEqual([]);
});

test("busca filtra o catálogo", async ({ page }) => {
  await page.goto("/#/");
  await page.fill("#dsSearch", "bugatti");
  await expect(page.locator("#dsCount")).toHaveText("1 design system");
  await page.fill("#dsSearch", "");
  await expect(page.locator("#dsCount")).toHaveText(`${TOTAL} design systems`);
});

test("página de um DS abre com o próprio tema", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/#/");
  await page.fill("#dsSearch", "bugatti");
  await page.locator(".ds-card-cat:not([hidden])").click();
  await expect(page).toHaveURL(/#\/design-system\/bugatti$/);
  await expect(page.locator("#palette")).toBeVisible();
  await expect(page.locator("#tokens")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "bugatti");
  await expect(page).toHaveTitle(/Bugatti/);
  // o conteúdo vem de um JSON por idioma: trocar o idioma na página recarrega o outro arquivo
  await expect(page.locator(".ds-full .kicker")).toContainText("Automotivo");
  await page.click("#langBtn");
  await expect(page.locator(".ds-full .kicker")).toContainText("Automotive");
  expect(problems).toEqual([]);
});

test("seletor de temas busca, aplica e lembra a escolha", async ({ page }) => {
  await page.goto("/#/");
  await page.click(".combobox-btn");
  await page.keyboard.type("tesla");
  await expect(page.locator(".combobox-option:not([hidden])")).toHaveCount(1);
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "tesla");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "tesla");
});

test("blog lista artigos e abre um artigo com a barra lateral", async ({ page }) => {
  await page.goto("/#/blog");
  await expect(page.locator(".article-card")).toHaveCount(5);
  // barra lateral ilustrativa: busca, tópicos, últimos artigos, redes, newsletter e nuvem de tags
  await expect(page.locator(".blog-aside .aside-block")).toHaveCount(5);
  await expect(page.locator(".blog-aside .social-btn")).toHaveCount(6);
  await expect(page.locator(".blog-aside .tag-cloud .tag").first()).toBeVisible();
  await expect(page.locator(".blog-aside .aside-newsletter input")).toBeVisible();
  await page.locator(".featured").click();
  await expect(page).toHaveURL(/#\/artigo\//);
  await expect(page.locator(".blog-aside")).toBeVisible();
  // busca da barra lateral é de enfeite: não pode mudar a rota
  const url = page.url();
  await page.fill("#asideSearch", "teste");
  await page.keyboard.press("Enter");
  expect(page.url()).toBe(url);
});

test("tabela: adiciona um registro e mostra os estados", async ({ page }) => {
  await page.goto("/#/tabela");
  await expect(page.locator("#tableCount")).toHaveText("10 registros");
  await page.click("#addRecord");
  await page.fill('#recordForm input[name="name"]', "Stepper");
  await page.click('#recordForm button[type="submit"]');
  await expect(page.locator("#tableCount")).toHaveText("11 registros");
  await expect(page.locator("#tableBody")).toContainText("Stepper");

  await page.locator('#tableStates label:has-text("Vazio")').click();
  await expect(page.locator("#tableBody .empty")).toBeVisible();
  await page.locator('#tableStates label:has-text("Erro")').click();
  await expect(page.locator("#tableBody .is-error")).toBeVisible();
  await page.locator('#tableStates label:has-text("Dados")').click();
  await expect(page.locator("#tableBody tr")).toHaveCount(11);
});

test("formulário valida e confirma o envio", async ({ page }) => {
  await page.goto("/#/formulario");
  await page.click("#demoSubmit");
  await expect(page.locator("#demoAlert")).toHaveClass(/error/);
  await page.fill('#demoForm input[name="texto"]', "Maria");
  await page.fill('#demoForm input[name="email"]', "maria@example.com");
  await page.click("#demoSubmit");
  await expect(page.locator("#demoAlert")).toHaveClass(/success/);
});

test("troca de idioma e botão de voltar ao topo", async ({ page }) => {
  await page.goto("/#/");
  await page.click("#langBtn");
  await expect(page.locator(".main-nav a").first()).toHaveText("Home");
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

  await expect(page.locator("#toTop")).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, 1500));
  await expect(page.locator("#toTop")).toBeVisible();
  await page.click("#toTop");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("rota antiga e rota inexistente se comportam", async ({ page }) => {
  await page.goto("/#/design-system");
  await expect(page).toHaveURL(/#\/$/);
  await page.goto("/#/nao-existe");
  await expect(page.locator("main .empty strong")).toBeVisible();
});

test("menu Exemplos lista as páginas de exemplo e a informação do tema segue o tema escolhido", async ({ page }) => {
  await page.goto("/#/");
  await page.click("#examplesBtn");
  await expect(page.locator("#examplesMenu a")).toHaveText(["Blog", "Tabela", "Formulário", "Dashboard", "Loja"]);
  await page.keyboard.press("Escape");
  await expect(page.locator("#examplesMenu")).toBeHidden();

  // escolhe outro tema; "Informações do tema" passa a apontar para ele
  await page.click(".combobox-btn");
  await page.keyboard.type("tesla");
  await page.keyboard.press("Enter");
  await page.click("#navTheme");
  await expect(page).toHaveURL(/#\/design-system\/tesla$/);
  await expect(page.locator("#navTheme")).toHaveAttribute("aria-current", "page");
});

test("dashboard desenha os gráficos em SVG", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/#/");
  await page.click("#examplesBtn");
  await page.click('#examplesMenu a[href="#/dashboard"]');
  await expect(page).toHaveURL(/#\/dashboard$/);
  await expect(page.locator(".widget")).toHaveCount(6);
  await expect(page.locator(".widget svg.chart")).toHaveCount(4);
  await expect(page.locator("#examplesBtn")).toHaveAttribute("aria-current", "page");
  expect(problems).toEqual([]);
});

test("loja: categorias, ordenação e carrinho", async ({ page }) => {
  await page.goto("/#/loja");
  await expect(page.locator(".product")).toHaveCount(12);
  await page.locator('.shop-nav a:has-text("Ipsum")').click();
  await expect(page).toHaveURL(/#\/loja\/ipsum$/);
  await expect(page.locator(".product")).toHaveCount(3);
  await page.selectOption("#shopSort", "price-asc");
  const prices = await page.locator(".product .price strong").allInnerTexts();
  const nums = prices.map((t) => parseFloat(t.replace(/[^\d,]/g, "").replace(",", ".")));
  expect(nums).toEqual([...nums].sort((a, b) => a - b));
  await page.locator("[data-add]").first().click();
  await expect(page.locator("#cartCount")).toHaveText("1");
  await expect(page.locator(".thumb svg.no-image").first()).toBeVisible();
});
