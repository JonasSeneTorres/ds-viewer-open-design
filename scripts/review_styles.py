"""Gera docs/revisao-estilos.md: revisão tema a tema a partir da auditoria (scripts/audit_themes.mjs).

Uso:
  PW_CHANNEL=msedge node scripts/audit_themes.mjs --out audit.json
  python scripts/review_styles.py audit.json [audit-antes.json]

O segundo arquivo (opcional) é uma auditoria feita antes das mudanças de estilo, para comparar.
"""
import json, os, re, sys

sys.stdout.reconfigure(encoding="utf-8")
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # raiz do projeto

if len(sys.argv) < 2:
    sys.exit(__doc__)
after = {t["id"]: t for t in json.load(open(sys.argv[1], encoding="utf-8"))}
before = {}
if len(sys.argv) > 2:
    if sys.argv[2].endswith(".log"):  # saída do audit_themes.mjs ("x id (n)" ou ". id"): só as contagens
        for line in open(sys.argv[2], encoding="utf-8"):
            m = re.match(r"([x.]) (\S+?)(?: \((\d+)\))?\s*$", line)
            if m:
                before[m.group(2)] = {"achados": [None] * int(m.group(3) or 0)}
    else:
        before = {t["id"]: t for t in json.load(open(sys.argv[2], encoding="utf-8"))}
index = json.load(open(os.path.join("data", "ds", "index.json"), encoding="utf-8"))


def text(v):
    if isinstance(v, list):
        return next((x["message"] for x in v if x["lang"] == "pt-BR"), v[0]["message"])
    return v


def css_vars(ds_id):
    s = open(os.path.join("data", "themes", f"{ds_id}.css"), encoding="utf-8").read()
    return {m.group(1): m.group(2).strip() for m in re.finditer(r"\n  (--[\w-]+):\s*([^;]+);", s)}


def tokens(ds_id):
    d = json.load(open(os.path.join("data", "ds", f"{ds_id}.en-US.json"), encoding="utf-8"))
    return {t["name"]: t["value"] for g in d["tokens"] for t in g["items"]}, d


def kind(achado):
    return re.sub(r"^[^:]+: ", "", achado).replace("rolagem horizontal", "rolagem horizontal")


def counts(report):
    temas = sum(1 for t in report.values() if t["achados"])
    total = sum(len(t["achados"]) for t in report.values())
    return temas, total


rows, fonts_missing, adjusted_btn, adjusted_surface = [], [], [], []
for d in index:
    ds_id = d["id"]
    a = after.get(ds_id)
    if not a:
        continue
    css, (tk, det) = css_vars(ds_id), tokens(ds_id)
    # botão principal: o par do DS (accent + accent-on) ou um par ajustado para passar de 4,5:1
    ds_pair = (tk.get("--accent", "").lower(), tk.get("--accent-on", "#ffffff").lower())
    my_pair = (css.get("--solid", "").lower(), css.get("--solid-fg", "").lower())
    btn = "par do DS" if ds_pair == my_pair else "ajustado"
    if btn == "ajustado":
        adjusted_btn.append(ds_id)
    surf = "derivada" if tk.get("--surface", "").lower() != css.get("--surface", "").lower() and not tk.get("--surface", "").startswith("var(") else "do DS"
    if surf == "derivada":
        adjusted_surface.append(ds_id)
    m = a["telas"].get("desktop/ds", {})
    h1f, bodyf = (m.get("h1") or {}).get("family", "?"), (m.get("corpo") or {}).get("family", "?")
    loaded = set(m.get("carregadas", []))
    h1_ok, body_ok = h1f in loaded, bodyf in loaded
    if not (h1_ok and body_ok):
        fonts_missing.append((ds_id, text(d["name"]), h1f, bodyf, h1_ok, body_ok))
    rows.append((ds_id, text(d["name"]), text(d["category"]), h1f, "sim" if h1_ok else "não", bodyf,
                 "sim" if body_ok else "não", btn, surf, len(a["achados"]), a["achados"]))

b_temas, b_total = counts(before) if before else (None, None)
a_temas, a_total = counts(after)
same = {k: v for k, v in after.items() if k in before}  # mesma amostra, para comparar
s_temas, s_total = counts(same) if before else (None, None)

out = []
w = out.append
w("# Revisão de estilos, tema a tema\n")
w("Gerado por `scripts/review_styles.py` a partir de `scripts/audit_themes.mjs`. A auditoria abre, com cada tema, "
  "o início, a página do DS, a tabela, o formulário, o dashboard e a loja, em desktop (1280 px) e celular (390 px), e mede contraste, "
  "rolagem horizontal, erros e fontes carregadas.\n")
w("## Resumo\n")
w(f"- Temas auditados: **{len(rows)}**")
if before:
    w(f"- Com achados, nos {len(same)} temas medidos antes: **{b_temas} → {s_temas}** ({b_total} → {s_total} achados no total)")
    w(f"- Com achados, nos {len(after)} temas: **{a_temas}** ({a_total} achados no total)")
else:
    w(f"- Com achados: **{a_temas}** ({a_total} achados no total)")
w(f"- Botão principal com o par de cores do DS: **{len(rows) - len(adjusted_btn)}**; ajustado para passar de 4,5:1: **{len(adjusted_btn)}**")
w(f"- Superfície derivada (a do DS não tem contraste com o texto do tema): **{len(adjusted_surface)}**"
  + (f" ({', '.join(adjusted_surface)})" if adjusted_surface else ""))
w(f"- Temas em que a fonte do título ou do corpo não carrega (fonte proprietária, fora do Google Fonts): **{len(fonts_missing)}**\n")

w("## O que a revisão mudou, por seção do guia\n")
w("| Seção do guia | Antes | Agora |")
w("|---|---|---|")
w("| 1. Atmosfera | Fundo do hero sempre uma mistura de `--bg` com 4% de `--fg` | Usa o `--surface-warm` do DS quando o texto é legível sobre ele |")
w("| 2. Paleta e papéis | Links e kicker misturavam 16% de `--fg` sempre; texto secundário do DS podia ficar abaixo de 4,5:1; superfície branca com texto branco (PlayStation) | `--accent-strong` calculado por tema até passar de 4,8:1; `--muted`, `--fg-soft` e `--meta` garantidos em 4,7:1; superfície derivada quando o texto não a lê |")
w("| 3. Tipografia | Tamanhos fixos, tracking de títulos fixo em -0,02em; fallbacks colados em uma única família inválida (Airbnb, Renault, WIRED) | Escala do DS (`--text-*`) limitada a faixas seguras, entrelinha e tracking do DS, fallbacks separados em famílias |")
w("| 4. Componentes | Botão principal sempre `accent-strong`; hover/ativo do DS ignorados; foco só com contorno; campo de busca do catálogo sem tema (branco no escuro) | Botão com a cor e o texto do DS quando passam de 4,5:1 (senão ajustados), hover do DS, anel de foco do DS somado ao contorno, campo de busca com o visual do tema |")
w("| 5. Layout | Largura (1120 px), margens e respiro de seção fixos | `--container-max`, margens por breakpoint e `--section-y` do DS, limitados a faixas seguras |")
w("| 6. Profundidade | Duração e curva de transição fixas | `--motion-fast`, `--motion-base` e `--ease-standard` do DS; `--radius-lg` do DS |")
w("| 7–9. Do's, responsivo e guia do agente | (texto) | Sem mudança de estilo; o responsivo foi coberto pela auditoria em 390 px (menu ativo sem fundo, rótulo do tema truncado, campos e grades sem estourar) |\n")

w("## Pendências por tema\n")
w("### Fonte proprietária não disponível\n")
w("A fonte do DS não está no Google Fonts, então o navegador usa a primeira família de reserva do guia que existir "
  "no sistema. Para ficar fiel seria preciso licenciar e hospedar a fonte.\n")
w("| Tema | Fonte do título | Carrega | Fonte do corpo | Carrega |")
w("|---|---|---|---|---|")
for ds_id, name, h1f, bodyf, h1_ok, body_ok in fonts_missing:
    w(f"| {name} (`{ds_id}`) | {h1f} | {'sim' if h1_ok else 'não'} | {bodyf} | {'sim' if body_ok else 'não'} |")
w("")

problemas = [r for r in rows if r[9]]
w("### Achados da auditoria\n")
if not problemas:
    w("Nenhum tema tem achados (contraste, rolagem horizontal, erros de JS ou de rede).\n")
else:
    for r in problemas:
        w(f"- **{r[1]}** (`{r[0]}`)")
        for ach in r[10]:
            w(f"  - {ach}")
    w("")

w("## Tabela completa\n")
w("| Tema | Categoria | Título | Corpo | Botão principal | Superfície | Achados |")
w("|---|---|---|---|---|---|---|")
for ds_id, name, cat, h1f, h1_ok, bodyf, body_ok, btn, surf, n, _ in rows:
    w(f"| {name} (`{ds_id}`) | {cat} | {h1f}{'' if h1_ok == 'sim' else ' (fallback)'} | {bodyf}{'' if body_ok == 'sim' else ' (fallback)'} | {btn} | {surf} | {n} |")

os.makedirs("docs", exist_ok=True)
open(os.path.join("docs", "revisao-estilos.md"), "w", encoding="utf-8").write("\n".join(out) + "\n")
print(f"docs/revisao-estilos.md: {len(rows)} temas, {a_temas} com achados, {len(fonts_missing)} sem fonte carregada")
