// Comportamentos globais dos formulários de exemplo.

import { app } from "./util.js";


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
