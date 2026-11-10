/**
 * Nauren RPG — Configurações do Nauren (painel único).
 *
 * Todas as configurações do sistema que apareciam soltas na lista do Foundry passam a morar aqui,
 * separadas por assunto. O painel recolhe sozinho (no "setup") toda configuração "nauren" com
 * config: true e a esconde da lista do Foundry, então uma configuração nova entra aqui sem mexer neste arquivo
 * (cai em "Outras" até ganhar um assunto em SECOES).
 * As do mundo só o Mestre muda; as "só nesta tela" cada um muda para si.
 */
import { NAUREN_DISPOSICOES, naurenMoldurasAutomaticas, naurenProntasLista } from "./molduras-prontas.mjs";

const SIS = "nauren";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));

/** Assuntos do painel, na ordem. Chaves que não estiverem aqui vão para "Outras". */
export const NAUREN_CONFIG_SECOES = [
  { id: "interface", rotulo: "Interface", icone: "fa-display", chaves: ["escalaInterfacePadrao", "escalaInterface", "chatNauren", "hudCombate", "hudCombateEscondeMacros", "animacoesHud", "descricaoChatAbertaV2", "selosAnimados"] },
  { id: "chat", rotulo: "Chat e cards", icone: "fa-comment-dots", chaves: ["descricaoNoChat", "cardsDeGatilho", "ocultarDescricaoNpc", "mostrarVidaNosCards"] },
  { id: "combate", rotulo: "Combate", icone: "fa-bolt", chaves: ["tempoReacaoSegundos", "destinoPerguntar", "derrotadoAutomatico", "prioridadeAoAproximar", "limitePrioridadePorAliado", "prioridadeOpcionalNoCard", "modoMovimentoPadrao", "areasInstantaneasSomem", "limparAlvosFimTurno"] },
  { id: "tokens", rotulo: "Tokens e Vida", icone: "fa-heart-pulse", chaves: ["estadoVidaHover", "estadoVidaFixoNpc", "estadosVidaTermos", "estadosVidaFaixas", "jogadoresVeemCondicoes", "jogadoresEditamBarras", "bordaEncaixeBarras"] },
  { id: "carrossel", rotulo: "Carrossel do combate", icone: "fa-people-line", chaves: ["carrossel", "carrosselModo", "carrosselTamanho", "carrosselImagem", "carrosselNomes", "carrosselFundo", "carrosselOpacidade", "carrosselEscondeCenas", "carrosselBarras"] },
  { id: "arte", rotulo: "Arte ao passar o mouse", icone: "fa-image-portrait", chaves: ["arteHoverLigado", "arteHoverPnj", "arteHoverPosicao", "arteHoverPosicaoJogador", "arteHoverTamanho", "arteHoverAtraso", "arteHoverSegundos"] },
  { id: "itens", rotulo: "Equipamento e itens", icone: "fa-shield-halved", chaves: ["limiteEquipamentoOfensivo", "pesosEquipamentoOfensivo", "limiteVagasDefesa", "removerConsumivelZerado", "luzDosItens", "scriptsItens"], menus: ["tiersItensMenu"] },
  { id: "criacao", rotulo: "Criação de personagem", icone: "fa-user-plus", chaves: ["criadorAtributosTravados", "criadorTodoEquipamento"] },
  { id: "animacoes", rotulo: "Animações e sons", icone: "fa-wand-sparkles", chaves: ["animacoesAcoes", "animacoesReserva", "animacoesCriticos", "motionAtivo", "motionMinhaTela", "motionIntensidade", "motionImpacto", "motionCorCura", "somSincronizado"] },
  { id: "molduras", rotulo: "Molduras dos tokens", icone: "fa-circle-dot", chaves: ["moldurasAnimadas", "moldurasQualidade"], extra: "molduras" }
];

/** Configurações recolhidas (chave → objeto de registro do Foundry). */
const recolhidas = new Map();
/** Menus recolhidos (chave → registro do menu). */
const menus = new Map();

export function naurenConfiguracoesInit() {
  game.settings.registerMenu(SIS, "painelConfiguracoes", {
    name: "Configurações do Nauren", label: "Abrir as configurações", icon: "fas fa-sliders",
    hint: "Todas as opções do sistema num lugar só, separadas por assunto.",
    type: NaurenConfiguracoes, restricted: false
  });
  // depois que todos registraram as suas (init), recolhe e tira da lista do Foundry
  Hooks.once("setup", naurenConfiguracoesRecolher);
}
export function naurenConfiguracoesRecolher() {
  for (const [id, s] of game.settings.settings) {
    if (s.namespace !== SIS || !s.config) continue;
    recolhidas.set(s.key, s); s.config = false;
  }
  for (const [id, m] of [...game.settings.menus]) {
    // no V14 o key do menu vem com o sistema na frente ("nauren.tiersItensMenu")
    const curto = String(m.key ?? id).replace(/^nauren\./, "");
    if (m.namespace !== SIS || curto === "painelConfiguracoes") continue;
    menus.set(curto, m); game.settings.menus.delete(id);
  }
}

/** Seções com as configurações que existem de fato (e "Outras" para as sem assunto). */
function secoes() {
  const usadas = new Set(), lista = [];
  for (const s of NAUREN_CONFIG_SECOES) {
    const itens = s.chaves.filter(k => recolhidas.has(k)); itens.forEach(k => usadas.add(k));
    lista.push({ ...s, itens, menus: (s.menus ?? []).filter(k => menus.has(k)) });
  }
  const outras = [...recolhidas.keys()].filter(k => !usadas.has(k));
  if (outras.length) lista.push({ id: "outras", rotulo: "Outras", icone: "fa-ellipsis", itens: outras, menus: [] });
  return lista.filter(s => s.itens.length || s.menus.length || s.extra);
}

export class NaurenConfiguracoes extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "nauren-configuracoes",
    classes: ["nauren-kit", "nauren-armazem", "nauren-config"],
    position: { width: 820, height: 640 },
    window: { title: "Configurações do Nauren", icon: "fas fa-sliders", resizable: true },
    actions: {
      secao: function (ev, el) { this.secao = el.dataset.v; this.render(); },
      menu: function (ev, el) { const m = menus.get(el.dataset.v); if (m?.type) new m.type().render(true); },
      padrao: function (ev, el) { const s = recolhidas.get(el.dataset.v); if (!s) return; this.mudancas.set(s.key, foundry.utils.deepClone(s.default)); this.render(); },
      cancelar: function () { this.close(); },
      salvar: function () { this.#salvar(); }
    }
  };
  constructor(opcoes = {}) { super(opcoes); this.secao = NAUREN_CONFIG_SECOES[0].id; this.mudancas = new Map(); this.busca = ""; }
  get gm() { return !!game.user?.isGM; }
  podeMudar(s) { return s.scope === "client" || s.scope === "user" || this.gm; }
  valor(s) { return this.mudancas.has(s.key) ? this.mudancas.get(s.key) : game.settings.get(SIS, s.key); }

  #controle(s) {
    const v = this.valor(s), dis = this.podeMudar(s) ? "" : "disabled", k = esc(s.key);
    const tipo = s.type === Boolean || s.type?.name === "Boolean" ? "bool" : s.type === Number || s.type?.name === "Number" ? "num" : "txt";
    if (s.choices) {
      const ops = typeof s.choices === "function" ? s.choices() : s.choices;
      return `<select class="nt-in nt-ch nc-sel" data-cfg="${k}" ${dis}>${Object.entries(ops).map(([val, rot]) => `<option value="${esc(val)}" ${String(v) === String(val) ? "selected" : ""}>${esc(game.i18n?.localize?.(rot) ?? rot)}</option>`).join("")}</select>`;
    }
    if (tipo === "bool") return `<input type="checkbox" class="nm-chave" data-cfg="${k}" ${v ? "checked" : ""} ${dis} aria-label="${esc(s.name)}">`;
    if (tipo === "num" && s.range) return `<span class="nc-faixa"><input type="range" data-cfg="${k}" min="${s.range.min}" max="${s.range.max}" step="${s.range.step ?? 1}" value="${esc(v)}" ${dis}><output>${esc(v)}</output></span>`;
    if (tipo === "num") return `<input type="number" class="nt-in nt-ch nc-num" data-cfg="${k}" value="${esc(v)}" ${dis}>`;
    if (/^#[0-9a-f]{6}$/i.test(String(s.default ?? ""))) return `<input type="color" data-cfg="${k}" value="${esc(v)}" ${dis}>`;
    return `<input type="text" class="nt-in nt-ch nc-txt" data-cfg="${k}" value="${esc(v)}" ${dis}>`;
  }
  #linha(s) {
    const mudou = this.mudancas.has(s.key);
    const local = s.scope === "client" || s.scope === "user";
    const selo = local ? `<span class="nc-selo nc-selo-tela" title="Cada pessoa escolhe para si">Só nesta tela</span>` : `<span class="nc-selo" title="Vale para todos; só o Mestre muda">Mundo</span>`;
    const reinicia = s.requiresReload ? `<span class="nc-selo nc-selo-recarrega" title="Recarrega a página ao salvar">Recarrega</span>` : "";
    const voltar = this.podeMudar(s) && s.default !== undefined && JSON.stringify(this.valor(s)) !== JSON.stringify(s.default) ? `<button type="button" class="nm-ic nc-padrao" data-action="padrao" data-v="${esc(s.key)}" title="Voltar ao padrão"><i class="fas fa-rotate-left"></i></button>` : "";
    return `<div class="nc-linha nt-ch ${mudou ? "mudou" : ""}" data-chave="${esc(s.key)}" data-busca="${esc(`${s.name} ${s.hint ?? ""}`.toLowerCase())}">
      <div class="nc-texto"><div class="nc-nome"><b>${esc(game.i18n?.localize?.(s.name) ?? s.name)}</b>${selo}${reinicia}</div>${s.hint ? `<small>${esc(game.i18n?.localize?.(s.hint) ?? s.hint)}</small>` : ""}</div>
      <div class="nc-ctrl">${voltar}${this.#controle(s)}</div></div>`;
  }
  #molduras() {
    const a = this.mudancas.get("__molduras") ?? naurenMoldurasAutomaticas(), prontas = naurenProntasLista(), dis = this.gm ? "" : "disabled";
    const sel = k => `<select class="nt-in nt-ch nc-sel" data-auto="${k}" ${dis}><option value="">Nenhuma</option>${prontas.map(p => `<option value="${esc(p.id)}" ${a[k] === p.id ? "selected" : ""}>${esc(p.nome)}</option>`).join("")}</select>`;
    return `<div class="nc-grupo-t">Moldura automática</div>
      <div class="nc-linha nt-ch"><div class="nc-texto"><div class="nc-nome"><b>Moldura ao colocar no mapa</b><span class="nc-selo">Mundo</span></div><small>Token novo no mapa já entra com a moldura pronta escolhida para o lado dele. As prontas são criadas na janela da borda (Galeria → Prontas do Mestre).${prontas.length ? "" : " Ainda não há nenhuma."}</small></div></div>
      ${NAUREN_DISPOSICOES.map(([k, rot]) => `<div class="nc-linha nc-sub nt-ch"><div class="nc-texto"><div class="nc-nome"><b>${rot}</b></div></div><div class="nc-ctrl">${sel(k)}</div></div>`).join("")}
      <div class="nc-linha nc-sub nt-ch"><div class="nc-texto"><div class="nc-nome"><b>Só em tokens não vinculados</b></div><small>Personagens dos jogadores (vinculados) ficam com a borda que já têm.</small></div><div class="nc-ctrl"><input type="checkbox" class="nm-chave" data-auto="soNaoVinculados" ${a.soNaoVinculados !== false ? "checked" : ""} ${dis}></div></div>`;
  }
  async _renderHTML() {
    const lista = secoes();
    if (!lista.some(s => s.id === this.secao)) this.secao = lista[0]?.id;
    const atual = lista.find(s => s.id === this.secao) ?? lista[0];
    const nav = lista.map(s => `<button type="button" class="nc-nav-b nt-ch ${s.id === atual?.id ? "on" : ""}" data-action="secao" data-v="${s.id}"><i class="fas ${s.icone}"></i><span>${esc(s.rotulo)}</span>${s.itens.some(k => this.mudancas.has(k)) ? `<i class="fas fa-circle nc-ponto"></i>` : ""}</button>`).join("");
    const corpo = atual ? atual.itens.map(k => this.#linha(recolhidas.get(k))).join("")
      + (atual.menus.length ? `<div class="nc-grupo-t">Editores</div>` + atual.menus.map(k => { const m = menus.get(k); return `<div class="nc-linha nt-ch"><div class="nc-texto"><div class="nc-nome"><b>${esc(m.name)}</b>${m.restricted ? `<span class="nc-selo">Mestre</span>` : ""}</div>${m.hint ? `<small>${esc(m.hint)}</small>` : ""}</div><div class="nc-ctrl"><button type="button" class="na-btn" data-action="menu" data-v="${esc(k)}" ${m.restricted && !this.gm ? "disabled" : ""}><i class="${esc(m.icon ?? "fas fa-pen")}"></i> ${esc(m.label ?? "Abrir")}</button></div></div>`; }).join("") : "")
      + (atual.extra === "molduras" ? this.#molduras() : "") : "";
    const n = this.mudancas.size;
    return `<div class="na-janela nc-janela">
      <div class="nc-corpo">
        <nav class="nc-nav">${nav}</nav>
        <div class="nc-dir">
          <div class="nc-topo"><h2>${esc(atual?.rotulo ?? "")}</h2><label class="nc-busca nt-in nt-ch"><i class="fas fa-magnifying-glass"></i><input type="text" placeholder="Procurar em todas" value="${esc(this.busca)}" data-busca></label></div>
          <div class="nc-lista">${corpo}</div>
          <div class="nc-resultados" hidden></div>
        </div>
      </div>
      <div class="nt-rod">
        <span class="nc-aviso">${this.gm ? "" : `<i class="fas fa-circle-info"></i> As opções do mundo só o Mestre muda.`}</span>
        <span class="nt-esp"></span>
        <button type="button" class="na-btn" data-action="cancelar">Cancelar</button>
        <button type="button" class="na-btn na-principal" data-action="salvar" ${n ? "" : "disabled"}><i class="fas fa-check"></i> Salvar${n ? ` (${n})` : ""}</button>
      </div></div>`;
  }
  _replaceHTML(html, content) { const l = content.querySelector?.(".nc-lista"); const top = l?.scrollTop ?? 0; content.innerHTML = html; const l2 = content.querySelector(".nc-lista"); if (l2 && this.secaoAntes === this.secao) l2.scrollTop = top; this.secaoAntes = this.secao; }
  _onRender() {
    const raiz = this.element;
    const marcar = (k, v) => { const s = recolhidas.get(k); if (!s) return; if (JSON.stringify(v) === JSON.stringify(game.settings.get(SIS, k))) this.mudancas.delete(k); else this.mudancas.set(k, v); this.#atualizarRodape(); raiz.querySelector(`.nc-linha[data-chave="${CSS.escape(k)}"]`)?.classList.toggle("mudou", this.mudancas.has(k)); };
    raiz.querySelectorAll("[data-cfg]").forEach(el => {
      const s = recolhidas.get(el.dataset.cfg); if (!s) return;
      const ler = () => el.type === "checkbox" ? el.checked : (s.type === Number || s.type?.name === "Number") ? Number(el.value) : el.value;
      el.addEventListener(el.type === "range" ? "input" : "change", () => { if (el.type === "range") el.nextElementSibling.value = el.value; marcar(s.key, ler()); });
      if (el.type === "range") el.addEventListener("change", () => marcar(s.key, ler()));
    });
    raiz.querySelectorAll("[data-auto]").forEach(el => el.addEventListener("change", () => {
      const a = { ...(this.mudancas.get("__molduras") ?? naurenMoldurasAutomaticas()) };
      a[el.dataset.auto] = el.type === "checkbox" ? el.checked : el.value;
      this.mudancas.set("__molduras", a); this.#atualizarRodape();
    }));
    // busca em todas as seções
    const busca = raiz.querySelector("[data-busca]"), lista = raiz.querySelector(".nc-lista"), res = raiz.querySelector(".nc-resultados");
    const filtrar = () => {
      const q = busca.value.trim().toLowerCase(); this.busca = busca.value;
      if (!q) { lista.hidden = false; res.hidden = true; res.innerHTML = ""; return; }
      const achadas = [...recolhidas.values()].filter(s => `${s.name} ${s.hint ?? ""} ${s.key}`.toLowerCase().includes(q));
      res.innerHTML = achadas.length ? achadas.map(s => this.#linha(s)).join("") : `<p class="nm-vazio">Nada encontrado.</p>`;
      lista.hidden = true; res.hidden = false;
      res.querySelectorAll("[data-cfg]").forEach(el => { const s = recolhidas.get(el.dataset.cfg); const ler = () => el.type === "checkbox" ? el.checked : (s.type === Number || s.type?.name === "Number") ? Number(el.value) : el.value; el.addEventListener("change", () => marcar(s.key, ler())); });
    };
    busca?.addEventListener("input", filtrar);
    if (this.busca) filtrar();
  }
  #atualizarRodape() {
    const b = this.element?.querySelector('[data-action="salvar"]'); if (!b) return;
    const n = this.mudancas.size; b.disabled = !n; b.innerHTML = `<i class="fas fa-check"></i> Salvar${n ? ` (${n})` : ""}`;
  }
  async #salvar() {
    let recarregar = false;
    for (const [k, v] of this.mudancas) {
      if (k === "__molduras") { if (this.gm) await game.settings.set(SIS, "moldurasAutomaticas", v); continue; }
      const s = recolhidas.get(k); if (!s || !this.podeMudar(s)) continue;
      await game.settings.set(SIS, k, v);
      if (s.requiresReload) recarregar = true;
    }
    this.mudancas.clear();
    ui.notifications?.info("Configurações do Nauren salvas.");
    await this.close();
    if (recarregar) foundry.utils.debouncedReload?.() ?? window.location.reload();
  }
}
