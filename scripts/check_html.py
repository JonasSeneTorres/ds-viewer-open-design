"""Confere que o HTML dos guias em data/ds/*.json só usa as tags e atributos permitidos.

O app.js injeta esse HTML com innerHTML; o build_ds_details.py já o sanitiza (lista de permitidos).
Este script é a segunda checagem, independente: falha (exit 1) se achar qualquer coisa fora da lista.

Uso: python scripts/check_html.py
"""
import glob, json, os, re, sys
from html.parser import HTMLParser

sys.stdout.reconfigure(encoding="utf-8")
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # raiz do projeto

ALLOWED = {
    "h1", "h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "em", "code", "pre", "table",
    "thead", "tbody", "tr", "th", "td", "blockquote", "a", "br", "hr", "span",
}
A_ATTRS = {"href", "target", "rel"}


class Checker(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.problems = []

    def handle_starttag(self, tag, attrs):
        if tag not in ALLOWED:
            self.problems.append(f"tag <{tag}>")
            return
        for k, v in attrs:
            if tag != "a" or k not in A_ATTRS:
                self.problems.append(f"atributo {k} em <{tag}>")
            elif k == "href" and not re.match(r"^(https?://|#)", v or ""):
                self.problems.append(f"href inválido: {v}")


def check(html):
    c = Checker()
    c.feed(html)
    return c.problems


blocks, failures = 0, []
for path in sorted(glob.glob(os.path.join("data", "ds", "*.json"))):
    if path.endswith("index.json"):
        continue
    data = json.load(open(path, encoding="utf-8"))
    for sec in data.get("sections", []):
        for item in sec["html"]:
            blocks += 1
            for p in check(item["message"]):
                failures.append(f"{os.path.basename(path)} · {sec['id']} · {item['lang']}: {p}")

print(f"{blocks} blocos verificados.")
if failures:
    print(f"{len(failures)} problema(s):")
    print("\n".join(failures[:30]))
    sys.exit(1)
print("OK: só tags e atributos permitidos.")
