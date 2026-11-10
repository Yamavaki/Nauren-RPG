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
import { naurenMolduraCamadaDe } from "./molduras-token.mjs";
import { naurenProntaCfgPara, naurenProntaPorId, naurenProntaDados } from "./molduras-prontas.mjs";
import { naurenLog } from "./depuracao.mjs";

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

/** 0.105.2: ajustes da animação de transição (como no Automated Animations). Tamanho é em vezes o token. */
export const NAUREN_APARENCIA_TRANS_PADRAO = () => ({ anim: "", som: "", volume: .8, escala: 1.5, opacidade: 1, velocidade: 1, porBaixo: false, repetir: 1, atraso: 0, matiz: 0, espelhar: false });
function normTrans(t) {
  const p = NAUREN_APARENCIA_TRANS_PADRAO(); t = t && typeof t === "object" ? t : {};
  const n = (v, min, max, d) => { const x = Number(v); return Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : d; };
  return {
    anim: typeof t.anim === "string" ? t.anim.trim() : "", som: typeof t.som === "string" ? t.som.trim() : "",
    volume: n(t.volume, 0, 1, p.volume), escala: n(t.escala, .25, 6, p.escala), opacidade: n(t.opacidade, .1, 1, p.opacidade),
    velocidade: n(t.velocidade, .25, 3, p.velocidade), porBaixo: !!t.porBaixo, repetir: Math.round(n(t.repetir, 1, 5, 1)),
    atraso: Math.round(n(t.atraso, 0, 5000, 0)), matiz: Math.round(n(t.matiz, -180, 180, 0)), espelhar: !!t.espelhar
  };
}
export const NAUREN_APARENCIA_PADRAO = () => ({
  ativa: false, prioridade: 1, imagem: "", retrato: false, tamanho: "",
  borda: { modo: "manter", prontaId: "", dados: null },
  entrada: NAUREN_APARENCIA_TRANS_PADRAO(), saida: NAUREN_APARENCIA_TRANS_PADRAO(),
  suave: true, // 0.105.2: a imagem antiga some aos poucos por cima da nova
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
    entrada: normTrans(a.entrada), saida: normTrans(a.saida), suave: a.suave !== false,
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
/**
 * 0.105.2: o enquadre (posição, zoom e o que o pincel pintou) é da IMAGEM. Com imagem nova, o enquadre da imagem
 * antiga não serve: a borda montada na aparência traz o seu (feito sobre a imagem nova); senão, volta ao padrão.
 */
const ENQ = ["x", "y", "zoom", "mascara", "pincelNaFrente"];
function comEnquadre(cfg, src, enquadre, srcAntiga) {
  if (!cfg) return cfg;
  const out = { ...cfg, src };
  if (enquadre && limparSrc(enquadre.src) === limparSrc(src)) { for (const k of ENQ) if (enquadre[k] !== undefined) out[k] = foundry.utils.deepClone(enquadre[k]); }
  else if (limparSrc(srcAntiga) !== limparSrc(src)) { out.x = 50; out.y = 50; out.zoom = 1; out.mascara = []; }
  return out;
}
async function cfgBordaDe(borda, baseBorda, src) {
  const manter = () => baseBorda?.ativa ? comEnquadre({ ...baseBorda }, src, null, baseBorda.src) : null; // a de sempre (com a imagem nova)
  if (!borda || borda.modo === "manter") return manter();
  if (borda.modo === "sem") return null;
  const dados = borda.modo === "pronta" ? naurenProntaPorId(borda.prontaId)?.dados : borda.dados;
  if (!dados) return manter();
  return comEnquadre(await naurenProntaCfgPara(dados, { ...(baseBorda ?? {}), src }), src, dados.enquadre, baseBorda?.src);
}
const cfgBorda = (r, base, src) => cfgBordaDe(r.borda, base.borda, src);
export { cfgBordaDe as naurenAparenciaCfgBorda };
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
/* --------------------------- animações (Sequencer / JB2A) --------------------------- */
export function naurenAparenciaSequencerAtivo() { return !!(game.modules?.get("sequencer")?.active && globalThis.Sequence); }
/** Módulos de animação conhecidos que estão ativos (JB2A grátis, JB2A Patreon). */
export function naurenAparenciaJb2aAtivo() { return ["jb2a_patreon", "JB2A_DnD5e"].some(id => game.modules?.get(id)?.active); }
/** Todas as animações que o Sequencer conhece (o banco dele é preenchido pelos módulos ativos: JB2A e outros). */
export function naurenAparenciaAnimacoes() {
  if (!naurenAparenciaSequencerAtivo()) return [];
  const db = globalThis.Sequencer?.Database;
  let lista = [];
  try { lista = db?.publicFlattenedSimpleEntries ?? db?.publicFlattenedEntries ?? []; } catch (err) { lista = []; }
  lista = [...new Set((Array.isArray(lista) ? lista : []).filter(x => typeof x === "string"))];
  return lista.length ? lista.sort() : (naurenAparenciaJb2aAtivo() ? NAUREN_APARENCIA_ANIMS : []);
}
/** A animação existe? (no banco do Sequencer, ou é um arquivo .webm/.webp/.png/.gif) */
export function naurenAparenciaAnimValida(anim) {
  if (!anim) return true;
  if (/\.(webm|webp|png|gif|apng|mp4|json)(\?|$)/i.test(anim)) return true;
  if (!naurenAparenciaSequencerAtivo()) return false;
  try { const db = globalThis.Sequencer?.Database; if (db?.entryExists) return !!db.entryExists(anim); } catch (err) { /* segue */ }
  return naurenAparenciaAnimacoes().includes(anim);
}
/**
 * Animação + som no token. 0.105.3: começa junto com a troca, no centro e no tamanho que o token vai ter (tamFinal, em casas),
 * usando o "molde" das animações do JB2A (scaleToObject), para a parte visível da animação cobrir o token.
 */
export async function naurenAparenciaTransicao(td, t, { tamFinal = null } = {}) {
  t = normTrans(t);
  if (!t.anim && !t.som) return;
  try {
    const obj = td?.object;
    if (t.anim && naurenAparenciaSequencerAtivo() && obj && !obj.destroyed && naurenAparenciaAnimValida(t.anim)) {
      const agora = Math.max(Number(td.width) || 1, Number(td.height) || 1);
      const fim = Math.max(agora, Number(tamFinal) || agora);
      // tamanho calculado uma vez, já no tamanho final (o token cresce a partir do canto de cima à esquerda)
      const g = canvas.dimensions?.size ?? 100, desl = (fim - agora) * g / 2;
      let ef = new Sequence().effect().file(t.anim).atLocation(obj, desl ? { offset: { x: desl, y: desl } } : {}).scaleToObject(t.escala * fim / agora)
        .opacity(t.opacidade).playbackRate(t.velocidade);
      if (t.porBaixo) ef = ef.belowTokens(); else if (typeof ef.aboveLighting === "function") ef = ef.aboveLighting();
      if (t.repetir > 1) ef = ef.repeats(t.repetir, 120);
      if (t.atraso) ef = ef.delay(t.atraso);
      if (t.matiz) ef = ef.filter("ColorMatrix", { hue: t.matiz });
      if (t.espelhar) ef = ef.mirrorX();
      ef.play(); // não espera: a troca acontece enquanto a animação toca
    }
    if (t.som) foundry.audio?.AudioHelper?.play?.({ src: t.som, volume: t.volume, autoplay: true, loop: false }, true);
  } catch (err) { console.warn("Nauren RPG | Aparência: transição", err); }
}

/* --------------------------- troca suave da imagem --------------------------- */
/**
 * 0.105.3: troca suave = o token (arte + moldura) esmaece, a aparência nova é montada enquanto ele está apagado
 * e depois ele volta aos poucos. Roda em cada tela, só mexendo no alfa local (nada vai para o banco de dados).
 * (A 0.105.2 tirava uma "foto" do mapa, mas a foto saía deslocada.)
 */
const SAI = 220, VOLTA = 380, MAX = 3500;
const fades = new Map();
function alfaBase(token) { return (token?.alpha ?? 1) * (token?.document?.alpha ?? 1); }
function aplicarAlfa(token, f) {
  if (!token || token.destroyed) return;
  const tm = token.mesh; if (tm && !tm.destroyed) tm.alpha = alfaBase(token) * f;
  const cam = naurenMolduraCamadaDe(token);
  if (cam) for (const m of [cam.atras, cam.fundo, cam.mesh, cam.frente]) if (m && !m.destroyed) m.alpha = (tm?.alpha ?? f);
}
function naurenAparenciaEsmaecer(td) {
  try {
    if (!td || !canvas?.ready || td.parent?.id !== canvas.scene?.id) return;
    const ant = fades.get(td.id); if (ant) { ant.fim = 0; return; }
    const st = { ini: performance.now(), fim: 0 };
    fades.set(td.id, st);
    const passo = () => {
      const token = td.object, agora = performance.now();
      if (!st.fim && agora - st.ini > MAX) st.fim = agora; // segurança
      let f;
      if (!st.fim || agora < st.fim) f = Math.max(0, 1 - (agora - st.ini) / SAI);
      else f = Math.min(1, (agora - st.fim) / VOLTA);
      const e = f * f * (3 - 2 * f); // suaviza
      aplicarAlfa(token, e);
      if (st.fim && agora - st.fim >= VOLTA) {
        canvas.app.ticker.remove(passo); fades.delete(td.id);
        aplicarAlfa(token, 1); try { naurenMolduraCamadaDe(token)?.sincronizar?.(); } catch (err) { /* ok */ }
      }
    };
    canvas.app.ticker.add(passo, null, PIXI.UPDATE_PRIORITY?.NORMAL ?? 0);
  } catch (err) { console.debug?.("Nauren RPG | Aparência: troca suave indisponível", err); }
}
function naurenAparenciaReacender(id) { const f = fades.get(id); if (f && !f.fim) f.fim = Math.max(performance.now(), f.ini + SAI); }

/** Faz a troca com a foto por cima (em todas as telas): avisa o início, troca, avisa o fim. */
async function trocar(td, suave, fazer) {
  if (suave && td?.parent) { await td.update({ "flags.nauren.aparenciaTroca": { fase: "ini", t: Date.now() } }).catch(() => {}); await new Promise(r => setTimeout(r, 240)); }
  try { await fazer(); }
  finally { if (suave && td?.parent) await td.update({ "flags.nauren.aparenciaTroca": { fase: "fim", t: Date.now() } }).catch(() => {}); }
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
      for (const td of tds) {
        for (const id of antes.ids) await naurenAparenciaTransicao(td, antes.saidas?.[id], { tamFinal: base.width });
        await trocar(td, antes.suave !== false, () => restaurarToken(actor, td, base)); await td.unsetFlag?.(SIS, "aparenciaSig");
      }
      if (base.retratoTrocado && actor.img !== base.retrato) await actor.update({ img: base.retrato });
      await actor.unsetFlag(SIS, "aparenciaBase"); await actor.unsetFlag(SIS, "aparenciaAplicada");
      return;
    }
    if (!base) { base = capturarBase(actor, tds[0]); await actor.setFlag(SIS, "aparenciaBase", base); }
    const entraram = ativas.filter(x => !antes.ids.includes(x.item.id)), sairam = antes.ids.filter(id => !ids.includes(id));
    const tamFinal = Number(r.tamanho) || base.width;
    for (const td of tds) {
      // transições primeiro: a animação cobre a troca e já vem no tamanho final
      for (const x of entraram) await naurenAparenciaTransicao(td, x.a.entrada, { tamFinal });
      for (const id of sairam) await naurenAparenciaTransicao(td, antes.saidas?.[id], { tamFinal });
      if (!forcar && td.getFlag?.(SIS, "aparenciaSig") === sig) continue;
      await trocar(td, ativas.some(x => x.a.suave !== false), () => aplicarNoToken(actor, td, r, base));
      await td.setFlag?.(SIS, "aparenciaSig", sig);
    }
    // retrato da ficha junto (opcional)
    if (r.imagem && r.retrato) { if (actor.img !== r.imagem) { await actor.update({ img: r.imagem }); if (!base.retratoTrocado) await actor.setFlag(SIS, "aparenciaBase", { ...base, retratoTrocado: true }); } }
    else if (base.retratoTrocado && actor.img !== base.retrato) { await actor.update({ img: base.retrato }); await actor.setFlag(SIS, "aparenciaBase", { ...base, retratoTrocado: false }); }
    await actor.setFlag(SIS, "aparenciaAplicada", { ids, saidas: Object.fromEntries(ativas.map(x => [x.item.id, x.a.saida])), suave: ativas.some(x => x.a.suave !== false) });
  } catch (err) { console.warn("Nauren RPG | Aparência", err); }
  finally {
    const denovo = emAndamento.get(k) === "denovo"; emAndamento.delete(k);
    if (denovo) naurenAparenciaAgendar(actor);
  }
}

/* ------------------------------ ganchos ------------------------------ */
const temAparencia = actor => (actor?.items ?? []).some(i => i.getFlag?.(SIS, "aparencia")?.ativa) || !!actor?.getFlag?.(SIS, "aparenciaBase");
export function naurenAparenciaHooks() {
  Hooks.on("updateToken", (td, changes) => {
    const f = changes?.flags?.nauren?.aparenciaTroca; if (!f || td.parent?.id !== canvas?.scene?.id) return;
    if (f.fase === "ini") naurenAparenciaEsmaecer(td);
    else if (f.fase === "fim") {
      // espera a arte nova (e a moldura Nauren, se tiver) estarem prontas antes de soltar a foto
      const t0 = performance.now();
      const ver = () => {
        const tk = td.object, tex = tk?.mesh?.texture;
        const artePronta = !!tex?.baseTexture?.valid;
        const bordaNauren = td.getFlag?.(SIS, "borda")?.ativa && td.getFlag(SIS, "borda")?.modelo && td.getFlag(SIS, "borda").modelo !== "foundry";
        const cam = bordaNauren ? naurenMolduraCamadaDe(tk) : null;
        if ((artePronta && (!bordaNauren || cam?.pronta)) || performance.now() - t0 > 2500) return naurenAparenciaReacender(td.id);
        setTimeout(ver, 60);
      };
      setTimeout(ver, 150);
    }
  });
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
  if (n) naurenLog(`Nauren RPG | ${n} Transformação(ões) de Token viraram Aparência.`);
}

/* ------------------------------ painel na ficha do item ------------------------------ */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
const QUANDO = { condicao: "Enquanto esta Condição estiver na ficha (e ligada)", efeito: "Enquanto este Efeito estiver ligado", habilidade: "Enquanto esta Habilidade estiver na ficha", peculiaridade: "Enquanto esta Peculiaridade estiver na ficha", arma: "Enquanto esta arma estiver equipada", armadura: "Enquanto esta armadura estiver equipada" };
function linhaGatilho(g, i) {
  const def = NAUREN_APARENCIA_GATILHOS.find(d => d.id === g.tipo);
  const tipos = NAUREN_APARENCIA_GATILHOS.map(d => `<option value="${d.id}" ${d.id === g.tipo ? "selected" : ""}>${d.rotulo}</option>`).join("");
  let extra = "";
  if (def.campos?.includes("pct")) extra += `<input type="number" class="ap-num" data-ap-g="${i}" data-c="pct" min="1" max="99" value="${g.pct}"><span class="ap-u">%</span>`;
  if (def.campos?.includes("nome")) extra += `<input type="text" class="ap-txt" data-ap-g="${i}" data-c="nome" value="${esc(g.nome)}" placeholder="nome ou arraste a Condição" title="Digite o nome ou arraste uma Condição para cá">`;
  if (def.campos?.includes("acumulos")) extra += `<span class="ap-u">com</span><input type="number" class="ap-num" data-ap-g="${i}" data-c="acumulos" min="1" value="${g.acumulos}"><span class="ap-u">acúmulo(s)+</span>`;
  if (def.campos?.includes("recurso")) extra += `<select data-ap-g="${i}" data-c="recurso">${NAUREN_APARENCIA_RECURSOS.map(([k, r]) => `<option value="${k}" ${g.recurso === k ? "selected" : ""}>${r}</option>`).join("")}${NAUREN_APARENCIA_RECURSOS.some(([k]) => k === g.recurso) ? "" : `<option value="${esc(g.recurso)}" selected>${esc(g.recurso)}</option>`}</select><select data-ap-g="${i}" data-c="op"><option value="ge" ${g.op === "ge" ? "selected" : ""}>≥</option><option value="le" ${g.op === "le" ? "selected" : ""}>≤</option></select><input type="number" class="ap-num" data-ap-g="${i}" data-c="valor" value="${g.valor}">`;
  return `<div class="ap-gat nt-ch" data-i="${i}"><select data-ap-g="${i}" data-c="tipo">${tipos}</select>${extra}<button type="button" class="ap-x" data-ap-acao="tirarGatilho" data-i="${i}" title="Tirar"><i class="fas fa-xmark"></i></button></div>`;
}
export function naurenAparenciaHtml(item, prontas = []) {
  const a = naurenAparenciaDe(item) ?? NAUREN_APARENCIA_PADRAO();
  const cond = item.type === "condicao";
  const bm = a.borda.modo;
  const seg = (v, rot, ic) => `<button type="button" class="ap-seg ${bm === v ? "on" : ""}" data-ap-acao="bordaModo" data-v="${v}"><i class="fas ${ic}"></i> ${rot}</button>`;
  const TAMS = ["1", "2", "3", "4", "5", "6", "8", "10", "12", "16"];
  const opTam = ["", ...TAMS].map(v => `<option value="${v}" ${a.tamanho === v ? "selected" : ""}>${v ? `${v}×${v}` : "Manter o tamanho"}</option>`).join("") + (a.tamanho && !TAMS.includes(a.tamanho) ? `<option value="${a.tamanho}" selected>${a.tamanho}×${a.tamanho}</option>` : "");
  const seq = naurenAparenciaSequencerAtivo(), jb2a = naurenAparenciaJb2aAtivo(), lista = naurenAparenciaAnimacoes();
  const anims = `<datalist id="ap-anims-${item.id}">${lista.map(x => `<option value="${esc(x)}">`).join("")}</datalist>`;
  const aviso = !seq ? `<p class="ap-aviso"><i class="fas fa-triangle-exclamation"></i> O módulo <b>Sequencer</b> não está ativo: as animações não tocam (só o som).</p>`
    : !jb2a && !lista.length ? `<p class="ap-aviso"><i class="fas fa-triangle-exclamation"></i> Nenhum módulo de animações (como o <b>JB2A</b>) está ativo: a lista fica vazia. Ainda dá para escolher um arquivo .webm.</p>`
    : `<p class="ap-dica"><i class="fas fa-circle-check"></i> ${lista.length} animações disponíveis${jb2a ? " (JB2A ativo)" : ""}. Digite para filtrar.</p>`;
  const faixa = (k, campo, rot, min, max, passo, txt) => `<label class="ap-faixa"><span>${rot}<b data-ap-ver="${k}.${campo}">${txt(a[k][campo])}</b></span><input type="range" class="nt-rng" data-ap="${k}.${campo}" data-ap-fmt="${campo}" min="${min}" max="${max}" step="${passo}" value="${a[k][campo]}"></label>`;
  const trans = (k, rot, ic) => { const t = a[k], ruim = t.anim && !naurenAparenciaAnimValida(t.anim);
    return `<div class="ap-tcard nt-ch">
      <div class="ap-tcab"><i class="fas ${ic}"></i><b>${rot}</b>${t.anim || t.som ? `<button type="button" class="ap-testar nt-ch" data-ap-acao="testar" data-v="${k}" title="Toca no token deste personagem (se estiver no mapa)"><i class="fas fa-play"></i> Testar</button>` : ""}</div>
      <div class="ap-tlinha"><span class="ap-trot">Animação</span><span class="ap-arq"><input type="text" class="ap-txt ${ruim ? "ap-ruim" : ""}" data-ap="${k}.anim" list="ap-anims-${item.id}" value="${esc(t.anim)}" placeholder="${seq ? "ex.: jb2a.misty_step.01.blue" : "precisa do Sequencer"}"><button type="button" class="ap-ic" data-ap-acao="arquivo" data-alvo="${k}.anim" data-tipo="imagevideo" title="Escolher arquivo de animação"><i class="fas fa-folder-open"></i></button></span></div>
      ${ruim ? `<p class="ap-aviso ap-aviso-p"><i class="fas fa-circle-xmark"></i> Essa animação não existe nos módulos ativos.</p>` : ""}
      <div class="ap-tlinha"><span class="ap-trot">Som</span><span class="ap-arq"><input type="text" class="ap-txt" data-ap="${k}.som" value="${esc(t.som)}" placeholder="arquivo .ogg / .mp3"><button type="button" class="ap-ic" data-ap-acao="arquivo" data-alvo="${k}.som" data-tipo="audio" title="Escolher som"><i class="fas fa-folder-open"></i></button></span></div>
      ${t.anim ? `<div class="ap-ajustes">
        ${faixa(k, "escala", "Tamanho", .5, 5, .1, v => `${Number(v).toFixed(1)}× o token`)}
        ${faixa(k, "opacidade", "Opacidade", .1, 1, .05, v => `${Math.round(v * 100)}%`)}
        ${faixa(k, "velocidade", "Velocidade", .25, 3, .05, v => `${Number(v).toFixed(2)}×`)}
        ${faixa(k, "matiz", "Cor (matiz)", -180, 180, 5, v => Number(v) ? `${v}°` : "original")}
        ${faixa(k, "repetir", "Repetir", 1, 5, 1, v => `${v}×`)}
        ${faixa(k, "atraso", "Atraso", 0, 3000, 100, v => `${(v / 1000).toFixed(1)} s`)}
        <div class="ap-tchecks"><label class="ap-check"><input type="checkbox" data-ap="${k}.porBaixo" ${t.porBaixo ? "checked" : ""}> Por baixo do token</label><label class="ap-check"><input type="checkbox" data-ap="${k}.espelhar" ${t.espelhar ? "checked" : ""}> Espelhar</label></div>
      </div>` : ""}
      ${t.som ? faixa(k, "volume", "Volume do som", 0, 1, .05, v => `${Math.round(v * 100)}%`) : ""}
    </div>`; };
  return `<div class="ap-painel">
    ${cond ? `<div class="ap-bloco nt-ch"><div class="ap-cab"><i class="fas fa-eye"></i><b>Ícone desta Condição</b></div>
      <div class="ap-segs">${["sempre", "ficha"].map(v => `<button type="button" class="ap-seg ${(item.system.iconeVisivel ?? "sempre") === v ? "on" : ""}" data-ap-acao="icone" data-v="${v}">${v === "sempre" ? `<i class="fas fa-location-dot"></i> No token e na ficha` : `<i class="fas fa-eye-slash"></i> Só na ficha`}</button>`).join("")}</div>
      <p class="ap-dica">"Só na ficha": o ícone não aparece no token, no HUD de Combate nem nas barras. Boa para Condições que só mudam a aparência.</p></div>` : ""}
    <div class="ap-bloco nt-ch">
      <div class="ap-cab"><i class="fas fa-masks-theater"></i><b>Aparência no mapa</b><label class="ap-sw"><input type="checkbox" class="nm-chave" data-ap="ativa" ${a.ativa ? "checked" : ""}> ${a.ativa ? "Ligada" : "Desligada"}</label></div>
      <p class="ap-dica">Muda como o personagem aparece no mapa enquanto valer. Só o que estiver preenchido muda; o resto fica como está. Quando para de valer, volta ao normal sozinho.</p>
      <div class="ap-corpo ${a.ativa ? "" : "ap-off"}">
        <div class="ap-colunas">
          <div class="ap-esq">
            <section class="ap-sec"><h4 class="ap-rot">Imagem e tamanho</h4>
              <div class="ap-linha2">
                <div class="ap-campo"><span class="ap-sub">Imagem nova</span>
                  <span class="ap-arq">${a.imagem ? `<img class="ap-mini" src="${esc(a.imagem)}" alt="">` : `<span class="ap-mini ap-mini-vazia"><i class="fas fa-image"></i></span>`}<input type="text" class="ap-txt" data-ap="imagem" value="${esc(a.imagem)}" placeholder="vazio = mantém a imagem"><button type="button" class="ap-ic" data-ap-acao="arquivo" data-alvo="imagem" data-tipo="image" title="Escolher imagem"><i class="fas fa-folder-open"></i></button></span></div>
                <div class="ap-campo ap-tam"><span class="ap-sub">Tamanho do token</span><select data-ap="tamanho">${opTam}</select></div>
              </div>
              <div class="ap-checks"><label class="ap-check"><input type="checkbox" data-ap="retrato" ${a.retrato ? "checked" : ""}> Trocar também o retrato da ficha</label><label class="ap-check" title="A imagem antiga some aos poucos por cima da nova, sem dar para ver a troca em etapas"><input type="checkbox" data-ap="suave" ${a.suave ? "checked" : ""}> Troca suave</label></div>
            </section>
            <section class="ap-sec"><h4 class="ap-rot">Borda</h4>
              <div class="ap-segs">${seg("manter", "Manter a atual", "fa-equals")}${seg("pronta", "Uma pronta", "fa-crown")}${seg("propria", "Montar a minha", "fa-palette")}${seg("sem", "Sem borda", "fa-ban")}</div>
              ${bm === "pronta" ? `<select data-ap="borda.prontaId"><option value="">Escolha uma pronta…</option>${prontas.map(p => `<option value="${esc(p.id)}" ${a.borda.prontaId === p.id ? "selected" : ""}>${esc(p.nome)}</option>`).join("")}</select>${prontas.length ? "" : `<p class="ap-dica">Ainda não há molduras prontas (o Mestre cria na janela da borda → Prontas do Mestre).</p>`}` : ""}
              ${bm === "propria" ? `<div class="ap-propria"><button type="button" class="na-btn" data-ap-acao="montarBorda"><i class="fas fa-palette"></i> ${a.borda.dados ? "Editar a borda" : "Montar a borda"}</button><span class="ap-dica">${a.borda.dados ? `Modelo: <b>${esc(a.borda.dados.modelo === "foundry" ? "Padrão do Foundry" : a.borda.dados.modelo)}</b>${a.borda.dados.enquadre?.mascara?.length ? " · com pincel" : ""}` : `Abre o editor com ${a.imagem ? "a imagem nova" : "a imagem de sempre"}; ela fica guardada neste item.`}</span></div>` : ""}
              ${bm === "manter" && a.imagem ? `<p class="ap-dica">Com imagem nova, a borda de sempre vale sem o pincel e o enquadre (eram da imagem antiga). Para pintar na imagem nova, use <b>Montar a minha</b>.</p>` : ""}
            </section>
            <section class="ap-sec"><h4 class="ap-rot">Quando vale</h4>
              <p class="ap-dica"><i class="fas fa-circle-check"></i> ${QUANDO[item.type] ?? "Enquanto este item valer"}${a.gatilhos.length ? " <b>e</b> tudo isto:" : "."}</p>
              ${a.gatilhos.length ? `<div class="ap-gats">${a.gatilhos.map(linhaGatilho).join("")}</div>` : ""}
              <button type="button" class="ap-mais" data-ap-acao="maisGatilho"><i class="fas fa-plus"></i> Gatilho</button>
            </section>
          </div>
          <aside class="ap-dir nt-ch">
            <span class="ap-rot">Prévia</span>
            <div class="ap-previa"><img data-ap-previa alt=""><span data-ap-previa-txt class="ap-dica">${a.imagem ? "" : "Sem imagem nova: usa a imagem de sempre."}</span></div>
            <div class="ap-prio"><span class="ap-sub">Prioridade</span><input type="number" class="ap-num" data-ap="prioridade" min="1" max="10" value="${a.prioridade}"></div>
            <p class="ap-dica">Com duas valendo, a maior ganha em cada parte.</p>
          </aside>
        </div>
        <section class="ap-sec"><h4 class="ap-rot">Transição</h4>${aviso}${anims}
          <div class="ap-tcards">${trans("entrada", "Ao entrar", "fa-right-to-bracket")}${trans("saida", "Ao sair", "fa-right-from-bracket")}</div>
        </section>
      </div>
    </div></div>`;
}

/** Liga o painel (chamado no _onRender da ficha do item). */
export function naurenAparenciaLigar(sheet) {
  const el = sheet.element, item = sheet.item;
  const painel = el?.querySelector('.nauren-aba-painel[data-aba="aparencia"]'); if (!painel || !item) return;
  const ler = () => naurenAparenciaNormalizar(foundry.utils.deepClone(item.getFlag(SIS, "aparencia") ?? NAUREN_APARENCIA_PADRAO()));
  // 0.105.2: re-desenhar a ficha não pode jogar a rolagem para o topo
  const gravar = async a => { await item.update({ "flags.nauren.aparencia": naurenAparenciaNormalizar(a) }); if (sheet.rendered) await sheet.render(); };
  const FMT = { escala: v => `${Number(v).toFixed(1)}× o token`, opacidade: v => `${Math.round(v * 100)}%`, volume: v => `${Math.round(v * 100)}%`, velocidade: v => `${Number(v).toFixed(2)}×`, matiz: v => Number(v) ? `${v}°` : "original", repetir: v => `${v}×`, atraso: v => `${(v / 1000).toFixed(1)} s` };
  painel.querySelectorAll("input[type=range][data-ap]").forEach(inp => inp.addEventListener("input", () => { const b = painel.querySelector(`[data-ap-ver="${inp.dataset.ap}"]`); if (b) b.textContent = (FMT[inp.dataset.apFmt] ?? (v => v))(inp.value); }));
  painel.querySelectorAll("[data-ap]").forEach(inp => inp.addEventListener("change", async () => {
    const a = ler(), v = inp.type === "checkbox" ? inp.checked : inp.value;
    foundry.utils.setProperty(a, inp.dataset.ap, v); await gravar(a);
  }));
  painel.querySelectorAll("[data-ap-g]").forEach(inp => inp.addEventListener("change", async () => {
    const a = ler(), g = a.gatilhos[Number(inp.dataset.apG)]; if (!g) return;
    g[inp.dataset.c] = inp.value; await gravar(a);
  }));
  // 0.109.5: arrastar uma Condição (compêndio, diretório ou ficha) para o campo do nome preenche sozinho.
  painel.querySelectorAll('input[data-ap-g][data-c="nome"]').forEach(inp => {
    inp.addEventListener("dragover", ev => { ev.preventDefault(); inp.classList.add("ap-alvo"); });
    inp.addEventListener("dragleave", () => inp.classList.remove("ap-alvo"));
    inp.addEventListener("drop", async ev => {
      ev.preventDefault(); ev.stopPropagation(); inp.classList.remove("ap-alvo");
      let d = null; try { d = JSON.parse(ev.dataTransfer?.getData("text/plain") ?? ""); } catch (err) { d = null; }
      if (d?.type !== "Item" || !d.uuid) return;
      const doc = await fromUuid(d.uuid).catch(() => null); if (!doc) return;
      if (doc.type !== "condicao") ui.notifications.info(`"${doc.name}" não é uma Condição; usei o nome mesmo assim.`);
      const a = ler(), g = a.gatilhos[Number(inp.dataset.apG)]; if (!g) return;
      g.nome = doc.name; await gravar(a);
    });
  });
  painel.querySelectorAll("[data-ap-acao]").forEach(bt => bt.addEventListener("click", async ev => {
    ev.preventDefault(); const acao = bt.dataset.apAcao, a = ler();
    if (acao === "icone") { await item.update({ "system.iconeVisivel": bt.dataset.v }); if (sheet.rendered) await sheet.render(); return; }
    if (acao === "bordaModo") { a.borda.modo = bt.dataset.v; return gravar(a); }
    if (acao === "maisGatilho") { a.gatilhos.push({ tipo: "vidaAbaixo", pct: 50 }); return gravar(a); }
    if (acao === "tirarGatilho") { a.gatilhos.splice(Number(bt.dataset.i), 1); return gravar(a); }
    if (acao === "arquivo") {
      const FP = foundry.applications?.apps?.FilePicker?.implementation ?? globalThis.FilePicker;
      new FP({ type: bt.dataset.tipo, current: foundry.utils.getProperty(a, bt.dataset.alvo) || "", callback: async caminho => { const b = ler(); foundry.utils.setProperty(b, bt.dataset.alvo, caminho); await gravar(b); } }).render(true);
      return;
    }
    if (acao === "montarBorda") return naurenAparenciaMontarBorda(item);
    if (acao === "testar") {
      const td = (item.parent?.getActiveTokens?.(false, true) ?? [])[0];
      if (!td) return ui.notifications?.info("Coloque o personagem no mapa para testar a transição.");
      return naurenAparenciaTransicao(td, a[bt.dataset.v]);
    }
  }));
  // prévia: a imagem da aparência com a borda que ela vai ter
  naurenAparenciaPrevia(item).then(url => { const img = painel.querySelector("[data-ap-previa]"); if (img && url) img.src = url; }).catch(() => {});
}
/** Ator para o editor de borda (o dono do item, ou um de mentira quando o item está solto no diretório). */
function atorParaEditor(item, src) {
  if (item.parent?.documentName === "Actor") return item.parent;
  return { name: item.name, img: src || item.img, uuid: null, isOwner: true, getFlag: () => null, prototypeToken: { texture: { src: src || item.img }, width: 1, height: 1 }, getActiveTokens: () => [] };
}
/** Imagem de sempre do personagem no mapa (a de antes de qualquer aparência). */
function srcDoAtor(actor) {
  if (!actor) return "";
  const base = actor.getFlag?.(SIS, "aparenciaBase");
  return limparSrc(base?.src || actor.getFlag?.(SIS, "borda")?.src || actor.prototypeToken?.texture?.src || actor.img);
}
export async function naurenAparenciaMontarBorda(item) {
  const a = naurenAparenciaDe(item) ?? NAUREN_APARENCIA_PADRAO();
  // 0.105.2: abre já com a imagem nova (se tiver) e com o tamanho da aparência; o pincel pinta sobre ESSA imagem
  const src = limparSrc(a.imagem || srcDoAtor(item.parent) || item.img);
  const baseBorda = item.parent?.getFlag?.(SIS, "borda") ?? null;
  let inicial = null;
  if (a.borda.dados) inicial = comEnquadre({ ...a.borda.dados, ativa: true }, src, a.borda.dados.enquadre, a.borda.dados.enquadre?.src ?? src);
  else if (baseBorda?.ativa) inicial = comEnquadre({ ...baseBorda }, src, null, baseBorda.src); // parte da borda de sempre
  const { naurenAbrirMolduraEditor } = await import("./molduras-editor.mjs");
  const final = await naurenAbrirMolduraEditor(atorParaEditor(item, src), { srcInicial: src, soDevolver: true, cfgInicial: inicial, titulo: item.name, tamGrade: Number(a.tamanho) || null });
  if (!final) return null;
  const b = naurenAparenciaNormalizar(foundry.utils.deepClone(item.getFlag(SIS, "aparencia") ?? a));
  const enquadre = { src: limparSrc(final.src || src) }; for (const k of ENQ) if (final[k] !== undefined) enquadre[k] = foundry.utils.deepClone(final[k]);
  b.borda = { modo: "propria", prontaId: "", dados: { ...naurenProntaDados(final), enquadre } };
  // a imagem escolhida no editor vira a imagem nova da aparência (se for diferente da de sempre)
  if (enquadre.src && enquadre.src !== srcDoAtor(item.parent) && !b.imagem) b.imagem = enquadre.src;
  await item.update({ "flags.nauren.aparencia": b });
  return b.borda.dados;
}
export async function naurenAparenciaPrevia(item) {
  const a = naurenAparenciaDe(item) ?? NAUREN_APARENCIA_PADRAO();
  const src = limparSrc(a.imagem || srcDoAtor(item.parent) || item.img);
  const cfg = await cfgBordaDe(a.borda, item.parent?.getFlag?.(SIS, "borda") ?? null, src);
  if (!cfg) return src;
  return naurenBordaPreviaDataUrl(cfg, 160);
}
