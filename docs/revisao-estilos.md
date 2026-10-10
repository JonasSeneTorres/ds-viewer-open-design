# Revisão de estilos, tema a tema

Gerado por `scripts/review_styles.py` a partir de `scripts/audit_themes.mjs`. A auditoria abre, com cada tema, o início, a página do DS, a tabela, o formulário, o dashboard e a loja, em desktop (1280 px) e celular (390 px), e mede contraste, rolagem horizontal, erros e fontes carregadas.

## Resumo

- Temas auditados: **143**
- Com achados, nos 45 temas medidos antes: **44 → 0** (497 → 0 achados no total)
- Com achados, nos 143 temas: **0** (0 achados no total)
- Botão principal com o par de cores do DS: **106**; ajustado para passar de 4,5:1: **37**
- Superfície derivada (a do DS não tem contraste com o texto do tema): **1** (playstation)
- Temas em que a fonte do título ou do corpo não carrega (fonte proprietária, fora do Google Fonts): **73**

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

### Fonte proprietária não disponível

A fonte do DS não está no Google Fonts, então o navegador usa a primeira família de reserva do guia que existir no sistema. Para ficar fiel seria preciso licenciar e hospedar a fonte.

| Tema | Fonte do título | Carrega | Fonte do corpo | Carrega |
|---|---|---|---|---|
| BMW (`bmw`) | BMWTypeNextLatin Light | não | BMWTypeNextLatin | não |
| BMW M (`bmw-m`) | system-ui | não | system-ui | não |
| Bugatti (`bugatti`) | Bugatti Display | não | Bugatti Text Regular | não |
| Ferrari (`ferrari`) | FerrariSans | não | FerrariSans | não |
| Lamborghini (`lamborghini`) | LamboType | não | Open Sans | sim |
| Renault (`renault`) | NouvelR | não | NouvelR | não |
| Tesla (`tesla`) | Universal Sans Display | não | Universal Sans Text | não |
| ClickHouse (`clickhouse`) | Basier | não | Inter | sim |
| Composio (`composio`) | abcDiatype | não | abcDiatype | não |
| HashiCorp (`hashicorp`) | __hashicorpSans_96f0ca | não | __hashicorpSans_96f0ca | não |
| MongoDB (`mongodb`) | MongoDB Value Serif | não | Euclid Circular A | não |
| PostHog (`posthog`) | IBM Plex Sans Variable | não | IBM Plex Sans Variable | não |
| Sanity (`sanity`) | waldenburgNormal | não | Helvetica | sim |
| Sentry (`sentry`) | Dammit Sans | não | Rubik | sim |
| Supabase (`supabase`) | Circular | não | Circular | não |
| Airtable (`airtable`) | Haas Groot Disp | não | Haas | não |
| Canva (`canva`) | Canva Sans | não | Canva Sans Display | não |
| Clay (`clay`) | Roobert | não | Roobert | não |
| Figma (`figma`) | figmaSans | não | figmaSans | não |
| Framer (`framer`) | GT Walsheim Framer Medium | não | Inter Variable | não |
| Miro (`miro`) | Roobert PRO Medium | não | Inter | não |
| Webflow (`webflow`) | WF Visual Sans Variable | não | WF Visual Sans Variable | não |
| Airbnb (`airbnb`) | Airbnb Cereal VF | não | Airbnb Cereal VF | não |
| Meta (Store) (`meta`) | Optimistic VF | não | Optimistic VF | não |
| Nike (`nike`) | Nike Futura ND | não | Helvetica Now Text Medium | não |
| Shopify (`shopify`) | NeueHaasGrotesk | não | Inter | sim |
| Starbucks (`starbucks`) | SoDoSans | não | SoDoSans | não |
| kami (紙 / 纸) (`kami`) | Charter | não | Charter | não |
| Cursor (`cursor`) | CursorGothic | não | jjannon | não |
| GitHub (`github`) | Apple Color Emoji | não | Apple Color Emoji | não |
| Lovable (`lovable`) | Camera Plain Variable | não | Camera Plain Variable | não |
| Superhuman (`superhuman`) | Super Sans VF | não | Super Sans VF | não |
| Warp (`warp`) | Matter Regular | não | Inter | sim |
| Binance.US (`binance`) | BinancePlex | não | BinancePlex | não |
| Coinbase (`coinbase`) | CoinbaseDisplay | não | CoinbaseSans | não |
| Kraken (`kraken`) | Kraken-Brand | não | Kraken-Product | não |
| Mastercard (`mastercard`) | MarkForMC | não | MarkForMC | não |
| Revolut (`revolut`) | Aeonik Pro | não | Inter | sim |
| Stripe (`stripe`) | sohne-var | não | sohne-var | não |
| Wise (`wise`) | Wise Sans | não | Inter | sim |
| Claude (Anthropic) (`claude`) | Anthropic Serif | não | Anthropic Sans | não |
| Cohere (`cohere`) | CohereText | não | Unica77 Cohere Web | não |
| ElevenLabs (`elevenlabs`) | Waldenburg | não | Inter | sim |
| Mistral AI (`mistral-ai`) | system-ui | não | system-ui | não |
| Ollama (`ollama`) | SF Pro Rounded | não | SF Pro Rounded | não |
| OpenAI (`openai`) | Signifier | não | Söhne | não |
| OpenCode (`opencode-ai`) | Berkeley Mono | não | Berkeley Mono | não |
| Replicate (`replicate`) | rb-freigeist-neue | não | basier-square | não |
| Runway (`runwayml`) | abcNormal | não | abcNormal | não |
| Together AI (`together-ai`) | The Future | não | The Future | não |
| xAI (`x-ai`) | GeistMono | não | GeistMono | não |
| Apple (`apple`) | SF Pro Display | não | SF Pro Text | não |
| NVIDIA (`nvidia`) | NVIDIA-EMEA | não | NVIDIA-EMEA | não |
| Pinterest (`pinterest`) | Pin Sans | não | Pin Sans | não |
| PlayStation (`playstation`) | Arial | não | Arial | não |
| SpaceX (`spacex`) | D-DIN-Bold | não | D-DIN | não |
| Spotify (`spotify`) | SpotifyMixUITitle | não | SpotifyMixUI | não |
| The Verge (`theverge`) | Manuka | não | PolySans | não |
| Uber (`uber`) | UberMove | não | UberMoveText | não |
| Vodafone (`vodafone`) | Vodafone | não | Vodafone | não |
| WIRED (`wired`) | WiredDisplay | não | BreveText | não |
| Xiaohongshu (`xiaohongshu`) | 方正悠黑 | não | 方正悠黑 | não |
| Expressive (`expressive`) | system-ui | não | system-ui | não |
| Arc Browser (`arc`) | Argent CF | não | Inter | sim |
| Discord (`discord`) | gg sans | não | gg sans | não |
| Duolingo (`duolingo`) | Feather Bold | não | Mona Sans | sim |
| Intercom (`intercom`) | Saans | não | MediumLL | não |
| Linear (`linear-app`) | Inter Variable | não | Inter Variable | não |
| Notion (`notion`) | NotionInter | não | NotionInter | não |
| Resend (`resend`) | domaine | não | inter | não |
| Zapier (`zapier`) | Degular Display | não | Inter | sim |
| Dashboard (`dashboard`) | system-ui | não | system-ui | não |
| Warm Editorial (`warm-editorial`) | system-ui | não | system-ui | não |

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
