"""Gera os dados dos design systems a partir das páginas do open-design.ai (.cache/pages/).

Uso:
    python scripts/build_ds_details.py                           todos (reescreve data/ds/index.json)
    python scripts/build_ds_details.py --template <slug> [lang]  modelo de tradução em i18n/<lang>/

Para cada DS: data/ds/<id>.<lang>.json (um por idioma; tokens, paletas 50–950 derivadas quando o DS não define,
fontes e como instalar, guia em HTML sanitizado com as traduções de i18n/) e
data/themes/<id>.css (fontes + variáveis CSS do tema). O índice data/ds/index.json
leva só o que a listagem e o seletor usam.
"""
import html as htmllib
import json
import math
import os
import re
import sys
from html.parser import HTMLParser

sys.stdout.reconfigure(encoding="utf-8")
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # raiz do projeto

STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
# Luminosidade (OKLCH L) alvo de cada degrau.
L_TARGET = [0.975, 0.945, 0.895, 0.83, 0.74, 0.65, 0.57, 0.49, 0.41, 0.33, 0.24]



# ---------------------------------------------------------------- cores
def hex_to_rgb(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def delin(c):
    c = max(0.0, min(1.0, c))
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055


def rgb_to_oklch(rgb):
    r, g, b = (lin(c) for c in rgb)
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = l ** (1 / 3), m ** (1 / 3), s ** (1 / 3)
    L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    return L, math.hypot(a, bb), math.degrees(math.atan2(bb, a)) % 360


def oklch_to_rgb(L, C, H):
    a, b = C * math.cos(math.radians(H)), C * math.sin(math.radians(H))
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    return tuple(delin(c) for c in (r, g, bl))


def to_hex(rgb):
    return "#" + "".join(f"{round(max(0, min(1, c)) * 255):02x}" for c in rgb)


def in_gamut(L, C, H):
    a, b = C * math.cos(math.radians(H)), C * math.sin(math.radians(H))
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    vals = (
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    )
    return all(-0.001 <= v <= 1.001 for v in vals)


def fit(L, C, H):
    """Reduz o croma até caber no gamut sRGB."""
    while C > 0 and not in_gamut(L, C, H):
        C -= 0.004
    return to_hex(oklch_to_rgb(L, max(C, 0), H))


def ink_for(hx):
    """Cor de texto legível sobre `hx` (mesma regra do inkFor de assets/app.js)."""
    def lum(h):
        r, g, b = (lin(c) for c in hex_to_rgb(h))
        return 0.2126 * r + 0.7152 * g + 0.0722 * b

    # escolhe a tinta com maior contraste WCAG: (claro + 0.05) / (escuro + 0.05)
    bg, dark = lum(hx), lum("#111111")
    return "#111111" if (bg + 0.05) / (dark + 0.05) >= 1.05 / (bg + 0.05) else "#ffffff"


def parse_hex(v):
    """Devolve `v` se for um hex (#rgb ou #rrggbb); None para qualquer outro formato de cor."""
    v = (v or "").strip()
    return v if re.fullmatch(r"#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})", v) else None


def to_oklab(rgb):
    r, g, b = (lin(c) for c in rgb)
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s_ = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    return (
        0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s_,
        1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s_,
        0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s_,
    )


def from_oklab(lab):
    L, a, b = lab
    l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s_ = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
    return tuple(delin(c) for c in (
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s_,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s_,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s_,
    ))


def mix_oklab(a_rgb, b_rgb, t):
    """Mistura como o color-mix(in oklab) do CSS: `t` é a parte de b."""
    A, B = to_oklab(a_rgb), to_oklab(b_rgb)
    return from_oklab(tuple(A[i] * (1 - t) + B[i] * t for i in range(3)))


def luminance(rgb):
    r, g, b = (lin(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a_rgb, b_rgb):
    hi, lo = sorted((luminance(a_rgb), luminance(b_rgb)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def floor1(x):
    """Razão de contraste truncada em 1 casa: 4,46 não pode aparecer como 4,5."""
    return math.floor(x * 10) / 10


def feedback_ink(color, fg, backgrounds, target=4.6):
    """Menor % de `fg` misturado em `color` que dá contraste >= target sobre todos os fundos."""
    c, f = hex_to_rgb(color), hex_to_rgb(fg)
    best, best_min = 0, 0.0
    for pct in range(0, 101, 5):
        rgb = mix_oklab(c, f, pct / 100)
        worst = min(contrast(rgb, bg) for bg in backgrounds)
        if worst >= target:
            return pct
        if worst > best_min:  # tema com fundo e superfície opostos (ex.: preto e branco): melhor compromisso
            best, best_min = pct, worst
    return best


def readable_pct(color, toward, backgrounds, target=4.6, start=0):
    """Menor % (de `start` a 100, de 5 em 5) de `toward` misturado em `color` com contraste >= target
    sobre todos os fundos; se nenhum serve, o melhor compromisso."""
    c, f = hex_to_rgb(color), hex_to_rgb(toward)
    best, best_min = start, 0.0
    for pct in range(start, 101, 5):
        rgb = mix_oklab(c, f, pct / 100)
        worst = min(contrast(rgb, bg) for bg in backgrounds)
        if worst >= target:
            return pct
        if worst > best_min:
            best, best_min = pct, worst
    return best


def solid_pair(accent, on):
    """Fundo e texto do botão principal: a cor do DS com o texto indicado por ele, se passar de 4,5:1;
    senão a mesma cor com a melhor tinta; senão a cor escurecida/clareada até passar."""
    a = hex_to_rgb(accent)
    for ink_ in (on, ink_for(accent)):
        if ink_ and contrast(a, hex_to_rgb(ink_)) >= 4.5:
            return accent, ink_
    ink_ = ink_for(accent)
    target = "#000000" if ink_ == "#ffffff" else "#ffffff"  # escurece p/ texto claro, clareia p/ texto escuro
    for pct in range(5, 101, 5):
        rgb = mix_oklab(a, hex_to_rgb(target), pct / 100)
        if contrast(rgb, hex_to_rgb(ink_)) >= 4.5:
            return to_hex(rgb), ink_
    return accent, ink_


def build_scale(base, anchors=()):
    """Escala 50–950 derivada de `base`; cores informadas (`anchors`) ocupam o degrau mais próximo."""
    bL, bC, bH = rgb_to_oklch(hex_to_rgb(base))
    scale = []
    for step, tl in zip(STEPS, L_TARGET):
        # croma cai nas pontas (tons muito claros/escuros), pico perto da base
        k = 1 - min(1, abs(tl - bL) / 0.55) ** 1.6 * 0.75
        scale.append({"step": step, "hex": fit(tl, bC * k, bH), "exact": False})
    # tons informados (ordenados do mais claro ao mais escuro) ocupam degraus em ordem crescente
    given = {}
    for src in [base] + list(anchors):
        if src.lower() not in ("#ffffff", "#000000") or src.lower() == base.lower():
            given.setdefault(src.lower(), rgb_to_oklch(hex_to_rgb(src))[0])
    kept = []  # a base tem prioridade sobre tons parecidos
    for hx, L in sorted(given.items(), key=lambda kv: (kv[0] != base.lower(), -kv[1])):
        if all(abs(L - k[1]) >= 0.045 for k in kept):
            kept.append((hx, L))
    kept.sort(key=lambda k: -k[1])
    last = -1
    for hx, L in kept:
        cands = [i for i in range(last + 1, len(STEPS) - (len(kept) - kept.index((hx, L)) - 1))]
        if not cands:
            break
        i = min(cands, key=lambda i: abs(L_TARGET[i] - L))
        scale[i] = {"step": STEPS[i], "hex": hx, "exact": True}
        last = i
    return scale


def mix(hex_a, hex_b, t):
    a, b = hex_to_rgb(hex_a), hex_to_rgb(hex_b)
    return to_hex(tuple(a[i] * (1 - t) + b[i] * t for i in range(3)))


# ---------------------------------------------------------------- html
def decode_cf_emails(page):
    """O open-design.ai (Cloudflare) ofusca e-mails como <a data-cfemail="hex">[email protected]</a>.
    Devolve o texto original, para que o conteúdo fique igual ao do repositório."""
    def dec(m):
        raw = bytes.fromhex(m.group(1))
        return htmllib.escape("".join(chr(b ^ raw[0]) for b in raw[1:]), quote=False)
    return re.sub(r'<a [^>]*data-cfemail="([0-9a-f]+)"[^>]*>.*?</a>', dec, page, flags=re.S)


ALLOWED = {
    "h1", "h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "em", "code", "pre", "table",
    "thead", "tbody", "tr", "th", "td", "blockquote", "a", "br", "hr", "span",
}
VOID = {"br", "hr"}


class Sanitizer(HTMLParser):
    """Reescreve o HTML mantendo só tags/atributos seguros (conteúdo vem de terceiros)."""

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.out, self.skip = [], 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip += 1
            return
        if self.skip or tag not in ALLOWED:
            return
        extra = ""
        if tag == "a":
            href = dict(attrs).get("href", "")
            if re.match(r"^(https?://|#)", href or ""):
                extra = f' href="{htmllib.escape(href, quote=True)}" target="_blank" rel="noopener"'
        self.out.append(f"<{tag}{extra}>")

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = max(0, self.skip - 1)
            return
        if self.skip or tag not in ALLOWED or tag in VOID:
            return
        self.out.append(f"</{tag}>")

    def handle_data(self, data):
        if not self.skip:
            self.out.append(data)

    def handle_entityref(self, name):
        if not self.skip:
            self.out.append(f"&{name};")

    def handle_charref(self, name):
        if not self.skip:
            self.out.append(f"&#{name};")


def clean(fragment):
    p = Sanitizer()
    p.feed(fragment)
    return "".join(p.out).strip()


def text(fragment):
    return htmllib.unescape(re.sub(r"<[^>]+>", "", fragment)).strip()


# ---------------------------------------------------------------- extração
def block(page, cls):
    m = re.search(rf'<section class="detail-block {cls}"[^>]*>', page)
    if not m:
        raise SystemExit(f"bloco .{cls} não encontrado")
    start = m.end()
    end = page.index("</section>", start)
    return page[start:end]


def parse_tokens(page):
    groups = []
    for g in re.finditer(r'<h3 class="token-group-head"[^>]*>(.*?)</h3>(.*?)</ul>', block(page, "design-tokens"), re.S):
        items = [
            {"name": htmllib.unescape(r.group(1)).strip(), "value": htmllib.unescape(r.group(2)).strip()}
            for r in re.finditer(
                r'<code class="token-name"[^>]*>(.*?)</code>\s*<code class="token-value"[^>]*>(.*?)</code>', g.group(2), re.S
            )
        ]
        groups.append({"group": text(g.group(1)), "items": items})
    return groups


def split_sections(guide_html):
    head, *parts = re.split(r"(?=<h2>)", guide_html)
    sections = []
    for part in parts:
        m = re.match(r"<h2>(.*?)</h2>", part, re.S)
        title = text(m.group(1))
        num = re.match(r"^(\d+)\.\s*(.*)$", title)
        sections.append({
            "id": re.sub(r"[^a-z0-9]+", "-", (num.group(2) if num else title).lower()).strip("-"),
            "title": num.group(2) if num else title,
            "html": clean(part[m.end():]),
        })
    intro = re.search(r"<blockquote>(.*?)</blockquote>", head, re.S)
    return (clean(intro.group(1)) if intro else ""), sections


def guide_colors(raw_guide):
    """Cores nomeadas no guia: <li><strong>Nome</strong> ... <code>#hex</code> ...</li> (vários formatos)."""
    out, seen = [], set()
    for li in re.findall(r"<li>(.*?)</li>", raw_guide, re.S):
        m = re.match(r"\s*<strong>([^<]+)</strong>", li)
        h = re.search(r"<code>(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})</code>", li)
        if not m or not h:
            continue
        hx = h.group(1).lower()
        name = text(m.group(1)).rstrip(":").strip()
        if hx in seen or not name or len(name) > 40:
            continue
        seen.add(hx)
        rest = text(re.sub(r"^\s*<strong>[^<]+</strong>", "", li))
        out.append({"name": name, "hex": hx, "role": rest[:200]})
    return out


def token_map(groups):
    return {i["name"]: i["value"] for g in groups for i in g["items"]}


KIND_WORDS = (
    ("mono", "mono"), ("code", "mono"), ("display", "display"), ("heading", "display"),
    ("title", "display"), ("headline", "display"), ("body", "body"), ("ui", "body"),
    ("text", "body"), ("primary", "primary"), ("sans", "primary"), ("serif", "primary"),
)
ROLE_PT = {"mono": "Monoespaçada", "display": "Títulos", "body": "Corpo", "primary": "Principal"}
ROLE_EN = {"mono": "Monospace", "display": "Headings", "body": "Body", "primary": "Primary"}

# Textos traduzíveis ficam como [{"lang": "en-US", "message": ...}, {"lang": "pt-BR", "message": ...}].
# pt-BR só entra onde há tradução confiável; o resto fica só em inglês (o app cai para en-US).
GROUP_PT = {
    "Surface": "Superfície", "Text": "Texto", "Border": "Borda", "Accent": "Destaque",
    "Semantic": "Semântico", "Typography": "Tipografia", "Type scale": "Escala tipográfica",
    "Spacing": "Espaçamento", "Radius": "Raio", "Elevation": "Elevação", "Focus": "Foco",
    "Motion": "Movimento", "Layout": "Layout",
}
TITLE_PT = {
    "Visual Theme & Atmosphere": "Tema visual e atmosfera",
    "Color Palette & Roles": "Paleta de cores e papéis",
    "Typography Rules": "Regras de tipografia",
    "Component Stylings": "Estilo dos componentes",
    "Layout Principles": "Princípios de layout",
    "Depth & Elevation": "Profundidade e elevação",
    "Do's and Don'ts": "O que fazer e o que evitar",
    "Responsive Behavior": "Comportamento responsivo",
    "Agent Prompt Guide": "Guia de prompts para agentes",
    "Color": "Cor", "Typography": "Tipografia", "Spacing & Grid": "Espaçamento e grid",
    "Spacing": "Espaçamento", "Layout & Composition": "Layout e composição",
    "Components": "Componentes", "Motion & Interaction": "Movimento e interação",
    "Layout & Spacing": "Layout e espaçamento", "Elevation & Depth": "Elevação e profundidade",
    "Shapes": "Formas",
}


def i18n(en, pt=None):
    out = [{"lang": "en-US", "message": en}]
    if pt:
        out.append({"lang": "pt-BR", "message": pt})
    return out


# Traduções do conteúdo de cada DS: i18n/<lang>/<slug>.html (fora do .cache, que é descartável).
# Formato: <p data-field="tagline">…</p> + um <section data-section="<id>"><h2>Título</h2>…</section>
# por seção do guia. Seções ausentes ou vazias continuam só em inglês (o app cai para en-US).
I18N_DIR = "i18n"
TRANSLATED_LANGS = ["pt-BR"]
PENDING = "TRADUCAO-PENDENTE"


def load_translation(slug, lang):
    path = os.path.join(I18N_DIR, lang, f"{slug}.html")
    if not os.path.exists(path):
        return None
    src = open(path, encoding="utf-8").read()
    if PENDING in src:  # template ainda não traduzido
        return None
    src = re.sub(r"<!--.*?-->", "", src, flags=re.S)
    tag = re.search(r'<p data-field="tagline">(.*?)</p>', src, re.S)
    sections = {}
    for m in re.finditer(r'<section data-section="([^"]+)">(.*?)</section>', src, re.S):
        body = m.group(2)
        h = re.search(r"<h2>(.*?)</h2>", body, re.S)
        html = clean(body[h.end():] if h else body)
        if html or h:  # seção só com título (sem corpo) também é traduzível
            sections[m.group(1)] = {"title": text(h.group(1)) if h else None, "html": html}
    return {"tagline": text(tag.group(1)) if tag else None, "sections": sections}


def add_lang(value, lang, message):
    """Acrescenta (ou troca) a mensagem de `lang` num campo [{lang, message}]."""
    if not message:
        return value
    if isinstance(value, str):
        value = i18n(value)
    return [x for x in value if x["lang"] != lang] + [{"lang": lang, "message": message}]


def write_template(slug, lang):
    """Gera i18n/<lang>/<slug>.html com o texto em inglês, pronto para ser traduzido."""
    page = open(os.path.join(".cache", "pages", f"design-system-{slug}.html"), encoding="utf-8", errors="replace").read()
    page = decode_cf_emails(page)
    _intro, sections = split_sections(block(page, "designmd-body"))
    entry = catalog_entry(slug)
    path = os.path.join(I18N_DIR, lang, f"{slug}.html")
    if os.path.exists(path):
        raise SystemExit(f"{path} já existe (não sobrescrevo traduções)")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    out = [f"<!-- {PENDING}: remova esta linha ao terminar a tradução. -->",
           f"<!-- design-system-{slug} · {lang}. Traduza só o texto; mantenha tags, data-section, <code> e valores. -->",
           f'<p data-field="tagline">{htmllib.escape(entry.get("tagline", ""), quote=False)}</p>', ""]
    for sec in sections:
        out += [f'<section data-section="{sec["id"]}">', f'<h2>{htmllib.escape(sec["title"], quote=False)}</h2>',
                sec["html"], "</section>", ""]
    open(path, "w", encoding="utf-8").write("\n".join(out))
    print(f"template -> {path}")
NOT_FAMILY = re.compile(r"^(-|\d|text-|font-|letter|line|var\(|rgba?\(|hsla?\(|#|\.|[0-9.]+(px|em|rem))", re.I)


def kind_of(role):
    r = role.lower()
    for word, kind in KIND_WORDS:
        if word in r:
            return kind
    return "primary"


def typography_section(raw_guide):
    m = re.search(r"<h2>(?:\d+\.\s*)?Typograph[^<]*</h2>(.*?)(?=<h2>|$)", raw_guide, re.S)
    return m.group(1) if m else ""


SKIP_STRONG = ("no ", "opentype", "weights", "scale", "principle", "font selection", "site-wide", "all values", "note", "system")


def fallback_fonts(sec, add):
    """Formatos menos comuns: blocos CSS, <h3>Font: ...</h3>, <strong>Papel:</strong> Nome, <strong>Nome</strong> — ..."""
    keep = lambda role, fam, fb=(): add(role, fam, list(fb))  # noqa: E731

    # S1: declarações CSS (--font-sans: "Inter", ...; --serif: ...; font-family: ...)
    seen_vars = set()
    for var, val in re.findall(r"(--[\w-]+|font-family)\s*:\s*([^;]+);", htmllib.unescape(re.sub(r"<[^>]+>", "", sec))):
        if var in seen_vars or "font" not in var and var not in ("--serif", "--sans", "--mono", "--display", "--body"):
            continue
        seen_vars.add(var)
        role = "mono" if "mono" in var else ("display" if "display" in var else ("serif" if "serif" in var else "primary"))
        keep(role, val)
    if len(sec) and not seen_vars:
        # S2: <h3>Font: <code>X</code>, fallback: <code>Y</code></h3>
        m = re.search(r"<h3>Font:\s*<code>(.*?)</code>(?:,\s*fallback:\s*<code>(.*?)</code>)?", sec, re.S)
        if m:
            keep("primary", text(m.group(1)), [text(m.group(2))] if m.group(2) else [])
        # S3: <strong>Papel:</strong> Nome (descrição)
        for role, rest in re.findall(r"<strong>([^<:]{2,30}):</strong>\s*([^<(—\-]{2,40})", sec):
            if role.lower().startswith(SKIP_STRONG):
                continue
            keep(role, text(rest))
        # S4: <strong>Nome</strong> (…) | — … fallback …
        for name, rest in re.findall(r"<li><strong>([^<]{2,40})</strong>([^<]{0,60}(?:fallback|typeface|font|sans|serif|display|mono)[^<]*)", sec, re.I):
            if name.lower().startswith(SKIP_STRONG) or name.rstrip().endswith(":"):
                continue
            blob = name + " " + rest
            role = "mono" if "mono" in blob.lower() else ("display" if "display" in blob.lower() else "primary")
            fb = re.findall(r"<code>(.*?)</code>", sec[sec.find(name):sec.find(name) + 400], re.S)[:3]
            keep(role, text(name), [text(x) for x in fb])
        # S5: tabela Role | Family | Fallback
        for role, fam, fb in re.findall(r"<tr><td>([^<]+)</td><td><code>(.*?)</code></td><td><code>(.*?)</code></td></tr>", sec, re.S):
            keep(role, text(fam), [x.strip() for x in text(fb).split(",") if x.strip()])


def parse_fonts(raw_guide):
    sec = typography_section(raw_guide)
    fonts = []

    def add(role, family, fallbacks):
        family = family.strip()
        if "," in family:  # pilha inteira: primeira família + resto como fallback
            parts = [x.strip().strip('"').strip("'") for x in family.split(",")]
            family, fallbacks = parts[0], [x for x in parts[1:] if x] + list(fallbacks)
        family = family.strip().strip('"').strip("'")
        if (not family or NOT_FAMILY.match(family) or len(family) > 40 or len(family.split()) > 5
                or family.lower() in ("sans-serif", "serif", "monospace", "system-ui", "primary", "secondary", "display", "body", "mono", "ui", "text", "heading")
                or family.lower().startswith("ui-") or "/" in family
                or re.search(r"[.!?:]$|\b(tracking|scale|register|identity|with|ultra|compact|two|three|four|used?|system|case|as|faces?|headlines?|emphasis|tool|tight|body-font)\b", family, re.I)):
            return
        fonts.append({"role": role, "family": family, "fallbacks": fallbacks})

    # formato "Families: primary=X, display=Y, mono=Z"
    m = re.search(r"<strong>Famil[^<]*</strong>\s*(.*?)</li>", sec, re.S)
    if m and "=" in m.group(1):
        for role, fam in re.findall(r"(\w+)\s*=\s*([^,<]+)", text(m.group(1))):
            add(role, fam, [])
    else:
        # lista de "<strong>Papel</strong>: <code>Família</code>[, fallbacks: <code>a, b</code>]"
        part = sec
        h = re.search(r"<h3>[^<]*Famil[^<]*</h3>(.*?)(?=<h3>|$)", sec, re.S)
        if h:
            part = h.group(1)
        for li in re.findall(r"<li>(.*?)</li>", part, re.S):
            m = re.match(r"\s*<strong>(.*?)</strong>\s*:?\s*(?:<code>(.*?)</code>)?", li, re.S)
            if not m or not m.group(2):
                continue
            role = text(m.group(1)).rstrip(":")
            if role.lower().startswith(("opentype", "weights", "scale")):
                continue
            codes = re.findall(r"<code>(.*?)</code>", li, re.S)
            fb = [f.strip() for f in text(codes[1]).split(",")] if len(codes) > 1 else []
            add(role, text(m.group(2)), [f for f in fb if f])
    if not fonts:
        fallback_fonts(sec, add)
    # junta famílias repetidas
    merged, seen = [], {}
    for f in fonts:
        k = f["family"].lower()
        if k in seen:
            seen[k]["roles"].append(f["role"])
            continue
        f["roles"] = [f["role"]]
        seen[k] = f
        merged.append(f)
    return merged


_GF_CACHE_PATH = os.path.join(".cache", "gfonts.json")
_GF = json.load(open(_GF_CACHE_PATH, encoding="utf-8")) if os.path.exists(_GF_CACHE_PATH) else {}


def google_font(family):
    """Devolve {css, italic} se a família existe no Google Fonts; None caso contrário (cache em .cache/)."""
    if family in _GF:
        return _GF[family]
    import time
    import urllib.parse
    import urllib.request

    q = urllib.parse.quote_plus(family)
    tries = [
        (f"{q}:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700", True),
        (f"{q}:ital,wght@0,400;0,700;1,400;1,700", True),
        (f"{q}:wght@400;500;600;700", False),
        (f"{q}:wght@400;700", False),
        (f"{q}", False),
    ]
    result = None
    for qs, italic in tries:
        url = f"https://fonts.googleapis.com/css2?family={qs}&display=swap"
        try:
            urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=20).read(64)
            result = {"css": url, "italic": italic}
            break
        except Exception:
            time.sleep(0.15)
    _GF[family] = result
    os.makedirs(".cache", exist_ok=True)
    json.dump(_GF, open(_GF_CACHE_PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    return result


def font_role(roles):
    en, pt, ok = [], [], True
    for r in roles:
        k = kind_of(r)
        if k != "primary" or r.lower() in ("primary",):
            en.append(ROLE_EN[k])
            pt.append(ROLE_PT[k])
        else:  # papel livre do guia: sem tradução conhecida
            en.append(r.strip().capitalize())
            ok = False
    en = " / ".join(dict.fromkeys(en))
    return i18n(en, " / ".join(dict.fromkeys(pt)) if ok else None)


_GENERIC_FAMILIES = {"serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "ui-serif", "ui-sans-serif",
                     "ui-monospace", "ui-rounded", "-apple-system", "blinkmacsystemfont", "emoji", "math", "fangsong"}


def normalize_fallbacks(items, family):
    """Separa fallbacks "colados" (uma string com vírgulas vira várias famílias), tira aspas e repetições."""
    out = []
    for item in items:
        for part in re.split(r",\s*", item):
            part = part.strip().strip("\"'").strip()
            if part and part.lower() != family.lower() and part.lower() not in (x.lower() for x in out):
                out.append(part)
    return out


def css_family(name):
    """Nome de família pronto para font-family: aspas só quando precisa."""
    return name if name.lower() in _GENERIC_FAMILIES or re.fullmatch(r"[\w-]+", name) else f'"{name}"'


# Famílias que a API do Google Fonts entrega, mas que são proprietárias ("licenciadas ao Google"):
# não podem ser hospedadas por terceiros, então o site não as usa nem redistribui.
NOT_REDISTRIBUTABLE = {"Helvetica", "Helvetica Neue"}

# Nomes do guia que são fontes abertas sob outro nome: carregam a família equivalente do Google Fonts.
FONT_ALIASES = {
    "Inter Variable": "Inter",
    "GeistMono": "Geist Mono",
    "SourceCodePro": "Source Code Pro",
    "IBM Plex Sans Variable": "IBM Plex Sans",
    "SofiaSans": "Sofia Sans",
    "inter": "Inter",
    "jetbrains-mono": "JetBrains Mono",
    "NotionInter": "Inter",  # variação do Inter (OFL) usada pelo Notion
}

# Só entra na lista de "fontes proprietárias indisponíveis" a fonte de MARCA (ex.: a do Itaú), que não é distribuída
# pelo Google Fonts nem acompanha um sistema operacional. Fontes do Google, do sistema (Apple, Windows, Android,
# Linux) e fontes livres não são problema e não geram aviso.
OS_FONTS = {
    # genéricas do CSS
    "serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "ui-sans-serif", "ui-serif",
    "ui-monospace", "ui-rounded", "-apple-system", "blinkmacsystemfont",
    # Apple (macOS/iOS)
    "sf pro", "sf pro display", "sf pro text", "sf pro rounded", "sf mono", "sf compact", "new york",
    "helvetica", "helvetica neue", "avenir", "avenir next", "futura", "gill sans", "optima", "palatino",
    "baskerville", "american typewriter", "menlo", "monaco", "courier", "times", "apple color emoji",
    "pingfang sc", "pingfang tc", "hiragino sans",
    # Windows
    "arial", "times new roman", "georgia", "courier new", "verdana", "tahoma", "trebuchet ms", "impact",
    "comic sans ms", "segoe ui", "segoe ui emoji", "calibri", "cambria", "consolas", "microsoft yahei",
    # Android, Linux e emoji
    "roboto", "noto color emoji", "dejavu sans", "liberation sans", "cantarell",
}

# Livres (licença aberta), mesmo fora do Google Fonts: não são problema.
FREE_FONTS = {"charter", "d-din", "d-din-bold", "open runde", "commitmono", "commit mono"}


def is_proprietary_unavailable(family, has_source):
    """Fonte de marca do guia que não está no site, não é do Google nem do sistema e não é livre."""
    f = family.strip().lower()
    if has_source or f in OS_FONTS or f in FREE_FONTS:
        return False
    if f.startswith("sf pro") or re.search(r"icon|emoji|font awesome", f):
        return False
    return True


def describe_fonts(fonts):
    out = []
    for f in fonts:
        f = {**f, "fallbacks": normalize_fallbacks(f["fallbacks"], f["family"])}
        kinds = [kind_of(r) for r in f["roles"]]
        kind = "mono" if "mono" in kinds else ("display" if "display" in kinds else ("body" if "body" in kinds else "primary"))
        generic = "monospace" if kind == "mono" else "sans-serif"
        lookup = FONT_ALIASES.get(f["family"], f["family"])
        g = None if lookup in NOT_REDISTRIBUTABLE else google_font(lookup)
        if g and lookup != f["family"]:
            # a família aberta equivalente entra logo depois do nome do guia na pilha
            f = {**f, "fallbacks": [lookup] + [x for x in f["fallbacks"] if x.lower() != lookup.lower()]}
        entry = {
            "proprietary": is_proprietary_unavailable(f["family"], bool(g)),
            "role": font_role(f["roles"]),
            "kind": kind,
            "family": f["family"],
            "fallbacks": f["fallbacks"],
            "stack": ", ".join(dict.fromkeys([f'"{f["family"]}"'] + [css_family(x) for x in f["fallbacks"]] + [generic])),
            "italic": bool(g and g["italic"]),
            "source": None,
        }
        if g:
            slug = lookup.lower().replace(" ", "-")
            entry["source"] = {
                "kind": "google",
                "css": g["css"],
                "page": "https://fonts.google.com/specimen/" + lookup.replace(" ", "+"),
                "link": '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
                        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
                        f'<link rel="stylesheet" href="{g["css"]}">',
                "import": f"@import url('{g['css']}');",
                "npm": f"npm i @fontsource/{slug}",
            }
        out.append(entry)
    return out


CAT_PT = {
    "Themed & Unique": "Temáticos & únicos", "E-Commerce & Retail": "E-commerce & varejo",
    "Design & Creative": "Design & criativo", "Professional & Corporate": "Profissional & corporativo",
    "Media & Consumer": "Mídia & consumo", "Productivity & SaaS": "Produtividade & SaaS",
    "Creative & Artistic": "Criativo & artístico", "Layout & Structure": "Layout & estrutura",
    "Fintech & Crypto": "Fintech & cripto", "Automotive": "Automotivo",
    "Bold & Expressive": "Ousado & expressivo", "Backend & Data": "Backend & dados",
    "AI & LLM": "IA & LLM", "Morphism & Effects": "Morphism & efeitos",
    "Modern & Minimal": "Moderno & minimal", "Developer Tools": "Ferramentas de desenvolvedor",
    "Retro & Nostalgic": "Retrô & nostálgico", "Starter": "Starter",
}


def catalog_entry(slug):
    """Categoria e tagline do catálogo (data/systems-raw.json) para o DS `slug`."""
    for d in json.load(open(os.path.join("data", "systems-raw.json"), encoding="utf-8")):
        if d["href"].strip("/").endswith("design-system-" + slug):
            return d
    return {}


def hue_dist(a, b):
    d = abs(a - b) % 360
    return min(d, 360 - d)


def build_palettes(tokens, colors):
    """Agrupa as cores por matiz e devolve (paletas, papéis primário/secundário/neutro)."""
    tk = token_map(tokens)
    accent_hex = tk.get("--accent", "")
    cands = []  # (nome, hex) na ordem de importância
    if re.match(r"^#[0-9a-f]{6}$", accent_hex, re.I):
        cands.append(("Accent", accent_hex.lower()))
    cands += [(c["name"], c["hex"]) for c in colors]
    for key, label in (("--success", "Success"), ("--warn", "Warning"), ("--danger", "Danger")):
        if re.match(r"^#[0-9a-f]{6}$", tk.get(key, ""), re.I):
            cands.append((label, tk[key].lower()))

    neutrals, chroma = [], []
    for name, hx in cands:
        L, C, H = rgb_to_oklch(hex_to_rgb(hx))
        (neutrals if C < 0.012 else chroma).append((name, hx, L, C, H))
    for key in ("--fg", "--fg-2", "--muted", "--meta", "--bg"):
        v = tk.get(key, "")
        if re.match(r"^#[0-9a-f]{6}$", v, re.I) and v.lower() not in [n[1] for n in neutrals]:
            L, C, H = rgb_to_oklch(hex_to_rgb(v))
            if C < 0.012:
                neutrals.append((key, v.lower(), L, C, H))

    groups = []  # cada grupo: matiz distinto
    for name, hx, L, C, H in chroma:
        for g in groups:
            if hue_dist(g["H"], H) < 14:
                g["members"].append(hx)
                g["names"].append(name)
                break
        else:
            groups.append({"name": name, "base": hx, "H": H, "members": [hx], "names": [name]})

    for g in groups:  # nome descritivo: primeira cor nomeada pelo guia, em vez de "Accent"
        if g["name"] == "Accent":
            g["name"] = next((n for n in g["names"] if n != "Accent"), "Accent")
    palettes = []
    for g in groups[:8]:
        palettes.append({"name": g["name"], "base": g["base"], "derived": True,
                         "scale": build_scale(g["base"], g["members"])})
    if neutrals:
        base = sorted(neutrals, key=lambda n: abs(n[2] - 0.5))[0][1]
        palettes.append({"name": "Neutral", "base": base, "derived": True,
                         "scale": build_scale(base, [n[1] for n in neutrals])})

    roles = {"primary": palettes[0]["name"] if groups else ("Neutral" if neutrals else None),
             "neutral": "Neutral" if neutrals else None, "secondary": None}
    if groups:
        prim_h = groups[0]["H"]
        named = [g for g in groups[1:] if any(n.lower().startswith("secondary") for n in g["names"])]
        if named:
            roles["secondary"] = named[0]["name"]
        semantic = ("Success", "Warning", "Danger")
        for g in ([] if roles["secondary"] else [x for x in groups[1:] if x["name"] not in semantic]):
            if hue_dist(g["H"], prim_h) >= 30 and rgb_to_oklch(hex_to_rgb(g["base"]))[1] >= 0.08:
                roles["secondary"] = g["name"]
                break
    return palettes, roles


def font_weight_ranges(font):
    """Faixas (mín, máx) de peso baixadas para o estilo normal da fonte (assets/fonts/manifest.json)."""
    css = (font.get("source") or {}).get("css")
    out = []
    for face in (font_manifest().get(css, []) if css else []):
        if face.get("style", "normal") != "normal" or face.get("family", "").lower() != font["family"].lower():
            continue
        try:
            nums = [int(x) for x in str(face.get("weight", "400")).split()]
        except ValueError:
            continue
        if nums:
            out.append((min(nums), max(nums)))
    return out


# Papéis tipográficos do guia (tabela "Hierarchy" da seção de tipografia): papel do site -> nomes do guia.
TYPE_ROLE_NAMES = {
    "display": re.compile(r"^(display( hero| large| secondary)?|display / hero|hero( display| title)?|heading 1|h1|headline)$"),
    "h2": re.compile(r"^(section (heading|title|display)|heading 2|h2|page title)$"),
    "h3": re.compile(r"^(sub-?heading( large)?|card (title|heading)|feature (title|heading)|heading 3|h3|heading)$"),
    "body": re.compile(r"^(body|body (regular|standard|text|default)|paragraph)$"),
    "button": re.compile(r"^(button|button (label|text|large)|body / button|nav / ui)$"),
    "label": re.compile(r"^(label|uppercase label|overline|eyebrow|micro label|kicker|section label)$"),
}
WEIGHT_WORDS = (("extra", 800), ("black", 900), ("semi", 600), ("bold", 700), ("medium", 500), ("regular", 400),
                ("normal", 400), ("light", 300), ("thin", 100))
# recursos OpenType aceitos (lista fechada: o valor entra num font-feature-settings)
FEATURE_TAG = re.compile(r"^(ss\d\d|cv\d\d|liga|calt|kern|lnum|locl|cswh|dlig|salt|zero|case|frac)$")


def parse_weight(cell):
    """Peso de uma célula do guia: número (300, 300-400 -> o maior) ou palavra (Regular, Medium...)."""
    nums = [int(n) for n in re.findall(r"\b([1-9]00)\b", cell)]
    if nums:
        return max(nums)
    low = cell.lower()
    for word, w in WEIGHT_WORDS:
        if word in low:
            return w
    return None


def parse_type_roles(raw_guide):
    """Peso por papel, espaçamento do rótulo, caixa do rótulo e recursos OpenType, lidos da seção de tipografia
    do guia. Guias sem tabela de hierarquia (modelos genéricos) devolvem {} e o site usa os padrões."""
    _intro, secs = split_sections(raw_guide)
    sec = next((s for s in secs if s["id"].startswith("typography")), None)
    if not sec:
        return {}
    html_ = sec["html"]
    out = {"weights": {}, "features": []}
    table = re.search(r"<table>(.*?)</table>", html_, re.S)
    if table:
        heads = [text(h).lower() for h in re.findall(r"<th>(.*?)</th>", table.group(1), re.S)]
        wi = heads.index("weight") if "weight" in heads else None
        ti = next((i for i, h in enumerate(heads) if h.startswith("letter")), None)
        for tr in re.findall(r"<tr>(.*?)</tr>", table.group(1), re.S)[1:]:
            cells = [text(c) for c in re.findall(r"<td>(.*?)</td>", tr, re.S)]
            if not cells or wi is None or wi >= len(cells):
                continue
            name = cells[0].lower().strip()
            for role, rx in TYPE_ROLE_NAMES.items():
                if rx.match(name) and role not in out["weights"]:
                    w = parse_weight(cells[wi])
                    if w:
                        out["weights"][role] = w
                    if role == "label":
                        row = " ".join(cells).lower()
                        if ti is not None and ti < len(cells):
                            m = re.search(r"(-?[\d.]+)\s*(px|em)", cells[ti])
                            if m:
                                out["label_tracking"] = (float(m.group(1)), m.group(2))
                        if re.search(r"sentence case|lowercase|not uppercase|no uppercase", row):
                            out["label_transform"] = "none"
    avoid = re.search(r"Avoid:?\s*(?:</strong>)?\s*((?:[1-9]00\s*,?\s*(?:and\s+)?)+)", html_)
    if avoid:
        out["avoid_weights"] = sorted({int(n) for n in re.findall(r"[1-9]00", avoid.group(1))})
    for li in re.findall(r"<li>(.*?)</li>", html_, re.S):
        if re.search(r"opentype|font-feature|stylistic", li, re.I):
            for tag in re.findall(r"<code>(?:&quot;|\")?([a-z0-9]{3,4})(?:&quot;|\")?</code>", li):
                if FEATURE_TAG.match(tag) and tag not in out["features"]:
                    out["features"].append(tag)
    return out


def parse_button_spec(raw_guide):
    """Raio e padding do botão principal, quando o guia os escreve de forma explícita ("Radius: 8px",
    "Padding: 10px 20px") no primeiro bloco de botão da seção de componentes."""
    _intro, secs = split_sections(raw_guide)
    sec = next((s for s in secs if s["id"].startswith("component")), None)
    if not sec:
        return {}
    m = re.search(r"<h3>[^<]*[Bb]utton[^<]*</h3>(.*?)(?=<h3>|$)", sec["html"], re.S)
    if not m:
        return {}
    t = re.sub(r"\s+", " ", text(m.group(1)))
    out = {}
    r = re.search(r"[Rr]adius:\s*(?:(\d{1,2})px|(full|pill|9999px))", t)
    if r:
        out["radius"] = int(r.group(1)) if r.group(1) else 999
    p = re.search(r"[Pp]adding:\s*(\d{1,2})px\s+(\d{1,2})px", t)
    if p:
        out["pad"] = (int(p.group(1)), int(p.group(2)))
    return out


_CSS_COLOR = r"(?:#[0-9a-fA-F]{3,8}|rgba?\([\d., %]+\))"


def parse_nav_toggle_policy(raw_guide):
    """Política do guia para o botão do menu hambúrguer: raio, borda e fundo, quando escritos de forma explícita.
    Dois formatos: frase ("hamburger toggle at 12px radius") ou bloco de botão que termina em "Use: ... menu toggle"."""
    _intro, secs = split_sections(raw_guide)
    out = {}
    for sec in secs:
        if not sec["id"].startswith("component"):
            continue
        plain = re.sub(r"\s+", " ", text(sec["html"]))
        # 1. frase: o raio vem ao lado de "hamburger"
        m = re.search(r"hamburger[^.;]{0,60}?(\d{1,2})px radius|(\d{1,2})px radius[^.;]{0,30}?hamburger", plain, re.I)
        if m:
            out["radius"] = f"{m.group(1) or m.group(2)}px"
        # 2. bloco de botão: as propriedades vêm antes de "Use: ... menu toggle"
        # "Use:" / "Used for" com maiúscula (sem isso casaria "uses inset box-shadow..."); os itens do guia vêm
        # sem espaço entre si ("0.08)Use: ..."), então não dá para exigir fronteira de palavra
        for u in re.finditer(r"(?:Use:|Used for)[^.]{0,80}?(?:menu toggles?|hamburger)", plain):
            blk = plain[max(0, u.start() - 320):u.start()]
            r = re.findall(r"[Rr]adius:\s*(\d{1,3}(?:px|%))", blk)
            if r:
                out["radius"] = r[-1]
            b = re.findall(r"Border:\s*(\d{1,2}px solid " + _CSS_COLOR + ")", blk)
            if b:
                out["border"] = b[-1]
            bg = re.findall(r"Background:\s*(" + _CSS_COLOR + ")", blk)
            if bg:
                out["bg"] = bg[-1]
    return out


def pick_weight(ranges, want=600):
    """Peso mais próximo de `want` que a fonte realmente tem (sem passar dele, se possível)."""
    for lo, hi in ranges:
        if lo <= want <= hi:
            return want
    discrete = sorted({hi for _lo, hi in ranges})
    below = [w for w in discrete if w <= want]
    return max(below) if below else min(discrete)


def theme_vars(tokens, palettes, roles, fonts, adjustments=None, type_roles=None):
    """Variáveis CSS do site para este DS. Derivados usam color-mix para funcionar em temas claros e escuros.

    `adjustments` (lista) recebe os tokens cuja cor do DS ficou abaixo de 4,5:1 (WCAG 2.2 AA) e foi trocada:
    {token, from, to, ratioFrom, ratioTo[, onFrom, onTo]}. A página mostra isso num aviso."""
    tk = token_map(tokens)
    adjustments = adjustments if adjustments is not None else []

    def note(token, before, after, r_before, r_after, **extra):
        adjustments.append({"token": token, "from": before.lower(), "to": after.lower(),
                            "ratioFrom": floor1(r_before), "ratioTo": floor1(r_after), **extra})

    def g(key, default=None):
        """Valor do token, seguindo referências simples (--a: var(--b))."""
        v = tk.get(key, default)
        for _ in range(6):
            m = re.fullmatch(r"var\((--[\w-]+)\)", (v or "").strip())
            if not m or m.group(1) not in tk or m.group(1) == key:
                break
            v = tk[m.group(1)]
        return v

    def num(key, unit):
        m = re.fullmatch(r"(-?[\d.]+)" + unit, (g(key) or "").strip())
        return float(m.group(1)) if m else None

    def clamp(v, lo, hi, default):
        return default if v is None else min(max(v, lo), hi)

    def font(*kinds):
        for k in kinds:
            f = next((f for f in fonts if f["kind"] == k), None)
            if f:
                return f["stack"]
        return None

    sans = font("primary", "body", "display")
    display = font("display", "primary", "body") or sans or "system-ui, sans-serif"
    body = font("body", "primary", "display") or display
    code = font("mono") or "ui-monospace, SFMono-Regular, Menlo, monospace"
    prim = next((p for p in palettes if p["name"] == roles["primary"]), None)
    accent = g("--accent", prim["base"] if prim else "#0070f3")
    neut = next((p for p in palettes if p["name"] == roles["neutral"]), None)
    shades = {}  # tons da escala usados no header/footer (ausentes -> CSS cai para --bg)
    for var, pal, step in (("--primary-500", prim, 500), ("--neutral-400", neut, 400)):
        hx = next((c["hex"] for c in (pal or {}).get("scale", []) if c["step"] == step), None)
        if hx:
            shades[var] = hx
            shades[var + "-fg"] = ink_for(hx)
    # Texto de feedback (erro, sucesso, atenção) legível em qualquer tema: mistura a cor com --fg
    # até passar de 4,5:1 sobre o fundo, a superfície e o fundo suave do próprio alerta.
    ink = {}
    fg_hex, bg_hex = parse_hex(g("--fg", "#171717")), parse_hex(g("--bg", "#ffffff"))
    sf_hex = parse_hex(g("--surface", g("--bg", "#ffffff"))) or bg_hex
    surface_css = g("--surface", g("--bg", "#ffffff"))
    if fg_hex and sf_hex and contrast(hex_to_rgb(fg_hex), hex_to_rgb(sf_hex)) < 3:
        # o texto do tema não é legível sobre a superfície do DS: usa uma superfície derivada do fundo
        sf_rgb = mix_oklab(hex_to_rgb(bg_hex or "#ffffff"), hex_to_rgb(fg_hex), 0.06)
        note("--surface", sf_hex, to_hex(sf_rgb), contrast(hex_to_rgb(fg_hex), hex_to_rgb(sf_hex)),
             contrast(hex_to_rgb(fg_hex), sf_rgb))
        sf_hex, surface_css = to_hex(sf_rgb), to_hex(sf_rgb)
    for name, key, default, weak in (("ok", "--success", "#16a34a", 0.12), ("warn", "--warn", "#eab308", 0.14),
                                     ("danger", "--danger", "#dc2626", 0.12)):
        col = parse_hex(g(key, default))
        if col and fg_hex and bg_hex:
            bg_rgb = hex_to_rgb(bg_hex)
            bgs = [bg_rgb, hex_to_rgb(sf_hex), mix_oklab(bg_rgb, hex_to_rgb(col), weak)]
            pct = feedback_ink(col, fg_hex, bgs)
            if pct:
                before = min(contrast(hex_to_rgb(col), b) for b in bgs)
                if before < 4.5:
                    mixed = mix_oklab(hex_to_rgb(col), hex_to_rgb(fg_hex), pct / 100)
                    note(f"--{name}-ink", col, to_hex(mixed), before, min(contrast(mixed, b) for b in bgs))
        else:
            pct = 40  # cor em formato não-hex: mistura fixa
        ink[f"--{name}-ink"] = f"var(--{name})" if pct == 0 else f"color-mix(in oklab, var(--{name}) {100 - pct}%, var(--fg))"
        if col:
            ink[f"--{name}-fg"] = ink_for(col)  # texto sobre o botão preenchido com a cor
    # ---- detalhes do guia (seções 2 a 6): superfícies, texto secundário, botão principal e links
    bg_c = bg_hex or "#ffffff"
    surf_c = sf_hex or bg_c
    fg_c = fg_hex or "#171717"
    surface_warm = parse_hex(g("--surface-warm"))
    # fundo secundário (hero, cabeçalhos de tabela, hover): o "surface-warm" do DS, se o texto for legível sobre ele
    use_warm = bool(surface_warm and surface_warm.lower() not in (bg_c.lower(), surf_c.lower())
                    and contrast(hex_to_rgb(fg_c), hex_to_rgb(surface_warm)) >= 4.5)
    surface2_rgb = hex_to_rgb(surface_warm) if use_warm else mix_oklab(hex_to_rgb(bg_c), hex_to_rgb(fg_c), 0.04)
    surface2_css = surface_warm if use_warm else "color-mix(in oklab, var(--bg), var(--fg) 4%)"
    accent_weak_rgb = None
    if parse_hex(accent):
        accent_weak_rgb = mix_oklab(hex_to_rgb(bg_c), hex_to_rgb(parse_hex(accent)), 0.12)  # faixa --accent-weak
    base_bgs = [hex_to_rgb(bg_c), hex_to_rgb(surf_c), surface2_rgb] + ([accent_weak_rgb] if accent_weak_rgb else [])

    def readable(key, report_as, fallback_css, target=4.7):
        """Cor do token se tiver contraste suficiente sobre fundo, superfície e fundo secundário;
        senão a mesma cor misturada com --fg até ter."""
        col = parse_hex(g(key))
        if not col:
            return fallback_css
        pct = readable_pct(col, fg_c, base_bgs, target)
        if pct:
            before = min(contrast(hex_to_rgb(col), b) for b in base_bgs)
            if before < 4.5:
                mixed = mix_oklab(hex_to_rgb(col), hex_to_rgb(fg_c), pct / 100)
                note(report_as, col, to_hex(mixed), before, min(contrast(mixed, b) for b in base_bgs))
        return col if pct == 0 else f"color-mix(in oklab, {col} {100 - pct}%, var(--fg))"

    def derived(start_pct, target=4.7):
        """Texto secundário derivado (--fg misturado ao fundo), com a parte de --fg subindo até ter contraste."""
        for pct in range(start_pct, 101, 5):
            rgb = mix_oklab(hex_to_rgb(bg_c), hex_to_rgb(fg_c), pct / 100)
            if all(contrast(rgb, b) >= target for b in base_bgs):
                return f"color-mix(in oklab, var(--fg) {pct}%, var(--bg))"
        return "var(--fg)"

    accent_hex = parse_hex(accent)
    if accent_hex:
        acc_pct = readable_pct(accent_hex, fg_c, base_bgs + [mix_oklab(hex_to_rgb(bg_c), hex_to_rgb(accent_hex), 0.12)],
                               4.8, start=15)
        accent_strong = f"color-mix(in oklab, var(--accent) {100 - acc_pct}%, var(--fg))"
        acc_bgs = base_bgs + [mix_oklab(hex_to_rgb(bg_c), hex_to_rgb(accent_hex), 0.12)]
        acc_before = min(contrast(hex_to_rgb(accent_hex), b) for b in acc_bgs)
        if acc_before < 4.5:
            mixed = mix_oklab(hex_to_rgb(accent_hex), hex_to_rgb(fg_c), acc_pct / 100)
            note("--accent-strong", accent_hex, to_hex(mixed), acc_before, min(contrast(mixed, b) for b in acc_bgs))
        accent_on = parse_hex(g("--accent-on", "#ffffff"))
        solid_bg, solid_fg = solid_pair(accent_hex, accent_on)
        if (solid_bg, solid_fg) != (accent_hex, accent_on):
            note("--solid", accent_hex, solid_bg, contrast(hex_to_rgb(accent_hex), hex_to_rgb(accent_on or "#ffffff")),
                 contrast(hex_to_rgb(solid_bg), hex_to_rgb(solid_fg)), onFrom=(accent_on or "#ffffff").lower(), onTo=solid_fg.lower())
        solid_hover = None
        for key in ("--accent-hover",):
            cand = parse_hex(g(key))
            if cand and contrast(hex_to_rgb(cand), hex_to_rgb(solid_fg)) >= 4.5 and solid_bg == accent_hex:
                solid_hover = cand
        if not solid_hover:
            toward = "#000000" if solid_fg == "#ffffff" else "#ffffff"
            solid_hover = to_hex(mix_oklab(hex_to_rgb(solid_bg), hex_to_rgb(toward), 0.10))
    else:  # cor do DS em outro formato: mantém a regra antiga
        accent_strong = "color-mix(in oklab, var(--accent), var(--fg) 16%)"
        solid_bg, solid_fg = "var(--accent-strong)", g("--accent-on", "#ffffff")
        solid_hover = "color-mix(in oklab, var(--solid) 86%, var(--fg))"

    # ---- escala tipográfica, espaçamento, layout, movimento (seções 3, 5 e 6)
    def rem(px):
        return f"{px / 16:.4g}rem"

    px_h1 = clamp(num("--text-3xl", "px"), 34, 64, 48)
    trk_raw = (g("--tracking-display") or "").strip()
    if trk_raw.endswith("px") and num("--tracking-display", "px") is not None:
        trk = num("--tracking-display", "px") / px_h1
    elif trk_raw.endswith("em") and num("--tracking-display", "em") is not None:
        trk = num("--tracking-display", "em")
    else:
        trk = 0.0
    scale = {
        "--fs-xs": rem(clamp(num("--text-xs", "px"), 11, 13, 12)),
        "--fs-sm": rem(clamp(num("--text-sm", "px"), 12, 15, 14)),
        "--fs-base": rem(clamp(num("--text-base", "px"), 15, 18, 16)),
        "--fs-h3": rem(clamp(num("--text-xl", "px"), 18, 28, 22)),
        "--fs-h2": rem(clamp(num("--text-2xl", "px"), 24, 44, 32)),
        "--fs-h1": rem(px_h1),
        "--fs-hero": rem(clamp(num("--text-4xl", "px"), 44, 96, 64)),
        "--lh-body": f"{clamp(num('--leading-body', ''), 1.4, 1.7, 1.6):g}",
        "--lh-tight": f"{clamp(num('--leading-tight', ''), 1.05, 1.25, 1.15):g}",
        "--display-tracking": f"{max(-0.04, min(0.02, trk)):.3g}em",
        "--section-y": f"{clamp(num('--section-y-desktop', 'px'), 40, 112, 80):g}px",
        "--section-y-tablet": f"{clamp(num('--section-y-tablet', 'px'), 32, 80, 56):g}px",
        "--container-max": f"{clamp(num('--container-max', 'px'), 960, 1360, 1120):g}px",
        "--gutter": f"{clamp(num('--container-gutter-desktop', 'px'), 16, 48, 24):g}px",
        "--gutter-tablet": f"{clamp(num('--container-gutter-tablet', 'px'), 16, 32, 24):g}px",
        "--gutter-phone": f"{clamp(num('--container-gutter-phone', 'px'), 12, 24, 16):g}px",
        "--motion-fast": f"{clamp(num('--motion-fast', 'ms'), 80, 250, 160):g}ms",
        "--motion-base": f"{clamp(num('--motion-base', 'ms'), 140, 330, 180):g}ms",
    }
    ease = (g("--ease-standard") or "").strip()
    scale["--ease"] = ease if re.fullmatch(r"cubic-bezier\([\d., -]+\)|ease(-in|-out|-in-out)?|linear", ease) else "ease-out"
    rl = num("--radius-lg", "px")
    scale["--radius-lg"] = f"{clamp(rl, 0, 28, 12):g}px" if rl is not None else "var(--radius)"
    ring = (g("--focus-ring") or "").strip()
    if ring and ";" not in ring and "{" not in ring:
        scale["--focus-ring"] = ring

    # Pesos: fontes que só têm o peso regular (ex.: fonte pixelada) não ganham negrito sintético, que borra os glifos.
    heading_font = next((f for f in fonts if f["kind"] == "display"), None) or next((f for f in fonts if f["kind"] in ("primary", "body")), None)
    type_roles = type_roles or {}
    guide_w = type_roles.get("weights", {})
    heading_weight = 600
    if heading_font:
        ranges = font_weight_ranges(heading_font)
        want = clamp(guide_w.get("display") or guide_w.get("h2"), 300, 900, 600)
        heading_weight = pick_weight(ranges, want) if ranges else int(want)
    body_font = next((f for f in fonts if f["kind"] in ("body", "primary")), None) or heading_font

    def role_weight(role, lo, hi):
        """Peso do papel, no intervalo [lo, hi], ajustado ao que a fonte tem; None sem peso no guia."""
        w = guide_w.get(role)
        if not w:
            return None
        w = int(clamp(w, lo, hi, w))
        ranges = font_weight_ranges(body_font) if body_font else []
        return pick_weight(ranges, w) if ranges else w

    roles_w = {"--h3-weight": (guide_w.get("h3") and int(clamp(guide_w["h3"], 300, 900, 600)) or None),
               "--body-weight": role_weight("body", 300, 500),
               "--btn-weight": role_weight("button", 400, 800),
               "--label-weight": role_weight("label", 400, 800)}
    if roles_w["--h3-weight"] and heading_font:
        r_ = font_weight_ranges(heading_font)
        roles_w["--h3-weight"] = pick_weight(r_, roles_w["--h3-weight"]) if r_ else roles_w["--h3-weight"]
    avoid = set(type_roles.get("avoid_weights") or [])

    def allowed(w):
        """Peso mais próximo de `w` que o guia não pede para evitar (e que a fonte tem, se soubermos)."""
        if w not in avoid:
            return w
        ranges = font_weight_ranges(body_font) if body_font else []
        for step in (100, 200, 300, 400, 500, 600):
            for cand in (w + step, w - step):
                if 300 <= cand <= 900 and cand not in avoid and (not ranges or any(lo <= cand <= hi for lo, hi in ranges)):
                    return cand
        return w

    if avoid:
        heading_weight = allowed(heading_weight)
        for var, default in (("--h3-weight", 600), ("--body-weight", 400), ("--btn-weight", 600), ("--label-weight", 600)):
            roles_w[var] = allowed(roles_w.get(var) or default)
    type_extra = {k: str(v) for k, v in roles_w.items() if v}
    if type_roles.get("label_transform"):
        type_extra["--kicker-transform"] = type_roles["label_transform"]
    if type_roles.get("label_tracking"):
        val, unit = type_roles["label_tracking"]
        em = val / 12 if unit == "px" else val  # px sobre o rótulo de ~12px
        type_extra["--kicker-spacing"] = f"{max(0.0, min(0.2, em)):.3g}em"
    nav = type_roles.get("nav_toggle") or {}
    if nav.get("radius"):
        type_extra["--nav-toggle-radius"] = nav["radius"]
    if nav.get("border"):
        type_extra["--nav-toggle-border"] = nav["border"]
    if nav.get("bg"):
        type_extra["--nav-toggle-bg"] = nav["bg"]
    spec = type_roles.get("button_spec") or {}
    if "radius" in spec:
        type_extra["--btn-radius"] = f"{min(spec['radius'], 999)}px"
    if "pad" in spec:
        type_extra["--btn-pad-y"] = f"{int(clamp(spec['pad'][0], 6, 16, 9))}px"
        type_extra["--btn-pad-x"] = f"{int(clamp(spec['pad'][1], 12, 40, 18))}px"
    if type_roles.get("features"):
        type_extra["--font-features"] = ", ".join(f'"{t}"' for t in type_roles["features"])
    no_bold = any(
        (r := font_weight_ranges(f)) and max(hi for _lo, hi in r) < 600
        for f in fonts if f.get("source")
    )
    weights = {"font-synthesis-weight": "none"} if no_bold else {}

    # opcionais: fundo dos campos habilitados (sem ele o CSS usa --surface) e cores dos degradês dos cartões
    # (sem eles o CSS usa --accent e --accent-strong)
    extras = {k: g(k) for k in ("--field-bg", "--grad-1", "--grad-2", "--row-bg", "--row-stripe", "--row-hover",
                                  "--cta-bg", "--cta-btn-fg") if g(k)}

    # Cor secundária (botões de destaque secundário, como "Ver código"): a paleta secundária do DS ou, sem ela,
    # a neutra. O preenchimento passa de 4,5:1 com o texto e de 3:1 contra a superfície (WCAG 1.4.3 e 1.4.11).
    sec_pal = next((p for p in palettes if p["name"] == roles.get("secondary")), None) or \
        next((p for p in palettes if p["name"] == roles.get("neutral")), None)
    if sec_pal and parse_hex(sec_pal["base"]):
        base = parse_hex(sec_pal["base"])
        picked = None
        for pct in range(0, 101, 5):
            cand = to_hex(mix_oklab(hex_to_rgb(base), hex_to_rgb(fg_c), pct / 100))
            bg2, fg2 = solid_pair(cand, ink_for(cand))
            if contrast(hex_to_rgb(bg2), hex_to_rgb(fg2)) >= 4.5 and contrast(hex_to_rgb(bg2), hex_to_rgb(surf_c)) >= 3:
                picked = (bg2, fg2)
                break
        if picked:
            sec_bg, sec_fg = picked
            toward = "#000000" if sec_fg == "#ffffff" else "#ffffff"
            extras["--secondary"] = sec_bg
            extras["--secondary-fg"] = sec_fg
            extras["--secondary-hover"] = to_hex(mix_oklab(hex_to_rgb(sec_bg), hex_to_rgb(toward), 0.12))
            before = contrast(hex_to_rgb(base), hex_to_rgb(ink_for(base)))
            if sec_bg.lower() != base.lower() and (before < 4.5 or contrast(hex_to_rgb(base), hex_to_rgb(surf_c)) < 3):
                note("--secondary", base, sec_bg, min(before, contrast(hex_to_rgb(base), hex_to_rgb(surf_c)) + 1.5),
                     contrast(hex_to_rgb(sec_bg), hex_to_rgb(sec_fg)))
    # esquema de cores nativo: ícones de calendário e relógio, barras de rolagem e controles do navegador
    # ficam claros sobre fundo escuro
    scheme = {"color-scheme": "dark" if bg_hex and luminance(hex_to_rgb(bg_hex)) < 0.18 else "light"}
    return {**scheme, **weights, **shades, **ink, **scale, **extras, **type_extra, **{
        "--bg": g("--bg", "#ffffff"),
        "--surface": surface_css,
        "--surface-2": surface2_css,
        "--fg": g("--fg", "#171717"),
        "--fg-soft": readable("--fg-2", "--fg-soft", derived(78)),
        "--muted": readable("--muted", "--muted", derived(60)),
        "--meta": readable("--meta", "--meta", "var(--muted)"),
        "--border": g("--border", "color-mix(in oklab, var(--fg) 12%, transparent)"),
        "--border-soft": g("--border-soft", "var(--border)"),
        "--border-strong": "color-mix(in oklab, var(--fg) 22%, transparent)",
        "--accent": accent,
        "--accent-strong": accent_strong,
        "--accent-weak": "color-mix(in oklab, var(--accent) 12%, var(--bg))",
        "--accent-fg": g("--accent-on", "#ffffff"),
        "--solid": solid_bg,
        "--solid-hover": solid_hover,
        "--solid-fg": solid_fg,
        "--ok": g("--success", "#16a34a"),
        "--ok-weak": "color-mix(in oklab, var(--ok) 12%, var(--bg))",
        "--warn": g("--warn", "#eab308"),
        "--warn-weak": "color-mix(in oklab, var(--warn) 14%, var(--bg))",
        "--danger": g("--danger", "#dc2626"),
        "--danger-weak": "color-mix(in oklab, var(--danger) 12%, var(--bg))",
        "--bw": "1px",
        "--radius": g("--radius-md", "8px"),
        "--radius-sm": g("--radius-sm", "6px"),
        "--radius-pill": g("--radius-pill", "999px"),
        "--shadow-card": g("--elev-raised", g("--elev-ring", "none")),
        "--shadow-pop": "0 14px 40px rgba(0, 0, 0, 0.22)",
        "--font-display": display,
        "--font-body": body,
        "--font-code": code,
        "--font-mono": code,
        "--heading-weight": str(heading_weight),
        "--hero-ground": "var(--surface-2)",
        "--hero-ink": "var(--fg)",
    }}


# Ordem das categorias = a do combobox (id do catálogo -> mesma sequência da lista do site).
CATEGORY_ORDER = [
    "Automotive", "Backend & Data", "Creative & Artistic", "Design & Creative", "E-Commerce & Retail",
    "Editorial · Studio", "Editorial / Personal / Publication", "Editorial & Print", "Developer Tools",
    "Fintech & Crypto", "AI & LLM", "Layout & Structure", "Media & Consumer", "Modern & Minimal",
    "Morphism & Effects", "Bold & Expressive", "Productivity & SaaS", "Professional & Corporate",
    "Retro & Nostalgic", "Starter", "Themed & Unique",
]


_FONT_MANIFEST = None


def font_manifest():
    """assets/fonts/manifest.json (gerado por scripts/build_fonts.py): URL do Google -> estilos baixados."""
    global _FONT_MANIFEST
    if _FONT_MANIFEST is None:
        path = os.path.join("assets", "fonts", "manifest.json")
        _FONT_MANIFEST = json.load(open(path, encoding="utf-8")) if os.path.exists(path) else {}
    return _FONT_MANIFEST


def font_css(css_url):
    """@font-face locais (self-host) para a URL do Google; sem manifesto, cai para o @import."""
    faces = font_manifest().get(css_url)
    if not faces:
        return [f'@import url("{css_url}");']
    out = []
    for f in faces:
        lines = [
            "@font-face {",
            f'  font-family: "{f["family"]}";',
            f'  font-style: {f["style"]};',
            f'  font-weight: {f["weight"]};',
        ]
        if f.get("stretch"):
            lines.append(f'  font-stretch: {f["stretch"]};')
        lines += [
            "  font-display: swap;",
            f'  src: url("../../assets/fonts/{f["file"]}") format("woff2");',
        ]
        if f.get("range"):
            lines.append(f'  unicode-range: {f["range"]};')
        lines.append("}")
        out.append("\n".join(lines))
    return out


def pick_lang(v, lang):
    """Mantém só o idioma pedido nos campos [{lang, message}]; sem ele, cai para o primeiro (en-US)."""
    if isinstance(v, list):
        if v and all(isinstance(x, dict) and "lang" in x and "message" in x for x in v):
            return [x for x in v if x["lang"] == lang] or v[:1]
        return [pick_lang(x, lang) for x in v]
    if isinstance(v, dict):
        return {k: pick_lang(x, lang) for k, x in v.items()}
    return v


def write_ds_json(ds_id, data):
    """data/ds/<id>.<lang>.json: um arquivo por idioma, minificado (a página só usa um idioma por vez)."""
    for lang in ("en-US", "pt-BR"):
        path = os.path.join("data", "ds", f"{ds_id}.{lang}.json")
        json.dump(pick_lang(data, lang), open(path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    old = os.path.join("data", "ds", f"{ds_id}.json")
    if os.path.exists(old):
        os.remove(old)


def load_modes():
    """data/modes.json: variante clara/escura dos temas cujo guia descreve uma segunda paleta."""
    path = os.path.join("data", "modes.json")
    modes = json.load(open(path, encoding="utf-8")) if os.path.exists(path) else {}
    return {k: v for k, v in modes.items() if not k.startswith("_")}


def override_tokens(groups, overrides):
    """Cópia dos grupos de tokens com `overrides` aplicados ({nome: valor}; None remove o token)."""
    out, seen = [], set()
    for g in groups:
        items = []
        for i in g["items"]:
            if i["name"] in overrides:
                seen.add(i["name"])
                if overrides[i["name"]] is not None:
                    items.append({**i, "value": overrides[i["name"]]})
            else:
                items.append(i)
        out.append({**g, "items": items})
    extra = [{"name": k, "value": v} for k, v in overrides.items() if k not in seen and v is not None]
    if extra:
        out.append({"group": "alt", "items": extra})
    return out


def write_theme_css(ds_id, theme_vars_, fonts, alt=None):
    """data/themes/<id>.css: fontes (@font-face locais, ou @import se faltar o download) + variáveis do tema.
    `alt` = (nome do modo, variáveis): bloco extra `[data-theme][data-scheme="<modo>"]`, aplicado pelo botão sol/lua."""
    os.makedirs(os.path.join("data", "themes"), exist_ok=True)
    css = []
    for f in fonts:
        if f["source"] and f["source"].get("css"):
            for block_ in font_css(f["source"]["css"]):
                if block_ not in css:
                    css.append(block_)
    css.append(f'[data-theme="{ds_id}"] {{')
    css += [f"  {k}: {v};" for k, v in theme_vars_.items()]
    css.append("}")
    if alt:
        css.append(f'[data-theme="{ds_id}"][data-scheme="{alt[0]}"] {{')
        css += [f"  {k}: {v};" for k, v in alt[1].items()]
        css.append("}")
    open(os.path.join("data", "themes", f"{ds_id}.css"), "w", encoding="utf-8").write("\n".join(css) + "\n")


def slug_of(href):
    m = re.search(r"design-system-([a-z0-9-]+)/?$", href)
    return m.group(1) if m else None


# Tema padrão: base do Vercel (bordas, raios, sombras, foco, movimento, espaçamento e layout), com a paleta
# do Expo e as fontes e a escala tipográfica do Futuristic. Dá para trocar as fontes de origem aqui.
DEFAULT_PALETTE_FROM = ("expo", ("--bg", "--surface", "--surface-warm", "--fg", "--fg-2", "--muted", "--meta",
                                 "--accent", "--accent-on", "--success", "--warn", "--danger"))
DEFAULT_TYPE_FROM = ("futuristic", ("--text-xs", "--text-sm", "--text-base", "--text-lg", "--text-xl", "--text-2xl",
                                    "--text-3xl", "--text-4xl", "--leading-body", "--leading-tight", "--tracking-display"))
DEFAULT_ACCENT = "#4630eb"
DEFAULT_HEADER = "#6b7280"  # fundo do cabeçalho do Padrão: cinza com 4,8:1 de contraste para o texto branco
# Nomes das paletas do Padrão (o guia do Expo as chama de "Link Cobalt" etc.). None remove a paleta.
DEFAULT_PALETTE_NAMES = {"Legal Blue": "Primary", "Link Cobalt": None, "Preview Purple": "Secondary",
                         "Warning Amber": "Warning", "Destructive Rose": "Danger", "Widget Sky": None}
DEFAULT_TAGLINE = i18n(
    "Default theme: Expo's palette, Vercel's borders, shadows and motion, and Futuristic's fonts. Has a dark variant.",
    "Tema padrão: paleta do Expo, bordas, sombras e animação do Vercel e fontes do Futuristic. Tem variante escura.")
DEFAULT_ORIGIN_HTML = i18n(
    "<p>This is the project's own default theme, a mix of three catalog design systems plus project decisions:</p>"
    "<ul><li><strong>Colors:</strong> <code>Expo</code> (background, surfaces, text and semantic colors), with <code>#4630eb</code> as the accent for buttons and links.</li>"
    "<li><strong>Borders, radii, shadows, focus and motion:</strong> <code>Vercel</code>.</li>"
    "<li><strong>Fonts and type scale:</strong> <code>Futuristic</code> (Audiowide, Roboto and Anonymous Pro).</li>"
    "<li><strong>Project decisions:</strong> gray header with white text, white form fields, card gradients in Secondary, "
    "zebra table with Secondary hover.</li></ul>"
    "<p>The dark variant (sun/moon button in the header) is derived from this palette; it is not part of any original guide. "
    "The sections below are the original Vercel guide, kept as a reference for spacing and components; its colors and fonts do not apply here.</p>",
    "<p>Este é o tema padrão do projeto, uma mistura de três design systems do catálogo mais decisões do projeto:</p>"
    "<ul><li><strong>Cores:</strong> <code>Expo</code> (fundo, superfícies, texto e cores semânticas), com <code>#4630eb</code> como destaque de botões e links.</li>"
    "<li><strong>Bordas, raios, sombras, foco e animação:</strong> <code>Vercel</code>.</li>"
    "<li><strong>Fontes e escala tipográfica:</strong> <code>Futuristic</code> (Audiowide, Roboto e Anonymous Pro).</li>"
    "<li><strong>Decisões do projeto:</strong> cabeçalho cinza com texto branco, campos de formulário brancos, degradês dos cartões em Secondary, "
    "tabela zebrada com hover em Secondary.</li></ul>"
    "<p>A variante escura (botão de sol e lua no cabeçalho) é derivada desta paleta e não faz parte de nenhum guia original. "
    "As seções abaixo são o guia original do Vercel, mantido como referência de espaçamento e componentes; as cores e fontes dele não valem aqui.</p>")


def cached_page(slug):
    return decode_cf_emails(open(os.path.join(".cache", "pages", f"design-system-{slug}.html"), encoding="utf-8", errors="replace").read())


def compose_default(tokens):
    """Tokens, cores do guia e fontes do tema padrão (ver DEFAULT_*_FROM)."""
    p_slug, p_keys = DEFAULT_PALETTE_FROM
    t_slug, t_keys = DEFAULT_TYPE_FROM
    p_page, t_page = cached_page(p_slug), cached_page(t_slug)
    p_map, t_map = token_map(parse_tokens(p_page)), token_map(parse_tokens(t_page))
    overrides = {k: p_map[k] for k in p_keys if k in p_map}
    overrides.update({k: t_map[k] for k in t_keys if k in t_map})
    overrides["--accent"] = DEFAULT_ACCENT  # cor dos botões: o roxo do Expo (no guia dele é o foco e o "meta")
    overrides["--field-bg"] = "#ffffff"      # campos habilitados em branco
    overrides["--row-bg"] = "#ffffff"            # tabela: linhas brancas e zebra no azulzinho do tema,
    overrides["--row-stripe"] = "var(--surface-2)"  # hover num tom do Secondary
    overrides["--row-hover"] = "color-mix(in oklab, #8145b5 14%, #ffffff)"
    overrides["--grad-1"] = "#8145b5"        # degradês dos cartões na cor Secondary
    overrides["--grad-2"] = "color-mix(in oklab, #8145b5 85%, var(--fg))"
    colors = guide_colors(block(p_page, "designmd-body"))
    fonts = describe_fonts(parse_fonts(block(t_page, "designmd-body")))
    return override_tokens(tokens, overrides), colors, fonts


def build_one(ds_id, page_path, entry, slug):
    page = open(page_path, encoding="utf-8", errors="replace").read()
    page = decode_cf_emails(page)
    tokens = parse_tokens(page)
    raw_guide = block(page, "designmd-body")
    _intro, sections = split_sections(raw_guide)
    colors = guide_colors(raw_guide)
    fonts = describe_fonts(parse_fonts(raw_guide))
    type_roles = {**parse_type_roles(raw_guide), "button_spec": parse_button_spec(raw_guide),
                  "nav_toggle": parse_nav_toggle_policy(raw_guide)}
    if ds_id == "padrao":
        tokens, colors, fonts = compose_default(tokens)
        # tipografia do Futuristic; o botão (raio e padding) segue o guia do Vercel, de onde vêm as bordas
        type_roles = {**parse_type_roles(block(cached_page(DEFAULT_TYPE_FROM[0]), "designmd-body")),
                      "button_spec": type_roles["button_spec"], "nav_toggle": type_roles["nav_toggle"]}
    # cores do preview do catálogo entram como candidatas se o guia não nomear nada
    palettes, roles = build_palettes(tokens, colors)
    if ds_id == "padrao":
        palettes = [{**p, "name": DEFAULT_PALETTE_NAMES.get(p["name"], p["name"])} for p in palettes
                    if DEFAULT_PALETTE_NAMES.get(p["name"], p["name"]) is not None]
        roles = {k: DEFAULT_PALETTE_NAMES.get(v, v) for k, v in roles.items()}
        if any(p["name"] == "Secondary" for p in palettes):
            roles["secondary"] = "Secondary"
    name = entry["name"]
    cat_en = "Default" if ds_id == "padrao" else entry["category"]
    cat_pt = "Padrão" if ds_id == "padrao" else CAT_PT.get(entry["category"], entry["category"])
    category = i18n(cat_en, cat_pt if cat_pt != cat_en else None)
    intro = DEFAULT_TAGLINE if ds_id == "padrao" else i18n(entry["tagline"])
    for sec in sections:
        sec["title"] = i18n(sec["title"], TITLE_PT.get(sec["title"]))
        sec["html"] = i18n(sec["html"])
    if ds_id == "padrao":  # a explicação da mistura vem antes do guia do Vercel
        sections.insert(0, {"id": "origem", "title": i18n("About this theme", "Sobre este tema"), "html": DEFAULT_ORIGIN_HTML})
    for lang in TRANSLATED_LANGS:
        tr = load_translation(slug, lang)
        if not tr:
            continue
        if ds_id != "padrao":
            intro = add_lang(intro, lang, tr["tagline"])
        for sec in sections:
            t = tr["sections"].get(sec["id"])
            if t:
                sec["title"] = add_lang(sec["title"], lang, t["title"])
                sec["html"] = add_lang(sec["html"], lang, t["html"])
    for g in tokens:
        g["group"] = i18n(g["group"], GROUP_PT.get(g["group"]))
    adjustments = []
    data = {
        "id": ds_id,
        "name": i18n("Default", "Padrão") if ds_id == "padrao" else name,
        # o Padrão é do projeto e não existe no open-design.ai: sem URL, a página não mostra o botão de abrir lá
        "source": ({"name": "Expo + Vercel + Futuristic", "url": ""}
                   if ds_id == "padrao" else {"name": name, "url": "https://open-design.ai" + entry["href"]}),
        "category": category,
        "intro": intro,
        "roles": roles,
        "palettes": palettes,
        "colors": colors,
        "fonts": fonts,
        "tokens": tokens,
        "vars": theme_vars(tokens, palettes, roles, fonts, adjustments, type_roles),
        "sections": sections,
    }
    if ds_id == "padrao":  # cabeçalho no cinza de sempre, não no tom 500 da paleta Primary
        data["vars"]["--primary-500"] = DEFAULT_HEADER
        data["vars"]["--primary-500-fg"] = "#ffffff"  # texto do cabeçalho em branco (escolha do projeto)
    write_ds_json(ds_id, data)
    mode = load_modes().get(ds_id)
    alt = None
    alt_adjustments = []
    if mode:
        alt_vars = theme_vars(override_tokens(tokens, mode["tokens"]), palettes, roles, fonts, alt_adjustments, type_roles)
        # os tons 500/400 da escala (cabeçalho e rodapé) vêm da paleta do modo base; na variante o fundo e o texto
        for shade in ("--primary-500", "--neutral-400"):
            if shade in alt_vars:
                alt_vars[shade], alt_vars[shade + "-fg"] = "var(--bg)", "var(--fg)"
        alt = (mode["alt"], alt_vars)
    write_theme_css(ds_id, data["vars"], fonts, alt)
    p = entry.get("preview", {})
    pal = {x["name"]: x for x in palettes}
    if ds_id == "padrao":  # o padrão mostra as cores dos papéis (primária, secundária, neutra)
        swatches = [pal[roles[r]]["base"] for r in ("primary", "secondary", "neutral") if roles.get(r) in pal]
    else:
        swatches = [x for x in (p.get("bg"), p.get("surface"), p.get("ink"), p.get("accent")) if x]
    # o índice leva só o que a listagem e o seletor usam; variáveis e fontes ficam em data/themes/<id>.css
    entry_out = {
        "id": ds_id,
        "name": data["name"],
        "category": data["category"],
        "tagline": data["intro"],
        "swatches": swatches,
    }
    # fontes proprietárias do guia que o site não tem: o aviso do topo e o README usam esta lista
    if mode:  # o botão sol/lua do cabeçalho só fica ativo nos temas com variante
        entry_out["schemes"] = {"base": mode["base"], "alt": mode["alt"]}
    # escrita da direita para a esquerda: o guia declara "rtl_primary: true" (ou <html dir="rtl">)
    if re.search(r"rtl_primary:\s*true|<html[^>]*dir=\"rtl\"|dir=&quot;rtl&quot;", raw_guide):
        entry_out["dir"] = "rtl"
    prop = [f["family"] for f in fonts if f.get("proprietary")]
    if prop:
        entry_out["proprietaryFonts"] = prop
    # tokens do DS abaixo de 4,5:1 (WCAG 2.2 AA) que o build trocou: o aviso da página lista cada um.
    # Fica num arquivo à parte (carregado ao aplicar o tema) para não engordar o index.json.
    adjustments += [{**a, "mode": "alt"} for a in alt_adjustments]
    if ds_id == "padrao":  # as cores do tema padrão são do projeto: o build ajusta o contraste, mas não avisa
        adjustments = []
    json.dump(adjustments, open(os.path.join("data", "themes", f"{ds_id}.contrast.json"), "w", encoding="utf-8"),
              ensure_ascii=False, separators=(",", ":"))
    return entry_out


def main():
    os.makedirs(os.path.join("data", "ds"), exist_ok=True)
    raw, by_slug = json.load(open(os.path.join("data", "systems-raw.json"), encoding="utf-8")), {}
    for d in raw:
        sl = slug_of(d["href"])
        if sl and sl not in by_slug and os.path.exists(os.path.join(".cache", "pages", f"design-system-{sl}.html")):
            by_slug[sl] = d
    order = [("padrao", "Padrão", "Padrão")]
    cats = sorted({d["category"] for d in by_slug.values()}, key=lambda c: CATEGORY_ORDER.index(c) if c in CATEGORY_ORDER else 99)
    for c in cats:
        order += [(sl, CAT_PT.get(c, c), d["name"]) for sl, d in by_slug.items() if d["category"] == c]

    if sys.argv[1:2] == ["--template"]:  # python scripts/build_ds_details.py --template <slug> [lang]
        write_template(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "pt-BR")
        return
    wanted = sys.argv[1:] or [o[0] for o in order]
    index, done = [], set()
    for ds_id, _cat, _name in order:
        if ds_id not in wanted:
            continue
        sl = "vercel" if ds_id == "padrao" else ds_id
        try:
            index.append(build_one(ds_id, os.path.join(".cache", "pages", f"design-system-{sl}.html"), by_slug[sl], sl))
            done.add(ds_id)
            print(f"ok   {ds_id}", flush=True)
        except BaseException as e:  # um DS com formato diferente não derruba o lote
            print(f"ERRO {ds_id}: {e!r}", flush=True)
    json.dump(index, open(os.path.join("data", "ds", "index.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"{len(done)}/{len(wanted)} design systems -> data/ds/index.json")


if __name__ == "__main__":
    main()
