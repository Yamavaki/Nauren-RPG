/* Nauren RPG — Entidades de campo. Separado do nauren.mjs na 0.94.31. */
import { ARMA_TIPOS, ATRIBUTOS_BONUS, NAUREN_CAMPOS_MODIFICADOR_OPCOES, NAUREN_REFERENCIA_FORMULAS, NAUREN_TOKENS_CONTEXTO, naurenAvaliarExpressaoSimples, naurenCasasLivresEmVolta, naurenCondicoesAtivas, naurenConsumirUsoDaHabilidade, naurenCriarInvocacoes, naurenCriarObraPrima, naurenDisposicaoDoAtor, naurenFormulaParaTexto, naurenMedirDistanciaBordas, naurenMontarDescricao, naurenPostarCard, naurenPrioridadesNoTurno, naurenResolverPorNivel, naurenResolverTokenFormula, naurenTextoRolagem, naurenTravaPrioridade, naurenUsoDisponivel } from "../nauren.mjs";
import { NAUREN_MASCOTES_INICIAIS, NAUREN_PACKS_DEFINICAO, naurenAliadosDoGrupo } from "./compendios.mjs";
import { NAUREN_MOTION_ALVO_OPCOES, NAUREN_MOTION_USUARIO_OPCOES } from "./animacoes.mjs";
import { NaurenAlvoHelper } from "./ficha-ator.mjs";
import { NaurenGrupoHelper } from "./relogio-condicoes.mjs";
import { RECURSOS_ALVO } from "./ficha-item.mjs";
import { naurenEmpurrarToken, naurenPreencherRecursosNoMaximo, naurenProcessarGatilhos } from "./icone-condicao-token.mjs";
import { naurenSouResponsavelPor } from "./relogio-combate.mjs";
/* =======================================
 * ENTIDADES DE CAMPO (Fase 6 - O)
 * Estado guardado no próprio card (flags.nauren.entidade). Toda mudança é
 * feita pelo Mestre ativo (query), que pode editar qualquer ficha e card.
 * ======================================= */
const NAUREN_QUERY_ENTIDADE = "nauren.entidade";
const NAUREN_PASTA_ENTIDADES = "Nauren — Entidades de Campo";

/**
 * Deixa o jogador escolher no mapa onde a entidade fica: uma prévia do
 * tamanho dela segue o mouse (alinhada ao grid). Clique posiciona, R gira
 * (troca largura/altura), Esc ou botão direito cancela. Respeita o alcance
 * a partir de "origem" (em metros). Devolve { x, y, largura, altura } do
 * CENTRO, ou null se cancelou.
 */
function naurenEscolherPontoNoMapa({ nome, largura = 1, altura = 1, origem = null, alcanceMetros = 0, validar = null, textoAjuda = "" }) {
  return new Promise(resolve => {
    if (!canvas?.ready) return resolve(null);
    const casa = canvas.grid.size;
    let w = largura, h = altura;
    const previa = new PIXI.Graphics();
    (canvas.interface ?? canvas.stage).addChild(previa);
    let ultimo = null;
    const alinhar = p => ({
      x: Math.round((p.x - w * casa / 2) / casa) * casa + w * casa / 2,
      y: Math.round((p.y - h * casa / 2) / casa) * casa + h * casa / 2
    });
    const foraDoAlcance = c => {
      if (!origem || !alcanceMetros) return false;
      try { return (canvas.grid.measurePath([origem, c])?.distance ?? 0) > alcanceMetros + (Math.max(w, h) / 2) * (canvas.scene.grid.distance || 1); } catch (err) { return false; }
    };
    const desenhar = () => {
      if (!ultimo) return;
      const c = alinhar(ultimo);
      const cor = foraDoAlcance(c) ? 0xc24b4b : 0xcca162;
      previa.clear();
      previa.lineStyle(3, cor, 0.95).beginFill(cor, 0.2).drawRect(c.x - w * casa / 2, c.y - h * casa / 2, w * casa, h * casa).endFill();
    };
    const mover = ev => { ultimo = ev.getLocalPosition(canvas.stage); desenhar(); };
    const terminar = valor => {
      canvas.stage.off("pointermove", mover);
      canvas.stage.off("pointerdown", clicar);
      window.removeEventListener("keydown", tecla, true);
      previa.destroy();
      resolve(valor);
    };
    const clicar = ev => {
      if (ev.button === 2) return terminar(null);
      if (ev.button !== 0) return;
      const c = alinhar(ev.getLocalPosition(canvas.stage));
      if (foraDoAlcance(c)) { ui.notifications.warn(`"${nome}": fora do alcance (${alcanceMetros}m).`); return; }
      const erro = validar ? validar(c) : "";
      if (erro) { ui.notifications.warn(`"${nome}": ${erro}`); return; }
      ev.stopPropagation();
      terminar({ ...c, largura: w, altura: h });
    };
    const tecla = ev => {
      if (ev.key === "Escape") { ev.preventDefault(); terminar(null); }
      else if (ev.key === "r" || ev.key === "R") { [w, h] = [h, w]; desenhar(); }
    };
    canvas.stage.on("pointermove", mover);
    canvas.stage.on("pointerdown", clicar);
    window.addEventListener("keydown", tecla, true);
    ui.notifications.info(textoAjuda || `Clique no mapa para posicionar "${nome}"${w !== h ? " (R gira)" : ""}. Esc ou botão direito: fica ao lado de quem usou.`);
  });
}

/**
 * Esta Ação cura? Bloco de Cura, área persistente que cura, ganho de Vida
 * no alvo (gasto de Vida negativo) ou a marcação "Esta Ação é de cura".
 */
function naurenAcaoEhCura(acao) {
  if (!acao) return false;
  if (acao.marcadaComoCura || (acao.curas ?? []).length) return true;
  if (acao.usaTemplatePersistente && acao.templatePersistenteEfeito === "cura") return true;
  return (acao.gastosRecurso ?? []).some(g => g.recurso === "vida" && String(g.quantidade ?? "").trim().startsWith("-"));
}

/**
 * Teomanina (Sacerdote): você e seus aliados na cena aumentam o limiar de
 * acerto crítico em metade do Destino do Sacerdote. Devolve { valor, fonte }.
 */
/**
 * Soma "delta" num Efeito permanente do ator (um por nome), com o total no
 * modificador do campo. Efeito não mostra ícone no token.
 */
async function naurenSomarEfeitoPermanente(actor, { nome, campo, delta, img = "icons/svg/aura.svg", origem = "" }) {
  if (!actor || !nome || !campo || !delta) return null;
  const existente = actor.items.find(i => i.type === "efeito" && i.getFlag("nauren", "efeitoPermanente") === nome);
  const total = (existente?.getFlag("nauren", "efeitoPermanenteTotal") ?? 0) + delta;
  const vezes = (existente?.getFlag("nauren", "efeitoPermanenteVezes") ?? 0) + 1;
  const sistema = {
    ativo: true,
    modificadores: [{ campo, valor: String(total) }],
    descricao: naurenMontarDescricao({ regra: `Origem: ${origem || nome}. Permanente.`, automatico: `${total > 0 ? "+" : ""}${total} em ${NAUREN_CAMPOS_MODIFICADOR_OPCOES[campo] ?? campo} no total (${vezes}×).`, manual: "" })
  };
  const nomeFinal = vezes > 1 ? `${nome} (×${vezes})` : nome;
  if (existente) {
    await existente.update({ name: nomeFinal, system: sistema, "flags.nauren.efeitoPermanenteTotal": total, "flags.nauren.efeitoPermanenteVezes": vezes });
  } else {
    await actor.createEmbeddedDocuments("Item", [{ name: nomeFinal, type: "efeito", img, system: sistema, flags: { nauren: { efeitoPermanente: nome, efeitoPermanenteTotal: total, efeitoPermanenteVezes: vezes } } }]);
  }
  return { nome: nomeFinal, total };
}

/**
 * Categoria de uma arma (Leve, Média, Pesada, Alcance, Distância,
 * Catalisador). Usa o campo "Categoria" da arma; sem ele (armas antigas ou
 * feitas à mão), deduz pelo nome, pelo tipo das Ações, pelo dado e pelo
 * alcance.
 */
function naurenCategoriaDaArma(arma) {
  if (!arma) return "";
  const sys = arma.system ?? {};
  if (sys.categoria) return sys.categoria;
  const acoes = sys.acoes ?? [];
  const tipoAcao = acoes.find(a => a.tipo && ARMA_TIPOS[a.tipo])?.tipo;
  if (tipoAcao) return tipoAcao;
  const nome = String(arma.name ?? "").toLowerCase();
  if (/catalis|varinha|cristal|joia/.test(nome)) return "Catalisador";
  if (/pesad/.test(nome)) return "Pesada";
  if (/leve|adaga|punhal/.test(nome)) return "Leve";
  if (/alcance|lança|glaive/.test(nome)) return "Alcance";
  if (/arco|besta|arma de fogo|dist[aâ]ncia/.test(nome)) return "Distância";
  const alcance = parseFloat(String(acoes[0]?.alcance ?? "").replace(",", ".")) || 0;
  if (alcance >= 6) return "Distância";
  if (alcance >= 2) return "Alcance";
  const formula = acoes.find(a => /basic|básic/i.test(a.nome ?? ""))?.danos?.[0]?.formula ?? acoes[0]?.danos?.[0]?.formula ?? "";
  if (/d10|d12/i.test(formula)) return "Pesada";
  if (/d4\b/i.test(formula)) return "Leve";
  return "Média";
}

/** Soma do Estresse dos seus aliados na cena (mesmo lado, sem contar você). */
function naurenEstresseDosAliados(actor) {
  const disp = actor.getActiveTokens?.(true)?.[0]?.document?.disposition;
  let total = 0;
  const vistos = new Set();
  for (const t of canvas?.tokens?.placeables ?? []) {
    if (!t.actor || t.actor === actor || t.document.disposition !== disp || vistos.has(t.actor.uuid)) continue;
    vistos.add(t.actor.uuid);
    total += t.actor.system.stress?.value ?? 0;
  }
  return total;
}
/** Quantas Prioridades você deu a aliados neste combate (não conta as de ataque). */
function naurenPrioridadesGeradas(actor) {
  const lista = game.combat?.getFlag("nauren", "prioridades") ?? [];
  return lista.filter(e => e.deUuid === actor.uuid && e.indicador !== "PI").length;
}

/** Bônus no dano periódico de uma Condição pelo que o conjurador tem (ex.: Técnica Suja). */
function naurenBonusDanoPeriodico(conjurador, nomeCondicao, cond = null) {
  if (!conjurador?.items) return { valor: 0, fontes: [] };
  let valor = 0;
  let substituir = "";
  const fontes = [];
  const nome = String(nomeCondicao ?? "").toLowerCase();
  for (const item of conjurador.items) {
    const ativo = item.type === "habilidade" ? item.system.ativo !== false : item.type === "efeito" ? !!item.system.ativo : false;
    if (!ativo) continue;
    for (const b of item.system.bonusDanoPeriodico ?? []) {
      if (b.soVenenos) { if (!cond?.system?.ehVeneno) continue; }
      else {
        const alvo = String(b.condicaoNome ?? "").trim().toLowerCase();
        if (!alvo || !nome.includes(alvo)) continue;
      }
      const v = (Number(b.valor) || 0) * (b.multiplicarPeloRank ? Math.max(1, item.system.rankAtual || 1) : 1);
      if (v) { valor += v; fontes.push(`${item.name} +${v}`); }
      if (b.substituirFormula) { substituir = b.substituirFormula; fontes.push(`${item.name}: ${b.substituirFormula}`); }
    }
  }
  return { valor, fontes, substituir };
}

// Condição "única por quem aplicou" (ex.: Marca do Caçador): ao aparecer num
// alvo, sai de qualquer outro alvo em que o mesmo personagem a tinha posto.
Hooks.on("createItem", async (item) => {
  if (game.users.activeGM !== game.user || item.type !== "condicao" || !item.system.unicaPorConjurador || !item.system.conjuradorUuid) return;
  const quem = uuid => { try { const d = fromUuidSync(uuid); return (d?.actor ?? d)?.uuid ?? ""; } catch (err) { return ""; } };
  const dono = quem(item.system.conjuradorUuid);
  const atores = new Set(Array.from(game.actors));
  for (const t of canvas?.tokens?.placeables ?? []) if (t.actor) atores.add(t.actor);
  for (const a of atores) {
    if (a === item.parent) continue;
    const antigas = a.items.filter(i => i.type === "condicao" && i.name === item.name && quem(i.system.conjuradorUuid) === dono);
    if (antigas.length) await a.deleteEmbeddedDocuments("Item", antigas.map(i => i.id)).catch(() => {});
  }
});

/* ---- Cores da Pintura (Místico): cada habilidade lista as cores que pode pintar ---- */
const NAUREN_CORES_PINTURA = {
  vermelhoPdA: { seed: "condicao-pintura-vermelho-pda", nomeCondicao: "Pintura: Vermelho (Poder de Ataque)", rotulo: "Vermelho: +1 Poder de Ataque", texto: "+1 Poder de Ataque", img: "icons/magic/fire/flame-burning-hand-red.webp", modificadores: [{ campo: "poderAtaque", valor: "@acumulos" }] },
  vermelhoPdM: { seed: "condicao-pintura-vermelho-pdm", nomeCondicao: "Pintura: Vermelho (Poder de Magia)", rotulo: "Vermelho: +1 Poder de Magia", texto: "+1 Poder de Magia", img: "icons/magic/fire/orb-vortex.webp", modificadores: [{ campo: "poderMagia", valor: "@acumulos" }] },
  azul: { seed: "condicao-pintura-azul", nomeCondicao: "Pintura: Azul (Espírito)", rotulo: "Azul: +2 Espírito", texto: "+2 Espírito", img: "icons/magic/water/orb-water-bubbles-blue.webp", modificadores: [{ campo: "espirito", valor: "2*@acumulos" }] },
  verde: { seed: "condicao-pintura-verde", nomeCondicao: "Pintura: Verde (Vida por Nível)", rotulo: "Verde: +1 Vida Máxima por Nível", texto: "+1 Vida Máxima por Nível", img: "icons/magic/nature/leaf-glow-green.webp", modificadores: [{ campo: "vidaBonusPorNivel", valor: "@acumulos" }] },
  laranja: { seed: "condicao-pintura-laranja", nomeCondicao: "Pintura: Laranja (Crítico)", rotulo: "Laranja: +1 no Limiar de Crítico", texto: "Crítico 1 mais fácil", img: "icons/magic/fire/projectile-fireball-orange.webp", modificadores: [{ campo: "critMin", valor: "-@acumulos" }] },
  rosa: { seed: "condicao-pintura-rosa", nomeCondicao: "Pintura: Rosa (Movimento)", rotulo: "Rosa: +1 Movimento", texto: "+1 Movimento", img: "icons/magic/nature/flower-pink.webp", modificadores: [{ campo: "movimento", valor: "@acumulos" }] },
  branco: { seed: null, rotulo: "Branco: repete o efeito de outra pintura" }
};
const NAUREN_CORES_PINTURA_POR_FONTE = {
  harmonia: { titulo: "Pintura da Harmonia", cores: ["vermelhoPdA", "vermelhoPdM", "azul"] },
  aquarela: { titulo: "Traço da Aquarela", cores: ["verde", "laranja"] },
  epifania: { titulo: "Epifania Colorida", cores: ["rosa", "branco"] }
};
/**
 * Pergunta (neste cliente) qual cor o Ponto de Pintura que "alvo" acabou de ganhar vai ter, entre
 * as cores da habilidade "fonte", e aplica a Condição da cor (+1 acúmulo). Branco repete uma cor
 * que o alvo já tem. Devolve o texto para o card, ou "".
 */
async function naurenEscolherCorDaPintura(alvo, fonte) {
  const def = NAUREN_CORES_PINTURA_POR_FONTE[fonte];
  if (!alvo || !def) return "";
  const packC = game.packs.find(pk => pk.metadata.label === "Nauren - Condições e Venenos");
  if (!packC) return "";
  const coresDoAlvo = Object.entries(NAUREN_CORES_PINTURA).filter(([k, c]) => c.nomeCondicao && alvo.items.some(i => i.type === "condicao" && i.name === c.nomeCondicao));
  const botoes = def.cores.filter(k => k !== "branco" || coresDoAlvo.length).map(k => ({ action: k, label: NAUREN_CORES_PINTURA[k].rotulo }));
  const esc = await foundry.applications.api.DialogV2.wait({
    window: { title: `${def.titulo} — cor da Pintura` }, classes: ["nauren-dialogo"],
    content: `<p><b>${alvo.name}</b> ganhou 1 Ponto de Pintura. Qual efeito ele dá?</p>`,
    buttons: botoes, rejectClose: false
  }).catch(() => null);
  if (!esc) return "";
  let chave = esc;
  if (esc === "branco") {
    const rep = coresDoAlvo.length === 1 ? coresDoAlvo[0][0] : await foundry.applications.api.DialogV2.wait({
      window: { title: "Pintura Branca — repetir qual?" }, classes: ["nauren-dialogo"],
      content: `<p>O Branco repete o efeito de outra pintura que <b>${alvo.name}</b> já tem.</p>`,
      buttons: coresDoAlvo.map(([k, c]) => ({ action: k, label: c.rotulo })), rejectClose: false
    }).catch(() => null);
    if (!rep) return "";
    chave = rep;
  }
  const cor = NAUREN_CORES_PINTURA[chave];
  const uuidCor = await naurenUuidPorSeed(packC, cor.seed);
  if (!uuidCor) return "";
  const ex = NaurenAlvoHelper.usuarioExecutor(alvo);
  const nome = ex?.id === game.user.id ? await NaurenAlvoHelper.aplicarCondicao(alvo, uuidCor, 1).catch(() => null)
    : await ex?.query(NAUREN_QUERY_APLICAR_CONDICAO, { actorUuid: alvo.uuid, uuid: uuidCor, acumulos: 1 }, { timeout: 20000 }).catch(() => null);
  if (!nome) return "";
  const total = alvo.items.find(i => i.type === "condicao" && i.name === cor.nomeCondicao)?.system.acumulos ?? 1;
  return `${esc === "branco" ? "Branco → " : ""}${cor.rotulo} (agora ${total})`;
}

/* ---- Estrela do Arco Íris (Místico): alguém chegou a 5 Pontos de Pintura ---- */
const NAUREN_QUERY_ESTRELA = "nauren.estrelaArcoIris";
async function naurenAvisarEstrelaDoArcoIris(quem, acumulos) {
  const dispQuem = naurenDisposicaoDoAtor(quem);
  const vistos = new Set();
  for (const t of canvas?.tokens?.placeables ?? []) {
    const a = t.actor;
    if (!a || vistos.has(a.uuid) || t.document.disposition !== dispQuem) continue;
    const estrela = a.items.find(i => i.type === "habilidade" && (naurenEhItem(i, "Estrela do Arco Íris, Otaki") || String(i.name).startsWith("Estrela do Arco Íris")) && i.system.ativo !== false);
    if (!estrela) continue;
    vistos.add(a.uuid);
    naurenPostarCard({ ator: a, titulo: estrela.name, icone: estrela.img, fonte: "Pontos de Pintura",
      linhas: [{ label: quem === a ? "Você" : quem.name, value: `chegou a ${acumulos} Pontos de Pintura`, breakdown: "o Dragão de Tinta pode ser usado agora (linha de 2m até o alvo)" }] });
    const ex = NaurenAlvoHelper.usuarioExecutor(a);
    const dados = { misticoUuid: a.uuid, quemNome: quem === a ? "Você" : quem.name };
    if (ex?.id === game.user.id) naurenHandleQueryEstrela(dados).catch(() => {});
    else ex?.query(NAUREN_QUERY_ESTRELA, dados, { timeout: 60000 }).catch(() => null);
  }
}
async function naurenHandleQueryEstrela({ misticoUuid, quemNome }) {
  const doc = await fromUuid(misticoUuid).catch(() => null);
  const a = doc?.actor ?? doc;
  const estrela = a?.items?.find(i => i.type === "habilidade" && (naurenEhItem(i, "Estrela do Arco Íris, Otaki") || String(i.name).startsWith("Estrela do Arco Íris")) && i.system.ativo !== false);
  if (!estrela) return false;
  const sim = await foundry.applications.api.DialogV2.confirm({ window: { title: estrela.name },
    content: `<p><b>${quemNome}</b> chegou a 5 Pontos de Pintura.</p><p>Usar o <b>Dragão de Tinta</b> agora? Marque o alvo e coloque a linha no mapa.</p>`,
    yes: { label: "Usar o Dragão de Tinta" }, no: { label: "Agora não" }, rejectClose: false }).catch(() => false);
  if (sim) await a.sheet._executarAcao(estrela, 0);
  return !!sim;
}

/* ---- Inundação Espiritual: Energia ganha vale o dobro ---- */
Hooks.on("preUpdateActor", (actor, mudancas, opcoes) => {
  if (opcoes?.naurenDevolucao) return; // devolução de custo não é "ganhar Energia"
  const nova = foundry.utils.getProperty(mudancas, "system.recursosCustom");
  if (!Array.isArray(nova)) return;
  if (!actor.items.some(i => i.type === "condicao" && naurenEhItem(i, "Inundação Espiritual") && i.system.ativo !== false)) return;
  const antiga = (actor.system.recursosCustom ?? []).find(r => r.id === "energia");
  const entrada = nova.find(r => r.id === "energia");
  if (!antiga || !entrada) return;
  const ganho = (entrada.valor ?? 0) - (antiga.valor ?? 0);
  if (ganho > 0) entrada.valor = Math.min(antiga.max ?? entrada.max ?? 999, (antiga.valor ?? 0) + ganho * 2);
});

/* ---- Epigrafia da Morte: Vida abaixo de 5 × Energia gasta = morte ---- */
Hooks.on("updateActor", async (actor, mudancas) => {
  if (game.users.activeGM !== game.user) return;
  const vidaNova = foundry.utils.getProperty(mudancas, "system.vida.value");
  if (vidaNova === undefined || vidaNova <= 0) return;
  const marca = actor.items.find(i => i.type === "condicao" && naurenEhItem(i, "Marcado pela Epigrafia"));
  if (!marca) return;
  const limite = 5 * Math.max(1, marca.system.acumulos ?? 1);
  if (vidaNova < limite) {
    const confirma = await foundry.applications.api.DialogV2.confirm({ window: { title: "Epigrafia da Morte" },
      content: `<p><b>${actor.name}</b> ficou com <b>${vidaNova}</b> de Vida, abaixo do limiar da Epigrafia (<b>${limite}</b> = 5 × ${marca.system.acumulos ?? 1}).</p><p>Ele morre?</p>`,
      yes: { label: "Morre" }, no: { label: "Poupar" }, rejectClose: false }).catch(() => false);
    if (!confirma) {
      naurenPostarCard({ ator: actor, titulo: "Epigrafia da Morte", icone: marca.img, fonte: "Místico", linhas: [{ label: actor.name, value: "o Mestre poupou", breakdown: `Vida ${vidaNova} abaixo de ${limite}` }] });
      return;
    }
    await actor.update({ "system.vida.value": 0 });
    naurenPostarCard({ ator: actor, titulo: "Epigrafia da Morte", icone: marca.img, fonte: "Místico", linhas: [{ label: actor.name, value: "morreu", breakdown: `Vida ${vidaNova} abaixo de ${limite} (5 × ${marca.system.acumulos ?? 1} Energia)` }] });
  }
});

// Painel Marcas: quando uma marca "única por conjurador" muda, redesenha a ficha de quem marcou.
for (const ev of ["createItem", "updateItem", "deleteItem"]) {
  Hooks.on(ev, (item) => {
    if (item.type !== "condicao" || !item.system?.unicaPorConjurador || !item.system.conjuradorUuid) return;
    try { const d = fromUuidSync(item.system.conjuradorUuid); const dono = d?.actor ?? d; if (dono?.sheet?.rendered) dono.sheet.render(); } catch (err) { /* ignora */ }
  });
}

// Munição não é poção: ao virar munição, o "Cura 1d6 PV" padrão do consumível sai.
Hooks.on("preUpdateItem", (item, mudancas) => {
  if (item.type !== "consumivel" || foundry.utils.getProperty(mudancas, "system.ehMunicao") !== true) return;
  if ((item.system.efeito ?? "") === "Cura 1d6 PV" && foundry.utils.getProperty(mudancas, "system.efeito") === undefined) foundry.utils.setProperty(mudancas, "system.efeito", "");
});
Hooks.on("preCreateItem", (item, dados) => {
  if (item.type !== "consumivel" || !foundry.utils.getProperty(dados, "system.ehMunicao")) return;
  if ((item.system.efeito ?? "") === "Cura 1d6 PV") item.updateSource({ "system.efeito": "" });
});

/** Usos extras que outras habilidades dão à Ação deste item (ex.: Receita Antiga no Remédios do Caçador). */
function naurenUsosExtrasPara(actor, item, alvo = null) {
  if (!actor || !item) return 0;
  let extra = 0;
  for (const h of actor.items) {
    if (h.type !== "habilidade" || h.system.ativo === false) continue;
    for (const u of h.system.usosExtrasEm ?? []) {
      if (!u.itemNome || !naurenEhItem(item, u.itemNome)) continue;
      // 0.94.3: "alvo" opcional - "item" (usos do item inteiro) ou o nome de uma Ação; vazio = qualquer.
      if (u.alvo && !(alvo && (u.alvo === alvo || naurenNomeBate(alvo, u.alvo)))) continue;
      const rk = Math.max(1, h.system.rankAtual || 1);
      let v = 0;
      try { v = Number(Roll.safeEval(String(u.valor || "0").replace(/@rank\b/g, String(rk)))) || 0; } catch (err) { v = Number(u.valor) || 0; }
      extra += Math.max(0, v);
    }
  }
  return extra;
}

/**
 * Usos extras (ex.: Marcar o Alvo, +1 uso de Análise Paciente por ponto) entram na hora: ao
 * ganhar/subir/ligar a habilidade, os usos que sobram crescem junto com o máximo (antes só
 * apareciam na próxima cena, e o card mostrava "4 / 8" logo no primeiro uso). Perder corta no
 * novo máximo.
 */
function naurenContribuicaoUsosExtras(h, rank = null, ativo = null) {
  if (h?.type !== "habilidade" || (ativo ?? h.system.ativo) === false) return [];
  const rk = Math.max(1, rank ?? h.system.rankAtual ?? 1);
  return (h.system.usosExtrasEm ?? []).filter(u => u.itemNome).map(u => {
    let v = 0;
    try { v = Number(Roll.safeEval(String(u.valor || "0").replace(/@rank\b/g, String(rk)))) || 0; } catch (err) { v = Number(u.valor) || 0; }
    return { itemNome: u.itemNome, alvo: u.alvo || "", valor: Math.max(0, v) };
  });
}
async function naurenAplicarDeltaUsosExtras(actor, antes, depois) {
  if (!actor?.items) return;
  // 0.94.3: cada contribuição tem um "alvo" ("" = Ações com usos, "item" = usos do item inteiro, nome = só aquela Ação).
  const chaves = new Set([...antes, ...depois].map(c => `${c.itemNome}|${c.alvo ?? ""}`));
  const nivel = actor.system?.nivel || 1;
  for (const chave of chaves) {
    const [nome, alvoU] = chave.split("|");
    const soma = l => l.filter(c => c.itemNome === nome && (c.alvo ?? "") === alvoU).reduce((t, c) => t + c.valor, 0);
    const delta = soma(depois) - soma(antes);
    if (!delta) continue;
    for (const alvo of actor.items.filter(i => naurenEhItem(i, nome))) {
      if (alvoU === "item") {
        if (!alvo.system.usaUsos) continue;
        const nvI = naurenResolverPorNivel(alvo.system.usosMaxPorNivel, nivel, "valor");
        const maxI = (nvI !== null ? nvI : (alvo.system.usosMax ?? 0)) + naurenUsosExtrasPara(actor, alvo, "item");
        const novoI = Math.max(0, Math.min(maxI, (alvo.system.usosAtual ?? 0) + delta));
        if (novoI !== alvo.system.usosAtual) await alvo.update({ "system.usosAtual": novoI });
        continue;
      }
      const acoes = foundry.utils.deepClone(alvo.system.acoes ?? []);
      let mudou = false;
      for (const a of acoes) {
        if (!a?.usaUsos) continue;
        if (alvoU && !(a.nome === alvoU || naurenNomeBate(a.nome ?? "", alvoU))) continue;
        const nv = naurenResolverPorNivel(a.usosMaxPorNivel, nivel, "valor");
        const max = (nv !== null ? nv : (a.usosMax ?? 0)) + naurenUsosExtrasPara(actor, alvo, a.nome);
        const novo = Math.max(0, Math.min(max, (a.usosAtual ?? 0) + delta));
        if (novo !== a.usosAtual) { a.usosAtual = novo; mudou = true; }
      }
      if (mudou) await alvo.update({ "system.acoes": acoes });
    }
  }
}
Hooks.on("createItem", async (item, opcoes, userId) => {
  if (userId !== game.user.id || item.parent?.documentName !== "Actor" || !(item.system?.usosExtrasEm ?? []).length) return;
  await naurenAplicarDeltaUsosExtras(item.parent, [], naurenContribuicaoUsosExtras(item));
});
Hooks.on("preUpdateItem", (item, mudancas, opcoes) => {
  if (item.parent?.documentName !== "Actor" || !(item.system?.usosExtrasEm ?? []).length) return;
  opcoes.naurenUsosExtrasAntes = naurenContribuicaoUsosExtras(item);
});
Hooks.on("updateItem", async (item, mudancas, opcoes, userId) => {
  if (userId !== game.user.id || !opcoes?.naurenUsosExtrasAntes) return;
  await naurenAplicarDeltaUsosExtras(item.parent, opcoes.naurenUsosExtrasAntes, naurenContribuicaoUsosExtras(item));
});
Hooks.on("deleteItem", async (item, opcoes, userId) => {
  if (userId !== game.user.id || item.parent?.documentName !== "Actor" || !(item.system?.usosExtrasEm ?? []).length) return;
  await naurenAplicarDeltaUsosExtras(item.parent, naurenContribuicaoUsosExtras(item), []);
});

/**
 * Todo campo de arrastar (.nauren-uuid-input) mostra embaixo o NOME do item
 * (verde) ou "não encontrado" (vermelho) - também nos campos que o template
 * não montou com o nome. Atualiza ao arrastar/colar outro.
 */
function naurenMostrarNomesDosCamposUuid(raiz, ator = null) {
  const nomeDe = uuid => {
    if (uuid.startsWith("self:")) {
      const alvo = uuid.slice(5).trim().toLowerCase();
      const it = ator?.items.find(i => (i.type === "condicao" || i.type === "efeito") && i.name.trim().toLowerCase() === alvo);
      if (it) return `${it.name} (Condição desta criatura)`;
      if (naurenCondicaoDoSistemaPorNome(alvo)) return `${uuid.slice(5).trim()} (Condição do sistema)`;
      return ator ? null : `${uuid.slice(5).trim()} (Condição da criatura)`;
    }
    try { return fromUuidSync(uuid)?.name ?? null; } catch (err) { return null; }
  };
  raiz.querySelectorAll(".nauren-uuid-input").forEach(el => {
    const jaTem = el.nextElementSibling?.classList?.contains("nauren-uuid-resolved") && !el.nextElementSibling.dataset.auto;
    if (jaTem) return;
    let aviso = el.nextElementSibling?.dataset?.auto ? el.nextElementSibling : null;
    const atualizar = () => {
      const uuid = String(el.value ?? "").trim();
      // Só mostra o nome quando o valor parece o código de um item (ex.: "Compendium.x.y.Item.z"),
      // e não um nome de recurso como "determinacao".
      if (!uuid || (!/[.]/.test(uuid) && !uuid.startsWith("self:"))) { aviso?.remove(); aviso = null; return; }
      if (!aviso) {
        aviso = document.createElement("div");
        aviso.className = "nauren-uuid-resolved";
        aviso.dataset.auto = "1";
        el.insertAdjacentElement("afterend", aviso);
      }
      const nome = nomeDe(uuid);
      aviso.textContent = nome ? `→ ${nome}` : "→ não encontrado";
      aviso.classList.toggle("nauren-uuid-nao", !nome);
    };
    atualizar();
    el.addEventListener("input", atualizar);
    el.addEventListener("change", atualizar);
    el.addEventListener("drop", () => setTimeout(atualizar, 50));
  });
}

/**
 * "Sem custo": zera Estamina e Mana da Ação, inclusive quando vêm na lista de
 * custos de recurso próprio (ex.: Golpe Espiritual cobra a Estamina por lá).
 * Outros recursos (Energia, Estresse, Vida) continuam sendo cobrados.
 */
function naurenAcaoSemCustoEstaminaMana(acao) {
  const tira = ["estamina", "estaminaCombate", "mana"];
  return { ...acao, custoEstamina: 0, custoMana: 0, custoEstaminaPorNivel: [], custoManaPorNivel: [],
    custosRecursoProprio: (acao.custosRecursoProprio ?? []).filter(c => !tira.includes(String(c.recurso ?? ""))) };
}

/* ---------- Condições do alvo que mudam dano/cura recebidos (auditoria no card principal) ---------- */
/** Fotografa, em todos os tokens da cena, quem tem Dano Sofrido Extra ou Cura Recebida reduzida, e por quê. */
function naurenFotografarModsRecebidos() {
  const mapa = new Map();
  for (const t of canvas?.tokens?.placeables ?? []) {
    const a = t.actor; if (!a?.system) continue;
    const extra = a.system.danoRecebidoTotal ?? 0, pct = a.system.curaRecebidaPercentualTotal ?? 0;
    if (!extra && !pct) continue;
    const fontesDe = campo => a.items.filter(i => ["condicao", "efeito"].includes(i.type) && (i.type === "efeito" ? i.system.ativo : i.system.ativo !== false)
      && (i.system.modificadores ?? []).some(m => m.campo === campo)).map(i => i.name);
    mapa.set(t.document.uuid, { extra, pct, fontesDano: fontesDe("danoRecebido"), fontesCura: fontesDe("curaRecebidaPercentual") });
  }
  return mapa;
}
/**
 * Mostra no card PRINCIPAL o efeito das Condições do alvo: a linha "Dano" vira "10 + 2 = 12" (um alvo)
 * ou ganha uma linha por alvo, sempre com a fonte explicada. Mesmo para a Cura (Putrefato: "8 − 8 = 0").
 */
function naurenAnotarModsRecebidosNoCard(secondaryLines, fotos, porAlvo) {
  if (!fotos?.size || !porAlvo?.length) return;
  const afetados = porAlvo.map(a => ({ ...a, f: fotos.get(a.tokenUuid) })).filter(a => a.f);
  if (!afetados.length) return;
  const idxDano = secondaryLines.findIndex(l => /^Dano/.test(String(l.label ?? "")) && typeof l.value === "number");
  const idxCura = secondaryLines.findIndex(l => /^Cura/.test(String(l.label ?? "")) && typeof l.value === "number");
  const comDano = afetados.filter(a => a.f.extra && a.dano > 0);
  if (comDano.length && idxDano !== -1) {
    const base = secondaryLines[idxDano].value;
    const sinal = n => (n > 0 ? `+ ${n}` : `− ${Math.abs(n)}`);
    if (comDano.length === 1 && porAlvo.length === 1 && !secondaryLines[idxDano]._max) {
      const a = comDano[0];
      secondaryLines[idxDano] = { ...secondaryLines[idxDano], value: `${base} ${sinal(a.f.extra)} = ${Math.max(0, base + a.f.extra)}` };
    }
    for (const a of comDano) secondaryLines.splice(idxDano + 1, 0, { label: `Dano sofrido ${a.f.extra > 0 ? "extra" : "reduzido"}`, value: `${a.f.extra > 0 ? "+" : ""}${a.f.extra} em ${a.nome}`, breakdown: `${a.f.fontesDano.join(", ") || "Condição"} no alvo` });
  }
  const comCura = afetados.filter(a => a.f.pct);
  if (comCura.length && idxCura !== -1) {
    const base = secondaryLines[idxCura].value;
    if (comCura.length === 1 && porAlvo.length === 1) {
      const cortada = base - Math.max(0, Math.floor(base * (1 - comCura[0].f.pct / 100)));
      secondaryLines[idxCura] = { ...secondaryLines[idxCura], value: `${base} − ${cortada} = ${base - cortada}` };
    }
    const pos = secondaryLines.findIndex(l => /^Cura/.test(String(l.label ?? "")));
    for (const a of comCura) secondaryLines.splice(pos + 1, 0, { label: "Cura recebida reduzida", value: `−${a.f.pct}% em ${a.nome}`, breakdown: `${a.f.fontesCura.join(", ") || "Condição"} no alvo` });
  }
}

/* ---------- Corpo a corpo x à distância ---------- */
const NAUREN_TIPO_ALCANCE_NOMES = { corpoACorpo: "Corpo a corpo", distancia: "À distância" };
/** A Ação acerta um alvo com golpe/dano (o que faz sentido classificar)? Áreas ficam de fora. */
function naurenAcaoEhGolpe(acao) {
  if (!acao) return false;
  if (acao.modoAlvo === "area" || acao.usaTemplate) return false;
  return !!acao.ehAtaque || (acao.danos ?? []).some(d => d?.formula);
}
/** Palpite do modo "Automático": arma de Distância, nome de projétil ou alcance de 6 m ou mais. */
function naurenTipoAlcanceAdivinhado(item, acao) {
  const alc = parseFloat(String(acao?.alcance ?? "").replace(",", "."));
  const nomes = naurenNomeNormalizado(`${item?.name ?? ""} ${acao?.nome ?? ""} ${acao?._nomeAtaqueDaArma ?? ""}`);
  const projetil = /\b(arco|besta|flecha|virote|tiro|dispar|arremess|atira|cusp|cosp|projetil|dardo|azagaia|shuriken|funda|bumerangue|lancar)/.test(nomes) || /arma de fogo|pistola|mosquete|rifle|canhao/.test(nomes);
  const armaDistancia = item?.type === "arma" && item?.system?.categoria === "Distância";
  return (armaDistancia || projetil || (Number.isFinite(alc) && alc >= 6)) ? "distancia" : "corpoACorpo";
}
/**
 * Corpo a corpo ou à distância: "corpoACorpo" | "distancia" | "segueArma".
 * O campo da Ação manda; em "auto", Arma Escolhida segue a arma (só se sabe na hora),
 * e o resto usa o palpite. Lança/Armas de Alcance: corpo a corpo.
 */
function naurenTipoAlcanceDaAcao(item, acao) {
  const t = acao?.tipoAlcance;
  if (t === "corpoACorpo" || t === "distancia") return t;
  if (acao?.usaArmaEscolhida) return "segueArma";
  return naurenTipoAlcanceAdivinhado(item, acao);
}
/** Classificação explícita dos itens semeados que o palpite erraria (nome do item, ou "item|Ação"). */
const NAUREN_TIPO_ALCANCE_SEMEADO = {
  "Chicote Doloroso": "corpoACorpo",            // Vorax: chicote, alcance 6 m, mas é golpe
  "Rajada Luminosa": "distancia",               // Fera Espiritual: rajada a 4 m
  "Distorcer": "distancia",                     // O Órfão: "ataque especial à distância"
  "Emoções Obscuras": "distancia",              // Empíreo: chamas negras lançadas a 3 m
  "Caligrafia Etérea|Caligrafia — Dano (2 Energia)": "distancia",
  "Investida": "corpoACorpo", "Estocada": "corpoACorpo", "Estocada Profunda": "corpoACorpo",
  "Guilhotina Devastadora": "corpoACorpo", "Fulgor": "corpoACorpo",
  "Ataque Múltiplo": "distancia", "Disparo Quimérico": "distancia", "Disparo Químico": "distancia"
};
/**
 * Grava corpo a corpo/distância nas Ações de um item ANTES de ir para o compêndio
 * (só nos dados semeados; itens já na ficha de alguém não são tocados).
 */
function naurenFixarTipoAlcanceSemeado(dados) {
  const acoes = dados?.system?.acoes;
  if (!Array.isArray(acoes)) return dados;
  for (const a of acoes) {
    if (!a || a.tipoAlcance === "corpoACorpo" || a.tipoAlcance === "distancia") continue;
    const fixo = NAUREN_TIPO_ALCANCE_SEMEADO[`${dados.name}|${a.nome ?? ""}`] ?? NAUREN_TIPO_ALCANCE_SEMEADO[dados.name];
    if (fixo) { a.tipoAlcance = fixo; continue; }
    if (a.usaArmaEscolhida || !naurenAcaoEhGolpe(a)) continue; // Arma Escolhida segue a arma
    a.tipoAlcance = naurenTipoAlcanceAdivinhado(dados, a);
  }
  return dados;
}

/**
 * Resumo legível de uma Ação para a ficha: frase-resumo (HTML), etiquetas
 * (custo, alcance) e a linha de cada bloco (Custa, Rola, Afeta, Faz,
 * Penitência). Tudo é derivado da configuração - não guarda nada.
 */
function naurenResumoDaAcao(acao, item) {
  const esc = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const em = v => `<em>${esc(v)}</em>`;
  const legivel = f => String(f ?? "").replace(/@poderMagia/g, "PdM").replace(/@poderAtaque/g, "PdA").replace(/@espirito/g, "Espírito")
    .replace(/@vitalidade/g, "Vitalidade").replace(/@rank/g, "rank").replace(/@quantidadeEscolhida/g, "X").replace(/\s*\+\s*/g, " + ");
  const nomeDe = u => {
    if (typeof u === "string" && u.startsWith("self:")) return u.slice(5).trim();
    try { return fromUuidSync(u)?.name ?? "?"; } catch (err) { return "?"; }
  };
  const atributo = { poderAtaque: "Poder de Ataque", poderMagia: "Poder de Magia", maiorPoder: "o maior Poder", agilidade: "Agilidade", forca: "Força", inteligencia: "Inteligência", estamina: "Estamina", destino: "Destino", nenhum: "nenhum" }[acao.atributoAtaque] ?? acao.atributoAtaque;
  const recursoNome = r => String(r ?? "").startsWith("recursoCustom:") ? (String(r).split(":")[1] ?? "").replace(/^\w/, c => c.toUpperCase()) : ({ estamina: "Estamina", estaminaCombate: "Estamina", mana: "Mana", vida: "Vida", estresse: "Estresse" }[r] ?? r);
  // Custa
  const custos = [];
  if (acao.custoEstamina || acao.custoEstaminaPorCategoria) custos.push(`${acao.custoEstamina || 0}${acao.custoEstaminaPorCategoria ? " + extra da Categoria" : ""} Estamina`);
  if (acao.custoMana) custos.push(`${acao.custoMana} Mana`);
  for (const c of acao.custosRecursoProprio ?? []) if (c.ativo !== false && c.quantidade) custos.push(`${legivel(c.quantidade)} ${recursoNome(c.recurso)}${c.condicaoParaAtivar ? " (às vezes)" : ""}`);
  if (acao.usaCargas) custos.push("usa cargas");
  if (acao.usaUsos) custos.push(`${acao.usosMax ?? 1} uso(s) por ${({ cena: "cena", rodada: "rodada", turno: "turno", dia: "dia" })[acao.usosReset] ?? acao.usosReset ?? "cena"}`);
  // Afeta
  const areaTxt = acao.usaTemplate ? `${({ circle: "raio de", cone: "cone de", ray: "linha de", rect: "quadrado de" })[acao.templateTipo] ?? "área de"} ${acao.templateTamanho ?? 0}m` : "";
  const quem = acao.modoAlvo === "selecionado" ? `${acao.numeroAlvos > 1 ? `${acao.numeroAlvos} alvos marcados` : "1 alvo marcado"}`
    : acao.modoAlvo === "area" ? `quem estiver na área (${areaTxt}${acao.areaDisposicao && acao.areaDisposicao !== "todos" ? `, só ${acao.areaDisposicao}` : ""}${acao.areaExcluirEu ? ", menos você" : ""})`
    : acao.usaTemplatePersistente ? `uma área no mapa (${areaTxt})` : "você";
  const alcance = acao.alcance && acao.alcance !== "pessoal" ? acao.alcance : (acao.alcance === "pessoal" ? "pessoal" : "");
  // Faz
  const faz = [];
  for (const d of acao.danos ?? []) if (d.formula) faz.push(`${em(legivel(d.formula))} de dano`);
  for (const c of acao.curas ?? []) if (c.formula) faz.push(`cura ${em(legivel(c.formula))}`);
  for (const c of acao.condicoesAplicadas ?? []) if (c.uuid && c.ativo !== false) faz.push(`aplica ${em(`${nomeDe(c.uuid)}${(c.acumulos ?? 1) > 1 ? ` ×${c.acumulos}` : ""}`)}${c.soSeAcertar && !acao.ehAtaque ? " no acerto" : ""}`);
  if (acao.condicaoEmMimUuid) faz.push(`você recebe ${em(nomeDe(acao.condicaoEmMimUuid))}`);
  if (acao.usaTemplatePersistente) faz.push(`a área fica no mapa ${Number(acao.templatePersistenteDuracaoRodadas) > 0 ? `por ${acao.templatePersistenteDuracaoRodadas} rodada(s)` : "até o fim do combate"}`);
  if (acao.usaEntidade) faz.push(`cria ${em(acao.entidadeNome || "uma entidade")} no mapa${acao.entidadeSeguraCondicoes ? " que segura o alvo" : ""}`);
  if (acao.usaInvocar) {
    let nomeInv = "uma ficha";
    if (acao.invocarCopiaDeMim) nomeInv = "uma cópia de si";
    else if (acao.invocarAtorUuid) { try { nomeInv = fromUuidSync(acao.invocarAtorUuid)?.name ?? nomeInv; } catch (err) { /* nome genérico */ } }
    faz.push(`invoca ${acao.invocarQuantidade && acao.invocarQuantidade !== "1" ? `${esc(acao.invocarQuantidade)}× ` : ""}${em(nomeInv)}`);
  }
  if (acao.usaConjurarConsumivel) faz.push("cria um consumível");
  if (acao.usaDarPrioridade) faz.push("dá Prioridade ao alvo");
  const fazTxt = faz.length ? faz.join(", ") : "";
  // Frase
  const partes = [];
  const tipoAlc = naurenAcaoEhGolpe(acao) ? naurenTipoAlcanceDaAcao(item, acao) : null;
  const tipoAlcTxt = { corpoACorpo: "corpo a corpo", distancia: "à distância", segueArma: "com a arma escolhida" }[tipoAlc] ?? "";
  // 0.94.31: atributo "nenhum" (ex.: Arma de Inventor, que usa bônus fixo) não vira "com nenhum".
  const semAtributo = !atributo || /^nenhum$/i.test(String(atributo).trim());
  if (acao.ehAtaque) partes.push(`Ataque${tipoAlc && tipoAlc !== "segueArma" ? ` ${tipoAlcTxt}` : ""}${semAtributo ? "" : ` com ${em(atributo)}`} contra ${quem}${alcance && alcance !== "pessoal" ? ` a até ${esc(alcance)}` : ""}.`);
  else if (acao.danoDiretoSemTeste) partes.push(`Sem teste de ataque, atinge ${quem}${alcance && alcance !== "pessoal" ? ` a até ${esc(alcance)}` : ""}.`);
  else if (quem !== "você") partes.push(`Afeta ${quem}${alcance && alcance !== "pessoal" ? ` a até ${esc(alcance)}` : ""}.`);
  if (fazTxt) partes.push(`${acao.ehAtaque ? "No acerto: " : ""}${fazTxt.charAt(0).toUpperCase()}${fazTxt.slice(1)}.`);
  const ind = item?.system?.prioridadeIndicador;
  if (acao.naoGeraPrioridade || ind === "NP") partes.push("Não gera Prioridade.");
  else if (ind === "PI") partes.push("O alvo recebe Prioridade.");
  else if (ind === "PA") partes.push("Um aliado seu recebe Prioridade.");
  // Ação que só guarda usos (ex.: "Trocas de Espírito por rodada"): é um contador, não uma Ação para clicar.
  const soContador = !partes.length && acao.usaUsos && !acao.ehAtaque && !(acao.danos ?? []).length && !(acao.curas ?? []).length && !(acao.condicoesAplicadas ?? []).length;
  const resumo = partes.join(" ") || (soContador ? "Só conta os usos desta Habilidade; não é uma Ação para usar direto." : "Esta Ação ainda não faz nada: abra os blocos abaixo para configurar.");
  const etiquetas = [...(custos.length ? custos.slice(0, 3) : ["sem custo"]), ...(alcance ? [`alcance ${alcance}`] : []), ...(tipoAlc && tipoAlc !== "segueArma" ? [tipoAlcTxt] : [])];
  const palpite = acao.usaArmaEscolhida ? "segue a arma escolhida" : (naurenTipoAlcanceAdivinhado(item, acao) === "distancia" ? "à distância" : "corpo a corpo");
  const tira = t => String(t).replace(/<[^>]+>/g, "");
  return {
    _resumo: resumo, _etiquetas: etiquetas,
    _tipoAlcanceOpcoes: { auto: `Automático (${palpite})`, corpoACorpo: "Corpo a corpo", distancia: "À distância" },
    _motionUsuarioOpcoes: NAUREN_MOTION_USUARIO_OPCOES, _motionAlvoOpcoes: NAUREN_MOTION_ALVO_OPCOES,
    _bloco: {
      custa: { emUso: false, linha: custos.length ? custos.join(" • ") : "sem custo" },
      rola: { emUso: false, linha: acao.ehAtaque ? (/^nenhum$/i.test(String(atributo ?? "").trim()) ? "teste de ataque (1d20 + bônus)" : `teste de ataque com ${atributo}`) : acao.danoDiretoSemTeste ? "sem teste (dano direto)" : acao.usaTesteDeFalhaEscalonado ? "teste de falha escalonado" : "sem teste" },
      afeta: { emUso: false, linha: `${quem}${alcance ? ` • ${alcance}` : ""}${tipoAlc && tipoAlc !== "segueArma" ? ` • ${tipoAlcTxt}` : ""}` },
      faz: { emUso: false, linha: tira(fazTxt) || "nada configurado ainda" },
      condicionais: (() => {
        const l = [];
        if (acao.usaCondicaoAlvo) l.push(acao.exigirCondicaoAlvo ? "exige Condição no alvo" : "olha Condição no alvo");
        if (acao.usaCondicoesAlvoMultiplas) l.push("várias Condições no alvo");
        if (acao.usaCondicaoPropria) l.push("Condição em você");
        if (acao.usaDanoMaximoCondicional || acao.usaDanoMaximoPorMargem) l.push("dano máximo");
        if (String(acao.danoNoErroFormula ?? "").trim()) l.push("dano no erro");
        if (String(acao.limiarExecucaoFormula ?? "").trim()) l.push("execução");
        return { emUso: l.length > 0, linha: l.join(" • ") || "nenhuma" };
      })(),
      extras: (() => {
        const l = [];
        if (acao.usaArmaEscolhida) l.push("arma escolhida");
        if (acao.usaCondicaoEscolhida) l.push("escolher Condição");
        if (acao.usaPerguntaAtaqueNoTurno) l.push("pergunta se atacou");
        if (acao.usaEscolhaDeRecurso) l.push("escolher quantidade");
        if (acao.usaEscudo) l.push("escudo");
        if (acao.usaContagemArea) l.push("conta na área");
        if (acao.condicaoEmMimUuid) l.push("aplica em você");
        return { emUso: l.length > 0, linha: l.join(" • ") || "nenhum" };
      })(),
      penitencia: { emUso: !!acao.usaPenitencia, linha: acao.usaPenitencia ? "com penitência" : "não usa" }
    }
  };
}

/* ---- Conferência de fórmulas (0.93.3): o que o sistema entende e quanto dá agora ---- */
/** Termos com @ que o sistema reconhece (sem o @). Montado na 1ª consulta, a partir da lista documentada. */
let naurenTokensConhecidosCache = null;
function naurenTokensConhecidos() {
  if (naurenTokensConhecidosCache) return naurenTokensConhecidosCache;
  const s = new Set();
  for (const g of NAUREN_REFERENCIA_FORMULAS) for (const i of g.itens ?? []) {
    const m = /^@([A-Za-z]\w*)/.exec(String(i.token ?? ""));
    if (m && !/_$/.test(m[1])) s.add(m[1]);
  }
  for (const t of (typeof NAUREN_TOKENS_CONTEXTO !== "undefined" ? NAUREN_TOKENS_CONTEXTO : [])) s.add(t);
  for (const t of Object.keys(ATRIBUTOS_BONUS)) if (t !== "nenhum") s.add(t);
  // Termos que existem no código mas não estão na lista do botão ƒ.
  for (const t of ["acumulos", "rank", "valorBase", "destinoItensIniciais", "danoRecebido", "danoPenitencia", "curaRecebidaPercentual", "reducaoDanoPercentual",
    "alvoFerido", "alvoMetadeVida", "penitenciaAceita", "dadoDano", "membros", "membrosIniciais", "armaduraCompleta"]) s.add(t);
  return (naurenTokensConhecidosCache = s);
}
/** Termo conhecido mais parecido (erro de digitação: "@podeAtaque" → poderAtaque), ou null. */
function naurenTokenParecido(nome, conhecidos) {
  const dist = (x, y) => {
    x = x.toLowerCase(); y = y.toLowerCase();
    const d = Array.from({ length: x.length + 1 }, (_, i) => [i, ...Array(y.length).fill(0)]);
    for (let j = 1; j <= y.length; j++) d[0][j] = j;
    for (let i = 1; i <= x.length; i++) for (let j = 1; j <= y.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    return d[x.length][y.length];
  };
  let melhor = null, md = Infinity;
  for (const c of conhecidos) { const v = dist(nome, c); if (v < md) { md = v; melhor = c; } }
  return md <= Math.max(1, Math.min(3, Math.floor(nome.length / 3))) ? melhor : null;
}
/** Valor que um termo "da hora" (alvo, área, Bando...) assume só para a prévia. */
const NAUREN_PREVIA_CONTEXTO = { bandoExtra: 0, bandoNoAlcance: 1, bandoVivos: 1, bandoMembros: 1, membros: 1, membrosIniciais: 1, quantidadeEscolhida: 1, contagemArea: 1 };
/** Termos que só têm valor na hora do uso (dependem do alvo, da área, da escolha...). */
const NAUREN_TERMOS_DA_HORA = /^(alvo|vidaAlvo|vidaMaxAlvo|estresseAlvo|condicoesDistintasAlvo|acumulosAlvo|acumulosMeu|estresseMeu|estresseAliados|aliadosNoRaio|inimigosNoRaio|aliados_|bando|membros|prioridadesGeradas|crescimento|quantidadeEscolhida|contagemArea|atacouNesteTurno|euTenhoCondicao|penitenciaAceita|dadoDano|danoRecebido|danoPenitencia|custoManaDaAcao|rodadaCombate)/;
/**
 * Confere uma fórmula: termos desconhecidos, palavras que o sistema não lê, conta mal formada,
 * e (com ficha) o valor de agora com dados: { vazio, ok, erros[], desconhecidos[], texto, media, min, max, daHora[] }.
 */
function naurenValidarFormula(texto, actor = null, item = null, opcoes = {}) {
  const permitidos = opcoes.permitidos ? new Set(opcoes.permitidos) : null;
  const valores = opcoes.valores ?? {};
  const r = { vazio: false, ok: true, erros: [], desconhecidos: [], daHora: [], texto: "", media: null, min: null, max: null, temDado: false, aproximado: false };
  let f = String(texto ?? "").trim();
  if (!f) { r.vazio = true; return r; }
  if (f[0] === "=") f = f.slice(1).trim();
  // Palavras-chave que alguns campos aceitam no lugar de número, e referências (UUID) - não são conta.
  if (/^(vantagem|desvantagem|auto|todos|true|false)$/i.test(f) || /^(Compendium|Actor|Item|Scene|JournalEntry)\.[\w.-]+$/.test(f) || /^self:/.test(f)) { r.texto = f; r.palavraChave = true; return r; }
  if (f[0] === "!") f = f.slice(1).trim(); // filtro negado ("!@aliados_4m": só se NÃO houver aliado)
  if (/^-?\d+(\.\d+)?%?$/.test(f)) { r.texto = f; r.media = r.min = r.max = parseFloat(f); return r; }
  const conhecidos = naurenTokensConhecidos();
  const comFicha = !!actor;
  // 1) Termos com @ (com ou sem argumento).
  f = f.replace(/@(\w+)(\(([^)]*)\))?/g, (m, nome, comArg, arg) => {
    if (permitidos && !permitidos.has(nome)) {
      r.desconhecidos.push(`@${nome} (aqui só vale ${[...permitidos].map(t => "@" + t).join(", ")})`);
      return "0";
    }
    if (nome in valores) return `(${valores[nome]})`;
    const conhece = conhecidos.has(nome) || /^recurso_\w+$/.test(nome) || /^aliados_\d+(\.\d+)?m$/.test(nome) || /^equipados_\w+$/.test(nome);
    if (!conhece) {
      const quase = /^crescimento(d\d+)$/.exec(nome);
      const parecido = quase ? null : naurenTokenParecido(nome, conhecidos);
      r.desconhecidos.push(quase ? `@${nome} (escreva (@crescimento)${quase[1]})` : parecido ? `@${nome} (quis dizer @${parecido}?)` : `@${nome}`);
      return "0";
    }
    const daHora = NAUREN_TERMOS_DA_HORA.test(nome);
    if (daHora && !r.daHora.includes("@" + nome)) r.daHora.push("@" + nome);
    if (nome === "bandoDados") return `(${arg || "1d6"})`;
    if (nome === "rank") return String(Math.max(1, Number(item?.system?.rankAtual) || 1));
    if (nome === "acumulos") return String(Math.max(1, Number(item?.system?.acumulos) || 1));
    if (nome === "dadoDano") return "1d6";
    if (daHora) return String(NAUREN_PREVIA_CONTEXTO[nome] ?? 0) + (comArg ? "" : "");
    if (!comFicha) return "1";
    let v;
    try { v = naurenResolverTokenFormula(nome, actor); } catch (err) { v = 0; }
    return `(${v ?? 0})`;
  });
  for (const d of r.desconhecidos) r.erros.push(`não conheço ${d}`);
  // 2) "(expr)d8": resolve o número de dados antes.
  f = f.replace(/\s+/g, "");
  for (let k = 0; k < 4 && /\(([^()]*)\)d\d/.test(f); k++) {
    f = f.replace(/\(([^()]*)\)d(\d+)/g, (m, dentro, faces) => { try { return `${Math.max(0, Math.round(naurenAvaliarExpressaoSimples(dentro)))}d${faces}`; } catch (err) { r.erros.push(`não entendi o número de dados em "${m}"`); return `1d${faces}`; } });
  }
  // Parênteses à toa em volta de um número só ("(3)" vira "3"), para o texto ficar limpo.
  for (let k = 0; k < 4 && /\((-?\d+(\.\d+)?)\)/.test(f); k++) f = f.replace(/\((-?\d+(\.\d+)?)\)/g, "$1");
  r.texto = f.replace(/\+-/g, "-");
  // 3) Palavras que sobram (fora dados e funções conhecidas) o sistema não lê.
  const semDados = f.replace(/(\d*)d(\d+)((?:kh|kl|k|dh|dl|rr|r|xo|x|cs|cf|min|max)[<>=]*\d*)*/gi, (m, n, faces, mods) => { if (mods) r.aproximado = true; r.temDado = true; return `#${n || 1}#${faces}#`; });
  const palavras = (semDados.replace(/\b(floor|ceil|round|min|max|abs)\(/g, "(").match(/[A-Za-zÀ-ú_]+/g) ?? []).filter(w => !/^d$/i.test(w));
  for (const w of new Set(palavras)) r.erros.push(`não entendo "${w}"`);
  if (opcoes.semDados && r.temDado) r.erros.push("este campo não rola dados (use só números e @termos)");
  if (palavras.length || (opcoes.semDados && r.temDado)) { r.ok = false; return r; }
  // 4) Conta: média, mínimo e máximo trocando cada dado.
  const comDado = modo => semDados.replace(/#(\d+)#(\d+)#/g, (m, n, faces) => {
    const qn = Number(n), qf = Number(faces);
    return String(modo === "min" ? qn : modo === "max" ? qn * qf : qn * (qf + 1) / 2);
  });
  try {
    r.media = naurenAvaliarExpressaoSimples(comDado("media"));
    r.min = naurenAvaliarExpressaoSimples(comDado("min"));
    r.max = naurenAvaliarExpressaoSimples(comDado("max"));
    if (![r.media, r.min, r.max].every(Number.isFinite)) throw new Error("resultado não é um número (divisão por 0?)");
    if (r.min > r.max) [r.min, r.max] = [r.max, r.min];
  } catch (err) {
    r.erros.push(`conta mal formada: ${String(err?.message ?? err).replace(/ em "[^"]*"/, "")}`);
    r.media = r.min = r.max = null;
  }
  r.ok = r.erros.length === 0;
  return r;
}
/** Texto curto da prévia: "= 2d8+9 (média 18)". */
function naurenTextoPreviaFormula(v, comFicha) {
  if (v.vazio || v.palavraChave) return "";
  if (!v.ok) return `⚠ ${v.erros.join("; ")}`;
  const n = x => Number.isInteger(x) ? String(x) : String(Math.round(x * 10) / 10);
  const daHora = v.daHora.length ? ` · na hora: ${v.daHora.join(", ")}` : "";
  if (!comFicha) return `✓ fórmula válida (sem ficha: os valores entram na hora)${daHora}`;
  if (v.temDado) return `= ${v.texto} (média ${v.aproximado ? "≈" : ""}${n(v.media)}, de ${n(v.min)} a ${n(v.max)})${daHora}`;
  const exato = /^-?\d+(\.\d+)?$/.test(v.texto);
  return exato ? `= ${n(v.media)}${daHora}` : `= ${v.texto} = ${n(v.media)}${daHora}`;
}
/** Liga a prévia num campo de fórmula já embrulhado em .nauren-formula-campo. */
function naurenLigarPreviaFormula(el, actor, item) {
  if (el.dataset.naurenPrevia) return;
  el.dataset.naurenPrevia = "1";
  const caixa = el.closest(".nauren-formula-campo") ?? el.parentNode;
  const previa = document.createElement("span");
  previa.className = "nauren-formula-previa";
  caixa.appendChild(previa);
  const opcoes = {};
  if (el.dataset.naurenTokens) opcoes.permitidos = el.dataset.naurenTokens.split(",").map(t => t.trim()).filter(Boolean);
  if (el.dataset.naurenSemDados) opcoes.semDados = true;
  try { if (el.dataset.naurenValores) opcoes.valores = JSON.parse(el.dataset.naurenValores); } catch (err) { /* sem valores fixos */ }
  const atualizar = () => {
    const v = naurenValidarFormula(el.value, actor, item, opcoes);
    const txt = naurenTextoPreviaFormula(v, !!actor);
    previa.textContent = txt;
    previa.classList.toggle("erro", !v.ok);
    el.classList.toggle("nauren-formula-erro", !v.ok);
    // Número puro não precisa de prévia; erro aparece sempre.
    previa.classList.toggle("vazia", !txt || (v.ok && /^-?\d+(\.\d+)?%?$/.test(String(el.value).trim().replace(/^=/, ""))));
    if (!v.ok) el.title = txt; else if (el.title?.startsWith("⚠")) el.title = "";
  };
  el.addEventListener("input", atualizar);
  el.addEventListener("change", atualizar);
  atualizar();
}

/**
 * Campos que aceitam fórmula ganham um botão ƒ: abre a lista de termos
 * (NAUREN_REFERENCIA_FORMULAS) e insere o termo escolhido onde estava o cursor.
 */
function naurenBotoesDeFormula(raiz, { actor = null, item = null, so = null } = {}) {
  const ehFormula = el => {
    if (el.type !== "text" || el.classList.contains("nauren-uuid-input") || el.name === "name") return false;
    const campo = String(el.dataset.field ?? el.name ?? "");
    if (/nome$|Nome$|Uuid|uuid|img$|Img$|Imagem|tipoMunicao|itemNome|soItemNome|condicaoNome|grupo|Grupo|evento|recurso$|identifier|(^|\.)campo$/.test(campo)) return false;
    // Bônus de atributo (Efeitos, Pigmentos): aceitam @rank e outras fórmulas.
    if (/^system\.(forca|agilidade|inteligencia|estamina|destino|ataque|defesa|bloqueio|esquiva|dano|movimento|vida|mana|espirito|poderMagia|poderAtaque|vitalidade)$/.test(campo)) return true;
    return /@|\d+d\d+|fórmula|formula/i.test(el.placeholder ?? "") || /[Ff]ormula|quantidade$|Quantidade$|valor$|Valor$|Dado$|danoExtra|acumulos|Acumulos|alcanceExtra|Resolvid|condicaoParaAtivar/.test(campo);
  };
  raiz.querySelectorAll(so ?? 'input[type="text"]').forEach(el => {
    if (el.dataset.naurenFormula) { naurenLigarPreviaFormula(el, actor, item); return; }
    if (!so && !ehFormula(el)) return;
    el.dataset.naurenFormula = "1";
    const caixa = document.createElement("span");
    caixa.className = "nauren-formula-campo";
    el.parentNode.insertBefore(caixa, el);
    caixa.appendChild(el);
    const btn = document.createElement("a");
    btn.className = "nauren-formula-btn";
    btn.title = "Termos de fórmula (@rank, @poderMagia...)";
    btn.textContent = "ƒ";
    caixa.appendChild(btn);
    btn.addEventListener("click", async ev => {
      ev.preventDefault(); ev.stopPropagation();
      const pos = [el.selectionStart ?? el.value.length, el.selectionEnd ?? el.value.length];
      const grupos = NAUREN_REFERENCIA_FORMULAS.filter(g => !/Grupos exclusivos/i.test(g.categoria));
      const esc = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
      const html = `<div class="nauren-formulas-lista">${grupos.map(g => `<h4>${esc(g.categoria)}</h4>${g.itens.filter(i => String(i.token).startsWith("@")).map(i =>
        `<a class="nauren-formula-termo" data-token="${esc(i.token)}"><code>${esc(i.token)}</code><span>${esc(i.desc)}</span></a>`).join("")}`).join("")}</div>`;
      let escolhido = null;
      await foundry.applications.api.DialogV2.wait({
        window: { title: "Termos de fórmula" }, position: { width: 560 }, content: html,
        buttons: [{ action: "fechar", label: "Fechar" }], rejectClose: false,
        render: (e, dialog) => {
          const root = dialog?.element ?? e?.target?.element ?? document;
          root.querySelectorAll(".nauren-formula-termo").forEach(a => a.addEventListener("click", () => { escolhido = a.dataset.token; dialog?.close?.(); }));
        }
      }).catch(() => null);
      if (!escolhido) return;
      el.value = el.value.slice(0, pos[0]) + escolhido + el.value.slice(pos[1]);
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.focus();
    });
    naurenLigarPreviaFormula(el, actor, item);
  });
}

/**
 * Ajustes de custo de Mana de MAGIA vindos de Habilidades/Condições/Efeitos
 * (ex.: Combustão −rank, Buraco de Minhoca no Salto Etéreo, Empoderamento
 * Estelar +1). Na Conjuração Poderosa a magia é conjurada DUAS vezes, então
 * cada ajuste (e o custo mínimo) vale duas vezes.
 */
function naurenAjusteCustoManaMagia(actor, item, acao, poderosa = false) {
  const fator = poderosa ? 2 : 1;
  let delta = 0, minimo = 0;
  const linhas = [];
  for (const fonte of actor?.items ?? []) {
    const ativa = fonte.type === "habilidade" ? fonte.system.ativo !== false : fonte.type === "condicao" ? fonte.system.ativo !== false : fonte.type === "efeito" ? !!fonte.system.ativo : false;
    if (!ativa) continue;
    for (const aj of fonte.system.ajusteCustoMana ?? []) {
      if (aj.soMagiaComDano && !(acao?.danos ?? []).length) continue;
      if (aj.soItemNome && !String(item?.name ?? "").toLowerCase().includes(String(aj.soItemNome).toLowerCase())) continue;
      const v = (Number(aj.valor) || 0) * (aj.multiplicarPeloRank ? Math.max(1, fonte.system.rankAtual || 1) : 1) * fator;
      if (!v) continue;
      delta += v;
      minimo = Math.max(minimo, (Number(aj.minimo) || 0) * fator);
      linhas.push(`${fonte.name} ${v > 0 ? "+" : ""}${v}${poderosa ? " (×2, Poderosa)" : ""}`);
    }
  }
  return { delta, minimo, linhas };
}

/* ---- Conjuração Poderosa (Mago, versão do Felipe - 0.91) ---- */
const NAUREN_PODEROSA_EFEITOS = {
  dado: { nome: "Mais 1 dado de dano", icone: "fa-dice-d20", nota: "+1 dado de dano (do mesmo tipo do maior dado da magia)" },
  recurso: { nome: "Mais difícil de resistir", icone: "fa-lock", nota: "+1 no recurso para resistir à magia" },
  alcance: { nome: "Mais alcance", icone: "fa-arrows-left-right", nota: "+3 metros de alcance" },
  raio: { nome: "Raio maior", icone: "fa-circle-dot", nota: "+2 metros no raio da área" },
  facilidade: { nome: "Facilidade no ataque", icone: "fa-bullseye", nota: "Facilidade; repetido, +2 no teste por repetição" }
};
const NAUREN_PODEROSA_MAX_POR_EFEITO = 2; // Felipe: cada efeito acumula no máximo 2 vezes
/** +N dados de dano do mesmo tipo do maior dado da fórmula (ex.: 2d6+3 com 1 efeito → 2d6+3+1d6). */
function naurenMaisDadosPoderosa(formula, n) {
  if (!formula || !n) return formula;
  const faces = [...String(formula).matchAll(/\d*d(\d+)/gi)].map(m => Number(m[1])).filter(Number.isFinite);
  if (!faces.length) return formula;
  return `${formula}+${n}d${Math.max(...faces)}`;
}
function naurenCondicaoPoderosa(actor) {
  return actor?.items?.find(i => i.type === "condicao" && Array.isArray(i.getFlag("nauren", "poderosaEfeitos"))) ?? null;
}
/** Janela de escolha (cartões, mesmo estilo da Análise Paciente). Devolve o id do efeito ou null. */
async function naurenEscolherEfeitoPoderosa(actor) {
  const e = v => foundry.utils.escapeHTML(String(v ?? ""));
  const armados = naurenCondicaoPoderosa(actor)?.getFlag("nauren", "poderosaEfeitos") ?? [];
  let sel = null;
  const conteudo = `<div class="na-janela">
    <header class="na-cab"><i class="fas fa-bolt" style="font-size:26px;color:#cca162;width:40px;text-align:center;"></i><div><b>Conjuração Poderosa</b><span>Sua próxima magia recebe o efeito escolhido${armados.length ? ` · já armados: <b>${armados.length}</b>` : ""}</span></div></header>
    <div class="na-sec">Efeito <em>(cada um até 2× · repita usando de novo)</em></div>
    <div class="na-grade">${Object.entries(NAUREN_PODEROSA_EFEITOS).map(([k, x]) => {
      const vezes = armados.filter(a => a === k).length;
      const cheio = vezes >= NAUREN_PODEROSA_MAX_POR_EFEITO;
      return `<button type="button" class="na-op${k === "facilidade" ? " na-largo" : ""}${cheio ? " feito" : ""}" data-opcao="${k}" ${cheio ? "disabled" : ""}><i class="fas ${x.icone}"></i><span class="na-txt"><b>${e(x.nome)}${vezes ? ` <span class="na-cont">${vezes}/${NAUREN_PODEROSA_MAX_POR_EFEITO}</span>` : ""}</b><small>${cheio ? "no máximo (2×)" : e(x.nota)}</small></span></button>`;
    }).join("")}</div>
    ${armados.length ? `<div class="na-chips">${armados.map(a => `<span>${e(NAUREN_PODEROSA_EFEITOS[a]?.nome ?? a)}</span>`).join("")}</div>` : ""}
  </div>`;
  const r = await foundry.applications.api.DialogV2.wait({
    window: { title: "Conjuração Poderosa", icon: "fas fa-bolt" }, classes: ["nauren-analise-janela"], position: { width: 440 },
    content: conteudo,
    buttons: [{ action: "armar", label: "Armar", icon: "fas fa-bolt", default: true, callback: () => "armar" }, { action: "cancelar", label: "Cancelar" }],
    rejectClose: false,
    render: (ev, dialog) => {
      const raiz = dialog.element;
      const bt = raiz.querySelector('button[data-action="armar"]'); if (bt) bt.disabled = true;
      raiz.querySelectorAll("button.na-op:not([disabled])").forEach(b => b.addEventListener("click", () => {
        raiz.querySelectorAll("button.na-op").forEach(x => x.classList.toggle("sel", x === b));
        sel = b.dataset.opcao; if (bt) bt.disabled = false;
      }));
    }
  }).catch(() => "cancelar");
  return r === "armar" ? sel : null;
}
/** Soma o efeito na Condição "Conjuração Poderosa" (cria se não houver). Devolve linhas de card. */
async function naurenArmarPoderosa(actor, efeito) {
  const cond = naurenCondicaoPoderosa(actor);
  // Acúmulos tirados à mão valem: a lista fica só com os N primeiros antes de somar o novo.
  if (cond) { const lst = cond.getFlag("nauren", "poderosaEfeitos") ?? []; const nAc = Math.max(0, cond.system.acumulos ?? lst.length); if (lst.length > nAc) await cond.setFlag("nauren", "poderosaEfeitos", lst.slice(0, nAc)); }
  if ((cond?.getFlag("nauren", "poderosaEfeitos") ?? []).filter(x => x === efeito).length >= NAUREN_PODEROSA_MAX_POR_EFEITO) {
    return [{ label: "Conjuração Poderosa", value: `${NAUREN_PODEROSA_EFEITOS[efeito]?.nome ?? efeito} já está no máximo (2×)` }];
  }
  const lista = [...(cond?.getFlag("nauren", "poderosaEfeitos") ?? []), efeito];
  const descr = naurenMontarDescricao({ regra: `Sua próxima magia conjurada recebe: ${lista.map(k => NAUREN_PODEROSA_EFEITOS[k]?.nome ?? k).join(", ")}.`, automatico: "aplicado sozinho na próxima magia (o card dela mostra cada efeito); a Condição sai depois da magia ou no fim do combate.", manual: "" });
  if (cond) await cond.update({ "flags.nauren.poderosaEfeitos": lista, "system.acumulos": lista.length, "system.descricao": descr });
  else await actor.createEmbeddedDocuments("Item", [{ name: "Conjuração Poderosa", type: "condicao", img: "icons/magic/lightning/bolt-strike-blue.webp",
    system: { duracaoModo: "cena", negativa: "nao", acumulativel: true, acumulosMax: 99, acumulos: lista.length, modificadores: [], descricao: descr },
    flags: { nauren: { poderosaEfeitos: lista } } }]);
  return [{ label: "Conjuração Poderosa", value: `armado: ${NAUREN_PODEROSA_EFEITOS[efeito]?.nome ?? efeito}`, breakdown: `${lista.length} efeito(s) para a próxima magia: ${lista.map(k => NAUREN_PODEROSA_EFEITOS[k]?.nome ?? k).join(", ")}` }];
}

/**
 * Conjuração Poderosa = duas magias fundidas: dobra a fórmula termo a termo.
 * Dados têm a quantidade dobrada (4d6 -> 8d6); qualquer outro termo é
 * multiplicado por 2 (@poderMagia -> 2*@poderMagia, 5 -> 2*5, 2*@rank -> 2*2*@rank).
 */
function naurenFundirFormula(formula) {
  const f = String(formula ?? "").trim();
  if (!f) return f;
  const termos = []; let atual = "", prof = 0;
  for (const ch of f) {
    if (ch === "(") prof++;
    if (ch === ")") prof--;
    if ((ch === "+" || ch === "-") && prof === 0 && atual.trim()) { termos.push(atual); atual = ch; continue; }
    atual += ch;
  }
  if (atual.trim()) termos.push(atual);
  return termos.map(t => {
    const sinal = /^\s*[+-]/.test(t) ? t.trim()[0] : "";
    const corpo = t.trim().replace(/^[+-]\s*/, "");
    const dado = corpo.match(/^(\d*)d(\d+)(.*)$/i);
    const novo = dado ? `${(Number(dado[1]) || 1) * 2}d${dado[2]}${dado[3]}` : `2*${/^[\w@.]+$/.test(corpo) ? corpo : `(${corpo})`}`;
    return `${sinal ? ` ${sinal} ` : ""}${novo}`;
  }).join("").trim();
}

/**
 * Condições modelo dentro da ficha de um NPC: itens "condicao" com
 * flags.nauren.modelo = true (e ativo = false). As habilidades do próprio
 * NPC apontam para elas como "self:Nome da Condição"; na hora de usar, o
 * sistema troca pelo código do item embutido e copia o modelo no alvo.
 */
/** Condição do sistema (compêndio "Nauren - Condições e Venenos") pelo nome exato. */
/** Normaliza um nome para comparar: minúsculas, sem acentos, espaços simples. */
function naurenNomeNormalizado(t) {
  return String(t ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}
/** O nome bate com o alvo? Exato, ou uma das partes de um nome com "/" ou parênteses (ex.: "Preso" acha "Preso/Agarrado"). */
function naurenNomeBate(nomeItem, alvo) {
  const n = naurenNomeNormalizado(nomeItem), a = naurenNomeNormalizado(alvo);
  if (!a) return false;
  if (n === a) return true;
  return n.split(/\s*[\/()]\s*/).filter(Boolean).some(p => p === a);
}
function naurenCondicaoDoSistemaPorNome(nome) {
  const alvo = naurenNomeNormalizado(nome);
  const pk = game.packs?.find(p => p.metadata?.label === "Nauren - Condições e Venenos");
  if (!pk?.index) return null;
  let e = pk.index.find(x => naurenNomeNormalizado(x.name) === alvo) ?? pk.index.find(x => naurenNomeBate(x.name, alvo));
  if (!e) { const comeca = pk.index.filter(x => naurenNomeNormalizado(x.name).startsWith(alvo)); if (comeca.length === 1) e = comeca[0]; }
  return e ? (e.uuid ?? `Compendium.${pk.collection}.Item.${e._id}`) : null;
}
function naurenResolverSelf(valor, actor) {
  if (typeof valor !== "string" || !valor.startsWith("self:")) return valor;
  const nome = valor.slice(5).trim();
  const item = actor?.items.find(i => (i.type === "condicao" || i.type === "efeito") && naurenNomeNormalizado(i.name) === naurenNomeNormalizado(nome))
    ?? actor?.items.find(i => (i.type === "condicao" || i.type === "efeito") && naurenNomeBate(i.name, nome))
    ?? actor?.items.find(i => (i.type === "condicao" || i.type === "efeito") && naurenNomeNormalizado(i.name).includes(naurenNomeNormalizado(nome)));
  if (item) return item.uuid;
  // Não está na ficha: procura nas Condições do sistema (Sangramento, Preso, Caído...).
  const doSistema = naurenCondicaoDoSistemaPorNome(nome);
  if (doSistema) return doSistema;
  ui.notifications?.warn?.(`${actor?.name ?? "Ficha"}: não achei a Condição "${valor.slice(5)}" nem na ficha nem nas Condições do sistema.`);
  return "";
}
function naurenResolverSelfEmObjeto(obj, actor, prof = 0) {
  if (prof > 6 || obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(v => typeof v === "string" ? naurenResolverSelf(v, actor) : naurenResolverSelfEmObjeto(v, actor, prof + 1));
  const saida = {};
  for (const [k, v] of Object.entries(obj)) saida[k] = typeof v === "string" ? naurenResolverSelf(v, actor) : naurenResolverSelfEmObjeto(v, actor, prof + 1);
  return saida;
}
const naurenEhCondicaoModelo = i => i?.type === "condicao" && !!i.getFlag?.("nauren", "modelo");

/** Munições do inventário que servem nesta arma (mesmo tipo; arma sem tipo aceita qualquer munição; munição sem tipo serve em qualquer arma). */
function naurenMunicoesCompativeis(actor, arma) {
  const tipo = String(arma?.system?.tipoMunicao ?? "").trim().toLowerCase();
  return (actor?.items ?? []).filter(i => i.type === "consumivel" && i.system.ehMunicao && (i.system.quantidade ?? 0) > 0
    && (!tipo || !String(i.system.tipoMunicao ?? "").trim() || String(i.system.tipoMunicao ?? "").trim().toLowerCase() === tipo));
}

/* ---- Grimório do Mago: páginas em sequência ---- */
/** Botões "← Voltar / Avançar →" só com as direções possíveis (no começo não dá para voltar, no fim não dá para avançar). */
function naurenBotoesDirecaoGrimorio(actor, rotulo = "", extras = []) {
  const g = naurenGrimorio(actor);
  const bts = [];
  if (g.inicio < g.maxInicio) bts.push({ action: "1", label: `Avançar${rotulo} →`, default: true });
  if (g.inicio > 0) bts.push({ action: "-1", label: `← Voltar${rotulo}`, default: !bts.length });
  return [...bts, ...extras];
}
/** As magias do Grimório em ordem de página, a 1ª página aberta e quantas ficam abertas. */
function naurenGrimorio(actor) {
  const queimadas = actor?.getFlag?.("nauren", "paginasQueimadas");
  const idsQueimados = queimadas && queimadas.combate === game.combat?.id ? (queimadas.ids ?? []) : [];
  const paginas = (actor?.items ?? []).filter(i => i.type === "magia" && i.system.ehMagiaDeMago && !idsQueimados.includes(i.id))
    .sort((a, b) => ((a.system.paginaGrimorio || 9999) - (b.system.paginaGrimorio || 9999)) || a.sort - b.sort || a.name.localeCompare(b.name));
  const janela = 2;
  // Abre sempre em pares fixos (1–2, 3–4, 5–6...): o início é sempre par (0, 2, 4...).
  const maxInicio = paginas.length ? Math.floor((paginas.length - 1) / janela) * janela : 0;
  const bruto = Math.min(maxInicio, Math.max(0, actor?.getFlag?.("nauren", "grimorioInicio") ?? 0));
  const inicio = Math.floor(bruto / janela) * janela;
  const aspectus = actor?.getFlag?.("nauren", "aspectus") ?? [];
  const marcador = actor?.getFlag?.("nauren", "marcadorPagina") ?? null;
  return { paginas, janela, inicio, maxInicio, abertas: paginas.slice(inicio, inicio + janela), aspectus, marcador };
}
/** Move o Grimório N páginas (positivo = frente). Devolve o texto das abertas. */
async function naurenMoverGrimorio(actor, passos) {
  const g = naurenGrimorio(actor);
  // "passos" em páginas; o resultado cai sempre no início de um par.
  const novo = Math.floor(Math.min(g.maxInicio, Math.max(0, g.inicio + passos)) / g.janela) * g.janela;
  await actor.setFlag("nauren", "grimorioInicio", novo);
  await naurenSincronizarGrimorio(actor);
  const g2 = naurenGrimorio(actor);
  return { mudou: novo !== g.inicio, texto: g2.abertas.length ? (g2.abertas.length === 1 ? `página ${g2.inicio + 1}` : `páginas ${g2.inicio + 1}–${g2.inicio + g2.abertas.length}`) : "sem magias", nomes: g2.abertas.map(m => m.name).join(" • ") };
}
/** Ordem da lista de magias da ficha: as do Grimório pela página, depois as outras (pela ordem manual do Foundry). */
function naurenOrdemListaMagias(a, b) {
  const ga = a.system.ehMagiaDeMago ? 0 : 1, gb = b.system.ehMagiaDeMago ? 0 : 1;
  if (ga !== gb) return ga - gb;
  if (!ga) return ((a.system.paginaGrimorio || 9999) - (b.system.paginaGrimorio || 9999)) || (a.sort ?? 0) - (b.sort ?? 0);
  return (a.sort ?? 0) - (b.sort ?? 0);
}
/** Coloca a magia "movida" antes (ou depois) da magia "alvo" no Grimório e renumera as páginas. Livre: é para o jogador
 *  organizar (ou consertar) o livro; o Callux Andaris continua com as próprias trocas em combate. */
async function naurenReordenarGrimorio(actor, movidaId, alvoId, depois = false) {
  const todas = actor.items.filter(i => i.type === "magia" && i.system.ehMagiaDeMago)
    .sort((a, b) => ((a.system.paginaGrimorio || 9999) - (b.system.paginaGrimorio || 9999)) || (a.sort ?? 0) - (b.sort ?? 0));
  const movida = todas.find(m => m.id === movidaId);
  if (!movida) return;
  const ordem = todas.filter(m => m.id !== movidaId);
  const k = ordem.findIndex(m => m.id === alvoId);
  if (k < 0) return;
  ordem.splice(depois ? k + 1 : k, 0, movida);
  const updates = ordem.map((m, i) => ({ _id: m.id, "system.paginaGrimorio": i + 1 })).filter(u => actor.items.get(u._id).system.paginaGrimorio !== u["system.paginaGrimorio"]);
  if (updates.length) await actor.updateEmbeddedDocuments("Item", updates);
  await naurenSincronizarGrimorio(actor);
}
/** Renumera as páginas (1..N) e abre só as da janela atual. */
async function naurenSincronizarGrimorio(actor) {
  if (!actor?.isOwner) return;
  const g = naurenGrimorio(actor);
  const abertas = new Set([...g.abertas.map(i => i.id), ...g.aspectus]);
  const updates = g.paginas.map((m, i) => ({ _id: m.id, "system.paginaGrimorio": i + 1, "system.paginaAberta": abertas.has(m.id) }))
    .filter(u => { const m = actor.items.get(u._id); return m.system.paginaGrimorio !== u["system.paginaGrimorio"] || m.system.paginaAberta !== u["system.paginaAberta"]; });
  if (updates.length) await actor.updateEmbeddedDocuments("Item", updates);
}
// Magia nova de Mago vai para a próxima página livre.
Hooks.on("createItem", async (item) => {
  if (item.type !== "magia" || !item.system.ehMagiaDeMago || !item.parent || !naurenSouResponsavelPor(item.parent)) return;
  await naurenSincronizarGrimorio(item.parent);
});

/** Tem um estado ativo (Condição ou Efeito) cujo nome contém o texto? */
function naurenTemEstado(actor, texto) {
  const t = String(texto ?? "").toLowerCase();
  return !!t && (actor?.items ?? []).some(i => (i.type === "condicao" ? i.system.ativo !== false : i.type === "efeito" ? !!i.system.ativo : false) && i.name.toLowerCase().includes(t));
}
/** Aliados (mesmo lado) a até N metros. */
function naurenAliadosAte(actor, metros) {
  const meu = actor?.getActiveTokens?.(true)?.[0];
  if (!meu || !canvas?.tokens) return 0;
  return canvas.tokens.placeables.filter(t => t !== meu && t.actor && t.actor !== actor && t.document.disposition === meu.document.disposition
    && naurenMedirDistanciaBordas(meu, t) <= metros).length;
}

/* ---- Derrotado a 0 de Vida ---- */
const naurenVidaZerouEmCurso = new Set();
/** Último atacante de cada ator (uuid do ator → token de quem atacou), usado pelo evento "vidaZerou". */
const naurenUltimoAtacante = new Map();
function naurenAtacanteRecente(actor) {
  const r = naurenUltimoAtacante.get(actor?.uuid);
  return r && Date.now() - r.t < 20000 ? r.uuid : null;
}
Hooks.on("updateActor", async (actor, mudancas) => {
  if (game.users.activeGM !== game.user) return;
  if (foundry.utils.getProperty(mudancas, "system.vida.value") === undefined) return;
  if (!game.settings.get("nauren", "derrotadoAutomatico")) return;
  if (actor.getFlag?.("nauren", "entidade")) return; // estruturas somem sozinhas
  let morto = (actor.system.vida?.value ?? 1) <= 0;
  const idMorto = CONFIG.specialStatusEffects?.DEFEATED ?? "dead";
  // "Minha Vida chegou a 0" (Criador de Monstros, M09): ANTES de cair, as Habilidades do próprio
  // ator reagem (ganhar Vida para ficar de pé, usar uma Ação de despedida, soltar uma Condição),
  // e os aliados sabem ("Um aliado caiu"). Se alguma reação devolver Vida, ele não é marcado.
  const jaMarcado = actor.statuses?.has?.(idMorto) ?? false;
  if (morto && !jaMarcado && !naurenVidaZerouEmCurso.has(actor.uuid)) {
    naurenVidaZerouEmCurso.add(actor.uuid);
    try {
      await naurenProcessarGatilhos("vidaZerou", actor, { vidaAntes: foundry.utils.getProperty(mudancas, "system.vida.value"), atacanteTokenUuid: naurenAtacanteRecente(actor) }).catch(() => {});
      naurenProcessarGatilhos("aliadoCaiu", actor, {}).catch(() => {});
    } finally { naurenVidaZerouEmCurso.delete(actor.uuid); }
    if ((actor.system.vida?.value ?? 0) > 0) {
      morto = false;
      naurenPostarCard({ ator: actor, titulo: "Continua de pé", icone: actor.img, fonte: "Vida chegou a 0",
        linhas: [game.settings.get("nauren", "mostrarVidaNosCards")
          ? { label: "Vida", value: `0 → ${actor.system.vida.value}`, breakdown: "uma reação devolveu Vida antes de cair" }
          : { label: "Não caiu", value: "voltou a ter Vida", breakdown: "uma reação devolveu Vida antes de cair" }] }).catch(() => {});
    }
  }
  try {
    if ((actor.statuses?.has?.(idMorto) ?? false) !== morto) await actor.toggleStatusEffect(idMorto, { active: morto, overlay: true });
  } catch (err) { console.warn("Nauren RPG | Não consegui marcar/desmarcar o ícone de derrotado.", err); }
  for (const combate of game.combats ?? []) {
    for (const c of combate.combatants) {
      if (c.actor?.uuid !== actor.uuid) continue; // só ESTE token/ficha: cópias não vinculadas têm o mesmo actorId, mas uuids diferentes
      if (!!c.defeated !== morto) await c.update({ defeated: morto }).catch(() => {});
    }
  }
});

/**
 * O item é a habilidade/Condição "nome"? Confere a marca interna (seedId, que
 * vai junto quando o item sai do compêndio) e, na falta dela, o nome. Assim,
 * renomear ou traduzir o item na ficha não quebra a mecânica.
 */
const NAUREN_SEEDS_POR_NOME = {"Arsenal de Armadilhas": ["habilidade-cacador-arsenal-de-armadilhas"], "Aspectus Sternvaloir": ["habilidade-mago-aspectus-sternvaloir"], "Callux Andaris": ["habilidade-mago-callux-andaris"], "Camuflagem": ["habilidade-cacador-camuflagem"], "Codex Sapiente": ["habilidade-mago-codex-sapiente"], "Dança do Espírito Bêbado": ["habilidade-mistico-danca-do-espirito-bebado"], "Druidismo": ["habilidade-druida-druidismo"], "Eco do Ideograma": ["condicao-eco-do-ideograma", "habilidade-mistico-eco-do-ideograma"], "Espalhar a Palavra": ["habilidade-mistico-espalhar-a-palavra"], "Fortaleza das Emoções": ["habilidade-empireo-fortaleza-das-emocoes"], "Golpe Espiritual": ["habilidade-mistico-golpe-espiritual"], "Grimório Selvagem": ["habilidade-mago-grimorio-selvagem"], "Grimório do Mago": ["habilidade-mago-grimorio"], "Guiar o Destino": ["habilidade-sacerdote-guiar-o-destino"], "Impulso": ["habilidade-empireo-impulso"], "Inundação Espiritual": ["condicao-inundacao-espiritual", "habilidade-mistico-inundacao-espiritual"], "Marcado pela Epigrafia": ["condicao-marcado-pela-epigrafia"], "Olhos Malignos": ["condicao-olhos-malignos"], "Oportunista ao Extremo": ["habilidade-ladino-oportunista-ao-extremo"], "Postura Gruhua": ["habilidade-mistico-postura-gruhua"], "Páginas em Chamas": ["habilidade-mago-paginas-em-chamas"], "Rapidez": ["habilidade-empireo-rapidez"], "Se Afastar": ["habilidade-empireo-se-afastar"], "Soberano das Feras": ["habilidade-cacador-soberano-das-feras"], "Sombra e Luz": ["habilidade-sacerdote-sombra-e-luz"], "Teomanina": ["habilidade-sacerdote-teomanina"], "Treinamento de Resistência": ["habilidade-cacador-treinamento-de-resistencia"], "Tudo é Meu!": ["habilidade-ladino-tudo-e-meu"], "Verdade Atordoante": ["habilidade-ladino-verdade-atordoante"], "Virtude da Coragem": ["habilidade-empireo-virtude-da-coragem"]};
/** Capacidades especiais: comportamentos do motor que qualquer Habilidade, Condição ou Efeito pode marcar na ficha. */
const NAUREN_CAPACIDADES = {
"grimorio": {
"nome": "Grimório (livro de páginas)",
"desc": "Mostra o painel Grimório: magias de Mago em páginas, 2 abertas por vez.",
"legado": "Grimório do Mago"
},
"grimorioPassarExtra": {
"nome": "Grimório: passar páginas extras",
"desc": "Ao virar a página, pode passar até rank páginas a mais.",
"legado": "Codex Sapiente"
},
"grimorioReordenar": {
"nome": "Grimório: reordenar após meditar",
"desc": "Meditar 1 hora (fora de combate) libera rank trocas de posição entre magias.",
"legado": "Callux Andaris"
},
"grimorioMarcador": {
"nome": "Grimório: marcador de página",
"desc": "Marca uma página; a Ação \"Ir para a página marcada\" vai direto a ela.",
"legado": "Marcador de Página"
},
"grimorioSemPagina": {
"nome": "Grimório: conjurar sem a página",
"desc": "Até rank magias marcadas com estrela podem ser conjuradas com a página fechada.",
"legado": "Aspectus Sternvaloir"
},
"grimorioSelvagem": {
"nome": "Grimório: páginas se movem ao conjurar",
"desc": "Depois de cada magia, rola d4 (d6 no rank 2, d8 no 3) e o Grimório avança ou volta esse número.",
"legado": "Grimório Selvagem"
},
"condensarGratis": {
"nome": "Condensar sem Estamina (1ª do combate)",
"desc": "A 1ª magia condensada no combate não cobra a Estamina do Condensar; queimar uma página recupera o uso.",
"legado": "Páginas em Chamas"
},
"armadilhaEscolherTipo": {
"nome": "Armadilha: escolher Explosiva/Destrutiva",
"desc": "Ao armar, escolhe o tipo da armadilha.",
"legado": "Arsenal de Armadilhas"
},
"armadilhaInvisivel": {
"nome": "Armadilha invisível",
"desc": "Suas armadilhas ficam invisíveis aos inimigos (+1 de custo).",
"legado": "Camuflagem"
},
"brindeDanca": {
"nome": "Brinde: Dança do Espírito",
"desc": "O Brinde ao Destino pode dar Dança do Espírito Bêbado.",
"legado": "Dança do Espírito Bêbado"
},
"druidismo": {
"nome": "Druidismo (bênção ao subir de nível)",
"desc": "Quando alguém do grupo sobe de nível, escolhe Lagoa, Cachoeira ou Chuva.",
"legado": "Druidismo"
},
"ecoDano": {
"nome": "Eco: repetir o dano no tique",
"desc": "O dano de Epigrafia/Palavra ecoa no tique da Condição.",
"legado": "Eco do Ideograma"
},
"espalharPalavra": {
"nome": "Espalhar a Palavra",
"desc": "A Prioridade que você dá leva a Palavra ao aliado.",
"legado": "Espalhar a Palavra"
},
"anularDanoComEstresse": {
"nome": "Estresse anula todo o dano (1× por combate)",
"desc": "Em Profusão Retraída, 1 Estresse anula todo o dano de um golpe, 1 vez por combate.",
"legado": "Fortaleza das Emoções"
},
"golpeEspiritual": {
"nome": "É o Golpe Espiritual (dado de referência)",
"desc": "Outras habilidades usam o dado de dano desta.",
"legado": "Golpe Espiritual"
},
"guiarDestino": {
"nome": "Guiar o Destino",
"desc": "Pode ceder seus Dados de Destino a aliados.",
"legado": "Guiar o Destino"
},
"impulso": {
"nome": "Impulso (movimento em Profusão)",
"desc": "Em Profusão, o movimento ganha o bônus do Impulso (1 uso).",
"legado": "Impulso"
},
"energiaEmDobro": {
"nome": "Energia em dobro",
"desc": "Enquanto ativa, toda Energia ganha é dobrada.",
"legado": "Inundação Espiritual"
},
"reflexosDaMarca": {
"nome": "Marca do Caçador (valor dos Reflexos)",
"desc": "O rank desta habilidade é o bônus de Reflexos de Caça contra o alvo marcado.",
"legado": "Marca do Caçador"
},
"epigrafia": {
"nome": "Epigrafia (morte ao ficar com pouca Vida)",
"desc": "O alvo morre quando a Vida fica abaixo de 5 × acúmulos.",
"legado": "Marcado pela Epigrafia"
},
"olhoMaligno": {
"nome": "Olho Maligno (reduz ataque recebido)",
"desc": "Consome um acúmulo para reduzir em 1d10 um ataque contra você.",
"legado": "Olhos Malignos"
},
"oportunistaExtremo": {
"nome": "Oportunista ao Extremo",
"desc": "Roubar Prioridade fica mais forte (limites do Ladino).",
"legado": "Oportunista ao Extremo"
},
"esquivaComEnergia": {
"nome": "Esquivar com Energia",
"desc": "No popup de reação, pode pagar a Esquiva com Energia.",
"legado": "Postura Gruhua"
},
"rapidez": {
"nome": "Maior iniciativa ao iniciar",
"desc": "No começo do combate, você age primeiro.",
"legado": "Rapidez"
},
"seAfastar": {
"nome": "Sozinho: reduz o dano",
"desc": "Sem aliados a até 4m, reduz o dano sofrido pelo seu Poder de Magia.",
"legado": "Se Afastar"
},
"soberanoFeras": {
"nome": "Mais mascotes (Soberano das Feras)",
"desc": "Aumenta o limite de mascotes.",
"legado": "Soberano das Feras"
},
"sombraELuz": {
"nome": "Sombra e Luz",
"desc": "Efeitos de outro Sacerdote sobre você ganham o bônus de Sombra e Luz.",
"legado": "Sombra e Luz"
},
"teomanina": {
"nome": "Teomanina",
"desc": "Mecânica de penitência compartilhada do Sacerdote.",
"legado": "Teomanina"
},
"treinoResistencia": {
"nome": "Treinamento de Resistência (mascote)",
"desc": "O mascote ganha resistência pelo treino.",
"legado": "Treinamento de Resistência"
},
"roubarD20": {
"nome": "Tudo é Meu! (guardar d20 de aliado)",
"desc": "Guarda o último d20 de um aliado para usar depois.",
"legado": "Tudo é Meu!"
},
"verdadeAtordoante": {
"nome": "Reagir com Verdade Atordoante",
"desc": "Ao ser atacado, pode reagir com a Verdade Atordoante.",
"legado": "Verdade Atordoante"
},
"semExclusividade": {
"nome": "Ignorar a exclusividade de grupo",
"desc": "Enquanto ativo, estados do mesmo grupo exclusivo (ex.: as duas Guardas) podem ficar ligados juntos.",
"legado": "Juramento da Guarda"
},
"armadilhaPrioridadeMascotes": {
"nome": "Armadilha dá Prioridade aos mascotes",
"desc": "Quando uma armadilha sua é ativada, seus mascotes recebem Prioridade.",
"legado": "Aspecto Alfa"
},
"venenoCravadoPorTurno": {
"nome": "Venenos cravados agem por turno",
"desc": "Venenos que você aplica por flecha (munição ou arma à distância) ou lança causam o efeito a cada turno, em vez de a cada rodada.",
"legado": "Ingrediente Ofídico"
},
"crescimentoSemManaPorRodada": {
"nome": "1º Crescimento da rodada sem Mana extra",
"desc": "O primeiro uso de Crescimento em cada rodada não custa Mana extra (usa os usos passivos do item).",
"legado": "Cultivar a Utopia"
},
"virtudeCoragem": {
"nome": "Virtude da Coragem (agir primeiro)",
"desc": "Se age primeiro no combate, escolhe um bônus.",
"legado": "Virtude da Coragem"
},
"estrelaArcoIris": {"nome": "Estrela do Arco Íris (oferta do Dragão de Tinta)", "desc": "Quando um aliado chega a 5 Pontos de Pintura, oferece o Dragão de Tinta.", "legado": "Estrela do Arco Íris, Otaki"},
"acovardar": {"nome": "Acovardar (reação a ataques de aliados)", "desc": "Reage quando um aliado por perto é atacado (Acovardar do Ladino).", "legado": "Acovardar"},
"estiloMares": {"nome": "Guardas sem penalidade", "desc": "As Guardas (grupo \"guarda\") perdem as penalidades.", "legado": "Estilo das Marés"},
"investidaItem": {"nome": "É a Investida", "desc": "Marca o item como a Investida, que muda com a Guarda quando há Investida Relâmpago.", "legado": "Investida"},
"investidaRelampago": {"nome": "Investida muda com a Guarda", "desc": "A Investida ganha efeito conforme a Guarda ativa (Ofensiva ou Defensiva).", "legado": "Investida Relâmpago"},
"darPrioridadeItem": {"nome": "É o Dar Prioridade", "desc": "Marca o item como a Ação de Dar Prioridade (usado por Chamar as Armas).", "legado": "Dar Prioridade"},
"chamarArmas": {"nome": "Dar Prioridade a mais um aliado", "desc": "Ao Dar Prioridade, gasta 1 Espírito da Batalha para mais um aliado receber.", "legado": "Chamar as Armas"},
"toxinaLaminar": {"nome": "Aplicar veneno sem custo na 1ª rodada", "desc": "Aplicar veneno na arma não custa Estamina na primeira rodada do combate.", "legado": "Toxina Laminar"},
"comungar": {"nome": "É o Comungar", "desc": "Marca o item como o Comungar (Comunhão do Sábio troca o que ele restaura).", "legado": "Comungar"},
"manutencaoPrisma": {"nome": "Só um aliado com o bônus de Destino", "desc": "Escolher outro aliado tira o bônus do anterior (Manutenção do Prisma).", "legado": "Manutenção do Prisma"},
"restauracaoInterior": {"nome": "Escolher a cor do Ponto de Pintura da cura", "desc": "Quem a cura deu Ponto de Pintura recebe a cor escolhida (Epifania Colorida).", "legado": "Restauração Interior"},
"tracoCelestial": {"nome": "Palavra ao agir em Prioridade de aliado", "desc": "Ao agir numa Prioridade dada por um aliado, escreve uma Palavra num alvo a até 4 m.", "legado": "Traço Celestial"},
"espiritoArdiloso": {"nome": "Gastar reserva para Condição no acerto", "desc": "Em combate, gasta 1 da reserva para Caído, Cego ou Sangramento no alvo atingido.", "legado": "Espírito Ardiloso"},
"sequenciaCaligrafica": {"nome": "Golpe Espiritual marca Palavra", "desc": "Todo Golpe Espiritual que acerta marca o alvo com uma Palavra.", "legado": "Sequência Caligráfica"},
"pontoDePintura": {"nome": "É Ponto de Pintura", "desc": "Marca a Condição como Ponto de Pintura (contada pela Estrela do Arco Íris e pelas Pinturas).", "legado": "Ponto de Pintura"},
"pinturaHarmonia": {"nome": "Pintura da Harmonia", "desc": "Efeito extra ao aplicar a Condição pelo Gatilho (Pintura da Harmonia).", "legado": "Pintura da Harmonia"},
"tracoAquarela": {"nome": "Pinta o caminho por onde passa", "desc": "Os quadrados por onde o token passa ficam pintados até o fim da cena.", "legado": "Traço da Aquarela"},
"passoGatuno": {"nome": "Passo Gatuno", "desc": "Reage ao movimento do dono (Passo Gatuno do Ladino).", "legado": "Passo Gatuno"},
"caidoMovimento": {"nome": "Movimento pela metade", "desc": "Enquanto ativa, o movimento do dono cai pela metade (Caído).", "legado": "Caído"},
"oracaoPrisma": {"nome": "Guardar o Destino (Oração do Prisma)", "desc": "Permite guardar o Dado de Destino rolado (Oração do Prisma).", "legado": "Oração do Prisma"},
"espiritoBatalha": {"nome": "Trocas de Espírito por rodada", "desc": "O item conta as trocas de Espírito da Batalha por rodada.", "legado": "Espírito de Batalha"},
"esquivaInstintiva": {"nome": "Esquivas Instintivas por turno", "desc": "O item conta as Esquivas Instintivas por turno.", "legado": "Esquiva Instintiva"},
"comunhaoSabioPendente": {"nome": "Comunhão do Sábio pendente", "desc": "Condição que faz o próximo Comungar restaurar Estamina.", "legado": "Comunhão do Sábio (Pendente)"},
"aureum": {"nome": "Dado de Acalanto no início do combate", "desc": "Ao entrar num combate, o dono rola o d20 guardado do Acalanto do Destino (Palavra de Destino: Aureum).", "legado": "Palavra de Destino: Aureum"},
"exercicioTeorico": {"nome": "É o Exercício Teórico", "desc": "Marca o item como o Exercício Teórico (a Bancada e o Alambique oferecem usá-lo).", "legado": "Exercício Teórico"},
"golpeEspiritual": {"nome": "É um Golpe Espiritual", "desc": "Os ataques deste item contam como Golpe Espiritual (Sequência Caligráfica e Eco do Ideograma reagem a eles).", "legado": "Golpe Espiritual"},
"semMana": {"nome": "Sem Mana", "desc": "Enquanto o item estiver na ficha: Mana máxima 0 e nenhuma Ação com custo de Mana (ex.: Capacidade Inventiva do Inventor).", "legado": "Capacidade Inventiva"}
};
const NAUREN_CAPACIDADE_POR_NOME = Object.fromEntries(Object.entries(NAUREN_CAPACIDADES).map(([k, v]) => [v.legado, k]));
/** Golpe Espiritual: o item (capacidade, semente ou nome) ou uma Ação com esse nome ("Golpe Espiritual: ..."). */
function naurenEhGolpeEspiritual(item, acao = null) {
  return naurenEhItem(item, "Golpe Espiritual") || /^Golpe Espiritual/.test(item?.name ?? "") || /^Golpe Espiritual/.test(acao?.nome ?? "");
}
function naurenEhItem(item, nome) {
  if (!item) return false;
  const chaveCap = NAUREN_CAPACIDADE_POR_NOME[nome];
  if (chaveCap && (item.system?.capacidades ?? []).includes(chaveCap)) return true;
  const sid = item.getFlag?.("nauren", "seedId") ?? item.flags?.nauren?.seedId;
  if (sid && (NAUREN_SEEDS_POR_NOME[nome] ?? []).includes(sid)) return true;
  return item.name === nome;
}

/** Condições negativas do livro (Cap. V). */
const NAUREN_CONDICOES_NEGATIVAS_LIVRO = ["alvejado", "preso", "agarrado", "caído", "caido", "cego", "amedrontado", "pânico", "panico", "pavor", "atordoado", "desacordado", "envenen", "veneno", "sangramento", "hemorragia", "fragmentado", "queimando", "congelando", "lerdeza", "desestabilizado"];
/**
 * A Condição é negativa para quem a tem? "sim"/"não" na Condição mandam;
 * no automático: as negativas do livro, dano periódico, penalidade numérica
 * ou proibir Bloquear/Esquivar. Marcas de estudo não contam.
 */
function naurenCondicaoNegativa(item) {
  const sys = item?.system ?? {};
  if (sys.negativa === "sim") return true;
  if (sys.negativa === "nao") return false;
  if (item.getFlag?.("nauren", "estudo")) return false;
  const nome = String(item.name ?? "").toLowerCase();
  if (NAUREN_CONDICOES_NEGATIVAS_LIVRO.some(n => nome.includes(n))) return true;
  if ((sys.efeitosPeriodicos ?? []).some(e => e.recurso === "dano")) return true;
  if (sys.proibeBloqueio || sys.proibeEsquiva) return true;
  return (sys.modificadores ?? []).some(m => {
    const v = String(m.valor ?? "").trim();
    if (m.campo === "vantagemAtaqueRecebido") return !v.startsWith("-");
    if (m.campo === "reducaoDano") return v.startsWith("-");
    if (m.campo === "danoRecebido") return !v.startsWith("-");
    if (m.campo === "curaRecebidaPercentual") return !v.startsWith("-");
    return v.startsWith("-");
  });
}

/** Armadilha de Caça: quem está Preso por uma armadilha deste item (a armadilha continua "ativa" e conta no limite). */
function naurenPresosPorArmadilha(itemUuid) {
  const nomes = [];
  for (const t of canvas?.scene?.tokens ?? []) {
    const a = t.actor; if (!a) continue;
    if (a.items.some(i => i.type === "condicao" && i.system.ativo !== false && i.getFlag("nauren", "presoPorArmadilha")?.itemUuid === itemUuid)) nomes.push(t.name ?? a.name);
  }
  return nomes;
}

/** UUID de um item de compêndio pelo seedId. */
async function naurenUuidPorSeed(pack, seedId) {
  if (!pack) return "";
  await pack.getIndex({ fields: ["flags.nauren.seedId"] });
  const e = pack.index.find(i => i.flags?.nauren?.seedId === seedId);
  return e ? (await pack.getDocument(e._id)).uuid : "";
}

const naurenPreparacaoUsadas = new Map();

/** Move um token (qualquer dono) pelo Mestre. */
async function naurenMoverTokenViaMestre(tokenDoc, x, y, opcoes = {}) {
  if (tokenDoc.isOwner) return naurenDeslocarToken(tokenDoc, x, y, opcoes);
  const gm = game.users.activeGM;
  if (!gm) return null;
  return gm.query(NAUREN_QUERY_ITEM_MESTRE, { tipo: "moverToken", tokenUuid: tokenDoc.uuid, x, y, teleporte: !!opcoes.teleporte }, { timeout: 15000 }).catch(() => null);
}
/** Atualiza um item de qualquer ficha pelo Mestre. */
async function naurenAtualizarItemViaMestre(item, dados) {
  if (item.isOwner) return item.update(dados);
  const gm = game.users.activeGM;
  if (!gm) return null;
  return gm.query(NAUREN_QUERY_ITEM_MESTRE, { tipo: "atualizarItem", itemUuid: item.uuid, dados }, { timeout: 15000 }).catch(() => null);
}
const NAUREN_QUERY_ITEM_MESTRE = "nauren.itemMestre";
const NAUREN_QUERY_APLICAR_CONDICAO_ECO = "nauren.aplicarCondicaoEco";
async function naurenHandleQueryAplicarCondicaoEco({ actorUuid, uuid, formula }) {
  const d = await fromUuid(actorUuid).catch(() => null);
  const a = d?.actor ?? d;
  return a ? NaurenAlvoHelper.aplicarCondicao(a, uuid, 1, null, 0, 0, "", "1", formula) : null;
}
async function naurenHandleQueryItemMestre({ tipo, tokenUuid, x, y, teleporte, itemUuid, dados, metros, direcao }) {
  if (tipo === "moverToken") { const t = await fromUuid(tokenUuid).catch(() => null); return t ? naurenDeslocarToken(t, x, y, { teleporte }) : null; }
  if (tipo === "invocar") return naurenCriarInvocacoes(dados ?? {});
  if (tipo === "obraPrima") return naurenCriarObraPrima(dados ?? {});
  if (tipo === "ocultarToken") { const t = await fromUuid(tokenUuid).catch(() => null); return t ? t.update({ hidden: !!dados?.hidden }) : null; }
  if (tipo === "atualizarItem") { const i = await fromUuid(itemUuid).catch(() => null); return i ? i.update(dados) : null; }
  if (tipo === "criarRegiao") {
    const cena = await fromUuid(itemUuid).catch(() => null);
    if (!cena) return null;
    return cena.createEmbeddedDocuments("Region", [dados]).then(r => r?.[0]?.uuid ?? null).catch(() => null);
  }
  if (tipo === "regiaoCargas") {
    const reg = await fromUuid(itemUuid).catch(() => null);
    if (!reg) return null;
    const cfgR = reg.getFlag("nauren", "templatePersistente") ?? {};
    if ((dados?.cargas ?? 0) <= 0) return reg.delete();
    return reg.setFlag("nauren", "templatePersistente", { ...cfgR, cargasEstamina: dados.cargas });
  }
  if (tipo === "apagarItem") {
    const it = await fromUuid(itemUuid).catch(() => null);
    return it ? it.delete() : null;
  }
  // 0.94.22: grava uma flag do Nauren num card (ex.: o "desfazer" de uma Ação de quem não é dono do card).
  if (tipo === "flagMensagem") {
    const msg = game.messages.get(dados?.mensagemId);
    if (!msg || !["desfazer"].includes(dados?.chave)) return null;
    return msg.update({ [`flags.nauren.${dados.chave}`]: dados.valor }).then(() => true);
  }
  if (tipo === "empurrar") {
    const t = await fromUuid(tokenUuid).catch(() => null);
    return t ? naurenEmpurrarToken(t, { x, y }, String(metros ?? "1"), direcao ?? "afastar") : null;
  }
  if (tipo === "subirIniciativa") {
    const combate = game.combat;
    const tok = await fromUuid(tokenUuid).catch(() => null);
    const c = combate?.combatants?.find(x => x.tokenId === tok?.id);
    if (!c) return null;
    const ordem = combate.turns;
    const pos = ordem.findIndex(x => x.id === c.id);
    if (pos <= 0) return null;
    const acima = ordem[pos - 1];
    // Troca de lugar com quem estava logo acima (os números continuam inteiros no rastreador).
    const minha = c.initiative ?? 0, dele = acima.initiative ?? 0;
    if (minha !== dele) { await c.update({ initiative: dele }); await acima.update({ initiative: minha }); }
    else await c.update({ initiative: dele + 0.01 });
    return true;
  }
  return null;
}

/* ---- Condições "fora de cena" (Arrebatamento): some do mapa e volta restaurado ---- */
function naurenSouMestreAtivo() { return game.user.isGM && (!game.users.activeGM || game.users.activeGM.id === game.user.id); }
Hooks.on("createItem", async (item) => {
  if (item.type !== "condicao" || !item.system?.foraDeCena || !naurenSouMestreAtivo()) return;
  const actor = item.parent; if (!actor) return;
  for (const t of actor.getActiveTokens?.(true, true) ?? []) await (t.document ?? t).update({ hidden: true }).catch(() => {});
  naurenPostarCard({ ator: actor, titulo: item.name, icone: item.img, fonte: "Fora de cena",
    linhas: [{ label: actor.name, value: "desapareceu", breakdown: `volta quando ${item.name} acabar, com tudo restaurado` }] }).catch(() => {});
});
Hooks.on("deleteItem", async (item) => {
  if (item.type !== "condicao" || !item.system?.foraDeCena || !naurenSouMestreAtivo()) return;
  const actor = item.parent; if (!actor) return;
  const s = actor.system;
  await actor.update({ "system.vida.value": s.vida?.max ?? 0, "system.mana.value": s.mana?.max ?? 0,
    "system.dadosDestino.value": s.dadosDestino?.max ?? 0, "system.stress.value": 0 }).catch(() => {});
  const conds = actor.items.filter(i => i.type === "condicao" && i.id !== item.id).map(i => i.id);
  if (conds.length) await actor.deleteEmbeddedDocuments("Item", conds).catch(() => {});
  for (const t of actor.getActiveTokens?.(true, true) ?? []) await (t.document ?? t).update({ hidden: false }).catch(() => {});
  naurenPostarCard({ ator: actor, titulo: item.name, icone: item.img, fonte: "De volta",
    linhas: [{ label: actor.name, value: "retornou", breakdown: "Vida, Mana, Dados de Destino e Estresse restaurados; sem Condições" }] }).catch(() => {});
});

/* ---- Domar Besta (Caçador) ---- */
const NAUREN_QUERY_DOMAR = "nauren.domar";
async function naurenHandleQueryDomar({ cacadorUuid, alvoUuid }) {
  const cacador = await fromUuid(cacadorUuid).catch(() => null);
  const alvoDoc = await fromUuid(alvoUuid).catch(() => null);
  const alvo = alvoDoc?.actor ?? alvoDoc;
  if (!cacador || !alvo) return { linhas: [{ label: "Domar", value: "alvo não encontrado" }] };
  if ((alvo.system.nivel ?? 1) >= (cacador.system.nivel ?? 1)) return { linhas: [{ label: "Domar", value: `${alvo.name} tem nível igual ou maior que o seu` }] };
  if (alvo.system.mascoteDeUuid) return { linhas: [{ label: "Domar", value: `${alvo.name} já é mascote de alguém` }] };
  // Limite de mascotes (1, ou 2 com Soberano das Feras): domar mais um faz o mais antigo fugir (livro).
  const limite = cacador.items.some(i => i.type === "habilidade" && naurenEhItem(i, "Soberano das Feras") && i.system.ativo !== false) ? 2 : 1;
  const mascotesAtuais = Array.from(game.actors).filter(a => a.system?.mascoteDeUuid === cacador.uuid);
  const vaiFugir = mascotesAtuais.length >= limite ? mascotesAtuais[0] : null;
  const estamina = alvo.system.estaminaCombate?.value ?? 0;
  const resiste = estamina >= 1 && await foundry.applications.api.DialogV2.confirm({
    window: { title: `Domar Besta — ${alvo.name}` },
    content: `<p><b>${cacador.name}</b> tenta domar <b>${alvo.name}</b>.</p><p>Gastar 1 Estamina para resistir a esta tentativa?</p>`,
    yes: { label: "Resistir (−1 Estamina)" }, no: { label: "Não resistir" }, rejectClose: false
  }).catch(() => false);
  if (resiste) {
    await alvo.update({ "system.estaminaCombate.value": estamina - 1 });
    return { linhas: [{ label: "Domar", value: `${alvo.name} resistiu (−1 Estamina)` }] };
  }
  const precisa = game.combat?.started ? 4 : 3;
  const progresso = { ...(alvo.getFlag("nauren", "domar") ?? {}) };
  progresso[cacador.uuid.replace(/\./g, "_")] = (progresso[cacador.uuid.replace(/\./g, "_")] ?? 0) + 1;
  const agora = progresso[cacador.uuid.replace(/\./g, "_")];
  if (agora < precisa) {
    await alvo.setFlag("nauren", "domar", progresso);
    return { linhas: [{ label: "Domar", value: `${agora}/${precisa}`, breakdown: `${alvo.name} está cedendo${vaiFugir ? ` · ao completar, ${vaiFugir.name} foge` : ""}` }] };
  }
  const linhasFuga = [];
  if (vaiFugir) linhasFuga.push(await naurenMascoteFoge(vaiFugir, limite));
  await alvo.unsetFlag("nauren", "domar");
  // Mascote de nível menor se ajusta ao nível do dono (carta dos Mascotes).
  const nivelAntes = alvo.system.nivel ?? 1, nivelDono = cacador.system.nivel ?? 1;
  await alvo.update({ "system.mascoteDeUuid": cacador.uuid, ...(nivelAntes < nivelDono ? { "system.nivel": nivelDono } : {}) });
  if (nivelAntes < nivelDono) linhasFuga.unshift({ label: "Nível", value: `${nivelAntes} → ${nivelDono}`, breakdown: "o mascote acompanha o nível do dono" });
  const dispCacador = cacador.getActiveTokens?.(true)?.[0]?.document?.disposition ?? 1;
  for (const t of alvo.getActiveTokens?.(true) ?? []) await t.document.update({ disposition: dispCacador }).catch(() => {});
  await naurenAtualizarTreinoResistencia(alvo);
  return { linhas: [{ label: "Domada!", value: `${alvo.name} agora é seu mascote`, breakdown: `${precisa}/${precisa}` }, ...linhasFuga] };
}
/** O mascote mais antigo foge (limite de mascotes): deixa de ser mascote e fica neutro. */
async function naurenMascoteFoge(mascote, limite) {
  await mascote.update({ "system.mascoteDeUuid": "" });
  for (const t of mascote.getActiveTokens?.(true) ?? []) await t.document.update({ disposition: 0 }).catch(() => {});
  for (const ef of mascote.items.filter(i => i.type === "efeito" && i.getFlag("nauren", "treinoResistencia"))) await ef.delete().catch(() => {});
  return { label: "Fugiu", value: `${mascote.name} deixou de ser seu mascote`, breakdown: `limite de ${limite} mascote${limite > 1 ? "s" : ""}` };
}

/* ---- Domar Besta: besta inicial ---- */
const NAUREN_QUERY_BESTA_INICIAL = "nauren.bestaInicial";
/** No Mestre: cria a besta escolhida (do compêndio de Mascotes) como mascote do Caçador, no nível dele. */
async function naurenHandleQueryBestaInicial({ cacadorUuid, seedId }) {
  const cacador = await fromUuid(cacadorUuid).catch(() => null);
  const def = NAUREN_MASCOTES_INICIAIS.find(d => d.seedId === seedId);
  if (!cacador || !def) return { linhas: [{ label: "Besta inicial", value: "não encontrada" }] };
  if (cacador.getFlag("nauren", "bestaInicial")) return { linhas: [{ label: "Besta inicial", value: "já escolhida" }] };
  const pack = game.packs.find(p => p.metadata.label === NAUREN_PACKS_DEFINICAO.mascotes.label && p.metadata.type === "Actor");
  await pack?.getIndex({ fields: ["flags.nauren.seedId"] });
  const ent = pack?.index.find(i => i.flags?.nauren?.seedId === seedId);
  const modelo = ent ? await pack.getDocument(ent._id) : null;
  if (!modelo) return { linhas: [{ label: "Besta inicial", value: `${def.nome} não está no compêndio "${NAUREN_PACKS_DEFINICAO.mascotes.label}"` }] };
  const linhas = [];
  const limite = cacador.items.some(i => i.type === "habilidade" && naurenEhItem(i, "Soberano das Feras") && i.system.ativo !== false) ? 2 : 1;
  const atuais = Array.from(game.actors).filter(a => a.system?.mascoteDeUuid === cacador.uuid);
  if (atuais.length >= limite) linhas.push(await naurenMascoteFoge(atuais[0], limite));
  const nomePasta = "Nauren — Mascotes";
  let pasta = game.folders.find(f => f.type === "Actor" && f.name === nomePasta);
  if (!pasta) pasta = await Folder.create({ name: nomePasta, type: "Actor", color: "#4a5a2a" });
  const dados = game.actors.fromCompendium(modelo);
  const nivel = cacador.system.nivel ?? 1;
  dados.folder = pasta.id;
  dados.system = { ...(dados.system ?? {}), nivel, nivelBase: nivel, mascoteDeUuid: cacador.uuid };
  // Quem controla o Caçador também controla o mascote.
  dados.ownership = { default: 0, ...Object.fromEntries(Object.entries(cacador.ownership ?? {}).filter(([k, v]) => k !== "default" && v >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)) };
  dados.prototypeToken = { ...(dados.prototypeToken ?? {}), actorLink: true, name: def.nome };
  const [novo] = await Actor.createDocuments([dados]);
  await naurenAtualizarTreinoResistencia(novo);
  await naurenPreencherRecursosNoMaximo(novo);
  await cacador.setFlag("nauren", "bestaInicial", { seedId, atorUuid: novo.uuid });
  linhas.unshift({ label: "Besta inicial", value: `${def.nome} agora é seu mascote`, breakdown: `nível ${nivel} • Vida ${novo.system.vida?.max ?? nivel * 8}` });
  // No mapa: aparece ao lado do Caçador.
  const tok = cacador.getActiveTokens?.(true)?.[0]?.document;
  if (tok?.parent) {
    const td = (await novo.getTokenDocument({ disposition: tok.disposition })).toObject(); delete td._id;
    const [casa] = naurenCasasLivresEmVolta(tok.parent, tok, td.width ?? 1, td.height ?? 1, 1, 2);
    if (casa) { await tok.parent.createEmbeddedDocuments("Token", [{ ...td, x: casa.x, y: casa.y, hidden: false, flags: { ...(td.flags ?? {}), nauren: { ...(td.flags?.nauren ?? {}), surgir: true } } }]); linhas.push({ label: "No mapa", value: `ao lado de ${cacador.name}` }); }
  }
  return { linhas };
}

/** Treinamento de Resistência: +rank de Vida por nível do mascote (Efeito). */
async function naurenAtualizarTreinoResistencia(mascote) {
  if (!mascote?.system?.mascoteDeUuid) return;
  let dono = null;
  try { const d = fromUuidSync(mascote.system.mascoteDeUuid); dono = d?.actor ?? d; } catch (err) { dono = null; }
  const hab = dono?.items?.find(i => i.type === "habilidade" && naurenEhItem(i, "Treinamento de Resistência") && i.system.ativo !== false);
  const existente = mascote.items.find(i => i.type === "efeito" && i.getFlag("nauren", "treinoResistencia"));
  if (!hab) { if (existente) await existente.delete(); return; }
  const total = Math.max(1, hab.system.rankAtual || 1) * Math.max(1, mascote.system.nivel ?? 1);
  const sistema = { ativo: true, modificadores: [{ campo: "vida", valor: String(total) }],
    descricao: naurenMontarDescricao({ regra: `Origem: Treinamento de Resistência (${dono.name}). +${hab.system.rankAtual || 1} de Vida por nível do mascote.`, automatico: `+${total} de Vida máxima (recalculado ao subir de nível).`, manual: "" }) };
  if (existente) await existente.update({ system: sistema });
  else await mascote.createEmbeddedDocuments("Item", [{ name: "Treinamento de Resistência", type: "efeito", img: hab.img, system: sistema, flags: { nauren: { treinoResistencia: true } } }]);
}
Hooks.on("updateActor", async (actor, mudancas) => {
  if (game.users.activeGM !== game.user || !actor.system?.mascoteDeUuid) return;
  if (foundry.utils.getProperty(mudancas, "system.nivel") === undefined) return;
  await naurenAtualizarTreinoResistencia(actor);
});

/**
 * Casa livre ao lado de "destino" mais perto de "quem", dentro de "metros" de movimento e sem
 * parede na linha reta até ela. Devolve {x, y (canto superior esquerdo), metros} ou null.
 */
function naurenCasaLivreAoLado(quem, destino, metros) {
  if (!canvas?.ready || !quem?.document || !destino?.document) return null;
  const casa = canvas.grid.size, mPorCasa = canvas.scene?.grid?.distance || 1;
  const tamQ = quem.document.getSize(), tamD = destino.document.getSize();
  const largQ = Math.max(1, Math.round(tamQ.width / casa)), altQ = Math.max(1, Math.round(tamQ.height / casa));
  const largD = Math.max(1, Math.round(tamD.width / casa)), altD = Math.max(1, Math.round(tamD.height / casa));
  const x0 = destino.document.x, y0 = destino.document.y;
  const outros = canvas.tokens.placeables.filter(t => t !== quem && t.document.id !== quem.document.id && !t.document.hidden);
  const sobrepoe = (x, y) => outros.some(t => {
    const s = t.document.getSize();
    return x < t.document.x + s.width - 1 && x + tamQ.width - 1 > t.document.x && y < t.document.y + s.height - 1 && y + tamQ.height - 1 > t.document.y;
  });
  const cruzaParede = (de, para) => {
    try {
      const backend = CONFIG.Canvas.polygonBackends?.move;
      if (backend?.testCollision) return !!backend.testCollision(de, para, { type: "move", mode: "any" });
      return !!quem.checkCollision?.(para, { origin: de, type: "move", mode: "any" });
    } catch (err) { return false; }
  };
  let melhor = null;
  for (let cx = -largQ; cx <= largD; cx++) {
    for (let cy = -altQ; cy <= altD; cy++) {
      const dentro = cx > -largQ && cx < largD && cy > -altQ && cy < altD;
      if (dentro) continue; // só o anel em volta do aliado
      const x = x0 + cx * casa, y = y0 + cy * casa;
      const passos = Math.max(Math.abs(x - quem.document.x), Math.abs(y - quem.document.y)) / casa;
      const m = Math.round(passos * mPorCasa);
      if (m > metros || sobrepoe(x, y)) continue;
      const centro = { x: x + tamQ.width / 2, y: y + tamQ.height / 2 };
      if (cruzaParede(quem.center, centro)) continue;
      if (!melhor || m < melhor.metros) melhor = { x, y, metros: m };
    }
  }
  return melhor;
}

/* ---- Manipular a Verdade (Ladino) ---- */
const NAUREN_QUERY_MANIPULAR = "nauren.manipularVerdade";
/**
 * Executado pelo Mestre: cada inimigo a até 9m do Ladino que ele estudou
 * escolhe: gastar 1 Estamina e ir até o aliado alvo (todo o movimento), ou
 * sofrer 1 de Estresse.
 */
async function naurenHandleQueryManipular({ ladraoUuid, aliadoTokenUuid }) {
  const ladino = await fromUuid(ladraoUuid).catch(() => null);
  const aliado = await fromUuid(aliadoTokenUuid).catch(() => null);
  const tokLadino = ladino?.getActiveTokens?.(true)?.[0];
  if (!ladino || !aliado?.object || !tokLadino) return [];
  const linhas = [];
  for (const t of canvas.tokens.placeables) {
    const a = t.actor;
    if (!a || t.document.disposition === tokLadino.document.disposition || !naurenEstudoNoAlvo(a, ladino)) continue;
    const dist = naurenMedirDistanciaBordas(tokLadino, t);
    if (dist > 9) continue;
    const estamina = a.system.estaminaCombate?.value ?? 0;
    const escolha = await foundry.applications.api.DialogV2.wait({
      window: { title: `Manipular a Verdade — ${t.document.name}` },
      content: `<p><b>${t.document.name}</b> é compelido a ir até <b>${aliado.name}</b>.</p><p>Gastar 1 Estamina e usar todo o movimento até ele, ou sofrer 1 de Estresse?</p>`,
      buttons: [
        ...(estamina >= 1 ? [{ action: "mover", label: "Ir até o aliado (−1 Estamina)", default: true }] : []),
        { action: "estresse", label: "Resistir (+1 Estresse)" }
      ],
      rejectClose: false
    }).catch(() => "estresse");
    if (escolha === "mover") {
      await a.update({ "system.estaminaCombate.value": estamina - 1 });
      const movimento = Number(a.system.movimentoTotal ?? a.system.movimento ?? 6) || 6;
      // Anda até uma casa livre ao lado do aliado (contornando quem estiver no meio); se nenhuma
      // estiver ao alcance do movimento, vai em linha reta o quanto der.
      const casaLivre = naurenCasaLivreAoLado(t, aliado.object, movimento);
      const mov = casaLivre
        ? (await naurenDeslocarToken(t.document, casaLivre.x, casaLivre.y), { metrosMovidos: casaLivre.metros })
        : await naurenEmpurrarToken(t.document, aliado.object.center, String(movimento), "puxar");
      linhas.push({ label: t.document.name, value: `foi até ${aliado.name} (${mov?.metrosMovidos ?? 0}m)`, breakdown: `−1 Estamina${casaLivre ? " • terminou ao lado dele" : " • não alcançou (longe demais ou caminho fechado)"}` });
    } else {
      const estAtual = a.system.stress?.value ?? 0;
      const estMax = a.system.stress?.max ?? 3;
      await a.update({ "system.stress.value": Math.min(estMax, estAtual + 1) });
      linhas.push({ label: t.document.name, value: "resistiu", breakdown: estAtual >= estMax ? `Estresse já no máximo (${estMax})` : "+1 Estresse" });
    }
  }
  return linhas;
}

/* ---- Oportunista ao Extremo: o inimigo pode resistir ao roubo ---- */
/** Tudo é Meu! (Ladino): o Ladino deste usuário que pode roubar o d20 do card (aliado do autor, com uso). */
function naurenLadinosTudoEMeu(autor) {
  const dispAutor = naurenDisposicaoDoAtor(autor);
  const vistos = new Map();
  for (const t of canvas?.tokens?.placeables ?? []) {
    const a = t.actor;
    if (!a || a === autor || vistos.has(a.uuid) || !a.isOwner) continue;
    if (game.user.isGM && a.hasPlayerOwner) continue; // o jogador decide pelo próprio Ladino
    if (t.document.disposition !== dispAutor) continue;
    const hab = a.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Tudo é Meu!") && i.system.ativo !== false);
    if (hab && naurenUsoDisponivel(hab) && !a.getFlag("nauren", "dadoRoubado")) vistos.set(a.uuid, a);
  }
  return [...vistos.values()];
}

/** Tudo é Meu!: gasta o uso do combate e guarda o d20 roubado (aparece na janela de rerolar). */
async function naurenGuardarD20Roubado(ladino, face, de) {
  const hab = ladino.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Tudo é Meu!"));
  if (!hab) return false;
  if (!naurenUsoDisponivel(hab)) { ui.notifications.warn("Tudo é Meu!: já usado neste combate."); return false; }
  if (ladino.getFlag("nauren", "dadoRoubado")) { ui.notifications.warn("Tudo é Meu!: você já tem um d20 guardado."); return false; }
  await naurenConsumirUsoDaHabilidade(hab);
  await ladino.setFlag("nauren", "dadoRoubado", { face, de });
  naurenPostarCard({ ator: ladino, titulo: hab.name, icone: hab.img, fonte: "d20 roubado", linhas: [{ label: "Guardou", value: `d20 ${face}`, breakdown: `de ${de} • use numa rolagem sua` }] });
  return true;
}

/* ---- Acovardar (Ladino): quando alguém erra um ataque, o Ladino pode ridicularizá-lo ---- */
const NAUREN_QUERY_ACOVARDAR = "nauren.acovardar";
const naurenAcovardarRecentes = new Map();
/** Chamado no cliente de quem atacou, ao errar. Pergunta a cada Ladino com Acovardar na cena (1 vez por ataque). */
async function naurenOferecerAcovardar(atacante, atacanteToken = null) {
  if (!game.combat?.started || !atacante) return;
  const agora = Date.now();
  if (agora - (naurenAcovardarRecentes.get(atacante.uuid) ?? 0) < 4000) return; // vários alvos errados = 1 pergunta
  naurenAcovardarRecentes.set(atacante.uuid, agora);
  const tokAtacante = atacanteToken ?? atacante.getActiveTokens?.(true)?.[0] ?? null;
  const vistos = new Set();
  for (const t of canvas?.tokens?.placeables ?? []) {
    const a = t.actor;
    if (!a || a === atacante || vistos.has(a.uuid)) continue;
    const hab = a.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Acovardar") && i.system.ativo !== false);
    if (!hab) continue;
    vistos.add(a.uuid);
    const custo = Number(hab.system.acoes?.[0]?.custoEstamina) || 0;
    if ((a.system.estaminaCombate?.value ?? 0) < custo) continue;
    const ex = NaurenAlvoHelper.usuarioExecutor(a);
    if (!ex) continue;
    const dados = { ladinoUuid: a.uuid, atacanteTokenUuid: tokAtacante?.document?.uuid ?? "", atacanteNome: tokAtacante?.document?.name ?? atacante.name };
    if (ex.id === game.user.id) naurenHandleQueryAcovardar(dados).catch(err => console.warn("Nauren RPG | Acovardar", err));
    else ex.query(NAUREN_QUERY_ACOVARDAR, dados, { timeout: 60000 }).catch(() => null);
  }
}
/** No cliente do dono do Ladino: pergunta e, se sim, usa a Ação "Acovardar" mirando quem errou. */
async function naurenHandleQueryAcovardar({ ladinoUuid, atacanteTokenUuid, atacanteNome }) {
  const doc = await fromUuid(ladinoUuid).catch(() => null);
  const ladino = doc?.actor ?? doc;
  const hab = ladino?.items?.find(i => i.type === "habilidade" && naurenEhItem(i, "Acovardar") && i.system.ativo !== false);
  if (!hab) return false;
  const tokDoc = atacanteTokenUuid ? await fromUuid(atacanteTokenUuid).catch(() => null) : null;
  const tok = tokDoc?.object ?? null;
  if (!tok) return false;
  const custo = Number(hab.system.acoes?.[0]?.custoEstamina) || 0;
  const eu = tok.actor === ladino;
  const sim = await foundry.applications.api.DialogV2.confirm({
    window: { title: `Acovardar — ${ladino.name}` },
    content: `<p><b>${eu ? "Você" : atacanteNome}</b> errou um ataque.</p><p>Usar <b>Acovardar</b>${custo ? ` (${custo} PdE)` : ""}? ${eu ? "Você fica" : "Ele fica"} <b>Ridicularizado</b> (ataques contra ${eu ? "você" : "ele"} com Facilidade por 1 rodada) e você ganha Facilidade no próximo ataque.</p>`,
    yes: { label: `Acovardar${custo ? ` (${custo} PdE)` : ""}` }, no: { label: "Agora não" }, rejectClose: false
  }).catch(() => false);
  if (!sim) return false;
  // Mira só quem errou, usa a Ação de verdade (custo, condições e card do sistema) e devolve os alvos de antes.
  const antes = [...game.user.targets];
  try {
    tok.setTarget(true, { releaseOthers: true });
    await ladino.sheet._executarAcao(hab, 0);
  } finally {
    for (const t of [...game.user.targets]) { try { if (!antes.includes(t)) t.setTarget(false, { releaseOthers: false }); } catch (err) { /* saiu da cena */ } }
    for (const t of antes) { try { if (!t.isTargeted) t.setTarget(true, { releaseOthers: false }); } catch (err) { /* saiu da cena */ } }
  }
  return true;
}

const NAUREN_QUERY_RESISTIR_ROUBO = "nauren.resistirRoubo";
async function naurenHandleQueryResistirRoubo({ vitimaUuid, custo, ladraoNome }) {
  const doc = await fromUuid(vitimaUuid).catch(() => null);
  const vitima = doc?.actor ?? doc;
  if (!vitima) return false;
  const estamina = vitima.system.estaminaCombate?.value ?? 0;
  if (estamina < custo) return false;
  const sim = await foundry.applications.api.DialogV2.confirm({
    window: { title: `${vitima.name} — Prioridade` },
    content: `<p><b>${ladraoNome}</b> quer roubar a Prioridade de <b>${vitima.name}</b>.</p><p>Gastar <b>${custo} Estamina</b> para impedir?</p>`,
    yes: { label: `Impedir (−${custo} Estamina)` }, no: { label: "Deixar roubar" }, rejectClose: false
  }).catch(() => false);
  if (!sim) return false;
  await vitima.update({ "system.estaminaCombate.value": estamina - custo });
  return true;
}

/* ---- Estudos (Ladino) ---- */
/** Tipos de estudo que um ator tem (de Habilidades e Efeitos ativos). */
function naurenTiposEstudoDoAtor(actor) {
  const lista = [];
  for (const item of actor?.items ?? []) {
    const ativo = item.type === "habilidade" ? item.system.ativo !== false : item.type === "efeito" ? !!item.system.ativo : false;
    if (!ativo) continue;
    (item.system.tiposEstudo ?? []).forEach((t, i) => {
      // Sem ponto na chave: o Foundry trata "a.b" como caminho ao salvar.
      lista.push({ chave: `${item.id}_${String(t.id || i).replace(/\./g, "_")}`, item, tipo: t, rank: Math.max(1, item.system.rankAtual || 1) });
    });
  }
  return lista;
}
/** A marca "Estudado" que este dono colocou neste alvo (ou null). */
function naurenEstudoNoAlvo(alvoActor, donoActor) {
  if (!alvoActor || !donoActor) return null;
  return alvoActor.items.find(i => i.type === "condicao" && i.getFlag("nauren", "estudo")?.donoUuid === donoActor.uuid) ?? null;
}
/**
 * Valor de um tipo de estudo com N acúmulos. Nos tipos "por Analisado" (livro 0.8)
 * o multiplicador é o total de acúmulos de Analisado (informações) no alvo.
 */
function naurenValorEstudo(entrada, acumulos, informacoes = null) {
  const base = Number(entrada.tipo.valor) || 0;
  const mult = entrada.tipo.porAnalisado ? (informacoes ?? acumulos) : acumulos;
  return base * (entrada.tipo.sobeComRank ? entrada.rank : 1) * mult;
}
/** Campos que a análise criativa pode usar (o livro aceita qualquer palavra-chave; estes têm efeito automático). */
const NAUREN_CAMPOS_ANALISE_CRIATIVA = {
  defesa: "Defesa", poderAtaque: "Poder de Ataque", poderMagia: "Poder de Magia", espirito: "Espírito", movimento: "Movimento",
  bloqueio: "Bônus de Bloqueio", esquiva: "Bônus de Esquiva", limiarDeflexao: "Limiar de Deflexão", ataque: "Bônus de Ataque",
  danoBonus: "Bônus de Dano", reducaoDano: "Redução de Dano Sofrido", alcanceBonus: "Bônus de Alcance (metros)"
};
/**
 * "Eu estou acima" (no Ladino) e "Você está abaixo" (no alvo) valem "+/−1 por acúmulo de
 * Analisado": os acúmulos dessas Condições acompanham o total de informações da marca.
 */
/** Movimento e Espírito no "Eu estou acima" valem de forma GERAL (decisão do Gustavo): +1 por acúmulo no Ladino. */
const NAUREN_CAMPOS_ACIMA_GERAIS = new Set(["movimento", "espirito"]);
function naurenModsAcima(campo) { return NAUREN_CAMPOS_ACIMA_GERAIS.has(campo) ? [{ campo, valor: "1" }] : []; }
async function naurenSincronizarCriativasDoLadino(ladino, alvoUuid, informacoes) {
  if (!ladino) return;
  const upd = [];
  for (const i of ladino.items) {
    if (i.type !== "condicao" || i.getFlag("nauren", "analiseCriativa")?.alvoUuid !== alvoUuid) continue;
    const mods = naurenModsAcima(i.getFlag("nauren", "analiseCriativa")?.campo);
    const atuais = (i.system.modificadores ?? []).map(m => `${m.campo}:${m.valor}`).join("|");
    if ((i.system.acumulos ?? 0) !== Math.max(1, informacoes) || atuais !== mods.map(m => `${m.campo}:${m.valor}`).join("|"))
      upd.push({ _id: i.id, "system.acumulos": Math.max(1, informacoes), "system.acumulativel": true, "system.modificadores": mods });
  }
  if (upd.length) await ladino.updateEmbeddedDocuments("Item", upd).catch(() => {});
}
/**
 * "Eu estou acima" vale SÓ contra o alvo analisado (livro 0.8, confirmado pelo Gustavo):
 * a Condição no Ladino não tem Modificadores gerais; este helper soma o bônus quando o
 * outro lado da jogada é o alvo. Devolve { total, fontes }.
 * Campos automáticos: defesa/esquiva/bloqueio/reducaoDano (quando ele ataca você),
 * ataque/poderAtaque/poderMagia/danoBonus/alcanceBonus (quando você ataca ele) e
 * limiarDeflexao (contra-ataques entre os dois). Movimento e Espírito ficam como lembrete.
 */
const NAUREN_CAMPOS_ACIMA_AUTOMATICOS = new Set(["defesa", "esquiva", "bloqueio", "ataque", "poderAtaque", "poderMagia", "danoBonus", "reducaoDano", "limiarDeflexao", "alcanceBonus"]);
function naurenBonusAcimaContra(ladino, outroActor, campos) {
  const res = { total: 0, fontes: [] };
  if (!ladino?.items || !outroActor) return res;
  const lista = Array.isArray(campos) ? campos : [campos];
  for (const c of ladino.items) {
    if (c.type !== "condicao" || c.system.ativo === false) continue;
    const f = c.getFlag("nauren", "analiseCriativa");
    if (f?.modo !== "acima" || f.alvoUuid !== outroActor.uuid || !lista.includes(f.campo)) continue;
    const n = Math.max(1, c.system.acumulos ?? 1);
    res.total += n;
    res.fontes.push({ nome: c.name, valor: n, campo: f.campo });
  }
  return res;
}
const NAUREN_QUERY_ESTUDO = "nauren.estudo";
// A marca fica na ficha do ALVO: quando ela muda, redesenha a ficha do Ladino
// dono (o painel "Estudos" lê essas marcas).
for (const evento of ["createItem", "updateItem", "deleteItem"]) {
  Hooks.on(evento, item => {
    const donoUuid = item?.getFlag?.("nauren", "estudo")?.donoUuid;
    if (!donoUuid) return;
    let dono = null;
    try { dono = fromUuidSync(donoUuid); } catch (err) { dono = null; }
    if (dono?.sheet?.rendered) dono.sheet.render();
  });
}
/**
 * Muda a marca de estudo de um dono num alvo. Operações: "somar" (estudo
 * bem-sucedido: +1 acúmulo no tipo e +1 informação), "acumulos" (define
 * os acúmulos de um tipo), "informacoes" (soma no total), "consumir"
 * (zera tipos) e "remover" (apaga a marca).
 */
async function naurenHandleQueryEstudo({ alvoUuid, operacao, dono, chave, nome, valor, max, contaComoInformacao, chaves, zerarNovas, quantos = 1, criativa = null }) {
  const doc = await fromUuid(alvoUuid).catch(() => null);
  const alvo = doc?.actor ?? doc;
  if (!alvo) return null;
  let marca = alvo.items.find(i => i.type === "condicao" && i.getFlag("nauren", "estudo")?.donoUuid === dono.uuid);
  if (!marca) {
    if (operacao !== "somar" && operacao !== "acumulos" && operacao !== "informacoes") return null;
    [marca] = await alvo.createEmbeddedDocuments("Item", [{
      name: `Analisado (por ${dono.nome})`, type: "condicao", img: "icons/magic/sonic/projectile-sound-rings-wave.webp",
      system: {
        duracaoModo: "cena", acumulativel: true, acumulosMax: 99, acumulos: 1,
        descricao: naurenMontarDescricao({ regra: `Este alvo foi analisado por ${dono.nome} (Análise Paciente). Cada acúmulo de Analisado aumenta os bônus que ${dono.nome} desbloqueou contra ele. Só ${dono.nome} usa estas informações.`, automatico: "os acúmulos = informações de " + dono.nome + " sobre este alvo; guarda os bônus desbloqueados; sai sozinha no fim do combate.", manual: "" })
      },
      flags: { nauren: { estudo: { donoUuid: dono.uuid, donoNome: dono.nome, tipos: {}, informacoes: 0 } } }
    }]);
  }
  if (operacao === "remover") {
    // Esquecer o alvo também tira os "Você está abaixo" deste dono nele.
    const abaixoR = alvo.items.filter(i => i.type === "condicao" && i.getFlag("nauren", "analiseCriativa")?.donoUuid === dono.uuid);
    if (abaixoR.length) await alvo.deleteEmbeddedDocuments("Item", abaixoR.map(i => i.id)).catch(() => {});
    await marca.delete(); return { removida: true };
  }
  const estudo = foundry.utils.deepClone(marca.getFlag("nauren", "estudo"));
  estudo.tipos ??= {};
  const rodada = game.combat?.round ?? 0;
  if (operacao === "somar") {
    if (chave) {
      const atual = estudo.tipos[chave]?.acumulos ?? 0;
      estudo.tipos[chave] = { nome, acumulos: Math.min(max || 99, atual + 1), rodada };
    }
    // Análise criativa: guarda o campo escolhido (uma por modo+campo). "abaixo" fica armada para o próximo ataque.
    if (criativa?.chave) {
      estudo.criativas ??= {};
      estudo.criativas[criativa.chave] = { modo: criativa.modo, campo: criativa.campo, rotulo: criativa.rotulo };
      if (criativa.modo === "abaixo") estudo.abaixoPendente = [...(estudo.abaixoPendente ?? []).filter(x => x.chave !== criativa.chave), criativa];
    }
    if (contaComoInformacao !== false) {
      const n = Math.max(1, Math.round(Number(quantos) || 1));
      estudo.informacoes = (estudo.informacoes ?? 0) + n;
      // "novas": informações desde o seu último ataque contra ele (Avaliar).
      estudo.novas = (estudo.novas ?? 0) + n;
    }
  } else if (operacao === "estrategia") {
    estudo.estrategiaUsados = Math.max(0, (estudo.estrategiaUsados ?? 0) + (Number(valor) || 1));
  } else if (operacao === "removerCriativa") {
    if (estudo.criativas) delete estudo.criativas[chave];
    estudo.abaixoPendente = (estudo.abaixoPendente ?? []).filter(x => x.chave !== chave);
    const abaixoC = alvo.items.filter(i => i.type === "condicao" && i.getFlag("nauren", "analiseCriativa")?.donoUuid === dono.uuid && i.getFlag("nauren", "analiseCriativa")?.chave === chave);
    if (abaixoC.length) await alvo.deleteEmbeddedDocuments("Item", abaixoC.map(i => i.id)).catch(() => {});
  } else if (operacao === "acumulos") {
    estudo.tipos[chave] = { nome, acumulos: Math.max(0, Math.min(max || 99, valor)), rodada };
  } else if (operacao === "informacoes") {
    estudo.informacoes = Math.max(0, (estudo.informacoes ?? 0) + valor);
  } else if (operacao === "consumir") {
    for (const c of chaves ?? []) if (estudo.tipos[c]) estudo.tipos[c].acumulos = 0;
    if (zerarNovas) estudo.novas = 0;
    if (valor === "abaixo") estudo.abaixoPendente = [];
  }
  // Tirar uma criativa apaga uma chave do objeto: aí a flag é regravada inteira; nos outros casos, uma escrita só.
  if (operacao === "removerCriativa") await marca.unsetFlag("nauren", "estudo");
  await marca.update({ "flags.nauren.estudo": estudo, "system.acumulos": Math.max(1, estudo.informacoes ?? 0), "system.acumulativel": true });
  // "Você está abaixo" neste alvo acompanha os acúmulos de Analisado deste dono (−1 por acúmulo).
  const valorAbaixo = String(-Math.max(1, estudo.informacoes ?? 0));
  const abaixo = alvo.items.filter(i => i.type === "condicao" && i.getFlag("nauren", "analiseCriativa")?.donoUuid === dono.uuid
    && (i.system.modificadores ?? []).some(m => String(m.valor) !== valorAbaixo));
  if (abaixo.length) await alvo.updateEmbeddedDocuments("Item", abaixo.map(i => ({ _id: i.id, "system.modificadores": (i.system.modificadores ?? []).map(m => ({ ...m, valor: valorAbaixo })) }))).catch(() => {});
  return estudo;
}
async function naurenOperarEstudo(alvoActor, dados) {
  const payload = { alvoUuid: alvoActor.uuid, ...dados };
  if (alvoActor.isOwner) return naurenHandleQueryEstudo(payload);
  const executor = NaurenAlvoHelper.usuarioExecutor(alvoActor) ?? game.users.activeGM;
  if (!executor) { ui.notifications.warn("Estudo: o Mestre precisa estar conectado."); return null; }
  return executor.query(NAUREN_QUERY_ESTUDO, payload, { timeout: 15000 }).catch(() => null);
}

/* ---- Rerolagem com Dado de Destino ---- */
/** Face do d20 de uma rolagem (1º dado de 20 faces). */
/** Nome legível de um recurso ("recursoCustom:energia" → "Energia", "estresse" → "Estresse"). */
function naurenNomeDoRecurso(actor, recurso) {
  const r = String(recurso ?? "");
  if (r.startsWith("recursoCustom:")) {
    const id = r.slice(14);
    return (actor?.system?.recursosCustom ?? []).find(x => x.id === id)?.nome ?? id.charAt(0).toUpperCase() + id.slice(1);
  }
  return RECURSOS_ALVO[r] || r;
}

/* Ataques contra inimigos no turno atual (memória deste cliente): responde sozinho o "já atacou neste turno?". */
const naurenAtaquesNoTurno = new Map();
function naurenChaveTurnoAtual() { const c = game.combat; return c?.started ? `${c.id}_${c.round}_${c.turn}` : null; }
function naurenRegistrarAtaqueNoTurno(actor) { const k = naurenChaveTurnoAtual(); if (k && actor) naurenAtaquesNoTurno.set(actor.uuid, k); }
function naurenAtacouNoTurnoAtual(actor) { const k = naurenChaveTurnoAtual(); return !!k && !!actor && naurenAtaquesNoTurno.get(actor.uuid) === k; }

function naurenFaceD20(roll) {
  const dado = (roll?.dice ?? []).find(d => d.faces === 20);
  const r = dado?.results?.find(x => x.active !== false) ?? dado?.results?.[0];
  return r ? r.result : null;
}
/** Piso do Guiar o Destino (você ou um aliado na cena): 9/10/11 por rank. */
function naurenPisoGuiarDestino(actor) {
  if (!canvas?.ready) return 0;
  const disposicao = actor.getActiveTokens?.(true)?.[0]?.document?.disposition;
  let piso = 0;
  for (const t of canvas.tokens.placeables) {
    const a = t.actor;
    if (!a || (a !== actor && t.document.disposition !== disposicao)) continue;
    const hab = a.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Guiar o Destino") && i.system.ativo !== false);
    if (hab) piso = Math.max(piso, 8 + Math.max(1, Math.min(3, hab.system.rankAtual || 1)));
  }
  return piso;
}
/* ---- Aureum e Dado de Acalanto do Destino (Sacerdote, livro 0.8) ---- */
/** O d20 do Aureum guardado para ESTE combate (ou null). */
function naurenAureumValido(actor) {
  const f = actor?.getFlag?.("nauren", "aureumD20");
  if (!f || !game.combat || f.combate !== game.combat.id) return null;
  return f;
}
const NAUREN_QUERY_AUREUM = "nauren.aureum";
/** Roda no cliente do dono do Sacerdote: pergunta, rola 1d20 e guarda. Num 20: +1 Destino (base) e +1 Acalanto no Grupo. */
async function naurenHandleQueryAureum({ actorUuid, combateId }) {
  const doc = await fromUuid(actorUuid).catch(() => null);
  const actor = doc?.actor ?? doc;
  if (!actor) return null;
  if (actor.getFlag("nauren", "aureumD20")?.combate === combateId) return null;
  const rolar = await foundry.applications.api.DialogV2.confirm({ window: { title: `Palavra de Destino: Aureum — ${actor.name}` },
    content: "<p>Início da cena de combate. Rolar <b>1d20</b> do Aureum? Você poderá usar esse resultado no lugar de um d20 seu durante este combate.</p>",
    yes: { label: "Rolar 1d20" }, no: { label: "Não" }, rejectClose: false }).catch(() => false);
  if (!rolar) { await actor.setFlag("nauren", "aureumD20", { face: null, combate: combateId, recusado: true }); return null; }
  const r = await new Roll("1d20").evaluate();
  if (game.dice3d) await game.dice3d.showForRoll(r, game.user, true).catch(() => {});
  const face = r.total;
  await actor.setFlag("nauren", "aureumD20", { face, combate: combateId });
  const linhas = [{ label: "d20 do Aureum", value: face, breakdown: "guardado: use na janela de rolagem (\"Usar d20 do Aureum\") durante este combate" }];
  if (face === 20) {
    const antes = actor.system.atributos?.destino?.value ?? 0;
    await actor.update({ "system.atributos.destino.value": antes + 1 });
    linhas.push({ label: "Destino (permanente)", value: `${antes} → ${antes + 1}`, breakdown: "20 no Aureum" });
    const grupo = NaurenGrupoHelper.gruposAtivos()[0] ?? game.items.find(i => i.type === "grupo");
    if (grupo) { await NaurenGrupoHelper.ajustar(grupo, "acalanto", 1); linhas.push({ label: "Dado de Acalanto do Destino", value: "+1 para o grupo", breakdown: `no item ${grupo.name}` }); }
    else linhas.push({ label: "Dado de Acalanto do Destino", value: "sem item Grupo no mundo", breakdown: "crie um item Grupo para guardar o Acalanto" });
  }
  naurenPostarCard({ ator: actor, titulo: "Palavra de Destino: Aureum", icone: "icons/sundries/gaming/dice-runed-tan.webp", fonte: "Início do combate", linhas }).catch(() => {});
  return face;
}
// Quando um Sacerdote com Aureum entra num combate (antes da ordem de turnos), o dono dele é perguntado.
Hooks.on("createCombatant", async combatant => {
  if (game.users.activeGM !== game.user) return;
  const actor = combatant.actor;
  if (!actor || !actor.items.some(i => i.type === "habilidade" && naurenEhItem(i, "Palavra de Destino: Aureum") && i.system.ativo !== false)) return;
  const combateId = combatant.parent?.id;
  if (!combateId || actor.getFlag("nauren", "aureumD20")?.combate === combateId) return;
  const quem = NaurenAlvoHelper.usuarioExecutor(actor) ?? game.user;
  const dados = { actorUuid: actor.uuid, combateId };
  if (quem.id === game.user.id) await naurenHandleQueryAureum(dados);
  else await quem.query(NAUREN_QUERY_AUREUM, dados, { timeout: 120000 }).catch(() => null);
});

/**
 * Dado de Acalanto armado num personagem: "sucesso" ou "erro" valem no PRÓXIMO teste de d20
 * dele; "vida" segura em 1 de Vida na próxima vez que ele chegaria a 0.
 */
const NAUREN_QUERY_ACALANTO = "nauren.acalanto";
async function naurenHandleQueryAcalanto({ actorUuid, efeito, de }) {
  const doc = await fromUuid(actorUuid).catch(() => null);
  const actor = doc?.actor ?? doc;
  if (!actor) return false;
  if (!efeito) await actor.unsetFlag("nauren", "acalantoArmado");
  else await actor.setFlag("nauren", "acalantoArmado", { efeito, de });
  return true;
}
async function naurenArmarAcalanto(actor, efeito, de) {
  if (actor.isOwner) return naurenHandleQueryAcalanto({ actorUuid: actor.uuid, efeito, de });
  const gm = game.users.activeGM;
  if (!gm) { ui.notifications.warn("Dado de Acalanto: o Mestre precisa estar conectado."); return false; }
  return gm.query(NAUREN_QUERY_ACALANTO, { actorUuid: actor.uuid, efeito, de }, { timeout: 15000 }).catch(() => false);
}
/** Aplica um Acalanto "sucesso"/"erro" armado neste ator na rolagem de d20 (devolve true se aplicou). */
async function naurenAplicarAcalanto(actor, resultado) {
  const acal = actor?.getFlag?.("nauren", "acalantoArmado");
  if (!acal || (acal.efeito !== "sucesso" && acal.efeito !== "erro") || resultado?.acalanto) return false;
  const rollA = resultado?.rolls?.[resultado.usedIndex];
  if (!rollA) return false;
  resultado.historicoDestino ??= [];
  const antesA = rollA.total;
  rollA._total = acal.efeito === "sucesso" ? Math.max(antesA, 999) : Math.min(antesA, -999);
  resultado.historicoDestino.push({ de: `total ${antesA}`, para: `${acal.efeito === "sucesso" ? "SUCESSO" : "ERRO"} garantido — Dado de Acalanto do Destino (de ${acal.de ?? "o grupo"})` });
  resultado.acalanto = acal.efeito;
  if (actor.isOwner) await actor.unsetFlag("nauren", "acalantoArmado").catch(() => {});
  else await game.users.activeGM?.query(NAUREN_QUERY_ACALANTO, { actorUuid: actor.uuid, efeito: null }, { timeout: 15000 }).catch(() => {});
  return true;
}
const NAUREN_ACALANTO_EFEITOS = { sucesso: "Sucesso garantido no próximo teste", erro: "Erro garantido no próximo teste", vida: "Ao chegar a 0 de Vida, fica com 1" };
/** Usar 1 Dado de Acalanto do item Grupo: escolhe o efeito e em quem. */
async function naurenUsarAcalanto(grupo) {
  if ((grupo.system.acalanto?.value ?? 0) <= 0) { ui.notifications.warn("O grupo não tem Dado de Acalanto do Destino."); return; }
  const vistos = new Set();
  const opcoes = [];
  for (const t of canvas?.tokens?.placeables ?? []) {
    const a = t.actor;
    if (!a || vistos.has(a.uuid)) continue;
    vistos.add(a.uuid);
    opcoes.push(`<option value="${a.uuid}">${t.document.name}</option>`);
  }
  for (const m of grupo.system.membros ?? []) {
    if (!m.actorUuid || vistos.has(m.actorUuid)) continue;
    let a = null; try { a = fromUuidSync(m.actorUuid); } catch (err) { a = null; }
    if (a) { vistos.add(a.uuid); opcoes.push(`<option value="${a.uuid}">${a.name}</option>`); }
  }
  if (!opcoes.length) { ui.notifications.warn("Dado de Acalanto: nenhum personagem na cena ou no Grupo."); return; }
  let alvoUuid = null;
  const efeito = await foundry.applications.api.DialogV2.wait({
    window: { title: "Dado de Acalanto do Destino" },
    content: `<p>Em quem?</p><select data-acalanto-alvo style="width:100%;">${opcoes.join("")}</select>
      <p class="nauren-popup-nota">"Sucesso" e "erro" valem no próximo teste de d20 do escolhido (o card mostra). "Vida" fica armado até ele chegar a 0.</p>`,
    buttons: [...Object.entries(NAUREN_ACALANTO_EFEITOS).map(([k, v]) => ({ action: k, label: v })), { action: "cancelar", label: "Cancelar" }],
    rejectClose: false,
    render: (ev, dialog) => { const sel = dialog.element.querySelector("select[data-acalanto-alvo]"); alvoUuid = sel?.value; sel?.addEventListener("change", () => { alvoUuid = sel.value; }); }
  }).catch(() => "cancelar");
  if (!efeito || efeito === "cancelar" || !alvoUuid) return;
  const doc = await fromUuid(alvoUuid).catch(() => null);
  const alvo = doc?.actor ?? doc;
  if (!alvo) return;
  const ok = await naurenArmarAcalanto(alvo, efeito, game.user.character?.name ?? game.user.name);
  if (!ok) return;
  await NaurenGrupoHelper.ajustar(grupo, "acalanto", -1);
  naurenPostarCard({ ator: alvo, titulo: "Dado de Acalanto do Destino", icone: "icons/sundries/gaming/dice-runed-tan.webp", fonte: grupo.name,
    linhas: [{ label: "Armado", value: NAUREN_ACALANTO_EFEITOS[efeito], breakdown: `em ${alvo.name} • −1 Acalanto do grupo` }] }).catch(() => {});
}
// "Vida": ao chegar a 0, fica com 1 (uma vez).
Hooks.on("preUpdateActor", (actor, mudancas, options, userId) => {
  const nova = foundry.utils.getProperty(mudancas, "system.vida.value");
  if (nova === undefined || nova > 0) return;
  // Condição de salvaguarda (ex.: Sob Costurar a Vida): a 1ª vez que chegaria a 0, fica com 1.
  const salva = (actor.system.vida?.value ?? 0) > 0 ? actor.items.find(i => i.type === "condicao" && i.system.salvaguardaVida && i.system.ativo !== false) : null;
  if (salva) { foundry.utils.setProperty(mudancas, "system.vida.value", 1); options.naurenSalvaguarda = { id: salva.id, nome: salva.name }; return; }
  const ac = actor.getFlag("nauren", "acalantoArmado");
  if (ac?.efeito !== "vida" || (actor.system.vida?.value ?? 0) <= 0) return;
  foundry.utils.setProperty(mudancas, "system.vida.value", 1);
  options.naurenAcalantoVida = true;
});
Hooks.on("updateActor", async (actor, mudancas, options, userId) => {
  if (options.naurenSalvaguarda && userId === game.user.id) {
    await actor.items.get(options.naurenSalvaguarda.id)?.delete().catch(() => {});
    naurenPostarCard({ ator: actor, titulo: options.naurenSalvaguarda.nome, icone: "icons/magic/life/heart-hand-gold-green.webp", fonte: "Ao chegar a 0 de Vida",
      linhas: [{ label: "Vida", value: "fica com 1", breakdown: `${options.naurenSalvaguarda.nome} usada (sai do personagem)` }] }).catch(() => {});
    return;
  }
  if (!options.naurenAcalantoVida || userId !== game.user.id) return;
  await actor.unsetFlag("nauren", "acalantoArmado").catch(() => {});
  naurenPostarCard({ ator: actor, titulo: "Dado de Acalanto do Destino", icone: "icons/sundries/gaming/dice-runed-tan.webp", fonte: "Ao chegar a 0 de Vida",
    linhas: [{ label: "Vida", value: "fica com 1", breakdown: "Acalanto usado" }] }).catch(() => {});
});

/**
 * Oferece rerolar o d20 gastando Dados de Destino, ANTES de qualquer efeito
 * (nada foi aplicado ainda, então não há o que desfazer). Livro: não rerola
 * 20 nem 1 (o 1 pode, com a Oração do Prisma). Pode repetir enquanto houver
 * Dados. Devolve o mesmo "resultado" ({ mode, rolls, usedIndex }), com o d20
 * usado trocado e "historicoDestino" preenchido.
 */
async function naurenOferecerDestino(actor, resultado, { titulo = "", tipo = "teste", bonusLinhas = [], contra = null } = {}) {
  resultado.historicoDestino ??= [];
  if (!actor) return resultado;
  // Dado de Acalanto armado (sucesso/erro garantido): vale neste teste, sem perguntar nada.
  if (await naurenAplicarAcalanto(actor, resultado)) return resultado;
  const temGuardado = () => !!actor.getFlag("nauren", "dadoRoubado") || !!naurenAureumValido(actor)?.face;
  const modo = game.settings.get("nauren", "destinoPerguntar") || "sempre";
  if ((actor.system?.perguntarDestino === false || modo === "nunca") && !temGuardado()) return resultado;
  const temPrisma = () => actor.items.some(i => i.type === "condicao" && i.system.ativo !== false && (naurenEhItem(i, "Oração do Prisma") || /Oração do Prisma/i.test(i.name)));
  const piso = naurenPisoGuiarDestino(actor);
  // Romper o Caminho e afins: só usa Dado de Destino sofrendo 1 Estresse.
  let trava = actor.items.find(i => i.type === "condicao" && i.system.ativo !== false && i.system.destinoCustaEstresse);
  while (true) {
    const dados = actor.system.dadosDestino?.value ?? 0;
    const semEstresseLivre = trava && (actor.system.stress?.value ?? 0) >= (actor.system.stress?.max ?? 2);
    const guardado = actor.getFlag("nauren", "dadoRoubado");
    const aureum = naurenAureumValido(actor)?.face ? naurenAureumValido(actor) : null;
    const roll = resultado.rolls[resultado.usedIndex];
    const face = naurenFaceD20(roll);
    if (face === null) break;
    const podeRerolar = dados > 0 && face !== 20 && (face !== 1 || temPrisma()) && actor.system?.perguntarDestino !== false && modo !== "nunca" && !semEstresseLivre;
    if (!podeRerolar && !guardado && !aureum) break;
    const total = roll.total;
    let resultadoTexto = "";
    if (contra) {
      const vence = total > contra.valor;
      resultadoTexto = contra.ocultarValor
        ? `${contra.rotulo}: <b>${vence ? contra.textoVence : contra.textoPerde}</b>`
        : `${contra.rotulo}: ${contra.valor} → <b>${vence ? contra.textoVence : contra.textoPerde}</b>`;
      if (modo === "erraria" && vence) break;
    } else if (tipo === "ataque" && modo === "erraria") {
      const alvo = Array.from(game.user.targets ?? [])[0]?.actor;
      if (alvo && total > (alvo.system?.defesaTotal ?? alvo.system?.defesa ?? 0)) break;
    }
    const dadosTexto = resultado.rolls.length > 1
      ? resultado.rolls.map((r, i) => `<span style="${i === resultado.usedIndex ? "font-weight: bold; color: #e8b84b;" : "opacity: .55; text-decoration: line-through;"}">${naurenFaceD20(r)}</span>`).join(" e ") + ` (${resultado.mode})`
      : `<b style="color: #e8b84b;">${face}</b>`;
    const linhasBonus = bonusLinhas.filter(l => l && l.label).map(l => `<tr><td>${l.label}</td><td style="text-align: right;">${l.value ?? ""}</td></tr>`).join("");
    const avisos = [
      face === 1 ? "Oração do Prisma: você pode rerolar o 1 natural." : "",
      piso ? `Guiar o Destino: na rerolagem, resultados abaixo de ${piso} (exceto 1) contam como ${piso}.` : "",
      trava ? (semEstresseLivre ? `${trava.name}: para usar Dado de Destino é preciso sofrer 1 Estresse, e o seu Estresse está no máximo.` : `${trava.name}: rerolar também custa 1 Estresse.`) : ""
    ].filter(Boolean).map(a => `<p class="nauren-popup-nota">${a}</p>`).join("");
    const conteudo = `
      <p><b>${titulo}</b>${tipo === "teste" ? " (teste)" : tipo === "esquiva" ? " (esquiva)" : ""}</p>
      <table style="width: 100%; font-size: 13px;">
        <tr><td>d20</td><td style="text-align: right;">${dadosTexto}</td></tr>
        ${linhasBonus}
        <tr style="border-top: 1px solid #555;"><td><b>Total</b></td><td style="text-align: right; font-size: 16px;"><b>${total}</b></td></tr>
      </table>
      ${resultado.historicoDestino.length ? `<p class="nauren-popup-nota">Já rerolado: ${resultado.historicoDestino.map(h => `${h.de} → ${h.para}`).join(", ")}</p>` : ""}
      <p style="margin-top: 6px;">Dados de Destino: <b>${dados}</b> restante(s)${podeRerolar ? " — rerolar gasta 1" : ""}.</p>${guardado ? `<p class="nauren-popup-nota">Tudo é Meu!: você guardou um d20 <b>${guardado.face}</b> de ${guardado.de}.</p>` : ""}${aureum ? `<p class="nauren-popup-nota">Aureum: seu d20 guardado neste combate é <b>${aureum.face}</b>.</p>` : ""}${avisos}`;
    const escolha = await foundry.applications.api.DialogV2.wait({
      window: { title: `Rerolar com Destino — ${actor.name}` },
      content: conteudo,
      buttons: [
        ...(podeRerolar ? [{ action: "rerolar", label: trava ? "Rerolar (+1 Estresse)" : "Rerolar", icon: "fas fa-dice-d20" }] : []),
        ...(guardado ? [{ action: "guardado", label: `Usar d20 guardado (${guardado.face})`, icon: "fas fa-hand-holding" }] : []),
        ...(aureum ? [{ action: "aureum", label: `Usar d20 do Aureum (${aureum.face})`, icon: "fas fa-sun" }] : []),
        { action: "manter", label: "Manter", default: true }
      ],
      rejectClose: false
    }).catch(() => "manter");
    if (escolha === "aureum" && aureum) {
      // Aureum: troca o d20 pelo que o Sacerdote rolou no início do combate (uma vez).
      const dadoRollA = roll.dice.find(d => d.faces === 20);
      const rA = dadoRollA?.results?.find(x => x.active !== false) ?? dadoRollA?.results?.[0];
      if (rA) { const difA = aureum.face - rA.result; rA.result = aureum.face; roll._total = (roll._total ?? roll.total) + difA; }
      resultado.historicoDestino.push({ de: `${face} (total ${total})`, para: `${aureum.face} (total ${roll.total}) — d20 do Aureum` });
      await actor.setFlag("nauren", "aureumD20", { ...aureum, face: null, usado: true });
      break;
    }
    if (escolha === "guardado" && guardado) {
      // Tudo é Meu!: troca o d20 pelo que foi roubado de um aliado.
      const dadoRoll = roll.dice.find(d => d.faces === 20);
      const r = dadoRoll?.results?.find(x => x.active !== false) ?? dadoRoll?.results?.[0];
      if (r) { const diferenca = guardado.face - r.result; r.result = guardado.face; roll._total = (roll._total ?? roll.total) + diferenca; }
      resultado.historicoDestino.push({ de: `${face} (total ${total})`, para: `${guardado.face} (total ${roll.total}) — d20 roubado de ${guardado.de}` });
      await actor.unsetFlag("nauren", "dadoRoubado");
      break;
    }
    if (escolha !== "rerolar") break;
    await actor.update({ "system.dadosDestino.value": dados - 1, ...(trava ? { "system.stress.value": (actor.system.stress?.value ?? 0) + 1 } : {}) });
    if (trava) {
      resultado.historicoDestino.push({ de: "Destino", para: `+1 Estresse (${trava.name}: pago, pode usar Destino de novo)` });
      await trava.delete().catch(() => null);
      trava = null;
    }
    naurenProcessarGatilhos("euGasteiDadoDeDestino", actor).catch(() => {});
    naurenProcessarGatilhos("aliadoGastouDadoDeDestino", actor).catch(() => {});
    const novo = await new Roll(roll.formula).evaluate();
    if (game.dice3d) await game.dice3d.showForRoll(novo, game.user, true).catch(() => {});
    let faceNova = naurenFaceD20(novo);
    let observacao = "";
    if (piso && faceNova !== null && faceNova !== 1 && faceNova < piso) {
      const dado = novo.dice.find(d => d.faces === 20);
      const r = dado.results.find(x => x.active !== false) ?? dado.results[0];
      const diferenca = piso - faceNova;
      r.result = piso;
      novo._total = (novo._total ?? novo.total) + diferenca;
      observacao = ` (Guiar o Destino: ${faceNova} vira ${piso})`;
      faceNova = piso;
    }
    resultado.historicoDestino.push({ de: `${face} (total ${total})`, para: `${faceNova} (total ${novo.total})${observacao}` });
    resultado.rolls[resultado.usedIndex] = novo;
  }
  return resultado;
}
/** Texto do histórico de Destino para cards e linhas. */
function naurenTextoHistoricoDestino(resultado) {
  const h = resultado?.historicoDestino ?? [];
  return h.length ? h.map(x => `${x.de} → ${x.para}`).join("; ") : "";
}

function naurenAjusteCriticoDoGrupo(actor) {
  if (!canvas?.ready || !actor) return { valor: 0, fonte: "" };
  const meuToken = actor.getActiveTokens?.(true)?.[0];
  const disposicao = meuToken?.document?.disposition;
  let melhor = { valor: 0, fonte: "" };
  for (const t of canvas.tokens.placeables) {
    const a = t.actor;
    if (!a || (a !== actor && t.document.disposition !== disposicao)) continue;
    const hab = a.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Teomanina") && i.system.ativo !== false);
    if (!hab) continue;
    const valor = Math.floor((a.system.atributosTotais?.destino ?? a.system.atributos?.destino?.value ?? 0) / 2); // Destino TOTAL (pigmentos, itens, Condições)
    if (valor > melhor.valor) melhor = { valor, fonte: `Teomanina de ${a.name}` };
  }
  return melhor;
}

/** Ajusta Vida/Mana/etc. de um ator de outro dono pelo Mestre. */
const NAUREN_QUERY_RECURSO = "nauren.ajustarRecurso";
async function naurenHandleQueryRecurso({ actorUuid, recurso, valor }) {
  const doc = await fromUuid(actorUuid).catch(() => null);
  const actor = doc?.actor ?? doc;
  if (!actor) return false;
  await actor.update({ [`system.${recurso}.value`]: valor });
  return true;
}
async function naurenOperarRecursoViaMestre(actor, recurso, valor) {
  const gm = game.users.activeGM;
  if (!gm) return false;
  if (gm.id === game.user.id) return naurenHandleQueryRecurso({ actorUuid: actor.uuid, recurso, valor });
  return gm.query(NAUREN_QUERY_RECURSO, { actorUuid: actor.uuid, recurso, valor }, { timeout: 15000 }).catch(() => false);
}

/* ---- Deslocamento forçado (teleporte, empurrão, mover escolhendo) ---- */
// Tokens sendo deslocados por uma regra (não cobram Estamina de movimento).
const naurenTokensDeslocando = new Set();
/**
 * Coloca o token em (x, y) - canto superior esquerdo - SEM passar pelo
 * bloqueio de paredes do Foundry: usa o movimento "deslocar" (teleporte).
 * O caminho já foi validado por quem chamou (paredes, casas ocupadas).
 */
async function naurenDeslocarToken(tokenDoc, x, y, { teleporte = false } = {}) {
  naurenTokensDeslocando.add(tokenDoc.id);
  const opcoes = { naurenEmpurrado: true };
  try {
    if (typeof tokenDoc.move === "function") {
      // Teleporte: "deslocar" (instantâneo, atravessa paredes). Andar: o
      // movimento normal, com animação (o caminho já foi validado).
      const ponto = teleporte ? { x, y, action: "displace" } : { x, y };
      await tokenDoc.move([ponto], { ...opcoes, constrainOptions: { ignoreWalls: teleporte, ignoreCost: true } });
      return true;
    }
  } catch (err) {
    console.warn("Nauren RPG | Deslocamento pelo movimento do Foundry falhou; usando atualização direta.", err);
  }
  await tokenDoc.update({ x, y }, { ...opcoes, teleport: teleporte, animate: !teleporte });
  return true;
}

/* ---- Conceder benefícios do estado ativo (Fase 7) ---- */
const NAUREN_QUERY_CRIAR_ITEM = "nauren.criarItemNoAtor";
async function naurenHandleQueryCriarItem({ actorUuid, dados }) {
  const doc = await fromUuid(actorUuid).catch(() => null);
  const actor = doc?.actor ?? doc;
  if (!actor) return null;
  const [criado] = await actor.createEmbeddedDocuments("Item", [dados]);
  return criado?.name ?? null;
}
/** Cria um item num ator (o dono cria direto; senão o Mestre cria). */
async function naurenCriarItemNoAtor(actor, dados) {
  if (actor.isOwner) { const [c] = await actor.createEmbeddedDocuments("Item", [dados]); return c?.name ?? null; }
  const executor = NaurenAlvoHelper.usuarioExecutor(actor) ?? game.users.activeGM;
  if (!executor) return null;
  return executor.query(NAUREN_QUERY_CRIAR_ITEM, { actorUuid: actor.uuid, dados }, { timeout: 15000 }).catch(() => null);
}
/**
 * Benefícios de um estado (Condição de uma Forma, Postura...): cada
 * modificador positivo vira uma opção, mais Crescimento extra, redução de
 * custo e o item concedido. Valores com fórmula são fixados com os
 * atributos de QUEM concede (ex.: @manaMax do Druida).
 */
function naurenBeneficiosDoEstado(estado, dono) {
  const sys = estado.system;
  const opcoes = [];
  const nomeCampo = campo => String(NAUREN_CAMPOS_MODIFICADOR_OPCOES[campo] ?? campo).replace(/\s*\(.*\)\s*$/, "");
  const fixar = v => {
    const texto = String(v ?? "").replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, dono)));
    const n = naurenAvaliarExpressaoSimples(texto);
    return Number.isFinite(n) ? n : null;
  };
  (sys.modificadores ?? []).forEach((m, i) => {
    if (!m.campo || m.valor === undefined || m.valor === "") return;
    const bruto = String(m.valor).trim();
    if (bruto === "auto") {
      opcoes.push({ id: `mod${i}`, rotulo: `${nomeCampo(m.campo)} (+1 dado)`, modificador: { campo: m.campo, valor: "auto" } });
      return;
    }
    const n = fixar(bruto.replace(/^\+/, ""));
    if (n === null || n <= 0) return; // penalidades não são benefício
    opcoes.push({ id: `mod${i}`, rotulo: `${nomeCampo(m.campo)} +${n}`, modificador: { campo: m.campo, valor: String(n) } });
  });
  if (Number(sys.crescimentoMaxNivelExtra) > 0) opcoes.push({ id: "crescimento", rotulo: "Crescimento mais uma vez por magia", sistema: { crescimentoMaxNivelExtra: sys.crescimentoMaxNivelExtra } });
  (sys.reduzCustoEstamina ?? []).forEach((r, i) => opcoes.push({ id: `red${i}`, rotulo: `${r.soCura ? "Curas" : "Ações"}${r.tipoItem ? ` (${r.tipoItem})` : ""} custam ${r.quantidade} Estamina a menos`, reducao: r }));
  if (sys.usaConcederItem && sys.concederItemUuid) {
    let nome = "item da forma";
    try { nome = fromUuidSync(sys.concederItemUuid)?.name ?? nome; } catch (err) { /* nome genérico */ }
    opcoes.push({ id: "item", rotulo: `${nome} (recebe o item)`, item: sys.concederItemUuid });
  }
  return opcoes;
}

/* ---- Mover escolhendo no mapa (Fase 7) ---- */
const NAUREN_QUERY_MOVER_TOKEN = "nauren.moverToken";
async function naurenHandleQueryMoverToken({ tokenUuid, x, y, teleporte = false }) {
  const doc = await fromUuid(tokenUuid).catch(() => null);
  if (!doc) return false;
  return naurenDeslocarToken(doc, x, y, { teleporte });
}
/** Move um token (o dono move direto; senão o Mestre move). Não cobra Estamina de movimento. */
async function naurenMoverTokenPara(tokenDoc, centro, { teleporte = false } = {}) {
  const x = centro.x - tokenDoc.width * canvas.grid.size / 2;
  const y = centro.y - tokenDoc.height * canvas.grid.size / 2;
  if (tokenDoc.isOwner) return naurenDeslocarToken(tokenDoc, x, y, { teleporte });
  const gm = game.users.activeGM;
  if (!gm) return false;
  return gm.query(NAUREN_QUERY_MOVER_TOKEN, { tokenUuid: tokenDoc.uuid, x, y, teleporte }, { timeout: 15000 }).catch(() => false);
}

/* ---- Palavra (Místico, Caligrafia) - livro 0.8 ----
 * "Alvos marcados com palavras sofrem 1 acúmulo de Lerdeza, Loucura ou
 * Fragmentado." Toda Palavra aplicada (Espalhar a Palavra, Golpe Espiritual
 * com Sequência Caligráfica) pergunta ao dono do Místico qual Condição vai junto.
 */
const NAUREN_QUERY_ESCOLHA_PALAVRA = "nauren.escolhaPalavra";
async function naurenHandleQueryEscolhaPalavra({ alvoNome, origem }) {
  return foundry.applications.api.DialogV2.wait({
    window: { title: `Palavra — ${alvoNome}` },
    content: `<p><b>${alvoNome}</b> foi marcado com uma Palavra (${origem}). Qual Condição a Palavra causa?</p>`,
    buttons: [{ action: "condicao-lerdeza", label: "Lerdeza", default: true }, { action: "condicao-loucura", label: "Loucura" }, { action: "condicao-fragmentado", label: "Fragmentado" }],
    rejectClose: false
  }).catch(() => "condicao-lerdeza");
}
/** Aplica 1 Palavra + a Condição escolhida pelo dono do Místico. Devolve os nomes aplicados. */
async function naurenAplicarPalavraComEscolha(alvoActor, misticoActor, origem) {
  if (!alvoActor) return [];
  const packCond = game.packs.find(pk => pk.metadata.label === "Nauren - Condições e Venenos");
  const quem = NaurenAlvoHelper.usuarioExecutor(misticoActor) ?? game.user;
  const dados = { alvoNome: alvoActor.name, origem };
  let seedCond = quem.id === game.user.id ? await naurenHandleQueryEscolhaPalavra(dados)
    : await quem.query(NAUREN_QUERY_ESCOLHA_PALAVRA, dados, { timeout: naurenTimeoutReacaoMs() }).catch(() => null);
  if (!["condicao-lerdeza", "condicao-loucura", "condicao-fragmentado"].includes(seedCond)) seedCond = "condicao-lerdeza";
  const aplicados = [];
  for (const seed of ["condicao-palavra", seedCond]) {
    const uuidC = await naurenUuidPorSeed(packCond, seed);
    if (!uuidC) continue;
    const ex = NaurenAlvoHelper.usuarioExecutor(alvoActor);
    const nome = ex?.id === game.user.id ? await NaurenAlvoHelper.aplicarCondicao(alvoActor, uuidC, 1).catch(() => null)
      : await ex?.query(NAUREN_QUERY_APLICAR_CONDICAO, { actorUuid: alvoActor.uuid, uuid: uuidC, acumulos: 1 }, { timeout: 20000 }).catch(() => null);
    if (nome) aplicados.push(nome);
  }
  return aplicados;
}

/* ---- Bônus que dependem de aliados por perto (@aliados_Nm nos modificadores): recalcula ao mover tokens ---- */
function naurenRecalcularBonusDeAliados() {
  if (!canvas?.ready) return;
  const usa = a => a?.items?.some?.(i => JSON.stringify(i.system?.efeitosVinculados ?? []).includes("@aliados_") || JSON.stringify(i.system?.modificadores ?? []).includes("@aliados_"));
  const vistos = new Set();
  for (const t of canvas.tokens.placeables) {
    const a = t.actor; if (!a || vistos.has(a.uuid) || !usa(a)) continue;
    vistos.add(a.uuid);
    a.prepareData(); a.sheet?.rendered && a.sheet.render(false); t.renderFlags?.set?.({ refreshBars: true });
  }
}
for (const ev of ["updateToken", "createToken", "deleteToken"]) Hooks.on(ev, () => setTimeout(naurenRecalcularBonusDeAliados, 50));

/* ---- Druidismo (Fase 7): escolha ao subir de nível ---- */
const NAUREN_QUERY_ESCOLHA_DRUIDISMO = "nauren.escolhaDruidismo";
async function naurenHandleQueryEscolhaDruidismo({ nome, nivel, druida, exceto = "", segunda = false }) {
  const todas = [{ action: "lagoa", label: "Lagoa" }, { action: "cachoeira", label: "Cachoeira" }, { action: "chuva", label: "Chuva" }].filter(b => b.action !== exceto);
  todas[todas.length - 1].default = true;
  return foundry.applications.api.DialogV2.wait({
    window: { title: `Druidismo — ${nome} (nível ${nivel})${segunda ? " · 2ª bênção" : ""}` },
    content: `<p><b>${nome}</b> subiu para o nível ${nivel}. Pelo Druidismo de <b>${druida}</b>, escolha ${segunda ? "a <b>segunda</b> bênção (Druida no nível 16 ou mais)" : "uma bênção"}:</p>
      <ul>${todas.map(b => `<li>${{ lagoa: "<b>Lagoa:</b> +1 ponto para distribuir nas Subclasses.", cachoeira: "<b>Cachoeira:</b> pode mudar 2 pontos de Subclasse já investidos.", chuva: "<b>Chuva:</b> +3 Pontos de Vida adicionais." }[b.action]}</li>`).join("")}</ul>`,
    buttons: todas,
    rejectClose: false
  }).catch(() => null);
}
const naurenNivelAntesDruidismo = new Map();
Hooks.on("preUpdateActor", (actor, mudancas) => {
  const novo = foundry.utils.getProperty(mudancas, "system.nivel");
  if (novo !== undefined) naurenNivelAntesDruidismo.set(actor.uuid, actor.system.nivel ?? 0);
});
/** Efeito do Druidismo (um por bênção, somando ×N) - sem ícone no token. */
async function naurenAjustarEfeitoDruidismo(actor, tipo, delta) {
  const config = {
    lagoa: { nome: "Druidismo: Lagoa", campo: "pontosSubclasse", porVez: 1, img: "icons/commodities/materials/liquid-droplet-blue.webp", texto: "+1 ponto para distribuir nas Subclasses" },
    chuva: { nome: "Druidismo: Chuva", campo: "vida", porVez: 3, img: "icons/magic/nature/root-vine-caduceus-healing.webp", texto: "+3 Pontos de Vida adicionais" }
  }[tipo];
  if (!config) return;
  const existente = actor.items.find(i => i.type === "efeito" && i.getFlag("nauren", "druidismo") === tipo);
  const vezes = Math.max(0, (existente?.getFlag("nauren", "druidismoVezes") ?? 0) + delta);
  if (!vezes) { if (existente) await existente.delete(); return; }
  const sistema = {
    ativo: true,
    modificadores: [{ campo: config.campo, valor: String(config.porVez * vezes) }],
    descricao: naurenMontarDescricao({ regra: `Origem: Druidismo (Druida). ${config.texto}, por bênção recebida ao subir de nível.`, automatico: `+${config.porVez * vezes} no total (${vezes}×). Desfeito se o personagem descer do nível em que recebeu.`, manual: "" })
  };
  const nome = vezes > 1 ? `${config.nome} (×${vezes})` : config.nome;
  if (existente) await existente.update({ name: nome, system: sistema, "flags.nauren.druidismoVezes": vezes });
  else await actor.createEmbeddedDocuments("Item", [{ name: nome, type: "efeito", img: config.img, system: sistema, flags: { nauren: { druidismo: tipo, druidismoVezes: vezes } } }]);
}

Hooks.on("updateActor", async (actor, mudancas) => {
  const novo = foundry.utils.getProperty(mudancas, "system.nivel");
  if (novo === undefined) return;
  const antes = naurenNivelAntesDruidismo.get(actor.uuid);
  naurenNivelAntesDruidismo.delete(actor.uuid);
  if (game.users.activeGM !== game.user || actor.type !== "personagem" || antes === undefined || novo === antes) return;
  const escolhas = foundry.utils.deepClone(actor.getFlag("nauren", "druidismoEscolhas") ?? {});

  // Desceu de nível: desfaz as bênçãos dos níveis perdidos (e volta a perguntar ao subir).
  if (novo < antes) {
    const desfeitas = [];
    for (const [nivelTxt, escolha] of Object.entries(escolhas)) {
      if (parseInt(nivelTxt, 10) <= novo) continue;
      if (escolha === "lagoa") {
        await naurenAjustarEfeitoDruidismo(actor, "lagoa", -1);
        await actor.update({ "system.pontosSubclasse.value": Math.max(0, (actor.system.pontosSubclasse?.value ?? 0) - 1) });
      } else if (escolha === "chuva") {
        await naurenAjustarEfeitoDruidismo(actor, "chuva", -1);
      }
      desfeitas.push(`nível ${nivelTxt}: ${escolha}`);
      delete escolhas[nivelTxt];
    }
    if (desfeitas.length) {
      await actor.unsetFlag("nauren", "druidismoEscolhas");
      await actor.setFlag("nauren", "druidismoEscolhas", escolhas);
      naurenPostarCard({ ator: actor, titulo: "Druidismo", icone: "icons/magic/nature/leaf-oak-wreath-glow-green.webp", fonte: `Desceu para o nível ${novo}`, linhas: [{ label: "Desfeito", value: desfeitas.join(", ") }] });
    }
    return;
  }

  // Só um Druida com token na MESMA cena de quem subiu (não qualquer ficha do mundo - servidor com muitas fichas).
  const druida = [...naurenAliadosDoGrupo(actor)].find(a => a?.type === "personagem" && (a.system.nivel ?? 0) >= 13
    && a.items.some(i => i.type === "habilidade" && naurenEhItem(i, "Druidismo") && i.system.ativo !== false));
  if (!druida) return;
  // Ficha nova levada direto a um nível alto (Criador/Mestre): não é "subir de nível em jogo" - sem dezenas de janelas.
  if ((antes ?? 0) <= 1 && novo - (antes ?? 0) > 1) {
    naurenPostarCard({ ator: actor, titulo: "Druidismo", icone: "icons/sundries/misc/pipe-wooden-curved-oak.webp", fonte: `Ficha criada no nível ${novo}`,
      linhas: [{ label: "Bênçãos", value: "não se aplicam", breakdown: "o Druidismo vale ao subir de nível em jogo, não na criação da ficha" }] });
    return;
  }
  // Livro 0.8: com o Druida no nível 16 ou mais (Druidismo Melhoria), cada nível dá uma bênção adicional
  // (diferente da primeira). A 2ª fica guardada como "<nível>b".
  const blocos = [];
  for (let nivel = antes + 1; nivel <= novo; nivel++) {
    blocos.push({ nivel, chave: String(nivel), segunda: false });
    if ((druida.system.nivel ?? 0) >= 16) blocos.push({ nivel, chave: `${nivel}b`, segunda: true });
  }
  for (const { nivel, chave, segunda } of blocos) {
    if (escolhas[chave]) continue;
    if (segunda && !escolhas[String(nivel)]) continue;
    const executor = NaurenAlvoHelper.usuarioExecutor(actor) ?? game.user;
    const dados = { nome: actor.name, nivel, druida: druida.name, segunda, exceto: segunda ? escolhas[String(nivel)] : "" };
    const escolha = executor.id === game.user.id
      ? await naurenHandleQueryEscolhaDruidismo(dados)
      : await executor.query(NAUREN_QUERY_ESCOLHA_DRUIDISMO, dados, { timeout: naurenTimeoutReacaoMs() }).catch(() => null);
    if (!escolha) continue;
    const linhas = [{ label: "Escolha", value: escolha === "lagoa" ? "Lagoa" : escolha === "chuva" ? "Chuva" : "Cachoeira" }];
    if (escolha === "lagoa") {
      await naurenAjustarEfeitoDruidismo(actor, "lagoa", 1);
      await actor.update({ "system.pontosSubclasse.value": (actor.system.pontosSubclasse?.value ?? 0) + 1 });
      linhas.push({ label: "Recebeu", value: "+1 ponto de Subclasse" });
    } else if (escolha === "chuva") {
      await naurenAjustarEfeitoDruidismo(actor, "chuva", 1);
      await actor.update({ "system.vida.value": (actor.system.vida?.value ?? 0) + 3 });
      linhas.push({ label: "Recebeu", value: "+3 de Vida máxima" });
    } else {
      linhas.push({ label: "Cachoeira", value: "pode mudar 2 pontos de Subclasse já investidos", breakdown: "remanejar com o Mestre (resetar e reinvestir)" });
    }
    escolhas[chave] = escolha;
    await actor.setFlag("nauren", "druidismoEscolhas", escolhas);
    naurenPostarCard({ ator: actor, titulo: segunda ? "Druidismo (2ª bênção)" : "Druidismo", icone: "icons/sundries/misc/pipe-wooden-curved-oak.webp", fonte: `Nível ${nivel} • bênção de ${druida.name}${segunda ? " (Druidismo Melhoria, nível 16)" : ""}`, linhas });
  }
});

/** Linhas de resumo de uma entidade (card de criação e de fim). */
function naurenLinhasEntidade(estado) {
  const linhas = [];
  if (estado.cargasMax) linhas.push({ label: "Cargas", value: `${estado.cargas} / ${estado.cargasMax}` });
  if (estado.vidaMax) linhas.push({ label: "Vida", value: `${estado.vida} / ${estado.vidaMax}` });
  const interacao = [estado.custo ? `−${estado.custo} Estamina` : "", estado.cura ? `cura ${estado.cura}` : "", estado.condNome ? `recebe ${estado.condNome}` : ""].filter(Boolean).join(" • ");
  if (interacao) linhas.push({ label: "Ao interagir", value: interacao, breakdown: "dê target (T) no token com o seu personagem selecionado" });
  if (estado.esgotarCura) linhas.push({ label: "Ao esgotar", value: `cura ${estado.esgotarCura}${estado.esgotarRaio ? ` em aliados a até ${estado.esgotarRaio}m` : ""}` });
  if (estado.bloqueia) linhas.push({ label: "Bloqueia", value: "passagem e visão (paredes em volta)" });
  return linhas;
}
/** Os 4 segmentos de parede em volta de um retângulo. */
function naurenRetanguloParedes(x, y, w, h) {
  const x2 = x + w, y2 = y + h;
  return [[x, y, x2, y], [x2, y, x2, y2], [x2, y2, x, y2], [x, y2, x, y]];
}

/**
 * Paredes de uma entidade que bloqueia (0.84). Antes: 4 paredes normais na borda do token,
 * bloqueando visão nos dois sentidos - o interior (onde está o token) nunca ficava na linha de
 * visão de ninguém, então a entidade sumia e não dava para dar alvo nela.
 * Agora são 8 paredes:
 *  - 4 de MOVIMENTO (e som): ninguém atravessa; não bloqueiam visão;
 *  - 4 de VISÃO/LUZ de mão única, "transparentes" para quem olha de fora para dentro: quem está fora
 *    vê a entidade (o lado de dentro), mas a parede do fundo ainda corta a visão para além dela.
 * A direção é a do lado de FORA de cada parede (o Foundry ignora uma parede direcional quando quem
 * olha está do lado igual à direção dela).
 */
function naurenDirecaoForaDaParede(c, centro) {
  const D = CONST.WALL_DIRECTIONS;
  const [ax, ay, bx, by] = c;
  // ponto do lado de fora: o meio da parede empurrado para longe do centro do retângulo
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  const fora = { x: mx + Math.sign(mx - centro.x) * 10, y: my + Math.sign(my - centro.y) * 10 };
  const orient = (foundry.utils.orient2dFast ?? ((a, b, p) => (a.y - p.y) * (b.x - p.x) - (a.x - p.x) * (b.y - p.y)))({ x: ax, y: ay }, { x: bx, y: by }, fora);
  if (!orient) return D.BOTH;
  return orient < 0 ? D.LEFT : D.RIGHT;
}
function naurenDadosParedesEntidade(x, y, w, h) {
  const S = CONST.WALL_SENSE_TYPES, M = CONST.WALL_MOVEMENT_TYPES, D = CONST.WALL_DIRECTIONS;
  const segs = naurenRetanguloParedes(x, y, w, h), centro = { x: x + w / 2, y: y + h / 2 };
  const movimento = segs.map(c => ({ c, move: M.NORMAL, sight: S.NONE, light: S.NONE, sound: S.NORMAL, dir: D.BOTH, flags: { nauren: { paredeEntidade: "movimento" } } }));
  const visao = segs.map(c => ({ c, move: M.NONE, sight: S.NORMAL, light: S.NORMAL, sound: S.NONE, dir: naurenDirecaoForaDaParede(c, centro), flags: { nauren: { paredeEntidade: "visao" } } }));
  return [...movimento, ...visao];
}
/** Confere, com o próprio Foundry, se cada parede de visão ficou virada para fora (corrige se não). */
async function naurenAjustarDirecaoParedesEntidade(cena, ids, x, y, w, h) {
  const centro = { x: x + w / 2, y: y + h / 2 };
  const correcoes = [];
  for (const id of ids) {
    const doc = cena.walls.get(id);
    if (doc?.getFlag("nauren", "paredeEntidade") !== "visao") continue;
    const obj = doc.object, aresta = obj?.edge ?? obj;
    if (typeof aresta?.orientPoint !== "function") continue;
    const [ax, ay, bx, by] = doc.c, mx = (ax + bx) / 2, my = (ay + by) / 2;
    const lado = aresta.orientPoint({ x: mx + Math.sign(mx - centro.x) * 10, y: my + Math.sign(my - centro.y) * 10 });
    if (lado && lado !== doc.dir) correcoes.push({ _id: id, dir: lado });
  }
  if (correcoes.length) await cena.updateEmbeddedDocuments("Wall", correcoes).catch(() => {});
}

function naurenEntidadeInterativa(estado) {
  return !!(estado?.ativa && (estado.custo || estado.cura || estado.condUuid) && (!estado.cargasMax || estado.cargas > 0));
}
function naurenNomeTokenEntidade(estado) {
  return estado.cargasMax ? `${estado.nome} (${estado.cargas}/${estado.cargasMax})` : estado.nome;
}

/** Remove paredes, área e ficha de uma entidade (idempotente). Só o Mestre. */
/**
 * Apaga itens do ator só se ainda existirem, um pedido por vez por ator. Evita o erro do servidor
 * "id [...] does not exist in the EmbeddedCollection" quando duas rotinas tentam apagar o mesmo
 * item (ex.: a Rede destruída e outra limpeza de Condição no mesmo instante).
 */
const naurenApagandoItens = new Map(); // actor.uuid -> Set(ids em andamento)
async function naurenApagarItensSeExistirem(actor, ids) {
  if (!actor || !ids?.length) return [];
  const emAndamento = naurenApagandoItens.get(actor.uuid) ?? new Set();
  naurenApagandoItens.set(actor.uuid, emAndamento);
  const livres = [...new Set(ids)].filter(id => actor.items.has(id) && !emAndamento.has(id));
  if (!livres.length) return [];
  livres.forEach(id => emAndamento.add(id));
  try { return await actor.deleteEmbeddedDocuments("Item", livres.filter(id => actor.items.has(id))).catch(() => []); }
  finally { livres.forEach(id => emAndamento.delete(id)); }
}
const naurenEntidadesLimpando = new Set(); // trava: a mesma entidade não é limpa duas vezes ao mesmo tempo
async function naurenLimparEntidade(actor, motivo) {
  const estado = foundry.utils.deepClone(actor?.getFlag("nauren", "entidade") ?? null);
  if (!estado || estado.limpa || !actor?.id || naurenEntidadesLimpando.has(actor.id)) return;
  naurenEntidadesLimpando.add(actor.id);
  try { await naurenLimparEntidadeInterno(actor, motivo, estado); }
  finally { setTimeout(() => naurenEntidadesLimpando.delete(actor.id), 5000); }
}
async function naurenLimparEntidadeInterno(actor, motivo, estado) {
  // Destruída por dano: espera o ataque terminar de mexer no token (reação, ícones, animação) antes de apagá-lo.
  if (motivo === "destruída") await new Promise(r => setTimeout(r, 400));
  estado.limpa = true; estado.ativa = false;
  await actor.setFlag("nauren", "entidade", estado).catch(() => {});
  // Fase 5 (M13): solta quem a entidade segurava (Preso pela Rede etc.), com card no alvo.
  if (estado.segura?.alvos?.length) {
    for (const u of estado.segura.alvos) {
      const t = await fromUuid(u).catch(() => null);
      const alvo = t?.actor;
      if (!alvo) continue;
      const tirar = naurenCondicoesAtivas(alvo).filter(c => estado.segura.nomes.includes(c.name) && (!estado.segura.conjuradorTokenUuid || c.system.conjuradorUuid === estado.segura.conjuradorTokenUuid));
      const ids = tirar.map(c => c.id).filter(id => alvo.items.has(id));
      if (!ids.length) continue;
      await naurenApagarItensSeExistirem(alvo, ids);
      naurenPostarCard({ ator: alvo, titulo: "Condição encerrada", icone: estado.imagem, fonte: `${estado.nome}: ${motivo}`,
        linhas: tirar.map(c => ({ label: c.name, value: "terminou", breakdown: `${estado.nome} segurava ${alvo.name} e foi ${motivo}` })) }).catch(() => {});
    }
  }
  const cena = game.scenes.get(estado.cenaId) ?? canvas.scene;
  if (cena && estado.paredesIds?.length) await cena.deleteEmbeddedDocuments("Wall", estado.paredesIds.filter(id => cena.walls.get(id))).catch(() => {});
  if (estado.regiaoUuid) { const reg = await fromUuid(estado.regiaoUuid).catch(() => null); if (reg) await reg.delete().catch(() => {}); }
  if (cena) {
    // Só o que ainda existe (outro cliente pode ter apagado antes): evita "Token does not exist".
    const toks = cena.tokens.filter(t => t.actorId === actor.id).map(t => t.id).filter(id => cena.tokens.has(id));
    if (toks.length) await cena.deleteEmbeddedDocuments("Token", toks).catch(() => {});
  }
  naurenPostarCard({ titulo: estado.nome, icone: estado.imagem, fonte: `Entidade de campo • de ${estado.donoNome}`, linhas: [{ label: "Encerrada", value: motivo }] });
  if (game.actors.has(actor.id)) await actor.delete().catch(() => {});
}

// Fase 5 (M13): o alvo se soltou sozinho (pagou para remover, foi curado...) - a entidade que o segurava some.
Hooks.on("deleteItem", async item => {
  if (item.type !== "condicao" || game.users.activeGM !== game.user) return;
  const dono = item.parent;
  if (!dono) return;
  for (const ent of game.actors.filter(a => { const e = a.getFlag("nauren", "entidade"); return e?.ativa && !e.limpa && e.segura?.nomes?.includes(item.name); })) {
    const e = ent.getFlag("nauren", "entidade");
    let aindaSegura = false;
    for (const u of e.segura.alvos ?? []) {
      const t = await fromUuid(u).catch(() => null);
      if (t?.actor && naurenCondicoesAtivas(t.actor).some(c => e.segura.nomes.includes(c.name) && (!e.segura.conjuradorTokenUuid || c.system.conjuradorUuid === e.segura.conjuradorTokenUuid))) { aindaSegura = true; break; }
    }
    if (!aindaSegura) await naurenLimparEntidade(ent, `desfeita: ${dono.name} se soltou`);
  }
});

async function naurenHandleQueryEntidade({ operacao, estado: estadoNovo, actorUuid, atorUuid }) {
  if (operacao === "criar") {
    const estado = estadoNovo;
    // Limite de entidades iguais ativas por personagem: a mais antiga sai.
    if (estado.maximo > 0) {
      const iguais = game.actors.filter(a => { const e = a.getFlag("nauren", "entidade"); return e?.ativa && !e.limpa && e.chave === estado.chave; });
      const excesso = iguais.length + 1 - estado.maximo;
      for (const antiga of iguais.slice(0, Math.max(0, excesso))) await naurenLimparEntidade(antiga, `substituída por uma nova (máximo ${estado.maximo})`);
    }
    let pasta = game.folders.find(f => f.type === "Actor" && f.name === NAUREN_PASTA_ENTIDADES);
    if (!pasta) pasta = await Folder.create({ name: NAUREN_PASTA_ENTIDADES, type: "Actor", color: "#4a3a6a" });
    const invulneravel = !estado.vidaMax;
    const [actor] = await Actor.createDocuments([{
      name: estado.nome, type: "npc", img: estado.imagem, folder: pasta.id,
      system: { nivel: 1, calculoVida: "customizado", vidaFormula: String(estado.vidaMax || 1) },
      ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED },
      flags: { nauren: { entidade: { ...estado, invulneravel } } }
    }]);
    await naurenPreencherRecursosNoMaximo(actor);
    const cena = game.scenes.get(estado.cenaId) ?? canvas.scene;
    const casa = cena.grid.size;
    const larguraCasas = estado.largura ?? estado.tamanho ?? 1;
    const alturaCasas = estado.altura ?? estado.tamanho ?? 1;
    // Canto superior esquerdo alinhado ao grid, com o centro na posição.
    const x = Math.round((estado.posicao.x - larguraCasas * casa / 2) / casa) * casa;
    const y = Math.round((estado.posicao.y - alturaCasas * casa / 2) / casa) * casa;
    const [tokenDoc] = await cena.createEmbeddedDocuments("Token", [{
      actorId: actor.id, actorLink: true, name: naurenNomeTokenEntidade(estado), texture: { src: estado.imagem },
      x, y, width: larguraCasas, height: alturaCasas, disposition: estado.donoDisposicao,
      displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
      displayBars: estado.vidaMax ? CONST.TOKEN_DISPLAY_MODES.ALWAYS : CONST.TOKEN_DISPLAY_MODES.NONE,
      bar1: { attribute: "vida" }
    }]);
    let paredesIds = [];
    if (estado.bloqueia) {
      const paredes = await cena.createEmbeddedDocuments("Wall", naurenDadosParedesEntidade(x, y, larguraCasas * casa, alturaCasas * casa));
      paredesIds = paredes.map(w => w.id);
      await naurenAjustarDirecaoParedesEntidade(cena, paredesIds, x, y, larguraCasas * casa, alturaCasas * casa);
    }
    await actor.setFlag("nauren", "entidade", { ...estado, invulneravel, paredesIds, tokenId: tokenDoc.id });
    const linhasCriacao = naurenLinhasEntidade(estado);
    if (estado.segura?.alvos?.length) {
      const nomesAlvos = [];
      for (const u of estado.segura.alvos) { const t = await fromUuid(u).catch(() => null); if (t) nomesAlvos.push(naurenNomeDeToken(t)); }
      linhasCriacao.push({ label: "Segura", value: `${estado.segura.nomes.join(", ")} em ${nomesAlvos.join(", ")}`, breakdown: estado.vidaMax ? "destruí-la solta o alvo" : "some se o alvo se soltar" });
    }
    naurenPostarCard({ ator: actor, titulo: estado.nome, icone: estado.imagem, fonte: `Entidade de campo • criada por ${estado.donoNome}`, linhas: linhasCriacao });
    return { ok: true };
  }

  const actor = actorUuid ? await fromUuid(actorUuid).catch(() => null) : null;
  const estado = foundry.utils.deepClone(actor?.getFlag("nauren", "entidade") ?? null);
  if (!estado?.ativa) return { ok: false, motivo: "entidade encerrada" };

  if (operacao === "interagir") {
    const ator = await fromUuid(atorUuid).catch(() => null);
    const alvo = ator?.actor ?? ator;
    if (!alvo) return { ok: false, motivo: "personagem não encontrado" };
    if (estado.cargasMax && estado.cargas <= 0) return { ok: false, motivo: "sem cargas" };
    const estAtual = alvo.system.estaminaCombate?.value ?? 0;
    if (estado.custo && estAtual < estado.custo) return { ok: false, motivo: `${alvo.name} não tem ${estado.custo} Estamina` };
    const linhas = [];
    if (estado.custo) { await alvo.update({ "system.estaminaCombate.value": estAtual - estado.custo }); linhas.push({ label: "Custo", value: `−${estado.custo} Estamina` }); }
    if (estado.cura) {
      const roll = await new Roll(estado.cura).evaluate();
      const antes = alvo.system.vida?.value ?? 0;
      const depois = Math.min(alvo.system.vida?.max ?? antes, antes + Math.max(0, roll.total));
      await alvo.update({ "system.vida.value": depois });
      linhas.push({ label: "Cura", value: depois - antes, breakdown: `${naurenFormulaParaTexto(estado.cura)} → ${naurenTextoRolagem(roll)}` });
    }
    if (estado.condUuid) {
      const nome = await NaurenAlvoHelper.aplicarCondicao(alvo, estado.condUuid, 1).catch(() => null);
      if (nome) linhas.push({ label: "Recebeu", value: nome });
    }
    if (estado.cargasMax) { estado.cargas -= 1; linhas.push({ label: "Cargas", value: `${estado.cargas + 1} → ${estado.cargas}` }); }
    naurenPostarCard({ ator: alvo, titulo: estado.nome, icone: estado.imagem, fonte: `Entidade de campo • de ${estado.donoNome}`, linhas });
    await actor.setFlag("nauren", "entidade", estado);
    const cena = game.scenes.get(estado.cenaId) ?? canvas.scene;
    const tok = cena?.tokens.get(estado.tokenId);
    if (tok) await tok.update({ name: naurenNomeTokenEntidade(estado) }).catch(() => {});
    if (estado.cargasMax && estado.cargas <= 0) {
      if (estado.esgotarCura) {
        const roll = await new Roll(estado.esgotarCura).evaluate();
        const cura = Math.max(0, roll.total);
        const centro = tok?.object?.center ?? estado.posicao;
        const curados = [];
        for (const t of canvas?.tokens?.placeables ?? []) {
          if (!t.actor || t.actor === actor || t.document.disposition !== estado.donoDisposicao) continue;
          if (estado.esgotarRaio && centro) {
            const d = canvas.grid.measurePath([centro, t.center])?.distance ?? Infinity;
            if (d > estado.esgotarRaio) continue;
          }
          const antes = t.actor.system.vida?.value ?? 0;
          const depois = Math.min(t.actor.system.vida?.max ?? antes, antes + cura);
          await t.actor.update({ "system.vida.value": depois });
          curados.push(`${naurenNomeDeToken(t)} (+${depois - antes})`);
        }
        naurenPostarCard({ titulo: estado.nome, icone: estado.imagem, fonte: "Entidade de campo • esgotou",
          linhas: [{ label: "Cura em área", value: cura, breakdown: `${naurenFormulaParaTexto(estado.esgotarCura)} → ${naurenTextoRolagem(roll)}${estado.esgotarRaio ? ` • raio ${estado.esgotarRaio}m` : ""}` },
                   { label: "Curados", value: curados.join(", ") || "ninguém ao alcance" }] });
      }
      await naurenLimparEntidade(actor, "cargas esgotadas");
    }
    return { ok: true };
  }
  if (operacao === "encerrar") { await naurenLimparEntidade(actor, "encerrada manualmente"); return { ok: true }; }
  return { ok: false, motivo: "operação desconhecida" };
}

async function naurenOperarEntidade(operacao, dados = {}) {
  const gm = game.users.activeGM;
  if (!gm) { ui.notifications.warn("A entidade de campo precisa do Mestre conectado."); return; }
  const resposta = gm.id === game.user.id
    ? await naurenHandleQueryEntidade({ operacao, ...dados })
    : await gm.query(NAUREN_QUERY_ENTIDADE, { operacao, ...dados }, { timeout: 20000 }).catch(() => null);
  if (resposta && !resposta.ok) ui.notifications.warn(`Entidade: ${resposta.motivo}.`);
}

// Dar target numa entidade interativa pergunta se quer interagir (quem recusa
// continua com o target normal, para atacar, por exemplo).
Hooks.on("targetToken", async (usuario, token, marcado) => {
  if (usuario !== game.user || !marcado) return;
  const estado = token.actor?.getFlag("nauren", "entidade");
  if (!naurenEntidadeInterativa(estado)) return;
  const ator = canvas?.tokens?.controlled?.find(t => t !== token)?.actor ?? game.user.character;
  if (!ator) return;
  const custo = [estado.custo ? `−${estado.custo} Estamina` : "", estado.cura ? `cura ${estado.cura}` : "", estado.condNome ? `recebe ${estado.condNome}` : ""].filter(Boolean).join(" • ");
  const sim = await foundry.applications.api.DialogV2.confirm({
    window: { title: estado.nome },
    content: `<p><b>${ator.name}</b> interage com <b>${estado.nome}</b>?</p><p>${custo}${estado.cargasMax ? ` — cargas ${estado.cargas}/${estado.cargasMax}` : ""}</p><p class="nauren-popup-nota">Recusar só mantém o target (para atacar, por exemplo).</p>`,
    yes: { label: "Interagir" }, no: { label: "Só marcar como alvo" }, rejectClose: false
  }).catch(() => false);
  if (!sim) return;
  await naurenOperarEntidade("interagir", { actorUuid: token.actor.uuid, atorUuid: ator.uuid });
  token.setTarget(false, { releaseOthers: false });
});

// Rede de segurança: nenhum caminho cria Condição/Efeito numa entidade de campo (áreas, auras, arrastar).
Hooks.on("preCreateItem", (item, dados, opcoes) => {
  if (!["condicao", "efeito"].includes(item.type)) return;
  if (item.parent?.documentName === "Actor" && item.parent.getFlag("nauren", "entidade")) return false;
});

// Usos que crescem com o nível ("usosMaxPorNivel"): a habilidade entra na
// ficha já cheia para o nível atual (antes ela vinha com o valor do nível 1
// até o fim da primeira cena - ex.: Análise Paciente nível 12 com 3/5), e
// subir de nível soma a diferença ao que ainda sobra (descer corta no novo
// máximo). Cópias do Falsificar usam a tabela congelada, então ficam no nível
// de origem sozinhas.
function naurenUsosMaxDaAcaoNoNivel(acao, nivel) {
  const nv = naurenResolverPorNivel(acao?.usosMaxPorNivel, nivel, "valor");
  return nv !== null ? nv : null;
}
Hooks.on("preCreateItem", (item, dados) => {
  const ator = item.parent;
  if (ator?.documentName !== "Actor") return;
  const nivel = ator.system?.nivel || 1;
  const acoes = foundry.utils.deepClone(dados.system?.acoes ?? item.system?.acoes ?? []);
  let mudou = false;
  for (const a of acoes) {
    if (!a?.usaUsos) continue;
    const max = naurenUsosMaxDaAcaoNoNivel(a, nivel);
    if (max !== null && (a.usosAtual ?? 0) !== max && (a.usosAtual ?? 0) === (a.usosMax ?? a.usosAtual ?? 0)) { a.usosAtual = max; mudou = true; }
  }
  const upd = {};
  if (mudou) upd["system.acoes"] = acoes;
  const sys = dados.system ?? {};
  if (sys.usaUsos && sys.usosMaxPorNivel?.length) {
    const max = naurenResolverPorNivel(sys.usosMaxPorNivel, nivel, "valor");
    if (max !== null && (sys.usosAtual ?? 0) === (sys.usosMax ?? sys.usosAtual ?? 0)) upd["system.usosAtual"] = max;
  }
  if (Object.keys(upd).length) item.updateSource(upd);
});
Hooks.on("preUpdateActor", (actor, mudancas, opcoes) => {
  if (foundry.utils.getProperty(mudancas, "system.nivel") === undefined) return;
  opcoes.naurenNivelAnterior = actor.system?.nivel || 1;
});
Hooks.on("updateActor", async (actor, mudancas, opcoes, userId) => {
  if (userId !== game.user.id) return;
  const antes = opcoes?.naurenNivelAnterior;
  const depois = actor.system?.nivel || 1;
  if (antes === undefined || antes === depois) return;
  for (const item of actor.items) {
    const upd = {};
    const acoes = item.system?.acoes;
    if (acoes?.length && !item.getFlag?.("nauren", "nivelFixo")) {
      const clon = foundry.utils.deepClone(acoes);
      let mudou = false;
      for (const a of clon) {
        if (!a?.usaUsos) continue;
        const ma = naurenUsosMaxDaAcaoNoNivel(a, antes), md = naurenUsosMaxDaAcaoNoNivel(a, depois);
        if (ma === null || md === null || ma === md) continue;
        const novo = Math.max(0, Math.min(md, (a.usosAtual ?? 0) + (md - ma)));
        if (novo !== a.usosAtual) { a.usosAtual = novo; mudou = true; }
      }
      if (mudou) upd["system.acoes"] = clon;
    }
    const sys = item.system;
    if (sys?.usaUsos && sys.usosMaxPorNivel?.length) {
      const ma = naurenResolverPorNivel(sys.usosMaxPorNivel, antes, "valor"), md = naurenResolverPorNivel(sys.usosMaxPorNivel, depois, "valor");
      if (ma !== null && md !== null && ma !== md) upd["system.usosAtual"] = Math.max(0, Math.min(md, (sys.usosAtual ?? 0) + (md - ma)));
    }
    if (Object.keys(upd).length) await item.update(upd);
  }
});

// Entidade sem Vida (ex.: Orbe) não sofre dano; com Vida, zerar destrói.
Hooks.on("preUpdateActor", (actor, mudancas) => {
  const estado = actor.getFlag("nauren", "entidade");
  if (!estado?.invulneravel) return;
  const nova = foundry.utils.getProperty(mudancas, "system.vida.value");
  if (nova !== undefined && nova < (actor.system.vida?.value ?? 0)) foundry.utils.setProperty(mudancas, "system.vida.value", actor.system.vida.value);
});
Hooks.on("updateActor", async (actor, mudancas) => {
  if (game.users.activeGM !== game.user) return;
  const estado = actor.getFlag("nauren", "entidade");
  if (!estado?.ativa || estado.invulneravel) return;
  const nova = foundry.utils.getProperty(mudancas, "system.vida.value");
  if (nova === undefined) return;
  if (nova <= 0) await naurenLimparEntidade(actor, "destruída");
});
// Mover o token de uma estrutura leva as paredes junto.
Hooks.on("updateToken", async (tokenDoc, mudancas) => {
  if (game.users.activeGM !== game.user) return;
  if (mudancas.x === undefined && mudancas.y === undefined && mudancas.width === undefined && mudancas.height === undefined) return;
  const actor = game.actors.get(tokenDoc.actorId);
  const estado = actor?.getFlag("nauren", "entidade");
  if (!estado?.ativa || !estado.bloqueia || !estado.paredesIds?.length) return;
  const cena = tokenDoc.parent;
  const casa = cena.grid.size;
  const x = mudancas.x ?? tokenDoc.x, y = mudancas.y ?? tokenDoc.y;
  const w = (mudancas.width ?? tokenDoc.width) * casa, h = (mudancas.height ?? tokenDoc.height) * casa;
  const segmentos = naurenRetanguloParedes(x, y, w, h);
  const atualizar = estado.paredesIds.map((id, i) => cena.walls.get(id) ? { _id: id, c: segmentos[i % 4] } : null).filter(Boolean);
  if (atualizar.length) await cena.updateEmbeddedDocuments("Wall", atualizar).catch(err => console.warn("Nauren RPG | Falha ao mover as paredes da entidade.", err));
  await naurenAjustarDirecaoParedesEntidade(cena, estado.paredesIds, x, y, w, h);
});

// Apagar o token da entidade encerra tudo (paredes, área e ficha).
Hooks.on("deleteToken", async tokenDoc => {
  if (game.users.activeGM !== game.user) return;
  const actor = game.actors.get(tokenDoc.actorId);
  const estado = actor?.getFlag("nauren", "entidade");
  if (estado?.ativa && !estado.limpa) await naurenLimparEntidade(actor, "token removido do mapa");
});

/** Tempo de reação configurado (segundos; 0 = sem limite). */
function naurenTempoReacao() {
  return Math.max(0, Number(game.settings.get("nauren", "tempoReacaoSegundos")) || 0);
}
/** Timeout de uma query que espera uma reação de outro jogador (ms). */
function naurenTimeoutReacaoMs() {
  const t = naurenTempoReacao();
  return t ? (t + 20) * 1000 : 600000;
}

/**
 * Cronômetro num Dialog aberto: mostra a contagem e fecha ao zerar (fechar
 * sem confirmar = sem reação). Devolve uma função que cancela o cronômetro.
 */
function naurenCronometroNoDialog(app, root) {
  const tempo = naurenTempoReacao();
  if (!tempo || !app) return () => {};
  const alvo = root?.querySelector?.(".window-content") ?? root;
  if (!alvo || alvo.querySelector(".nauren-cronometro")) return () => {};
  let resta = tempo;
  const el = document.createElement("div");
  el.className = "nauren-cronometro";
  el.innerHTML = `<i class="fas fa-hourglass-half"></i> Responda em <b>${resta}</b>s — sem resposta: sem reação`;
  alvo.prepend(el);
  const intervalo = setInterval(() => {
    resta -= 1;
    const b = el.querySelector("b");
    if (b) b.textContent = String(Math.max(0, resta));
    if (resta <= 0) { clearInterval(intervalo); try { app.close(); } catch (err) { /* já fechado */ } }
  }, 1000);
  return () => clearInterval(intervalo);
}

/** Nome a mostrar para um token: o da ficha quando o token é vinculado. */
function naurenNomeDeToken(tokenOuDoc) {
  const doc = tokenOuDoc?.document ?? tokenOuDoc;
  if (!doc) return "";
  return doc.actorLink && doc.actor ? doc.actor.name : (doc.name || doc.actor?.name || "");
}

/** O limite de 2 por aliado por turno vale agora para "origem" -> "destino"? */
function naurenLimitePrioridadeAtingido(origemUuid, destinoDoc, dispOrigem, indicador = "") {
  if (indicador === "PI") return false; // Prioridade gerada por ataque/efeito contra alguém não tem limite
  if (!origemUuid || !destinoDoc?.actor || game.settings.get("nauren", "limitePrioridadePorAliado") !== "aplicar") return false;
  if ((game.combat?.combatants?.size ?? 0) <= 3) return false;
  if (destinoDoc.disposition !== dispOrigem) return false; // o limite do livro é entre aliados
  return naurenPrioridadesNoTurno(origemUuid, destinoDoc.actor.uuid) >= 2;
}

function naurenMontarSelecaoPrioridade(tokenRef, lado, limite, aberta, preMarcados = [], origemUuid = "", indicador = "") {
  const disp = tokenRef?.document?.disposition;
  const porUuid = new Map();
  for (const t of naurenPersonagensEmCena(tokenRef, lado)) porUuid.set(t.document.uuid, t.document);
  // Pré-marcados (alvos afetados, quem está no raio) entram mesmo que fora do filtro de lado.
  for (const doc of preMarcados) if (doc?.uuid && doc.actor && !doc.actor.getFlag?.("nauren", "entidade")?.ativa) porUuid.set(doc.uuid, doc);
  if (!porUuid.size) return null;
  const marcados = new Set(preMarcados.map(d => d?.uuid));
  const candidatos = [...porUuid.values()]
    .map(doc => {
      const travaP = naurenTravaPrioridade(doc.actor, doc.disposition === disp);
      const bloqueado = naurenLimitePrioridadeAtingido(origemUuid, doc, disp, indicador) || !!travaP;
      return { uuid: doc.uuid, nome: naurenNomeDeToken(doc) + (travaP ? ` (${travaP.name})` : ""), lado: doc.disposition === disp ? "aliado" : "inimigo", marcado: marcados.has(doc.uuid) && !bloqueado, bloqueado };
    })
    .sort((a, b) => (a.marcado !== b.marcado ? (a.marcado ? -1 : 1) : a.lado === b.lado ? a.nome.localeCompare(b.nome) : a.lado === "aliado" ? -1 : 1));
  const temDoisLados = new Set(candidatos.map(c => c.lado)).size > 1;
  const n = candidatos.filter(c => c.marcado).length;
  return {
    candidatos,
    limite,
    aberta,
    abas: temDoisLados && lado === "todos",
    rotuloContador: limite ? `${n}/${limite}` : (n ? `${n} selecionado(s)` : `${candidatos.length} em cena`)
  };
}

/**
 * Personagens em cena do lado pedido em relação ao token de referência
 * ("aliados": mesma disposição; "inimigos": disposição diferente;
 * "todos"), sem ele próprio e sem tokens ocultos.
 */
function naurenPersonagensEmCena(tokenRef, lado = "aliados") {
  if (!tokenRef || !canvas?.ready) return [];
  const disp = tokenRef.document?.disposition ?? tokenRef.disposition;
  return canvas.tokens.placeables.filter(t => {
    if (!t.actor || t === tokenRef || t.document.hidden) return false;
    // Entidade de campo (Orbe de Luz, Jóia, Moradia) não é personagem: não recebe Prioridade nem conta como aliado.
    if (t.actor.getFlag?.("nauren", "entidade")?.ativa) return false;
    if (lado === "todos") return true;
    const mesmo = t.document.disposition === disp;
    return lado === "inimigos" ? !mesmo : mesmo;
  });
}

/**
 * Dispara um evento de Gatilho num ator, no cliente de quem pode processá-lo
 * (dono jogador ativo, senão o Mestre) - necessário quando quem causou o
 * evento não é dono do ator (ex.: conceder Prioridade a um aliado).
 */
const NAUREN_QUERY_DISPARAR_EVENTO = "nauren.dispararEvento";
const NAUREN_QUERY_APLICAR_CONDICAO = "nauren.aplicarCondicaoNoDono";


export { NAUREN_ACALANTO_EFEITOS, NAUREN_CAMPOS_ACIMA_AUTOMATICOS, NAUREN_CAMPOS_ACIMA_GERAIS, NAUREN_CAMPOS_ANALISE_CRIATIVA, NAUREN_CAPACIDADES, NAUREN_CAPACIDADE_POR_NOME, NAUREN_CONDICOES_NEGATIVAS_LIVRO, NAUREN_CORES_PINTURA, NAUREN_CORES_PINTURA_POR_FONTE, NAUREN_PASTA_ENTIDADES, NAUREN_PODEROSA_EFEITOS, NAUREN_PODEROSA_MAX_POR_EFEITO, NAUREN_PREVIA_CONTEXTO, NAUREN_QUERY_ACALANTO, NAUREN_QUERY_ACOVARDAR, NAUREN_QUERY_APLICAR_CONDICAO, NAUREN_QUERY_APLICAR_CONDICAO_ECO, NAUREN_QUERY_AUREUM, NAUREN_QUERY_BESTA_INICIAL, NAUREN_QUERY_CRIAR_ITEM, NAUREN_QUERY_DISPARAR_EVENTO, NAUREN_QUERY_DOMAR, NAUREN_QUERY_ENTIDADE, NAUREN_QUERY_ESCOLHA_DRUIDISMO, NAUREN_QUERY_ESCOLHA_PALAVRA, NAUREN_QUERY_ESTRELA, NAUREN_QUERY_ESTUDO, NAUREN_QUERY_ITEM_MESTRE, NAUREN_QUERY_MANIPULAR, NAUREN_QUERY_MOVER_TOKEN, NAUREN_QUERY_RECURSO, NAUREN_QUERY_RESISTIR_ROUBO, NAUREN_SEEDS_POR_NOME, NAUREN_TERMOS_DA_HORA, NAUREN_TIPO_ALCANCE_NOMES, NAUREN_TIPO_ALCANCE_SEMEADO, naurenAcaoEhCura, naurenAcaoEhGolpe, naurenAcaoSemCustoEstaminaMana, naurenAcovardarRecentes, naurenAjustarDirecaoParedesEntidade, naurenAjustarEfeitoDruidismo, naurenAjusteCriticoDoGrupo, naurenAjusteCustoManaMagia, naurenAliadosAte, naurenAnotarModsRecebidosNoCard, naurenApagandoItens, naurenApagarItensSeExistirem, naurenAplicarAcalanto, naurenAplicarDeltaUsosExtras, naurenAplicarPalavraComEscolha, naurenArmarAcalanto, naurenArmarPoderosa, naurenAtacanteRecente, naurenAtacouNoTurnoAtual, naurenAtaquesNoTurno, naurenAtualizarItemViaMestre, naurenAtualizarTreinoResistencia, naurenAureumValido, naurenAvisarEstrelaDoArcoIris, naurenBeneficiosDoEstado, naurenBonusAcimaContra, naurenBonusDanoPeriodico, naurenBotoesDeFormula, naurenBotoesDirecaoGrimorio, naurenCasaLivreAoLado, naurenCategoriaDaArma, naurenChaveTurnoAtual, naurenCondicaoDoSistemaPorNome, naurenCondicaoNegativa, naurenCondicaoPoderosa, naurenContribuicaoUsosExtras, naurenCriarItemNoAtor, naurenCronometroNoDialog, naurenDadosParedesEntidade, naurenDeslocarToken, naurenDirecaoForaDaParede, naurenEhCondicaoModelo, naurenEhGolpeEspiritual, naurenEhItem, naurenEntidadeInterativa, naurenEntidadesLimpando, naurenEscolherCorDaPintura, naurenEscolherEfeitoPoderosa, naurenEscolherPontoNoMapa, naurenEstresseDosAliados, naurenEstudoNoAlvo, naurenFaceD20, naurenFixarTipoAlcanceSemeado, naurenFotografarModsRecebidos, naurenFundirFormula, naurenGrimorio, naurenGuardarD20Roubado, naurenHandleQueryAcalanto, naurenHandleQueryAcovardar, naurenHandleQueryAplicarCondicaoEco, naurenHandleQueryAureum, naurenHandleQueryBestaInicial, naurenHandleQueryCriarItem, naurenHandleQueryDomar, naurenHandleQueryEntidade, naurenHandleQueryEscolhaDruidismo, naurenHandleQueryEscolhaPalavra, naurenHandleQueryEstrela, naurenHandleQueryEstudo, naurenHandleQueryItemMestre, naurenHandleQueryManipular, naurenHandleQueryMoverToken, naurenHandleQueryRecurso, naurenHandleQueryResistirRoubo, naurenLadinosTudoEMeu, naurenLigarPreviaFormula, naurenLimitePrioridadeAtingido, naurenLimparEntidade, naurenLimparEntidadeInterno, naurenLinhasEntidade, naurenMaisDadosPoderosa, naurenMascoteFoge, naurenModsAcima, naurenMontarSelecaoPrioridade, naurenMostrarNomesDosCamposUuid, naurenMoverGrimorio, naurenMoverTokenPara, naurenMoverTokenViaMestre, naurenMunicoesCompativeis, naurenNivelAntesDruidismo, naurenNomeBate, naurenNomeDeToken, naurenNomeDoRecurso, naurenNomeNormalizado, naurenNomeTokenEntidade, naurenOferecerAcovardar, naurenOferecerDestino, naurenOperarEntidade, naurenOperarEstudo, naurenOperarRecursoViaMestre, naurenOrdemListaMagias, naurenPersonagensEmCena, naurenPisoGuiarDestino, naurenPreparacaoUsadas, naurenPresosPorArmadilha, naurenPrioridadesGeradas, naurenRecalcularBonusDeAliados, naurenRegistrarAtaqueNoTurno, naurenReordenarGrimorio, naurenResolverSelf, naurenResolverSelfEmObjeto, naurenResumoDaAcao, naurenRetanguloParedes, naurenSincronizarCriativasDoLadino, naurenSincronizarGrimorio, naurenSomarEfeitoPermanente, naurenSouMestreAtivo, naurenTemEstado, naurenTempoReacao, naurenTextoHistoricoDestino, naurenTextoPreviaFormula, naurenTimeoutReacaoMs, naurenTipoAlcanceAdivinhado, naurenTipoAlcanceDaAcao, naurenTiposEstudoDoAtor, naurenTokenParecido, naurenTokensConhecidos, naurenTokensConhecidosCache, naurenTokensDeslocando, naurenUltimoAtacante, naurenUsarAcalanto, naurenUsosExtrasPara, naurenUsosMaxDaAcaoNoNivel, naurenUuidPorSeed, naurenValidarFormula, naurenValorEstudo, naurenVidaZerouEmCurso };
