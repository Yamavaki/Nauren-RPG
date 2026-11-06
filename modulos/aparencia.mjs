/**
 * Nauren RPG — Aparência (0.105).
 *
 * Qualquer Condição, Efeito, Habilidade, Peculiaridade, arma ou armadura pode mudar a aparência do personagem
 * NO MAPA enquanto vale: imagem do token, tamanho, borda (manter, uma pronta, uma própria montada no editor, ou
 * nenhuma) e, se quiser, o retrato da ficha junto. Pode ter uma animação e um som ao entrar e ao sair.
 *
 * Quando vale: enquanto o item está ativo (Condição/Efeito ligado, arma/armadura equipada, Habilidade na ficha)
 * E todos os gatilhos dele batem (Vida abaixo de X%, Vida 0, tem tal Condição, recurso ≥/≤ N, em combate, no seu turno).
 *
 * Várias ao mesmo tempo: cada parte (imagem, tamanho, borda, retrato) é decidida separada; ganha a de maior
 * prioridade que mexe naquela parte. Sem nenhuma valendo, volta sozinho à aparência normal (guardada no ator).
 *
 * Guardado em flags.nauren.aparencia de cada item (não precisa de campo novo em cada tipo de item).
 * Quem aplica: o Mestre ativo; sem Mestre conectado, o primeiro dono conectado (evita aplicar duas vezes).
 */
import { naurenBordaAplicar, naurenBordaConfig, naurenBordaPreviaDataUrl } from "./borda-token.mjs";
import { naurenProntaCfgPara, naurenProntaPorId, naurenProntaDados } from "./molduras-prontas.mjs";

const SIS = "nauren";
export const NAUREN_APARENCIA_TIPOS = new Set(["condicao", "efeito", "habilidade", "peculiaridade", "arma", "armadura"]);
export const NAUREN_APARENCIA_GATILHOS = [
  { id: "vidaAbaixo", rotulo: "Vida abaixo de", campos: ["pct"] },
  { id: "vidaZero", rotulo: "Vida em 0" },
  { id: "condicao", rotulo: "Tem a Condição", campos: ["nome", "acumulos"] },
  { id: "semCondicao", rotulo: "Não tem a Condição", campos: ["nome"] },
  { id: "recurso", rotulo: "Recurso", campos: ["recurso", "op", "valor"] },
  { id: "emCombate", rotulo: "Em combate" },
  { id: "foraCombate", rotulo: "Fora de combate" },
  { id: "meuTurno", rotulo: "No seu turno" }
];
export const NAUREN_APARENCIA_RECURSOS = [["vida", "Vida"], ["mana", "Mana"], ["estaminaCombate", "Estamina"], ["stress", "Estresse"], ["dadosDestino", "Dados de Destino"], ["escudo", "Escudo"]];
/** Animações prontas sugeridas (JB2A gratuito/Patreon pelo Sequencer). Pode digitar qualquer outra. */
export const NAUREN_APARENCIA_ANIMS = [
  "jb2a.impact.ground_crack.orange.02", "jb2a.explosion.01.orange", "jb2a.misty_step.01.blue", "jb2a.misty_step.02.purple",
  "jb2a.divine_smite.caster.reversed.yellowwhite", "jb2a.energy_strands.overlay.dark_purple", "jb2a.shield.01.complete.01.blue",
  "jb2a.fumes.fire.orange", "jb2a.smoke.puff.centered.grey", "jb2a.sparkles.01.yellow", "jb2a.token_border.circle.static.orange.003"
];

export const NAUREN_APARENCIA_PADRAO = () => ({
  ativa: false, prioridade: 1, imagem: "", retrato: false, tamanho: "",
  borda: { modo: "manter", prontaId: "", dados: null },
  entrada: { anim: "", som: "" }, saida: { anim: "", som: "" },
  gatilhos: []
});

/* ------------------------------ dados ------------------------------ */
export function naurenAparenciaNormalizar(a) {
  const p = NAUREN_APARENCIA_PADRAO(); a = a && typeof a === "object" ? a : {};
  const str = v => (typeof v === "string" ? v.trim() : "");
  const out = {
    ativa: !!a.ativa,
    prioridade: Math.max(1, Math.min(10, Math.round(Number(a.prioridade) || p.prioridade))),
    imagem: str(a.imagem), retrato: !!a.retrato,
    tamanho: /^\d+(\.\d+)?$/.test(String(a.tamanho ?? "").trim()) ? String(a.tamanho).trim() : "",
    borda: { modo: ["manter", "pronta", "propria", "sem"].includes(a.borda?.modo) ? a.borda.modo : "manter", prontaId: str(a.borda?.prontaId), dados: a.borda?.dados && typeof a.borda.dados === "object" ? a.borda.dados : null },
    entrada: { anim: str(a.entrada?.anim), som: str(a.entrada?.som) },
    saida: { anim: str(a.saida?.anim), som: str(a.saida?.som) },
    gatilhos: (Array.isArray(a.gatilhos) ? a.gatilhos : []).filter(g => NAUREN_APARENCIA_GATILHOS.some(d => d.id === g?.tipo)).slice(0, 8).map(g => ({
      tipo: g.tipo, pct: Math.max(1, Math.min(99, Number(g.pct) || 50)), nome: str(g.nome), acumulos: Math.max(1, Math.round(Number(g.acumulos) || 1)),
      recurso: str(g.recurso) || "vida", op: g.op === "le" ? "le" : "ge", valor: Math.round(Number(g.valor) || 0)
    }))
  };
  return out;
}
export function naurenAparenciaDe(item) {
  if (!item || !NAUREN_APARENCIA_TIPOS.has(item.type)) return null;
  const a = item.getFlag?.(SIS, "aparencia") ?? item.flags?.[SIS]?.aparencia;
  return a ? naurenAparenciaNormalizar(a) : null;
}
/** A aparência muda alguma coisa? (sem nada preenchido não conta) */
const mudaAlgo = a => !!(a.imagem || a.tamanho || a.borda.modo !== "manter");

/** O item está "valendo" (ligado/equipado/na ficha)? */
export function naurenAparenciaItemValendo(item) {
  if (item.type === "condicao" && (item.getFlag?.(SIS, "modelo"))) return false;
  if (item.type === "condicao" || item.type === "efeito") return item.system?.ativo !== false;
  if (item.system && "equipado" in item.system) return !!item.system.equipado;
  return true;
}

/* ------------------------------ gatilhos ------------------------------ */
const normal = s => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
function valorRecurso(actor, chave) {
  const s = actor?.system ?? {};
  if (s[chave] && typeof s[chave] === "object" && "value" in s[chave]) return Number(s[chave].value) || 0;
  const rc = (s.recursosCustom ?? []).find(r => r.chaveInterna === chave || r.id === chave || normal(r.nome) === normal(chave));
  return rc ? Number(rc.valor) || 0 : 0;
}
function emCombate(actor) { const c = game.combat; return !!(c?.started && c.combatants?.some(x => x.actor === actor || x.actorId === actor?.id && actor?.isToken !== true)); }
export function naurenAparenciaGatilhoBate(actor, g) {
  const vida = actor?.system?.vida ?? {}, max = Number(vida.max) || 0, v = Number(vida.value) || 0;
  switch (g.tipo) {
    case "vidaAbaixo": return max > 0 && v / max * 100 < g.pct;
    case "vidaZero": return v <= 0;
    case "condicao": return (actor?.items ?? []).some(i => i.type === "condicao" && i.system?.ativo !== false && normal(i.name) === normal(g.nome) && (i.system?.acumulativel ? (Number(i.system.acumulos) || 1) : 1) >= g.acumulos);
    case "semCondicao": return !(actor?.items ?? []).some(i => i.type === "condicao" && i.system?.ativo !== false && normal(i.name) === normal(g.nome));
    case "recurso": { const n = valorRecurso(actor, g.recurso); return g.op === "le" ? n <= g.valor : n >= g.valor; }
    case "emCombate": return emCombate(actor);
    case "foraCombate": return !emCombate(actor);
    case "meuTurno": { const c = game.combat?.combatant; return !!(game.combat?.started && c && (c.actor === actor || (c.actorId === actor?.id && !actor?.isToken))); }
  }
  return false;
}

/* ------------------------------ resolver ------------------------------ */
/** Aparências valendo agora no ator, da maior prioridade para a menor. */
export function naurenAparenciasAtivas(actor) {
  const lista = [];
  for (const item of actor?.items ?? []) {
    const a = naurenAparenciaDe(item);
    if (!a?.ativa || !mudaAlgo(a) || !naurenAparenciaItemValendo(item)) continue;
    if (!a.gatilhos.every(g => naurenAparenciaGatilhoBate(actor, g))) continue;
    lista.push({ item, a });
  }
  return lista.sort((x, y) => y.a.prioridade - x.a.prioridade || (y.item.sort ?? 0) - (x.item.sort ?? 0));
}
/** Cada parte vem da aparência de maior prioridade que mexe nela. */
export function naurenAparenciaResolver(ativas) {
  const r = { imagem: null, retrato: false, tamanho: null, borda: null, de: {} };
  for (const { item, a } of ativas) {
    if (a.imagem && !r.imagem) { r.imagem = a.imagem; r.retrato = a.retrato; r.de.imagem = item.id; }
    if (a.tamanho && !r.tamanho) { r.tamanho = Number(a.tamanho); r.de.tamanho = item.id; }
    if (a.borda.modo !== "manter" && !r.borda) { r.borda = a.borda; r.de.borda = item.id; }
  }
  return r;
}

/* ------------------------------ aplicar ------------------------------ */
const limparSrc = s => String(s ?? "").replace(/([?&])nauren-borda=[^&]*&?/, "$1").replace(/[?&]$/, "");
function responsavel(actor) {
  const gm = game.users?.activeGM;
  if (gm) return gm.id === game.user?.id;
  const dono = game.users?.find(u => u.active && !u.isGM && actor?.testUserPermission?.(u, "OWNER"));
  return dono ? dono.id === game.user?.id : false;
}
const tokensDe = actor => (actor?.getActiveTokens?.(false, true) ?? []).filter(Boolean);
/** Aparência normal do personagem (guardada ao entrar na primeira aparência, para voltar depois). */
function capturarBase(actor, td) {
  const borda = td?.getFlag?.(SIS, "borda") ?? actor.getFlag?.(SIS, "borda") ?? null;
  return {
    src: limparSrc(borda?.src || td?.texture?.src || actor.prototypeToken?.texture?.src || actor.img),
    width: Number(td?.width) || 1, height: Number(td?.height) || 1,
    scaleX: Number(td?.texture?.scaleX) || 1, scaleY: Number(td?.texture?.scaleY) || 1,
    ring: !!td?.ring?.enabled, lockRotation: !!td?.lockRotation,
    borda: borda ? foundry.utils.deepClone(borda) : null,
    retrato: actor.img
  };
}
async function cfgBorda(r, base, src) {
  const b = r.borda;
  if (!b) return base.borda?.ativa ? { ...base.borda, src } : null; // manter a de sempre (com a imagem nova)
  if (b.modo === "sem") return null;
  const dados = b.modo === "pronta" ? naurenProntaPorId(b.prontaId)?.dados : b.dados;
  if (!dados) return base.borda?.ativa ? { ...base.borda, src } : null;
  return naurenProntaCfgPara(dados, { ...(base.borda ?? {}), src });
}
async function aplicarNoToken(actor, td, r, base) {
  const src = r.imagem || base.src;
  const cfg = await cfgBorda(r, base, src);
  const tam = r.tamanho || null;
  if (cfg) await naurenBordaAplicar(actor, cfg, { tokenDoc: td, soToken: true });
  else if (td.getFlag?.(SIS, "borda")?.ativa) await naurenBordaAplicar(actor, { ...naurenBordaConfig({ flags: { nauren: { borda: td.getFlag(SIS, "borda") } } }), ativa: false }, { tokenDoc: td, soToken: true });
  const upd = {};
  if (!cfg) { upd["texture.src"] = src; if (!base.borda?.ativa) { upd["texture.scaleX"] = base.scaleX; upd["texture.scaleY"] = base.scaleY; } }
  upd.width = tam ?? base.width; upd.height = tam ?? base.height;
  await td.update(upd);
}
async function restaurarToken(actor, td, base) {
  if (base.borda?.ativa) await naurenBordaAplicar(actor, base.borda, { tokenDoc: td, soToken: true });
  else {
    if (td.getFlag?.(SIS, "borda")?.ativa) await naurenBordaAplicar(actor, { ...naurenBordaConfig({ flags: { nauren: { borda: td.getFlag(SIS, "borda") } } }), ativa: false }, { tokenDoc: td, soToken: true });
    await td.update({ "texture.src": base.src, "texture.scaleX": base.scaleX, "texture.scaleY": base.scaleY, "ring.enabled": base.ring, lockRotation: base.lockRotation });
  }
  await td.update({ width: base.width, height: base.height });
}
/** Animação + som (Sequencer, se estiver instalado) no token. */
export async function naurenAparenciaTransicao(td, t) {
  if (!t || (!t.anim && !t.som)) return;
  try {
    const obj = td?.object;
    if (t.anim && obj && globalThis.Sequence && game.modules?.get("sequencer")?.active) new Sequence().effect().file(t.anim).atLocation(obj).scaleToObject(2).play();
    if (t.som) foundry.audio?.AudioHelper?.play?.({ src: t.som, volume: .8, autoplay: true, loop: false }, true);
  } catch (err) { console.warn("Nauren RPG | Aparência: transição", err); }
}

const emAndamento = new Map(), pendentes = new Map();
/** Reavalia e aplica a aparência do ator (com espera curta para juntar várias mudanças). */
export function naurenAparenciaAgendar(actor, { forcar = false } = {}) {
  if (!actor) return;
  const k = actor.uuid ?? actor.id;
  clearTimeout(pendentes.get(k)?.t);
  pendentes.set(k, { forcar: forcar || pendentes.get(k)?.forcar, t: setTimeout(() => { const f = pendentes.get(k)?.forcar; pendentes.delete(k); naurenAparenciaAtualizar(actor, { forcar: f }); }, 120) });
}
export async function naurenAparenciaAtualizar(actor, { forcar = false } = {}) {
  if (!actor || !responsavel(actor)) return;
  const k = actor.uuid ?? actor.id;
  if (emAndamento.get(k)) { emAndamento.set(k, "denovo"); return; }
  emAndamento.set(k, true);
  try {
    const ativas = naurenAparenciasAtivas(actor), r = naurenAparenciaResolver(ativas);
    const tds = tokensDe(actor);
    let base = actor.getFlag(SIS, "aparenciaBase");
    const antes = actor.getFlag(SIS, "aparenciaAplicada") ?? { ids: [], saidas: {} };
    const ids = ativas.map(x => x.item.id);
    const sig = JSON.stringify({ i: r.imagem, t: r.tamanho, b: r.borda, ret: r.retrato, base: base?.src });
    if (!ativas.length) {
      if (!base) return;
      for (const td of tds) { await restaurarToken(actor, td, base); await td.unsetFlag?.(SIS, "aparenciaSig"); }
      if (base.retratoTrocado && actor.img !== base.retrato) await actor.update({ img: base.retrato });
      for (const id of antes.ids) for (const td of tds) await naurenAparenciaTransicao(td, antes.saidas?.[id]);
      await actor.unsetFlag(SIS, "aparenciaBase"); await actor.unsetFlag(SIS, "aparenciaAplicada");
      return;
    }
    if (!base) { base = capturarBase(actor, tds[0]); await actor.setFlag(SIS, "aparenciaBase", base); }
    for (const td of tds) {
      if (!forcar && td.getFlag?.(SIS, "aparenciaSig") === sig) continue;
      await aplicarNoToken(actor, td, r, base);
      await td.setFlag?.(SIS, "aparenciaSig", sig);
    }
    // retrato da ficha junto (opcional)
    if (r.imagem && r.retrato) { if (actor.img !== r.imagem) { await actor.update({ img: r.imagem }); if (!base.retratoTrocado) await actor.setFlag(SIS, "aparenciaBase", { ...base, retratoTrocado: true }); } }
    else if (base.retratoTrocado && actor.img !== base.retrato) { await actor.update({ img: base.retrato }); await actor.setFlag(SIS, "aparenciaBase", { ...base, retratoTrocado: false }); }
    // transições: quem entrou e quem saiu
    const entraram = ativas.filter(x => !antes.ids.includes(x.item.id)), sairam = antes.ids.filter(id => !ids.includes(id));
    for (const x of entraram) for (const td of tds) await naurenAparenciaTransicao(td, x.a.entrada);
    for (const id of sairam) for (const td of tds) await naurenAparenciaTransicao(td, antes.saidas?.[id]);
    await actor.setFlag(SIS, "aparenciaAplicada", { ids, saidas: Object.fromEntries(ativas.map(x => [x.item.id, x.a.saida])) });
  } catch (err) { console.warn("Nauren RPG | Aparência", err); }
  finally {
    const denovo = emAndamento.get(k) === "denovo"; emAndamento.delete(k);
    if (denovo) naurenAparenciaAgendar(actor);
  }
}

/* ------------------------------ ganchos ------------------------------ */
const temAparencia = actor => (actor?.items ?? []).some(i => i.getFlag?.(SIS, "aparencia")?.ativa) || !!actor?.getFlag?.(SIS, "aparenciaBase");
export function naurenAparenciaHooks() {
  const doItem = item => { const a = item?.parent; if (a?.documentName === "Actor" && temAparencia(a)) naurenAparenciaAgendar(a); };
  Hooks.on("createItem", doItem); Hooks.on("updateItem", doItem); Hooks.on("deleteItem", (item) => { const a = item?.parent; if (a?.documentName === "Actor" && (a.getFlag?.(SIS, "aparenciaBase") || temAparencia(a))) naurenAparenciaAgendar(a); });
  Hooks.on("updateActor", (actor, changes) => {
    if (!temAparencia(actor)) return;
    // o jogador mudou a borda de sempre no meio de uma aparência: ela vira a nova base e reaplica
    const base = actor.getFlag(SIS, "aparenciaBase");
    if (base && foundry.utils.hasProperty(changes, "flags.nauren.borda") && responsavel(actor)) {
      actor.setFlag(SIS, "aparenciaBase", { ...base, borda: foundry.utils.deepClone(actor.getFlag(SIS, "borda")) }).then(() => naurenAparenciaAgendar(actor, { forcar: true }));
      return;
    }
    naurenAparenciaAgendar(actor);
  });
  const doCombate = combate => { for (const c of combate?.combatants ?? []) if (c.actor && temAparencia(c.actor)) naurenAparenciaAgendar(c.actor); };
  Hooks.on("updateCombat", doCombate); Hooks.on("combatStart", doCombate); Hooks.on("deleteCombat", doCombate);
  Hooks.on("createToken", doc => { if (doc.actor && temAparencia(doc.actor)) naurenAparenciaAgendar(doc.actor, { forcar: true }); });
  Hooks.on("canvasReady", () => { for (const t of canvas.tokens?.placeables ?? []) if (t.actor && temAparencia(t.actor)) naurenAparenciaAgendar(t.actor); });
}

/* ------------------------------ migração: Transformação de Token → Aparência ------------------------------ */
export async function naurenAparenciaMigrar() {
  if (!game.user?.isGM || game.users?.activeGM?.id !== game.user.id) return;
  const itens = [...game.items];
  for (const a of game.actors) itens.push(...a.items);
  for (const cena of game.scenes) for (const t of cena.tokens) if (!t.actorLink && t.actor) itens.push(...t.actor.items);
  let n = 0;
  for (const item of itens) {
    if (!item.system?.usaTransformacao || item.getFlag(SIS, "aparencia")) continue;
    const ap = { ...NAUREN_APARENCIA_PADRAO(), ativa: true, imagem: item.system.transformacaoImagem || "", tamanho: item.system.transformacaoTamanho || "", borda: { modo: "manter", prontaId: "", dados: null } };
    try { await item.update({ "flags.nauren.aparencia": ap, "system.usaTransformacao": false }); n++; } catch (err) { /* sem permissão */ }
  }
  if (n) console.log(`Nauren RPG | ${n} Transformação(ões) de Token viraram Aparência.`);
}

/* ------------------------------ painel na ficha do item ------------------------------ */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
const QUANDO = { condicao: "Enquanto esta Condição estiver na ficha (e ligada)", efeito: "Enquanto este Efeito estiver ligado", habilidade: "Enquanto esta Habilidade estiver na ficha", peculiaridade: "Enquanto esta Peculiaridade estiver na ficha", arma: "Enquanto esta arma estiver equipada", armadura: "Enquanto esta armadura estiver equipada" };
function linhaGatilho(g, i) {
  const def = NAUREN_APARENCIA_GATILHOS.find(d => d.id === g.tipo);
  const tipos = NAUREN_APARENCIA_GATILHOS.map(d => `<option value="${d.id}" ${d.id === g.tipo ? "selected" : ""}>${d.rotulo}</option>`).join("");
  let extra = "";
  if (def.campos?.includes("pct")) extra += `<input type="number" class="ap-num" data-ap-g="${i}" data-c="pct" min="1" max="99" value="${g.pct}"><span class="ap-u">%</span>`;
  if (def.campos?.includes("nome")) extra += `<input type="text" class="ap-txt" data-ap-g="${i}" data-c="nome" value="${esc(g.nome)}" placeholder="nome da Condição">`;
  if (def.campos?.includes("acumulos")) extra += `<span class="ap-u">com</span><input type="number" class="ap-num" data-ap-g="${i}" data-c="acumulos" min="1" value="${g.acumulos}"><span class="ap-u">acúmulo(s)+</span>`;
  if (def.campos?.includes("recurso")) extra += `<select data-ap-g="${i}" data-c="recurso">${NAUREN_APARENCIA_RECURSOS.map(([k, r]) => `<option value="${k}" ${g.recurso === k ? "selected" : ""}>${r}</option>`).join("")}${NAUREN_APARENCIA_RECURSOS.some(([k]) => k === g.recurso) ? "" : `<option value="${esc(g.recurso)}" selected>${esc(g.recurso)}</option>`}</select><select data-ap-g="${i}" data-c="op"><option value="ge" ${g.op === "ge" ? "selected" : ""}>≥</option><option value="le" ${g.op === "le" ? "selected" : ""}>≤</option></select><input type="number" class="ap-num" data-ap-g="${i}" data-c="valor" value="${g.valor}">`;
  return `<div class="ap-gat nt-ch" data-i="${i}"><select data-ap-g="${i}" data-c="tipo">${tipos}</select>${extra}<button type="button" class="ap-x" data-ap-acao="tirarGatilho" data-i="${i}" title="Tirar"><i class="fas fa-xmark"></i></button></div>`;
}
export function naurenAparenciaHtml(item, prontas = []) {
  const a = naurenAparenciaDe(item) ?? NAUREN_APARENCIA_PADRAO();
  const cond = item.type === "condicao";
  const bm = a.borda.modo;
  const seg = (v, rot, ic) => `<button type="button" class="ap-seg ${bm === v ? "on" : ""}" data-ap-acao="bordaModo" data-v="${v}"><i class="fas ${ic}"></i> ${rot}</button>`;
  const opTam = ["", "1", "2", "3", "4"].map(v => `<option value="${v}" ${a.tamanho === v ? "selected" : ""}>${v ? `${v}×${v}` : "Manter"}</option>`).join("") + (a.tamanho && !["1", "2", "3", "4"].includes(a.tamanho) ? `<option value="${a.tamanho}" selected>${a.tamanho}×${a.tamanho}</option>` : "");
  const anims = `<datalist id="ap-anims-${item.id}">${NAUREN_APARENCIA_ANIMS.map(x => `<option value="${x}">`).join("")}</datalist>`;
  const trans = (k, rot) => `<div class="ap-trans"><span class="ap-rot">${rot}</span><input type="text" class="ap-txt" data-ap="${k}.anim" list="ap-anims-${item.id}" value="${esc(a[k].anim)}" placeholder="animação (ex.: jb2a.misty_step.01.blue)"><span class="ap-arq"><input type="text" class="ap-txt" data-ap="${k}.som" value="${esc(a[k].som)}" placeholder="som (.ogg)"><button type="button" class="ap-ic" data-ap-acao="arquivo" data-alvo="${k}.som" data-tipo="audio" title="Escolher som"><i class="fas fa-folder-open"></i></button></span></div>`;
  return `<div class="ap-painel">
    ${cond ? `<div class="ap-bloco nt-ch"><div class="ap-cab"><i class="fas fa-eye"></i><b>Ícone desta Condição</b></div>
      <div class="ap-segs">${["sempre", "ficha"].map(v => `<button type="button" class="ap-seg ${(item.system.iconeVisivel ?? "sempre") === v ? "on" : ""}" data-ap-acao="icone" data-v="${v}">${v === "sempre" ? `<i class="fas fa-location-dot"></i> No token e na ficha` : `<i class="fas fa-eye-slash"></i> Só na ficha`}</button>`).join("")}</div>
      <p class="ap-dica">"Só na ficha": o ícone não aparece no token, no HUD de Combate nem nas barras. Boa para Condições que só mudam a aparência.</p></div>` : ""}
    <div class="ap-bloco nt-ch">
      <div class="ap-cab"><i class="fas fa-masks-theater"></i><b>Aparência no mapa</b><label class="ap-sw"><input type="checkbox" class="nm-chave" data-ap="ativa" ${a.ativa ? "checked" : ""}> ${a.ativa ? "Ligada" : "Desligada"}</label></div>
      <p class="ap-dica">Muda como o personagem aparece no mapa enquanto valer. Só o que estiver preenchido muda; o resto fica como está. Sai sozinho e volta ao normal.</p>
      <div class="ap-corpo ${a.ativa ? "" : "ap-off"}">
        <div class="ap-grade">
          <div class="ap-campo"><span class="ap-rot">Imagem nova</span>
            <span class="ap-arq">${a.imagem ? `<img class="ap-mini" src="${esc(a.imagem)}" alt="">` : ""}<input type="text" class="ap-txt" data-ap="imagem" value="${esc(a.imagem)}" placeholder="vazio = mantém a imagem"><button type="button" class="ap-ic" data-ap-acao="arquivo" data-alvo="imagem" data-tipo="image" title="Escolher imagem"><i class="fas fa-folder-open"></i></button></span>
            <label class="ap-check"><input type="checkbox" data-ap="retrato" ${a.retrato ? "checked" : ""}> Trocar também o retrato da ficha</label></div>
          <div class="ap-campo ap-tam"><span class="ap-rot">Tamanho do token</span><select data-ap="tamanho">${opTam}</select></div>
        </div>
        <div class="ap-campo"><span class="ap-rot">Borda</span>
          <div class="ap-segs">${seg("manter", "Manter a atual", "fa-equals")}${seg("pronta", "Uma pronta", "fa-crown")}${seg("propria", "Montar a minha", "fa-palette")}${seg("sem", "Sem borda", "fa-ban")}</div>
          ${bm === "pronta" ? `<select data-ap="borda.prontaId"><option value="">Escolha uma pronta…</option>${prontas.map(p => `<option value="${esc(p.id)}" ${a.borda.prontaId === p.id ? "selected" : ""}>${esc(p.nome)}</option>`).join("")}</select>${prontas.length ? "" : `<p class="ap-dica">Ainda não há molduras prontas (o Mestre cria na janela da borda → Prontas do Mestre).</p>`}` : ""}
          ${bm === "propria" ? `<div class="ap-propria"><button type="button" class="na-btn" data-ap-acao="montarBorda"><i class="fas fa-palette"></i> ${a.borda.dados ? "Editar a borda" : "Montar a borda"}</button><span class="ap-dica">${a.borda.dados ? `Modelo: <b>${esc(a.borda.dados.modelo === "foundry" ? "Padrão do Foundry" : a.borda.dados.modelo)}</b>` : "Abre o editor de bordas; ela fica guardada neste item."}</span></div>` : ""}
        </div>
        <div class="ap-campo"><span class="ap-rot">Quando vale</span>
          <p class="ap-dica"><i class="fas fa-circle-check"></i> ${QUANDO[item.type] ?? "Enquanto este item valer"}${a.gatilhos.length ? " <b>e</b> tudo isto:" : "."}</p>
          <div class="ap-gats">${a.gatilhos.map(linhaGatilho).join("")}</div>
          <button type="button" class="ap-mais" data-ap-acao="maisGatilho"><i class="fas fa-plus"></i> Gatilho</button></div>
        <div class="ap-campo"><span class="ap-rot">Transição (precisa do Sequencer para a animação)</span>${anims}${trans("entrada", "Ao entrar")}${trans("saida", "Ao sair")}</div>
        <div class="ap-grade">
          <div class="ap-campo ap-tam"><span class="ap-rot">Prioridade</span><input type="number" class="ap-num" data-ap="prioridade" min="1" max="10" value="${a.prioridade}"><span class="ap-dica">Com duas valendo, a maior ganha em cada parte.</span></div>
          <div class="ap-campo"><span class="ap-rot">Prévia</span><div class="ap-previa"><img data-ap-previa alt=""><span data-ap-previa-txt class="ap-dica">${a.imagem ? "" : "Sem imagem nova: a prévia usa a imagem do item."}</span></div></div>
        </div>
      </div>
    </div></div>`;
}

/** Liga o painel (chamado no _onRender da ficha do item). */
export function naurenAparenciaLigar(sheet) {
  const el = sheet.element, item = sheet.item;
  const painel = el?.querySelector('.nauren-aba-painel[data-aba="aparencia"]'); if (!painel || !item) return;
  const ler = () => naurenAparenciaNormalizar(foundry.utils.deepClone(item.getFlag(SIS, "aparencia") ?? NAUREN_APARENCIA_PADRAO()));
  const gravar = async a => { await item.update({ "flags.nauren.aparencia": naurenAparenciaNormalizar(a) }); if (sheet.rendered) sheet.render(); };
  painel.querySelectorAll("[data-ap]").forEach(inp => inp.addEventListener("change", async () => {
    const a = ler(), v = inp.type === "checkbox" ? inp.checked : inp.value;
    foundry.utils.setProperty(a, inp.dataset.ap, v); await gravar(a);
  }));
  painel.querySelectorAll("[data-ap-g]").forEach(inp => inp.addEventListener("change", async () => {
    const a = ler(), g = a.gatilhos[Number(inp.dataset.apG)]; if (!g) return;
    g[inp.dataset.c] = inp.value; await gravar(a);
  }));
  painel.querySelectorAll("[data-ap-acao]").forEach(bt => bt.addEventListener("click", async ev => {
    ev.preventDefault(); const acao = bt.dataset.apAcao, a = ler();
    if (acao === "icone") { await item.update({ "system.iconeVisivel": bt.dataset.v }); if (sheet.rendered) sheet.render(); return; }
    if (acao === "bordaModo") { a.borda.modo = bt.dataset.v; return gravar(a); }
    if (acao === "maisGatilho") { a.gatilhos.push({ tipo: "vidaAbaixo", pct: 50 }); return gravar(a); }
    if (acao === "tirarGatilho") { a.gatilhos.splice(Number(bt.dataset.i), 1); return gravar(a); }
    if (acao === "arquivo") {
      const FP = foundry.applications?.apps?.FilePicker?.implementation ?? globalThis.FilePicker;
      new FP({ type: bt.dataset.tipo, current: foundry.utils.getProperty(a, bt.dataset.alvo) || "", callback: async caminho => { const b = ler(); foundry.utils.setProperty(b, bt.dataset.alvo, caminho); await gravar(b); } }).render(true);
      return;
    }
    if (acao === "montarBorda") return naurenAparenciaMontarBorda(item);
  }));
  // prévia: a imagem da aparência com a borda que ela vai ter
  naurenAparenciaPrevia(item).then(url => { const img = painel.querySelector("[data-ap-previa]"); if (img && url) img.src = url; }).catch(() => {});
}
/** Ator para o editor de borda (o dono do item, ou um de mentira quando o item está solto no diretório). */
function atorParaEditor(item, src) {
  if (item.parent?.documentName === "Actor") return item.parent;
  return { name: item.name, img: src || item.img, uuid: null, isOwner: true, getFlag: () => null, prototypeToken: { texture: { src: src || item.img }, width: 1, height: 1 }, getActiveTokens: () => [] };
}
export async function naurenAparenciaMontarBorda(item) {
  const a = naurenAparenciaDe(item) ?? NAUREN_APARENCIA_PADRAO();
  const src = a.imagem || item.parent?.img || item.img;
  const { naurenAbrirMolduraEditor } = await import("./molduras-editor.mjs");
  const final = await naurenAbrirMolduraEditor(atorParaEditor(item, src), { srcInicial: src, soDevolver: true, cfgInicial: a.borda.dados, titulo: item.name });
  if (!final) return null;
  const b = naurenAparenciaNormalizar(foundry.utils.deepClone(item.getFlag(SIS, "aparencia") ?? a));
  b.borda = { modo: "propria", prontaId: "", dados: naurenProntaDados(final) };
  await item.update({ "flags.nauren.aparencia": b });
  return b.borda.dados;
}
export async function naurenAparenciaPrevia(item) {
  const a = naurenAparenciaDe(item) ?? NAUREN_APARENCIA_PADRAO();
  const src = a.imagem || item.parent?.prototypeToken?.texture?.src || item.parent?.img || item.img;
  const base = item.parent?.getFlag?.(SIS, "borda") ?? null;
  let cfg = null;
  if (a.borda.modo === "pronta" || a.borda.modo === "propria") { const dados = a.borda.modo === "pronta" ? naurenProntaPorId(a.borda.prontaId)?.dados : a.borda.dados; if (dados) cfg = await naurenProntaCfgPara(dados, { ...(base ?? {}), src: limparSrc(src) }); }
  else if (a.borda.modo === "manter" && base?.ativa) cfg = { ...naurenBordaConfig({ flags: { nauren: { borda: base } } }), src: limparSrc(src) };
  if (!cfg) return limparSrc(src);
  return naurenBordaPreviaDataUrl(cfg, 160);
}
