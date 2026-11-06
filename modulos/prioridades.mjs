/* Nauren RPG — Registro de Prioridades. Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { NAUREN_FASE_MODIFICADOR, NAUREN_MODOS_MODIFICADOR_EXTERNO_OPCOES, NAUREN_ROTULO_FASE_MODIFICADOR, naurenItemCorrespondeAoAlvo, naurenResolverPorRank, naurenResolverTokenFormula } from "../nauren.mjs";
import { NAUREN_REACAO_CUSTO_OPCOES } from "./ficha-item.mjs";
import { NAUREN_QUERY_DISPARAR_EVENTO, naurenCronometroNoDialog } from "./entidades-campo.mjs";
import { NAUREN_KIT_JANELA } from "./janelas-kit.mjs";
import { naurenConcederRecurso, naurenProcessarGatilhos } from "./icone-condicao-token.mjs";
import { naurenBandoCfg, naurenBandoDados, naurenCombatenteEhDoAtor } from "./bando.mjs";
import { NaurenAlvoHelper } from "./ficha-ator.mjs";


// 0.94.31: Entidades de campo foi para modulos/entidades-campo.mjs.

/* =======================================
 * REGISTRO DE PRIORIDADES (Fase 5)
 * -----------------------------------------------------------------------
 * Cada Prioridade concedida pelo card vira uma entrada no Combate:
 *   { id, deUuid, deNome, paraUuid, paraNome, motivo, item, rodada, turno, usada, usadaEm }
 * Só o Mestre grava (query), jogadores pedem. Serve para: limite de 2 por
 * aliado por turno, "em Prioridade de X" ao agir fora do turno, e o token
 * @prioridadesGeradas.
 * ======================================= */
const NAUREN_QUERY_REGISTRO_PRIORIDADE = "nauren.registroPrioridade";

const NAUREN_QUERY_REACAO_PRE_ATAQUE = "nauren.reacaoPreAtaque";


/**
 * Executado no cliente do dono de quem pode reagir: pergunta se quer usar a
 * habilidade e, se sim, paga o custo (uso + recurso). Devolve o que custou.
 */
async function naurenHandleQueryReacaoPreAtaque({ actorUuid, itemId, atacanteNome, alvoNome, opcoesAlvo = null }) {
  const actor = await fromUuid(actorUuid).catch(() => null);
  const item = actor?.items?.get(itemId);
  if (!item) return null;
  const sys = item.system;
  const custoQtd = Math.max(0, Number(sys.reacaoCustoQuantidade) || 0);
  const custoRec = sys.reacaoCustoRecurso || "";
  if (custoRec && custoQtd && Number(naurenResolverTokenFormula(custoRec, actor)) < custoQtd) return null;
  const acaoTexto = sys.reacaoPreAtaque === "proteger" ? `receber o ataque no lugar de <b>${alvoNome}</b>`
    : sys.reacaoPreAtaque === "escudoVivo" ? "pôr um aliado na frente do golpe"
    : sys.reacaoPreAtaque === "desviar" ? `desviar o ataque de <b>${atacanteNome}</b> para outra criatura`
    : `impor Dificuldade à rolagem de <b>${atacanteNome}</b> contra <b>${alvoNome}</b>`;
  const escEsc = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const seletor = opcoesAlvo?.length ? `<div class="form-group" style="margin-top: 8px;"><label>Novo alvo</label><select name="novoAlvo">${opcoesAlvo.map(o => `<option value="${escEsc(o.uuid)}">${escEsc(o.nome)}</option>`).join("")}</select></div>` : "";
  let escolhido = opcoesAlvo?.[0]?.uuid ?? "";
  const custoTexto = custoRec && custoQtd ? ` (custa ${custoQtd} ${NAUREN_REACAO_CUSTO_OPCOES[custoRec] ?? custoRec})` : "";
  let aceitou = false;
  const tituloPergunta = `${item.name} — ${actor.name}`;
  let pararCronometro = () => {};
  const onRender = (app, html) => {
    if (app?.options?.window?.title !== tituloPergunta) return;
    pararCronometro = naurenCronometroNoDialog(app, html instanceof HTMLElement ? html : (html?.[0] ?? app.element));
  };
  Hooks.on("renderDialogV2", onRender);
  try {
    aceitou = await foundry.applications.api.DialogV2.confirm({ ...NAUREN_KIT_JANELA,
      window: { title: tituloPergunta },
      content: `<p><b>${atacanteNome}</b> vai atacar <b>${alvoNome}</b>.</p><p>Usar <b>${item.name}</b> para ${acaoTexto}${custoTexto}?</p>${seletor}`,
      rejectClose: false,
      yes: { callback: (ev, botao, dialog) => { const sel = (dialog?.element ?? botao?.form)?.querySelector?.('select[name="novoAlvo"]'); if (sel) escolhido = sel.value; return true; } }
    });
  } catch (err) { aceitou = false; }
  finally { Hooks.off("renderDialogV2", onRender); pararCronometro(); }
  if (!aceitou) return null;
  const uso = await naurenConsumirUsoDaHabilidade(item);
  if (!uso.ok) { ui.notifications.warn(`"${item.name}": ${uso.texto}.`); return null; }
  if (custoRec && custoQtd) await naurenConcederRecurso(actor, custoRec, String(-custoQtd), item);
  return { custo: [uso.texto, custoRec && custoQtd ? `−${custoQtd} ${NAUREN_REACAO_CUSTO_OPCOES[custoRec] ?? custoRec}` : ""].filter(Boolean).join(" • "), escolhido };
}


function naurenRegistroPrioridades(combate = game.combat) {
  return foundry.utils.deepClone(combate?.getFlag("nauren", "prioridades") ?? []);
}


/** Quantas Prioridades "de" já deu para "para" no turno atual. */
function naurenPrioridadesNoTurno(deUuid, paraUuid, combate = game.combat) {
  if (!combate?.started) return 0;
  // Só Prioridades "de apoio" (não geradas por ataque/efeito contra o personagem)
  // contam para o limite do livro.
  return naurenRegistroPrioridades(combate).filter(e => !e.tomadaDe && e.indicador !== "PI" && e.deUuid === deUuid && e.paraUuid === paraUuid
    && e.rodada === combate.round && e.turno === combate.turn
    && (e.deLado === undefined || e.paraLado === undefined || e.deLado === e.paraLado)).length; // Prioridade de inimigo nunca entra no limite
}


/** Operações do registro, sempre executadas pelo Mestre ativo. */
async function naurenHandleQueryRegistroPrioridade({ operacao, dados }) {
  const combate = game.combat;
  if (!combate?.started) return null;
  const lista = naurenRegistroPrioridades(combate);
  if (operacao === "registrar") {
    for (const e of dados.entradas ?? []) lista.push({ ...e, id: foundry.utils.randomID(), rodada: combate.round, turno: combate.turn, usada: false });
    await combate.setFlag("nauren", "prioridades", lista.slice(-300));
    return true;
  }
  if (operacao === "tomar") {
    const entrada = [...lista].reverse().find(e => e.paraUuid === dados.paraUuid && !e.usada && e.rodada === combate.round && e.turno === combate.turn);
    if (!entrada) return null;
    entrada.usada = true;
    entrada.usadaEm = `tomada por ${dados.ladraoNome}`;
    lista.push({ ...entrada, id: foundry.utils.randomID(), paraUuid: dados.ladraoUuid, paraNome: dados.ladraoNome, usada: false, usadaEm: "", tomadaDe: entrada.paraNome });
    await combate.setFlag("nauren", "prioridades", lista);
    return { deNome: entrada.deNome, paraNome: entrada.paraNome };
  }
  if (operacao === "consumir" && dados.somenteRoubadaNoTurno) {
    const entrada = lista.find(e => e.paraUuid === dados.paraUuid && !e.usada && e.tomadaDe && e.rodada === combate.round && e.turno === combate.turn);
    if (!entrada) return null;
    entrada.usada = true;
    entrada.usadaEm = dados.acaoNome ?? "";
    await combate.setFlag("nauren", "prioridades", lista);
    return { deNome: entrada.deNome, motivo: entrada.motivo, item: entrada.item, tomadaDe: entrada.tomadaDe };
  }
  if (operacao === "consumir") {
    // Mais antiga ainda não usada, recebida por este ator (Bando: por qualquer lacaio do grupo).
    const entrada = lista.find(e => (e.paraUuid === dados.paraUuid || (dados.paraBando && e.paraBando === dados.paraBando)) && !e.usada);
    if (!entrada) return null;
    entrada.usada = true;
    entrada.usadaEm = dados.acaoNome ?? "";
    await combate.setFlag("nauren", "prioridades", lista);
    return { deNome: entrada.deNome, deUuid: entrada.deUuid ?? "", motivo: entrada.motivo, item: entrada.item, tomadaDe: entrada.tomadaDe ?? "" };
  }
  return null;
}

async function naurenOperarRegistroPrioridade(operacao, dados) {
  const gm = game.users.activeGM;
  if (!gm || !game.combat?.started) return null;
  if (gm.id === game.user.id) return naurenHandleQueryRegistroPrioridade({ operacao, dados });
  return gm.query(NAUREN_QUERY_REGISTRO_PRIORIDADE, { operacao, dados }, { timeout: 15000 }).catch(() => null);
}


/**
 * Uso de uma Habilidade fora de uma Ação normal (ex.: tomar Prioridade):
 * usos passivos, senão a 1ª Ação com usos (e o custo de Estamina/Mana dela).
 */
function naurenUsoDisponivel(item) {
  const sys = item?.system;
  if (!sys) return false;
  if (sys.usaUsosPassiva) return (sys.usosPassivaAtual ?? 0) > 0;
  const acao = (sys.acoes ?? []).find(a => a.usaUsos);
  return acao ? (acao.usosAtual ?? 0) > 0 : true;
}

async function naurenConsumirUsoDaHabilidade(item) {
  const sys = item.system;
  const actor = item.actor;
  if (sys.usaUsosPassiva) {
    if ((sys.usosPassivaAtual ?? 0) <= 0) return { ok: false, texto: "sem usos" };
    await item.update({ "system.usosPassivaAtual": sys.usosPassivaAtual - 1 });
    return { ok: true, texto: `usos ${sys.usosPassivaAtual} → ${sys.usosPassivaAtual - 1}` };
  }
  const acoes = foundry.utils.deepClone(sys.acoes ?? []);
  const idx = acoes.findIndex(a => a.usaUsos);
  if (idx === -1) return { ok: true, texto: "" };
  const acao = acoes[idx];
  if ((acao.usosAtual ?? 0) <= 0) return { ok: false, texto: "sem usos" };
  const est = acao.custoEstamina ?? 0;
  const mana = acao.custoMana ?? 0;
  const estAtual = actor?.system?.estaminaCombate?.value ?? 0;
  const manaAtual = actor?.system?.mana?.value ?? 0;
  if (est > estAtual || mana > manaAtual) return { ok: false, texto: "recursos insuficientes" };
  acao.usosAtual -= 1;
  await item.update({ "system.acoes": acoes });
  const upd = {};
  if (est) upd["system.estaminaCombate.value"] = estAtual - est;
  if (mana) upd["system.mana.value"] = manaAtual - mana;
  if (Object.keys(upd).length) await actor.update(upd);
  return { ok: true, texto: [`usos ${acao.usosAtual + 1} → ${acao.usosAtual}`, est ? `−${est} Estamina` : "", mana ? `−${mana} Mana` : ""].filter(Boolean).join(" • ") };
}


/** Está agindo fora do próprio turno (= em Prioridade, pelo livro)? */
function naurenAgindoForaDoTurno(actor) {
  const c = game.combat;
  if (!c?.started || !c.combatant) return false;
  if (!c.combatants.some(cb => naurenCombatenteEhDoAtor(cb, actor))) return false;
  return !naurenCombatenteEhDoAtor(c.combatant, actor);
}

async function naurenHandleQueryAplicarCondicao({ actorUuid, uuid, acumulos, conjuradorUuid = "", rank = 0 }) {
  const doc = await fromUuid(actorUuid).catch(() => null);
  const actor = doc?.actor ?? doc;
  if (!actor) return null;
  return NaurenAlvoHelper.aplicarCondicao(actor, uuid, acumulos ?? 1, null, rank, 0, "", "1", "", conjuradorUuid);
}

async function naurenHandleQueryDispararEvento({ actorUuid, evento, contexto }) {
  const doc = await fromUuid(actorUuid).catch(() => null);
  const actor = doc?.actor ?? doc;
  if (!actor) return false;
  await naurenProcessarGatilhos(evento, actor, contexto ?? {});
  return true;
}

async function naurenDispararEventoNoDono(actor, evento, contexto = {}) {
  if (!actor) return false;
  const executor = NaurenAlvoHelper.usuarioExecutor(actor);
  if (!executor) return false;
  if (executor.id === game.user.id) {
    await naurenProcessarGatilhos(evento, actor, contexto).catch(err => console.warn(`Nauren RPG | Falha ao processar "${evento}".`, err));
    return true;
  }
  // 0.94.12: um jogador dando algo a outro jogador (ex.: Dar Prioridade ao Empíreo): pergunta ao dono; se a tela dele
  // não responder ou recusar, o Mestre processa no lugar (o efeito não pode se perder no caminho).
  const tentar = async (u) => {
    if (!u || typeof u.query !== "function") return false;
    if (u.id === game.user.id) { await naurenProcessarGatilhos(evento, actor, contexto).catch(err => console.warn(`Nauren RPG | Falha ao processar "${evento}".`, err)); return true; }
    try { return (await u.query(NAUREN_QUERY_DISPARAR_EVENTO, { actorUuid: actor.uuid, evento, contexto }, { timeout: 20000 })) === true; }
    catch (err) { console.warn(`Nauren RPG | "${evento}" em "${actor.name}": ${u.name} não respondeu.`, err); return false; }
  };
  if (await tentar(executor)) return true;
  const gm = game.users.activeGM;
  if (gm && gm.id !== executor.id) {
    contexto = { ...contexto, _mestreAssume: true };
    if (await tentar(gm)) return true;
  }
  console.warn(`Nauren RPG | Não foi possível disparar "${evento}" em "${actor.name}".`);
  return false;
}


/**
 * Tokens de contexto (Fase 4), resolvidos no momento do uso e substituídos
 * nos textos da Ação antes de rolar. Cada token usado é registrado para o
 * card (valor e de onde veio). Tokens com argumento aceitam nome de
 * Condição ou distância em metros:
 *   @rank                      rank efetivo do item
 *   @estresseAlvo @vidaAlvo    do 1º alvo marcado
 *   @condicoesDistintasAlvo    quantas Condições diferentes o alvo tem
 *   @acumulosAlvo(Nome)        acúmulos da Condição "Nome" no alvo
 *   @acumulosMeu(Nome)         acúmulos da Condição "Nome" em você
 *   @estresseMeu               seu Estresse atual
 *   @estresseAliados           soma do Estresse dos seus aliados em cena
 *   @aliadosNoRaio(m)          aliados a até m metros de você
 *   @inimigosNoRaio(m)         inimigos a até m metros de você
 */
const NAUREN_TOKENS_CONTEXTO = ["bandoExtra", "bandoNoAlcance", "bandoVivos", "bandoMembros", "bandoDados", "prioridadesGeradas", "vidaMaxAlvo", "rank", "estresseAlvo", "vidaAlvo", "condicoesDistintasAlvo", "acumulosAlvo", "acumulosMeu", "estresseMeu", "estresseAliados", "aliadosNoRaio", "inimigosNoRaio"];


function naurenContarAcumulos(actor, nomeCondicao) {
  const alvo = String(nomeCondicao ?? "").trim().toLowerCase();
  if (!actor || !alvo) return 0;
  return actor.items
    .filter(i => i.type === "condicao" && i.system.ativo !== false && i.name.toLowerCase() === alvo)
    .reduce((soma, i) => soma + (i.system.acumulativel ? Math.max(1, i.system.acumulos ?? 1) : 1), 0);
}


/** Substitui os tokens de contexto num texto; "usados" recebe {token, valor, fonte}. */
function naurenSubstituirTokensDeContexto(texto, ctx, usados) {
  if (typeof texto !== "string" || !texto.includes("@")) return texto;
  const registrar = (token, valor, fonte) => {
    if (!usados.some(u => u.token === token)) usados.push({ token, valor, fonte });
    return String(valor);
  };
  const alvo = ctx.alvoActor;
  const nomeAlvo = alvo?.name ?? "sem alvo";
  const bandoK = /@bando/.test(texto) && ctx.bandoNoAlcance ? ctx.bandoNoAlcance() : 1;
  return texto
    .replace(/@bandoDados\(([^)]+)\)/g, (m, expr) => { const v = naurenBandoDados(expr, bandoK); registrar(m, v, `${bandoK} do Bando no alcance`); return v; })
    .replace(/@bandoExtra\b/g, m => { const baseB = ctx.actor?.isToken ? game.actors?.get(ctx.actor.token?.actorId) : null; const b = Number((naurenBandoCfg(baseB) ?? naurenBandoCfg(ctx.actor))?.bonusPorLacaio ?? 1) || 0; return registrar(m, Math.max(0, bandoK - 1) * b, `+${b} por lacaio a mais no alcance (${bandoK} no alcance)`); })
    .replace(/@bandoNoAlcance\b/g, m => registrar(m, bandoK, "lacaios do Bando com o alvo no alcance"))
    .replace(/@bandoVivos\b/g, m => registrar(m, ctx.bandoVivos?.() ?? 1, "lacaios vivos do Bando"))
    .replace(/@bandoMembros\b/g, m => registrar(m, ctx.bandoMembros?.() ?? 1, "lacaios no começo do combate"))
    .replace(/@acumulosAlvo\(([^)]+)\)/g, (m, nome) => registrar(m, naurenContarAcumulos(alvo, nome), nomeAlvo))
    .replace(/@acumulosMeu\(([^)]+)\)/g, (m, nome) => registrar(m, naurenContarAcumulos(ctx.actor, nome), ctx.actor?.name))
    .replace(/@aliadosNoRaio\((\d+(?:\.\d+)?)\)/g, (m, r) => registrar(m, ctx.contarNoRaio("aliados", Number(r)), `a até ${r}m`))
    .replace(/@inimigosNoRaio\((\d+(?:\.\d+)?)\)/g, (m, r) => registrar(m, ctx.contarNoRaio("inimigos", Number(r)), `a até ${r}m`))
    .replace(/@rank\b/g, m => registrar(m, ctx.rank, "rank efetivo"))
    .replace(/@estresseAlvo\b/g, m => registrar(m, alvo?.system?.stress?.value ?? 0, nomeAlvo))
    .replace(/@vidaAlvo\b/g, m => registrar(m, alvo?.system?.vida?.value ?? 0, nomeAlvo))
    .replace(/@vidaMaxAlvo\b/g, m => registrar(m, alvo?.system?.vida?.max ?? 0, nomeAlvo))
    .replace(/@condicoesDistintasAlvo\b/g, m => registrar(m, alvo ? new Set(alvo.items.filter(i => i.type === "condicao" && i.system.ativo !== false).map(i => i.name)).size : 0, nomeAlvo))
    .replace(/@estresseMeu\b/g, m => registrar(m, ctx.actor?.system?.stress?.value ?? 0, ctx.actor?.name))
    .replace(/@estresseAliados\b/g, m => registrar(m, ctx.estresseAliados(), "aliados em cena"))
    .replace(/@prioridadesGeradas\b/g, m => registrar(m, naurenRegistroPrioridades().filter(e => !e.tomadaDe && e.deUuid === ctx.actor?.uuid).length, "neste combate"));
}


/** Aplica "fn" a toda string dentro de um objeto/array (cópia nova). */
function naurenMapearStrings(valor, fn) {
  if (typeof valor === "string") return fn(valor);
  if (Array.isArray(valor)) return valor.map(v => naurenMapearStrings(v, fn));
  if (valor && typeof valor === "object") return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, naurenMapearStrings(v, fn)]));
  return valor;
}


/**
 * Todas as fontes de modificadores de um ator (Efeitos com "modifica outro
 * item" e nós de Subclasse investidos com "modificadores"), com o rank que
 * vale para cada uma.
 */
function naurenFontesDeModificadores(actor) {
  const fontes = [];
  for (const item of actor?.items ?? []) {
    if (item.type === "efeito" && item.system.ativo && item.system.modificaOutroItem) {
      fontes.push({ nome: item.name, rank: item.system.rankAtual ?? 0, entradas: item.system.modificadoresExternos ?? [], chave: `efeito:${item.id}`, tipo: "Efeito" });
    } else if (item.type === "subclasse") {
      for (const no of (item.system.nos ?? [])) {
        if (!((no.rankAtual ?? 0) > 0) || !(no.modificadores ?? []).length) continue;
        fontes.push({ nome: no.nome, rank: no.rankAtual, entradas: no.modificadores, chave: `no:${item.id}:${no.id}`, tipo: `Subclasse • ${item.name}` });
      }
    }
  }
  return fontes;
}


/**
 * O que modifica um item específico, para a ficha dele: uma linha por
 * modificador, com fonte, rank, fase e resumo. Mostra também os que estão
 * inativos por condição (marcados).
 */
function naurenModificacoesRecebidas(actor, item) {
  const linhas = [];
  for (const fonte of naurenFontesDeModificadores(actor)) {
    for (const m of fonte.entradas) {
      if (!m.itemAlvoUuid || !m.campo || !naurenItemCorrespondeAoAlvo(item, m.itemAlvoUuid)) continue;
      const valorRank = naurenResolverPorRank(m.valorPorRank, fonte.rank, "valor");
      const modo = m.modo || "substituir";
      const campo = m.campo === "rank" ? "Rank do item" : naurenRotuloCampoModificado(m.campo);
      linhas.push({
        fonte: fonte.nome,
        tipo: fonte.tipo,
        rank: fonte.rank,
        fase: NAUREN_ROTULO_FASE_MODIFICADOR[NAUREN_FASE_MODIFICADOR[modo] ?? 2] ?? "",
        texto: `${campo}: ${(NAUREN_MODOS_MODIFICADOR_EXTERNO_OPCOES[modo] ?? modo).toLowerCase()} ${valorRank ?? "(sem valor neste rank)"}`,
        condicional: !!m.condicaoNecessariaUuid
      });
    }
  }
  return linhas;
}


/**
 * Resumo legível de um modificador (camada): "Comungar • Recurso 1
 * quantidade: substituir por -1d6-1 / -1d6-2 / -1d6-3 (ranks 1/2/3)".
 */
function naurenResumoModificador(m, nomeItemAlvo) {
  if (!m?.campo) return "Escolha o item alvo e o campo.";
  const modo = (NAUREN_MODOS_MODIFICADOR_EXTERNO_OPCOES[m.modo || "substituir"] ?? m.modo).toLowerCase();
  const linhas = (m.valorPorRank ?? []).filter(v => v.valor !== "" && v.valor !== undefined);
  const valores = linhas.map(v => v.valor).join(" / ");
  const ranks = linhas.map(v => v.rank).join("/");
  const campo = m.campo === "rank" ? "Rank do item" : naurenRotuloCampoModificado(m.campo);
  return `${nomeItemAlvo ?? "Item alvo"} • ${campo}: ${modo} ${valores || "(sem valor)"}${ranks ? ` (rank${linhas.length > 1 ? "s" : ""} ${ranks})` : ""}`;
}


/** Rótulo curto de um campo modificado (ex.: "curas.0.formula" -> "Cura 1: fórmula"). */
function naurenRotuloCampoModificado(campo) {
  const nomes = {
    danos: "Dano", curas: "Cura", condicoesAplicadas: "Condição", gastosRecurso: "Recurso",
    formula: "fórmula", quantidade: "quantidade", acumulos: "acúmulos", ativo: "ativa",
    custoEstamina: "Custo de Estamina", custoMana: "Custo de Mana", numeroAlvos: "Nº de alvos",
    templateTamanho: "Tamanho da área", templatePersistenteDuracaoRodadas: "Duração da área",
    templatePersistenteQuantidade: "Efeito da área", quantidadeAtaques: "Nº de ataques",
    custoParaEvitarQuantidade: "custo para resistir", custoParaRemoverQuantidade: "custo para se soltar",
    usaEmpurrar: "Empurrar", alcance: "Alcance", forcarMaximoEfeitoPeriodico: "efeito máximo"
  };
  const partes = String(campo).split(".");
  let prefixo = "";
  if (partes[0] === "acoes" && partes.length > 2) {
    prefixo = partes[1] === "*" ? "Toda Ação • " : `Ação ${Number(partes[1]) + 1} • `;
    partes.splice(0, 2);
  }
  return prefixo + partes.map(p => (/^\d+$/.test(p) ? String(Number(p) + 1) : (nomes[p] ?? p))).join(" ");
}


/**
 * Formato padrão de descrição de habilidades, magias e itens (plano,
 * seção 6b): texto da regra + o que o sistema faz sozinho + o que fica
 * com o jogador/Narrador. Campos vazios não aparecem.
 *   { regra, automatico, manual }  (texto simples; "regra" aceita HTML)
 */
function naurenMontarDescricao({ regra = "", automatico = "", manual = "", nota = "" } = {}) {
  const partes = [];
  if (regra) partes.push(/^\s*</.test(regra) ? regra : `<p>${regra}</p>`);
  const auto = [];
  if (automatico) auto.push(`<b>Automático:</b> ${automatico}`);
  if (manual) auto.push(`<b>Manual:</b> ${manual}`);
  if (auto.length) partes.push(`<p class="nauren-desc-automacao">${auto.join("<br>")}</p>`);
  if (!partes.length && nota) partes.push(`<p>${nota}</p>`);
  return partes.join("");
}


/**
 * Descrição de um item pronta para o card de uso, respeitando a
 * configuração do mundo e a exceção do item. "" quando não deve ir.
 */
async function naurenDescricaoParaChat(item) {
  if (!item) return "";
  if (game.settings.get("nauren", "descricaoNoChat") === "nunca") return "";
  if (item.system?.ocultarDescricaoNoChat) return "";
  // NPC do Mestre (sem dono jogador): o card mostra rolagens e resultados, mas não o texto do item.
  const dono = item.actor ?? item.parent;
  if (dono?.type === "npc" && game.settings.get("nauren", "ocultarDescricaoNpc")
      && !game.users.some(u => !u.isGM && dono.testUserPermission?.(u, "OWNER"))) return "";
  const bruto = item.system?.descricao ?? "";
  if (!bruto.replace(/<[^>]*>/g, "").trim()) return "";
  const { TextEditor } = foundry.applications.ux;
  return (foundry.applications?.ux?.TextEditor?.implementation ?? TextEditor).enrichHTML(bruto, { secrets: item.isOwner, relativeTo: item });
}

export { NAUREN_QUERY_REACAO_PRE_ATAQUE, NAUREN_QUERY_REGISTRO_PRIORIDADE, NAUREN_TOKENS_CONTEXTO, naurenAgindoForaDoTurno, naurenConsumirUsoDaHabilidade, naurenContarAcumulos, naurenDescricaoParaChat, naurenDispararEventoNoDono, naurenFontesDeModificadores, naurenHandleQueryAplicarCondicao, naurenHandleQueryDispararEvento, naurenHandleQueryReacaoPreAtaque, naurenHandleQueryRegistroPrioridade, naurenMapearStrings, naurenModificacoesRecebidas, naurenMontarDescricao, naurenOperarRegistroPrioridade, naurenPrioridadesNoTurno, naurenRegistroPrioridades, naurenResumoModificador, naurenRotuloCampoModificado, naurenSubstituirTokensDeContexto, naurenUsoDisponivel };
