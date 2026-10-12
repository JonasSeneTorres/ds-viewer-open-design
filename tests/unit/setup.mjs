// Ambiente mínimo para importar os módulos de assets/js/ no Node: eles leem document, localStorage e navigator
// ao carregar. Importe este arquivo ANTES do módulo testado.
const store = new Map();

globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => { store.set(k, String(v)); },
  removeItem: (k) => { store.delete(k); },
  clear: () => store.clear(),
};
globalThis.sessionStorage = globalThis.localStorage;
globalThis.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
  documentElement: { setAttribute() {}, getAttribute: () => null },
};
globalThis.window = globalThis;
globalThis.location = { hash: "", search: "", href: "http://localhost/" };

// idioma da interface: fixo em pt-BR para os testes serem determinísticos
store.set("odv-lang", "pt-BR");

export const storage = store;
