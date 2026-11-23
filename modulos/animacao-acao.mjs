/* Nauren RPG — Animação e som PRÓPRIOS de cada Ação (0.123).
 *
 * Fica dentro da Ação (system.acoes[N].animacao), então vai junto quando a ficha é exportada/importada
 * em JSON (fichas geradas por IA já chegam com animação e som, sem mexer no Automated Animations).
 *   modo "auto"    = como antes: menu do Automated Animations pelo nome (ou a reserva por tipo)
 *   modo "propria" = este bloco: Sequencer toca a animação; o som toca mesmo sem o Sequencer
 *   modo "nenhuma" = esta Ação não anima (nem pelo Automated Animations)
 * Tipos: projetil (vai do usuário até cada alvo), corpo (golpe do usuário no alvo), alvo (em cima de
 * cada alvo), usuario (em cima de quem usa), area (no centro da área criada).
 * As funções do começo do arquivo são puras (testadas em Node); o resto usa o Foundry.
 */

export const NAUREN_ANIMACAO_MODOS = Object.freeze(["auto", "propria", "nenhuma"]);
export const NAUREN_ANIMACAO_TIPOS = Object.freeze({
  projetil: { rotulo: "Projétil", icone: "fa-location-arrow", dica: "Sai de quem usa e vai até cada alvo (flechas, raios, bolas de fogo)." },
  corpo: { rotulo: "Corpo a corpo", icone: "fa-hand-fist", dica: "Golpe de quem usa no alvo (espadas, garras, socos)." },
  alvo: { rotulo: "No alvo", icone: "fa-crosshairs", dica: "Toca em cima de cada alvo (explosão, cura, maldição)." },
  usuario: { rotulo: "Em quem usa", icone: "fa-user", dica: "Toca em cima de quem usou (aura, bênção, transformação)." },
  area: { rotulo: "Na área", icone: "fa-circle-dot", dica: "Toca no centro da área criada, do tamanho dela." }
});

export function naurenAnimacaoAcaoPadrao() {
  return { modo: "auto", tipo: "projetil", anim: "", impacto: "", escala: 1, noErro: true, porBaixo: false, som: "", somVolume: 0.8, somAtraso: 0, somImpacto: "" };
}

const num = (v, min, max, pad) => { const n = Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : pad; };
/** Bloco completo e seguro (dados velhos, JSON de IA com campos faltando ou errados). */
export function naurenAnimacaoAcaoNormalizar(cfg) {
  const p = naurenAnimacaoAcaoPadrao();
  const c = cfg && typeof cfg === "object" ? cfg : {};
  const txt = v => (typeof v === "string" ? v.trim() : "");
  return {
    modo: NAUREN_ANIMACAO_MODOS.includes(c.modo) ? c.modo : p.modo,
    tipo: Object.hasOwn(NAUREN_ANIMACAO_TIPOS, c.tipo) ? c.tipo : p.tipo,
    anim: txt(c.anim), impacto: txt(c.impacto),
    escala: num(c.escala, 0.1, 10, p.escala),
    noErro: c.noErro === undefined ? p.noErro : !!c.noErro,
    porBaixo: !!c.porBaixo,
    som: txt(c.som), somVolume: num(c.somVolume, 0, 1, p.somVolume),
    somAtraso: Math.round(num(c.somAtraso, 0, 10000, 0)),
    somImpacto: txt(c.somImpacto)
  };
}

/** É um arquivo (e não um nome do banco do Sequencer)? */
export function naurenAnimacaoEhArquivo(anim) {
  return /\.(webm|webp|png|gif|apng|mp4|json)(\?|$)/i.test(String(anim ?? "")) || String(anim ?? "").includes("/");
}

/* Categorias do seletor, pelas palavras do caminho (JB2A e outros módulos que seguem o mesmo padrão). */
export const NAUREN_ANIMACAO_CATEGORIAS = Object.freeze([
  { id: "projetil", rotulo: "Projéteis", icone: "fa-location-arrow", re: /bolt|arrow|missile|ray|beam|projectile|bullet|javelin|throw|dart|orb|ranged|spear|shot|lightning/i },
  { id: "corpo", rotulo: "Corpo a corpo", icone: "fa-hand-fist", re: /melee|sword|claw|slash|strike|attack|dagger|axe|mace|hammer|punch|unarmed|bite|whip|katana|scimitar|rapier|club|flail|glaive|halberd|scythe/i },
  { id: "impacto", rotulo: "Impactos", icone: "fa-burst", re: /impact|explosion|explode|hit|smash|shatter|burst|splash|blast/i },
  { id: "area", rotulo: "Áreas", icone: "fa-circle-dot", re: /aura|circle|cone|breath|template|wall|cloud|storm|zone|ward|field|ground|pillar|fog/i },
  { id: "cura", rotulo: "Cura e bênçãos", icone: "fa-heart-pulse", re: /heal|cure|bless|healing|restor|revivify|regen|divine|holy|sacred/i },
  { id: "magia", rotulo: "Magias", icone: "fa-wand-sparkles", re: /spell|magic|fire|ice|frost|arcane|eldritch|necrotic|psychic|thunder|acid|poison|energy|shield|portal|misty|teleport/i },
  { id: "marcador", rotulo: "Marcadores", icone: "fa-location-dot", re: /marker|icon|condition|status|token_border|ui|generic\.ui/i }
]);

/** Categorias de um caminho (pode ser mais de uma). */
export function naurenCategoriasDaAnimacao(caminho) {
  const s = String(caminho ?? "").replace(/[._\-/]/g, " ");
  return NAUREN_ANIMACAO_CATEGORIAS.filter(c => c.re.test(s)).map(c => c.id);
}

/** Filtro do seletor: várias palavras (todas precisam aparecer), mais a categoria (opcional). */
export function naurenFiltrarAnimacoes(lista, { busca = "", categoria = "" } = {}) {
  const palavras = String(busca ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const cat = NAUREN_ANIMACAO_CATEGORIAS.find(c => c.id === categoria);
  return (lista ?? []).filter(caminho => {
    const s = String(caminho).toLowerCase();
    if (palavras.length && !palavras.every(p => s.includes(p) || s.replace(/[._\-]/g, " ").includes(p))) return false;
    if (cat && !cat.re.test(s.replace(/[._\-/]/g, " "))) return false;
    return true;
  });
}

/** Nome bonito para o cartão: "jb2a.fire_bolt.orange" → "fire bolt · orange". */
export function naurenNomeCurtoAnimacao(caminho) {
  let s = String(caminho ?? "");
  if (s.includes("/")) s = s.split("/").pop().replace(/\.[a-z0-9]+$/i, "");
  const partes = s.split(".").filter(Boolean);
  if (partes.length > 1 && /^(jb2a|jb2a_patreon|animated-spell-effects|eskie|wjm)$/i.test(partes[0])) partes.shift();
  return partes.map(p => p.replace(/_/g, " ")).join(" · ");
}

/**
 * Arquivo de vídeo de uma entrada do banco do Sequencer (para a prévia). A entrada pode ser texto,
 * lista (variações), objeto de distâncias ({ "05ft": ..., "30ft": ... }) ou um SequencerFile.
 */
export function naurenArquivoDaEntrada(entrada, prof = 0) {
  if (!entrada || prof > 6) return "";
  if (typeof entrada === "string") return entrada;
  if (Array.isArray(entrada)) { for (const x of entrada) { const f = naurenArquivoDaEntrada(x, prof + 1); if (f) return f; } return ""; }
  if (typeof entrada === "object") {
    if (entrada.file !== undefined) return naurenArquivoDaEntrada(entrada.file, prof + 1);
    const chaves = Object.keys(entrada);
    // distâncias: a do meio costuma mostrar melhor o efeito inteiro
    const preferidas = ["30ft", "15ft", "60ft", "05ft", "90ft"];
    for (const k of preferidas) if (chaves.includes(k)) { const f = naurenArquivoDaEntrada(entrada[k], prof + 1); if (f) return f; }
    for (const k of chaves) { if (k.startsWith("_")) continue; const f = naurenArquivoDaEntrada(entrada[k], prof + 1); if (f) return f; }
  }
  return "";
}

/** Texto para o chat/aviso: o que esta Ação vai tocar. */
export function naurenResumoAnimacaoAcao(cfg) {
  const c = naurenAnimacaoAcaoNormalizar(cfg);
  if (c.modo === "nenhuma") return "Sem animação";
  if (c.modo === "auto") return "Automático (Automated Animations)";
  const partes = [];
  if (c.anim) partes.push(`${NAUREN_ANIMACAO_TIPOS[c.tipo].rotulo}: ${naurenNomeCurtoAnimacao(c.anim)}`);
  if (c.impacto) partes.push(`impacto: ${naurenNomeCurtoAnimacao(c.impacto)}`);
  if (c.som) partes.push("som");
  return partes.join(" · ") || "Própria (vazia)";
}

/* =========================== daqui para baixo: Foundry =========================== */

export function naurenSequencerAtivo() {
  return !!(globalThis.game?.modules?.get?.("sequencer")?.active && globalThis.Sequence && globalThis.Sequencer?.Database);
}

/** Todos os caminhos que o banco do Sequencer conhece (JB2A grátis, Patreon e outros módulos). */
export function naurenListaAnimacoesSequencer() {
  if (!naurenSequencerAtivo()) return [];
  const db = globalThis.Sequencer.Database;
  let lista = [];
  try { lista = db.publicFlattenedSimpleEntries ?? db.publicFlattenedEntries ?? []; } catch (err) { lista = []; }
  return [...new Set((Array.isArray(lista) ? lista : []).filter(x => typeof x === "string"))].sort();
}

export function naurenAnimacaoExiste(anim) {
  if (!anim) return false;
  if (naurenAnimacaoEhArquivo(anim)) return true;
  if (!naurenSequencerAtivo()) return false;
  try { return !!globalThis.Sequencer.Database.entryExists(anim); } catch (err) { return false; }
}

/** Arquivo para a prévia (vídeo) de um caminho do banco, ou o próprio arquivo. */
export function naurenArquivoDaAnimacao(anim) {
  if (!anim) return "";
  if (naurenAnimacaoEhArquivo(anim)) return anim;
  if (!naurenSequencerAtivo()) return "";
  const db = globalThis.Sequencer.Database;
  try {
    const todos = db.getAllFileEntries?.(anim);
    if (Array.isArray(todos) && todos.length) { const f = naurenArquivoDaEntrada(todos); if (f) return f; }
  } catch (err) { /* segue */ }
  try {
    const e = db.getEntry?.(anim, { softFail: true });
    const f = naurenArquivoDaEntrada(e);
    if (f) return f;
  } catch (err) { /* segue */ }
  return "";
}

function tocarSom(src, volume, atraso = 0) {
  if (!src) return;
  const play = () => { try { foundry.audio.AudioHelper.play({ src, volume, autoplay: true, loop: false }, true); } catch (err) { console.warn("Nauren RPG | som da Ação", err); } };
  if (atraso > 0) setTimeout(play, atraso); else play();
}

/** Centro e tamanho de uma Region (área) para a animação de área. */
function centroDaRegiao(regiao) {
  const f = regiao?.shapes?.[0];
  if (!f) { const b = regiao?.object?.bounds; return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2, tam: Math.max(b.width, b.height) } : null; }
  if (f.radius !== undefined && f.type !== "cone") return { x: f.x, y: f.y, tam: f.radius * 2 };
  if (f.type === "rectangle" && f.width !== undefined) return { x: f.x + f.width / 2, y: f.y + f.height / 2, tam: Math.max(f.width, f.height) };
  const b = regiao.object?.bounds; return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2, tam: Math.max(b.width, b.height) } : null;
}

/**
 * Toca a animação e o som de uma Ação. Visual só com o Sequencer; o som toca de qualquer jeito
 * (AudioHelper, para todas as telas). Devolve true se a parte visual foi tocada.
 * @param {Token} origem  token de quem usa (objeto do canvas)
 * @param {object} cfg    o bloco animacao da Ação
 * @param {{alvos?:Token[], atingidos?:Token[], regiao?:RegionDocument}} ctx
 */
export async function naurenTocarAnimacaoDaAcao(origem, cfg, { alvos = [], atingidos = [], regiao = null } = {}) {
  const c = naurenAnimacaoAcaoNormalizar(cfg);
  const acertou = t => atingidos.includes(t);
  const algumAcerto = atingidos.length > 0;
  let visual = false;
  const seq = naurenSequencerAtivo();
  const animOk = seq && c.anim && naurenAnimacaoExiste(c.anim);
  const impOk = seq && c.impacto && naurenAnimacaoExiste(c.impacto);
  if (c.anim && seq && !animOk) console.warn(`Nauren RPG | animação "${c.anim}" não existe nos módulos ativos.`);
  tocarSom(c.som, c.somVolume, c.somAtraso);
  if (!seq || (!animOk && !impOk)) {
    // sem Sequencer: o som do impacto vem logo depois do som principal
    if (c.somImpacto && algumAcerto) tocarSom(c.somImpacto, c.somVolume, c.somAtraso + 500);
    return false;
  }
  try {
    const s = new globalThis.Sequence();
    const base = ef => { if (c.porBaixo) ef.belowTokens(); return ef; };
    const destinos = alvos.length ? alvos : [];
    let houvePrincipal = false;
    if (animOk) {
      if (c.tipo === "projetil" || c.tipo === "corpo") {
        const lista = destinos.filter(t => acertou(t) || c.noErro);
        lista.forEach((t, i) => {
          const ef = base(s.effect().file(c.anim).atLocation(origem).stretchTo(t));
          if (!acertou(t)) ef.missed();
          if (i === lista.length - 1) ef.waitUntilFinished(-500);
        });
        houvePrincipal = lista.length > 0;
      } else if (c.tipo === "alvo") {
        const lista = destinos.filter(t => acertou(t) || c.noErro);
        if (lista.length) lista.forEach(t => base(s.effect().file(c.anim).atLocation(t).scaleToObject(c.escala)));
        else base(s.effect().file(c.anim).atLocation(origem).scaleToObject(c.escala)); // sem alvo: em quem usa
        houvePrincipal = true;
      } else if (c.tipo === "area" && regiao && !regiao.deleted) {
        const r = centroDaRegiao(regiao);
        if (r) { s.effect().file(c.anim).atLocation({ x: r.x, y: r.y }).size({ width: r.tam * c.escala, height: r.tam * c.escala }).belowTokens(c.porBaixo); houvePrincipal = true; }
      }
      if (!houvePrincipal) { // usuário (e área sem área / projétil sem alvo)
        base(s.effect().file(c.anim).atLocation(origem).scaleToObject(c.escala)).waitUntilFinished(-500);
        houvePrincipal = true;
      }
    }
    const atingidosAlvos = destinos.filter(acertou);
    if (impOk && atingidosAlvos.length) for (const t of atingidosAlvos) s.effect().file(c.impacto).atLocation(t).scaleToObject(c.escala);
    if (c.somImpacto && atingidosAlvos.length) s.sound().file(c.somImpacto).volume(c.somVolume);
    visual = houvePrincipal || (impOk && atingidosAlvos.length > 0);
    await s.play();
  } catch (err) {
    console.warn("Nauren RPG | animação da Ação", err);
  }
  return visual;
}

/* ============================== Seletor (JB2A) ============================== */

const esc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const PAGINA = 120;

/**
 * Janela com todas as animações do banco do Sequencer, busca, categorias e prévia em vídeo.
 * NaurenSeletorAnimacao.escolher({ atual }) → Promise<string|null>
 */
let ClasseSeletor = null;
export const NaurenSeletorAnimacao = Object.freeze({ escolher: opcoes => classeSeletor().escolher(opcoes) });
function classeSeletor() {
  if (ClasseSeletor) return ClasseSeletor;
  ClasseSeletor = class NaurenSeletorAnimacaoApp extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    classes: ["nauren-rpg", "nauren-seletor-anim"],
    window: { title: "Escolher animação", resizable: true, icon: "fas fa-film" },
    position: { width: 980, height: 680 }
  };
  #lista = []; #filtrada = []; #mostrados = 0; #busca = ""; #categoria = ""; #escolhida = ""; #resolver = null; #obs = null;

  static escolher({ atual = "", titulo = "" } = {}) {
    return new Promise(resolve => {
      const app = new NaurenSeletorAnimacaoApp(titulo ? { window: { title: titulo } } : {});
      app.#resolver = resolve; app.#escolhida = atual || "";
      app.#lista = naurenListaAnimacoesSequencer();
      if (atual && !naurenAnimacaoEhArquivo(atual)) app.#busca = atual.split(".").slice(1, 2).join(" ").replace(/_/g, " ");
      app.render({ force: true });
    });
  }

  async _renderHTML() {
    const chips = [{ id: "", rotulo: "Todas", icone: "fa-border-all" }, ...NAUREN_ANIMACAO_CATEGORIAS]
      .map(c => `<button type="button" class="nsa-chip ${c.id === this.#categoria ? "on" : ""}" data-cat="${c.id}"><i class="fas ${c.icone}"></i> ${c.rotulo}</button>`).join("");
    const vazio = !this.#lista.length;
    return `<div class="nsa">
      <header class="nsa-topo">
        <label class="nsa-busca"><i class="fas fa-magnifying-glass"></i><input type="search" value="${esc(this.#busca)}" placeholder="Buscar: fire bolt, heal, claw red…" autocomplete="off"></label>
        <span class="nsa-conta"></span>
      </header>
      <nav class="nsa-chips">${chips}</nav>
      <div class="nsa-corpo">
        <section class="nsa-grade">${vazio ? `<p class="nsa-vazio"><i class="fas fa-triangle-exclamation"></i> O banco do Sequencer está vazio. Ative o <b>Sequencer</b> e um módulo de animações (como o <b>JB2A</b>).</p>` : ""}</section>
        <aside class="nsa-lado">
          <div class="nsa-previa"><video muted loop autoplay playsinline></video><span class="nsa-previa-vazia"><i class="fas fa-film"></i><br>Clique numa animação</span></div>
          <code class="nsa-caminho"></code>
          <p class="nsa-dica">Clique para ver; clique duas vezes (ou <b>Usar esta</b>) para escolher. Variações de cor e distância ficam com o Sequencer: a distância certa é escolhida sozinha na hora.</p>
          <div class="nsa-botoes">
            <button type="button" class="nsa-arquivo"><i class="fas fa-folder-open"></i> Arquivo…</button>
            <button type="button" class="nsa-limpar"><i class="fas fa-eraser"></i> Sem animação</button>
            <button type="button" class="nsa-usar nsa-prim" disabled><i class="fas fa-check"></i> Usar esta</button>
          </div>
        </aside>
      </div>
    </div>`;
  }
  _replaceHTML(result, content) { content.innerHTML = result; }

  _onRender() {
    const raiz = this.element;
    const busca = raiz.querySelector(".nsa-busca input");
    let t = null;
    busca.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { this.#busca = busca.value; this.#refiltrar(); }, 160); });
    busca.addEventListener("keydown", ev => { if (ev.key === "Enter") { ev.preventDefault(); if (this.#escolhida) this.#confirmar(this.#escolhida); } });
    raiz.querySelectorAll(".nsa-chip").forEach(b => b.addEventListener("click", () => {
      this.#categoria = b.dataset.cat; raiz.querySelectorAll(".nsa-chip").forEach(x => x.classList.toggle("on", x === b)); this.#refiltrar();
    }));
    raiz.querySelector(".nsa-usar").addEventListener("click", () => this.#confirmar(this.#escolhida));
    raiz.querySelector(".nsa-limpar").addEventListener("click", () => this.#confirmar(""));
    raiz.querySelector(".nsa-arquivo").addEventListener("click", () => {
      const FP = foundry.applications?.apps?.FilePicker?.implementation ?? globalThis.FilePicker;
      new FP({ type: "imagevideo", current: naurenAnimacaoEhArquivo(this.#escolhida) ? this.#escolhida : "", callback: caminho => this.#confirmar(caminho) }).render(true);
    });
    const grade = raiz.querySelector(".nsa-grade");
    grade.addEventListener("click", ev => { const c = ev.target.closest(".nsa-card"); if (c) this.#selecionar(c.dataset.anim); else if (ev.target.closest(".nsa-mais")) this.#maisCartoes(); });
    grade.addEventListener("dblclick", ev => { const c = ev.target.closest(".nsa-card"); if (c) this.#confirmar(c.dataset.anim); });
    grade.addEventListener("mouseover", ev => { const v = ev.target.closest(".nsa-card")?.querySelector("video"); if (v?.src) v.play().catch(() => {}); });
    grade.addEventListener("mouseout", ev => { const c = ev.target.closest(".nsa-card"); if (c && !c.contains(ev.relatedTarget)) { const v = c.querySelector("video"); if (v) { v.pause(); } } });
    this.#obs?.disconnect();
    this.#obs = new IntersectionObserver(entradas => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        const card = e.target; this.#obs.unobserve(card);
        if (card.classList.contains("nsa-sentinela")) { this.#maisCartoes(); continue; }
        const arq = naurenArquivoDaAnimacao(card.dataset.anim);
        const v = card.querySelector("video");
        if (arq && v) { v.src = arq; v.addEventListener("loadeddata", () => { try { v.currentTime = Math.min(0.6, (v.duration || 1) / 2); } catch (err) { /* ok */ } card.classList.add("pronto"); }, { once: true }); v.addEventListener("error", () => card.classList.add("sem-previa"), { once: true }); }
        else card.classList.add("sem-previa");
      }
    }, { root: grade, rootMargin: "200px" });
    this.#refiltrar();
    if (this.#escolhida) this.#selecionar(this.#escolhida);
    setTimeout(() => busca.focus(), 50);
  }

  #refiltrar() {
    this.#filtrada = naurenFiltrarAnimacoes(this.#lista, { busca: this.#busca, categoria: this.#categoria });
    this.#mostrados = 0;
    const grade = this.element.querySelector(".nsa-grade");
    if (!this.#lista.length) return;
    grade.innerHTML = this.#filtrada.length ? "" : `<p class="nsa-vazio">Nada encontrado para essa busca.</p>`;
    grade.scrollTop = 0;
    this.element.querySelector(".nsa-conta").textContent = `${this.#filtrada.length} de ${this.#lista.length} animações`;
    this.#maisCartoes();
  }

  #maisCartoes() {
    const grade = this.element?.querySelector(".nsa-grade"); if (!grade) return;
    grade.querySelector(".nsa-sentinela")?.remove(); grade.querySelector(".nsa-mais")?.remove();
    const fatia = this.#filtrada.slice(this.#mostrados, this.#mostrados + PAGINA);
    this.#mostrados += fatia.length;
    const frag = document.createElement("template");
    frag.innerHTML = fatia.map(a => `<button type="button" class="nsa-card ${a === this.#escolhida ? "on" : ""}" data-anim="${esc(a)}" title="${esc(a)}">
        <span class="nsa-mini"><video muted loop playsinline preload="metadata"></video><i class="fas fa-film"></i></span>
        <span class="nsa-nome">${esc(naurenNomeCurtoAnimacao(a))}</span></button>`).join("");
    const novos = [...frag.content.children];
    grade.append(...novos);
    novos.forEach(c => this.#obs.observe(c));
    if (this.#mostrados < this.#filtrada.length) {
      const s = document.createElement("div"); s.className = "nsa-sentinela";
      const b = document.createElement("button"); b.type = "button"; b.className = "nsa-mais"; b.textContent = `Mostrar mais (${this.#filtrada.length - this.#mostrados})`;
      grade.append(b, s); this.#obs.observe(s);
    }
  }

  #selecionar(anim) {
    this.#escolhida = anim || "";
    const raiz = this.element;
    raiz.querySelectorAll(".nsa-card").forEach(c => c.classList.toggle("on", c.dataset.anim === anim));
    raiz.querySelector(".nsa-caminho").textContent = anim || "";
    raiz.querySelector(".nsa-usar").disabled = !anim;
    const v = raiz.querySelector(".nsa-previa video"), arq = naurenArquivoDaAnimacao(anim);
    raiz.querySelector(".nsa-previa").classList.toggle("tem", !!arq);
    if (arq) { v.src = arq; v.play().catch(() => {}); } else v.removeAttribute("src");
  }

  #confirmar(valor) {
    const r = this.#resolver; this.#resolver = null;
    r?.(valor ?? "");
    this.close();
  }

  async _onClose(options) {
    this.#obs?.disconnect();
    this.element?.querySelectorAll("video").forEach(v => { v.pause(); v.removeAttribute("src"); v.load?.(); });
    this.#resolver?.(null); this.#resolver = null;
    return super._onClose?.(options);
  }
  };
  return ClasseSeletor;
}

/* ============================ Bloco na ficha do item ============================ */

/** Liga os botões do bloco "Animação e som" (Procurar, arquivo, Testar, prévia pequena). */
export function naurenLigarBlocoAnimacaoAcao(sheet) {
  const raiz = sheet.element; if (!raiz) return;
  const item = sheet.item ?? sheet.document;
  const gravarCampo = (inp, valor) => { inp.value = valor; inp.dispatchEvent(new Event("change", { bubbles: true })); };
  raiz.querySelectorAll(".naa-bloco").forEach(bloco => {
    // prévia pequena ao lado de cada campo de animação
    bloco.querySelectorAll("[data-naa-previa]").forEach(v => {
      const arq = naurenArquivoDaAnimacao(v.dataset.naaPrevia);
      if (arq) { v.src = arq; v.closest(".naa-mini")?.classList.add("tem"); }
    });
    bloco.querySelectorAll("[data-naa-acao]").forEach(bt => bt.addEventListener("click", async ev => {
      ev.preventDefault();
      const acao = bt.dataset.naaAcao, campo = bt.dataset.alvo ? bloco.querySelector(`[data-field="${bt.dataset.alvo}"]`) : null;
      if (acao === "procurar" && campo) {
        if (!naurenSequencerAtivo()) return ui.notifications.warn("O Sequencer não está ativo.");
        const v = await NaurenSeletorAnimacao.escolher({ atual: campo.value, titulo: bt.dataset.titulo || "Escolher animação" });
        if (v !== null && v !== campo.value) gravarCampo(campo, v);
      } else if (acao === "arquivo" && campo) {
        const FP = foundry.applications?.apps?.FilePicker?.implementation ?? globalThis.FilePicker;
        new FP({ type: bt.dataset.tipo || "audio", current: campo.value || "", callback: caminho => gravarCampo(campo, caminho) }).render(true);
      } else if (acao === "ouvir" && campo?.value) {
        tocarSom(campo.value, Number(bloco.querySelector('[data-field$=".animacao.somVolume"]')?.value ?? 0.8), 0);
      } else if (acao === "testar") {
        const i = Number(bt.dataset.acaoIndex);
        const cfg = item.system?.acoes?.[i]?.animacao;
        const ator = item.parent?.documentName === "Actor" ? item.parent : null;
        const origem = (ator && (canvas?.tokens?.controlled?.find(t => t.actor === ator) ?? ator.getActiveTokens?.(true)?.[0])) ?? canvas?.tokens?.controlled?.[0] ?? null;
        const alvos = [...(game.user?.targets ?? [])].filter(t => t !== origem);
        if (!origem) { tocarSom(cfg?.som, cfg?.somVolume ?? 0.8, 0); return ui.notifications.info("Para ver a animação, ponha o personagem no mapa (ou selecione um token) e marque um alvo. Tocando só o som."); }
        await naurenTocarAnimacaoDaAcao(origem, { ...cfg, modo: "propria" }, { alvos, atingidos: alvos });
      }
    }));
  });
}
