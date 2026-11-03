/* Nauren RPG — Kit das janelas de Ação e Reação (0.95).
 * Peças de HTML usadas por todas as janelas que aparecem ao usar uma Ação ou ao reagir:
 * cabeçalho, faixa de rolagem (d20 com destaque de 20 e 1 natural), blocos por tipo de efeito,
 * cartões de opção, cartão de Condição, oferta de gatilho e ajustes pontuais.
 * As janelas são montadas uma vez (DialogV2) e nunca se redesenham sozinhas; o visual é adaptativo
 * (styles/nauren.css, prefixo "nk-"). Funções puras: só montam texto HTML. */

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));

/** Classes e tamanho padrão de toda janela do kit (passar no DialogV2). */
// 0.98: a janela usa as cores de quem age (Pigmentos). Quem chama pode dizer o ator (naurenKitJanela(ator));
// senão vale o último ator marcado com naurenKitDefinirAtor (início de uma Ação, de uma reação...).
let naurenKitAtorCorrente = null;
export function naurenKitDefinirAtor(ator) { naurenKitAtorCorrente = ator?.uuid ?? null; }
export const NAUREN_KIT_JANELA = { classes: ["nauren-kit"], position: { width: 540 }, get naurenAtorUuid() { return naurenKitAtorCorrente; } };
export function naurenKitJanela(ator) { return { ...NAUREN_KIT_JANELA, naurenAtorUuid: ator?.uuid ?? naurenKitAtorCorrente }; }

/** Estado do d20 a partir da face: "critico" (20), "falha" (1) ou "normal". */
export function naurenKitEstadoD20(face, { critMin = 20 } = {}) {
  if (face === null || face === undefined) return "normal";
  if (Number(face) === 1) return "falha";
  if (Number(face) >= Number(critMin || 20)) return "critico";
  return "normal";
}

/** Dado d20 desenhado (SVG). estado: normal | critico | falha | rerolado. */
export function naurenKitD20(face, estado = "normal", tamanho = 96) {
  // 0.96.2: desenhado só com HTML/CSS (clip-path). O conteúdo das janelas do Foundry V14 descarta <svg>,
  // e o dado sumia (ficava só o rótulo "dado (d20)").
  const rotulo = estado === "critico" ? `${face} natural (crítico)` : estado === "falha" ? `${face} natural (falha crítica)` : `${face}`;
  const longo = String(face ?? "?").length > 1 ? " nk-d20-longo" : "";
  return `<span class="nk-d20 nk-d20-${estado}${longo}" style="--nk-d20-tam: ${Number(tamanho) || 96}px" role="img" aria-label="d20: ${esc(rotulo)}"><span class="nk-d20-borda"><span class="nk-d20-miolo"><span class="nk-d20-tri"><span></span></span><b>${esc(face ?? "?")}</b></span></span>${estado === "falha" ? `<span class="nk-d20-racha" aria-hidden="true"></span>` : ""}</span>`;
}

/**
 * Faixa de rolagem: d20 + partes = total (vs número, quando quem vê pode saber) + veredito.
 * opc: { face, faces (rolagens com Facilidade/Dificuldade, a usada marcada), estado, partes:[{rotulo, valor}],
 *        total, rotuloTotal, contra:{valor, rotulo}, veredito:{texto, sub, tom:"bom"|"ruim"|"neutro"},
 *        destaque (título grande: "CRÍTICO!"/"FALHA CRÍTICA"), regra (texto sob o destaque), anterior (face riscada) }
 */
export function naurenKitFaixa(opc = {}) {
  const estado = opc.estado ?? naurenKitEstadoD20(opc.face, { critMin: opc.critMin });
  const partes = (opc.partes ?? []).filter(p => p && (p.mostrarZero || (p.valor !== undefined && p.valor !== null && p.valor !== "" && Number(p.valor) !== 0)));
  const sinal = v => { const n = Number(v); return Number.isFinite(n) ? (n < 0 ? "−" : "+") : "+"; };
  const abs = v => { const n = Number(v); return Number.isFinite(n) ? Math.abs(n) : String(v).replace(/^[+-]/, ""); };
  const facesExtra = (opc.faces ?? []).length > 1
    ? `<div class="nk-faces">${opc.faces.map(f => `<span class="${f.usada ? "usada" : "descartada"}">${esc(f.face)}</span>`).join("")}<small>${esc(opc.modoTexto ?? "")}</small></div>` : "";
  const destaque = opc.destaque ?? (estado === "critico" ? "CRÍTICO!" : estado === "falha" ? "FALHA CRÍTICA" : "");
  const regra = opc.regra ?? "";
  const anterior = opc.anterior !== undefined && opc.anterior !== null
    ? `<div class="nk-anterior"><span>1ª rolagem</span><b>${esc(opc.anterior)}</b><span class="nk-seta" aria-hidden="true">→</span><span>rerolou com Destino</span></div>` : "";
  const contra = opc.contra
    ? `<span class="nk-op nk-vs">vs</span><div class="nk-parte"><div class="nk-contra">${esc(opc.contra.valor)}</div><small>${esc(opc.contra.rotulo ?? "")}</small></div>` : "";
  const veredito = opc.veredito
    ? `<div class="nk-veredito nk-tom-${opc.veredito.tom ?? "neutro"}"><b>${esc(opc.veredito.texto)}</b>${opc.veredito.sub ? `<span>${esc(opc.veredito.sub)}</span>` : ""}</div>` : "";
  return `<div class="nk-faixa nk-faixa-${estado}">
    ${destaque ? `<div class="nk-destaque">${esc(destaque)}</div>` : ""}
    ${anterior}
    <div class="nk-conta">
      ${opc.semDado ? "" : `<div class="nk-parte">${naurenKitD20(opc.face, estado === "normal" && opc.anterior !== undefined && opc.anterior !== null ? "rerolado" : estado)}<small>${estado === "critico" || estado === "falha" ? `${esc(opc.face)} natural` : esc(opc.rotuloDado ?? "dado (d20)")}</small>${facesExtra}</div>
      ${partes.map(p => `<span class="nk-op">${sinal(p.valor)}</span><div class="nk-parte"><b>${esc(abs(p.valor))}</b><small>${esc(p.rotulo)}</small></div>`).join("")}
      <span class="nk-op">=</span>`}
      <div class="nk-parte"><div class="nk-total">${esc(opc.total)}</div><small>${esc(opc.rotuloTotal ?? "total")}</small></div>
      ${contra}
    </div>
    ${regra ? `<div class="nk-regra">${regra}</div>` : ""}
    ${veredito}
    ${opc.nota ? `<div class="nk-nota">${opc.nota}</div>` : ""}
  </div>`;
}

/** Cabeçalho: quem → em quem, de onde vem, selo (P/I...). */
export function naurenKitCabecalho({ titulo = "", sub = "", selo = "", tom = "neutro", inicial = "" } = {}) {
  return `<div class="nk-cab nk-tom-${tom}">
    ${inicial ? `<div class="nk-avatar" aria-hidden="true">${esc(inicial)}</div>` : ""}
    <div class="nk-cab-texto"><div class="nk-cab-titulo">${titulo}</div>${sub ? `<div class="nk-cab-sub">${sub}</div>` : ""}</div>
    ${selo ? `<span class="nk-selo">${esc(selo)}</span>` : ""}
  </div>`;
}

/** Rótulo de seção. */
export function naurenKitSecao(texto, extra = "") {
  return `<div class="nk-secao">${esc(texto)}${extra ? ` <span>${extra}</span>` : ""}</div>`;
}

/** Chips de origem: [{texto, tipo:"buff"|"debuff"|""}] */
export function naurenKitChips(lista = []) {
  const itens = lista.filter(c => c && c.texto);
  return itens.length ? `<div class="nk-chips">${itens.map(c => `<span class="nk-chip ${c.tipo ? `nk-chip-${c.tipo}` : ""}">${esc(c.texto)}</span>`).join("")}</div>` : "";
}

/** Bloco por tipo de efeito (Ataque, Dano, Cura, Condição, Em você, Recurso, Área...). */
export function naurenKitBloco({ tipo = "ataque", rotulo = "", valor = "", detalhe = "", chips = [] } = {}) {
  const nomes = { ataque: "Ataque", dano: "Dano", cura: "Cura", condicao: "Condição", emvoce: "Em você", recurso: "Recurso", area: "Área", movimento: "Movimento", escudo: "Escudo", remover: "Remover", cria: "Cria", teste: "Teste" };
  return `<div class="nk-bloco nk-bloco-${tipo}">
    <span class="nk-tag">${esc(rotulo || nomes[tipo] || tipo)}</span>
    <div class="nk-bloco-corpo">${valor ? `<div class="nk-bloco-valor">${valor}</div>` : ""}${detalhe ? `<div class="nk-bloco-det">${detalhe}</div>` : ""}${naurenKitChips(chips)}</div>
  </div>`;
}

/**
 * Cartão de opção (rádio ou caixa de marcar): nome, custo em chip, o que acontece, chance.
 * { nome, valor, campo, tipo:"radio"|"checkbox", marcado, desabilitado, custo, desc, chance (0..100), aviso, fraco }
 */
export function naurenKitOpcao(o = {}) {
  const tipo = o.tipo ?? "radio";
  const chance = Number.isFinite(o.chance) ? `<div class="nk-chance"><div class="nk-chance-barra"><span style="width:${Math.max(0, Math.min(100, o.chance))}%"></span></div><small>${Math.round(o.chance)}% de chance</small></div>` : "";
  return `<label class="nk-opcao${o.fraco ? " nk-fraco" : ""}${o.desabilitado ? " nk-off" : ""}">
    <input type="${tipo}" name="${esc(o.campo)}" value="${esc(o.valor ?? "")}"${o.marcado ? " checked" : ""}${o.desabilitado ? " disabled" : ""}${o.extraAttr ? ` ${o.extraAttr}` : ""}>
    <span class="nk-opcao-corpo">
      <span class="nk-opcao-linha"><b class="nk-opcao-nome">${o.nome ?? ""}</b>${o.custo ? `<span class="nk-chip">${esc(o.custo)}</span>` : ""}${o.custoBom ? `<span class="nk-chip nk-chip-buff">${esc(o.custoBom)}</span>` : ""}</span>
      ${o.desc ? `<span class="nk-opcao-desc">${o.desc}</span>` : ""}
      ${o.aviso ? `<span class="nk-opcao-aviso">${o.aviso}</span>` : ""}
      ${chance}
      ${o.extra ?? ""}
    </span>
  </label>`;
}

/** Bloco do Dado de Destino (rerolagem 1 vez por ação). */
export function naurenKitDestino({ dados = 0, pode = true, motivo = "", custoExtra = "" } = {}) {
  const pips = Array.from({ length: Math.min(10, Math.max(0, dados)) }, () => `<span class="nk-pip"></span>`).join("");
  return `<div class="nk-destino${pode ? "" : " nk-destino-off"}">
    <div class="nk-destino-topo"><span class="nk-secao nk-secao-destino">Dado de Destino</span><span class="nk-chip nk-chip-destino">1 vez por ação</span></div>
    ${pode ? `<div class="nk-destino-texto">Rolar o d20 de novo custa <b>1 Dado de Destino</b>${custoExtra ? ` ${custoExtra}` : ""}. Depois disso, o resultado fica.</div>`
      : `<div class="nk-destino-texto">${motivo}</div>`}
    <div class="nk-destino-pips">Você tem ${pips} <b>${dados}</b></div>
  </div>`;
}

/** Cartão de Condição (o que ela faz e acúmulos). */
export function naurenKitCondicao({ nome = "", acumulos = 1, texto = "", img = "" } = {}) {
  return `<div class="nk-condicao">
    ${img ? `<img src="${esc(img)}" alt="">` : `<div class="nk-condicao-icone" aria-hidden="true"></div>`}
    <div><small>Condição</small><div class="nk-condicao-nome">${esc(nome)}${acumulos > 1 ? ` ×${acumulos}` : ""}</div>${texto ? `<div class="nk-condicao-texto">${texto}</div>` : ""}</div>
  </div>`;
}

/** Oferta de gatilho: por que apareceu + o que faz + usos. */
export function naurenKitOferta({ porque = "", oQueFaz = "", usos = "" } = {}) {
  return `<div class="nk-oferta">
    ${porque ? `<div class="nk-oferta-porque">${porque}</div>` : ""}
    ${oQueFaz ? `<div class="nk-oferta-faz">${oQueFaz}</div>` : ""}
    ${usos ? `<div class="nk-oferta-usos">${usos}</div>` : ""}
  </div>`;
}

/** Linha de nota discreta. */
export function naurenKitNota(texto) { return texto ? `<p class="nk-nota">${texto}</p>` : ""; }

/**
 * 0.95.1: barra de Vida que mostra quanto o dano escolhido tira (atualiza ao trocar de opção:
 * cada rádio com data-dano="N" e, opcional, data-dano-rotulo). Se a Vida chegar a 0, ganha destaque.
 */
export function naurenKitVidaDano({ vida = 0, max = 0, escudo = 0, dano = 0, rotulo = "" } = {}) {
  return `<div class="nk-vidadano" data-vida="${Number(vida) || 0}" data-max="${Number(max) || 0}" data-escudo="${Number(escudo) || 0}">
    <div class="nk-vidadano-topo"><span class="nk-vidadano-titulo">Sua Vida</span><span class="nk-vidadano-rotulo">${esc(rotulo)}</span></div>
    <div class="nk-vidadano-barra" aria-hidden="true"><i class="nk-vd-fica"></i><b class="nk-vd-perde"></b><u class="nk-vd-escudo"></u></div>
    <div class="nk-vidadano-numeros"><span class="nk-vd-conta"></span><span class="nk-vd-perda"></span></div>
    <div class="nk-vidadano-alerta">Com este dano a sua Vida chega a 0</div>
  </div>`;
}

/** Atualiza a barra de Vida pelo rádio marcado (chamar no render e a cada "change"). */
export function naurenKitAtualizarVidaDano(raiz) {
  const box = raiz?.querySelector?.(".nk-vidadano");
  if (!box) return;
  const vida = Number(box.dataset.vida) || 0, max = Math.max(1, Number(box.dataset.max) || vida || 1), escudo = Number(box.dataset.escudo) || 0;
  const marcado = [...raiz.querySelectorAll('input[name="reacaoDano"]')].find(i => i.checked);
  const dano = Math.max(0, Number(marcado?.dataset?.dano ?? box.dataset.danoPadrao ?? 0) || 0);
  const noEscudo = Math.min(escudo, dano), naVida = Math.min(vida, dano - noEscudo);
  const fica = Math.max(0, vida - naVida);
  const pct = n => `${Math.max(0, Math.min(100, 100 * n / max))}%`;
  box.querySelector(".nk-vd-fica").style.width = pct(fica);
  box.querySelector(".nk-vd-perde").style.width = pct(naVida);
  box.querySelector(".nk-vd-escudo").style.width = pct(Math.max(0, escudo - noEscudo));
  box.querySelector(".nk-vd-conta").innerHTML = `<b>${vida}</b> → <b class="nk-vd-final">${fica}</b> / ${max}`;
  const sobra = dano - noEscudo - naVida;
  box.querySelector(".nk-vd-perda").textContent = dano ? `−${naVida} PV${noEscudo ? ` (e −${noEscudo} no Escudo)` : ""}${sobra > 0 ? ` · dano ${dano}` : ""}` : "não perde Vida";
  const rot = marcado?.dataset?.danoRotulo ?? "";
  box.querySelector(".nk-vidadano-rotulo").textContent = rot;
  box.classList.toggle("nk-vd-morre", dano > 0 && fica <= 0);
  box.classList.toggle("nk-vd-baixa", fica > 0 && fica <= max * 0.25);
}
