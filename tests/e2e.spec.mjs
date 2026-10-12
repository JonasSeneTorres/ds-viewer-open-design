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
  // texto de apresentação: links para o Open Design, o site do Maujor, o CSS Zen Garden e o repositório, em outra janela
  await expect(page.locator(".hero p.lede")).toHaveCount(5);
  await expect(page.locator(".hero")).toContainText("Maujor");
  await expect(page.locator(".hero")).toContainText("nenhum UI Kit nem biblioteca de componentes");
  const links = page.locator(".hero a[target=_blank]");
  await expect(links).toHaveCount(4);
  await expect(links.nth(0)).toHaveAttribute("href", /open-design\.ai/);
  await expect(links.nth(1)).toHaveAttribute("href", "https://maujor.com/");
  await expect(links.nth(2)).toHaveAttribute("href", "https://csszengarden.com/");
  await expect(links.nth(3)).toHaveAttribute("href", "https://github.com/JonasSeneTorres/ds-viewer-open-design");
  for (const i of [0, 1, 2, 3]) {
    await expect(links.nth(i)).toHaveAttribute("rel", /noopener/);
    await expect(links.nth(i)).toContainText("abre em outra janela");
  }
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
  await page.click("#themePicker .combobox-btn");
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
  // a tabela pagina de 5 em 5: 11 registros em 3 páginas, e o novo registro está na última
  await expect(page.locator("#tableBody tr")).toHaveCount(5);
  await expect(page.locator("#tablePagination .pagination")).toBeVisible();
  await expect(page.locator("#tablePagination .pag-status")).toContainText("de 3");
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
  await expect(page.locator("#examplesMenu a")).toHaveText(["Institucional", "Blog", "Tabela", "Formulário", "Componentes", "Dashboard", "Loja", "Login"]);
  await page.keyboard.press("Escape");
  await expect(page.locator("#examplesMenu")).toBeHidden();

  // escolhe outro tema; "Informações do tema" passa a apontar para ele
  await page.click("#themePicker .combobox-btn");
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
  await page.click("#themePicker .combobox-btn");
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

  await page.click("#themePicker .combobox-btn");
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
  await notice.locator(".acc-btn").click();
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
  await expect(page.locator("#schemeTip")).toHaveText(/não tem variante/);

  await page.goto("/?tema=padrao#/"); // o Padrão tem variante escura própria
  await expect(btn).toHaveAttribute("aria-disabled", "false");

  await page.goto("/#/design-system/github");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "github"); // o tema só troca quando o CSS chega
  await expect(btn).toHaveAttribute("aria-disabled", "false");
  expect(await bg()).toBe("#ffffff");
  await btn.click();
  await expect(page.locator("html")).toHaveAttribute("data-scheme", "dark");
  expect(await bg()).toBe("#0d1117");
  await expect(btn).toHaveAttribute("data-target", "light");

  // a escolha vale em outro tema com variante e é desfeita no clique seguinte
  await page.goto("/#/design-system/perplexity");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "perplexity");
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
    await page.click("#themePicker .combobox-btn");
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

test("o botão de abrir no open-design só aparece nos DS que existem lá", async ({ page }) => {
  await page.goto("/#/design-system/padrao"); // o Padrão é do projeto
  await expect(page.locator(".ds-actions .btn-primary")).toBeVisible();
  await expect(page.locator(".ds-actions a")).toHaveCount(0);

  await page.goto("/#/design-system/airbnb");
  await expect(page.locator('.ds-actions a[target="_blank"]')).toHaveCount(1);
});

test("metatags acompanham a rota", async ({ page }) => {
  // as tags são atualizadas pelo JavaScript depois da navegação: espera com repetição, sem ler na hora
  const meta = (sel) => page.locator(`head meta[${sel}]`);
  await page.goto("/#/");
  await expect(meta('name="description"')).toHaveAttribute("content", /143 design systems/);
  const home = await meta('property="og:title"').getAttribute("content");

  await page.goto("/#/tabela");
  await expect(page.locator("main h1")).toBeVisible();
  await expect(meta('name="description"')).toHaveAttribute("content", /CRUD/);
  await expect(meta('property="og:title"')).not.toHaveAttribute("content", home);
  await expect(meta('property="og:url"')).toHaveAttribute("content", /#\/tabela$/);

  // na página de um DS, a descrição é o resumo dele
  await page.goto("/#/design-system/bugatti");
  await expect(page.locator(".ds-full h1")).toBeVisible();
  await expect(meta('name="description"')).toHaveAttribute("content", /hipercarros/); // o resumo do Bugatti
  await expect(meta('property="og:image"')).toHaveAttribute("content", /\/assets\/og\.png$/);
});

test("componentes: abas, accordion, toast, tooltip e paginação", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/#/componentes");
  await expect(page.locator("main h1")).toHaveText("Componentes");

  // abas: clique e setas
  const tab1 = page.locator("#tab0");
  await expect(tab1).toHaveAttribute("aria-selected", "true");
  await page.locator("#tab1").click();
  await expect(page.locator("#tabpanel1")).toBeVisible();
  await expect(page.locator("#tabpanel0")).toBeHidden();
  await page.locator("#tab1").press("ArrowRight");
  await expect(page.locator("#tab2")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#tab2")).toBeFocused();
  await page.locator("#tab2").press("Home");
  await expect(page.locator("#tab0")).toHaveAttribute("aria-selected", "true");

  // accordion: abre e fecha
  const acc = page.locator("#acc1");
  await expect(acc).toHaveAttribute("aria-expanded", "false");
  await acc.click();
  await expect(acc).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#acc1Panel")).toBeVisible();
  await acc.click();
  await expect(page.locator("#acc1Panel")).toBeHidden();

  // toast: aparece, tem região viva e fecha
  await page.locator('[data-toast="ok"]').click();
  const toast = page.locator("#toastRegion .toast");
  await expect(toast).toHaveCount(1);
  await expect(page.locator("#toastRegion")).toHaveAttribute("aria-live", "polite");
  await toast.locator(".toast-close").click();
  await expect(toast).toHaveCount(0);

  // tooltip: abre com o foco e Esc dispensa
  await page.locator('[aria-describedby="tip1"]').focus();
  await expect(page.locator("#tip1")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#tip1")).toBeHidden();

  // paginação: próxima, página atual e limites
  const pag = page.locator("#demoPagination");
  await expect(pag.locator('[aria-current="page"]')).toHaveText("1");
  await expect(pag.locator('[data-page="0"]')).toBeDisabled();
  await pag.locator('[data-page="2"]').first().click();
  await expect(pag.locator('[aria-current="page"]')).toHaveText("2");
  await expect(pag.locator(".pag-status")).toContainText("Página 2 de 12");
  expect(problems).toEqual([]);
});

test("tema Urdu: direção da direita para a esquerda e sem rolagem horizontal", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/?tema=urdu#/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "urdu");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  for (const route of ["#/", "#/tabela", "#/formulario", "#/loja", "#/componentes", "#/institucional", "#/entrar"]) {
    await page.goto("/?tema=urdu" + route);
    await expect(page.locator("main")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow, `rolagem horizontal em ${route}`).toBe(false);
  }
  // o botão voltar do menu e os campos seguem a direção
  expect(await page.locator("body").evaluate((e) => getComputedStyle(e).direction)).toBe("rtl");

  // outro tema volta para a esquerda
  await page.goto("/?tema=padrao#/");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  expect(problems).toEqual([]);
});

test("componentes: visão de código com abas HTML, CSS e JavaScript", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/#/componentes");
  await expect(page.locator(".comp-note")).toContainText("nenhuma lib ou UI Kit");

  // um botão por cartão
  await expect(page.locator(".code-btn")).toHaveCount(5);

  await page.locator('[data-code="tabs"]').click();
  const dialog = page.locator("dialog.dialog-code");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("#codeTitle")).toContainText("Abas");
  await expect(dialog.locator('[role="tab"]')).toHaveText(["HTML", "CSS", "JavaScript"]);

  // HTML: o markup da página
  await expect(dialog.locator("#codeText-html")).toContainText('role="tablist"');
  await expect(dialog.locator("#codeText-html")).toContainText("aria-selected");

  // CSS e JavaScript: lidos dos arquivos publicados
  await dialog.locator("#codeTab-css").click();
  await expect(dialog.locator("#codePanel-css")).toBeVisible();
  await expect(dialog.locator("#codeText-css")).toContainText(".tab");
  await dialog.locator("#codeTab-css").press("ArrowRight");
  await expect(dialog.locator("#codeTab-js")).toHaveAttribute("aria-selected", "true");
  await expect(dialog.locator("#codeText-js")).toContainText("function mountTabs");

  // Esc fecha e devolve o foco ao botão
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.locator('[data-code="tabs"]')).toBeFocused();

  // outro componente traz o próprio código
  await page.locator('[data-code="pagination"]').click();
  await expect(dialog.locator("#codeTitle")).toContainText("Paginação");
  await dialog.locator("#codeTab-js").click();
  await expect(dialog.locator("#codeText-js")).toContainText("function paginationHTML");
  expect(problems).toEqual([]);
});

test("os componentes valem no site todo: tooltips, toasts, paginação e accordion", async ({ page }) => {
  const problems = watch(page);

  // cabeçalho: tooltip no mesmo padrão (sem title nativo)
  await page.goto("/?tema=github#/");
  await expect(page.locator("#schemeBtn")).not.toHaveAttribute("title", /.+/);
  await expect(page.locator("#langBtn")).not.toHaveAttribute("title", /.+/);
  await page.locator("#langBtn").focus();
  await expect(page.locator("#langTip")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#langTip")).toBeHidden();
  await page.locator("#schemeBtn").focus();
  await expect(page.locator("#schemeTip")).toContainText("modo escuro");

  // tabela: paginação e toast ao excluir
  await page.goto("/#/tabela");
  await expect(page.locator("#tableBody tr")).toHaveCount(5);
  await page.locator('#tablePagination [data-page="2"]').first().click();
  await expect(page.locator("#tablePagination [aria-current='page']")).toHaveText("2");
  await page.locator('#tableBody [data-action="delete"]').first().click();
  await page.click("#confirmDelete");
  await expect(page.locator("#toastRegion .toast")).toContainText("excluído");

  // item depreciado: Editar fica focável (aria-disabled) e explica o motivo no tooltip
  const dep = page.locator('[data-action="edit"][aria-disabled="true"]').first();
  await dep.focus();
  await expect(page.locator(".tip-wrap:focus-within .tip")).toBeVisible();

  // loja: adicionar ao carrinho avisa com toast
  await page.goto("/#/loja");
  await page.locator("[data-add]").first().click();
  await expect(page.locator("#toastRegion .toast")).toContainText("carrinho");

  // licenças: o texto da MIT é um accordion
  await page.goto("/#/licencas");
  await page.locator("#mitAcc").click();
  await expect(page.locator("#mitAccPanel pre")).toBeVisible();
  expect(problems).toEqual([]);
});

test("abas não têm barra de rolagem vertical, no cartão nem no modal", async ({ page }) => {
  await page.goto("/#/componentes");
  const noVScroll = (sel) => page.locator(sel).first().evaluate((e) => e.scrollHeight <= e.clientHeight);
  expect(await noVScroll("#demoTabs .tablist")).toBe(true);

  await page.locator('[data-code="tabs"]').click();
  await expect(page.locator("dialog.dialog-code")).toBeVisible();
  expect(await noVScroll("#codeTablist")).toBe(true);
});

test("cabeçalho responsivo: hambúrguer, marca e claro/escuro em tela de tablet em pé (768 px) ou menor", async ({ page }) => {
  const problems = watch(page);

  // desktop: sem hambúrguer, tudo à vista
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/?tema=github#/");
  await expect(page.locator("#navToggle")).toBeHidden();
  await expect(page.locator(".main-nav > a").first()).toBeVisible();
  await expect(page.locator("#langBtn")).toBeVisible();

  // tablet em pé (768) e celular (390): só hambúrguer, marca e claro/escuro
  for (const width of [768, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/?tema=github#/");
    await expect(page.locator("#navToggle")).toBeVisible();
    await expect(page.locator(".brand")).toBeVisible();
    await expect(page.locator("#schemeBtn")).toBeVisible();
    await expect(page.locator(".main-nav")).toBeHidden();
    await expect(page.locator("#langBtn")).toBeHidden();
    await expect(page.locator("#themePicker")).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);

    // abrir: navegação, seletor de temas e idioma aparecem
    await page.click("#navToggle");
    await expect(page.locator("#navToggle")).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".main-nav")).toBeVisible();
    await expect(page.locator("#themePicker")).toBeVisible();
    await expect(page.locator("#langBtn")).toBeVisible();

    // Esc fecha e devolve o foco ao hambúrguer
    await page.keyboard.press("Escape");
    await expect(page.locator(".main-nav")).toBeHidden();
    await expect(page.locator("#navToggle")).toBeFocused();

    // escolher uma página fecha o painel
    await page.click("#navToggle");
    await page.locator('.main-nav > a[href="#/"]').click();
    await expect(page.locator(".main-nav")).toBeHidden();
  }

  // o menu Exemplos funciona dentro do painel
  await page.click("#navToggle");
  await page.click("#examplesBtn");
  await expect(page.locator("#examplesMenu")).toBeVisible();
  await page.locator('#examplesMenu a[href="#/blog"]').click();
  await expect(page).toHaveURL(/#\/blog$/);
  await expect(page.locator(".main-nav")).toBeHidden();
  expect(problems).toEqual([]);
});

test("o CSS de cada página vem sob demanda, antes de desenhar, e late.css fica por último", async ({ page }) => {
  const problems = watch(page);
  const cssRequests = [];
  page.on("request", (r) => {
    const m = r.url().match(/\/assets\/css\/([a-z]+)\.css$/);
    if (m) cssRequests.push(m[1]);
  });
  await page.goto("/#/");
  await expect(page.locator(".ds-card-cat")).toHaveCount(TOTAL);
  // a página inicial só precisa do núcleo, do catálogo e do arquivo tardio
  expect([...new Set(cssRequests)].sort()).toEqual(["core", "ds", "late"]);

  // outra rota: o arquivo dela é pedido e já está aplicado quando a página aparece
  await page.evaluate(() => { location.hash = "#/blog"; });
  await expect(page.locator(".featured")).toBeVisible();
  expect(cssRequests).toContain("blog");
  expect(cssRequests).not.toContain("shop");
  const featuredBg = await page.locator(".featured").evaluate((el) => getComputedStyle(el).display);
  expect(featuredBg).not.toBe("inline"); // com o CSS aplicado o destaque é um bloco/grade, não texto corrido

  // links inseridos em tempo de execução ficam antes de late.css
  const order = await page.evaluate(() =>
    [...document.head.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute("href")).filter((h) => h.includes("assets/css/")));
  expect(order[0]).toBe("assets/css/core.css");
  expect(order[order.length - 1]).toBe("assets/css/late.css");
  expect(order).toContain("assets/css/blog.css");
  expect(problems).toEqual([]);
});
