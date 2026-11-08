/* Nauren RPG — Armazenamento (baú e loja) — 0.99.
 *
 * - Ator do tipo "armazenamento": os itens ficam dentro dele; a configuração (espaços, quem abre,
 *   tranca, distância, loja) fica em system; preço/estoque/oculto de cada item em flags.nauren.armazem.
 * - Janela do Mestre (ficha do ator): abas Itens, Configurar e Registro.
 * - Janela do jogador: baú (quadrados + detalhe + mochila) ou loja (vitrine + vender).
 * - Toda troca é um pedido ao Mestre ativo (CONFIG.queries + User#query), executado numa fila,
 *   um de cada vez: tira de um lado → cobra → entrega, com devolução se algo falhar, card no chat
 *   e registro (os últimos 200) com desfazer.
 * - Ponto no mapa: comportamento de Região "armazenamento" + ícone clicável desenhado pelo sistema.
 * Só APIs do Foundry V14 (foundry.*).
 */
import { naurenCatalogoDoItem, naurenSeloDoItem } from "./itens-catalogo.mjs";
import { naurenAndarParaRegiao } from "./andares.mjs";
import { naurenAbrirEscrito, naurenEhEscrito, naurenEscritoDe } from "./escritos.mjs";
import { NAUREN_CATEGORIAS_EQUIPAMENTO, NAUREN_QUANTIDADE_MAXIMA, naurenEhMoeda, naurenFormatarNumero, naurenFormatarNumeroCurto, naurenLerNumero, naurenPostarCard } from "../nauren.mjs";

const QUERY = "nauren.armazem";
const QUERY_ABRIR = "nauren.armazemAbrir";
const REGISTRO_MAX = 200;
const ESC = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
const fmt = naurenFormatarNumero;
const TIPOS_ROTULO = { arma: "Arma", armadura: "Armadura", consumivel: "Equipamento", habilidade: "Habilidade", magia: "Magia", efeito: "Efeito", cor: "Pigmento", condicao: "Condição", peculiaridade: "Peculiaridade" };
const FILTROS = [["tudo", "Tudo"], ["arma", "Armas"], ["armadura", "Armaduras"], ["consumivel", "Equipamentos"], ["outro", "Outros"]];
/** Ícones prontos para o ponto no mapa (do próprio Foundry). */
const ICONES = {
  bau: { rotulo: "Baú", img: "icons/containers/chest/chest-reinforced-steel-brown.webp", fa: "fa-box-archive" },
  saco: { rotulo: "Saco", img: "icons/containers/bags/sack-simple-leather-brown.webp", fa: "fa-sack" },
  balcao: { rotulo: "Balcão / loja", img: "icons/environment/settlement/market-stall.webp", fa: "fa-store" },
  cofre: { rotulo: "Cofre", img: "icons/containers/chest/chest-simple-box-steel-grey.webp", fa: "fa-vault" },
  forja: { rotulo: "Forja", img: "icons/tools/smithing/anvil.webp", fa: "fa-hammer" },
  barril: { rotulo: "Barril", img: "icons/containers/barrels/barrel-open-brown-red.webp", fa: "fa-whiskey-glass" }
};

/* ============================ DADOS ============================ */
const F = () => foundry.data.fields;

class NaurenArmazenamentoData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { StringField, NumberField, BooleanField, ArrayField, ObjectField, SchemaField } = F();
    const num = (initial, extra = {}) => new NumberField({ initial, nullable: false, ...extra });
    return {
      modo: new StringField({ initial: "bau", choices: ["bau", "loja"] }),
      frase: new StringField({ initial: "" }),
      // Espaços (um item ou uma pilha ocupa 1).
      espacos: num(12, { min: 1, max: 500, integer: true }),
      semLimite: new BooleanField({ initial: false }),
      maxPilha: num(99, { min: 0, max: NAUREN_QUANTIDADE_MAXIMA, integer: true }), // 0 = sem limite
      // Quem abre e o que pode fazer.
      quemAbre: new StringField({ initial: "todos", choices: ["todos", "escolhidos", "mestre"] }),
      escolhidos: new ArrayField(new StringField()),
      podePegar: new BooleanField({ initial: true }),   // baú: pegar · loja: comprar
      podeGuardar: new BooleanField({ initial: true }), // baú: guardar · loja: vender
      // Tranca e distância.
      trancado: new BooleanField({ initial: false }),
      chave: new StringField({ initial: "" }),          // nome do item que abre
      gastaChave: new BooleanField({ initial: false }),
      exigirDistancia: new BooleanField({ initial: false }),
      distancia: num(1, { min: 0, max: 1000 }),
      // Loja.
      moeda: new StringField({ initial: "Florins" }),
      ajustePreco: num(100, { min: 0, max: 10000, integer: true }),
      compraDeVolta: new BooleanField({ initial: false }),
      pagaPercent: num(50, { min: 0, max: 1000, integer: true }),
      caixa: num(0, { min: 0, max: NAUREN_QUANTIDADE_MAXIMA, integer: true }),
      caixaSemLimite: new BooleanField({ initial: true }),
      registro: new ArrayField(new ObjectField()),
      // Ponto no mapa (vale para todas as Regiões que apontam para este armazenamento).
      mapa: new SchemaField({
        icone: new StringField({ initial: "bau" }),
        imagem: new StringField({ initial: "" }),
        tamanho: num(0.4, { min: 0.2, max: 4 }),     // em quadrados da cena
        rotuloSempre: new BooleanField({ initial: false }),
        soNaVisao: new BooleanField({ initial: true }),
        abrirAoEntrar: new BooleanField({ initial: false })
      })
    };
  }
}

/** Configuração de loja/baú de um item guardado. */
function cfgItem(item) {
  const c = item?.flags?.nauren?.armazem ?? {};
  // 0.102: sem preço na loja, vale o Valor do catálogo do item.
  const semPreco = c.preco === undefined || c.preco === null || c.preco === "";
  return { preco: Math.max(0, Number(semPreco ? naurenCatalogoDoItem(item).valor : c.preco) || 0), estoque: c.estoque === undefined || c.estoque === null ? -1 : Number(c.estoque), oculto: !!c.oculto };
}
function ehPilha(item) { return item?.type === "consumivel"; }
function qtdDe(item) { return ehPilha(item) ? Math.max(0, Number(item.system?.quantidade) || 0) : 1; }
function precoFinal(armazem, item) { return Math.round(cfgItem(item).preco * (Number(armazem.system.ajustePreco) || 0) / 100); }
function precoVenda(armazem, item) { return Math.floor(precoFinal(armazem, item) * (Number(armazem.system.pagaPercent) || 0) / 100); }
function categoriaFiltro(item) { return ["arma", "armadura", "consumivel"].includes(item.type) ? item.type : "outro"; }
function etiquetas(item) {
  const e = [TIPOS_ROTULO[item.type] ?? item.type];
  if (item.type === "consumivel") e.push(NAUREN_CATEGORIAS_EQUIPAMENTO[item.system?.categoria || "consumivel"] ?? "");
  else if (item.type === "arma" && item.system?.categoria) e.push(String(item.system.categoria));
  else if (item.type === "armadura" && item.system?.tipo) e.push(String(item.system.tipo));
  return e.filter(Boolean).slice(0, 2);
}
function textoCurto(html, max = 110) {
  const t = String(html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}
/** Mesma "pilha": mesmo tipo e nome (e mesma categoria, para Equipamento). */
function mesmaPilha(a, b) { return a && b && a.type === b.type && a.name === b.name && ehPilha(a) && a.system?.categoria !== "escrito" && (a.system?.categoria || "consumivel") === (b.system?.categoria || "consumivel"); } // 0.106: dois escritos de mesmo nome não viram pilha

function moedaDoAtor(ator, nomeMoeda) {
  const nome = String(nomeMoeda || "Florins");
  return ator?.items?.find(i => naurenEhMoeda(i) && i.name === nome) ?? null;
}
function saldoDe(ator, nomeMoeda) { return qtdDe(moedaDoAtor(ator, nomeMoeda)); }

/** O usuário é dono do ator? (lê o nível de posse gravado, igual ao Foundry: o do usuário ou o padrão) */
function ehDono(ator, user) {
  if (!ator || !user) return false;
  if (user.isGM) return true;
  const own = ator.ownership ?? ator._source?.ownership ?? {};
  const nivel = own[user.id] ?? own.default ?? 0;
  return Number(nivel) >= 3;
}
/** Pode este usuário abrir? (o Mestre sempre pode) */
function podeAbrir(armazem, user) {
  if (!armazem || !user) return false;
  if (user.isGM) return true;
  const s = armazem.system;
  if (s.quemAbre === "mestre") return false;
  if (s.quemAbre === "escolhidos") return (s.escolhidos ?? []).includes(user.id) || (s.escolhidos ?? []).includes(user.character?.id);
  return true;
}
/** Atores que o usuário pode usar para trocar (personagens dele). */
function atoresDoUsuario(user) {
  const lista = (game.actors?.contents ?? [...(game.actors ?? [])]).filter(a => ["personagem", "npc"].includes(a.type) && (user.isGM ? false : a.testUserPermission?.(user, "OWNER")));
  const ch = user.character;
  if (ch && !lista.includes(ch)) lista.unshift(ch);
  return lista;
}
function atorPadraoDoUsuario(user = game.user) {
  const ctrl = canvas?.tokens?.controlled?.find?.(t => t.actor && ["personagem", "npc"].includes(t.actor.type) && t.actor.testUserPermission?.(user, "OWNER"))?.actor;
  return ctrl ?? user.character ?? atoresDoUsuario(user)[0] ?? null;
}

/* ---------- distância (região ↔ tokens do ator) ---------- */
function retanguloDaRegiao(regiao) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const s of regiao?.shapes ?? []) {
    const t = s.type;
    if (t === "rectangle") { x0 = Math.min(x0, s.x); y0 = Math.min(y0, s.y); x1 = Math.max(x1, s.x + s.width); y1 = Math.max(y1, s.y + s.height); }
    else if (t === "ellipse" || t === "circle") { const rx = s.radiusX ?? s.radius ?? 0, ry = s.radiusY ?? s.radius ?? 0; x0 = Math.min(x0, s.x - rx); y0 = Math.min(y0, s.y - ry); x1 = Math.max(x1, s.x + rx); y1 = Math.max(y1, s.y + ry); }
    else if (Array.isArray(s.points) && s.points.length >= 2) { for (let i = 0; i + 1 < s.points.length; i += 2) { x0 = Math.min(x0, s.points[i]); x1 = Math.max(x1, s.points[i]); y0 = Math.min(y0, s.points[i + 1]); y1 = Math.max(y1, s.points[i + 1]); } }
    else if (Number.isFinite(s.x) && Number.isFinite(s.y)) { x0 = Math.min(x0, s.x); y0 = Math.min(y0, s.y); x1 = Math.max(x1, s.x + (s.width ?? 0)); y1 = Math.max(y1, s.y + (s.height ?? 0)); }
  }
  return Number.isFinite(x0) ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
}
/** Menor distância (em unidades da cena, ex. metros) entre um token do ator e a região. */
function distanciaAtorRegiao(ator, regiao) {
  const cena = regiao?.parent;
  const r = retanguloDaRegiao(regiao);
  if (!cena || !r) return Infinity;
  const g = cena.grid ?? {}, tam = g.size || cena.dimensions?.size || 100, dist = g.distance || 1;
  let melhor = Infinity;
  for (const t of cena.tokens ?? []) {
    if ((t.actorId ?? t.actor?.id) !== ator.id && t.actor?.id !== ator.id) continue;
    const tx0 = t.x, ty0 = t.y, tx1 = t.x + (t.width ?? 1) * tam, ty1 = t.y + (t.height ?? 1) * tam;
    const dx = Math.max(0, r.x - tx1, tx0 - (r.x + r.w)), dy = Math.max(0, r.y - ty1, ty0 - (r.y + r.h));
    melhor = Math.min(melhor, Math.max(dx, dy) / tam * dist);
  }
  return melhor;
}

/* ============================ TROCAS (executadas pelo Mestre) ============================ */
let fila = Promise.resolve();
/** O jogador pede; o Mestre ativo executa. Devolve { ok, msg }. */
async function naurenArmazemPedir(pedido) {
  const gm = game.users?.activeGM;
  if (!gm) return { ok: false, msg: "Sem Mestre conectado: trocas pausadas." };
  if (gm.isSelf || gm === game.user) return naurenArmazemExecutar(pedido, game.user);
  try { return (await gm.query(QUERY, pedido, { timeout: 20000 })) ?? { ok: false, msg: "O Mestre não respondeu." }; }
  catch (err) { return { ok: false, msg: "O Mestre demorou demais para responder (20 s). Tente de novo." }; }
}
function naurenArmazemHandleQuery(pedido, { user } = {}) {
  if (!game.user.isGM || game.users.activeGM !== game.user) return { ok: false, msg: "Este Mestre não é o principal." };
  return naurenArmazemExecutar(pedido, user ?? game.users.get(pedido?.userId));
}
/** Fila: um pedido por vez, na ordem de chegada. */
function naurenArmazemExecutar(pedido, user) {
  const job = fila.then(() => executar(pedido, user)).catch(err => { console.error("Nauren RPG | armazenamento", err); return { ok: false, msg: `Erro: ${err?.message ?? err}` }; });
  fila = job.then(() => null, () => null);
  return job;
}

async function executar(p, user) {
  const armazem = await fromUuid(p?.armazemUuid);
  if (!armazem || armazem.type !== "armazenamento") return { ok: false, msg: "Este armazenamento não existe mais." };
  const ator = p.atorUuid ? await fromUuid(p.atorUuid) : null;
  const s = armazem.system;
  const ehGM = !!user?.isGM;
  // Desfazer (só o Mestre).
  if (p.op === "desfazer") return ehGM ? desfazer(armazem, p.indice) : { ok: false, msg: "Só o Mestre desfaz." };
  if (!ator || ator.documentName !== "Actor") return { ok: false, msg: "Escolha um personagem seu." };
  if (!ehGM && !ehDono(ator, user)) return { ok: false, msg: "Este personagem não é seu." };
  if (!podeAbrir(armazem, user)) return { ok: false, msg: "Você não tem acesso a este armazenamento." };
  // Distância (só quando o Mestre ligou e o pedido veio de um ponto no mapa).
  if (s.exigirDistancia && !ehGM && p.regiaoUuid) {
    const regiao = await fromUuid(p.regiaoUuid);
    if (regiao && distanciaAtorRegiao(ator, regiao) > (Number(s.distancia) || 0) + 0.01) return { ok: false, codigo: "longe", msg: `Longe demais. Chegue a ${fmt(s.distancia)} m com um token seu.` };
  }
  if (p.op === "destrancar") return destrancar(armazem, ator, user);
  if (s.trancado && !ehGM) return { ok: false, codigo: "trancado", msg: "Trancado." };
  const qtd = Math.max(1, Math.min(NAUREN_QUANTIDADE_MAXIMA, Math.trunc(Number(p.qtd) || 1)));
  switch (p.op) {
    case "pegar": return s.modo === "bau" ? pegar(armazem, ator, p.itemId, qtd, user) : { ok: false, msg: "Isto é uma loja." };
    case "guardar": return s.modo === "bau" ? guardar(armazem, ator, p.itemId, qtd, user) : { ok: false, msg: "Isto é uma loja." };
    case "comprar": return s.modo === "loja" ? comprar(armazem, ator, p.itemId, qtd, user) : { ok: false, msg: "Isto é um baú." };
    case "vender": return s.modo === "loja" ? vender(armazem, ator, p.itemId, qtd, user) : { ok: false, msg: "Isto é um baú." };
  }
  return { ok: false, msg: "Pedido desconhecido." };
}

/** Dados de um item para criar uma cópia em outro ator. */
function dadosCopia(item, qtd) {
  const d = item.toObject();
  delete d._id; delete d.folder; delete d.sort; delete d.ownership;
  if (d.flags?.nauren?.armazem) delete d.flags.nauren.armazem;
  if (d.system && "equipado" in d.system) d.system.equipado = false;
  if (ehPilha(item)) d.system.quantidade = qtd;
  return d;
}

/** Entrega qtd de um item a um ator (junta na pilha igual, se houver). Devolve uma função que desfaz. */
async function entregar(ator, dados, qtd, { maxPilha = 0, limiteEspacos = Infinity } = {}) {
  const modelo = { type: dados.type, name: dados.name, system: dados.system };
  if (dados.type === "consumivel") {
    let resto = qtd;
    const mudancas = [];
    const pilhas = ator.items.filter(i => mesmaPilha(i, modelo));
    for (const pl of pilhas) {
      if (resto <= 0) break;
      const atual = qtdDe(pl), cabe = (maxPilha > 0 ? maxPilha : NAUREN_QUANTIDADE_MAXIMA) - atual;
      if (cabe <= 0) continue;
      const v = Math.min(cabe, resto);
      mudancas.push({ item: pl, de: atual, para: atual + v });
      resto -= v;
    }
    const novas = [];
    const tam = maxPilha > 0 ? maxPilha : NAUREN_QUANTIDADE_MAXIMA;
    while (resto > 0) { const v = Math.min(tam, resto); novas.push({ ...foundry.utils.deepClone(dados), system: { ...foundry.utils.deepClone(dados.system), quantidade: v } }); resto -= v; }
    if (novas.length > limiteEspacos) throw new Error("sem espaço");
    for (const m of mudancas) await m.item.update({ "system.quantidade": m.para });
    const criados = novas.length ? await ator.createEmbeddedDocuments("Item", novas, { naurenSemJuntar: true }) : [];
    return async () => {
      for (const m of mudancas) { const it = ator.items.get(m.item.id); if (it) await it.update({ "system.quantidade": m.de }); }
      if (criados.length) await ator.deleteEmbeddedDocuments("Item", criados.map(c => c.id).filter(id => ator.items.get(id)));
    };
  }
  const lista = Array.from({ length: qtd }, () => foundry.utils.deepClone(dados));
  if (lista.length > limiteEspacos) throw new Error("sem espaço");
  const criados = await ator.createEmbeddedDocuments("Item", lista, { naurenSemJuntar: true });
  return async () => { if (criados.length) await ator.deleteEmbeddedDocuments("Item", criados.map(c => c.id).filter(id => ator.items.get(id))); };
}
/** Tira qtd de um item (some quando zera). Devolve uma função que desfaz. */
async function retirar(item, qtd) {
  const ator = item.parent;
  if (ehPilha(item) && qtdDe(item) > qtd) {
    const de = qtdDe(item);
    await item.update({ "system.quantidade": de - qtd });
    return async () => { const it = ator.items.get(item.id); if (it) await it.update({ "system.quantidade": de }); };
  }
  const dados = item.toObject();
  await ator.deleteEmbeddedDocuments("Item", [item.id]);
  return async () => { await ator.createEmbeddedDocuments("Item", [dados], { keepId: true, naurenSemJuntar: true }); };
}
/** Muda o saldo da moeda do ator (cria a moeda se precisar receber). */
async function mudarSaldo(ator, nomeMoeda, delta) {
  if (!delta) return async () => {};
  const m = moedaDoAtor(ator, nomeMoeda);
  if (m) {
    const de = qtdDe(m), para = Math.max(0, Math.min(NAUREN_QUANTIDADE_MAXIMA, de + delta));
    // 0.101.3: moeda zerada sai da ficha (desfazer traz de volta com o mesmo id).
    if (para <= 0 && ator.type !== "armazenamento") {
      const dados = m.toObject();
      await ator.deleteEmbeddedDocuments("Item", [m.id]);
      return async () => { if (!ator.items.get(dados._id)) await ator.createEmbeddedDocuments("Item", [dados], { keepId: true, naurenSemJuntar: true }); };
    }
    await m.update({ "system.quantidade": para });
    return async () => { const it = ator.items.get(m.id); if (it) await it.update({ "system.quantidade": de }); };
  }
  if (delta < 0) throw new Error("sem moeda");
  const [criado] = await ator.createEmbeddedDocuments("Item", [await dadosMoeda(nomeMoeda, delta)], { naurenSemJuntar: true });
  return async () => { if (ator.items.get(criado?.id)) await ator.deleteEmbeddedDocuments("Item", [criado.id]); };
}
async function dadosMoeda(nome, qtd) {
  // Usa a do compêndio "Nauren - Equipamentos" se tiver o mesmo nome (mesma imagem e descrição).
  try {
    const pack = game.packs?.find?.(pk => pk.metadata?.label === "Nauren - Equipamentos");
    if (pack) {
      const idx = await pack.getIndex();
      const e = [...idx].find(x => x.name === nome);
      if (e) { const d = (await pack.getDocument(e._id)).toObject(); delete d._id; d.system.quantidade = qtd; return d; }
    }
  } catch (err) { /* segue */ }
  return { name: nome, type: "consumivel", img: "icons/commodities/currency/coins-plain-stack-gold-yellow.webp", system: { categoria: "moeda", quantidade: qtd, quantidadeMax: 0, efeito: "" } };
}

async function registrar(armazem, entrada) {
  const reg = [...foundry.utils.deepClone(armazem.system.registro ?? []), { t: Date.now(), ...entrada }].slice(-REGISTRO_MAX);
  // Só as 30 trocas mais novas guardam a cópia completa do item (para desfazer); as antigas ficam só no texto.
  for (let i = 0; i < reg.length - 30; i++) if (reg[i].dados) { delete reg[i].dados; reg[i].semCopia = true; }
  await armazem.update({ "system.registro": reg });
}
async function card(ator, armazem, titulo, linhas, icone) {
  try {
    await naurenPostarCard({ ator, titulo, icone: icone || armazem.img, fonte: armazem.name, linhas: linhas.map(([label, value]) => ({ label, value })), flags: { armazem: armazem.uuid } });
  } catch (err) { console.warn("Nauren RPG | card do armazenamento", err); }
}
function rot(qtd, nome) { return `${qtd > 1 ? `${fmt(qtd)}× ` : ""}${nome}`; }

async function pegar(armazem, ator, itemId, qtd, user) {
  const s = armazem.system;
  if (!user?.isGM && !s.podePegar) return { ok: false, msg: "Este baú não deixa pegar." };
  const item = armazem.items.get(itemId);
  if (!item || (cfgItem(item).oculto && !user?.isGM)) return { ok: false, codigo: "acabou", msg: "Acabou: outra pessoa levou." };
  const tem = qtdDe(item);
  if (tem < qtd) return { ok: false, codigo: "acabou", msg: tem ? `Só sobrou ${fmt(tem)}.` : "Acabou: outra pessoa levou." };
  const dados = dadosCopia(item, qtd), nome = item.name, img = item.img;
  const desfazTirar = await retirar(item, qtd);
  try { await entregar(ator, dados, qtd); }
  catch (err) { await desfazTirar(); return { ok: false, msg: "Não deu para entregar o item. Nada mudou." }; }
  await registrar(armazem, { op: "pegar", user: user?.id, ator: ator.uuid, atorNome: ator.name, item: nome, img, qtd, dados });
  await card(ator, armazem, `${ator.name} pegou ${rot(qtd, nome)}`, [["Do baú", armazem.name]], img);
  return { ok: true, msg: `Você pegou ${rot(qtd, nome)}.` };
}

async function guardar(armazem, ator, itemId, qtd, user) {
  const s = armazem.system;
  if (!user?.isGM && !s.podeGuardar) return { ok: false, msg: "Este baú não aceita guardar." };
  const item = ator.items.get(itemId);
  if (!item) return { ok: false, msg: "Você não tem mais este item." };
  if (!["arma", "armadura", "consumivel"].includes(item.type)) return { ok: false, msg: "Só armas, armaduras e equipamentos vão para o baú." };
  const tem = qtdDe(item);
  if (tem < qtd) return { ok: false, msg: `Você só tem ${fmt(tem)}.` };
  const livres = s.semLimite ? Infinity : Math.max(0, s.espacos - armazem.items.size);
  const dados = dadosCopia(item, qtd), nome = item.name, img = item.img;
  // Confere o espaço antes de mexer em qualquer coisa.
  if (!s.semLimite) {
    const max = s.maxPilha > 0 ? s.maxPilha : NAUREN_QUANTIDADE_MAXIMA;
    let precisa = ehPilha(item) ? 0 : qtd;
    if (ehPilha(item)) {
      let resto = qtd;
      for (const pl of armazem.items.filter(i => mesmaPilha(i, item))) resto -= Math.max(0, Math.min(resto, max - qtdDe(pl)));
      precisa = resto > 0 ? Math.ceil(resto / max) : 0;
    }
    if (precisa > livres) return { ok: false, codigo: "cheio", msg: "O baú está cheio." };
  }
  const desfazTirar = await retirar(item, qtd);
  try { await entregar(armazem, dados, qtd, { maxPilha: s.maxPilha, limiteEspacos: livres }); }
  catch (err) { await desfazTirar(); return { ok: false, codigo: "cheio", msg: "O baú está cheio. Nada mudou." }; }
  await registrar(armazem, { op: "guardar", user: user?.id, ator: ator.uuid, atorNome: ator.name, item: nome, img, qtd, dados });
  await card(ator, armazem, `${ator.name} guardou ${rot(qtd, nome)}`, [["No baú", armazem.name]], img);
  return { ok: true, msg: `Você guardou ${rot(qtd, nome)}.` };
}

async function comprar(armazem, ator, itemId, qtd, user) {
  const s = armazem.system;
  if (!user?.isGM && !s.podePegar) return { ok: false, msg: "Esta loja não está vendendo." };
  const item = armazem.items.get(itemId);
  const c = cfgItem(item);
  if (!item || (c.oculto && !user?.isGM)) return { ok: false, codigo: "acabou", msg: "Este item saiu da loja." };
  if (c.estoque >= 0 && c.estoque < qtd) return { ok: false, codigo: "acabou", msg: c.estoque ? `Acabou: só sobrou ${fmt(c.estoque)}.` : "Acabou: outra pessoa levou o último." };
  const unit = precoFinal(armazem, item), total = unit * qtd;
  if (total > NAUREN_QUANTIDADE_MAXIMA) return { ok: false, msg: "Valor alto demais para uma compra só." };
  const saldo = saldoDe(ator, s.moeda);
  if (saldo < total) return { ok: false, codigo: "sem-dinheiro", msg: `Faltam ${s.moeda} ${fmt(total - saldo)}.` };
  const dados = dadosCopia(item, ehPilha(item) ? qtdDe(item) * qtd : 1), nome = item.name, img = item.img;
  const qtdEntrega = ehPilha(item) ? Math.max(1, qtdDe(item)) * qtd : qtd;
  // 1. tira do estoque  2. cobra  3. entrega (com devolução em cada passo)
  const estoqueAntes = c.estoque;
  if (estoqueAntes >= 0) await item.update({ "flags.nauren.armazem.estoque": estoqueAntes - qtd });
  const voltaEstoque = async () => { if (estoqueAntes >= 0 && armazem.items.get(item.id)) await item.update({ "flags.nauren.armazem.estoque": estoqueAntes }); };
  let voltaSaldo;
  try { voltaSaldo = await mudarSaldo(ator, s.moeda, -total); }
  catch (err) { await voltaEstoque(); return { ok: false, codigo: "sem-dinheiro", msg: `Você não tem ${s.moeda}.` }; }
  try { await entregar(ator, dados, qtdEntrega); }
  catch (err) { await voltaSaldo(); await voltaEstoque(); return { ok: false, msg: "Não deu para entregar o item. Nada foi cobrado." }; }
  const caixaAntes = s.caixa;
  if (!s.caixaSemLimite && total) await armazem.update({ "system.caixa": Math.min(NAUREN_QUANTIDADE_MAXIMA, caixaAntes + total) });
  await registrar(armazem, { op: "comprar", user: user?.id, ator: ator.uuid, atorNome: ator.name, item: nome, img, itemId: item.id, qtd, qtdEntrega, valor: total, moeda: s.moeda, dados });
  await card(ator, armazem, `${ator.name} comprou ${rot(qtd, nome)}`, [["Pagou", `${s.moeda} ${fmt(total)}`], ["Na loja", armazem.name]], img);
  return { ok: true, msg: `Você comprou ${rot(qtd, nome)} por ${fmt(total)} ${s.moeda}.` };
}

/** Item da loja que corresponde a um item do jogador (mesmo tipo e nome). */
function itemDaLojaPara(armazem, item) { return armazem.items.find(i => i.type === item.type && i.name === item.name && !cfgItem(i).oculto) ?? null; }

async function vender(armazem, ator, itemId, qtd, user) {
  const s = armazem.system;
  if (!s.compraDeVolta || (!user?.isGM && !s.podeGuardar)) return { ok: false, msg: "Esta loja não compra itens." };
  const item = ator.items.get(itemId);
  if (!item) return { ok: false, msg: "Você não tem mais este item." };
  const daLoja = itemDaLojaPara(armazem, item);
  if (!daLoja) return { ok: false, msg: "A loja só compra o que ela também vende." };
  const tem = qtdDe(item);
  if (tem < qtd) return { ok: false, msg: `Você só tem ${fmt(tem)}.` };
  // Pilha vendida na unidade da loja (ex.: "Flechas (20)" vende de 20 em 20 → aqui conta por unidade).
  const unidadeLoja = ehPilha(daLoja) ? Math.max(1, qtdDe(daLoja)) : 1;
  const total = Math.floor(precoVenda(armazem, daLoja) * qtd / unidadeLoja);
  if (!s.caixaSemLimite && s.caixa < total) return { ok: false, codigo: "caixa", msg: `A loja não tem ${s.moeda} suficientes no caixa (${fmt(s.caixa)}).` };
  const nome = item.name, img = item.img, dados = dadosCopia(item, qtd);
  const desfazTirar = await retirar(item, qtd);
  let voltaSaldo;
  try { voltaSaldo = await mudarSaldo(ator, s.moeda, total); }
  catch (err) { await desfazTirar(); return { ok: false, msg: "Não deu para pagar. Nada mudou." }; }
  const c = cfgItem(daLoja);
  if (c.estoque >= 0) await daLoja.update({ "flags.nauren.armazem.estoque": c.estoque + Math.max(1, Math.floor(qtd / unidadeLoja)) });
  if (!s.caixaSemLimite && total) await armazem.update({ "system.caixa": Math.max(0, s.caixa - total) });
  await registrar(armazem, { op: "vender", user: user?.id, ator: ator.uuid, atorNome: ator.name, item: nome, img, itemId: daLoja.id, qtd, valor: total, moeda: s.moeda, dados, estoqueDelta: c.estoque >= 0 ? Math.max(1, Math.floor(qtd / unidadeLoja)) : 0 });
  await card(ator, armazem, `${ator.name} vendeu ${rot(qtd, nome)}`, [["Recebeu", `${s.moeda} ${fmt(total)}`], ["Para a loja", armazem.name]], img);
  return { ok: true, msg: `Você vendeu ${rot(qtd, nome)} por ${fmt(total)} ${s.moeda}.` };
}

async function destrancar(armazem, ator, user) {
  const s = armazem.system;
  if (!s.trancado) return { ok: true, msg: "Já está aberto." };
  const chave = s.chave ? ator.items.find(i => i.name === s.chave) : null;
  if (!chave) return { ok: false, codigo: "trancado", msg: s.chave ? `Precisa de ${s.chave}.` : "Só o Mestre abre." };
  if (s.gastaChave) await retirar(chave, 1);
  await armazem.update({ "system.trancado": false });
  await registrar(armazem, { op: "destrancar", user: user?.id, ator: ator.uuid, atorNome: ator.name, item: chave.name, img: chave.img, qtd: 1, gastou: !!s.gastaChave, dados: s.gastaChave ? dadosCopia(chave, 1) : null });
  await card(ator, armazem, `${ator.name} abriu ${armazem.name}`, [["Com", `${chave.name}${s.gastaChave ? " (gastou)" : ""}`]], armazem.img);
  return { ok: true, msg: `Aberto com ${chave.name}.` };
}

/** Desfaz uma entrada do registro (Mestre). Melhor esforço: avisa o que não deu. */
async function desfazer(armazem, indice) {
  const reg = foundry.utils.deepClone(armazem.system.registro ?? []);
  const e = reg[indice];
  if (!e || e.desfeito) return { ok: false, msg: "Nada para desfazer aqui." };
  if (!e.dados && ["pegar", "guardar", "vender"].includes(e.op)) return { ok: false, msg: "Esta troca é antiga demais para desfazer (só as 30 mais novas guardam o item)." };
  const ator = e.ator ? await fromUuid(e.ator) : null;
  const tirarDoAtor = async (nome, qtd) => {
    if (!ator) return false;
    let resto = qtd;
    for (const it of ator.items.filter(i => i.name === nome && (!e.dados || i.type === e.dados.type))) {
      if (resto <= 0) break;
      const v = Math.min(resto, qtdDe(it)); await retirar(it, v); resto -= v;
    }
    return resto <= 0;
  };
  let ok = true;
  if (e.op === "pegar") { ok = await tirarDoAtor(e.item, e.qtd); if (ok) await entregar(armazem, e.dados, e.qtd, { maxPilha: armazem.system.maxPilha }); }
  else if (e.op === "guardar") {
    let resto = e.qtd;
    for (const it of armazem.items.filter(i => i.name === e.item)) { if (resto <= 0) break; const v = Math.min(resto, qtdDe(it)); await retirar(it, v); resto -= v; }
    ok = resto <= 0; if (ok && ator) await entregar(ator, e.dados, e.qtd);
  } else if (e.op === "comprar") {
    ok = await tirarDoAtor(e.item, e.qtdEntrega ?? e.qtd);
    if (ok) {
      if (ator) await mudarSaldo(ator, e.moeda, e.valor);
      const it = armazem.items.get(e.itemId); const c = cfgItem(it);
      if (it && c.estoque >= 0) await it.update({ "flags.nauren.armazem.estoque": c.estoque + e.qtd });
      if (!armazem.system.caixaSemLimite) await armazem.update({ "system.caixa": Math.max(0, armazem.system.caixa - e.valor) });
    }
  } else if (e.op === "vender") {
    const m = ator ? moedaDoAtor(ator, e.moeda) : null;
    ok = !!m && qtdDe(m) >= e.valor;
    if (ok) {
      await mudarSaldo(ator, e.moeda, -e.valor); await entregar(ator, e.dados, e.qtd);
      const it = armazem.items.get(e.itemId); const c = cfgItem(it);
      if (it && c.estoque >= 0 && e.estoqueDelta) await it.update({ "flags.nauren.armazem.estoque": Math.max(0, c.estoque - e.estoqueDelta) });
      if (!armazem.system.caixaSemLimite) await armazem.update({ "system.caixa": Math.min(NAUREN_QUANTIDADE_MAXIMA, armazem.system.caixa + e.valor) });
    }
  } else if (e.op === "destrancar") { await armazem.update({ "system.trancado": true }); if (e.gastou && ator && e.dados) await entregar(ator, e.dados, 1); }
  if (!ok) return { ok: false, msg: `Não deu para desfazer: ${e.atorNome ?? "o personagem"} não tem mais o que voltaria.` };
  const reg2 = foundry.utils.deepClone(armazem.system.registro ?? []);
  if (reg2[indice]) reg2[indice].desfeito = true;
  await armazem.update({ "system.registro": reg2 });
  await card(ator ?? null, armazem, "Troca desfeita pelo Mestre", [["Era", `${e.atorNome ?? "?"} ${({ pegar: "pegou", guardar: "guardou", comprar: "comprou", vender: "vendeu", destrancar: "abriu com" })[e.op] ?? e.op} ${rot(e.qtd, e.item)}`]], armazem.img);
  return { ok: true, msg: "Desfeito." };
}

/* ============================ JANELAS: peças comuns ============================ */
const ApplicationV2 = () => foundry.applications.api.ApplicationV2;
function trocarHtml(alvo, html) {
  // Mantém a rolagem das listas ao redesenhar.
  const rol = [...alvo.querySelectorAll("[data-rola]")].map(e => [e.dataset.rola, e.scrollTop]);
  const foco = document.activeElement && alvo.contains(document.activeElement) && document.activeElement.dataset?.foco ? { k: document.activeElement.dataset.foco, ini: document.activeElement.selectionStart, fim: document.activeElement.selectionEnd } : null;
  alvo.innerHTML = html;
  for (const [k, t] of rol) { const e = alvo.querySelector(`[data-rola="${k}"]`); if (e) e.scrollTop = t; }
  if (foco) { const e = alvo.querySelector(`[data-foco="${foco.k}"]`); if (e) { e.focus(); try { e.setSelectionRange(foco.ini, foco.fim); } catch (err) { /* segue */ } } }
}
function icone(item) { return `<img src="${ESC(item.img)}" alt="" loading="lazy">`; }
function chips(item) { return naurenSeloDoItem(item, { tam: "nt-p" }) + etiquetas(item).map(t => `<span class="na-chip">${ESC(t)}</span>`).join(""); }
function moedaHtml(v) { return `<span class="na-moeda"><i>ƒ</i>${fmt(v)}</span>`; }
function filtroBarra(filtro, contagens = null) {
  return `<div class="na-filtros">${FILTROS.filter(([k]) => !contagens || k === "tudo" || contagens[k]).map(([k, r]) => `<button type="button" class="na-filtro ${filtro === k ? "on" : ""}" data-action="filtro" data-filtro="${k}">${r}${contagens ? ` · ${contagens[k] ?? 0}` : ""}</button>`).join("")}</div>`;
}
function busca(valor, ph) { return `<label class="na-busca"><i class="fas fa-magnifying-glass"></i><input type="search" data-foco="busca" class="na-busca-in" value="${ESC(valor)}" placeholder="${ESC(ph)}"></label>`; }
function passaFiltro(item, filtro, termo) {
  if (filtro && filtro !== "tudo" && categoriaFiltro(item) !== filtro) return false;
  if (termo) { const t = termo.toLocaleLowerCase("pt-BR"); return item.name.toLocaleLowerCase("pt-BR").includes(t) || etiquetas(item).some(e => e.toLocaleLowerCase("pt-BR").includes(t)); }
  return true;
}

/* ============================ JANELA DO JOGADOR ============================ */
const janelasAbertas = new Set();

class NaurenArmazemJanela extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    classes: ["nauren-kit", "nauren-armazem", "nauren-armazem-jogador"],
    position: { width: 680, height: "auto" },
    window: { resizable: true, icon: "fas fa-box-archive" },
    actions: {
      filtro: NaurenArmazemJanela.#onFiltro,
      escolher: NaurenArmazemJanela.#onEscolher,
      qtdMenos: function (ev, el) { return NaurenArmazemJanela.#qtd.call(this, ev, el, -1); },
      qtdMais: function (ev, el) { return NaurenArmazemJanela.#qtd.call(this, ev, el, 1); },
      pegar: NaurenArmazemJanela.#onPegar,
      lerEscrito: function (ev, el) { const it = this.armazem?.items?.get(el.dataset.id); if (it) naurenAbrirEscrito(it); },
      guardar: NaurenArmazemJanela.#onGuardar,
      comprar: NaurenArmazemJanela.#onComprar,
      vender: NaurenArmazemJanela.#onVender,
      aba: NaurenArmazemJanela.#onAba,
      destrancar: NaurenArmazemJanela.#onDestrancar,
      fechar: function () { this.close(); }
    }
  };

  constructor(armazem, opcoes = {}) {
    const ator = opcoes.ator ?? atorPadraoDoUsuario();
    super({ id: `nauren-armazem-${armazem.id}`, window: { title: armazem.name }, naurenAtorUuid: ator?.uuid ?? null, ...opcoes.app });
    this.armazem = armazem;
    this.ator = ator;
    this._naurenAtorUuid = ator?.uuid ?? null; // as opções do V14 ficam travadas depois de criadas: a cor segue este campo
    this.regiaoUuid = opcoes.regiaoUuid ?? null;
    this.estado = { filtro: "tudo", busca: "", sel: null, qtd: {}, aba: "comprar", processando: null, aviso: null, mochilaSel: null };
  }
  get title() { return this.armazem?.name ?? "Armazenamento"; }

  static abrir(armazem, opcoes = {}) {
    if (!armazem) return null;
    if (!podeAbrir(armazem, game.user)) { ui.notifications.warn("Você não tem acesso a este armazenamento."); return null; }
    const id = `nauren-armazem-${armazem.id}`;
    const existente = foundry.applications.instances.get(id);
    if (existente) { if (opcoes.regiaoUuid) existente.regiaoUuid = opcoes.regiaoUuid; existente.render({ force: true }); existente.bringToFront?.(); return existente; }
    const j = new NaurenArmazemJanela(armazem, opcoes);
    j.render({ force: true });
    return j;
  }

  async _prepareContext() { return {}; }
  async _renderHTML() { return this.armazem?.system?.modo === "loja" ? this.#htmlLoja() : this.#htmlBau(); }
  _replaceHTML(html, content) { trocarHtml(content, html); }
  _onFirstRender() { janelasAbertas.add(this); }
  _onClose() { janelasAbertas.delete(this); }
  _onRender() {
    const el = this.element;
    el.querySelectorAll(".na-busca-in").forEach(inp => inp.addEventListener("input", foundry.utils.debounce(() => { this.estado.busca = inp.value; this.render(); }, 180)));
    el.querySelectorAll(".na-qtd-in").forEach(inp => inp.addEventListener("change", () => { this.estado.qtd[inp.dataset.id] = Math.max(1, naurenLerNumero(inp.value) || 1); this.render(); }));
    el.querySelectorAll("select.na-ator").forEach(sel => sel.addEventListener("change", () => { this.ator = game.actors.get(sel.value) ?? this.ator; this._naurenAtorUuid = this.ator?.uuid ?? null; this.render(); }));
    // Arrastar entre o baú e a mochila.
    el.querySelectorAll("[data-arrasta]").forEach(x => x.addEventListener("dragstart", ev => { ev.dataTransfer.setData("text/plain", JSON.stringify({ naurenArmazem: x.dataset.arrasta, id: x.dataset.id })); }));
    for (const zona of el.querySelectorAll("[data-solta]")) {
      zona.addEventListener("dragover", ev => { ev.preventDefault(); zona.classList.add("na-alvo"); });
      zona.addEventListener("dragleave", () => zona.classList.remove("na-alvo"));
      zona.addEventListener("drop", ev => {
        ev.preventDefault(); zona.classList.remove("na-alvo");
        let d = null; try { d = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err) { d = null; }
        if (!d?.naurenArmazem) return;
        if (zona.dataset.solta === "bau" && d.naurenArmazem === "mochila") this.#trocar("guardar", d.id, this.#qtdPara(d.id, this.ator?.items.get(d.id)));
        if (zona.dataset.solta === "mochila" && d.naurenArmazem === "bau") this.#trocar("pegar", d.id, this.#qtdPara(d.id, this.armazem.items.get(d.id)));
      });
    }
  }

  #qtdPara(id, item) { return Math.max(1, Math.min(this.estado.qtd[id] ?? 1, qtdDe(item) || 1)); }

  #cabecalho(extraDir = "") {
    const a = this.armazem, s = a.system;
    const atores = atoresDoUsuario(game.user);
    const seletor = !game.user.isGM && atores.length > 1
      ? `<select class="na-ator" title="Com qual personagem">${atores.map(x => `<option value="${x.id}" ${x.id === this.ator?.id ? "selected" : ""}>${ESC(x.name)}</option>`).join("")}</select>`
      : `<span class="na-sub">${this.ator ? `Com <b>${ESC(this.ator.name)}</b>` : "Sem personagem"}</span>`;
    return `<header class="na-cab">
      <div class="na-retrato"><img src="${ESC(a.img)}" alt=""></div>
      <div class="na-cab-txt"><h2>${ESC(a.name)}</h2>${s.frase ? `<p class="na-frase">${ESC(s.frase)}</p>` : ""}<div class="na-cab-linha">${seletor}</div></div>
      ${extraDir}
    </header>`;
  }
  #avisos() {
    const s = this.armazem.system, out = [];
    if (!game.users.activeGM) out.push(`<div class="na-aviso na-aviso-pausa"><i class="fas fa-pause"></i><span><b>Sem Mestre conectado.</b> Dá para olhar; ${s.modo === "loja" ? "comprar e vender" : "pegar e guardar"} ficam pausados.</span></div>`);
    if (!this.ator && !game.user.isGM) out.push(`<div class="na-aviso"><i class="fas fa-user"></i><span>Escolha um personagem seu (selecione o token) para trocar itens.</span></div>`);
    if (this.estado.aviso) out.push(`<div class="na-aviso na-aviso-${this.estado.aviso.ok ? "ok" : "ruim"}"><i class="fas ${this.estado.aviso.ok ? "fa-check" : "fa-circle-exclamation"}"></i><span>${ESC(this.estado.aviso.msg)}</span></div>`);
    return out.join("");
  }
  #trancado() {
    const s = this.armazem.system;
    const temChave = s.chave && this.ator?.items?.some(i => i.name === s.chave);
    return `<div class="na-trancado">
      <div class="na-trancado-ic"><i class="fas fa-lock"></i></div>
      <p><b>Trancado.</b> ${s.chave ? `Abre com <b>${ESC(s.chave)}</b>. ${temChave ? "Você tem uma." : "Você não tem."}` : "Só o Mestre abre."}${s.chave && s.gastaChave ? " A chave é gasta ao abrir." : ""}</p>
      ${temChave ? `<button type="button" class="na-btn na-principal" data-action="destrancar" ${this.estado.processando ? "disabled" : ""}>${this.estado.processando ? "Processando…" : "Usar a chave"}</button>` : ""}
    </div>`;
  }
  #rodape(esq) {
    return `<footer class="na-rodape"><span class="na-rodape-txt">${esq}</span><button type="button" class="na-btn" data-action="fechar">Fechar</button></footer>`;
  }
  #stepper(id, max, valor) {
    const v = Math.max(1, Math.min(valor, Math.max(1, max)));
    return `<div class="na-stepper"><button type="button" data-action="qtdMenos" data-id="${id}" ${v <= 1 ? "disabled" : ""}>−</button><input type="text" inputmode="numeric" class="na-qtd-in" data-id="${id}" data-foco="qtd-${id}" value="${fmt(v)}"><button type="button" data-action="qtdMais" data-id="${id}" ${v >= max ? "disabled" : ""}>+</button></div>`;
  }

  #htmlBau() {
    const a = this.armazem, s = a.system, gm = game.user.isGM;
    const visiveis = a.items.filter(i => gm || !cfgItem(i).oculto);
    const lista = visiveis.filter(i => passaFiltro(i, this.estado.filtro, this.estado.busca));
    const usados = a.items.size, total = s.semLimite ? null : s.espacos;
    const sel = lista.find(i => i.id === this.estado.sel) ?? null;
    const espacos = total ? Math.max(total, usados) : Math.max(usados + 4 - (usados % 4 || 4) + 4, 8);
    const filtrando = this.estado.filtro !== "tudo" || !!this.estado.busca;
    const slots = [];
    for (const it of lista) {
      const q = qtdDe(it);
      slots.push(`<button type="button" class="na-slot ${sel?.id === it.id ? "on" : ""} ${cfgItem(it).oculto ? "oculto" : ""}" data-action="escolher" data-id="${it.id}" draggable="true" data-arrasta="bau" title="${ESC(it.name)}${ehPilha(it) ? ` — ${fmt(q)}` : ""}">${icone(it)}${ehPilha(it) && q !== 1 ? `<span class="na-qtd" title="${fmt(q)}">${naurenFormatarNumeroCurto(q)}</span>` : ""}</button>`);
    }
    if (!filtrando) for (let k = lista.length; k < espacos; k++) slots.push(`<span class="na-slot vazio"></span>`);
    const barra = total ? `<div class="na-espacos"><span>Espaços</span><b>${usados} / ${total}</b><i style="--p:${Math.min(100, Math.round(usados / total * 100))}%"></i></div>` : `<div class="na-espacos"><span>Espaços</span><b>${usados} · sem limite</b></div>`;
    const proc = this.estado.processando;
    let detalhe = `<div class="na-detalhe vazio"><i class="fas fa-hand-pointer"></i><p>Escolha um item do baú para ver e pegar.</p></div>`;
    if (sel) {
      const q = qtdDe(sel), n = this.#qtdPara(sel.id, sel);
      const podeP = (gm || s.podePegar) && !!this.ator;
      detalhe = `<div class="na-detalhe">
        <div class="na-det-cab">${icone(sel)}<div><b>${ESC(sel.name)}</b><div class="na-chips">${chips(sel)}</div></div></div>
        <p class="na-det-txt">${ESC(textoCurto(sel.system?.descricao, 220)) || "<i>Sem descrição.</i>"}</p>
        ${ehPilha(sel) && q > 1 ? `<div class="na-det-linha"><span class="na-det-qtd">Quantos<small>tem ${fmt(q)}</small></span>${this.#stepper(sel.id, q, n)}</div>` : ""}
        ${naurenEhEscrito(sel) && (gm || naurenEscritoDe(sel).lerNoBau) ? `<button type="button" class="na-btn na-largo" data-action="lerEscrito" data-id="${sel.id}"><i class="fas fa-book-open-reader"></i> Ler aqui</button>` : ""}
        <button type="button" class="na-btn na-principal na-largo" data-action="pegar" data-id="${sel.id}" ${!podeP || proc || !game.users.activeGM ? "disabled" : ""}>${proc === sel.id ? "Processando…" : !s.podePegar && !gm ? "Este baú não deixa pegar" : `Pegar${ehPilha(sel) && n > 1 ? ` ${fmt(n)}` : ""}`}</button>
      </div>`;
    }
    const mochila = (this.ator?.items ?? []).filter(i => ["arma", "armadura", "consumivel"].includes(i.type));
    const msel = mochila.find(i => i.id === this.estado.mochilaSel) ?? null;
    const podeG = (gm || s.podeGuardar) && !!this.ator;
    const mochilaHtml = mochila.map(it => {
      const q = qtdDe(it);
      return `<button type="button" class="na-slot na-slot-p ${msel?.id === it.id ? "on" : ""}" data-action="escolher" data-lado="mochila" data-id="${it.id}" draggable="true" data-arrasta="mochila" title="${ESC(it.name)}${ehPilha(it) ? ` — ${fmt(q)}` : ""}${podeG ? " (clique para guardar)" : ""}">${icone(it)}${ehPilha(it) && q !== 1 ? `<span class="na-qtd">${naurenFormatarNumeroCurto(q)}</span>` : ""}${it.system?.equipado ? `<span class="na-eq" title="Equipado"><i class="fas fa-shield-halved"></i></span>` : ""}</button>`;
    }).join("") || `<p class="na-vazio">Sua mochila está vazia.</p>`;
    let guardarBarra = "";
    if (msel) {
      const q = qtdDe(msel), n = this.#qtdPara(msel.id, msel);
      guardarBarra = `<div class="na-guardar">${icone(msel)}<b>${ESC(msel.name)}</b>${ehPilha(msel) && q > 1 ? this.#stepper(msel.id, q, n) : ""}<button type="button" class="na-btn na-principal" data-action="guardar" data-id="${msel.id}" ${!podeG || proc || !game.users.activeGM ? "disabled" : ""}>${proc === msel.id ? "Processando…" : !s.podeGuardar && !gm ? "Não aceita guardar" : `Guardar${ehPilha(msel) && n > 1 ? ` ${fmt(n)}` : ""}`}</button></div>`;
    }
    const corpo = s.trancado && !gm ? this.#trancado() : `
      <div class="na-secao"><span>No baú</span><i></i></div>
      <div class="na-ferramentas">${busca(this.estado.busca, "Procurar no baú…")}${filtroBarra(this.estado.filtro)}</div>
      <div class="na-bau">
        <div class="na-grade" data-rola="grade" data-solta="bau">${slots.join("") || `<p class="na-vazio">Nada encontrado.</p>`}</div>
        ${detalhe}
      </div>
      <div class="na-meio"><i></i><span><i class="fas fa-arrows-up-down"></i> arraste entre o baú e a mochila</span><i></i></div>
      <div class="na-secao"><span>Sua mochila</span><small>clique num item para guardar</small><i></i></div>
      <div class="na-mochila" data-rola="mochila" data-solta="mochila">${mochilaHtml}</div>
      ${guardarBarra}`;
    return `<div class="na-janela na-modo-bau">
      ${this.#cabecalho(barra)}
      ${this.#avisos()}
      <div class="na-corpo">${corpo}</div>
      ${this.#rodape("O que você pega ou guarda aparece na hora para todos.")}
    </div>`;
  }

  #htmlLoja() {
    const a = this.armazem, s = a.system, gm = game.user.isGM;
    const aba = s.compraDeVolta ? this.estado.aba : "comprar";
    const saldo = this.ator ? saldoDe(this.ator, s.moeda) : 0;
    const proc = this.estado.processando;
    const seg = s.compraDeVolta ? `<div class="na-seg"><button type="button" class="${aba === "comprar" ? "on" : ""}" data-action="aba" data-aba="comprar">Comprar</button><button type="button" class="${aba === "vender" ? "on" : ""}" data-action="aba" data-aba="vender">Vender</button></div>` : "";
    let corpo;
    if (s.trancado && !gm) corpo = this.#trancado();
    else if (aba === "comprar") {
      const visiveis = a.items.filter(i => gm || !cfgItem(i).oculto);
      const cont = { tudo: visiveis.length }; for (const i of visiveis) cont[categoriaFiltro(i)] = (cont[categoriaFiltro(i)] ?? 0) + 1;
      const lista = visiveis.filter(i => passaFiltro(i, this.estado.filtro, this.estado.busca));
      const cartoes = lista.map(it => {
        const c = cfgItem(it), unit = precoFinal(a, it), n = Math.max(1, this.estado.qtd[it.id] ?? 1);
        const maxQ = c.estoque >= 0 ? c.estoque : 999;
        const esgotado = c.estoque === 0;
        const falta = unit * n - saldo;
        const nome = ehPilha(it) && qtdDe(it) > 1 ? `${it.name} (${fmt(qtdDe(it))})` : it.name;
        let acao;
        if (esgotado) acao = `<span class="na-esgotado">Esgotado</span>`;
        else if (falta > 0 && !gm) acao = `<span class="na-falta">faltam <i>ƒ</i> ${fmt(falta)}</span>${maxQ > 1 ? this.#stepper(it.id, maxQ, n) : ""}`;
        else acao = `${this.#stepper(it.id, maxQ, n)}<button type="button" class="na-btn na-principal" data-action="comprar" data-id="${it.id}" ${proc || !this.ator || !game.users.activeGM || (!s.podePegar && !gm) ? "disabled" : ""}>${proc === it.id ? "Processando…" : "Comprar"}</button>`;
        return `<article class="na-cartao ${esgotado ? "esgotado" : ""} ${c.oculto ? "oculto" : ""}">
          <div class="na-cartao-cab">${icone(it)}<div><b title="${ESC(nome)}">${ESC(nome)}</b><div class="na-chips">${chips(it)}</div></div></div>
          <p class="na-cartao-txt">${ESC(textoCurto(it.system?.descricao, 100)) || "&nbsp;"}</p>
          <div class="na-cartao-preco">${moedaHtml(unit)}<small>${c.estoque < 0 ? "∞ em estoque" : esgotado ? "sem estoque" : `${fmt(c.estoque)} em estoque`}</small></div>
          <div class="na-cartao-acao">${acao}</div>
        </article>`;
      }).join("") || `<p class="na-vazio">Nada encontrado.</p>`;
      corpo = `<div class="na-ferramentas">${filtroBarra(this.estado.filtro, cont)}${busca(this.estado.busca, "Procurar item…")}</div>
        <div class="na-vitrine" data-rola="vitrine">${cartoes}</div>`;
    } else {
      const meus = (this.ator?.items ?? []).filter(i => ["arma", "armadura", "consumivel"].includes(i.type) && !naurenEhMoeda(i));
      const linhas = meus.map(it => {
        const daLoja = itemDaLojaPara(a, it);
        const unidadeLoja = daLoja && ehPilha(daLoja) ? Math.max(1, qtdDe(daLoja)) : 1;
        const unit = daLoja ? Math.floor(precoVenda(a, daLoja) / unidadeLoja) : 0;
        const q = qtdDe(it), n = this.#qtdPara(it.id, it);
        return `<div class="na-venda ${daLoja ? "" : "nao"}">${icone(it)}<b>${ESC(it.name)}</b><span class="na-tem">×${fmt(q)}</span>
          ${daLoja ? `${moedaHtml(unit * n)}${ehPilha(it) && q > 1 ? this.#stepper(it.id, q, n) : `<span class="na-stepper-vazio"></span>`}<button type="button" class="na-btn" data-action="vender" data-id="${it.id}" ${proc || !game.users.activeGM || (!s.podeGuardar && !gm) ? "disabled" : ""}>${proc === it.id ? "…" : "Vender"}</button>` : `<span class="na-nao">a loja não compra</span>`}</div>`;
      }).join("") || `<p class="na-vazio">Nada para vender.</p>`;
      corpo = `<div class="na-venda-cab"><span></span><span>Seu item</span><span>Tem</span><span>A loja paga</span><span></span><span></span></div><div class="na-vendas" data-rola="vendas">${linhas}</div>
        <p class="na-nota">A loja compra o que ela também vende (pelo mesmo item), pagando ${fmt(s.pagaPercent)}% do preço.</p>`;
    }
    const caixa = !s.caixaSemLimite && aba === "vender" ? `<span class="na-caixa-loja">Caixa da loja ${moedaHtml(s.caixa)}</span>` : "";
    return `<div class="na-janela na-modo-loja">
      ${this.#cabecalho(seg)}
      ${this.#avisos()}
      <div class="na-corpo">${corpo}</div>
      ${this.#rodape(`Seus ${ESC(s.moeda)} ${moedaHtml(saldo)}<small>vem do item ${ESC(s.moeda)} da sua mochila</small>${caixa}`)}
    </div>`;
  }

  async #trocar(op, itemId, qtd) {
    if (this.estado.processando) return;
    if (!this.ator && !game.user.isGM) { ui.notifications.warn("Selecione um token seu (ou defina seu personagem) para trocar itens."); return; }
    if (!this.ator) { ui.notifications.warn("Mestre: selecione o token de um personagem para trocar por ele."); return; }
    this.estado.processando = itemId; this.estado.aviso = null; this.render();
    const r = await naurenArmazemPedir({ op, armazemUuid: this.armazem.uuid, atorUuid: this.ator.uuid, itemId, qtd, regiaoUuid: this.regiaoUuid, userId: game.user.id });
    this.estado.processando = null;
    this.estado.aviso = r;
    if (r?.ok) { this.estado.qtd[itemId] = 1; if (op === "guardar") this.estado.mochilaSel = null; }
    if (!this.armazem.items.get(this.estado.sel)) this.estado.sel = null;
    if (r?.ok) ui.notifications.info(r.msg); else if (r?.msg) ui.notifications.warn(r.msg);
    if (this.rendered) this.render();
    return r;
  }

  static #onFiltro(ev, el) { this.estado.filtro = el.dataset.filtro; this.render(); }
  static #onAba(ev, el) { this.estado.aba = el.dataset.aba; this.estado.aviso = null; this.render(); }
  static #onEscolher(ev, el) {
    if (el.dataset.lado === "mochila") this.estado.mochilaSel = this.estado.mochilaSel === el.dataset.id ? null : el.dataset.id;
    else this.estado.sel = el.dataset.id;
    this.estado.aviso = null; this.render();
  }
  static #qtd(ev, el, d) {
    const id = el.dataset.id; const it = this.armazem.items.get(id) ?? this.ator?.items.get(id);
    const c = cfgItem(it);
    const max = this.armazem.system.modo === "loja" && this.armazem.items.get(id) ? (c.estoque >= 0 ? c.estoque : 999) : qtdDe(it);
    this.estado.qtd[id] = Math.max(1, Math.min(max || 1, (this.estado.qtd[id] ?? 1) + d)); this.render();
  }
  static #onPegar(ev, el) { const it = this.armazem.items.get(el.dataset.id); return this.#trocar("pegar", el.dataset.id, this.#qtdPara(el.dataset.id, it)); }
  static #onGuardar(ev, el) { const it = this.ator?.items.get(el.dataset.id); return this.#trocar("guardar", el.dataset.id, this.#qtdPara(el.dataset.id, it)); }
  static #onComprar(ev, el) { return this.#trocar("comprar", el.dataset.id, Math.max(1, this.estado.qtd[el.dataset.id] ?? 1)); }
  static #onVender(ev, el) { const it = this.ator?.items.get(el.dataset.id); return this.#trocar("vender", el.dataset.id, this.#qtdPara(el.dataset.id, it)); }
  static async #onDestrancar() {
    if (this.estado.processando) return;
    this.estado.processando = "chave"; this.render();
    const r = await naurenArmazemPedir({ op: "destrancar", armazemUuid: this.armazem.uuid, atorUuid: this.ator?.uuid, regiaoUuid: this.regiaoUuid, userId: game.user.id });
    this.estado.processando = null; this.estado.aviso = r;
    if (r?.ok) ui.notifications.info(r.msg); else if (r?.msg) ui.notifications.warn(r.msg);
    this.render();
  }
  // Para testes e macros.
  trocar(op, itemId, qtd = 1) { return this.#trocar(op, itemId, qtd); }
}

/* ============================ FICHA DO MESTRE ============================ */
class NaurenArmazemSheet extends foundry.applications.sheets.ActorSheetV2 {
  static DEFAULT_OPTIONS = {
    classes: ["nauren-kit", "nauren-armazem", "nauren-armazem-mestre"],
    position: { width: 760, height: 720 },
    window: { resizable: true, icon: "fas fa-store" },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      modo: NaurenArmazemSheet.#onModo,
      aba: NaurenArmazemSheet.#onAba,
      filtro: NaurenArmazemSheet.#onFiltro,
      oculto: NaurenArmazemSheet.#onOculto,
      remover: NaurenArmazemSheet.#onRemover,
      abrirItem: NaurenArmazemSheet.#onAbrirItem,
      quem: NaurenArmazemSheet.#onQuem,
      tirarEscolhido: NaurenArmazemSheet.#onTirarEscolhido,
      addEscolhido: NaurenArmazemSheet.#onAddEscolhido,
      verTodos: NaurenArmazemSheet.#onVerTodos,
      desfazer: NaurenArmazemSheet.#onDesfazer,
      verComoJogador: NaurenArmazemSheet.#onVerComoJogador,
      mostrar: NaurenArmazemSheet.#onMostrar,
      editarImagem: NaurenArmazemSheet.#onEditarImagem,
      colocarNoMapa: NaurenArmazemSheet.#onColocarNoMapa,
      irPonto: NaurenArmazemSheet.#onIrPonto,
      tirarPonto: NaurenArmazemSheet.#onTirarPonto
    }
  };
  estado = { aba: "itens", filtro: "tudo", busca: "", buscaQuem: "", verTodos: false };
  get title() { return this.actor?.name ?? "Armazenamento"; }

  /** Jogadores não usam esta ficha: abrem a janela do baú/loja. */
  async render(opcoes = {}, ...resto) {
    if (!game.user.isGM && this.actor) { NaurenArmazemJanela.abrir(this.actor); return this; }
    return super.render(opcoes, ...resto);
  }
  async _prepareContext() { return {}; }
  async _renderHTML() { return this.#html(); }
  _replaceHTML(html, content) {
    // ActorSheetV2 é um <form>: o conteúdo vai dentro da área de conteúdo da janela.
    const alvo = content.querySelector?.(".window-content") ?? content;
    trocarHtml(alvo, html);
  }
  _onRender(context, options) {
    super._onRender?.(context, options);
    const el = this.element;
    el.querySelectorAll(".na-busca-in").forEach(inp => inp.addEventListener("input", foundry.utils.debounce(() => { this.estado.busca = inp.value; this.render(); }, 180)));
    el.querySelectorAll(".na-busca-quem").forEach(inp => inp.addEventListener("input", foundry.utils.debounce(() => { this.estado.buscaQuem = inp.value; this.render(); }, 180)));
    // Preço e estoque de cada item.
    el.querySelectorAll("[data-cfg]").forEach(inp => inp.addEventListener("change", async ev => {
      ev.stopPropagation();
      const it = this.actor.items.get(inp.dataset.id); if (!it) return;
      const k = inp.dataset.cfg;
      let v;
      if (k === "estoque") { const t = String(inp.value).trim(); v = t === "" || t === "∞" || /^sem|^inf/i.test(t) ? -1 : naurenLerNumero(t); }
      else v = naurenLerNumero(inp.value);
      await it.update({ [`flags.nauren.armazem.${k}`]: v });
    }));
    // Itens arrastados de compêndio, diretório ou ficha.
    const zona = el.querySelector(".na-solta");
    if (zona) {
      zona.addEventListener("dragover", ev => { ev.preventDefault(); zona.classList.add("na-alvo"); });
      zona.addEventListener("dragleave", () => zona.classList.remove("na-alvo"));
      zona.addEventListener("drop", async ev => { ev.preventDefault(); ev.stopPropagation(); zona.classList.remove("na-alvo"); await this.#soltarItem(ev); });
    }
  }
  async _onDrop(ev) { return this.#soltarItem(ev); }
  async #soltarItem(ev) {
    let d = null;
    try { d = JSON.parse(ev.dataTransfer?.getData("text/plain") ?? ""); } catch (err) { d = null; }
    if (d?.type !== "Item" || !d.uuid) return;
    const item = await fromUuid(d.uuid);
    if (!item || item.parent === this.actor) return;
    const dados = item.toObject(); delete dados._id;
    if (dados.system && "equipado" in dados.system) dados.system.equipado = false;
    await this.actor.createEmbeddedDocuments("Item", [dados]);
  }
  /** O formulário só tem campos de system/name: grava direto. */
  async _processSubmitData(ev, form, dados) { return this.actor.update(dados); }

  #html() {
    const a = this.actor, s = a.system;
    const abas = [["itens", "Itens"], ["configurar", "Configurar"], ["registro", "Registro"]];
    const seg = `<div class="na-seg"><button type="button" class="${s.modo === "bau" ? "on" : ""}" data-action="modo" data-modo="bau">Baú</button><button type="button" class="${s.modo === "loja" ? "on" : ""}" data-action="modo" data-modo="loja">Loja</button></div>`;
    const cab = `<header class="na-cab na-cab-mestre">
      <a class="na-retrato" data-action="editarImagem" title="Trocar imagem"><img src="${ESC(a.img)}" alt=""></a>
      <div class="na-cab-txt"><input type="text" name="name" class="na-nome" value="${ESC(a.name)}"><span class="na-sub">Armazenamento · só o Mestre edita</span></div>
      ${seg}
    </header>
    <nav class="na-abas">${abas.map(([k, r]) => `<a class="${this.estado.aba === k ? "on" : ""}" data-action="aba" data-aba="${k}">${r}${k === "registro" && (s.registro ?? []).length ? ` <small>${(s.registro ?? []).length}</small>` : ""}</a>`).join("")}
      <span class="na-abas-dir"><a class="na-link" data-action="verComoJogador" title="Abrir a janela que os jogadores veem"><i class="fas fa-eye"></i> Ver como jogador</a><a class="na-link" data-action="mostrar" title="Abrir esta janela na tela dos jogadores que podem abrir"><i class="fas fa-share"></i> Mostrar aos jogadores</a></span>
    </nav>`;
    const corpo = this.estado.aba === "configurar" ? this.#configurar() : this.estado.aba === "registro" ? this.#registro() : this.#itens();
    return `<div class="na-janela na-mestre">${cab}<div class="na-corpo" data-rola="corpo">${corpo}</div>
      <footer class="na-rodape"><span class="na-rodape-txt">As mudanças valem na hora para quem estiver com ${s.modo === "loja" ? "a loja aberta" : "o baú aberto"}.</span></footer></div>`;
  }

  #itens() {
    const a = this.actor, s = a.system, loja = s.modo === "loja";
    const lista = a.items.filter(i => passaFiltro(i, this.estado.filtro, this.estado.busca));
    const usados = a.items.size;
    const barra = s.semLimite || loja ? "" : `<div class="na-espacos na-espacos-larga"><span>Espaços</span><i style="--p:${Math.min(100, Math.round(usados / s.espacos * 100))}%"></i><b>${usados} / ${s.espacos}</b></div>`;
    const linhas = lista.map(it => {
      const c = cfgItem(it);
      const qtdCol = loja
        ? `<label class="na-campo-moeda"><i>ƒ</i><input type="text" inputmode="numeric" data-cfg="preco" data-id="${it.id}" value="${fmt(c.preco)}" title="Preço base (o ajuste da loja é aplicado por cima)"></label>
           <input type="text" class="na-estoque" data-cfg="estoque" data-id="${it.id}" value="${c.estoque < 0 ? "∞" : fmt(c.estoque)}" title="Estoque (vazio ou ∞ = sem fim)">`
        : `<span class="na-tem">${ehPilha(it) ? `×${fmt(qtdDe(it))}` : ""}</span>`;
      return `<div class="na-linha ${c.oculto ? "oculto" : ""}">
        <a class="na-linha-ic" data-action="abrirItem" data-id="${it.id}" title="Abrir o item">${icone(it)}</a>
        <div class="na-linha-nome"><b>${ESC(it.name)}</b><div class="na-chips">${chips(it)}</div></div>
        ${qtdCol}
        <a class="na-ic-btn ${c.oculto ? "off" : ""}" data-action="oculto" data-id="${it.id}" title="${c.oculto ? "Oculto dos jogadores (clique para mostrar)" : "Visível aos jogadores (clique para ocultar)"}"><i class="fas ${c.oculto ? "fa-eye-slash" : "fa-eye"}"></i></a>
        <a class="na-ic-btn" data-action="remover" data-id="${it.id}" title="Tirar do ${loja ? "estoque da loja" : "baú"}"><i class="fas fa-trash"></i></a>
      </div>`;
    }).join("");
    return `${barra}
      <div class="na-ferramentas">${busca(this.estado.busca, "Procurar item…")}${filtroBarra(this.estado.filtro)}</div>
      <div class="na-tabela ${loja ? "loja" : "bau"}">
        <div class="na-tabela-cab"><span></span><span>Item</span>${loja ? "<span>Preço</span><span>Estoque</span>" : "<span>Qtd.</span>"}<span></span><span></span></div>
        ${linhas || `<p class="na-vazio">${a.items.size ? "Nada encontrado." : "Vazio."}</p>`}
      </div>
      <div class="na-solta"><i class="fas fa-arrow-down-to-bracket"></i> Arraste itens do compêndio, do diretório de itens ou de uma ficha para cá</div>`;
  }

  #configurar() {
    const s = this.actor.system, loja = s.modo === "loja", m = s.mapa ?? {};
    // Linha de opção: texto à esquerda, controle à direita (tudo alinhado na mesma coluna).
    const op = (rot, dica, ctl, extra = "") => `<div class="na-op ${extra}"><div class="na-op-txt"><b>${rot}</b>${dica ? `<small>${dica}</small>` : ""}</div><div class="na-op-ctl">${ctl}</div></div>`;
    const sw = (nome, v, extra = "") => `<label class="na-sw"><input type="checkbox" name="${nome}" ${v ? "checked" : ""} ${extra}><i></i></label>`;
    const num = (nome, v, extra = "", suf = "", pre = "") => `<span class="na-num">${pre ? `<em class="na-pre">${pre}</em>` : ""}<input type="number" name="${nome}" value="${v}" ${extra}><em>${suf || "&nbsp;"}</em></span>`;
    const sel = (nome, opcoes, v) => `<select name="${nome}">${opcoes.map(([k, r]) => `<option value="${ESC(k)}" ${String(k) === String(v) ? "selected" : ""}>${ESC(r)}</option>`).join("")}</select>`;
    // Quem pode abrir: busca + etiquetas (até 3) + "+N".
    const jogadores = (game.users?.contents ?? [...(game.users ?? [])]).filter(u => !u.isGM);
    const escolhidos = (s.escolhidos ?? []).map(id => game.users.get(id)).filter(Boolean);
    const mostrar = this.estado.verTodos ? escolhidos : escolhidos.slice(0, 3);
    const termo = this.estado.buscaQuem.toLocaleLowerCase("pt-BR");
    const sugestoes = termo ? jogadores.filter(u => !(s.escolhidos ?? []).includes(u.id) && (u.name.toLocaleLowerCase("pt-BR").includes(termo) || (u.character?.name ?? "").toLocaleLowerCase("pt-BR").includes(termo))).slice(0, 6) : [];
    const escolhidosHtml = s.quemAbre !== "escolhidos" ? "" : `<div class="na-escolhidos">
      ${busca(this.estado.buscaQuem, "Procurar jogador ou personagem…").replace("na-busca-in", "na-busca-quem").replace('data-foco="busca"', 'data-foco="quem"')}
      ${sugestoes.length ? `<div class="na-sugestoes">${sugestoes.map(u => `<a data-action="addEscolhido" data-id="${u.id}"><b>${ESC(u.name)}</b>${u.character ? ` <small>${ESC(u.character.name)}</small>` : ""}</a>`).join("")}</div>` : ""}
      <div class="na-tags">${mostrar.map(u => `<span class="na-tag">${ESC(u.name)}<a data-action="tirarEscolhido" data-id="${u.id}" title="Tirar">✕</a></span>`).join("")}${!this.estado.verTodos && escolhidos.length > 3 ? `<a class="na-tag na-tag-mais" data-action="verTodos" title="Ver todos">+${escolhidos.length - 3}</a>` : ""}${this.estado.verTodos && escolhidos.length > 3 ? `<a class="na-tag na-tag-mais" data-action="verTodos">menos</a>` : ""}${!escolhidos.length ? `<span class="na-dica">Ninguém escolhido ainda: procure acima.</span>` : ""}</div>
    </div>`;
    const moedas = [...new Set(["Florins", s.moeda, ...(game.items?.contents ?? []).filter(i => naurenEhMoeda(i)).map(i => i.name)].filter(Boolean))];
    // Pontos no mapa desta cena.
    const pontos = canvas?.scene ? pontosDaCena(canvas.scene).filter(p => p.comportamento.system.armazem === this.actor.uuid) : [];
    const outras = (game.scenes?.contents ?? []).filter(c => c !== canvas?.scene && pontosDaCena(c).some(p => p.comportamento.system.armazem === this.actor.uuid)).length;
    const icones = [...Object.entries(ICONES).map(([k, v]) => [k, v.rotulo]), ["proprio", "Imagem do armazenamento"], ["imagem", "Outra imagem"]];
    return `<div class="na-config">
      <section class="na-caixa"><h3>Espaços</h3>
        ${op("Quantos espaços", "uma pilha ocupa 1", num("system.espacos", s.espacos, `min="1" max="500" ${s.semLimite ? "disabled" : ""}`))}
        ${op("Sem limite de espaços", "", sw("system.semLimite", s.semLimite))}
        ${op("Máximo por pilha", "0 = sem limite", num("system.maxPilha", s.maxPilha, `min="0"`))}
      </section>
      <section class="na-caixa"><h3>Quem pode abrir</h3>
        <div class="na-seg na-seg-3">${[["todos", "Todos"], ["escolhidos", "Escolhidos"], ["mestre", "Só o Mestre"]].map(([k, r]) => `<button type="button" class="${s.quemAbre === k ? "on" : ""}" data-action="quem" data-quem="${k}">${r}</button>`).join("")}</div>
        ${escolhidosHtml}
        ${op(loja ? "Pode comprar" : "Pode pegar", "", sw("system.podePegar", s.podePegar))}
        ${op(loja ? "Pode vender" : "Pode guardar", loja ? "só com a compra de volta ligada" : "", sw("system.podeGuardar", s.podeGuardar))}
      </section>
      <section class="na-caixa"><h3>Tranca e distância</h3>
        ${op("Trancado", "", sw("system.trancado", s.trancado))}
        ${op("Abre com o item", "nome exato · vazio = só o Mestre abre", `<input type="text" name="system.chave" value="${ESC(s.chave)}" placeholder="ex.: Chave de Ferro">`, "na-op-largo")}
        ${op("Gasta a chave ao abrir", "", sw("system.gastaChave", s.gastaChave))}
        ${op("Exigir distância", "desligado: abre de qualquer lugar", sw("system.exigirDistancia", s.exigirDistancia))}
        ${op("Distância máxima", "de um token do jogador até o ponto", num("system.distancia", s.distancia, `min="0" step="0.5" ${s.exigirDistancia ? "" : "disabled"}`, "m"), s.exigirDistancia ? "" : "na-op-off")}
      </section>
      <section class="na-caixa ${loja ? "" : "na-apagada"}"><h3>Loja ${loja ? "" : "<small>· só no modo Loja</small>"}</h3>
        ${op("Moeda", "", sel("system.moeda", moedas.map(x => [x, x]), s.moeda))}
        ${op("Ajuste dos preços", "promoção ou inflação", num("system.ajustePreco", s.ajustePreco, `min="0" max="10000"`, "%"))}
        ${op("Compra de volta", "compra o que ela também vende", sw("system.compraDeVolta", s.compraDeVolta))}
        ${op("Paga do preço", "", num("system.pagaPercent", s.pagaPercent, `min="0" max="1000" ${s.compraDeVolta ? "" : "disabled"}`, "%"), s.compraDeVolta ? "" : "na-op-off")}
        ${op("Caixa sem limite", "", sw("system.caixaSemLimite", s.caixaSemLimite))}
        ${op("Caixa da loja", "", num("system.caixa", s.caixa, `min="0" ${s.caixaSemLimite ? "disabled" : ""}`, "", "ƒ"), s.caixaSemLimite ? "na-op-off" : "")}
        ${op("Frase da loja", "aparece no topo", `<input type="text" name="system.frase" value="${ESC(s.frase)}" placeholder="ex.: Aço bom não é barato.">`, "na-op-largo")}
      </section>
      <section class="na-caixa na-larga"><h3>No mapa</h3>
        <div class="na-mapa">
          <div class="na-mapa-op">
            ${op("Ícone", "", sel("system.mapa.icone", icones, m.icone ?? "bau"))}
            ${m.icone === "imagem" ? op("Imagem", "caminho do arquivo", `<input type="text" name="system.mapa.imagem" value="${ESC(m.imagem ?? "")}" placeholder="icons/...">`, "na-op-largo") : ""}
            ${op("Tamanho", "em quadrados", num("system.mapa.tamanho", m.tamanho ?? 0.4, `min="0.2" max="4" step="0.1"`, "qd"))}
            ${op("Nome sempre visível", "senão, ao passar o mouse", sw("system.mapa.rotuloSempre", m.rotuloSempre))}
          </div>
          <div class="na-mapa-op">
            ${op("Só na visão do jogador", "igual às portas", sw("system.mapa.soNaVisao", m.soNaVisao !== false))}
            ${op("Abrir ao entrar", "quando um token do jogador entra", sw("system.mapa.abrirAoEntrar", m.abrirAoEntrar))}
            <div class="na-mapa-acao">
              <button type="button" class="na-btn na-principal" data-action="colocarNoMapa" ${canvas?.scene ? "" : "disabled"}><i class="fas fa-location-dot"></i> Colocar no mapa</button>
              <span class="na-dica">${pontos.length ? `${pontos.length} ponto(s) nesta cena` : "Nenhum ponto nesta cena"}${outras ? ` · em mais ${outras} cena(s)` : ""}</span>
            </div>
            ${pontos.map(({ regiao }) => `<div class="na-ponto"><i class="fas fa-location-dot"></i><span>${ESC(regiao.name)}</span><a class="na-ic-btn" data-action="irPonto" data-id="${regiao.id}" title="Mostrar no mapa"><i class="fas fa-crosshairs"></i></a><a class="na-ic-btn" data-action="tirarPonto" data-id="${regiao.id}" title="Tirar do mapa"><i class="fas fa-trash"></i></a></div>`).join("")}
          </div>
        </div>
        <p class="na-dica">"Colocar no mapa": clique no lugar do mapa (Esc cancela). O sistema cria a Região com o nome deste armazenamento e o comportamento pronto. Um mesmo armazenamento pode estar em várias cenas.</p>
      </section>
    </div>`;
  }

  #registro() {
    const reg = (this.actor.system.registro ?? []).map((e, i) => ({ ...e, i })).reverse();
    const verbo = { pegar: "pegou", guardar: "guardou", comprar: "comprou", vender: "vendeu", destrancar: "abriu com" };
    const hora = t => { try { return new Date(t).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); } catch (err) { return ""; } };
    const linhas = reg.map(e => `<div class="na-reg ${e.desfeito ? "desfeito" : ""}">
      <span class="na-reg-hora" title="${ESC(new Date(e.t).toLocaleString("pt-BR"))}">${hora(e.t)}</span>
      <span class="na-reg-txt"><b>${ESC(e.atorNome ?? "?")}</b> ${verbo[e.op] ?? e.op} ${ESC(rot(e.qtd ?? 1, e.item ?? ""))}${e.desfeito ? " <small>(desfeito)</small>" : ""}</span>
      <span class="na-reg-valor">${e.valor ? moedaHtml(e.valor) : ""}</span>
      ${e.desfeito ? `<span></span>` : `<a class="na-ic-btn" data-action="desfazer" data-indice="${e.i}" title="Desfazer esta troca"><i class="fas fa-rotate-left"></i></a>`}
    </div>`).join("");
    return `<div class="na-registro">${linhas || `<p class="na-vazio">Nenhuma troca ainda.</p>`}</div><p class="na-dica">Guarda as últimas ${REGISTRO_MAX} trocas. Desfazer devolve itens e moedas quando ainda dá.</p>`;
  }

  static #onModo(ev, el) { this.actor.update({ "system.modo": el.dataset.modo }); }
  static #onAba(ev, el) { this.estado.aba = el.dataset.aba; this.render(); }
  static #onFiltro(ev, el) { this.estado.filtro = el.dataset.filtro; this.render(); }
  static async #onOculto(ev, el) { const it = this.actor.items.get(el.dataset.id); if (it) await it.update({ "flags.nauren.armazem.oculto": !cfgItem(it).oculto }); }
  static async #onRemover(ev, el) { const it = this.actor.items.get(el.dataset.id); if (it) await it.delete(); }
  static #onAbrirItem(ev, el) { this.actor.items.get(el.dataset.id)?.sheet?.render(true); }
  static #onQuem(ev, el) { this.actor.update({ "system.quemAbre": el.dataset.quem }); }
  static #onAddEscolhido(ev, el) { const l = [...new Set([...(this.actor.system.escolhidos ?? []), el.dataset.id])]; this.estado.buscaQuem = ""; this.actor.update({ "system.escolhidos": l }); }
  static #onTirarEscolhido(ev, el) { this.actor.update({ "system.escolhidos": (this.actor.system.escolhidos ?? []).filter(x => x !== el.dataset.id) }); }
  static #onVerTodos() { this.estado.verTodos = !this.estado.verTodos; this.render(); }
  static async #onDesfazer(ev, el) {
    const r = await naurenArmazemPedir({ op: "desfazer", armazemUuid: this.actor.uuid, indice: Number(el.dataset.indice), userId: game.user.id });
    if (r?.ok) ui.notifications.info(r.msg); else ui.notifications.warn(r?.msg ?? "Não deu para desfazer.");
  }
  static #onVerComoJogador() { NaurenArmazemJanela.abrir(this.actor); }
  static async #onMostrar() {
    let n = 0;
    for (const u of game.users) {
      if (u.isGM || !u.active || !podeAbrir(this.actor, u)) continue;
      try { await u.query(QUERY_ABRIR, { armazemUuid: this.actor.uuid }, { timeout: 8000 }); n++; } catch (err) { /* segue */ }
    }
    ui.notifications.info(n ? `Aberto para ${n} jogador(es).` : "Nenhum jogador conectado pode abrir este armazenamento.");
  }
  static #onColocarNoMapa() { naurenArmazemColocarNoMapa(this.actor, this); }
  static #onIrPonto(ev, el) {
    const r = canvas?.scene?.regions?.get(el.dataset.id); const ret = retanguloDaRegiao(r);
    if (ret) canvas.animatePan?.({ x: ret.x + ret.w / 2, y: ret.y + ret.h / 2, scale: Math.max(canvas.stage?.scale?.x ?? 1, 1) });
  }
  static async #onTirarPonto(ev, el) {
    const r = canvas?.scene?.regions?.get(el.dataset.id); if (!r) return;
    await r.delete(); this.render();
  }
  static #onEditarImagem() {
    const FP = foundry.applications.apps?.FilePicker?.implementation ?? foundry.applications.apps?.FilePicker;
    if (!FP) return;
    new FP({ type: "image", current: this.actor.img, callback: p => this.actor.update({ img: p }) }).render(true);
  }
}

/* ============================ PONTO NO MAPA (Região) ============================ */
class NaurenArmazemComportamento extends (foundry.data?.regionBehaviors?.RegionBehaviorType ?? foundry.abstract.TypeDataModel) {
  static defineSchema() {
    const { StringField, DocumentUUIDField } = F();
    // A aparência do ponto (ícone, tamanho, nome, visão, abrir ao entrar) fica no próprio armazenamento (aba Configurar).
    const uuid = DocumentUUIDField ? new DocumentUUIDField({ type: "Actor", label: "Armazenamento", hint: "O ator do tipo Armazenamento (baú ou loja). Ícone e opções ficam na ficha dele, aba Configurar." }) : new StringField({ initial: "", label: "Armazenamento" });
    return { armazem: uuid };
  }
  static events = { [globalThis.CONST?.REGION_EVENTS?.TOKEN_ENTER ?? "tokenEnter"]: NaurenArmazemComportamento.#aoEntrar };
  /** Abrir sozinho quando um token do jogador entra (roda no computador de quem moveu). */
  static async #aoEntrar(event) {
    try {
      const u = event?.user;
      if (u && u !== game.user && u.id !== game.user.id) return;
      if (game.user.isGM) return;
      const tk = event.data?.token;
      if (!tk?.actor || !ehDono(tk.actor, game.user)) return;
      const armazem = this.armazem ? await fromUuid(this.armazem) : null;
      if (!armazem?.system?.mapa?.abrirAoEntrar) return;
      NaurenArmazemJanela.abrir(armazem, { ator: tk.actor, regiaoUuid: this.parent?.parent?.uuid ?? this.region?.uuid });
    } catch (err) { console.warn("Nauren RPG | abrir ao entrar", err); }
  }
}

/** "Colocar no mapa": o Mestre clica no lugar e o sistema cria a Região (1 quadrado) com o comportamento pronto. */
let colocando = null;
function naurenArmazemColocarNoMapa(armazem, ficha = null) {
  if (!game.user.isGM || !canvas?.ready || !canvas.scene) return ui.notifications.warn("Abra uma cena para colocar o ponto.");
  colocando?.cancelar?.();
  ficha?.minimize?.();
  ui.notifications.info(`Clique no mapa onde fica "${armazem.name}". Esc ou botão direito cancela.`);
  const palco = canvas.stage;
  // 0.101.3: prévia que segue o mouse — o quadrado da grade acende e o ícone aparece onde vai ficar.
  const PIXI_ = globalThis.PIXI;
  const g0 = canvas.grid?.size || canvas.dimensions?.size || 100;
  const cfg = armazem.system?.mapa ?? {};
  const tam = Math.round(g0 * (Number(cfg.tamanho) || 0.4));
  let previa = null;
  try {
    previa = new PIXI_.Container(); previa.name = "naurenArmazemPrevia"; previa.eventMode = "none";
    const casa = new PIXI_.Graphics(); casa.beginFill(0xe0b257, 0.22).lineStyle(3, 0xe0b257, 0.95).drawRect(0, 0, g0, g0).endFill();
    const ic = new PIXI_.Container(); ic.position.set(g0 / 2, g0 / 2); ic.alpha = 0.85;
    const corte = tam * 0.22, m = tam / 2 + 3;
    const fundo = new PIXI_.Graphics(); fundo.beginFill(0x1b1524, 0.88).lineStyle(Math.max(2, tam * 0.04), 0xe0b257, 1)
      .drawPolygon([-m + corte, -m, m - corte, -m, m, -m + corte, m, m - corte, m - corte, m, -m + corte, m, -m, m - corte, -m, -m + corte]).endFill();
    ic.addChild(fundo);
    const src = cfg.icone === "imagem" && cfg.imagem ? cfg.imagem : cfg.icone === "proprio" ? armazem.img : (ICONES[cfg.icone]?.img ?? armazem.img);
    foundry.canvas.loadTexture(src).then(tex => { if (!tex || previa?.destroyed) return; const sp = new PIXI_.Sprite(tex); sp.anchor.set(0.5); const k = Math.min(tam * 0.84 / (tex.width || 1), tam * 0.84 / (tex.height || 1)); sp.scale.set(k); ic.addChild(sp); }).catch(() => {});
    const rot = new PIXI_.Text(armazem.name, { fontFamily: "Signika", fontSize: Math.max(14, Math.round(g0 * 0.2)), fill: 0xf4ead1, stroke: 0x000000, strokeThickness: 4 });
    rot.anchor.set(0.5, 0); rot.position.set(0, m + 4); ic.addChild(rot);
    previa.addChild(casa, ic); previa.visible = false;
    (canvas.controls ?? canvas.interface ?? palco).addChild(previa);
  } catch (err) { previa = null; }
  const casaDe = pos => {
    let tl = { x: Math.floor(pos.x / g0) * g0, y: Math.floor(pos.y / g0) * g0 };
    try { const p = canvas.grid.getTopLeftPoint?.(pos); if (p) tl = p; } catch (err) { /* conta simples */ }
    return tl;
  };
  const aoMover = ev => {
    if (!previa) return;
    const pos = ev.getLocalPosition ? ev.getLocalPosition(palco) : ev.data?.getLocalPosition?.(palco);
    if (!pos) return;
    const tl = casaDe(pos);
    previa.position.set(tl.x, tl.y); previa.visible = true;
  };
  const fim = () => { palco.off("pointerdown", aoClicar); palco.off("pointermove", aoMover); try { previa?.destroy({ children: true }); } catch (err) { /* segue */ } previa = null; document.removeEventListener("keydown", aoTecla, true); colocando = null; ficha?.maximize?.(); };
  const aoTecla = ev => { if (ev.key === "Escape") { ev.stopPropagation(); fim(); ui.notifications.info("Cancelado."); } };
  const aoClicar = async ev => {
    if (ev.button === 2) { fim(); ui.notifications.info("Cancelado."); return; }
    if (ev.button !== 0) return;
    ev.stopPropagation?.();
    const pos = ev.getLocalPosition ? ev.getLocalPosition(palco) : ev.data?.getLocalPosition?.(palco);
    fim();
    if (!pos) return;
    const g = canvas.grid?.size || canvas.dimensions?.size || 100;
    let tl = { x: Math.floor(pos.x / g) * g, y: Math.floor(pos.y / g) * g };
    try { const p = canvas.grid.getTopLeftPoint?.(pos); if (p) tl = p; } catch (err) { /* segue com a conta simples */ }
    const n = pontosDaCena(canvas.scene).filter(x => x.comportamento.system.armazem === armazem.uuid).length;
    try {
      await canvas.scene.createEmbeddedDocuments("Region", [naurenAndarParaRegiao({
        name: n ? `${armazem.name} (${n + 1})` : armazem.name,
        color: "#e0b257",
        visibility: CONST.REGION_VISIBILITY?.LAYER ?? 0,
        shapes: [{ type: "rectangle", x: Math.round(tl.x), y: Math.round(tl.y), width: g, height: g }],
        behaviors: [{ type: "armazenamento", name: armazem.name, system: { armazem: armazem.uuid } }],
        flags: { nauren: { armazem: armazem.uuid } }
      })]); // andares (V14): no andar que se está vendo
      ui.notifications.info(`"${armazem.name}" colocado no mapa.`);
    } catch (err) { console.error("Nauren RPG | colocar no mapa", err); ui.notifications.error(`Não deu para criar a Região: ${err.message}`); }
    ficha?.render?.();
  };
  palco.on("pointerdown", aoClicar);
  palco.on("pointermove", aoMover);
  document.addEventListener("keydown", aoTecla, true);
  colocando = { cancelar: fim };
}

/** Comportamentos de armazenamento (ativos) de uma cena: [{ regiao, comportamento }]. */
function pontosDaCena(cena) {
  const out = [];
  for (const r of cena?.regions ?? []) for (const b of r.behaviors ?? []) if (b.type === "armazenamento" && !b.disabled && b.system?.armazem) out.push({ regiao: r, comportamento: b });
  return out;
}

/* ---------- ícones clicáveis no canvas (como as portas) ---------- */
let camada = null;
function apagarIcones() { try { camada?.destroy?.({ children: true }); } catch (err) { /* segue */ } camada = null; }
async function desenharIcones() {
  apagarIcones();
  try {
    if (!canvas?.ready || !canvas.scene) return;
    const pontos = pontosDaCena(canvas.scene);
    if (!pontos.length) return;
    const PIXI_ = globalThis.PIXI;
    if (!PIXI_) return;
    camada = new PIXI_.Container();
    camada.name = "naurenArmazens";
    camada.sortableChildren = true;
    (canvas.controls ?? canvas.interface ?? canvas.stage).addChild(camada);
    for (const { regiao, comportamento } of pontos) {
      const ret = retanguloDaRegiao(regiao);
      if (!ret) continue;
      const armazem = await fromUuid(comportamento.system.armazem).catch(() => null);
      if (!armazem) continue;
      const cfg = armazem.system.mapa ?? {};
      const grade = canvas.grid?.size || canvas.dimensions?.size || 100;
      const cx = ret.x + ret.w / 2, cy = ret.y + ret.h / 2, tam = Math.round(grade * (Number(cfg.tamanho) || 0.4));
      const ic = new PIXI_.Container();
      ic.position.set(cx, cy);
      ic.eventMode = "static"; ic.cursor = "pointer";
      ic.hitArea = new PIXI_.Rectangle(-tam / 2 - 6, -tam / 2 - 6, tam + 12, tam + 12);
      const fundo = new PIXI_.Graphics();
      const corte = tam * 0.22, m = tam / 2 + 3;
      fundo.beginFill(0x1b1524, 0.88).lineStyle(Math.max(2, tam * 0.04), 0xe0b257, 1);
      fundo.drawPolygon([-m + corte, -m, m - corte, -m, m, -m + corte, m, m - corte, m - corte, m, -m + corte, m, -m, m - corte, -m, -m + corte]);
      fundo.endFill();
      ic.addChild(fundo);
      const src = cfg.icone === "imagem" && cfg.imagem ? cfg.imagem : cfg.icone === "proprio" ? armazem.img : (ICONES[cfg.icone]?.img ?? armazem.img);
      try {
        const tex = await foundry.canvas.loadTexture(src).catch(() => null);
        if (tex) { const sp = new PIXI_.Sprite(tex); sp.anchor.set(0.5); const k = Math.min(tam * 0.84 / (tex.width || 1), tam * 0.84 / (tex.height || 1)); sp.scale.set(k); ic.addChild(sp); }
      } catch (err) { /* sem imagem: fica só a moldura */ }
      if (armazem.system.trancado) {
        const r0 = Math.max(7, tam * 0.16);
        const cad = new PIXI_.Graphics(); cad.beginFill(0x1b1524).lineStyle(2, 0xe0b257).drawCircle(m - 2, -m + 2, r0).endFill(); ic.addChild(cad);
        const t = new PIXI_.Text("🔒", { fontSize: Math.round(r0 * 1.2) }); t.anchor.set(0.5); t.position.set(m - 2, -m + 2); ic.addChild(t);
      }
      const nome = armazem.name;
      const rotulo = new PIXI_.Text(nome, { fontFamily: "Signika", fontSize: Math.max(14, Math.round(grade * 0.2)), fill: 0xf4ead1, stroke: 0x000000, strokeThickness: 4 });
      rotulo.anchor.set(0.5, 0); rotulo.position.set(0, m + 4); rotulo.visible = !!cfg.rotuloSempre;
      ic.addChild(rotulo);
      ic.on("pointerover", () => { rotulo.visible = true; fundo.tint = 0xfff2c9; });
      ic.on("pointerout", () => { rotulo.visible = !!cfg.rotuloSempre; fundo.tint = 0xffffff; });
      ic.on("pointerdown", ev => { ev.stopPropagation?.(); naurenArmazemClicarPonto(regiao, comportamento); });
      ic.naurenPonto = { cx, cy, soNaVisao: cfg.soNaVisao !== false, regiao };
      camada.addChild(ic);
    }
    atualizarVisibilidade();
  } catch (err) { console.warn("Nauren RPG | ícones de armazenamento", err); }
}
function atualizarVisibilidade() {
  if (!camada) return;
  for (const ic of camada.children ?? []) {
    const p = ic.naurenPonto; if (!p) continue;
    if (game.user.isGM || !p.soNaVisao) { ic.visible = true; continue; }
    let ve = true;
    try { ve = canvas.visibility?.testVisibility?.({ x: p.cx, y: p.cy }, { tolerance: 8 }) ?? true; } catch (err) { ve = true; }
    ic.visible = ve;
  }
}
/** Clique no ponto do mapa: confere a distância (se ligada) e abre. */
async function naurenArmazemClicarPonto(regiao, comportamento) {
  const armazem = await fromUuid(comportamento.system.armazem).catch(() => null);
  if (!armazem) return ui.notifications.warn("Este ponto não aponta para um armazenamento.");
  if (game.user.isGM) return armazem.sheet?.render(true);
  const ator = atorPadraoDoUsuario();
  const s = armazem.system;
  if (s.exigirDistancia && ator && distanciaAtorRegiao(ator, regiao) > (Number(s.distancia) || 0) + 0.01) {
    return ui.notifications.warn(`Longe demais. Chegue a ${fmt(s.distancia)} m de ${armazem.name} com um token seu.`);
  }
  NaurenArmazemJanela.abrir(armazem, { ator, regiaoUuid: regiao.uuid });
}

/* ============================ REGISTRO NO FOUNDRY ============================ */
function naurenArmazemInit() {
  CONFIG.Actor.dataModels.armazenamento = NaurenArmazenamentoData;
  if (CONFIG.RegionBehavior?.dataModels) CONFIG.RegionBehavior.dataModels.armazenamento = NaurenArmazemComportamento;
  if (CONFIG.RegionBehavior?.typeIcons) CONFIG.RegionBehavior.typeIcons.armazenamento = "fas fa-box-archive";
  CONFIG.queries ??= {};
  CONFIG.queries[QUERY] = naurenArmazemHandleQuery;
  CONFIG.queries[QUERY_ABRIR] = async ({ armazemUuid } = {}) => { const a = await fromUuid(armazemUuid); if (a) NaurenArmazemJanela.abrir(a); return true; };
  game.settings.register("nauren", "armazemTamanho04", { scope: "world", config: false, type: Boolean, default: false });
  const Colecao = foundry.documents.collections?.Actors ?? globalThis.Actors;
  Colecao?.registerSheet?.("nauren", NaurenArmazemSheet, { types: ["armazenamento"], makeDefault: true, label: "Nauren: Armazenamento" });
}
function naurenArmazemHooks() {
  // Redesenha as janelas abertas quando o armazenamento ou o personagem mudam (tempo real).
  const redesenhar = foundry.utils.debounce(() => { for (const j of janelasAbertas) if (j.rendered) j.render(); }, 60);
  const toca = doc => { const a = doc?.documentName === "Actor" ? doc : doc?.parent; if (!a) return; for (const j of janelasAbertas) if (j.armazem === a || j.armazem?.id === a.id || j.ator?.id === a.id) { redesenhar(); break; } };
  for (const h of ["updateActor", "createItem", "updateItem", "deleteItem"]) Hooks.on(h, doc => toca(doc));
  Hooks.on("userConnected", () => redesenhar());
  // Ícones no mapa.
  Hooks.on("canvasReady", () => desenharIcones());
  Hooks.on("canvasTearDown", () => apagarIcones());
  const redesenharIcones = foundry.utils.debounce(() => desenharIcones(), 120);
  for (const h of ["createRegion", "updateRegion", "deleteRegion", "createRegionBehavior", "updateRegionBehavior", "deleteRegionBehavior"]) Hooks.on(h, () => redesenharIcones());
  Hooks.on("updateActor", a => { if (a.type === "armazenamento" && camada) redesenharIcones(); });
  Hooks.on("sightRefresh", () => atualizarVisibilidade());
  // 0.101.4: tamanho padrão do ícone no mapa: 0,4 quadrado (os que estavam no padrão antigo, 0,8 ou 0,6, passam para 0,4).
  Hooks.once("ready", async () => {
    try {
      if (!game.user.isGM || game.settings.get("nauren", "armazemTamanho04")) return;
      for (const a of game.actors.filter(x => x.type === "armazenamento" && [0.8, 0.6].includes(Number(x.system?.mapa?.tamanho)))) await a.update({ "system.mapa.tamanho": 0.4 });
      await game.settings.set("nauren", "armazemTamanho04", true);
    } catch (err) { console.warn("Nauren RPG | tamanho dos baús", err); }
  });
}

export { NaurenArmazenamentoData, NaurenArmazemComportamento, NaurenArmazemJanela, NaurenArmazemSheet, naurenArmazemInit, naurenArmazemHooks, naurenArmazemPedir, naurenArmazemExecutar, naurenArmazemClicarPonto, naurenArmazemColocarNoMapa, pontosDaCena as naurenArmazemPontosDaCena, distanciaAtorRegiao as naurenArmazemDistancia, precoFinal as naurenArmazemPreco };
