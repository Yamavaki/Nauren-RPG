/* Nauren RPG — Recursos do HUD de Combate. Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { naurenHudEscapar, naurenHudLerRecurso, naurenHudRecursosDoAtor, naurenTrocarHtmlMantendoRolagem } from "./barras-token.mjs";
import { NaurenHudCombate } from "./hud-combate.mjs";
import { naurenAplicarEscalaEAjuste } from "./borda-token.mjs";


/* =======================================================================
 * RECURSOS DO HUD DE COMBATE (0.89.4): quais barras aparecem no painel
 * esquerdo do HUD, e em que ordem. Gravado no ator (flags.nauren.hudRecursos).
 * Padrão: Vida, Mana e Estamina de Combate (como sempre foi); o resto
 * (Escudo, Destino, Estresse e os recursos da classe/subclasse) vem pronto,
 * desligado.
 * ======================================================================= */
function naurenHudCombateRecursos(actor) {
  const disponiveis = naurenHudRecursosDoAtor(actor);
  const porId = new Map(disponiveis.map(r => [r.id, r]));
  const gravada = actor?.getFlag("nauren", "hudRecursos")?.lista ?? null;
  const padraoVisivel = new Set(["vida", "mana", "estaminaCombate"]);
  const ordemPadrao = ["vida", "mana", "estaminaCombate"];
  const lista = [];
  if (gravada) {
    for (const g of gravada) if (porId.has(g.recurso) && !lista.some(x => x.recurso === g.recurso)) lista.push({ recurso: g.recurso, visivel: !!g.visivel });
  } else {
    for (const id of ordemPadrao) if (porId.has(id)) lista.push({ recurso: id, visivel: true });
  }
  // Recurso da Classe (ex.: Energia do Místico) aparece por padrão: é o recurso principal dela.
  for (const r of disponiveis) if (!lista.some(x => x.recurso === r.id)) lista.push({ recurso: r.id, visivel: !gravada && (padraoVisivel.has(r.id) || !!r.deClasse) });
  // 0.94.31: quem não usa Mana (Inventor: o Espírito vira Pontos de Invenção) não vê a barra "Mana 0 / 0".
  const semMana = !!actor?.system?.semMana;
  return lista.filter(x => !(semMana && x.recurso === "mana")).map(x => ({ ...x, nome: porId.get(x.recurso)?.nome ?? x.recurso, deClasse: !!porId.get(x.recurso)?.deClasse, cor1: porId.get(x.recurso)?.cor1, cor2: porId.get(x.recurso)?.cor2 }));
}


class NaurenHudRecursosEditor extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "nauren-hud-recursos-editor",
    classes: ["nauren-rpg", "nauren-barras-editor", "nauren-hudrec-editor"],
    window: { title: "Recursos do HUD de Combate", resizable: false, icon: "fas fa-sliders" },
    position: { width: 420, height: "auto" },
    actions: {
      olho: NaurenHudRecursosEditor.onOlho,
      mover: NaurenHudRecursosEditor.onMover,
      restaurar: NaurenHudRecursosEditor.onRestaurar
    }
  };
  #actor;
  constructor(opcoes = {}) { super(opcoes); this.#actor = opcoes.actor; }
  static abrir(actor) {
    for (const app of foundry.applications.instances.values()) if (app instanceof NaurenHudRecursosEditor && app.#actor === actor) { app.bringToFront(); return app; }
    const app = new NaurenHudRecursosEditor({ actor });
    app.render({ force: true });
    return app;
  }
  get title() { return `Recursos do HUD · ${this.#actor?.name ?? ""}`; }
  async #gravar(lista) {
    await this.#actor.setFlag("nauren", "hudRecursos", { lista: lista.map(x => ({ recurso: x.recurso, visivel: !!x.visivel })) });
    NaurenHudCombate.atualizar();
    this.render();
  }
  async _renderHTML() {
    const e = s => naurenHudEscapar(String(s ?? ""));
    const lista = naurenHudCombateRecursos(this.#actor);
    const itens = lista.map((x, i) => {
      const v = naurenHudLerRecurso(this.#actor, x.recurso);
      return `<li class="nauren-be-item ${x.visivel ? "" : "escondida"}">
        <button type="button" class="nauren-be-olho" data-action="olho" data-id="${e(x.recurso)}" title="${x.visivel ? "Tirar do HUD" : "Mostrar no HUD"}"><i class="fas ${x.visivel ? "fa-eye" : "fa-eye-slash"}"></i></button>
        <span class="nauren-be-cor" style="background: linear-gradient(90deg, ${e(x.cor1)}, ${e(x.cor2)})"></span>
        <span class="nauren-be-nome">${e(x.nome)}</span>
        <span class="nauren-be-sub">${x.deClasse ? "da classe · " : ""}${v.value}/${v.max}</span>
        <span class="nauren-be-mover"><button type="button" data-action="mover" data-id="${e(x.recurso)}" data-dir="-1" title="Subir" ${i === 0 ? "disabled" : ""}><i class="fas fa-chevron-up"></i></button><button type="button" data-action="mover" data-id="${e(x.recurso)}" data-dir="1" title="Descer" ${i === lista.length - 1 ? "disabled" : ""}><i class="fas fa-chevron-down"></i></button></span>
      </li>`;
    }).join("");
    return `<div class="nauren-hudrec-raiz">
      <p class="nauren-be-nota">O olho liga ou desliga cada recurso no painel esquerdo do HUD de Combate. Os dois primeiros ficam ao lado do retrato; o terceiro logo abaixo; com o HUD expandido, aparecem todos. As cores são as das Barras do Token.</p>
      <ul class="nauren-hudrec-lista">${itens}</ul>
      <div class="nauren-be-rodape"><button type="button" data-action="restaurar"><i class="fas fa-rotate-left"></i> Restaurar padrão</button></div>
    </div>`;
  }
  _replaceHTML(result, content) { naurenTrocarHtmlMantendoRolagem(content, result); }
  _onRender() { try { naurenAplicarEscalaEAjuste?.(this, { ajustarTamanho: false }); } catch (err) { /* sem escala */ } }
  static async onOlho(ev, target) {
    const lista = naurenHudCombateRecursos(this.#actor);
    const x = lista.find(r => r.recurso === target.dataset.id); if (!x) return;
    x.visivel = !x.visivel;
    await this.#gravar(lista);
  }
  static async onMover(ev, target) {
    const lista = naurenHudCombateRecursos(this.#actor);
    const i = lista.findIndex(r => r.recurso === target.dataset.id), j = i + Number(target.dataset.dir);
    if (i < 0 || j < 0 || j >= lista.length) return;
    [lista[i], lista[j]] = [lista[j], lista[i]];
    await this.#gravar(lista);
  }
  static async onRestaurar() {
    await this.#actor.unsetFlag("nauren", "hudRecursos");
    NaurenHudCombate.atualizar();
    this.render();
  }
}

export { NaurenHudRecursosEditor, naurenHudCombateRecursos };
