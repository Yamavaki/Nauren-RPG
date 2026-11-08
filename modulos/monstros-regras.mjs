/* Nauren RPG — Regras do Criador de Monstros (travas, invocar, movimento sem Prioridade). Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { naurenAcaoEhGolpe, naurenApagarItensSeExistirem, naurenEhCondicaoModelo, naurenEhItem, naurenNomeDeToken } from "./entidades-campo.mjs";
import { naurenInterpretarModificador, naurenMedirDistanciaBordas, naurenPostarCard } from "../nauren.mjs";
import { naurenAndarParaToken, naurenMesmoAndar } from "./andares.mjs";
import { NaurenAlvoHelper, NaurenRegionHelper } from "./ficha-ator.mjs";
import { naurenAplicarEfeitoTemplatePersistente, naurenAtualizarCondicaoPresenca, naurenCelulasNaArea, naurenColetarGatilhosTemplatePersistenteExternos, naurenPontoDentroDaRegiao, naurenTokenElegivelPorDisposicao } from "./icone-condicao-token.mjs";
import { naurenOperarRegistroPrioridade } from "./prioridades.mjs";
import { naurenAjustarTamanhoAura } from "./animacoes.mjs";


// 0.94.31: Borda do token (Dynamic Token Ring) foi para modulos/borda-token.mjs.

/* ===================== FASE 5 (Criador de Monstros): travas (M11) =====================
 * Condições ativas podem travar: Ações com custo de Mana (Emudecido), testes de ataque
 * (forma fechada, névoa), o Contra-Ataque (Hesitante) e receber Prioridade (de aliados ou de todos).
 * ===================================================================================== */
function naurenCondicoesAtivas(actor) {
  return (actor?.items ?? []).filter(i => i.type === "condicao" && i.system.ativo !== false && !naurenEhCondicaoModelo(i));
}

/** A Ação custa Mana? (custo fixo ou tabela por nível) */
function naurenAcaoCustaMana(acao) {
  return (Number(acao?.custoMana) || 0) > 0 || (acao?.custoManaPorNivel ?? []).some(n => (Number(n?.valor ?? n?.custo) || 0) > 0);
}

/** Motivo pelo qual a Ação está travada por uma Condição, ou null. { texto, fontes } */
function naurenTravaDaAcao(actor, acao, item = null) {
  if (!actor || !acao) return null;
  const conds = naurenCondicoesAtivas(actor);
  const hab = (item?.type === "habilidade" || item?.type === "magia") && !acao.usaDarPrioridade ? conds.filter(c => c.system.travaHabilidades) : [];
  if (hab.length) return { texto: "não pode usar Habilidades nem Magias", fontes: hab.map(c => c.name) };
  const semMana = naurenAcaoCustaMana(acao) ? (actor.items ?? []).filter(i => (i.system?.capacidades ?? []).includes("semMana") && i.system?.ativo !== false) : [];
  if (semMana.length) return { texto: "não usa Mana (e não pode usar Ações que custam Mana)", fontes: semMana.map(i => i.name) };
  const mana = naurenAcaoCustaMana(acao) ? conds.filter(c => c.system.travaAcoesMana) : [];
  if (mana.length) return { texto: "não pode usar Ações que custam Mana", fontes: mana.map(c => c.name) };
  const atq = (acao.ehAtaque || naurenAcaoEhGolpe(acao)) ? conds.filter(c => c.system.travaAtaques) : [];
  if (atq.length) return { texto: "não pode atacar", fontes: atq.map(c => c.name) };
  return null;
}

/** Este ator pode receber Prioridade de quem concede? Devolve a Condição que impede, ou null. */
function naurenTravaPrioridade(actor, deMesmoLado) {
  return naurenCondicoesAtivas(actor).find(c => c.system.naoRecebePrioridade === "todos" || (deMesmoLado && c.system.naoRecebePrioridade === "aliados")) ?? null;
}


/* ===================== FASE 5 (Criador de Monstros): invocar ficha (M10) =====================
 * Põe tokens de uma ficha (ou cópias de quem usou) em casas livres em volta e na iniciativa,
 * logo depois de quem invocou. Roda no Mestre (jogadores pedem por query).
 * ========================================================================================== */
const NAUREN_PASTA_INVOCACOES = "Nauren — Invocações";


/** Casas livres (canto superior esquerdo, px) em anéis em volta do token, até "raioCasas". */
function naurenCasasLivresEmVolta(cena, tokenDoc, larguraCasas, alturaCasas, quantidade, raioCasas) {
  const g = cena.grid.size;
  const ocupados = cena.tokens.filter(t => !t.hidden && naurenMesmoAndar(t, tokenDoc)).map(t => ({ x1: t.x, y1: t.y, x2: t.x + t.width * g, y2: t.y + t.height * g }));
  const livres = [];
  const cabe = (x, y) => {
    if (x < 0 || y < 0 || x + larguraCasas * g > cena.dimensions.width || y + alturaCasas * g > cena.dimensions.height) return false;
    const r = { x1: x, y1: y, x2: x + larguraCasas * g, y2: y + alturaCasas * g };
    return ![...ocupados, ...livres.map(p => ({ x1: p.x, y1: p.y, x2: p.x + larguraCasas * g, y2: p.y + alturaCasas * g }))]
      .some(o => r.x1 < o.x2 && r.x2 > o.x1 && r.y1 < o.y2 && r.y2 > o.y1);
  };
  const tw = tokenDoc.width, th = tokenDoc.height;
  for (let anel = 1; anel <= Math.max(1, raioCasas) && livres.length < quantidade; anel++) {
    const candidatos = [];
    for (let dx = -anel - larguraCasas + 1; dx <= tw + anel - 1; dx++) {
      for (let dy = -anel - alturaCasas + 1; dy <= th + anel - 1; dy++) {
        const naBorda = dx === -anel - larguraCasas + 1 || dx === tw + anel - 1 || dy === -anel - alturaCasas + 1 || dy === th + anel - 1;
        if (naBorda) candidatos.push({ x: tokenDoc.x + dx * g, y: tokenDoc.y + dy * g, d: Math.hypot(dx, dy) });
      }
    }
    candidatos.sort((a, b) => a.d - b.d);
    for (const c of candidatos) { if (livres.length >= quantidade) break; if (cabe(c.x, c.y)) livres.push({ x: c.x, y: c.y }); }
  }
  return livres;
}


/** Ficha a usar: do mundo direto; do compêndio, importada uma vez para a pasta de Invocações. */
async function naurenAtorParaInvocar(uuid) {
  const doc = await fromUuid(uuid).catch(() => null);
  if (!doc || doc.documentName !== "Actor") return null;
  if (!doc.pack) return doc;
  const ja = game.actors.find(a => a.getFlag("nauren", "invocacaoOrigem") === uuid);
  if (ja) return ja;
  let pasta = game.folders.find(f => f.type === "Actor" && f.name === NAUREN_PASTA_INVOCACOES);
  if (!pasta) pasta = await Folder.create({ name: NAUREN_PASTA_INVOCACOES, type: "Actor", color: "#3a5a4a" });
  const dados = game.actors.fromCompendium(doc);
  dados.folder = pasta.id;
  foundry.utils.setProperty(dados, "flags.nauren.invocacaoOrigem", uuid);
  const [novo] = await Actor.createDocuments([dados]);
  return novo;
}


/** Cria as invocações (no Mestre). dados: { tokenUuid, atorUuid, copiaDeMim, dividirVida, quantidade, raioCasas, naIniciativa, fonte } */
async function naurenCriarInvocacoes(dados) {
  const origemTok = await fromUuid(dados.tokenUuid).catch(() => null);
  const cena = origemTok?.parent;
  if (!origemTok || !cena) return { ok: false, motivo: "quem invocou não está no mapa" };
  let base = null, prontos = [];
  if (dados.copiaDeMim) {
    const t = origemTok.toObject(); delete t._id;
    t.actorLink = false; // a cópia tem Vida e Condições próprias
    prontos = [t];
  } else {
    const ator = await naurenAtorParaInvocar(dados.atorUuid);
    if (!ator) return { ok: false, motivo: "ficha não encontrada" };
    base = ator;
    const td = (await ator.getTokenDocument({ disposition: origemTok.disposition })).toObject(); delete td._id;
    prontos = [td];
  }
  const modelo = prontos[0];
  const qtd = Math.max(1, Math.min(20, dados.quantidade || 1));
  const casas = naurenCasasLivresEmVolta(cena, origemTok, modelo.width ?? 1, modelo.height ?? 1, qtd, dados.raioCasas || 2);
  if (!casas.length) return { ok: false, motivo: "sem espaço livre em volta" };
  const criar = casas.map(c => naurenAndarParaToken({ ...foundry.utils.deepClone(modelo), x: c.x, y: c.y, disposition: origemTok.disposition, hidden: false,
    flags: { ...(modelo.flags ?? {}), nauren: { ...(modelo.flags?.nauren ?? {}), invocadoPor: origemTok.uuid, surgir: true } } }, origemTok));
  const novos = [];
  for (const c of criar) { const [n] = await cena.createEmbeddedDocuments("Token", [c]); if (n) novos.push(n); } // um por vez: o nome numerado ("Lacaio 2", "3") sai certo
  // Cisão: a Vida atual é dividida (original fica com a metade de cima).
  let vidaTexto = "";
  if (dados.copiaDeMim && dados.dividirVida && novos.length) {
    const atual = origemTok.actor?.system?.vida?.value ?? 0;
    const partes = novos.length + 1;
    const cada = Math.floor(atual / partes);
    const original = atual - cada * novos.length;
    await origemTok.actor.update({ "system.vida.value": original }, { naurenOrigemCombate: true });
    for (const n of novos) await n.actor?.update({ "system.vida.value": cada }, { naurenOrigemCombate: true });
    vidaTexto = `a Vida atual foi dividida entre ${partes}`;
  }
  // Iniciativa: logo depois de quem invocou (mesmo valor menos um tiquinho, na ordem em que surgiram).
  let iniTexto = "";
  const combate = game.combat;
  if (dados.naIniciativa && combate) {
    const meu = combate.combatants.find(c => c.tokenId === origemTok.id && c.sceneId === cena.id);
    const base0 = meu?.initiative;
    const lista = novos.map((n, k) => ({ tokenId: n.id, sceneId: cena.id, actorId: n.actorId, hidden: false,
      initiative: Number.isFinite(base0) ? base0 - 0.01 * (k + 1) : null }));
    await combate.createEmbeddedDocuments("Combatant", lista).catch(err => console.warn("Nauren RPG | invocação na iniciativa", err));
    iniTexto = Number.isFinite(base0) ? `entra(m) logo depois de ${origemTok.name} na iniciativa` : "entrou no combate (role a iniciativa)";
  }
  const nomes = novos.map(n => n.name);
  const linhas = [{ label: "Surgiu", value: nomes.join(", "), breakdown: `em volta de ${origemTok.name}${base ? ` • ficha ${base.name}` : " • cópia"}` }];
  if (casas.length < qtd) linhas.push({ label: "Sem espaço", value: `${qtd - casas.length} não couberam`, breakdown: `até ${dados.raioCasas || 2} casa(s) em volta` });
  if (vidaTexto) linhas.push({ label: "Vida", value: "dividida", breakdown: vidaTexto });
  if (iniTexto) linhas.push({ label: "Iniciativa", value: iniTexto });
  await naurenPostarCard({ ator: origemTok.actor, titulo: dados.fonte || "Invocação", icone: base?.img ?? origemTok.texture?.src ?? origemTok.actor?.img, fonte: `Invocação de ${origemTok.name}`, linhas });
  return { ok: true, nomes };
}


/* ===================== FASE 4 (Criador de Monstros) =====================
 * M02 - Movimento sem Prioridade: Habilidade/Condição/Efeito/Peculiaridade com
 *       "movimentoSemPrioridadeMetros" cobre até N m por turno de aproximação sem Prioridade.
 * M05 - Condição ligada a quem aplicou (conjuradorUuid): sai se a origem se afasta ou cai,
 *       portador arrastado junto, modificadores que não valem contra a origem (Provocado),
 *       dano periódico que cura a origem (Parasita Interno).
 * ======================================================================== */
const naurenMovSemPrioridadeUsado = new Map();
 // actor.uuid -> metros já cobertos neste turno

/** Metros de "movimento sem Prioridade" disponíveis em um item (resolve @rank/@categoria/@nivel). */
function naurenMetrosSemPrioridadeDoItem(item, actor) {
  const bruto = String(item?.system?.movimentoSemPrioridadeMetros ?? "").trim();
  if (!bruto) return 0;
  const v = naurenInterpretarModificador(bruto, actor, item)?.valor;
  return Math.max(0, Number(v) || 0);
}


/** Fontes ativas de movimento sem Prioridade (item + metros), maior primeiro. */
function naurenFontesSemPrioridade(actor) {
  if (!actor) return [];
  return actor.items
    .filter(i => ["habilidade", "condicao", "efeito", "peculiaridade", "magia"].includes(i.type) && i.system.ativo !== false && !naurenEhCondicaoModelo(i)
      && (i.type !== "habilidade" && i.type !== "magia" ? true : !!i.system.ativo) && String(i.system.movimentoSemPrioridadeMetros ?? "").trim())
    .map(i => ({ item: i, metros: naurenMetrosSemPrioridadeDoItem(i, actor) }))
    .filter(f => f.metros > 0)
    .sort((a, b) => b.metros - a.metros);
}


/** Este trajeto ainda cabe nos metros sem Prioridade do turno? Consome e devolve a fonte, ou null. */
function naurenMovimentoSemPrioridade(actor, origem, destino) {
  const fontes = naurenFontesSemPrioridade(actor);
  if (!fontes.length) return null;
  let dist = 0;
  try { dist = canvas.grid.measurePath([origem, destino])?.distance ?? 0; } catch (err) { return null; }
  const usado = naurenMovSemPrioridadeUsado.get(actor.uuid) ?? 0;
  const fonte = fontes[0]; // vale a maior cobertura; não somam entre si
  if (fonte.metros >= 99) return { item: fonte.item, texto: "qualquer distância" };
  if (usado + dist > fonte.metros + 0.01) return null;
  naurenMovSemPrioridadeUsado.set(actor.uuid, usado + dist);
  return { item: fonte.item, texto: `${Math.round(usado + dist)} de ${fonte.metros}m neste turno` };
}


/** Quem aplicou a Condição, como { doc, actor, token } (token = TokenDocument na cena, se houver). */
function naurenOrigemDaCondicao(cond) {
  const uuid = cond?.system?.conjuradorUuid;
  if (!uuid) return null;
  let d = null;
  try { d = fromUuidSync(uuid); } catch (err) { d = null; }
  if (!d) return null;
  const actor = d.actor ?? d;
  let token = d.documentName === "Token" ? d : null;
  if (!token && actor?.getActiveTokens) token = actor.getActiveTokens(true, true)?.[0] ?? null;
  return { doc: d, actor, token };
}


/** O uuid de quem aplicou aponta para ESTE token/ator? */
function naurenUuidEhEsteToken(uuid, tokenDoc, actor = tokenDoc?.actor) {
  if (!uuid) return false;
  let d = null;
  try { d = fromUuidSync(uuid); } catch (err) { return false; }
  if (!d) return false;
  if (d.documentName === "Token") return tokenDoc ? d.uuid === tokenDoc.uuid : (d.actor?.uuid === actor?.uuid);
  const a = d.actor ?? d;
  if (!actor) return false;
  return a.uuid === actor.uuid || (!!tokenDoc?.actorLink && a.id === tokenDoc.actorId);
}


/** Condições de outros atores da cena cuja origem é este token/ator. */
function naurenCondicoesLigadasA(cena, tokenDoc, actor, filtro = () => true) {
  const lista = [];
  for (const t of cena?.tokens ?? []) {
    if (t === tokenDoc || !t.actor) continue;
    for (const c of t.actor.items) {
      if (c.type !== "condicao" || c.system.ativo === false || naurenEhCondicaoModelo(c)) continue;
      if (!filtro(c)) continue;
      if (naurenUuidEhEsteToken(c.system.conjuradorUuid, tokenDoc, actor)) lista.push({ token: t, actor: t.actor, cond: c });
    }
  }
  return lista;
}


/** Encerra a Condição e avisa no card, com o motivo. */
async function naurenEncerrarCondicaoLigada(actor, cond, fonte, breakdown) {
  if (!actor?.items?.has(cond.id)) return;
  await naurenApagarItensSeExistirem(actor, [cond.id]);
  naurenPostarCard({ ator: actor, titulo: "Condição encerrada", icone: "icons/magic/time/hourglass-tilted-gray.webp", fonte,
    linhas: [{ label: cond.name, value: "terminou", breakdown }] }).catch(() => {});
}


/** Confere, na cena, toda Condição com "sai se quem aplicou ficar a mais de N m". */
async function naurenChecarAfastamentoDaOrigem(cena) {
  if (!cena || game.users.activeGM !== game.user) return;
  for (const t of cena.tokens) {
    if (!t.actor) continue;
    for (const c of t.actor.items.filter(i => i.type === "condicao" && i.system.ativo !== false && !naurenEhCondicaoModelo(i) && (i.system.origemAfastaMetros || 0) > 0)) {
      const origem = naurenOrigemDaCondicao(c);
      const tokOrigem = origem?.token;
      if (!tokOrigem || tokOrigem.parent !== cena || tokOrigem === t) continue;
      const dist = naurenMedirDistanciaBordas(t, tokOrigem);
      if (dist > c.system.origemAfastaMetros + 0.01) {
        await naurenEncerrarCondicaoLigada(t.actor, c, `${origem.actor?.name ?? tokOrigem.name} se afastou`,
          `quem aplicou ficou a ${Math.round(dist)}m (limite ${c.system.origemAfastaMetros}m)`);
      }
    }
  }
}


/** Quem aplicou caiu ou saiu da cena: encerra as Condições marcadas com "sai se quem aplicou cair". */
async function naurenOrigemCaiu(cena, tokenDoc, actor, motivo) {
  if (!cena || game.users.activeGM !== game.user) return;
  for (const { actor: portador, cond } of naurenCondicoesLigadasA(cena, tokenDoc, actor, c => c.system.origemCaiRemove)) {
    await naurenEncerrarCondicaoLigada(portador, cond, `${actor?.name ?? tokenDoc?.name ?? "quem aplicou"} ${motivo}`, "sai quando quem aplicou cai");
  }
}


/** Compensações contra quem aplicou (ex.: Provocado): modificadores desta lista não valem contra o alvo. */
function naurenCompensacoesContraOrigem(actor, alvoToken) {
  const lista = actor?.system?.modsExcetoOrigem ?? [];
  if (!lista.length || !alvoToken) return [];
  const doc = alvoToken.document ?? alvoToken;
  const alvoActor = doc.actor ?? alvoToken.actor ?? null;
  return lista.filter(c => naurenUuidEhEsteToken(c.conjuradorUuid, doc, alvoActor));
}


/**
 * Cria ou remove a área visual de uma Emanação sempre que o item que a
 * declara (Habilidade ou Efeito) é ativado/desativado - cobre tanto o
 * checkbox "ativo" quanto qualquer outro fluxo que atualize esse campo
 * (ex: o botão de raio na ficha principal).
 */
/**
 * Cria, atualiza ou remove a área visual de uma Emanação sempre que algo
 * relevante mudar no item que a declara (Habilidade ou Efeito) - "ativo",
 * "usaEmanacao" ou o raio. Em vez de só reagir a "ativo" mudando de valor
 * (que NUNCA aconteceria se o item já nascer ativo por padrão e o jogador
 * só marcar "usaEmanacao" depois, sem nunca mexer no "ativo"), compara o
 * estado que DEVERIA existir agora com o que já existe, e reconcilia.
 */
async function naurenReconciliarRegiaoEmanacao(item) {
  if (item.type !== "habilidade" && item.type !== "efeito") return;
  // Se o item foi editado a partir de um TOKEN específico (não da ficha
  // solta na barra lateral), escopa a criação/remoção só a ESSE token -
  // é isso que faz "desativar na cópia" nunca mais mexer na Região do
  // token original (antes, sem esse escopo, a remoção olhava a flag do
  // ITEM, que o Foundry compartilha entre token e cópia até algum campo
  // divergir de verdade entre os dois - ver NaurenRegionHelper.buscarRegioesDoItem).
  const tokenId = item.actor?.isToken ? item.actor.token?.id : null;
  const deveriaExistir = !!(item.system.ativo && item.system.usaEmanacao);
  const jaExiste = NaurenRegionHelper.buscarRegioesDoItem(item.uuid, tokenId).length > 0;

  if (deveriaExistir && !jaExiste) {
    await NaurenRegionHelper.criarRegiaoEmanacao(item);
  } else if (!deveriaExistir && jaExiste) {
    await NaurenRegionHelper.removerRegiaoEmanacao(item, tokenId);
  }
  // Se já existia e ainda deveria existir, mas o raio mudou, recria do
  // zero com o novo tamanho (mais simples e confiável que redimensionar
  // o shape já colocado).
}

/** Código que rodava solto neste trecho do nauren.mjs: chamado no mesmo ponto de antes. */
export function __naurenIniciar_monstros_regras() {


Hooks.on("preUpdateToken", (tokenDoc, changes) => {
  if (changes.x === undefined && changes.y === undefined) return;
  tokenDoc._naurenPosAntesF4 = { x: tokenDoc.x, y: tokenDoc.y };
});

Hooks.on("updateToken", async (tokenDoc, changes, options) => {
  if (changes.x === undefined && changes.y === undefined) return;
  const antes = tokenDoc._naurenPosAntesF4;
  delete tokenDoc._naurenPosAntesF4;
  if (game.users.activeGM !== game.user) return;
  const cena = tokenDoc.parent;
  if (!cena) return;
  try {
    // Arrastar: quem tem uma Condição "vai junto" ligada a este token acompanha o deslocamento.
    if (antes && !options?.naurenArrastadoPorOrigem && tokenDoc.actor) {
      const dx = (changes.x ?? tokenDoc.x) - antes.x, dy = (changes.y ?? tokenDoc.y) - antes.y;
      if (dx || dy) {
        const vistos = new Set();
        for (const { token: t, actor: portador, cond } of naurenCondicoesLigadasA(cena, tokenDoc, tokenDoc.actor, c => c.system.arrastarComOrigem)) {
          if (vistos.has(t.id)) continue;
          vistos.add(t.id);
          await t.update({ x: t.x + dx, y: t.y + dy }, { naurenEmpurrado: true, naurenArrastadoPorOrigem: true, animate: false }).catch(err => console.warn("Nauren RPG | arrastar portador", err));
          naurenPostarCard({ ator: portador, titulo: "Arrastado", icone: cond.img, fonte: cond.name,
            linhas: [{ label: "Vai junto de", value: naurenNomeDeToken(tokenDoc), breakdown: `${cond.name}: o portador acompanha quem aplicou` }] }).catch(() => {});
        }
      }
    }
    await naurenChecarAfastamentoDaOrigem(cena);
  } catch (err) { console.warn("Nauren RPG | Fase 4: movimento e Condições ligadas à origem.", err); }
});

Hooks.on("deleteToken", tokenDoc => {
  if (!tokenDoc.parent) return;
  naurenOrigemCaiu(tokenDoc.parent, tokenDoc, tokenDoc.actor, "saiu da cena").catch(() => {});
});

Hooks.on("updateActor", async (actor, mudancas) => {
  if (game.users.activeGM !== game.user) return;
  const vidaNova = foundry.utils.getProperty(mudancas, "system.vida.value");
  if (vidaNova === undefined || vidaNova > 0) return;
  const cena = canvas?.scene;
  if (!cena) return;
  const tok = actor.token ?? cena.tokens.find(t => t.actor?.uuid === actor.uuid) ?? null;
  await naurenOrigemCaiu(cena, tok, actor, "caiu").catch(() => {});
});


/**
 * Área visual de Emanação (auras persistentes): reposiciona a região de
 * QUALQUER item com Emanação ativa vinculado a este token, sempre que ele
 * se move - independe de estar em combate ou não (diferente do hook
 * acima, que é só o custo de Estamina por movimento). Hook SEPARADO de
 * propósito, pra não herdar nenhuma das condições específicas daquele.
 */
Hooks.on("updateToken", (tokenDoc, changes) => {
  if (changes.x === undefined && changes.y === undefined) return;
  const actor = tokenDoc.actor;
  // Token sem ficha (ator apagado) ou de outro dono: nada a fazer nesta máquina (sem poluir o console).
  if (!actor?.isOwner) return;
  const itensComEmanacao = actor.items.filter(item => item.system.usaEmanacao);
  const relevantes = itensComEmanacao.filter(item => NaurenRegionHelper.buscarRegioesDoItem(item.uuid, tokenDoc.id).length > 0);
  if (!relevantes.length) return;

  // IMPORTANTE: usa "changes" diretamente (o destino que está sendo
  // aplicado agora), nunca "tokenDoc.object.center" - com o sistema de
  // movimento por waypoints do V13/14, a posição desenhada do token ainda
  // não reflete o valor novo no instante em que este hook dispara (fica
  // "um passo atrasado"), fazendo a área parecer que não segue.
  const destino = { x: changes.x ?? tokenDoc.x, y: changes.y ?? tokenDoc.y };
  const largura = (tokenDoc.width ?? 1) * (canvas.grid?.size ?? 100);
  const altura = (tokenDoc.height ?? 1) * (canvas.grid?.size ?? 100);
  const novoCentro = { x: destino.x + largura / 2, y: destino.y + altura / 2 };

  for (const item of relevantes) {
    NaurenRegionHelper.persistirPosicaoRegiao(item, tokenDoc, novoCentro).catch(err => console.warn("Nauren RPG | Falha ao mover a área visual da Emanação.", err));
  }
});


/**
 * Gatilho de "entrou/se moveu dentro da área" dos Templates Persistentes
 * (efeito de armadilha, ver templatePersistenteAoEntrar em campoAcao) -
 * dispara na primeira vez que um token se MOVE (só roda em movimento de
 * verdade, ver "changes.x/y" abaixo) e o ponto de destino está dentro da
 * área, seja ele vindo de fora ou apenas mudando de posição dentro da
 * mesma área (regra do manual: "não se ativa imediatamente [ao criar
 * a área], só se o personagem se mover dentro dela"). Cada token só
 * ativa a MESMA armadilha uma vez (ver "tokensJaAtivaram"). Roda só no
 * GM ativo pra nunca aplicar em dobro entre clientes.
 */
Hooks.on("updateToken", async (tokenDoc, changes) => {
  if (changes.x === undefined && changes.y === undefined) return;
  if (game.users.activeGM !== game.user || !canvas?.ready || !canvas.scene) return;
  const actor = tokenDoc.actor;
  if (!actor) return;

  const destino = { x: changes.x ?? tokenDoc.x, y: changes.y ?? tokenDoc.y };
  const largura = (tokenDoc.width ?? 1) * (canvas.grid?.size ?? 100);
  const altura = (tokenDoc.height ?? 1) * (canvas.grid?.size ?? 100);
  const pontoCentro = { x: destino.x + largura / 2, y: destino.y + altura / 2 };

  const regioesComArmadilha = canvas.scene.regions?.filter(r => r.getFlag("nauren", "templatePersistente")?.aoEntrar) ?? [];
  for (const regiao of regioesComArmadilha) {
    const config = foundry.utils.deepClone(regiao.getFlag("nauren", "templatePersistente"));
    if (!config?.aoEntrar) continue;
    // Bug real corrigido: "tokensJaDentro" (quem já estava dentro
    // desde que a área foi colocada) bloqueava esse token PRA SEMPRE,
    // mesmo depois dele se mover - mas o manual diz "não se ativa
    // imediatamente, se ativando APENAS SE o personagem SE MOVER
    // dentro da área" - ou seja, o movimento em si (que é a ÚNICA
    // razão desta função rodar - ver "changes.x/y" no topo do hook)
    // já é exatamente esse "se mover dentro da área". A única coisa
    // que ainda deve valer pra sempre é "já ativou esta armadilha
    // antes" (tokensJaAtivaram), não "estava parado aqui quando ela
    // nasceu".
    if ((config.tokensJaAtivaram ?? []).includes(tokenDoc.id)) continue; // já ativou antes, não repete

    const shapes = regiao.shapes ?? [];
    const dentroAgora = shapes.length > 0 && shapes.every(s => typeof s.testPoint === "function") && naurenCelulasNaArea(pontoCentro, shapes, tokenDoc, regiao);
    if (!dentroAgora) continue;

    const disposicaoFiltro = config.disposicao || "inimigos";
    const mesmaDisposicao = tokenDoc.disposition === config.disposicaoOrigem;
    if (disposicaoFiltro === "aliados" && !mesmaDisposicao) continue;
    if (disposicaoFiltro === "inimigos" && mesmaDisposicao) continue;

    const resultado = await naurenAplicarEfeitoTemplatePersistente(config, actor, config.origemAtorUuid, null, tokenDoc, regiao.name);
    if (resultado.aplicou && config.aoEntrar) {
      const origemArm = config.origemAtorUuid ? await fromUuid(config.origemAtorUuid).catch(() => null) : null;
      const donoArm = origemArm?.actor ?? origemArm;
      const temHab = nome => donoArm?.items?.some(i => i.type === "habilidade" && naurenEhItem(i, nome) && i.system.ativo !== false);
      // A armadilha continua ativa enquanto este alvo estiver Preso nela (conta no limite do Caçador).
      if (config.removerAoAtivar && config.condicaoUuid && config.origemItemUuid) {
        const nomeCondA = (() => { try { return fromUuidSync(config.condicaoUuid)?.name ?? ""; } catch (err) { return ""; } })();
        const presoA = actor.items.find(i => i.type === "condicao" && (i.getFlag("core", "sourceId") === config.condicaoUuid || i.getFlag("nauren", "origemUuid") === config.condicaoUuid || i.name === nomeCondA));
        if (presoA) {
          await presoA.setFlag("nauren", "presoPorArmadilha", { itemUuid: config.origemItemUuid, origemAtorUuid: config.origemAtorUuid ?? "" }).catch(() => {});
          resultado.secondaryLines.push({ label: "Armadilha ativa", value: `enquanto ${actor.name} estiver ${presoA.name}`, breakdown: "conta no limite de armadilhas de quem montou" });
        }
      }
      // Arsenal de Armadilhas: efeito extra escolhido ao montar a armadilha.
      if (config.condicaoExtraUuid) {
        const nomeExtra = await NaurenAlvoHelper.aplicarCondicao(actor, config.condicaoExtraUuid, 1).catch(() => null);
        if (nomeExtra) resultado.secondaryLines.push({ label: "Arsenal de Armadilhas", value: nomeExtra });
      }
      // Camuflagem: soltar-se do Preso desta armadilha custa +1.
      if (temHab("Camuflagem") && config.condicaoUuid) {
        const preso = actor.items.find(i => i.type === "condicao" && (i.getFlag("core", "sourceId") === config.condicaoUuid || i.name === (fromUuidSync(config.condicaoUuid)?.name ?? "")));
        if (preso) {
          const custoAtual = Number(preso.system.custoParaRemoverQuantidade) || 1;
          await preso.update({ "system.custoParaRemoverQuantidade": String(custoAtual + 1), "system.custoParaRemoverRecurso": preso.system.custoParaRemoverRecurso || "estamina" }).catch(() => {});
          resultado.secondaryLines.push({ label: "Camuflagem", value: `soltar-se custa ${custoAtual + 1}` });
        }
      }
      // Aspecto Alfa: os mascotes do caçador ganham Prioridade.
      if (temHab("Aspecto Alfa")) {
        const mascotes = Array.from(game.actors).filter(a => a.system?.mascoteDeUuid === donoArm.uuid);
        if (mascotes.length) {
          await naurenOperarRegistroPrioridade("registrar", { entradas: mascotes.map(m => ({ deUuid: donoArm.uuid, deNome: donoArm.name, paraUuid: m.uuid, paraNome: m.name, indicador: "PA", motivo: "Aspecto Alfa", item: "Aspecto Alfa" })) });
          resultado.secondaryLines.push({ label: "Aspecto Alfa", value: `Prioridade para ${mascotes.map(m => m.name).join(", ")}` });
        }
      }
    }
    if (resultado.aplicou) {
      await actor.sheet?._postRollCard?.({
        title: `${regiao.name} — ativada por ${actor.name}`, icon: "icons/magic/nature/trap-spikes-thorns-green.webp", d20Result: null,
        secondaryLines: resultado.secondaryLines
      });
    }
    // Remover ao Ativar (ver campoAcao) - a região é apagada de vez em
    // vez de continuar no mapa esperando outros alvos ativarem também.
    if (!resultado.aplicou) continue; // ex.: quem criou a área (não afeta o conjurador)
    if (config.removerAoAtivar) {
      await regiao.delete();
    } else {
      config.tokensJaAtivaram = [...(config.tokensJaAtivaram ?? []), tokenDoc.id];
      await regiao.setFlag("nauren", "templatePersistente", config);
    }
  }

  // Gatilhos Externos de Template Persistente, variante "Ao Entrar" (ver
  // NaurenEfeitoData#gatilhosTemplatePersistente, ex: Oásis Verdejante -
  // Druida, "quando um inimigo entra numa área FIXA sua, ele também é
  // afetado por Raízes da Terra Ancestral") - roda em QUALQUER Região
  // persistente do Ator (não só as que já têm "Ao Entrar" configurado
  // na própria Ação - o gatilho externo é independente disso), então
  // filtra de novo aqui dentro por ter ou não um gatilho correspondente.
  // Mesma regra de "só ativa se SE MOVER pra dentro, nunca repete pro
  // mesmo alvo" do mecanismo original - reaproveita o mesmo
  // "tokensJaAtivaram" da Região (um token que já ativou QUALQUER coisa
  // nela não aciona de novo).
  const regioesPersistentesTodas = canvas.scene.regions?.filter(r => r.getFlag("nauren", "templatePersistente")) ?? [];
  for (const regiao of regioesPersistentesTodas) {
    const config = foundry.utils.deepClone(regiao.getFlag("nauren", "templatePersistente"));
    if (!config) continue;
    if ((config.tokensJaAtivaram ?? []).includes(tokenDoc.id)) continue;
    const shapes = regiao.shapes ?? [];
    const dentroAgora = shapes.length > 0 && shapes.every(s => typeof s.testPoint === "function") && naurenCelulasNaArea(pontoCentro, shapes, tokenDoc, regiao);
    if (!dentroAgora) continue;
    const gatilhosAoEntrar = await naurenColetarGatilhosTemplatePersistenteExternos(config.origemAtorUuid, config.origemItemUuid, "aoEntrar");
    if (!gatilhosAoEntrar.length) continue;
    let algumAtivou = false;
    for (const { origemNome, config: configGatilho } of gatilhosAoEntrar) {
      const disposicaoFiltroExterno = configGatilho.disposicao || "aliados";
      const mesmaDisposicaoExterno = tokenDoc.disposition === config.disposicaoOrigem;
      if (disposicaoFiltroExterno === "aliados" && !mesmaDisposicaoExterno) continue;
      if (disposicaoFiltroExterno === "inimigos" && mesmaDisposicaoExterno) continue;
      const resultadoExterno = await naurenAplicarEfeitoTemplatePersistente(configGatilho, actor, config.origemAtorUuid, null, tokenDoc, `${regiao.name} (${origemNome})`);
      if (resultadoExterno.aplicou) algumAtivou = true;
      if (resultadoExterno.aplicou) {
        await actor.sheet?._postRollCard?.({
          title: `${regiao.name} — ${origemNome}`, icon: "icons/magic/nature/trap-spikes-thorns-green.webp", d20Result: null,
          secondaryLines: resultadoExterno.secondaryLines
        });
      }
    }
    if (algumAtivou) {
      config.tokensJaAtivaram = [...(config.tokensJaAtivaram ?? []), tokenDoc.id];
      await regiao.setFlag("nauren", "templatePersistente", config);
    }
  }

  // Condição de Presença (ver templatePersistenteCondicaoPresencaUuid) -
  // checa TODA região com esse campo configurado (não só as com
  // "aoEntrar", que é um mecanismo completamente diferente) a cada
  // movimento: entrou (e é elegível) → garante a Condição; saiu (ou
  // deixou de ser elegível, ex: mudou de disposição) → remove.
  const regioesComPresenca = canvas.scene.regions?.filter(r => r.getFlag("nauren", "templatePersistente")?.condicaoPresencaUuid) ?? [];
  for (const regiao of regioesComPresenca) {
    const config = regiao.getFlag("nauren", "templatePersistente");
    const dentroEElegivel = naurenPontoDentroDaRegiao(pontoCentro, regiao, tokenDoc) && naurenTokenElegivelPorDisposicao(tokenDoc, config);
    await naurenAtualizarCondicaoPresenca(actor, regiao.id, config.condicaoPresencaUuid, dentroEElegivel);
  }
});


/**
 * Condição de Presença (ver templatePersistenteCondicaoPresencaUuid) -
 * quando a Região em si desaparece (duração zerou, Sustentar
 * recusado/sem recurso, armadilha "Remover ao Ativar", ou apagada à
 * mão no mapa - todos os "regiao.delete()" existentes disparam este
 * MESMO hook nativo do Foundry, sem precisar caçar cada call site),
 * remove a Condição de qualquer ator na cena que ainda a tenha
 * marcada com esta região especificamente (naurenAtualizarCondicaoPresenca
 * já é um no-op seguro pra quem não tinha).
 */
Hooks.on("deleteRegion", async (regiao) => {
  if (game.users.activeGM !== game.user) return;
  const config = regiao.getFlag("nauren", "templatePersistente");
  if (!config?.condicaoPresencaUuid) return;
  const atoresUnicos = new Set();
  for (const tokenDoc of regiao.parent?.tokens ?? []) {
    if (tokenDoc.actor) atoresUnicos.add(tokenDoc.actor);
  }
  for (const actor of atoresUnicos) {
    await naurenAtualizarCondicaoPresenca(actor, regiao.id, config.condicaoPresencaUuid, false);
  }
});


/**
 * Sincronismo VISUAL da área de Emanação, quadro a quadro: "refreshToken"
 * dispara em TODO redesenho do token, inclusive durante a própria
 * animação de movimento dele (dezenas de vezes por movimento) - ao
 * espelhar a posição REAL e ATUAL do token a cada quadro (em vez de medir
 * origem/destino e animar por conta própria com uma duração adivinhada),
 * a área sempre acompanha na MESMA velocidade e no MESMO instante que o
 * token, seja qual for a velocidade de movimento configurada. Só mexe na
 * representação local (nunca grava no banco aqui) - a persistência de
 * verdade é feita pelo hook "updateToken" acima, uma única vez por
 * movimento de fato.
 */
Hooks.on("refreshToken", (tokenPlaceable) => {
  const tokenDoc = tokenPlaceable.document;
  const actor = tokenDoc.actor;
  if (!actor?.isOwner) return;
  for (const item of actor.items) {
    if (!item.system.usaEmanacao) continue;
    if (!NaurenRegionHelper.buscarRegioesDoItem(item.uuid, tokenDoc.id).length) continue;
    NaurenRegionHelper.sincronizarVisualComToken(item, tokenDoc, tokenPlaceable);
  }
});


/**
 * Cria a área visual da Emanação pra um token RECÉM-CRIADO na cena, se o
 * Ator dele já tiver algum item com Emanação ativa - cobre o cenário de
 * copiar/colar um token que já estava com uma Emanação ligada (a cópia
 * nascia sem a área visual, já que "criarRegiaoEmanacao" só rodava no
 * momento de ATIVAR o item, não quando um NOVO token aparecia depois).
 * "criarRegiaoEmanacao" já é idempotente (só cria a região que falta pro
 * token que ainda não tem uma) - chamar de novo aqui é seguro mesmo se
 * o Ator já tivesse outros tokens com região própria.
 *
 * NÃO tenta mais "forçar a separação de dados" (ActorDelta) mexendo em
 * "system.ativo" - uma tentativa anterior fazia isso invertendo e
 * devolvendo o valor, mas isso disparava o Hook reativo desta mesma
 * feature (naurenReconciliarRegiaoEmanacao, que reage a QUALQUER mudança
 * de "ativo" removendo/recriando a Região), causando uma reação em
 * cascata que apagava a Região dos DOIS tokens em vez de só separar os
 * dados - pior que o problema original. Revertido.
 */
Hooks.on("createToken", (tokenDoc, options, userId) => {
  if (userId !== game.user.id) return;
  const actor = tokenDoc.actor;
  if (!actor?.isOwner) return;
  for (const item of actor.items) {
    if (!item.system.ativo || !item.system.usaEmanacao) continue;
    NaurenRegionHelper.criarRegiaoEmanacao(item).catch(err => console.warn(`Nauren RPG | Falha ao criar a área visual da Emanação de "${item.name}" pro token recém-criado.`, err));
  }
});


Hooks.on("createItem", (item, options, userId) => {
  if (userId !== game.user.id) return;
  naurenReconciliarRegiaoEmanacao(item).catch(err => console.warn("Nauren RPG | Falha ao processar a área visual da Emanação (item criado).", err));
});


Hooks.on("updateItem", (item, changes, options, userId) => {
  if (userId !== game.user.id) return;
  if (item.type !== "habilidade" && item.type !== "efeito") return;
  const tocouAlgoRelevante = ["system.ativo", "system.usaEmanacao"].some(caminho => foundry.utils.getProperty(changes, caminho) !== undefined);
  // 0.94.16: o raio também muda com o rank (Presença sobe com o nível) e com a tabela por rank.
  const raioMudou = ["system.emanacaoRaio", "system.rankAtual", "system.emanacaoRaioPorRank"].some(c => foundry.utils.getProperty(changes, c) !== undefined);
  if (raioMudou && item.system.ativo && item.system.usaEmanacao) naurenAjustarTamanhoAura(item).catch(err => console.warn("Nauren RPG | tamanho da aura", err));
  if (!tocouAlgoRelevante && !raioMudou) return;

  const tokenId = item.actor?.isToken ? item.actor.token?.id : null;
  if (raioMudou && item.system.ativo && item.system.usaEmanacao && NaurenRegionHelper.buscarRegioesDoItem(item.uuid, tokenId).length) {
    NaurenRegionHelper.removerRegiaoEmanacao(item, tokenId)
      .then(() => NaurenRegionHelper.criarRegiaoEmanacao(item))
      .catch(err => console.warn("Nauren RPG | Falha ao redimensionar a área visual da Emanação.", err));
    return;
  }
  naurenReconciliarRegiaoEmanacao(item).catch(err => console.warn("Nauren RPG | Falha ao processar a área visual da Emanação.", err));
});
}

export { NAUREN_PASTA_INVOCACOES, naurenAcaoCustaMana, naurenAtorParaInvocar, naurenCasasLivresEmVolta, naurenChecarAfastamentoDaOrigem, naurenCompensacoesContraOrigem, naurenCondicoesAtivas, naurenCondicoesLigadasA, naurenCriarInvocacoes, naurenEncerrarCondicaoLigada, naurenFontesSemPrioridade, naurenMetrosSemPrioridadeDoItem, naurenMovSemPrioridadeUsado, naurenMovimentoSemPrioridade, naurenOrigemCaiu, naurenOrigemDaCondicao, naurenReconciliarRegiaoEmanacao, naurenTravaDaAcao, naurenTravaPrioridade, naurenUuidEhEsteToken };
