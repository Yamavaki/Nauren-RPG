/**
 * Nauren RPG — Escritos (0.106.0): notas, cartas, pergaminhos, livros e diários.
 *
 * São Equipamentos (tipo "consumivel") com a categoria "escrito". O texto mora no próprio item
 * (system.escrito.paginas) e é escrito com o mesmo editor dos Jornais do Foundry (ProseMirror), com tudo
 * que ele oferece: títulos, listas, imagens, links @UUID, rolagens e trechos secretos (só o Mestre vê).
 * Os jogadores pegam o escrito no baú (ou leem lá mesmo), e no inventário clicam em "Ler".
 * Um escrito também pode ser mágico: as Ações do item aparecem no rodapé do leitor.
 */
const SIS = "nauren";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
const novoId = () => foundry.utils.randomID(10);

export const NAUREN_ESCRITO_FORMATOS = {
  nota: { rot: "Nota", ic: "fa-note-sticky", dica: "Um papel solto: bilhete, aviso, recado." },
  carta: { rot: "Carta", ic: "fa-envelope", dica: "Pode vir lacrada: o leitor rompe o lacre para ler." },
  pergaminho: { rot: "Pergaminho", ic: "fa-scroll", dica: "Rolo com varetas. Bom para magias e decretos." },
  livro: { rot: "Livro", ic: "fa-book", dica: "Capa e páginas lado a lado, como um livro aberto." },
  diario: { rot: "Diário", ic: "fa-book-bookmark", dica: "Livro com fita marcadora. Por padrão, o dono escreve nele." }
};
export const NAUREN_ESCRITO_PAPEIS = {
  envelhecido: "Envelhecido", pergaminho: "Pergaminho", creme: "Creme", branco: "Branco", noturno: "Noturno", arcano: "Arcano"
};
export const NAUREN_ESCRITO_FONTES = {
  caligrafia: { rot: "Caligrafia", css: "\"Nauren Caligrafia\", \"Nauren Livro\", Georgia, serif", escala: 1.18 },
  livro: { rot: "Livro", css: "\"Nauren Livro\", Georgia, serif", escala: 1 },
  classica: { rot: "Clássica", css: "\"Nauren Classica\", \"Palatino Linotype\", Georgia, serif", escala: 1.04 },
  antiga: { rot: "Antiga", css: "\"Nauren Antiga\", \"Nauren Classica\", Georgia, serif", escala: 1.06 },
  titulo: { rot: "Letreiro", css: "\"Modesto Condensed\", \"Nauren Classica\", serif", escala: 1.12 },
  simples: { rot: "Simples", css: "Signika, \"Segoe UI\", sans-serif", escala: .96 }
};
/** Tinta padrão de cada papel (os escuros pedem tinta clara). */
const TINTA_DO_PAPEL = { envelhecido: "#2b1d10", pergaminho: "#3a2611", creme: "#24180e", branco: "#1c1c22", noturno: "#eadfbe", arcano: "#d6e8ff" };
/** O que cada formato sugere ao ser escolhido (só preenche; tudo continua editável). */
const SUGESTAO_DO_FORMATO = {
  nota: { papel: "envelhecido", fonte: "caligrafia" },
  carta: { papel: "creme", fonte: "caligrafia" },
  pergaminho: { papel: "pergaminho", fonte: "antiga" },
  livro: { papel: "creme", fonte: "livro" },
  diario: { papel: "creme", fonte: "caligrafia", quemEscreve: "dono" }
};

const pagina = (p = {}) => ({
  id: typeof p.id === "string" && p.id ? p.id : novoId(),
  nome: typeof p.nome === "string" ? p.nome : "",
  tipo: p.tipo === "imagem" ? "imagem" : "texto",
  texto: typeof p.texto === "string" ? p.texto : "",
  src: typeof p.src === "string" ? p.src : "",
  legenda: typeof p.legenda === "string" ? p.legenda : ""
});
export const NAUREN_ESCRITO_PADRAO = () => ({
  formato: "nota", papel: "envelhecido", fonte: "caligrafia", tinta: "", tamanho: 100,
  capa: { cor: "#5b2a1d", detalhe: "#d6b25e", titulo: "", subtitulo: "" },
  lacre: { ativo: false, cor: "#8c1c1c", simbolo: "", rompido: false },
  quemEscreve: "mestre", lerNoBau: true, gastaAoUsar: false,
  paginas: [pagina()]
});
const hex = (v, d) => /^#[0-9a-f]{6}$/i.test(String(v ?? "")) ? String(v) : d;
export function naurenEscritoNormalizar(e) {
  const p = NAUREN_ESCRITO_PADRAO(); e = e && typeof e === "object" ? e : {};
  const out = {
    formato: NAUREN_ESCRITO_FORMATOS[e.formato] ? e.formato : p.formato,
    papel: NAUREN_ESCRITO_PAPEIS[e.papel] ? e.papel : p.papel,
    fonte: NAUREN_ESCRITO_FONTES[e.fonte] ? e.fonte : p.fonte,
    tinta: hex(e.tinta, ""),
    tamanho: Math.min(160, Math.max(70, Math.round(Number(e.tamanho) || 100))),
    capa: { cor: hex(e.capa?.cor, p.capa.cor), detalhe: hex(e.capa?.detalhe, p.capa.detalhe), titulo: String(e.capa?.titulo ?? ""), subtitulo: String(e.capa?.subtitulo ?? "") },
    lacre: { ativo: !!e.lacre?.ativo, cor: hex(e.lacre?.cor, p.lacre.cor), simbolo: String(e.lacre?.simbolo ?? "").slice(0, 2), rompido: !!e.lacre?.rompido },
    quemEscreve: e.quemEscreve === "dono" ? "dono" : "mestre",
    lerNoBau: e.lerNoBau !== false,
    gastaAoUsar: !!e.gastaAoUsar,
    paginas: (Array.isArray(e.paginas) ? e.paginas : []).map(pagina)
  };
  if (!out.paginas.length) out.paginas.push(pagina());
  return out;
}

/* ------------------------------ consultas ------------------------------ */
export function naurenEhEscrito(item) { return item?.type === "consumivel" && item.system?.categoria === "escrito"; }
export function naurenEscritoDe(item) { return naurenEhEscrito(item) ? naurenEscritoNormalizar(item.system.escrito) : null; }
/** Quem pode escrever: o Mestre sempre; o dono do item quando o escrito deixa ("o dono escreve"). */
export function naurenEscritoPodeEscrever(item) {
  if (!item) return false;
  if (game.user?.isGM) return true;
  return naurenEscritoDe(item)?.quemEscreve === "dono" && !!item.isOwner;
}
/** Tinta usada (a escolhida, ou a padrão do papel). */
function tintaDe(e) { return e.tinta || TINTA_DO_PAPEL[e.papel] || "#2b1d10"; }
function ehLivro(e) { return e.formato === "livro" || e.formato === "diario"; }
function semTexto(p) { return p.tipo === "texto" ? !String(p.texto ?? "").replace(/<[^>]*>/g, "").trim() : !p.src; }

async function enriquecer(html, item) {
  const TE = foundry.applications?.ux?.TextEditor?.implementation ?? globalThis.TextEditor;
  try { return await TE.enrichHTML(html ?? "", { secrets: !!game.user?.isGM, relativeTo: item, rollData: item?.actor?.getRollData?.() ?? {} }); }
  catch (err) { return html ?? ""; }
}

/** Salva o escrito no item (só o que mudou de verdade). */
async function gravar(item, e) {
  const n = naurenEscritoNormalizar(e);
  if (JSON.stringify(n) === JSON.stringify(naurenEscritoDe(item))) return;
  await item.update({ "system.escrito": n });
}

/* ------------------------------ abrir ------------------------------ */
const abertos = new Map();
/** Abre o escrito para ler (ou para escrever, se puder). Uma janela por item. */
export async function naurenAbrirEscrito(item, { editar = false, pagina = null } = {}) {
  if (typeof item === "string") item = await fromUuid(item);
  if (!naurenEhEscrito(item)) return null;
  let ap = abertos.get(item.uuid);
  if (!ap || ap.closed) { ap = new NaurenLeitor({ item }); abertos.set(item.uuid, ap); }
  if (editar && naurenEscritoPodeEscrever(item)) ap.editando = true;
  if (pagina !== null) ap.irPara(Number(pagina) || 0, false);
  await ap.render(true);
  ap.bringToFront?.();
  return ap;
}

/* ------------------------------ estilo (ficha e leitor) ------------------------------ */
/** Controles de formato/papel/fonte/capa/lacre. Os campos usam data-esc="caminho" (ver naurenEscritoLigarEstilo). */
export function naurenEscritoEstiloHtml(e, { compacto = false } = {}) {
  const fmt = Object.entries(NAUREN_ESCRITO_FORMATOS).map(([k, f]) => `<button type="button" class="nl-fmt ${e.formato === k ? "on" : ""}" data-esc-formato="${k}" title="${esc(f.dica)}"><i class="fas ${f.ic}"></i><span>${f.rot}</span></button>`).join("");
  const sel = (path, ops, v) => `<select class="nl-in" data-esc="${path}">${Object.entries(ops).map(([k, r]) => `<option value="${k}" ${v === k ? "selected" : ""}>${esc(typeof r === "string" ? r : r.rot)}</option>`).join("")}</select>`;
  const cor = (path, v, rot) => `<label class="nl-cor" title="${esc(rot)}"><input type="color" data-esc="${path}" value="${esc(v)}"><span>${esc(rot)}</span></label>`;
  const chk = (path, v, rot, dica = "") => `<label class="nl-check" ${dica ? `title="${esc(dica)}"` : ""}><input type="checkbox" data-esc="${path}" ${v ? "checked" : ""}> ${esc(rot)}</label>`;
  return `<div class="nl-estilo ${compacto ? "nl-estilo-compacto" : ""}">
    <div class="nl-campo"><span class="nl-rot">Formato</span><div class="nl-fmts">${fmt}</div></div>
    <div class="nl-grade2">
      <div class="nl-campo"><span class="nl-rot">Papel</span>${sel("papel", NAUREN_ESCRITO_PAPEIS, e.papel)}</div>
      <div class="nl-campo"><span class="nl-rot">Letra</span>${sel("fonte", NAUREN_ESCRITO_FONTES, e.fonte)}</div>
    </div>
    <div class="nl-linha-cores">${cor("tinta", tintaDe(e), "Tinta")}<label class="nl-faixa"><span>Tamanho da letra <b data-esc-ver="tamanho">${e.tamanho}%</b></span><input type="range" data-esc="tamanho" min="70" max="160" step="5" value="${e.tamanho}"></label></div>
    ${ehLivro(e) ? `<div class="nl-sub"><span class="nl-rot">Capa</span>
      <input type="text" class="nl-in" data-esc="capa.titulo" value="${esc(e.capa.titulo)}" placeholder="Título na capa (vazio = nome do item)">
      <input type="text" class="nl-in" data-esc="capa.subtitulo" value="${esc(e.capa.subtitulo)}" placeholder="Linha de baixo (autor, ano…)">
      <div class="nl-linha-cores">${cor("capa.cor", e.capa.cor, "Couro")}${cor("capa.detalhe", e.capa.detalhe, "Detalhes")}</div></div>` : ""}
    ${e.formato === "carta" ? `<div class="nl-sub"><span class="nl-rot">Lacre</span>
      <div class="nl-linha-cores">${chk("lacre.ativo", e.lacre.ativo, "Lacrada", "Quem abre vê o envelope e rompe o lacre para ler")}${e.lacre.ativo ? `${cor("lacre.cor", e.lacre.cor, "Cera")}<input type="text" class="nl-in nl-in-curto" data-esc="lacre.simbolo" maxlength="2" value="${esc(e.lacre.simbolo)}" placeholder="✦" title="Letra ou símbolo no selo (até 2)">` : ""}</div>
      ${e.lacre.ativo && e.lacre.rompido ? `<button type="button" class="nl-btn nt-ch nl-btn-p" data-esc-acao="relacrar"><i class="fas fa-stamp"></i> Lacrar de novo</button>` : ""}</div>` : ""}
    <div class="nl-sub"><span class="nl-rot">Quem pode</span>
      <div class="nl-seg">${[["mestre", "Só o Mestre escreve"], ["dono", "O dono também escreve"]].map(([k, r]) => `<button type="button" class="${e.quemEscreve === k ? "on" : ""}" data-esc-quem="${k}">${r}</button>`).join("")}</div>
      ${chk("lerNoBau", e.lerNoBau, "Dá para ler no baú, sem pegar")}
      ${chk("gastaAoUsar", e.gastaAoUsar, "Some ao usar uma Ação (pergaminho de magia)", "Cada uso de uma Ação deste item gasta 1 da quantidade")}
    </div>
  </div>`;
}
/** Liga os controles de estilo: cada mudança grava no item. */
export function naurenEscritoLigarEstilo(raiz, item, depois = null) {
  if (!raiz || !item) return;
  const mudar = async fn => { const e = naurenEscritoDe(item); fn(e); await gravar(item, e); depois?.(); };
  raiz.querySelectorAll("[data-esc-formato]").forEach(b => b.addEventListener("click", ev => { ev.preventDefault(); mudar(e => {
    const f = b.dataset.escFormato; if (e.formato === f) return;
    e.formato = f; Object.assign(e, SUGESTAO_DO_FORMATO[f] ?? {}); e.tinta = "";
    if (f === "carta" && !e.lacre.ativo) e.lacre.ativo = true;
  }); }));
  raiz.querySelectorAll("[data-esc-quem]").forEach(b => b.addEventListener("click", ev => { ev.preventDefault(); mudar(e => { e.quemEscreve = b.dataset.escQuem; }); }));
  raiz.querySelectorAll("[data-esc-acao=relacrar]").forEach(b => b.addEventListener("click", ev => { ev.preventDefault(); mudar(e => { e.lacre.rompido = false; }); }));
  raiz.querySelectorAll("input[type=range][data-esc]").forEach(inp => inp.addEventListener("input", () => { const v = raiz.querySelector(`[data-esc-ver="${inp.dataset.esc}"]`); if (v) v.textContent = `${inp.value}%`; }));
  raiz.querySelectorAll("[data-esc]").forEach(inp => inp.addEventListener("change", () => mudar(e => {
    const v = inp.type === "checkbox" ? inp.checked : inp.type === "range" ? Number(inp.value) : inp.value;
    foundry.utils.setProperty(e, inp.dataset.esc, v);
    if (inp.dataset.esc === "papel") e.tinta = ""; // papel novo volta para a tinta dele
  })));
}

/* ------------------------------ aba "Escrito" da ficha do item ------------------------------ */
export function naurenEscritoAbaHtml(item) {
  const e = naurenEscritoDe(item); if (!e) return "";
  const f = NAUREN_ESCRITO_FORMATOS[e.formato];
  const cheias = e.paginas.filter(p => !semTexto(p)).length;
  const pode = naurenEscritoPodeEscrever(item);
  const titulo = e.capa.titulo || item.name;
  return `<div class="nl-aba">
    <div class="nl-aba-topo">
      <div class="nl-mini nl-fmt-${e.formato} nl-papel-${e.papel}" style="${esc(`--nl-tinta:${tintaDe(e)};--nl-capa:${e.capa.cor};--nl-detalhe:${e.capa.detalhe};--nl-lacre:${e.lacre.cor};--nl-fonte:${NAUREN_ESCRITO_FONTES[e.fonte].css}`)}">
        ${ehLivro(e) ? `<div class="nl-mini-capa"><b>${esc(titulo)}</b></div>` : `<div class="nl-mini-folha"><b>${esc(e.paginas[0]?.nome || item.name)}</b><span></span><span></span><span></span>${e.formato === "carta" && e.lacre.ativo ? `<i class="nl-mini-lacre"></i>` : ""}</div>`}
      </div>
      <div class="nl-aba-info">
        <div class="nl-aba-tit"><i class="fas ${f.ic}"></i> ${f.rot} · ${e.paginas.length} ${e.paginas.length === 1 ? "página" : "páginas"}${cheias < e.paginas.length ? ` <small>(${e.paginas.length - cheias} em branco)</small>` : ""}</div>
        <p class="nl-dica">O texto fica guardado neste item. Os jogadores leem pelo botão <b>Ler</b> no inventário${e.lerNoBau ? " ou direto no baú" : ""}.</p>
        <div class="nl-aba-bts">
          <button type="button" class="nl-btn nt-ch nl-btn-p" data-escrito="ler"><i class="fas fa-book-open-reader"></i> Ler</button>
          ${pode ? `<button type="button" class="nl-btn nt-ch" data-escrito="escrever"><i class="fas fa-feather-pointed"></i> Escrever as páginas</button>` : ""}
          ${game.user?.isGM ? `<button type="button" class="nl-btn nt-ch" data-escrito="mostrar" title="Abre o escrito na tela de todos os jogadores"><i class="fas fa-eye"></i> Mostrar aos jogadores</button>` : ""}
        </div>
      </div>
    </div>
    ${pode ? naurenEscritoEstiloHtml(e) : ""}
  </div>`;
}
export function naurenEscritoLigarAba(sheet) {
  const item = sheet.document ?? sheet.item; const raiz = sheet.element?.querySelector?.(".nl-aba"); if (!raiz || !item) return;
  raiz.querySelectorAll("[data-escrito]").forEach(b => b.addEventListener("click", ev => {
    ev.preventDefault();
    const a = b.dataset.escrito;
    if (a === "ler") naurenAbrirEscrito(item);
    else if (a === "escrever") naurenAbrirEscrito(item, { editar: true });
    else if (a === "mostrar") naurenEscritoMostrar(item);
  }));
  naurenEscritoLigarEstilo(raiz, item, () => { if (sheet.rendered) sheet.render(); });
}

/* ------------------------------ mostrar aos jogadores ------------------------------ */
export async function naurenEscritoMostrar(item) {
  if (!game.user?.isGM || !item) return;
  const e = naurenEscritoDe(item), f = NAUREN_ESCRITO_FORMATOS[e.formato];
  await ChatMessage.create({
    speaker: { alias: "Mestre" },
    content: `<div class="nl-chat"><i class="fas ${f.ic}"></i><div><b>${esc(item.name)}</b><small>${f.rot} mostrado pelo Mestre</small></div><button type="button" class="nl-chat-ler" data-uuid="${esc(item.uuid)}"><i class="fas fa-book-open-reader"></i> Ler</button></div>`,
    flags: { [SIS]: { escritoMostrar: item.uuid } }
  });
}

/* ------------------------------ o leitor ------------------------------ */
const TAM_CHAVE = "nauren.leitor.tamanho";
function tamLocal() { try { return Number(localStorage.getItem(TAM_CHAVE)) || 100; } catch (err) { return 100; } }
function guardarTam(v) { try { localStorage.setItem(TAM_CHAVE, String(v)); } catch (err) { /* sem armazenamento */ } }

export class NaurenLeitor extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    classes: ["nauren-kit", "nauren-leitor"],
    position: { width: 640, height: 760 },
    window: { icon: "fas fa-book-open-reader", resizable: true },
    actions: {
      anterior: function () { this.virar(-1); },
      proxima: function () { this.virar(1); },
      abrirCapa: function () { this.pag = 0; this.animar = "dir"; this.render(); },
      fecharCapa: function () { this.pag = -1; this.animar = "esq"; this.render(); },
      romperLacre: function () { this.romperLacre(); },
      letraMenos: function () { this.tam = Math.max(70, this.tam - 10); guardarTam(this.tam); this.render(); },
      letraMais: function () { this.tam = Math.min(170, this.tam + 10); guardarTam(this.tam); this.render(); },
      editar: async function () { this.editando = true; this.render(); },
      ler: async function () { await this.salvarTexto(); this.editando = false; this.render(); },
      mostrar: function () { naurenEscritoMostrar(this.item); },
      usarAcao: function (ev, el) { this.usarAcao(Number(el.dataset.i)); },
      irPagina: async function (ev, el) { await this.salvarTexto(); this.edPag = Number(el.dataset.i); this.render(); },
      novaPagina: async function (ev, el) { await this.novaPagina(el.dataset.tipo); },
      apagarPagina: async function (ev, el) { await this.apagarPagina(Number(el.dataset.i)); },
      moverPagina: async function (ev, el) { await this.moverPagina(Number(el.dataset.i), Number(el.dataset.d)); },
      escolherImagem: function () { this.escolherImagem(); },
      salvar: async function () { await this.salvarTexto(true); }
    }
  };
  constructor({ item, ...op } = {}) {
    const e0 = naurenEscritoDe(item), f0 = NAUREN_ESCRITO_FORMATOS[e0.formato];
    const largura = ehLivro(e0) ? 980 : e0.formato === "pergaminho" ? 600 : 580;
    super({ ...op, id: `nauren-leitor-${item.id}-${(item.parent?.id ?? "w")}`, window: { title: item.name, icon: `fas ${f0.ic}`, resizable: true }, position: { width: largura, height: ehLivro(e0) ? 720 : 760 } });
    this.item = item;
    this.pag = ehLivro(e0) ? -1 : 0;   // livro começa na capa
    this.edPag = 0;
    this.editando = false;
    this.tam = tamLocal();
    this.animar = "";
    this.lacreAberto = false;          // carta lacrada aberta só nesta tela (quem não é dono)
  }
  get title() { return this.item?.name ?? "Escrito"; }
  get e() { return naurenEscritoDe(this.item); }
  /** Quantas páginas aparecem de uma vez (livro aberto = 2). */
  get porVez() { return ehLivro(this.e) && !this.editando ? 2 : 1; }
  irPara(i, render = true) {
    const e = this.e, n = e.paginas.length;
    let v = Math.max(ehLivro(e) ? -1 : 0, Math.min(n - 1, i));
    if (this.porVez === 2 && v > 0) v = v - (v % 2);
    this.pag = v; if (render) this.render();
  }
  virar(d) {
    const e = this.e, n = e.paginas.length;
    if (ehLivro(e)) {
      if (this.pag === -1) { if (d > 0) { this.pag = 0; this.animar = "dir"; this.render(); } return; }
      const novo = this.pag + d * 2;
      if (novo < 0) { this.pag = -1; this.animar = "esq"; return this.render(); }
      if (novo > n - 1) return;
      this.pag = novo; this.animar = d > 0 ? "dir" : "esq"; return this.render();
    }
    const novo = this.pag + d; if (novo < 0 || novo > n - 1) return;
    this.pag = novo; this.animar = d > 0 ? "dir" : "esq"; this.render();
  }

  /* ---------- HTML ---------- */
  estiloVars(e) {
    const fonte = NAUREN_ESCRITO_FONTES[e.fonte];
    const tam = (15 * fonte.escala * (e.tamanho / 100) * (this.tam / 100)).toFixed(2);
    return `--nl-tinta:${tintaDe(e)};--nl-fonte:${fonte.css};--nl-tam:${tam}px;--nl-capa:${e.capa.cor};--nl-detalhe:${e.capa.detalhe};--nl-lacre:${e.lacre.cor}`;
  }
  async folhaHtml(p, n, total, e) {
    if (!p) return `<article class="nl-folha nl-folha-vazia"><div class="nl-folha-corpo"></div></article>`;
    let corpo;
    if (p.tipo === "imagem") corpo = p.src ? `<figure class="nl-fig"><img src="${esc(p.src)}" alt=""><figcaption>${esc(p.legenda)}</figcaption></figure>` : `<p class="nl-vazio">(imagem não escolhida)</p>`;
    else corpo = semTexto(p) ? `<p class="nl-vazio">${e.quemEscreve === "dono" ? "Página em branco." : "…"}</p>` : await enriquecer(p.texto, this.item);
    const capitular = ehLivro(e) && n === 0 && p.tipo === "texto" ? "nl-capitular" : "";
    return `<article class="nl-folha" data-pag="${n}">
      ${p.nome ? `<h2 class="nl-folha-tit">${esc(p.nome)}</h2>` : ""}
      <div class="nl-folha-corpo ${capitular}">${corpo}</div>
      ${total > 1 ? `<footer class="nl-folha-num">${n + 1}</footer>` : ""}
    </article>`;
  }
  async lerHtml(e) {
    const n = e.paginas.length, livro = ehLivro(e), titulo = e.capa.titulo || this.item.name;
    let palco = "";
    const anim = this.animar ? `nl-vira-${this.animar}` : ""; this.animar = "";
    if (livro && this.pag === -1) {
      palco = `<div class="nl-livro-fechado ${anim}"><button type="button" class="nl-capa" data-action="abrirCapa" title="Abrir">
        <span class="nl-capa-moldura"></span><span class="nl-capa-canto c1"></span><span class="nl-capa-canto c2"></span><span class="nl-capa-canto c3"></span><span class="nl-capa-canto c4"></span>
        <span class="nl-capa-tit">${esc(titulo)}</span>${e.capa.subtitulo ? `<span class="nl-capa-sub">${esc(e.capa.subtitulo)}</span>` : ""}
        <span class="nl-capa-orn"><i class="fas ${e.formato === "diario" ? "fa-feather-pointed" : "fa-star"}"></i></span>
        ${e.formato === "diario" ? `<span class="nl-fita"></span>` : ""}
        <span class="nl-capa-abrir"><i class="fas fa-book-open"></i> Abrir</span>
      </button></div>`;
    } else if (e.formato === "carta" && e.lacre.ativo && !e.lacre.rompido && !this.lacreAberto) {
      palco = `<div class="nl-envelope">
        <div class="nl-env-corpo"><span class="nl-env-aba"></span><span class="nl-env-nome">${esc(this.item.name)}</span>
          <button type="button" class="nl-selo" data-action="romperLacre" title="Romper o lacre"><span>${esc(e.lacre.simbolo || "✦")}</span></button></div>
        <p class="nl-dica nl-env-dica">Clique no lacre para abrir.</p></div>`;
    } else if (livro) {
      const a = this.pag, b = a + 1;
      palco = `<div class="nl-livro ${anim}"><div class="nl-livro-capa"><div class="nl-livro-paginas">
        ${await this.folhaHtml(e.paginas[a], a, n, e)}${await this.folhaHtml(e.paginas[b], b, n, e)}
        ${e.formato === "diario" ? `<span class="nl-fita nl-fita-aberta"></span>` : ""}
      </div></div></div>`;
    } else {
      palco = `<div class="nl-solta ${anim}">${e.formato === "pergaminho" ? `<span class="nl-vareta nl-vareta-c"></span>` : ""}${await this.folhaHtml(e.paginas[this.pag], this.pag, n, e)}${e.formato === "pergaminho" ? `<span class="nl-vareta nl-vareta-b"></span>` : ""}</div>`;
    }
    // navegação
    const fechado = (livro && this.pag === -1) || palco.includes("nl-envelope");
    const ultima = livro ? this.pag + 2 > n - 1 : this.pag >= n - 1;
    const rotPag = livro ? (this.pag === -1 ? "Capa" : `Páginas ${this.pag + 1}${this.pag + 1 < n ? `–${this.pag + 2}` : ""} de ${n}`) : `Página ${this.pag + 1} de ${n}`;
    const sumario = n > 1 && !fechado ? `<select class="nl-in nl-sumario" data-sumario title="Ir para a página">${e.paginas.map((p, i) => `<option value="${i}" ${(i === this.pag || (livro && i === this.pag + 1)) ? "selected" : ""}>${i + 1}. ${esc(p.nome || (p.tipo === "imagem" ? "Imagem" : `Página ${i + 1}`))}</option>`).join("")}</select>` : "";
    const acoes = (this.item.system.acoes ?? []);
    const podeUsar = acoes.length && this.item.actor?.isOwner && this.item.actor?.sheet?._executarAcao;
    return `<header class="nl-barra">
        <div class="nl-barra-esq">${sumario}</div>
        <div class="nl-barra-dir">
          <button type="button" class="nl-ic" data-action="letraMenos" title="Letra menor"><i class="fas fa-minus"></i><span>A</span></button>
          <button type="button" class="nl-ic nl-ic-grande" data-action="letraMais" title="Letra maior"><i class="fas fa-plus"></i><span>A</span></button>
          ${livro && this.pag >= 0 ? `<button type="button" class="nl-ic" data-action="fecharCapa" title="Fechar o livro"><i class="fas fa-book"></i></button>` : ""}
          ${game.user?.isGM ? `<button type="button" class="nl-ic" data-action="mostrar" title="Mostrar aos jogadores"><i class="fas fa-eye"></i></button>` : ""}
          ${naurenEscritoPodeEscrever(this.item) ? `<button type="button" class="nl-btn nt-ch" data-action="editar"><i class="fas fa-feather-pointed"></i> Escrever</button>` : ""}
        </div>
      </header>
      <main class="nl-palco" tabindex="0">${palco}</main>
      <footer class="nl-nav">
        <button type="button" class="nl-seta" data-action="anterior" ${(livro ? this.pag === -1 : this.pag === 0) ? "disabled" : ""} title="Anterior (←)"><i class="fas fa-chevron-left"></i></button>
        <span class="nl-nav-txt">${rotPag}</span>
        <button type="button" class="nl-seta" data-action="proxima" ${(!fechado && ultima) || (fechado && !livro) ? "disabled" : ""} title="Próxima (→)"><i class="fas fa-chevron-right"></i></button>
        ${podeUsar ? `<span class="nl-acoes">${acoes.map((a, i) => `<button type="button" class="nl-btn nt-ch nl-btn-magia" data-action="usarAcao" data-i="${i}" title="Usar esta Ação do item"><i class="fas fa-wand-sparkles"></i> ${esc(a.nome || `Ação ${i + 1}`)}</button>`).join("")}</span>` : ""}
      </footer>`;
  }
  async editarHtml(e) {
    const n = e.paginas.length; this.edPag = Math.min(this.edPag, n - 1);
    const p = e.paginas[this.edPag];
    const lista = e.paginas.map((pg, i) => `<div class="nl-ed-item ${i === this.edPag ? "on" : ""}">
      <button type="button" class="nl-ed-nome" data-action="irPagina" data-i="${i}"><span class="nl-ed-n">${i + 1}</span><i class="fas ${pg.tipo === "imagem" ? "fa-image" : "fa-align-left"}"></i><span class="nl-ed-t">${esc(pg.nome || (pg.tipo === "imagem" ? "Imagem" : `Página ${i + 1}`))}</span>${semTexto(pg) ? `<small>vazia</small>` : ""}</button>
      <span class="nl-ed-bts"><button type="button" class="nl-mini-bt" data-action="moverPagina" data-i="${i}" data-d="-1" ${i === 0 ? "disabled" : ""} title="Subir"><i class="fas fa-arrow-up"></i></button><button type="button" class="nl-mini-bt" data-action="moverPagina" data-i="${i}" data-d="1" ${i === n - 1 ? "disabled" : ""} title="Descer"><i class="fas fa-arrow-down"></i></button><button type="button" class="nl-mini-bt nl-mini-x" data-action="apagarPagina" data-i="${i}" ${n === 1 ? "disabled" : ""} title="Apagar a página"><i class="fas fa-trash"></i></button></span>
    </div>`).join("");
    const PM = customElements.get?.("prose-mirror");
    const editor = p.tipo === "imagem"
      ? `<div class="nl-ed-img">${p.src ? `<img src="${esc(p.src)}" alt="">` : `<div class="nl-ed-img-vazia"><i class="fas fa-image"></i></div>`}
          <div class="nl-ed-img-bts"><button type="button" class="nl-btn nt-ch" data-action="escolherImagem"><i class="fas fa-folder-open"></i> Escolher imagem</button>
          <input type="text" class="nl-in" data-pag-campo="src" value="${esc(p.src)}" placeholder="caminho da imagem"></div>
          <input type="text" class="nl-in" data-pag-campo="legenda" value="${esc(p.legenda)}" placeholder="Legenda (opcional)"></div>`
      : PM ? `<prose-mirror class="nl-pm" name="texto" data-document-uuid="${esc(this.item.uuid)}" value="${esc(p.texto)}"></prose-mirror>`
        : `<textarea class="nl-pm nl-pm-simples" name="texto">${esc(p.texto)}</textarea>`;
    return `<header class="nl-barra">
        <div class="nl-barra-esq"><span class="nl-barra-tit"><i class="fas fa-feather-pointed"></i> Escrevendo</span></div>
        <div class="nl-barra-dir">
          ${game.user?.isGM ? `<button type="button" class="nl-ic" data-action="mostrar" title="Mostrar aos jogadores"><i class="fas fa-eye"></i></button>` : ""}
          <button type="button" class="nl-btn nt-ch nl-btn-p" data-action="ler"><i class="fas fa-book-open-reader"></i> Ver como fica</button>
        </div>
      </header>
      <div class="nl-edicao">
        <aside class="nl-ed-lado">
          <div class="nl-ed-sec"><span class="nl-rot">Páginas</span><div class="nl-ed-lista" data-soltar-jornal>${lista}</div>
            <div class="nl-ed-novas"><button type="button" class="nl-btn nt-ch" data-action="novaPagina" data-tipo="texto"><i class="fas fa-plus"></i> Texto</button><button type="button" class="nl-btn nt-ch" data-action="novaPagina" data-tipo="imagem"><i class="fas fa-plus"></i> Imagem</button></div>
            <p class="nl-dica"><i class="fas fa-book-atlas"></i> Arraste um <b>Jornal</b> (ou uma página dele) para cá para copiar as páginas.</p></div>
          <details class="nl-ed-sec nl-ed-estilo" ${this.estiloAberto ? "open" : ""}><summary><span class="nl-rot">Aparência</span></summary>${naurenEscritoEstiloHtml(e, { compacto: true })}</details>
        </aside>
        <section class="nl-ed-pagina">
          <div class="nl-ed-cab"><input type="text" class="nl-in nl-ed-titulo" data-pag-campo="nome" value="${esc(p.nome)}" placeholder="Título da página (opcional)"><span class="nl-ed-salvo" data-salvo>Salvo</span></div>
          <div class="nl-ed-folha nl-papel-${e.papel}">${editor}</div>
          <p class="nl-dica">Tudo do editor dos Jornais funciona aqui: títulos, listas, imagens, links (@UUID), rolagens e <b>Segredo</b> (só o Mestre vê). Salva sozinho ao trocar de página ou fechar; Ctrl+S salva na hora.</p>
        </section>
      </div>`;
  }
  async _renderHTML() {
    const e = this.e;
    const corpo = this.editando ? await this.editarHtml(e) : await this.lerHtml(e);
    return `<div class="nl-raiz nl-fmt-${e.formato} nl-papel-${e.papel} ${this.editando ? "nl-modo-edicao" : "nl-modo-leitura"}" style="${esc(this.estiloVars(e))}">${corpo}</div>`;
  }
  _replaceHTML(html, content) {
    const corpo = content.querySelector(".nl-folha-corpo"); const top = corpo?.scrollTop ?? 0; const mesmaPag = this._ultimaPag === this.pag;
    content.innerHTML = html;
    const c2 = content.querySelector(".nl-folha-corpo"); if (c2 && mesmaPag) c2.scrollTop = top;
    this._ultimaPag = this.pag;
  }
  _onRender() {
    const el = this.element; if (!el) return;
    const e = this.e;
    el.classList.toggle("nl-janela-livro", ehLivro(e));
    // teclado: ← →
    const palco = el.querySelector(".nl-palco");
    if (palco && !this._teclas) {
      this._teclas = ev => { if (this.editando || ev.target.closest?.("input, textarea, select, prose-mirror")) return; if (ev.key === "ArrowRight" || ev.key === "PageDown") { ev.preventDefault(); this.virar(1); } else if (ev.key === "ArrowLeft" || ev.key === "PageUp") { ev.preventDefault(); this.virar(-1); } };
      el.addEventListener("keydown", this._teclas);
    }
    el.querySelector("[data-sumario]")?.addEventListener("change", ev => { this.irPara(Number(ev.target.value)); });
    if (!this.editando) return;
    // escrever pede mais espaço (lista de páginas + editor)
    try { if ((this.position?.width ?? 0) < 900) this.setPosition({ width: 940, height: Math.max(this.position?.height ?? 0, 760) }); } catch (err) { /* ok */ }
    // campos da página
    el.querySelectorAll("[data-pag-campo]").forEach(inp => inp.addEventListener("change", () => this.mudarPagina(p => { p[inp.dataset.pagCampo] = inp.value; })));
    const pm = el.querySelector(".nl-pm");
    pm?.addEventListener("change", () => this.salvarTexto());
    pm?.addEventListener("input", () => this.marcarSalvo(false));
    pm?.addEventListener("keyup", () => this.marcarSalvo(false));
    const det = el.querySelector(".nl-ed-estilo"); det?.addEventListener("toggle", () => { this.estiloAberto = det.open; });
    naurenEscritoLigarEstilo(el.querySelector(".nl-ed-estilo"), this.item, async () => { await this.salvarTexto(); this.render(); });
    // arrastar um Jornal para copiar as páginas
    const alvo = el.querySelector("[data-soltar-jornal]")?.closest(".nl-ed-sec");
    alvo?.addEventListener("dragover", ev => { ev.preventDefault(); alvo.classList.add("nl-soltar"); });
    alvo?.addEventListener("dragleave", () => alvo.classList.remove("nl-soltar"));
    alvo?.addEventListener("drop", ev => { ev.preventDefault(); alvo.classList.remove("nl-soltar"); this.soltarJornal(ev); });
  }
  marcarSalvo(ok) { const s = this.element?.querySelector("[data-salvo]"); if (s) { s.textContent = ok ? "Salvo" : "Não salvo"; s.classList.toggle("pendente", !ok); } }
  async _preClose(op) { try { await this.salvarTexto(); } catch (err) { /* segue */ } return super._preClose?.(op); }
  _onClose(op) { abertos.delete(this.item?.uuid); super._onClose?.(op); }

  /* ---------- ações ---------- */
  async mudarPagina(fn, i = this.edPag) {
    const e = this.e; const p = e.paginas[i]; if (!p) return;
    fn(p); await gravar(this.item, e); this.marcarSalvo(true);
  }
  /** Lê o editor e grava o texto da página aberta (se mudou). */
  async salvarTexto(avisar = false) {
    if (!this.editando || this._salvando) return;
    const pm = this.element?.querySelector(".nl-pm"); if (!pm) return;
    const valor = pm.value ?? ""; const e = this.e; const p = e.paginas[this.edPag];
    if (!p || p.tipo !== "texto" || valor === p.texto) { if (avisar) this.marcarSalvo(true); return; }
    this._salvando = true;
    try { p.texto = valor; await gravar(this.item, e); this.marcarSalvo(true); }
    finally { this._salvando = false; }
  }
  async novaPagina(tipo) {
    await this.salvarTexto();
    const e = this.e; e.paginas.splice(this.edPag + 1, 0, pagina({ tipo: tipo === "imagem" ? "imagem" : "texto" }));
    this.edPag += 1; await gravar(this.item, e); this.render();
  }
  async apagarPagina(i) {
    const e = this.e; if (e.paginas.length <= 1) return;
    const p = e.paginas[i];
    if (!semTexto(p)) {
      const ok = await foundry.applications.api.DialogV2.confirm({ window: { title: "Apagar a página?" }, content: `<p>Apagar a página <b>${esc(p.nome || i + 1)}</b>? O texto dela se perde.</p>`, rejectClose: false }).catch(() => false);
      if (!ok) return;
    }
    await this.salvarTexto();
    const e2 = this.e; e2.paginas.splice(i, 1); this.edPag = Math.max(0, Math.min(this.edPag, e2.paginas.length - 1));
    await gravar(this.item, e2); this.render();
  }
  async moverPagina(i, d) {
    await this.salvarTexto();
    const e = this.e, j = i + d; if (j < 0 || j >= e.paginas.length) return;
    [e.paginas[i], e.paginas[j]] = [e.paginas[j], e.paginas[i]];
    if (this.edPag === i) this.edPag = j; else if (this.edPag === j) this.edPag = i;
    await gravar(this.item, e); this.render();
  }
  escolherImagem() {
    const FP = foundry.applications?.apps?.FilePicker?.implementation ?? globalThis.FilePicker;
    new FP({ type: "image", current: this.e.paginas[this.edPag]?.src ?? "", callback: async src => { await this.mudarPagina(p => { p.src = src; }); this.render(); } }).render(true);
  }
  async soltarJornal(ev) {
    let dados; try { dados = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err) { return; }
    if (!["JournalEntry", "JournalEntryPage"].includes(dados?.type)) return ui.notifications?.info("Arraste um Jornal ou uma página de Jornal.");
    const doc = await fromUuid(dados.uuid); if (!doc) return;
    const pags = dados.type === "JournalEntry" ? [...(doc.pages?.contents ?? doc.pages ?? [])].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)) : [doc];
    const novas = pags.map(pg => pg.type === "image" ? pagina({ nome: pg.name, tipo: "imagem", src: pg.src ?? "", legenda: pg.image?.caption ?? "" })
      : pg.type === "text" ? pagina({ nome: pg.name, texto: pg.text?.content ?? "" }) : null).filter(Boolean);
    if (!novas.length) return ui.notifications?.info("Esse Jornal não tem páginas de texto ou imagem.");
    await this.salvarTexto();
    const e = this.e;
    const soUmaVazia = e.paginas.length === 1 && semTexto(e.paginas[0]) && !e.paginas[0].nome;
    e.paginas = soUmaVazia ? novas : [...e.paginas, ...novas];
    this.edPag = soUmaVazia ? 0 : e.paginas.length - novas.length;
    await gravar(this.item, e); this.render();
    ui.notifications?.info(`${novas.length} ${novas.length === 1 ? "página copiada" : "páginas copiadas"} de "${doc.name}".`);
  }
  async romperLacre() {
    if (this.item.isOwner) { const e = this.e; e.lacre.rompido = true; await gravar(this.item, e); }
    this.lacreAberto = true; this.animar = "dir"; this.render();
  }
  async usarAcao(i) {
    const item = this.item, sheet = item.actor?.sheet;
    if (!sheet?._executarAcao) return;
    await sheet._executarAcao(item, i);
  }
}

/* ------------------------------ ganchos ------------------------------ */
export function naurenEscritosInit() {
  // fontes dos escritos (também aparecem na lista de fontes do editor)
  const base = `systems/${SIS}/assets/fontes`;
  Object.assign(CONFIG.fontDefinitions ?? {}, {
    "Nauren Livro": { editor: true, fonts: [{ urls: [`${base}/Lora-Variable.ttf`], weight: "400 700" }, { urls: [`${base}/Lora-Italic-Variable.ttf`], weight: "400 700", style: "italic" }] },
    "Nauren Caligrafia": { editor: true, fonts: [{ urls: [`${base}/TexGyreChorus.otf`] }] },
    "Nauren Classica": { editor: true, fonts: [{ urls: [`${base}/TexGyrePagella-Regular.otf`] }, { urls: [`${base}/TexGyrePagella-Italic.otf`], style: "italic" }, { urls: [`${base}/TexGyrePagella-Bold.otf`], weight: 700 }] },
    "Nauren Antiga": { editor: true, fonts: [{ urls: [`${base}/GFSBaskerville.otf`] }] }
  });
  // o leitor aberto acompanha o item (outra pessoa escreveu, o Mestre mudou o papel…)
  Hooks.on("updateItem", item => {
    const ap = abertos.get(item.uuid); if (!ap?.rendered) return;
    if (ap.editando) return; // quem está escrevendo redesenha sozinho (não perde o que ainda não foi salvo)
    ap.render();
  });
  Hooks.on("deleteItem", item => { abertos.get(item.uuid)?.close(); });
  // "Mostrar aos jogadores": abre para todos (menos para quem mostrou)
  Hooks.on("createChatMessage", msg => {
    const uuid = msg.getFlag?.(SIS, "escritoMostrar"); if (!uuid || msg.author?.id === game.user?.id) return;
    naurenAbrirEscrito(uuid);
  });
  Hooks.on("renderChatMessageHTML", (msg, html) => {
    html.querySelectorAll?.(".nl-chat-ler").forEach(b => b.addEventListener("click", ev => { ev.preventDefault(); naurenAbrirEscrito(b.dataset.uuid); }));
  });
}
