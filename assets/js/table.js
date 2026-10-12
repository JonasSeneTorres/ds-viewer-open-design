// Tabela CRUD de exemplo e seus diálogos.

import { records, saveRecords, setRecords } from "./content.js";
import { T, UI } from "./i18n.js";
import { page } from "./layout.js";
import { mountPagination, paginationHTML, showToast, tipWrap } from "./ui.js";
import { esc, formatDate } from "./util.js";


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
    "</div>" +
    '<div class="table-pagination" id="tablePagination"></div>'
  );
}


// Estado da tabela de exemplo: dados, carregando, vazio ou erro (para ver cada estado no tema).
var tableState = "data";

var loadTimer = null;

// Paginação da tabela: 5 registros por página
var PAGE_SIZE = 5;
var tablePage = 1;


function resetTableState() {
  tableState = "data";
}


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
    (deprecated
      ? tipWrap('<button type="button" class="btn btn-success btn-small" data-action="edit" aria-disabled="true" aria-describedby="depTip' + r.id + '">' + esc(T("edit")) + "</button>",
        "depTip" + r.id, T("tbl.depTip"), { below: true })
      : '<button type="button" class="btn btn-success btn-small" data-action="edit">' + esc(T("edit")) + "</button>") +
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
    var pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
    if (tablePage > pages) tablePage = pages;
    body.innerHTML = shown.slice((tablePage - 1) * PAGE_SIZE, tablePage * PAGE_SIZE).map(rowHTML).join("");
  }
  var pag = document.getElementById("tablePagination");
  if (pag) {
    var total = Math.ceil(shown.length / PAGE_SIZE);
    pag.innerHTML = tableState === "data" && total > 1 ? paginationHTML(tablePage, total) : "";
  }
  if (count) {
    count.textContent = shown.length + " " + (shown.length === 1 ? T("tbl.one") : T("tbl.many"));
  }
}


function setTableState(next) {
  tablePage = 1;
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
      if (!btn || btn.disabled || btn.getAttribute("aria-disabled") === "true") return;
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
  var pagBox = document.getElementById("tablePagination");
  if (pagBox) {
    mountPagination(pagBox, function () {
      return { cur: tablePage, total: Math.max(1, Math.ceil(records.length / PAGE_SIZE)) };
    }, function (n) {
      tablePage = n;
      paintRows();
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
    setRecords(records.map(function (r) {
      return r.id === Number(id) ? Object.assign({}, r, data) : r;
    }));
  } else {
    data.id = nextId();
    setRecords(records.concat([data]));
    tablePage = Math.ceil(records.length / PAGE_SIZE); // o novo registro entra no fim: vai para a página dele
  }
  saveRecords();
  paintRows();
  recordDialog.close();
  showToast("ok", T(id ? "tbl.toastUpdated" : "tbl.toastSaved"));
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
  setRecords(records.filter(function (r) { return r.id !== pendingDelete.id; }));
  pendingDelete = null;
  saveRecords();
  paintRows();
  confirmDialog.close();
  showToast("ok", T("tbl.toastDeleted"));
});

confirmDialog.querySelectorAll("[data-close]").forEach(function (btn) {
  btn.addEventListener("click", function () { confirmDialog.close(); });
});

[recordDialog, confirmDialog].forEach(function (dlg) {
  dlg.addEventListener("click", function (e) {
    if (e.target === dlg) dlg.close();
  });
});

export { catLabel, clearFieldError, loadTimer, resetTableState, setFieldError, tableMount, tablePageHTML };
