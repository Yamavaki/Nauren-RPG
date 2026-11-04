/* Nauren RPG — Seletor de ícones (0.102.1).
 * Catálogo completo dos ícones Font Awesome que o próprio Foundry carrega (lidos das folhas de estilo),
 * com busca (em português ou inglês), sugeridos para RPG e "sem ícone". Só entram os ícones que desenham
 * com o estilo sólido ("fas"), então nada fica em branco.
 * Uso: await naurenEscolherIcone({ atual, titulo }) → "fa-nome", "" (sem ícone) ou null (cancelou).
 *      naurenLigarSeletorIcones(raiz) → todo input [data-seletor-icone] (e os campos de ícone dos recursos)
 *      ganha o botão do seletor ao lado. */
import { naurenKitSistema } from "./janelas-kit.mjs";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
const UTIL = new Set(["fw", "spin", "spin-pulse", "spin-reverse", "pulse", "beat", "beat-fade", "fade", "bounce", "flip", "shake", "border", "inverse", "li", "ul", "lg", "sm", "xs", "2xs", "xl", "2xl", "1x", "2x", "3x", "4x", "5x", "6x", "7x", "8x", "9x", "10x",
  "stack", "stack-1x", "stack-2x", "rotate-90", "rotate-180", "rotate-270", "rotate-by", "flip-horizontal", "flip-vertical", "flip-both", "pull-left", "pull-right", "pull-start", "pull-end", "sr-only", "sr-only-focusable", "swap-opacity", "width-auto", "width-fixed",
  "solid", "regular", "brands", "light", "thin", "duotone", "sharp", "classic", "kit", "kit-duotone", "layers", "layers-text", "layers-counter", "layers-bottom-left", "layers-bottom-right", "layers-top-left", "layers-top-right"]);
// Sugeridos para RPG (os que existirem na instalação aparecem primeiro).
const SUGERIDOS = ["crown", "gem", "star", "shield-halved", "shield", "dragon", "khanda", "hat-wizard", "wand-sparkles", "wand-magic-sparkles", "fire", "fire-flame-curved", "snowflake", "bolt", "skull", "skull-crossbones", "heart", "heart-pulse",
  "moon", "sun", "feather", "feather-pointed", "scroll", "book", "book-skull", "flask", "flask-vial", "vial", "ring", "dungeon", "chess-rook", "chess-knight", "chess-queen", "hammer", "gavel", "bow-arrow", "crosshairs", "bullseye", "droplet", "eye",
  "ghost", "spider", "paw", "dove", "leaf", "seedling", "tree", "mountain", "water", "wind", "tornado", "meteor", "atom", "infinity", "hand-fist", "hand-sparkles", "hourglass", "key", "lock", "coins", "sack-dollar", "gift", "compass", "map", "anchor",
  "bone", "bolt-lightning", "burst", "explosion", "circle-radiation", "biohazard", "yin-yang", "om", "ankh", "cross", "hamsa", "eye-slash", "mask", "gears", "gear", "cog", "screwdriver-wrench", "bomb", "dice-d20", "dice-d6", "dice"];
// Busca em português: cada palavra procura também estes termos em inglês.
const PT = {
  espada: "sword khanda dagger blade", adaga: "dagger khanda", escudo: "shield", coroa: "crown", rei: "crown chess-king", rainha: "chess-queen crown", fogo: "fire flame burn", chama: "fire flame", gelo: "snowflake icicles ice", neve: "snowflake", raio: "bolt lightning",
  trovao: "bolt lightning cloud", coracao: "heart", vida: "heart", cura: "heart kit-medical plus", caveira: "skull", morte: "skull skull-crossbones ghost", olho: "eye", visao: "eye", gema: "gem", joia: "gem ring", cristal: "gem", diamante: "gem", estrela: "star",
  dragao: "dragon", livro: "book", grimorio: "book", pergaminho: "scroll", pocao: "flask vial", frasco: "flask vial", lua: "moon", sol: "sun", flecha: "arrow bow", arco: "bow-arrow bow", machado: "axe", martelo: "hammer gavel", mao: "hand", punho: "hand-fist",
  chave: "key", cadeado: "lock", moeda: "coins money", dinheiro: "coins money sack-dollar", ouro: "coins", sangue: "droplet", gota: "droplet water", veneno: "skull-crossbones flask vial biohazard", magia: "wand sparkles hat-wizard", varinha: "wand",
  mago: "hat-wizard", fantasma: "ghost", aranha: "spider", animal: "paw dog cat horse", pata: "paw", lobo: "paw", passaro: "dove crow feather", pena: "feather", folha: "leaf", arvore: "tree", planta: "seedling leaf", natureza: "leaf tree seedling",
  montanha: "mountain", agua: "water droplet", vento: "wind", tempestade: "tornado cloud-bolt", meteoro: "meteor", tempo: "hourglass clock", relogio: "clock hourglass", presente: "gift", mapa: "map", bussola: "compass", ancora: "anchor", osso: "bone",
  explosao: "burst explosion bomb", bomba: "bomb", dado: "dice", engrenagem: "gear gears cog", ferramenta: "screwdriver-wrench wrench hammer", mascara: "mask", torre: "chess-rook tower", castelo: "chess-rook dungeon fort", porta: "door dungeon",
  bau: "box chest", caixa: "box", tocha: "fire torch", luz: "lightbulb sun", escuro: "moon eye-slash", sombra: "ghost moon mask", musica: "music guitar", som: "volume music", alvo: "crosshairs bullseye", mira: "crosshairs", velocidade: "bolt gauge",
  corrida: "person-running", correr: "person-running", forca: "dumbbell hand-fist", defesa: "shield", ataque: "khanda crosshairs", armadura: "shield", anel: "ring", bota: "shoe-prints", sapato: "shoe-prints", capa: "mask", cavalo: "horse chess-knight"
};
const semAcento = s => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
let cache = null;
function charDoValor(v) {
  const t = String(v ?? "").trim().replace(/^["']|["']$/g, "");
  if (!t) return "";
  const m = /^\\([0-9a-f]{1,6})\s?/i.exec(t);
  if (m) return String.fromCodePoint(parseInt(m[1], 16));
  return [...t][0] ?? "";
}
/** Todos os ícones sólidos que esta instalação desenha: [{ nome, apelidos: [] }]. */
export function naurenListaIcones() {
  if (cache) return cache;
  const porGlifo = new Map();
  let emMarcas = false;
  const visitar = regras => {
    for (const r of regras ?? []) {
      if (r.cssRules && !r.selectorText) { visitar(r.cssRules); continue; }
      const sel = r.selectorText;
      if (!sel || !sel.includes(".fa")) continue;
      // Bloco das marcas (github, discord…): começa na regra que troca a família para "brands" e termina na próxima família.
      const marcaSel = /\.fa-brands\b|\.fab\b/.test(sel), normalSel = /\.fa-(solid|regular|light|thin)\b|\.fa[srlt]\b/.test(sel);
      const trocaFamilia = /--fa-family|--fa-style-family|font-family|font-weight/.test(r.cssText ?? "");
      if (trocaFamilia && marcaSel && !normalSel) { emMarcas = true; continue; }
      if (trocaFamilia && normalSel && !marcaSel) { emMarcas = false; continue; }
      if (emMarcas) continue;
      const cont = r.style?.getPropertyValue("--fa") || (/::?before/.test(sel) ? r.style?.getPropertyValue("content") : "");
      const ch = charDoValor(cont);
      if (!ch || ch === "\u0000") continue;
      for (const parte of sel.split(",")) {
        const m = /^\s*\.fa-([a-z0-9-]+)(?:::?before)?\s*$/.exec(parte);
        if (!m || UTIL.has(m[1])) continue;
        const e = porGlifo.get(ch);
        if (!e) porGlifo.set(ch, { nome: m[1], apelidos: [], ch });
        else if (e.nome !== m[1] && !e.apelidos.includes(m[1])) e.apelidos.push(m[1]);
      }
    }
  };
  for (const ss of document.styleSheets) { emMarcas = false; let regras = null; try { regras = ss.cssRules; } catch (err) { regras = null; } if (regras) visitar(regras); }
  let lista = [...porGlifo.values()];
  // Tira os que o estilo sólido não desenha (marcas e afins): mede o glifo na fonte dos ícones e na fonte reserva.
  try {
    const i = document.createElement("i"); i.className = "fas fa-star"; i.style.cssText = "position:absolute;left:-9999px;top:0"; document.body.append(i);
    const cs = getComputedStyle(i, "::before"); const fam = cs.fontFamily, peso = cs.fontWeight || "900"; i.remove();
    if (fam && !/^\s*(serif|sans-serif|monospace)\s*$/i.test(fam)) {
      const ctx = document.createElement("canvas").getContext("2d");
      const medir = (fonte, ch) => { ctx.font = fonte; return ctx.measureText(ch).width; };
      const desenha = lista.filter(x => Math.abs(medir(`${peso} 32px ${fam}, monospace`, x.ch) - medir(`${peso} 32px monospace`, x.ch)) > 0.01);
      // Fonte ainda não carregada (quase nada "desenha"): melhor mostrar tudo do que nada.
      if (desenha.length > lista.length * 0.2) lista = desenha;
    }
  } catch (err) { /* sem medir: fica a lista toda */ }
  lista.sort((a, b) => a.nome.localeCompare(b.nome));
  if (!lista.length) lista = SUGERIDOS.map(n => ({ nome: n, apelidos: [] }));
  cache = lista;
  return lista;
}
function termos(q) {
  const base = semAcento(q).replace(/^fa-/, "");
  if (!base) return [];
  return base.split(/\s+/).map(p => [p, ...(PT[p] ? PT[p].split(" ") : [])]);
}
/** Janela "Escolher ícone". Devolve "fa-nome", "" (sem ícone) ou null. */
export async function naurenEscolherIcone({ atual = "", titulo = "Escolher ícone", ator = null } = {}) {
  const lista = naurenListaIcones();
  const atualN = String(atual ?? "").replace(/^(fas|fa-solid)\s+/, "").replace(/^fa-/, "").trim();
  const existe = new Set(lista.map(x => x.nome));
  const sug = SUGERIDOS.filter(n => existe.has(n)).filter((n, k, a) => a.indexOf(n) === k).slice(0, 36);
  const bt = x => `<button type="button" class="nt-icone${x.nome === atualN ? " on" : ""}" data-icone="${esc(x.nome)}" data-busca="${esc([x.nome, ...x.apelidos].join(" ").replace(/-/g, " "))}" title="${esc(x.nome)}"><i class="fas fa-${esc(x.nome)}"></i></button>`;
  const content = `<div class="nt-icones">
    <div class="nt-icones-topo">
      <label class="nt-busca nt-ch"><i class="fas fa-magnifying-glass"></i><input type="text" placeholder="Procurar: espada, fogo, coroa, gem, skull…" autocomplete="off" spellcheck="false"></label>
      <button type="button" class="nt-bt nt-ch" data-icone="" title="Tirar o ícone"><i class="fas fa-ban"></i> Sem ícone</button>
    </div>
    <div class="nt-icones-lista" data-rola="icones">
      <p class="nt-icones-g" data-grupo="sug">Sugeridos</p>
      <div class="nt-icones-grade" data-grade="sug">${sug.map(n => bt(lista.find(x => x.nome === n))).join("")}</div>
      <p class="nt-icones-g" data-grupo="todos">Todos <small>${lista.length} ícones</small></p>
      <div class="nt-icones-grade" data-grade="todos">${lista.map(bt).join("")}</div>
      <p class="nt-icones-vazio" hidden>Nenhum ícone com esse nome. Tente em inglês (ex.: “sword”, “fire”, “crown”).</p>
    </div>
    <div class="nt-icones-rodape"><span class="nt-icones-ver"><i class="fas fa-${esc(atualN || "ban")}"></i><b>${esc(atualN ? `fa-${atualN}` : "sem ícone")}</b></span><small>Clique para escolher · Enter escolhe o primeiro da busca</small></div>
  </div>`;
  let escolhido = null;
  await foundry.applications.api.DialogV2.wait({
    ...naurenKitSistema(), ...(ator ? { naurenAtorUuid: ator.uuid } : {}), classes: ["nauren-kit", "nt-icones-janela"], position: { width: 620 },
    window: { title: titulo, icon: "fas fa-icons" }, content, rejectClose: false,
    buttons: [{ action: "fechar", label: "Cancelar" }],
    render: (ev, dlg) => {
      const raiz = dlg.element ?? ev?.target?.element;
      if (!raiz) return;
      const busca = raiz.querySelector(".nt-icones-topo input");
      const ver = raiz.querySelector(".nt-icones-ver");
      const botoes = [...raiz.querySelectorAll(".nt-icone")];
      const mostrar = nome => { if (ver) ver.innerHTML = `<i class="fas fa-${esc(nome || "ban")}"></i><b>${esc(nome ? `fa-${nome}` : "sem ícone")}</b>`; };
      const filtrar = () => {
        const t = termos(busca.value);
        const sugG = raiz.querySelector('[data-grade="sug"]'), sugT = raiz.querySelector('[data-grupo="sug"]');
        sugG.hidden = sugT.hidden = t.length > 0;
        let n = 0;
        raiz.querySelectorAll('[data-grade="todos"] .nt-icone').forEach(b => { const ok = !t.length || t.every(alt => alt.some(p => b.dataset.busca.includes(p))); b.hidden = !ok; if (ok) n++; });
        raiz.querySelector(".nt-icones-vazio").hidden = n > 0;
        const g = raiz.querySelector('[data-grupo="todos"] small'); if (g) g.textContent = t.length ? `${n} encontrados` : `${lista.length} ícones`;
      };
      let tempo = null;
      busca?.addEventListener("input", () => { clearTimeout(tempo); tempo = setTimeout(filtrar, 90); });
      busca?.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); filtrar(); const p = raiz.querySelector('[data-grade="todos"] .nt-icone:not([hidden])'); if (p) { escolhido = p.dataset.icone; dlg.close(); } } });
      raiz.querySelectorAll("[data-icone]").forEach(b => {
        b.addEventListener("click", () => { escolhido = b.dataset.icone; dlg.close(); });
        b.addEventListener("mouseenter", () => mostrar(b.dataset.icone));
        b.addEventListener("focus", () => mostrar(b.dataset.icone));
      });
      raiz.querySelector(".nt-icones-lista")?.addEventListener("mouseleave", () => mostrar(atualN));
      setTimeout(() => { busca?.focus(); raiz.querySelector(".nt-icone.on")?.scrollIntoView?.({ block: "center" }); }, 30);
      void botoes;
    }
  }).catch(() => null);
  if (escolhido === null) return null;
  return escolhido ? `fa-${escolhido}` : "";
}
/** Campos de ícone (texto "fa-…"): ganham o botão do seletor; escolher grava no campo e dispara "change". */
export function naurenLigarSeletorIcones(raiz) {
  if (!raiz) return;
  raiz.querySelectorAll("input[data-seletor-icone], input.nauren-subclasse-recurso-icone-input").forEach(inp => {
    if (inp.dataset.ntIcone || inp.disabled) return;
    inp.dataset.ntIcone = "1";
    const b = document.createElement("button");
    b.type = "button"; b.className = "nt-icone-campo"; b.title = "Escolher ícone";
    const vis = () => { const v = String(inp.value ?? "").trim(); b.innerHTML = `<i class="fas ${esc(v && /^fa-[\w-]+$/.test(v.replace(/^(fas|fa-solid)\s+/, "")) ? v.replace(/^(fas|fa-solid)\s+/, "") : "fa-icons")}"></i>`; };
    vis();
    inp.insertAdjacentElement("beforebegin", b);
    // O ícone de prévia que já existia ao lado do campo fica redundante.
    const prev = inp.nextElementSibling;
    if (prev?.tagName === "I" && /\bfa-/.test(prev.className)) { b.style.color = prev.style.color; prev.hidden = true; prev.style.display = "none"; }
    inp.classList.add("nt-icone-texto");
    inp.addEventListener("input", vis);
    b.addEventListener("click", async ev => {
      ev.preventDefault(); ev.stopPropagation();
      const v = await naurenEscolherIcone({ atual: inp.value });
      if (v === null) return;
      inp.value = v; vis();
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      inp.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
}
