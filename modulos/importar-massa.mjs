/**
 * Nauren RPG — Importar em massa (0.107.0).
 *
 * Um arquivo JSON com várias fichas (NPCs, personagens, baús, itens de qualquer tipo, Escritos) vira vários
 * documentos de uma vez, na pasta escolhida (ou numa pasta nova). Pensado para fichas feitas por IA com o
 * guia-criacao-ia.md: cada ator pode trazer a borda do token pronta ("borda": { modelo, paleta, cores, efeitos… }
 * ou o nome de uma Pronta do Mestre), e o sistema monta a moldura no token padrão.
 *
 * Formatos aceitos (pode misturar):
 *   - um documento do Foundry (o JSON do "Export Data", ou o que a IA gera pelo guia);
 *   - uma lista deles: [ {...}, {...} ];
 *   - um lote: { "pasta": "Floresta", "documentos": [ ... ] }  (também "atores", "itens", "escritos");
 *   - Escritos no formato simples (ver escritos.mjs).
 */
import { naurenConsertarReferenciasImport } from "../nauren.mjs";
import { naurenEscritoDoJson } from "./escritos.mjs";
import { naurenBordaAplicar, naurenBordaConfig } from "./borda-token.mjs";
import { naurenProntaCfgPara, naurenProntasLista } from "./molduras-prontas.mjs";
import { naurenMolduraModelo, NAUREN_MOLDURA_PALETAS } from "./molduras-modelos.mjs";

const SIS = "nauren";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
const TIPOS = () => ({
  Actor: Object.keys(game.system?.documentTypes?.Actor ?? CONFIG.Actor?.dataModels ?? { personagem: 1, npc: 1, armazenamento: 1 }).filter(t => t !== "base"),
  Item: Object.keys(game.system?.documentTypes?.Item ?? CONFIG.Item?.dataModels ?? {}).filter(t => t !== "base")
});
const ROT_TIPO = { personagem: "Personagem", npc: "NPC", armazenamento: "Armazenamento", arma: "Arma", armadura: "Armadura", consumivel: "Equipamento", habilidade: "Habilidade", magia: "Magia", efeito: "Efeito", cor: "Pigmento", condicao: "Condição", grupo: "Grupo", classe: "Classe", subclasse: "Subclasse", peculiaridade: "Peculiaridade" };
const ICONE_CLASSE = { Actor: "fa-user", Item: "fa-suitcase" };

/* ------------------------------ ler o arquivo ------------------------------ */
/** Tira cercas de código (```json … ```) e texto antes/depois — a IA costuma mandar assim. */
function limparTexto(t) {
  t = String(t ?? "").replace(/^﻿/, "").trim();
  const cerca = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (cerca && !/^[[{]/.test(t)) t = cerca[1].trim();
  else if (cerca && t.startsWith("```")) t = cerca[1].trim();
  if (!/^[[{]/.test(t)) { const i = t.search(/[[{]/); if (i > 0) t = t.slice(i); }
  return t;
}
/**
 * Lê o JSON e devolve { itens: [{ classe: "Actor"|"Item", dados, nome, tipo, pasta, borda, avisos[] }], erros: [] }.
 * Um texto com vários JSON colados (um depois do outro) também funciona.
 */
export function naurenImportarMassaLer(texto) {
  const t = limparTexto(texto);
  let raiz;
  try { raiz = JSON.parse(t); }
  catch (err) {
    // vários objetos seguidos: {…}\n{…}
    try { raiz = JSON.parse(`[${t.replace(/}\s*\n\s*{/g, "},{")}]`); } catch (err2) { throw new Error(`o texto não é um JSON válido (${err.message})`); }
  }
  const tipos = TIPOS();
  const lista = [], erros = [];
  const empurrar = (o, pastaLote = null, onde = "") => {
    if (Array.isArray(o)) return o.forEach((x, i) => empurrar(x, pastaLote, `${onde}${i + 1}`));
    if (!o || typeof o !== "object") return erros.push(`${onde || "item"}: não é uma ficha`);
    // lote dentro de lote
    const sub = o.documentos ?? o.documents ?? null;
    if (Array.isArray(sub) || Array.isArray(o.atores) || Array.isArray(o.itens) || Array.isArray(o.escritos)) {
      const p = o.pasta ?? pastaLote;
      for (const k of ["documentos", "documents", "atores", "itens", "escritos"]) if (Array.isArray(o[k])) o[k].forEach((x, i) => empurrar(x, p, `${k} ${i + 1}`));
      return;
    }
    const pasta = typeof o.pasta === "string" ? o.pasta : pastaLote;
    try {
      // Escrito no formato simples
      if (!o.type && (Array.isArray(o.paginas) || o.formato)) {
        const d = naurenEscritoDoJson(o); const { _pasta, ...dados } = d;
        return lista.push({ classe: "Item", dados, nome: dados.name, tipo: "escrito", pasta: _pasta ?? pasta, borda: null, avisos: [] });
      }
      const classe = tipos.Actor.includes(o.type) ? "Actor" : tipos.Item.includes(o.type) ? "Item" : null;
      if (!classe) return erros.push(`${o.name ?? o.nome ?? onde}: tipo "${o.type ?? "?"}" não existe no Nauren (use ${[...tipos.Actor, ...tipos.Item].join(", ")})`);
      const dados = foundry.utils.deepClone(o);
      if (!dados.name && dados.nome) dados.name = dados.nome;
      if (!dados.name) return erros.push(`${onde}: ficha sem "name"`);
      // atalhos fora do schema: "pasta", "borda" (só atores), "nome"
      const borda = classe === "Actor" ? (dados.borda ?? null) : null;
      for (const k of ["pasta", "borda", "nome", "_id", "folder", "_stats", "ownership", "sort"]) delete dados[k];
      const avisos = [];
      if (borda) avisos.push(...conferirBorda(borda));
      lista.push({ classe, dados, nome: dados.name, tipo: dados.type, pasta, borda, avisos });
    } catch (err) { erros.push(`${o.name ?? o.nome ?? onde}: ${err.message}`); }
  };
  empurrar(raiz, typeof raiz?.pasta === "string" ? raiz.pasta : null);
  return { itens: lista, erros };
}
function conferirBorda(b) {
  const av = [];
  if (typeof b === "string") { if (!naurenProntasLista().some(p => p.nome.toLowerCase() === b.toLowerCase())) av.push(`borda: não há Pronta chamada "${b}"`); return av; }
  if (b.pronta) { if (!naurenProntasLista().some(p => p.nome.toLowerCase() === String(b.pronta).toLowerCase())) av.push(`borda: não há Pronta chamada "${b.pronta}"`); return av; }
  const m = b.modelo ?? "foundry";
  if (m !== "foundry" && m !== "imagem" && !naurenMolduraModelo(m)) av.push(`borda: modelo "${m}" não existe (vai a borda do Foundry)`);
  if (b.paleta && b.paleta !== "livre" && !NAUREN_MOLDURA_PALETAS[b.paleta]) av.push(`borda: paleta "${b.paleta}" não existe`);
  return av;
}

/* ------------------------------ borda do token ------------------------------ */
/** O "borda" do arquivo (simples ou exportado) → configuração pronta para aplicar no token. */
async function cfgDaBorda(b, src) {
  if (!b) return null;
  if (typeof b === "string") b = { pronta: b };
  if (b.pronta) {
    const p = naurenProntasLista().find(x => x.nome.toLowerCase() === String(b.pronta).toLowerCase());
    return p ? naurenProntaCfgPara(p.dados, { src }) : null;
  }
  // exportado do Foundry (já medido): só garante a imagem
  if (b.moldura?.vb && b.ativa !== undefined) return { ...naurenBordaConfig({ flags: { nauren: { borda: { ...b, src: b.src || src } } } }), ativa: true };
  const modelo = b.modelo && (b.modelo === "foundry" || naurenMolduraModelo(b.modelo)) ? b.modelo : "foundry";
  const hex = c => typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c);
  const coresAnel = (b.coresAnel ?? (modelo === "foundry" ? b.cores : null) ?? []).filter(hex);
  const dados = {
    sistema: SIS, tipo: "bordaToken", modelo,
    cores: coresAnel.length ? coresAnel : undefined,
    corFundo: b.corFundo, corDano: b.corDano, corCura: b.corCura,
    efeitos: modelo === "foundry" ? (Array.isArray(b.efeitos) ? b.efeitos.filter(e => typeof e === "string") : []) : [],
    pedra: b.pedra ?? null, recorte: b.recorte, borda: b.tamanhoBorda,
    moldura: modelo === "foundry" ? null : {
      modelo, paleta: b.paleta, cores: b.cores, esmalte: b.esmalte, joia: b.joia, semEsmalte: b.semEsmalte, semJoia: b.semJoia,
      espessura: b.espessura, escala: b.escala, mascara: b.mascara, girar: b.girar, reacoes: b.reacoes,
      efeitos: Array.isArray(b.efeitos) ? b.efeitos.filter(e => e && typeof e === "object") : []
    }
  };
  const cfg = await naurenProntaCfgPara(dados, { src });
  if (Number.isFinite(Number(b.zoom))) cfg.zoom = Number(b.zoom);
  return cfg;
}

/* ------------------------------ pastas ------------------------------ */
function pastasDe(tipo) {
  const todas = (game.folders?.contents ?? [...(game.folders ?? [])]).filter(f => f.type === tipo);
  const fora = [];
  const visitar = (pai, nivel) => todas.filter(f => (f.folder?.id ?? f.folder ?? null) === (pai?.id ?? null)).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.name.localeCompare(b.name))
    .forEach(f => { fora.push({ id: f.id, nome: f.name, nivel }); visitar(f, nivel + 1); });
  visitar(null, 0);
  for (const f of todas) if (!fora.some(x => x.id === f.id)) fora.push({ id: f.id, nome: f.name, nivel: 0 });
  return fora;
}
async function garantirPasta(tipo, nome, pai = null) {
  nome = String(nome ?? "").trim(); if (!nome) return null;
  const existe = game.folders?.find?.(f => f.type === tipo && f.name === nome && (f.folder?.id ?? f.folder ?? null) === (pai ?? null));
  if (existe) return existe;
  return Folder.create({ name: nome, type: tipo, folder: pai ?? null });
}

/* ------------------------------ importar ------------------------------ */
/**
 * Cria tudo. destino = { Actor: { modo: "pasta"|"nova"|"nenhuma"|"arquivo", id, nome }, Item: {...} }
 * "arquivo" = usa o campo "pasta" de cada ficha (cria se não existir), dentro da pasta escolhida/nova se houver.
 */
export async function naurenImportarMassa(lido, destino = {}, { aoProgresso = null } = {}) {
  const res = { criados: [], falhas: [], bordas: 0, consertos: [] };
  const pastaBase = {};
  for (const classe of ["Actor", "Item"]) {
    const d = destino[classe] ?? { modo: "nenhuma" };
    if (d.modo === "pasta" && d.id) pastaBase[classe] = game.folders?.get?.(d.id) ?? null;
    else if (d.modo === "nova" && lido.itens.some(x => x.classe === classe)) pastaBase[classe] = await garantirPasta(classe, d.nome || "Importados");
    else pastaBase[classe] = null;
  }
  const usarDoArquivo = classe => (destino[classe]?.porArquivo ?? true);
  let n = 0;
  for (const it of lido.itens) {
    n++; aoProgresso?.(n, lido.itens.length, it.nome);
    try {
      const dados = foundry.utils.deepClone(it.dados);
      let pasta = pastaBase[it.classe];
      if (it.pasta && usarDoArquivo(it.classe)) pasta = await garantirPasta(it.classe, it.pasta, pasta?.id ?? null);
      if (pasta?.id) dados.folder = pasta.id;
      dados._id = foundry.utils.randomID();
      const rel = naurenConsertarReferenciasImport(dados, { idNovo: dados._id });
      delete dados.naurenRefs; delete dados.curador;
      const Cls = it.classe === "Actor" ? Actor : Item;
      const [doc] = await Cls.createDocuments([dados], { keepId: true });
      if (!doc) throw new Error("o Foundry não criou");
      res.criados.push(doc);
      if ((rel?.consertados?.length || rel?.perdidos?.length)) res.consertos.push({ doc, rel });
      if (it.classe === "Actor" && it.borda) {
        const src = doc.prototypeToken?.texture?.src || doc.img;
        const cfg = await cfgDaBorda(it.borda, src);
        if (cfg) { await naurenBordaAplicar(doc, { ...cfg, ativa: true, src: cfg.src || src }, { nosTokens: false }); res.bordas++; }
      }
    } catch (err) { console.warn("Nauren RPG | Importar em massa:", it.nome, err); res.falhas.push({ nome: it.nome, erro: err.message }); }
  }
  // um resumo só, sussurrado ao Mestre
  const perdidos = res.consertos.flatMap(c => (c.rel.perdidos ?? []).map(p => `${c.doc.name}: ${p.nome ?? p.uuid ?? p}`));
  const linhas = [`<p><b>${res.criados.length}</b> ${res.criados.length === 1 ? "ficha criada" : "fichas criadas"}${res.bordas ? `, ${res.bordas} com a borda do token montada` : ""}.</p>`];
  if (res.falhas.length) linhas.push(`<p><b>Não criei:</b></p><ul>${res.falhas.map(f => `<li>${esc(f.nome)} — ${esc(f.erro)}</li>`).join("")}</ul>`);
  if (perdidos.length) linhas.push(`<p><b>Referências que não achei neste mundo</b> (ficam sem efeito até escolher de novo na ficha):</p><ul>${perdidos.slice(0, 30).map(p => `<li>${esc(p)}</li>`).join("")}</ul>`);
  const gms = game.users?.filter?.(u => u.isGM).map(u => u.id) ?? [];
  await ChatMessage.create({ content: `<div class="nauren-card-import"><h3>Importar em massa</h3>${linhas.join("")}</div>`, whisper: gms, speaker: { alias: "Nauren" } }).catch(() => null);
  return res;
}

/* ------------------------------ a janela ------------------------------ */
export class NaurenImportarMassa extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "nauren-importar-massa", classes: ["nauren-kit", "nauren-imp-massa"],
    position: { width: 760, height: 720 },
    window: { title: "Importar em massa (JSON)", icon: "fas fa-file-import", resizable: true },
    actions: {
      ler: function () { this.ler(); },
      limpar: function () { this.texto = ""; this.lido = null; this.erro = ""; this.render(); },
      importar: function () { this.importar(); },
      tirar: function (ev, el) { this.lido?.itens.splice(Number(el.dataset.i), 1); this.render(); }
    }
  };
  static abrir(op = {}) { const ap = foundry.applications.instances?.get?.("nauren-importar-massa") ?? new NaurenImportarMassa(op); ap.render(true); return ap; }
  constructor(op = {}) {
    super(op);
    this.texto = ""; this.lido = null; this.erro = ""; this.feito = null; this.ocupado = false;
    this.destino = { Actor: { modo: "nova", nome: "", porArquivo: true }, Item: { modo: "nova", nome: "", porArquivo: true } };
    if (op.classe && this.destino[op.classe]) this.focoClasse = op.classe;
  }
  ler() {
    const ta = this.element?.querySelector("[data-imp-txt]"); if (ta) this.texto = ta.value;
    this.erro = ""; this.feito = null;
    try {
      this.lido = naurenImportarMassaLer(this.texto);
      const hoje = new Date(); const quando = `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}`;
      for (const c of ["Actor", "Item"]) if (!this.destino[c].nome) this.destino[c].nome = `Importados ${quando}`;
      if (!this.lido.itens.length && !this.lido.erros.length) this.erro = "Nenhuma ficha no arquivo.";
    } catch (err) { this.lido = null; this.erro = `Não consegui ler: ${err.message}`; }
    this.render();
  }
  destinoHtml(classe, qtd) {
    const d = this.destino[classe], pastas = pastasDe(classe);
    const rot = classe === "Actor" ? "Atores" : "Itens";
    const temArquivo = this.lido?.itens.some(x => x.classe === classe && x.pasta);
    return `<div class="im-dest nt-ch" data-classe="${classe}">
      <div class="im-dest-cab"><i class="fas ${ICONE_CLASSE[classe]}"></i><b>${rot}</b><span>${qtd}</span></div>
      <div class="im-dest-op">
        <select class="im-sel" data-dest="modo">
          <option value="nova" ${d.modo === "nova" ? "selected" : ""}>+ Criar uma pasta nova</option>
          ${pastas.length ? `<optgroup label="Pastas que já existem">${pastas.map(p => `<option value="pasta:${p.id}" ${d.modo === "pasta" && d.id === p.id ? "selected" : ""}>${"  ".repeat(p.nivel)}${p.nivel ? "└ " : ""}${esc(p.nome)}</option>`).join("")}</optgroup>` : ""}
          <option value="nenhuma" ${d.modo === "nenhuma" ? "selected" : ""}>Sem pasta</option>
        </select>
        ${d.modo === "nova" ? `<input type="text" class="im-in" data-dest="nome" value="${esc(d.nome)}" placeholder="Nome da pasta nova">` : ""}
      </div>
      ${temArquivo ? `<label class="im-check"><input type="checkbox" data-dest="porArquivo" ${d.porArquivo ? "checked" : ""}> Usar as subpastas do arquivo (campo "pasta")</label>` : ""}
    </div>`;
  }
  async _renderHTML() {
    const L = this.lido;
    const nA = L?.itens.filter(x => x.classe === "Actor").length ?? 0, nI = L?.itens.filter(x => x.classe === "Item").length ?? 0;
    const linhas = (L?.itens ?? []).map((x, i) => {
      const b = x.borda ? (typeof x.borda === "string" ? `Pronta: ${x.borda}` : x.borda.pronta ? `Pronta: ${x.borda.pronta}` : `${x.borda.modelo ?? "foundry"}${x.borda.paleta ? ` · ${x.borda.paleta}` : ""}${Array.isArray(x.borda.efeitos) && x.borda.efeitos.length ? ` · ${x.borda.efeitos.map(e => e.tipo ?? e).join(", ")}` : ""}`) : "";
      const nItens = Array.isArray(x.dados.items) ? x.dados.items.length : 0;
      return `<div class="im-linha ${x.avisos.length ? "im-aviso" : ""}">
        <img src="${esc(x.dados.img || (x.classe === "Actor" ? "icons/svg/mystery-man.svg" : "icons/svg/item-bag.svg"))}" alt="">
        <div class="im-l-txt"><b>${esc(x.nome)}</b><small>${esc(x.tipo === "escrito" ? "Escrito" : ROT_TIPO[x.tipo] ?? x.tipo)}${x.dados.system?.nivel ? ` · nível ${x.dados.system.nivel}` : ""}${nItens ? ` · ${nItens} itens` : ""}${x.pasta ? ` · pasta "${esc(x.pasta)}"` : ""}</small>
          ${b ? `<span class="im-borda"><i class="fas fa-circle-notch"></i> Borda: ${esc(b)}</span>` : ""}
          ${x.avisos.map(a => `<span class="im-av"><i class="fas fa-triangle-exclamation"></i> ${esc(a)}</span>`).join("")}</div>
        <button type="button" class="im-x" data-action="tirar" data-i="${i}" title="Não importar esta"><i class="fas fa-xmark"></i></button>
      </div>`;
    }).join("");
    const feito = this.feito;
    return `<div class="im-raiz">
      <section class="im-entrada">
        <div class="im-arq"><label class="im-btn nt-ch"><i class="fas fa-folder-open"></i> Escolher arquivo(s)<input type="file" accept=".json,application/json,.txt" multiple data-imp-arq hidden></label>
          <span class="im-dica">ou cole o JSON (pode ser o que a IA respondeu, com o texto em volta).</span></div>
        <textarea data-imp-txt spellcheck="false" placeholder='[ { "name": "Lobo de Cinza", "type": "npc", "pasta": "Floresta", "borda": { "modelo": "espinhos", "paleta": "obsidiana" }, ... }, ... ]'>${esc(this.texto)}</textarea>
        <div class="im-bts"><button type="button" class="im-btn nt-ch im-p" data-action="ler"><i class="fas fa-magnifying-glass"></i> Ler e conferir</button>${this.texto ? `<button type="button" class="im-btn nt-ch" data-action="limpar"><i class="fas fa-eraser"></i> Limpar</button>` : ""}</div>
        ${this.erro ? `<p class="im-erro"><i class="fas fa-circle-xmark"></i> ${esc(this.erro)}</p>` : ""}
      </section>
      ${L ? `<section class="im-previa">
        <div class="im-tit">Vai criar <b>${L.itens.length}</b> ${L.itens.length === 1 ? "ficha" : "fichas"}${L.erros.length ? ` · <span class="im-ruim">${L.erros.length} com problema</span>` : ""}</div>
        ${L.erros.length ? `<ul class="im-erros">${L.erros.map(e => `<li>${esc(e)}</li>`).join("")}</ul>` : ""}
        <div class="im-lista">${linhas}</div>
        <div class="im-dests">${nA ? this.destinoHtml("Actor", nA) : ""}${nI ? this.destinoHtml("Item", nI) : ""}</div>
      </section>` : `<section class="im-ajuda"><p class="im-dica"><b>Aceita:</b> uma ficha, uma lista de fichas, ou um lote <code>{ "pasta": "…", "documentos": [ … ] }</code>. NPCs, personagens, baús, qualquer item e Escritos. Cada ator pode ter <code>"borda"</code> (o modelo, a paleta e os efeitos da moldura, ou o nome de uma Pronta do Mestre) e já sai com a borda no token.</p>
        <p class="im-dica">Para pedir à IA: anexe o <b>guia-criacao-ia.md</b> (seção 17) e o <b>prompt-criacao-criatura.md</b> da pasta docs do sistema e peça "um lote JSON para importar em massa".</p></section>`}
      <footer class="im-rodape">
        ${feito ? `<span class="im-ok"><i class="fas fa-circle-check"></i> ${feito.criados.length} criadas${feito.bordas ? ` · ${feito.bordas} com borda` : ""}${feito.falhas.length ? ` · <span class="im-ruim">${feito.falhas.length} falharam (veja o chat)</span>` : ""}</span>` : `<span class="im-prog" data-prog></span>`}
        <button type="button" class="im-btn nt-ch im-p" data-action="importar" ${!L?.itens.length || this.ocupado ? "disabled" : ""}><i class="fas fa-file-import"></i> Importar ${L?.itens.length ?? ""}</button>
      </footer>
    </div>`;
  }
  _replaceHTML(html, content) { content.innerHTML = html; }
  _onRender() {
    const el = this.element; if (!el) return;
    el.querySelector("[data-imp-arq]")?.addEventListener("change", async ev => {
      const fs = [...(ev.target.files ?? [])]; if (!fs.length) return;
      const textos = await Promise.all(fs.map(f => f.text()));
      // vários arquivos: junta tudo numa lista
      this.texto = textos.length === 1 ? textos[0] : `[${textos.map(t => limparTexto(t)).join(",\n")}]`;
      const ta = el.querySelector("[data-imp-txt]"); if (ta) ta.value = this.texto;
      this.ler();
    });
    el.querySelector("[data-imp-txt]")?.addEventListener("input", ev => { this.texto = ev.target.value; });
    el.querySelector("[data-imp-txt]")?.addEventListener("paste", () => setTimeout(() => this.ler(), 30));
    el.querySelectorAll(".im-dest").forEach(box => {
      const c = box.dataset.classe, d = this.destino[c];
      box.querySelector('[data-dest="modo"]')?.addEventListener("change", ev => { const v = ev.target.value; if (v.startsWith("pasta:")) { d.modo = "pasta"; d.id = v.slice(6); } else d.modo = v; this.render(); });
      box.querySelector('[data-dest="nome"]')?.addEventListener("input", ev => { d.nome = ev.target.value; });
      box.querySelector('[data-dest="porArquivo"]')?.addEventListener("change", ev => { d.porArquivo = ev.target.checked; });
    });
  }
  async importar() {
    if (!this.lido?.itens.length || this.ocupado) return;
    if (!game.user?.isGM) return ui.notifications?.warn("Só o Mestre importa em massa.");
    this.ocupado = true;
    const prog = this.element?.querySelector("[data-prog]"); const bt = this.element?.querySelector('[data-action="importar"]'); if (bt) bt.disabled = true;
    try {
      this.feito = await naurenImportarMassa(this.lido, this.destino, { aoProgresso: (n, t, nome) => { if (prog) prog.textContent = `Criando ${n} de ${t}: ${nome}…`; } });
      ui.notifications?.info(`${this.feito.criados.length} ${this.feito.criados.length === 1 ? "ficha importada" : "fichas importadas"}.`);
      if (!this.feito.falhas.length) { this.lido = null; this.texto = ""; }
    } finally { this.ocupado = false; this.render(); }
  }
}

/* ------------------------------ botões nas abas Atores e Itens ------------------------------ */
export function naurenImportarMassaInit() {
  const botao = (classe) => (app, html) => {
    if (!game.user?.isGM) return;
    const el = html instanceof HTMLElement ? html : html?.[0];
    if (!el || el.querySelector(".nauren-btn-imp-massa")) return;
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "nauren-btn-imp-massa";
    btn.innerHTML = '<i class="fas fa-file-import"></i> Importar em massa';
    btn.title = "Várias fichas de uma vez, de um JSON (feito à mão ou por IA)";
    btn.addEventListener("click", () => NaurenImportarMassa.abrir({ classe }));
    (el.querySelector(".directory-footer") ?? el.querySelector(".directory-header") ?? el).append(btn);
  };
  Hooks.on("renderActorDirectory", botao("Actor"));
  Hooks.on("renderItemDirectory", botao("Item"));
}
