/**
 * Nauren RPG — formatos especiais dos Escritos (0.112+): Mensagens (celular), Terminal e Cartaz.
 *
 * Este módulo só monta dados e HTML; não grava nada nem conhece o leitor. O escritos.mjs importa daqui
 * (e não o contrário), para não haver dependência circular.
 */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
const novoId = () => foundry.utils.randomID(10);
const str = (v, max = 4000) => (typeof v === "string" ? v : v == null ? "" : String(v)).slice(0, max);

/** Texto curto (mensagem, linha de cartaz) → HTML: escapa, quebra de linha vira <br>, **negrito** e *itálico*. */
export function naurenTextoCurtoHtml(t) {
  return esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<em>$2</em>").replace(/\r?\n/g, "<br>");
}

/* ============================== MENSAGENS (celular) ============================== */
export const NAUREN_MSG_TEMAS = {
  claro: { rot: "Claro", dica: "Celular comum, fundo claro" },
  escuro: { rot: "Escuro", dica: "Modo escuro" },
  neon: { rot: "Comunicador neon", dica: "Cyberpunk: fundo preto, balões em neon" }
};
const umaMsg = (m = {}) => ({
  id: typeof m.id === "string" && m.id ? m.id : novoId(),
  tipo: m.tipo === "data" ? "data" : "msg",
  lado: m.lado === "eu" ? "eu" : "outro",
  quem: str(m.quem, 60),
  hora: str(m.hora, 20),
  texto: str(m.texto),
  src: str(m.src, 500)
});
export const naurenMsgNova = umaMsg;
export function naurenMensagensNormalizar(m, era = "moderno") {
  m = m && typeof m === "object" ? m : {};
  return {
    contato: str(m.contato, 60),
    status: str(m.status, 80),
    foto: str(m.foto, 500),
    tema: NAUREN_MSG_TEMAS[m.tema] ? m.tema : era === "cyberpunk" ? "neon" : "claro",
    aosPoucos: !!m.aosPoucos,
    reveladas: Math.max(0, Math.round(Number(m.reveladas) || 0)),
    digitando: m.digitando !== false,
    som: str(m.som ?? "sounds/notify.wav", 500),
    lista: (Array.isArray(m.lista) ? m.lista : []).slice(0, 400).map(umaMsg)
  };
}
/** Quantas mensagens de verdade (sem os separadores de data). */
export function naurenMsgTotal(m) { return m.lista.filter(x => x.tipo === "msg").length; }
/**
 * Quais itens da lista cada um vê. Com "revelar aos poucos", o jogador vê as primeiras `reveladas` mensagens
 * (e os separadores de data que vêm antes de uma mensagem visível); o Mestre vê tudo, com as escondidas marcadas.
 */
export function naurenMsgVisiveis(m, { mestre = false } = {}) {
  const limite = m.aosPoucos ? m.reveladas : Infinity;
  let n = 0;
  const idx = m.lista.map(x => (x.tipo === "msg" ? n++ : n)); // separador: índice da próxima mensagem
  return m.lista.map((x, i) => {
    const visivel = idx[i] < limite || (x.tipo === "data" && idx[i] >= naurenMsgTotal(m) && limite >= naurenMsgTotal(m));
    return { ...x, visivel, escondida: !visivel, mostrar: visivel || mestre };
  });
}
/** A próxima mensagem escondida (para os três pontinhos de "digitando..."). */
export function naurenMsgProxima(m) {
  if (!m.aosPoucos) return null;
  return m.lista.filter(x => x.tipo === "msg")[m.reveladas] ?? null;
}
const inicial = nome => esc((String(nome ?? "").trim()[0] ?? "?").toUpperCase());

/** O celular (leitor e prévia do editor). `novas`: ids que acabaram de aparecer (animação). */
export function naurenMensagensHtml(m, { mestre = false, novas = new Set(), titulo = "" } = {}) {
  const itens = naurenMsgVisiveis(m, { mestre });
  const proxima = naurenMsgProxima(m);
  const linhas = itens.filter(x => x.mostrar).map(x => {
    if (x.tipo === "data") return `<span class="nm-data ${x.escondida ? "nm-escondida" : ""}">${esc(x.texto || x.hora || "…")}</span>`;
    const img = x.src ? `<img class="nm-img" src="${esc(x.src)}" alt="">` : "";
    const quem = x.lado === "outro" && x.quem ? `<span class="nm-quem">${esc(x.quem)}</span>` : "";
    const marca = x.escondida ? `<span class="nm-tag">escondida</span>` : "";
    return `<div class="nm-msg nm-${x.lado} ${x.escondida ? "nm-escondida" : ""} ${novas.has(x.id) ? "nm-nova" : ""}" data-msg="${esc(x.id)}">${quem}${img}${x.texto ? `<span class="nm-txt">${naurenTextoCurtoHtml(x.texto)}</span>` : ""}<span class="nm-hora">${esc(x.hora)}${x.lado === "eu" && x.hora ? " ✓✓" : ""}${marca}</span></div>`;
  }).join("");
  const digitando = m.digitando && proxima && proxima.lado === "outro" ? `<div class="nm-digitando" aria-label="digitando"><i></i><i></i><i></i></div>` : "";
  const foto = m.foto ? `<img src="${esc(m.foto)}" alt="">` : inicial(m.contato || titulo);
  return `<div class="nm-celular nm-tema-${m.tema}">
    <div class="nm-tela">
      <header class="nm-topo"><span class="nm-foto">${foto}</span><div class="nm-contato"><b>${esc(m.contato || titulo || "Contato")}</b>${m.status ? `<small>${esc(m.status)}</small>` : ""}</div><i class="fas fa-ellipsis-vertical"></i></header>
      <div class="nm-lista">${linhas || `<p class="nm-vazia">Nenhuma mensagem ainda.</p>`}${digitando}</div>
      <footer class="nm-rodape"><span>Mensagem</span><i class="fas fa-paper-plane"></i></footer>
    </div>
  </div>`;
}

/** Editor das mensagens (só o Mestre). Campos: data-msg-geral="caminho" e, por linha, data-msg-i + data-msg-campo. */
export function naurenMensagensEditorHtml(m) {
  const tema = Object.entries(NAUREN_MSG_TEMAS).map(([k, t]) => `<button type="button" class="${m.tema === k ? "on" : ""}" data-msg-tema="${k}" title="${esc(t.dica)}">${esc(t.rot)}</button>`).join("");
  const n = m.lista.length;
  const linhas = m.lista.map((x, i) => {
    const bts = `<span class="nm-ed-bts">
      <button type="button" class="nl-mini-bt" data-msg-acao="subir" data-msg-i="${i}" ${i === 0 ? "disabled" : ""} title="Subir"><i class="fas fa-arrow-up"></i></button>
      <button type="button" class="nl-mini-bt" data-msg-acao="descer" data-msg-i="${i}" ${i === n - 1 ? "disabled" : ""} title="Descer"><i class="fas fa-arrow-down"></i></button>
      <button type="button" class="nl-mini-bt nl-mini-x" data-msg-acao="apagar" data-msg-i="${i}" title="Apagar"><i class="fas fa-trash"></i></button></span>`;
    if (x.tipo === "data") return `<div class="nm-ed-linha nm-ed-data"><i class="fas fa-calendar-day"></i><input type="text" class="nl-in" data-msg-i="${i}" data-msg-campo="texto" value="${esc(x.texto)}" placeholder="Separador: ontem, hoje, 12 de março…">${bts}</div>`;
    return `<div class="nm-ed-linha nm-ed-${x.lado}">
      <div class="nm-ed-cab">
        <span class="nl-seg nm-ed-lado"><button type="button" class="${x.lado === "outro" ? "on" : ""}" data-msg-acao="lado" data-msg-lado="outro" data-msg-i="${i}" title="Mensagem recebida (à esquerda)">Recebida</button><button type="button" class="${x.lado === "eu" ? "on" : ""}" data-msg-acao="lado" data-msg-lado="eu" data-msg-i="${i}" title="Mensagem enviada pelo dono do celular (à direita)">Enviada</button></span>
        ${x.lado === "outro" ? `<input type="text" class="nl-in nm-ed-quem" data-msg-i="${i}" data-msg-campo="quem" value="${esc(x.quem)}" placeholder="quem (grupo)" title="Nome acima do balão. Vazio numa conversa de duas pessoas.">` : `<span class="nm-ed-quem"></span>`}
        <input type="text" class="nl-in nm-ed-hora" data-msg-i="${i}" data-msg-campo="hora" value="${esc(x.hora)}" placeholder="22:41">
        ${m.aosPoucos ? `<span class="nm-ed-n" title="Ordem de revelação">${m.lista.slice(0, i).filter(y => y.tipo === "msg").length + 1}</span>` : ""}
        ${bts}
      </div>
      <textarea class="nl-in nm-ed-txt" rows="2" data-msg-i="${i}" data-msg-campo="texto" placeholder="Texto da mensagem (**negrito**, *itálico*)">${esc(x.texto)}</textarea>
      <div class="nm-ed-img">${x.src ? `<img src="${esc(x.src)}" alt=""><button type="button" class="nl-link" data-msg-acao="semImagem" data-msg-i="${i}"><i class="fas fa-xmark"></i> tirar a imagem</button>` : `<button type="button" class="nl-link" data-msg-acao="imagem" data-msg-i="${i}"><i class="fas fa-image"></i> pôr uma imagem</button>`}</div>
    </div>`;
  }).join("");
  return `<div class="nm-editor">
    <div class="nm-ed-geral">
      <div class="nl-grade2">
        <label class="nl-campo"><span class="nl-rot">Contato</span><input type="text" class="nl-in" data-msg-geral="contato" value="${esc(m.contato)}" placeholder="Kael"></label>
        <label class="nl-campo"><span class="nl-rot">Linha de baixo</span><input type="text" class="nl-in" data-msg-geral="status" value="${esc(m.status)}" placeholder="visto por último às 23:58"></label>
      </div>
      <div class="nl-linha-cores"><span class="nl-rot">Tema</span><span class="nl-seg nm-ed-tema">${tema}</span>
        <button type="button" class="nl-link" data-msg-acao="foto"><i class="fas fa-user-circle"></i> ${m.foto ? "trocar a foto" : "foto do contato"}</button>${m.foto ? `<button type="button" class="nl-link" data-msg-acao="semFoto"><i class="fas fa-xmark"></i></button>` : ""}</div>
      <div class="nl-linha-cores">
        <label class="nl-check" title="Os jogadores só veem as mensagens que você revelar, uma por vez"><input type="checkbox" data-msg-geral="aosPoucos" ${m.aosPoucos ? "checked" : ""}> Revelar aos poucos</label>
        <label class="nl-check" title="Mostra os três pontinhos quando a próxima mensagem escondida é recebida"><input type="checkbox" data-msg-geral="digitando" ${m.digitando ? "checked" : ""}> "Digitando…"</label>
      </div>
    </div>
    <div class="nm-ed-lista">${linhas || `<p class="nl-dica">Nenhuma mensagem. Use os botões abaixo.</p>`}</div>
    <div class="nm-ed-novas">
      <button type="button" class="nl-btn nt-ch" data-msg-acao="nova" data-msg-lado="outro"><i class="fas fa-plus"></i> Recebida</button>
      <button type="button" class="nl-btn nt-ch" data-msg-acao="nova" data-msg-lado="eu"><i class="fas fa-plus"></i> Enviada</button>
      <button type="button" class="nl-btn nt-ch" data-msg-acao="nova" data-msg-lado="data"><i class="fas fa-calendar-day"></i> Data</button>
    </div>
  </div>`;
}

/* JSON simples ↔ dados */
export function naurenMensagensDoJson(o, era) {
  if (!o || typeof o !== "object") return naurenMensagensNormalizar({}, era);
  const lista = (Array.isArray(o.lista) ? o.lista : Array.isArray(o.mensagens) ? o.mensagens : []).map(x => {
    if (typeof x === "string") return { lado: "outro", texto: x };
    if (x?.data !== undefined && x.texto === undefined) return { tipo: "data", texto: String(x.data) };
    const lado = x?.lado === "eu" || x?.eu === true || String(x?.de ?? "").toLowerCase() === "eu" ? "eu" : "outro";
    return { lado, quem: x?.quem ?? (lado === "outro" && x?.de && String(x.de).toLowerCase() !== "eu" ? x.de : ""), hora: x?.hora ?? "", texto: x?.texto ?? "", src: x?.imagem ?? x?.src ?? "" };
  });
  return naurenMensagensNormalizar({ ...o, lista }, era);
}
export function naurenMensagensParaJson(m) {
  return {
    contato: m.contato || undefined, status: m.status || undefined, foto: m.foto || undefined, tema: m.tema,
    aosPoucos: m.aosPoucos || undefined, digitando: m.digitando ? undefined : false,
    lista: m.lista.map(x => x.tipo === "data" ? { data: x.texto } : { lado: x.lado, quem: x.quem || undefined, hora: x.hora || undefined, texto: x.texto || undefined, imagem: x.src || undefined })
  };
}
