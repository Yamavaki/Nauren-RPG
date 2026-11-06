/* Nauren RPG — HUD nativo: barras do token e editor de barras. Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { naurenKitSistema } from "./janelas-kit.mjs";
import { naurenAbrirBorda, naurenAplicarEscalaEAjuste, naurenBordaCaixaVisual } from "./borda-token.mjs";
import { naurenNomeOculto, naurenNomeVisivel } from "./arte-hover.mjs";
import { NaurenToken, naurenPintarJanela } from "../nauren.mjs";
import { NaurenCarrosselTurnos } from "./carrossel.mjs";
import { naurenMolduraEhNauren } from "./molduras-token.mjs";
import { NaurenHudRecursosEditor } from "./hud-recursos.mjs";
import { naurenXpParaNivel } from "./ficha-ator.mjs";
import { naurenChaveConstrucao, naurenConstrucaoDe, naurenMontarItemDoProjeto } from "./inventor-bancada.mjs";
import { NAUREN_INVENTOR_CONSTRUCAO } from "./inventor.mjs";


/* =======================================================================
 * HUD NATIVO (0.89.0): barras de recurso no token, estado de vida ao
 * passar o mouse e carrossel de turnos. Substitui Bar Brawl e Combat
 * Carousel.
 * ======================================================================= */

const naurenHudEscapar = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const NAUREN_HUD_RECURSOS_BASE = [
  // 0.96.2: mesmas cores vivas da ficha nova (verde, azul, vermelho bem saturados e contrastados)
  // 0.97.1: exatamente os tons das barras da ficha (Vida #4caf50, Mana #4a90d9, Estamina #d24b45...)
  { id: "vida", nome: "Vida", cor1: "#3e9a44", cor2: "#4caf50" },
  { id: "estaminaCombate", nome: "Estamina", cor1: "#b93c37", cor2: "#d24b45" },
  { id: "stress", nome: "Estresse", cor1: "#c9733a", cor2: "#e08a4a" },
  { id: "mana", nome: "Mana", cor1: "#3b7cc4", cor2: "#4a90d9" },
  { id: "dadosDestino", nome: "Dados de Destino", cor1: "#8459c9", cor2: "#9c6fe0" },
  { id: "escudo", nome: "Escudo", cor1: "#8b82b8", cor2: "#dcd4f2" }
];

const NAUREN_HUD_FORMAS = { barra: "Barra", vertical: "Barra vertical", pontos: "Pontos", losangos: "Losangos", anel: "Anel em volta do token", numero: "Só o número" };

const NAUREN_HUD_POSICOES = { abaixo: "Fora · abaixo", acima: "Fora · acima", esquerda: "Fora · esquerda", direita: "Fora · direita", dentroBase: "Dentro · base", dentroTopo: "Dentro · topo" };

const NAUREN_HUD_PREENCHIMENTOS = { degrade: "Degradê (2 cores)", solida: "Cor única", faixas: "Cor por faixa (verde, amarelo, vermelho)" };

const NAUREN_HUD_ROTULOS = { nunca: "Não mostrar", hover: "Só ao passar o mouse", sempre: "Sempre" };

const NAUREN_HUD_VERSAO_PADRAO = 5;

const NAUREN_HUD_CORES_ANTIGAS_V3 = { vida: ["#1f6b34", "#7fd88f"], estaminaCombate: ["#8a1f1f", "#e86a5a"], stress: ["#8f4bc2", "#c084fc"], mana: ["#2b4a8f", "#6f93e0"], dadosDestino: ["#8a6a2e", "#e2c27a"] };

const NAUREN_HUD_CORES_ANTIGAS_V4 = { vida: ["#2f9e5c", "#5ff09a"], estaminaCombate: ["#c23a36", "#ff6b5e"], stress: ["#c46a2a", "#ffa95c"], mana: ["#2f6fd0", "#63b4ff"], dadosDestino: ["#7f4fd6", "#c39bff"] };
 // sobe quando os padrões mudam: listas gravadas antes recebem as cores/tamanhos novos
const NAUREN_HUD_QUEM_VE = { dono: "Dono e Mestre", todos: "Todos", mestre: "Só o Mestre" };

const NAUREN_HUD_QUANDO = { hover: "Ao passar o mouse", sempre: "Sempre", selecionado: "Ao selecionar o token", combate: "Só em combate", ferido: "Só quando está abaixo do máximo" };

const NAUREN_HUD_ESTADO_CORES = ["#8fd19e", "#b9d18f", "#e0a24a", "#e07a3a", "#ff5a4a", "#a89bc4"];


/** Lista de recursos que este ator pode mostrar em barra (base + recursos de classe). */
function naurenHudRecursosDoAtor(actor) {
  const lista = NAUREN_HUD_RECURSOS_BASE.map(r => ({ ...r }));
  for (const r of actor?.system?.recursosCustom ?? []) {
    if (!r?.id) continue;
    lista.push({ id: `recurso:${r.id}`, nome: r.nome || r.id, cor1: r.cor1 || "#4a3a7a", cor2: r.cor2 || "#8a6fd4", deClasse: true });
  }
  // Barras livres (0.90.9): o jogador cria com nome, valor e máximo próprios (guardados no ator).
  for (const [k, r] of Object.entries(naurenHudLivres(actor))) {
    if (!r) continue;
    lista.push({ id: `livre:${k}`, nome: r.nome || "Barra livre", cor1: r.cor1 || "#6b5a2e", cor2: r.cor2 || "#e2c27a", livre: true });
  }
  return lista;
}

function naurenHudLivres(actor) { try { return actor?.getFlag?.("nauren", "barrasLivres") ?? {}; } catch (err) { return {}; } }

/** Cria uma barra livre (pergunta nome, valor e máximo) e já liga a barra no token. */
async function naurenHudCriarBarraLivre(actor, tokenDoc = null) {
  if (!actor?.isOwner) return null;
  const dados = await foundry.applications.api.DialogV2.prompt({ ...naurenKitSistema(),
    window: { title: "Nova barra livre", icon: "fas fa-plus" }, position: { width: 340 },
    content: `<div class="nauren-livre-form"><label>Nome<input type="text" name="nome" value="Nova barra" autofocus></label>
      <div class="nauren-livre-linha"><label>Valor<input type="number" name="valor" value="5" min="0"></label><label>Máximo<input type="number" name="max" value="5" min="1"></label></div>
      <p class="nauren-popup-nota">Um contador seu (munição, cargas, folego...). Fica no personagem e aparece como barra, no HUD e no Configurar Token.</p></div>`,
    ok: { label: "Criar", callback: (e, b, d) => ({ nome: d.element.querySelector("[name=nome]")?.value?.trim() || "Barra livre",
      valor: Number(d.element.querySelector("[name=valor]")?.value) || 0, max: Math.max(1, Number(d.element.querySelector("[name=max]")?.value) || 1) }) },
    rejectClose: false
  }).catch(() => null);
  if (!dados) return null;
  const k = foundry.utils.randomID(8);
  await actor.update({ [`flags.nauren.barrasLivres.${k}`]: { nome: dados.nome, value: Math.min(dados.valor, dados.max), max: dados.max, cor1: "#6b5a2e", cor2: "#e2c27a" } });
  const ref = tokenDoc ?? actor.getActiveTokens(true, false)[0]?.document ?? { actor, getFlag: () => null };
  const lista = (naurenHudBarrasDoToken(ref) ?? []).map(x => foundry.utils.deepClone(x));
  const nova = lista.find(x => x.recurso === `livre:${k}`);
  if (nova) nova.visivel = true;
  await naurenHudGravarBarras(actor, tokenDoc, lista, !!tokenDoc?.getFlag("nauren", "barras")?.soEsteToken);
  return `livre:${k}`;
}

async function naurenHudApagarBarraLivre(actor, recurso) {
  const k = String(recurso).replace(/^livre:/, "");
  const ok = await foundry.applications.api.DialogV2.confirm({ ...naurenKitSistema(), window: { title: "Apagar barra livre" }, content: `<p>Apagar a barra <b>${naurenHudEscapar(naurenHudLivres(actor)[k]?.nome ?? "")}</b>?</p>`, rejectClose: false }).catch(() => false);
  if (!ok) return false;
  // v14: apagar uma chave usa o operador "_del" (o "-=chave" antigo fica de reserva para versões sem ele).
  if (typeof globalThis._del !== "undefined") await actor.update({ [`flags.nauren.barrasLivres.${k}`]: globalThis._del });
  else await actor.update({ [`flags.nauren.barrasLivres.-=${k}`]: null });
  return true;
}

/** Valor atual e máximo de um recurso. */
function naurenHudLerRecurso(actor, id) {
  const sys = actor?.system; if (!sys) return { value: 0, max: 0 };
  if (id.startsWith("livre:")) {
    const r = naurenHudLivres(actor)[id.slice(6)];
    return r ? { value: Number(r.value) || 0, max: Number(r.max) || 0 } : { value: 0, max: 0 };
  }
  if (id.startsWith("recurso:")) {
    const r = (sys.recursosCustom ?? []).find(x => x.id === id.slice(8));
    return r ? { value: r.valor ?? 0, max: r.max || r.valor || 0 } : { value: 0, max: 0 };
  }
  const campo = sys[id];
  return { value: Number(campo?.value ?? 0) || 0, max: Number(campo?.max ?? 0) || 0 };
}

/** Grava um valor novo (absoluto), respeitando 0..máximo. Devolve o valor gravado. */
async function naurenHudGravarRecurso(actor, id, valor) {
  const { max } = naurenHudLerRecurso(actor, id);
  const novo = Math.max(0, Math.min(max > 0 ? max : Infinity, Math.round(valor)));
  if (id.startsWith("livre:")) {
    await actor.update({ [`flags.nauren.barrasLivres.${id.slice(6)}.value`]: novo });
    return novo;
  }
  if (id.startsWith("recurso:")) {
    const lista = foundry.utils.deepClone(actor.system.recursosCustom ?? []);
    const r = lista.find(x => x.id === id.slice(8)); if (!r) return null;
    r.valor = novo;
    await actor.update({ "system.recursosCustom": lista });
    return novo;
  }
  await actor.update({ [`system.${id}.value`]: novo });
  return novo;
}


/** Barra padrão de um recurso. */
function naurenHudBarraPadrao(recurso) {
  const base = {
    id: foundry.utils.randomID(8), recurso: recurso.id, visivel: false, forma: "barra", posicao: "abaixo",
    espessura: 10, comprimento: 100, cantos: 4, preenchimento: "degrade", cor1: recurso.cor1, cor2: recurso.cor2,
    corVazio: "#1b1729", corContorno: "#0d0b14", trocarCorBaixa: false, corBaixa: "#ff5a4a", rotulo: "nunca", quemVe: "dono", quando: "hover",
    escudo: false, animar: true
  };
  if (recurso.id === "vida") Object.assign(base, { visivel: true, escudo: true, espessura: 12 });
  if (recurso.id === "estaminaCombate") Object.assign(base, { visivel: true, forma: "pontos", espessura: 8 });
  if (recurso.id === "stress") Object.assign(base, { visivel: true, forma: "losangos", posicao: "acima", espessura: 16, preenchimento: "solida" });
  if (recurso.id === "dadosDestino") Object.assign(base, { forma: "pontos", espessura: 8 });
  if (recurso.id === "escudo") Object.assign(base, { quando: "ferido" });
  return base;
}

/**
 * Configuração completa das barras de um token: a lista gravada (no token, se
 * "só este token"; senão no ator) + uma entrada padrão (escondida) para cada
 * recurso que ainda não tem barra. Entradas de recursos que não existem mais somem.
 */
function naurenHudBarrasDoToken(tokenOuDoc, { incluirEscondidas = true } = {}) {
  const doc = tokenOuDoc?.document ?? tokenOuDoc;
  const actor = doc?.actor; if (!actor?.system?.vida) return null;
  if (game.modules.get("barbrawl")?.active) return null;
  const doToken = doc.getFlag?.("nauren", "barras");
  const doAtor = actor.getFlag("nauren", "barras");
  const fonte = (doToken?.soEsteToken ? doToken : doAtor) ?? {};
  const gravada = fonte.lista ?? [];
  const antiga = (fonte.versao ?? 1) < NAUREN_HUD_VERSAO_PADRAO;
  const recursos = naurenHudRecursosDoAtor(actor);
  const porRecurso = new Map(recursos.map(r => [r.id, r]));
  const lista = [];
  for (const b of gravada) {
    if (!porRecurso.has(b.recurso)) continue;
    const padrao = naurenHudBarraPadrao(porRecurso.get(b.recurso));
    // Lista gravada com os padrões antigos (0.89.0): leva as cores, a espessura e o "sem número" novos.
    const versao = fonte.versao ?? 1;
    let ajuste = {};
    if (versao < 3) ajuste = { cor1: padrao.cor1, cor2: padrao.cor2, espessura: padrao.espessura, cantos: padrao.cantos, rotulo: "nunca", corContorno: padrao.corContorno, trocarCorBaixa: false };
    // 0.96.2 (versão 4): cores novas só para quem ainda estava com a cor padrão antiga; cor escolhida pelo jogador fica.
    else if (versao < 5) {
      // cores novas só para quem ainda estava com uma cor padrão antiga (v3 ou v4); cor escolhida pelo jogador fica
      const velhas = [NAUREN_HUD_CORES_ANTIGAS_V3[b.recurso], NAUREN_HUD_CORES_ANTIGAS_V4[b.recurso]].filter(Boolean);
      if (velhas.some(v => String(b.cor1).toLowerCase() === v[0] && String(b.cor2).toLowerCase() === v[1])) ajuste = { cor1: padrao.cor1, cor2: padrao.cor2 };
    }
    lista.push({ ...padrao, ...b, ...ajuste });
  }
  for (const r of recursos) if (!lista.some(b => b.recurso === r.id)) lista.push(naurenHudBarraPadrao(r));
  return incluirEscondidas ? lista : lista.filter(b => b.visivel);
}

async function naurenHudGravarBarras(actor, tokenDoc, lista, soEsteToken) {
  if (soEsteToken && tokenDoc) {
    await tokenDoc.setFlag("nauren", "barras", { lista, soEsteToken: true, versao: NAUREN_HUD_VERSAO_PADRAO });
  } else {
    if (tokenDoc?.getFlag("nauren", "barras")?.soEsteToken) await tokenDoc.unsetFlag("nauren", "barras").catch(() => {});
    await actor.setFlag("nauren", "barras", { lista, versao: NAUREN_HUD_VERSAO_PADRAO });
  }
  for (const t of actor.getActiveTokens(true, false)) t.drawBars?.();
}


/* ---- Estado de vida ---- */
function naurenHudEstadoDeVida(actor) {
  const { value, max } = naurenHudLerRecurso(actor, "vida");
  let termos = [], faixas = [];
  try { termos = String(game.settings.get("nauren", "estadosVidaTermos")).split(";").map(s => s.trim()).filter(Boolean); } catch (err) { termos = []; }
  try { faixas = String(game.settings.get("nauren", "estadosVidaFaixas")).split(";").map(s => Number(s)).filter(n => Number.isFinite(n)); } catch (err) { faixas = []; }
  if (termos.length !== 6) termos = ["Ileso", "Escoriado", "Ferido", "Gravemente ferido", "Quase morto", "Morto"];
  if (faixas.length !== 3) faixas = [75, 50, 25];
  const pct = max > 0 ? (100 * value) / max : (value > 0 ? 100 : 0);
  const idx = value <= 0 ? 5 : pct >= 100 ? 0 : pct >= faixas[0] ? 1 : pct >= faixas[1] ? 2 : pct >= faixas[2] ? 3 : 4;
  return { indice: idx, texto: termos[idx], cor: NAUREN_HUD_ESTADO_CORES[idx], pct };
}

function naurenHudPodeVerNumeros(actor) { return game.user.isGM || !!actor?.isOwner; }

function naurenHudPodeVerCondicoes(actor) {
  if (naurenHudPodeVerNumeros(actor)) return true;
  try { return game.settings.get("nauren", "jogadoresVeemCondicoes"); } catch (err) { return true; }
}

function naurenHudCondicoesDoAtor(actor) {
  return (actor?.items ?? []).filter(i => i.type === "condicao" && i.system.ativo !== false && !i.getFlag("nauren", "modelo") && i.system.iconeVisivel !== "ficha")
    .map(i => ({ id: i.id, nome: i.name, img: i.img, acumulos: i.system.acumulativel ? (i.system.acumulos ?? 1) : 0 }));
}


/* ---- Cores ---- */
function naurenHudCorNum(hex, padrao = 0x000000) {
  try { return foundry.utils.Color.from(hex || padrao).valueOf(); } catch (err) { return padrao; }
}

function naurenHudMisturar(hexA, hexB, t) {
  const a = naurenHudCorNum(hexA), b = naurenHudCorNum(hexB);
  const ch = (c, s) => (c >> s) & 0xff;
  const m = s => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * t);
  return (m(16) << 16) | (m(8) << 8) | m(0);
}

/** Textura de degradê (256×1) para preencher a barra sem "fatias". */
const naurenHudTexturas = new Map();

function naurenHudTexturaDegrade(c1, c2) {
  const chave = `${c1}|${c2}`;
  let tex = naurenHudTexturas.get(chave);
  if (tex && tex.baseTexture && !tex.baseTexture.destroyed) return tex;
  const cv = document.createElement("canvas"); cv.width = 256; cv.height = 1;
  const ctx = cv.getContext("2d");
  const gr = ctx.createLinearGradient(0, 0, 256, 0);
  gr.addColorStop(0, c1 || "#000000"); gr.addColorStop(1, c2 || c1 || "#000000");
  ctx.fillStyle = gr; ctx.fillRect(0, 0, 256, 1);
  tex = PIXI.Texture.from(cv);
  naurenHudTexturas.set(chave, tex);
  return tex;
}

function naurenHudCorFaixa(pct) { return pct > 50 ? 0x4fb35e : pct > 25 ? 0xe0a24a : 0xe0533a; }

/** Cor de um ponto 0..1 ao longo da barra, conforme o preenchimento. */
function naurenHudCorEm(barra, t, pct) {
  if (barra.preenchimento === "faixas") return naurenHudCorFaixa(pct);
  if (barra.preenchimento === "solida") return naurenHudCorNum(barra.cor1);
  return naurenHudMisturar(barra.cor1, barra.cor2, t);
}


/* ---- Desenho no token ---- */
const naurenHudAnimacoes = new Map();
 // tokenId -> { recurso: { de, para, inicio, dur, ghost } }
function naurenHudAnimacoesLigadas() { try { return game.settings.get("nauren", "animacoesHud"); } catch (err) { return true; } }


function naurenHudVisivelParaMim(token, barra, valores) {
  const actor = token.actor;
  const gm = game.user.isGM, dono = !!actor?.isOwner;
  if (barra.quemVe === "mestre" && !gm) return false;
  if (barra.quemVe === "dono" && !gm && !dono) return false;
  switch (barra.quando) {
    case "sempre": return true;
    case "hover": return !!token.hover || !!token.controlled;
    case "selecionado": return !!token.controlled;
    case "combate": return !!game.combat?.started;
    case "ferido": return valores.max > 0 && valores.value < valores.max;
    default: return true;
  }
}


function naurenHudDesenharBarrasNoToken(token, { animado = true } = {}) {
  const actor = token.actor;
  const lista = naurenHudBarrasDoToken(token, { incluirEscondidas: false });
  if (!lista) { naurenHudRemoverContainer(token); return false; }
  if (!token.naurenBarras || token.naurenBarras.destroyed || token.naurenBarras.parent !== token) {
    token.naurenBarras = token.addChild(new PIXI.Container());
    token.naurenBarras.eventMode = "none";
    token.naurenBarras.interactiveChildren = false;
  }
  const cont = token.naurenBarras;
  cont.removeChildren().forEach(c => c.destroy({ children: true }));
  cont.visible = token.visible;
  // Com a borda do token, as barras se encostam no círculo da borda (não no quadrado da casa).
  const caixa = naurenBordaCaixaVisual(token);
  const w = caixa.w, h = caixa.h;
  cont.position.set(caixa.x, caixa.y);
  // 0.94.41: a espessura acompanha o tamanho do token (por casa), não a grade do mapa: "6 px" = 6% de um token de 1 casa,
  // igual em mapa de grade 50 ou 300. Token grande (2x2) não engorda as barras.
  const casas = Math.max(1, Math.min(Number(token.document?.width) || 1, Number(token.document?.height) || 1));
  const esc = Math.max(0.15, Math.min(6, Math.min(w, h) / casas / 100));
  const pilhas = { abaixo: 0, acima: 0, esquerda: 0, direita: 0, dentroBase: 0, dentroTopo: 0 };
  const podeNumeros = naurenHudPodeVerNumeros(actor);
  const anim = naurenHudAnimacoes.get(token.id) ?? {};
  const agora = performance.now();
  let precisaAnimar = false;
  const editavel = token.controlled && actor.isOwner;
  const areas = [];

  for (const barra of lista) {
    const valores = naurenHudLerRecurso(actor, barra.recurso);
    if (!naurenHudVisivelParaMim(token, barra, valores)) continue;
    const max = Math.max(0, valores.max), valorReal = Math.max(0, valores.value);
    // Animação: valor exibido corre do valor antigo ao novo.
    let valorExibido = valorReal, ghostDe = null, ganho = 0;
    const a = anim[barra.recurso];
    if (a && animado && barra.animar && naurenHudAnimacoesLigadas()) {
      const t = Math.min(1, (agora - a.inicio) / a.dur);
      const e = 1 - Math.pow(1 - t, 3);
      valorExibido = a.de + (a.para - a.de) * e;
      if (a.para < a.de) ghostDe = { valor: a.de, alpha: 0.7 * (1 - t) };
      else ganho = 0.6 * (1 - t);
      if (t < 1) precisaAnimar = true; else delete anim[barra.recurso];
    }
    const pct = max > 0 ? (100 * valorExibido) / max : 0;
    const baixa = max > 0 && valorReal > 0 && valorReal / max <= 0.25;
    const trocaBaixa = baixa && !!barra.trocarCorBaixa;
    let alvoClique = null;
    const g = new PIXI.Graphics();
    const esp = Math.max(2, (Number(barra.espessura) || 6) * esc);
    const cantos = Math.max(0, (Number(barra.cantos) || 0) * esc);
    const lado = barra.posicao === "esquerda" || barra.posicao === "direita";
    const compPct = Math.max(10, Math.min(100, Number(barra.comprimento) || 100)) / 100;
    const compr = (lado ? h : w) * compPct;
    const folga = 2 * esc;
    const n = pilhas[barra.posicao] ?? 0;
    const corVazio = naurenHudCorNum(barra.corVazio, 0x1b1729), corContorno = naurenHudCorNum(barra.corContorno, 0x000000);
    const corBaixa = naurenHudCorNum(barra.corBaixa, 0xff5a4a);

    let x = 0, y = 0;
    if (barra.forma === "anel") {
      const raio = Math.max(w, h) / 2 + folga + n + esp / 2;
      const cx = w / 2, cy = h / 2;
      const ini = -Math.PI / 2, total = Math.PI * 2 * (max > 0 ? Math.min(1, valorExibido / max) : 0);
      g.lineStyle({ width: esp, color: corVazio, alpha: 0.75 }); g.drawCircle(cx, cy, raio);
      const segs = Math.max(1, Math.ceil(total / 0.12));
      for (let i = 0; i < segs; i++) {
        const t0 = i / segs, t1 = (i + 1) / segs;
        g.lineStyle({ width: esp, color: trocaBaixa ? corBaixa : naurenHudCorEm(barra, t0, pct), alpha: 1, cap: PIXI.LINE_CAP.BUTT });
        g.arc(cx, cy, raio, ini + total * t0, ini + total * t1 + 0.01);
      }
      g.lineStyle(0);
      pilhas[barra.posicao] = n + esp + folga;
    } else {
      // posição do retângulo da barra (eixo principal = comprimento)
      if (barra.posicao === "abaixo") { x = (w - compr) / 2; y = h + folga + n; }
      else if (barra.posicao === "acima") { x = (w - compr) / 2; y = -folga - 4 * esc - n - esp; }
      else if (barra.posicao === "dentroBase") { x = (w - compr) / 2; y = h - folga - n - esp; }
      else if (barra.posicao === "dentroTopo") { x = (w - compr) / 2; y = folga + n; }
      else if (barra.posicao === "esquerda") { x = -folga - n - esp; y = (h - compr) / 2; }
      else { x = w + folga + n; y = (h - compr) / 2; }
      pilhas[barra.posicao] = n + esp + folga;
      const vert = lado || barra.forma === "vertical";
      const L = compr, E = esp; // comprimento e espessura
      const rect = (c0, c1, cor, alpha = 1) => { // trecho [c0,c1] em 0..1 do comprimento
        if (c1 <= c0) return;
        g.beginFill(cor, alpha);
        if (vert) g.drawRect(x, y + L * (1 - c1), E, L * (c1 - c0)); else g.drawRect(x + L * c0, y, L * (c1 - c0), E);
        g.endFill();
      };
      if (barra.forma === "numero") {
        /* só texto, abaixo */
      } else if (barra.forma === "pontos" || barra.forma === "losangos") {
        const qtd = Math.max(1, Math.min(30, max || 1));
        const gap = 2 * esc, tam = Math.min(barra.forma === "losangos" ? E : E * 2.2, (L - gap * (qtd - 1)) / qtd);
        const inicio = (L - (tam * qtd + gap * (qtd - 1))) / 2;
        for (let i = 0; i < qtd; i++) {
          const cheio = i < Math.round(valorExibido);
          const cor = cheio ? (trocaBaixa ? corBaixa : naurenHudCorEm(barra, qtd > 1 ? i / (qtd - 1) : 0, pct)) : corVazio;
          const px = vert ? x + E / 2 : x + inicio + i * (tam + gap) + tam / 2;
          const py = vert ? y + L - inicio - i * (tam + gap) - tam / 2 : y + E / 2;
          g.lineStyle({ width: 1, color: corContorno, alpha: 0.8 });
          g.beginFill(cor, cheio ? 1 : 0.6);
          if (barra.forma === "losangos") { const r = tam / 2; g.drawPolygon([px, py - r, px + r, py, px, py + r, px - r, py]); }
          else g.drawRoundedRect(px - tam / 2, py - E / 2, tam, E, Math.min(cantos, E / 2));
          g.endFill(); g.lineStyle(0);
        }
      } else {
        // Barra: fundo, preenchimento recortado pela MESMA forma arredondada e contorno por cima
        // (assim o preenchimento nunca sai do contorno nem fica quadrado dentro de um fundo redondo).
        const grupo = new PIXI.Container();
        const W = vert ? E : L, H = vert ? L : E;
        const raio = Math.min(cantos, W / 2, H / 2);
        const fundo = new PIXI.Graphics();
        fundo.beginFill(corVazio, 0.8); fundo.drawRoundedRect(x, y, W, H, raio); fundo.endFill();
        const mascara = new PIXI.Graphics();
        mascara.beginFill(0xffffff, 1); mascara.drawRoundedRect(x, y, W, H, raio); mascara.endFill();
        const cheio = new PIXI.Graphics();
        cheio.mask = mascara;
        const trecho = (c0, c1, desenhar) => { // trecho [c0,c1] (0..1) ao longo do comprimento
          if (c1 <= c0) return;
          if (vert) desenhar(x, y + L * (1 - c1), E, L * (c1 - c0)); else desenhar(x + L * c0, y, L * (c1 - c0), E);
        };
        const frac = max > 0 ? Math.min(1, valorExibido / max) : 0;
        if (barra.preenchimento === "degrade" && !trocaBaixa) {
          const tex = naurenHudTexturaDegrade(barra.cor1, barra.cor2);
          const m = vert ? new PIXI.Matrix(0, -L / 256, E, 0, x, y + L) : new PIXI.Matrix(L / 256, 0, 0, E, x, y);
          cheio.beginTextureFill({ texture: tex, matrix: m });
          trecho(0, frac, (a, b, c, d) => cheio.drawRect(a, b, c, d));
          cheio.endFill();
        } else {
          cheio.beginFill(trocaBaixa ? corBaixa : naurenHudCorEm(barra, 0, pct), 1);
          trecho(0, frac, (a, b, c, d) => cheio.drawRect(a, b, c, d));
          cheio.endFill();
        }
        if (barra.escudo && barra.recurso === "vida" && max > 0) {
          const esc2 = naurenHudLerRecurso(actor, "escudo").value;
          if (esc2 > 0) { cheio.beginFill(0xd9d0f5, 0.95); trecho(frac, Math.min(1, frac + esc2 / max), (a, b, c, d) => cheio.drawRect(a, b, c, d)); cheio.endFill(); }
        }
        if (ghostDe && max > 0) { cheio.beginFill(0xffffff, ghostDe.alpha); trecho(frac, Math.min(1, ghostDe.valor / max), (a, b, c, d) => cheio.drawRect(a, b, c, d)); cheio.endFill(); }
        if (ganho > 0) { cheio.beginFill(0xffffff, ganho * 0.45); trecho(0, frac, (a, b, c, d) => cheio.drawRect(a, b, c, d)); cheio.endFill(); }
        const contorno = new PIXI.Graphics();
        contorno.lineStyle({ width: Math.max(1, esc), color: corContorno, alpha: 0.9, alignment: 1 });
        contorno.drawRoundedRect(x, y, W, H, raio);
        grupo.addChild(fundo, cheio, mascara, contorno);
        if (baixa && naurenHudAnimacoesLigadas()) { grupo.alpha = 0.8 + 0.2 * Math.sin(agora / 180); precisaAnimar = true; }
        cont.addChild(grupo);
        alvoClique = { x, y, w: W, h: H };
      }
    }
    cont.addChild(g);
    // Número (desligado por padrão; só para quem pode ver os números)
    const mostrarRotulo = podeNumeros && (barra.rotulo === "sempre" || (barra.rotulo === "hover" && (token.hover || token.controlled)) || barra.forma === "numero");
    if (mostrarRotulo) {
      const esc3 = barra.escudo && barra.recurso === "vida" ? naurenHudLerRecurso(actor, "escudo").value : 0;
      const txt = `${Math.round(valorReal)}${max > 0 ? `/${max}` : ""}${esc3 > 0 ? ` +${esc3}` : ""}`;
      const Texto = foundry.canvas.containers?.PreciseText ?? PIXI.Text;
      const dentroDaBarra = barra.forma === "barra" && !lado;
      const tamanho = dentroDaBarra ? Math.max(7, esp * 0.82) : Math.max(9, 11 * esc);
      const t = new Texto(txt, { fontFamily: "Signika", fontSize: tamanho, fill: 0xffffff, stroke: 0x000000, strokeThickness: Math.max(2, tamanho * 0.22), fontWeight: "bold", lineJoin: "round" });
      t.anchor.set(0.5);
      if (barra.forma === "anel") t.position.set(w / 2, h + folga + (pilhas.abaixo || 0) + 8 * esc);
      else if (barra.forma === "numero") t.position.set(w / 2, barra.posicao === "acima" ? y : y + esp / 2);
      else if (lado) t.position.set(x + esp / 2, y - 7 * esc);
      else if (dentroDaBarra) t.position.set(x + compr / 2, y + esp / 2 + 0.5);
      else t.position.set(x + compr / 2, barra.posicao === "acima" ? y - 7 * esc : y + esp + 7 * esc);
      cont.addChild(t);
    }
    // Clique na barra para ajustar (token selecionado pelo dono)
    // Área clicável (o clique é tratado fora do PIXI, ver naurenHudCliqueNaBarra)
    if (editavel) {
      const r = alvoClique ?? (() => { const b = g.getLocalBounds(); return { x: b.x, y: b.y, w: b.width, h: b.height }; })();
      if (r.w > 0 && r.h > 0) areas.push({ ...r, x: r.x + caixa.x, y: r.y + caixa.y, barra });
    }
  }
  // Estado de vida fixo embaixo de NPCs (opção do mundo)
  let estadoFixo = false; try { estadoFixo = game.settings.get("nauren", "estadoVidaFixoNpc"); } catch (err) { estadoFixo = false; }
  if (estadoFixo && actor.type === "npc" && !podeNumeros) {
    const est = naurenHudEstadoDeVida(actor);
    const Texto = foundry.canvas.containers?.PreciseText ?? PIXI.Text;
    const t = new Texto(est.texto, { fontFamily: "Signika", fontSize: 11 * esc, fill: naurenHudCorNum(est.cor), stroke: 0x000000, strokeThickness: 3 });
    t.anchor.set(0.5, 0); t.position.set(w / 2, h + 2 * esc + (pilhas.abaixo || 0));
    cont.addChild(t);
  }
  token._naurenHudAreas = areas;
  token._naurenHudUltimos ??= Object.fromEntries(naurenHudRecursosDoAtor(actor).map(r => [r.id, naurenHudLerRecurso(actor, r.id).value]));
  if (precisaAnimar) naurenHudAgendarQuadro(token);
  return true;
}

function naurenHudRemoverContainer(token) {
  if (token.naurenBarras && !token.naurenBarras.destroyed) { token.naurenBarras.destroy({ children: true }); }
  token.naurenBarras = null;
}

const naurenHudQuadrosPendentes = new Set();

function naurenHudAgendarQuadro(token) {
  if (naurenHudQuadrosPendentes.has(token.id)) return;
  naurenHudQuadrosPendentes.add(token.id);
  setTimeout(() => {
    naurenHudQuadrosPendentes.delete(token.id);
    if (token.destroyed || !token.actor) return;
    naurenHudDesenharBarrasNoToken(token, { animado: true });
  }, 40);
}

/** Registra a animação ao mudar um valor (chamado antes de redesenhar). */
function naurenHudRegistrarMudanca(actor) {
  const tokens = actor.getActiveTokens?.(true, false) ?? [];
  for (const token of tokens) {
    const ult = token._naurenHudUltimos ?? {};
    const novos = {};
    const anim = naurenHudAnimacoes.get(token.id) ?? {};
    for (const r of naurenHudRecursosDoAtor(actor)) {
      const v = naurenHudLerRecurso(actor, r.id).value;
      novos[r.id] = v;
      if (ult[r.id] !== undefined && ult[r.id] !== v) {
        anim[r.id] = { de: anim[r.id] ? naurenHudValorAnimadoAtual(anim[r.id]) : ult[r.id], para: v, inicio: performance.now(), dur: v < ult[r.id] ? 650 : 450 };
      }
    }
    token._naurenHudUltimos = novos;
    naurenHudAnimacoes.set(token.id, anim);
  }
}

function naurenHudValorAnimadoAtual(a) {
  const t = Math.min(1, (performance.now() - a.inicio) / a.dur); const e = 1 - Math.pow(1 - t, 3);
  return a.de + (a.para - a.de) * e;
}


/**
 * Clique numa barra do token selecionado: tratado no DOM (fase de captura), antes do
 * PIXI, para não arrastar o token e sem objetos interativos que são recriados a cada quadro.
 */
function naurenHudCliqueNaBarra(ev) {
  if (ev.button !== 0 || !canvas?.ready) return;
  let p = null;
  try { p = canvas.canvasCoordinatesFromClient({ x: ev.clientX, y: ev.clientY }); } catch (err) { return; }
  for (const token of canvas.tokens?.controlled ?? []) {
    if (!token.actor?.isOwner) continue;
    for (const a of token._naurenHudAreas ?? []) {
      const lx = p.x - token.document.x, ly = p.y - token.document.y, m = 3;
      if (lx >= a.x - m && lx <= a.x + a.w + m && ly >= a.y - m && ly <= a.y + a.h + m) {
        ev.stopImmediatePropagation(); ev.preventDefault();
        naurenHudAbrirAjusteRapido(token, a.barra, { global: { x: ev.clientX, y: ev.clientY } });
        return;
      }
    }
  }
}


/* Ajuste rápido: caixinha ao clicar na barra ("-1", "+2" ou "15") */
function naurenHudAbrirAjusteRapido(token, barra, ev) {
  document.getElementById("nauren-ajuste-rapido")?.remove();
  const actor = token.actor; if (!actor?.isOwner) return;
  const nome = naurenHudRecursosDoAtor(actor).find(r => r.id === barra.recurso)?.nome ?? barra.recurso;
  const { value, max } = naurenHudLerRecurso(actor, barra.recurso);
  const p = ev.global ?? ev.data?.global ?? { x: 0, y: 0 };
  const caixa = document.createElement("div");
  caixa.id = "nauren-ajuste-rapido";
  caixa.innerHTML = `<label><span>${naurenHudEscapar(nome)} <em>${value}${max ? `/${max}` : ""}</em></span><input type="text" placeholder="-1, +2 ou 15" autocomplete="off"></label>`;
  caixa.style.left = `${Math.round(p.x) + 12}px`; caixa.style.top = `${Math.round(p.y) - 16}px`;
  document.body.append(caixa);
  const input = caixa.querySelector("input");
  const fechar = () => { caixa.remove(); document.removeEventListener("pointerdown", foraClique, true); };
  const foraClique = e => { if (!caixa.contains(e.target)) fechar(); };
  setTimeout(() => document.addEventListener("pointerdown", foraClique, true), 0);
  input.addEventListener("keydown", async e => {
    if (e.key === "Escape") { fechar(); return; }
    if (e.key !== "Enter") return;
    const txt = input.value.trim();
    if (!txt) { fechar(); return; }
    const rel = /^[+-]/.test(txt);
    const n = Number(txt.replace(/\s+/g, ""));
    if (!Number.isFinite(n)) { input.classList.add("erro"); return; }
    const novo = rel ? value + n : n;
    const gravado = await naurenHudGravarRecurso(actor, barra.recurso, novo);
    if (gravado !== null) ui.notifications.info(`${actor.name}: ${nome} ${value} → ${gravado}`);
    fechar();
  });
  input.focus();
}


/* ---- Tooltip de estado de vida ---- */
let naurenHudTooltipEl = null;

function naurenHudPontoNaTela(x, y) {
  try { const p = canvas.stage.worldTransform.apply(new PIXI.Point(x, y)); const r = canvas.app.view.getBoundingClientRect(); return { x: p.x + r.left, y: p.y + r.top }; }
  catch (err) { return { x: 0, y: 0 }; }
}

function naurenHudMostrarTooltip(token) {
  const actor = token.actor; if (!actor?.system?.vida || !token.isVisible) return;
  let ligado = true; try { ligado = game.settings.get("nauren", "estadoVidaHover"); } catch (err) { ligado = true; }
  if (!ligado) return;
  const est = naurenHudEstadoDeVida(actor);
  const numeros = naurenHudPodeVerNumeros(actor);
  const { value, max } = naurenHudLerRecurso(actor, "vida");
  const escudo = naurenHudLerRecurso(actor, "escudo").value;
  const conds = naurenHudPodeVerCondicoes(actor) ? naurenHudCondicoesDoAtor(actor) : [];
  const esc = s => naurenHudEscapar(String(s ?? ""));
  const el = naurenHudTooltipEl ??= Object.assign(document.createElement("div"), { id: "nauren-token-tooltip" });
  const nomeT = naurenNomeVisivel(token);
  el.innerHTML = `<div class="nome">${esc(nomeT)}${game.user.isGM && naurenNomeOculto(token) ? ` <span class="num" title="Os jogadores veem &quot;Desconhecido&quot;">(oculto)</span>` : ""}</div>
    <div class="estado" style="color:${est.cor}">${esc(est.texto)}${numeros ? ` <span class="num">${value}/${max}${escudo > 0 ? ` +${escudo}` : ""}</span>` : ""}</div>
    ${conds.length ? `<div class="conds">${conds.map(c => `<span><img src="${esc(c.img)}" alt="">${esc(c.nome)}${c.acumulos ? ` ${c.acumulos}` : ""}</span>`).join("")}</div>` : ""}`;
  naurenPintarJanela(el, actor); // 0.100.3: cores e moldura chanfrada da ficha de quem está embaixo do mouse
  document.body.append(el);
  const p = naurenHudPontoNaTela(token.center.x, token.y - 6);
  el.style.left = `${Math.round(p.x)}px`; el.style.top = `${Math.round(p.y)}px`;
  el.classList.add("visivel");
}

function naurenHudEsconderTooltip() { naurenHudTooltipEl?.classList.remove("visivel"); }


/* =======================================================================
 * INTEGRAÇÃO COM O FOUNDRY (0.90.7) - como o Bar Brawl fazia:
 * 1) HUD do token (botão direito): um campo para CADA barra ligada, em volta
 *    do token, do lado em que ela aparece (acima, abaixo, esquerda, direita).
 *    Aceita "-1", "+2" ou "15", igual ao ajuste rápido. Substitui os 2 campos
 *    nativos (bar1/bar2), que o sistema não usa.
 * 2) Configurar Token / Token Protótipo → aba Recursos: a seção "Barras do
 *    Nauren" com todas as barras (olho, valor atual, cores, forma, posição,
 *    quem vê, quando aparece). Grava na hora; o editor completo continua lá.
 * ======================================================================= */
function naurenHudLadoDaBarra(posicao) {
  return { acima: "topo", dentroTopo: "topo", abaixo: "base", dentroBase: "base", esquerda: "esquerda", direita: "direita" }[posicao] ?? "base";
}

async function naurenHudAplicarTextoNoRecurso(actor, recurso, txt) {
  const t = String(txt ?? "").trim().replace(/\s+/g, "");
  if (!t) return null;
  const { value } = naurenHudLerRecurso(actor, recurso);
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  const novo = /^[+-]/.test(t) ? value + n : n;
  if (novo === value) return value;
  return naurenHudGravarRecurso(actor, recurso, novo);
}


/** Aba Recursos do Configurar Token / Token Protótipo: as barras do Nauren no lugar das 2 nativas. */
function naurenTokenConfigBarras(app, html) {
  const raiz = html instanceof HTMLElement ? html : html?.[0] ?? app.element; if (!raiz) return;
  const aba = raiz.querySelector('.tab[data-tab="resources"]'); if (!aba) return;
  const doc = app.token ?? app.document;
  const actor = doc?.actor ?? (doc?.parent instanceof Actor ? doc.parent : null) ?? app.actor;
  if (!actor?.system?.vida) return;
  if (!game.user.isGM && !actor.isOwner) return;
  const tokenDoc = doc instanceof foundry.documents.TokenDocument ? doc : null;
  // Os campos nativos de barra (o sistema desenha as próprias barras) somem; o resto da aba fica.
  for (const nome of ["displayBars", "bar1.attribute", "bar2.attribute"]) aba.querySelector(`[name="${nome}"]`)?.closest(".form-group")?.classList.add("nauren-escondido");
  aba.querySelectorAll('div.bar-data, [name="bar1.value"], [name="bar1.max"], [name="bar2.value"], [name="bar2.max"]').forEach(el => (el.closest(".form-group") ?? el).classList.add("nauren-escondido"));
  aba.querySelector(".nauren-tc-barras")?.remove();
  const sec = document.createElement("fieldset");
  sec.className = "nauren-tc-barras";
  aba.append(sec);
  let selecionada = null;
  const desenhar = () => {
    const e = s => naurenHudEscapar(String(s ?? ""));
    const ref = tokenDoc ?? { actor, getFlag: () => null };
    const lista = naurenHudBarrasDoToken(ref) ?? [];
    const soEste = !!tokenDoc?.getFlag("nauren", "barras")?.soEsteToken;
    if (!selecionada || !lista.some(b => b.id === selecionada)) selecionada = (lista.find(b => b.visivel) ?? lista[0])?.id ?? null;
    const b = lista.find(x => x.id === selecionada);
    const recursos = naurenHudRecursosDoAtor(actor);
    const nomeDe = id => recursos.find(r => r.id === id)?.nome ?? id;
    const opc = (mapa, atual) => Object.entries(mapa).map(([k, v]) => `<option value="${k}" ${k === atual ? "selected" : ""}>${e(v)}</option>`).join("");
    const val = b ? naurenHudLerRecurso(actor, b.recurso) : { value: 0, max: 0 };
    sec.innerHTML = `<legend>Barras do Nauren</legend>
      <div class="nauren-tc-chips">${lista.map(x => `<span class="nauren-tc-chip ${x.id === selecionada ? "ativa" : ""} ${x.visivel ? "" : "apagada"}" data-sel="${x.id}" style="--c1:${e(x.cor1)};--c2:${e(x.cor2)};">
        <i class="fas ${x.visivel ? "fa-eye" : "fa-eye-slash"}" data-olho="${x.id}" title="${x.visivel ? "Esconder" : "Mostrar"}"></i>${e(nomeDe(x.recurso))}</span>`).join("")}</div>
      ${b?.recurso?.startsWith("livre:") ? `<div class="form-group"><label>Nome</label><div class="form-fields"><input type="text" data-livre-nome value="${e(naurenHudLivres(actor)[b.recurso.slice(6)]?.nome ?? "")}"></div></div>` : ""}
      ${b ? `<div class="form-group"><label>Valor (atual / máx.)</label><div class="form-fields"><input type="text" data-valor value="${val.value}" title="-1, +2 ou um valor"><span class="nauren-tc-barra">/</span>${b.recurso.startsWith("livre:") ? `<input type="number" min="1" data-livre-max value="${val.max}">` : `<input type="text" value="${val.max}" disabled title="O máximo vem da ficha">`}</div></div>
      <div class="form-group"><label>Cores</label><div class="form-fields"><input type="color" data-campo="cor1" value="${e(b.cor1)}"><input type="color" data-campo="cor2" value="${e(b.cor2)}"><select data-campo="preenchimento">${opc(NAUREN_HUD_PREENCHIMENTOS, b.preenchimento)}</select></div></div>
      <div class="form-group"><label>Forma e posição</label><div class="form-fields"><select data-campo="forma">${opc(NAUREN_HUD_FORMAS, b.forma)}</select><select data-campo="posicao">${opc(NAUREN_HUD_POSICOES, b.posicao)}</select></div></div>
      <div class="form-group"><label>Quem vê / quando</label><div class="form-fields"><select data-campo="quemVe">${opc(NAUREN_HUD_QUEM_VE, b.quemVe)}</select><select data-campo="quando">${opc(NAUREN_HUD_QUANDO, b.quando)}</select></div></div>
      <div class="form-group"><label>Número na barra</label><div class="form-fields"><select data-campo="rotulo">${opc(NAUREN_HUD_ROTULOS, b.rotulo)}</select></div></div>` : ""}
      ${tokenDoc ? `<div class="form-group"><label>Só neste token</label><div class="form-fields"><input type="checkbox" data-so-este ${soEste ? "checked" : ""}></div><p class="hint">Desligado: vale para todos os tokens deste personagem.</p></div>` : ""}
      <div class="nauren-tc-botoes"><button type="button" data-nova-livre><i class="fas fa-plus"></i> Barra livre</button>${b?.recurso?.startsWith("livre:") ? `<button type="button" data-apagar-livre><i class="fas fa-trash"></i> Apagar</button>` : ""}<button type="button" data-editor><i class="fas fa-bars-progress"></i> Editor completo</button><button type="button" data-restaurar><i class="fas fa-rotate-left"></i> Restaurar padrão</button></div>`;
    const gravar = async (mudar, soEsteNovo = soEste) => {
      const nova = (naurenHudBarrasDoToken(ref) ?? []).map(x => foundry.utils.deepClone(x));
      mudar?.(nova);
      await naurenHudGravarBarras(actor, tokenDoc, nova, soEsteNovo);
      desenhar();
    };
    sec.querySelectorAll("[data-sel]").forEach(el => el.addEventListener("click", ev => { if (ev.target.dataset.olho) return; selecionada = el.dataset.sel; desenhar(); }));
    sec.querySelectorAll("[data-olho]").forEach(el => el.addEventListener("click", ev => { ev.stopPropagation(); const id = el.dataset.olho; gravar(l => { const x = l.find(y => y.id === id); if (x) x.visivel = !x.visivel; }); }));
    sec.querySelectorAll("[data-campo]").forEach(el => el.addEventListener("change", () => gravar(l => { const x = l.find(y => y.id === selecionada); if (x) x[el.dataset.campo] = el.value; })));
    const inpV = sec.querySelector("[data-valor]");
    inpV?.addEventListener("keydown", ev => { if (ev.key === "Enter") { ev.preventDefault(); ev.stopPropagation(); inpV.blur(); } });
    inpV?.addEventListener("change", async () => { if (b) { await naurenHudAplicarTextoNoRecurso(actor, b.recurso, inpV.value); desenhar(); } });
    sec.querySelector("[data-so-este]")?.addEventListener("change", ev => gravar(null, ev.target.checked));
    const kLivre = b?.recurso?.startsWith("livre:") ? b.recurso.slice(6) : null;
    sec.querySelector("[data-livre-nome]")?.addEventListener("change", async ev => { await actor.update({ [`flags.nauren.barrasLivres.${kLivre}.nome`]: ev.target.value.trim() || "Barra livre" }); desenhar(); });
    sec.querySelector("[data-livre-max]")?.addEventListener("change", async ev => {
      const m = Math.max(1, Number(ev.target.value) || 1);
      await actor.update({ [`flags.nauren.barrasLivres.${kLivre}.max`]: m, [`flags.nauren.barrasLivres.${kLivre}.value`]: Math.min(m, val.value) }); desenhar();
    });
    sec.querySelector("[data-nova-livre]")?.addEventListener("click", async () => { const id = await naurenHudCriarBarraLivre(actor, tokenDoc); if (id) { selecionada = (naurenHudBarrasDoToken(ref) ?? []).find(x => x.recurso === id)?.id ?? selecionada; desenhar(); } });
    sec.querySelector("[data-apagar-livre]")?.addEventListener("click", async () => { if (await naurenHudApagarBarraLivre(actor, b.recurso)) { selecionada = null; await gravar(l => { const i = l.findIndex(x => x.id === b.id); if (i >= 0) l.splice(i, 1); }); } });
    sec.querySelector("[data-editor]")?.addEventListener("click", () => NaurenBarrasEditor.abrir(actor, tokenDoc));
    sec.querySelector("[data-restaurar]")?.addEventListener("click", () => gravar(l => { for (let k = 0; k < l.length; k++) { const pad = naurenHudBarraPadrao(recursos.find(r => r.id === l[k].recurso) ?? { id: l[k].recurso }); l[k] = { ...pad, id: l[k].id }; } }));
  };
  desenhar();
}


/**
 * 0.94.40: troca o HTML de uma janela sem perder a rolagem. Cada clique re-renderiza a janela inteira
 * (Barras do token, Recursos do HUD, HUD de Combate); sem isto a lista voltava para o topo.
 * Guarda o scroll de todo elemento rolado pelo caminho de índices dos filhos e devolve depois.
 */
function naurenTrocarHtmlMantendoRolagem(content, html) {
  const caminho = el => { const p = []; for (let n = el; n && n !== content; n = n.parentElement) p.unshift([...n.parentElement.children].indexOf(n)); return p; };
  const achar = p => p.reduce((n, i) => n?.children?.[i] ?? null, content);
  const rolados = [...content.querySelectorAll("*")].filter(e => e.scrollTop || e.scrollLeft).map(e => ({ p: caminho(e), top: e.scrollTop, left: e.scrollLeft, cls: e.className }));
  const raiz = { top: content.scrollTop, left: content.scrollLeft };
  content.innerHTML = html;
  content.scrollTop = raiz.top; content.scrollLeft = raiz.left;
  for (const r of rolados) { const el = achar(r.p); if (el && el.className === r.cls) { el.scrollTop = r.top; el.scrollLeft = r.left; } }
}

/* =======================================================================
 * EDITOR DE BARRAS
 * ======================================================================= */
class NaurenBarrasEditor extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "nauren-barras-editor",
    classes: ["nauren-rpg", "nauren-barras-editor"],
    window: { title: "Barras do token", resizable: true, icon: "fas fa-bars-progress" },
    position: { width: 940, height: 640 },
    actions: {
      selecionar: NaurenBarrasEditor.onSelecionar,
      olho: NaurenBarrasEditor.onOlho,
      mover: NaurenBarrasEditor.onMover,
      restaurar: NaurenBarrasEditor.onRestaurar,
      salvarModelo: NaurenBarrasEditor.onSalvarModelo,
      aplicarModelo: NaurenBarrasEditor.onAplicarModelo,
      aplicarModeloNpc: NaurenBarrasEditor.onAplicarModeloNpc,
      recursosHud: NaurenBarrasEditor.onRecursosHud,
      novaLivre: NaurenBarrasEditor.onNovaLivre,
      apagarLivre: NaurenBarrasEditor.onApagarLivre
    }
  };
  #actor; #tokenDoc; #lista; #selecionada = null; #soEsteToken = false;
  get actor() { return this.#actor; }
  constructor(opcoes = {}) {
    super(opcoes);
    this.#actor = opcoes.actor; this.#tokenDoc = opcoes.tokenDoc ?? null;
    this.#soEsteToken = !!this.#tokenDoc?.getFlag("nauren", "barras")?.soEsteToken;
    this.#carregar();
  }
  static abrir(actor, tokenDoc = null) {
    for (const app of foundry.applications.instances.values()) if (app instanceof NaurenBarrasEditor && app.#actor === actor) { app.bringToFront(); return app; }
    const app = new NaurenBarrasEditor({ actor, tokenDoc });
    app.render({ force: true });
    return app;
  }
  get title() { return `Barras do token · ${this.#actor?.name ?? ""}`; }
  #carregar() {
    const ref = this.#tokenDoc ?? this.#actor.getActiveTokens(true, false)[0]?.document ?? { actor: this.#actor, getFlag: () => null };
    this.#lista = naurenHudBarrasDoToken(ref) ?? [];
    if (!this.#selecionada || !this.#lista.some(b => b.id === this.#selecionada)) this.#selecionada = this.#lista[0]?.id ?? null;
  }
  async #gravar() {
    await naurenHudGravarBarras(this.#actor, this.#tokenDoc, this.#lista, this.#soEsteToken);
  }
  get #barra() { return this.#lista.find(b => b.id === this.#selecionada) ?? null; }

  async _renderHTML() {
    const e = s => naurenHudEscapar(String(s ?? ""));
    const recursos = naurenHudRecursosDoAtor(this.#actor);
    const nomeDe = id => recursos.find(r => r.id === id)?.nome ?? id;
    const b = this.#barra;
    const opcoes = (mapa, atual) => Object.entries(mapa).map(([k, v]) => `<option value="${k}" ${k === atual ? "selected" : ""}>${e(v)}</option>`).join("");
    const itens = this.#lista.map((x, i) => `
      <li class="nauren-be-item ${x.id === this.#selecionada ? "ativa" : ""} ${x.visivel ? "" : "escondida"}" data-action="selecionar" data-id="${x.id}" draggable="true">
        <button type="button" class="nauren-be-olho" data-action="olho" data-id="${x.id}" title="${x.visivel ? "Esconder no token" : "Mostrar no token"}"><i class="fas ${x.visivel ? "fa-eye" : "fa-eye-slash"}"></i></button>
        <span class="nauren-be-cor" style="background: linear-gradient(90deg, ${e(x.cor1)}, ${e(x.cor2)})"></span>
        <span class="nauren-be-nome">${e(nomeDe(x.recurso))}${x.recurso === "vida" && x.escudo ? " + Escudo" : ""}</span>
        <span class="nauren-be-sub">${e(NAUREN_HUD_FORMAS[x.forma] ?? x.forma)} · ${e((NAUREN_HUD_POSICOES[x.posicao] ?? x.posicao).replace(/^Fora · |^Dentro · /, m => m === "Dentro · " ? "dentro, " : ""))}</span>
        <span class="nauren-be-mover"><button type="button" data-action="mover" data-id="${x.id}" data-dir="-1" title="Subir" ${i === 0 ? "disabled" : ""}><i class="fas fa-chevron-up"></i></button><button type="button" data-action="mover" data-id="${x.id}" data-dir="1" title="Descer" ${i === this.#lista.length - 1 ? "disabled" : ""}><i class="fas fa-chevron-down"></i></button></span>
      </li>`).join("");
    const cor = (nome, rotulo, valor) => `<label class="nauren-be-campo nauren-be-corcampo"><span>${rotulo}</span><input type="color" name="${nome}" value="${e(valor || "#000000")}"></label>`;
    const props = b ? `
      <div class="nauren-be-titulo"><b>${e(nomeDe(b.recurso))}</b><span>mudanças valem na hora</span></div>
      <div class="nauren-be-grade">
        <label class="nauren-be-campo"><span>Forma</span><select name="forma">${opcoes(NAUREN_HUD_FORMAS, b.forma)}</select></label>
        <label class="nauren-be-campo"><span>Posição</span><select name="posicao">${opcoes(NAUREN_HUD_POSICOES, b.posicao)}</select></label>
        <label class="nauren-be-campo"><span>Mostrar o número</span><select name="rotulo">${opcoes(NAUREN_HUD_ROTULOS, b.rotulo)}</select></label>
        <label class="nauren-be-campo"><span>Quem vê</span><select name="quemVe">${opcoes(NAUREN_HUD_QUEM_VE, b.quemVe)}</select></label>
        <label class="nauren-be-campo"><span>Quando aparece</span><select name="quando">${opcoes(NAUREN_HUD_QUANDO, b.quando)}</select></label>
        <label class="nauren-be-campo"><span>Preenchimento</span><select name="preenchimento">${opcoes(NAUREN_HUD_PREENCHIMENTOS, b.preenchimento)}</select></label>
      </div>
      <div class="nauren-be-subtitulo">Cores</div>
      <div class="nauren-be-grade cores">
        ${cor("cor1", b.preenchimento === "degrade" ? "Início" : "Cor", b.cor1)}
        ${b.preenchimento === "degrade" ? cor("cor2", "Fim", b.cor2) : ""}
        ${cor("corVazio", "Vazio", b.corVazio)}
        ${cor("corContorno", "Contorno", b.corContorno)}
        ${b.trocarCorBaixa ? cor("corBaixa", "Abaixo de 25 %", b.corBaixa) : ""}
      </div>
      <div class="nauren-be-grade tres">
        <label class="nauren-be-campo"><span>Espessura (px)</span><input type="number" name="espessura" min="2" max="40" value="${e(b.espessura)}"></label>
        <label class="nauren-be-campo"><span>Comprimento (% do token)</span><input type="number" name="comprimento" min="10" max="100" value="${e(b.comprimento)}"></label>
        <label class="nauren-be-campo"><span>Cantos (px)</span><input type="number" name="cantos" min="0" max="20" value="${e(b.cantos)}"></label>
      </div>
      <div class="nauren-be-checks">
        ${b.recurso === "vida" ? `<label><input type="checkbox" name="escudo" ${b.escudo ? "checked" : ""}> Mostrar o Escudo emendado (segmento lilás depois da Vida)</label>` : ""}
        <label><input type="checkbox" name="animar" ${b.animar ? "checked" : ""}> Animar perda (rastro claro) e ganho (brilho)</label>
        <label><input type="checkbox" name="trocarCorBaixa" ${b.trocarCorBaixa ? "checked" : ""}> Trocar de cor abaixo de 25 %</label>
        ${this.#tokenDoc ? `<label><input type="checkbox" name="soEsteToken" ${this.#soEsteToken ? "checked" : ""}> Só neste token (não mudar os outros tokens de ${e(this.#actor.name)})</label>` : ""}
      </div>` : `<p class="nauren-be-vazio">Nenhuma barra.</p>`;
    const rodape = `
      <div class="nauren-be-rodape">
        <button type="button" data-action="restaurar"><i class="fas fa-rotate-left"></i> Restaurar padrão</button>
        <button type="button" data-action="salvarModelo"><i class="fas fa-floppy-disk"></i> Salvar modelo</button>
        <button type="button" data-action="aplicarModelo"><i class="fas fa-wand-magic-sparkles"></i> Aplicar modelo</button>
        ${game.user.isGM ? `<button type="button" data-action="aplicarModeloNpc" title="Usar este conjunto como padrão dos NPCs novos"><i class="fas fa-dragon"></i> Padrão dos NPCs</button>` : ""}
        <button type="button" data-action="recursosHud" title="Escolher os recursos do HUD de Combate"><i class="fas fa-sliders"></i> Recursos do HUD</button>
        <button type="button" data-action="novaLivre" title="Uma barra com nome, valor e máximo seus (munição, cargas...)"><i class="fas fa-plus"></i> Barra livre</button>
        ${b?.recurso?.startsWith("livre:") ? `<button type="button" data-action="apagarLivre"><i class="fas fa-trash"></i> Apagar esta barra livre</button>` : ""}
      </div>`;
    return `<div class="nauren-be-raiz">
      <aside class="nauren-be-lista"><div class="nauren-be-cab"><b>Barras</b><span>${e(this.#actor.name)} · o olho mostra ou esconde no token</span></div><ul>${itens}</ul>${rodape}</aside>
      <section class="nauren-be-props">${props}</section>
      <section class="nauren-be-preview"><div class="nauren-be-cab"><b>Pré-visualização</b><span>como fica no mapa</span></div>${this.#previewHtml()}</section>
    </div>`;
  }
  _replaceHTML(result, content) { naurenTrocarHtmlMantendoRolagem(content, result); }

  #previewHtml() {
    const actor = this.#actor;
    const img = this.#tokenDoc?.texture?.src || actor.prototypeToken?.texture?.src || actor.img;
    const e = s => naurenHudEscapar(String(s ?? ""));
    const T = 116, cx = 125, cy = 140; // token de 116px; espaço em cima para o tooltip
    const pilhas = { abaixo: 0, acima: 0, esquerda: 0, direita: 0, dentroBase: 0, dentroTopo: 0 };
    let svg = "";
    const est = naurenHudEstadoDeVida(actor);
    for (const b of this.#lista) {
      if (!b.visivel) continue;
      const { value, max } = naurenHudLerRecurso(actor, b.recurso);
      const frac = max > 0 ? Math.min(1, value / max) : 0;
      const pct = frac * 100;
      const esp = Math.max(2, Number(b.espessura) || 6), cantos = Number(b.cantos) || 0;
      const lado = b.posicao === "esquerda" || b.posicao === "direita";
      const L = T * (Math.max(10, Math.min(100, Number(b.comprimento) || 100)) / 100);
      const n = pilhas[b.posicao] ?? 0, folga = 2;
      const baixa = max > 0 && value > 0 && frac <= 0.25;
      const corHex = v => `#${v.toString(16).padStart(6, "0")}`;
      const corEm = t => corHex(baixa && b.trocarCorBaixa ? naurenHudCorNum(b.corBaixa) : naurenHudCorEm(b, t, pct));
      const gid = `g${b.id}`;
      const defs = `<linearGradient id="${gid}" x1="0" y1="0" x2="${lado || b.forma === "vertical" ? 0 : 1}" y2="${lado || b.forma === "vertical" ? -1 : 0}" ${lado || b.forma === "vertical" ? 'gradientUnits="objectBoundingBox" y1="1" y2="0"' : ""}><stop offset="0" stop-color="${corEm(0)}"/><stop offset="1" stop-color="${corEm(1)}"/></linearGradient>`;
      const fill = b.preenchimento === "degrade" && !(baixa && b.trocarCorBaixa) ? `url(#${gid})` : corEm(0);
      if (b.forma === "anel") {
        const r = T / 2 + folga + n + esp / 2, C = 2 * Math.PI * r;
        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${e(b.corVazio)}" stroke-opacity=".75" stroke-width="${esp}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${corEm(1)}" stroke-width="${esp}" stroke-dasharray="${C * frac} ${C}" transform="rotate(-90 ${cx} ${cy})"/>`;
        pilhas[b.posicao] = n + esp + folga; continue;
      }
      let x, y;
      const x0 = cx - T / 2, y0 = cy - T / 2;
      if (b.posicao === "abaixo") { x = cx - L / 2; y = y0 + T + folga + n; }
      else if (b.posicao === "acima") { x = cx - L / 2; y = y0 - folga - 4 - n - esp; }
      else if (b.posicao === "dentroBase") { x = cx - L / 2; y = y0 + T - folga - n - esp; }
      else if (b.posicao === "dentroTopo") { x = cx - L / 2; y = y0 + folga + n; }
      else if (b.posicao === "esquerda") { x = x0 - folga - n - esp; y = cy - L / 2; }
      else { x = x0 + T + folga + n; y = cy - L / 2; }
      pilhas[b.posicao] = n + esp + folga;
      const vert = lado || b.forma === "vertical";
      if (b.forma === "numero") { svg += `<text x="${cx}" y="${y + esp}" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" stroke="#000" stroke-width="2" paint-order="stroke">${value}${max ? `/${max}` : ""}</text>`; continue; }
      if (b.forma === "pontos" || b.forma === "losangos") {
        const qtd = Math.max(1, Math.min(30, max || 1)), gap = 2, tam = Math.min(b.forma === "losangos" ? esp : esp * 2.2, (L - gap * (qtd - 1)) / qtd), inicio = (L - (tam * qtd + gap * (qtd - 1))) / 2;
        for (let i = 0; i < qtd; i++) {
          const cheio = i < value;
          const c = cheio ? corEm(qtd > 1 ? i / (qtd - 1) : 0) : e(b.corVazio);
          const px = vert ? x + esp / 2 : x + inicio + i * (tam + gap) + tam / 2, py = vert ? y + L - inicio - i * (tam + gap) - tam / 2 : y + esp / 2;
          svg += b.forma === "losangos" ? `<polygon points="${px},${py - tam / 2} ${px + tam / 2},${py} ${px},${py + tam / 2} ${px - tam / 2},${py}" fill="${c}" fill-opacity="${cheio ? 1 : .6}" stroke="${e(b.corContorno)}" stroke-opacity=".8"/>`
            : `<rect x="${px - tam / 2}" y="${py - esp / 2}" width="${tam}" height="${esp}" rx="${Math.min(cantos, esp / 2)}" fill="${c}" fill-opacity="${cheio ? 1 : .6}" stroke="${e(b.corContorno)}" stroke-opacity=".8"/>`;
        }
        continue;
      }
      const W = vert ? esp : L, H = vert ? L : esp;
      const raio = Math.min(cantos, W / 2, H / 2), cid = `c${b.id}`;
      svg += `<defs>${defs}<clipPath id="${cid}"><rect x="${x}" y="${y}" width="${W}" height="${H}" rx="${raio}"/></clipPath></defs>`;
      svg += `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="${raio}" fill="${e(b.corVazio)}" fill-opacity=".8"/>`;
      svg += `<g clip-path="url(#${cid})">`;
      if (frac > 0) svg += vert ? `<rect x="${x}" y="${y + H * (1 - frac)}" width="${W}" height="${H * frac}" fill="${fill}"/>` : `<rect x="${x}" y="${y}" width="${W * frac}" height="${H}" fill="${fill}"/>`;
      if (b.escudo && b.recurso === "vida" && max > 0) { const es = naurenHudLerRecurso(actor, "escudo").value; if (es > 0 && !vert) svg += `<rect x="${x + W * frac}" y="${y}" width="${W * Math.min(1 - frac, es / max)}" height="${H}" fill="#d9d0f5"/>`; }
      svg += `</g><rect x="${x - 0.5}" y="${y - 0.5}" width="${W + 1}" height="${H + 1}" rx="${raio + 0.5}" fill="none" stroke="${e(b.corContorno)}" stroke-opacity=".9"/>`;
      if (b.rotulo !== "nunca" && !vert) { const fs = Math.max(7, esp * 0.82); svg += `<text x="${x + W / 2}" y="${y + H / 2}" dominant-baseline="central" text-anchor="middle" font-family="Signika, sans-serif" font-size="${fs}" font-weight="700" fill="#fff" stroke="#000" stroke-width="${Math.max(1.5, fs * 0.22)}" stroke-linejoin="round" paint-order="stroke">${value}${max ? `/${max}` : ""}</text>`; }
    }
    return `<div class="nauren-be-mapa">
      <img class="nauren-be-token" src="${e(img)}" alt="" style="left:${cx - T / 2}px; top:${cy - T / 2}px; width:${T}px; height:${T}px">
      <svg width="250" height="250" viewBox="0 0 250 250" aria-hidden="true">${svg}</svg>
      <div class="nauren-be-tooltip" title="O que aparece ao passar o mouse"><div class="nome">${e(actor.name)}</div><div class="estado" style="color:${est.cor}">${e(est.texto)} <span class="num">${naurenHudLerRecurso(actor, "vida").value}/${naurenHudLerRecurso(actor, "vida").max}</span></div></div>
    </div>
    <p class="nauren-be-nota">Por padrão as barras aparecem só para o dono, ao passar o mouse. Com o token selecionado, clique numa barra e escreva <b>-1</b>, <b>+2</b> ou <b>15</b> para ajustar o recurso.</p>
    <p class="nauren-be-nota">Estados ao passar o mouse: Ileso · Escoriado · Ferido · Gravemente ferido · Quase morto · Morto.</p>`;
  }

  _onRender(context, options) {
    const raiz = this.element;
    raiz.querySelectorAll(".nauren-be-props input, .nauren-be-props select").forEach(el => el.addEventListener("change", ev => this.#onCampo(ev)));
    // Arrastar para reordenar
    let arrastando = null;
    raiz.querySelectorAll(".nauren-be-item").forEach(li => {
      li.addEventListener("dragstart", ev => { arrastando = li.dataset.id; ev.dataTransfer.effectAllowed = "move"; });
      li.addEventListener("dragover", ev => { ev.preventDefault(); li.classList.add("alvo"); });
      li.addEventListener("dragleave", () => li.classList.remove("alvo"));
      li.addEventListener("drop", async ev => {
        ev.preventDefault(); li.classList.remove("alvo");
        if (!arrastando || arrastando === li.dataset.id) return;
        const de = this.#lista.findIndex(b => b.id === arrastando), para = this.#lista.findIndex(b => b.id === li.dataset.id);
        if (de < 0 || para < 0) return;
        const [item] = this.#lista.splice(de, 1); this.#lista.splice(para, 0, item);
        await this.#gravar(); this.render();
      });
    });
    naurenAplicarEscalaEAjuste?.(this);
  }
  async #onCampo(ev) {
    const el = ev.currentTarget, nome = el.name;
    if (nome === "soEsteToken") { this.#soEsteToken = el.checked; await this.#gravar(); this.render(); return; }
    const b = this.#barra; if (!b) return;
    if (el.type === "checkbox") b[nome] = el.checked;
    else if (el.type === "number") b[nome] = Number(el.value) || 0;
    else b[nome] = el.value;
    await this.#gravar();
    this.render();
  }
  static async onSelecionar(ev, target) { if (ev.target.closest("button")) return; this.#selecionada = target.dataset.id; this.render(); }
  static async onOlho(ev, target) {
    ev.stopPropagation();
    const b = this.#lista.find(x => x.id === target.dataset.id); if (!b) return;
    b.visivel = !b.visivel; this.#selecionada = b.id;
    await this.#gravar(); this.render();
  }
  static async onMover(ev, target) {
    ev.stopPropagation();
    const i = this.#lista.findIndex(x => x.id === target.dataset.id), j = i + Number(target.dataset.dir);
    if (i < 0 || j < 0 || j >= this.#lista.length) return;
    [this.#lista[i], this.#lista[j]] = [this.#lista[j], this.#lista[i]];
    await this.#gravar(); this.render();
  }
  static async onNovaLivre() {
    const id = await naurenHudCriarBarraLivre(this.#actor, this.#tokenDoc);
    if (!id) return;
    this.#carregar();
    this.#selecionada = this.#lista.find(x => x.recurso === id)?.id ?? this.#selecionada;
    this.render();
  }
  static async onApagarLivre() {
    const b = this.#barra; if (!b?.recurso?.startsWith("livre:")) return;
    if (!(await naurenHudApagarBarraLivre(this.#actor, b.recurso))) return;
    this.#lista = this.#lista.filter(x => x.id !== b.id);
    await this.#gravar(); this.#carregar(); this.render();
  }
  static async onRestaurar() {
    this.#lista = naurenHudRecursosDoAtor(this.#actor).map(naurenHudBarraPadrao);
    await this.#gravar(); this.#carregar(); this.render();
  }
  static async onSalvarModelo() {
    const nome = await foundry.applications.api.DialogV2.prompt({ ...naurenKitSistema(), window: { title: "Salvar modelo de barras" }, content: `<p>Nome do modelo:</p><input type="text" name="nome" value="Meu modelo" autofocus>`,
      ok: { callback: (e, b, d) => d.element.querySelector("[name=nome]")?.value?.trim() }, rejectClose: false }).catch(() => null);
    if (!nome) return;
    const modelos = foundry.utils.deepClone(game.settings.get("nauren", "barrasModelos") ?? {});
    modelos[nome] = this.#lista.map(b => ({ ...b }));
    await game.settings.set("nauren", "barrasModelos", modelos);
    ui.notifications.info(`Modelo "${nome}" salvo.`);
  }
  static async onAplicarModelo() {
    const modelos = game.settings.get("nauren", "barrasModelos") ?? {};
    const nomes = Object.keys(modelos);
    if (!nomes.length) { ui.notifications.warn("Você ainda não salvou nenhum modelo."); return; }
    const esc = await foundry.applications.api.DialogV2.wait({ ...naurenKitSistema(), window: { title: "Aplicar modelo de barras" }, content: `<p>Qual modelo aplicar em <b>${naurenHudEscapar(this.#actor.name)}</b>?</p>`,
      buttons: [...nomes.map(n => ({ action: n, label: n })), { action: "cancelar", label: "Cancelar" }], rejectClose: false }).catch(() => null);
    if (!esc || esc === "cancelar") return;
    this.#lista = modelos[esc].map(b => ({ ...b, id: foundry.utils.randomID(8) }));
    await this.#gravar(); this.#carregar(); this.render();
  }
  static onRecursosHud() { NaurenHudRecursosEditor.abrir(this.#actor); }
  static async onAplicarModeloNpc() {
    if (!game.user.isGM) return;
    await game.settings.set("nauren", "barrasPadraoNpc", this.#lista.map(b => ({ ...b })));
    ui.notifications.info("Este conjunto passa a ser o padrão dos NPCs criados daqui em diante.");
  }
}

/* NPC novo recebe o padrão do Mestre, se houver. */
/**
 * 0.96.2: o XP da ficha virou o TOTAL acumulado (antes zerava a cada nível). Quem já tinha XP guardado
 * "dentro do nível" ganha o XP dos níveis que já passou: nível 6 com 120 → 2000 + 120.
 */
async function naurenMigrarXpTotal0962() {
  if (game.settings.get("nauren", "migracaoXpTotal0962")) return;
  const ajustar = async a => {
    if (!a?.system || a.system.xp === undefined) return;
    const nv = Number(a.system.nivel) || 1;
    if (nv <= 1) return;
    const novo = naurenXpParaNivel(nv) + (Number(a.system.xp) || 0);
    await a.update({ "system.xp": novo }, { naurenMigracaoXp: true }).catch(err => console.warn("Nauren RPG | migração do XP", a.name, err));
  };
  for (const a of game.actors ?? []) await ajustar(a);
  for (const cena of game.scenes ?? []) for (const t of cena.tokens) if (t.actor && !t.actorLink && t.delta?.system?.xp !== undefined) await ajustar(t.actor);
  await game.settings.set("nauren", "migracaoXpTotal0962", true);
}

/**
 * 0.97.7: armas melhoradas na Loja de Invenções que o "Ressincronizar com o compêndio" voltou para a versão do
 * compêndio (o arco perdia Estamina, Força, Defesa...). O projeto ficou guardado no item: refaz a arma a partir dele.
 * Só mexe quando o item está igual ao do compêndio (ou à base antes da Loja) — ou seja, quando perdeu as melhorias.
 */
async function naurenMigrarLojaRestaurar0977() {
  if (game.settings.get("nauren", "migracaoLojaRestaurar0977")) return;
  const restaurados = await naurenRestaurarArmasDaLoja();
  if (restaurados.length) {
    console.log("Nauren RPG | Loja de Invenções: melhorias restauradas em", restaurados);
    ChatMessage.create({ whisper: game.users.filter(u => u.isGM).map(u => u.id), content: `<p class="nauren-aviso-chat"><i class="fas fa-hammer"></i> <b>Loja de Invenções:</b> as melhorias voltaram em ${restaurados.map(r => `<b>${foundry.utils.escapeHTML(r)}</b>`).join(", ")} (tinham sido apagadas ao ressincronizar com o compêndio).</p>` }).catch(() => null);
  }
  await game.settings.set("nauren", "migracaoLojaRestaurar0977", true);
}

function naurenConstrucaoPelaChave(chave) {
  for (const a of game.actors ?? []) for (const i of a.items) if (naurenConstrucaoDe(i) && naurenChaveConstrucao(i) === chave) return naurenConstrucaoDe(i);
  if (chave === "habilidade-inventor-arma-de-inventor" || chave === "Arma de Inventor") return NAUREN_INVENTOR_CONSTRUCAO;
  return null;
}

async function naurenRestaurarArmasDaLoja(atores = null, diag = null) {
  const limpar = sys => {
    const o = foundry.utils.deepClone(sys ?? {});
    for (const k of ["equipado", "quantidade", "usosAtual", "cargasAtual", "rankAtual", "ativo"]) delete o[k];
    if (Array.isArray(o.acoes)) for (const ac of o.acoes) for (const k of ["usosAtual", "cargasAtual", "usosBonusConsumidoAtual", "entidadeImagem"]) delete ac?.[k];
    return JSON.stringify(o);
  };
  const lista = atores ?? [...(game.actors ?? []), ...[...(game.scenes ?? [])].flatMap(c => [...c.tokens].filter(t => t.actor && !t.actorLink).map(t => t.actor))];
  const restaurados = [];
  for (const actor of lista) {
    for (const item of actor.items ?? []) {
      const proj = item.getFlag?.("nauren", "projeto");
      if (!proj || !String(proj.fonte ?? "").endsWith("#loja") || !proj.base) continue;
      const c = naurenConstrucaoPelaChave(String(proj.fonte).slice(0, -5));
      if (!c) { diag?.push({ item: item.name, motivo: "construção não achada", fonte: proj.fonte }); continue; }
      try {
        const dados = naurenMontarItemDoProjeto(c, { ...proj, formula: "loja" }, actor);
        // Normaliza pelo modelo de dados do próprio item (preenche os campos padrão), para comparar igual com igual.
        const normalizar = sys => { try { const C = item.system?.constructor; if (C && C !== Object && typeof C.prototype?.toObject === "function") return new C(foundry.utils.deepClone(sys ?? {})).toObject(); } catch (err) { /* sem modelo */ } return foundry.utils.deepClone(sys ?? {}); };
        const novo = normalizar(dados.system);
        const atual = limpar(item.toObject().system);
        if (atual === limpar(novo)) { diag?.push({ item: item.name, motivo: "já está certo" }); continue; } // está certo
        const origemUuid = item.getFlag("nauren", "origemUuid") || item.getFlag("core", "sourceId");
        const origem = origemUuid ? await fromUuid(origemUuid).catch(() => null) : null;
        const baseSys = normalizar(proj.base.system);
        const foiResetado = (origem && atual === limpar(origem.toObject().system)) || atual === limpar(baseSys);
        if (!foiResetado) { diag?.push({ item: item.name, motivo: "não parece resetado", atual: atual.slice(0, 400), origem: origem ? limpar(origem.toObject().system).slice(0, 400) : null }); continue; } // foi mexido de outro jeito: não sobrescreve
        novo.equipado = item.system.equipado;
        if (novo.usaUsos) novo.usosAtual = Math.min(novo.usosMax ?? 0, item.system.usosAtual ?? novo.usosMax ?? 0);
        await item.update({ system: novo });
        restaurados.push(`${item.name} (${actor.name})`);
      } catch (err) { console.warn(`Nauren RPG | Loja: não deu para restaurar "${item.name}"`, err); }
    }
  }
  return restaurados;
}

/** Código que rodava solto neste trecho do nauren.mjs: chamado no mesmo ponto de antes. */
export function __naurenIniciar_barras_token() {

Hooks.on("canvasReady", () => {
  const view = canvas.app?.view ?? canvas.app?.canvas;
  if (!view || view._naurenCliqueBarra) return;
  view._naurenCliqueBarra = true;
  view.addEventListener("pointerdown", naurenHudCliqueNaBarra, { capture: true });
});


/* ---- Ganchos do token ---- */
Hooks.once("setup", () => {
  const proto = NaurenToken.prototype;
  const drawBarsOriginal = proto.drawBars;
  proto.drawBars = function () {
    let ok = false;
    try { ok = naurenHudDesenharBarrasNoToken(this); } catch (err) { console.warn("Nauren RPG | barras do token", err); ok = false; }
    if (ok) { if (this.bars) { this.bars.visible = false; this.bars.renderable = false; } return; }
    return drawBarsOriginal.call(this);
  };
});

Hooks.on("refreshToken", token => {
  if (token.naurenBarras && !token.naurenBarras.destroyed) {
    token.naurenBarras.visible = token.visible;
    if (token.bars) { token.bars.visible = false; token.bars.renderable = false; }
  }
});

Hooks.on("hoverToken", (token, hovered) => {
  try { token.drawBars?.(); } catch (err) { /* sem barras */ }
  if (hovered) naurenHudMostrarTooltip(token); else naurenHudEsconderTooltip();
});

Hooks.on("controlToken", token => { try { token.drawBars?.(); } catch (err) { /* sem barras */ } document.getElementById("nauren-ajuste-rapido")?.remove(); });

Hooks.on("canvasPan", () => naurenHudEsconderTooltip());

Hooks.on("updateActor", (actor, changes) => {
  if (!actor?.system?.vida) return;
  naurenHudRegistrarMudanca(actor);
  for (const t of actor.getActiveTokens?.(true, false) ?? []) { try { t.drawBars?.(); } catch (err) { /* ignora */ } }
  NaurenCarrosselTurnos.avisarMudanca(actor, changes);
});

Hooks.on("updateToken", (doc, changes) => { if (changes.flags !== undefined || changes.hidden !== undefined) { try { doc.object?.drawBars?.(); } catch (err) { /* ignora */ } NaurenCarrosselTurnos.atualizar(); } });

Hooks.on("createItem", item => { if (item.parent?.documentName === "Actor") NaurenCarrosselTurnos.atualizar(); });

Hooks.on("deleteItem", item => { if (item.parent?.documentName === "Actor") NaurenCarrosselTurnos.atualizar(); });

Hooks.on("canvasReady", () => { naurenHudAnimacoes.clear(); for (const t of canvas.tokens?.placeables ?? []) if (t.actor) t._naurenHudUltimos = Object.fromEntries(naurenHudRecursosDoAtor(t.actor).map(r => [r.id, naurenHudLerRecurso(t.actor, r.id).value])); NaurenCarrosselTurnos.atualizar(); });


/* Botão no HUD do token (menu do botão direito) */
Hooks.on("renderTokenHUD", (hud, html) => {
  const raiz = html instanceof HTMLElement ? html : html?.[0]; if (!raiz) return;
  const actor = hud.object?.actor; if (!actor?.system?.vida || !actor.isOwner) return;
  let podeJogador = true; try { podeJogador = game.settings.get("nauren", "jogadoresEditamBarras"); } catch (err) { podeJogador = true; }
  const col = raiz.querySelector(".col.right") ?? raiz.querySelector(".right") ?? raiz;
  if (game.user.isGM || podeJogador) {
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "control-icon nauren-hud-barras-btn"; btn.title = "Barras do token";
    btn.innerHTML = '<i class="fas fa-bars-progress"></i>';
    btn.addEventListener("click", ev => { ev.preventDefault(); NaurenBarrasEditor.abrir(actor, hud.object.document); });
    col.append(btn);
  }
  // Logo abaixo: "Borda do token" (enquadrar a imagem, cores e efeitos da borda do Foundry).
  const tokenDoc = hud.object?.document;
  if (tokenDoc?.isOwner) {
    const borda = document.createElement("button");
    borda.type = "button";
    borda.className = `control-icon nauren-hud-borda-btn${tokenDoc.getFlag("nauren", "borda")?.ativa && (tokenDoc.ring?.enabled || naurenMolduraEhNauren(tokenDoc.getFlag("nauren", "borda"))) ? " active" : ""}`;
    borda.title = "Borda do token";
    borda.innerHTML = '<i class="fas fa-circle-dot"></i>';
    borda.addEventListener("click", ev => { ev.preventDefault(); naurenAbrirBorda(actor, { tokenDoc }); });
    col.append(borda);
  }
});

Hooks.on("renderTokenHUD", (hud, html) => {
  const raiz = html instanceof HTMLElement ? html : html?.[0]; if (!raiz) return;
  const token = hud.object; const actor = token?.actor;
  if (!actor?.system?.vida || !actor.isOwner) return;
  const barras = (naurenHudBarrasDoToken(token) ?? []).filter(b => b.visivel);
  if (!barras.length) return;
  const recursos = naurenHudRecursosDoAtor(actor);
  const meio = raiz.querySelector(".col.middle"); if (!meio) return;
  meio.querySelectorAll(".attribute").forEach(el => el.remove());
  const grupos = { topo: [], base: [], esquerda: [], direita: [] };
  for (const b of barras) grupos[naurenHudLadoDaBarra(b.posicao)].push(b);
  const montar = (lista, lado) => {
    const caixa = document.createElement("div");
    // Mesmas classes que o Foundry v14 posiciona (bar2 = em cima, bar1 = embaixo), como o Bar Brawl 1.9.
    caixa.className = `attribute ${({ topo: "bar2", base: "bar1", esquerda: "left-bars", direita: "right-bars" })[lado]} nauren-hud-attr nauren-hud-attr-${lado}`;
    for (const b of lista) {
      const { value, max } = naurenHudLerRecurso(actor, b.recurso);
      const nome = recursos.find(r => r.id === b.recurso)?.nome ?? b.recurso;
      const inp = document.createElement("input");
      inp.type = "text"; inp.value = String(value); inp.dataset.recurso = b.recurso;
      inp.title = `${nome}: ${value}${max ? ` / ${max}` : ""} — digite -1, +2 ou um valor`;
      inp.style.borderColor = b.cor2 || "#8a6fd4";
      inp.style.boxShadow = `inset 0 -3px 0 ${b.cor1 || "#4a3a7a"}`;
      inp.addEventListener("focus", () => { inp.dataset.antes = inp.value; inp.select(); });
      const aplicar = async () => {
        if (inp.value === inp.dataset.antes) return;
        const gravado = await naurenHudAplicarTextoNoRecurso(actor, b.recurso, inp.value);
        if (gravado === null) { inp.value = inp.dataset.antes ?? ""; inp.classList.add("erro"); setTimeout(() => inp.classList.remove("erro"), 800); return; }
        inp.value = String(gravado); inp.dataset.antes = inp.value;
      };
      // Os eventos param aqui: o HUD do Foundry não tenta tratar estes campos como bar1/bar2.
      const parar = ev => { ev.stopPropagation(); ev.stopImmediatePropagation(); };
      inp.addEventListener("keydown", ev => { parar(ev); if (ev.key === "Enter") { ev.preventDefault(); inp.blur(); } if (ev.key === "Escape") { inp.value = inp.dataset.antes ?? inp.value; inp.blur(); } });
      inp.addEventListener("change", parar);
      inp.addEventListener("focusout", ev => { parar(ev); aplicar(); });
      caixa.append(inp);
    }
    return caixa;
  };
  if (grupos.topo.length) meio.prepend(montar([...grupos.topo].reverse(), "topo"));
  if (grupos.base.length) meio.append(montar(grupos.base, "base"));
  if (grupos.esquerda.length) (raiz.querySelector(".col.left") ?? meio).prepend(montar(grupos.esquerda, "esquerda"));
  if (grupos.direita.length) (raiz.querySelector(".col.right") ?? meio).append(montar(grupos.direita, "direita"));
});

// "renderTokenApplication" vale para o Configurar Token e o Token Protótipo no v14 (mesmo gancho do Bar Brawl 1.9).
Hooks.on("renderTokenApplication", (app, html) => { try { naurenTokenConfigBarras(app, html); } catch (err) { console.warn("Nauren RPG | barras no Configurar Token", err); } });

/** 0.96.2: subir o Nível na mão também sobe o XP total até o mínimo daquele nível (o XP nunca fica "de nível menor"). */
Hooks.on("preUpdateActor", (actor, changes, options) => {
  if (options?.naurenMigracaoXp) return;
  const nv = foundry.utils.getProperty(changes, "system.nivel");
  if (nv === undefined || foundry.utils.hasProperty(changes, "system.xp")) return;
  const minimo = naurenXpParaNivel(nv);
  if ((Number(actor.system?.xp) || 0) < minimo && Number(nv) > (Number(actor.system?.nivel) || 1)) foundry.utils.setProperty(changes, "system.xp", minimo);
});

Hooks.on("preCreateActor", (actor, data) => {
  if (actor.type !== "npc" || foundry.utils.getProperty(data, "flags.nauren.barras")) return;
  let padrao = null; try { padrao = game.settings.get("nauren", "barrasPadraoNpc"); } catch (err) { padrao = null; }
  if (Array.isArray(padrao) && padrao.length) actor.updateSource({ "flags.nauren.barras": { lista: padrao, versao: NAUREN_HUD_VERSAO_PADRAO } });
});
}

export { NAUREN_HUD_CORES_ANTIGAS_V3, NAUREN_HUD_CORES_ANTIGAS_V4, NAUREN_HUD_ESTADO_CORES, NAUREN_HUD_FORMAS, NAUREN_HUD_POSICOES, NAUREN_HUD_PREENCHIMENTOS, NAUREN_HUD_QUANDO, NAUREN_HUD_QUEM_VE, NAUREN_HUD_RECURSOS_BASE, NAUREN_HUD_ROTULOS, NAUREN_HUD_VERSAO_PADRAO, NaurenBarrasEditor, naurenConstrucaoPelaChave, naurenHudAbrirAjusteRapido, naurenHudAgendarQuadro, naurenHudAnimacoes, naurenHudAnimacoesLigadas, naurenHudApagarBarraLivre, naurenHudAplicarTextoNoRecurso, naurenHudBarraPadrao, naurenHudBarrasDoToken, naurenHudCliqueNaBarra, naurenHudCondicoesDoAtor, naurenHudCorEm, naurenHudCorFaixa, naurenHudCorNum, naurenHudCriarBarraLivre, naurenHudDesenharBarrasNoToken, naurenHudEscapar, naurenHudEsconderTooltip, naurenHudEstadoDeVida, naurenHudGravarBarras, naurenHudGravarRecurso, naurenHudLadoDaBarra, naurenHudLerRecurso, naurenHudLivres, naurenHudMisturar, naurenHudMostrarTooltip, naurenHudPodeVerCondicoes, naurenHudPodeVerNumeros, naurenHudPontoNaTela, naurenHudQuadrosPendentes, naurenHudRecursosDoAtor, naurenHudRegistrarMudanca, naurenHudRemoverContainer, naurenHudTexturaDegrade, naurenHudTexturas, naurenHudTooltipEl, naurenHudValorAnimadoAtual, naurenHudVisivelParaMim, naurenMigrarLojaRestaurar0977, naurenMigrarXpTotal0962, naurenRestaurarArmasDaLoja, naurenTokenConfigBarras, naurenTrocarHtmlMantendoRolagem };
