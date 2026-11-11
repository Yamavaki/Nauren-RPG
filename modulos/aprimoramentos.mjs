/* Nauren RPG — 0.110: Aprimoramentos de itens (Códex Inventariun).
 *
 * 1) PIGMENTOS EM ITENS. Um Equipamento da categoria "pigmento" (cor + qualidade 1 a 10; o Códex vai até 3) é
 *    arrastado até a aba Aprimorar de uma arma/armadura. Espaços pelo tier do item, configuráveis em "Tiers dos
 *    itens" (de fábrica Bronze 1, Prata 2, Ouro/Diamante/Prismático 3; sem tier: não aceita). Com os espaços cheios,
 *    o novo substitui um dos que estão lá (o anterior se perde). Um item pode vir de fábrica com mais pigmentos que
 *    os espaços: nada corta - o limite só vale para aplicar à mão. O bônus da cor vale enquanto o item está
 *    EQUIPADO (somado em prepareDerivedData, nauren.mjs, passo 3.6).
 *
 * 2) ITEM QUE MODIFICA HABILIDADE. Linhas "modificaHabilidades" de uma arma/armadura equipada entram no mesmo
 *    motor dos modificadores de Subclasse (naurenFontesDeModificadores), como uma CAMADA DEPOIS deles:
 *      - Ações da Habilidade/Magia: _coletarModificadoresExternos ordena por camada (Subclasse 0, item 1) e
 *        depois pela fase de sempre - o item soma por cima do que a Subclasse já definiu.
 *      - Condição que a Habilidade aplica (ex.: a cura da Infusão Floral): aplicada na cópia que vai para o alvo,
 *        com os itens de QUEM aplicou (NaurenAlvoHelper.aplicarCondicao, via naurenOrigemComModsDeItens).
 *      - Passivas (gatilhos, usos da passiva, raio da emanação, bônus passivos, bônus contra alvo): lidas por
 *        naurenSistemaEfetivo nos pontos que usam esses campos.
 *    Limites: só modos que somam (somar, dado extra, subir o dado até d20, adicionar Condição); rank no máximo o
 *    rank máximo da habilidade; custos nunca abaixo de 0; nada que mexa em Prioridade; itens iguais (mesmo seedId,
 *    mesma chave da Torre ou mesmo nome) equipados ao mesmo tempo contam uma vez só.
 *    O alvo é guardado pelo seedId do compêndio (não muda quando o sistema atualiza e a ficha re-sincroniza),
 *    com UUID e nome de reserva - ver naurenItemCorrespondeAoAlvo (nauren.mjs), prefixo "alvo:".
 */
import { naurenCatalogoDoItem, naurenTiersDoMundo } from "./itens-catalogo.mjs";
import { NAUREN_KIT_JANELA } from "./janelas-kit.mjs";
import { naurenLog } from "./depuracao.mjs";
import { NAUREN_GATILHO_EVENTO_OPCOES } from "./ficha-item.mjs";
import { NAUREN_CAMPOS_MODIFICADOR_OPCOES, naurenPostarCard, naurenNomeNormalizado } from "../nauren.mjs";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));

/* ============================== PIGMENTOS ============================== */
const META = { espirito: "Espírito", vitalidade: "Vitalidade", poderAtaque: "Poder de Ataque", poderMagia: "Poder de Magia" };
/** As 8 cores do Códex: o que cada uma dá (+1/+2/+3 pela qualidade). "escolha" = decide ao aplicar. */
export const NAUREN_PIGMENTO_CORES = {
  Vermelho: { hex: "#c24b4b", campo: "escolha", opcoes: { poderAtaque: META.poderAtaque, poderMagia: META.poderMagia }, texto: "Poder de Ataque ou de Magia" },
  Azul: { hex: "#4b7fc2", campo: "espirito", texto: "Espírito" },
  Verde: { hex: "#4bc26f", campo: "vitalidade", texto: "Vitalidade" },
  Roxo: { hex: "#8f4bc2", campo: "menorAtributo", texto: "menor atributo" },
  Preto: { hex: "#2a2a2a", campo: "estresse", texto: "limite de Estresse" },
  Branco: { hex: "#e8e4d8", campo: "escolha", opcoes: { ...META }, texto: "qualquer meta atributo" },
  Rosa: { hex: "#e88fc2", campo: "movimento", texto: "Movimento" },
  Dourado: { hex: "#cca162", campo: "destino", texto: "Destino" }
};
const ROTULO_CAMPO_PIGMENTO = { ...META, menorAtributo: "menor atributo", estresse: "limite de Estresse", movimento: "Movimento", destino: "Destino" };
/** Qualidade máxima de um pigmento (o Códex usa 1 a 3; o sistema aceita até 10). */
export const NAUREN_PIGMENTO_QUALIDADE_MAX = 10;
const qualidadeValida = v => Math.max(1, Math.min(NAUREN_PIGMENTO_QUALIDADE_MAX, Math.round(Number(v) || 1)));

/**
 * Quantos pigmentos dá para aplicar à mão neste item: o campo "Espaços de pigmento" do tier dele
 * (Configurações › Tiers dos itens; de fábrica Bronze 1, Prata 2, Ouro/Diamante/Prismático 3). 0 = não aceita.
 */
export function naurenEspacosPigmento(item) {
  if (!["arma", "armadura"].includes(item?.type)) return 0;
  const id = naurenCatalogoDoItem(item).tier;
  if (!id) return 0;
  return naurenTiersDoMundo().find(t => t.id === id)?.pigmentos ?? 0;
}

export function naurenEhPigmentoAplicavel(item) {
  return item?.type === "consumivel" && item.system?.categoria === "pigmento";
}

/** O que um pigmento aplicado dá: { campo, valor, rotulo } (campo "menorAtributo" = Roxo). null se inválido. */
export function naurenEfeitoDoPigmento(p) {
  const def = NAUREN_PIGMENTO_CORES[p?.cor];
  if (!def) return null;
  const q = qualidadeValida(p.qualidade);
  const campo = def.campo === "escolha" ? (def.opcoes[p.escolha] ? p.escolha : Object.keys(def.opcoes)[0]) : def.campo;
  return { campo, valor: q, rotulo: `+${q} ${ROTULO_CAMPO_PIGMENTO[campo] ?? campo}` };
}

/** Bônus de todos os pigmentos do item - só com o item equipado (quem chama confere). */
export function naurenBonusPigmentosDoItem(item) {
  return (item?.system?.pigmentosAplicados ?? []).map(p => ({ p, ef: naurenEfeitoDoPigmento(p) })).filter(x => x.ef)
    .map(({ p, ef }) => ({ ...ef, origem: `${item.name} (Pigmento ${p.cor} ${ef.valor})` }));
}

async function escolherMeta(def, cor) {
  const opcoes = Object.entries(def.opcoes).map(([k, v], i) => `<label class="apr-opcao"><input type="radio" name="escolha" value="${k}" ${i ? "" : "checked"}><span>${esc(v)}</span></label>`).join("");
  return foundry.applications.api.DialogV2.prompt({ ...NAUREN_KIT_JANELA,
    window: { title: `Pigmento ${cor}`, icon: "fas fa-palette" },
    content: `<p>O Pigmento ${esc(cor)} aumenta ${esc(def.texto)}. Escolha qual:</p><div class="apr-opcoes">${opcoes}</div>`,
    ok: { label: "Aplicar", icon: "fas fa-check", callback: (ev, botao) => botao.form?.elements?.escolha?.value ?? "" },
    rejectClose: false
  }).catch(() => null);
}

async function escolherSubstituido(lista, novoTexto) {
  const opcoes = lista.map((p, i) => {
    const ef = naurenEfeitoDoPigmento(p), def = NAUREN_PIGMENTO_CORES[p.cor];
    return `<label class="apr-opcao"><input type="radio" name="idx" value="${i}" ${i ? "" : "checked"}><span class="apr-bola" style="--c:${def?.hex ?? "#888"}">${esc(p.qualidade)}</span><span>${esc(p.cor)} — ${esc(ef?.rotulo ?? "")}</span></label>`;
  }).join("");
  const r = await foundry.applications.api.DialogV2.prompt({ ...NAUREN_KIT_JANELA,
    window: { title: "Espaços cheios", icon: "fas fa-palette" },
    content: `<p>Os espaços de pigmento deste item estão cheios. <b>${esc(novoTexto)}</b> vai substituir um deles, e o pigmento substituído se perde.</p><div class="apr-opcoes">${opcoes}</div>`,
    ok: { label: "Substituir", icon: "fas fa-right-left", callback: (ev, botao) => botao.form?.elements?.idx?.value ?? "" },
    rejectClose: false
  }).catch(() => null);
  return r === null || r === "" ? null : Number(r);
}

/**
 * Aplica o pigmento no item. Gasta 1 do pigmento se ele estiver numa ficha (consumir=true).
 * dados: { cor, qualidade } quando o Mestre adiciona sem item de pigmento.
 */
export async function naurenAplicarPigmentoNoItem(alvo, pigmento, { consumir = true, dados = null, livre = false } = {}) {
  if (!["arma", "armadura"].includes(alvo?.type)) return ui.notifications.warn("Pigmento só pode ser aplicado em armas e armaduras.");
  if (!alvo.isOwner) return ui.notifications.warn("Você não pode mexer neste item.");
  const espacos = naurenEspacosPigmento(alvo);
  if (!espacos && !livre) return ui.notifications.warn(`"${alvo.name}" não tem tier, então não aceita pigmento. Defina o tier na aba Geral.`);
  const cor = dados?.cor ?? pigmento?.system?.pigmentoCor;
  const qualidade = qualidadeValida(dados?.qualidade ?? pigmento?.system?.pigmentoQualidade);
  const def = NAUREN_PIGMENTO_CORES[cor];
  if (!def) return ui.notifications.warn("Esse pigmento não tem uma cor válida.");
  // Branco/Vermelho: o pigmento pode já vir com o atributo definido (aba Pigmento); senão pergunta agora.
  let escolha = dados?.escolha ?? pigmento?.system?.pigmentoEscolha ?? "";
  if (def.campo === "escolha" && !def.opcoes[escolha]) {
    escolha = await escolherMeta(def, cor);
    if (!escolha) return;
  }
  const novo = { cor, qualidade, escolha: def.campo === "escolha" ? escolha : "" };
  const lista = foundry.utils.deepClone(alvo.system.pigmentosAplicados ?? []).map(p => ({ cor: p.cor, qualidade: p.qualidade, escolha: p.escolha ?? "" }));
  const novoTexto = `${cor} ${qualidade} (${naurenEfeitoDoPigmento(novo).rotulo})`;
  let substituido = null;
  if (livre || lista.length < espacos) lista.push(novo);
  else {
    const idx = lista.length === 1 ? 0 : await escolherSubstituido(lista, novoTexto);
    if (idx === null || !lista[idx]) return;
    if (lista.length === 1) {
      const ok = await foundry.applications.api.DialogV2.confirm({ ...NAUREN_KIT_JANELA, window: { title: "Substituir pigmento", icon: "fas fa-palette" },
        content: `<p>"${esc(alvo.name)}" só tem 1 espaço. <b>${esc(novoTexto)}</b> substitui o Pigmento ${esc(lista[0].cor)} ${esc(lista[0].qualidade)}, que se perde.</p>`, rejectClose: false }).catch(() => false);
      if (!ok) return;
    }
    substituido = lista[idx];
    lista[idx] = novo;
  }
  await alvo.update({ "system.pigmentosAplicados": lista });
  if (consumir && pigmento?.parent && pigmento.isOwner) {
    const q = Number(pigmento.system.quantidade) || 0;
    if (q > 1) await pigmento.update({ "system.quantidade": q - 1 });
    else if (pigmento.system.manterAoZerar) await pigmento.update({ "system.quantidade": 0 });
    else await pigmento.delete();
  }
  const dono = alvo.actor ?? null;
  naurenPostarCard({ ator: dono, titulo: "Pigmento aplicado", icone: alvo.img, fonte: alvo.name, linhas: [
    { label: "Pigmento", value: novoTexto },
    substituido ? { label: "Substituiu", value: `${substituido.cor} ${substituido.qualidade} (perdido)` } : null,
    { label: "Espaços", value: `${lista.length} de ${espacos || lista.length}`, breakdown: "O bônus vale enquanto o item estiver equipado." }
  ].filter(Boolean) }).catch(() => {});
  naurenLog(`Nauren RPG | Pigmento ${novoTexto} aplicado em "${alvo.name}".`);
}

export async function naurenRemoverPigmentoDoItem(alvo, idx) {
  const lista = foundry.utils.deepClone(alvo.system.pigmentosAplicados ?? []);
  const p = lista[idx]; if (!p) return;
  const ok = await foundry.applications.api.DialogV2.confirm({ ...NAUREN_KIT_JANELA, window: { title: "Remover pigmento", icon: "fas fa-eraser" },
    content: `<p>Raspar o Pigmento ${esc(p.cor)} ${esc(p.qualidade)} de "${esc(alvo.name)}"? Ele se perde.</p>`, rejectClose: false }).catch(() => false);
  if (!ok) return;
  lista.splice(idx, 1);
  await alvo.update({ "system.pigmentosAplicados": lista });
}

/* ============================== MODIFICA HABILIDADE ============================== */
/** Modos que um item pode usar (sempre somam por cima do que a Subclasse definiu). */
export const NAUREN_MODOS_ITEM = { somar: "Somar", dadoExtra: "Dado extra", subirDado: "Subir o dado", adicionar: "Adicionar Condição" };
const MODOS_ITEM = new Set(Object.keys(NAUREN_MODOS_ITEM));
const TIPOS_ALVO = new Set(["habilidade", "magia", "condicao"]);
const CAMPOS_CUSTO = /(^|\.)(custoEstamina|custoMana|cargasCustoPorUso)$/;

/** Chave composta do alvo (seedId|uuid|tipo|nome) lida por naurenItemCorrespondeAoAlvo. */
export function naurenChaveAlvoModificacao(m) {
  return "alvo:" + [m.alvoSeedId, m.alvoUuid, m.alvoTipo, m.alvoNome].map(v => encodeURIComponent(v ?? "")).join("|");
}

/** item corresponde ao alvo composto? seedId manda; sem seedId no item, cai para UUID e depois tipo + nome. */
export function naurenCorrespondeAlvoComposto(item, chave) {
  const [seed, uuid, tipo, nome] = String(chave).slice(5).split("|").map(v => decodeURIComponent(v ?? ""));
  const seedItem = item.flags?.nauren?.seedId ?? item.getFlag?.("nauren", "seedId") ?? "";
  if (seed && seedItem) return seedItem === seed;
  if (uuid && (item.uuid === uuid || item.getFlag?.("nauren", "origemUuid") === uuid || item.getFlag?.("core", "sourceId") === uuid || item._stats?.compendiumSource === uuid)) return true;
  return !!nome && (!tipo || item.type === tipo) && naurenNomeNormalizado(item.name) === naurenNomeNormalizado(nome);
}

function chaveDoItemFonte(item) {
  return item.flags?.nauren?.seedId || item.flags?.nauren?.torre?.chave || `${item.type}:${naurenNomeNormalizado(item.name)}`;
}

/** Fontes "item equipado" para naurenFontesDeModificadores (camada 1, depois das Subclasses). */
export function naurenFontesDeItens(actor) {
  const fontes = [], vistos = new Set();
  for (const item of actor?.items ?? []) {
    if (!["arma", "armadura"].includes(item.type) || !item.system?.equipado) continue;
    const linhas = (item.system.modificaHabilidades ?? []).filter(m => m.campo && MODOS_ITEM.has(m.modo) && String(m.valor ?? "").trim() !== ""
      && !/prioridade/i.test(m.campo) && (m.alvoSeedId || m.alvoUuid || m.alvoNome));
    if (!linhas.length) continue;
    const chave = chaveDoItemFonte(item);
    if (vistos.has(chave)) continue; // itens iguais não acumulam
    vistos.add(chave);
    const entradas = [];
    for (const m of linhas) {
      const base = { itemAlvoUuid: naurenChaveAlvoModificacao(m), campo: m.campo, prioridade: 0, condicaoNovaAcumulos: m.condicaoNovaAcumulos || "1", condicaoNovaSoSeAcertar: true };
      entradas.push({ ...base, modo: m.modo, valorPorRank: [{ rank: 1, valor: String(m.valor).trim() }] });
      if (CAMPOS_CUSTO.test(m.campo)) entradas.push({ ...base, modo: "minimo", valorPorRank: [{ rank: 1, valor: "0" }] }); // custo nunca abaixo de 0
    }
    fontes.push({ nome: item.name, rank: 1, entradas, chave: `item:${item.id}`, tipo: "Item equipado", camada: 1 });
  }
  return fontes;
}

/* ---- aplicar modificações fora das Ações (Condição aplicada e passivas) ---- */
const ESCADA = [4, 6, 8, 10, 12, 20];
function subirDado(formula, passos) {
  const n = Math.round(Number(passos) || 0);
  if (!formula || !n) return formula;
  return String(formula).replace(/d(\d+)/gi, (m, f) => { const i = ESCADA.indexOf(Number(f)); return i < 0 ? m : `d${ESCADA[Math.max(0, Math.min(ESCADA.length - 1, i + n))]}`; });
}
function maiorFace(formula) { let m = 0; for (const x of String(formula ?? "").matchAll(/d(\d+)/gi)) m = Math.max(m, Number(x[1])); return m; }
function somar(atual, valor) {
  const v = String(valor ?? "").trim();
  if (typeof atual === "number") return atual + (Number(v) || 0);
  const a = String(atual ?? "").trim();
  if (a === "") return /^[+-]?\d+(\.\d+)?$/.test(v) ? v.replace(/^\+/, "") : v;
  if (/^[+-]?\d+(\.\d+)?$/.test(a) && /^[+-]?\d+(\.\d+)?$/.test(v)) return String(Number(a) + Number(v));
  if (/^[+-]?\d+$/.test(v)) return `${a}${v.startsWith("-") ? v : `+${v.replace(/^\+/, "")}`}`;
  return `(${a})+(${v})`;
}
function aplicarUm(atual, modo, valor) {
  if (modo === "somar") return somar(atual, valor);
  if (modo === "subirDado") return subirDado(String(atual ?? ""), valor);
  if (modo === "dadoExtra") { const n = Math.round(Number(valor) || 0), f = maiorFace(atual); return n > 0 && f ? `${atual}+${n}d${f}` : atual; }
  if (modo === "minimo") { const a = Number(atual), l = Number(valor); return Number.isFinite(a) && Number.isFinite(l) && atual !== "" ? (typeof atual === "number" ? Math.max(a, l) : String(Math.max(a, l))) : atual; }
  return atual;
}

/** Modificações de itens equipados de "actor" que miram "doc" fora das Ações: [{ campo, modo, valor, origem }]. */
export function naurenModsDeItensPara(actor, doc) {
  if (!actor || !doc) return [];
  const out = [];
  for (const fonte of naurenFontesDeItens(actor)) {
    for (const e of fonte.entradas) {
      if (e.campo === "rank" || e.campo.startsWith("acoes.") || e.modo === "adicionar") continue;
      if (!naurenCorrespondeAlvoComposto(doc, e.itemAlvoUuid)) continue;
      out.push({ campo: e.campo, modo: e.modo, valor: e.valorPorRank?.[0]?.valor ?? "", origem: fonte.nome });
    }
  }
  return out;
}

/** Aplica a lista numa cópia de "sistema" (objeto puro). A tabela "Por Rank" irmã de uma fórmula muda junto. */
export function naurenAplicarModsEmSistema(sistema, mods) {
  const s = foundry.utils.deepClone(sistema);
  const ordem = { somar: 1, dadoExtra: 1, subirDado: 0, minimo: 2 };
  for (const m of [...mods].sort((a, b) => (ordem[a.modo] ?? 1) - (ordem[b.modo] ?? 1))) {
    const atual = foundry.utils.getProperty(s, m.campo);
    if (atual === undefined) continue;
    foundry.utils.setProperty(s, m.campo, aplicarUm(atual, m.modo, m.valor));
    const mPR = m.campo.match(/^(.*)\.formula$/);
    const pr = mPR ? foundry.utils.getProperty(s, `${mPR[1]}.porRank`) : null;
    if (Array.isArray(pr) && pr.length && m.modo !== "minimo") pr.forEach(x => { if (x?.formula) x.formula = aplicarUm(x.formula, m.modo, m.valor); });
  }
  return s;
}

const cacheSistema = new WeakMap();
/**
 * "system" do item com as modificações dos itens equipados do dono (passivas). Sem modificação, devolve o
 * próprio item.system (custo zero). Cache por item, refeito quando qualquer item do ator muda.
 */
export function naurenSistemaEfetivo(actor, item) {
  if (!actor || !item || !TIPOS_ALVO.has(item.type)) return item?.system;
  try {
    const mods = naurenModsDeItensPara(actor, item);
    if (!mods.length) return item.system;
    const assinatura = JSON.stringify(mods) + (item._source?._stats?.modifiedTime ?? "");
    const c = cacheSistema.get(item);
    if (c?.assinatura === assinatura) return c.sistema;
    const base = typeof item.system?.toObject === "function" ? item.system.toObject() : foundry.utils.deepClone(item.system);
    const sistema = naurenAplicarModsEmSistema(base, mods);
    cacheSistema.set(item, { assinatura, sistema });
    return sistema;
  } catch (err) { console.warn("Nauren RPG | Modificação de item em passiva", err); return item.system; }
}

/**
 * Condição/Efeito de origem visto com as modificações dos itens de QUEM aplica (conjurador). Devolve o próprio
 * documento quando nada muda; senão, um objeto que herda dele com "system" e "toObject()" trocados.
 */
export function naurenOrigemComModsDeItens(origem, conjuradorUuid) {
  if (!origem || !conjuradorUuid || origem.type !== "condicao") return origem;
  try {
    let doc = null;
    try { doc = fromUuidSync(conjuradorUuid); } catch (err) { doc = null; }
    const ator = doc?.actor ?? (doc?.documentName === "Actor" ? doc : null);
    const mods = naurenModsDeItensPara(ator, origem);
    if (!mods.length) return origem;
    const sistema = naurenAplicarModsEmSistema(origem.system.toObject(), mods);
    const o = Object.create(origem);
    Object.defineProperty(o, "system", { value: sistema, enumerable: true });
    o.toObject = (...a) => { const d = origem.toObject(...a); d.system = foundry.utils.deepClone(sistema); return d; };
    naurenLog(`Nauren RPG | "${origem.name}" aplicada com ${mods.length} modificação(ões) de item: ${mods.map(m => `${m.origem} (${m.campo} ${m.modo} ${m.valor})`).join("; ")}`);
    return o;
  } catch (err) { console.warn("Nauren RPG | Condição com modificação de item", err); return origem; }
}

/* ---- opções amigáveis: o que dá para mudar num documento ---- */
const F = (campo, rotulo, modos, extra = {}) => ({ campo, rotulo, modos, ...extra });
const MD = ["somar", "dadoExtra", "subirDado"];
const temFormula = b => !!(b?.formula || (b?.porRank ?? []).some(x => x?.formula));
const formulaDe = b => b?.formula || (b?.porRank ?? []).find(x => x?.formula)?.formula || "";
/** Dado extra e subir o dado só fazem sentido em fórmula com dado (em qualquer rank). */
const modosDe = b => [b?.formula, ...(b?.porRank ?? []).map(x => x?.formula)].some(x => /d\d/i.test(x ?? "")) ? MD : ["somar"];

async function docPorUuid(uuid) { try { return uuid ? await fromUuid(uuid) : null; } catch (err) { return null; } }

/** Grupos de opções de um documento: [{ grupo, alvo: { uuid, seedId, nome, tipo }, opcoes: [...] }]. */
export async function naurenOpcoesModificaveis(doc) {
  if (!doc || !TIPOS_ALVO.has(doc.type)) return [];
  const sys = doc.system ?? {};
  const alvoDe = d => ({ uuid: d.uuid, seedId: d.flags?.nauren?.seedId ?? "", nome: d.name, tipo: d.type, img: d.img });
  const grupos = [];
  const proprio = { grupo: doc.name, alvo: alvoDe(doc), opcoes: [] };
  const condicoes = new Map();
  (sys.acoes ?? []).forEach((a, i) => {
    const pre = `acoes.${i}.`, nomeA = a.nome || `Ação ${i + 1}`;
    (a.danos ?? []).forEach((d, j) => { if (temFormula(d)) proprio.opcoes.push(F(`${pre}danos.${j}.formula`, `${nomeA} › Dano${a.danos.length > 1 ? ` ${j + 1}` : ""} (${formulaDe(d)})`, modosDe(d))); });
    (a.curas ?? []).forEach((d, j) => { if (temFormula(d)) proprio.opcoes.push(F(`${pre}curas.${j}.formula`, `${nomeA} › Cura${a.curas.length > 1 ? ` ${j + 1}` : ""} (${formulaDe(d)})`, modosDe(d))); });
    if (a.usaEscudo && a.escudoFormula) proprio.opcoes.push(F(`${pre}escudoFormula`, `${nomeA} › Escudo (${a.escudoFormula})`, modosDe({ formula: a.escudoFormula })));
    if (Number(a.custoEstamina) > 0) proprio.opcoes.push(F(`${pre}custoEstamina`, `${nomeA} › Custo de Estamina (${a.custoEstamina}) — use negativo para reduzir`, ["somar"]));
    if (Number(a.custoMana) > 0) proprio.opcoes.push(F(`${pre}custoMana`, `${nomeA} › Custo de Mana (${a.custoMana}) — use negativo para reduzir`, ["somar"]));
    if (a.alcance !== undefined) proprio.opcoes.push(F(`${pre}alcanceBonusExtraFormula`, `${nomeA} › Alcance (metros a mais)`, ["somar"]));
    if (a.usaUsos) proprio.opcoes.push(F(`${pre}usosMax`, `${nomeA} › Usos (${a.usosMax})`, ["somar"]));
    if (a.usaTemplatePersistente && a.templatePersistenteDuracaoRodadas !== undefined) proprio.opcoes.push(F(`${pre}templatePersistenteDuracaoRodadas`, `${nomeA} › Duração da área (rodadas)`, ["somar"]));
    (a.condicoesAplicadas ?? []).forEach((c, k) => {
      if (!c?.uuid) return;
      condicoes.set(c.uuid, nomeA);
      proprio.opcoes.push(F(`${pre}condicoesAplicadas.${k}.acumulos`, `${nomeA} › Acúmulos da Condição ${k + 1} (${c.acumulos ?? 1})`, ["somar"], { condUuid: c.uuid }));
    });
    proprio.opcoes.push(F(`${pre}condicoesAplicadas`, `${nomeA} › Aplicar mais uma Condição`, ["adicionar"]));
  });
  if ((sys.rankMax ?? 0) > 0 && doc.type !== "condicao") proprio.opcoes.push(F("rank", `Rank (até o máximo, ${sys.rankMax})`, ["somar"]));
  if (sys.usaUsosPassiva) {
    const formula = String(sys.usosPassivaMaxFormula ?? "").trim();
    proprio.opcoes.push(formula ? F("usosPassivaMaxFormula", `Passiva › Usos (${formula})`, ["somar"]) : F("usosPassivaMax", `Passiva › Usos (${sys.usosPassivaMax ?? 0})`, ["somar"]));
  }
  (sys.gatilhos ?? []).forEach((g, i) => { if (sys.usaGatilhos && g?.quantidade !== undefined && String(g.quantidade).trim() !== "") proprio.opcoes.push(F(`gatilhos.${i}.quantidade`, `Passiva › ${NAUREN_GATILHO_EVENTO_OPCOES[g.evento] ?? g.evento} (${g.quantidade})`, /d\d/i.test(g.quantidade) ? MD : ["somar"])); });
  if (sys.usaEmanacao) proprio.opcoes.push(F("emanacaoRaio", `Passiva › Raio da emanação (${sys.emanacaoRaio} m)`, ["somar"]));
  (sys.modificadores ?? []).forEach((m, i) => { if (m?.campo) proprio.opcoes.push(F(`modificadores.${i}.valor`, `${doc.type === "condicao" ? "Condição" : "Passiva"} › ${NAUREN_CAMPOS_MODIFICADOR_OPCOES[m.campo] ?? m.campo} (${m.valor})`, ["somar"])); });
  (sys.bonusCondicionalAoAlvo ?? []).forEach((b, i) => { if (b?.condicaoUuid) proprio.opcoes.push(F(`bonusCondicionalAoAlvo.${i}.valor`, `Passiva › Bônus de ${b.campo || "dano"} contra alvo com Condição (${b.valor})`, ["somar"])); });
  if (doc.type === "condicao") {
    const POR_TURNO = { cura: "Cura", dano: "Dano", mana: "Mana", estamina: "Estamina", estresse: "Estresse" };
    (sys.efeitosPeriodicos ?? []).forEach((e, i) => { if (temFormula(e)) proprio.opcoes.push(F(`efeitosPeriodicos.${i}.formula`, `Condição › ${POR_TURNO[e.recurso] ?? "Efeito"} por turno (${formulaDe(e)})`, modosDe(e))); });
    if ((sys.duracaoRodadas ?? 0) > 0) proprio.opcoes.push(F("duracaoRodadas", `Condição › Duração (${sys.duracaoRodadas})`, ["somar"]));
  }
  if (sys.usaEmanacao && sys.emanacaoCondicaoUuid) condicoes.set(sys.emanacaoCondicaoUuid, "Emanação");
  grupos.push(proprio);
  for (const [uuid, via] of condicoes) {
    if (doc.type === "condicao") break;
    const c = await docPorUuid(uuid);
    if (!c || c.type !== "condicao") continue;
    const sub = await naurenOpcoesModificaveis(c);
    const g = sub[0];
    if (!g?.opcoes.length) continue;
    g.grupo = `Condição “${c.name}” (aplicada por ${via})`;
    g.opcoes = g.opcoes.filter(o => !o.campo.startsWith("acoes."));
    if (g.opcoes.length) grupos.push(g);
  }
  return grupos;
}

/* ============================== ABA "APRIMORAR" ============================== */
export const NAUREN_APRIMORAR_TIPOS = new Set(["arma", "armadura"]);
/** A ficha do item mostra a aba Aprimorar? (armas, armaduras e o próprio Pigmento, para escolher cor e qualidade) */
export function naurenTemAbaAprimorar(item) { return NAUREN_APRIMORAR_TIPOS.has(item?.type) || naurenEhPigmentoAplicavel(item); }

function pigmentoConfigHtml(item) {
  const cor = item.system.pigmentoCor, q = Number(item.system.pigmentoQualidade) || 1, def = NAUREN_PIGMENTO_CORES[cor];
  const cores = Object.entries(NAUREN_PIGMENTO_CORES).map(([k, d]) => `<button type="button" class="apr-cor ${k === cor ? "on" : ""}" data-apr-pig="cor" data-v="${k}" style="--c:${d.hex}" title="${esc(k)}: ${esc(d.texto)}"><span></span>${esc(k)}</button>`).join("");
  const qs = Array.from({ length: NAUREN_PIGMENTO_QUALIDADE_MAX }, (_, k) => k + 1).map(n => `<button type="button" class="apr-q ${n === q ? "on" : ""} ${n > 3 ? "extra" : ""}" data-apr-pig="q" data-v="${n}" title="Qualidade ${n}: +${n}${n > 3 ? " (acima do Códex, que vai até 3)" : ""}">${n}</button>`).join("");
  const escolha = item.system.pigmentoEscolha ?? "";
  const ehEscolha = def?.campo === "escolha";
  const alvoTxt = ehEscolha ? (def.opcoes[escolha] ?? def.texto) : def?.texto;
  const escolhas = ehEscolha ? [["", `<i class="fas fa-circle-question"></i> Perguntar ao aplicar`], ...Object.entries(def.opcoes)].map(([k, v]) =>
    `<button type="button" class="apr-seg2 ${k === (def.opcoes[escolha] ? escolha : "") ? "on" : ""}" data-apr-pig="escolha" data-v="${k}">${k ? esc(v) : v}</button>`).join("") : "";
  return `<div class="apr-painel"><section class="apr-bloco nt-ch">
    <header class="apr-cab"><i class="fas fa-palette"></i><b>Pigmento</b></header>
    <div class="apr-previa-pig"><span class="apr-bola grande" style="--c:${def?.hex ?? "#777"}">${q}</span>
      <span><b>${esc(cor)} · qualidade ${q}</b><small>Aplicado num item equipado: <b>+${q} em ${esc(alvoTxt ?? "?")}</b></small></span></div>
    <span class="apr-rot">Cor</span><div class="apr-cores">${cores}</div>
    ${ehEscolha ? `<span class="apr-rot">Aumenta</span><div class="apr-segs">${escolhas}</div>` : ""}
    <span class="apr-rot">Qualidade <small class="apr-rot-nota">o Códex vai até 3</small></span><div class="apr-qs">${qs}</div>
    <p class="apr-dica">Para aplicar: abra a ficha da arma ou armadura, aba <b>Aprimorar</b>, e arraste este pigmento para "Pigmentos". Se ele estiver numa ficha, gasta 1.${ehEscolha ? ` Com "Perguntar ao aplicar", quem aplica escolhe o atributo na hora.` : ""}</p>
  </section></div>`;
}

async function alvoDaLinha(m) {
  let d = await docPorUuid(m.viaUuid || m.alvoUuid);
  if (d) return d;
  const seed = m.viaSeedId || m.alvoSeedId;
  if (seed) for (const pack of game.packs.filter(p => p.documentName === "Item")) {
    const idx = await pack.getIndex({ fields: ["flags.nauren.seedId"] }).catch(() => null);
    const e = idx?.find(i => i.flags?.nauren?.seedId === seed);
    if (e) return pack.getDocument(e._id);
  }
  return null;
}

/** HTML da aba (async: monta as listas de opções a partir das habilidades alvo). */
export async function naurenAprimorarHtml(item) {
  if (naurenEhPigmentoAplicavel(item)) return pigmentoConfigHtml(item);
  const espacos = naurenEspacosPigmento(item);
  const tierId = naurenCatalogoDoItem(item).tier;
  const tierNome = naurenTiersDoMundo().find(t => t.id === tierId)?.nome ?? tierId;
  const lista = item.system.pigmentosAplicados ?? [];
  const gm = game.user.isGM;
  const slot = (p, i) => {
    const def = NAUREN_PIGMENTO_CORES[p.cor], ef = naurenEfeitoDoPigmento(p);
    return `<div class="apr-slot cheio" style="--c:${def?.hex ?? "#777"}">
      <span class="apr-bola" style="--c:${def?.hex ?? "#777"}">${esc(p.qualidade)}</span>
      <span class="apr-slot-txt"><b>${esc(p.cor ?? "?")}</b><small>${esc(ef?.rotulo ?? "cor inválida")}</small></span>
      ${item.isOwner ? `<a class="apr-x" data-apr="removerPigmento" data-i="${i}" title="Raspar (o pigmento se perde)"><i class="fas fa-xmark"></i></a>` : ""}
    </div>`;
  };
  const vagos = Math.max(0, espacos - lista.length);
  const slots = [...lista.map(slot), ...Array.from({ length: vagos }, () => `<div class="apr-slot vago"><span class="apr-bola vaga"><i class="fas fa-plus"></i></span><span class="apr-slot-txt"><small>Espaço livre</small></span></div>`)].join("");
  const contagem = espacos ? `${lista.length} de ${espacos}` : (lista.length ? `${lista.length}` : "—");
  const pigmentos = `<section class="apr-bloco nt-ch" data-apr-drop="pigmento">
    <header class="apr-cab"><i class="fas fa-palette"></i><b>Pigmentos</b><span class="apr-pilula">${contagem}</span>
      ${gm ? `<button type="button" class="apr-mini" data-apr="pigmentoMestre" title="Mestre: põe um pigmento direto (para criar itens que já vêm pigmentados)"><i class="fas fa-plus"></i> Pigmento</button>` : ""}</header>
    ${espacos ? `<p class="apr-dica">Arraste um <b>Pigmento</b> (Equipamento › categoria Pigmento) até aqui. Este item é <b>${esc(tierNome)}</b>: ${espacos} ${espacos === 1 ? "espaço" : "espaços"} (definido em Configurações › Tiers dos itens). Com os espaços cheios, o novo substitui um antigo. O bônus vale enquanto o item estiver <b>equipado</b>.</p>`
      : `<p class="apr-dica apr-aviso"><i class="fas fa-circle-info"></i> ${tierId ? `O tier <b>${esc(tierNome)}</b> está com 0 espaços de pigmento (Configurações › Tiers dos itens).` : "Sem tier, este item não aceita pigmento. Defina o tier na aba Geral."}</p>`}
    ${lista.length > espacos && espacos ? `<p class="apr-dica">Este item veio com mais pigmentos que os espaços do tier. Eles continuam valendo; para aplicar um novo à mão, ele substitui um dos atuais.</p>` : ""}
    ${slots ? `<div class="apr-slots">${slots}</div>` : ""}
  </section>`;

  const linhas = item.system.modificaHabilidades ?? [];
  const cards = [];
  for (const [i, m] of linhas.entries()) {
    const docMenu = await alvoDaLinha(m);
    const grupos = docMenu ? await naurenOpcoesModificaveis(docMenu) : [];
    let atual = null;
    const opts = grupos.map(g => `<optgroup label="${esc(g.grupo)}">${g.opcoes.map(o => {
      const sel = o.campo === m.campo && (g.alvo.seedId ? g.alvo.seedId === m.alvoSeedId : g.alvo.uuid === m.alvoUuid);
      if (sel) atual = o;
      return `<option value="${esc(JSON.stringify({ a: g.alvo, c: o.campo, r: o.rotulo }))}" ${sel ? "selected" : ""}>${esc(o.rotulo)}</option>`;
    }).join("")}</optgroup>`).join("");
    const semOpcao = !atual && m.campo ? `<option selected>${esc(m.rotulo || m.campo)} (não encontrado)</option>` : "";
    const modos = (atual?.modos ?? (m.modo ? [m.modo] : ["somar"])).map(k => `<option value="${k}" ${k === m.modo ? "selected" : ""}>${esc(NAUREN_MODOS_ITEM[k] ?? k)}</option>`).join("");
    const dicaValor = { somar: "ex.: 2 ou 1d4", dadoExtra: "quantos dados", subirDado: "quantos passos", adicionar: "arraste uma Condição" }[m.modo] ?? "";
    let valorHtml;
    if (m.modo === "adicionar") {
      const c = m.valor ? await docPorUuid(m.valor) : null;
      valorHtml = `<span class="apr-valor-cond" data-apr-drop="condicaoNova" data-i="${i}" title="Arraste uma Condição">${c ? `<img src="${esc(c.img)}" alt=""> ${esc(c.name)}` : `<i class="fas fa-droplet"></i> Arraste uma Condição`}</span>
        <input type="text" class="apr-num" data-apr-campo="condicaoNovaAcumulos" data-i="${i}" value="${esc(m.condicaoNovaAcumulos || "1")}" title="Acúmulos" placeholder="1">`;
    } else valorHtml = `<input type="text" class="apr-valor" data-apr-campo="valor" data-i="${i}" value="${esc(m.valor)}" placeholder="${esc(dicaValor)}">`;
    const via = m.viaNome && m.viaNome !== m.alvoNome ? `<small class="apr-via">via ${esc(m.viaNome)}</small>` : "";
    const tipoTxt = { habilidade: "Habilidade", magia: "Magia", condicao: "Condição" }[m.alvoTipo] ?? m.alvoTipo;
    cards.push(`<div class="apr-mod nt-ch">
      <div class="apr-mod-cab">${docMenu ? `<img src="${esc(docMenu.img)}" alt="">` : `<i class="fas fa-circle-question"></i>`}
        <span class="apr-mod-nome"><b>${esc(m.alvoNome || "?")}</b>${via}</span><span class="apr-pilula">${esc(tipoTxt)}</span>
        ${item.isOwner ? `<a class="apr-x" data-apr="removerMod" data-i="${i}" title="Tirar esta modificação"><i class="fas fa-trash"></i></a>` : ""}</div>
      ${docMenu ? "" : `<p class="apr-dica apr-aviso"><i class="fas fa-triangle-exclamation"></i> A habilidade alvo não foi encontrada neste mundo. A linha continua salva e volta a valer se ela existir.</p>`}
      <div class="apr-mod-grade ${m.modo === "adicionar" ? "larga" : ""}">
        <label class="apr-campo apr-o-que"><span>O que muda</span><select data-apr-campo="opcao" data-i="${i}">${semOpcao}${opts || `<option value="">— nada que um item possa mudar —</option>`}</select></label>
        <label class="apr-campo"><span>Como</span><select data-apr-campo="modo" data-i="${i}">${modos}</select></label>
        <label class="apr-campo apr-v"><span>Valor</span><span class="apr-valor-linha">${valorHtml}</span></label>
      </div>
    </div>`);
  }
  const mods = `<section class="apr-bloco nt-ch">
    <header class="apr-cab"><i class="fas fa-wand-sparkles"></i><b>Modifica habilidades</b><span class="apr-pilula">${linhas.length}</span></header>
    <p class="apr-dica">Enquanto este item estiver <b>equipado</b>, muda uma Habilidade, Magia ou a Condição que ela aplica. Soma <b>depois</b> das Subclasses.</p>
    ${cards.join("")}
    ${item.isOwner ? `<div class="apr-drop" data-apr-drop="alvo"><i class="fas fa-hand-pointer"></i><span>Arraste aqui uma <b>Habilidade</b>, <b>Magia</b> ou <b>Condição</b></span></div>` : ""}
    <ul class="apr-regras">
      <li><i class="fas fa-plus"></i> Só soma: não troca o que a Subclasse definiu</li>
      <li><i class="fas fa-dice-d20"></i> Dado no máximo d20</li>
      <li><i class="fas fa-layer-group"></i> Rank até o máximo da habilidade</li>
      <li><i class="fas fa-ban"></i> Não mexe em Prioridade nem deixa custo abaixo de 0</li>
      <li><i class="fas fa-clone"></i> Dois itens iguais equipados contam uma vez</li>
    </ul>
  </section>`;
  return `<div class="apr-painel">${pigmentos}${mods}</div>`;
}

function dadosDoDrop(ev) {
  try { return foundry.applications.ux.TextEditor.implementation.getDragEventData(ev); } catch (err) {
    try { return JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err2) { return null; }
  }
}

/** Liga os controles da aba (chamado no _onRender da ficha do item). */
export function naurenAprimorarLigar(sheet) {
  const item = sheet.item, raiz = sheet.element?.querySelector?.(".apr-painel");
  if (!raiz || !naurenTemAbaAprimorar(item)) return;
  raiz.querySelectorAll("[data-apr-pig]").forEach(el => el.addEventListener("click", ev => {
    ev.preventDefault();
    if (!item.isOwner) return;
    const k = el.dataset.aprPig;
    // Trocar de cor apaga a escolha (Branco e Vermelho têm opções diferentes).
    return item.update(k === "cor" ? { "system.pigmentoCor": el.dataset.v, "system.pigmentoEscolha": "" }
      : k === "escolha" ? { "system.pigmentoEscolha": el.dataset.v } : { "system.pigmentoQualidade": Number(el.dataset.v) });
  }));
  const linhas = () => foundry.utils.deepClone(item.system.modificaHabilidades ?? []).map(m => ({ ...m }));
  const salvar = arr => item.update({ "system.modificaHabilidades": arr });

  raiz.querySelectorAll("[data-apr-drop]").forEach(el => {
    el.addEventListener("dragover", ev => { ev.preventDefault(); el.classList.add("apr-sobre"); });
    el.addEventListener("dragleave", () => el.classList.remove("apr-sobre"));
    el.addEventListener("drop", async ev => {
      ev.preventDefault(); ev.stopPropagation(); el.classList.remove("apr-sobre");
      const d = dadosDoDrop(ev);
      if (d?.type !== "Item" || !d.uuid) return;
      const doc = await fromUuid(d.uuid).catch(() => null);
      if (!doc) return;
      const tipo = el.dataset.aprDrop;
      if (tipo === "pigmento") {
        if (!naurenEhPigmentoAplicavel(doc)) return ui.notifications.warn("Arraste um Pigmento (Equipamento da categoria Pigmento).");
        return naurenAplicarPigmentoNoItem(item, doc);
      }
      if (tipo === "alvo") {
        if (!TIPOS_ALVO.has(doc.type)) return ui.notifications.warn("Arraste uma Habilidade, Magia ou Condição.");
        const grupos = await naurenOpcoesModificaveis(doc);
        const todas = grupos.flatMap(g => g.opcoes.map(o => ({ g, o })));
        const primeira = todas.find(x => x.o.modos.includes("somar")) ?? todas[0] ?? null;
        const seed = doc.flags?.nauren?.seedId ?? "";
        const nova = { alvoUuid: doc.uuid, alvoSeedId: seed, alvoNome: doc.name, alvoTipo: doc.type, viaUuid: "", viaSeedId: "", viaNome: "", campo: "", rotulo: "", modo: "somar", valor: "", condicaoNovaAcumulos: "1" };
        if (primeira) Object.assign(nova, aplicarOpcao(nova, doc, primeira.g.alvo, primeira.o));
        if (!seed && doc.pack == null && !doc.parent) ui.notifications.info(`"${doc.name}" não veio do compêndio do sistema: a ligação usa o nome.`);
        return salvar([...linhas(), nova]);
      }
      if (tipo === "condicaoNova") {
        if (doc.type !== "condicao") return ui.notifications.warn("Arraste uma Condição.");
        const arr = linhas(); const i = Number(el.dataset.i); if (!arr[i]) return;
        arr[i].valor = doc.uuid; return salvar(arr);
      }
    });
  });

  raiz.querySelectorAll("[data-apr]").forEach(el => el.addEventListener("click", async ev => {
    ev.preventDefault();
    const acao = el.dataset.apr, i = Number(el.dataset.i);
    if (acao === "removerPigmento") return naurenRemoverPigmentoDoItem(item, i);
    if (acao === "removerMod") { const arr = linhas(); arr.splice(i, 1); return salvar(arr); }
    if (acao === "pigmentoMestre") return pigmentoDoMestre(item);
  }));

  raiz.querySelectorAll("[data-apr-campo]").forEach(el => el.addEventListener("change", async () => {
    const arr = linhas(), i = Number(el.dataset.i); if (!arr[i]) return;
    const campo = el.dataset.aprCampo;
    if (campo === "opcao") {
      let v = null; try { v = JSON.parse(el.value); } catch (err) { return; }
      const docMenu = await alvoDaLinha(arr[i]);
      const grupos = docMenu ? await naurenOpcoesModificaveis(docMenu) : [];
      const o = grupos.flatMap(g => g.opcoes).find(x => x.campo === v.c && x.rotulo === v.r) ?? { campo: v.c, rotulo: v.r, modos: ["somar"] };
      Object.assign(arr[i], aplicarOpcao(arr[i], docMenu, v.a, o));
    } else if (campo === "modo") {
      arr[i].modo = el.value;
      if (el.value === "adicionar" || arr[i].modo !== "adicionar" && /^Compendium|^Item\./.test(arr[i].valor)) arr[i].valor = "";
    } else arr[i][campo] = el.value.trim();
    return salvar(arr);
  }));
}

/** Escolher uma opção: o alvo pode virar a Condição que a habilidade aplica (guarda a habilidade como "via"). */
function aplicarOpcao(linha, docMenu, alvo, opcao) {
  const ehOutro = docMenu && alvo && alvo.uuid !== docMenu.uuid;
  const via = ehOutro ? { viaUuid: docMenu.uuid, viaSeedId: docMenu.flags?.nauren?.seedId ?? "", viaNome: docMenu.name }
    : { viaUuid: "", viaSeedId: "", viaNome: "" };
  const modo = opcao.modos.includes(linha.modo) ? linha.modo : opcao.modos[0];
  return { ...via, alvoUuid: alvo?.uuid ?? linha.alvoUuid, alvoSeedId: alvo?.seedId ?? "", alvoNome: alvo?.nome ?? linha.alvoNome, alvoTipo: alvo?.tipo ?? linha.alvoTipo,
    campo: opcao.campo, rotulo: opcao.rotulo, modo, valor: modo === linha.modo ? linha.valor : "" };
}

async function pigmentoDoMestre(item) {
  const cores = Object.entries(NAUREN_PIGMENTO_CORES).map(([k, d]) => `<option value="${k}">${k} — ${esc(d.texto)}</option>`).join("");
  const r = await foundry.applications.api.DialogV2.prompt({ ...NAUREN_KIT_JANELA,
    window: { title: "Pôr pigmento (Mestre)", icon: "fas fa-palette" },
    content: `<p class="apr-dica">Põe o pigmento sem gastar nada e sem olhar os espaços do tier (para itens que já vêm pigmentados).</p>
      <div class="form-group"><label>Cor</label><select name="cor">${cores}</select></div>
      <div class="form-group"><label>Qualidade</label><select name="q">${Array.from({ length: NAUREN_PIGMENTO_QUALIDADE_MAX }, (_, k) => `<option value="${k + 1}">${k + 1}</option>`).join("")}</select></div>`,
    ok: { label: "Pôr", icon: "fas fa-check", callback: (ev, botao) => ({ cor: botao.form.elements.cor.value, qualidade: Number(botao.form.elements.q.value) }) },
    rejectClose: false
  }).catch(() => null);
  if (!r) return;
  return naurenAplicarPigmentoNoItem(item, null, { consumir: false, dados: r, livre: true });
}

/** Bolinhas dos pigmentos para a linha do item no inventário. */
export function naurenBolinhasPigmentoHtml(item) {
  const l = item?.system?.pigmentosAplicados ?? [];
  if (!l.length) return "";
  return `<span class="apr-bolinhas" title="${esc(l.map(p => `${p.cor} ${p.qualidade}: ${naurenEfeitoDoPigmento(p)?.rotulo ?? ""}`).join(" • "))}${item.system.equipado ? "" : " (só equipado)"}">${l.map(p => `<i style="--c:${NAUREN_PIGMENTO_CORES[p.cor]?.hex ?? "#777"}"></i>`).join("")}</span>`;
}

/** Raio da emanação com os metros somados por itens equipados do dono (o raio "Por Rank" continua valendo). */
export function naurenRaioEmanacaoComItens(item, raioBase) {
  const base = Number(raioBase) || 0;
  try {
    const mods = naurenModsDeItensPara(item?.actor ?? item?.parent ?? null, item).filter(m => m.campo === "emanacaoRaio" && m.modo === "somar");
    return base + mods.reduce((s, m) => s + (Number(m.valor) || 0), 0);
  } catch (err) { return base; }
}
