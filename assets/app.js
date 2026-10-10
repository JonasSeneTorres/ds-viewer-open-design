(function () {
  "use strict";

  // ------------------------------------------------------------------
  // Idiomas. Textos dos JSONs vêm como [{lang, message}]; textos da interface
  // ficam no dicionário UI abaixo. Idioma padrão: o do sistema (pt* -> pt-BR,
  // senão en-US); a escolha do usuário fica em localStorage.
  // Obs.: o conteúdo dos artigos fica só em pt-BR; em en-US aparece um aviso de texto ilustrativo.
  // ------------------------------------------------------------------

  var LANGS = ["en-US", "pt-BR"];
  var LANG_KEY = "odv-lang";

  function detectLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    var n = (navigator.languages && navigator.languages[0]) || navigator.language || "en-US";
    return /^pt/i.test(n) ? "pt-BR" : "en-US";
  }

  var lang = detectLang();

  // Texto no idioma atual: aceita string pura ou [{lang, message}]; cai para en-US e depois para o primeiro.
  function L(v) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    var pick = v.filter(function (x) { return x.lang === lang; })[0] ||
      v.filter(function (x) { return x.lang === "en-US"; })[0] || v[0];
    return pick ? pick.message : "";
  }

  // Chave estável (en-US) para comparar/filtrar independentemente do idioma.
  function enKey(v) {
    if (typeof v === "string") return v;
    var en = v.filter(function (x) { return x.lang === "en-US"; })[0] || v[0];
    return en ? en.message : "";
  }

  var UI = {
    "skip": { "en-US": "Skip to content", "pt-BR": "Pular para o conteúdo" },
    "brand": { "en-US": "DS Viewer", "pt-BR": "Visualizador de DS" },
    "nav.label": { "en-US": "Main navigation", "pt-BR": "Navegação principal" },
    "nav.home": { "en-US": "Home", "pt-BR": "Início" },
    "nav.ds": { "en-US": "Design System", "pt-BR": "Design System" },
    "nav.blog": { "en-US": "Blog", "pt-BR": "Blog" },
    "nav.table": { "en-US": "Table", "pt-BR": "Tabela" },
    "nav.form": { "en-US": "Form", "pt-BR": "Formulário" },
    "footer.1": { "en-US": "Open Design DS viewer — sample content, real themes.", "pt-BR": "Visualizador de DS do Open Design — conteúdo de exemplo, temas reais." },
    "footer.2": { "en-US": "Switch the design system with the selector at the top.", "pt-BR": "Troque o design system no seletor do topo." },
    "lang.label": { "en-US": "Language: English. Switch to Portuguese", "pt-BR": "Idioma: português. Mudar para inglês" },
    "lang.code": { "en-US": "EN", "pt-BR": "PT" },
    "combo.label": { "en-US": "Choose design system", "pt-BR": "Escolher design system" },
    "combo.theme": { "en-US": "Theme", "pt-BR": "Tema" },
    "combo.search": { "en-US": "Search design system...", "pt-BR": "Buscar design system..." },
    "combo.empty": { "en-US": "No design system found.", "pt-BR": "Nenhum design system encontrado." },
    "crumbs.label": { "en-US": "You are here", "pt-BR": "Você está em" },
    "ds.loading": { "en-US": "Loading…", "pt-BR": "Carregando…" },
    "nf.title": { "en-US": "Page not found", "pt-BR": "Página não encontrada" },
    "nf.text": { "en-US": "The address you opened does not exist here.", "pt-BR": "O endereço que você abriu não existe por aqui." },
    "nf.back": { "en-US": "Back to home", "pt-BR": "Voltar para o início" },
    "list.kicker": { "en-US": "Design systems", "pt-BR": "Design systems" },
    "list.h1": { "en-US": "A browsable catalog of design systems.", "pt-BR": "Um catálogo navegável de design systems." },
    "list.lede": { "en-US": "The catalog brings the open-source design systems from", "pt-BR": "O catálogo traz os design systems open-source de" },
    "list.catalog": { "en-US": "Catalog", "pt-BR": "Catálogo" },
    "list.searchLabel": { "en-US": "Search design system", "pt-BR": "Buscar design system" },
    "list.searchPh": { "en-US": "Search by name, category or keyword...", "pt-BR": "Buscar por nome, categoria ou palavra-chave..." },
    "list.all": { "en-US": "All", "pt-BR": "Todas" },
    "list.one": { "en-US": "design system", "pt-BR": "design system" },
    "list.many": { "en-US": "design systems", "pt-BR": "design systems" },
    "card.details": { "en-US": "View details", "pt-BR": "Ver detalhes" },
    "ds.kicker": { "en-US": "Design system", "pt-BR": "Design system" },
    "ds.current": { "en-US": "Active", "pt-BR": "Ativo" },
    "ds.apply": { "en-US": "Apply theme", "pt-BR": "Aplicar tema" },
    "ds.applied": { "en-US": "Theme applied", "pt-BR": "Tema aplicado agora mesmo" },
    "ds.open": { "en-US": "Open on open-design.ai", "pt-BR": "Abrir no open-design.ai" },
    "ds.newTab": { "en-US": "(opens in a new tab)", "pt-BR": "(abre em outra aba)" },
    "pager.label": { "en-US": "Browse design systems", "pt-BR": "Navegar entre design systems" },
    "pal.title": { "en-US": "Color palette", "pt-BR": "Paleta de cores" },
    "pal.intro": {
      "en-US": "Three roles feed the site theme. The 50–950 scales are <strong>derived</strong> from the colors the design system provides; steps marked with a dot (<span class=\"exact-dot\" aria-hidden=\"true\"></span>) are exactly the provided values.",
      "pt-BR": "Três papéis alimentam o tema do site. As escalas 50–950 são <strong>derivadas</strong> das cores que o design system informa; os degraus marcados com ponto (<span class=\"exact-dot\" aria-hidden=\"true\"></span>) são exatamente os valores informados."
    },
    "pal.primary": { "en-US": "Primary color", "pt-BR": "Cor primária" },
    "pal.secondary": { "en-US": "Secondary color", "pt-BR": "Cor secundária" },
    "pal.neutral": { "en-US": "Neutral color", "pt-BR": "Cor neutral" },
    "font.title": { "en-US": "Typography and fonts", "pt-BR": "Tipografia e fontes" },
    "font.stack": { "en-US": "font-family:", "pt-BR": "font-family:" },
    "font.noItalic": { "en-US": "No native italic: the browser simulates italic (oblique) from the regular style.", "pt-BR": "Sem itálico nativo: o navegador simula o itálico (oblíquo) a partir do estilo normal." },
    "font.regular": { "en-US": "Regular", "pt-BR": "Normal" },
    "font.italic": { "en-US": "Italic", "pt-BR": "Itálico" },
    "font.bold": { "en-US": "Bold", "pt-BR": "Negrito" },
    "font.fallback": { "en-US": "Fallback", "pt-BR": "Fallback" },
    "font.how": { "en-US": "How to add (Google Fonts)", "pt-BR": "Como adicionar (Google Fonts)" },
    "font.head": { "en-US": "Paste into the HTML <code>&lt;head&gt;</code>:", "pt-BR": "Cole no <code>&lt;head&gt;</code> do HTML:" },
    "font.css": { "en-US": "Or, in CSS:", "pt-BR": "Ou, no CSS:" },
    "font.npm": { "en-US": "Or, via npm (self-host):", "pt-BR": "Ou, via npm (self-host):" },
    "font.then": { "en-US": "Then use", "pt-BR": "Depois use" },
    "font.ref": { "en-US": "Reference:", "pt-BR": "Referência:" },
    "font.none": { "en-US": "No CDN font identified: this role uses system fonts (font-family above).", "pt-BR": "Nenhuma fonte de CDN identificada: este papel usa fontes do sistema (font-family acima)." },
    "tok.title": { "en-US": "Design tokens", "pt-BR": "Design tokens" },
    "load.title": { "en-US": "Catalog unavailable", "pt-BR": "Catálogo indisponível" },
    "load.text": {
      "en-US": "This site reads <code>data/ds/index.json</code> via fetch — open it through a local server (e.g. <code>npm start</code>), not straight from the file.",
      "pt-BR": "Este site lê <code>data/ds/index.json</code> via fetch — abra por um servidor local (ex.: <code>npm start</code>), não direto do arquivo."
    },
    "aside.label": { "en-US": "Blog sidebar", "pt-BR": "Barra lateral do blog" },
    "aside.search": { "en-US": "Search", "pt-BR": "Buscar" },
    "aside.searchPh": { "en-US": "Search the blog...", "pt-BR": "Buscar no blog..." },
    "aside.cats": { "en-US": "Categories", "pt-BR": "Categorias" },
    "aside.recent": { "en-US": "Recent posts", "pt-BR": "Posts recentes" },
    "aside.tags": { "en-US": "Tags", "pt-BR": "Tags" },
    "tbl.state": { "en-US": "Table state", "pt-BR": "Estado da tabela" },
    "tbl.stData": { "en-US": "Data", "pt-BR": "Dados" },
    "tbl.stLoading": { "en-US": "Loading", "pt-BR": "Carregando" },
    "tbl.stEmpty": { "en-US": "Empty", "pt-BR": "Vazio" },
    "tbl.stError": { "en-US": "Error", "pt-BR": "Erro" },
    "tbl.loading": { "en-US": "Loading components...", "pt-BR": "Carregando componentes..." },
    "tbl.errTitle": { "en-US": "Could not load the components", "pt-BR": "Não foi possível carregar os componentes" },
    "tbl.errText": { "en-US": "Check your connection and try again.", "pt-BR": "Verifique a conexão e tente novamente." },
    "tbl.retry": { "en-US": "Try again", "pt-BR": "Tentar novamente" },
    "tbl.depTip": { "en-US": "Deprecated components cannot be edited", "pt-BR": "Componentes depreciados não podem ser editados" },
    "frm.states": { "en-US": "Field states", "pt-BR": "Estados dos campos" },
    "frm.stError": { "en-US": "Field with error", "pt-BR": "Campo com erro" },
    "frm.stHelp": { "en-US": "Field with help", "pt-BR": "Campo com ajuda" },
    "frm.stHelpHint": { "en-US": "We never share your email.", "pt-BR": "Nunca compartilhamos o seu e-mail." },
    "frm.stDisabled": { "en-US": "Disabled field", "pt-BR": "Campo desabilitado" },
    "frm.stReadonly": { "en-US": "Read-only field", "pt-BR": "Campo somente leitura" },
    "frm.stValue": { "en-US": "Cannot be edited", "pt-BR": "Não pode ser editado" },
    "frm.stSelect": { "en-US": "Disabled select", "pt-BR": "Seleção desabilitada" },
    "frm.stOn": { "en-US": "Disabled, checked", "pt-BR": "Desabilitado, marcado" },
    "frm.stOff": { "en-US": "Disabled, unchecked", "pt-BR": "Desabilitado, desmarcado" },
    "frm.buttons": { "en-US": "Buttons", "pt-BR": "Botões" },
    "frm.btnPrimary": { "en-US": "Primary", "pt-BR": "Principal" },
    "frm.btnGhost": { "en-US": "Secondary", "pt-BR": "Secundário" },
    "frm.btnDanger": { "en-US": "Danger", "pt-BR": "Perigo" },
    "frm.btnSuccess": { "en-US": "Success", "pt-BR": "Sucesso" },
    "frm.btnDisabled": { "en-US": "Disabled", "pt-BR": "Desabilitado" },
    "frm.btnLoading": { "en-US": "Loading", "pt-BR": "Carregando" },
    "frm.alerts": { "en-US": "Alerts", "pt-BR": "Alertas" },
    "frm.alInfo": { "en-US": "Information: your changes are saved automatically.", "pt-BR": "Informação: suas alterações são salvas automaticamente." },
    "frm.alOk": { "en-US": "Success: the record was created.", "pt-BR": "Sucesso: o registro foi criado." },
    "frm.alWarn": { "en-US": "Warning: this action affects other records.", "pt-BR": "Atenção: esta ação afeta outros registros." },
    "frm.alErr": { "en-US": "Error: could not save. Try again.", "pt-BR": "Erro: não foi possível salvar. Tente novamente." },
    "frm.loadingSec": { "en-US": "Loading and progress", "pt-BR": "Carregamento e progresso" },
    "frm.progress": { "en-US": "Upload progress", "pt-BR": "Progresso do envio" },
    "frm.indeterminate": { "en-US": "Waiting for a response", "pt-BR": "Aguardando resposta" },
    "frm.skeleton": { "en-US": "Content placeholder", "pt-BR": "Espaço reservado para conteúdo" },
    "top.label": { "en-US": "Back to top", "pt-BR": "Voltar ao topo" },
    "close": { "en-US": "Close", "pt-BR": "Fechar" },
    "cancel": { "en-US": "Cancel", "pt-BR": "Cancelar" },
    "save": { "en-US": "Save", "pt-BR": "Salvar" },
    "delete": { "en-US": "Delete", "pt-BR": "Excluir" },
    "edit": { "en-US": "Edit", "pt-BR": "Editar" },
    "home.kicker": { "en-US": "DS Viewer · Open Design", "pt-BR": "Visualizador de DS · Open Design" },
    "home.h1": { "en-US": "A hands-on viewer for Open Design's design systems.", "pt-BR": "Visualizador Prático de Design Systems do Open Design." },
    "home.lede": {
      "en-US": "All texts, articles and forms are for illustration only. Their sole purpose is to let you interact with the page and get a better feel for what each cataloged design system has to offer.",
      "pt-BR": "Todos os textos, matérias e formulários são somente ilustrativos. A única finalidade é poder interagir com a página tendo uma ideia melhor do que cada design system catalogado tem a oferecer."
    },
    "home.blog": { "en-US": "Read the blog", "pt-BR": "Ler o blog" },
    "blog.kicker": { "en-US": "Blog", "pt-BR": "Blog" },
    "blog.h1": { "en-US": "Latest posts", "pt-BR": "Últimas publicações" },
    "home.featured": { "en-US": "Featured", "pt-BR": "Destaque" },
    "home.articles": { "en-US": "Articles", "pt-BR": "Artigos" },
    "home.count": { "en-US": "posts", "pt-BR": "publicações" },
    "art.read": { "en-US": "read", "pt-BR": "de leitura" },
    "art.article": { "en-US": "Article", "pt-BR": "Artigo" },
    "tbl.kicker": { "en-US": "Data · Components", "pt-BR": "Dados · Componentes" },
    "tbl.h1": { "en-US": "Component catalog", "pt-BR": "Catálogo de componentes" },
    "tbl.lede": {
      "en-US": "A generic sample table. Use <strong>Add</strong> to create a record, <strong>Edit</strong> to reopen the same form pre-filled and <strong>Delete</strong> to confirm removal.",
      "pt-BR": "Uma tabela genérica de exemplo. Use <strong>Adicionar</strong> para criar um registro, <strong>Editar</strong> para reabrir o mesmo formulário preenchido e <strong>Excluir</strong> para confirmar a remoção."
    },
    "tbl.add": { "en-US": "+ Add component", "pt-BR": "+ Adicionar componente" },
    "tbl.colName": { "en-US": "Component", "pt-BR": "Componente" },
    "tbl.colCat": { "en-US": "Category", "pt-BR": "Categoria" },
    "tbl.colStatus": { "en-US": "Status", "pt-BR": "Status" },
    "tbl.colCx": { "en-US": "Complexity", "pt-BR": "Complexidade" },
    "tbl.colUpd": { "en-US": "Updated", "pt-BR": "Atualizado" },
    "tbl.colAct": { "en-US": "Actions", "pt-BR": "Ações" },
    "tbl.emptyTitle": { "en-US": "No components here", "pt-BR": "Nenhum componente por aqui" },
    "tbl.emptyText": { "en-US": "Add the first record to start the catalog.", "pt-BR": "Adicione o primeiro registro para começar o catálogo." },
    "tbl.one": { "en-US": "record", "pt-BR": "registro" },
    "tbl.many": { "en-US": "records", "pt-BR": "registros" },
    "rec.add": { "en-US": "Add component", "pt-BR": "Adicionar componente" },
    "rec.edit": { "en-US": "Edit component", "pt-BR": "Editar componente" },
    "rec.name": { "en-US": "Component name", "pt-BR": "Nome do componente" },
    "rec.namePh": { "en-US": "E.g.: Segmented control", "pt-BR": "Ex.: Segmented control" },
    "rec.updated": { "en-US": "Updated on", "pt-BR": "Atualizado em" },
    "rec.nameErr": { "en-US": "Enter a name for the component.", "pt-BR": "Informe um nome para o componente." },
    "del.title": { "en-US": "Delete record", "pt-BR": "Excluir registro" },
    "del.text": {
      "en-US": "Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.",
      "pt-BR": "Tem certeza que deseja excluir <strong>{name}</strong>? Esta ação não pode ser desfeita."
    },
    "cat.Ação": { "en-US": "Action", "pt-BR": "Ação" },
    "cat.Navegação": { "en-US": "Navigation", "pt-BR": "Navegação" },
    "cat.Dados": { "en-US": "Data", "pt-BR": "Dados" },
    "cat.Feedback": { "en-US": "Feedback", "pt-BR": "Feedback" },
    "cat.Formulário": { "en-US": "Form", "pt-BR": "Formulário" },
    "cat.Layout": { "en-US": "Layout", "pt-BR": "Layout" },
    "st.estável": { "en-US": "stable", "pt-BR": "estável" },
    "st.beta": { "en-US": "beta", "pt-BR": "beta" },
    "st.experimental": { "en-US": "experimental", "pt-BR": "experimental" },
    "st.depreciado": { "en-US": "deprecated", "pt-BR": "depreciado" },
    "frm.kicker": { "en-US": "Form · Demo", "pt-BR": "Formulário · Demonstração" },
    "frm.h1": { "en-US": "One field of each type", "pt-BR": "Um campo de cada tipo" },
    "frm.lede": {
      "en-US": "Below we gathered, in one place, at least one field of each input type — so you can see how each design system dresses the same controls. Submit to see the loading state and the success feedback.",
      "pt-BR": "Abaixo reunimos, em um só lugar, pelo menos um campo de cada tipo de entrada — para você ver como cada design system veste os mesmos controles. Envie para ver o estado de carregamento e o feedback de sucesso."
    },
    "frm.ident": { "en-US": "Identification", "pt-BR": "Identificação" },
    "frm.text": { "en-US": "Text", "pt-BR": "Texto" },
    "frm.textPh": { "en-US": "Full name", "pt-BR": "Nome completo" },
    "frm.email": { "en-US": "Email", "pt-BR": "E-mail" },
    "frm.emailPh": { "en-US": "you@example.com", "pt-BR": "voce@exemplo.com" },
    "frm.phone": { "en-US": "Phone", "pt-BR": "Telefone" },
    "frm.phonePh": { "en-US": "+1 (555) 000-0000", "pt-BR": "+55 (11) 90000-0000" },
    "frm.urlPh": { "en-US": "https://example.com", "pt-BR": "https://exemplo.com" },
    "frm.password": { "en-US": "Password", "pt-BR": "Senha" },
    "frm.search": { "en-US": "Search", "pt-BR": "Busca" },
    "frm.searchPh": { "en-US": "Search component...", "pt-BR": "Buscar componente..." },
    "frm.numbers": { "en-US": "Numbers and dates", "pt-BR": "Números e datas" },
    "frm.number": { "en-US": "Number", "pt-BR": "Número" },
    "frm.date": { "en-US": "Date", "pt-BR": "Data" },
    "frm.time": { "en-US": "Time", "pt-BR": "Hora" },
    "frm.datetime": { "en-US": "Date and time", "pt-BR": "Data e hora" },
    "frm.rangeColor": { "en-US": "Range and color", "pt-BR": "Intervalo e cor" },
    "frm.intensity": { "en-US": "Theme intensity", "pt-BR": "Intensidade do tema" },
    "frm.color": { "en-US": "Accent color", "pt-BR": "Cor de destaque" },
    "frm.file": { "en-US": "File", "pt-BR": "Arquivo" },
    "frm.choices": { "en-US": "Choices", "pt-BR": "Escolhas" },
    "frm.mainCat": { "en-US": "Main category", "pt-BR": "Categoria principal" },
    "frm.priority": { "en-US": "Priority level (radio)", "pt-BR": "Nível de prioridade (radio)" },
    "frm.low": { "en-US": "Low", "pt-BR": "Baixa" },
    "frm.medium": { "en-US": "Medium", "pt-BR": "Média" },
    "frm.high": { "en-US": "High", "pt-BR": "Alta" },
    "frm.features": { "en-US": "Features (checkbox)", "pt-BR": "Recursos (checkbox)" },
    "frm.light": { "en-US": "Light theme", "pt-BR": "Tema claro" },
    "frm.dark": { "en-US": "Dark theme", "pt-BR": "Tema escuro" },
    "frm.contrast": { "en-US": "High contrast", "pt-BR": "Alto contraste" },
    "frm.news": { "en-US": "Receive news by email", "pt-BR": "Receber novidades por e-mail" },
    "frm.message": { "en-US": "Message", "pt-BR": "Mensagem" },
    "frm.comment": { "en-US": "Comment", "pt-BR": "Comentário" },
    "frm.commentPh": { "en-US": "What else would you like to see in the viewer?", "pt-BR": "O que mais você gostaria de ver no visualizador?" },
    "frm.commentHint": { "en-US": "Free field, accepts multiple lines.", "pt-BR": "Campo livre, aceita várias linhas." },
    "frm.submit": { "en-US": "Submit form", "pt-BR": "Enviar formulário" },
    "frm.reset": { "en-US": "Clear", "pt-BR": "Limpar" },
    "frm.required": { "en-US": "Required field.", "pt-BR": "Campo obrigatório." },
    "frm.emailErr": { "en-US": "Enter a valid email.", "pt-BR": "Informe um e-mail válido." },
    "frm.review": { "en-US": "Review the highlighted fields before submitting.", "pt-BR": "Revise os campos destacados antes de enviar." },
    "frm.sending": { "en-US": "Sending...", "pt-BR": "Enviando..." },
    "frm.success": { "en-US": "Form submitted successfully! This data is for demonstration only.", "pt-BR": "Formulário enviado com sucesso! Estes dados são apenas de demonstração." }
  };

  function T(key) {
    var e = UI[key];
    return e ? (e[lang] != null ? e[lang] : e["en-US"]) : key;
  }

  // ------------------------------------------------------------------
  // Dados de design systems: data/ds/index.json (lista na ordem do combobox:
  // padrão primeiro, depois as categorias) e data/ds/<id>.<lang>.json (detalhes,
  // carregados só quando a página do DS é aberta) e data/themes/<id>.css (tema). Gerados por
  // scripts/build_ds_details.py a partir do open-design.ai.
  // ------------------------------------------------------------------

  var THEMES = [];              // todos os design systems aplicáveis, na ordem do combobox
  var DS_DATA = {};             // detalhes já carregados, por id e idioma (data/ds/<id>.<lang>.json)
  var CATALOG = [];             // THEMES sem o padrão: {id,name,category,tagline,swatches}
  var CATALOG_CATEGORIES = [];

  function registerDs(d) {
    THEMES.push({
      id: d.id,
      label: d.name,
      hint: d.tagline,
      category: d.category,
      swatches: d.swatches
    });
    if (d.id !== DEFAULT_THEME) {
      CATALOG.push({ id: d.id, name: d.name, category: d.category, tagline: d.tagline, swatches: d.swatches });
      if (!CATALOG_CATEGORIES.some(function (c) { return enKey(c) === enKey(d.category); })) CATALOG_CATEGORIES.push(d.category);
    }
  }

  function loadData() {
    return fetch("data/ds/index.json", { credentials: "same-origin" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (list) { list.forEach(registerDs); })
      .catch(function (err) {
        console.error("Falha ao carregar data/ds/index.json:", err);
        var main = document.getElementById("app");
        if (main) {
          main.innerHTML =
            '<div class="wrap page"><div class="empty"><strong>' + esc(T("load.title")) + "</strong>" +
            "<p>" + T("load.text") + "</p></div></div>";
        }
      });
  }

  // Detalhes de um DS no idioma atual (data/ds/<id>.<lang>.json), com cache por idioma.
  function loadDsDetail(id) {
    var key = id + "|" + lang;
    if (DS_DATA[key]) return Promise.resolve(DS_DATA[key]);
    return fetch("data/ds/" + encodeURIComponent(id) + "." + lang + ".json", { credentials: "same-origin" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (d) { DS_DATA[key] = d; return d; });
  }

  var DEFAULT_THEME = "padrao";

  // Quadradinhos de cor: só cores únicas (o índice repete tons quando o DS tem poucas cores).
  function chipsHTML(colors) {
    var seen = {};
    return colors.filter(function (c) {
      var k = String(c).trim().toLowerCase();
      if (!k || seen[k]) return false;
      seen[k] = true;
      return true;
    }).map(function (c) {
      return '<i class="ds-chip" style="background:' + esc(c) + '"></i>';
    }).join("");
  }

  // Cada tema é um CSS próprio (data/themes/<id>.css: variáveis + @import das fontes),
  // carregado sob demanda. O padrão já vem linkado no index.html.
  function themeLink(id) {
    var link = document.querySelector('link[data-theme-css="' + id + '"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "data/themes/" + encodeURIComponent(id) + ".css";
      link.setAttribute("data-theme-css", id);
      link.addEventListener("load", function () { link.setAttribute("data-loaded", ""); });
      document.head.appendChild(link);
    }
    return link;
  }

  var THEME_KEY = "odv-theme";
  var RECORDS_KEY = "odv-records";

  var CATEGORIES = ["Ação", "Navegação", "Dados", "Feedback", "Formulário", "Layout"];

  // Conteúdo de exemplo: Lorem ipsum, para o blog funcionar igual em qualquer idioma.
  var LOREM = [
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

  var ARTICLES = [
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

  var records = loadRecords();

  function loadRecords() {
    try {
      var raw = localStorage.getItem(RECORDS_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
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

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function formatDate(iso) {
    if (!iso) return "—";
    var parts = iso.split("-");
    if (parts.length !== 3) return esc(iso);
    return lang === "en-US"
      ? parts[1] + "/" + parts[2] + "/" + parts[0]
      : parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  var app = document.getElementById("app");

  function getStoredTheme() {
    try {
      var t = localStorage.getItem(THEME_KEY);
      if (t && THEMES.some(function (x) { return x.id === t; })) return t;
    } catch (e) {}
    return DEFAULT_THEME;
  }

  var currentTheme = DEFAULT_THEME;

  // Aplica o tema só ao documento (prévia); setTheme também guarda a escolha e atualiza o combobox.
  // Também deixa a classe "theme-<id>" no body, para ajustes de um tema só com seletor composto
  // (ex.: body.theme-airbnb .site-header { ... }) sem vazar para os outros.
  // O tema só é trocado quando o CSS dele termina de carregar, para não piscar o visual-base.
  var wantedTheme = "";
  function applyTheme(id) {
    wantedTheme = id;
    var link = themeLink(id);
    function swap() {
      if (wantedTheme !== id) return;
      document.documentElement.setAttribute("data-theme", id);
      var body = document.body;
      body.className.split(/\s+/).forEach(function (c) {
        if (c.indexOf("theme-") === 0) body.classList.remove(c);
      });
      body.classList.add("theme-" + id);
    }
    if (link.hasAttribute("data-loaded") || link.sheet) swap();
    else {
      link.addEventListener("load", swap);
      link.addEventListener("error", swap);
    }
  }

  function setTheme(id) {
    var theme = THEMES.filter(function (t) { return t.id === id; })[0] ||
      THEMES.filter(function (t) { return t.id === DEFAULT_THEME; })[0] || THEMES[0];
    currentTheme = theme.id;
    applyTheme(theme.id);
    try {
      localStorage.setItem(THEME_KEY, theme.id);
    } catch (e) {}
    var label = themePicker.querySelector(".combobox-label");
    if (label) label.textContent = L(theme.label);
    // Destaca o card do tema ativo na página de Design System (se estiver aberta).
    document.querySelectorAll(".ds-card-cat").forEach(function (card) {
      card.classList.toggle("is-current", card.dataset.id === theme.id);
    });
    themePicker.querySelectorAll(".combobox-option").forEach(function (opt) {
      opt.setAttribute("aria-selected", String(opt.dataset.themeId === theme.id));
    });
  }

  var themePicker = document.getElementById("themePicker");
  var comboBtn, comboPop, comboSearch, comboList, comboStatus, comboIndex = -1;

  // Minúsculas e sem acento, para a busca do seletor.
  function fold(s) {
    return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  // Botão que abre um popup com campo de busca (role=combobox) e a lista de temas (role=listbox).
  function buildCombobox() {
    themePicker.innerHTML =
      '<div class="combobox">' +
      '<button type="button" class="combobox-btn" aria-expanded="false" aria-haspopup="dialog" aria-controls="themePop" aria-label="' + esc(T("combo.label")) + '">' +
      '<span class="combobox-swatch" aria-hidden="true"></span>' +
      '<span class="combobox-label">' + esc(T("combo.theme")) + '</span>' +
      '<svg class="combobox-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
      "</button>" +
      '<div class="combobox-pop" id="themePop" role="dialog" hidden>' +
      '<input type="search" class="combobox-search" role="combobox" aria-expanded="true" aria-controls="themeListbox" aria-autocomplete="list" autocomplete="off" spellcheck="false">' +
      '<p class="sr-only" role="status" aria-live="polite" id="themeStatus"></p>' +
      '<ul class="combobox-list" id="themeListbox" role="listbox"></ul>' +
      "</div>" +
      "</div>";

    comboBtn = themePicker.querySelector(".combobox-btn");
    comboPop = themePicker.querySelector(".combobox-pop");
    comboSearch = themePicker.querySelector(".combobox-search");
    comboList = themePicker.querySelector(".combobox-list");
    comboStatus = themePicker.querySelector("#themeStatus");

    fillComboList();

    comboBtn.addEventListener("click", function () {
      if (comboPop.hidden) openCombo(); else closeCombo(true);
    });
    bindComboEvents();
  }

  function fillComboList() {
    var html = "";
    var grp = 0;
    function optionHTML(t) {
      var label = L(t.label);
      return (
        '<li class="combobox-option" role="option" id="theme-opt-' + t.id + '" data-kind="theme" data-theme-id="' + t.id + '" data-search="' + esc(fold(label + " " + L(t.category))) + '" aria-selected="false">' +
        '<span class="opt-label">' + esc(label) + "</span>" +
        '<span class="ds-strip opt-strip" aria-hidden="true">' + chipsHTML(t.swatches) + "</span>" +
        "</li>"
      );
    }
    var def = THEMES.filter(function (t) { return t.id === "padrao"; })[0];
    var groups = (def ? [[def.category, [def]]] : []).concat(
      CATALOG_CATEGORIES.map(function (cat) {
        return [cat, THEMES.filter(function (t) { return t.id !== "padrao" && enKey(t.category) === enKey(cat); })];
      })
    );
    groups.forEach(function (g) {
      if (!g[1].length) return;
      var gid = "theme-grp-" + (grp++);
      html += '<li class="combobox-section" role="presentation"><span class="combobox-group" id="' + gid + '">' + esc(L(g[0])) + "</span>" +
        '<ul role="group" aria-labelledby="' + gid + '">' + g[1].map(optionHTML).join("") + "</ul></li>";
    });
    html += '<li class="combobox-empty" role="presentation" hidden>' + esc(T("combo.empty")) + "</li>";
    comboList.innerHTML = html;
    comboSearch.setAttribute("placeholder", T("combo.search"));
    comboSearch.setAttribute("aria-label", T("combo.search"));
    comboPop.setAttribute("aria-label", T("combo.label"));
    comboIndex = -1;
    filterCombo();
  }

  // Mostra só as opções que casam com a busca; esconde grupos vazios e avisa o total.
  function filterCombo() {
    var q = fold(comboSearch.value.trim());
    var total = 0;
    comboList.querySelectorAll(".combobox-section").forEach(function (sec) {
      var shown = 0;
      sec.querySelectorAll(".combobox-option").forEach(function (opt) {
        var ok = !q || opt.dataset.search.indexOf(q) !== -1;
        opt.hidden = !ok;
        if (ok) shown++;
      });
      sec.hidden = shown === 0;
      total += shown;
    });
    comboList.querySelector(".combobox-empty").hidden = total !== 0;
    comboStatus.textContent = total + " " + (total === 1 ? T("list.one") : T("list.many"));
    setActive(q && total ? 0 : -1);
  }

  function visibleOptions() {
    return Array.prototype.slice.call(comboList.querySelectorAll(".combobox-option:not([hidden])"));
  }

  function bindComboEvents() {
    comboBtn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (comboPop.hidden) openCombo();
      }
    });

    comboSearch.addEventListener("input", filterCombo);

    comboPop.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); moveActive(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); }
      else if (e.key === "Home" && comboIndex >= 0) { e.preventDefault(); setActive(0); }
      else if (e.key === "End" && comboIndex >= 0) { e.preventDefault(); setActive(visibleOptions().length - 1); }
      else if (e.key === "Enter") {
        var active = visibleOptions()[comboIndex];
        if (active) { e.preventDefault(); chooseOption(active); }
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeCombo(true);
      } else if (e.key === "Tab") {
        closeCombo(false);
      }
    });

    comboList.addEventListener("click", function (e) {
      var opt = e.target.closest(".combobox-option");
      if (opt) chooseOption(opt);
    });

    document.addEventListener("click", function (e) {
      if (!themePicker.contains(e.target)) closeCombo(false);
    });
  }

  function openCombo() {
    comboPop.hidden = false;
    comboBtn.setAttribute("aria-expanded", "true");
    comboSearch.value = "";
    filterCombo();
    var selected = comboList.querySelector('[aria-selected="true"]');
    setActive(selected ? visibleOptions().indexOf(selected) : 0);
    comboSearch.focus();
  }

  function closeCombo(restoreFocus) {
    if (comboPop.hidden) return;
    comboPop.hidden = true;
    comboBtn.setAttribute("aria-expanded", "false");
    setActive(-1);
    if (restoreFocus) comboBtn.focus();
  }

  function setActive(index) {
    comboIndex = index;
    comboList.querySelectorAll(".combobox-option[data-active]").forEach(function (opt) {
      opt.removeAttribute("data-active");
    });
    var opt = index >= 0 ? visibleOptions()[index] : null;
    if (opt) {
      opt.setAttribute("data-active", "true");
      opt.scrollIntoView({ block: "nearest" });
      comboSearch.setAttribute("aria-activedescendant", opt.id);
    } else {
      comboIndex = -1;
      comboSearch.removeAttribute("aria-activedescendant");
    }
  }

  function chooseOption(opt) {
    selectTheme(opt.dataset.themeId);
  }

  function moveActive(delta) {
    var total = visibleOptions().length;
    if (!total) return;
    var next = comboIndex + delta;
    if (next < 0) next = total - 1;
    if (next >= total) next = 0;
    setActive(next);
  }

  function selectTheme(id) {
    setTheme(id);
    closeCombo(true);
  }

  // Início: o hero e, logo abaixo, o catálogo de design systems.
  function homeHTML() {
    return (
      '<section class="hero"><div class="wrap hero-inner">' +
      '<span class="kicker">' + esc(T("home.kicker")) + "</span>" +
      "<h1>" + esc(T("home.h1")) + "</h1>" +
      '<p class="lede">' + esc(T("home.lede")) + "</p>" +
      '<div class="hero-actions">' +
      '<a class="btn btn-ghost" href="#/blog">' + esc(T("home.blog")) + "</a>" +
      "</div>" +
      "</div></section>" +
      '<div class="wrap page">' + renderDSList(true) + "</div>"
    );
  }

  // Blog: o destaque e a grade de artigos.
  function blogHTML() {
    var featured = ARTICLES[0];
    var rest = ARTICLES.slice(1);
    return (
      '<div class="page-head">' +
      '<span class="kicker">' + esc(T("blog.kicker")) + "</span>" +
      "<h1>" + esc(T("blog.h1")) + "</h1>" +
      "</div>" +
      '<a class="featured" href="#/artigo/' + featured.id + '">' +
      '<div class="featured-visual" aria-hidden="true"><span>' + esc(featured.id.split("-")[0].charAt(0).toUpperCase()) + "</span></div>" +
      '<div class="featured-body">' +
      '<span class="kicker">' + esc(T("home.featured")) + " · " + esc(featured.tag) + "</span>" +
      "<h2>" + esc(featured.title) + "</h2>" +
      "<p>" + esc(featured.excerpt) + "</p>" +
      '<span class="article-meta"><span>' + esc(featured.author) + "</span><span>" + formatDate(featured.date) + "</span><span>" + esc(featured.read) + " " + esc(T("art.read")) + "</span></span>" +
      "</div>" +
      "</a>" +
      '<div class="section-head"><h2>' + esc(T("home.articles")) + '</h2><span class="muted">' + ARTICLES.length + " " + esc(T("home.count")) + "</span></div>" +
      '<div class="article-grid">' +
      rest.map(function (a) {
        return (
          '<a class="article-card" href="#/artigo/' + a.id + '">' +
          '<span class="kicker">' + esc(a.tag) + "</span>" +
          "<h3>" + esc(a.title) + "</h3>" +
          "<p>" + esc(a.excerpt) + "</p>" +
          '<span class="article-meta"><span>' + esc(a.author) + "</span><span>" + esc(a.read) + "</span></span>" +
          "</a>"
        );
      }).join("") +
      "</div>"
    );
  }

  // Barra lateral de blog genérico: busca e links são só de enfeite (sem destino).
  function blogAsideHTML() {
    var cats = ["Lorem", "Ipsum", "Dolor", "Sit amet", "Consectetur"];
    var tags = ["lorem", "ipsum", "dolor", "amet", "elit", "tempor", "magna", "aliqua"];
    return (
      '<aside class="blog-aside" aria-label="' + esc(T("aside.label")) + '">' +
      '<form class="aside-search" role="search">' +
      '<label class="sr-only" for="asideSearch">' + esc(T("aside.search")) + "</label>" +
      '<input type="search" id="asideSearch" placeholder="' + esc(T("aside.searchPh")) + '">' +
      '<button type="submit" class="btn btn-primary btn-small">' + esc(T("aside.search")) + "</button>" +
      "</form>" +
      '<section class="aside-block"><h2 class="aside-title">' + esc(T("aside.cats")) + "</h2><ul>" +
      cats.map(function (c, i) {
        return '<li><a class="dead-link">' + esc(c) + '</a><span class="aside-count">' + (12 - i * 2) + "</span></li>";
      }).join("") +
      "</ul></section>" +
      '<section class="aside-block"><h2 class="aside-title">' + esc(T("aside.recent")) + "</h2><ul>" +
      ARTICLES.slice(0, 4).map(function (a) {
        return '<li><a class="dead-link">' + esc(a.title) + "</a></li>";
      }).join("") +
      "</ul></section>" +
      '<section class="aside-block"><h2 class="aside-title">' + esc(T("aside.tags")) + '</h2><p class="aside-tags">' +
      tags.map(function (t) { return '<a class="dead-link aside-tag">' + esc(t) + "</a>"; }).join("") +
      "</p></section>" +
      "</aside>"
    );
  }

  // crumbs: [[label, href], ...] — o último item é a página atual (sem link).
  function breadcrumbs(crumbs) {
    var items = [[T("nav.home"), "#/"]].concat(crumbs);
    return (
      '<nav class="breadcrumbs" aria-label="' + esc(T("crumbs.label")) + '">' +
      "<ol>" +
      items.map(function (c, i) {
        var last = i === items.length - 1;
        return last
          ? '<li aria-current="page">' + esc(c[0]) + "</li>"
          : '<li><a href="' + c[1] + '">' + esc(c[0]) + "</a></li>";
      }).join("") +
      "</ol>" +
      "</nav>"
    );
  }

  function page(html, crumbs) {
    return '<div class="wrap page">' + breadcrumbs(crumbs) + html + "</div>";
  }

  function articleTitle(id) {
    for (var i = 0; i < ARTICLES.length; i++) if (ARTICLES[i].id === id) return ARTICLES[i].title;
    return T("art.article");
  }

  function dsName(id) {
    var i = dsIndex(id);
    return i !== -1 ? L(THEMES[i].label) : T("nf.title");
  }

  function articleHTML(id) {
    var i = ARTICLES.map(function (a) { return a.id; }).indexOf(id);
    if (i === -1) return notFoundHTML();
    var a = ARTICLES[i];
    var prev = ARTICLES[i - 1];
    var next = ARTICLES[i + 1];
    var aside = blogAsideHTML();
    return (
      '<div class="article-layout">' +
      '<div class="article-body">' +
      '<span class="kicker">' + esc(a.tag) + "</span>" +
      "<h1>" + esc(a.title) + "</h1>" +
      '<span class="article-meta"><span>' + esc(a.author) + "</span><span>" + formatDate(a.date) + "</span><span>" + esc(a.read) + " " + esc(T("art.read")) + "</span></span>" +
      '<div style="margin-top:28px">' + a.body + "</div>" +
      '<div class="article-foot">' +
      (prev ? '<a class="btn btn-ghost" href="#/artigo/' + prev.id + '">&larr; ' + esc(prev.title) + "</a>" : "<span></span>") +
      (next ? '<a class="btn btn-ghost" href="#/artigo/' + next.id + '">' + esc(next.title) + " &rarr;</a>" : "<span></span>") +
      "</div>" +
      "</div>" +
      aside +
      "</div>"
    );
  }

  function notFoundHTML() {
    return (
      '<div class="empty">' +
      "<strong>" + esc(T("nf.title")) + "</strong>" +
      "<p>" + esc(T("nf.text")) + "</p>" +
      '<p><a class="btn btn-primary" href="#/">' + esc(T("nf.back")) + "</a></p>" +
      "</div>"
    );
  }

  function statusPill(status) {
    return '<span class="pill pill-' + status + '">' + esc(UI["st." + status] ? T("st." + status) : status) + "</span>";
  }

  // Categoria/status ficam gravados em pt-BR (valores estáveis); só o rótulo é traduzido.
  function catLabel(c) {
    return UI["cat." + c] ? T("cat." + c) : c;
  }

  function tablePageHTML() {
    return (
      '<div class="page-head">' +
      '<span class="kicker">' + esc(T("tbl.kicker")) + "</span>" +
      "<h1>" + esc(T("tbl.h1")) + "</h1>" +
      '<p class="lede">' + T("tbl.lede") + "</p>" +
      "</div>" +
      '<div class="toolbar">' +
      '<span class="count" id="tableCount"></span>' +
      '<fieldset class="state-switch" id="tableStates"><legend class="sr-only">' + esc(T("tbl.state")) + "</legend>" +
      [["data", "tbl.stData"], ["loading", "tbl.stLoading"], ["empty", "tbl.stEmpty"], ["error", "tbl.stError"]].map(function (st) {
        return '<label class="state-opt"><input type="radio" name="tableState" value="' + st[0] + '"' + (st[0] === tableState ? " checked" : "") + "><span>" + esc(T(st[1])) + "</span></label>";
      }).join("") +
      "</fieldset>" +
      '<button type="button" class="btn btn-primary" id="addRecord">' + esc(T("tbl.add")) + "</button>" +
      "</div>" +
      '<div class="table-scroll">' +
      '<table id="recordsTable">' +
      "<thead><tr>" +
      "<th>" + esc(T("tbl.colName")) + "</th><th>" + esc(T("tbl.colCat")) + "</th><th>" + esc(T("tbl.colStatus")) + '</th><th class="num">' + esc(T("tbl.colCx")) + "</th><th>" + esc(T("tbl.colUpd")) + '</th><th style="text-align:right">' + esc(T("tbl.colAct")) + "</th>" +
      "</tr></thead>" +
      '<tbody id="tableBody"></tbody>' +
      "</table>" +
      "</div>"
    );
  }

  // Estado da tabela de exemplo: dados, carregando, vazio ou erro (para ver cada estado no tema).
  var tableState = "data";
  var loadTimer = null;

  function rowHTML(r) {
    var deprecated = r.status === "depreciado";
    return (
      '<tr data-id="' + r.id + '">' +
      "<td><strong>" + esc(r.name) + "</strong></td>" +
      "<td>" + esc(catLabel(r.category)) + "</td>" +
      "<td>" + statusPill(r.status) + "</td>" +
      '<td class="num">' + esc(r.complexity) + "/5</td>" +
      '<td class="num">' + formatDate(r.updated) + "</td>" +
      '<td><div class="row-actions">' +
      '<button type="button" class="btn btn-success btn-small" data-action="edit"' + (deprecated ? ' disabled title="' + esc(T("tbl.depTip")) + '"' : "") + ">" + esc(T("edit")) + "</button>" +
      '<button type="button" class="btn btn-danger btn-small" data-action="delete">' + esc(T("delete")) + "</button>" +
      "</div></td>" +
      "</tr>"
    );
  }

  function skeletonRows() {
    var row = "<tr>" + [60, 40, 30, 20, 30, 40].map(function (w) {
      return '<td><span class="skeleton" style="width:' + w + '%"></span></td>';
    }).join("") + "</tr>";
    return new Array(6).join(row);
  }

  function paintRows() {
    var body = document.getElementById("tableBody");
    var count = document.getElementById("tableCount");
    var table = document.getElementById("recordsTable");
    var add = document.getElementById("addRecord");
    if (!body) return;
    var shown = tableState === "data" ? records : [];
    if (table) table.setAttribute("aria-busy", String(tableState === "loading"));
    if (add) add.disabled = tableState === "loading";
    if (tableState === "loading") {
      body.innerHTML = skeletonRows();
      if (count) count.textContent = T("tbl.loading");
      return;
    }
    if (tableState === "error") {
      body.innerHTML =
        '<tr><td colspan="6"><div class="empty is-error" role="alert"><strong>' + esc(T("tbl.errTitle")) + "</strong>" +
        "<p>" + esc(T("tbl.errText")) + '</p><p><button type="button" class="btn btn-ghost" data-action="retry">' + esc(T("tbl.retry")) + "</button></p></div></td></tr>";
      if (count) count.textContent = "0 " + T("tbl.many");
      return;
    }
    if (shown.length === 0) {
      body.innerHTML =
        '<tr><td colspan="6"><div class="empty"><strong>' + esc(T("tbl.emptyTitle")) + "</strong>" +
        "<p>" + esc(T("tbl.emptyText")) + "</p></div></td></tr>";
    } else {
      body.innerHTML = shown.map(rowHTML).join("");
    }
    if (count) {
      count.textContent = shown.length + " " + (shown.length === 1 ? T("tbl.one") : T("tbl.many"));
    }
  }

  function setTableState(next) {
    tableState = next;
    clearTimeout(loadTimer);
    paintRows();
    if (next === "loading") {
      // "Carregando" termina sozinho e mostra os dados, como numa chamada de verdade.
      loadTimer = setTimeout(function () {
        tableState = "data";
        var radio = document.querySelector('#tableStates input[value="data"]');
        if (radio) radio.checked = true;
        paintRows();
      }, 2200);
    }
  }

  function tableMount() {
    var addBtn = document.getElementById("addRecord");
    if (addBtn) {
      addBtn.addEventListener("click", function () { openRecord(null); });
    }
    var body = document.getElementById("tableBody");
    if (body) {
      body.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-action]");
        if (!btn || btn.disabled) return;
        if (btn.dataset.action === "retry") {
          var radio = document.querySelector('#tableStates input[value="loading"]');
          if (radio) radio.checked = true;
          setTableState("loading");
          return;
        }
        var tr = e.target.closest("tr");
        var id = Number(tr.dataset.id);
        var rec = records.filter(function (r) { return r.id === id; })[0];
        if (!rec) return;
        if (btn.dataset.action === "edit") openRecord(rec);
        if (btn.dataset.action === "delete") openConfirm(rec);
      });
    }
    var states = document.getElementById("tableStates");
    if (states) {
      states.addEventListener("change", function (e) {
        if (e.target.name === "tableState") setTableState(e.target.value);
      });
    }
    paintRows();
  }

  var recordDialog = document.getElementById("recordDialog");
  var recordForm = document.getElementById("recordForm");
  var recordTitle = document.getElementById("recordDialogTitle");

  function openRecord(rec) {
    recordForm.reset();
    var range = recordForm.querySelector('input[name="complexity"]');
    var out = recordForm.querySelector(".range-row output");
    if (rec) {
      recordTitle.textContent = T("rec.edit");
      recordForm.elements.id.value = rec.id;
      recordForm.elements.name.value = rec.name;
      recordForm.elements.category.value = rec.category;
      recordForm.elements.status.value = rec.status;
      range.value = rec.complexity;
      recordForm.elements.updated.value = rec.updated;
    } else {
      recordTitle.textContent = T("rec.add");
      recordForm.elements.id.value = "";
      recordForm.elements.updated.value = new Date().toISOString().slice(0, 10);
      range.value = 3;
    }
    if (out) out.textContent = range.value;
    clearFieldError(recordForm.elements.name);
    recordDialog.showModal();
    recordForm.elements.name.focus();
  }

  function clearFieldError(input) {
    input.removeAttribute("aria-invalid");
    var err = input.parentElement.querySelector(".error");
    if (err) err.remove();
  }

  function setFieldError(input, message) {
    input.setAttribute("aria-invalid", "true");
    var err = input.parentElement.querySelector(".error");
    if (!err) {
      err = document.createElement("span");
      err.className = "error";
      input.parentElement.appendChild(err);
    }
    err.textContent = message;
  }

  function nextId() {
    return records.reduce(function (max, r) { return Math.max(max, r.id); }, 0) + 1;
  }

  recordForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var nameInput = recordForm.elements.name;
    if (!nameInput.value.trim()) {
      setFieldError(nameInput, T("rec.nameErr"));
      nameInput.focus();
      return;
    }
    clearFieldError(nameInput);
    var data = {
      name: nameInput.value.trim(),
      category: recordForm.elements.category.value,
      status: recordForm.elements.status.value,
      complexity: Number(recordForm.elements.complexity.value),
      updated: recordForm.elements.updated.value || new Date().toISOString().slice(0, 10)
    };
    var id = recordForm.elements.id.value;
    if (id) {
      records = records.map(function (r) {
        return r.id === Number(id) ? Object.assign({}, r, data) : r;
      });
    } else {
      data.id = nextId();
      records = records.concat([data]);
    }
    saveRecords();
    paintRows();
    recordDialog.close();
  });

  recordForm.querySelectorAll("[data-close]").forEach(function (btn) {
    btn.addEventListener("click", function () { recordDialog.close(); });
  });

  var dirtyComplexity = recordForm.querySelector('input[name="complexity"]');
  if (dirtyComplexity) {
    dirtyComplexity.addEventListener("input", function () {
      var out = recordForm.querySelector(".range-row output");
      if (out) out.textContent = dirtyComplexity.value;
    });
  }

  var confirmDialog = document.getElementById("confirmDialog");
  var confirmText = document.getElementById("confirmText");
  var confirmDelete = document.getElementById("confirmDelete");
  var pendingDelete = null;

  function openConfirm(rec) {
    pendingDelete = rec;
    confirmText.innerHTML = T("del.text").replace("{name}", esc(rec.name));
    confirmDialog.showModal();
    confirmDelete.focus();
  }

  confirmDelete.addEventListener("click", function () {
    if (!pendingDelete) return;
    records = records.filter(function (r) { return r.id !== pendingDelete.id; });
    pendingDelete = null;
    saveRecords();
    paintRows();
    confirmDialog.close();
  });

  confirmDialog.querySelectorAll("[data-close]").forEach(function (btn) {
    btn.addEventListener("click", function () { confirmDialog.close(); });
  });

  [recordDialog, confirmDialog].forEach(function (dlg) {
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close();
    });
  });

  function formPageHTML() {
    function field(key, input, cls) {
      return '<label class="field' + (cls ? " " + cls : "") + '"><span>' + esc(T(key)) + "</span>" + input + "</label>";
    }
    function ph(key) {
      return ' placeholder="' + esc(T(key)) + '"';
    }
    function choice(type, name, value, key, checked) {
      return '<label class="choice-item"><input type="' + type + '" name="' + name + '" value="' + value + '"' + (checked ? " checked" : "") + "> " + esc(T(key)) + "</label>";
    }
    return (
      '<div class="page-head">' +
      '<span class="kicker">' + esc(T("frm.kicker")) + "</span>" +
      "<h1>" + esc(T("frm.h1")) + "</h1>" +
      '<p class="lede">' + esc(T("frm.lede")) + "</p>" +
      "</div>" +
      '<form class="form-card" id="demoForm" novalidate>' +
      '<div class="form-alert" id="demoAlert" role="status"></div>' +
      "<fieldset><legend>" + esc(T("frm.ident")) + "</legend>" +
      '<div class="form-grid">' +
      field("frm.text", '<input type="text" name="texto"' + ph("frm.textPh") + " required>") +
      field("frm.email", '<input type="email" name="email"' + ph("frm.emailPh") + " required>") +
      field("frm.phone", '<input type="tel" name="telefone"' + ph("frm.phonePh") + ">") +
      '<label class="field"><span>URL</span><input type="url" name="url"' + ph("frm.urlPh") + "></label>" +
      field("frm.password", '<input type="password" name="senha" placeholder="••••••••" minlength="8">') +
      field("frm.search", '<input type="search" name="busca"' + ph("frm.searchPh") + ">") +
      "</div></fieldset>" +
      "<fieldset><legend>" + esc(T("frm.numbers")) + "</legend>" +
      '<div class="form-grid">' +
      field("frm.number", '<input type="number" name="quantidade" min="0" max="100" value="12">') +
      field("frm.date", '<input type="date" name="data" value="2026-05-20">') +
      field("frm.time", '<input type="time" name="hora" value="14:30">') +
      field("frm.datetime", '<input type="datetime-local" name="datahora" value="2026-05-20T14:30">') +
      "</div></fieldset>" +
      "<fieldset><legend>" + esc(T("frm.rangeColor")) + "</legend>" +
      '<div class="form-grid">' +
      field("frm.intensity", '<div class="range-row"><input type="range" name="intensidade" min="0" max="100" value="60"><output>60</output></div>', "span-2") +
      field("frm.color", '<input type="color" name="cor" value="#2f6bff">') +
      field("frm.file", '<input type="file" name="arquivo">') +
      "</div></fieldset>" +
      "<fieldset><legend>" + esc(T("frm.choices")) + "</legend>" +
      field("frm.mainCat", '<select name="categoria">' + CATEGORIES.map(function (c) {
        return '<option value="' + esc(c) + '"' + (c === "Formulário" ? " selected" : "") + ">" + esc(catLabel(c)) + "</option>";
      }).join("") + "</select>") +
      '<div class="choice"><span class="field-label">' + esc(T("frm.priority")) + "</span>" +
      choice("radio", "prioridade", "baixa", "frm.low") +
      choice("radio", "prioridade", "media", "frm.medium", true) +
      choice("radio", "prioridade", "alta", "frm.high") +
      "</div>" +
      '<div class="choice"><span class="field-label">' + esc(T("frm.features")) + "</span>" +
      choice("checkbox", "recursos", "tema-claro", "frm.light", true) +
      choice("checkbox", "recursos", "tema-escuro", "frm.dark") +
      choice("checkbox", "recursos", "alto-contraste", "frm.contrast") +
      "</div>" +
      '<label class="switch"><input type="checkbox" name="notificacoes" role="switch" checked><span class="switch-track" aria-hidden="true"></span><span>' + esc(T("frm.news")) + "</span></label>" +
      "</fieldset>" +
      "<fieldset><legend>" + esc(T("frm.message")) + "</legend>" +
      '<label class="field"><span>' + esc(T("frm.comment")) + '</span><textarea name="mensagem"' + ph("frm.commentPh") + '></textarea><span class="hint">' + esc(T("frm.commentHint")) + "</span></label>" +
      "</fieldset>" +
      '<div style="display:flex;gap:12px;flex-wrap:wrap">' +
      '<button type="submit" class="btn btn-primary" id="demoSubmit">' + esc(T("frm.submit")) + "</button>" +
      '<button type="reset" class="btn btn-ghost">' + esc(T("frm.reset")) + "</button>" +
      "</div>" +
      "</form>" +
      formStatesHTML()
    );
  }

  // Estados que o formulário principal não mostra: erro, ajuda, desabilitado, somente leitura,
  // botões em todas as variações, alertas e carregamento. Fica fora do <form> para o "Limpar" não afetá-los.
  function formStatesHTML() {
    function sw(label, checked) {
      return '<label class="switch"><input type="checkbox" role="switch" disabled' + (checked ? " checked" : "") + '><span class="switch-track" aria-hidden="true"></span><span>' + esc(T(label)) + "</span></label>";
    }
    function alertBox(kind, key) {
      return '<div class="form-alert show ' + kind + '" role="' + (kind === "error" ? "alert" : "status") + '">' + esc(T(key)) + "</div>";
    }
    return (
      '<div class="form-card form-states">' +
      "<fieldset><legend>" + esc(T("frm.states")) + "</legend>" +
      '<div class="form-grid">' +
      '<label class="field"><span>' + esc(T("frm.stError")) + '</span><input type="email" value="voce@" aria-invalid="true" aria-describedby="stErr"><span class="error" id="stErr">' + esc(T("frm.emailErr")) + "</span></label>" +
      '<label class="field"><span>' + esc(T("frm.stHelp")) + '</span><input type="email" placeholder="' + esc(T("frm.emailPh")) + '"><span class="hint">' + esc(T("frm.stHelpHint")) + "</span></label>" +
      '<label class="field"><span>' + esc(T("frm.stDisabled")) + '</span><input type="text" value="' + esc(T("frm.stValue")) + '" disabled></label>' +
      '<label class="field"><span>' + esc(T("frm.stReadonly")) + '</span><input type="text" value="' + esc(T("frm.stValue")) + '" readonly></label>' +
      '<label class="field"><span>' + esc(T("frm.stSelect")) + '</span><select disabled><option>' + esc(catLabel("Formulário")) + "</option></select></label>" +
      "</div>" +
      '<div class="choice"><span class="field-label">' + esc(T("frm.stOn")) + '</span><label class="choice-item"><input type="checkbox" checked disabled> ' + esc(T("frm.light")) + '</label><label class="choice-item"><input type="radio" name="stRadio" checked disabled> ' + esc(T("frm.medium")) + "</label></div>" +
      '<div class="choice"><span class="field-label">' + esc(T("frm.stOff")) + '</span><label class="choice-item"><input type="checkbox" disabled> ' + esc(T("frm.dark")) + '</label><label class="choice-item"><input type="radio" name="stRadio2" disabled> ' + esc(T("frm.high")) + "</label></div>" +
      sw("frm.stOn", true) + sw("frm.stOff", false) +
      "</fieldset>" +
      "<fieldset><legend>" + esc(T("frm.buttons")) + "</legend>" +
      '<div class="btn-row">' +
      '<button type="button" class="btn btn-primary">' + esc(T("frm.btnPrimary")) + "</button>" +
      '<button type="button" class="btn btn-ghost">' + esc(T("frm.btnGhost")) + "</button>" +
      '<button type="button" class="btn btn-danger">' + esc(T("frm.btnDanger")) + "</button>" +
      '<button type="button" class="btn btn-success">' + esc(T("frm.btnSuccess")) + "</button>" +
      "</div>" +
      '<div class="btn-row">' +
      '<button type="button" class="btn btn-primary" disabled>' + esc(T("frm.btnDisabled")) + "</button>" +
      '<button type="button" class="btn btn-ghost" disabled>' + esc(T("frm.btnDisabled")) + "</button>" +
      '<button type="button" class="btn btn-danger" disabled>' + esc(T("frm.btnDisabled")) + "</button>" +
      '<button type="button" class="btn btn-primary" aria-busy="true" disabled><span class="spinner"></span> ' + esc(T("frm.btnLoading")) + "</button>" +
      "</div>" +
      "</fieldset>" +
      "<fieldset><legend>" + esc(T("frm.alerts")) + "</legend>" +
      alertBox("info", "frm.alInfo") + alertBox("success", "frm.alOk") + alertBox("warning", "frm.alWarn") + alertBox("error", "frm.alErr") +
      "</fieldset>" +
      "<fieldset><legend>" + esc(T("frm.loadingSec")) + "</legend>" +
      '<label class="field"><span>' + esc(T("frm.progress")) + '</span><progress value="60" max="100">60%</progress></label>' +
      '<label class="field"><span>' + esc(T("frm.indeterminate")) + "</span><progress></progress></label>" +
      '<div class="field"><span>' + esc(T("frm.skeleton")) + '</span><div class="skeleton-card" aria-hidden="true"><span class="skeleton" style="width:40%"></span><span class="skeleton" style="width:90%"></span><span class="skeleton" style="width:75%"></span></div></div>' +
      "</fieldset>" +
      "</div>"
    );
  }

  function initDemoForm() {
    var form = document.getElementById("demoForm");
    if (!form) return;
    var alertBox = document.getElementById("demoAlert");
    var submit = document.getElementById("demoSubmit");
    var range = form.elements.intensidade;
    var out = form.querySelector(".range-row output");
    if (range && out) {
      range.addEventListener("input", function () { out.textContent = range.value; });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      [form.elements.texto, form.elements.email].forEach(function (input) {
        if (!input.value.trim()) { setFieldError(input, T("frm.required")); ok = false; }
        else clearFieldError(input);
      });
      var email = form.elements.email;
      if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        setFieldError(email, T("frm.emailErr"));
        ok = false;
      }
      if (!ok) {
        alertBox.className = "form-alert error show";
        alertBox.textContent = T("frm.review");
        return;
      }
      alertBox.className = "form-alert";
      var original = submit.innerHTML;
      submit.disabled = true;
      submit.innerHTML = '<span class="spinner"></span> ' + esc(T("frm.sending"));
      setTimeout(function () {
        submit.disabled = false;
        submit.innerHTML = original;
        alertBox.className = "form-alert success show";
        alertBox.textContent = T("frm.success");
      }, 900);
    });
    form.addEventListener("reset", function () {
      alertBox.className = "form-alert";
      if (range && out) setTimeout(function () { out.textContent = range.value; }, 0);
      form.querySelectorAll(".error").forEach(function (el) { el.remove(); });
      form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
    });
  }

  function dsIndex(id) {
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === id) return i;
    }
    return -1;
  }

  // compact: sem kicker e título próprios (a home já tem o h1 do hero).
  function renderDSList(compact) {
    // O padrão entra como primeira categoria, igual às do catálogo.
    var def = THEMES.filter(function (t) { return t.id === "padrao"; })[0];
    var entries = CATALOG;
    var cats = CATALOG_CATEGORIES;
    if (def) {
      entries = [{ id: def.id, name: def.label, category: def.category, tagline: def.hint, swatches: def.swatches }].concat(CATALOG);
      if (!cats.some(function (c) { return enKey(c) === enKey(def.category); })) cats = [def.category].concat(cats);
    }

    var chips =
      '<button type="button" class="ds-filter is-active" data-cat="">' + esc(T("list.all")) + "</button>" +
      cats.map(function (c) {
        return '<button type="button" class="ds-filter" data-cat="' + esc(enKey(c)) + '">' + esc(L(c)) + "</button>";
      }).join("");

    function cardHTML(c) {
      var strip = chipsHTML(c.swatches);
      return (
        '<a class="ds-card ds-card-cat' + (c.id === currentTheme ? " is-current" : "") + '" href="#/design-system/' + c.id + '" data-id="' + c.id + '" data-cat="' + esc(enKey(c.category)) + '" data-search="' + esc((L(c.name) + " " + L(c.tagline) + " " + L(c.category)).toLowerCase()) + '">' +
        '<div class="ds-card-head">' +
        '<span class="ds-index">' + esc(L(c.category)) + "</span>" +
        '<span class="ds-strip" aria-hidden="true">' + strip + "</span>" +
        "</div>" +
        "<h4>" + esc(L(c.name)) + ' <span class="ds-current-badge">' + esc(T("ds.current")) + "</span></h4>" +
        (L(c.tagline) ? "<p>" + esc(L(c.tagline)) + "</p>" : "") +
        '<span class="ds-card-link">' + esc(T("card.details")) + " &rarr;</span>" +
        "</a>"
      );
    }

    var groups = cats.map(function (cat) {
      var items = entries.filter(function (c) { return enKey(c.category) === enKey(cat); });
      if (!items.length) return "";
      return (
        '<section class="ds-group" data-cat="' + esc(enKey(cat)) + '">' +
        '<h3 class="ds-group-title">' + esc(L(cat)) + ' <span class="ds-group-count muted"></span></h3>' +
        '<div class="ds-grid">' + items.map(cardHTML).join("") + "</div>" +
        "</section>"
      );
    }).join("");

    return (
      '<div class="ds-page">' +
      (compact ? "" : '<span class="kicker">' + esc(T("list.kicker")) + "</span>" + "<h1>" + esc(T("list.h1")) + "</h1>") +
      '<p class="lede">' + esc(T("list.lede")) + ' <a href="https://open-design.ai/plugins/systems/" target="_blank" rel="noopener">open-design.ai</a>.</p>' +
      '<section class="ds-section">' +
      '<div class="ds-catalog-head">' +
      "<h2>" + esc(T("list.catalog")) + "</h2>" +
      '<label class="ds-search"><span class="sr-only">' + esc(T("list.searchLabel")) + '</span><input type="search" id="dsSearch" placeholder="' + esc(T("list.searchPh")) + '"></label>' +
      "</div>" +
      '<div class="ds-filters" id="dsFilters">' + chips + "</div>" +
      '<p class="muted" id="dsCount"></p>' +
      '<div id="dsCatalogGrid">' + groups + "</div>" +
      "</section>" +
      "</div>"
    );
  }

  function initDSList() {
    var search = document.getElementById("dsSearch");
    var filters = document.getElementById("dsFilters");
    var grid = document.getElementById("dsCatalogGrid");
    var count = document.getElementById("dsCount");
    if (!grid) return;
    var activeCat = "";

    function apply() {
      var q = (search && search.value || "").trim().toLowerCase();
      var n = 0;
      grid.querySelectorAll(".ds-group").forEach(function (group) {
        var shown = 0;
        group.querySelectorAll(".ds-card-cat").forEach(function (card) {
          var ok = (!activeCat || card.dataset.cat === activeCat) &&
                   (!q || card.dataset.search.indexOf(q) !== -1);
          card.hidden = !ok;
          if (ok) shown++;
        });
        group.hidden = shown === 0;
        group.querySelector(".ds-group-count").textContent = "(" + shown + ")";
        n += shown;
      });
      if (count) count.textContent = n + " " + (n === 1 ? T("list.one") : T("list.many"));
    }

    if (search) search.addEventListener("input", apply);
    if (filters) {
      filters.addEventListener("click", function (e) {
        var btn = e.target.closest(".ds-filter");
        if (!btn) return;
        activeCat = btn.dataset.cat;
        filters.querySelectorAll(".ds-filter").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        apply();
      });
    }
    apply();
  }

  // Sequência única (a mesma do combobox): padrão primeiro e depois as categorias do catálogo.
  function dsSequence() {
    return THEMES.map(function (t) { return t.id; });
  }

  function dsPager(id) {
    var seq = dsSequence();
    var i = seq.indexOf(id);
    var prev = i > 0 ? seq[i - 1] : null;
    var next = i !== -1 && i < seq.length - 1 ? seq[i + 1] : null;
    return (
      '<nav class="ds-pager" aria-label="' + esc(T("pager.label")) + '">' +
      (prev
        ? '<a class="btn btn-ghost" rel="prev" href="#/design-system/' + prev + '"><span aria-hidden="true">&larr;</span> ' + esc(dsName(prev)) + "</a>"
        : "<span></span>") +
      (next
        ? '<a class="btn btn-ghost" rel="next" href="#/design-system/' + next + '">' + esc(dsName(next)) + ' <span aria-hidden="true">&rarr;</span></a>'
        : "<span></span>") +
      "</nav>"
    );
  }

  // Tinta (#111 ou branco) com maior contraste WCAG sobre `hex` (mesma regra do ink_for do build).
  function inkFor(hex) {
    function lum(x) {
      var h = x.replace("#", "");
      if (h.length === 3) h = h.replace(/(.)/g, "$1$1");
      var c = [0, 2, 4].map(function (k) {
        var v = parseInt(h.substr(k, 2), 16) / 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    }
    var bg = lum(hex);
    return (bg + 0.05) / (lum("#111111") + 0.05) >= 1.05 / (bg + 0.05) ? "#111111" : "#ffffff";
  }

  function isColorValue(v) {
    return /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\(|oklch\()/i.test(v);
  }

  function dsPaletteHTML(d) {
    var roleOf = {};
    roleOf[d.roles.primary] = T("pal.primary");
    roleOf[d.roles.secondary] = T("pal.secondary");
    roleOf[d.roles.neutral] = T("pal.neutral");
    var byName = {};
    d.palettes.forEach(function (p) { byName[p.name] = p; });
    var roleCards = ["primary", "secondary", "neutral"].map(function (r) {
      var p = byName[d.roles[r]];
      if (!p) return "";
      return (
        '<div class="role-card">' +
        '<span class="role-chip" style="background:' + esc(p.base) + ";color:" + inkFor(p.base) + '">' + esc(p.base) + "</span>" +
        '<span class="role-label">' + roleOf[p.name] + "</span>" +
        "<strong>" + esc(p.name) + "</strong>" +
        "</div>"
      );
    }).join("");

    var scales = d.palettes.map(function (p) {
      return (
        '<div class="palette">' +
        '<div class="palette-head"><h3>' + esc(p.name) + "</h3>" +
        (roleOf[p.name] ? '<span class="palette-role">' + roleOf[p.name] + "</span>" : "") +
        "</div>" +
        '<div class="palette-scale">' +
        p.scale.map(function (c) {
          return (
            '<div class="palette-step' + (c.exact ? " is-exact" : "") + '" style="background:' + esc(c.hex) + ";color:" + inkFor(c.hex) + '">' +
            '<span class="palette-num">' + c.step + "</span>" +
            '<code class="palette-hex">' + esc(c.hex) + "</code>" +
            "</div>"
          );
        }).join("") +
        "</div>" +
        "</div>"
      );
    }).join("");

    return (
      '<section class="ds-section" id="palette">' +
      "<h2>" + esc(T("pal.title")) + "</h2>" +
      '<p class="muted">' + T("pal.intro") + "</p>" +
      '<div class="role-cards">' + roleCards + "</div>" +
      scales +
      "</section>"
    );
  }

  function dsFontsHTML(d) {
    var fonts = d.fonts.map(function (f) {
      var fallbackStack = f.fallbacks.length
        ? f.fallbacks.map(function (x) { return /\s/.test(x) ? '"' + x + '"' : x; }).join(", ")
        : "";
      var generic = f.kind === "mono" ? "monospace" : "sans-serif";
      var sample = function (family, label) {
        var txt = "Quick brown fox jumps over the lazy dog 0123456789";
        return (
          '<div class="font-sample">' +
          '<span class="font-sample-label">' + label + "</span>" +
          '<p style="font-family:' + esc(family) + ';font-weight:400">' + esc(T("font.regular")) + " — " + txt + "</p>" +
          '<p style="font-family:' + esc(family) + ';font-style:italic;font-weight:400">' + esc(T("font.italic")) + " — " + txt + "</p>" +
          '<p style="font-family:' + esc(family) + ';font-weight:700">' + esc(T("font.bold")) + " — " + txt + "</p>" +
          "</div>"
        );
      };
      var how = f.source
        ? "<h4>" + esc(T("font.how")) + "</h4>" +
          '<p class="muted">' + T("font.head") + "</p><pre><code>" + esc(f.source.link) + "</code></pre>" +
          '<p class="muted">' + esc(T("font.css")) + "</p><pre><code>" + esc(f.source.import) + "</code></pre>" +
          '<p class="muted">' + esc(T("font.npm")) + "</p><pre><code>" + esc(f.source.npm) + "</code></pre>" +
          '<p class="muted">' + esc(T("font.then")) + " <code>font-family: " + esc(f.stack) + ";</code>. " + esc(T("font.ref")) + " " +
          '<a href="' + esc(f.source.page) + '" target="_blank" rel="noopener">' + esc(f.source.page) + "</a></p>"
        : '<p class="muted">' + esc(T("font.none")) + "</p>";
      return (
        '<div class="font-card">' +
        '<div class="font-card-head"><h3>' + esc(f.family) + '</h3><span class="palette-role">' + esc(L(f.role)) + "</span></div>" +
        '<p class="muted">' + esc(T("font.stack")) + " <code>" + esc(f.stack) + "</code></p>" +
        (f.italic ? "" : '<p class="muted">' + esc(T("font.noItalic")) + "</p>") +
        '<div class="font-samples">' +
        sample(f.stack, esc(f.family)) +
        (fallbackStack ? sample(fallbackStack + ", " + generic, esc(T("font.fallback")) + " · " + esc(f.fallbacks.slice(0, 2).join(", "))) : "") +
        "</div>" +
        how +
        "</div>"
      );
    }).join("");
    return '<section class="ds-section" id="fonts"><h2>' + esc(T("font.title")) + '</h2>' + fonts + "</section>";
  }

  function dsTokensHTML(d) {
    var groups = d.tokens.map(function (g) {
      if (!g.items.length) return "";
      return (
        '<div class="token-group"><h3>' + esc(L(g.group)) + "</h3>" +
        '<table class="token-table"><tbody>' +
        g.items.map(function (t) {
          return (
            "<tr>" +
            "<td>" + (isColorValue(t.value) ? '<span class="token-chip" style="background:' + esc(t.value) + '"></span>' : "") + "</td>" +
            "<td><code>" + esc(t.name) + "</code></td>" +
            "<td><code>" + esc(t.value) + "</code></td>" +
            "</tr>"
          );
        }).join("") +
        "</tbody></table></div>"
      );
    }).join("");
    return '<section class="ds-section" id="tokens"><h2>' + esc(T("tok.title")) + '</h2><div class="token-groups">' + groups + "</div></section>";
  }

  function renderDsFull(id) {
    var d = DS_DATA[id + "|" + lang];
    var atmos = d.sections[0];
    var rest = d.sections.slice(1);
    return (
      '<div class="ds-page ds-full">' +
      '<span class="kicker">' + esc(T("ds.kicker")) + " &middot; " + esc(L(d.category)) + "</span>" +
      "<h1>" + esc(L(d.name)) + "</h1>" +
      (L(d.intro) ? '<p class="lede">' + esc(L(d.intro)) + "</p>" : "") +
      '<div class="ds-actions">' +
      '<button type="button" class="btn btn-primary" data-apply="' + esc(id) + '">' + esc(T("ds.apply")) + "</button>" +
      '<a class="btn btn-ghost" href="' + esc(d.source.url) + '" target="_blank" rel="noopener">' + esc(T("ds.open")) + ' <svg class="ext-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg><span class="sr-only">' + esc(T("ds.newTab")) + '</span></a>' +
      "</div>" +
      dsPager(id) +
      '<section class="ds-section" id="' + atmos.id + '">' +
      "<h2>" + esc(L(atmos.title)) + "</h2>" +
      '<div class="guide-body">' + L(atmos.html) + "</div>" +
      "</section>" +
      dsPaletteHTML(d) +
      dsFontsHTML(d) +
      dsTokensHTML(d) +
      rest.map(function (sec) {
        return (
          '<section class="ds-section" id="' + sec.id + '">' +
          "<h2>" + esc(L(sec.title)) + "</h2>" +
          '<div class="guide-body">' + L(sec.html) + "</div>" +
          "</section>"
        );
      }).join("") +
      dsPager(id) +
      "</div>"
    );
  }

  function renderDSDetail(id) {
    return DS_DATA[id + "|" + lang] ? renderDsFull(id) : notFoundHTML();
  }

  function initDSDetail() {
    app.querySelectorAll("[data-apply]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-apply");
        setTheme(id);
        btn.textContent = T("ds.applied");
      });
    });
  }

  // A busca da barra lateral do blog é só de enfeite.
  app.addEventListener("submit", function (e) {
    if (e.target.closest && e.target.closest(".aside-search")) e.preventDefault();
  });

  function setActiveNav(route) {
    document.querySelectorAll(".main-nav a").forEach(function (link) {
      var href = link.getAttribute("href").replace("#", "");
      var isActive =
        href === route;
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  // Título da aba por rota (o nome do site vem depois) e foco no conteúdo ao navegar,
  // para leitores de tela e teclado perceberem a troca de página.
  function setTitle(part) {
    var site = T("brand");
    document.title = part ? part + " · " + site : site;
  }

  function focusContent() {
    app.focus({ preventScroll: true });
  }

  function router(moveFocus) {
    var hash = location.hash.replace(/^#/, "");
    // Cada página de DS é exibida com o próprio tema (prévia); as demais voltam ao tema escolhido.
    var previewId = hash.indexOf("/design-system/") === 0 ? hash.replace("/design-system/", "") : "";
    var previewable = THEMES.some(function (t) { return t.id === previewId; });
    applyTheme(previewable ? previewId : currentTheme);
    if (!hash || hash === "/") {
      app.innerHTML = homeHTML();
      setTitle("");
      initDSList();
      setActiveNav("/");
    } else if (hash.indexOf("/artigo/") === 0) {
      app.innerHTML = page(articleHTML(hash.replace("/artigo/", "")), [[T("nav.blog"), "#/blog"], [articleTitle(hash.replace("/artigo/", ""))]]);
      setTitle(articleTitle(hash.replace("/artigo/", "")));
      setActiveNav("/blog");
    } else if (hash === "/blog") {
      app.innerHTML = page(blogHTML(), [[T("nav.blog")]]);
      setTitle(T("nav.blog"));
      setActiveNav("/blog");
    } else if (hash === "/design-system" || hash === "/design-systems") {
      // O catálogo agora fica na própria home.
      location.replace("#/");
      return;
    } else if (hash.indexOf("/design-system/") === 0) {
      var dsId = hash.replace("/design-system/", "");
      var crumbs = [[dsName(dsId)]];
      app.innerHTML = page('<div class="empty"><strong>' + esc(T("ds.loading")) + "</strong></div>", crumbs);
      setTitle(dsName(dsId));
      loadDsDetail(dsId)
        .then(function (d) {
          if (location.hash.replace(/^#/, "") !== hash) return;
          app.innerHTML = page(renderDSDetail(d.id), crumbs);
          initDSDetail();
          window.scrollTo({ top: 0, behavior: "auto" });
          if (moveFocus) focusContent();
        })
        .catch(function () {
          if (location.hash.replace(/^#/, "") !== hash) return;
          app.innerHTML = page(notFoundHTML(), [[T("nf.title")]]);
        });
      setActiveNav("/");
    } else if (hash === "/tabela") {
      clearTimeout(loadTimer);
      tableState = "data";
      app.innerHTML = page(tablePageHTML(), [[T("nav.table")]]);
      setTitle(T("nav.table"));
      tableMount();
      setActiveNav("/tabela");
    } else if (hash === "/formulario") {
      app.innerHTML = page(formPageHTML(), [[T("nav.form")]]);
      setTitle(T("nav.form"));
      initDemoForm();
      setActiveNav("/formulario");
    } else {
      app.innerHTML = page(notFoundHTML(), [[T("nf.title")]]);
      setTitle(T("nf.title"));
      setActiveNav("");
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    if (moveFocus && hash.indexOf("/design-system/") !== 0) focusContent();
  }

  // ---- idioma: botão no cabeçalho (alterna pt-BR <-> en-US) ----
  var langBtn = document.getElementById("langBtn");

  function applyStaticI18n() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = T(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", T(el.getAttribute("data-i18n-aria")));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", T(el.getAttribute("data-i18n-ph")));
    });
    if (langBtn) {
      langBtn.setAttribute("aria-label", T("lang.label"));
      langBtn.setAttribute("title", T("lang.label"));
      document.getElementById("langCode").textContent = T("lang.code");
    }
    if (comboBtn) comboBtn.setAttribute("aria-label", T("combo.label"));
  }

  function setLanguage(next) {
    lang = next;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
    applyStaticI18n();
    if (comboList) fillComboList();
    setTheme(currentTheme);
    router();
  }

  if (langBtn) {
    langBtn.addEventListener("click", function () {
      setLanguage(lang === "pt-BR" ? "en-US" : "pt-BR");
    });
  }

  // ---- botão "voltar ao topo": aparece depois de rolar a página ----
  var toTop = document.getElementById("toTop");
  if (toTop) {
    var topTicking = false;
    function updateToTop() {
      topTicking = false;
      toTop.hidden = window.scrollY < 400;
    }
    window.addEventListener("scroll", function () {
      if (!topTicking) { topTicking = true; window.requestAnimationFrame(updateToTop); }
    }, { passive: true });
    toTop.addEventListener("click", function () {
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      var brand = document.querySelector(".brand");
      if (brand) brand.focus({ preventScroll: true });
    });
    updateToTop();
  }

  loadData().then(function () {
    buildCombobox();
    applyStaticI18n();
    setTheme(getStoredTheme());
    window.addEventListener("hashchange", function () { router(true); });
    router();
  });
})();
