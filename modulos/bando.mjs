/* Nauren RPG — Bando de lacaios. Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { naurenMedirDistanciaBordas, naurenPostarCard } from "../nauren.mjs";
import { naurenMestreDaMesa } from "./relogio-combate.mjs";
import { naurenRegistroPrioridades } from "./prioridades.mjs";
import { naurenEhItem, naurenPreparacaoUsadas } from "./entidades-campo.mjs";


/* =====================================================================
 * 0.93.0: BANDO (lacaios que agem juntos - opcional, autoral)
 * Um NPC com "Bando" ligado (flags.nauren.bando.ativo) vira um grupo quando
 * há vários tokens NÃO vinculados dele na mesma cena:
 *  - cada token tem Vida e Condições próprias;
 *  - a Estamina é uma só (gastar em qualquer um desconta de todos);
 *  - um combatente só no combate (uma iniciativa, um turno);
 *  - 1 Prioridade por turno: o Bando dá 1 a cada alvo e recebe 1 no total;
 *  - lacaio não reage (sem Bloquear, Esquivar, Contra-Atacar nem Estresse);
 *  - fórmulas @bandoNoAlcance, @bandoVivos, @bandoMembros e @bandoDados(XdY).
 * Sem o Bando ligado, nada disso roda.
 * ===================================================================== */
const NAUREN_BANDO_PADRAO = { ativo: false, membros: 0, estaminaFormula: "@estamina", bonusPorLacaio: 1 };
 // bonusPorLacaio (0.94.23): @bandoExtra

/** Configuração do Bando de um Ator (ou do Ator de um token). */
function naurenBandoCfg(actor) {
  const c = actor?.getFlag?.("nauren", "bando");
  return c?.ativo ? { ...NAUREN_BANDO_PADRAO, ...c } : null;
}

/** Id do Bando de um token (só token não vinculado de um Ator com Bando ligado). */
function naurenBandoIdDoToken(tokenDoc) {
  if (!tokenDoc || tokenDoc.actorLink) return null;
  const proprio = tokenDoc.getFlag?.("nauren", "bandoId");
  if (proprio) return proprio;
  const base = game.actors?.get(tokenDoc.actorId);
  return naurenBandoCfg(base) ? tokenDoc.actorId : null;
}

/** Token (documento) de um Ator sintético. */
function naurenTokenDocDoAtor(actor) {
  return actor?.isToken ? actor.token : null;
}

/** Chave única do Bando (cena + id), ou null. */
function naurenBandoChave(actorOuToken) {
  const td = actorOuToken?.documentName === "Token" ? actorOuToken : (actorOuToken?.document?.documentName === "Token" ? actorOuToken.document : naurenTokenDocDoAtor(actorOuToken));
  const id = naurenBandoIdDoToken(td);
  return id ? `${td.parent?.id ?? "?"}:${id}` : null;
}

/** Tokens (documentos) do mesmo Bando na cena. vivos=true: só com Vida > 0. */
function naurenBandoMembros(actorOuToken, { vivos = true } = {}) {
  const chave = naurenBandoChave(actorOuToken);
  if (!chave) return [];
  const td = actorOuToken?.documentName === "Token" ? actorOuToken : (actorOuToken?.document?.documentName === "Token" ? actorOuToken.document : naurenTokenDocDoAtor(actorOuToken));
  const cena = td?.parent;
  return (cena?.tokens?.contents ?? []).filter(t => naurenBandoChave(t) === chave && (!vivos || (t.actor?.system?.vida?.value ?? 0) > 0));
}

/** Os dois Atores estão no mesmo Bando? */
function naurenMesmoBando(a, b) {
  const ca = naurenBandoChave(a);
  return !!ca && ca === naurenBandoChave(b);
}

/** O Ator (ou alguém do Bando dele) é este combatente? */
function naurenCombatenteEhDoAtor(cb, actor) {
  if (!cb || !actor) return false;
  if (cb.actor === actor || (cb.actor?.uuid && cb.actor.uuid === actor.uuid)) return true;
  return !!cb.token && naurenMesmoBando(cb.token, actor);
}

/** Atores que agem neste turno: os vivos do Bando, ou só o próprio. */
function naurenAtoresDoTurno(actor) {
  if (!actor) return [];
  const membros = naurenBandoMembros(actor);
  return membros.length ? membros.map(t => t.actor).filter(Boolean) : [actor];
}

/** Quantos do Bando (vivos) têm o alvo dentro do alcance (em metros) da Ação. */
function naurenBandoNoAlcance(actor, alvoToken, alcanceM) {
  const membros = naurenBandoMembros(actor);
  if (!membros.length) return 1;
  if (!alvoToken || !Number.isFinite(alcanceM)) return membros.length;
  return Math.max(1, membros.filter(t => t.object && naurenMedirDistanciaBordas(t.object, alvoToken) <= alcanceM + 0.01).length);
}

/** Alcance da Ação em metros ("1m", "9m", "pessoal" = 1). */
function naurenAlcanceEmMetros(acao) {
  const txt = String(acao?.alcance ?? "").toLowerCase();
  const n = parseFloat(txt.replace(",", "."));
  if (Number.isFinite(n)) return n + (Number(acao?.alcanceBonusTotal) || 0);
  return /pessoal|toque|corpo/.test(txt) || !txt ? 1 : NaN;
}

/** Multiplica a quantidade de dados: "2d8" com 3 → "6d8". */
function naurenBandoDados(expr, k) {
  return String(expr).replace(/(\d*)d(\d+)/gi, (m, n, f) => `${(Number(n) || 1) * k}d${f}`);
}


/** Conta simples com números, + - * / ( ) e floor/ceil/round/min/max (sem depender do Roll). */
function naurenAvaliarConta(f) {
  const txt = String(f ?? "").trim();
  if (!/^[\d\s+\-*/().,]*$/.test(txt.replace(/\b(floor|ceil|round|min|max|abs)\b/g, ""))) throw new Error(`conta inválida: ${txt}`);
  return Function("floor", "ceil", "round", "min", "max", "abs", `"use strict"; return (${txt});`)(Math.floor, Math.ceil, Math.round, Math.min, Math.max, Math.abs);
}

/** Estamina do Bando: fórmula da configuração com @estamina (a de 1 ficha), @membros (vivos) e @membrosIniciais. */
async function naurenBandoRecalcular(actorOuToken) {
  if (naurenMestreDaMesa?.() !== game.user) return;
  const todos = naurenBandoMembros(actorOuToken, { vivos: false });
  if (!todos.length) return;
  const vivos = todos.filter(t => (t.actor?.system?.vida?.value ?? 0) > 0);
  const cfg = naurenBandoCfg(todos[0].actor) ?? NAUREN_BANDO_PADRAO;
  const base = todos[0].actor?._naurenEstaminaBase ?? todos[0].actor?.system?.estaminaCombate?.max ?? 0;
  const iniciais = Number(cfg.membros) > 0 ? Number(cfg.membros) : todos.length;
  let max = base;
  try {
    const f = String(cfg.estaminaFormula || "@estamina").replace(/@membrosIniciais\b/g, iniciais).replace(/@membros\b/g, vivos.length).replace(/@estamina\b/g, base);
    max = Math.max(0, Math.floor(naurenAvaliarConta(f)));
  } catch (err) { console.warn("Nauren RPG | Bando: fórmula de Estamina inválida", cfg.estaminaFormula, err); }
  const valorAtual = Math.min(max, Math.max(...todos.map(t => t.actor?.system?.estaminaCombate?.value ?? 0)));
  for (const t of todos) {
    const a = t.actor; if (!a) continue;
    const upd = {};
    if (a.getFlag("nauren", "bandoEstaminaMax") !== max) upd["flags.nauren.bandoEstaminaMax"] = max;
    if ((a.system.estaminaCombate?.value ?? 0) !== valorAtual) upd["system.estaminaCombate.value"] = valorAtual;
    if (Object.keys(upd).length) await a.update(upd, { naurenBando: true }).catch(() => null);
  }
}


// Um combatente só por Bando (o primeiro token que entrar; os outros ficam fora da ordem).
const naurenBandoCombatentePendente = new Map();


/* ---- Prioridade do Bando: 1 por alvo por turno (dando) e 1 no total por turno (recebendo) ---- */
function naurenBandoPrioridadeBloqueada(entrada, combate = game.combat) {
  if (!combate?.started) return "";
  const lista = naurenRegistroPrioridades(combate).filter(e => e.rodada === combate.round && e.turno === combate.turn && !e.tomadaDe);
  if (entrada.deBando && lista.some(e => e.deBando === entrada.deBando && e.paraUuid === entrada.paraUuid)) return "já recebeu a Prioridade do Bando neste turno";
  if (entrada.paraBando && lista.some(e => e.paraBando === entrada.paraBando)) return "o Bando já recebeu 1 Prioridade neste turno";
  return "";
}


/* ---- 0.93.1: vários Bandos do mesmo NPC na mesma cena (Bando A, B, C...) ---- */
/** Letra do Bando do token ("" = grupo padrão do NPC). */
function naurenBandoLetra(tokenDoc) { return tokenDoc?.getFlag?.("nauren", "bandoLetra") ?? ""; }

/**
 * Junta os tokens selecionados (do mesmo NPC com Bando, não vinculados) num Bando novo, com a próxima letra livre
 * da cena. Se algum deles já está num combate, o Bando novo entra com o próprio combatente.
 */
async function naurenFormarBando(tokens = canvas?.tokens?.controlled ?? []) {
  const docs = tokens.map(t => t.document ?? t).filter(Boolean);
  if (docs.length < 1) return ui.notifications.warn("Selecione os tokens de lacaio que vão formar o Bando.");
  const base = game.actors.get(docs[0].actorId);
  if (!naurenBandoCfg(base)) return ui.notifications.warn(`${base?.name ?? "Este NPC"} não tem o Bando ligado (Editar Ficha → Opções → Bando de lacaios).`);
  if (docs.some(d => d.actorId !== docs[0].actorId)) return ui.notifications.warn("Um Bando só junta tokens do mesmo NPC.");
  if (docs.some(d => d.actorLink)) return ui.notifications.warn("Os tokens do Bando precisam ser não vinculados (cada lacaio com a sua Vida).");
  const cena = docs[0].parent;
  const usadas = new Set((cena?.tokens?.contents ?? []).filter(t => t.actorId === docs[0].actorId && !docs.includes(t)).map(t => naurenBandoLetra(t)).filter(Boolean));
  const letra = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").find(l => !usadas.has(l)) ?? String(usadas.size + 1);
  const antigas = new Set(docs.map(d => naurenBandoChave(d)));
  // O nome do token ganha a letra (Goblin A), para o Mestre e os jogadores saberem de que grupo é cada um.
  const nomeBase = n => String(n ?? "").replace(/ [A-Z]$/, "");
  for (const d of docs) await d.update({ "flags.nauren.bandoId": `${d.actorId}-${letra}`, "flags.nauren.bandoLetra": letra, name: `${nomeBase(d.name) || base.name} ${letra}` });
  await naurenBandoRecalcular(docs[0]).catch(() => null);
  // Grupos de onde eles saíram também recalculam a Estamina.
  for (const t of cena?.tokens?.contents ?? []) { const ch = naurenBandoChave(t); if (antigas.has(ch)) { await naurenBandoRecalcular(t).catch(() => null); antigas.delete(ch); } }
  // Combate: o combatente que era de um token que mudou de grupo passa para alguém que ficou; o Bando novo ganha o seu.
  const combate = game.combat;
  if (combate) {
    for (const cb of combate.combatants.contents ?? [...combate.combatants]) {
      if (!cb.token || !docs.includes(cb.token)) continue;
      const restante = (cena?.tokens?.contents ?? []).find(t => !docs.includes(t) && t.actorId === cb.token.actorId && naurenBandoIdDoToken(t) && (t.actor?.system?.vida?.value ?? 0) > 0);
      if (restante) await cb.update({ tokenId: restante.id, name: naurenBandoNomeCombatente(restante) }).catch(() => null);
      else await combate.deleteEmbeddedDocuments("Combatant", [cb.id]).catch(() => null);
    }
    if (combate.combatants.some(c => c.token && docs.some(d => naurenBandoChave(d) === naurenBandoChave(c.token)))) { /* já tem */ }
    else if (docs.some(d => d.inCombat) || combate.started) {
      const vivo = docs.find(d => (d.actor?.system?.vida?.value ?? 0) > 0) ?? docs[0];
      await combate.createEmbeddedDocuments("Combatant", [{ tokenId: vivo.id, sceneId: cena?.id, actorId: vivo.actorId, hidden: vivo.hidden }]).catch(() => null);
    }
  }
  await naurenBandoAtualizarNomesCombate().catch(() => null);
  naurenPostarCard({ ator: docs[0].actor, titulo: `Bando ${letra}`, icone: docs[0].texture?.src, fonte: "Bando de lacaios",
    linhas: [{ label: "Formado", value: `${docs.length} lacaio(s) de ${base.name}`, breakdown: "Estamina, iniciativa e Prioridade próprias deste grupo" }] });
  ui.notifications.info(`Bando ${letra}: ${docs.length} lacaio(s) de ${base.name}.`);
  return letra;
}

/** Nome do combatente: "Goblin (Bando A ×4)". */
function naurenBandoNomeCombatente(td) {
  const letra = naurenBandoLetra(td);
  const nome = letra ? String(td.name ?? "").replace(new RegExp(` ${letra}$`), "") : td.name;
  return `${nome} (Bando${letra ? ` ${letra}` : ""} ×${naurenBandoMembros(td).length})`;
}

/** Atualiza o nome dos combatentes de Bando (letra e quantos vivos). */
async function naurenBandoAtualizarNomesCombate(combate = game.combat) {
  if (!combate || naurenMestreDaMesa?.() !== game.user) return;
  for (const cb of [...combate.combatants]) {
    if (!cb.token || !naurenBandoChave(cb.token)) continue;
    const nome = naurenBandoNomeCombatente(cb.token);
    if (cb.name !== nome) await cb.update({ name: nome }).catch(() => null);
  }
}


/**
 * 0.93.2: a Ação sai sem Estamina agora? (para o HUD não apagar o botão). Mesmas regras da execução:
 * Preparação (N primeiras Ações da 1ª rodada) e Toxina Laminar (aplicar veneno na 1ª rodada, 1x por combate).
 */
function naurenEstaminaGratisAgora(actor, acao) {
  const c = game.combat;
  if (!actor || !acao || !c?.started || (c.round ?? 1) > 1) return "";
  const gratis = actor.items.filter(i => i.type === "habilidade" && i.system.ativo !== false && Number(i.system.acoesGratisPrimeiraRodada))
    .reduce((soma, i) => soma + Number(i.system.acoesGratisPrimeiraRodada) * Math.max(1, i.system.rankAtual || 1), 0);
  if (gratis > 0) {
    const marca = actor.getFlag("nauren", "preparacao") ?? {};
    const usadas = Math.max(marca.combate === c.id ? (marca.usadas ?? 0) : 0, naurenPreparacaoUsadas.get(`${actor.uuid}|${c.id}`) ?? 0);
    if (usadas < gratis) return `Preparação ${usadas + 1}/${gratis}`;
  }
  if (acao.aplicarVeneno && actor.getFlag("nauren", "toxinaLaminarCombate") !== c.id
    && actor.items.some(i => i.type === "habilidade" && i.system.ativo !== false && naurenEhItem(i, "Toxina Laminar"))) return "Toxina Laminar";
  return "";
}

/** Código que rodava solto neste trecho do nauren.mjs: chamado no mesmo ponto de antes. */
export function __naurenIniciar_bando() {


// Estamina compartilhada: quem mudou a Estamina de um lacaio copia o valor para o resto do Bando.
Hooks.on("updateActor", (actor, mudancas, opcoes, userId) => {
  if (userId !== game.user.id || opcoes?.naurenBando || !actor?.isToken) return;
  if (!naurenBandoChave(actor)) return;
  const v = foundry.utils.getProperty(mudancas, "system.estaminaCombate.value");
  if (v !== undefined) {
    for (const t of naurenBandoMembros(actor, { vivos: false })) {
      if (t.actor && t.actor !== actor && (t.actor.system?.estaminaCombate?.value ?? 0) !== v) t.actor.update({ "system.estaminaCombate.value": v }, { naurenBando: true }).catch(() => null);
    }
  }
  // Vida chegou a 0 (ou voltou): recalcula a Estamina do Bando e troca o token do combatente se ele caiu.
  if (foundry.utils.hasProperty(mudancas, "system.vida.value")) {
    naurenBandoRecalcular(actor).catch(() => null);
    setTimeout(() => naurenBandoAtualizarNomesCombate().catch(() => null), 200);
    const combate = game.combat;
    const td = naurenTokenDocDoAtor(actor);
    const cb = combate?.combatants?.find(c => c.tokenId === td?.id);
    if (cb && (actor.system?.vida?.value ?? 0) <= 0 && naurenMestreDaMesa?.() === game.user) {
      const outro = naurenBandoMembros(actor).find(t => t.id !== td.id);
      if (outro) cb.update({ tokenId: outro.id, name: naurenBandoNomeCombatente(outro) }).catch(() => null);
    }
  }
});

Hooks.on("createToken", (td) => { if (naurenBandoChave(td)) naurenBandoRecalcular(td).catch(() => null); });

Hooks.on("deleteToken", (td) => {
  const outro = (td.parent?.tokens?.contents ?? []).find(t => t.id !== td.id && naurenBandoIdDoToken(t) && naurenBandoIdDoToken(t) === naurenBandoIdDoToken(td));
  if (outro) naurenBandoRecalcular(outro).catch(() => null);
});


// 0.94.3 (G7): quem só age em Prioridade (Obra Prima, Obediência Cega) não entra na ordem de turnos.
Hooks.on("preCreateCombatant", (cb, dados) => {
  const td = cb.token ?? cb.parent?.scene?.tokens?.get?.(dados.tokenId) ?? canvas?.scene?.tokens?.get?.(dados.tokenId);
  const ator = td?.actor ?? cb.actor ?? null;
  if (!ator?.system?.soAgeEmPrioridade) return;
  ui.notifications?.info(`${ator.name} não entra na iniciativa: só age quando recebe uma Prioridade.`);
  return false;
});

Hooks.on("preCreateCombatant", (cb, dados) => {
  const td = cb.token ?? cb.parent?.scene?.tokens?.get?.(dados.tokenId) ?? canvas?.scene?.tokens?.get?.(dados.tokenId);
  const chave = naurenBandoChave(td);
  if (!chave) return;
  const combate = cb.parent;
  const ja = combate?.combatants?.some(c => c.token && naurenBandoChave(c.token) === chave);
  const pend = naurenBandoCombatentePendente.get(`${combate?.id}:${chave}`);
  if (ja || (pend && Date.now() - pend < 3000)) return false;
  naurenBandoCombatentePendente.set(`${combate?.id}:${chave}`, Date.now());
  cb.updateSource({ name: naurenBandoNomeCombatente(td) });
});

Hooks.on("createCombatant", (cb) => { const chave = naurenBandoChave(cb.token); if (chave) setTimeout(() => naurenBandoCombatentePendente.delete(`${cb.parent?.id}:${chave}`), 500); });

Hooks.on("getSceneControlButtons", (controls) => {
  if (!game.user.isGM) return;
  const tokens = controls?.tokens ?? controls?.find?.(c => c.name === "tokens");
  if (!tokens) return;
  const tool = { name: "naurenFormarBando", title: "Formar Bando com os lacaios selecionados (A, B, C...)", icon: "fas fa-people-group", button: true, visible: true,
    onChange: () => naurenFormarBando(), onClick: () => naurenFormarBando() };
  if (Array.isArray(tokens.tools)) tokens.tools.push(tool); else tokens.tools.naurenFormarBando = { ...tool, order: 101 };
});

// Token copiado/colado de um lacaio já num Bando (letra) entra no mesmo grupo; recalcula quando um token muda de grupo.
Hooks.on("updateToken", (td, mud) => { if (foundry.utils.hasProperty(mud, "flags.nauren.bandoId")) naurenBandoRecalcular(td).catch(() => null); });
}

export { NAUREN_BANDO_PADRAO, naurenAlcanceEmMetros, naurenAtoresDoTurno, naurenAvaliarConta, naurenBandoAtualizarNomesCombate, naurenBandoCfg, naurenBandoChave, naurenBandoCombatentePendente, naurenBandoDados, naurenBandoIdDoToken, naurenBandoLetra, naurenBandoMembros, naurenBandoNoAlcance, naurenBandoNomeCombatente, naurenBandoPrioridadeBloqueada, naurenBandoRecalcular, naurenCombatenteEhDoAtor, naurenEstaminaGratisAgora, naurenFormarBando, naurenMesmoBando, naurenTokenDocDoAtor };
