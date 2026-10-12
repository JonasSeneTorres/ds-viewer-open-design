// Conteúdo de exemplo: Lorem ipsum, artigos, categorias e registros da tabela.


const THEME_KEY = "odv-theme";

const RECORDS_KEY = "odv-records";


const CATEGORIES = ["Ação", "Navegação", "Dados", "Feedback", "Formulário", "Layout"];


// Conteúdo de exemplo: Lorem ipsum, para o blog funcionar igual em qualquer idioma.
const LOREM = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
  "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.",
  "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus."
];


// Monta um corpo de artigo com os elementos de texto mais comuns; `n` varia a ordem dos parágrafos.
function loremBody(n) {
  function p(i) { return "<p>" + LOREM[(i + n) % LOREM.length] + "</p>"; }
  return (
    p(0) + p(1) +
    "<h2>Lorem ipsum dolor sit amet</h2>" +
    p(2) +
    "<blockquote>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.</blockquote>" +
    "<ul><li>Ut enim ad minim veniam, quis nostrud.</li><li>Duis aute irure dolor in reprehenderit.</li><li>Excepteur sint occaecat cupidatat non proident.</li></ul>" +
    "<h2>Consectetur adipiscing elit</h2>" +
    p(3) +
    "<pre>--lorem: ipsum;\n--dolor: sit amet;\n--consectetur: adipiscing;</pre>" +
    p(4) +
    "<p>Sed ut <strong>perspiciatis</strong> unde omnis iste natus error sit <em>voluptatem</em> accusantium, com <code>--ipsum</code> e <a>um link de exemplo</a>.</p>"
  );
}


const ARTICLES = [
  {
    id: "lorem-ipsum-dolor",
    tag: "Lorem",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    excerpt: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam quis nostrud.",
    read: "6 min",
    author: "Jonas Torres",
    date: "2026-02-18",
    body: loremBody(0)
  },
  {
    id: "ut-enim-ad-minim",
    tag: "Ipsum",
    title: "Ut enim ad minim veniam, quis nostrud exercitation",
    excerpt: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    read: "8 min",
    author: "Jonas Torres",
    date: "2026-03-03",
    body: loremBody(1)
  },
  {
    id: "duis-aute-irure",
    tag: "Dolor",
    title: "Duis aute irure dolor in reprehenderit in voluptate",
    excerpt: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.",
    read: "7 min",
    author: "Jonas Torres",
    date: "2026-03-21",
    body: loremBody(2)
  },
  {
    id: "sed-ut-perspiciatis",
    tag: "Sit amet",
    title: "Sed ut perspiciatis unde omnis iste natus error",
    excerpt: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
    read: "5 min",
    author: "Jonas Torres",
    date: "2026-04-02",
    body: loremBody(3)
  },
  {
    id: "at-vero-eos",
    tag: "Consectetur",
    title: "At vero eos et accusamus et iusto odio dignissimos",
    excerpt: "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet.",
    read: "6 min",
    author: "Jonas Torres",
    date: "2026-04-19",
    body: loremBody(4)
  },
  {
    id: "nemo-enim-ipsam",
    tag: "Adipiscing",
    title: "Nemo enim ipsam voluptatem quia voluptas sit",
    excerpt: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
    read: "4 min",
    author: "Jonas Torres",
    date: "2026-05-06",
    body: loremBody(5)
  }
];


let records = loadRecords();


function setRecords(next) {
  records = next;
}


function loadRecords() {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [
    { id: 1, name: "Button", category: "Ação", status: "estável", complexity: 1, updated: "2026-03-12" },
    { id: 2, name: "Modal", category: "Feedback", status: "estável", complexity: 3, updated: "2026-02-28" },
    { id: 3, name: "Tabela", category: "Dados", status: "estável", complexity: 4, updated: "2026-04-05" },
    { id: 4, name: "Date picker", category: "Formulário", status: "beta", complexity: 4, updated: "2026-04-22" },
    { id: 5, name: "Toast", category: "Feedback", status: "estável", complexity: 2, updated: "2026-03-30" },
    { id: 6, name: "Combobox", category: "Formulário", status: "beta", complexity: 3, updated: "2026-05-01" },
    { id: 7, name: "Tooltip", category: "Feedback", status: "experimental", complexity: 2, updated: "2026-05-09" },
    { id: 8, name: "Pagination", category: "Navegação", status: "estável", complexity: 3, updated: "2026-01-19" },
    { id: 9, name: "Accordion", category: "Layout", status: "estável", complexity: 2, updated: "2026-02-11" },
    { id: 10, name: "Tag", category: "Dados", status: "depreciado", complexity: 1, updated: "2025-12-20" }
  ];
}


function saveRecords() {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch (e) {}
}

export { ARTICLES, CATEGORIES, THEME_KEY, records, saveRecords, setRecords };
