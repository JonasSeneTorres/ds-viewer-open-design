"""Compara os tokens de data/ds/*.json com o tokens.css do repositório do Open Design.

Serve para sustentar a afirmação do README de que os temas vêm "no estado" da documentação.

Uso:
  git clone --depth 1 --filter=blob:none --sparse https://github.com/nexu-io/open-design .cache/open-design
  git -C .cache/open-design sparse-checkout set design-systems
  python scripts/verify_upstream.py [caminho/para/design-systems]

Sai com código 1 se algum valor divergir.
"""
import glob, json, os, re, sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
UP = sys.argv[1] if len(sys.argv) > 1 else os.path.join(".cache", "open-design", "design-systems")
if not os.path.isdir(UP):
    sys.exit(f"Pasta não encontrada: {UP} (veja o uso no topo do script)")


def norm(v):
    return re.sub(r"\s+", " ", v.strip())


def upstream_vars(path):
    """Primeira declaração de cada variável: o bloco :root vem antes das sobrescritas (ex.: :lang(ja))."""
    css = re.sub(r"/\*.*?\*/", "", open(path, encoding="utf-8").read(), flags=re.S)
    out = {}
    for m in re.finditer(r"(--[\w-]+)\s*:\s*([^;]+);", css):
        out.setdefault(m.group(1), norm(m.group(2)))
    return out


checked = same = 0
problems = []
skipped = []
for path in sorted(glob.glob(os.path.join("data", "ds", "*.json"))):
    if path.endswith("index.json"):
        continue
    d = json.load(open(path, encoding="utf-8"))
    ds_id = d["id"]
    css = os.path.join(UP, ds_id, "tokens.css")
    if not os.path.exists(css):
        skipped.append(ds_id)
        continue
    up = upstream_vars(css)
    for g in d["tokens"]:
        for t in g["items"]:
            checked += 1
            if up.get(t["name"]) == norm(t["value"]):
                same += 1
            else:
                problems.append(f"{ds_id} {t['name']}: aqui={t['value']!r} · repositório={up.get(t['name'])!r}")

print(f"{checked} tokens comparados, {same} idênticos.")
if skipped:
    print("Sem tokens.css no repositório (ignorados):", ", ".join(skipped))
if problems:
    print(f"{len(problems)} divergência(s):")
    print("\n".join(problems[:30]))
    sys.exit(1)
print("OK: todos os tokens batem com o repositório.")
