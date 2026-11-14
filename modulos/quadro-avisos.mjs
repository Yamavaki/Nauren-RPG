/**
 * Nauren RPG — Quadro de avisos (0.115): o terceiro modo do Armazenamento.
 *
 * O quadro guarda Escritos e os mostra pregados, com a miniatura de verdade de cada um (o mesmo desenho do leitor).
 * Clicar abre o escrito grande; o jogador pode arrancar (leva o original e ele sai do quadro para todos).
 * O Mestre arrasta Escritos para pregar, move as notas, gira, troca o alfinete e a categoria.
 *
 * Posição e visual de cada nota ficam na própria nota: flags.nauren.quadro { x, y (em % do quadro), rot, z, pino, cat }.
 * Este módulo só monta o quadro e liga os controles; as trocas (arrancar/pregar) são feitas pelo armazenamento.mjs
 * (pedido ao Mestre), que passa as funções para cá — assim não há importação circular.
 */
import { naurenEhEscrito, naurenEscritoDe, naurenEscritoMiniHtml } from "./escritos.mjs";
import { NAUREN_CARTAZ_TIPOS } from "./escritos-formatos.mjs";

const SIS = "nauren";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));

export const NAUREN_QUADRO_ESTILOS = {
  medieval: { rot: "Medieval", dica: "Moldura de madeira, tábuas e placa", pino: "prego" },
  moderno: { rot: "Moderno", dica: "Mural de cortiça com tachinhas", pino: "tacha" },
  cyberpunk: { rot: "Cyberpunk", dica: "Painel de tela com grade e neon", pino: "nenhum" },
  imagem: { rot: "Imagem própria", dica: "Uma imagem sua de fundo (ex.: do Dungeondraft)", pino: "prego" }
};
export const NAUREN_QUADRO_CATEGORIAS = { procurados: "Procurados", missoes: "Missões", avisos: "Avisos", recompensas: "Recompensas", eventos: "Eventos" };
export const NAUREN_QUADRO_PINOS = { prego: "Prego", tacha: "Tachinha", fita: "Fita adesiva", punhal: "Punhal", nenhum: "Nenhum" };
const CORES_TACHA = ["#d23b3b", "#2f7de0", "#2fae54", "#e0b257", "#a24fd6"];

/** Categorias do quadro: as fixas e as que o Mestre criou. [[id, rótulo]] */
export function naurenQuadroCategorias(armazem) {
  const extra = (armazem?.system?.quadro?.categorias ?? []).map(x => String(x).trim()).filter(Boolean);
  return [...Object.entries(NAUREN_QUADRO_CATEGORIAS), ...extra.filter(x => !Object.values(NAUREN_QUADRO_CATEGORIAS).includes(x)).map(x => [x, x])];
}
/** Um número estável a partir do id (para inclinação e posição automáticas). */
function semente(id) { let h = 2166136261; for (const c of String(id)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
/** Como a nota está no quadro (com valores automáticos para quem ainda não foi arrumado). */
export function naurenQuadroNota(item, indice = 0, estilo = "medieval") {
  const f = item?.flags?.[SIS]?.quadro ?? {};
  const e = naurenEscritoDe(item);
  const r = semente(item?.id ?? indice);
  const col = indice % 5, lin = Math.floor(indice / 5) % 3;
  const cat = f.cat || (e?.formato === "cartaz" ? NAUREN_CARTAZ_TIPOS[e.cartaz.tipo]?.cat : null) || "avisos";
  const pino = NAUREN_QUADRO_PINOS[f.pino] ? f.pino : (NAUREN_QUADRO_ESTILOS[estilo]?.pino ?? "prego");
  return {
    x: Number.isFinite(Number(f.x)) ? Math.max(-5, Math.min(95, Number(f.x))) : 3 + col * 19 + r * 3,
    y: Number.isFinite(Number(f.y)) ? Math.max(-5, Math.min(92, Number(f.y))) : 6 + lin * 31 + r * 4,
    rot: Number.isFinite(Number(f.rot)) ? Math.max(-25, Math.min(25, Number(f.rot))) : Math.round((r - 0.5) * 9),
    z: Math.max(1, Math.round(Number(f.z) || 1 + indice)),
    pino, cor: /^#[0-9a-f]{6}$/i.test(f.cor ?? "") ? f.cor : CORES_TACHA[Math.floor(r * CORES_TACHA.length)],
    cat
  };
}
/** Notas do quadro que esta pessoa vê, na ordem das camadas. */
export function naurenQuadroNotas(armazem, { mestre = false } = {}) {
  const estilo = armazem.system?.quadro?.estilo ?? "medieval";
  const todos = [...(armazem.items ?? [])].filter(i => naurenEhEscrito(i));
  return todos.map((item, i) => ({ item, ...naurenQuadroNota(item, i, estilo), oculta: !!item.flags?.[SIS]?.armazem?.oculto }))
    .filter(n => mestre || !n.oculta)
    .sort((a, b) => a.z - b.z);
}
/** Onde pregar uma nota nova (ponto do clique, ou um canto livre). */
export function naurenQuadroNovaNota(armazem, pos = null, item = null) {
  const notas = naurenQuadroNotas(armazem, { mestre: true });
  const z = Math.max(0, ...notas.map(n => n.z)) + 1;
  const e = item ? naurenEscritoDe(item) : null;
  const cat = e?.formato === "cartaz" ? NAUREN_CARTAZ_TIPOS[e.cartaz.tipo]?.cat : undefined;
  const r = Math.random();
  let x = pos?.x, y = pos?.y;
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    // o primeiro lugar da grade 5×3 que não tem nota perto
    const livres = [];
    for (let lin = 0; lin < 3; lin++) for (let col = 0; col < 5; col++) { const cx = 3 + col * 19, cy = 6 + lin * 31; if (!notas.some(n => Math.abs(n.x - cx) < 10 && Math.abs(n.y - cy) < 15)) livres.push([cx, cy]); }
    [x, y] = livres[0] ?? [10 + r * 70, 10 + r * 60];
  }
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, rot: Math.round((r - 0.5) * 8), z, ...(cat ? { cat } : {}) };
}

/* ---------------- lidas ("Nova") ---------------- */
function lidas(armazem) {
  const deFlag = game.user?.flags?.[SIS]?.quadroLidas?.[armazem.id];
  if (Array.isArray(deFlag)) return new Set(deFlag);
  try { return new Set(JSON.parse(localStorage.getItem(`nauren.quadroLidas.${armazem.id}`) ?? "[]")); } catch (err) { return new Set(); }
}
export async function naurenQuadroMarcarLida(armazem, itemId) {
  if (game.user?.isGM) return;
  const l = lidas(armazem); if (l.has(itemId)) return;
  l.add(itemId);
  const ids = [...l].filter(id => armazem.items.get(id)); // só as que ainda estão no quadro
  try { localStorage.setItem(`nauren.quadroLidas.${armazem.id}`, JSON.stringify(ids)); } catch (err) { /* sem armazenamento */ }
  try { await game.user.update({ [`flags.${SIS}.quadroLidas.${armazem.id}`]: ids }); } catch (err) { /* fica só nesta tela */ }
}

/* ---------------- HTML ---------------- */
function pinoHtml(n) {
  if (n.pino === "nenhum") return "";
  return `<span class="nq-pino nq-pino-${n.pino}" style="--pino:${esc(n.cor)}"></span>`;
}
/**
 * O quadro. estado: { cat } (filtro). mestre: mostra as ocultas, a barrinha de cada nota e a dica de arrastar.
 */
export function naurenQuadroHtml(armazem, estado = {}, { mestre = false, podePregar = false } = {}) {
  const q = armazem.system?.quadro ?? {};
  const estilo = NAUREN_QUADRO_ESTILOS[q.estilo] ? q.estilo : "medieval";
  const notas = naurenQuadroNotas(armazem, { mestre });
  const cats = naurenQuadroCategorias(armazem);
  const cat = estado.cat && (estado.cat === "todas" || cats.some(([k]) => k === estado.cat)) ? estado.cat : "todas";
  const vistas = mestre ? new Set(notas.map(n => n.item.id)) : lidas(armazem);
  const novas = notas.filter(n => !vistas.has(n.item.id)).length;
  const conta = k => notas.filter(n => n.cat === k).length;
  const chips = [["todas", "Todas", notas.length], ...cats.map(([k, r]) => [k, r, conta(k)]).filter(([k, , c]) => c || NAUREN_QUADRO_CATEGORIAS[k])]
    .map(([k, r, c]) => `<button type="button" class="nq-chip ${cat === k ? "on" : ""}" data-nq-cat="${esc(k)}">${esc(r)} <small>${c}</small></button>`).join("");
  const opsCat = sel => cats.map(([k, r]) => `<option value="${esc(k)}" ${sel === k ? "selected" : ""}>${esc(r)}</option>`).join("");
  const notasHtml = notas.map(n => {
    const nova = !vistas.has(n.item.id);
    const barra = mestre ? `<div class="nq-ferr" data-nq-ferr>
        <button type="button" data-nq-acao="girar" data-d="-4" title="Girar para a esquerda"><i class="fas fa-rotate-left"></i></button>
        <button type="button" data-nq-acao="girar" data-d="4" title="Girar para a direita"><i class="fas fa-rotate-right"></i></button>
        <button type="button" data-nq-acao="pino" title="Trocar o alfinete (${esc(NAUREN_QUADRO_PINOS[n.pino])})"><i class="fas fa-thumbtack"></i></button>
        <select data-nq-acao="cat" title="Categoria">${opsCat(n.cat)}</select>
        <button type="button" data-nq-acao="oculta" title="${n.oculta ? "Escondida dos jogadores (clique para mostrar)" : "Esconder dos jogadores"}"><i class="fas ${n.oculta ? "fa-eye-slash" : "fa-eye"}"></i></button>
        <button type="button" data-nq-acao="abrirItem" title="Abrir a ficha do item"><i class="fas fa-pen"></i></button>
        <button type="button" data-nq-acao="tirar" title="Tirar do quadro (apaga a nota)"><i class="fas fa-trash"></i></button>
      </div>` : "";
    return `<div class="nq-nota ${nova ? "nq-nova" : ""} ${n.oculta ? "nq-oculta" : ""} ${cat !== "todas" && n.cat !== cat ? "nq-fora" : ""}" data-nq-nota="${n.item.id}" tabindex="0" role="button"
        style="left:${n.x}%;top:${n.y}%;--rot:${n.rot}deg;z-index:${n.z}" title="${esc(n.item.name)}">
      ${pinoHtml(n)}${naurenEscritoMiniHtml(n.item)}
      ${nova ? `<span class="nq-selo-nova">NOVA</span>` : ""}${barra}
    </div>`;
  }).join("");
  const fundo = estilo === "imagem" && q.imagem ? `style="background-image:url('${esc(q.imagem)}')"` : "";
  const placa = estilo === "medieval" && q.placa ? `<div class="nq-placa">${esc(q.placa)}</div>` : "";
  const letreiro = estilo === "cyberpunk" && q.letreiro ? `<div class="nq-letreiro"><div class="nq-letreiro-txt">${q.letreiro.split("|").map(t => `<span>▸ ${esc(t.trim())}</span>`).join("")}${q.letreiro.split("|").map(t => `<span aria-hidden="true">▸ ${esc(t.trim())}</span>`).join("")}</div></div>` : "";
  const dica = mestre ? `<div class="nq-dica-solta"><i class="fas fa-plus"></i> Arraste um Escrito para pregar aqui</div>` : podePregar ? `<div class="nq-dica-solta"><i class="fas fa-plus"></i> Arraste um escrito seu para pregar aqui</div>` : "";
  return `<div class="nq ${mestre ? "nq-mestre" : ""}">
    <div class="nq-filtros">${chips}<span class="nq-esp"></span>${!mestre && novas ? `<span class="nq-novas">${novas} ${novas === 1 ? "nova" : "novas"} para você</span>` : ""}
      <span class="nq-zoom" title="Zoom: Ctrl + roda do mouse · arraste o fundo para andar pelo quadro"><button type="button" data-nq-zoom="-1" title="Afastar"><i class="fas fa-magnifying-glass-minus"></i></button><button type="button" data-nq-zoom="0" data-nq-zoom-rot title="Voltar a 100%">${Math.round((estado.zoom ?? 1) * 100)}%</button><button type="button" data-nq-zoom="1" title="Aproximar"><i class="fas fa-magnifying-glass-plus"></i></button></span></div>
    <div class="nq-area" data-rola="quadro" style="--nq-zoom:${estado.zoom ?? 1}"><div class="nq-moldura nq-estilo-${estilo} ${placa ? "nq-com-placa" : ""} ${letreiro ? "nq-com-letreiro" : ""}" ${fundo}>${placa}
      <div class="nq-quadro" data-nq-quadro>${letreiro}${notasHtml || `<p class="nq-vazio">${mestre ? "Quadro vazio. Arraste Escritos (notas, cartazes…) para cá." : "Nada pregado no quadro."}</p>`}${dica}</div>
    </div></div>
  </div>`;
}

/** Posição (em %) de um evento de mouse dentro do quadro, já descontando o meio da nota. */
export function naurenQuadroPosDoEvento(ev, el) {
  const q = el?.querySelector?.("[data-nq-quadro]"); if (!q) return null;
  const r = q.getBoundingClientRect(); if (!r.width || !r.height) return null;
  const x = ((ev.clientX - r.left) / r.width) * 100 - 8, y = ((ev.clientY - r.top) / r.height) * 100 - 6;
  if (x < -10 || x > 100 || y < -10 || y > 100) return null;
  return { x: Math.max(-2, Math.min(90, x)), y: Math.max(-2, Math.min(85, y)) };
}

/**
 * Liga o quadro já desenhado em `el`.
 * op: { armazem, estado, mestre, render(), abrir(item) — abre o leitor com o "Arrancar" }
 */
export function naurenQuadroLigar(el, op) {
  const { armazem, estado, mestre } = op;
  el.querySelectorAll("[data-nq-cat]").forEach(b => b.addEventListener("click", ev => { ev.preventDefault(); estado.cat = b.dataset.nqCat; op.render(); }));
  const quadro = el.querySelector("[data-nq-quadro]"); if (!quadro) return;
  // 0.116.1: zoom (botões ou Ctrl + roda do mouse, no ponto do mouse) e arrastar o fundo para andar
  const area = el.querySelector(".nq-area");
  const zoom = (z, foco = null) => {
    const antes = estado.zoom ?? 1, novo = Math.round(Math.max(1, Math.min(3, z)) * 100) / 100;
    if (!area || novo === antes) return;
    const r = area.getBoundingClientRect();
    const fx = foco ? foco.x - r.left : r.width / 2, fy = foco ? foco.y - r.top : r.height / 2;
    const px = (area.scrollLeft + fx) / antes, py = (area.scrollTop + fy) / antes;
    estado.zoom = novo; area.style.setProperty("--nq-zoom", novo);
    const rot = el.querySelector("[data-nq-zoom-rot]"); if (rot) rot.textContent = `${Math.round(novo * 100)}%`;
    area.scrollLeft = px * novo - fx; area.scrollTop = py * novo - fy;
  };
  el.querySelectorAll("[data-nq-zoom]").forEach(b => b.addEventListener("click", ev => { ev.preventDefault(); const d = Number(b.dataset.nqZoom); zoom(d === 0 ? 1 : (estado.zoom ?? 1) + d * 0.25); }));
  area?.addEventListener("wheel", ev => { if (!(ev.ctrlKey || ev.metaKey)) return; ev.preventDefault(); zoom((estado.zoom ?? 1) * (ev.deltaY < 0 ? 1.15 : 1 / 1.15), { x: ev.clientX, y: ev.clientY }); }, { passive: false });
  area?.addEventListener("pointerdown", ev => {
    if (ev.button !== 0 || ev.target.closest("[data-nq-nota], button, select, a")) return;
    if (area.scrollWidth <= area.clientWidth && area.scrollHeight <= area.clientHeight) return;
    const x0 = ev.clientX, y0 = ev.clientY, l0 = area.scrollLeft, t0 = area.scrollTop;
    area.classList.add("nq-arrastando");
    const mover = e2 => { area.scrollLeft = l0 - (e2.clientX - x0); area.scrollTop = t0 - (e2.clientY - y0); };
    const soltar = () => { area.classList.remove("nq-arrastando"); window.removeEventListener("pointermove", mover); window.removeEventListener("pointerup", soltar); };
    window.addEventListener("pointermove", mover); window.addEventListener("pointerup", soltar);
  });
  for (const nota of quadro.querySelectorAll("[data-nq-nota]")) {
    const item = armazem.items.get(nota.dataset.nqNota); if (!item) continue;
    const abrir = () => { naurenQuadroMarcarLida(armazem, item.id); nota.classList.remove("nq-nova"); nota.querySelector(".nq-selo-nova")?.remove(); op.abrir(item); };
    nota.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); abrir(); } });
    // ferramentas do Mestre
    nota.querySelectorAll("[data-nq-acao]").forEach(b => {
      const tipo = b.tagName === "SELECT" ? "change" : "click";
      b.addEventListener("pointerdown", ev => ev.stopPropagation());
      b.addEventListener(tipo, async ev => {
        ev.preventDefault(); ev.stopPropagation();
        const a = b.dataset.nqAcao, atual = naurenQuadroNota(item, 0, armazem.system?.quadro?.estilo);
        const f = { ...(item.flags?.[SIS]?.quadro ?? {}), x: atual.x, y: atual.y, rot: atual.rot, z: atual.z };
        if (a === "girar") return item.update({ [`flags.${SIS}.quadro`]: { ...f, rot: Math.max(-25, Math.min(25, atual.rot + Number(b.dataset.d))) } });
        if (a === "pino") { const ks = Object.keys(NAUREN_QUADRO_PINOS); return item.update({ [`flags.${SIS}.quadro`]: { ...f, pino: ks[(ks.indexOf(atual.pino) + 1) % ks.length] } }); }
        if (a === "cat") return item.update({ [`flags.${SIS}.quadro`]: { ...f, cat: b.value } });
        if (a === "oculta") return item.update({ [`flags.${SIS}.armazem.oculto`]: !item.flags?.[SIS]?.armazem?.oculto });
        if (a === "abrirItem") return item.sheet?.render(true);
        if (a === "tirar") {
          const ok = await foundry.applications.api.DialogV2.confirm({ window: { title: "Tirar do quadro?" }, content: `<p>Apagar <b>${esc(item.name)}</b> do quadro?</p>`, rejectClose: false }).catch(() => false);
          if (ok) await item.delete();
        }
      });
    });
    // clicar abre; o Mestre também arrasta para mover
    nota.addEventListener("pointerdown", ev => {
      if (ev.button !== 0) return;
      if (!mestre) return;
      const r = quadro.getBoundingClientRect();
      const x0 = ev.clientX, y0 = ev.clientY, l0 = parseFloat(nota.style.left), t0 = parseFloat(nota.style.top);
      let movendo = false;
      const mover = e2 => {
        const dx = e2.clientX - x0, dy = e2.clientY - y0;
        if (!movendo && Math.hypot(dx, dy) < 5) return;
        movendo = true; nota.classList.add("nq-movendo");
        nota.style.left = `${Math.max(-5, Math.min(95, l0 + dx / r.width * 100))}%`;
        nota.style.top = `${Math.max(-5, Math.min(92, t0 + dy / r.height * 100))}%`;
      };
      const soltar = async () => {
        window.removeEventListener("pointermove", mover); window.removeEventListener("pointerup", soltar);
        nota.classList.remove("nq-movendo");
        if (!movendo) return abrir();
        const zMax = Math.max(0, ...naurenQuadroNotas(armazem, { mestre: true }).map(n => n.z));
        const atual = naurenQuadroNota(item, 0, armazem.system?.quadro?.estilo);
        await item.update({ [`flags.${SIS}.quadro`]: { ...(item.flags?.[SIS]?.quadro ?? {}), rot: atual.rot, x: Math.round(parseFloat(nota.style.left) * 10) / 10, y: Math.round(parseFloat(nota.style.top) * 10) / 10, z: zMax + 1 } });
      };
      window.addEventListener("pointermove", mover); window.addEventListener("pointerup", soltar);
    });
    if (!mestre) nota.addEventListener("click", ev => { ev.preventDefault(); abrir(); });
  }
}
