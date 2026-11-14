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

/* ============================== TERMINAL (0.113) ============================== */
/*
 * Criptografado: o texto das páginas é cifrado com a senha e só a versão cifrada fica no item. Assim nenhum jogador
 * lê o texto nos dados do item sem saber a senha, e a conferência funciona sem o Mestre estar online.
 * A cifra é feita aqui mesmo (SHA-256 em JavaScript puro), porque o Foundry muitas vezes roda em http na rede local,
 * onde o crypto.subtle do navegador não existe. É uma tranca de jogo, não um cofre de banco.
 */
const K256 = new Uint32Array([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
export function naurenSha256(bytes) {
  const l = bytes.length, nb = ((l + 9 + 63) >> 6) << 6, m = new Uint8Array(nb);
  m.set(bytes); m[l] = 0x80;
  const dv = new DataView(m.buffer); dv.setUint32(nb - 4, (l * 8) >>> 0); dv.setUint32(nb - 8, Math.floor(l / 0x20000000));
  const h = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]), w = new Uint32Array(64);
  const r = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < nb; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) { const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0; }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const t1 = (hh + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K256[i] + w[i]) >>> 0;
      const t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h[0] += a; h[1] += b; h[2] += c; h[3] += d; h[4] += e; h[5] += f; h[6] += g; h[7] += hh;
  }
  const out = new Uint8Array(32); const ov = new DataView(out.buffer); h.forEach((x, i) => ov.setUint32(i * 4, x)); return out;
}
const utf8 = s => new TextEncoder().encode(String(s));
const junta = (...ps) => { const t = ps.reduce((n, p) => n + p.length, 0), o = new Uint8Array(t); let k = 0; for (const p of ps) { o.set(p, k); k += p.length; } return o; };
const hexDe = b => [...b].map(x => x.toString(16).padStart(2, "0")).join("");
const b64De = b => { let s = ""; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(s); };
const deB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
/** A senha vale sem diferença de maiúsculas e sem espaços nas pontas. */
export const naurenSenhaLimpa = s => String(s ?? "").trim().toLowerCase();
function chave(senha, sal) {
  const s = utf8(sal); let k = naurenSha256(junta(s, utf8(naurenSenhaLimpa(senha))));
  for (let i = 0; i < 4000; i++) k = naurenSha256(junta(k, s));
  return k;
}
function xorFluxo(dados, k) {
  const out = new Uint8Array(dados.length);
  for (let bloco = 0; bloco * 32 < dados.length; bloco++) {
    const ks = naurenSha256(junta(k, Uint8Array.of(bloco >>> 24, (bloco >>> 16) & 255, (bloco >>> 8) & 255, bloco & 255)));
    for (let i = 0; i < 32 && bloco * 32 + i < dados.length; i++) out[bloco * 32 + i] = dados[bloco * 32 + i] ^ ks[i];
  }
  return out;
}
/** Cifra as páginas com a senha. */
export function naurenCifrar(paginas, senha) {
  const sal = hexDe(naurenSha256(utf8(`${Math.random()}:${Date.now()}`))).slice(0, 16);
  const k = chave(senha, sal);
  return { sal, verif: hexDe(naurenSha256(junta(k, utf8("nauren-verif")))).slice(0, 20), dados: b64De(xorFluxo(utf8(JSON.stringify(paginas ?? [])), k)) };
}
/** Decifra; devolve as páginas ou null se a senha estiver errada. */
export function naurenDecifrar(cripto, senha) {
  if (!cripto?.sal || !cripto?.dados) return null;
  const k = chave(senha, cripto.sal);
  if (hexDe(naurenSha256(junta(k, utf8("nauren-verif")))).slice(0, 20) !== cripto.verif) return null;
  try { return JSON.parse(new TextDecoder().decode(xorFluxo(deB64(cripto.dados), k))); } catch (err) { return null; }
}
export function naurenTerminalNormalizar(t) {
  t = t && typeof t === "object" ? t : {};
  const c = t.cripto && typeof t.cripto === "object" ? t.cripto : {};
  const trancado = !!(c.ativo && c.sal && c.verif && typeof c.dados === "string");
  return {
    caminho: str(t.caminho, 120),
    comando: str(t.comando, 120),
    cripto: {
      ativo: trancado, dica: str(c.dica, 200), tentativas: Math.max(0, Math.min(99, Math.round(Number(c.tentativas) || 0))),
      avisarMestre: c.avisarMestre !== false, versao: Math.max(0, Math.round(Number(c.versao) || 0)),
      sal: trancado ? str(c.sal, 64) : "", verif: trancado ? str(c.verif, 64) : "", dados: trancado ? c.dados : ""
    }
  };
}
/** Tela de "ACESSO NEGADO" com o campo da senha. */
export function naurenTerminalTrancadoHtml(t, { restam = null, bloqueado = false, erro = false, caminho = "" } = {}) {
  return `<div class="nt-monitor nt-trancado ${erro ? "nt-erro" : ""}">
    <div class="nt-barra"><span class="nt-led nt-led-vermelho"></span><span class="nt-caminho">${esc(caminho)}</span></div>
    <div class="nt-tela nt-tela-tranca">
      <i class="fas fa-lock nt-cadeado"></i>
      <div class="nt-negado">${bloqueado ? "TERMINAL BLOQUEADO" : "ACESSO NEGADO"}</div>
      <div class="nt-sub">${bloqueado ? "tentativas esgotadas · fale com o Mestre" : `arquivo protegido${restam !== null ? ` · ${restam} ${restam === 1 ? "tentativa restante" : "tentativas restantes"}` : ""}`}</div>
      ${t.cripto.dica ? `<div class="nt-dica">dica: ${esc(t.cripto.dica)}</div>` : ""}
      ${bloqueado ? "" : `<form class="nt-form" data-nt-form autocomplete="off">
        <label class="nt-rot">SENHA<input type="password" class="nt-senha" data-nt-senha autocomplete="off" spellcheck="false"></label>
        <button type="submit" class="nt-entrar">&gt; DESBLOQUEAR</button>
        ${erro ? `<div class="nt-msg-erro">senha incorreta</div>` : ""}
      </form>`}
    </div>
  </div>`;
}
export function naurenTerminalDoJson(o) {
  if (!o || typeof o !== "object") return naurenTerminalNormalizar({});
  return naurenTerminalNormalizar({ caminho: o.caminho, comando: o.comando, cripto: { ...(o.cripto ?? {}), dica: o.dica ?? o.cripto?.dica, tentativas: o.tentativas ?? o.cripto?.tentativas, avisarMestre: o.avisarMestre ?? o.cripto?.avisarMestre } });
}
export function naurenTerminalParaJson(t) {
  const o = { caminho: t.caminho || undefined, comando: t.comando || undefined };
  if (t.cripto.ativo) o.cripto = { ativo: true, dica: t.cripto.dica || undefined, tentativas: t.cripto.tentativas || undefined, avisarMestre: t.cripto.avisarMestre ? undefined : false, sal: t.cripto.sal, verif: t.cripto.verif, dados: t.cripto.dados };
  return o;
}

/* ============================== CARTAZ (0.114) ============================== */
/** Tipos de cartaz. `cat` é a categoria no Quadro de avisos. */
export const NAUREN_CARTAZ_TIPOS = {
  procurado: { rot: "Procurado", cat: "procurados", ic: "fa-user-secret", cyber: "ALVO", cor: "#d7262f", rec: "Recompensa", retrato: true },
  desaparecido: { rot: "Desaparecido", cat: "procurados", ic: "fa-person-circle-question", cyber: "PESSOA DESAPARECIDA", cor: "#121216", rec: "Recompensa", retrato: true },
  missao: { rot: "Missão", cat: "missoes", ic: "fa-scroll", cyber: "CONTRATO", cor: "#1d5bb5", rec: "Paga", retrato: false },
  aviso: { rot: "Aviso", cat: "avisos", ic: "fa-bullhorn", cyber: "AVISO", cor: "#2b2b33", rec: "Multa", retrato: false },
  recompensa: { rot: "Recompensa", cat: "recompensas", ic: "fa-sack-dollar", cyber: "RECOMPENSA", cor: "#1c8a2e", rec: "Recompensa", retrato: false },
  evento: { rot: "Evento", cat: "eventos", ic: "fa-champagne-glasses", cyber: "EVENTO", cor: "#e07a1f", rec: "Entrada", retrato: false }
};
const corHex = (v, d) => /^#[0-9a-f]{6}$/i.test(String(v ?? "")) ? String(v) : d;
export function naurenCartazNormalizar(c) {
  c = c && typeof c === "object" ? c : {};
  const tipo = NAUREN_CARTAZ_TIPOS[c.tipo] ? c.tipo : "procurado";
  return {
    tipo,
    titulo: str(c.titulo, 40), subtitulo: str(c.subtitulo, 80), retrato: str(c.retrato, 500), nome: str(c.nome, 80),
    texto: str(c.texto, 600), recompensa: str(c.recompensa, 40), recRotulo: str(c.recRotulo, 24), contratante: str(c.contratante, 80), prazo: str(c.prazo, 60),
    detalhes: (Array.isArray(c.detalhes) ? c.detalhes : []).slice(0, 6).map(d => ({ rot: str(d?.rot, 24), val: str(d?.val, 80) })).filter(d => d.rot || d.val),
    ameaca: Math.max(0, Math.min(100, Math.round(Number(c.ameaca) || 0))),
    codigo: str(c.codigo, 16), cor: corHex(c.cor, "")
  };
}
const SILHUETA = cor => `<svg class="ncz-silhueta" viewBox="0 0 130 150" aria-hidden="true"><circle cx="65" cy="52" r="30" fill="${cor}"></circle><path d="M8 150c4-38 28-58 57-58s53 20 57 58z" fill="${cor}"></path></svg>`;
const QR = `<svg class="ncz-qr" viewBox="0 0 7 7" aria-hidden="true" shape-rendering="crispEdges"><rect width="7" height="7" fill="#f5f3ee"></rect><path d="M0 0h3v3H0zM4 0h3v3H4zM0 4h3v3H0zM4 4h1v1H4zM6 4h1v1H6zM5 5h1v1H5zM4 6h1v1H4zM6 6h1v1H6z" fill="#121216"></path><path d="M1 1h1v1H1zM5 1h1v1H5zM1 5h1v1H1z" fill="#f5f3ee"></path></svg>`;
/** O cartaz na era do escrito. Tudo em "em": o mesmo HTML serve para o leitor, a ficha e a miniatura no quadro (só muda o font-size). */
export function naurenCartazHtml(c, era = "classico", { nomeItem = "" } = {}) {
  const t = NAUREN_CARTAZ_TIPOS[c.tipo];
  const titulo = c.titulo || t.rot;
  const rec = c.recompensa ? { rot: c.recRotulo || t.rec, val: c.recompensa } : null;
  const nome = c.nome || (t.retrato ? "" : nomeItem);
  const cor = c.cor || t.cor;
  const temRetrato = !!c.retrato || t.retrato;
  const img = cor2 => c.retrato ? `<img src="${esc(c.retrato)}" alt="">` : SILHUETA(cor2);
  const det = c.detalhes.length ? `<dl class="ncz-det">${c.detalhes.map(d => `<div><dt>${esc(d.rot)}</dt><dd>${esc(d.val)}</dd></div>`).join("")}</dl>` : "";
  const texto = c.texto ? `<div class="ncz-texto">${naurenTextoCurtoHtml(c.texto)}</div>` : "";
  const rodape = [c.contratante, c.prazo].filter(Boolean).map(esc).join(" · ");
  const base = `ncz-cartaz ncz-${era} ncz-tipo-${c.tipo}`;
  if (era === "moderno") {
    return `<div class="${base}" style="--ncz-cor:${esc(cor)}">
      <div class="ncz-faixa">${esc(titulo)}</div>
      ${c.subtitulo ? `<div class="ncz-subt">${esc(c.subtitulo)}</div>` : ""}
      <div class="ncz-corpo ${temRetrato ? "ncz-com-retrato" : ""}">
        ${temRetrato ? `<div class="ncz-retrato">${img("#6d6b66")}</div>` : ""}
        <div class="ncz-info">${nome ? `<b class="ncz-nome">${esc(nome)}</b>` : ""}${det}${texto}</div>
      </div>
      ${rec ? `<div class="ncz-rec"><div><span>${esc(rec.rot)}</span><b>${esc(rec.val)}</b></div>${QR}</div>` : ""}
      ${rodape ? `<div class="ncz-rodape">${rodape}</div>` : ""}
    </div>`;
  }
  if (era === "cyberpunk") {
    return `<div class="${base}">
      <div class="ncz-cab"><span>${esc(t.cyber)}</span><span>${esc(c.codigo || "")}</span></div>
      <div class="ncz-tit">${esc(titulo)}</div>
      ${c.subtitulo ? `<div class="ncz-subt">${esc(c.subtitulo)}</div>` : ""}
      <div class="ncz-corpo ${temRetrato ? "ncz-com-retrato" : ""}">
        ${temRetrato ? `<div class="ncz-retrato">${img("#6fe6ff")}</div>` : ""}
        <div class="ncz-info">${nome ? `<b class="ncz-nome">${esc(nome)}</b>` : ""}${det}${texto}
          ${c.ameaca ? `<span class="ncz-ameaca-rot">AMEAÇA</span><span class="ncz-ameaca"><i style="width:${c.ameaca}%"></i></span>` : ""}</div>
      </div>
      ${rec ? `<div class="ncz-rec"><span>${esc(rec.rot.toUpperCase())}</span><b>${esc(rec.val)}</b></div>` : ""}
      ${rodape ? `<div class="ncz-rodape">${rodape}</div>` : ""}
    </div>`;
  }
  return `<div class="${base}">
    <div class="ncz-tit">${esc(titulo)}</div>
    ${c.subtitulo ? `<div class="ncz-subt">${esc(c.subtitulo)}</div>` : ""}
    ${temRetrato ? `<div class="ncz-retrato">${img("#5a3d1c")}</div>` : ""}
    ${nome ? `<div class="ncz-nome">${esc(nome)}</div>` : ""}
    ${texto}${det}
    ${rec ? `<div class="ncz-rec-rot">${esc(rec.rot)}</div><div class="ncz-rec">${esc(rec.val)}</div>` : ""}
    ${rodape ? `<div class="ncz-rodape">${rodape}</div>` : ""}
  </div>`;
}
/** Formulário do cartaz (editor). Campos: data-cz="caminho"; detalhes: data-cz-det="i" + data-cz-campo. */
export function naurenCartazEditorHtml(c, era) {
  const tipos = Object.entries(NAUREN_CARTAZ_TIPOS).map(([k, t]) => `<button type="button" class="nl-fmt ${c.tipo === k ? "on" : ""}" data-cz-tipo="${k}"><i class="fas ${t.ic}"></i><span>${esc(t.rot)}</span></button>`).join("");
  const t = NAUREN_CARTAZ_TIPOS[c.tipo];
  const campo = (k, rot, ph, extra = "") => `<label class="nl-campo"><span class="nl-rot-p">${rot}</span><input type="text" class="nl-in" data-cz="${k}" value="${esc(c[k])}" placeholder="${esc(ph)}" ${extra}></label>`;
  const det = c.detalhes.map((d, i) => `<div class="ncz-ed-det"><input type="text" class="nl-in" data-cz-det="${i}" data-cz-campo="rot" value="${esc(d.rot)}" placeholder="Altura"><input type="text" class="nl-in" data-cz-det="${i}" data-cz-campo="val" value="${esc(d.val)}" placeholder="1,78 m"><button type="button" class="nl-mini-bt nl-mini-x" data-cz-acao="tirarDet" data-cz-i="${i}" title="Tirar"><i class="fas fa-trash"></i></button></div>`).join("");
  return `<div class="ncz-editor">
    <div class="nl-campo"><span class="nl-rot">Tipo</span><div class="nl-fmts">${tipos}</div></div>
    <div class="nl-grade2">${campo("titulo", "Título grande", t.rot)}${campo("subtitulo", "Linha de baixo", c.tipo === "procurado" ? "vivo ou morto" : "")}</div>
    <div class="nl-grade2">${campo("nome", "Nome", c.tipo === "procurado" ? "Dorian \"Mão Leve\"" : "Ratos no porão")}${era === "cyberpunk" ? campo("codigo", "Código", "#7731-K", 'maxlength="16"') : campo("contratante", "Quem pede", "Guilda do Porto")}</div>
    <label class="nl-campo"><span class="nl-rot-p">Texto curto (**negrito**, *itálico*)</span><textarea class="nl-in ncz-ed-txt" rows="3" data-cz="texto" placeholder="Roubo ao tesouro do Barão e fuga das masmorras.">${esc(c.texto)}</textarea></label>
    <div class="nl-grade2">${campo("recompensa", "Valor", "500 Florins")}${campo("recRotulo", "Nome do valor", t.rec)}</div>
    <div class="nl-grade2">${era === "cyberpunk" ? campo("contratante", "Quem pede", "NCPD") : ""}${campo("prazo", "Prazo", "até a lua cheia")}</div>
    ${era === "cyberpunk" ? `<label class="nl-faixa"><span>Ameaça <b data-cz-ver>${c.ameaca ? `${c.ameaca}%` : "escondida"}</b></span><input type="range" min="0" max="100" step="5" data-cz="ameaca" value="${c.ameaca}"></label>` : ""}
    ${era === "moderno" ? `<label class="nl-cor"><input type="color" data-cz="cor" value="${esc(c.cor || t.cor)}"><span>Cor da faixa</span></label>` : ""}
    <div class="nl-campo"><span class="nl-rot-p">Retrato</span><div class="nl-linha-cores">${c.retrato ? `<img class="ncz-ed-retrato" src="${esc(c.retrato)}" alt="">` : ""}<button type="button" class="nl-btn nt-ch" data-cz-acao="retrato"><i class="fas fa-image-portrait"></i> ${c.retrato ? "Trocar" : "Escolher"}</button>${c.retrato ? `<button type="button" class="nl-link" data-cz-acao="semRetrato"><i class="fas fa-xmark"></i> tirar</button>` : `<span class="nl-dica">${t.retrato ? "Sem imagem, aparece uma silhueta." : "Opcional."}</span>`}</div></div>
    <div class="nl-campo"><span class="nl-rot-p">Detalhes (altura, visto em, crimes…)</span>${det}<button type="button" class="nl-link" data-cz-acao="novoDet" ${c.detalhes.length >= 6 ? "disabled" : ""}><i class="fas fa-plus"></i> detalhe</button></div>
  </div>`;
}
export function naurenCartazDoJson(o) { return naurenCartazNormalizar(o); }
export function naurenCartazParaJson(c) {
  const o = {}; for (const [k, v] of Object.entries(c)) { if (Array.isArray(v) ? v.length : v) o[k] = v; }
  o.tipo = c.tipo; return o;
}
