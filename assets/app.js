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
    "nav.theme": { "en-US": "Theme info", "pt-BR": "Informações do tema" },
    "nav.examples": { "en-US": "Examples", "pt-BR": "Exemplos" },
    "nav.institutional": { "en-US": "Corporate", "pt-BR": "Institucional" },
    "nav.signin": { "en-US": "Login", "pt-BR": "Login" },
    "nav.dashboard": { "en-US": "Dashboard", "pt-BR": "Dashboard" },
    "nav.shop": { "en-US": "Store", "pt-BR": "Loja" },
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
    "aside.topics": { "en-US": "Topics", "pt-BR": "Tópicos" },
    "aside.latest": { "en-US": "Latest articles", "pt-BR": "Últimos artigos" },
    "aside.follow": { "en-US": "Follow and subscribe", "pt-BR": "Siga e assine" },
    "aside.newsletter": { "en-US": "Newsletter", "pt-BR": "Newsletter" },
    "aside.nlText": { "en-US": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod.", "pt-BR": "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod." },
    "aside.nlPh": { "en-US": "Your email", "pt-BR": "Seu e-mail" },
    "aside.nlBtn": { "en-US": "Subscribe", "pt-BR": "Assinar" },
    "aside.tags": { "en-US": "Tag cloud", "pt-BR": "Nuvem de tags" },
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
    "inst.kicker": { "en-US": "Example · Corporate", "pt-BR": "Exemplo · Institucional" },
    "inst.h1": { "en-US": "Lorem ipsum dolor sit amet consectetur", "pt-BR": "Lorem ipsum dolor sit amet consectetur" },
    "inst.lorem": { "en-US": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "pt-BR": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    "inst.imageAlt": { "en-US": "Sample image", "pt-BR": "Imagem de exemplo" },
    "inst.cta1": { "en-US": "Get in touch", "pt-BR": "Fale conosco" },
    "inst.cta2": { "en-US": "Our services", "pt-BR": "Nossos serviços" },
    "inst.about": { "en-US": "About", "pt-BR": "Sobre" },
    "inst.aboutTitle": { "en-US": "Lorem ipsum dolor sit amet", "pt-BR": "Lorem ipsum dolor sit amet" },
    "inst.c1": { "en-US": "Ut enim ad minim veniam quis nostrud", "pt-BR": "Ut enim ad minim veniam quis nostrud" },
    "inst.c2": { "en-US": "Duis aute irure dolor in reprehenderit", "pt-BR": "Duis aute irure dolor in reprehenderit" },
    "inst.c3": { "en-US": "Excepteur sint occaecat cupidatat", "pt-BR": "Excepteur sint occaecat cupidatat" },
    "inst.st1": { "en-US": "years of experience", "pt-BR": "anos de experiência" },
    "inst.st2": { "en-US": "projects delivered", "pt-BR": "projetos entregues" },
    "inst.st3": { "en-US": "satisfied clients", "pt-BR": "clientes satisfeitos" },
    "inst.valuesKicker": { "en-US": "Values", "pt-BR": "Valores" },
    "inst.valuesTitle": { "en-US": "What guides our work", "pt-BR": "O que guia o nosso trabalho" },
    "inst.v1": { "en-US": "Care", "pt-BR": "Cuidado" },
    "inst.v2": { "en-US": "Integrity", "pt-BR": "Integridade" },
    "inst.v3": { "en-US": "Innovation", "pt-BR": "Inovação" },
    "inst.v4": { "en-US": "Collaboration", "pt-BR": "Colaboração" },
    "inst.servicesKicker": { "en-US": "Services", "pt-BR": "Serviços" },
    "inst.servicesTitle": { "en-US": "How we can help", "pt-BR": "Como podemos ajudar" },
    "inst.s1": { "en-US": "Consulting", "pt-BR": "Consultoria" },
    "inst.s2": { "en-US": "Development", "pt-BR": "Desenvolvimento" },
    "inst.s3": { "en-US": "Design", "pt-BR": "Design" },
    "inst.s4": { "en-US": "Training", "pt-BR": "Treinamento" },
    "inst.s5": { "en-US": "Support", "pt-BR": "Suporte" },
    "inst.s6": { "en-US": "Strategy", "pt-BR": "Estratégia" },
    "inst.more": { "en-US": "Learn more", "pt-BR": "Saiba mais" },
    "inst.testimonialsKicker": { "en-US": "Testimonials", "pt-BR": "Opiniões" },
    "inst.testimonialsTitle": { "en-US": "What our clients say", "pt-BR": "O que dizem nossos clientes" },
    "inst.ctaTitle": { "en-US": "Ready to start?", "pt-BR": "Pronto para começar?" },
    "inst.contactKicker": { "en-US": "Contact", "pt-BR": "Contato" },
    "inst.contactTitle": { "en-US": "Let's talk", "pt-BR": "Vamos conversar" },
    "inst.address": { "en-US": "Lorem Ipsum Street, 123 · Example City", "pt-BR": "Rua Lorem Ipsum, 123 · Cidade Exemplo" },
    "inst.hours": { "en-US": "Mon to Fri, 9am to 6pm", "pt-BR": "Seg a sex, 9h às 18h" },
    "inst.fName": { "en-US": "Name", "pt-BR": "Nome" },
    "inst.fEmail": { "en-US": "Email", "pt-BR": "E-mail" },
    "inst.fSubject": { "en-US": "Subject", "pt-BR": "Assunto" },
    "inst.fMessage": { "en-US": "Message", "pt-BR": "Mensagem" },
    "inst.o1": { "en-US": "Quote request", "pt-BR": "Pedido de orçamento" },
    "inst.o2": { "en-US": "Partnership", "pt-BR": "Parceria" },
    "inst.o3": { "en-US": "Other", "pt-BR": "Outro" },
    "inst.send": { "en-US": "Send message", "pt-BR": "Enviar mensagem" },
    "inst.sent": { "en-US": "Message sent! This form is only a demonstration.", "pt-BR": "Mensagem enviada! Este formulário é só uma demonstração." },
    "auth.state": { "en-US": "Screen", "pt-BR": "Tela" },
    "auth.sLogin": { "en-US": "Login", "pt-BR": "Login" },
    "auth.demoNote": { "en-US": "This page is only a layout demonstration. No data is sent or checked by any server.", "pt-BR": "Esta é uma página somente de demonstração de layout. Nenhum dado é enviado nem verificado por servidor." },
    "auth.sSignup": { "en-US": "Create account", "pt-BR": "Criar conta" },
    "auth.signupTitle": { "en-US": "Create your account", "pt-BR": "Criar sua conta" },
    "auth.signupText": { "en-US": "Just your name, email and password. We will send an email to confirm your address.", "pt-BR": "Só o seu nome, e-mail e senha. Vamos enviar um e-mail para confirmar o seu endereço." },
    "auth.name": { "en-US": "Name", "pt-BR": "Nome" },
    "auth.pwHint": { "en-US": "At least 8 characters.", "pt-BR": "Pelo menos 8 caracteres." },
    "auth.pwShort": { "en-US": "Use at least 8 characters.", "pt-BR": "Use pelo menos 8 caracteres." },
    "auth.signupBtn": { "en-US": "Create account", "pt-BR": "Criar conta" },
    "auth.signupNote": { "en-US": "You will receive an email with a link to confirm your address. The account is activated only after the confirmation.", "pt-BR": "Você vai receber um e-mail com um link para confirmar o seu endereço. A conta só é ativada depois da confirmação." },
    "auth.signupOk": { "en-US": "Account created! We sent a confirmation email to {email}. Open it and click the link to activate your account.", "pt-BR": "Conta criada! Enviamos um e-mail de confirmação para {email}. Abra-o e clique no link para ativar a sua conta." },
    "auth.haveAccount": { "en-US": "Already have an account?", "pt-BR": "Já tem uma conta?" },
    "auth.goLogin": { "en-US": "Log in", "pt-BR": "Fazer login" },
    "auth.sForgot": { "en-US": "Forgot password", "pt-BR": "Esqueci minha senha" },
    "auth.sReset": { "en-US": "New password", "pt-BR": "Nova senha" },
    "auth.loginTitle": { "en-US": "Sign in to your account", "pt-BR": "Entrar na sua conta" },
    "auth.loginText": { "en-US": "Welcome back! Enter your details to continue.", "pt-BR": "Bem-vindo de volta! Informe seus dados para continuar." },
    "auth.email": { "en-US": "Email", "pt-BR": "E-mail" },
    "auth.password": { "en-US": "Password", "pt-BR": "Senha" },
    "auth.remember": { "en-US": "Remember me", "pt-BR": "Lembrar de mim" },
    "auth.forgotLink": { "en-US": "Forgot password?", "pt-BR": "Esqueci minha senha" },
    "auth.signin": { "en-US": "Sign in", "pt-BR": "Entrar" },
    "auth.or": { "en-US": "or continue with", "pt-BR": "ou continue com" },
    "auth.continueWith": { "en-US": "Continue with", "pt-BR": "Continuar com" },
    "auth.noAccount": { "en-US": "Don't have an account?", "pt-BR": "Não tem uma conta?" },
    "auth.create": { "en-US": "Create account", "pt-BR": "Criar conta" },
    "auth.showPw": { "en-US": "Show password", "pt-BR": "Mostrar senha" },
    "auth.hidePw": { "en-US": "Hide password", "pt-BR": "Ocultar senha" },
    "auth.loginOk": { "en-US": "Demo sign in: no credentials were sent.", "pt-BR": "Login de demonstração: nenhuma credencial foi enviada." },
    "auth.forgotTitle": { "en-US": "Forgot your password?", "pt-BR": "Esqueceu sua senha?" },
    "auth.forgotText": { "en-US": "Enter the email of your account and we will send you a code to reset it.", "pt-BR": "Informe o e-mail da sua conta e enviaremos um código para redefinir." },
    "auth.sendCode": { "en-US": "Send code", "pt-BR": "Enviar código" },
    "auth.codeSent": { "en-US": "If the email exists, we sent a 6-digit code. It may take a minute.", "pt-BR": "Se o e-mail existir, enviamos um código de 6 dígitos. Pode levar um minuto." },
    "auth.haveCode": { "en-US": "I already have the code", "pt-BR": "Já tenho o código" },
    "auth.back": { "en-US": "Back to sign in", "pt-BR": "Voltar para o login" },
    "auth.resetTitle": { "en-US": "Create a new password", "pt-BR": "Criar nova senha" },
    "auth.resetText": { "en-US": "Enter the 6-digit code we sent to your email and choose a new password.", "pt-BR": "Digite o código de 6 dígitos que enviamos para o seu e-mail e escolha uma nova senha." },
    "auth.code": { "en-US": "Verification code", "pt-BR": "Código de verificação" },
    "auth.digit": { "en-US": "Digit", "pt-BR": "Dígito" },
    "auth.newPw": { "en-US": "New password", "pt-BR": "Nova senha" },
    "auth.confirmPw": { "en-US": "Confirm new password", "pt-BR": "Confirmar nova senha" },
    "auth.req1": { "en-US": "At least 8 characters", "pt-BR": "Pelo menos 8 caracteres" },
    "auth.req2": { "en-US": "One uppercase letter", "pt-BR": "Uma letra maiúscula" },
    "auth.req3": { "en-US": "One number", "pt-BR": "Um número" },
    "auth.resetBtn": { "en-US": "Reset password", "pt-BR": "Redefinir senha" },
    "auth.noCode": { "en-US": "Didn't receive the code?", "pt-BR": "Não recebeu o código?" },
    "auth.resend": { "en-US": "Resend", "pt-BR": "Reenviar" },
    "auth.codeErr": { "en-US": "Enter the 6 digits of the code.", "pt-BR": "Informe os 6 dígitos do código." },
    "auth.pwWeak": { "en-US": "The password does not meet the requirements.", "pt-BR": "A senha não atende aos requisitos." },
    "auth.pwMismatch": { "en-US": "The passwords do not match.", "pt-BR": "As senhas não coincidem." },
    "auth.resetOk": { "en-US": "Password updated! This is only a demonstration.", "pt-BR": "Senha atualizada! Isto é só uma demonstração." },
    "footer.dev": { "en-US": "Site developed by Jonas Sene Torres.", "pt-BR": "Site desenvolvido por Jonas Sene Torres." },
    "footer.lic": { "en-US": "Licenses", "pt-BR": "Licenças" },
    "footer.priv": { "en-US": "Privacy", "pt-BR": "Privacidade" },
    "footer.nav": { "en-US": "Legal information", "pt-BR": "Informações legais" },
    "lic.title": { "en-US": "Licenses and credits", "pt-BR": "Licenças e créditos" },
    "lic.lede": { "en-US": "This project combines its own code, Open Design content and third-party fonts. Each part follows its own license.", "pt-BR": "Este projeto reúne código próprio, conteúdo do Open Design e fontes de terceiros. Cada parte segue a sua licença." },
    "lic.codeTitle": { "en-US": "Viewer code", "pt-BR": "Código do visualizador" },
    "lic.codeText": { "en-US": "The HTML, CSS, JavaScript and scripts of this site are under the MIT License, © 2026 Jonas Sene Torres.", "pt-BR": "O HTML, o CSS, o JavaScript e os scripts deste site estão sob a Licença MIT, © 2026 Jonas Sene Torres." },
    "lic.mitText": { "en-US": "Read the full text of the MIT License", "pt-BR": "Ver o texto completo da Licença MIT" },
    "lic.catTitle": { "en-US": "Catalog and themes", "pt-BR": "Catálogo e temas dos design systems" },
    "lic.catText": { "en-US": "Names, categories, colors, fonts, tokens and guide texts come, as they are, from the Open Design documentation, licensed under the Apache License 2.0 (© 2026 Open Design contributors).", "pt-BR": "Nomes, categorias, cores, fontes, tokens e textos dos guias vêm, no estado em que estão, da documentação do Open Design, licenciada sob a Apache License 2.0 (© 2026 Open Design contributors)." },
    "lic.catChanges": { "en-US": "Changes made by this project: the 50–950 color scales derived from the given colors, the CSS of each theme and the pt-BR translations.", "pt-BR": "Alterações feitas por este projeto: as escalas de cor 50–950 derivadas das cores informadas, o CSS de cada tema e as traduções para pt-BR." },
    "lic.linkDocs": { "en-US": "Open Design documentation", "pt-BR": "Documentação do Open Design" },
    "lic.linkRepo": { "en-US": "Open Design repository", "pt-BR": "Repositório do Open Design" },
    "lic.linkApache": { "en-US": "Apache License 2.0 (full text)", "pt-BR": "Apache License 2.0 (texto completo)" },
    "lic.fontsTitle": { "en-US": "Fonts", "pt-BR": "Fontes" },
    "lic.fontsText": { "en-US": "The theme fonts come from Google Fonts and are served by this site itself. Each family keeps its original license (usually the SIL Open Font License 1.1; some use the Apache License 2.0 or the Ubuntu Font License).", "pt-BR": "As fontes dos temas vêm do Google Fonts e são servidas pelo próprio site. Cada família mantém a sua licença original (em geral a SIL Open Font License 1.1; algumas usam a Apache License 2.0 ou a Ubuntu Font License)." },
    "lic.fontsProp": { "en-US": "Brand fonts that are not on Google Fonts are not included: the page falls back to the fallback fonts listed in each guide.", "pt-BR": "Fontes de marca que não estão no Google Fonts não são incluídas: a página usa as fontes de reserva indicadas em cada guia." },
    "lic.fontsLink": { "en-US": "Google Fonts attribution", "pt-BR": "Atribuição do Google Fonts" },
    "lic.brandsTitle": { "en-US": "Brands", "pt-BR": "Marcas" },
    "lic.brandsText": { "en-US": "Many design systems describe the visual identity of companies and products. Names and brands belong to their owners, and the Open Design packages that reference brands are aesthetic inspirations, not official assets. This project has no affiliation with, sponsorship or endorsement from any of them.", "pt-BR": "Muitos design systems descrevem a identidade visual de empresas e produtos. Nomes e marcas pertencem aos seus titulares, e os pacotes do Open Design que citam marcas são inspirações estéticas, não ativos oficiais. Este projeto não tem vínculo, patrocínio nem endosso de nenhuma delas." },
    "lic.uiTitle": { "en-US": "No UI kit", "pt-BR": "Sem UI Kit" },
    "lic.uiText": { "en-US": "The pages use no UI kit or component library: every color, font, border and shadow comes from the selected design system.", "pt-BR": "As páginas não usam UI kit nem biblioteca de componentes: toda cor, fonte, borda e sombra vem do design system selecionado." },
    "lic.sample": { "en-US": "Texts, names, numbers and images on the example pages are fictional.", "pt-BR": "Textos, nomes, números e imagens das páginas de exemplo são fictícios." },
    "pri.title": { "en-US": "Privacy and LGPD", "pt-BR": "Privacidade e LGPD" },
    "pri.lede": { "en-US": "In short: this site does not collect, send or share personal data.", "pt-BR": "Em resumo: este site não coleta, envia nem compartilha dados pessoais." },
    "pri.s1Title": { "en-US": "What the site does not do", "pt-BR": "O que o site não faz" },
    "pri.s1Text": { "en-US": "It uses no cookies, has no usage analytics or advertising, and calls no third-party services while you browse: fonts and data are served by the site itself.", "pt-BR": "Não usa cookies, não tem análise de uso nem publicidade e não chama serviços de terceiros enquanto você navega: as fontes e os dados são servidos pelo próprio site." },
    "pri.s2Title": { "en-US": "What stays in your browser", "pt-BR": "O que fica no seu navegador" },
    "pri.s2Text": { "en-US": "Three preferences are saved only on your device, in the browser's local storage:", "pt-BR": "Três preferências ficam salvas só no seu dispositivo, no armazenamento local do navegador:" },
    "pri.li1": { "en-US": "the selected theme;", "pt-BR": "o tema escolhido;" },
    "pri.li2": { "en-US": "the language;", "pt-BR": "o idioma;" },
    "pri.li3": { "en-US": "the records of the sample table.", "pt-BR": "os registros da tabela de exemplo." },
    "pri.s2Note": { "en-US": "You can erase them at any time by clearing this site's data in your browser.", "pt-BR": "Você pode apagá-las quando quiser, limpando os dados deste site no navegador." },
    "pri.s3Title": { "en-US": "Sample forms", "pt-BR": "Formulários de exemplo" },
    "pri.s3Text": { "en-US": "The contact, newsletter, sign in, forgot password, new password and quick draft forms are demonstrations: nothing is sent anywhere. Do not type real data in them.", "pt-BR": "Os formulários de contato, newsletter, entrar, esqueci minha senha, nova senha e rascunho rápido são demonstrações: nada é enviado a lugar nenhum. Não digite dados reais neles." },
    "pri.s4Title": { "en-US": "Hosting and links", "pt-BR": "Hospedagem e links" },
    "pri.s4Text": { "en-US": "The hosting provider may record technical access data (such as IP address and time) under its own policies, and this site has no access to it. Links to other sites, such as the Open Design documentation, are subject to those sites' policies.", "pt-BR": "O provedor de hospedagem pode registrar dados técnicos de acesso (como endereço IP e horário) conforme as próprias políticas, e este site não tem acesso a eles. Os links para outros sites, como a documentação do Open Design, ficam sujeitos às políticas desses sites." },
    "pri.s5Title": { "en-US": "LGPD", "pt-BR": "LGPD" },
    "pri.s5Text": { "en-US": "Since the site does not process personal data, there is nothing to request (access, correction or deletion) from this project. Person responsible for the site: Jonas Sene Torres.", "pt-BR": "Como o site não trata dados pessoais, não há o que solicitar (acesso, correção ou exclusão) a este projeto. Responsável pelo site: Jonas Sene Torres." },
    "pri.s5Note": { "en-US": "This text is informational and is not legal advice.", "pt-BR": "Este texto é informativo e não substitui orientação jurídica." },
    "dash.kicker": { "en-US": "Example · Dashboard", "pt-BR": "Exemplo · Dashboard" },
    "dash.h1": { "en-US": "Dashboard", "pt-BR": "Painel" },
    "dash.lede": { "en-US": "A generic admin panel with SVG charts, inspired by the WordPress dashboard. The numbers are fictional.", "pt-BR": "Um painel genérico com gráficos em SVG, inspirado no painel do WordPress. Os números são fictícios." },
    "dash.visitors": { "en-US": "Visitors", "pt-BR": "Visitantes" },
    "dash.posts": { "en-US": "Posts", "pt-BR": "Posts" },
    "dash.comments": { "en-US": "Comments", "pt-BR": "Comentários" },
    "dash.users": { "en-US": "Users", "pt-BR": "Usuários" },
    "dash.visits": { "en-US": "Visits in the last 14 days", "pt-BR": "Visitas nos últimos 14 dias" },
    "dash.sources": { "en-US": "Traffic sources", "pt-BR": "Origem do tráfego" },
    "dash.direct": { "en-US": "Direct", "pt-BR": "Direto" },
    "dash.search": { "en-US": "Search", "pt-BR": "Busca" },
    "dash.social": { "en-US": "Social", "pt-BR": "Social" },
    "dash.referral": { "en-US": "Referral", "pt-BR": "Referência" },
    "dash.monthly": { "en-US": "Posts per month", "pt-BR": "Posts por mês" },
    "dash.health": { "en-US": "Site health", "pt-BR": "Saúde do site" },
    "dash.healthText": { "en-US": "Good. Two items to review.", "pt-BR": "Boa. Dois itens para revisar." },
    "dash.activity": { "en-US": "Recent activity", "pt-BR": "Atividade recente" },
    "dash.draft": { "en-US": "Quick draft", "pt-BR": "Rascunho rápido" },
    "dash.draftTitle": { "en-US": "Title", "pt-BR": "Título" },
    "dash.draftBody": { "en-US": "What's on your mind?", "pt-BR": "Em que você está pensando?" },
    "dash.draftSave": { "en-US": "Save draft", "pt-BR": "Salvar rascunho" },
    "shop.kicker": { "en-US": "Example · Store", "pt-BR": "Exemplo · Loja" },
    "shop.h1": { "en-US": "Product catalog", "pt-BR": "Catálogo de produtos" },
    "shop.lede": { "en-US": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.", "pt-BR": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor." },
    "shop.cats": { "en-US": "Categories", "pt-BR": "Categorias" },
    "shop.all": { "en-US": "All products", "pt-BR": "Todos os produtos" },
    "shop.items": { "en-US": "items", "pt-BR": "itens" },
    "shop.cart": { "en-US": "Cart", "pt-BR": "Carrinho" },
    "shop.sort": { "en-US": "Sort by", "pt-BR": "Ordenar por" },
    "shop.sRel": { "en-US": "Relevance", "pt-BR": "Relevância" },
    "shop.sAsc": { "en-US": "Lowest price", "pt-BR": "Menor preço" },
    "shop.sDesc": { "en-US": "Highest price", "pt-BR": "Maior preço" },
    "shop.sName": { "en-US": "Name (A-Z)", "pt-BR": "Nome (A-Z)" },
    "shop.add": { "en-US": "Add to cart", "pt-BR": "Adicionar ao carrinho" },
    "shop.new": { "en-US": "New", "pt-BR": "Novo" },
    "shop.sale": { "en-US": "Sale", "pt-BR": "Oferta" },
    "shop.empty": { "en-US": "No products in this category.", "pt-BR": "Nenhum produto nesta categoria." },
    "fontnote.text": {
      "en-US": "This theme originally uses proprietary fonts ({fonts}). What you see here uses fallback fonts, not the originals.",
      "pt-BR": "Este tema, originalmente, utiliza fontes proprietárias ({fonts}). O que você vê aqui usa fontes de reserva (fallback), não as originais."
    },
    "contrastnote.text": {
      "en-US": "To reach the minimum contrast of 4.5:1 (WCAG 2.2, level AA), {n} colors of this theme were adjusted:",
      "pt-BR": "Para atingir o contraste mínimo de 4,5:1 (WCAG 2.2, nível AA), {n} cores deste tema foram ajustadas:"
    },
    "contrastnote.on": { "en-US": "text on it", "pt-BR": "texto sobre ela" },
    "contrastnote.word": { "en-US": "text", "pt-BR": "texto" },
    "contrastnote.limit": { "en-US": "best possible for this theme's backgrounds", "pt-BR": "o melhor possível para os fundos deste tema" },
    "ctok.--solid": { "en-US": "Primary button", "pt-BR": "Botão principal" },
    "ctok.--accent-strong": { "en-US": "Links and highlights", "pt-BR": "Links e destaques" },
    "ctok.--muted": { "en-US": "Secondary text", "pt-BR": "Texto secundário" },
    "ctok.--fg-soft": { "en-US": "Soft text", "pt-BR": "Texto suave" },
    "ctok.--meta": { "en-US": "Supporting text (dates, captions)", "pt-BR": "Texto de apoio (datas, legendas)" },
    "ctok.--ok-ink": { "en-US": "Success text", "pt-BR": "Texto de sucesso" },
    "ctok.--warn-ink": { "en-US": "Warning text", "pt-BR": "Texto de atenção" },
    "ctok.--danger-ink": { "en-US": "Error text", "pt-BR": "Texto de erro" },
    "ctok.--surface": { "en-US": "Surface (cards)", "pt-BR": "Superfície (cartões)" },
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
    "home.note": {
      "en-US": "It is important to make clear that the examples on this page use no UI kit or similar. All the definitions of colors, fonts, borders and shadows come from the {link} documentation.",
      "pt-BR": "É importante deixar claro que, nos exemplos desta página, não estamos usando nenhum UI Kit ou assemelhado. Toda a definição de cores, fontes, bordas e sombras vem da documentação do {link}."
    },
    "home.noteLink": { "en-US": "Open Design", "pt-BR": "Open Design" },
    "home.newWindow": { "en-US": "(opens in a new window)", "pt-BR": "(abre em outra janela)" },
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
      swatches: d.swatches,
      proprietary: d.proprietaryFonts || []
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
  // Aviso no topo para temas cujo guia usa fontes proprietárias: o site usa as fontes de reserva.
  var FONT_NOTICE_KEY = "odv-font-notice-closed";

  var CONTRAST_NOTICE_KEY = "odv-contrast-notice-closed";

  function closedNotices(key) {
    try { return JSON.parse(sessionStorage.getItem(key || FONT_NOTICE_KEY) || "[]"); } catch (e) { return []; }
  }

  // Aviso de contraste: tokens do DS abaixo de 4,5:1 (WCAG 2.2 AA) que o build trocou.
  // Os dados vêm de data/themes/<id>.contrast.json, gerado por scripts/build_ds_details.py.
  var CONTRAST_DATA = {};

  function loadContrast(id) {
    if (CONTRAST_DATA[id]) return Promise.resolve(CONTRAST_DATA[id]);
    return fetch("data/themes/" + encodeURIComponent(id) + ".contrast.json", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; })
      .then(function (list) { return (CONTRAST_DATA[id] = Array.isArray(list) ? list : []); });
  }

  function ratioText(n) { return String(n).replace(".", lang === "pt-BR" ? "," : ".") + ":1"; }

  function updateContrastNotice(id) {
    var box = document.getElementById("contrastNotice");
    if (!box) return;
    box.hidden = true;
    box.innerHTML = "";
    if (closedNotices(CONTRAST_NOTICE_KEY).indexOf(id) !== -1) return;
    loadContrast(id).then(function (list) {
      if (wantedTheme !== id || !list.length) return;
      var HEX = /^#[0-9a-f]{6}$/;
      function chip(hex) { return '<span class="cn-chip" style="background:' + esc(hex) + '"></span><code>' + esc(hex) + "</code>"; }
      var rows = list.filter(function (a) { return HEX.test(a.from) && HEX.test(a.to); }).map(function (a) {
        var hasOn = a.onFrom && HEX.test(a.onFrom) && HEX.test(a.onTo);
        var same = a.from === a.to; // só o texto do botão mudou: mostra a troca do texto sobre a cor do tema
        var on = hasOn ? ' <span class="cn-on">(' + esc(T(same ? "contrastnote.word" : "contrastnote.on")) + ": " +
          chip(a.onFrom) + " → " + chip(a.onTo) + ")</span>" : "";
        var limit = a.ratioTo < 4.5 ? ' <em>(' + esc(T("contrastnote.limit")) + ")</em>" : "";
        return "<li><strong>" + esc(T("ctok." + a.token)) + "</strong>: " + (same && hasOn ? chip(a.from) : chip(a.from) + " → " + chip(a.to)) + on +
          ' <span class="cn-ratio">' + esc(ratioText(a.ratioFrom)) + " → " + esc(ratioText(a.ratioTo)) + limit + "</span></li>";
      });
      if (!rows.length) return;
      box.innerHTML =
        '<div class="wrap font-notice-inner"><details><summary>' + esc(T("contrastnote.text").replace("{n}", String(rows.length))) +
        '</summary><ul class="cn-list">' + rows.join("") + "</ul></details>" +
        '<button type="button" class="font-notice-close" data-close-notice="' + esc(id) + '" data-notice-key="' + CONTRAST_NOTICE_KEY +
        '" data-notice-box="contrastNotice" aria-label="' + esc(T("close")) + '">&times;</button></div>';
      box.hidden = false;
    });
  }

  function updateFontNotice(id) {
    var box = document.getElementById("fontNotice");
    if (!box) return;
    var theme = THEMES.filter(function (t) { return t.id === id; })[0];
    var fonts = theme ? theme.proprietary : [];
    if (!fonts.length || closedNotices().indexOf(id) !== -1) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    var shown = fonts.slice(0, 3).join(", ") + (fonts.length > 3 ? "…" : "");
    box.innerHTML =
      '<div class="wrap font-notice-inner"><p>' + esc(T("fontnote.text").replace("{fonts}", shown)) + "</p>" +
      '<button type="button" class="font-notice-close" data-close-notice="' + esc(id) + '" aria-label="' + esc(T("close")) + '">&times;</button></div>';
    box.hidden = false;
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-close-notice]");
    if (!btn) return;
    var key = btn.getAttribute("data-notice-key") || FONT_NOTICE_KEY;
    var list = closedNotices(key);
    list.push(btn.getAttribute("data-close-notice"));
    try { sessionStorage.setItem(key, JSON.stringify(list)); } catch (err) {}
    var box = document.getElementById(btn.getAttribute("data-notice-box") || "fontNotice");
    box.hidden = true;
    box.innerHTML = "";
  });

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
      updateFontNotice(id);
      updateContrastNotice(id);
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
    updateThemeLink();
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

  // Link para a documentação do Open Design; abre em outra janela e avisa isso a leitores de tela.
  function openDesignLinkHTML() {
    return (
      '<a href="https://open-design.ai/plugins/systems/" target="_blank" rel="noopener">' + esc(T("home.noteLink")) +
      '<svg class="ext-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>' +
      '<span class="sr-only"> ' + esc(T("home.newWindow")) + "</span></a>"
    );
  }

  // Início: o hero e, logo abaixo, o catálogo de design systems.
  function homeHTML() {
    return (
      '<section class="hero"><div class="wrap hero-inner">' +
      '<span class="kicker">' + esc(T("home.kicker")) + "</span>" +
      "<h1>" + esc(T("home.h1")) + "</h1>" +
      '<p class="lede">' + esc(T("home.lede")) + "</p>" +
      '<p class="lede">' + esc(T("home.note")).replace("{link}", openDesignLinkHTML()) + "</p>" +
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
      '<div class="blog-layout"><div class="blog-main">' +
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
      "</div>" +
      "</div>" +
      blogAsideHTML() +
      "</div>"
    );
  }

  // Barra lateral de blog genérico: busca, tópicos, últimos artigos, redes sociais, newsletter e nuvem de tags.
  // É só ilustrativa: a busca e o envio não fazem nada e os links não têm destino.
  function socialIconSVG(kind) {
    var paths = {
      rss: '<circle cx="6" cy="18" r="2"/><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/>',
      video: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>',
      photo: '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.5"/><circle cx="17" cy="7" r="0.6"/>',
      chat: '<path d="M4 5h16v11H9l-5 4z"/>',
      people: '<circle cx="9" cy="9" r="3"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 6a3 3 0 0 1 0 6"/><path d="M18 14c2 .6 3 2.2 3 5"/>',
      mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'
    };
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + paths[kind] + "</svg>";
  }

  function blogAsideHTML() {
    var topics = ["Lorem", "Ipsum", "Dolor", "Sit amet", "Consectetur", "Adipiscing"];
    var tags = [
      ["lorem", 5], ["ipsum", 3], ["dolor", 4], ["amet", 1], ["elit", 2], ["tempor", 1], ["magna", 3], ["aliqua", 2],
      ["veniam", 1], ["nostrud", 4], ["laboris", 2], ["aute", 1], ["irure", 3], ["cupidatat", 1], ["deserunt", 2], ["mollit", 1]
    ];
    var social = [["people", "Facebook"], ["video", "YouTube"], ["photo", "Instagram"], ["chat", "X"], ["people", "LinkedIn"], ["rss", "RSS"]];
    function block(title, body, cls) {
      return '<section class="aside-block' + (cls ? " " + cls : "") + '"><h2 class="aside-title">' + esc(title) + "</h2>" + body + "</section>";
    }
    return (
      '<aside class="blog-aside" aria-label="' + esc(T("aside.label")) + '">' +
      '<form class="aside-search" role="search">' +
      '<label class="sr-only" for="asideSearch">' + esc(T("aside.search")) + "</label>" +
      '<input type="search" id="asideSearch" placeholder="' + esc(T("aside.searchPh")) + '">' +
      '<button type="button" data-submit class="btn btn-primary btn-small">' + esc(T("aside.search")) + "</button>" +
      "</form>" +
      block(T("aside.topics"), "<ul>" + topics.map(function (c, i) {
        return '<li><a class="dead-link">' + esc(c) + '</a><span class="aside-count">' + (14 - i * 2) + "</span></li>";
      }).join("") + "</ul>") +
      block(T("aside.latest"), '<ul class="aside-latest">' + ARTICLES.slice(0, 4).map(function (a) {
        return '<li><a class="dead-link">' + esc(a.title) + '</a><span class="aside-date">' + formatDate(a.date) + "</span></li>";
      }).join("") + "</ul>") +
      block(T("aside.follow"), '<div class="social-grid">' + social.map(function (s) {
        return '<a class="social-btn">' + socialIconSVG(s[0]) + "<span>" + esc(s[1]) + "</span></a>";
      }).join("") + "</div>") +
      block(T("aside.newsletter"),
        "<p>" + esc(T("aside.nlText")) + "</p>" +
        '<form class="newsletter-form">' +
        '<label class="sr-only" for="asideEmail">' + esc(T("aside.nlPh")) + "</label>" +
        '<input type="email" id="asideEmail" placeholder="' + esc(T("aside.nlPh")) + '">' +
        '<button type="button" data-submit class="btn btn-primary btn-small">' + esc(T("aside.nlBtn")) + "</button>" +
        "</form>", "aside-newsletter") +
      block(T("aside.tags"), '<p class="tag-cloud">' + tags.map(function (t) {
        return '<a class="dead-link tag tag-' + t[1] + '">' + esc(t[0]) + "</a>";
      }).join(" ") + "</p>") +
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
      '<button type="button" data-submit class="btn btn-primary" id="demoSubmit">' + esc(T("frm.submit")) + "</button>" +
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

  // Botões de envio são type="button" (nada envia por conta própria): o clique, ou o Enter em um campo,
  // pede o envio do formulário e o evento "submit" de cada tela faz a validação de exemplo.
  function submitForm(form) {
    if (form.requestSubmit) form.requestSubmit();
    else form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("button[data-submit]");
    if (!btn || btn.disabled) return;
    var form = btn.closest("form");
    if (form) submitForm(form);
  });

  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if (e.key !== "Enter" || e.isComposing || !t || t.tagName !== "INPUT") return;
    if (["checkbox", "radio", "button", "submit", "reset", "file", "range", "color"].indexOf(t.type) !== -1) return;
    var form = t.form;
    if (!form || !form.querySelector("button[data-submit]")) return;
    e.preventDefault();
    submitForm(form);
  });

  // A busca da barra lateral do blog é só de enfeite.
  app.addEventListener("submit", function (e) {
    if (!e.target.closest) return;
    if (e.target.closest(".aside-search, .draft-form, .newsletter-form")) e.preventDefault();
    var contact = e.target.closest(".contact-form");
    if (contact) {
      e.preventDefault();
      var ok = contact.querySelector(".form-alert");
      if (ok) ok.classList.add("show");
    }
  });

  // ------------------------------------------------------------------
  // Dashboard de exemplo, no estilo do painel do WordPress: widgets com gráficos em SVG.
  // As cores vêm das variáveis do tema; os números são fictícios.
  // ------------------------------------------------------------------

  function chartSVG(w, h, label, inner) {
    return '<svg class="chart" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + esc(label) + '">' + inner + "</svg>";
  }

  function monthNames(n) {
    var out = [];
    for (var m = 0; m < n; m++) out.push(new Date(2026, m, 1).toLocaleDateString(lang, { month: "short" }));
    return out;
  }

  // Área com linha: visitas por dia.
  function areaChartSVG(values, label) {
    var W = 560, H = 220, L = 40, R = 12, Tp = 12, B = 28;
    var max = Math.ceil(Math.max.apply(null, values) / 100) * 100;
    var n = values.length;
    function x(i) { return L + i * (W - L - R) / (n - 1); }
    function y(v) { return Tp + (H - Tp - B) * (1 - v / max); }
    var grid = "";
    for (var t = 0; t <= 4; t++) {
      var v = max * t / 4;
      grid += '<line class="ch-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '"/>' +
        '<text class="ch-axis" x="' + (L - 8) + '" y="' + (y(v) + 4).toFixed(1) + '" text-anchor="end">' + v + "</text>";
    }
    var pts = values.map(function (val, i) { return x(i).toFixed(1) + "," + y(val).toFixed(1); });
    var line = "M" + pts.join(" L");
    var area = line + " L" + x(n - 1).toFixed(1) + "," + y(0).toFixed(1) + " L" + x(0).toFixed(1) + "," + y(0).toFixed(1) + " Z";
    var labels = "", dots = "";
    values.forEach(function (val, i) {
      if (i % 2 === 0) labels += '<text class="ch-axis" x="' + x(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + (i + 1) + "</text>";
      dots += '<circle class="ch-dot ch-s1" cx="' + x(i).toFixed(1) + '" cy="' + y(val).toFixed(1) + '" r="3"/>';
    });
    return chartSVG(W, H, label, grid + '<path class="ch-area ch-s1" d="' + area + '"/><path class="ch-line ch-s1" d="' + line + '"/>' + dots + labels);
  }

  // Barras: posts por mês.
  function barChartSVG(values, names, label) {
    var W = 360, H = 200, L = 28, R = 8, Tp = 12, B = 26;
    var max = Math.ceil(Math.max.apply(null, values) / 5) * 5;
    var n = values.length;
    var slot = (W - L - R) / n, bw = slot * 0.56;
    function y(v) { return Tp + (H - Tp - B) * (1 - v / max); }
    var out = "";
    for (var t = 0; t <= 3; t++) {
      var v = max * t / 3;
      out += '<line class="ch-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '"/>' +
        '<text class="ch-axis" x="' + (L - 6) + '" y="' + (y(v) + 4).toFixed(1) + '" text-anchor="end">' + Math.round(v) + "</text>";
    }
    values.forEach(function (val, i) {
      var bx = L + i * slot + (slot - bw) / 2;
      out += '<rect class="ch-bar ch-s2" x="' + bx.toFixed(1) + '" y="' + y(val).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (y(0) - y(val)).toFixed(1) + '" rx="3"/>' +
        '<text class="ch-axis" x="' + (bx + bw / 2).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(names[i]) + "</text>";
    });
    return chartSVG(W, H, label, out);
  }

  // Rosca: origem do tráfego (círculo de circunferência 100, para usar as partes como porcentagem).
  function donutSVG(parts, label) {
    var acc = 0, out = '<circle class="ch-ring-bg" cx="21" cy="21" r="15.9155" fill="none"/>';
    parts.forEach(function (p, i) {
      out += '<circle class="ch-seg ch-s' + (i + 1) + '" cx="21" cy="21" r="15.9155" fill="none" stroke-dasharray="' + p.v + " " + (100 - p.v) +
        '" stroke-dashoffset="' + (25 - acc) + '"/>';
      acc += p.v;
    });
    return chartSVG(42, 42, label, out);
  }

  // Anel de progresso: saúde do site.
  function gaugeSVG(pct, label) {
    return chartSVG(42, 42, label,
      '<circle class="ch-ring-bg" cx="21" cy="21" r="15.9155" fill="none"/>' +
      '<circle class="ch-seg ch-s3" cx="21" cy="21" r="15.9155" fill="none" stroke-dasharray="' + pct + " " + (100 - pct) + '" stroke-dashoffset="25"/>' +
      '<text class="ch-center" x="21" y="23.5" text-anchor="middle">' + pct + "%</text>");
  }

  function sparkSVG(values) {
    var W = 96, H = 32, max = Math.max.apply(null, values), min = Math.min.apply(null, values);
    var pts = values.map(function (v, i) {
      return (i * W / (values.length - 1)).toFixed(1) + "," + (H - 3 - (H - 6) * (v - min) / (max - min || 1)).toFixed(1);
    });
    return '<svg class="spark" viewBox="0 0 ' + W + " " + H + '" aria-hidden="true"><polyline class="ch-line ch-s1" points="' + pts.join(" ") + '"/></svg>';
  }

  function widget(title, body, cls) {
    return '<section class="widget' + (cls ? " " + cls : "") + '"><h2 class="widget-title">' + esc(title) + '</h2><div class="widget-body">' + body + "</div></section>";
  }

  function dashboardHTML() {
    var visits = [120, 180, 150, 220, 260, 240, 310, 280, 350, 330, 400, 380, 450, 430];
    var posts = [8, 12, 9, 15, 11, 18];
    var sources = [
      { key: "dash.direct", v: 38 }, { key: "dash.search", v: 31 }, { key: "dash.social", v: 19 }, { key: "dash.referral", v: 12 }
    ];
    var stats = [
      { key: "dash.visitors", value: "12.480", delta: "+12%", up: true, spark: [4, 6, 5, 8, 7, 10, 12] },
      { key: "dash.posts", value: "86", delta: "+4%", up: true, spark: [3, 3, 4, 4, 5, 5, 6] },
      { key: "dash.comments", value: "342", delta: "-3%", up: false, spark: [9, 8, 9, 7, 8, 6, 6] },
      { key: "dash.users", value: "1.205", delta: "+9%", up: true, spark: [2, 3, 3, 5, 6, 6, 8] }
    ];
    var activity = [
      ["Lorem ipsum dolor sit amet", "Jonas Torres", "2h"],
      ["Consectetur adipiscing elit", "Maria Lorem", "5h"],
      ["Sed do eiusmod tempor", "Ipsum Dolor", "1d"],
      ["Ut enim ad minim veniam", "Jonas Torres", "2d"],
      ["Duis aute irure dolor", "Sit Amet", "3d"]
    ];
    return (
      '<div class="page-head">' +
      '<span class="kicker">' + esc(T("dash.kicker")) + "</span>" +
      "<h1>" + esc(T("dash.h1")) + "</h1>" +
      '<p class="lede">' + esc(T("dash.lede")) + "</p>" +
      "</div>" +
      '<div class="dash-stats">' +
      stats.map(function (s) {
        return (
          '<div class="stat"><span class="stat-label">' + esc(T(s.key)) + "</span>" +
          '<span class="stat-value">' + s.value + "</span>" +
          '<span class="stat-delta ' + (s.up ? "is-up" : "is-down") + '">' + s.delta + "</span>" +
          sparkSVG(s.spark) + "</div>"
        );
      }).join("") +
      "</div>" +
      '<div class="dash-grid">' +
      widget(T("dash.visits"), areaChartSVG(visits, T("dash.visits")), "span-2") +
      widget(T("dash.sources"),
        '<div class="donut-wrap">' + donutSVG(sources.map(function (s) { return { v: s.v }; }), T("dash.sources")) +
        '<ul class="legend">' + sources.map(function (s, i) {
          return '<li><span class="swatch ch-sw' + (i + 1) + '" aria-hidden="true"></span>' + esc(T(s.key)) + "<strong>" + s.v + "%</strong></li>";
        }).join("") + "</ul></div>") +
      widget(T("dash.monthly"), barChartSVG(posts, monthNames(6), T("dash.monthly"))) +
      widget(T("dash.health"),
        '<div class="gauge-wrap">' + gaugeSVG(82, T("dash.health")) +
        '<p class="muted">' + esc(T("dash.healthText")) + "</p></div>") +
      widget(T("dash.activity"),
        '<ul class="activity">' + activity.map(function (a) {
          return "<li><span>" + esc(a[0]) + '</span><span class="muted">' + esc(a[1]) + " · " + esc(a[2]) + "</span></li>";
        }).join("") + "</ul>", "span-2") +
      widget(T("dash.draft"),
        '<form class="draft-form">' +
        '<label class="field"><span class="sr-only">' + esc(T("dash.draftTitle")) + '</span><input type="text" placeholder="' + esc(T("dash.draftTitle")) + '"></label>' +
        '<label class="field"><span class="sr-only">' + esc(T("dash.draftBody")) + '</span><textarea rows="3" placeholder="' + esc(T("dash.draftBody")) + '"></textarea></label>' +
        '<button type="button" data-submit class="btn btn-primary btn-small">' + esc(T("dash.draftSave")) + "</button></form>") +
      "</div>"
    );
  }

  // ------------------------------------------------------------------
  // Catálogo de loja de exemplo: navegação por categoria, ordenação e "adicionar ao carrinho".
  // Sem fotos: degradê com as cores do tema e o ícone de imagem não encontrada em SVG.
  // ------------------------------------------------------------------

  var SHOP_CATS = [
    { id: "lorem", name: "Lorem" }, { id: "ipsum", name: "Ipsum" }, { id: "dolor", name: "Dolor" },
    { id: "sit-amet", name: "Sit amet" }, { id: "consectetur", name: "Consectetur" }
  ];

  var SHOP_PRODUCTS = [
    { id: 1, name: "Lorem ipsum dolor", cat: "lorem", price: 129.9, old: 159.9, rating: 5, badge: "sale" },
    { id: 2, name: "Sit amet consectetur", cat: "ipsum", price: 89.5, old: null, rating: 4, badge: null },
    { id: 3, name: "Adipiscing elit sed", cat: "dolor", price: 249, old: null, rating: 4, badge: "new" },
    { id: 4, name: "Eiusmod tempor", cat: "sit-amet", price: 59.9, old: null, rating: 3, badge: null },
    { id: 5, name: "Incididunt ut labore", cat: "consectetur", price: 319, old: 399, rating: 5, badge: "sale" },
    { id: 6, name: "Et dolore magna", cat: "lorem", price: 74.9, old: null, rating: 4, badge: null },
    { id: 7, name: "Aliqua ut enim", cat: "ipsum", price: 199, old: null, rating: 5, badge: "new" },
    { id: 8, name: "Minim veniam quis", cat: "dolor", price: 39.9, old: null, rating: 3, badge: null },
    { id: 9, name: "Nostrud exercitation", cat: "sit-amet", price: 149.9, old: 179.9, rating: 4, badge: "sale" },
    { id: 10, name: "Ullamco laboris", cat: "consectetur", price: 99, old: null, rating: 4, badge: null },
    { id: 11, name: "Nisi ut aliquip", cat: "lorem", price: 279.9, old: null, rating: 5, badge: null },
    { id: 12, name: "Commodo consequat", cat: "ipsum", price: 54.9, old: null, rating: 2, badge: null }
  ];

  var shopSort = "relevance";
  var shopCart = 0;

  // Ícone de imagem não encontrada: moldura, montanhas, sol e um traço cortando.
  function noImageSVG() {
    return (
      '<svg class="no-image" viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<rect x="8" y="12" width="48" height="40" rx="5"/>' +
      '<circle cx="22" cy="26" r="4"/>' +
      '<path d="M8 44l14-12 10 9 8-6 16 12"/>' +
      '<path d="M12 56L52 8"/>' +
      "</svg>"
    );
  }

  function cartIconSVG() {
    return (
      '<svg class="cart-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<path d="M3 4h2.5l2.2 10.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.76L20 8H6.2"/>' +
      '<circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>' +
      "</svg>"
    );
  }

  function starsSVG(rating) {
    var out = "";
    for (var k = 1; k <= 5; k++) {
      out += '<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true" class="' + (k <= rating ? "star is-on" : "star") + '"><path d="M10 1.8l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 8.1l6-.8z"/></svg>';
    }
    return '<span class="stars" role="img" aria-label="' + rating + '/5">' + out + "</span>";
  }

  function money(v) {
    try {
      return new Intl.NumberFormat(lang, { style: "currency", currency: lang === "pt-BR" ? "BRL" : "USD" }).format(v);
    } catch (e) {
      return String(v);
    }
  }

  function productCardHTML(p, i) {
    var angle = 110 + (i * 37) % 80;
    var a = 20 + (i * 13) % 28;
    var b = 8 + (i * 7) % 18;
    var grad = "linear-gradient(" + angle + "deg, color-mix(in oklab, var(--accent) " + a + "%, var(--surface)), color-mix(in oklab, var(--accent-strong) " + b + "%, var(--surface-2)))";
    return (
      '<article class="product">' +
      '<div class="thumb" style="background:' + grad + '">' + noImageSVG() +
      (p.badge ? '<span class="badge badge-' + p.badge + '">' + esc(T("shop." + p.badge)) + "</span>" : "") +
      "</div>" +
      '<div class="product-body">' +
      '<span class="product-cat">' + esc(shopCatName(p.cat)) + "</span>" +
      '<h3 class="product-name" title="' + esc(p.name) + '">' + esc(p.name) + "</h3>" +
      starsSVG(p.rating) +
      '<p class="price">' + (p.old ? '<s class="price-old">' + money(p.old) + "</s> " : "") + "<strong>" + money(p.price) + "</strong></p>" +
      '<button type="button" class="btn btn-ghost btn-small" data-add="' + p.id + '">' + cartIconSVG() + '<span class="btn-label">' + esc(T("shop.add")) + "</span></button>" +
      "</div></article>"
    );
  }

  function shopCatName(id) {
    for (var i = 0; i < SHOP_CATS.length; i++) if (SHOP_CATS[i].id === id) return SHOP_CATS[i].name;
    return "";
  }

  function shopList(catId) {
    var list = SHOP_PRODUCTS.filter(function (p) { return !catId || p.cat === catId; });
    if (shopSort === "price-asc") list = list.slice().sort(function (a, b) { return a.price - b.price; });
    else if (shopSort === "price-desc") list = list.slice().sort(function (a, b) { return b.price - a.price; });
    else if (shopSort === "name") list = list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    return list;
  }

  function shopGridHTML(catId) {
    var list = shopList(catId);
    if (!list.length) {
      return '<div class="empty"><strong>' + esc(T("shop.empty")) + "</strong></div>";
    }
    return '<div class="product-grid">' + list.map(productCardHTML).join("") + "</div>";
  }

  function shopHTML(catId) {
    var current = catId || "";
    var nav =
      '<nav class="shop-nav" aria-label="' + esc(T("shop.cats")) + '"><h2 class="aside-title">' + esc(T("shop.cats")) + "</h2><ul>" +
      '<li><a href="#/loja"' + (!current ? ' aria-current="page"' : "") + ">" + esc(T("shop.all")) + '<span class="aside-count">' + SHOP_PRODUCTS.length + "</span></a></li>" +
      SHOP_CATS.map(function (c) {
        var n = SHOP_PRODUCTS.filter(function (p) { return p.cat === c.id; }).length;
        return '<li><a href="#/loja/' + c.id + '"' + (current === c.id ? ' aria-current="page"' : "") + ">" + esc(c.name) + '<span class="aside-count">' + n + "</span></a></li>";
      }).join("") +
      "</ul></nav>";
    var sorts = [["relevance", "shop.sRel"], ["price-asc", "shop.sAsc"], ["price-desc", "shop.sDesc"], ["name", "shop.sName"]];
    return (
      '<div class="page-head">' +
      '<span class="kicker">' + esc(T("shop.kicker")) + "</span>" +
      "<h1>" + esc(current ? shopCatName(current) : T("shop.h1")) + "</h1>" +
      '<p class="lede">' + esc(T("shop.lede")) + "</p>" +
      "</div>" +
      '<div class="shop-layout">' + nav +
      '<div class="shop-main">' +
      '<div class="toolbar">' +
      '<span class="count" id="shopCount">' + shopList(current).length + " " + esc(T("shop.items")) + "</span>" +
      '<span class="shop-tools"><span class="cart" aria-live="polite">' + esc(T("shop.cart")) + ': <strong id="cartCount">' + shopCart + "</strong></span>" +
      '<label class="shop-sort"><span class="sr-only">' + esc(T("shop.sort")) + '</span><select id="shopSort">' +
      sorts.map(function (s) { return '<option value="' + s[0] + '"' + (shopSort === s[0] ? " selected" : "") + ">" + esc(T(s[1])) + "</option>"; }).join("") +
      "</select></label></span></div>" +
      '<div id="shopGrid" data-cat="' + esc(current) + '">' + shopGridHTML(current) + "</div>" +
      "</div></div>"
    );
  }

  function shopMount() {
    var grid = document.getElementById("shopGrid");
    var sel = document.getElementById("shopSort");
    if (sel) {
      sel.addEventListener("change", function () {
        shopSort = sel.value;
        grid.innerHTML = shopGridHTML(grid.getAttribute("data-cat"));
      });
    }
    if (grid) {
      grid.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-add]");
        if (!btn) return;
        shopCart += 1;
        document.getElementById("cartCount").textContent = shopCart;
      });
    }
  }

  // ------------------------------------------------------------------
  // Página institucional de exemplo: hero, sobre, valores, serviços, opiniões, chamada e contato.
  // O conteúdo é fictício; quem dá o estilo é o design system. As faixas alternam o fundo do tema
  // (--surface-2, --bg, --accent-weak e --solid) e as imagens usam o degradê com o ícone de imagem não encontrada.
  // ------------------------------------------------------------------

  function iconSVG(name) {
    var paths = {
      heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.600-7 10-7 10z"/>',
      shield: '<path d="M12 3l7 3v5c0 4.500-3 8-7 10-4-2-7-5.500-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
      bulb: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.500 10.900c.6.500 1 1.200 1 2.100h5c0-.9.400-1.600 1-2.100A6 6 0 0 0 12 3z"/>',
      users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.300 2.700-5.500 6-5.500s6 2.200 6 5.500"/><path d="M16 5.500a3 3 0 0 1 0 5"/><path d="M18 14.600c1.800.7 3 2.400 3 5.400"/>',
      chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-5"/><path d="M13 16V8"/><path d="M18 16v-8"/>',
      code: '<path d="M8 7l-5 5 5 5"/><path d="M16 7l5 5-5 5"/><path d="M14 4l-4 16"/>',
      pen: '<path d="M4 20l1-4L16.500 4.500a2.100 2.100 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/>',
      phone: '<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
      mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
      pin: '<path d="M12 21s-7-6.200-7-11a7 7 0 0 1 14 0c0 4.800-7 11-7 11z"/><circle cx="12" cy="10" r="2.500"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      check: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
      quote: '<path d="M7 17c-2 0-3-1.500-3-3.500C4 10 6 7.500 9 7v2c-1.500.4-2 1.500-2 2.500H9V17H7z"/><path d="M16 17c-2 0-3-1.500-3-3.500 0-3.500 2-6 5-6.500v2c-1.500.4-2 1.500-2 2.500H18V17h-2z"/>'
    };
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (paths[name] || "") + "</svg>";
  }

  // Imagem de exemplo: o mesmo degradê com o ícone de imagem não encontrada da loja.
  function placeholderHTML(i, cls) {
    var angle = 110 + (i * 37) % 80;
    var a = 20 + (i * 13) % 28;
    var b = 8 + (i * 7) % 18;
    var grad = "linear-gradient(" + angle + "deg, color-mix(in oklab, var(--accent) " + a + "%, var(--surface)), color-mix(in oklab, var(--accent-strong) " + b + "%, var(--surface-2)))";
    return '<div class="ph ' + (cls || "") + '" style="background:' + grad + '" role="img" aria-label="' + esc(T("inst.imageAlt")) + '">' + noImageSVG() + "</div>";
  }

  function bandHead(kicker, title, text) {
    return (
      '<div class="band-head">' +
      '<span class="kicker">' + esc(kicker) + "</span>" +
      "<h2>" + esc(title) + "</h2>" +
      (text ? '<p class="lede">' + esc(text) + "</p>" : "") +
      "</div>"
    );
  }

  function institutionalHTML() {
    var lorem = T("inst.lorem");
    var values = [["heart", "inst.v1"], ["shield", "inst.v2"], ["bulb", "inst.v3"], ["users", "inst.v4"]];
    var services = [["chart", "inst.s1"], ["code", "inst.s2"], ["pen", "inst.s3"], ["users", "inst.s4"], ["shield", "inst.s5"], ["bulb", "inst.s6"]];
    var people = [
      ["Maria Lorem", "Diretora · Empresa Ipsum", "ML"],
      ["João Dolor", "Fundador · Studio Amet", "JD"],
      ["Ana Consectetur", "Gerente · Grupo Elit", "AC"]
    ];
    var stats = [["15+", "inst.st1"], ["240", "inst.st2"], ["98%", "inst.st3"]];
    return (
      // hero
      '<section class="band band-b band-hero"><div class="wrap split">' +
      '<div class="split-text">' +
      '<span class="kicker">' + esc(T("inst.kicker")) + "</span>" +
      "<h1>" + esc(T("inst.h1")) + "</h1>" +
      '<p class="lede">' + esc(lorem) + "</p>" +
      '<div class="hero-actions"><a class="btn btn-primary" href="#/institucional">' + esc(T("inst.cta1")) + '</a><a class="btn btn-ghost" href="#/institucional">' + esc(T("inst.cta2")) + "</a></div>" +
      "</div>" + placeholderHTML(1, "ph-wide") + "</div></section>" +
      // sobre
      '<section class="band band-a" id="sobre"><div class="wrap split split-rev">' +
      placeholderHTML(4, "ph-wide") +
      '<div class="split-text">' + bandHead(T("inst.about"), T("inst.aboutTitle"), "") +
      "<p>" + esc(lorem) + "</p>" +
      '<ul class="checks">' + ["inst.c1", "inst.c2", "inst.c3"].map(function (k) {
        return '<li><span class="check-icon">' + iconSVG("check") + "</span>" + esc(T(k)) + "</li>";
      }).join("") + "</ul>" +
      '<dl class="stats-row">' + stats.map(function (s) {
        return "<div><dt>" + s[0] + "</dt><dd>" + esc(T(s[1])) + "</dd></div>";
      }).join("") + "</dl>" +
      "</div></div></section>" +
      // valores
      '<section class="band band-b" id="valores"><div class="wrap">' +
      bandHead(T("inst.valuesKicker"), T("inst.valuesTitle"), lorem) +
      '<div class="card-grid">' + values.map(function (v) {
        return '<article class="info-card"><span class="icon-bubble">' + iconSVG(v[0]) + "</span><h3>" + esc(T(v[1])) + "</h3><p>" + esc(lorem) + "</p></article>";
      }).join("") + "</div></div></section>" +
      // serviços
      '<section class="band band-a" id="servicos"><div class="wrap">' +
      bandHead(T("inst.servicesKicker"), T("inst.servicesTitle"), lorem) +
      '<div class="card-grid card-grid-3">' + services.map(function (v, i) {
        return '<article class="info-card service">' + placeholderHTML(i + 7, "ph-card") +
          '<span class="icon-bubble">' + iconSVG(v[0]) + "</span><h3>" + esc(T(v[1])) + "</h3><p>" + esc(lorem) + '</p><a class="dead-link more">' + esc(T("inst.more")) + " &rarr;</a></article>";
      }).join("") + "</div></div></section>" +
      // opiniões
      '<section class="band band-c" id="opinioes"><div class="wrap">' +
      bandHead(T("inst.testimonialsKicker"), T("inst.testimonialsTitle"), "") +
      '<div class="card-grid card-grid-3">' + people.map(function (p, i) {
        return '<figure class="info-card quote"><span class="quote-mark">' + iconSVG("quote") + "</span>" +
          "<blockquote>" + esc(lorem) + "</blockquote>" +
          '<figcaption><span class="avatar" style="' + "background:linear-gradient(135deg, color-mix(in oklab, var(--accent) " + (30 + i * 12) + "%, var(--surface)), color-mix(in oklab, var(--accent-strong) 18%, var(--surface-2)))" + '" aria-hidden="true">' + p[2] + "</span>" +
          "<span><strong>" + esc(p[0]) + "</strong><br><span class=\"muted\">" + esc(p[1]) + "</span></span></figcaption></figure>";
      }).join("") + "</div></div></section>" +
      // chamada
      '<section class="band band-solid" id="chamada"><div class="wrap cta">' +
      "<div><h2>" + esc(T("inst.ctaTitle")) + "</h2><p>" + esc(lorem) + "</p></div>" +
      '<a class="btn btn-invert" href="#/institucional">' + esc(T("inst.cta1")) + "</a>" +
      "</div></section>" +
      // contato
      '<section class="band band-b" id="contato"><div class="wrap contact-grid">' +
      '<div>' + bandHead(T("inst.contactKicker"), T("inst.contactTitle"), lorem) +
      '<ul class="contact-list">' +
      '<li>' + iconSVG("pin") + "<span>" + esc(T("inst.address")) + "</span></li>" +
      '<li>' + iconSVG("phone") + "<span>+55 (11) 0000-0000</span></li>" +
      '<li>' + iconSVG("mail") + "<span>contato@exemplo.com</span></li>" +
      '<li>' + iconSVG("clock") + "<span>" + esc(T("inst.hours")) + "</span></li>" +
      "</ul>" + placeholderHTML(11, "ph-map") + "</div>" +
      '<form class="info-card contact-form" novalidate>' +
      '<div class="form-alert success" role="status">' + esc(T("inst.sent")) + "</div>" +
      '<label class="field"><span>' + esc(T("inst.fName")) + '</span><input type="text" name="nome" autocomplete="off"></label>' +
      '<label class="field"><span>' + esc(T("inst.fEmail")) + '</span><input type="email" name="email" autocomplete="off"></label>' +
      '<label class="field"><span>' + esc(T("inst.fSubject")) + '</span><select name="assunto"><option>' + esc(T("inst.o1")) + "</option><option>" + esc(T("inst.o2")) + "</option><option>" + esc(T("inst.o3")) + "</option></select></label>" +
      '<label class="field"><span>' + esc(T("inst.fMessage")) + '</span><textarea name="mensagem" rows="4"></textarea></label>' +
      '<button type="button" data-submit class="btn btn-primary">' + esc(T("inst.send")) + "</button>" +
      "</form></div></section>"
    );
  }

  // ------------------------------------------------------------------
  // Telas de autenticação de exemplo: entrar, esqueci minha senha e nova senha.
  // O seletor de estados é o mesmo da tabela. Nada é enviado: é só demonstração.
  // ------------------------------------------------------------------

  var AUTH_STATES = [["login", "auth.sLogin", ""], ["signup", "auth.sSignup", "cadastro"], ["forgot", "auth.sForgot", "esqueci"], ["reset", "auth.sReset", "nova-senha"]];

  function authTitle(state) {
    var key = { login: "auth.loginTitle", signup: "auth.signupTitle", forgot: "auth.forgotTitle", reset: "auth.resetTitle" }[state];
    return T(key || "auth.loginTitle");
  }
  var authState = "login";
  var AUTH_COMPANY = "XPTO Ink";

  // Logo do visualizador de DS (a paleta) só em contorno, numa cor, dentro de uma moldura.
  function logoFrameHTML() {
    return (
      '<span class="logo-frame" aria-hidden="true">' +
      '<svg viewBox="0 0 64 64" width="30" height="30" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round">' +
      '<path fill-rule="evenodd" d="M32 5C16.5 5 5 16 5 30c0 13 10 23 22 23 4 0 6-2.5 6-5.5 0-3.500-2.500-4.500-2.500-7.500 0-3 2.500-5 6-5h8c8 0 13-4.500 13-11C57.500 14 47 5 32 5zM16.500 38.500a4.500 4.500 0 1 0 9 0a4.500 4.500 0 1 0-9 0z"/>' +
      '<circle cx="19" cy="22" r="4.500"/><circle cx="31" cy="15.500" r="4.500"/><circle cx="44" cy="19" r="4.500"/>' +
      '<circle cx="48.500" cy="31" r="4"/><circle cx="33" cy="30" r="4"/>' +
      "</svg></span>"
    );
  }

  function authBrandHTML() {
    return '<div class="auth-brand">' + logoFrameHTML() + '<span class="auth-company">' + esc(AUTH_COMPANY) + "</span></div>";
  }

  // Ícones simplificados (não são os logotipos oficiais).
  function oauthIconSVG(kind) {
    var shapes = {
      google: '<path d="M20 12.200c0-.6-.1-1.200-.2-1.700H12v3.300h4.500a3.900 3.900 0 0 1-1.700 2.500v2.100h2.700c1.600-1.500 2.500-3.600 2.500-6.200z" fill="currentColor" stroke="none"/><path d="M12 20.500c2.200 0 4.100-.7 5.500-2l-2.700-2.100c-.7.500-1.700.8-2.800.8-2.200 0-4-1.500-4.700-3.400H4.500v2.100A8.500 8.500 0 0 0 12 20.500z" fill="currentColor" stroke="none"/><path d="M7.300 13.800a5.100 5.100 0 0 1 0-3.600V8.100H4.500a8.500 8.500 0 0 0 0 7.800z" fill="currentColor" stroke="none"/><path d="M12 6.800c1.200 0 2.300.4 3.200 1.200l2.400-2.400A8.500 8.500 0 0 0 4.500 8.100l2.800 2.100c.7-1.900 2.500-3.400 4.700-3.400z" fill="currentColor" stroke="none"/>',
      code: '<circle cx="7" cy="6" r="2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="9" r="2"/><path d="M7 8v8"/><path d="M17 11c0 3-3 3-6 3"/>',
      windows: '<rect x="4" y="4" width="7.500" height="7.500" fill="currentColor" stroke="none"/><rect x="12.500" y="4" width="7.500" height="7.500" fill="currentColor" stroke="none"/><rect x="4" y="12.500" width="7.500" height="7.500" fill="currentColor" stroke="none"/><rect x="12.500" y="12.500" width="7.500" height="7.500" fill="currentColor" stroke="none"/>',
      people: '<circle cx="12" cy="8" r="3.500"/><path d="M5 20c0-3.800 3-6 7-6s7 2.200 7 6"/>'
    };
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + shapes[kind] + "</svg>";
  }

  function eyeSVG() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 12s3.600-7 10-7 10 7 10 7-3.600 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  }

  function pwFieldHTML(name, labelKey, autocomplete) {
    return (
      '<label class="field"><span>' + esc(T(labelKey)) + "</span>" +
      '<span class="pw"><input type="password" name="' + name + '" autocomplete="' + autocomplete + '">' +
      '<button type="button" class="pw-toggle" data-toggle-pw aria-label="' + esc(T("auth.showPw")) + '">' + eyeSVG() + "</button></span></label>"
    );
  }

  function authCardHTML(state) {
    var alertBox = '<div class="form-alert" role="alert"></div>';
    var back = '<button type="button" class="link-btn" data-auth-go="login">&larr; ' + esc(T("auth.back")) + "</button>";
    if (state === "signup") {
      return (
        authBrandHTML() +
        "<h1>" + esc(T("auth.signupTitle")) + "</h1>" +
        '<p class="muted">' + esc(T("auth.signupText")) + "</p>" +
        '<form class="auth-form" data-form="signup" novalidate>' + alertBox +
        '<label class="field"><span>' + esc(T("auth.name")) + '</span><input type="text" name="nome" autocomplete="name"></label>' +
        '<label class="field"><span>' + esc(T("auth.email")) + '</span><input type="email" name="email" autocomplete="email"></label>' +
        pwFieldHTML("senha", "auth.password", "new-password") +
        '<p class="field-hint">' + esc(T("auth.pwHint")) + "</p>" +
        '<button type="button" data-submit class="btn btn-primary">' + esc(T("auth.signupBtn")) + "</button>" +
        "</form>" +
        '<p class="mail-note">' + iconSVG("mail") + "<span>" + esc(T("auth.signupNote")) + "</span></p>" +
        '<p class="auth-foot muted">' + esc(T("auth.haveAccount")) + ' <button type="button" class="link-btn" data-auth-go="login">' + esc(T("auth.goLogin")) + "</button></p>"
      );
    }
    if (state === "forgot") {
      return (
        authBrandHTML() +
        "<h1>" + esc(T("auth.forgotTitle")) + "</h1>" +
        '<p class="muted">' + esc(T("auth.forgotText")) + "</p>" +
        '<form class="auth-form" data-form="forgot" novalidate>' + alertBox +
        '<label class="field"><span>' + esc(T("auth.email")) + '</span><input type="email" name="email" autocomplete="email"></label>' +
        '<button type="button" data-submit class="btn btn-primary">' + esc(T("auth.sendCode")) + "</button>" +
        "</form>" +
        '<p class="auth-foot" data-after hidden><button type="button" class="link-btn" data-auth-go="reset">' + esc(T("auth.haveCode")) + "</button></p>" +
        '<p class="auth-foot">' + back + "</p>"
      );
    }
    if (state === "reset") {
      var otp = "";
      for (var i = 1; i <= 6; i++) {
        otp += '<input class="otp-digit" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="' + (i === 1 ? "one-time-code" : "off") + '" aria-label="' + esc(T("auth.digit")) + " " + i + '" data-otp="' + i + '">';
      }
      return (
        authBrandHTML() +
        "<h1>" + esc(T("auth.resetTitle")) + "</h1>" +
        '<p class="muted">' + esc(T("auth.resetText")) + "</p>" +
        '<form class="auth-form" data-form="reset" novalidate>' + alertBox +
        '<fieldset class="otp-field"><legend>' + esc(T("auth.code")) + '</legend><div class="otp">' + otp + "</div></fieldset>" +
        pwFieldHTML("nova", "auth.newPw", "new-password") +
        '<ul class="reqs" aria-live="polite">' +
        '<li data-req="len">' + esc(T("auth.req1")) + "</li>" +
        '<li data-req="upper">' + esc(T("auth.req2")) + "</li>" +
        '<li data-req="num">' + esc(T("auth.req3")) + "</li></ul>" +
        pwFieldHTML("confirma", "auth.confirmPw", "new-password") +
        '<button type="button" data-submit class="btn btn-primary">' + esc(T("auth.resetBtn")) + "</button>" +
        "</form>" +
        '<p class="auth-foot muted">' + esc(T("auth.noCode")) + ' <a class="dead-link">' + esc(T("auth.resend")) + "</a></p>" +
        '<p class="auth-foot">' + back + "</p>"
      );
    }
    // login
    return (
      authBrandHTML() +
      "<h1>" + esc(T("auth.loginTitle")) + "</h1>" +
      '<p class="muted">' + esc(T("auth.loginText")) + "</p>" +
      '<form class="auth-form" data-form="login" novalidate>' + alertBox +
      '<label class="field"><span>' + esc(T("auth.email")) + '</span><input type="email" name="email" autocomplete="username"></label>' +
      pwFieldHTML("senha", "auth.password", "current-password") +
      '<div class="auth-row"><label class="choice-item"><input type="checkbox" name="lembrar"> ' + esc(T("auth.remember")) + "</label>" +
      '<button type="button" class="link-btn" data-auth-go="forgot">' + esc(T("auth.forgotLink")) + "</button></div>" +
      '<button type="button" data-submit class="btn btn-primary">' + esc(T("auth.signin")) + "</button>" +
      "</form>" +
      '<div class="divider"><span>' + esc(T("auth.or")) + "</span></div>" +
      '<div class="oauth-row">' +
      [["google", "Google"], ["code", "GitHub"], ["windows", "Microsoft"]].map(function (o) {
        var label = T("auth.continueWith") + " " + o[1];
        return '<button type="button" class="btn btn-ghost oauth" aria-label="' + esc(label) + '" title="' + esc(label) + '">' + oauthIconSVG(o[0]) + "</button>";
      }).join("") +
      "</div>" +
      '<p class="sso"><button type="button" class="link-btn sso-link">' + esc(T("auth.continueWith")) + " SSO</button></p>" +
      '<p class="auth-foot muted">' + esc(T("auth.noAccount")) + ' <button type="button" class="link-btn" data-auth-go="signup">' + esc(T("auth.create")) + "</button></p>"
    );
  }

  function authHTML(state) {
    return (
      '<section class="auth">' +
      '<div class="auth-aside"><div class="auth-aside-sticky">' +
      '<div class="auth-aside-controls">' +
      '<fieldset class="state-switch" id="authStates"><legend class="sr-only">' + esc(T("auth.state")) + "</legend>" +
      AUTH_STATES.map(function (st) {
        return '<label class="state-opt"><input type="radio" name="authState" value="' + st[0] + '"' + (st[0] === state ? " checked" : "") + "><span>" + esc(T(st[1])) + "</span></label>";
      }).join("") +
      "</fieldset>" +
      '<div class="form-alert show warning auth-demo" role="note">' + esc(T("auth.demoNote")) + "</div>" +
      "</div>" +
      '<div class="auth-aside-inner" aria-hidden="true">' + logoFrameHTML() +
      "<blockquote>" + esc(T("inst.lorem")) + "</blockquote>" +
      '<p class="auth-aside-by">' + esc(AUTH_COMPANY) + " · Lorem Ipsum</p></div></div></div>" +
      '<div class="auth-main">' +
      '<div class="auth-card" id="authCard">' + authCardHTML(state) + "</div>" +
      "</div></section>"
    );
  }

  function authSlug(state) {
    for (var i = 0; i < AUTH_STATES.length; i++) if (AUTH_STATES[i][0] === state) return AUTH_STATES[i][2];
    return "";
  }

  function authFromSlug(slug) {
    for (var i = 0; i < AUTH_STATES.length; i++) if (AUTH_STATES[i][2] === slug) return AUTH_STATES[i][0];
    return null;
  }

  function authMount() {
    var card = document.getElementById("authCard");
    var states = document.getElementById("authStates");
    if (!card || !states) return;

    function show(state) {
      authState = state;
      card.innerHTML = authCardHTML(state);
      var radio = states.querySelector('input[value="' + state + '"]');
      if (radio) radio.checked = true;
      // atualiza o endereço sem refazer a rota
      try { history.replaceState(null, "", "#/entrar" + (authSlug(state) ? "/" + authSlug(state) : "")); } catch (e) {}
      setTitle(authTitle(state));
    }

    function banner(form, kind, message) {
      var box = form.querySelector(".form-alert");
      box.className = "form-alert show " + kind;
      box.textContent = message;
    }

    function clearErrors(form) {
      form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
      form.querySelectorAll(".field .error, .otp-field .error").forEach(function (el) { el.remove(); });
    }

    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function updateReqs(form) {
      var pw = form.elements.nova ? form.elements.nova.value : "";
      var ok = { len: pw.length >= 8, upper: /[A-Z]/.test(pw), num: /\d/.test(pw) };
      form.querySelectorAll("[data-req]").forEach(function (li) {
        li.classList.toggle("is-ok", !!ok[li.getAttribute("data-req")]);
      });
      return ok;
    }

    states.addEventListener("change", function (e) {
      if (e.target.name === "authState") show(e.target.value);
    });

    card.addEventListener("click", function (e) {
      var go = e.target.closest("[data-auth-go]");
      if (go) { show(go.getAttribute("data-auth-go")); return; }
      var tg = e.target.closest("[data-toggle-pw]");
      if (tg) {
        var input = tg.parentElement.querySelector("input");
        var hidden = input.type === "password";
        input.type = hidden ? "text" : "password";
        tg.setAttribute("aria-label", T(hidden ? "auth.hidePw" : "auth.showPw"));
      }
    });

    card.addEventListener("input", function (e) {
      var t = e.target;
      if (t.classList && t.classList.contains("otp-digit")) {
        t.value = t.value.replace(/\D/g, "").slice(0, 1);
        var next = t.nextElementSibling;
        if (t.value && next) next.focus();
      }
      var form = t.closest && t.closest("form");
      if (form && form.getAttribute("data-form") === "reset") updateReqs(form);
    });

    card.addEventListener("keydown", function (e) {
      var t = e.target;
      if (t.classList && t.classList.contains("otp-digit") && e.key === "Backspace" && !t.value && t.previousElementSibling) {
        t.previousElementSibling.focus();
      }
    });

    // colar o código inteiro distribui os dígitos
    card.addEventListener("paste", function (e) {
      var t = e.target;
      if (!(t.classList && t.classList.contains("otp-digit"))) return;
      var digits = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 6);
      if (!digits) return;
      e.preventDefault();
      var boxes = card.querySelectorAll(".otp-digit");
      for (var i = 0; i < boxes.length; i++) boxes[i].value = digits.charAt(i) || "";
      var last = Math.min(digits.length, boxes.length) - 1;
      if (boxes[last]) boxes[last].focus();
    });

    card.addEventListener("submit", function (e) {
      e.preventDefault();
      var form = e.target;
      var kind = form.getAttribute("data-form");
      clearErrors(form);
      var bad = [];
      function fail(input, key) { setFieldError(input, T(key)); bad.push(input); }

      if (kind === "login") {
        if (!form.elements.email.value.trim()) fail(form.elements.email, "frm.required");
        else if (!EMAIL.test(form.elements.email.value)) fail(form.elements.email, "frm.emailErr");
        if (!form.elements.senha.value) fail(form.elements.senha, "frm.required");
        if (bad.length) { banner(form, "error", T("frm.review")); bad[0].focus(); return; }
        banner(form, "success", T("auth.loginOk"));
      } else if (kind === "signup") {
        if (!form.elements.nome.value.trim()) fail(form.elements.nome, "frm.required");
        var mail = form.elements.email;
        if (!mail.value.trim()) fail(mail, "frm.required");
        else if (!EMAIL.test(mail.value)) fail(mail, "frm.emailErr");
        if (!form.elements.senha.value) fail(form.elements.senha, "frm.required");
        else if (form.elements.senha.value.length < 8) fail(form.elements.senha, "auth.pwShort");
        if (bad.length) { banner(form, "error", T("frm.review")); bad[0].focus(); return; }
        banner(form, "success", T("auth.signupOk").replace("{email}", mail.value.trim()));
      } else if (kind === "forgot") {
        var em = form.elements.email;
        if (!em.value.trim()) fail(em, "frm.required");
        else if (!EMAIL.test(em.value)) fail(em, "frm.emailErr");
        if (bad.length) { banner(form, "error", T("frm.review")); em.focus(); return; }
        banner(form, "success", T("auth.codeSent"));
        var after = card.querySelector("[data-after]");
        if (after) after.hidden = false;
      } else if (kind === "reset") {
        var digits = Array.prototype.map.call(form.querySelectorAll(".otp-digit"), function (i) { return i.value; }).join("");
        var firstEmpty = Array.prototype.filter.call(form.querySelectorAll(".otp-digit"), function (i) { return !i.value; })[0];
        if (digits.length < 6 && firstEmpty) {
          firstEmpty.setAttribute("aria-invalid", "true");
          var legend = form.querySelector(".otp-field");
          var err = document.createElement("span");
          err.className = "error";
          err.textContent = T("auth.codeErr");
          legend.appendChild(err);
          bad.push(firstEmpty);
        }
        var ok = updateReqs(form);
        if (!(ok.len && ok.upper && ok.num)) fail(form.elements.nova, "auth.pwWeak");
        if (form.elements.confirma.value !== form.elements.nova.value || !form.elements.confirma.value) fail(form.elements.confirma, "auth.pwMismatch");
        if (bad.length) { banner(form, "error", T("frm.review")); bad[0].focus(); return; }
        banner(form, "success", T("auth.resetOk"));
      }
    });
  }

  // ------------------------------------------------------------------
  // Páginas do rodapé: licenças e privacidade. Usam o mesmo contêiner das outras telas,
  // então o tema selecionado vale para elas também.
  // ------------------------------------------------------------------

  var MIT_TEXT = [
    "MIT License",
    "",
    "Copyright (c) 2026 Jonas Sene Torres",
    "",
    "Permission is hereby granted, free of charge, to any person obtaining a copy",
    'of this software and associated documentation files (the "Software"), to deal',
    "in the Software without restriction, including without limitation the rights",
    "to use, copy, modify, merge, publish, distribute, sublicense, and/or sell",
    "copies of the Software, and to permit persons to whom the Software is",
    "furnished to do so, subject to the following conditions:",
    "",
    "The above copyright notice and this permission notice shall be included in all",
    "copies or substantial portions of the Software.",
    "",
    'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR',
    "IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,",
    "FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE",
    "AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER",
    "LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,",
    "OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE",
    "SOFTWARE."
  ].join("\n");

  function extLink(href, text) {
    return '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(text) +
      '<svg class="ext-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>' +
      '<span class="sr-only"> ' + esc(T("home.newWindow")) + "</span></a>";
  }

  function legalHead(kicker, title, lede) {
    return (
      '<div class="page-head">' +
      '<span class="kicker">' + esc(kicker) + "</span>" +
      "<h1>" + esc(title) + "</h1>" +
      '<p class="lede">' + esc(lede) + "</p>" +
      "</div>"
    );
  }

  function licensesHTML() {
    return (
      legalHead(T("footer.lic"), T("lic.title"), T("lic.lede")) +
      '<div class="legal">' +
      "<section><h2>" + esc(T("lic.codeTitle")) + "</h2><p>" + esc(T("lic.codeText")) + "</p>" +
      "<details><summary>" + esc(T("lic.mitText")) + "</summary><pre>" + esc(MIT_TEXT) + "</pre></details></section>" +
      "<section><h2>" + esc(T("lic.catTitle")) + "</h2><p>" + esc(T("lic.catText")) + "</p><p>" + esc(T("lic.catChanges")) + "</p>" +
      '<ul class="legal-links">' +
      "<li>" + extLink("https://open-design.ai/plugins/systems/", T("lic.linkDocs")) + "</li>" +
      "<li>" + extLink("https://github.com/nexu-io/open-design", T("lic.linkRepo")) + "</li>" +
      "<li>" + extLink("https://www.apache.org/licenses/LICENSE-2.0", T("lic.linkApache")) + "</li></ul></section>" +
      "<section><h2>" + esc(T("lic.fontsTitle")) + "</h2><p>" + esc(T("lic.fontsText")) + "</p><p>" + esc(T("lic.fontsProp")) + "</p>" +
      '<ul class="legal-links"><li>' + extLink("https://fonts.google.com/attribution", T("lic.fontsLink")) + "</li></ul></section>" +
      "<section><h2>" + esc(T("lic.brandsTitle")) + "</h2><p>" + esc(T("lic.brandsText")) + "</p></section>" +
      "<section><h2>" + esc(T("lic.uiTitle")) + "</h2><p>" + esc(T("lic.uiText")) + "</p><p>" + esc(T("lic.sample")) + "</p></section>" +
      "</div>"
    );
  }

  function privacyHTML() {
    return (
      legalHead(T("footer.priv"), T("pri.title"), T("pri.lede")) +
      '<div class="legal">' +
      "<section><h2>" + esc(T("pri.s1Title")) + "</h2><p>" + esc(T("pri.s1Text")) + "</p></section>" +
      "<section><h2>" + esc(T("pri.s2Title")) + "</h2><p>" + esc(T("pri.s2Text")) + "</p>" +
      "<ul><li>" + esc(T("pri.li1")) + "</li><li>" + esc(T("pri.li2")) + "</li><li>" + esc(T("pri.li3")) + "</li></ul>" +
      "<p>" + esc(T("pri.s2Note")) + "</p></section>" +
      "<section><h2>" + esc(T("pri.s3Title")) + "</h2><p>" + esc(T("pri.s3Text")) + "</p></section>" +
      "<section><h2>" + esc(T("pri.s4Title")) + "</h2><p>" + esc(T("pri.s4Text")) + "</p></section>" +
      "<section><h2>" + esc(T("pri.s5Title")) + "</h2><p>" + esc(T("pri.s5Text")) + '</p><p class="muted">' + esc(T("pri.s5Note")) + "</p></section>" +
      "</div>"
    );
  }

  // ---- menu "Exemplos" do cabeçalho
  var examplesBtn = document.getElementById("examplesBtn");
  var examplesMenu = document.getElementById("examplesMenu");
  var EXAMPLE_ROUTES = ["/entrar", "/institucional", "/blog", "/tabela", "/formulario", "/dashboard", "/loja"];

  function openExamples() {
    examplesMenu.hidden = false;
    examplesBtn.setAttribute("aria-expanded", "true");
  }

  function closeExamples(restoreFocus) {
    if (!examplesMenu || examplesMenu.hidden) return;
    examplesMenu.hidden = true;
    examplesBtn.setAttribute("aria-expanded", "false");
    if (restoreFocus) examplesBtn.focus();
  }

  if (examplesBtn && examplesMenu) {
    examplesBtn.addEventListener("click", function () {
      if (examplesMenu.hidden) openExamples(); else closeExamples(false);
    });
    examplesBtn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        openExamples();
        var first = examplesMenu.querySelector("a");
        if (first) first.focus();
      } else if (e.key === "Escape") {
        closeExamples(false);
      }
    });
    examplesMenu.addEventListener("keydown", function (e) {
      var links = Array.prototype.slice.call(examplesMenu.querySelectorAll("a"));
      var i = links.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); links[(i + 1) % links.length].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
      else if (e.key === "Escape") { e.preventDefault(); closeExamples(true); }
      else if (e.key === "Tab") { closeExamples(false); }
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-menu")) closeExamples(false);
    });
  }

  // "Informações do tema" leva à página do tema escolhido.
  function updateThemeLink() {
    var link = document.getElementById("navTheme");
    if (link) link.setAttribute("href", "#/design-system/" + encodeURIComponent(currentTheme));
  }

  function setActiveNav(route) {
    function mark(link, on) {
      if (on) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    document.querySelectorAll(".main-nav > a").forEach(function (link) {
      var href = link.getAttribute("href").replace("#", "");
      mark(link, link.id === "navTheme" ? route.indexOf("/design-system") === 0 : href === route);
    });
    var inExamples = false;
    document.querySelectorAll("#examplesMenu a").forEach(function (link) {
      var href = link.getAttribute("href").replace("#", "");
      var on = route === href || route.indexOf(href + "/") === 0;
      if (on) inExamples = true;
      mark(link, on);
    });
    if (examplesBtn) mark(examplesBtn, inExamples);
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
    closeExamples(false);
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
      setActiveNav("/design-system");
    } else if (hash === "/entrar" || hash.indexOf("/entrar/") === 0) {
      var wanted = authFromSlug(hash.replace(/^\/entrar\/?/, ""));
      if (hash !== "/entrar" && hash !== "/entrar/" && !wanted) {
        app.innerHTML = page(notFoundHTML(), [[T("nav.signin"), "#/entrar"], [T("nf.title")]]);
        setTitle(T("nf.title"));
      } else {
        authState = wanted || "login";
        app.innerHTML = authHTML(authState);
        setTitle(authTitle(authState));
        authMount();
      }
      setActiveNav("/entrar");
    } else if (hash === "/licencas") {
      app.innerHTML = page(licensesHTML(), [[T("footer.lic")]]);
      setTitle(T("lic.title"));
      setActiveNav("");
    } else if (hash === "/privacidade") {
      app.innerHTML = page(privacyHTML(), [[T("footer.priv")]]);
      setTitle(T("pri.title"));
      setActiveNav("");
    } else if (hash === "/institucional") {
      app.innerHTML = institutionalHTML();
      setTitle(T("nav.institutional"));
      setActiveNav("/institucional");
    } else if (hash === "/dashboard") {
      app.innerHTML = page(dashboardHTML(), [[T("nav.dashboard")]]);
      setTitle(T("nav.dashboard"));
      setActiveNav("/dashboard");
    } else if (hash === "/loja" || hash.indexOf("/loja/") === 0) {
      var catId = hash.indexOf("/loja/") === 0 ? hash.replace("/loja/", "") : "";
      var known = SHOP_CATS.some(function (c) { return c.id === catId; });
      if (catId && !known) {
        app.innerHTML = page(notFoundHTML(), [[T("nav.shop"), "#/loja"], [T("nf.title")]]);
        setTitle(T("nf.title"));
      } else {
        app.innerHTML = page(shopHTML(catId), catId ? [[T("nav.shop"), "#/loja"], [shopCatName(catId)]] : [[T("nav.shop")]]);
        setTitle(catId ? shopCatName(catId) + " · " + T("nav.shop") : T("nav.shop"));
        shopMount();
      }
      setActiveNav("/loja");
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

  // ---- altura do cabeçalho em --header-h (usada pelo painel fixo das telas de login) ----
  function updateHeaderHeight() {
    var header = document.querySelector(".site-header");
    if (header) document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
  }
  updateHeaderHeight();
  window.addEventListener("resize", updateHeaderHeight);
  if (window.ResizeObserver && document.querySelector(".site-header")) {
    new ResizeObserver(updateHeaderHeight).observe(document.querySelector(".site-header"));
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
