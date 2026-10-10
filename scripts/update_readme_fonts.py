"""Atualiza no README a lista, tema a tema, das fontes proprietárias que o site NÃO usa.

A lista vem de data/ds/index.json (campo proprietaryFonts, calculado pelo build_ds_details.py) e das
fontes de reserva de cada guia (data/ds/<id>.en-US.json). O trecho fica entre os marcadores
<!-- fontes-proprietarias:inicio --> e <!-- fontes-proprietarias:fim -->.

Uso: python scripts/update_readme_fonts.py   (ou: npm run readme:fonts)
"""
import json, os, sys

sys.stdout.reconfigure(encoding="utf-8")
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # raiz do projeto

START, END = "<!-- fontes-proprietarias:inicio -->", "<!-- fontes-proprietarias:fim -->"
HEADING = "## Fontes proprietárias dos temas"
BEFORE = "## Traduções (i18n)"


def text(v):
    if isinstance(v, list):
        return next((x["message"] for x in v if x["lang"] == "pt-BR"), v[0]["message"])
    return v


index = json.load(open(os.path.join("data", "ds", "index.json"), encoding="utf-8"))
rows, families = [], set()
for d in index:
    prop = d.get("proprietaryFonts")
    if not prop:
        continue
    detail = json.load(open(os.path.join("data", "ds", f"{d['id']}.en-US.json"), encoding="utf-8"))
    reserve = []
    for f in detail["fonts"]:
        if f.get("proprietary"):
            for x in f.get("fallbacks", []):
                if x.lower() not in (r.lower() for r in reserve):
                    reserve.append(x)
    families.update(prop)
    rows.append((text(d["name"]), d["id"], ", ".join(prop), ", ".join(reserve[:5]) or "fontes do sistema"))

lines = [
    START,
    "",
    f"**{len(rows)} dos {len(index)} temas** têm, no guia original, fontes de marca proprietárias "
    f"({len(families)} famílias no total). **O site não usa nenhuma delas e elas não constam nele**: nenhum arquivo dessas "
    "fontes é hospedado ou distribuído aqui. Nesses temas o navegador usa as **fontes de reserva (fallback)** indicadas pelo "
    "próprio guia, e a página mostra um aviso no topo dizendo isso.",
    "",
    "| Tema | Fontes proprietárias do guia (não usadas) | Reserva indicada pelo guia (o que aparece) |",
    "|---|---|---|",
]
for name, ds_id, prop, reserve in rows:
    lines.append(f"| {name} (`{ds_id}`) | {prop} | {reserve} |")
lines += ["", END]
block = "\n".join(lines)

path = "README.md"
raw = open(path, encoding="utf-8", newline="").read()
nl = "\r\n" if "\r\n" in raw else "\n"
s = raw.replace("\r\n", "\n")

intro = (
    f"{HEADING}\n\n"
    "Aqui, \"fonte proprietária\" é a fonte de **marca** de um design system (a do Itaú, por exemplo), que não é "
    "distribuída pelo Google Fonts nem acompanha um sistema operacional, e que por isso poderia dar problema de licença. "
    "Elas **não são usadas nem incluídas**. Fontes do Google Fonts (servidas pelo próprio site), fontes dos sistemas "
    "(San Francisco, Segoe UI, Arial, Georgia etc.) e fontes livres não são problema e não entram na lista. "
    "`Helvetica` e `Helvetica Neue`, que a API do Google chega a entregar mas são licenciadas ao Google e não ao site, "
    "também **não são hospedadas**: ficam como fontes do sistema (macOS), sem aviso.\n\n"
)
if START in s and END in s:
    a = s.index(HEADING)
    b = s.index(END) + len(END)
    s = s[:a] + intro + block + s[b:]
else:
    assert BEFORE in s, "seção de i18n não encontrada no README"
    s = s.replace(BEFORE, intro + block + "\n\n" + BEFORE, 1)

open(path, "w", encoding="utf-8", newline="").write(s.replace("\n", nl))
print(f"README.md: {len(rows)} temas, {len(families)} famílias")
