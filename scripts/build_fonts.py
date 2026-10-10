"""Baixa as fontes do Google Fonts usadas pelos temas para assets/fonts/ (self-host).

Assim o site não pede nada ao Google em tempo de execução (privacidade/LGPD e menos requisições encadeadas).
Para cada URL de CSS do Google em .cache/gfonts.json, guarda só o subconjunto `latin` (cobre pt-BR e en-US),
em todos os estilos pedidos (normal e itálico, nos pesos pedidos), e grava assets/fonts/manifest.json.
O build_ds_details.py usa esse manifesto para escrever @font-face local nos temas.

Uso: python scripts/build_fonts.py   (pula arquivos já baixados)
Depois: npm run data:update
"""
import hashlib, json, os, re, sys, time, urllib.parse, urllib.request

sys.stdout.reconfigure(encoding="utf-8")
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # raiz do projeto
OUT = os.path.join("assets", "fonts")
MANIFEST = os.path.join(OUT, "manifest.json")
SUBSET = "latin"
# Com o UA de um navegador moderno, o Google devolve woff2 (e separa os subconjuntos por unicode-range).
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
FACE = re.compile(r"/\*\s*([\w-]+)\s*\*/\s*@font-face\s*\{([^}]*)\}", re.S)


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    return urllib.request.urlopen(req, timeout=40).read()


def prop(block, name):
    m = re.search(name + r"\s*:\s*([^;]+);", block)
    return m.group(1).strip() if m else ""


os.makedirs(OUT, exist_ok=True)
gfonts = json.load(open(os.path.join(".cache", "gfonts.json"), encoding="utf-8"))
urls = sorted({v["css"] for v in gfonts.values() if v and v.get("css")})
manifest = json.load(open(MANIFEST, encoding="utf-8")) if os.path.exists(MANIFEST) else {}
downloaded = 0

# Helvetica e Helvetica Neue vêm da API do Google, mas são proprietárias (licenciadas ao Google):
# nunca baixar nem hospedar. A lista também está em build_ds_details.py (NOT_REDISTRIBUTABLE).
BLOCKED = {"helvetica", "helvetica neue"}


def family_of(url):
    m = re.search(r"family=([^:&]+)", url)
    return urllib.parse.unquote_plus(m.group(1)).lower() if m else ""


urls = [u for u in urls if family_of(u) not in BLOCKED]
manifest = {u: v for u, v in manifest.items() if family_of(u) not in BLOCKED}

for n, css_url in enumerate(urls, 1):
    if css_url in manifest:
        continue
    try:
        css = get(css_url).decode("utf-8")
    except Exception as e:
        print(f"[{n}/{len(urls)}] ERRO {css_url}: {e}")
        continue
    faces = []
    for subset, block in FACE.findall(css):
        if subset != SUBSET:
            continue
        src = re.search(r"url\((https://[^)]+)\)\s*format\(['\"]woff2['\"]\)", block)
        if not src:
            continue
        file = hashlib.sha1(src.group(1).encode()).hexdigest()[:12] + ".woff2"
        path = os.path.join(OUT, file)
        if not os.path.exists(path):
            open(path, "wb").write(get(src.group(1)))
            downloaded += 1
            time.sleep(0.1)
        faces.append({
            "family": prop(block, "font-family").strip("'\""),
            "style": prop(block, "font-style") or "normal",
            "weight": prop(block, "font-weight") or "400",
            "stretch": prop(block, "font-stretch"),
            "file": file,
            "range": prop(block, "unicode-range"),
        })
    manifest[css_url] = faces
    print(f"[{n}/{len(urls)}] ok {css_url.split('family=')[1][:50]} ({len(faces)} estilos)")
    time.sleep(0.2)

json.dump(manifest, open(MANIFEST, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
files = [f for f in os.listdir(OUT) if f.endswith(".woff2")]
size = sum(os.path.getsize(os.path.join(OUT, f)) for f in files)
print(f"{len(manifest)} URLs, {len(files)} arquivos woff2 ({size // 1024} KB); {downloaded} baixados agora.")
