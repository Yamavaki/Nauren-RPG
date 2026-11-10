/* Nauren RPG — Resumo do cartão para o Nauren no Discord. Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { naurenAplicarCuraManual, naurenAplicarDanoManual, naurenDisposicaoDoAtor, naurenPostarCard, naurenRecuperarRecursoManual } from "../nauren.mjs";
import { NAUREN_QUERY_RESISTIR_ROUBO, naurenEhItem, naurenGuardarD20Roubado, naurenHandleQueryResistirRoubo, naurenLadinosTudoEMeu, naurenNomeDeToken } from "./entidades-campo.mjs";
import { naurenConsumirUsoDaHabilidade, naurenDescricaoParaChat, naurenDispararEventoNoDono, naurenOperarRegistroPrioridade, naurenPrioridadesNoTurno, naurenRegistroPrioridades, naurenUsoDisponivel } from "./prioridades.mjs";
import { NaurenAlvoHelper } from "./ficha-ator.mjs";
import { naurenMotionEmTodos } from "./animacoes.mjs";
import { naurenProcessarGatilhos } from "./icone-condicao-token.mjs";
import { naurenTravaPrioridade } from "./monstros-regras.mjs";
import { naurenBandoChave, naurenBandoPrioridadeBloqueada } from "./bando.mjs";
import { naurenMovimentoSaldo } from "./movimento.mjs";
import { NAUREN_TIPOS_ENTREGAVEIS, naurenOferecerItem } from "./entrega-itens.mjs";


/* ============================================================
 * 0.94.18 — Resumo do cartão (para o módulo "Nauren no Discord")
 * Todo cartão do sistema ganha flags.nauren.resumo: só o que importa
 * (título, dados, dano, cura, alvos, efeitos, Prioridade), SEM as
 * descrições. Fica aqui, ao lado do roll-card.hbs: se o visual do
 * cartão mudar, este leitor muda junto e o módulo não quebra.
 * ============================================================ */
function naurenResumoDoCartao(html) {
  if (typeof html !== "string" || !html.includes("nauren-")) return null;
  const doc = new DOMParser().parseFromString(`<div id="r">${html}</div>`, "text/html");
  const raiz = doc.getElementById("r");
  const txt = el => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
  const curto = (s, n = 300) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  const card = raiz.querySelector(".nauren-roll-card");
  if (card) {
    const head = card.querySelector(".nrc-toggle");
    const atorEl = head?.querySelector(".nrc-actor");
    const ator = atorEl ? Array.from(atorEl.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join(" ").replace(/\s+/g, " ").trim() : "";
    const lerDados = el => Array.from(el.querySelectorAll(":scope > .nrc-dice-row > .nrc-die-box")).map(b => ({
      rotulo: txt(b.querySelector(".nrc-die-label")),
      total: txt(b.querySelector(".nrc-die-total")),
      crit: b.classList.contains("nrc-crit"),
      desastre: b.classList.contains("nrc-fumble"),
      descartado: b.classList.contains("nrc-unused")
    }));
    const lerLinhas = el => Array.from(el.querySelectorAll(":scope > .nrc-secondary > .nrc-secondary-line")).map(l => {
      const valEl = l.querySelector(".nrc-sec-value");
      const formula = txt(valEl?.querySelector(".nrc-sec-breakdown")).replace(/^\(|\)$/g, "");
      const copia = valEl?.cloneNode(true);
      copia?.querySelector(".nrc-sec-breakdown")?.remove();
      return { rotulo: txt(l.querySelector(".nrc-sec-label")), valor: curto(txt(copia)), formula: curto(formula, 80) };
    }).filter(l => l.rotulo || l.valor);
    const alvos = Array.from(card.querySelectorAll(":scope > .nrc-resultado-alvos > .nrc-res-alvo")).map(a => {
      let nome = txt(a.querySelector(".nrc-res-nome"));
      const acertou = nome.endsWith("✓") ? true : nome.endsWith("✗") ? false : null;
      nome = nome.replace(/\s*[✓✗]$/, "");
      const lista = a.querySelectorAll(".nrc-res-lista > span");
      const texto = lista.length ? Array.from(lista).map(txt) : txt(a.querySelector(".nrc-res-texto")).split(" • ");
      return { nome, acertou, texto: texto.map(t => curto(t, 200)).filter(Boolean) };
    });
    const extras = Array.from(card.querySelectorAll(":scope > .nrc-extra")).map(x => ({
      titulo: txt(x.querySelector(".nrc-extra-label")), dados: lerDados(x), linhas: lerLinhas(x)
    }));
    const prioEl = card.querySelector(":scope > .nrc-prioridade");
    let prioridade = "";
    if (prioEl) {
      const sum = prioEl.querySelector("summary")?.cloneNode(true);
      sum?.querySelector(".nrc-prio-contador")?.remove();
      prioridade = txt(sum) || txt(prioEl.querySelector(".nrc-prio-texto"));
    }
    const fonte = txt(head?.querySelector(".nrc-fonte"));
    return {
      v: 1,
      tipo: card.querySelector(":scope > .nrc-description-direta") ? "descricao" : "cartao",
      titulo: txt(head?.querySelector(".nrc-title")),
      ator, fonte,
      custo: txt(head?.querySelector(".nrc-custo-visivel")),
      icone: head?.querySelector(".nrc-icon")?.getAttribute("src") ?? "",
      sigla: txt(head?.querySelector(".nrc-prio-sigla")),
      aguardando: fonte === "Aguardando reação",
      dados: lerDados(card),
      linhas: lerLinhas(card),
      alvos, extras, prioridade
    };
  }
  const deflexao = raiz.querySelector(".nauren-deflexao-card");
  if (deflexao) return { v: 1, tipo: "destaque", titulo: txt(deflexao.querySelector(".nauren-deflexao-titulo")), texto: curto(txt(deflexao.querySelector(".nauren-deflexao-texto")), 600) };
  const aviso = raiz.querySelector(".nauren-aviso-chat");
  if (aviso) return { v: 1, tipo: "aviso", texto: curto(txt(aviso), 600) };
  return null;
}


/** Tomar uma Prioridade concedida pelo card (ex.: Oportunismo). */
async function naurenTomarPrioridadePeloCard(message, { ladraoUuid, itemId, paraUuid }) {
  const ladrao = await fromUuid(ladraoUuid).catch(() => null);
  const item = ladrao?.items?.get(itemId);
  if (!item) return;
  if (!naurenUsoDisponivel(item)) { ui.notifications.warn(`"${item.name}" está sem usos.`); return; }
  // Oportunista ao Extremo: roubando de um INIMIGO, ele pode resistir pagando Estamina (1 × rank).
  const vitimaDoc = await fromUuid(paraUuid).catch(() => null);
  const vitimaAtor = vitimaDoc?.actor ?? vitimaDoc;
  const extremo = ladrao.items.find(o => o.type === "habilidade" && naurenEhItem(o, "Oportunista ao Extremo") && o.system.ativo !== false);
  if (extremo && vitimaAtor && naurenDisposicaoDoAtor(vitimaAtor) !== naurenDisposicaoDoAtor(ladrao)) {
    const custo = Math.max(1, extremo.system.rankAtual || 1);
    const executor = NaurenAlvoHelper.usuarioExecutor(vitimaAtor) ?? game.users.activeGM;
    const dadosR = { vitimaUuid: vitimaAtor.uuid, custo, ladraoNome: ladrao.name };
    const resistiu = executor?.id === game.user.id ? await naurenHandleQueryResistirRoubo(dadosR) : await executor?.query(NAUREN_QUERY_RESISTIR_ROUBO, dadosR, { timeout: 30000 }).catch(() => false);
    if (resistiu) {
      naurenPostarCard({ ator: ladrao, titulo: item.name, icone: item.img, fonte: "Prioridade", linhas: [{ label: "Roubo impedido", value: `${vitimaAtor.name} gastou ${custo} Estamina`, breakdown: "Oportunista ao Extremo" }] });
      return;
    }
  }
  const tomada = await naurenOperarRegistroPrioridade("tomar", { paraUuid, ladraoUuid, ladraoNome: ladrao.name });
  if (!tomada) { ui.notifications.warn("Essa Prioridade já foi usada ou é de outro turno."); return; }
  const uso = await naurenConsumirUsoDaHabilidade(item);
  const vitima = await fromUuid(paraUuid).catch(() => null);
  naurenPostarCard({
    ator: ladrao, titulo: item.name, icone: item.img, fonte: "Prioridade tomada",
    linhas: [
      { label: "Tomou a Prioridade de", value: tomada.paraNome, breakdown: tomada.deNome ? `concedida por ${tomada.deNome}` : "" },
      uso.texto ? { label: "Custo", value: uso.texto } : null
    ].filter(Boolean),
    descricao: await naurenDescricaoParaChat(item)
  });
  { const tokL = ladrao.isToken ? ladrao.token : ladrao.getActiveTokens?.(true)?.[0]?.document; if (tokL) naurenMotionEmTodos("prioridade", { token: tokL.uuid }); }
  await naurenProcessarGatilhos("recebeuPrioridade", ladrao, { motivo: "tomada", itemNome: item.name }).catch(() => {});
  await naurenProcessarGatilhos("euRoubeiPrioridade", ladrao, { vitimaUuid: paraUuid, itemNome: item.name }).catch(() => {});
  if (vitima) await naurenDispararEventoNoDono(vitima, "minhaPrioridadeFoiRoubada", { ladraoUuid, itemNome: item.name });
}


/**
 * Conclui o painel de Prioridade de um card: concede a cada personagem
 * escolhido (evento "recebeuPrioridade" no cliente do dono) e redesenha o
 * card com o resultado. Lista vazia = nenhuma Prioridade concedida.
 */
async function naurenConcederPrioridadePeloCard(message, uuids = []) {
  const dados = foundry.utils.deepClone(message.getFlag("nauren", "cardData") ?? null);
  const prio = dados?.prioridade;
  if (!prio?.selecao) return;
  const limite = prio.selecao.limite || 0;
  const escolhidos = limite ? uuids.slice(0, limite) : uuids;
  const nomes = [];
  const avisos = [];
  const entradas = [];
  const regraLimite = game.settings.get("nauren", "limitePrioridadePorAliado");
  const poucosNoCombate = (game.combat?.combatants?.size ?? 0) <= 3;
  const origemUuid = prio.contexto?.origemAtorUuid ?? "";
  const origemAtor = origemUuid ? await fromUuid(origemUuid).catch(() => null) : null;
  for (const uuid of escolhidos) {
    const tokenDoc = await fromUuid(uuid).catch(() => null);
    if (!tokenDoc?.actor) continue;
    const nome = naurenNomeDeToken(tokenDoc);
    // Livro: no máximo 2 Prioridades do mesmo aliado por turno (vale entre aliados).
    const mesmoLado = !!origemAtor && tokenDoc.disposition === naurenDisposicaoDoAtor(origemAtor);
    if (mesmoLado && prio.contexto?.indicador !== "PI" && regraLimite !== "ignorar" && !poucosNoCombate && naurenPrioridadesNoTurno(origemUuid, tokenDoc.actor.uuid) >= 2) {
      if (regraLimite === "aplicar") {
        console.log(`Nauren RPG | Limite de Prioridade: ${nome} já recebeu 2 de ${origemAtor?.name} neste turno (rodada ${game.combat?.round}, turno ${game.combat?.turn}).`, naurenRegistroPrioridades().filter(e => e.deUuid === origemUuid && e.paraUuid === tokenDoc.actor.uuid));
        avisos.push(`${nome} já recebeu 2 Prioridades suas neste turno`); continue;
      }
      avisos.push(`${nome} passou do limite de 2 neste turno`);
    }
    // Fase 5 (M11): Condição que impede receber Prioridade (de aliados ou de todos) - o card diz por quê.
    const travaP = naurenTravaPrioridade(tokenDoc.actor, mesmoLado);
    if (travaP) { avisos.push(`${nome} não pode receber Prioridade${travaP.system.naoRecebePrioridade === "aliados" ? " de aliados" : ""} (${travaP.name})`); continue; }
    // Bando (0.93): o Bando dá 1 Prioridade a cada alvo por turno e recebe 1 no total por turno.
    const deBando = origemAtor ? naurenBandoChave(origemAtor) : null, paraBando = naurenBandoChave(tokenDoc);
    const motivoBando = naurenBandoPrioridadeBloqueada({ deBando, paraBando, paraUuid: tokenDoc.actor.uuid })
      || ((deBando && entradas.some(e => e.deBando === deBando && e.paraUuid === tokenDoc.actor.uuid)) ? "já recebeu a Prioridade do Bando neste turno" : "")
      || ((paraBando && entradas.some(e => e.paraBando === paraBando)) ? "o Bando já recebeu 1 Prioridade neste turno" : "");
    if (motivoBando) { avisos.push(`${nome}: ${motivoBando}`); continue; }
    naurenMovimentoSaldo.delete(tokenDoc.actor.uuid);
    // 0.94.11: quem já reagiu a este atacante usou essa Prioridade na reação (o evento já rodou lá).
    const reagiu = tokenDoc.actor.getFlag("nauren", "prioridadeNaReacao");
    if (reagiu && (!reagiu.de || reagiu.de === origemUuid) && Date.now() - (reagiu.quando ?? 0) < 180000) await tokenDoc.actor.unsetFlag("nauren", "prioridadeNaReacao").catch(() => {});
    else { naurenMotionEmTodos("prioridade", { token: tokenDoc.uuid }); await naurenDispararEventoNoDono(tokenDoc.actor, "recebeuPrioridade", prio.contexto ?? {}); }
    nomes.push(nome);
    entradas.push({ deLado: origemAtor ? naurenDisposicaoDoAtor(origemAtor) : null, paraLado: tokenDoc.disposition, deUuid: origemUuid, deNome: origemAtor?.name ?? "", paraUuid: tokenDoc.actor.uuid, paraNome: nome, motivo: prio.contexto?.motivo ?? "", item: prio.contexto?.itemNome ?? "", indicador: prio.contexto?.indicador ?? "", ...(deBando ? { deBando } : {}), ...(paraBando ? { paraBando } : {}) });
  }
  // Ataque Combinado: escolher um aliado de quem atacou gasta 1 uso.
  if (prio.selecao?.transferirItemId && origemAtor) {
    const dispOrigem = naurenDisposicaoDoAtor(origemAtor);
    let algumAliado = false;
    for (const uuid of escolhidos) {
      const doc = await fromUuid(uuid).catch(() => null);
      if (doc && doc.disposition === dispOrigem && doc.actor !== origemAtor) algumAliado = true;
    }
    const itemTransferir = origemAtor.items.get(prio.selecao.transferirItemId);
    if (algumAliado && itemTransferir) {
      const uso = await naurenConsumirUsoDaHabilidade(itemTransferir);
      if (uso.ok) avisos.push(`${itemTransferir.name}: ${uso.texto}`);
    }
  }
  if (entradas.length) await naurenOperarRegistroPrioridade("registrar", { entradas });
  // Quem foi bloqueado pelo limite não fecha o painel: dá para escolher outro.
  const bloqueados = regraLimite === "aplicar" ? avisos.filter(a => a.includes("já recebeu 2")) : [];
  const jaConcedidos = [...(prio.concedidos ?? []), ...nomes];
  const restantes = limite ? limite - nomes.length : 0;
  if (bloqueados.length && (!limite || restantes > 0)) {
    const concedidosUuids = new Set(escolhidos);
    const candidatos = (prio.selecao.candidatos ?? [])
      .filter(c => !concedidosUuids.has(c.uuid) || bloqueados.some(b => b.startsWith(c.nome)))
      .map(c => ({ ...c, marcado: false, bloqueado: c.bloqueado || bloqueados.some(b => b.startsWith(c.nome)) }))
      .filter(c => !jaConcedidos.includes(c.nome));
    if (candidatos.some(c => !c.bloqueado)) {
      prio.concedidos = jaConcedidos;
      prio.selecao = { ...prio.selecao, candidatos, limite: restantes, aberta: true, rotuloContador: restantes ? `0/${restantes}` : "" };
      prio.texto = `${jaConcedidos.length ? `Prioridade para: ${jaConcedidos.join(", ")}. ` : ""}${bloqueados.join("; ")} — escolha outro${restantes ? ` (até ${restantes})` : ""}`;
      const contentParcial = await foundry.applications.handlebars.renderTemplate("systems/nauren/templates/chat/roll-card.hbs", dados);
      await message.update({ content: contentParcial, "flags.nauren.cardData": dados });
      return;
    }
  }
  // Nível 3: botões para quem pode tomar a Prioridade concedida.
  prio.tomar = [];
  for (const e of entradas) {
    const recebedor = await fromUuid(e.paraUuid).catch(() => null);
    const dispRecebedor = naurenDisposicaoDoAtor(recebedor);
    for (const t of canvas?.tokens?.placeables ?? []) {
      const ator = t.actor;
      if (!ator || ator.uuid === e.paraUuid) continue;
      const relacao = t.document.disposition === dispRecebedor ? "aliado" : "inimigo";
      for (const it of ator.items) {
        let modo = it.type === "habilidade" && it.system.ativo !== false ? it.system.tomaPrioridade : "";
        // Oportunista ao Extremo: o Oportunismo também rouba de inimigos.
        if (modo && ator.items.some(o => o.type === "habilidade" && naurenEhItem(o, "Oportunista ao Extremo") && o.system.ativo !== false)) modo = "qualquer";
        if (!modo || (modo !== "qualquer" && modo !== relacao) || !naurenUsoDisponivel(it)) continue;
        prio.tomar.push({ ladraoUuid: ator.uuid, ladraoNome: naurenNomeDeToken(t), itemId: it.id, itemNome: it.name, paraUuid: e.paraUuid, paraNome: e.paraNome });
      }
    }
  }
  prio.selecao = null;
  prio.texto = (jaConcedidos.length ? `Prioridade para: ${jaConcedidos.join(", ")}.` : "Nenhuma Prioridade concedida.") + (avisos.length ? ` (${avisos.join("; ")})` : "");
  // Fase 4: "Concedi Prioridade" em quem usou a Ação (uma vez por pessoa escolhida).
  const origem = prio.contexto?.origemAtorUuid ? await fromUuid(prio.contexto.origemAtorUuid).catch(() => null) : null;
  for (let k = 0; k < nomes.length && origem; k++) {
    await naurenDispararEventoNoDono(origem, "euConcediPrioridade", { itemNome: prio.contexto?.itemNome ?? "", motivo: prio.contexto?.motivo ?? "", paraUuid: entradas[k]?.paraUuid ?? "" });
  }
  const content = await foundry.applications.handlebars.renderTemplate("systems/nauren/templates/chat/roll-card.hbs", dados);
  await message.update({ content, "flags.nauren.cardData": dados });
}

/** Código que rodava solto neste trecho do nauren.mjs: chamado no mesmo ponto de antes. */
export function __naurenIniciar_discord_resumo() {

globalThis.naurenResumoDoCartao = naurenResumoDoCartao;


Hooks.on("preCreateChatMessage", (message, data) => {
  try {
    const resumo = naurenResumoDoCartao(data?.content ?? message.content);
    if (resumo) message.updateSource({ "flags.nauren.resumo": resumo });
  } catch (err) { console.warn("Nauren RPG | Falha ao montar o resumo do cartão.", err); }
});

Hooks.on("preUpdateChatMessage", (message, changes) => {
  if (typeof changes?.content !== "string") return;
  try {
    const resumo = naurenResumoDoCartao(changes.content);
    if (resumo || message.getFlag("nauren", "resumo")) foundry.utils.setProperty(changes, "flags.nauren.resumo", resumo);
  } catch (err) { console.warn("Nauren RPG | Falha ao atualizar o resumo do cartão.", err); }
});


Hooks.on("renderChatMessageHTML", (message, html) => {
  const linhasBotoes = html.querySelectorAll(".nrc-manual-row");
  if (!linhasBotoes.length) return;

  const casterUuid = message.getFlag("nauren", "casterUuid");
  const casterActor = casterUuid ? fromUuidSync(casterUuid) : null;
  const podeUsar = game.user.isGM || casterActor?.isOwner;
  if (!podeUsar) {
    linhasBotoes.forEach(el => el.remove());
    return;
  }

  // Delegação de clique nos 3 tipos de botão: dano/cura aplicam em quem
  // estiver SELECIONADO no mapa no momento do clique (não salvo com
  // antecedência - lido na hora, como pedido); recurso não precisa de
  // seleção nenhuma, reconhece o dono sozinho a partir do "casterUuid".
  html.querySelectorAll(".nrc-manual-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const tipo = btn.dataset.nrcAcao;
      const valor = Number(btn.dataset.nrcValor) || 0;
      if (tipo === "recurso") {
        if (!casterActor) { ui.notifications.warn("Não achei o Ator que usou esta Ação (pode ter sido apagado)."); return; }
        await naurenRecuperarRecursoManual(casterActor, btn.dataset.nrcRecurso, valor);
        return;
      }
      const tokensAlvo = canvas.tokens?.controlled ?? [];
      if (!tokensAlvo.length) { ui.notifications.warn("Selecione ao menos 1 token no mapa antes de clicar."); return; }
      for (const token of tokensAlvo) {
        if (!token.actor) continue;
        if (tipo === "dano") await naurenAplicarDanoManual(token.actor, valor);
        else if (tipo === "cura") await naurenAplicarCuraManual(token.actor, valor);
      }
    });
  });
});


/**
 * Card de uso: aplica a preferência de descrição (aberta/recolhida) de
 * quem está lendo, e liga os botões de Prioridade "aliado à escolha".
 */
Hooks.on("renderChatMessageHTML", (message, html) => {
  const aberta = game.settings.get("nauren", "descricaoChatAbertaV2");
  html.querySelectorAll("details.nrc-regra").forEach(d => { d.open = aberta; });

  // Cards de entidade das versões anteriores: a entidade agora é um token no mapa.
  html.querySelectorAll(".nrc-entidade").forEach(el => el.remove());
  // Tudo é Meu! (Ladino): botão para roubar o d20 deste card (só para o dono de um Ladino aliado com o uso livre).
  const faceTem = message.getFlag("nauren", "d20Face");
  const autorTem = faceTem ? fromUuidSync(message.getFlag("nauren", "casterUuid") ?? "", { strict: false }) : null;
  if (faceTem && autorTem && game.combat?.started) {
    for (const ladino of naurenLadinosTudoEMeu(autorTem)) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nrc-tudo-e-meu-btn";
      btn.innerHTML = `<i class="fa-solid fa-hand-holding"></i> Tudo é Meu!: roubar este d20 (${faceTem})${game.user.isGM ? ` — ${ladino.name}` : ""}`;
      btn.addEventListener("click", async ev => {
        ev.preventDefault(); ev.stopPropagation();
        btn.disabled = true;
        const ok = await naurenGuardarD20Roubado(ladino, faceTem, autorTem.name).catch(() => false);
        if (ok) document.querySelectorAll(`[data-message-id="${message.id}"] .nrc-tudo-e-meu-btn`).forEach(b => b.remove());
        else btn.disabled = false;
      });
      (html.querySelector(".message-content") ?? html).appendChild(btn);
    }
  }
  html.querySelectorAll(".nrc-prio-tomar-btn").forEach(btn => {
    const ladrao = fromUuidSync(btn.dataset.ladrao);
    if (!(game.user.isGM || ladrao?.isOwner)) { btn.remove(); return; }
    btn.addEventListener("click", ev => {
      ev.preventDefault(); ev.stopPropagation();
      btn.style.pointerEvents = "none";
      naurenTomarPrioridadePeloCard(message, { ladraoUuid: btn.dataset.ladrao, itemId: btn.dataset.item, paraUuid: btn.dataset.para })
        .catch(err => console.warn("Nauren RPG | Falha ao tomar Prioridade.", err));
    });
  });
  const paineis = html.querySelectorAll(".nrc-prio-selecao");
  if (!paineis.length) return;
  const casterUuid = message.getFlag("nauren", "casterUuid");
  const casterActor = casterUuid ? fromUuidSync(casterUuid) : null;
  const podeUsar = game.user.isGM || message.isAuthor || casterActor?.isOwner;
  for (const painel of paineis) {
    if (!podeUsar) {
      // Quem não pode escolher vê só que a escolha está pendente.
      painel.querySelectorAll(".nrc-prio-abas, .nrc-prio-lista, .nrc-prio-acoes").forEach(el => el.remove());
      painel.open = false;
      const contador = painel.querySelector(".nrc-prio-contador");
      if (contador) contador.textContent = "aguardando escolha";
      continue;
    }
    const limite = Number(painel.dataset.limite) || 0;
    const contador = painel.querySelector(".nrc-prio-contador");
    const textoInicial = contador?.textContent ?? "";
    const caixas = () => [...painel.querySelectorAll(".nrc-prio-item input")];
    const atualizarContador = () => {
      const marcados = caixas().filter(c => c.checked).length;
      if (contador) contador.textContent = limite ? `${marcados}/${limite}` : (marcados ? `${marcados} selecionado(s)` : textoInicial);
    };
    painel.querySelectorAll(".nrc-prio-aba").forEach(aba => aba.addEventListener("click", ev => {
      ev.preventDefault();
      painel.querySelectorAll(".nrc-prio-aba").forEach(a => a.classList.toggle("ativa", a === aba));
      const lado = aba.dataset.lado;
      painel.querySelectorAll(".nrc-prio-item").forEach(el => el.classList.toggle("oculto", lado !== "todos" && el.dataset.lado !== lado));
    }));
    caixas().forEach(caixa => caixa.addEventListener("change", () => {
      if (limite && caixas().filter(c => c.checked).length > limite) {
        caixa.checked = false;
        ui.notifications.info(`Esta Ação concede Prioridade a no máximo ${limite}.`);
      }
      atualizarContador();
    }));
    const finalizar = async uuids => {
      painel.querySelectorAll(".nrc-prio-confirmar, .nrc-prio-dispensar").forEach(b => b.style.pointerEvents = "none");
      await naurenConcederPrioridadePeloCard(message, uuids)
        .catch(err => console.warn("Nauren RPG | Falha ao conceder Prioridade pelo card.", err));
    };
    painel.querySelector(".nrc-prio-confirmar")?.addEventListener("click", ev => {
      ev.preventDefault();
      finalizar(caixas().filter(c => c.checked).map(c => c.value));
    });
    painel.querySelector(".nrc-prio-dispensar")?.addEventListener("click", ev => {
      ev.preventDefault();
      finalizar([]);
    });
  }
});


Hooks.on("hotbarDrop", (bar, data, slot) => {
  if (data.type !== "Item") return true; // deixa o Foundry cuidar de outros tipos de drop normalmente

  (async () => {
    const item = await fromUuid(data.uuid);
    if (!item || !item.parent) {
      ui.notifications.warn("Só é possível arrastar pra hotbar itens que estejam no inventário de um personagem.");
      return;
    }

    const command = [
      `const item = await fromUuid("${data.uuid}");`,
      `if (!item) return ui.notifications.warn("Item não encontrado (pode ter sido apagado).");`,
      `const actor = item.actor;`,
      `if (!actor?.sheet?._useItem) return ui.notifications.warn("Não foi possível usar este item.");`,
      `await actor.sheet._useItem(item);`
    ].join("\n");

    // Procura por flag (não pelo texto do comando) para reaproveitar o macro
    // mesmo que o comando mude entre versões do sistema.
    let macro = game.macros.find(m => m.getFlag("nauren", "itemUuid") === data.uuid);
    if (macro) {
      if (macro.command !== command) await macro.update({ command, img: item.img, name: item.name });
    } else {
      macro = await Macro.create({
        name: item.name,
        type: "script",
        img: item.img,
        command,
        flags: { nauren: { itemMacro: true, itemUuid: data.uuid } }
      });
    }

    await game.user.assignHotbarMacro(macro, slot);
  })();

  return false; // cancela o comportamento padrão do Foundry (abrir a ficha)
});


/**
 * Arrastar uma Condição (ou Efeito) da barra lateral/compêndio direto pra
 * cima de um TOKEN no mapa aplica automaticamente naquele personagem -
 * empilhando acúmulos se já tiver, exatamente como "Condições Aplicadas"
 * de uma Ação faz. Antes só dava pra aplicar arrastando pra ficha aberta
 * do personagem; isso cobre o caso de querer aplicar sem abrir ficha
 * nenhuma, só soltando em cima do token no mapa.
 */
Hooks.on("dropCanvasData", (canvas, data) => {
  if (data.type !== "Item") return true; // deixa o Foundry cuidar de outros tipos de drop normalmente
  const shift = !!globalThis.event?.shiftKey || !!game.keyboard?.isModifierActive?.("Shift");

  (async () => {
    const item = await fromUuid(data.uuid);
    if (!item) {
      ui.notifications.warn("Item não encontrado (pode ter sido apagado).");
      return;
    }
    // Itens de inventário arrastados da própria ficha para o token de outro personagem: entrega (com aceite).
    if (NAUREN_TIPOS_ENTREGAVEIS.includes(item.type)) {
      const tokenDestino = canvas.tokens.placeables.find(t => t.bounds.contains(data.x, data.y));
      if (tokenDestino?.actor && item.parent?.documentName === "Actor" && item.parent.isOwner && tokenDestino.actor.uuid !== item.parent.uuid) {
        await naurenOferecerItem(item, tokenDestino);
      }
      return;
    }
    if (item.type !== "condicao" && item.type !== "efeito") return; // outros tipos: não faz nada, deixa como estava

    // 0.109.19: só tokens visíveis; com vários empilhados, o de cima.
    const tokenAlvo = canvas.tokens.placeables.filter(t => t.visible && t.actor && t.bounds.contains(data.x, data.y))
      .sort((a, b) => (b.document.sort ?? 0) - (a.document.sort ?? 0) || (b.zIndex ?? 0) - (a.zIndex ?? 0))[0];
    if (!tokenAlvo?.actor) {
      ui.notifications.warn(`Solte "${item.name}" em cima de um token pra aplicar automaticamente.`);
      return;
    }
    if (!tokenAlvo.actor.isOwner) {
      ui.notifications.warn(`Você não tem permissão para modificar "${tokenAlvo.actor.name}".`);
      return;
    }

    // 0.109.7: segurar Shift ao soltar pergunta quantos acúmulos (Condição acumulável); quem aplicou fica registrado
    // como origem quando a Condição vem da ficha de um ator (ex.: modelo na ficha de um monstro).
    let acumulos = 1;
    if (shift && item.type === "condicao" && item.system.acumulativel) {
      const v = await foundry.applications.api.DialogV2.prompt({ window: { title: item.name }, content: `<p>Quantos acúmulos de <b>${foundry.utils.escapeHTML(item.name)}</b> em <b>${foundry.utils.escapeHTML(tokenAlvo.name)}</b>?</p><input type="number" name="n" value="1" min="1" autofocus>`,
        ok: { label: "Aplicar", callback: (ev, btn) => Number(btn.form.elements.n.value) || 1 }, rejectClose: false }).catch(() => null);
      if (!v) return;
      acumulos = Math.max(1, Math.floor(v));
    }
    const dono = item.parent?.documentName === "Actor" ? item.parent : null;
    const conjurador = dono ? ((dono.isToken ? dono.token?.uuid : (dono.getActiveTokens?.(false, true)?.[0]?.uuid ?? dono.uuid)) ?? "") : "";
    const resultado = await NaurenAlvoHelper.aplicarCondicao(tokenAlvo.actor, data.uuid, acumulos, null, 0, 0, "", "1", "", conjurador);
    if (resultado) {
      naurenPostarCard({ ator: tokenAlvo.actor, titulo: resultado, fonte: "Aplicada arrastando no token",
        linhas: [{ label: "Recebeu", value: resultado }] });
    }
  })();

  return false; // consome o drop (Foundry não faz nada de útil com um Item solto direto no canvas mesmo)
});
}

export { naurenConcederPrioridadePeloCard, naurenResumoDoCartao, naurenTomarPrioridadePeloCard };
