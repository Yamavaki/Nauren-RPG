/* Nauren RPG — Arte do personagem ao passar o mouse no token (0.100).
 *
 * Camada fixa da tela (não depende do zoom do mapa), no canto escolhido pelo Mestre (ou pelo jogador),
 * desviando do carrossel de turnos, da HUD de combate, da barra das cenas, das ferramentas e da lista de jogadores.
 * Arte retangular/quadrada opaca: moldura do sistema nas cores do personagem. Arte recortada (fundo transparente)
 * ou redonda: sem moldura, só sombra. Nome sempre (ou "Desconhecido" quando o Mestre oculta o nome).
 * Qual imagem: arte escolhida pelo Mestre na ficha → imagem da Transformação/Condição ativa → arte do ator →
 * imagem do token. "Mostrar a todos" pelo Mestre (botão no HUD do token e atalho), via CONFIG.queries.
 */
import { naurenEstiloDoCard } from "../nauren.mjs";

const QUERY_MOSTRAR = "nauren.mostrarArte";
const PADRAO = "icons/svg/mystery-man.svg";
const VIDEO = /\.(webm|mp4|m4v|ogg|ogv)(\?|$)/i;
const NOME_OCULTO = "Desconhecido";
const ESC = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
const cfg = (k, padrao) => { try { const v = game.settings.get("nauren", k); return v ?? padrao; } catch (err) { return padrao; } };

/* ---------- nome ---------- */
/** O nome que este usuário vê para o token (o Mestre sempre vê o nome de verdade). */
function naurenNomeVisivel(token, user = game.user) {
  const doc = token?.document ?? token;
  const nome = doc?.name ?? token?.actor?.name ?? "";
  if (user?.isGM) return nome;
  return naurenNomeOculto(token) ? NOME_OCULTO : nome;
}
function naurenNomeOculto(token) {
  const a = token?.actor ?? token?.document?.actor ?? null;
  return !!(a?.getFlag?.("nauren", "ocultarNome") ?? a?.flags?.nauren?.ocultarNome);
}

/* ---------- qual imagem ---------- */
function imagemDaArte(token) {
  const a = token.actor, doc = token.document;
  const fl = a?.flags?.nauren ?? {};
  if (fl.arteMoldura) return fl.arteMoldura;
  // Transformação (Condição/Efeito): usa a imagem da transformação.
  const tr = fl.transformacaoAtiva;
  if (tr) {
    const it = a.items?.get?.(tr.itemId);
    const img = it?.system?.transformacaoImagem || doc?.texture?.src;
    if (img && img !== PADRAO) return img;
  }
  const tokenProprio = !doc?.actorLink || a?.prototypeToken?.randomImg;
  const imgAtor = a?.img && a.img !== PADRAO ? a.img : "";
  const imgToken = doc?.texture?.src && doc.texture.src !== PADRAO ? doc.texture.src : "";
  // Token não ligado com imagem própria diferente do protótipo (ex.: 3 goblins diferentes): a do token.
  if (tokenProprio && imgToken && imgToken !== (a?.prototypeToken?.texture?.src ?? "")) return imgToken;
  return imgAtor || imgToken || "";
}

/* ---------- moldura ou recorte (lê a transparência numa cópia 64×64) ---------- */
const analises = new Map(); // src → Promise<{ w, h, recorte }>
function analisar(src) {
  if (analises.has(src)) return analises.get(src);
  const p = new Promise(resolve => {
    if (VIDEO.test(src)) {
      const v = document.createElement("video");
      v.muted = true; v.preload = "metadata";
      v.onloadedmetadata = () => resolve({ w: v.videoWidth || 400, h: v.videoHeight || 400, recorte: false });
      v.onerror = () => resolve(null);
      v.src = src; return;
    }
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const w = img.naturalWidth || 1, h = img.naturalHeight || 1;
      let recorte = false;
      try {
        const N = 64, c = document.createElement("canvas"); c.width = N; c.height = N;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, N, N);
        const d = ctx.getImageData(0, 0, N, N).data;
        const a = (x, y) => d[(y * N + x) * 4 + 3];
        let borda = 0, transp = 0;
        for (let i = 0; i < N; i++) for (const [x, y] of [[i, 0], [i, N - 1], [0, i], [N - 1, i]]) { borda++; if (a(x, y) < 40) transp++; }
        const cantos = [a(1, 1), a(N - 2, 1), a(1, N - 2), a(N - 2, N - 2)].filter(v => v < 40).length;
        recorte = transp / borda > 0.06 || cantos >= 3;
      } catch (err) { recorte = false; } // imagem de outro site sem permissão: assume moldura
      resolve({ w, h, recorte });
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
  analises.set(src, p);
  return p;
}

/* ---------- quem vê ---------- */
function podeVer(token, forcado = false) {
  if (!token?.actor || token.isPreview) return false;
  if (game.modules?.get?.("image-hover")?.active) return false; // o módulo já faz isso: não mostra duas imagens
  const a = token.actor, gm = game.user.isGM;
  if (!forcado && !cfg("arteHoverLigado", true)) return false;
  if (gm) return true;
  if (token.document?.hidden || token.visible === false) return false;
  if (a.flags?.nauren?.ocultarArte && !forcado) return false;
  if (forcado) return true;
  const ehPj = a.type === "personagem" || a.hasPlayerOwner;
  if (ehPj) return true;
  const regra = cfg("arteHoverPnj", "todos");
  if (regra === "mestre") return false;
  if (regra === "limitado") return a.testUserPermission?.(game.user, "LIMITED") ?? false;
  return true;
}

/* ---------- posição ---------- */
const TAMANHOS = { pequeno: [0.26, 0.12], medio: [0.34, 0.15], grande: [0.44, 0.2] };
function retangulo(sel) {
  const el = typeof sel === "string" ? document.querySelector(sel) : sel;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  const st = getComputedStyle(el);
  if (st.display === "none" || st.visibility === "hidden" || Number(st.opacity) === 0) return null;
  return { x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom };
}
const cruza = (a, b) => a && b && a.x < b.r && a.x + a.w > b.x && a.y < b.b && a.y + a.h > b.y;
function obstaculos() {
  const sel = "#nauren-carrossel .nauren-car-raiz, #nauren-carrossel, #nauren-hud-combate .nauren-hud-raiz, #nauren-hud-combate, #scene-navigation, #navigation, #scene-controls, #controls, #players, #hotbar, #chat-notifications, #nauren-token-tooltip.visivel";
  return [...document.querySelectorAll(sel)].map(retangulo).filter(Boolean);
}
/** Primeiro elemento visível entre os que casam com o seletor. */
function primeiroVisivel(sel) { for (const e of document.querySelectorAll(sel)) { const r = retangulo(e); if (r) return r; } return null; }
/** Onde a arte fica (px da tela) para uma arte w×h. */
function calcularPosicao(w, h, posicao, token) {
  const vw = window.innerWidth, vh = window.innerHeight, m = 12;
  const lado = primeiroVisivel("#sidebar");
  const direita = lado ? lado.x - m : vw - m;
  const ctrl = primeiroVisivel("#scene-controls, #controls");
  const esquerda = (ctrl ? ctrl.r : 0) + m;
  const obs = obstaculos();
  let x, y, desce = true;
  if (posicao === "token" && token) {
    const p = pontoNaTela(token);
    const espacoDir = direita - p.r, espacoEsq = p.x - esquerda;
    x = espacoDir >= w + m || espacoDir >= espacoEsq ? p.r + m : p.x - m - w;
    y = Math.max(m, Math.min(vh - m - h, p.y + p.h / 2 - h / 2));
  } else {
    const dir = posicao.endsWith("dir");
    desce = posicao.startsWith("sup");
    x = dir ? direita - w : esquerda;
    y = desce ? m : vh - m - h;
  }
  // Empurra para baixo (cantos de cima) ou para cima (cantos de baixo) até não cobrir nada.
  for (let i = 0; i < 8; i++) {
    const caixa = { x, y, w, h };
    const bate = obs.filter(o => cruza(caixa, o));
    if (!bate.length) break;
    if (desce) y = Math.max(...bate.map(o => o.b)) + 10;
    else y = Math.min(...bate.map(o => o.y)) - 10 - h;
  }
  x = Math.max(m, Math.min(vw - m - w, x));
  y = Math.max(m, Math.min(vh - m - h, y));
  return { x: Math.round(x), y: Math.round(y) };
}
function pontoNaTela(token) {
  try {
    const t = canvas.stage.worldTransform, r = canvas.app.view.getBoundingClientRect();
    const a = t.apply(new PIXI.Point(token.x, token.y)), b = t.apply(new PIXI.Point(token.x + token.w, token.y + token.h));
    return { x: a.x + r.left, y: a.y + r.top, r: b.x + r.left, b: b.y + r.top, h: b.y - a.y };
  } catch (err) { return { x: 0, y: 0, r: 0, b: 0, h: 0 }; }
}
function tamanhoDaArte(info) {
  const vw = window.innerWidth, vh = window.innerHeight;
  const chave = vw < 900 ? "pequeno" : cfg("arteHoverTamanho", "medio");
  const [fh, fw] = TAMANHOS[chave] ?? TAMANHOS.medio;
  const ar = Math.max(0.2, Math.min(5, (info.w || 1) / (info.h || 1)));
  let h = vh * fh, w = h * ar;
  if (w > vw * fw) { w = vw * fw; h = w / ar; }
  const lim = 1.25; // não estica demais imagem pequena
  if (info.w && w > info.w * lim) { w = info.w * lim; h = w / ar; }
  return { w: Math.round(w), h: Math.round(h) };
}

/* ---------- desenho ---------- */
let el = null, atual = null, timer = null, fixadoAte = 0, fixadoTimer = null;
function camada() {
  if (el?.isConnected) return el;
  el = document.createElement("div");
  el.id = "nauren-arte";
  el.setAttribute("aria-hidden", "true");
  document.body.appendChild(el);
  return el;
}
function subtitulo(a) {
  if (!a) return "";
  if (a.type === "personagem") return a.items?.find?.(i => i.type === "classe")?.name ?? "";
  const cat = a.system?.categoria ?? a.system?.categoriaMonstro ?? "";
  return cat ? String(cat) : "PNJ";
}
async function mostrar(token, { forcado = false } = {}) {
  const src = imagemDaArte(token);
  if (!src) return esconder(true);
  const info = await analisar(src);
  if (!info) return esconder(true);
  // O mouse já saiu enquanto carregava?
  if (!forcado && atual !== token) return;
  const a = token.actor;
  const modoMoldura = a?.flags?.nauren?.moldura ?? "auto";
  const recorte = modoMoldura === "nunca" ? true : modoMoldura === "sempre" ? false : info.recorte;
  const { w, h } = tamanhoDaArte(info);
  const posMundo = cfg("arteHoverPosicao", "sup-dir");
  const posJog = cfg("arteHoverPosicaoJogador", "mundo");
  const posicao = posJog && posJog !== "mundo" ? posJog : posMundo;
  const nome = naurenNomeVisivel(token);
  const sub = naurenNomeOculto(token) && !game.user.isGM ? "" : subtitulo(a);
  const midia = VIDEO.test(src)
    ? `<video src="${ESC(src)}" autoplay loop muted playsinline></video>`
    : `<img src="${ESC(src)}" alt="" decoding="async">`;
  const c = camada();
  const { estilo, escuro } = naurenEstiloDoCard(a ?? null);
  c.className = `${recorte ? "na-recorte" : "na-moldura"} ${escuro ? "na-escuro" : ""} na-pos-${posicao}`;
  c.style.cssText = estilo;
  c.innerHTML = recorte
    ? `<div class="na-arte-caixa" style="width:${w}px;height:${h}px">${midia}</div><div class="na-arte-nome">${ESC(nome)}${sub ? `<small>${ESC(sub)}</small>` : ""}</div>`
    : `<div class="na-arte-caixa" style="width:${w}px;height:${h}px"><div class="na-arte-borda"><div class="na-arte-img">${midia}</div></div><i class="na-arte-filete"></i><div class="na-arte-placa"><b>${ESC(nome)}</b>${sub ? `<small>${ESC(sub)}</small>` : ""}</div></div>`;
  const alturaTotal = recorte ? h + 30 : h;
  const p = calcularPosicao(w, alturaTotal, posicao, token);
  c.style.left = `${p.x}px`; c.style.top = `${p.y}px`;
  c.style.width = `${w}px`;
  requestAnimationFrame(() => c.classList.add("na-visivel"));
}
function esconder(agora = false) {
  clearTimeout(timer); timer = null;
  if (Date.now() < fixadoAte && !agora) return;
  atual = null;
  el?.classList.remove("na-visivel");
}

/** Mostra a arte do token para este usuário por alguns segundos (pedido do Mestre). */
async function mostrarFixado(token, segundos = 6) {
  if (!podeVer(token, true)) return false;
  atual = token;
  fixadoAte = Date.now() + segundos * 1000;
  clearTimeout(fixadoTimer);
  await mostrar(token, { forcado: true });
  fixadoTimer = setTimeout(() => { fixadoAte = 0; esconder(true); }, segundos * 1000);
  return true;
}
/** Mestre: mostra a arte deste token para todos na mesma cena. */
async function naurenMostrarArteATodos(token) {
  if (!game.user.isGM || !token?.document) return;
  const seg = Number(cfg("arteHoverSegundos", 6)) || 6;
  let n = 0;
  for (const u of game.users) {
    if (!u.active) continue;
    if (u.isSelf || u === game.user) { await mostrarFixado(token, seg); continue; }
    try { await u.query(QUERY_MOSTRAR, { tokenUuid: token.document.uuid, segundos: seg }, { timeout: 5000 }); n++; } catch (err) { /* segue */ }
  }
  ui.notifications.info(`Arte de ${token.document.name} mostrada para ${n} jogador(es).`);
}

/* ---------- registro ---------- */
function naurenArteInit() {
  const reg = (k, d) => game.settings.register("nauren", k, d);
  reg("arteHoverPosicao", { name: "Arte ao passar o mouse: posição", hint: "Onde aparece a arte do personagem quando alguém passa o mouse num token. Cada jogador pode trocar só para a tela dele.", scope: "world", config: true, type: String, default: "sup-dir",
    choices: { "sup-dir": "Canto de cima, ao lado do chat", "inf-dir": "Canto de baixo, ao lado do chat", "sup-esq": "Canto de cima, à esquerda", "inf-esq": "Canto de baixo, à esquerda", token: "Junto do token" } });
  reg("arteHoverPnj", { name: "Arte ao passar o mouse: PNJs e monstros", hint: "Quem vê a arte de quem não é personagem de jogador. O Mestre pode ocultar a arte de cada ficha (aba Opções).", scope: "world", config: true, type: String, default: "todos",
    choices: { todos: "Todos veem", limitado: "Só quem tem permissão Limitado ou mais", mestre: "Só o Mestre" } });
  reg("arteHoverSegundos", { name: "Arte: tempo do \"Mostrar a todos\"", hint: "Segundos que a arte fica na tela de todos quando o Mestre usa \"Mostrar a todos\" (botão no HUD do token ou Shift+V).", scope: "world", config: true, type: Number, default: 6, range: { min: 2, max: 30, step: 1 } });
  reg("arteHoverLigado", { name: "Arte ao passar o mouse", hint: "Mostra a arte do personagem quando você passa o mouse num token.", scope: "client", config: true, type: Boolean, default: true });
  reg("arteHoverPosicaoJogador", { name: "Arte: posição só na minha tela", scope: "client", config: true, type: String, default: "mundo",
    choices: { mundo: "A do mundo", "sup-dir": "Canto de cima, ao lado do chat", "inf-dir": "Canto de baixo, ao lado do chat", "sup-esq": "Canto de cima, à esquerda", "inf-esq": "Canto de baixo, à esquerda", token: "Junto do token" } });
  reg("arteHoverTamanho", { name: "Arte: tamanho", scope: "client", config: true, type: String, default: "medio", choices: { pequeno: "Pequeno", medio: "Médio", grande: "Grande" } });
  reg("arteHoverAtraso", { name: "Arte: espera para aparecer (ms)", hint: "Tempo com o mouse parado em cima do token antes de a arte aparecer.", scope: "client", config: true, type: Number, default: 250, range: { min: 0, max: 1000, step: 50 } });
  CONFIG.queries ??= {};
  CONFIG.queries[QUERY_MOSTRAR] = async ({ tokenUuid, segundos } = {}) => {
    const doc = await fromUuid(tokenUuid).catch(() => null);
    const tk = doc?.object;
    if (!tk || doc.parent !== canvas.scene) return false;
    return mostrarFixado(tk, Number(segundos) || 6);
  };
  try {
    game.keybindings.register("nauren", "mostrarArteATodos", {
      name: "Mostrar a arte do token a todos (Mestre)", hint: "Com o mouse sobre um token, mostra a arte dele na tela de todos por alguns segundos.",
      editable: [{ key: "KeyV", modifiers: ["Shift"] }], restricted: true,
      onDown: () => { const t = canvas?.tokens?.hover; if (t) naurenMostrarArteATodos(t); return !!t; }
    });
  } catch (err) { /* atalho opcional */ }
}

Hooks.on("hoverToken", (token, hovered) => {
  try {
    if (!hovered) { if (atual === token) esconder(); return; }
    if (!podeVer(token)) return;
    clearTimeout(timer);
    atual = token;
    timer = setTimeout(() => { if (atual === token) mostrar(token); }, Number(cfg("arteHoverAtraso", 250)) || 0);
  } catch (err) { console.warn("Nauren RPG | arte ao passar o mouse", err); }
});
Hooks.on("updateToken", (doc, mud) => { if (atual?.document === doc && mud && ("x" in mud || "y" in mud)) esconder(true); });
Hooks.on("deleteToken", doc => { if (atual?.document === doc) esconder(true); });
Hooks.on("canvasTearDown", () => esconder(true));
Hooks.on("updateActor", a => { if (atual?.actor === a && el?.classList.contains("na-visivel")) mostrar(atual); });
// Nome oculto também no nome que o Foundry desenha em cima do token.
Hooks.on("refreshToken", token => {
  try {
    if (game.user.isGM || !token.nameplate) return;
    const nome = naurenNomeVisivel(token);
    if (token.nameplate.text !== nome) token.nameplate.text = nome;
  } catch (err) { /* segue */ }
});
// Botão "Mostrar a arte a todos" no HUD do token (clique direito), só para o Mestre.
Hooks.on("renderTokenHUD", (hud, html) => {
  try {
    if (!game.user.isGM) return;
    const raiz = html instanceof HTMLElement ? html : html?.[0];
    const col = raiz?.querySelector(".col.left") ?? raiz?.querySelector(".col.right");
    if (!col || col.querySelector(".nauren-arte-todos")) return;
    const b = document.createElement("button");
    b.type = "button"; b.className = "control-icon nauren-arte-todos";
    b.dataset.tooltip = "Mostrar a arte a todos";
    b.innerHTML = `<i class="fas fa-image-portrait"></i>`;
    b.addEventListener("click", ev => { ev.preventDefault(); ev.stopPropagation(); const t = hud.object ?? hud.document?.object; if (t) naurenMostrarArteATodos(t); });
    col.appendChild(b);
  } catch (err) { /* segue */ }
});

export { naurenArteInit, naurenNomeVisivel, naurenNomeOculto, naurenMostrarArteATodos, mostrar as naurenArteMostrar, esconder as naurenArteEsconder, calcularPosicao as naurenArtePosicao, analisar as naurenArteAnalisar, imagemDaArte as naurenArteImagem };
