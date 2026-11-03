/* Nauren RPG — Chat no estilo do sistema (0.99.2).
 *
 * Tudo é feito no hook oficial renderChatMessageHTML (V14), sem trocar o template do Foundry:
 * - mensagem com card do sistema: o <li> do Foundry fica transparente; nome/hora/lixeira viram uma
 *   linha pequena em cima do card (sempre visível), com o selo de sussurro/rolagem cega;
 * - fala (IC), fora do jogo (OOC), emote (/me), sussurro (/w), rolagens do Foundry (/r, /gmr, /br, /sr),
 *   sorteio de tabela e rolagens no texto ([[1d6]]): retrato + balão chanfrado nas cores do personagem;
 * - mensagens seguidas da mesma pessoa (até 5 min) se agrupam: o retrato e o nome só na primeira;
 * - balão em cima do token (ChatBubbles): chanfrado nas cores do personagem.
 * Opção do mundo "Chat no estilo Nauren" liga e desliga tudo.
 */
import { naurenAtorDoCard, naurenEstiloDoCard } from "../nauren.mjs";

const SELETOR_CARD = ".nauren-roll-card, .nauren-aviso-chat, .nauren-deflexao-card";
const AGRUPAR_MS = 5 * 60 * 1000;
const ESC = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));

function ligado() { try { return game.settings.get("nauren", "chatNauren") !== false; } catch (err) { return true; } }
const ESTILOS = () => globalThis.CONST?.CHAT_MESSAGE_STYLES ?? { OTHER: 0, OOC: 1, IC: 2, EMOTE: 3 };

/** Tipo da mensagem para o visual. */
function tipoDa(message, html) {
  if (html.querySelector(SELETOR_CARD)) return "card";
  const st = message.style ?? message._source?.style;
  const E = ESTILOS();
  if (st === E.EMOTE) return "emote";
  if (message.isRoll || html.querySelector(".dice-roll")) return "rolagem";
  if (html.querySelector(".table-draw")) return "tabela";
  if (st === E.OOC) return "ooc";
  const ator = ChatMessage.implementation?.getSpeakerActor?.(message.speaker) ?? null;
  if (st === E.IC || ator || message.speaker?.token) return "fala";
  return "ooc";
}
function autorDe(message) { return message.author ?? message.user ?? game.users?.get?.(message._source?.author ?? message._source?.user) ?? null; }
function retratoDe(message, tipo) {
  const ator = ChatMessage.implementation?.getSpeakerActor?.(message.speaker) ?? null;
  if (tipo !== "ooc" && message.speaker?.token) {
    try {
      const cena = game.scenes?.get?.(message.speaker.scene) ?? canvas?.scene;
      const tk = cena?.tokens?.get?.(message.speaker.token);
      const src = tk?.texture?.src;
      if (src) return src;
    } catch (err) { /* segue */ }
  }
  if (tipo !== "ooc" && ator?.img) return ator.img;
  return autorDe(message)?.avatar || "icons/svg/mystery-man.svg";
}
function chaveGrupo(message, tipo) {
  if (!["fala", "ooc", "emote"].includes(tipo)) return null;
  const autor = autorDe(message);
  const w = [...(message.whisper ?? [])].sort().join(",");
  return `${autor?.id ?? "?"}|${tipo === "ooc" ? "ooc" : (message.speaker?.alias ?? "")}|${tipo === "ooc" ? "ooc" : "ic"}|${w}`;
}
/** A mensagem anterior (visível) é da mesma pessoa, do mesmo jeito, há menos de 5 min? */
function continuaDaAnterior(message, tipo) {
  const chave = chaveGrupo(message, tipo);
  if (!chave || tipo === "emote") return false;
  const lista = game.messages?.contents ?? [];
  let i = lista.indexOf(message);
  if (i < 0) i = lista.length; // ainda entrando
  for (let k = i - 1; k >= 0; k--) {
    const ant = lista[k];
    if (ant.visible === false) continue;
    const dt = (message.timestamp ?? Date.now()) - (ant.timestamp ?? 0);
    if (dt > AGRUPAR_MS || dt < 0) return false;
    const antTipo = ant._naurenTipo ?? (ant.content && /nauren-roll-card|nauren-aviso-chat|nauren-deflexao-card/.test(ant.content) ? "card" : (ant.isRoll ? "rolagem" : null));
    return chaveGrupo(ant, antTipo ?? tipoBasico(ant)) === chave;
  }
  return false;
}
function tipoBasico(m) {
  const E = ESTILOS(), st = m.style ?? m._source?.style;
  if (st === E.EMOTE) return "emote";
  if (m.isRoll) return "rolagem";
  if (st === E.OOC) return "ooc";
  return (st === E.IC || m.speaker?.actor || m.speaker?.token) ? "fala" : "ooc";
}

/** Dados de d20 natural nesta rolagem: "crit" (20), "falha" (1) ou "". */
function d20Natural(message) {
  try {
    for (const r of message.rolls ?? []) for (const d of r.dice ?? []) {
      if (d.faces !== 20) continue;
      const ativos = (d.results ?? []).filter(x => x.active !== false);
      if (ativos.length !== 1) continue;
      if (ativos[0].result === 20) return "crit";
      if (ativos[0].result === 1) return "falha";
    }
  } catch (err) { /* segue */ }
  return "";
}

function aplicar(message, html) {
  if (!html?.querySelector || !ligado()) return;
  if (html.classList.contains("ncc")) return; // já montada
  const tipo = tipoDa(message, html);
  message._naurenTipo = tipo;
  const ehSussurro = (message.whisper?.length ?? 0) > 0;
  html.classList.add("ncc", `ncc-${tipo}`);
  if (ehSussurro) html.classList.add("ncc-sussurro");
  if (message.blind) html.classList.add("ncc-cega");
  const cab = html.querySelector(".message-header");
  const meta = html.querySelector(".message-metadata");
  const autor = autorDe(message);

  // Selos (sussurro / cega) ao lado da hora.
  if (meta && (ehSussurro || message.blind)) {
    const selo = document.createElement("span");
    selo.className = "ncc-selo";
    const para = html.querySelector(".whisper-to")?.textContent?.replace(/^[^:]*:\s*/, "") ?? "";
    selo.innerHTML = message.blind ? `<i class="fas fa-eye-slash"></i> cega` : `<i class="fas fa-lock"></i> ${ESC(para) || "sussurro"}`;
    selo.title = message.blind ? "Rolagem cega: só o Mestre vê o resultado" : `Sussurro${para ? ` para ${para}` : ""}`;
    meta.prepend(selo);
  }

  if (tipo === "card") {
    // Só o nosso card: a linha do Foundry fica fina, em cima, com nome · hora · lixeira.
    if (cab) cab.classList.add("ncc-linha");
    return;
  }

  // Cores de quem fala (fora do jogo: cores do sistema).
  const ator = tipo === "ooc" ? null : (naurenAtorDoCard(message) ?? null);
  const { estilo, escuro } = naurenEstiloDoCard(ator);
  html.style.cssText += estilo;
  html.classList.toggle("ncc-escuro", !!escuro);
  if (autor?.color) html.style.setProperty("--ncc-jogador", autor.color.css ?? String(autor.color));

  // Um card só: retrato pequeno no cabeçalho (nome · jogador · hora/lixeira numa linha) e o texto embaixo, na largura toda.
  const nome = cab?.querySelector(".message-sender");
  if (cab) {
    const img = document.createElement("img");
    img.className = "ncc-av"; img.alt = ""; img.src = retratoDe(message, tipo);
    cab.prepend(img);
    const quem = document.createElement("span");
    quem.className = "ncc-quem";
    if (nome) quem.appendChild(nome);
    if (autor) {
      const rotuloTipo = tipo === "ooc" && !autor.isGM ? "fora do jogo" : "";
      if (tipo === "ooc" && autor.isGM) html.classList.add("ncc-mestre");
      const mostrarJog = autor.name && autor.name !== (nome?.textContent ?? "").trim();
      const jog = document.createElement("span");
      jog.className = "ncc-jogador";
      jog.innerHTML = `${mostrarJog ? `<i style="background:${ESC(autor.color?.css ?? autor.color ?? "#888")}"></i>${ESC(autor.name)}` : ""}${rotuloTipo ? `<b>${rotuloTipo}</b>` : ""}`;
      if (jog.innerHTML) quem.appendChild(jog);
    }
    img.after(quem);
  }
  if (tipo === "emote") {
    const txt = html.querySelector(".message-content")?.textContent?.trim() ?? "";
    const alias = message.speaker?.alias ?? "";
    if (alias && !txt.startsWith(alias)) html.querySelector(".message-content")?.insertAdjacentHTML("afterbegin", `<b class="ncc-emote-nome">${ESC(alias)}</b> `);
  }
  if (tipo === "rolagem") {
    const nat = d20Natural(message);
    if (nat) html.classList.add(nat === "crit" ? "ncc-crit" : "ncc-falha");
    html.querySelectorAll(".dice-tooltip").forEach(t => t.classList.add("expanded", "ncc-aberto"));
    html.querySelectorAll(".dice-rolls").forEach(organizarDados);
    // Um dado só e sem bônus (ex.: /r 1d20 = 8): o quadradinho repetiria o total.
    html.querySelectorAll(".dice-roll").forEach(dr => {
      const ds = dr.querySelectorAll("li.roll"), tot = dr.querySelector(".dice-total")?.textContent?.trim();
      if (ds.length === 1 && tot && ds[0].textContent.trim() === tot && !dr.closest(".ncc-crit, .ncc-falha")) dr.classList.add("ncc-so-total");
    });
  }
  if (continuaDaAnterior(message, tipo)) {
    // Continuação: encosta na mensagem de cima e vira uma faixa do mesmo card.
    html.classList.add("ncc-cont");
    const ligar = () => { const ant = html.previousElementSibling; if (ant?.classList?.contains("ncc")) ant.classList.add("ncc-segue"); };
    requestAnimationFrame(ligar); setTimeout(ligar, 120);
  }
}

/* ---------- dados: poucos, muitos e montes ----------
   Até 10 dados: quadrados normais. De 11 a 40: quadrados menores, na largura toda.
   Mais de 40: um resumo (quantos saíram de cada face, ou máximos/mínimos em dados grandes) e
   "ver todos os N dados" para abrir a lista. */
function organizarDados(ol) {
  const dados = [...ol.querySelectorAll("li.roll")];
  const n = dados.length;
  const parte = ol.closest(".tooltip-part") ?? ol.parentElement;
  parte?.classList.add(n <= 10 ? "ncc-poucos" : n <= 40 ? "ncc-muitos" : "ncc-montes");
  if (n <= 40 || ol.dataset.ncc) return;
  ol.dataset.ncc = "1";
  const faces = Number((dados[0]?.className.match(/\bd(\d+)\b/) ?? [])[1]) || 0;
  const ativos = dados.filter(d => !d.classList.contains("discarded") && !d.classList.contains("rerolled"));
  const valores = ativos.map(d => Number(d.textContent) || 0);
  const soma = valores.reduce((a, b) => a + b, 0);
  const media = valores.length ? (soma / valores.length).toFixed(1).replace(".", ",") : "0";
  const max = dados.filter(d => d.classList.contains("max")).length, min = dados.filter(d => d.classList.contains("min")).length;
  const resumo = document.createElement("div");
  resumo.className = "ncc-resumo-dados";
  let corpo = "";
  if (faces && faces <= 20) {
    // Quantos saíram de cada face: uma coluna por face.
    const cont = Array.from({ length: faces }, () => 0);
    for (const v of valores) if (v >= 1 && v <= faces) cont[v - 1]++;
    const maior = Math.max(1, ...cont);
    corpo = `<div class="ncc-faces" style="--faces:${faces}">${cont.map((c, i) => `<div class="ncc-face ${i + 1 === faces ? "max" : i === 0 ? "min" : ""}" title="${c}× o ${i + 1}"><i style="--h:${Math.round(c / maior * 100)}%"></i><b>${c}</b><span>${i + 1}</span></div>`).join("")}</div>`;
  }
  resumo.innerHTML = `<div class="ncc-resumo-linha"><span><b>${n}</b> dados</span><span>média <b>${media}</b></span>${max ? `<span class="ncc-r-max"><b>${max}</b> no máximo</span>` : ""}${min ? `<span class="ncc-r-min"><b>${min}</b> no mínimo</span>` : ""}</div>${corpo}`;
  const det = document.createElement("details");
  det.className = "ncc-todos-dados";
  det.innerHTML = `<summary>ver todos os ${n} dados</summary>`;
  ol.before(resumo);
  ol.before(det);
  det.appendChild(ol);
}

/* ---------- balão em cima do token ---------- */
function pintarBalao(el) {
  try {
    if (!ligado() || !el?.classList?.contains?.("chat-bubble") || el.dataset.ncc) return;
    document.body.classList.add("ncc-chat");
    el.dataset.ncc = "1";
    const id = el.dataset.tokenId ?? (String(el.id ?? "").match(/[A-Za-z0-9]{16}/)?.[0]);
    const tk = id ? canvas?.tokens?.get?.(id) : null;
    const { estilo, escuro } = naurenEstiloDoCard(tk?.actor ?? null);
    el.style.cssText += estilo;
    el.classList.add("ncc-bolha");
    el.classList.toggle("ncc-escuro", !!escuro);
  } catch (err) { /* o balão segue o padrão do Foundry */ }
}
function observarBaloes() {
  const obs = new MutationObserver(lista => {
    for (const m of lista) for (const n of m.addedNodes) {
      if (n.nodeType !== 1) continue;
      if (n.classList.contains("chat-bubble")) pintarBalao(n);
      else n.querySelectorAll?.(".chat-bubble").forEach(pintarBalao);
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

/* ---------- balão próprio: surge em cima do token, fica parado e some ----------
   O balão do Foundry rola o texto longo dentro de uma caixa de altura fixa e se mede antes do nosso estilo.
   Com a opção ligada, o sistema desenha o balão: centralizado exatamente em cima do token, com o texto todo,
   parado por um tempo que cresce com o tamanho do texto, e sai em fade. Segue o token se ele andar. */
const baloes = new Map(); // tokenId → { el, token, timer }
function camadaBaloes() {
  const hud = document.getElementById("hud");
  if (!hud) return null;
  let c = document.getElementById("ncc-baloes");
  if (!c) { c = document.createElement("div"); c.id = "ncc-baloes"; hud.appendChild(c); }
  return c;
}
function posicionarBalao(b) {
  const t = b.token;
  if (!t?.document || t.destroyed) return;
  const d = t.document, g = canvas.grid?.size || canvas.dimensions?.size || 100;
  const w = (Number(d.width) || 1) * g;
  const x = (Number(d.x) || 0) + w / 2;
  const y = Number(d.y) || 0;
  const zoom = canvas.stage?.scale?.x || 1;
  const escala = Math.min(2.6, Math.max(1, 1 / zoom)); // de longe o texto continua legível
  b.el.style.left = `${x}px`;
  b.el.style.top = `${y}px`;
  b.el.style.setProperty("--ncc-escala", escala);
}
function tempoDoBalao(texto) {
  const n = String(texto ?? "").replace(/<[^>]*>/g, "").trim().length;
  return Math.min(16000, Math.max(3500, 2200 + n * 55));
}
async function naurenBalao(token, mensagem, opcoes = {}) {
  const tk = token?.object ?? token; // TokenDocument ou Token
  if (!tk?.document) return null;
  if (opcoes.requireVisible && !tk.visible) return null;
  const camada = camadaBaloes();
  if (!camada) return null;
  const antigo = baloes.get(tk.id);
  if (antigo) { clearTimeout(antigo.timer); antigo.el.remove(); baloes.delete(tk.id); }
  const el = document.createElement("div");
  el.className = `ncc-bolha2 ${opcoes.cssClasses?.join?.(" ") ?? ""}`;
  el.dataset.tokenId = tk.id;
  el.innerHTML = `<div class="ncc-bolha2-caixa"><div class="ncc-bolha2-texto">${mensagem}</div></div>`;
  const { estilo, escuro } = naurenEstiloDoCard(tk.actor ?? null);
  el.style.cssText += estilo;
  el.classList.toggle("ncc-escuro", !!escuro);
  camada.appendChild(el);
  const b = { el, token: tk, timer: null };
  baloes.set(tk.id, b);
  posicionarBalao(b);
  requestAnimationFrame(() => el.classList.add("ncc-entra"));
  if (opcoes.pan && tk.center) canvas.animatePan?.({ x: tk.center.x, y: tk.center.y, duration: 500 });
  b.timer = setTimeout(() => {
    el.classList.add("ncc-sai");
    setTimeout(() => { el.remove(); if (baloes.get(tk.id) === b) baloes.delete(tk.id); }, 450);
  }, tempoDoBalao(mensagem));
  return el;
}
function instalarBalaoProprio() {
  const CB = foundry.canvas?.animation?.ChatBubbles;
  if (!CB?.prototype?.say || CB.prototype._naurenSay) return;
  const original = CB.prototype.say;
  CB.prototype._naurenSay = original;
  CB.prototype.say = async function (token, message, options = {}) {
    if (!ligado()) return original.call(this, token, message, options);
    try { return await naurenBalao(token, message, options); }
    catch (err) { console.warn("Nauren RPG | balão", err); return original.call(this, token, message, options); }
  };
  const reposicionar = () => { for (const b of baloes.values()) posicionarBalao(b); };
  Hooks.on("refreshToken", t => { const b = baloes.get(t.id); if (b) posicionarBalao(b); });
  Hooks.on("canvasPan", reposicionar);
  Hooks.on("canvasTearDown", () => { for (const b of baloes.values()) { clearTimeout(b.timer); b.el.remove(); } baloes.clear(); });
}

/** Refaz os grupos depois que uma mensagem some (a de baixo vira a primeira do grupo e ganha o nome de volta). */
function regruparChat() {
  for (const raiz of document.querySelectorAll("#chat-log, .chat-log, #chat-notifications, .chat-popout")) {
    const lis = [...raiz.querySelectorAll("li.chat-message.ncc[data-message-id]")];
    lis.forEach((li, i) => {
      const m = game.messages?.get?.(li.dataset.messageId);
      if (!m) return;
      const tipo = m._naurenTipo ?? tipoBasico(m);
      const cont = continuaDaAnterior(m, tipo) && lis[i - 1]?.classList.contains("ncc") && !lis[i - 1]?.classList.contains("ncc-card");
      li.classList.toggle("ncc-cont", !!cont);
    });
    lis.forEach((li, i) => li.classList.toggle("ncc-segue", !!lis[i + 1]?.classList.contains("ncc-cont")));
  }
}
Hooks.on("deleteChatMessage", () => { setTimeout(regruparChat, 60); setTimeout(regruparChat, 450); });

function naurenChatInit() {
  game.settings.register("nauren", "chatNauren", {
    name: "Chat no estilo Nauren",
    hint: "Mensagens, rolagens do Foundry, sussurros e o balão em cima do token no visual do sistema, nas cores de cada personagem. Desligue se usar um módulo que muda o chat.",
    scope: "world", config: true, type: Boolean, default: true,
    onChange: () => { try { ui.chat?.render?.(); } catch (err) { /* segue */ } }
  });
}

Hooks.on("renderChatMessageHTML", (message, html) => { try { aplicar(message, html); } catch (err) { console.warn("Nauren RPG | chat", err); } });
Hooks.once("ready", () => { try { if (ligado()) document.body.classList.add("ncc-chat"); observarBaloes(); instalarBalaoProprio(); } catch (err) { console.warn("Nauren RPG | balões", err); } });

export { regruparChat as naurenChatRegrupar, naurenChatInit, pintarBalao as naurenChatPintarBalao, naurenBalao as naurenChatBalao };
