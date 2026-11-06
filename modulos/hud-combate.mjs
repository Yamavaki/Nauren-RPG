/* Nauren RPG — HUD de Combate. Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { NAUREN_CATEGORIAS_EQUIPAMENTO, naurenEstiloDoCard, naurenItemTemLuz, naurenItemValeAgora, naurenResolverPorNivel, naurenResolverTokenFormula } from "../nauren.mjs";
import { naurenHudAnimacoesLigadas, naurenHudBarrasDoToken, naurenHudLerRecurso, naurenHudRecursosDoAtor, naurenTrocarHtmlMantendoRolagem } from "./barras-token.mjs";
import { NaurenHudRecursosEditor, naurenHudCombateRecursos } from "./hud-recursos.mjs";
import { naurenRegistroPrioridades } from "./prioridades.mjs";
import { naurenAcaoEhGolpe, naurenAjusteCustoManaMagia, naurenEhCondicaoModelo, naurenEhItem, naurenGrimorio, naurenNomeDoRecurso, naurenOrdemListaMagias, naurenTipoAlcanceDaAcao } from "./entidades-campo.mjs";
import { naurenBandoChave, naurenCombatenteEhDoAtor, naurenEstaminaGratisAgora } from "./bando.mjs";
import { naurenTravaDaAcao } from "./monstros-regras.mjs";
import { naurenMovimentoSaldo } from "./movimento.mjs";
import { naurenEscalaInterface } from "./borda-token.mjs";
import { NaurenActorSheet } from "./ficha-ator.mjs";


/* =======================================
 * HUD DE COMBATE
 * Painel fixo embaixo da tela para usar as Ações do token selecionado sem
 * abrir a ficha. NÃO tem regra própria: cada botão chama o mesmo método da
 * ficha (usar item, ligar efeito, rolar teste, virar página, tirar acúmulo),
 * então custos, popups de reação, Prioridade, gatilhos e animações acontecem
 * exatamente como pela ficha. O HTML é montado aqui (naurenHudHtml), sem
 * template, para poder ser conferido fora do Foundry com o CSS real.
 * ======================================= */
let naurenHud = null;

const naurenHudCombateUltimos = new Map();
 // atorUuid -> últimos valores mostrados no HUD (para animar)
/** Ataques recebidos com o popup de reação aberto, por Ator (preenchido pelo popup de reação). */
const naurenHudAlvos = new Map();

/** Quando este usuário marcou um alvo pela última vez (rodada/turno do combate e horário): separa alvo "de agora" de alvo esquecido. */
let naurenAlvosMarcadosEm = null;

/** Anota que os alvos foram marcados agora (rodada/turno e horário). */
function naurenMarcarAlvosAgora() { naurenAlvosMarcadosEm = { round: game.combat?.round ?? null, turn: game.combat?.turn ?? null, t: Date.now() }; }

function naurenAlvosSaoVelhos() {
  if (!game.user.targets.size || !naurenAlvosMarcadosEm) return game.user.targets.size > 0;
  const c = game.combat, m = naurenAlvosMarcadosEm;
  if (c?.started) return m.round !== c.round || m.turn !== c.turn;
  return Date.now() - m.t > 60000;
}

function naurenLimparMeusAlvos() {
  for (const t of [...game.user.targets]) { try { t.setTarget(false, { releaseOthers: false }); } catch (err) { /* token já saiu da cena */ } }
}

function naurenProximoCombatente(combate) {
  if (!combate?.started) return null;
  if (combate.nextCombatant !== undefined) return combate.nextCombatant;
  const turnos = combate.turns ?? [];
  if (!turnos.length) return null;
  for (let k = 1; k <= turnos.length; k++) { const c = turnos[(combate.turn + k) % turnos.length]; if (c && !c.isDefeated) return c; }
  return null;
}

const NAUREN_HUD_TESTES = [["forca", "Força"], ["agilidade", "Agilidade"], ["estamina", "Estamina"], ["inteligencia", "Inteligência"], ["destino", "Destino"],
  ["poderAtaque", "Pd. Ataque"], ["poderMagia", "Pd. Magia"], ["vitalidade", "Vitalidade"], ["espirito", "Espírito"]];

const NAUREN_HUD_ABAS = [["favoritos", "★"], ["armas", "Armas"], ["magias", "Magias"], ["habilidades", "Habilidades"], ["efeitos", "Efeitos"], ["consumiveis", "Mochila"]];


function naurenHudTextoSimples(html, max = 240) {
  const t = String(html ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

/** Em qual aba o item aparece (e como o botão dele se comporta, inclusive nos Favoritos). */
function naurenHudTipoDoItem(item) {
  if (item.type === "efeito" || (item.type === "habilidade" && item.system.usaEmanacao)) return "efeitos";
  return { arma: "armas", magia: "magias", consumivel: "consumiveis" }[item.type] ?? "habilidades";
}

function naurenHudEsc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}


/** HTML do HUD a partir do contexto (função pura: usada pelo Foundry e pelo teste visual fora dele). */
function naurenHudHtml(c) {
  const e = naurenHudEsc;
  if (c.recolhido) {
    return `<div class="nauren-hud-raiz recolhido nc2${c.monstro ? " nc-monstro" : ""}" style="${c.coresEstilo ?? ""}"><button type="button" class="nauren-hud-expandir" data-action="recolher" aria-label="Mostrar o HUD de Combate">
      <img src="${e(c.retrato)}" alt=""><span>${e(c.nome)}</span><i class="fas fa-chevron-up"></i></button></div>`;
  }
  const flutuanteEsq = c.testesAberto ? `
    <div class="nauren-hud-flutuante nauren-hud-testes">
      <div class="nauren-hud-flutuante-titulo"><span>Testes · 1d20 +</span><button type="button" class="nauren-hud-fechar" data-action="testes" aria-label="Fechar"><i class="fas fa-times"></i></button></div>
      <div class="nauren-hud-testes-grade">${c.testes.map(t => `<button type="button" class="nauren-hud-teste" data-action="rolarTeste" data-attr="${e(t.key)}" data-label="${e(t.label)}"><span>${e(t.label)}</span><b>${e(t.valor)}</b></button>`).join("")}</div>
    </div>` : (c.prioridades.length ? `
    <div class="nauren-hud-flutuante nauren-hud-prioridade">
      <i class="fas fa-bolt"></i>
      <div class="nauren-hud-prioridade-corpo"><span class="nauren-hud-flutuante-titulo">Prioridade</span>
        ${c.prioridades.map(p => `<span class="nauren-hud-prioridade-linha">${e(p)}</span>`).join("")}</div>
    </div>` : "");
  // Barras: começam no valor anterior e o _onRender anima até o novo (com rastro claro na perda).
  const umaBarra = b => `
        <div class="nauren-hud-rotulo"><span>${e(b.nome)}</span><span class="valor">${e(b.texto)}</span></div>
        <div class="nauren-hud-barra ${b.mudou}"><div class="nauren-hud-barra-rastro" style="width:${Math.max(b.antes, b.pct)}%" data-pct="${b.pct}"></div><div class="nauren-hud-barra-fill" style="width:${b.antes}%;background:linear-gradient(90deg,${e(b.cor1)},${e(b.cor2)})" data-pct="${b.pct}"></div>${b.escudoPct ? `<div class="nauren-hud-barra-escudo" style="left:${b.pct}%;width:${b.escudoPct}%"></div>` : ""}</div>`;
  // Compacto mostra 3 barras; o recurso da Classe (Energia, Espírito Ardiloso...) entra sempre, mesmo além delas.
  const noCabecalho = c.recursos.slice(0, 2);
  // Todas as barras que o jogador ligou em "Recursos do HUD" aparecem; o painel cresce para cima (0.92.2).
  const resto = c.recursos.slice(2);
  const barras = noCabecalho.map(umaBarra).join("");
  const barrasResto = resto.length ? `<div class="nauren-hud-bloco nauren-hud-recursos-extra">${resto.map(umaBarra).join("")}</div>` : "";
  const estresse = c.estresse.bolinhas
    ? c.estresse.bolinhas.map(cheio => `<span class="nauren-hud-pip${cheio ? " cheio" : ""}"></span>`).join("")
    : `<b class="nauren-hud-estresse-num">${e(c.estresse.texto)}</b>`;
  const grimorio = c.grimorio ? `
      <span class="nauren-hud-grimorio">
        <button type="button" class="nauren-hud-virar" data-action="virarPagina" data-direcao="-1" ${c.grimorio.podeVoltar ? "" : "disabled"} aria-label="Voltar página"><i class="fas fa-chevron-left"></i></button>
        <span>${e(c.grimorio.texto)}</span>
        <button type="button" class="nauren-hud-virar" data-action="virarPagina" data-direcao="1" ${c.grimorio.podeAvancar ? "" : "disabled"} aria-label="Avançar página"><i class="fas fa-chevron-right"></i></button>
      </span>` : "";
  const botoes = c.botoes.length ? c.botoes.map(b => `
      <button type="button" class="nauren-hud-acao${b.classes}" data-action="${b.acao}" data-item-id="${e(b.id)}" aria-label="${e(b.nome)}" draggable="true">
        ${b.canto ? `<span class="nauren-hud-canto ${b.cantoClasse}">${e(b.canto)}</span>` : ""}
        ${b.alc ? `<span class="nauren-hud-alc${b.alc.auto ? " auto" : ""}" title="${e(b.alc.titulo)}"><i class="fas ${b.alc.icone}"></i></span>` : ""}
        <img src="${e(b.img)}" alt="">
        <span class="nauren-hud-acao-nome">${e(b.nome)}</span>
        ${b.chipCompacto ? `<span class="nauren-hud-chip duplo" title="${e(b.chip)}">${b.chipCompacto.map(p => `<span class="${p.classe}"><i class="fas ${p.icone}"></i>${e(String(p.valor))}</span>`).join("")}</span>` : b.chip ? `<span class="nauren-hud-chip ${b.chipClasse}">${e(b.chip)}</span>` : `<span class="nauren-hud-chip vazio"></span>`}
      </button>`).join("") : `<span class="nauren-hud-vazio">${e(c.vazio)}</span>`;
  const condicoes = c.condicoes.length ? c.condicoes.map(k => `
      <div class="nauren-hud-cond${k.nova ? " nova" : ""}${k.postura ? " postura" : ""}${k.negativa ? " negativa" : ""}" data-item-id="${e(k.id)}">
        <img src="${e(k.img)}" alt="${e(k.nome)}" data-action="abrirItem">
        <span class="nauren-hud-cond-nome" data-action="abrirItem">${e(k.nome)}</span>
        ${k.acumulos ? `<span class="nauren-hud-cond-num">${e(k.acumulos)}</span>` : ""}
        ${k.postura ? "" : `<button type="button" class="nauren-hud-cond-menos" data-action="condicaoMenos" aria-label="Tirar 1 acúmulo de ${e(k.nome)}"><i class="fas fa-minus"></i></button>`}
      </div>`).join("") + (c.condicoesExtra ? `<span class="nauren-hud-cond-mais" data-action="abrirFicha" title="Ver todas na ficha">+${c.condicoesExtra}</span>` : "") : `<span class="nauren-hud-vazio">Nenhuma</span>`;
  const alvos = c.alvos?.length ? `
    <div class="nauren-hud-alvos">
      <div class="nauren-hud-alvos-topo"><span class="nauren-hud-rot">Alvos marcados</span><button type="button" class="nauren-hud-alvos-limpar" data-action="limparAlvos">Limpar</button></div>
      ${c.alvos.map(a => `<div class="nauren-hud-alvo${a.aliado ? " aliado" : ""}"><img src="${e(a.img)}" alt=""><span class="nauren-hud-alvo-nome">${e(a.nome)}</span>${a.aliado ? `<span class="nauren-hud-alvo-tag">${a.voce ? "você" : "aliado"}</span>` : ""}<button type="button" class="nauren-hud-alvo-x" data-action="removerAlvo" data-token-id="${e(a.id)}" aria-label="Desmarcar ${e(a.nome)}"><i class="fas fa-times"></i></button></div>`).join("")}
      ${c.alvosExtra ? `<span class="nauren-hud-alvos-mais">+${c.alvosExtra} marcado${c.alvosExtra > 1 ? "s" : ""}</span>` : ""}
    </div>` : "";
  return `<div class="nauren-hud-raiz nc2${c.expandido ? " expandido" : ""}${c.coresEscuro ? " nc-fundo-escuro" : ""}${c.monstro ? " nc-monstro" : ""}" lang="pt-BR" style="${c.coresEstilo ?? ""}">
    ${flutuanteEsq}
    ${alvos}
    <div class="nauren-hud-dica" hidden></div>
    <section class="nauren-hud-painel nauren-hud-esquerda">
      <div class="nauren-hud-cabecalho">
        <img class="nauren-hud-retrato ${c.retratoAnim}" src="${e(c.retrato)}" alt="" data-action="abrirFicha" title="${e(c.classeCompleta || "")} · abrir a ficha">
        <div class="nauren-hud-identidade">
          <div class="nauren-hud-nome-linha"><span class="nauren-hud-nome">${e(c.nome)}</span><span class="nauren-hud-classe">${e(c.classe)}</span></div>
          ${barras}
        </div>
      </div>
      ${barrasResto}
      <div class="nauren-hud-linha-final">
        <div class="nauren-hud-mini"><span class="nauren-hud-rot">Estresse</span>${estresse}</div>
        <div class="nauren-hud-mini"><span class="nauren-hud-rot">Destino</span><b class="nauren-hud-destino" data-action="rolarTeste" data-attr="destino" data-label="Destino" title="Gastar um Dado de Destino e rolar">${e(c.destino)}</b></div>
        <button type="button" class="nauren-hud-botao-teste${c.testesAberto ? " ativo" : ""}" data-action="testes"><i class="fas fa-dice-d20"></i> Testes</button>
      </div>
    </section>
    <section class="nauren-hud-painel nauren-hud-centro">
      <nav class="nauren-hud-abas">
        ${c.abas.map(a => `<button type="button" class="nauren-hud-aba${a.ativa ? " ativa" : ""}${a.id === "favoritos" ? " favoritos" : ""}" data-action="aba" data-aba="${a.id}"${a.id === "favoritos" ? ` title="Favoritos" aria-label="Favoritos"` : ""}>${e(a.nome)}</button>`).join("")}
        ${grimorio}
      </nav>
      <div class="nauren-hud-grade">${botoes}</div>
    </section>
    <section class="nauren-hud-painel nauren-hud-direita">
      <div class="nauren-hud-direita-topo">
        <span class="nauren-hud-rot">${c.temPostura ? "Postura e Condições" : "Condições"}</span>
        <span class="nauren-hud-topo-botoes">
          <button type="button" class="nauren-hud-sutil" data-action="editarRecursos" aria-label="Escolher os recursos do HUD" title="Escolher os recursos do HUD"><i class="fas fa-sliders"></i></button>
          <button type="button" class="nauren-hud-sutil" data-action="expandir" aria-label="${c.expandido ? "Diminuir o HUD" : "Expandir o HUD"}" title="${c.expandido ? "Diminuir o HUD" : "Expandir o HUD (mais Ações, Condições e recursos)"}"><i class="fas ${c.expandido ? "fa-down-left-and-up-right-to-center" : "fa-up-right-and-down-left-from-center"}"></i></button>
          <button type="button" class="nauren-hud-sutil" data-action="recolher" aria-label="Recolher o HUD" title="Recolher o HUD"><i class="fas fa-chevron-down"></i></button>
        </span>
      </div>
      <div class="nauren-hud-condicoes">${condicoes}</div>
      <div class="nauren-hud-rodape-direita">
        <div class="nauren-hud-bloco">
          <div class="nauren-hud-rotulo"><span>${e(c.movimento.rotulo)}</span><span class="valor">${e(c.movimento.texto)}</span></div>
          <div class="nauren-hud-barra"><div class="nauren-hud-barra-fill movimento" style="width:${c.movimento.pct}%"></div></div>
        </div>
        ${c.encerrarTurno ? `<button type="button" class="nauren-hud-botao-ouro" data-action="encerrarTurno"${c.proximoTexto ? ` title="${e(c.proximoTexto)}"` : ""}>Encerrar turno</button>` : `<span class="nauren-hud-turno-de"><span>${e(c.turnoTexto)}</span>${c.proximoTexto ? `<span class="nauren-hud-proximo${c.proximoEhVoce ? " voce" : ""}">${e(c.proximoTexto)}</span>` : ""}</span>`}
      </div>
    </section>
  </div>`;
}


/** HTML do cartão de dica de um botão (Ação, Efeito ou Condição). */
function naurenHudDicaHtml(d) {
  const e = naurenHudEsc;
  return `<div class="nauren-hud-dica-topo"><span class="nauren-hud-dica-nome">${e(d.nome)}</span><span class="nauren-hud-dica-tipo">${e(d.tipo)}</span></div>
    ${d.desc ? `<span class="nauren-hud-dica-desc">${e(d.desc)}</span>` : ""}
    ${d.aviso ? `<span class="nauren-hud-dica-aviso">${e(d.aviso)}</span>` : ""}
    ${d.linha ? `<span class="nauren-hud-dica-linha">${e(d.linha)}</span>` : ""}`;
}


class NaurenHudCombate extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "nauren-hud-combate",
    classes: ["nauren-hud"],
    window: { frame: false, positioned: false },
    actions: {
      aba: NaurenHudCombate.onAba,
      usarItem: NaurenHudCombate.onUsarItem,
      alternarEfeito: NaurenHudCombate.onAlternarEfeito,
      alternarLuz: NaurenHudCombate.onAlternarLuz,
      paginaFechada: NaurenHudCombate.onPaginaFechada,
      abrirItem: NaurenHudCombate.onAbrirItem,
      abrirFicha: NaurenHudCombate.onAbrirFicha,
      testes: NaurenHudCombate.onTestes,
      rolarTeste: NaurenHudCombate.onRolarTeste,
      virarPagina: NaurenHudCombate.onVirarPagina,
      condicaoMenos: NaurenHudCombate.onCondicaoMenos,
      encerrarTurno: NaurenHudCombate.onEncerrarTurno,
      removerAlvo: NaurenHudCombate.onRemoverAlvo,
      limparAlvos: NaurenHudCombate.onLimparAlvos,
      recolher: NaurenHudCombate.onRecolher,
      expandir: NaurenHudCombate.onExpandir,
      editarRecursos: NaurenHudCombate.onEditarRecursos
    }
  };

  #aba = null;
  #testesAberto = false;
  #atorId = null;
  #dicas = new Map();

  /** Token controlado cuja ficha o usuário pode usar (o Mestre vê qualquer um). */
  get token() {
    return canvas?.tokens?.controlled?.find(t => t.actor && t.actor.isOwner && ["personagem", "npc"].includes(t.actor.type)) ?? null;
  }
  get actor() { return this.token?.actor ?? null; }

  /** Mostra, atualiza ou esconde conforme o token selecionado e a configuração. */
  static atualizar() {
    try {
      if (!canvas?.ready) return;
      const modo = game.settings.get("nauren", "hudCombate");
      const hud = (naurenHud ??= new NaurenHudCombate());
      const token = hud.token;
      const emCombate = !!game.combat?.started;
      const mostrar = token && (modo === "sempre" || (modo === "combate" && emCombate) || hud._forcado);
      if (!mostrar) { if (hud.rendered) hud.close({ animate: false }); return; }
      if (hud.#atorId !== token.actor.id) { hud.#aba = null; hud.#testesAberto = false; hud.#atorId = token.actor.id; hud._entrando = true; }
      if (!hud.rendered) hud._entrando = true;
      hud.render({ force: true });
    } catch (err) { console.warn("Nauren RPG | HUD de combate", err); }
  }
  static alternarManual() {
    const hud = (naurenHud ??= new NaurenHudCombate());
    if (hud.rendered) { hud._forcado = false; hud.close({ animate: false }); return; }
    hud._forcado = true;
    if (!hud.token) { ui.notifications.info("Selecione um token seu para abrir o HUD de Combate."); return; }
    NaurenHudCombate.atualizar();
  }

  /* ---------- dados ---------- */
  async _prepareContext() {
    const actor = this.actor, token = this.token, sys = actor?.system;
    if (!actor) return { recolhido: true, nome: "", retrato: "" };
    const recolhido = game.settings.get("nauren", "hudCombateRecolhido");
    const classe = actor.items.find(i => i.type === "classe");
    const retrato = token?.document?.texture?.src || actor.img;
    const nomeClasse = classe ? classe.name : (actor.type === "npc" ? "NPC" : "");
    const c = { recolhido, nome: actor.name, retrato, classe: `Nv ${sys.nivel ?? 1}`, classeCompleta: `${nomeClasse}${nomeClasse ? " · " : ""}nível ${sys.nivel ?? 1}` };
    { const est = naurenEstiloDoCard(actor); c.coresEstilo = est.estilo; c.coresEscuro = est.escuro; c.monstro = actor.type === "npc"; }
    if (recolhido) return c;

    const pct = (v, m) => m > 0 ? Math.max(0, Math.min(100, Math.round(100 * v / m))) : 0;
    const vida = sys.vida ?? {}, mana = sys.mana ?? {}, est = sys.estaminaCombate ?? {}, stress = sys.stress ?? {}, dest = sys.dadosDestino ?? {};
    // Recursos escolhidos na ficha ("Recursos do HUD"), com as cores das Barras do Token.
    c.expandido = game.settings.get("nauren", "hudCombateExpandido");
    const ultimos = naurenHudCombateUltimos.get(actor.uuid) ?? {};
    const novosValores = {};
    const coresToken = new Map((naurenHudBarrasDoToken(token?.document ?? { actor, getFlag: () => null }) ?? []).map(b => [b.recurso, b]));
    c.recursos = naurenHudCombateRecursos(actor).filter(r => r.visivel).map(r => {
      const v = naurenHudLerRecurso(actor, r.recurso);
      const cfg = coresToken.get(r.recurso) ?? naurenHudRecursosDoAtor(actor).find(x => x.id === r.recurso) ?? {};
      const p = pct(v.value, v.max);
      const antes = ultimos[r.recurso];
      novosValores[r.recurso] = p;
      const escudo = r.recurso === "vida" ? naurenHudLerRecurso(actor, "escudo").value : 0;
      return { id: r.recurso, nome: r.nome, deClasse: !!r.deClasse, texto: `${v.value} / ${v.max}${escudo > 0 ? ` (+${escudo})` : ""}`, pct: p, antes: antes ?? p,
        mudou: antes !== undefined && antes !== p ? (p < antes ? "perda" : "ganho") : "", cor1: cfg.cor1 ?? "#888", cor2: cfg.cor2 ?? cfg.cor1 ?? "#ccc",
        escudoPct: escudo > 0 && v.max > 0 ? Math.min(100 - p, Math.round(100 * escudo / v.max)) : 0 };
    });
    const vidaAntes = ultimos.__vida, vidaAgora = vida.value ?? 0;
    c.retratoAnim = vidaAntes !== undefined && vidaAntes !== vidaAgora ? (vidaAgora < vidaAntes ? "dano" : "cura") : "";
    novosValores.__vida = vidaAgora;
    const condAntes = new Set(ultimos.__conds ?? []);
    novosValores.__conds = actor.items.filter(i => i.type === "condicao" && i.system.ativo !== false).map(i => i.id);
    c._condNovas = ultimos.__conds ? novosValores.__conds.filter(id => !condAntes.has(id)) : [];
    naurenHudCombateUltimos.set(actor.uuid, novosValores);
    const stMax = stress.max ?? 2, stAtual = stress.value ?? 0;
    c.estresse = stMax <= 3 ? { bolinhas: Array.from({ length: Math.max(stMax, stAtual) }, (_, i) => i < stAtual) } : { texto: `${stAtual}/${stMax}` };
    c.destino = `${dest.value ?? 0}/${dest.max ?? 0}`;
    c.testesAberto = this.#testesAberto;
    c.testes = NAUREN_HUD_TESTES.map(([key, label]) => {
      let valor = 0; try { valor = Number(naurenResolverTokenFormula(key, actor)) || 0; } catch (err) { valor = 0; }
      return { key, label, valor: (valor >= 0 ? "+" : "") + valor };
    });

    // Prioridade: ataque recebido agora (popup de reação aberto) e Prioridades dadas a você no turno atual.
    const combate = game.combat;
    c.prioridades = [];
    const alvo = naurenHudAlvos.get(actor.uuid);
    if (alvo) c.prioridades.push(alvo.houveAtaque ? `${alvo.de} ataca você com ${alvo.acao}: reaja agora.` : `${alvo.de} usou ${alvo.acao} em você: reaja agora.`);
    if (combate?.started) {
      for (const r of naurenRegistroPrioridades(combate)) {
        if (r.paraUuid !== actor.uuid || r.usada || r.rodada !== combate.round || r.turno !== combate.turn) continue;
        c.prioridades.push(r.tomadaDe ? `Você tomou a Prioridade de ${r.tomadaDe}.` : `${r.deNome || "Um aliado"} concedeu Prioridade a você${r.item ? ` (${r.item})` : ""}.`);
      }
    }

    // Abas e botões.
    const estAtual = est.value ?? 0, manaAtual = mana.value ?? 0;
    const grimorioItem = actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Grimório do Mago") && i.system.ativo !== false);
    const g = grimorioItem ? naurenGrimorio(actor) : null;
    const abertas = new Set(g?.abertas?.map(m => m.id) ?? []);
    const porSort = (a, b) => (a.sort ?? 0) - (b.sort ?? 0);
    const listas = {
      armas: actor.items.filter(i => i.type === "arma" && (i.system.acoes?.length ?? 0) > 0).sort((a, b) => (b.system.equipado ? 1 : 0) - (a.system.equipado ? 1 : 0) || porSort(a, b)),
      magias: actor.items.filter(i => i.type === "magia" && (i.system.acoes?.length ?? 0) > 0).sort(g ? naurenOrdemListaMagias : porSort),
      habilidades: actor.items.filter(i => ((i.type === "habilidade" && i.system.ativo !== false && !i.system.usaEmanacao) || i.type === "armadura") && (i.system.acoes?.length ?? 0) > 0).sort(porSort),
      efeitos: actor.items.filter(i => i.type === "efeito" || (i.type === "habilidade" && i.system.usaEmanacao)).sort(porSort),
      // 0.99: itens com luz (Tocha, Lanterna...) também aparecem, para acender/apagar no HUD.
      consumiveis: actor.items.filter(i => i.type === "consumivel" && ((i.system.acoes?.length ?? 0) > 0 || naurenItemTemLuz(i))).sort(porSort)
    };
    const favIds = (actor.getFlag("nauren", "hudFavoritos") ?? []).filter(id => { const it = actor.items.get(id); return it && it.type !== "condicao"; });
    const favSet = new Set(favIds);
    listas.favoritos = favIds.map(id => actor.items.get(id));
    const disponiveis = NAUREN_HUD_ABAS.filter(([id]) => id === "favoritos" || listas[id].length > 0);
    const abaValida = this.#aba && (this.#aba === "favoritos" || listas[this.#aba]?.length);
    if (!abaValida) this.#aba = listas.favoritos.length ? "favoritos" : (disponiveis.find(([id]) => id !== "favoritos")?.[0] ?? "favoritos");
    c.abas = disponiveis.map(([id, nome]) => ({ id, nome, ativa: id === this.#aba }));
    c.vazio = this.#aba === "favoritos" ? "Arraste itens da ficha para cá, ou clique com o botão direito num botão de outra aba para fixá-lo." : "Sem Ações, Efeitos nem itens na Mochila.";
    if (g && this.#aba === "magias") c.grimorio = { texto: g.paginas.length ? `${g.inicio + 1}–${g.inicio + g.abertas.length} de ${g.paginas.length}` : "vazio", podeVoltar: g.inicio > 0, podeAvancar: g.inicio < g.maxInicio };

    this.#dicas = new Map();
    c.botoes = (listas[this.#aba] ?? []).map(item => {
      const s = item.system, acoes = s.acoes ?? [];
      const acao = acoes.length ? acoes[Math.min(s.acaoAtivaIndex ?? 0, acoes.length - 1)] : null;
      const b = { id: item.id, img: item.img, nome: item.name, classes: "", acao: "usarItem", chip: "", chipClasse: "", canto: "", cantoClasse: "", alc: null };
      const dica = { nome: item.name, tipo: "", desc: naurenHudTextoSimples(s.descricao), aviso: "", linha: "" };
      const tipo = naurenHudTipoDoItem(item);
      if (tipo === "consumiveis" && !acoes.length && naurenItemTemLuz(item)) {
        // 0.99: item só de luz: o botão acende/apaga.
        const acesa = s.luzVisao.luz.acesa !== false;
        const vale = naurenItemValeAgora(item, s.luzVisao.luz.quando);
        b.acao = "alternarLuz"; b.chip = acesa ? "Acesa" : "Apagada"; b.chipClasse = acesa ? "ligado" : "";
        if (acesa) b.classes += " ligado";
        b.canto = `×${s.quantidade ?? 0}`;
        dica.tipo = NAUREN_CATEGORIAS_EQUIPAMENTO[s.categoria || "consumivel"] ?? "Equipamento";
        dica.linha = `Clique para ${acesa ? "apagar" : "acender"}.${!vale ? ` A luz só aparece com o item ${"equipado" in s ? "equipado" : "ativo"}.` : ""}`;
      } else if (tipo === "efeitos") {
        const ligado = s.ativo !== false;
        b.acao = "alternarEfeito"; b.chip = ligado ? "Ligado" : "Desligado"; b.chipClasse = ligado ? "ligado" : "";
        if (ligado) b.classes += " ligado";
        dica.tipo = item.type === "efeito" ? "Efeito" : "Emanação";
        dica.linha = `Clique para ${ligado ? "desligar" : "ligar"}${!ligado && s.custoParaAtivarEstamina > 0 ? ` (custa ${s.custoParaAtivarEstamina} Estamina)` : ""}.`;
      } else {
        const custos = [];
        const estCatHud = acao?.custoEstaminaPorCategoria ? (actor.system.escalaMonstro?.estCat ?? 0) : 0;
        if (acao?.custoEstamina || estCatHud) custos.push(`${(acao?.custoEstamina || 0) + estCatHud} Est`);
        if (acao?.custoMana) custos.push(`${acao.custoMana} Mana`);
        // Custos em recurso próprio de valor fixo (ex.: "2 Energia" no Golpe Espiritual).
        for (const cr of acao?.custosRecursoProprio ?? []) {
          const q = Number(cr.quantidade);
          if (!cr.ativo || !Number.isFinite(q) || q <= 0 || cr.condicaoParaAtivar) continue;
          custos.push(`${q} ${naurenNomeDoRecurso(actor, cr.recurso)}`);
        }
        b.chip = custos.join(" + "); b.chipClasse = acao?.custoMana && !acao?.custoEstamina ? "mana" : custos.length ? "est" : "";
        // Estamina + Mana juntas não cabem por extenso ("2 Est + 2…"): ícone e número de cada uma.
        const estChip = (acao?.custoEstamina || 0) + estCatHud;
        if (estChip && acao?.custoMana && custos.length === 2) b.chipCompacto = [{ classe: "est", icone: "fa-bolt", valor: estChip }, { classe: "mana", icone: "fa-droplet", valor: acao.custoMana }];
        dica.tipo = item.type === "armadura" ? "Armadura" : item.type === "consumivel" ? (NAUREN_CATEGORIAS_EQUIPAMENTO[item.system?.categoria || "consumivel"] ?? "Equipamento") : ({ armas: "Arma", magias: "Magia", habilidades: "Habilidade" }[tipo] ?? "");
        // 0.94.31: usos do ITEM (ex.: Arma de Inventor, que recarrega pela Recarga) têm prioridade sobre os da Ação.
        if (s.usaUsos === true && !acao?.usosProprios) {
          const maxN = naurenResolverPorNivel(s.usosMaxPorNivel, Number(actor.system?.nivel) || 1, "valor");
          b.canto = `${s.usosAtual ?? 0}/${maxN !== null ? maxN : (s.usosMax ?? 0)}`;
        }
        else if (acao?.usaUsos) b.canto = `${acao.usosAtual ?? 0}/${acao.usosMax ?? 0}`;
        else if (acao?.usaCargas) b.canto = `${acao.cargasAtual ?? 0}/${acao.cargasMax ?? 0}`;
        else if (s.usaUsosPassiva) b.canto = `${s.usosPassivaAtual ?? 0}`;
        // Corpo a corpo / à distância: ícone no canto esquerdo (apagado quando é o palpite do Automático).
        if (naurenAcaoEhGolpe(acao)) {
          const t = naurenTipoAlcanceDaAcao(item, acao);
          const auto = !(acao.tipoAlcance === "corpoACorpo" || acao.tipoAlcance === "distancia");
          const nomeT = { corpoACorpo: "Corpo a corpo", distancia: "À distância", segueArma: "Segue a arma escolhida" }[t];
          b.alc = { icone: { corpoACorpo: "fa-sword", distancia: "fa-bow-arrow", segueArma: "fa-swords" }[t], auto, titulo: `${nomeT}${auto && t !== "segueArma" ? " (automático)" : ""}` };
          b.classes += " tem-alc";
          dica.alcance = nomeT;
        }
        if (tipo === "consumiveis") { b.canto = `×${s.quantidade ?? 0}`; if ((s.quantidade ?? 0) <= 0) { b.classes += " apagado"; dica.aviso = "Acabou."; } }
        if (tipo === "armas" && s.equipado) { b.classes += " equipado"; dica.tipo = "Arma · equipada"; }
        if (tipo === "magias" && g && s.ehMagiaDeMago) {
          const pagina = s.paginaGrimorio || 0;
          if (pagina) { b.canto = `Pág. ${pagina}`; b.cantoClasse = "pagina"; dica.tipo = `Magia · Pág. ${pagina}`; }
          if (!abertas.has(item.id)) { b.classes += " fechada"; b.acao = "paginaFechada"; dica.aviso = "Página fechada: vire o Grimório até ela."; }
        }
        const custoEstHud = (acao?.custoEstamina || 0) + estCatHud;
        // Mana com os mesmos ajustes que a Ação cobra (Combustão, Empoderamento...): antes o botão apagava à toa.
        let custoManaHud = acao?.custoMana || 0;
        if (custoManaHud && item?.type === "magia") { const ajH = naurenAjusteCustoManaMagia(actor, item, acao, false); if (ajH.linhas.length) custoManaHud = Math.max(ajH.minimo, custoManaHud + ajH.delta); }
        const gratisHud = custoEstHud && estAtual < custoEstHud ? naurenEstaminaGratisAgora(actor, acao) : "";
        if (gratisHud) { dica.aviso = `Sem custo de Estamina agora (${gratisHud}).`; b.classes += " gratis"; }
        const faltaEst = custoEstHud && estAtual < custoEstHud && !gratisHud, faltaMana = custoManaHud && manaAtual < custoManaHud;
        if ((faltaEst || faltaMana) && !dica.aviso) { b.classes += " apagado"; dica.aviso = `Falta ${[faltaEst ? "Estamina" : "", faltaMana ? "Mana" : ""].filter(Boolean).join(" e ")}.`; }
        // Travas (M11): Emudecido apaga Ações com Mana; forma fechada apaga ataques.
        if (acao && !dica.aviso) { const tr = naurenTravaDaAcao(actor, acao, item); if (tr) { b.classes += " apagado"; dica.aviso = `${tr.fontes.join(", ")}: ${tr.texto}.`; } }
        // Requisito pelo alvo (M03): o alvo marcado precisa ter a Condição - botão apagado com o motivo.
        if (acao?.exigirCondicaoAlvo && acao.usaCondicaoAlvo && acao.condicaoAlvoUuid && !dica.aviso) {
          const alvoT = Array.from(game.user.targets ?? [])[0];
          if (alvoT?.actor) {
            const refQ = acao.condicaoAlvoUuid;
            const condQ = alvoT.actor.items.find(i => i.type === "condicao" && i.system.ativo !== false && (i.getFlag("core", "sourceId") === refQ || i.getFlag("nauren", "cadeiaRaizUuid") === refQ));
            const qtdQ = condQ ? (condQ.system.acumulativel ? (condQ.system.acumulos ?? 1) : 1) : 0;
            const minQ = Math.max(1, Number(acao.exigirCondicaoAlvoMinimo) || 1);
            if (qtdQ < minQ) { let nq = "a Condição"; try { nq = fromUuidSync(refQ)?.name ?? nq; } catch (err) { /* nome genérico */ } b.classes += " apagado"; dica.aviso = `O alvo precisa estar com ${minQ > 1 ? `${minQ} acúmulos de ` : ""}${nq} (tem ${qtdQ}).`; }
          }
        }
        const partes = [dica.alcance ?? "", b.chip ? `Custo: ${b.chip}` : "Sem custo", b.canto && !b.cantoClasse ? `usos ${b.canto}` : "", acoes.length > 1 ? `Ação: ${acao?.nome || "principal"}` : "", "clique para usar"];
        dica.linha = partes.filter(Boolean).join(" · ");
      }
      const fav = favSet.has(item.id);
      if (fav && this.#aba !== "favoritos") { if (b.cantoClasse === "pagina") b.canto = `★ ${b.canto}`; else b.classes += " favorito"; }
      dica.linha = [dica.linha, `botão direito: ${fav ? "tirar dos" : "fixar nos"} Favoritos`].filter(Boolean).join(" · ");
      this.#dicas.set(item.id, dica);
      return b;
    });

    // Condições.
    // Posturas ativas (Efeitos de grupo exclusivo, ex.: as Guardas do Guerreiro) aparecem primeiro, com borda dourada.
    const posturas = actor.items.filter(i => i.type === "efeito" && i.system.ativo && i.system.grupoExclusivo);
    const todasCondicoes = [...posturas, ...actor.items.filter(i => i.type === "condicao" && i.system.ativo !== false && !naurenEhCondicaoModelo(i) && i.system.iconeVisivel !== "ficha")];
    const cabem = c.expandido ? todasCondicoes.length : (todasCondicoes.length > 4 ? 3 : 4);   // com "+N" no fim, cabem 3 ícones
    c.condicoesExtra = Math.max(0, todasCondicoes.length - cabem);
    c.temPostura = posturas.length > 0;
    c.condicoes = todasCondicoes.slice(0, cabem).map(i => {
      if (i.type === "efeito") {
        this.#dicas.set(i.id, { nome: i.name, tipo: "Postura ativa", desc: naurenHudTextoSimples(i.system.descricao, 200), aviso: "", linha: "Clique para abrir · troque pela Ação que a ativou" });
        return { id: i.id, img: i.img, nome: i.name, acumulos: "", nova: false, postura: true };
      }
      const ac = i.system.acumulos ?? 1;
      this.#dicas.set(i.id, { nome: i.name, tipo: ac > 1 ? `Condição · ${ac} acúmulos` : "Condição", desc: naurenHudTextoSimples(i.system.descricao, 200), aviso: "", linha: "Clique para abrir · − tira 1 acúmulo" });
      return { id: i.id, img: i.img, nome: i.name, acumulos: ac > 1 ? ac : "", nova: c._condNovas.includes(i.id), negativa: i.system.negativa !== "nao" && i.system.negativa !== false };
    });

    // Movimento: o que sobrou do último movimento (Movimento Continuado) sobre o deslocamento de uma ação.
    const saldo = Math.max(0, Math.round(naurenMovimentoSaldo.get(actor.uuid) ?? 0));
    const porAcao = Math.max(0, sys.movimentoTotal ?? 0);
    c.movimento = { rotulo: "Movimento guardado", texto: `${saldo} de ${porAcao} m`, pct: pct(saldo, porAcao) };
    const combatente = combate?.started ? combate.combatants.find(k => k.tokenId === token?.id || (!naurenBandoChave(actor) && k.actorId === actor.id) || naurenCombatenteEhDoAtor(k, actor)) : null;
    c.encerrarTurno = !!(combatente && combate.combatant?.id === combatente.id);
    c.turnoTexto = combate?.started ? (combate.combatant ? `Turno de ${combate.combatant.name}` : "Combate sem turno") : "Fora de combate";
    const proximo = naurenProximoCombatente(combate);
    c.proximoEhVoce = !!(proximo && combatente && proximo.id === combatente.id);
    c.proximoTexto = proximo ? (c.proximoEhVoce ? "Próximo: você!" : `Próximo: ${proximo.name}`) : "";
    // Alvos marcados por este usuário (o aliado aparece em vermelho, para evitar acertar o companheiro).
    const meuLado = token?.document?.disposition;
    const marcados = [...game.user.targets].filter(t => t?.document);
    c.alvosExtra = Math.max(0, marcados.length - 3);
    c.alvos = marcados.slice(0, 3).map(t => ({
      id: t.id, nome: t.name, img: t.document.texture?.src || t.actor?.img || "",
      voce: t.id === token?.id, aliado: t.id === token?.id || (meuLado !== undefined && t.document.disposition === meuLado && meuLado !== CONST.TOKEN_DISPOSITIONS.NEUTRAL)
    }));
    return c;
  }

  async _renderHTML(context) { return naurenHudHtml(context); }
  _replaceHTML(result, content) { naurenTrocarHtmlMantendoRolagem(content, result); }

  _onRender(context, options) {
    super._onRender?.(context, options);
    this.element.style.setProperty("--nauren-escala", String(naurenEscalaInterface()));
    // Animações: entrada do painel, barras correndo até o valor novo, rastro da perda.
    const raizA = this.element.querySelector(".nauren-hud-raiz");
    if (raizA && this._entrando && naurenHudAnimacoesLigadas()) raizA.classList.add("entrando");
    this._entrando = false;
    const anima = naurenHudAnimacoesLigadas();
    requestAnimationFrame(() => {
      this.element?.querySelectorAll(".nauren-hud-barra-fill[data-pct]").forEach(f => { f.style.width = `${f.dataset.pct}%`; });
      setTimeout(() => this.element?.querySelectorAll(".nauren-hud-barra-rastro[data-pct]").forEach(r => { r.style.width = `${r.dataset.pct}%`; }), anima ? 350 : 0);
    });
    NaurenHudCombate.ajustarBarraDeMacros(!context.recolhido);
    naurenHudLigarDicas(this.element, id => this.#dicas.get(id));
    this._ligarFavoritos();
  }

  /* ---------- Favoritos (flag do Ator: lista de ids, na ordem) ---------- */
  async _alternarFavorito(itemId) {
    const actor = this.actor;
    const item = actor?.items.get(itemId);
    if (!item || item.type === "condicao") return;
    const lista = [...(actor.getFlag("nauren", "hudFavoritos") ?? [])].filter(id => actor.items.get(id));
    const k = lista.indexOf(itemId);
    if (k >= 0) lista.splice(k, 1); else lista.push(itemId);
    await actor.setFlag("nauren", "hudFavoritos", lista);
  }
  async _colocarFavorito(itemId, perto = null, depois = false) {
    const actor = this.actor;
    if (!actor?.items.get(itemId)) return;
    const lista = [...(actor.getFlag("nauren", "hudFavoritos") ?? [])].filter(id => id !== itemId && actor.items.get(id));
    const k = perto ? lista.indexOf(perto) : -1;
    if (k < 0) lista.push(itemId); else lista.splice(depois ? k + 1 : k, 0, itemId);
    this.#aba = "favoritos";
    await actor.setFlag("nauren", "hudFavoritos", lista);
  }
  _ligarFavoritos() {
    const raiz = this.element, actor = this.actor;
    if (!actor) return;
    raiz.querySelectorAll(".nauren-hud-acao").forEach(el => {
      el.addEventListener("contextmenu", ev => { ev.preventDefault(); ev.stopPropagation(); this._alternarFavorito(el.dataset.itemId); });
      el.addEventListener("dragstart", ev => {
        const it = actor.items.get(el.dataset.itemId);
        if (!it) return;
        raiz.querySelector(".nauren-hud-dica")?.setAttribute("hidden", "");
        ev.dataTransfer.setData("text/plain", JSON.stringify({ type: "Item", uuid: it.uuid })); // também serve para soltar na barra de macros
        ev.dataTransfer.setData("text/nauren-hud", it.id);
        ev.dataTransfer.effectAllowed = "copyMove";
      });
    });
    const zona = raiz.querySelector(".nauren-hud-centro");
    if (!zona) return;
    zona.addEventListener("dragover", ev => { ev.preventDefault(); zona.classList.add("recebendo"); });
    zona.addEventListener("dragleave", ev => { if (!zona.contains(ev.relatedTarget)) zona.classList.remove("recebendo"); });
    zona.addEventListener("drop", async ev => {
      ev.preventDefault(); ev.stopPropagation();
      zona.classList.remove("recebendo");
      let id = ev.dataTransfer.getData("text/nauren-hud");
      if (!id) {
        let dados = null;
        try { dados = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err) { return; }
        const doc = dados?.uuid ? fromUuidSync(dados.uuid) : null;
        if (!doc || doc.documentName !== "Item") return;
        if (doc.parent?.uuid !== actor.uuid) { ui.notifications.warn("Só dá para fixar nos Favoritos itens da ficha deste personagem."); return; }
        id = doc.id;
      }
      const item = actor.items.get(id);
      if (!item) return;
      if (item.type === "condicao") { ui.notifications.warn("Condições não vão para os Favoritos."); return; }
      const alvo = ev.target.closest?.(".nauren-hud-acao");
      let perto = null, depois = false;
      if (alvo && this.#aba === "favoritos" && alvo.dataset.itemId !== id) {
        const r = alvo.getBoundingClientRect();
        perto = alvo.dataset.itemId; depois = ev.clientX > r.left + r.width / 2;
      }
      await this._colocarFavorito(id, perto, depois);
    });
  }
  _onClose(options) {
    super._onClose?.(options);
    NaurenHudCombate.ajustarBarraDeMacros(false);
  }
  /** Com o HUD aberto (não recolhido), esconde a barra de macros e o HUD ocupa o lugar dela. */
  static ajustarBarraDeMacros(hudAberto) {
    let esconder = false;
    try { esconder = hudAberto && game.settings.get("nauren", "hudCombateEscondeMacros"); } catch (err) { esconder = false; }
    document.body.classList.toggle("nauren-hud-sem-macros", !!esconder);
  }

  /* ---------- ações (todas delegam à ficha) ---------- */
  get sheet() { return this.actor?.sheet ?? null; }
  _item(target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    return id ? this.actor?.items.get(id) : null;
  }
  static onAba(event, target) { this.#aba = target.dataset.aba; this.render(); }
  static async onUsarItem(event, target) {
    const item = this._item(target), sheet = this.sheet;
    if (!item || !sheet?._useItem) return;
    await sheet._useItem(item);
  }
  static async onAlternarEfeito(event, target) {
    const item = this._item(target), sheet = this.sheet;
    if (!item) return;
    const vaiAtivar = item.system.ativo === false;
    if (vaiAtivar && item.type === "efeito" && item.system.custoParaAtivarEstamina > 0 && sheet?._confirmarAtivarEfeito) {
      const pode = await sheet._confirmarAtivarEfeito(item);
      if (!pode) return;
    }
    await item.update({ "system.ativo": vaiAtivar });
  }
  static async onAlternarLuz(event, target) {
    const item = this._item(target);
    if (!item?.system?.luzVisao) return;
    await item.update({ "system.luzVisao.luz.acesa": item.system.luzVisao.luz.acesa === false });
  }
  static onPaginaFechada(event, target) {
    const item = this._item(target);
    ui.notifications.info(`"${item?.name ?? "Magia"}" está numa página fechada do Grimório: vire até ela (1 Estamina) para conjurar.`);
  }
  static onAbrirItem(event, target) { this._item(target)?.sheet?.render(true); }
  static onAbrirFicha() { this.actor?.sheet?.render(true); }
  static onTestes() { this.#testesAberto = !this.#testesAberto; this.render(); }
  static async onRolarTeste(event, target) {
    const sheet = this.sheet;
    if (!sheet?._rollAttributeTest) return;
    this.#testesAberto = false; this.render();
    await sheet._rollAttributeTest(target.dataset.attr, target.dataset.label);
  }
  static async onVirarPagina(event, target) {
    const actor = this.actor, sheet = this.sheet;
    const grimorio = actor?.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Grimório do Mago") && i.system.ativo !== false);
    if (!grimorio || !sheet?._executarAcao) return;
    const idx = (grimorio.system.acoes ?? []).findIndex(a => a.virarPagina === Number(target.dataset.direcao));
    if (idx >= 0) await sheet._executarAcao(grimorio, idx);
  }
  static async onCondicaoMenos(event, target) {
    const item = this._item(target), sheet = this.sheet;
    if (!item || !sheet) return;
    // Mesmo caminho do botão "−" da ficha (custo para remover, confirmação, gatilhos).
    const alvoFalso = { dataset: { delta: "-1" }, closest: () => ({ dataset: { itemId: item.id } }) };
    await NaurenActorSheet.onCondAjustar.call(sheet, event, alvoFalso);
  }
  static async onEncerrarTurno() {
    const combate = game.combat;
    if (!combate?.started) return;
    try { await combate.nextTurn(); } catch (err) { ui.notifications.warn("Não foi possível encerrar o turno: só o Mestre ou o dono do turno atual pode."); }
  }
  static onRemoverAlvo(event, target) {
    const t = canvas?.tokens?.get(target.dataset.tokenId);
    if (t) t.setTarget(false, { releaseOthers: false });
  }
  static onLimparAlvos() { naurenLimparMeusAlvos(); }
  static async onRecolher() {
    await game.settings.set("nauren", "hudCombateRecolhido", !game.settings.get("nauren", "hudCombateRecolhido"));
    this._entrando = true;
    this.render();
  }
  static async onExpandir() {
    await game.settings.set("nauren", "hudCombateExpandido", !game.settings.get("nauren", "hudCombateExpandido"));
    this.render();
  }
  static onEditarRecursos() { if (this.actor) NaurenHudRecursosEditor.abrir(this.actor); }
}


/** Cartão de dica: aparece acima do painel do meio (ou do direito, para Condições) ao passar o mouse. */
function naurenHudLigarDicas(raiz, buscarDica) {
  const caixa = raiz?.querySelector(".nauren-hud-dica");
  if (!caixa) return;
  const mostrar = (el) => {
    const d = buscarDica(el.closest("[data-item-id]")?.dataset.itemId);
    if (!d) return;
    caixa.innerHTML = naurenHudDicaHtml(d);
    caixa.classList.toggle("sobre-direita", !!el.closest(".nauren-hud-direita"));
    caixa.hidden = false;
  };
  raiz.querySelectorAll(".nauren-hud-acao, .nauren-hud-cond").forEach(el => {
    el.addEventListener("mouseenter", () => mostrar(el));
    el.addEventListener("mouseleave", () => { caixa.hidden = true; });
  });
}

/** Código que rodava solto neste trecho do nauren.mjs: chamado no mesmo ponto de antes. */
export function __naurenIniciar_hud_combate() {


Hooks.once("init", () => {
  game.settings.register("nauren", "hudCombate", {
    name: "HUD de Combate",
    hint: "Painel embaixo da tela com as Ações do token selecionado (não precisa abrir a ficha). \"Sempre\" aparece ao selecionar um token seu; \"só em combate\" aparece quando há um combate iniciado. Shift+H mostra ou esconde na hora.",
    scope: "client", config: true, type: String, default: "sempre",
    choices: { sempre: "Sempre que selecionar um token", combate: "Só em combate", nunca: "Nunca" },
    onChange: () => NaurenHudCombate.atualizar()
  });
  game.settings.register("nauren", "hudCombateRecolhido", { scope: "client", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "hudCombateExpandido", { scope: "client", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "limparAlvosFimTurno", {
    name: "Desmarcar meus alvos quando o turno acabar",
    hint: "Os alvos que você marcou são desmarcados quando termina o turno em que foram marcados (o seu ou o de outra pessoa, como numa Prioridade) e quando termina o turno de um personagem seu. Assim não são usados sem querer depois.",
    scope: "client", config: true, type: Boolean, default: true
  });
  game.settings.register("nauren", "hudCombateEscondeMacros", {
    name: "HUD de Combate: esconder a barra de macros",
    hint: "Enquanto o HUD estiver aberto, a barra de macros some e o HUD desce para o lugar dela. Ao fechar ou recolher o HUD, a barra volta.",
    scope: "client", config: true, type: Boolean, default: true,
    onChange: () => { if (naurenHud?.rendered) naurenHud.render(); else NaurenHudCombate.ajustarBarraDeMacros(false); }
  });
  game.keybindings.register("nauren", "hudCombate", {
    name: "HUD de Combate: mostrar ou esconder",
    editable: [{ key: "KeyH", modifiers: ["Shift"] }],
    onDown: () => { NaurenHudCombate.alternarManual(); return true; }
  });
});

{
  const atualizarHud = foundry.utils.debounce(() => NaurenHudCombate.atualizar(), 60);
  const seForDoHud = doc => { const a = naurenHud?.actor; return !!a && (doc === a || doc?.parent === a || doc?.actor === a); };
  Hooks.on("controlToken", () => atualizarHud());
  Hooks.on("targetToken", (usuario, token, marcado) => {
    if (usuario?.id !== game.user.id) return;
    if (marcado) naurenMarcarAlvosAgora();
    atualizarHud();
  });
  Hooks.on("updateCombat", (combate, mudancas) => {
    if (!("turn" in mudancas || "round" in mudancas) || !game.user.targets.size) return;
    let limpar = false;
    try { limpar = game.settings.get("nauren", "limparAlvosFimTurno"); } catch (err) { limpar = false; }
    if (!limpar) return;
    // Desmarca o que foi marcado num turno que já acabou: o seu turno ou o de outra pessoa (ex.: alvo de uma Prioridade).
    // Alvo marcado neste turno novo não é tocado. Também desmarca ao fim do turno de um personagem seu (como antes).
    const anterior = combate.combatants.get(combate.previous?.combatantId);
    if (naurenAlvosSaoVelhos() || anterior?.actor?.isOwner) naurenLimparMeusAlvos();
  });
  Hooks.on("canvasReady", () => atualizarHud());
  Hooks.on("updateActor", (a) => { if (seForDoHud(a)) atualizarHud(); });
  for (const h of ["createItem", "updateItem", "deleteItem"]) Hooks.on(h, (i) => { if (seForDoHud(i)) atualizarHud(); });
  Hooks.on("updateToken", (t) => { if (naurenHud?.token?.id === t.id) atualizarHud(); });
  for (const h of ["updateCombat", "deleteCombat", "combatStart", "createCombatant", "deleteCombatant"]) Hooks.on(h, () => atualizarHud());
  Hooks.on("getSceneControlButtons", (controls) => {
    const tokens = controls?.tokens ?? controls?.find?.(c => c.name === "tokens");
    if (!tokens) return;
    const tool = { name: "naurenHud", title: "HUD de Combate do Nauren (Shift+H)", icon: "fas fa-khanda", button: true, visible: true,
      onChange: () => NaurenHudCombate.alternarManual(), onClick: () => NaurenHudCombate.alternarManual() };
    if (Array.isArray(tokens.tools)) tokens.tools.push(tool); else tokens.tools.naurenHud = { ...tool, order: 100 };
  });
}
}

export { NAUREN_HUD_ABAS, NAUREN_HUD_TESTES, NaurenHudCombate, naurenAlvosMarcadosEm, naurenAlvosSaoVelhos, naurenHud, naurenHudAlvos, naurenHudCombateUltimos, naurenHudDicaHtml, naurenHudEsc, naurenHudHtml, naurenHudLigarDicas, naurenHudTextoSimples, naurenHudTipoDoItem, naurenLimparMeusAlvos, naurenMarcarAlvosAgora, naurenProximoCombatente };
