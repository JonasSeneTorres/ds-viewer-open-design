"""Testes unitários das funções puras de scripts/build_ds_details.py.

Só biblioteca padrão (unittest), sem pytest e sem .cache/: o CI não baixa as páginas do open-design.ai.
Uso: python -m unittest discover -s tests/unit -v   (ou: npm run test:unit)
"""
import importlib.util
import itertools
import os
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_spec = importlib.util.spec_from_file_location("build", os.path.join(ROOT, "scripts", "build_ds_details.py"))
b = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(b)


def rgb(h):
    return b.hex_to_rgb(h)


class Cores(unittest.TestCase):
    def test_hex_curto_e_longo(self):
        self.assertEqual(rgb("#fff"), (1.0, 1.0, 1.0))
        self.assertEqual(rgb("#000000"), (0.0, 0.0, 0.0))
        self.assertEqual(rgb("#f00"), rgb("#ff0000"))

    def test_to_hex_arredonda_e_limita(self):
        self.assertEqual(b.to_hex((1, 0, 0)), "#ff0000")
        self.assertEqual(b.to_hex((1.4, -0.2, 0.5)), "#ff0080")

    def test_ida_e_volta_oklch(self):
        for h in ("#4630eb", "#e5484d", "#00a36c", "#808080", "#ffffff"):
            back = b.to_hex(b.oklch_to_rgb(*b.rgb_to_oklch(rgb(h))))
            self.assertEqual(back, h)

    def test_parse_hex_so_aceita_hex(self):
        self.assertEqual(b.parse_hex(" #abc "), "#abc")
        self.assertEqual(b.parse_hex("#AABBCC"), "#AABBCC")
        for bad in ("rgb(0,0,0)", "#abcd", "red", "", None):
            self.assertIsNone(b.parse_hex(bad), bad)

    def test_mix(self):
        self.assertEqual(b.mix("#000000", "#ffffff", 0), "#000000")
        self.assertEqual(b.mix("#000000", "#ffffff", 1), "#ffffff")
        self.assertEqual(b.mix("#000000", "#ffffff", 0.5), "#808080")

    def test_mix_oklab_extremos(self):
        self.assertEqual(b.to_hex(b.mix_oklab(rgb("#ff0000"), rgb("#0000ff"), 0)), "#ff0000")
        self.assertEqual(b.to_hex(b.mix_oklab(rgb("#ff0000"), rgb("#0000ff"), 1)), "#0000ff")

    def test_fit_sempre_devolve_hex_valido(self):
        # croma absurdo para qualquer luminosidade: precisa caber no sRGB
        for L in (0.2, 0.5, 0.9):
            for H in (0, 90, 180, 270):
                self.assertRegex(b.fit(L, 0.6, H), r"^#[0-9a-f]{6}$")


class Contraste(unittest.TestCase):
    def test_razoes_conhecidas(self):
        self.assertAlmostEqual(b.contrast(rgb("#000"), rgb("#fff")), 21.0, places=6)
        self.assertAlmostEqual(b.contrast(rgb("#fff"), rgb("#fff")), 1.0, places=6)
        self.assertAlmostEqual(b.contrast(rgb("#4630eb"), rgb("#fff")), b.contrast(rgb("#fff"), rgb("#4630eb")))

    def test_cinza_do_cabecalho_padrao_passa_de_4_5(self):
        # README: cabeçalho #6b7280 com texto branco = 4,8:1
        self.assertGreaterEqual(b.contrast(rgb("#6b7280"), rgb("#fff")), 4.5)

    def test_floor1_nao_arredonda_para_cima(self):
        self.assertEqual(b.floor1(4.46), 4.4)
        self.assertEqual(b.floor1(4.5), 4.5)
        self.assertEqual(b.floor1(21.0), 21.0)

    def test_ink_for(self):
        self.assertEqual(b.ink_for("#ffffff"), "#111111")
        self.assertEqual(b.ink_for("#000000"), "#ffffff")
        self.assertEqual(b.ink_for("#4630eb"), "#ffffff")
        self.assertEqual(b.ink_for("#f59e0b"), "#111111")

    def test_ink_for_escolhe_a_tinta_de_maior_contraste(self):
        # o piso teórico com #111 (e não preto) é ~4,4:1 nos tons médios; o build ainda ajusta o que ficar abaixo de 4,5
        steps = range(0, 256, 51)
        for r, g, bl in itertools.product(steps, steps, steps):
            h = f"#{r:02x}{g:02x}{bl:02x}"
            chosen = b.contrast(rgb(h), rgb(b.ink_for(h)))
            other = b.contrast(rgb(h), rgb("#ffffff" if b.ink_for(h) == "#111111" else "#111111"))
            self.assertGreaterEqual(chosen, other, h)
            self.assertGreaterEqual(chosen, 4.4, h)

    def test_solid_pair_mantem_par_que_passa(self):
        self.assertEqual(b.solid_pair("#4630eb", "#ffffff"), ("#4630eb", "#ffffff"))

    def test_solid_pair_sempre_passa_de_4_5(self):
        for accent, on in (("#ff385c", "#ffffff"), ("#f59e0b", "#ffffff"), ("#00a36c", "#ffffff"), ("#777777", "#888888")):
            bg, fg = b.solid_pair(accent, on)
            self.assertGreaterEqual(b.contrast(rgb(bg), rgb(fg)), 4.5, (accent, on, bg, fg))

    def test_feedback_ink_atinge_o_alvo_quando_possivel(self):
        bgs = [rgb("#ffffff"), rgb("#f6f7f9")]
        pct = b.feedback_ink("#f59e0b", "#0b0d12", bgs)
        mixed = b.mix_oklab(rgb("#f59e0b"), rgb("#0b0d12"), pct / 100)
        self.assertGreaterEqual(min(b.contrast(mixed, bg) for bg in bgs), 4.6)

    def test_feedback_ink_cor_ja_legivel_nao_mistura(self):
        self.assertEqual(b.feedback_ink("#000000", "#111111", [rgb("#ffffff")]), 0)

    def test_readable_pct_respeita_start(self):
        self.assertGreaterEqual(b.readable_pct("#000000", "#111111", [rgb("#ffffff")], start=20), 20)


class Escala(unittest.TestCase):
    def test_onze_degraus_em_ordem_e_cada_um_hex(self):
        sc = b.build_scale("#4630eb")
        self.assertEqual([s["step"] for s in sc], b.STEPS)
        for s in sc:
            self.assertRegex(s["hex"], r"^#[0-9a-f]{6}$")

    def test_luminosidade_decresce_do_50_ao_950(self):
        sc = b.build_scale("#4630eb")
        ls = [b.rgb_to_oklch(rgb(s["hex"]))[0] for s in sc]
        self.assertEqual(ls, sorted(ls, reverse=True))

    def test_ancora_ocupa_um_degrau_como_exata(self):
        sc = b.build_scale("#4630eb", anchors=("#c7d2fe",))
        exact = [s["hex"] for s in sc if s["exact"]]
        self.assertIn("#c7d2fe", exact)
        self.assertIn("#4630eb", exact)

    def test_preto_e_branco_nao_viram_ancora(self):
        sc = b.build_scale("#4630eb", anchors=("#ffffff", "#000000"))
        self.assertEqual([s["hex"] for s in sc if s["exact"]], ["#4630eb"])


class HTMLDosGuias(unittest.TestCase):
    def test_remove_script_e_style_com_o_conteudo(self):
        self.assertEqual(b.clean("<p>a</p><script>alert(1)</script><style>p{}</style><p>b</p>"), "<p>a</p><p>b</p>")

    def test_remove_atributos_de_evento(self):
        self.assertEqual(b.clean('<p onclick="x()" class="y">oi</p>'), "<p>oi</p>")

    def test_remove_tags_fora_da_lista_mas_mantem_o_texto(self):
        self.assertEqual(b.clean("<div><img src=x onerror=y>texto</div>"), "texto")

    def test_link_so_http_https_e_ancora(self):
        self.assertIn('href="https://a.b/c?d=1&amp;e=2"', b.clean('<a href="https://a.b/c?d=1&e=2">x</a>'))
        self.assertIn('rel="noopener"', b.clean('<a href="http://a.b">x</a>'))
        self.assertEqual(b.clean('<a href="javascript:alert(1)">x</a>'), "<a>x</a>")
        self.assertEqual(b.clean('<a href="data:text/html,x">x</a>'), "<a>x</a>")

    def test_entidades_sobrevivem(self):
        self.assertEqual(b.clean("<p>a &amp; b &#169;</p>"), "<p>a &amp; b &#169;</p>")

    def test_tags_void_nao_fecham(self):
        self.assertEqual(b.clean("<p>a<br>b</p><hr>"), "<p>a<br>b</p><hr>")

    def test_script_aninhado_nao_deixa_tag_nem_codigo(self):
        out = b.clean("<script>a<script>alert(1)</script>y</script>z")
        self.assertNotIn("<", out)
        self.assertNotIn("alert", out)

    def test_text_tira_tags_e_decodifica(self):
        self.assertEqual(b.text("<p>a &amp; <b>b</b></p>"), "a & b")

    def test_decode_cf_emails(self):
        key = 0x42
        enc = bytes([key] + [ord(c) ^ key for c in "a@b.c"]).hex()
        page = f'<p>mail <a href="/cdn-cgi/l/email-protection" data-cfemail="{enc}">[email&#160;protected]</a></p>'
        self.assertEqual(b.decode_cf_emails(page), "<p>mail a@b.c</p>")

    def test_split_sections(self):
        html = "<h1>T</h1><blockquote><p>intro</p></blockquote><h2>1. Visual Theme</h2><p>a</p><h2>Colors</h2><p onclick=x>b</p>"
        intro, secs = b.split_sections(html)
        self.assertEqual(intro, "<p>intro</p>")
        self.assertEqual([s["id"] for s in secs], ["visual-theme", "colors"])
        self.assertEqual(secs[0]["title"], "Visual Theme")
        self.assertEqual(secs[1]["html"], "<p>b</p>")


class Tipografia(unittest.TestCase):
    GUIA = (
        "<h2>3. Typography</h2>"
        "<table><thead><tr><th>Role</th><th>Weight</th><th>Letter Spacing</th></tr></thead><tbody>"
        "<tr><td>Display Hero</td><td>700</td><td>-1px</td></tr>"
        "<tr><td>Section Heading</td><td>600</td><td>0</td></tr>"
        "<tr><td>Body</td><td>Regular</td><td>0</td></tr>"
        "<tr><td>Button</td><td>500</td><td>0</td></tr>"
        "<tr><td>Label</td><td>600</td><td>0.08em</td></tr>"
        "</tbody></table>"
        "<ul><li>OpenType features: <code>ss01</code>, <code>cv11</code>, <code>nope</code></li></ul>"
        "<p><strong>Avoid:</strong> 300, 500 and 600</p>"
    )

    def test_parse_weight(self):
        self.assertEqual(b.parse_weight("600"), 600)
        self.assertEqual(b.parse_weight("300-400"), 400)
        self.assertEqual(b.parse_weight("Medium"), 500)
        self.assertEqual(b.parse_weight("SemiBold"), 600)  # "semi" vem antes de "bold"
        self.assertEqual(b.parse_weight("Regular"), 400)
        self.assertIsNone(b.parse_weight("—"))

    def test_pick_weight(self):
        self.assertEqual(b.pick_weight([(400, 700)], 600), 600)
        self.assertEqual(b.pick_weight([(400, 400), (700, 700)], 600), 400)
        self.assertEqual(b.pick_weight([(700, 700)], 600), 700)  # nada abaixo: o menor disponível

    def test_parse_type_roles(self):
        r = b.parse_type_roles(self.GUIA)
        self.assertEqual(r["weights"], {"display": 700, "h2": 600, "body": 400, "button": 500, "label": 600})
        self.assertEqual(r["label_tracking"], (0.08, "em"))
        self.assertEqual(r["features"], ["ss01", "cv11"])  # "nope" fica de fora: lista fechada
        self.assertEqual(r["avoid_weights"], [300, 500, 600])

    def test_parse_type_roles_guia_generico_devolve_vazio(self):
        self.assertEqual(b.parse_type_roles("<h2>1. Overview</h2><p>x</p>"), {})

    def test_parse_type_roles_label_sem_caixa_alta(self):
        g = ("<h2>3. Typography</h2><table><tr><th>Role</th><th>Weight</th><th>Letter</th></tr>"
             "<tr><td>Label</td><td>500</td><td>0</td><td>sentence case</td></tr></table>")
        self.assertEqual(b.parse_type_roles(g).get("label_transform"), "none")


class Botao(unittest.TestCase):
    def test_parse_button_spec(self):
        g = "<h2>4. Components</h2><h3>Primary Button</h3><ul><li>Radius: 8px</li><li>Padding: 10px 20px</li></ul><h3>Card</h3>"
        self.assertEqual(b.parse_button_spec(g), {"radius": 8, "pad": (10, 20)})

    def test_parse_button_spec_pill(self):
        g = "<h2>4. Components</h2><h3>Button</h3><p>Radius: full. Padding: 12px 24px</p>"
        self.assertEqual(b.parse_button_spec(g), {"radius": 999, "pad": (12, 24)})

    def test_parse_button_spec_ignora_outros_blocos(self):
        g = "<h2>4. Components</h2><h3>Card</h3><p>Radius: 20px</p>"
        self.assertEqual(b.parse_button_spec(g), {})

    def test_nav_toggle_por_frase(self):
        g = "<h2>4. Components</h2><p>The hamburger toggle at 12px radius, always visible.</p>"
        self.assertEqual(b.parse_nav_toggle_policy(g), {"radius": "12px"})

    def test_nav_toggle_por_bloco(self):
        g = ("<h2>4. Components</h2><p>Radius: 50% Border: 1px solid #ffffff Background: rgba(0,0,0,0.5) "
             "Use: mobile menu toggle.</p>")
        self.assertEqual(b.parse_nav_toggle_policy(g),
                         {"radius": "50%", "border": "1px solid #ffffff", "bg": "rgba(0,0,0,0.5)"})

    def test_nav_toggle_sem_politica(self):
        self.assertEqual(b.parse_nav_toggle_policy("<h2>4. Components</h2><p>Nothing here.</p>"), {})


if __name__ == "__main__":
    unittest.main()
