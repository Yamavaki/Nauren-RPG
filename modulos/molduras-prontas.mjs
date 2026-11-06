/**
 * Nauren RPG — molduras prontas do Mestre, favoritas, recentes e moldura automática por disposição.
 *
 * Uma "pronta" guarda só o visual da borda (modelo, cores, efeitos, reações...), nunca a imagem do
 * personagem nem o enquadramento: ao aplicar, cada token continua com a própria arte.
 * O formato é o mesmo do "Exportar" da janela da borda ({ sistema: "nauren", tipo: "bordaToken", ... }).
 */
import { naurenMolduraNormalizar, naurenMolduraModelo } from "./molduras-modelos.mjs";
import { naurenMolduraPrepararPrevia } from "./molduras-token.mjs";
import { naurenBordaConfig, naurenBordaAplicar, naurenBordaCarregarImagem, naurenBordaPedraConfig, NAUREN_BORDA_EFEITOS } from "./borda-token.mjs";

const SIS = "nauren";
const MAX_RECENTES = 12;

/* ------------------------------ configurações ------------------------------ */
export function naurenMoldurasProntasInit() {
  game.settings.register(SIS, "moldurasProntas", { scope: "world", config: false, type: Array, default: [] });
  game.settings.register(SIS, "moldurasAutomaticas", { scope: "world", config: false, type: Object, default: { hostil: "", neutro: "", amistoso: "", secreto: "", soNaoVinculados: true } });
  game.settings.register(SIS, "moldurasFavoritas", { scope: "client", config: false, type: Array, default: [] });
  game.settings.register(SIS, "moldurasRecentes", { scope: "client", config: false, type: Array, default: [] });
}
const ler = (k, padrao) => { try { return game.settings.get(SIS, k) ?? padrao; } catch (err) { return padrao; } };

/* ------------------------------ prontas ------------------------------ */
export function naurenProntasLista() { const l = ler("moldurasProntas", []); return Array.isArray(l) ? l.filter(p => p?.id && p?.dados) : []; }
export function naurenProntaPorId(id) { return naurenProntasLista().find(p => p.id === id) ?? null; }

/** Só o visual (o mesmo que o Exportar grava). */
export function naurenProntaDados(e) {
  return {
    sistema: "nauren", tipo: "bordaToken", modelo: e.modelo, cores: [...(e.cores ?? [])], corFundo: e.corFundo, corDano: e.corDano, corCura: e.corCura,
    efeitos: [...(e.efeitos ?? [])], arte: e.arte, borda: e.borda, pedra: e.pedra ? { ...e.pedra } : null, recorte: e.recorte,
    moldura: e.moldura ? naurenMolduraNormalizar(e.moldura) : null
  };
}
export async function naurenProntaSalvar(nome, dados) {
  if (!game.user?.isGM) throw new Error("só o Mestre");
  const lista = naurenProntasLista();
  const p = { id: foundry.utils.randomID(), nome: String(nome || "Moldura").trim().slice(0, 40) || "Moldura", dados: foundry.utils.deepClone(dados), criada: Date.now() };
  lista.push(p); await game.settings.set(SIS, "moldurasProntas", lista);
  return p;
}
export async function naurenProntaRenomear(id, nome) {
  if (!game.user?.isGM) return;
  const lista = naurenProntasLista(), p = lista.find(x => x.id === id); if (!p) return;
  p.nome = String(nome || p.nome).trim().slice(0, 40) || p.nome; await game.settings.set(SIS, "moldurasProntas", lista);
}
export async function naurenProntaApagar(id) {
  if (!game.user?.isGM) return;
  await game.settings.set(SIS, "moldurasProntas", naurenProntasLista().filter(p => p.id !== id));
  const auto = { ...ler("moldurasAutomaticas", {}) }; let mudou = false;
  for (const k of ["hostil", "neutro", "amistoso", "secreto"]) if (auto[k] === id) { auto[k] = ""; mudou = true; }
  if (mudou) await game.settings.set(SIS, "moldurasAutomaticas", auto);
}

/**
 * Configuração final de borda: o visual da pronta por cima do que é do token (imagem, enquadramento, pincel).
 * Mede a moldura (vb/ext/raio) como a janela faz, para o recorte e o mapa baterem.
 */
export async function naurenProntaCfgPara(dados, base = {}) {
  const hex = c => typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c);
  const modelo = dados?.modelo === "foundry" || dados?.modelo === "imagem" || naurenMolduraModelo(dados?.modelo) ? dados.modelo : "foundry";
  const b = naurenBordaConfig({ flags: { nauren: { borda: { ...base, ativa: true } } } });
  const cfg = { ...b, ativa: true, modelo };
  if (Array.isArray(dados.cores) && dados.cores.length && dados.cores.every(hex)) { cfg.cores = dados.cores.slice(0, 5); cfg.corBorda = cfg.cores[0]; }
  for (const k of ["corFundo", "corDano", "corCura"]) if (hex(dados[k])) cfg[k] = dados[k];
  if (Array.isArray(dados.efeitos)) cfg.efeitos = dados.efeitos.filter(k => NAUREN_BORDA_EFEITOS[k]);
  if (Number.isFinite(Number(dados.borda))) cfg.borda = Math.min(1, Math.max(.5, Number(dados.borda)));
  cfg.pedra = naurenBordaPedraConfig(dados.pedra);
  if (modelo === "foundry") { cfg.moldura = null; if (dados.recorte === "livre" || dados.recorte === "redondo") cfg.recorte = dados.recorte; }
  else {
    const m = naurenMolduraNormalizar({ ...(dados.moldura ?? {}), modelo });
    const tex = await naurenMolduraPrepararPrevia({ modelo, moldura: m }, 128, src => naurenBordaCarregarImagem(src));
    cfg.moldura = { ...m, vb: tex.vb, ext: tex.ext, raio: tex.raioMascara };
    cfg.recorte = "redondo"; cfg.escala = 1;
  }
  return cfg;
}

/** Imagem original do token (sem a marca do recorte). */
function srcOriginal(doc) {
  const f = doc?.getFlag?.(SIS, "borda") ?? doc?.actor?.getFlag?.(SIS, "borda");
  const s = f?.src || doc?.texture?.src || doc?.actor?.img || "";
  return String(s).replace(/([?&])nauren-borda=[^&]*&?/, "$1").replace(/[?&]$/, "");
}

/**
 * Aplica uma pronta em vários tokens. Token vinculado (personagem): vale para a ficha toda.
 * Não vinculado (NPC/monstro): só aquele token, sem mexer no modelo do bestiário.
 */
export async function naurenProntaAplicarEmTokens(dados, docs) {
  let feitos = 0, falhas = 0;
  for (const doc of docs) {
    try {
      const atual = doc.getFlag?.(SIS, "borda") ?? (doc.actorLink ? doc.actor?.getFlag?.(SIS, "borda") : null) ?? {};
      const cfg = await naurenProntaCfgPara(dados, { ...atual, src: srcOriginal(doc) });
      if (doc.actorLink && doc.actor) await naurenBordaAplicar(doc.actor, cfg, { tokenDoc: doc, nosTokens: true });
      else await naurenBordaAplicar(doc.actor, cfg, { tokenDoc: doc, soToken: true });
      feitos++;
    } catch (err) { falhas++; console.warn("Nauren RPG | Moldura pronta", err); }
  }
  return { feitos, falhas };
}

/* ------------------------------ favoritas e recentes (de cada jogador) ------------------------------ */
export function naurenMolduraFavoritas() { const l = ler("moldurasFavoritas", []); return Array.isArray(l) ? l : []; }
export async function naurenMolduraFavoritar(id) {
  const l = naurenMolduraFavoritas(), i = l.indexOf(id);
  if (i >= 0) l.splice(i, 1); else l.push(id);
  await game.settings.set(SIS, "moldurasFavoritas", l); return i < 0;
}
export function naurenMolduraRecentes() { const l = ler("moldurasRecentes", []); return Array.isArray(l) ? l : []; }
export async function naurenMolduraUsada(id) {
  if (!id) return;
  const l = naurenMolduraRecentes().filter(x => x !== id); l.unshift(id);
  await game.settings.set(SIS, "moldurasRecentes", l.slice(0, MAX_RECENTES));
}

/* ------------------------------ moldura automática por disposição ------------------------------ */
export const NAUREN_DISPOSICOES = [["hostil", "Inimigos (hostil)", -1], ["neutro", "Neutros", 0], ["amistoso", "Aliados (amistoso)", 1], ["secreto", "Secretos", -2]];
export function naurenMoldurasAutomaticas() { return { hostil: "", neutro: "", amistoso: "", secreto: "", soNaoVinculados: true, ...(ler("moldurasAutomaticas", {}) ?? {}) }; }
export function naurenProntaParaDisposicao(disp) {
  const a = naurenMoldurasAutomaticas(), k = NAUREN_DISPOSICOES.find(d => d[2] === disp)?.[0];
  return k && a[k] ? naurenProntaPorId(a[k]) : null;
}
export function naurenMoldurasProntasHooks() {
  Hooks.on("createToken", async (doc, opcoes, userId) => {
    // só um cliente faz (o Mestre ativo) e só em tokens que ainda não têm borda
    if (!game.users?.activeGM?.isSelf) return;
    const a = naurenMoldurasAutomaticas();
    if (a.soNaoVinculados !== false && doc.actorLink) return;
    if (doc.getFlag?.(SIS, "borda")?.ativa || doc.actor?.prototypeToken?.flags?.[SIS]?.borda?.ativa) return;
    const p = naurenProntaParaDisposicao(doc.disposition); if (!p) return;
    await naurenProntaAplicarEmTokens(p.dados, [doc]);
  });
}
