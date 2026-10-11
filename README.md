# Visualizador de DS — Open Design

**Site publicado:** <https://jonassenetorres.github.io/ds-viewer-open-design/>

SPA em HTML/CSS/JS puro (sem build nem framework) que apresenta um **catálogo navegável de 143 design systems** open-source, extraídos de <https://open-design.ai/plugins/systems/>.

Qualquer design system pode ser **aplicado como tema ao site inteiro** pelo seletor do topo: a mesma página muda de cara sem mudar o conteúdo. O tema padrão é o **Padrão**, uma mistura própria: paleta do Expo, bordas, sombras e animação do Vercel e fontes do Futuristic, com variante escura.

O cabeçalho tem três itens (e, à direita, o seletor de temas, o botão sol/lua e o de idioma): **Início** (a página inicial, com o catálogo), **Informações do tema** (a página do design system escolhido no seletor) e **Exemplos** (menu com Institucional, Blog, Tabela, Formulário, Dashboard, Loja e Login).

Páginas:

| Rota | Conteúdo |
|---|---|
| `#/` | Início: hero e o catálogo de design systems, com busca e filtros por categoria (o Padrão vem primeiro; o tema ativo fica destacado) |
| `#/institucional` | Página institucional genérica (a primeira dos exemplos): hero, sobre, valores, serviços, opiniões de clientes, chamada e contato fake. Faixas de largura total com fundos alternados (`--surface-2`, `--bg`, `--accent-weak` e `--solid`); imagens com o degradê e o ícone de imagem não encontrada. O conteúdo é Lorem ipsum: quem dita o estilo é o design system |
| `#/entrar`, `#/entrar/cadastro`, `#/entrar/esqueci` e `#/entrar/nova-senha` | Telas de autenticação da empresa fictícia "XPTO Ink" (logo do visualizador em contorno, numa moldura): login com botões de OAuth, criar conta (nome, e-mail e senha, avisando do e-mail de confirmação), esqueci minha senha e nova senha (código de 6 dígitos e a senha duas vezes, com requisitos). Seletor de estados igual ao da tabela; nada é enviado |
| `#/licencas` e `#/privacidade` | Páginas do rodapé (fora do menu Exemplos), com o tema selecionado: licenças e créditos (MIT, Apache 2.0 do Open Design, fontes, marcas) e privacidade/LGPD (o site não coleta nem envia dados; só guarda tema, idioma, modo claro/escuro e a tabela de exemplo no navegador, e os avisos dispensados na sessão) |
| `#/blog` | Blog: destaque e lista de artigos de exemplo, com barra lateral ilustrativa (busca, tópicos, últimos artigos, redes sociais, newsletter e nuvem de tags; nada nela funciona) |
| `#/artigo/<id>` | Artigo de exemplo em Lorem ipsum, com a mesma barra lateral de blog genérico (busca e links sem função; o menu destaca "Blog") |
| `#/design-system` | Atalho antigo: redireciona para `#/` |
| `#/design-system/<id>` | Detalhes do DS: paleta 50–950, tipografia e fontes, tokens e o guia completo. A página é exibida com o próprio tema, como prévia |
| `#/tabela` | Tabela CRUD de exemplo (salva no `localStorage`), com seletor de estado: dados, carregando, vazio e erro; itens depreciados não podem ser editados |
| `#/dashboard` | Dashboard genérico no estilo do painel do WordPress: indicadores com minigráficos, área, barras, rosca e anel de progresso, tudo em SVG com as cores do tema |
| `#/loja` e `#/loja/<categoria>` | Catálogo de loja com navegação por categoria, ordenação e carrinho de brincadeira. Sem fotos: degradê do tema e ícone de imagem não encontrada em SVG |
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
  modes.json            variante clara/escura dos temas que a têm (ver "Claro e escuro")
  systems-raw.json      lista do catálogo (nome, categoria, link) extraída de open-design.ai (entrada do build)
  ds/index.json         lista dos DS na ordem do seletor: nome, categoria, tagline e cores (~68 KB)
  ds/<id>.<lang>.json   detalhes de cada DS, um arquivo por idioma (en-US e pt-BR), minificado; carregado só ao abrir a página dele (~26 KB em média)
  themes/<id>.css       tema de cada DS: @font-face das fontes + variáveis CSS (carregado ao aplicar o tema)
  themes/<id>.contrast.json  tokens do DS que o build ajustou para passar de 4,5:1 (alimenta o aviso de contraste)
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
4. `npm run test:e2e`: 20 cenários no Chromium (início e catálogo, busca, página de DS com tema, seletor de temas, blog e artigo, tabela e seus estados, formulário, idioma e botão de topo, rotas antigas e inexistentes). Também falha se alguma tela der erro de JS, resposta 4xx/5xx ou pedir algo ao Google

Na branch `main`, se os testes passarem, ele publica no **GitHub Pages** só o que o navegador usa (`index.html`, `assets/`, `data/ds/` e `data/themes/`, cerca de 12 MB). O Pages já está ativo (Source: **GitHub Actions**) e o site é publicado em <https://jonassenetorres.github.io/ds-viewer-open-design/>. Em pull requests o job de publicação aparece como "pulado" de propósito: só roda no push para a `main`. O site funciona em subcaminho (`usuario.github.io/ds-viewer-open-design/`), porque todos os endereços são relativos.

## Temas

O tema padrão (**Padrão**) é próprio do projeto e está descrito em [O tema Padrão](#o-tema-padrão), abaixo.

**Tema na URL:** a escolha vai em `?tema=<id>` (por exemplo `/?tema=bugatti#/loja`), então o link compartilha o tema aplicado. A URL manda sobre o que ficou guardado no `localStorage`; cada troca é uma entrada do histórico, e o botão voltar desfaz a troca. Os links internos mantêm o parâmetro.

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

Algumas variáveis são opcionais: o tema só as define quando quer mudar o padrão, e o CSS tem um fallback para as demais.

| Variável | Uso | Fallback |
|---|---|---|
| `--field-bg` | fundo dos campos habilitados (inputs, textareas, selects, busca, seletores) | `--surface` (`--bg` em alguns campos) |
| `--grad-1`, `--grad-2` | cores dos degradês dos cartões de imagem de exemplo | `--accent`, `--accent-strong` |
| `--row-bg`, `--row-stripe`, `--row-hover` | linhas, zebra e hover da tabela de exemplo | transparente; hover em `--surface-2` |
| `--cta-bg`, `--cta-btn-fg` | fundo da faixa de chamada e texto do botão dela | `--solid` |
| `color-scheme` | `dark` ou `light` conforme a luminância do fundo; deixa ícones de calendário e relógio, barras de rolagem e controles do navegador legíveis | gerado em todos os temas |

A revisão tema a tema (contraste, rolagem horizontal, fontes carregadas, o que foi ajustado em cada um) está em [`docs/revisao-estilos.md`](docs/revisao-estilos.md), gerada por `npm run audit:themes` e `scripts/review_styles.py`.

### Claro e escuro

O botão de sol e lua do cabeçalho alterna a variante clara/escura do tema, mas **só nos temas cujo guia descreve uma segunda paleta**: Padrão, Discord, GitHub, IBM, Linear, Perplexity e Xiaohongshu. Nos demais o botão fica desabilitado, com a dica "Este tema não tem variante clara/escura" (o Mission Control declara não ter modo claro "por design", e o Supabase só descreve o escuro).

As cores da outra variante estão em [`data/modes.json`](data/modes.json), copiadas da seção de cores do guia (o que o guia não dá, como o texto do modo claro do Discord e do Linear, está em `derived` e marcado como dedução). `npm run data:update` roda as mesmas regras de contraste sobre a variante e grava um bloco extra em `data/themes/<id>.css`, `[data-theme="<id>"][data-scheme="dark|light"]`, e o campo `schemes` no `index.json`. A escolha fica em `localStorage` (`odv-scheme`) e vale para qualquer tema que tenha a variante. O aviso de contraste lista os ajustes da variante que está na tela. O escuro do Padrão não vem de nenhum guia: é derivado da paleta do Expo e marcado como tal no `modes.json`. Para incluir um tema, adicione a entrada em `data/modes.json`.

### Aviso de contraste (WCAG 2.2 AA)

Quando uma cor do DS fica abaixo de **4,5:1** (nível AA para texto) sobre os fundos em que é usada, o build troca por uma variante que passa, e a página avisa: um quadro recolhível, abaixo do aviso de fontes, lista **cada token alterado, a cor antes e depois e a razão de contraste antes e depois**. O relatório de cada tema fica em `data/themes/<id>.contrast.json`, gerado por `npm run data:update`. Os tokens cobertos são o botão principal (`--solid`, cor e texto), links e destaques (`--accent-strong`), textos secundário, de apoio e suave (`--muted`, `--meta`, `--fg-soft`), textos de sucesso, atenção e erro (`--ok-ink`, `--warn-ink`, `--danger-ink`) e a superfície (`--surface`, só quando o texto do tema não é legível sobre ela). Ajustes de margem (de 4,5 a 4,7:1, que o build faz por segurança) não entram na lista. Onde nenhuma cor serve a todos os fundos (PlayStation, em sucesso e atenção), o aviso mostra a razão obtida e diz que é o melhor possível. O tema **Padrão** é a exceção: as cores são do projeto, então o build ajusta o contraste do mesmo jeito, mas o aviso não aparece (`padrao.contrast.json` fica vazio).

Cada tema também gera cores de feedback legíveis: `--ok-ink`, `--warn-ink` e `--danger-ink` (a cor do tema misturada com `--fg` até passar de 4,5:1 sobre o fundo, a superfície e o fundo suave do alerta) e `--ok-fg`, `--danger-fg` (texto sobre botões preenchidos). Quando o texto do tema não é legível sobre a superfície do DS (caso do PlayStation, com superfície branca e texto branco), o build deriva uma superfície a partir do fundo.

Além disso, cada tema expõe dois tons da paleta, usados no header e no footer:

| Variável | Uso | Fallback |
|---|---|---|
| `--primary-500` / `--primary-500-fg` | fundo e texto do header | `--bg` / `--fg` |
| `--neutral-400` / `--neutral-400-fg` | fundo e texto do footer | `--bg` / `--fg` |

As cores `-fg` são `#111111` ou branco, a que tiver mais contraste com o fundo; o pior caso no catálogo é 4,77:1, acima do mínimo AA. Por isso o texto do header e do footer não deve ganhar transparência nem ser misturado com o fundo.

### O tema Padrão

Não é cópia de nenhum design system: é montado no build (`compose_default` em `scripts/build_ds_details.py`) a partir de três do catálogo, mais decisões do projeto. O guia que aparece na página dele continua sendo o do Vercel, precedido de uma seção "Sobre este tema"; as cores e fontes daquele guia não valem para o Padrão.

| Aspecto | Claro | Escuro (botão sol/lua) | Origem |
|---|---|---|---|
| Fundo, superfícies | `#ffffff`, `#f6f7f9`, `#eef2ff` | `#0b0d12`, `#12151c`, `#1a1f2e` | Expo; o escuro é derivado |
| Texto | `#0b0d12`, `#353945`; secundário `#6b7280` (o build escurece até 4,5:1) | `#f6f7f9`, `#cfd3dc`, `#9aa1b2` | Expo; o escuro é derivado |
| Destaque (botões, links, foco) | `#4630eb` | `#8f85ff` | Roxo do Expo (`DEFAULT_ACCENT`); o escuro é derivado |
| Sucesso, atenção, erro | `#00a36c`, `#f59e0b`, `#e5484d` | `#34d399`, `#fbbf24`, `#f87171` | Expo; o escuro é derivado |
| Bordas | `rgba(0,0,0,.08)` e `.04` | `rgba(255,255,255,.12)` e `.06` | Vercel |
| Raios, sombra, foco, animação | 6/8/12 px, sombra em camadas, anel de 2 px, 150/200 ms | iguais; sombra com branco translúcido | Vercel |
| Fontes e escala tipográfica | Audiowide (títulos), Roboto (corpo), Anonymous Pro (código) | iguais | Futuristic |
| Cabeçalho | fundo `#6b7280` (cinza) e texto branco (4,8:1) | fundo e texto do tema | Projeto (`DEFAULT_HEADER`) |
| Campos habilitados | branco (`--field-bg`) | `--bg` | Projeto |
| Degradês dos cartões de imagem | Secondary `#8145b5` (`--grad-1`, `--grad-2`) | `#a77ad6` | Projeto |
| Tabela de exemplo | linhas brancas, zebra `#eef2ff`, hover em Secondary a 14% | `--bg`, `--surface-2`, hover em Secondary clareado | Projeto (`--row-*`) |
| Faixa "Pronto para começar?" (institucional) | padrão do tema | fundo e texto do botão `#f2e8fd` (`--cta-*`) | Projeto |
| Nomes das paletas na página do tema | Primary, Secondary, Warning, Danger, Success, Neutral | | Projeto (`DEFAULT_PALETTE_NAMES`) |

Pontos de atenção:

- **Cabeçalho:** texto branco sobre `#6b7280`, 4,8:1, acima do mínimo AA. Trocar o cinza (`DEFAULT_HEADER`) exige conferir o contraste com o branco.
- **Contraste:** o build ajusta as cores do Padrão como as de qualquer tema, mas o aviso de contraste não aparece nele (`padrao.contrast.json` fica vazio).
- **Escuro derivado:** nenhum guia traz modo escuro para o Padrão. Os valores estão em [`data/modes.json`](data/modes.json), com o que foi deduzido em `derived`.
- **Onde mudar:** as origens e as decisões são constantes no topo de `compose_default` (`DEFAULT_PALETTE_FROM`, `DEFAULT_TYPE_FROM`, `DEFAULT_ACCENT`, `DEFAULT_HEADER`, `DEFAULT_PALETTE_NAMES`) e o escuro, em `data/modes.json`. Depois, `npm run data:update`.

### Ajustes para um tema específico

O `<body>` recebe a classe `theme-<id>` do tema ativo (inclusive na prévia de uma página de DS). Use um seletor composto para corrigir um tema sem afetar os outros:

```css
body.theme-airbnb .site-header { /* só no tema Airbnb */ }
```

## Fontes proprietárias dos temas

Aqui, "fonte proprietária" é a fonte de **marca** de um design system (a do Itaú, por exemplo), que não é distribuída pelo Google Fonts nem acompanha um sistema operacional, e que por isso poderia dar problema de licença. Elas **não são usadas nem incluídas**. Fontes do Google Fonts (servidas pelo próprio site), fontes dos sistemas (San Francisco, Segoe UI, Arial, Georgia etc.) e fontes livres não são problema e não entram na lista. `Helvetica` e `Helvetica Neue`, que a API do Google chega a entregar mas são licenciadas ao Google e não ao site, também **não são hospedadas**: ficam como fontes do sistema (macOS), sem aviso.

<!-- fontes-proprietarias:inicio -->

**61 dos 143 temas** têm, no guia original, fontes de marca proprietárias (112 famílias no total). **O site não usa nenhuma delas e elas não constam nele**: nenhum arquivo dessas fontes é hospedado ou distribuído aqui. Nesses temas o navegador usa as **fontes de reserva (fallback)** indicadas pelo próprio guia, e a página mostra um aviso no topo dizendo isso.

| Tema | Fontes proprietárias do guia (não usadas) | Reserva indicada pelo guia (o que aparece) |
|---|---|---|
| BMW (`bmw`) | BMWTypeNextLatin Light, BMWTypeNextLatin | Helvetica, Arial, Hiragino Kaku Gothic ProN, Hiragino Sans, Meiryo |
| Bugatti (`bugatti`) | Bugatti Display, Bugatti Monospace, Bugatti Text Regular | ui-sans-serif, system-ui |
| Ferrari (`ferrari`) | FerrariSans | fontes do sistema |
| Lamborghini (`lamborghini`) | LamboType | fontes do sistema |
| Renault (`renault`) | NouvelR | sans-serif |
| Tesla (`tesla`) | Universal Sans Display, Universal Sans Text | fontes do sistema |
| ClickHouse (`clickhouse`) | Basier | __basier_a58b65 |
| Composio (`composio`) | abcDiatype | abcDiatype Fallback, ui-sans-serif, system-ui, Apple Color Emoji, Segoe UI Emoji |
| HashiCorp (`hashicorp`) | __hashicorpSans_96f0ca | __hashicorpSans_Fallback_96f0ca |
| MongoDB (`mongodb`) | MongoDB Value Serif, Euclid Circular A, Akzidenz-Grotesk Std | Times |
| Sanity (`sanity`) | waldenburgNormal | waldenburgNormal Fallback, ui-sans-serif, system-ui |
| Sentry (`sentry`) | Dammit Sans | fontes do sistema |
| Supabase (`supabase`) | Circular | custom-font, Helvetica Neue, Helvetica, Arial |
| Airtable (`airtable`) | Haas, Haas Groot Disp | -apple-system, system-ui, Segoe UI, Roboto, Haas |
| Canva (`canva`) | Canva Sans, Canva Sans Display | YS Text, system-ui, -apple-system, sans-serif, Canva Sans |
| Clay (`clay`) | Roobert | Arial |
| Figma (`figma`) | figmaSans, figmaMono | figmaSans Fallback, SF Pro Display, system-ui, helvetica, figmaMono Fallback |
| Framer (`framer`) | GT Walsheim Framer Medium | GT Walsheim Medium |
| Miro (`miro`) | Roobert PRO Medium, Roobert PRO SemiBold | blwf, cv03, cv04, cv09, cv11 |
| Webflow (`webflow`) | WF Visual Sans Variable | Arial |
| Airbnb (`airbnb`) | Airbnb Cereal VF | Circular, -apple-system, system-ui, Roboto, Helvetica Neue |
| Meta (Store) (`meta`) | Optimistic VF | fontes do sistema |
| Nike (`nike`) | Nike Futura ND, Helvetica Now Display Medium, Helvetica Now Text Medium, Helvetica Now Text, Neue Frutiger Arabic | fontes do sistema |
| Shopify (`shopify`) | NeueHaasGrotesk | fontes do sistema |
| Starbucks (`starbucks`) | SoDoSans, Lander Tall | Helvetica Neue, Helvetica, Arial, sans-serif, Iowan Old Style |
| Cursor (`cursor`) | CursorGothic, jjannon, berkeleyMono | CursorGothic Fallback, system-ui, Helvetica Neue, Helvetica, Arial |
| Lovable (`lovable`) | Camera Plain Variable | ui-sans-serif, system-ui |
| Superhuman (`superhuman`) | Super Sans VF | system-ui, -apple-system, Segoe UI, Roboto, Oxygen |
| Warp (`warp`) | Matter Regular, Matter Medium, Matter SQ Regular, Matter Mono Regular | Matter Regular Placeholder, Matter Medium Placeholder, Matter SQ Regular Placeholder, Matter Mono Regular Placeholder |
| Binance.US (`binance`) | BinancePlex | fontes do sistema |
| Coinbase (`coinbase`) | CoinbaseDisplay, CoinbaseSans, CoinbaseText | fontes do sistema |
| Kraken (`kraken`) | Kraken-Brand, Kraken-Product | IBM Plex Sans, Helvetica, Arial, Helvetica Neue |
| Mastercard (`mastercard`) | MarkForMC, MarkOffcForMC | fontes do sistema |
| Revolut (`revolut`) | Aeonik Pro | fontes do sistema |
| Stripe (`stripe`) | sohne-var | SF Pro Display |
| Wise (`wise`) | Wise Sans | Inter |
| Claude (Anthropic) (`claude`) | Anthropic Serif, Anthropic Sans, Anthropic Mono | Georgia, Arial |
| Cohere (`cohere`) | CohereText, Unica77 Cohere Web, CohereMono | Space Grotesk, Inter, ui-sans-serif, system-ui, Arial |
| ElevenLabs (`elevenlabs`) | Waldenburg, WaldenburgFH | Waldenburg Fallback, WaldenburgFH Fallback |
| OpenAI (`openai`) | Signifier, Söhne, Söhne Mono | Source Serif Pro, Georgia, serif, Inter, system-ui |
| OpenCode (`opencode-ai`) | Berkeley Mono | IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Monaco |
| Replicate (`replicate`) | rb-freigeist-neue, basier-square | ui-sans-serif, system-ui |
| Runway (`runwayml`) | abcNormal | abcNormal Fallback |
| Together AI (`together-ai`) | The Future, PP Neue Montreal Mono | Arial, Georgia |
| xAI (`x-ai`) | universalSans | universalSans Fallback |
| NVIDIA (`nvidia`) | NVIDIA-EMEA | Arial, Helvetica, sans-serif |
| Pinterest (`pinterest`) | Pin Sans | -apple-system, system-ui, Segoe UI, Roboto, Oxygen-Sans |
| Spotify (`spotify`) | SpotifyMixUITitle, SpotifyMixUI | CircularSp-Arab, CircularSp-Hebr, CircularSp-Cyrl, CircularSp-Grek, CircularSp-Deva |
| The Verge (`theverge`) | Manuka, PolySans, PolySans Mono, FK Roman Standard | -apple-system, system-ui |
| Uber (`uber`) | UberMove, UberMoveText | UberMoveText, system-ui, Helvetica Neue, Helvetica, Arial |
| Vodafone (`vodafone`) | Vodafone, icomoon | fontes do sistema |
| WIRED (`wired`) | WiredDisplay, BreveText, Apercu, WiredMono, ProximaNova, WIRED Mono | helvetica, Monaco, Courier New, Courier |
| Xiaohongshu (`xiaohongshu`) | 方正悠黑 | fontes do sistema |
| Arc Browser (`arc`) | Argent CF, Berkeley Mono | Source Serif Pro, Georgia, serif, ui-monospace, Menlo |
| Cal.com (`cal`) | Cal Sans UI Variable Light, Cal Sans UI Medium, Matter Regular | Matter SemiBold |
| Discord (`discord`) | gg sans, Whitney, gg mono | Helvetica Neue, Helvetica, Arial, sans-serif, gg sans |
| Duolingo (`duolingo`) | Feather Bold | DIN Round Pro, Helvetica Neue, sans-serif |
| Intercom (`intercom`) | Saans, Serrif, SaansMono, MediumLL | Saans Fallback, ui-sans-serif, system-ui, Serrif Fallback, ui-serif |
| Linear (`linear-app`) | Berkeley Mono | ui-monospace, SF Mono, Menlo |
| Resend (`resend`) | domaine, aBCFavorit | ui-sans-serif, system-ui |
| Zapier (`zapier`) | Degular Display, GT Alpina | fontes do sistema |

<!-- fontes-proprietarias:fim -->

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

  Todos os 143 DS já estão traduzidos para pt-BR (o Padrão usa a tradução do guia do `vercel`, com uma seção "Sobre este tema" no início).
- **Artigos:** o conteúdo é Lorem ipsum (autor: Jonas Torres), igual em qualquer idioma; só os rótulos da interface são traduzidos. A barra lateral do blog (busca, categorias, posts recentes e tags) é de enfeite, com links sem destino.

## Categorias

As categorias vêm do open-design.ai e são traduzidas pelo mapa `CAT_PT` em `scripts/build_ds_details.py`; a ordem fica em `CATEGORY_ORDER`. Categorias novas viram automaticamente filtros na página de Design System e grupos no seletor do topo.

## Próximos passos

O que eu faria a seguir, em ordem (o detalhamento está no [TODO.md](TODO.md)):

1. **Dividir o `assets/app.js` em módulos ES por página** (sem etapa de build): hoje são ~2.900 linhas em uma única função, e cada página nova soma cerca de 300.
2. **Rodar a auditoria de temas com regularidade** (agendada ou sob demanda no CI, já que leva ~40 min) e testar também em Firefox e WebKit, porque o CSS usa recursos recentes (`color-mix`, `dvh`, `:has`) e só foi verificado em Chromium.
3. **Mais adiante:** uma página só de componentes (abas, accordion, toast, tooltip, paginação), suporte a RTL (tema Urdu) e metatags por página para compartilhamento.

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

- Os 142 design systems deste catálogo (todos, exceto o **Padrão**, composto por Expo, Vercel e Futuristic) existem em `design-systems/<id>/` do repositório.
- O `manifest.json` de cada um deles declara a origem `OpenDesign curated bundled fixture`, ou seja, material curado e incluído pelo próprio projeto. Nenhum pacote do repositório traz arquivo de licença próprio.
- Só dois pacotes do Open Design declaram origem externa, e **nenhum está neste catálogo**: `cloudflare-kumo` (integração de [`cloudflare/kumo`](https://github.com/cloudflare/kumo), MIT) e `tom-modern` ([`Tom-Opencart/tom-modern-html-style-rule`](https://github.com/Tom-Opencart/tom-modern-html-style-rule)).

Os dados aqui foram extraídos das páginas do open-design.ai. Em 2026-10-10 eles foram conferidos contra o repositório: os 7.526 tokens (`data/ds/*.en-US.json`) são idênticos aos de `design-systems/<id>/tokens.css`, e o texto dos guias coincide com o `DESIGN.md` de cada pacote. A única diferença encontrada vinha do site, que ofusca e-mails (Cloudflare); o build agora os decodifica. Para refazer a conferência: `npm run verify:upstream` (ver o topo de `scripts/verify_upstream.py`). Ao reutilizar um tema fora deste visualizador, consulte o pacote correspondente no repositório do Open Design.

### Fontes

As fontes dos temas são servidas pelo próprio site, em `assets/fonts/` (woff2, só o subconjunto `latin`, que cobre pt-BR e en-US), então a página não faz nenhuma requisição ao Google. Elas vêm do Google Fonts e mantêm as licenças originais de cada família (OFL, Apache 2.0 ou Ubuntu Font License). Se `assets/fonts/manifest.json` não tiver uma família, o tema volta a usar o `@import` do Google para ela.

### Marcas

Muitos design systems do catálogo descrevem a identidade visual de empresas e produtos (Airbnb, Starbucks, Vercel etc.). Como o próprio Open Design declara, os pacotes que referenciam marcas são **inspirações estéticas, não ativos oficiais** dessas marcas. Nomes e marcas pertencem aos seus titulares. A Apache 2.0 não concede direitos sobre marcas (seção 6), e este projeto **não tem vínculo, patrocínio nem endosso** de nenhuma delas.
