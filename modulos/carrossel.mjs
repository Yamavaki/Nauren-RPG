/* Nauren RPG — Carrossel de turnos. Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { naurenHudCondicoesDoAtor, naurenHudEscapar, naurenHudEstadoDeVida, naurenHudLerRecurso, naurenHudRecursosDoAtor, naurenTrocarHtmlMantendoRolagem } from "./barras-token.mjs";
import { naurenRegistroPrioridades } from "./prioridades.mjs";
import { naurenEstiloDoCard } from "../nauren.mjs";


/* =======================================================================
 * CARROSSEL DE TURNOS
 * ======================================================================= */
let naurenCarrossel = null;

class NaurenCarrosselTurnos extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "nauren-carrossel",
    classes: ["nauren-carrossel"],
    window: { frame: false, positioned: false },
    actions: {
      focar: NaurenCarrosselTurnos.onFocar,
      rolarIniciativa: NaurenCarrosselTurnos.onRolarIniciativa,
      turnoAnterior: NaurenCarrosselTurnos.onTurnoAnterior,
      proximoTurno: NaurenCarrosselTurnos.onProximoTurno,
      rodadaAnterior: NaurenCarrosselTurnos.onRodadaAnterior,
      proximaRodada: NaurenCarrosselTurnos.onProximaRodada,
      iniciar: NaurenCarrosselTurnos.onIniciar,
      rolarTodos: NaurenCarrosselTurnos.onRolarTodos
    }
  };
  #combateAnimado = null;
  #entradas = new Map();   // combatenteId -> instante em que a animação de entrada começa
  #danos = new Map();      // atorUuid -> { tipo: "dano"|"cura", inicio }
  /** Ao começar o combate, os retratos entram de novo, um a um (chamado pelo hook combatStart). */
  static marcarEntrada() {
    const app = naurenCarrossel; if (!app) return;
    const combate = NaurenCarrosselTurnos.combate; if (!combate) return;
    const agora = performance.now();
    combate.turns.forEach((c, i) => app.#entradas.set(c.id, agora + i * 110));
  }

  static get combate() { return game.combats?.active ?? game.combat ?? null; }
  static ligado() {
    try { if (!game.settings.get("nauren", "carrossel")) return false; } catch (err) { return false; }
    return !game.modules.get("combat-carousel")?.active;
  }
  static atualizar() {
    clearTimeout(NaurenCarrosselTurnos._adiado);
    NaurenCarrosselTurnos._adiado = setTimeout(() => NaurenCarrosselTurnos._atualizarAgora(), 60);
  }
  static _atualizarAgora() {
    try {
      if (!canvas?.ready) return;
      const app = (naurenCarrossel ??= new NaurenCarrosselTurnos());
      const combate = NaurenCarrosselTurnos.combate;
      const mostrar = NaurenCarrosselTurnos.ligado() && combate && combate.combatants.size > 0 && (combate.scene === null || combate.scene?.id === canvas.scene?.id) && !app._escondido;
      if (!mostrar) { if (app.rendered) app.close({ animate: false }); document.body.classList.remove("nauren-sem-cenas"); return; }
      app.render({ force: true });
    } catch (err) { console.warn("Nauren RPG | carrossel", err); }
  }
  static alternarManual() {
    const app = (naurenCarrossel ??= new NaurenCarrosselTurnos());
    app._escondido = !app._escondido;
    NaurenCarrosselTurnos.atualizar();
  }
  /** Mudança num ator: redesenha e dispara a animação de dano/cura. */
  static avisarMudanca(actor, changes) {
    const app = naurenCarrossel; if (!app?.rendered) return;
    const vida = foundry.utils.getProperty(changes, "system.vida.value");
    if (vida !== undefined) {
      const ant = app.#vidaAnterior?.get(actor.uuid);
      if (ant !== undefined && ant !== vida) app.#danos.set(actor.uuid, { tipo: vida < ant ? "dano" : "cura", inicio: performance.now() });
    }
    NaurenCarrosselTurnos.atualizar();
  }
  #vidaAnterior = new Map();

  #podeVer(c) {
    if (game.user.isGM) return true;
    if (c.hidden || c.token?.hidden) return false;
    return true;
  }
  async _prepareContext() {
    const combate = NaurenCarrosselTurnos.combate;
    const e = s => naurenHudEscapar(String(s ?? ""));
    const gm = game.user.isGM;
    let tamanho = 64, modo = "fila", nomes = false, opacidade = 1, escondeCenas = false, extras = "", fundo = false;
    try { fundo = !!game.settings.get("nauren", "carrosselFundo"); } catch (err) { fundo = false; }
    try { tamanho = Number(game.settings.get("nauren", "carrosselTamanho")) || 64; modo = game.settings.get("nauren", "carrosselModo"); nomes = game.settings.get("nauren", "carrosselNomes"); opacidade = Number(game.settings.get("nauren", "carrosselOpacidade")) || 1; escondeCenas = game.settings.get("nauren", "carrosselEscondeCenas"); extras = game.settings.get("nauren", "carrosselBarras"); } catch (err) { /* padrões */ }
    document.body.classList.toggle("nauren-sem-cenas", !!(escondeCenas && combate?.started));
    const recursosBarra = ["vida", "estaminaCombate", ...String(extras ?? "").split(",").map(s => s.trim()).filter(s => s && s !== "vida" && s !== "estaminaCombate")];
    const condsOk = (() => { try { return game.settings.get("nauren", "jogadoresVeemCondicoes"); } catch (err) { return true; } })();
    // Garante a lista atualizada (combatente recém-adicionado ainda pode não estar em combat.turns).
    let turnos = combate?.turns ?? [];
    if (combate && turnos.length !== combate.combatants.size) { try { turnos = combate.setupTurns(); } catch (err) { turnos = combate.combatants.contents; } }
    const registro = combate ? naurenRegistroPrioridades(combate) : [];
    let usarRetrato = true; try { usarRetrato = game.settings.get("nauren", "carrosselImagem") !== "token"; } catch (err) { usarRetrato = true; }
    // 0.94.14: retrato da ficha primeiro; o do token só quando a ficha não tem imagem própria.
    const semImagem = src => !src || /icons\/svg\/mystery-man\.svg$/.test(src) || /icons\/svg\/(item-bag|cowled)\.svg$/.test(src);
    // Entrada: quem ainda não apareceu nesta faixa (combate novo ou combatente recém-adicionado)
    // ganha um horário de entrada; re-renderizações seguintes continuam a mesma animação
    // (atraso negativo), em vez de cortá-la no meio.
    if (this.#combateAnimado !== combate?.id) { this.#entradas.clear(); this.#combateAnimado = combate?.id ?? null; }
    const agoraE = performance.now();
    let filaNova = 0;
    for (const c of turnos) if (!this.#entradas.has(c.id)) this.#entradas.set(c.id, agoraE + (filaNova++) * 110);
    const novoCombate = false;
    const combatentes = [];
    turnos.forEach((c, i) => {
      if (!this.#podeVer(c)) return;
      const actor = c.actor;
      // 0.105.2: uma Aparência só muda o mapa; o carrossel acompanha o retrato (a imagem nova só se ela trocar o retrato)
      const apBase = actor?.getFlag?.("nauren", "aparenciaBase");
      const tokenImg = (apBase?.src ? (apBase.retratoTrocado ? actor.img : apBase.src) : null) || c.token?.texture?.src || c.img;
      const img = (usarRetrato ? (!semImagem(actor?.img) ? actor.img : (tokenImg || actor?.img)) : (tokenImg || actor?.img)) || "icons/svg/mystery-man.svg";
      const dono = gm || !!actor?.isOwner;
      const mostraBarras = !!actor && (gm || actor.hasPlayerOwner);
      const barras = mostraBarras ? recursosBarra.map(id => {
        const r = naurenHudLerRecurso(actor, id); const cfg = naurenHudRecursosDoAtor(actor).find(x => x.id === id);
        return r.max > 0 || r.value > 0 ? { id, pct: r.max > 0 ? Math.max(0, Math.min(100, 100 * r.value / r.max)) : 0, cor1: cfg?.cor1 ?? "#888", cor2: cfg?.cor2 ?? "#ccc", texto: `${r.value}/${r.max}`, nome: cfg?.nome ?? id } : null;
      }).filter(Boolean) : [];
      const est = actor ? naurenHudEstadoDeVida(actor) : null;
      const conds = actor && (dono || condsOk) ? naurenHudCondicoesDoAtor(actor) : [];
      const temPrioridade = !!actor && registro.some(r => r.paraUuid === actor.uuid && !r.usada && r.rodada === combate.round);
      const dRec = actor ? this.#danos.get(actor.uuid) : null;
      const dano = dRec && agoraE - dRec.inicio < 650 ? dRec.tipo : null;
      const atrasoDano = dRec ? Math.round(dRec.inicio - agoraE) : 0;
      if (dRec && !dano) this.#danos.delete(actor.uuid);
      const inicioEntrada = this.#entradas.get(c.id) ?? agoraE;
      const entrando = agoraE - inicioEntrada < 520;
      if (actor) this.#vidaAnterior.set(actor.uuid, naurenHudLerRecurso(actor, "vida").value);
      combatentes.push({
        id: c.id, nome: c.name, img, ativo: combate.started && i === combate.turn, agiu: combate.started && i < combate.turn,
        derrotado: !!(c.isDefeated ?? c.defeated), oculto: !!(c.hidden || c.token?.hidden), semIniciativa: c.initiative === null || c.initiative === undefined,
        podeRolar: (c.initiative === null || c.initiative === undefined) && dono, barras, estado: est, conds: conds.slice(0, 3), condsMais: Math.max(0, conds.length - 3),
        prioridade: temPrioridade, dano, atrasoDano, entrando, atraso: Math.round(inicioEntrada - agoraE),
        iniciativa: Number.isFinite(c.initiative) ? Math.floor(c.initiative) : null, tooltip: this.#tooltip(c, actor, est, dono, conds), inimigo: (c.token?.disposition ?? 0) < 0,
        cores: naurenEstiloDoCard(actor ?? null).estilo, monstro: actor?.type === "npc"
      });
    });
    return { gm, combate, iniciado: !!combate?.started, rodada: combate?.round ?? 0, combatentes, tamanho, modo, nomes, opacidade, fundo, novoCombate, escondeCenas,
      semIniciativaTotal: gm ? turnos.filter(c => c.initiative === null || c.initiative === undefined).length : 0 };
  }
  #tooltip(c, actor, est, dono, conds) {
    const e = s => naurenHudEscapar(String(s ?? ""));
    if (!actor) return e(c.name);
    const vida = naurenHudLerRecurso(actor, "vida");
    const linhas = [`<b>${e(c.name)}</b>`, `<span style="color:${est.cor}">${e(est.texto)}</span>${dono ? ` ${vida.value}/${vida.max}` : ""}`];
    if (conds.length) linhas.push(conds.map(k => `${e(k.nome)}${k.acumulos ? ` ${k.acumulos}` : ""}`).join(" · "));
    if (dono && c.initiative !== null && c.initiative !== undefined) linhas.push(`Iniciativa ${Math.floor(c.initiative)}`);
    return linhas.join("<br>");
  }
  async _renderHTML(c) {
    const e = s => naurenHudEscapar(String(s ?? ""));
    const W = c.tamanho, H = Math.round(W * 1.34), WA = Math.round(W * 1.18), HA = Math.round(H * 1.18);
    const barraH = b => `<div class="nauren-car-hbar" title="${e(b.nome)} ${e(b.texto)}"><div style="width:${b.pct}%;background:linear-gradient(90deg,${e(b.cor1)},${e(b.cor2)})"></div></div>`;
    const itens = c.combatentes.map(k => {
      return `
      <div class="nauren-car-item nc2 ${k.ativo ? "ativo" : ""} ${k.agiu ? "agiu" : ""} ${k.derrotado ? "derrotado" : ""} ${k.oculto ? "oculto" : ""} ${k.inimigo ? "inimigo" : "aliado"} ${k.entrando ? "entrando" : ""} ${k.monstro ? "nc-monstro" : ""}"
           data-id="${k.id}" data-action="focar" data-tooltip="${e(k.tooltip)}" data-tooltip-direction="DOWN" style="animation-delay:${k.atraso}ms;${k.cores}" ${c.gm ? 'draggable="true"' : ""}>
        ${k.ativo ? `<span class="nauren-car-vez">Vez</span>` : ""}
        <div class="nauren-car-bloco ${k.dano ? k.dano : ""}" style="width:${k.ativo ? WA : W}px;animation-delay:${k.atrasoDano}ms">
        <div class="nauren-car-card" style="height:${k.ativo ? HA : H}px">
          <img src="${e(k.img)}" alt="">
          <div class="nauren-car-sombra"></div>
          <i class="nauren-car-lado" title="${k.inimigo ? "Inimigo" : "Aliado"}"></i>
          ${k.iniciativa !== null ? `<span class="nauren-car-ini" title="Iniciativa">${k.iniciativa}</span>` : ""}
          ${k.prioridade ? `<span class="nauren-car-p" title="Tem Prioridade para usar agora">P</span>` : ""}
          ${k.derrotado ? `<svg class="nauren-car-x" viewBox="0 0 56 56" aria-hidden="true"><line x1="14" y1="14" x2="42" y2="42"></line><line x1="42" y1="14" x2="14" y2="42"></line></svg>` : ""}
          ${k.oculto ? `<i class="fas fa-eye-slash nauren-car-oculto" title="Escondido dos jogadores"></i>` : ""}
          ${k.podeRolar ? `<button type="button" class="nauren-car-dado" data-action="rolarIniciativa" data-id="${k.id}" title="Rolar iniciativa"><i class="fas fa-dice-d20"></i></button>` : (k.semIniciativa ? `<span class="nauren-car-semini" title="Sem iniciativa"><i class="fas fa-hourglass-half"></i></span>` : "")}
          ${k.conds.length ? `<div class="nauren-car-conds">${k.conds.map(x => `<img src="${e(x.img)}" alt="" title="${e(x.nome)}${x.acumulos ? ` ${x.acumulos}` : ""}">`).join("")}${k.condsMais ? `<span>+${k.condsMais}</span>` : ""}</div>` : ""}
        </div>
        ${k.barras.length ? `<div class="nauren-car-hbars">${k.barras.map(barraH).join("")}</div>`
          : (k.estado && !k.derrotado ? `<div class="nauren-car-hbars"><div class="nauren-car-hbar estado" title="${e(k.estado.texto)}"><div style="width:100%;background:${e(k.estado.cor)}"></div></div></div>` : "")}
        </div>
        ${c.nomes ? `<div class="nauren-car-nome">${e(k.nome)}</div>` : ""}
      </div>`;
    }).join("");
    const ctrlEsq = c.gm ? (c.iniciado
      ? `<button type="button" class="nauren-car-ctrl" data-action="rodadaAnterior" title="Rodada anterior"><i class="fas fa-angles-left"></i></button><button type="button" class="nauren-car-ctrl" data-action="turnoAnterior" title="Turno anterior · rodada ${c.rodada}"><i class="fas fa-angle-left"></i></button>`
      : `<button type="button" class="nauren-car-ctrl ouro" data-action="iniciar" title="Começar o combate"><i class="fas fa-play"></i></button>${c.semIniciativaTotal ? `<button type="button" class="nauren-car-ctrl" data-action="rolarTodos" title="Rolar a iniciativa de quem falta (${c.semIniciativaTotal})"><i class="fas fa-dice"></i></button>` : ""}`) : "";
    const ctrlDir = c.gm && c.iniciado ? `<button type="button" class="nauren-car-ctrl ouro" data-action="proximoTurno" title="Próximo turno · rodada ${c.rodada}"><i class="fas fa-angle-right"></i></button><button type="button" class="nauren-car-ctrl" data-action="proximaRodada" title="Próxima rodada"><i class="fas fa-angles-right"></i></button>` : "";
    return `<div class="nauren-car-raiz modo-${e(c.modo)}${c.fundo ? "" : " sem-fundo"}" style="opacity:${c.opacidade}">
      ${ctrlEsq}
      <div class="nauren-car-rodada"><span>${c.iniciado ? "ROD" : "PREP"}</span><b>${c.iniciado ? c.rodada : "—"}</b></div>
      <div class="nauren-car-faixa"><div class="nauren-car-lista">${itens || `<span class="nauren-car-vazio">Sem combatentes</span>`}</div></div>
      ${ctrlDir}
    </div>`;
  }
  _replaceHTML(result, content) { naurenTrocarHtmlMantendoRolagem(content, result); }
  _onRender() {
    const raiz = this.element;
    const nav = document.getElementById("navigation");
    const topo = nav && !document.body.classList.contains("nauren-sem-cenas") && nav.offsetParent !== null ? nav.getBoundingClientRect().bottom + 6 : 8;
    raiz.style.top = `${Math.round(topo)}px`;
    const ativo = raiz.querySelector(".nauren-car-item.ativo");
    if (ativo) { try { ativo.scrollIntoView({ inline: raiz.querySelector(".modo-centro") ? "center" : "nearest", block: "nearest", behavior: "smooth" }); } catch (err) { /* sem scroll */ } }
    raiz.querySelectorAll(".nauren-car-item").forEach(el => {
      el.addEventListener("dblclick", () => { const c = NaurenCarrosselTurnos.combate?.combatants.get(el.dataset.id); const a = c?.actor; if (a?.testUserPermission(game.user, "LIMITED")) a.sheet.render(true); });
      if (game.user.isGM) {
        el.addEventListener("contextmenu", ev => { ev.preventDefault(); this.#menuMestre(el.dataset.id, ev); });
        el.addEventListener("dragstart", ev => { ev.dataTransfer.setData("text/nauren-combatente", el.dataset.id); ev.dataTransfer.effectAllowed = "move"; });
        el.addEventListener("dragover", ev => { if (ev.dataTransfer.types.includes("text/nauren-combatente")) { ev.preventDefault(); el.classList.add("alvo"); } });
        el.addEventListener("dragleave", () => el.classList.remove("alvo"));
        el.addEventListener("drop", ev => { ev.preventDefault(); el.classList.remove("alvo"); this.#reordenar(ev.dataTransfer.getData("text/nauren-combatente"), el.dataset.id); });
      }
    });
  }
  async #reordenar(idMovido, idAlvo) {
    const combate = NaurenCarrosselTurnos.combate; if (!combate || idMovido === idAlvo) return;
    const turnos = combate.turns, i = turnos.findIndex(c => c.id === idMovido), j = turnos.findIndex(c => c.id === idAlvo);
    if (i < 0 || j < 0) return;
    const alvo = turnos[j], vizinho = i < j ? turnos[j + 1] : turnos[j - 1];
    const a = alvo.initiative ?? 0, b = vizinho?.initiative ?? (i < j ? a - 1 : a + 1);
    await combate.combatants.get(idMovido)?.update({ initiative: (a + b) / 2 });
  }
  #menuMestre(id, ev) {
    const combate = NaurenCarrosselTurnos.combate; const c = combate?.combatants.get(id); if (!c) return;
    document.getElementById("nauren-car-menu")?.remove();
    const menu = document.createElement("div"); menu.id = "nauren-car-menu";
    const op = (rotulo, icone, fn, classe = "") => { const b = document.createElement("button"); b.type = "button"; b.className = classe; b.innerHTML = `<i class="fas ${icone}"></i> ${rotulo}`; b.addEventListener("click", async () => { menu.remove(); await fn(); }); menu.append(b); };
    op((c.isDefeated ?? c.defeated) ? "Tirar derrotado" : "Marcar derrotado", "fa-skull", () => c.update({ defeated: !(c.isDefeated ?? c.defeated) }));
    op(c.hidden ? "Mostrar aos jogadores" : "Esconder dos jogadores", c.hidden ? "fa-eye" : "fa-eye-slash", () => c.update({ hidden: !c.hidden }));
    op("Rolar iniciativa de novo", "fa-dice-d20", () => combate.rollInitiative([c.id]));
    if (c.actor) op("Abrir ficha", "fa-user", () => c.actor.sheet.render(true));
    op("Remover do combate", "fa-trash", () => c.delete(), "perigo");
    menu.style.left = `${ev.clientX}px`; menu.style.top = `${ev.clientY}px`;
    document.body.append(menu);
    const fora = e => { if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener("pointerdown", fora, true); } };
    setTimeout(() => document.addEventListener("pointerdown", fora, true), 0);
  }
  static async onFocar(ev, target) {
    if (ev.target.closest("button")) return;
    const c = NaurenCarrosselTurnos.combate?.combatants.get(target.dataset.id);
    const tok = c?.token?.object; if (!tok || !tok.isVisible) return;
    await canvas.animatePan({ x: tok.center.x, y: tok.center.y, duration: 350 });
    if (tok.actor?.isOwner) tok.control({ releaseOthers: true });
  }
  static async onRolarIniciativa(ev, target) {
    ev.stopPropagation();
    const combate = NaurenCarrosselTurnos.combate; const c = combate?.combatants.get(target.dataset.id);
    if (!c || !(game.user.isGM || c.actor?.isOwner)) return;
    await combate.rollInitiative([c.id]);
  }
  static async onRolarTodos() { const combate = NaurenCarrosselTurnos.combate; if (combate && game.user.isGM) await combate.rollAll(); }
  static async onIniciar() { const combate = NaurenCarrosselTurnos.combate; if (combate && game.user.isGM) await combate.startCombat(); }
  static async onProximoTurno() { await NaurenCarrosselTurnos.combate?.nextTurn(); }
  static async onTurnoAnterior() { await NaurenCarrosselTurnos.combate?.previousTurn(); }
  static async onProximaRodada() { await NaurenCarrosselTurnos.combate?.nextRound(); }
  static async onRodadaAnterior() { await NaurenCarrosselTurnos.combate?.previousRound(); }
}

/** Código que rodava solto neste trecho do nauren.mjs: chamado no mesmo ponto de antes. */
export function __naurenIniciar_carrossel() {

for (const h of ["createCombat", "deleteCombat", "updateCombat", "createCombatant", "updateCombatant", "deleteCombatant"]) {
  Hooks.on(h, () => NaurenCarrosselTurnos.atualizar());
}

Hooks.on("combatStart", () => { NaurenCarrosselTurnos.marcarEntrada(); NaurenCarrosselTurnos.atualizar(); });

Hooks.on("updateCombat", (combate, mudancas) => { if (mudancas.flags?.nauren?.prioridades !== undefined) NaurenCarrosselTurnos.atualizar(); });

Hooks.on("ready", () => setTimeout(() => NaurenCarrosselTurnos.atualizar(), 500));


/* ---- Configurações e atalhos ---- */
Hooks.once("init", () => {
  const reg = (k, d) => game.settings.register("nauren", k, d);
  reg("bordaEncaixeBarras", { name: "Barras com borda do token: encaixe (%)", hint: "Ajuste fino de onde as barras ficam nos tokens com a borda do Foundry. 100 = encostadas na borda; menos aproxima do centro, mais afasta.", scope: "world", config: true, type: Number, range: { min: 60, max: 130, step: 1 }, default: 100, onChange: () => { for (const t of canvas?.tokens?.placeables ?? []) { try { t.drawBars?.(); } catch (err) { /* ignora */ } } } });
  reg("animacoesHud", { name: "Barras do token: animações", hint: "Rastro claro ao perder, brilho ao ganhar e pulso quando o recurso está abaixo de 25 %.", scope: "client", config: true, type: Boolean, default: true, onChange: () => canvas?.tokens?.placeables.forEach(t => t.drawBars?.()) });
  reg("estadoVidaHover", { name: "Estado de vida ao passar o mouse", hint: "Mostra o estado (Ileso, Escoriado, Ferido…) do token sob o mouse. Dono e Mestre veem também os números.", scope: "client", config: true, type: Boolean, default: true });
  reg("carrossel", { name: "Carrossel de turnos", hint: "Faixa no topo da tela com os retratos na ordem da iniciativa. Shift+C mostra ou esconde.", scope: "client", config: true, type: Boolean, default: true, onChange: () => NaurenCarrosselTurnos.atualizar() });
  reg("carrosselModo", { name: "Carrossel: modo", hint: "Fila: ordem da esquerda para a direita. Centro: o turno atual fica sempre no meio.", scope: "client", config: true, type: String, default: "fila", choices: { fila: "Fila", centro: "Centro" }, onChange: () => NaurenCarrosselTurnos.atualizar() });
  reg("carrosselTamanho", { name: "Carrossel: largura dos retratos (px)", scope: "client", config: true, type: Number, default: 64, range: { min: 44, max: 110, step: 4 }, onChange: () => NaurenCarrosselTurnos.atualizar() });
  reg("carrosselImagem", { name: "Carrossel: imagem", hint: "Retrato da ficha (padrão; usa a imagem do token só se a ficha não tiver imagem própria) ou sempre a imagem do token.", scope: "client", config: true, type: String, default: "retrato", choices: { retrato: "Retrato da ficha (token se não houver)", token: "Imagem do token" }, onChange: () => NaurenCarrosselTurnos.atualizar() });
  reg("carrosselNomes", { name: "Carrossel: mostrar nomes", scope: "client", config: true, type: Boolean, default: false, onChange: () => NaurenCarrosselTurnos.atualizar() });
  reg("carrosselFundo", { name: "Carrossel: painel de fundo", hint: "Desligado (padrão): só os retratos e os botões, sem o painel roxo atrás. Ligado: o painel volta.", scope: "client", config: true, type: Boolean, default: false, onChange: () => NaurenCarrosselTurnos.atualizar() });
  reg("carrosselOpacidade", { name: "Carrossel: opacidade", scope: "client", config: true, type: Number, default: 1, range: { min: 0.4, max: 1, step: 0.05 }, onChange: () => NaurenCarrosselTurnos.atualizar() });
  reg("carrosselEscondeCenas", { name: "Carrossel: esconder a barra de cenas durante o combate", scope: "client", config: true, type: Boolean, default: false, onChange: () => NaurenCarrosselTurnos.atualizar() });
  reg("carrosselBarras", { name: "Carrossel: barras extras (Mestre)", hint: "Além de Vida e Estamina. Separe por vírgula: mana, stress, dadosDestino, escudo ou recurso:<id> (ex.: recurso:energia). Jogadores só veem barras de personagens de jogador.", scope: "world", config: true, type: String, default: "", onChange: () => NaurenCarrosselTurnos.atualizar() });
  reg("jogadoresVeemCondicoes", { name: "Jogadores veem as Condições dos inimigos", hint: "No carrossel e ao passar o mouse no token.", scope: "world", config: true, type: Boolean, default: true });
  reg("criadorAtributosTravados", { name: "Criador: atributos só por dado ou valores fixos", hint: "Ligado: no Criador de Personagem os atributos só recebem os 5 dados rolados ou os valores fixos (5, 4, 3, 3, 2), clicando neles; depois de rolar o primeiro dado não dá para trocar para os fixos. Desligado: o jogador pode digitar os valores.", scope: "world", config: true, type: Boolean, default: true });
  reg("jogadoresEditamBarras", { name: "Jogadores podem editar as próprias barras do token", scope: "world", config: true, type: Boolean, default: true });
  reg("estadoVidaFixoNpc", { name: "Estado de vida fixo embaixo dos NPCs", hint: "Mostra o estado (Ferido, Quase morto…) embaixo do token dos NPCs para os jogadores, sem precisar do mouse.", scope: "world", config: true, type: Boolean, default: false, onChange: () => canvas?.tokens?.placeables.forEach(t => t.drawBars?.()) });
  reg("estadosVidaTermos", { name: "Estados de vida: termos", hint: "Seis termos separados por ponto e vírgula, do melhor ao pior.", scope: "world", config: true, type: String, default: "Ileso; Escoriado; Ferido; Gravemente ferido; Quase morto; Morto" });
  reg("estadosVidaFaixas", { name: "Estados de vida: faixas (%)", hint: "Três números separados por ponto e vírgula: a partir de quanto é Escoriado, Ferido e Gravemente ferido (abaixo do último é Quase morto).", scope: "world", config: true, type: String, default: "75; 50; 25" });
  reg("barrasModelos", { scope: "client", config: false, type: Object, default: {} });
  reg("barrasPadraoNpc", { scope: "world", config: false, type: Object, default: {} });
  game.keybindings.register("nauren", "carrossel", { name: "Carrossel de turnos: mostrar ou esconder", editable: [{ key: "KeyC", modifiers: ["Shift"] }], onDown: () => { NaurenCarrosselTurnos.alternarManual(); return true; } });
});

Hooks.once("ready", () => {
  if (!game.user.isGM) return;
  if (game.modules.get("barbrawl")?.active) ui.notifications.warn("Nauren RPG: o módulo Bar Brawl está ativo, então as barras nativas do sistema ficam desligadas.");
  if (game.modules.get("combat-carousel")?.active) ui.notifications.warn("Nauren RPG: o módulo Combat Carousel está ativo, então o carrossel nativo do sistema fica desligado.");
});
}

export { NaurenCarrosselTurnos, naurenCarrossel };
