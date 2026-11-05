/* Nauren RPG — Catálogo dos itens, tiers configuráveis e Condições embutidas (0.102).
 *
 * Catálogo: qualquer item guarda tier, raridade, valor, pigmento e ID externo em flags.nauren.catalogo.
 *   Itens da Torre Infinita continuam com flags.nauren.torre (o formato que o bot lê): o catálogo lê de lá
 *   quando ainda não tem o campo, e cada mudança no catálogo é espelhada de volta para a Torre.
 * Tiers: lista do mundo (Configurações → "Tiers dos itens"), cada um com cores, degradê, borda, forma e efeito.
 *   O selo é desenhado com duas camadas (borda e preenchimento recortados), nunca border + clip-path.
 * Condições embutidas: flags.nauren.condicoesEmbutidas = [{ id, dados }]. Viajam no JSON do item. Quando o item
 *   está numa ficha, cada uma vira um modelo (flag modelo, como nos monstros) e as Ações usam "self:Nome".
 */
import { NAUREN_TORRE_RARIDADES, NAUREN_TORRE_PIGMENTOS } from "./compendios.mjs";
import { naurenKitSistema, naurenKitJanela } from "./janelas-kit.mjs";
import { naurenEscolherIcone } from "./seletor-icones.mjs";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));

/* ============================== TIERS ============================== */
export const NAUREN_TIERS_PADRAO = [
  { id: "bronze", nome: "Bronze", icone: "fa-shield-halved", texto: "#ffe1c2", fundo: { cores: ["#5b3016", "#9a5a2a", "#6a3a1a"], posicoes: [0, 55, 100], angulo: 135 }, borda: { cores: ["#f0b27a", "#8a4b22"], largura: 1.5 }, forma: "chanfro", efeito: "nenhum" },
  { id: "prata", nome: "Prata", icone: "fa-shield-halved", texto: "#ffffff", fundo: { cores: ["#4b5361", "#8e98a8", "#5a6373"], posicoes: [0, 55, 100], angulo: 135 }, borda: { cores: ["#f4f7fb", "#7b8494"], largura: 1.5 }, forma: "chanfro", efeito: "nenhum" },
  { id: "ouro", nome: "Ouro", icone: "fa-crown", texto: "#fff6d6", fundo: { cores: ["#6e4a0c", "#c39227", "#7d560f"], posicoes: [0, 55, 100], angulo: 135 }, borda: { cores: ["#ffe8a0", "#a8771c"], largura: 1.5 }, forma: "chanfro", efeito: "brilho", efeitos: [{ tipo: "aura", cores: ["#ffe8a0"], vel: 3, int: 55 }, { tipo: "brilho", cores: ["#fff4cc"], vel: 3, int: 75 }] },
  { id: "diamante", nome: "Diamante", icone: "fa-gem", texto: "#effdff", fundo: { cores: ["#13506a", "#2fa0c8", "#185a78"], posicoes: [0, 55, 100], angulo: 135 }, borda: { cores: ["#d6f8ff", "#47b6dc"], largura: 1.5 }, forma: "losango", efeito: "brilho", efeitos: [{ tipo: "aura", cores: ["#d6f8ff"], vel: 3, int: 55 }, { tipo: "cintilar", cores: ["#ffffff", "#bff4ff"], vel: 3, int: 90 }] },
  { id: "prismatico", nome: "Prismático", icone: "fa-star", texto: "#ffffff", fundo: { cores: ["#d94c6a", "#e0a040", "#57c27a", "#4a9be0", "#9a62e0"], posicoes: [0, 25, 50, 75, 100], angulo: 90 }, borda: { cores: ["#ffd0dc", "#fff2c0", "#d0ffe0", "#d0e8ff", "#ecd8ff"], largura: 1.5 }, forma: "losango", efeito: "arco", efeitos: [{ tipo: "ciclo", cores: ["#d94c6a", "#e0a040", "#57c27a", "#4a9be0", "#9a62e0"], vel: 3, int: 60 }, { tipo: "borda", cores: ["#ffffff", "#ffe7a0"], vel: 3, int: 90 }] }
];
// Valores do bot da Torre (flags.nauren.torre.tier) ⇄ id do tier.
const TORRE_PARA_ID = { Bronze: "bronze", Prata: "prata", Ouro: "ouro", Diamante: "diamante", Prismatico: "prismatico" };
const ID_PARA_TORRE = Object.fromEntries(Object.entries(TORRE_PARA_ID).map(([k, v]) => [v, k]));

const corValida = c => typeof c === "string" && /^(#[0-9a-f]{3,8}|rgba?\(\s*[\d.\s,%]+\))$/i.test(c.trim()) ? c.trim() : null;
const numero = (v, min, max, padrao) => { const n = Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : padrao; };

/** Deixa um tier com todos os campos e só valores seguros (vai para atributos style). */
export function naurenNormalizarTier(t, i = 0) {
  const p = NAUREN_TIERS_PADRAO[2];
  const cores = (lista, padrao) => { const l = (Array.isArray(lista) ? lista : []).map(corValida).filter(Boolean).slice(0, 6); return l.length ? l : padrao; };
  const fCores = cores(t?.fundo?.cores, p.fundo.cores);
  const pos = fCores.map((_, k) => numero(t?.fundo?.posicoes?.[k], 0, 100, fCores.length > 1 ? Math.round(k * 100 / (fCores.length - 1)) : 0));
  return {
    id: String(t?.id ?? "").replace(/[^\w-]/g, "") || `tier${i}`,
    nome: String(t?.nome ?? "").trim().slice(0, 40) || "Tier",
    icone: /^fa-[\w-]+$/.test(String(t?.icone ?? "").trim()) ? String(t.icone).trim() : "",
    texto: corValida(t?.texto) ?? "#ffffff",
    fundo: { cores: fCores, posicoes: pos, angulo: numero(t?.fundo?.angulo, 0, 360, 135) },
    borda: { cores: cores(t?.borda?.cores, p.borda.cores), largura: numero(t?.borda?.largura, 0, 4, 1.5) },
    forma: ["chanfro", "losango", "pilula"].includes(t?.forma) ? t.forma : "chanfro",
    efeitos: naurenNormalizarEfeitos(t)
  };
}

/* ---------- Efeitos animados do selo (0.102.5) ----------
 * Até 2 por tier. Cada um: { tipo, cores, vel (1 lento … 5 rápido), int (10–100 %) }.
 * Só CSS (transform/opacidade); "Animações dos selos" (opção do jogador) desliga tudo. */
export const NAUREN_EFEITOS_TIER = [
  { id: "aura", nome: "Aura", icone: "fa-sun", dica: "Brilho parado em volta do selo.", cores: [1, 1], anima: false, filtro: true, int: 60 },
  { id: "brilho", nome: "Brilho", icone: "fa-wand-magic-sparkles", dica: "Uma faixa de luz atravessa o selo de tempos em tempos.", cores: [1, 1], base: 3.4, int: 75 },
  { id: "ciclo", nome: "Ciclo de cores", icone: "fa-arrows-spin", dica: "O selo passa suavemente de uma cor para a outra.", cores: [2, 6], base: 2.4, int: 80 },
  { id: "fluxo", nome: "Fluxo", icone: "fa-water", dica: "As cores correm por dentro do selo, como lava ou aurora.", cores: [2, 6], base: 4.5, int: 80 },
  { id: "pulso", nome: "Pulso", icone: "fa-heart-pulse", dica: "O selo acende e apaga devagar, como se respirasse.", cores: [1, 2], base: 2.6, filtro: true, int: 70 },
  { id: "borda", nome: "Borda viva", icone: "fa-circle-notch", dica: "Um ponto de luz contorna a borda sem parar.", cores: [1, 2], base: 3.2, int: 90 },
  { id: "cintilar", nome: "Cintilar", icone: "fa-star", dica: "Pontinhos de luz aparecem e somem.", cores: [1, 2], base: 2.4, int: 85 },
  { id: "holo", nome: "Holográfico", icone: "fa-compact-disc", dica: "Reflexo de carta brilhante. Se mexe quando o mouse passa por cima.", cores: [2, 4], anima: false, int: 65 },
  { id: "arco", nome: "Arco-íris", icone: "fa-rainbow", dica: "Todas as cores do selo giram pelo arco-íris.", cores: [0, 0], base: 9, int: 100 }
];
const EF_POR_ID = Object.fromEntries(NAUREN_EFEITOS_TIER.map(e => [e.id, e]));
const VEL = [1.8, 1.35, 1, 0.72, 0.5];
export const NAUREN_VEL_ROTULO = ["Bem lento", "Lento", "Normal", "Rápido", "Bem rápido"];
/** Cores iniciais de um efeito, tiradas do próprio tier. */
export function naurenCoresPadraoEfeito(tipo, t) {
  const b0 = t?.borda?.cores?.[0] ?? "#ffe8a0", f = t?.fundo?.cores ?? [];
  switch (tipo) {
    case "aura": case "pulso": return [b0];
    case "brilho": return ["#ffffff"];
    case "ciclo": case "fluxo": return f.length >= 2 ? f.slice(0, 6) : [f[0] ?? b0, "#ffffff"];
    case "borda": case "cintilar": return ["#ffffff", b0];
    case "holo": return ["#ff9ad5", "#9ae6ff", "#c9ff9a", "#ffe59a"];
    default: return [];
  }
}
function naurenNormalizarEfeitos(t) {
  let lista = t?.efeitos;
  if (!Array.isArray(lista)) {
    // Mundos de antes da 0.102.5: "efeito" único. Tier padrão sem mudança ganha os efeitos novos do padrão.
    const pad = NAUREN_TIERS_PADRAO.find(p => p.id === t?.id);
    if (pad?.efeitos && (t?.efeito ?? "nenhum") === pad.efeito) lista = pad.efeitos;
    else lista = t?.efeito === "brilho" ? [{ tipo: "aura" }] : t?.efeito === "arco" ? [{ tipo: "arco" }] : [];
  }
  const out = [];
  for (const e of lista) {
    const def = EF_POR_ID[e?.tipo];
    if (!def || out.some(o => o.tipo === def.id) || out.length >= 2) continue;
    if (def.filtro && out.some(o => EF_POR_ID[o.tipo].filtro)) continue; // Aura e Pulso usam o mesmo brilho de fora
    const [mn, mx] = def.cores;
    let cores = (Array.isArray(e.cores) ? e.cores : []).map(corValida).filter(Boolean).slice(0, mx);
    if (cores.length < mn) { const p = naurenCoresPadraoEfeito(def.id, t); cores = [...cores, ...p.slice(cores.length)].slice(0, Math.max(mn, cores.length)); while (cores.length < mn) cores.push("#ffffff"); }
    out.push({ tipo: def.id, cores, vel: Math.round(numero(e.vel, 1, 5, 3)), int: Math.round(numero(e.int, 10, 100, def.int)) });
  }
  return out;
}
const rgba = (c, a) => {
  const h = String(c).replace("#", "");
  if (!/^([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(h)) return c;
  const f = h.length === 3 ? h.split("").map(x => x + x).join("") : h.slice(0, 6);
  return `rgba(${parseInt(f.slice(0, 2), 16)}, ${parseInt(f.slice(2, 4), 16)}, ${parseInt(f.slice(4, 6), 16)}, ${Math.max(0, Math.min(1, a)).toFixed(2)})`;
};
/** Classes, variáveis e camadas que cada efeito acrescenta ao selo. */
function fxDoTier(t) {
  const cls = [], vars = [], camadas = [];
  for (const e of t.efeitos ?? []) {
    const def = EF_POR_ID[e.tipo]; if (!def) continue;
    const c = e.cores, i = (e.int / 100).toFixed(2), d = `${((def.base ?? 3) * VEL[e.vel - 1] * (e.tipo === "ciclo" ? c.length : 1)).toFixed(2)}s`;
    const g = lista => `linear-gradient(90deg, ${lista.map((x, k) => `${x} ${(k * 100 / (lista.length - 1)).toFixed(2)}%`).join(", ")})`;
    switch (e.tipo) {
      case "aura": cls.push("nt-fx-aura"); vars.push(`--au-c:${rgba(c[0], .35 + .6 * i)};--au-r:${(1.5 + 4.5 * i).toFixed(1)}px`); break;
      case "pulso": cls.push("nt-fx-pulso"); vars.push(`--pu-a:${rgba(c[0], .25 * i)};--pu-b:${rgba(c[1] ?? c[0], .35 + .6 * i)};--pu-r:${(2 + 6 * i).toFixed(1)}px;--pu-br:${(1 + .22 * i).toFixed(2)};--pu-d:${d}`); break;
      case "arco": cls.push("nt-fx-arco"); vars.push(`--ar-d:${d}`); break;
      case "borda": camadas.unshift(`<span class="nt-fx-anel" style="--c1:${c[0]};--c2:${c[1] ?? c[0]};--d:${d};--i:${i}"></span>`); break;
      case "brilho": camadas.push(`<span class="nt-fx nt-fx-brilho" style="--c1:${c[0]};--d:${d};--i:${i}"></span>`); break;
      case "ciclo": camadas.push(`<span class="nt-fx nt-fx-ciclo" style="--g:${g([...c, c[0]])};--d:${d};--i:${i}"></span>`); break;
      case "fluxo": camadas.push(`<span class="nt-fx nt-fx-fluxo" style="--g:${g([...c, ...c, c[0]])};--d:${d};--i:${i}"></span>`); break;
      case "cintilar": camadas.push(`<span class="nt-fx nt-fx-cintilar" style="--c1:${c[0]};--c2:${c[1] ?? c[0]};--d:${d};--i:${i}"><i></i></span>`); break;
      case "holo": cls.push("nt-fx-holo"); camadas.push(`<span class="nt-fx nt-fx-holo-l" style="--g:linear-gradient(115deg, transparent 12%, ${c.map((x, k) => `${x} ${(30 + k * 40 / Math.max(1, c.length - 1)).toFixed(1)}%`).join(", ")}, transparent 88%);--i:${i}"></span>`); break;
    }
  }
  return { cls, vars: vars.join(";"), camadas: camadas.join("") };
}
export function naurenTiersDoMundo() {
  let v = null;
  try { v = game.settings.get("nauren", "tiersItens"); } catch (err) { v = null; }
  const lista = Array.isArray(v?.lista) && v.lista.length ? v.lista : NAUREN_TIERS_PADRAO;
  return lista.map(naurenNormalizarTier);
}
/* Raridades do mundo (a lista padrão tem os ids que o bot da Torre conhece). */
export const NAUREN_RARIDADES_PADRAO = Object.entries(NAUREN_TORRE_RARIDADES).map(([id, nome]) => ({ id, nome }));
export function naurenRaridadesDoMundo() {
  let v = null;
  try { v = game.settings.get("nauren", "raridadesItens"); } catch (err) { v = null; }
  const lista = Array.isArray(v?.lista) && v.lista.length ? v.lista : NAUREN_RARIDADES_PADRAO;
  return lista.map((r, i) => ({ id: String(r?.id ?? "").replace(/[^\w-]/g, "") || `raridade${i}`, nome: String(r?.nome ?? "").trim().slice(0, 40) || "Raridade" }));
}
/** Itens deste mundo (no diretório e nas fichas) cujo catálogo usa o tier. */
export function naurenItensComTier(id) {
  const lista = [...(game.items?.contents ?? [])];
  for (const a of game.actors?.contents ?? []) lista.push(...a.items.contents);
  return lista.filter(i => naurenCatalogoDoItem(i).tier === id);
}
export function naurenTierPorId(id) { return id ? naurenTiersDoMundo().find(t => t.id === id) ?? null : null; }

function degrade(cores, posicoes, angulo) {
  if (cores.length === 1) return `linear-gradient(${cores[0]}, ${cores[0]})`;
  return `linear-gradient(${angulo}deg, ${cores.map((c, k) => `${c} ${posicoes?.[k] ?? Math.round(k * 100 / (cores.length - 1))}%`).join(", ")})`;
}
/** Variáveis CSS do selo (vão no atributo style). */
export function naurenVarsTier(t) {
  const n = naurenNormalizarTier(t);
  const fill = degrade(n.fundo.cores, n.fundo.posicoes, n.fundo.angulo);
  const bord = degrade(n.borda.cores, null, n.fundo.angulo);
  return `--t-txt:${n.texto};--t-fill:${fill};--t-bord:${bord};--t-bw:${n.borda.largura}px;--t-luz:color-mix(in srgb, ${n.borda.cores[0]} 60%, transparent)`;
}
/** HTML do selo. tam: "" (lista), "nt-g" (grande), "nt-gg" (prévia). */
export function naurenSeloTierHtml(tierOuId, { tam = "", titulo = true } = {}) {
  const t = typeof tierOuId === "string" ? naurenTierPorId(tierOuId) : tierOuId ? naurenNormalizarTier(tierOuId) : null;
  if (!t) return "";
  const fx = fxDoTier(t);
  const cls = ["nt-selo", `nt-${t.forma}`, ...fx.cls, tam].filter(Boolean).join(" ");
  return `<span class="${cls}" style="${naurenVarsTier(t)}${fx.vars ? `;${fx.vars}` : ""}"${titulo ? ` title="Tier: ${esc(t.nome)}"` : ""}>${fx.camadas}${t.icone ? `<i class="fas ${t.icone}"></i>` : ""}<span class="nt-rot">${esc(t.nome)}</span></span>`;
}

/* ============================== CATÁLOGO ============================== */
const flagsDe = item => item?.flags?.nauren ?? (typeof item?.getFlag === "function" ? { catalogo: item.getFlag("nauren", "catalogo"), torre: item.getFlag("nauren", "torre") } : {});
/** Dados de catálogo do item (documento ou dados puros). Campo vazio no catálogo cai para os dados da Torre. */
export function naurenCatalogoDoItem(item) {
  const f = flagsDe(item) ?? {};
  const c = f.catalogo ?? {}, t = f.torre ?? null;
  const tem = k => c[k] !== undefined && c[k] !== null;
  return {
    tier: tem("tier") ? String(c.tier) : (t?.tier ? (TORRE_PARA_ID[t.tier] ?? String(t.tier).toLowerCase()) : ""),
    raridade: tem("raridade") ? String(c.raridade) : (t?.raridade ?? ""),
    valor: tem("valor") && c.valor !== "" ? Math.max(0, Math.round(Number(c.valor) || 0)) : (t ? Math.max(0, Number(t.preco) || 0) : 0),
    temValor: (tem("valor") && c.valor !== "") || !!t,
    pigmento: tem("pigmento") ? String(c.pigmento) : (t?.pigmento ?? ""),
    idExterno: tem("idExterno") ? String(c.idExterno) : (t?.chave ?? ""),
    torre: !!t,
    lojaTorre: t?.loja ?? "galeria"
  };
}
export function naurenSeloDoItem(item, opc) { const id = naurenCatalogoDoItem(item).tier; return id ? naurenSeloTierHtml(id, opc) : ""; }
/** Valor do tier para gravar no espelho da Torre (o bot conhece só os 5 nomes; tier criado vai pelo nome). */
function tierParaTorre(id) { if (!id) return null; if (ID_PARA_TORRE[id]) return ID_PARA_TORRE[id]; return naurenTierPorId(id)?.nome ?? id; }
/** Dados da Torre a partir do catálogo (usado ao marcar o item como da Torre). */
export function naurenTorreDoCatalogo(item) {
  const c = naurenCatalogoDoItem(item);
  const chave = c.idExterno || String(item?.name ?? "item").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
  return { chave, tier: tierParaTorre(c.tier), raridade: c.raridade || (item?.type === "consumivel" ? "consumivel" : "magico"), preco: c.valor || 0, pigmento: c.pigmento || null, loja: c.lojaTorre || "galeria" };
}
export const NAUREN_CATALOGO_TIPOS = new Set(["arma", "armadura", "consumivel"]);
export function naurenItemTemCatalogo(item) { return NAUREN_CATALOGO_TIPOS.has(item?.type) || !!flagsDe(item)?.torre || !!flagsDe(item)?.catalogo; }
export function naurenContextoCatalogo(item) {
  if (!naurenItemTemCatalogo(item)) return null;
  const c = naurenCatalogoDoItem(item);
  const tiers = naurenTiersDoMundo();
  return {
    ...c,
    gm: game.user.isGM,
    tiers: [{ id: "", nome: "Sem tier", selo: `<span class="nt-sem-tier">Sem tier</span>`, on: !c.tier }, ...tiers.map(t => ({ id: t.id, nome: t.nome, selo: naurenSeloTierHtml(t, { titulo: false, tam: "nt-p" }), on: t.id === c.tier }))],
    tierDesconhecido: c.tier && !tiers.some(t => t.id === c.tier) ? c.tier : "",
    raridades: { "": "—", ...Object.fromEntries(naurenRaridadesDoMundo().map(r => [r.id, r.nome])), ...(c.raridade && !naurenRaridadesDoMundo().some(r => r.id === c.raridade) ? { [c.raridade]: c.raridade } : {}) },
    pigmentos: NAUREN_TORRE_PIGMENTOS,
    lojasTorre: { galeria: "Galeria", falsarios: "Falsários" },
    seloAtual: naurenSeloTierHtml(c.tier),
    resumo: [tiers.find(t => t.id === c.tier)?.nome ?? (c.tier ? c.tier : "Sem tier"), (naurenRaridadesDoMundo().find(r => r.id === c.raridade)?.nome ?? c.raridade ?? ""), c.valor ? `ƒ ${c.valor.toLocaleString("pt-BR")}` : ""].filter(Boolean).join(" · ")
  };
}

/* ============================== CONDIÇÕES EMBUTIDAS ============================== */
export const NAUREN_CONDICOES_TIPOS = new Set(["arma", "armadura", "consumivel", "habilidade", "magia", "efeito", "peculiaridade"]);
export function naurenCondicoesEmbutidas(item) {
  const l = item?.flags?.nauren?.condicoesEmbutidas ?? item?.getFlag?.("nauren", "condicoesEmbutidas");
  return Array.isArray(l) ? l.filter(e => e && e.id && e.dados) : [];
}
/** Dados limpos de uma Condição para guardar no item (sem id, sem marcas de modelo). */
export function naurenDadosParaEmbutir(doc) {
  const o = typeof doc?.toObject === "function" ? doc.toObject() : foundry.utils.deepClone(doc ?? {});
  delete o._id; delete o.folder; delete o.sort; delete o.ownership; delete o._stats;
  o.type = "condicao";
  if (o.flags?.nauren) { delete o.flags.nauren.modelo; delete o.flags.nauren.deItem; delete o.flags.nauren.embutidaId; delete o.flags.nauren.edicaoEmbutida; }
  if (o.system) o.system.ativo = true;
  return o;
}
const novoId = () => foundry.utils.randomID(10);
export async function naurenGravarCondicoesEmbutidas(item, lista, opcoes = {}) {
  return item.update({ "flags.nauren.condicoesEmbutidas": lista }, opcoes);
}
export async function naurenEmbutirCondicao(item, doc) {
  const lista = foundry.utils.deepClone(naurenCondicoesEmbutidas(item));
  const dados = naurenDadosParaEmbutir(doc);
  let nome = dados.name || "Condição";
  const usados = new Set(lista.map(e => e.dados.name));
  for (let k = 2; usados.has(nome); k++) nome = `${dados.name} ${k}`;
  dados.name = nome;
  lista.push({ id: novoId(), dados });
  await naurenGravarCondicoesEmbutidas(item, lista);
  return nome;
}
/** Cria/atualiza/apaga os modelos na ficha do dono, iguais às Condições embutidas. */
export async function naurenSincronizarCondicoesDoItem(item) {
  const ator = item?.parent;
  if (!ator || ator.documentName !== "Actor" || !ator.isOwner) return;
  const lista = naurenCondicoesEmbutidas(item);
  const modelos = ator.items.filter(i => i.getFlag("nauren", "deItem") === item.id);
  const criar = [], atualizar = [], apagar = [];
  for (const e of lista) {
    const m = modelos.find(x => x.getFlag("nauren", "embutidaId") === e.id);
    const dados = foundry.utils.deepClone(e.dados);
    dados.system = { ...(dados.system ?? {}), ativo: false };
    dados.flags = foundry.utils.mergeObject(dados.flags ?? {}, { nauren: { modelo: true, deItem: item.id, embutidaId: e.id } }, { inplace: false });
    if (!m) { criar.push(dados); continue; }
    const atual = m.toObject();
    const igual = atual.name === dados.name && atual.img === dados.img && JSON.stringify(atual.system) === JSON.stringify(foundry.utils.mergeObject(atual.system, dados.system, { inplace: false }));
    if (!igual) atualizar.push({ _id: m.id, name: dados.name, img: dados.img, system: dados.system });
  }
  for (const m of modelos) if (!lista.some(e => e.id === m.getFlag("nauren", "embutidaId"))) apagar.push(m.id);
  const op = { naurenSyncEmbutida: true };
  if (criar.length) await ator.createEmbeddedDocuments("Item", criar, op);
  if (atualizar.length) await ator.updateEmbeddedDocuments("Item", atualizar, op);
  if (apagar.length) await ator.deleteEmbeddedDocuments("Item", apagar, op);
}
/** Volta a edição de um modelo (ou da cópia temporária) para dentro do item. */
async function devolverEdicao(doc, itemFonte, embutidaId) {
  if (!itemFonte) return;
  const lista = foundry.utils.deepClone(naurenCondicoesEmbutidas(itemFonte));
  const e = lista.find(x => x.id === embutidaId);
  if (!e) return;
  const novo = naurenDadosParaEmbutir(doc);
  if (JSON.stringify(novo) === JSON.stringify(e.dados)) return;
  e.dados = novo;
  await naurenGravarCondicoesEmbutidas(itemFonte, lista, { naurenSyncEmbutida: true });
}
/** Abre a Condição embutida para editar: na ficha, o modelo; fora dela (Mestre), uma cópia temporária no mundo. */
export async function naurenEditarCondicaoEmbutida(item, embutidaId) {
  const ator = item.parent?.documentName === "Actor" ? item.parent : null;
  if (ator) {
    await naurenSincronizarCondicoesDoItem(item);
    const m = ator.items.find(i => i.getFlag("nauren", "deItem") === item.id && i.getFlag("nauren", "embutidaId") === embutidaId);
    if (m) return m.sheet.render(true);
  }
  if (!game.user.isGM) { ui.notifications.warn("Para editar uma Condição de um item fora da ficha, peça ao Mestre (ou coloque o item numa ficha sua)."); return; }
  const e = naurenCondicoesEmbutidas(item).find(x => x.id === embutidaId);
  if (!e) return;
  const dados = foundry.utils.deepClone(e.dados);
  dados.flags = foundry.utils.mergeObject(dados.flags ?? {}, { nauren: { edicaoEmbutida: { itemUuid: item.uuid, id: embutidaId } } }, { inplace: false });
  dados.ownership = { default: 0 };
  const tmp = await Item.implementation.create(dados, { naurenTemporario: true });
  if (!tmp) return;
  const sheet = tmp.sheet;
  const fechar = sheet.close.bind(sheet);
  sheet.close = async (...a) => { const r = await fechar(...a); await tmp.delete().catch(() => {}); return r; };
  sheet.render(true);
}
/** Lista de Condições para o seletor: deste item, do sistema e do mundo. */
export async function naurenOpcoesDeCondicao(item) {
  const deste = naurenCondicoesEmbutidas(item).map(e => ({ valor: `self:${e.dados.name}`, nome: e.dados.name, img: e.dados.img, info: e.dados.system?.acumulativel ? `até ${(e.dados.system?.acumulosMax ?? 99) >= 99 ? "∞" : e.dados.system.acumulosMax} acúmulos` : "" }));
  const pack = game.packs?.find(p => p.metadata?.label === "Nauren - Condições e Venenos");
  let sistema = [];
  if (pack) { const idx = await pack.getIndex({ fields: ["img", "type"] }); sistema = [...idx].filter(x => !x.type || x.type === "condicao").map(x => ({ valor: x.uuid ?? `Compendium.${pack.collection}.Item.${x._id}`, nome: x.name, img: x.img, info: "" })).sort((a, b) => a.nome.localeCompare(b.nome)); }
  const mundo = (game.items?.contents ?? []).filter(i => i.type === "condicao" && !i.getFlag("nauren", "edicaoEmbutida")).map(i => ({ valor: i.uuid, nome: i.name, img: i.img, info: "" })).sort((a, b) => a.nome.localeCompare(b.nome));
  return { deste, sistema, mundo };
}
/** Janela do seletor de Condição. Devolve o valor para o campo ("self:Nome" ou UUID) ou null. */
export async function naurenEscolherCondicao(item, valorAtual = "") {
  const op = await naurenOpcoesDeCondicao(item);
  const abas = [["deste", `Deste item · ${op.deste.length}`], ["sistema", "Sistema"], ["mundo", "Mundo"]];
  const inicial = op.deste.length ? "deste" : "sistema";
  const linha = o => `<button type="button" class="nt-picker-op${o.valor === valorAtual ? " on" : ""}" data-valor="${esc(o.valor)}" data-busca="${esc(o.nome.toLowerCase())}"><img src="${esc(o.img || "icons/svg/aura.svg")}" alt=""><span>${esc(o.nome)}</span><small>${esc(o.info)}</small></button>`;
  const lista = k => op[k].length ? op[k].map(linha).join("") : `<p class="nt-picker-vazio">${k === "deste" ? "Este item ainda não tem Condições próprias (aba Condições)." : "Nenhuma Condição aqui."}</p>`;
  const content = `<div class="nt-picker" data-aba="${inicial}">
    <div class="nt-picker-abas nt-ch">${abas.map(([k, r]) => `<button type="button" data-aba-cond="${k}" class="${k === inicial ? "on" : ""}">${r}</button>`).join("")}</div>
    <label class="nt-busca nt-ch"><i class="fas fa-magnifying-glass"></i><input type="text" placeholder="Procurar condição…" autocomplete="off"></label>
    ${abas.map(([k]) => `<div class="nt-picker-lista" data-lista="${k}" ${k === inicial ? "" : "hidden"}>${lista(k)}</div>`).join("")}
  </div>`;
  let escolhido = null;
  await foundry.applications.api.DialogV2.wait({
    ...naurenKitJanela(item.actor ?? null), classes: ["nauren-kit", "nt-picker-janela"], position: { width: 440 },
    window: { title: "Escolher Condição" }, content, rejectClose: false,
    buttons: [{ action: "fechar", label: "Fechar" }],
    render: (ev, dlg) => {
      const raiz = dlg.element ?? ev?.target?.element;
      if (!raiz) return;
      const busca = raiz.querySelector(".nt-busca input");
      const filtrar = () => { const q = String(busca?.value ?? "").trim().toLowerCase(); raiz.querySelectorAll(".nt-picker-op").forEach(b => { b.hidden = !!q && !b.dataset.busca.includes(q); }); };
      busca?.addEventListener("input", filtrar);
      raiz.querySelectorAll("[data-aba-cond]").forEach(b => b.addEventListener("click", () => {
        raiz.querySelectorAll("[data-aba-cond]").forEach(x => x.classList.toggle("on", x === b));
        raiz.querySelectorAll("[data-lista]").forEach(l => { l.hidden = l.dataset.lista !== b.dataset.abaCond; });
      }));
      raiz.querySelectorAll(".nt-picker-op").forEach(b => b.addEventListener("click", () => { escolhido = b.dataset.valor; dlg.close(); }));
    }
  }).catch(() => null);
  return escolhido;
}

/* ============================== JANELA: TIERS DOS ITENS ============================== */
const FORMAS = [["chanfro", "Chanfro"], ["losango", "Losango"], ["pilula", "Pílula"]];
const rotuloEfeitos = t => (t.efeitos ?? []).map(e => EF_POR_ID[e.tipo]?.nome).filter(Boolean).join(" + ") || "Nenhum";
export class NaurenTiersEditor extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "nauren-tiers-editor",
    classes: ["nauren-kit", "nauren-armazem", "nauren-tiers"],
    position: { width: 900, height: "auto" },
    window: { title: "Tiers dos itens", icon: "fas fa-layer-group", resizable: true },
    actions: {
      selecionar: function (ev, el) { this.sel = Number(el.dataset.i); this.slot = 0; this.render(); },
      novo: function () { const t = naurenNormalizarTier({ ...foundry.utils.deepClone(NAUREN_TIERS_PADRAO[0]), id: `tier-${foundry.utils.randomID(6)}`, nome: "Novo tier" }); this.lista.push(t); this.sel = this.lista.length - 1; this.render(); },
      duplicar: function (ev, el) { const i = Number(el.dataset.i); const t = naurenNormalizarTier({ ...foundry.utils.deepClone(this.lista[i]), id: `tier-${foundry.utils.randomID(6)}`, nome: `${this.lista[i].nome} (cópia)` }); this.lista.splice(i + 1, 0, t); this.sel = i + 1; this.render(); },
      apagar: NaurenTiersEditor.#apagar,
      escolherIcone: async function () { const v = await naurenEscolherIcone({ atual: this.atual.icone, titulo: `Ícone do tier ${this.atual.nome}` }); if (v === null) return; this.atual.icone = v; this.render(); },
      maisRaridade: function () { this.raridades.push({ id: `rar-${foundry.utils.randomID(5)}`, nome: "Nova raridade" }); this.render(); },
      menosRaridade: function (ev, el) { this.raridades.splice(Number(el.dataset.k), 1); this.render(); },
      forma: function (ev, el) { this.atual.forma = el.dataset.v; this.render(); },
      aba: function (ev, el) { this.aba = el.dataset.v; this.render(); },
      slotEfeito: function (ev, el) { this.slot = Number(el.dataset.k) || 0; this.render(); },
      maisEfeito: function () { if ((this.atual.efeitos ?? []).length === 1) { this.slot = 1; this.render(); } },
      tirarEfeito: function (ev, el) { ev?.stopPropagation?.(); const k = Number(el.dataset.k) || 0; this.atual.efeitos.splice(k, 1); this.slot = 0; this.render(); },
      escolherEfeito: function (ev, el) {
        const t = this.atual, tipo = el.dataset.v, lista = t.efeitos ??= [];
        if (el.classList.contains("off")) return;
        if (tipo === "nenhum") { if (lista[this.slot]) lista.splice(this.slot, 1); this.slot = 0; this.render(); return; }
        if (lista[this.slot]?.tipo === tipo) return;
        const def = EF_POR_ID[tipo];
        lista[Math.min(this.slot, lista.length)] = { tipo, cores: naurenCoresPadraoEfeito(tipo, t), vel: 3, int: def.int };
        this.render();
      },
      tipoFundo: function (ev, el) { const f = this.atual.fundo; if (el.dataset.v === "cor") { f.cores = [f.cores[1] ?? f.cores[0]]; f.posicoes = [0]; } else if (f.cores.length < 2) { f.cores = [f.cores[0], "#ffffff"]; f.posicoes = [0, 100]; } this.render(); },
      tipoBorda: function (ev, el) { const b = this.atual.borda; if (el.dataset.v === "cor") b.cores = [b.cores[0]]; else if (b.cores.length < 2) b.cores = [b.cores[0], "#ffffff"]; this.render(); },
      maisCor: function (ev, el) { const [alvo, , max] = this.#alvoCores(el.dataset.alvo); if (!alvo || alvo.cores.length >= max) return; alvo.cores.push(alvo.cores.at(-1)); if (alvo.posicoes) { alvo.posicoes = alvo.cores.map((_, k) => Math.round(k * 100 / (alvo.cores.length - 1))); } this.render(); },
      menosCor: function (ev, el) { const [alvo, min] = this.#alvoCores(el.dataset.alvo); if (!alvo || alvo.cores.length <= Math.max(1, min)) return; const k = Number(el.dataset.k); alvo.cores.splice(k, 1); alvo.posicoes?.splice(k, 1); this.render(); },
      exportar: NaurenTiersEditor.#exportar,
      importar: NaurenTiersEditor.#importar,
      padrao: NaurenTiersEditor.#padrao,
      cancelar: function () { this.close(); },
      salvar: NaurenTiersEditor.#salvar
    }
  };
  constructor(opcoes = {}) {
    super(opcoes);
    this.lista = naurenTiersDoMundo().map(t => foundry.utils.deepClone(t));
    this.sel = 0;
    this.raridades = naurenRaridadesDoMundo();
    this.mover = {}; // tier apagado → tier que os itens recebem ao salvar
    this.aba = "aparencia";
    this.slot = 0; // qual dos 2 efeitos está sendo editado
  }
  #alvoCores(nome) {
    if (nome === "borda") return [this.atual.borda, 1, 6];
    if (nome === "fx") { const e = this.atual.efeitos?.[this.slot], d = EF_POR_ID[e?.tipo]; return [e, d?.cores[0] ?? 1, d?.cores[1] ?? 6]; }
    return [this.atual.fundo, 1, 6];
  }
  /** Selo do tier com um só efeito (galeria). Usa as cores do efeito em edição quando é o mesmo tipo. */
  #seloComEfeito(t, tipo) {
    if (tipo === "nenhum") return naurenSeloTierHtml({ ...t, efeitos: [] }, { titulo: false });
    const atual = (t.efeitos ?? []).find(e => e.tipo === tipo);
    return naurenSeloTierHtml({ ...t, efeitos: [atual ?? { tipo, cores: naurenCoresPadraoEfeito(tipo, t), vel: 3, int: EF_POR_ID[tipo].int }] }, { titulo: false });
  }
  #abaEfeitos(t) {
    const lista = t.efeitos ?? [], slot = Math.min(this.slot, lista.length >= 2 ? 1 : lista.length ? (this.slot === 1 ? 1 : 0) : 0);
    this.slot = slot;
    const e = lista[slot], def = EF_POR_ID[e?.tipo];
    const outro = lista[slot === 0 ? 1 : 0];
    const chip = k => { const x = lista[k], d = EF_POR_ID[x?.tipo];
      return `<button type="button" class="nt-fx-slot nt-ch ${k === slot ? "on" : ""}" data-action="slotEfeito" data-k="${k}"><b>${k + 1}</b>${d ? `<i class="fas ${d.icone}"></i>${esc(d.nome)}` : `<em>${k === 0 ? "Nenhum efeito" : "Escolha abaixo"}</em>`}${d || k === 1 ? `<span class="nt-x" data-action="tirarEfeito" data-k="${k}" title="Tirar este efeito"><i class="fas fa-xmark"></i></span>` : ""}</button>`; };
    const slots = [chip(0)];
    if (lista.length >= 2 || slot === 1) slots.push(chip(1));
    else if (lista.length === 1) slots.push(`<button type="button" class="nt-mais-l" data-action="maisEfeito"><i class="fas fa-plus"></i> Combinar com outro efeito</button>`);
    const tiles = [["nenhum", "Nenhum", "fa-ban", "Sem efeito."], ...NAUREN_EFEITOS_TIER.map(d => [d.id, d.nome, d.icone, d.dica])].map(([id, nome, icone, dica]) => {
      const usadoNoOutro = outro?.tipo === id;
      const bloqueado = id !== "nenhum" && (usadoNoOutro || (EF_POR_ID[id]?.filtro && outro && EF_POR_ID[outro.tipo]?.filtro));
      const on = (e?.tipo ?? "nenhum") === id;
      const motivo = usadoNoOutro ? "Já está no outro efeito." : bloqueado ? "Aura e Pulso não combinam (os dois brilham por fora)." : dica;
      return `<button type="button" class="nt-fx-tile nt-ch ${on ? "on" : ""} ${bloqueado ? "off" : ""}" data-action="escolherEfeito" data-v="${id}" title="${esc(motivo)}"><span class="nt-fx-tile-sel" data-galeria="${id}">${this.#seloComEfeito(t, id)}</span><span class="nt-fx-tile-n"><i class="fas ${icone}"></i>${esc(nome)}</span></button>`;
    }).join("");
    let cfg = `<p class="nt-fx-dica"><i class="fas fa-circle-info"></i> Escolha um efeito na galeria. Os selos se mexem em todo lugar: mochila, loja e chat. Cada jogador pode desligar as animações em Configurações → Animações dos selos.</p>`;
    if (def) {
      const [mn, mx] = def.cores;
      const cores = mx ? `<div class="nt-c nt-c-2"><span>${mx === 1 ? "Cor" : `Cores <small class="nt-fx-qt">${mn === mx ? mn : `de ${mn} a ${mx}`}</small>`}</span><div class="nt-paradas-l">${this.#cores("fx", e.cores, null, mn, mx)}</div></div>` : `<div class="nt-c nt-c-2"><span>Cores</span><p class="nt-fx-sem">Usa as cores do próprio selo.</p></div>`;
      const vel = def.anima === false ? `<div class="nt-c"><span>Velocidade</span><p class="nt-fx-sem">${e.tipo === "holo" ? "Segue o mouse" : "Parado"}</p></div>`
        : `<label class="nt-c"><span>Velocidade <b data-ver="vel">${NAUREN_VEL_ROTULO[e.vel - 1]}</b></span><input type="range" class="nt-rng" data-campo="vel" min="1" max="5" step="1" value="${e.vel}"></label>`;
      const int = e.tipo === "arco" ? `<div class="nt-c"><span>Intensidade</span><p class="nt-fx-sem">Total</p></div>`
        : `<label class="nt-c"><span>Intensidade <b data-ver="int">${e.int}%</b></span><input type="range" class="nt-rng" data-campo="int" min="10" max="100" step="5" value="${e.int}"></label>`;
      cfg = `<p class="nt-fx-dica"><i class="fas ${def.icone}"></i> <b>${esc(def.nome)}:</b> ${esc(def.dica)}</p>${cores}<div class="nt-g2">${vel}${int}</div>`;
    }
    return `<div class="nt-fx-slots">${slots.join("")}</div><div class="nt-fx-gal">${tiles}</div>${cfg}`;
  }
  get atual() { return this.lista[this.sel] ?? this.lista[0]; }
  #seg(acao, opcoes, valor) { return `<div class="nt-seg2 nt-ch">${opcoes.map(([v, r]) => `<button type="button" data-action="${acao}" data-v="${v}" class="${v === valor ? "on" : ""}">${r}</button>`).join("")}</div>`; }
  #cores(alvo, lista, posicoes, min = 1, max = 6) {
    return lista.map((c, k) => `<span class="nt-parada nt-ch" title="${esc(c)}"><input type="color" class="nt-cor" data-cor="${alvo}" data-k="${k}" value="${c.startsWith("#") && c.length === 7 ? c : "#ffffff"}">${posicoes ? `<input type="number" class="nt-pos" data-k="${k}" min="0" max="100" value="${posicoes[k]}"><small>%</small>` : ""}${lista.length > Math.max(1, min) ? `<button type="button" class="nt-x" data-action="menosCor" data-alvo="${alvo}" data-k="${k}" title="Tirar esta cor"><i class="fas fa-xmark"></i></button>` : ""}</span>`).join("")
      + (lista.length < max ? `<button type="button" class="nt-mais nt-ch" data-action="maisCor" data-alvo="${alvo}" title="Mais uma cor (até ${max})"><i class="fas fa-plus"></i></button>` : "");
  }
  async _renderHTML() {
    const t = naurenNormalizarTier(this.atual, this.sel);
    this.lista[this.sel] = t;
    const lista = this.lista.map((x, i) => `<div class="nt-lt nt-ch ${i === this.sel ? "on" : ""}" data-action="selecionar" data-i="${i}" draggable="true" data-arrasta="${i}">
      <i class="fas fa-grip-vertical"></i><span class="nt-lt-sel">${naurenSeloTierHtml(x, { titulo: false })}</span>
      <span class="nt-mini"><button type="button" data-action="duplicar" data-i="${i}" title="Duplicar"><i class="fas fa-copy"></i></button><button type="button" data-action="apagar" data-i="${i}" title="Apagar"><i class="fas fa-trash"></i></button></span></div>`).join("");
    const unica = t.fundo.cores.length === 1, bUnica = t.borda.cores.length === 1;
    const barra = degrade(t.fundo.cores, t.fundo.posicoes, 90);
    return `<div class="na-janela">
      <div class="nt-tiers">
        <div class="nt-col">
          <p class="nt-nota-k">De cima para baixo: do mais comum ao mais raro. Arraste para reordenar.</p>
          <div class="nt-lista-t">${lista}</div>
          <button type="button" class="nt-novo nt-ch" data-action="novo"><i class="fas fa-plus"></i> Novo tier</button>
          <div class="nt-rar nt-ch">
            <h3>Raridades <small>aparecem no Catálogo</small></h3>
            ${this.raridades.map((r, k) => `<div class="nt-rar-l"><input type="text" class="nt-in nt-ch" data-rar="${k}" value="${esc(r.nome)}" maxlength="40" title="id: ${esc(r.id)}">${NAUREN_RARIDADES_PADRAO.some(p => p.id === r.id) ? `<span class="nt-rar-fixa" title="Usada pelo bot da Torre (o id não muda)"><i class="fas fa-lock"></i></span>` : `<button type="button" class="nt-x" data-action="menosRaridade" data-k="${k}" title="Apagar"><i class="fas fa-xmark"></i></button>`}</div>`).join("")}
            <button type="button" class="nt-mais-l" data-action="maisRaridade"><i class="fas fa-plus"></i> Nova raridade</button>
          </div>
        </div>
        <div class="nt-col">
          <div class="nt-ed nt-ch">
            <h3><span class="nt-ed-nome" title="id: ${esc(t.id)}">${esc(t.nome)}</span>${this.#seg("aba", [["aparencia", `<i class="fas fa-palette"></i> Cores e forma`], ["efeitos", `<i class="fas fa-wand-magic-sparkles"></i> Efeitos${(t.efeitos ?? []).length ? ` <em>${t.efeitos.length}</em>` : ""}`]], this.aba).replace("nt-seg2 nt-ch", "nt-seg2 nt-ch nt-ed-abas")}</h3>
            ${this.aba === "efeitos" ? `<div class="nt-ed-corpo nt-ed-fx">${this.#abaEfeitos(t)}</div>` : `<div class="nt-ed-corpo">
            <div class="nt-g3">
              <label class="nt-c"><span>Nome</span><input type="text" class="nt-in nt-ch" data-campo="nome" value="${esc(t.nome)}" maxlength="40"></label>
              <div class="nt-c"><span>Ícone</span><button type="button" class="nt-in nt-ch nt-in-ic nt-ic-bt" data-action="escolherIcone" title="Escolher no catálogo de ícones"><i class="fas ${esc(t.icone || "fa-ban")}"></i><span>${esc(t.icone ? t.icone.replace(/^fa-/, "") : "sem ícone")}</span><em title="Trocar"><i class="fas fa-icons"></i></em></button></div>
              <label class="nt-c"><span>Cor do texto</span><span class="nt-in nt-ch"><input type="color" class="nt-cor" data-cor="texto" value="${t.texto.length === 7 ? t.texto : "#ffffff"}"><code>${esc(t.texto)}</code></span></label>
            </div>
            <div class="nt-g2">
              <div class="nt-c"><span>Preenchimento</span>${this.#seg("tipoFundo", [["cor", "Cor única"], ["degrade", "Degradê"]], unica ? "cor" : "degrade")}</div>
              <label class="nt-c"><span>Ângulo <b data-ver="angulo">${t.fundo.angulo}°</b></span><input type="range" class="nt-rng" data-campo="angulo" min="0" max="360" step="5" value="${t.fundo.angulo}" ${unica ? "disabled" : ""}></label>
            </div>
            ${unica ? "" : `<div class="nt-barra-w"><span class="nt-selo nt-chanfro nt-barra" style="--t-fill:${barra};--t-bord:#8f86a6;--t-bw:1px;--t-cc:4px"></span>${t.fundo.cores.map((c, k) => `<i class="nt-marca" style="left:${t.fundo.posicoes[k]}%;--c:${c}"></i>`).join("")}</div>`}
            <div class="nt-paradas-l">${this.#cores("fundo", t.fundo.cores, unica ? null : t.fundo.posicoes)}</div>
            <div class="nt-g3 nt-g3-borda">
              <div class="nt-c"><span>Borda</span>${this.#seg("tipoBorda", [["cor", "Cor única"], ["degrade", "Degradê"]], bUnica ? "cor" : "degrade")}</div>
              <div class="nt-c nt-c-2"><span>Cores da borda</span><div class="nt-paradas-l">${this.#cores("borda", t.borda.cores, null)}</div></div>
              <label class="nt-c"><span>Espessura <b data-ver="largura">${String(t.borda.largura).replace(".", ",")} px</b></span><input type="range" class="nt-rng" data-campo="largura" min="0" max="4" step="0.5" value="${t.borda.largura}"></label>
            </div>
            <div class="nt-g2">
              <div class="nt-c"><span>Forma</span>${this.#seg("forma", FORMAS, t.forma)}</div>
              <div class="nt-c"><span>Efeitos</span><button type="button" class="nt-in nt-ch nt-in-ic nt-fx-resumo" data-action="aba" data-v="efeitos" title="Abrir a aba Efeitos"><i class="fas fa-wand-magic-sparkles"></i><span>${esc(rotuloEfeitos(t))}</span><i class="fas fa-chevron-right"></i></button></div>
            </div>
            </div>`}
          </div>
          <div class="nt-prev nt-ch">
            <h3>Prévia <small>como aparece em cada lugar</small></h3>
            <div class="nt-prev-topo nt-ch" data-previa="gg">${naurenSeloTierHtml(t, { tam: "nt-gg", titulo: false })}</div>
            <div class="nt-prev-ex">
              <div class="nt-ex nt-ch"><span class="nt-exi nt-ch"><i class="fas fa-khanda"></i></span><div><div class="nt-lin"><b>Lança Glacial</b><span data-previa="p">${naurenSeloTierHtml(t, { titulo: false })}</span></div><small>Mochila · Ação Perfurar | Alcance 2m</small></div></div>
              <div class="nt-ex nt-ch"><span class="nt-exi nt-ch"><i class="fas fa-khanda"></i></span><div><b>Lança Glacial</b><div class="nt-lin"><span data-previa="p">${naurenSeloTierHtml(t, { titulo: false })}</span><small>ƒ 4.800</small></div></div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="nt-rod">
        <button type="button" class="na-btn" data-action="exportar"><i class="fas fa-file-export"></i> Exportar</button>
        <button type="button" class="na-btn" data-action="importar"><i class="fas fa-file-import"></i> Importar</button>
        <button type="button" class="na-btn" data-action="padrao"><i class="fas fa-rotate-left"></i> Padrão do sistema</button>
        <span class="nt-esp"></span>
        <button type="button" class="na-btn" data-action="cancelar">Cancelar</button>
        <button type="button" class="na-btn na-principal" data-action="salvar"><i class="fas fa-floppy-disk"></i> Salvar</button>
      </div>
    </div>`;
  }
  _replaceHTML(html, content) { content.innerHTML = html; }
  /** Prévia ao vivo sem redesenhar a janela (as cores mudam enquanto o seletor está aberto). */
  #atualizarPrevia() {
    const t = naurenNormalizarTier(this.atual, this.sel);
    const el = this.element;
    el.querySelectorAll("[data-previa]").forEach(p => { p.innerHTML = naurenSeloTierHtml(t, { tam: p.dataset.previa === "gg" ? "nt-gg" : "", titulo: false }); });
    const linha = el.querySelector(`.nt-lt[data-i="${this.sel}"] .nt-lt-sel`); if (linha) linha.innerHTML = naurenSeloTierHtml(t, { titulo: false });
    const barra = el.querySelector(".nt-barra"); if (barra) barra.style.setProperty("--t-fill", degrade(t.fundo.cores, t.fundo.posicoes, 90));
    el.querySelectorAll(".nt-marca").forEach((m, k) => { m.style.left = `${t.fundo.posicoes[k]}%`; m.style.setProperty("--c", t.fundo.cores[k]); });
    const ang = el.querySelector('[data-ver="angulo"]'); if (ang) ang.textContent = `${t.fundo.angulo}°`;
    const lar = el.querySelector('[data-ver="largura"]'); if (lar) lar.textContent = `${String(t.borda.largura).replace(".", ",")} px`;
    const nome = el.querySelector(".nt-ed-nome"); if (nome) nome.textContent = t.nome;
    el.querySelectorAll("[data-galeria]").forEach(g => { g.innerHTML = this.#seloComEfeito(t, g.dataset.galeria); });
    const e = this.atual.efeitos?.[this.slot];
    const vel = el.querySelector('[data-ver="vel"]'); if (vel && e) vel.textContent = NAUREN_VEL_ROTULO[(Number(e.vel) || 3) - 1];
    const int = el.querySelector('[data-ver="int"]'); if (int && e) int.textContent = `${e.int}%`;
  }
  _onRender() {
    const el = this.element;
    el.querySelectorAll("[data-campo]").forEach(inp => inp.addEventListener("input", () => {
      const t = this.atual, v = inp.value;
      if (inp.dataset.campo === "nome") t.nome = v;
      else if (inp.dataset.campo === "angulo") t.fundo.angulo = Number(v);
      else if (inp.dataset.campo === "largura") t.borda.largura = Number(v);
      else if ((inp.dataset.campo === "vel" || inp.dataset.campo === "int") && t.efeitos?.[this.slot]) t.efeitos[this.slot][inp.dataset.campo] = Number(v);
      this.#atualizarPrevia();
    }));
    el.querySelectorAll(".nt-cor").forEach(inp => inp.addEventListener("input", () => {
      const t = this.atual, k = Number(inp.dataset.k);
      if (inp.dataset.cor === "texto") t.texto = inp.value;
      else if (inp.dataset.cor === "fundo") t.fundo.cores[k] = inp.value;
      else if (inp.dataset.cor === "borda") t.borda.cores[k] = inp.value;
      else if (inp.dataset.cor === "fx" && t.efeitos?.[this.slot]) t.efeitos[this.slot].cores[k] = inp.value;
      const code = inp.nextElementSibling; if (code?.tagName === "CODE") code.textContent = inp.value;
      this.#atualizarPrevia();
    }));
    el.querySelectorAll("[data-rar]").forEach(inp => inp.addEventListener("input", () => { const r = this.raridades[Number(inp.dataset.rar)]; if (r) r.nome = inp.value; }));
    el.querySelectorAll(".nt-pos").forEach(inp => inp.addEventListener("input", () => { this.atual.fundo.posicoes[Number(inp.dataset.k)] = numero(inp.value, 0, 100, 0); this.#atualizarPrevia(); }));
    // Arrastar para reordenar.
    el.querySelectorAll("[data-arrasta]").forEach(row => {
      row.addEventListener("dragstart", ev => { ev.dataTransfer.setData("text/nauren-tier", row.dataset.arrasta); ev.dataTransfer.effectAllowed = "move"; });
      row.addEventListener("dragover", ev => { if ([...ev.dataTransfer.types].includes("text/nauren-tier")) { ev.preventDefault(); row.classList.add("nt-sobre"); } });
      row.addEventListener("dragleave", () => row.classList.remove("nt-sobre"));
      row.addEventListener("drop", ev => {
        ev.preventDefault(); row.classList.remove("nt-sobre");
        const de = Number(ev.dataTransfer.getData("text/nauren-tier")), para = Number(row.dataset.arrasta);
        if (!Number.isInteger(de) || de === para) return;
        const selId = this.atual.id;
        const [m] = this.lista.splice(de, 1); this.lista.splice(para, 0, m);
        this.sel = Math.max(0, this.lista.findIndex(x => x.id === selId));
        this.render();
      });
    });
  }
  static async #apagar(ev, el) {
    const i = Number(el.dataset.i), t = this.lista[i];
    if (!t) return;
    const usando = naurenItensComTier(t.id);
    const outros = this.lista.filter(x => x.id !== t.id);
    let destino = "";
    if (usando.length) {
      const opcoes = [`<option value="">Sem tier (o selo some)</option>`, ...outros.map(x => `<option value="${esc(x.id)}">${esc(x.nome)}</option>`)].join("");
      const nomes = usando.slice(0, 6).map(x => `${esc(x.name)}${x.parent ? ` <small>(${esc(x.parent.name)})</small>` : ""}`).join(", ");
      const r = await foundry.applications.api.DialogV2.wait({ ...naurenKitSistema(), window: { title: `Apagar o tier ${t.nome}?` }, rejectClose: false,
        content: `<p><b>${usando.length}</b> ${usando.length === 1 ? "item usa" : "itens usam"} este tier: ${nomes}${usando.length > 6 ? "…" : ""}</p>
          <label class="nt-c"><span>Esses itens passam para</span><select name="destino">${opcoes}</select></label>
          <p class="nt-nota-k">Os itens mudam quando você clicar em Salvar. Itens dentro de compêndios não mudam.</p>`,
        buttons: [{ action: "apagar", label: "Apagar e mover", default: true, callback: (e, btn) => btn.form?.elements?.destino?.value ?? "" }, { action: "cancelar", label: "Cancelar" }] }).catch(() => null);
      if (r === null || r === "cancelar" || r === undefined) return;
      destino = r === "apagar" ? "" : r;
    } else {
      const ok = await foundry.applications.api.DialogV2.confirm({ ...naurenKitSistema(), window: { title: `Apagar o tier ${t.nome}?` }, content: "<p>Nenhum item deste mundo usa este tier.</p>", rejectClose: false }).catch(() => false);
      if (!ok) return;
    }
    // Quem ia para este tier (de um apagado antes) vai junto para o destino novo.
    for (const [k, v] of Object.entries(this.mover)) if (v === t.id) this.mover[k] = destino;
    this.mover[t.id] = destino;
    this.lista.splice(i, 1);
    this.sel = Math.min(this.sel, Math.max(0, this.lista.length - 1));
    this.render();
  }
  static #exportar() {
    const dados = JSON.stringify({ sistema: "nauren", tipo: "tiersItens", lista: this.lista.map(naurenNormalizarTier) }, null, 2);
    foundry.utils.saveDataToFile(dados, "application/json", "nauren-tiers-itens.json");
  }
  static #importar() {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json";
    inp.addEventListener("change", async () => {
      const f = inp.files?.[0]; if (!f) return;
      try {
        const o = JSON.parse(await f.text());
        const lista = Array.isArray(o) ? o : o?.lista;
        if (!Array.isArray(lista) || !lista.length) throw new Error("sem lista");
        this.lista = lista.map(naurenNormalizarTier); this.sel = 0; this.render();
        ui.notifications.info(`${this.lista.length} tiers carregados. Clique em Salvar para usar.`);
      } catch (err) { ui.notifications.error("Esse arquivo não tem uma lista de tiers do Nauren."); }
    });
    inp.click();
  }
  static async #padrao() {
    const ok = await foundry.applications.api.DialogV2.confirm({ ...naurenKitSistema(), window: { title: "Voltar ao padrão do sistema?" }, content: "<p>A lista volta a ser Bronze, Prata, Ouro, Diamante e Prismático. Nada é gravado até você clicar em Salvar.</p>", rejectClose: false }).catch(() => false);
    if (!ok) return;
    this.lista = NAUREN_TIERS_PADRAO.map(naurenNormalizarTier); this.sel = 0; this.render();
  }
  static async #salvar() {
    if (!game.user.isGM) { ui.notifications.warn("Só o Mestre muda os tiers do mundo."); return; }
    const ids = new Set();
    const lista = this.lista.map((t, i) => { const n = naurenNormalizarTier(t, i); while (ids.has(n.id)) n.id = `${n.id}-${i}`; ids.add(n.id); return n; });
    await game.settings.set("nauren", "tiersItens", { lista });
    const rids = new Set();
    const raridades = this.raridades.map((r, k) => { let id = String(r.id ?? "").replace(/[^\w-]/g, "") || `raridade${k}`; while (rids.has(id)) id = `${id}-${k}`; rids.add(id); return { id, nome: String(r.nome ?? "").trim() || id }; });
    await game.settings.set("nauren", "raridadesItens", { lista: raridades });
    // Itens dos tiers apagados vão para o tier escolhido.
    let movidos = 0;
    for (const [de, para] of Object.entries(this.mover)) {
      if (ids.has(de)) continue; // o tier voltou a existir
      for (const it of naurenItensComTier(de)) { await it.update({ "flags.nauren.catalogo.tier": para ?? "" }).catch(err => console.warn("Nauren RPG | mover tier", err)); movidos++; }
    }
    this.mover = {};
    ui.notifications.info(`Tiers dos itens salvos.${movidos ? ` ${movidos} item(ns) trocaram de tier.` : ""}`);
    this.close();
  }
}

/* ============================== REGISTRO E GANCHOS ============================== */
export function naurenItensCatalogoInit() {
  game.settings.register("nauren", "tiersItens", { name: "Tiers dos itens", scope: "world", config: false, type: Object, default: { lista: NAUREN_TIERS_PADRAO },
    onChange: () => { for (const app of foundry.applications.instances.values()) if (app.document?.documentName === "Item" || app.document?.documentName === "Actor" || app.constructor?.name === "NaurenArmazemJanela") app.render?.(); } });
  game.settings.register("nauren", "selosAnimados", { name: "Animações dos selos", hint: "Liga os efeitos animados dos selos de tier (brilho, ciclo de cores, cintilar…). Desligado, os selos ficam parados. Vale só para você.",
    scope: "client", config: true, type: Boolean, default: true, onChange: v => document.body?.classList.toggle("nauren-selos-parados", !v) });
  try { document.body?.classList.toggle("nauren-selos-parados", !game.settings.get("nauren", "selosAnimados")); } catch (err) { /* sem body ainda */ }
  game.settings.register("nauren", "raridadesItens", { name: "Raridades dos itens", scope: "world", config: false, type: Object, default: { lista: NAUREN_RARIDADES_PADRAO } });
  game.settings.registerMenu("nauren", "tiersItensMenu", { name: "Tiers dos itens", label: "Editar tiers", hint: "Crie, renomeie, reordene e pinte os tiers (selos) dos itens: cores, degradê, borda, forma e efeito. Também edita a lista de raridades.", icon: "fas fa-layer-group", type: NaurenTiersEditor, restricted: true });
}
export function naurenItensCatalogoHooks() {
  Hooks.once("ready", () => { try { document.body.classList.toggle("nauren-selos-parados", !game.settings.get("nauren", "selosAnimados")); } catch (err) { /* nada */ } });
  // Holográfico: o reflexo segue o mouse (um ouvinte só, para todos os selos).
  let pend = null;
  document.addEventListener("pointermove", ev => {
    const selo = ev.target?.closest?.(".nt-selo.nt-fx-holo");
    if (!selo || pend) return;
    pend = requestAnimationFrame(() => {
      pend = null;
      const r = selo.getBoundingClientRect(); if (!r.width) return;
      selo.style.setProperty("--mx", `${Math.round(((ev.clientX - r.left) / r.width) * 100)}%`);
      selo.style.setProperty("--my", `${Math.round(((ev.clientY - r.top) / r.height) * 100)}%`);
    });
  }, { passive: true });
  document.addEventListener("pointerout", ev => { const selo = ev.target?.closest?.(".nt-selo.nt-fx-holo"); if (selo && !selo.contains(ev.relatedTarget)) { selo.style.removeProperty("--mx"); selo.style.removeProperty("--my"); } }, { passive: true });
  // Catálogo → espelho da Torre (o bot lê flags.nauren.torre).
  Hooks.on("preUpdateItem", (item, changes) => {
    const cat = changes?.flags?.nauren?.catalogo;
    if (!cat || typeof cat !== "object") return;
    if ("valor" in cat) cat.valor = Math.max(0, Math.round(Number(String(cat.valor).replace(/\D/g, "")) || 0));
    const torre = item.getFlag("nauren", "torre");
    if (!torre || changes.flags.nauren.torre === null) return;
    const t = changes.flags.nauren.torre = { ...(changes.flags.nauren.torre ?? {}) };
    if ("tier" in cat) t.tier = tierParaTorre(cat.tier);
    if ("raridade" in cat && cat.raridade) t.raridade = cat.raridade;
    if ("valor" in cat) t.preco = cat.valor;
    if ("pigmento" in cat) t.pigmento = cat.pigmento || null;
    if ("idExterno" in cat && String(cat.idExterno ?? "").trim()) t.chave = String(cat.idExterno).trim();
  });
  // Condições embutidas ⇄ modelos na ficha.
  Hooks.on("createItem", (item, opc, userId) => {
    if (userId !== game.user.id || opc?.naurenSyncEmbutida) return;
    if (item.parent?.documentName === "Actor" && naurenCondicoesEmbutidas(item).length) naurenSincronizarCondicoesDoItem(item).catch(err => console.warn("Nauren RPG | Condições do item", err));
  });
  Hooks.on("updateItem", (item, changes, opc, userId) => {
    if (userId !== game.user.id || opc?.naurenSyncEmbutida) return;
    if (changes?.flags?.nauren && "condicoesEmbutidas" in changes.flags.nauren && item.parent?.documentName === "Actor") {
      naurenSincronizarCondicoesDoItem(item).catch(err => console.warn("Nauren RPG | Condições do item", err));
    }
    // Edição do modelo na ficha (ou da cópia temporária do Mestre) volta para o item.
    const deItem = item.getFlag("nauren", "deItem");
    if (deItem && item.parent) devolverEdicao(item, item.parent.items.get(deItem), item.getFlag("nauren", "embutidaId")).catch(() => {});
    const ed = item.getFlag("nauren", "edicaoEmbutida");
    if (ed?.itemUuid) fromUuid(ed.itemUuid).then(fonte => devolverEdicao(item, fonte, ed.id)).catch(() => {});
  });
  Hooks.on("deleteItem", (item, opc, userId) => {
    if (userId !== game.user.id || opc?.naurenSyncEmbutida) return;
    const ator = item.parent;
    if (ator?.documentName !== "Actor" || !naurenCondicoesEmbutidas(item).length) return;
    const ids = ator.items.filter(i => i.getFlag("nauren", "deItem") === item.id).map(i => i.id);
    if (ids.length) ator.deleteEmbeddedDocuments("Item", ids, { naurenSyncEmbutida: true }).catch(() => {});
  });
}

/* ============================== FICHA DO ITEM: ligações ============================== */
/** Liga a aba Condições, o seletor dos campos de Condição e o bloco Catálogo. sheet = NaurenItemSheet. */
export function naurenLigarFichaItemExtras(sheet) {
  const el = sheet.element, item = sheet.item;
  if (!el || !item) return;
  // Soltar uma Condição na aba (cópia embutida).
  const painel = el.querySelector('.nauren-aba-painel[data-aba="condicoes"]');
  if (painel && item.isOwner) {
    painel.addEventListener("dragover", ev => { ev.preventDefault(); painel.querySelector(".nt-solta")?.classList.add("nt-sobre"); });
    painel.addEventListener("dragleave", ev => { if (!painel.contains(ev.relatedTarget)) painel.querySelector(".nt-solta")?.classList.remove("nt-sobre"); });
    painel.addEventListener("drop", async ev => {
      painel.querySelector(".nt-solta")?.classList.remove("nt-sobre");
      let dados; try { dados = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err) { return; }
      if (dados?.type !== "Item" || !dados.uuid || String(dados.uuid).startsWith("self:")) return;
      ev.preventDefault(); ev.stopPropagation();
      const doc = await fromUuid(dados.uuid).catch(() => null);
      if (doc?.type !== "condicao") { ui.notifications.warn("Arraste uma Condição para cá."); return; }
      const nome = await naurenEmbutirCondicao(item, doc);
      ui.notifications.info(`${nome} agora faz parte de ${item.name}.`);
    });
    // Cartões arrastáveis: soltar num campo de Condição da Ação grava "self:Nome".
    painel.querySelectorAll("[data-arrastar-cond]").forEach(c => c.addEventListener("dragstart", ev => {
      ev.dataTransfer.setData("text/plain", JSON.stringify({ type: "Item", uuid: `self:${c.dataset.arrastarCond}` }));
    }));
  }
  // Seletor ao lado de cada campo de Condição (aceita Condições deste item, do sistema e do mundo).
  if (item.isOwner) el.querySelectorAll("input.nauren-uuid-input").forEach(inp => {
    if (inp.dataset.ntPicker || inp.disabled) return;
    // Só campos de Condição (não "item concedido", "evolui para"…).
    const chave = `${inp.dataset.field ?? ""} ${inp.dataset.recursoField ?? ""} ${inp.dataset.nodeField ?? ""} ${inp.name ?? ""} ${inp.placeholder ?? ""}`;
    if (!/condi/i.test(chave)) return;
    inp.dataset.ntPicker = "1";
    const bt = document.createElement("button");
    bt.type = "button"; bt.className = "nt-cond-pick"; bt.title = "Escolher Condição (deste item, do sistema ou do mundo)";
    bt.innerHTML = `<i class="fas fa-list-ul"></i>`;
    const wrap = document.createElement("span"); wrap.className = "nt-uuid-wrap";
    inp.insertAdjacentElement("beforebegin", wrap); wrap.append(inp, bt);
    bt.addEventListener("click", async ev => {
      ev.preventDefault();
      const v = await naurenEscolherCondicao(item, String(inp.value ?? ""));
      if (!v) return;
      inp.value = v;
      if (inp.dataset.field && typeof sheet._onArrayFieldChange === "function") await sheet._onArrayFieldChange({ currentTarget: inp, stopPropagation() {} });
      else inp.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
}
export { esc as naurenEscHtml };

/** Aba "Condições" da ficha de item. */
export function naurenHtmlAbaCondicoes(item) {
  const lista = naurenCondicoesEmbutidas(item);
  const pode = item.isOwner;
  const acoes = item.system?.acoes ?? [];
  const scripts = item.flags?.nauren?.scripts ?? [];
  const tirarTags = s => String(s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const cartoes = lista.map(e => {
    const d = e.dados, sys = d.system ?? {};
    const ref = `self:${d.name}`;
    const usos = [
      ...acoes.filter(a => JSON.stringify(a).includes(JSON.stringify(ref))).map(a => `<span class="nt-chip ouro nt-ch"><i class="fas fa-bolt"></i> ${esc(a.nome || "Ação")}</span>`),
      ...scripts.filter(s => String(s.codigo ?? "").includes(d.name)).map(s => `<span class="nt-chip ouro nt-ch"><i class="fas fa-code"></i> ${esc(s.nome)}</span>`)
    ];
    const chips = [
      sys.acumulativel ? `até ${sys.acumulosMax >= 99 ? "∞" : sys.acumulosMax} acúmulos` : "1 acúmulo",
      sys.duracaoRodadas ? `${sys.duracaoRodadas} ${sys.duracaoPorTurno ? "turno(s)" : "rodada(s)"}` : ""
    ].filter(Boolean).map(c => `<span class="nt-chip nt-ch">${esc(c)}</span>`).join("");
    const desc = tirarTags(sys.descricao).slice(0, 150);
    return `<div class="nt-cond nt-ch" draggable="${pode}" data-arrastar-cond="${esc(d.name)}" data-emb="${e.id}" title="Arraste para um campo de Condição da Ação">
      <span class="nt-cond-ic nt-ch"><img src="${esc(d.img || "icons/svg/aura.svg")}" alt=""></span>
      <div class="nt-cond-txt">
        <div class="nt-cond-nome"><b>${esc(d.name)}</b>${chips}</div>
        <span class="nt-cond-desc">${esc(desc) || "<i>sem descrição</i>"}</span>
        ${usos.length ? `<div class="nt-cond-usos">${usos.join("")}</div>` : `<div class="nt-cond-usos"><span class="nt-chip nt-ch">ainda não usada — escolha nas Ações (campo de Condição) ou num script</span></div>`}
      </div>
      ${pode ? `<div class="nt-cond-bts"><button type="button" class="nt-ib nt-ch" data-action="condEditar" data-emb="${e.id}" title="Editar"><i class="fas fa-pen"></i></button><button type="button" class="nt-ib nt-ch" data-action="condDuplicar" data-emb="${e.id}" title="Duplicar"><i class="fas fa-copy"></i></button><button type="button" class="nt-ib nt-ch perigo" data-action="condApagar" data-emb="${e.id}" title="Apagar"><i class="fas fa-trash"></i></button></div>` : ""}
    </div>`;
  }).join("");
  return `<p class="nt-nota nt-nota-aba">Condições que <b>viajam junto com este item</b> (exportar e importar o JSON, arrastar para outra ficha). As Ações e os scripts deste item podem aplicá-las sem depender de compêndio.</p>
    ${lista.length ? `<div class="nt-conds">${cartoes}</div>` : ""}
    ${pode ? `<div class="nt-solta nt-ch">
      <div><i class="fas fa-hand-holding-droplet"></i><span>Arraste uma Condição (do compêndio, do mundo ou de uma ficha) para copiar para dentro do item.</span></div>
      <div class="nt-bts"><button type="button" class="nt-bt nt-ch ouro-l" data-action="condCompendio"><i class="fas fa-book"></i> Do compêndio</button><button type="button" class="nt-bt nt-ch ouro" data-action="condNova"><i class="fas fa-plus"></i> Nova</button></div>
    </div>` : ""}
    ${lista.length ? `<p class="nt-nota">Na Ação: no campo de Condição, clique em <i class="fas fa-list-ul"></i> e escolha “Deste item”, ou arraste o cartão para o campo.</p>` : ""}`;
}
