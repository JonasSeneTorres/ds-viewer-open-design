# Revisão de estilos, tema a tema

Gerado por `scripts/review_styles.py` a partir de `scripts/audit_themes.mjs`. A auditoria abre, com cada tema, o início, a página do DS, a tabela, o formulário, a institucional, as telas de entrar, o dashboard e a loja, em desktop (1280 px) e celular (390 px), e mede contraste, rolagem horizontal, erros e fontes carregadas.

## Resumo

- Temas auditados: **143**
- Com achados, nos 45 temas medidos antes: **44 → 0** (497 → 0 achados no total)
- Com achados, nos 143 temas: **0** (0 achados no total)
- Botão principal com o par de cores do DS: **106**; ajustado para passar de 4,5:1: **37**
- Superfície derivada (a do DS não tem contraste com o texto do tema): **1** (playstation)
- Temas cujo guia usa fonte de marca proprietária (não incluída no site; o aviso do topo aparece): **61**

## O que a revisão mudou, por seção do guia

| Seção do guia | Antes | Agora |
|---|---|---|
| 1. Atmosfera | Fundo do hero sempre uma mistura de `--bg` com 4% de `--fg` | Usa o `--surface-warm` do DS quando o texto é legível sobre ele |
| 2. Paleta e papéis | Links e kicker misturavam 16% de `--fg` sempre; texto secundário do DS podia ficar abaixo de 4,5:1; superfície branca com texto branco (PlayStation) | `--accent-strong` calculado por tema até passar de 4,8:1; `--muted`, `--fg-soft` e `--meta` garantidos em 4,7:1; superfície derivada quando o texto não a lê |
| 3. Tipografia | Tamanhos fixos, tracking de títulos fixo em -0,02em; fallbacks colados em uma única família inválida (Airbnb, Renault, WIRED) | Escala do DS (`--text-*`) limitada a faixas seguras, entrelinha e tracking do DS, fallbacks separados em famílias |
| 4. Componentes | Botão principal sempre `accent-strong`; hover/ativo do DS ignorados; foco só com contorno; campo de busca do catálogo sem tema (branco no escuro) | Botão com a cor e o texto do DS quando passam de 4,5:1 (senão ajustados), hover do DS, anel de foco do DS somado ao contorno, campo de busca com o visual do tema |
| 5. Layout | Largura (1120 px), margens e respiro de seção fixos | `--container-max`, margens por breakpoint e `--section-y` do DS, limitados a faixas seguras |
| 6. Profundidade | Duração e curva de transição fixas | `--motion-fast`, `--motion-base` e `--ease-standard` do DS; `--radius-lg` do DS |
| 7–9. Do's, responsivo e guia do agente | (texto) | Sem mudança de estilo; o responsivo foi coberto pela auditoria em 390 px (menu ativo sem fundo, rótulo do tema truncado, campos e grades sem estourar) |

## Pendências por tema

### Fonte de marca proprietária

A fonte do DS é da própria marca e não é distribuída pelo Google Fonts nem por sistemas operacionais, então o site não a inclui: o navegador usa a primeira família de reserva do guia que existir no sistema. A lista completa, com as reservas, está no README.

| Tema | Fontes proprietárias do guia | Fonte do título usada | Fonte do corpo usada |
|---|---|---|---|
| BMW (`bmw`) | BMWTypeNextLatin Light, BMWTypeNextLatin | BMWTypeNextLatin Light | BMWTypeNextLatin |
| Bugatti (`bugatti`) | Bugatti Display, Bugatti Monospace, Bugatti Text Regular | Bugatti Display | Bugatti Text Regular |
| Ferrari (`ferrari`) | FerrariSans | FerrariSans | FerrariSans |
| Lamborghini (`lamborghini`) | LamboType | LamboType | Open Sans |
| Renault (`renault`) | NouvelR | NouvelR | NouvelR |
| Tesla (`tesla`) | Universal Sans Display, Universal Sans Text | Universal Sans Display | Universal Sans Text |
| ClickHouse (`clickhouse`) | Basier | Basier | Inter |
| Composio (`composio`) | abcDiatype | abcDiatype | abcDiatype |
| HashiCorp (`hashicorp`) | __hashicorpSans_96f0ca | __hashicorpSans_96f0ca | __hashicorpSans_96f0ca |
| MongoDB (`mongodb`) | MongoDB Value Serif, Euclid Circular A, Akzidenz-Grotesk Std | MongoDB Value Serif | Euclid Circular A |
| Sanity (`sanity`) | waldenburgNormal | waldenburgNormal | Helvetica |
| Sentry (`sentry`) | Dammit Sans | Dammit Sans | Rubik |
| Supabase (`supabase`) | Circular | Circular | Circular |
| Airtable (`airtable`) | Haas, Haas Groot Disp | Haas Groot Disp | Haas |
| Canva (`canva`) | Canva Sans, Canva Sans Display | Canva Sans | Canva Sans Display |
| Clay (`clay`) | Roobert | Roobert | Roobert |
| Figma (`figma`) | figmaSans, figmaMono | figmaSans | figmaSans |
| Framer (`framer`) | GT Walsheim Framer Medium | GT Walsheim Framer Medium | Inter Variable |
| Miro (`miro`) | Roobert PRO Medium, Roobert PRO SemiBold | Roobert PRO Medium | Inter |
| Webflow (`webflow`) | WF Visual Sans Variable | WF Visual Sans Variable | WF Visual Sans Variable |
| Airbnb (`airbnb`) | Airbnb Cereal VF | Airbnb Cereal VF | Airbnb Cereal VF |
| Meta (Store) (`meta`) | Optimistic VF | Optimistic VF | Optimistic VF |
| Nike (`nike`) | Nike Futura ND, Helvetica Now Display Medium, Helvetica Now Text Medium, Helvetica Now Text, Neue Frutiger Arabic | Nike Futura ND | Helvetica Now Text Medium |
| Shopify (`shopify`) | NeueHaasGrotesk | NeueHaasGrotesk | Inter |
| Starbucks (`starbucks`) | SoDoSans, Lander Tall | SoDoSans | SoDoSans |
| Cursor (`cursor`) | CursorGothic, jjannon, berkeleyMono | CursorGothic | jjannon |
| Lovable (`lovable`) | Camera Plain Variable | Camera Plain Variable | Camera Plain Variable |
| Superhuman (`superhuman`) | Super Sans VF | Super Sans VF | Super Sans VF |
| Warp (`warp`) | Matter Regular, Matter Medium, Matter SQ Regular, Matter Mono Regular | Matter Regular | Inter |
| Binance.US (`binance`) | BinancePlex | BinancePlex | BinancePlex |
| Coinbase (`coinbase`) | CoinbaseDisplay, CoinbaseSans, CoinbaseText | CoinbaseDisplay | CoinbaseSans |
| Kraken (`kraken`) | Kraken-Brand, Kraken-Product | Kraken-Brand | Kraken-Product |
| Mastercard (`mastercard`) | MarkForMC, MarkOffcForMC | MarkForMC | MarkForMC |
| Revolut (`revolut`) | Aeonik Pro | Aeonik Pro | Inter |
| Stripe (`stripe`) | sohne-var | sohne-var | sohne-var |
| Wise (`wise`) | Wise Sans | Wise Sans | Inter |
| Claude (Anthropic) (`claude`) | Anthropic Serif, Anthropic Sans, Anthropic Mono | Anthropic Serif | Anthropic Sans |
| Cohere (`cohere`) | CohereText, Unica77 Cohere Web, CohereMono | CohereText | Unica77 Cohere Web |
| ElevenLabs (`elevenlabs`) | Waldenburg, WaldenburgFH | Waldenburg | Inter |
| OpenAI (`openai`) | Signifier, Söhne, Söhne Mono | Signifier | Söhne |
| OpenCode (`opencode-ai`) | Berkeley Mono | Berkeley Mono | Berkeley Mono |
| Replicate (`replicate`) | rb-freigeist-neue, basier-square | rb-freigeist-neue | basier-square |
| Runway (`runwayml`) | abcNormal | abcNormal | abcNormal |
| Together AI (`together-ai`) | The Future, PP Neue Montreal Mono | The Future | The Future |
| xAI (`x-ai`) | universalSans | GeistMono | GeistMono |
| NVIDIA (`nvidia`) | NVIDIA-EMEA | NVIDIA-EMEA | NVIDIA-EMEA |
| Pinterest (`pinterest`) | Pin Sans | Pin Sans | Pin Sans |
| Spotify (`spotify`) | SpotifyMixUITitle, SpotifyMixUI | SpotifyMixUITitle | SpotifyMixUI |
| The Verge (`theverge`) | Manuka, PolySans, PolySans Mono, FK Roman Standard | Manuka | PolySans |
| Uber (`uber`) | UberMove, UberMoveText | UberMove | UberMoveText |
| Vodafone (`vodafone`) | Vodafone, icomoon | Vodafone | Vodafone |
| WIRED (`wired`) | WiredDisplay, BreveText, Apercu, WiredMono, ProximaNova, WIRED Mono | WiredDisplay | BreveText |
| Xiaohongshu (`xiaohongshu`) | 方正悠黑 | 方正悠黑 | 方正悠黑 |
| Arc Browser (`arc`) | Argent CF, Berkeley Mono | Argent CF | Inter |
| Cal.com (`cal`) | Cal Sans UI Variable Light, Cal Sans UI Medium, Matter Regular | Cal Sans | Inter |
| Discord (`discord`) | gg sans, Whitney, gg mono | gg sans | gg sans |
| Duolingo (`duolingo`) | Feather Bold | Feather Bold | Mona Sans |
| Intercom (`intercom`) | Saans, Serrif, SaansMono, MediumLL | Saans | MediumLL |
| Linear (`linear-app`) | Berkeley Mono | Inter Variable | Inter Variable |
| Resend (`resend`) | domaine, aBCFavorit | domaine | inter |
| Zapier (`zapier`) | Degular Display, GT Alpina | Degular Display | Inter |

### Achados da auditoria

Nenhum tema tem achados (contraste, rolagem horizontal, erros de JS ou de rede).

## Tabela completa

| Tema | Categoria | Título | Corpo | Botão principal | Superfície | Achados |
|---|---|---|---|---|---|---|
| Vercel (Padrão) (`padrao`) | Padrão | Geist | Geist | par do DS | do DS | 0 |
| BMW (`bmw`) | Automotivo | BMWTypeNextLatin Light (fallback) | BMWTypeNextLatin (fallback) | par do DS | do DS | 0 |
| BMW M (`bmw-m`) | Automotivo | system-ui (fallback) | system-ui (fallback) | par do DS | do DS | 0 |
| Bugatti (`bugatti`) | Automotivo | Bugatti Display (fallback) | Bugatti Text Regular (fallback) | par do DS | do DS | 0 |
| Ferrari (`ferrari`) | Automotivo | FerrariSans (fallback) | FerrariSans (fallback) | par do DS | do DS | 0 |
| Lamborghini (`lamborghini`) | Automotivo | LamboType (fallback) | Open Sans | par do DS | do DS | 0 |
| Renault (`renault`) | Automotivo | NouvelR (fallback) | NouvelR (fallback) | par do DS | do DS | 0 |
| Tesla (`tesla`) | Automotivo | Universal Sans Display (fallback) | Universal Sans Text (fallback) | par do DS | do DS | 0 |
| ClickHouse (`clickhouse`) | Backend & dados | Basier (fallback) | Inter | par do DS | do DS | 0 |
| Composio (`composio`) | Backend & dados | abcDiatype (fallback) | abcDiatype (fallback) | par do DS | do DS | 0 |
| HashiCorp (`hashicorp`) | Backend & dados | __hashicorpSans_96f0ca (fallback) | __hashicorpSans_96f0ca (fallback) | par do DS | do DS | 0 |
| MongoDB (`mongodb`) | Backend & dados | MongoDB Value Serif (fallback) | Euclid Circular A (fallback) | par do DS | do DS | 0 |
| PostHog (`posthog`) | Backend & dados | IBM Plex Sans Variable (fallback) | IBM Plex Sans Variable (fallback) | ajustado | do DS | 0 |
| Sanity (`sanity`) | Backend & dados | waldenburgNormal (fallback) | Helvetica | ajustado | do DS | 0 |
| Sentry (`sentry`) | Backend & dados | Dammit Sans (fallback) | Rubik | par do DS | do DS | 0 |
| Supabase (`supabase`) | Backend & dados | Circular (fallback) | Circular (fallback) | par do DS | do DS | 0 |
| Artistic (`artistic`) | Criativo & artístico | Limelight | Limelight | par do DS | do DS | 0 |
| Cafe (`cafe`) | Criativo & artístico | Poppins | Poppins | par do DS | do DS | 0 |
| Cosmic (`cosmic`) | Criativo & artístico | Audiowide | Audiowide | par do DS | do DS | 0 |
| Creative (`creative`) | Criativo & artístico | Bangers | Bangers | ajustado | do DS | 0 |
| Doodle (`doodle`) | Criativo & artístico | Delius Swash Caps | Delius Swash Caps | ajustado | do DS | 0 |
| Editorial (`editorial`) | Criativo & artístico | Gelasio | Gelasio | par do DS | do DS | 0 |
| Fantasy (`fantasy`) | Criativo & artístico | New Rocker | New Rocker | par do DS | do DS | 0 |
| Friendly (`friendly`) | Criativo & artístico | Noto Serif Display | Noto Serif Display | ajustado | do DS | 0 |
| Lingo (`lingo`) | Criativo & artístico | Nunito | Nunito | par do DS | do DS | 0 |
| Publication (`publication`) | Criativo & artístico | Oswald | Nunito | par do DS | do DS | 0 |
| Storytelling (`storytelling`) | Criativo & artístico | Abril Fatface | Inter | par do DS | do DS | 0 |
| Airtable (`airtable`) | Design & criativo | Haas Groot Disp (fallback) | Haas (fallback) | par do DS | do DS | 0 |
| Canva (`canva`) | Design & criativo | Canva Sans (fallback) | Canva Sans Display (fallback) | par do DS | do DS | 0 |
| Clay (`clay`) | Design & criativo | Roobert (fallback) | Roobert (fallback) | ajustado | do DS | 0 |
| Figma (`figma`) | Design & criativo | figmaSans (fallback) | figmaSans (fallback) | par do DS | do DS | 0 |
| Framer (`framer`) | Design & criativo | GT Walsheim Framer Medium (fallback) | Inter Variable (fallback) | ajustado | do DS | 0 |
| Miro (`miro`) | Design & criativo | Roobert PRO Medium (fallback) | Inter (fallback) | par do DS | do DS | 0 |
| Webflow (`webflow`) | Design & criativo | WF Visual Sans Variable (fallback) | WF Visual Sans Variable (fallback) | par do DS | do DS | 0 |
| Airbnb (`airbnb`) | E-commerce & varejo | Airbnb Cereal VF (fallback) | Airbnb Cereal VF (fallback) | ajustado | do DS | 0 |
| Meta (Store) (`meta`) | E-commerce & varejo | Optimistic VF (fallback) | Optimistic VF (fallback) | par do DS | do DS | 0 |
| Nike (`nike`) | E-commerce & varejo | Nike Futura ND (fallback) | Helvetica Now Text Medium (fallback) | par do DS | do DS | 0 |
| Shopify (`shopify`) | E-commerce & varejo | NeueHaasGrotesk (fallback) | Inter | par do DS | do DS | 0 |
| Starbucks (`starbucks`) | E-commerce & varejo | SoDoSans (fallback) | SoDoSans (fallback) | par do DS | do DS | 0 |
| Atelier Zero (`atelier-zero`) | Editorial · Studio | Playfair Display | Inter | par do DS | do DS | 0 |
| Urdu Modern (Indus Script System) (`urdu`) | Editorial / Personal / Publication | Noto Nastaliq Urdu | Noto Nastaliq Urdu | ajustado | do DS | 0 |
| kami (紙 / 纸) (`kami`) | Editorial & Print | Charter (fallback) | Charter (fallback) | par do DS | do DS | 0 |
| Cursor (`cursor`) | Ferramentas de desenvolvedor | CursorGothic (fallback) | jjannon (fallback) | ajustado | do DS | 0 |
| Expo (`expo`) | Ferramentas de desenvolvedor | Inter | Inter | par do DS | do DS | 0 |
| GitHub (`github`) | Ferramentas de desenvolvedor | Apple Color Emoji (fallback) | Apple Color Emoji (fallback) | par do DS | do DS | 0 |
| Lovable (`lovable`) | Ferramentas de desenvolvedor | Camera Plain Variable (fallback) | Camera Plain Variable (fallback) | ajustado | do DS | 0 |
| Mission Control Design System (`mission-control`) | Ferramentas de desenvolvedor | Inter | Inter | par do DS | do DS | 0 |
| Raycast (`raycast`) | Ferramentas de desenvolvedor | Inter | Inter | ajustado | do DS | 0 |
| Superhuman (`superhuman`) | Ferramentas de desenvolvedor | Super Sans VF (fallback) | Super Sans VF (fallback) | par do DS | do DS | 0 |
| Vercel (`vercel`) | Ferramentas de desenvolvedor | Geist | Geist | par do DS | do DS | 0 |
| Warp (`warp`) | Ferramentas de desenvolvedor | Matter Regular (fallback) | Inter | par do DS | do DS | 0 |
| Binance.US (`binance`) | Fintech & cripto | BinancePlex (fallback) | BinancePlex (fallback) | par do DS | do DS | 0 |
| Coinbase (`coinbase`) | Fintech & cripto | CoinbaseDisplay (fallback) | CoinbaseSans (fallback) | par do DS | do DS | 0 |
| Kraken (`kraken`) | Fintech & cripto | Kraken-Brand (fallback) | Kraken-Product (fallback) | par do DS | do DS | 0 |
| Mastercard (`mastercard`) | Fintech & cripto | MarkForMC (fallback) | MarkForMC (fallback) | par do DS | do DS | 0 |
| Revolut (`revolut`) | Fintech & cripto | Aeonik Pro (fallback) | Inter | par do DS | do DS | 0 |
| Stripe (`stripe`) | Fintech & cripto | sohne-var (fallback) | sohne-var (fallback) | par do DS | do DS | 0 |
| Wise (`wise`) | Fintech & cripto | Wise Sans (fallback) | Inter | par do DS | do DS | 0 |
| Claude (Anthropic) (`claude`) | IA & LLM | Anthropic Serif (fallback) | Anthropic Sans (fallback) | ajustado | do DS | 0 |
| Cohere (`cohere`) | IA & LLM | CohereText (fallback) | Unica77 Cohere Web (fallback) | par do DS | do DS | 0 |
| ElevenLabs (`elevenlabs`) | IA & LLM | Waldenburg (fallback) | Inter | par do DS | do DS | 0 |
| Hugging Face (`huggingface`) | IA & LLM | IBM Plex Mono | Source Sans Pro | par do DS | do DS | 0 |
| MiniMax (`minimax`) | IA & LLM | Outfit | DM Sans | par do DS | do DS | 0 |
| Mistral AI (`mistral-ai`) | IA & LLM | system-ui (fallback) | system-ui (fallback) | ajustado | do DS | 0 |
| Ollama (`ollama`) | IA & LLM | SF Pro Rounded (fallback) | SF Pro Rounded (fallback) | par do DS | do DS | 0 |
| OpenAI (`openai`) | IA & LLM | Signifier (fallback) | Söhne (fallback) | ajustado | do DS | 0 |
| OpenCode (`opencode-ai`) | IA & LLM | Berkeley Mono (fallback) | Berkeley Mono (fallback) | ajustado | do DS | 0 |
| Perplexity AI (`perplexity`) | IA & LLM | Inter | Inter | ajustado | do DS | 0 |
| Replicate (`replicate`) | IA & LLM | rb-freigeist-neue (fallback) | basier-square (fallback) | ajustado | do DS | 0 |
| Runway (`runwayml`) | IA & LLM | abcNormal (fallback) | abcNormal (fallback) | par do DS | do DS | 0 |
| Together AI (`together-ai`) | IA & LLM | The Future (fallback) | The Future (fallback) | par do DS | do DS | 0 |
| xAI (`x-ai`) | IA & LLM | GeistMono (fallback) | GeistMono (fallback) | par do DS | do DS | 0 |
| Bento (`bento`) | Layout & estrutura | Inter | Inter | par do DS | do DS | 0 |
| Levels (`levels`) | Layout & estrutura | Inter | Inter | ajustado | do DS | 0 |
| Perspective (`perspective`) | Layout & estrutura | Oswald | Poppins | par do DS | do DS | 0 |
| Spacious (`spacious`) | Layout & estrutura | Montserrat | Open Sans | par do DS | do DS | 0 |
| Apple (`apple`) | Mídia & consumo | SF Pro Display (fallback) | SF Pro Text (fallback) | par do DS | do DS | 0 |
| IBM (`ibm`) | Mídia & consumo | IBM Plex Sans | IBM Plex Sans | par do DS | do DS | 0 |
| NVIDIA (`nvidia`) | Mídia & consumo | NVIDIA-EMEA (fallback) | NVIDIA-EMEA (fallback) | par do DS | do DS | 0 |
| Pinterest (`pinterest`) | Mídia & consumo | Pin Sans (fallback) | Pin Sans (fallback) | ajustado | do DS | 0 |
| PlayStation (`playstation`) | Mídia & consumo | Arial (fallback) | Arial (fallback) | par do DS | derivada | 0 |
| SpaceX (`spacex`) | Mídia & consumo | D-DIN-Bold (fallback) | D-DIN (fallback) | par do DS | do DS | 0 |
| Spotify (`spotify`) | Mídia & consumo | SpotifyMixUITitle (fallback) | SpotifyMixUI (fallback) | par do DS | do DS | 0 |
| The Verge (`theverge`) | Mídia & consumo | Manuka (fallback) | PolySans (fallback) | ajustado | do DS | 0 |
| Uber (`uber`) | Mídia & consumo | UberMove (fallback) | UberMoveText (fallback) | par do DS | do DS | 0 |
| Vodafone (`vodafone`) | Mídia & consumo | Vodafone (fallback) | Vodafone (fallback) | par do DS | do DS | 0 |
| WIRED (`wired`) | Mídia & consumo | WiredDisplay (fallback) | BreveText (fallback) | par do DS | do DS | 0 |
| Xiaohongshu (`xiaohongshu`) | Mídia & consumo | 方正悠黑 (fallback) | 方正悠黑 (fallback) | ajustado | do DS | 0 |
| Clean (`clean`) | Moderno & minimal | Poppins | Roboto | par do DS | do DS | 0 |
| Contemporary (`contemporary`) | Moderno & minimal | Jost | Jost | par do DS | do DS | 0 |
| Flat (`flat`) | Moderno & minimal | Inter | Inter | par do DS | do DS | 0 |
| Minimal (`minimal`) | Moderno & minimal | Inter | Open Sans | par do DS | do DS | 0 |
| Modern (`modern`) | Moderno & minimal | IBM Plex Serif | IBM Plex Serif | par do DS | do DS | 0 |
| Mono (`mono`) | Moderno & minimal | Space Mono | Space Mono | par do DS | do DS | 0 |
| Refined (`refined`) | Moderno & minimal | Playfair Display | Playfair Display | par do DS | do DS | 0 |
| Shadcn (`shadcn`) | Moderno & minimal | Geist | Geist | par do DS | do DS | 0 |
| Simple (`simple`) | Moderno & minimal | Inter | Inter | par do DS | do DS | 0 |
| Sleek (`sleek`) | Moderno & minimal | Inter | Inter | par do DS | do DS | 0 |
| Claymorphism (`claymorphism`) | Morphism & efeitos | Poppins | Montserrat | ajustado | do DS | 0 |
| Glassmorphism (`glassmorphism`) | Morphism & efeitos | Plus Jakarta Sans | Plus Jakarta Sans | ajustado | do DS | 0 |
| Gradient (`gradient`) | Morphism & efeitos | Space Grotesk | Montserrat | par do DS | do DS | 0 |
| Neon (`neon`) | Morphism & efeitos | Roboto | Roboto | par do DS | do DS | 0 |
| Neumorphism (`neumorphism`) | Morphism & efeitos | Space Mono | Space Mono | ajustado | do DS | 0 |
| Skeumorphism (`skeumorphism`) | Morphism & efeitos | Germania One | Roboto | ajustado | do DS | 0 |
| Bold (`bold`) | Ousado & expressivo | Archivo Black | Archivo Black | par do DS | do DS | 0 |
| Brutalism (`brutalism`) | Ousado & expressivo | Darker Grotesque | Darker Grotesque | par do DS | do DS | 0 |
| Colorful (`colorful`) | Ousado & expressivo | Inter | Inter | ajustado | do DS | 0 |
| Dramatic (`dramatic`) | Ousado & expressivo | Outfit | Outfit | par do DS | do DS | 0 |
| Energetic (`energetic`) | Ousado & expressivo | Limelight | Limelight | ajustado | do DS | 0 |
| Expressive (`expressive`) | Ousado & expressivo | system-ui (fallback) | system-ui (fallback) | par do DS | do DS | 0 |
| Neobrutalism (`neobrutalism`) | Ousado & expressivo | Inter | Inter | ajustado | do DS | 0 |
| Vibrant (`vibrant`) | Ousado & expressivo | Fascinate | Noto Sans | ajustado | do DS | 0 |
| Arc Browser (`arc`) | Produtividade & SaaS | Argent CF (fallback) | Inter | ajustado | do DS | 0 |
| Cal.com (`cal`) | Produtividade & SaaS | Cal Sans | Inter | ajustado | do DS | 0 |
| Discord (`discord`) | Produtividade & SaaS | gg sans (fallback) | gg sans (fallback) | par do DS | do DS | 0 |
| Duolingo (`duolingo`) | Produtividade & SaaS | Feather Bold (fallback) | Mona Sans | ajustado | do DS | 0 |
| Intercom (`intercom`) | Produtividade & SaaS | Saans (fallback) | MediumLL (fallback) | ajustado | do DS | 0 |
| Linear (`linear-app`) | Produtividade & SaaS | Inter Variable (fallback) | Inter Variable (fallback) | par do DS | do DS | 0 |
| Mintlify (`mintlify`) | Produtividade & SaaS | Inter | Inter | par do DS | do DS | 0 |
| Notion (`notion`) | Produtividade & SaaS | NotionInter (fallback) | NotionInter (fallback) | par do DS | do DS | 0 |
| Resend (`resend`) | Produtividade & SaaS | domaine (fallback) | inter (fallback) | par do DS | do DS | 0 |
| Zapier (`zapier`) | Produtividade & SaaS | Degular Display (fallback) | Inter | ajustado | do DS | 0 |
| Ant (`ant`) | Profissional & corporativo | Plus Jakarta Sans | Plus Jakarta Sans | par do DS | do DS | 0 |
| Application (`application`) | Profissional & corporativo | Inter | Inter | par do DS | do DS | 0 |
| Corporate (`corporate`) | Profissional & corporativo | Poppins | Open Sans | par do DS | do DS | 0 |
| Dashboard (`dashboard`) | Profissional & corporativo | system-ui (fallback) | system-ui (fallback) | par do DS | do DS | 0 |
| Elegant (`elegant`) | Profissional & corporativo | Google Sans | Google Sans | par do DS | do DS | 0 |
| Enterprise (`enterprise`) | Profissional & corporativo | Oswald | Ubuntu | par do DS | do DS | 0 |
| Luxury (`luxury`) | Profissional & corporativo | Oswald | Oswald | par do DS | do DS | 0 |
| Material (`material`) | Profissional & corporativo | Roboto | Inter | par do DS | do DS | 0 |
| Premium (`premium`) | Profissional & corporativo | Inter | Inter | par do DS | do DS | 0 |
| Professional (`professional`) | Profissional & corporativo | Poppins | Poppins | par do DS | do DS | 0 |
| Dithered (`dithered`) | Retrô & nostálgico | Space Grotesk | Open Sans | ajustado | do DS | 0 |
| Paper (`paper`) | Retrô & nostálgico | Montserrat | Roboto | par do DS | do DS | 0 |
| Retro (`retro`) | Retrô & nostálgico | Macondo | Macondo | ajustado | do DS | 0 |
| Vintage (`vintage`) | Retrô & nostálgico | Silkscreen | Silkscreen | par do DS | do DS | 0 |
| Neutral Modern (`default`) | Starter | Inter | Inter | par do DS | do DS | 0 |
| Warm Editorial (`warm-editorial`) | Starter | system-ui (fallback) | system-ui (fallback) | par do DS | do DS | 0 |
| Agentic (`agentic`) | Temáticos & únicos | Playfair Display | Playfair Display | par do DS | do DS | 0 |
| Futuristic (`futuristic`) | Temáticos & únicos | Audiowide | Roboto | par do DS | do DS | 0 |
| Pacman (`pacman`) | Temáticos & únicos | Press Start 2P | Press Start 2P | par do DS | do DS | 0 |
| Tetris (`tetris`) | Temáticos & únicos | Bangers | Bangers | par do DS | do DS | 0 |
| Totality Festival (`totality-festival`) | Temáticos & únicos | Space Grotesk | Inter | par do DS | do DS | 0 |
