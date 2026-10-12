// Formulário com um campo de cada tipo.

import { CATEGORIES } from "./content.js";
import { T } from "./i18n.js";
import { page } from "./layout.js";
import { catLabel, clearFieldError, setFieldError } from "./table.js";
import { esc } from "./util.js";


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

export { formPageHTML, initDemoForm };
