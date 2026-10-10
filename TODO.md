# TODO — Visualizador de DS

Pontos em aberto levantados na revisão crítica do projeto (2026-10-10).
Marque `[x]` ao concluir cada item.

## Licenças e conteúdo

- [x] **1.** Comparar `data/ds/*` com `design-systems/*/tokens.css` do repositório do Open Design, para sustentar o "no estado". Hoje a afirmação vale pela fonte declarada, não por um diff. — _Feito: 7.526 de 7.526 tokens idênticos ao `tokens.css` do repositório (`npm run verify:upstream`); guias coincidem com o `DESIGN.md`. Única divergência: um e-mail ofuscado pelo Cloudflare no `urdu` (corrigido no build com `decode_cf_emails`)._
- [x] **2.** Origem por pacote (VoltAgent e bergside): os manifestos do Open Design não dizem qual pacote vem de qual. Sem solução possível; já está fora do README. — _Feito: removido do README; o vínculo por pacote não existe nos manifestos, então não há mais o que verificar._
- [x] **3.** `.cache/systems-page.html` e `.cache/pages/systems.html` ainda listam o VoltAgent. Decidir: apagar ou manter. — _Feito: não estava resolvido: os dois arquivos ainda existiam. Foram apagados (estavam fora do Git) e o README deixou de citá-los._
- [x] **4.** `LICENSE-OPEN-DESIGN` não tem `NOTICE` correspondente. Sem ação: o Open Design não publica `NOTICE`. — _Feito: confirmado de novo que o repositório não publica `NOTICE` (404); nada a reproduzir._

## Bugs

- [x] **5.** `dsSequence()` duplica os ids (`THEMES` já inclui `CATALOG`); o "próximo" do último DS aponta para o 2º item. [`assets/app.js`](assets/app.js) — _Feito: `dsSequence()` agora usa só `THEMES`; o último DS não tem mais "próximo"._
- [x] **6.** O título da aba nunca muda e o foco não vai para o `<main>` ao trocar de rota (`router()`). — _Feito: `setTitle()` por rota e foco no `<main>` ao navegar (só em `hashchange`, não ao trocar idioma)._
- [x] **7.** O DS `urdu` não tem tradução de `intro` em pt-BR, apesar de o README afirmar "todos traduzidos". `data/ds/urdu.json` — _Feito: não era tradução faltando: o `intro` em inglês já vem vazio do open-design.ai. Cards e páginas escondem o texto vazio em vez de mostrar um `<p>` em branco._

## Segurança

- [x] **8.** `L(sec.html)` e `a.body` entram por `innerHTML` sem sanitização. Filtrar `<script>` e atributos `on*` em `scripts/build_ds_details.py`. — _Feito: o build já sanitizava por lista de permitidos; adicionado `scripts/check_html.py` (`npm run check:html`) como segunda checagem. 2.560 blocos verificados, 0 problemas._

## UX e acessibilidade

- [x] **9.** O seletor de temas tem 143 itens, sem busca nem type-ahead, e é um `combobox` sobre um `<button>`. — _Feito: popup com campo de busca (`role=combobox`), sem acento, com contagem anunciada e setas/Home/End/Enter/Esc._
- [x] **10.** Os cabeçalhos de grupo do listbox têm `aria-hidden`; leitores de tela perdem a categoria. — _Feito: grupos viraram `role="group"` com `aria-labelledby`, sem `aria-hidden`._
- [x] **11.** O hero leva primeiro à **Tabela**, não ao catálogo, que é o valor do site. — _Feito: a home agora é o hero + o catálogo de design systems (menu "Design System" removido; `#/design-system` redireciona para `#/`); o blog virou a rota `#/blog`, com item próprio no menu._
- [x] **12.** Os artigos só existem em pt-BR; a home em inglês fica com metade do conteúdo inútil. — _Feito: artigos e títulos agora são Lorem ipsum (iguais em qualquer idioma), sem o aviso de "só em português". A barra lateral de série foi trocada por uma de blog genérico (busca não funcional, categorias, posts recentes e tags com links mortos). O link "Saiba mais" do rodapé saiu._
- [x] **13.** Tabela e formulário só cobrem o caso feliz: faltam estados de erro, desabilitado, vazio e carregando para estressar os temas. — _Feito: tabela com seletor de estado (dados, carregando com esqueleto, vazio, erro com "Tentar novamente") e edição desabilitada em itens depreciados; formulário com um bloco extra de campo com erro, ajuda, desabilitado, somente leitura, botões (normal, desabilitado, carregando), alertas (info, sucesso, atenção, erro) e carregamento (progresso e esqueleto)._
- [x] **21.** Contraste das cores de feedback (`--danger`, e provavelmente `--ok` e `--warn`) em temas escuros: a mensagem de erro e os alertas usam a cor do tema direto sobre `--surface`. Medido só para `--danger` em hex: 63 dos 142 temas ficam abaixo de 4,5:1 (piores: Bugatti 2,7, Canva 2,9, MongoDB 2,9, Arc 3,0, Duolingo 3,1). Sugestão: calcular uma variante `--danger-fg` por tema no build, como já é feito com `--primary-500-fg`, e medir também `--ok` e `--warn`. — _Feito: `--ok-ink`, `--warn-ink` e `--danger-ink` por tema, calculados no build (mistura com `--fg` até 4,5:1 sobre fundo, superfície e fundo suave) e `--ok-fg`/`--danger-fg` para botões. Dos 140 temas medidos, todos passam; o PlayStation (fundo preto, superfície branca) fica em 3,3:1 (sucesso) e 1,9:1 (atenção), sem solução para os dois fundos._

## Performance e privacidade

- [x] **14.** Fontes via `@import` do Google Fonts em cada tema: requisições encadeadas e envio de IP ao Google (LGPD). — _Feito: self-host. `scripts/build_fonts.py` (`npm run data:fonts`) baixa 122 arquivos woff2 (3,0 MB, só `latin`, normal e itálico) para `assets/fonts/`, e os temas usam `@font-face` local, sem `@import`. Zero requisições ao Google nos testes._
- [x] **15.** Cada JSON de DS tem até ~120 KB (7 MB no total) e o guia completo entra de uma vez. Colapsar ou carregar por seção. — _Feito: JSON minificado e separado por idioma (`<id>.<lang>.json`). Cada página de DS carrega ~26 KB (média; antes 48 KB) e ~7 KB comprimidos. O total no repositório fica em 7,5 MB (os dois idiomas). Trocar o idioma na página recarrega o outro arquivo. Não fiz o guia sob demanda (`<details>`), que ficaria como melhoria futura._

## Repositório e processo

- [x] **16.** O README manda rodar em `D:\Projetos\Pessoal\Open Design`, caminho que não existe mais. O repositório é `ds-viewer-open-design` e o pacote, `open-design-viewer`. — _Feito: README e `package.json` agora usam `ds-viewer-open-design`._
- [x] **17.** `docs/historico/PROMPTS-PENDENTES.md` descreve tarefas que o README dá como concluídas (os 5 temas de demonstração). — _Feito: conferido: todos os pedidos já estavam implementados. O arquivo foi renomeado por dentro para "Pedidos iniciais (concluídos)", com o status no topo. Os dois arquivos de handoff do Open Design foram mantidos em `docs/historico/` (são a exportação antiga)._
- [x] **18.** Sem testes nem CI para validar a consistência entre `index.json`, `ds/*.json` e `themes/*.css`. — _Feito: `scripts/check_data.py` e `check_html.py` (dados e HTML), mais 9 testes E2E básicos com Playwright (`npm run test:e2e`), tudo rodando em `.github/workflows/pages.yml` antes do deploy. Sem testes unitários de JS, por decisão. Falta só ativar o Pages (ver item 20)._
- [x] **19.** Não há script para gerar `systems-raw.json`; a atualização do catálogo é manual. — _Feito: não será feito. O catálogo é uma cópia datada mantida à mão; o README agora diz isso e aponta o repositório do Open Design como base para qualquer atualização._
- [ ] **20.** Nada foi commitado: `.gitignore`, `LICENSE-OPEN-DESIGN`, `README.md` e o restante estão não rastreados.

## Revisão

- [ ] **22.** Revisão de estilos. Detalhe visto pelo Jonas, a ser especificado quando ele revisar. Para comparar com a documentação original, há uma cópia dos HTMLs do open-design.ai de 2026-10-10 em `.cache/snapshots/2026-10-10/` (142 páginas, 65 MB, fora do Git; baixada com `python scripts/build_ds_fetch.py .cache/snapshots/2026-10-10`). Ela difere do cache usado no build (`.cache/pages/`, de 2026-10-09) em todas as páginas, por pequenas mudanças no CSS/JS embutido do próprio site e no contador de estrelas. _Parte já coberta pelo item 24; resta o detalhe específico que o Jonas viu._
- [x] **24.** Revisão tema a tema (seções 1 a 9 do guia de cada DS) — _Feito: o site passou a usar os tokens que ignorava (escala tipográfica, entrelinha, tracking, largura e margens, respiro de seção, anel de foco, movimento, hover do botão, `surface-warm`, `border-soft`, `meta`), com contraste garantido no build. `npm run audit:themes` abre os 143 temas em desktop e celular: nos 45 medidos antes, 44 tinham achados (497 no total); depois, os 143 passam sem nenhum. Relatório por tema em `docs/revisao-estilos.md`. Corrigidos também: campo de busca branco nos temas escuros, fallbacks de fonte colados (Airbnb, Renault, WIRED), superfície ilegível do PlayStation, estouro horizontal no celular._
- [ ] **25.** Fidelidade tipográfica: em 73 dos 143 temas a fonte do título ou do corpo não carrega (fontes proprietárias fora do Google Fonts), e o navegador usa a primeira reserva do guia que existir no sistema. Decidir se basta (o relatório lista cada um) ou se vale escolher uma fonte aberta parecida por tema.
- [ ] **26.** Botão principal: em 37 temas o par de cores do DS (`--accent` + `--accent-on`) não passa de 4,5:1 e o build ajusta a cor ou o texto. Isso favorece a acessibilidade e se afasta um pouco da marca (ex.: Airbnb, texto escuro sobre o rosa). Decidir se prefere a fidelidade nesses casos.
- [ ] **27.** Seções 7 a 9 do guia (do/don't, responsivo, guia do agente) são só texto e não viram estilo. Falta, se quiser, extrair do guia o peso e o tamanho por papel tipográfico (hoje `--heading-weight` é 600 em todos).
- [ ] **23.** `data/systems-raw.json`: a entrada **Cisco** tem `href: "/plugins/systems/"` (aponta para a lista, não para o DS), então o `data:fetch` baixa a página da lista à toa e a Cisco não entra no catálogo. Decidir: corrigir para `/plugins/design-system-cisco/` (e incluir, se o pacote existir no repositório) ou remover a entrada.

## Ordem sugerida

1. Rápidos: 5, 6, 7, 16
2. Segurança e acessibilidade: 8, 9, 10
3. Decisões de produto: 3, 11, 14
4. Depois: 1, 15, 18, 19
