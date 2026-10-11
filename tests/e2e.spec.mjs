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
  // aviso de que os exemplos não usam UI kit, com link para a documentação em outra janela
  const doc = page.locator(".hero a[target=_blank]");
  await expect(doc).toHaveAttribute("href", /open-design\.ai/);
  await expect(doc).toHaveAttribute("rel", /noopener/);
  await expect(doc).toContainText("abre em outra janela");
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
  await page.click('#recordForm button[data-submit]');
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
  await expect(page.locator("#examplesMenu a")).toHaveText(["Institucional", "Blog", "Tabela", "Formulário", "Dashboard", "Loja", "Login"]);
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
  // ícone de carrinho à direita do rótulo do botão
  await expect(page.locator("[data-add] svg.cart-icon").first()).toBeVisible();
});

test("página institucional tem as seções e o contato de mentira", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/#/");
  await page.click("#examplesBtn");
  await page.click('#examplesMenu a[href="#/institucional"]');
  await expect(page).toHaveURL(/#\/institucional$/);
  for (const id of ["sobre", "valores", "servicos", "opinioes", "chamada", "contato"]) {
    await expect(page.locator("#" + id)).toBeVisible();
  }
  await expect(page.locator(".info-card.service")).toHaveCount(6);
  await expect(page.locator(".quote")).toHaveCount(3);
  await page.fill('.contact-form input[name="nome"]', "Maria");
  await page.click(".contact-form button[data-submit]");
  await expect(page.locator(".contact-form .form-alert")).toBeVisible();
  expect(page.url()).toMatch(/#\/institucional$/);
  expect(problems).toEqual([]);
});

test("entrar: login, esqueci minha senha e nova senha", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/#/entrar");
  await expect(page.locator(".logo-frame").first()).toBeVisible();
  // seletor no quadro da esquerda; OAuth só com ícone e SSO como link
  await expect(page.locator(".auth-aside #authStates")).toBeVisible();
  await expect(page.locator(".auth-aside .auth-demo")).toContainText("demonstração de layout");
  await expect(page.locator(".oauth")).toHaveCount(3);
  await expect(page.locator(".oauth").first()).toHaveAttribute("aria-label", /Google/);
  await expect(page.locator(".sso-link")).toContainText("SSO");

  // login: valida e confirma
  await page.click('.auth-form button[data-submit]');
  await expect(page.locator(".auth-form .form-alert")).toHaveClass(/error/);
  await page.fill('input[name="email"]', "maria@example.com");
  await page.fill('input[name="senha"]', "segredo");
  await page.click('.auth-form button[data-submit]');
  await expect(page.locator(".auth-form .form-alert")).toHaveClass(/success/);

  // mostrar/ocultar senha
  await page.click("[data-toggle-pw]");
  await expect(page.locator('input[name="senha"]')).toHaveAttribute("type", "text");

  // criar conta: nome, e-mail e senha, e avisa do e-mail de confirmação
  await page.click('[data-auth-go="signup"]');
  await expect(page).toHaveURL(/#\/entrar\/cadastro$/);
  await expect(page.locator(".mail-note")).toContainText("e-mail");
  await page.click(".auth-form button[data-submit]");
  await expect(page.locator(".auth-form .form-alert")).toHaveClass(/error/);
  await page.fill('input[name="nome"]', "Maria Lorem");
  await page.fill('input[name="email"]', "maria@example.com");
  await page.fill('input[name="senha"]', "curta");
  await page.click(".auth-form button[data-submit]");
  await expect(page.locator(".field .error")).toBeVisible();
  await page.fill('input[name="senha"]', "segredo123");
  await page.keyboard.press("Enter"); // o Enter no campo também envia
  await expect(page.locator(".auth-form .form-alert")).toContainText("maria@example.com");
  await page.click('[data-auth-go="login"]');

  // esqueci minha senha: pelo link e envia o código
  await page.click('[data-auth-go="forgot"]');
  await expect(page).toHaveURL(/#\/entrar\/esqueci$/);
  await page.fill('input[name="email"]', "maria@example.com");
  await page.click('.auth-form button[data-submit]');
  await expect(page.locator(".auth-form .form-alert")).toHaveClass(/success/);

  // nova senha: pelo seletor de estados
  await page.locator('#authStates label:has-text("Nova senha")').click();
  await expect(page).toHaveURL(/#\/entrar\/nova-senha$/);
  await page.click('.auth-form button[data-submit]');
  await expect(page.locator(".otp-field .error")).toBeVisible();
  await page.locator(".otp-digit").first().click();
  await page.keyboard.type("123456");
  await page.fill('input[name="nova"]', "Segredo1");
  await page.fill('input[name="confirma"]', "Outra123");
  await page.click('.auth-form button[data-submit]');
  await expect(page.locator(".auth-form .form-alert")).toHaveClass(/error/);
  await page.fill('input[name="confirma"]', "Segredo1");
  await page.click('.auth-form button[data-submit]');
  await expect(page.locator(".auth-form .form-alert")).toHaveClass(/success/);
  expect(problems).toEqual([]);
});

test("rodapé: autoria, licenças e privacidade, com o tema selecionado", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/#/");
  await expect(page.locator(".site-footer")).toContainText("Site desenvolvido por Jonas Sene Torres");

  // escolhe um tema e abre as páginas do rodapé: o tema continua valendo
  await page.click(".combobox-btn");
  await page.keyboard.type("bugatti");
  await page.keyboard.press("Enter");
  await page.click('.footer-nav a[href="#/licencas"]');
  await expect(page).toHaveURL(/#\/licencas$/);
  await expect(page.locator("main h1")).toHaveText("Licenças e créditos");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "bugatti");
  await expect(page.locator(".legal section")).toHaveCount(5);
  await expect(page.locator('.legal a[target="_blank"]').first()).toHaveAttribute("rel", /noopener/);

  await page.click('.footer-nav a[href="#/privacidade"]');
  await expect(page).toHaveURL(/#\/privacidade$/);
  await expect(page.locator("main h1")).toHaveText("Privacidade e LGPD");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "bugatti");
  expect(problems).toEqual([]);
});

test("nenhum botão de envio usa type=submit", async ({ page }) => {
  for (const route of ["#/", "#/blog", "#/tabela", "#/formulario", "#/institucional", "#/dashboard", "#/entrar", "#/entrar/cadastro", "#/entrar/esqueci", "#/entrar/nova-senha"]) {
    await page.goto("/" + route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator('button[type="submit"], input[type="submit"]')).toHaveCount(0);
  }
});

test("aviso de fontes proprietárias aparece só nos temas que têm", async ({ page }) => {
  await page.goto("/#/");
  await expect(page.locator("#fontNotice")).toBeHidden(); // tema padrão: fontes abertas

  await page.click(".combobox-btn");
  await page.keyboard.type("bugatti");
  await page.keyboard.press("Enter");
  const notice = page.locator("#fontNotice");
  await expect(notice).toBeVisible();
  await expect(notice).toContainText("fontes proprietárias");
  await expect(notice).toContainText("Bugatti");

  // o aviso acompanha a página do tema em prévia, e fecha
  await page.goto("/#/design-system/padrao");
  await expect(notice).toBeHidden();
  await page.goto("/#/design-system/bmw");
  await expect(notice).toBeVisible();
  await page.click("[data-close-notice]");
  await expect(notice).toBeHidden();
});

test("aviso de contraste lista os tokens ajustados e fecha", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/#/");
  const notice = page.locator("#contrastNotice");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "padrao");
  await expect(notice).toBeHidden(); // o padrão é do projeto: ajusta o contraste, mas não avisa

  await page.goto("/#/design-system/github");
  await expect(notice).toBeVisible();
  await expect(notice).toContainText("4,5:1");
  await expect(notice).toContainText("WCAG 2.2");

  await page.goto("/#/design-system/airbnb");
  await notice.locator("summary").click();
  const solid = notice.locator("li", { hasText: "Botão principal" });
  await expect(solid).toBeVisible();
  await expect(solid).toContainText("texto"); // no Airbnb a cor fica e só o texto do botão muda

  await page.click("#contrastNotice [data-close-notice]");
  await expect(notice).toBeHidden();
  expect(problems).toEqual([]);
});

test("botão sol/lua só funciona nos temas com variante clara/escura", async ({ page }) => {
  const problems = watch(page);
  const btn = page.locator("#schemeBtn");
  const bg = () => page.evaluate(() => getComputedStyle(document.body).getPropertyValue("--bg").trim());

  await page.goto("/?tema=airbnb#/");
  await expect(btn).toHaveAttribute("aria-disabled", "true"); // Airbnb: sem variante
  await expect(btn).toHaveAttribute("title", /não tem variante/);

  await page.goto("/?tema=padrao#/"); // o Padrão tem variante escura própria
  await expect(btn).toHaveAttribute("aria-disabled", "false");

  await page.goto("/#/design-system/github");
  await expect(btn).toHaveAttribute("aria-disabled", "false");
  expect(await bg()).toBe("#ffffff");
  await btn.click();
  await expect(page.locator("html")).toHaveAttribute("data-scheme", "dark");
  expect(await bg()).toBe("#0d1117");
  await expect(btn).toHaveAttribute("data-target", "light");

  // a escolha vale em outro tema com variante e é desfeita no clique seguinte
  await page.goto("/#/design-system/perplexity");
  await expect(btn).toHaveAttribute("aria-disabled", "false");
  expect(await bg()).toBe("#0f0f10"); // base escura, escolha "dark": nada muda
  await btn.click();
  await expect(page.locator("html")).toHaveAttribute("data-scheme", "light");
  expect(await bg()).toBe("#ffffff");

  // tema sem variante: botão desabilitado e sem data-scheme
  await page.goto("/#/design-system/airbnb");
  await expect(btn).toHaveAttribute("aria-disabled", "true");
  await expect(page.locator("html")).not.toHaveAttribute("data-scheme", /.+/);
  expect(problems).toEqual([]);
});

test("tema na URL: link compartilhável, voltar desfaz a troca e o seletor acompanha", async ({ page }) => {
  const problems = watch(page);
  const pick = async (name) => {
    await page.click(".combobox-btn");
    await page.keyboard.type(name);
    await page.keyboard.press("Enter");
  };

  // abrir um link com tema aplica esse tema (a URL manda sobre o que ficou guardado)
  await page.goto("/?tema=bugatti#/loja");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "bugatti");
  await expect(page.locator(".combobox-label")).toContainText("Bugatti");

  // trocar de tema põe ?tema= na URL e navegar mantém o parâmetro
  await pick("tesla");
  await expect(page).toHaveURL(/\?tema=tesla#\/loja/);
  await page.click('.main-nav > a[href="#/"]');
  await expect(page).toHaveURL(/\?tema=tesla#\//);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "tesla");

  // voltar desfaz a troca de tema
  await pick("bmw");
  await expect(page).toHaveURL(/\?tema=bmw#\//);
  await page.goBack();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "tesla");
  await expect(page.locator(".combobox-label")).toContainText("Tesla");
  await expect(page).toHaveURL(/\?tema=tesla#\//);

  // sem o parâmetro vale o tema guardado, e a URL passa a ter o ?tema=
  await page.goto("/#/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "tesla");
  await expect(page).toHaveURL(/\?tema=tesla#\//);

  // tema inexistente na URL é ignorado
  await page.goto("/?tema=nao-existe#/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "tesla");

  // na página de um DS o seletor mostra o tema da prévia
  await page.goto("/?tema=tesla#/design-system/ferrari");
  await expect(page.locator(".combobox-label")).toContainText("Ferrari");
  expect(problems).toEqual([]);
});
