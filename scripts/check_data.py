"""Confere a consistência dos dados gerados (data/, assets/fonts/, i18n/).

Roda no CI (.github/workflows/pages.yml) e localmente: `npm run check`.
Falha (exit 1) se achar qualquer problema; avisos não derrubam o build.

Para o HTML dos guias, use também scripts/check_html.py.
"""
import glob, json, os, re, sys

sys.stdout.reconfigure(encoding="utf-8")
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # raiz do projeto

DS_DIR = os.path.join("data", "ds")
THEME_DIR = os.path.join("data", "themes")
FONT_DIR = os.path.join("assets", "fonts")
LANGS = ("en-US", "pt-BR")
HEX = re.compile(r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")

errors, warnings = [], []


def err(msg):
    errors.append(msg)


def has_langs(value):
    return isinstance(value, list) and {x.get("lang") for x in value if isinstance(x, dict)} >= set(LANGS)


def load(path):
    try:
        return json.load(open(path, encoding="utf-8"))
    except Exception as e:  # JSON inválido ou arquivo ausente
        err(f"{path}: não foi possível ler ({e})")
        return None


# ---- índice
index = load(os.path.join(DS_DIR, "index.json")) or []
ids = [d.get("id") for d in index]
if len(ids) != len(set(ids)):
    err("index.json: ids repetidos")
if "padrao" not in ids:
    err("index.json: falta o tema padrão (padrao)")
for d in index:
    for key in ("id", "name", "category", "tagline", "swatches"):
        if key not in d:
            err(f"index.json · {d.get('id')}: falta o campo {key}")
    # nome de marca pode ser texto puro; se for lista de idiomas, precisa ter os dois
    if "name" in d and not (isinstance(d["name"], str) and d["name"].strip()) and not has_langs(d["name"]):
        err(f"index.json · {d['id']}: name inválido")

# ---- arquivos órfãos
on_disk = set()
for p in glob.glob(os.path.join(DS_DIR, "*.json")):
    name = os.path.basename(p)[:-5]
    if name == "index":
        continue
    m = re.fullmatch(r"(.+)\.(en-US|pt-BR)", name)
    if not m:
        err(f"{p}: nome fora do padrão <id>.<idioma>.json")
        continue
    on_disk.add(m.group(1))
for extra in sorted(on_disk - set(ids)):
    err(f"data/ds/{extra}.*.json existe mas não está no index.json")
themes_on_disk = {os.path.basename(p)[:-4] for p in glob.glob(os.path.join(THEME_DIR, "*.css"))}
for extra in sorted(themes_on_disk - set(ids)):
    err(f"data/themes/{extra}.css existe mas não está no index.json")

# cada tema tem o relatório de ajustes de contraste (aviso do topo): lista de {token, from, to, ratioFrom, ratioTo}
for ds_id in ids:
    cpath = os.path.join(THEME_DIR, f"{ds_id}.contrast.json")
    if not os.path.exists(cpath):
        err(f"{cpath}: não existe")
        continue
    items = load(cpath)
    if not isinstance(items, list) or not all(
            isinstance(a_, dict) and {"token", "from", "to", "ratioFrom", "ratioTo"} <= set(a_) for a_ in items):
        err(f"{cpath}: formato inválido")

# ---- cada DS
font_refs = set()
for ds_id in ids:
    detail = os.path.join(DS_DIR, f"{ds_id}.en-US.json")  # tokens, paletas e fontes são iguais nos dois idiomas
    theme = os.path.join(THEME_DIR, f"{ds_id}.css")
    d = load(detail) if os.path.exists(detail) else err(f"{detail}: não existe")
    css = None
    if os.path.exists(theme):
        css = open(theme, encoding="utf-8").read()
    else:
        err(f"{theme}: não existe")

    if css is not None:
        if f'[data-theme="{ds_id}"]' not in css:
            err(f"{theme}: não define [data-theme=\"{ds_id}\"]")
        if re.search(r"@import\s+url\(", css):
            err(f"{theme}: ainda usa @import (as fontes devem ser locais; rode npm run data:fonts)")
        for name in ("ok", "warn", "danger"):
            if f"--{name}-ink:" not in css:
                err(f"{theme}: falta --{name}-ink (texto de feedback legível; rode npm run data:update)")
        for var in ("--solid", "--solid-fg", "--fs-h1", "--fs-base", "--container-max", "--gutter", "--motion-fast"):
            if f"  {var}:" not in css:
                err(f"{theme}: falta {var} (rode npm run data:update)")
        for f in re.findall(r"assets/fonts/([\w.-]+)", css):
            font_refs.add(f)
            if not os.path.exists(os.path.join(FONT_DIR, f)):
                err(f"{theme}: fonte {f} não existe em assets/fonts/")

    if not d:
        continue
    if d.get("id") != ds_id:
        err(f"{detail}: id interno diferente do nome do arquivo")
    for key in ("name", "category", "roles", "palettes", "fonts", "tokens", "sections", "source"):
        if key not in d:
            err(f"{detail}: falta o campo {key}")
    palettes = {p.get("name"): p for p in d.get("palettes", [])}
    for role, pname in (d.get("roles") or {}).items():
        # papel sem cor identificada no guia fica como None (a página só não mostra o cartão)
        if pname is not None and pname not in palettes:
            err(f"{detail}: papel {role} aponta para a paleta inexistente {pname!r}")
    for p in palettes.values():
        if not HEX.match(p.get("base", "")):
            err(f"{detail}: paleta {p.get('name')!r} com base inválida {p.get('base')!r}")
        steps = [c.get("step") for c in p.get("scale", [])]
        if steps != [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]:
            err(f"{detail}: paleta {p.get('name')!r} sem a escala 50–950 completa")
        for c in p.get("scale", []):
            if not HEX.match(c.get("hex", "")):
                err(f"{detail}: paleta {p.get('name')!r} degrau {c.get('step')} com hex inválido")
    if not d.get("sections"):
        err(f"{detail}: sem seções do guia")

    # cada idioma tem o seu arquivo; as seções precisam estar traduzidas (corpo vazio no original é válido)
    for lang in LANGS:
        path = os.path.join(DS_DIR, f"{ds_id}.{lang}.json")
        dl = d if lang == "en-US" else (load(path) if os.path.exists(path) else err(f"{path}: não existe"))
        if not dl:
            continue
        if lang == "pt-BR" and dl.get("id") != ds_id:
            err(f"{path}: id interno diferente do nome do arquivo")
        for s_ in dl.get("sections", []):
            title_ok = any(x.get("lang") == lang for x in s_.get("title", []))
            body_empty = not any(x.get("message") for x in s_.get("html", []))
            body_ok = body_empty or any(x.get("lang") == lang for x in s_.get("html", []))
            if not (title_ok and body_ok):
                err(f"{path} · {s_.get('id')}: seção sem texto em {lang}")

# ---- fontes: nada de fonte proprietária hospedada
BLOCKED_FAMILIES = {"helvetica", "helvetica neue"}  # a API do Google entrega, mas são licenciadas ao Google
manifest_path = os.path.join(FONT_DIR, "manifest.json")
if os.path.exists(manifest_path):
    for url, faces in (load(manifest_path) or {}).items():
        for face in faces:
            if face.get("family", "").lower() in BLOCKED_FAMILIES:
                err(f"assets/fonts/manifest.json: {face['family']} é fonte proprietária e não pode ser hospedada")
for ds in index:
    if ds.get("proprietaryFonts") and not all(isinstance(x, str) for x in ds["proprietaryFonts"]):
        err(f"index.json · {ds.get('id')}: proprietaryFonts inválido")
if os.path.isdir(FONT_DIR):
    orphans = {f for f in os.listdir(FONT_DIR) if f.endswith(".woff2")} - font_refs
    if orphans:
        warnings.append(f"assets/fonts/: {len(orphans)} arquivo(s) woff2 sem uso nos temas")

# ---- traduções pendentes
for path in glob.glob(os.path.join("i18n", "*", "*.html")):
    if "TRADUCAO-PENDENTE" in open(path, encoding="utf-8").read():
        err(f"{path}: ainda tem o marcador TRADUCAO-PENDENTE")

print(f"{len(ids)} design systems verificados.")
for w in warnings:
    print("aviso:", w)
errors = list(dict.fromkeys(errors))
if errors:
    print(f"{len(errors)} problema(s):")
    print("\n".join(errors[:40]))
    sys.exit(1)
print("OK: dados consistentes.")
