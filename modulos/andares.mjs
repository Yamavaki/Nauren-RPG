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

/** Contador de quadros do canvas (sobe uma vez por quadro, em naurenEfeitosNoAndar). */
let naurenQuadroAndar = 0;

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
      // 0.109.17: a Emanação do Nauren acompanha o token por um hook próprio (flag "emanacaoOrigem"), não pelo attachment.
      const daEmanacao = r.flags?.nauren?.emanacaoOrigem?.tokenId;
      if (presa !== doc.id && daEmanacao !== doc.id) continue;
      const ls = listaDe(r.levels);
      if (ls.length <= 1 && ls[0] !== novo) ups.push(r);
    }
    if (!ups.length) return;
    // 0.109.18: trocar só "levels" deixava um desenho fantasma da área no andar antigo (sumia com F5). A área visual da
    // Emanação (só desenho, achada pela flag) é recriada no andar novo e a antiga apagada.
    // 0.109.19: as outras áreas presas ao token NÃO são recriadas - o ID delas é guardado em outros lugares
    // (Condição de Presença "regioesPresenca", "regiaoUuid" das entidades) e recriar soltava esses vínculos;
    // nelas só o andar muda.
    const visuais = ups.filter(r => r.flags?.nauren?.emanacaoOrigem && !r.flags?.nauren?.templatePersistente);
    const outras = ups.filter(r => !visuais.includes(r));
    if (outras.length) doc.parent.updateEmbeddedDocuments("Region", outras.map(r => ({ _id: r.id, levels: [novo] }))).catch(err => console.warn("Nauren RPG | área no andar novo", err));
    if (!visuais.length) return;
    const novas = visuais.map(r => { const d = r.toObject(); delete d._id; d.levels = [novo]; return d; });
    doc.parent.createEmbeddedDocuments("Region", novas)
      .then(() => doc.parent.deleteEmbeddedDocuments("Region", visuais.map(r => r.id)))
      .catch(err => console.warn("Nauren RPG | área no andar novo", err));
  });
}

/** 0.109.13: algum andar de cima (textura do andar ou tile acima do token) cobre o centro do token neste ponto? */
export function naurenPisoCobre(tm, token) {
  // 0.109.19: a moldura, os efeitos e a interface perguntam a mesma coisa no mesmo quadro: calcula uma vez por quadro.
  if (token && token._naurenPisoQuadro === naurenQuadroAndar && naurenQuadroAndar > 0) return token._naurenPisoCobre;
  const r = naurenPisoCobreCalcular(tm, token);
  if (token) { token._naurenPisoQuadro = naurenQuadroAndar; token._naurenPisoCobre = r; }
  return r;
}
function naurenPisoCobreCalcular(tm, token) {
  try {
    const c = token.center ?? { x: tm.position.x, y: tm.position.y };
    // 0.109.16: compara pelos PISOS dos andares (Scene#levels), não pela elevação da malha - o V14 pode desenhar o
    // token de outro andar com outra elevação, e aí o próprio piso dele "cobria" o token (sumia até pelo buraco).
    const baseDe = id => { const b = Number(naurenNivelDoc(id)?.elevation?.bottom); return Number.isFinite(b) ? b : null; };
    const baseTok = baseDe(token.document?.level?.id ?? token.document?.level) ?? Number(token.document?.elevation ?? 0);
    const baseVendo = baseDe(globalThis.canvas?.level?.id) ?? Infinity;
    const acima = e => Number.isFinite(e) && e > baseTok + 0.001 && e <= baseVendo + 0.001;
    const opaco = m => m && !m.destroyed && m.visible !== false && m.renderable !== false && typeof m.containsCanvasPoint === "function" && m.containsCanvasPoint(c, 0.5);
    for (const lt of canvas.primary?.levelTextures ?? []) {
      const e = baseDe(lt.object?.id ?? lt.level?.id ?? lt.levelId) ?? Number(lt.elevation);
      if (acima(e) && opaco(lt)) return true;
    }
    for (const t of canvas.tiles?.placeables ?? []) {
      if (!t.mesh || t.document?.hidden) continue;
      const e = baseDe(t.document?.level?.id ?? t.document?.level) ?? Number(t.document?.elevation);
      if (acima(e) && opaco(t.mesh)) return true;
    }
  } catch (err) { /* sem andares */ }
  return false;
}


/**
 * 0.109.14: efeitos do Sequencer / Automated Animations presos a um token (auras, Condições) não sabem dos andares
 * do V14: aparecem em todos. A cada quadro, um efeito cujo token está em outro andar só é desenhado quando a arte do
 * token também é (buraco no piso) e o piso de cima não cobre o token.
 */
function naurenEspiarArteToken(tm) {
  if (!tm || tm._naurenEspiaAndar || typeof tm._render !== "function") return;
  const orig = tm._render;
  tm._render = function (r) { this._naurenAndarQuadro = naurenQuadroAndar; return orig.call(this, r); };
  tm._naurenEspiaAndar = true;
}
function naurenEfeitosNoAndar() {
  naurenQuadroAndar++;
  if (!globalThis.canvas?.ready || !naurenCenaTemAndares(canvas.scene)) return; // sem andares: nenhum efeito a esconder
  const gerente = globalThis.Sequencer?.EffectManager;
  let lista = null; try { lista = gerente?.effects ?? gerente?.getEffects?.() ?? null; } catch (err) { lista = null; }
  if (!lista) return;
  const vendo = canvas.level?.id;
  for (const ef of (lista instanceof Map ? lista.values() : lista)) {
    try {
      const fonte = ef?.source ?? ef?.sourceDocument?.object ?? null;
      const tok = fonte?.document?.documentName === "Token" ? fonte : (fonte?.documentName === "Token" ? fonte.object : null);
      if (!tok) continue;
      const andar = tok.document?.level?.id ?? tok.document?.level;
      const outro = !!(vendo && andar && andar !== vendo && naurenCenaTemAndares(tok.document.parent));
      let mostrar = true;
      if (outro) {
        const tm = tok.mesh; naurenEspiarArteToken(tm);
        mostrar = !!tm && !tm.destroyed && (naurenQuadroAndar - (tm._naurenAndarQuadro ?? -9) <= 2) && !naurenPisoCobre(tm, tok);
      }
      if (!mostrar && ef.renderable !== false) { ef.renderable = false; ef._naurenOcultoAndar = true; }
      else if (mostrar && ef._naurenOcultoAndar) { ef.renderable = true; ef._naurenOcultoAndar = false; }
    } catch (err) { /* efeito sem token */ }
  }
}
/**
 * 0.109.15: token de outro andar coberto pelo piso de cima (a imagem do andar tem partes transparentes): a arte some
 * pelo recorte do Foundry, mas a parte de interface do token (Condições, barras, borda, elevação, nome) e o passar o
 * mouse continuavam. Coberto = esconde a interface e não responde ao mouse; pelo buraco do piso volta ao normal.
 */
function naurenInterfaceTokensNoAndar() {
  if (!globalThis.canvas?.ready || !canvas.tokens) return;
  const vendo = canvas.level?.id;
  const temAndares = naurenCenaTemAndares(canvas.scene);
  // 0.109.19: cena sem andares e nenhum token escondido por este código: nada a fazer neste quadro.
  if (!temAndares && !naurenAlgumCobertoAndar) return;
  naurenAlgumCobertoAndar = false;
  for (const tok of canvas.tokens.placeables) {
    try {
      const andar = tok.document?.level?.id ?? tok.document?.level;
      let coberto = false;
      if (temAndares && vendo && andar && andar !== vendo && !tok.controlled) {
        // 0.109.18: só o piso decide (o teste "a arte foi desenhada" travava: escondido, o token não era mais desenhado).
        const tm = tok.mesh;
        coberto = !!tm && !tm.destroyed && naurenPisoCobre(tm, tok);
      }
      if (coberto && !tok._naurenCobertoAndar) {
        tok._naurenCobertoAndar = { renderable: tok.renderable, eventMode: tok.eventMode };
        tok.renderable = false; tok.eventMode = "none";
        if (tok.hover) { try { tok._onHoverOut?.(new PointerEvent("pointerleave")); } catch (err) { /* sem hover */ } }
      } else if (coberto) {
        if (tok.renderable) tok.renderable = false; // o Foundry pode religar num refresh
        if (tok.eventMode !== "none") tok.eventMode = "none";
      } else if (tok._naurenCobertoAndar) {
        const o = tok._naurenCobertoAndar; tok._naurenCobertoAndar = null;
        tok.renderable = o.renderable ?? true; tok.eventMode = o.eventMode ?? "static";
      }
      if (coberto) naurenAlgumCobertoAndar = true;
    } catch (err) { /* token sendo apagado */ }
  }
}
let naurenAlgumCobertoAndar = false;
Hooks.on("canvasReady", () => {
  naurenAlgumCobertoAndar = false;
  try {
    canvas.app.ticker.remove(naurenInterfaceTokensNoAndar); canvas.app.ticker.add(naurenInterfaceTokensNoAndar, null, PIXI.UPDATE_PRIORITY.LOW);
    canvas.app.ticker.remove(naurenEfeitosNoAndar); canvas.app.ticker.add(naurenEfeitosNoAndar, null, PIXI.UPDATE_PRIORITY.LOW);
  } catch (err) { /* sem ticker */ }
});

/** 0.109.16: diagnóstico no console (F12): naurenDiagnosticoAndar() com um token selecionado. */
globalThis.naurenDiagnosticoAndar = function (tok = canvas.tokens.controlled[0] ?? canvas.tokens.hover) {
  if (!tok) return console.log("Selecione ou passe o mouse num token.");
  const c = tok.center, nv = canvas.level;
  console.log("Vendo:", nv?.name, nv?.id, "piso", nv?.elevation?.bottom);
  console.log("Token:", tok.name, "andar", tok.document.level?.id ?? tok.document.level, "elev doc", tok.document.elevation, "elev malha", tok.mesh?.elevation);
  (canvas.primary?.levelTextures ?? []).forEach((lt, i) => console.log("levelTexture", i, { nome: lt.name, elev: lt.elevation, objeto: lt.object?.id, visivel: lt.visible, cobre: lt.containsCanvasPoint?.(c, 0.5) }));
  console.log("Coberto (Nauren):", naurenPisoCobre(tok.mesh, tok));
};
