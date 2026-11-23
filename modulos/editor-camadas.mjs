/* Nauren RPG — Editor de camadas de animação (0.124). Usado nas Ações, Condições e Emanações.
 * naurenEditorCamadasHtml(...) é puro (testado/visto em Node); naurenLigarEditorCamadas(...) liga os botões. */
import { NAUREN_CONTEXTOS_CAMADA, NAUREN_CONTEXTOS_LOOP, NAUREN_ONDE_CAMADA, NAUREN_PLANOS_CAMADA, naurenAdaptarCamadas, naurenCamadaNormalizar, naurenCamadaPadrao, naurenCssDaCor, naurenVariacoesDeCor } from "./animacao-camadas.mjs";

const esc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const curto = a => { let s = String(a ?? ""); if (s.includes("/")) s = s.split("/").pop().replace(/\.[a-z0-9]+$/i, ""); const p = s.split(".").filter(Boolean); if (p[0] === "jb2a") p.shift(); return p.map(x => x.replace(/_/g, " ")).join(" · "); };
const abertas = new Map(); // idBase -> Set de índices abertos (sobrevive ao redesenho da ficha)
/** Deixa a camada i aberta no próximo desenho (prévia, camada nova). */
export function naurenEditorCamadasAbrir(idBase, i) { if (!abertas.has(idBase)) abertas.set(idBase, new Set()); abertas.get(idBase).add(i); }

export const NAUREN_TITULOS_CONTEXTO = Object.freeze({
  acao: "Ao usar", areaContinuo: "Enquanto a área existir (loop)", areaPulso: "A cada efeito da área",
  condicao: "Ao receber", condicaoContinuo: "Enquanto durar (preso ao token)", emanacaoContinuo: "Aura (loop, presa ao token)", emanacaoPulso: "A cada efeito da Emanação"
});

function faixa(i, campo, rot, min, max, passo, valor, fmt) {
  return `<label class="nce-faixa"><span>${rot}<b data-nce-ver="${campo}">${fmt(valor)}</b></span><input type="range" data-i="${i}" data-c="${campo}" data-fmt="${campo}" min="${min}" max="${max}" step="${passo}" value="${valor}"></label>`;
}
export const NAUREN_FMT_CAMADA = {
  escala: v => `${Number(v).toFixed(2)}×`, opacidade: v => `${Math.round(v * 100)}%`, velocidade: v => `${Number(v).toFixed(2)}×`,
  matiz: v => Number(v) ? `${v}°` : "original", saturacao: v => Number(v) ? `${Number(v) > 0 ? "+" : ""}${Math.round(v * 100)}%` : "original",
  brilho: v => Number(v) === 1 ? "original" : `${Math.round(v * 100)}%`, somVolume: v => `${Math.round(v * 100)}%`,
  deslocAleatorio: v => Number(v) ? `${Number(v).toFixed(1)} token` : "nenhum", rotacao: v => `${v}°`, tremer: v => Number(v) ? `${v}` : "sem tremor"
};
const numero = (i, campo, rot, valor, { min = 0, max = 99999, passo = 1, un = "", dica = "" } = {}) =>
  `<label class="nce-num" ${dica ? `title="${esc(dica)}"` : ""}><span>${rot}</span><span class="nce-num-in"><input type="number" data-i="${i}" data-c="${campo}" min="${min}" max="${max}" step="${passo}" value="${valor}">${un ? `<em>${un}</em>` : ""}</span></label>`;
const marca = (i, campo, rot, valor, dica = "") => `<label class="nce-check" ${dica ? `title="${esc(dica)}"` : ""}><input type="checkbox" data-i="${i}" data-c="${campo}" ${valor ? "checked" : ""}> ${rot}</label>`;

/** HTML do editor. opcoes: { contexto, idBase, sequencer, gm, aviso } */
export function naurenEditorCamadasHtml(camadas, { contexto = "acao", idBase = "x", sequencer = true, gm = false, titulo = null } = {}) {
  const lista = (camadas ?? []).map(c => naurenCamadaNormalizar(c, contexto));
  const ondes = NAUREN_CONTEXTOS_CAMADA[contexto] ?? NAUREN_CONTEXTOS_CAMADA.acao;
  const loop = NAUREN_CONTEXTOS_LOOP.includes(contexto);
  const abertasAqui = abertas.get(idBase) ?? new Set();
  const cards = lista.map((c, i) => {
    const aberta = abertasAqui.has(i);
    const optOnde = ondes.map(o => `<option value="${o}" ${o === c.onde ? "selected" : ""}>${NAUREN_ONDE_CAMADA[o].rotulo}</option>`).join("");
    const resumo = [ondes.length > 1 ? null : NAUREN_ONDE_CAMADA[c.onde].rotulo, c.anim ? curto(c.anim) : (c.som ? "só som" : "vazia"), c.atraso ? `+${(c.atraso / 1000).toFixed(1)} s` : null, c.repetir > 1 ? `${c.repetir}×` : null, c.som && c.anim ? "♪" : null, c.tremer ? "tremor" : null].filter(Boolean).join(" · ");
    const corpo = !aberta ? "" : `<div class="nce-corpo">
      <section class="nce-sec nce-sec-anim">
        <h5><i class="fas fa-film"></i> Animação</h5>
        <div class="nce-arq"><input type="text" data-i="${i}" data-c="anim" value="${esc(c.anim)}" placeholder="${sequencer ? "ex.: jb2a.fireball.explosion.orange" : "precisa do Sequencer"}"><button type="button" class="nce-btn nce-prim" data-nce-acao="procurar" data-i="${i}"><i class="fas fa-magnifying-glass"></i> Procurar</button><button type="button" class="nce-btn nce-ic" data-nce-acao="arquivoAnim" data-i="${i}" title="Arquivo .webm"><i class="fas fa-folder-open"></i></button></div>
        <div class="nce-cores" data-nce-cores="${i}" data-anim="${esc(c.anim)}"></div>
      </section>
      <section class="nce-sec">
        <h5><i class="fas fa-clock"></i> Tempo</h5>
        <div class="nce-grade">
          ${loop ? "" : numero(i, "atraso", "Atraso", c.atraso, { passo: 50, un: "ms", dica: "Espera antes de começar (conta do começo do grupo)." })}
          ${numero(i, "duracao", "Duração", c.duracao, { passo: 100, un: "ms", dica: "0 = a duração do próprio vídeo." })}
          ${loop ? "" : numero(i, "repetir", "Repetir", c.repetir, { min: 1, max: 20, un: "×" })}
          ${loop ? "" : numero(i, "repetirIntervalo", "Intervalo", c.repetirIntervalo, { passo: 50, un: "ms", dica: "Entre as repetições." })}
          ${numero(i, "fadeIn", "Surgir", c.fadeIn, { passo: 50, un: "ms" })}
          ${numero(i, "fadeOut", "Sumir", c.fadeOut, { passo: 50, un: "ms" })}
        </div>
        ${faixa(i, "velocidade", "Velocidade", 0.1, 3, 0.05, c.velocidade, NAUREN_FMT_CAMADA.velocidade)}
      </section>
      <section class="nce-sec">
        <h5><i class="fas fa-up-right-and-down-left-from-center"></i> Forma</h5>
        ${faixa(i, "escala", c.onde === "aura" ? "Tamanho (do raio)" : c.onde === "area" ? "Tamanho (da área)" : "Tamanho (do token)", 0.1, 6, 0.05, c.escala, NAUREN_FMT_CAMADA.escala)}
        ${faixa(i, "opacidade", "Opacidade", 0, 1, 0.05, c.opacidade, NAUREN_FMT_CAMADA.opacidade)}
        ${faixa(i, "rotacao", "Girar", -180, 180, 5, c.rotacao, NAUREN_FMT_CAMADA.rotacao)}
        ${faixa(i, "deslocAleatorio", "Posição aleatória", 0, 3, 0.1, c.deslocAleatorio, NAUREN_FMT_CAMADA.deslocAleatorio)}
        <div class="nce-linha">
          <label class="nce-sel"><span>Plano</span><select data-i="${i}" data-c="plano">${Object.entries(NAUREN_PLANOS_CAMADA).map(([k, v]) => `<option value="${k}" ${k === c.plano ? "selected" : ""}>${v}</option>`).join("")}</select></label>
          ${marca(i, "rotacaoAleatoria", "Giro aleatório", c.rotacaoAleatoria)}
          ${marca(i, "espelhar", "Espelhar", c.espelhar)}
          ${marca(i, "espelharAleatorio", "Espelho aleatório", c.espelharAleatorio)}
          ${c.onde === "projetil" ? marca(i, "noErro", "Tocar no erro", c.noErro, "Quando erra, o projétil passa do lado do alvo. Desmarcado: só nos atingidos.") : ""}
        </div>
      </section>
      <section class="nce-sec">
        <h5><i class="fas fa-palette"></i> Cor</h5>
        ${faixa(i, "matiz", "Matiz", -180, 180, 5, c.matiz, NAUREN_FMT_CAMADA.matiz)}
        ${faixa(i, "saturacao", "Saturação", -1, 1, 0.05, c.saturacao, NAUREN_FMT_CAMADA.saturacao)}
        ${faixa(i, "brilho", "Brilho", 0, 2.5, 0.05, c.brilho, NAUREN_FMT_CAMADA.brilho)}
        <div class="nce-linha"><label class="nce-sel"><span>Tingir</span><input type="color" data-i="${i}" data-c="tingir" value="${c.tingir || "#ffffff"}"></label>${c.tingir ? `<button type="button" class="nce-btn" data-nce-acao="semTinta" data-i="${i}"><i class="fas fa-eraser"></i> Sem tinta</button>` : `<span class="nce-dica">branco = sem tinta</span>`}</div>
      </section>
      ${loop ? "" : `<section class="nce-sec">
        <h5><i class="fas fa-volume-high"></i> Som e tela</h5>
        <div class="nce-arq"><input type="text" data-i="${i}" data-c="som" value="${esc(c.som)}" placeholder="arquivo .ogg / .mp3"><button type="button" class="nce-btn nce-ic" data-nce-acao="arquivoSom" data-i="${i}" title="Escolher som"><i class="fas fa-folder-open"></i></button><button type="button" class="nce-btn nce-ic" data-nce-acao="ouvir" data-i="${i}" title="Ouvir (só você)"><i class="fas fa-play"></i></button></div>
        <div class="nce-grade">${numero(i, "somAtraso", "Atraso do som", c.somAtraso, { passo: 50, un: "ms" })}${numero(i, "tremerDuracao", "Tremor (duração)", c.tremerDuracao, { min: 50, max: 5000, passo: 50, un: "ms" })}</div>
        ${faixa(i, "somVolume", "Volume", 0, 1, 0.05, c.somVolume, NAUREN_FMT_CAMADA.somVolume)}
        ${faixa(i, "tremer", "Tremer a tela", 0, 60, 1, c.tremer, NAUREN_FMT_CAMADA.tremer)}
      </section>`}
    </div>`;
    return `<li class="nce-camada ${c.ativo ? "" : "off"} ${aberta ? "aberta" : ""}" data-i="${i}">
      <div class="nce-cab">
        <span class="nce-n">${i + 1}</span>
        <span class="nce-mini"><video muted loop autoplay playsinline data-nce-previa="${esc(c.anim)}"></video><i class="fas ${c.anim ? "fa-film" : c.som ? "fa-volume-high" : "fa-layer-group"}"></i></span>
        <div class="nce-info"><input type="text" class="nce-nome" data-i="${i}" data-c="nome" value="${esc(c.nome)}" placeholder="Camada ${i + 1}"><span class="nce-res">${esc(resumo)}</span></div>
        ${ondes.length > 1 ? `<select class="nce-onde" data-i="${i}" data-c="onde" title="Onde toca">${optOnde}</select>` : ""}
        ${loop || i === 0 ? "" : `<select class="nce-quando" data-i="${i}" data-c="quando" title="Quando começa"><option value="junto" ${c.quando === "junto" ? "selected" : ""}>Junto da anterior</option><option value="depois" ${c.quando === "depois" ? "selected" : ""}>Depois da anterior</option></select>`}
        <span class="nce-bts">
          <button type="button" data-nce-acao="ligar" data-i="${i}" title="${c.ativo ? "Desligar" : "Ligar"}"><i class="fas ${c.ativo ? "fa-eye" : "fa-eye-slash"}"></i></button>
          <button type="button" data-nce-acao="subir" data-i="${i}" title="Subir" ${i === 0 ? "disabled" : ""}><i class="fas fa-chevron-up"></i></button>
          <button type="button" data-nce-acao="descer" data-i="${i}" title="Descer" ${i === lista.length - 1 ? "disabled" : ""}><i class="fas fa-chevron-down"></i></button>
          <button type="button" data-nce-acao="duplicar" data-i="${i}" title="Duplicar"><i class="fas fa-clone"></i></button>
          <button type="button" data-nce-acao="apagar" data-i="${i}" title="Apagar" class="nce-perigo"><i class="fas fa-trash"></i></button>
          <button type="button" data-nce-acao="abrir" data-i="${i}" title="${aberta ? "Fechar" : "Ajustar"}" class="nce-abrir"><i class="fas ${aberta ? "fa-chevron-up" : "fa-sliders"}"></i></button>
        </span>
      </div>${corpo}</li>`;
  }).join("");
  return `<div class="nce" data-nce="${esc(idBase)}" data-contexto="${contexto}">
    <div class="nce-topo">
      <span class="nce-tit"><i class="fas fa-layer-group"></i> ${esc(titulo ?? NAUREN_TITULOS_CONTEXTO[contexto] ?? "Camadas")}</span>
      <span class="nce-conta">${lista.length ? `${lista.length} camada${lista.length > 1 ? "s" : ""}` : ""}</span>
      <span class="nce-topo-bts">
        <button type="button" class="nce-btn" data-nce-acao="combos"><i class="fas fa-wand-magic-sparkles"></i> Combos</button>
        ${gm && lista.length ? `<button type="button" class="nce-btn" data-nce-acao="salvarCombo" title="Guardar estas camadas como combo do mundo"><i class="fas fa-bookmark"></i> Salvar combo</button>` : ""}
        ${lista.length ? `<button type="button" class="nce-btn" data-nce-acao="testar"><i class="fas fa-play"></i> Testar</button>` : ""}
        <button type="button" class="nce-btn nce-prim" data-nce-acao="nova"><i class="fas fa-plus"></i> Camada</button>
      </span>
    </div>
    ${!sequencer ? `<p class="nce-aviso"><i class="fas fa-circle-info"></i> Sem o <b>Sequencer</b> ativo só os sons tocam.</p>` : ""}
    ${lista.length ? `<ol class="nce-lista">${cards}</ol>` : `<p class="nce-vazio">Nenhuma camada. Adicione uma ou escolha um combo pronto.</p>`}
    <div class="nce-menu" hidden></div>
  </div>`;
}

/**
 * Monta e liga um editor dentro de "alvo".
 * opcoes: { contexto, idBase, ler: () => camadas[], gravar: async camadas => {}, testar: async camadas => {} }
 */
export async function naurenLigarEditorCamadas(alvo, { contexto, idBase, ler, gravar, testar = null, titulo = null }) {
  const aa = await import("./animacao-acao.mjs");
  const cam = await import("./animacao-camadas.mjs");
  const seq = aa.naurenSequencerAtivo();
  const desenhar = () => {
    alvo.innerHTML = naurenEditorCamadasHtml(ler(), { contexto, idBase, sequencer: seq, gm: !!game.user?.isGM, titulo });
    ligar();
  };
  const atual = () => (ler() ?? []).map(c => naurenCamadaNormalizar(c, contexto));
  const salvar = async lista => { await gravar(lista.map(c => naurenCamadaNormalizar(c, contexto))); };
  const abertasDe = () => { if (!abertas.has(idBase)) abertas.set(idBase, new Set()); return abertas.get(idBase); };
  const ligar = () => {
    const raiz = alvo.querySelector(".nce"); if (!raiz) return;
    // prévias
    raiz.querySelectorAll("[data-nce-previa]").forEach(v => { const arq = v.dataset.ncePrevia && aa.naurenArquivoDaAnimacao(v.dataset.ncePrevia); if (arq) { v.src = arq; v.closest(".nce-mini")?.classList.add("tem"); } });
    // variações de cor (só nas camadas abertas)
    const todas = seq ? aa.naurenListaAnimacoesSequencer() : [];
    raiz.querySelectorAll("[data-nce-cores]").forEach(div => {
      const vars = naurenVariacoesDeCor(div.dataset.anim, todas);
      if (vars.length < 2) { div.innerHTML = ""; return; }
      div.innerHTML = `<span class="nce-sub">Cores:</span>` + vars.slice(0, 30).map(v => `<button type="button" class="nce-cor ${v.caminho === div.dataset.anim ? "on" : ""}" data-nce-acao="cor" data-i="${div.dataset.nceCores}" data-v="${esc(v.caminho)}" title="${esc(v.cor)}" style="--cor:${naurenCssDaCor(v.cor)}"></button>`).join("");
      div.querySelectorAll("[data-nce-acao=cor]").forEach(b => b.addEventListener("click", ev => acao(ev, b)));
    });
    // campos
    raiz.querySelectorAll("input[data-c], select[data-c]").forEach(el => {
      if (el.type === "range") el.addEventListener("input", () => { const b = el.closest(".nce-faixa")?.querySelector("[data-nce-ver]"); if (b) b.textContent = (NAUREN_FMT_CAMADA[el.dataset.fmt] ?? (v => v))(el.value); });
      el.addEventListener("change", async ev => {
        ev.stopPropagation();
        const lista = atual(), i = Number(el.dataset.i), c = lista[i]; if (!c) return;
        const v = el.type === "checkbox" ? el.checked : (el.type === "number" || el.type === "range") ? Number(el.value) : el.value;
        c[el.dataset.c] = el.dataset.c === "tingir" && v === "#ffffff" ? "" : v;
        await salvar(lista);
      });
    });
    raiz.querySelectorAll("button[data-nce-acao]").forEach(b => { if (b.dataset.nceAcao !== "cor") b.addEventListener("click", ev => acao(ev, b)); });
  };
  const arquivo = (tipo, atualV, cb) => { const FP = foundry.applications?.apps?.FilePicker?.implementation ?? globalThis.FilePicker; new FP({ type: tipo, current: atualV || "", callback: cb }).render(true); };
  const menuCombos = async (botao) => {
    const raiz = alvo.querySelector(".nce"), menu = raiz.querySelector(".nce-menu");
    if (!menu.hidden) { menu.hidden = true; return; }
    const lista = cam.naurenTodosOsCombos(contexto);
    menu.innerHTML = `<div class="nce-menu-tit">Combos <span>adicione no fim ou troque tudo</span></div>` + (lista.length ? lista.map(cb => `<div class="nce-combo">
        <div><b>${esc(cb.nome)}</b>${cb.pronto ? `<span class="nce-tag">pronto</span>` : `<span class="nce-tag nce-tag-m">do mundo</span>`}<small>${esc(cb.descricao || `${cb.camadas.length} camada(s)`)}</small></div>
        <span><button type="button" class="nce-btn" data-cb="${esc(cb.id)}" data-modo="add"><i class="fas fa-plus"></i></button><button type="button" class="nce-btn" data-cb="${esc(cb.id)}" data-modo="trocar" title="Trocar todas as camadas"><i class="fas fa-right-left"></i></button>${!cb.pronto && game.user?.isGM ? `<button type="button" class="nce-btn nce-perigo" data-cb="${esc(cb.id)}" data-modo="apagar" title="Apagar combo"><i class="fas fa-trash"></i></button>` : ""}</span>
      </div>`).join("") : `<p class="nce-vazio">Nenhum combo para este lugar.</p>`);
    menu.hidden = false;
    menu.querySelectorAll("[data-cb]").forEach(b => b.addEventListener("click", async ev => {
      ev.preventDefault(); ev.stopPropagation();
      const cb = lista.find(x => x.id === b.dataset.cb); if (!cb) return;
      if (b.dataset.modo === "apagar") { await cam.naurenApagarComboDoMundo(cb.id); menu.hidden = true; return; }
      const novas = naurenAdaptarCamadas(foundry.utils.deepClone(cb.camadas), contexto);
      const base = b.dataset.modo === "trocar" ? [] : atual();
      abertas.set(idBase, new Set());
      await salvar([...base, ...novas]);
    }));
  };
  async function acao(ev, b) {
    ev.preventDefault(); ev.stopPropagation();
    const tipo = b.dataset.nceAcao, i = Number(b.dataset.i), lista = atual(), ab = abertasDe();
    switch (tipo) {
      case "nova": { lista.push(naurenCamadaPadrao((NAUREN_CONTEXTOS_CAMADA[contexto] ?? ["alvo"])[0])); ab.add(lista.length - 1); return salvar(lista); }
      case "abrir": if (ab.has(i)) ab.delete(i); else ab.add(i); return desenhar();
      case "ligar": lista[i].ativo = !lista[i].ativo; return salvar(lista);
      case "apagar": lista.splice(i, 1); abertas.set(idBase, new Set([...ab].filter(x => x !== i).map(x => x > i ? x - 1 : x))); return salvar(lista);
      case "duplicar": lista.splice(i + 1, 0, foundry.utils.deepClone(lista[i])); return salvar(lista);
      case "subir": case "descer": {
        const j = tipo === "subir" ? i - 1 : i + 1; if (j < 0 || j >= lista.length) return;
        [lista[i], lista[j]] = [lista[j], lista[i]];
        const tinhaI = ab.has(i), tinhaJ = ab.has(j); ab.delete(i); ab.delete(j); if (tinhaI) ab.add(j); if (tinhaJ) ab.add(i);
        return salvar(lista);
      }
      case "procurar": {
        if (!seq) return ui.notifications.warn("O Sequencer não está ativo.");
        const v = await aa.NaurenSeletorAnimacao.escolher({ atual: lista[i].anim, titulo: `Camada ${i + 1}: animação` });
        if (v === null) return; lista[i].anim = v; return salvar(lista);
      }
      case "cor": lista[i].anim = b.dataset.v; return salvar(lista);
      case "semTinta": lista[i].tingir = ""; return salvar(lista);
      case "arquivoAnim": return arquivo("imagevideo", lista[i].anim, async p => { const l = atual(); l[i].anim = p; await salvar(l); });
      case "arquivoSom": return arquivo("audio", lista[i].som, async p => { const l = atual(); l[i].som = p; await salvar(l); });
      case "ouvir": if (lista[i].som) foundry.audio.AudioHelper.play({ src: lista[i].som, volume: lista[i].somVolume, autoplay: true, loop: false }, false); return;
      case "combos": return menuCombos(b);
      case "salvarCombo": {
        const nome = await foundry.applications.api.DialogV2.prompt({ window: { title: "Salvar combo" }, content: `<label style="display:flex;flex-direction:column;gap:6px">Nome do combo<input type="text" name="nome" autofocus></label>`, ok: { label: "Salvar", callback: (e, btn) => btn.form.elements.nome.value } }).catch(() => null);
        if (!nome) return;
        await cam.naurenSalvarComboDoMundo(nome, contexto, lista);
        return ui.notifications.info(`Combo "${nome}" salvo. Ele aparece em Combos em qualquer ficha.`);
      }
      case "testar": if (testar) return testar(lista); return;
    }
  }
  desenhar();
}
