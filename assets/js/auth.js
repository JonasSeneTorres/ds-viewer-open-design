// Telas de autenticação de exemplo.

import { T } from "./i18n.js";
import { iconSVG } from "./institutional.js";
import { setTitle } from "./layout.js";
import { setFieldError } from "./table.js";
import { tipWrap } from "./ui.js";
import { esc } from "./util.js";


// ------------------------------------------------------------------
// Telas de autenticação de exemplo: entrar, esqueci minha senha e nova senha.
// O seletor de estados é o mesmo da tabela. Nada é enviado: é só demonstração.
// ------------------------------------------------------------------

const AUTH_STATES = [["login", "auth.sLogin", ""], ["signup", "auth.sSignup", "cadastro"], ["forgot", "auth.sForgot", "esqueci"], ["reset", "auth.sReset", "nova-senha"]];


function authTitle(state) {
  const key = { login: "auth.loginTitle", signup: "auth.signupTitle", forgot: "auth.forgotTitle", reset: "auth.resetTitle" }[state];
  return T(key || "auth.loginTitle");
}

let authState = "login";


function setAuthState(next) {
  authState = next;
}

const AUTH_COMPANY = "XPTO Inc.";


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
  const shapes = {
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
  const alertBox = '<div class="form-alert" role="alert"></div>';
  const back = '<button type="button" class="link-btn" data-auth-go="login">&larr; ' + esc(T("auth.back")) + "</button>";
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
    let otp = "";
    for (let i = 1; i <= 6; i++) {
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
      const label = T("auth.continueWith") + " " + o[1];
      return tipWrap('<button type="button" class="btn btn-ghost oauth" aria-label="' + esc(label) + '">' + oauthIconSVG(o[0]) + "</button>",
        "oauthTip-" + o[0], label, { label: true, below: true });
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
  for (let i = 0; i < AUTH_STATES.length; i++) if (AUTH_STATES[i][0] === state) return AUTH_STATES[i][2];
  return "";
}


function authFromSlug(slug) {
  for (let i = 0; i < AUTH_STATES.length; i++) if (AUTH_STATES[i][2] === slug) return AUTH_STATES[i][0];
  return null;
}


function authMount() {
  const card = document.getElementById("authCard");
  const states = document.getElementById("authStates");
  if (!card || !states) return;

  function show(state) {
    authState = state;
    card.innerHTML = authCardHTML(state);
    const radio = states.querySelector('input[value="' + state + '"]');
    if (radio) radio.checked = true;
    // atualiza o endereço sem refazer a rota
    try { history.replaceState(null, "", "#/entrar" + (authSlug(state) ? "/" + authSlug(state) : "")); } catch (e) {}
    setTitle(authTitle(state));
  }

  function banner(form, kind, message) {
    const box = form.querySelector(".form-alert");
    box.className = "form-alert show " + kind;
    box.textContent = message;
  }

  function clearErrors(form) {
    form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
    form.querySelectorAll(".field .error, .otp-field .error").forEach(function (el) { el.remove(); });
  }

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function updateReqs(form) {
    const pw = form.elements.nova ? form.elements.nova.value : "";
    const ok = { len: pw.length >= 8, upper: /[A-Z]/.test(pw), num: /\d/.test(pw) };
    form.querySelectorAll("[data-req]").forEach(function (li) {
      li.classList.toggle("is-ok", !!ok[li.getAttribute("data-req")]);
    });
    return ok;
  }

  states.addEventListener("change", function (e) {
    if (e.target.name === "authState") show(e.target.value);
  });

  card.addEventListener("click", function (e) {
    const go = e.target.closest("[data-auth-go]");
    if (go) { show(go.getAttribute("data-auth-go")); return; }
    const tg = e.target.closest("[data-toggle-pw]");
    if (tg) {
      const input = tg.parentElement.querySelector("input");
      const hidden = input.type === "password";
      input.type = hidden ? "text" : "password";
      tg.setAttribute("aria-label", T(hidden ? "auth.hidePw" : "auth.showPw"));
    }
  });

  card.addEventListener("input", function (e) {
    const t = e.target;
    if (t.classList && t.classList.contains("otp-digit")) {
      t.value = t.value.replace(/\D/g, "").slice(0, 1);
      const next = t.nextElementSibling;
      if (t.value && next) next.focus();
    }
    const form = t.closest && t.closest("form");
    if (form && form.getAttribute("data-form") === "reset") updateReqs(form);
  });

  card.addEventListener("keydown", function (e) {
    const t = e.target;
    if (t.classList && t.classList.contains("otp-digit") && e.key === "Backspace" && !t.value && t.previousElementSibling) {
      t.previousElementSibling.focus();
    }
  });

  // colar o código inteiro distribui os dígitos
  card.addEventListener("paste", function (e) {
    const t = e.target;
    if (!(t.classList && t.classList.contains("otp-digit"))) return;
    const digits = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    e.preventDefault();
    const boxes = card.querySelectorAll(".otp-digit");
    for (let i = 0; i < boxes.length; i++) boxes[i].value = digits.charAt(i) || "";
    const last = Math.min(digits.length, boxes.length) - 1;
    if (boxes[last]) boxes[last].focus();
  });

  card.addEventListener("submit", function (e) {
    e.preventDefault();
    const form = e.target;
    const kind = form.getAttribute("data-form");
    clearErrors(form);
    const bad = [];
    function fail(input, key) { setFieldError(input, T(key)); bad.push(input); }

    if (kind === "login") {
      if (!form.elements.email.value.trim()) fail(form.elements.email, "frm.required");
      else if (!EMAIL.test(form.elements.email.value)) fail(form.elements.email, "frm.emailErr");
      if (!form.elements.senha.value) fail(form.elements.senha, "frm.required");
      if (bad.length) { banner(form, "error", T("frm.review")); bad[0].focus(); return; }
      banner(form, "success", T("auth.loginOk"));
    } else if (kind === "signup") {
      if (!form.elements.nome.value.trim()) fail(form.elements.nome, "frm.required");
      const mail = form.elements.email;
      if (!mail.value.trim()) fail(mail, "frm.required");
      else if (!EMAIL.test(mail.value)) fail(mail, "frm.emailErr");
      if (!form.elements.senha.value) fail(form.elements.senha, "frm.required");
      else if (form.elements.senha.value.length < 8) fail(form.elements.senha, "auth.pwShort");
      if (bad.length) { banner(form, "error", T("frm.review")); bad[0].focus(); return; }
      banner(form, "success", T("auth.signupOk").replace("{email}", mail.value.trim()));
    } else if (kind === "forgot") {
      const em = form.elements.email;
      if (!em.value.trim()) fail(em, "frm.required");
      else if (!EMAIL.test(em.value)) fail(em, "frm.emailErr");
      if (bad.length) { banner(form, "error", T("frm.review")); em.focus(); return; }
      banner(form, "success", T("auth.codeSent"));
      const after = card.querySelector("[data-after]");
      if (after) after.hidden = false;
    } else if (kind === "reset") {
      const digits = Array.prototype.map.call(form.querySelectorAll(".otp-digit"), function (i) { return i.value; }).join("");
      const firstEmpty = Array.prototype.filter.call(form.querySelectorAll(".otp-digit"), function (i) { return !i.value; })[0];
      if (digits.length < 6 && firstEmpty) {
        firstEmpty.setAttribute("aria-invalid", "true");
        const legend = form.querySelector(".otp-field");
        const err = document.createElement("span");
        err.className = "error";
        err.textContent = T("auth.codeErr");
        legend.appendChild(err);
        bad.push(firstEmpty);
      }
      const ok = updateReqs(form);
      if (!(ok.len && ok.upper && ok.num)) fail(form.elements.nova, "auth.pwWeak");
      if (form.elements.confirma.value !== form.elements.nova.value || !form.elements.confirma.value) fail(form.elements.confirma, "auth.pwMismatch");
      if (bad.length) { banner(form, "error", T("frm.review")); bad[0].focus(); return; }
      banner(form, "success", T("auth.resetOk"));
    }
  });
}

export { authFromSlug, authHTML, authMount, authState, authTitle, setAuthState };
