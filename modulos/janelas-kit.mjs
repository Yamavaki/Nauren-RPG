/* Nauren RPG — Kit das janelas de Ação e Reação (0.95).
 * Peças de HTML usadas por todas as janelas que aparecem ao usar uma Ação ou ao reagir:
 * cabeçalho, faixa de rolagem (d20 com destaque de 20 e 1 natural), blocos por tipo de efeito,
 * cartões de opção, cartão de Condição, oferta de gatilho e ajustes pontuais.
 * As janelas são montadas uma vez (DialogV2) e nunca se redesenham sozinhas; o visual é adaptativo
 * (styles/nauren.css, prefixo "nk-"). Funções puras: só montam texto HTML. */

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));

/** Classes e tamanho padrão de toda janela do kit (passar no DialogV2). */
export const NAUREN_KIT_JANELA = { classes: ["nauren-kit"], position: { width: 540 } };

/** Estado do d20 a partir da face: "critico" (20), "falha" (1) ou "normal". */
export function naurenKitEstadoD20(face, { critMin = 20 } = {}) {
  if (face === null || face === undefined) return "normal";
  if (Number(face) === 1) return "falha";
  if (Number(face) >= Number(critMin || 20)) return "critico";
  return "normal";
}

/** Dado d20 desenhado (SVG). estado: normal | critico | falha | rerolado. */
export function naurenKitD20(face, estado = "normal", tamanho = 96) {
  const cores = {
    normal: { fundo: "#2d2440", borda: "#8f82a8", linha: "#5c4f78", tri: "none", txt: "#f4eefc" },
    critico: { fundo: "#e0b257", borda: "#fff1c9", linha: "#a87a26", tri: "#f0c56a", txt: "#2a1a05" },
    falha: { fundo: "#3a1d22", borda: "#c2474f", linha: "#6e2c33", tri: "none", txt: "#ffd0d3" },
    rerolado: { fundo: "#33244a", borda: "#c9a2f2", linha: "#7a4fa8", tri: "none", txt: "#f4eefc" }
  }[estado] ?? {};
  const rotulo = estado === "critico" ? `${face} natural (crítico)` : estado === "falha" ? `${face} natural (falha crítica)` : `${face}`;
  const fs = String(face ?? "?").length > 1 ? 32 : 36;
  return `<svg class="nk-d20 nk-d20-${estado}" width="${tamanho}" height="${tamanho}" viewBox="0 0 120 120" role="img" aria-label="d20: ${esc(rotulo)}">
    ${estado === "critico" ? `<circle cx="60" cy="60" r="58" fill="rgba(255,200,90,.14)"/>` : ""}
    <polygon points="60,4 110,32 110,88 60,116 10,88 10,32" fill="${cores.fundo}" stroke="${cores.borda}" stroke-width="3"/>
    <polygon points="60,30 96,86 24,86" fill="${cores.tri}" stroke="${cores.linha}" stroke-width="2"/>
    <line x1="60" y1="4" x2="60" y2="30" stroke="${cores.linha}" stroke-width="2"/><line x1="110" y1="88" x2="96" y2="86" stroke="${cores.linha}" stroke-width="2"/><line x1="10" y1="88" x2="24" y2="86" stroke="${cores.linha}" stroke-width="2"/>
    ${estado === "falha" ? `<polyline points="98,30 90,44 100,54 92,68" fill="none" stroke="#ff9aa1" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>` : ""}
    <text x="60" y="66" text-anchor="middle" dominant-baseline="central" font-family="Signika, sans-serif" font-weight="700" font-size="${fs}" fill="${cores.txt}">${esc(face ?? "?")}</text>
  </svg>`;
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
