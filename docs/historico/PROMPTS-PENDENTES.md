# Pedidos iniciais (concluídos)

> **Status: todos executados** (conferido em 2026-10-10). Este arquivo foi o registro de pedidos "ainda não executados"; hoje serve só como histórico de como o projeto nasceu. Os 5 temas de demonstração e o grupo "Guias do projeto" citados abaixo já foram removidos.

Registro dos pedidos combinados no início do projeto.

## 1. Combobox de temas = design systems do catálogo (registrado em 2026-10-09)

**Pedido (texto do Jonas):**

> No combobox, deve seguir as mesmas paletas das cores do design system. Ao selecionar Bugatti, todo o site deve entrar no esquema de tokens da Bugatti, da mesma forma que hoje tem os 5 temas. Eles eram de demonstração. Pode usar eles como guia para a construção dos temas, mas esses 55 devem sair.

**Interpretação:**
- Cada design system do catálogo (ex.: Bugatti) vira um tema aplicável ao site inteiro, com seu próprio conjunto de tokens (cores, e o que mais o catálogo fornecer), como os 5 temas atuais fazem.
- Os 5 temas atuais (`editorial-monocle`, `modern-minimal`, `human-approachable`, `tech-utility`, `brutalist-experimental`) servem só de **guia** para a estrutura dos tokens e devem ser **removidos** depois (inclui o grupo "Guias do projeto" no combobox, `THEMES`, `DS_RULES`, `assets/themes.css` / `styles/themes*`, `data/guides.html`).

**Pontos a confirmar antes de executar:**
- "esses 55": o texto fala dos 5 temas de demonstração; assumir que é "5" (typo). Confirmar.
- O catálogo (`data/systems.html`) só tem 4 amostras de cor + tagline por item: definir como derivar o conjunto completo de tokens (fundo, texto, accent, superfícies, bordas, contraste) a partir delas.
- Fontes/raio/espaçamento por tema: usar um padrão neutro ou inferir por categoria?
- Tema padrão ao abrir o site, já que os 5 atuais saem.

### Complemento (2026-10-09) — respostas e escopo ampliado

**Texto do Jonas:**

> Para os tokens, existem eles escritos em https://open-design.ai/plugins/systems/. Na verdade, nas páginas dos DS, gostaria de uma cópia dos blocos `.detail-block` e `.detail-block designmd-body`. De preferência em português. Principalmente o bloco "Visual Theme & Atmosphere".
>
> Um detalhamento das fontes especiais. Se disponível em um CDN ou Google Fonts, gostaria de infos de como adicionar.
>
> Se conseguir identificar as cores disponíveis, gostaria das paletas de cores, indo do 50 ao 950.
>
> Também exemplos das fontes principais ou fallbacks normal/itálico/negrito.
>
> Gostaria praticamente de um guia da marca, mas mais genérico... Eles todos são para inspirar pessoas a criarem os seus, não para representar a marca.
>
> Para efeito de representação da página, como tem tema que pode ter várias cores, outros com poucas, tenta categorizar, para efeito do CSS do tema: **Cor primária, Cor secundária, Cor neutral**.
>
> Já para conteúdo da página, mostre todas as infos que já relacionei.
>
> Para tema inicial, pode usar o do **Vercel**. Pode colocar nele o parêntese de "(Padrão)" e exibir como o primeiro.
>
> Gostaria também de botões para o próximo design system.

**Decisões que isso fecha:**
- Fonte dos tokens: as páginas de cada DS em open-design.ai (blocos `.detail-block` e `.detail-block.designmd-body`), não só as 4 amostras do catálogo.
- Tema inicial: Vercel, rotulado "Vercel (Padrão)" e listado em primeiro no combobox.
- Tokens do tema: reduzidos a primária / secundária / neutral; o restante vira conteúdo informativo da página.

**Conteúdo de cada página de DS (a construir):**
1. Cópia traduzida para PT-BR dos blocos `.detail-block` / `designmd-body`, com destaque para "Visual Theme & Atmosphere".
2. Fontes especiais: detalhamento e como adicionar (CDN / Google Fonts, `<link>` / `@import`).
3. Paletas de cor de 50 a 950 por cor identificada.
4. Amostras tipográficas das fontes principais e fallbacks em normal / itálico / negrito.
5. Texto no estilo de guia de marca genérico (inspiração, não representação da marca).
6. Botões "design system anterior / próximo".

**Pontos em aberto:**
- Buscar o conteúdo exige acessar open-design.ai (pegar o HTML de ~55 páginas) e traduzir; definir se vira um build script (como `build_systems_data.py`) que gera os dados em `data/`.
- Escalas 50–950 só existem se o DS as definir; senão, gerar a escala a partir da cor-base e marcar como "derivada".
- Ordem do "próximo": a do catálogo (por categoria, alfabética) ou a do combobox?
- Os "5 guias" e o "55" ainda a confirmar (ver acima).

**Decisões finais (2026-10-09):** textos em inglês por ora (tradução depois, outro modelo); escala 50–950 derivada quando o DS não define; lista única (combobox = página Design System, mesma ordem, padrão primeiro); o padrão é uma cópia dos dados do Vercel (`data/ds/default.json`); cada página de DS é exibida com o próprio tema, com botão "Aplicar tema" (mexe no combobox) e botões anterior/próximo; os 5 temas atuais ficam até a validação.

**Status: concluído (2026-10-09).** 144 design systems gerados (`TODO-DS.md`), combobox e lista usam a mesma sequência, os 5 temas de demonstração foram removidos. Pipeline: `npm run data:fetch` (baixa as páginas para `.cache/pages/`) e `npm run data:update` (gera `data/ds/*.json` + `index.json`). Pendente: tradução dos textos para PT-BR (outro modelo).
