/* Nauren RPG — Registro de rolagens (auditoria). Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { naurenPostarCard } from "../nauren.mjs";


/**
 * Card azul auditável fora de uma Ação (gatilhos, efeitos, expirações,
 * ajustes manuais). Mesmo template dos cards de uso.
 *   linhas: [{ label, value, breakdown }]  - breakdown = dados/fórmula
 *   fonte:  texto curto de origem ("Gatilho • Início do meu turno")
 */
/* ============================================================
 * 0.94.19 — Registro de rolagens (auditoria)
 * Rolagens que decidem a ficha (os 5d6 dos atributos no Criador) são
 * feitas pela tela do MESTRE quando ele está conectado: o jogador pede, o
 * Mestre rola, posta o card (mensagem do Mestre, que o jogador não edita)
 * e anota em flags.nauren.registroRolagens (lista só de acréscimo).
 * Sem Mestre conectado, rola na tela do jogador e a entrada fica marcada
 * "sem testemunha". A ficha mostra tudo na aba Opções e o "Export Data"
 * leva o registro em curador.rolagens (lido pelo bot do Discord).
 * ============================================================ */
const NAUREN_QUERY_ROLAGEM_AUDITADA = "nauren.rolagemAuditada";

const NAUREN_REGISTRO_VERSAO = 1;

let naurenRegistroContador = 0;

function naurenMestreConectado() {
  return game.users?.activeGM ?? game.users?.find(u => u.isGM && u.active) ?? null;
}

const NAUREN_REGISTRO_TIPOS = {
  atributos: "Atributos (5d6)", distribuicao: "Atributos distribuídos", modo: "Modo dos atributos", reset: "Ficha resetada no Criador"
};

/**
 * Pede uma rolagem auditada. pedido = { tipo, rotulo, formula?, indices?, dados? }.
 * Devolve { ok, resultados, total, entrada }.
 */
async function naurenRolagemAuditada(actor, pedido) {
  if (!actor) return { ok: false };
  const gm = naurenMestreConectado();
  if (gm && gm.id !== game.user.id) {
    try {
      const r = await gm.query(NAUREN_QUERY_ROLAGEM_AUDITADA, { actorUuid: actor.uuid, pedido, pedidoPor: game.user.id }, { timeout: 30000 });
      if (r?.ok) return r;
    } catch (err) { console.warn("Nauren RPG | Registro de rolagens: o Mestre não respondeu, rolando aqui.", err); }
  }
  return naurenExecutarRolagemAuditada(actor, pedido, game.user.id);
}

async function naurenHandleQueryRolagemAuditada({ actorUuid, pedido, pedidoPor } = {}) {
  const actor = await fromUuid(actorUuid).catch(() => null);
  if (!actor) return { ok: false };
  return naurenExecutarRolagemAuditada(actor, pedido ?? {}, pedidoPor);
}

async function naurenExecutarRolagemAuditada(actor, pedido, pedidoPor) {
  const solicitante = game.users.get(pedidoPor) ?? game.user;
  const testemunha = game.user.isGM ? "mestre" : "jogador";
  let roll = null, resultados = [], total = null;
  if (pedido.formula) {
    roll = await new Roll(String(pedido.formula)).evaluate();
    resultados = roll.dice.flatMap(d => d.results.filter(r => r.active !== false).map(r => r.result));
    total = roll.total;
    if (game.dice3d) game.dice3d.showForRoll(roll, solicitante, true).catch?.(() => {});
  }
  const registro = foundry.utils.deepClone(actor.getFlag("nauren", "registroRolagens") ?? []);
  const n = registro.length + 1;
  const entrada = {
    n, id: `${Date.now().toString(36)}-${n}-${++naurenRegistroContador}`,
    tipo: pedido.tipo ?? "outro", rotulo: pedido.rotulo ?? NAUREN_REGISTRO_TIPOS[pedido.tipo] ?? "Rolagem",
    formula: pedido.formula ?? null, resultados, total, indices: pedido.indices ?? null, dados: pedido.dados ?? null,
    quando: new Date().toISOString(), pedidoPor: solicitante.id, pedidoPorNome: solicitante.name,
    registradoPor: game.user.id, registradoPorNome: game.user.name, testemunha, mensagemId: null,
    versaoSistema: game.system?.version ?? null
  };
  const linhas = [];
  if (pedido.formula) {
    linhas.push({ label: "Resultado", value: resultados.join(", "), breakdown: `${pedido.formula}${pedido.indices?.length ? ` · dado(s) ${pedido.indices.map(i => i + 1).join(", ")}` : ""}` });
  }
  for (const l of pedido.linhas ?? []) linhas.push(l);
  linhas.push({ label: "Registro", value: `#${n}`, breakdown: testemunha === "mestre" ? `rolado pela tela do Mestre (${game.user.name}) a pedido de ${solicitante.name}` : `sem Mestre conectado: rolado na tela de ${solicitante.name}` });
  let msg = null;
  try {
    msg = await naurenPostarCard({ ator: actor, titulo: entrada.rotulo, icone: "icons/sundries/gaming/dice-runed-tan.webp", fonte: "Registro de rolagens",
      linhas, flags: { registroRolagem: { actorUuid: actor.uuid, entradaId: entrada.id, n, tipo: entrada.tipo, resultados, total, testemunha } } });
  } catch (err) { console.warn("Nauren RPG | Registro de rolagens: card", err); }
  entrada.mensagemId = msg?.id ?? null;
  registro.push(entrada);
  await actor.update({ "flags.nauren.registroRolagens": registro }, { naurenRegistroRolagens: true });
  return { ok: true, resultados, total, entrada };
}

/** Só acrescenta (sem rolar): distribuição final, troca de modo, reset. */
async function naurenAnotarNoRegistro(actor, pedido) {
  return naurenRolagemAuditada(actor, { ...pedido, formula: null });
}

/** Confere uma entrada com o card do chat (mensagem existe, foi do Mestre e tem os mesmos números). */
function naurenConferirEntradaRegistro(actor, e) {
  if (!e?.mensagemId) return { estado: "semCard", texto: "sem card" };
  const m = game.messages?.get(e.mensagemId);
  if (!m) return { estado: "semCard", texto: "card fora do chat (chat limpo?)" };
  const f = m.getFlag?.("nauren", "registroRolagem");
  const autorGM = !!(m.author ?? m.user)?.isGM;
  const bate = f && f.entradaId === e.id && f.actorUuid === actor.uuid && JSON.stringify(f.resultados ?? []) === JSON.stringify(e.resultados ?? []);
  if (!bate) return { estado: "diverge", texto: "não confere com o card" };
  if (e.testemunha === "mestre" && !autorGM) return { estado: "diverge", texto: "card não é do Mestre" };
  return { estado: "ok", texto: "confere com o card" };
}

/** Visão do registro para a ficha (mais novo primeiro). */
function naurenRegistroParaFicha(actor) {
  const reg = actor?.getFlag?.("nauren", "registroRolagens") ?? [];
  return [...reg].reverse().map(e => {
    const c = naurenConferirEntradaRegistro(actor, e);
    let quando = e.quando;
    try { quando = new Date(e.quando).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }); } catch (err) { /* texto cru */ }
    const detalhe = e.formula ? (e.resultados ?? []).join(", ")
      : e.tipo === "distribuicao" ? Object.entries(e.dados?.atributos ?? {}).map(([k, v]) => `${NAUREN_NOMES_ATRIBUTO_CURTO[k] ?? k} ${v}`).join(" · ")
      : e.tipo === "modo" ? (e.dados?.modo === "fixo" ? "valores fixos" : e.dados?.modo === "rolar" ? "rolar 5d6" : String(e.dados?.modo ?? ""))
      : e.tipo === "reset" ? (e.dados?.dadosApagados?.length ? `dados apagados: ${e.dados.dadosApagados.join(", ")}` : "")
      : "";
    return { ...e, quandoTexto: quando, detalhe, conferencia: c.texto, conferenciaOk: c.estado === "ok", conferenciaRuim: c.estado === "diverge",
      semTestemunha: e.testemunha !== "mestre",
      batePool: e.tipo === "distribuicao" ? e.dados?.bateComDados : null };
  });
}

const NAUREN_NOMES_ATRIBUTO_CURTO = { forca: "For", agilidade: "Agi", estamina: "Est", inteligencia: "Int", destino: "Des" };

/** Bloco do export (lido pelo bot): o registro inteiro + um resumo pronto. */
function naurenRegistroParaExport(actor) {
  const reg = actor?.getFlag?.("nauren", "registroRolagens") ?? [];
  const rolagensAtr = reg.filter(e => e.tipo === "atributos");
  // os 5 dados valendo agora = os rolados depois do último reset
  const ultimoReset = Math.max(0, ...reg.filter(e => e.tipo === "reset").map(e => e.n));
  const dadosAtuais = [null, null, null, null, null];
  for (const e of rolagensAtr.filter(e => e.n > ultimoReset)) (e.indices ?? []).forEach((i, k) => { if (i >= 0 && i < 5) dadosAtuais[i] = e.resultados?.[k] ?? null; });
  const distrib = [...reg].reverse().find(e => e.tipo === "distribuicao") ?? null;
  return {
    versao: NAUREN_REGISTRO_VERSAO,
    entradas: reg.map(e => ({ ...e, conferencia: naurenConferirEntradaRegistro(actor, e).estado })),
    resumo: {
      dadosAtributos: dadosAtuais,
      somaDados: dadosAtuais.every(v => Number.isFinite(v)) ? dadosAtuais.reduce((t, v) => t + v, 0) : null,
      vezesQueRolouAtributos: rolagensAtr.length,
      resets: reg.filter(e => e.tipo === "reset").length,
      semTestemunha: reg.filter(e => e.formula && e.testemunha !== "mestre").length,
      modoFinal: [...reg].reverse().find(e => e.tipo === "modo")?.dados?.modo ?? null,
      distribuicao: distrib ? { n: distrib.n, quando: distrib.quando, atributos: distrib.dados?.atributos ?? null, bateComDados: distrib.dados?.bateComDados ?? null } : null,
      atributosBaseAgora: Object.fromEntries(["forca", "agilidade", "estamina", "inteligencia", "destino"].map(k => [k, actor.system?.atributos?.[k]?.value ?? null]))
    }
  };
}

/** Código que rodava solto neste trecho do nauren.mjs: chamado no mesmo ponto de antes. */
export function __naurenIniciar_registro_rolagens() {

// O registro não muda pela mão do jogador (só pelo caminho acima). O card do Mestre continua valendo como prova.
Hooks.on("preUpdateActor", (actor, changes, options) => {
  if (options?.naurenRegistroRolagens || game.user.isGM) return;
  const chaves = Object.keys(foundry.utils.flattenObject(changes ?? {}));
  if (chaves.some(k => k.includes("registroRolagens")) || ("flags" in (changes ?? {}) && changes.flags?.nauren === null)) {
    ui.notifications?.warn("O registro de rolagens da ficha só muda pelas rolagens do sistema.");
    return false;
  }
});
}

export { NAUREN_NOMES_ATRIBUTO_CURTO, NAUREN_QUERY_ROLAGEM_AUDITADA, NAUREN_REGISTRO_TIPOS, NAUREN_REGISTRO_VERSAO, naurenAnotarNoRegistro, naurenConferirEntradaRegistro, naurenExecutarRolagemAuditada, naurenHandleQueryRolagemAuditada, naurenMestreConectado, naurenRegistroContador, naurenRegistroParaExport, naurenRegistroParaFicha, naurenRolagemAuditada };
