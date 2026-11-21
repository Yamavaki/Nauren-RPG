// Foundry "de mentira" para rodar os módulos do Nauren no Node (tools/testes). Nenhum hook roda sozinho.
export const hooks = { on: [], once: [] };
function universal(nome) {
  const alvo = function () {};
  alvo.prototype = {};
  return new Proxy(alvo, {
    get(t, p) {
      if (p === "prototype") return t.prototype;
      if (p === Symbol.toPrimitive) return () => 0;
      if (p === Symbol.iterator) return undefined;
      if (p === "then") return undefined;
      if (typeof p === "symbol") return undefined;
      if (!(p in t)) t[p] = universal(`${nome}.${String(p)}`);
      return t[p];
    },
    set(t, p, v) { t[p] = v; return true; },
    has() { return true; },
    apply(t, th, args) {
      if (/Mixin$/.test(nome)) return class MixinBase { static DEFAULT_OPTIONS = {}; static PARTS = {}; };
      return universal(`${nome}()`);
    },
    construct(t, args, nt) {
      const curto = nome.split(".").pop();
      if (/Field$/.test(curto)) return { __campo: curto, args };
      return Reflect.construct(function () {}, [], nt === undefined ? Object : nt);
    }
  });
}
class TypeDataModel { static defineSchema() { return {}; } }
class Basica { static DEFAULT_OPTIONS = {}; static PARTS = {}; }
const f = universal("foundry");
f.abstract.TypeDataModel = TypeDataModel;
f.abstract.DataModel = TypeDataModel;
globalThis.foundry = f;
globalThis.Hooks = { on: (n, fn) => { hooks.on.push([n, fn]); return 1; }, once: (n, fn) => { hooks.once.push([n, fn]); return 1; }, off() {}, call() { return true; }, callAll() { return true; } };
for (const g of ["game", "canvas", "ui", "CONFIG", "CONST", "PIXI", "Handlebars", "Sequencer", "ChatMessage", "Roll", "Actor", "Item", "Folder", "Scene", "Macro", "JournalEntry", "CompendiumCollection", "TokenDocument", "Token"]) globalThis[g] = universal(g);
globalThis.window = globalThis; globalThis.document = universal("document"); globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.HTMLElement = class {}; globalThis.customElements = { define() {}, get() {} }; globalThis.CSS = { escape: s => s, supports: () => false };
globalThis.requestAnimationFrame = () => 0; globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.fromUuid = async () => null; globalThis.fromUuidSync = () => null; globalThis.getDocumentClass = () => universal("DocClass");
globalThis.Image = class {}; globalThis.MutationObserver = class { observe() {} disconnect() {} }; globalThis.ResizeObserver = class { observe() {} disconnect() {} };
globalThis.navigator ??= { userAgent: "node" };

// utilidades de verdade (os testes dependem delas)
const getProperty = (o, k) => String(k).split(".").reduce((c, x) => c?.[x], o);
const setProperty = (o, k, v) => { const p = String(k).split("."); let c = o; for (const x of p.slice(0, -1)) { if (c[x] === undefined || c[x] === null || typeof c[x] !== "object") c[x] = {}; c = c[x]; } c[p.at(-1)] = v; return true; };
let seq = 0;
Object.assign(f.utils, {
  deepClone: v => v === undefined ? v : JSON.parse(JSON.stringify(v)),
  getProperty, setProperty, hasProperty: (o, k) => getProperty(o, k) !== undefined,
  randomID: (n = 16) => `id${String(++seq).padStart(Math.max(1, n - 2), "0")}`.slice(-n),
  debounce: fn => fn,
  escapeHTML: s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])),
  mergeObject: (a, b) => Object.assign(a ?? {}, b ?? {}),
  expandObject: o => { const r = {}; for (const [k, v] of Object.entries(o ?? {})) setProperty(r, k, v); return r; }
});
f.applications.ux.TextEditor = { implementation: { enrichHTML: async h => h } };
globalThis.game.settings = { get: () => true, set: async () => true, register() {} };
globalThis.game.user = { isGM: true, id: "mestre", name: "Mestre", flags: {} };
