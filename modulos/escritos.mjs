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
  pergaminho: { rot: "Pergaminho", ic: "fa-scroll", dica: "Rolo com varetas. Bom para magias e decretos.",
    eras: { moderno: { rot: "Ficha", ic: "fa-id-card", dica: "Um cartão ou ficha: documento, crachá, cartão de visita." }, cyberpunk: { rot: "Painel", ic: "fa-tablet-screen-button", dica: "Um painel de dados: ficha de alvo, crachá digital, aviso de sistema." } } },
  livro: { rot: "Livro", ic: "fa-book", dica: "Capa e páginas lado a lado, como um livro aberto." },
  diario: { rot: "Diário", ic: "fa-book-bookmark", dica: "Livro com fita marcadora. Por padrão, o dono escreve nele." }
};
/** 0.111: a época do escrito. Muda os papéis e letras sugeridos (tudo continua editável). */
export const NAUREN_ESCRITO_ERAS = {
  classico: { rot: "Clássico", dica: "pergaminho, cera, livro", ic: "fa-feather-pointed" },
  moderno: { rot: "Moderno", dica: "post-it, folha A4, caderno", ic: "fa-pen" },
  cyberpunk: { rot: "Cyberpunk", dica: "terminal, neon, holograma", ic: "fa-microchip" }
};
export const NAUREN_ESCRITO_PAPEIS = {
  envelhecido: "Envelhecido", pergaminho: "Pergaminho", creme: "Creme", branco: "Branco", noturno: "Noturno", arcano: "Arcano",
  a4: "Folha A4", postit: "Post-it", pautado: "Caderno pautado", cartao: "Cartão", tela: "Tela escura",
  terminal: "Terminal verde", neon: "Neon magenta", holograma: "Holograma ciano", ambar: "Painel âmbar"
};
/** Era de cada papel, e as cores da amostra (fundo, tinta) no seletor. */
export const NAUREN_ESCRITO_PAPEL_ERA = {
  envelhecido: "classico", pergaminho: "classico", creme: "classico", branco: "classico", noturno: "classico", arcano: "classico",
  a4: "moderno", postit: "moderno", pautado: "moderno", cartao: "moderno", tela: "moderno",
  terminal: "cyberpunk", neon: "cyberpunk", holograma: "cyberpunk", ambar: "cyberpunk"
};
const AMOSTRA_DO_PAPEL = {
  envelhecido: "#dcc596", pergaminho: "#e2cc98", creme: "#f1e6cb", branco: "#f7f5ef", noturno: "#211b28", arcano: "#18233d",
  a4: "#ffffff", postit: "#ffe97a", pautado: "#f7f7f2", cartao: "#ece5d6", tela: "#1d1e25",
  terminal: "#05110a", neon: "#16061a", holograma: "#0a2230", ambar: "#160f05"
};
export const NAUREN_ESCRITO_FONTES = {
  caligrafia: { rot: "Caligrafia", css: "\"Nauren Caligrafia\", \"Nauren Livro\", Georgia, serif", escala: 1.18, era: "classico" },
  livro: { rot: "Livro", css: "\"Nauren Livro\", Georgia, serif", escala: 1, era: "classico" },
  classica: { rot: "Clássica", css: "\"Nauren Classica\", \"Palatino Linotype\", Georgia, serif", escala: 1.04, era: "classico" },
  antiga: { rot: "Antiga", css: "\"Nauren Antiga\", \"Nauren Classica\", Georgia, serif", escala: 1.06, era: "classico" },
  titulo: { rot: "Letreiro", css: "\"Modesto Condensed\", \"Nauren Classica\", serif", escala: 1.12, era: "classico" },
  simples: { rot: "Simples", css: "Signika, \"Segoe UI\", sans-serif", escala: .96, era: "moderno" },
  sans: { rot: "Sem serifa", css: "\"Nauren Moderna\", \"Segoe UI\", Arial, sans-serif", escala: .95, era: "moderno" },
  manuscrita: { rot: "Manuscrita", css: "\"Nauren Manuscrita\", \"Segoe Print\", cursive", escala: 1.34, era: "moderno" },
  maquina: { rot: "Máquina de escrever", css: "\"Nauren Maquina\", \"Courier New\", monospace", escala: .98, era: "moderno" },
  mono: { rot: "Monoespaçada", css: "\"Nauren Mono\", Consolas, \"Courier New\", monospace", escala: 1, era: "cyberpunk" },
  tecno: { rot: "Tecnológica", css: "\"Nauren Tecno\", \"Nauren Mono\", sans-serif", escala: .86, era: "cyberpunk" }
};
/** Tinta padrão de cada papel (os escuros pedem tinta clara). */
const TINTA_DO_PAPEL = { envelhecido: "#2b1d10", pergaminho: "#3a2611", creme: "#24180e", branco: "#1c1c22", noturno: "#eadfbe", arcano: "#d6e8ff",
  a4: "#1d1d24", postit: "#2a2a2a", pautado: "#1f3a7a", cartao: "#2b2620", tela: "#e6e7ee",
  terminal: "#6dff9e", neon: "#ffd6ee", holograma: "#bdf3ff", ambar: "#ffc23d" };
/** O que cada formato sugere ao ser escolhido, em cada era (só preenche; tudo continua editável). */
const SUGESTAO_DA_ERA = {
  classico: {
    nota: { papel: "envelhecido", fonte: "caligrafia" },
    carta: { papel: "creme", fonte: "caligrafia" },
    pergaminho: { papel: "pergaminho", fonte: "antiga" },
    livro: { papel: "creme", fonte: "livro" },
    diario: { papel: "creme", fonte: "caligrafia", quemEscreve: "dono" }
  },
  moderno: {
    nota: { papel: "postit", fonte: "manuscrita" },
    carta: { papel: "a4", fonte: "sans" },
    pergaminho: { papel: "cartao", fonte: "maquina" },
    livro: { papel: "a4", fonte: "sans" },
    diario: { papel: "pautado", fonte: "manuscrita", quemEscreve: "dono" }
  },
  cyberpunk: {
    nota: { papel: "holograma", fonte: "mono" },
    carta: { papel: "neon", fonte: "mono" },
    pergaminho: { papel: "ambar", fonte: "mono" },
    livro: { papel: "terminal", fonte: "mono" },
    diario: { papel: "holograma", fonte: "mono", quemEscreve: "dono" }
  }
};
const sugestao = (era, formato) => (SUGESTAO_DA_ERA[era] ?? SUGESTAO_DA_ERA.classico)[formato] ?? {};
/** Papéis de tela "acesa" ligam a varredura sozinhos ao serem sugeridos. */
const PAPEL_COM_VARREDURA = new Set(["terminal", "holograma"]);
/** Cores da capa (livro e diário) sugeridas em cada era. */
const CAPA_DA_ERA = { classico: { cor: "#5b2a1d", detalhe: "#d6b25e" }, moderno: { cor: "#2d3a5a", detalhe: "#e6e7ee" }, cyberpunk: { cor: "#0b1626", detalhe: "#6fe6ff" } };
function aplicarSugestao(e) {
  Object.assign(e, sugestao(e.era, e.formato));
  if (e.era !== "classico") e.efeitos.varredura = PAPEL_COM_VARREDURA.has(e.papel);
}
/** Nome, ícone e dica do formato na era do escrito (o pergaminho vira Ficha/Painel fora do Clássico). */
export function naurenEscritoFormatoRot(formato, era = "classico") {
  const f = NAUREN_ESCRITO_FORMATOS[formato] ?? NAUREN_ESCRITO_FORMATOS.nota;
  return { ...f, ...(f.eras?.[era] ?? {}) };
}

const pagina = (p = {}) => ({
  id: typeof p.id === "string" && p.id ? p.id : novoId(),
  nome: typeof p.nome === "string" ? p.nome : "",
  tipo: p.tipo === "imagem" ? "imagem" : "texto",
  texto: typeof p.texto === "string" ? p.texto : "",
  src: typeof p.src === "string" ? p.src : "",
  legenda: typeof p.legenda === "string" ? p.legenda : ""
});
export const NAUREN_ESCRITO_PADRAO = () => ({
  era: "classico", formato: "nota", papel: "envelhecido", fonte: "caligrafia", tinta: "", tamanho: 100,
  efeitos: { varredura: false, falha: false, digitacao: false },
  capa: { cor: "#5b2a1d", detalhe: "#d6b25e", titulo: "", subtitulo: "" },
  lacre: { ativo: false, cor: "#8c1c1c", simbolo: "", rompido: false },
  quemEscreve: "mestre", lerNoBau: true, gastaAoUsar: false,
  paginas: [pagina()]
});
const hex = (v, d) => /^#[0-9a-f]{6}$/i.test(String(v ?? "")) ? String(v) : d;
export function naurenEscritoNormalizar(e) {
  const p = NAUREN_ESCRITO_PADRAO(); e = e && typeof e === "object" ? e : {};
  const out = {
    era: NAUREN_ESCRITO_ERAS[e.era] ? e.era : p.era,
    formato: NAUREN_ESCRITO_FORMATOS[e.formato] ? e.formato : p.formato,
    papel: NAUREN_ESCRITO_PAPEIS[e.papel] ? e.papel : p.papel,
    fonte: NAUREN_ESCRITO_FONTES[e.fonte] ? e.fonte : p.fonte,
    tinta: hex(e.tinta, ""),
    tamanho: Math.min(160, Math.max(70, Math.round(Number(e.tamanho) || 100))),
    efeitos: { varredura: !!e.efeitos?.varredura, falha: !!e.efeitos?.falha, digitacao: !!e.efeitos?.digitacao },
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
  const eras = Object.entries(NAUREN_ESCRITO_ERAS).map(([k, r]) => `<button type="button" class="nl-era ${e.era === k ? "on" : ""}" data-esc-era="${k}" title="${esc(`${r.rot}: ${r.dica}`)}"><i class="fas ${r.ic}"></i><b>${r.rot}</b><small>${esc(r.dica)}</small></button>`).join("");
  const fmt = Object.keys(NAUREN_ESCRITO_FORMATOS).map(k => { const f = naurenEscritoFormatoRot(k, e.era); return `<button type="button" class="nl-fmt ${e.formato === k ? "on" : ""}" data-esc-formato="${k}" title="${esc(f.dica)}"><i class="fas ${f.ic}"></i><span>${f.rot}</span></button>`; }).join("");
  // papéis: as amostras da era do escrito (e o papel atual, se for de outra era — escritos antigos ou importados)
  const papeis = Object.keys(NAUREN_ESCRITO_PAPEIS).filter(k => NAUREN_ESCRITO_PAPEL_ERA[k] === e.era || k === e.papel);
  const amostras = papeis.map(k => `<button type="button" class="nl-papel-bt ${e.papel === k ? "on" : ""}" data-esc-papel="${k}" title="${esc(NAUREN_ESCRITO_PAPEIS[k])}"><span class="nl-papel-amostra" style="--a-fundo:${AMOSTRA_DO_PAPEL[k]};--a-tinta:${TINTA_DO_PAPEL[k]}"><i>Aa</i></span><span>${esc(NAUREN_ESCRITO_PAPEIS[k])}</span></button>`).join("");
  // letras: as da era primeiro; as outras continuam disponíveis num grupo à parte
  const grupoFonte = (rot, lista) => lista.length ? `<optgroup label="${esc(rot)}">${lista.map(([k, f]) => `<option value="${k}" ${e.fonte === k ? "selected" : ""}>${esc(f.rot)}</option>`).join("")}</optgroup>` : "";
  const fontes = Object.entries(NAUREN_ESCRITO_FONTES);
  const selFonte = `<select class="nl-in" data-esc="fonte">${grupoFonte(`Letras ${NAUREN_ESCRITO_ERAS[e.era].rot === "Clássico" ? "clássicas" : NAUREN_ESCRITO_ERAS[e.era].rot === "Moderno" ? "modernas" : "cyberpunk"}`, fontes.filter(([, f]) => f.era === e.era))}${grupoFonte("Outras eras", fontes.filter(([, f]) => f.era !== e.era))}</select>`;
  const cor = (path, v, rot) => `<label class="nl-cor" title="${esc(rot)}"><input type="color" data-esc="${path}" value="${esc(v)}"><span>${esc(rot)}</span></label>`;
  const chk = (path, v, rot, dica = "") => `<label class="nl-check" ${dica ? `title="${esc(dica)}"` : ""}><input type="checkbox" data-esc="${path}" ${v ? "checked" : ""}> ${esc(rot)}</label>`;
  const fx = (k, rot, ic, dica) => `<label class="nl-fx ${e.efeitos[k] ? "on" : ""}" title="${esc(dica)}"><input type="checkbox" data-esc="efeitos.${k}" ${e.efeitos[k] ? "checked" : ""}><i class="fas ${ic}"></i><span>${rot}</span></label>`;
  return `<div class="nl-estilo ${compacto ? "nl-estilo-compacto" : ""}">
    <div class="nl-campo"><span class="nl-rot">Era</span><div class="nl-eras">${eras}</div></div>
    <div class="nl-campo"><span class="nl-rot">Formato</span><div class="nl-fmts">${fmt}</div></div>
    <div class="nl-campo"><span class="nl-rot">${e.era === "classico" ? "Papel" : "Papel ou tela"}</span><div class="nl-papeis">${amostras}</div></div>
    <div class="nl-grade2">
      <div class="nl-campo"><span class="nl-rot">Letra</span>${selFonte}</div>
      <div class="nl-campo"><span class="nl-rot">Efeitos</span><div class="nl-fxs">
        ${fx("varredura", "Varredura", "fa-bars-staggered", "Linhas de tela e uma faixa de luz passando (bom para terminal e holograma)")}
        ${fx("falha", "Falha", "fa-bolt", "O título treme e se divide em cores de vez em quando, como um sinal ruim")}
        ${fx("digitacao", "Digitação", "fa-keyboard", "O texto aparece letra por letra ao abrir a página. Um clique mostra tudo")}
      </div></div>
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
    e.formato = f; aplicarSugestao(e); e.tinta = "";
    if (f === "carta" && !e.lacre.ativo && e.era === "classico") e.lacre.ativo = true;
  }); }));
  raiz.querySelectorAll("[data-esc-era]").forEach(b => b.addEventListener("click", ev => { ev.preventDefault(); mudar(e => {
    const era = b.dataset.escEra; if (e.era === era) return;
    e.era = era;
    // papel e letra de outra era são trocados pela sugestão desta era (a letra fica se ainda servir)
    const s = sugestao(era, e.formato);
    if (NAUREN_ESCRITO_PAPEL_ERA[e.papel] !== era) { e.papel = s.papel; e.tinta = ""; }
    if (NAUREN_ESCRITO_FONTES[e.fonte]?.era !== era) e.fonte = s.fonte;
    e.efeitos.varredura = PAPEL_COM_VARREDURA.has(e.papel);
    if (era === "classico") e.efeitos.falha = false;
    // capa: se ainda está nas cores sugeridas de alguma era, passa para as desta
    if (Object.values(CAPA_DA_ERA).some(c => c.cor === e.capa.cor && c.detalhe === e.capa.detalhe)) Object.assign(e.capa, CAPA_DA_ERA[era]);
  }); }));
  raiz.querySelectorAll("[data-esc-papel]").forEach(b => b.addEventListener("click", ev => { ev.preventDefault(); mudar(e => {
    if (e.papel === b.dataset.escPapel) return;
    e.papel = b.dataset.escPapel; e.tinta = "";
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
  const f = naurenEscritoFormatoRot(e.formato, e.era);
  const cheias = e.paginas.filter(p => !semTexto(p)).length;
  const pode = naurenEscritoPodeEscrever(item);
  const titulo = e.capa.titulo || item.name;
  return `<div class="nl-aba">
    <div class="nl-aba-topo">
      <div class="nl-mini nl-era-${e.era} nl-fmt-${e.formato} nl-papel-${e.papel}" style="${esc(`--nl-tinta:${tintaDe(e)};--nl-capa:${e.capa.cor};--nl-detalhe:${e.capa.detalhe};--nl-lacre:${e.lacre.cor};--nl-fonte:${NAUREN_ESCRITO_FONTES[e.fonte].css}`)}">
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
        <div class="nl-aba-bts nl-aba-json">
          ${pode ? `<button type="button" class="nl-link" data-escrito="importar" title="Troca o texto e a aparência por um JSON"><i class="fas fa-file-import"></i> Importar JSON</button>` : ""}
          <button type="button" class="nl-link" data-escrito="exportar" title="Baixa o escrito como JSON (para editar fora e importar de novo)"><i class="fas fa-file-export"></i> Exportar JSON</button>
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
    else if (a === "importar") naurenEscritosJanelaImportar({ item });
    else if (a === "exportar") naurenEscritoExportar(item);
  }));
  naurenEscritoLigarEstilo(raiz, item, () => { if (sheet.rendered) sheet.render(); });
}

/* ------------------------------ mostrar aos jogadores ------------------------------ */
export async function naurenEscritoMostrar(item) {
  if (!game.user?.isGM || !item) return;
  const e = naurenEscritoDe(item), f = naurenEscritoFormatoRot(e.formato, e.era);
  await ChatMessage.create({
    speaker: { alias: "Mestre" },
    content: `<div class="nl-chat nl-chat-${e.formato} nl-chat-era-${e.era}"><span class="nl-chat-ic"><i class="fas ${f.ic}"></i></span><div class="nl-chat-txt"><b>${esc(item.name)}</b><small>${f.rot} ${["nota", "carta"].includes(e.formato) || (e.formato === "pergaminho" && e.era === "moderno") ? "mostrada" : "mostrado"} pelo Mestre</small></div><button type="button" class="nl-chat-ler" data-uuid="${esc(item.uuid)}"><i class="fas fa-book-open-reader"></i> Ler</button></div>`,
    flags: { [SIS]: { escritoMostrar: item.uuid } }
  });
}

/* ------------------------------ o leitor ------------------------------ */
const TAM_CHAVE = "nauren.leitor.tamanho";
function tamLocal() { try { return Number(localStorage.getItem(TAM_CHAVE)) || 100; } catch (err) { return 100; } }
function guardarTam(v) { try { localStorage.setItem(TAM_CHAVE, String(v)); } catch (err) { /* sem armazenamento */ } }
function tamJanelaLocal(formato) { try { const o = JSON.parse(localStorage.getItem(`nauren.leitor.janela.${formato}`) ?? "null"); return o && o.width > 200 && o.height > 200 ? o : null; } catch (err) { return null; } }
function guardarTamJanela(formato, pos) { try { localStorage.setItem(`nauren.leitor.janela.${formato}`, JSON.stringify({ width: Math.round(pos.width), height: Math.round(pos.height) })); } catch (err) { /* sem armazenamento */ } }

/** 0.111: animações dos escritos (varredura, falha, digitação). Cada pessoa pode desligar; "reduzir movimento" do sistema também desliga. */
function efeitosAnimados() {
  try { if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return false; } catch (err) { /* sem matchMedia */ }
  try { return game.settings.get(SIS, "escritosEfeitos") !== false; } catch (err) { return true; }
}
/**
 * Mostra o texto dos elementos letra por letra (no máximo ~2,5 s, por mais longo que seja).
 * Mexe só nos nós de texto, então links, rolagens e formatação continuam como estão.
 * Devolve uma função que mostra tudo na hora (ou null se não havia texto).
 */
export function naurenDigitar(elementos, { quadros = 150 } = {}) {
  const nos = [];
  for (const el of elementos) {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) if (n.nodeValue.trim()) nos.push([n, n.nodeValue]);
  }
  const total = nos.reduce((s, [, t]) => s + t.length, 0);
  if (!total) return null;
  nos.forEach(([n]) => { n.nodeValue = ""; });
  elementos.forEach(el => el.classList.add("nl-digitando"));
  const porQuadro = Math.max(1, Math.ceil(total / quadros));
  let i = 0, k = 0, parado = false;
  const fim = () => {
    if (parado) return; parado = true;
    nos.forEach(([n, t]) => { n.nodeValue = t; });
    elementos.forEach(el => el.classList.remove("nl-digitando"));
  };
  const passo = () => {
    if (parado) return;
    let resta = porQuadro;
    while (resta > 0 && i < nos.length) {
      const [n, t] = nos[i]; const q = Math.min(resta, t.length - k);
      k += q; resta -= q; n.nodeValue = t.slice(0, k);
      if (k >= t.length) { i++; k = 0; }
    }
    if (i >= nos.length) return fim();
    requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
  return fim;
}

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
    const e0 = naurenEscritoDe(item), f0 = naurenEscritoFormatoRot(e0.formato, e0.era);
    const largura = ehLivro(e0) ? 980 : e0.formato === "pergaminho" ? 600 : 580;
    // 0.109.9: lembra o tamanho que cada pessoa deixou a janela (por formato: nota, carta, livro...).
    const salvo = tamJanelaLocal(e0.formato);
    const w = salvo ? Math.min(salvo.width, window.innerWidth - 20) : largura, h = salvo ? Math.min(salvo.height, window.innerHeight - 20) : (ehLivro(e0) ? 720 : 760);
    super({ ...op, id: `nauren-leitor-${item.id}-${(item.parent?.id ?? "w")}`, window: { title: item.name, icon: `fas ${f0.ic}`, resizable: true }, position: { width: w, height: h } });
    this._naurenFormatoJanela = e0.formato;
    this.item = item;
    this.pag = ehLivro(e0) ? -1 : 0;   // livro começa na capa
    this.edPag = 0;
    this.editando = false;
    this.tam = tamLocal();
    this.animar = "";
    this.lacreAberto = false;          // carta lacrada aberta só nesta tela (quem não é dono)
  }
  /** 0.109.9: guarda o tamanho ao redimensionar (não no modo de edição, que alarga a janela sozinho). */
  _onPosition(position) {
    super._onPosition?.(position);
    if (!this.editando && this._naurenFormatoJanela && position?.width && position?.height) guardarTamJanela(this._naurenFormatoJanela, position);
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
      const varetas = e.formato === "pergaminho" && e.era === "classico"; // fora do Clássico o pergaminho é uma ficha/painel, sem varetas
      palco = `<div class="nl-solta ${anim}">${varetas ? `<span class="nl-vareta nl-vareta-c"></span>` : ""}${await this.folhaHtml(e.paginas[this.pag], this.pag, n, e)}${varetas ? `<span class="nl-vareta nl-vareta-b"></span>` : ""}</div>`;
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
    const fx = efeitosAnimados() ? ["varredura", "falha"].filter(k => e.efeitos[k]).map(k => `nl-fx-${k}`).join(" ") : (e.efeitos.varredura ? "nl-fx-varredura nl-fx-parado" : "");
    return `<div class="nl-raiz nl-era-${e.era} nl-fmt-${e.formato} nl-papel-${e.papel} ${fx} ${this.editando ? "nl-modo-edicao" : "nl-modo-leitura"}" style="${esc(this.estiloVars(e))}">${corpo}</div>`;
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
    if (!this.editando) { this.digitarPagina(e); return; }
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
  /** 0.111: efeito "Digitação" — o texto da página aparece letra por letra, só na primeira vez que ela é aberta. */
  digitarPagina(e) {
    this._pararDigitacao?.(); this._pararDigitacao = null;
    if (!e.efeitos.digitacao || !efeitosAnimados()) return;
    this._jaDigitadas ??= new Set();
    const chave = `${this.pag}`;
    if (this._jaDigitadas.has(chave)) return;
    const corpos = [...(this.element?.querySelectorAll(".nl-palco .nl-folha:not(.nl-folha-vazia) .nl-folha-corpo") ?? [])];
    if (!corpos.length) return;
    this._jaDigitadas.add(chave);
    const parar = naurenDigitar(corpos);
    if (!parar) return;
    this._pararDigitacao = parar;
    const palco = this.element.querySelector(".nl-palco");
    const pular = () => { parar(); palco?.removeEventListener("click", pular); };
    palco?.addEventListener("click", pular);
  }
  marcarSalvo(ok) { const s = this.element?.querySelector("[data-salvo]"); if (s) { s.textContent = ok ? "Salvo" : "Não salvo"; s.classList.toggle("pendente", !ok); } }
  async _preClose(op) { try { await this.salvarTexto(); } catch (err) { /* segue */ } return super._preClose?.(op); }
  _onClose(op) { this._pararDigitacao?.(); abertos.delete(this.item?.uuid); super._onClose?.(op); }

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
    "Nauren Antiga": { editor: true, fonts: [{ urls: [`${base}/GFSBaskerville.otf`] }] },
    // 0.111: letras modernas e cyberpunk (licenças em assets/fontes/licencas)
    "Nauren Moderna": { editor: true, fonts: [{ urls: [`${base}/IBMPlexSans-Variable.woff`], weight: "100 700" }] },
    "Nauren Manuscrita": { editor: true, fonts: [{ urls: [`${base}/Caveat-Variable.woff`], weight: "400 700" }] },
    "Nauren Maquina": { editor: true, fonts: [{ urls: [`${base}/MaquinaEscrever.woff`] }] },
    "Nauren Mono": { editor: true, fonts: [{ urls: [`${base}/ShareTechMono.woff`] }] },
    "Nauren Tecno": { editor: true, fonts: [{ urls: [`${base}/Orbitron-Variable.woff`], weight: "400 900" }] }
  });
  // 0.111: cada pessoa escolhe se quer as animações dos escritos (varredura, falha, digitação)
  game.settings.register(SIS, "escritosEfeitos", {
    name: "Animações nos escritos", hint: "Varredura de tela, falhas de sinal e texto sendo digitado nos escritos modernos e cyberpunk. Desligado, o escrito aparece parado. \"Reduzir movimento\" do sistema operacional também desliga.",
    scope: "client", config: true, type: Boolean, default: true,
    onChange: () => { for (const ap of abertos.values()) if (ap.rendered) ap.render(); }
  });
  // o leitor aberto acompanha o item (outra pessoa escreveu, o Mestre mudou o papel…)
  Hooks.on("updateItem", item => {
    const ap = abertos.get(item.uuid); if (!ap?.rendered) return;
    if (ap.editando) return; // quem está escrevendo redesenha sozinho (não perde o que ainda não foi salvo)
    ap.render();
  });
  Hooks.on("deleteItem", item => { abertos.get(item.uuid)?.close(); });
  // (0.107: o botão da aba Itens virou "Importar em massa", que também aceita Escritos — importar-massa.mjs)
  // "Mostrar aos jogadores": abre para todos (menos para quem mostrou)
  Hooks.on("createChatMessage", msg => {
    const uuid = msg.getFlag?.(SIS, "escritoMostrar"); if (!uuid || msg.author?.id === game.user?.id) return;
    naurenAbrirEscrito(uuid);
  });
  Hooks.on("renderChatMessageHTML", (msg, html) => {
    // 0.109.4: cards antigos — concordância ("Nota mostrada") e o ícone na moldura nova.
    html.querySelectorAll?.(".nl-chat").forEach(c => {
      const sm = c.querySelector("small"); if (sm) sm.textContent = sm.textContent.replace(/^(Nota|Carta) mostrado/, "$1 mostrada");
      const i = c.querySelector(":scope > i"); if (i) { const sp = document.createElement("span"); sp.className = "nl-chat-ic"; i.replaceWith(sp); sp.append(i); }
      c.querySelector(":scope > div:not(.nl-chat-txt)")?.classList.add("nl-chat-txt");
    });
    html.querySelectorAll?.(".nl-chat-ler").forEach(b => b.addEventListener("click", ev => { ev.preventDefault(); naurenAbrirEscrito(b.dataset.uuid); }));
  });
}

/* ------------------------------ JSON: importar e exportar ------------------------------ */
/**
 * 0.106.1: formato simples para escrever escritos fora do Foundry (num editor de texto ou numa planilha):
 * {
 *   "era": "classico|moderno|cyberpunk" (0.111; vazio = classico), "efeitos": { "varredura": false, "falha": false, "digitacao": false },
 *   "nome": "Bilhete Amassado", "imagem": "icons/...webp", "descricao": "texto curto da ficha",
 *   "formato": "nota|carta|pergaminho|livro|diario", "papel": "...", "letra": "...", "tinta": "#2b1d10", "tamanhoLetra": 100,
 *   "capa": { "titulo": "", "subtitulo": "", "cor": "#5b2a1d", "detalhe": "#d6b25e" },
 *   "lacre": { "ativo": true, "cor": "#8c1c1c", "simbolo": "V" },
 *   "quemEscreve": "mestre|dono", "lerNoBau": true, "someAoUsar": false, "pasta": "Escritos",
 *   "paginas": [ { "titulo": "…", "texto": "…" }, { "titulo": "…", "imagem": "caminho", "legenda": "…" } ]
 * }
 * Também aceita uma lista de escritos ([ {...}, {...} ]) ou { "escritos": [ ... ] }.
 * O texto pode ser HTML ou texto comum: linha em branco = parágrafo novo; **negrito**, *itálico*,
 * "# Título" e "- item de lista" viram a formatação certa. Um bloco entre "[segredo]" e "[/segredo]" só o Mestre vê.
 */
const ICONE_DO_FORMATO = {
  nota: "icons/sundries/scrolls/scroll-writing-tan.webp", carta: "icons/sundries/documents/document-sealed-beige-red.webp",
  pergaminho: "icons/sundries/scrolls/scroll-bound-black-tan.webp", livro: "icons/sundries/books/book-worn-brown.webp",
  diario: "icons/sundries/books/book-embossed-bound-brown.webp"
};
const LETRA_POR_NOME = { caligrafia: "caligrafia", livro: "livro", classica: "classica", "clássica": "classica", antiga: "antiga", letreiro: "titulo", titulo: "titulo", simples: "simples",
  // 0.111: letras modernas e cyberpunk
  sans: "sans", "sem serifa": "sans", semserifa: "sans", moderna: "sans", manuscrita: "manuscrita", "máquina de escrever": "maquina", "maquina de escrever": "maquina", maquina: "maquina", "máquina": "maquina",
  mono: "mono", monoespacada: "mono", "monoespaçada": "mono", tecno: "tecno", tecnologica: "tecno", "tecnológica": "tecno" };
const PAPEL_POR_NOME = { "post-it": "postit", "post it": "postit", "folha a4": "a4", caderno: "pautado", "caderno pautado": "pautado", "cartão": "cartao", "tela escura": "tela",
  "terminal verde": "terminal", "neon magenta": "neon", "holograma ciano": "holograma", "painel âmbar": "ambar", "painel ambar": "ambar", "âmbar": "ambar" };
const sem = s => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
/** Texto comum → HTML (se já for HTML, fica como está). */
export function naurenEscritoTextoParaHtml(t) {
  t = String(t ?? "");
  if (Array.isArray(t)) t = t.join("\n");
  if (/<\/?(p|h[1-6]|ul|ol|li|section|div|br|em|strong|blockquote|img|hr)\b/i.test(t)) return t;
  const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<em>$2</em>").replace(/@UUID\[([^\]]+)\](\{[^}]*\})?/g, m => m.replace(/&quot;/g, "\""));
  const blocos = t.replace(/\r/g, "").split(/\n\s*\n/);
  const out = [];
  let segredo = null;
  const empurrar = h => (segredo ? segredo.push(h) : out.push(h));
  for (let b of blocos) {
    b = b.trim(); if (!b) continue;
    if (/^\[segredo\]/i.test(b)) { segredo = []; b = b.replace(/^\[segredo\]\s*/i, ""); }
    let fecha = false;
    if (/\[\/segredo\]\s*$/i.test(b)) { fecha = true; b = b.replace(/\s*\[\/segredo\]\s*$/i, ""); }
    if (b) {
      const linhas = b.split("\n");
      if (linhas.every(l => /^\s*[-•*]\s+/.test(l))) empurrar(`<ul>${linhas.map(l => `<li>${inline(l.replace(/^\s*[-•*]\s+/, ""))}</li>`).join("")}</ul>`);
      else if (linhas.every(l => /^\s*\d+[.)]\s+/.test(l))) empurrar(`<ol>${linhas.map(l => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>`).join("")}</ol>`);
      else if (/^#{1,3}\s/.test(b)) { const n = b.match(/^#+/)[0].length; empurrar(`<h${n}>${inline(b.replace(/^#+\s*/, ""))}</h${n}>`); }
      else if (/^>\s?/.test(b)) empurrar(`<blockquote><p>${linhas.map(l => inline(l.replace(/^>\s?/, ""))).join("<br>")}</p></blockquote>`);
      else if (/^(-{3,}|\*{3,})$/.test(b)) empurrar("<hr>");
      else if (/^->\s?/.test(b)) empurrar(`<p style="text-align: right">${linhas.map(l => inline(l.replace(/^->\s?/, ""))).join("<br>")}</p>`);
      else empurrar(`<p>${linhas.map(inline).join("<br>")}</p>`);
    }
    if (fecha && segredo) { out.push(`<section class="secret">${segredo.join("")}</section>`); segredo = null; }
  }
  if (segredo) out.push(`<section class="secret">${segredo.join("")}</section>`);
  return out.join("");
}
/** Um escrito no formato simples → dados de Item (Equipamento com categoria "escrito"). */
export function naurenEscritoDoJson(o) {
  if (!o || typeof o !== "object") throw new Error("escrito vazio");
  const FMT_POR_NOME = { "diário": "diario", ficha: "pergaminho", painel: "pergaminho" };
  const formato = NAUREN_ESCRITO_FORMATOS[sem(o.formato)] ? sem(o.formato) : FMT_POR_NOME[String(o.formato ?? "").toLowerCase().trim()] ?? FMT_POR_NOME[sem(o.formato)] ?? "nota";
  const era = NAUREN_ESCRITO_ERAS[sem(o.era)] ? sem(o.era) : sem(o.era) === "classica" ? "classico" : "classico";
  const sug = sugestao(era, formato);
  const papelNome = String(o.papel ?? "").toLowerCase().trim();
  const papel = NAUREN_ESCRITO_PAPEIS[sem(o.papel)] ? sem(o.papel) : PAPEL_POR_NOME[papelNome] ?? PAPEL_POR_NOME[sem(o.papel)] ?? sug.papel;
  const letraNome = String(o.letra ?? o.fonte ?? "").toLowerCase().trim();
  const fonte = LETRA_POR_NOME[letraNome] ?? LETRA_POR_NOME[sem(o.letra ?? o.fonte)] ?? sug.fonte;
  const fxEntrada = o.efeitos && typeof o.efeitos === "object" ? o.efeitos : null;
  const efeitos = { varredura: fxEntrada ? !!fxEntrada.varredura : (era !== "classico" && PAPEL_COM_VARREDURA.has(papel)), falha: !!fxEntrada?.falha, digitacao: !!(fxEntrada?.digitacao ?? fxEntrada?.["digitação"]) };
  const pags = (Array.isArray(o.paginas) ? o.paginas : o.texto !== undefined ? [{ texto: o.texto }] : []).map(p => {
    if (typeof p === "string") return pagina({ texto: naurenEscritoTextoParaHtml(p) });
    const img = p.imagem ?? p.src;
    return img ? pagina({ nome: p.titulo ?? p.nome ?? "", tipo: "imagem", src: String(img), legenda: p.legenda ?? "" })
      : pagina({ nome: p.titulo ?? p.nome ?? "", texto: naurenEscritoTextoParaHtml(p.texto ?? p.html ?? "") });
  });
  const escrito = naurenEscritoNormalizar({
    era, formato, papel, fonte, tinta: o.tinta ?? "", tamanho: o.tamanhoLetra ?? o.tamanho ?? 100, efeitos,
    capa: { titulo: o.capa?.titulo ?? "", subtitulo: o.capa?.subtitulo ?? "", cor: o.capa?.cor ?? CAPA_DA_ERA[era].cor, detalhe: o.capa?.detalhe ?? CAPA_DA_ERA[era].detalhe },
    lacre: { ativo: o.lacre?.ativo ?? (formato === "carta" && era === "classico" && o.lacre !== false), cor: o.lacre?.cor, simbolo: o.lacre?.simbolo ?? "", rompido: false },
    quemEscreve: sem(o.quemEscreve) === "dono" ? "dono" : (o.quemEscreve ? "mestre" : (sug.quemEscreve ?? "mestre")),
    lerNoBau: o.lerNoBau !== false, gastaAoUsar: !!(o.someAoUsar ?? o.gastaAoUsar), paginas: pags
  });
  const nome = String(o.nome ?? o.name ?? "").trim() || (escrito.paginas[0]?.nome || NAUREN_ESCRITO_FORMATOS[formato].rot);
  const sys = { categoria: "escrito", quantidade: Math.max(1, Number(o.quantidade) || 1), quantidadeMax: 1, efeito: "", equipado: false, escrito,
    descricao: o.descricao ? naurenEscritoTextoParaHtml(o.descricao) : "" };
  if (Number(o.preco) > 0) sys.preco = Number(o.preco);
  if (Array.isArray(o.acoes)) sys.acoes = o.acoes; // avançado: Ações no formato do sistema (ex.: copiadas de um item exportado)
  return { name: nome, type: "consumivel", img: o.icone || ICONE_DO_FORMATO[formato], system: sys, _pasta: o.pasta ?? null };
}
/** Lê o texto (JSON) e devolve a lista de escritos. Aceita também o JSON exportado de um Item do Foundry. */
export function naurenEscritosLerJson(texto) {
  let dados = JSON.parse(String(texto ?? "").replace(/^﻿/, ""));
  if (dados && !Array.isArray(dados) && Array.isArray(dados.escritos)) dados = dados.escritos;
  const lista = Array.isArray(dados) ? dados : [dados];
  return lista.map((o, i) => {
    if (o?.type === "consumivel" && o?.system) return { ...o, system: { ...o.system, categoria: "escrito", escrito: naurenEscritoNormalizar(o.system.escrito) }, _pasta: null }; // exportado do Foundry
    try { return naurenEscritoDoJson(o); } catch (err) { throw new Error(`escrito ${i + 1}: ${err.message}`); }
  });
}
/** Cria os escritos no mundo (pasta opcional), num ator ou num compêndio. */
export async function naurenEscritosImportar(texto, { ator = null, pasta = "Escritos" } = {}) {
  const lista = naurenEscritosLerJson(texto);
  if (!lista.length) return [];
  if (ator) return ator.createEmbeddedDocuments("Item", lista.map(({ _pasta, ...d }) => d));
  const pastas = new Map();
  const pastaDe = async nome => {
    if (!nome) return null;
    if (pastas.has(nome)) return pastas.get(nome);
    let f = game.folders?.find?.(x => x.type === "Item" && x.name === nome);
    if (!f && game.user?.isGM) { try { f = await Folder.create({ name: nome, type: "Item" }); } catch (err) { f = null; } }
    pastas.set(nome, f ?? null); return f ?? null;
  };
  const dados = [];
  for (const { _pasta, ...d } of lista) { const f = await pastaDe(_pasta ?? pasta); if (f?.id) d.folder = f.id; dados.push(d); }
  return Item.createDocuments(dados);
}
/** O escrito no formato simples (para guardar, editar fora e importar de novo). */
export function naurenEscritoParaJson(item) {
  const e = naurenEscritoDe(item); if (!e) return null;
  const letra = Object.entries(LETRA_POR_NOME).find(([, v]) => v === e.fonte)?.[0] ?? e.fonte;
  const o = { nome: item.name, icone: item.img, era: e.era !== "classico" ? e.era : undefined, formato: e.formato, papel: e.papel, letra, tinta: e.tinta || undefined, tamanhoLetra: e.tamanho !== 100 ? e.tamanho : undefined,
    quemEscreve: e.quemEscreve, lerNoBau: e.lerNoBau, someAoUsar: e.gastaAoUsar || undefined, descricao: item.system.descricao || undefined };
  if (e.efeitos.varredura || e.efeitos.falha || e.efeitos.digitacao) o.efeitos = { ...e.efeitos };
  if (ehLivro(e)) o.capa = { ...e.capa };
  if (e.formato === "carta") o.lacre = { ativo: e.lacre.ativo, cor: e.lacre.cor, simbolo: e.lacre.simbolo };
  o.paginas = e.paginas.map(p => p.tipo === "imagem" ? { titulo: p.nome || undefined, imagem: p.src, legenda: p.legenda || undefined } : { titulo: p.nome || undefined, texto: p.texto });
  if ((item.system.acoes ?? []).length) o.acoes = foundry.utils.deepClone(item.system.acoes);
  return JSON.parse(JSON.stringify(o));
}
export function naurenEscritoExportar(item) {
  const o = naurenEscritoParaJson(item); if (!o) return;
  const nome = `${String(item.name).replace(/[^\p{L}\p{N} _-]+/gu, "").trim().replace(/\s+/g, "-") || "escrito"}.json`;
  foundry.utils.saveDataToFile(JSON.stringify(o, null, 2), "application/json", nome);
}

/** Janela "Importar escritos": colar o JSON ou escolher o arquivo. */
export async function naurenEscritosJanelaImportar({ item = null, ator = null } = {}) {
  const exemplo = JSON.stringify({ nome: "Aviso na Porta", formato: "nota", papel: "envelhecido", letra: "caligrafia",
    paginas: [{ texto: "Fechado por ordem do Conselho.\n\n**Quem entrar** responde ao Capitão da Guarda.\n\n-> — C." }] }, null, 2);
  const conteudo = `<div class="nl-imp">
    <p class="nl-dica">${item ? `Substitui o texto e a aparência de <b>${esc(item.name)}</b> pelo do JSON.` : ator ? `Os escritos entram no inventário de <b>${esc(ator.name)}</b>.` : "Os escritos são criados na aba Itens, na pasta <b>Escritos</b> (ou na pasta que o JSON disser)."} Um arquivo pode ter um escrito ou uma lista deles.</p>
    <div class="nl-imp-arq"><input type="file" accept=".json,application/json" data-imp-arq><span class="nl-dica">ou cole abaixo</span></div>
    <textarea data-imp-txt rows="14" spellcheck="false" placeholder='${esc(exemplo)}'></textarea>
    <p class="nl-imp-erro" data-imp-erro hidden></p>
    <details class="nl-imp-ajuda"><summary>Como escrever o JSON</summary><div class="nl-dica">
      <p><b>era</b> (opcional): classico, moderno ou cyberpunk · <b>formato</b>: nota, carta, pergaminho (ficha/painel fora do Clássico), livro ou diario.</p>
      <p><b>papel</b> — clássico: envelhecido, pergaminho, creme, branco, noturno, arcano · moderno: a4, postit, pautado, cartao, tela · cyberpunk: terminal, neon, holograma, ambar.</p>
      <p><b>letra</b> — caligrafia, livro, classica, antiga, letreiro, simples · moderno: sans, manuscrita, maquina · cyberpunk: mono, tecno. <b>efeitos</b> (opcional): <code>{ "varredura": true, "falha": false, "digitacao": true }</code>.</p>
      <p>Cada página: <code>{ "titulo": "…", "texto": "…" }</code> ou <code>{ "titulo": "…", "imagem": "caminho", "legenda": "…" }</code>.</p>
      <p>No <b>texto</b>: linha em branco = parágrafo novo · <code>**negrito**</code> · <code>*itálico*</code> · <code># Título</code> · <code>- item</code> · <code>&gt; citação</code> · <code>-&gt; alinhado à direita</code> · <code>---</code> linha · <code>[segredo] … [/segredo]</code> só o Mestre vê. HTML também vale.</p>
      <p>Opcionais: <code>capa</code> { titulo, subtitulo, cor, detalhe } · <code>lacre</code> { ativo, cor, simbolo } · <code>quemEscreve</code> ("mestre" ou "dono") · <code>lerNoBau</code> · <code>someAoUsar</code> · <code>icone</code> · <code>descricao</code> · <code>pasta</code> · <code>preco</code>.</p>
    </div></details>
  </div>`;
  let resultado = null;
  await foundry.applications.api.DialogV2.wait({
    window: { title: item ? `Importar JSON · ${item.name}` : "Importar escritos (JSON)", icon: "fas fa-file-import" }, classes: ["nauren-kit", "nauren-escritos-imp"], position: { width: 620 },
    content: conteudo, rejectClose: false,
    buttons: [{ action: "importar", label: "Importar", icon: "fas fa-file-import", default: true, callback: async (ev, bt, dlg) => {
      const raiz = dlg.element ?? dlg; const txt = raiz.querySelector("[data-imp-txt]").value; const erro = raiz.querySelector("[data-imp-erro]");
      try {
        if (item) {
          const [d] = naurenEscritosLerJson(txt);
          await item.update({ name: d.name || item.name, "system.escrito": d.system.escrito, ...(d.system.descricao ? { "system.descricao": d.system.descricao } : {}), ...(d.img && d.img !== ICONE_DO_FORMATO[d.system.escrito.formato] ? { img: d.img } : {}) });
          resultado = [item];
        } else resultado = await naurenEscritosImportar(txt, { ator });
      } catch (err) { erro.hidden = false; erro.textContent = `Não consegui ler o JSON: ${err.message}`; throw err; }
    } }, { action: "cancelar", label: "Cancelar" }],
    render: (ev, dlg) => {
      const raiz = dlg?.element ?? document;
      raiz.querySelector("[data-imp-arq]")?.addEventListener("change", async e2 => { const f = e2.target.files?.[0]; if (f) raiz.querySelector("[data-imp-txt]").value = await f.text(); });
    }
  }).catch(() => null);
  if (resultado?.length) ui.notifications?.info(item ? `${item.name}: texto importado.` : `${resultado.length} ${resultado.length === 1 ? "escrito importado" : "escritos importados"}.`);
  return resultado;
}
