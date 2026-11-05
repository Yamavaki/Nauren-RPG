/* Nauren RPG — Editor da borda do token (0.103).
 *
 * Uma janela só para todas as bordas: a borda dinâmica do Foundry e as molduras do Nauren aparecem na mesma
 * galeria, como opções iguais. Escolhido o modelo, as abas mostram só o que vale para ele:
 *   Foundry → Imagem · Pincel · Cores        Modelo Nauren → Imagem · Pincel · Cores · Efeitos · Reações
 *   Minha imagem → Imagem · Moldura · Pincel · Cores · Efeitos · Reações
 * Prévia grande com lupa (Ctrl+roda ou o controle) para pintar a máscara com precisão; redimensionável. */
import { NAUREN_BORDA_EFEITOS, naurenBordaAplicar, naurenBordaCaixaImagem, naurenBordaCarregarImagem, naurenBordaConfig, naurenBordaDesenharImagem, naurenBordaDesenharPrevia, naurenBordaEscalaPara, naurenBordaFolha, naurenBordaLinkDireto, naurenBordaLinkValido, naurenBordaPedraConfig, naurenBordaPedraNeutra, naurenBordaPintarTraco, naurenTextoLinkBloqueado as naurenBordaTextoLinkBloqueado, naurenBordaTokensDaFicha } from "./borda-token.mjs";
import { NAUREN_MOLDURA_MODELOS, NAUREN_MOLDURA_GRUPOS, NAUREN_MOLDURA_PALETAS, NAUREN_MOLDURA_EFEITOS, NAUREN_MOLDURA_VEL, naurenMolduraModelo, naurenMolduraSvg, naurenMolduraConfigPadrao, naurenMolduraNormalizar, naurenMolduraDetalhes } from "./molduras-modelos.mjs";
import { naurenMolduraDesenharPrevia, naurenMolduraPrepararPrevia, naurenMolduraEhNauren, naurenMolduraPiscar, naurenMolduraCamadaDe } from "./molduras-token.mjs";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
const miniaturas = new Map();
function miniatura(id, px = 72) {
  const chave = `${id}|${px}`;
  if (!miniaturas.has(chave)) miniaturas.set(chave, naurenMolduraSvg(naurenMolduraConfigPadrao(id), { px, vb: 125, sombra: false }));
  return miniaturas.get(chave);
}
const GRUPOS_GALERIA = NAUREN_MOLDURA_GRUPOS; // a 1ª (Essenciais) começa com o Padrão do Foundry e Minha imagem
const PRIMEIRO_GRUPO = GRUPOS_GALERIA[0][0];

export class NaurenMolduraEditor extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "nauren-moldura-editor",
    classes: ["nauren-kit", "nauren-armazem", "nauren-moldura"],
    position: { width: 1000, height: 720 },
    window: { title: "Borda do token", icon: "fas fa-circle-dot", resizable: true },
    actions: {
      trocarModelo: function () { this.galeria = !this.galeria; this.render(); },
      grupo: function (ev, el) { this.grupo = el.dataset.v; this.render(); },
      escolher: function (ev, el) { this.#escolherModelo(el.dataset.v); },
      aba: function (ev, el) { this.aba = el.dataset.v; this.#mostrarAba(); },
      ferramenta: function (ev, el) { this.modo = el.dataset.v; this.#ferramentas(); },
      ponta: function (ev, el) { this.ponta = el.dataset.v; this.#ferramentas(); },
      centralizar: function () { const e = this.estado; e.x = 50; e.y = 50; e.zoom = 1; this.#sinc("zoom", 1); this.desenhar(); },
      lupaMais: function () { this.#lupa(this.lupa + .5); }, lupaMenos: function () { this.#lupa(this.lupa - .5); }, lupaZero: function () { this.#lupa(1); this.vista = { x: 0, y: 0 }; this.desenhar(); },
      desfazer: function () { this.#desfazer(); }, refazer: function () { this.#refazer(); },
      limparMascara: function () { if (!this.estado.mascara.length) return; this.refazerPilha.push(...[...this.estado.mascara].reverse()); this.estado.mascara = []; this.desenhar(); },
      usarImagem: function (ev, el) { this.estado.x = 50; this.estado.y = 50; this.#carregarArte(el.dataset.v); },
      procurar: function (ev, el) { const FP = foundry.applications?.apps?.FilePicker?.implementation ?? globalThis.FilePicker; const alvo = el.dataset.alvo ?? "src"; new FP({ type: "image", current: alvo === "src" ? this.estado.src : this.estado.moldura?.imagem?.src ?? "", callback: c => { if (alvo === "src") { this.estado.x = 50; this.estado.y = 50; this.#carregarArte(c); } else this.#definirImagemMoldura(c); } }).browse(); },
      testar: function (ev, el) { this.#testar(el.dataset.v); },
      tipoCores: function (ev, el) { const m = this.estado.moldura; if (el.dataset.v === "livre") { m.paleta = "livre"; } else m.paleta = el.dataset.v; this.#remontarTexturas(); this.render(); },
      maisCor: function () { const m = this.estado.moldura; if (m.cores.length < 2) { m.cores.push("#3a2a12"); this.#remontarTexturas(); this.render(); } },
      menosCor: function () { const m = this.estado.moldura; if (m.cores.length > 1) { m.cores.pop(); this.#remontarTexturas(); this.render(); } },
      efeitoTipo: function (ev, el) { const k = Number(el.dataset.k), tipo = el.dataset.v, m = this.estado.moldura; const lista = m.efeitos; if (tipo === "nenhum") { lista.splice(k, 1); } else { const def = NAUREN_MOLDURA_EFEITOS.find(e => e.id === tipo); const atual = lista[k]; const cores = atual?.tipo === tipo ? atual.cores : Array.from({ length: def.cores }, (_, i) => ["#ffffff", "#ff6a9a", "#7ad3ff"][i]); lista[k] = { tipo, cores, vel: atual?.vel ?? 3, int: atual?.int ?? 70, fora: atual?.fora ?? false }; } this.estado.moldura = naurenMolduraNormalizar(m); this.#remontarTexturas(); this.render(); },
      pedraOriginal: function () { this.estado.pedra = naurenBordaPedraConfig(null); this.#mostrarPedra(); this.desenhar(); },
      exportar: function () { const e = this.estado; const dados = { sistema: "nauren", tipo: "bordaToken", modelo: e.modelo, cores: e.cores, corFundo: e.corFundo, corDano: e.corDano, corCura: e.corCura, efeitos: e.efeitos, arte: e.arte, borda: e.borda, pedra: e.pedra, recorte: e.recorte, moldura: e.moldura ? naurenMolduraNormalizar(e.moldura) : null }; foundry.utils.saveDataToFile(JSON.stringify(dados, null, 2), "application/json", `borda-${(this.modeloNome || "token").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`); },
      importar: function () { const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json"; inp.addEventListener("change", async () => { const f = inp.files?.[0]; if (!f) return; try { this.importarDados(JSON.parse(await f.text())); ui.notifications?.info("Borda carregada do arquivo. Clique em Salvar para usar."); } catch (err) { ui.notifications?.error("Esse arquivo não tem uma borda de token do Nauren."); } }); inp.click(); },
      remover: function () { this.acao = "remover"; this.close(); },
      cancelar: function () { this.close(); },
      salvar: function () { this.#salvar(); }
    }
  };
  constructor({ actor, tokenDoc = null, srcInicial = "", resolver = null } = {}) {
    super({});
    this.actor = actor; this.tokenDoc = tokenDoc; this.resolver = resolver;
    const salvo = tokenDoc?.getFlag?.("nauren", "borda") ?? actor.getFlag("nauren", "borda");
    const cfg = naurenBordaConfig(salvo ? { flags: { nauren: { borda: salvo } } } : (tokenDoc ?? actor.prototypeToken ?? actor));
    const imgToken = tokenDoc?.texture?.src ?? actor.prototypeToken?.texture?.src ?? "";
    this.imgToken = String(imgToken).replace(/([?&])nauren-borda=[^&]*&?/, "$1").replace(/[?&]$/, "");
    if (!cfg.src) cfg.src = srcInicial || this.imgToken || actor.img || "";
    this.estado = { ...cfg, efeitos: [...cfg.efeitos], cores: [...cfg.cores], mascara: cfg.mascara.map(t => ({ ...t, p: [...t.p] })), pedra: { ...cfg.pedra }, moldura: cfg.moldura ? foundry.utils.deepClone(cfg.moldura) : null };
    this.tinhaBorda = !!salvo?.ativa; this.salvo = salvo;
    this.qtdTokens = naurenBordaTokensDaFicha(actor).filter(td => td !== tokenDoc).length;
    this.nosTokens = this.qtdTokens > 0;
    this.galeria = !salvo?.ativa; // sem borda ainda: começa na galeria
    this.grupo = this.estado.modelo === "foundry" || this.estado.modelo === "imagem" ? PRIMEIRO_GRUPO : (naurenMolduraModelo(this.estado.modelo)?.grupo ?? PRIMEIRO_GRUPO);
    this.aba = "imagem"; this.modo = "mover"; this.ponta = "duro"; this.raioPincel = .06; this.suavidade = .55;
    this.lupa = 1; this.vista = { x: 0, y: 0 }; this.refazerPilha = [];
    this.guia = { ligada: true, opacidade: .3 };
    this.P = 512; this.img = null; this.imgOk = false; this.tex = null; this.folha = null; this.raioArte = .8; this.piscando = null; this.sitTeste = {};
    this.tamGrade = Math.min(Number(tokenDoc?.width ?? actor.prototypeToken?.width) || 1, Number(tokenDoc?.height ?? actor.prototypeToken?.height) || 1);
    this.quadro = document.createElement("canvas"); this.quadro.width = this.quadro.height = this.P;
    naurenBordaFolha().then(async f => { this.folha = f; this.raioArte = await naurenBordaEscalaPara(this.tamGrade); this.#recalcularEscala(); this.#miniaturaFoundry(); this.desenhar(); }).catch(() => {});
    this.#carregarArte(this.estado.src);
    if (this.estado.modelo !== "foundry") this.#remontarTexturas();
  }
  get title() { return `Borda do token · ${this.actor.name}`; }
  /** Carrega uma borda exportada (JSON) por cima da atual, sem mexer na imagem do personagem nem no pincel. */
  importarDados(o) {
    if (!o || o.tipo !== "bordaToken") throw new Error("não é borda");
    const e = this.estado, modelo = typeof o.modelo === "string" && (o.modelo === "foundry" || o.modelo === "imagem" || naurenMolduraModelo(o.modelo)) ? o.modelo : "foundry";
    e.modelo = modelo;
    const hex = c => typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c) ? c : null;
    if (Array.isArray(o.cores) && o.cores.every(hex)) e.cores = o.cores.slice(0, 5); e.corBorda = e.cores[0];
    for (const k of ["corFundo", "corDano", "corCura"]) if (hex(o[k])) e[k] = o[k];
    if (Array.isArray(o.efeitos)) e.efeitos = o.efeitos.filter(k => NAUREN_BORDA_EFEITOS[k]);
    if (Number.isFinite(Number(o.arte))) e.arte = Math.min(1.6, Math.max(1, Number(o.arte))); if (Number.isFinite(Number(o.borda))) e.borda = Math.min(1, Math.max(.5, Number(o.borda)));
    e.pedra = naurenBordaPedraConfig(o.pedra); if (o.recorte === "livre" || o.recorte === "redondo") e.recorte = o.recorte;
    e.moldura = modelo === "foundry" ? null : naurenMolduraNormalizar({ ...(o.moldura ?? {}), modelo });
    if (modelo === "imagem" && !e.moldura.imagem) e.moldura.imagem = { src: "", tolerancia: 30, rotacao: 0, recolorir: false, cor: "#e6bf5c", forca: .8, tamanho: 1 };
    this.tex = null; this.galeria = false; this.#recalcularEscala(); if (modelo !== "foundry") this.#remontarTexturas(true);
    this.render();
  }
  get nauren() { return this.estado.modelo !== "foundry"; }
  get modeloNome() { return this.estado.modelo === "foundry" ? "Padrão do Foundry" : this.estado.modelo === "imagem" ? "Minha imagem" : (naurenMolduraModelo(this.estado.modelo)?.nome ?? this.estado.modelo); }

  /* ---------------- HTML ---------------- */
  async _renderHTML() {
    const e = this.estado, nauren = this.nauren, imagem = e.modelo === "imagem";
    const abas = nauren ? [["imagem", "fa-image", "Imagem"], ...(imagem ? [["moldura", "fa-ring", "Moldura"]] : []), ["pincel", "fa-paintbrush", "Pincel"], ["cores", "fa-palette", "Cores"], ["efeitos", "fa-wand-magic-sparkles", "Efeitos"], ["reacoes", "fa-heart-pulse", "Reações"]]
      : [["imagem", "fa-image", "Imagem"], ["pincel", "fa-paintbrush", "Pincel"], ["cores", "fa-palette", "Cores"]];
    if (!abas.some(a => a[0] === this.aba)) this.aba = "imagem";
    const seloAtual = e.modelo === "foundry" ? `<span class="nm-selo-foundry"><i class="fas fa-ring"></i></span>` : e.modelo === "imagem" ? `<span class="nm-selo-foundry"><i class="fas fa-image"></i></span>` : `<span class="nm-selo">${naurenMolduraSvg(e.moldura, { px: 44, vb: 125, sombra: false })}</span>`;
    return `<div class="na-janela nm-janela">
      <div class="nm-corpo">
        <div class="nm-esq">
          <div class="nm-palco nt-ch"><div class="nm-carregando" hidden><i class="fas fa-spinner fa-spin"></i></div></div>
          <div class="nm-ferr">
            <div class="nt-seg2 nt-ch nm-modos">
              <button type="button" data-action="ferramenta" data-v="mover" class="${this.modo === "mover" ? "on" : ""}" title="Arrastar para enquadrar a imagem"><i class="fas fa-up-down-left-right"></i> Mover</button>
              <button type="button" data-action="ferramenta" data-v="mostrar" class="${this.modo === "mostrar" ? "on" : ""}" title="Pintar o que aparece fora da moldura"><i class="fas fa-paintbrush"></i> Mostrar</button>
              <button type="button" data-action="ferramenta" data-v="esconder" class="${this.modo === "esconder" ? "on" : ""}" title="Apagar partes da imagem"><i class="fas fa-eraser"></i> Esconder</button>
            </div>
            <label class="nm-zoom" title="Tamanho da imagem dentro da moldura"><i class="fas fa-image"></i><input type="range" name="zoom" min="0.5" max="4" step="0.01" value="${e.zoom}"><output>${Math.round(e.zoom * 100)}%</output></label>
            <button type="button" class="nm-ic" data-action="centralizar" title="Centralizar a imagem"><i class="fas fa-crosshairs"></i></button>
            <span class="nm-lupa" title="Lupa: aproxima a prévia para pintar com precisão (Ctrl+roda do mouse; arraste com o botão direito para mover a vista)"><button type="button" class="nm-ic" data-action="lupaMenos"><i class="fas fa-magnifying-glass-minus"></i></button><output data-ver="lupa">${this.lupa}×</output><button type="button" class="nm-ic" data-action="lupaMais"><i class="fas fa-magnifying-glass-plus"></i></button><button type="button" class="nm-ic" data-action="lupaZero" title="Vista inteira"><i class="fas fa-expand"></i></button></span>
          </div>
          <p class="nm-dica" data-ver="dica">Arraste para enquadrar · roda do mouse = tamanho da imagem · Ctrl+roda = lupa</p>
          <div class="nm-testes">
            <button type="button" class="na-btn" data-action="testar" data-v="dano"><i class="fas fa-heart-crack"></i> Dano</button>
            <button type="button" class="na-btn" data-action="testar" data-v="cura"><i class="fas fa-heart-pulse"></i> Cura</button>
            ${nauren ? `<button type="button" class="na-btn ${this.sitTeste.vidaBaixa ? "on" : ""}" data-action="testar" data-v="vidaBaixa"><i class="fas fa-skull"></i> Vida baixa</button><button type="button" class="na-btn ${this.sitTeste.turno ? "on" : ""}" data-action="testar" data-v="turno"><i class="fas fa-hourglass-half"></i> Turno</button>` : ""}
          </div>
        </div>
        <div class="nm-dir">
          <div class="nm-atual nt-ch">${seloAtual}<div class="nm-atual-t"><small>Modelo da borda</small><b>${esc(this.modeloNome)}</b></div><button type="button" class="na-btn" data-action="trocarModelo">${this.galeria ? "Fechar a galeria" : "Trocar modelo"}</button></div>
          ${this.galeria ? this.#htmlGaleria() : ""}
          <nav class="nt-seg2 nt-ch nm-abas">${abas.map(([id, ic, rot]) => `<button type="button" data-action="aba" data-v="${id}" class="${this.aba === id ? "on" : ""}"><i class="fas ${ic}"></i> ${rot}</button>`).join("")}</nav>
          <div class="nm-secoes">
            ${this.#htmlImagem()}
            ${imagem ? this.#htmlMoldura() : ""}
            ${this.#htmlPincel()}
            ${nauren ? this.#htmlCoresNauren() : this.#htmlCoresFoundry()}
            ${nauren ? this.#htmlEfeitos() + this.#htmlReacoes() : ""}
          </div>
        </div>
      </div>
      <div class="nt-rod">
        ${this.qtdTokens ? `<label class="nm-check"><input type="checkbox" name="nosTokens" ${this.nosTokens ? "checked" : ""}> ${this.qtdTokens === 1 ? "Aplicar também no token desta ficha que já está no mapa" : `Aplicar também nos ${this.qtdTokens} tokens desta ficha que já estão no mapa`}</label>` : ""}
        <button type="button" class="na-btn" data-action="remover" ${this.tinhaBorda ? "" : `disabled title="Este token ainda não tem borda salva."`}><i class="fas fa-ban"></i> Remover a borda</button>
        <button type="button" class="nm-ic" data-action="exportar" title="Exportar esta borda (JSON) para usar em outro personagem ou mundo"><i class="fas fa-file-export"></i></button>
        <button type="button" class="nm-ic" data-action="importar" title="Importar uma borda exportada (JSON)"><i class="fas fa-file-import"></i></button>
        <span class="nt-esp"></span>
        <button type="button" class="na-btn" data-action="cancelar">Cancelar</button>
        <button type="button" class="na-btn na-principal" data-action="salvar" ${this.imgOk ? "" : "disabled"}><i class="fas fa-check"></i> ${this.tinhaBorda ? "Salvar" : "Usar esta borda"}</button>
      </div>
    </div>`;
  }
  #htmlGaleria() {
    const e = this.estado;
    const tile = (id, nome, inner, dica = nome) => `<button type="button" class="nm-tile nt-ch ${e.modelo === id ? "on" : ""}" data-action="escolher" data-v="${id}" title="${esc(dica)}"><span class="nm-tile-img">${inner}</span><span class="nm-tile-n">${esc(nome)}</span></button>`;
    let tiles = "";
    if (this.grupo === PRIMEIRO_GRUPO) tiles = tile("foundry", "Padrão do Foundry", `<canvas class="nm-tile-foundry" width="144" height="144"></canvas>`, "A borda dinâmica do próprio Foundry") + tile("imagem", "Minha imagem", `<i class="fas fa-image nm-tile-ico"></i>`, "Use uma imagem de moldura sua (PNG)");
    tiles += NAUREN_MOLDURA_MODELOS.filter(m => m.grupo === this.grupo).map(m => tile(m.id, m.nome, miniatura(m.id))).join("");
    return `<div class="nm-galeria nt-ch">
      <div class="nt-seg2 nt-ch nm-grupos">${GRUPOS_GALERIA.map(([id, rot]) => `<button type="button" data-action="grupo" data-v="${id}" class="${this.grupo === id ? "on" : ""}">${rot}</button>`).join("")}</div>
      <div class="nm-tiles">${tiles}</div>
    </div>`;
  }
  #sec(id, inner) { return `<section class="nm-sec" data-aba="${id}" ${this.aba === id ? "" : "hidden"}>${inner}</section>`; }
  #campo(rotulo, inner, extra = "") { return `<div class="nm-campo ${extra}"><span class="nm-rotulo">${rotulo}</span>${inner}</div>`; }
  #range(nome, min, max, passo, valor, texto, data = "campo") { return `<label class="nm-range"><span>${nome.rot}<b data-ver="${nome.id}">${texto}</b></span><input type="range" class="nt-rng" data-${data}="${nome.id}" min="${min}" max="${max}" step="${passo}" value="${valor}"></label>`; }
  #htmlImagem() {
    const e = this.estado, m = e.moldura, podeNavegar = game.user.can?.("FILES_BROWSE");
    const topo = `${this.#campo("Imagem do personagem", `<div class="nm-linha"><span class="nt-in nt-ch nm-in"><i class="fas fa-image"></i><input type="text" name="src" value="${esc(e.src)}" placeholder="arquivo do servidor ou link (ex.: Imgur)" autocomplete="off"></span>${podeNavegar ? `<button type="button" class="nm-ic" data-action="procurar" data-alvo="src" title="Escolher arquivo"><i class="fas fa-folder-open"></i></button>` : ""}</div>
      <div class="nm-atalhos">${this.imgToken ? `<button type="button" class="na-btn" data-action="usarImagem" data-v="${esc(this.imgToken)}"><i class="fas fa-circle-user"></i> Imagem do token</button>` : ""}${this.actor.img && this.actor.img !== this.imgToken ? `<button type="button" class="na-btn" data-action="usarImagem" data-v="${esc(this.actor.img)}"><i class="fas fa-image"></i> Retrato</button>` : ""}</div>
      <p class="nm-aviso" data-ver="aviso" hidden></p>`)}`;
    if (!this.nauren) return this.#sec("imagem", topo + this.#campo("Recorte", `<div class="nt-seg2 nt-ch" data-grupo="recorte"><button type="button" data-recorte="redondo" class="${e.recorte === "redondo" ? "on" : ""}" title="A imagem fica dentro do círculo; com o Pincel você escolhe o que sai da borda"><i class="fas fa-circle"></i> Redondo</button><button type="button" data-recorte="livre" class="${e.recorte === "livre" ? "on" : ""}" title="Para PNG com fundo transparente: a imagem fica como é e pode sair da borda"><i class="fas fa-shapes"></i> Sem fundo (PNG)</button></div>`)
      + this.#campo("Tamanho no mapa", this.#range({ id: "arte", rot: "Arte" }, 1, 1.6, .01, e.arte, `${Math.round(e.arte * 100)}%`) + this.#range({ id: "borda", rot: "Borda" }, .5, 1, .01, e.borda, `${Math.round(e.borda * 100)}%`) + `<p class="nm-nota">O quadrado tracejado na prévia é a casa do mapa.</p>`));
    const temFora = e.modelo === "imagem" || !!naurenMolduraModelo(e.modelo)?.fora;
    return this.#sec("imagem", topo + this.#campo("Recorte da arte", `<div class="nt-seg2 nt-ch"><button type="button" data-mascara="normal" class="${m.mascara === "normal" ? "on" : ""}" title="A arte fica dentro do buraco da moldura"><i class="fas fa-circle"></i> Normal</button><button type="button" data-mascara="expandida" class="${m.mascara === "expandida" ? "on" : ""}" ${temFora ? "" : "disabled"} title="${temFora ? "A arte vai até o contorno de fora; as linhas da moldura ficam por cima" : "Este modelo não tem contorno de fora"}"><i class="fas fa-expand"></i> Expandida</button></div><p class="nm-nota">Expandida: a arte vai até o contorno de fora e a moldura fica por cima dela.</p>`)
      + (e.modelo === "imagem" ? "" : this.#campo("Tamanho e espessura", this.#range({ id: "escala", rot: "Tamanho da moldura" }, .8, 1.2, .01, m.escala, `${Math.round(m.escala * 100)}%`, "moldura") + this.#range({ id: "espessura", rot: "Espessura das linhas" }, .5, 2, .05, m.espessura, `${Math.round(m.espessura * 100)}%`, "moldura") + `<p class="nm-nota">O quadrado tracejado na prévia é a casa do mapa. A moldura pode passar um pouco dela.</p>`)));
  }
  #htmlMoldura() {
    const im = this.estado.moldura.imagem, podeNavegar = game.user.can?.("FILES_BROWSE");
    return this.#sec("moldura", this.#campo("Imagem da moldura (PNG ou WebP, de preferência com fundo transparente)", `<div class="nm-linha"><span class="nt-in nt-ch nm-in"><i class="fas fa-ring"></i><input type="text" name="molduraSrc" value="${esc(im.src)}" placeholder="arquivo do servidor ou link" autocomplete="off"></span>${podeNavegar ? `<button type="button" class="nm-ic" data-action="procurar" data-alvo="moldura" title="Escolher arquivo"><i class="fas fa-folder-open"></i></button>` : ""}</div><p class="nm-aviso" data-ver="avisoMoldura" hidden></p><p class="nm-nota">O sistema acha o buraco sozinho pela transparência (ou pela cor do fundo). Ajuste a tolerância se sobrar ou faltar pedaço.</p>`)
      + this.#campo("Ajustes", this.#range({ id: "tolerancia", rot: "Tolerância do fundo" }, 0, 100, 1, im.tolerancia, `${im.tolerancia}`, "imagem") + this.#range({ id: "rotacao", rot: "Girar a imagem" }, -180, 180, 1, im.rotacao, `${im.rotacao}°`, "imagem") + this.#range({ id: "tamanho", rot: "Tamanho (casas)" }, .6, 1.6, .01, im.tamanho, `${Math.round(im.tamanho * 100)}%`, "imagem"))
      + this.#campo("Recolorir", `<label class="nm-check"><input type="checkbox" data-imagem="recolorir" ${im.recolorir ? "checked" : ""}> Pintar a moldura mantendo luz e sombra</label><div class="nm-linha"><label class="nm-cor"><input type="color" data-imagem="cor" value="${im.cor}"><span>Cor</span></label>${this.#range({ id: "forca", rot: "Força" }, 0, 1, .05, im.forca, `${Math.round(im.forca * 100)}%`, "imagem")}</div>`));
  }
  #htmlPincel() {
    const e = this.estado;
    return this.#sec("pincel", `${!this.nauren && e.recorte !== "redondo" ? `<p class="nm-nota nm-bloqueado">O pincel é para o recorte "Redondo".</p>` : `<p class="nm-nota">Pinte na prévia o que deve sair da moldura (cabeça, arma, escudo…) ou apague pedaços. Use a lupa para pintar com precisão.</p>`}
      ${this.#campo("Ponta", `<div class="nt-seg2 nt-ch"><button type="button" data-action="ponta" data-v="duro" class="${this.ponta === "duro" ? "on" : ""}"><i class="fas fa-circle"></i> Dura</button><button type="button" data-action="ponta" data-v="suave" class="${this.ponta === "suave" ? "on" : ""}"><i class="fas fa-circle-half-stroke"></i> Suave</button></div>
        ${this.#range({ id: "pincel", rot: "Tamanho" }, .01, .25, .005, this.raioPincel, `${Math.round(this.raioPincel * 100)}`, "pincel")}
        <span data-so-suave ${this.ponta === "suave" ? "" : "hidden"}>${this.#range({ id: "suavidade", rot: "Suavidade" }, .05, 1, .05, this.suavidade, `${Math.round(this.suavidade * 100)}%`, "pincel")}</span>`)}
      ${this.#campo("Guia", `<label class="nm-check"><input type="checkbox" name="fantasma" ${this.guia.ligada ? "checked" : ""}> Mostrar a imagem inteira por baixo</label>${this.#range({ id: "fantasmaOpacidade", rot: "Opacidade" }, .05, .8, .05, this.guia.opacidade, `${Math.round(this.guia.opacidade * 100)}%`, "pincel")}`)}
      <div class="nm-linha"><button type="button" class="na-btn" data-action="desfazer" title="Ctrl+Z"><i class="fas fa-rotate-left"></i> Desfazer</button><button type="button" class="na-btn" data-action="refazer" title="Ctrl+Y"><i class="fas fa-rotate-right"></i> Refazer</button><button type="button" class="na-btn" data-action="limparMascara"><i class="fas fa-circle-notch"></i> Apagar os traços</button></div>`);
  }
  #cor(nome, rotulo, dica, valor) { return `<label class="nm-cor" title="${esc(dica)}"><input type="color" name="${nome}" value="${esc(valor)}"><span>${rotulo}</span></label>`; }
  #htmlCoresFoundry() {
    const e = this.estado;
    return this.#sec("cores", this.#campo("Cores da borda", `<div class="nm-paleta"></div><p class="nm-nota" data-ver="dicaCores"></p>`)
      + this.#campo("Moldura (a pedra)", `<div class="nm-linha"><label class="nm-check" title="Pinta a moldura mantendo a luz e a sombra da pedra"><input type="checkbox" data-pedra="colorir" ${e.pedra.colorir ? "checked" : ""}> Colorir</label><input type="color" data-pedra="cor" value="${esc(e.pedra.cor)}" title="Cor da moldura"></div>
        ${[["forca", "Força", 0, 1, .05], ["matiz", "Matiz", -180, 180, 1], ["saturacao", "Saturação", 0, 2, .05], ["brilho", "Brilho", .3, 2, .05], ["contraste", "Contraste", .5, 2, .05]].map(([k, rot, a, b, passo]) => `<label class="nm-range"><span>${rot}<b data-ver="pedra-${k}"></b></span><input type="range" class="nt-rng" data-pedra="${k}" min="${a}" max="${b}" step="${passo}" value="${e.pedra[k]}"></label>`).join("")}
        <div class="nm-linha"><button type="button" class="na-btn" data-action="pedraOriginal"><i class="fas fa-rotate-left"></i> Moldura original</button></div>`)
      + this.#campo("Fundo e piscar", `<div class="nm-cores">${this.#cor("corFundo", "Fundo", "Cor do fundo atrás da imagem (com 2+ cores na borda, o fundo usa a 2ª cor)", e.corFundo)}${this.#cor("corDano", "Ao tomar dano", "A borda pisca nesta cor quando a Vida desce", e.corDano)}${this.#cor("corCura", "Ao ser curado", "A borda pisca nesta cor quando a Vida sobe", e.corCura)}</div>`)
      + this.#campo("Efeitos", `<div class="nm-cores">${Object.entries(NAUREN_BORDA_EFEITOS).map(([k, ef]) => `<label class="nm-check" title="${esc(ef.dica)}"><input type="checkbox" name="ef-${k}" ${e.efeitos.includes(k) ? "checked" : ""}> ${ef.rotulo}</label>`).join("")}</div>`));
  }
  #htmlCoresNauren() {
    const e = this.estado, m = e.moldura, livre = m.paleta === "livre";
    const metais = Object.entries(NAUREN_MOLDURA_PALETAS).map(([id, p]) => `<button type="button" class="nm-metal ${m.paleta === id ? "on" : ""}" data-action="tipoCores" data-v="${id}" title="${esc(p.nome)}" style="background:linear-gradient(135deg,${p.cores[0]},${p.cores[1]} 30%,${p.cores[2]} 55%,${p.cores[3]})"></button>`).join("");
    const custom = `<button type="button" class="nm-metal nm-metal-livre ${livre ? "on" : ""}" data-action="tipoCores" data-v="livre" title="Cores livres"><i class="fas fa-eye-dropper"></i></button>`;
    const livres = livre ? `<div class="nm-linha nm-livres">${m.cores.map((c, i) => `<label class="nm-cor"><input type="color" data-cor-moldura="${i}" value="${c}"><span>${i === 0 ? "Cor" : "Sombra"}</span></label>`).join("")}${m.cores.length < 2 ? `<button type="button" class="nm-ic" data-action="maisCor" title="Cor da sombra"><i class="fas fa-plus"></i></button>` : `<button type="button" class="nm-ic" data-action="menosCor" title="Tirar a sombra"><i class="fas fa-minus"></i></button>`}</div>` : "";
    return this.#sec("cores", (e.modelo === "imagem" ? "" : this.#campo("Metal", `<div class="nm-metais">${metais}${custom}</div>${livres}`)
      + this.#htmlDetalhes(m)));
  }
  #htmlDetalhes(m) {
    const d = naurenMolduraDetalhes(m.modelo); if (!d.esmalte && !d.joia) return "";
    return this.#campo("Detalhes", `<div class="nm-cores">${d.esmalte ? `<label class="nm-cor" title="Cor do fundo entre as linhas e os ornamentos"><input type="color" data-moldura-cor="esmalte" value="${m.esmalte}"><span>Esmalte</span></label>` : ""}${d.joia ? `<label class="nm-cor" title="Cor das gemas"><input type="color" data-moldura-cor="joia" value="${m.joia}"><span>Gema</span></label>` : ""}</div>`);
  }
  #htmlEfeitos() {
    const m = this.estado.moldura, g = m.girar;
    const slot = k => { const e = m.efeitos[k], def = e ? NAUREN_MOLDURA_EFEITOS.find(d => d.id === e.tipo) : null, outro = m.efeitos[k === 0 ? 1 : 0];
      const opcoes = [`<option value="nenhum" ${!e ? "selected" : ""}>Nenhum</option>`, ...NAUREN_MOLDURA_EFEITOS.map(d => { const bloq = outro && (outro.tipo === d.id || ((d.id === "aura" || d.id === "neon") && (outro.tipo === "aura" || outro.tipo === "neon"))); return `<option value="${d.id}" ${e?.tipo === d.id ? "selected" : ""} ${bloq ? "disabled" : ""}>${d.nome}</option>`; })].join("");
      return `<div class="nm-efeito nt-ch"><div class="nm-linha"><b>Efeito ${k + 1}</b><select class="nt-in nt-ch" data-efeito-tipo="${k}">${opcoes}</select></div>
        ${def ? `<p class="nm-nota"><i class="fas ${def.icone}"></i> ${esc(def.dica)}</p><div class="nm-linha">${e.cores.map((c, i) => `<label class="nm-cor"><input type="color" data-efeito-cor="${k}:${i}" value="${c}"><span>${def.cores > 1 ? `Cor ${i + 1}` : "Cor"}</span></label>`).join("")}</div>
        ${def.anima === false ? "" : this.#range({ id: `vel-${k}`, rot: "Velocidade" }, 1, 5, 1, e.vel, NAUREN_MOLDURA_VEL[e.vel - 1], "efeito")}${this.#range({ id: `int-${k}`, rot: "Intensidade" }, 10, 100, 5, e.int, `${e.int}%`, "efeito")}
        ${def.fora ? `<label class="nm-check" title="O efeito fica atrás da arte: aparece só em volta, sem cobrir a imagem do personagem"><input type="checkbox" data-efeito-fora="${k}" ${e.fora ? "checked" : ""}> Só por fora da imagem</label>` : ""}` : ""}
      </div>`; };
    return this.#sec("efeitos", this.#campo("Girar a moldura", `<div class="nm-linha"><div class="nt-seg2 nt-ch nm-girar"><button type="button" data-girar="nenhum" class="${g.modo === "nenhum" ? "on" : ""}">Parada</button><button type="button" data-girar="tudo" class="${g.modo === "tudo" ? "on" : ""}"><i class="fas fa-rotate"></i> Girando</button></div><div class="nt-seg2 nt-ch nm-sentido" ${g.modo === "nenhum" ? "hidden" : ""}><button type="button" data-sentido="1" class="${g.sentido === 1 ? "on" : ""}" title="Horário"><i class="fas fa-rotate-right"></i></button><button type="button" data-sentido="-1" class="${g.sentido === -1 ? "on" : ""}" title="Anti-horário"><i class="fas fa-rotate-left"></i></button></div></div>${g.modo === "nenhum" ? "" : this.#range({ id: "girarVel", rot: "Velocidade" }, 1, 5, 1, g.vel, NAUREN_MOLDURA_VEL[g.vel - 1], "girar")}`)
      + `<div class="nm-efeitos">${slot(0)}${slot(1)}</div><p class="nm-nota">Cada jogador pode desligar as animações em Configurações → Molduras dos tokens. Aura e Neon não combinam entre si.</p>`);
  }
  #htmlReacoes() {
    const e = this.estado, r = e.moldura.reacoes;
    const card = (k, ic, rot, dica, extra = "") => `<div class="nm-reacao nt-ch ${r[k] ? "on" : ""}" title="${esc(dica)}"><span class="nm-reacao-ic nt-ch"><i class="fas ${ic}"></i></span><span class="nm-reacao-t"><b>${rot}</b><small>${dica}</small></span>${extra}<input type="checkbox" class="nm-chave" data-reacao="${k}" ${r[k] ? "checked" : ""} aria-label="${esc(rot)}"></div>`;
    const cor = (nome, v, dica) => `<input type="color" class="nm-reacao-cor" name="${nome}" value="${esc(v)}" title="${esc(dica)}">`;
    return this.#sec("reacoes", this.#campo("Vida", `<div class="nm-reacoes">
        ${card("dano", "fa-heart-crack", "Dano", "Pisca ao perder Vida", cor("corDano", e.corDano, "Cor do piscar no dano"))}
        ${card("cura", "fa-heart-pulse", "Cura", "Pisca ao recuperar Vida", cor("corCura", e.corCura, "Cor do piscar na cura"))}
        ${card("vidaBaixa", "fa-droplet", "Vida baixa", "Pulsa em vermelho abaixo de 25%")}
        ${card("morto", "fa-skull", "Caído", "Fica cinza e parada com Vida 0")}</div>`)
      + this.#campo("Combate", `<div class="nm-reacoes">
        ${card("turno", "fa-hourglass-half", "Seu turno", "Brilha enquanto é a vez deste token")}
        ${card("disposicao", "fa-people-group", "Cor do lado", "No turno, aliado verde, neutro amarelo, inimigo vermelho")}
        ${card("condicoes", "fa-flask", "Condições", "Uma Condição com cor de moldura muda a aura")}</div>`)
      + `<p class="nm-nota">Use os botões de teste embaixo da prévia para ver cada reação.</p>`);
  }


  /* ---------------- render / ligação ---------------- */
  _replaceHTML(html, content) {
    const t = content.querySelector?.(".nm-tiles"), sc = content.querySelector?.(".nm-secoes");
    if (t || sc) this.rolagem = { tiles: t?.scrollTop ?? 0, secoes: sc?.scrollTop ?? 0, grupo: this.rolagemGrupo ?? this.grupo, aba: this.rolagemAba ?? this.aba };
    this.rolagemGrupo = this.grupo; this.rolagemAba = this.aba;
    content.innerHTML = html;
  }
  /** Miniatura do Padrão do Foundry: a própria borda do Foundry (aço) desenhada no quadradinho. */
  #miniaturaFoundry() {
    const c = this.element?.querySelector(".nm-tile-foundry"); if (!c || !this.folha) return;
    try { const cfg = naurenBordaConfig({ flags: { nauren: { borda: { ativa: true, src: "", cores: ["#d9b25f"], corFundo: "#1a1426" } } } }); naurenBordaDesenharPrevia(c, null, { ...cfg, pedra: this.estado.pedra ?? cfg.pedra }, { folha: this.folha, tamGrade: 1, tempo: 0, guias: false }); } catch (err) { /* fica o quadro vazio */ }
  }
  _onRender() {
    const raiz = this.element;
    // prévia
    const palco = raiz.querySelector(".nm-palco");
    const cnv = document.createElement("canvas"); cnv.className = "nm-canvas"; cnv.width = cnv.height = this.P; palco.prepend(cnv); this.cnv = cnv;
    const ajustar = () => { if (!palco.isConnected) return; const lado = Math.max(200, Math.floor(Math.min(palco.clientWidth, palco.clientHeight))); cnv.style.width = cnv.style.height = `${lado}px`; const novoP = Math.max(300, Math.min(1024, Math.round(lado * (window.devicePixelRatio || 1)))); if (Math.abs(novoP - this.P) >= 8) { this.P = novoP; cnv.width = cnv.height = novoP; this.quadro.width = this.quadro.height = novoP; this.#remontarTexturas(true); } this.desenhar(); };
    if (typeof ResizeObserver === "function") { this.obs?.disconnect(); this.obs = new ResizeObserver(() => { cancelAnimationFrame(this.ajusteRaf); this.ajusteRaf = requestAnimationFrame(ajustar); }); this.obs.observe(palco); }
    requestAnimationFrame(ajustar);
    this.#ligarPalco(cnv);
    if (!this.laco) { const laco = t => { if (!this.element?.isConnected && this.fechou) return; if ((this.#animado() || this.piscando) && t - (this.ultimoQuadro ?? 0) > 33) { this.ultimoQuadro = t; this.desenhar(); } this.laco = requestAnimationFrame(laco); }; this.laco = requestAnimationFrame(laco); }
    // campos
    raiz.querySelector('input[name="zoom"]')?.addEventListener("input", ev => { this.estado.zoom = Number(ev.target.value); ev.target.nextElementSibling.value = `${Math.round(this.estado.zoom * 100)}%`; this.desenhar(); });
    const campoSrc = raiz.querySelector('input[name="src"]'); campoSrc?.addEventListener("change", () => { this.#carregarArte(campoSrc.value); });
    const campoMol = raiz.querySelector('input[name="molduraSrc"]'); campoMol?.addEventListener("change", () => this.#definirImagemMoldura(campoMol.value));
    raiz.querySelectorAll("[data-recorte]").forEach(b => b.addEventListener("click", () => { this.estado.recorte = b.dataset.recorte; raiz.querySelectorAll("[data-recorte]").forEach(x => x.classList.toggle("on", x === b)); this.desenhar(); }));
    raiz.querySelectorAll("[data-mascara]").forEach(b => b.addEventListener("click", () => { if (b.disabled) return; this.estado.moldura.mascara = b.dataset.mascara; raiz.querySelectorAll("[data-mascara]").forEach(x => x.classList.toggle("on", x === b)); this.#remontarTexturas(); }));
    raiz.querySelectorAll("[data-campo]").forEach(sl => sl.addEventListener("input", () => { const k = sl.dataset.campo; this.estado[k] = Number(sl.value); this.#ver(k, `${Math.round(this.estado[k] * 100)}%`); this.#recalcularEscala(); this.desenhar(); }));
    raiz.querySelectorAll("[data-moldura]").forEach(sl => sl.addEventListener("input", () => { const k = sl.dataset.moldura; this.estado.moldura[k] = Number(sl.value); this.#ver(k, `${Math.round(this.estado.moldura[k] * 100)}%`); this.#remontarTexturas(); }));
    raiz.querySelectorAll("[data-imagem]").forEach(el => el.addEventListener(el.type === "checkbox" ? "change" : "input", () => { const k = el.dataset.imagem, im = this.estado.moldura.imagem; im[k] = el.type === "checkbox" ? el.checked : el.type === "color" ? el.value : Number(el.value); if (el.type === "range") this.#ver(k, k === "rotacao" ? `${im[k]}°` : k === "tolerancia" ? `${im[k]}` : `${Math.round(im[k] * 100)}%`); this.#remontarTexturas(); }));
    raiz.querySelectorAll("[data-pincel]").forEach(sl => sl.addEventListener("input", () => { const k = sl.dataset.pincel, v = Number(sl.value); if (k === "pincel") { this.raioPincel = v; this.#ver(k, `${Math.round(v * 100)}`); } else if (k === "suavidade") { this.suavidade = v; this.#ver(k, `${Math.round(v * 100)}%`); } else if (k === "fantasmaOpacidade") { this.guia.opacidade = v; this.#ver(k, `${Math.round(v * 100)}%`); } this.desenhar(); }));
    raiz.querySelector('input[name="fantasma"]')?.addEventListener("change", ev => { this.guia.ligada = ev.target.checked; this.desenhar(); });
    raiz.querySelector('input[name="nosTokens"]')?.addEventListener("change", ev => { this.nosTokens = ev.target.checked; });
    for (const nome of ["corFundo", "corDano", "corCura"]) raiz.querySelector(`input[name="${nome}"]`)?.addEventListener("input", ev => { this.estado[nome] = ev.target.value; this.desenhar(); });
    for (const k of Object.keys(NAUREN_BORDA_EFEITOS)) raiz.querySelector(`input[name="ef-${k}"]`)?.addEventListener("change", ev => { this.estado.efeitos = this.estado.efeitos.filter(x => x !== k); if (ev.target.checked) this.estado.efeitos.push(k); this.desenhar(); });
    raiz.querySelectorAll("[data-pedra]").forEach(el => el.addEventListener(el.type === "checkbox" ? "change" : "input", () => { const k = el.dataset.pedra; const v = el.type === "checkbox" ? el.checked : el.type === "color" ? el.value : Number(el.value); this.estado.pedra = naurenBordaPedraConfig({ ...this.estado.pedra, [k]: v, ...(k === "cor" ? { colorir: true } : {}) }); this.#mostrarPedra(); this.desenhar(); }));
    if (!this.nauren) { this.#montarPaleta(); this.#mostrarPedra(); }
    raiz.querySelectorAll("[data-cor-moldura]").forEach(inp => inp.addEventListener("input", () => { this.estado.moldura.cores[Number(inp.dataset.corMoldura)] = inp.value; this.#remontarTexturas(); }));
    raiz.querySelectorAll("[data-moldura-cor]").forEach(inp => inp.addEventListener("input", () => { this.estado.moldura[inp.dataset.molduraCor] = inp.value; this.#remontarTexturas(); }));
    raiz.querySelectorAll("[data-efeito-tipo]").forEach(sel => sel.addEventListener("change", () => NaurenMolduraEditor.DEFAULT_OPTIONS.actions.efeitoTipo.call(this, null, { dataset: { k: sel.dataset.efeitoTipo, v: sel.value } })));
    raiz.querySelectorAll("[data-efeito-cor]").forEach(inp => inp.addEventListener("input", () => { const [k, i] = inp.dataset.efeitoCor.split(":").map(Number); this.estado.moldura.efeitos[k].cores[i] = inp.value; this.#remontarTexturas(); }));
    raiz.querySelectorAll("[data-efeito]").forEach(sl => sl.addEventListener("input", () => { const [campo, k] = sl.dataset.efeito.split("-"); const e = this.estado.moldura.efeitos[Number(k)]; if (!e) return; e[campo] = Number(sl.value); this.#ver(sl.dataset.efeito, campo === "vel" ? NAUREN_MOLDURA_VEL[e.vel - 1] : `${e.int}%`); this.desenhar(); }));
    raiz.querySelectorAll("[data-girar]").forEach(b => b.addEventListener("click", () => { this.estado.moldura.girar.modo = b.dataset.girar; this.render(); }));
    raiz.querySelectorAll("[data-sentido]").forEach(b => b.addEventListener("click", () => { this.estado.moldura.girar.sentido = Number(b.dataset.sentido); raiz.querySelectorAll("[data-sentido]").forEach(x => x.classList.toggle("on", x === b)); this.desenhar(); }));
    raiz.querySelector('[data-girar="girarVel"]')?.addEventListener("input", ev => { this.estado.moldura.girar.vel = Number(ev.target.value); this.#ver("girarVel", NAUREN_MOLDURA_VEL[this.estado.moldura.girar.vel - 1]); });
    raiz.querySelectorAll("[data-reacao]").forEach(cb => cb.addEventListener("change", () => { this.estado.moldura.reacoes[cb.dataset.reacao] = cb.checked; cb.closest(".nm-reacao")?.classList.toggle("on", cb.checked); }));
    raiz.querySelectorAll(".nm-reacao").forEach(card => card.addEventListener("click", ev => { if (ev.target.closest("input")) return; card.querySelector("[data-reacao]")?.click(); }));
    raiz.querySelectorAll("[data-efeito-fora]").forEach(cb => cb.addEventListener("change", () => { const ef = this.estado.moldura.efeitos[Number(cb.dataset.efeitoFora)]; if (ef) ef.fora = cb.checked; this.desenhar(); }));
    this.#miniaturaFoundry();
    // a rolagem da galeria e das opções fica onde estava
    if (this.rolagem) { const t = raiz.querySelector(".nm-tiles"), sc = raiz.querySelector(".nm-secoes"); if (t && this.rolagem.grupo === this.grupo) t.scrollTop = this.rolagem.tiles; if (sc && this.rolagem.aba === this.aba) sc.scrollTop = this.rolagem.secoes; }
    // teclas: Ctrl+Z / Ctrl+Y
    if (!this.teclas) { this.teclas = ev => { if (!this.element?.isConnected) { document.removeEventListener("keydown", this.teclas, true); this.teclas = null; return; } if (!(ev.ctrlKey || ev.metaKey) || ev.altKey) return; if (ev.target?.matches?.('input[type="text"], textarea')) return; const k = ev.key.toLowerCase(); if (k === "z" && !ev.shiftKey) { ev.preventDefault(); ev.stopPropagation(); this.#desfazer(); } else if (k === "y" || (k === "z" && ev.shiftKey)) { ev.preventDefault(); ev.stopPropagation(); this.#refazer(); } }; document.addEventListener("keydown", this.teclas, true); }
    this.#ferramentas(); this.#mostrarAba(); this.#avisar(this.avisoTexto);
  }
  #ver(id, texto) { const el = this.element?.querySelector(`[data-ver="${id}"]`); if (el) el.textContent = texto; }
  #sinc(nome, v) { const el = this.element?.querySelector(`input[name="${nome}"]`); if (el) { el.value = v; if (el.nextElementSibling?.tagName === "OUTPUT") el.nextElementSibling.value = `${Math.round(v * 100)}%`; } }
  #mostrarAba() { const raiz = this.element; if (!raiz) return; raiz.querySelectorAll(".nm-abas [data-v]").forEach(b => b.classList.toggle("on", b.dataset.v === this.aba)); raiz.querySelectorAll("section.nm-sec").forEach(s => { s.hidden = s.dataset.aba !== this.aba; }); if (this.aba !== "pincel" && this.modo !== "mover") { this.modo = "mover"; this.#ferramentas(); } this.desenhar(); }
  #ferramentas() { const raiz = this.element; if (!raiz) return; raiz.querySelectorAll(".nm-modos [data-v]").forEach(b => b.classList.toggle("on", b.dataset.v === this.modo)); raiz.querySelectorAll('[data-action="ponta"]').forEach(b => b.classList.toggle("on", b.dataset.v === this.ponta)); const ss = raiz.querySelector("[data-so-suave]"); if (ss) ss.hidden = this.ponta !== "suave"; this.cnv?.classList.toggle("pintando", this.modo !== "mover"); this.#ver("dica", this.modo === "mover" ? "Arraste para enquadrar · roda do mouse = tamanho da imagem · Ctrl+roda = lupa" : `Pinte na prévia para ${this.modo === "mostrar" ? "mostrar" : "esconder"} · roda = tamanho do pincel · Ctrl+roda = lupa · botão direito arrasta a vista`); if (this.modo !== "mover" && this.aba !== "pincel") { this.aba = "pincel"; this.#mostrarAba(); } this.desenhar(); }
  #lupa(v) { this.lupa = Math.max(1, Math.min(6, Math.round(v * 2) / 2)); if (this.lupa === 1) this.vista = { x: 0, y: 0 }; this.#ver("lupa", `${this.lupa}×`); this.desenhar(); }
  #animado() { const e = this.estado; if (this.nauren) { const m = e.moldura; return m.efeitos.some(x => x.tipo !== "aura") || m.girar.modo !== "nenhum" || this.sitTeste.vidaBaixa || this.sitTeste.turno; } return e.efeitos.length > 0 || e.cores.length > 1; }
  #recalcularEscala() { const e = this.estado; if (!this.nauren) e.escala = Math.max(.5, e.arte * this.raioArte / e.borda); }
  #avisar(texto) { this.avisoTexto = texto; const el = this.element?.querySelector('[data-ver="aviso"]'); if (el) { el.hidden = !texto; el.textContent = texto ?? ""; } }
  #travarSalvar() { const b = this.element?.querySelector('[data-action="salvar"]'); if (b) b.disabled = !this.imgOk; }
  async #carregarArte(src) {
    const link = naurenBordaLinkDireto(src); this.estado.src = link;
    const campo = this.element?.querySelector('input[name="src"]'); if (campo && campo.value !== link) campo.value = link;
    this.imgOk = false; this.img = null; this.#travarSalvar();
    if (!link) { this.#avisar("Escolha um arquivo ou cole o link de uma imagem."); this.desenhar(); return; }
    if (!naurenBordaLinkValido(link)) { this.#avisar("O link precisa ser direto para a imagem: terminar em .png, .jpg, .webp ou .gif."); this.desenhar(); return; }
    const carregando = this.element?.querySelector(".nm-carregando"); if (carregando) carregando.hidden = false;
    try { this.img = await naurenBordaCarregarImagem(link); this.imgOk = true; this.#avisar(""); }
    catch (err) { this.#avisar(naurenBordaTextoLinkBloqueado(link)); }
    if (carregando) carregando.hidden = true; this.#travarSalvar(); this.desenhar();
  }
  #definirImagemMoldura(src) {
    const link = naurenBordaLinkDireto(src); this.estado.moldura.imagem.src = link;
    const campo = this.element?.querySelector('input[name="molduraSrc"]'); if (campo && campo.value !== link) campo.value = link;
    this.#remontarTexturas();
  }
  /** Regera as imagens da moldura Nauren para a prévia (com atraso curto para não gerar a cada pixel do controle). */
  #remontarTexturas(agora = false) {
    if (!this.nauren) return;
    clearTimeout(this.remontarTimer);
    const fazer = async () => {
      const pedido = (this.remontarN = (this.remontarN ?? 0) + 1);
      const cfg = { ...this.estado, moldura: naurenMolduraNormalizar(this.estado.moldura) };
      const carregando = this.element?.querySelector(".nm-carregando"); if (carregando && !this.tex) carregando.hidden = false;
      try {
        const tex = await naurenMolduraPrepararPrevia(cfg, this.P, naurenBordaCarregarImagem);
        if (pedido !== this.remontarN) return;
        this.tex = tex;
        const m = this.estado.moldura; m.vb = tex.vb; m.ext = tex.ext; m.raio = tex.raioMascara;
        this.estado.arte = tex.vb / 100; this.estado.escala = 1; this.estado.borda = tex.ext / 100;
        const av = this.element?.querySelector('[data-ver="avisoMoldura"]'); if (av) { av.hidden = true; }
      } catch (err) {
        const av = this.element?.querySelector('[data-ver="avisoMoldura"]'); if (av) { av.hidden = false; av.textContent = this.estado.moldura.imagem?.src ? naurenBordaTextoLinkBloqueado(this.estado.moldura.imagem.src) : "Escolha a imagem da moldura."; }
      }
      if (carregando) carregando.hidden = true;
      this.desenhar();
    };
    if (agora) fazer(); else this.remontarTimer = setTimeout(fazer, 120);
  }
  #escolherModelo(id) {
    const e = this.estado;
    if (id === e.modelo) return; // a galeria continua aberta para comparar
    e.modelo = id;
    if (id === "foundry") { e.moldura = null; e.recorte = e.recorte || "redondo"; const eraFoundry = !this.salvo?.modelo || this.salvo.modelo === "foundry"; e.arte = eraFoundry ? Math.min(1.6, Math.max(1, Number(this.salvo?.arte) || 1)) : 1; e.borda = eraFoundry ? Math.min(1, Math.max(.5, Number(this.salvo?.borda) || 1)) : 1; this.#recalcularEscala(); this.tex = null; }
    else {
      const anterior = e.moldura;
      e.moldura = naurenMolduraConfigPadrao(id);
      if (anterior) { e.moldura.efeitos = foundry.utils.deepClone(anterior.efeitos); e.moldura.girar = { ...anterior.girar }; e.moldura.reacoes = { ...anterior.reacoes }; if (anterior.paleta === "livre") { e.moldura.paleta = "livre"; e.moldura.cores = [...anterior.cores]; } }
      if (id === "imagem") e.moldura.imagem = { src: anterior?.imagem?.src ?? "", tolerancia: 30, rotacao: 0, recolorir: false, cor: "#e6bf5c", forca: .8, tamanho: 1 };
      e.recorte = "redondo"; this.tex = null; this.#remontarTexturas(true);
    }
    // a galeria continua aberta (o jogador vai experimentando uma por uma); a aba atual fica, se existir no modelo novo
    if (id === "imagem" && !e.moldura.imagem.src) this.aba = "moldura";
    this.render();
  }
  #montarPaleta() {
    const raiz = this.element, e = this.estado, paleta = raiz?.querySelector(".nm-paleta"); if (!paleta) return;
    paleta.innerHTML = "";
    e.cores.forEach((c, i) => {
      const item = document.createElement("div"); item.className = "nm-amostra";
      const inp = document.createElement("input"); inp.type = "color"; inp.value = c; inp.title = `Cor ${i + 1}`;
      inp.addEventListener("input", () => { e.cores[i] = inp.value; e.corBorda = e.cores[0]; this.desenhar(); });
      item.append(inp);
      if (e.cores.length > 1) { const x = document.createElement("button"); x.type = "button"; x.className = "nm-ic"; x.title = "Tirar esta cor"; x.innerHTML = '<i class="fas fa-xmark"></i>'; x.addEventListener("click", () => { e.cores.splice(i, 1); e.corBorda = e.cores[0]; this.#montarPaleta(); this.desenhar(); }); item.append(x); }
      paleta.append(item);
    });
    if (e.cores.length < 5) { const mais = document.createElement("button"); mais.type = "button"; mais.className = "nm-ic"; mais.title = "Adicionar uma cor (vira gradiente)"; mais.innerHTML = '<i class="fas fa-plus"></i>'; mais.addEventListener("click", () => { e.cores.push(e.cores.length === 1 ? e.corFundo : e.cores[e.cores.length - 1]); this.#montarPaleta(); this.desenhar(); }); paleta.append(mais); }
    const n = e.cores.length;
    this.#ver("dicaCores", n === 1 ? "Uma cor. Adicione mais para a borda virar gradiente." : n === 2 ? "Gradiente girando entre as 2 cores (o fundo usa a 2ª cor)." : `Gradiente passando pelas ${n} cores.`);
    const fundo = raiz.querySelector('input[name="corFundo"]'); if (fundo) { fundo.disabled = n > 1; fundo.closest("label")?.classList.toggle("desligado", n > 1); }
  }
  #mostrarPedra() {
    const raiz = this.element, p = this.estado.pedra; if (!raiz || !p) return;
    const texto = (k, v) => k === "matiz" ? `${v > 0 ? "+" : ""}${v}°` : `${Math.round(v * 100)}%`;
    raiz.querySelectorAll("[data-pedra]").forEach(el => { const k = el.dataset.pedra; if (el.type === "checkbox") el.checked = p.colorir; else { el.value = p[k]; if (el.type === "range") this.#ver(`pedra-${k}`, texto(k, p[k])); } });
    raiz.querySelectorAll('[data-pedra="cor"], [data-pedra="forca"]').forEach(el => (el.closest("label") ?? el).classList.toggle("desligado", !p.colorir));
  }
  #desfazer() { const e = this.estado; if (!e.mascara.length) return; this.refazerPilha.push(e.mascara[e.mascara.length - 1]); e.mascara = e.mascara.slice(0, -1); this.desenhar(); }
  #refazer() { if (!this.refazerPilha.length) return; this.estado.mascara = [...this.estado.mascara, this.refazerPilha.pop()]; this.desenhar(); }
  #testar(tipo) {
    const e = this.estado;
    if (tipo === "dano" || tipo === "cura") {
      const cor = tipo === "dano" ? e.corDano : e.corCura;
      this.piscando = { cor, ini: performance.now() };
      const tokens = this.tokenDoc?.object ? [this.tokenDoc.object] : (this.actor.getActiveTokens?.(true, false) ?? []);
      for (const t of tokens) {
        if (naurenMolduraCamadaDe(t)) { naurenMolduraPiscar(t, cor); continue; }
        if (!t.document?.ring?.enabled) continue;
        const Cor = foundry.utils?.Color ?? globalThis.Color;
        try { t.ring?.flashColor?.(Cor.from(cor), { duration: 1000, easing: t.ring.constructor?.easeTwoPeaks }); } catch (err) { /* sem borda */ }
      }
    } else { this.sitTeste[tipo] = !this.sitTeste[tipo]; this.element?.querySelector(`[data-action="testar"][data-v="${tipo}"]`)?.classList.toggle("on", this.sitTeste[tipo]); }
    this.desenhar();
  }
  /* ---------------- prévia ---------------- */
  desenhar() {
    const cnv = this.cnv; if (!cnv?.isConnected) return;
    const P = this.P, e = this.estado, agora = performance.now();
    let piscar = null;
    if (this.piscando) { const fr = (agora - this.piscando.ini) / 1000; if (fr >= 1) this.piscando = null; else piscar = { cor: this.piscando.cor, e: (Math.sin(4 * Math.PI * fr - Math.PI / 2) + 1) / 2 }; }
    const fantasma = this.imgOk && this.guia.ligada && this.aba === "pincel" && (this.nauren || e.recorte === "redondo") ? this.guia.opacidade : 0;
    const q = this.quadro;
    if (this.nauren) {
      naurenMolduraDesenharPrevia(q, this.imgOk ? this.img : null, { ...e, moldura: naurenMolduraNormalizar(e.moldura) }, this.tex, { t: agora / 1000, extra: { flash: this.piscando ? { ini: this.piscando.ini / 1000, cor: this.piscando.cor, dur: 1 } : null, vidaBaixa: this.sitTeste.vidaBaixa, turno: this.sitTeste.turno, corTurno: e.moldura.reacoes.disposicao ? (this.tokenDoc?.disposition === -1 ? "#ff4040" : this.tokenDoc?.disposition === 0 ? "#ffd84a" : "#5ad46a") : undefined }, guias: true, fantasma, desenharImagem: naurenBordaDesenharImagem, pintarTraco: naurenBordaPintarTraco });
    } else {
      naurenBordaDesenharPrevia(q, this.imgOk ? this.img : null, e, { folha: this.folha, tamGrade: this.tamGrade, tempo: agora / 1000, piscar, fantasma });
    }
    // cursor do pincel (no quadro)
    if (this.cursor && this.modo !== "mover") {
      const ctx = q.getContext("2d"), r = this.raioPincel * P / e.arte;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.lineWidth = 1.5; ctx.strokeStyle = this.modo === "esconder" ? "rgba(255,120,110,.95)" : "rgba(255,255,255,.95)"; if (this.ponta === "suave") ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.arc(this.cursor.x, this.cursor.y, r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    // vista (lupa)
    const ctx = cnv.getContext("2d"); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, P, P);
    const z = this.lupa, tx = P / 2 - (P / 2 + this.vista.x) * z, ty = P / 2 - (P / 2 + this.vista.y) * z;
    ctx.setTransform(z, 0, 0, z, tx, ty); ctx.drawImage(q, 0, 0); ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  #ligarPalco(cnv) {
    const P = () => this.P, e = this.estado;
    const ponto = ev => { const r = cnv.getBoundingClientRect(), k = P() / (r.width || P()), z = this.lupa; const sx = (ev.clientX - r.left) * k, sy = (ev.clientY - r.top) * k; return { x: (sx - P() / 2) / z + P() / 2 + this.vista.x, y: (sy - P() / 2) / z + P() / 2 + this.vista.y }; };
    const emCasas = pt => { const casa = P() / e.arte; return [Math.round((pt.x - P() / 2) / casa * 1000) / 1000, Math.round((pt.y - P() / 2) / casa * 1000) / 1000]; };
    let arr = null, traco = null, vistaArr = null;
    cnv.addEventListener("contextmenu", ev => ev.preventDefault());
    cnv.addEventListener("pointerdown", ev => {
      try { cnv.setPointerCapture(ev.pointerId); } catch (err) { /* sem captura */ }
      if (ev.button === 2 || (ev.button === 1)) { vistaArr = { x: ev.clientX, y: ev.clientY, vx: this.vista.x, vy: this.vista.y }; return; }
      if (this.modo === "mover" || !this.imgOk || (!this.nauren && e.recorte !== "redondo")) { arr = { x: ev.clientX, y: ev.clientY, ex: e.x, ey: e.y }; cnv.classList.add("arrastando"); return; }
      traco = { m: this.modo, d: this.ponta, r: this.raioPincel, s: this.suavidade, p: emCasas(ponto(ev)) };
      this.refazerPilha.length = 0; e.mascara = [...e.mascara, traco]; this.desenhar();
    });
    cnv.addEventListener("pointermove", ev => {
      this.cursor = ponto(ev);
      if (vistaArr) { const r = cnv.getBoundingClientRect(), k = P() / (r.width || P()); this.vista.x = vistaArr.vx - (ev.clientX - vistaArr.x) * k / this.lupa; this.vista.y = vistaArr.vy - (ev.clientY - vistaArr.y) * k / this.lupa; this.desenhar(); return; }
      if (traco) { const [x, y] = emCasas(this.cursor), n = traco.p.length; if (Math.hypot(x - traco.p[n - 2], y - traco.p[n - 1]) >= traco.r * .2) traco.p.push(x, y); this.desenhar(); return; }
      if (!arr || !this.imgOk) { if (this.modo !== "mover") this.desenhar(); return; }
      const B = naurenBordaCaixaImagem(P(), e), iw = this.img.naturalWidth, ih = this.img.naturalHeight, s = Math.max(B / iw, B / ih) * e.zoom, sobraX = B - iw * s, sobraY = B - ih * s;
      const r = cnv.getBoundingClientRect(), k = P() / (r.width || P()) / this.lupa;
      if (Math.abs(sobraX) > .5) e.x = Math.max(0, Math.min(100, arr.ex + (ev.clientX - arr.x) * k * 100 / sobraX));
      if (Math.abs(sobraY) > .5) e.y = Math.max(0, Math.min(100, arr.ey + (ev.clientY - arr.y) * k * 100 / sobraY));
      this.desenhar();
    });
    const soltar = () => { arr = null; traco = null; vistaArr = null; cnv.classList.remove("arrastando"); };
    cnv.addEventListener("pointerup", soltar); cnv.addEventListener("pointercancel", soltar);
    cnv.addEventListener("pointerleave", () => { this.cursor = null; if (this.modo !== "mover") this.desenhar(); });
    cnv.addEventListener("wheel", ev => {
      ev.preventDefault();
      if (ev.ctrlKey || ev.metaKey) { this.#lupa(this.lupa - Math.sign(ev.deltaY) * .5); return; }
      if (this.modo !== "mover") { this.raioPincel = Math.min(.25, Math.max(.01, this.raioPincel - Math.sign(ev.deltaY) * .005)); const sl = this.element.querySelector('[data-pincel="pincel"]'); if (sl) sl.value = this.raioPincel; this.#ver("pincel", `${Math.round(this.raioPincel * 100)}`); this.desenhar(); return; }
      e.zoom = Math.min(4, Math.max(.5, e.zoom - Math.sign(ev.deltaY) * .05)); this.#sinc("zoom", e.zoom); this.desenhar();
    }, { passive: false });
  }
  /* ---------------- salvar / fechar ---------------- */
  async #salvar() {
    if (!this.imgOk) return;
    const e = this.estado, nauren = this.nauren;
    if (nauren && e.modelo === "imagem" && !this.tex?.imagem) { ui.notifications?.warn("Escolha a imagem da moldura (aba Moldura) antes de salvar."); return; }
    const final = {
      ativa: true, modelo: e.modelo, src: e.src, x: Math.round(e.x * 10) / 10, y: Math.round(e.y * 10) / 10, zoom: Math.round(e.zoom * 100) / 100, recorte: nauren ? "redondo" : e.recorte,
      corBorda: e.cores[0], cores: [...e.cores], corFundo: e.corFundo, corDano: e.corDano, corCura: e.corCura, efeitos: [...e.efeitos], escala: 1,
      arte: Math.round(e.arte * 1000) / 1000, borda: Math.round(e.borda * 1000) / 1000,
      mascara: nauren || e.recorte === "redondo" ? e.mascara.map(t => ({ ...t, p: [...t.p] })) : [],
      pedra: naurenBordaPedraNeutra(e.pedra) ? null : { ...e.pedra },
      moldura: nauren ? { ...naurenMolduraNormalizar(e.moldura), vb: e.moldura.vb, ext: e.moldura.ext, raio: e.moldura.raio } : null
    };
    this.resultado = final;
    await naurenBordaAplicar(this.actor, final, { tokenDoc: this.tokenDoc, nosTokens: this.nosTokens });
    this.acao = "salvo"; this.close();
  }
  async close(options) { const r = await super.close(options); await this.#finalizar(); return r; }
  _onClose(options) { super._onClose?.(options); this.#finalizar(); }
  async #finalizar() {
    if (this.fechou) return; this.fechou = true;
    cancelAnimationFrame(this.laco); this.laco = null; this.obs?.disconnect();
    if (this.teclas) { document.removeEventListener("keydown", this.teclas, true); this.teclas = null; }
    let res = null;
    if (this.acao === "remover") {
      const cfgOff = { ...naurenBordaConfig({ flags: { nauren: { borda: this.salvo ?? {} } } }), ativa: false };
      await naurenBordaAplicar(this.actor, cfgOff, { tokenDoc: this.tokenDoc, nosTokens: true });
      ui.notifications?.info(`Borda do token removida de ${this.actor.name}.`);
      res = cfgOff;
    } else if (this.acao === "salvo") res = this.resultado;
    this.resolver?.(res);
  }
}
/** Abre o editor e devolve a configuração salva (ou null se cancelou). */
export function naurenAbrirMolduraEditor(actor, { tokenDoc = null, srcInicial = "" } = {}) {
  if (!actor) return Promise.resolve(null);
  return new Promise(resolver => { const ed = new NaurenMolduraEditor({ actor, tokenDoc, srcInicial, resolver }); ed.render(true); });
}
export { naurenMolduraEhNauren };
