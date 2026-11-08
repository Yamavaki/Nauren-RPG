/**
 * Nauren RPG — suporte a andares (Levels do Foundry V14).
 *
 * Um lugar só para as regras de "mesmo andar" usadas no sistema inteiro: áreas, auras, alcance, vizinhos,
 * colisão com paredes, tokens e Regiões criados pelo sistema. Cena sem andares (ou com 1 só): nada muda.
 *
 * API do V14 usada: Scene#levels, TokenDocument#level (ID do andar), Token/Region#elevation,
 * RegionDocument#levels (IDs dos andares da Região) e #elevation {bottom, top, topInclusive},
 * PointSourcePolygon.testCollision(ElevatedPoint, ElevatedPoint, { level }), canvas.level (andar visto).
 */

/** A cena tem mais de um andar? */
export function naurenCenaTemAndares(cena = globalThis.canvas?.scene) {
  const l = cena?.levels;
  return !!l && (l.size ?? l.length ?? 0) > 1;
}

/** ID do andar de um Token/TokenDocument (ou null). */
export function naurenAndarDe(obj) {
  const d = obj?.document ?? obj;
  const l = d?.level;
  if (!l) return null;
  return typeof l === "object" ? (l.id ?? null) : String(l);
}

/** Documento Level de um ID (ou do token). */
export function naurenNivelDoc(idOuObj, cena = globalThis.canvas?.scene) {
  const id = typeof idOuObj === "string" ? idOuObj : naurenAndarDe(idOuObj);
  return id ? (cena?.levels?.get?.(id) ?? null) : null;
}

/** Elevação (em metros) de um Token/TokenDocument/ponto com elevation, ou null. */
export function naurenElevacaoDe(obj) {
  const d = obj?.document ?? obj;
  const e = Number(d?.elevation);
  return Number.isFinite(e) ? e : null;
}

/** Os dois estão no mesmo andar? Sem andares na cena, ou sem andar marcado em algum dos dois: sim. */
export function naurenMesmoAndar(a, b) {
  const d = a?.document ?? a;
  if (!naurenCenaTemAndares(d?.parent ?? globalThis.canvas?.scene)) return true;
  const la = naurenAndarDe(a), lb = naurenAndarDe(b);
  return !la || !lb || la === lb;
}

/** Só os tokens do mesmo andar de "ref" (lista padrão: os tokens da cena). */
export function naurenTokensDoAndar(ref, lista = globalThis.canvas?.tokens?.placeables ?? []) {
  if (!ref || !naurenCenaTemAndares()) return lista;
  return lista.filter(t => naurenMesmoAndar(ref, t));
}

const listaDe = v => v instanceof Set ? [...v] : Array.isArray(v) ? v : (v && typeof v[Symbol.iterator] === "function" ? [...v] : []);

/**
 * O token está no andar e na faixa de altura da Região? (a parte de "dentro da forma" é testada à parte).
 * Região sem andares marcados vale para todos; faixa de altura vazia (null) = sem limite.
 */
export function naurenNoAndarDaRegiao(tokenDoc, regiao) {
  if (!tokenDoc || !regiao) return true;
  const td = tokenDoc.document ?? tokenDoc;
  const levels = listaDe(regiao.levels);
  if (levels.length && naurenCenaTemAndares(td.parent ?? regiao.parent)) {
    const l = naurenAndarDe(td);
    if (l && !levels.includes(l)) return false;
  }
  const el = regiao.elevation, e = naurenElevacaoDe(td);
  if (el && e !== null) {
    const bottom = el.bottom ?? -Infinity, top = el.top ?? Infinity;
    if (e < bottom) return false;
    if (el.topInclusive === false ? e >= top : e > top) return false;
  }
  return true;
}

/**
 * Marca os andares de uma Região que o sistema vai criar (dados de criação): o andar de "ref" (token de quem usou),
 * senão o andar que se está vendo. Não mexe se os dados já trazem andares ou se a cena não tem andares.
 */
export function naurenAndarParaRegiao(dados, ref = null) {
  if (!dados || listaDe(dados.levels).length || !naurenCenaTemAndares()) return dados;
  const id = naurenAndarDe(ref) ?? globalThis.canvas?.level?.id ?? null;
  if (id) dados.levels = [id];
  return dados;
}

/**
 * Marca andar e altura de um token que o sistema vai criar (invocação, entidade, orbe…) no andar de "ref".
 * Não mexe no que os dados já trazem.
 */
export function naurenAndarParaToken(dados, ref = null) {
  if (!dados) return dados;
  if (naurenCenaTemAndares() && !dados.level) {
    const id = naurenAndarDe(ref) ?? globalThis.canvas?.level?.id ?? null;
    if (id) dados.level = id;
  }
  if (dados.elevation === undefined || dados.elevation === null) {
    const e = naurenElevacaoDe(ref);
    if (e !== null) dados.elevation = e;
  }
  return dados;
}

/**
 * Parede no caminho de "de" até "para" (movimento), no andar e na altura de "ref".
 * Sem "ref", usa o andar visto (padrão do Foundry). Devolve true/false.
 */
export function naurenColideParede(de, para, ref = null) {
  const backend = globalThis.CONFIG?.Canvas?.polygonBackends?.move;
  const e = naurenElevacaoDe(ref) ?? 0;
  const o = { x: de.x, y: de.y, elevation: de.elevation ?? e }, d = { x: para.x, y: para.y, elevation: para.elevation ?? e };
  const cfg = { type: "move", mode: "any" };
  const nivel = naurenNivelDoc(ref);
  if (nivel) cfg.level = nivel;
  try {
    if (backend?.testCollision) return !!backend.testCollision(o, d, cfg);
  } catch (err) {
    // build que recuse o "level": tenta sem ele
    try { delete cfg.level; if (backend?.testCollision) return !!backend.testCollision(o, d, cfg); } catch (err2) { /* segue */ }
  }
  const obj = ref?.object ?? (ref?.document ? ref : null);
  try { return !!obj?.checkCollision?.(d, { origin: o, type: "move", mode: "any" }); } catch (err) { return false; }
}

/**
 * Altura (piso) onde desenhar um efeito solto no mapa (sem token): o piso do primeiro andar da Região,
 * senão o do andar que se está vendo. Sem andares: null (deixa o padrão do Sequencer).
 */
export function naurenElevacaoDoPiso(regiao = null) {
  if (!naurenCenaTemAndares()) return null;
  const ids = listaDe(regiao?.levels);
  const nivel = (ids.length ? naurenNivelDoc(ids[0]) : null) ?? globalThis.canvas?.level ?? null;
  const b = Number(nivel?.elevation?.bottom);
  return Number.isFinite(b) ? b : null;
}

/**
 * Área grudada no token (Emanação, aura): quando o token troca de andar (escada, Região "Mudar de Andar"),
 * a Região vai junto para o andar novo. Só mexe nas Regiões grudadas que estavam em um andar só.
 */
if (globalThis.Hooks) {
  Hooks.on("updateToken", (doc, mudou) => {
    if (!("level" in (mudou ?? {})) || !game.user?.isGM) return;
    const novo = naurenAndarDe(doc); if (!novo) return;
    const ups = [];
    for (const r of doc.parent?.regions ?? []) {
      const presa = r.attachment?.token?.id ?? r.attachment?.token;
      if (presa !== doc.id) continue;
      const ls = listaDe(r.levels);
      if (ls.length === 1 && ls[0] !== novo) ups.push({ _id: r.id, levels: [novo] });
    }
    if (ups.length) doc.parent.updateEmbeddedDocuments("Region", ups).catch(err => console.warn("Nauren RPG | área no andar novo", err));
  });
}
