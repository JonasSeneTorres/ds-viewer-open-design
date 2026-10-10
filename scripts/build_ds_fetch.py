"""Baixa as páginas de detalhe de cada design system (open-design.ai) para .cache/pages/.

Uso: python scripts/build_ds_fetch.py   (pula o que já está em cache)
"""
import json, os, sys, time, urllib.request

sys.stdout.reconfigure(encoding="utf-8")
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # raiz do projeto
BASE = "https://open-design.ai"
OUT = os.path.join(".cache", "pages")
os.makedirs(OUT, exist_ok=True)

seen, items = set(), []
for d in json.load(open(os.path.join("data", "systems-raw.json"), encoding="utf-8")):
    if d["href"] not in seen:
        seen.add(d["href"])
        items.append(d["href"])

for n, href in enumerate(items, 1):
    path = os.path.join(OUT, href.strip("/").split("/")[-1] + ".html")
    if os.path.exists(path):
        continue
    req = urllib.request.Request(BASE + href, headers={"User-Agent": "open-design-viewer/0.1 (uso pessoal)"})
    try:
        body = urllib.request.urlopen(req, timeout=30).read()
        open(path, "wb").write(body)
        print(f"[{n}/{len(items)}] ok   {href} ({len(body)//1024} KB)")
    except Exception as e:
        print(f"[{n}/{len(items)}] ERRO {href}: {e}")
    time.sleep(0.4)
