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
  }
  if (continuaDaAnterior(message, tipo)) {
    // Continuação: encosta na mensagem de cima e vira uma faixa do mesmo card.
    html.classList.add("ncc-cont");
    const ligar = () => { const ant = html.previousElementSibling; if (ant?.classList?.contains("ncc")) ant.classList.add("ncc-segue"); };
    requestAnimationFrame(ligar); setTimeout(ligar, 120);
  }
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

function naurenChatInit() {
  game.settings.register("nauren", "chatNauren", {
    name: "Chat no estilo Nauren",
    hint: "Mensagens, rolagens do Foundry, sussurros e o balão em cima do token no visual do sistema, nas cores de cada personagem. Desligue se usar um módulo que muda o chat.",
    scope: "world", config: true, type: Boolean, default: true,
    onChange: () => { try { ui.chat?.render?.(); } catch (err) { /* segue */ } }
  });
}

Hooks.on("renderChatMessageHTML", (message, html) => { try { aplicar(message, html); } catch (err) { console.warn("Nauren RPG | chat", err); } });
Hooks.once("ready", () => { try { if (ligado()) document.body.classList.add("ncc-chat"); observarBaloes(); } catch (err) { console.warn("Nauren RPG | balões", err); } });

export { naurenChatInit, pintarBalao as naurenChatPintarBalao };
