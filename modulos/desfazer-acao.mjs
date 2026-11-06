/* Nauren RPG — Desfazer uma Ação. Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { NAUREN_KIT_JANELA } from "./janelas-kit.mjs";
import { naurenDeslocarToken } from "./entidades-campo.mjs";
import { naurenPostarCard } from "../nauren.mjs";


/* ============================================================
 * 0.94.22 — Desfazer uma Ação (botão do Mestre no card)
 * Antes da Ação: foto leve da cena (recursos e Condições de todo token,
 * posições, tokens e Regions existentes; itens de quem usou). Depois da
 * Ação: guarda no card só o que MUDOU (flags.nauren.desfazer). O botão
 * "Desfazer" (só o Mestre vê) devolve tudo ao que era antes.
 * Não volta: contadores de turno, registro de Prioridade e mensagens.
 * ============================================================ */
const NAUREN_DESFAZER_CAMPOS = ["vida.value", "mana.value", "estaminaCombate.value", "stress.value", "escudo.value", "escudo.max", "dadosDestino.value"];

function naurenFotoAtorDesfazer(a, comItens) {
  const s = a.system ?? {};
  const rec = {};
  for (const c of NAUREN_DESFAZER_CAMPOS) rec[c] = foundry.utils.getProperty(s, c) ?? null;
  const itens = {};
  for (const i of a.items) if (comItens || i.type === "condicao") itens[i.id] = i.toObject();
  return { nome: a.name, rec, recursosCustom: foundry.utils.deepClone(s.recursosCustom ?? []), itens, comItens: !!comItens };
}

function naurenFotoCenaDesfazer(atorQueUsa) {
  const cena = canvas?.scene;
  if (!cena) return null;
  const foto = { cena: cena.id, quando: Date.now(), atores: {}, tokens: {}, tokensIds: cena.tokens.map(t => t.id), regioesIds: (cena.regions?.contents ?? [...(cena.regions ?? [])]).map(r => r.id) };
  for (const td of cena.tokens) {
    foto.tokens[td.uuid] = { x: td.x, y: td.y };
    const a = td.actor;
    if (a && !foto.atores[a.uuid]) foto.atores[a.uuid] = naurenFotoAtorDesfazer(a, a === atorQueUsa || a.uuid === atorQueUsa?.uuid);
  }
  if (atorQueUsa && !foto.atores[atorQueUsa.uuid]) foto.atores[atorQueUsa.uuid] = naurenFotoAtorDesfazer(atorQueUsa, true);
  return foto;
}

/** O que mudou desde a foto (só isso vai para o card). */
async function naurenDiferencaDesfazer(foto) {
  if (!foto) return null;
  const cena = game.scenes.get(foto.cena);
  // Listas (e não objetos por uuid): uuids têm ponto e virariam objetos aninhados ao gravar no card.
  const dif = { v: 1, cena: foto.cena, atores: [], tokens: [], tokensCriados: [], regioesCriadas: [] };
  const igual = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  const limparItem = o => { const c = foundry.utils.deepClone(o); delete c._stats; return c; };
  for (const [uuid, antes] of Object.entries(foto.atores)) {
    let a = null; try { a = await fromUuid(uuid); } catch (err) { a = null; }
    if (!a) continue;
    const agora = naurenFotoAtorDesfazer(a, antes.comItens);
    // "rec" é uma lista (campo, valor): chaves com ponto virariam objetos ao gravar no card.
    const m = { nome: antes.nome, rec: [], recursosCustom: null, criados: [], removidos: [], alterados: [] };
    for (const c of NAUREN_DESFAZER_CAMPOS) if (antes.rec[c] !== null && antes.rec[c] !== agora.rec[c]) m.rec.push({ campo: c, valor: antes.rec[c] });
    if (!igual(antes.recursosCustom, agora.recursosCustom)) m.recursosCustom = antes.recursosCustom;
    for (const [id, o] of Object.entries(agora.itens)) if (!antes.itens[id]) m.criados.push({ id, nome: o.name });
    for (const [id, o] of Object.entries(antes.itens)) {
      if (!agora.itens[id]) m.removidos.push(limparItem(o));
      else if (!igual(o.system, agora.itens[id].system) || o.name !== agora.itens[id].name) m.alterados.push({ _id: id, name: o.name, system: foundry.utils.deepClone(o.system) });
    }
    if (m.rec.length || m.recursosCustom || m.criados.length || m.removidos.length || m.alterados.length) dif.atores.push({ uuid, ...m });
  }
  if (cena) {
    for (const td of cena.tokens) {
      const p = foto.tokens[td.uuid];
      if (!p) dif.tokensCriados.push({ id: td.id, nome: td.name });
      else if (p.x !== td.x || p.y !== td.y) dif.tokens.push({ uuid: td.uuid, ...p, nome: td.name });
    }
    for (const r of (cena.regions?.contents ?? [...(cena.regions ?? [])])) if (!foto.regioesIds.includes(r.id)) dif.regioesCriadas.push({ id: r.id, nome: r.name });
  }
  const vazio = !dif.atores.length && !dif.tokens.length && !dif.tokensCriados.length && !dif.regioesCriadas.length;
  return vazio ? null : dif;
}

/** Linhas legíveis do que o Desfazer vai devolver. */
function naurenResumoDesfazer(dif) {
  const rot = { "vida.value": "Vida", "mana.value": "Mana", "estaminaCombate.value": "Estamina", "stress.value": "Estresse", "escudo.value": "Escudo", "escudo.max": "Escudo máx.", "dadosDestino.value": "Dados de Destino" };
  const linhas = [];
  for (const m of dif?.atores ?? []) {
    const p = [];
    for (const { campo, valor } of m.rec ?? []) p.push(`${rot[campo] ?? campo} volta a ${valor}`);
    if (m.recursosCustom) p.push("recursos próprios voltam");
    if (m.criados.length) p.push(`sai ${m.criados.map(c => c.nome).join(", ")}`);
    if (m.removidos.length) p.push(`volta ${m.removidos.map(c => c.name).join(", ")}`);
    if (m.alterados.length) p.push(`${m.alterados.map(c => c.name).join(", ")} como antes`);
    if (p.length) linhas.push({ label: m.nome, value: p.join(" · ") });
  }
  for (const t of dif?.tokens ?? []) linhas.push({ label: t.nome, value: "volta para onde estava" });
  if (dif?.tokensCriados?.length) linhas.push({ label: "Tokens criados", value: `saem: ${dif.tokensCriados.map(t => t.nome).join(", ")}` });
  if (dif?.regioesCriadas?.length) linhas.push({ label: "Áreas criadas", value: `saem: ${dif.regioesCriadas.map(r => r.nome).join(", ")}` });
  return linhas;
}

/** Botão do Mestre: devolve tudo ao que era antes da Ação. */
async function naurenDesfazerAcao(message, { confirmar = true } = {}) {
  if (!game.user.isGM) return false;
  const dif = message?.getFlag("nauren", "desfazer");
  if (!dif || dif.desfeito) return false;
  const linhas = naurenResumoDesfazer(dif);
  if (confirmar) {
    const ok = await foundry.applications.api.DialogV2.confirm({ ...NAUREN_KIT_JANELA, window: { title: "Desfazer esta Ação?" }, classes: ["nauren-dialogo", "nauren-kit"],
      content: `<p>Volta tudo ao que era antes da Ação:</p><ul>${linhas.map(l => `<li><b>${foundry.utils.escapeHTML(l.label)}</b>: ${foundry.utils.escapeHTML(l.value)}</li>`).join("")}</ul><p class="item-meta-hint">Contadores de turno, Prioridades já registradas e mensagens não voltam.</p>`,
      yes: { label: "Desfazer" }, no: { label: "Cancelar" }, rejectClose: false }).catch(() => false);
    if (!ok) return false;
  }
  const falhas = [];
  for (const m of dif.atores ?? []) {
    let a = null; try { a = await fromUuid(m.uuid); } catch (err) { a = null; }
    if (!a) { falhas.push(`${m.nome}: ficha não encontrada`); continue; }
    try {
      const upd = Object.fromEntries((m.rec ?? []).map(({ campo, valor }) => [`system.${campo}`, valor]));
      if (m.recursosCustom) upd["system.recursosCustom"] = m.recursosCustom;
      if (Object.keys(upd).length) await a.update(upd, { naurenDesfazer: true });
      const apagar = m.criados.map(c => c.id).filter(id => a.items.get(id));
      if (apagar.length) await a.deleteEmbeddedDocuments("Item", apagar, { naurenDesfazer: true });
      const voltar = m.removidos.filter(o => !a.items.get(o._id));
      if (voltar.length) await a.createEmbeddedDocuments("Item", voltar, { keepId: true, naurenDesfazer: true, naurenSemLimite: true });
      const mudar = m.alterados.filter(o => a.items.get(o._id)).map(o => ({ _id: o._id, name: o.name, system: o.system }));
      if (mudar.length) await a.updateEmbeddedDocuments("Item", mudar, { naurenDesfazer: true, naurenSemLimite: true, diff: false, recursive: false });
    } catch (err) { console.warn("Nauren RPG | Desfazer", m.nome, err); falhas.push(`${m.nome}: ${err.message}`); }
  }
  const cena = game.scenes.get(dif.cena);
  for (const p of dif.tokens ?? []) {
    try { const td = await fromUuid(p.uuid); if (td) await naurenDeslocarToken(td, p.x, p.y, { teleporte: true }); }
    catch (err) { falhas.push(`${p.nome}: ${err.message}`); }
  }
  if (cena) {
    const tk = (dif.tokensCriados ?? []).map(t => t.id).filter(id => cena.tokens.get(id));
    if (tk.length) await cena.deleteEmbeddedDocuments("Token", tk).catch(err => falhas.push(`tokens: ${err.message}`));
    const rg = (dif.regioesCriadas ?? []).map(r => r.id).filter(id => cena.regions.get(id));
    if (rg.length) await cena.deleteEmbeddedDocuments("Region", rg).catch(err => falhas.push(`áreas: ${err.message}`));
  }
  await message.update({ "flags.nauren.desfazer.desfeito": { quando: Date.now(), por: game.user.name } });
  await naurenPostarCard({ titulo: "Ação desfeita", icone: "icons/magic/time/arrows-circling-green.webp", fonte: `pelo Mestre (${game.user.name})`,
    linhas: [...linhas, ...falhas.map(f => ({ label: "Não deu", value: f }))] });
  return true;
}

/** Código que rodava solto neste trecho do nauren.mjs: chamado no mesmo ponto de antes. */
export function __naurenIniciar_desfazer_acao() {

Hooks.on("renderChatMessageHTML", (message, html) => {
  try {
    const dif = message.getFlag?.("nauren", "desfazer");
    if (!dif || !html?.querySelector) return;
    const card = html.querySelector(".nauren-roll-card") ?? html;
    if (dif.desfeito) { card.classList?.add("nauren-desfeito"); const aviso = document.createElement("div"); aviso.className = "nauren-desfeito-aviso"; aviso.textContent = `↶ Desfeita por ${dif.desfeito.por}`; card.prepend(aviso); return; }
    if (!game.user.isGM) return;
    const btn = document.createElement("a");
    btn.className = "nauren-btn-desfazer"; btn.dataset.tooltip = "Desfazer esta Ação (só o Mestre vê)";
    btn.innerHTML = `<i class="fas fa-rotate-left"></i> Desfazer`;
    btn.addEventListener("click", ev => { ev.preventDefault(); ev.stopPropagation(); naurenDesfazerAcao(message).catch(err => console.warn("Nauren RPG | Desfazer", err)); });
    const linha = document.createElement("div"); linha.className = "nauren-desfazer-linha"; linha.append(btn);
    card.append(linha);
  } catch (err) { console.warn("Nauren RPG | botão Desfazer", err); }
});
}

export { NAUREN_DESFAZER_CAMPOS, naurenDesfazerAcao, naurenDiferencaDesfazer, naurenFotoAtorDesfazer, naurenFotoCenaDesfazer, naurenResumoDesfazer };
