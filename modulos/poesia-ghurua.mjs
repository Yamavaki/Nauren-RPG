/* Nauren RPG — Poesia Ghurua (Místico, livro 0.9; 0.121).
 *
 * Livro (pág. da Poesia): você tem acesso às 3 poesias a partir da Dança do Espírito Bêbado,
 * mas os efeitos não podem ocorrer ao mesmo tempo: escolher uma nova encerra a anterior.
 *   Chuva Infinita (N/P) · Pessoal (20 m): inimigos gastam +1 Estamina para atacar e causam 1 dado
 *     de dano a menos; aliados recuperam 1d6 PV no início de cada turno.
 *   Aroma de Licor (N/P) · Pessoal (20 m de raio) · 1 rodada: 1d6 cabaças em espaços desocupados a até
 *     4 m; na área você recupera 1 Energia no início de cada turno e, ao gastar Energia, recupera Vida
 *     igual. Beber uma cabaça (1 PdE, P/A) ativa Brinde ao Destino; se esse Brinde ativar uma nova
 *     Poesia Ghurua, as cabaças ficam a cena de combate toda.
 *   Véu das Brumas (N/P) · Pessoal (20 m de raio) · 1 rodada: inimigos não podem realizar a 1ª
 *     Prioridade de cada turno; aliados têm Facilidade nos ataques enquanto estiverem na área.
 *
 * Como funciona aqui: a Poesia ativa é uma Condição no Místico ("Poesia Ghurua: …", 1 rodada). Uma
 * Região de 20 m presa ao token mostra a área. Quem está dentro recebe a Condição de presença do seu
 * lado (inimigo/aliado), que sai ao deixar a área ou quando a Poesia acaba.
 */

export const NAUREN_POESIAS_GHURUA = Object.freeze({
  chuva: Object.freeze({ id: "chuva", nome: "Poesia da Chuva Infinita", curto: "Chuva Infinita", cor: "#4f8fd6", icone: "fa-cloud-showers-heavy",
    fonteSeed: "condicao-poesia-ghurua-chuva", inimigoSeed: "condicao-sob-chuva-infinita-inimigo", aliadoSeed: "condicao-sob-chuva-infinita-aliado",
    resumo: "Inimigos: +1 Estamina para atacar e 1 dado de dano a menos. Aliados: 1d6 de Vida no início de cada turno." }),
  aroma: Object.freeze({ id: "aroma", nome: "Poesia do Aroma de Licor", curto: "Aroma de Licor", cor: "#c98a3a", icone: "fa-wine-bottle",
    fonteSeed: "condicao-poesia-ghurua-aroma", inimigoSeed: "", aliadoSeed: "",
    resumo: "1d6 cabaças a até 4 m. Você: +1 Energia no início de cada turno e Vida igual à Energia que gastar." }),
  veu: Object.freeze({ id: "veu", nome: "Poesia do Véu das Brumas", curto: "Véu das Brumas", cor: "#8a7fc4", icone: "fa-smog",
    fonteSeed: "condicao-poesia-ghurua-veu", inimigoSeed: "condicao-sob-veu-das-brumas-inimigo", aliadoSeed: "condicao-sob-veu-das-brumas-aliado",
    resumo: "Inimigos: sem a 1ª Prioridade de cada turno. Aliados: Facilidade nos ataques." })
});
export const NAUREN_POESIA_RAIO = 20;
export const NAUREN_CABACA_RAIO = 4;
const CHAVE_REGIAO = "poesiaGhurua";
const CHAVE_CABACA = "cabacaGhurua";

/** Tira N dados do 1º termo de dado da fórmula ("3d6+2" −1 → "2d6+2"; "1d6+2" −1 → "0+2"). Pura, testada. */
export function naurenTirarDadosDaFormula(formula, n) {
  let resto = Math.max(0, Math.floor(Number(n) || 0)), tirados = 0;
  const saida = String(formula ?? "").replace(/(\d*)d(\d+)/gi, (m, q, f) => {
    if (!resto) return m;
    const qtd = q === "" ? 1 : Number(q);
    const tira = Math.min(resto, qtd);
    resto -= tira; tirados += tira;
    return qtd - tira > 0 ? `${qtd - tira}d${f}` : "0";
  });
  return { formula: saida, tirados };
}

/** Qual Condição de presença cada token recebe (pura, testada): "inimigo" | "aliado" | null. */
export function naurenLadoNaPoesia({ dispFonte, dispAlvo, ehFonte = false, distancia, raio = NAUREN_POESIA_RAIO }) {
  if (ehFonte) return null; // o texto fala em "aliados" e "inimigos": o próprio Místico fica de fora (o que é dele vem na Condição-fonte)
  if (!(distancia <= raio)) return null;
  if (dispAlvo === 0 || dispFonte === 0) return null; // neutros ficam de fora
  return dispAlvo === dispFonte ? "aliado" : "inimigo";
}

/* ------------------------------------------------------------------ Foundry ------ */

async function uuidPorSeed(seed) {
  if (!seed) return null;
  const { naurenUuidPorSeed } = await import("./entidades-campo.mjs");
  const pack = game.packs.find(pk => pk.metadata.label === "Nauren - Condições e Venenos");
  return pack ? naurenUuidPorSeed(pack, seed) : null;
}

/** Poesia ativa de um ator (Condição-fonte), ou null. */
export function naurenPoesiaAtiva(actor) {
  const c = actor?.items?.find(i => i.type === "condicao" && i.system.ativo !== false && i.getFlag("nauren", "poesiaGhurua"));
  return c ? { cond: c, id: c.getFlag("nauren", "poesiaGhurua") } : null;
}

function regiaoChave(tokenDoc) { return `poesia:${tokenDoc.id}`; }

/** Liga/desliga as Condições de presença de todos os tokens da cena em relação à Poesia deste token. */
export async function naurenSincronizarPoesia(tokenDoc, poesiaId = undefined) {
  if (!tokenDoc?.parent || !canvas?.ready || tokenDoc.parent !== canvas.scene) return;
  const ator = tokenDoc.actor;
  const ativa = poesiaId === undefined ? naurenPoesiaAtiva(ator)?.id ?? null : poesiaId;
  const cfg = ativa ? NAUREN_POESIAS_GHURUA[ativa] : null;
  const { naurenMedirDistanciaBordas } = await import("../nauren.mjs");
  const { naurenAtualizarCondicaoPresenca } = await import("./icone-condicao-token.mjs");
  const chave = regiaoChave(tokenDoc);
  const todas = Object.values(NAUREN_POESIAS_GHURUA);
  const uuids = {};
  for (const p of todas) uuids[p.id] = { inimigo: await uuidPorSeed(p.inimigoSeed), aliado: await uuidPorSeed(p.aliadoSeed) };
  const fonteTok = tokenDoc.object;
  for (const t of canvas.tokens.placeables) {
    if (!t.actor) continue;
    let lado = null;
    if (cfg && fonteTok) {
      const ehFonte = t === fonteTok;
      let dist = Infinity; try { dist = ehFonte ? 0 : naurenMedirDistanciaBordas(fonteTok, t); } catch (err) { dist = Infinity; }
      lado = (t.actor.system?.vida?.value ?? 1) > 0 ? naurenLadoNaPoesia({ dispFonte: tokenDoc.disposition, dispAlvo: t.document.disposition, ehFonte, distancia: dist }) : null;
    }
    for (const p of todas) for (const l of ["inimigo", "aliado"]) {
      const u = uuids[p.id][l]; if (!u) continue;
      const dentro = !!cfg && p.id === cfg.id && lado === l;
      const tem = t.actor.items.some(i => i.type === "condicao" && i.getFlag("nauren", "condicaoDePresenca") && (i.getFlag("nauren", "cadeiaRaizUuid") === u) && (i.getFlag("nauren", "regioesPresenca") ?? []).includes(chave));
      if (dentro !== tem) await naurenAtualizarCondicaoPresenca(t.actor, chave, u, dentro).catch(err => console.warn("Nauren RPG | Poesia Ghurua (presença)", err));
    }
  }
}

async function criarRegiaoPoesia(tokenDoc, cfg) {
  const cena = tokenDoc.parent; if (!cena) return;
  const dados = { name: cfg.nome, color: cfg.cor, visibility: CONST.REGION_VISIBILITY?.ALWAYS ?? 2, highlightMode: "coverage", displayMeasurements: true,
    flags: { nauren: { [CHAVE_REGIAO]: { tokenId: tokenDoc.id, poesia: cfg.id } } } };
  const nativa = foundry.documents?.RegionDocument?.createTokenEmanation;
  try {
    if (typeof nativa === "function") { const r = await nativa.call(foundry.documents.RegionDocument, tokenDoc, NAUREN_POESIA_RAIO, dados); if (r) return r; }
  } catch (err) { console.warn("Nauren RPG | Poesia Ghurua: emanação nativa recusada; usando círculo solto.", err); }
  const tok = tokenDoc.object; if (!tok) return;
  const px = NAUREN_POESIA_RAIO / (cena.grid.distance || 1) * cena.grid.size + Math.max(tok.w, tok.h) / 2;
  const [r] = await cena.createEmbeddedDocuments("Region", [{ ...dados, shapes: [{ type: "circle", x: tok.center.x, y: tok.center.y, radius: px }] }]);
  return r;
}

async function apagarRegioesPoesia(tokenDoc) {
  const cena = tokenDoc?.parent; if (!cena) return;
  const ids = cena.regions.filter(r => r.getFlag("nauren", CHAVE_REGIAO)?.tokenId === tokenDoc.id).map(r => r.id);
  if (ids.length) await cena.deleteEmbeddedDocuments("Region", ids).catch(() => null);
}

/** Cabaças do Aroma de Licor: Regiões de 1 casa, em casas livres a até 4 m (sorteadas). */
async function criarCabacas(tokenDoc, quantidade) {
  const cena = tokenDoc.parent, tok = tokenDoc.object; if (!cena || !tok) return 0;
  const g = cena.grid.size, passos = Math.max(1, Math.floor(NAUREN_CABACA_RAIO / (cena.grid.distance || 1)));
  const ocupadas = new Set(canvas.tokens.placeables.map(t => `${Math.floor(t.center.x / g)},${Math.floor(t.center.y / g)}`));
  const cx = Math.floor(tok.center.x / g), cy = Math.floor(tok.center.y / g);
  const livres = [];
  for (let dx = -passos; dx <= passos; dx++) for (let dy = -passos; dy <= passos; dy++) {
    const k = `${cx + dx},${cy + dy}`;
    if ((dx || dy) && !ocupadas.has(k) && cx + dx >= 0 && cy + dy >= 0) livres.push([cx + dx, cy + dy]);
  }
  for (let i = livres.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [livres[i], livres[j]] = [livres[j], livres[i]]; }
  const escolhidas = livres.slice(0, quantidade);
  if (!escolhidas.length) return 0;
  await cena.createEmbeddedDocuments("Region", escolhidas.map(([x, y], k) => ({
    name: `Cabaça ${k + 1} (Aroma de Licor)`, color: "#c98a3a", visibility: CONST.REGION_VISIBILITY?.ALWAYS ?? 2, highlightMode: "coverage",
    shapes: [{ type: "rectangle", x: x * g + g * 0.15, y: y * g + g * 0.15, width: g * 0.7, height: g * 0.7 }],
    flags: { nauren: { [CHAVE_CABACA]: { donoUuid: tokenDoc.actor.uuid, tokenId: tokenDoc.id, fica: false } } }
  })));
  return escolhidas.length;
}

function cabacasDe(actor) {
  return (canvas.scene?.regions ?? []).filter(r => r.getFlag("nauren", CHAVE_CABACA)?.donoUuid === actor.uuid);
}

/** Ativa uma Poesia Ghurua no Místico (encerra a anterior). Devolve linhas para o card. */
export async function naurenAtivarPoesiaGhurua(actor, poesiaId, { daCabaca = false } = {}) {
  const cfg = NAUREN_POESIAS_GHURUA[poesiaId]; if (!cfg || !actor) return [];
  const tokenDoc = actor.getActiveTokens?.(true)?.[0]?.document;
  const linhas = [];
  const anterior = naurenPoesiaAtiva(actor);
  // Cabaças: se a Poesia nova veio do Brinde de uma cabaça, as cabaças ficam a cena toda.
  if (daCabaca) for (const r of cabacasDe(actor)) await r.setFlag("nauren", CHAVE_CABACA, { ...r.getFlag("nauren", CHAVE_CABACA), fica: true }).catch(() => null);
  if (anterior) {
    trocando.add(actor.uuid);
    try { await anterior.cond.delete().catch(() => null); } finally { trocando.delete(actor.uuid); }
    if (anterior.id === "aroma" && tokenDoc) {
      const ids = cabacasDe(actor).filter(r => !r.getFlag("nauren", CHAVE_CABACA)?.fica).map(r => r.id);
      if (ids.length) await tokenDoc.parent.deleteEmbeddedDocuments("Region", ids).catch(() => null);
    }
    linhas.push({ label: "Encerrou", value: NAUREN_POESIAS_GHURUA[anterior.id]?.curto ?? anterior.cond.name, breakdown: "as Poesias Ghurua não ocorrem ao mesmo tempo" });
  }
  const { NaurenAlvoHelper } = await import("./ficha-ator.mjs");
  const uuidFonte = await uuidPorSeed(cfg.fonteSeed);
  const nome = uuidFonte ? await NaurenAlvoHelper.aplicarCondicao(actor, uuidFonte, 1).catch(() => null) : null;
  if (!nome) { linhas.push({ label: cfg.curto, value: "não foi aplicada", breakdown: "Condição não encontrada no compêndio" }); return linhas; }
  linhas.push({ label: "Poesia Ghurua", value: cfg.curto, breakdown: `${NAUREN_POESIA_RAIO} m em volta de você · ${cfg.resumo}` });
  if (tokenDoc) {
    await apagarRegioesPoesia(tokenDoc);
    await criarRegiaoPoesia(tokenDoc, cfg).catch(err => console.warn("Nauren RPG | Poesia Ghurua (área)", err));
    await naurenSincronizarPoesia(tokenDoc, cfg.id);
    if (cfg.id === "aroma") {
      const roll = await new Roll("1d6").evaluate();
      if (game.dice3d) await game.dice3d.showForRoll(roll, game.user, true).catch(() => {});
      const n = await criarCabacas(tokenDoc, roll.total);
      linhas.push({ label: "Cabaças", value: `${n}`, breakdown: `1d6 (${roll.total})${n < roll.total ? `, só ${n} casa(s) livre(s) a até ${NAUREN_CABACA_RAIO} m` : ""} · beber: 1 PdE (P/A) e ativa o Brinde ao Destino` });
    }
  }
  return linhas;
}

/** Janela da Dança do Espírito Bêbado: escolhe 1 das 3 Poesias Ghurua. */
export async function naurenEscolherPoesiaGhurua(actor) {
  const NK = await import("./janelas-kit.mjs");
  const atual = naurenPoesiaAtiva(actor)?.id;
  const esc = s => foundry.utils.escapeHTML(String(s ?? ""));
  let escolha = null;
  await foundry.applications.api.DialogV2.wait({ ...NK.NAUREN_KIT_JANELA,
    window: { title: "Dança do Espírito Bêbado — Poesia Ghurua", icon: "fas fa-wine-glass" }, classes: ["nauren-janela-movimento", "nauren-kit"], position: { width: 440 },
    content: `<div class="nauren-mov nauren-poesias">
      <p class="nauren-mov-aviso" style="margin:0;">A Poesia toma conta de você: escolha uma Poesia Ghurua (área de ${NAUREN_POESIA_RAIO} m em volta de você).${atual ? ` A atual (<b>${esc(NAUREN_POESIAS_GHURUA[atual].curto)}</b>) se encerra.` : ""}</p>
      <div class="nauren-mov-opcoes">${Object.values(NAUREN_POESIAS_GHURUA).map(p => `<button type="button" class="nauren-mov-opcao nauren-poesia-op" data-poesia="${p.id}" style="--np:${p.cor}">
        <i class="fas ${p.icone}"></i><span class="nauren-mov-titulo">${esc(p.curto)}${p.id === atual ? " <em>(ativa)</em>" : ""}</span><span class="nauren-mov-custo">N/P</span><span class="nauren-mov-nota">${esc(p.resumo)}</span></button>`).join("")}</div>
    </div>`,
    buttons: [{ action: "nao", label: "Não usar" }], rejectClose: false,
    render: (ev, dialog) => dialog.element.querySelectorAll(".nauren-poesia-op").forEach(b => b.addEventListener("click", () => { escolha = b.dataset.poesia; dialog.close(); }))
  }).catch(() => null);
  return escolha;
}

/** Beber uma cabaça (Ação "Beber Cabaça"): precisa de uma cabaça sua a até 1 casa. Devolve a Região ou null. */
export async function naurenPegarCabacaProxima(actor) {
  const tok = actor.getActiveTokens?.(true)?.[0]; if (!tok) return null;
  const g = canvas.scene.grid.size;
  const perto = cabacasDe(actor).map(r => {
    const s = r.shapes?.[0] ?? {}; const cx = (s.x ?? 0) + (s.width ?? 0) / 2, cy = (s.y ?? 0) + (s.height ?? 0) / 2;
    return { r, d: Math.max(Math.abs(cx - tok.center.x), Math.abs(cy - tok.center.y)) / g };
  }).filter(o => o.d <= 1.6).sort((a, b) => a.d - b.d);
  return perto[0]?.r ?? null;
}

/* ------------------------------------------------------------------ ganchos ------ */

const energiaAntes = new Map();
const trocando = new Set(); // ator no meio de uma troca de Poesia: o gancho de deleteItem não limpa (a troca cuida)

export function __naurenIniciar_poesiaGhurua() {
  // A Condição-fonte acabou (1 rodada, ou trocou de Poesia): tira área, presença e cabaças (salvo as que ficam).
  Hooks.on("deleteItem", async (item, opcoes, userId) => {
    const pid = item.type === "condicao" ? item.getFlag?.("nauren", "poesiaGhurua") : null;
    if (!pid || userId !== game.user.id) return;
    const actor = item.parent;
    if (trocando.has(actor?.uuid)) return; const tokenDoc = actor?.getActiveTokens?.(true)?.[0]?.document;
    if (!tokenDoc) return;
    if (naurenPoesiaAtiva(actor)) return; // outra já entrou (troca): ela cuida da área
    await apagarRegioesPoesia(tokenDoc);
    await naurenSincronizarPoesia(tokenDoc, null);
    if (pid === "aroma") {
      const ids = cabacasDe(actor).filter(r => !r.getFlag("nauren", CHAVE_CABACA)?.fica).map(r => r.id);
      if (ids.length) await tokenDoc.parent.deleteEmbeddedDocuments("Region", ids).catch(() => null);
    }
  });
  // Alguém andou: quem entrou ou saiu dos 20 m ganha ou perde a Condição (só o Mestre ativo processa).
  Hooks.on("updateToken", (tokenDoc, changes) => {
    if ((changes.x === undefined && changes.y === undefined) || game.users.activeGM !== game.user || !canvas?.ready) return;
    const fontes = canvas.tokens.placeables.filter(t => naurenPoesiaAtiva(t.actor));
    if (!fontes.length) return;
    setTimeout(() => { for (const t of fontes) naurenSincronizarPoesia(t.document).catch(() => null); }, 250);
  });
  // Fim do combate: cabaças que ficavam "a cena toda" somem.
  Hooks.on("deleteCombat", () => {
    if (game.users.activeGM !== game.user || !canvas?.scene) return;
    const ids = canvas.scene.regions.filter(r => r.getFlag("nauren", CHAVE_CABACA)).map(r => r.id);
    if (ids.length) canvas.scene.deleteEmbeddedDocuments("Region", ids).catch(() => null);
  });
  // Aroma de Licor: ao gastar Energia, recupera Vida igual (quem fez a mudança aplica, uma vez).
  Hooks.on("preUpdateActor", (actor, mudancas) => {
    if (!foundry.utils.hasProperty(mudancas, "system.recursosCustom")) return;
    if (naurenPoesiaAtiva(actor)?.id !== "aroma") return;
    energiaAntes.set(actor.uuid, (actor.system.recursosCustom ?? []).find(r => r.id === "energia")?.valor ?? 0);
  });
  Hooks.on("updateActor", async (actor, mudancas, opcoes, userId) => {
    if (!energiaAntes.has(actor.uuid)) return;
    const antes = energiaAntes.get(actor.uuid); energiaAntes.delete(actor.uuid);
    if (userId !== game.user.id || opcoes?.naurenAromaCura) return;
    const depois = (actor.system.recursosCustom ?? []).find(r => r.id === "energia")?.valor ?? 0;
    const gasto = antes - depois;
    if (gasto <= 0) return;
    const vida = actor.system.vida?.value ?? 0, max = actor.system.vida?.max ?? vida;
    const cura = Math.max(0, Math.min(gasto, max - vida));
    const { naurenPostarCard } = await import("../nauren.mjs");
    if (cura) await actor.update({ "system.vida.value": vida + cura }, { naurenAromaCura: true });
    naurenPostarCard({ ator: actor, titulo: "Aroma de Licor", icone: "icons/consumables/drinks/tea-jug-gourd-brown.webp", fonte: "Poesia Ghurua",
      linhas: [{ label: "Gastou Energia", value: `${gasto}`, breakdown: cura ? `recuperou ${cura} de Vida` : "Vida já cheia" }] }).catch(() => {});
  });
}
