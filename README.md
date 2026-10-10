# Visualizador de DS — Open Design

SPA em HTML/CSS/JS puro (sem build nem framework) que apresenta um **catálogo navegável de 143 design systems** open-source, extraídos de <https://open-design.ai/plugins/systems/>.

Qualquer design system pode ser **aplicado como tema ao site inteiro** pelo seletor do topo: a mesma página muda de cara sem mudar o conteúdo. O tema padrão é o **Padrão** (uma cópia do Vercel).

Páginas:

| Rota | Conteúdo |
|---|---|
| `#/` | Início: hero e o catálogo de design systems, com busca e filtros por categoria (o Padrão vem primeiro; o tema ativo fica destacado) |
| `#/blog` | Blog: destaque e lista de artigos de exemplo |
| `#/artigo/<id>` | Artigo de exemplo em Lorem ipsum, com barra lateral de blog genérico (busca e links sem função; o menu destaca "Blog") |
| `#/design-system` | Atalho antigo: redireciona para `#/` |
| `#/design-system/<id>` | Detalhes do DS: paleta 50–950, tipografia e fontes, tokens e o guia completo. A página é exibida com o próprio tema, como prévia |
| `#/tabela` | Tabela CRUD de exemplo (salva no `localStorage`), com seletor de estado: dados, carregando, vazio e erro; itens depreciados não podem ser editados |
| `#/formulario` | Um campo de cada tipo de entrada, mais os estados: erro, ajuda, desabilitado, somente leitura, botões, alertas e carregamento |

## Estrutura

```
index.html              página única (router por hash) e diálogos da tabela
assets/
  app.js                SPA: textos da interface (dicionário UI), artigos, roteador e telas
  styles.css            estilos do produto (usam só as variáveis do tema)
  themes.css            valores-base das variáveis (fallback antes de o tema carregar)
  logo.svg
  fonts/                fontes dos temas (woff2, self-host) e manifest.json
data/
  systems-raw.json      lista do catálogo (nome, categoria, link) extraída de open-design.ai (entrada do build)
  ds/index.json         lista dos DS na ordem do seletor: nome, categoria, tagline e cores (~68 KB)
  ds/<id>.<lang>.json   detalhes de cada DS, um arquivo por idioma (en-US e pt-BR), minificado; carregado só ao abrir a página dele (~26 KB em média)
  themes/<id>.css       tema de cada DS: @import das fontes + variáveis CSS (carregado ao aplicar o tema)
i18n/pt-BR/<slug>.html  traduções do conteúdo de cada DS
scripts/
  build_ds_fetch.py     baixa a página de cada DS para .cache/pages/
  build_fonts.py        baixa as fontes do Google Fonts usadas pelos temas para assets/fonts/
  build_ds_details.py   gera data/ds/*.<lang>.json e data/themes/*.css a partir de .cache/pages/ + i18n/
package.json            scripts npm (ver abaixo)
docs/historico/         registros antigos (handoff do Open Design, pedidos já concluídos)
.cache/                 páginas baixadas do open-design.ai (pages/) e cache do Google Fonts
```

## Como rodar

O navegador **bloqueia `fetch()` em páginas abertas por `file://`**, então o site precisa de um servidor local. Sem ele, aparece o aviso "Catálogo indisponível".

Com Node.js:

```powershell
cd ds-viewer-open-design
npm install     # só na primeira vez (instala o http-server)
npm start       # http://127.0.0.1:8317 (sem cache)
```

Sem instalar nada:

```powershell
npx http-server -p 8317 -c-1 .
python -m http.server 8317
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm start` | Sobe o site em http://127.0.0.1:8317 |
| `npm run data:fetch` | Baixa a página de cada DS de `data/systems-raw.json` para `.cache/pages/` (pula o que já existe) |
| `npm run data:fonts` | Baixa para `assets/fonts/` as fontes do Google Fonts usadas pelos temas (só o subconjunto `latin`, normal e itálico) e grava `manifest.json`. Rode antes do `data:update` |
| `npm run data:update` | Regera `data/ds/*.<lang>.json` e `data/themes/*.css` a partir de `.cache/pages/` e das traduções em `i18n/` |
| `npm run check` | Confere a consistência dos dados (`scripts/check_data.py`) e o HTML dos guias (`scripts/check_html.py`) |
| `npm run check:html` | Só a conferência do HTML dos guias |
| `npm run test:e2e` | Testes E2E básicos (Playwright, `tests/e2e.spec.mjs`). Sem baixar navegador: `PW_CHANNEL=msedge npm run test:e2e` |
| `npm run audit:themes` | Abre cada tema nas telas principais (desktop e celular) e mede contraste, rolagem horizontal, erros e fontes. Leva ~20 min; `-- --only <ids>` limita. Depois, `python scripts/review_styles.py <json>` gera `docs/revisao-estilos.md` |
| `npm run verify:upstream` | Compara os tokens com o `tokens.css` do repositório do Open Design (ver o topo de `scripts/verify_upstream.py`) |
| `npm run i18n:template -- <slug> [lang]` | Gera `i18n/<lang>/<slug>.html` (padrão `pt-BR`) com o texto em inglês, pronto para traduzir |

`data:update` precisa do `.cache/pages/`. A pasta pode ser apagada, mas depois é preciso rodar `data:fetch` de novo antes de regerar os dados.

> **Atenção:** rode sempre `npm run data:update` sem argumentos. `python scripts/build_ds_details.py <id> ...` reconstrói só os ids informados e **reescreve o `index.json` só com eles**.

## Atualizando o catálogo

O catálogo é uma **cópia datada** (2026-10-10) do open-design.ai, mantida à mão: não há script que a raspe do site, e não é preciso, porque o dado versionado aqui é o que o site usa. Para incluir ou trocar um design system:

1. Edite `data/systems-raw.json` (lista do catálogo). Cada item tem `name`, `category`, `href`, `tagline` e os dados do card (`preview`). A lista completa de pacotes do Open Design está em [`design-systems/`](https://github.com/nexu-io/open-design/tree/main/design-systems) do repositório deles, que é a melhor base para isso.
2. `npm run data:fetch` para baixar as páginas novas.
3. Para cada DS novo, gere e traduza o arquivo de i18n (ver abaixo).
4. `npm run data:update` (cria os temas e os dados) e, se houver fonte nova, `npm run data:fonts` seguido de `npm run data:update` de novo.

## Testes e publicação

O workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) roda a cada push e pull request:

1. `node --check assets/app.js`
2. `python scripts/check_data.py`: cada DS do índice tem JSON e tema, sem `@import` externo, fontes existentes, paletas 50–950, seções em pt-BR e en-US
3. `python scripts/check_html.py`: só tags e atributos permitidos nos guias
4. `npm run test:e2e`: 9 cenários básicos no Chromium (início e catálogo, busca, página de DS com tema, seletor de temas, blog e artigo, tabela e seus estados, formulário, idioma e botão de topo, rotas antigas e inexistentes). Também falha se alguma tela der erro de JS, resposta 4xx/5xx ou pedir algo ao Google

Na branch `main`, se os testes passarem, ele publica no **GitHub Pages** só o que o navegador usa (`index.html`, `assets/`, `data/ds/` e `data/themes/`, cerca de 12 MB). Para ativar: no repositório, **Settings → Pages → Build and deployment → Source: GitHub Actions**. O site funciona em subcaminho (`usuario.github.io/ds-viewer-open-design/`), porque todos os endereços são relativos.

## Temas

Cada DS vira um arquivo `data/themes/<id>.css` com as fontes (`@font-face` apontando para `assets/fonts/`) e as variáveis CSS (`--bg`, `--fg`, `--accent`, `--radius`, `--font-display`…) em `[data-theme="<id>"] { … }`. O `styles.css` só usa essas variáveis, por isso qualquer tema funciona em qualquer página.

O tema padrão já vem linkado no `index.html`; os outros são carregados quando aplicados, e o site só troca de tema depois que o CSS chega, sem "piscar" o visual-base. O `assets/themes.css` guarda só os valores-base, usados se o CSS de um tema falhar.

Além das cores, cada tema leva os detalhes do guia que o site usa (seções 3 a 6), sempre limitados a faixas seguras e com o contraste garantido pelo build:

| Variáveis | Origem (token do DS) | Uso |
|---|---|---|
| `--fs-base`, `--fs-sm`, `--fs-xs`, `--fs-h1`, `--fs-h2`, `--fs-h3`, `--fs-hero` | `--text-*` | tamanhos do texto e dos títulos |
| `--lh-body`, `--lh-tight`, `--display-tracking` | `--leading-*`, `--tracking-display` | entrelinha e espaçamento entre letras dos títulos |
| `--container-max`, `--gutter`, `--gutter-tablet`, `--gutter-phone`, `--section-y`, `--section-y-tablet` | `--container-*`, `--section-y-*` | largura, margens e respiro de seção |
| `--radius-lg`, `--focus-ring`, `--motion-fast`, `--motion-base`, `--ease` | `--radius-lg`, `--focus-ring`, `--motion-*`, `--ease-standard` | cantos grandes, anel de foco e movimento |
| `--solid`, `--solid-fg`, `--solid-hover` | `--accent`, `--accent-on`, `--accent-hover` | botão principal: o par do DS, ou ajustado se não passar de 4,5:1 |
| `--accent-strong`, `--muted`, `--fg-soft`, `--meta` | `--accent`, `--muted`, `--fg-2`, `--meta` | links, kicker e textos secundários, garantidos acima de 4,7:1 sobre fundo, superfície e fundo secundário |
| `--surface-2`, `--border-soft` | `--surface-warm`, `--border-soft` | fundo secundário (hero, cabeçalho de tabela) e divisórias suaves |

A revisão tema a tema (contraste, rolagem horizontal, fontes carregadas, o que foi ajustado em cada um) está em [`docs/revisao-estilos.md`](docs/revisao-estilos.md), gerada por `npm run audit:themes` e `scripts/review_styles.py`.

Cada tema também gera cores de feedback legíveis: `--ok-ink`, `--warn-ink` e `--danger-ink` (a cor do tema misturada com `--fg` até passar de 4,5:1 sobre o fundo, a superfície e o fundo suave do alerta) e `--ok-fg`, `--danger-fg` (texto sobre botões preenchidos). Quando o texto do tema não é legível sobre a superfície do DS (caso do PlayStation, com superfície branca e texto branco), o build deriva uma superfície a partir do fundo.

Além disso, cada tema expõe dois tons da paleta, usados no header e no footer:

| Variável | Uso | Fallback |
|---|---|---|
| `--primary-500` / `--primary-500-fg` | fundo e texto do header | `--bg` / `--fg` |
| `--neutral-400` / `--neutral-400-fg` | fundo e texto do footer | `--bg` / `--fg` |

As cores `-fg` são `#111111` ou branco, a que tiver mais contraste com o fundo; o pior caso no catálogo é 4,77:1, acima do mínimo AA. Por isso o texto do header e do footer não deve ganhar transparência nem ser misturado com o fundo.

### Ajustes para um tema específico

O `<body>` recebe a classe `theme-<id>` do tema ativo (inclusive na prévia de uma página de DS). Use um seletor composto para corrigir um tema sem afetar os outros:

```css
body.theme-airbnb .site-header { /* só no tema Airbnb */ }
```

## Traduções (i18n)

O botão de idioma do topo alterna pt-BR / en-US (o padrão segue o idioma do sistema; a escolha fica no `localStorage`).

- **Interface:** dicionário `UI` em `assets/app.js`. Todas as páginas estão em pt-BR e en-US.
- **Conteúdo dos DS:** vem do open-design.ai em inglês. As traduções ficam em `i18n/<idioma>/<slug>.html`:

  ```html
  <p data-field="tagline">Tagline traduzida.</p>
  <section data-section="visual-theme-atmosphere">
  <h2>Tema visual e atmosfera</h2>
  …conteúdo traduzido…
  </section>
  ```

  Para traduzir um DS:
  1. `npm run i18n:template -- <slug>` (ex.: `airbnb`).
  2. Traduza só o texto; mantenha as tags, os `data-section`, os `<code>` e os valores.
  3. Remova o marcador `TRADUCAO-PENDENTE` do arquivo. Enquanto ele existir, o arquivo é ignorado.
  4. `npm run data:update`. Seções sem tradução continuam em inglês.

  Todos os 143 DS já estão traduzidos para pt-BR (o Padrão usa a tradução de `vercel`).
- **Artigos:** o conteúdo é Lorem ipsum (autor: Jonas Torres), igual em qualquer idioma; só os rótulos da interface são traduzidos. A barra lateral do blog (busca, categorias, posts recentes e tags) é de enfeite, com links sem destino.

## Categorias

As categorias vêm do open-design.ai e são traduzidas pelo mapa `CAT_PT` em `scripts/build_ds_details.py`; a ordem fica em `CATEGORY_ORDER`. Categorias novas viram automaticamente filtros na página de Design System e grupos no seletor do topo.

## Créditos

- Catálogo e conteúdo dos design systems: [open-design.ai](https://open-design.ai/plugins/systems/)
- Interface, artigos e conteúdo editorial: projeto Open Design.

## Licenças

| Parte | Licença |
|---|---|
| Código deste visualizador (`index.html`, `assets/`, `scripts/`) | [MIT](LICENSE) |
| Catálogo e temas dos design systems (`data/`, `i18n/`) | [Apache License 2.0](LICENSE-OPEN-DESIGN), do Open Design (© 2026 Open Design contributors), ver origem abaixo |

### Origem dos temas

O [Open Design](https://github.com/nexu-io/open-design) (ferramenta colaborativa de design assistido por IA) é licenciado sob a Apache License 2.0; uma cópia do texto está em [LICENSE-OPEN-DESIGN](LICENSE-OPEN-DESIGN). O projeto não publica um arquivo `NOTICE`. **Cada tema deste site foi retirado, no estado em que está, da documentação do Open Design**: nomes, categorias, cores, fontes, tokens e o texto dos guias vêm de lá, sem alteração de valores.

O que este projeto acrescenta, e que não faz parte da documentação original:

- as escalas de cor 50–950, **derivadas** das cores informadas (os degraus exatos aparecem marcados na paleta);
- a conversão dos tokens em variáveis CSS (`data/themes/<id>.css`);
- as traduções para pt-BR (`i18n/pt-BR/`);
- a interface, os artigos de exemplo, a tabela e o formulário.

Em conformidade com a Apache 2.0: o conteúdo do Open Design mantém a licença e os avisos de autoria originais, e as alterações acima estão declaradas.

### Fontes originais do catálogo

Verificado no repositório [nexu-io/open-design](https://github.com/nexu-io/open-design) (licença `Apache-2.0` confirmada pela API do GitHub):

- Os 142 design systems deste catálogo (todos, exceto o **Padrão**, que é uma cópia do Vercel) existem em `design-systems/<id>/` do repositório.
- O `manifest.json` de cada um deles declara a origem `OpenDesign curated bundled fixture`, ou seja, material curado e incluído pelo próprio projeto. Nenhum pacote do repositório traz arquivo de licença próprio.
- Só dois pacotes do Open Design declaram origem externa, e **nenhum está neste catálogo**: `cloudflare-kumo` (integração de [`cloudflare/kumo`](https://github.com/cloudflare/kumo), MIT) e `tom-modern` ([`Tom-Opencart/tom-modern-html-style-rule`](https://github.com/Tom-Opencart/tom-modern-html-style-rule)).

Os dados aqui foram extraídos das páginas do open-design.ai. Em 2026-10-10 eles foram conferidos contra o repositório: os 7.526 tokens (`data/ds/*.en-US.json`) são idênticos aos de `design-systems/<id>/tokens.css`, e o texto dos guias coincide com o `DESIGN.md` de cada pacote. A única diferença encontrada vinha do site, que ofusca e-mails (Cloudflare); o build agora os decodifica. Para refazer a conferência: `npm run verify:upstream` (ver o topo de `scripts/verify_upstream.py`). Ao reutilizar um tema fora deste visualizador, consulte o pacote correspondente no repositório do Open Design.

### Fontes

As fontes dos temas são servidas pelo próprio site, em `assets/fonts/` (woff2, só o subconjunto `latin`, que cobre pt-BR e en-US), então a página não faz nenhuma requisição ao Google. Elas vêm do Google Fonts e mantêm as licenças originais de cada família (OFL, Apache 2.0 ou Ubuntu Font License). Se `assets/fonts/manifest.json` não tiver uma família, o tema volta a usar o `@import` do Google para ela.

### Marcas

Muitos design systems do catálogo descrevem a identidade visual de empresas e produtos (Airbnb, Starbucks, Vercel etc.). Como o próprio Open Design declara, os pacotes que referenciam marcas são **inspirações estéticas, não ativos oficiais** dessas marcas. Nomes e marcas pertencem aos seus titulares. A Apache 2.0 não concede direitos sobre marcas (seção 6), e este projeto **não tem vínculo, patrocínio nem endosso** de nenhuma delas.
