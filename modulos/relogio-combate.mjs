/* Nauren RPG — Relógio de combate (turnos e rodadas). Separado do nauren.mjs na 0.94.31. */
import { NAUREN_MOMENTOS_PERIODICOS, naurenAncoraDuracaoAtual, naurenAplicarEfeitoSimples, naurenAtoresDoTurno, naurenAvancarDuracoesCondicoes, naurenBandoChave, naurenBandoMembros, naurenBonusDanoPeriodico, naurenEhCondicaoModelo, naurenEhItem, naurenEscolherCorDaPintura, naurenGrimorio, naurenInterpretarModificador, naurenMedirDistanciaBordas, naurenMomentoEfeitoPeriodico, naurenMovSemPrioridadeUsado, naurenMovimentoEmCombate, naurenMovimentoSaldo, naurenPostarCard, naurenRecarregarUsos, naurenRecursoDoAtor, naurenResolverPorRank, naurenResolverTokenFormula, naurenRollToBreakdownText, naurenUuidPorSeed } from "../nauren.mjs";
import { NaurenAlvoHelper, naurenChecarLimiarEfeitoDireto } from "./ficha-ator.mjs";
import { naurenAurasDeEstaminaSobreMim, naurenChecarCondicaoAoAtingirMax, naurenConcederRecurso, naurenGravarMemoriaVida, naurenPontoDentroDaRegiao, naurenProcessarEmanacoes, naurenProcessarEmanacoesSobre, naurenProcessarGatilhos, naurenProcessarTemplatesPersistentes } from "./icone-condicao-token.mjs";
import { naurenExpirarEscudo } from "./compendios.mjs";
/* =======================================
 * RELÓGIO DE COMBATE
 * -----------------------------------------------------------------------
 * Toda troca de turno/rodada vira UMA transição, processada em fila
 * (nunca duas ao mesmo tempo) e sempre na mesma ordem:
 *   1. Fim do turno que acabou   (fimTurno do portador, fimTurnoQualquer)
 *   2. Se virou a rodada:        fimRodada -> inicioRodada
 *   3. Início de qualquer turno  (inicioTurnoQualquer, usos/recursos "turno")
 *   4. Início do turno do portador (inicioTurno, usos/recursos "meuTurno")
 * Quem processa cada ator: o jogador dono ativo; sem jogador dono
 * conectado, o Mestre ativo (naurenUsuarioResponsavel). Efeitos que tocam
 * a cena inteira (efeitos periódicos, durações, Templates) ficam só com
 * o Mestre ativo. Voltar turno/rodada no rastreador não reprocessa nada.
 * ======================================= */

/** Um único usuário responsável por ator: evita processar o mesmo evento em vários clientes. */
/**
 * Mestre que conduz o combate atual: quem iniciou o combate ou avançou o turno por último
 * (gravado no próprio combate, então todas as máquinas concordam). Fora de combate, ou se
 * esse Mestre saiu, vale o Mestre principal do Foundry.
 */
function naurenMestreDaMesa() {
  const id = game.combat?.started ? game.combat.getFlag?.("nauren", "mestreUserId") : null;
  const u = id ? game.users.get(id) : null;
  const morto = x => NaurenAlvoHelper.naoResponde?.(x);
  if (u?.active && u.isGM && !morto(u)) return u;
  const ag = game.users.activeGM;
  if (ag && !morto(ag)) return ag;
  // Mestre "online" que não responde (aba esquecida): vale o próximo Mestre online.
  return game.users.filter(x => x.active && x.isGM && !morto(x)).sort((a, b) => a.id.localeCompare(b.id))[0] ?? ag ?? null;
}
Hooks.on("preUpdateCombat", (combat, changes) => {
  if (!game.user.isGM) return;
  const mexeuNoTurno = ("turn" in changes) || ("round" in changes) || ("started" in changes);
  if (mexeuNoTurno && combat.getFlag("nauren", "mestreUserId") !== game.user.id) foundry.utils.setProperty(changes, "flags.nauren.mestreUserId", game.user.id);
});

/**
 * Mestres online se conferem a cada 15s durante o combate. Se o Mestre que conduz a mesa
 * está "online" mas a tela não responde (aba esquecida, celular apagado), o Mestre seguinte
 * que responde assume a mesa (gravado no combate, então todas as telas concordam).
 */
async function naurenConferirMestreDaMesa() {
  if (!game.user.isGM || !game.combat?.started) return;
  const outros = game.users.filter(u => u.active && u.isGM && u.id !== game.user.id);
  for (const u of outros) await NaurenAlvoHelper.usuarioResponde(u);
  const id = game.combat.getFlag?.("nauren", "mestreUserId");
  const atual = id ? game.users.get(id) : null;
  const atualOk = atual && atual.active && atual.isGM && !NaurenAlvoHelper.naoResponde(atual);
  if (atualOk) return;
  const vivos = game.users.filter(u => u.active && u.isGM && !NaurenAlvoHelper.naoResponde(u)).sort((a, b) => a.id.localeCompare(b.id));
  if (vivos[0]?.id !== game.user.id) return;
  await game.combat.setFlag("nauren", "mestreUserId", game.user.id).catch(() => null);
  console.info(`Nauren RPG | ${game.user.name} assumiu a mesa (${atual ? `"${atual.name}" não respondeu` : "sem Mestre definido"}).`);
}
Hooks.once("ready", () => {
  if (!game.user.isGM) return;
  setInterval(() => { naurenConferirMestreDaMesa().catch(err => console.warn("Nauren RPG | Conferir Mestre da mesa", err)); }, 15000);
});
Hooks.on("combatStart", () => { if (game.user.isGM) naurenConferirMestreDaMesa().catch(() => null); });

/**
 * Alguém entrou ou saiu do mundo: esquece se a tela dele "não respondia" (quem recarregou a página
 * volta a receber as perguntas na hora) e, se for um Mestre entrando, ele recebe as janelas de
 * reação que ainda estão abertas (a primeira resposta, de quem for, é a que vale).
 */
Hooks.on("userConnected", (user, conectou) => {
  NaurenAlvoHelper._respostaUsuario.delete(user.id);
  if (!conectou || !user.isGM || user.id === game.user.id) return;
  for (const pedido of NaurenAlvoHelper._pedidosReacao.values()) {
    try { pedido.adicionarMestre?.(user); } catch (err) { console.warn("Nauren RPG | Enviar janela aberta ao Mestre que entrou", err); }
  }
  for (const espera of NaurenAlvoHelper._esperandoMestre) espera(user);
});

function naurenUsuarioResponsavel(actor) {
  const gm = naurenMestreDaMesa();
  if (!actor) return gm;
  const donos = game.users
    .filter(u => u.active && !u.isGM && actor.testUserPermission(u, "OWNER"))
    .sort((a, b) => a.id.localeCompare(b.id));
  return donos[0] ?? gm;
}
function naurenSouResponsavelPor(actor) {
  return !!actor && naurenUsuarioResponsavel(actor) === game.user;
}

let naurenFilaRelogio = Promise.resolve();
// Fase 6: ao terminar o combate, saem as Condições "até o fim do combate" e
// os itens concedidos por uma cena. Feito pelo Mestre ativo.
Hooks.on("deleteCombat", async combate => {
  if (game.users.activeGM !== game.user) return;
  // Condições com duração em rodadas/turnos só andam em combate: as que
  // sobraram não podem vazar para a próxima luta.
  const sobrasRodadas = [];
  // Só quem estava NESTE combate e os tokens da cena dele - com várias mesas no mesmo servidor, o fim de
  // um combate não pode encerrar Condições de quem ainda está lutando em outro.
  const emOutroCombate = new Set();
  for (const c of game.combats) if (c.id !== combate.id && c.started) for (const cb of c.combatants) if (cb.actor) emOutroCombate.add(cb.actor.uuid);
  const atoresDoCombate = new Set(combate.combatants.map(c => c.actor).filter(Boolean));
  const cenaCombate = combate.scene ?? null;
  if (cenaCombate) for (const t of cenaCombate.tokens) if (t.actor) atoresDoCombate.add(t.actor);
  for (const a of [...atoresDoCombate]) if (emOutroCombate.has(a.uuid)) atoresDoCombate.delete(a);
  const atoresSobras = atoresDoCombate;
  for (const a of atoresSobras) {
    // 0.94.10: Condições modelo da ficha do NPC (as que ele aplica nos outros) nunca saem no fim do combate.
    const itens = a.items.filter(i => i.type === "condicao" && !naurenEhCondicaoModelo(i) && (i.system.duracaoRodadas || 0) > 0 && i.system.duracaoModo !== "cena");
    if (!itens.length) continue;
    sobrasRodadas.push(`${a.name}: ${itens.map(i => i.name).join(", ")}`);
    await a.deleteEmbeddedDocuments("Item", itens.map(i => i.id)).catch(() => {});
  }
  if (sobrasRodadas.length) naurenPostarCard({ titulo: "Fim do combate", icone: "icons/magic/time/hourglass-brown-orange.webp", fonte: "Duração em rodadas", linhas: sobrasRodadas.map(t => ({ label: "Encerrado", value: t })) });
  // "Só no primeiro ataque contra cada alvo": começa de novo no próximo combate.
  for (const a of atoresDoCombate) if (a.getFlag("nauren", "primeirosAtaques")) await a.unsetFlag("nauren", "primeirosAtaques").catch(() => {});
  // "Até o fim do combate": só quem estava neste combate / na cena dele.
  const atores = atoresDoCombate;
  for (const actor of atores) {
    const sair = actor.items.filter(i => !naurenEhCondicaoModelo(i) && ((i.type === "condicao" && i.system.duracaoModo === "cena") || i.getFlag("nauren", "concessaoExpiraEm") === "cena"));
    if (actor.getFlag("nauren", "memoriaVida")) await actor.unsetFlag("nauren", "memoriaVida").catch(() => {});
    if (!sair.length) continue;
    // 0.94.3: efeitos ao terminar (Dependência Alquímica: 1d4 por Frasco; Elixir de Crescimento: −1d4 de Vida máxima).
    const linhasFim = [];
    for (const c of sair) {
      if (c.type !== "condicao" || !(c.system.efeitosAoTerminar ?? []).length) continue;
      const ac = c.system.acumulativel ? Math.max(1, c.system.acumulos ?? 1) : 1;
      for (const ef of c.system.efeitosAoTerminar) {
        try { const l = await naurenAplicarEfeitoSimples(actor, ef, { fonte: c.name, subst: { acumulos: ac, rank: Math.max(1, c.system.rankAtual || 1) } }); if (l) linhasFim.push({ label: c.name, value: l }); }
        catch (err) { console.warn(`Nauren RPG | efeito ao terminar de "${c.name}"`, err); }
      }
    }
    await actor.deleteEmbeddedDocuments("Item", sair.map(i => i.id)).catch(() => {});
    naurenPostarCard({ ator: actor, titulo: "Fim do combate", icone: "icons/magic/time/hourglass-yellow-green.webp", fonte: "Duração: cena",
      linhas: [{ label: "Encerrado", value: sair.map(i => i.name).join(", ") }, ...linhasFim] });
  }
});

// Maior posição (rodada, turno) já processada em cada combate, neste cliente.
const naurenRelogioPosicaoMaxima = new Map();
function naurenEnfileirarRelogio(tarefa) {
  // 0.88.6: uma transição que fica esperando (janela de "manter voo?" sem resposta, query de outro
  // jogador que não volta) não pode travar a fila para sempre - senão nenhuma rodada seguinte
  // recupera Estamina, recarrega usos nem anda as durações nesta máquina. Depois de 90 s a fila segue.
  const comLimite = () => new Promise(resolve => {
    let terminou = false;
    const timer = setTimeout(() => {
      if (terminou) return;
      console.warn("Nauren RPG | Relógio de Combate: uma transição passou de 90 s (provavelmente uma janela sem resposta). A fila seguiu para não travar as próximas rodadas.");
      resolve();
    }, 90000);
    Promise.resolve().then(tarefa)
      .catch(err => console.error("Nauren RPG | Relógio de Combate: falha ao processar uma transição.", err))
      .finally(() => { terminou = true; clearTimeout(timer); resolve(); });
  });
  naurenFilaRelogio = naurenFilaRelogio.then(comLimite);
  return naurenFilaRelogio;
}

// Renomear a ficha leva o nome junto para o token do protótipo e para os
// tokens vinculados já colocados (a iniciativa usa o nome do token).
Hooks.on("preUpdateActor", (actor, changes) => {
  if (typeof changes.name !== "string" || changes.name === actor.name) return;
  if (actor.prototypeToken?.name === actor.name) foundry.utils.setProperty(changes, "prototypeToken.name", changes.name);
  actor._naurenNomeAnterior = actor.name;
});
Hooks.on("updateActor", async (actor, changes) => {
  const anterior = actor._naurenNomeAnterior;
  delete actor._naurenNomeAnterior;
  if (!anterior || typeof changes.name !== "string" || game.users.activeGM !== game.user) return;
  for (const cena of game.scenes) {
    const atualizar = cena.tokens.filter(t => t.actorLink && t.actorId === actor.id && t.name === anterior).map(t => ({ _id: t.id, name: actor.name }));
    if (atualizar.length) await cena.updateEmbeddedDocuments("Token", atualizar).catch(() => {});
  }
  for (const combate of game.combats) {
    const atualizar = combate.combatants.filter(c => c.actorId === actor.id && c.name === anterior).map(c => ({ _id: c.id, name: actor.name }));
    if (atualizar.length) await combate.updateEmbeddedDocuments("Combatant", atualizar).catch(() => {});
  }
});

// Estado ANTES da mudança (updateCombat só entrega o estado novo).
Hooks.on("preUpdateCombat", (combat, changed) => {
  if ("turn" in changed || "round" in changed) {
    combat._naurenAtorDoTurnoAnterior = combat.combatant?.actor ?? null;
    combat._naurenRodadaAnterior = combat.round ?? 0;
    combat._naurenTurnoAnterior = combat.turn ?? 0;
  }
});

// Início do combate: dispara antes da primeira transição (a que leva à rodada 1).
// Virtude da Coragem (Empíreo): quem age primeiro escolhe +3 de Poder de Ataque ou de Magia na cena.
// Marcador de Página (Mago): "ao iniciar uma cena de combate, crie o marcador numa página à sua escolha".
// Pergunta logo no começo (antes só perguntava ao usar "Ir para a página marcada", o que virava "ir para qualquer página").
Hooks.on("combatStart", (combat) => {
  setTimeout(async () => {
    for (const actor of [...new Set(combat.combatants.map(c => c.actor).filter(Boolean))]) {
      if (!naurenSouResponsavelPor(actor)) continue;
      const hab = actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Marcador de Página") && i.system.ativo !== false);
      if (!hab) continue;
      const g = naurenGrimorio(actor);
      if (!g.paginas.length) continue;
      const esc = await foundry.applications.api.DialogV2.wait({ window: { title: `Marcador de Página — ${actor.name}` }, classes: ["nauren-dialogo"],
        content: "<p>O combate começou: em qual página fica o marcador? (vale até o fim do combate)</p>",
        buttons: g.paginas.map((m, i) => ({ action: m.id, label: `${i + 1}. ${m.name}` })), rejectClose: false }).catch(() => null);
      if (!esc) continue;
      await actor.setFlag("nauren", "marcadorPagina", esc);
      const pos = g.paginas.findIndex(m => m.id === esc);
      naurenPostarCard({ ator: actor, titulo: "Marcador de Página", icone: hab.img, fonte: "Início do combate",
        linhas: [{ label: "Marcador", value: `página ${pos + 1}`, breakdown: `${g.paginas[pos]?.name ?? ""} • "Ir para a página marcada" custa 1 Estamina` }] });
    }
  }, 1800);
});
Hooks.on("combatStart", (combat) => {
  setTimeout(async () => {
    const primeiro = combat.turns?.[0]?.actor;
    if (!primeiro || !naurenSouResponsavelPor(primeiro)) return;
    const hab = primeiro.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Virtude da Coragem") && i.system.ativo !== false);
    if (!hab) return;
    const esc = await foundry.applications.api.DialogV2.wait({ window: { title: "Virtude da Coragem" }, content: "<p>Você age primeiro: +3 em qual Poder até o fim do combate?</p>",
      buttons: [{ action: "poderAtaque", label: "Poder de Ataque" }, { action: "poderMagia", label: "Poder de Magia" }], rejectClose: false }).catch(() => null);
    if (!esc) return;
    await primeiro.createEmbeddedDocuments("Item", [{ name: `Virtude da Coragem (+3 ${esc === "poderAtaque" ? "Poder de Ataque" : "Poder de Magia"})`, type: "condicao", img: hab.img,
      system: { duracaoModo: "cena", negativa: "nao", modificadores: [{ campo: esc, valor: "3" }], descricao: "<p>Virtude da Coragem: +3 até o fim do combate.</p>" } }]);
  }, 1500);
});
Hooks.on("combatStart", (combat) => {
  const atores = [...new Set(combat.combatants.map(c => c.actor).filter(Boolean))];
  naurenEnfileirarRelogio(async () => {
    for (const actor of atores) {
      if (!naurenSouResponsavelPor(actor)) continue;
      // Rapidez (Empíreo): na 1ª rodada, age primeiro.
      if (actor.items.some(i => i.type === "habilidade" && naurenEhItem(i, "Rapidez") && i.system.ativo !== false)) { // roda no responsável (antes exigia o Mestre: não valia para jogadores)
        const maior = Math.max(...combat.combatants.map(c => c.initiative ?? 0));
        for (const c of combat.combatants.filter(c => c.actor === actor)) {
          if ((c.initiative ?? 0) >= maior && combat.combatants.filter(o => (o.initiative ?? 0) >= maior).length === 1) continue; // já é o primeiro
          const original = c.initiative ?? 0;
          await c.update({ initiative: maior + 1, "flags.nauren.rapidezIniciativaOriginal": original }).catch(() => {});
          naurenPostarCard({ ator: actor, titulo: "Rapidez", fonte: "Início do combate", linhas: [{ label: "1ª rodada", value: "age primeiro", breakdown: `na 2ª rodada volta à iniciativa ${original}` }] });
        }
      }
      // Combate novo começa limpo, mesmo que o anterior não tenha sido encerrado (Bando: todos os lacaios).
      for (const aU of naurenAtoresDoTurno(actor)) await naurenRecarregarUsos(aU, "cena").catch(err => console.warn("Nauren RPG | Falha ao recarregar usos no início do combate.", err));
      await naurenProcessarGatilhos("inicioCombate", actor).catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (início de combate).", err));
    }
  });
});

/**
 * Quem ENTRA num combate já iniciado também passa pelo "início do combate" (recarga dos usos de cena e
 * gatilhos como a Tinta Energética) - antes só valia para quem já estava no rastreador ao começar.
 */
Hooks.on("createCombatant", (combatant) => {
  const combat = combatant.parent, actor = combatant.actor;
  if (!combat?.started || !actor || !naurenSouResponsavelPor(actor)) return;
  if (combat.combatants.filter(c => c.actor === actor).length > 1) return; // já estava neste combate (outro token do mesmo ator)
  naurenEnfileirarRelogio(async () => {
    await naurenRecarregarUsos(actor, "cena").catch(err => console.warn("Nauren RPG | Falha ao recarregar usos (entrou no combate).", err));
    await naurenProcessarGatilhos("inicioCombate", actor).catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (entrou no combate).", err));
  });
});

/**
 * O que ESTA máquina viu por último em cada combate (rodada, turno e ator do turno).
 * O preUpdateCombat só roda em quem clicou para passar o turno; nas outras
 * máquinas (jogadores) os valores guardados nele não existem. Sem este registro,
 * a rodada anterior virava 0 e toda troca de turno contava como rodada nova
 * (a Estamina dos personagens voltava a cada turno).
 */
const naurenRelogioUltimoVisto = new Map();
Hooks.on("combatStart", (combat) => {
  naurenRelogioUltimoVisto.set(combat.id, { round: combat.round ?? 1, turn: combat.turn ?? 0, ator: combat.combatant?.actor ?? null });
});
// 0.88.6: combate que já estava rolando quando a página carregou (F5, entrou atrasado).
Hooks.once("ready", () => {
  for (const c of game.combats ?? []) {
    if (!c.started || naurenRelogioUltimoVisto.has(c.id)) continue;
    naurenRelogioUltimoVisto.set(c.id, { round: c.round ?? 1, turn: c.turn ?? 0, ator: c.combatant?.actor ?? null });
  }
});
// Rapidez (Empíreo): só na 1ª rodada - ao virar para a 2ª, volta à iniciativa que tinha.
Hooks.on("preUpdateCombat", (combat, changed) => {
  if (game.users.activeGM !== game.user || changed.round !== 2) return;
  for (const c of combat.combatants) {
    const original = c.getFlag?.("nauren", "rapidezIniciativaOriginal");
    if (original === undefined || original === null) continue;
    c.update({ initiative: original, "flags.nauren.-=rapidezIniciativaOriginal": null }).catch(() => {});
    if (c.actor) naurenPostarCard({ ator: c.actor, titulo: "Rapidez", fonte: "2ª rodada", linhas: [{ label: "Iniciativa", value: `volta a ${original}` }] });
  }
});
Hooks.on("updateCombat", (combat, changed) => {
  if (!("turn" in changed) && !("round" in changed)) return;

  const combatenteAtual = combat.combatant ?? null;
  const atorDoTurno = combatenteAtual?.actor ?? null;
  const visto = naurenRelogioUltimoVisto.get(combat.id);
  // 0.88.6: quem recarregou a página no meio do combate não tinha "visto" nada - a 1ª virada de rodada
  // depois disso não contava (o Ladino do jogador ficava sem recuperar Estamina). O próprio Foundry
  // guarda o estado anterior em combat.previous: ele entra antes do valor atual.
  const prev = combat.previous ?? null;
  const atorPrev = prev?.combatantId ? (combat.combatants.get(prev.combatantId)?.actor ?? null) : null;
  const atorDoTurnoAnterior = combat._naurenAtorDoTurnoAnterior ?? visto?.ator ?? atorPrev ?? null;
  const rodadaAnterior = combat._naurenRodadaAnterior ?? visto?.round ?? (Number.isFinite(prev?.round) ? prev.round : (combat.round ?? 0));
  const turnoAnterior = combat._naurenTurnoAnterior ?? visto?.turn ?? (Number.isFinite(prev?.turn) ? prev.turn : 0);
  naurenRelogioUltimoVisto.set(combat.id, { round: combat.round ?? 0, turn: combat.turn ?? 0, ator: atorDoTurno });
  delete combat._naurenAtorDoTurnoAnterior;
  delete combat._naurenRodadaAnterior;
  delete combat._naurenTurnoAnterior;

  // Orçamento de movimento é memória local de cada cliente.
  if (atorDoTurno) naurenMovimentoEmCombate.delete(atorDoTurno.uuid);
  naurenMovimentoSaldo.clear(); // o saldo de movimento vale só dentro do turno em que foi pago
  naurenMovSemPrioridadeUsado.clear(); // Fase 4 (M02): os metros "sem Prioridade" valem por turno

  // Voltar no rastreador não reprocessa nada, e avançar de novo até a
  // posição já processada também não: só posições novas contam.
  const rodadaAtual = combat.round ?? 0;
  const turnoAtual = combat.turn ?? 0;
  const maxima = naurenRelogioPosicaoMaxima.get(combat.id);
  const jaProcessada = maxima && (rodadaAtual < maxima.round || (rodadaAtual === maxima.round && turnoAtual <= maxima.turn));
  if (jaProcessada) return;
  naurenRelogioPosicaoMaxima.set(combat.id, { round: rodadaAtual, turn: turnoAtual });

  naurenEnfileirarRelogio(() => naurenRelogioProcessarTransicao({
    combate: combat,
    combatenteAtualId: combatenteAtual?.id ?? null,
    atorDoTurno,
    atorDoTurnoAnterior,
    novaRodada: rodadaAtual > rodadaAnterior,
    houveRodadaAnterior: rodadaAnterior >= 1,
    atores: [...new Set([...combat.combatants].flatMap(c => c.actor ? (c.token && naurenBandoChave(c.token) ? naurenBandoMembros(c.token).map(t => t.actor) : [c.actor]) : []).filter(Boolean))]
  }));
});

/**
 * Qualquer Condição com duração criada num Ator (aplicada por Ação,
 * arrastada à mão, concedida por Gatilho...) nasce com a contagem cheia e
 * ancorada no turno atual, se ainda não vier preenchida.
 */
Hooks.on("preCreateItem", (item, dados) => {
  if (item.type !== "condicao" || !item.parent || item.parent.documentName !== "Actor") return;
  const sys = item.system;
  if (!((sys?.duracaoRodadas || 0) > 0)) return;
  const ajustes = {};
  if (!((sys.duracaoRestante || 0) > 0)) ajustes["system.duracaoRestante"] = sys.duracaoRodadas;
  if (!sys.duracaoAncoraCombatenteId) Object.assign(ajustes, naurenAncoraDuracaoAtual("system."));
  if (Object.keys(ajustes).length) item.updateSource(ajustes);
});

/** Processa uma transição do Relógio de Combate, na ordem documentada acima. */
/**
 * Sustentações (ex.: Raio Dourado): a cada turno de QUALQUER combatente,
 * quem controla o conjurador escolhe sustentar (paga a Mana e o dano vai
 * direto no alvo, +incremento por turno sustentado) ou encerrar.
 */
async function naurenProcessarSustentacoes(ator) {
  const conds = ator.items.filter(i => i.type === "condicao" && i.getFlag("nauren", "sustentacao"));
  for (const cond of conds) {
    const sd = foundry.utils.deepClone(cond.getFlag("nauren", "sustentacao"));
    const encerrar = async motivo => {
      await cond.delete().catch(() => {});
      naurenPostarCard({ ator, titulo: sd.itemNome, icone: cond.img, fonte: "Sustentação", linhas: [{ label: "Encerrado", value: motivo, breakdown: sd.turnos ? `sustentado por ${sd.turnos} turno(s)` : "" }] });
    };
    const alvoDoc = await fromUuid(sd.alvoTokenUuid).catch(() => null);
    const alvoAtor = alvoDoc?.actor;
    if (!alvoAtor || (alvoAtor.system?.vida?.value ?? 0) <= 0) { await encerrar("o alvo não está mais em combate"); continue; }
    const meu = ator.getActiveTokens?.(true)?.[0];
    if (sd.alcance && meu && alvoDoc.object) {
      const dist = naurenMedirDistanciaBordas(meu, alvoDoc.object);
      if (dist > sd.alcance) { await encerrar(`o alvo saiu do alcance (${Math.round(dist)}m > ${sd.alcance}m)`); continue; }
    }
    const mana = ator.system?.mana?.value ?? 0;
    if (mana < (sd.custoMana ?? 0)) { await encerrar(`sem Mana para sustentar (${mana} de ${sd.custoMana})`); continue; }
    const proximoBonus = (sd.incremento ?? 0) * ((sd.turnos ?? 0) + 1);
    const sim = await foundry.applications.api.DialogV2.confirm({ window: { title: sd.itemNome },
      content: `<p>Sustentar <b>${sd.itemNome}</b> em <b>${alvoDoc.name}</b>?</p><p>Custa <b>${sd.custoMana} Mana</b> (você tem ${mana}). Dano: <b>${sd.formula}${proximoBonus ? ` + ${proximoBonus}` : ""}</b>, sem teste (acerta direto).</p>`,
      yes: { label: "Sustentar" }, no: { label: "Encerrar" }, rejectClose: false }).catch(() => false);
    if (!sim) { await encerrar("você deixou de sustentar"); continue; }
    await ator.update({ "system.mana.value": mana - (sd.custoMana ?? 0) });
    sd.turnos = (sd.turnos ?? 0) + 1;
    await cond.setFlag("nauren", "sustentacao", sd);
    const formulaBase = ator.sheet?._substituirAtributosNaFormula ? ator.sheet._substituirAtributosNaFormula(sd.formula, null) : sd.formula;
    const roll = await new Roll(`${formulaBase}${proximoBonus ? ` + ${proximoBonus}` : ""}`).evaluate();
    if (game.dice3d) await game.dice3d.showForRoll(roll, game.user, true);
    const danoMin = roll.dice.reduce((t, d) => t + d.number, 0) + (proximoBonus || 0);
    const res = await NaurenAlvoHelper.aplicarEmAlvo(alvoDoc, { nomeAcao: sd.itemNome, atacante: ator.name, atacanteTokenUuid: meu?.document?.uuid ?? null,
      houveAtaque: false, ehSustentacao: true, ataqueTotal: null, dano: roll.total, danoMinimo: danoMin, cura: 0, condicoes: [], gastosRecurso: [] }).catch(() => null);
    naurenPostarCard({ ator, titulo: sd.itemNome, icone: cond.img, fonte: "Sustentação", linhas: [
      { label: `Turno ${sd.turnos} sustentado`, value: `${roll.total} de dano em ${alvoDoc.name}`, breakdown: `${naurenRollToBreakdownText(roll)}${proximoBonus ? ` (inclui +${proximoBonus} de ${sd.turnos} turno(s))` : ""}` },
      ...((res?.linhas ?? []).map(l => ({ label: "", value: l }))),
      { label: "Mana", value: `−${sd.custoMana}`, breakdown: `restam ${mana - (sd.custoMana ?? 0)}` } ] });
  }
}

/**
 * Ataque básico feito como parte de uma reação (Ambidestria): janela compacta com uma opção por arma
 * equipada, depois o ataque contra quem atacou, sem custo e sem página/confirmação extra.
 */
async function naurenAtaqueBasicoNaReacao(ator, atacanteTokenDoc, fonte) {
  await new Promise(r => setTimeout(r, 700)); // deixa o ataque original terminar antes
  if (!ator?.isOwner || !atacanteTokenDoc?.actor || (atacanteTokenDoc.actor.system?.vida?.value ?? 1) <= 0) return;
  const armas = ator.items.filter(i => i.type === "arma" && i.system.equipado && (i.system.acoes ?? []).length);
  if (!armas.length) return;
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const idxBasico = a => Math.max(0, (a.system.acoes ?? []).findIndex(x => /b[aá]sico/i.test(x.nome ?? "")));
  let escolhida = null;
  await foundry.applications.api.DialogV2.wait({
    window: { title: `${fonte?.name ?? "Ataque"} — atacar agora?`, icon: "fas fa-khanda" }, classes: ["nauren-janela-movimento", "nauren-dialogo"], position: { width: 380 },
    content: `<div class="nauren-mov">
      <p class="nauren-mov-aviso" style="margin:0;">Você bloqueou <b>${esc(atacanteTokenDoc.name)}</b>. Faça um ataque básico contra ele como parte do bloqueio, <b>sem custo</b>.</p>
      <div class="nauren-mov-opcoes">${armas.map(a => {
        const ac = a.system.acoes[idxBasico(a)] ?? {};
        let dano = String(ac.danos?.[0]?.formula ?? "");
        try { if (dano && typeof ator.sheet?._substituirAtributosNaFormula === "function") dano = ator.sheet._substituirAtributosNaFormula(dano, ac); } catch (err) { /* mostra a fórmula crua */ }
        return `<button type="button" class="nauren-mov-opcao nauren-reacao-arma" data-arma="${a.id}"><img src="${esc(a.img)}" alt=""><span class="nauren-mov-titulo">${esc(a.name)}<small>${esc(ac.nome || "Ataque Básico")}</small></span><span class="nauren-mov-custo">${dano ? `<b>${esc(dano)}</b> de dano` : ""}</span></button>`;
      }).join("")}</div>
    </div>`,
    buttons: [{ action: "nao", label: "Não atacar" }], rejectClose: false,
    render: (ev, dialog) => dialog.element.querySelectorAll(".nauren-mov-opcao").forEach(b => b.addEventListener("click", () => { escolhida = b.dataset.arma; dialog.close(); }))
  }).catch(() => null);
  const arma = escolhida ? ator.items.get(escolhida) : null;
  if (!arma) return;
  const sheet = ator.sheet;
  if (typeof sheet?._executarAcao !== "function") return;
  const alvosAntes = Array.from(game.user.targets ?? []);
  for (const t of alvosAntes) t.setTarget(false, { releaseOthers: false });
  atacanteTokenDoc.object?.setTarget(true, { releaseOthers: true });
  ator.getActiveTokens?.(true)?.[0]?.control?.({ releaseOthers: false });
  const antes = sheet._acaoGratis; sheet._acaoGratis = { motivo: `${fonte?.name ?? "Reação"}: ataque como parte do bloqueio` };
  try { await sheet._executarAcao(arma, idxBasico(arma)); }
  finally {
    sheet._acaoGratis = antes;
    atacanteTokenDoc.object?.setTarget(false, { releaseOthers: false });
    for (const t of alvosAntes) t.setTarget(true, { releaseOthers: false });
  }
}

/** Apaga as Regiões de Ações instantâneas (não persistentes, não Emanação, não de entidade). Só o Mestre. */
async function naurenLimparAreasInstantaneas() {
  let ligado = true; try { ligado = game.settings.get("nauren", "areasInstantaneasSomem"); } catch (err) { ligado = true; }
  if (!ligado || game.users.activeGM !== game.user || !canvas?.scene) return;
  const deEntidade = new Set();
  const atores = new Set(game.actors);
  for (const t of canvas.scene.tokens) if (t.actor) atores.add(t.actor);
  for (const a of atores) { const e = a.getFlag?.("nauren", "entidade"); if (e?.regiaoUuid) deEntidade.add(e.regiaoUuid); }
  const ids = canvas.scene.regions.filter(r => {
    const o = r.getFlag("nauren", "origemTemplate");
    return o && !o.ehEmanacao && !r.getFlag("nauren", "templatePersistente") && !deEntidade.has(r.uuid);
  }).map(r => r.id);
  if (ids.length) await canvas.scene.deleteEmbeddedDocuments("Region", ids);
}

async function naurenRelogioProcessarTransicao(t) {
  const { combate, combatenteAtualId, atorDoTurno, atorDoTurnoAnterior, novaRodada, houveRodadaAnterior, atores } = t;
  const souGM = naurenMestreDaMesa() === game.user; // o Mestre que conduz o combate (com 2 Mestres, um só processa)
  const ctx = { combate, combatenteAtualId };
  const falha = etapa => err => console.warn(`Nauren RPG | Relógio de Combate: falha em "${etapa}".`, err);
  const turnoTerminou = !!atorDoTurnoAnterior && (atorDoTurnoAnterior !== atorDoTurno || novaRodada);
  // Traço da Aquarela: quem termina o turno sobre a linha (aliado de quem a criou) recebe 1 Ponto de Pintura.
  if (turnoTerminou && atorDoTurnoAnterior && naurenSouResponsavelPor(atorDoTurnoAnterior)) {
    const tokT = atorDoTurnoAnterior.getActiveTokens?.(true)?.[0];
    const linhasT = tokT ? (canvas.scene?.regions ?? []).filter(r => r.getFlag("nauren", "tracoAquarela")?.disposicao === tokT.document.disposition && naurenPontoDentroDaRegiao(tokT.center, r, tokT.document)) : [];
    if (linhasT.length) {
      const packC = game.packs.find(pk => pk.metadata.label === "Nauren - Condições e Venenos");
      const uuidPP = packC ? await naurenUuidPorSeed(packC, "condicao-ponto-de-pintura") : null;
      if (uuidPP) { await NaurenAlvoHelper.aplicarCondicao(atorDoTurnoAnterior, uuidPP, 1).catch(() => null);
        const corT = await naurenEscolherCorDaPintura(atorDoTurnoAnterior, "aquarela").catch(() => "");
        naurenPostarCard({ ator: atorDoTurnoAnterior, titulo: "Traço da Aquarela", icone: "icons/tools/hand/brush-paint-brown-white.webp", fonte: "Fim do turno", linhas: [{ label: "Terminou o turno na linha", value: "+1 Ponto de Pintura" }, corT ? { label: "Cor", value: corT } : null].filter(Boolean) }); }
    }
  }
  // 1. Fim do turno que acabou
  if (turnoTerminou) {
    // Bando (0.93): o turno é de todos os lacaios vivos do grupo.
    for (const atorFim of naurenAtoresDoTurno(atorDoTurnoAnterior)) {
    if (naurenSouResponsavelPor(atorFim)) {
      await naurenProcessarGatilhos("fimTurno", atorFim).catch(falha("gatilhos: fim do meu turno"));
      await naurenProcessarEmanacoes("fimTurno", atorFim).catch(falha("emanações: fim do turno"));
    }
    // Periódicos e durações rodam na máquina do RESPONSÁVEL por cada personagem (não só no Mestre):
    // assim ficam na mesma fila que a recuperação e os gatilhos dele, sem corrida entre máquinas.
    if (naurenSouResponsavelPor(atorFim)) await naurenAplicarEfeitosPeriodicos(atorFim, "fimTurnoPortador").catch(falha("periódicos: fim do turno do portador"));
    }
    for (const actor of atores) {
      if (!naurenSouResponsavelPor(actor)) continue;
      await naurenProcessarGatilhos("fimTurnoQualquer", actor).catch(falha("gatilhos: fim de qualquer turno"));
      await naurenAplicarEfeitosPeriodicos(actor, "fimTurnoQualquer").catch(falha("periódicos: fim de qualquer turno"));
    }
    if (souGM) await naurenProcessarTemplatesPersistentes("fimTurno").catch(falha("templates: fim do turno"));
    if (souGM) await naurenLimparAreasInstantaneas().catch(falha("áreas instantâneas"));
  }

  // 2. Virada da rodada
  if (novaRodada) {
    if (houveRodadaAnterior) {
      for (const actor of atores) {
        if (!naurenSouResponsavelPor(actor)) continue;
        await naurenProcessarGatilhos("fimRodada", actor).catch(falha("gatilhos: fim da rodada"));
        await naurenProcessarEmanacoes("fimRodada", actor).catch(falha("emanações: fim da rodada"));
        await naurenAplicarEfeitosPeriodicos(actor, "fimRodada").catch(falha("periódicos: fim da rodada"));
      }
      if (souGM) await naurenProcessarTemplatesPersistentes("fimRodada").catch(falha("templates: fim da rodada"));
    }
    for (const actor of atores) {
      if (!naurenSouResponsavelPor(actor)) continue;
      // Ordem do início da rodada, toda na máquina do responsável pelo personagem:
      // 1) recupera a Estamina; 2) recarrega usos e recursos por rodada; 3) auras que tiram Estamina;
      // 4) gatilhos e emanações de início da rodada; 5) efeitos periódicos; 6) durações das Condições.
      if (actor.system?.bonus) {
        if (actor.system.recuperarEstaminaPorRodada !== false) {
          const max = actor.system.estaminaCombate?.max ?? 0;
          if (actor.system.estaminaCombate?.value !== max) {
            await actor.update({ "system.estaminaCombate.value": max }).catch(falha("estamina por rodada"));
          }
        }
        await naurenExpirarEscudo(actor, combate).catch(falha("escudo com duração"));
        await naurenRecarregarUsos(actor, "rodada").catch(falha("usos por rodada"));
        await naurenResetarRecursosCustomNoEscopo(actor, "rodada").catch(falha("recursos por rodada"));
        await naurenAurasDeEstaminaSobreMim(actor).catch(falha("auras de Estamina"));
        await naurenProcessarGatilhos("inicioRodada", actor).catch(falha("gatilhos: início da rodada"));
        await naurenProcessarEmanacoes("inicioRodada", actor).catch(falha("emanações: início da rodada"));
      }
      await naurenAplicarEfeitosPeriodicos(actor, "inicioRodada").catch(falha("periódicos: início da rodada"));
      await naurenAvancarDuracoesCondicoes(actor, "inicioRodada", ctx).catch(falha("durações: início da rodada"));
    }
    if (souGM) await naurenProcessarTemplatesPersistentes("inicioRodada").catch(falha("templates: início da rodada"));
  }

  // Áreas de "início do turno" vêm antes dos efeitos periódicos: quem está
  // na área recebe o acúmulo e EM SEGUIDA sofre o efeito dele (Névoa de
  // Esporos: "recebem 1 acúmulo... em seguida, 1d4 por acúmulo").
  if (atorDoTurno && souGM) await naurenProcessarTemplatesPersistentes("inicioTurno", atorDoTurno, combatenteAtualId).catch(falha("templates: início do turno"));

  // 3. Início de qualquer turno
  for (const actor of atores) {
    if (!naurenSouResponsavelPor(actor)) continue;
    if (actor.system?.bonus) {
      await naurenRecarregarUsos(actor, "turno").catch(falha("usos por turno"));
      if (actor.getFlag?.("nauren", "escudoExpira")?.turnoDe) await naurenExpirarEscudo(actor, combate).catch(falha("escudo até o próximo turno"));
      await naurenResetarRecursosCustomNoEscopo(actor, "turno").catch(falha("recursos por turno"));
      await naurenProcessarGatilhos("inicioTurnoQualquer", actor).catch(falha("gatilhos: início de qualquer turno"));
    }
    await naurenAplicarEfeitosPeriodicos(actor, "inicioTurnoQualquer").catch(falha("periódicos: início de qualquer turno"));
    await naurenAvancarDuracoesCondicoes(actor, "inicioTurnoQualquer", ctx).catch(falha("durações: início de qualquer turno"));
  }

  // 4. Início do turno do portador (Bando: de cada lacaio vivo do grupo)
  for (const atorIni of naurenAtoresDoTurno(atorDoTurno)) {
    if (naurenSouResponsavelPor(atorIni)) {
      await naurenRecarregarUsos(atorIni, "meuTurno").catch(falha("usos do meu turno"));
      await naurenResetarRecursosCustomNoEscopo(atorIni, "meuTurno").catch(falha("recursos do meu turno"));
      await naurenGravarMemoriaVida(atorIni, combate).catch(falha("memória de Vida"));
      await naurenProcessarGatilhos("inicioTurno", atorIni).catch(falha("gatilhos: início do meu turno"));
      await naurenProcessarEmanacoes("inicioTurno", atorIni).catch(falha("emanações: início do turno"));
      await naurenProcessarEmanacoesSobre(atorIni).catch(falha("emanações: quem começa o turno na área"));
    }
    if (naurenSouResponsavelPor(atorIni)) {
      await naurenAplicarEfeitosPeriodicos(atorIni, "inicioTurnoPortador").catch(falha("periódicos: início do turno do portador"));
      await naurenAvancarDuracoesCondicoes(atorIni, "inicioTurnoPortador", ctx).catch(falha("durações: início do turno do portador"));
    }
  }

  // 5. Perguntas ao jogador (0.88.6: ficam por último). Antes vinham primeiro: uma janela de
  // "manter o voo?" ou "sustentar?" sem resposta segurava a recuperação de Estamina, os usos por
  // rodada e as durações de todo mundo desta máquina.
  // Voo: manter voando custa 1 Estamina (ou 1 Mana, se mágico) por turno.
  if (atorDoTurno && atorDoTurno !== atorDoTurnoAnterior && naurenSouResponsavelPor(atorDoTurno)) {
    for (const cv of atorDoTurno.items.filter(i => i.type === "condicao" && i.system.ativo !== false && i.system.vooCusto)) {
      // 0.94.2 (G12): o voo pode ser pago com qualquer recurso ("recursoCustom:pdi" nas Botas do Inventor).
      const specV = cv.system.vooCusto === "mana" ? "mana" : (cv.system.vooCusto === "estamina" ? "estaminaCombate" : cv.system.vooCusto);
      const recV = naurenRecursoDoAtor(atorDoTurno, specV);
      const nomeR = recV?.nome ?? specV, tem = recV?.valor ?? 0;
      const manter = tem >= 1 && await foundry.applications.api.DialogV2.confirm({ window: { title: cv.name }, content: `<p>Manter o voo (<b>${cv.name}</b>)? Custa 1 de ${nomeR} (você tem ${tem}).</p>`, yes: { label: "Manter" }, no: { label: "Pousar" }, rejectClose: false }).catch(() => false);
      if (manter) { await naurenConcederRecurso(atorDoTurno, specV, "-1", cv); naurenPostarCard({ ator: atorDoTurno, titulo: cv.name, icone: cv.img, fonte: "Voo", linhas: [{ label: "Manteve o voo", value: `−1 de ${nomeR}` }] }).catch(() => {}); }
      else { await cv.delete().catch(() => {}); naurenPostarCard({ ator: atorDoTurno, titulo: cv.name, icone: cv.img, fonte: "Voo", linhas: [{ label: "Pousou", value: tem >= 1 ? "escolheu pousar" : `sem ${nomeR}` }] }).catch(() => {}); }
    }

  }
  // Sustentações: aparecem a cada turno de qualquer combatente.
  for (const atorS of atores ?? []) {
    if (atorS.items?.some(i => i.type === "condicao" && i.getFlag("nauren", "sustentacao")) && naurenSouResponsavelPor(atorS)) {
      await naurenProcessarSustentacoes(atorS).catch(falha("sustentação"));
    }
  }

}

/**
 * Zera o VALOR ATUAL (não remove a barra) de todo Recurso Customizado
 * cuja DECLARAÇÃO (Classe/Subclasse/Habilidade) tenha "resetarNoEscopo"
 * igual ao "escopo" passado ("combate" ou "rodada") - ex: Determinação/
 * Ofuscação (Empíreo), Pontos Elevados (Elevar a Dualidade), Penitências
 * no Combate (Sacerdote), Pontos de Poesia da Chuva (Místico) usam
 * "combate"; Instinto de Sobrevivência (Caçador) usa "rodada".
 */
async function naurenResetarRecursosCustomNoEscopo(actor, escopo) {
  if (!actor?.items) return;
  const declaracoes = actor.items
    .filter(i => i.type === "classe" || i.type === "subclasse" || i.type === "habilidade")
    .flatMap(i => i.system.recursosDeclarados ?? []);
  const idsParaZerar = new Set(declaracoes.filter(d => d.resetarNoEscopo === escopo).map(d => d.chaveInterna));
  if (!idsParaZerar.size) return;
  const lista = foundry.utils.deepClone(actor.system.recursosCustom ?? []);
  let mudou = false;
  const sairamDoMaximo = [];
  for (const r of lista) {
    if (idsParaZerar.has(r.chaveInterna) && (r.valor ?? 0) !== 0) {
      if ((r.max ?? 0) > 0 && (r.valor ?? 0) >= r.max) sairamDoMaximo.push({ r: { ...r }, antigo: r.valor });
      r.valor = 0;
      mudou = true;
    }
  }
  if (mudou) await actor.update({ "system.recursosCustom": lista });
  // Quem estava no máximo perde a Condição que o máximo dava (ex.: a
  // Profusão do Empíreo termina junto com o combate).
  for (const { r, antigo } of sairamDoMaximo) await naurenChecarCondicaoAoAtingirMax(actor, r.id, r, antigo, 0).catch(() => {});
}

/**
 * Fim do combate: limpa o "orçamento" de movimento em memória (bug corrigido
 * - antes ficava um resíduo por ator entre combates, cobrando Estamina de
 * movimento indevida na luta seguinte) e recarrega os "Usos" de Ação com
 * escopo "cena" de quem participou da luta.
 */
Hooks.on("deleteCombat", (combat) => {
  naurenMovimentoEmCombate.clear();
  naurenRelogioUltimoVisto.delete(combat.id);
  // Escudos com duração terminam com o combate (na máquina do responsável por cada um).
  for (const c of combat.combatants ?? []) if (c.actor && naurenSouResponsavelPor(c.actor)) naurenExpirarEscudo(c.actor, null, true).catch(() => {});
  if (game.users.activeGM === game.user) naurenLimparAreasInstantaneas().catch(() => {});
  if (game.users.activeGM === game.user) for (const cena of game.scenes) { // só o Mestre principal (dois Mestres apagavam em dobro)
    const ids = cena.regions.filter(r => r.getFlag("nauren", "tracoAquarela")).map(r => r.id);
    if (ids.length) cena.deleteEmbeddedDocuments("Region", ids).catch(() => {});
  }
  for (const combatant of combat.combatants) {
    if (combatant.actor && naurenSouResponsavelPor(combatant.actor)) {
      // Armas conjuradas (Espada Lunar: "dura 1 cena de combate") somem com o combate, com card.
      const conjuradas = combatant.actor.items.filter(i => i.type === "arma" && i.getFlag("nauren", "armaConjuradaDe"));
      if (conjuradas.length) {
        combatant.actor.deleteEmbeddedDocuments("Item", conjuradas.map(i => i.id)).then(() => naurenPostarCard({ ator: combatant.actor, titulo: "Fim do combate", icone: conjuradas[0].img, fonte: "Arma conjurada",
          linhas: [{ label: "Desfeita", value: conjuradas.map(i => i.name).join(", ") }] })).catch(err => console.warn("Nauren RPG | arma conjurada", err));
      }
      for (const aU of naurenAtoresDoTurno(combatant.actor).concat(naurenBandoMembros(combatant.actor, { vivos: false }).map(t => t.actor).filter(Boolean))) {
        if (aU._naurenFimCombateFeito === combat.id) continue;
        aU._naurenFimCombateFeito = combat.id;
        naurenRecarregarUsos(aU, "cena").catch(err => console.warn("Nauren RPG | Falha ao recarregar usos por cena.", err));
        naurenResetarRecursosCustomNoEscopo(aU, "combate").catch(err => console.warn("Nauren RPG | Falha ao zerar recursos de fim de combate.", err));
      }
    }
  }
});

/**
 * Aplica os Efeitos Periódicos das Condições ativas de um ator: soma a
 * fórmula uma vez por acúmulo quando "aumentaPorAcumulo" está marcado, e
 * altera o recurso certo (Dano/Cura tiram ou dão Vida; Estamina/Mana somam
 * a fórmula direto - use um valor negativo pra remover, ex: "-1"). Tudo
 * aplicado numa única atualização por ator, com uma nota no chat.
 * "momento" é um dos NAUREN_MOMENTOS_PERIODICOS (ver Relógio de Combate):
 * só os efeitos configurados para esse momento disparam.
 */
async function naurenAplicarEfeitosPeriodicos(actor, momento) {
  if (!actor?.system?.vida) return;
  const condicoes = actor.items.filter(i => i.type === "condicao" && i.system.ativo && (i.system.efeitosPeriodicos ?? []).length);
  if (!condicoes.length) return;

  // Auditável (ver diretriz do usuário): sempre mostra o dado rolado e a
  // fórmula completa, não só o total final. Bug real corrigido: isto
  // virava texto solto agregado num único ChatMessage.create - agora
  // linhas estruturadas (label/value/breakdown), postadas como o MESMO
  // card de chat "HUD azul" que qualquer outra rolagem no sistema usa
  // (ver _postRollCard) - vale pra Sangramento, Queimando, Envenenamento,
  // e qualquer efeito periódico configurado, não só Bomba Cronometrada.
  const secondaryLines = [];
  let deltaVida = 0, deltaEstamina = 0, deltaMana = 0;
  let instanciasDano = 0; // cada acúmulo de uma Condição "por acúmulo" é um dano separado
  let danoBrutoPeriodico = 0; // dano das Condições (já com a Redução fixa por acúmulo); percentual e escudo no fim
  const removerDepois = new Set(); // Condições com "remover depois de aplicar" (ex.: Envenenamento)
  const curaParaOrigem = new Map(); // Fase 4 (M05): dano periódico que cura quem aplicou -> actor => { actor, valor, nomes }
  for (const cond of condicoes) {
    const acumulos = cond.system.acumulativel ? Math.max(1, cond.system.acumulos || 1) : 1;
    // Ator de referência pra resolver "@poderMagia"/"@espirito"/etc na
    // fórmula abaixo - SEMPRE quem CONCEDEU a Condição (ver
    // conjuradorUuid no schema), não quem a está sofrendo/recebendo.
    // Cai pro próprio "actor" (comportamento antigo) se não tiver
    // conjurador salvo (Condições feitas à mão) ou se o Token/Ator
    // dele não existir mais (ex: foi deletado da cena).
    const conjuradorTokenOuAtor = cond.system.conjuradorUuid ? await fromUuid(cond.system.conjuradorUuid).catch(() => null) : null;
    const atorParaTokens = conjuradorTokenOuAtor?.actor ?? conjuradorTokenOuAtor ?? actor;
    for (const ef of cond.system.efeitosPeriodicos ?? []) {
      if (naurenMomentoEfeitoPeriodico(ef, cond) !== momento) continue;
      // "Por Rank" (se configurado) troca a fórmula inteira ANTES de
      // qualquer outra coisa - usa o rank DESTA instância (copiado do item
      // que concedeu, via "copiarRankDoItem" em Condições Aplicadas - ver
      // NaurenAlvoHelper.aplicarCondicao). Sem cópia de rank, rankAtual
      // fica 0 e porRank nunca entra em ação (comportamento clássico).
      const formulaPorRank = naurenResolverPorRank(ef.porRank, cond.system.rankAtual ?? 0, "formula");
      // Substitui @poderMagia/@vitalidade/etc ANTES de rolar - "new Roll"
      // sozinho não resolve "@token" sem um "data" explícito (que não
      // temos aqui, já que o valor pode vir de fórmulas arbitrárias tipo
      // "@poderMagia"). Mesmo mecanismo usado em naurenInterpretarModificador.
      // Bug real corrigido: resolvia contra "actor" (quem TEM a
      // Condição, ex: o alvo curado) em vez de "atorParaTokens" (quem a
      // CONCEDEU) - Infusão Floral (Druida) com "1d4+@poderMagia" usava
      // o Poder de Magia do alvo curado, não do Druida que lançou.
      const formulaBruta = (formulaPorRank || ef.formula || "0").trim() || "0";
      let formula = formulaBruta.replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, atorParaTokens)));
      // Bônus de quem aplicou (ex.: Técnica Suja no Sangramento/Hemorragia).
      const bonusConj = ef.recurso === "dano" && conjuradorTokenOuAtor ? naurenBonusDanoPeriodico(atorParaTokens, cond.name, cond) : { valor: 0 };
      if (bonusConj.substituir) formula = bonusConj.substituir;
      const formulaSemBonus = formula;
      if (bonusConj.valor) formula = `(${formula} + ${bonusConj.valor})`;
      const vezes = ef.aumentaPorAcumulo ? acumulos : 1;
      // Sem parênteses (removidos - "naurenRollToBreakdownText" abaixo
      // não sabia lidar com eles, e são desnecessários aqui: "+" já é
      // associativo o suficiente pra somar a fórmula "vezes" vezes).
      const formulaCompleta = Array(vezes).fill(formula).join(" + ");
      let valor = 0;
      let roll = null;
      let breakdownPorAcumulo = "";
      try {
        roll = await new Roll(formulaCompleta).evaluate(ef.forcarMaximo ? { maximize: true } : undefined);
        valor = roll.total;
        // Dano por acúmulo: cada acúmulo é um dano separado - a Redução de Dano fixa vale em CADA um.
        const reducaoFixa = ef.recurso === "dano" ? Math.max(0, (actor.system.reducaoDanoTotal ?? 0) - (actor.system.reducaoDanoAtaqueTotal ?? 0)) : 0;
        if (ef.recurso === "dano" && reducaoFixa > 0) {
          const partes = [];
          let soma = 0;
          for (let n = 0; n < vezes; n++) {
            const r = await new Roll(formula).evaluate(ef.forcarMaximo ? { maximize: true } : undefined);
            const v = Math.max(0, r.total - reducaoFixa);
            soma += v; partes.push(`${r.total}−${reducaoFixa}=${v}`);
          }
          valor = soma;
          breakdownPorAcumulo = `${vezes > 1 ? `${vezes} danos: ` : ""}${partes.join(", ")} (Redução de Dano ${reducaoFixa} em cada)`;
        }
      } catch (err) {
        console.warn(`Nauren RPG | Fórmula de efeito periódico inválida em "${cond.name}": ${formula}`, err);
        continue;
      }
      if (ef.removerCondicaoApos) removerDepois.add(cond);
      if (ef.recurso === "dano") instanciasDano += vezes;
      if (!valor) continue;
      let breakdown = breakdownPorAcumulo || naurenRollToBreakdownText(roll);
      // Sem dados: "3 acúmulos × (1 + 3 Técnica Suja) = 12" em vez de "1 + 3 + 1 + 3 + 1 + 3".
      const semDados = !breakdownPorAcumulo && !(roll?.dice?.length);
      if (semDados && (vezes > 1 || bonusConj.valor)) {
        const umTexto = bonusConj.valor ? `(${formulaSemBonus} + ${bonusConj.fontes.map(f => String(f).replace(/^(.*) \+(\d+)$/, "$2 $1")).join(" + ")})` : formulaSemBonus;
        breakdown = vezes > 1 ? `${vezes} acúmulos × ${umTexto} = ${valor}` : `${umTexto} = ${valor}`;
      }
      if (ef.recurso === "dano") {
        danoBrutoPeriodico += valor; secondaryLines.push({ label: cond.name, value: -valor, breakdown: (bonusConj.valor || bonusConj.substituir) && !semDados ? `${breakdown} • ${bonusConj.fontes.join(", ")} (por acúmulo)` : breakdown });
        if (cond.system.periodicoCuraOrigem && atorParaTokens && atorParaTokens !== actor && atorParaTokens.system?.vida) {
          const reg = curaParaOrigem.get(atorParaTokens.uuid) ?? { actor: atorParaTokens, valor: 0, nomes: new Set() };
          reg.valor += valor; reg.nomes.add(cond.name); curaParaOrigem.set(atorParaTokens.uuid, reg);
        }
      }
      else if (ef.recurso === "cura") { const aj = NaurenAlvoHelper.ajustarCuraRecebida(actor, valor); deltaVida += aj.cura; secondaryLines.push({ label: cond.name, value: aj.cura, breakdown: aj.cortada ? `${breakdown} • cura reduzida −${aj.cortada} (${aj.fontes?.join(", ") || "Condição"})` : breakdown }); }
      else if (ef.recurso === "estamina") { deltaEstamina += valor; secondaryLines.push({ label: cond.name, value: valor, breakdown }); }
      else if (ef.recurso === "mana") { deltaMana += valor; secondaryLines.push({ label: cond.name, value: valor, breakdown }); }
      else if (ef.recurso === "acumuloProprio") {
        // Acúmulo Próprio (ex: Bomba Cronometrada - "1 acúmulo no
        // início de cada turno") - em vez de causar dano/cura/recurso,
        // soma "valor" aos PRÓPRIOS acúmulos desta Condição (até
        // acumulosMax, o teto absoluto). O limiar de disparo (dano/
        // Condição/remoção) é checado pela função COMPARTILHADA (ver
        // naurenChecarLimiarEfeitoDireto) - mesma usada pelo clique
        // manual +/- e pela reaplicação via Magia/Habilidade.
        const atualAcumulo = cond.system.acumulos ?? 1;
        const maxAcumulo = cond.system.acumulosMax || 99;
        const novoAcumulo = Math.min(atualAcumulo + valor, maxAcumulo);
        if (novoAcumulo !== atualAcumulo) await cond.update({ "system.acumulos": novoAcumulo });
        secondaryLines.push({ label: `${cond.name} (acúmulos)`, value: `${novoAcumulo}/${maxAcumulo}`, breakdown });
        await naurenChecarLimiarEfeitoDireto(cond, actor, atualAcumulo, novoAcumulo);
      }
      else secondaryLines.push({ label: cond.name, value: valor, breakdown });
    }
  }
  if (!secondaryLines.length) return;

  // Dano das Condições: Redução percentual sobre o total, escudo absorve antes da Vida,
  // e Condições que saem ao sofrer dano (Engolir o Golpe, Silêncio) são consumidas - como num ataque.
  let escudoAtualizado = null;
  if (danoBrutoPeriodico > 0) {
    let aposPercentual = NaurenAlvoHelper.aplicarReducaoPercentual(actor, danoBrutoPeriodico);
    // Condições que cortam o dano recebido em % (ex.: Instinto de Sobrevivência: "metade do dano de qualquer fonte").
    const condsPct = actor.items.filter(i => i.type === "condicao" && i.system.ativo !== false && (i.system.danoRecebidoPercentual || 0) > 0);
    const pctCond = Math.min(100, condsPct.reduce((t, i) => t + i.system.danoRecebidoPercentual, 0));
    if (pctCond > 0 && aposPercentual > 0) {
      const antesPct = aposPercentual;
      aposPercentual = Math.max(0, Math.floor(aposPercentual * (1 - pctCond / 100)));
      secondaryLines.push({ label: `Dano recebido −${pctCond}%`, value: `${antesPct} → ${aposPercentual}`, breakdown: condsPct.map(i => i.name).join(", ") });
    }
    const { escudoConsumido, danoNaVida, escudoRestante } = NaurenAlvoHelper.calcularDanoComEscudo(actor, aposPercentual);
    if (escudoConsumido > 0) { escudoAtualizado = escudoRestante; secondaryLines.push({ label: "Escudo", value: `absorveu ${escudoConsumido}`, breakdown: "" }); }
    if (aposPercentual !== danoBrutoPeriodico) secondaryLines.push({ label: "Redução de dano", value: `${danoBrutoPeriodico} → ${aposPercentual}`, breakdown: "percentual" });
    deltaVida -= danoNaVida;
    await NaurenAlvoHelper.consumirAoSofrerDano(actor, danoBrutoPeriodico).catch(() => {});
  }
  const atualizacao = {};
  if (escudoAtualizado !== null) atualizacao["system.escudo.value"] = escudoAtualizado;
  if (deltaVida) atualizacao["system.vida.value"] = Math.max(0, Math.min(actor.system.vida.max, actor.system.vida.value + deltaVida));
  if (deltaEstamina) atualizacao["system.estaminaCombate.value"] = Math.max(0, Math.min(actor.system.estaminaCombate.max, actor.system.estaminaCombate.value + deltaEstamina));
  if (deltaMana) atualizacao["system.mana.value"] = Math.max(0, Math.min(actor.system.mana.max, actor.system.mana.value + deltaMana));
  if (Object.keys(atualizacao).length) await actor.update(atualizacao, { naurenOrigemCombate: true });
  // Fase 4 (M05): quem aplicou recupera o dano drenado (ex.: Parasita Interno) - auditável nos dois cards.
  for (const reg of curaParaOrigem.values()) {
    const aj = NaurenAlvoHelper.ajustarCuraRecebida(reg.actor, reg.valor);
    const vidaO = reg.actor.system.vida.value, maxO = reg.actor.system.vida.max;
    const nova = Math.max(0, Math.min(maxO, vidaO + aj.cura));
    if (nova !== vidaO) await NaurenAlvoHelper.atualizarAtorSeguro(reg.actor, { "system.vida.value": nova }, { naurenOrigemCombate: true });
    const nomes = [...reg.nomes].join(", ");
    secondaryLines.push({ label: `${reg.actor.name} drenou`, value: `curou +${nova - vidaO}`, breakdown: `${nomes}: o dano drenado cura quem aplicou${aj.cortada ? ` (cura reduzida −${aj.cortada})` : ""}` });
    // Sem Vida atual/máxima no card (informação que os jogadores não têm): só quanto curou e de onde.
    naurenPostarCard({ ator: reg.actor, titulo: "Drenou Vida", icone: reg.actor.img, fonte: nomes,
      linhas: [{ label: `Drenou Vida de ${actor.name}`, value: `curou +${nova - vidaO}`, breakdown: `${nomes}: ${reg.valor} de dano periódico${aj.cortada ? ` • cura reduzida −${aj.cortada} (${aj.fontes?.join(", ") || "Condição"})` : ""}` }] }).catch(() => {});
  }
  if (danoBrutoPeriodico > 0 && instanciasDano > 0) {
    naurenProcessarGatilhos("aliadoSofreuDano", actor, { instancias: instanciasDano, origem: "condicao" }).catch(err => console.warn("Nauren RPG | gatilhos (dano de Condição)", err));
    naurenProcessarGatilhos("euSofriDano", actor, { instancias: instanciasDano, origem: "condicao" }).catch(err => console.warn("Nauren RPG | gatilhos (dano de Condição)", err));
  }
  for (const cond of removerDepois) {
    if (!actor.items.get(cond.id)) continue;
    await cond.delete().catch(() => {});
    secondaryLines.push({ label: cond.name, value: "saiu", breakdown: "efeito aplicado; os acúmulos são removidos" });
  }
  // Venenos de golpe corpo-a-corpo: o efeito acontece uma vez e esses acúmulos saem.
  for (const cond of actor.items.filter(i => i.type === "condicao" && !removerDepois.has(i) && (i.getFlag("nauren", "acumulosCurtos") ?? 0) > 0)) {
    if (!secondaryLines.some(l => l.label === cond.name)) continue;
    const curtos = cond.getFlag("nauren", "acumulosCurtos");
    const resta = Math.max(0, (cond.system.acumulos ?? 1) - curtos);
    if (resta <= 0) await cond.delete().catch(() => {});
    else { await cond.update({ "system.acumulos": resta, "flags.nauren.-=acumulosCurtos": null }).catch(() => {}); }
    secondaryLines.push({ label: cond.name, value: resta <= 0 ? "saiu" : `−${curtos} acúmulo(s)`, breakdown: "veneno de golpe corpo-a-corpo: efeito único" });
  }

  // Público (não whisper) - diretriz do usuário: qualquer coisa com dado
  // que afete um jogador (dano/cura/buff/debuff de Condição) precisa ser
  // auditável pro grupo inteiro, não só pro dono da ficha.
  await actor.sheet?._postRollCard?.({
    title: `Efeitos de Condições — ${(NAUREN_MOMENTOS_PERIODICOS[momento] ?? momento).toLowerCase()}`,
    icon: actor.img, d20Result: null, secondaryLines
  });
}


// 0.94.31: Ícone da Condição no token foi para modulos/icone-condicao-token.mjs.


export { naurenAplicarEfeitosPeriodicos, naurenAtaqueBasicoNaReacao, naurenConferirMestreDaMesa, naurenEnfileirarRelogio, naurenFilaRelogio, naurenLimparAreasInstantaneas, naurenMestreDaMesa, naurenProcessarSustentacoes, naurenRelogioPosicaoMaxima, naurenRelogioProcessarTransicao, naurenRelogioUltimoVisto, naurenResetarRecursosCustomNoEscopo, naurenSouResponsavelPor, naurenUsuarioResponsavel };
