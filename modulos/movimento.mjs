/* Nauren RPG — Movimento em combate. Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { NAUREN_QUERY_ITEM_MESTRE, naurenEhCondicaoModelo, naurenEhItem, naurenMontarSelecaoPrioridade, naurenNomeDeToken, naurenTemEstado } from "./entidades-campo.mjs";
import { naurenInterpretarModificador, naurenMedirDistanciaBordas, naurenPostarCard } from "../nauren.mjs";
import { naurenMovimentoSemPrioridade } from "./monstros-regras.mjs";
import { naurenAndarParaRegiao, naurenTokensDoAndar } from "./andares.mjs";
import { NAUREN_KIT_JANELA } from "./janelas-kit.mjs";
import { naurenConsumirUsoDaHabilidade, naurenUsoDisponivel } from "./prioridades.mjs";
import { naurenPontoDentroDaRegiao, naurenProcessarGatilhos } from "./icone-condicao-token.mjs";
import { NaurenAlvoHelper } from "./ficha-ator.mjs";



/* ===================== MOVIMENTO EM COMBATE =====================
 * Modos (ficha ou padrão do mundo): popup | automatico | manual.
 * Saldo de movimento: vale dentro de um turno (de qualquer combatente) e
 * zera quando o personagem recebe uma nova Prioridade.
 * ================================================================ */
const naurenMovimentoSaldo = new Map();
   // actorId -> metros ainda pagos
function naurenModoMovimento(actor) {
  const m = actor?.system?.modoMovimento;
  if (m) return m;
  if (actor?.system?.gastarEstaminaMovimento === false) return "manual";
  try { return game.settings.get("nauren", "modoMovimentoPadrao") || "popup"; } catch (err) { return "popup"; }
}

function naurenNomeRecursoMov(actor, r) {
  if (String(r).startsWith("recursoCustom:")) { const id = r.slice(14); return (actor.system.recursosCustom ?? []).find(x => x.id === id)?.nome ?? id; }
  return { vida: "Vida", mana: "Mana", estamina: "Estamina", estaminaCombate: "Estamina", destino: "Dado de Destino", dadosDestino: "Dado de Destino", estresse: "Estresse" }[r] ?? r;
}

async function naurenGastarRecursoSimples(actor, recurso, qtd) {
  if (recurso === "estresse") return actor.update({ "system.stress.value": (actor.system.stress?.value ?? 0) + qtd });
  if (String(recurso).startsWith("recursoCustom:")) {
    const id = recurso.slice(14); const lista = foundry.utils.deepClone(actor.system.recursosCustom ?? []);
    const r = lista.find(x => x.id === id); if (!r) return; r.valor = Math.max(0, (r.valor ?? 0) - qtd);
    return actor.update({ "system.recursosCustom": lista });
  }
  const campo = { vida: "vida", estamina: "estaminaCombate", estaminaCombate: "estaminaCombate", mana: "mana", destino: "dadosDestino", dadosDestino: "dadosDestino" }[recurso];
  if (campo) return actor.update({ [`system.${campo}.value`]: Math.max(0, (actor.system[campo]?.value ?? 0) - qtd) });
}


/** Movimento terminado (qualquer modo, em combate): Prioridade ao chegar perto de inimigo e linha do Traço da Aquarela. */
/**
 * Traço da Aquarela: uma Região com um quadrado do grid para cada casa por
 * onde o CENTRO do token passou (saída e chegada incluídas), seguindo os
 * pontos do caminho quando o Foundry os informa. Visível para todos.
 */
async function naurenDesenharTracoAquarela(tokenDoc, origem, destino, caminho = null) {
  const actor = tokenDoc.actor; if (!actor || !canvas?.scene || !canvas.grid) return;
  const g = canvas.grid.size;
  const centro = p => ({ x: p.x + tokenDoc.width * g / 2, y: p.y + tokenDoc.height * g / 2 });
  const pontos = [origem, ...((caminho ?? []).filter(p => Number.isFinite(p?.x) && Number.isFinite(p?.y))), destino].map(centro);
  const celulas = new Map();
  const somar = off => { if (off && Number.isFinite(off.i) && Number.isFinite(off.j)) celulas.set(`${off.i}_${off.j}`, off); };
  for (let k = 0; k < pontos.length - 1; k++) {
    const a = pontos[k], b = pontos[k + 1];
    let caminhoGrid = null;
    try { caminhoGrid = canvas.grid.getDirectPath([a, b]); } catch (err) { caminhoGrid = null; }
    if (caminhoGrid?.length) caminhoGrid.forEach(somar);
    else {
      // Sem a API: amostra a reta a cada 1/4 de quadrado.
      const passos = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / (g / 4)));
      for (let t = 0; t <= passos; t++) somar(canvas.grid.getOffset({ x: a.x + (b.x - a.x) * t / passos, y: a.y + (b.y - a.y) * t / passos }));
    }
  }
  if (celulas.size < 2) return; // não saiu do lugar
  const shapes = [...celulas.values()].map(off => {
    const tl = canvas.grid.getTopLeftPoint(off);
    return { type: "rectangle", x: Math.round(tl.x), y: Math.round(tl.y), width: g, height: g };
  });
  const dados = {
    name: `Traço da Aquarela (${actor.name})`, color: "#6fbf73",
    visibility: CONST.REGION_VISIBILITY?.ALWAYS ?? 2,
    highlightMode: "coverage",
    shapes,
    flags: { nauren: { tracoAquarela: { criadorUuid: actor.uuid, disposicao: tokenDoc.disposition } } }
  };
  naurenAndarParaRegiao(dados, tokenDoc); // andares (V14): no andar de quem andou
  const criar = async d => {
    if (game.user.isGM) return canvas.scene.createEmbeddedDocuments("Region", [d]);
    const gm = game.users.activeGM;
    if (!gm) { ui.notifications.warn("Traço da Aquarela: o Mestre precisa estar conectado para desenhar a linha."); return null; }
    const r = await gm.query(NAUREN_QUERY_ITEM_MESTRE, { tipo: "criarRegiao", itemUuid: canvas.scene.uuid, dados: d }, { timeout: 15000 });
    if (!r && d.highlightMode) throw new Error("região recusada");
    return r;
  };
  try { await criar(dados); }
  catch (err) {
    // Build que não aceita "highlightMode" no documento: tenta sem ele.
    const { highlightMode, ...semModo } = dados;
    await criar(semModo).catch(e => console.warn("Nauren RPG | Traço da Aquarela", e));
  }
}


async function naurenDepoisDoMovimento(tokenDoc, origem, destino, caminho = null) {
  const actor = tokenDoc.actor; if (!actor || !canvas?.scene) return;
  const dMetros = canvas.scene.grid.distance || 1;
  // Traço da Aquarela: pinta os QUADRADOS do grid por onde o token passou
  // (dura a cena). Região visível para todos, alinhada ao grid.
  const traco = actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Traço da Aquarela") && i.system.ativo !== false);
  if (traco) await naurenDesenharTracoAquarela(tokenDoc, origem, destino, caminho).catch(err => console.warn("Nauren RPG | Traço da Aquarela", err));
  // Prioridade ao chegar perto de um inimigo (regra do livro); o Passo Gatuno dispensa.
  let ligado = true; try { ligado = game.settings.get("nauren", "prioridadeAoAproximar"); } catch (err) { /* padrão */ }
  if (!ligado) return;
  const naPosicao = pos => ({ document: { x: pos.x, y: pos.y, width: tokenDoc.width, height: tokenDoc.height } });
  const novos = naurenTokensDoAndar(tokenDoc).filter(t => t.document !== tokenDoc && t.actor && t.document.disposition !== tokenDoc.disposition && t.document.disposition !== 0
    && (t.actor.system?.vida?.value ?? 1) > 0).filter(t => {
      const lado = dMetros + 0.01; // adjacente = 1 quadrado de borda a borda
      return naurenMedirDistanciaBordas(naPosicao(destino), t) <= lado && naurenMedirDistanciaBordas(naPosicao(origem), t) > lado;
    });
  if (!novos.length) return;
  const gatuno = actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Passo Gatuno") && i.system.ativo !== false);
  if (gatuno) {
    await naurenPostarCard({ ator: actor, titulo: "Aproximação", icone: gatuno.img, fonte: "Movimento", linhas: [{ label: "Chegou perto de", value: novos.map(t => naurenNomeDeToken(t)).join(", "), breakdown: "Passo Gatuno: não gera Prioridade" }] });
    return;
  }
  // Fase 4 (M02): Habilidade/Condição/Efeito com "metros por turno sem gerar Prioridade" (Espreitador,
  // Recuo Ágil, Golpe e Fuga...). Se o trajeto cabe no que ainda resta neste turno, não há Prioridade.
  const semPrio = naurenMovimentoSemPrioridade(actor, origem, destino);
  if (semPrio) {
    await naurenPostarCard({ ator: actor, titulo: "Aproximação", icone: semPrio.item.img, fonte: "Movimento",
      linhas: [{ label: "Chegou perto de", value: novos.map(t => naurenNomeDeToken(t)).join(", "), breakdown: `${semPrio.item.name}: não gera Prioridade (${semPrio.texto})` }] });
    return;
  }
  // Manual: o card já vem com o(s) inimigo(s) marcado(s); o jogador confirma, desmarca ou escolhe outro.
  await naurenCardMovimento(actor, tokenDoc, [{ label: "Chegou perto de", value: novos.map(t => naurenNomeDeToken(t)).join(", "), breakdown: "escolha abaixo quem recebe a Prioridade" }], novos.map(t => t.document));
}


/** O destino fica mais perto de algum inimigo do que a origem? (Impulso) */
function naurenMovimentoEmDirecaoAInimigo(tokenDoc, origem, destino) {
  const disp = tokenDoc.disposition;
  const inimigos = naurenTokensDoAndar(tokenDoc).filter(t => t.document !== tokenDoc && t.actor && t.document.disposition !== disp && t.document.disposition !== 0);
  const d = (a, b) => canvas.grid.measurePath([a, b])?.distance ?? Infinity;
  return inimigos.some(t => d(destino, t.document) < d(origem, t.document));
}

async function naurenCardMovimento(actor, tokenDoc, linhas, preMarcados = []) {
  const tok = tokenDoc.object;
  const selecao = tok ? naurenMontarSelecaoPrioridade(tok, "todos", 0, preMarcados.length > 0, preMarcados, actor.uuid, "") : null;
  if (selecao) selecao.rotuloContador = "aliado ou inimigo";
  const prioridade = selecao ? { indicador: "", sigla: "", rotulo: "", texto: "Conceder Prioridade", contexto: { origemAtorUuid: actor.uuid, itemNome: "Movimento", motivo: "movimento", indicador: "" }, selecao } : null;
  return naurenPostarCard({ ator: actor, titulo: "Movimento", icone: tokenDoc.texture?.src || actor.img, fonte: "Movimento em combate", linhas, prioridade });
}

/**
 * Por que o Movimento deste personagem está em 0: Condições, Efeitos e Habilidades ativos que
 * mexem em "movimento" (ex.: Preso "=0", Paralisado "-99"), Caído (metade) e o Movimento base.
 */
function naurenMotivosSemMovimento(actor, caido) {
  const motivos = [];
  for (const i of actor.items) {
    if (!["condicao", "efeito", "habilidade", "magia"].includes(i.type) || i.system.ativo === false || naurenEhCondicaoModelo?.(i)) continue;
    const mods = (i.system.modificadores ?? []).filter(m => m.campo === "movimento" && String(m.valor ?? "").trim());
    for (const m of mods) {
      const v = String(m.valor).trim();
      const texto = v.startsWith("=") ? `trava o Movimento em ${v.slice(1)}` : (Number(v) < 0 || v.startsWith("-")) ? `${v}m de Movimento` : null;
      if (texto) motivos.push({ nome: i.name, texto });
    }
  }
  if (caido) motivos.push({ nome: caido.name, texto: "cada movimento vale metade" });
  if (!motivos.length) motivos.push({ nome: "Movimento", texto: `${actor.system.movimentoTotal ?? 0}m no total` });
  return motivos;
}


/**
 * 0.109.8: pelo livro, o Movimento é uma ação ("ação de movimento", custo 1 Estamina). Cada ação de movimento PAGA
 * dispara "usei uma Ação" só para as Condições do personagem (ex.: Alvejado: 1 de dano por acúmulo).
 * Não vale para movimento sem gastar ("Mover mesmo assim", grátis) nem para movimento forçado (empurrar, arrastar).
 */
async function naurenMovimentoComoAcao(actor, movimentos = 1) {
  const n = Math.max(0, Math.min(10, Math.floor(Number(movimentos) || 0)));
  if (!actor || !n) return;
  const temGatilho = actor.items.some(i => i.type === "condicao" && i.system.ativo !== false && !naurenEhCondicaoModelo(i) && i.system.usaGatilhos && (i.system.gatilhos ?? []).some(g => g.evento === "euUseiAcao"));
  if (!temGatilho) return;
  for (let k = 0; k < n; k++) {
    await naurenProcessarGatilhos("euUseiAcao", actor, { acaoNome: "Movimento", tipoItemUsado: "movimento", ehAtaque: false, ehCura: false, acaoDeMovimento: true, _soCondicoes: true })
      .catch(err => console.warn("Nauren RPG | Condições na ação de movimento", err));
  }
}

/** Movimento 0: explica o motivo e pergunta se quer mover mesmo assim (fica registrado no card). */
async function naurenMoverSemMovimento(tokenDoc, origem, destino, distancia, caido) {
  const actor = tokenDoc.actor; if (!actor) return;
  const motivos = naurenMotivosSemMovimento(actor, caido);
  const esc = v => foundry.utils.escapeHTML(String(v ?? ""));
  const conteudo = `<div class="nauren-mov">
    <p class="nauren-mov-aviso nauren-mov-aviso-forte"><i class="fas fa-ban"></i> <b>${esc(naurenNomeDeToken(tokenDoc))}</b> está com Movimento 0 e não pode se mover.</p>
    <ul class="nauren-mov-motivos">${motivos.map(m => `<li><b>${esc(m.nome)}</b>: ${esc(m.texto)}</li>`).join("")}</ul>
    <p class="nauren-mov-pergunta">Mover mesmo assim (${Math.round(distancia)}m)? Fica registrado no chat.</p>
  </div>`;
  const mover = await foundry.applications.api.DialogV2.confirm({ ...NAUREN_KIT_JANELA,
    window: { title: `Sem Movimento · ${actor.name}` }, classes: ["nauren-janela-movimento", "nauren-kit"], position: { width: 420 }, content: conteudo,
    yes: { label: "Mover mesmo assim", icon: "fas fa-arrows-up-down-left-right" }, no: { label: "Não mover", default: true }, rejectClose: false
  }).catch(() => false);
  if (!mover) return;
  await naurenCardMovimento(actor, tokenDoc, [
    { label: "Movido sem Movimento", value: `${Math.round(distancia)}m`, breakdown: "decisão do jogador/Mestre" },
    ...motivos.map(m => ({ label: "Motivo", value: m.nome, breakdown: m.texto }))
  ]);
  await tokenDoc.update({ x: destino.x, y: destino.y }, { naurenMovimentoLiberado: true });
}


async function naurenJanelaMovimento(tokenDoc, origem, destino, distancia) {
  const actor = tokenDoc.actor; if (!actor) return;
  const caido = actor.items.find(i => i.type === "condicao" && i.system.ativo !== false && naurenEhItem(i, "Caído"));
  const mov = Math.max(0, caido ? Math.floor((actor.system.movimentoTotal ?? 0) / 2) : (actor.system.movimentoTotal ?? 0));
  const condExtra = actor.items.filter(i => i.type === "condicao" && i.system.ativo !== false && !naurenEhCondicaoModelo(i) && (i.system.custoEstaminaExtraAcoes || 0) > 0);
  const extraPorMov = condExtra.reduce((t, i) => Math.max(t, i.system.custoEstaminaExtraAcoes || 0), 0) /* estágios do mesmo medo: vale o maior, não a soma */;
  const custoPorMov = 1 + extraPorMov;
  if (mov <= 0) { await naurenMoverSemMovimento(tokenDoc, origem, destino, distancia, caido); return; }
  const saldo = naurenMovimentoSaldo.get(actor.uuid) ?? 0;
  const movimentos = Math.max(1, Math.ceil((distancia - saldo) / mov));
  const est = actor.system.estaminaCombate?.value ?? 0;
  // Fontes de pagamento: { id, icone, titulo, custoBase (por ajuste), tem (o que o personagem tem), unidade, nota }
  const fontes = [{ id: "estamina", icone: "fa-bolt", titulo: "Estamina", custoBase: movimentos * custoPorMov, tem: est, unidade: "Estamina", nota: extraPorMov ? `+${extraPorMov} por movimento (${condExtra.map(i => i.name).join(", ")})` : "" }];
  const espInfo = actor.sheet?._espiritoDeBatalhaInfo?.() ?? null;
  if (espInfo && espInfo.usosRestantes > 0) fontes.push({ id: "espirito", icone: "fa-shield-halved", titulo: "Espírito da Batalha", custoBase: movimentos * custoPorMov, tem: espInfo.valorAtual, unidade: "Espírito", nota: `gasta 1 troca (${espInfo.usosRestantes}/${espInfo.usosMax} nesta rodada)` });
  const impulso = naurenTemEstado(actor, "Profusão") ? actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Impulso") && i.system.ativo !== false && naurenUsoDisponivel(i)) : null;
  if (impulso && naurenMovimentoEmDirecaoAInimigo(tokenDoc, origem, destino)) fontes.push({ id: "impulso", icone: "fa-fire", titulo: "Impulso", custoBase: movimentos, tem: null, unidade: movimentos > 1 ? "usos" : "uso", fixo: true, nota: "em Profusão, em direção a um inimigo" });
  const meuTok = tokenDoc.object;
  const regioes = meuTok ? (canvas.scene?.regions ?? []).filter(r => { const c = r.getFlag("nauren", "templatePersistente"); return (c?.cargasEstamina ?? 0) > 0 && c.disposicaoOrigem === tokenDoc.disposition && naurenPontoDentroDaRegiao(meuTok.center, r, tokenDoc); }) : [];
  for (const r of regioes) fontes.push({ id: `regiao:${r.id}`, icone: "fa-palette", titulo: r.name, custoBase: movimentos * custoPorMov, tem: r.getFlag("nauren", "templatePersistente").cargasEstamina, unidade: "carga(s)" });
  const fontesExtra = [];
  for (const it of actor.items) {
    if (!["habilidade", "condicao", "efeito"].includes(it.type) || it.system.ativo === false || naurenEhCondicaoModelo(it)) continue;
    (it.system.pagarMovimentoCom ?? []).forEach((f, k) => {
      const q = Math.max(0, Number(naurenInterpretarModificador(String(f.quantidade || "1"), actor)?.valor ?? f.quantidade) || 1);
      const id = `${it.id}:${k}`;
      fontesExtra.push({ id, item: it, recurso: f.recurso, porMovimento: q });
      const temR = String(f.recurso).startsWith("recursoCustom:") ? ((actor.system.recursosCustom ?? []).find(x => x.id === f.recurso.slice(14))?.valor ?? 0)
        : (actor.system[{ vida: "vida", mana: "mana", estamina: "estaminaCombate", destino: "dadosDestino" }[f.recurso]]?.value ?? null);
      fontes.push({ id: `extra:${id}`, icone: "fa-star", titulo: it.name, custoBase: q * movimentos, tem: temR, unidade: naurenNomeRecursoMov(actor, f.recurso) });
    });
  }
  fontes.push({ id: "gratis", icone: "fa-feather", titulo: "Mover sem gastar", custoBase: 0, tem: null, unidade: "", fixo: true, nota: "fica registrado no card" });
  const esc = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const conteudo = `<div class="nauren-mov">
    <div class="nauren-mov-resumo">
      <div><span>Trajeto</span><b>${Math.round(distancia)}m</b></div>
      <div><span>Saldo</span><b>${Math.round(saldo)}m</b></div>
      <div><span>Precisa</span><b>${movimentos} × ${mov}m</b></div>
    </div>${caido ? `<p class="nauren-mov-aviso"><i class="fas fa-person-falling"></i> Caído: cada movimento vale metade (${mov}m).</p>` : ""}${extraPorMov ? `<p class="nauren-mov-aviso"><i class="fas fa-ghost"></i> ${esc(condExtra.filter(i => (i.system.custoEstaminaExtraAcoes || 0) === extraPorMov).map(i => i.name).join(", "))}: cada movimento custa <b>${custoPorMov}</b> (1 + ${extraPorMov}).</p>` : ""}
    <div class="nauren-mov-opcoes">${fontes.map(f => `<button type="button" class="nauren-mov-opcao" data-escolha="${esc(f.id)}" data-base="${f.custoBase}" data-tem="${f.tem ?? ""}" data-fixo="${f.fixo ? 1 : 0}" data-unidade="${esc(f.unidade)}">
        <i class="fas ${f.icone}"></i><span class="nauren-mov-titulo">${esc(f.titulo)}</span><span class="nauren-mov-custo"></span>${f.nota ? `<span class="nauren-mov-nota">${esc(f.nota)}</span>` : ""}</button>`).join("")}</div>
    <div class="nauren-mov-ajuste"><span>Ajuste do custo</span><button type="button" data-delta="-1">−</button><b class="nauren-mov-ajuste-valor">0</b><button type="button" data-delta="1">+</button></div>
  </div>`;
  let ajuste = 0, escolha = null;
  const atualizar = raiz => {
    raiz.querySelector(".nauren-mov-ajuste-valor").textContent = (ajuste > 0 ? "+" : "") + ajuste;
    raiz.querySelectorAll(".nauren-mov-opcao").forEach(b => {
      const fixo = b.dataset.fixo === "1", base = Number(b.dataset.base), tem = b.dataset.tem === "" ? null : Number(b.dataset.tem);
      const custo = fixo ? base : Math.max(0, base + ajuste);
      const falta = tem !== null && custo > tem;
      b.disabled = falta;
      b.querySelector(".nauren-mov-custo").innerHTML = b.dataset.escolha === "gratis" ? "" : `custa <b>${custo}</b> ${b.dataset.unidade}${tem !== null ? ` · você tem ${tem}` : ""}${falta ? ' <em>insuficiente</em>' : ""}`;
    });
  };
  await foundry.applications.api.DialogV2.wait({ ...NAUREN_KIT_JANELA,
    window: { title: `Movimento · ${actor.name}` }, classes: ["nauren-janela-movimento", "nauren-kit"], position: { width: 420 }, content: conteudo,
    buttons: [{ action: "cancelar", label: "Cancelar" }], rejectClose: false,
    render: (ev, dialog) => {
      const raiz = dialog?.element ?? document;
      atualizar(raiz);
      raiz.querySelectorAll(".nauren-mov-ajuste button").forEach(b => b.addEventListener("click", () => { ajuste += Number(b.dataset.delta); atualizar(raiz); }));
      raiz.querySelectorAll(".nauren-mov-opcao").forEach(b => b.addEventListener("click", () => { if (b.disabled) return; escolha = b.dataset.escolha; dialog.close(); }));
    }
  }).catch(() => null);
  if (!escolha || escolha === "cancelar") return;
  const linhas = [];
  if (escolha === "espirito") {
    const custo = Math.max(0, movimentos * custoPorMov + ajuste);
    const lista = foundry.utils.deepClone(actor.system.recursosCustom ?? []);
    const ent = lista.find(r => r.id === "espiritodabatalha");
    if (!ent || (ent.valor ?? 0) < custo) { ui.notifications.warn(`${actor.name}: Espírito da Batalha insuficiente.`); return; }
    const antes = ent.valor ?? 0; ent.valor = Math.max(0, antes - custo);
    const acoesE = foundry.utils.deepClone(espInfo.item.system.acoes); acoesE[espInfo.acaoIndex].usosAtual = Math.max(0, (acoesE[espInfo.acaoIndex].usosAtual ?? 0) - 1);
    await actor.update({ "system.recursosCustom": lista });
    await espInfo.item.update({ "system.acoes": acoesE });
    linhas.push({ label: "Pagou", value: `${custo} Espírito da Batalha`, breakdown: "1 troca da rodada" });
    if (antes > 0 && ent.valor === 0) {
      await actor.update({ "system.stress.value": Math.min(actor.system.stress?.max ?? 2, (actor.system.stress?.value ?? 0) + 1) });
      linhas.push({ label: "Espírito zerado", value: "+1 Estresse" });
    }
  } else if (escolha === "estamina") {
    const custo = Math.max(0, movimentos * custoPorMov + ajuste);
    if (est < custo) { ui.notifications.warn(`${actor.name}: Estamina insuficiente (precisa de ${custo}, tem ${est}).`); return; }
    if (custo) await actor.update({ "system.estaminaCombate.value": est - custo });
    linhas.push({ label: "Pagou", value: `${custo} Estamina`, breakdown: ajuste ? `${movimentos} movimento(s) ${ajuste > 0 ? "+" : ""}${ajuste} de ajuste` : "" });
  } else if (escolha === "impulso") {
    for (let k = 0; k < movimentos; k++) await naurenConsumirUsoDaHabilidade(impulso);
    linhas.push({ label: "Pagou", value: `Impulso (${movimentos} uso${movimentos > 1 ? "s" : ""})`, breakdown: "em Profusão, em direção a um inimigo: sem Estamina" });
  } else if (escolha.startsWith("regiao:")) {
    const reg = canvas.scene.regions.get(escolha.slice(7)); const cfgR = reg.getFlag("nauren", "templatePersistente");
    const custo = Math.max(0, movimentos * custoPorMov + ajuste);
    if (cfgR.cargasEstamina < custo) { ui.notifications.warn(`${reg.name}: cargas insuficientes (${cfgR.cargasEstamina}).`); return; }
    const restam = cfgR.cargasEstamina - custo; const gm = game.users.activeGM;
    if (reg.isOwner) { if (restam <= 0) await reg.delete(); else await reg.setFlag("nauren", "templatePersistente", { ...cfgR, cargasEstamina: restam }); }
    else if (gm) await gm.query(NAUREN_QUERY_ITEM_MESTRE, { tipo: "regiaoCargas", itemUuid: reg.uuid, dados: { cargas: restam } }, { timeout: 15000 }).catch(() => null);
    linhas.push({ label: "Pagou", value: `${custo} carga(s) de ${reg.name}`, breakdown: restam > 0 ? `restam ${restam}` : "cargas esgotadas" });
  } else if (escolha.startsWith("extra:")) {
    const f = fontesExtra.find(x => x.id === escolha.slice(6));
    const custo = Math.max(0, f.porMovimento * movimentos + ajuste);
    if (!NaurenAlvoHelper._podePagar(actor, f.recurso, custo)) { ui.notifications.warn(`${actor.name}: ${naurenNomeRecursoMov(actor, f.recurso)} insuficiente.`); return; }
    await naurenGastarRecursoSimples(actor, f.recurso, custo);
    linhas.push({ label: "Pagou", value: `${custo} ${naurenNomeRecursoMov(actor, f.recurso)}`, breakdown: `por ${f.item.name}` });
  } else if (escolha === "gratis") {
    linhas.push({ label: "Pagou", value: "nada (moveu sem gastar)" });
  }
  const novoSaldo = saldo + movimentos * mov;
  naurenMovimentoSaldo.set(actor.uuid, novoSaldo);
  const bonusMov = (actor.system.movimentoTotal ?? 0) - (actor.system.movimento ?? 0);
  if (caido) linhas.push({ label: "Caído", value: "metade do movimento" });
  linhas.push({ label: "Movimento", value: `${movimentos} × ${mov}m`, breakdown: bonusMov ? `seu Movimento ${actor.system.movimento}m ${bonusMov > 0 ? "+" : ""}${bonusMov}m de bônus e Condições` : "" });
  linhas.push({ label: "Trajeto", value: `${Math.round(distancia)}m`, breakdown: `sobram ${Math.max(0, Math.round(novoSaldo - distancia))}m neste turno` });
  await naurenCardMovimento(actor, tokenDoc, linhas);
  await tokenDoc.update({ x: destino.x, y: destino.y }, { naurenMovimentoLiberado: true });
  if (escolha !== "gratis") await naurenMovimentoComoAcao(actor, movimentos); // Alvejado etc. (movimento pago)
}


/**
 * Recursos próprios conhecidos ("recursoCustom:id" -> nome): os da ficha do ator, os declarados
 * (recursosDeclarados) por qualquer item do mundo, das fichas e dos compêndios, e os que já estão
 * em uso na Ação (para nunca sumir da lista, mesmo de uma Classe não carregada).
 */
let naurenCacheRecursosDeclarados = null;

async function naurenRecursosCustomConhecidos(actor = null, extras = []) {
  if (!naurenCacheRecursosDeclarados) {
    const mapa = {};
    const add = lista => { for (const r of lista ?? []) if (r?.id) mapa[`recursoCustom:${r.id}`] ??= r.nome || r.id; };
    for (const it of game.items ?? []) add(it.system?.recursosDeclarados);
    for (const a of game.actors ?? []) for (const it of a.items) add(it.system?.recursosDeclarados);
    for (const pack of game.packs ?? []) {
      if (pack.metadata?.type !== "Item") continue;
      try { const idx = await pack.getIndex({ fields: ["system.recursosDeclarados"] }); for (const e of idx) add(e.system?.recursosDeclarados); } catch (err) { /* compêndio sem índice */ }
    }
    naurenCacheRecursosDeclarados = mapa;
  }
  const out = { ...naurenCacheRecursosDeclarados };
  for (const r of actor?.system?.recursosCustom ?? []) if (r?.id) out[`recursoCustom:${r.id}`] = r.nome || r.id;
  for (const chave of extras) if (String(chave ?? "").startsWith("recursoCustom:") && !out[chave]) out[chave] = chave.slice(14);
  return out;
}

/** Código que rodava solto neste trecho do nauren.mjs: chamado no mesmo ponto de antes. */
export function __naurenIniciar_movimento() {

Hooks.on("updateItem", (it, mud) => { if (foundry.utils.hasProperty(mud, "system.recursosDeclarados")) naurenCacheRecursosDeclarados = null; });

Hooks.on("createItem", it => { if ((it.system?.recursosDeclarados ?? []).length) naurenCacheRecursosDeclarados = null; });
}

export { naurenMovimentoComoAcao, naurenCacheRecursosDeclarados, naurenCardMovimento, naurenDepoisDoMovimento, naurenDesenharTracoAquarela, naurenGastarRecursoSimples, naurenJanelaMovimento, naurenModoMovimento, naurenMotivosSemMovimento, naurenMoverSemMovimento, naurenMovimentoEmDirecaoAInimigo, naurenMovimentoSaldo, naurenNomeRecursoMov, naurenRecursosCustomConhecidos };
