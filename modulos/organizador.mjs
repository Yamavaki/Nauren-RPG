/**
 * Nauren RPG — Organizador das listas (0.109).
 *
 * Seleção de vários, filtros rápidos e ações em lote DIRETO na barra lateral do Foundry (Atores, Itens, Cenas,
 * Diário, Tabelas, Cartas, Playlists, Macros) e nas janelas dos compêndios. Nada de tela à parte.
 *
 *  - Botão de filtros (todos): etiquetas de um clique no topo da lista ("Jogadores", "Sem imagem"…), combináveis.
 *  - Botão Selecionar (só Mestre): com ele ligado, cada clique marca/desmarca (não abre a ficha). Fora dele:
 *    Ctrl+clique marca, Shift+clique marca o intervalo. Caixinha da pasta marca a PASTA (não o que está dentro);
 *    o botão ao lado dela marca o que está dentro. "Selecionar os visíveis" marca o que sobrou no filtro/busca.
 *  - Barra de ações (só Mestre), quando há algo marcado: Mover, Duplicar, Excluir e ⋯ (o resto). Botão direito em
 *    cima de algo marcado abre as mesmas ações. Arrastar um marcado leva o grupo todo (para uma pasta, para o mapa,
 *    para a ficha de um personagem).
 *  - Excluir guarda uma cópia na Lixeira (compêndios do mundo "Lixeira — …") e mostra "Desfazer". Restaurar pela
 *    janela da Lixeira; o que passa do prazo (configuração, 30 dias) é apagado sozinho.
 *
 * V14: hook renderDocumentDirectory (todas as listas e Compendium), contextos próprios (sem depender do nome dos
 * hooks de menu), Document.createDocuments/updateDocuments/deleteDocuments em lote (uma gravação para o grupo todo).
 */
import { naurenKitSistema } from "./janelas-kit.mjs";
import { naurenEhEscrito } from "./escritos.mjs";
import { naurenAndarParaToken } from "./andares.mjs";

const SIS = "nauren";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
const DialogV2 = () => foundry.applications.api.DialogV2;
const ehGM = () => !!game.user?.isGM;

/* ============================== estado por lista ============================== */
const ESTADOS = new Map();
const ehPack = app => !!app?.collection?.metadata;
const chaveDe = app => ehPack(app) ? `pack:${app.collection.collection}` : String(app?.documentName ?? "");
function est(app) {
  const k = chaveDe(app);
  if (!ESTADOS.has(k)) ESTADOS.set(k, { sel: new Set(), pastas: new Set(), ancora: null, modo: false, verFiltros: false, filtros: new Set() });
  return ESTADOS.get(k);
}
const total = e => e.sel.size + e.pastas.size;
const opsDe = app => ehPack(app) ? { pack: app.collection.collection } : {};
const classeDe = app => app.documentClass ?? getDocumentClass(app.documentName);
const pastasDe = app => app.collection?.folders ?? game.folders.filter(f => f.type === app.documentName);
const fonteDe = app => ehPack(app) ? (app.collection.index?.contents ?? [...(app.collection.index ?? [])]) : (app.collection?.contents ?? []);
async function docsDe(app, ids) {
  ids = [...ids]; if (!ids.length) return [];
  if (ehPack(app)) return app.collection.getDocuments({ _id__in: ids });
  return ids.map(id => app.collection.get(id)).filter(Boolean);
}
const rotuloTipo = n => ({ Actor: "Atores", Item: "Itens", Scene: "Cenas", JournalEntry: "Diário", RollTable: "Tabelas", Cards: "Cartas", Playlist: "Playlists", Macro: "Macros" }[n] ?? n);
const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;

/* ============================== filtros rápidos ============================== */
const semImg = d => !d?.img || /mystery-man|icons\/svg\/|\/default-icons?\//i.test(d.img);
const TIPOS_ITEM = { arma: "Armas", armadura: "Armaduras", consumivel: "Consumíveis", habilidade: "Habilidades", magia: "Magias", efeito: "Efeitos", cor: "Pigmentos", condicao: "Condições", grupo: "Grupos", classe: "Classes", subclasse: "Subclasses", peculiaridade: "Peculiaridades" };
function filtrosDe(app) {
  const porJogador = filtrosPorJogador(app);
  const comuns = [...porJogador,
    ["sempasta", "Sem pasta", d => !d.folder],
    ["rep", "Nomes repetidos", (d, c) => c.rep.has(d.name)]
  ];
  if (ehPack(app)) {
    const tipos = [...new Set(fonteDe(app).map(d => d.type).filter(Boolean))];
    const lab = app.documentName === "Item" ? TIPOS_ITEM : { personagem: "Personagens", npc: "NPCs", armazenamento: "Baús e lojas" };
    return [...tipos.map(t => [`t:${t}`, lab[t] ?? t, d => d.type === t]), ["semimg", "Sem imagem", semImg], ...comuns];
  }
  switch (app.documentName) {
    case "Actor": return [
      ["jog", "Jogadores", d => !!d.hasPlayerOwner && d.type === "personagem"],
      ["pers", "Personagens", d => d.type === "personagem"],
      ["npc", "NPCs", d => d.type === "npc"],
      ["chefe", "Chefes", d => !!d.flags?.nauren?.criadorMonstro?.chefe],
      ["bando", "Bando", d => !!d.flags?.nauren?.bando?.ativo],
      ["arm", "Baús e lojas", d => d.type === "armazenamento"],
      ["cena", "Na cena", (d, c) => c.naCena.has(d.id)],
      ["semimg", "Sem imagem", semImg], ...comuns];
    case "Item": return [
      ...Object.entries(TIPOS_ITEM).map(([t, r]) => [`t:${t}`, r, d => d.type === t]),
      ["escrito", "Escritos", d => naurenEhEscrito(d)],
      ["pig", "Pigmentados", d => d.flags?.nauren?.torre?.raridade === "magico"],
      ["semimg", "Sem ícone", semImg], ...comuns];
    case "Scene": return [
      ["ativa", "Ativa", d => !!d.active],
      ["nav", "Na navegação", d => !!d.navigation],
      ["andares", "Com andares", d => (d.levels?.size ?? 0) > 1],
      ["tok", "Com tokens", d => (d.tokens?.size ?? 0) > 0],
      ["semmini", "Sem miniatura", d => !d.thumb], ...comuns];
    case "Macro": return [["minhas", "Minhas", d => d.author?.id === game.user.id || d.author === game.user.id], ...comuns];
    default: return comuns;
  }
}
function contextoFiltro(app) {
  const nomes = new Map();
  for (const d of fonteDe(app)) nomes.set(d.name, (nomes.get(d.name) ?? 0) + 1);
  const rep = new Set([...nomes].filter(([, n]) => n > 1).map(([k]) => k));
  const naCena = new Set(app.documentName === "Actor" && !ehPack(app) ? (canvas?.scene?.tokens ?? []).map(t => t.actorId).filter(Boolean) : []);
  return { rep, naCena };
}

/* ============================== dono na lista (0.109.1) ============================== */
// Mostra, embaixo do nome, o jogador dono (cor dele, bolinha acesa se está online, ★ se é o personagem principal).
// Quem vê: o Mestre (tudo) e o próprio dono (as dele). Cenas e compêndios não têm dono. Macros: o autor.
const SEM_DONO = new Set(["Scene"]);
const corDe = u => { const c = u?.color; return (typeof c === "string" ? c : (c?.css ?? c?.toString?.())) || "#9b95a2"; };
function donosDe(d, docName) {
  if (!d) return null;
  if (docName === "Macro") {
    const a = d.author; const u = typeof a === "string" ? game.users.get(a) : a;
    return u && !u.isGM ? { users: [u], todos: false, autor: true } : null;
  }
  if (typeof d.testUserPermission !== "function") return null;
  const users = game.users.filter(u => !u.isGM && d.testUserPermission(u, "OWNER"));
  if (!users.length) return null;
  const todos = Number(d.ownership?.default ?? 0) >= (CONST.DOCUMENT_OWNERSHIP_LEVELS?.OWNER ?? 3);
  // o jogador cujo personagem principal é esta ficha vem primeiro
  if (docName === "Actor") users.sort((a, b) => (b.character?.id === d.id) - (a.character?.id === d.id));
  return { users, todos };
}
const podeVerDono = info => !!info && (ehGM() || info.users.some(u => u.id === game.user?.id));
const donoLigado = app => !ehPack(app) && !SEM_DONO.has(app.documentName);
function filtrosPorJogador(app) {
  if (!donoLigado(app)) return [];
  const jog = ehGM() ? game.users.filter(u => !u.isGM) : [game.user];
  return jog.map(u => [`u:${u.id}`, ehGM() ? u.name : "Meus", d => { const i = donosDe(d, app.documentName); return !!i && !i.todos && i.users.some(x => x.id === u.id); }]);
}
function marcarDonos(app, root, fonte) {
  const ligado = donoLigado(app);
  for (const li of root.querySelectorAll(".directory-list li.directory-item[data-entry-id]")) {
    li.querySelector(".nauren-org-dono")?.remove();
    const d = ligado ? fonte.get(li.dataset.entryId) : null;
    const info = d ? donosDe(d, app.documentName) : null;
    if (!podeVerDono(info)) { li.classList.remove("nauren-org-tem-dono"); continue; }
    const a = li.querySelector(".entry-name"); if (!a) continue;
    if (!a.querySelector(":scope > .nauren-org-nome")) { const n = document.createElement("span"); n.className = "nauren-org-nome"; n.append(...a.childNodes); a.append(n); }
    const prim = info.users[0];
    const principal = app.documentName === "Actor" && prim.character?.id === d.id;
    const quem = info.todos ? "Todos" : info.users.length > 1 ? `${prim.name} +${info.users.length - 1}` : prim.name;
    const cor = info.todos ? "#9b95a2" : corDe(prim);
    const sp = document.createElement("span"); sp.className = "nauren-org-dono";
    sp.dataset.tooltip = info.autor ? `Autor: ${prim.name}` : `Dono: ${info.users.map(u => `${u.name}${u.active ? " (online)" : ""}`).join(", ")}${info.todos ? " — todos os jogadores" : ""}`;
    sp.innerHTML = `<i class="nauren-org-bolinha${!info.todos && !prim.active ? " nauren-org-off" : ""}" style="background:${esc(cor)}"></i><span style="color:${esc(cor)}">${esc(quem)}</span>${principal ? `<span class="nauren-org-estrela">★ personagem</span>` : ""}`;
    a.append(sp);
    li.classList.add("nauren-org-tem-dono");
  }
}
/** A busca do Foundry também acha pelo nome do jogador dono (depois que ela filtrou pelo nome do item). */
function buscarPorDono(app, root, termo) {
  const q = String(termo ?? "").trim().toLowerCase();
  if (!q || !donoLigado(app)) return;
  const fonte = new Map(fonteDe(app).map(d => [d._id ?? d.id, d]));
  for (const li of root.querySelectorAll(".directory-list li.directory-item[data-entry-id]")) {
    if (li.style.display !== "none" || li.hidden) continue;
    const info = donosDe(fonte.get(li.dataset.entryId), app.documentName);
    if (!podeVerDono(info)) continue;
    const nomes = (ehGM() ? info.users : info.users.filter(u => u.id === game.user.id)).map(u => u.name.toLowerCase());
    if (info.todos) nomes.push("todos");
    if (!nomes.some(n => n.includes(q))) continue;
    li.style.display = "";
    for (let p = li.parentElement?.closest("li.directory-item.folder"); p; p = p.parentElement?.closest("li.directory-item.folder")) { p.style.display = "flex"; p.classList.add("expanded"); }
  }
}
function atualizarListasAbertas() {
  const vistos = new Set();
  for (const app of [ui.actors, ui.items, ui.journal, ui.tables, ui.cards, ui.playlists, ui.macros]) {
    if (!app?.documentName || !app.rendered || vistos.has(app)) continue;
    vistos.add(app); redesenhar(app);
  }
}

/* ============================== montar na lista ============================== */
function montar(app, el) {
  const root = app.element ?? el;
  if (!root || !app.documentName || !app.collection) return;
  const e = est(app), gm = ehGM();
  // limpa da seleção o que não existe mais
  const fonte = new Map(fonteDe(app).map(d => [d._id ?? d.id, d]));
  for (const id of [...e.sel]) if (!fonte.has(id)) e.sel.delete(id);
  for (const id of [...e.pastas]) if (!pastasDe(app).get?.(id) && !pastasDe(app).find?.(f => f.id === id)) e.pastas.delete(id);
  if (!gm) { e.sel.clear(); e.pastas.clear(); e.modo = false; }

  // botões ao lado da busca
  const busca = root.querySelector(".directory-header search") ?? root.querySelector("search");
  if (busca && !busca.querySelector("[data-nauren-org]")) {
    const antes = busca.querySelector(".toggle-sort") ?? null;
    const bt = (k, icone, dica) => { const b = document.createElement("button"); b.type = "button"; b.className = `inline-control icon ${icone} nauren-org-bt`; b.dataset.naurenOrg = k; b.dataset.tooltip = dica; b.setAttribute("aria-label", dica); busca.insertBefore(b, antes); return b; };
    bt("filtros", "fa-solid fa-filter", "Filtros rápidos");
    if (gm) bt("selecionar", "fa-solid fa-list-check", "Selecionar vários (cada clique marca)");
    if (gm) bt("lixeira", "fa-solid fa-trash-can-arrow-up", "Lixeira (restaurar o que foi excluído)");
  }
  if (busca) {
    busca.querySelector('[data-nauren-org="filtros"]')?.setAttribute("aria-pressed", String(e.verFiltros || e.filtros.size > 0));
    busca.querySelector('[data-nauren-org="filtros"]')?.classList.toggle("nauren-org-ligado", e.verFiltros || e.filtros.size > 0);
    const bf = busca.querySelector('[data-nauren-org="filtros"]');
    if (bf) bf.dataset.naurenOrgN = e.filtros.size ? String(e.filtros.size) : "";
    busca.querySelector('[data-nauren-org="selecionar"]')?.classList.toggle("nauren-org-ligado", e.modo);
  }

  // etiquetas de filtro + linha de info
  const cab = busca?.parentElement ?? root.querySelector(".directory-header");
  let chips = root.querySelector(".nauren-org-chips"), info = root.querySelector(".nauren-org-info");
  if (cab && !chips) { chips = document.createElement("div"); chips.className = "nauren-org-chips"; cab.append(chips); }
  if (cab && !info) { info = document.createElement("div"); info.className = "nauren-org-info"; cab.append(info); }
  const defs = filtrosDe(app);
  for (const k of [...e.filtros]) if (!defs.some(d => d[0] === k)) e.filtros.delete(k);
  const ctx = (e.verFiltros || e.filtros.size) ? contextoFiltro(app) : null;
  if (chips) {
    chips.hidden = !e.verFiltros;
    if (e.verFiltros) {
      const lista = [...fonte.values()];
      // 0.109.2: os jogadores não viram uma etiqueta cada (com muita gente fica gigante): uma etiqueta "Jogador ▾" abre a
      // lista com busca; escolhido, vira "Ana ✕". O jogador (não Mestre) continua com a etiqueta "Meus".
      const umPorJogador = ehGM();
      const html = [];
      let pos = 0;
      for (const [k, rot, f] of defs) {
        if (umPorJogador && k.startsWith("u:")) continue;
        const n = lista.filter(d => { try { return f(d, ctx); } catch (err) { return false; } }).length;
        if (!n && !e.filtros.has(k)) continue; // etiqueta sem nada para mostrar fica escondida
        html.push(`<button type="button" class="nauren-org-chip" data-nauren-org-filtro="${esc(k)}" aria-pressed="${e.filtros.has(k)}">${esc(rot)}<span>${n}</span></button>`);
        if (k === "jog") pos = html.length;
      }
      if (umPorJogador && defs.some(d => d[0].startsWith("u:"))) {
        const ativo = defs.find(d => d[0].startsWith("u:") && e.filtros.has(d[0]));
        html.splice(pos, 0, ativo
          ? `<button type="button" class="nauren-org-chip" aria-pressed="true" data-nauren-org="jogador" data-tooltip="Tirar o filtro do jogador"><i class="fa-solid fa-user" inert></i> ${esc(ativo[1])} <i class="fa-solid fa-xmark" inert></i></button>`
          : `<button type="button" class="nauren-org-chip nauren-org-chip-menu" data-nauren-org="jogador" data-tooltip="Mostrar só o que é de um jogador"><i class="fa-solid fa-user" inert></i> Jogador <i class="fa-solid fa-caret-down" inert></i></button>`);
      }
      chips.innerHTML = html.join("") + (e.filtros.size ? `<button type="button" class="nauren-org-chip nauren-org-chip-limpar" data-nauren-org="limpar-filtros">Limpar filtros</button>` : "");
    } else chips.innerHTML = "";
  }

  // caixinhas (Mestre)
  if (gm) {
    for (const li of root.querySelectorAll(".directory-list li.directory-item[data-entry-id]")) {
      if (!li.querySelector(":scope > .nauren-org-caixa")) { const s = document.createElement("span"); s.className = "nauren-org-caixa"; s.setAttribute("aria-hidden", "true"); li.append(s); }
      li.classList.toggle("nauren-org-sel", e.sel.has(li.dataset.entryId));
    }
    for (const li of root.querySelectorAll(".directory-list li.directory-item.folder")) {
      const h = li.querySelector(":scope > .folder-header"); if (!h) continue;
      if (!h.querySelector(":scope > .nauren-org-caixa")) {
        const s = document.createElement("span"); s.className = "nauren-org-caixa"; s.dataset.tooltip = "Marcar a pasta (não o que está dentro)"; h.prepend(s);
        const d = document.createElement("button"); d.type = "button"; d.className = "nauren-org-dentro"; d.dataset.tooltip = "Marcar o que está dentro"; d.innerHTML = '<i class="fa-solid fa-check-double" inert></i>';
        h.querySelector(".folder-name")?.after(d) ?? h.append(d);
      }
      li.classList.toggle("nauren-org-sel-pasta", e.pastas.has(li.dataset.folderId));
    }
  }
  root.classList.toggle("nauren-org-modo", gm && (e.modo || total(e) > 0));
  marcarDonos(app, root, fonte);

  aplicarFiltros(app, root, e, defs, ctx, fonte);

  // info: N de M aparecendo + Selecionar os visíveis
  if (info) {
    const ativo = e.filtros.size > 0;
    info.hidden = !ativo;
    if (ativo) {
      const vis = entradasVisiveis(root).length;
      info.innerHTML = `<span>${vis} de ${fonte.size} aparecendo</span>${gm ? `<button type="button" data-nauren-org="sel-visiveis">Selecionar os visíveis</button>` : ""}`;
    }
  }
  barra(app, root, e);
  ligarEventos(app, root);
}

function aplicarFiltros(app, root, e, defs, ctx, fonte) {
  const ativos = defs.filter(d => e.filtros.has(d[0]));
  const lis = root.querySelectorAll(".directory-list li.directory-item[data-entry-id]");
  for (const li of lis) {
    let ok = true;
    if (ativos.length) { const d = fonte.get(li.dataset.entryId); ok = !!d && ativos.every(([, , f]) => { try { return f(d, ctx); } catch (err) { return false; } }); }
    if (!ok) { li.hidden = true; li.dataset.naurenOrgOculto = "1"; }
    else if (li.dataset.naurenOrgOculto) { li.hidden = false; delete li.dataset.naurenOrgOculto; }
  }
  const pastas = [...root.querySelectorAll(".directory-list li.directory-item.folder")].reverse(); // as de dentro primeiro
  for (const li of pastas) {
    if (ativos.length) {
      const tem = !!li.querySelector("li.directory-item[data-entry-id]:not([hidden])");
      if (!tem) { li.hidden = true; li.dataset.naurenOrgOculto = "1"; }
      else { if (li.dataset.naurenOrgOculto) { li.hidden = false; delete li.dataset.naurenOrgOculto; } li.classList.add("expanded"); }
    } else if (li.dataset.naurenOrgOculto) { li.hidden = false; delete li.dataset.naurenOrgOculto; }
  }
}
/** Entradas aparecendo (não escondidas pelo filtro, pela busca do Foundry nem dentro de pasta escondida). */
function entradasVisiveis(root) {
  const fora = el => el.hidden || el.style.display === "none";
  return [...root.querySelectorAll(".directory-list li.directory-item[data-entry-id]")].filter(li => {
    if (fora(li)) return false;
    for (let p = li.parentElement?.closest("li.directory-item.folder"); p; p = p.parentElement?.closest("li.directory-item.folder")) if (fora(p)) return false;
    return true;
  });
}

/* ============================== barra de ações ============================== */
function barra(app, root, e) {
  let b = root.querySelector(":scope .nauren-org-barra");
  const n = total(e);
  if (!ehGM() || !n) { b?.remove(); return; }
  if (!b) {
    b = document.createElement("div"); b.className = "nauren-org-barra";
    const pe = root.querySelector(".directory-footer");
    if (pe) pe.before(b); else (root.querySelector(".window-content") ?? root).append(b);
  }
  const partes = [e.sel.size ? plural(e.sel.size, "marcado", "marcados") : "", e.pastas.size ? plural(e.pastas.size, "pasta", "pastas") : ""].filter(Boolean).join(" + ");
  b.innerHTML = `<div class="nauren-org-conta"><span><b>${n}</b> ${n === 1 ? "selecionado" : "selecionados"}${e.pastas.size ? ` <small>(${esc(partes)})</small>` : ""}</span><button type="button" data-nauren-org="limpar">Limpar</button></div>
    <div class="nauren-org-botoes">
      <button type="button" data-nauren-org="mover"><i class="fa-solid fa-folder-tree" inert></i> Mover</button>
      <button type="button" data-nauren-org="duplicar" ${e.sel.size ? "" : "disabled"}><i class="fa-regular fa-copy" inert></i> Duplicar</button>
      <button type="button" data-nauren-org="excluir" class="nauren-org-perigo"><i class="fa-solid fa-trash" inert></i> Excluir</button>
      <button type="button" data-nauren-org="mais" data-tooltip="Mais ações" aria-label="Mais ações"><i class="fa-solid fa-ellipsis" inert></i></button>
    </div>`;
}

/* ============================== eventos ============================== */
const MDS_ATIVO = () => !!game.modules?.get?.("multiple-document-selection")?.active;
function ligarEventos(app, root) {
  if (root._naurenOrg) { root._naurenOrgApp = app; return; }
  root._naurenOrg = true; root._naurenOrgApp = app;
  const A = () => root._naurenOrgApp;

  root.addEventListener("click", ev => {
    const app = A(); const e = est(app);
    const bt = ev.target.closest("[data-nauren-org]");
    if (bt && root.contains(bt)) { ev.preventDefault(); ev.stopPropagation(); acaoBotao(app, root, bt.dataset.naurenOrg, bt, ev); return; }
    const chip = ev.target.closest("[data-nauren-org-filtro]");
    if (chip) { ev.preventDefault(); ev.stopPropagation(); const k = chip.dataset.naurenOrgFiltro; e.filtros.has(k) ? e.filtros.delete(k) : e.filtros.add(k); redesenhar(app); return; }
    if (!ehGM()) return;
    const dentro = ev.target.closest(".nauren-org-dentro");
    if (dentro) {
      ev.preventDefault(); ev.stopPropagation();
      const li = dentro.closest("li.directory-item.folder");
      const ids = [...li.querySelectorAll("li.directory-item[data-entry-id]")].filter(x => !x.hidden).map(x => x.dataset.entryId);
      const todos = ids.length && ids.every(id => e.sel.has(id));
      ids.forEach(id => todos ? e.sel.delete(id) : e.sel.add(id));
      redesenhar(app); return;
    }
    const caixaPasta = ev.target.closest(".folder-header > .nauren-org-caixa");
    if (caixaPasta) {
      ev.preventDefault(); ev.stopPropagation();
      const id = caixaPasta.closest("li.directory-item.folder")?.dataset.folderId;
      if (id) e.pastas.has(id) ? e.pastas.delete(id) : e.pastas.add(id);
      redesenhar(app); return;
    }
    const li = ev.target.closest("li.directory-item[data-entry-id]");
    if (!li || !root.contains(li)) return;
    if (ev.target.closest("button:not(.nauren-org-caixa), a.create-button, input, select")) return;
    const id = li.dataset.entryId;
    const ctrl = (ev.ctrlKey || ev.metaKey) && !MDS_ATIVO();
    const caixa = !!ev.target.closest(".nauren-org-caixa");
    if (ev.shiftKey && e.ancora) {
      const ordem = entradasVisiveis(root).map(x => x.dataset.entryId);
      const a = ordem.indexOf(e.ancora), z = ordem.indexOf(id);
      if (a >= 0 && z >= 0) { ev.preventDefault(); ev.stopPropagation(); ordem.slice(Math.min(a, z), Math.max(a, z) + 1).forEach(x => e.sel.add(x)); redesenhar(app); return; }
    }
    if (e.modo || ctrl || caixa) {
      ev.preventDefault(); ev.stopPropagation();
      e.sel.has(id) ? e.sel.delete(id) : e.sel.add(id); e.ancora = id;
      redesenhar(app); return;
    }
    e.ancora = id; // clique simples: o Foundry abre a ficha
  }, true);

  root.addEventListener("input", ev => {
    if (!ev.target.matches?.('search input[type="search"], input[name="search"]')) return;
    clearTimeout(root._naurenOrgBusca);
    const valor = ev.target.value;
    root._naurenOrgBusca = setTimeout(() => buscarPorDono(A(), root, valor), 320); // depois do filtro do Foundry
  });

  root.addEventListener("contextmenu", ev => {
    if (!ehGM()) return;
    const app = A(); const e = est(app);
    const li = ev.target.closest("li.directory-item[data-entry-id]");
    const pasta = !li && ev.target.closest(".folder-header")?.closest("li.directory-item.folder");
    const marcado = (li && e.sel.has(li.dataset.entryId)) || (pasta && e.pastas.has(pasta.dataset.folderId));
    if (!marcado || total(e) < 2) return; // menu normal do Foundry
    ev.preventDefault(); ev.stopPropagation();
    abrirMenu(app, ev.clientX, ev.clientY, "mais");
  }, true);

  root.addEventListener("dragstart", ev => {
    const app = A(); const e = est(app);
    const li = ev.target.closest?.("li.directory-item[data-entry-id]");
    LOTE = null;
    if (!ehGM() || !li || !e.sel.has(li.dataset.entryId) || e.sel.size < 2) return;
    LOTE = { chave: chaveDe(app), documentName: app.documentName, ids: [...e.sel], pack: ehPack(app) ? app.collection.collection : null,
      uuids: [...e.sel].map(id => ehPack(app) ? `Compendium.${app.collection.collection}.${app.documentName}.${id}` : `${app.documentName}.${id}`) };
  }, true);
  root.addEventListener("dragend", () => setTimeout(() => { LOTE = null; }, 300), true);
  root.addEventListener("drop", ev => {
    const app = A();
    if (!LOTE || LOTE.chave !== chaveDe(app)) return;
    let dados = null; try { dados = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err) { return; }
    if (dados?.type !== app.documentName) return;
    ev.preventDefault(); ev.stopPropagation();
    const alvo = ev.target.closest("li.directory-item");
    let pasta = null;
    if (alvo?.dataset.entryId) { const d = fonteDe(app).find(x => (x._id ?? x.id) === alvo.dataset.entryId); pasta = d?.folder?.id ?? d?.folder ?? null; }
    else pasta = alvo?.closest("li.directory-item.folder")?.dataset.folderId ?? alvo?.dataset.folderId ?? null;
    root.querySelectorAll(".droptarget").forEach(x => x.classList.remove("droptarget"));
    const ids = LOTE.ids; LOTE = null;
    mover(app, pasta, { ids, pastas: [] });
  }, true);
}
let LOTE = null;
export function naurenOrganizadorLote() { return LOTE; }

function redesenhar(app) { try { montar(app, app.element); } catch (err) { console.warn("Nauren RPG | Organizador", err); } }

async function acaoBotao(app, root, k, bt, ev) {
  const e = est(app);
  switch (k) {
    case "filtros": e.verFiltros = !e.verFiltros; if (!e.verFiltros && e.filtros.size) { e.filtros.clear(); return app.render(); } return redesenhar(app);
    case "limpar-filtros": e.filtros.clear(); return app.render();
    case "selecionar": e.modo = !e.modo; if (!e.modo) { e.sel.clear(); e.pastas.clear(); } return redesenhar(app);
    case "sel-visiveis": entradasVisiveis(root).forEach(li => e.sel.add(li.dataset.entryId)); return redesenhar(app);
    case "limpar": e.sel.clear(); e.pastas.clear(); return redesenhar(app);
    case "lixeira": return NaurenLixeira.abrir();
    case "jogador": {
      const ativo = [...e.filtros].find(k => k.startsWith("u:"));
      if (ativo) { e.filtros.delete(ativo); return app.render(); }
      const r = bt.getBoundingClientRect(); return abrirMenuJogadores(app, r.left, r.bottom + 4);
    }
    case "mover": { const r = bt.getBoundingClientRect(); return abrirMenu(app, r.left, r.top, "mover"); }
    case "duplicar": return duplicar(app);
    case "excluir": return excluir(app);
    case "mais": { const r = bt.getBoundingClientRect(); return abrirMenu(app, r.right - 230, r.top, "mais"); }
  }
}

/* ============================== menu próprio ============================== */
let MENU = null;
function fecharMenu() { MENU?.remove(); MENU = null; }
document.addEventListener("pointerdown", ev => { if (MENU && !MENU.contains(ev.target)) fecharMenu(); }, true);
document.addEventListener("keydown", ev => { if (ev.key === "Escape" && MENU) { fecharMenu(); ev.stopPropagation(); } }, true);

function abrirMenu(app, x, y, tipo) {
  fecharMenu();
  const e = est(app), m = document.createElement("nav"); m.className = "nauren-org-menu"; m.setAttribute("role", "menu");
  const item = (icone, txt, fn, { perigo = false, desligado = false } = {}) => {
    const b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "menuitem"); b.disabled = desligado;
    b.innerHTML = `<i class="${icone}" inert></i><span>${esc(txt)}</span>`; if (perigo) b.classList.add("nauren-org-perigo");
    b.addEventListener("click", () => { fecharMenu(); Promise.resolve(fn()).catch(err => { console.error("Nauren RPG | Organizador", err); ui.notifications.error(`Não deu certo: ${err.message}`); }); });
    m.append(b);
  };
  const rot = t => { const d = document.createElement("div"); d.className = "nauren-org-rot"; d.textContent = t; m.append(d); };
  const linha = () => m.append(document.createElement("hr"));
  const docName = app.documentName, mundo = !ehPack(app), so = e.sel.size;
  if (tipo === "mover") {
    rot("Mover para");
    const lista = arvorePastas(app);
    for (const { f, nivel } of lista) item("fa-solid fa-folder", `${"  ".repeat(nivel)}${f.name}`, () => mover(app, f.id));
    item("fa-regular fa-folder-open", "Fora de pastas", () => mover(app, null));
    linha(); item("fa-solid fa-folder-plus", "Pasta nova…", () => moverParaNova(app));
  } else {
    if (docName === "Actor" && mundo) {
      rot("Atores");
      item("fa-solid fa-chess-pawn", "Colocar na cena", () => colocarNaCena(app), { desligado: !so || !canvas?.scene });
      item("fa-solid fa-circle-notch", "Aplicar borda de token…", () => aplicarBorda(app), { desligado: !so });
      item("fa-solid fa-arrow-up-9-1", "Mudar nível dos NPCs…", () => mudarNivel(app), { desligado: !so });
      item("fa-solid fa-heart-pulse", "Curar e restaurar tudo", () => curarTudo(app), { desligado: !so });
      item("fa-solid fa-broom", "Limpar Condições", () => limparCondicoes(app), { desligado: !so });
      linha();
    }
    if (docName === "Item" && mundo) {
      rot("Itens");
      item("fa-solid fa-hand-holding", "Dar a um ator…", () => darItens(app), { desligado: !so });
      linha();
    }
    if (docName === "Scene" && mundo) {
      rot("Cenas");
      item("fa-solid fa-compass", "Pôr na navegação", () => navegacao(app, true), { desligado: !so });
      item("fa-regular fa-compass", "Tirar da navegação", () => navegacao(app, false), { desligado: !so });
      item("fa-solid fa-download", "Pré-carregar para todos", () => preCarregar(app), { desligado: !so });
      item("fa-solid fa-image", "Gerar miniaturas", () => miniaturas(app), { desligado: !so });
      linha();
    }
    item("fa-solid fa-i-cursor", "Renomear…", () => renomear(app), { desligado: !so });
    if (mundo) item("fa-solid fa-user-lock", "Dono e permissões…", () => permissoes(app), { desligado: !so });
    item("fa-solid fa-file-export", "Exportar o lote (JSON)", () => exportar(app), { desligado: !so });
    item("fa-solid fa-book-atlas", "Enviar para um compêndio…", () => enviarCompendio(app), { desligado: !so });
    if (!mundo) item("fa-solid fa-file-import", "Trazer para o mundo", () => trazerMundo(app), { desligado: !so });
    linha();
    item("fa-solid fa-folder-tree", "Mover…", () => { const r = MENU_POS; abrirMenu(app, r.x, r.y, "mover"); });
    item("fa-regular fa-copy", "Duplicar", () => duplicar(app), { desligado: !so });
    item("fa-solid fa-trash", "Excluir…", () => excluir(app), { perigo: true });
  }
  document.body.append(m);
  const w = m.offsetWidth, h = m.offsetHeight;
  const left = Math.max(6, Math.min(x, window.innerWidth - w - 6));
  const top = y + h > window.innerHeight - 6 ? Math.max(6, y - h - 4) : y;
  m.style.left = `${left}px`; m.style.top = `${top}px`;
  MENU_POS = { x: left, y: top + h };
  MENU = m; m.querySelector("button:not([disabled])")?.focus();
}
let MENU_POS = { x: 0, y: 0 };

/** Lista de jogadores (com quantos itens cada um tem), com busca; escolher liga o filtro daquele jogador. */
function abrirMenuJogadores(app, x, y) {
  fecharMenu();
  const e = est(app), lista = fonteDe(app);
  const jog = game.users.filter(u => !u.isGM).map(u => ({ u, n: lista.filter(d => { const i = donosDe(d, app.documentName); return !!i && !i.todos && i.users.some(x => x.id === u.id); }).length }))
    .filter(j => j.n > 0).sort((a, b) => (b.u.active - a.u.active) || b.n - a.n || a.u.name.localeCompare(b.u.name));
  const m = document.createElement("nav"); m.className = "nauren-org-menu nauren-org-menu-jog"; m.setAttribute("role", "menu");
  if (!jog.length) m.innerHTML = `<div class="nauren-org-rot">Nenhum jogador é dono de algo aqui</div>`;
  else {
    m.innerHTML = `${jog.length > 6 ? `<input type="search" class="nauren-org-busca-jog" placeholder="Procurar jogador…" aria-label="Procurar jogador">` : ""}
      <div class="nauren-org-rot">Mostrar só o que é de</div>
      ${jog.map(({ u, n }) => `<button type="button" role="menuitem" data-u="${u.id}" data-nome="${esc(u.name.toLowerCase())}"><i class="nauren-org-bolinha${u.active ? "" : " nauren-org-off"}" style="background:${esc(corDe(u))}"></i><span>${esc(u.name)}</span><small>${n}</small></button>`).join("")}`;
    m.addEventListener("click", ev => {
      const b = ev.target.closest("button[data-u]"); if (!b) return;
      for (const k of [...e.filtros]) if (k.startsWith("u:")) e.filtros.delete(k);
      e.filtros.add(`u:${b.dataset.u}`); fecharMenu(); redesenhar(app);
    });
    m.querySelector(".nauren-org-busca-jog")?.addEventListener("input", ev => {
      const q = ev.target.value.trim().toLowerCase();
      m.querySelectorAll("button[data-u]").forEach(b => { b.hidden = !!q && !b.dataset.nome.includes(q); });
    });
  }
  document.body.append(m);
  const w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = `${Math.max(6, Math.min(x, window.innerWidth - w - 6))}px`;
  m.style.top = `${y + h > window.innerHeight - 6 ? Math.max(6, window.innerHeight - h - 6) : y}px`;
  MENU = m; (m.querySelector(".nauren-org-busca-jog") ?? m.querySelector("button"))?.focus();
}

function arvorePastas(app) {
  const todas = [...pastasDe(app)];
  const out = [];
  const filhos = id => todas.filter(f => (f.folder?.id ?? f.folder ?? null) === id).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.name.localeCompare(b.name));
  const andar = (id, nivel) => { for (const f of filhos(id)) { out.push({ f, nivel }); andar(f.id, nivel + 1); } };
  andar(null, 0);
  return out;
}

/* ============================== aviso com Desfazer ============================== */
function aviso(app, texto, desfazer = null) {
  document.querySelector(".nauren-org-aviso")?.remove();
  const a = document.createElement("div"); a.className = "nauren-org-aviso"; a.setAttribute("role", "status");
  a.innerHTML = `<span>${esc(texto)}</span>`;
  if (desfazer) {
    const b = document.createElement("button"); b.type = "button"; b.textContent = "Desfazer";
    b.addEventListener("click", async () => { a.remove(); try { await desfazer(); } catch (err) { ui.notifications.error(`Não consegui desfazer: ${err.message}`); } });
    a.append(b);
  }
  const raiz = app?.element ?? document.getElementById("sidebar");
  const r = raiz?.getBoundingClientRect?.();
  if (r && r.width) {
    // logo acima da barra de ações (ou do rodapé da lista), sem cobrir os botões
    const base = (raiz.querySelector(".nauren-org-barra") ?? raiz.querySelector(".directory-footer"))?.getBoundingClientRect?.();
    const topo = base?.height ? base.top : r.bottom - 8;
    a.style.left = `${Math.max(8, r.left + 8)}px`; a.style.width = `${Math.max(220, r.width - 16)}px`; a.style.bottom = `${Math.max(12, window.innerHeight - topo + 6)}px`;
  }
  document.body.append(a);
  setTimeout(() => a.remove(), desfazer ? 12000 : 4000);
}

/* ============================== ações ============================== */
async function mover(app, pastaId, { ids = null, pastas = null } = {}) {
  const e = est(app); ids = ids ?? [...e.sel]; pastas = pastas ?? [...e.pastas];
  const cls = classeDe(app), ops = opsDe(app);
  const antes = new Map(fonteDe(app).filter(d => ids.includes(d._id ?? d.id)).map(d => [d._id ?? d.id, d.folder?.id ?? d.folder ?? null]));
  const docUps = ids.map(_id => ({ _id, folder: pastaId }));
  // pastas: não pode ir para dentro de si mesma nem de uma filha; respeita a profundidade máxima
  const col = pastasDe(app), achar = id => col.get?.(id) ?? col.find?.(f => f.id === id);
  const alvo = pastaId ? achar(pastaId) : null;
  const maxProf = CONST.FOLDER_MAX_DEPTH ?? 4;
  const profAlvo = alvo ? (alvo.depth ?? 1) : 0;
  const pulos = [], pastaUps = [], pastasAntes = new Map();
  for (const fid of pastas) {
    const f = achar(fid); if (!f) continue;
    const descendentes = [f, ...(f.getSubfolders?.(true) ?? [])].map(x => x.id);
    const altura = Math.max(1, ...[f, ...(f.getSubfolders?.(true) ?? [])].map(x => (x.depth ?? 1) - (f.depth ?? 1) + 1));
    if (pastaId && descendentes.includes(pastaId)) { pulos.push(`${f.name} (não cabe dentro de si mesma)`); continue; }
    if (profAlvo + altura > maxProf) { pulos.push(`${f.name} (passaria do limite de ${maxProf} níveis de pasta)`); continue; }
    pastasAntes.set(fid, f.folder?.id ?? null); pastaUps.push({ _id: fid, folder: pastaId });
  }
  if (docUps.length) await cls.updateDocuments(docUps, ops);
  if (pastaUps.length) await Folder.updateDocuments(pastaUps, ops);
  if (pulos.length) ui.notifications.warn(`Não movi: ${pulos.join("; ")}.`);
  e.sel.clear(); e.pastas.clear();
  const n = docUps.length + pastaUps.length;
  if (!n) return;
  const nome = alvo ? alvo.name : "fora de pastas";
  aviso(app, `${n} ${n === 1 ? "movido" : "movidos"} para ${nome}.`, async () => {
    if (antes.size) await cls.updateDocuments([...antes].map(([_id, folder]) => ({ _id, folder })), ops);
    if (pastasAntes.size) await Folder.updateDocuments([...pastasAntes].map(([_id, folder]) => ({ _id, folder })), ops);
  });
}
async function moverParaNova(app) {
  const nome = await DialogV2().prompt({ ...naurenKitSistema(), window: { title: "Pasta nova", icon: "fas fa-folder-plus" }, position: { width: 360 },
    content: `<div class="nauren-org-form"><label>Nome da pasta<input type="text" name="nome" value="Pasta nova" autofocus></label></div>`,
    ok: { label: "Criar e mover", callback: (ev, b, d) => d.element.querySelector("[name=nome]")?.value?.trim() }, rejectClose: false }).catch(() => null);
  if (!nome) return;
  const f = await Folder.create({ name: nome, type: app.documentName, folder: null }, opsDe(app));
  if (f) await mover(app, f.id);
}

async function duplicar(app) {
  const e = est(app), docs = await docsDe(app, e.sel);
  if (!docs.length) return;
  const dados = docs.map(d => { const o = d.toObject(); delete o._id; o.name = `${o.name} (cópia)`; if (o.flags?.nauren?.lixeira) delete o.flags.nauren.lixeira; return o; });
  const novos = await classeDe(app).createDocuments(dados, opsDe(app));
  e.sel = new Set(novos.map(n => n.id)); e.pastas.clear();
  redesenhar(app);
  aviso(app, `${plural(novos.length, "cópia criada", "cópias criadas")} e ${novos.length === 1 ? "marcada" : "marcadas"}.`, async () => {
    await classeDe(app).deleteDocuments(novos.map(n => n.id), opsDe(app)); e.sel.clear(); redesenhar(app);
  });
}

async function excluir(app) {
  const e = est(app), cls = classeDe(app), ops = opsDe(app);
  const docs = await docsDe(app, e.sel);
  const col = pastasDe(app), achar = id => col.get?.(id) ?? col.find?.(f => f.id === id);
  const pastas = [...e.pastas].map(achar).filter(Boolean);
  if (!docs.length && !pastas.length) return;
  // o que está dentro das pastas marcadas (todas as subpastas)
  const todasPastas = [...new Set(pastas.flatMap(f => [f, ...(f.getSubfolders?.(true) ?? [])]))];
  const idsPastas = new Set(todasPastas.map(f => f.id));
  const dentroIds = fonteDe(app).filter(d => idsPastas.has(d.folder?.id ?? d.folder)).map(d => d._id ?? d.id).filter(id => !e.sel.has(id));
  const nomes = [...docs.map(d => d.name), ...pastas.map(f => `📁 ${f.name}`)];
  const lista = nomes.slice(0, 8).map(n => `<li>${esc(n)}</li>`).join("") + (nomes.length > 8 ? `<li>… e mais ${nomes.length - 8}</li>` : "");
  const opcPastas = pastas.length ? `<fieldset class="nauren-org-opcoes"><legend>${pastas.length === 1 ? "A pasta" : "As pastas"}</legend>
      <label><input type="radio" name="modo" value="pasta" checked> Excluir só ${pastas.length === 1 ? "a pasta" : "as pastas"} — o que está dentro sobe um nível</label>
      <label><input type="radio" name="modo" value="tudo"> Excluir ${pastas.length === 1 ? "a pasta" : "as pastas"} e tudo dentro (${plural(dentroIds.length, "item", "itens")}${todasPastas.length > pastas.length ? ` e ${plural(todasPastas.length - pastas.length, "subpasta", "subpastas")}` : ""})</label>
    </fieldset>` : "";
  const modo = await DialogV2().wait({ ...naurenKitSistema(), window: { title: `Excluir ${plural(nomes.length, "item", "itens")}`, icon: "fas fa-trash" }, position: { width: 440 },
    content: `<div class="nauren-org-form"><ul class="nauren-org-nomes">${lista}</ul>${opcPastas}
      <p class="nauren-org-nota"><i class="fa-solid fa-trash-can-arrow-up"></i> Uma cópia vai para a Lixeira; dá para desfazer logo depois ou restaurar pela Lixeira.</p></div>`,
    buttons: [{ action: "ok", label: "Excluir", icon: "fas fa-trash", default: true, callback: (ev, b, d) => d.element.querySelector("[name=modo]:checked")?.value ?? "pasta" },
      { action: "cancelar", label: "Cancelar" }], rejectClose: false }).catch(() => null);
  if (!modo || modo === "cancelar") return;
  const tudo = modo === "tudo";
  const lote = foundry.utils.randomID();
  const conteudo = tudo ? await docsDe(app, dentroIds) : [];
  // guarda na Lixeira antes de apagar (excluir de dentro da própria Lixeira apaga de vez)
  if (!(ehPack(app) && ehLixeira(app.collection))) await naurenLixeiraGuardar(app, [...docs, ...conteudo], lote).catch(err => { console.error(err); throw new Error(`não consegui guardar na Lixeira (${err.message}); nada foi apagado`); });
  // pastas (para desfazer): dados e quem estava dentro de cada uma
  const pastasDados = todasPastas.map(f => f.toObject());
  const ondeEstava = new Map(fonteDe(app).filter(d => idsPastas.has(d.folder?.id ?? d.folder)).map(d => [d._id ?? d.id, d.folder?.id ?? d.folder]));
  if (docs.length) await cls.deleteDocuments(docs.map(d => d.id), ops);
  if (pastas.length) await Folder.deleteDocuments(pastas.map(f => f.id), { ...ops, deleteSubfolders: tudo, deleteContents: tudo });
  e.sel.clear(); e.pastas.clear();
  const n = docs.length + conteudo.length;
  aviso(app, `${n ? `${plural(n, "item excluído", "itens excluídos")}` : ""}${n && pastas.length ? " e " : ""}${pastas.length ? plural(pastas.length, "pasta excluída", "pastas excluídas") : ""} (cópia na Lixeira).`, async () => {
    if (pastasDados.length) {
      const existem = new Set(pastasDe(app).map(f => f.id));
      const faltam = pastasDados.filter(p => !existem.has(p._id));
      if (faltam.length) await Folder.createDocuments(faltam, { ...ops, keepId: true });
    }
    await naurenLixeiraRestaurarLote(lote, { silencioso: true });
    if (!tudo && ondeEstava.size) {
      const ainda = new Set(fonteDe(app).map(d => d._id ?? d.id));
      const ups = [...ondeEstava].filter(([id]) => ainda.has(id)).map(([_id, folder]) => ({ _id, folder }));
      if (ups.length) await cls.updateDocuments(ups, ops);
    }
  });
}

async function exportar(app) {
  const docs = await docsDe(app, est(app).sel);
  if (!docs.length) return;
  const documentos = docs.map(d => { const o = d.toObject(); delete o._stats; delete o.folder; if (o.flags?.nauren?.lixeira) delete o.flags.nauren.lixeira; return o; });
  const pasta = docs.map(d => d.folder?.name).find(Boolean);
  const json = JSON.stringify({ sistema: SIS, classe: app.documentName, ...(pasta ? { pasta } : {}), documentos }, null, 2);
  const nome = `${rotuloTipo(app.documentName).toLowerCase()}-${docs.length}-${new Date().toISOString().slice(0, 10)}.json`;
  foundry.utils.saveDataToFile(json, "application/json", nome);
  aviso(app, `${plural(docs.length, "ficha exportada", "fichas exportadas")} em ${nome}.`);
}

async function renomear(app) {
  const e = est(app);
  const ordem = entradasVisiveis(app.element).map(li => li.dataset.entryId).filter(id => e.sel.has(id));
  const resto = [...e.sel].filter(id => !ordem.includes(id));
  const docs = await docsDe(app, [...ordem, ...resto]);
  if (!docs.length) return;
  const porId = new Map(docs.map(d => [d.id, d])); const lista = [...ordem, ...resto].map(id => porId.get(id)).filter(Boolean);
  const novoNome = (d, i, f) => {
    let n = d.name;
    if (f.de) n = n.split(f.de).join(f.para ?? "");
    n = `${f.prefixo ?? ""}${n}${f.sufixo ?? ""}`;
    if (f.numerar) n = `${n} ${i + 1}`;
    return n.trim() || d.name;
  };
  const ler = el => ({ prefixo: el.querySelector("[name=prefixo]").value, sufixo: el.querySelector("[name=sufixo]").value, de: el.querySelector("[name=de]").value, para: el.querySelector("[name=para]").value, numerar: el.querySelector("[name=numerar]").checked });
  const previa = el => { const f = ler(el); el.querySelector(".nauren-org-previa").innerHTML = lista.slice(0, 4).map((d, i) => `<li><s>${esc(d.name)}</s> → <b>${esc(novoNome(d, i, f))}</b></li>`).join("") + (lista.length > 4 ? `<li>… e mais ${lista.length - 4}</li>` : ""); };
  const f = await DialogV2().prompt({ ...naurenKitSistema(), window: { title: `Renomear ${plural(lista.length, "item", "itens")}`, icon: "fas fa-i-cursor" }, position: { width: 460 },
    content: `<div class="nauren-org-form nauren-org-grade2">
      <label>Antes do nome<input type="text" name="prefixo" placeholder="ex.: [Floresta] "></label>
      <label>Depois do nome<input type="text" name="sufixo" placeholder="ex.:  (chefe)"></label>
      <label>Trocar o texto<input type="text" name="de" placeholder="Actor"></label>
      <label>por<input type="text" name="para" placeholder="Guarda"></label>
      <label class="nauren-org-linha"><input type="checkbox" name="numerar"> Numerar na ordem da lista (Nome 1, Nome 2…)</label>
      <ul class="nauren-org-previa nauren-org-linha"></ul></div>`,
    render: (ev, d) => { const el = d.element ?? d; el.querySelectorAll("input").forEach(i => i.addEventListener("input", () => previa(el))); previa(el); },
    ok: { label: "Renomear", callback: (ev, b, d) => ler(d.element) }, rejectClose: false }).catch(() => null);
  if (!f) return;
  const antes = lista.map(d => ({ _id: d.id, name: d.name }));
  const ups = lista.map((d, i) => ({ _id: d.id, name: novoNome(d, i, f) })).filter((u, i) => u.name !== lista[i].name);
  if (!ups.length) return;
  await classeDe(app).updateDocuments(ups, opsDe(app));
  aviso(app, `${plural(ups.length, "nome trocado", "nomes trocados")}.`, () => classeDe(app).updateDocuments(antes, opsDe(app)));
}

async function permissoes(app) {
  const docs = await docsDe(app, est(app).sel);
  if (!docs.length) return;
  const N = CONST.DOCUMENT_OWNERSHIP_LEVELS;
  const niveis = [["INHERIT", "Herdar da pasta"], ["NONE", "Nenhum"], ["LIMITED", "Limitado"], ["OBSERVER", "Observador"], ["OWNER", "Dono"]].filter(([k]) => N[k] !== undefined);
  const jogadores = game.users.filter(u => !u.isGM);
  const r = await DialogV2().prompt({ ...naurenKitSistema(), window: { title: `Dono e permissões — ${plural(docs.length, "item", "itens")}`, icon: "fas fa-user-lock" }, position: { width: 420 },
    content: `<div class="nauren-org-form">
      <label>Quem<select name="quem"><option value="default">Todos os jogadores (padrão)</option>${jogadores.map(u => `<option value="${u.id}">${esc(u.name)}</option>`).join("")}</select></label>
      <label>Permissão<select name="nivel">${niveis.filter(([k]) => k !== "INHERIT").map(([k, t]) => `<option value="${k}" ${k === "OWNER" ? "selected" : ""}>${t}</option>`).join("")}<option value="INHERIT">Herdar da pasta (tira a permissão própria)</option></select></label>
      <p class="nauren-org-nota">Para dar uma ficha a um jogador, escolha o jogador e "Dono".</p></div>`,
    ok: { label: "Aplicar", callback: (ev, b, d) => ({ quem: d.element.querySelector("[name=quem]").value, nivel: d.element.querySelector("[name=nivel]").value }) }, rejectClose: false }).catch(() => null);
  if (!r) return;
  const nivel = N[r.nivel];
  const antes = docs.map(d => ({ _id: d.id, ownership: foundry.utils.deepClone(d._source.ownership ?? {}) }));
  await classeDe(app).updateDocuments(docs.map(d => ({ _id: d.id, [`ownership.${r.quem}`]: nivel })), opsDe(app));
  aviso(app, `Permissão aplicada em ${plural(docs.length, "item", "itens")}.`, () => classeDe(app).updateDocuments(antes, { ...opsDe(app), diff: false, recursive: false }));
}

async function enviarCompendio(app) {
  const docs = await docsDe(app, est(app).sel);
  if (!docs.length) return;
  const atual = ehPack(app) ? app.collection.collection : null;
  const packs = game.packs.filter(p => p.documentName === app.documentName && !p.locked && p.collection !== atual && !ehLixeira(p));
  if (!packs.length) { ui.notifications.warn(`Nenhum compêndio destravado de ${rotuloTipo(app.documentName)} para receber.`); return; }
  const id = await DialogV2().prompt({ ...naurenKitSistema(), window: { title: "Enviar para um compêndio", icon: "fas fa-book-atlas" }, position: { width: 400 },
    content: `<div class="nauren-org-form"><label>Compêndio<select name="pack">${packs.map(p => `<option value="${p.collection}">${esc(p.title)}</option>`).join("")}</select></label>
      <p class="nauren-org-nota">Cria uma cópia de ${plural(docs.length, "item", "itens")} lá; o original fica aqui.</p></div>`,
    ok: { label: "Enviar", callback: (ev, b, d) => d.element.querySelector("[name=pack]").value }, rejectClose: false }).catch(() => null);
  if (!id) return;
  const pack = game.packs.get(id);
  const dados = docs.map(d => { const o = d.toObject(); delete o._id; delete o.folder; return o; });
  await classeDe(app).createDocuments(dados, { pack: pack.collection });
  aviso(app, `${plural(docs.length, "cópia enviada", "cópias enviadas")} para ${pack.title}.`);
}
async function trazerMundo(app) {
  const docs = await docsDe(app, est(app).sel);
  if (!docs.length) return;
  const criados = await classeDe(app).createDocuments(docs.map(d => { const o = d.toObject(); delete o._id; delete o.folder; return o; }));
  aviso(app, `${plural(criados.length, "item trazido", "itens trazidos")} para o mundo.`);
}

/* -------- atores -------- */
async function colocarNaCena(app, { x = null, y = null, ids = null } = {}) {
  const atores = await docsDe(app, ids ?? est(app).sel);
  if (!atores.length || !canvas?.scene) return;
  const gs = canvas.grid.size, n = atores.length, cols = Math.ceil(Math.sqrt(n));
  const cx = x ?? canvas.stage.pivot.x, cy = y ?? canvas.stage.pivot.y;
  const passo = gs * (Math.max(...atores.map(a => Number(a.prototypeToken?.width) || 1)) + 0.5);
  const dados = [];
  for (let i = 0; i < n; i++) {
    const a = atores[i];
    const px = cx + ((i % cols) - (cols - 1) / 2) * passo, py = cy + (Math.floor(i / cols) - (Math.ceil(n / cols) - 1) / 2) * passo;
    const p = canvas.grid.getSnappedPoint?.({ x: px - gs * (Number(a.prototypeToken?.width) || 1) / 2, y: py - gs * (Number(a.prototypeToken?.height) || 1) / 2 }, { mode: CONST.GRID_SNAPPING_MODES?.TOP_LEFT_CORNER ?? 2 }) ?? { x: px, y: py };
    const td = await a.getTokenDocument({ x: p.x, y: p.y });
    dados.push(naurenAndarParaToken(td.toObject(), null));
  }
  const criados = await canvas.scene.createEmbeddedDocuments("Token", dados);
  aviso(app, `${plural(criados.length, "token colocado", "tokens colocados")} na cena.`, () => canvas.scene.deleteEmbeddedDocuments("Token", criados.map(t => t.id)));
}
async function aplicarBorda(app) {
  const atores = await docsDe(app, est(app).sel);
  // import na hora (evita mudar a ordem de carga dos módulos)
  const { naurenProntasLista, naurenProntaCfgPara } = await import("./molduras-prontas.mjs");
  const { naurenBordaAplicar } = await import("./borda-token.mjs");
  const prontas = naurenProntasLista();
  if (!prontas.length) { ui.notifications.warn("Nenhuma moldura pronta salva. Monte uma borda em qualquer ficha e use \"Salvar como pronta\"."); return; }
  const id = await DialogV2().prompt({ ...naurenKitSistema(), window: { title: `Borda de token — ${plural(atores.length, "ator", "atores")}`, icon: "fas fa-circle-notch" }, position: { width: 400 },
    content: `<div class="nauren-org-form"><label>Moldura pronta<select name="pronta">${prontas.map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join("")}</select></label>
      <p class="nauren-org-nota">Cada ator usa a própria imagem do token; vale também para os tokens que já estão nas cenas.</p></div>`,
    ok: { label: "Aplicar", callback: (ev, b, d) => d.element.querySelector("[name=pronta]").value }, rejectClose: false }).catch(() => null);
  const p = prontas.find(x => x.id === id); if (!p) return;
  let n = 0;
  for (const a of atores) {
    try {
      const src = String(a.prototypeToken?.texture?.src ?? a.img ?? "").replace(/[?&]nauren-borda=[^&]*/, "");
      const cfg = await naurenProntaCfgPara(p.dados, { src });
      await naurenBordaAplicar(a, { ...cfg, ativa: true, src: cfg.src || src });
      n++;
    } catch (err) { console.warn("Nauren RPG | borda em lote:", a.name, err); }
  }
  aviso(app, `Borda "${p.nome}" aplicada em ${plural(n, "ator", "atores")}.`);
}
async function mudarNivel(app) {
  const atores = (await docsDe(app, est(app).sel)).filter(a => a.type === "npc");
  if (!atores.length) { ui.notifications.warn("Só NPCs mudam de nível por aqui (personagens sobem pela ficha, com as escolhas de nível)."); return; }
  const nv = await DialogV2().prompt({ ...naurenKitSistema(), window: { title: `Nível de ${plural(atores.length, "NPC", "NPCs")}`, icon: "fas fa-arrow-up-9-1" }, position: { width: 340 },
    content: `<div class="nauren-org-form"><label>Novo nível<input type="number" name="nivel" min="1" max="30" value="${Number(atores[0].system?.nivel) || 1}" autofocus></label></div>`,
    ok: { label: "Aplicar", callback: (ev, b, d) => Math.max(1, Math.min(30, Number(d.element.querySelector("[name=nivel]").value) || 1)) }, rejectClose: false }).catch(() => null);
  if (!nv) return;
  const antes = atores.map(a => ({ _id: a.id, "system.nivel": a.system.nivel }));
  await Actor.updateDocuments(atores.map(a => ({ _id: a.id, "system.nivel": nv })));
  aviso(app, `${plural(atores.length, "NPC", "NPCs")} no nível ${nv}.`, () => Actor.updateDocuments(antes));
}
async function curarTudo(app) {
  const atores = (await docsDe(app, est(app).sel)).filter(a => a.system?.vida);
  const ups = atores.map(a => {
    const s = a.system, u = { _id: a.id };
    for (const k of ["vida", "mana", "estaminaCombate", "dadosDestino"]) if (s[k] && Number.isFinite(Number(s[k].max))) u[`system.${k}.value`] = Number(s[k].max);
    if (s.stress) u["system.stress.value"] = 0;
    return u;
  });
  if (!ups.length) return;
  await Actor.updateDocuments(ups);
  aviso(app, `${plural(ups.length, "ator restaurado", "atores restaurados")} (Vida, Mana, Estamina e Destino cheios; Estresse zerado).`);
}
async function limparCondicoes(app) {
  const atores = await docsDe(app, est(app).sel);
  let n = 0;
  for (const a of atores) {
    const ids = a.items.filter(i => i.type === "condicao").map(i => i.id);
    if (ids.length) { await a.deleteEmbeddedDocuments("Item", ids); n += ids.length; }
  }
  aviso(app, n ? `${plural(n, "Condição removida", "Condições removidas")}.` : "Nenhuma Condição para tirar.");
}

/* -------- itens -------- */
async function darItens(app, ator = null, itens = null) {
  itens = itens ?? await docsDe(app, est(app).sel);
  if (!itens.length) return;
  if (!ator) {
    const atores = game.actors.filter(a => a.type !== "armazenamento").sort((a, b) => (a.type === "personagem" ? 0 : 1) - (b.type === "personagem" ? 0 : 1) || a.name.localeCompare(b.name));
    const id = await DialogV2().prompt({ ...naurenKitSistema(), window: { title: `Dar ${plural(itens.length, "item", "itens")}`, icon: "fas fa-hand-holding" }, position: { width: 380 },
      content: `<div class="nauren-org-form"><label>Para<select name="ator">${atores.map(a => `<option value="${a.id}">${esc(a.name)}${a.type === "personagem" ? "" : " (NPC)"}</option>`).join("")}</select></label></div>`,
      ok: { label: "Dar", callback: (ev, b, d) => d.element.querySelector("[name=ator]").value }, rejectClose: false }).catch(() => null);
    ator = game.actors.get(id); if (!ator) return;
  }
  const folha = ator.sheet;
  let n = 0;
  for (const it of itens) {
    try {
      if (typeof folha?._adicionarItemNaFicha === "function") await folha._adicionarItemNaFicha(it);
      else await ator.createEmbeddedDocuments("Item", [it.toObject()]);
      n++;
    } catch (err) { console.warn("Nauren RPG | dar item:", it.name, err); }
  }
  ui.notifications.info(`${plural(n, "item dado", "itens dados")} a ${ator.name}.`);
}
/** Arrastar o grupo de itens para a ficha: devolve true se tratou (chamado por _onDropItem da ficha). */
export async function naurenOrganizadorSoltarItens(ator, item) {
  const l = LOTE;
  if (!l || l.documentName !== "Item" || !item) return false;
  const uuid = item.uuid;
  if (!l.uuids.includes(uuid)) return false;
  LOTE = null;
  const itens = (await Promise.all(l.uuids.map(u => fromUuid(u).catch(() => null)))).filter(Boolean);
  await darItens(null, ator, itens);
  return true;
}

/* -------- cenas -------- */
async function navegacao(app, ligar) {
  const ids = [...est(app).sel];
  await Scene.updateDocuments(ids.map(_id => ({ _id, navigation: ligar })));
  aviso(app, `${plural(ids.length, "cena", "cenas")} ${ligar ? "na" : "fora da"} navegação.`);
}
async function preCarregar(app) {
  const ids = [...est(app).sel];
  for (const id of ids) await game.scenes.preload(id, true);
  aviso(app, `Pré-carregamento de ${plural(ids.length, "cena", "cenas")} enviado a todos.`);
}
async function miniaturas(app) {
  const cenas = await docsDe(app, est(app).sel);
  let n = 0;
  for (const s of cenas) {
    try { const t = await s.createThumbnail(); if (t?.thumb) { await s.update({ thumb: t.thumb }, { diff: false }); n++; } }
    catch (err) { console.warn("Nauren RPG | miniatura:", s.name, err); }
  }
  aviso(app, `${plural(n, "miniatura gerada", "miniaturas geradas")}.`);
}

/* ============================== Lixeira ============================== */
const LIXEIRA_PREFIXO = "lixeira-";
const lixeiraNome = docName => `${LIXEIRA_PREFIXO}${docName.toLowerCase()}`;
const LIXEIRA_ROTULO = "Lixeira — ";
// O Foundry gera o nome do compêndio a partir do rótulo; por isso a Lixeira é achada pelo nome OU pelo rótulo.
const ehLixeira = p => p?.metadata?.packageType === "world" && (String(p.metadata.name ?? "").startsWith(LIXEIRA_PREFIXO) || String(p.metadata.label ?? p.title ?? "").startsWith(LIXEIRA_ROTULO));
const lixeiraPacks = () => game.packs.filter(ehLixeira);
async function lixeiraPack(docName, criar = true) {
  let pack = game.packs.get(`world.${lixeiraNome(docName)}`) ?? lixeiraPacks().find(p => p.documentName === docName);
  if (pack || !criar) return pack ?? null;
  const CC = foundry.documents?.collections?.CompendiumCollection ?? globalThis.CompendiumCollection;
  pack = await CC.createCompendium({ type: docName, label: `${LIXEIRA_ROTULO}${rotuloTipo(docName)}` });
  // junta as Lixeiras numa pasta de compêndios
  try {
    let pasta = game.folders.find(f => f.type === "Compendium" && f.getFlag?.(SIS, "lixeira"));
    if (!pasta) pasta = await Folder.create({ name: "Lixeira do Nauren", type: "Compendium", color: "#5a3d78", flags: { [SIS]: { lixeira: true } } });
    await pack.setFolder(pasta);
  } catch (err) { /* sem pasta, tudo bem */ }
  return pack;
}
function caminhoPasta(f) { const out = []; for (let p = f; p; p = p.folder) out.unshift(p.name); return out; }
/** Guarda cópias dos documentos na Lixeira (antes de apagar). */
export async function naurenLixeiraGuardar(app, docs, lote) {
  if (!docs.length) return;
  const docName = app.documentName;
  const pack = await lixeiraPack(docName);
  const em = Date.now(), origem = ehPack(app) ? app.collection.collection : "world";
  const dados = docs.map(d => {
    const o = d.toObject(); const f = d.folder;
    foundry.utils.setProperty(o, `flags.${SIS}.lixeira`, { em, lote, origem, por: game.user.name, pasta: f ? { id: f.id, caminho: caminhoPasta(f) } : null });
    delete o.folder;
    return o;
  });
  const cls = getDocumentClass(docName);
  try { await cls.createDocuments(dados, { pack: pack.collection, keepId: true }); }
  catch (err) { await cls.createDocuments(dados.map(o => { const c = { ...o }; delete c._id; return c; }), { pack: pack.collection }); }
}
async function pastaPorCaminho(docName, caminho, ops) {
  let pai = null;
  for (const nome of caminho ?? []) {
    const col = ops.pack ? game.packs.get(ops.pack)?.folders : game.folders.filter(f => f.type === docName);
    let f = [...(col ?? [])].find(x => x.name === nome && (x.folder?.id ?? x.folder ?? null) === (pai?.id ?? null));
    if (!f) f = await Folder.create({ name: nome, type: docName, folder: pai?.id ?? null }, ops);
    pai = f;
  }
  return pai;
}
/** Restaura da Lixeira (ids da Lixeira) para onde estavam. */
async function lixeiraRestaurar(pack, ids) {
  const docs = await pack.getDocuments({ _id__in: ids });
  if (!docs.length) return 0;
  const cls = getDocumentClass(pack.documentName);
  const grupos = new Map(); // origem → dados
  for (const d of docs) {
    const info = d.getFlag(SIS, "lixeira") ?? {};
    const origem = info.origem && info.origem !== "world" && game.packs.get(info.origem) ? info.origem : "world";
    const ops = origem === "world" ? {} : { pack: origem };
    let pasta = null;
    if (info.pasta) {
      const col = origem === "world" ? game.folders : game.packs.get(origem).folders;
      pasta = col.get(info.pasta.id) ?? await pastaPorCaminho(pack.documentName, info.pasta.caminho, ops).catch(() => null);
    }
    const o = d.toObject(); delete o.flags?.[SIS]?.lixeira; o.folder = pasta?.id ?? null;
    if (!grupos.has(origem)) grupos.set(origem, { ops, dados: [] });
    grupos.get(origem).dados.push(o);
  }
  let n = 0;
  for (const { ops, dados } of grupos.values()) {
    try { n += (await cls.createDocuments(dados, { ...ops, keepId: true })).length; }
    catch (err) { n += (await cls.createDocuments(dados.map(o => { const c = { ...o }; delete c._id; return c; }), ops)).length; }
  }
  await cls.deleteDocuments(docs.map(d => d.id), { pack: pack.collection });
  return n;
}
export async function naurenLixeiraRestaurarLote(lote, { silencioso = false } = {}) {
  let n = 0;
  for (const pack of lixeiraPacks()) {
    const idx = await pack.getIndex({ fields: [`flags.${SIS}.lixeira`] });
    const ids = idx.filter(x => x.flags?.[SIS]?.lixeira?.lote === lote).map(x => x._id);
    if (ids.length) n += await lixeiraRestaurar(pack, ids);
  }
  if (!silencioso) ui.notifications.info(`${plural(n, "item restaurado", "itens restaurados")}.`);
  NaurenLixeira.atualizar();
  return n;
}
async function lixeiraLimparVelhos() {
  if (!ehGM()) return;
  let dias = 30; try { dias = Number(game.settings.get(SIS, "lixeiraDias")) || 30; } catch (err) { /* padrão */ }
  const limite = Date.now() - dias * 864e5;
  for (const pack of lixeiraPacks()) {
    try {
      const idx = await pack.getIndex({ fields: [`flags.${SIS}.lixeira`] });
      const velhos = idx.filter(x => (x.flags?.[SIS]?.lixeira?.em ?? 0) < limite).map(x => x._id);
      if (velhos.length) await getDocumentClass(pack.documentName).deleteDocuments(velhos, { pack: pack.collection });
    } catch (err) { console.warn("Nauren RPG | Lixeira:", err); }
  }
}

/** Janela da Lixeira: lotes por data, restaurar lote/item, apagar de vez. */
export class NaurenLixeira extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "nauren-lixeira", classes: ["nauren-kit", "nauren-org-lixeira"],
    position: { width: 520, height: 600 },
    window: { title: "Lixeira", icon: "fas fa-trash-can-arrow-up", resizable: true },
    actions: {
      restaurarLote: async function (ev, el) { await naurenLixeiraRestaurarLote(el.dataset.lote); },
      restaurarItem: async function (ev, el) { const p = game.packs.get(el.dataset.pack); if (p) { await lixeiraRestaurar(p, [el.dataset.id]); ui.notifications.info("Restaurado."); this.render(); } },
      apagarItem: async function (ev, el) { const p = game.packs.get(el.dataset.pack); if (p) { await getDocumentClass(p.documentName).deleteDocuments([el.dataset.id], { pack: p.collection }); this.render(); } },
      esvaziar: async function () {
        const ok = await DialogV2().confirm({ ...naurenKitSistema(), window: { title: "Esvaziar a Lixeira" }, content: "<p>Apagar de vez tudo o que está na Lixeira? Não dá para desfazer.</p>", rejectClose: false }).catch(() => false);
        if (!ok) return;
        for (const p of lixeiraPacks()) { const idx = await p.getIndex(); const ids = idx.map(x => x._id); if (ids.length) await getDocumentClass(p.documentName).deleteDocuments(ids, { pack: p.collection }); }
        this.render();
      }
    }
  };
  static abrir() { const ap = foundry.applications.instances?.get?.("nauren-lixeira") ?? new NaurenLixeira(); ap.render(true); return ap; }
  static atualizar() { const ap = foundry.applications.instances?.get?.("nauren-lixeira"); if (ap?.rendered) ap.render(); }
  async _renderHTML() {
    const itens = [];
    for (const p of lixeiraPacks()) {
      const idx = await p.getIndex({ fields: [`flags.${SIS}.lixeira`, "img", "type"] });
      for (const x of idx) itens.push({ pack: p.collection, tipo: p.documentName, id: x._id, nome: x.name, img: x.img, info: x.flags?.[SIS]?.lixeira ?? {} });
    }
    const lotes = new Map();
    for (const it of itens) { const k = it.info.lote ?? it.id; if (!lotes.has(k)) lotes.set(k, []); lotes.get(k).push(it); }
    const ordem = [...lotes].sort((a, b) => (b[1][0].info.em ?? 0) - (a[1][0].info.em ?? 0));
    let dias = 30; try { dias = Number(game.settings.get(SIS, "lixeiraDias")) || 30; } catch (err) { /* padrão */ }
    const quando = t => t ? new Date(t).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";
    const div = document.createElement("div"); div.className = "nauren-org-lix";
    div.innerHTML = !ordem.length ? `<p class="nauren-org-vazio"><i class="fa-solid fa-trash-can"></i><br>A Lixeira está vazia.</p>` : `
      <p class="nauren-org-nota">O que foi excluído pelo Organizador fica aqui por ${dias} dias. Restaurar devolve para a mesma pasta (ou recria a pasta).</p>
      ${ordem.map(([lote, lista]) => `<section class="nauren-org-lote">
        <header><span><b>${quando(lista[0].info.em)}</b> · ${plural(lista.length, "item", "itens")} · ${esc(rotuloTipo(lista[0].tipo))}${lista[0].info.por ? ` · ${esc(lista[0].info.por)}` : ""}</span>
          <button type="button" data-action="restaurarLote" data-lote="${esc(lote)}"><i class="fa-solid fa-rotate-left"></i> Restaurar tudo</button></header>
        <ul>${lista.map(it => `<li><img src="${esc(it.img || "icons/svg/mystery-man.svg")}" alt=""><span>${esc(it.nome)}${it.info.pasta?.caminho?.length ? `<small>${esc(it.info.pasta.caminho.join(" › "))}</small>` : ""}</span>
          <button type="button" data-action="restaurarItem" data-pack="${esc(it.pack)}" data-id="${esc(it.id)}" data-tooltip="Restaurar" aria-label="Restaurar"><i class="fa-solid fa-rotate-left"></i></button>
          <button type="button" data-action="apagarItem" data-pack="${esc(it.pack)}" data-id="${esc(it.id)}" data-tooltip="Apagar de vez" aria-label="Apagar de vez"><i class="fa-solid fa-xmark"></i></button></li>`).join("")}</ul>
      </section>`).join("")}
      <footer><button type="button" data-action="esvaziar" class="nauren-org-perigo"><i class="fa-solid fa-dumpster"></i> Esvaziar a Lixeira</button></footer>`;
    return div;
  }
  _replaceHTML(result, content) { content.replaceChildren(result); }
}

/* ============================== ligar ============================== */
export function naurenOrganizadorInit() {
  game.settings.register(SIS, "lixeiraDias", {
    name: "Lixeira: dias guardados", hint: "Quanto tempo o que foi excluído pelo Organizador fica na Lixeira antes de ser apagado de vez.",
    scope: "world", config: true, type: Number, default: 30, range: { min: 1, max: 365, step: 1 }
  });
  Hooks.on("renderDocumentDirectory", (app, html) => { try { montar(app, html); } catch (err) { console.warn("Nauren RPG | Organizador", err); } });
  // trocar de aba limpa a seleção das outras listas
  Hooks.on("changeSidebarTab", tab => { for (const [k, e] of ESTADOS) if (!k.startsWith("pack:") && k !== tab?.documentName) { e.sel.clear(); e.pastas.clear(); } });
  Hooks.on("closeCompendium", app => { ESTADOS.delete(chaveDe(app)); });
  // arrastar o grupo de atores para o mapa: todos viram tokens em volta do ponto
  Hooks.on("dropCanvasData", (cnv, data) => {
    const l = LOTE;
    if (!l || l.documentName !== "Actor" || !data?.uuid || !l.uuids.includes(data.uuid) || l.pack) return;
    LOTE = null;
    const app = ui.actors;
    colocarNaCena(app, { x: data.x, y: data.y, ids: l.ids }).catch(err => console.error("Nauren RPG | Organizador:", err));
    return false;
  });
  document.addEventListener("keydown", ev => {
    if (ev.key !== "Escape" || MENU || ev.target?.closest?.("input, textarea, select, [contenteditable]")) return;
    let mexeu = false;
    for (const e of ESTADOS.values()) if (total(e)) { e.sel.clear(); e.pastas.clear(); mexeu = true; }
    if (mexeu) for (const app of [ui.actors, ui.items, ui.scenes, ui.journal, ui.tables, ui.cards, ui.playlists, ui.macros, ...(foundry.applications.instances?.values?.() ?? [])]) {
      if (app?.documentName && app.rendered) redesenhar(app);
    }
  });
  Hooks.once("ready", () => { lixeiraLimparVelhos(); });
  // dono na lista: troca de personagem principal, cor, nome do jogador ou entrou/saiu
  Hooks.on("updateUser", (u, mudou) => { if (["character", "color", "name", "role"].some(k => k in (mudou ?? {}))) atualizarListasAbertas(); });
  Hooks.on("userConnected", () => atualizarListasAbertas());
}
